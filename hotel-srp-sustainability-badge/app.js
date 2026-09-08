/* Sustainability Certified badge — shared interaction logic for both icon concepts.
   Decisions this implements (see design-decisions.md):
     - hover/focus on the badge previews the primary certification (pure CSS, see styles.css)
     - clicking/tapping the badge always opens the full-list side sheet
     - the "Sustainability certified" chip is the only functionally filtering chip here —
       a stand-in for its real placement nested under Amenities/Property in the filter panel
     - zero certified results reuses the standard empty-state pattern with a one-click clear */

function openCertSheet(card) {
  var overlay = document.getElementById("certSheetOverlay");
  var body = document.getElementById("certSheetBody");
  if (!overlay || !body) return;

  var hotelName = card.dataset.hotelName || "";
  var certs = (card.dataset.certs || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);

  var html = '<div class="sheet-hotel-name">' + hotelName + "</div>";
  certs.forEach(function (cert) {
    html +=
      '<div class="cert-list-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg><span>' +
      cert +
      "</span></div>";
  });
  html += '<div class="sheet-source">Source: GDS certification feed</div>';

  body.innerHTML = html;
  overlay.classList.add("show");
}

function closeCertSheet() {
  var overlay = document.getElementById("certSheetOverlay");
  if (overlay) overlay.classList.remove("show");
}

function initCertSheet() {
  document.querySelectorAll("[data-cert-trigger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openCertSheet(btn.closest(".hotel-card"));
    });
  });

  var closeBtn = document.getElementById("certSheetClose");
  var overlay = document.getElementById("certSheetOverlay");
  if (closeBtn) closeBtn.addEventListener("click", closeCertSheet);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeCertSheet();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCertSheet();
  });
}

function initFilters() {
  var certChip = document.querySelector('.chip[data-filter="certified"]');
  var otherChips = document.querySelectorAll(".chip:not([data-filter=\"certified\"])");
  var cards = document.querySelectorAll(".hotel-card");
  var list = document.getElementById("hotelList");
  var emptyState = document.getElementById("emptyState");

  otherChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chip.classList.toggle("active");
    });
  });

  function applyCertFilter() {
    var certOnly = certChip && certChip.classList.contains("active");
    var visibleCount = 0;
    cards.forEach(function (card) {
      var isCertified = card.dataset.certified === "true";
      var visible = !certOnly || isCertified;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCount++;
    });
    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
    if (list) list.style.display = visibleCount === 0 ? "none" : "flex";
  }

  if (certChip) {
    certChip.addEventListener("click", function () {
      certChip.classList.toggle("active");
      applyCertFilter();
    });
  }

  var clearBtn = document.getElementById("clearCertFilter");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (certChip) certChip.classList.remove("active");
      applyCertFilter();
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initCertSheet();
  initFilters();
});
