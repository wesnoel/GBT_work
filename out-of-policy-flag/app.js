/* Out of Policy — shared interaction logic across both concept directions
   (tooltip and popover — the modal concept was explored and then removed
   from scope). Generic by design: OOP_DATA holds per-line-of-business
   content so the title and reason copy are assembled from data, not
   hardcoded per line of business.

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

/* ---- Viewport-aware clamping ----
   Every placement variant is still a fixed CSS rule (top/bottom/left/right/
   transform) — that alone can't know how close the trigger is to a viewport
   edge. After the panel is actually visible (open via click, hover-reveal,
   or :focus-visible keyboard reveal), measure its real rect and nudge it
   back on-screen if any edge would clip past the viewport, leaving a small
   MARGIN px buffer so it never touches the very edge either. Always resets
   the correction to '' first so the measurement is against the variant's
   natural, unclamped position, not a stale correction from a previous open
   at a different scroll position.

   Correction mechanism: the CSS `translate` property, not margin. Margin
   was tried first and looked right in isolation, but it only works for
   variants positioned via `left:<value>` — for every right-anchored variant
   (Left, Below-left, Above-left, which is the default), the panel has
   `left:auto; right:0`, and the box-model constraint solver recomputes
   `left` to keep the right edge pinned, so margin-left has *no visible
   effect at all* on exactly the variants most likely to overflow the left
   edge. `translate` is a pure post-layout paint-time offset — it doesn't
   feed back into how left/right/auto was solved, so it moves the panel
   correctly no matter which combination of left/right/top/bottom/transform
   the active variant uses. It also composes cleanly with the `transform`
   property the centered variants already use for translateX(-50%), since
   `translate` and `transform` are independent CSS properties that combine
   rather than overwrite each other. */
var VIEWPORT_CLAMP_MARGIN = 16;

function clampToViewport(panel) {
  panel.style.translate = "";

  if (getComputedStyle(panel).display === "none") return;

  var rect = panel.getBoundingClientRect();
  var dx = 0;
  var dy = 0;

  if (rect.left < VIEWPORT_CLAMP_MARGIN) {
    dx = VIEWPORT_CLAMP_MARGIN - rect.left;
  } else if (rect.right > window.innerWidth - VIEWPORT_CLAMP_MARGIN) {
    dx = (window.innerWidth - VIEWPORT_CLAMP_MARGIN) - rect.right;
  }

  if (rect.top < VIEWPORT_CLAMP_MARGIN) {
    dy = VIEWPORT_CLAMP_MARGIN - rect.top;
  } else if (rect.bottom > window.innerHeight - VIEWPORT_CLAMP_MARGIN) {
    dy = (window.innerHeight - VIEWPORT_CLAMP_MARGIN) - rect.bottom;
  }

  if (dx || dy) panel.style.translate = dx + "px " + dy + "px";
}

/* Resizing the window doesn't re-fire open/hover/focus on a panel that's
   already visible — clampToViewport only ran at the moment it opened, so a
   popover left open while the viewport shrinks around it stayed exactly
   where it was, edges and all. Re-clamp on resize too: on every resize,
   re-check every panel that's currently actually visible (regardless of
   which path revealed it — click's is-open class, CSS hover, or CSS
   :focus-visible) and snap it back inside the new viewport if needed.
   Deliberately not requestAnimationFrame-coalesced: rAF callbacks can be
   suspended indefinitely in a backgrounded/hidden tab, which would silently
   drop the correction exactly when a resize is in flight. clampToViewport
   is cheap (a few getBoundingClientRect/style reads on at most one visible
   panel), so calling it directly on every resize tick is simpler and more
   reliably correct than it is slow. */
window.addEventListener("resize", function () {
  document.querySelectorAll("[data-oop-panel]").forEach(function (panel) {
    if (getComputedStyle(panel).display !== "none") {
      applyMobileDefaultPlacement(panel.closest(".oop-anchor"), panel);
      clampToViewport(panel);
    }
  });
});

/* ---- Mobile-web default placement: center, flip toward the open side ----
   Above-left (section 10/15b) is the desktop default, chosen because the
   flag sits at a card's right edge and a panel needs somewhere to grow that
   doesn't run off that edge. On a narrow mobile-web viewport there's no
   equivalent "which side has a card edge" reasoning — the trigger is close
   to centered either way — so the default there is instead centered
   horizontally on the trigger (reusing the same centered rule the Below/
   Above variants already use) and flipped vertically toward whichever of
   top/bottom has more room, so it's maximally unlikely to need the
   viewport-clamp correction at all. Deliberately scoped to *default*
   panels only — a panel carrying an explicit placement modifier
   (--below/--above/--left/--below-left) is there specifically to
   demonstrate that named placement, on any viewport, so this leaves it
   alone. OOP_MOBILE_BREAKPOINT intentionally matches the 860px breakpoint
   already used for responsive layout elsewhere in styles.css — keep them
   in sync if that value ever changes. */
var OOP_MOBILE_BREAKPOINT = 860;

function hasExplicitPlacementModifier(panel) {
  return Array.from(panel.classList).some(function (c) {
    return /--(below-left|below|above|left)$/.test(c);
  });
}

function applyMobileDefaultPlacement(anchor, panel) {
  panel.style.top = "";
  panel.style.bottom = "";
  panel.style.left = "";
  panel.style.transform = "";

  if (!anchor || hasExplicitPlacementModifier(panel)) return;
  if (window.innerWidth > OOP_MOBILE_BREAKPOINT) return;

  var trigger = anchor.querySelector("[data-oop-trigger]");
  var triggerRect = trigger.getBoundingClientRect();
  var roomAbove = triggerRect.top;
  var roomBelow = window.innerHeight - triggerRect.bottom;

  panel.style.left = "50%";
  panel.style.transform = "translateX(-50%)";

  if (roomBelow >= roomAbove) {
    panel.style.top = "calc(100% + 6px)";
    panel.style.bottom = "auto";
  } else {
    panel.style.bottom = "calc(100% + 6px)";
    panel.style.top = "auto";
  }
}

/* ---- Concept A (tooltip) + Concept B (popover): shared anchor logic ----
   Decision (per design-decisions.md): close 3s after the pointer actually
   leaves the trigger/panel, not 3s after the click that opened it. Track a
   "hovering" flag on the shared anchor wrapper (covers trigger + panel as
   one region) so moving the mouse from the trigger into the panel doesn't
   count as leaving. A close triggered by any path (timeout, close button,
   outside click, Escape) must also blur() the trigger — otherwise a
   :focus-visible CSS rule keeps the panel visually open even after the
   JS state says it's closed.

   Only one panel open at a time, page-wide: every anchor's close() gets
   registered in oopCloseAll, and opening any panel closes every other one
   first — regardless of which card, concept, or line of business it's on. */
var oopCloseAll = [];

function initOopAnchor(anchor) {
  var trigger = anchor.querySelector("[data-oop-trigger]");
  var panel = anchor.querySelector("[data-oop-panel]");
  if (!trigger || !panel) return;

  var closeTimer = null;
  var hovering = false;

  function isOpen() { return panel.classList.contains("is-open"); }

  function open() {
    oopCloseAll.forEach(function (closeOther) {
      if (closeOther !== close) closeOther();
    });
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    applyMobileDefaultPlacement(anchor, panel);
    clampToViewport(panel);
  }

  function close() {
    panel.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.blur();
    panel.style.translate = "";
    panel.style.top = "";
    panel.style.bottom = "";
    panel.style.left = "";
    panel.style.transform = "";
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 3000);
  }

  // Hover-reveal (CSS :hover on a --hoverable anchor) and keyboard reveal
  // (CSS :focus-visible on the trigger, below) both show the panel with no
  // JS "open" call at all — clamp on those paths too, not just click.
  anchor.addEventListener("mouseenter", function () {
    hovering = true;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    applyMobileDefaultPlacement(anchor, panel);
    clampToViewport(panel);
  });

  trigger.addEventListener("focus", function () {
    applyMobileDefaultPlacement(anchor, panel);
    clampToViewport(panel);
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

  oopCloseAll.push(close);
}

function initAllOopAnchors() {
  document.querySelectorAll(".oop-anchor").forEach(initOopAnchor);
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
  initReuseDemo();
});
