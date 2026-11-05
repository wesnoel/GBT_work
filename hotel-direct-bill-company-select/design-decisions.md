# Hotel direct bill configuration: company selection and status

Source: PRD-EGE-20261030-2 and the published UX spec (Confluence page 363794007). Fidelity: grayscale, medium interactive. Open `index.html`.

## Resolved

1. **Hybrid selection.** With no company in context the card shows a focused search and an empty table placeholder. After a choice, the search collapses into a company bar (name, ID, country and POS, Change, status). Change swaps the name for the same combobox in place.
2. **Typeahead matches the current admin one.** Rows read "Name (ID)", matching name or ID prefix, first row highlighted, keyboard and pointer both work. The wireframe starts at 2 characters. Confirm against the live component.
3. **Status badge.** Lives in the company bar, labeled "Direct Bill for Hotel". On is a filled pill with a check. Off is an outlined pill with a dash. Status unavailable is a dashed pill with a warning icon plus a Retry link. Loading is a neutral skeleton, never a guessed value.
4. **Retry** re-fetches only the status. The table, Add hotel and edit keep working.
5. **Switching with unsaved changes** opens a "Discard changes?" dialog only when the Add hotel or edit form is dirty. Esc and Keep editing stay put. Discard and switch moves focus to the new company name.
6. **Reload keeps the company.** The wireframe stores the choice in localStorage. Use Reset to zero state to see the start again.
7. **Company already in context** skips selection (use "Arrive with a company in context"). The header then shows the company, as it does today.
8. **Type scale** uses Egencia tokens: title 22/30, company name 18/24, body and table 14/18, labels, helper and badges 12/16.

## Flagged for follow-up

- **Retry link and dirty-form dialog** go beyond the PRD. Need PM confirmation.
- **Label wording:** the page says "Direct Bill for Hotel" (PRD) while the GAT link says "Direct Bill for Lodging".
- **Search scope:** the wireframe lists North America companies only, since other POS are out of scope. The live search source (D3) may return others. Decide whether to filter or show them disabled.
- **Header company line** is not updated by choosing a company on this page in the wireframe. Confirm whether it should be (assumption A1).
- **Result count and minimum characters** depend on spike EGE-646668.
