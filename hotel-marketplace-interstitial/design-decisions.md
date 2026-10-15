# Hotel marketplace value interstitial: Design decisions

Resolves the open UX questions from PRD-EGE-20261013 (section 15.1) and the design brief. Each decision is also reflected in the wireframes (see `index.html`), so this doc is the rationale, not a separate spec.

## 1. Where the interstitial lives

**Decision:** The SRP loading modal, shown after a user clicks search on the home page while the SRP loads (roughly 6 to 10 seconds). The PRD's "hotel page load" is this moment.

The modal exists to reduce perceived load time. Every concept keeps the control's footprint (453 x 568, radius 16, centered over a dimmed SRP) so the swap stays a content change, not a re-architecture (PRD assumption A2).

**Flag for follow-up:** Update the PRD wording from "hotel page load" to "SRP loading modal".

## 2. Claims that do not apply to every user

**Decision:** Default to wording that is true for everyone ("Negotiated rates, if your company has them", "Member rates, where your programs apply"). Do not hide or show claims by user.

The PRD puts personalization out of scope (section 10, item 4) and says claims must hold broadly or be reworded (R1). "True for everyone" wording satisfies both. The "PRD claims" toggle shows the stronger copy ("best prices", "your negotiated rates") so the team can see what legal and brand review would be approving.

**Flag for follow-up:** Strong wording needs substantiation (Dependency 5) before it can ship. Concepts A and B read differently under it. C and D change very little because they describe what was checked, not what was found.

## 3. The message must not make the wait feel longer

**Decision:** The control is a static illustration (no animation), a progress bar on a fixed timer, the title "Searching for hotels", and subtext that cycles through a list of actions. The progress bar, title and illustration stay as in control in B. The variant adds meaning to the wait without adding steps, buttons or reading that blocks anything. Closing is driven only by results being ready.

**Minimum display time:** None by default. The panel's minimum display toggle shows a longer minimum in red (+Ns longer than control), because the PRD requires the variant not to extend display time (section 7.1). A fast response (2s) is covered so a message is never forced to stay.

**Flag for follow-up:** If research shows the message needs time to be read, that is a trade-off against the guardrail and should be decided with the experiment owner, not in design alone.

**Note on B:** Because the control already cycles text on a timer, B is a content swap in an existing mechanism, not a new pattern. It could also interleave value lines with the real actions. The action list in the wireframe control is a placeholder, so replace it with the real list before comparing.

## 4. Repeat exposure (arrangers)

**Decision:** Repeat exposure gets a quieter form. A collapses to a static four-row list with no sequence. B stops rotating and shows one static line. C and D show everything lit from the start. The control's route illustration and progress bar remain.

Arrangers see this moment across many bookings, so animation and reading effort should drop on repeat. How the product knows an exposure is a repeat is an engineering question for later.

**Flag for follow-up:** Test with arrangers whether even the quiet form is irritating at high frequency.

## 5. Motion and reduced motion

**Decision:** Motion is limited to the progress bar, a single moving dot on the route, and short fades. With reduced motion on (the OS setting or the panel checkbox), spinners stop, fades become instant, and B shows one static line instead of rotating text.

Rotating text that updates by itself for more than five seconds would fail WCAG 2.2.2 (pause, stop, hide) if it carried information not available elsewhere. B's static line in reduced motion, and the screen reader description below, keep the content available without motion.

## 6. Screen reader and focus behavior

**Decision:**
- The modal is a dialog with a title and a hidden description summarizing everything the visual shows. Focus moves to the dialog when it opens.
- Rotating or sequenced text is hidden from assistive tech. The static description is read once instead of chattering as it changes.
- When results are ready the dialog closes and focus moves to the results heading ("Showing 128 hotels"), not back to the page top.
- The panel logs the announcements so the sequence can be reviewed without a screen reader.

**Flag for follow-up:** Confirm whether the current modal already meets WCAG 2.2 AA. The variant must at least match it (PRD section 16.2).

## 7. Variant failure

**Decision:** If the variant cannot render, show the control. The user sees what they see today, never a blank or error (PRD section 8). The panel's failure toggle demonstrates this with a visible fallback tag.

## 8. Mobile web

**Decision:** The variant is designed for desktop. Mobile web is secondary and likely keeps today's modal unchanged. In the prototype, the mobile viewport shows the current modal by default, with a "Preview variant" option to see how each concept would fit a phone if that changes.

This also simplifies the experiment: only desktop users are in the test, so the arm and exposure should be recorded for desktop only, and mobile web should be excluded from the analysis (PRD sections 4 and 5).

**Flag for follow-up:** Update the PRD and brief, which list "mobile versus desktop treatment" as open. Confirm the platform scope of the test with the experiment owner. If a mobile variant is wanted later, A, B, C and D all fit a 343 px modal without scrolling.

## 9. Which directions to take forward

**Recommendation for discussion, not a decision:**
- **B** is the cheapest test of the hypothesis and the safest for perceived speed. It is also the easiest to overlook.
- **A** gives the strongest evidence of breadth but asks the most of a user who is waiting.
- **C** is the best balance of visual and low reading, and avoids price or rate claims. It needs real source-type definitions.
- **D** is the only one that connects the wait to what the user sees next, and it overlaps with the "also exploring" direction of showing value in the results themselves.

A reasonable path is to prototype B and C against the control with real arrangers, and keep D as the follow-up if the hypothesis holds.

## 10. Direction D variations: providers, signals and user type

Three variations on D (badge preview), added after review feedback that D is the preferred direction.

**D1. Providers and rates.** Names the sources (Expedia, Booking.com, hotel chains direct) before showing the Negotiated and Member rate badges. Provider names are text stand-ins, not logos.
**D2. All the signals.** The mini card collects six signals in turn: Egencia preferred, negotiated, member rate, coworker bookings, colleague reviews, and a match to how you book. Coworker bookings and colleague reviews are existing SRP trust signals, so the promise matches what the user will see.
**D3. By user type.** The message is framed for travelers or arrangers. A "Viewing as" control includes Unknown, which falls back to generic wording.

**Decisions and flags**
- **Naming partners:** Showing Expedia and Booking.com is the most concrete proof of breadth, and also a brand and legal decision. Confirm the partnership allows named use in product, and whether logos or text only. This joins the claim substantiation work in Dependency 5.
- **Personalization is a scope conflict.** The PRD puts personalizing by company, traveler or program out of scope (section 10, item 4). "Matches how you book" in D2 and the role-based wording in D3 sit on that line. Wording that is true for everyone ("where they apply") stays in scope. Anything that depends on who the user is needs a PRD decision first. D3's Unknown fallback shows what the no-personalization version looks like.
- **Too many signals for a short wait:** D2 reveals six signals in a 6 to 10 second window. Reading time may conflict with the guardrail that the wait must not feel longer. Consider showing three and moving the rest to the results.
- **Repeat exposure:** In all three, repeat mode shows everything lit with no sequence.
- **Net-new:** the provider chip (D1), the signal pills and caption (D2), and the audience header and value row (D3). "Member rate" may be a net-new badge. Coworker bookings and colleague reviews mirror the existing hotel card.

**Recommendation for discussion:** D1 is the best candidate to test first, since it answers the stated doubt directly. D2 works better as a later step or as a feature of the results. D3 should wait until the personalization question is settled.

## Figma handoff notes

- Modal shell, progress bar, title and subtext map to the existing loading modal. Reuse the component instance.
- Route illustration is the real asset (`assets/route-illustration.png`), shown static as in the live modal. A, C and D replace it, B keeps it.
- Net-new: A's checklist row, C's source node and hub, D's mini result card and legend row.
- D's "Member rate" badge may be net-new. "Egencia preferred" and "Negotiated" mirror the SRP badge pattern.
- Spacing follows an 8px rhythm. Every color resolves to an Egencia token. Open Sans only.

---

*Source: PRD-EGE-20261013 and the design brief (2026-10-14) · reference screenshot of the current loading modal · wireframes in this folder.*
