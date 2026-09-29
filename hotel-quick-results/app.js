/* Hotel Mini Card Panel — shared interactivity */

let _toastEl = null;
function showToast(msg) {
  if (!_toastEl) {
    _toastEl = document.createElement("div");
    Object.assign(_toastEl.style, {
      position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
      background: "#14161a", color: "#fff", padding: "10px 18px", borderRadius: "8px",
      fontSize: "13px", fontWeight: "600", zIndex: "999", boxShadow: "0 10px 32px rgba(0,0,0,.25)",
      opacity: "0", transition: "opacity .15s"
    });
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  _toastEl.style.opacity = "1";
  clearTimeout(_toastEl._t);
  _toastEl._t = setTimeout(() => { _toastEl.style.opacity = "0"; }, 1800);
}

/* ── Mini/regular card click → simulated PDP navigation ─────────── */
function initCardClickToPDP(scope) {
  const root = scope || document;
  root.querySelectorAll(".mini-card:not(.is-skeleton), .hotel-card").forEach((card) => {
    if (card._pdpWired) return;
    card._pdpWired = true;
    card.setAttribute("tabindex", card.getAttribute("tabindex") || "0");
    card.addEventListener("click", (e) => {
      if (e.target.closest(".mini-flag, .price-flag, .col-fade-btn, .carousel-arrow")) return;
      const name = card.querySelector(".mini-name, .hotel-name");
      showToast((name ? name.textContent.trim() : "Hotel") + " → opening room details (PDP)…");
    });
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".mini-flag, .price-flag")) {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* ── Out-of-policy flag popover — per icons.md's confirmed pattern:
   hover/click/tap all show it; auto-close 3s after pointer actually
   leaves (not 3s after the click); blur on every close path so a
   focus-visible trigger doesn't keep the popover visually stuck open. */
function initOutOfPolicyFlags(scope) {
  const root = scope || document;
  root.querySelectorAll(".mini-flag, .price-flag").forEach((flag) => {
    if (flag._oopWired) return;
    flag._oopWired = true;
    flag.setAttribute("tabindex", "0");
    flag.setAttribute("role", "button");
    flag.setAttribute("aria-label", "This hotel is out of policy");

    const pop = document.createElement("span");
    pop.className = "oop-pop";
    pop.textContent = "This hotel is out of policy.";
    flag.style.position = "relative";
    flag.appendChild(pop);

    let closeTimer = null;
    const open = () => { pop.classList.add("open"); clearTimeout(closeTimer); };
    const scheduleClose = () => { closeTimer = setTimeout(close, 3000); };
    const close = () => { pop.classList.remove("open"); flag.blur(); };

    flag.addEventListener("mouseenter", open);
    flag.addEventListener("mouseleave", scheduleClose);
    // Click/tap always opens (idempotent) — a real pointer click fires
    // mouseenter first, so toggling closed here would immediately undo
    // the hover-open. Only the leave-timer above closes it.
    flag.addEventListener("click", (e) => {
      e.stopPropagation();
      open();
      scheduleClose();
    });
    flag.addEventListener("focus", open);
  });
}

/* ── Column peek/expand — vertical columns in the 2/3-col layout ── */
function initColumnPeek(scope) {
  const root = scope || document;
  root.querySelectorAll(".col-wrap").forEach((wrap) => {
    const scroller = wrap.querySelector(".col-scroll");
    const btn = wrap.querySelector(".col-fade-btn");
    if (!scroller || !btn || btn._wired) return;
    btn._wired = true;
    const peekHeight = 372;
    btn.addEventListener("click", () => {
      const expanded = scroller.style.maxHeight === "none" || (!scroller.classList.contains("peek"));
      if (expanded) {
        scroller.classList.add("peek");
        scroller.style.maxHeight = peekHeight + "px";
        btn.classList.remove("is-expanded");
        btn.querySelector(".fade-btn-label").textContent = "Show more";
        scroller.scrollTop = 0;
      } else {
        scroller.classList.remove("peek");
        scroller.style.maxHeight = "none";
        btn.classList.add("is-expanded");
        btn.querySelector(".fade-btn-label").textContent = "Show less";
      }
    });
  });
}

function setColumnPeekMode(mode) {
  // mode: "permanent" | "interactive"
  document.querySelectorAll(".col-wrap").forEach((wrap) => {
    const scroller = wrap.querySelector(".col-scroll");
    wrap.classList.toggle("mode-permanent", mode === "permanent");
    if (mode === "permanent") {
      scroller.classList.add("peek");
      scroller.style.maxHeight = "372px";
    }
  });
}

/* ── Horizontal carousel (1-column state) ─────────────────────────── */
function initCarousel(scope) {
  const root = scope || document;
  root.querySelectorAll(".carousel-wrap").forEach((wrap) => {
    if (wrap._wired) return;
    wrap._wired = true;
    const track = wrap.querySelector(".carousel-track");
    const prev = wrap.querySelector(".carousel-arrow.prev");
    const next = wrap.querySelector(".carousel-arrow.next");

    function cardStep() {
      const card = track.querySelector(".mini-card");
      return card ? card.getBoundingClientRect().width + 16 : 300;
    }
    function updateArrows() {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }
    prev.addEventListener("click", () => track.scrollBy({ left: -cardStep(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: cardStep(), behavior: "smooth" }));
    track.addEventListener("scroll", updateArrows);

    // drag/swipe
    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", (e) => {
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
      track.addEventListener(ev, () => { isDown = false; track.classList.remove("is-dragging"); })
    );

    // Re-check whenever the track's size changes — including the
    // display:none → visible transition when a demo toggle swaps this
    // carousel into view, which a scroll-only listener would miss
    // entirely (arrows would stay stuck on their stale initial state).
    new ResizeObserver(updateArrows).observe(track);
    updateArrows();
  });
}

/* ── Column-count demo control (config/business-rule driven) ──────── */
function initColumnCountDemo(stripEl, panelSelector) {
  if (!stripEl) return;
  stripEl.querySelectorAll(".demo-step[data-cols]").forEach((btn) => {
    btn.addEventListener("click", () => {
      stripEl.querySelectorAll(".demo-step[data-cols]").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      const n = btn.dataset.cols;
      document.querySelectorAll(panelSelector).forEach((panel) => (panel.dataset.cols = n));
      document.dispatchEvent(new CustomEvent("columncountchange", { detail: { cols: n } }));
    });
  });
}
