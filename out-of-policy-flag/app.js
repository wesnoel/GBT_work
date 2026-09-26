/* Out of Policy — shared interaction logic across all three concept directions.
   Generic by design: OOP_COPY holds line-of-business copy fragments so the
   message sentence is assembled from data, not hardcoded per line of business.
   See design-decisions.md for the reusability write-up. */

var OOP_COPY = {
  hotel: { itemNoun: "room", ruleLabel: "maximum nightly rate", limit: "USD 420", scope: "for this region" },
  flight: { itemNoun: "flight", ruleLabel: "maximum fare", limit: "USD 650", scope: "for this route" },
  car: { itemNoun: "car rental", ruleLabel: "preferred vendor policy", limit: "a non-preferred vendor", scope: "for this rental" },
  rail: { itemNoun: "fare", ruleLabel: "maximum fare", limit: "USD 180", scope: "for this route" }
};

function buildOopMessage(lob, userName) {
  var c = OOP_COPY[lob];
  if (!c) return "";
  return userName + ", This " + c.itemNoun + " does not comply with your company's " + c.ruleLabel + " of " + c.limit + " " + c.scope + ".";
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

/* ---- Concept C: modal (explicit dismiss only, no idle timer) ---- */
function initOopModal() {
  var overlay = document.getElementById("policyModalOverlay");
  if (!overlay) return;
  var panels = overlay.querySelectorAll(".policy-modal");
  var lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    var size = trigger.getAttribute("data-size") || "md";
    panels.forEach(function (p) {
      p.classList.toggle("is-active", p.classList.contains("policy-modal--" + size));
    });
    overlay.classList.add("is-open");
    var activePanel = overlay.querySelector(".policy-modal.is-active");
    var closeBtn = activePanel && activePanel.querySelector("[data-oop-close]");
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

/* ---- Hub reusability demo: swap line-of-business, re-render from data ---- */
function initReuseDemo() {
  var select = document.getElementById("reuseLobSelect");
  var msgEl = document.getElementById("reusePreviewMessage");
  if (!select || !msgEl) return;

  function render() {
    msgEl.textContent = buildOopMessage(select.value, "Wes");
  }

  select.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", function () {
  initAllOopAnchors();
  initOopModal();
  initReuseDemo();
});
