# Hotel Mini Card Panel — Design Decisions

Resolves the open questions raised while building the dynamic 1–3 column panel. Each decision is reflected directly in the wireframes in this folder.

## 1. Column count is config-driven, not data-driven

**Decision:** Built as a manual "Columns: 1/2/3" toggle rather than something inferred live from how many sources actually returned results.

You explicitly called this out: column count is a business-rule/config signal, not something the demo should derive from live data availability. The toggle on `panel-layout-mechanics.html` lets you preview all three shapes on demand. Underlying semantics still track the real product logic for realism (1 column = only Featured has results; 2 = Featured + Egencia Preferred; 3 = all three) — swapping which datasets populate which state is a config decision for engineering, not a UI concern this wireframe needs to solve.

## 2. Same Mini Card width in every column state

**Decision:** The 1-column carousel and the 2/3-column vertical layout both use the identical 291px Mini Card — no separate "wide" card for the single-column case.

Three full cards plus a peek of a fourth fit naturally inside the 1200px content width at that fixed size, so there was no reason to introduce a second card width to maintain. Also keeps Figma handoff simpler: one card component, reused everywhere.

## 3. Peek height — both variants built, no final pick yet

**Decision:** Built both permanent-peek and expands-on-interaction as live, toggleable behaviors on the same page rather than converging on one.

You asked to see both side by side before deciding, so this is deliberately left open — pick one after reviewing `panel-layout-mechanics.html`. Implementation note: "expands on interaction" is triggered by an explicit "Show more" affordance in the fade at the bottom of the column (not a bare scroll-detection heuristic) — more discoverable and accessible than inferring intent from a scroll event, and it doubles as the same control that collapses the column back down ("Show less").

## 4. Carousel controls: arrows + drag/swipe

**Decision:** Visible prev/next arrows (disabled at the ends) plus native pointer-based drag/swipe, snapping to card edges. Confirmed per your answer.

## 5. Mini Card required floor vs. optional slots — per your explicit content rules

**Decision:** Every card, regardless of data richness, always shows: thumbnail, name, star rating (3–4★ for these examples), distance, a Reviews section (public score line required; Colleague Reviews line optional), and the price block (price + "$X w taxes and fees") pinned to the bottom of the card. Everything else — badges, sustainability cert, coworker %, perk strip, payment/CVV notes — may or may not appear.

This supersedes an earlier pass where "minimal data" dropped the Reviews box and treated the taxes line as optional — corrected across every card in `component-mini-card.html`, `panel-layout-mechanics.html`, and `srp-integration.html` (29 card instances total) once you clarified the required floor. Implementation: `.mini-card` and `.mini-real` are now a flex column, and `.mini-price-block` uses `margin-top: auto` to push itself to the bottom regardless of how much optional content sits above it — this also means cards in the same row (carousel, or side-by-side columns) stretch to equal height and their price lines align across the row, even when their optional content differs a lot.

I still couldn't locate the "Hotel Mini Card - minimal data" frame in your Figma file — it wasn't under either page the file's metadata index returned (`Hotel SRP` / `Hotel SRP Map expand + interactions`), most likely because the Figma-desktop bridge only sees pages currently open as tabs, not the full file. The rules above came from you directly rather than a Figma pull.

**Flag for follow-up:** Send the frame's direct link (or select it in Figma desktop) and I'll true up the exact spacing/copy against the real reference.

## 6. Company Preferred badge — corrected a copy bug, not reproduced it

**Decision:** Badge and column header both read "Company Preferred." Your reference screenshot's actual card renders "Chat bhandar Preferred" on the badge itself (while the column header correctly says "Company Preferred") — that mismatch reads like a leftover placeholder/localization-key string bug in the live product, not intentional copy, so it wasn't reproduced here.

**Flag for follow-up:** Worth passing to engineering as a live bug independent of this design work.

## 7. Amenity/field variance across cards

**Decision:** Rather than build every card at full-data or minimal-data, the panel and SRP-integration pages deliberately mix realistic partial states (some cards with just a perk strip, some with just a reviews box, some fully bare) — matching your note that "most cards will not have all the data points" and that there's real variance in what's available per hotel.

## Figma handoff notes

- **Maps to existing patterns already captured in this skill:** the regular hotel card (`pattern-hotel-list-card.md`), the SRP chrome/search-bar/filter-bar (`pattern-hotel-srp.md`), all color/icon tokens (`color-tokens.md`, `icons.md`).
- **Net-new, no Sticker Sheet equivalent yet:** the Mini Card itself at this exact spec (291px, stacked single-column layout rather than the regular card's image+body+price row), the column peek/fade/"Show more" expand pattern, and the carousel's peek-of-next-card affordance. Flag these for real component design in Figma.

---

*Source: real SRP screenshots (Seattle search, "tm vasudevan") · Figma "Hotel Mini Card - full data" frame (fileKey `58shpbRLtrjCvw0OLqI2od`, node `3597:31358`) · this skill's own `pattern-hotel-srp.md` / `pattern-hotel-list-card.md` / `color-tokens.md` / `icons.md` references · wireframes in this folder.*
