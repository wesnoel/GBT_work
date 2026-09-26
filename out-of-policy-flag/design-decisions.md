# Out of Policy Flag — Design Decisions

Resolves the open questions raised by exploring three interaction directions for the hotel-card out-of-policy flag. Each decision is also reflected directly in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Scope of the three directions

**Decision:** The three concepts (tooltip, popover dialog, modal) isolate *interaction weight* as the variable being tested, not content or copy. All three show the identical real hotel-shopping message. This keeps the comparison honest — a stakeholder reviewing all three sees the same information disclosed with increasing structural weight, not three different messages that happen to look different.

## 2. Open trigger behavior per concept

**Decision (revised 2026-09-26):**
- **Tooltip (A):** hover, click, and tap all open it — matches today's live pattern exactly. No close button, since a lightweight hint shouldn't need one.
- **Popover dialog (B):** hover, click, and tap all open it too — **this is a reversal of the original decision below, made the explicit standard going forward for both anchored disclosure concepts.** (Original reasoning, kept for the record: a heavier surface with a real header and an explicit close button appearing from a stray mouse pass could feel like a bug, not a feature — click/tap only felt safer. That's superseded now: hover/click/tap is the standard for every anchored trigger in this component, tooltip or popover, so the two concepts differ only in visual weight, not in how they open.)
- **Modal (C):** click/tap only, unchanged. A full-screen takeover must never appear from hover or from keyboard focus landing on the trigger — only a deliberate activation should interrupt the whole screen. This reversal doesn't apply to Modal since it isn't an anchored disclosure pattern.

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

**Decision (revised 2026-09-26):** small, medium, and large control *only* the flag icon's size — 16px / 18px / 20px. Everything else (panel width, padding, structure, and copy) is identical across all three. This replaces an earlier version of this build where size also changed padding, type scale, and content density (a tooltip's title/link, a popover's footer actions, a modal's button count all varied by size) — that turned out to conflate two separate things: how prominent the trigger icon looks in a given UI density, and how much information the disclosure surface shows once triggered. Those are independent; the flag can be small in a dense list row and still open the exact same "Out of Policy" tooltip/popover/modal as a large flag would.

All panel text is font_300 (14px / 18px line-height): title bold, body text regular — same tier, different weight only, per typography-tokens.md (bold and regular share size/line-height at every tier).

Concretely, the disclosure content per concept (constant across all three icon sizes):
- **Tooltip:** title + message, no link.
- **Popover:** header (icon + title) + close button + message + footer with a "View travel policy" link.
- **Modal:** header (icon badge + title) + close button + message + "Got it" primary button + "View travel policy" link.

**In-context hotel card examples default to small (revised 2026-09-26):** since size only changes the icon now, three near-identical hotel cards side by side (differing by a 4px icon size difference) added length without adding information — the standalone icon-size rail already makes that comparison clearly. Removed the Small/Medium/Large hotel-card set from all three concept pages. Concept A and B's in-context demonstration is now the "placement variants" set (still small-icon, five cards); Concept C, which has no placement axis, keeps a single small-icon card.

A single shared modal panel is reused by every trigger on Concept C's page regardless of icon size, since there's no longer any content variation to switch between.

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

**Decision:** Used "Wes" as the traveler's first name (the requester) since the real component takes the logged-in user's name as data, not a hardcoded value. Used the real Hotel SRP price-block context (thumbnail, name, stars/distance, price block) from the existing hotel-card pattern, with a single example hotel (Hilton San Francisco Union Square, $459/night against a $420 policy limit) reused across every size variant so the flag's icon size is the only variable being compared.

The hotel card itself was upgraded (2026-09-26) to show every optional data slot filled in at once — badges (Egencia preferred + Negotiated), the Reviews box with both the public score and Colleague Reviews, the Sustainability certified line, the coworker-booking-% line, and the perk/policy strip footer — matching a real reference screenshot of a fully-populated card (New York Hilton Midtown). This makes the out-of-policy flag's context realistic and maximally dense, rather than the stripped-down card used in the first pass.

## 8. Bug fix — clipped card content

**Found and fixed (2026-09-26):** the hotel card had `overflow: hidden` on `.hotel-card` combined with a negative-margin trick on `.hotel-perk-strip` (used to make the strip span edge-to-edge, canceling the card's own padding). Negative margins on the last child of a flex column don't extend the container to cover the visual overflow they create — so `overflow: hidden` was clipping that overflow, cutting content off at the bottom of the card. Fixed by restructuring: `.hotel-card` no longer has padding or `overflow: hidden` at all; `.hotel-card-main` (the thumbnail/body/price row) carries the padding instead, and `.hotel-perk-strip` sits naturally below it at full card width with its own bottom-corner radius, no negative margins needed. General lesson: don't reach for `overflow: hidden` to fix a visual edge-case without checking whether something else in the same container relies on overflowing on purpose.

## 9. Bug fix — out-of-policy messaging inheriting right alignment

**Found and fixed (2026-09-26):** the hotel card's price column (`.hotel-price`) is intentionally right-aligned (`text-align: right`), matching the real SRP price block. But `text-align` is inherited, and the tooltip/popover panels are DOM descendants of `.hotel-price` (they're nested inside the flag trigger's wrapper, which sits inside the price column) even though they're positioned absolutely elsewhere on screen. With no `text-align` of their own, the "Out of Policy" title and message were inheriting `right` from their ancestor and rendering right-aligned whenever triggered from within a hotel card — while the same panels looked correctly left-aligned in the standalone/placement sections, which sit outside any right-aligned container. Fixed by setting `text-align: left` directly on `.policy-tooltip`, `.policy-popover`, and `.policy-modal` themselves, so the messaging is always left-aligned regardless of what alignment its container happens to use. The price column's own right alignment is unchanged.

## 10. Placement variants — tooltip and popover

**Decision (2026-09-26, revised same day):** five placement variants for Concept A (tooltip) and Concept B (popover), each a CSS position modifier on the same panel — no content changes, same as the size variants:

- **Below** (default) and **Above** — centered horizontally on the trigger (`left: 50%; transform: translateX(-50%)`), not left-edge-aligned. A panel noticeably wider than a 16-20px icon looked lopsided when it only extended in one direction from the trigger's edge.
- **Left** — vertically centered beside the trigger (`top: 50%; transform: translateY(-50%)`), opening directly to the left.
- **Below, left** and **Above, left** — added after the first pass, because the hotel card's flag sits at the right edge of the price column: a panel that grows *rightward* from there (as plain Below/Above do) would run off the edge of the card. These two stay flush to the trigger's right edge (`right: 0`, no centering transform) and grow only leftward, which is the placement the price-column context actually needs.

Every modifier fully restates `top`/`bottom`/`left`/`right`/`transform` (not just the properties that differ from the default) so variants can't bleed into each other regardless of class order. All five are shown twice per concept page: standalone, and applied to the real hotel card. Modal (Concept C) has no placement variant — it's centered/fixed by definition, not anchored to the trigger.

**Flag for follow-up:** a production implementation would likely want this to flip automatically based on available viewport space (collision detection) rather than being a fixed per-instance choice — that's a real interaction detail worth prototyping in code, not fully resolvable in a static wireframe.

## 11. Figma handoff notes

- **Tooltip (A)** is the closest match to an existing Sticker Sheet Tooltip component, if one exists — check before rebuilding from scratch.
- **Popover dialog (B)** is likely net-new — no obvious existing Sticker Sheet equivalent for an anchored, structured popover with its own header/close chrome. Flag as net-new work for whoever rebuilds this in Figma.
- **Modal (C)** should map directly to the standard Dialog/Modal component in the Sticker Sheet.
- Class naming: `flag-trigger` carries the `--sm`/`--md`/`--lg` size modifiers (icon dimension only). `policy-tooltip`, `policy-popover`, and `policy-modal` have no size modifiers at all now — one Figma component/variant each, sized once, is enough; only the trigger needs a Size variant axis.

---

*Source: verbal design exploration request (2026-09-26) · Hotel SRP price-block flag pattern (existing product) · wireframes in this folder.*
