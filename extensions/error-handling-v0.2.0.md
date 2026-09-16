---
title: 'MMP Extension: Error Handling — Mesh Memory Protocol'
description: 'Failure as a first-class cognition event — publishing failed work with its evidence as an open corrective request, receiver-autonomous repair, separate grounding of failure and fix, and a proposed receiver-local Adaptation-on-Failure loop (gate vs. state). No wire-format changes.'
---

# MMP Extension: Error Handling

**Failure as a First-Class Cognition Event**

| | |
|---|---|
| Version | 0.2.0 |
| Status | Draft — Candidate Extension |
| Date | 24 July 2026 |
| Author | Hongwei Xu &lt;hongwei@sym.bot&gt;, SYM.BOT |
| Extends | [MMP v2.0](/spec/mmp) — application-layer convention over §6.7 (grounding), §9.2 (receiver-autonomous SVAF), and §13 (cognitive state); no changes to the wire format |
| Canonical URL | https://meshcognition.org/spec/mmp/extensions/error-handling |
| Licence | CC BY 4.0 (specification text) |

---

## 1. Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the MMP wire format and does not require an MMP version bump. Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §11 (Promotion Criteria). Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

**Maturity note (v0.2.0).** Sections §1–§5 and §9–§10 describe the failure-event convention, of which a reference deployment reports an experimental implementation (§10). Sections **§6–§8 — field-level accountability and the Adaptation-on-Failure loop — are a newer, lower-maturity addition: specified here but not part of any reported implementation, and not yet demonstrated.** Their promotion gate is an unrun, register-first experiment (the router-validation study, §11). Nothing in §6–§8 should be read as a shipped capability.

## 2. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals. Conformance is claimed by a **publisher** (the harness that publishes failure events) and by a **receiver** (a node that admits and may act on them).

## 3. Abstract

Agent frameworks conventionally treat failure as an exception to suppress: retry the same agent, fall back, or escalate. A retry that keeps the failed attempt inside its own control flow and records only the final result destroys three things the failure produced — the **evidence** (the failing check's output), the **record** (a repaired result becomes indistinguishable from a first-pass success), and the **choice of who fixes it** (pre-empted in favour of the agent that just failed). A deployment that assigns every repair to a fixed agent also bypasses receiver-autonomous volunteering for that repair.

This extension specifies the alternative: **failure is a cognition event**. A mechanically detected failure on a completed claim is published to the mesh as an ordinary CMB carrying its evidence, with the failed claim in its lineage. From there the protocol's existing machinery operates unchanged: every receiver's own admission (§9.2) judges relevance, an admitting agent may take the corrective as work — nobody assigns — and the failure and any subsequent fix ground as **separate** §6.7 outcomes against the claimer and the fixer respectively. A proposed extension of this loop (§6–§8) lets a failure also *change what a receiver admits or holds* — the admission-side adaptation the base convention names but does not define.

## 4. The failure event

When mechanical checks — executed and tallied by the harness outside the claimer's generation step — fail on a completion claim, the harness SHOULD publish a **corrective request CMB**:

- **lineage** — `lineage.parents` MUST contain the key of the failed completion claim. Parentage travels in lineage, never only in prose.
- **focus** — a plain statement that completed work failed its checks, followed by the **evidence** (§4.1), followed by bounded context from the original task.
- **intent** — `request`. The failure event is an *open invitation*, not an assignment.
- **commitment** — the acceptance criteria of the original work, carried **byte-for-byte inside a clearly delimited block**, so the *same criteria govern the fix* — repaired means repaired, by the original bar.
- **issue** — ordinary descriptive text (e.g. `check-failure`); it carries no normative routing semantics.
- **addressing** — the corrective request MUST be a room-bound broadcast with no directed recipient, so §9.2 receiver-autonomous delivery and admission remain operative.

### 4.1 Evidence

The event MUST carry the failed check identifiers together with their captured `stdout`/`stderr`, subject to an operator-configured, non-zero byte limit per stream; when either stream is shortened, the event MUST carry an explicit truncation indicator. The numeric limit is implementation-defined. (Conformance test: a known `stderr` sentinel survives publication intact; oversized output arrives marked truncated.)

### 4.2 What MUST NOT happen

- Publication of a failure event MUST NOT suppress the original completion claim or its `failed:` grounding (§5). Error handling never hides the error.
- The publisher MUST NOT route, rank, or assign the repair. Publication is mechanical duty; coordination belongs to admission.
- A completion whose only failed checks are **fabricable** — satisfiable by the claimer's own unverified action, such as bare file-existence checks — SHOULD NOT spawn a corrective event: there is no independent evidence to ground a fix on.

*Informative:* deployments typically also surface open, untaken correctives to a human operator through their normal attention surfaces; this document does not standardise that surface.

## 5. Grounding — the double record

The failure and the fix are **separate grounded outcomes**, each an ordinary §6.7 grounding CMB:

- the initial failure grounds against the **claimer**: a grounding CMB with a `failed:` commitment prefix whose `lineage.parents` names the original completion claim;
- a corrective's result grounds against the **fixer**: a grounding CMB with a `verified:` or `failed:` commitment prefix whose `lineage.parents` names the corrective completion.

Accountability follows the signed authors of those distinct CMBs. An implementation MUST NOT collapse the two into a single record: *who broke what and who fixed it* is precisely the signal a trust economy needs, and it is what a record-discarding retry destroys.

## 6. Field-level accountability (extends §5)

> **Status: proposed, not demonstrated (see §1 Maturity note).** §6–§8 specify a receiver-local adaptation loop that no reported implementation yet includes.

Beyond author grounding (§5), the receiver that was driven to failure by an admitted CMB SHOULD attribute the failure to the accountable **field(s)** of that CMB. This is what lets a failure act on the gate that admitted it, rather than only on the trust economy.

- **Accountability** `a(x, r)`: the semantic match between an admitted field's content `x` and the failure's root cause `r`, where `r` is derived from the §4.1 evidence (failed check identifiers, captured `stdout`/`stderr`) and the corrective's `focus`.
- The attribution MUST be validated by **counterfactual ablation**: re-evaluate the completed claim with the attributed field withheld. If the failure does not recur, accountability is confirmed; otherwise the attribution is rejected. Counterfactual ablation, not a model's self-reported root cause, is the normative guard — root-cause narration MAY confabulate.
- A confirmed attribution is recorded as a field-accountability entry grounded against the **admitting receiver's own policy** (distinct from the claimer/fixer author records of §5).

## 7. Adaptation on failure (fulfils "coordination belongs to admission")

> **Status: proposed, not demonstrated (see §1 Maturity note).**

A receiver holds two *distinct* mutable objects: its **SVAF admission weights** (the gate, §9.2) and its **cognitive state** (a local CfC liquid net, §13, which never crosses the wire). Admitted signals already evolve the state; the gate is, per the paper-1 gate audit, a hand-set static constant. So a failure has two possible learning targets, and the receiver MUST choose between them per failure. This is the admission-side adaptation §4.2 names ("coordination belongs to admission") but the base convention leaves undefined.

On a confirmed field accountability (§6), the receiver MUST route to **exactly one** adaptation, chosen receiver-locally, where the **competence-distance** `d(x, s)` is computed from the receiver's own §13.2 cognitive-state outputs (`trajectory`, `patterns`, `anomaly`, `coherence`) — how far the accountable field sits from what this receiver can hold.

- **(a) Admission adaptation (gate).** If `d` is large (the field is outside this receiver's competence), the receiver MUST decrement its per-field SVAF weight for that `(source, field)` (§9.2). The gate lowers; future such fields are rejected. This *records the receiver's boundary of responsibility*.
- **(b) State adaptation (cognitive state).** If `d` is small (the field is within reach but the state was unprepared), the receiver SHOULD ingest the field into its local cognitive state via the §13.6 `ingestSignal` API to evolve `h`, and MUST NOT modify the SVAF weight. This grows capability with the gate left open.

The two channels MUST NOT both fire on one failure event: boundary-learning (gate) and capability-learning (state) are separated so that *"not mine"* and *"mine, now handled"* remain distinct outcomes. The routing threshold on `d` is receiver-local and MUST NOT be assigned by any coordinator — §9.2 receiver-autonomy is preserved throughout; no coordinator is introduced anywhere in this loop.

**Circularity.** `d(x, s)` judges competence using `s` while `s` is itself being updated; an implementation MUST specify the reference state (the pre-update `s`) used for routing.

## 8. Validation, rollback, and exploration

> **Status: proposed, not demonstrated (see §1 Maturity note).**

- Every adaptation is **provisional and outcome-audited**: it is confirmed only by a subsequent reduction in same-class failures, and reverted otherwise.
- A state adaptation (§7b) that raises `anomaly` or lowers `coherence` beyond an operator-configured bound MUST be **rollback-able** (atomic). This makes state growth safe against catastrophic absorption.
- A gate decrement (§7a) MUST retain an **exploration allowance**: a decremented `(source, field)` is re-admitted at a bounded rate, so permanent rejection cannot foreclose the evidence that would reverse it. Without this, a boundary can only ever tighten — the abstention trap.

## 9. Depth rail

A corrective whose own checks fail MUST NOT spawn a further autonomous corrective. One level: a failed repair returns to human judgment. The bound comes from the grammar, not from a retry counter inside any agent.

**Exhaustion → boundary → open gap (proposed, §6–§8).** When the one-level limit is reached and a failure returns to human judgment, a receiver implementing §7 MUST also record a boundary decrement (§7a) for the accountable field: work the mesh could not hold leaves the receiver's responsibility and, having no taker, surfaces as an open gap — an unclaimed corrective request. That open gap is the trigger condition for a new capability to be admitted at the mesh scale.

## 10. Reference implementations

A reference deployment reports an experimental implementation as of 2026-07-13, in which a published failure event carrying captured `stderr` was taken by a *different* agent than the one that failed, a failed corrective stopped at the depth rail, and claimer and fixer were grounded separately. **That report covers §4–§5 and §9 only. The Adaptation-on-Failure loop (§6–§8) is specified here but is not part of any reported implementation; it is registered and awaits the router-validation study (§11).** Independent interoperability has not yet been established. A plain-English companion: [Failure Is a First-Class Cognition Event](https://sym.bot/blog/failure-first-class-cognition).

## 11. Promotion Criteria

Promotion of the **base convention (§4–§5, §9)** to **Published** status in the MMP §16 registry requires all of:

1. **A second independent implementation** — a distinct codebase not derived from the reference deployment, maintained by a different implementer.
2. **A cross-implementation conformance exchange** — a documented run in which a failure event published by one implementation is admitted and repaired by an agent of the other, demonstrating: evidence carriage with the truncation indicator (§4.1), lineage-borne parentage (§4), separate claimer/fixer grounding (§5), and the depth rail (§9).
3. **Review** — maintainer and community review of this document against the exchange results.

The **Adaptation-on-Failure loop (§6–§8)** carries a distinct, earlier promotion gate, and it is empirical, not interoperability-based:

4. **The router-validation study** — a register-first experiment showing that failure-driven routing lowers the exception rate while preserving coverage, with attribution confirmed by counterfactual ablation (§6) and a reference calibration of the `d` threshold (§7). Until this study passes, §6–§8 remain proposed and MUST NOT be reported as an implemented capability.

On promotion, the Status section is rewritten to **Published**, an Adopters list is added, and the §16.4 registry row is updated. No other sections change at promotion.
