# Hotel Mini Card Panel — Design Decisions

Resolves the open questions raised while building the dynamic 1–3 column panel. Each decision is reflected directly in the wireframes in this folder.

## 1. Column count is config-driven, not data-driven

**Decision:** Built as a manual "Columns: 1/2/3" toggle rather than something inferred live from how many sources actually returned results.

You explicitly called this out: column count is a business-rule/config signal, not something the demo should derive from live data availability. The toggle on `panel-layout-mechanics.html` lets you preview all three shapes on demand. Underlying semantics still track the real product logic for realism (1 column = only Featured has results; 2 = Featured + Egencia Preferred; 3 = all three) — swapping which datasets populate which state is a config decision for engineering, not a UI concern this wireframe needs to solve.

## 2. Same Mini Card width in every column state

**Decision:** The 1-column carousel and the 2/3-column vertical layout both use the identical 291px Mini Card — no separate "wide" card for the single-column case.

Three full cards plus a peek of a fourth fit naturally inside the 1200px content width at that fixed size, so there was no reason to introduce a second card width to maintain. Also keeps Figma handoff simpler: one card component, reused everywhere.

## 3. Peek height — settled on permanent, expands-on-interaction dropped

**Decision:** After comparing both side by side, the column peek height is permanent and fixed — it never grows. The expands-on-interaction alternative (an explicit "Show more" affordance in the fade) was built, reviewed, and dropped; that toggle and its markup/JS have been removed from `panel-layout-mechanics.html`.

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

## 8. "Recommended for you" variant — rebuilt a PM concept on real components, didn't reproduce its visual style

**Decision:** `srp-recommended-carousel-variant.html` keeps the PM's HTML concept's structure and content intent (one pinned "best match" hero card + a horizontal carousel of other featured rates, sitting above the unchanged full results list) but rebuilds it entirely in this deck's own system — real Egencia chrome, Open Sans, the established color tokens, and the existing Mini Card / Hotel Card / carousel components — rather than the mockup's own navy/Segoe UI/ad-hoc gray palette. This is a genuinely different shape from the 1/2/3-column panel elsewhere in this deck (one row with a single pinned card, not N parallel columns), kept as a separate page rather than a fourth column-count state.

Specific mappings from the PM's markup to this deck's system:
- "Recommended" / "Company Preferred" / "Negotiated Rate" / plain "Preferred" badges → the existing `.badge-recommended` / `.badge-company-preferred` / `.badge-negotiated` / `.badge-egencia-preferred` classes (no new badge types needed).
- The pinned card's teal border + "📌 PINNED" flag → a new `.hero-card` / `.hero-pin-flag` treatment using the existing `--positive` semantic token (not a new color — see #9 below for why that token now renders gray anyway), since nothing in this deck yet had a "hero" card at this width (320px, between the 291px Mini Card and the 663px Hotel Card).
- New optional signals added to the full results list, all built from existing tokens: `.eco-tag` (positive-green inline tag, distinct from the existing "Sustainability certified" cert line — these are two different claims), `.highlight-note` (a compact chip version of the existing perk-strip pattern), `.price-strike` + `.save-tag` (crossed-out price + savings), `.urgency` (negative-red scarcity messaging), and `.hotel-img-badge` (a badge overlaid directly on the thumbnail, as a second, independent badge-placement pattern alongside the existing card-edge `.hotel-badge-row`).

**Flag for follow-up:** This variant introduces a second badge-badge-placement convention (on-image vs. card-edge) and a second "featured card" width (320px hero vs. 291px Mini Card). Worth a deliberate call before Figma on whether both should survive into the real product, or whether one SRP concept (column panel vs. pinned+carousel) should win outright.

## 9. HTML/web wireframes are grayscale-only; Figma carries the real fidelity

**Decision:** Every color family in `styles.css` (`--c-accent1` through `--c-accent6`) now resolves to a gray ramp instead of the real Egencia blue/gold/green/red/orange hues — applied once at the `:root` level, so every page in this deck picked it up without touching a single HTML file or component rule. Semantic meaning (badge type, positive/negative, brand highlight) now reads through icon shape, label text, weight, and relative lightness instead of hue, which is how a real low-fi wireframe should read anyway.

This is a standing split going forward, not a one-off: the HTML/web wireframes in this deck are for structure and interaction review only, kept deliberately low-fi/gray; real look-and-feel work happens in Figma. The two builds in this folder's Figma file (the `SmartMix Panel` variant set and the `Card Skeleton`) stay in full high-fidelity color — that split is intentional, not an oversight if the two ever look inconsistent side by side.

**Flag for follow-up:** If new pages get added to this deck later, don't reach for the real color tokens by default — grayscale is now this deck's baseline until told otherwise.

## 10. Second "Recommended for you" placement — aligned with the map, not spanning full width

**Decision:** `srp-recommended-map-aligned-variant.html` keeps the same pinned-hero + carousel content as variant one, but moves the whole band to live *inside* `.srp-list` (the results column) as its first child, rather than as a full-width section above both the list and the map. Concretely: the band's top edge is now what the sticky map aligns against, so the map runs the full height of the band plus the plain list below it — instead of starting lower, at the same point the plain list would have started on its own.

No new CSS was needed for this — `.hero-card` and `.carousel-wrap` already sized themselves to their container, so narrowing that container (from the full ~1151px content width down to the ~700px results column) just means fewer carousel cards peek into view before the fade/scroll, which is the correct responsive behavior, not a bug to fix.

**Follow-up catch:** moving the band into `.srp-list` made that column taller than the map, but `.map-shell` had a fixed `height: 640px` and `.srp-body` used `align-items: start` — so the map stayed short and the results column overflowed it, and on first load the map was actually pushed fully out of view (a real CSS Grid min-width blowout in `.srp-list`, fixed with `min-width: 0`, same class of bug as the panel columns earlier in this project). Once that was fixed, the map was visible but noticeably shorter than the list. Resolved both by switching `.srp-body` to `align-items: stretch` and `.map-shell` to `min-height: 640px` (no fixed `height`), so the map now always matches whichever column is taller — across all three SRP pages that share this CSS, not just this variant. The placeholder map SVGs also needed `preserveAspectRatio="none"` added, otherwise the taller shell just letterboxed the graphic instead of filling it.

## 11. Figma: both new variants added as a new page, reusing the real full-page template

**Decision:** Both `srp-recommended-carousel-variant.html` (full-width) and `srp-recommended-map-aligned-variant.html` (map-aligned) were rebuilt in the shared Figma file on a new page ("Recommended For You — SRP Variants"), rather than inside the already-crowded "Updated component" page. Both started from a full clone of the existing "Hotel SRP - small-map" template already in that file (real header, search bar, filter pills, hotel list, interactive map, footer) with its embedded "SmartMix Panel" instance removed and replaced by a hand-built "Recommended for you" band: the real "Card" component (1:11745) instanced for the hero and every carousel card, a green stroke override + a small "Pinned" flag for the hero, a real Sticker Sheet "Button / Primary / Standard" instance for "Select," and the same chevron icon-button pattern used for the SmartMix Panel carousel earlier in this file.

For the map-aligned variant specifically: the filter-pills frame was shrunk back down now that the panel's gone, the band was placed as the first element of the results column, and the hotel list + map were both shifted so the map's top lines up with the band's top and its bottom lines up with the list's (now-shifted) bottom — mirroring the HTML version's `align-items: stretch` fix, but done by hand since Figma has no equivalent of CSS Grid stretch here.

**Gotcha worth remembering:** the map's outer wrapper is a Figma **GROUP**, not a frame. Calling `.resize()` on a group scales every child proportionally instead of just changing a clipping window — that's what briefly stretched the map-expand button into a distorted pill and scrambled its position. The fix was to resize the real **frame** and the background image *inside* the group (which behave normally) and leave the group's own size alone, then reposition the button with plain coordinates afterward. Also: setting a group child's `x`/`y` to a small value can silently shift the group's own reported bounding box (since a group's position is just the bounding box of its children) — reparenting the button to the top-level page frame instead of leaving it inside the group sidestepped that entirely.

**Flag for follow-up:** the hero card's "Select" button had to be placed *below* the real Card component instance rather than inline with its price row, since that instance's internal layout is locked (not auto-layout) and can't accept a new child. Worth a real component update if the pinned-card treatment is going to stick around.

## Figma handoff notes

- **Maps to existing patterns already captured in this skill:** the regular hotel card (`pattern-hotel-list-card.md`), the SRP chrome/search-bar/filter-bar (`pattern-hotel-srp.md`), all color/icon tokens (`color-tokens.md`, `icons.md`).
- **Net-new, no Sticker Sheet equivalent yet:** the Mini Card itself at this exact spec (291px, stacked single-column layout rather than the regular card's image+body+price row), the column peek/fade/"Show more" expand pattern, the carousel's peek-of-next-card affordance, and the 320px hero/pinned card treatment (now built in both HTML and Figma). Flag these for real component design in the Sticker Sheet.

---

*Source: real SRP screenshots (Seattle search, "tm vasudevan") · Figma "Hotel Mini Card - full data" frame (fileKey `58shpbRLtrjCvw0OLqI2od`, node `3597:31358`) · this skill's own `pattern-hotel-srp.md` / `pattern-hotel-list-card.md` / `color-tokens.md` / `icons.md` references · wireframes in this folder.*
