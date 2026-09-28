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

**Bug fix — only one panel open at a time, page-wide (caught in design review, 2026-09-28):** clicking a second flag while a first tooltip/popover was already open left the first one open too — nothing was closing it. Fixed generically in `app.js`: every anchor's `close()` function registers itself in a shared `oopCloseAll` list, and `open()` now closes every *other* registered panel first before opening its own. This applies uniformly across every trigger on every page — standalone rails, placement demos, Hotel cards, Flight cards, tooltip and popover alike — not a per-card or per-concept fix.

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

## 13. Flight card — proving reuse on a second line of business (2026-09-28, corrected same day)

**First attempt was wrong and was fully replaced:** the first pass invented a `.flight-card` by re-skinning the Hotel card's anatomy (thumbnail-shaped airline block, a "Reviews"-box lookalike for fare details, a Sustainability-certified lookalike "eco line," a perk strip) with flight-flavored copy, embedded directly into the existing Hotel-only Concept A/B pages, plus a single-card teaser on the hub. That's not what the real Air SRP flight card looks like at all, and per direction it shouldn't have been mixed into the Hotel pages regardless. Both mistakes were corrected:

1. **Wrong card anatomy → rebuilt from the real pattern.** `references/pattern-flight-srp.md` (added to the skill 2026-09-28, sourced from a live Figma inspection, not a screenshot guess) documents the actual Flight card: an itinerary block (departure/arrival time + airport code + city, a dot-line route indicator, duration, amenity icons, an airline/OTP/preferred-partner row with a "View details" link) alongside **three fare-tier columns side by side** (Essential / Smart / Elite), each with its own "From" price — not a single price block like Hotel. The out-of-policy flag lives specifically on the **Elite column's price**, confirmed reused from the same `flag_filled` component as Hotel. Rebuilt `.flight-card` and its descendants entirely to match this — see the CSS file header comment above `.flight-card` for the specific, called-out adaptations (100%-of-shell width instead of the source's exact 1200px; fare-tier names folded into each card since there's no shared list-level header here; the recommended-column accent bar rendered as a top border instead of a bottom bar flush to the card edge, to avoid gotcha #1's negative-margin/overflow trap).
2. **Wrong page structure → moved to dedicated pages.** Per `page-architecture.md`'s own rule ("where a screen has meaningful variants, prefer separate HTML files per variant"), Flight is not a section bolted onto the Hotel pages — it's `concept-a-tooltip-flight.html` and `concept-b-popover-flight.html`, each a full parallel page (Standalone sizes, Placement variants, In-context card, notes) mirroring its Hotel counterpart. The hub's single-card "Applied to Air SRP" teaser was removed; the hub now has two sibling sections — "Hotel — interaction concepts" and "Flight — interaction concepts" — each with its own Tooltip/Popover card pair.

**What's still genuinely proven, unchanged from the original goal:** the flag component itself (trigger, tooltip, popover, all five placement variants, the idle-dismiss/blur() logic) is 100% reused as-is between Hotel and Flight — nothing about `app.js` or the `.policy-tooltip`/`.policy-popover` CSS changed for this rebuild. Only the host card changed. The flight card's tooltip/popover still renders `OOP_DATA.flight`'s real **list**-format content (both violation reasons) via `.policy-tooltip__list`/`.policy-popover__list`, added in the first pass and still correct.

**Flag/price order is reversed from Hotel (caught in design review, 2026-09-28):** on Hotel's price block the flag icon comes *before* the price (`flag $459`). On Flight's Elite fare column it's the opposite — the price comes first, flag after (`$865 flag`). Fixed in the markup for all five in-context cards on both Concept A and B's flight pages. This is exactly the kind of per-card-type difference the reusability story has to tolerate: the flag component (trigger + tooltip/popover, unchanged) doesn't dictate its own position relative to the price text — that's the host card's layout decision, and it genuinely differs between the two real card patterns.

**Bug fix — the same inline-style override broke three of five placement variants on the flight card, fixed in two passes (caught in design review, 2026-09-28):** every in-context flight card panel (all 5 placement variants) carried an inline `style="left:auto; right:0;"` on the panel element — a leftover from an assumption that Below/Above needed a flush-right fallback to avoid overflowing the narrow fare column. That inline style has higher specificity than a class, so it silently overrode whatever the variant's own class actually wanted:
- **Left** — overrode `right: calc(100% + gap)`, forcing the panel flush against the trigger's *right* edge instead of opening beside its *left* edge. The panel ended up sitting directly on top of the flag icon, blocking clicks on it entirely.
- **Below and Above** — overrode `left: 50%; transform: translateX(-50%)` (the centered default), forcing the panel flush-right instead of centered on the trigger. Visually this read as "too far to the left" compared to the correctly-centered standalone examples earlier on the same page, since a flush-right anchor on a narrow, horizontally-centered fare column pushes a 260-300px-wide panel well past the column (and often past the adjacent fare columns) to the left.

(Hotel's in-context cards never had this bug — those panels' inline styles were set per-variant by hand, not generated uniformly across all five like Flight's were.) Fixed by removing the inline override from Left, Below, and Above's panels in both `concept-a-tooltip-flight.html` and `concept-b-popover-flight.html` — only Below-left/Above-left keep it, since `right: 0` is what they actually want. Confirmed via bounding-rect checks: Left now sits a clean 6-8px beside the trigger with zero overlap, and Below/Above's panel center now matches the trigger's center exactly, same as the standalone Placement section above them on the page.

## 14. Figma handoff notes

- **Tooltip (A)** is the closest match to an existing Sticker Sheet Tooltip component, if one exists — check before rebuilding from scratch.
- **Popover dialog (B)** is likely net-new — no obvious existing Sticker Sheet equivalent for an anchored, structured popover with its own header/close chrome. Flag as net-new work for whoever rebuilds this in Figma.
- Class naming: `flag-trigger` carries the `--sm`/`--md`/`--lg` size modifiers (icon dimension only). `policy-tooltip` and `policy-popover` have no size modifiers at all now — one Figma component/variant each, sized once, is enough; only the trigger needs a Size variant axis. `.hotel-card` and `.flight-card` are deliberately separate class families rather than a shared generic one — see `references/pattern-hotel-list-card.md`'s naming-discipline note.
- **Flight card maps to real, already-named Sticker Sheet components** per `references/pattern-flight-srp.md`, not net-new work: `Badge / Info` and `Badge / Eco-Friendy` (badge row), `Link / Standard` ("View details"), and **`flag_filled`** for the out-of-policy trigger itself — the same instance already used on Hotel's price block, confirmed reused here on the Elite fare column. The itinerary block (times/codes/cities/route line), the fare-tier columns, and the carrier row (`Carrier and Performance Info_RT`) are real named layers/components in the source file too — worth pulling those instances directly rather than rebuilding from this wireframe's approximation.

---

*Source: verbal design exploration request (2026-09-26) · Hotel SRP price-block flag pattern (existing product) · wireframes in this folder.*
