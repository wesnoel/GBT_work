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
  var activeHotel = { value: "", mode: "exact" };

  function applyFilters() {
    var query = (searchInput && searchInput.value || "").trim().toLowerCase();
    var visibleCount = 0;
    rows.forEach(function (row) {
      var matchesStatus = activeStatus === "all" || row.dataset.status === activeStatus;
      var matchesSearch = !query || row.dataset.search.indexOf(query) !== -1;
      var matchesHotel = !activeHotel.value || (activeHotel.mode === "contains"
        ? row.dataset.hotel.indexOf(activeHotel.value) !== -1
        : row.dataset.hotel === activeHotel.value);
      var visible = matchesStatus && matchesSearch && matchesHotel;
      row.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount++;
      } else {
        var check = row.querySelector(".row-check");
        if (check && check.checked) { check.checked = false; }
      }
    });
    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
    if (table) table.style.display = visibleCount === 0 ? "none" : "table";
    updateBulkBar();
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
    row.addEventListener("click", function (e) {
      if (e.target.closest(".row-check") || e.target.closest("button")) return;
      var href = row.dataset.href;
      if (href) window.location.href = href;
    });
  });

  initFilterPillToggles();
  initHotelFilter(rows, function (hotel, mode) {
    activeHotel = { value: hotel, mode: mode || "exact" };
    applyFilters();
  });
  initConfirmationLabel();

  initSort();
  initBulkActions();
}

/* Filter pills (Hotel name, Confirmation number) reveal their panel on
   click, same pattern as the hotel-SRP filter-by-hotel-name combobox.
   Opening one closes the others, including the column picker. */
function closeAllFilterPanels() {
  ["hotelPillWrap", "confirmationPillWrap"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("open");
  });
  ["hotelPillBtn", "confirmationPillBtn"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute("aria-expanded", "false");
  });
  var colMenu = document.getElementById("colPickerMenu");
  if (colMenu) colMenu.classList.remove("open");
}

/* Popover positioning: the panel is `position: fixed`, so it floats above
   everything and is never clipped by an ancestor's overflow. Its top/left
   are computed from the trigger pill's own bounding rect, snapping it to
   the pill regardless of where that pill sits (including after wrapping
   to a second line on a narrow viewport). */
function positionFilterPanel(btn, panel) {
  var rect = btn.getBoundingClientRect();
  var panelWidth = panel.offsetWidth || 320;
  var left = rect.left;
  if (left + panelWidth > window.innerWidth - 12) {
    left = Math.max(12, window.innerWidth - panelWidth - 12);
  }
  panel.style.top = (rect.bottom + 8) + "px";
  panel.style.left = left + "px";
}

function initFilterPillToggles() {
  var groups = [
    { btn: "hotelPillBtn", wrap: "hotelPillWrap" },
    { btn: "confirmationPillBtn", wrap: "confirmationPillWrap" }
  ];

  groups.forEach(function (g) {
    var btn = document.getElementById(g.btn);
    var wrap = document.getElementById(g.wrap);
    var panel = wrap && wrap.querySelector(".filter-panel");
    if (!btn || !wrap || !panel) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = !wrap.classList.contains("open");
      closeAllFilterPanels();
      if (willOpen) {
        positionFilterPanel(btn, panel);
        wrap.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        var input = wrap.querySelector("input");
        if (input) input.focus();
      }
    });
  });

  document.addEventListener("click", function (e) {
    groups.forEach(function (g) {
      var wrap = document.getElementById(g.wrap);
      if (wrap && wrap.classList.contains("open") && !wrap.contains(e.target)) {
        wrap.classList.remove("open");
        document.getElementById(g.btn).setAttribute("aria-expanded", "false");
      }
    });
  });

  // A fixed-position popover would drift out of place if the page scrolls
  // or resizes while it's open — closing it is simpler than re-tracking it.
  window.addEventListener("scroll", closeAllFilterPanels, true);
  window.addEventListener("resize", closeAllFilterPanels);
}

/* Hotel filter — typeahead combobox over the distinct hotel names in the list. */
function initHotelFilter(rows, onSelect) {
  var wrap = document.getElementById("hotelPillWrap");
  var btn = document.getElementById("hotelPillBtn");
  var input = document.getElementById("hotelFilterInput");
  var menu = document.getElementById("hotelFilterMenu");
  var clearBtn = document.getElementById("hotelPanelClear");
  var label = document.getElementById("hotelPillLabel");
  if (!wrap || !input || !menu) return;

  var hotels = [];
  var seen = {};
  rows.forEach(function (row) {
    var name = row.dataset.hotelLabel;
    if (name && !seen[name]) { seen[name] = true; hotels.push(name); }
  });
  hotels.sort();

  function setLabel(name, mode) {
    if (!label) return;
    if (!name) { label.textContent = "Hotel name"; wrap.classList.remove("filled"); return; }
    label.textContent = mode === "contains" ? 'Hotel name · "' + name + '"' : "Hotel name · " + name;
    wrap.classList.add("filled");
  }

  var hotelIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>';
  var filterIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M8 12h8M11 18h2"/></svg>';

  function renderMenu(filterText) {
    var query = (filterText || "").trim();
    var queryLower = query.toLowerCase();
    var matches = hotels.filter(function (h) { return h.toLowerCase().indexOf(queryLower) !== -1; });
    menu.innerHTML = "";
    if (matches.length === 0) {
      var empty = document.createElement("div");
      empty.className = "filter-option-empty";
      empty.textContent = "No hotels match";
      menu.appendChild(empty);
    } else {
      matches.forEach(function (name) {
        var opt = document.createElement("div");
        opt.className = "filter-option";
        opt.innerHTML = hotelIcon + "<span>" + name + "</span>";
        opt.addEventListener("click", function () {
          input.value = name;
          setLabel(name, "exact");
          wrap.classList.remove("open");
          onSelect(name.toLowerCase(), "exact");
        });
        menu.appendChild(opt);
      });
    }

    // Typing "Marriott" matches several properties, but a single selection
    // above can only pick one. This option keeps every match in view —
    // it filters by the typed text itself rather than one exact hotel.
    if (query) {
      var broad = document.createElement("div");
      broad.className = "filter-option filter-option-broad";
      broad.innerHTML = filterIcon + "<span>Filter by: <strong>" + query + "</strong></span>";
      broad.addEventListener("click", function () {
        setLabel(query, "contains");
        wrap.classList.remove("open");
        onSelect(queryLower, "contains");
      });
      menu.appendChild(broad);
    }
  }

  if (btn) btn.addEventListener("click", function () { renderMenu(input.value); });
  input.addEventListener("input", function () {
    if (input.value === "") { setLabel(""); onSelect(""); }
    renderMenu(input.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      setLabel("");
      onSelect("");
      renderMenu("");
      input.focus();
    });
  }
}

/* Confirmation-number pill mirrors its filled state (border/label) off the
   same #caseSearch input that already drives the table filter. */
function initConfirmationLabel() {
  var input = document.getElementById("caseSearch");
  var wrap = document.getElementById("confirmationPillWrap");
  var label = document.getElementById("confirmationPillLabel");
  var clearBtn = document.getElementById("confirmationPanelClear");
  if (!input || !wrap || !label) return;

  function updateLabel() {
    var val = input.value.trim();
    if (val) {
      wrap.classList.add("filled");
      label.textContent = "Confirmation number · " + (val.length > 18 ? val.slice(0, 18) + "…" : val);
    } else {
      wrap.classList.remove("filled");
      label.textContent = "Confirmation number";
    }
  }

  input.addEventListener("input", updateLabel);

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      updateLabel();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
  }
}

/* Sortable column headers — reorders the actual rows, so it composes with
   whatever the status/search/hotel filters currently show or hide. */
function initSort() {
  var table = document.getElementById("caseTable");
  var tbody = table && table.querySelector("tbody");
  var headers = document.querySelectorAll("th.sortable");
  if (!table || !tbody || !headers.length) return;

  var current = { key: null, dir: 1 };

  function valueFor(row, key, type) {
    var cell = row.querySelector('[data-col="' + key + '"]');
    if (!cell) return "";
    var raw = cell.dataset.sortValue !== undefined ? cell.dataset.sortValue : cell.textContent.trim();
    return type === "numeric" ? parseFloat(raw) || 0 : raw.toLowerCase();
  }

  headers.forEach(function (th) {
    th.addEventListener("click", function () {
      var key = th.dataset.sort;
      var type = th.dataset.sortType || "text";
      var dir = current.key === key ? current.dir * -1 : 1;
      current = { key: key, dir: dir };

      headers.forEach(function (h) { h.removeAttribute("aria-sort"); h.querySelector(".sort-caret").textContent = "⇕"; });
      th.setAttribute("aria-sort", dir === 1 ? "ascending" : "descending");
      th.querySelector(".sort-caret").textContent = dir === 1 ? "▲" : "▼";

      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      rows.sort(function (a, b) {
        var va = valueFor(a, key, type);
        var vb = valueFor(b, key, type);
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
      rows.forEach(function (row) { tbody.appendChild(row); });
    });
  });
}

/* Bulk select → Export CSV. The export itself is a backend job; this only
   shows the interaction point (selection, count, and the triggering action). */
function initBulkActions() {
  var selectAll = document.getElementById("selectAllRows");
  var bar = document.getElementById("bulkBar");
  var countLabel = document.getElementById("bulkCount");
  var exportBtn = document.getElementById("exportCsvBtn");
  var table = document.getElementById("caseTable");
  if (!table) return;

  function rowChecks() {
    return Array.prototype.slice.call(table.querySelectorAll("tbody .row-check"));
  }
  function visibleChecks() {
    return rowChecks().filter(function (c) { return c.closest("tr").style.display !== "none"; });
  }

  window.updateBulkBar = function () {
    var checked = rowChecks().filter(function (c) { return c.checked; });
    if (!bar) return;
    if (checked.length > 0) {
      bar.hidden = false;
      if (countLabel) countLabel.textContent = checked.length + " selected";
    } else {
      bar.hidden = true;
    }
    if (selectAll) {
      var visible = visibleChecks();
      var visibleChecked = visible.filter(function (c) { return c.checked; });
      selectAll.checked = visible.length > 0 && visibleChecked.length === visible.length;
      selectAll.indeterminate = visibleChecked.length > 0 && visibleChecked.length < visible.length;
    }
  };

  rowChecks().forEach(function (check) {
    check.addEventListener("click", function (e) { e.stopPropagation(); });
    check.addEventListener("change", window.updateBulkBar);
  });

  if (selectAll) {
    selectAll.addEventListener("click", function (e) { e.stopPropagation(); });
    selectAll.addEventListener("change", function () {
      visibleChecks().forEach(function (c) { c.checked = selectAll.checked; });
      window.updateBulkBar();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var count = rowChecks().filter(function (c) { return c.checked; }).length;
      if (count === 0) return;
      exportBtn.disabled = true;
      exportBtn.textContent = "Exporting…";
      showToast("Exporting " + count + " selected case" + (count === 1 ? "" : "s") + " to CSV");
      setTimeout(function () {
        rowChecks().forEach(function (c) { c.checked = false; });
        exportBtn.disabled = false;
        exportBtn.textContent = "Export CSV";
        window.updateBulkBar();
      }, 1100);
    });
  }

  window.updateBulkBar();
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
    var willOpen = !menu.classList.contains("open");
    closeAllFilterPanels();
    if (willOpen) menu.classList.add("open");
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".col-picker")) menu.classList.remove("open");
  });

  document.querySelectorAll("[data-col-toggle]").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      document.body.classList.toggle("show-col-" + checkbox.dataset.colToggle, checkbox.checked);
    });
  });
}

/* Approval always collects an optional comment first (decision: popover,
   not a side sheet — it's one field, not worth a heavier pattern). The
   ownership-confirmation gate, if it applies, still fires before this. */
function initApprove() {
  var btn = document.getElementById("approveBtn");
  var pill = document.getElementById("statusPill");
  var reassignBtn = document.getElementById("reassignBtn");
  var ownerName = document.body.dataset.assignedTo;
  var popover = document.getElementById("approvePopover");
  var commentField = document.getElementById("approveComment");
  var popoverCancel = document.getElementById("approveCancelBtn");
  var popoverConfirm = document.getElementById("approveConfirmBtn");
  var activityLog = document.getElementById("activityLog");
  if (!btn) return;

  function openPopover() {
    if (!popover) { finishApprove(""); return; }
    popover.hidden = false;
    if (commentField) commentField.focus();
  }

  function closePopover() {
    if (popover) popover.hidden = true;
    if (commentField) commentField.value = "";
  }

  function finishApprove(comment) {
    if (pill) {
      pill.className = "pill pill-approved";
      pill.innerHTML = pillHTML("check", "Approved by Agent");
    }
    btn.disabled = true;
    btn.textContent = "Approved";
    if (reassignBtn) reassignBtn.disabled = true;
    if (activityLog) {
      var item = document.createElement("div");
      item.className = "activity-item";
      var text = comment
        ? "Approved by You — “" + comment + "”"
        : "Approved by You — no comment added";
      item.innerHTML = '<span class="dot"></span><div><span class="when">Just now</span>' + text + "</div>";
      activityLog.insertBefore(item, activityLog.firstChild);
    }
    showToast("Case approved and marked resolved");
  }

  btn.addEventListener("click", function () {
    if (ownerName && ownerName !== "You") {
      confirmOwnership(ownerName, openPopover);
    } else {
      openPopover();
    }
  });

  if (popoverCancel) {
    popoverCancel.addEventListener("click", function () {
      closePopover();
    });
  }

  if (popoverConfirm) {
    popoverConfirm.addEventListener("click", function () {
      var comment = commentField ? commentField.value.trim() : "";
      closePopover();
      finishApprove(comment);
    });
  }

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

/* The header "Mark as Chased" button no longer submits directly — it jumps
   to the form at the bottom of the page. Submission now happens from the
   form's own Save button, so the reason/note are reviewed before they're
   logged. */
function initChase() {
  var jumpBtn = document.getElementById("markChasedBtn");
  var saveBtn = document.getElementById("chaseSaveBtn");
  var assignBtn = document.getElementById("assignChaseBtn");
  var pill = document.getElementById("statusPill");
  var formPanel = document.getElementById("chaseFormPanel");
  var reasonSelect = document.getElementById("chaseReason");

  if (jumpBtn && formPanel) {
    jumpBtn.addEventListener("click", function () {
      formPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      formPanel.classList.remove("panel-highlight");
      requestAnimationFrame(function () { formPanel.classList.add("panel-highlight"); });
      if (reasonSelect) reasonSelect.focus();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var reason = reasonSelect ? reasonSelect.options[reasonSelect.selectedIndex].text : "";
      if (pill) {
        pill.className = "pill pill-review";
        pill.innerHTML = pillHTML("clock", "Chased — Awaiting Response");
      }
      saveBtn.disabled = true;
      saveBtn.textContent = "Saved";
      if (jumpBtn) jumpBtn.disabled = true;
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
