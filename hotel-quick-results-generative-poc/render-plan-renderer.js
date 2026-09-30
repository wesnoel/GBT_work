/* Render-plan-driven renderer.
   Structured plan data in, the existing real Mini Card / column markup out.
   Nothing here generates novel HTML or CSS — every class name and DOM shape
   below matches component-mini-card.html / panel-layout-mechanics.html
   exactly, and initCardClickToPDP / initOutOfPolicyFlags / initCarousel /
   initAutoHideScrollbars (all from app.js, all already scope-aware) get
   wired onto the freshly rendered container the same way they're wired on
   the static wireframes. */

const CERT_ICON = '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/>';
const PERK_ICON = '<path d="M4 4h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4V4z"/><path d="M4 12v4a4 4 0 004 4h8a4 4 0 004-4v-4"/>';
const FLAG_ICON = '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>';
const CVV_ICON = '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/>';
const ARROW_PREV_ICON = '<path d="M15 18l-6-6 6-6"/>';
const ARROW_NEXT_ICON = '<path d="M9 18l6-6-6-6"/>';

function iconSvg(pathsInner, extraClass) {
  return `<svg class="icon${extraClass ? " " + extraClass : ""}" viewBox="0 0 24 24">${pathsInner}</svg>`;
}

function thumbnailSvg() {
  return `<svg viewBox="0 0 77 77"><rect width="77" height="77" fill="#eef0f2"/><path d="M0 55 L20 32 L34 46 L52 22 L77 52 V77 H0 Z" fill="#d8dee2"/></svg>`;
}

function badgeHtml(badgeId) {
  const meta = BADGE_TYPES[badgeId];
  if (!meta) return "";
  const icon = meta.icon ? iconSvg(meta.icon) : "";
  return `<span class="badge badge-${badgeId}">${icon}${meta.label}</span>`;
}

function miniCardHtml(hotel, slots) {
  const badgesHtml = (slots.badges || []).map(badgeHtml).join("");
  const certHtml = slots.sustainabilityCert ? `<div class="mini-cert">${iconSvg(CERT_ICON)}Sustainability certified</div>` : "";
  const coworkerHtml = slots.coworkerPct ? `<div class="mini-coworker">${hotel.optionalData.coworkerPct}</div>` : "";
  const colleagueHtml = slots.colleagueReviews ? `<div class="mini-reviews-line">Colleague Reviews: ${hotel.optionalData.colleagueReviews}</div>` : "";
  const perkHtml = slots.perkStrip ? `<div class="mini-perk">${iconSvg(PERK_ICON)}${hotel.optionalData.perkStrip}</div>` : "";
  const flagHtml = hotel.outOfPolicy ? `<span class="mini-flag">${iconSvg(FLAG_ICON, "icon-filled")}</span>` : "";
  const cvvHtml = slots.paymentCvvNote ? `<br>Pay online<br><span class="cvv">${iconSvg(CVV_ICON)}CVV required</span>` : "";

  return `
    <div class="mini-card">
      <div class="mini-real">
        ${badgesHtml ? `<div class="mini-badges">${badgesHtml}</div>` : ""}
        <div class="mini-header">
          <div class="mini-thumb">${thumbnailSvg()}</div>
          <div class="mini-header-body">
            <div class="mini-name">${hotel.name}</div>
            <div class="mini-stars-distance"><span class="mini-stars">${"★".repeat(hotel.stars)}</span><span class="mini-distance">${hotel.distanceLabel}</span></div>
            ${certHtml}
          </div>
        </div>
        ${coworkerHtml}
        <div class="mini-reviews">
          <div class="mini-reviews-label">Reviews</div>
          <div class="mini-reviews-line">${hotel.reviewsScoreLabel}</div>
          ${colleagueHtml}
        </div>
        ${perkHtml}
        <div class="mini-price-block">
          <div class="mini-price-row">${flagHtml}<span class="mini-price">$${hotel.price}</span></div>
          <div class="mini-price-subs">${hotel.priceWithTaxesLabel}${cvvHtml}</div>
        </div>
      </div>
    </div>`;
}

function columnCardsHtml(col, datasets) {
  return col.cards
    .map((c) => miniCardHtml(getHotelById(datasets, col.datasetId, c.hotelId), c.slots))
    .join("");
}

function renderPanelFromPlan(plan, datasets, containerEl) {
  if (plan.panel.columns === 1) {
    const col = plan.columns[0];
    containerEl.innerHTML = `
      <div class="panel-cols" data-cols="1">
        <div class="layout-1col">
          <div class="panel-col-hdr"><span class="panel-col-title">${col.title}</span><span class="panel-col-count">${col.cards.length} results</span></div>
          <div class="carousel-wrap">
            <button class="carousel-arrow prev" aria-label="Previous">${iconSvg(ARROW_PREV_ICON)}</button>
            <div class="carousel-track">${columnCardsHtml(col, datasets)}</div>
            <button class="carousel-arrow next" aria-label="Next">${iconSvg(ARROW_NEXT_ICON)}</button>
          </div>
        </div>
      </div>`;
  } else {
    containerEl.innerHTML = `
      <div class="panel-cols" data-cols="${plan.panel.columns}">
        ${plan.columns.map((col) => `
          <div class="layout-multi-col" data-role="${col.datasetId}">
            <div class="panel-col-hdr"><span class="panel-col-title">${col.title}</span><span class="panel-col-count">${col.cards.length} results</span></div>
            <div class="col-wrap mode-permanent">
              <div class="col-scroll peek" style="max-height:${plan.panel.peek.height}px;">${columnCardsHtml(col, datasets)}</div>
              <div class="col-fade"></div>
            </div>
          </div>`).join("")}
      </div>`;
  }

  initCardClickToPDP(containerEl);
  initOutOfPolicyFlags(containerEl);
  initCarousel(containerEl);
  initAutoHideScrollbars(containerEl);
}
