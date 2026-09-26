/* Hotel Quick Results — shared interactivity across every wireframe page */

/* ── SmartMix badge tooltip: hover already works via CSS; this adds
   keyboard/click support + Escape-to-dismiss + click-outside-to-close,
   per the UX spec's accessibility requirements. ─────────────────────── */
function initSmartMixTooltips(scope) {
  const root = scope || document;
  const badges = root.querySelectorAll(".badge-smartmix");
  badges.forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = b.classList.contains("tip-open");
      badges.forEach((o) => o.classList.remove("tip-open"));
      if (!wasOpen) b.classList.add("tip-open");
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") badges.forEach((b) => b.classList.remove("tip-open"));
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".badge-smartmix")) badges.forEach((b) => b.classList.remove("tip-open"));
  });
}

/* ── Deduplication source toggle: "Also on Booking.com · $195/night"
   swaps the displayed rate + source label; preferred/negotiated badge
   persists per the design decision log. ─────────────────────────────── */
function initSourceToggle(scope) {
  const root = scope || document;
  root.querySelectorAll(".card-also button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".card-hotel");
      const priceEl = card.querySelector(".card-price");
      const srcEl = card.querySelector(".card-source");
      const altPrice = btn.dataset.altPrice;
      const altSrc = btn.dataset.altSrc;
      const curPrice = priceEl.textContent;
      const curSrc = srcEl.textContent;
      priceEl.textContent = altPrice;
      srcEl.textContent = altSrc;
      btn.dataset.altPrice = curPrice;
      btn.dataset.altSrc = curSrc;
      btn.textContent = "Also on " + curSrc + " · " + curPrice + "/night";
    });
  });
}

/* ── Hotel card click → simulate PDP navigation (no real PDP in this
   wireframe deck; shows an intent toast so the interaction reads as real). */
function initCardClickToPDP(scope) {
  const root = scope || document;
  root.querySelectorAll(".card-hotel").forEach((card) => {
    card.setAttribute("tabindex", card.getAttribute("tabindex") || "0");
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-also") || e.target.closest(".badge-smartmix")) return;
      const name = card.querySelector(".card-name");
      showToast((name ? name.textContent : "Hotel") + " → opening room details (PDP)…");
    });
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".card-also, .badge-smartmix")) {
        e.preventDefault();
        card.click();
      }
    });
  });
}

let _toastEl = null;
function showToast(msg) {
  if (!_toastEl) {
    _toastEl = document.createElement("div");
    _toastEl.style.position = "fixed";
    _toastEl.style.bottom = "24px";
    _toastEl.style.left = "50%";
    _toastEl.style.transform = "translateX(-50%)";
    _toastEl.style.background = "#14161a";
    _toastEl.style.color = "#fff";
    _toastEl.style.padding = "10px 18px";
    _toastEl.style.borderRadius = "8px";
    _toastEl.style.fontSize = "13px";
    _toastEl.style.fontWeight = "600";
    _toastEl.style.zIndex = "999";
    _toastEl.style.boxShadow = "0 10px 32px rgba(0,0,0,.25)";
    _toastEl.style.opacity = "0";
    _toastEl.style.transition = "opacity .15s";
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  _toastEl.style.opacity = "1";
  clearTimeout(_toastEl._t);
  _toastEl._t = setTimeout(() => { _toastEl.style.opacity = "0"; }, 1800);
}

/* ── ARIA live-region announcer + visible a11y log (for reviewers) ──── */
function announce(msg) {
  const live = document.getElementById("a11y-live");
  if (live) live.textContent = msg;
  const log = document.getElementById("a11yLogList");
  if (log) {
    const line = document.createElement("div");
    line.className = "a11y-log-line";
    line.textContent = msg;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }
}

/* ── Filter panel: checkbox/star filters drive [data-tags] matching on
   any .card-hotel with a data-tags attribute (space-separated tokens:
   e.g. "preferred pool gym 4star"). Cards not matching all active
   filters are hidden; skeleton cards are unaffected. ─────────────────── */
function initFilterPanel(panelEl, targetsSelector) {
  if (!panelEl) return;
  const state = { stars: new Set(), amenities: new Set() };

  function apply() {
    let matchCount = 0;
    document.querySelectorAll(targetsSelector).forEach((card) => {
      if (!card.classList.contains("is-loaded")) return; // don't filter skeletons
      const tags = (card.dataset.tags || "").split(" ");
      let visible = true;
      if (state.stars.size && ![...state.stars].some((s) => tags.includes(s))) visible = false;
      if (state.amenities.size && ![...state.amenities].every((a) => tags.includes(a))) visible = false;
      card.style.display = visible ? "" : "none";
      if (visible) matchCount++;
    });
    announce(matchCount + " results match current filters.");
  }

  panelEl.querySelectorAll(".filter-star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.star;
      btn.classList.toggle("on");
      btn.classList.contains("on") ? state.stars.add(v) : state.stars.delete(v);
      apply();
    });
  });
  panelEl.querySelectorAll(".filter-check input").forEach((cb) => {
    cb.addEventListener("change", () => {
      cb.checked ? state.amenities.add(cb.value) : state.amenities.delete(cb.value);
      apply();
    });
  });
  const reset = panelEl.querySelector(".filter-reset");
  if (reset) {
    reset.addEventListener("click", () => {
      state.stars.clear();
      state.amenities.clear();
      panelEl.querySelectorAll(".filter-star-btn.on").forEach((b) => b.classList.remove("on"));
      panelEl.querySelectorAll(".filter-check input:checked").forEach((c) => (c.checked = false));
      apply();
    });
  }
  // expose so a page can re-run apply() after new results stream in
  panelEl._reapply = apply;
}
