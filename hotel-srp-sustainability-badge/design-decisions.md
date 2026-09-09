# Sustainability Certified Badge — Design Decisions

Resolves the open UX questions from the PRD (section 16) and the UX-spec interview. Each decision is also reflected directly in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Icon concept

**Decision:** Don't pick one direction yet. Ship both candidates — Concept A (seal/checkmark, standing in for a future ribbon/award icon) and Concept B (handshake) — and resolve via usability testing before build. The PRD's own risk note flags icon redesign as a launch-timeline risk if not scoped early, so both concepts are built out fully rather than left as static mockups.

A real ribbon/seal glyph doesn't exist yet in the icon token set — Concept A substitutes the closest available checkmark-in-circle glyph. Adding the literal ribbon/seal icon is a named PRD dependency owned by the UX design team, not something to invent here.

## 2. Tooltip trigger

**Decision:** Concept A and B are click/tap only — no hover preview, straight to the side sheet on click. Concept C is the exception: it's the established text-link + info-icon pattern ("this is how we do it"), where hovering or focusing either the link text or the circle-i icon reveals a tooltip. Keyboard focus reveals it the same way on desktop; on touch, tapping the link or icon focuses it, which triggers the same reveal (no separate hover-only path that touch can't replicate).

## 2a. Concept C — info link, no side sheet

**Decision:** A third concept: a plain text link ("Sustainability certified") with a circle-i info icon to its right, both inside one hoverable/focusable group. This concept has no side sheet at all, so for multi-certification hotels the tooltip lists every certification directly (stacked, one per line) rather than a primary name plus a "view all" hint — there's nowhere else for "view all" to go.

## 3. Multi-certification display

**Decision:** The tooltip shows the primary certification name, plus a "+N more — click to view all" hint when a hotel carries more than one. Clicking or tapping the badge always opens a side sheet with the full list — this scales cleanly to any number of certifications without cramming them into a tooltip.

## 4. Filter placement

**Decision:** The real filter lives nested under the existing Amenities/Property category in the filter panel, not as a new top-level toggle — keeps the filter panel from growing with every new attribute. The wireframes here use a flat chip as a stand-in, since building the full nested filter panel isn't the point of this exploration; the chip is still wired to actually filter the list so the interaction can be felt.

## 5. Empty state

**Decision:** Reuse the product's standard zero-results empty-state pattern with copy specific to this filter, rather than a bespoke design. Filtering to certified-only when only two of four hotels qualify (Park Central and The Manhattan Club aren't certified) demonstrates the fail-closed badge behavior at the same time.

## 6. Badge fail-closed behavior

**Decision:** No manually maintained override list — the badge only renders when the feed flags a hotel certified, and it fails closed (no badge) on a data gap or feed timeout, per the PRD's Risk/Sustainability Officer story. Park Central Hotel New York and The Manhattan Club show no badge in every wireframe to make this visible, not just described.

---

*Source: PRD — Hotel Search Results Page — Eco-friendly Badge to Sustainability Certified (Confluence, pageId 691805451) · UX Spec (Confluence, pageId 705497684) · wireframes in this folder.*
