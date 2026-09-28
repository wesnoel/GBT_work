# Out of Policy Flag — Design Decisions

Resolves the open questions raised by exploring interaction directions for the out-of-policy flag, applied to both the Hotel and Air SRP card patterns. Each decision is also reflected directly in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Scope of the directions

**Decision:** The concepts (tooltip, popover dialog — a third, modal, was explored and then removed from scope on 2026-09-28, see section 12) isolate *interaction weight* as the variable being tested, not content or copy. Both show the identical real per-line-of-business message. This keeps the comparison honest — a stakeholder reviewing both sees the same information disclosed with increasing structural weight, not two different messages that happen to look different.

## 2. Open trigger behavior per concept

**Decision (revised 2026-09-26):**
- **Tooltip (A):** hover, click, and tap all open it — matches today's live pattern exactly. No close button, since a lightweight hint shouldn't need one.
- **Popover dialog (B):** hover, click, and tap all open it too — **this is a reversal of the original decision (see section 12's note on the original click/tap-only version), made the explicit standard going forward for both anchored disclosure concepts.** Hover/click/tap is the standard for every anchored trigger in this component, tooltip or popover, so the two concepts differ only in visual weight, not in how they open.

## 3. Idle-dismiss behavior

**Decision:** Tooltip and popover both auto-dismiss 3 seconds after the pointer actually *leaves* the trigger/panel region — not 3 seconds from the moment they were opened. This is tracked with a `hovering` flag on a shared `.oop-anchor` wrapper (covers the trigger and the panel as one region, so moving the mouse from the flag into the panel to read it doesn't count as leaving):
- `mouseenter` on the anchor cancels any pending close timer.
- `mouseleave` on the anchor starts a 3s timer, but only if the panel is currently open.
- A click that opens the panel starts the same 3s timer immediately *only* if there was no real mouse hover to begin with (pure touch/tap) — otherwise it waits for the eventual `mouseleave`.

The popover (B) keeps this as a safety net even though it has an explicit close button, in case someone opens it and walks away without dismissing it.

**Flag for follow-up:** confirm the 3-second window with usability testing rather than treating it as final — it's carried over from the existing tooltip's real behavior, not re-validated here.

## 4. The focus-visible / blur() gotcha

**Decision:** Every close path (idle timeout, close-button click, outside click, Escape) calls `trigger.blur()` in addition to removing the `is-open` class. Reason: both the tooltip and popover panels also reveal via a `:focus-visible` CSS rule on the trigger (so keyboard users see the same content sighted mouse users get on hover). If a panel was opened by click, the trigger keeps browser focus — removing the JS `is-open` class on timeout does nothing *visually*, because the `:focus-visible` rule alone still forces the panel visible. This looks exactly like "the auto-close isn't working" when the JS is actually firing correctly. Blurring the trigger on every close path is the fix, and it generalizes to any click/tap-triggered popover in this design system, not just this component.

## 5. Sizing strategy

**Decision (revised 2026-09-26):** small, medium, and large control *only* the flag icon's size — 16px / 18px / 20px. Everything else (panel width, padding, structure, and copy) is identical across all three. This replaces an earlier version of this build where size also changed padding, type scale, and content density — that turned out to conflate two separate things: how prominent the trigger icon looks in a given UI density, and how much information the disclosure surface shows once triggered. Those are independent; the flag can be small in a dense list row and still open the exact same "Out of Policy" tooltip/popover as a large flag would.

All panel text is font_300 (14px / 18px line-height): title bold, body text regular — same tier, different weight only, per typography-tokens.md (bold and regular share size/line-height at every tier).

Concretely, the disclosure content per concept (constant across all three icon sizes, revised 2026-09-28 to remove the "View travel policy" link everywhere — it wasn't tied to a real destination and added a dead-end action):
- **Tooltip:** title + message (sentence format) or title + numbered list (list format, e.g. Flight). No link, no footer.
- **Popover:** header (icon + title) + close (&times;) button + message or numbered list. No footer.

**In-context card examples default to small (revised 2026-09-26):** since size only changes the icon now, three near-identical cards side by side (differing by a 4px icon size difference) added length without adding information — the standalone icon-size rail already makes that comparison clearly. Removed the Small/Medium/Large card set from Concept A and B; the in-context demonstration is now the "placement variants" set (still small-icon, five cards each) — one set for the Hotel card, one for the Flight card (added 2026-09-28, see section 13).

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

**Found and fixed (2026-09-26):** the hotel card's price column (`.hotel-price`) is intentionally right-aligned (`text-align: right`), matching the real SRP price block. But `text-align` is inherited, and the tooltip/popover panels are DOM descendants of `.hotel-price` (they're nested inside the flag trigger's wrapper, which sits inside the price column) even though they're positioned absolutely elsewhere on screen. With no `text-align` of their own, the "Out of Policy" title and message were inheriting `right` from their ancestor and rendering right-aligned whenever triggered from within a hotel card — while the same panels looked correctly left-aligned in the standalone/placement sections, which sit outside any right-aligned container. Fixed by setting `text-align: left` directly on `.policy-tooltip` and `.policy-popover` themselves, so the messaging is always left-aligned regardless of what alignment its container happens to use. The price column's own right alignment is unchanged.

## 10. Placement variants — tooltip and popover

**Decision (2026-09-26, revised same day):** five placement variants for Concept A (tooltip) and Concept B (popover), each a CSS position modifier on the same panel — no content changes, same as the size variants:

- **Below** (default) and **Above** — centered horizontally on the trigger (`left: 50%; transform: translateX(-50%)`), not left-edge-aligned. A panel noticeably wider than a 16-20px icon looked lopsided when it only extended in one direction from the trigger's edge.
- **Left** — vertically centered beside the trigger (`top: 50%; transform: translateY(-50%)`), opening directly to the left.
- **Below, left** and **Above, left** — added after the first pass, because the hotel (and later, flight) card's flag sits at the right edge of the price column: a panel that grows *rightward* from there (as plain Below/Above do) would run off the edge of the card. These two stay flush to the trigger's right edge (`right: 0`, no centering transform) and grow only leftward, which is the placement the price-column context actually needs.

Every modifier fully restates `top`/`bottom`/`left`/`right`/`transform` (not just the properties that differ from the default) so variants can't bleed into each other regardless of class order. All five are shown three times per concept page: standalone, applied to the Hotel card, and applied to the Flight card (added 2026-09-28, see section 13) — same five CSS modifiers reused as-is, no per-card-type variant needed.

**Flag for follow-up:** a production implementation would likely want this to flip automatically based on available viewport space (collision detection) rather than being a fixed per-instance choice — that's a real interaction detail worth prototyping in code, not fully resolvable in a static wireframe.

## 12. Modal concept — removed from scope (2026-09-28)

**Decision:** the third direction, Modal (Concept C — a full-screen dialog takeover), was built, reviewed, and then dropped from scope entirely at Wes's direction. This wasn't a usability finding against the modal itself — no negative feedback drove it, it was a scope-narrowing call to focus the exploration on the two anchored-disclosure directions (tooltip and popover). `concept-c-modal.html` has been deleted; the hub's "Interaction concepts" grid now shows two cards, not three.

Kept for the record, since it may be worth revisiting: the modal's original design was a centered overlay (400px, 28px padding), header with a 40px icon badge + title + close button, message body, and a footer action — which itself went through two revisions before removal: a primary "Got it" button, then (per direction) a "Close" button restyled first as tertiary, then corrected to secondary. The `.policy-modal*` CSS, the `initOopModal()` JS, and the shared `.btn`/`.btn-primary`/`.btn-secondary` button classes (which existed only to support the modal's footer button) were all removed from `styles.css`/`app.js` along with the page — none of them are referenced anywhere else in the build.

## 13. Flight card — proving reuse on a second line of business (2026-09-28)

**Decision:** added a full "Flight" treatment alongside "Hotel" on Concept A and Concept B — same component, same interaction, same five placement variants, applied to a new `.flight-card` pattern modeled on the Air SRP instead of the Hotel SRP. This is the first time the reusability claim (see section 6) is demonstrated on an actual card rather than just in the hub's abstract data-preview dropdown.

**Card anatomy** (parallel to the hotel card's, see `references/hotel-card.md`): badge row ("Egencia preferred" + "Nonstop" instead of "Negotiated" — a refundable-fare badge would have contradicted the "Nonrefundable fare" price-sub line, so it was dropped in favor of a non-contradictory second badge), an airline block in place of the thumbnail (icon + airline name, since there's no real logo asset), route + times + duration/stops, a fare details box (cabin + bag allowance) parallel to the Reviews box, a "Lower emissions than average flight" line parallel to Sustainability certified, the same coworker-booking-% line, and a full-width inset perk strip ("Includes 1 checked bag, within company policy") — same structure as the hotel perk strip, just flight-appropriate copy.

**Content is genuinely data-driven, not just visually parallel:** the flight card's tooltip/popover renders `OOP_DATA.flight`'s real **list**-format content (both violation reasons — the reference-price ceiling and the cabin-class rule) as an actual numbered list inside the panel, not a sentence. This required a real component addition: `.policy-tooltip__list` / `.policy-popover__list` (ordered list, same font_300 sizing as the sentence variant) — previously the list format only existed in the hub's abstract reusability demo, never in a live, triggerable tooltip/popover. The example price ($865) and cabin class (Premium Economy) were chosen specifically to violate both rules at once, so the fuller 2-item list case gets exercised, not just the more common single-reason case.

The hub also got a lightweight, single-card "Applied to Air SRP" section (tooltip-only, default placement) as a quick preview, linking out to Concept A and B for the full five-placement treatment.

## 14. Figma handoff notes

- **Tooltip (A)** is the closest match to an existing Sticker Sheet Tooltip component, if one exists — check before rebuilding from scratch.
- **Popover dialog (B)** is likely net-new — no obvious existing Sticker Sheet equivalent for an anchored, structured popover with its own header/close chrome. Flag as net-new work for whoever rebuilds this in Figma.
- Class naming: `flag-trigger` carries the `--sm`/`--md`/`--lg` size modifiers (icon dimension only). `policy-tooltip` and `policy-popover` have no size modifiers at all now — one Figma component/variant each, sized once, is enough; only the trigger needs a Size variant axis. `.hotel-card` and `.flight-card` are deliberately separate class families rather than a shared generic one — see `references/hotel-card.md`'s naming-discipline note.

---

*Source: verbal design exploration request (2026-09-26) · Hotel SRP price-block flag pattern (existing product) · wireframes in this folder.*
