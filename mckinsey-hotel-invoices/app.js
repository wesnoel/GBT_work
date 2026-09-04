var ICON = {
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>',
  triangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 21 19H3Z"/><path d="M12 9v4"/><circle cx="12" cy="16.3" r="0.6" fill="currentColor" stroke="none"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M5 4h11l-2 4 2 4H5"/></svg>'
};

function pillHTML(icon, label) {
  return ICON[icon] + "<span>" + label + "</span>";
}

function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

function assignToMe(button, nameCellSelector) {
  var row = button.closest("tr") || button.closest(".case-header") || document;
  var nameCell = row.querySelector(nameCellSelector);
  if (nameCell) nameCell.textContent = "You";
  button.textContent = "Assigned";
  button.disabled = true;
  showToast("Case assigned to you");
}

/* Decision #2 — self-assign / ownership confirmation.
   Viewing a case owned by someone else is always allowed silently;
   only the actions that change state or ownership (Approve, Reassign,
   Mark as Chased) prompt an explicit confirm. */
function confirmOwnership(ownerName, onConfirm) {
  var overlay = document.getElementById("ownershipModal");
  if (!overlay) { onConfirm(); return; }
  document.getElementById("ownershipModalOwner").textContent = ownerName;
  overlay.classList.add("show");

  function cleanup() {
    overlay.classList.remove("show");
    confirmBtn.removeEventListener("click", onConfirmClick);
    cancelBtn.removeEventListener("click", onCancelClick);
  }
  function onConfirmClick() { cleanup(); onConfirm(); }
  function onCancelClick() { cleanup(); showToast("Cancelled — no changes made"); }

  var confirmBtn = document.getElementById("ownershipModalConfirm");
  var cancelBtn = document.getElementById("ownershipModalCancel");
  confirmBtn.addEventListener("click", onConfirmClick);
  cancelBtn.addEventListener("click", onCancelClick);
}

function initCaseList() {
  var chips = document.querySelectorAll(".chip[data-status]");
  var searchInput = document.getElementById("caseSearch");
  var rows = document.querySelectorAll("tbody tr[data-status]");
  var emptyState = document.getElementById("emptyState");
  var table = document.getElementById("caseTable");
  var activeStatus = "all";

  function applyFilters() {
    var query = (searchInput && searchInput.value || "").trim().toLowerCase();
    var visibleCount = 0;
    rows.forEach(function (row) {
      var matchesStatus = activeStatus === "all" || row.dataset.status === activeStatus;
      var matchesSearch = !query || row.dataset.search.indexOf(query) !== -1;
      var visible = matchesStatus && matchesSearch;
      row.style.display = visible ? "" : "none";
      if (visible) visibleCount++;
    });
    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
    if (table) table.style.display = visibleCount === 0 ? "none" : "table";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeStatus = chip.dataset.status;
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  document.querySelectorAll("[data-assign-row]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      assignToMe(btn, ".agent-cell");
    });
  });

  document.querySelectorAll("tr.row-link").forEach(function (row) {
    row.addEventListener("click", function () {
      var href = row.dataset.href;
      if (href) window.location.href = href;
    });
  });
}

/* Decision #5 — case list column picker. Core columns (confirmation,
   traveller, hotel, dates, status, age, agent) always stay visible;
   PNR and FMNO are lookup fields hidden by default, toggled on demand. */
function initColumnPicker() {
  var toggleBtn = document.getElementById("colPickerToggle");
  var menu = document.getElementById("colPickerMenu");
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", function () {
    menu.classList.remove("open");
  });

  document.querySelectorAll("[data-col-toggle]").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      document.body.classList.toggle("show-col-" + checkbox.dataset.colToggle, checkbox.checked);
    });
  });
}

function initApprove() {
  var btn = document.getElementById("approveBtn");
  var pill = document.getElementById("statusPill");
  var reassignBtn = document.getElementById("reassignBtn");
  var ownerName = document.body.dataset.assignedTo;
  if (!btn) return;

  function doApprove() {
    if (pill) {
      pill.className = "pill pill-approved";
      pill.innerHTML = pillHTML("check", "Approved by Agent");
    }
    btn.disabled = true;
    btn.textContent = "Approved";
    if (reassignBtn) reassignBtn.disabled = true;
    showToast("Case approved and marked resolved");
  }

  btn.addEventListener("click", function () {
    if (ownerName && ownerName !== "You") {
      confirmOwnership(ownerName, doApprove);
    } else {
      doApprove();
    }
  });

  if (reassignBtn) {
    reassignBtn.addEventListener("click", function () {
      function doReassign() { showToast("Case reassigned — queued for another agent"); }
      if (ownerName && ownerName !== "You") {
        confirmOwnership(ownerName, doReassign);
      } else {
        doReassign();
      }
    });
  }
}

function initReopen() {
  var btn = document.getElementById("reopenBtn");
  var pill = document.getElementById("statusPill");
  var banner = document.getElementById("automatedBanner");
  if (!btn) return;
  btn.addEventListener("click", function () {
    if (pill) {
      pill.className = "pill pill-review";
      pill.innerHTML = pillHTML("clock", "Needs Review");
    }
    if (banner) banner.textContent = "Reopened — case moved to the agent queue for manual review.";
    btn.disabled = true;
    btn.textContent = "Reopened";
    showToast("Case reopened for manual review");
  });
}

function initChase() {
  var chaseBtn = document.getElementById("markChasedBtn");
  var assignBtn = document.getElementById("assignChaseBtn");
  var pill = document.getElementById("statusPill");
  if (chaseBtn) {
    chaseBtn.addEventListener("click", function () {
      var reasonSelect = document.getElementById("chaseReason");
      var reason = reasonSelect ? reasonSelect.options[reasonSelect.selectedIndex].text : "";
      if (pill) {
        pill.className = "pill pill-review";
        pill.innerHTML = pillHTML("clock", "Chased — Awaiting Response");
      }
      chaseBtn.disabled = true;
      chaseBtn.textContent = "Marked as Chased";
      showToast("Logged: " + reason);
    });
  }
  if (assignBtn) {
    assignBtn.addEventListener("click", function () {
      assignToMe(assignBtn, "#agentValue");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initCaseList();
  initColumnPicker();
  initApprove();
  initReopen();
  initChase();
});
