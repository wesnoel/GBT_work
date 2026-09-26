/* Out of Policy — shared interaction logic across all three concept directions.
   Generic by design: OOP_DATA holds per-line-of-business content so the title
   and reason copy are assembled from data, not hardcoded per line of business.

   Decision: every line of business shows the same "Out of Policy" title,
   full stop — a deliberate standardization, not a straight copy of what
   today's live surfaces happen to do. Real screenshots (2026-09-26) showed
   Air using "Policy violations:" and Rail showing no title at all; both are
   overridden here so the component reads as one consistent pattern.

   Format still varies by line of business:
     - "sentence": one flowing paragraph (Hotel, Car, Rail).
     - "list": a numbered list, 1-2 items depending on which rules the
       booking actually breaks (Air/Flight — confirmed from a real
       screenshot: usually just the price-ceiling reason, sometimes both
       price and cabin-class).

   Sentence-format reasons that carry {name} address the traveler directly
   (Hotel, Car); Air and Rail's real copy does not. */

var OOP_DATA = {
  hotel: {
    title: "Out of Policy",
    format: "sentence",
    reasons: ["{name}, This room does not comply with your company's maximum nightly rate of USD 420 for this region."]
  },
  flight: {
    title: "Out of Policy",
    format: "list",
    reasons: [
      "The reference price on this route is USD 650. To be compliant with your travel policy the price cannot exceed the reference price by more than USD 150.",
      "This cabin class does not comply with your company's travel policy for this flight. Highest cabin class allowed : Economy"
    ]
  },
  car: {
    title: "Out of Policy",
    format: "sentence",
    reasons: ["{name}, This car rental does not comply with your company's maximum daily rate of USD 75 for this location."]
  },
  rail: {
    title: "Out of Policy",
    format: "sentence",
    reasons: ["Highest class allowed on International journey: Second class"]
  }
};

function buildOopContent(lob, userName) {
  var c = OOP_DATA[lob];
  if (!c) return null;
  return {
    title: c.title,
    format: c.format,
    reasons: c.reasons.map(function (r) { return r.replace("{name}", userName); })
  };
}

/* ---- Concept A (tooltip) + Concept B (popover): shared anchor logic ----
   Decision (per design-decisions.md): close 3s after the pointer actually
   leaves the trigger/panel, not 3s after the click that opened it. Track a
   "hovering" flag on the shared anchor wrapper (covers trigger + panel as
   one region) so moving the mouse from the trigger into the panel doesn't
   count as leaving. A close triggered by any path (timeout, close button,
   outside click, Escape) must also blur() the trigger — otherwise a
   :focus-visible CSS rule keeps the panel visually open even after the
   JS state says it's closed. */
function initOopAnchor(anchor) {
  var trigger = anchor.querySelector("[data-oop-trigger]");
  var panel = anchor.querySelector("[data-oop-panel]");
  if (!trigger || !panel) return;

  var closeTimer = null;
  var hovering = false;

  function isOpen() { return panel.classList.contains("is-open"); }

  function open() {
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function close() {
    panel.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.blur();
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 3000);
  }

  anchor.addEventListener("mouseenter", function () {
    hovering = true;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  });

  anchor.addEventListener("mouseleave", function () {
    hovering = false;
    if (isOpen()) scheduleClose();
  });

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (isOpen()) { close(); return; }
    open();
    if (!hovering) scheduleClose();
  });

  var closeBtn = panel.querySelector("[data-oop-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
  }

  document.addEventListener("click", function (e) {
    if (isOpen() && !anchor.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close();
  });
}

function initAllOopAnchors() {
  document.querySelectorAll(".oop-anchor").forEach(initOopAnchor);
}

/* ---- Concept C: modal (explicit dismiss only, no idle timer) ----
   One shared panel — content is identical no matter which trigger (or which
   icon size) opened it, so there's nothing to switch based on size. */
function initOopModal() {
  var overlay = document.getElementById("policyModalOverlay");
  if (!overlay) return;
  var panel = overlay.querySelector(".policy-modal");
  var lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    overlay.classList.add("is-open");
    var closeBtn = panel && panel.querySelector("[data-oop-close]");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll("[data-oop-modal-trigger]").forEach(function (trigger) {
    trigger.addEventListener("click", function () { open(trigger); });
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  overlay.querySelectorAll("[data-oop-close]").forEach(function (btn) {
    btn.addEventListener("click", close);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}

/* ---- Hub reusability demo: swap line-of-business, re-render from data ----
   Car has no confirmed real copy (unlike Hotel, Air, and Rail, all sourced
   from real screenshots) — it's adapted from the Hotel sentence pattern as
   a placeholder, and the demo says so explicitly rather than presenting it
   as confirmed content. */
var OOP_PLACEHOLDER_LOBS = ["car"];

function initReuseDemo() {
  var select = document.getElementById("reuseLobSelect");
  var titleTextEl = document.getElementById("reusePreviewTitleText");
  var bodyEl = document.getElementById("reusePreviewBody");
  var placeholderNote = document.getElementById("reusePreviewPlaceholderNote");
  if (!select || !titleTextEl || !bodyEl) return;

  function render() {
    var content = buildOopContent(select.value, "Wes");
    if (!content) return;

    titleTextEl.textContent = content.title;

    if (content.format === "list") {
      var listHtml = "<ol class=\"reuse-preview-list\">";
      content.reasons.forEach(function (reason) {
        listHtml += "<li>" + reason + "</li>";
      });
      listHtml += "</ol>";
      bodyEl.innerHTML = listHtml;
    } else {
      bodyEl.innerHTML = "<p class=\"reuse-preview-message\">" + content.reasons[0] + "</p>";
    }

    if (placeholderNote) {
      placeholderNote.hidden = OOP_PLACEHOLDER_LOBS.indexOf(select.value) === -1;
    }
  }

  select.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", function () {
  initAllOopAnchors();
  initOopModal();
  initReuseDemo();
});
