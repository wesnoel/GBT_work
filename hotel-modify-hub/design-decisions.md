# Hotel Modify Hub: landing page concepts

Source: PRD-EGE-20261117-3 (Hotel Modify UX Refresh) and the published UX spec. Scope: Hub landing page only, three concepts. Downstream flows are not built.

## Decisions carried from the UX spec
- Hub has three entries: Soft changes (Name, Special request, Loyalty program), Date, Room. Five change types stay reachable.
- A change type that is unavailable for a booking is shown disabled with a visible reason, never hidden.
- A booking that cannot be modified shows one notice and no change options, with a way back to the trip.
- Arranger and Counselor see who they are acting for on the page, using the existing site pattern.
- Success lands on the Trips page, and the Hub's entry is the trip details page, both out of scope.

## Decisions made in these concepts
| # | Decision | Why |
|---|---|---|
| 1 | Price impact is shown as a pill ("No price change", "May change price"), in text, not only color. | Users need to know the stakes before they enter a hard change. Text satisfies the color-alone rule. |
| 2 | Soft changes are exposed as three named rows (A, B) or a three-line preview (C). | Keeps the three-flow model while keeping Name, Special request and Loyalty visible for analytics and for users who know what they want. |
| 3 | The disabled Date option stays focusable and announces `aria-disabled`. Clicking explains instead of doing nothing. | Disabled controls that are skipped by keyboard hide the reason. |
| 4 | The booking summary is always visible. | Arrangers and Counselors edit bookings they did not make and need to confirm the right one. |

## Open questions
1. **Hub card wording and the PRD.** The PRD says five types on the Hub (AC-S1). These concepts show three entries. Needs the PRD wording updated (Q7 in the UX spec).
2. **Real unavailability reasons.** "This rate can't be changed" is a placeholder. Real reasons come from today's rules.
3. **Price impact copy.** "May change price" is generic. Confirm whether the Hub can know in advance, for example when a Room change is always priced differently.
4. **Traveler context pattern.** The banner is a stand-in for the existing site pattern for signed-in user plus arranged-for traveler (PRD A6). Replace with the real component.
5. **Counselor entry.** Confirm Counselors reach the same Hub from trip details and not from a separate tool.
6. **Concept choice.** Recommendation is to test A and B with Arrangers and Counselors, who repeat this task, and C with Travelers, who do it rarely.

## Concept trade-offs
| | A: Cards | B: Editable list | C: Guided choice |
|---|---|---|---|
| Clicks to start a soft edit | 1 | 1 | 2 |
| Price impact visible up front | Pill per card | Group header | Pill plus preview |
| Room to add new options later (switch hotel, transfer) | Add a card | Add a row or group | Add a tile |
| Scans well for repeat users | Good | Best | Fair |
| Clearest for rare users | Good | Fair | Best |

## Soft changes flow (built from Concept A)
Opens from the Guest details card. Each row on the card deep links to its section. `soft-changes.html`, with a stand-in `trips-stub.html` for the success destination.

| # | Decision | Why |
|---|---|---|
| S1 | One page, three sections. Each shows the current value with an Edit button and expands in place. | Matches the three-flow model. A user changing one thing never sees three forms. |
| S2 | Only edited sections are validated and saved. Edited sections get a blue left border and the hint changes to "Only the sections you changed will be saved." | Makes the scope of the save visible. |
| S3 | Save uses `aria-disabled` with visible hint text until something is edited, rather than a truly disabled button. | The spec has a conflict: section 4.3 says Save is available once a section is edited, section 6 says never disable an untouched form. This keeps the reason visible and the button focusable. Needs a ruling. |
| S4 | Validation errors appear under the field and in a summary at the top that receives focus and links to each field. Sections with errors open automatically. | Satisfies WCAG 3.3.1 and 3.3.3 and avoids hidden errors in collapsed sections. |
| S5 | Failed save shows an alert banner, moves focus to it, keeps every entered value, and offers Try again. | Decision D2 (retry in place). |
| S6 | Cancel and the back link open a "Discard your changes?" dialog only when something is edited. | Assumed checkout pattern (Q3). Confirm. |
| S7 | Success goes to the Trips stub with a proposed message naming the sections saved. | Decision D4. The message itself is open question Q2. |

Open items from this flow
- **Real validation rules.** Name letters-only and member number 9 to 12 digits are placeholders. Replace with today's rules.
- **Partial failure.** If one section fails on the backend when several are saved together (Q8). The wireframe treats a save as all or nothing.
- **Program list.** The loyalty program options are sample data.
