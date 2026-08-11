---
brief_id: 2026-08-11-context-keeper
author: Wes Noel (on behalf of Somiya)
date: 2026-08-11
status: Draft
solution: egencia
product_area: internal engineering tooling / personal productivity (not covered by existing product-area knowledge)
design_tier: 2
design_tier_source: ai-recommended
version: v20260811T2040Z
downstream: []
---

# Design Brief: Context Keeper

## § 1 — Problem Statement
Somiya, a front-end developer, wants to be more on top of her work when she switches between tasks — whether she's pulled into a Slack support question or moving between tickets in the normal course of the day. Re-orienting after a switch takes real time, and the cost varies from a small tax to a bigger disruption depending on time of day and the complexity of the project she's in. Today, picking back up means piecing things together across notes, Slack history, and her own recall of where things stood — a process that works, but takes more manual effort than it should. This is a real, daily pattern, but it's self-reported rather than backed by hard data or a flagged incident: it's best framed as a personal efficiency and well-being goal (staying more organized and less scattered under constant task-switching) rather than a response to a visible crisis.

## § 2 — Target Audience / Affected Personas
| Persona | P/S | Journey stage impacted |
|---------|-----|------------------------|
| Somiya — Front-end Developer | P | Daily dev workflow: ticket switching, UI discovery with designers, self-review prep |
| Designers she collaborates with | S | Discovery-phase handoff |
| Her manager | S | Self-review / performance conversations |

**User empathy statement**
> I am **Somiya, a front-end developer**.
> I'm trying to **move through my daily ticket work without losing momentum**.
> But **every time I'm pulled into a Slack question or switch between tasks, staying on top of where things stand takes more manual effort than it should — piecing it back together across notes, Slack history, and my own recall**.
> Because **I don't yet have a reliable, low-effort way to capture and pick back up my working context when I step away from something**.
> Which makes me feel **like I could be more efficient and more in control than I currently am, if the tracking part weren't so manual**.

## § 3 — Design Hypothesis
> We believe giving Somiya a low-friction, always-at-hand way to capture and pick back up her working context — pulling together what's currently scattered across Slack and Jira — could help her cut the daily cost of task-switching and passively build a record of completed work for self-review, because the only way this becomes real is if logging context takes seconds, not minutes, so it fits naturally into her actual process rather than becoming one more manual habit to maintain. We'll know we're heading right if she keeps it updated as a natural part of her workflow, without needing to think about it — and we'll know we're off track if updating it starts to feel like overhead rather than something that's actually saving her time.

*Also exploring:* none — the case for Context Keeper's specific scope (unifying context + completed-work tracking, not solving either piece alone) was made directly rather than surfacing a cheaper alternative.

## § 4 — Desired Outcomes
- Somiya can step away from a task and return to find exactly where things stand, without having to manually piece it back together.
- She spends less time cross-referencing Slack history and scattered notes to stay oriented.
- Decisions, open questions, and next steps get captured in the moment, so nothing has to be tracked down later across tools.
- She can answer a Slack question and return to her main task smoothly, without that switch costing her extra re-orientation time.

## § 5 — Objectives
**Primary:** Reduce the time and mental cost Somiya pays every time she switches tasks or context, so ticket turnaround improves without adding to her workload.
**Secondary:** Give her a low-effort, always-current record for self-review conversations.

**KPIs to improve:** Time-to-resume after a task switch; ticket cycle time / discovery-phase duration; self-review prep effort.
**KPIs to protect:** Logging itself becoming a new time sink; informal knowledge-sharing moments in Slack (should not decline as a side effect).

**Business intent:** Faster ticket turnaround, general team efficiency, better-documented performance reviews.
**Commercial anti-goal:** None identified — explicitly considered; if Somiya wins, the team wins.

### Measurement Plan *(via `/sdlc-design-metrics`)*

**Design Intent → Metric Mapping**

| Intent | Expected behavior change | Metric | Direction | Method | Baseline | Target | Timeframe |
|---|---|---|---|---|---|---|---|
| Cut the cost of task-switching | Somiya re-orients to a task faster after a switch | Time-to-resume after a switch | ↓ | Self-timed spot checks (a handful of switches/week) | Unmeasured — today it's self-reported as "minutes to a larger derailment" | Consistently under ~30 seconds to re-orient using a card, vs. today's variable minutes-to-hours | 2 weeks of personal use |
| Faster ticket turnaround | Less time lost during discovery/switching shows up in real ticket data | Ticket cycle time / discovery-phase duration | ↓ | Pull from existing Jira timestamps — no new instrumentation needed | Her current average cycle time (last 4-6 tickets) | Modest, credible reduction (~10-15%), not a dramatic swing | 4-8 weeks (~1-2 sprints) |
| Effortless self-review prep | The log already contains what she'd otherwise write from scratch | Self-review prep time/effort | ↓ | Self-rated (time spent compiling notes before a review) | Whatever she currently spends before a review cycle | Near-zero *additional* time — prep becomes "read the log," not "reconstruct the quarter" | Next self-review cycle |

**Primary Success Metrics**

1. **Time-to-resume after a switch** — Direct causal link to the core hypothesis. Tracked via manual self-timed samples. Caveat: self-timing is approximate; Somiya is both subject and instrument, which is fine for a personal tool.
2. **Ticket cycle time / discovery-phase duration** — Indirect but real; the metric a business stakeholder would ask about. Tracked via Jira (already instrumented). Caveat: many confounds (ticket complexity, designer availability) — directional, not proof.
3. **Self-review prep effort** — Direct link to the accomplishment-log half of the hypothesis. Self-rated, one data point per review cycle. Caveat: low sample rate — reviews are infrequent, so this is a slow-feedback metric.

**Secondary Metrics to Watch**

| Metric | Watch for | Why |
|---|---|---|
| Daily tool usage | Whether she opens/updates it without being reminded | Directly tests the hypothesis's own falsifier (missed/skipped updates) |
| Cards created/updated per day | Volume trending down after week 1 | Early warning sign before the evaluation window closes |
| Win/praise entries logged over time | Whether tagging wins happens passively, or gets skipped | Tests whether the "accomplishment log" bonus is really passive |

**Guardrail metrics (should NOT move):**
- **Logging overhead** — time spent maintaining the tool itself should stay negligible.
- **Informal Slack knowledge-sharing** — should not decline (the one anti-goal candidate raised above, even though none was identified as likely).

**Instrumentation Plan**

Single-user hackathon prototype, no analytics pipeline — instrumentation stays cheap and self-contained, no backend required.
- **New events** (addable directly in the existing prototype's JS, logged to a JSON array in `localStorage`): `card_created`, `card_status_changed` (from/to + timestamp), `win_tagged`, `card_opened`. Would let time-to-resume move from spot checks toward a real open→first-edit delta.
- **Existing data to reuse:** Jira ticket timestamps — already exist, already give ticket cycle time for free.
- **Qual touchpoint:** a lightweight weekly self-rating ("how much did switching cost bug you today, 1-5") — could live as one extra field in the tool itself.

**Evaluation Plan**
- **Early signal (weeks 1-2):** Is she opening/updating cards daily without a reminder? Dropping usage or logging-as-overhead is the falsifier from § 3 — revisit the interaction model, not the concept, if this trips.
- **Primary evaluation (weeks 4-8):** Compare ticket cycle time against baseline, review resume-time samples, check both guardrails.
- **Long-term (next self-review cycle):** Does the log measurably cut prep time and improve what she brings to the conversation?

**Measurement Gaps**

| Valuable metric | Why untrackable now | How to close |
|---|---|---|
| Precise time-to-resume (not just spot checks) | No event logging yet | Add the `card_opened`/first-edit-delta events above if this moves past hackathon stage |
| True cost of *not* having this (counterfactual) | No baseline data existed before today | Can't be closed retroactively |
| Slack response disruption cost | No access to Slack analytics | Stays self-reported unless this becomes a sanctioned team tool with proper access |
| Cross-user comparison | n=1 (Somiya only) | Only closes if/when this expands to the team-wide phase (§ 6) |

**Dual-customer check:** No tension identified between Somiya's win and the business's, consistent with the anti-goal answer above. The one place a regression could hide is the Slack guardrail, called out explicitly rather than assumed away.

## § 6 — Constraints & Challenges
- **Target date:** Rough working prototype needed today — this is for a UX Day hackathon.
- **Scope:** Single-user (Somiya only) for now, framed as a personal project — not a funded team-wide initiative yet, though team-wide rollout is a plausible future phase.
- **V1 entry model:** Human/manual entry only — no live Slack/Jira data pulls in this phase.
- **Future extensibility:** Architecture should not preclude future plugin/API connectors or AI Skill integrations once the concept is proven, but none of that is built now.
- **Privacy:** No new policy needed — data handling expectations follow existing internal-tool norms (comparable to Slack or Workday).

## § 7 — Useful Resources
- None provided beyond the original interview notes with Somiya.
- Note: SDLC task tracking (`create_task`) was unavailable this session (`AGENT_CODE_INVALID` for this workflow/agent combination) — this brief was produced and saved locally without a linked SDLC task record.

## § 8 — References & Inspirations
- **Notion** — flexible, low-friction block-based capture; relevant to how a "context card" might feel to fill out.
- **Trello** — card-based, at-a-glance visual tracking; relevant to how tasks/context cards might be organized and switched between.

## § 9 — Context from Solution Knowledge
No product-area knowledge file applies. The egencia product knowledge base (`knowledge/solutions/egencia/product/`) covers only the customer-facing trip-booking product (trip-webapp); this brief concerns an internal engineering-productivity tool for a single employee, which sits outside that knowledge domain. All context here comes directly from the interview and this conversation, not from existing product documentation.

## § 10 — AI-Recommended UX Tier
**Recommended Tier 2: Involved** *(🤖 AI recommendation — not author-set)*

This is a greenfield surface, not a modification of an existing egencia product screen — it doesn't inherit an existing pattern to reuse, and it's a genuinely new space rather than a change within an existing one. Both signals push the score up. Scope pulls it back down: single persona, internal-only, no revenue or compliance exposure, explicitly framed as a personal hackathon project today. Between a light-touch Tier 1 and a more involved Tier 2, the rubric directs recommending the higher score when in doubt. Required UX involvement: involved, though in practice this can stay lightweight given the low current stakes. If this expands to a team-wide tool later, expect this to move to Tier 3 given the broader persona impact.

*This recommendation guides UX engagement. It can be redefined by the design team during prototyping or by editing this document directly.*

## § 11 — Open Questions
1. What specific interaction pattern achieves near-zero-friction manual context capture — one that fits naturally into a busy day rather than becoming one more thing to maintain? → `prototype`

## § 12 — Explicit Out of Scope
- Slack support-question triage/deflection (the rejected "Slack Support Deflector" concept) — not part of this build.
- Team-wide rollout, permissions, or admin features — single-user only for now.
- Automatic sharing of self-review notes with her manager — the log stays hers to pull from, not a manager-facing dashboard.
- Automated/live integrations with Slack or Jira (auto-pulling messages or tickets) — v1 relies on manual entry.
- New privacy/compliance policy work — treated under existing internal-tool norms.

## § 13 — Adjacent Initiatives
- None identified.

## § 14 — Downstream Artifacts
*(none yet)*
