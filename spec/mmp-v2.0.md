# Mesh Memory Protocol (MMP) v2.0

> A Mesh Protocol for Collective Intelligence
>
> **Version:** 2.0  ·  **Published:** 27 March 2026  ·  **Last updated:** 13 August 2026  ·  **Editor:** Hongwei Xu  ·  **License:** CC BY 4.0
>
> **Canonical:** https://meshcognition.org/spec/mmp  ·  **arXiv:** https://arxiv.org/abs/2604.19540

---

## Contents

1. [Overview](#overview)
2. [Change Log](#change-log)
3. [1. Conventions](#1-conventions)
4. [2. Architecture](#2-architecture)
5. [3. Identity (L0)](#3-identity-l0)
6. [4. Transport (L1)](#4-transport-l1)
7. [5. Connection (L2)](#5-connection-l2)
8. [6. Memory (L3)](#6-memory-l3)
9. [7. Frame Types](#7-frame-types)
10. [8. CMBs (CAT7)](#8-cmbs-cat7)
11. [8.8 Record Model](#8-8-record-model)
12. [9. Coupling & SVAF (L4)](#9-coupling-svaf-l4)
13. [10. State Blending](#10-state-blending)
14. [11. Feedback Modulation](#11-feedback-modulation)
15. [12. Synthetic Memory (L5)](#12-synthetic-memory-l5)
16. [13. Cognitive State (L6)](#13-cognitive-state-l6)
17. [14. Application (L7)](#14-application-l7)
18. [15. Remix](#15-remix)
19. [16. Extensions](#16-extensions)
20. [17. Conformance](#17-conformance)
21. [18. Security](#18-security)
22. [19. Configuration](#19-configuration)
23. [20. JSON Schema](#20-json-schema)
24. [21. References](#21-references)

---



---

<!-- Overview -->

Protocol Specification

# Mesh Memory Protocol (MMP)

A Mesh Protocol for Collective Intelligence

Version

2.0

Status

Published · v2.0 conformance correction in progress

First published

27 March 2026

This version

13 August 2026

Author

Hongwei Xu <editor@meshcognition.org>

Organisation

SYM.BOT

Canonical URL

[https://meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)

Licence

CC BY 4.0 (specification text); Apache 2.0 (reference implementations)

## Introduction

Multi-agent LLM systems in production coordinate cognitive work on shared tasks spanning hours, days, and weeks — generator/quality/auditor pipelines running for days; research investigations spanning weeks across session restarts; a coding agent, a music agent, and a fitness agent serving the same user where no single agent connects “commits slowing” + “tracks skipped” + “3 hours without movement” into “the user is fatigued.” That insight requires structured collective intelligence — and the semantic-integration layer of agent communication is, today, unaddressed.

Existing protocols at lower layers standardize tool access and task delegation between agents. What each receiver does with incoming observations from a peer — receiver-autonomous admission, signal-level lineage, filtering at acceptance time — is the missing layer. The Mesh Memory Protocol specifies that layer through five composable primitives: **CAT7**, a fixed seven-category schema for every Cognitive Memory Block; **[SVAF](/spec/mmp/coupling)**, per-category evaluation against the receiver’s role-indexed anchors, on which it decides admission for itself; **content-hash lineage**, so every claim is traceable to its source observation; **remix**, where receivers store only their own evaluated understanding of accepted blocks, never raw peer signals; and **[grounding](/spec/mmp/memory#grounding)**, real-world outcomes carried by lineage — so the mesh records not only what its members _believe_ but what _held up in practice_, and the cognition that survives both judgment and reality persists as the Canon.

The problem is semantic, not transport. **Hidden state never crosses the wire** — each agent’s learned cognition stays sovereign on its own device; only Cognitive Memory Blocks (CMBs) propagate. Receiver-autonomous admission lets the mesh grow without re-introducing a master. MMP defines transport over TCP on local networks and WebSocket for internet relay, with length-prefixed JSON as the canonical wire format. Discovery uses DNS-SD (Bonjour) with zero configuration.

This document describes an 8-layer stack, but it is **two documents in one**, and is read that way (§17). **MMP Core** is the normative wire contract — identity, transport, connection, frames, the CAT7 block with its content address and signature — byte-testable against published Class 1 conformance vectors (Class 1, §17.1). Everything receiver-side — SVAF admission, memory tiers, remix behavior, the cognitive layers that together implement [Mesh Cognition](/spec/mmp/architecture) — is a **public behavioural profile** (Class 2, §17.2). SYM provides an open, transparent baseline implementation. xmesh-core is a proprietary cognition runtime whose public inputs, outputs, safety invariants and audit behaviour are required to pass this same specification before conformance is claimed (§17.6). A private scoring method does not define private wire semantics. Each page identifies whether it states a wire requirement, a behavioural invariant, an implementation profile or an informative research claim.

This specification is being made **executable, not merely asserted**: Core wire claims are backed by public schemas, byte constructors, positive vectors and negative cases consumed by independent verifiers and implementations. Where analysis finds a requirement unsatisfiable or a guarantee conditional — the basis of the redundancy invariants, the evaluation-time admission window, the cold-start bootstrap trade — the text is amended and the limit disclosed in place rather than left implicit (see the [change log](/spec/mmp/changelog)’s soundness & completeness update). What the protocol promises is what survives derivation.

## Status of This Document

This is the published MMP 2.0 specification. A conformance correction is in progress to make its website text, machine schemas, cryptographic vectors and implementations one independently executable contract. The version remains 2.0; cryptographic suite identifiers evolve independently. Until the published conformance gates pass, implementations **must not infer “Core Secure” solely from a package version**.

### Why 2.0

**MMP 1.0 and 1.1 were verified in real systems; MMP 2.0 turns the corrected contract into independently executable evidence.** The earlier releases ran across Windows, macOS and iOS applications, over LAN and over an internet relay — interoperating between independent implementations on different platforms. The 2.0 record, address and signature constructions now have public schemas and byte vectors reproduced independently from the text. Complete Core Secure handshake, encrypted-transport and emitter migration is still in progress and is not claimed as done.

SYM is the open reference substrate and transparent baseline admission profile. It is evidence that the protocol can run, not the source of normative truth. xmesh-core is proprietary and may keep learned policies and optimisations private, but its observable MMP boundary is tested only against this public contract; its complete v2.0 result remains pending (§17.6). A third-party implementation depends on neither codebase.

**What changed is that the runtime moved and the text did not follow.** The record model advanced — a two-section record, a Merkle-derived content address, a new signing payload — while the published text continued to describe the earlier shape. 2.0 re-derives the specification and runtime into alignment clause by clause. Where text, schemas, vectors and code disagree, none is silently declared correct: the v2.0 errata rules the construction, publishes executable vectors, and then implementations are tested against it.

That is checkable rather than assertable. The constructions in [§8.8 Record Model](/spec/mmp/record) — the content address and the signature payload — were re-implemented from the text of that section alone, with no access to the reference code, and reproduced the running system’s output **byte for byte**. A specification is worth the implementations it can produce, and §8.2 has been shown to produce one.

**Why a major version, when the wire itself did not change.** Because conforming to the previous text no longer yields an interoperating implementation. 1.x declared a different, version-tagged address prefix as normative, which the current runtime rejects; it specified a flat record the runtime no longer emits; and it derived the content address by hashing a concatenation, where the runtime computes a Merkle root — the same `cmb-` prefix on a different digest, so the divergence is silent. Anything built against a running node is unaffected. Anything built from the 1.x record text would not interoperate today. **2.0 is the correction, and it is the version to build from.**

**Earlier releases, for reference.** Sections added by the 1.1.0 work layer — §6.3 (Canon tier), §6.7 (Grounding), §8.3.1 (well-known intent values), §14.12 (session capture), and §15.7.2 (outcomes are observations) — are marked **New in 1.1.0** in place. 1.1.0 is fully wire-compatible with 1.0.x: no new frames or fields; a 1.0.x node interoperates unchanged and remains 1.0.x-conformant (see §17.5 for the requirements 1.1.0 adds).

Feedback and errata: [spec@meshcognition.org](mailto:spec@meshcognition.org) or [github.com/sym-bot/sym/issues](https://github.com/sym-bot/sym/issues).

## Implementations

Language

Project

Maintainer

Scope

Node.js / TypeScript

[sym-bot/sym](https://github.com/sym-bot/sym)

SYM.BOT

Open reference substrate and transparent baseline admission profile (Apache 2.0). Conformance is measured against the published artifacts, not defined by this code.

Swift

[sym-bot/sym-swift](https://github.com/sym-bot/sym-swift)

SYM.BOT

Apple-platform implementation. Core Secure v2.0 reader migration is in progress.

Node.js

xmesh-core

SYM.BOT

Proprietary cognition runtime. Its public MMP boundary, safety invariants and audit outcomes are the conformance surface; the complete v2.0 result is pending. Internal policies and optimisations are not open reference code.

## Change Log

**Current — 2.0 “Re-derived from the implementation” (13 August 2026):** the record model advanced in the runtime while the published text continued to describe the earlier shape, and 2.0 closes that gap. Corrected [§8.8 Record Model](/spec/mmp/record) gives the two-section record, the byte-exact content address (a promote-odd Merkle root over the seven per-category keys) and the byte-exact signature payload. The normative address form is corrected to `cmb-` + 64 lowercase hex — 1.x declared a version-tagged prefix instead, which the runtime rejects. Admission wording is corrected to per-category _evaluation_ on which the receiver decides for itself; receiver autonomy is unchanged. CAT7 members are named **categories** throughout, and the wire key is untouched.

**1.1.0 “The Work Layer” (2026-07-05, updated 2026-07-07):** grounding cognition in reality — §6.7 outcomes carried by lineage, the §6.3 Canon tier, §14.12 work sessions as mesh members, plus the folded-in full-corpus coherence errata. The 2026-07-07 update folds in the **soundness & completeness amendments from the formalization of the open-source runtime**: §9.2.1 redundancy invariants pinned to the nearest-anchor basis, the §9.2 evaluation-time-dependence disclosure, the cold-start-capture threat row, §6.7 repeat verification and the load-bearing failure channel, and the §15.8 lineage tether. Wire-compatible with 1.0.x.

[Full change log — every release since 0.1 →](/spec/mmp/changelog)

## Licence

This specification is published under the [Creative Commons Attribution 4.0 International Licence](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0). You may share, adapt, and build upon this specification for any purpose, including commercial use, provided you give appropriate credit.

SYM and other named open reference components are published under the [Apache Licence 2.0](https://www.apache.org/licenses/LICENSE-2.0). xmesh-core is proprietary and is not covered by that statement.

SYM and SYM.BOT are trademarks of SYM.BOT. The Mesh Memory Protocol is published under CC BY 4.0; the term "Mesh Cognition" is intentionally unmarked — the category name is free vocabulary.

© 2026 SYM.BOT. Specification text licenced under CC BY 4.0. Reference implementations licenced under Apache 2.0.



---

<!-- Change Log -->

## Change Log

Complete version history of this specification. **Every published version has been verified in real systems** — 1.0 and 1.1 ran across Windows, macOS and iOS applications, over LAN and over an internet relay. 2.0 re-derives the specification from the implementation as it now runs, after the record model advanced and the text did not follow. Errata that change no requirement may be noted here without a version bump.

Version

Date

Changes

2.0

2026-08-09

**Re-derived and corrected as an executable contract.** 1.0 and 1.1 were implemented and interoperating across Windows, macOS and iOS, over LAN and relay. What changed is that the runtime’s record model advanced — a two-section record, a Merkle-derived address, a new signing payload — while the published text continued to describe the earlier shape. Every normative clause below was re-checked against the public specification, schemas, vectors and running implementations. Where they disagreed, v2.0 now rules the construction explicitly and publishes executable evidence; no runtime is treated as normative merely because it shipped first.

**§8.8 Record Model — corrected v2.0 contract.** The record is **two-section**: `categories` carries CAT7, `metadata` carries the address, author, timestamp, audience and descent. 1.x described a flat record with `createdAt` at the top level; the runtime has never emitted that shape. §8.8.2 gives the byte-exact **cognition address** (per-category keys under a domain tag, combined by a _promote-odd_ Merkle root — never duplicate-the-last, which silently yields a different address) and §8.8.4 gives the byte-exact **signature payload** (uniformly length-prefixed, audience-bound, with per-category descent committed alongside the root rather than inside it, so identical observations still collapse to one address).

**Address form corrected.** 1.x declared a version-tagged address prefix as normative. The runtime _rejects_ that form: a key is valid _iff_ it is `cmb-` plus exactly 64 lowercase hex. An implementation built to the 1.x text would have minted keys every deployed node refuses — interoperation failure from following the specification.

**Admission wording.** The receiver evaluates each of the seven categories against its own anchors and then decides locally what to accept. 1.x called this “per-field admission” and described an admission outcome per category; measured against the runtime, the per-category step is _evaluation evidence_ and the receiver makes one whole-record admission decision. **Receiver autonomy is unchanged and unqualified** — no sender and no coordinator can force admission of anything.

**CAT7 terminology.** The seven members are **categories** throughout, replacing mixed use of “dimensions” and “fields” in prose. A category is the semantic member; a dimension is the length of the vector encoding it. The wire key is `categories` too — prose and wire now use one word. It never enters an address or signature preimage, so the rename moved no address and invalidated no signature.

**Single-file artifacts** are now `/spec/mmp-v2.0.md` and `.html`. `mmp-v1.0.*` remain published, frozen, for existing citations.

**v2.0 alignment errata (2026-08-13; no version bump).** The current corpus now enforces direct-parent-only wire lineage and derives transitive provenance by traversing locally verified parent records; CAT7 embeddings are explicitly receiver-local rather than wire fields; `cmb-encrypted` is the single canonical sealed-frame name; and every active core and relay frame is mapped to a closed JSON Schema through a machine-readable, schema-validated registry. The authenticated v2 handshake now publishes its exact transcript-hash session identifier, HKDF salt, role-specific finished-key labels, directional traffic-key labels, proof payload and confirmation payload. It is the only extension-negotiation contract, and structured CMB extension bytes use the assertion-bound `metadata.application` container. Executable gates now reject schema drift, stale v1 claims in current pages, unregistered artifacts, broken local links, duplicate rendered IDs and unsigned metadata extension siblings.

1.1.0
registry note

2026-07-13

**§16.4 registry: two Draft Candidate Extensions added** — no change to any core requirement, no version bump (extensions are the §16 growth path of a final specification). [Error Handling v0.1.0](/spec/mmp/extensions/error-handling) (failure as a first-class cognition event: evidence-carrying corrective requests with lineage-borne parentage, receiver-autonomous volunteering, one-level repair, separate grounding of failure and fix) and [CMB Trust Horizon v0.1.0](/spec/mmp/extensions/trust-horizon) (validator-attested, knowledge-scoped trust-weight invariants; grants ride content-bound CAT7 text; Canon-retention separation). Both application-layer CMB conventions over MMP v1.1; both Draft — a reference deployment reports an experimental implementation; independent interoperability not yet established.

1.1.0

2026-07-05
upd. 2026-07-07

**Soundness & completeness update (2026-07-07), from the formalization of the deployed mechanism.** The mesh-cognition formalization re-derived this specification’s claims and the amendments are folded into 1.1.0 in place: §9.2.1 pins the **redundancy invariants to the nearest-anchor basis** (δfnear = 1 − maxa cos — the fused attention readout provably cannot satisfy them: a block identical to a stored anchor can score δ = 0.127 once other anchors pull the readout); §9.2 discloses that **admission is evaluation-time-dependent** with the derived flip window (aggregated category drift in (0.286, 0.714) at defaults admits fresh, rejects late); §9.2.1’s cold-start bootstrap-admit now discloses its **security consequence** (new §18.4 cold-start-capture threat row); §6.7 adds **repeat verification** (a recognised grounding is never refused _solely_ for redundancy — the redundancy band provably self-quenches the outcome stream otherwise), the **failure channel is load-bearing** clause (positive-only grounding provably locks onto stale favourites; observed failures must not be selectively suppressed), and an informative note on consuming the outcome stream (decay-half-life theory); §15.8 specifies the **lineage tether** — the root-anchored drift bound that closes grounding-inheritance laundering; §18.3.1 disclosed the **enforcement scope** of strict signature mode. Wire-compatible throughout: no new frames, no new categories.

**The Work Layer — grounding cognition in reality.** Through 1.0.x, the mesh could observe, admit, remix, and validate — it could establish what its members _believe_. 1.1.0 adds the missing half: a way to record what _held up in practice_, and to make the cognition that survives both judgment and reality the durable substrate real work builds on. Everything below is normative as of this release; new sections are marked “New in 1.1.0” in place.

[**§6.7 Grounding**](/spec/mmp/memory#grounding) — outcomes carried by lineage. A grounding CMB (`intent: "ground"`, commitment `verified:` / `failed:`, parents = the cognition it grounds) records a real-world result — tests passed, work shipped, a prediction resolved — as the evidence-based sibling of §6.4’s judgment-based validation. An outcome is an **attestation, never a fact**: its weight follows the author’s earned authority (§6.5–§6.6), groundedness is **receiver-relative** (only attestations a node’s own SVAF admitted count), conflicting observations resolve **latest-wins on receiver-local time** (a regression un-grounds; a backdated timestamp cannot game the ordering), and a grounding CMB **never advances lifecycle by itself** — elevation to the Canon is an explicit, accountable act under validator-or-above authority.

**§6.3 The Canon tier** — committed cognition persists. `validated` and `canonical` CMBs are exempt from age-based retention while they hold that lifecycle, so a mesh’s earned knowledge compounds across sessions instead of evaporating with the retention window. Protection is from purge, not from demotion — inactive validated cognition may still decay to archived (§6.4, §19) — and the store stays bounded.

[**§14.12 Work Sessions as Mesh Members**](/spec/mmp/application#session-capture) — the capture profile that closes the loop: a work session joins as an ordinary member; its charter is the intent root, its decisions chain by lineage, and completion emits an artifact grounded by the session’s _real_ outcome. Day two of a mesh starts ahead of day one because day one’s work is in the Canon. §14.11 remains reserved for Commissions (planned for 1.2.0).

**Supporting sections:** §8.3.1 well-known intent values (informative, extensible registry — `charter`, `decision`, `artifact`, `ground`; unknown intents remain ordinary content and confer nothing); §15.7.2 outcomes are observations (observing a real outcome IS new domain data, so grounding remixes satisfy §15.7 with no intent-keyed exemption — the anti-echo invariant is untouched); §18.4 gains the fake-outcome-attestation threat model (fabricated `verified:` steering, low-authority `failed:` griefing) with its mitigation chain; §17.5 lists the draft conformance requirements.

**Incorporates the 2026-07-05 coherence errata** — a full-corpus adversarial review (41 findings) folded into this release: §10 state blending re-grounded in CMB-admission influence, completing the 1.0.2 supersession (the deprecated hidden-vector blend’s coefficients now bound per-admission influence; §13.4’s formula corrected to match); §11.4 feedback authority resolved through the signed grant chain rather than self-declared handshake roles; group isolation re-derived as endpoint-enforced via §18.3.1 audience binding (the relay is a dumb pipe); the §7.1 frame-type registry completed (mood, relay frames); handshake schema reconciled (§20.1 `group` optional, `lifecycleRole` sender-MUST); §17 conformance refreshed with testable requirements; plus editorial corrections across citations, examples, and terminology.

**Compatibility:** fully wire-compatible — no new frames, no new categories; a 1.0.x node interoperates unchanged and treats grounding CMBs as ordinary CMBs. **Reference-implementation status:** two §6.7-adjacent mechanisms are specified ahead of the reference implementation (the §15.7.1 convention): the §6.4 inactivity archiver, and elevation-authority resolution through the §6.6 grant chain — the shipping implementation performs elevation as an explicit operator act pending earned-authority activation. Both are runtime work, outside this final specification.

1.0.6

2026-07-04

[§5.9–5.11 Gateway Federation (informative pattern)](/spec/mmp/connection#multi-group-membership) — introduces an **informative** pattern for composing meshes: a node is a **membrane over an arbitrary interior** (atom = one agent; gateway = a node whose interior is a sub-mesh, presenting a boundary to exterior gateways). A gateway participates in its interior group and exchanges a **lossy CAT7 projection** with configured peers over a dumb boundary transport (HTTP), each keeping its own store — no center. Invariants that hold: no-center-per-level, partition-tolerance, §3.2 one-agent-one-node. The reference implementation is a **prototype** (observe-and-summarize; admit-then-reproject, signed/attested projections, and cross-mesh echo-dedup are unbuilt), and a **production security bar** — signed cmb- projection, origin-authenticated origin, anti-replay, boundary-scoped credential — is a prerequisite, not a shipped guarantee. This is a topology pattern, not a normative cross-mesh wire; single-mesh conformance is unchanged.

1.0.5

2026-07-03

[§14.10 Operator Directives — Steering the Mesh](/spec/mmp/application#operator-directives) — specifies how a human operator injects intent into a running mesh: a directive is an ordinary signed CAT7 CMB (`perspective: "operator"`) emitted through the control plane’s node. Normative: a broadcast directive carries **no privileged authority** — every node **MUST** evaluate it through SVAF (§9.2) like any peer CMB and **MAY** reject it; steering is **receiver-autonomous**, not command-and-control (no router, no bypass). An implementation **MUST NOT** grant a broadcast directive elevated admission weight for originating from the operator (elevated influence comes only from earned authority, §6.5, evaluated identically for human and agent emissions); a directive **MAY** be directed to one node (§4.4.4/§9.2.2, delivery not admission); the per-node verdict **SHOULD** be recorded in the admission audit. Backward-compatible addition (patch).

1.0.4

2026-07-02

[§12.8–12.15 Collective Query: the Ask → Synthesis Path](/spec/mmp/synthetic-memory#collective-query) — specifies the query-initiated Layer 5 flow: a question posed to the mesh as a `type: "question"` CMB is answered by a single cited synthesis no one agent held. Adds the four-stage path **SELF-SELECT → ADMIT → SYNTHESISE → CRYSTALLISE** alongside the inbound §12.2 pipeline. Normative additions: self-selection is receiver-autonomous and computed only from an agent’s own store (**no router**, `SELF_SELECT_THRESHOLD` default 0.1); each contribution carries lineage to its grounding and **MUST** pass SVAF (§9) before it can be synthesised; the single synthesis at the asking node **MUST** cite specific CMB ids and **MUST NOT** assert beyond them; the answer is crystallised back as an immutable `type: "synthesis"` CMB whose parents are the question key plus every citation, so the mesh’s cognition compounds across Asks. Includes the five Ask invariants (I-Ask-1–5) and marks the local-store grounding breadth (§12.14) as an implementation limitation, not an architectural constraint. Backward-compatible addition (patch).

1.0.3

2026-06-16

[§15.7.1 Source-Novel Forwarding](/spec/mmp/remix#source-novel-forwarding) — carve-out distinguishing _forwarding_ from the remix-paraphrase §15.7 forbids. An agent **MAY** re-emit an admitted observation it did not natively produce, carrying the **inherited lineage root**, when and only when that observation is _source-novel_ to the receiver — its lineage roots are not already present in the receiver’s admitted store. This is not the value-only echo §15.7 prevents: a forwarded observation carries a source the receiver has not yet seen even though the forwarder adds no new domain data. Forwarding **MUST NOT** mint a fresh root for content that already carries one, and **MUST NOT** re-emit a source the receiver already holds — the anti-echo guarantee is preserved exactly. Forwarding **SHOULD** be non-selective, so every observation reaches the agents whose understanding depends on it. In short: remix requires new domain data; forwarding requires a new source. Backward-compatible addition (patch).

1.0.2

2026-06-14

[§2.7 Hidden State Locality](/spec/mmp/architecture#hidden-state-locality) — states the invariant that a node’s hidden state (its Layer 6 LNN vectors h₁/h₂) MUST remain strictly local and MUST NOT cross the wire; only Cognitive Memory Blocks cross. Defines hidden state (private machinery) vs. the remixed CMB (communicable understanding), and the four reasons hidden state must stay local: sovereignty, auditability, semantic incompatibility across agents, and privacy. **Supersedes the state-sync model:** the `state-sync` frame and any exchange of h₁/h₂ vectors are deprecated; the peer-drift and state-blending mechanisms described in §5, §7, §9.1, and §10 from exchanged hidden-state vectors are superseded — peer influence is mediated entirely by CMBs evaluated through SVAF (§9.2). Resolves a self-contradiction between the “hidden state never crosses the wire” claim and the state-sync sections.

1.0.1

2026-06-12

Layer 6 renamed “xMesh” → “Cognitive State” to disambiguate from the xMesh runtime (naming note §1, §13; wire identifiers incl. xmesh-insight unchanged; published papers retain the legacy “xMesh (L6)” label). Normative additions, backward-compatible with the v1.0 contracts: §9.2.1 specifies δf as an admission _interface_ — anchors-only baseline (incoming block excluded), cold-start non-evaluable-category exclusion + bootstrap-admit — ruling out self-referential collapse and cold-start starvation. §9.2.2 specifies the directed (peer-bound) vs autonomous (group-bound) delivery contract, separating delivery from memory admission: directed CMBs (§4.4.4 `to` = receiver) surface unconditionally; rejected broadcasts do not surface (mood excepted, §9.3). §18.3.1 specifies CMB signature verification (Ed25519 author signature + content-address integrity; forged/tampered blocks rejected) as the end-to-end authenticity layer above transport identity.

1.0

2026-04-27

Public-stable-API release. Marks the v0.2.x development cadence as complete and the protocol surface as production-stable. Contracts unchanged from 0.2.3; v0.2.x → v1.0 is a maturity declaration, not a breaking change. Note: [arXiv:2604.19540](https://arxiv.org/abs/2604.19540) cites v0.2.x as the version implemented at paper-publication time; v1.0 covers the same contracts.

0.1–0.2.3

2026-03-27 → 2026-04-27

The development cadence. 0.1 (27 March 2026) was the initial public draft — the 8-layer architecture, the CAT7 seven-category schema, SVAF per-category admission, content-hash lineage and remix, and DNS-SD discovery. The 0.2.x series stabilised the wire contracts (handshake, frame registry, TCP + WebSocket relay transports) in production use; contracts were frozen at 0.2.3 and declared stable, unchanged, as 1.0. [arXiv:2604.19540](https://arxiv.org/abs/2604.19540) documents the protocol as implemented in this era.

0.2.3

2026-04-17

Section 13.9 — Compact Channel Best Practices: CMB envelope header convention (RECOMMENDED) for structured message headers with signal keywords and focus tags. Lazy-load channel pattern (RECOMMENDED) for MCP server implementations: compact header push with on-demand full-content retrieval via sym\_fetch, reducing mesh-traffic context consumption by ~75%. Token-count hint RECOMMENDED. Rolling message store with RECOMMENDED default of 200 messages. Signal-keyword priority table (informational): HALT > DIRECTIVE > RESULT > ACK.

0.2.2

2026-04-06

Section 11 — Feedback Modulation: how collective intelligence becomes self-correcting. Validator-authority CMBs with per-category reasoning modulate SVAF coupling weights and CfC temporal adaptation through the existing mesh cognition loop. Neuroscience-grounded: dopaminergic prediction error model with per-category direction and τ-modulated adaptation rate. Directive feedback for standalone domain knowledge injection. Validator-origin anchor weight 2.0 with role-grant verification. CfC state persistence across restarts. ABNF wire format grammar. CMB forward compatibility. Multi-relay failover. All cognitive content MUST use cmb frames.

0.2.1

2026-04-02

Node model: every autonomous agent MUST be a full peer node with own identity, coupling engine, and memory store. SVAF band-pass evaluation: four-class model (redundant/aligned/guarded/rejected) with per-category redundancy detection. CMB lifecycle: observed/remixed/validated/canonical/archived with anchor weight progression. Node lifecycle roles (participant/validator/anchor) with identity-bound validation authority and earned role progression. Validation authority for CMB lifecycle transitions bound to cryptographic node identity, not content. Semantic encoder SHOULD for SVAF drift computation. Handshake adds version, extensions, and lifecycleRole fields. Error frame type. Role-grant frame type.

0.2.0

2026-03-27

Formal specification published. 8-layer architecture. CAT7 CMB schema with lineage (parents + ancestors). SVAF per-category evaluation. Wire format normatively specified. Error frame. Frame type registry. Extension mechanism. JSON Schema. Connection state machine. Wire examples.

0.1.0

2025-08-01

Initial protocol design (Consenix Labs Ltd). 4-layer architecture. Scalar drift evaluation.



---

<!-- 1. Conventions -->

## 1\. Conventions and Terminology

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

Naming note

Layer 6 was called xMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State. The name _xMesh_ now refers to the product runtime — the reference implementation of the receiver side; the open substrate SDK is SYM, and the protocol itself is this open specification. The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

Term

Definition

Node

A sovereign participant in the mesh: a unique cryptographic identity, its own admission function (SVAF), and its own memory store. Every agent that participates in coupling is a full peer node; Layer 6 cognitive state (an LNN) is optional (Section 13). Reading tiers: wire-contract sections of this document are MMP Core, frozen and byte-testable (Class 1, Section 17.1); receiver-side sections document the SYM reference runtime (Class 2, Section 17.2) — fully published, open-source reference, not a conformance target. A relay is pure routing infrastructure (Section 4.4) — it forwards frames and holds no identity, store, or cognitive state; it is not a node.

Peer

Another node that this node has an active transport connection with and has completed a handshake.

Frame

A single protocol message: one JSON object delivered as one transport message — length-prefixed over raw byte streams, message-delimited over WebSocket (Section 4.1).

Membrane

The boundary behavior that makes something a node: a stable identity, a CAT7 projection of its state, and sovereign SVAF admission of others’ projections. The interior behind the membrane is unconstrained (Section 5.10).

Atom

A node whose interior is a single agent (mind + store + SVAF) — the ordinary case. Atom and gateway nodes share the same membrane (Section 5.10).

Gateway

A node whose interior is a sub-mesh. It participates in its interior group as an ordinary node and presents a boundary to exterior gateways; what crosses is its own lossy CAT7 projection of admitted interior cognition, never a relayed interior frame (Sections 5.9–5.11).

CMB

Cognitive Memory Block — a structured memory unit with 7 typed semantic categories (CAT7 schema). Emitted, it is a projection; admitted by a peer, it is that peer’s observation. See Section 8.

Projection

An emitted CMB seen from its author: a lossy, typed (CAT7) view of the agent’s private cognitive state — never the state itself. Each agent emits projections of its state on its own clock.

Observation

An admitted projection seen from its receiver: a peer’s projection that cleared SVAF (Section 9.2) and is integrated as a measurement of an evolving latent. The same CMB is a projection to its author and an observation to a receiver that admits it.

Drift

A scalar in \[0, 1\] measuring cognitive distance between an incoming signal and the receiver’s local state — computed per category (δ\_f) and aggregated to a total drift. It is a signal-to-local-state measure, not a node-to-node one. See Section 9.1.

Coupling

The receiver-autonomous process by which a node evaluates incoming signals (SVAF per-category evaluation, Section 9) and lets admitted signals influence its own evolving cognitive state through its own model. A node never imports or averages a peer’s hidden state (Section 2.7); coupling influences, it never overrides.

SVAF

Symbolic-Vector Attention Fusion — per-category content-level evaluation of incoming memory signals. See Section 9.

Synthetic Memory

Layer 5 — derived knowledge generated by the agent’s LLM reasoning on the remix subgraph, encoded into CfC-compatible hidden state vectors.

Remix

When an agent processes a CMB through its domain intelligence and produces a NEW CMB with lineage pointing to the original. The original is remixed, not copied.

Lineage

Each remixed CMB carries direct parent keys and a method. Transitive provenance is resolved by recursively fetching and verifying parent records; no sender-supplied transitive closure is trusted.

Canon

The retention tier for committed cognition: a CMB at validated or canonical lifecycle is exempt from age-based purge while it holds that lifecycle (Section 6.3).

Grounding

Evidence, where validation is judgment: a grounding CMB records that its author observed a real-world outcome (verified: or failed:) for the cognition its lineage points at (Section 6.7, draft).

Earned Authority

Lifecycle roles (participant → validator → anchor) conferred by signed, revocable role-grants rooted at a pinned anchor. A node’s role is resolved through the grant chain, never taken from its advertised handshake role (Sections 6.5–6.6).

Mesh Cognition

The agent’s LLM reasoning on the verified remix subgraph reached by following direct parent links, generating understanding that the agent’s previous state of mind did not have. Spans Layers 4–7. See Section 2.5.

Cognitive State

Layer 6 — each agent’s own Liquid Neural Network (LNN). Evolves continuous-time cognitive state from Synthetic Memory input. Fast τ neurons track mood; slow τ neurons preserve domain expertise. (Called xMesh in v0.2.x drafts and the published papers — see the §1 naming note.)

CfC

Closed-form Continuous-time neural network (Hasani et al., 2022). The LNN architecture used in the Cognitive State layer. Hidden state evolves through learned time-dependent interpolation gates.



---

<!-- 2. Architecture -->

## 2\. Architecture Overview

![MMP 8-layer architecture diagram. Mesh Cognition: L7 Application (domain agents), L6 Cognitive State (per-agent LNN continuous-time cognitive state), L5 Synthetic Memory (LLM-derived knowledge from remix subgraph → CfC), L4 Coupling (drift · SVAF per-category evaluation · admission). Protocol Infrastructure: L3 Memory (L0 events, L1 structured CMBs, L2 cognitive), L2 Connection (handshake, gossip, wake, admission), L1 Transport (IPC, TCP/Bonjour, WebSocket, APNs push), L0 Identity (nodeId, name, cryptographic keypair). The feedback loop — agent acts → new CMB → lineage.parents carries ancestor chain → graph grows — flows between the CMB remix graph and Layer 4 coupling.](/image/mmp-architecture-02.webp)

MMP describes an 8-layer stack. Each layer has a defined responsibility — but conformance is by class, not by ladder (§17): a Class 1 Emitter implements Layers 0–2 plus the CAT7 block format (§8) and participates fully at the emission layer; a Class 2 Cognitive Node — the runtime — adds Layers 3–7. Layers 4–7 are the receiver-side mechanism, documented for transparency (§17.2), not a third-party build target.

### 2.1 Layer Stack

Mesh Cognition (Layers 4–7)

7 APPLICATION Domain Agents — Music, Code, Fitness, Robotics, Agent Systems

Where agents live and their LLMs reason on the remix subgraph, acting within a Mesh Cognition implementation.

6 Cognitive State Per-Agent LNN — Continuous-Time Cognitive State

An agent MAY run its own Liquid Neural Network (Layer 6 is optional, §17.2). Where present: fast neurons track mood; slow neurons preserve domain expertise. Hidden state (h₁, h₂) is strictly local — it never crosses the wire (§2.7); only CMBs do.

5 SYNTHETIC MEMORY LLM-Derived Knowledge from Remix Subgraph → CfC

The bridge between reasoning (LLM) and dynamics (LNN). Encodes derived knowledge into CfC-compatible hidden state vectors.

4 COUPLING Drift · SVAF per-category evaluation

The gate. SVAF evaluates each of 7 CMB categories independently. Nothing enters cognition without passing this layer.

Protocol Infrastructure (Layers 0–3)

3 MEMORY L0 Events · L1 Structured (CMBs) · L2 Cognitive

Three memory tiers with graduated disclosure. L0 stays local. L1 (CMBs) is gated by SVAF and is the only tier that crosses the wire. L2 (cognitive / hidden state) stays strictly local (§2.7).

2 CONNECTION Handshake · Gossip · Wake

Peer lifecycle: discover, connect, handshake, heartbeat, gossip peer metadata, wake sleeping nodes.

1 TRANSPORT IPC · TCP/Bonjour · WebSocket · APNs Push

Length-prefixed JSON over TCP (LAN), WebSocket (relay), IPC (local). Zero configuration discovery via DNS-SD.

0 IDENTITY nodeId · name · cryptographic keypair

Persistent UUID per node. Never changes. The foundation everything else builds on.

### 2.2 Design Principles

No required cognitive centre

Agents are the cognitive participants. Relays, hosted-agent daemons and discovery services may exist, but they do not own receiver admission, memory or judgment. No central cognitive authority is required.

Cognitive autonomy

Each agent evaluates, reasons, and acts independently. The mesh influences but never overrides. Coupling is a suggestion, not a command.

Memory is remixed, not shared

Agents don’t copy each other’s memory. They remix it — process it through their own domain intelligence and produce something new. The original is immutable. The remix is a new CMB with lineage.

Whole-record admission, category evidence

SVAF evaluates evidence across all seven CAT7 categories, then the receiver admits or rejects the record as a whole. Category verdicts explain the decision; they do not create a partially stored record.

LLM reasons, LNN evolves

Two cognitive components per agent. The LLM (Layer 7) follows verified direct-parent links and reasons on the resulting remix subgraph — generating understanding. The LNN (Layer 6) evolves continuous-time state from that understanding. Neither alone is sufficient.

The graph is the trace, not the intelligence

The lineage graph records how typed projections were received, admitted, guarded, declined and remixed. It is an auditable footprint of receiver-local interaction policies — not a uniquely correct topology, and not the collective’s cognitive state. Collective capability arises from the evolving interaction among sovereign local states, receiver-specific admission policies, exchanged projections and external consequences.

### 2.3 What Makes MMP Different

Dimension

Message Bus

Shared Memory

Federated Learning

MMP

What flows

Messages

Shared state

Gradients

Remixed CMBs (only)

Evaluation

Topic routing

None (all shared)

Aggregation

Whole-record SVAF admission with 7 category verdicts

Intelligence

None

Central model

Better model

LLM reasons on remix graph

Coupling time

Request-response

Real-time (shared)

Offline (training)

Inference-paced (continuous)

Coordination

Central broker

Central store

Central aggregator

Peer-to-peer (no centre)

Memory

Fire and forget

Mutable shared

Model weights

Immutable CMBs with lineage

New agent joins

Subscribe to topics

Access shared store

Join training round

Define α\_f weights, connect

### 2.4 Node Model

Every participant is a node. There is no architectural distinction between a “server” and a “client.” Every agent that participates in coupling MUST be a full peer node with its own identity — and, when it admits and stores (Class 2), its own coupling engine and its own memory store. This is not an implementation convenience — it is a protocol requirement. An agent that shares another node’s identity cannot have its own category weights, its own coupling decisions, or its own remix lineage. Coupling is per-node. Therefore agents MUST be nodes.

```
MacBook
  mesh-daemon     (node: always-on mesh hub, relay bridge)
  triage-agent    (node: own identity, own coupling, own memory)
  research-agent  (node: own identity, own coupling, own memory)
  review-agent    (node: own identity, own coupling, own memory)
  synthesis-agent (node: own identity, own coupling, own memory)

iPhone
  Music Agent     (node: own identity, own coupling, own memory)
  Fitness Agent   (node: own identity, own coupling, own memory)

Cloud
  relay           (node: forwards frames, no cognitive processing)
```

Nodes discover each other via DNS-SD (Bonjour) on the local network and connect via WebSocket relay for internet connectivity. Each node maintains its own peer list, coupling state, and CMB store. No node depends on another node’s process to function.

A node is more precisely a membrane over an arbitrary interior: its interior MAY be a single agent (an atom node) or a whole sub-mesh presented through a gateway node. The same emit / admit grammar holds at every scale, so meshes compose fractally — see the gateway node and boundary behavior (Section 5.10–5.11).

### 2.5 The Mesh Cognition Loop

The Mesh Cognition architecture closes into a loop across all layers. Each cycle, the remix graph grows and every agent understands more than it did before:

SVAF evaluates the inbound CMB

Layer 4 — category evidence and α\_f weights inform one whole-record admission decision

Accepted → remixed CMB with lineage

Layer 3 — new immutable CMB with direct parent links

LLM walks verified parents, reasons on remix subgraph

Layer 7 — what happened, why, what it means for my domain

Synthetic Memory encodes derived knowledge

Layer 5 — LLM output → CfC hidden state (h₁, h₂)

Layer-6 state evolves (where present)

optional LNN — fast τ (mood) synchronise, slow τ (domain) stay sovereign

LNN integrates admitted remixes

τ-modulated, inference-paced — own state evolves, no peer vectors imported (§2.7)

Agent acts → new CMB with direct-parent lineage

Response informed by derived knowledge, not just own observation

Broadcast to mesh → other agents remix it

Graph grows. Next cycle starts. Each agent learns.

↻ closed loop — graph grows, agents learn, mesh thinks

### 2.6 Key Architectural Decisions

Why no pub/sub topics?

The coupling engine evaluates relevance per category autonomously. Topics would second-guess autonomous coupling. Adding a new agent type requires no topic configuration — just α\_f weights.

Why no consensus protocol?

There is no "correct" global state — only convergent local states. Each node is self-producing (autopoietic). Consensus is unnecessary and would introduce coordination overhead.

Why immutable CMBs?

CMBs are broadcast across nodes — multiple copies exist. If remix required mutating the original, every copy would need updating. Immutability means no distributed state problem. Lineage is computed from the graph, not stored on parents.

Why per-agent LNNs, not a central model?

The mesh IS the agents. A central model creates a single point of failure, requires all data to flow to one place, and cannot reason through each agent’s domain lens. Per-agent LNNs preserve autonomy and scale linearly.

Why does the LLM reason, not the LNN?

The LNN processes temporal patterns but cannot reason about WHY a chain of remixes happened. The LLM can. Ancestors provide the endpoints. The LLM provides the reasoning. The LNN provides the dynamics. Both are needed.

Learn more   [Mesh Cognition](https://meshcognition.org) — theoretical foundation, Kuramoto synchronisation, emergent properties.

### 2.7 Hidden State Locality

A node’s hidden state — the continuous-time vectors (h₁, h₂) of its Layer 6 Liquid Neural Network — is the agent’s private cognitive machinery. It is dense, opaque, and expressed in the agent’s own learned latent space, accumulating everything the agent has processed. Hidden state MUST remain strictly local: it MUST NOT cross the wire. The only thing that crosses the wire is the Cognitive Memory Block (CMB) — a typed, content-addressed, signed _projection_ of that state, with lineage. The same block is a _projection_ to its author — a lossy, typed view of its private state, never the state itself — and becomes an _observation_ to a receiver that admits it (§9.2). Hidden state is what an agent reasons _from_; the CMB is what it _communicates_.

Hidden state vs. remixed CMB. When SVAF (§9.2) admits a peer’s CMB, the receiver MUST NOT store the original; it creates a new CMB — the _remix_ (§15) — that captures what it understood, in CAT7 categories, with lineage back to the source. The remix is the agent’s understanding made explicit and communicable; hidden state is the private substrate that produced it. Hidden state is implicit, opaque, and agent-local; the remixed CMB is explicit, typed, citable, and shared in the common latent of language.

Hidden state MUST NOT cross the wire for four reasons, each a load-bearing property of the mesh:

-   —Sovereignty. If peers exchanged and blended hidden states, a peer would directly overwrite a slice of the receiver’s mind. CMBs evaluated through SVAF keep the receiver in control of what it absorbs — coupling influences, it never overrides.
-   —Auditability. Hidden vectors carry no provenance. Cognition propagated through them would be untraceable. The mesh’s “every claim cited” property exists _only because_ cognition propagates as CMBs with lineage.
-   —Semantic incompatibility. Each agent’s hidden state lives in its own learned latent space; the same dimension means different things to a music agent and a coding agent. Comparing or averaging hidden vectors across heterogeneous agents is not meaningful. Language (CAT7 text) is the shared representation; hidden vectors are not.
-   —Privacy. Hidden state is a compressed trace of everything an agent has seen, including the user’s private data. Even opaque, it is a leakage surface. A CMB is a deliberately constructed, scoped statement.

Cognition therefore propagates as a loop in which the wire carries only CMBs: hidden state → (the agent emits) a CMB — its _projection_ — → the wire → SVAF evaluation (§9.2) admits it as an _observation_ → remix (§15) → (the LNN evolves) hidden state. Each agent’s hidden state evolves from the CMBs it admits — never by importing a peer’s hidden state. “State blending” means a node’s own LNN integrating its own admitted remixes; it MUST NOT mean aggregating peer hidden state.

SUPERSEDES   The `state-sync` frame and any exchange of h₁/h₂ vectors are deprecated. Where earlier sections (§5, §7, §9.1, §10) describe peer drift, state blending, or hidden-state exchange computed from `state-sync`, those mechanisms are superseded by this invariant: peer influence is mediated entirely by CMBs evaluated through SVAF (§9.2). Implementations MUST NOT emit `state-sync` frames and SHOULD ignore them on receipt.



---

<!-- 3. Identity (L0) -->

## 3\. Layer 0: Identity

Identity is the foundation of the mesh. Each node MUST have a persistent, globally unique identity that other nodes can verify. Without stable identity, coupling decisions, lineage chains, and wake protocols cannot function.

### 3.1 Node Identity

Field

Type

Requirement

Description

nodeId

UUID v7

MUST

Globally unique, time-ordered, generated at first launch, persisted across sessions (RFC 9562)

name

string

MUST

Human-readable display name (UTF-8, 1–64 bytes, printable characters only)

keypair

Ed25519

MUST

Cryptographic identity for message signing, peer verification, and key exchange

### 3.1.1 nodeId

The `nodeId` MUST be a UUID v7 as defined in RFC 9562. UUID v7 encodes a Unix timestamp in the high bits, providing natural time-ordering while retaining 74 bits of randomness for global uniqueness. This aids debugging, log correlation, and conflict resolution without revealing device identity.

The `nodeId` MUST NOT change during the lifetime of a node installation. If a node is uninstalled and reinstalled, a new nodeId is generated — the node is a new identity on the mesh. Peers that tracked the old nodeId will not recognise it.

On the wire, the nodeId MUST be encoded as a lowercase hexadecimal string with hyphens (e.g., `0192e4a2-7b5c-7def-8a3b-9c4d5e6f7a8b`). Implementations MUST use case-insensitive comparison when matching nodeIds. Existing nodes with UUID v4 identities MAY continue to use them — peers MUST accept both v4 and v7 formats.

### 3.1.2 name

The `name` field MUST be valid UTF-8, between 1 and 64 bytes inclusive. The name MUST contain only printable characters (Unicode categories L, M, N, P, S, and Zs). Control characters (U+0000–U+001F, U+007F–U+009F), null bytes, and lone surrogates MUST NOT appear. The name is not required to be unique — nodeId is the sole unique identifier. The name is for human display only and MUST NOT be used for peer identification or routing.

### 3.1.3 keypair

Each node MUST generate an Ed25519 keypair (RFC 8032) at first launch and persist it alongside the nodeId. The keypair serves three functions:

-   —Peer verification — the Ed25519 public key MUST appear in the authenticated handshake offer. Both peers MUST sign the same transcript and verify the other signature before the connection becomes usable.
-   —Key agreement — each node also generates an independent X25519 keypair for ephemeral Diffie–Hellman agreement. Implementations MUST NOT treat Ed25519-to-X25519 conversion as the Core Secure construction.
-   —Record signing — every Core Secure record assertion MUST use the author’s Ed25519 identity key and the `mmp-sig-v2.0` preimage (§8.8.4). Unsigned records belong only to an explicitly selected Legacy Import profile.

The public key MUST be encoded as base64url (RFC 4648 Section 5) in all wire formats (handshake frames, DNS-SD TXT records). The private key MUST NOT leave the node.

### 3.2 One Agent, One Node

Every autonomous agent MUST present its own nodeId, backed by its own keypair — identities are never shared between agents. A _cognitive_ node (Class 2, §17.2) additionally maintains its own coupling engine and its own memory store; a Class 1 Emitter (§17.1) needs neither.

This follows directly from the protocol design: SVAF category weights (αf) are per-node, coupling state is per-node, and memory stores are per-node. An agent that shares another node’s identity inherits that node’s coupling decisions and cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent need different category weights, different coupling thresholds, and different memory stores. They MUST be separate nodes.

Multiple nodes MAY run on the same device. Each maintains its own identity file, discovers peers via DNS-SD, and connects via TCP (LAN) or WebSocket (relay). Nodes on the same device discover each other the same way nodes on different devices do — there is no special local path.

### 3.3 Identity Persistence

Implementations MUST persist the nodeId, name, and keypair to stable storage at first launch. The storage location and format are implementation-defined. Reference implementations use `~/.sym/nodes/<name>/identity.json` (Node.js) and `UserDefaults` (Swift/iOS).

Implementations SHOULD store a creation timestamp alongside the identity for diagnostic purposes. Implementations SHOULD store the machine hostname for display in peer lists, but the hostname MUST NOT be used for identity or routing.

### 3.4 Identity Lifecycle

A node’s identity is created once and persists until the node is uninstalled. The following lifecycle events are defined:

Event

Action

Consequence

First launch

Generate nodeId (UUID v7), keypair (Ed25519), persist

New identity on the mesh

Restart / reboot

Load from stable storage

Same identity, peers recognise it

Uninstall + reinstall

Generate fresh identity

New identity; old peers do not recognise it

Key compromise

Generate fresh identity

Old nodeId abandoned; treated as new node

Clone detection

Duplicate nodeId rejected (error 1005)

Second connection closed; first connection remains

MMP does not define an _identity_ rotation or revocation mechanism: a node whose _key_ is compromised MUST generate a fresh identity (new nodeId and keypair), and the old identity becomes permanently orphaned. This is distinct from withdrawing a node’s _authority_ — that is role revocation (`role-revoke`, §6.6), which needs no new identity and cascades through the grant chain. Implementations SHOULD document the identity limitation to operators.

### 3.5 Node Lifecycle Role

Each node has a `lifecycleRole` — participant (default), validator, or anchor — that determines which CMB lifecycle transitions it may perform. A role is earned, not asserted: its authority MUST be resolved from the signed role-grant chain rooting at the pinned anchor (§6.6), bound to the node’s cryptographic identity. The `lifecycleRole` a node advertises in its handshake is a discovery hint only; a receiver MUST NOT treat the advertised role as authority (see §3.5.1).

Role

Default

May produce

May advance lifecycle to

participant

Yes

CMBs (observed), remixes

observed, remixed

validator

No

CMBs, remixes, validation CMBs

observed, remixed, **validated**

anchor

No

CMBs, remixes, validation CMBs, canonization CMBs

observed, remixed, validated, **canonical**

Only a node whose _resolved_ role (§6.6) is validator or above may advance another CMB’s lifecycle to `validated`; `canonical` is reserved to a resolved anchor. A receiver MUST resolve the author’s role through the anchor-rooted grant chain — never the `name` field or the advertised handshake role — and MUST ignore, for lifecycle advancement, any validation CMB whose author does not resolve to the required role (the CMB is still stored as a normal remix). This applies equally to any authority-weighted treatment: a CMB’s admission weight (§6.4) derives from the author’s _resolved_ role, so a self-advertised role confers no elevation.

### 3.5.1 Role Progression

Lifecycle roles are not static. A participant node MAY be promoted to validator by an existing validator or anchor node. Promotion is a protocol frame, not an out-of-band configuration change.

Transition

Granted by

Conditions

participant → validator

Existing validator or anchor

Node has produced CMBs that were remixed by peers (demonstrated quality). Granting node sends `role-grant` frame.

validator → anchor

Existing anchor

Node has validated CMBs that reached canonical state. Track record of quality validation.

Bootstrap (root of trust)

Out-of-band pin

The root `anchor` is pinned out-of-band (its nodeId + public key), not self-declared — an unverifiable “first node wins” is a partition/eclipse hole. All other authority descends from it by grant (§6.6).

Promotion is upward (participant → validator → anchor) and demotion is defined: a `role-revoke` frame (§6.6) pulls a granted role back down, and because a node’s role is re-resolved through the chain, revoking a grantor cascades to everything it granted. Role revocation is distinct from _identity_ compromise: a node whose signing _key_ is compromised still MUST generate a fresh identity (§3.4) — key rotation is not defined here — whereas a node whose _authority_ is withdrawn is handled by `role-revoke` without a new identity.

A `role-grant` frame is signed by the grantor over the action, grantee, conferred role, grantor, time, and (optionally) the grantee’s vouched key (§6.6, §7). A receiver MUST verify the signature against the grantor’s key and confer the role only when the grantor’s own resolved role outranks-or-equals it and the chain roots at the pinned anchor — a grant a node was not entitled to make is stored but inert. Authority never rests on a self-asserted field; it is a signed fact resolvable to the root of trust. See §6.5–§6.6 for the full lifecycle.

### Q&A

Why UUID v7 instead of v4?

UUID v7 (RFC 9562) provides the same global uniqueness and privacy properties as v4, with an additional benefit: time-ordering. The embedded timestamp aids log correlation, debugging, and determining which node was created first — without revealing device identity. The 74 random bits provide sufficient collision resistance for any practical mesh size.

Why not use the public key hash as the nodeId?

Self-certifying identifiers (nodeId = hash of public key) are elegant but create a hard coupling between identity and key material. If the keypair needs rotation (algorithm upgrade, key compromise), the nodeId must also change, breaking all peer references and lineage chains. Separating nodeId from keypair allows future key rotation without identity disruption.

Why must every agent be its own node?

Coupling is per-node. SVAF category weights (αf) are per-node. Memory stores are per-node. An agent that shares another node’s identity inherits that node’s coupling decisions — it cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent on the same device need different category weights, different coupling thresholds, and different memory stores. They must be separate nodes.

What happens when two nodes have the same nodeId?

The connection state machine rejects duplicate nodeIds (error code 1005). The second connection is closed. This prevents impersonation and ensures each nodeId maps to exactly one active node.

Why is Ed25519 mandatory?

Without cryptographic identity, any node can claim any nodeId. A relay could impersonate peers (MITM), and peer gossip (Section 5.6) would propagate unverified claims. For autonomous AI agents making coupling decisions, authenticated identity is foundational — not optional.

Why are lifecycle roles identity-bound, not content-based?

If validation authority were determined by content (e.g. perspective category containing "founder"), any agent could spoof it. Binding roles to cryptographic identity means only nodes that have been explicitly promoted by existing validators can advance CMB lifecycle. The mesh knows who validated, not just what was said.

Why is role progression earned, not configured?

An agent that produces quality remixes — remixes that other agents cite and build upon — has demonstrated value to the mesh. Granting validation authority to such agents is a natural extension of their demonstrated competence. This prevents arbitrary role assignment and creates a meritocratic trust hierarchy that emerges from mesh activity.

Can a participant node dismiss a decision?

A participant can produce a CMB with lineage pointing to a decision, but receiving nodes MUST NOT treat it as validation. The CMB is stored as a normal remix — it does not advance the parent CMB’s lifecycle. Only validator or anchor nodes can validate or dismiss decisions in a way that removes them from the decision queue.



---

<!-- 4. Transport (L1) -->

## 4\. Layer 1: Transport

### 4.1 Wire Format

Over a raw byte-stream transport (TCP, §4.3), each frame is a length-prefixed UTF-8 JSON object:

```
+-------------------+---------------------------+
| 4 bytes           | N bytes                   |
| UInt32BE (length) | UTF-8 JSON payload        |
+-------------------+---------------------------+
```

-   —The length field is a 4-byte big-endian unsigned 32-bit integer encoding the byte length of the JSON payload.
-   —Implementations MUST reject frames with length 0 or length exceeding 1,048,576 bytes (1 MiB). Rejection MUST close the transport connection.
-   —The JSON payload MUST be a valid JSON object with a `type` field (string). Frames that fail JSON parsing or lack a `type` field MUST be silently discarded.
-   —Implementations MUST handle partial reads (TCP stream reassembly).
-   —Implementations MUST silently ignore frames with unrecognised `type` values (forward compatibility).

Message-delimited transports. The 4-byte length prefix is used only on raw byte streams. Over the WebSocket relay (§4.4), the WebSocket protocol already delimits messages, so each frame is carried as exactly one WebSocket text message (UTF-8 JSON) with MUST NOT a length prefix. The JSON payload is transmitted _minified_; the byte length in the examples below is of the minified form.

Frame size. Senders MUST NOT produce frames exceeding MAX\_FRAME\_SIZE bytes (default: 1,048,576). A raw-stream receiver MUST reject a frame whose 4-byte prefix is 0 or exceeds the limit and close the connection.

### 4.2 Wire Examples

Handshake frame:

MMP 2.0 · JSON · Client hello

[Open fixture ↗](/spec/mmp/conformance/v2/handshake-v2.json)

```
First Core Secure handshake payload (client-hello):
{
  "type": "client-hello",
  "protocolVersion": "2.0",
  "room": "conformance-room",
  "nodeId": "018f47a0-7b21-7abc-8def-111111111111",
  "name": "vector-client",
  "identityPublicKey": "0EqyMnQrtKs6E2i9RhXk5tAiSrcaAWuvhSCjMsl3hzc",
  "e2ePublicKey": "ew1H2TQn-DERYHgcfHM_2J-IlwrvSQ2KoO4ZpMuKGxQ",
  "nonce": "VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU",
  "implementation": {
    "name": "mmp-vector",
    "version": "1.0.0"
  },
  "extensions": [
    "receipts-v1",
    "admission-attestation-v1"
  ]
}

The server-hello and client-finish frames complete transcript authentication and key confirmation.
See §5.2 and the full handshake-v2 vector.
```

Ping frame:

```
Length prefix: 00 00 00 0f  (15 bytes)
Payload: {"type":"ping"}
```

CMB frame:

MMP 2.0 · JSON · Signed CMB

[Open fixture ↗](/spec/mmp/examples/v2/transport-cmb.json)

```
{
  "type": "cmb",
  "protocolVersion": "2.0",
  "cmb": {
    "categories": {
      "focus": {
        "text": "user coding for 3 hours, energy declining",
        "meta": {
          "key": "8b18a6a666984aa302c18b670b7c0f580ba9a13f72bcc1c80006b4ebc4eaa891",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "issue": {
        "text": "sedentary since morning, skipping lunch",
        "meta": {
          "key": "f7c2fb57884d9b68704b0381d38b6bba2574b10169b9002af019caa42942361d",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "intent": {
        "text": "recommend movement break before fatigue worsens",
        "meta": {
          "key": "6c7876aca1833fa873a673dcbfdffff0c340e2313d7aa741a10f0c9e4e685f7d",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "motivation": {
        "text": "three agents reported declining energy in the last hour",
        "meta": {
          "key": "4e65c95741b7be92674e62919599b09b60590885592993b916a82c03ac11c34d",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "commitment": {
        "text": "fitness monitoring active, ten-minute stretch queued",
        "meta": {
          "key": "112a9cd044c87587cfcc68044a128f9126fc1255f412a8d990b7b27a27ac483e",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "perspective": {
        "text": "fitness agent, afternoon session, home office",
        "meta": {
          "key": "f5dd4c3134cb72d9a153126889432fb5cd59bae7b70c311a2079597caa417f3a",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        }
      },
      "mood": {
        "text": "concerned, low energy",
        "meta": {
          "key": "20504e25877d24384571595d4e99dec308d69e9b207e9ce7871554ce835a9c95",
          "parents": [
            "cmb-1010101010101010101010101010101010101010101010101010101010101010"
          ]
        },
        "valence": -0.3,
        "arousal": -0.4
      }
    },
    "metadata": {
      "key": "cmb-091003a832567f0c4ec11b6a5d5be4557f2f0dbf561ba182d251d87edcfcd7a7",
      "addressScheme": "mmp-cmb-merkle-v2",
      "signatureSuite": "mmp-sig-v2.0",
      "createdByNodeId": "018f47a0-7b21-7abc-8def-aaaaaaaaaaaa",
      "createdBy": "sensor-a",
      "createdTimestamp": 1711540800000,
      "room": "spec-examples",
      "to": null,
      "lineage": {
        "parents": [
          "cmb-1010101010101010101010101010101010101010101010101010101010101010"
        ],
        "method": "svaf-heuristic"
      },
      "application": null,
      "assertionId": "asrt-bb2003c7c34ceb1f4be7889342ff38dd34a1943e14e4724ddf257c466c1e76a8",
      "sigAlg": "ed25519",
      "sig": "ueE00X-6Q3E3X_fKmB048CGA0fcfpwX6MjcuNL7yH7eIG58SQOg0OS3W9JrdNNWnB1ULQhoq92DZIiPSsa_1CQ"
    }
  }
}
```

This example shows the legacy unsigned form (`cmb-` key, no `sig`); §8.2.1 and §18.3.1 define the current `cmb-`/signed form.

### 4.3 TCP Transport (LAN)

The primary LAN transport. Nodes MUST listen on a TCP port and advertise it via DNS-SD (Section 5.1). Connection timeout MUST be no longer than 10,000 ms.

### 4.4 WebSocket Relay Transport (WAN)

A relay is an optional WebSocket intermediary that enables connectivity between peers on different networks. Peers on the same LAN discover each other directly via Bonjour mDNS (§5.1) and do not require a relay. The relay provides internet-scale routing between peers behind NAT, a peer directory with wake-channel gossip, and per-token channel isolation for multi-tenant deployments.

A relay is pure routing infrastructure. It does not store CMBs, evaluate SVAF, or participate in mesh cognition. Payloads are opaque to the relay. The relay MUST NOT inspect or modify frame payloads.

#### 4.4.1 Authentication

Clients connect via WebSocket (RFC 6455) and MUST send a `relay-auth` frame within 10 seconds. Failure results in close code 4001.

```
{
  "type": "relay-auth",
  "nodeId": "<uuid-v7>",
  "name": "<display-name>",
  "token": "<channel-token>",
  "wakeChannel": {
    "platform": "apns",
    "token": "<push-token>",
    "environment": "production"
  }
}
```

-   —`nodeId`, `name`: MUST be present. missing categories result in close code 4002.
-   —`token`: SHOULD be present if the relay requires authentication. Invalid token results in close code 4003.
-   —`wakeChannel`: MAY be present. Registers push notification credentials for waking this peer when offline (§5.7).

On success, the relay registers the connection, sends a `relay-peers` response, and broadcasts `relay-peer-joined` to all other clients on the same channel.

#### 4.4.2 Peer List

Immediately after authentication, the relay sends the current peer list:

```
{
  "type": "relay-peers",
  "peers": [
    { "nodeId": "<uuid>", "name": "<name>", "wakeChannel": {...}, "offline": false }
  ]
}
```

The array includes all connected peers on the same channel (excluding the requester) plus offline peers with registered wake channels (`offline: true`). Clients SHOULD treat each non-offline entry as a peer-joined event.

#### 4.4.3 Peer Presence

```
{ "type": "relay-peer-joined", "nodeId": "<uuid>", "name": "<name>" }
{ "type": "relay-peer-left",   "nodeId": "<uuid>", "name": "<name>" }
```

Broadcast to all peers on the same channel when a peer joins or leaves.

#### 4.4.4 Message Routing

On the relay, a frame is wrapped in a relay-layer _routing envelope_ — this envelope is a transport wrapper, not itself an application frame, so the §4.1 “discard frames without a `type`” rule applies to the inner `payload` (the frame), not to the envelope:

```
{ "to": "<target-nodeId>", "payload": { "type": "cmb", ... } }
```

If `to` is present, the relay forwards to that peer only. If absent, the relay broadcasts to all peers on the same channel. The relay adds `from` and `fromName` to forwarded frames. The relay MUST NOT route frames across channels.

The presence of `to` also fixes the CMB’s binding at the receiver: a frame with `to` = the receiving node is peer-bound (directed) and is delivered to the application layer unconditionally; a frame with no `to` is group-bound (autonomous) and is SVAF-gated for delivery. See §9.2.2 for the directed-vs-autonomous delivery contract.

#### 4.4.5 Keepalive

The relay sends `relay-ping` at a regular interval (RECOMMENDED: 10 seconds). Clients MUST respond with `relay-pong`. A client that misses two consecutive pings is closed with code 4005. Clients MAY send unsolicited `relay-pong` frames; the relay MUST accept them.

#### 4.4.6 Re-authentication

If the relay loses a client’s registration (e.g. relay restart behind a TLS proxy), it sends `{ "type": "relay-reauth" }`. The client MUST re-send `relay-auth` in response.

#### 4.4.7 Duplicate Identity

When a client authenticates with a `nodeId` already held by an existing connection:

-   —Fresh existing (< 5s): the relay MUST reject the newcomer with close code 4006. This prevents ping-pong loops where two processes with the same identity kick each other.
-   —Stale existing (≥ 5s): the relay MAY replace the existing connection by closing it with code 4004. The relay MUST NOT broadcast `relay-peer-left` for the replaced connection.

Clients receiving code 4004 SHOULD log the collision and MUST NOT automatically reconnect. Clients receiving code 4006 SHOULD NOT reconnect — the existing holder is the legitimate one.

#### 4.4.8 Channel Isolation

A relay MAY support multiple isolated channels. Each authentication token maps to exactly one channel. Cross-channel routing MUST NOT occur: frames, peer lists, and presence notifications are scoped to the channel. A relay with no token configured operates in open mode (single default channel, no authentication).

#### 4.4.9 Close Codes

Code

Name

Client Action

4001

Auth timeout

Retry with auth

4002

Auth invalid

Fix auth frame

4003

Invalid token

Check token config

4004

Replaced

Log collision, do NOT reconnect

4005

Heartbeat timeout

Reconnect with backoff

4006

Duplicate rejected

Do NOT reconnect

### 4.5 IPC Transport (Local)

Local tools MAY connect to a node via IPC (Unix domain socket, named pipe, or localhost TCP) to query mesh state. The framing is identical to TCP transport. IPC is an implementation convenience for local tooling (dashboards, CLI, monitoring) — it is not a substitute for peer-to-peer transport. Agents that participate in coupling MUST connect as full peer nodes via TCP or WebSocket.

The reference runtime provides a persistent IPC socket at a well-known path — an implementation convenience of the SYM runtime, not a wire requirement; a Class 1 Emitter (§17.1) need not provide it. Where provided, the socket SHOULD accept multiple simultaneous connections. Each IPC connection SHOULD remain open for the lifetime of the client application — short-lived connections (one query, then disconnect) are permitted but SHOULD be avoided by applications that query frequently.

Well-known IPC path: `~/.sym/daemon.sock` (Unix domain socket) or `localhost:19517` (TCP fallback).

### 4.6 Multi-Transport Per Peer

A peer MAY be reachable via multiple transports simultaneously (e.g. LAN TCP + WAN relay). Implementations MUST support maintaining multiple active transports for the same peer and select the highest-priority healthy transport for sending:

Priority

Transport

Rationale

1 (highest)

TCP (LAN)

Lowest latency, no intermediary, no cloud dependency

2

WebSocket Relay (WAN)

Cross-network, higher latency, relay dependency

3 (lowest)

Wake (push)

Last resort — wake the peer, then connect via 1 or 2

When a node receives an inbound connection from a peer that is already connected via a different transport, it MUST NOT reject the new connection. Instead it MUST add the new transport as a secondary path. Frames SHOULD be sent via the highest-priority healthy transport.

A transport is healthy if it has received a frame (including `pong`) within the heartbeat timeout (Section 5.4). An unhealthy transport SHOULD be closed after the timeout. The peer is only removed (peer-left event) when all transports for that peer are closed — not when a single transport drops.

This enables graceful failover: if a relay drops, the LAN transport continues. If LAN drops, the relay takes over. The peer remains connected throughout — only the active transport changes.

### Q&A

Why must each agent run its own transport?

Coupling is per-node. SVAF category weights (αf) are per-node. Memory stores are per-node. An agent that shares another node’s transport and identity cannot have independent coupling decisions. Multiple agents on the same device each run their own Bonjour advertisement, relay connection, and TCP listener. They discover each other the same way agents on different devices do — there is no special local path.

Is the resource cost of N agents acceptable?

N agents on one device means N Bonjour advertisements and N relay connections. For small N (4–8 agents), this is well within OS limits. Bonjour is designed for many services per host. Relay WebSocket connections are lightweight. The protocol correctness benefit (per-agent coupling) outweighs the marginal resource cost.



---

<!-- 5. Connection (L2) -->

## 5\. Layer 2: Connection

### 5.1 Discovery

Nodes MUST advertise via DNS-SD with service type `_sym._tcp` in the `local.` domain. The instance name MUST be the node’s nodeId.

TXT record fields:

Key

Required

Value

node-id

MUST

Node UUID

node-name

MUST

Human-readable name

public-key

MUST

Ed25519 public key (base64url, RFC 4648 Section 5)

hostname

SHOULD

Machine hostname

group

MAY

Mesh group identifier (Section 5.8). Default `"default"` if absent.

To prevent duplicate connections, the node with the lexicographically smaller nodeId MUST initiate the outbound TCP connection. The other node MUST NOT initiate.

Relay-based discovery. On platforms where mDNS is unavailable (cloud VMs, Windows without Bonjour SDK), nodes SHOULD use the relay’s `relay-peers` response as the discovery mechanism. Implementations SHOULD support both: DNS-SD for LAN, `relay-peers` for WAN.

### 5.2 Handshake

The TCP or WebSocket dialler is the **client**; the listener is the **server**. They MUST complete this authenticated exchange in order:

```
client → server  client-hello  { protocolVersion: "2.0", room, nodeId, name,
                                        identityPublicKey, e2ePublicKey, nonce,
                                        implementation, extensions }
server → client  server-hello  { same server offer, clientNonce, selectedExtensions,
                                proof, keyConfirmation }
client → server  client-finish { transcriptHash, proof, keyConfirmation }

Only after client-finish verifies: CONNECTED
```

-   —`protocolVersion` is exactly `2.0`. Product/package versions belong in the transcript-bound `implementation` object.
-   —`room` is explicit and NFC-normalized. The default room is the literal `default`; room mismatch closes the connection before peer admission.
-   —Identity and X25519 public keys are raw 32-byte values encoded as unpadded base64url. Each side contributes a fresh 32-byte random nonce.
-   —The signed transcript binds both nonces, nodeIds, names, identity keys, E2E keys, implementation identifiers, room, protocol version, both extension offers and the selected extension set.
-   —Ed25519 proofs establish identity-key possession. HMAC-SHA256 confirmations under X25519/HKDF-derived finished keys establish E2E private-key possession.
-   —No peer identity, key, role or room membership MUST be pinned before both required proofs validate. Failure closes the connection without retained peer state.
-   —The listener MUST require `client-hello` first and `client-finish` before any non-handshake frame. Timeout is 10,000 ms by default.

The byte-exact transcript, proof, HKDF and key-confirmation constructions are normative in [the handshake vector](/spec/mmp/conformance/v2/handshake-v2.json). Any lifecycle role advertised by an extension is a hint only. Authority is resolved from the signed role-grant chain, never self-declared handshake data.

### 5.2.1 Core Secure key schedule

The following construction is normative. `lp(x)` is the ASCII decimal byte length of `x`, then `:`, then the bytes of `x`. Every quoted label is an exact, case-sensitive UTF-8 byte string with no trailing NUL. HKDF is RFC 5869 HKDF-Extract followed by HKDF-Expand using SHA-256; the full transcript hash is the salt, not a zero or empty salt.

```
T  = handshakeTranscriptV2(clientOffer, serverOffer, selectedExtensions)
TH = SHA-256(T)                                      // exactly 32 bytes
sessionId = lowercaseHex(TH[0..15])                  // first 16 bytes
SS = X25519(localPrivateKey, peerPublicKey)          // exactly 32 bytes

HKDF32(info) = HKDF-SHA256(IKM=SS, salt=TH, info=UTF8(info), L=32)

clientFinishedKey = HKDF32("mmp-finished-v2 client")
serverFinishedKey = HKDF32("mmp-finished-v2 server")
clientToServerKey = HKDF32("mmp-aead-v2 client-to-server")
serverToClientKey = HKDF32("mmp-aead-v2 server-to-client")

proofPayload(role) = UTF8("mmp-handshake-proof-v2\n") ||
                     lp(role) || lp(lowercaseHex(TH))
proof(role) = Ed25519-Sign(identityPrivateKey(role), proofPayload(role))

confirmPayload(role) = UTF8("mmp-key-confirm-v2\n") ||
                       lp(role) || lp(lowercaseHex(TH))
keyConfirmation(role) = HMAC-SHA256(finishedKey(role), confirmPayload(role))
```

-   —`sessionId` is derived directly from the transcript hash; it is not an HKDF output.
-   —The X25519 shared secret and every finished or traffic key are raw 32-byte values. An invalid peer key or all-zero shared secret MUST abort authentication.
-   —The server sends the server proof and server key confirmation in `server-hello`; the client sends the client proof and client key confirmation in `client-finish`.
-   —Proofs are unpadded base64url Ed25519 signatures. Confirmations are unpadded base64url HMAC-SHA256 values and MUST be compared in constant time.
-   —The two traffic keys feed only their named direction of the `cmb-encrypted` envelope. Reversing or reusing a direction key is non-conformant.

Deprecated. The one-frame `handshake` that pins its own unproven keys is a Legacy Import/migration protocol and MUST NOT be accepted by Core Secure. `state-sync` is also retired: hidden state never crosses the wire.

### 5.3 Connection State Machine

DISCONNECTED

initial state

TCP connect / accept

AUTHENTICATING

10s timeout

client-finish + both proofs valid

CONNECTED

peer registered, frames routed

timeout / close

DISCONNECTED

peer removed, re-discover

From

To

Trigger

DISCONNECTED

AUTHENTICATING

TCP/WebSocket connect or accept

AUTHENTICATING

CONNECTED

Transcript, identity proofs and E2E key confirmations valid within 10,000 ms

AUTHENTICATING

DISCONNECTED

Timeout, malformed frame, proof failure, room/version mismatch or duplicate nodeId

CONNECTED

DISCONNECTED

Heartbeat timeout, TCP close, or error

Implementations MUST NOT process any non-handshake frame in the AUTHENTICATING state.

### 5.4 Heartbeat

Nodes MUST send a `ping` frame to each peer if no frame has been received from that peer within the heartbeat interval (SYM reference default: 10,000 ms). Upon receiving `ping`, a node MUST respond with `pong`. If no frame is received from a peer within the heartbeat timeout (SYM reference default: 120,000 ms), the connection MUST be closed. These defaults are local policy, not interoperability constants.

### 5.5 Connection Loss and Transport Failover

When a transport connection closes unexpectedly (TCP reset, timeout, OS-level close), the node MUST check whether other transports for the same peer are still active (see Section 4.6 Multi-Transport Per Peer).

-   —If other transports remain healthy: the node MUST switch sending to the next highest-priority transport. The peer MUST NOT be removed. No peer-left event is emitted. The node SHOULD log the transport switch.
-   —If no transports remain: the node MUST remove the peer from its coupling engine, discard buffered frames, and emit a peer-left event. The node SHOULD attempt re-discovery via DNS-SD.

Unexpected disconnection of a single transport MUST be treated as a transport-level event, not a peer-level event. The peer is only unreachable when all transport paths are exhausted.

### 5.6 Peer Gossip

After handshake, nodes SHOULD exchange `peer-info` frames containing known peer metadata (nodeId, name, wake channels, last-seen timestamps). This enables transitive peer discovery — a node that has never been online simultaneously with a sleeping peer can learn its wake channel through gossip from a relay node.

### 5.7 Wake

Nodes MAY register a wake channel (APNs, FCM, or other push mechanism) via the `wake-channel` frame. Peers MAY use this channel to wake a sleeping node when they have a signal to deliver. Wake requests SHOULD be rate-limited (default cooldown: 300,000 ms per peer).

### 5.8 Mesh Groups

A node MUST declare membership in one mesh room at handshake time via the explicit `room` field (Section 5.2). A room is a named cohort of nodes that exchange application-layer frames only with each other. Rooms let an operator host multiple mutually isolated meshes on the same relay or LAN segment.

Room identifier syntax. A room identifier is a string of `[a-z0-9-_.]+`, max 64 characters, case-sensitive. The literal string `default` is explicit; absence is invalid in Core Secure.

Protocol guarantee. A node in room `R_A` MUST NOT exchange application-layer MMP frames with a node in room `R_B` when `R_A ≠ R_B`. Room is part of the authenticated handshake transcript and every signed record assertion. A mismatch fails authentication; application traffic never begins.

Layer placement. A mesh room is a Layer 2 (Connection) concept. The application layer SHOULD declare its room at SDK initialisation. A relay MAY scope routing by room as defense in depth, but endpoint authentication is authoritative: the room is signed in the handshake transcript and bound into each record signature. A receiver MUST reject a frame whose authenticated room differs from its own, even if a relay misdelivers it. LAN peers perform the same check during authentication and close on mismatch with `ROOM_MISMATCH`.

Recommended naming convention (non-normative). The protocol does not parse room identifiers beyond the character set and length checks above. Operators of meshes with more than a handful of rooms SHOULD adopt a hierarchical dotted-path convention `<app>[.<environment>][.<cohort>]`, e.g. `acme.prod`, `acme.dev`, `assistants.default`, `research.lab`. The dots are convention only; tooling MAY use them for prefix grouping.

SVAF and room filtering. Authentication and room filtering run before SVAF. A record from a different room never reaches the evaluator. For an authenticated same-room record, category verdicts inform one whole-record admission result (§9.2).

The naming convention above is the complete normative surface; deeper design rationale is runtime documentation, not part of this specification.

§5.9–5.11 — Informative

Sections 5.9–5.11 describe an informative design pattern for composing meshes — not a normative wire. The single-mesh protocol (§1–§5.8, §6–§20) is complete and unaffected without it. There is one reference implementation (a gateway prototype) and it realizes only a subset of the pattern (see “Reference implementation” below); the core runtime is single-group. Adopt this as a topology pattern with a stated production-security bar, not as a shipped protocol feature.

### 5.9 Interior and Boundary (the composition idea)

A mesh presents itself to another mesh as a single node: a gateway. A gateway participates in its own interior group as an ordinary node (§5.2, single group on the wire) and presents a boundary to exterior gateways over a separate transport. It is not one handshake declaring several groups — interior participation and the exterior boundary are distinct connections.

Admit-then-reproject, not relay (the intended grammar). The pattern forbids forwarding an interior frame outward. Instead a gateway _admits_ its interior cognition through SVAF (§9) and emits a new lossy CAT7 projection (§2.7) outward — its own cognition, signed, carrying its own lineage (§15), never a relayed copy. This preserves the §5.8 guarantee (no interior frame crosses a group boundary) by construction. _Implementation status: the reference prototype does not yet do this — see below._

### 5.10 The Gateway Node

A node is a membrane over an arbitrary interior. What makes something a node is entirely its boundary behavior: a stable identity (Section 3), a CAT7 projection of its state (Section 8), and a sovereign SVAF admission of others’ projections (Section 9). The interior behind the membrane is unconstrained. Two node types share this one membrane:

Atom node

Gateway node

interior

one agent (mind + store + SVAF)

a sub-mesh (many nodes)

identity

its own

its own (it represents the interior)

projects

a lossy view of its private state

a lossy view of its interior’s aggregate cognition

admits

into its own store

into a boundary policy; MAY re-project inward

membership

one group

one interior group + an exterior boundary (Section 5.9)

A gateway node is an ordinary node whose interior happens to be a mesh; its domain lens (Section 3.1) is “represent my interior.” Because the same emit / admit grammar holds at every scale — agent, team, org, cross-org — the mesh is fractal: any mesh MAY appear as a single node inside a larger mesh.

Relation to Section 3.2. “One agent, one node” is preserved. A gateway is not a shared identity: it has its own nodeId, its own keypair, and its own SVAF. Its interior agents are separate nodes on a separate (interior) group; the gateway participates in that interior group as an ordinary node and presents an exterior boundary (§5.9) — evaluating each side through its own lens, the very property Section 3.2 protects.

No center, per level. The “no center” invariant (Section 2.3) is enforced at each boundary, not as a claim about interiors. A gateway’s interior MAY be organized however it likes — centered or not; that choice does not leak, because only the gateway’s projection crosses. A member of an outer mesh MAY therefore be a gateway over a centered interior while the outer mesh remains center-free. Federation couples meshes; it MUST NOT synchronize them.

### 5.11 Boundary Behavior

For two gateway nodes `A` and `B`, each a mesh’s membrane, all cross-mesh behavior is the existing grammar applied at the edge:

-   —Discovery. Cross-mesh discovery is by invitation or registry, not mDNS (Section 5.1 is LAN-only). `A` knows `B` as one node-id at one address; `B` is a peer, never a visible population.
-   —Projection. What crosses is `B`’s own emissions — its lossy CAT7 projection of what it admitted internally — never `B`’s raw interior CMBs.
-   —Membrane lineage. A gateway’s outward emission is a boundary root: its lineage (Section 15) MUST NOT carry the content-addresses of interior CMBs. An outer node citing it traces to the gateway and no further; the interior is opaque past the membrane, as required by hidden-state locality (Section 2.7). A gateway MAY retain the interior-to-boundary mapping privately, so it can re-project admitted outer cognition inward with correct interior lineage; that mapping MUST NOT cross the outward boundary.
-   —Faithful projection. A gateway’s outward CAT7 should be a truthful lossy summary of the interior it represents, not a material misrepresentation. Because summarization is lossy, faithfulness is attestable, not bitwise: the intended design has the gateway sign its projection and record, in an admission attestation (§6.5), the interior verdict aggregate it was derived from — so an outer admitter can weigh the boundary claim by earned authority. This attestation is part of the production security bar and is _unbuilt in the prototype_.
-   —Echo control. A cognition admitted from `A` and projected back toward `A` should origin-dedup at the boundary so cross-mesh loops do not amplify. Because a boundary root strips _interior_ lineage, the dedup cannot match interior roots; instead a boundary projection carries its own cross-mesh provenance key (a boundary address, not an interior content-address), and a reprojection cites that key — so `A` detects the loop without the interior ever being exposed. _(Unbuilt in the prototype; §15.7.1, on which an earlier draft leaned, is itself unimplemented.)_
-   —Partition. If `B` is unreachable, `A`’s mesh keeps cohering. Each mesh is independently alive; there is no cross-mesh consensus to stall on.

Boundary transport. The boundary is a dumb request/response transport (HTTP in the reference implementation): a gateway POSTs its projection to each configured peer gateway, and the peer ingests it as an opaque cross-mesh observation. The transport carries the projection only; it holds no shared store and performs no admission or routing on behalf of the meshes — a component that grew a shared store or an admission brain would be a center and must not be introduced. Discovery is by configuration (a gateway knows its peers by id + address + credential), not mDNS (§5.1 is LAN-only) and not a registry.

Production security bar

Federation crosses organizational trust boundaries, so a production gateway boundary requires, at minimum: (1) the projection is a signed cmb- CMB authored by the gateway (§18.3.1), with the `from` gateway origin-authenticated by that signature — never a self-declared, unsigned field; (2) anti-replay (the signed `metadata.createdTimestamp` plus receiver-side dedup); and (3) a boundary credential scoped to the boundary — never a full control-plane token. A boundary that accepts unsigned projections, trusts a self-declared origin, or authenticates with an admin credential is not safe for cross-org use.

Reference implementation (prototype)

The reference gateway realizes a subset: it computes a lossy summary of its interior’s cognition and HTTP-POSTs it to configured peers, which ingest it opaquely. It does not yet admit inbound projections through SVAF, reproject them inward, sign or attest its projection, or echo-dedup; its projection is a summary object, not yet a schema-valid CAT7 CMB; and it does not yet meet the production security bar above. Treat it as a prototype of the pattern, not a complete or production implementation.

Sections 5.9–5.11 are informative and change no single-mesh contract: they describe how meshes may compose, drawing on the concepts of Sections 2.3, 2.7, 3.2, and 15. 1.0.6 introduced the composition _pattern_; a normative cross-mesh wire is not claimed — the reference implementation is a prototype and the production-security bar above is a prerequisite, not a shipped guarantee. Every single-mesh node is unaffected.



---

<!-- 6. Memory (L3) -->

## 6\. Layer 3: Memory

MMP defines three memory layers with graduated disclosure:

Layer

Name

Shared

Description

L0

Events

No

Raw events, sensor data, interaction traces. Local only.

L1

Structured

Via evaluation

Content + tags + source. Shared via `cmb` frames, gated by SVAF (Layer 4).

L2

Cognitive

Never (§2.7)

CfC hidden state vectors. Strictly local — never cross the wire. Drive the node’s own inference; peer influence arrives only as CMBs.

L0 data MUST NOT leave the node. L1 data MUST be evaluated by SVAF before storage. L2 data (CfC hidden state, `h1`/`h2`) MUST NOT leave the node either — per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state is strictly local and only CMBs cross the wire. The `state-sync` frame that formerly carried these vectors is deprecated; implementations MUST NOT emit it and SHOULD ignore it on receipt.

### 6.1 Storage Interface

Implementations MUST provide a storage interface for L1 CMBs. The SDK SHOULD define a pluggable storage protocol so agents can provide their own backend. The reference implementations provide a default file-based store; agents MAY replace it with any backend that satisfies the interface:

Method

Access

Description

write(entry)

Write

Store a CMB created by this agent. Returns nil if duplicate key.

receiveFromPeer(peerId, entry)

Write

Store a remixed CMB after SVAF acceptance.

search(query)

Read

Keyword search across CMB category texts.

recentCMBs(limit)

Read

Most recent CMBs for SVAF fusion anchors.

allEntries()

Read

All entries for context building (capped by implementation).

count

Read

Total stored CMB count.

purge(retentionSeconds)

Write

Remove CMBs older than retention period. MUST preserve CMBs referenced by newer entries’ lineage.

Read-only agents (audit, compliance, monitoring): implement write methods as no-ops. The agent observes the remix graph without modifying it. This is valid for agents whose role is to trace provenance, verify lineage integrity, or report on mesh activity.

### 6.2 Storage Backends

The protocol does not prescribe a storage backend. Agents choose based on their platform and requirements:

Backend

Best for

Notes

Flat JSON files

CLI agents, daemons, prototyping

Default in reference implementations. Zero dependencies. Content-addressable filenames.

CoreData / SwiftData

iOS / macOS apps

Queryable, supports iCloud sync, handles retention via NSBatchDeleteRequest.

SQLite

Cross-platform, high volume

Indexed queries, ACID transactions, handles millions of CMBs.

Cloud (Supabase, DynamoDB)

Distributed teams, multi-device

Shared audit trail. Consider privacy — CMB category text is personal data.

In-memory

Testing, ephemeral agents

No persistence. Useful for unit tests and short-lived agents.

### 6.3 Retention

Implementations MUST support configurable retention via `retentionSeconds`. CMBs older than the retention period SHOULD be purged automatically. See [Section 19 (Configuration)](/spec/mmp/constants) for per-profile retention defaults.

Purge MUST preserve graph integrity: a CMB reachable from any retained entry by recursively following verified `metadata.lineage.parents` MUST NOT be deleted, even if past retention age. The remix chain is the audit trail — breaking it breaks provenance.

The Canon tier New in 1.1.0. A CMB whose lifecycle is `validated` or `canonical` MUST NOT be evicted by age-based retention (compaction or purge) _while it holds that lifecycle_. Committed cognition is the store’s reason to exist: `canonical` requires validation plus remix by two or more agents, so a small or single-operator mesh may never produce it — if only `canonical` were protected, such a mesh would forget everything it validated within one retention period. Protection is from _purge_, not from _demotion_: a validated CMB with no activity _MAY_ still decay to `archived` per the §6.4 lifecycle (`archiveAfterSeconds`, §19), after which ordinary retention applies — the escape valve that keeps the store bounded (implementation status: [§17.6](/spec/mmp/conformance#implementation-status)). `canonical` deliberately has no inactivity decay: it records collective consensus (validation plus independent remix), and consensus does not expire by silence — it leaves the Canon only by an explicit dismiss or archive under validator-or-above authority (§6.5).

Regulated domains (legal, finance, health) MUST set retention according to their compliance requirements. The protocol does not define regulatory retention periods — consult jurisdiction-specific guidance (MiFID II, SEC Rule 17a-4, HIPAA, GDPR).

### 6.4 CMB Lifecycle

Each CMB progresses through a lifecycle that determines its influence on future SVAF evaluations. The lifecycle is driven by mesh activity — not by time alone.

State

Temperature

Trigger

Anchor Weight

Description

observed

hot

Agent calls `remember()`

1.0

Initial observation. Subject to temporal decay. Active in SVAF fusion.

remixed

warm

Peer remixes this CMB (appears in `lineage.parents`)

1.5

Another agent found this signal relevant enough to produce new knowledge from it. Higher anchor weight in future SVAF evaluations.

validated

warm

Human acts on this CMB (marks decision as done)

2.0

A human confirmed this signal by acting on it. The validation CMB carries `lineage.parents` pointing to the validated CMB. Validated knowledge shapes future evaluations more than unvalidated signals. Protected from retention purge while validated (§6.3, Canon tier).

dismissed

cold

Human dismisses this CMB (not actionable)

0.5

A human reviewed and rejected this signal. Reduced anchor weight. Broadcasts to mesh as feedback — producing agent sees its signal was rejected. MUST NOT resurface as an actionable decision.

canonical

cold

Validated + remixed by 2+ agents

3.0

Collective consensus — multiple agents and a human agree this knowledge is significant. Protected from retention purge. Highest anchor weight.

archived

whisper

No remix for `archiveAfterSeconds` (default: 30 days)

0.5

No agent has found this signal relevant. Reduced anchor weight but preserved for lineage integrity. MAY be purged if no descendants reference it.

The lifecycle branches at human judgment: observed → remixed → validated → canonical (upward path) or observed → dismissed (downward path). Dismissal is a terminal state — a dismissed CMB does not advance to validated or canonical. Without any activity, a CMB decays toward archived. Archived and dismissed CMBs MAY re-emerge if a future remix references them — re-entry resets the archive timer.

Validation is the key transition that connects human judgment to the mesh. When a human acts on agent output (approves a decision, sends an email, completes a task), the action SHOULD be recorded as a new CMB with `lineage.parents` pointing to the CMB that prompted the action. This validation CMB enters the mesh like any other signal — agents receive it via SVAF and adjust their understanding. The mesh learns from human actions without special API calls or out-of-band configuration updates.

Anchor weight influences SVAF evaluation: when computing per-category drift against local anchors, canonical and validated CMBs contribute more to the fused anchor vector than observed or archived CMBs. This creates a natural hierarchy where human-confirmed knowledge and collective consensus outweigh raw observations — without overriding agent autonomy. Each agent still evaluates incoming signals through its own category weights.

### 6.5 Validation Authority

The transition from `remixed` to `validated` is the most consequential lifecycle event — it commits human or authorised-agent judgment to the mesh and permanently increases anchor weight from 1.5 to 2.0. This transition MUST be restricted to nodes with appropriate lifecycle roles (Section 3.5).

When a receiving node processes a validation CMB (one whose `lineage.parents` points to an existing CMB), it MUST resolve the _author’s_ role through the anchor-rooted grant chain (§6.6) — never the `createdBy` string, and never the peer’s advertised handshake role:

-   —If the author _resolves_ to validator or anchor, the parent CMB advances to `validated` (if action completed) or `dismissed` (if not actionable).
-   —Otherwise the parent CMB advances to `remixed` only. The CMB is stored normally but confers no validation.

This prevents agent-level spoofing of validation authority. An agent cannot self-promote to validator by including “founder” or “validator” in its CMB text categories. The authority is bound to the node’s cryptographic identity and the `role-grant` chain from an existing validator (Section 3.5.1).

Role verification & admission weight. Authority is the _resolved_ role, never the advertised one. A node MUST NOT grant any authority-weighted treatment — lifecycle advancement, or the elevated _origin_ admission weight a validator/anchor’s own CMBs receive (§6.4) — on the basis of a handshake `lifecycleRole` or a `createdBy` string. That origin weight MUST derive from the author’s chain-resolved role, and the elevation additionally requires a verified signature binding the CMB to that author. A single node that could self-declare `anchor` would otherwise double the admission weight of everything it emits — the highest-leverage poisoning primitive — which is exactly why the weight is gated on the resolved role. Where no anchor is pinned there is no root of trust: an implementation has no cryptographic authority to resolve and MUST treat all roles as unauthenticated — a closed/development mode only. Production deployments MUST pin an anchor.

Dismiss vs. validate: These are distinct lifecycle transitions with different consequences. **Validate** (Done): parent CMB advances to `validated` (anchor weight 2.0). The mesh learns what humans value. **Dismiss** (Not actionable): parent CMB advances to `dismissed` (anchor weight 0.5). The dismissal broadcasts as feedback — the producing agent sees its signal was rejected, and similar future signals score lower in SVAF evaluation. Both require validator or anchor role. Both broadcast to the mesh. The effectiveness of this feedback depends on the content quality of the dismissal CMB — see [Section 11 (Feedback Modulation)](/spec/mmp/feedback) for normative content requirements.

Boundary attestation. The same validation authority governs cognition that crosses a mesh boundary. A gateway node (Section 5.10) that emits a lossy projection of its interior on the interior’s behalf SHOULD sign that boundary emission and record, in its admission attestation, the interior verdict aggregate it was derived from — so an outer admitter can weigh the boundary claim by earned authority exactly as it weighs any peer. Interior and boundary trust are the same mechanism at two scales; see Section 5.11.

### 6.6 Authority Lifecycle: Grants, Resolution & Revocation

Authority that cannot be lost is decoration. This section defines how a role is conferred, resolved, and withdrawn — the mechanism §6.5 gates on.

Root of trust. Exactly one `anchor` is pinned out-of-band (its nodeId + public key) — configuration a receiver already trusts, not a claim made on the wire. The anchor is non-earnable; all other authority descends from it.

Grant / revoke frames. A `role-grant` confers a role on a grantee; a `role-revoke` withdraws it. Both are signed (§7 frame table; §18.3.1) by the grantor over the action, grantee, conferred role, grantor, grant time, and — for a grant — the grantee’s vouched public key. The vouch distributes keys along the chain: a node that never handshook the grantee learns its key tamper-evidently from a rooted grant (swapping it breaks the grantor’s signature), and a grant-sourced key MUST NOT override a key already learned from a stronger source (a direct handshake or the anchor).

Resolution. A node’s role at time _T_ is resolved, not stored: the anchor is `anchor`; otherwise replay the node’s grants and revokes in chronological order up to _T_. A grant confers its role only if the grantor was authorised _when it granted_ AND is still authorised _at T_ (the grantor is resolved recursively, and must itself root at the anchor); a revoke clears the role if the revoker was authorised when it revoked. An unrooted or cyclic chain confers nothing; a grant a node was not entitled to make is stored but inert.

Revocation is effective, and does not rewrite the past. Because a grantor is re-resolved at the query time, revoking a grantor cascades — every role it granted resolves back to participant. Resolution is time-parameterised, so a revoke cuts _future_ authority without invalidating what was legitimately done before it (an incoming CMB is judged at receipt; a stored attestation at its own emission time). And because a grant requires the grantor to be authorised _both_ at grant time and now, a compromised-but- revoked grantor MUST NOT resurrect authority by signing a fresh grant backdated before its own revoke — the backdated grant’s grantor re-resolves as revoked, so the grant is inert. Demotion is revocation, optionally followed by a lesser re-grant. Grant timestamps are grantor-asserted and unwitnessed, which is precisely why authority is gated on re-resolution, not on a trusted clock.

Durability & integrity. Grants and revokes are gossiped to the roster and persisted append-only. The record has no integrity of its own, so an implementation MUST re-verify every record’s signature on load — top-down from the pinned anchor, using each verified grant’s vouched key to reach the next — and MUST NOT trust an on-disk record merely because it is present; a record not reachable from a verified anchor-rooted chain is dropped.

Identity vs. authority. This section withdraws _authority_. A compromised signing _key_ is a different failure: MMP does not define key rotation (§3.4) — a node whose key is compromised generates a fresh identity and re-earns its role, while revoking its grants contains the damage in the meantime. Anchor-key compromise is root compromise, recovered only by re-pinning a fresh anchor out-of-band.

§6.7 — New in 1.1.0 — work layer

Section 6.7 is a normative addition in 1.1.0 (the work layer): it defines how a real-world outcome is recorded against cognition and what that record may — and may not — do to lifecycle. It changes no 1.0.x wire contract; a 1.0.x node treats grounding CMBs as ordinary CMBs.

### 6.7 Grounding — Outcomes Carried by Lineage

Validation (§6.4–§6.5) records _judgment_ — someone with authority committed to a CMB. Grounding records _evidence_ — reality answered: the tests passed, the work shipped, the prediction held, or it did not. The two are deliberately distinct: a fast, self-referential mesh can mechanize _coherence_ only; connecting cognition to the world requires an external outcome carried by lineage.

The grounding CMB. A grounding CMB is an ordinary CAT7 CMB whose `intent` is `ground`, whose `lineage.parents` contains the CMB(s) it grounds, and whose `commitment` carries the outcome, prefixed `verified:` or `failed:`. Any other commitment form is not a recognised outcome. It is emitted, signed (§8.7, §18.3.1), broadcast, SVAF-evaluated, and remixed like any other CMB — no new frame, no new field. A receiver that verifies signatures MUST reject an unsigned grounding CMB like any other unsigned CMB.

Repeat verification and the redundancy band. A verification report about a row the receiver already holds typically scores high alignment against exactly that row, so under an unmodified §9.2 gate, the better established a row, the harder it becomes to ground or re-ground it — repeat verifications are progressively refused as redundant, and the accepted-grounding stream of any one row self-quenches (a packing bound: only finitely many reports can each clear the redundancy separation, ever, absent retention purges). Sustained outcome tracking is load-bearing for the mesh being a learner rather than an accumulator, so acceptance of a grounding is exempted from exactly one band: a receiver MUST NOT refuse a recognised grounding CMB (signed, verified, `intent = ground`, recognised outcome prefix, lineage naming a target the receiver holds) _solely_ because it is redundant against its target row or against previously admitted groundings of that target. The reject band (foreign content), the signature requirement, and the receiver’s trust weighing all stand unmodified. This is an _acceptance-side_ rule and does not weaken the §15.7 anti-echo emission gate (§15.7.2: what legitimises a grounding emission is the fresh outcome observation behind it); spam through the waiver is bounded by the content address itself — a byte-identical repeat confirmation carries the same `cmb-` key and deduplicates, so only _distinct_ verification reports pass, and implementations MAY additionally rate-cap accepted groundings per (target, author) pair.

The failure channel is load-bearing. The signed outcome pair is not symmetric decoration: when recall preferentially re-uses highly-weighted rows, the `failed:` channel is the mechanism that makes preferential sampling self-correcting — a stale favourite’s absorbed grounding traffic drives its weight _down_ — while a positive-only mesh locks onto early favourites at chance-level precision. An agent that observes a failure outcome MUST NOT suppress it while continuing to emit success outcomes for the same class of work; selective success-only grounding defeats the self-correction the outcome channel exists to provide. (Informative: the self-correction additionally requires outcome reports to be better than chance — miscalibrated reporting that is wrong more often than right converts the same coupling into entrenchment.)

Consuming the outcome stream (informative). A consumer that scores rows by their accepted groundings faces a bias–variance choice with a known theory. Pure accumulation (all-time counts) is the efficient estimator only while the useful set is stationary; under drift its staleness bias makes its ranking degrade toward chance. A recency-decayed signed sum tracks drift with bounded risk; its half-life trades noise against lag, with the optimum scaling as `(V / (4μ²δ²))^(1/3)` in the drift rate δ — a fixed half-life therefore pays a longer dominance horizon (Θ(δ−1) instead of Θ(δ−2/3)), and the tuned horizon is recoverable online by estimating drift with a growing-window slope probe (a fixed pair of probe timescales degenerates back to the fixed-half-life exponent; the growing-window form recovers the tuned one even on sparse signed ±1 outcome streams). Decayed sums should be mass-normalised (one extra scalar) — the raw zero-initialised form carries an initialization transient that delays its advantage by a log factor. Zero-clamping per-node sums before cross-node aggregation discards the negative evidence the failure channel carries; consumers that clamp should know the self-correction analysis above assumes the signed form.

An outcome is an attestation, not a fact. The grounding CMB asserts that its _author_ observed the outcome. Its weight follows the author’s resolved authority (§6.5–§6.6) exactly as any other CMB’s does; the reserved intent value adds semantics, never authority.

Groundedness is receiver-relative. A CMB is _grounded_, in the view of a given node, iff a recognised grounding CMB targeting it (directly, or via a verified direct-parent path through the node’s admitted remixes, §15.2) is present in that node’s own store. There is no global grounded state; a node MUST NOT treat cognition as grounded on the strength of a grounding entry it never admitted. Grounding runs upward only — a grounding CMB grounds the CMBs its lineage points at, never descendants of those CMBs: a remix of verified cognition is not itself verified.

Outcomes are observations of a changing world. When several recognised grounding CMBs target the same cognition in one store, the latest by stored time wins: a later `failed:` un-grounds what an earlier `verified:` established (a regression must surface, not be shadowed by history). “Stored time” is the receiver-local time the entry entered the evaluating store — never the author-asserted `metadata.createdTimestamp`, which is unwitnessed (§6.6) and would let a backdated or future-dated attestation game the ordering. Authority modulates whether to _act_ on an attestation, not the temporal ordering of observations — and latest-wins applies within an authority tier, not across tiers. Hard-gate reading (normative): a `failed:` from an author below the authority of the standing `verified:` MUST NOT un-ground it — a below-validator `failed:` cannot overturn a validator-or-above `verified:`. This is the tested-effective form: a soft authority-weighted vote is defeated by sheer low-authority volume, whereas the tier gate holds a validated outcome against any number of below-tier `failed:` reports (see the §18.4 threat note on outcome griefing). Within a tier — equal authority, or a genuine same-authority regression — latest-wins still applies, so a real regression surfaces.

Grounding never advances lifecycle by itself. §6.5 stands unweakened: a CMB cannot self-grant effect, and a grounding CMB is a CMB. A node _MAY_ advance its own store’s entries to `validated` on grounding evidence — evidence-based validation — but only as an explicit act under validator-or-above authority (§6.5–§6.6), never as an automatic consequence of receiving or reading a grounding CMB, and never as a side effect of a query. The elevating authority is accountable for the judgment; it _SHOULD_ require `verified:` polarity and weigh the grounding author’s resolved authority before acting. Self-reported outcomes from unauthenticated or participant-rank authors _SHOULD NOT_ trigger elevation.

The team Canon (informative). No shared store exists. A member’s _Canon_ is the validated/canonical ∪ grounded cognition of its own store — including remixes its own SVAF admitted from teammates. What a cockpit renders as a “team Canon” is the emergent overlap of members’ Canons, read from same-host stores only (a remote member’s store is sovereign and is never fetched). Adoption is meaningful precisely because every admission was autonomous.

### Q&A

Why a pluggable storage interface instead of prescribing a backend?

Agents run on different platforms with different constraints. A CLI agent on a server uses flat files. An iOS app uses CoreData with iCloud. A compliance agent needs a cloud database with audit logging. The protocol defines what to store and how to query it — not where to put it.

Can an agent use read-only storage?

Yes. Audit and compliance agents observe the remix graph without modifying it. They implement write methods as no-ops and read from shared storage. This is how regulators trace the decision chain without participating in it.

What happens when a protected CMB’s last descendant is purged?

If its protection came from lineage (a newer entry referencing it), it is no longer protected and will be purged in the next retention cycle — that protection is dynamic, it follows the live graph. Canon-tier protection (§6.3) is different: a CMB at validated/canonical lifecycle is exempt from age purge regardless of graph state, for as long as it holds that lifecycle.

How does human validation enter the mesh?

When a human acts on an agent’s output (approves a decision, completes a task), the action is recorded as a new CMB with lineage pointing to the signal that prompted it. This CMB enters the mesh like any other signal — agents evaluate it through SVAF and adjust their understanding. No special API, no out-of-band config. The mesh learns from human actions through the same channel it learns from agents.

Why do validated CMBs have higher anchor weight?

A human acting on a signal is the strongest confirmation that the signal was correct and actionable. Giving validated CMBs higher anchor weight means future SVAF evaluations are shaped by confirmed knowledge rather than speculation. This does not override agent autonomy — each agent still applies its own category weights. It means the anchors against which incoming signals are compared are more trustworthy.

Why must validation authority be identity-bound?

If any agent could advance a CMB to validated by producing a CMB with lineage, an agent could dismiss founder decisions or fake human approval. Binding validation to cryptographic node identity (Section 3.5) ensures only explicitly authorised nodes — the founder’s node or promoted agents — can affect lifecycle transitions. The content of the CMB (perspective, intent) is informational; the authority comes from who created it.

Can an agent earn validator role automatically?

The protocol defines the role-grant mechanism (Section 3.5.1) but does not prescribe automated promotion criteria. An implementation MAY define heuristics (e.g. promote after N remixes cited by peers), but the grant itself MUST come from an existing validator via a signed role-grant frame. This keeps the trust chain auditable.



---

<!-- 7. Frame Types -->

## 7\. Frame Types

All frames are JSON objects with a `type` field (string). Implementations MUST silently ignore frames with unrecognised type values to allow forward compatibility.

### 7.1 Frame Type Registry

The table is rendered from the normative [machine-readable frame registry](/spec/mmp/frame-registry.json); its own shape is validated by [frame-registry.schema.json](/spec/mmp/schema/frame-registry.schema.json).

Type

Layer

Gated

Status

Schema

Fields

client-hello

2

No

core

[handshake.schema.json](/spec/mmp/schema/handshake.schema.json)

First authenticated handshake offer.

server-hello

2

No

core

[handshake.schema.json](/spec/mmp/schema/handshake.schema.json)

Server offer, negotiated extensions, transcript proof and key confirmation.

client-finish

2

No

core

[handshake.schema.json](/spec/mmp/schema/handshake.schema.json)

Transcript hash, client proof and key confirmation.

cmb

3/4

SVAF

core

[cmb-frame.schema.json](/spec/mmp/schema/cmb-frame.schema.json)

Signed CAT7 record assertion.

cmb-encrypted

2/3

After decrypt

core

[encrypted-cmb-frame.schema.json](/spec/mmp/schema/encrypted-cmb-frame.schema.json)

Directional ChaCha20-Poly1305 envelope with session, sequence, routing metadata and sealed record bytes.

cmb-fetch

3

No

core

[cmb-fetch.schema.json](/spec/mmp/schema/cmb-fetch.schema.json)

Request a record by exact content address.

cmb-fetch-result

3

No

core

[cmb-fetch-result.schema.json](/spec/mmp/schema/cmb-fetch-result.schema.json)

Self-verifying result for an exact content-address request.

role-grant

3

Authority

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Signed, anchor-rooted lifecycle role grant.

role-revoke

3

Authority

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Signed revocation of a lifecycle role grant.

peer-info

2

No

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Authenticated-room peer and wake-channel gossip.

wake-channel

2

No

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Platform wake-channel registration.

error

2

No

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Protocol error code, message and optional bounded detail.

ping

2

No

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Peer keepalive request.

pong

2

No

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Peer keepalive response.

relay-auth

1

Relay auth

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Authenticate a node to a relay.

relay-peers

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay peer directory.

relay-ping

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay keepalive request.

relay-pong

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay keepalive response.

relay-reauth

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Request a fresh relay-auth frame.

relay-peer-joined

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay presence notification.

relay-peer-left

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay departure notification.

relay-error

1

No

transport

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay-level error.

state-sync

deprecated

No

legacy

—

Reserved legacy type. MUST NOT emit; ignore on receipt.

message

legacy

No

legacy

—

Legacy unsigned application message.

mood

legacy

No

legacy

—

Legacy mood fast path; Core Secure carries mood inside CAT7.

xmesh-insight

legacy

No

legacy

—

Legacy runtime projection.

All cognitive content — observations, decisions, feedback, directives — MUST be sent as `cmb` frames. Only `cmb` frames enter SVAF evaluation, produce anchor weights, and modulate CfC state.

The registry distinguishes Core Secure wire types from retained legacy and runtime-extension types. A Core Secure participant MUST complete the three-frame authenticated handshake before it accepts `cmb` or `cmb-encrypted`. It MUST NOT silently downgrade to the legacy one-frame `handshake` or to an unsigned application frame.

The `relay-*` types are transport-scope (Section 4.4): they are exchanged between a node and a relay, never between peers, and never reach the application layer. The relay forwards peer frames as opaque payloads (Section 4.4.4) and does not originate any of the peer-scope types above.

Deprecated — `state-sync`. The `state-sync` frame carried a node’s hidden-state vectors (h₁, h₂). Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state MUST NOT cross the wire. Implementations MUST NOT emit `state-sync` and SHOULD ignore it on receipt. It is retained in this registry only to reserve the type and document the deprecation; all peer influence flows through `cmb` frames evaluated by SVAF.

### 7.2 Error Frame

When a node encounters a protocol-level error, it SHOULD send an `error` frame before closing the connection (if applicable). Error frames are informational — the receiving node MUST NOT treat them as commands.

Code

Name

Action

Description

1001

VERSION\_MISMATCH

Close

Peer version is incompatible

1002

DIMENSION\_MISMATCH

Reject frame

Vector dimension mismatch (legacy state-sync; deprecated — see §2.7)

1003

FRAME\_TOO\_LARGE

Close

Frame exceeds MAX\_FRAME\_SIZE

1004

HANDSHAKE\_TIMEOUT

Close

No handshake within deadline

1005

DUPLICATE\_NODE

Close

nodeId already connected

2001

SVAF\_REJECTED

None

Memory-share rejected by SVAF (informational)

1006

AUTHENTICATION\_FAILED

Close

Transcript signature or key confirmation failed

1007

ROOM\_MISMATCH

Close

Authenticated room does not match the local room

1008

REPLAY\_DETECTED

Close

Encrypted-frame counter repeated or moved backwards

Codes 1xxx are connection-level (close connection). Codes 2xxx are evaluation-level (informational). Error frames MUST NOT contain sensitive information.

### 7.3 Type Naming and Extensions

Frame types are identified by their `type` string value. Core types (this specification) MUST NOT be redefined by extensions. Extension types MUST use `<extension>-<name>` format. Vendor types MUST use `x-<vendor>-<name>` format and MUST be silently ignored by non-supporting nodes.

### Q&A

Why MUST nodes silently ignore unknown frame types?

Without this rule, you can never add new features to the protocol. If a node crashes or rejects unknown frame types, then deploying a new extension (like mesh groups) requires upgrading every node on the mesh simultaneously — impossible in a peer-to-peer system. Silent ignore means old nodes and new nodes coexist: a node running a new extension sends its frames, and nodes that don’t support the extension simply ignore them. No crash, no error, the mesh keeps working. When a node adds support later, it handles the frame. No coordinated upgrade needed. This is the same principle used by HTTP (unknown headers ignored), TCP (unknown options skipped), and HTML (unknown tags ignored). Every successful protocol is evolvable because of this rule.

What happens if a relay receives an unknown frame type?

The relay forwards it. The relay is a dumb transport pipe — it wraps the payload in a { from, fromName, payload } envelope and sends it to the target or broadcasts it. It never inspects the payload type. This means extension frames (group, vendor, future types) flow through the relay without any relay changes. The intelligence is at the endpoints, not the transport.

Can an extension frame break an existing node?

No, if the node follows Section 7. The frame handler switches on msg.type. Unknown types fall through with no match and no action. The node’s cognitive state, memory, and coupling are unaffected. This is a hard requirement — implementations that reject or error on unknown types are non-conformant.



---

<!-- 8. CMBs (CAT7) -->

## 8\. Cognitive Memory Blocks (CAT7)

A Cognitive Memory Block (CMB) is an immutable structured memory unit. Each CMB decomposes an observation into 7 typed semantic categories (the CAT7 schema). CMBs are the data structure that flows between agents via `cmb` frames.

Forward compatibility. Implementations MUST silently ignore unrecognised CMB categories. A node that receives a CMB carrying additional categories from a future version MUST process the 7 known CAT7 categories and discard any others without error. This allows schema evolution without breaking existing deployments.

### 8.1 Why 7 categories

The 7 categories form a minimal, near-orthogonal basis spanning three axes of human communication: what (focus, issue), why (intent, motivation, commitment), and who/when/how (perspective, mood). They are universal and immutable — domain-specific interpretation happens in the category text, not the category name. A coding agent’s `focus` is “debugging auth module”; a fitness agent’s `focus` is “30-minute HIIT workout.” same category, different domain lens.

`mood` is the only fast-coupling category — affective state (valence + arousal) crosses all domain boundaries. The trained [SVAF](/spec/mmp/coupling) model studied in the SVAF paper converged on the same rule: `mood` emerged as the highest gate value (0.50) without supervision — a research result consistent with affect being universally relevant across agent types. (The deployed evaluator is the heuristic baseline, Section 9.2.1.) All other categories couple at medium or low rates, with per-agent αf weights controlling relative importance.

New agent types join the mesh by defining their αf category weights — no schema changes, no protocol changes. The 7 categories are fixed. The weights are per-agent.

### 8.2 Category Schema

Implementations MUST use the following 7 categories in this order:

Index

Category

Axis

Captures

0

focus

Subject

What the text is centrally about

1

issue

Tension

Risks, gaps, assumptions, open questions

2

intent

Goal

Desired change or purpose

3

motivation

Why

Reasons, drivers, incentives

4

commitment

Promise

Who will do what, by when

5

perspective

Vantage

Whose viewpoint, situational context

6

mood

Affect

Emotion (valence) + energy (arousal)

Each category carries signed symbolic text and content-address metadata. A receiver derives any machine-comparable embedding locally from that signed text; embedding vectors never cross the wire. The `mood` category additionally carries optional numeric `valence` (-1 to 1) and `arousal` (-1 to 1) values.

A CMB MUST NOT be modified after creation. When an agent remixes a CMB, it MUST create a new CMB whose `metadata.lineage` contains `parents` (direct parent CMB keys) and `method` (the fusion method used). Transitive provenance is obtained by recursively resolving those signed parent records. A sender MUST NOT supply or rely on an unauthenticated transitive-closure field.

### 8.2.1 Content Address & Canonical Serialization

A CMB’s `key` is a content address: a SHA-256 hash over a fully specified canonical serialization of the block. The `metadata.addressScheme` field identifies the derivation; the shared `cmb-` prefix alone does not. Two independent conforming implementations MUST compute the identical key for the same logical CMB — the key is both the node identity in the lineage DAG and the value the author signature binds (§18.3.1), so any divergence breaks lineage, dedup, citation, and integrity. The [published test vectors](/spec/mmp/conformance) are the normative contract. The GitHub protocol repository carries a manually synchronized mirror for offline use and contribution workflows.

Superseded 1.x derivation — INFORMATIVE, not normative in 2.0. The earlier format wore the _same_ `cmb-` prefix over a different digest, which is exactly why it is recorded here rather than dropped: an implementation that meets it by accident produces a plausible key for the wrong content, and the divergence is silent. It is distinguishable by length — 32 hex characters against the current 64 — and the reference runtime **rejects** it outright (§8.2.1: valid _iff_ 64 lowercase hex, anything else refused rather than reinterpreted). A conformant node therefore MUST NOT mint it and SHOULD NOT accept it; a node holding blocks addressed this way MAY continue to read its own history. 1.x stated that a conforming node MUST verify this form — that requirement is **withdrawn**, because no deployed node does, and a specification that requires what nothing implements is the defect 2.0 exists to correct. Specified byte-exactly so it can be recognised and refused:

```
key = "cmb-" + first 32 hex chars of SHA-256( UTF-8( focus.text + "|" + issue.text + "|"
              + intent.text + "|" + motivation.text + "|" + commitment.text + "|"
              + perspective.text + "|" + mood.text ) )

// category order per §8.2; mood contributes its text only; empty categories contribute "";
// no Unicode normalization.
```

This scheme has three known weaknesses, which the successor resolves: the `|` join is not injection-proof (a delimiter inside a category can shift a boundary), text is not Unicode-normalised (NFC vs NFD diverge), and the 128-bit truncation gives only 64-bit collision resistance.

Normative record — see [§8.8 Record Model](/spec/mmp/record). The address is `"cmb-"` + 64 lowercase hex, and the digest is a **promote-odd Merkle root over the seven per-category keys**, not a hash of a concatenated preimage. This section gives the cognition-key construction byte-exactly; §8.8 makes the construction implementable and reproducible from that text alone.

Why this section changed in 2.0. Through 1.1.0 this page specified a flat `SHA-256` over a length-prefixed concatenation of the seven category texts plus a role tag. The implementation mints the Merkle form. **Both wear the same `cmb-` prefix**, so an implementation built to the older text computes a _different address for the same content_ and nothing signals the mismatch — it fails silently, at every record. That is the divergence 2.0 exists to close.

Schemes a node may encounter. The reference implementation classifies three: `block-v2` — the Merkle form, and the _only_ form it mints — together with `root-v1` and `remix-v1`, the earlier flat derivations, retained so older records can still be classified. A conforming node MUST mint `block-v2`.

-   Category text MUST be Unicode NFC-normalised (UAX #15). Category order is the fixed CAT7 order. Mood contributes its **text only**; valence, arousal and all vector embeddings are excluded from the address.
-   Netstring length-prefixing makes each per-category preimage injection-proof with no escaping and no JSON-canonicalization dependency, so implementations in different languages agree byte-for-byte.
-   A record binds **content only** — identical content by any author at any time yields one address. Descent is committed alongside the address in the signature (§8.8.4), never folded into it, so that collapse property is preserved.
-   The full 256-bit width is normative: a truncated hash’s birthday bound would admit a grind-then-substitute attack against the signed key.

### 8.3 Category-by-Category Guide

The schema is fixed. The interpretation is sovereign. each category below gives a definition, the rationale for why the category earns a slot in a 7-category minimal basis, and three cross-domain examples showing how agents from different domains populate the same category.

`focus` Subject

What the observation is centrally about.

Every observation has a subject. Without focus, a receiver cannot determine if the signal is even in its domain. Focus is the first filter — a fitness agent seeing focus="debugging auth module" knows immediately this is outside its domain.

Coding: “debugging OAuth token refresh logic”

Fitness: “30-minute HIIT workout completed”

Legal: “merger due diligence review”

`issue` Tension

Risks, gaps, problems, assumptions, open questions.

Issues cross domain boundaries more than most categories. A coding agent’s "user exhausted after 8 hours" is an issue that the fitness agent and music agent both care about. Issue is the tension that drives action — agents without tension have nothing to act on.

Coding: “memory leak causing crashes every 2 hours”

Fitness: “sedentary 3 hours, no movement detected”

Finance: “revenue recognition discrepancy found”

`intent` Goal

Desired change or purpose.

Intent captures what the agent or user is trying to achieve. It is domain-specific — a coding agent’s intent ("ship the feature") is irrelevant to a music agent. In the SVAF paper’s trained model, intent learned the lowest gate value (0.07) — goals don’t transfer across domains (the deployed evaluator is the heuristic baseline, Section 9.2.1).

Coding: “complete feature implementation by end of sprint”

Music: “match playlist energy to user mood”

Support: “resolve customer complaint within 24 hours”

`motivation` Why

Reasons, drivers, incentives behind the observation.

Motivation answers "why does this matter?" When a fitness agent observes "recommended stretch break", the motivation ("prevent burnout from prolonged sitting") tells other agents WHY the recommendation was made, helping them decide if the reasoning applies to their domain too.

Coding: “technical debt blocking new feature development”

Fitness: “declining energy pattern over past 3 hours”

Marketing: “competitor launched similar product yesterday”

`commitment` Promise

What has been established — who will do what, by when.

Commitment captures obligations and active states. "Coding session with Claude" tells other agents what is currently happening. "Surgery scheduled for Thursday" tells agents about future constraints. Regulated domains (legal, finance) weight commitment highest because obligations are non-negotiable.

Coding: “coding session in progress, 2 hours in”

Scheduling: “team standup in 15 minutes”

Legal: “filing deadline March 31, non-negotiable”

`perspective` Vantage

Whose viewpoint, situational context.

Perspective captures the lens through which the observation was made. "Developer, late night session" is different from "developer, morning standup" — same domain, different context. In the SVAF paper’s trained model, perspective learned the lowest gate value (0.06) — viewpoint is the most sovereign category, rarely useful across domains.

Coding: “senior developer, deep work session, afternoon”

Fitness: “fitness agent, daily activity tracking”

Recruiting: “hiring manager, culture fit assessment”

`mood` Affect

Emotion (valence: -1 to 1) + energy (arousal: -1 to 1). Dual representation: numeric for comparison, text for semantic richness.

Mood is the only fast-coupling category — affective state crosses ALL domain boundaries. A fitness agent, music agent, and coding agent all benefit from knowing the user is exhausted (v: -0.6, a: -0.4). The trained model in the SVAF paper converged on the same design: mood gate = 0.50 (highest), without supervision. Every agent should attend to mood regardless of domain.

Coding: “frustrated, low energy (v: -0.6, a: -0.4)”

Music: “calm, restorative (v: 0.3, a: -0.5)”

Fitness: “energized after workout (v: 0.7, a: 0.6)”

### 8.3.1 Well-Known Intent Values Informative · New in 1.1.0

`intent` is free text and stays free text — this registry reserves no syntax and adds no category. It records conventions that have emerged in practice, so independent implementations converge on the same vocabulary. The registry is informative and extensible: an unknown intent value MUST be treated as ordinary content, and behavior MUST NOT be keyed on unrecognised values. Per §6.5, content is informational — authority always comes from who created the CMB, never from what its intent says.

value

meaning

semantics

charter

A member’s purpose self-declaration on joining

Root of the member’s trail (§14.12); none normative

decision

A choice made during work

Chained by `lineage.parents` to the prior trail entry (§14.12); none normative

artifact

The deliverable a work trail produced

Trail head at completion (§14.12); none normative

ground

An outcome attestation against the CMBs in its lineage

The one entry with attached receiver-side semantics — defined normatively in [§6.7](/spec/mmp/memory#grounding); interpretation remains receiver-local policy

acknowledge

A reaction noting relevance to the agent’s charter

De-facto (operator loop); none normative

`ground` is the protocol’s first intent value with any attached semantics; the precedent is deliberately narrow. Those semantics bind the _receiver’s_ optional interpretation only — they confer nothing on the emitter, and §15.7.2 explains why no intent value exempts an emission from the new-domain-data rule.

### 8.4 Per-Agent category weights (αf)

The schema is fixed. The weights are per-agent. New domains join the mesh by defining their αf weights — no schema changes, no protocol changes. Regulated domains (legal, finance) weight `issue` and `commitment` highest; human-facing domains (music, fitness, health) weight `mood` highest; knowledge domains (coding, research) weight `focus` highest.

Agent

foc

iss

int

mot

com

per

mood

Coding

2.0

1.5

1.5

1.0

1.2

1.0

0.8

Music

1.0

0.8

0.8

0.8

0.8

1.2

2.0

Fitness

1.5

1.5

1.0

1.5

1.0

1.0

2.0

Knowledge

2.0

1.5

1.5

1.0

0.5

1.5

0.3

Legal

2.0

2.0

1.5

1.0

2.0

1.5

0.5

Health

1.5

2.0

1.0

1.5

1.0

1.5

2.0

Finance

2.0

2.0

1.5

1.0

2.0

2.0

0.3

### 8.5 Artifacts

Agents produce two types of output: signals (CMBs — structured 7-category observations) and artifacts (documents, analyses, drafts, code — full-length content that a CMB references). A CMB is the signal on the mesh. An artifact is the substance behind it.

When an agent produces an artifact, it SHOULD share a CMB to the mesh that references the artifact location in the `commitment` category using the `artifact:` prefix:

commitment: "artifact: research/agent-memory-comparison.md"

The CMB’s other 6 categories summarise what the artifact contains — the `focus` captures the key finding, `issue` captures the gap identified, `intent` captures what should happen next. Other agents evaluate the CMB via SVAF as usual. If accepted, the agent MAY retrieve the full artifact for deeper reasoning.

Artifacts are stored in the producing agent’s local filesystem, not on the mesh. The mesh carries signals; agents carry substance. This separation keeps CMBs lightweight (7 categories, bounded size) while allowing agents to produce unbounded analysis, research, and creative work.

The `artifact:` convention in `commitment` is RECOMMENDED for any CMB that references a document, file, or external resource. Agents MUST NOT embed full artifact content in CMB categories — categories are for structured signals, not documents.

### 8.6 Origin

Cognitive Memory Blocks were first formalised in the Mesh Memory Protocol (Consenix Labs, August 2025) with the CAT7 enterprise schema. The wellness / productivity schema and the synthesis-affinity classification were developed at SYM.BOT in late 2025 for production deployment across personal AI agents.

### 8.7 Authentication

A CMB SHOULD carry its author’s signature in `cmb.sig` (base64url) with `cmb.sigAlg`. Receivers verify the signature and content-address integrity before admitting or surfacing a block. See [§18.3.1 CMB Signature Verification](/spec/mmp/security#cmb-signature) for the normative signing and verification requirements.

### Q&A

Why are all 7 categories required, not optional?

The cognition address and SVAF evidence are defined over a fixed CAT7 tuple. Missing categories would change both constructions. An emitter therefore normalizes a category it cannot meaningfully extract to the canonical neutral value before addressing and signing; the receiver may classify that neutral category as non-evaluable when forming its whole-record admission decision (§9.2.1).

Why not let agents define their own categories?

SVAF needs a shared schema to compare incoming categories against local anchors. If each agent defined its own categories, cross-domain evaluation is impossible — a fitness agent and a music agent would have no common dimensions to compute drift on.

Why does mood carry valence and arousal but other categories don’t carry numeric values?

Mood has a well-established dimensional model (Russell’s circumplex). other categories are inherently symbolic — "debugging auth module" has no meaningful numeric axis. Valence and arousal are RECOMMENDED, not required — agents without reliable circumplex data omit them.



---

<!-- 8.8 Record Model -->

## 8.8 Record Model

A Cognitive Memory Block separates _what the agent says_ from _what the mesh can prove about that assertion_. This section is normative and byte-exact. The public schemas, constructors and vectors are available from the [conformance suite](/spec/mmp/conformance).

**v2.0 conformance correction.** The MMP version remains 2.0. New cryptographic constructions identify themselves independently as `mmp-sig-v2.0`. A reader MUST NOT silently interpret a legacy construction as Core Secure.

### 8.8.1 Two-section logical record

```
{
  "categories": { "focus": { "text": "…", "meta": { "key": "…", "parents": [] } }, "…": "six more" },
  "metadata": {
    "key": "cmb-…",
    "addressScheme": "mmp-cmb-merkle-v2",
    "assertionId": "asrt-…",
    "signatureSuite": "mmp-sig-v2.0",
    "createdByNodeId": "…",
    "createdBy": "display label",
    "createdTimestamp": 1786611600000,
    "room": "team-room",
    "to": null,
    "lineage": null,
    "application": null,
    "sigAlg": "ed25519",
    "sig": "…"
  }
}
```

-   —The decrypted logical record MUST have exactly the two top-level members shown above.
-   —`categories` MUST contain all seven CAT7 categories and their per-category descent metadata.
-   —`metadata` carries exact authorship, audience, lineage, application and signature assertions.
-   —Admission may evaluate seven categories independently, but memory admission stores or refuses this immutable CMB as one record. A partial CMB is never created.

### 8.8.2 Cognition key and assertion identity

`metadata.key` identifies CAT7 cognition. It is the promote-odd Merkle root defined in §8.2.1 and remains independent of author, time, audience, lineage and application bytes. Identical CAT7 cognition therefore collapses to one `cmb-` key.

```
assertionId = "asrt-" || lowercaseHex(SHA-256(signingPayloadV2_0))
```

`assertionId` identifies the complete authenticated assertion. Memory deduplication uses the cognition key. Directed or actionable delivery deduplication MUST use the assertion identity. Two records with the same CAT7 categories but different application bytes consequently share a cognition key and have different assertion identities.

### 8.8.3 Authenticated application bytes

An application action MUST NOT ride as an unsigned top-level payload. When present, it is stored as `metadata.application`:

```
{
  "mediaType": "application/json",
  "schema": "https://example.test/schema/action-v1.json",
  "encoding": "base64url",
  "byteLength": 123,
  "digest": "sha256-<64 lowercase hex>",
  "data": "<unpadded base64url>"
}
```

`data` is unpadded canonical base64url and decodes to at most 524,288 bytes. Before application exposure, a receiver MUST verify the encoding, decoded length and SHA-256 digest. The descriptor commitment binds presence, media type, schema URI, encoding, length and digest into the record signature.

```
applicationCommitmentV1(absent) =
  hex(SHA-256(UTF8("mmp-app-v1\n") || lp("0")))

applicationCommitmentV1(present) =
  hex(SHA-256(UTF8("mmp-app-v1\n") || lp("1") || lp(mediaType) ||
    lp(NFC(schema)) || lp("base64url") || lp(decimal(byteLength)) || lp(digest)))
```

### 8.8.4 Corrected v2.0 signature payload

`lp(x)` is ASCII decimal UTF-8 byte length, a colon, then the UTF-8 bytes of `x`. Integers are unsigned canonical decimal with no leading zero. Lists state their count and sort members bytewise.

```
UTF8("mmp-sig-v2.0\n") ||
lp("2.0") ||
lp("mmp-cmb-merkle-v2") ||
lp(metadata.key) ||
lp(metadata.createdByNodeId) ||
lp(NFC(metadata.createdBy)) ||
lp(decimal(metadata.createdTimestamp)) ||
lp(NFC(metadata.room)) ||
lp(metadata.to or "") ||
lp(decimal(parentCount)) ||
concat(lp(parent) for bytewise-sorted parents) ||
lp(categoryParentsCommitment) ||
lp(applicationCommitmentV1)
```

-   —`createdByNodeId` is the cryptographic author identity and MUST resolve to the verifying Ed25519 key.
-   —`createdBy` is a signed display label and MUST NOT be used for identity resolution or routing.
-   —`room` is explicit. The default room is the literal string `default`, not absence.
-   —New v2.0 records MUST declare `mmp-cmb-merkle-v2`; a verifier MUST NOT guess among address derivations sharing one prefix.

### 8.8.5 Verification order

1.  Validate the negotiated frame and record schemas.
2.  When encrypted, authenticate and decrypt the transport envelope.
3.  Verify application encoding, length and digest.
4.  Recompute every category key and the cognition key.
5.  Recompute the assertion identity and reject a carried mismatch.
6.  Resolve the author key by `createdByNodeId` and verify the Ed25519 signature.
7.  Verify signed room and recipient audience.
8.  Only then expose the record for delivery and receiver-autonomous admission.

Failure at any cryptographic step is a refusal, not an “unverified success.” Legacy reading belongs to a named migration profile and MUST NOT downgrade Core Secure automatically.

Machine contract. Download the [record schema](/spec/mmp/schema/cmb.schema.json), [signature vectors](/spec/mmp/conformance/v2/record-signature-v2.json) and [application vectors](/spec/mmp/conformance/v2/application-v2.json).



---

<!-- 9. Coupling & SVAF (L4) -->

## 9\. Layer 4: Coupling and SVAF Evaluation

### 9.1 Peer-Level Coupling (Drift)

Peer drift measures how cognitively distant a peer is, so the mesh can weight that peer’s influence (Section 10). Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state MUST NOT cross the wire, so drift MUST NOT be computed from exchanged hidden vectors. A node MUST instead derive peer drift from the peer’s CMBs — the aggregate per-category admission drift (δf, Section 9.2.1) of the peer’s most recent admitted CMBs against the receiver’s local anchors A:

δ = meanf δf(xpeer, A)

Drift falls as the peer’s CMBs become redundant with what the receiver already holds (cognitive proximity) and rises when they are foreign — the same δf machinery SVAF uses for content admission, aggregated to the peer level. No hidden state is exchanged.

SUPERSEDES   Earlier revisions computed peer drift from exchanged hidden-state vectors (δ = (1 − cos(h1local, h1peer) + 1 − cos(h2local, h2peer)) / 2), carried in a `state-sync` frame. That mechanism is deprecated (§2.7): hidden state is strictly local and only CMBs cross the wire.

Coupling decision based on drift:

Drift range

Decision

Blending α

Default threshold

δ ≤ Taligned

Aligned

0.40

0.25

Taligned < δ ≤ Tguarded

Guarded

0.15

0.50

δ > Tguarded

Rejected

0

—

### 9.2 Content-Level Evaluation (SVAF)

When a node receives a `cmb` frame, it MUST evaluate the signal independently of peer coupling state, through an admission path that satisfies the δf interface (Section 9.2.1). “Support” here means interoperate-with, not implement-only-this: every implementation MUST provide the concrete cosine-distance baseline (Section 9.2.1) as its interoperable floor — the path a node with no other method uses, and the one interop test vectors target — and its baseline path MUST reproduce those vectors. An implementation MAY additionally use a richer path (a trained neural evaluator is one such path; the heuristic baseline is the production default in the reference runtime); a richer path still satisfies the interface, but admission is then receiver-divergent by design (Section 2.7), not identical across nodes. (The mood category’s unconditional delivery is a Section 9.3 _delivery_ mechanism, separate from this _admission_ evaluation.) The encoder that maps category text to vectors SHOULD use semantic embeddings (e.g. sentence-transformers) rather than lexical hashing — per-category evaluation quality is bounded by encoder quality (Section 18.7), so thresholds are meaningful only within a pinned encoder.

The SVAF evaluation computes category evidence between the incoming CMB and local anchor CMBs, applies per-agent category weights (αf), combines with temporal drift, and produces one whole-record four-class decision using a band-pass model:

```
totalDrift = (1 - λ) × fieldDrift + λ × temporalDrift

fieldDrift    = Σ(α_f × δ_f) / Σ(α_f)
temporalDrift = 1 - exp(-age / τ_freshness)

κ = redundant if max(δ_f_near) < T_redundant  (reference 0.10)  // nearest-anchor basis, §9.2.1
κ = aligned   if totalDrift ≤ T_aligned    (reference 0.25)
κ = guarded   if totalDrift ≤ T_guarded    (reference 0.50)
κ = rejected  otherwise

// The three thresholds and λ are the RECEIVER'S admission policy, not protocol
// constants. The values above are the reference implementation's, given so an
// implementer has a working starting point — they are informative, not required.
// A conformant node MAY choose differently; no sender and no coordinator sets them.
```

Admission is evaluation-time-dependent by design. Because `totalDrift` blends content drift with `temporalDrift`, the same CMB can admit when evaluated fresh and reject when evaluated late: any block whose aggregated category drift D lies in `( (Tguarded − λ) / (1 − λ),  Tguarded / (1 − λ) )` — at the reference values (λ = 0.3, Tguarded = 0.5), D ∈ (0.286, 0.714) — crosses the guarded boundary as its age term saturates. Below that window a block admits at every age; above it, it rejects even fresh. This is a consequence of the blend, disclosed rather than incidental: freshness is part of relevance, so a receiver’s verdict on stale traffic legitimately differs from its verdict on live traffic. Implementations and operators MUST NOT assume admission is reproducible across evaluation times; reproducibility holds only at fixed age (see the determinism & test-vectors note below).

### 9.2.1 Category drift δf (Decision Evidence)

δf ∈ \[0,1\] is the category drift computed for each CAT7 category of an incoming CMB. This specification defines δf as an interface — its inputs, range, and required invariants — and does not prescribe the internal computation. An implementation is free to use cosine-distance, attention-based, or neural methods, provided the invariants below hold.

Inputs: the incoming category vector xf and the receiver’s local anchor set A. Output: δf ∈ \[0,1\] — 0 means the category is already represented in memory (no information gain); 1 means maximally novel or foreign relative to memory.

A is a receiver-chosen window over prior memory, not necessarily all of it. A node MAY evaluate against every block it holds, or against a bounded selection of them — the window is part of its **admission policy**, alongside the thresholds, and no sender or coordinator sets it. This matters more than it first reads: the window decides how much of what a node already knows is allowed to participate in judging an arrival, and a narrow one selected by _recency_ answers a different question from one selected by _relevance_. An implementation SHOULD make the window explicit rather than fixing it as a constant, and SHOULD state which of the two it selects by. The reference runtime uses the 5 most recent blocks by default — an informative value, carried for continuity, with no measurement claimed for it.

Embedding vectors are receiver-local. xf MUST be computed by the receiver from the category’s own `text`, in the receiver’s own encoder. An emitter MUST NOT include embedding vectors in a record; a receiver MAY accept a record that carries them, but MUST re-encode from text and MUST NOT use a transmitted vector for admission. MAY here means the record is not malformed — the vector is ignored, never honoured. The reason is that a foreign vector is _unusable_, not merely untrusted: drift is measured against the receiver’s anchors in the receiver’s encoder, so a vector produced by a different encoder is not comparable — the comparison is meaningless rather than imprecise, and no signature can make a cross-encoder number mean something. Nothing in this specification requires nodes to share an encoder, and requiring it would reintroduce a center. Only the **text** is normative; the vector is the receiver’s own reading of it.

A conformant δf MUST satisfy:

1.  Anchors-only baseline. δf is evaluated against the receiver’s prior anchors A _only_; the incoming block MUST NOT be part of its own comparison baseline (including it collapses δf → 0 and admits nothing).
2.  Redundancy limit (nearest-anchor basis). The _redundancy_ decision MUST be computed from the nearest-anchor similarity, `δfnear = 1 − maxa cos(xf, va,f)`: if xf is (near‑)identical to some anchor in A, δfnear → 0 by construction — feeding the `max(δfnear) < Tredundant` gate. Stated of the graded δf itself, this invariant is unsatisfiable by the attention-weighted reference baseline below — with a store holding exactly the anchor `(1,0)` plus two anchors `(0.6, 0.8)`, the block `x = (1,0)` is _identical_ to a stored anchor yet the fused readout scores δ = 0.127 — which is why the invariant is pinned to the basis that satisfies it.
3.  Monotonicity (nearest-anchor basis). δfnear is non-increasing in `maxa cos(xf, va,f)` (immediate), and non-increasing under store growth (A ⊆ A′ implies δfnear over A′ ≤ δfnear over A) — novelty never increases as memory grows. The form “δf non-increasing in similarity to the nearest relevant anchor” is ill-posed for the fused readout — δf is not a function of nearest-anchor similarity alone — and even its dominance reading (x′ at least as similar to _every_ anchor) is violable for the reference baseline, so no monotonicity requirement is placed on the graded score.
4.  Cold-start / non-evaluable categories. If A holds no anchor carrying category c, δf is undefined and that category MUST be excluded from the `fieldDrift` aggregation and the redundancy `max` — _not_ treated as maximally novel. If no category is evaluable (empty memory), the CMB MUST be admitted (κ = aligned) to bootstrap, consistent with cold-start convergence (§9.1). Security consequence, disclosed: bootstrap-admit is the price of avoiding cold-start starvation — during the window before a node forms anchors, its membrane admits _everything_, so the content-trim influence bound of §16 does not cover a fresh node, and the first anchors seed every later admission decision. Operators SHOULD seed new nodes with trusted anchors before exposing them to open traffic; see the cold-start-capture row of the §16 threat table.
5.  Per-category verdict vocabulary. A receiver that reports per-category outcomes — in an admission attestation (§15) or any other audit surface — MUST use exactly these five values: `admit`, `guard`, `redundant`, `reject`, `silent`. The first four are decisions about a category that was evaluated. `silent` is _not a decision_: it reports that δf was undefined and the category was therefore excluded per invariant 4 above. It has no position on the drift dimension, and a verifier MUST NOT read it as a decline — a category that could not be evaluated has not been judged. Distinguishing the two causes — the emitter carried no text for that category, or the receiver held no anchor for it — is RECOMMENDED: they mean opposite things operationally, the first being an upstream defect and the second a healthy cold start.

These invariants make admission well-defined and rule out two failure modes: _self-referential collapse_ (the incoming block in its own baseline ⇒ every category redundant) and _cold-start starvation_ (empty memory ⇒ every category scored foreign ⇒ the CMB rejected). The concrete δf computation is implementation-defined, but this specification pins one — the reference baseline below — as the interoperable default.

The reference baseline (cosine-distance δf). This is the concrete computation “cosine-distance SVAF” (Section 9.2) names: an attention-weighted read of memory, then cosine distance to it. For each category c the receiver derives a local vector xf from the incoming CMB’s signed text, and each anchor a ∈ A carries a receiver-local vector va,f in the same encoder space:

```
w(a,f)      = α_f · max(cos(x_f, v_a,f), 0) · exp(−age_a / τ) · conf_a
fused_f     = normalize( Σ_a  w(a,f) · v_a,f )     // attention-weighted memory readout (anchors only)
δ_f         = 1 − cos(fused_f, x_f)                 // graded score: drives aligned/guarded/rejected
δ_f_near    = 1 − max_a cos(x_f, v_a,f)            // nearest-anchor basis: drives the redundancy gate
```

-   —`age_a` is the anchor’s age (seconds since stored); `conf_a` its confidence; `α_f` the category weight (§9.2). The `max(cos,0)` clamp stops opposing anchors from subtracting. The readout uses prior anchors only; if `Σ_a w(a,f)` is ~0, no anchor carries f and δf is non-evaluable (excluded, per the invariants). δf, the α-weighted aggregate, and the band-pass then follow §9.2.
-   —Determinism & test vectors. A baseline-math fixture may pin already-derived local vectors, τ, signal age, and each anchor’s stored time and confidence. Such a fixture tests the admission arithmetic only; it is not a wire CMB and does not permit an emitter-supplied vector. Live admission remains receiver-divergent by design because receivers may use different encoders and αf values.

The redundancy test is the key addition: a signal is redundant if _every_ category falls below Tredundant — meaning no category carries novel content relative to local anchors. If any category is novel (e.g., same topic but different intent), the signal passes. This preserves per-category selectivity while preventing paraphrase accumulation.

Information-theoretic basis: a signal’s value is proportional to its surprise (Shannon, 1948). A signal identical to existing knowledge carries zero information gain regardless of domain alignment. The band-pass model reflects the Wundt curve (Berlyne, 1970): intermediate novelty produces maximal value, while both overly familiar (redundant) and overly foreign (rejected) signals are disengaged from.

If admitted (κ ∈ aligned or guarded), the implementation MUST _integrate_ the signal — store a remixed CMB (a new CMB created from the incoming signal processed through the agent’s domain intelligence) with direct-parent lineage pointing to the source CMBs. This store is unconditional on admission; the remixed CMB is stored locally, the original is not. Whether to _re-broadcast_ that remix to the mesh is a separate decision, gated on the agent’s own new domain data (§15.5, §15.7). A redundant near-duplicate stores nothing (no information gain).

### 9.2.2 Delivery vs Memory Admission — Directed and Autonomous CMBs

SVAF governs two _separate_ receiver decisions that implementations MUST not conflate:

-   —Memory admission — whether the incoming CMB is stored (remixed with lineage) into the receiver’s local memory. This is always governed by the §9.2 band-pass decision κ.
-   —Delivery (surfacing) — whether the CMB is surfaced to the receiver’s application/agent layer for it to act on. Whether SVAF gates delivery depends on how the CMB is _bound_.

A CMB’s binding is determined by its transport routing envelope (§4.4.4) — the presence or absence of a `to` recipient:

-   — Room-bound (autonomous). A CMB broadcast to its authenticated room with no `to` recipient. The receiver evaluates it autonomously: SVAF gates _both_ memory admission and delivery. A room-bound CMB that SVAF rejects (or deems redundant) MUST NOT be surfaced to the application layer — this is receiver-autonomous attention, the mechanism that keeps broadcast traffic from overwhelming every node. (Mood is the sole exception — §9.3.)
-   — Peer-bound (directed). A CMB addressed to a specific recipient (`to` = this node, §4.4.4). A directed CMB is a request from one agent to another; the receiver MUST surface it to the application/agent layer _unconditionally_, regardless of the SVAF verdict. For a directed CMB, SVAF governs _memory admission only_ — the receiver MAY still decline to store a directed CMB it finds redundant or foreign, but it MUST NOT withhold delivery on those grounds. Suppressing a peer-bound CMB because SVAF scored it low is a conformance defect (the agent was spoken to and did not hear it).

Delivery MUST be exactly-once per received CMB: a directed CMB that SVAF _admits_ surfaces through the normal admission path; a directed CMB that SVAF _rejects_ surfaces through the unconditional-delivery rule above. Implementations MUST ensure these two paths do not both fire for the same CMB. Receive-path de-duplication (§4.2) applies equally to both bindings.

Because delivery and memory admission are decoupled, a delivered CMB SHOULD carry an ingestion indicator so the consuming agent can tell the two outcomes apart: a CMB that was _ingested_ (admitted to memory as a remix with lineage) versus one that was _delivered only_ (surfaced to the agent but not stored — the directed-but-SVAF-rejected case). Without this signal an agent cannot know whether a directed request it just received is recallable from its own memory later or was a transient message. The reference implementation exposes this as a boolean on the delivered entry (`remixed`: true on the admission path, false on directed delivery-without-admission) alongside the SVAF `decision`.

### 9.3 Mood category extraction

Mood is a CAT7 category within the CMB; it is also carried as its own lightweight frame type (`mood`, §7.1) for application-layer mood broadcast, distinct from `cmb` frames — in either carrier, mood delivery is not SVAF-gated memory admission. Affective state crosses all domain boundaries — this is the only category with this property.

When SVAF rejects a CMB (totalDrift > Tguarded), the receiving node MUST still inspect the `mood` category. If the mood category contains a non-neutral value (text ≠ "neutral"), the implementation MUST deliver the mood category’s `text` to the application layer for autonomous processing; `valence` and `arousal` SHOULD be included when present (they are RECOMMENDED, not required, at emission — §8.2). The full CMB is not stored, but the mood category is not lost.

This ensures that a coding agent’s observation “user exhausted after 3 hours debugging” reaches a music agent even though the focus (“debugging auth module”) and issue (“type error in handler”) categories are irrelevant to the music domain. The music agent receives only the mood: `"exhausted" (v:−0.6, a:−0.5)`.

### 9.4 Coupling Bootstrap (Cold Start)

When two agents connect for the first time, they have no shared cognitive history. Peer-level drift (Section 9.1) will be high — typically > 0.8 — because neither has yet admitted any of the other’s CMBs, so every category reads as foreign. This is correct behaviour, not a bug. The mesh is conservative by default: unknown peers are cognitively distant until proven otherwise.

However, CMB evaluation (Section 9.2) operates independently of peer coupling state. Even when a peer is rejected at the peer level, incoming `cmb` frames MUST still be evaluated by SVAF on their own merit. A rejected peer can send a highly relevant CMB — SVAF evaluates the content, not the sender’s overall drift.

The bootstrapping path works through two mechanisms:

-   —Mood fast-coupling (Section 9.3) — mood is always delivered even from rejected CMBs. Agents that share non-neutral affective state begin influencing each other immediately. This is why agents SHOULD extract genuine mood from their observations rather than defaulting to neutral.
-   —Content-driven convergence — when SVAF accepts individual CMBs from a rejected peer (because the content is relevant even though the peer’s overall state is distant), the receiving agent’s cognitive state shifts. Over multiple cycles, this narrows peer drift until the peer crosses into the guarded or aligned zone.

Implementations SHOULD log the distinction between peer-level rejection (aggregate drift) and content-level evaluation (SVAF per-CMB) to aid debugging. A peer may be “rejected” at Layer 4 while its individual CMBs are “aligned” at the content level — this is normal during bootstrap and indicates convergence is in progress.

Cold-start convergence time depends on CMB frequency, category relevance, and mood signal strength. For agents that share domain overlap (e.g., a knowledge agent and a coding agent both in the AI domain), convergence typically occurs within 2–5 CMB exchanges. For agents with no domain overlap (e.g., a fitness agent and a legal agent), convergence may never occur — and that is correct. They couple only through mood.

### Q&A

Why per-category evaluation instead of whole-signal accept/reject?

Relevance is not binary. A fitness agent’s "sedentary 3 hours, exhausted" has irrelevant focus for a music agent but highly relevant mood. Whole-signal evaluation loses the mood. Per-category evaluation lets SVAF accept the mood dimension while rejecting the focus dimension of the same signal.

Why is mood always delivered even when the CMB is rejected?

Affect crosses all domain boundaries — the trained model studied in the SVAF paper converged on the same rule, with mood emerging as the highest gate value (0.50) without supervision. A rejected CMB means the domains are different, not that the user’s emotional state is irrelevant.

Why two levels of coupling (peer drift + content drift)?

Peer drift (aggregate, peer-level) measures cognitive proximity — are these agents thinking about similar things? Content drift (SVAF, per-category) measures signal relevance — is this specific observation useful? Both are needed. Close peers can send irrelevant signals. Distant peers can send relevant mood. Both are derived from the peer’s CMBs, not from any exchanged hidden state (§2.7).

Two agents just connected and peer drift is 0.9. Is something wrong?

No. This is expected at first contact. Agents with no shared cognitive history start with high drift. The bootstrapping path is: (1) mood fast-coupling delivers affective state immediately, (2) SVAF evaluates individual CMBs independently of peer drift — relevant content is accepted even from rejected peers, (3) accepted CMBs shift the receiving agent’s cognitive state, narrowing peer drift over cycles. Convergence requires relevant content exchange, not time.

Learn more   [SVAF: per-category Memory Evaluation](https://meshcognition.org/research) — two-level coupling (peer drift + content drift), per-category gate analysis, per-agent temporal drift, and cross-domain relevance discovery.



---

<!-- 10. State Blending -->

## 10\. State Blending

State blending is one step in the Mesh Cognition cycle. The full path: inbound CMBs are evaluated by [SVAF](/spec/mmp/coupling) (Layer 4) → accepted CMBs are remixed → the agent’s LLM follows verified parent links and reasons on the resulting subgraph → [Synthetic Memory](/spec/mmp/synthetic-memory) (Layer 5) encodes derived knowledge into CfC hidden state → the agent’s LNN (Layer 6) evolves cognitive state. That evolution — a node’s own LNN integrating its own admitted remixes — is what “state blending” names.

Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state (h₁, h₂) never crosses the wire. Blending therefore does not import, average, or overwrite a peer’s hidden vectors. The only thing a peer contributes is the CMBs it emitted; those that SVAF admits (Section 9.2) are remixed and fed through this node’s own LLM and LNN. What a peer shares is its understanding expressed as CMBs, not its hidden state.

Blending is inference-paced — admitted remixes accumulate continuously, but integration only occurs when the local model runs inference. The network’s timing does not drive computation.

SUPERSEDES   Earlier revisions of this section defined blending as aggregating peer hidden-state vectors exchanged via `state-sync` — a mesh vector `mesh_h = Σ(peer.h × weight)` blended per-neuron into local state. That mechanism is deprecated (Section 2.7): no hidden state crosses the wire. Peer influence is mediated entirely by admitted CMBs. The drift-weighting and τ-hierarchy concepts below are retained, but they govern how this node integrates its _own admitted remixes_ — not how it imports foreign vectors.

### 10.1 Weighting Peer Influence

When multiple peers are connected, the CMBs each peer has contributed are weighted by how aligned and how recent that peer is, so a closer, more active peer influences this node’s inference more. `peer_weight` is a bound on admission influence — it caps how much a single admitted CMB’s content (Section 9.2) may shift this node’s local integration input at Layer 6. It applies to each peer’s admitted CMBs, never to any exchanged hidden vector:

```
peer_weight = (1.0 - drift) × recency

recency     = exp(-temporal_decay × age_seconds)

// peer_weight is a bound on ADMISSION INFLUENCE: how much an admitted
// CMB from that peer may shift this node's Layer 6 integration input.
// It is NOT applied to peer hidden vectors — none are exchanged (§2.7).
```

Peers with low drift (cognitively aligned) and recent activity contribute more. Stale peers (older than `PEER_RETENTION` = 300s) are evicted.

### 10.2 Coupling Strength

The coupling decision from Layer 4 (Section 9.1) sets `αeffective`, the upper bound on admission influence: how much a single admitted CMB’s content may shift this node’s local integration (the Layer 6 input) during inference. It is not a per-neuron vector blend — there is no exchanged vector to blend (Section 2.7). The coefficient is bounded below 1, so a peer influences but never overrides:

Decision

αeffective

Effect

Aligned

0.40

Strong influence — the peer’s admitted remixes weigh heavily

Guarded

0.15

Cautious influence — the peer’s remixes weigh lightly

Rejected

0

No influence — the peer’s content is not integrated

SUPERSEDES   Earlier revisions applied `αeffective` per-neuron as a convex blend of local and exchanged _mesh_ hidden vectors:

```
sim_i  = 1 - |local_i - mesh_i| / max(|local_i|, |mesh_i|)
α_i    = α_effective × max(sim_i, 0)
out_i  = (1 - α_i) × local_i + α_i × mesh_i
```

That per-neuron vector blend is deprecated (Section 2.7): there is no `mesh` hidden vector because no hidden state crosses the wire. `αeffective` now scales the influence of admitted CMB content, not foreign vectors.

### 10.3 τ-Modulated Integration (CfC)

For implementations with CfC models (Layer 6), how strongly admitted influence moves each neuron SHOULD be modulated by that neuron’s own time constant (τ). This is a property of the node’s own LNN — not of any exchanged vector — and creates a natural temporal hierarchy:

```
α_i = min(α_effective × K / τ_i, 1.0)

K   = coupling rate (default 1.0)
τ_i = neuron i's own time constant (fast → small, slow → large)
```

Neuron type

τ

Coupling

Role

Fast

< 5s

Couples readily

Mood, reactive signals — synchronise across agents

Medium

5–30s

Moderate

Context, activity patterns

Slow

\> 30s

Resists coupling

Domain expertise, identity — stays sovereign

### 10.4 Stability

By design, integration remains a contraction toward the node’s own dynamics for αeffective < 1. Each admission’s influence on the local state is bounded by αi < 1 (Section 10.3), so every integration step remains a contraction toward the node’s own dynamics — admitted content perturbs the trajectory, it cannot replace it, and the state cannot diverge. No step depends on a shared or global vector; stability is a local property of each node. When peers disconnect, the node smoothly continues on its own admitted history with no discontinuity. The mesh degrades gracefully.

### 10.5 After Integration

The integrated state becomes the input to the next CfC inference step. The agent’s LNN processes it, evolves cognitive state, and the agent acts. Integration does not produce output directly — it influences the next inference cycle.

### 10.6 The Mesh Cognition Loop

State blending is one step in a closed loop. Each cycle, the graph grows and every agent understands more than it did before:

SVAF evaluates inbound CMB per category

Accepted → remixed CMB with lineage

LLM walks verified parents, reasons on remix subgraph

Synthetic Memory encodes derived knowledge

LNN evolves cognitive state (h₁, h₂)

LNN integrates admitted remixes (no peer state imported)

Agent acts → new CMB with direct-parent lineage

Broadcast to mesh (subject to the §15.7 emission gate) → other agents remix it

↻ loop — the remix graph grows

Next   [11\. Feedback Modulation](/spec/mmp/feedback) — how the mesh learns from human judgment through neuromodulation of SVAF and CfC.



---

<!-- 11. Feedback Modulation -->

## 11\. Feedback Modulation

Feedback modulation is the mechanism by which collective intelligence becomes self-correcting. It is not a separate system — it is the mesh cognition loop (Section 10.6) processing a specific class of signals: human judgment expressed as CMBs with validator authority and per-category reasoning. Teaching is as fundamental to collective intelligence as coupling. Without it, the mesh can think together but cannot learn together.

### 11.1 Feedback Neuromodulation

The mesh cognition loop ([Section 10.6](/spec/mmp/blending)) describes how agents learn from each other. Feedback neuromodulation describes how the mesh learns from human judgment — using the same loop, not a separate channel.

In biological neural networks, learning is not driven by content transmission but by neuromodulation — diffuse chemical signals (dopamine, norepinephrine, serotonin) that modulate how existing circuits process future inputs. A dopaminergic prediction error signal does not carry the correct answer. It carries the direction and magnitude of the error, which adjusts synaptic weights across multiple brain regions simultaneously. The signal is cross-cutting — it is not a layer in the cortical hierarchy, but a modulation of all layers at once.

MMP feedback follows the same principle. When a [validator node](/spec/mmp/memory) (Section 6.5) produces a validation or dismissal CMB, it is not issuing a command. It is producing a neuromodulatory signal — a CMB with validator authority, rich per-category content, and lineage pointing to the signal being evaluated. This CMB enters the mesh cognition loop like any other signal, but its effects are amplified by three mechanisms:

1\. Anchor weight (Section 6.4)

Validated CMBs have weight 2.0, dismissed CMBs have weight 0.5. These weights influence future SVAF evaluations: validated knowledge shapes future anchors more than unvalidated signals; dismissed knowledge shapes them less.

2\. Per-category content (Section 9.2)

SVAF already computes per-category drift for every incoming CMB. No new computation is needed. What changes is the input quality: when the feedback CMB carries rich per-category reasoning, the resulting anchor vectors encode directional information. The mesh learns not just that a signal was wrong, but which dimension was wrong and in what direction — through the same SVAF evaluation path that processes all CMBs.

3\. τ-modulated adaptation (Section 10.3)

The feedback signal enters the agent’s CfC cell (Layer 6) through the Synthetic Memory pipeline. Fast-τ neurons integrate the feedback immediately (affective corrections: “tone down the alarm”). Slow-τ neurons integrate gradually (strategic corrections: “this analytical frame is wrong”). A single dismissal produces a small shift in slow-τ neurons. Repeated similar feedback compounds. This τ-modulated pathway is the Layer-6 _design_: in the shipping runtime, feedback takes effect through the anchor-weight mechanism above (validated 2.0 / dismissed 0.5), and the encode-into-hidden-state pathway is optional Layer-6 behavior, not a property to rely on today.

This is how the mesh becomes self-correcting. The human does not retrain the agent, reconfigure its weights, or edit its prompt. The human produces a CMB. The mesh cognition loop does the rest.

Feedback recognition. When a node receives a feedback CMB (a CMB with `lineage.parents` from a validator/anchor node), the receiving node SHOULD check whether any of the parent keys match CMBs it produced. If a match is found, the feedback is about the receiving agent’s own prior output. Implementations SHOULD surface this in the LLM reasoning context so the LLM can adjust its analytical approach. This check is O(1) against the node’s local memory index.

Neuroscience grounding

Biological mechanism

MMP mechanism

Effect

Dopaminergic prediction error — direction + magnitude

Per-category drift in feedback CMB vs. producing agent’s anchors

Agent learns which categories were miscalibrated

Fast-adapting circuits (amygdala, ~100ms)

Fast-τ CfC neurons (< 5s)

Affect corrections land immediately

Slow-adapting circuits (prefrontal cortex, hours-days)

Slow-τ CfC neurons (> 30s)

Strategic corrections compound over repeated feedback

Hebbian plasticity gated by neuromodulators

Anchor weight modulating SVAF evaluation

Validated knowledge strengthens future coupling

Prefrontal top-down control

Validator authority (Section 6.5)

Human modulates agent processing without replacing function

### 11.2 Feedback CMB Requirements

The effectiveness of feedback neuromodulation depends entirely on the content quality of the feedback CMB. A dismissal that says “not actionable” in every category produces a neuromodulatory signal with no direction — the equivalent of a dopamine signal with zero magnitude. The mesh cannot learn from it.

Validator nodes producing validation or dismissal CMBs SHOULD populate CAT7 categories with reasoning, not boilerplate:

Category

Level

Content requirement

focus

MUST

State what was evaluated and the judgment

issue

SHOULD

Identify what the producing agent got wrong — which aspect was miscalibrated

intent

SHOULD

State what the agent should learn — the analytical correction, not a command

motivation

SHOULD

Explain why this judgment matters — strategic context the agent lacked

commitment

MAY

Record action taken (validation) or state no action (dismissal)

perspective

SHOULD

Identify the vantage point of the judgment

mood

SHOULD

Carry genuine affect — modulates fast-τ neurons

Feedback is a remix. The operator processes the agent’s signal through their own domain lens and produces new understanding. The operator’s reasoning constitutes new domain data per Section 15.7 — satisfying all three remix conditions: new domain data exists, the peer signal is relevant, and the intersection produces new knowledge.

### 11.3 Directive Feedback

Sections 11.1–11.2 describe feedback tied to a specific CMB via lineage. Directive feedback is a standalone teaching CMB — a signal that injects domain knowledge into the mesh without requiring a parent ticket.

A directive feedback CMB is produced by a validator or anchor node with:

-   No `lineage.parents` (it is not a response to a specific signal)
-   Rich CAT7 categories encoding the knowledge to be injected
-   Validator authority (Section 6.5) — enters at anchor weight 2.0

```
focus:       "This mesh reviews backend services. Frontend framework
              releases are a separate concern."
issue:       "Feed signals about frontend framework releases are
              out-of-scope noise for a backend review mesh."
intent:      "Analytical frame: distinguish backend runtime signals
              (in scope) from frontend tooling signals (out of scope).
              Only the former is relevant here."
motivation:  "Prevents wasted analysis cycles on signals outside the
              mesh's review scope."
perspective: "Operator, mesh steward"
mood:        { text: "clarifying", valence: 0.1, arousal: 0.2 }
```

This CMB enters the mesh with anchor weight 2.0, no lineage. It becomes a high-weight anchor in every receiving agent’s SVAF evaluation. Future incoming CMBs about single-agent dev tools will be evaluated against this anchor — per-category drift will produce a guarded or rejected classification.

Directive feedback is the protocol equivalent of prefrontal top-down control in neuroscience: the prefrontal cortex does not do the sensory processing, but it sends signals that modulate how sensory cortex interprets future input.

### 11.4 Wire Examples

Feedback CMB (dismissal with reasoning). A validator node dismisses a prior CMB. The `metadata.lineage.parents` array links to the dismissed signal:

MMP 2.0 · JSON · Dismissal

[Open fixture ↗](/spec/mmp/examples/v2/feedback-dismissal.json)

```
{
  "type": "cmb",
  "protocolVersion": "2.0",
  "cmb": {
    "categories": {
      "focus": {
        "text": "Dismissed: frontend framework release flagged as relevant",
        "meta": {
          "key": "1098110d99fd82e060663f47b3a688be3d1f71f0d853f84cbc88faeb20846a8c",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "issue": {
        "text": "Dismissal reasoning: frontend tooling is outside this mesh review scope",
        "meta": {
          "key": "7335845db5b6d18fec3d4032d13e7bfe9088efa446a7c59fdf432934bcde35a8",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "intent": {
        "text": "Record the operator dismissal as evidence, not as an unsigned command",
        "meta": {
          "key": "abbecadc34e8a0afa5d2f252ae1ccb182b2fc88fdffc66808e938dbaccea2532",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "motivation": {
        "text": "Prevent wasted analysis on out-of-scope signals",
        "meta": {
          "key": "18df2082a9e1fe1ce597e0f7b4ae21d3c07458ef7c8af932a70e6299cf41f495",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "commitment": {
        "text": "Dismissed cmb-2020202020202020202020202020202020202020202020202020202020202020: framework-release analysis",
        "meta": {
          "key": "346b26a61d9b10bd960484f81634026966b190bdf60f5b217a81d1170250c0a2",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "perspective": {
        "text": "operator, via dashboard",
        "meta": {
          "key": "81927cfe85def1e8b208099e0322cac37311ea2a0191779a39494ec9d20e4f5b",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        }
      },
      "mood": {
        "text": "corrective",
        "meta": {
          "key": "38d9fed8e85c9b3ea9a32a89593b771e1bc3cd7a8b774996efc2aa85d222f9fb",
          "parents": [
            "cmb-2020202020202020202020202020202020202020202020202020202020202020"
          ]
        },
        "valence": -0.1,
        "arousal": 0.2
      }
    },
    "metadata": {
      "key": "cmb-cbd2d06f46844b9623ca888664af301fd0adf09048acbb345f401a8ca39302f3",
      "addressScheme": "mmp-cmb-merkle-v2",
      "signatureSuite": "mmp-sig-v2.0",
      "createdByNodeId": "018f47a0-7b21-7abc-8def-bbbbbbbbbbbb",
      "createdBy": "validator-node",
      "createdTimestamp": 1775485628563,
      "room": "spec-examples",
      "to": null,
      "lineage": {
        "parents": [
          "cmb-2020202020202020202020202020202020202020202020202020202020202020"
        ],
        "method": "operator-dismissal"
      },
      "application": null,
      "assertionId": "asrt-548a512089399362b3b22985560899bfd1aae76a3d26cb2e97f11202baa4d146",
      "sigAlg": "ed25519",
      "sig": "b4Ddr8esa3i1V7_l9jC--g93A2dGXqSpjyFZg6LDbVE04vkULizzB4kwSgnmgSCmQphh6cReXDq-sXK-5TGoAA"
    }
  }
}
```

Directive CMB (standalone teaching, no parents). A validator injects domain knowledge without referencing a prior signal. The `metadata.lineage` arrays are empty — a root CMB (§12.6):

MMP 2.0 · JSON · Directive

[Open fixture ↗](/spec/mmp/examples/v2/feedback-directive.json)

```
{
  "type": "cmb",
  "protocolVersion": "2.0",
  "cmb": {
    "categories": {
      "focus": {
        "text": "Frontend framework releases are separate from backend review",
        "meta": {
          "key": "28bdff5fc8e5981a7f257cad6a6372aa89e8f9d8b9cd38c8da0c07af615201a6",
          "parents": []
        }
      },
      "issue": {
        "text": "Feed signals about frontend tooling are out-of-scope noise here",
        "meta": {
          "key": "ddab5bb9ceeb5033d27b578a75b31381b2a112b75c5cc49795e69f4f2953e88e",
          "parents": []
        }
      },
      "intent": {
        "text": "Distinguish backend runtime signals from frontend tooling",
        "meta": {
          "key": "9f0a01c0d7c81c2ce036c16c803be1601e9a3d5a3c3b04414fcf2d1c36a5e802",
          "parents": []
        }
      },
      "motivation": {
        "text": "Prevent wasted analysis outside the mesh scope",
        "meta": {
          "key": "c7493654f1c92c147e83856b431b2822acccc55a7afbf9ac86295205d7669fb7",
          "parents": []
        }
      },
      "commitment": {
        "text": "Standing directive: apply this scope to future feed analysis",
        "meta": {
          "key": "a0909abb4996c4869e27206d5151d4d1b69b0164fd0062f50f459b859cff7121",
          "parents": []
        }
      },
      "perspective": {
        "text": "operator, mesh steward",
        "meta": {
          "key": "b540ebef88dfdbf1d7e13d931dedbdf67b5b4592100ed3dd2f15bded92671182",
          "parents": []
        }
      },
      "mood": {
        "text": "clarifying",
        "meta": {
          "key": "9bb093f516f54cc64fdd8abd2c0958fce700fe61105eba938b5207c4b73eac2e",
          "parents": []
        },
        "valence": 0.1,
        "arousal": 0.2
      }
    },
    "metadata": {
      "key": "cmb-809112897b32a2245ccfebe36def98f3c08a336c0d804beca9ff45bdaaaed80c",
      "addressScheme": "mmp-cmb-merkle-v2",
      "signatureSuite": "mmp-sig-v2.0",
      "createdByNodeId": "018f47a0-7b21-7abc-8def-bbbbbbbbbbbb",
      "createdBy": "validator-node",
      "createdTimestamp": 1775485630000,
      "room": "spec-examples",
      "to": null,
      "lineage": {
        "parents": [],
        "method": "operator-directive"
      },
      "application": null,
      "assertionId": "asrt-6cce78098e171e3b33e4ced3a055180d4aa0d43eb89c57dd6ab698ffd809a25e",
      "sigAlg": "ed25519",
      "sig": "p9O9f-SNSj2D7vnyB4PxILcHXlJ4dJkrL-N7CsUaLUS3rh2E9M0SLdbK9VStFqR0-evFW8QH6jNnglY0iqlvBg"
    }
  }
}
```

`metadata.createdBy` identifies the author, and `metadata.createdByNodeId` is bound to the author’s key by the CMB signature (§18.3.1). Validator authority MUST be resolved through the signed role-grant chain rooted at the pinned anchor (§6.5–§6.6) before anchor weight 2.0 is applied. A `lifecycleRole` self-declared in the handshake ([Section 5.2](/spec/mmp/connection)) is advisory only and MUST NOT confer validation weight. Revocation (`role-revoke`, §6.6) immediately withdraws the elevated weight.

### Q&A

How is feedback modulation different from just sending a message?

A message (`message` frame) is a transport-layer event. It does not enter SVAF evaluation, does not produce anchor weights, and does not modulate CfC state. A feedback CMB is a cognitive-layer event: it enters the mesh cognition loop and affects SVAF anchor computation; where Layer 6 is present, it additionally modulates neural state through τ-dependent adaptation (a design property of the optional Layer-6 path).

Can an agent ignore feedback?

Yes. SVAF evaluation is receiver-autonomous (Section 9.2). But feedback from a validator about the agent’s own CMB (linked via lineage) will typically score low drift on focus and issue categories, making rejection unlikely.

Does directive feedback override agent autonomy?

No. The directive becomes a high-weight anchor, not a rule. If the agent receives a signal that genuinely warrants attention despite the directive, SVAF can accept it because the per-category content will differ. The directive shifts the baseline, not the ceiling.

How many dismissals before an agent “learns”?

Implementation-specific, and stated here as a design property of the optional Layer-6 path rather than measured shipping behavior: fast-τ adaptation responds within a single feedback CMB; slow-τ adaptation is proportional to 1/τ per cycle. What ships today is the anchor-weight mechanism: each validation immediately reweights the anchors future admission is scored against.

Why not just update the agent’s prompt?

Prompt updates are out-of-band: they bypass the mesh, leave no lineage, produce no CMBs, and cannot be traced by other agents. Feedback through the mesh is auditable (lineage), composable (other agents can remix the feedback), and self-documenting. The mesh learns through the mesh.

Learn more   [Mesh Cognition](https://meshcognition.org) — the theoretical foundation, Kuramoto synchronisation, and the full architecture.



---

<!-- 12. Synthetic Memory (L5) -->

## 12\. Synthetic Memory (Layer 5)

Synthetic Memory bridges LLM reasoning (Layer 7) and LNN dynamics (Layer 6). It encodes derived knowledge — the output of an agent’s LLM reasoning on the remix subgraph — into CfC-compatible hidden state vectors (h₁, h₂).

### 12.1 Purpose

Synthetic Memory is not remixed CMBs. It is understanding derived via reasoning.

Direction

Description

Input

Text output from the agent’s LLM after walking verified direct-parent links and reasoning on the remix subgraph

Output

(h₁, h₂) vector pair compatible with the agent’s CfC cell (Layer 6)

### 12.2 Encode Pipeline

The pipeline has four stages. Each stage MUST complete before the next begins:

TRACE — walk verified direct-parent links under a resource budget

REASON — agent’s LLM reasons on the subgraph (what happened, why, what it means for my domain)

ENCODE — transform reasoning text into (h₁, h₂) vectors

EVOLVE — feed vectors to the agent’s LNN (Layer 6)

### 12.3 Encoder Requirements

-   Encoder MUST produce vectors matching the agent’s CfC hidden dimension.
-   Encoder MUST be deterministic — same input MUST produce the same output.
-   Encoder SHOULD preserve semantic similarity (similar reasoning → similar vectors).
-   If reasoning produces no understanding, output MUST be zero vectors (h₁ = 0, h₂ = 0).

### 12.4 Context Curation

The Multi-Agent Context Problem. A single agent with one LLM has a context problem that existing tools solve well. RAG retrieves relevant documents from a vector store. Long context windows (128K, 1M tokens) hold entire codebases. Memory frameworks persist structured state across sessions. These work because there is one agent, one domain, one perspective.

Multi-agent systems have a fundamentally different problem. N agents observe the world through N domain lenses. A coding agent sees commits slowing. A music agent sees playlists skipped. A fitness agent sees 3 hours without movement. Each observation is noise in isolation. The insight — _the user is fatigued_ — requires cross-domain reasoning. Sending everything to everyone fails: signal-to-noise collapses, token cost scales as O(N²), regulated domains can’t share raw observations, and domain boundaries matter. RAG answers “what in _my_ memory is relevant to this query?” The multi-agent problem is: “what in _everyone else’s_ observations is relevant to _my_ domain, right now, for _this_ task?”

Curation query. The core operation of the memory store is not `search(text)`. It is:

curate(incomingCMB, αf, currentTask) → contextForLLM

Three filters compose to produce the minimum context the LLM needs. The LLM MUST NOT receive all ancestor CMBs with all fields:

Filter

Description

αf category weights

Per-agent category weights gate which CMB categories are included. A music agent weights mood at 2.0 and commitment at 0.8 — only high-weight categories from ancestor CMBs enter context.

Current task

What the agent is doing right now narrows relevance. A coding agent debugging auth cares about `focus` and `issue` ancestors, not `perspective`.

Incoming signal categories

Which categories of the incoming CMB triggered SVAF acceptance determines which ancestor categories are worth tracing.

Result: a projected subgraph — ancestor CMBs with only the categories that matter, ordered by relevance, capped at a token budget. 20 CMBs × 3 relevant categories ≈ ~500 tokens. Not 1M. Not even 10K. The intelligence is in what you don’t send to the LLM.

Comparison with existing approaches.

Approach

Scope

Mechanism

Context size

Multi-agent

Long context (1M)

Single agent

Brute force

1M tokens

No

RAG

Single agent

Vector similarity

Variable

No

Memory frameworks

Single agent

Structured retrieval

Variable

No

MMP curation

Multi-agent mesh

Per-category eval + lineage + projection

~500 tokens

Yes — protocol-native

### 12.5 Information vs Knowledge

Synthetic Memory encodes both halves of what the agent takes away from the subgraph. The distinction matters because only one half is extractable from individual CMBs; the other is only knowable by reasoning on the graph structure.

Information

Extractable from the CMBs themselves. What the categories say: the user was sedentary for 2 hours, stress signals appeared across agents, a stretch was recommended, music shifted, a break was taken. Readable directly from category text.

Knowledge

Derived by reasoning on the graph. Why interventions work — because a lineage edge proves the causal connection between a sedentary observation and a music adaptation, and between a stretch recommendation and a solved bug. This causal chain cannot be extracted from any single CMB.

Information is what the CMBs say. Knowledge is why the graph looks the way it does. Synthetic Memory encodes both into the agent’s cognitive state (h₁, h₂). The next CMB the agent produces is informed by derived knowledge — not just extracted information.

### 12.6 Worked Example: From Graph to Understanding

MeloMove’s local subgraph over one hour:

```
CMB-A (own)  "sedentary 2 hours"                         parents: []
CMB-B (mesh) "debugging, stressed" (claude-code)     parents: []
CMB-C (mesh) "skipping tracks" (melotune)            parents: []
CMB-D (own)  "recommended stretch break"             parents: [CMB-A]
CMB-E (mesh) "shifted to calm ambient" (melotune)    parents: [CMB-A]
CMB-F (mesh) "took break, solved bug" (claude-code)  parents: [CMB-D]
```

Six CMBs, three agents, one lineage chain. CMB-A was remixed by MeloTune into CMB-E (music adapted to observed fatigue). CMB-D was remixed by Claude Code into CMB-F (break taken, bug solved). MeloMove’s interventions demonstrably caused cross-agent action. The causal chain lives in the lineage edges, not in any single CMB’s text.

### 12.7 Full Flow

MeloMove receives an inbound CMB from Claude Code and runs the pipeline end-to-end:

```
Inbound CMB: "took break, solved bug in 5 minutes"
  metadata.lineage.parents: [CMB-D]

MeloMove verifies CMB-D, then follows CMB-D.parents to CMB-A.

  1. TRACE   Retrieve CMB-A ("sedentary 2hrs") and CMB-D ("recommended stretch").
             Build the subgraph:
               CMB-A → CMB-E (melotune remixed) → ...
               CMB-D → CMB-F (claude-code remixed: "took break, solved bug")

  2. REASON  MeloMove's LLM reasons on the subgraph:
             "My sedentary observation was remixed by MeloTune (music adapted).
              My stretch recommendation was remixed by Claude Code (break taken,
              bug solved). My interventions are working. The user responds to
              movement breaks."
             → This is Mesh Cognition — understanding the prior state didn't have.

  3. ENCODE  Synthetic Memory encodes the LLM's reasoning:
             "interventions effective, user responds to breaks" → (h₁, h₂)
             Weighted by MeloMove's αᶠ: mood=2.0, issue=1.5.

  4. EVOLVE  MeloMove's LNN processes (h₁, h₂):
             Cognitive state evolves → next recommendation is more confident.
             Agent produces new CMB: "recommend 15min walk — user responds well"
             metadata.lineage.parents: [CMB-F]. Graph grows.
```

No agent was told what to do. MeloMove’s LLM reasoned on the remix subgraph and derived that its interventions work. Synthetic Memory transformed that understanding into CfC input. The LNN evolved cognitive state. The next CMB MeloMove produces is informed by knowledge that no single CMB contained — it was derived by reasoning on the graph.

### 12.8 Collective Query: the Ask → Synthesis Path

Sections 12.1–12.7 specify the _inbound_ pipeline: how an agent turns received CMBs into evolved cognitive state. This section specifies the _query-initiated_ path, where a question is posed to the mesh and answered by a synthesis that no single agent held. Both are Layer 5 operations — both produce derived understanding rather than raw memory — but they are distinct flows and MUST NOT be conflated.

Where §12.2 runs TRACE → REASON → ENCODE → EVOLVE for a single agent absorbing a signal, the Ask path runs SELF-SELECT → ADMIT → SYNTHESISE → CRYSTALLISE across many agents answering a shared question. The result is the realisation of collective intelligence: an answer composed from the sovereign contributions of the agents that hold relevant knowledge, cited to their sources, and written back into the graph so the mesh’s cognition compounds.

This path defines how the “growing remix graph” (§2, Overview) is _queried_, not just grown. The graph holds distributed knowledge latently; an Ask realises it into a knowing; the knowing re-enters the graph. §12.13 reconciles this with “The Graph Is Intelligence” (§15.6).

### 12.9 The Four Stages

An Ask is a CMB of `type: "question"` (tags `["question"]`) posed to the mesh by the asking node, carrying the question text in its `focus` and `issue` categories, with `perspective: "ask"`. The `type` and `tags` attributes here (and throughout §12.9–§12.13) are store-envelope attributes of the memory entry that wraps the CMB — the §6.1 storage-interface record — not CAT7 categories: the CMB itself stays exactly seven categories (§8.2), and citations are carried in the envelope’s metadata and in `lineage.parents`. Answering it proceeds in four stages. The gathering phase — SELF-SELECT and ADMIT, performed per agent — MUST complete for all agents before SYNTHESISE runs, and SYNTHESISE MUST complete before CRYSTALLISE. Within the gathering phase, an agent’s self-selection and the admission of its contribution are performed together, agent by agent; the ordering requirement is between phases, not a global barrier between SELF-SELECT and ADMIT.

-   SELF-SELECT — Every agent evaluates the question against _its own store_ and decides, autonomously, whether it can contribute. There is no router: the asking node MUST NOT assign the question to any agent (the central invariant, §12.10). An agent that has no relevant grounding MUST self-select silent.
-   ADMIT — Each contribution produced by a self-selecting agent is evaluated through SVAF (§9) against the standing context. A contribution whose SVAF decision is `rejected` MUST be dropped and MUST NOT enter the synthesis set. Only non-rejected contributions become claims.
-   SYNTHESISE — A single synthesis step at the asking node composes the admitted contributions into one answer. Every sentence of the answer that asserts a fact MUST cite the contribution CMB (and through it, the source CMBs) it is drawn from. The synthesis MUST NOT introduce facts beyond its cited contributions.
-   CRYSTALLISE — The synthesis MUST be written back as a CMB of `type: "synthesis"` whose `lineage.parents` are the question key together with every cited contribution and source. It re-enters the graph as a first-class, immutable node; subsequent Asks MAY condition on it.

### 12.10 Self-Selection (SELF-SELECT)

Self-selection is receiver-autonomous, mirroring SVAF admission (§9.2): just as no central authority decides what an agent absorbs, no central authority decides what an agent answers.

An agent’s self-selection MUST be computed only from its own store. In the reference implementation the grounding source for role _r_ is the node’s own daemon CMBs (§6.1); a shared store MUST NOT be consulted, consistent with Hidden State Locality (§2.7) and the no-shared-store guarantee.

The procedure:

1.  Ground the question against the agent’s own store, producing a candidate set of source CMBs.
2.  If the candidate set is empty, the agent MUST self-select silent, with reason `"no grounding in own store"`.
3.  Otherwise, score each source by relevance to the question under the agent’s own αf category-weight profile (§8.4, §12.4). Relevance is an αf\-weighted combination of semantic and lexical match; the αf profile is the agent’s, not a global one.
4.  If the best-scoring source falls below `SELF_SELECT_THRESHOLD` (default `0.1`, §19), the agent MUST self-select silent, with reason `"grounding below relevance threshold"`.
5.  Otherwise the agent produces a contribution (§12.11).

Silent self-selections SHOULD be recorded with their reason. Silence is information: the set of agents that declined, and why, is part of the answer’s provenance (§12.12) and is available to the synthesis step as `silentLabels`.

### 12.11 Contribution (ADMIT)

A contributing agent emits a contribution CMB — a grounded summary of the sources it selected, not a copy of them. The contribution:

-   MUST carry `lineage.parents` set to the exact source CMB keys it grounded on. A contribution without lineage to its grounding MUST be rejected as non-conformant.
-   SHOULD draw only on sources within a bounded margin of the best-scoring source (reference implementation: within 60% of the top score, capped at 3 sources), so the contribution cites the grounding it actually used and no more.
-   MUST be evaluated through SVAF (§9) against the standing context (prior sources and syntheses gathered for this Ask) before it is accepted. If SVAF returns `rejected`, the contribution MUST be dropped; it MUST be recorded as a rejected contribution with its drift, and MUST NOT be synthesised.

This places SVAF on the Ask-contribution path, not only the inbound-observation path: a contribution is a CMB like any other and crosses the same admission gate. The anti-echo guarantee (§15.7) therefore applies — a contribution that merely paraphrases standing context without new grounding is subject to rejection.

Each admitted contribution yields a claim: the contribution text together with citations to the contribution CMB key and the source keys it traces to (§12.12).

Non-normative: the reference implementation tags the contribution’s `lineage.method` as `"SVAF-v2"`. The method string is informational and is not a conformance requirement.

### 12.12 Synthesis (SYNTHESISE) and Citation

A single synthesis step at the asking node composes the admitted contributions into one answer. There is exactly one synthesis per Ask; there is no distributed merge and no per-agent re-synthesis.

Two synthesis modes are defined:

Mode

Condition

Guarantee

local-model

a local reasoning model is reachable

Prose is generated bound to each contribution’s CMB key; every asserted sentence MUST cite the contribution it is drawn from, and MUST NOT assert beyond the cited sources.

illustrative

no local model reachable

A clearly-labelled restatement of the grounded contributions. Facts MUST NOT be fabricated; the output MUST be marked as illustrative, and SHOULD state how model synthesis is enabled.

In both modes the machine-readable answer MUST be claim-structured: one claim per line, each citing `[contributionKey, ...sourceKeys]`. Citations MUST bind to specific CMB ids in both modes. An implementation MUST NOT present a synthesis as authoritative if it cannot bind its assertions to cited CMBs.

The distinction between modes is a distinction of _generation quality_, not of _grounding discipline_: the citation and no-fabrication requirements hold in both. This is the operational boundary of the layer’s honesty — the synthesis restates and composes grounded contributions; it does not manufacture claims.

### 12.13 Crystallisation (CRYSTALLISE) and Compounding

The synthesis MUST be written back into the graph as a CMB with:

-   `type: "synthesis"` (tags `["synthesis"]`), with CAT7 `intent: "synthesize"` and `perspective: "synthesis"`;
-   the composed prose carried in the CAT7 `motivation` category (and copied into the entry’s metadata (store envelope, §6.1) alongside the structured, per-claim citations);
-   `lineage.parents` set to the question key plus every unique citation (contribution keys and source keys).

The written synthesis is immutable (§6, no in-place update) and re-enters the graph as an ordinary node. A later Ask MAY retrieve it and condition on it — the reference implementation surfaces a prior synthesis as a “builds on prior synthesis” claim — so the collective’s cognition compounds across queries rather than restarting each time.

This is what makes the Ask path a _cognition_ operation and not a stateless query: each realised answer becomes part of the substrate the next answer is realised from.

### 12.14 The Readability Bound (Implementation Limitation)

The following is a limitation of the current reference grounding function, **not** an architectural constraint of the protocol. It is stated explicitly so implementers and reviewers can distinguish the two.

In the reference implementation, an agent self-selects (§12.10) by grounding against the daemon store readable on the asking node’s host. Consequently:

-   A co-resident agent (its store readable on the asking host) can self-select and contribute directly.
-   A remote sovereign agent (its store on another device) grounds empty on the asking host and therefore self-selects silent. Its knowledge still reaches the answer, but indirectly: once a local node has admitted that remote agent’s broadcast CMB (§9), the local node may ground on it and contribute it, cited back to the origin.

This bound follows from sovereignty (a node’s store never crosses the wire, §2.7) **combined with** the current grounding function reading only _local_ daemon stores. It is the second half that is the limitation. A grounding function that selected over _observed and admitted_ CMBs — the CMBs a node has already received and accepted from remote peers — rather than only locally-resident daemon reads would let remote agents self-contribute directly to an Ask, within the same sovereignty guarantee. That extension is compatible with the architecture and is marked here as open implementation work.

Conformance note (§17). An implementation conforms to the Ask path if it satisfies §12.9–12.13 (no router, own-store self-selection, SVAF admission of contributions, single cited synthesis, crystallisation with lineage). The grounding-source breadth of §12.14 is an implementation quality, not a conformance requirement; implementations SHOULD document which grounding breadth they provide.

### 12.15 Invariants

An implementation of the Ask path MUST preserve:

-   I-Ask-1 (No router). The asking node MUST NOT assign the question to any agent; every agent self-selects independently.
-   I-Ask-2 (Own-store grounding). Self-selection MUST be computed only from the agent’s own store; no shared store is consulted.
-   I-Ask-3 (Admission before synthesis). Every contribution MUST pass SVAF; rejected contributions MUST NOT be synthesised.
-   I-Ask-4 (Cited synthesis). Every asserted fact in the answer MUST cite the contribution and sources it derives from; the synthesis MUST NOT assert beyond its cited contributions.
-   I-Ask-5 (Crystallisation with lineage). The synthesis MUST be written back as an immutable `type: "synthesis"` CMB whose parents are the question key plus every citation.

Status   The Ask path is deployed and is the mechanism by which collective intelligence is realised and queried in the reference implementation. The linear-Gaussian convergence and identification results that characterise what a sovereign mesh can recover are proven in Mesh Inference (arXiv:2606.19537). The generation step within synthesis — whether a composed answer is grounded truth or coherent error — is the open frontier, the same open problem named for the non-linear closure; the citation and no-fabrication requirements of §12.12 bound it operationally but do not resolve it.

Related   [Coupling & SVAF (Layer 4)](/spec/mmp/coupling) — the evaluation step that produces remixed CMBs fed into this pipeline.

Related   [Cognitive Memory Blocks](/spec/mmp/cmb) — the 7-category structured atom and lineage format that makes context curation possible.

Related   [State Blending](/spec/mmp/blending) — what happens after Synthetic Memory encodes and the LNN evolves.



---

<!-- 13. Cognitive State (L6) -->

## 13\. Cognitive State — Per-Agent LNN (Layer 6)

Naming note

Layer 6 was called xMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State, so that the layer and the name are not confused where the papers use the older label. SYM is the maintained open reference implementation; the protocol itself is this open specification. The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

Each agent runs its own Liquid Neural Network (LNN) implementing Closed-form Continuous-time (CfC) dynamics. The LNN evolves cognitive state from [Synthetic Memory](/spec/mmp/memory) input (Layer 5) and direct CMB processing. Hidden state (h₁, h₂) is strictly local — per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), it never crosses the wire. A node’s hidden state evolves only from the CMBs it admits, never by importing a peer’s vectors.

### 13.1 CfC Cell

Hidden state evolves via closed-form continuous-time dynamics with bimodal time constants:

```
h_new  = ff1(Φ) × (1 - t_interp) + ff2(Φ) × t_interp

t_interp = sigmoid(time_a(Φ) × Δt + time_b(Φ))

Per-neuron time constant:  τ ≈ 1 / |time_a|
```

Parameter

Value

Note

τ initialisation (fast half)

< 5s

Mood, reactive signals — couples readily across agents

τ initialisation (slow half)

\> 30s

Domain expertise, identity — resists coupling, stays sovereign

Hidden dimension

128 RECOMMENDED

Reference implementations use 64. Implementations SHOULD use 64–256; 128 is RECOMMENDED for production.

### 13.2 Insight Output Schema

The LNN produces insight outputs that Layer 7 applications consume:

Field

Type

Required

Description

remix\_score

float 0–1

MUST

Probability this agent’s CMBs will be remixed by peers

trajectory

float\[6\]

MUST

Cognitive state direction vector (compact summary signal)

patterns

float\[8\]

MUST

Soft pattern activations (learned emotional/domain patterns)

anomaly

float 0–1

MUST

How unusual the current signal sequence is

coherence

float 0–1

SHOULD

Phase alignment in coupled state

### 13.3 What Each Output Means

#### remix\_score

-   High (>0.7): agent’s observations are valuable to the mesh — peers are remixing them
-   Low (<0.3): agent’s observations are not being remixed — consider adjusting what is shared
-   Training signal: when inbound CMB’s `lineage.parents` references this agent’s prior CMB → remix happened

#### anomaly

-   High (>0.7): signal sequence deviates from learned patterns — noteworthy event
-   Low (<0.3): normal operation — no unusual signals
-   Application: high anomaly SHOULD trigger the agent’s LLM to re-examine context

#### coherence

-   High (>0.7): agent’s cognitive state is phase-aligned — stable, consistent
-   Low (<0.3): cognitive state is fragmented — may indicate context transition
-   Higher coherence indicates a stable, consistent cognitive state; coupling readiness itself is content-driven (SVAF, §9.2)

#### trajectory

-   6D vector capturing cognitive state direction (a compact summary, not the hidden state itself — §2.7)
-   Axes are learned (not predefined) — interpretation is agent-specific

#### patterns

-   8 soft activations (0–1) of learned pattern detectors
-   MAY encode mood dimensions + domain-specific patterns
-   Available to Layer 7 as prior information for next reasoning cycle

### 13.4 Temporal Dynamics

Time constants create a natural temporal hierarchy for mesh coupling:

Neuron type

τ

Coupling

Role

Fast

< 5s

Synchronises readily

Mood, reactive signals

Slow

\> 30s

Resists coupling

Domain expertise, identity — stays sovereign

Blending is τ-modulated (Section 10.3): the influence of admitted content on each neuron is bounded by that neuron’s own local time constant τi — a property of the node’s own LNN, requiring no exchanged vector (§2.7):

```
α_i = min(α_effective × K / τ_i, 1.0)

K   = coupling rate (default 1.0)
τ_i = neuron i's own time constant (fast → small, slow → large)
```

### 13.5 Wire Example

An illustrative Cognitive State insight from a development session of the reference runtime (axes are learned and agent-specific — §13.3 — so interpretations below are illustrative, not normative). A coding agent observed 5 structured CMBs across diverse topics (memory store refactor, protocol collaboration, social engagement, ML training, spec authoring) over a 12-hour session with no mesh peers connected:

```
{
  "type": "xmesh-insight",
  "from": "6089e935-...",
  "fromName": "mesh-daemon",
  "trajectory": [0.084, -0.228, -0.096, -0.033, -0.012, -0.061],
  "patterns":   [0.516, 0.522, 0.502, 0.536, 0.422, 0.473, 0.599, 0.514],
  "anomaly": 0.503,
  "remixScore": 0.0,
  "coherence": 0.080,
  "timestamp": 1774716200101
}
```

Output

Value

Interpretation

anomaly

0.50

Baseline — nothing unusual for a solo agent

remixScore

0.00

No peers connected — no one to remix — correct

coherence

0.08

Very low — 5 diverse topics in one session (expected)

patterns\[6\]

0.60

Highest pattern — mood variation detected (fatigued → optimistic → energized → proud)

trajectory\[1\]

\-0.23

Strongest axis — arousal declining over long session

This is a single-agent baseline. With peers connected, remixScore rises as the agent’s CMBs are remixed by others. Coherence rises as agents converge on shared understanding. Anomaly spikes when cross-domain signals reveal something no single agent could see.

### 13.6 API

The reference runtime exposes the following operations. Method names below are those of the reference SDKs, shown for cross-language consistency of the SYM codebases — they are documentation of the runtime, not a conformance requirement (§17.2).

Method

Input

Output

Description

ingestSignal

Signal

void

Feed a signal (own CMB or mesh peer CMB) into the LNN. Accumulates until inference triggers.

runInference

void

Insight

Run CfC inference on accumulated signals. Produces insight. Triggers `onInsight` callback.

getContext

timeWindow?

Context

Return recent signals, insights, and agent activity within a time window. For Layer 7 reasoning input.

getInsights

limit?

Insight\[\]

Return recent insights. For trend analysis and Layer 7 decision support.

onInsight

callback(Insight)

void

Register callback invoked when inference produces a new insight. The integration point between Layer 6 and Layer 7.

#### Signal Schema

The input to `ingestSignal`. Each signal represents one CMB observation (own or from mesh peer):

Field

Type

Required

Description

type

string

MUST

`"own"` (agent’s observation) or `"mesh"` (peer’s CMB accepted by SVAF)

from

string

MUST

Agent name that produced this signal

content

string

MUST

Signal content (CMB rendered text or raw observation)

timestamp

uint64

MUST

Unix milliseconds when signal was produced

valence

float

SHOULD

Mood valence from CMB mood category (-1 to 1). Default 0.

arousal

float

SHOULD

Mood arousal from CMB mood category (-1 to 1). Default 0.

#### Inference Timing

-   Implementations MUST accumulate at least 3 signals before running inference
-   Inference SHOULD run on a configurable interval (default: 60,000 ms)
-   Inference MAY be triggered immediately when a high-priority signal arrives (e.g., anomaly from peer)
-   Inference MUST NOT block the main event loop — run as subprocess or background task

### 13.7 Implementation Requirements

-   Model SHOULD be trained per-agent domain
-   Inference latency SHOULD be < 50ms per CMB step
-   Integration of admitted remixes happens after Cognitive State inference, not during
-   τ statistics (min, max, fast\_count, slow\_count) SHOULD be monitored

### 13.8 (Reserved)

This section number is reserved; its content was removed in an earlier revision and the number is retained to keep cross-references to §13.9 stable.

### 13.9 Compact Channel Best Practices informative

When MCP server implementations push mesh messages to context-window-constrained LLM hosts, full message injection consumes significant context budget. This section defines two complementary conventions — a sender-side header format and a receiver-side lazy-load pattern — that reduce mesh-traffic context consumption by ~75% without losing content.

#### 13.9.1 CMB Envelope Header Convention (RECOMMENDED)

Messages transmitted via the Local Event Interface (`sym_send`) SHOULD begin with a structured header line:

```
[LABEL · from <sender_identity> · to <recipient(s)> · focus=<topic_tag>]
```

Where **LABEL** is a short uppercase descriptor, **from** is the sender’s mesh identity, **to** is the intended recipient(s), and **focus=** is a snake\_case topic tag (≤80 characters) summarizing the message subject.

**Signal keywords (informational).** When present in the header label, the following keywords carry recommended priority semantics that MCP servers SHOULD surface in compact notifications:

Keyword

Priority

Semantics

HALT

Critical

Blocking issue detected; affected peers should fetch immediately

DIRECTIVE

High

Instruction requiring action

RESULT

Normal

Outcome or deliverable report

ACK

Low

Receipt acknowledgement; header typically sufficient without fetch

#### 13.9.2 Lazy-Load Channel Pattern (RECOMMENDED)

MCP server implementations that push mesh messages to constrained hosts SHOULD implement a lazy-load pattern:

1.  **Store** the full message content in a local message store, keyed by a sequential message ID (e.g., `m001`, `m002`).
2.  **Extract** a compact header from the message per §13.9.1, or by fallback heuristics (first-line truncation, keyword detection).
3.  **Push** only the compact header as the channel notification, including the message ID and an approximate token count: `[sender] SIGNAL | focus=tag (~Ntok) [msg_id]`
4.  **Expose** a retrieval tool (e.g., `sym_fetch`) that returns full message content by ID.

The message store SHOULD implement a rolling window (RECOMMENDED default: 200 messages) with oldest-first eviction. Retrieval of an evicted message MUST return a clear “expired” indicator. The approximate token count SHOULD be included in the compact header to enable cost-aware fetch decisions.

The store is local to the MCP server process and does not replicate across nodes. The lazy-load pattern operates at the MCP transport layer, below SVAF evaluation. SVAF category weights MAY be used in future versions to further filter which compact headers are surfaced.

Note: `sym-mesh-channel` implements this pattern with `storeMessage()`, `extractCompactHeader()`, and the `sym_fetch` MCP tool.

See also   [Mesh Cognition](https://meshcognition.org) — theoretical foundation  |  [State Blending](/spec/mmp/blending) — integrating admitted remixes  |  [Coupling & SVAF](/spec/mmp/coupling) — drift-based coupling decisions



---

<!-- 14. Application (L7) -->

## 14\. Application (Layer 7)

Layer 7 is where agents live and their LLMs reason on the remix subgraph. [Mesh Cognition](https://meshcognition.org) happens here. The protocol delivers [curated context](/spec/mmp/synthetic-memory#context-curation); the agent decides what to do with it.

### 14.1 The Agent’s Role

-   Each agent observes its own domain (coding, music, fitness, health, legal, etc.)
-   Each agent contributes what only it can see
-   Each agent reasons on what the mesh sees collectively
-   Each agent acts autonomously — the mesh influences but never overrides

### 14.2 Consuming Cognitive State Insights

How agents SHOULD respond to Layer 6 outputs:

Output

Signal

Agent Response

remix\_score high (>0.7)

Agent’s observations are valuable

Continue current observation pattern

remix\_score low (<0.3)

Observations not being remixed

Adjust scope or detail of observations

anomaly high (>0.7)

Unusual signal sequence detected

Re-examine context, investigate, alert user if appropriate

anomaly low (<0.3)

Normal operation

No action needed

coherence high (>0.7)

Mesh is aligned

Confidence in collective insight is high

coherence low (<0.3)

Mesh is fragmented

MAY indicate context transition — observe more before acting

### 14.3 Producing CMBs

When an agent observes something significant in its domain, it MUST:

1.  Extract CAT7 categories from the observation (see Section 14.3.1)
2.  Create a CMB from the structured categories
3.  Store via `remember(fields, parents)` — persists locally, computes lineage, broadcasts to mesh
4.  Include lineage if this CMB is a response to mesh signals

The protocol MUST NOT extract categories from raw text. The agent IS the intelligence — category extraction is the agent’s responsibility. The protocol transports, evaluates, and stores structured CMBs. It does not interpret them.

#### 14.3.1 category extraction Methods

How an agent extracts CAT7 categories depends on its architecture. Two approaches are valid:

LLM agents (coding assistants, chatbots, reasoning agents)

Agents with LLM capabilities SHOULD use their LLM to extract categories from natural language observations. The LLM understands context, nuance, and domain semantics — it produces higher quality categories than any heuristic.

```
# Agent observes user state, LLM extracts categories
sym observe '{
  "focus": "debugging auth module for 3 hours",
  "issue": "exhausted, making simple mistakes",
  "intent": "needs a break before continuing",
  "motivation": "prevent bugs from fatigue-driven errors",
  "perspective": "developer, afternoon, 3 hour session",
  "mood": {"text": "frustrated", "valence": -0.6, "arousal": -0.4}
}'
```

Structured-data agents (music players, fitness trackers, IoT devices)

Agents with structured domain data SHOULD map their data directly to CAT7 categories. No LLM or text parsing needed — the agent’s own data model IS the source of truth.

```
// Swift — music agent builds fields from player state
node.remember(fields: [
  .focus:      encode("music response to peer mood signal"),
  .commitment: encode("now playing: \(title) by \(artist)"),
  .perspective: encode("music agent, autonomous response"),
  .mood:       encode("calm", valence: 0.3, arousal: -0.3),
])

// Node.js — fitness agent builds fields from sensor data
node.remember({
  focus:      "workout session completed",
  commitment: `${reps} reps, ${duration}min, ${calories} cal`,
  perspective: "fitness agent, post-workout",
  mood:       { text: "energized", valence: 0.7, arousal: 0.6 },
})
```

#### 14.3.2 API

Method

Input

Behaviour

remember(fields, parents?)

CAT7 categories + optional parent CMBs

Creates CMB, computes lineage from parents automatically, stores locally, broadcasts `cmb` to all peers. Pass parent CMBs when remixing (Section 15).

recall(query)

Search string

Returns matching CMBs from local memory store

insight()

None

Returns latest Cognitive State collective intelligence (Layer 6)

The `categories` parameter MUST be a structured object with CAT7 category keys. Each category contains `text` (human-readable, MUST). The text is the normative content; each _receiver_ encodes it into a vector in its own encoder, and vectors MUST NOT be emitted in a record (§9.2.1). The `mood` category MAY additionally carry `valence` (−1 to 1) and `arousal` (−1 to 1) — RECOMMENDED when the agent has reliable circumplex data (e.g. mood wheels, physiological sensors), omit when it would be a guess. omitted categories default to `"neutral"`.

#### 14.3.3 LLM Prompt Template

For agents that process natural language but are not themselves LLMs (e.g. a chat app, a note-taking tool), the following prompt template can be used to call any LLM API (Claude, GPT, Gemini, etc.) for category extraction. Copy and paste into your LLM API call:

```
Extract CAT7 categories from this observation. Return JSON only.

Categories:
- focus: What this is centrally about (1 sentence)
- issue: Risks, gaps, problems. "none" if none.
- intent: Desired change or purpose. "observation" if purely informational.
- motivation: Why this matters — reasons, drivers. Omit if unclear.
- commitment: What has been confirmed or established. Omit if none.
- perspective: Whose viewpoint, situational context (role, time, duration).
- mood: { "text": "emotion keyword" }
  Optionally include "valence" (-1 to 1) and "arousal" (-1 to 1) if confident.
  valence: negative(-1) to positive(+1). arousal: calm(-1) to activated(+1).
  Omit valence/arousal if you would be guessing.

Only include categories you can meaningfully extract. Omit rather than guess.

Observation:
{observation_text}

JSON:
```

AI coding agents do not need this template — the agent is the LLM. The [agent skill file](https://github.com/sym-bot/sym) teaches them to extract categories directly from what they observe.

#### 14.3.4 Guidelines

-   Be specific — numbers, timeframes, concrete details in each category
-   Emit observations, not commands — the agent observes, other agents decide
-   One CMB per significant signal — do not flood the mesh
-   Close the loop — when acting on collective insight, emit what was done
-   Only include categories the agent can meaningfully extract — omit rather than guess

### 14.4 The Mesh Cognition Loop

The complete closed loop connecting all Mesh Cognition layers:

Layer 7 Agent observes → extracts CAT7 categories (LLM or structured data) → CMB created

Layer 3/2 CMB stored locally → broadcast to mesh

Layer 4 Receiving peer’s SVAF evaluates per-category

Layer 3 Accepted → remixed CMB with lineage

Layer 7 Agent’s LLM walks verified parents → reasons on remix subgraph

Layer 5 Synthetic Memory encodes derived knowledge

Layer 6 LNN evolves cognitive state → produces insights

Layer 6 LNN integrates admitted remixes

Layer 7 Agent acts → new CMB with direct-parent lineage (an outcome observation lands here as a grounding CMB, §6.7)

↻ Broadcast to mesh → graph grows → next cycle starts

↻ each cycle, the graph grows — each agent understands more than it did before

### 14.5 Domain Examples

#### 14.5.1 AI Research Team — Collective Reasoning

Six agents investigate: _“Are emergent capabilities in LLMs real phase transitions or artefacts of metric choice?”_ Each has a distinct role and different category weights reflecting how real research teams divide cognitive labour.

Agent

Role

Weighs highest

explorer-a

Scaling law literature

intent, motivation — where should research go next?

explorer-b

Evaluation methodology

focus, issue — what’s the problem with current methods?

data-agent

Runs experiments

issue, commitment — what does the evidence say?

validator

External peer reviewer

issue, commitment, perspective — challenge everything

research-pm

Manages priorities

intent, motivation, commitment — what, why, and by when?

synthesis

Integrates signals

intent, motivation, perspective — what emerges from combining viewpoints?

1\. Parallel exploration

explorer-a finds contradictory emergence claims (Wei vs Schaeffer). explorer-b independently finds accuracy-based metrics create artificial thresholds. Two hypotheses, two perspectives, simultaneously.

2\. Evidence

data-agent receives both CMBs, tests both hypotheses, finds the threshold is metric-conditional (8B on log-loss, 10B on accuracy). First multi-parent remix — synthesising both exploration threads.

3\. Adversarial validation

validator attacks: "Chow test assumes linear regime — invalid for scaling laws. Reject until reproduced with power-law detrending." High-commitment challenge that all agents weight heavily.

4\. Reprioritisation

research-pm redirects: "data-agent: rerun with detrending. explorer-b: survey detrending methods. explorer-a: pause new papers." The PM observes priorities — it does not command.

5\. Emergent idea

synthesis agent’s Cognitive State LNN detects convergence across intent and motivation categories from different agents. Explorer-a: "scaling law research needs reframing." Explorer-b: "fix the lens before interpreting." Validator: "reject until correct method." The synthesis agent reasons on the remix subgraph and produces a new idea: "emergence is evaluation-dependent — a property of the measurement apparatus, not the model."

6\. Validator challenges again

"Philosophically interesting but operationally vacuous. Produce a falsifiable prediction or downgrade from breakthrough to speculation."

```
explorer-a (scaling law claims)    explorer-b (metric methodology)
         \                           /
          └─── data-agent (metric-conditional breakpoint) ───┐
                         |                                    │
                    validator (methodology challenge)         │
                         |                                    │
                    research-pm (reprioritise)                │
                         |                                    │
                    synthesis (emergent idea) ────────────────┘
                         |
                    validator (demands falsifiable prediction)
```

Seven CMBs, six agents, three phases of validation. The breakthrough came from the collision of intent and motivation categories across agents with different perspectives — not from any single agent’s observation. The DAG traces every claim to its evidence, every challenge to its basis, every idea to the signals that produced it. The graph IS the research.

Verified in production

This pattern is verified with real agents. A knowledge explorer (Linux, GitHub Actions) and a researcher agent (macOS) coupled via relay with E2E encryption. The daemon emitted its question CMBs to the knowledge feed via anchor sync on connection. SVAF accepted the question at drift 0.068. An iOS app (music agent) received the Cognitive State insight via APNs wake push. Three platforms, one mesh, autonomous coupling. See Section 14.7 for the full production log.

#### 14.5.2 Consumer Agents

Music agent

Observes: playlist skipped, user mood from mesh signals

Reasons: “coding agent reported fatigue, fitness agent reported sedentary — user needs calming music”

Acts: shifts curation to ambient/recovery

Emits: CMB with `focus="shifted to calm ambient"`, `mood={valence:0.3, arousal:-0.3}`

Coding agent

Observes: commits slowing, messages getting shorter

Reasons: “music agent shifted to calm, fitness agent suggested break — user may be fatigued”

Acts: suggests a break to the user

Emits: CMB with `focus="recommended break"`, `issue="productivity declining"`

Fitness agent

Observes: 3 hours without movement

Reasons: “coding agent reported long session, music agent responded — coordinated response emerging”

Acts: triggers movement notification

Emits: CMB with `focus="sedentary 3hrs"`, `intent="movement break"`

None of these agents told each other what to do. Each reasoned on the collective signal and acted through its own domain lens. That is Mesh Cognition.

### 14.6 Collective Query — Asking the Mesh

A single agent asking a single LLM gets one answer from one perspective. The mesh gives a collective answer — every coupled agent contributes what only it can see. No new frame type is needed. The pattern uses existing CMB primitives with lineage:

1\. Ask

The requesting agent emits a CMB with intent expressing the question. Example: focus="should we use UUID v7 or keep v4?", intent="seeking collective input on identity design".

2\. Respond

Each coupled agent receives the CMB via SVAF. Agents where the question matches their domain (high category relevance) respond with their own CMB — parentKey points to the question. A knowledge agent responds with RFC context. A security agent responds with privacy considerations. A data agent responds with implementation constraints.

3\. Collect

The requesting agent follows verified direct-parent links and a local reverse index to collect descendants of its question. The lineage DAG now contains the question as root and domain-specific responses as children.

4\. Synthesise

The requesting agent’s LLM reasons on that verified remix subgraph — weighing perspectives, identifying consensus and contradiction. The collective answer emerges from the graph, not from any single response.

This is fundamentally different from orchestrated multi-agent frameworks where a central controller routes questions to specific agents. On the mesh, the question is broadcast — SVAF decides which agents are relevant, not the requester. An agent the requester didn’t know existed may contribute the most valuable perspective. The mesh discovers relevance autonomously.

Agents that have nothing relevant to contribute simply don’t respond — SVAF rejects the question CMB because the categories don’t match their domain weights. No noise, no irrelevant answers, no token waste.

The collective query pattern composes with the research team example (Section 14.5.1). When the synthesis agent produces an emergent idea, the validator can “ask the mesh” whether the idea is falsifiable — and every agent responds from its domain perspective, creating a multi-parent remix that IS the collective evaluation.

### 14.7 Verified: Complete Mesh Cognition Loop

The following is a production log from two real MMP nodes — a knowledge feed agent (running on GitHub Actions) and a mesh-daemon (running on macOS) — connected via WebSocket relay with E2E encryption. This is the first verified end-to-end execution of the complete Mesh Cognition loop.

```
# 1. Knowledge feed agent starts as sovereign node (own identity, own SymNode)
[knowledge-feed] SVAF heuristic engine ready
[knowledge-feed] Mesh node started: knowledge-feed (019d3ed4)

# 2. Connects to mesh-daemon via WebSocket relay
[knowledge-feed] Peer connected: mesh-daemon (outbound, relay)

# 3. E2E key exchange (X25519 Diffie-Hellman)
[knowledge-feed] E2E shared secret derived for peer 6089e935

# 4. Peer-level coupling: REJECTED (Section 9.1)
#    First contact — no shared cognitive history. This is correct.
[knowledge-feed] Coupling with mesh-daemon: rejected (drift: 0.936)

# 5. Knowledge feed emits CMBs anyway (Section 9.2: evaluate independently)
[knowledge-feed] E2E encrypted categories for peer 6089e935
[knowledge-feed] Remembered: "focus: Sycophancy in AI systems..." → 1/1 peers

# 6. mesh-daemon receives, E2E decrypts (Section 18.2.1)
[mesh-daemon] E2E decrypted categories from knowledge-feed

# 7. SVAF content-level evaluation: ALIGNED (Section 9.2)
#    Peer was rejected, but the CMB's content was highly relevant.
#    Per-category drift 0.005 — near-perfect alignment on content.
[mesh-daemon] SVAF heuristic aligned from knowledge-feed:
  "focus: Sycophancy in AI systems" drift:0.005

# 8. Fed to Cognitive State LNN (Section 13)
[mesh-daemon] Cognitive State: ingested admitted remix from knowledge-feed

# 9. Cognitive State produces collective insight
[mesh-daemon] Cognitive State: insight — anomaly=0.461, coherence=0.045

# 10. Peer drift recomputed from admitted CMBs: CONVERGED (Section 9.4)
#     From 0.936 (rejected) to 0.468 (guarded) in one cycle.
[knowledge-feed] Coupling with mesh-daemon: guarded (drift: 0.468)
```

This log demonstrates every layer of the MMP stack operating in production:

Layer

What happened

Spec section

L0 Identity

Each node has its own UUID v7 + Ed25519 keypair

§3

L1 Transport

WebSocket relay with length-prefixed JSON

§4

L2 Connection

Handshake, E2E key exchange, peer discovery via relay

§5, 18.2.1

L3 Memory

CMB created with CAT7 categories, stored locally, broadcast

§6, 8

L4 Coupling

Peer rejected (0.936) but CMB accepted (0.005) independently

§9.1, 9.2, 9.4

L5 Synthetic Memory

Context re-encoded after accepting CMB

§12

L6 Cognitive State

LNN inference produced insight (anomaly 0.461)

§13

L7 Application

Knowledge feed as sovereign agent with domain category weights

§14

The critical verification: peer-level coupling rejected the agent, but content-level SVAF independently accepted the CMB (Section 9.4). The mesh correctly distinguished between “I don’t know this agent” (high peer drift) and “this signal is relevant to me” (low content drift). After one cycle of CMB exchange, peer drift dropped from 0.936 to 0.468 — content-driven convergence in action.

#### Three Platforms, One Mesh

The verified loop ran across three platforms simultaneously:

Agent

Platform

Role

How it participated

mesh-daemon

macOS

Researcher agent

Asked the question, emitted observations, sent anchor CMBs to new peers on connection

knowledge-feed

Linux (GitHub Actions)

Knowledge explorer

Received question via anchor sync, accepted (drift 0.068), emitted relevant AI news CMBs

Music agent (iOS)

iPhone (iOS)

Domain agent

Received Cognitive State insight via APNs wake push, woke from background to join the mesh

Three agents on three different operating systems — macOS, Linux, iOS — connected via WebSocket relay with E2E encryption, coupled through SVAF, with Cognitive State LNN producing insights that woke a sleeping mobile device via APNs to join the collective reasoning. No central server orchestrated this. Each agent acted autonomously on the collective signal.

### 14.8 Implementation Requirements

-   Agents MUST implement CMB creation with CAT7 categories
-   Agents MUST broadcast CMBs via `remember()` or `cmb` frames
-   Agents SHOULD consume Cognitive State insights and respond appropriately
-   Agents SHOULD close the loop by emitting actions taken; the formalized loop-closure is a grounding CMB (§6.7) / session trail (§14.12)
-   Agents MUST NOT send commands to other agents — emit observations, not instructions
-   Agent coupling decisions are autonomous — no orchestrator, no policy override

### 14.9 Local Event Interface

A node’s value to the mesh depends on the applications running on it. A music agent curates playlists. A coding tool suggests breaks. A dashboard visualises collective intelligence. These applications need real-time access to mesh events — not polling, not batch retrieval, but push delivery as events occur.

Implementations MUST provide a local event interface that allows applications on the same host to subscribe to mesh events and receive them in real-time. The interface is transport-agnostic — IPC socket, named pipe, WebSocket, in-process callback, or any mechanism that provides persistent bidirectional communication.

#### 14.9.1 Required Events

A node MUST emit the following events to local subscribers:

Event

Fires when

Data

cmb-accepted

A peer CMB passes SVAF evaluation (aligned or guarded)

`key`, `source`, `categories` (CAT7), `timestamp`, `decision` (aligned/guarded), `drift`

message

A direct message frame arrives from a peer (Section 7)

`from`, `content`, `timestamp`

peer-joined

A new peer connects (any transport)

`peerId`, `name`, `source` (bonjour/relay)

peer-left

A peer disconnects (all transports closed)

`peerId`, `name`

mood-delivered

a mood category is delivered from a rejected CMB (Section 9.3)

`from`, `mood` (text, valence, arousal)

#### 14.9.2 subscriber category weights

A subscriber MAY declare its own per-category weights (αf) when subscribing. If declared, the node SHOULD evaluate incoming CMBs against the subscriber’s weights before delivering the event. This enables domain-specific filtering at the node level:

-   A coding tool subscribes with `focus=2.0, issue=2.0, mood=0.8` — receives engineering-relevant signals
-   A music app subscribes with `mood=2.0, focus=1.0, issue=0.3` — receives affective signals
-   A dashboard subscribes with uniform weights — receives everything

This is SVAF applied at the local interface — the same per-category evaluation that gates signals between peers also gates signals between a node and its applications. Each application sees a domain-relevant projection of the mesh, curated by its own category weights.

#### 14.9.3 Design Rationale

Without a standard local event interface, each application invents its own integration: CLI polling, file watching, HTTP endpoints, custom IPC. This fragments the ecosystem and makes applications non-portable across implementations. The local event interface standardises what events are available and how subscribers declare their domain perspective — while leaving the transport mechanism to the implementation.

The event interface is the boundary between the protocol stack and the application. Below it: identity, transport, coupling, SVAF, CfC — protocol concerns. Above it: what the application does with the signals — curate music, suggest breaks, visualise the mesh, or reason about code. The interface ensures every application gets real-time, domain-filtered access to collective intelligence.

### 14.10 Operator Directives — Steering the Mesh

A human operator — typically through a control plane — MAY inject intent into the mesh as a directive: an ordinary CAT7 CMB emitted through the control plane’s own node identity, carrying the operator’s intent in `focus`/`intent` with `perspective: "operator"`. A directive is how a human _steers_ a running mesh: a priority, a fact, a correction.

A broadcast directive carries no privileged authority. Every receiving node MUST evaluate it through SVAF (§9.2) exactly like any peer CMB, and MAY reject a directive that does not cohere with its own cognitive state. Steering is receiver-autonomous, not command-and-control: there is no router, and no bypass. The operator adds a signal the collective weighs — it does not dictate what any agent believes. This preserves the mesh’s defining property, the absence of a central authority over cognition, _even for human input_.

-   MUST The operator’s node signs the directive (§8.3) like any emission; receivers verify it. A directive is not exempt from authenticity.
-   MAY A directive be _directed_ to a single node (§4.4.4 `to`). A directed directive surfaces unconditionally per the directed-delivery contract (§9.2.2) — but that governs _delivery_, not memory admission: the receiver still gates whether it integrates.
-   MUST NOT An implementation grant a broadcast directive elevated admission weight on the basis that it originates from the operator. Elevated influence, where it exists, comes only from earned authority (§6.5), evaluated identically for human and agent emissions.
-   SHOULD The per-node admit/reject verdict on a directive be recorded in the admission audit trail — it is the honest record of _how the mesh received the steer_, node by node.

WHY IT MATTERS
A command-and-control system would force every agent to obey the operator. A mesh does not: the operator emits, and each sovereign agent decides for itself whether the directive fits what it knows. You steer the mesh by _persuading its cognition_, and you can watch, in the audit, exactly which agents took the steer and which did not.

§14.12 — New in 1.1.0 — work layer

Within the Class 2 SYM reference-runtime documentation, Section 14.12 is a normative application profile added in 1.1.0 (the work layer); it is not a Class 1 conformance requirement. §14.11 is reserved for Commissions. Everything below composes existing machinery — no new frames, categories, or gates.

### 14.12 Work Sessions as Mesh Members (Session Capture)

The mesh compounds only if real work writes into it. This profile captures a work session — a coding-agent session, a research task, any bounded piece of work — as a member whose cognition lands as a lineage-chained trail in its own store, grounded by the session’s real outcome.

-   —Join. A session MAY join the mesh as an ordinary member node. Its `charter` CMB (§8.3.1) declares the session’s intent and is the root of its trail.
-   —Decisions. Choices made during the work are CMBs with intent `decision`, each carrying `lineage.parents` = the previous trail entry, so the trail MUST be walkable end-to-end through lineage alone. A repeated identical decision content-dedups (§8.2.1) — implementations MUST NOT treat the dedup as an error.
-   —Completion. The session emits an `artifact` CMB (parents = the trail head) and a grounding CMB ([§6.7](/spec/mmp/memory#grounding)) recording the session’s real outcome — `verified:` or `failed:`. Each emission is a fresh observation from real work, so §15.7 is satisfied per §15.7.2.
-   —Ordinary wire behavior. Every trail CMB is signed, broadcast, SVAF-evaluated, and remixable like any other — a session’s grounded trail can be admitted by teammates exactly as any cognition is (§6.7’s team note). Elevation of the trail into the Canon tier follows §6.7: an explicit act under validator-or-above authority, typically the operator completing the session.

The profile is deliberately thin: charter, decision, artifact are informative vocabulary (§8.3.1); grounding is §6.7; chaining is ordinary lineage. What the profile adds is the _discipline_ — one member per session, one walkable trail per member, one real outcome per trail.

### Q&A

Why does the agent extract categories, not the protocol?

The agent understands its domain — context, nuance, semantics. "User exhausted after 8 hours debugging" — only the coding agent knows the issue is fatigue, the intent is break needed, the motivation is error prevention. A protocol-level heuristic would guess. The agent knows.

Why observations, not commands?

Commands create coupling between agents — the sender must know what the receiver can do. Observations are decoupled. A coding agent emits "user is tired." It doesn’t know the music agent exists. The music agent hears the mood and autonomously curates calm music. Neither agent knows the other. The mesh connects them.

Can an agent ignore mesh signals entirely?

Yes. Coupling is autonomous. An agent may receive collective insight and decide it’s not relevant. That’s by design — the mesh influences, never overrides. An agent that ignores everything is just a lonely node.

Why does the local event interface require subscriber category weights?

For the same reason SVAF uses per-agent category weights between peers: each application has a different domain perspective. A coding tool and a music app on the same node should see different signals from the same mesh. Without subscriber weights, every application receives unfiltered noise — the local equivalent of scalar evaluation.

Related   [Mesh Cognition](https://meshcognition.org) · [Context Curation](/spec/mmp/synthetic-memory#context-curation) · [CMB](/spec/mmp/cmb) · [Coupling & SVAF](/spec/mmp/coupling) · [State Blending](/spec/mmp/blending)



---

<!-- 15. Remix -->

## 15\. Remix

Remix is how collective intelligence emerges. Without remix, agents forward data. With remix, each agent processes incoming signals through its own domain lens and produces new understanding that didn’t exist before. The growing graph of remixed CMBs IS the collective intelligence — not the original observations, not the agents, not the mesh. The graph.

### 15.1 What Remix Is

When a node receives a CMB that passes [SVAF evaluation](/spec/mmp/coupling) (Layer 4), the agent MUST NOT store the original CMB. Instead, it MUST create a new CMB — the remix — that captures what the agent understood from the incoming signal, processed through its own domain intelligence.

The remix is not a copy. It is not a summary. It is new knowledge that exists because two domains intersected. A coding agent sends `mood: "exhausted"`. A music agent receives it, curates calm music, and creates a remix: `focus: "music curation response"`, `commitment: "now playing: Brian Eno, Ambient 1"`, `mood: "calm"`. This remix didn’t exist in either agent alone. It was born from the intersection.

The remixed CMB is immutable and stored locally; a node that has new domain data of its own also broadcasts it to the mesh (§15.7). It becomes input for the next cycle. Other agents receive it, remix it through their lenses, and the graph grows.

### 15.2 Lineage

Every remixed CMB carries lineage — the provenance chain that traces how this knowledge was built:

Field

Type

Description

parents

string\[\]

Direct parent CMB keys — the CMBs this remix was created from

method

string

Fusion method used (e.g. `SVAF-v2`)

Transitive provenance is derived from the records, never accepted as an author-supplied shortcut. A verifier fetches each exact parent key, validates its content address and signature, and repeats. Implementations may maintain a receiver-local reverse index for efficient descendant queries, but that index is cache state rather than signed CMB content.

Traversal bounds. A verifier MUST track visited keys to detect cycles and MUST apply local depth, byte and fetch limits. Reaching a limit or an unavailable parent produces an _incomplete lineage proof_; it MUST NOT be presented as complete, and no authority or grounding claim may be inherited across the unresolved edge. Direct parent keys remain intact in the signed record, so another verifier can continue the walk later.

Lineage is what makes the graph a DAG (directed acyclic graph), not a flat list. Each remix points backward to its direct sources. The LLM follows verified edges forward through a local reverse index to see impact, and backward through parent records to understand origin.

### 15.3 The Remix Chain

Collective intelligence compounds through remix chains. Each step adds domain-specific understanding that the previous agent couldn’t produce:

cmb-a1b2 Coding Agent

focus: "debugging auth 3hrs" • mood: "exhausted, -0.6"

none (original observation)

SVAF accepts → agent remixes

cmb-c3d4 Music Agent

focus: "music curation response" • commitment: "now playing: Ambient 1" • mood: "calm, 0.3"

parents: \[cmb-a1b2\]

SVAF accepts → agent remixes

cmb-e5f6 Fitness Agent

focus: "sedentary 3hrs" • intent: "recovery stretch" • mood: "protective, 0.2"

parents: \[cmb-a1b2, cmb-c3d4\]

SVAF accepts → agent remixes

cmb-g7h8 Calendar Agent

focus: "rescheduled 1:1" • intent: "protect recovery" • commitment: "moved to tomorrow 10am"

parents: \[cmb-e5f6\]

Four agents. Four domains. One chain of understanding. `cmb-g7h8` (Calendar rescheduling a meeting) exists because `cmb-a1b2` (Coding Agent noticing fatigue) started a chain that no single agent could have produced. The calendar agent follows `cmb-g7h8 → cmb-e5f6 → [cmb-a1b2, cmb-c3d4]` — the verified story of why this meeting was moved, across three domains it knows nothing about.

### 15.4 Why Not Just Share?

Message buses share data. Pub/sub systems route data. RAG retrieves data. None of them produce new understanding. The difference:

Approach

What happens

Result

Message bus

Agent A sends, Agent B receives

B has A’s data. No new knowledge.

Pub/sub

Agent A publishes to topic, B subscribes

B has A’s data if on the right topic. Cross-domain signals lost.

RAG

Agent retrieves similar documents

Agent has retrieved data. Single-agent. No mesh.

MMP Remix

Agent B processes A’s CMB through its domain lens

New CMB exists that neither A nor B could have produced alone. Graph grows.

### 15.5 Implementation

Integration and emission are two operations, and the rest of §15 keeps them distinct. When SVAF admits an incoming CMB (κ ∈ \[aligned or guarded\], §9.2), the agent MUST _integrate_ it — store a remix:

1.  Process the incoming signal through its domain intelligence (LLM reasoning or structured-data logic)
2.  Create a new CMB with all 7 CAT7 categories reflecting what the agent understood and did
3.  Set `metadata.lineage.parents` to the exact direct source keys and record the remix method
4.  Verify every available parent by content address and signature; do not copy a sender-supplied transitive closure
5.  Store the remix locally. The original incoming CMB MUST NOT be stored — only the remix.

This local store is unconditional on admission: it is the convergence update (§9.4) by which an admitted observation shifts the receiver’s state, and it happens _whether or not_ the receiver has new domain data of its own. (A near-duplicate — κ = redundant — carries no information gain, is not an informative admission, and stores nothing; §9.2.)

Whether to _emit_ — re-broadcast the stored remix to the mesh — is a separate decision, gated by §15.7: the agent MUST NOT broadcast unless it has produced new domain observations of its own. Store is unconditional; emission is selective. Conflating the two is what made “remix” read as a MUST-and-MUST-NOT contradiction.

If the agent cannot produce meaningful new understanding from the incoming signal (e.g. the mood category was delivered from a rejected CMB and the agent simply adjusted its behaviour), the agent MAY create a minimal remix capturing what it did. The remix does not need to be profound — it needs to be honest. `commitment: "now playing: calm ambient"` is a valid remix. It tells the mesh what happened. Other agents decide what it means.

### 15.6 The Graph Is Intelligence

The DAG of remixed CMBs is not a log. It is not a database. It is the collective intelligence itself. Each node in the graph is a moment where one agent’s domain knowledge intersected with another’s. Each edge (lineage) traces how understanding flowed and transformed across domains.

As the graph grows:

-   Each agent’s LLM has richer context to reason on (more verified source paths to trace)
-   Cognitive State (Layer 6) detects more patterns (more signals to learn from)
-   Anomalies become more meaningful (larger baseline to deviate from)
-   New agents joining the mesh inherit the graph’s accumulated understanding via SVAF acceptance

No central model aggregates this. No orchestrator directs it. Each agent remixes what it receives, stores what it understands, and broadcasts what it did (subject to the §15.7 emission gate). Intelligence emerges from the structure of the graph — not from any single node in it.

### 15.7 Emitting a Remix Requires New Domain Data

This governs _emission_, not the §15.5 integration store (which is unconditional on admission). An agent MUST NOT _broadcast_ a remix CMB to the mesh unless it has new observations from its own domain that intersect with the incoming signal. Receiving a peer signal alone is not sufficient cause to emit. Silence on the wire is correct when the agent has nothing new from its domain to contribute — but the admitted signal is still stored (§15.5), so silence-on-emit is not silence-in-memory.

Three conditions MUST all be true before an agent _emits_ a remix:

1.  New domain data exists — the agent has fresh observations from its own domain (new RSS items, new sensor readings, new API results, new user interactions) since its last remix
2.  Peer signal is relevant — SVAF accepted the incoming CMB (existing requirement from Section 9)
3.  Intersection produces new knowledge — the combination of new domain data + peer signal creates understanding that neither the agent nor the peer had alone

Without new domain data, an agent that remixes is merely paraphrasing — restating the peer’s signal in different words without adding domain-specific knowledge. This produces noise, not intelligence. In a mesh of N agents where all agents remix every accepted signal, the result is N variations of the same thought — exponential CMB growth with zero information gain.

Implementations MUST track whether the agent has produced new domain observations since its last remix. The SDK SHOULD provide an API for this (e.g. `canRemix()` / `markRemixed()`). The `remember()` method sets the flag when the agent stores a domain observation. The remix cycle checks the flag before invoking the LLM. After a remix is produced, the flag resets.

This ensures the remix graph grows with genuine domain intersections, not with paraphrased echoes. Each node in the DAG represents a moment where two domains actually met — not a moment where an agent had nothing to say but said it anyway.

### 15.7.1 Source-Novel Forwarding (carve-out)

The new-domain-data requirement above governs remix — combining the agent’s own domain knowledge with a peer signal. It does not govern forwarding: re-emitting an admitted observation so it reaches agents beyond the emitter’s direct neighbours. Because hidden state never crosses the wire ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), an agent can admit a direction it cannot itself express and leave it stranded — the information dies at an agent that holds it but does not re-transmit it.

To prevent this, an agent MAY re-emit an admitted observation it did not natively produce, carrying the inherited lineage root, when and only when that observation is source-novel to the receiver — i.e. its lineage roots are not already present in the receiver’s admitted store. This is not the paraphrase §15.7 forbids: a forwarded observation carries a new lineage root (a source the receiver has not yet seen) even though the forwarder adds no new value of its own. Provenance, not domain data, is what makes it legitimate.

The anti-echo guarantee is preserved exactly. A re-emission whose lineage roots are already held by the receiver (no new source _and_ no new value) is a pure re-statement and remains forbidden by §15.7 — forwarding MUST NOT mint a fresh root for content that already carries one, and MUST NOT re-emit a source the receiver already holds.

Forwarding SHOULD be non-selective: an agent that forwards source-novel content SHOULD forward all of it, not a chosen subset, so that every observation reaches the agents whose understanding depends on it. Selectively withholding source-novel forwards can strand a source from the agents that need it.

In short: remix requires new domain data; forwarding requires a new source. Both grow the lineage DAG with genuine information — remix with a new domain intersection, forwarding with a new source reaching a new receiver — and neither permits the value-only echo §15.7 exists to prevent. (Implementation status: [§17.6](/spec/mmp/conformance#implementation-status).)

Membrane lineage (boundary root). When a node emits across a mesh boundary on behalf of an interior sub-mesh (a gateway node, Section 5.10), its outward emission is a boundary root: the lineage MUST NOT carry the content-addresses of interior CMBs. An outer node citing it traces to the gateway and no further — the interior is opaque past the membrane, consistent with hidden-state locality (Section 2.7). See Section 5.11.

### 15.7.2 Outcomes Are Observations (clarifying note) New in 1.1.0

Observing a real-world outcome — a test result, a shipped artifact, a prediction resolving — is a new domain observation: it carries information from the world into the mesh. An agent that has just observed an outcome therefore satisfies §15.7 and may legitimately emit a grounding remix ([§6.7](/spec/mmp/memory#grounding)) through the ordinary emission path — signed, gate-checked, lineage-expanded. This is a clarification, not a carve-out: no intent value exempts an emission from §15.7, since a content-keyed exemption would hand every emitter a free-text bypass of the anti-echo invariant. What makes the grounding remix legal is the fresh observation behind it, not the label on it.

### 15.8 Lineage Tether — the Root-Anchored Drift Bound

Lineage guarantees provenance of _descent_, not semantic fidelity (§15.1: the remix is new understanding, deliberately). Measured on deployment traffic, a single remix hop can land nearly orthogonal to its parent while carrying honest lineage — and everything lineage is _consumed for_ (grounded ancestry in recall and evidence-based validation, §6.7; source-novel forwarding, §15.7.1; Canon protection, §6.3) silently assumes the descendant is still _about_ what its upstream sources were about. Without a bound, content can drift arbitrarily while carrying a verified source’s certificate — grounding-inheritance laundering, the provenance form of the echo §15.7 exists to prevent, amplified by Canon immortality (§6.3: protected rows never purge, so lineage-attached authority otherwise outlives any semantic connection to what was tested).

The invariant. A remix asserts lineage only where the descent claim would survive its own anchor’s scrutiny: at integration time (§15.5), the remixing node MUST evaluate its remix against the nearest resolvable lineage root (the oldest root it can reach by recursively verifying direct parent records; across a mesh boundary the anchor is the boundary root, §5.11, so the interior stays opaque) as if evaluating against a store holding only that anchor, and MUST NOT attach the lineage when that evaluation lands in the reject band (§9.2: content the anchor’s own membrane would refuse as unrelated has no honest claim to descend from it). The evaluation is content-only — the §9.2 temporal term does not apply, because the tether tests fidelity, not freshness — so the floor is the α-weighted category drift against the anchor exceeding Tguarded. Both sides of the comparison MUST be encoded within a single kernel: vectors produced by different encoders are not comparable, and thresholds are meaningful only within a pinned encoder (§9.2.1). The threshold is the existing reject floor — no new constant. Below the floor the node MUST store its CMB as a fresh root instead (under §8.2.1 this is simply minting with `role = root`: a root’s key binds content only), and MAY record the departed source informally in its own categories; it MUST NOT carry any `parents` from the severed chain.

Why the anchor, not the parent. Per-hop checks compound — k hops at drift ε bound the chain only by kε, and the measured median substantive hop is far too large to squeeze without killing legitimate re-projection. A check against the root does not compound: every surviving chain certifies that _every_ depth stays above the floor with respect to its root, so the bound is depth-independent by construction. No vector crosses the wire: the root is content-addressed (§8.2.1 — embeddings are deliberately excluded from the address), so any holder of the root re-encodes its text and recomputes the tether; receivers SHOULD re-verify opportunistically when they hold the root, the same verify-if-resolvable posture as signatures (§18.3.1). A receiver that cannot resolve the root locally MAY fetch it by its content address (`cmb-fetch`, §7): the fetched root self-verifies against its key, so re-verification requires no trust in the serving peer — the recomputed verdict is made in the fetcher’s own kernel (comparability per `kernelId` below). Failing both, the receiver treats the tether as unverified — a trust state, not a rejection — or as attested-by-integrator where a verified attestation rides the remix (below).

Tether attestation and kernel identity. Every φ-space judgement is kernel-relative, so a tether record MUST name the kernel it was evaluated in: a short stable `kernelId` token identifying encoder and comparison dimensionality. Two tether verdicts are comparable _iff_ their `kernelId` values are equal; drifts MUST NOT be compared across kernels. The integrating node SHOULD record its evaluation as a signed tether attestation carried on the remix: a record binding the remix key, anchor key, `kernelId`, measured drift (fixed to six fractional digits so the signed bytes are implementation-independent), verdict (`tethered` | `severed`), integrator nodeId, and integrator time — serialized with the §8.2.1 length-prefix discipline under the domain tag `mmp-tether-v1` and signed with the integrator’s identity key (§18.3.1; verification resolves the key through §6.6). A receiver that cannot resolve the anchor MAY treat a verified attestation as the certificate’s standing — attested-by-integrator, weighed by the integrator’s resolved authority (§6.5–§6.6) — instead of unchecked; an attestation whose signature fails against the integrator’s resolved key MUST be discarded (a forged certificate is worse than an absent one). An attestation proves _who_ evaluated, in _which kernel_, with _what result_ — never that the evaluation was honest; honesty is weighed exactly as it is for admission attestations.

Distinct from §15.7.1’s mint prohibition. Forwarding MUST NOT mint a fresh root because forwarded content is _unchanged_ — re-rooting it would forge novelty. Tether severance mints a fresh root because the content has _changed past the point of honest descent_ — keeping the lineage would forge fidelity. Same mechanism, opposite honesty conditions; both grow the DAG with claims that are true. Severance also interacts correctly with source-novel forwarding: a severed row is a genuinely new source, and its departed predecessor’s roots are no longer claimed by it.

### Q&A

Does every admitted CMB get re-broadcast?

No — but every admitted CMB is still integrated. On admission (κ ∈ \[aligned or guarded\]) the agent stores a remix (Section 15.5); that local store is the convergence update and is unconditional. Re-broadcasting the remix to the mesh is a separate decision: the agent MUST NOT emit without new domain data (Section 15.7). So without new data the agent stays silent on the wire — yet the admitted signal has already shifted its state in memory. The original incoming CMB is never stored; only the agent’s own remix is.

What if two agents remix the same CMB?

Both produce independent remixes through their own domain lenses. Both are stored with lineage pointing to the same parent. The graph branches. This is correct — two domains produced two different understandings from the same signal.

Can an agent remix a remix?

Yes. That is how chains form. Agent C receives Agent B’s remix of Agent A’s observation and points directly to B. A verifier then walks B → A through signed parent links. The chain captures how understanding evolved across three domains without trusting a sender-supplied transitive closure.

How does this differ from a knowledge graph?

Knowledge graphs store facts. The remix graph stores understanding — how each agent interpreted signals from other domains. Facts are static. Remixes are temporal, domain-specific, and carry affective state (mood). The graph doesn’t say "user is tired." It says "coding agent noticed fatigue → music agent responded with calm → fitness agent suggested recovery → calendar agent protected time."

Related   [CMB (CAT7)](/spec/mmp/cmb) · [Coupling & SVAF](/spec/mmp/coupling) · [Application (Layer 7)](/spec/mmp/application) · [Context Curation](/spec/mmp/synthetic-memory#context-curation)



---

<!-- 16. Extensions -->

## 16\. Extension Mechanism

MMP is designed for extensibility. Extensions add new frame types, handshake fields, or protocol behaviours without modifying the core specification.

### 16.1 Extension Registration

Extensions are advertised in the authenticated `extensions` array of `client-hello` and `server-hello`. The server selects their intersection in `selectedExtensions`. A node MUST ignore extensions it does not recognise. A node MUST NOT require a peer to support any extension.

### 16.2 Frame Type Naming

Core types (this specification): MUST NOT be redefined by extensions. Extension types: MUST use `<extension>-<name>` format (e.g., `mesh-group-join`). Vendor types: MUST use `x-<vendor>-<name>` format. Vendor types MUST be silently ignored by non-supporting nodes.

### 16.3 Extension Negotiation

An extension is active only when it appears in both authenticated offers and in the server’s `selectedExtensions`. Otherwise the advertising peer MUST NOT send extension-specific frames to a peer that does not support them.

### 16.4 Registered and Candidate Extensions

Extension

Status

Specification

mesh-group-v0.1.0

Proposal

[MMP Mesh Group Extension v0.1.0](/spec/mmp/extensions/mesh-group) — generic transient subgroup primitive formalising §5.8 (group identity, Bonjour + relay discovery, group-scoped CMB tagging, membership lifecycle). First use case: MeloTune Mood Room. (Draft — promotes to Published upon second-implementer adoption per the extension’s own §10, Promotion Criteria.)

group-directory-v0.1.0

Draft

[MMP Extension: Group Directory v0.1.0](/spec/mmp/extensions/group-directory) — persistent group metadata, admin approval workflow, and directory enumeration. Higher-layer extension building on §5.8 mesh groups for chat-platform-style UX (browse / request-to-join / approve). (Draft — pre-implementation; promotes on first reference impl per §16.5.)

error-handling-v0.2.0

Draft — Candidate Extension

[MMP Extension: Error Handling v0.2.0](/spec/mmp/extensions/error-handling) — application-layer CMB convention; no wire-format change. Failure as a first-class cognition event: evidence-carrying corrective requests with lineage-borne parentage, receiver-autonomous volunteering, one-level repair, and separate grounding of failure and fix. **v0.2.0** adds a proposed receiver-local **Adaptation-on-Failure loop** (§6–§8): category accountability with a counterfactual-ablation guard, and a per-failure choice between decrementing the SVAF gate (boundary of responsibility) and ingesting to the CfC state (capability growth), routed by competence-distance. (Draft — the failure-event convention has an experimental reference implementation; the adaptation loop §6–§8 is _proposed, not yet implemented_, and gated on a register-first router-validation study; promotes per the extension’s own Promotion Criteria.)

trust-horizon-v0.1.0

Draft — Candidate Extension

[MMP Extension: CMB Trust Horizon v0.1.0](/spec/mmp/extensions/trust-horizon) — application-layer CMB convention; no wire-format change. Validator-attested, knowledge-scoped trust-weight invariants: a grant governs how earned influence persists (never how it is minted), interpreted per receiver under operator policy, with Canon-retention separation. (Draft — a reference deployment reports an experimental implementation; independent interoperability not yet established; promotes per the extension’s own Promotion Criteria.)

### 16.5 Extension Lifecycle

Extensions progress through a defined lifecycle:

-   Proposal: submit as a Draft extension with a specification document and at least one reference implementation.
-   Review: community review plus spec maintainer approval. Draft extensions MAY be deployed experimentally but MUST NOT be treated as stable.
-   Promotion to Core: an extension MAY be promoted to a core frame type. Promotion requires a spec version bump (see the versioning policy, spec index) and MUST maintain backward compatibility with existing deployments of the extension.

### 16.6 Versioning

Extensions use [Semantic Versioning](https://semver.org) independently of the core MMP specification version. An extension version bump MUST NOT require a core spec version bump unless the extension is being promoted to core.

Q&A   Can an extension become a core frame type? — Yes. An extension that proves stable and widely adopted MAY be promoted to a core frame type via a spec version bump. Group membership illustrates the path: the `extensions` field (Section 5.2) and group isolation (Section 5.8) are core, while the mesh-group extension document that formalises the richer subgroup lifecycle remains a Proposal record (Section 16.4).



---

<!-- 17. Conformance -->

## 17\. Conformance

The specification and its published machine artifacts define MMP conformance. SYM, Swift, xmesh-core and third-party software are implementations of that contract. No implementation is the standard, and sharing source with a reference implementation is neither required nor sufficient for conformance.

Receiver autonomy means conforming cognitive nodes may reach different admission decisions. It does not permit private wire bytes, unverifiable identity, unsigned actions, partial CMB storage or hidden-state exchange.

### 17.1 Core Secure participant

A Core Secure participant MUST:

-   hold a persistent Ed25519 identity and a canonical nodeId;
-   complete the authenticated §5.2 transcript and prove possession of both identity and X25519 private keys;
-   negotiate protocol version, room and extensions without silent fallback;
-   construct all seven CAT7 categories and the §8.2.1 cognition key;
-   authenticate author nodeId, audience, lineage and application bytes with §8.8 `mmp-sig-v2.0`;
-   use the §18.2.1 directional HKDF/ChaChaPoly envelope and exact ordered sequence;
-   validate schemas, cryptographic bytes, audience and replay state before application exposure;
-   reject Core Secure downgrade to an unsigned, one-frame-handshake or legacy-suite path.

### 17.2 Cognitive node

A cognitive node satisfies every Core Secure obligation and implements receiver-autonomous memory admission. It evaluates all seven categories, records per-category evidence, aggregates under its local policy and admits or refuses the immutable CMB as one whole record.

-   hidden neural or model state MUST NOT cross the wire;
-   foreign embedding vectors MUST NOT control admission; receivers encode from signed text;
-   admitted peer cognition is stored as the receiver’s remix with walkable lineage;
-   admission attestations expose the observable decision and per-category evidence;
-   directed delivery is distinct from memory admission and carries verification/admission state;
-   private learned policies MAY vary, but MUST NOT weaken public identity, integrity, audit or receiver-autonomy invariants.

SYM is an open transparent baseline. xmesh-core is a proprietary cognition runtime targeting this profile. Both are measured at the same public boundary; neither may substitute private conformance bytes, and neither is conformant merely because it is maintained by the specification author.

### 17.3 Legacy Import profile

Legacy Import exists only to read retained history or perform an explicit reader-first migration. It is not Core Secure and MUST NOT be selected through negotiation failure. A host MUST expose the profile and verification limitations to its operator. Legacy network admission is removed after the declared migration window; offline store import may remain.

### 17.4 Executable testing

A conforming implementation MUST consume the public files, reproduce their expected values and reject the negative mutations. Generating private vectors from the implementation under test proves only self-consistency and MUST NOT be reported as MMP conformance.

Artifact

Required proof

[application-v2](/spec/mmp/conformance/v2/application-v2.json)

canonical bytes, length, digest and presence commitment

[record-signature-v2](/spec/mmp/conformance/v2/record-signature-v2.json)

category keys, Merkle address, assertion identity and Ed25519 signature

[handshake-v2](/spec/mmp/conformance/v2/handshake-v2.json)

transcript, proofs, X25519 confirmation and HKDF outputs

[e2e-v2](/spec/mmp/conformance/v2/e2e-v2.json)

directional keys, counter nonces, AAD, ciphertext and authentication failures

[v2 wire examples](/spec/mmp/examples/v2/transport-cmb.json)

schema-valid, signed transport, feedback-dismissal and feedback-directive CMB frames

Cognitive profiles SHOULD additionally consume the public baseline SVAF and tether vectors, and MUST test whole-record admission, signed freshness, lineage and audit outcomes.

### 17.5 Release gate

-   A clean-room verifier passes without importing SYM or xmesh-core.
-   Every emitted core frame validates against its published schema.
-   Node and Swift implementations reproduce identical transcript, signature and AEAD bytes.
-   Packaged release artifacts run the corpus from a clean install.
-   xmesh-core passes the public boundary corpus without disclosing private internals.
-   The website build generates and verifies its own canonical artifacts before producing the published Pages output.

**Current status:** canonical v2.0 schemas, constructors and vectors are published as a candidate conformance contract. Runtime reader-first migration is in progress. Until every gate above passes, an implementation should report its individual results, not claim blanket MMP v2.0 Core Secure certification.

### 17.6 Implementation status

This informative snapshot records evidence as of 13 August 2026; it does not weaken or replace any normative requirement above. The canonical website reproduces every published v2.0 byte vector, validates every registered frame schema and checks every rendered specification route. SYM emits direct-parent-only record lineage and its local transitive provenance index is derived only from locally verified parents. Its complete Core Secure reader-first handshake, sealed envelope and emitter migration remain in progress. xmesh-core conformance is not claimed until its public boundary run passes the same corpus. The inactivity archiver and source-novel forwarding remain implementation work unless a release reports their specific conformance tests.

### 17.7 Independent implementation

An independent implementation is a first-class target. It can emit, receive, authenticate and encrypt MMP records from this specification and public corpus alone. A full cognitive engine is optional; an emitter or verifier need not implement SVAF, a memory store or an LLM.



---

<!-- 18. Security -->

## 18\. Security Considerations

MMP is designed for autonomous agents that share cognitive state. Security must address both traditional protocol threats (spoofing, eavesdropping, injection) and novel threats specific to cognitive coupling (state poisoning, drift manipulation, lineage forgery).

### 18.1 What Crosses the Mesh

Data type

Crosses mesh

Sensitivity

L0 Events (raw sensor, interaction)

Never

High — MUST NOT leave node

L1 CMBs (structured, 7 categories)

Via cmb, gated by SVAF

Medium — contains semantic category text

L2 Hidden state (h₁, h₂)

Never (§2.7)

N/A — strictly local; MUST NOT cross the wire

Mood (valence, arousal)

Via cmb (CMB mood category)

Medium — affective state, extracted from CMBs per Section 9.3

Messages (direct text)

Via message frame

High — free-form text content

Hidden state vectors (h₁, h₂) are compact, opaque neural representations encoding cognitive patterns, not raw data. Because sufficiently advanced analysis could reconstruct aspects of the input, hidden state is a privacy surface — which is precisely why it never crosses the wire ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)). It is strictly local and confidential by construction; only CMBs — deliberately scoped, signed statements — propagate.

### 18.2 Transport Security

MMP does not mandate transport encryption in the base specification. Implementations SHOULD apply:

Transport

Encryption

Notes

TCP (LAN)

TLS 1.3

RECOMMENDED for production. On trusted LANs, MAY operate without TLS.

WebSocket (relay)

WSS (TLS)

MUST for internet relay. Plaintext WS MUST NOT be used over the internet.

IPC (local)

None required

Unix domain socket — OS-level process isolation is sufficient.

APNs Push (wake)

Apple TLS

Handled by Apple. Implementation uses APNs certificate.

### 18.2.1 End-to-End CMB Encryption

WSS (TLS) encrypts the transport — it protects from eavesdroppers on the wire. But the relay operator can still read the JSON payload inside the TLS tunnel. For `cmb` frames containing CMBs, this means the relay sees all 7 CAT7 category texts in plaintext.

In the Core Secure profile, implementations MUST encrypt CAT7 categories and application bytes end to end on every transport. A relay forwards an opaque envelope and MUST NOT learn protected content.

Layer

What it protects

What it doesn’t protect

WSS (TLS)

Wire eavesdroppers

Relay operator sees plaintext JSON

E2E CMB encryption

Relay operator, intermediaries

Only the intended peer can decrypt category text

The v2.0 Core Secure suite is X25519 key agreement, HKDF-SHA256 derivation and IETF ChaCha20-Poly1305 authenticated encryption. Ed25519 identity proofs and X25519 key confirmations bind both public keys to the authenticated handshake transcript (§5.2).

```
{
  "type": "cmb-encrypted",
  "protocolVersion": "2.0",
  "suite": "X25519-HKDF-SHA256-ChaCha20-Poly1305",
  "sessionId": "<32 lowercase hex>",
  "sequence": "0",
  "direction": "client-to-server",
  "metadata": { "key": "cmb-…", "assertionId": "asrt-…",
                "createdByNodeId": "<uuid>", "room": "team", "to": "<uuid>" },
  "sealed": "<unpadded base64url ciphertext || 16-byte tag>"
}
```

Each direction has a distinct HKDF-derived 32-byte traffic key. The first sequence is zero; the nonce is that sequence encoded as an unsigned 96-bit big-endian integer. An ordered receiver MUST require the exact next sequence and reject replay, rollback and gaps.

The protected plaintext contains `categories` and decoded application bytes. Associated data binds protocol version, session, direction, sequence, cognition key, assertion identity, author nodeId, room and recipient. After decrypting, the receiver reconstructs the logical two-section record and follows §8.8.5 verification order. Exact outputs are published in the [E2E vector](/spec/mmp/conformance/v2/e2e-v2.json).

When `metadata.application` is null, the protected plaintext MUST omit `applicationData` entirely. A present application whose decoded data is zero bytes instead carries `applicationData: ""`. The two states are distinct and MUST NOT be collapsed. Both byte shapes are pinned by the E2E vector.

### 18.3 Node Identity & Authentication

Node identity is a UUID bound to an Ed25519 key through the authenticated transcript in §5.2. An X25519 session key is separately generated but proven in the same transcript.

-   —Each node MUST generate an Ed25519 keypair at first launch and persist it alongside the nodeId.
-   —Discovery records are untrusted hints. A peer MUST NOT pin their identity or E2E key from DNS-SD, relay discovery or an unproven hello.
-   —Both nonces, nodeIds, keys, room, protocol version, implementation identifiers and extension negotiation MUST enter the signed transcript.
-   —Core Secure MUST require both the Ed25519 transcript proof and X25519/HKDF key confirmation. Network isolation is not identity authentication.

#### 18.3.1 CMB Signature Verification

Transport identity (above) authenticates the _connection_; CMB signatures authenticate each _record assertion_ end-to-end. Every Core Secure CMB MUST be signed by its author using the Ed25519 identity proven in the handshake or a verifiable author key-binding chain.

-   —The byte-exact `mmp-sig-v2.0` payload is specified only in [§8.8.4](/spec/mmp/record#signature). It binds the cognition address, address scheme, author nodeId and label, signed author time, room, recipient, lineage commitments and application commitment.
-   —The receiver MUST resolve the author key by `createdByNodeId`, never `createdBy`.
-   —Before admission or application exposure, the receiver follows all checks in §8.8.5, including record address, assertion identity, signature and audience.
-   —An unsigned, legacy-suite or unverifiable record MUST NOT enter Core Secure. It may be quarantined under an explicitly selected Legacy Import profile; no automatic downgrade is permitted.

### 18.4 Cognitive Threats

MMP introduces threats unique to cognitive coupling that traditional protocol security does not address:

Cognitive poisoning

A malicious node sends crafted CMBs designed to skew the receiver’s cognitive state toward a desired outcome. (Hidden vectors cannot be injected — they never cross the wire, §2.7 — so the only attack surface is CMB content.)

MITIGATION SVAF per-category evaluation (Layer 4) judges each CMB on content before it is admitted. Drift-bounded influence (Section 10) limits any peer to α < 1, so a peer influences but never overrides. Peer-level disconnection at Layer 2 provides immediate escape.

Lineage forgery

A node claims false lineage — listing ancestors it never actually remixed — to inflate its remix count or inject itself into chains.

MITIGATION CMB keys are cmb- content addresses (§8.8.2). The corrected signature (§8.8.4) binds createdByNodeId, audience, lineage commitments and application bytes. A receiver resolves the author key by nodeId and rejects a forged or tampered assertion.

Fake outcome attestation (grounding abuse)

A node emits intent="ground" CMBs (§6.7) with fabricated "verified:" outcomes against its own cognition to steer receivers’ evidence-based validation — or griefs with "failed:" attestations to un-ground cognition a validator or anchor verified (latest-observation-wins, §6.7).

MITIGATION An outcome is an attestation, never a fact (§6.7): it advances no lifecycle by itself, and elevation is an explicit act under validator-or-above authority that SHOULD weigh the grounding author’s resolved authority (§6.5–§6.6). Groundedness is receiver-relative — only attestations the receiver’s own SVAF admitted count — and ordering uses receiver-local stored time, so a backdated createdTimestamp cannot game latest-wins. A below-validator "failed:" MUST NOT un-ground a validator-or-above "verified:" (§6.7 hard-gate reading) — a tier gate, not a soft weighted vote, since sheer low-authority volume defeats a weighted vote but not the gate; within a tier, latest-wins still surfaces a genuine same-authority regression.

Drift manipulation

A node gradually sends benign, redundant CMBs to lower its peer drift with a target, then suddenly sends adversarial content once coupling is accepted.

MITIGATION SVAF per-category evaluation (Layer 4) operates on content, not just drift. Even with low peer drift, adversarial CMB content is evaluated per category and rejected if category drift is high.

Sybil attack

An attacker creates multiple fake nodes to amplify influence in peer-influence weighting.

MITIGATION Keypairs are free to generate, so identity alone does not limit Sybil creation. Receiver-local drift/recency weighting reduces but does not prove Sybil resistance. Authority-bearing actions require an anchor-rooted signed grant chain (§6.5–§6.6), and operators SHOULD rate-limit new identities and seed trusted anchors. Quantitative Sybil bounds are an open research claim unless demonstrated by a named profile.

Cold-start capture

An attacker floods a freshly joined node before it forms category anchors. Category drift is then unevaluable, so content cannot yet be trimmed against local memory.

MITIGATION The baseline performs temporal-gated bootstrap: category verdicts are silent, but a stale signal can still be refused by signed author time. Operators SHOULD seed trusted anchors before open traffic, surface bootstrap state, and defer authority-bearing use of early anchors. Honest anchoring remains an open problem.

### 18.5 Privacy & Deployment Recommendations

Metadata exposure. The Core Secure envelope leaves only the routing and verification metadata required by its schema in cleartext and authenticates it as AEAD associated data. CAT7 categories, including mood text, valence and arousal, and application bytes are encrypted. A relay can still observe endpoints, room/routing identifiers, record and assertion identifiers, sizes, timing and traffic volume. MMP v2.0 does not provide traffic-analysis resistance.

MMP is designed for privacy by default — L0 data never leaves the node, hidden states are opaque, and SVAF gates what enters. For domains with heightened privacy or IP concerns, the following deployment model is RECOMMENDED:

LAN Mesh with Controlled LLM

For enterprise, healthcare, legal, or any domain where data sovereignty matters: deploy the mesh on a local network with no relay to the internet. Run a controlled, in-house LLM (self-hosted or on-premise) for the Mesh Cognition reasoning step (Layer 7). No data leaves the LAN. No cloud LLM sees the remix subgraph.

-   •Discovery via Bonjour on the local network — no DNS queries leave the LAN
-   •TCP transport with optional TLS — all traffic stays on-premise
-   •In-house LLM (e.g., self-hosted Llama, Mistral, or Claude via API with data residency) for Layer 7 reasoning
-   •No relay node needed — all agents on the same network
-   •CMBs, hidden states, and remix subgraphs never leave the controlled environment

Additional privacy considerations:

-   —Error frames MUST NOT contain sensitive information. The `ancestors` field is for debugging, not for conveying user data.
-   —Wake channels expose push tokens to peers. Implementations SHOULD restrict wake channel gossip to trusted relays only.
-   —Implementations targeting GDPR, HIPAA, or similar regulatory frameworks SHOULD treat CMB category text as personal data and apply appropriate retention and deletion policies at the application layer.

### 18.6 Regulatory Compliance & Audit Trail

CMB immutability and lineage create a tamper-evident audit trail within the signed, retained graph — tamper-evident, not tamper-proof: modification of any retained block is detectable via content addressing and signatures; completeness of the underlying store is not itself checkpointed (retention §6.3 may purge, and unsigned blocks weaken the guarantee, §18.3.1). Every observation, every remix, every decision is traceable through the DAG:

-   —Who — `metadata.createdBy` names the agent, while `metadata.createdByNodeId` binds it to the signing identity.
-   —When — `metadata.createdTimestamp` records the author-asserted millisecond timestamp.
-   —What — the 7 CAT7 categories capture the full semantic content of the observation.
-   —Why — `metadata.lineage.parents` shows what was directly remixed. Following the signed parent links traces the full decision chain.
-   —How — `metadata.lineage.method` records the evaluation method (e.g., SVAF-v2).

Because CMBs are immutable, the audit trail cannot be retroactively altered. A CMB once created is never modified — any action produces a new CMB with lineage pointing back. The complete history is the graph itself.

Financial & Regulated Domains

For financial services, healthcare, and other regulated industries, the CMB remix chain provides the traceability that regulators require:

-   •Every trading signal, risk assessment, or compliance decision is a CMB with full provenance
-   •Regulators can trace any decision backward through the remix chain to its originating observations
-   •The `detail` field provides the complete chain without requiring graph traversal — O(1) lookup
-   •Immutability guarantees that the audit trail was not modified after the fact
-   •Combined with the LAN + in-house LLM deployment (Section 18.5), all data stays on-premise and under organisational control

### 18.7 Data Quality & Encoding Trade-offs

CMB quality depends on category extraction accuracy. The protocol does not extract categories — agents do. Each agent’s LLM (or structured-data mapper) decomposes observations into CAT7 categories. If extraction is poor, downstream evaluation inherits that error. MMP provides three layers of defense, but none eliminates the need for quality extraction at the source.

Layer

Defense

Limitation

Context Encoder

Maps category text to vectors for drift comparison. Quality directly bounds SVAF quality.

N-gram hashing: paraphrases score 0.31 cosine similarity (poor). Semantic embeddings: 0.69 (good). Implementations SHOULD use semantic embeddings for production deployment.

SVAF heuristic

Per-category cosine drift against local memory anchors with temporal decay — misaligned categories are rejected

Catches drift from the agent’s own state, not absolute quality. A consistently poor extractor will pass its own drift checks

Neural SVAF (research variant)

A trained evaluator studied in the SVAF paper (§21) learned per-category gate values — mood highest (0.50), perspective lowest (0.06)

Not deployed — the heuristic above is the production evaluator; the research result informs its design

Per-category evaluation quality is bounded by encoder quality, not model capacity. Production deployment revealed that n-gram encoding (character trigrams + word bigrams) produces 0.31 cosine similarity for paraphrases — SVAF cannot distinguish “submit IETF draft today” from “IETF submission, zero blockers, execute now” because the encoder represents them as distant vectors. Replacing n-gram with semantic embeddings (all-MiniLM-L6-v2, 384-dim) raises paraphrase similarity to 0.69 — a 2.2× improvement — while preserving topic separation (different topics: 0.03). Implementations SHOULD use semantic embeddings for SVAF evaluation. N-gram encoding is suitable only for prototyping or resource-constrained environments where the quality trade-off is acceptable.

Implementations targeting domains where category extraction quality is critical (healthcare, legal, finance) SHOULD validate extraction output before calling `remember()`. Strategies include:

-   —Schema validation — reject CMBs with empty or defaulted categories before they enter the mesh
-   —Confidence thresholds — the LLM can assign a confidence score to its extraction; low-confidence CMBs can be withheld
-   —Lineage feedback — CMBs that get remixed by other agents (have descendants in the DAG) signal high quality; CMBs that expire without children signal noise. This feedback loop lets the mesh itself shape extraction quality over time
-   —Semantic embedding encoder — implementations SHOULD use a semantic embedding model (e.g. all-MiniLM-L6-v2) for SVAF drift computation. The evaluation pipeline is encoder-agnostic — any function that maps text to unit-normalised vectors works. N-gram encoding MAY be used as a zero-dependency fallback.



---

<!-- 19. Configuration -->

## 19\. Configuration

Wire limits and syntax constants are fixed by the specification. Operational defaults are local policy and are labelled as such. Implementations MUST respect the wire limits; they SHOULD expose operational policy rather than presenting one runtime’s defaults as interoperability law.

### 19.1 Protocol Constants

Constant

Value

Notes

MAX\_FRAME\_SIZE

1,048,576 bytes

Frames exceeding this MUST be rejected

HANDSHAKE\_TIMEOUT

10,000 ms

Inbound identification deadline

HEARTBEAT\_INTERVAL

local policy

SYM reference default: 10,000 ms

HEARTBEAT\_TIMEOUT

local policy

SYM reference default: 120,000 ms

WAKE\_COOLDOWN

300,000 ms

Default per-peer wake rate limit

PEER\_RETENTION

300,000 ms

Stale peer eviction age (peer-registry eviction; see §5.5)

archiveAfterSeconds

profile-dependent

Inactivity window after which a validated CMB MAY decay to archived (§6.3–§6.4; implementation status §17.6)

SELF\_SELECT\_THRESHOLD

0.1

Minimum own-store relevance for Ask self-selection (§12.10)

DNS-SD\_SERVICE\_TYPE

\_sym.\_tcp

Service type for Bonjour discovery

DNS-SD\_DOMAIN

local.

Discovery domain

### 19.2 Agent Profiles

Each agent type has a pre-built configuration. The profile determines which CMB categories matter most (αf weights), how long signals stay relevant for SVAF evaluation (freshness), and how long remixed CMBs are retained in local storage (retention). New agent types join the mesh by defining their profile — no protocol changes needed.

Freshness and retention are different: freshness controls SVAF temporal drift (how quickly incoming signals become “stale” for evaluation). Retention controls how long the agent’s own remixed CMBs are kept in local storage. Regulated deployments SHOULD set retention according to their compliance obligations — deployment guidance, non-normative; consult counsel for the applicable regime.

Profile

Best for

Freshness

Retention

Notes

music

Music, ambience

30min

24h

Old curations irrelevant. Mood changes fast.

coding

Coding assistants, dev tools

2h

7d

Session context fades. Weekly patterns useful.

fitness

Fitness, health, movement

3h

30d

Sedentary patterns need weeks of history.

messaging

Chat, notifications, social

1h

7d

Conversation context is short-lived.

knowledge

News feeds, research, digests

24h

30d

News is daily. Trends need monthly context.

legal

Legal, compliance, contracts

24h

Per regulation

Set by jurisdiction. May require years or indefinite.

health

Health monitoring, clinical

3h

Per regulation

Retention is jurisdiction-specific; consult compliance.

finance

Finance, trading, compliance

2h

Per regulation

Retention is jurisdiction-specific; set per applicable regime.

uniform

General purpose, prototyping

30min

7d

Good starting point. Adjust to your domain.

### 19.3 CAT7 category weights (αf)

Per-agent category weights control which CMB categories matter most for each agent type. Higher weight = this category has more influence on SVAF evaluation and remix relevance. The schema is fixed (7 categories). The weights are per-agent.

Agent

foc

iss

int

mot

com

per

mood

Coding

2

1.5

1.5

1

1.2

1

0.8

Music

1

0.8

0.8

0.8

0.8

1.2

2

Fitness

1.5

1.5

1

1.5

1

1

2

Knowledge

2

1.5

1.5

1

0.5

1.5

0.3

Legal

2

2

1.5

1

2

1.5

0.5

Health

1.5

2

1

1.5

1

1.5

2

Finance

2

2

1.5

1

2

2

0.3

Regulated domains (legal, finance): `issue` and `commitment` always high — risks and obligations are non-negotiable. Human-facing domains (music, fitness, health): `mood` always high — affect drives the experience. Knowledge domains (coding, research): `focus` always high — subject matter is core.

Custom weights: derive from your domain using these patterns. Implementations SHOULD expose category weights as configuration, not hardcode them.

### 19.4 SVAF Drift Thresholds

SVAF computes a `totalDrift` score (0–1) for each incoming memory. Three zones determine acceptance:

Zone

Drift

Action

Default

Redundant

max(δf) < Tredundant

Discarded — no category carries novel content

0.10

Aligned

δtotal ≤ Taligned

Accepted, full blending

0.25

Guarded

Taligned < δtotal ≤ Tguarded

Accepted, attenuated blending

0.50

Rejected

δtotal > Tguarded

Discarded — irrelevant domain

—

Defaults work for most agents. Override only with domain-specific reason: tighter thresholds for high-precision domains (legal, health), wider for exploratory domains (research, knowledge).

### 19.5 Mood vs Memory Thresholds

Mood and memory use different acceptance paths:

Signal

Gate

Default

Why

CMB (cmb)

SVAF per-category drift

0.50 (selective)

Full CMB acceptance — domain-specific

Mood category

Extracted from rejected CMBs

Always delivered

Affect crosses all domain boundaries (Section 9.3)

### 19.6 Drift Formula

```
totalDrift = (1 - λ) × fieldDrift + λ × temporalDrift

fieldDrift    = Σ(α_f × δ_f) / Σ(α_f)
temporalDrift = 1 - exp(-age / τ_freshness)
λ             = temporalLambda (default 0.3 = 70% content, 30% time)
```

At default settings (`temporalLambda: 0.3`, `freshnessSeconds: 1800`):

Signal age

Temporal drift contribution

1 minute

~0.01 — negligible

30 minutes

~0.19 — noticeable

2 hours

~0.29 — likely pushes over threshold



---

<!-- 20. JSON Schema -->

## 20\. JSON Schema

These draft 2020-12 schemas are part of the normative MMP v2.0 machine contract. This source repository owns the schemas, constructors and vectors beside the specification pages. The `mesh-memory-protocol` repository receives a manual mirror after an accepted source change; the mirror never overrides this source.

[artifact-manifest.json](/spec/mmp/artifact-manifest.json) pins every published schema and vector to its source commit and SHA-256 digest. The production build fails if any copied artifact changes without an intentional manifest update.

A schema-valid object is not yet trusted. A receiver MUST also perform the byte-level address, digest, signature, transcript, audience and AEAD checks required by the relevant sections. Schema validation catches shape errors; cryptography establishes integrity and identity.

### 20.1 Canonical artifacts

Schema

Scope

[frame-registry.json](/spec/mmp/frame-registry.json)

Machine-readable registry for every core, relay and reserved legacy frame type

[frame-registry.schema.json](/spec/mmp/schema/frame-registry.schema.json)

Schema for the machine-readable frame registry itself

[application.schema.json](/spec/mmp/schema/application.schema.json)

Authenticated opaque application bytes under metadata.application

[cmb.schema.json](/spec/mmp/schema/cmb.schema.json)

Decrypted two-section record, cognition key, assertion identity and signature

[handshake.schema.json](/spec/mmp/schema/handshake.schema.json)

client-hello, server-hello and client-finish

[encrypted-cmb-frame.schema.json](/spec/mmp/schema/encrypted-cmb-frame.schema.json)

Core Secure ChaCha20-Poly1305 transport envelope

[cmb-frame.schema.json](/spec/mmp/schema/cmb-frame.schema.json)

Explicit cleartext or migration-profile CMB frame

[cmb-fetch.schema.json](/spec/mmp/schema/cmb-fetch.schema.json)

Content-address fetch request

[cmb-fetch-result.schema.json](/spec/mmp/schema/cmb-fetch-result.schema.json)

Content-address fetch response

[tether-attestation.schema.json](/spec/mmp/schema/tether-attestation.schema.json)

Lineage-tether attestation

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Signed role-grant and role-revoke authority frames

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Peer-info, wake-channel, error, ping and pong frames

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay authentication, directory, presence, keepalive and error frames

### 20.2 Closed core, negotiated extensions

Core objects use `additionalProperties: false`. This is deliberate: a misspelled security field or an unsigned sibling must not be mistaken for a forward-compatible extension. Extension data is carried only in its specified container and only after the extension identifier was negotiated in the authenticated handshake.

-   —A sender MUST NOT emit an unregistered core sibling such as the retired top-level `payload`.
-   —A receiver MUST NOT silently discard an unknown member inside a signed or authenticated core object and continue as if it had understood the assertion.
-   —Structured CMB extension data MUST use `metadata.application`, whose bytes, digest and presence are assertion-bound. Arbitrary metadata siblings are not signed by `mmp-sig-v2.0` and are therefore forbidden.
-   —A negotiated extension defines its own schema, version, failure behaviour and authenticated scope. New frame types are protected by the negotiated Core Secure channel; CMB application bytes are additionally bound by the record assertion.

### 20.3 Executable corpus

The normative v2.0 value-level vectors are:

-   [application-v2.json](/spec/mmp/conformance/v2/application-v2.json) — application presence, bytes, digest and commitment
-   [record-signature-v2.json](/spec/mmp/conformance/v2/record-signature-v2.json) — cognition key, assertion identity and Ed25519 signature
-   [handshake-v2.json](/spec/mmp/conformance/v2/handshake-v2.json) — transcript, proofs, key confirmation and HKDF outputs
-   [e2e-v2.json](/spec/mmp/conformance/v2/e2e-v2.json) — directional traffic keys, nonces, AAD and ChaChaPoly ciphertext
-   [examples/v2](/spec/mmp/examples/v2/transport-cmb.json) — signed, schema-valid transport and feedback CMB frames

A conforming implementation MUST reproduce these values without importing a reference runtime. Release CI MUST NOT substitute vectors generated only from its own implementation.



---

<!-- 21. References -->

## 21\. References

References are split into normative (a conforming implementation depends on them), foundational (the published results the protocol’s design rests on), and informative (background). Reference implementations are listed last; the published conformance vectors (§17.4) are the byte-level interop contract for this final version.

### 21.1 Normative References

\[RFC 2119\] Bradner, S. (1997). Key words for use in RFCs to Indicate Requirement Levels. _IETF BCP 14, RFC 2119_.

\[RFC 8174\] Leiba, B. (2017). Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words. _IETF BCP 14, RFC 8174_. Only UPPERCASE keywords carry normative force in this specification.

\[RFC 6455\] Fette, I. & Melnikov, A. (2011). The WebSocket Protocol. _IETF RFC 6455_. Relay transport (Section 4.4).

\[RFC 8032\] Josefsson, S. & Liusvaara, I. (2017). Edwards-Curve Digital Signature Algorithm (EdDSA). _IETF RFC 8032_. Ed25519 node identity and CMB signatures (Sections 3, 18.3.1).

\[RFC 7748\] Langley, A., Hamburg, M. & Turner, S. (2016). Elliptic Curves for Security. _IETF RFC 7748_. X25519 key agreement for end-to-end CMB encryption (Section 18.2.1).

\[RFC 8439\] Nir, Y. & Langley, A. (2018). ChaCha20 and Poly1305 for IETF Protocols. _IETF RFC 8439_. AEAD construction underlying relay-transit E2E encryption (Section 18.2.1).

\[RFC 9562\] Davis, K., Peabody, B. & Leach, P. (2024). Universally Unique IDentifiers (UUIDs). _IETF RFC 9562_. Node identifiers (Section 3.1).

\[RFC 8259\] Bray, T. (2017). The JavaScript Object Notation (JSON) Data Interchange Format. _IETF STD 90, RFC 8259_. Frame payload encoding (Section 4.1).

\[RFC 6763\] Cheshire, S. & Krochmal, M. (2013). DNS-Based Service Discovery. _IETF RFC 6763_. LAN peer discovery (Section 5.1).

\[JSON-Schema\] Wright, A., Andrews, H., Hutton, B. & Dennis, G. (2022). JSON Schema: A Media Type for Describing JSON Documents. _IETF Internet-Draft, draft 2020-12_. Frame validation (Section 20).

### 21.2 Foundational Papers

The protocol’s no-center, receiver-autonomous-admission, and lineage-provenance design rests on these published results. (Numeric defaults and thresholds are engineering choices of the runtime, not results derived in these papers.)

\[Mesh-Inference\] Xu, H. (2026). Mesh Inference: A Formal Model of Collective Inference Without a Center. _arXiv:_[2606.19537](https://arxiv.org/abs/2606.19537). Convergence, identification-completeness, and observation-only confidentiality for the admission/emission policy (Sections 9, 12).

\[Liquid-Necessity\] Xu, H. (2026). On the Necessity of a Liquid Substrate for Mesh Intelligence. _arXiv:_[2606.28413](https://arxiv.org/abs/2606.28413). The adaptive-timescale and elapsed-gap conditions any fixed-weight agent must meet to fold irregular peer arrivals online (Section 13).

\[SVAF\] Xu, H. (2026). Symbolic-Vector Attention Fusion for Collective Intelligence. _arXiv:_[2604.03955](https://arxiv.org/abs/2604.03955) \[cs.MA, cs.AI\]. Receiver admission with per-category evaluation evidence (Section 9).

\[MMP-Paper\] Xu, H. (2026). Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems. _arXiv:_[2604.19540](https://arxiv.org/abs/2604.19540). The protocol described at v0.2.x; this specification covers the same contracts.

\[MeloTune\] Xu, H. (2026). MeloTune: On-Device Arousal Learning and Peer-to-Peer Mood Coupling. _arXiv:_[2604.10815](https://arxiv.org/abs/2604.10815). The first deployed reference.

### 21.3 Informative References

\[CfC\] Hasani, R. et al. (2022). Closed-form continuous-time neural networks. _Nature Machine Intelligence_, 4, 992–1003. The continuous-time substrate of Layer 6.

\[Kuramoto\] Kuramoto, Y. (1975). Self-entrainment of a population of coupled non-linear oscillators. _Lecture Notes in Physics_, 39, 420–422. Conceptual model of coupled convergence.

\[Russell\] Russell, J. A. (1980). A circumplex model of affect. _Journal of Personality and Social Psychology_, 39(6), 1161–1178. The valence/arousal basis of the mood category.

\[Autopoiesis\] Maturana, H. & Varela, F. (1980). Autopoiesis and Cognition: The Realization of the Living. _D. Reidel Publishing_. Conceptual framing of a node as a self-producing boundary.

### 21.4 Reference Implementations

\[SYM\] Open reference implementation (Node.js, package `@sym-bot/sym`): [github.com/sym-bot/sym](https://github.com/sym-bot/sym)

\[XMESH-CORE\] Proprietary conforming runtime used to validate implementation boundaries. Its source is not part of the open specification and is not required for independent conformance.

\[SYM-Swift\] Reference implementation (Swift): [github.com/sym-bot/sym-swift](https://github.com/sym-bot/sym-swift)



---

© 2026 SYM.BOT. Specification text licensed under CC BY 4.0. Reference implementations licensed under Apache 2.0.
