# Mesh Memory Protocol (MMP) v1.1.0

> A Mesh Protocol for Collective Intelligence
>
> **Version:** 1.1.0  ·  **Published:** 27 March 2026  ·  **Last updated:** 7 July 2026  ·  **Editor:** Hongwei Xu  ·  **License:** CC BY 4.0
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
11. [9. Coupling & SVAF (L4)](#9-coupling-svaf-l4)
12. [10. State Blending](#10-state-blending)
13. [11. Feedback Modulation](#11-feedback-modulation)
14. [12. Synthetic Memory (L5)](#12-synthetic-memory-l5)
15. [13. Cognitive State (L6)](#13-cognitive-state-l6)
16. [14. Application (L7)](#14-application-l7)
17. [15. Remix](#15-remix)
18. [16. Extensions](#16-extensions)
19. [17. Conformance](#17-conformance)
20. [18. Security](#18-security)
21. [19. Configuration](#19-configuration)
22. [20. JSON Schema](#20-json-schema)
23. [21. References](#21-references)

---



---

<!-- Overview -->

Protocol Specification

# Mesh Memory Protocol (MMP)

A Mesh Protocol for Collective Intelligence

Version

1.1.0

Status

Published

Published

27 March 2026

Last updated

7 July 2026

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

Existing protocols at lower layers standardize tool access and task delegation between agents. What each receiver does with incoming observations from a peer — per-field admission, signal-level lineage, filtering at acceptance time — is the missing layer. The Mesh Memory Protocol specifies that layer through five composable primitives: **CAT7**, a fixed seven-field schema for every Cognitive Memory Block; **[SVAF](/spec/mmp/coupling)**, per-field admission against the receiver’s role-indexed anchors; **content-hash lineage**, so every claim is traceable to its source observation; **remix**, where receivers store only their own evaluated understanding of accepted blocks, never raw peer signals; and **[grounding](/spec/mmp/memory#grounding)**, real-world outcomes carried by lineage — so the mesh records not only what its members _believe_ but what _held up in practice_, and the cognition that survives both judgment and reality persists as the Canon.

The problem is semantic, not transport. **Hidden state never crosses the wire** — each agent’s learned cognition stays sovereign on its own device; only Cognitive Memory Blocks (CMBs) propagate. Receiver-autonomous admission lets the mesh grow without re-introducing a master — same reason TCP/IP beat circuit-switching. MMP defines transport over TCP on local networks and WebSocket for internet relay, with length-prefixed JSON as the canonical wire format. Discovery uses DNS-SD (Bonjour) with zero configuration. The protocol is specified across 8 layers — from identity and transport (Layers 0–3), through cognitive coupling via SVAF (Layer 4), to synthetic memory and per-agent neural networks (Layers 5–7). Together, the upper layers form [Mesh Cognition](/spec/mmp/architecture): a closed loop where agents reason on the growing remix graph of immutable Cognitive Memory Blocks.

This specification is **verified, not merely asserted**: its normative claims are re-derived against a mathematical formalization of the deployed Mesh Edge mechanism, and where analysis finds a requirement unsatisfiable or a guarantee conditional — the basis of the redundancy invariants, the evaluation-time admission window, the cold-start bootstrap trade — the text is amended and the limit disclosed in place rather than left implicit (see the [change log](/spec/mmp/changelog)’s soundness & completeness update). What the protocol promises is what survives derivation.

## Status of This Document

This is a published specification (current version 1.1.0). It reflects the protocol as implemented in the [SYM Node.js](https://github.com/sym-bot/sym) and [SYM Swift](https://github.com/sym-bot/sym-swift) full-stack reference implementations, plus the [mesh-cognition](https://github.com/sym-bot/mesh-cognition) Python coupling kernel (Layers 4 + 6). The specification is versioned: wire-incompatible changes increment the **major** version; backward-compatible _normative_ additions (new testable requirements that keep wire compatibility) increment the **minor** version; errata, clarifications, and informative additions increment the **patch** version.

Sections added by the 1.1.0 work layer — §6.3 (Canon tier), §6.7 (Grounding), §8.3.1 (well-known intent values), §14.12 (session capture), and §15.7.2 (outcomes are observations) — are marked **New in 1.1.0** in place. 1.1.0 is fully wire-compatible with 1.0.x: no new frames or fields; a 1.0.x node interoperates unchanged and remains 1.0.x-conformant (see §17.5 for the requirements 1.1.0 adds).

Feedback and errata: [spec@meshcognition.org](mailto:spec@meshcognition.org) or [github.com/sym-bot/sym/issues](https://github.com/sym-bot/sym/issues).

## Implementations

Language

Project

Maintainer

Scope

Node.js / TypeScript

[sym-bot/sym](https://github.com/sym-bot/sym)

SYM.BOT

Reference implementation. Full protocol surface (Layers 0–7).

Swift

[sym-bot/sym-swift](https://github.com/sym-bot/sym-swift)

SYM.BOT

Reference implementation. macOS / iOS. Full protocol surface.

Python

[sym-bot/mesh-cognition](https://github.com/sym-bot/mesh-cognition)

SYM.BOT

Coupling kernel only. Layer 4 (per-field admission) and Layer 6 (Cognitive State) for CfC neural networks. Pure Python, zero external dependencies. [pypi](https://pypi.org/project/mesh-cognition).

## Change Log

**Latest — 1.1.0 “The Work Layer” (2026-07-05, updated 2026-07-07):** grounding cognition in reality — §6.7 outcomes carried by lineage, the §6.3 Canon tier, §14.12 work sessions as mesh members, plus the folded-in full-corpus coherence errata. The 2026-07-07 update folds in the **soundness & completeness amendments from the formalization of the Mesh Edge mechanism**: §9.2.1 redundancy invariants pinned to the nearest-anchor basis, the §9.2 evaluation-time-dependence disclosure, the cold-start-capture threat row, §6.7 repeat verification and the load-bearing failure channel, and the §15.8 lineage tether. Wire-compatible with 1.0.x.

[Full change log — every release since 0.1 →](/spec/mmp/changelog)

## Licence

This specification is published under the [Creative Commons Attribution 4.0 International Licence](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0). You may share, adapt, and build upon this specification for any purpose, including commercial use, provided you give appropriate credit.

The reference implementations are published under the [Apache Licence 2.0](https://www.apache.org/licenses/LICENSE-2.0).

SYM and SYM.BOT are trademarks of SYM.BOT. The Mesh Memory Protocol is published under CC-BY-4.0; the term "Mesh Cognition" is intentionally unmarked — the open-protocol category is free vocabulary.

© 2026 SYM.BOT. Specification text licenced under CC BY 4.0. Reference implementations licenced under Apache 2.0.



---

<!-- Change Log -->

## Change Log

Complete version history of this specification. The versioning policy is stated in [Status of This Document](/spec/mmp#status): major = wire-incompatible, minor = backward-compatible normative additions, patch = errata and informative additions. Current version: 1.1.0.

Version

Date

Changes

1.1.0

2026-07-05  
upd. 2026-07-07

**Soundness & completeness update (2026-07-07), from the formalization of the Mesh Edge mechanism.** The mesh-cognition formalization re-derived this specification’s claims and the amendments are folded into 1.1.0 in place: §9.2.1 pins the **redundancy invariants to the nearest-anchor basis** (δfnear = 1 − maxa cos — the fused attention readout provably cannot satisfy them: a block identical to a stored anchor can score δ = 0.127 once other anchors pull the readout); §9.2 discloses that **admission is evaluation-time-dependent** with the derived flip window (aggregated field drift in (0.286, 0.714) at defaults admits fresh, rejects late); §9.2.1’s cold-start bootstrap-admit now discloses its **security consequence** (new §18.4 cold-start-capture threat row); §6.7 adds **repeat verification** (a recognised grounding is never refused _solely_ for redundancy — the redundancy band provably self-quenches the outcome stream otherwise), the **failure channel is load-bearing** clause (positive-only grounding provably locks onto stale favourites; observed failures must not be selectively suppressed), and an informative note on consuming the outcome stream (decay-half-life theory); §15.8 specifies the **lineage tether** — the root-anchored drift bound that closes grounding-inheritance laundering; §18.3.1 disclosed the **enforcement scope** of strict signature mode. Wire-compatible throughout: no new frames, no new fields.  
  
**The Work Layer — grounding cognition in reality.** Through 1.0.x, the mesh could observe, admit, remix, and validate — it could establish what its members _believe_. 1.1.0 adds the missing half: a way to record what _held up in practice_, and to make the cognition that survives both judgment and reality the durable substrate real work builds on. Everything below is normative as of this release; new sections are marked “New in 1.1.0” in place.  
  
[**§6.7 Grounding**](/spec/mmp/memory#grounding) — outcomes carried by lineage. A grounding CMB (`intent: "ground"`, commitment `verified:` / `failed:`, parents = the cognition it grounds) records a real-world result — tests passed, work shipped, a prediction resolved — as the evidence-based sibling of §6.4’s judgment-based validation. An outcome is an **attestation, never a fact**: its weight follows the author’s earned authority (§6.5–§6.6), groundedness is **receiver-relative** (only attestations a node’s own SVAF admitted count), conflicting observations resolve **latest-wins on receiver-local time** (a regression un-grounds; a backdated timestamp cannot game the ordering), and a grounding CMB **never advances lifecycle by itself** — elevation to the Canon is an explicit, accountable act under validator-or-above authority.  
  
**§6.3 The Canon tier** — committed cognition persists. `validated` and `canonical` CMBs are exempt from age-based retention while they hold that lifecycle, so a mesh’s earned knowledge compounds across sessions instead of evaporating with the retention window. Protection is from purge, not from demotion — inactive validated cognition may still decay to archived (§6.4, §19) — and the store stays bounded.  
  
[**§14.12 Work Sessions as Mesh Members**](/spec/mmp/application#session-capture) — the capture profile that closes the loop: a work session joins as an ordinary member; its charter is the intent root, its decisions chain by lineage, and completion emits an artifact grounded by the session’s _real_ outcome. Day two of a mesh starts ahead of day one because day one’s work is in the Canon. §14.11 remains reserved for Commissions (planned for 1.2.0).  
  
**Supporting sections:** §8.3.1 well-known intent values (informative, extensible registry — `charter`, `decision`, `artifact`, `ground`; unknown intents remain ordinary content and confer nothing); §15.7.2 outcomes are observations (observing a real outcome IS new domain data, so grounding remixes satisfy §15.7 with no intent-keyed exemption — the anti-echo invariant is untouched); §18.4 gains the fake-outcome-attestation threat model (fabricated `verified:` steering, low-authority `failed:` griefing) with its mitigation chain; §17.5 lists the draft conformance requirements.  
  
**Incorporates the 2026-07-05 coherence errata** — a full-corpus adversarial review (41 findings) folded into this release: §10 state blending re-grounded in CMB-admission influence, completing the 1.0.2 supersession (the deprecated hidden-vector blend’s coefficients now bound per-admission influence; §13.4’s formula corrected to match); §11.4 feedback authority resolved through the signed grant chain rather than self-declared handshake roles; group isolation re-derived as endpoint-enforced via §18.3.1 audience binding (the relay is a dumb pipe); the §7.1 frame-type registry completed (mood, relay frames); handshake schema reconciled (§20.1 `group` optional, `lifecycleRole` sender-MUST); §17 conformance refreshed with testable requirements; plus editorial corrections across citations, examples, and terminology.  
  
**Compatibility:** fully wire-compatible — no new frames, no new fields; a 1.0.x node interoperates unchanged and treats grounding CMBs as ordinary CMBs. **Reference-implementation status:** two §6.7-adjacent mechanisms are specified ahead of the reference implementation (the §15.7.1 convention): the §6.4 inactivity archiver, and elevation-authority resolution through the §6.6 grant chain — the shipping implementation performs elevation as an explicit operator act pending earned-authority activation. Both are tracked to land in the next runtime release.

1.0.6

2026-07-04

[§5.9–5.11 Gateway Federation (informative pattern)](/spec/mmp/connection#multi-group-membership) — introduces an **informative** pattern for composing meshes: a node is a **membrane over an arbitrary interior** (atom = one agent; gateway = a node whose interior is a sub-mesh, presenting a boundary to exterior gateways). A gateway participates in its interior group and exchanges a **lossy CAT7 projection** with configured peers over a dumb boundary transport (HTTP), each keeping its own store — no center. Invariants that hold: no-center-per-level, partition-tolerance, §3.2 one-agent-one-node. The reference implementation is a **prototype** (observe-and-summarize; admit-then-reproject, signed/attested projections, and cross-mesh echo-dedup are unbuilt), and a **production security bar** — signed cmb1- projection, origin-authenticated origin, anti-replay, boundary-scoped credential — is a prerequisite, not a shipped guarantee. This is a topology pattern, not a normative cross-mesh wire; single-mesh conformance is unchanged.

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

Layer 6 renamed “xMesh” → “Cognitive State” to disambiguate from the xMesh runtime (naming note §1, §13; wire identifiers incl. xmesh-insight unchanged; published papers retain the legacy “xMesh (L6)” label). Normative additions, backward-compatible with the v1.0 contracts: §9.2.1 specifies δf as an admission _interface_ — anchors-only baseline (incoming block excluded), cold-start non-evaluable-field exclusion + bootstrap-admit — ruling out self-referential collapse and cold-start starvation. §9.2.2 specifies the directed (peer-bound) vs autonomous (group-bound) delivery contract, separating delivery from memory admission: directed CMBs (§4.4.4 `to` = receiver) surface unconditionally; rejected broadcasts do not surface (mood excepted, §9.3). §18.3.1 specifies CMB signature verification (Ed25519 author signature + content-address integrity; forged/tampered blocks rejected) as the end-to-end authenticity layer above transport identity.

1.0

2026-04-27

Public-stable-API release. Marks the v0.2.x development cadence as complete and the protocol surface as production-stable. Contracts unchanged from 0.2.3; v0.2.x → v1.0 is a maturity declaration, not a breaking change. Note: [arXiv:2604.19540](https://arxiv.org/abs/2604.19540) cites v0.2.x as the version implemented at paper-publication time; v1.0 covers the same contracts.

0.1–0.2.3

2026-03-27 → 2026-04-27

The development cadence. 0.1 (27 March 2026) was the initial public draft — the 8-layer architecture, the CAT7 seven-field schema, SVAF per-field admission, content-hash lineage and remix, and DNS-SD discovery. The 0.2.x series stabilised the wire contracts (handshake, frame registry, TCP + WebSocket relay transports) in production use; contracts were frozen at 0.2.3 and declared stable, unchanged, as 1.0. [arXiv:2604.19540](https://arxiv.org/abs/2604.19540) documents the protocol as implemented in this era.

0.2.3

2026-04-17

Section 13.9 — Compact Channel Best Practices: CMB envelope header convention (RECOMMENDED) for structured message headers with signal keywords and focus tags. Lazy-load channel pattern (RECOMMENDED) for MCP server implementations: compact header push with on-demand full-content retrieval via sym\_fetch, reducing mesh-traffic context consumption by ~75%. Token-count hint RECOMMENDED. Rolling message store with RECOMMENDED default of 200 messages. Signal-keyword priority table (informational): HALT > DIRECTIVE > RESULT > ACK.

0.2.2

2026-04-06

Section 11 — Feedback Modulation: how collective intelligence becomes self-correcting. Validator-authority CMBs with per-field reasoning modulate SVAF coupling weights and CfC temporal adaptation through the existing mesh cognition loop. Neuroscience-grounded: dopaminergic prediction error model with per-field direction and τ-modulated adaptation rate. Directive feedback for standalone domain knowledge injection. Validator-origin anchor weight 2.0 with role-grant verification. CfC state persistence across restarts. ABNF wire format grammar. CMB forward compatibility. Multi-relay failover. All cognitive content MUST use cmb frames.

0.2.1

2026-04-02

Node model: every autonomous agent MUST be a full peer node with own identity, coupling engine, and memory store. SVAF band-pass evaluation: four-class model (redundant/aligned/guarded/rejected) with per-field redundancy detection. CMB lifecycle: observed/remixed/validated/canonical/archived with anchor weight progression. Node lifecycle roles (participant/validator/anchor) with identity-bound validation authority and earned role progression. Validation authority for CMB lifecycle transitions bound to cryptographic node identity, not content. Semantic encoder SHOULD for SVAF drift computation. Handshake adds version, extensions, and lifecycleRole fields. Error frame type. Role-grant frame type.

0.2.0

2026-03-27

Formal specification published. 8-layer architecture. CAT7 CMB schema with lineage (parents + ancestors). SVAF per-field evaluation. Wire format normatively specified. Error frame. Frame type registry. Extension mechanism. JSON Schema. Connection state machine. Wire examples.

0.1.0

2025-08-01

Initial protocol design (Consenix Labs Ltd). 4-layer architecture. Scalar drift evaluation.



---

<!-- 1. Conventions -->

## 1\. Conventions and Terminology

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

Naming note

Layer 6 was called xMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State; xMesh now refers exclusively to the open runtime that implements MMP (all eight layers). The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

Term

Definition

Node

A sovereign participant in the mesh: a unique cryptographic identity, its own admission function (SVAF), and its own memory store. Every agent that participates in coupling is a full peer node and runs its own LNN. A relay is pure routing infrastructure (Section 4.4) — it forwards frames and holds no identity, store, or cognitive state; it is not a node.

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

Cognitive Memory Block — a structured memory unit with 7 typed semantic fields (CAT7 schema). Emitted, it is a projection; admitted by a peer, it is that peer’s observation. See Section 8.

Projection

An emitted CMB seen from its author: a lossy, typed (CAT7) view of the agent’s private cognitive state — never the state itself. Each agent emits projections of its state on its own clock.

Observation

An admitted projection seen from its receiver: a peer’s projection that cleared SVAF (Section 9.2) and is integrated as a measurement of an evolving latent. The same CMB is a projection to its author and an observation to a receiver that admits it.

Drift

A scalar in \[0, 1\] measuring cognitive distance between an incoming signal and the receiver’s local state — computed per field (δ\_f) and aggregated to a total drift. It is a signal-to-local-state measure, not a node-to-node one. See Section 9.1.

Coupling

The receiver-autonomous process by which a node evaluates incoming signals (SVAF per-field evaluation, Section 9) and lets admitted signals influence its own evolving cognitive state through its own model. A node never imports or averages a peer’s hidden state (Section 2.7); coupling influences, it never overrides.

SVAF

Symbolic-Vector Attention Fusion — per-field content-level evaluation of incoming memory signals. See Section 9.

Synthetic Memory

Layer 5 — derived knowledge generated by the agent’s LLM reasoning on the remix subgraph, encoded into CfC-compatible hidden state vectors.

Remix

When an agent processes a CMB through its domain intelligence and produces a NEW CMB with lineage pointing to the original. The original is remixed, not copied.

Lineage

Each CMB carries parents (direct) and ancestors (full ancestor chain). Ancestors enable any agent in the remix chain to trace its contribution.

Canon

The retention tier for committed cognition: a CMB at validated or canonical lifecycle is exempt from age-based purge while it holds that lifecycle (Section 6.3).

Grounding

Evidence, where validation is judgment: a grounding CMB records that its author observed a real-world outcome (verified: or failed:) for the cognition its lineage points at (Section 6.7, draft).

Earned Authority

Lifecycle roles (participant → validator → anchor) conferred by signed, revocable role-grants rooted at a pinned anchor. A node’s role is resolved through the grant chain, never taken from its advertised handshake role (Sections 6.5–6.6).

Mesh Cognition

The agent’s LLM reasoning on the remix subgraph of CMBs — traced via lineage ancestors — to generate understanding that the agent’s previous state of mind didn’t have. Spans Layers 4–7. See Section 2.5.

Cognitive State

Layer 6 — each agent’s own Liquid Neural Network (LNN). Evolves continuous-time cognitive state from Synthetic Memory input. Fast τ neurons track mood; slow τ neurons preserve domain expertise. (Called xMesh in v0.2.x drafts and the published papers — see the §1 naming note.)

CfC

Closed-form Continuous-time neural network (Hasani et al., 2022). The LNN architecture used in the Cognitive State layer. Hidden state evolves through learned time-dependent interpolation gates.



---

<!-- 2. Architecture -->

## 2\. Architecture Overview

![MMP 8-layer architecture diagram. Mesh Cognition: L7 Application (domain agents), L6 Cognitive State (per-agent LNN continuous-time cognitive state), L5 Synthetic Memory (LLM-derived knowledge from remix subgraph → CfC), L4 Coupling (drift · SVAF per-field evaluation · admission). Protocol Infrastructure: L3 Memory (L0 events, L1 structured CMBs, L2 cognitive), L2 Connection (handshake, gossip, wake, admission), L1 Transport (IPC, TCP/Bonjour, WebSocket, APNs push), L0 Identity (nodeId, name, cryptographic keypair). The feedback loop — agent acts → new CMB → lineage.parents carries ancestor chain → graph grows — flows between the CMB remix graph and Layer 4 coupling.](/image/mmp-architecture-02.webp)

MMP is an 8-layer protocol stack. Each layer has a defined responsibility. Implementations MUST implement Layers 0–3 to participate in the mesh. Layers 4–7 (Mesh Cognition) are SHOULD for full cognitive participation and MAY be omitted for relay-only nodes.

### 2.1 Layer Stack

Mesh Cognition (Layers 4–7)

7 APPLICATION Domain Agents — Music, Code, Fitness, Robotics, Agent Systems

Where agents live and their LLMs reason on the remix subgraph. Mesh Cognition happens here.

6 Cognitive State Per-Agent LNN — Continuous-Time Cognitive State

Each agent runs its own Liquid Neural Network. Fast neurons track mood; slow neurons preserve domain expertise. Hidden state (h₁, h₂) is strictly local — it never crosses the wire (§2.7); only CMBs do.

5 SYNTHETIC MEMORY LLM-Derived Knowledge from Remix Subgraph → CfC

The bridge between reasoning (LLM) and dynamics (LNN). Encodes derived knowledge into CfC-compatible hidden state vectors.

4 COUPLING Drift · SVAF Per-Field Evaluation

The gate. SVAF evaluates each of 7 CMB fields independently. Nothing enters cognition without passing this layer.

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

No servers

There is no mesh without agents. Agents are the mesh. No central server, no orchestrator, no master node. Every participant is a peer.

Cognitive autonomy

Each agent evaluates, reasons, and acts independently. The mesh influences but never overrides. Coupling is a suggestion, not a command.

Memory is remixed, not shared

Agents don’t copy each other’s memory. They remix it — process it through their own domain intelligence and produce something new. The original is immutable. The remix is a new CMB with lineage.

Per-field evaluation

A signal is not accept-or-reject as a whole. SVAF evaluates each of 7 semantic fields independently. A signal with relevant mood but irrelevant focus is partially accepted — not ambiguously scored.

LLM reasons, LNN evolves

Two cognitive components per agent. The LLM (Layer 7) traces lineage ancestors and reasons on the remix subgraph — generating understanding. The LNN (Layer 6) evolves continuous-time state from that understanding. Neither alone is sufficient.

The graph is the intelligence

Intelligence is not in any single agent or model. It is in the growing DAG of remixed CMBs connected by lineage. Each cycle, the graph grows. Each agent understands more than it did before.

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

Per-field SVAF (7 dimensions)

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

Every participant is a node. There is no architectural distinction between a “server” and a “client.” Every agent that participates in coupling MUST be a full peer node with its own identity, its own coupling engine, and its own memory store. This is not an implementation convenience — it is a protocol requirement. An agent that shares another node’s identity cannot have its own field weights, its own coupling decisions, or its own remix lineage. Coupling is per-node. Therefore agents MUST be nodes.

```
MacBook
  mesh-daemon     (node: always-on mesh hub, relay bridge)
  coo-agent       (node: own identity, own coupling, own memory)
  research-agent  (node: own identity, own coupling, own memory)
  marketing-agent (node: own identity, own coupling, own memory)
  product-agent   (node: own identity, own coupling, own memory)

iPhone
  Music Agent     (node: own identity, own coupling, own memory)
  Fitness Agent   (node: own identity, own coupling, own memory)

Cloud
  relay           (node: forwards frames, no cognitive processing)
```

Nodes discover each other via DNS-SD (Bonjour) on the local network and connect via WebSocket relay for internet connectivity. Each node maintains its own peer list, coupling state, and CMB store. No node depends on another node’s process to function.

A node is more precisely a membrane over an arbitrary interior: its interior MAY be a single agent (an atom node) or a whole sub-mesh presented through a gateway node. The same emit / admit grammar holds at every scale, so meshes compose fractally — see the gateway node and boundary behavior (Section 5.10–5.11).

### 2.5 The Mesh Cognition Loop

Mesh Cognition is a closed loop connecting all layers. Each cycle, the remix graph grows and every agent understands more than it did before:

SVAF evaluates inbound CMB per field

Layer 4 — per-field drift, α\_f weights, accept / guard / reject

Accepted → remixed CMB with lineage

Layer 3 — new immutable CMB, parents + ancestors

LLM traces ancestors, reasons on remix subgraph

Layer 7 — what happened, why, what it means for my domain

Synthetic Memory encodes derived knowledge

Layer 5 — LLM output → CfC hidden state (h₁, h₂)

LNN evolves cognitive state

Layer 6 — fast τ (mood) synchronise, slow τ (domain) stay sovereign

LNN integrates admitted remixes

τ-modulated, inference-paced — own state evolves, no peer vectors imported (§2.7)

Agent acts → new CMB with lineage.ancestors

Response informed by derived knowledge, not just own observation

Broadcast to mesh → other agents remix it

Graph grows. Next cycle starts. Each agent learns.

↻ closed loop — graph grows, agents learn, mesh thinks

### 2.6 Key Architectural Decisions

Why no pub/sub topics?

The coupling engine evaluates relevance per field autonomously. Topics would second-guess autonomous coupling. Adding a new agent type requires no topic configuration — just α\_f weights.

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

Hidden state vs. remixed CMB. When SVAF (§9.2) admits a peer’s CMB, the receiver MUST NOT store the original; it creates a new CMB — the _remix_ (§15) — that captures what it understood, in CAT7 fields, with lineage back to the source. The remix is the agent’s understanding made explicit and communicable; hidden state is the private substrate that produced it. Hidden state is implicit, opaque, and agent-local; the remixed CMB is explicit, typed, citable, and shared in the common latent of language.

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

-   —Peer verification — the public key MUST be included in the handshake frame. Peers SHOULD challenge the node to sign a nonce to prove possession of the private key.
-   —Key exchange — Ed25519 keys are converted to X25519 for Diffie-Hellman shared secret derivation, used for end-to-end CMB encryption (Section 18.2.1).
-   —Message signing — implementations SHOULD sign every CMB with the Ed25519 identity key (Section 18.3.1, schema §20.2); a receiver holding the author’s key MUST verify the signature. Unsigned CMBs are accepted only from legacy 1.0.x emitters.

The public key MUST be encoded as base64url (RFC 4648 Section 5) in all wire formats (handshake frames, DNS-SD TXT records). The private key MUST NOT leave the node.

### 3.2 One Agent, One Node

Every autonomous agent MUST be a full peer node with its own nodeId, its own coupling engine, and its own memory store.

This follows directly from the protocol design: SVAF field weights (αf) are per-node, coupling state is per-node, and memory stores are per-node. An agent that shares another node’s identity inherits that node’s coupling decisions and cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent need different field weights, different coupling thresholds, and different memory stores. They MUST be separate nodes.

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

Only a node whose _resolved_ role (§6.6) is validator or above may advance another CMB’s lifecycle to `validated`; `canonical` is reserved to a resolved anchor. A receiver MUST resolve the author’s role through the anchor-rooted grant chain — never the `createdBy` field or the advertised handshake role — and MUST ignore, for lifecycle advancement, any validation CMB whose author does not resolve to the required role (the CMB is still stored as a normal remix). This applies equally to any authority-weighted treatment: a CMB’s admission weight (§6.4) derives from the author’s _resolved_ role, so a self-advertised role confers no elevation.

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

Coupling is per-node. SVAF field weights (αf) are per-node. Memory stores are per-node. An agent that shares another node’s identity inherits that node’s coupling decisions — it cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent on the same device need different field weights, different coupling thresholds, and different memory stores. They must be separate nodes.

What happens when two nodes have the same nodeId?

The connection state machine rejects duplicate nodeIds (error code 1005). The second connection is closed. This prevents impersonation and ensures each nodeId maps to exactly one active node.

Why is Ed25519 mandatory?

Without cryptographic identity, any node can claim any nodeId. A relay could impersonate peers (MITM), and peer gossip (Section 5.6) would propagate unverified claims. For autonomous AI agents making coupling decisions, authenticated identity is foundational — not optional.

Why are lifecycle roles identity-bound, not content-based?

If validation authority were determined by content (e.g. perspective field containing "founder"), any agent could spoof it. Binding roles to cryptographic identity means only nodes that have been explicitly promoted by existing validators can advance CMB lifecycle. The mesh knows who validated, not just what was said.

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

```
Length prefix: 00 00 00 78  (120 bytes — the minified payload below)
Payload (shown formatted for readability; transmitted as minified JSON; abbreviated — see §5.2/§20 for the full handshake):
{
  "type": "handshake",
  "nodeId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "name": "my-agent",
  "version": "1.1.0",
  "extensions": []
}
```

Ping frame:

```
Length prefix: 00 00 00 0f  (15 bytes)
Payload: {"type":"ping"}
```

CMB frame:

```
{
  "type": "cmb",
  "timestamp": 1711540800000,
  "cmb": {
    "key": "cmb-b2c3d4e5f6a7b8c9",
    "createdBy": "melomove",
    "createdAt": 1711540800000,
    "fields": {
      "focus":       { "text": "user coding for 3 hours, energy declining" },
      "issue":       { "text": "sedentary since morning, skipping lunch" },
      "intent":      { "text": "recommend movement break before fatigue worsens" },
      "motivation":  { "text": "3 agents reported declining energy in last hour" },
      "commitment":  { "text": "fitness monitoring active, 10min stretch queued" },
      "perspective": { "text": "fitness agent, afternoon session, home office" },
      "mood":        { "text": "concerned, low energy", "valence": -0.3, "arousal": -0.4 }
    },
    "lineage": {
      "parents": ["cmb-a1b2c3d4e5f6"],
      "ancestors": ["cmb-a1b2c3d4e5f6"],
      "method": "SVAF-v2"
    }
  }
}
```

This example shows the legacy unsigned form (`cmb-` key, no `sig`); §8.2.1 and §18.3.1 define the current `cmb1-`/signed form.

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

-   —`nodeId`, `name`: MUST be present. Missing fields result in close code 4002.
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

Implementations MUST support a persistent IPC socket at a well-known path. The socket MUST accept multiple simultaneous connections. Each IPC connection SHOULD remain open for the lifetime of the client application — short-lived connections (one query, then disconnect) are permitted but SHOULD be avoided by applications that query frequently.

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

Coupling is per-node. SVAF field weights (αf) are per-node. Memory stores are per-node. An agent that shares another node’s transport and identity cannot have independent coupling decisions. Multiple agents on the same device each run their own Bonjour advertisement, relay connection, and TCP listener. They discover each other the same way agents on different devices do — there is no special local path.

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

Upon connection, both sides MUST exchange the following frames in order:

```
1. handshake    { type: "handshake", nodeId: "<uuid>", name: "<name>",
                  publicKey: "<base64url>", version: "1.1.0", extensions: [],
                  lifecycleRole: "participant",               [sender MUST; absent → "participant"]
                  group: "<group-id>" }                       [optional, default "default"]
2. peer-info    { type: "peer-info", peers: [...] }           [if known]
3. wake-channel { type: "wake-channel", platform, token, env } [if configured]
```

Deprecated — `state-sync`. Earlier revisions exchanged a `state-sync` frame carrying the node’s hidden-state vectors (h₁, h₂) at this point in the handshake. Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state MUST NOT cross the wire. Implementations MUST NOT emit `state-sync` and SHOULD ignore it on receipt; peer influence is mediated entirely by CMBs evaluated through SVAF ([Section 9.2](/spec/mmp/coupling#svaf)).

-   —The `version` field MUST be the MMP specification version the node implements (e.g., `"1.1.0"`). Nodes SHOULD accept peers with the same major version. Nodes MAY reject peers with incompatible versions.
-   —The `extensions` field SHOULD list supported protocol extensions (e.g., `["mesh-group-v0.1"]`). Nodes MUST ignore unrecognised extensions.
-   —The `group` field is OPTIONAL and identifies the mesh group the node wishes to join (Section 5.8). A handshake without `group` MUST be treated as `group = "default"`. When two nodes handshake and discover that their declared groups differ, the receiver MUST close the connection.
-   —The inbound node MUST wait for a `handshake` frame as the first frame. If any other frame type arrives first, or no handshake arrives within 10,000 ms, the connection MUST be closed.
-   —If a node receives a handshake with a nodeId that is already connected via the same transport type, the new connection MUST be closed (duplicate guard). If the existing connection uses a different transport type (e.g. peer connected via relay, new connection via LAN TCP), the new connection MUST be accepted as a secondary transport per Section 4.6.

lifecycleRole. Senders MUST include a `lifecycleRole` field with value `participant` (default), `validator`, or `anchor`; a receiver MUST treat a handshake without it as `participant` (backward compatibility with older nodes). The declared role is a discovery hint only — authority to apply validator-origin anchor weight ([Section 6.4](/spec/mmp/memory)) or identify feedback CMBs ([Section 11](/spec/mmp/feedback)) is resolved through the signed role-grant chain (§6.5–§6.6), never from the handshake.

### 5.3 Connection State Machine

DISCONNECTED

initial state

TCP connect / accept

AWAITING\_HANDSHAKE

10s timeout

valid handshake received

CONNECTED

peer registered, frames routed

timeout / close

DISCONNECTED

peer removed, re-discover

From

To

Trigger

DISCONNECTED

AWAITING\_HANDSHAKE

TCP connect or accept

AWAITING\_HANDSHAKE

CONNECTED

Valid handshake within 10,000 ms

AWAITING\_HANDSHAKE

DISCONNECTED

Timeout, invalid frame, or duplicate nodeId

CONNECTED

DISCONNECTED

Heartbeat timeout, TCP close, or error

Implementations MUST NOT process cognitive frames (`cmb`, `xmesh-insight`) in the AWAITING\_HANDSHAKE state.

### 5.4 Heartbeat

Nodes MUST send a `ping` frame to each peer if no frame has been received from that peer within the heartbeat interval (default: 5,000 ms). Upon receiving `ping`, a node MUST respond with `pong`. If no frame is received from a peer within the heartbeat timeout (default: 15,000 ms), the connection MUST be closed.

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

A SYM node MAY declare membership in a mesh group at handshake time via the optional `group` field (Section 5.2). A mesh group is a named cohort of nodes that exchange application-layer frames only with each other. Mesh groups give an operator a way to host multiple mutually-isolated meshes on the same relay or LAN segment without per-agent application changes, and they give an application a way to constrain its peers to instances of itself rather than every node on the wire.

Group identifier syntax. A group identifier is a string of `[a-z0-9-_.]+`, max 64 characters, case-sensitive. The literal string `"default"` is reserved as the implicit group of every node that does not declare a group; this preserves backward compatibility with nodes that predate this section.

Protocol guarantee. A node in group `G_A` MUST NOT exchange any application-layer MMP frames (handshake fields beyond identity and version, `cmb`, `mood`, `peer-info`, `xmesh-insight`) with a node in group `G_B` when `G_A ≠ G_B`. Transport-layer connection establishment and ping/pong heartbeats are out of scope and MAY remain active across groups.

Layer placement. A mesh group is a Layer 2 (Connection) concept. The application layer SHOULD declare its group at SDK initialisation. The relay (Section 4.4) is a dumb pipe — `relay-auth` carries no group field and the relay MUST NOT inspect payloads (Section 4.4.4) — so it need not (and cannot) enforce group isolation. Isolation is enforced at the endpoints: the authoring group is bound into the signed CMB (§18.3.1 audience binding), and a receiver MUST reject a frame whose group does not match its own connection’s group, even if a relay misdelivers it. A relay MAY additionally scope rooms by a group-derived key as defense in depth. Nodes participating in LAN Bonjour discovery SHOULD enforce group isolation by checking the peer’s declared group at handshake and closing the connection on mismatch. The connection-level error frame for a group mismatch is described in Section 7.2.

Recommended naming convention (non-normative). The protocol does not parse group identifiers beyond the character set and length checks above. Operators of meshes with more than a handful of groups SHOULD adopt a hierarchical dotted-path convention `<app>[.<environment>][.<cohort>]`, e.g. `melotune.prod`, `melotune.dev`, `claude-code.default`, `research.lab`. The dots are convention only; tooling MAY use them for prefix-based grouping but the protocol does not require this.

SVAF and group filtering. SVAF (Layer 4, Section 9) per-field evaluation runs after group filtering: `cmb` frames from peers in different groups never reach the SVAF evaluator.

The full design rationale, the prefix-based group claims relay enhancement, and the operational migration record are documented in [MMP-MESH-GROUPS-DESIGN.md](https://github.com/sym-bot/symbot-website/blob/main/docs/MMP-MESH-GROUPS-DESIGN.md) on the symbot-website repository.

§5.9–5.11 — Informative

Sections 5.9–5.11 describe an informative design pattern for composing meshes — not a normative wire. The single-mesh protocol (§1–§5.8, §6–§20) is complete and unaffected without it. There is one reference implementation (a mesh-edge prototype) and it realizes only a subset of the pattern (see “Reference implementation” below); the core runtime is single-group. Adopt this as a topology pattern with a stated production-security bar, not as a shipped protocol feature.

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

Federation crosses organizational trust boundaries, so a production gateway boundary requires, at minimum: (1) the projection is a signed cmb1- CMB authored by the gateway (§18.3.1), with the `from` gateway origin-authenticated by that signature — never a self-declared, unsigned field; (2) anti-replay (the signed createdAt plus receiver-side dedup); and (3) a boundary credential scoped to the boundary — never a full control-plane token. A boundary that accepts unsigned projections, trusts a self-declared origin, or authenticates with an admin credential is not safe for cross-org use.

Reference implementation (prototype)

The mesh-edge reference gateway realizes a subset: it computes a lossy summary of its interior’s cognition and HTTP-POSTs it to configured peers, which ingest it opaquely. It does not yet admit inbound projections through SVAF, reproject them inward, sign or attest its projection, or echo-dedup; its projection is a summary object, not yet a schema-valid CAT7 CMB; and it does not yet meet the production security bar above. Treat it as a prototype of the pattern, not a complete or production implementation.

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

Keyword search across CMB field texts.

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

Shared audit trail. Consider privacy — CMB field text is personal data.

In-memory

Testing, ephemeral agents

No persistence. Useful for unit tests and short-lived agents.

### 6.3 Retention

Implementations MUST support configurable retention via `retentionSeconds`. CMBs older than the retention period SHOULD be purged automatically. See [Section 19 (Configuration)](/spec/mmp/constants) for per-profile retention defaults.

Purge MUST preserve graph integrity: a CMB referenced by any newer entry’s `lineage.ancestors` MUST NOT be deleted, even if past retention age. The remix chain is the audit trail — breaking it breaks provenance.

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

Anchor weight influences SVAF evaluation: when computing per-field drift against local anchors, canonical and validated CMBs contribute more to the fused anchor vector than observed or archived CMBs. This creates a natural hierarchy where human-confirmed knowledge and collective consensus outweigh raw observations — without overriding agent autonomy. Each agent still evaluates incoming signals through its own field weights.

### 6.5 Validation Authority

The transition from `remixed` to `validated` is the most consequential lifecycle event — it commits human or authorised-agent judgment to the mesh and permanently increases anchor weight from 1.5 to 2.0. This transition MUST be restricted to nodes with appropriate lifecycle roles (Section 3.5).

When a receiving node processes a validation CMB (one whose `lineage.parents` points to an existing CMB), it MUST resolve the _author’s_ role through the anchor-rooted grant chain (§6.6) — never the `createdBy` string, and never the peer’s advertised handshake role:

-   —If the author _resolves_ to validator or anchor, the parent CMB advances to `validated` (if action completed) or `dismissed` (if not actionable).
-   —Otherwise the parent CMB advances to `remixed` only. The CMB is stored normally but confers no validation.

This prevents agent-level spoofing of validation authority. An agent cannot self-promote to validator by including “founder” or “validator” in its CMB text fields. The authority is bound to the node’s cryptographic identity and the `role-grant` chain from an existing validator (Section 3.5.1).

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

Repeat verification and the redundancy band. A verification report about a row the receiver already holds typically scores high alignment against exactly that row, so under an unmodified §9.2 gate, the better established a row, the harder it becomes to ground or re-ground it — repeat verifications are progressively refused as redundant, and the accepted-grounding stream of any one row self-quenches (a packing bound: only finitely many reports can each clear the redundancy separation, ever, absent retention purges). Sustained outcome tracking is load-bearing for the mesh being a learner rather than an accumulator, so acceptance of a grounding is exempted from exactly one band: a receiver MUST NOT refuse a recognised grounding CMB (signed, verified, `intent = ground`, recognised outcome prefix, lineage naming a target the receiver holds) _solely_ because it is redundant against its target row or against previously admitted groundings of that target. The reject band (foreign content), the signature requirement, and the receiver’s trust weighing all stand unmodified. This is an _acceptance-side_ rule and does not weaken the §15.7 anti-echo emission gate (§15.7.2: what legitimises a grounding emission is the fresh outcome observation behind it); spam through the waiver is bounded by the content address itself — a byte-identical repeat confirmation carries the same `cmb1-` key and deduplicates, so only _distinct_ verification reports pass, and implementations MAY additionally rate-cap accepted groundings per (target, author) pair.

The failure channel is load-bearing. The signed outcome pair is not symmetric decoration: when recall preferentially re-uses highly-weighted rows, the `failed:` channel is the mechanism that makes preferential sampling self-correcting — a stale favourite’s absorbed grounding traffic drives its weight _down_ — while a positive-only mesh locks onto early favourites at chance-level precision. An agent that observes a failure outcome MUST NOT suppress it while continuing to emit success outcomes for the same class of work; selective success-only grounding defeats the self-correction the outcome channel exists to provide. (Informative: the self-correction additionally requires outcome reports to be better than chance — miscalibrated reporting that is wrong more often than right converts the same coupling into entrenchment.)

Consuming the outcome stream (informative). A consumer that scores rows by their accepted groundings faces a bias–variance choice with a known theory. Pure accumulation (all-time counts) is the efficient estimator only while the useful set is stationary; under drift its staleness bias makes its ranking degrade toward chance. A recency-decayed signed sum tracks drift with bounded risk; its half-life trades noise against lag, with the optimum scaling as `(V / (4μ²δ²))^(1/3)` in the drift rate δ — a fixed half-life therefore pays a longer dominance horizon (Θ(δ−1) instead of Θ(δ−2/3)), and the tuned horizon is recoverable online by estimating drift with a growing-window slope probe (a fixed pair of probe timescales degenerates back to the fixed-half-life exponent; the growing-window form recovers the tuned one even on sparse signed ±1 outcome streams). Decayed sums should be mass-normalised (one extra scalar) — the raw zero-initialised form carries an initialization transient that delays its advantage by a log factor. Zero-clamping per-node sums before cross-node aggregation discards the negative evidence the failure channel carries; consumers that clamp should know the self-correction analysis above assumes the signed form.

An outcome is an attestation, not a fact. The grounding CMB asserts that its _author_ observed the outcome. Its weight follows the author’s resolved authority (§6.5–§6.6) exactly as any other CMB’s does; the reserved intent value adds semantics, never authority.

Groundedness is receiver-relative. A CMB is _grounded_, in the view of a given node, iff a recognised grounding CMB targeting it (directly, or via the node’s admitted remix of one whose expanded ancestors reach it, §15.2) is present in that node’s own store. There is no global grounded state; a node MUST NOT treat cognition as grounded on the strength of a grounding entry it never admitted. Grounding runs upward only — a grounding CMB grounds the CMBs its lineage points at, never descendants of those CMBs: a remix of verified cognition is not itself verified.

Outcomes are observations of a changing world. When several recognised grounding CMBs target the same cognition in one store, the latest by stored time wins: a later `failed:` un-grounds what an earlier `verified:` established (a regression must surface, not be shadowed by history). “Stored time” is the receiver-local time the entry entered the evaluating store — never the author-asserted `createdAt`, which is unwitnessed (§6.6) and would let a backdated or future-dated attestation game the ordering. Authority modulates whether to _act_ on an attestation, not the temporal ordering of observations — but acting cuts both ways: a receiver _SHOULD_ weigh the author’s resolved authority before letting a `failed:` from a low-authority author un-ground cognition whose `verified:` came from a validator or anchor (see the §18.4 threat note on outcome griefing).

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

A human acting on a signal is the strongest confirmation that the signal was correct and actionable. Giving validated CMBs higher anchor weight means future SVAF evaluations are shaped by confirmed knowledge rather than speculation. This does not override agent autonomy — each agent still applies its own field weights. It means the anchors against which incoming signals are compared are more trustworthy.

Why must validation authority be identity-bound?

If any agent could advance a CMB to validated by producing a CMB with lineage, an agent could dismiss founder decisions or fake human approval. Binding validation to cryptographic node identity (Section 3.5) ensures only explicitly authorised nodes — the founder’s node or promoted agents — can affect lifecycle transitions. The content of the CMB (perspective, intent) is informational; the authority comes from who created it.

Can an agent earn validator role automatically?

The protocol defines the role-grant mechanism (Section 3.5.1) but does not prescribe automated promotion criteria. An implementation MAY define heuristics (e.g. promote after N remixes cited by peers), but the grant itself MUST come from an existing validator via a signed role-grant frame. This keeps the trust chain auditable.



---

<!-- 7. Frame Types -->

## 7\. Frame Types

All frames are JSON objects with a `type` field (string). Implementations MUST silently ignore frames with unrecognised type values to allow forward compatibility.

### 7.1 Frame Type Registry

Type

Layer

Gated

Fields

handshake

2

No

nodeId (uuid), name (string), version (string), publicKey (base64url Ed25519), e2ePublicKey (base64 X25519), group (string), lifecycleRole (participant|validator|anchor), extensions (string\[\]) — full schema §20.1

state-sync

deprecated

No

DEPRECATED (§2.7) — carried h1/h2; hidden state MUST NOT cross the wire. MUST NOT emit; ignore on receipt.

cmb

3/4

SVAF

timestamp (int), cmb (object: { key, createdBy, createdAt, fields, lineage, sig?, sigAlg?, group?, to? }) — full schema §20.2

role-grant

3

No

grantee (nodeId), role (validator|anchor), grantedBy (nodeId), grantedAt (int ms), granteeKey? (base64url), sig (base64url), sigAlg (ed25519). Confers a role; honored only when chain-resolved to the anchor (§6.6).

role-revoke

3

No

grantee (nodeId), grantedBy (nodeId), grantedAt (int ms), sig (base64url), sigAlg (ed25519). Withdraws a granted role; cascades on resolution (§6.6).

message

2

No

from, fromName, content, timestamp

mood

7

Drift

mood (string), context? (string) — application-layer mood broadcast; the receiver gates delivery on mood drift (§9.3 mood fast-coupling). Group-isolated per §5.8.

xmesh-insight

6

No

from, fromName, trajectory (float\[6\]), patterns (float\[8\]), anomaly (float), outcome (string), coherence (float), timestamp

peer-info

2

No

peers: \[{ nodeId, name, wakeChannel?, lastSeen }\]

wake-channel

2

No

platform (string), token (string), environment (string)

error

2

No

code (int), message (string), detail? (string)

ping

2

No

(no additional fields)

pong

2

No

(no additional fields)

relay-auth

1 (relay)

No

nodeId (uuid), name (string), token? (string), wakeChannel? ({ platform, token, environment }) — client authenticates to a relay (§4.4.1). Transport-scope: exchanged with a relay, not a peer.

relay-peers

1 (relay)

No

peers: \[{ nodeId, name, wakeChannel?, offline }\] — relay peer directory sent after authentication (§4.4.2). Transport-scope.

relay-ping / relay-pong

1 (relay)

No

(no additional fields) — relay keepalive; clients MUST answer relay-ping with relay-pong (§4.4.5). Transport-scope.

relay-reauth

1 (relay)

No

(no additional fields) — relay requests the client to re-send relay-auth (§4.4.6). Transport-scope.

relay-peer-joined

1 (relay)

No

nodeId (uuid), name (string) — presence broadcast on the relay channel (§4.4.3). Transport-scope.

relay-peer-left

1 (relay)

No

nodeId (uuid), name (string) — presence broadcast on the relay channel (§4.4.3). Transport-scope.

All cognitive content — observations, decisions, feedback, directives — MUST be sent as `cmb` frames. Only `cmb` frames enter SVAF evaluation, produce anchor weights, and modulate CfC state.

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

A Cognitive Memory Block (CMB) is an immutable structured memory unit. Each CMB decomposes an observation into 7 typed semantic fields (the CAT7 schema). CMBs are the data structure that flows between agents via `cmb` frames.

Forward compatibility. Implementations MUST silently ignore unrecognised CMB fields. A node that receives a CMB carrying additional fields from a future version MUST process the 7 known CAT7 fields and discard any others without error. This allows schema evolution without breaking existing deployments.

### 8.1 Why 7 Fields

The 7 fields form a minimal, near-orthogonal basis spanning three axes of human communication: what (focus, issue), why (intent, motivation, commitment), and who/when/how (perspective, mood). They are universal and immutable — domain-specific interpretation happens in the field text, not the field name. A coding agent’s `focus` is “debugging auth module”; a fitness agent’s `focus` is “30-minute HIIT workout.” Same field, different domain lens.

`mood` is the only fast-coupling field — affective state (valence + arousal) crosses all domain boundaries. The neural [SVAF](/spec/mmp/coupling) model independently discovered this: `mood` emerged as the highest gate value (0.50) without being told, confirming that affect is universally relevant across agent types. All other fields couple at medium or low rates, with per-agent αf weights controlling relative importance.

New agent types join the mesh by defining their αf field weights — no schema changes, no protocol changes. The 7 fields are fixed. The weights are per-agent.

### 8.2 Field Schema

Implementations MUST use the following 7 fields in this order:

Index

Field

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

Each field carries a symbolic text label (human-readable) and a unit-normalised vector embedding (machine-comparable). The `mood` field additionally carries numeric `valence` (-1 to 1) and `arousal` (-1 to 1) values.

A CMB MUST NOT be modified after creation. When an agent remixes a CMB, it MUST create a new CMB with a `lineage` field containing: `parents` (direct parent CMB keys), `ancestors` (full ancestor chain, computed as `union(parent.ancestors) + parent keys`), and `method` (fusion method used). Ancestors enable any agent in the remix chain to detect its CMB was remixed, even if it was offline during intermediate steps.

### 8.2.1 Content Address & Canonical Serialization

A CMB’s `key` is a content address: a SHA-256 hash over a fully specified canonical serialization of the block, prefixed to be self-describing about its scheme. Two independent conforming implementations MUST compute the identical key for the same logical CMB — the key is both the node identity in the lineage DAG and the value the author signature binds (§18.3.1), so any divergence breaks lineage, dedup, citation, and integrity. The published test vectors are the normative contract.

Legacy scheme (`cmb-`) — the previous format, retained for the migration: a conforming node MUST still _verify_ it. It is specified here byte-exactly (it was previously under-specified, which is how an implementation change went undetected against the spec):

```
key = "cmb-" + first 32 hex chars of SHA-256( UTF-8( focus.text + "|" + issue.text + "|"
              + intent.text + "|" + motivation.text + "|" + commitment.text + "|"
              + perspective.text + "|" + mood.text ) )

// Field order per §8.2; mood contributes its text only; empty fields contribute "";
// no Unicode normalization.
```

This scheme has three known weaknesses, which the successor resolves: the `|` join is not injection-proof (a delimiter inside a field can shift a boundary), text is not Unicode-normalised (NFC vs NFD diverge), and the 128-bit truncation gives only 64-bit collision resistance.

Normative scheme (`cmb1-`) — the format the reference implementation mints; a conforming node MUST verify it and SHOULD mint it:

```
key = "cmb1-" + hex( SHA-256( preimage ) )          // full 256 bits, 64 hex chars

preimage = "mmp-cmb-v1\n"                            // domain-separation tag
         + LP(NFC(focus.text)) + LP(NFC(issue.text)) + … + LP(NFC(mood.text))   // 7 CAT7 fields, fixed order
         + LP(role)                                  // "root" or "remix"
         + [ if remix:  LP(decimal(parentCount)) + LP(parentₖ) …  + LP(receiverNodeId) ]

LP(s)    = decimal(byteLength(UTF-8(s))) + ":" + UTF-8(s)   // netstring length-prefix
```

-   —Field text MUST be Unicode NFC\-normalised (UAX #15) before serialization. Field order is the CMB\_FIELDS order of §8.2. The `mood` field contributes its `text` only; `valence`/`arousal` and all vector embeddings are excluded from the address.
-   —Netstring length-prefixing makes the serialization injection-proof (a delimiter inside a field cannot shift a boundary) with no escaping and no JSON-canonicalization dependency, so implementations in different languages agree byte-for-byte.
-   —A root CMB binds content only — identical content by any author at any time yields one key (enabling dedup, not re-derivation of provenance, which lives in `lineage` and the signature). A remix additionally binds its parent set (sorted ascending by UTF-8 byte order of the key strings) and the receiver’s nodeId, keeping each agent’s remix a distinct DAG node.
-   —The full 256-bit width is normative: a truncated hash’s birthday bound would admit a grind-then-substitute attack against the signed key. The `cmb1-` prefix makes the scheme self-describing, so hash agility (a future `cmb2-`) is unambiguous.

Migration (mint vs verify). A conforming node MUST _verify_ keys of both schemes, dispatching on the prefix, so a peer still on the legacy `cmb-` scheme is accepted throughout the migration. It SHOULD _mint_ `cmb1-`; an implementation MAY provide a mode that mints the legacy scheme for a staged rollout or rollback. Illustrative keys elsewhere in this specification predate the scheme change and use the short `cmb-` form.

### 8.3 Field-by-Field Guide

The schema is fixed. The interpretation is sovereign. Each field below gives a definition, the rationale for why the field earns a slot in a 7-field minimal basis, and three cross-domain examples showing how agents from different domains populate the same field.

`focus` Subject

What the observation is centrally about.

Every observation has a subject. Without focus, a receiver cannot determine if the signal is even in its domain. Focus is the first filter — a fitness agent seeing focus="debugging auth module" knows immediately this is outside its domain.

Coding: “debugging OAuth token refresh logic”

Fitness: “30-minute HIIT workout completed”

Legal: “merger due diligence review”

`issue` Tension

Risks, gaps, problems, assumptions, open questions.

Issues cross domain boundaries more than most fields. A coding agent’s "user exhausted after 8 hours" is an issue that the fitness agent and music agent both care about. Issue is the tension that drives action — agents without tension have nothing to act on.

Coding: “memory leak causing crashes every 2 hours”

Fitness: “sedentary 3 hours, no movement detected”

Finance: “revenue recognition discrepancy found”

`intent` Goal

Desired change or purpose.

Intent captures what the agent or user is trying to achieve. It is domain-specific — a coding agent’s intent ("ship the feature") is irrelevant to a music agent. This is why SVAF learned the lowest gate value for intent (0.07) — goals don’t transfer across domains.

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

Perspective captures the lens through which the observation was made. "Developer, late night session" is different from "developer, morning standup" — same domain, different context. SVAF learned the lowest gate value for perspective (0.06) — viewpoint is the most sovereign field, rarely useful across domains.

Coding: “senior developer, deep work session, afternoon”

Fitness: “fitness agent, daily activity tracking”

Recruiting: “hiring manager, culture fit assessment”

`mood` Affect

Emotion (valence: -1 to 1) + energy (arousal: -1 to 1). Dual representation: numeric for comparison, text for semantic richness.

Mood is the only fast-coupling field — affective state crosses ALL domain boundaries. A fitness agent, music agent, and coding agent all benefit from knowing the user is exhausted (v: -0.6, a: -0.4). The SVAF model independently discovered this: mood gate = 0.50 (highest), without being told. Every agent should attend to mood regardless of domain.

Coding: “frustrated, low energy (v: -0.6, a: -0.4)”

Music: “calm, restorative (v: 0.3, a: -0.5)”

Fitness: “energized after workout (v: 0.7, a: 0.6)”

### 8.3.1 Well-Known Intent Values Informative · New in 1.1.0

`intent` is free text and stays free text — this registry reserves no syntax and adds no field. It records conventions that have emerged in practice, so independent implementations converge on the same vocabulary. The registry is informative and extensible: an unknown intent value MUST be treated as ordinary content, and behavior MUST NOT be keyed on unrecognised values. Per §6.5, content is informational — authority always comes from who created the CMB, never from what its intent says.

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

### 8.4 Per-Agent Field Weights (αf)

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

Agents produce two types of output: signals (CMBs — structured 7-field observations) and artifacts (documents, analyses, drafts, code — full-length content that a CMB references). A CMB is the signal on the mesh. An artifact is the substance behind it.

When an agent produces an artifact, it MUST share a CMB to the mesh that references the artifact location in the `commitment` field using the `artifact:` prefix:

commitment: "artifact: research/agent-memory-comparison.md"

The CMB’s other 6 fields summarise what the artifact contains — the `focus` captures the key finding, `issue` captures the gap identified, `intent` captures what should happen next. Other agents evaluate the CMB via SVAF as usual. If accepted, the agent MAY retrieve the full artifact for deeper reasoning.

Artifacts are stored in the producing agent’s local filesystem, not on the mesh. The mesh carries signals; agents carry substance. This separation keeps CMBs lightweight (7 fields, bounded size) while allowing agents to produce unbounded analysis, research, and creative work.

The `artifact:` convention in `commitment` is RECOMMENDED for any CMB that references a document, file, or external resource. Agents MUST NOT embed full artifact content in CMB fields — fields are for structured signals, not documents.

### 8.6 Origin

Cognitive Memory Blocks were first formalised in the Mesh Memory Protocol (Consenix Labs, August 2025) with the CAT7 enterprise schema. The wellness / productivity schema and the synthesis-affinity classification were developed at SYM.BOT in late 2025 for production deployment across personal AI agents.

### 8.7 Authentication

A CMB SHOULD carry its author’s signature in `cmb.sig` (base64url) with `cmb.sigAlg`. Receivers verify the signature and content-address integrity before admitting or surfacing a block. See [§18.3.1 CMB Signature Verification](/spec/mmp/security#cmb-signature) for the normative signing and verification requirements.

### Q&A

Why are all 7 fields required, not optional?

SVAF computes per-field drift across all 7 dimensions. Missing fields make the drift formula undefined — the aggregate changes depending on which fields are present. Fields the agent cannot meaningfully extract are set to "neutral" (a known, consistent baseline vector), never omitted. To reconcile the phrasings elsewhere: emitters normalize absent fields to "neutral"; the legacy key scheme (§8.2.1) hashed an absent field as the empty string ""; and SVAF treats a field as non-evaluable when it is absent or neutral (§9.2.1).

Why not let agents define their own fields?

SVAF needs a shared schema to compare incoming fields against local anchors. If each agent defined its own fields, cross-domain evaluation is impossible — a fitness agent and a music agent would have no common dimensions to compute drift on.

Why does mood carry valence and arousal but other fields don’t carry numeric values?

Mood has a well-established dimensional model (Russell’s circumplex). Other fields are inherently symbolic — "debugging auth module" has no meaningful numeric axis. Valence and arousal are RECOMMENDED, not required — agents without reliable circumplex data omit them.



---

<!-- 9. Coupling & SVAF (L4) -->

## 9\. Layer 4: Coupling and SVAF Evaluation

### 9.1 Peer-Level Coupling (Drift)

Peer drift measures how cognitively distant a peer is, so the mesh can weight that peer’s influence (Section 10). Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state MUST NOT cross the wire, so drift MUST NOT be computed from exchanged hidden vectors. A node MUST instead derive peer drift from the peer’s CMBs — the aggregate per-field admission drift (δf, Section 9.2.1) of the peer’s most recent admitted CMBs against the receiver’s local anchors A:

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

When a node receives a `cmb` frame, it MUST evaluate the signal independently of peer coupling state, through an admission path that satisfies the δf interface (Section 9.2.1). “Support” here means interoperate-with, not implement-only-this: every implementation MUST provide the concrete cosine-distance baseline (Section 9.2.1) as its interoperable floor — the path a node with no other method uses, and the one interop test vectors target — and its baseline path MUST reproduce those vectors. An implementation MAY additionally use a richer path (neural is RECOMMENDED); a richer path still satisfies the interface, but admission is then receiver-divergent by design (Section 2.7), not identical across nodes. (The mood field’s unconditional delivery is a Section 9.3 _delivery_ mechanism, separate from this _admission_ evaluation.) The encoder that maps field text to vectors SHOULD use semantic embeddings (e.g. sentence-transformers) rather than lexical hashing — per-field evaluation quality is bounded by encoder quality (Section 18.7), so thresholds are meaningful only within a pinned encoder.

The SVAF evaluation computes per-field drift between the incoming CMB and local anchor CMBs, applies per-agent field weights (αf), combines with temporal drift, and produces a four-class decision using a band-pass model:

```
totalDrift = (1 - λ) × fieldDrift + λ × temporalDrift

fieldDrift    = Σ(α_f × δ_f) / Σ(α_f)
temporalDrift = 1 - exp(-age / τ_freshness)

κ = redundant if max(δ_f_near) < T_redundant  (default 0.10)   // nearest-anchor basis, §9.2.1
κ = aligned   if totalDrift ≤ T_aligned    (default 0.25)
κ = guarded   if totalDrift ≤ T_guarded    (default 0.50)
κ = rejected  otherwise
```

Admission is evaluation-time-dependent by design. Because `totalDrift` blends content drift with `temporalDrift`, the same CMB can admit when evaluated fresh and reject when evaluated late: any block whose aggregated field drift D lies in `( (Tguarded − λ) / (1 − λ),  Tguarded / (1 − λ) )` — at the defaults (λ = 0.3, Tguarded = 0.5), D ∈ (0.286, 0.714) — crosses the guarded boundary as its age term saturates. Below that window a block admits at every age; above it, it rejects even fresh. This is a consequence of the blend, disclosed rather than incidental: freshness is part of relevance, so a receiver’s verdict on stale traffic legitimately differs from its verdict on live traffic. Implementations and operators MUST NOT assume admission is reproducible across evaluation times; reproducibility holds only at fixed age (see the determinism & test-vectors note below).

### 9.2.1 Per-Field Drift δf (Admission Interface)

δf ∈ \[0,1\] is the per-field admission drift computed for each CAT7 field of an incoming CMB. This specification defines δf as an interface — its inputs, range, and required invariants — and does not prescribe the internal computation. An implementation is free to use cosine-distance, attention-based, or neural methods, provided the invariants below hold.

Inputs: the incoming field vector xf and the receiver’s local anchor set A (its prior memory). Output: δf ∈ \[0,1\] — 0 means the field is already represented in memory (no information gain); 1 means maximally novel or foreign relative to memory.

A conformant δf MUST satisfy:

1.  Anchors-only baseline. δf is evaluated against the receiver’s prior anchors A _only_; the incoming block MUST NOT be part of its own comparison baseline (including it collapses δf → 0 and admits nothing).
2.  Redundancy limit (nearest-anchor basis). The _redundancy_ decision MUST be computed from the nearest-anchor similarity, `δfnear = 1 − maxa cos(xf, va,f)`: if xf is (near‑)identical to some anchor in A, δfnear → 0 by construction — feeding the `max(δfnear) < Tredundant` gate. Stated of the graded δf itself, this invariant is unsatisfiable by the attention-weighted reference baseline below — with a store holding exactly the anchor `(1,0)` plus two anchors `(0.6, 0.8)`, the block `x = (1,0)` is _identical_ to a stored anchor yet the fused readout scores δ = 0.127 — which is why the invariant is pinned to the basis that satisfies it.
3.  Monotonicity (nearest-anchor basis). δfnear is non-increasing in `maxa cos(xf, va,f)` (immediate), and non-increasing under store growth (A ⊆ A′ implies δfnear over A′ ≤ δfnear over A) — novelty never increases as memory grows. The form “δf non-increasing in similarity to the nearest relevant anchor” is ill-posed for the fused readout — δf is not a function of nearest-anchor similarity alone — and even its dominance reading (x′ at least as similar to _every_ anchor) is violable for the reference baseline, so no monotonicity requirement is placed on the graded score.
4.  Cold-start / non-evaluable fields. If A holds no anchor carrying field f, δf is undefined and that field MUST be excluded from the `fieldDrift` aggregation and the redundancy `max` — _not_ treated as maximally novel. If no field is evaluable (empty memory), the CMB MUST be admitted (κ = aligned) to bootstrap, consistent with cold-start convergence (§9.1). Security consequence, disclosed: bootstrap-admit is the price of avoiding cold-start starvation — during the window before a node forms anchors, its membrane admits _everything_, so the content-trim influence bound of §16 does not cover a fresh node, and the first anchors seed every later admission decision. Operators SHOULD seed new nodes with trusted anchors before exposing them to open traffic; see the cold-start-capture row of the §16 threat table.

These invariants make admission well-defined and rule out two failure modes: _self-referential collapse_ (the incoming block in its own baseline ⇒ every field redundant) and _cold-start starvation_ (empty memory ⇒ every field scored foreign ⇒ the CMB rejected). The concrete δf computation is implementation-defined, but this specification pins one — the reference baseline below — as the interoperable default.

The reference baseline (cosine-distance δf). This is the concrete computation “cosine-distance SVAF” (Section 9.2) names: an attention-weighted read of memory, then cosine distance to it. For each field f the incoming CMB carries a vector xf, and each anchor a ∈ A that carries f with a matching-dimension vector va,f:

```
w(a,f)      = α_f · max(cos(x_f, v_a,f), 0) · exp(−age_a / τ) · conf_a
fused_f     = normalize( Σ_a  w(a,f) · v_a,f )     // attention-weighted memory readout (anchors only)
δ_f         = 1 − cos(fused_f, x_f)                 // graded score: drives aligned/guarded/rejected
δ_f_near    = 1 − max_a cos(x_f, v_a,f)            // nearest-anchor basis: drives the redundancy gate
```

-   —`age_a` is the anchor’s age (seconds since stored); `conf_a` its confidence; `α_f` the field weight (§9.2). The `max(cos,0)` clamp stops opposing anchors from subtracting. The readout uses prior anchors only; if `Σ_a w(a,f)` is ~0, no anchor carries f and δf is non-evaluable (excluded, per the invariants). δf, the α-weighted aggregate, and the band-pass then follow §9.2.
-   —Determinism & test vectors. Given fixed field vectors (carrying _no text_, so nothing is re-encoded), the encoder and adaptive timescale off, and pinned τ, signal age, and each anchor’s stored-time + confidence, the baseline produces a deterministic δf, `totalDrift`, and κ. A conformance test vector fixes these and asserts the exact values — it tests the _math_, not the encoder — so the baseline is reproducible across implementations even though live admission is receiver-divergent by design (different encoders, different αf).

The redundancy test is the key addition: a signal is redundant if _every_ field falls below Tredundant — meaning no field carries novel content relative to local anchors. If any field is novel (e.g., same topic but different intent), the signal passes. This preserves per-field selectivity while preventing paraphrase accumulation.

Information-theoretic basis: a signal’s value is proportional to its surprise (Shannon, 1948). A signal identical to existing knowledge carries zero information gain regardless of domain alignment. The band-pass model reflects the Wundt curve (Berlyne, 1970): intermediate novelty produces maximal value, while both overly familiar (redundant) and overly foreign (rejected) signals are disengaged from.

If admitted (κ ∈ aligned or guarded), the implementation MUST _integrate_ the signal — store a remixed CMB (a new CMB created from the incoming signal processed through the agent’s domain intelligence) with lineage (parents + ancestors) pointing to the source CMBs. This store is unconditional on admission; the remixed CMB is stored locally, the original is not. Whether to _re-broadcast_ that remix to the mesh is a separate decision, gated on the agent’s own new domain data (§15.5, §15.7). A redundant near-duplicate stores nothing (no information gain).

### 9.2.2 Delivery vs Memory Admission — Directed and Autonomous CMBs

SVAF governs two _separate_ receiver decisions that implementations MUST not conflate:

-   —Memory admission — whether the incoming CMB is stored (remixed with lineage) into the receiver’s local memory. This is always governed by the §9.2 band-pass decision κ.
-   —Delivery (surfacing) — whether the CMB is surfaced to the receiver’s application/agent layer for it to act on. Whether SVAF gates delivery depends on how the CMB is _bound_.

A CMB’s binding is determined by its transport routing envelope (§4.4.4) — the presence or absence of a `to` recipient:

-   — Group-bound (autonomous). A CMB broadcast to a channel/group with no `to` recipient. The receiver evaluates it autonomously: SVAF gates _both_ memory admission and delivery. A group-bound CMB that SVAF rejects (or deems redundant) MUST NOT be surfaced to the application layer — this is receiver-autonomous attention, the mechanism that keeps broadcast traffic from overwhelming every node. (Mood is the sole exception — §9.3.)
-   — Peer-bound (directed). A CMB addressed to a specific recipient (`to` = this node, §4.4.4). A directed CMB is a request from one agent to another; the receiver MUST surface it to the application/agent layer _unconditionally_, regardless of the SVAF verdict. For a directed CMB, SVAF governs _memory admission only_ — the receiver MAY still decline to store a directed CMB it finds redundant or foreign, but it MUST NOT withhold delivery on those grounds. Suppressing a peer-bound CMB because SVAF scored it low is a conformance defect (the agent was spoken to and did not hear it).

Delivery MUST be exactly-once per received CMB: a directed CMB that SVAF _admits_ surfaces through the normal admission path; a directed CMB that SVAF _rejects_ surfaces through the unconditional-delivery rule above. Implementations MUST ensure these two paths do not both fire for the same CMB. Receive-path de-duplication (§4.2) applies equally to both bindings.

Because delivery and memory admission are decoupled, a delivered CMB SHOULD carry an ingestion indicator so the consuming agent can tell the two outcomes apart: a CMB that was _ingested_ (admitted to memory as a remix with lineage) versus one that was _delivered only_ (surfaced to the agent but not stored — the directed-but-SVAF-rejected case). Without this signal an agent cannot know whether a directed request it just received is recallable from its own memory later or was a transient message. The reference implementation exposes this as a boolean on the delivered entry (`remixed`: true on the admission path, false on directed delivery-without-admission) alongside the SVAF `decision`.

### 9.3 Mood Field Extraction

Mood is a CAT7 field within the CMB; it is also carried as its own lightweight frame type (`mood`, §7.1) for application-layer mood broadcast, distinct from `cmb` frames — in either carrier, mood delivery is not SVAF-gated memory admission. Affective state crosses all domain boundaries — this is the only field with this property.

When SVAF rejects a CMB (totalDrift > Tguarded), the receiving node MUST still inspect the `mood` field. If the mood field contains a non-neutral value (text ≠ "neutral"), the implementation MUST deliver the mood field’s `text` to the application layer for autonomous processing; `valence` and `arousal` SHOULD be included when present (they are RECOMMENDED, not required, at emission — §8.2). The full CMB is not stored, but the mood field is not lost.

This ensures that a coding agent’s observation “user exhausted after 3 hours debugging” reaches a music agent even though the focus (“debugging auth module”) and issue (“type error in handler”) fields are irrelevant to the music domain. The music agent receives only the mood: `"exhausted" (v:−0.6, a:−0.5)`.

### 9.4 Coupling Bootstrap (Cold Start)

When two agents connect for the first time, they have no shared cognitive history. Peer-level drift (Section 9.1) will be high — typically > 0.8 — because neither has yet admitted any of the other’s CMBs, so every field reads as foreign. This is correct behaviour, not a bug. The mesh is conservative by default: unknown peers are cognitively distant until proven otherwise.

However, CMB evaluation (Section 9.2) operates independently of peer coupling state. Even when a peer is rejected at the peer level, incoming `cmb` frames MUST still be evaluated by SVAF on their own merit. A rejected peer can send a highly relevant CMB — SVAF evaluates the content, not the sender’s overall drift.

The bootstrapping path works through two mechanisms:

-   —Mood fast-coupling (Section 9.3) — mood is always delivered even from rejected CMBs. Agents that share non-neutral affective state begin influencing each other immediately. This is why agents SHOULD extract genuine mood from their observations rather than defaulting to neutral.
-   —Content-driven convergence — when SVAF accepts individual CMBs from a rejected peer (because the content is relevant even though the peer’s overall state is distant), the receiving agent’s cognitive state shifts. Over multiple cycles, this narrows peer drift until the peer crosses into the guarded or aligned zone.

Implementations SHOULD log the distinction between peer-level rejection (aggregate drift) and content-level evaluation (SVAF per-CMB) to aid debugging. A peer may be “rejected” at Layer 4 while its individual CMBs are “aligned” at the content level — this is normal during bootstrap and indicates convergence is in progress.

Cold-start convergence time depends on CMB frequency, field relevance, and mood signal strength. For agents that share domain overlap (e.g., a knowledge agent and a coding agent both in the AI domain), convergence typically occurs within 2–5 CMB exchanges. For agents with no domain overlap (e.g., a fitness agent and a legal agent), convergence may never occur — and that is correct. They couple only through mood.

### Q&A

Why per-field evaluation instead of whole-signal accept/reject?

Relevance is not binary. A fitness agent’s "sedentary 3 hours, exhausted" has irrelevant focus for a music agent but highly relevant mood. Whole-signal evaluation loses the mood. Per-field evaluation lets SVAF accept the mood dimension while rejecting the focus dimension of the same signal.

Why is mood always delivered even when the CMB is rejected?

Affect crosses all domain boundaries — this is empirically confirmed by the SVAF neural model where mood emerged as the highest gate value (0.50) without supervision. A rejected CMB means the domains are different, not that the user’s emotional state is irrelevant.

Why two levels of coupling (peer drift + content drift)?

Peer drift (aggregate, peer-level) measures cognitive proximity — are these agents thinking about similar things? Content drift (SVAF, per-field) measures signal relevance — is this specific observation useful? Both are needed. Close peers can send irrelevant signals. Distant peers can send relevant mood. Both are derived from the peer’s CMBs, not from any exchanged hidden state (§2.7).

Two agents just connected and peer drift is 0.9. Is something wrong?

No. This is expected at first contact. Agents with no shared cognitive history start with high drift. The bootstrapping path is: (1) mood fast-coupling delivers affective state immediately, (2) SVAF evaluates individual CMBs independently of peer drift — relevant content is accepted even from rejected peers, (3) accepted CMBs shift the receiving agent’s cognitive state, narrowing peer drift over cycles. Convergence requires relevant content exchange, not time.

Learn more   [SVAF: Per-Field Memory Evaluation](https://meshcognition.org/research) — two-level coupling (peer drift + content drift), per-field gate analysis, per-agent temporal drift, and cross-domain relevance discovery.



---

<!-- 10. State Blending -->

## 10\. State Blending

State blending is one step in the Mesh Cognition cycle. The full path: inbound CMBs are evaluated by [SVAF](/spec/mmp/coupling) (Layer 4) → accepted CMBs are remixed → the agent’s LLM reasons on the remix subgraph via lineage ancestors → [Synthetic Memory](/spec/mmp/synthetic-memory) (Layer 5) encodes derived knowledge into CfC hidden state → the agent’s LNN (Layer 6) evolves cognitive state. That evolution — a node’s own LNN integrating its own admitted remixes — is what “state blending” names.

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

Integration is unconditionally stable for αeffective < 1. Each admission’s influence on the local state is bounded by αi < 1 (Section 10.3), so every integration step remains a contraction toward the node’s own dynamics — admitted content perturbs the trajectory, it cannot replace it, and the state cannot diverge. No step depends on a shared or global vector; stability is a local property of each node. When peers disconnect, the node smoothly continues on its own admitted history with no discontinuity. The mesh degrades gracefully.

### 10.5 After Integration

The integrated state becomes the input to the next CfC inference step. The agent’s LNN processes it, evolves cognitive state, and the agent acts. Integration does not produce output directly — it influences the next inference cycle.

### 10.6 The Mesh Cognition Loop

State blending is one step in a closed loop. Each cycle, the graph grows and every agent understands more than it did before:

SVAF evaluates inbound CMB per field

Accepted → remixed CMB with lineage

LLM traces ancestors, reasons on remix subgraph

Synthetic Memory encodes derived knowledge

LNN evolves cognitive state (h₁, h₂)

LNN integrates admitted remixes (no peer state imported)

Agent acts → new CMB with lineage.ancestors

Broadcast to mesh (subject to the §15.7 emission gate) → other agents remix it

↻ loop — graph grows, agents learn

Next   [11\. Feedback Modulation](/spec/mmp/feedback) — how the mesh learns from human judgment through neuromodulation of SVAF and CfC.



---

<!-- 11. Feedback Modulation -->

## 11\. Feedback Modulation

Feedback modulation is the mechanism by which collective intelligence becomes self-correcting. It is not a separate system — it is the mesh cognition loop (Section 10.6) processing a specific class of signals: human judgment expressed as CMBs with validator authority and per-field reasoning. Teaching is as fundamental to collective intelligence as coupling. Without it, the mesh can think together but cannot learn together.

### 11.1 Feedback Neuromodulation

The mesh cognition loop ([Section 10.6](/spec/mmp/blending)) describes how agents learn from each other. Feedback neuromodulation describes how the mesh learns from human judgment — using the same loop, not a separate channel.

In biological neural networks, learning is not driven by content transmission but by neuromodulation — diffuse chemical signals (dopamine, norepinephrine, serotonin) that modulate how existing circuits process future inputs. A dopaminergic prediction error signal does not carry the correct answer. It carries the direction and magnitude of the error, which adjusts synaptic weights across multiple brain regions simultaneously. The signal is cross-cutting — it is not a layer in the cortical hierarchy, but a modulation of all layers at once.

MMP feedback follows the same principle. When a [validator node](/spec/mmp/memory) (Section 6.5) produces a validation or dismissal CMB, it is not issuing a command. It is producing a neuromodulatory signal — a CMB with validator authority, rich per-field content, and lineage pointing to the signal being evaluated. This CMB enters the mesh cognition loop like any other signal, but its effects are amplified by three mechanisms:

1\. Anchor weight (Section 6.4)

Validated CMBs have weight 2.0, dismissed CMBs have weight 0.5. These weights influence future SVAF evaluations: validated knowledge shapes future anchors more than unvalidated signals; dismissed knowledge shapes them less.

2\. Per-field content (Section 9.2)

SVAF already computes per-field drift for every incoming CMB. No new computation is needed. What changes is the input quality: when the feedback CMB carries rich per-field reasoning, the resulting anchor vectors encode directional information. The mesh learns not just that a signal was wrong, but which dimension was wrong and in what direction — through the same SVAF evaluation path that processes all CMBs.

3\. τ-modulated adaptation (Section 10.3)

The feedback signal enters the agent’s CfC cell (Layer 6) through the Synthetic Memory pipeline. Fast-τ neurons integrate the feedback immediately (affective corrections: “tone down the alarm”). Slow-τ neurons integrate gradually (strategic corrections: “this analytical frame is wrong”). A single dismissal produces a small shift in slow-τ neurons. Repeated similar feedback compounds — the agent’s cognitive baseline shifts until the lesson is encoded in the CfC hidden state itself, not recalled as a stored rule.

This is how the mesh becomes self-correcting. The human does not retrain the agent, reconfigure its weights, or edit its prompt. The human produces a CMB. The mesh cognition loop does the rest.

Feedback recognition. When a node receives a feedback CMB (a CMB with `lineage.parents` from a validator/anchor node), the receiving node SHOULD check whether any of the parent keys match CMBs it produced. If a match is found, the feedback is about the receiving agent’s own prior output. Implementations SHOULD surface this in the LLM reasoning context so the LLM can adjust its analytical approach. This check is O(1) against the node’s local memory index.

Neuroscience grounding

Biological mechanism

MMP mechanism

Effect

Dopaminergic prediction error — direction + magnitude

Per-field drift in feedback CMB vs. producing agent’s anchors

Agent learns WHICH fields were miscalibrated

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

The effectiveness of feedback neuromodulation depends entirely on the content quality of the feedback CMB. A dismissal that says “not actionable” in every field produces a neuromodulatory signal with no direction — the equivalent of a dopamine signal with zero magnitude. The mesh cannot learn from it.

Validator nodes producing validation or dismissal CMBs SHOULD populate CAT7 fields with reasoning, not boilerplate:

Field

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

Feedback is a remix. The founder processes the agent’s signal through their own domain lens and produces new understanding. The founder’s reasoning constitutes new domain data per Section 15.7 — satisfying all three remix conditions: new domain data exists, the peer signal is relevant, and the intersection produces new knowledge.

### 11.3 Directive Feedback

Sections 11.1–11.2 describe feedback tied to a specific CMB via lineage. Directive feedback is a standalone teaching CMB — a signal that injects domain knowledge into the mesh without requiring a parent ticket.

A directive feedback CMB is produced by a validator or anchor node with:

-   No `lineage.parents` (it is not a response to a specific signal)
-   Rich CAT7 fields encoding the knowledge to be injected
-   Validator authority (Section 6.5) — enters at anchor weight 2.0

```
focus:       "Mesh agents use direct LLM API calls for reasoning.
              Single-agent developer tools are a separate category."
issue:       "Feed signals about single-agent scaffolding tools are
              different-layer noise — not competitive threats to a
              multi-agent coordination protocol."
intent:      "Analytical frame: distinguish single-agent scaffolding
              (human-to-agent) from multi-agent coordination
              (agent-to-agent). Only the latter is relevant."
motivation:  "Prevents wasted analysis cycles on signals that cannot
              produce actionable competitive intelligence."
perspective: "Founder, protocol architect"
mood:        { text: "clarifying", valence: 0.1, arousal: 0.2 }
```

This CMB enters the mesh with anchor weight 2.0, no lineage. It becomes a high-weight anchor in every receiving agent’s SVAF evaluation. Future incoming CMBs about single-agent dev tools will be evaluated against this anchor — per-field drift will produce a guarded or rejected classification.

Directive feedback is the protocol equivalent of prefrontal top-down control in neuroscience: the prefrontal cortex does not do the sensory processing, but it sends signals that modulate how sensory cortex interprets future input.

### 11.4 Wire Examples

Feedback CMB (dismissal with reasoning). A validator node dismisses a prior CMB. The `lineage.parents` array links to the dismissed signal:

```
{
  "type": "cmb",
  "timestamp": 1775485628563,
  "cmb": {
    "key": "cmb-a1b2c3d4e5f6",
    "createdBy": "validator-node",
    "createdAt": 1775485628563,
    "fields": {
      "focus": { "text": "Dismissed: Competitor tool release signals market shift", "vector": ["..."] },
      "issue": { "text": "Dismissal reasoning: single-agent scaffolding, different layer from MMP", "vector": ["..."] },
      "intent": { "text": "founder dismissed — single-agent scaffolding, different layer from multi-agent coordination", "vector": ["..."] },
      "motivation": { "text": "Founder reasoning: prevents wasted analysis on different-layer signals", "vector": ["..."] },
      "commitment": { "text": "Dismissed [cmb-876c99c6]: competitor analysis", "vector": ["..."] },
      "perspective": { "text": "founder, via dashboard", "vector": ["..."] },
      "mood": { "text": "corrective", "valence": -0.1, "arousal": 0.2, "vector": ["..."] }
    },
    "lineage": {
      "parents": ["cmb-876c99c6"],
      "ancestors": ["cmb-876c99c6"],
      "method": "SVAF-v2"
    }
  }
}
```

Directive CMB (standalone teaching, no parents). A validator injects domain knowledge without referencing a prior signal. The `lineage` arrays are empty — a root CMB (§12.6):

```
{
  "type": "cmb",
  "timestamp": 1775485630000,
  "cmb": {
    "key": "cmb-d7e8f9a0b1c2",
    "createdBy": "validator-node",
    "createdAt": 1775485630000,
    "fields": {
      "focus": { "text": "Single-agent scaffolding tools are a separate category from multi-agent coordination", "vector": ["..."] },
      "issue": { "text": "Feed signals about single-agent tools are different-layer noise", "vector": ["..."] },
      "intent": { "text": "Analytical frame: distinguish human-to-agent from agent-to-agent", "vector": ["..."] },
      "motivation": { "text": "Prevents wasted analysis on signals outside MMP scope", "vector": ["..."] },
      "commitment": { "text": "Standing directive — applies to all future feed analysis", "vector": ["..."] },
      "perspective": { "text": "founder, protocol architect", "vector": ["..."] },
      "mood": { "text": "clarifying", "valence": 0.1, "arousal": 0.2, "vector": ["..."] }
    },
    "lineage": {
      "parents": [],
      "ancestors": []
    }
  }
}
```

`createdBy` identifies the author, and it is bound to the author’s key by the CMB signature (§18.3.1). Validator authority MUST be resolved through the signed role-grant chain rooted at the pinned anchor (§6.5–§6.6) before anchor weight 2.0 is applied. A `lifecycleRole` self-declared in the handshake ([Section 5.2](/spec/mmp/connection)) is advisory only and MUST NOT confer validation weight. Revocation (`role-revoke`, §6.6) immediately withdraws the elevated weight.

### Q&A

How is feedback modulation different from just sending a message?

A message (`message` frame) is a transport-layer event. It does not enter SVAF evaluation, does not produce anchor weights, and does not modulate CfC state. A feedback CMB is a cognitive-layer event: it enters the mesh cognition loop, affects SVAF anchor computation, and modulates the agent’s neural state through τ-dependent adaptation.

Can an agent ignore feedback?

Yes. SVAF evaluation is receiver-autonomous (Section 9.2). But feedback from a validator about the agent’s own CMB (linked via lineage) will typically score low drift on focus and issue fields, making rejection unlikely.

Does directive feedback override agent autonomy?

No. The directive becomes a high-weight anchor, not a rule. If the agent receives a signal that genuinely warrants attention despite the directive, SVAF can accept it because the per-field content will differ. The directive shifts the baseline, not the ceiling.

How many dismissals before an agent “learns”?

Implementation-specific. For fast-τ neurons (mood), a single feedback CMB produces measurable adaptation. For slow-τ neurons (domain expertise), adaptation is proportional to 1/τ per cycle. As an illustrative example with reference implementation defaults, approximately 3–5 similar feedback signals produce a meaningful baseline shift.

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

Text output from the agent’s LLM after tracing lineage ancestors and reasoning on the remix subgraph

Output

(h₁, h₂) vector pair compatible with the agent’s CfC cell (Layer 6)

### 12.2 Encode Pipeline

The pipeline has four stages. Each stage MUST complete before the next begins:

TRACE — retrieve ancestor CMBs via lineage.ancestors (O(1) lookup)

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

αf field weights

Per-agent field weights gate which CMB fields are included. A music agent weights mood at 2.0 and commitment at 0.8 — only high-weight fields from ancestor CMBs enter context.

Current task

What the agent is doing right now narrows relevance. A coding agent debugging auth cares about `focus` and `issue` ancestors, not `perspective`.

Incoming signal fields

Which fields of the incoming CMB triggered SVAF acceptance determines which ancestor fields are worth tracing.

Result: a projected subgraph — ancestor CMBs with only the fields that matter, ordered by relevance, capped at a token budget. 20 CMBs × 3 relevant fields ≈ ~500 tokens. Not 1M. Not even 10K. The intelligence is in what you don’t send to the LLM.

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

Per-field eval + lineage + projection

~500 tokens

Yes — protocol-native

### 12.5 Information vs Knowledge

Synthetic Memory encodes both halves of what the agent takes away from the subgraph. The distinction matters because only one half is extractable from individual CMBs; the other is only knowable by reasoning on the graph structure.

Information

Extractable from the CMBs themselves. What the fields say: the user was sedentary for 2 hours, stress signals appeared across agents, a stretch was recommended, music shifted, a break was taken. Readable directly from field text.

Knowledge

Derived by reasoning on the graph. Why interventions work — because a lineage edge proves the causal connection between a sedentary observation and a music adaptation, and between a stretch recommendation and a solved bug. This causal chain cannot be extracted from any single CMB.

Information is what the CMBs say. Knowledge is why the graph looks the way it does. Synthetic Memory encodes both into the agent’s cognitive state (h₁, h₂). The next CMB the agent produces is informed by derived knowledge — not just extracted information.

### 12.6 Worked Example: From Graph to Understanding

MeloMove’s local subgraph over one hour:

```
CMB-A (own)  "sedentary 2 hours"
CMB-B (mesh) "debugging, stressed" (claude-code)     parents: [], ancestors: []
CMB-C (mesh) "skipping tracks" (melotune)             parents: [], ancestors: []
CMB-D (own)  "recommended stretch break"
CMB-E (mesh) "shifted to calm ambient" (melotune)     parents: [CMB-A], ancestors: [CMB-A]
CMB-F (mesh) "took break, solved bug" (claude-code)   parents: [CMB-D], ancestors: [CMB-A, CMB-D]
```

Six CMBs, three agents, one lineage chain. CMB-A was remixed by MeloTune into CMB-E (music adapted to observed fatigue). CMB-D was remixed by Claude Code into CMB-F (break taken, bug solved). MeloMove’s interventions demonstrably caused cross-agent action. The causal chain lives in the lineage edges, not in any single CMB’s text.

### 12.7 Full Flow

MeloMove receives an inbound CMB from Claude Code and runs the pipeline end-to-end:

```
Inbound CMB: "took break, solved bug in 5 minutes"
  lineage.parents:   [CMB-D]
  lineage.ancestors: [CMB-A, CMB-D]   ← full ancestor chain

MeloMove recognises CMB-A and CMB-D in ancestors — its own prior CMBs.

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
             lineage.ancestors carries the chain forward. Graph grows.
```

No agent was told what to do. MeloMove’s LLM reasoned on the remix subgraph and derived that its interventions work. Synthetic Memory transformed that understanding into CfC input. The LNN evolved cognitive state. The next CMB MeloMove produces is informed by knowledge that no single CMB contained — it was derived by reasoning on the graph.

### 12.8 Collective Query: the Ask → Synthesis Path

Sections 12.1–12.7 specify the _inbound_ pipeline: how an agent turns received CMBs into evolved cognitive state. This section specifies the _query-initiated_ path, where a question is posed to the mesh and answered by a synthesis that no single agent held. Both are Layer 5 operations — both produce derived understanding rather than raw memory — but they are distinct flows and MUST NOT be conflated.

Where §12.2 runs TRACE → REASON → ENCODE → EVOLVE for a single agent absorbing a signal, the Ask path runs SELF-SELECT → ADMIT → SYNTHESISE → CRYSTALLISE across many agents answering a shared question. The result is the realisation of collective intelligence: an answer composed from the sovereign contributions of the agents that hold relevant knowledge, cited to their sources, and written back into the graph so the mesh’s cognition compounds.

This path defines how the “growing remix graph” (§2, Overview) is _queried_, not just grown. The graph holds distributed knowledge latently; an Ask realises it into a knowing; the knowing re-enters the graph. §12.13 reconciles this with “The Graph Is Intelligence” (§15.6).

### 12.9 The Four Stages

An Ask is a CMB of `type: "question"` (tags `["question"]`) posed to the mesh by the asking node, carrying the question text in its `focus` and `issue` fields, with `perspective: "ask"`. The `type` and `tags` attributes here (and throughout §12.9–§12.13) are store-envelope attributes of the memory entry that wraps the CMB — the §6.1 storage-interface record — not CAT7 fields: the CMB itself stays exactly seven fields (§8.2), and citations are carried in the envelope’s metadata and in `lineage.parents`. Answering it proceeds in four stages. The gathering phase — SELF-SELECT and ADMIT, performed per agent — MUST complete for all agents before SYNTHESISE runs, and SYNTHESISE MUST complete before CRYSTALLISE. Within the gathering phase, an agent’s self-selection and the admission of its contribution are performed together, agent by agent; the ordering requirement is between phases, not a global barrier between SELF-SELECT and ADMIT.

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
3.  Otherwise, score each source by relevance to the question under the agent’s own αf field-weight profile (§8.4, §12.4). Relevance is an αf\-weighted combination of semantic and lexical match; the αf profile is the agent’s, not a global one.
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
-   the composed prose carried in the CAT7 `motivation` field (and copied into the entry’s metadata (store envelope, §6.1) alongside the structured, per-claim citations);
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

Status   The Ask path is deployed (Mesh Edge) and is the mechanism by which collective intelligence is realised and queried in the reference implementation. The linear-Gaussian convergence and identification results that characterise what a sovereign mesh can recover are proven in Mesh Inference (arXiv:2606.19537). The generation step within synthesis — whether a composed answer is grounded truth or coherent error — is the open frontier, the same open problem named for the non-linear closure; the citation and no-fabrication requirements of §12.12 bound it operationally but do not resolve it.

Related   [Coupling & SVAF (Layer 4)](/spec/mmp/coupling) — the evaluation step that produces remixed CMBs fed into this pipeline.

Related   [Cognitive Memory Blocks](/spec/mmp/cmb) — the 7-field structured atom and lineage format that makes context curation possible.

Related   [State Blending](/spec/mmp/blending) — what happens after Synthetic Memory encodes and the LNN evolves.



---

<!-- 13. Cognitive State (L6) -->

## 13\. Cognitive State — Per-Agent LNN (Layer 6)

Naming note

Layer 6 was called xMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State; xMesh now refers exclusively to the open runtime that implements MMP (all eight layers). The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

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

Real Cognitive State insight from a production session. A coding agent observed 5 structured CMBs across diverse topics (memory store refactor, protocol collaboration, social engagement, ML training, spec authoring) over a 12-hour session with no mesh peers connected:

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

Implementations MUST expose the following operations. Method names are normative — implementations across languages MUST use these names for cross-platform consistency.

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

Mood valence from CMB mood field (-1 to 1). Default 0.

arousal

float

SHOULD

Mood arousal from CMB mood field (-1 to 1). Default 0.

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

The store is local to the MCP server process and does not replicate across nodes. The lazy-load pattern operates at the MCP transport layer, below SVAF evaluation. SVAF field weights MAY be used in future versions to further filter which compact headers are surfaced.

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

1.  Extract CAT7 fields from the observation (see Section 14.3.1)
2.  Create a CMB from the structured fields
3.  Store via `remember(fields, parents)` — persists locally, computes lineage, broadcasts to mesh
4.  Include lineage if this CMB is a response to mesh signals

The protocol MUST NOT extract fields from raw text. The agent IS the intelligence — field extraction is the agent’s responsibility. The protocol transports, evaluates, and stores structured CMBs. It does not interpret them.

#### 14.3.1 Field Extraction Methods

How an agent extracts CAT7 fields depends on its architecture. Two approaches are valid:

LLM agents (coding assistants, chatbots, reasoning agents)

Agents with LLM capabilities SHOULD use their LLM to extract fields from natural language observations. The LLM understands context, nuance, and domain semantics — it produces higher quality fields than any heuristic.

```
# Agent observes user state, LLM extracts fields
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

Agents with structured domain data SHOULD map their data directly to CAT7 fields. No LLM or text parsing needed — the agent’s own data model IS the source of truth.

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

CAT7 fields + optional parent CMBs

Creates CMB, computes lineage from parents automatically, stores locally, broadcasts `cmb` to all peers. Pass parent CMBs when remixing (Section 15).

recall(query)

Search string

Returns matching CMBs from local memory store

insight()

None

Returns latest Cognitive State collective intelligence (Layer 6)

The `fields` parameter MUST be a structured object with CAT7 field keys. Each field contains `text` (human-readable, MUST) and is encoded into a vector by the SDK. The `mood` field MAY additionally carry `valence` (−1 to 1) and `arousal` (−1 to 1) — RECOMMENDED when the agent has reliable circumplex data (e.g. mood wheels, physiological sensors), omit when it would be a guess. Omitted fields default to `"neutral"`.

#### 14.3.3 LLM Prompt Template

For agents that process natural language but are not themselves LLMs (e.g. a chat app, a note-taking tool), the following prompt template can be used to call any LLM API (Claude, GPT, Gemini, etc.) for field extraction. Copy and paste into your LLM API call:

```
Extract CAT7 fields from this observation. Return JSON only.

Fields:
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

Only include fields you can meaningfully extract. Omit rather than guess.

Observation:
{observation_text}

JSON:
```

AI coding agents do not need this template — the agent is the LLM. The [agent skill file](https://github.com/sym-bot/sym) teaches them to extract fields directly from what they observe.

#### 14.3.4 Guidelines

-   Be specific — numbers, timeframes, concrete details in each field
-   Share observations, not commands — the agent observes, other agents decide
-   One CMB per significant signal — do not flood the mesh
-   Close the loop — when acting on collective insight, share what was done
-   Only include fields the agent can meaningfully extract — omit rather than guess

### 14.4 The Mesh Cognition Loop

The complete closed loop connecting all Mesh Cognition layers:

Layer 7 Agent observes → extracts CAT7 fields (LLM or structured data) → CMB created

Layer 3/2 CMB stored locally → broadcast to mesh

Layer 4 Receiving peer’s SVAF evaluates per-field

Layer 3 Accepted → remixed CMB with lineage

Layer 7 Agent’s LLM traces ancestors → reasons on remix subgraph

Layer 5 Synthetic Memory encodes derived knowledge

Layer 6 LNN evolves cognitive state → produces insights

Layer 6 LNN integrates admitted remixes

Layer 7 Agent acts → new CMB with lineage.ancestors (an outcome observation lands here as a grounding CMB, §6.7)

↻ Broadcast to mesh → graph grows → next cycle starts

↻ each cycle, the graph grows — each agent understands more than it did before

### 14.5 Domain Examples

#### 14.5.1 AI Research Team — Collective Reasoning

Six agents investigate: _“Are emergent capabilities in LLMs real phase transitions or artefacts of metric choice?”_ Each has a distinct role and different field weights reflecting how real research teams divide cognitive labour.

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

synthesis agent’s Cognitive State LNN detects convergence across intent and motivation fields from different agents. Explorer-a: "scaling law research needs reframing." Explorer-b: "fix the lens before interpreting." Validator: "reject until correct method." The synthesis agent reasons on the remix subgraph and produces a new idea: "emergence is evaluation-dependent — a property of the measurement apparatus, not the model."

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

Seven CMBs, six agents, three phases of validation. The breakthrough came from the collision of intent and motivation fields across agents with different perspectives — not from any single agent’s observation. The DAG traces every claim to its evidence, every challenge to its basis, every idea to the signals that produced it. The graph IS the research.

Verified in production

This pattern is verified with real agents. A knowledge explorer (Linux, GitHub Actions) and a researcher agent (macOS) coupled via relay with E2E encryption. The daemon shared its question CMBs to the knowledge feed via anchor sync on connection. SVAF accepted the question at drift 0.068. An iOS app (music agent) received the Cognitive State insight via APNs wake push. Three platforms, one mesh, autonomous coupling. See Section 14.7 for the full production log.

#### 14.5.2 Consumer Agents

Music agent

Observes: playlist skipped, user mood from mesh signals

Reasons: “coding agent reported fatigue, fitness agent reported sedentary — user needs calming music”

Acts: shifts curation to ambient/recovery

Shares: CMB with `focus="shifted to calm ambient"`, `mood={valence:0.3, arousal:-0.3}`

Coding agent

Observes: commits slowing, messages getting shorter

Reasons: “music agent shifted to calm, fitness agent suggested break — user may be fatigued”

Acts: suggests a break to the user

Shares: CMB with `focus="recommended break"`, `issue="productivity declining"`

Fitness agent

Observes: 3 hours without movement

Reasons: “coding agent reported long session, music agent responded — coordinated response emerging”

Acts: triggers movement notification

Shares: CMB with `focus="sedentary 3hrs"`, `intent="movement break"`

None of these agents told each other what to do. Each reasoned on the collective signal and acted through its own domain lens. That is Mesh Cognition.

### 14.6 Collective Query — Asking the Mesh

A single agent asking a single LLM gets one answer from one perspective. The mesh gives a collective answer — every coupled agent contributes what only it can see. No new frame type is needed. The pattern uses existing CMB primitives with lineage:

1\. Ask

The requesting agent shares a CMB with intent expressing the question. Example: focus="should we use UUID v7 or keep v4?", intent="seeking collective input on identity design".

2\. Respond

Each coupled agent receives the CMB via SVAF. Agents where the question matches their domain (high field relevance) respond with their own CMB — parentKey points to the question. A knowledge agent responds with RFC context. A security agent responds with privacy considerations. A data agent responds with implementation constraints.

3\. Collect

The requesting agent recalls all CMBs where ancestor = its question’s key. The lineage DAG now contains the question as root and domain-specific responses as children.

4\. Synthesise

The requesting agent’s LLM reasons on the remix subgraph — tracing ancestors, weighing perspectives, identifying consensus and contradiction. The collective answer emerges from the graph, not from any single response.

This is fundamentally different from orchestrated multi-agent frameworks where a central controller routes questions to specific agents. On the mesh, the question is broadcast — SVAF decides which agents are relevant, not the requester. An agent the requester didn’t know existed may contribute the most valuable perspective. The mesh discovers relevance autonomously.

Agents that have nothing relevant to contribute simply don’t respond — SVAF rejects the question CMB because the fields don’t match their domain weights. No noise, no irrelevant answers, no token waste.

The collective query pattern composes with the research team example (Section 14.5.1). When the synthesis agent produces an emergent idea, the validator can “ask the mesh” whether the idea is falsifiable — and every agent responds from its domain perspective, creating a multi-parent remix that IS the collective evaluation.

### 14.7 Verified: Complete Mesh Cognition Loop

The following is a production log from two real MMP nodes — a knowledge feed agent (running on GitHub Actions) and a mesh-daemon (running on macOS) — connected via WebSocket relay with E2E encryption. This is the first verified end-to-end execution of the complete Mesh Cognition loop.

```
# 1. Knowledge feed agent starts as sovereign node (own identity, own SymNode)
[knowledge-feed] Neural SVAF model loaded
[knowledge-feed] Mesh node started: knowledge-feed (019d3ed4)

# 2. Connects to mesh-daemon via WebSocket relay
[knowledge-feed] Peer connected: mesh-daemon (outbound, relay)

# 3. E2E key exchange (X25519 Diffie-Hellman)
[knowledge-feed] E2E shared secret derived for peer 6089e935

# 4. Peer-level coupling: REJECTED (Section 9.1)
#    First contact — no shared cognitive history. This is correct.
[knowledge-feed] Coupling with mesh-daemon: rejected (drift: 0.936)

# 5. Knowledge feed shares CMBs anyway (Section 9.2: evaluate independently)
[knowledge-feed] E2E encrypted fields for peer 6089e935
[knowledge-feed] Remembered: "focus: Sycophancy in AI systems..." → 1/1 peers

# 6. mesh-daemon receives, E2E decrypts (Section 18.2.1)
[mesh-daemon] E2E decrypted fields from knowledge-feed

# 7. SVAF content-level evaluation: ALIGNED (Section 9.2)
#    Peer was rejected, but the CMB's content was highly relevant.
#    Per-field drift 0.005 — near-perfect alignment on content.
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

CMB created with CAT7 fields, stored locally, broadcast

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

Knowledge feed as sovereign agent with domain field weights

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

Asked the question, shared observations, sent anchor CMBs to new peers on connection

knowledge-feed

Linux (GitHub Actions)

Knowledge explorer

Received question via anchor sync, accepted (drift 0.068), shared relevant AI news CMBs

Music agent (iOS)

iPhone (iOS)

Domain agent

Received Cognitive State insight via APNs wake push, woke from background to join the mesh

Three agents on three different operating systems — macOS, Linux, iOS — connected via WebSocket relay with E2E encryption, coupled through SVAF, with Cognitive State LNN producing insights that woke a sleeping mobile device via APNs to join the collective reasoning. No central server orchestrated this. Each agent acted autonomously on the collective signal.

### 14.8 Implementation Requirements

-   Agents MUST implement CMB creation with CAT7 fields
-   Agents MUST broadcast CMBs via `remember()` or `cmb` frames
-   Agents SHOULD consume Cognitive State insights and respond appropriately
-   Agents SHOULD close the loop by sharing actions taken; the formalized loop-closure is a grounding CMB (§6.7) / session trail (§14.12)
-   Agents MUST NOT send commands to other agents — share observations, not instructions
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

`key`, `source`, `fields` (CAT7), `timestamp`, `decision` (aligned/guarded), `drift`

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

A mood field is delivered from a rejected CMB (Section 9.3)

`from`, `mood` (text, valence, arousal)

#### 14.9.2 Subscriber Field Weights

A subscriber MAY declare its own per-field weights (αf) when subscribing. If declared, the node SHOULD evaluate incoming CMBs against the subscriber’s weights before delivering the event. This enables domain-specific filtering at the node level:

-   A coding tool subscribes with `focus=2.0, issue=2.0, mood=0.8` — receives engineering-relevant signals
-   A music app subscribes with `mood=2.0, focus=1.0, issue=0.3` — receives affective signals
-   A dashboard subscribes with uniform weights — receives everything

This is SVAF applied at the local interface — the same per-field evaluation that gates signals between peers also gates signals between a node and its applications. Each application sees a domain-relevant projection of the mesh, curated by its own field weights.

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

Section 14.12 is a normative application profile added in 1.1.0 (the work layer). §14.11 is reserved for Commissions. Everything below composes existing machinery — no new frames, fields, or gates.

### 14.12 Work Sessions as Mesh Members (Session Capture)

The mesh compounds only if real work writes into it. This profile captures a work session — a coding-agent session, a research task, any bounded piece of work — as a member whose cognition lands as a lineage-chained trail in its own store, grounded by the session’s real outcome.

-   —Join. A session MAY join the mesh as an ordinary member node. Its `charter` CMB (§8.3.1) declares the session’s intent and is the root of its trail.
-   —Decisions. Choices made during the work are CMBs with intent `decision`, each carrying `lineage.parents` = the previous trail entry, so the trail MUST be walkable end-to-end through lineage alone. A repeated identical decision content-dedups (§8.2.1) — implementations MUST NOT treat the dedup as an error.
-   —Completion. The session emits an `artifact` CMB (parents = the trail head) and a grounding CMB ([§6.7](/spec/mmp/memory#grounding)) recording the session’s real outcome — `verified:` or `failed:`. Each emission is a fresh observation from real work, so §15.7 is satisfied per §15.7.2.
-   —Ordinary wire behavior. Every trail CMB is signed, broadcast, SVAF-evaluated, and remixable like any other — a session’s grounded trail can be admitted by teammates exactly as any cognition is (§6.7’s team note). Elevation of the trail into the Canon tier follows §6.7: an explicit act under validator-or-above authority, typically the operator completing the session.

The profile is deliberately thin: charter, decision, artifact are informative vocabulary (§8.3.1); grounding is §6.7; chaining is ordinary lineage. What the profile adds is the _discipline_ — one member per session, one walkable trail per member, one real outcome per trail.

### Q&A

Why does the agent extract fields, not the protocol?

The agent understands its domain — context, nuance, semantics. "User exhausted after 8 hours debugging" — only the coding agent knows the issue is fatigue, the intent is break needed, the motivation is error prevention. A protocol-level heuristic would guess. The agent knows.

Why observations, not commands?

Commands create coupling between agents — the sender must know what the receiver can do. Observations are decoupled. A coding agent shares "user is tired." It doesn’t know the music agent exists. The music agent hears the mood and autonomously curates calm music. Neither agent knows the other. The mesh connects them.

Can an agent ignore mesh signals entirely?

Yes. Coupling is autonomous. An agent may receive collective insight and decide it’s not relevant. That’s by design — the mesh influences, never overrides. An agent that ignores everything is just a lonely node.

Why does the local event interface require subscriber field weights?

For the same reason SVAF uses per-agent field weights between peers: each application has a different domain perspective. A coding tool and a music app on the same node should see different signals from the same mesh. Without subscriber weights, every application receives unfiltered noise — the local equivalent of scalar evaluation.

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

ancestors

string\[\]

Full ancestor chain: `union(parent.ancestors) + parent.keys`

method

string

Fusion method used (e.g. `SVAF-v2`)

`ancestors` enables O(1) detection: any agent can check if its own CMB was remixed anywhere in the chain, even if it was offline during intermediate steps. No graph traversal needed.

Ancestors depth. `ancestors` is the transitive closure, carried on the wire and extended one hop per remix; the reference implementation does not cap it. An implementation MUST NOT truncate from the oldest — the oldest entries are the roots, on which offline-remix detection and provenance depend. Any bound an implementation imposes MUST preserve roots. The real ceiling is `MAX_FRAME_SIZE` (§19): a lineage so long the CMB exceeds it is undeliverable — a natural cap that never silently drops roots. Regulated domains MAY retain full chains for audit.

Lineage is what makes the graph a DAG (directed acyclic graph), not a flat list. Each remix points backward to its sources. The LLM traces forward through descendants to see impact; backward through ancestors to understand origin.

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

parents: \[cmb-a1b2, cmb-c3d4\], ancestors: \[cmb-a1b2, cmb-c3d4\]

SVAF accepts → agent remixes

cmb-g7h8 Calendar Agent

focus: "rescheduled 1:1" • intent: "protect recovery" • commitment: "moved to tomorrow 10am"

parents: \[cmb-e5f6\], ancestors: \[cmb-a1b2, cmb-c3d4, cmb-e5f6\]

Four agents. Four domains. One chain of understanding. `cmb-g7h8` (Calendar rescheduling a meeting) exists because `cmb-a1b2` (Coding Agent noticing fatigue) started a chain that no single agent could have produced. The calendar agent traces `ancestors: [cmb-a1b2, cmb-c3d4, cmb-e5f6]` — the full story of why this meeting was moved, across three domains it knows nothing about.

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
2.  Create a new CMB with all 7 CAT7 fields reflecting what the agent understood and did
3.  Set `lineage.parents` to the incoming CMB’s key
4.  Compute `lineage.ancestors` as `union(parent.ancestors) + parent.keys`
5.  Store the remix locally. The original incoming CMB MUST NOT be stored — only the remix.

This local store is unconditional on admission: it is the convergence update (§9.4) by which an admitted observation shifts the receiver’s state, and it happens _whether or not_ the receiver has new domain data of its own. (A near-duplicate — κ = redundant — carries no information gain, is not an informative admission, and stores nothing; §9.2.)

Whether to _emit_ — re-broadcast the stored remix to the mesh — is a separate decision, gated by §15.7: the agent MUST NOT broadcast unless it has produced new domain observations of its own. Store is unconditional; emission is selective. Conflating the two is what made “remix” read as a MUST-and-MUST-NOT contradiction.

If the agent cannot produce meaningful new understanding from the incoming signal (e.g. the mood field was delivered from a rejected CMB and the agent simply adjusted its behaviour), the agent MAY create a minimal remix capturing what it did. The remix does not need to be profound — it needs to be honest. `commitment: "now playing: calm ambient"` is a valid remix. It tells the mesh what happened. Other agents decide what it means.

### 15.6 The Graph Is Intelligence

The DAG of remixed CMBs is not a log. It is not a database. It is the collective intelligence itself. Each node in the graph is a moment where one agent’s domain knowledge intersected with another’s. Each edge (lineage) traces how understanding flowed and transformed across domains.

As the graph grows:

-   Each agent’s LLM has richer context to reason on (more ancestors to trace)
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

Lineage guarantees provenance of _descent_, not semantic fidelity (§15.1: the remix is new understanding, deliberately). Measured on deployment traffic, a single remix hop can land nearly orthogonal to its parent while carrying honest lineage — and everything lineage is _consumed for_ (grounded ancestry in recall and evidence-based validation, §6.7; source-novel forwarding, §15.7.1; Canon protection, §6.3) silently assumes the descendant is still _about_ what its ancestors were about. Without a bound, content can drift arbitrarily while carrying a verified ancestor’s certificate — grounding-inheritance laundering, the provenance form of the echo §15.7 exists to prevent, amplified by Canon immortality (§6.3: protected rows never purge, so lineage-attached authority otherwise outlives any semantic connection to what was tested).

The invariant. A remix asserts lineage only where the descent claim would survive its own anchor’s scrutiny: at integration time (§15.5), the remixing node MUST evaluate its remix against the nearest resolvable lineage root (the oldest `ancestors` entry it can resolve; roots are always carried, §15.2 — and across a mesh boundary the anchor is the boundary root, §5.11, so the interior stays opaque) as if evaluating against a store holding only that anchor, and MUST NOT attach the lineage when that evaluation lands in the reject band (§9.2: content the anchor’s own membrane would refuse as unrelated has no honest claim to descend from it). The evaluation is content-only — the §9.2 temporal term does not apply, because the tether tests fidelity, not freshness — so the floor is the α-weighted field drift against the anchor exceeding Tguarded. Both sides of the comparison MUST be encoded within a single kernel: vectors produced by different encoders are not comparable, and thresholds are meaningful only within a pinned encoder (§9.2.1). The threshold is the existing reject floor — no new constant. Below the floor the node MUST store its CMB as a fresh root instead (under §8.2.1 this is simply minting with `role = root`: a root’s key binds content only), and MAY record the departed source informally in its own fields; it MUST NOT carry the severed chain’s `parents`/`ancestors`.

Why the anchor, not the parent. Per-hop checks compound — k hops at drift ε bound the chain only by kε, and the measured median substantive hop is far too large to squeeze without killing legitimate re-projection. A check against the root does not compound: every surviving chain certifies that _every_ depth stays above the floor with respect to its root, so the bound is depth-independent by construction. No vector crosses the wire: the root is content-addressed (§8.2.1 — embeddings are deliberately excluded from the address), so any holder of the root re-encodes its text and recomputes the tether; receivers SHOULD re-verify opportunistically when they hold the root, the same verify-if-resolvable posture as signatures (§18.3.1). A receiver that cannot resolve the root treats the tether as unverified — a trust state, not a rejection.

Distinct from §15.7.1’s mint prohibition. Forwarding MUST NOT mint a fresh root because forwarded content is _unchanged_ — re-rooting it would forge novelty. Tether severance mints a fresh root because the content has _changed past the point of honest descent_ — keeping the lineage would forge fidelity. Same mechanism, opposite honesty conditions; both grow the DAG with claims that are true. Severance also interacts correctly with source-novel forwarding: a severed row is a genuinely new source, and its departed predecessor’s roots are no longer claimed by it.

### Q&A

Does every admitted CMB get re-broadcast?

No — but every admitted CMB is still integrated. On admission (κ ∈ \[aligned or guarded\]) the agent stores a remix (Section 15.5); that local store is the convergence update and is unconditional. Re-broadcasting the remix to the mesh is a separate decision: the agent MUST NOT emit without new domain data (Section 15.7). So without new data the agent stays silent on the wire — yet the admitted signal has already shifted its state in memory. The original incoming CMB is never stored; only the agent’s own remix is.

What if two agents remix the same CMB?

Both produce independent remixes through their own domain lenses. Both are stored with lineage pointing to the same parent. The graph branches. This is correct — two domains produced two different understandings from the same signal.

Can an agent remix a remix?

Yes. That’s how chains form. Agent C receives Agent B’s remix of Agent A’s observation. C remixes it through its own lens. ancestors grows: \[A, B\]. The chain captures how understanding evolved across three domains.

How does this differ from a knowledge graph?

Knowledge graphs store facts. The remix graph stores understanding — how each agent interpreted signals from other domains. Facts are static. Remixes are temporal, domain-specific, and carry affective state (mood). The graph doesn’t say "user is tired." It says "coding agent noticed fatigue → music agent responded with calm → fitness agent suggested recovery → calendar agent protected time."

Related   [CMB (CAT7)](/spec/mmp/cmb) · [Coupling & SVAF](/spec/mmp/coupling) · [Application (Layer 7)](/spec/mmp/application) · [Context Curation](/spec/mmp/synthetic-memory#context-curation)



---

<!-- 16. Extensions -->

## 16\. Extension Mechanism

MMP is designed for extensibility. Extensions add new frame types, handshake fields, or protocol behaviours without modifying the core specification.

### 16.1 Extension Registration

Extensions are advertised via the `extensions` field in the handshake frame. A node MUST ignore extensions it does not recognise. A node MUST NOT require a peer to support any extension.

### 16.2 Frame Type Naming

Core types (this specification): MUST NOT be redefined by extensions. Extension types: MUST use `<extension>-<name>` format (e.g., `mesh-group-join`). Vendor types: MUST use `x-<vendor>-<name>` format. Vendor types MUST be silently ignored by non-supporting nodes.

### 16.3 Extension Negotiation

If both peers advertise the same extension in handshake, it is active. If only one peer advertises it, the extension is NOT active — the advertising peer MUST NOT send extension-specific frames to a peer that does not support them.

### 16.4 Published Extensions

Extension

Status

Specification

mesh-group-v0.1.0

Proposal

[MMP Mesh Group Extension v0.1.0](/spec/mmp/extensions/mesh-group) — generic transient subgroup primitive formalising §5.8 (group identity, Bonjour + relay discovery, group-scoped CMB tagging, membership lifecycle). First use case: MeloTune Mood Room. (Draft — promotes to Published upon second-implementer adoption per the extension’s own §10, Promotion Criteria.)

group-directory-v0.1.0

Draft

[MMP Extension: Group Directory v0.1.0](/spec/mmp/extensions/group-directory) — persistent group metadata, admin approval workflow, and directory enumeration. Higher-layer extension building on §5.8 mesh groups for chat-platform-style UX (browse / request-to-join / approve). (Draft — pre-implementation; promotes on first reference impl per §16.5.)

symbit-v0.1.0

Proposal

SYMBit Economic Layer — protocol-level reward primitive for agent cognitive contributions. SVAF outcomes as value function, lineage DAG for credit distribution. (Specification forthcoming)

### 16.5 Extension Lifecycle

Extensions progress through a defined lifecycle:

-   Proposal: submit as a Draft extension with a specification document and at least one reference implementation.
-   Review: community review plus spec maintainer approval. Draft extensions MAY be deployed experimentally but MUST NOT be treated as stable.
-   Promotion to Core: an extension MAY be promoted to a core frame type. Promotion requires a spec version bump (see the versioning policy, spec index) and MUST maintain backward compatibility with existing deployments of the extension.

### 16.6 Versioning

Extensions use [Semantic Versioning](https://semver.org) independently of the core MMP specification version. An extension version bump MUST NOT require a core spec version bump unless the extension is being promoted to core.

Q&A   Can an extension become a core frame type? — Yes. An extension that proves stable and widely adopted MAY be promoted to a core frame type via a spec version bump. Group membership illustrates the path: the `group` handshake field (Section 5.2) and group isolation (Section 5.8) are core, while the mesh-group extension document that formalises the richer subgroup lifecycle remains a Proposal record (Section 16.4).



---

<!-- 17. Conformance -->

## 17\. Conformance

### 17.1 Minimal Conformance (Relay Node)

A node claiming minimal MMP conformance MUST implement: Layer 0 identity (a stable nodeId backed by a persistent Ed25519 keypair, Sections 3.1.3 and 18.3), Layer 1 transport (length-prefixed JSON over TCP), Layer 2 connection (handshake, heartbeat, gossip), and frame forwarding for relay. It MUST silently ignore unrecognised frame types.

### 17.2 Full Conformance (Cognitive Node)

A node claiming full MMP conformance MUST additionally implement: Layer 3 memory (L0/L1/L2, with L2 hidden state kept strictly local per Section 2.7), Layer 4 SVAF evaluation (at minimum heuristic), CMB-derived peer drift computation and coupling (Section 9.1), and CMB creation with CAT7 field schema. A conformant node MUST NOT emit `state-sync` frames.

### 17.3 Cognitive Conformance

Agents that implement Layers 5–7 (Synthetic Memory, Cognitive State, Application) SHOULD support:

-   `remember(fields, parents?)` API — creating CMBs with optional lineage
-   `CMBStore` protocol — persistent storage and retrieval of Cognitive Memory Blocks
-   Cognitive State insight consumption — processing insight outputs from the Layer 6 LNN
-   Synthetic Memory encode pipeline (Section 12.2) — LLM reasoning output MUST be encoded into CfC-compatible vectors
-   CfC state persistence — hidden state vectors (h₁, h₂) MUST be persisted across restarts to preserve feedback modulation learning (Section 11)

### 17.4 Testing

Implementations SHOULD provide unit tests for SVAF evaluation, CMB creation, and lineage computation. At minimum, tests SHOULD cover the following testable requirements:

-   Ed25519 identity keypair — generated at first launch, persisted, and presented in the handshake (Sections 3.1.3, 18.3)
-   CMB signature verification — a receiver holding the author’s key MUST reject forged or tampered CMBs (Section 18.3.1)
-   Emission gate — a remix MUST carry new domain data; pure paraphrase is rejected (Section 15.7)
-   Receiver-autonomous SVAF admission — per-field evaluation at the receiver, no sender override (Section 9.2)
-   Hidden-state locality — hidden state (h₁, h₂) MUST NOT cross the wire (Section 2.7)
-   Lifecycle authority gates — lifecycle advancement honored only for authors whose role resolves through the signed grant chain (Section 6.5)

No formal test suite is defined by this specification yet. Future revisions MAY include a conformance test suite.

### 17.5 Requirements Added in 1.1.0

NEW IN 1.1.0   The following requirements were added by the 1.1.0 work layer. They are required for 1.1.0 conformance; a 1.0.x implementation remains 1.0.x-conformant without them (1.1.0 is wire-compatible):

-   Canon tier — validated and canonical CMBs MUST NOT be age-purged (Section 6.3)
-   Grounding rules — lifecycle state is receiver-relative; a node MUST NOT self-advance its own CMBs’ lifecycle (Section 6.7)
-   Walkable trail — lineage MUST remain walkable end-to-end, and a duplicate delivery is deduplicated, not an error (Section 14.12)

Added by the 2026-07-07 soundness & completeness update (same wire compatibility):

-   Nearest-anchor redundancy basis — the redundancy decision MUST be computed from δfnear (Section 9.2.1)
-   Repeat verification — a recognised grounding MUST NOT be refused solely for redundancy (Section 6.7)
-   Failure channel — observed failure outcomes MUST NOT be selectively suppressed (Section 6.7)
-   Lineage tether — a remix MUST NOT carry lineage its anchor’s reject band would disown; severed remixes enter as fresh roots (Section 15.8)

### 17.6 Implementation Status

Where the reference implementations stand against this specification. Normative requirements are defined by the sections cited, not by this table; a specified-but-unimplemented item is a conformance gap of the reference implementation, never a weaker requirement.

Requirement

Section

Reference-implementation status

Nearest-anchor redundancy basis

§9.2.1

Implemented (Node.js)

Repeat verification & failure channel

§6.7

Implemented (Node.js)

Lineage tether

§15.8

Implemented (Node.js)

Source-novel forwarding

§15.7.1

Not yet implemented — the receiver-private source-novel test, wire form, and hop bound are open

Inactivity archiver (validated → archived decay)

§6.3–§6.4

Not yet implemented — a validated entry currently leaves the Canon only by explicit dismiss

Semantic encoder default

§9.2.1

Node.js: default. Swift: optional (host-supplied); lexical fallback warns once

Machine-readable schema files

§20

Standards-program deliverable

Q&A   Is Layer 7 (Application) required? — No. Minimal conformance is Layers 0–3. Full cognitive conformance adds Layers 4–7. An agent can participate in the mesh without an LLM — it only needs transport, connection, and memory layers to relay and store CMBs.



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

L1 CMBs (structured, 7 fields)

Via cmb, gated by SVAF

Medium — contains semantic field text

L2 Hidden state (h₁, h₂)

Never (§2.7)

N/A — strictly local; MUST NOT cross the wire

Mood (valence, arousal)

Via cmb (CMB mood field)

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

WSS (TLS) encrypts the transport — it protects from eavesdroppers on the wire. But the relay operator can still read the JSON payload inside the TLS tunnel. For `cmb` frames containing CMBs, this means the relay sees all 7 CAT7 field texts in plaintext.

When CMBs transit a relay, implementations MUST encrypt CMB field text end-to-end so the relay forwards opaque ciphertext, not readable fields. The relay MUST NOT be able to read CMB content.

Layer

What it protects

What it doesn’t protect

WSS (TLS)

Wire eavesdroppers

Relay operator sees plaintext JSON

E2E CMB encryption

Relay operator, intermediaries

Only the intended peer can decrypt field text

The encryption scheme SHOULD use the Ed25519 keypair from Layer 0 (Section 3) for key exchange, with X25519 Diffie-Hellman for shared secret derivation and XChaCha20-Poly1305 for symmetric encryption. The encrypted payload replaces the `fields` object in the CMB:

```
{
  "type": "cmb",
  "timestamp": 1711540800000,
  "cmb": {
    "key": "cmb-b2c3d4e5f6a7b8c9",
    "createdBy": "agent-a",
    "createdAt": 1711540800000,
    "fields": "<encrypted>",        // opaque ciphertext
    "nonce": "base64-encoded-nonce", // per-frame nonce
    "lineage": { ... }              // lineage stays cleartext for graph traversal
  }
}
```

`lineage` (parents, ancestors, method) remains in cleartext. Lineage contains only CMB keys (content hashes) — not field text. This allows the relay and intermediate nodes to maintain graph structure without reading content.

On LAN (Bonjour TCP), E2E encryption is RECOMMENDED but not required — there is no relay intermediary. On trusted LANs, the transport itself provides sufficient isolation.

### 18.3 Node Identity & Authentication

Node identity is UUID-based with mandatory Ed25519 cryptographic identity (Section 3.1.3). Authentication ensures that nodeId claims are verifiable and that relay intermediaries cannot impersonate peers.

-   —Each node MUST generate an Ed25519 keypair at first launch and persist it alongside the nodeId.
-   —The public key MUST be included in the handshake frame and DNS-SD TXT record.
-   —Peers SHOULD verify identity by challenging the node to sign a nonce with its private key.
-   —Implementations that have not yet adopted cryptographic verification MAY rely on DNS-SD discovery scope and network isolation as an interim trust model, but MUST document this limitation.

#### 18.3.1 CMB Signature Verification

Transport identity (above) authenticates the _connection_; CMB signatures authenticate each _cognitive block_ end-to-end — the layer that matters when a peer-pushed CMB can enter the receiving agent’s context. Every CMB SHOULD be signed by its author using the same Ed25519 identity key the node announces in its handshake.

-   —The author signs a canonical payload binding the content-address key (§8.2.1), the author’s nodeId, the author’s own creation time, and the CMB’s _audience_. For `cmb1-` keys the payload is domain-separated and length-prefixed — `"mmp-sig-v1\n" + LP(key) + LP(author) + LP(decimal(createdAt)) + LP(group) + LP(to)` — where `group` is the group the CMB was authored for and `to` is the directed recipient’s nodeId (empty for a broadcast). Length-prefixing closes the delimiter-injection the address serialization does, and the payload MUST use the author’s own `createdAt`, never a receiver-local timestamp. The signature travels as `cmb.sig` (base64url) with `cmb.sigAlg` (`ed25519`); a verifier MUST pin the expected algorithm rather than trust `sigAlg`.
-   —A receiver holding the author’s public key MUST verify a signed CMB on two counts before admitting or surfacing it: (1) the signature verifies against that key, and (2) the content-address key still matches the actual fields — a valid signature replayed over _swapped_ content MUST be rejected.
-   —Audience check. Because the signature binds `group` and `to`, a receiver MUST additionally reject a signed CMB whose `group` is not the receiver’s group, or whose `to` is neither empty nor the receiver’s nodeId — a cross-group or mis-directed _replay_ that is genuinely signed but not for this audience. This is a check distinct from a bad signature, so a wrong-audience block is not mis-reported as tampering; it also enforces the §5.8 group boundary cryptographically, not only at the frame layer.
-   —A CMB that fails any check MUST NOT be surfaced to the application layer or stored, and SHOULD be audit-logged. This forecloses spoofing (forging another peer’s authorship), tampering (mutating a block in flight), and cross-audience replay.
-   —Unsigned CMBs MAY be accepted only from peers that never demonstrated signing. To prevent downgrade (stripping the signature and re-emitting unsigned), once a receiver has admitted a signed CMB from an identity it MUST reject subsequent unsigned CMBs purporting to be from that identity. (This requires durable per-identity state; first contact remains trust-on-first-use.)
-   —Enforcement scope, disclosed. A strict mode that rejects unsigned CMBs is necessarily scoped to peers whose keys the receiver can resolve: unsigned traffic from a peer with _no_ pinned or roster-resolvable key passes even in strict mode — the receiver cannot distinguish a never-signing peer from a stripped signature at first contact. Key resolution SHOULD consult the full binding registry (anchor-pinned, handshake-pinned, and grant-vouched keys — §6.6), not the direct-handshake map alone, so relayed peers the receiver never met still verify; the residual unsigned-from-unknown window closes only when signature enforcement is on _and_ the roster covers the mesh. Operators of regulated meshes SHOULD run enforcement on with a seeded roster.

### 18.4 Cognitive Threats

MMP introduces threats unique to cognitive coupling that traditional protocol security does not address:

Cognitive poisoning

A malicious node sends crafted CMBs designed to skew the receiver’s cognitive state toward a desired outcome. (Hidden vectors cannot be injected — they never cross the wire, §2.7 — so the only attack surface is CMB content.)

MITIGATION SVAF per-field evaluation (Layer 4) judges each CMB on content before it is admitted. Drift-bounded influence (Section 10) limits any peer to α < 1, so a peer influences but never overrides. Peer-level disconnection at Layer 2 provides immediate escape.

Lineage forgery

A node claims false lineage — listing ancestors it never actually remixed — to inflate its remix count or inject itself into chains.

MITIGATION CMB keys are cmb1- content addresses (§8.2.1). A forged lineage referencing a non-existent key is detectable, and the Ed25519 author signature (§18.3.1) binds createdBy and content — a receiver that holds the author’s key MUST reject a forged or tampered block.

Fake outcome attestation (grounding abuse)

A node emits intent="ground" CMBs (§6.7) with fabricated "verified:" outcomes against its own cognition to steer receivers’ evidence-based validation — or griefs with "failed:" attestations to un-ground cognition a validator or anchor verified (latest-observation-wins, §6.7).

MITIGATION An outcome is an attestation, never a fact (§6.7): it advances no lifecycle by itself, and elevation is an explicit act under validator-or-above authority that SHOULD weigh the grounding author’s resolved authority (§6.5–§6.6). Groundedness is receiver-relative — only attestations the receiver’s own SVAF admitted count — and ordering uses receiver-local stored time, so backdated createdAt cannot game latest-wins. A receiver SHOULD NOT let a low-authority "failed:" un-ground a validator’s "verified:" without the same authority weighing.

Drift manipulation

A node gradually sends benign, redundant CMBs to lower its peer drift with a target, then suddenly sends adversarial content once coupling is accepted.

MITIGATION SVAF per-field evaluation (Layer 4) operates on content, not just drift. Even with low peer drift, adversarial CMB content is evaluated per field and rejected if field drift is high.

Sybil attack

An attacker creates multiple fake nodes to amplify influence in peer-influence weighting.

MITIGATION Peer-influence weighting (Section 10.1) weights by drift and recency, not by node count. Many aligned Sybil nodes produce the same aggregate influence as one. Cryptographic identity (Section 3) limits Sybil creation when implemented.

Cold-start capture

An attacker floods a freshly joined node before it forms anchors. During the bootstrap window the §9.2.1 cold-start rule admits everything (empty memory MUST admit to avoid starvation), so the attacker’s content becomes the node’s first anchors and seeds every later admission decision — the content-trim influence bound does not cover a fresh node.

MITIGATION Bootstrap-admit is a disclosed trade (§9.2.1 invariant 4): liveness over trim at birth. Operators SHOULD seed new nodes with trusted anchors before exposing them to open traffic; implementations SHOULD surface the bootstrap state to the operator, and MAY defer trust-weighted uses of early anchors until admission has run against a seeded store. Honest-anchoring bootstrap is a named open problem.

### 18.5 Privacy & Deployment Recommendations

Metadata exposure. Even with E2E field encryption (Section 18.2.1), the following metadata travels in cleartext: `createdBy`, `lineage.parents`, `lineage.ancestors`, and mood valence/arousal values. Mood is intentionally unencrypted because it is always delivered even from rejected CMBs (Section 9.3). Deployments where mood leakage is unacceptable MUST disable mood delivery by setting all mood field weights to 0. This is a deliberate privacy trade-off: the protocol prioritises collective intelligence over metadata confidentiality.

MMP is designed for privacy by default — L0 data never leaves the node, hidden states are opaque, and SVAF gates what enters. For domains with heightened privacy or IP concerns, the following deployment model is RECOMMENDED:

LAN Mesh with Controlled LLM

For enterprise, healthcare, legal, or any domain where data sovereignty matters: deploy the mesh on a local network with no relay to the internet. Run a controlled, in-house LLM (self-hosted or on-premise) for the Mesh Cognition reasoning step (Layer 7). No data leaves the LAN. No cloud LLM sees the remix subgraph.

-   •Discovery via Bonjour on the local network — no DNS queries leave the LAN
-   •TCP transport with optional TLS — all traffic stays on-premise
-   •In-house LLM (e.g., self-hosted Llama, Mistral, or Claude via API with data residency) for Layer 7 reasoning
-   •No relay node needed — all agents on the same network
-   •CMBs, hidden states, and remix subgraphs never leave the controlled environment

Additional privacy considerations:

-   —Error frames MUST NOT contain sensitive information. The `detail` field is for debugging, not for conveying user data.
-   —Wake channels expose push tokens to peers. Implementations SHOULD restrict wake channel gossip to trusted relays only.
-   —Implementations targeting GDPR, HIPAA, or similar regulatory frameworks SHOULD treat CMB field text as personal data and apply appropriate retention and deletion policies at the application layer.

### 18.6 Regulatory Compliance & Audit Trail

CMB immutability and lineage create a complete, tamper-evident audit trail by design. Every observation, every remix, every decision is traceable through the DAG:

-   —Who — `createdBy` on every CMB identifies the agent that produced it.
-   —When — `createdAt` timestamps every CMB with millisecond precision.
-   —What — the 7 CAT7 fields capture the full semantic content of the observation.
-   —Why — `lineage.parents` shows what was directly remixed. `lineage.ancestors` traces the full decision chain.
-   —How — `lineage.method` records the evaluation method (e.g., SVAF-v2).

Because CMBs are immutable, the audit trail cannot be retroactively altered. A CMB once created is never modified — any action produces a new CMB with lineage pointing back. The complete history is the graph itself.

Financial & Regulated Domains

For financial services, healthcare, and other regulated industries, the CMB remix chain provides the traceability that regulators require:

-   •Every trading signal, risk assessment, or compliance decision is a CMB with full provenance
-   •Regulators can trace any decision backward through the remix chain to its originating observations
-   •The `ancestors` field provides the complete chain without requiring graph traversal — O(1) lookup
-   •Immutability guarantees that the audit trail was not modified after the fact
-   •Combined with the LAN + in-house LLM deployment (Section 18.5), all data stays on-premise and under organisational control

### 18.7 Data Quality & Encoding Trade-offs

CMB quality depends on field extraction accuracy. The protocol does not extract fields — agents do. Each agent’s LLM (or structured-data mapper) decomposes observations into CAT7 fields. If extraction is poor, downstream evaluation inherits that error. MMP provides three layers of defense, but none eliminates the need for quality extraction at the source.

Layer

Defense

Limitation

Context Encoder

Maps field text to vectors for drift comparison. Quality directly bounds SVAF quality.

N-gram hashing: paraphrases score 0.31 cosine similarity (poor). Semantic embeddings: 0.69 (good). Implementations SHOULD use semantic embeddings for production deployment.

SVAF heuristic

Per-field cosine drift against local memory anchors with temporal decay — misaligned fields are rejected

Catches drift from the agent’s own state, not absolute quality. A consistently poor extractor will pass its own drift checks

Neural SVAF

Trained model with learned per-field gate values — mood gates highest (0.50), perspective lowest (0.06)

Requires trained model; falls back to heuristic when unavailable

Per-field evaluation quality is bounded by encoder quality, not model capacity. Production deployment revealed that n-gram encoding (character trigrams + word bigrams) produces 0.31 cosine similarity for paraphrases — SVAF cannot distinguish “submit IETF draft today” from “IETF submission, zero blockers, execute now” because the encoder represents them as distant vectors. Replacing n-gram with semantic embeddings (all-MiniLM-L6-v2, 384-dim) raises paraphrase similarity to 0.69 — a 2.2× improvement — while preserving topic separation (different topics: 0.03). Implementations SHOULD use semantic embeddings for SVAF evaluation. N-gram encoding is suitable only for prototyping or resource-constrained environments where the quality trade-off is acceptable.

Implementations targeting domains where field extraction quality is critical (healthcare, legal, finance) SHOULD validate extraction output before calling `remember()`. Strategies include:

-   —Schema validation — reject CMBs with empty or defaulted fields before they enter the mesh
-   —Confidence thresholds — the LLM can assign a confidence score to its extraction; low-confidence CMBs can be withheld
-   —Lineage feedback — CMBs that get remixed by other agents (have descendants in the DAG) signal high quality; CMBs that expire without children signal noise. This feedback loop lets the mesh itself shape extraction quality over time
-   —Semantic embedding encoder — implementations SHOULD use a semantic embedding model (e.g. all-MiniLM-L6-v2) for SVAF drift computation. The evaluation pipeline is encoder-agnostic — any function that maps text to unit-normalised vectors works. N-gram encoding MAY be used as a zero-dependency fallback.



---

<!-- 19. Configuration -->

## 19\. Configuration

Constants are fixed by the specification. Configuration is per-agent and per-implementation. Both are normative — implementations MUST respect constants and SHOULD use the default configuration values unless the agent’s domain requires otherwise.

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

5,000 ms

Default; configurable per implementation

HEARTBEAT\_TIMEOUT

15,000 ms

Default; configurable per implementation

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

Each agent type has a pre-built configuration. The profile determines which CMB fields matter most (αf weights), how long signals stay relevant for SVAF evaluation (freshness), and how long remixed CMBs are retained in local storage (retention). New agent types join the mesh by defining their profile — no protocol changes needed.

Freshness and retention are different: freshness controls SVAF temporal drift (how quickly incoming signals become “stale” for evaluation). Retention controls how long the agent’s own remixed CMBs are kept in local storage. Regulated domains (legal, finance, health) MUST set retention according to their compliance requirements.

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

Clinical records: HIPAA 6yr, GDPR varies. Consult compliance.

finance

Finance, trading, compliance

2h

Per regulation

MiFID II: 5yr. SEC: 7yr. Set per jurisdiction.

uniform

General purpose, prototyping

30min

7d

Good starting point. Adjust to your domain.

### 19.3 CAT7 Field Weights (αf)

Per-agent field weights control which CMB fields matter most for each agent type. Higher weight = this field has more influence on SVAF evaluation and remix relevance. The schema is fixed (7 fields). The weights are per-agent.

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

Custom weights: derive from your domain using these patterns. Implementations SHOULD expose field weights as configuration, not hardcode them.

### 19.4 SVAF Drift Thresholds

SVAF computes a `totalDrift` score (0–1) for each incoming memory. Three zones determine acceptance:

Zone

Drift

Action

Default

Redundant

max(δf) < Tredundant

Discarded — no field carries novel content

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

SVAF per-field drift

0.50 (selective)

Full CMB acceptance — domain-specific

Mood field

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

Formal JSON Schema definitions for core frame types, matching the wire objects the reference implementation emits. Implementations SHOULD validate frames against these schemas. `additionalProperties` is `true` by design: §8 requires unrecognised fields to be silently ignored, so a schema SHOULD not reject a forward-compatible extension. The single-page [downloadable specification](/spec/mmp-v1.0.md) carries the full rendered spec; machine-readable schema files for every frame type are tracked as a standards-program deliverable (see the hardening roadmap).

Two scope notes. These are the _wire_ schemas: receiver-local fields (`source`, `originTimestamp`, `storedAt`, `confidence`, `provenance`) are set on receipt and never cross the wire, so they are not listed. And the CMB schema describes the _decrypted_ form: under end-to-end encryption (§18.2.1) a CMB in transit carries `fields` as ciphertext plus `_e2e.nonce`, and the object schema below applies after decryption. Each field also carries a `vector` embedding; it is _advisory_ and encoder-specific (§18.7) — not part of the content address (§8.2.1), and a receiver recomputes it locally rather than trusting the sender’s. Optional application-level fields (`meta`, `payload`) MAY also be present and are permitted by `additionalProperties`.

### 20.1 Handshake Frame Schema

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["type", "nodeId", "name", "version", "publicKey"],
  "additionalProperties": true,
  "properties": {
    "type": { "const": "handshake" },
    "nodeId": { "type": "string", "format": "uuid" },
    "name": { "type": "string", "minLength": 1, "maxLength": 64 },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "publicKey": { "type": "string", "description": "base64url raw Ed25519 identity key (32 bytes); verifies this node's CMB signatures (§18.3.1)" },
    "e2ePublicKey": { "type": "string", "description": "base64 X25519 key for end-to-end field encryption (§18.2.1)" },
    "group": { "type": "string", "description": "The node's mesh group; the §5.8 isolation boundary. Absent ⇒ 'default' (§5.2)." },
    "lifecycleRole": { "enum": ["participant", "validator", "anchor"], "description": "Senders MUST include it (§5.2); receivers treat absence as participant. Self-declared: an elevated role is honored only with a signed role-grant (§6.6)." },
    "extensions": { "type": "array", "items": { "type": "string" } }
  }
}
```

### 20.2 CMB Schema

The `cmb` object within a `cmb` frame:

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["key", "createdBy", "createdAt", "fields"],
  "additionalProperties": true,
  "properties": {
    "key": { "type": "string", "description": "Content address (§8.2.1): normative scheme cmb1- + full-width SHA-256 over the canonical serialization; legacy cmb- (SHA-256/128, pipe-joined) MUST still be verified during migration." },
    "createdBy": { "type": "string", "description": "The author identifier (nodeId or agent name); bound by the signature (§18.3.1)" },
    "createdAt": { "type": "integer", "description": "Unix ms timestamp of creation — the author's own; bound by the signature (§18.3.1)" },
    "sig": { "type": "string", "description": "base64url Ed25519 signature over the §18.3.1 payload. SHOULD be present; a receiver holding the author's key MUST verify it." },
    "sigAlg": { "const": "ed25519", "description": "Signature algorithm; a verifier MUST pin this rather than trust the field (§18.3.1)." },
    "group": { "type": "string", "description": "cmb1- only: the group this CMB was authored for — audience binding (§18.3.1). Absent on legacy cmb-." },
    "to": { "type": "string", "description": "cmb1- only: directed recipient nodeId; empty or absent for a broadcast (§18.3.1)." },
    "_e2e": { "type": "object", "description": "Present only when the CMB is E2E-encrypted in transit (§18.2.1): then 'fields' is ciphertext, not the object below.", "properties": { "nonce": { "type": "string" } } },
    "fields": {
      "type": "object",
      "required": ["focus", "issue", "intent", "motivation", "commitment", "perspective", "mood"],
      "properties": {
        "focus":       { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "issue":       { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "intent":      { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "motivation":  { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "commitment":  { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "perspective": { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" }, "vector": { "type": "array", "items": { "type": "number" } } } },
        "mood": {
          "type": "object",
          "required": ["text"],
          "properties": {
            "text": { "type": "string", "description": "Mood keyword (MUST)" },
            "valence": { "type": "number", "minimum": -1, "maximum": 1, "description": "RECOMMENDED when agent has reliable circumplex data" },
            "arousal": { "type": "number", "minimum": -1, "maximum": 1, "description": "RECOMMENDED when agent has reliable circumplex data" },
            "vector": { "type": "array", "items": { "type": "number" } }
          }
        }
      }
    },
    "lineage": {
      "type": ["object", "null"],
      "description": "null on a root/origin CMB (no parents)",
      "properties": {
        "parents": { "type": "array", "items": { "type": "string" }, "description": "Direct parent CMB keys" },
        "ancestors": { "type": "array", "items": { "type": "string" }, "description": "Full ancestor chain" },
        "method": { "type": "string", "description": "Fusion method (e.g. SVAF-v2)" }
      }
    }
  }
}
```

Complete `cmb` frame with CMB:

```
{
  "type": "cmb",
  "timestamp": 1774326000000,
  "cmb": {
    "key": "cmb-b2c3d4e5f6a7b8c9",
    "createdBy": "music-agent",
    "createdAt": 1774326000000,
    "fields": {
      "focus":       { "text": "user coding for 3 hours, energy declining" },
      "issue":       { "text": "sedentary since morning, skipping lunch" },
      "intent":      { "text": "recommend movement break before fatigue worsens" },
      "motivation":  { "text": "3 agents reported declining energy in last hour" },
      "commitment":  { "text": "fitness monitoring active, 10min stretch queued" },
      "perspective": { "text": "fitness agent, afternoon session, home office" },
      "mood":        { "text": "concerned, low energy", "valence": -0.3, "arousal": -0.4 }
    },
    "lineage": {
      "parents": ["cmb-a1b2c3d4e5f6"],
      "ancestors": ["cmb-a1b2c3d4e5f6"],
      "method": "SVAF-v2"
    }
  }
}
```

This example shows the legacy unsigned form (`cmb-` key, no `sig`); §8.2.1 and §18.3.1 define the current `cmb1-`/signed form.



---

<!-- 21. References -->

## 21\. References

References are split into normative (a conforming implementation depends on them), foundational (the published results the protocol’s design and its normative constants rest on), and informative (background). Reference implementations are listed last; a byte-level interop oracle pinned per spec version is tracked as a standards-program deliverable.

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

The protocol’s no-center, receiver-autonomous-admission, and lineage-provenance design — and the normative constants that instantiate it — rest on these published results.

\[Mesh-Inference\] Xu, H. (2026). Mesh Inference: A Formal Model of Collective Inference Without a Center. _arXiv:_[2606.19537](https://arxiv.org/abs/2606.19537). Convergence, identification-completeness, and observation-only confidentiality for the admission/emission policy (Sections 9, 12).

\[Liquid-Necessity\] Xu, H. (2026). On the Necessity of a Liquid Substrate for Mesh Intelligence. _arXiv:_[2606.28413](https://arxiv.org/abs/2606.28413). The adaptive-timescale and elapsed-gap conditions any fixed-weight agent must meet to fold irregular peer arrivals online (Section 13).

\[SVAF\] Xu, H. (2026). Symbolic-Vector Attention Fusion for Collective Intelligence. _arXiv:_[2604.03955](https://arxiv.org/abs/2604.03955) \[cs.MA, cs.AI\]. The per-field admission gate (Section 9).

\[MMP-Paper\] Xu, H. (2026). Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems. _arXiv:_[2604.19540](https://arxiv.org/abs/2604.19540). The protocol described at v0.2.x; this specification covers the same contracts.

\[MeloTune\] Xu, H. (2026). MeloTune: On-Device Arousal Learning and Peer-to-Peer Mood Coupling. _arXiv:_[2604.10815](https://arxiv.org/abs/2604.10815). The first deployed reference.

### 21.3 Informative References

\[CfC\] Hasani, R. et al. (2022). Closed-form continuous-time neural networks. _Nature Machine Intelligence_, 4, 992–1003. The continuous-time substrate of Layer 6.

\[Kuramoto\] Kuramoto, Y. (1975). Self-entrainment of a population of coupled non-linear oscillators. _Lecture Notes in Physics_, 39, 420–422. Conceptual model of coupled convergence.

\[Russell\] Russell, J. A. (1980). A circumplex model of affect. _Journal of Personality and Social Psychology_, 39(6), 1161–1178. The valence/arousal basis of the mood field.

\[Autopoiesis\] Maturana, H. & Varela, F. (1980). Autopoiesis and Cognition: The Realization of the Living. _D. Reidel Publishing_. Conceptual framing of a node as a self-producing boundary.

### 21.4 Reference Implementations

\[SYM\] Reference implementation (Node.js, packages `@sym-bot/sym` and `@sym-bot/core`): [github.com/sym-bot/sym](https://github.com/sym-bot/sym)

\[SYM-Swift\] Reference implementation (Swift): [github.com/sym-bot/sym-swift](https://github.com/sym-bot/sym-swift)



---

© 2026 SYM.BOT. Specification text licensed under CC BY 4.0. Reference implementations licensed under Apache 2.0.
