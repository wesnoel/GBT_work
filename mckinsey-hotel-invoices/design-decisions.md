# McKinsey Hotel Invoices — Design Decisions

Resolves the six open questions from the UX spec and PM review. Each decision is also reflected directly in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Status visual language

**Original decision:** Don't treat this as 10 unique colors. Use 3–4 severity tiers (neutral, success, warning, danger), with a stable icon vocabulary layered on top so every status reads on color + icon + label together, never color alone.

**Update:** icons were removed from every status pill per PM request — status now reads on color + label only. The severity-tier logic still holds (Automated and Approved by Agent share green, Needs Review and early Chase Needed share amber, Ingestion Exception and escalated Chase Needed share red), just without the icon layer that used to distinguish states sharing a color.

- Neutral (gray) — default states with no action needed.
- Success (green) — Automated and Approved by Agent. Both are "good," so they share green; the label is what distinguishes them now.
- Warning (amber) — Needs Review, and Chase Needed before it ages out.
- Danger (red) — Ingestion Exception, and Chase Needed once it crosses the aging threshold.

Chase Needed aging from amber to red is a computed severity, not a new status value. Same pill, same label, escalated color once case age crosses a threshold (10 days in the wireframe, to be confirmed with ops). This keeps the actual status enum small and keeps the aging logic out of the data model.

**Flag for accessibility review:** removing the icon reopens the original WCAG 2.2 concern — color alone can be hard to distinguish for colorblind or low-vision agents, especially between two amber states (Needs Review vs. early Chase Needed) or two red states (Ingestion Exception vs. escalated Chase Needed) that now only differ by label text. Worth a follow-up pass with accessibility before this locks for engineering.

## 2. Self-assign confirmation

**Decision:** View freely, confirm before acting. Opening a case owned by someone else is always silent — a persistent ownership note is visible on the case detail page the moment it loads ("assigned to M. Reyes"). A confirmation step only appears on the actions that actually change state or ownership: Approve, Reassign, Mark as Chased. This is the minimum friction that still prevents silent double-work, and it matches the existing pattern where "Assign to me" only appears on unassigned rows in the case list.

## 3. Attachment viewer

**Decision:** Inline preview is the target. The core review task is comparing booking fields against the folio side by side, and a forced download breaks that loop every time. If OCR output can't guarantee a renderable file for the POC, ship download-only at launch, but keep the attachment panel laid out for inline preview now so the upgrade is a drop-in swap later, not a redesign. This is really an engineering-timeline question — flag it with Bowie/Dmitri's team early.

## 4. "Mark as Chased" note field

**Decision:** Fixed reasons as the primary field (no response / promised by date / hotel disputes booking / other), with free text as an optional secondary note. The PRD calls for watching exception-reason trends over time for monitoring — free text alone isn't analyzable at that scale. The optional note still lets an agent leave context for whoever picks the case up next.

## 5. Case list density

**Decision:** Keep the seven core columns fixed (confirmation, traveller, hotel, stay dates, status, case age, agent) — agents rely on all of them to triage. PNR and FMNO are lookup fields, not decision fields, so they move behind a column picker. Exception reason gets a different treatment entirely: it shows as secondary text under the status pill on rows that have one, rather than a dedicated always-on column that's empty for most rows.

## 6. Empty / stale states

**Decision:** This is mostly an engineering correctness bar, not an open design question. A clear "no matching cases" state per filter/search combination, and filter results that reflect live status rather than a stale page load, both per the PRD's hard requirement. One addition worth adding to the spec: a lightweight signal (subtle highlight or "updated" marker) when a case's status changes while an agent has the list open, so "live" doesn't just mean correct-but-invisible.

---

*Source: PRD — McKinsey Hotel Folio Automation (Confluence, pageId 704875274) · Solution Proposal (Bowie Brotosumpeno, v4) · wireframes in this folder.*
