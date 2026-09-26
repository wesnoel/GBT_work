# Out of Policy Flag — Design Decisions

Resolves the open questions raised by exploring three interaction directions for the hotel-card out-of-policy flag. Each decision is also reflected directly in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Scope of the three directions

**Decision:** The three concepts (tooltip, popover dialog, modal) isolate *interaction weight* as the variable being tested, not content or copy. All three show the identical real hotel-shopping message. This keeps the comparison honest — a stakeholder reviewing all three sees the same information disclosed with increasing structural weight, not three different messages that happen to look different.

## 2. Open trigger behavior per concept

**Decision:**
- **Tooltip (A):** hover, click, and tap all open it — matches today's live pattern exactly. No close button, since a lightweight hint shouldn't need one.
- **Popover dialog (B):** click/tap only, no hover-open. A heavier surface with a real header and an explicit close button appearing from a stray mouse pass would feel like a bug, not a feature.
- **Modal (C):** click/tap only. A full-screen takeover must never appear from hover or from keyboard focus landing on the trigger — only a deliberate activation should interrupt the whole screen.

## 3. Idle-dismiss behavior

**Decision:** Tooltip and popover both auto-dismiss 3 seconds after the pointer actually *leaves* the trigger/panel region — not 3 seconds from the moment they were opened. This is tracked with a `hovering` flag on a shared `.oop-anchor` wrapper (covers the trigger and the panel as one region, so moving the mouse from the flag into the panel to read it doesn't count as leaving):
- `mouseenter` on the anchor cancels any pending close timer.
- `mouseleave` on the anchor starts a 3s timer, but only if the panel is currently open.
- A click that opens the panel starts the same 3s timer immediately *only* if there was no real mouse hover to begin with (pure touch/tap) — otherwise it waits for the eventual `mouseleave`.

The popover (B) keeps this as a safety net even though it has an explicit close button, in case someone opens it and walks away without dismissing it. The modal (C) has no idle timer at all — once it takes over the screen, only an explicit close, backdrop click, or Escape dismisses it.

**Flag for follow-up:** confirm the 3-second window with usability testing rather than treating it as final — it's carried over from the existing tooltip's real behavior, not re-validated here.

## 4. The focus-visible / blur() gotcha

**Decision:** Every close path (idle timeout, close-button click, outside click, Escape) calls `trigger.blur()` in addition to removing the `is-open` class. Reason: both the tooltip and popover panels also reveal via a `:focus-visible` CSS rule on the trigger (so keyboard users see the same content sighted mouse users get on hover). If a panel was opened by click, the trigger keeps browser focus — removing the JS `is-open` class on timeout does nothing *visually*, because the `:focus-visible` rule alone still forces the panel visible. This looks exactly like "the auto-close isn't working" when the JS is actually firing correctly. Blurring the trigger on every close path is the fix, and it generalizes to any click/tap-triggered popover in this design system, not just this component.

## 5. Sizing strategy

**Decision:** Small, medium, and large change icon size, padding, type scale, *and* content density together — not a uniform scale-up of one size. Concretely:

| | Small | Medium | Large |
|---|---|---|---|
| Icon | 16px | 20px | 24px |
| Tooltip | message only, no title, 1 line | title + full message | title + full message + policy link |
| Popover | header + condensed 1-line message, no footer | header + full message + policy-link footer | header + full message + footer with policy link *and* "Request exception" action |
| Modal | title + message + single "Got it" button | + "View travel policy" link below the button | + icon badge grows to 48px, second "Request exception" action alongside "Got it" |

Rationale: a small size is used where space is tightest (e.g. a dense list row) and should carry the minimum viable warning; a large size is used where the interaction is the focal point and can afford to offer a next step, not just a warning.

## 6. Reusability — data-driven content, not hardcoded to hotel

**Decision (revised 2026-09-26 after reviewing real Air and Rail screenshots, then revised again same day):** the component's content varies by line of business along one structural axis — **format**: `sentence` (one flowing paragraph) vs. `list` (a numbered list, 1-2 items depending on which rules the booking actually breaks). The **title is standardized to "Out of Policy" for every line of business, always shown** — a deliberate consistency call, not a literal copy of what today's live surfaces happen to do.

Real screenshots (2026-09-26) showed two inconsistencies in the *current* product that this decision intentionally overrides: Air's live surface uses "Policy violations:" instead of "Out of Policy," and Rail's live tooltip shows no title at all. Both are unified under one title here so the reusable component reads as one consistent pattern rather than propagating three different conventions forward.

Implemented in `app.js` as `OOP_DATA` (one entry per line of business, each with `title`, `format`, and a `reasons` array) and `buildOopContent(lob, userName)`. The hub page's "Reusability" section renders this live from a dropdown, switching between a flowing paragraph and a numbered list as needed — title text is always rendered.

| Line of business | Source | Title | Format | Reasons |
|---|---|---|---|---|
| Hotel | This build's brief (real Hotel shopping copy) | "Out of Policy" | sentence | "Wes, This room does not comply with your company's maximum nightly rate of USD 420 for this region." |
| Flight | Real screenshot (2026-09-26); title standardized from the live "Policy violations:" | "Out of Policy" | list, 1-2 items | 1) "The reference price on this route is USD 650. To be compliant with your travel policy the price cannot exceed the reference price by more than USD 150." 2) "This cabin class does not comply with your company's travel policy for this flight. Highest cabin class allowed : Economy" — item 2 only shows when the booking also breaks the cabin-class rule; usually it's just item 1. |
| Rail | Real screenshot (2026-09-26); title standardized from the live surface, which shows none | "Out of Policy" | sentence | "Highest class allowed on International journey: Second class" — no traveler name, unlike Hotel. |
| Car | **Placeholder — no real copy provided yet** | "Out of Policy" | sentence | "Wes, This car rental does not comply with your company's maximum daily rate of USD 75 for this location." — adapted from the Hotel template (numeric ceiling) since Car has no confirmed source yet. Flagged directly in the hub demo (an inline placeholder note + "(placeholder copy)" in the dropdown option label) so it's never mistaken for confirmed content. |

**Flag for follow-up:** standardizing Air's and Rail's title is a wireframe-stage recommendation, not yet validated with the teams that own those live surfaces — confirm they're fine converging on "Out of Policy" before this ships as the target pattern.

**Flag for follow-up:** replace the Car placeholder with real copy once a source is available (PRD, content design, or a screenshot of the live product) — the data model (`format`, `showTitle`, `reasons`) already supports whatever shape it turns out to need, sentence or list.

## 7. Assumptions

**Decision:** Used "Wes" as the traveler's first name (the requester) since the real component takes the logged-in user's name as data, not a hardcoded value. Used the real Hotel SRP price-block context (thumbnail, name, stars/distance, price block) from the existing hotel-card pattern, with a single example hotel (Hilton San Francisco Union Square, $459/night against a $420 policy limit) reused across every size variant so the flag's size is the only variable being compared.

## 8. Figma handoff notes

- **Tooltip (A)** is the closest match to an existing Sticker Sheet Tooltip component, if one exists — check before rebuilding from scratch.
- **Popover dialog (B)** is likely net-new — no obvious existing Sticker Sheet equivalent for an anchored, structured popover with its own header/close chrome. Flag as net-new work for whoever rebuilds this in Figma.
- **Modal (C)** should map directly to the standard Dialog/Modal component in the Sticker Sheet.
- Class naming (`flag-trigger`, `policy-tooltip`, `policy-popover`, `policy-modal`, each with `--sm`/`--md`/`--lg` modifiers) is intended to map to Figma component variants (Size: Small/Medium/Large) rather than one-off instances.

---

*Source: verbal design exploration request (2026-09-26) · Hotel SRP price-block flag pattern (existing product) · wireframes in this folder.*
