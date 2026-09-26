# Hotel Quick Results — Design Decisions

Resolves the questions these wireframes had to make a call on, given the approved [UX Spec](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447544), the [PRD](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447535) (v8), and the [Tech Spec](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447566). Each decision is reflected directly in the wireframes in this folder — this doc is the rationale, not a separate spec. Most product-level open questions were already closed by the UX spec; what's below is what the wireframe build itself had to resolve, plus one conflict worth flagging before Figma.

## 1. ⚠️ Amenity display — PRD and UX spec disagree

**Decision:** Show a compact 2-icon amenity row (e.g. Free WiFi, Breakfast included) on full-results-list cards only, not on SmartMix Panel cards.

The UX spec's decision log (2026-07-08) says amenities appear **nowhere on the card** — "depth better served on PDP," keeping cards lean. But PRD v8 (updated 2026-09-25, after the UX spec) makes card-level amenities a hard acceptance criterion in T3: *"Each hotel card on the results page displays key amenities"* and *"Amenity data is displayed for Expedia results in the first render wave."* These directly contradict each other.

This wireframe splits the difference rather than silently picking one: amenities appear on the wider full-list cards (where there's room and it doesn't compete with the panel's badges), but not on the narrower panel column cards (where the UX spec's "keep it lean" reasoning holds up best — the panel is already dense with badges/tooltips). The amenity-unavailable fallback (Cambria Hotel Chicago Loop in the full list) renders with no row at all, per T3's own guidance.

**Flag for follow-up:** This needs an explicit call from Wes/UX before Figma — either amend the UX spec's decision log to match PRD v8, or push back on PRD v8's T3 wording if the "lean card" reasoning should still hold. Don't let this ride into Figma unresolved.

## 2. Panel layout format — confirmed 3-column, naming updated

**Decision:** Recommended · Expedia Only · Neg/Pref, in that left-to-right order, matching the tech spec's ASCII layout diagram.

The PRD's §16 open question ("3-column panel vs. single ranked list + carousel") is resolved — the tech spec builds only the 3-column version, so that's what's wireframed. Column naming/order here supersedes the July 8 exploration decks (`hotel-hackathon-smartmix-concepts.html`, `hotel-smartmix-component-hackathon.html`), which used "Egencia Preferred / Company Preferred / Recommended" and put Recommended on the right. If those older files are still being referenced anywhere, they're now stale — this folder is the current source.

## 3. Cards per column (OTQ-2, still open in tech spec)

**Decision:** 4 visible cards per panel column in the standalone component wireframe, 3 in the full-page assembly (to keep the full page's scroll length reasonable alongside the full list + map).

Tech spec explicitly defers "number of cards per column (visible/scrollable)" to the UX spec, and the UX spec doesn't state a number either. This is a placeholder for review, not a final call — needs a real number once card density is tested against the Pref/Neg carousel cap (PRD §8a: 5–10 hotels) and actual result volumes.

**Flag for follow-up:** Confirm final per-column count with engineering — it affects `hotel-search-service`'s `RECOMMENDED`/`NEG_PREF` top-N response size.

## 4. Deduplication visual treatment — resolved as silent removal

**Decision:** No "shown above" indicator on the full list. A hotel already shown in a panel column simply doesn't reappear below — it's just gone.

The PRD flags this as its own open visual question (§16: *"mechanism is resolved... open question is purely visual: how, if at all, is this indicated to the traveler?"*). The UX spec's decision log doesn't address it directly, but its stated reasoning for the *source* toggle ("clean and transparent, avoids duplicate card clutter") points the same direction: don't add a second UI signal on top of an already-busy list. A "seen above ↑" tag would imply the traveler needs to reconcile two lists, which undercuts the whole point of the panel.

## 5. Expedia Only empty state

**Decision:** Compact centered message inside the column ("No Expedia-only inventory for this search") with a hotel icon, while the other two columns keep loading independently — matches PRD T1's acceptance criteria directly.

## 6. All-sources-fail global state

**Decision:** Replaces the entire panel shell with a single centered error block and a "Modify search" CTA, rather than three separately-erroring columns. Three redundant error messages side by side would be noisier than one clear one, and the PRD only requires *an* appropriate empty/error state, not per-column messaging in this failure mode.

## 7. Load-sequence timing shown in the demo

**Decision:** Compressed to demo-friendly delays (~0.8s / ~1.8s / ~3.2s between steps) rather than the real ~1–2s / ~2–4s / ~5–6s from the tech spec's latency table, so reviewers aren't sitting through a slow "Play" click. The on-screen note during playback states the *real* target latency at each step so the relative story (Expedia Only first, Neg/Pref last) still reads correctly.

## Figma handoff notes

- **Maps to existing Sticker Sheet components:** badge (`.badge-preferred`, `.badge-negotiated`, `.badge-smartmix`), button (`.btn-primary`, `.btn-secondary`), checkbox/filter controls, card shell, tooltip.
- **Net-new, no obvious Sticker Sheet equivalent:** the 3-column `SmartMix Panel` layout itself (independent per-column loading), the SmartMix tooltip's specific 1–3 reason-row content pattern, and the dedup "Also on…" source-toggle interaction on a card. Flag these for actual component design in Figma rather than assuming an instance swap will cover them.

---

*Source: [PRD (v8)](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447535) · [UX Spec (approved)](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447544) · [Tech Spec (draft)](https://confluence.amexgbt.com/pages/viewpage.action?pageId=672447566) · wireframes in this folder.*
