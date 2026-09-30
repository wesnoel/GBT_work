/* Deterministic rules engine — context object in, render plan out.
   This is the fast, always-on baseline: plain JS, no model call, runs on
   every slider tick. It combines multiple context signals into a score
   rather than switching on one field at a time, which is what makes the
   output feel like a small reasoning layer instead of one big switch
   statement — but it is still a fixed, hand-written policy. The
   novel-scenario stub (novel-scenario-stub.js) is where real reasoning over
   the schema is meant to take over, for contexts this engine has no rule
   for. */

const DEFAULT_CONTEXT = {
  tripPurpose: "business",   // "business" | "bleisure"
  urgencyDays: 6,             // days until check-in
  loyaltyTier: "silver",     // "none" | "silver" | "gold" | "platinum"
  budgetCapUsd: null,        // number | null (nightly cap)
  device: "desktop"          // "desktop" | "mobile"
};

// badges + paymentCvvNote are booking-decision-critical (policy/payment
// facts), so they show whenever the data has them — they aren't part of the
// declutter budget below.
const ALWAYS_IF_PRESENT_SLOTS = ["badges", "paymentCvvNote"];

function rankOptionalSlots(context) {
  if (context.urgencyDays <= 2) {
    // Fast-scan signals first; drop nice-to-haves under real time pressure.
    return ["perkStrip", "coworkerPct", "colleagueReviews", "sustainabilityCert"];
  }
  return context.tripPurpose === "bleisure"
    ? ["perkStrip", "sustainabilityCert", "colleagueReviews", "coworkerPct"]
    : ["coworkerPct", "colleagueReviews", "perkStrip", "sustainabilityCert"];
}

function richnessBudget(context) {
  if (context.device === "mobile") return 2;
  if (context.urgencyDays <= 2) return 2;
  if (context.tripPurpose === "bleisure") return 4;
  return 3;
}

function pickDatasetOrder(context) {
  const scored = [
    { id: "featured", score: 1 },
    { id: "egencia-preferred", score: 1 + (context.budgetCapUsd != null ? 2 : 0) },
    {
      id: "company-preferred",
      score: 1
        + (context.loyaltyTier === "gold" || context.loyaltyTier === "platinum" ? 3 : 0)
        + (context.urgencyDays <= 2 ? 2 : 0)
    }
  ];
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

function pickColumnCount(context) {
  if (context.device === "mobile") return 1;
  if (context.urgencyDays <= 1) return 1; // don't ask for a 3-way compare when check-in is today/tomorrow
  const loyal = context.loyaltyTier === "gold" || context.loyaltyTier === "platinum";
  if (context.tripPurpose === "bleisure" || (loyal && context.budgetCapUsd == null)) return 3;
  return 2;
}

function sortCards(hotels, context) {
  const list = hotels.slice();
  if (context.budgetCapUsd != null) {
    list.sort((a, b) => a.price - b.price);
  } else if (context.tripPurpose === "bleisure") {
    list.sort((a, b) => b.reviewsScoreValue - a.reviewsScoreValue);
  } else if (context.urgencyDays <= 2) {
    list.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
  return list;
}

function buildCardSlots(hotel, context, budget, ranking) {
  const data = hotel.optionalData;
  const slots = {};

  ALWAYS_IF_PRESENT_SLOTS.forEach((id) => {
    slots[id] = id === "badges" ? (data.badges ? data.badges.slice() : []) : !!data[id];
  });

  let used = 0;
  ranking.forEach((id) => {
    const available = !!data[id];
    slots[id] = available && used < budget;
    if (slots[id]) used += 1;
  });

  return slots;
}

function explainRulesEngineDecision(context, datasetOrder, columns, budget, ranking) {
  const bits = [];

  if (context.device === "mobile") bits.push("1 column, tighter peek — mobile width");
  else if (context.urgencyDays <= 1) bits.push("1 column — check-in is today/tomorrow, showing the single best-ranked list instead of a 3-way compare");
  else if (columns === 3) bits.push(context.tripPurpose === "bleisure" ? "3 columns — bleisure trip, room to explore" : "3 columns — loyal traveler with no budget cap, full compare");
  else bits.push(`${columns} columns — default middle ground`);

  bits.push(`dataset priority ${datasetOrder.join(" > ")}`);

  if (context.budgetCapUsd != null) bits.push("cards sorted by price ascending (budget cap set)");
  else if (context.tripPurpose === "bleisure") bits.push("cards sorted by review score descending (bleisure)");
  else if (context.urgencyDays <= 2) bits.push("cards sorted by distance ascending (time pressure)");
  else bits.push("cards kept in dataset relevance order");

  bits.push(`optional-slot budget ${budget}, ranked [${ranking.join(", ")}]`);
  return bits.join(" · ");
}

function runRulesEngine(context, datasets) {
  const datasetOrder = pickDatasetOrder(context);
  const columns = pickColumnCount(context);
  const chosenDatasets = datasetOrder.slice(0, columns);
  const peekHeight = context.device === "mobile" ? 240 : 320;
  const budget = richnessBudget(context);
  const ranking = rankOptionalSlots(context);

  const columnBlocks = chosenDatasets.map((datasetId) => {
    const hotels = sortCards(datasets[datasetId], context);
    return {
      datasetId,
      title: DATASET_TITLES[datasetId],
      cardOrder: hotels.map((h) => h.id),
      cards: hotels.map((h) => ({ hotelId: h.id, slots: buildCardSlots(h, context, budget, ranking) }))
    };
  });

  return {
    meta: {
      engine: "rules-engine",
      generatedAt: new Date().toISOString(),
      contextSnapshot: Object.assign({}, context),
      rationale: explainRulesEngineDecision(context, datasetOrder, columns, budget, ranking)
    },
    panel: { columns, peek: { mode: "permanent", height: peekHeight } },
    columns: columnBlocks
  };
}
