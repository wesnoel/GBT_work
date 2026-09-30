/* Mini Card Panel — render-plan schema.
   This is the contract every other file in this POC reads from: the rules
   engine writes plans that conform to it, the novel-scenario stub is meant
   to eventually do the same, and the renderer + validator both check
   against it. Formalized from design-decisions.md sections 1-2 and 5-7. */

const BADGE_TYPES = {
  "recommended": {
    label: "Recommended",
    icon: null
  },
  "egencia-preferred": {
    label: "Egencia preferred",
    icon: '<path d="M5 3v18"/><path d="M5 4h11l-2 4 2 4H5"/>'
  },
  "company-preferred": {
    label: "Company Preferred",
    icon: '<rect x="6" y="7" width="12" height="13" rx="1.5"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"/>'
  },
  "negotiated": {
    label: "Negotiated",
    icon: '<path d="M20.59 13.41 12 21.99 2 12 3 3h9z"/><circle cx="15.5" cy="7.5" r="1"/>'
  }
};

const MINI_CARD_SCHEMA = {
  version: "1.0.0",
  source: "Formalized from design-decisions.md #1-2 and #5-7 (this folder).",

  cardSlots: {
    // Required floor (design-decisions.md #5). No render plan field can turn
    // these off — the renderer pulls them straight from hotel data every
    // time, regardless of what a plan says. Listed here purely so the
    // schema documents the full card contract in one place.
    required: ["thumbnail", "name", "starRating", "distance", "reviewsScore", "price"],

    // Optional — a render plan may enable/disable each of these per card.
    // A plan can only turn one "on" if the underlying hotel data actually
    // has it; validateRenderPlan() strips anything a plan asks for that the
    // data can't back up.
    optional: {
      badges: {
        allowedValues: Object.keys(BADGE_TYPES),
        condition: "Only if the hotel qualifies for the badge program at all. A plan may still hide a qualifying badge (e.g. to declutter under time pressure)."
      },
      sustainabilityCert: {
        condition: "Only if the hotel holds a certification in the source data."
      },
      coworkerPct: {
        condition: "Only if booking-frequency data exists for the hotel. More useful in exploratory contexts than under time pressure."
      },
      perkStrip: {
        condition: "Only if the hotel has at least one qualifying perk/offer."
      },
      colleagueReviews: {
        condition: "Only if colleague review data exists for the hotel. Rides inside the required Reviews box as its second line."
      },
      paymentCvvNote: {
        condition: "Only if the rate requires online payment / CVV capture."
      }
    }
  },

  panel: {
    columns: {
      allowedValues: [1, 2, 3],
      description: "1 = full-width carousel, 2-3 = independent vertical peek columns (design-decisions.md #1)."
    },
    peekMode: {
      allowedValues: ["permanent"],
      description: "Locked per design-decisions.md #3 — interactive expand-on-click was explored and dropped."
    }
  }
};

function getHotelById(datasets, datasetId, hotelId) {
  const list = datasets[datasetId];
  return list ? list.find((h) => h.id === hotelId) : undefined;
}

/* Validates a render plan against the schema AND against what the referenced
   hotel data can actually support. Never throws — always returns a sanitized
   plan that's safe to render, plus the list of anything it had to correct,
   so the audit log can show its work. */
function validateRenderPlan(plan, datasets) {
  const errors = [];
  const sanitized = JSON.parse(JSON.stringify(plan));

  if (!MINI_CARD_SCHEMA.panel.columns.allowedValues.includes(sanitized.panel.columns)) {
    errors.push(`panel.columns "${sanitized.panel.columns}" is not one of ${MINI_CARD_SCHEMA.panel.columns.allowedValues.join("/")} — forced to 2.`);
    sanitized.panel.columns = 2;
  }

  if (sanitized.columns.length !== sanitized.panel.columns) {
    errors.push(`Plan declared ${sanitized.panel.columns} column(s) but supplied ${sanitized.columns.length} — truncated to match.`);
    sanitized.columns = sanitized.columns.slice(0, sanitized.panel.columns);
  }

  sanitized.columns.forEach((col) => {
    if (!datasets[col.datasetId]) {
      errors.push(`Column references unknown dataset "${col.datasetId}" — dropped its cards.`);
      col.cards = [];
      return;
    }
    col.cards = col.cards.filter((card) => {
      const hotel = getHotelById(datasets, col.datasetId, card.hotelId);
      if (!hotel) {
        errors.push(`Dropped card "${card.hotelId}" — not found in dataset "${col.datasetId}".`);
        return false;
      }
      const data = hotel.optionalData;
      Object.keys(card.slots).forEach((slotId) => {
        if (!(slotId in MINI_CARD_SCHEMA.cardSlots.optional)) {
          errors.push(`${hotel.name}: dropped unknown optional slot "${slotId}" — not in schema.`);
          delete card.slots[slotId];
          return;
        }
        if (slotId === "badges") {
          const requested = card.slots.badges || [];
          const available = data.badges || [];
          const allowed = requested.filter((b) => available.includes(b));
          if (allowed.length !== requested.length) {
            errors.push(`${hotel.name}: dropped badge(s) not backed by data — requested [${requested.join(", ")}], data has [${available.join(", ")}].`);
          }
          card.slots.badges = allowed;
        } else if (card.slots[slotId] && !data[slotId]) {
          errors.push(`${hotel.name}: dropped "${slotId}" — plan requested it but the hotel's data doesn't have it.`);
          card.slots[slotId] = false;
        }
      });
      return true;
    });
  });

  return { valid: errors.length === 0, errors, sanitizedPlan: sanitized };
}
