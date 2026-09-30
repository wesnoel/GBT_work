/* Auditability: every render plan generated — context in, plan out, which
   engine produced it, and whether validation had to correct anything — logs
   to both the console (full JSON, for anyone digging deeper) and a visible
   on-page panel (for the demo, where "how do we trust what it shows" needs
   an answer someone can point at without opening devtools). */

const auditEntries = [];

function logRenderPlan(entry) {
  auditEntries.unshift(entry);

  console.groupCollapsed(`[render-plan] ${entry.engine} @ ${entry.timestamp}`);
  console.log("context in:", entry.context);
  console.log("plan out:", entry.plan);
  if (entry.rationale) console.log("rationale:", entry.rationale);
  if (entry.validationErrors && entry.validationErrors.length) console.warn("validation corrections:", entry.validationErrors);
  console.groupEnd();

  renderAuditLog();
}

function renderAuditLog() {
  const el = document.getElementById("auditLog");
  if (!el) return;
  if (!auditEntries.length) {
    el.innerHTML = `<div class="audit-empty">No render plans generated yet.</div>`;
    return;
  }
  el.innerHTML = auditEntries.map((e) => `
    <div class="audit-entry">
      <div class="audit-entry-top">
        <span class="audit-engine ${e.engine.indexOf("stub") !== -1 ? "audit-engine-stub" : "audit-engine-rules"}">${e.engine}</span>
        <span class="audit-time">${e.timestamp}</span>
      </div>
      <div class="audit-summary">${e.summary}</div>
      ${e.validationErrors && e.validationErrors.length ? `<div class="audit-warn">Validator corrected ${e.validationErrors.length} issue(s) — see console.</div>` : ""}
    </div>`).join("");
}
