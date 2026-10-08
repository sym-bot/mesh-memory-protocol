# Mesh Memory Protocol (MMP) v2.0

> A Mesh Protocol for Collective Intelligence
>
> **Version:** 2.0  ·  **Published:** 27 March 2026  ·  **Last updated:** 8 October 2026  ·  **Editor:** Hongwei Xu  ·  **License:** CC BY 4.0
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

**Extension documents** — published with §16, each versioned separately with its own status:

- [Extension: mesh-room-v0.2.0 (Proposal)](#mmp-extension-mesh-room)
- [Extension: room-directory-v0.2.0 (Draft)](#mmp-extension-room-directory-draft)
- [Extension: error-handling-v0.2.0 (Draft — Candidate Extension)](#mmp-extension-error-handling)
- [Extension: trust-horizon-v0.1.0 (Draft — Candidate Extension)](#mmp-extension-cmb-trust-horizon)
- [Extension: sym-attest-v1 (Draft — Candidate Extension)](#mmp-extension-admission-attestations)

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

8 October 2026

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

That is checkable rather than assertable. The constructions in [§8.8 Record Model](/spec/mmp/cmb#record) — the content address and the signature payload — were re-implemented from the text of that section alone, with no access to the reference code, and reproduced the running system’s output **byte for byte**. A specification is worth the implementations it can produce, and §8.2 has been shown to produce one.

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

**Current — 2.0 “Re-derived from the implementation” (8 October 2026):** the record model advanced in the runtime while the published text continued to describe the earlier shape, and 2.0 closes that gap. Corrected [§8.8 Record Model](/spec/mmp/cmb#record) gives the two-section record, the byte-exact content address (a promote-odd Merkle root over the seven per-category keys) and the byte-exact signature payload. The normative address form is corrected to `cmb-` + 64 lowercase hex — 1.x declared a version-tagged prefix instead, which the runtime rejects. Admission wording is corrected to per-category _evaluation_ on which the receiver decides for itself; receiver autonomy is unchanged. CAT7 members are named **categories** throughout, and the wire key is untouched.

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

2026-10-08

**MMP 2.0 update 1: the wire elements the first Core Secure runtime uses, and the §6.6 errata (2026-10-08; no version bump).** One publication of the drafts that sym 0.14.0 implements, each reviewed against that implementation and against the §6.6 rewrite, together with the §6.6 errata from its release review. The wire version is unchanged: every new frame is additive, and a node that does not know one ignores it (§7). What each part adds:

-   **§6.6 errata.** The first implementation built to §6.6 resolved exactly as the reference does, and its review found gaps in what the section asked of a node around resolution. The signature entries of one statement now have unique keys, a shape rule checked before any signature work, so a copy cannot buy repeated checks under a pinned key. §6.6.8 states one budget rule: every statement a session delivers spends that session’s budget, asked for or not; the asker paces its pulls, pages and fetches to absorb a full page, so nothing it asked for is dropped; pending room is checked before a pending statement is verified; a pull resumes from its cursor and anti-entropy repeats with backoff while roots differ; and a by-id answer is a closure, the namers of namers to a fixpoint. §6.6.12 no longer claims that the pending limits bound fresh-key work. A node at its storage limit drops what is outside its live set first, then live statements in reverse authority order, and never drops an in-force revoke or an in-force anchor-level statement; it protects what is in force, not a kind of statement, so removals first stays true and the protected set stays bounded by the quotas. A node keeps what it holds across a re-pin and judges it again, and a node with no pin takes no part in authority exchange. The `mood` frame is registered: `{ type, mood, context, timestamp }`, mood at most 1,024 characters and context at most 4,096, with no sender fields and no valence or arousal; it is sealed on a Core Secure session, attributed to the session’s proven nodeId and name, and never stored, relayed or remixed.
-   **§9.2.2/§4.4.4 a CMB’s binding comes from its signed `metadata.to` (was draft #24).** The relay envelope’s `to` is routing only; the binding is the record’s signed audience, bound into the sealed frame’s associated data: null is room-bound, the receiver is directed, anyone else fails the audience check. A nodeId has one lowercase spelling, compared exactly, in records, statements and the handshake hello alike; a directed record older than the receiver’s de-duplication window _may_ be refused as a replay; the unsigned-field rule is stated for Core Secure, and Legacy Import keeps its own.
-   **§4.4.4 relay fan-out envelope, and relay-auth `room` and `engine` (was draft #25).** A relay that lists `fanout` in the new `relay-peers` `features` accepts `{ fanout: [{ to, payload }, …] }`: one client message, counted once toward the rate limit, each entry delivered as a unicast, with nothing in the delivered bytes revealing the others. Relay limits are floors a relay must allow (§19.1: 25 messages a second, a burst of 300, 64 entries, and a 4,096-byte delivered allowance), not advertised values, and a sender keeps headroom below them. A relay never delivers a message over the allowance, even after re-serialising it, and drops a malformed unicast; in every form the payload is a JSON object. A `to` that is not a lowercase nodeId makes an envelope malformed; a sealed frame is never broadcast. `relay-error` carries `kind`, `code` and `reason`, and acting on `code` is optional. 4008 and the WebSocket closes 1001, 1009, 1011 and 1013 join §4.4.9. `relay-auth` gains `room` (addressing, never permission) and `engine` (a log label, never forwarded), and its nodeId is lowercase.
-   **§15.5 collapsed integration and §5.1 one discovery service type (was draft #17).** When integration produces the incoming text unchanged, the receiver mints nothing, _may_ keep the author’s record exactly as signed, and never attributes it to itself; the §15.8 tether and the §15.7 emission gate do not apply, and §17.2 is aligned. One DNS-SD service type, `_sym._tcp`, carries every room, with the TXT `room` now required (a per-room service type cannot carry the room identifiers §5.8 allows); the round-trip ownership exclusion is removed. During migration a node browses the per-room type only where it is a valid RFC 6335 service name, to reach 2.0 nodes that still advertise one, and must refuse a room mismatch both ways before advertising `_sym._tcp` for a named room.
-   **§5.1 the TXT `mmp` profile marker (was draft #22).** Legacy and Core Secure nodes share one service type, so a Core Secure listener lists its versions in TXT `mmp`, a comma-separated list that is `mmp=2.0` today. A record without it is a legacy advertisement and is never dialled under another profile except through a configured Legacy Import route; a 2.0 listener closes a legacy one-frame handshake at once, bounding the work and logging it spends per remote address. TXT keys compare case-insensitively and the first occurrence wins (RFC 6763 §6.4). The marker is an unauthenticated hint: stripping it denies discovery, never downgrades a profile.
-   **§7.1/§18.2.1 sealed control frames, `control-encrypted` (was draft #26).** On a CONNECTED Core Secure session every peer frame that is not a record travels sealed: records in `cmb-encrypted`, everything else (peer-info, wake-channel, mood, cmb-fetch, cmb-fetch-result, the four authority frames, error, extensions) as the inner frame of `control-encrypted`, under the same traffic keys and the same per-direction sequence, with its own AAD domain, `mmp-aead-control-v2`. ping and pong may go either way, and a sealed ping is answered with a pong. A clear error may be read but changes nothing; a sealed error with a Close action ends the session. A frame that opens advances the sequence, and refusing its inner frame changes nothing else. Authority statements are verified by §6.6.9 and §18.3.2, never by a registry or session key; records and an extension’s signed frames by the receiver’s binding for the nodeId they name (§3.4). A sender never seals a record from another room or for another recipient. A fetched record is matched by its recomputed cognition key and attributed, delivered or admitted only after full §8.8.5. `cmb-fetch` names no sender and `cmb-fetch-result` has no timestamp. The envelope has its own schema, `control-encrypted.schema.json`, and a new vector, `control-encrypted-v2`.
-   **§9.4 `cmb-anchors` and replayed context (was draft #30).** The first sealed frame a node sends on a Core Secure session after admitting it is `cmb-anchors`, naming the records it is about to replay as context, or `keys: []`. It replays only its own `mmp-sig-v2.0` records that it may seal into that session, at most 50 named and 5 recommended, and a non-empty list at most once a minute per peer. A receiver may mark a listed record as replayed context only when its signed author is the session’s proven peer; the frame never changes verification, admission or weight. A relay client takes it as the sign that its server holds the new session (§5.2.2). This replaces the earlier runtime’s unsigned `_anchor` flag.
-   **§5.2.2 the handshake over a relay (was draft #23).** Over a relay, where both peers dial and neither listens, the smaller nodeId is the client. A relay session is the §5.2 exchange carried in addressed envelopes, never broadcast, accepted only from the session peer’s `from`; a re-announced peer is probed with `ping`, not re-handshaked. An unconfirmed hello changes nothing. Supersession needs proof both ways: the server supersedes when it admits the new session and sends the mandatory sealed `cmb-anchors`, and the client supersedes only once a sealed frame other than an error opens on the new session, abandoning the new session and keeping the old after the handshake timeout. A replay is discarded on every transport; a gap must close the session, after a sealed 1010 `SESSION_CLOSED` where it can; a sealed error with a Close action ends the session, a clear one changes nothing, a failed handshake _may_ send 1006 or 1007 in clear, and 1009 is sent sealed and never retried automatically. New error 1011 `UNKNOWN_SESSION` answers a frame for a session the receiver does not hold, limited per sender and overall, and prompts a re-handshake only when it names the client’s session or answers its probe, and the client is not already waiting on a newer session. 1008 is retained but no longer sent.
-   **§5.8.1 the `room-join` frame (was draft #31).** A grant for a gated room is presented inside the confirmed session, as a sealed `room-join` sent first on every new session by a node that holds one, so the key it binds is compared with the key the session proved. The owner’s nodeId and key are pinned out of band and selected by room, never by the grant; the owner is recognised by both together. The receiver checks the schema first (integer times), verifies under §18.3.2, and requires its room, `grantedBy` the owner, the proven nodeId and key, the 24-hour cap, and validity within 5 minutes of skew either way. It decides admission before the session’s next frame, closes a session that presents no grant within the handshake timeout, and closes an admitted session when its grant expires. The implementation note now names the frame `room-join`.
-   **§8.8.6 record size limits (was draft #37).** A category’s text is at most 262,144 UTF-8 bytes after NFC, the seven together at most 524,288, and the encoded record at most 737,280 bytes, measured as the length of its RFC 8785 serialization (which is the `JSON.stringify` length in any member order, and not what an encoder that escapes non-ASCII writes), so that a record always fits one sealed frame. Emitters never mint an oversized record; receivers refuse one before any other work, and refuse a sealed value over 983,062 characters before opening it. A fetch responder bounds the record bytes it queues per session. New vector `record-size-v2`; the stale implementation note is corrected.
-   **§8.8.4/§8.8.5 carried but unsigned record members, and the canonical signed projection (was draft #34).** `meta.key` is recomputed from the signed text and a mismatch refused; `valence`, `arousal` and `lineage.method` are unsigned, optional and dropped by a Core Secure verifier, which keeps only the signed projection. Objects are closed and types never coerced, except that an unrecognised category is allowed and dropped; an embedding vector is refused, amending §9.2.1. Every nodeId is lowercase. Signed strings (category text, `createdBy`, `room`, `application.schema`) must already be NFC, and a non-NFC value is refused. `room` is a §5.8 identifier; `createdBy` is at most 256 code points, and parents at most 256 entries of 256. The projection is canonical: parents sorted bytewise, an empty lineage and an absent application are null. §8.2.1 now states `categoryKeyV1` and `blockKeyV2` byte-exactly. New vector `record-projection-v2`.
-   **§15.7/§14.3 a record that cites its parent is not thereby a remix (was draft #35).** A remix is defined by how it was produced: output that integrates an admitted peer record, whichever API emits it. The §15.7 gate applies to that path and never to a record because it carries parents or a label; the agent’s own observations, replies, trail decisions and outcomes are authored, and `remember()` is named only as an example. Receivers cannot see the path, so a receiver must not skip or refuse a record because its lineage cites the receiver’s own records, and may keep it out of its own remix cycle. A paraphrasing reply is bounded only by the receiver’s redundancy band and budgets. §15.7.2 (a grounding is authored, not a gated remix), the §14.12 completion sentence and the §15 summary are aligned.
-   **§16.4 the `sym-attest-v1` extension, Draft Candidate (was draft #27).** The wire form of the §17.2 admission attestations, negotiated and sealed in `control-encrypted`: a signed attestation per gated record, chained per attester; checkpoints, each chained to the previous root so none commits over a suffix; witness co-signatures that carry the witnessed range; and unsigned node statistics. Two checkpoints with overlapping ranges or one `prev` prove a fork, whatever boundaries the attester cuts; a checkpoint that does not start right after its `prev` is malformed; after a conflict a node witnesses that attester no more. A witness is not signed by the attester, so overlapping witnesses are a lead, never equivocation evidence; a witness that contradicts a held checkpoint is evidence against the witness. An attester that loses its segment ends its chain visibly. Duplicates are judged by content; an equivocating checkpoint is relayed once as evidence, and an earlier witness stands. A draft vector, `sym-attest-v1`, pins it all. Only the session budget is spent before verification, the global ceiling after. A closed schema (`sym-attest-frame.schema.json`) fixes the token grammars, lowercase nodeIds and exactly seven verdicts. Nothing is attested about Legacy Import records, and no attestation about a directed record is sent or relayed. Weights follow §6.6.9 and §6.6.10, matched by `assertionId`, and tallies are not Sybil-resistant. §17.2 exposes attestations to peers only through this extension, without making it mandatory.
-   **§14.12 a member is a node; a work session is a trail (was draft #28).** A work session has no mesh identity of its own: the persistent node that works it authors its trail under its own nodeId, and must not mint an identity per session, so coupling and the authority that follows its key (§6.6.9) carry across sessions. Each trail starts at a charter, and a walk stops at the first charter of the node it reaches. An entry’s trail predecessor is its one parent that is the node’s own entry on that trail. Entries are content-addressed, so the node names the trail in every entry, the charter included, by a label unique across nodes. A node may hold several open trails; concurrent independent agents are separate nodes.

2.0

2026-10-08

**§6.6 authority by reference: grants, revokes and endorsements resolved as a set (2026-10-08; no version bump; replaces the `role-grant` and `role-revoke` frames with four `authority-*` frames; adds the authority-v2 and ed25519-strict-v2 vectors and ten §19.1 constants).** §6.6 resolved a role at a time _T_ by replaying grants and revokes in the order of times their signers chose, with delegation at any depth, gossip in any order and cascading revocation. That is consensus without a consensus mechanism, and the reference runtime’s implementation of it failed three independent reviews on exactly that: arrival-order divergence, backdated revokes, flooding and eviction of honest records, and exponential resolution of cyclic revoke patterns. Authority is now a function of the set of verified statements a node holds, and no timestamp takes part. A grant, a revoke and an endorse are each identified by the SHA-256 of their canonical signed bytes (`mmp-authority-v1`), and each names the grant it is made under (`authorisedBy`) and its targets by those ids, so the statements form a DAG. A revoke removes a grant when its signer is the anchor or stands above that grant on its chain. An endorse keeps grants and revokes alive once a revoke has cut them off, never what a quota dropped, and never restores their signer; its bucket keeps what it rescues, against its own quotas. Resolution runs depth by depth in linear time. Each grant’s bucket keeps at most 256 statements, revokes and endorses first, by ascending id, and at most 16 delegating grants, so no signer can displace another, and at most 69,888 statements can be in force below a compromised depth-1 holder, which the section proves. The anchor is a pinned key set with a threshold; a single key is the 1-of-1 case. Delegation stops at depth 4 (anchor, deployment admin, world admin, seat issuer, seat). New roles: `admin` takes over the granted anchor role, and `issuer` admits nodes with no lifecycle authority. A grant may carry a scope, an opaque path compared exactly and never normalised, which only narrows down a chain and limits lifecycle authority to CMBs inside it. Every node verifies statements by one Ed25519 rule (§18.3.2: canonical encodings, keys and _R_ of prime order, _S_ < _L_, cofactorless), and a nodeId is signed in its one canonical form. Anti-entropy is set union, compared by an authority root over the in-force set and the pin, which an environment records, with its live set, to bind a run or a decision to the authority it was taken under. Outcomes that must be agreed are decided once by their environment; mesh weights are judged by the receiver when it applies them, inside a deterministic run against the root of the tick. Migration is a flag day: anchor grants are re-issued one for one and deeper chains within the cap, 0.13 grant entries stay legacy claims, and the revoke cutoff and every time rule are removed. This supersedes drafts #21, #32, #33 and #36.

**§3.4/§5.2 identity conflict (carried from draft #21; adds error 1009).** The specification said nothing about a bound nodeId presenting a different proven key, and contradicted itself on a same-key one: §3.4 closed a second connection for a nodeId with 1005, §4.6 required it to be kept as a second path, and §4.4.7 let the relay replace the first. §3.4 now binds each nodeId to one key, from a handshake, the anchor, an in-force grant or an operator-accepted pin, and no source overrides a different key. A session that proves a different key for a bound nodeId is an identity conflict: closed with the new error 1009 `IDENTITY_CONFLICT`, recorded with both keys, reported to the operator, and resolved only by an operator act. A conflict changes bindings, never authority. A session that proves the bound key is the same peer and is never refused as a duplicate: on another transport it is a second path, and on the same transport a newer confirmed session supersedes the older. 1005 remains for Legacy Import only.

2.0

2026-08-09

**Re-derived and corrected as an executable contract.** 1.0 and 1.1 were implemented and interoperating across Windows, macOS and iOS, over LAN and relay. What changed is that the runtime’s record model advanced — a two-section record, a Merkle-derived address, a new signing payload — while the published text continued to describe the earlier shape. Every normative clause below was re-checked against the public specification, schemas, vectors and running implementations. Where they disagreed, v2.0 now rules the construction explicitly and publishes executable evidence; no runtime is treated as normative merely because it shipped first.

**§8.8 Record Model — corrected v2.0 contract.** The record is **two-section**: `categories` carries CAT7, `metadata` carries the address, author, timestamp, audience and descent. 1.x described a flat record with `createdAt` at the top level; the runtime has never emitted that shape. §8.8.2 gives the byte-exact **cognition address** (per-category keys under a domain tag, combined by a _promote-odd_ Merkle root — never duplicate-the-last, which silently yields a different address) and §8.8.4 gives the byte-exact **signature payload** (uniformly length-prefixed, audience-bound, with per-category descent committed alongside the root rather than inside it, so identical observations still collapse to one address).

**Address form corrected.** 1.x declared a version-tagged address prefix as normative. The runtime _rejects_ that form: a key is valid _iff_ it is `cmb-` plus exactly 64 lowercase hex. An implementation built to the 1.x text would have minted keys every deployed node refuses — interoperation failure from following the specification.

**Admission wording.** The receiver evaluates each of the seven categories against its own anchors and then decides locally what to accept. 1.x called this “per-field admission” and described an admission outcome per category; measured against the runtime, the per-category step is _evaluation evidence_ and the receiver makes one whole-record admission decision. **Receiver autonomy is unchanged and unqualified** — no sender and no coordinator can force admission of anything.

**CAT7 terminology.** The seven members are **categories** throughout, replacing mixed use of “dimensions” and “fields” in prose. A category is the semantic member; a dimension is the length of the vector encoding it. The wire key is `categories` too — prose and wire now use one word. It never enters an address or signature preimage, so the rename moved no address and invalidated no signature.

**Single-file artifacts** are now `/spec/mmp-v2.0.md` and `.html`. `mmp-v1.0.*` remain published, frozen, for existing citations.

**§5.8.1 Room Admission added (2026-09-16; no version bump).** The room-join grant existed in the reference runtime and in no version of this specification. §5.8.1 states it: a gated room has one owner; a grant binds room, grantee, grantee key and expiry under one signature; a grant binding no key is a bearer token and MUST be refused; the bound key MUST be compared against a key the peer PROVED, and refused when no proof exists; the 24-hour lifetime cap MUST be enforced by the verifier, because revocation is live gossip with no replay and the lifetime therefore IS the offline exposure.

One clause is new to both the specification and the implementation, and it came from outside this document. A simulation built against MMP found a node publishing into a room it had never joined; reading the reference runtime for the same shape found it there too, arrived at independently — admission was decided from the handshake and every other frame was dispatched on trust. So the door is now **consulted per frame, not once per greeting**: a receiver MUST record its admission decision and consult it on every content-bearing frame, and MUST NOT process content from a peer for which no decision was ever made while the room is gated. Handshake frames are exempt or a grant-holder could never join; liveness frames MAY be answered.

The section also states what admission does NOT do. Consent to hear is not consent to believe: every admitted record is still evaluated by SVAF (§9.2) and membership confers no standing there. And in an ungated room there is nothing to enforce — declaring the room IS membership — so an interface reporting a room's gating MUST distinguish _ungated_ from _not determined_. No shipped deployment gates a room, so no existing implementation becomes non-conformant; the gated-room deployment remains untried and the section says so.

**Terminology: group → room, completed (2026-09-16; no version bump).** The core renamed this concept to _room_ on 13 August, but only where the text was being rewritten: the handshake block and §5.8's body moved, while §5.8's heading still read "Mesh Groups", the §5.2 field table still listed a `group` field the published schema does not define, and §5.9, §4 and the glossary still said group. Those are corrected. The two extensions were the last documents in the old vocabulary and are renamed with them: `mesh-group-v0.1.0` → `mesh-room-v0.2.0` and `group-directory-v0.1.0` → `room-directory-v0.2.0`, including their identifiers (`group_id`, `groupId`, `group_label`, `group_token` and the Bonjour service type). Nothing implemented the old names, so they are superseded rather than aliased. The previous URLs redirect.

**v2.0 conformance errata (2026-09-14; no version bump).** Ed25519 signature bytes are excluded from the reproduction requirement in §17.4 and §20.3: WebKit and Apple's CryptoKit both sign with added randomness, so a correct implementation returns different valid bytes on every call and a suite asserting byte equality fails on Safari and on every browser on iOS. Pinned signatures — `expectedSignature` and the handshake proofs — are for VERIFICATION, never reproduction; every other pinned value remains deterministic and must reproduce exactly. The §17.5 release criterion claiming Node and Swift reproduce identical signature bytes is withdrawn, having been measured unmeetable. On the unencrypted CMB frame, `protocolVersion` and `timestamp` are now OPTIONAL rather than required: the protocol version is agreed once in the authenticated §5.2 handshake and carried in a signed transcript, and the mandatory timestamp is `metadata.createdTimestamp` inside the record, which the signature covers.

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

Layer 6 renamed “XMesh” → “Cognitive State” to disambiguate from the XMesh runtime (naming note §1, §13; wire identifiers incl. xmesh-insight unchanged; published papers retain the legacy “XMesh (L6)” label). Normative additions, backward-compatible with the v1.0 contracts: §9.2.1 specifies δf as an admission _interface_ — anchors-only baseline (incoming block excluded), cold-start non-evaluable-category exclusion + bootstrap-admit — ruling out self-referential collapse and cold-start starvation. §9.2.2 specifies the directed (peer-bound) vs autonomous (group-bound) delivery contract, separating delivery from memory admission: directed CMBs (§4.4.4 `to` = receiver) surface unconditionally; rejected broadcasts do not surface (mood excepted, §9.3). §18.3.1 specifies CMB signature verification (Ed25519 author signature + content-address integrity; forged/tampered blocks rejected) as the end-to-end authenticity layer above transport identity.

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

Layer 6 was called XMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State. The name _XMesh_ now refers to the product runtime — the reference implementation of the receiver side; the open substrate SDK is SYM, and the protocol itself is this open specification. The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

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

A node whose interior is a sub-mesh. It participates in its interior room as an ordinary node and presents a boundary to exterior gateways; what crosses is its own lossy CAT7 projection of admitted interior cognition, never a relayed interior frame (Sections 5.9–5.11).

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

Lifecycle roles (participant → validator → admin) conferred by signed, revocable grants under a pinned anchor key set. A node’s role is resolved from the set of authority statements it holds, linked by hash and read without clocks, never taken from its advertised handshake role (Sections 6.5–6.6).

Mesh Cognition

The agent’s LLM reasoning on the verified remix subgraph reached by following direct parent links, generating understanding that the agent’s previous state of mind did not have. Spans Layers 4–7. See Section 2.5.

Cognitive State

Layer 6 — each agent’s own Liquid Neural Network (LNN). Evolves continuous-time cognitive state from Synthetic Memory input. Fast τ neurons track mood; slow τ neurons preserve domain expertise. (Called XMesh in v0.2.x drafts and the published papers — see the §1 naming note.)

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

On the wire, the nodeId MUST be encoded as a lowercase hexadecimal string with hyphens (e.g., `0192e4a2-7b5c-7def-8a3b-9c4d5e6f7a8b`). A nodeId has that one spelling: a receiver compares nodeIds exactly, and a nodeId in any other spelling in a signed field (a record’s `createdByNodeId` or `to`, a handshake hello’s `nodeId` (§5.2), an authority statement’s subject) makes that record, statement or handshake malformed (§8.8.5, §5.2, §6.6.3), because the bytes signed are exactly those characters. A nodeId read from an unsigned local source, such as configuration or a Legacy Import store (§17.3), MAY be lowercased before it is compared. Existing nodes with UUID v4 identities MAY continue to use them — peers MUST accept both v4 and v7 formats.

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

Same nodeId, same proven key (restart, a second transport, a second copy of the identity)

One peer: a session on another transport is a secondary path (§4.6); a newer confirmed session on the same transport supersedes the older one (§5.3)

The binding is unchanged; no error is sent

Same nodeId, different proven key (a squatter, or a key replaced without a new nodeId)

Identity conflict: refused (error 1009), recorded, reported to the operator

The existing binding stands; nothing is learned from the refused session

MMP does not define an _identity_ rotation or revocation mechanism: a node whose _key_ is compromised MUST generate a fresh identity (new nodeId and keypair), and the old identity becomes permanently orphaned. This is distinct from withdrawing a node’s _authority_ — that is a revoke statement (§6.6.5), which needs no new identity and takes with it everything the removed grant authorised. Implementations SHOULD document the identity limitation to operators.

One key per nodeId, bound once. Because the key never rotates, a receiver binds each nodeId to exactly one Ed25519 identity key. A binding comes from one of: a confirmed handshake (§5.2), the pinned anchor (§6.6.1), an in-force grant that names the nodeId with its key (§6.6.9; such a binding lasts only while that grant is in force, and never covers the receiver’s own nodeId), or an out-of-band pin the operator accepted (an invitation or configured route that names the nodeId and its key). Discovery records, relay data and unproven hellos never bind (§18.3). A legacy claim — a key that a pre-0.14 implementation recorded for a nodeId from an unproven hello or from a grant — does not bind either: it is the key the receiver expects for that nodeId, so a session proving it binds it and a session proving a different key is an identity conflict, but by itself it verifies nothing and confers no authority (§6.6.11). A binding from any source MUST NOT be replaced by a different key from any other source — not by a later handshake, not by a grant, and not by a source ranked stronger. Sources differ in what they may _create_, never in what they may _override_.

Identity conflict. When a session proves, or an in-force grant names, a key for a nodeId that is already bound to a different key, the receiver MUST refuse it. It MUST close the session with error 1009 (`IDENTITY_CONFLICT`, §7.2), or, for a grant, leave the binding as it is; it MUST NOT create or change any per-peer state for the refused key — keys, session or E2E secrets, room admission, attribution, budgets; it MUST record the conflict (the nodeId, both keys, the source of each and the time); and it SHOULD report the conflict to its operator. An implementation MUST NOT resolve a conflict by itself — not by recency, not by source rank, not by how many peers agree. Only an operator act resolves one, and the act is explicit and recorded. Re-pinning a fresh anchor out of band (§6.6.1) is such an act: the configured anchor is configuration, not a learned binding.

A conflict changes bindings, never authority. Authority is resolved from the statement set alone, with each signer’s key taken from the grant that authorises it (§6.6.9), so every node resolves the same in-force set whatever keys it has bound. A grant whose key conflicts with a binding stays in force, and confers nothing at that receiver on the bound key: no record that verifies under the bound key is signed by the grant’s key.

The refusing side sends error 1009 and then closes. The refused side MUST NOT retry automatically: a retry presents the same key and meets the same refusal, and a retry loop is noise in the record the operator must read. It SHOULD report the refusal to its own operator, since either party may be the one whose key is wrong.

A conflict is recorded only once the different key has been _proven_: the receiver SHOULD complete the proofs of §5.2 before it refuses, so that what it records is a key someone holds and not a claim someone typed. A hello that merely names a different key MAY be dropped at once without a record, and it MUST NOT disturb an existing session for that nodeId.

The same key is the same node. A confirmed session that proves a nodeId’s bound key MUST NOT be refused as a duplicate, on any transport. Duplicate detection happens only after both proofs, and an unproven hello naming a connected nodeId is evidence of nothing. Two live processes holding one identity cannot be told apart by any proof; each of them is the node, which §3.2 forbids deployments to arrange. An implementation SHOULD report repeated supersession between concurrent sessions for one (nodeId, key) as a probable copied identity. The relay’s replacement of a connection (§4.4.7) is a routing decision about which WebSocket carries a nodeId’s frames; it decides nothing about identity at an endpoint, which applies this section to the sessions it confirms. Error 1005 is retained for Legacy Import, where nothing is proven; Core Secure does not send it.

### 3.5 Node Lifecycle Role

Each node has a `lifecycleRole` — participant (default), validator, admin, or the anchor — that determines which CMB lifecycle transitions it may perform. A role is earned, not asserted: its authority MUST be resolved from the in-force grants that name the node’s nodeId and key (§6.6), and the anchor is pinned, never granted (§6.6.1). The `lifecycleRole` a node advertises in its handshake is a discovery hint only; a receiver MUST NOT treat the advertised role as authority (see §3.5.1).

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

issuer

No

CMBs (observed), remixes; grants of non-authority roles such as seats (§6.6.2)

observed, remixed

admin

No

CMBs, remixes, validation CMBs, canonization CMBs

observed, remixed, validated, **canonical**

anchor

No

CMBs, remixes, validation CMBs, canonization CMBs (as the author of a CMB only under a threshold of 1, §6.6.1)

observed, remixed, validated, **canonical**

Only a node whose _resolved_ role (§6.6) is validator or above may advance another CMB’s lifecycle to `validated`; `canonical` is reserved to a resolved admin or the anchor, and a scoped grant confers either only on CMBs inside its scope (§6.6.2). An issuer admits nodes and confers no lifecycle authority. A receiver MUST resolve the author’s role against its in-force set (§6.6) — never the `name` field or the advertised handshake role — and MUST ignore, for lifecycle advancement, any validation CMB whose author does not resolve to the required role (the CMB is still stored as a normal remix). This applies equally to any authority-weighted treatment: a CMB’s admission weight (§6.4) derives from the author’s _resolved_ role, so a self-advertised role confers no elevation.

### 3.5.1 Role Progression

Lifecycle roles are not static. A participant node MAY be promoted to validator by an admin or the anchor. Promotion is a signed grant statement (§6.6.3), not an out-of-band configuration change.

Transition

Granted by

Conditions

participant → validator

An admin or the anchor

Node has produced CMBs that were remixed by peers (demonstrated quality). The granting signer issues a `grant` statement naming its own authority (§6.6.3).

validator → admin

An admin or the anchor

Node has validated CMBs that reached canonical state. Track record of quality validation. Within `MAX_DELEGATION_DEPTH` (§6.6.2).

Bootstrap (root of trust)

Out-of-band pin

The `anchor` is pinned out-of-band as a key set with a threshold (a single nodeId + public key is the 1-of-1 case), not self-declared — an unverifiable “first node wins” is a partition/eclipse hole. All other authority descends from it by grant (§6.6.1).

Promotion is upward (participant → validator → admin) and demotion is defined: a `revoke` statement (§6.6.5) removes a grant, and everything the removed grant authorised is dead unless a signer above it endorses what should stand. Role revocation is distinct from _identity_ compromise: a node whose signing _key_ is compromised still MUST generate a fresh identity (§3.4) — key rotation is not defined here — whereas a node whose _authority_ is withdrawn is handled by a `revoke` without a new identity.

A `grant` statement is signed by its grantor over its kind, the authority it is made under (`authorisedBy`: the grantor’s own grant, or the anchor), the subject’s nodeId and key, the role and a nonce, and over no time that resolution reads (§6.6.3). A receiver MUST verify it with the key of the grant it names (or the pinned anchor keys) and treat it as in force only as §6.6.4 resolves it; a grant its signer was not permitted to make is invalid and discarded. Authority never rests on a self-asserted field; it is a signed fact resolvable to the root of trust. See §6.5–§6.6 for the full lifecycle.

### Q&A

Why UUID v7 instead of v4?

UUID v7 (RFC 9562) provides the same global uniqueness and privacy properties as v4, with an additional benefit: time-ordering. The embedded timestamp aids log correlation, debugging, and determining which node was created first — without revealing device identity. The 74 random bits provide sufficient collision resistance for any practical mesh size.

Why not use the public key hash as the nodeId?

Self-certifying identifiers (nodeId = hash of public key) are elegant but create a hard coupling between identity and key material. If the keypair needs rotation (algorithm upgrade, key compromise), the nodeId must also change, breaking all peer references and lineage chains. Separating nodeId from keypair allows future key rotation without identity disruption.

Why must every agent be its own node?

Coupling is per-node. SVAF category weights (αf) are per-node. Memory stores are per-node. An agent that shares another node’s identity inherits that node’s coupling decisions — it cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent on the same device need different category weights, different coupling thresholds, and different memory stores. They must be separate nodes.

What happens when two nodes have the same nodeId?

It depends on the key they prove, and nothing is decided before they prove one (Section 3.4). Two sessions that prove the same key for one nodeId are the same node: a second transport is a second path to it, and a newer session replaces an older one, so a restarted node is never locked out by its own stale connection. A session that proves a different key for a nodeId already bound to a key is an identity conflict: it is refused with error 1009, the existing binding stands, and the conflict is recorded and reported to the operator, who alone resolves it. This prevents impersonation and ensures each nodeId maps to exactly one key.

Why is Ed25519 mandatory?

Without cryptographic identity, any node can claim any nodeId. A relay could impersonate peers (MITM), and peer gossip (Section 5.6) would propagate unverified claims. For autonomous AI agents making coupling decisions, authenticated identity is foundational — not optional.

Why are lifecycle roles identity-bound, not content-based?

If validation authority were determined by content (e.g. perspective category containing "founder"), any agent could spoof it. Binding roles to cryptographic identity, a nodeId together with its key, means only nodes that an admin or the anchor has granted a role can advance CMB lifecycle. The mesh knows who validated, not just what was said.

Why is role progression earned, not configured?

An agent that produces quality remixes — remixes that other agents cite and build upon — has demonstrated value to the mesh. Granting validation authority to such agents is a natural extension of their demonstrated competence. This prevents arbitrary role assignment and creates a meritocratic trust hierarchy that emerges from mesh activity.

Can a participant node dismiss a decision?

A participant can produce a CMB with lineage pointing to a decision, but receiving nodes MUST NOT treat it as validation. The CMB is stored as a normal remix — it does not advance the parent CMB’s lifecycle. Only nodes with validator role or above (validator, admin or the anchor) can validate or dismiss decisions in a way that removes them from the decision queue.



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
  "timestamp": 1711540800000,
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
  "room": "<room identifier>",
  "engine": "<implementation label>",
  "wakeChannel": {
    "platform": "apns",
    "token": "<push-token>",
    "environment": "production"
  }
}
```

-   —`nodeId`, `name`: MUST be present; a missing one results in close code 4002. `nodeId` is the lowercase form of §3.1.1; a relay MUST refuse any other spelling with 4002.
-   —`token`: SHOULD be present if the relay requires authentication. Invalid token results in close code 4003.
-   —`wakeChannel`: MAY be present. Registers push notification credentials for waking this peer when offline (§5.7).
-   —`room`: MAY be present: a room identifier (§5.8; absent means `default`). A relay that scopes routing, roster, presence and fan-out by room uses it to address the connection. It is addressing, never permission: the channel token stays the boundary, and the §5.8 checks at each endpoint still apply.
-   —`engine`: MAY be present: an implementation label of at most 32 characters, for the relay operator’s logs. A relay MUST NOT forward it.

On success, the relay registers the connection, sends a `relay-peers` response, and broadcasts `relay-peer-joined` to all other clients on the same channel.

#### 4.4.2 Peer List

Immediately after authentication, the relay sends the current peer list:

```
{
  "type": "relay-peers",
  "peers": [
    { "nodeId": "<uuid>", "name": "<name>", "wakeChannel": {...}, "offline": false }
  ],
  "features": ["fanout"]
}
```

The array includes all connected peers on the same channel (excluding the requester) plus offline peers with registered wake channels (`offline: true`). Clients SHOULD treat each non-offline entry as a peer-joined event.

`features` MAY be present. It lists the optional relay behaviours this relay implements; the one defined here is `fanout` (§4.4.4). A client MUST ignore a feature it does not recognise, and MUST NOT use a feature the relay did not list on that connection. An absent `features` lists none.

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

If `to` is present, the relay forwards to that peer only. If absent, the relay broadcasts to all peers on the same channel. A sealed frame (§18.2.1) is sealed for one session, so a sender MUST send it with `to` or in a fan-out, never as a broadcast: a broadcast sealed frame reaches peers that cannot open it. `to` is a nodeId in the lowercase form of §3.1.1; an envelope whose `to` is anything else is malformed. A relay drops a malformed unicast envelope without delivering it, and MAY answer it with a `relay-error`. The relay adds `from` and `fromName` to forwarded frames. The relay MUST NOT route frames across channels.

Fan-out. A sender that holds a separate session with each recipient (§18.2.1) seals one frame per recipient, so a room broadcast to _N_ peers is _N_ frames. A relay that lists `fanout` in `features` (§4.4.2) also accepts a fan-out envelope, which carries them in one client message:

```
{ "fanout": [
    { "to": "<nodeId-1>", "payload": { "type": "cmb-encrypted", ... } },
    { "to": "<nodeId-2>", "payload": { "type": "cmb-encrypted", ... } }
] }
```

-   —Shape. An envelope carries exactly one of: `to` with `payload`; `payload` alone; or `fanout` alone. `fanout` is a non-empty array of entries, each with exactly a `to` nodeId, in the lowercase form of §3.1.1, and a `payload` frame; a `to` that is not one makes the whole envelope malformed. In every form, `payload` is a JSON object (a frame). A sender MUST NOT name the same recipient twice in one envelope, or itself. A relay MUST refuse a malformed fan-out envelope as a whole and deliver none of it, answering with a `relay-error` whose `kind` is `fanout` and whose `reason` is one of `malformed`, `too-many-entries`, `duplicate-recipient` or `self` (§4.4.9).
-   —Delivery. The relay delivers each entry exactly as it would deliver a `{ to, payload }` envelope from the same sender: within the sender’s channel (and room, where the relay scopes by room, §5.8) only, as `{ from, fromName, payload }`, with the payload delivered as the same JSON value it was sent as (a relay may serialise it again, but never changes it, and never past the delivered-size bound below). An entry whose recipient is not connected is dropped as a unicast would be; the other entries are still delivered. For each recipient the relay preserves the order of that sender’s frames, fan-out entries included.
-   —Confidentiality of the recipient set. A recipient receives only its own entry, in the same form as a unicast; it MUST NOT be able to learn from the delivered bytes that a fan-out occurred or who else was addressed. Recipients that collude can still compare the timing of what they received. The relay learns the recipient set, as it would from _N_ unicasts.
-   —Limits. The whole envelope is one WebSocket message. A relay MUST accept a client message of at least `MAX_FRAME_SIZE` (§19.1), and each payload is also subject to `MAX_FRAME_SIZE` on its own. A relay that lists `fanout` MUST accept envelopes of at least `RELAY_MIN_FANOUT` (64) entries within that size. A relay adds `from` and `fromName` to what it delivers, so a delivered message can be larger than the one sent: a client MUST accept a delivered message of up to `MAX_FRAME_SIZE` plus `RELAY_ENVELOPE_ALLOWANCE` (4,096 bytes). A relay MUST NOT deliver a larger one. Re-serialising a payload can lengthen it (a JSON serialiser may write `1e21` as `1e+21`), so a relay that re-serialises measures what it is about to deliver and drops a message over the bound, as it drops a unicast to an absent recipient; a relay that forwards the payload’s bytes as received meets the bound by construction. A sender splits a larger fan-out into several envelopes. Nesting depth is bounded for the whole envelope, not per payload: a relay MAY refuse a message whose arrays and objects nest more than 64 levels deep, counted from the envelope itself, and MUST NOT refuse one within 64 for depth alone. A unicast payload therefore has 63 levels of its own, and a fan-out payload 61 (the envelope, the `fanout` array and the entry take three). MMP frames need far fewer: a CMB’s categories sit four levels deep.
-   —Rate. A relay MAY limit each client’s inbound message rate, and closes a client that exceeds its limit with 4008. A relay that limits the rate MUST allow at least `RELAY_MIN_RATE` (25) messages a second, sustained, with a burst of at least `RELAY_MIN_BURST` (300) (§19.1), and MUST count a fan-out envelope as one message toward that limit. It MAY separately limit the bytes or entries a client sends per second. These are floors, not advertised values; nothing on the wire states a relay’s own limits. A sender SHOULD keep headroom below them, counting every message it sends, `relay-auth` and `relay-pong` included, because messages paced at the sender can arrive bunched after a network stall. Without `fanout`, a sender SHOULD pace its per-recipient envelopes within the floors rather than burst them.

The fan-out envelope changes routing, never meaning: each payload is the frame its recipient would have received by unicast, sealed for that recipient’s session, and a record’s binding comes from its signed audience (§9.2.2), not from how many envelopes carried it.

The envelope’s `to` is routing only. It MUST NOT be used to decide a CMB’s binding at the receiver — whether the record is peer-bound (directed) or room-bound (autonomous). The binding is the record’s authenticated `metadata.to` (§9.2.2), which the author signs (§8.8.4) and a sealed frame binds into its associated data (§18.2.1). The envelope is not authenticated, the relay does not forward its `to` to the recipient, and a sender whose frames are sealed per peer session addresses every frame to one peer, room broadcasts included. See §9.2.2 for the directed-vs-autonomous delivery contract.

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

Before it closes a client, or when it refuses a message without closing, a relay SHOULD send a `relay-error`:

```
{ "type": "relay-error", "kind": "fanout", "reason": "duplicate-recipient",
  "message": "fan-out entry 3 names a recipient an earlier entry names" }

{ "type": "relay-error", "kind": "auth", "code": 4003, "message": "<why the token was refused>" }
```

-   —`message` (MUST): text for the operator. It MUST NOT quote what the client sent.
-   —`kind` (SHOULD): a token naming what was refused, such as `auth`, `duplicate-identity` or `fanout`.
-   —`code` (MUST when a close follows): the close code below that the relay is about to use, so a client can act on the refusal even when the close reason is cut short.
-   —`reason` (MAY): a token naming the specific cause within `kind`, such as a fan-out refusal (§4.4.4).

A client MUST ignore a `kind` or `reason` it does not recognise. It acts on the close code that follows, which is never cut short, and MAY act on `code` for a close that does not arrive. A `relay-error` is a transport-scope frame from the relay, never a peer frame.

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

4008

Rate limit exceeded

Reconnect with backoff; send less (use fan-out where listed, §4.4.4)

1001, 1009, 1011, 1013

WebSocket closes (RFC 6455): going away, message too big, internal error, try again later (a receiver too far behind)

Reconnect with backoff

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

mmp

MUST (Core Secure)

A comma-separated list of the protocol versions the listener’s handshake speaks, today exactly `2.0`: the listener runs the Core Secure handshake (§5.2). Absent on a legacy (pre-2.0) advertisement. See the profile marker below.

hostname

SHOULD

Machine hostname

room

MUST

Mesh room identifier (Section 5.8), as sent at the handshake (§5.2, NFC-normalized). A receiver reads an absent `room` as `"default"` when choosing whom to dial; membership is decided by the handshake regardless.

One service type for every room. Rooms are not mapped to DNS-SD service types: every node advertises `_sym._tcp` and carries its room only in the TXT `room` key, so every §5.8-valid identifier — dots, underscores and all 64 characters — is advertisable (a DNS-SD service name is at most 15 characters and admits neither, RFC 6335 §5.1; the advertised label prefixes it with `_`, RFC 6763 §4.1.2), and two identifiers can never collapse onto one advertised name. A TXT string is at most 255 bytes per `key=value` (RFC 6763 §6.1), which a 64-character room fits. A node SHOULD connect only to advertisements whose TXT `room` equals its own. The TXT room is a _hint_, never an admission: membership is decided by the authenticated handshake (§5.2, §5.8). It is also broadcast in cleartext to the whole segment: a room name is not a credential (§5.8.1) and MUST NOT be relied on as one, and an operator who treats a room name as sensitive SHOULD use an opaque identifier.

Profile marker. Legacy and Core Secure nodes advertise the same service type, so the TXT record is the only discovery-time signal that tells them apart. The value of `mmp` is a comma-separated list of the protocol versions the listener’s handshake speaks, with no spaces; this specification defines one, `2.0`, so today the value is `mmp=2.0`. A node whose listener runs the Core Secure handshake (§5.2) MUST list `2.0`, and a node MUST NOT list it on an advertisement whose listener does not. A record with no `mmp` key is a legacy advertisement. A node ignores versions in the list that it does not know, and MUST NOT dial a record as 2.0 unless the list contains `2.0`. TXT keys are read as RFC 6763 §6.4 says: compared case-insensitively, and when a key occurs more than once, the first occurrence wins.

A Core Secure node SHOULD dial, as Core Secure, only records whose `mmp` lists `2.0`. It MUST NOT dial a record without the marker under any other profile unless its operator has configured a Legacy Import route for that nodeId (§17.3): the absence of the marker never selects a profile. On the listening side, a Core Secure listener MUST close, without retained state, a connection whose first frame is the legacy one-frame `handshake` (§5.2.1), and SHOULD bound the work and the logging it spends on such closes per remote address, because pre-2.0 implementations that dial every `_sym._tcp` advertiser (migration note below) reach Core Secure listeners in `default`.

The marker is a hint like every TXT key, never authenticated (§18.3). Adding it to a legacy endpoint yields a Core Secure handshake that fails. Stripping it from a Core Secure advertisement hides that node from Core Secure peers on the segment, which an attacker on the segment can do anyway by suppressing the advertisement; it is a denial of discovery and never a downgrade, because no profile is chosen from a discovery record. The protocol version actually spoken is the `protocolVersion` bound into the handshake transcript.

Migration (non-normative, except as marked). An implementation that advertises a per-room service type MAY also advertise `_sym._tcp` with TXT `room` during a transition, and SHOULD drop the per-room type at its next major version. A 2.0 node SHOULD also browse the per-room service type that implementations derive from its room (for the SYM reference runtime, `_<room>._tcp`), where that is a valid RFC 6335 service name, for as long as it supports migration. The reason is 2.0 nodes that still advertise only a per-room type: they are otherwise undiscoverable, and the partition is silent. (A pre-2.0 peer is not dialled from discovery at all once §5.1’s `mmp` marker applies, so browsing does not reach it.) Some pre-2.0 implementations (the SYM reference runtime among them) dial every `_sym._tcp` advertiser in `default` without a TXT filter, and are refused at the handshake by every named-room advertiser. §5.8’s unconditional mismatch refusal, inbound and outbound, is what makes that safe: an implementation that has not verified it in both directions MUST NOT advertise `_sym._tcp` for a named room. While per-room service types are still advertised anywhere, the room `sym` maps to `_sym._tcp` and is indistinguishable there from `default`: it MUST NOT be owned and SHOULD NOT be used as a room name. Pre-2.0 advertisements, under either service type, carry no `mmp` marker, so a 2.0 node that finds one this way dials it only through a configured Legacy Import route (profile marker, above).

To prevent duplicate connections, the node with the lexicographically smaller nodeId MUST initiate the outbound TCP connection. The other node MUST NOT initiate.

Relay-based discovery. On platforms where mDNS is unavailable (cloud VMs, Windows without Bonjour SDK), nodes SHOULD use the relay’s `relay-peers` response as the discovery mechanism. Implementations SHOULD support both: DNS-SD for LAN, `relay-peers` for WAN.

### 5.2 Handshake

On a direct connection the TCP or WebSocket dialler is the **client** and the listener is the **server**. Over a relay, where both peers dial the relay and neither listens, the roles are assigned by nodeId (§5.2.2). They MUST complete this authenticated exchange in order:

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
-   —When both proofs validate, the peer’s nodeId is bound to its proven identity key (§3.4). If that nodeId is already bound to a different key, the handshake is an identity conflict: the connection MUST be closed with error 1009 and the conflict recorded; nothing else is retained. If it is bound to the same key, the session belongs to that peer and MUST NOT be refused as a duplicate.
-   —The listener MUST require `client-hello` first and `client-finish` before any non-handshake frame. Timeout is 10,000 ms by default.

The byte-exact transcript, proof, HKDF and key-confirmation constructions are normative in [the handshake vector](/spec/mmp/conformance/v2/handshake-v2.json). Any lifecycle role advertised by an extension is a hint only. Authority is resolved from the receiver’s in-force set of signed authority statements (§6.6), never self-declared handshake data.

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
-   —The two traffic keys feed only their named direction of the sealed envelopes, `cmb-encrypted` and `control-encrypted` (§18.2.1), which share that direction’s sequence. Reversing or reusing a direction key is non-conformant.

Deprecated. The one-frame `handshake` that pins its own unproven keys is a Legacy Import/migration protocol and MUST NOT be accepted by Core Secure. `state-sync` is also retired: hidden state never crosses the wire.

### 5.2.2 Handshake over a relay

Over a relay (§4.4) both peers are WebSocket diallers of the relay, so the dialler and listener roles of §5.2 do not exist, and a peer’s arrival, departure and restart are relay events rather than connection events. A relay session is the §5.2 exchange and the §5.2.1 key schedule, unchanged, carried in routing envelopes addressed to the peer (§4.4.4), with the following rules.

-   —Roles. The node with the smaller nodeId is the client, comparing the lowercase wire forms (§3.1.1) bytewise — the order §5.1 uses on the LAN. The node with the larger nodeId MUST NOT send `client-hello` to that peer over the relay, and a node MUST ignore a relay `client-hello` from a peer whose nodeId is larger than its own. Both sides apply one order, so there is no simultaneous open to resolve.
-   —Trigger. When `relay-peers` lists a peer that is not offline (§4.4.2), or `relay-peer-joined` announces one (§4.4.3), the client-role node SHOULD send `client-hello` to it if it holds no relay session with that nodeId. An announcement for a peer it _does_ hold a session with is ambiguous: the peer may have restarted and replaced its own relay connection (§4.4.7), losing the session’s keys, or the relay may simply have announced it again. A node MUST NOT re-handshake on that announcement alone, which would supersede working sessions. It SHOULD instead probe: send a `ping` to that peer, at most once a second per peer. A live peer answers `pong`; a restarted one holds no session and answers `UNKNOWN_SESSION` (below), which tells the client to re-handshake.
-   —Addressing. Every handshake frame and every sealed frame of a relay session MUST be sent in an envelope whose `to` is the peer’s nodeId; none is ever broadcast. A node MUST refuse a `client-hello` or `server-hello` whose nodeId differs from the envelope’s `from`, and MUST accept a session’s frames only from envelopes whose `from` is that session’s peer, arriving on the relay connection the session was established on.
-   —Timeout. The server-role node MUST require `client-hello` first and `client-finish` before any non-handshake frame from that peer, exactly as a listener does. Either role MUST abandon, retaining no state, a handshake that has not confirmed within 10,000 ms of its first frame. The client SHOULD retry with exponential backoff (for example from 1 s, doubling, capped at 60 s) and MUST NOT have more than one handshake in flight per peer on one relay connection.
-   —Supersession. A handshake that confirms for the same (nodeId, identity key) as an existing session on that relay connection supersedes it, once each side knows the other holds it. The server supersedes when it admits the new session (§5.8.1; in an ungated room, when `client-finish` verifies). The client cannot, since its `client-finish` may have been lost, so: the server MUST send a sealed frame on a relay session as soon as it admits it, and that frame is the mandatory `cmb-anchors` (§9.4). The client MUST NOT supersede its existing session until a sealed frame other than an `error` opens on the new session; if none opens within the handshake timeout, it MUST abandon the new session, retaining no state, and keep the old one. When a side supersedes, it discards the old session’s keys and counters and refuses frames sealed under the old `sessionId` from then on. Supersession itself sends nothing. This is how a peer restart recovers. A handshake that proves a different identity key for the nodeId never supersedes: a nodeId keeps one key (§3.4), the new handshake is refused, and the existing session is unaffected.
-   —An unconfirmed hello changes nothing. A handshake in progress MUST NOT tear down, pause or alter a confirmed session. Only confirmation supersedes; a timeout, a failure or an abandoned handshake leaves the confirmed session exactly as it was, so a forged or replayed `client-hello` costs the peers nothing.
-   —Teardown. A node MUST tear down every relay session with a nodeId when `relay-peer-left` names it, and every relay session on a relay connection when that connection closes; tearing down discards the session’s keys and counters. A node that closes a confirmed relay session for any other reason except supersession SHOULD first send, sealed in that session and addressed to the peer, an `error` with a Close action (§7.2): 1010 `SESSION_CLOSED` with the reason in `message`, unless another code names the reason. A sealed error with a Close action ends the session at its receiver too, and the client-role side then begins a new handshake, with backoff, except after 1009, which it does not retry automatically (§7.2). A node whose handshake fails or is refused MAY send 1006 or 1007 in clear; like every clear error it changes nothing at the receiver (§7.1). 1009 is found only after both proofs validate, so it is sent sealed on the session (§5.2).
-   —Sequence. Sealed frames follow §18.2.1. A relay may drop frames and never retransmits them, so a gap is final: the receiver MUST close the session, and SHOULD first send a sealed 1010 `SESSION_CLOSED`, and the client re-handshakes; nobody waits for a missing sequence. A frame that fails authentication does not advance the receive sequence and does not close the session, and neither does a replayed one, since the relay can inject and replay frames. A sealed frame naming a `sessionId` the receiver does not hold is discarded and answered with `UNKNOWN_SESSION` (below).

Unknown session. A node that receives, from a relay `from`, a sealed frame (`cmb-encrypted`, or any other sealed envelope) naming a session it does not hold, or a `ping` from a `from` it holds no relay session with, SHOULD answer with error 1011 `UNKNOWN_SESSION`:

```
{ "type": "error", "code": 1011, "message": "unknown session",
  "detail": "session:<32 lowercase hex>" }
```

-   —`detail` names the session as `session:` followed by its 32 lowercase hex characters when the triggering frame named one, and is absent when it did not (a `ping`). The error travels in clear, as a routing-envelope payload addressed to the sender: the node holds no session to seal it with.
-   —A node MUST NOT send it more than once a second per relay `from`, and SHOULD also cap its replies across all senders (for example 2 a second, with a burst of 8), which bounds the replies a stream of stale or forged frames can draw.
-   —The client-role receiver, if the peer is present on the relay, SHOULD begin a new handshake, but only when the error’s `detail` names the session it holds with that peer or it has a probe `ping` outstanding to that peer, and it is not already waiting for a newer session with that peer to supersede the one named, and no faster than its handshake retry backoff. It MUST keep its existing session until the new one supersedes it, so a peer’s restart produces no peer-left at the application. The server-role receiver ignores it: the client will re-handshake.
-   —Like every error frame it is informational (§7.2). It MUST NOT tear down a session by itself. Anyone on the relay path can forge it, and the worst it can do is prompt a handshake that only a peer holding the right key can confirm.

Why the session, not the relay, decides. The relay’s view of a nodeId is weaker than a handshake (§4.4.1), so nothing a relay says can end a session both peers confirmed, except `relay-peer-left` and the loss of the relay connection, and those cost only a re-handshake. Everything that would let a third party end or replace a session — a hello, an error, a forged or replayed frame — either needs the peer’s keys to confirm or changes nothing.

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

Timeout, malformed frame, proof failure, room/version mismatch, or identity conflict (a bound nodeId proving a different key, §3.4)

CONNECTED

DISCONNECTED

Heartbeat timeout, TCP close, or error

Implementations MUST NOT process any non-handshake frame in the AUTHENTICATING state.

A relay session (§5.2.2) passes through the same states. It enters AUTHENTICATING when the client sends, or the server accepts, `client-hello`; it becomes CONNECTED on confirmation; and it returns to DISCONNECTED on timeout, failure, supersession by a newer confirmed session for the same (nodeId, key), `relay-peer-left`, the closing of the relay connection, a sequence gap, or a sealed error with a Close action (§7.2). An existing CONNECTED session stays CONNECTED while a newer handshake with the same peer is AUTHENTICATING.

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

### 5.8 Mesh Rooms

A node MUST declare membership in one mesh room at handshake time via the explicit `room` field (Section 5.2). A room is a named cohort of nodes that exchange application-layer frames only with each other. Rooms let an operator host multiple mutually isolated meshes on the same relay or LAN segment.

Room identifier syntax. A room identifier is a string of `[a-z0-9-_.]+`, max 64 characters, case-sensitive. The literal string `default` is explicit; absence is invalid in Core Secure.

Protocol guarantee. A node in room `R_A` MUST NOT exchange application-layer MMP frames with a node in room `R_B` when `R_A ≠ R_B`. Room is part of the authenticated handshake transcript and every signed record assertion. A mismatch fails authentication; application traffic never begins.

Layer placement. A mesh room is a Layer 2 (Connection) concept. The application layer SHOULD declare its room at SDK initialisation. A relay MAY scope routing by room as defense in depth, but endpoint authentication is authoritative: the room is signed in the handshake transcript and bound into each record signature. A receiver MUST reject a frame whose authenticated room differs from its own, even if a relay misdelivers it. LAN peers perform the same check during authentication and close on mismatch with `ROOM_MISMATCH`.

Recommended naming convention (non-normative). The protocol does not parse room identifiers beyond the character set and length checks above. Operators of meshes with more than a handful of rooms SHOULD adopt a hierarchical dotted-path convention `<app>[.<environment>][.<cohort>]`, e.g. `acme.prod`, `acme.dev`, `assistants.default`, `research.lab`. The dots are convention only; tooling MAY use them for prefix grouping.

SVAF and room filtering. Authentication and room filtering run before SVAF. A record from a different room never reaches the evaluator. For an authenticated same-room record, category verdicts inform one whole-record admission result (§9.2).

The naming convention above is the complete normative surface; deeper design rationale is runtime documentation, not part of this specification.

### 5.8.1 Room Admission

Consent to hear is not consent to believe. Admission decides whether a node’s frames are exchanged at all. It says nothing about whether their content is true, and a receiver that treats membership as credibility has confused the two. Every admitted record is still evaluated by SVAF (§9.2), and admission gives it no standing there.

A room name is not a credential. §5.8 makes a room a named cohort, and every discovery path — LAN advertisement, same-host registry, relay routing — turns knowledge of that name into membership without asking anyone. A deployment that needs membership to be a _right_ rather than a _string_ MAY gate a room. A gated room has exactly one owner, identified by node identifier and Ed25519 public key together. A node that enforces a gated room MUST have the owner’s nodeId and key pinned out of band, for that room: it selects the owner by the room, never by anything a grant or a peer carries. The room identifier `default` MUST NOT be owned: it is the public mesh. Because rooms are carried verbatim and never mapped to a service type (§5.1), every §5.8-valid identifier denotes exactly one room and any of them other than `default` MAY be owned (but see the migration note in §5.1 on the room `sym`).

The room-join grant. A node joins a gated room by presenting a grant signed by that room’s owner. The grant MUST bind, under one signature, the room identifier, the grantee’s node identifier, the grantee’s public key, and an expiry. A grant that names a grantee but binds no key is a bearer token: anyone holding the bytes can present it, and the verifier MUST refuse it.

The key must be proven, not asserted. A handshake field stating a public key proves nothing — the key an impostor would have to state is printed inside the grant it is holding. A verifier MUST compare the grant’s bound key against a key the peer _proved_ possession of during the handshake, and MUST refuse when no such proof is available. Failing closed here costs a deployment nothing it had; failing open hands the room to whoever copied a file.

Presenting the grant: the `room-join` frame. The handshake transcript has no field for a grant, and a grant carried in a hello would be presented before anything was proven. A grant is therefore presented inside the confirmed session, where the key it binds can be compared with the key the session proved. It travels as a sealed control frame (§7.1, §18.2.1):

```
{ "type": "room-join",
  "grant": { "type": "room-join", "room": "<room>",
             "grantee": "<grantee nodeId>", "granteeKey": "<43-char base64url>",
             "grantedBy": "<owner nodeId>", "grantedAt": 1786611600000,
             "expiresAt": 1786698000000, "sigAlg": "ed25519",
             "sig": "<unpadded base64url>" } }

signed payload = UTF8("mmp-room-join-v1
") || lp(room) || lp(grantee) ||
                 lp(granteeKey) || lp(grantedBy) ||
                 lp(decimal(grantedAt)) || lp(decimal(expiresAt))
```

-   —The grant’s signature. `grant.sig` is the owner’s Ed25519 identity-key signature over the payload above, using the §8.8.4 `lp` encoding, and is verified by the one rule of §18.3.2. `granteeKey` is the grantee’s identity key as unpadded base64url, and `grantedAt` and `expiresAt` are integer milliseconds. The frame adds no signature of its own; the session protects it.
-   —Sending. A node that holds a grant for its room MUST send `room-join` on every newly confirmed session, as its first control frame, after both proofs validate and its own key-registry check of the peer (§3.4) has passed. Both ends of a session between two grantees send one.
-   —Pending admission. In a gated room, a receiver MUST hold each newly confirmed session as _pending_, and MUST NOT process any content-bearing frame on it until it is admitted (the per-frame door, below). It admits the owner at once, recognised by the session’s proven nodeId and identity key together matching the pinned owner. Any other session it admits only on a `room-join` that arrives within the handshake timeout (10,000 ms by default, §5.2), and it MUST close a session that presents none in time. It MUST decide admission on a `room-join` before it handles the session’s next frame, so no frame is judged against a decision still being made.
-   —Verification. The receiver MUST first check the frame against [room-join.schema.json](/spec/mmp/schema/room-join.schema.json), so the times are integers before any signature work, and then verify the grant against the pinned owner key for this room under §18.3.2. It MUST require all of the following: `room` is its own room; `grantedBy` is the pinned owner’s nodeId; `grantee` is the session’s proven nodeId; `granteeKey` is the session’s proven identity key; `expiresAt` is no more than 24 hours after `grantedAt` (the cap below); and, allowing 5 minutes of clock skew, the grant is already valid (`grantedAt` is no more than 5 minutes ahead of the receiver’s clock) and not expired (the clock is no more than 5 minutes past `expiresAt`). If every check passes it admits the session; if any fails it closes the session. A grant copied onto another key’s session therefore fails, whoever presents it.
-   —Expiry closes the session. A session admitted on a grant stays admitted only while the grant lasts: the receiver MUST close it when its clock reaches the grant’s `expiresAt`. A grant admitted inside the 5-minute skew allowance after its `expiresAt` is therefore closed at once. The grantee presents a fresh grant on a new session.
-   —Otherwise ignored. A `room-join` on a session already admitted, or in an ungated room, MUST be ignored.

Expiry is the revocation window. A grant MUST NOT be accepted with a lifetime exceeding 24 hours, and the cap MUST be enforced by the _verifier_, not only by the issuer: a cap only the issuer honoured is a suggestion, and a receiver that accepts a ten-year grant has no window at all. Revocation is live gossip with no catch-up replay, so a peer that is offline when a revocation publishes never learns of it. The grant’s own lifetime is therefore the true exposure, and this number _is_ that exposure rather than a bound on it.

The door is consulted per frame, not once per greeting. Admission is decided from the handshake and the grant presented after it, but a receiver MUST record that decision and consult it on every frame that carries meaning. A receiver MUST NOT process a record, a message, or any other content-bearing frame from a peer it refused, nor from a peer for which no admission decision was ever made while the room is gated. This is not a restatement of §5.8: an implementation can satisfy the handshake rule and still dispatch content from a node that never greeted it, because frame handling is commonly attached to a transport before, or independently of, the handshake that would have judged it. Handshake frames MUST NOT be gated this way — a grant-holder could then never join. Liveness frames MAY be answered, since a keep-alive tells a refused peer nothing that a closed connection does not.

A door governs a room, not a node’s voice. Admission decides what is exchanged _within_ a room; it does not make a node inaudible outside one. A receiver that also hears a band the room does not scope — a discovery advertisement, a broadcast channel, any transport it shares with non-members — MUST NOT ingest what arrives there as room content, because nothing on that band passed the door. This is not hypothetical: an independent implementation built against this specification was measured on 2026-09-16 emitting an adversarial node’s records to every peer on the local segment _without ever joining the room_, and its door counted nothing, correctly — the node never knocked. A door that is never approached refuses nothing, and a receiver MUST NOT read that silence as evidence of admission.

What the door cannot do. In an _ungated_ room there is no admission to enforce: declaring the room at handshake is membership, by §5.8. A receiver in an ungated room therefore has no basis to refuse an unknown peer’s frames on admission grounds, and MUST NOT report the absence of grants there as evidence that nobody was admitted — nothing was required. An interface that reports a room’s gating MUST distinguish ungated from not determined; the two call for opposite responses and collapsing them into one false negative is the failure this clause exists to prevent.

Implementation status

The reference runtime implements owner-signed grants with the key binding, the verifier-enforced 24-hour cap, and the per-frame door described above. Two parts of this section are specified but not exercised: no shipped deployment gates a room, so the refusal paths are covered by tests rather than by traffic; and, through sym 0.13, the proving handshake that would supply a _proven_ key was not reachable from the admission path. Because the verifier refuses for want of proof _before_ it compares keys, a gated room in those versions is shut to everyone — a legitimate grant-holder is refused for the same reason as a thief presenting a stolen grant. That is fail-closed, and it is the right direction to fail. sym 0.14.0 completes the §5.2 handshake on every transport and presents the grant after it in the `room-join` frame defined above, so the key binding is reachable there. Revocation exists only as expiry. Treat the grant mechanism as specified and implemented, the binding as reachable from sym 0.14.0, and the gated-room deployment as untried.

§5.9–5.11 — Informative

Sections 5.9–5.11 describe an informative design pattern for composing meshes — not a normative wire. The single-mesh protocol (§1–§5.8, §6–§20) is complete and unaffected without it. There is one reference implementation (a gateway prototype) and it realizes only a subset of the pattern (see “Reference implementation” below); the core runtime is single-room. Adopt this as a topology pattern with a stated production-security bar, not as a shipped protocol feature.

### 5.9 Interior and Boundary (the composition idea)

A mesh presents itself to another mesh as a single node: a gateway. A gateway participates in its own interior room as an ordinary node (§5.2, single room on the wire) and presents a boundary to exterior gateways over a separate transport. It is not one handshake declaring several rooms — interior participation and the exterior boundary are distinct connections.

Admit-then-reproject, not relay (the intended grammar). The pattern forbids forwarding an interior frame outward. Instead a gateway _admits_ its interior cognition through SVAF (§9) and emits a new lossy CAT7 projection (§2.7) outward — its own cognition, signed, carrying its own lineage (§15), never a relayed copy. This preserves the §5.8 guarantee (no interior frame crosses a room boundary) by construction. _Implementation status: the reference prototype does not yet do this — see below._

Its own lineage means ONLY its own, and the reason is not tidiness. A projection emitted outward MUST NOT carry a lineage reference to the interior record it was admitted from, even though the exterior could never dereference one. By §8.2.1 a CMB’s key _is_ a content address — a SHA-256 over the canonical serialization, which two conforming implementations compute identically for the same logical block. A reference to an interior record is therefore a hash of that record’s content, published outside the boundary. An exterior observer cannot open it, but can _guess_ a candidate interior content, compute its address, and compare — confirming the interior’s contents without ever being admitted to it. Where the interior’s vocabulary is small or enumerable, that is not a narrow leak but a complete one. The determinism that makes a content address work for lineage, dedup and citation is the same property that makes it an oracle across a boundary, and “the reader cannot dereference it” is the argument for safety that gets this wrong: inability to dereference removes the audit value while leaving the confirmation intact.

The audit trail this appears to sacrifice is not lost, only relocated to where the entitlement is. A gateway SHOULD record, in its own store, which admitted interior observations a given outward projection derived from. That is readable by the gateway and by anyone with interior access — precisely the parties entitled to see both sides — and unlike a pointer the exterior cannot open, it can actually be followed. Where a gateway must later _prove_ such a derivation to a third party, it MAY publish a salted commitment over the interior key rather than the key itself, revealing the salt when it chooses to prove the link; a commitment carries no oracle, because a correct guess cannot be confirmed without the salt.

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

one room

one interior room + an exterior boundary (Section 5.9)

A gateway node is an ordinary node whose interior happens to be a mesh; its domain lens (Section 3.1) is “represent my interior.” Because the same emit / admit grammar holds at every scale — agent, team, org, cross-org — the mesh is fractal: any mesh MAY appear as a single node inside a larger mesh.

Relation to Section 3.2. “One agent, one node” is preserved. A gateway is not a shared identity: it has its own nodeId, its own keypair, and its own SVAF. Its interior agents are separate nodes on a separate (interior) room; the gateway participates in that interior room as an ordinary node and presents an exterior boundary (§5.9) — evaluating each side through its own lens, the very property Section 3.2 protects.

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

When a receiving node processes a validation CMB (one whose `lineage.parents` points to an existing CMB), it MUST resolve the _author’s_ role against its own in-force set (§6.6) at the moment it processes the CMB — never from the `createdBy` string, never from the peer’s advertised handshake role, and never from a time the CMB claims:

-   —If the author _resolves_ to validator or above (validator, admin or the anchor), the parent CMB advances to `validated` (if action completed) or `dismissed` (if not actionable).
-   —Otherwise the parent CMB advances to `remixed` only. The CMB is stored normally but confers no validation.
-   —A scoped grant (§6.6.2) confers this only on a parent CMB that is inside the grant’s scope, judged from that parent’s own signed fields. A receiver MUST NOT judge it from the validation CMB’s own fields or tags. When a validation CMB names several parents, each is judged on its own: a parent inside the scope advances, and one outside it does not. An issuer, which admits nodes, confers no validation anywhere.

The transition is the receiver’s own record, made once, against its in-force set at the moment it is made; a later revoke does not undo it in that store (§6.6.10). An outcome that several parties must agree on is not decided this way: the environment it belongs to decides it once and records it (§6.6.10).

This prevents agent-level spoofing of validation authority. An agent cannot self-promote to validator by including “founder” or “validator” in its CMB text categories. The authority is bound to the node’s cryptographic identity and key, through an in-force grant from the anchor or an admin (Sections 3.5.1 and 6.6).

Role verification & admission weight. Authority is the _resolved_ role, never the advertised one. A node MUST NOT grant any authority-weighted treatment — lifecycle advancement, or the elevated _origin_ admission weight the CMBs of a validator, an admin or the anchor receive (§6.4) — on the basis of a handshake `lifecycleRole` or a `createdBy` string. That origin weight MUST derive from the author’s role as resolved against the receiver’s in-force set (§6.6) when the weight is applied, and the elevation additionally requires a verified signature binding the CMB to that author. A single node that could self-declare `anchor` would otherwise double the admission weight of everything it emits — the highest-leverage poisoning primitive — which is exactly why the weight is gated on the resolved role. Where no anchor is pinned there is no root of trust: an implementation has no cryptographic authority to resolve and MUST treat all roles as unauthenticated — a closed/development mode only. Production deployments MUST pin an anchor.

Dismiss vs. validate: These are distinct lifecycle transitions with different consequences. **Validate** (Done): parent CMB advances to `validated` (anchor weight 2.0). The mesh learns what humans value. **Dismiss** (Not actionable): parent CMB advances to `dismissed` (anchor weight 0.5). The dismissal broadcasts as feedback — the producing agent sees its signal was rejected, and similar future signals score lower in SVAF evaluation. Both require validator role or above. Both broadcast to the mesh. The effectiveness of this feedback depends on the content quality of the dismissal CMB — see [Section 11 (Feedback Modulation)](/spec/mmp/feedback) for normative content requirements.

Boundary attestation. The same validation authority governs cognition that crosses a mesh boundary. A gateway node (Section 5.10) that emits a lossy projection of its interior on the interior’s behalf SHOULD sign that boundary emission and record, in its admission attestation, the interior verdict aggregate it was derived from — so an outer admitter can weigh the boundary claim by earned authority exactly as it weighs any peer. Interior and boundary trust are the same mechanism at two scales; see Section 5.11.

### 6.6 Authority Lifecycle: Grants, Resolution & Revocation

Authority that cannot be lost is decoration. This section defines how a role is conferred, how a node decides which authority is in force, and how authority is withdrawn — the mechanism §6.5 gates on.

Authority is a function of a set. A node’s view of authority is computed from the set of verified authority statements it holds, and from nothing else: not the order they arrived in, not the time on any clock, not the session that delivered them. Statements name one another by the hash of their signed bytes, so the graph they form is fixed when they are signed. Two nodes that hold the same statements under the same pinned anchor MUST resolve the same authority. No timestamp takes part in resolution: a statement MAY carry a time as information (`issuedAt`), and a node MUST NOT let that time, its own clock or the order of arrival affect what is in force.

Why (informative). The rule this section replaces resolved a node’s role at a time _T_ by replaying grants and revokes in the order of times their signers chose. Any role holder could grant further down, grants were gossiped in any order, and revoking a grantor cascaded. Every node therefore had to rebuild one timeline from signer-chosen times, statements by many writers, and arbitrary arrival order, with nothing to order them. That is consensus without a consensus mechanism. An implementation of it diverged on arrival order, accepted backdated revokes, could be flooded until honest records were evicted, and resolved some revoke patterns in exponential time. Resolving a set removes the ordering problem instead of patching it.

#### 6.6.1 The anchor

-   —A pinned key set with a threshold. The anchor is configured out of band as a set of _n_ distinct Ed25519 public keys, 1 ≤ _n_ ≤ `ANCHOR_MAX_KEYS` (16, §19.1), and a threshold _t_, 1 ≤ _t_ ≤ _n_. Each key MAY be pinned with the nodeId of the node that holds it. The pin is configuration a receiver already trusts, never a claim on the wire: a node MUST NOT learn, change or persist its pin from any frame.
-   —The single anchor stays valid. A pin of one nodeId and its key, as earlier revisions defined it, is the set of one key with _t_ = 1.
-   —Anchor-level statements. A statement whose `authorisedBy` is `"anchor"` is valid only if it carries signatures over its payload (§6.6.3) by at least _t_ distinct pinned keys, each verifying under §18.3.2. Each entry’s key is unique within the statement (§6.6.3, rule 1), so a copy that repeats a key is not well formed and none of its signatures is checked. Entries by keys that are not pinned, and signatures that do not verify, are not counted. A node stores and relays only the entries it counted. Each copy of a statement is judged on its own entries: a node MUST NOT combine entries from different copies, so that validity never depends on which copies a node happened to receive. The key holders collect their _t_ signatures among themselves, out of band.
-   —The anchor is not a granted role. No grant confers `anchor`. Under a threshold of 1 each pinned member alone is the anchor, whether the pin holds one key or several: its single signature makes an anchor-level statement valid, and a CMB it authors resolves as the anchor (§3.5) when its nodeId is pinned with its key. Under a higher threshold no single node is the anchor, and each key holder holds whatever roles in-force grants give it.
-   —Re-pinning. Replacing the pin out of band is the last resort. It re-judges every anchor-level statement against the new pin: a statement that still carries _t_ valid signatures from the new set stays valid, and the rest fall away with everything they authorised. Statements do not name the pin. A re-pin that keeps a threshold of the old keys, for example to drop one compromised key of three, therefore keeps what those keys signed. A re-pin to new keys starts authority again. After a re-pin a node re-verifies the copies it holds: a copy that no longer counts is replaced by any copy that does, which anti-entropy brings from a node that holds one. A node keeps the statements it holds independently of its pin, and judges them again under the current pin whenever the pin changes or it loads them. It MUST NOT delete a statement because it fails under the current pin, so a re-pin, or a mistyped pin, destroys nothing: what fails under one pin counts again under a pin it meets.
-   —No pin. Where no anchor is pinned, nothing is in force (§6.5), and there is no authority root, since a root names a pin (§6.6.7). A node with no anchor pinned therefore sends no `authority-digest`, pulls nothing, answers no `authority-fetch`, and stores and relays no authority statement it receives; statements it already holds stay as they are, to be judged when a pin is configured. It MUST NOT rate-limit or penalise a session for authority statements it cannot judge.

#### 6.6.2 Roles and delegation

Role

Granted by

May grant

May revoke / endorse

Lifecycle (§3.5)

anchor

pinned, never granted

admin, validator, issuer, any non-authority role

revoke any grant; endorse any grant or revoke that is not anchor-level

canonical (as an author, only under a threshold of 1)

admin

the anchor or an admin

admin, validator, issuer, any non-authority role

revoke and endorse below it on its own chain

validated, canonical, inside its scope

validator

the anchor or an admin

non-authority roles only

revoke below it on its own chain; no endorse

validated, inside its scope

issuer

the anchor or an admin

non-authority roles only

revoke below it on its own chain; no endorse

none

participant, extension roles

the anchor, an admin, a validator or an issuer

nothing

nothing

observed, remixed

-   —Delegating roles are `admin`, `validator` and `issuer`: their holders may sign statements, and a bucket counts their grants against its delegate quota (§6.6.6). Lifecycle authority (§3.5) belongs to admin (canonical) and validator (validated) only. An issuer has none, so a service that admits seats need not hold validation authority over anything. Non-authority roles are `participant` and extension roles, named as §7.3 names extension types (`<extension>-<name>` or `x-<vendor>-<name>`, lowercase, at most 64 characters). A non-authority role confers no lifecycle authority, no admission weight above participant, and no right to sign any statement. MMP authority roles are therefore the anchor, admin, validator and issuer. An extension MAY give a non-authority role meaning in its own domain, such as a seat in a hosted world; it MUST NOT turn one into an authority role.
-   —A node with no in-force grant is a participant. A `participant` grant adds only a vouched key and a signed record that someone above admitted the node.
-   —Scope. A grant MAY carry a signed `scope`: an extension namespace and a path, such as `xmesh-world:w1` or `xmesh-world:w1/region-a`, of at most `AUTHORITY_SCOPE_MAX` (256) characters (the grammar is in the schema). No scope is the whole mesh. A grant’s scope MUST equal or narrow its authorising grant’s: the same string, or that string followed by `/` and more segments. A grant under a scoped grant therefore MUST carry a scope, because leaving it out means the whole mesh, which would widen. An anchor-level grant may have any scope or none. A grant whose scope would widen its parent’s is invalid (§6.6.3, rule 4). Scope paths are opaque: they are compared exactly, byte for byte, and never normalised (no case folding, no percent-decoding, no resolution of `.` or `..`). No segment may consist only of dots, so `xmesh-world:w1/../w2` is not a scope at all, and nothing can look like a step up to a reader that would resolve it. Narrowing adds whole segments: `xmesh-world:w10` does not narrow `xmesh-world:w1`. The lifecycle authority and the elevated admission weight of a scoped grant apply only to CMBs inside its scope. The extension that owns a namespace defines which CMBs are inside each of its scopes, for example by room or by world. A receiver that does not implement a namespace treats no CMB as inside its scopes, so a scoped grant gives it no lifecycle authority. A scope does not change who may revoke or endorse a grant, nor what its holder may sign beyond keeping its own grants inside it.
-   —Depth. The anchor is at depth 0. An anchor-level statement is at depth 1, and a statement authorised by a grant at depth _d_ is at depth _d_ + 1. A statement deeper than `MAX_DELEGATION_DEPTH` (4, §19.1) is invalid. Admins may grant admins, so the role table alone does not bound depth; the cap does.
-   —Why four. The deepest chain with a separately accountable party at every hop is anchor → deployment admin → world admin → seat issuer → seat. Those are: the anchor’s key holders; the operator of a hosting deployment; the operator of one world hosted there; the service that admits seats to that world, which holds the issuer role so that it admits seats without validation authority; and a seat. That is four grants. A fifth hop would add no new kind of boundary, because what it would express is expressed by granting wider, not deeper. Each extra hop is one more key whose compromise reaches everything below it, and one more link that every check walks. The cap also bounds every chain to four grants, so a revoke check walks at most three ancestors and a fetched chain is at most four statements. The issuer leaves the arithmetic of §6.6.6 as it is: it is a delegating grant in its world admin’s bucket, and its seats are non-authority grants in its own. The draft bound of 8 belonged to the time-replay rule, under which validators promoted validators.
-   —What MMP authority governs (informative). Grants decide who may attach to a mesh and act in it: hosts, seats, publishers, validators. Roles inside a simulation or a game, such as a commander or a scout, are simulation data kept in that environment’s own records. They are not MMP grants. A world’s own laws, fines and verdicts are that world’s records too: they are not MMP validation, and MMP authority neither grants nor checks them. A seat grant is per admitted node: it names one nodeId and key, not a sitting, so a node that comes back keeps its seat until the grant is revoked. With the constants of §19.1 a world admin’s 16 issuers admit up to 16 × 256 = 4,096 nodes per grant it holds. Grants do not expire, and no expiry is intended: authority ends by revoke.

#### 6.6.3 Statements

Three statements carry all authority. A `grant` confers a role on a subject, a nodeId together with its Ed25519 key, optionally within a scope (§6.6.2). A `revoke` names, by id, the grants it removes. An `endorse` names, by id, the grants and revokes to keep in force after a revoke has cut them off from the anchor (§6.6.5). Each names in `authorisedBy` the authority it is made under: `"anchor"` for an anchor-level statement, otherwise the id of the signer’s own grant. A signer that holds several grants names the one whose role permits the statement and, for a revoke or endorse, one that stands above its targets (§6.6.4). Every statement carries a `nonce` of 16 random bytes, so a fresh grant of the same role to the same subject is a different statement.

```
{ "kind": "grant",
  "authorisedBy": "anchor" | "auth-<64 lowercase hex>",
  "subject": { "nodeId": "<uuid>", "key": "<Ed25519 public key, base64url>" },
  "role": "admin" | "validator" | "issuer" | "participant" | "<extension role>",
  "scope": "xmesh-world:w1",                       (optional; omitted means the whole mesh)
  "nonce": "<16 random bytes, base64url>",
  "issuedAt": 1786611600000,                       (optional; information only)
  "sigs": [ { "key": "<base64url>", "sig": "<Ed25519 signature, base64url>" } ] }

{ "kind": "revoke",  "authorisedBy": "...", "targets": ["auth-...", ...], "nonce": "...", "sigs": [ ... ] }
{ "kind": "endorse", "authorisedBy": "...", "targets": ["auth-...", ...], "nonce": "...", "sigs": [ ... ] }
```

Canonical signed bytes and identity. `lp` and `decimal` are as in §8.8.4. Targets are unique on the wire, and their wire order is not signed. A nodeId is signed in its canonical lowercase RFC 4122 text form, 8-4-4-4-12 lowercase hexadecimal digits. Any other spelling is not well formed, so one node has one spelling, and one statement one id.

```
payload = UTF8("mmp-authority-v1\n") ||
  lp(kind) ||
  lp(authorisedBy) ||
  grant:            lp(subject.nodeId) || lp(subject.key) || lp(role) || lp(scope or "")
  revoke, endorse:  lp(decimal(targetCount)) || concat(lp(target) for bytewise-sorted targets)
  || lp(nonce) ||
  lp(decimal(issuedAt) or "")

id  = "auth-" || lowercase hex(SHA-256(payload))
sig = Ed25519(signing key, payload)         (pure Ed25519, no prehash; unpadded base64url)
```

The id excludes the signatures. A statement re-signed by a hedged signer (§17.4), or carrying a different subset of anchor signatures, is the same statement. A node MUST compute the id itself; no frame carries a statement’s own id. A non-anchor statement carries exactly one signature entry, whose `key` is the key that signed it. Every signature verifies under the one rule of §18.3.2.

Validity. A statement is _valid_ when all four hold:

1.  Well formed. It validates against [authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json); every base64url field is canonical (a key and a signature decode to 32 and 64 bytes, a nonce to 16); its subject nodeId is canonical (above); its subject key is the encoding of an Ed25519 point of prime order (§18.3.2), so no grant can name the identity or any other small-order or mixed-order key; `issuedAt`, if present, is at most 253 − 1; its scope, if present, follows the scope grammar; its targets are unique and number 1 to `AUTHORITY_MAX_TARGETS` (64); and the keys of its signature entries are unique, so a statement that repeats a key is not well formed. A node checks this rule before any signature work. The schema and the reference construction accept exactly the same shapes, with two exceptions JSON Schema cannot express: the point check, and unique keys across entries (the schema refuses only identical entries).
2.  Rooted and shallow. Following `authorisedBy` from the statement through statements the node holds reaches `"anchor"` within `MAX_DELEGATION_DEPTH` links. If a link within that walk is not held, the statement is _pending_, not invalid (§6.6.8). If the walk would need more links, the statement is invalid.
3.  Signed. An anchor-level statement as §6.6.1 says. Any other by the key its signature entry names, which MUST be the subject key of its authorising grant, verifying under §18.3.2.
4.  Permitted. Its authorising statement is a valid grant (or the anchor), and that role permits it under §6.6.2: the role table for a grant, a delegating role for a revoke, an admin or the anchor for an endorse. A grant’s scope equals or narrows its authorising grant’s.

Validity is static: it depends on the statement and its chain, never on revokes, endorsements or quotas. A receiver MUST check it on ingest and MUST discard an invalid statement, which it MUST NOT store or relay.

#### 6.6.4 Resolution

Over the set of valid statements a node holds:

-   —The chain of a statement is the grants above it: its authorising grant, that grant’s authorising grant, and so on, up to and not including the anchor. A grant _g_ is _above_ _s_ if _g_ is on the chain of _s_. The chain is fixed by the hashes: it never depends on what is in force.
-   —A bucket is the statements that share an `authorisedBy`; the anchor-level statements form one bucket. Everything in a bucket is signed by one signer under one grant, at one depth. A bucket keeps statements: its own, and those its endorses rescue (§6.6.6).
-   —A revoke _r_ may remove a grant _g_ when _r_ is anchor-level or is authorised by a grant above _g_. These are the anchor, and the holders of grants on _g_’s chain above it. No signer can remove its own grant, a grant above its own, or a grant on another branch.
-   —An endorse _e_ may rescue a grant or revoke _s_ when _s_ is not anchor-level, and _e_ is anchor-level or authorised by a grant above _s_’s authorising grant. These are exactly the signers that may remove _s_’s authorising grant. An endorse is never rescued: an endorse that names an endorse does nothing to it.
-   —A revoke or endorse acts target by target. A target it may not remove or rescue, a target the node does not hold, and, for a revoke, a target that is not a grant, are unaffected, and the statement still applies to its other targets.
-   —A statement is cut by a revoke when its authorising grant is not in force and, walking up its chain past the grants that are dead, the first grant that is not dead is removed. When that first grant is over quota instead, the statement is cut by a quota.
-   —A statement is alive when it is anchor-level or its authorising grant is in force. A grant or revoke that is not alive is rescued when it is cut by a revoke, an in-force endorse that may rescue it names it, and that endorse’s bucket keeps it (§6.6.6). A statement cut by a quota is never rescued. A grant is removed when an in-force revoke that may remove it names it.
-   —A revoke or endorse is in force when it is alive and its bucket keeps it; a revoke also when it is rescued. A grant is in force when it is not removed, and either it is alive and its bucket keeps it, or it is rescued. Every in-force statement is kept by exactly one bucket: its own, or its rescuer’s.

Every statement therefore has exactly one status: _invalid_, _pending_, _dead_ (valid, but neither alive nor rescued), _removed_, _over quota_ (no bucket has room for it), or _in force_. The [authority vector](/spec/mmp/conformance/v2/authority-v2.json) pins these statuses. A node MUST resolve its in-force set as this algorithm does, and MAY compute it incrementally, provided the result is the same:

```
resolve(H):                       H = the valid statements a node holds, as a set
  index H: bucket each statement by its authorisedBy; list, for every id, the
           revokes and endorses that name it as a target, in ascending id order
  F := {}                                               the in-force set
  for d := 1 .. MAX_DELEGATION_DEPTH:
    phase A: revokes and endorses at depth d
      for each bucket B at depth d whose authorising grant is in F (or the anchor's):
        keep(B, s) for each revoke and endorse s of B, in ascending id order
      for each other bucket at depth d: its endorses are dead; its revokes that are
        cut by a revoke are rescue candidates, the rest are dead
      rescue(s) for each candidate s, in ascending id order
    phase B: grants at depth d
      for each bucket B at depth d whose authorising grant is in F (or the anchor's):
        each grant g of B with removed(g) is removed; keep(B, g) for each other
        grant, in ascending id order
      for each other bucket: a grant not cut by a revoke is dead; one that is removed
        is removed; the rest are rescue candidates
      rescue(g) for each candidate g, in ascending id order
  return F

keep(B, s):   if B has kept Q(B) statements, or s is a delegating grant and B (not the
              anchor's) has kept AUTHORITY_DELEGATE_QUOTA of them: s is over quota;
              otherwise B keeps s and s is in F
rescue(s):    for each endorse e in F that names s and may rescue it, in ascending id
              order: keep(bucket of e, s), stopping at the first that has room;
              s is over quota if one tried and none had room, dead if none could
cut by a revoke(s): past the dead grants on s's chain, the first is removed
removed(g):   some revoke r in F names g, and r may remove g   (r is settled: phase A)
```

-   —The order is well founded. An endorse that may rescue a statement sits at a lower depth than it, and the endorse’s own bucket is settled before any rescue it keeps. A revoke that may remove a grant sits at the same depth or lower, and phase A runs before phase B. Whether a statement is cut by a revoke or by a quota depends only on grants above it, at lower depths. A revoke can never remove a grant on its own chain, and an endorse can never rescue one, since either would need a statement above itself. So no statement’s standing depends on itself, and the rescues one bucket keeps are served in ascending id order.
-   —Cost is linear. Each statement is validated once, walking at most four links. It is placed in one bucket once. Each (revoke or endorse, target) pair is checked once against a chain of at most four, and deciding whether a statement was cut off walks at most three grants. Resolution is therefore O(_S_ + _T_) for _S_ statements naming _T_ targets in all, choosing the lowest ids of a bucket by linear-time selection (sorting a bucket, or the endorses that name one target, costs a logarithmic factor). No rule recurses, so the revoke patterns that made the replay rule exponential have nothing to multiply.
-   —Roles follow the key. A node’s roles are those of the in-force grants whose subject is its nodeId _and_ its key, each with its scope, plus `anchor` for each pinned member of a threshold-1 anchor (§6.6.1). Its lifecycle authority over a CMB (§3.5) is the highest of the roles whose scope contains that CMB: anchor or admin (canonical), then validator (validated). Issuer and the non-authority roles confer none.

#### 6.6.5 Revocation and endorsement

-   —Revocation is effective. A removed grant confers nothing. Everything it authorised, and in turn everything those authorised, is dead unless rescued. Removing an admin’s grant takes its whole subtree with it, in one statement.
-   —Dead statements. A removed signer’s dependents are dead. A node MUST NOT relay a dead statement and MAY drop it, unless it is in the node’s live set (§6.6.7) as a grant on the chain of an in-force statement. A dropped statement that arrives again is resolved afresh like any other: it is dead unless an endorse has rescued it in the meantime, and a node that dropped it gets it back only from a node that kept it (§6.6.7).
-   —Nothing is un-revoked. While its revoke is in force a grant stays removed. To restore authority, a signer above issues a fresh grant: the fresh nonce makes it a different statement. A fresh grant does not revive the old grant’s dependents, because they name the old id. Demotion is a revoke, followed if wanted by a fresh grant of a lesser role.
-   —Rescue reconnects what a revoke cut off. An endorse keeps the grants and revokes it names, and everything that hangs from them, once a revoke has cut them off from the anchor. One use is when an admin leaves and the anchor keeps the validators it appointed. Another is when a key is retired and the grants its holder made should stand. Rescue never brings back a statement cut off by a quota: a grant over quota stays out, and so does everything below it. The endorser answers for what it names. Its bucket keeps what it rescues, counted like its own statements, and a rescued delegating grant takes one of its delegate slots (§6.6.6), so rescuing a delegate costs exactly what granting one would.
-   —An endorse never restores its signer. The removed signer’s grant stays removed. Anything it signs afterwards is a new statement that no endorse names, because an endorse can only name statements that already exist: their ids are inside its signed bytes. A removed signer therefore cannot regain authority through an endorsement, and an endorse by a statement’s own signer rescues nothing: it is in force only while that signer’s grant is, and then the statement needs no rescue.
-   —An endorse is never rescued. When an endorser’s own authority goes, what it rescued is cut off again. A signer above that wants it kept endorses it directly, which it may, since it stands above everything the endorser could reach.
-   —An endorse does not override a revoke. A rescued grant that an in-force revoke may remove is still removed. When it rescues a subtree, an endorser SHOULD also endorse the removed signer’s revokes within it. Otherwise those revokes die, and what they removed returns.
-   —An endorse of a statement whose authorising grant is still in force changes nothing until that grant is removed, so a signer may endorse before it retires a grant. To withdraw an endorse, remove its endorser’s grant, or revoke the endorsed grant directly; the endorser and anyone above it may. An endorser between a remover and the grant it removes keeps what it names: a remover that wants a whole subtree gone also revokes what is endorsed, or removes the endorser.

#### 6.6.6 Quota

-   —Per signer, per grant. A bucket keeps at most _Q_ statements: `AUTHORITY_QUOTA` (256) for a bucket authorised by a grant, and `AUTHORITY_ANCHOR_QUOTA` (4096) for the anchor’s. A bucket authorised by a grant also keeps at most `AUTHORITY_DELEGATE_QUOTA` (16) delegating grants (admin, validator, issuer). A bucket keeps, first, its own statements, when its authorising grant is in force: revokes and endorses in ascending id order (bytewise), then the alive grants that are not removed, in ascending id order, skipping a delegating grant beyond the delegate quota. Then, at greater depths, it keeps the statements its endorses rescue, in ascending id order, while it has room for them under both limits. A statement no bucket keeps is _over quota_: it is not in force, a node MUST NOT relay it, and a node MAY drop it unless it is in its live set (§6.6.7). A receiver SHOULD report a signer whose bucket is full to its operator.
-   —Deterministic. Which statements a bucket keeps depends only on the statements, never on which arrived first. Dead statements and removed grants do not count against any quota. Which delegates survive near the cap is decided by statement id, not by the order a signer issued them in. A signer that needs particular delegates to stand keeps below the cap, or asks for a further grant.
-   —One signer never displaces another. A bucket holds only statements signed under one grant, so a flood by one signer can only push out that signer’s own statements. Pending statements are held per session (§6.6.8) and never count against any bucket. A bucket keeps its own statements before any it rescues, so a rescue never displaces its endorser’s own statements either. The statements an endorser rescues compete only for that endorser’s room.
-   —Removals first, so the quota fails closed. A flood of grants cannot push out a revoke. A signer that floods revokes displaces only its own grants.
-   —Node capacity. A node MAY limit how many statements it stores. What it protects at the limit is what is in force, not a kind of statement. Validity is static: a removed signer can still sign any number of valid revokes, all of them dead, and an in-force holder can sign revokes beyond its quota. Protecting revokes by kind would let either crowd out honest in-force statements and grow storage without bound. When a node reaches its limit it first drops statements outside its live set, which it may drop anyway; dead and over-quota statements are ordinary candidates there, revokes and anchor-level statements included. Then it drops live statements in reverse authority order (§6.6.8): deepest first, grants before revokes and endorses at the same depth, and the highest id first. It never drops an in-force revoke or an in-force anchor-level statement. A revoke or an anchor-level statement that arrives at a full node is protected only if it would be in force once held. Then it displaces the last statement in that order that is not protected. Otherwise it is an ordinary candidate, like any other statement outside the live set. The protected set is bounded by the quotas of this section: in-force anchor-level statements by `AUTHORITY_ANCHOR_QUOTA` (4,096), and in-force revokes by the 256 statements each bucket keeps, in buckets whose grants are themselves in force. So protection cannot grow storage without bound. A capacity refusal is not a relay failure, and a node MUST NOT rate-limit or penalise the session that delivered the statement. So “removals first” and “fails closed” stay true under a storage limit: what a full node loses is the deepest delegated authority, never a removal in force. A node that has dropped live statements no longer resolves the same set as its peers, and it SHOULD report this to its operator. A storage limit is the node’s own, outside resolution: the quota rules above decide what every node resolves alike, and this rule decides only what a full node gives up first.
-   —Why per grant rather than per key. First, it keeps selection well defined depth by depth. A key can hold grants at several depths, and counting per key would let its statements at one depth decide which of its statements survive at another. Second, it gives a way to compact. A signer near its quota, or one that needs more than 16 delegates, is given a further grant, which is a further bucket. To compact, its grantor then removes the old grant and endorses what should stand, and everything else under the old grant is dead and can be dropped. The anchor has no grantor, which is why its quota is larger; re-pinning is its compaction.
-   —The bound, and why it holds. Below a holder _X_ are the statements whose chain contains _X_’s grant. A signer above _X_ may choose to rescue some of them; its own bucket keeps those, and they and what hangs from them are that signer’s choice, not _X_’s, so the figures below leave them out. Every other statement in force below _X_ is kept by a bucket whose authorising grant is _X_’s grant or an in-force delegating grant below it. That is its own bucket when its authorising grant is in force, or its rescuer’s bucket, whose grant is in force because an endorse is never itself rescued. Each such bucket keeps at most _Q_ = 256 statements and at most _D_ = 16 delegating grants. Each in-force delegating grant below _X_ is kept by exactly one such bucket and lies deeper than that bucket’s grant. So these buckets form a tree under _X_’s bucket in which every bucket has at most _D_ children and depth strictly increases. Only grants at depth 3 or less have buckets, since a depth-4 grant’s statements would be at depth 5. A depth-1 holder therefore has at most 1 + _D_ + _D_2 = 273 buckets below it, and so at most 273 × 256 = 69,888 statements and 273 × 16 = 4,368 delegating grants in force below it. A depth-2 holder has at most 17 buckets, 4,352 statements and 272 delegating grants; a depth-3 holder one bucket, 256 statements and 16 delegating grants. All of it dies with one revoke of _X_’s grant. The authority vector carries the attacks that broke the first version of this rule, each within these figures, and a tree that reaches the figure exactly.

#### 6.6.7 Properties and the authority root

-   —Order independence. The same set gives the same answer. Every rule above refers only to which statements are held, their ids, their signatures and their fixed chains. The evaluation order is fixed by depth and id, not by arrival. Statements that are invalid, pending, dead, removed or over quota have no effect on which statements are in force. The node keeps those of them that are grants on the chains of in-force statements, because it verifies those statements with them. Together with the in-force set they make the node’s live set, which a node MUST keep. Whether it keeps or drops the rest changes nothing for the set it holds now. A dropped statement can matter later, though: an over-quota grant comes into force when a lower one leaves its bucket, and a dead one when an endorse for it arrives. A node that dropped it gets it back only from a node that kept it, so a node SHOULD keep over-quota and dead statements while it has room. A signer whose statement was dropped everywhere sends it again.
-   —No cycles. A statement names others only by ids inside its own signed bytes, and an id is a hash of those bytes. A statement can therefore only name statements that already existed when it was signed. A cycle would need a statement whose bytes contain, directly or through others, its own hash, which SHA-256 makes infeasible. The references form a DAG. The depth cap bounds every walk even against a statement crafted to loop.
-   —Anti-entropy is set union. Statements are immutable and resolution is a function of the set, so exchanging statements and taking the union is all that synchronisation does. No merge rule or tie-break between nodes is needed. Nodes compare _authority roots_ to learn whether they agree (§6.6.8). Because held sets only grow and resolution is a function of them, repeated exchange between connected nodes converges, and it has converged when their roots match.

The authority root names one in-force set under one anchor:

```
pinDigest = lowercase hex(SHA-256(UTF8("mmp-anchor-pin-v1\n") ||
  lp(decimal(threshold)) ||
  lp(decimal(memberCount)) || concat(lp(member) for bytewise-sorted members)))
    member = key || ":" || nodeId when the threshold is 1 and the pin names the node holding
             the key; otherwise key

root = lowercase hex(SHA-256(UTF8("mmp-authority-root-v1\n") ||
  lp(pinDigest) ||
  lp(decimal(inForceCount)) || concat(lp(id) for bytewise-sorted in-force ids)))
```

-   —It is taken over the in-force set, not the held set. Held sets legitimately differ between nodes that agree: dead and over-quota statements may be dropped, and pending ones are held only in memory. In-force sets of nodes that agree are identical. The live set (the in-force set with the grants on its members’ chains) is also enough to recompute the in-force set, so a root can be checked from statements alone.
-   —It names the pin. Authority is relative to the anchor. Two different pins never share a root, and a re-pin changes it. Under a threshold of 1 a member’s nodeId is part of the pin, because it decides who is the anchor. Under a higher threshold nodeIds decide nothing and are left out of the digest, so two nodes that pin the same keys and threshold share a root whether or not they annotate them.
-   —Checking a claimed root. To check a root against a set of statements, a node verifies every statement against the pin, resolves the set, and recomputes the root of the resulting in-force set. The claim holds if and only if the two roots are equal. Supplying the live set is enough. A statement added to it, or left out, that changes what is in force changes the root.
-   —Binding a run or a decision to a root. An _environment_ here is an application at Layer 7 (§14) that runs work and records its outcomes: a Core Secure participant (§17.1) in that role, such as XMesh. MMP defines no separate conformance class for it, so the two requirements that follow bind such an application and are checked by its own tests, not by the MMP vectors. An environment that binds a run, an episode or a recorded decision to an authority root MUST keep that root’s live set itself. Peers serve only their current set (§6.6.8), so an old root’s statements cannot be fetched later. Inside a deterministic run the environment MUST apply mesh weights (§6.6.10) against the root it admitted for the current tick, never against its node’s live in-force set.
-   —Runs and ticks (informative). A run binds to a root, not to “the current set”. A replay against a later, larger set, one that includes a revoke that arrived afterwards, would otherwise resolve differently. When authority changes during a run, the environment admits the new root into its own input stream at a tick it chooses, so that a replay is deterministic. When a seat’s grant dies during a run, the hosted world decides the consequence inside the run at the tick it admits the new root, for example taking the seat’s agent out of play. MMP requires only that the change enter at one tick. That ordering, and that consequence, are the environment’s job, not MMP’s.

#### 6.6.8 Frames, gossip and anti-entropy

Four peer-scope frames (§7.1, [authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)) carry the set, on confirmed sessions only (§5.2). A statement is verified on its own signatures and chain, whichever session delivered it. A session confers no authority on what it carries, and a session that delivers a statement which fails verification SHOULD be rate-limited.

```
{ "type": "authority-statement", "statement": { ...one statement... } }
{ "type": "authority-digest", "root": "<64 lowercase hex>", "count": 7 }
{ "type": "authority-fetch", "reqId": "af-<16 hex>", "ids": ["auth-...", ...] }
{ "type": "authority-fetch", "reqId": "af-<16 hex>", "after": "" }
{ "type": "authority-set", "reqId": "<the request's reqId>",
  "statements": [ ... ], "missing": ["auth-...", ...], "next": "<opaque cursor>" }
```

-   —Gossip. When a statement first enters a node’s in-force set, the node relays it once, as an `authority-statement`, to its other sessions. The same holds for a statement that enters because another arrived, such as a pending statement whose chain completed. A node MUST NOT relay a statement that is not in force, except as a chain member inside an `authority-set`. A revoke is relayed as soon as it enters, since the revoke window (§6.6.12) runs until it arrives.
-   —Budget. A receiver keeps a budget per session for authority statements: the verification work it will do for that session over time. Every statement a session delivers spends that session’s budget, whether it was asked for (an answer to a fetch, a page of a pull) or not, and its cost is never forgiven below zero. The asker paces its own requests so that its budget for the session can absorb the worst-case answer. It starts a pull, asks for the next page, or sends a by-id fetch only when the session’s budget can pay for a full page: `AUTHORITY_PAGE` statements, each at the worst-case cost of verifying a statement under keys it has not seen. An answer within what was asked is therefore never dropped for budget. A statement nobody asked for, beyond the budget, is dropped unverified.
-   —Pending statements. A valid-looking statement whose chain is not complete (§6.6.3, rule 2) is pending. Before it verifies anything in such a statement, the receiver checks that it has room to hold one more pending statement on that session; a statement it could not hold is dropped unverified. It then checks the statement’s single signature, under §18.3.2, with the key its entry names, and discards it if that fails. Checking a key the node has not seen costs one scalar multiplication, paid from the session’s budget. It then MAY hold the statement in memory while it fetches the missing link from the session that delivered it. Held statements are keyed by id and signing key, so a forged copy cannot displace a genuine one. At most `AUTHORITY_PENDING_MAX` (64) are held per session. They are never persisted, relayed or counted against a quota, and they are released after `AUTHORITY_PENDING_TIMEOUT` (10,000 ms) or when the session closes. A node keeps at most one fetch in flight per (session, missing id), and sends a fetch only when the session’s budget allows (Budget, above). An anchor-level statement is never pending: the pin is always at hand.
-   —Fetching by id. `authority-fetch` with `ids` (1 to 64) asks for those statements. The responder answers with one `authority-set` carrying, in authority order, the closure of what was asked: each named statement in its live set with its chain; then every in-force revoke and endorse that names a statement already in the answer, each with its chain; and so on, the namers of namers, until a pass adds nothing or the answer reaches the page bound. Ids it does not serve are listed in `missing`, including those of statements it holds that are not in its live set (dead, over quota or pending): a dead statement is served only as a chain member of a live one. An answer carries at most `AUTHORITY_PAGE` (64) statements. A removed grant is served only with the revoke that removes it, so a fetch never hands out a removed grant as if it were in force.
-   —Authority order is ascending depth; within a depth, revokes and endorses before grants; within each, ascending id. In that order every statement arrives after everything that can change its standing: its chain, the revokes that may remove it, and the endorses that may rescue it. A receiver can ingest a page as it arrives.
-   —Anti-entropy. A node sends `authority-digest`, its root and in-force count, when a session is confirmed. It sends it again after its in-force set changes, at most once a second per session. A node whose root differs from the peer’s pulls the peer’s live set. It sends `authority-fetch` with `after: ""`, then pages with the `next` cursor of each answer until an answer carries none. It starts the pull, and asks for each page, only when the session’s budget can pay for a full page (Budget, above). Each page holds at most 64 statements, in authority order. Every statement received is ingested as gossip is. The peer, seeing the same mismatch, pulls in the other direction. A node keeps at most one such pull in flight per session. A responder SHOULD pace its answers per session (for example 4 a second, burst 16), and MAY refuse a fresh full pull on a session within 60 s of the last. The cursor is opaque, at most 128 characters. Statements that change while a pull is running are reconciled by the next digest. A pull that stops early, because the session closed or a page did not come, resumes from its last cursor. While the two roots still differ after a pull, a node repeats anti-entropy with backoff (for example doubling from one second up to a few minutes) rather than giving up after a fixed number of tries; a matching root, or a change to either set, resets the backoff.
-   —Persistence. A node SHOULD persist its live set and MAY persist more. Persisted statements have no integrity of their own. On load, a node MUST re-verify every statement against the pinned anchor, chain by chain from the top, and resolve the set afresh. It MUST NOT trust a status or a root read from disk. It keeps the statements that fail under the current pin, and judges them again under the next (§6.6.1). No receipt time is kept, because none is used.

#### 6.6.9 Authority follows the key

-   —A grant confers its role on its subject’s nodeId and key together. A CMB or attestation carries its author’s role only when the key that verifies its signature (§18.3.1) is that grant’s subject key. A grant that names the same nodeId with another key confers nothing on the holder of the first.
-   —A statement’s signing key comes from its authorising grant, or from the pin, and never from a node’s key registry. That is what makes resolution the same at every node, whatever keys each has bound.
-   —Grants as a binding source. An in-force grant is a source a key registry MAY bind its subject from (§3.4), as a view over what is in force now: the binding lasts only while the grant is in force, and goes with it unless another source binds the same key. It binds only an unbound nodeId. If the nodeId is bound to a different key, that is an identity conflict (§3.4): it is recorded and reported, and the binding is unchanged. The grant stays in force, since resolution does not read the registry, but at that receiver it confers nothing usable, because no record that verifies under the bound key is signed by the grant’s key.
-   —The receiver’s own nodeId. A receiver MUST NOT take a binding for its own nodeId from any grant, because it knows its own key (§3.1.3). A grant that names the receiver’s nodeId with a foreign key confers nothing on the receiver, and the receiver SHOULD report it: someone has vouched a foreign key for its identity.

#### 6.6.10 Using authority: agreed outcomes and mesh weights

-   —Outcomes that must be agreed are decided once, by the environment. Some outcomes several parties must agree on: that a piece of work was validated, that a payment is due. Such an outcome is decided once, by the environment the decision belongs to (the application or runtime that runs the work), against that environment’s in-force set at that moment. It is recorded there, bound to the authority root it was decided under (§6.6.7). The record is the outcome. A node MUST NOT re-derive or re-judge such an outcome from mesh gossip, and MUST NOT treat a later change in its own in-force set as reversing it. (Informative: XMesh keeps such a record for the work it runs.)
-   —Mesh weights are judged by the receiver, when they are used. Everything else authority does in the mesh is a weight a receiver applies: the origin admission weight (§6.4), lifecycle advancement in its own store (§6.5), and the weight of an admission, tether or grounding attestation (§6.7, §15.8, §17.2). A receiver judges each against its own in-force set at the moment it applies it. A transition it has already made in its own store is its own record, and a later revoke does not undo it. A weight it applies afresh, each time it weighs an attestation, uses the in-force set of that moment. A scoped grant’s weight applies only to CMBs inside its scope (§6.6.2). Inside a deterministic run the environment uses the root it admitted for the tick, not the moment (§6.6.7). A statement carries no signed time that could place it inside a period of trust: once a signer’s grant is not in force, nothing that signer signs, whatever time it claims, carries authority.

#### 6.6.11 Migration from the time-replay rule

-   —The old frames confer nothing. The earlier `role-grant` and `role-revoke` frames and records, as signed by sym 0.14.0 and earlier, are retired (§7.1, legacy). A node MUST NOT resolve authority from them and MUST NOT emit them. The old revoke `cutoff`, the grant time `grantedAt`, resolution at a time _T_, and the receipt-time rule are removed. No statement carries a cutoff, and no receipt time is stored.
-   —Anchor grants map one for one. For each old grant signed by the anchor that the anchor’s holder still regards as in effect, the anchor issues one grant: the same subject nodeId and key (`granteeKey`), `authorisedBy: "anchor"`, and the role mapped (`validator` stays `validator`; the granted `anchor` role becomes `admin`). A single-key anchor is the 1-of-1 set, so the node holding that key can issue these without co-signers. An old grant with no `granteeKey` has no subject key. It cannot be carried over until the key is known from a confirmed handshake or an out-of-band pin. Migrated grants carry no scope, since no old grant had one.
-   —Deeper chains carry over within the cap. Once a grantor holds its own new grant, it re-issues each old grant it signed that it still regards as in effect. Each re-issued grant names the grantor’s new grant in `authorisedBy`, provided the role table of §6.6.2 permits it and the depth stays within `MAX_DELEGATION_DEPTH`. An old link that does not fit, such as a validator that promoted a validator, does not carry over by itself. Its grantee needs a grant from the anchor or an admin. Each signer re-issues only its own grants, so migration needs no agreement between nodes. An old grant that an old revoke had cleared is simply not re-issued.
-   —Pre-0.14 grant entries are legacy claims, unchanged. A key that a pre-0.14 implementation (sym 0.13) recorded for a nodeId from a grant, or from an unproven hello, is a _legacy claim_ (§3.4). It is the key the receiver expects for that nodeId: a session proving it binds it, and one proving a different key is an identity conflict. It verifies nothing, binds nothing by itself and confers no authority.
-   —A flag day. This is a flag day, not a gradual migration. A node running this rule ignores the old frames, so until grants are re-issued under the new rule it resolves every node, itself included, as a participant, whatever the old rule granted. A node running the old rule ignores the four new frames as unknown types (§7) and keeps the old authority. Each sees only its own kind. The anchor’s holder SHOULD migrate first and re-issue at once, and each grantor SHOULD re-issue as soon as it holds its own new grant, so the gap lasts no longer than the mesh’s upgrade.

#### 6.6.12 Residuals

-   —The revoke window. Until a node holds a revoke, it treats the removed grant as in force. Gossip relays a revoke as it enters; anti-entropy bounds the rest. A node learns a revoke at the latest at its next digest exchange with any peer whose in-force set includes it, and those exchanges happen when a session is confirmed and whenever a set changes. A partitioned node stays exposed until it reconnects. An environment deciding an agreed outcome (§6.6.10) SHOULD bring its in-force set up to date with a node it trusts to be current before it decides.
-   —The threshold holders are the root. Any _t_ anchor keys together can grant, revoke and endorse anything. Compromise of _t_ keys is root compromise, recovered only by re-pinning out of band. Fewer than _t_ keys can do nothing alone; under a threshold of 1, therefore, every pinned key alone is the root.
-   —A compromised holder acts until it is removed. Within its quota and delegate quota, and within the figures of §6.6.6, a compromised authority holder can grant, revoke and endorse below itself until a signer above removes its grant. Endorsement then keeps what should stand.
-   —Verification costs one scalar multiplication per new key. Checking that a key is of prime order (§18.3.2) costs one multiplication by _L_ for each key a node has not seen before; under a cofactorless verifier _R_ costs only a byte comparison. A flood of statements under fresh keys is bounded by the session’s budget, which every statement a session delivers spends, asked for or not, and which the asker paces its own requests to (§6.6.8), and by the quotas once chains are held. The pending limits bound how many statements a session can have held, not how many checks it can cause.
-   —Grants are visible. Every node that holds the set can read who holds which role. Authority statements are not confidential.

Identity vs. authority. This section withdraws _authority_. A compromised signing _key_ is a different failure: MMP does not define key rotation (§3.4). A node whose key is compromised generates a fresh identity and is granted again under its new key. Revoking the old key’s grants contains the damage in the meantime, and endorsing what the old key granted keeps what should stand.

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

The protocol defines the grant mechanism (Sections 3.5.1 and 6.6) but does not prescribe automated promotion criteria. An implementation MAY define heuristics (e.g. promote after N remixes cited by peers), but the grant itself MUST be a signed grant statement from the anchor or an admin, naming the authority that permits it. This keeps the trust chain auditable.

Why does authority carry no time?

Every node would have to agree on one history of who held what when, built from times the signers chose themselves and statements that arrive in any order, and nothing in a mesh orders them. Resolving a set instead gives every node holding the same statements the same answer, with no history to agree on. Where a moment matters, the environment that decides records the authority root it decided against (Section 6.6.7).

What does an endorse add that a fresh grant does not?

Continuity. A fresh grant is a new statement with a new id, so everything signed under the old grant still names the old id and dies with it. Once a revoke has cut the named statements off, an endorse keeps them, and everything that hangs from them, without giving their signer its authority back. It costs the endorser what granting them would: its bucket keeps them, and a rescued delegate takes one of its delegate slots.

Why can an endorse not bring back a grant that was over quota?

Because the quota is what bounds a compromised holder. If an endorse could reconnect what a quota dropped, a holder could issue any number of delegates, let the quota drop the extras, and endorse what hangs under them, each with a full bucket of its own. Rescue exists for the case a quota never creates: a subtree cut off because a signer above it was removed.



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

control-encrypted

2

After decrypt

core

[control-encrypted.schema.json](/spec/mmp/schema/control-encrypted.schema.json)

Directional ChaCha20-Poly1305 envelope sealing one control frame; shares the session's per-direction sequence with cmb-encrypted.

cmb-anchors

4

Sealed only

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

The first sealed frame a node sends on every Core Secure session it admits: the cognition keys of the sender's own records about to be replayed as context, or none (§9.4); changes no verification or admission.

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

Correlation id with the keys returned and the keys not found; each returned record travels before it as its own cmb-encrypted frame.

authority-statement

3

Authority

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

One signed grant, revoke or endorse statement, identified by the hash of its canonical bytes; it counts only as §6.6 resolution places it.

authority-digest

3

No

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

The sender's authority root and in-force count, for anti-entropy (§6.6.8).

authority-fetch

3

No

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Asks for statements by id, with their chains, or for a page of the responder's live set in authority order (§6.6.8).

authority-set

3

Authority

core

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Answers an authority-fetch with statements in authority order; each is verified as gossip is, never on the session's word.

mood

4

Sealed only

core

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Session-scoped mood text and context, sealed in control-encrypted on a confirmed Core Secure session; attributed to the session's proven peer; never stored, relayed or remixed (§9.3).

room-join

2

Sealed only

core

[room-join.schema.json](/spec/mmp/schema/room-join.schema.json)

Owner-signed room-join grant presented after the handshake; admits the session to a gated room when it binds the proven key (§5.8.1).

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

Relay-level error: message, with kind, code (the close that follows) and reason (§4.4.9).

role-grant

legacy

No

legacy

—

Retired time-replayed role grant (sym 0.14.0 and earlier drafts). Confers nothing; MUST NOT emit; ignore on receipt. See §6.6.11 migration.

role-revoke

legacy

No

legacy

—

Retired time-replayed role revoke with a cutoff (sym 0.14.0 and earlier drafts). MUST NOT emit; ignore on receipt. See §6.6.11 migration.

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

xmesh-insight

legacy

No

legacy

—

Legacy runtime projection.

All cognitive content — observations, decisions, feedback, directives — MUST be sent as `cmb` frames. Only `cmb` frames enter SVAF evaluation, produce anchor weights, and modulate CfC state.

The registry distinguishes Core Secure wire types from retained legacy and runtime-extension types. A Core Secure participant MUST complete the three-frame authenticated handshake before it accepts `cmb` or `cmb-encrypted`. It MUST NOT silently downgrade to the legacy one-frame `handshake` or to an unsigned application frame.

The `relay-*` types are transport-scope (Section 4.4): they are exchanged between a node and a relay, never between peers, and never reach the application layer. The relay forwards peer frames as opaque payloads (Section 4.4.4) and does not originate any of the peer-scope types above.

Sealed control frames. Only the frames a session protects are bound to it. A frame in clear can be read and injected by whatever sits on the path — over a relay, the relay itself and, before relay authentication proves keys, any client that can claim a nodeId there (§4.4.1, §4.4.4). In a Core Secure session that is CONNECTED (§5.3), a sender MUST therefore send every peer-scope frame other than `ping` and `pong` sealed: a record in `cmb-encrypted`, and every other frame — `peer-info`, `wake-channel`, `mood`, `cmb-fetch`, `cmb-fetch-result`, `cmb-anchors` (§9.4), `room-join` (§5.8.1), the four authority frames (`authority-statement`, `authority-digest`, `authority-fetch`, `authority-set`, §6.6.8), `error` and every negotiated extension frame — as the inner frame of a `control-encrypted` envelope (§18.2.1). A receiver MUST discard any of those frames that arrives in clear on a CONNECTED session, with one exception: it MAY read an `error` in clear, as the informational frame it always is (§7.2), but a clear error changes nothing. It closes no session, moves no sequence and changes no state, because whatever sits on the path can forge it, and a receiver cannot tell whether its sender still holds a session. The one clear error a node acts on is 1011 `UNKNOWN_SESSION`, which MAY prompt a new handshake and nothing else (§5.2.2). A sealed error is the peer’s own: one whose action is Close (§7.2) ends the session. `ping` and `pong` MAY travel in clear or sealed, and a receiver handles a sealed one as liveness, exactly as a clear one, and answers a sealed `ping` with a `pong`, in clear or sealed (§5.4). The inner frame of a `control-encrypted` envelope MUST NOT be a handshake frame (including the legacy `handshake`), `cmb`, `cmb-encrypted`, `control-encrypted`, `state-sync` or a `relay-*` frame. A sealed frame that opens advances its direction’s sequence (§18.2.1) whether or not its inner frame is then accepted; refusing the inner frame changes nothing else.

Session-bound frames speak only for the session’s peer. `wake-channel`, `mood`, `cmb-fetch`, `cmb-fetch-result`, `cmb-anchors`, `room-join`, `authority-digest` and `authority-fetch` take their sender from the session: the proven nodeId of the peer whose keys opened them. A receiver MUST attribute them to that nodeId and the name the handshake bound to it (§5.2). None of them carries a sender field, and a receiver MUST NOT take a sender from inside a frame. `peer-info` describes other nodes; its entries are hints. A receiver MAY use a gossiped wake channel to try a wake, but MUST NOT let it replace a wake channel the named node registered over its own session, and MUST NOT bind an identity or a key from it (§18.3). Sealing proves who sent a frame, not that what it says about third parties is true.

Author-signed frames carry their own authority. A frame that carries a signed statement takes its authority from that signature, never from the session that delivered it: a signed statement may be relayed over any session, and the session only transports it. Sealing it still keeps it from the relay, and from injection. The key it is verified against depends on what it is. An authority statement, carried in `authority-statement` or `authority-set` (§6.6.3), is verified by §6.6.9 and §18.3.2: against the subject key of the grant its `authorisedBy` names, or the pinned anchor keys, under the one verification rule, and never against a key a registry or a session binds to a nodeId. A record (§18.3.1), and an extension’s author-signed frame such as a `sym-attest-v1` attestation (§16.4), is verified against the key the receiver binds to the nodeId it names (§3.4), never against the key of the session that delivered it.

Deprecated — `state-sync`. The `state-sync` frame carried a node’s hidden-state vectors (h₁, h₂). Per the hidden-state locality invariant ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), hidden state MUST NOT cross the wire. Implementations MUST NOT emit `state-sync` and SHOULD ignore it on receipt. It is retained in this registry only to reserve the type and document the deprecation; all peer influence flows through `cmb` frames evaluated by SVAF.

### 7.2 Error Frame

When a node encounters a protocol-level error, it SHOULD send an `error` frame before closing the connection (if applicable). Error frames are informational — the receiving node MUST NOT treat them as commands. A clear error changes nothing (§7.1). A sealed error is the session peer’s own notice: one whose Action is Close ends that session at the receiver too; any other sealed error is information.

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

nodeId already connected (Legacy Import only: Core Secure never refuses a session that proves the bound key, §3.4)

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

Encrypted-frame counter repeated or moved backwards. Retained for compatibility: a receiver now discards a replayed frame and keeps the session (§18.2.1), so a conformant node does not send it

1009

IDENTITY\_CONFLICT

Close

A nodeId bound to one identity key proved a different key (§3.4); recorded and reported. The refused side does not retry automatically

1010

SESSION\_CLOSED

Close

The sender closed the session for a reason no other code names; the reason is in message (§5.2.2)

1011

UNKNOWN\_SESSION

None

The sender holds no session for the frame it received; prompts the client to re-handshake, never closes a session (§5.2.2)

Codes 1xxx are connection-level: they concern a connection or a session, and most close it; the Action column says which. Codes 2xxx are evaluation-level (informational). Error-frame codes are a registry of their own, separate from the relay’s WebSocket close codes (§4.4.9): an implementation MUST NOT send an error frame with a code in the 4000–4999 range, which those close codes occupy. Error frames MUST NOT contain sensitive information.

### 7.3 Type Naming and Extensions

Frame types are identified by their `type` string value. Core types (this specification) MUST NOT be redefined by extensions. Extension types MUST use `<extension>-<name>` format. Vendor types MUST use `x-<vendor>-<name>` format and MUST be silently ignored by non-supporting nodes.

### Q&A

Why MUST nodes silently ignore unknown frame types?

Without this rule, you can never add new features to the protocol. If a node crashes or rejects unknown frame types, then deploying a new extension (like mesh rooms) requires upgrading every node on the mesh simultaneously — impossible in a peer-to-peer system. Silent ignore means old nodes and new nodes coexist: a node running a new extension sends its frames, and nodes that don’t support the extension simply ignore them. No crash, no error, the mesh keeps working. When a node adds support later, it handles the frame. No coordinated upgrade needed. This is the same principle used by HTTP (unknown headers ignored), TCP (unknown options skipped), and HTML (unknown tags ignored). Every successful protocol is evolvable because of this rule.

What happens if a relay receives an unknown frame type?

The relay forwards it. The relay is a dumb transport pipe — it wraps the payload in a { from, fromName, payload } envelope and sends it to the target or broadcasts it. It never inspects the payload type. This means extension frames (room, vendor, future types) flow through the relay without any relay changes. The intelligence is at the endpoints, not the transport.

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

Each category carries signed symbolic text and content-address metadata. A receiver derives any machine-comparable embedding locally from that signed text; embedding vectors never cross the wire. The `mood` category additionally carries optional numeric `valence` (-1 to 1) and `arousal` (-1 to 1) values. Neither the address nor the `mmp-sig-v2.0` signature covers them, so a Core Secure verifier drops them before admission (§8.8.4); the signed mood _text_ is what carries affect between nodes.

A CMB MUST NOT be modified after creation. When an agent remixes a CMB, it MUST create a new CMB whose `metadata.lineage` contains `parents` (direct parent CMB keys) and optionally `method` (the fusion method used; carried but not signed, and dropped by a Core Secure verifier, §8.8.4). Transitive provenance is obtained by recursively resolving those signed parent records. A sender MUST NOT supply or rely on an unauthenticated transitive-closure field.

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

Normative record — see [§8.8 Record Model](#record). The address is `"cmb-"` + 64 lowercase hex, and the digest is a **promote-odd Merkle root over the seven per-category keys**, not a hash of a concatenated preimage. This section gives the cognition-key construction byte-exactly; §8.8 makes the construction implementable and reproducible from that text alone. With `lp` as in §8.8.4 (the ASCII decimal UTF-8 byte length, a colon, then the bytes):

```
categoryKeyV1(name, text) = lowercaseHex( SHA-256( UTF8("mmp-cmb-v1\n") || lp(name) || lp(text) ) )
                            // text is NFC; the result is the category's meta.key

leaf(name)  = SHA-256( 0x00 || K )     // K: the 32 bytes the 64 hex characters of categoryKeyV1 encode
pair(l, r)  = SHA-256( 0x01 || l || r )

level 0     = leaf(focus), leaf(issue), leaf(intent), leaf(motivation),
              leaf(commitment), leaf(perspective), leaf(mood)          // CAT7 order
level n + 1 = pair the nodes of level n left to right; a last node with no partner
              is promoted to level n + 1 unchanged
blockKeyV2  = "cmb-" || lowercaseHex(the single node left)              // 7 → 4 → 2 → 1
```

Why this section changed in 2.0. Through 1.1.0 this page specified a flat `SHA-256` over a length-prefixed concatenation of the seven category texts plus a role tag. The implementation mints the Merkle form. **Both wear the same `cmb-` prefix**, so an implementation built to the older text computes a _different address for the same content_ and nothing signals the mismatch — it fails silently, at every record. That is the divergence 2.0 exists to close.

Schemes a node may encounter. The reference implementation classifies three: `block-v2` — the Merkle form, and the _only_ form it mints — together with `root-v1` and `remix-v1`, the earlier flat derivations, retained so older records can still be classified. A conforming node MUST mint `block-v2`.

-   Category text MUST be Unicode NFC (UAX #15): an emitter normalises category text, `createdBy`, `room` and `application.schema` to NFC before minting, and a verifier refuses a record in which any of them is not NFC (§8.8.5). Category order is the fixed CAT7 order. Mood contributes its **text only**; valence, arousal and all vector embeddings are excluded from the address.
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

### 8.8 Record Model

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
-   —`to` is the record’s audience: `null` for a room-bound record, which enters the payload as `lp("")`, or the recipient’s nodeId for a directed one. It is the only source of the record’s binding (§9.2.2); no transport field overrides it.
-   —New v2.0 records MUST declare `mmp-cmb-merkle-v2`; a verifier MUST NOT guess among address derivations sharing one prefix.

Carried but unsigned members. Four members travel with a record and are not bound by this payload: each category’s `meta.key`, the mood category’s `valence` and `arousal`, and `metadata.lineage.method`. A relayer can change any of them in a record whose signature still verifies. The payload also leaves four forms unbound: the order of parents, the Unicode form of a signed string, an empty lineage against `null`, and an absent application against `null`. §8.8.5 step 1 makes each canonical. The four members are handled as follows:

-   —`meta.key` is derived: a verifier MUST recompute it from the category name and the signed text (§8.2.1) and MUST refuse a record whose carried value differs (§8.8.5, step 4). Recomputing it makes it as trustworthy as the text it is derived from, without signing it.
-   —`valence`, `arousal` and `lineage.method` are unsigned and carry no authenticated meaning. A Core Secure verifier MUST drop them before admission, so the record it admits, stores, delivers or serves again is the signed projection without them, and a receiver MUST NOT act on a value it was sent for them. An emitter MAY still include them; a reader under an explicitly selected Legacy Import profile may show them, labelled as unverified.

Adding them to this payload would change the `mmp-sig-v2.0` bytes, and so every published v2.0 signature, assertion identity and vector. If authenticated affect values are needed, they belong in a new signature suite with its own identifier, which a verifier selects by `signatureSuite` (§8.8), so records signed under `mmp-sig-v2.0` stay verifiable. (Informative: the SYM runtime from 0.14.0 recomputes and checks `meta.key`, and drops the other three at ingress, on fetch and at egress.)

### 8.8.5 Verification order

Before step 1, and for a sealed frame again immediately after step 2, a verifier MUST check the size limits of §8.8.6 and refuse a record over any of them without doing any other work on it.

1.  Validate the negotiated frame schema, and the record schema strictly, and keep only the signed projection. For a sealed frame the record schema and the projection apply to the decrypted record, immediately after step 2, as the size check does.
    -   Every object is closed (`additionalProperties: false`): a member the schema does not define is refused. The one exception is an unrecognised category, which is dropped (§8, forward compatibility).
    -   Every member already has its schema’s JSON type. A verifier MUST NOT coerce one: a number is not its decimal string, and an array or object is not a string.
    -   `metadata.createdByNodeId` is a lowercase UUID, and `metadata.to` is a lowercase UUID or `null`, and nothing else (§3.1.1).
    -   Every signed string is already NFC (UAX #15): each category’s `text`, `createdBy`, `room` and, when present, `application.schema`. A verifier refuses a value that is not, and never normalises it, as it never coerces a type. `room` is a §5.8 room identifier (`[a-z0-9._-]`, 1 to 64 characters), as the handshake room is. `createdBy` is at most 256 characters, and `lineage.parents` and each `meta.parents` hold at most 256 entries of at most 256 characters, counted in Unicode code points, as JSON Schema’s `maxLength` counts them.
    -   The projection is canonical, so one assertion is held as the same bytes at every node: `lineage.parents` and each `meta.parents` are sorted bytewise, as they are signed (§8.8.4), a `lineage` whose `parents` is empty becomes `null`, and an absent `application` becomes `null`, each of which signs the same as the form it replaces. The [record-projection vector](/spec/mmp/conformance/v2/record-projection-v2.json) pins the projection of relayer-style variants of signed records, and each refusal.
    -   A record that carries an embedding vector, or any member the schema does not define other than an unrecognised category name directly under `categories`, is refused (§8.8.5 step 1, §9.2.1).
    -   The verifier then drops the carried but unsigned members (§8.8.4). Every later step, and admission, storage and delivery, sees only the projection: the members `mmp-sig-v2.0` binds, with each `meta.key` checked in step 4.
2.  When encrypted, authenticate and decrypt the transport envelope.
3.  Verify application encoding, length and digest.
4.  Recompute every category key and the cognition key, and reject a record whose carried `meta.key` or `metadata.key` differs.
5.  Recompute the assertion identity and reject a carried mismatch.
6.  Resolve the author key by `createdByNodeId` and verify the Ed25519 signature.
7.  Verify signed room and recipient audience.
8.  Only then expose the record for delivery and receiver-autonomous admission.

Failure at any cryptographic step is a refusal, not an “unverified success.” Legacy reading belongs to a named migration profile and MUST NOT downgrade Core Secure automatically.

### 8.8.6 Record size limits

A record is bounded so that it always fits in one sealed frame, and so that a receiver can refuse an oversized one before doing any work on it. The limits are in bytes:

Limit

Bytes

Measures

MAX\_CATEGORY\_TEXT

262,144 (256 KiB)

The UTF-8 length of one category’s text, after NFC normalisation (§8.2.1)

MAX\_RECORD\_TEXT

524,288 (512 KiB)

The sum of those lengths over the seven categories

MAX\_RECORD\_BYTES

737,280 (720 KiB)

The length in bytes of the record’s RFC 8785 serialization (the JSON Canonicalization Scheme, which is UTF-8): the two-section logical record (§8.8.1), with `metadata.application.data` included

-   —One measure. Every receiver has to reach the same verdict on the same record, so the encoded size is measured on one serialization, not on whatever bytes arrived or whatever a local encoder writes. RFC 8785 writes strings with only the escapes JSON requires, and other characters as their UTF-8 bytes; it writes numbers as ECMAScript does and sorts members. Its length is therefore the length of ECMAScript `JSON.stringify` of the record, whatever the member order. An encoder that escapes every non-ASCII character (`\uXXXX`, the default of some JSON libraries) counts a CJK character as 6 bytes instead of 3, and is not this measure. The [record-size vector](/spec/mmp/conformance/v2/record-size-v2.json) pins the measure and each limit at its boundary.
-   —An emitter MUST NOT mint a record over any limit, and a receiver MUST refuse one. Records are never split: a node with more to say emits more records, linked by lineage.
-   —Where the check sits. For a cleartext frame, the receiver checks before §8.8.5 step 1. For a sealed frame, it checks twice. Before decrypting, it refuses a `sealed` value longer than a `MAX_RECORD_BYTES` plaintext could produce: ⌈4 × (737,280 + 16) / 3⌉ = 983,062 base64url characters. Immediately after step 2, it checks all three limits on the decrypted record. Either way, the check comes before schema validation, key recomputation, signature verification and any encoding of text.
-   —Why these numbers. A frame is at most 1 MiB (§4.1). A sealed frame carries its plaintext as base64url, a third larger, so a record above about 768 KiB cannot travel in one `cmb-encrypted` frame at all. 720 KiB leaves room for the envelope, the clear metadata and the relay’s routing wrapper. 256 KiB per category and 512 KiB in all bound the text a receiver must normalise, hash and encode before it decides anything. They also leave room for metadata and application bytes, whose decoded length is at most 524,288 bytes (§8.8.3). The encoded limit binds all of them together.

Implementation status: the SYM runtime 0.14.0 enforces these three limits when it mints and when it receives, and refuses a sealed value longer than 983,062 characters before opening it.

Machine contract. Download the [record schema](/spec/mmp/schema/cmb.schema.json), [signature vectors](/spec/mmp/conformance/v2/record-signature-v2.json) and [application vectors](/spec/mmp/conformance/v2/application-v2.json).

### Q&A

Why are all 7 categories required, not optional?

The cognition address and SVAF evidence are defined over a fixed CAT7 tuple. Missing categories would change both constructions. An emitter therefore normalizes a category it cannot meaningfully extract to the canonical neutral value before addressing and signing; the receiver may classify that neutral category as non-evaluable when forming its whole-record admission decision (§9.2.1).

Why not let agents define their own categories?

SVAF needs a shared schema to compare incoming categories against local anchors. If each agent defined its own categories, cross-domain evaluation is impossible — a fitness agent and a music agent would have no common dimensions to compute drift on.

Why does mood carry valence and arousal but other categories don’t carry numeric values?

Mood has a well-established dimensional model (Russell’s circumplex). other categories are inherently symbolic — "debugging auth module" has no meaningful numeric axis. Valence and arousal are RECOMMENDED, not required — agents without reliable circumplex data omit them.



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

Embedding vectors are receiver-local. xf MUST be computed by the receiver from the category’s own `text`, in the receiver’s own encoder. An emitter MUST NOT include embedding vectors in a record, and a Core Secure receiver refuses a record that carries one: the record schema is closed (§8.8.5 step 1), and a vector is a member it does not define. Under any profile a receiver MUST encode from text and MUST NOT use a transmitted vector for admission. The reason is that a foreign vector is _unusable_, not merely untrusted: drift is measured against the receiver’s anchors in the receiver’s encoder, so a vector produced by a different encoder is not comparable — the comparison is meaningless rather than imprecise, and no signature can make a cross-encoder number mean something. Nothing in this specification requires nodes to share an encoder, and requiring it would reintroduce a center. Only the **text** is normative; the vector is the receiver’s own reading of it.

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

A CMB’s binding is determined by its authenticated recipient, `metadata.to`: the author signs it in the §8.8.4 payload, and on a sealed frame it is also bound into the AEAD associated data (§18.2.1). A receiver MUST take the binding from `metadata.to` of the record it verified (§8.8.5), and in Core Secure it MUST NOT take it from a transport routing envelope (§4.4.4) or from any other unsigned field. A Legacy Import profile (§17.3), whose records may carry no signed audience, states its own rule. The envelope is not authenticated, the relay does not forward its `to`, and under per-session encryption every sealed frame is addressed to exactly one peer, whether the record inside it is directed or room-bound — so an envelope-derived binding would make every room broadcast directed, and would let whoever writes envelopes decide what reaches an agent unfiltered.

-   — Room-bound (autonomous). A CMB whose `metadata.to` is null: it is addressed to its authenticated room, however many frames carried it. The receiver evaluates it autonomously: SVAF gates _both_ memory admission and delivery. A room-bound CMB that SVAF rejects (or deems redundant) MUST NOT be surfaced to the application layer — this is receiver-autonomous attention, the mechanism that keeps broadcast traffic from overwhelming every node. (Mood is the sole exception — §9.3.)
-   — Peer-bound (directed). A CMB addressed to a specific recipient (`metadata.to` = this node). A directed CMB is a request from one agent to another; the receiver MUST surface it to the application/agent layer _unconditionally_, regardless of the SVAF verdict. For a directed CMB, SVAF governs _memory admission only_ — the receiver MAY still decline to store a directed CMB it finds redundant or foreign, but it MUST NOT withhold delivery on those grounds. Suppressing a peer-bound CMB because SVAF scored it low is a conformance defect (the agent was spoken to and did not hear it). A receiver MAY refuse, before delivery, a directed CMB whose signed `createdTimestamp` is older than the window over which it keeps the marks it de-duplicates delivery by. That is replay protection, not withholding: a record older than the window could be one already delivered and forgotten.
-   — Addressed to another node. A CMB whose `metadata.to` names a node other than the receiver fails the recipient-audience check of §8.8.5 (step 7). It MUST NOT be delivered or admitted. This is the case a misrouted frame or a forwarded copy of someone else’s directed record produces; the mood exception of §9.3 does not apply to it.

Delivery MUST be exactly-once per received CMB: a directed CMB that SVAF _admits_ surfaces through the normal admission path; a directed CMB that SVAF _rejects_ surfaces through the unconditional-delivery rule above. Implementations MUST ensure these two paths do not both fire for the same CMB. Receive-path de-duplication (§4.2) applies equally to both bindings.

Because delivery and memory admission are decoupled, a delivered CMB SHOULD carry an ingestion indicator so the consuming agent can tell the two outcomes apart: a CMB that was _ingested_ (admitted to memory as a remix with lineage) versus one that was _delivered only_ (surfaced to the agent but not stored — the directed-but-SVAF-rejected case). Without this signal an agent cannot know whether a directed request it just received is recallable from its own memory later or was a transient message. The reference implementation exposes this as a boolean on the delivered entry (`remixed`: true on the admission path, false on directed delivery-without-admission) alongside the SVAF `decision`.

### 9.3 Mood category extraction

Mood is a CAT7 category within the CMB; it is also carried as its own lightweight frame type (`mood`, §7.1) for sharing mood with a connected peer, distinct from `cmb` frames — in either carrier, mood delivery is not SVAF-gated memory admission. Mood text is cognitive content: in Core Secure the `mood` frame travels only sealed, as the inner frame of `control-encrypted` (§7.1, §18.2.1), and is attributed to the session’s proven peer. Affective state crosses all domain boundaries — this is the only category with this property.

The mood frame. `{ type: "mood", mood, context, timestamp }` (§7.1, [control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)): `mood` is text of 1 to 1,024 characters, `context` is text of at most 4,096 characters or null, and `timestamp` is the sender’s, information only. The frame names no sender and carries no valence or arousal (the CMB mood category carries those). It is session-scoped: in Core Secure it travels only on a confirmed session, as the inner frame of `control-encrypted` (§18.2.1), and a mood frame in clear on a CONNECTED session is discarded (§7.1). A receiver attributes it to the session’s proven nodeId and the name the handshake bound to it (§5.2), and refuses a mood frame that carries any other member, a sender field included. It is not a record. It carries no signature, and a receiver MUST NOT store it, relay it, remix it or treat it as a CMB; it reports it with no record verification (verification null) together with the session’s facts. A receiver MAY weigh the mood against its own state, for example by drift, and surface or ignore it; neither is memory admission.

When SVAF rejects a CMB (totalDrift > Tguarded), the receiving node MUST still inspect the `mood` category. If the mood category contains a non-neutral value (text ≠ "neutral"), the implementation MUST deliver the mood category’s `text` to the application layer for autonomous processing; `valence` and `arousal` SHOULD be included when present (they are RECOMMENDED, not required, at emission — §8.2). Under `mmp-sig-v2.0` they are unsigned and a Core Secure verifier drops them (§8.8.4), so in Core Secure they are not present and the signed mood text is delivered alone. The full CMB is not stored, but the mood category is not lost.

This ensures that a coding agent’s observation “user exhausted after 3 hours debugging” reaches a music agent even though the focus (“debugging auth module”) and issue (“type error in handler”) categories are irrelevant to the music domain. The music agent receives only the mood: `"exhausted" (v:−0.6, a:−0.5)`.

### 9.4 Coupling Bootstrap (Cold Start)

When two agents connect for the first time, they have no shared cognitive history. Peer-level drift (Section 9.1) will be high — typically > 0.8 — because neither has yet admitted any of the other’s CMBs, so every category reads as foreign. This is correct behaviour, not a bug. The mesh is conservative by default: unknown peers are cognitively distant until proven otherwise.

However, CMB evaluation (Section 9.2) operates independently of peer coupling state. Even when a peer is rejected at the peer level, incoming `cmb` frames MUST still be evaluated by SVAF on their own merit. A rejected peer can send a highly relevant CMB — SVAF evaluates the content, not the sender’s overall drift.

The bootstrapping path works through two mechanisms:

-   —Mood fast-coupling (Section 9.3) — mood is always delivered even from rejected CMBs. Agents that share non-neutral affective state begin influencing each other immediately. This is why agents SHOULD extract genuine mood from their observations rather than defaulting to neutral.
-   —Content-driven convergence — when SVAF accepts individual CMBs from a rejected peer (because the content is relevant even though the peer’s overall state is distant), the receiving agent’s cognitive state shifts. Over multiple cycles, this narrows peer drift until the peer crosses into the guarded or aligned zone.

Implementations SHOULD log the distinction between peer-level rejection (aggregate drift) and content-level evaluation (SVAF per-CMB) to aid debugging. A peer may be “rejected” at Layer 4 while its individual CMBs are “aligned” at the content level — this is normal during bootstrap and indicates convergence is in progress.

Cold-start convergence time depends on CMB frequency, category relevance, and mood signal strength. For agents that share domain overlap (e.g., a knowledge agent and a coding agent both in the AI domain), convergence typically occurs within 2–5 CMB exchanges. For agents with no domain overlap (e.g., a fitness agent and a legal agent), convergence may never occur — and that is correct. They couple only through mood.

Replayed context. A newly admitted peer has nothing of a node’s to evaluate against until the node next emits, so a node MAY replay a few of its own recent records to it as context. Whether or not it does, the first sealed frame a node sends on a Core Secure session after it admits that session (§5.8.1) MUST be one `cmb-anchors` frame, naming the records it is about to replay, or none with `keys: []`. It then sends each named record as an ordinary `cmb-encrypted` frame on the same session. The frame also tells the peer that the node holds the session: it guarantees that a relay client hears a sealed frame from its server on every admitted session, which supersession waits for (§5.2.2).

```
{ "type": "cmb-anchors", "keys": ["cmb-<64 lowercase hex>", "..."] }
```

-   —Sender. `keys` lists the cognition keys (§8.8.2) of the records to follow, in the order they will be sent, at most 50. A node MUST replay only records it authored itself and signed under `mmp-sig-v2.0`, never another node’s (§15.7: replay is not forwarding), and only records it may seal into that session (§18.2.1: its room, and no other recipient). It SHOULD replay at most 5 records per admission and MUST NOT send a non-empty `cmb-anchors` to one peer more than once a minute; the empty list goes on every admission. The frame is a sealed control frame (§7.1), unsigned and session-bound: it speaks only for the session’s proven peer, about records that peer authored.
-   —Receiver. It keeps the key set for that session, replacing any earlier set from it. A record that then arrives on that session with a listed key goes through §8.8.5 verification and receiver-autonomous admission (§9.2) exactly like any other record; the receiver MAY mark it as replayed context, for example to its application, so that it is not read as a fresh observation, but only when the record’s signed `createdByNodeId` is the session’s proven nodeId. A listed key on another author’s record marks nothing.
-   —What it never does. `cmb-anchors` MUST NOT change how a record is verified, admitted, delivered or weighted, and it never causes a record to be accepted. A replayed record is the author’s original signed record: it keeps its key, its assertion identity and its signed time, and a receiver that already holds it deduplicates it (§8.8.2). It asserts nothing new, so it is not an emission under §15.7.

Why a separate frame. The record envelope carries the record and nothing else (§18.2.1), and an unsigned flag beside it would be the kind of unauthenticated top-level field §8.8.3 rules out. The earlier runtime marked replayed records with an `_anchor` flag on the record frame; a session-bound list sent ahead of the records says the same thing inside the session’s protection.

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

Feedback recognition. When a node receives a feedback CMB (a CMB with `lineage.parents` from a node with validator role or above), the receiving node SHOULD check whether any of the parent keys match CMBs it produced. If a match is found, the feedback is about the receiving agent’s own prior output. Implementations SHOULD surface this in the LLM reasoning context so the LLM can adjust its analytical approach. This check is O(1) against the node’s local memory index.

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

A node with validator role or above produces a directive feedback CMB with:

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
  "timestamp": 1775485628563,
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
  "timestamp": 1775485630000,
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

`metadata.createdBy` identifies the author, and `metadata.createdByNodeId` is bound to the author’s key by the CMB signature (§18.3.1). Validator authority MUST be resolved against the receiver’s in-force set of grants under the pinned anchor (§6.5–§6.6) before anchor weight 2.0 is applied. A `lifecycleRole` self-declared in the handshake ([Section 5.2](/spec/mmp/connection)) is advisory only and MUST NOT confer validation weight. A revoke of the author’s grant (§6.6.5) withdraws the elevated weight at each receiver as soon as that receiver holds the revoke.

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

Layer 6 was called XMesh in the v0.2.x drafts and in the published papers (arXiv:[2604.19540](https://arxiv.org/abs/2604.19540), arXiv:[2604.03955](https://arxiv.org/abs/2604.03955)). As of v1.0.1 the layer is named Cognitive State, so that the layer and the name are not confused where the papers use the older label. SYM is the maintained open reference implementation; the protocol itself is this open specification. The wire frame type `xmesh-insight` retains its identifier for backward compatibility and is unchanged.

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
4.  Include lineage if this CMB is a response to mesh signals. A response is the agent’s own observation: its lineage cites what prompted it and does not make it a remix (§15.7)

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

Creates CMB, computes lineage from parents automatically, stores locally, broadcasts `cmb` to all peers. Pass parent CMBs whenever the record responds to or builds on the records it cites. A record the agent authors through `remember()` is its own observation, not a §15.7-gated remix, with or without parents; an automated loop that turns admitted peer records into output is a remix path whichever call it uses (§15.7).

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
-   MAY A directive be _directed_ to a single node (its signed `metadata.to`, §9.2.2). A directed directive surfaces unconditionally per the directed-delivery contract (§9.2.2) — but that governs _delivery_, not memory admission: the receiver still gates whether it integrates.
-   MUST NOT An implementation grant a broadcast directive elevated admission weight on the basis that it originates from the operator. Elevated influence, where it exists, comes only from earned authority (§6.5), evaluated identically for human and agent emissions.
-   SHOULD The per-node admit/reject verdict on a directive be recorded in the admission audit trail — it is the honest record of _how the mesh received the steer_, node by node.

WHY IT MATTERS
A command-and-control system would force every agent to obey the operator. A mesh does not: the operator emits, and each sovereign agent decides for itself whether the directive fits what it knows. You steer the mesh by _persuading its cognition_, and you can watch, in the audit, exactly which agents took the steer and which did not.

§14.12 — New in 1.1.0 — work layer

Within the Class 2 SYM reference-runtime documentation, Section 14.12 is a normative application profile added in 1.1.0 (the work layer); it is not a Class 1 conformance requirement. §14.11 is reserved for Commissions. Everything below composes existing machinery — no new frames, categories, or gates.

### 14.12 Work Sessions as Trails in a Member (Session Capture)

The mesh compounds only if real work writes into it. This profile captures a work session — a coding-agent session, a research task, any bounded piece of work — as a trail: a charter-rooted, lineage-chained run of records in the store of the member node that does the work, grounded by the session’s real outcome.

-   —A member is a node. A member is one agent’s node (§3.2): its persistent identity, its store and its learned admission profile. A work session is not a member and has no mesh identity of its own. The node that works a session MUST author the session’s trail under its own nodeId, and MUST NOT mint a new identity for the session (§3.1.1, §3.3). Over its life a node works many sessions, one trail each.
-   —Charter. Each session begins with a `charter` CMB (§8.3.1), authored by the working node, which declares the session’s intent and is the root of the session’s trail. Its lineage MAY cite the record that commissioned the work, such as a directive (§14.10) or a question (§12.8); the trail is still walked from its head back to its charter, and the walk stops at the first `charter` of this node it reaches, never following the charter’s own parents.
-   —Decisions. Choices made during the work are CMBs with intent `decision`, each carrying the previous entry of the same trail in `lineage.parents`, so each trail MUST be walkable end-to-end through lineage alone, however many other trails its node holds. An entry’s trail predecessor is the one parent that is this node’s own entry on this trail; an entry MUST NOT cite two entries of its own trail, and any other parent it cites (a peer record it responds to, for example) is not part of the walk. Parent order is unsigned (§8.8.4), so the walk never relies on it.
-   —Entries are distinct per trail. Records are content-addressed and a store keeps one record per cognition key (§8.2.1), so two entries with the same content are one record. An identical entry repeated later in a trail would turn the trail into a loop and orphan the entries between, and identical entries in two trails, or another node’s identical record, would join the trails. The working node MUST therefore make each entry’s content distinct within the node: it names the trail in every entry, the charter included, by a label unique to it, such as its own nodeId and a session number (for example in `perspective`), so that no entry can share content with another of its trails or with another node’s record, and it does not repeat an entry within a trail. A store that receives an entry it already holds keeps the one record and MUST NOT treat the de-duplication as an error; the emitting node repeated content, and SHOULD make its next entry distinct.
-   —Completion. The session emits an `artifact` CMB (parents = the trail head) and a grounding CMB ([§6.7](/spec/mmp/memory#grounding)) recording the session’s real outcome — `verified:` or `failed:`. Each is the session’s own observation of real work, authored rather than remixed, so the §15.7 gate does not apply to it (§15.7.2).
-   —Ordinary wire behavior. Every trail CMB is signed, broadcast, SVAF-evaluated, and remixable like any other — a session’s grounded trail can be admitted by teammates exactly as any cognition is (§6.7’s team note). Elevation of the trail into the Canon tier follows §6.7: an explicit act under validator-or-above authority, typically the operator completing the session.
-   —Concurrent sessions. A node MAY hold several open trails, and because each entry cites only its own trail’s previous entry, trails never interleave through lineage. Sessions that run concurrently in independent agents are several agents sharing one identity, which §3.2 forbids: each such agent is its own node, with its own trails.

Why the session is a trail, not a node. A node minted for each session discards what the mesh has learned about the agent that does the work: its peers’ coupling with it restarts cold (§9.4); the roles it has earned do not follow it, because authority follows its key (§6.6.9); and every discarded identity leaves behind a key binding that nothing will use again (§3.4). Inside a persistent node the trail is exactly as walkable, and the node’s standing accumulates across its sessions instead of starting over.

The profile is deliberately thin: charter, decision, artifact are informative vocabulary (§8.3.1); grounding is §6.7; chaining is ordinary lineage. What the profile adds is the _discipline_ — one node per agent, one walkable trail per session, one real outcome per trail.

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

When a node receives a CMB that passes [SVAF evaluation](/spec/mmp/coupling) (Layer 4), the agent MUST NOT store the original CMB as its own record. Instead, it MUST create a new CMB — the remix — that captures what the agent understood from the incoming signal, processed through its own domain intelligence, unless integration collapses: when it adds no new cognition there is nothing new to create, so the agent mints nothing, and whatever it keeps of the author’s record it keeps exactly as signed ([§15.5, collapsed integration](#collapsed-integration)).

The remix is not a copy. It is not a summary. It is new knowledge that exists because two domains intersected. A coding agent sends `mood: "exhausted"`. A music agent receives it, curates calm music, and creates a remix: `focus: "music curation response"`, `commitment: "now playing: Brian Eno, Ambient 1"`, `mood: "calm"`. This remix didn’t exist in either agent alone. It was born from the intersection.

The remixed CMB is immutable and stored locally; a node that has new domain data of its own also broadcasts it to the mesh (§15.7). It becomes input for the next cycle. Other agents receive it, remix it through their lenses, and the graph grows.

### 15.2 Lineage

Every remixed CMB carries lineage — the provenance chain that traces how this knowledge was built. Lineage is not limited to remixes: any record cites its direct sources this way (a response, a trail decision, a grounding), and a record that cites sources is a remix only when the node produced it by integrating them (§15.5, §15.7):

Field

Type

Description

parents

string\[\]

Direct parent CMB keys — the CMBs this remix was created from

method

string

Fusion method used (e.g. `SVAF-v2`). Optional, unsigned, and dropped by a Core Secure verifier (§8.8.4): informational only

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

Integration and emission are two operations, and the rest of §15 keeps them distinct. When SVAF admits an incoming CMB (κ ∈ \[aligned or guarded\], §9.2), the agent MUST _integrate_ it — store a remix. Steps 1–4 apply when integration produces new cognition; when it collapses (below), only the store in step 5 applies:

1.  Process the incoming signal through its domain intelligence (LLM reasoning or structured-data logic)
2.  Create a new CMB with all 7 CAT7 categories reflecting what the agent understood and did
3.  Set `metadata.lineage.parents` to the exact direct source keys and record the remix method
4.  Verify every available parent by content address and signature; do not copy a sender-supplied transitive closure
5.  Store the remix locally. The original incoming CMB MUST NOT be stored as the receiver’s own record — only a remix whose cognition key differs from the incoming key is the receiver’s record (see collapsed integration below).

This local store is unconditional on admission: it is the convergence update (§9.4) by which an admitted observation shifts the receiver’s state, and it happens _whether or not_ the receiver has new domain data of its own. (A near-duplicate — κ = redundant — carries no information gain, is not an informative admission, and stores nothing; §9.2.)

Collapsed integration. If the remix produced by integration has the same cognition key as the incoming record (§8.2.1 and §8.8.2: the key depends on the CAT7 text alone — vectors and mood scalars are excluded from the address — so identical cognition collapses to one key), the receiver MUST NOT mint a record. It MAY keep the incoming record; anything it stores at that cognition key MUST be the incoming record exactly as its author signed it — categories, metadata, signature and lineage unchanged — and it MAY keep its admission evidence (SVAF provenance, admission attestation) alongside it. It MUST NOT attribute that record to itself, and it MUST NOT write a lineage edge from the key to itself. Retention is optional; misattribution is not. A collapsed integration is still integration for the §9.4 convergence update; it creates no new node in the graph, because the receiver added nothing.

Collapse is evaluated only after admission: a record refused as κ = redundant never reaches integration and stores nothing (§9.2). The §15.8 lineage tether does not apply to a collapsed integration — the receiver produced no remix and asserts no descent of its own; the incoming record’s lineage is its author’s. And there is no remix to emit: re-transmitting the author’s record is governed by §15.7.1 forwarding, not §15.7.

Collapse is what keeps content addressing sound. Re-attributing the author’s block to the receiver would make one address carry two authorship claims, and whichever copy a peer fetched would decide who the author appeared to be; writing `parents: [K]` on a record whose own key is `K` would create an edge no lineage walk can leave. An integration that runs without an agent producing new text — a gate that fuses only category vectors and keeps the text verbatim, for example — always collapses.

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

A remix is defined by how it was produced, not by its lineage or by the call that emitted it. This gate applies to a _remix_: a record the node produced by integrating an admitted peer record (§15.5) — the output of its remix cycle, or of any automated path that turns an admitted peer record into new output, whichever API emits it. It does not apply to a record the agent authored from its own domain (§14.3) — an observation, a reply in a conversation, a decision in a trail (§14.12), an outcome (§15.7.2) — however many parents that record cites. Lineage is how any record cites its direct sources (§14.3, §15.2), and citing a parent does not make a record a remix. An implementation MUST NOT apply this gate to a record because it carries parents, and MUST NOT key the gate on a label the record carries: not an intent value (§15.7.2), and not the lineage method, which is the author’s own description. The emitting node knows which path produced a record, and applies the gate by that path. In the reference runtime, for example, the remix cycle is gated and an agent’s own `remember()` is not; but an automated loop that answers each admitted record by calling `remember()` with that record as its parent is a remix path, and is gated.

Receivers cannot see the path. A receiver MUST NOT skip or refuse a record because its lineage cites the receiver’s own records: a reply to its observation, a grounding of its claim (§6.7) and a charter that cites its directive (§14.12) are ordinary records to it, evaluated like any other (§9.2). It MAY keep such a record out of its own remix cycle, so that it does not remix an echo of itself.

An authored record is new domain data by construction: the agent produced it, as §15.7.2 says of outcomes. A reply that only restates its parent adds noise all the same, and that is the agent’s responsibility under §14.3.4 (“one CMB per significant signal”). An authored reply that paraphrases its parent is therefore bounded only by each receiver’s redundancy band (§9.2.1) and its budgets. The protocol does not police authored content, because the agent is the intelligence (§14.3).

Three conditions MUST all be true before an agent _emits_ a remix:

1.  New domain data exists — the agent has fresh observations from its own domain (new RSS items, new sensor readings, new API results, new user interactions) since its last remix
2.  Peer signal is relevant — SVAF accepted the incoming CMB (existing requirement from Section 9)
3.  Intersection produces new knowledge — the combination of new domain data + peer signal creates understanding that neither the agent nor the peer had alone

Without new domain data, an agent that remixes is merely paraphrasing — restating the peer’s signal in different words without adding domain-specific knowledge. This produces noise, not intelligence. In a mesh of N agents where all agents remix every accepted signal, the result is N variations of the same thought — exponential CMB growth with zero information gain.

Implementations MUST track whether the agent has produced new domain observations since its last remix. The SDK SHOULD provide an API for this (e.g. `canRemix()` / `markRemixed()`). `remember()` sets the flag when the agent stores its own domain observation, with or without parents, and the agent’s own call is never gated. A remix path that emits through `remember()` checks the flag first, as the remix cycle does, and what it emits resets the flag rather than setting it. The remix cycle checks the flag before invoking the LLM. After a remix is produced, the flag resets.

This ensures the remix graph grows with genuine domain intersections, not with paraphrased echoes. Each node in the DAG represents a moment where two domains actually met — not a moment where an agent had nothing to say but said it anyway.

### 15.7.1 Source-Novel Forwarding (carve-out)

The new-domain-data requirement above governs remix — combining the agent’s own domain knowledge with a peer signal. It does not govern forwarding: re-emitting an admitted observation so it reaches agents beyond the emitter’s direct neighbours. Because hidden state never crosses the wire ([Section 2.7](/spec/mmp/architecture#hidden-state-locality)), an agent can admit a direction it cannot itself express and leave it stranded — the information dies at an agent that holds it but does not re-transmit it.

To prevent this, an agent MAY re-emit an admitted observation it did not natively produce, carrying the inherited lineage root, when and only when that observation is source-novel to the receiver — i.e. its lineage roots are not already present in the receiver’s admitted store. This is not the paraphrase §15.7 forbids: a forwarded observation carries a new lineage root (a source the receiver has not yet seen) even though the forwarder adds no new value of its own. Provenance, not domain data, is what makes it legitimate.

The anti-echo guarantee is preserved exactly. A re-emission whose lineage roots are already held by the receiver (no new source _and_ no new value) is a pure re-statement and remains forbidden by §15.7 — forwarding MUST NOT mint a fresh root for content that already carries one, and MUST NOT re-emit a source the receiver already holds.

Forwarding SHOULD be non-selective: an agent that forwards source-novel content SHOULD forward all of it, not a chosen subset, so that every observation reaches the agents whose understanding depends on it. Selectively withholding source-novel forwards can strand a source from the agents that need it.

In short: remix requires new domain data; forwarding requires a new source. Both grow the lineage DAG with genuine information — remix with a new domain intersection, forwarding with a new source reaching a new receiver — and neither permits the value-only echo §15.7 exists to prevent. (Implementation status: [§17.6](/spec/mmp/conformance#implementation-status).)

Membrane lineage (boundary root). When a node emits across a mesh boundary on behalf of an interior sub-mesh (a gateway node, Section 5.10), its outward emission is a boundary root: the lineage MUST NOT carry the content-addresses of interior CMBs. An outer node citing it traces to the gateway and no further — the interior is opaque past the membrane, consistent with hidden-state locality (Section 2.7). See Section 5.11.

### 15.7.2 Outcomes Are Observations (clarifying note) New in 1.1.0

Observing a real-world outcome — a test result, a shipped artifact, a prediction resolving — is a new domain observation: it carries information from the world into the mesh. An agent that has just observed an outcome therefore records it as its own observation: a grounding ([§6.7](/spec/mmp/memory#grounding)) is authored, not a remix, so the §15.7 gate does not apply to it, and it is emitted through the ordinary path — signed and lineage-expanded — citing what it grounds. This is a clarification, not a carve-out: no intent value exempts an emission from §15.7, since a content-keyed exemption would hand every emitter a free-text bypass of the anti-echo invariant. What makes a grounding an authored record is the outcome the agent observed, not the label on it.

### 15.8 Lineage Tether — the Root-Anchored Drift Bound

Lineage guarantees provenance of _descent_, not semantic fidelity (§15.1: the remix is new understanding, deliberately). Measured on deployment traffic, a single remix hop can land nearly orthogonal to its parent while carrying honest lineage — and everything lineage is _consumed for_ (grounded ancestry in recall and evidence-based validation, §6.7; source-novel forwarding, §15.7.1; Canon protection, §6.3) silently assumes the descendant is still _about_ what its upstream sources were about. Without a bound, content can drift arbitrarily while carrying a verified source’s certificate — grounding-inheritance laundering, the provenance form of the echo §15.7 exists to prevent, amplified by Canon immortality (§6.3: protected rows never purge, so lineage-attached authority otherwise outlives any semantic connection to what was tested).

The invariant. A remix asserts lineage only where the descent claim would survive its own anchor’s scrutiny: at integration time (§15.5), the remixing node MUST evaluate its remix against the nearest resolvable lineage root (the oldest root it can reach by recursively verifying direct parent records; across a mesh boundary the anchor is the boundary root, §5.11, so the interior stays opaque) as if evaluating against a store holding only that anchor, and MUST NOT attach the lineage when that evaluation lands in the reject band (§9.2: content the anchor’s own membrane would refuse as unrelated has no honest claim to descend from it). The evaluation is content-only — the §9.2 temporal term does not apply, because the tether tests fidelity, not freshness — so the floor is the α-weighted category drift against the anchor exceeding Tguarded. Both sides of the comparison MUST be encoded within a single kernel: vectors produced by different encoders are not comparable, and thresholds are meaningful only within a pinned encoder (§9.2.1). The threshold is the existing reject floor — no new constant. Below the floor the node MUST store its CMB as a fresh root instead (under §8.2.1 this is simply minting with `role = root`: a root’s key binds content only), and MAY record the departed source informally in its own categories; it MUST NOT carry any `parents` from the severed chain.

Why the anchor, not the parent. Per-hop checks compound — k hops at drift ε bound the chain only by kε, and the measured median substantive hop is far too large to squeeze without killing legitimate re-projection. A check against the root does not compound: every surviving chain certifies that _every_ depth stays above the floor with respect to its root, so the bound is depth-independent by construction. No vector crosses the wire: the root is content-addressed (§8.2.1 — embeddings are deliberately excluded from the address), so any holder of the root re-encodes its text and recomputes the tether; receivers SHOULD re-verify opportunistically when they hold the root, the same verify-if-resolvable posture as signatures (§18.3.1). A receiver that cannot resolve the root locally MAY fetch it by its content address (`cmb-fetch`, §7): the fetched root self-verifies against its key, so re-verification requires no trust in the serving peer — the recomputed verdict is made in the fetcher’s own kernel (comparability per `kernelId` below). Failing both, the receiver treats the tether as unverified — a trust state, not a rejection — or as attested-by-integrator where a verified attestation rides the remix (below).

Tether attestation and kernel identity. Every φ-space judgement is kernel-relative, so a tether record MUST name the kernel it was evaluated in: a short stable `kernelId` token identifying encoder and comparison dimensionality. Two tether verdicts are comparable _iff_ their `kernelId` values are equal; drifts MUST NOT be compared across kernels. The integrating node SHOULD record its evaluation as a signed tether attestation carried on the remix: a record binding the remix key, anchor key, `kernelId`, measured drift (fixed to six fractional digits so the signed bytes are implementation-independent), verdict (`tethered` | `severed`), integrator nodeId, and integrator time — serialized with the §8.2.1 length-prefix discipline under the domain tag `mmp-tether-v1` and signed with the integrator’s identity key (§18.3.1; verification resolves the key by the integrator’s nodeId, §3.4, and its authority from the receiver’s in-force set, §6.6). A receiver that cannot resolve the anchor MAY treat a verified attestation as the certificate’s standing — attested-by-integrator, weighed by the integrator’s resolved authority (§6.5–§6.6) — instead of unchecked; an attestation whose signature fails against the integrator’s resolved key MUST be discarded (a forged certificate is worse than an absent one). An attestation proves _who_ evaluated, in _which kernel_, with _what result_ — never that the evaluation was honest; honesty is weighed exactly as it is for admission attestations.

Distinct from §15.7.1’s mint prohibition. Forwarding MUST NOT mint a fresh root because forwarded content is _unchanged_ — re-rooting it would forge novelty. Tether severance mints a fresh root because the content has _changed past the point of honest descent_ — keeping the lineage would forge fidelity. Same mechanism, opposite honesty conditions; both grow the DAG with claims that are true. Severance also interacts correctly with source-novel forwarding: a severed row is a genuinely new source, and its departed predecessor’s roots are no longer claimed by it.

### Q&A

Does every admitted CMB get re-broadcast?

No — but every admitted CMB is still integrated. On admission (κ ∈ \[aligned or guarded\]) the agent stores a remix (Section 15.5); that local store is the convergence update and is unconditional. Re-broadcasting the remix to the mesh is a separate decision: the agent MUST NOT emit without new domain data (Section 15.7). So without new data the agent stays silent on the wire — yet the admitted signal has already shifted its state in memory. The original incoming CMB is never stored as the agent’s own record; when integration adds nothing new, the agent mints nothing and may keep the author’s record, but only exactly as signed (Section 15.5, collapsed integration).

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

Core types (this specification): MUST NOT be redefined by extensions. Extension types: MUST use `<extension>-<name>` format (e.g., `mesh-room-join`). Vendor types: MUST use `x-<vendor>-<name>` format. Vendor types MUST be silently ignored by non-supporting nodes.

### 16.3 Extension Negotiation

An extension is active only when it appears in both authenticated offers and in the server’s `selectedExtensions`. Otherwise the advertising peer MUST NOT send extension-specific frames to a peer that does not support them.

### 16.4 Registered and Candidate Extensions

Extension

Status

Specification

mesh-room-v0.2.0

Proposal

[MMP Mesh Room Extension v0.2.0](/spec/mmp/extensions/mesh-room) — generic transient subgroup primitive formalising §5.8 (room identity, Bonjour + relay discovery, room-scoped CMB tagging, membership lifecycle). First use case: MeloTune Mood Room. (Draft — promotes to Published upon second-implementer adoption per the extension’s own §10, Promotion Criteria.)

room-directory-v0.2.0

Draft

[MMP Extension: Room Directory v0.2.0-DRAFT](/spec/mmp/extensions/room-directory) — persistent room metadata, admin approval workflow, and directory enumeration. Higher-layer extension building on §5.8 mesh rooms for chat-platform-style UX (browse / request-to-join / approve). (Draft — pre-implementation; promotes on first reference impl per §16.5.)

error-handling-v0.2.0

Draft — Candidate Extension

[MMP Extension: Error Handling v0.2.0](/spec/mmp/extensions/error-handling) — application-layer CMB convention; no wire-format change. Failure as a first-class cognition event: evidence-carrying corrective requests with lineage-borne parentage, receiver-autonomous volunteering, one-level repair, and separate grounding of failure and fix. **v0.2.0** adds a proposed receiver-local **Adaptation-on-Failure loop** (§6–§8): category accountability with a counterfactual-ablation guard, and a per-failure choice between decrementing the SVAF gate (boundary of responsibility) and ingesting to the CfC state (capability growth), routed by competence-distance. (Draft — the failure-event convention has an experimental reference implementation; the adaptation loop §6–§8 is _proposed, not yet implemented_, and gated on a register-first router-validation study; promotes per the extension’s own Promotion Criteria.)

trust-horizon-v0.1.0

Draft — Candidate Extension

[MMP Extension: CMB Trust Horizon v0.1.0](/spec/mmp/extensions/trust-horizon) — application-layer CMB convention; no wire-format change. Validator-attested, knowledge-scoped trust-weight invariants: a grant governs how earned influence persists (never how it is minted), interpreted per receiver under operator policy, with Canon-retention separation. (Draft — a reference deployment reports an experimental implementation; independent interoperability not yet established; promotes per the extension’s own Promotion Criteria.)

sym-attest-v1

Draft — Candidate Extension

[MMP Extension: Admission Attestations v1.0.0](/spec/mmp/extensions/sym-attest) — the wire form of the admission attestations §17.2 requires: a signed attestation per record a node gated (whole-record verdict and the seven §9.2.1 per-category verdicts), chained per attester; signed checkpoints, each chained to the one before; witness co-signatures that make a forked history detectable; and unsigned, informational node statistics. Frames `sym-attest-attestation`, `-checkpoint`, `-witness`, `-node-stats`; author-signed frames take their authority from the signer’s bound key, never the session. (Draft — the SYM runtime sends an earlier, unnegotiated form under bare type names; promotes per the extension’s own Promotion Criteria.)

### 16.5 Extension Lifecycle

Extensions progress through a defined lifecycle:

-   Proposal: submit as a Draft extension with a specification document and at least one reference implementation.
-   Review: community review plus spec maintainer approval. Draft extensions MAY be deployed experimentally but MUST NOT be treated as stable.
-   Promotion to Core: an extension MAY be promoted to a core frame type. Promotion requires a spec version bump (see the versioning policy, spec index) and MUST maintain backward compatibility with existing deployments of the extension.

### 16.6 Versioning

Extensions use [Semantic Versioning](https://semver.org) independently of the core MMP specification version. An extension version bump MUST NOT require a core spec version bump unless the extension is being promoted to core.

Q&A   Can an extension become a core frame type? — Yes. An extension that proves stable and widely adopted MAY be promoted to a core frame type via a spec version bump. Room membership illustrates the path: the `extensions` field (Section 5.2) and room isolation (Section 5.8) are core, while the mesh-room extension document that formalises the richer subgroup lifecycle remains a Proposal record (Section 16.4).



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
-   use the §18.2.1 directional HKDF/ChaChaPoly envelopes and exact ordered sequence — `cmb-encrypted` for records and `control-encrypted` for every other post-handshake peer frame except liveness (§7.1);
-   validate schemas, cryptographic bytes, audience and replay state before application exposure;
-   reject Core Secure downgrade to an unsigned, one-frame-handshake or legacy-suite path.

### 17.2 Cognitive node

A cognitive node satisfies every Core Secure obligation and implements receiver-autonomous memory admission. It evaluates all seven categories, records per-category evidence, aggregates under its local policy and admits or refuses the immutable CMB as one whole record.

-   hidden neural or model state MUST NOT cross the wire;
-   foreign embedding vectors MUST NOT control admission; receivers encode from signed text;
-   admitted peer cognition is stored as the receiver’s remix with walkable lineage, or — when integration collapses (§15.5) — nothing is minted, and any record kept at that key is the author’s, unchanged and never attributed to the receiver;
-   admission attestations expose the observable decision and per-category evidence — to the node’s operator, and, where the node exposes them to peers, only through the registered [sym-attest-v1](/spec/mmp/extensions/sym-attest) extension (§16.4), their only wire form;
-   directed delivery is distinct from memory admission and carries verification/admission state;
-   private learned policies MAY vary, but MUST NOT weaken public identity, integrity, audit or receiver-autonomy invariants.

SYM is an open transparent baseline. xmesh-core is a proprietary cognition runtime targeting this profile. Both are measured at the same public boundary; neither may substitute private conformance bytes, and neither is conformant merely because it is maintained by the specification author.

### 17.3 Legacy Import profile

Legacy Import exists only to read retained history or perform an explicit reader-first migration. It is not Core Secure and MUST NOT be selected through negotiation failure. A host MUST expose the profile and verification limitations to its operator. Legacy network admission is removed after the declared migration window; offline store import may remain.

### 17.4 Executable testing

A conforming implementation MUST consume the public files, reproduce their expected values and reject the negative mutations. Generating private vectors from the implementation under test proves only self-consistency and MUST NOT be reported as MMP conformance.

**Signature bytes are the one exception, and a suite MUST NOT assert equality on them.** A pinned `expectedSignature` exists so an implementation can prove it _accepts_ a known-good signature over the given payload and key. Ed25519 is deterministic in RFC 8032, and Node, Chromium and Firefox each reproduce the published bytes on every call — but WebKit ships a _hedged_ signer, so Safari, and therefore every browser on iOS, returns a different valid signature each time it signs. Signing a pinned payload and comparing the result is not a conformance test; it fails on a conforming implementation and reads as a browser defect. To exercise signing, sign the same payload twice, assert that both verify, and assert nothing about whether they are equal.

**A browser implementation cannot sign at all outside a secure context, and the boundary is not where testing puts it.** `crypto.subtle` is exposed only in secure contexts. `https://`, `file://` and `http://localhost` qualify; `http://` to a LAN address such as `http://192.168.1.10` does _not_. So a browser node signs correctly throughout development on localhost and loses the capability entirely the moment it is served to the machine next to it — not degraded, absent: there is no signer to call. Every record it emits is therefore unsigned, and §8.3 authenticity is unreachable for that deployment however correct its code.

Two requirements follow, and the second is the one that gets skipped. Such a deployment MUST NOT be reported as MMP-conformant, because the property under test cannot be exercised there. And a run in that environment MUST label the branch it took, in its own report, on every run rather than only on the runs that degrade — a marker that appears only in the unsigned case teaches a reader to read its absence as the signed case, which is the same mistake as reading an unasked question as an answered one. An implementation measured on 2026-09-16 does this correctly, emitting an explicit unsigned-branch marker on every run so that no measurement taken there can later be cited as evidence about signing.

Artifact

Required proof

[application-v2](/spec/mmp/conformance/v2/application-v2.json)

canonical bytes, length, digest and presence commitment

[record-signature-v2](/spec/mmp/conformance/v2/record-signature-v2.json)

category keys, Merkle address, assertion identity and Ed25519 signature

[record-projection-v2](/spec/mmp/conformance/v2/record-projection-v2.json)

the §8.8.5 canonical signed projection: unsigned members, unknown categories, parent order, empty lineage and absent application each give one projection of one assertion; a rewritten meta.key, NFD text, an uppercase nodeId, a coerced type, an embedding vector and the 256 caps are refused

[record-size-v2](/spec/mmp/conformance/v2/record-size-v2.json)

the §8.8.6 measures (UTF-8 text after NFC, the RFC 8785 length of the record) and each limit at its boundary and one byte over

[handshake-v2](/spec/mmp/conformance/v2/handshake-v2.json)

transcript, proofs, X25519 confirmation and HKDF outputs

[e2e-v2](/spec/mmp/conformance/v2/e2e-v2.json)

directional keys, counter nonces, AAD, ciphertext and authentication failures

[control-encrypted-v2](/spec/mmp/conformance/v2/control-encrypted-v2.json)

sealed control frames on the handshake session: control AAD, nonces and ciphertext for mood, cmb-fetch, cmb-fetch-result and ping; domain and direction separation; an authentic envelope with a forbidden inner frame, which opens, advances the sequence and is refused (§18.2.1)

[authority-v2](/spec/mmp/conformance/v2/authority-v2.json)

authority statement bytes, ids, pin digests and roots; the status of every statement in every case, and the bucket that keeps it, the same in any ingest order (§6.6)

[ed25519-strict-v2](/spec/mmp/conformance/v2/ed25519-strict-v2.json)

the one Ed25519 verification rule for authority statements, on the twelve “Taming the many EdDSAs” cases and the small-order, mixed-order and non-canonical cases (§18.3.2)

[sym-attest-v1](/spec/mmp/conformance/v2/sym-attest-v1.json)

for the Draft Candidate extension (§16.4) only: attestation, checkpoint and witness bytes and signatures, the chained checkpoint root over 1-, 2- and 3-leaf segments, the equivocation rule on three conflicting pairs, and the link checks

[v2 wire examples](/spec/mmp/examples/v2/transport-cmb.json)

schema-valid, signed transport, feedback-dismissal and feedback-directive CMB frames

Cognitive profiles SHOULD additionally consume the public baseline SVAF and tether vectors, and MUST test whole-record admission, signed freshness, lineage and audit outcomes.

### 17.5 Release gate

-   A clean-room verifier passes without importing SYM or xmesh-core.
-   Every published example frame validates against its published schema.
-   Node and Swift implementations reproduce identical transcript and AEAD bytes, and each accepts the other's signatures. Signature bytes are _not_ compared: Apple's CryptoKit signs Ed25519 with added randomness, so a correct Swift implementation returns different valid bytes on every call and byte equality is not a release criterion.
-   Packaged release artifacts run the corpus from a clean install.
-   xmesh-core passes the public boundary corpus without disclosing private internals.
-   The website build generates and verifies its own canonical artifacts before producing the published Pages output.

Each item above names a check that is executed, not an assurance, and says who runs it. The website's own verifiers run on every build. The packaged-artifact check runs at publish. The clean-room verifier and the boundary corpus are invoked by hand: the boundary corpus was last recorded as run on 1 August 2026 and has not been run for the releases since, so its standing is that date and not this page. A criterion with no runnable check behind it does not belong here — the byte-equality claim between implementations was corrected on 14 September 2026, after measurement showed no implementation could meet it.

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

Via cmb (CMB mood category), or a mood frame (text only) sealed in control-encrypted on a Core Secure session

Medium — affective state, extracted from CMBs per Section 9.3; a mood frame is never stored, relayed or remixed

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

Each direction has a distinct HKDF-derived 32-byte traffic key. The first sequence is zero; the nonce is that sequence encoded as an unsigned 96-bit big-endian integer. An ordered receiver MUST require the exact next sequence and reject replay, rollback and gaps. The receive sequence advances only after the AEAD has authenticated the frame at the expected sequence: a frame that fails authentication MUST be discarded without changing any session state, so that one forged frame carrying the right sequence number cannot desynchronise the session. A sequence below the next expected value is a replay or rollback and is never processed: on every transport the receiver discards the frame and keeps the session, because a replayed frame changes nothing and closing on one would hand the session to whoever can replay frames, a relay above all. A sequence above the next expected value whose frame authenticates under its own sequence is a gap: the receiver MUST close the session, and SHOULD first send a sealed error 1010 `SESSION_CLOSED`, and the peers re-handshake (§5.2.2). A receiver MUST NOT stall waiting for missing frames, which a relay that dropped them never retransmits.

The protected plaintext contains `categories` and decoded application bytes. Associated data binds protocol version, session, direction, sequence, cognition key, assertion identity, author nodeId, room and recipient. After decrypting, the receiver reconstructs the logical two-section record and follows §8.8.5 verification order. Exact outputs are published in the [E2E vector](/spec/mmp/conformance/v2/e2e-v2.json). The recipient in the associated data is `metadata.to`, entering as `lp("")` when it is null, exactly as in the signature payload (§8.8.4). An intermediary therefore cannot turn a room-bound record into a directed one, or redirect a directed one, without the frame failing to open; and the receiver takes the record’s binding from that authenticated field, never from the relay envelope that carried the frame (§9.2.2).

When `metadata.application` is null, the protected plaintext MUST omit `applicationData` entirely. A present application whose decoded data is zero bytes instead carries `applicationData: ""`. The two states are distinct and MUST NOT be collapsed. Both byte shapes are pinned by the E2E vector.

Sealed control frames. Every peer-scope frame of a CONNECTED Core Secure session that is not a record and not liveness travels in a `control-encrypted` envelope (§7.1). It uses the same suite, session and directional traffic keys as `cmb-encrypted`; the plaintext is the inner frame itself, and the envelope carries no clear metadata beyond what the AEAD needs:

```
{
  "type": "control-encrypted",
  "protocolVersion": "2.0",
  "suite": "X25519-HKDF-SHA256-ChaCha20-Poly1305",
  "sessionId": "<32 lowercase hex>",
  "sequence": "7",
  "direction": "server-to-client",
  "sealed": "<unpadded base64url ciphertext || 16-byte tag>"
}

plaintext = UTF8(minified JSON of the inner frame, e.g. { "type": "mood", ... })
aad       = UTF8("mmp-aead-control-v2
") || lp("2.0") || lp(sessionId) ||
            lp(direction) || lp(sequence)
key, nonce: the session's traffic key for direction; sequence as for cmb-encrypted
```

-   —One sequence per direction. `cmb-encrypted` and `control-encrypted` frames sent in one direction of one session draw their sequence numbers from one counter, so that no traffic key ever seals two frames under one nonce. The receiver applies the ordering rules above to the merged stream.
-   —Domain separation. The associated data of the two envelopes begins with different labels (`mmp-aead-aad-v2` for records, `mmp-aead-control-v2` here), so neither can be opened as the other. Exact outputs for four inner frames, and an authentic envelope whose inner frame is refused, are published in the [control-encrypted vector](/spec/mmp/conformance/v2/control-encrypted-v2.json), on the session of the handshake vector.
-   —After opening. A frame that opens has taken its place in the sequence: the receiver advances its direction’s counter first. It then parses the plaintext as one JSON frame, under the same size limits as a frame in clear, refuses an inner type that §7.1 forbids, validates the inner frame against its schema, and handles it as if it had arrived on the session in clear — attributed to the session’s proven peer. Refusing the inner frame changes nothing else: the session stays up and the next frame is judged at the next position. The same holds for a `cmb-encrypted` frame whose record is then refused.
-   —Records stay in their own envelope. No control frame carries a record. A record returned for a `cmb-fetch` travels as its own `cmb-encrypted` frame, so its associated data binds that record’s cognition key, assertion identity, author, room and recipient, exactly as for any record. The sealed `cmb-fetch-result` carries only the request’s correlation id and the lists of keys returned and keys not found (below).
-   —Seal only what the session may carry. A sender MUST NOT seal into a session a record whose signed room differs from the session’s room, or whose `metadata.to` names a node other than the session’s peer, whatever path offered it: a fetch answer, a replay, a queued or forwarded frame, or the sender’s own publishing. The receiver would refuse it (§8.8.5 step 7, §5.8, §9.2.2), but only after its content was disclosed.

Fetch results. A node answering a `cmb-fetch` on a Core Secure session MUST send each record it returns as its own `cmb-encrypted` frame, and then one `cmb-fetch-result` inside `control-encrypted`:

```
{
  "type": "cmb-fetch-result",
  "reqId": "<the request's reqId>",
  "returned": ["cmb-<64 lowercase hex>"],
  "missing": []
}
```

-   —`reqId` echoes the request. Every key the request asked for appears exactly once, in `returned` or in `missing`.
-   —The records come first. A responder MUST send every record a result lists as returned before the result itself. Both envelopes draw on the session’s one sequence per direction, so when the result arrives the requester has already received, in order, every record it lists; a listed record that did not arrive was not sent.
-   —A responder MUST NOT return a record whose signed room differs from the session’s room, or whose `metadata.to` names a node other than the requester. It lists such a key as missing, as it does a key it does not hold or declines to disclose.
-   —A per-session byte budget. A responder MUST bound the record bytes it holds queued for fetch answers on one session (RECOMMENDED: 4 MiB), and never less than `MAX_RECORD_BYTES` (§8.8.6), so that one maximal record can always be served. A key whose record would exceed the budget is listed in `missing`, never queued; the requester may ask for it again later. A responder SHOULD also bound the total across sessions. Without such a budget, one 900 KB record requested 150 times was measured to hold 99 MiB in the sender’s buffers.
-   —The requester MUST recompute each returned record’s cognition key (§8.2.1) and match it to its request by that key and the responder. A content address binds the categories only, not the author or the metadata (§8.8.2), so a match proves only the categories: the requester MAY use them to check lineage (§15.8), but it MUST pass every check of §8.8.5 before it attributes the record to an author, delivers it to its application or admits it. A record whose author key it cannot resolve stays unattributed. Whether it admits the record is its own decision (§9.2).

### 18.3 Node Identity & Authentication

Node identity is a UUID bound to an Ed25519 key through the authenticated transcript in §5.2. An X25519 session key is separately generated but proven in the same transcript.

-   —Each node MUST generate an Ed25519 keypair at first launch and persist it alongside the nodeId.
-   —Discovery records are untrusted hints. A peer MUST NOT pin their identity or E2E key from DNS-SD, relay discovery or an unproven hello.
-   —Both nonces, nodeIds, keys, room, protocol version, implementation identifiers and extension negotiation MUST enter the signed transcript.
-   —Core Secure MUST require both the Ed25519 transcript proof and X25519/HKDF key confirmation. Network isolation is not identity authentication.
-   —A nodeId stays bound to the first key a receiver binds it to (§3.4). A different key, however well proven, is an identity conflict that the receiver refuses and reports; it is never a re-binding. First contact with no anchor, grant or out-of-band pin is therefore trust on first proven use, and an operator who needs more pins the key out of band.

#### 18.3.1 CMB Signature Verification

Transport identity (above) authenticates the _connection_; CMB signatures authenticate each _record assertion_ end-to-end. Every Core Secure CMB MUST be signed by its author using the Ed25519 identity proven in the handshake or a verifiable author key-binding chain.

-   —The byte-exact `mmp-sig-v2.0` payload is specified only in [§8.8.4](/spec/mmp/cmb#signature). It binds the cognition address, address scheme, author nodeId and label, signed author time, room, recipient, lineage commitments and application commitment.
-   —The receiver MUST resolve the author key by `createdByNodeId`, never `createdBy`.
-   —Before admission or application exposure, the receiver follows all checks in §8.8.5, including record address, assertion identity, signature and audience.
-   —An unsigned, legacy-suite or unverifiable record MUST NOT enter Core Secure. It may be quarantined under an explicitly selected Legacy Import profile; no automatic downgrade is permitted.

#### 18.3.2 Authority Statement Signatures

Grants, revokes and endorsements (§6.6) are not CMBs and do not use `mmp-sig-v2.0`. Each is signed with pure Ed25519 over its own `mmp-authority-v1` payload (§6.6.3), and is identified by the SHA-256 of that payload, never by its signature.

One verification rule. RFC 8032 lets verifiers differ: in the equation they check, and in whether they accept non-canonical encodings and points of small order. Two nodes that verify differently hold different valid sets from the same statements, so they resolve different authority and never converge. Every node MUST therefore verify an authority statement’s signatures by this rule alone. A signature, 64 bytes _R_ ‖ _S_, by a public key _A_ of 32 bytes over a message _M_ is valid if and only if all five hold:

1.  _A_ is a canonical encoding of a curve point: its _y_ is less than _p_ = 2255 − 19, it decodes to a point, and when _x_ = 0 the sign bit is clear (RFC 8032 §5.1.3).
2.  _A_ has prime order: \[_L_\]_A_ is the identity and _A_ is not, where _L_ = 2252 + 27742317777372353535851937790883648493. This excludes the identity, the other points of small order and every point of mixed order.
3.  _R_ is likewise a canonical encoding of a point of prime order.
4.  _S_, read little-endian, is less than _L_.
5.  \[_S_\]_B_ = _R_ + \[_k_\]_A_ as points, where _k_ = SHA-512(_R_ ‖ _A_ ‖ _M_) mod _L_, hashed over the bytes as given. This is the cofactorless equation of RFC 8032 §5.1.7.

With _A_ and _R_ of prime order, \[8\](\[_S_\]_B_ − _R_ − \[_k_\]_A_) is the identity exactly when \[_S_\]_B_ − _R_ − \[_k_\]_A_ is. The cofactored equation therefore gives the same answer, and a library that uses either equation agrees once rules 1 to 4 are checked. Those four rules are where libraries differ. The [Ed25519 edge-case vector](/spec/mmp/conformance/v2/ed25519-strict-v2.json) holds the twelve cases of _Taming the many EdDSAs_ (Chalkias, Garillot and Nikolaenko, 2020). It adds the identity key, a mixed-order key, and, under a prime-order key, an identity _R_, a pure small-order _R_ (of order 8 and of order 2), a mixed-order _R_ and a non-canonical _R_, as well as an unreduced _S_ and an honest case. It also shows, for each case, what the two equations give when the pre-checks are skipped. Only the honest case is valid.

On a cofactorless library (informative). A cofactorless verifier that compares _R_ by its bytes, as OpenSSL does behind Node’s `crypto.verify`, needs rules 1, 2 and 4 checked first. It also needs one more check: that _R_ is not the identity’s encoding, `01` followed by 31 zero bytes. If such a library then accepts, _R_’s bytes are the canonical encoding of \[_S_\]_B_ − \[_k_\]_A_. That point lies in the prime-order subgroup, because _B_ and _A_ do, and it is not the identity, so _R_ meets rule 3. Rules 1 and 2 cost one scalar multiplication per key, and a node can cache the result per key. The reference construction (`scripts/mmp/lib.mjs`) works this way, and the verifier checks it against the rule computed directly on every edge case.

-   —The verifying key of a non-anchor statement is the subject key of the grant it names in `authorisedBy`. A receiver MUST NOT take it from its key registry, from the delivering session or from the statement’s own signature entry alone.
-   —An anchor-level statement needs valid signatures by the pinned threshold of distinct anchor keys (§6.6.1). The keys are pinned out of band and never learned from the wire. No two entries of one statement share a key: a repeated key makes the statement malformed, refused as shape before any signature is checked (§6.6.3, rule 1), so one copy cannot buy repeated checks under a pinned key.
-   —A grant whose subject key fails rule 1 or 2 is not well formed (§6.6.3). No grant can therefore name a key, such as the identity, under which anyone could sign anything.
-   —Because the id excludes the signature, a hedged signer’s different valid signature over the same payload is the same statement (§17.4). The [authority vector](/spec/mmp/conformance/v2/authority-v2.json) pins payloads, ids and roots; its signatures are for verification only.

### 18.4 Cognitive Threats

MMP introduces threats unique to cognitive coupling that traditional protocol security does not address:

Cognitive poisoning

A malicious node sends crafted CMBs designed to skew the receiver’s cognitive state toward a desired outcome. (Hidden vectors cannot be injected — they never cross the wire, §2.7 — so the only attack surface is CMB content.)

MITIGATION SVAF per-category evaluation (Layer 4) judges each CMB on content before it is admitted. Drift-bounded influence (Section 10) limits any peer to α < 1, so a peer influences but never overrides. Peer-level disconnection at Layer 2 provides immediate escape.

Lineage forgery

A node claims false lineage — listing ancestors it never actually remixed — to inflate its remix count or inject itself into chains.

MITIGATION CMB keys are cmb- content addresses (§8.8.2). The corrected signature (§8.8.4) binds createdByNodeId, audience, lineage commitments and application bytes. A receiver resolves the author key by nodeId and rejects a forged or tampered assertion.

Fake outcome attestation (grounding abuse)

A node emits intent="ground" CMBs (§6.7) with fabricated "verified:" outcomes against its own cognition to steer receivers’ evidence-based validation — or griefs with "failed:" attestations to un-ground cognition a node with validator role or above verified (latest-observation-wins, §6.7).

MITIGATION An outcome is an attestation, never a fact (§6.7): it advances no lifecycle by itself, and elevation is an explicit act under validator-or-above authority that SHOULD weigh the grounding author’s resolved authority (§6.5–§6.6). Groundedness is receiver-relative — only attestations the receiver’s own SVAF admitted count — and ordering uses receiver-local stored time, so a backdated createdTimestamp cannot game latest-wins. A below-validator "failed:" MUST NOT un-ground a validator-or-above "verified:" (§6.7 hard-gate reading) — a tier gate, not a soft weighted vote, since sheer low-authority volume defeats a weighted vote but not the gate; within a tier, latest-wins still surfaces a genuine same-authority regression.

Authority backdating, flooding and blow-up

A compromised or removed authority holder signs revokes or attestations dated inside the time it was trusted, floods statements to push honest ones out of a store, or crafts revoke patterns that are expensive to resolve.

MITIGATION Authority carries no time (§6.6): a statement counts only while its signer’s grant is in force, whatever time it claims, and a removed signer’s dependents are dead. Quotas are per signer and per grant, keep removals first, and never let one signer displace another (§6.6.6). Resolution is linear in the statements held and never recurses (§6.6.4). A rescue never reconnects what a quota dropped, and the rescuer keeps what it rescues against its own quotas, so a compromised holder cannot escape the bound of §6.6.6. Every node verifies by one Ed25519 rule (§18.3.2), so no signer can craft a statement that some nodes count and others reject. Agreed outcomes are decided once by their environment and bound to an authority root (§6.6.10).

Drift manipulation

A node gradually sends benign, redundant CMBs to lower its peer drift with a target, then suddenly sends adversarial content once coupling is accepted.

MITIGATION SVAF per-category evaluation (Layer 4) operates on content, not just drift. Even with low peer drift, adversarial CMB content is evaluated per category and rejected if category drift is high.

Sybil attack

An attacker creates multiple fake nodes to amplify influence in peer-influence weighting.

MITIGATION Keypairs are free to generate, so identity alone does not limit Sybil creation. Receiver-local drift/recency weighting reduces but does not prove Sybil resistance. Authority-bearing actions require an in-force grant under the pinned anchor (§6.5–§6.6), and a grant holder can only add authority holders within its quota and the depth cap (§6.6.6); operators SHOULD rate-limit new identities and seed trusted anchors. Quantitative Sybil bounds are an open research claim unless demonstrated by a named profile.

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

MAX\_CATEGORY\_TEXT

262,144 bytes

UTF-8 length of one category text after NFC (§8.8.6)

MAX\_RECORD\_TEXT

524,288 bytes

Sum of the seven category texts (§8.8.6)

MAX\_RECORD\_BYTES

737,280 bytes

RFC 8785 serialization of the two-section record; fits one sealed frame (§8.8.6)

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

RELAY\_MIN\_RATE

25 messages/s

A relay that limits a client’s message rate MUST allow at least this, sustained (§4.4.4)

RELAY\_MIN\_BURST

300 messages

A relay that limits a client’s message rate MUST allow at least this burst (§4.4.4)

RELAY\_MIN\_FANOUT

64 entries

A relay that lists fanout MUST accept at least this many entries in one envelope (§4.4.4)

RELAY\_ENVELOPE\_ALLOWANCE

4,096 bytes

A client MUST accept a delivered relay message of up to MAX\_FRAME\_SIZE plus this, for the from and fromName the relay adds (§4.4.4)

PEER\_RETENTION

300,000 ms

Stale peer eviction age (peer-registry eviction; see §5.5)

archiveAfterSeconds

profile-dependent

Inactivity window after which a validated CMB MAY decay to archived (§6.3–§6.4; implementation status §17.6)

MAX\_DELEGATION\_DEPTH

4

Longest grant chain below the anchor (depth 0); a deeper statement is invalid (§6.6.2)

ANCHOR\_MAX\_KEYS

16

Most keys in a pinned anchor set; its threshold t is configured with the pin, 1 ≤ t ≤ n (§6.6.1)

AUTHORITY\_QUOTA

256 statements

Kept per bucket authorised by a grant, its own and those its endorses rescue: revokes and endorses first, then grants, each by ascending id (§6.6.6)

AUTHORITY\_ANCHOR\_QUOTA

4,096 statements

Kept in the anchor’s bucket, by the same rule (§6.6.6)

AUTHORITY\_DELEGATE\_QUOTA

16 grants

Delegating grants (admin, validator, issuer) kept per bucket authorised by a grant, own and rescued (§6.6.6)

AUTHORITY\_SCOPE\_MAX

256 characters

Longest grant scope (§6.6.2)

AUTHORITY\_MAX\_TARGETS

64

Targets one revoke or endorse may name (§6.6.3)

AUTHORITY\_PAGE

64

Ids per authority-fetch, and statements per authority-set (§6.6.8)

AUTHORITY\_PENDING\_MAX

64 per session

Pending statements held in memory per session while their chain is fetched (§6.6.8)

AUTHORITY\_PENDING\_TIMEOUT

10,000 ms

A pending statement is released after this, or when its session closes (§6.6.8)

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

[control-encrypted.schema.json](/spec/mmp/schema/control-encrypted.schema.json)

Core Secure sealed envelope of one control frame (§18.2.1)

[cmb-frame.schema.json](/spec/mmp/schema/cmb-frame.schema.json)

Explicit cleartext or migration-profile CMB frame

[cmb-fetch.schema.json](/spec/mmp/schema/cmb-fetch.schema.json)

Content-address fetch request

[cmb-fetch-result.schema.json](/spec/mmp/schema/cmb-fetch-result.schema.json)

Content-address fetch response

[tether-attestation.schema.json](/spec/mmp/schema/tether-attestation.schema.json)

Lineage-tether attestation

[room-join.schema.json](/spec/mmp/schema/room-join.schema.json)

Owner-signed room-join grant, presented sealed after the handshake (§5.8.1)

[authority-frame.schema.json](/spec/mmp/schema/authority-frame.schema.json)

Grant, revoke and endorse statements and the authority-statement, authority-digest, authority-fetch and authority-set frames (§6.6)

[control-frame.schema.json](/spec/mmp/schema/control-frame.schema.json)

Mood, cmb-anchors, peer-info, wake-channel, error, ping and pong frames: inner frames of control-encrypted in Core Secure

[relay-frame.schema.json](/spec/mmp/schema/relay-frame.schema.json)

Relay authentication, directory, presence, keepalive and error frames

[sym-attest-frame.schema.json](/spec/mmp/schema/sym-attest-frame.schema.json)

The sym-attest-v1 extension frames (Draft Candidate Extension, §16.4): attestation, checkpoint, witness and node statistics

### 20.2 Closed core, negotiated extensions

Core objects use `additionalProperties: false`, with one exception: a record’s `categories` admits an unrecognised category, which a verifier drops (§8, §8.8.5). This is deliberate: a misspelled security field or an unsigned sibling must not be mistaken for a forward-compatible extension. Extension data is carried only in its specified container and only after the extension identifier was negotiated in the authenticated handshake.

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

**Ed25519 signature bytes are excluded from that requirement** — every one of them in this corpus, not only the field named `expectedSignature`: the handshake proofs (`clientProofBase64url`, `serverProofBase64url`) are signatures over the proof payload and fail on a hedged signer for the same reason. An implementation MUST verify each of them against the pinned payload and key, and MUST NOT be required to reproduce one. Ed25519 is deterministic in RFC 8032, but WebKit signs with added randomness, so Safari — and every browser on iOS, where no other engine is available — returns a different valid signature on each call. Requiring byte equality would declare a correct implementation non-conforming on that platform. Every pinned value that is NOT an Ed25519 signature — transcript hashes, HKDF outputs, key confirmations, AEAD ciphertext under the pinned nonces — is a deterministic function of its inputs and MUST reproduce exactly.



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

<!-- Extension: mesh-room-v0.2.0 (Proposal) -->

# MMP Extension: Mesh Room

**Generic Transient Subgroup Primitive for the Mesh Memory Protocol**

Version

0.2.0

Status

Draft — Candidate Extension

Date

15 April 2026

Author

Hongwei Xu <[hongwei@sym.bot](mailto:hongwei@sym.bot)\>, SYM.BOT

Extends

[MMP v2.0](/spec/mmp) — formalises §5.8 (Mesh Rooms) without changes to the core wire format

Canonical URL

[https://meshcognition.org/spec/mmp/extensions/mesh-room](https://meshcognition.org/spec/mmp/extensions/mesh-room)

Licence

CC BY 4.0 (specification text)

* * *

> **Renamed in 0.2.0 (15 September 2026).** The core protocol calls this concept a **room**: §5.8 is _Mesh Rooms_, the handshake field is `room`, and the published handshake schema has no `group` field. This extension was written before that rename and kept the old word throughout, which left the specification saying two things. Everything here now says room, including the identifiers: `groupId` → `roomId`, `group_id` → `room_id`, `group_label` → `room_label`, `group_token` → `room_token`, Bonjour `_mmp-mesh-group._tcp` → `_mmp-mesh-room._tcp`. The previous identifier `mesh-group-v0.1.0` is superseded by `mesh-room-v0.2.0` and is not an alias — nothing implemented the old names (no engine, SDK or app references them), so there is no compatibility to preserve, and a silent alias would hide the rename from the next reader.

## Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the core MMP wire format and does not require an MMP version bump.

Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §10. Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension.

This status discipline preserves the SYMBit whitepaper §4.1 commitment: SYMBit does not require changes to the MMP protocol specification. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

* * *

## Abstract

This extension defines a generic application-layer convention for a **mesh room** — a small set of MMP nodes that have explicitly joined a shared, named room within the broader mesh — and the canonical CMB conventions members use to broadcast state to the room.

The convention does not change the core MMP wire format. CMBs remain schema-valid, signed MMP v2.0 records. This convention specifies how members agree on room identity, discover each other, bind room context inside authenticated application bytes, and bound room lifetime.

The convention is the protocol primitive that real-world co-located room experiences are built on. The first use case (§9) is MeloTune’s “Mood Room” feature; the convention is intentionally generic so that other applications — room meditation, collaborative work sessions, multiplayer co-located experiences — can adopt it and interoperate at the protocol layer.

* * *

## Introduction

MMP v2.0 §5.8 (Mesh Rooms) names mesh rooms as a structural concept but does not specify how a room is identified, discovered, or membership-managed. Implementers have adopted ad-hoc conventions, which has prevented cross-application interoperability.

This extension formalises the conventions that §5.8 leaves underspecified:

-   A canonical `roomId` committed inside `metadata.application` bytes.
-   A Bonjour service type for LAN discovery and a relay channel pattern for WAN.
-   A focus-prefix convention so multiple applications can share room infrastructure without colliding on state semantics.
-   A receiver-side filtering rule for room-scoped CMBs.
-   A membership lifecycle (join, heartbeat, leave, expire) covered by short, optional CMBs.

Nothing in this extension changes the MMP v2.0 core wire format. The application payload is covered by the record assertion through §8.8’s application commitment, so a relay or peer cannot substitute room context without invalidating the signature.

* * *

## 1\. Motivation

### 1.1 The §5.8 Gap

MMP v2.0 §5.8 introduces “mesh rooms” but treats them as an opaque concept. Two implementers reading §5.8 cannot independently produce code that joins each other’s rooms. The §5.8 text describes the semantic intent without specifying:

-   The wire format of the room identifier.
-   The discovery mechanism for finding co-members.
-   The CMB tagging that lets receivers filter room-scoped traffic.
-   The lifecycle events that mark joins, leaves, and expiration.

This extension fills the gap by formalising the conventions that §5.8 leaves to implementers.

### 1.2 Real-World Co-located Room Use Cases

Room experiences happen at human scale: a small number of people, briefly co-located, sharing some state. MeloTune’s Mood Room is one example: 2–6 listeners in the same physical space, each running MeloTune on their own device, each broadcasting their music-agent state into the shared room.

Other use cases follow the same pattern: a room meditation app where N practitioners share breathing-cycle state; a collaborative work app where N team members share focus-context; a multiplayer co-located experience where N participants share game-state. All of these need the same protocol primitive: a transient, named, peer-discovered subgroup of the broader mesh.

The mesh-room convention is intentionally generic so that an application implementing it for one use case interoperates at the protocol level with another application using it for an unrelated purpose. Each application defines its own state semantics (per §5.4 focus-prefix); the room-membership and CMB-routing primitives are shared.

* * *

## 2\. Mesh Room Model

A mesh room is an explicit, transient grouping of MMP nodes. Membership is voluntary on both sides: a node joins by advertising its membership; the room exists from the moment its first member joins until either the last member leaves or an optional `expires_at` timestamp passes.

The mesh room is **not** a long-lived addressable entity. It does not have a persistent state on any node beyond the transient list of currently-known members. A room that has zero members for more than a brief grace period is effectively terminated.

Term

Definition

mesh room

A named, transient subgroup of the broader MMP mesh whose members have explicitly joined and are mutually discoverable.

`roomId`

Stable UUID identifier for a mesh room, carried in authenticated `metadata.application` bytes.

room token

OPTIONAL bearer token shared out-of-band among joiners; REQUIRED for WAN relay-mediated rooms, OPTIONAL for Bonjour-LAN rooms.

member

An MMP node with a joined session in the room. Identified by its standard MMP identity (Ed25519 public key per MMP §3.2).

room-scoped CMB

A CMB whose decoded, digest-verified application object names this extension and the room’s `roomId`.

lifetime

A room exists from the moment its first member joins until either the last member leaves OR the optional `expires_at` timestamp passes.

This document uses [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) keywords (MUST, SHOULD, MAY) as written in capital letters.

* * *

## 3\. Room Identity

A mesh room MUST have:

-   A `room_id` (string, UUIDv4 RECOMMENDED).

A mesh room MAY have:

-   A `room_label` (human-readable string, ≤64 UTF-8 bytes).
-   An `expires_at` (RFC 3339 timestamp).
-   A `room_token` (opaque bearer string).

The `room_token` is REQUIRED for WAN relay-mediated discovery (§4.2) and is OPTIONAL for Bonjour-LAN-mediated discovery (§4.1).

The convention does not specify how `room_id`, `room_label`, `expires_at`, or `room_token` are agreed among members. Implementations typically distribute these out-of-band: one node generates them, and other nodes receive them via QR code, NFC tap, push notification, share-sheet link, or any other application-layer channel.

* * *

## 4\. Discovery

### 4.1 LAN Discovery via Bonjour

Members MUST advertise the room via Bonjour service type `_mmp-mesh-room._tcp` with the following TXT record:

```
room_id        = <UUIDv4>
room_label     = <optional, ≤64 bytes>
mmp_version     = 2.0
member_identity = <Ed25519 public-key fingerprint, first 16 hex chars>
```

A node joining the room browses for `_mmp-mesh-room._tcp`, filters by matching `room_id` in TXT records, and connects to the discovered peers using standard MMP Layer 1 (TCP) transport.

**Concrete TXT record example:**

```
room_id        = 550e8400-e29b-41d4-a716-446655440000
room_label     = Living Room Sunday
mmp_version     = 2.0
member_identity = a1b2c3d4e5f6a7b8
```

Bonjour TXT records are key=value pairs of UTF-8 bytes; total record size MUST stay under the mDNS ~400-byte practical limit. `room_label` SHOULD be omitted if it would push the record over budget.

### 4.2 WAN Discovery via Relay (OPTIONAL)

Rooms MAY operate LAN-only via Bonjour alone. Implementations without relay support interoperate with relay-aware implementations on the Bonjour path.

When a relay is used, members register membership with the SYM relay by:

1.  Opening a WebSocket connection to the relay endpoint.
2.  Presenting `room_token` as a bearer credential in the connection handshake (`Authorization: Bearer <room_token>` header).
3.  Subscribing to the per-room channel named by `room_id`.

The relay enforces token-based authorisation and forwards opaque peer frames only among members holding a valid token for that `room_id`. Endpoints, not the relay, decrypt and verify that the signed application bytes name the same room.

Members SHOULD reconnect on disconnection with exponential backoff (default: 1 second initial, 60 seconds maximum).

The relay protocol’s wire format is anchored in MMP v2.0 §4 transport conventions; a normative public-spec reference will be added at promotion time per §10.

* * *

## 5\. CMB Tagging Conventions

### 5.1 Room-Scoped CMBs

A member’s CMB is “room-scoped” when its decoded `metadata.application` bytes are JSON containing `{"extension":"mesh-room-v0.2.0","roomId":"<UUID>"}` and the application byte length, digest and data verify under §8.7–§8.8. The room object MAY add `event`, `roomLabel` and application-owned state.

Members MAY emit:

-   **Room-scoped CMBs** — authenticated application bytes name this extension and a `roomId`.
-   **Un-scoped CMBs** — application bytes do not name this extension, and ordinary MMP routing applies.

A member MAY filter inbound CMBs by the verified application `roomId`. It MUST verify the application digest and record signature before acting on that value. Receivers are not required to support this candidate convention.

### 5.2 Application Focus-Prefix Convention

For inter-application interoperability, room members MAY use a `categories.focus.text` prefix to indicate the kind of room state being broadcast. The prefix format is `<app>:<state-type>`. Examples:

-   MeloTune Mood Room: `categories.focus.text: "melotune-room:state"`, `"melotune-room:peer"`
-   (hypothetical) Room meditation: `categories.focus.text: "meditation:phase"`
-   (hypothetical) Collaborative work: `categories.focus.text: "cowork:status"`

This is a RECOMMENDED convention, not a requirement. Applications MAY use any focus content. Inter-application namespace registration is deferred to a future version of this extension (§11).

* * *

## 6\. Membership Lifecycle

Event

Behaviour

Join

Member begins advertising via Bonjour AND/OR registering with relay. Member SHOULD emit one room-scoped CMB with `categories.focus.text: "mesh-room:join"`, application `event: "join"`, and neutral mood.

Heartbeat

Member SHOULD re-advertise Bonjour at default mDNS cadence. No required heartbeat CMB; absence-of-CMB is detected at the application layer per receiver policy.

Leave

Member ceases Bonjour advertisement and unregisters from relay. Member SHOULD emit one room-scoped CMB with `categories.focus.text: "mesh-room:leave"`, application `event: "leave"`, and neutral mood.

Expire

At `expires_at` if set, members SHOULD treat the room as terminated and stop emitting room-scoped CMBs. Receivers SHOULD discard room-scoped CMBs received after `expires_at`.

The recommended `mesh-room:join` and `mesh-room:leave` CMBs are convention-level; applications MAY detect membership changes via Bonjour churn alone.

* * *

## 7\. Receiver Behaviour

A node receiving a room-scoped CMB SHOULD verify:

1.  The sender’s identity is currently a known member of the room (via the Bonjour browse list AND/OR relay registration).
2.  The CMB is received before `expires_at` (if set).

A node MAY accept room-scoped CMBs from unknown senders if the application context warrants it (for example, a listener entering a Mood Room mid-session may not yet have observed the original joiner’s announcement).

* * *

## 8\. Failure Modes

Failure

RECOMMENDED Behaviour

`expires_at` passes during active broadcasts

Members SHOULD stop emitting room-scoped CMBs at the timestamp; receivers compare it with their own authenticated-session receive clock, never an author-asserted timestamp. Active media playback or application sessions are not terminated by this specification — applications decide their own response.

`room_token` rejected by relay mid-session

Member SHOULD treat as a room-leave event and surface the failure to the application layer. Reconnection policy is application-defined.

Bonjour advertisement fails (mDNS error, sandbox rejection)

Member MAY fall back to relay-only registration if `room_token` is available. If neither path works, the member is effectively isolated; the failure SHOULD be surfaced to the application layer rather than silently absorbed.

Two members generate the same `room_id` independently

UUIDv4 collision probability is negligible; if observed, the second-joining member SHOULD detect via Bonjour (existing TXT record with the same `room_id` from a different `member_identity`) and refuse to join.

Room has zero members for more than 60 seconds

Room is effectively terminated. Receivers MAY ignore subsequent late-arriving CMBs from a member that had not yet observed the empty state.

The interop test specification for the §10 promotion criterion (“two implementations interoperate”) is **deferred to post-v0.1.0** and will be specified jointly with the second implementer when adoption occurs. The test suite will minimally cover Bonjour discovery of cross-implementation peers, room-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-room:join` / `mesh-room:leave` lifecycle event observation across implementations.

* * *

## 9\. First Use Case — MeloTune Mood Room

MeloTune’s “Mood Room” is the first use case of this extension. The MeloTune product:

1.  Generates a `room_id` UUID per Mood Room.
2.  Sets `room_label` to the room’s user-facing name (e.g., “Living Room Sunday”).
3.  Sets `expires_at` to 24 hours after creation (configurable in MeloTune settings).
4.  Distributes `room_token` to invited listeners via the in-app share sheet (Bonjour-LAN rooms can omit token; relay-WAN rooms require it).
5.  Each MeloTune instance joins the room, advertises via Bonjour `_mmp-mesh-room._tcp` and registers with the relay, and emits room-scoped CMBs with `categories.focus.text: "melotune-room:state"` plus authenticated application state.
6.  Each MeloTune instance receives the other listeners’ `melotune-room:state` CMBs and feeds them into MeloTune’s Personal Arousal Function for music curation.

The MeloTune-product naming, UX, and music semantics are MeloTune-specific and are NOT part of this extension. Other applications adopting this extension would use their own focus prefixes and their own state semantics.

* * *

## 10\. Promotion Criteria

This document is a Draft Candidate Extension. Promotion to Published status in the MMP §16 Extensions registry requires:

1.  **A second independent implementer adopts.** At least one application outside MeloTune ships a working implementation. “Implementer” means a distinct codebase, not a MeloTune-derived fork.
2.  **Two implementations interoperate.** Demonstrated via documented interop test vectors, not anecdotal co-presence. The test vectors minimally cover Bonjour discovery of cross-implementation peers, room-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-room:join` / `mesh-room:leave` lifecycle observation across implementations.
3.  **No accumulated breaking changes.** If the convention has been revised to v0.2.0 or later during the wait, promote the stable v0.x.0 that both implementers ran against.

When the promotion criteria are met, this document moves from candidate status to a Published §16 Extension. The Status field above changes from “Draft — Candidate Extension” to “Published”; an “Adopters” section replaces this Promotion Criteria section; the spec body (§§1–9, 11, 12) is unchanged at promotion.

Until promotion, this document does NOT establish a formal MMP extension. The SYMBit whitepaper §4.1 (“SYMBit does not require changes to the MMP protocol specification”) remains strictly true: this extension does not add MMP wire format, does not add §16 registry entries, does not require the MMP version to bump.

* * *

## 11\. Future Work

Items deferred past initial draft:

-   **Cryptographic room membership.** Replace shared bearer token with per-member capability tokens signed by a designated room authority.
-   **Room key agreement.** TLS-style session key derivation between members for end-to-end encryption of room-scoped CMBs.
-   **Room state persistence.** Currently transient (`expires_at` then gone). v0.2.0+ MAY add optional persistent room state (rejoinable, history-replayable).
-   **Multi-app room interop.** Once two or more applications adopt the convention, formalise focus-prefix registration so applications do not collide on the `<app>:<state-type>` namespace.
-   **IANA service-type registration.** A formal RFC track would require Bonjour service type `_mmp-mesh-room._tcp` registration with IANA per RFC 6335. Out of scope for v0.1.0; named here as post-promotion work.
-   **Rate limiting and DoS considerations.** A malicious or buggy member could flood the room with CMBs at rates that overwhelm receivers. v0.2.0+ defines per-member rate-limit guidance and receiver-side back-pressure semantics.
-   **Versioning strategy.** Co-existence rules for v0.1 and v0.2+ implementations in the same room. Forward-compatibility (v0.1 receiver tolerates v0.2 fields it does not understand) and backward-compatibility (v0.2 emitter degrades gracefully when a v0.1 receiver is detected via TXT record).
-   **Bonjour and relay membership reconciliation.** When the same `room_id` returns conflicting membership lists from Bonjour browse and relay subscription, this v0.1.0 convention does not specify resolution. v0.2.0+ defines the canonical merge rule.

* * *

## 12\. Security Considerations

-   **Room token distribution is out-of-band.** Compromise of the token allows a third party to join the room and observe or inject CMBs. v0.1.0 does not protect against this; v0.2.0+ adds capability tokens.
-   **Bonjour discovery is unauthenticated.** Any node on the local network can browse `_mmp-mesh-room._tcp` and learn `room_id` values. Confidential room identity requires the WAN-relay path with `room_token`.
-   **CMB content is not encrypted at this layer.** Existing MMP transport security (per MMP §18.2) applies between adjacent peers; end-to-end encryption among room members requires the room key agreement deferred to v0.2.0+.
-   **No per-member access control.** All members see all room-scoped CMBs in v0.1.0. Per-member ACLs are out of scope.

These limitations are documented openly because this is a Draft Candidate Extension. They will be addressed in subsequent versions before this extension is recommended for safety-critical or high-confidentiality deployments.

* * *

## 13\. Conformance

A conforming implementation MUST:

1.  Support `roomId` as a UUID string inside digest-verified, assertion-bound `metadata.application` bytes.
2.  Advertise room membership via Bonjour service type `_mmp-mesh-room._tcp` with the TXT record format in §4.1.
3.  Verify the CMB and application commitment before filtering room-scoped CMBs by `roomId`.
4.  Honour `expires_at` if set: cease emitting room-scoped CMBs after the timestamp; discard inbound room-scoped CMBs received after the timestamp.

A conforming implementation SHOULD:

1.  Emit `mesh-room:join` and `mesh-room:leave` CMBs at lifecycle boundaries.
2.  Re-advertise Bonjour at the default mDNS cadence.
3.  Implement the receiver-side membership verification rules in §7.
4.  Surface failure modes from §8 to the application layer rather than absorbing them silently.

A conforming implementation MAY:

1.  Support WAN relay-mediated discovery per §4.2.
2.  Accept room-scoped CMBs from unknown senders if the application context warrants it.
3.  Use the application focus-prefix convention from §5.2.

* * *

## 14\. Change Log

-   **v0.1.0** (2026-04-15) — Initial Draft Candidate Extension. Authored by Hongwei Xu (SYM.BOT) with design review from `claude-strategic-win` (operations) and `claude-research-win` (research) under Hongwei’s direction. First use case: MeloTune Mood Room.

* * *

## 15\. References

1.  [MMP v2.0 — Mesh Memory Protocol Specification](/spec/mmp). Particularly §3 (Identity), §4 (Transport), §5.8 (Mesh Rooms), §8.8 (record assertions), and §16 (Extensions).
2.  [RFC 2119 — Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119).
3.  [RFC 6335 — IANA Procedures for Service Name and Transport Protocol Port Number Registry](https://datatracker.ietf.org/doc/html/rfc6335). Cited in §11 for the IANA service-type registration future-work item.
4.  Xu, H. (2026). _Symbolic-Vector Attention Fusion for Collective Intelligence._ arXiv:[2604.03955](https://arxiv.org/abs/2604.03955) \[cs.MA, cs.AI\]. The cognitive-coupling layer that consumes CMBs delivered via this convention.

* * *

## Acknowledgements

Spec design and review under SYM.BOT’s CTO/COO/CMO peer-audit cycle. No external implementer adoption at v0.1.0 publication; promotion criteria in §10 govern progression to Published status.



---

<!-- Extension: room-directory-v0.2.0 (Draft) -->

# MMP Extension: Room Directory (Draft)

**Persistent Room Metadata, Admin Approval, and Directory Enumeration for Cognitive Mesh Coupling**

Version

0.2.0-DRAFT

Status

Draft — not yet published, not yet implemented

Date

19 April 2026

Author

Hongwei Xu [hongwei@sym.bot](mailto:hongwei@sym.bot), SYM.BOT

Extends

[MMP v2.0](/spec/mmp) — Section 5.8 (Mesh Rooms) and the mesh-room candidate convention

Depends on

[sym-relay](https://github.com/sym-bot/sym-relay) — token-channel isolation (already shipped)

Canonical URL

[https://sym.bot/spec/mmp-room-directory](https://sym.bot/spec/mmp-room-directory) (not yet live)

Licence

CC BY 4.0 (specification text)

Motivation context

[sym-mesh-channel conversation, 19 Apr 2026](https://github.com/sym-bot/sym-mesh-channel/pull/0)

* * *

> **Renamed in 0.2.0-DRAFT (15 September 2026).** The core protocol calls this concept a **room**: §5.8 is _Mesh Rooms_, the handshake field is `room`, and the published handshake schema has no `group` field. This draft was written before that rename and kept the old word throughout. Everything here now says room, including every identifier this extension proposes: `group_id` → `room_id`, `group_token` → `room_token`, the MCP tools (`sym_rooms_browse`, `sym_room_create`, `sym_room_request_join`, `sym_room_approve_member`, `sym_room_reject_member`, `sym_room_revoke_member`), the SDK calls (`SymNode.listRooms()`, `SymNode.createRoom()`), and the extension identifier itself, `group-directory-v0.1.0` → `room-directory-v0.2.0`. Three names that this draft described as ALREADY SHIPPED were also wrong against the code rather than merely old, and are corrected to what ships: the environment variable is `SYM_ROOM`, and the tools are `sym_join_room` and `sym_rooms_discover`. Not an alias — nothing implemented the old names, so there is no compatibility to preserve, and a silent alias would hide the rename from the next reader.

## Abstract

MMP §5.8 mesh rooms give cognitive meshes an isolation primitive: nodes in different rooms never exchange application traffic, because the authenticated handshake refuses a room mismatch. This is sufficient for small dev teams who already know each other’s room names and coordinate the shared secret out of band.

It is **not** sufficient for the UX model end users expect from chat platforms (Telegram, Discord, Slack): browse a list of rooms, see who is in them, request to join, wait for admin approval, get accepted or denied.

This extension specifies the protocol additions needed to bridge that gap: **persistent room metadata** (rooms visible even when every member is offline), **admin approval** (pending-member queue, admin identity, accept / reject actions), and **directory enumeration** (browse public rooms through a known directory endpoint). The extension is opt-in per room — MMP §5.8 bare rooms continue to work unchanged for any team that wants the minimal primitive.

* * *

## Introduction

### What MMP §5.8 already provides

-   **LAN rooms**: a node setting `SYM_ROOM=<name>` advertises on `_sym._tcp` with TXT `room=<name>` (§5.1). Nodes in different rooms are mutually visible at mDNS and are separated by the authenticated handshake, not by discovery. (Per-room service types `_<name>._tcp` are the legacy mapping, kept only during migration.) Membership is per-process, constructor-locked.
-   **Relay channels**: the `sym-relay` server maps tokens to channels (`SYM_RELAY_CHANNELS=token1:channel1,...`). Each token reaches exactly one channel; channels are isolated routes on the relay. Peers on the same token see each other’s presence (gossiped connected + offline peers with wake channels) and exchange CMBs. Peers on different tokens never see each other.

The primitives above give isolation and per-token peer visibility _within_ a room. They do not give any cross-room visibility, public browsing, admin authority, or persistent state that survives all members going offline.

### What this extension adds

1.  **Persistent room metadata** — a room has a canonical name, optional description, creation timestamp, admin node-id(s), visibility flag (public / private), and a creation-protected relay-channel binding. This metadata outlives member presence.

2.  **Admin approval gate** — joining a private room is a two-step request / accept flow. The requester’s node-id enters a pending queue visible to admin(s). Admin issues accept (grants channel token) or reject (notifies requester). Public rooms skip the approval gate but still record membership.

3.  **Directory enumeration** — a well-known endpoint on the relay (`/rooms`) returns the list of public rooms with metadata. Private rooms are absent from this listing (visible only to members and pending requesters).

4.  **Room lifecycle operations** — create (become first admin), transfer admin, revoke member, delete room (admin only).


All four are opt-in: a bare MMP §5.8 room as shipped in sym-mesh-channel 0.1.23 continues to work exactly as it does today. A room becomes _directory-registered_ only when an admin explicitly creates it on a relay that supports this extension.

* * *

## Design

### Data model

A directory-registered room is represented on the relay as:

```
Room {
  id:                  string              # UUID v7, issued by relay on creation
  name:                string              # kebab-case, unique within the relay host
  description:         string?             # optional, ≤ 280 chars
  visibility:          "public" | "private"
  created_at:          ISO 8601 timestamp
  admins:              [node_id]           # one or more; first = creator
  members:             [node_id]           # accepted members
  pending_requests:    [PendingRequest]    # present only for admins' view
  channel_token:       string              # shared secret granted to accepted members
  service_type:        string              # _<kebab-name>._tcp for LAN bridge (optional)
}

PendingRequest {
  node_id:             string              # requester's full node-id
  name:                string              # requester's display name (self-reported)
  public_key:          string              # Ed25519 hex, for attestation of accept action
  requested_at:        ISO 8601 timestamp
  message:             string?             # optional prose from requester
}
```

Persistence: relay writes `Room` records to disk (SQLite is sufficient — low write volume, single-digit-MB scale even at thousands of rooms). Room records survive relay restart; member presence does not (presence is ephemeral, already gossiped through existing `relay-peers` frames).

### Protocol frames (proposed)

These proposed frames are JSON-encoded and follow the extension type naming rule from MMP §16. They MUST NOT be sent unless the relay and client have authenticated and explicitly selected `room-directory-v0.2.0`. This draft does not yet define that relay-capability negotiation, so the section is a design target rather than an interoperable wire contract; promotion is blocked until the negotiation and schemas are published.

**From client to relay:**

```
{ "type": "room-directory-create", "name": "backend-team", "description": "...",
  "visibility": "private" }

{ "type": "room-directory-list", "visibility": "public" }   // public only — admin auth
                                                   // required for "private" list

{ "type": "room-directory-join-request", "room_id": "…", "message": "..." }

{ "type": "room-directory-accept", "room_id": "…", "node_id": "…" }   // admin only

{ "type": "room-directory-reject", "room_id": "…", "node_id": "…", "reason": "..." }

{ "type": "room-directory-leave", "room_id": "…" }

{ "type": "room-directory-revoke", "room_id": "…", "node_id": "…" }   // admin only

{ "type": "room-directory-transfer-admin", "room_id": "…", "new_admin": "…" }

{ "type": "room-directory-delete", "room_id": "…" }   // admin only
```

**From relay to client:**

```
{ "type": "room-directory-created", "room": { ... } }         // response to create

{ "type": "room-directory-list-result", "rooms": [ ... ] }    // response to list

{ "type": "room-directory-join-pending", "room_id": "…" }     // requester waits

{ "type": "room-directory-join-accepted", "room_id": "…", "channel_token": "…" }

{ "type": "room-directory-join-rejected", "room_id": "…", "reason": "…" }

{ "type": "room-directory-member-joined", "room_id": "…", "node_id": "…" }   // fanout

{ "type": "room-directory-member-left", "room_id": "…", "node_id": "…" }

{ "type": "room-directory-pending-update", "room_id": "…",
  "pending": [ PendingRequest, ... ] }                              // admin only

{ "type": "room-directory-admin-transferred", "room_id": "…",
  "old_admin": "…", "new_admin": "…" }

{ "type": "room-directory-deleted", "room_id": "…" }
```

### Authorisation

-   **Create**: any authenticated node can create. Creator is sole initial admin.
-   **List public**: any authenticated node. Anonymous listing is out of scope for v0.1.0 (requires a separate unauthenticated endpoint with rate limiting).
-   **List private**: admin of the target room only, or member for their own memberships.
-   **Accept / reject / revoke / delete / transfer-admin**: admin only, verified by the `node_id` in the WebSocket’s authenticated session matching the room’s `admins` list.
-   **Join request**: any authenticated node. Request queues for admin review.
-   **Leave**: any current member.

### Directory discovery

The relay exposes an HTTP GET endpoint `/rooms` returning the list of public rooms as JSON:

```
{
  "relay": "sym-relay.onrender.com",
  "rooms": [
    {
      "id": "0193...",
      "name": "sym-research",
      "description": "Open discussion of mesh cognition research",
      "created_at": "2026-04-20T12:34:56Z",
      "member_count": 7,
      "online_now": 3
    }
  ]
}
```

This endpoint has no auth by design (public discovery). Rate-limited to 10 requests per minute per source IP. Private rooms are never included.

An MCP client implementing this extension adds `sym_rooms_browse` tool that hits this endpoint on the configured relay host and returns the list in human-readable form.

### Relationship to existing primitives

Primitive

Status

Relationship to this extension

MMP §5.8 bare LAN room

Shipped (v0.1.23)

Unchanged. Bare rooms remain in-band (mDNS only), not registered with any relay, invisible to `/rooms`.

sym-relay token/channel isolation

Shipped

This extension uses token/channel as the transport primitive for directory-registered private rooms. Creation emits a token; accept hands the token to the accepted member.

`sym_invite_create` / `sym_invite_info`

Shipped (v0.1.23)

URL-based invite flow remains as the **private** join path — admin generates invite, shares out of band, each invite bundles the channel token. Works with or without directory registration.

`sym_join_room`

Shipped (v0.1.23)

Extended: for directory-registered rooms, `sym_join_room` becomes multi-step — issues `room-join-request`, waits for accept, then hot-swaps with the granted token.

### Implementation surface

Estimated size (rough):

-   **sym-relay**: ~800 LOC additional (SQLite schema, room CRUD handlers, admin auth, fanout on room-member events, `/rooms` HTTP endpoint, rate limiting). Existing peer gossip infra reused.
-   **@sym-bot/sym**: ~300 LOC additional (protocol frames on SymNode, admin-side events, pending-queue subscription, request/accept state machine).
-   **sym-mesh-channel**: 4–6 new MCP tools (~200 LOC):
    -   `sym_rooms_browse` — GET /rooms on configured relay
    -   `sym_room_create` — creates on relay, becomes admin
    -   `sym_room_request_join` — sends join-request, waits for result
    -   `sym_room_approve_member` — admin action on pending request
    -   `sym_room_reject_member` — admin action on pending request
    -   `sym_room_revoke_member` — admin action post-accept
    -   (extensions to existing `sym_rooms_discover` to include directory-registered rooms on configured relays)

* * *

## Open questions

1.  **Multi-admin conflict**: what happens if two admins simultaneously accept/reject the same pending member? Last-writer-wins is simplest; need to verify it doesn’t cause token leaks to rejected members.

2.  **Relay federation**: the spec above assumes a single relay host per room. Federated relays (rooms discoverable across multiple relay hosts) is possible but substantially increases complexity. Recommend single-relay v0.1.0, federation in v0.2+.

3.  **Public-room enumeration abuse**: `/rooms` is unauthenticated for public discovery. A popular relay could become a discovery target for spam or scraping. Rate limits help; stronger mitigations (proof-of-work tokens, captcha) may be needed if this matters at scale. Private relays don’t have this problem.

4.  **Room name collisions across relays**: names are unique per relay host. Cross-relay, two unrelated rooms can share a name. This is acceptable in v0.1.0 — invite URLs already carry the relay host as the authority.

5.  **Token rotation**: if a member is revoked, the channel token is shared with remaining members unchanged; the revoked ex-member technically retains the token until the relay forces reconnection and rejects the now-revoked node-id. Safer: rotate the channel token on every revoke. Trade-off: momentary re-handshake for all remaining members. Recommend rotate-on-revoke.

6.  **Bootstrap admin on existing bare room**: how does a team currently using a bare MMP §5.8 room “upgrade” to a directory- registered room without losing presence? Likely answer: create the new directory-registered room, migrate members one at a time via invite URLs, decommission the bare room. Document in a migration guide, not in the protocol.

7.  **Mobile / sleeping peers**: MMP §16 (SYMBit) and related extensions contemplate sleeping peers. Pending-member queue for a sleeping admin is a known gap — admin’s client must be online to process requests. Future: relay-side “admin delegate” role for long-sleep scenarios. Out of scope for v0.1.0.


* * *

## Rollout plan

Three stages, each independently valuable:

### Stage 1 — relay directory endpoint + public-room CRUD (v0.1.0-alpha)

-   `sym-relay`: schema, `/rooms` HTTP, room-create / room-list / room-delete.
-   `@sym-bot/sym`: `SymNode.listRooms()` / `SymNode.createRoom()`.
-   `sym-mesh-channel`: `sym_rooms_browse`, `sym_room_create`.
-   **UX delivered**: users can browse public rooms on a relay, create new public rooms, and share direct invite URLs. No admin approval yet — public rooms are open-join.

### Stage 2 — admin approval gate (v0.1.0-beta)

-   `sym-relay`: pending-request queue, admin-only frames (accept, reject, revoke), fanout on member changes.
-   `@sym-bot/sym`: admin-side events, request state machine.
-   `sym-mesh-channel`: `sym_room_request_join`, `sym_room_approve_member`, `sym_room_reject_member`, `sym_room_revoke_member`.
-   **UX delivered**: private rooms with gated membership. Full Telegram- style team management within a single relay.

### Stage 3 — polish, migration, security hardening (v0.1.0)

-   Token rotation on revoke.
-   Multi-admin race resolution.
-   Migration guide for upgrading bare §5.8 rooms.
-   Rate-limiting on `/rooms`.
-   Move spec from DRAFT to Published. Publish canonical URL `https://sym.bot/spec/mmp-room-directory`.

* * *

## Notes for future-me

**Motivation context** (19 April 2026): we shipped sym-mesh-channel 0.1.23 with hot-swap room join + invite-URL flow. User feedback was that the ideal UX is Telegram-like (browse, request, admin approves) but that requires server-side persistent state — the existing P2P + token-channel relay handles isolation but not directory or admin. This extension is the design for that missing layer.

**Why this is a protocol extension and not just a relay feature**: the room-member lifecycle frames (`room-join-request`, `room-member-joined`, etc.) need to interoperate between different client implementations — sym-mesh-channel (Node.js), sym-swift (iOS/macOS), any future client. The relay is the reference implementation, but the protocol frames belong to MMP. Hence the extension-document home rather than a relay-repo design doc.

**What not to build**: resist adding rich chat features (text formatting, reactions, read receipts) — these are out of scope and would blur the line between MMP (cognitive state exchange) and chat platforms (human messaging). Room-directory stays narrowly about membership, not content.

**Pick-up signal for later**: when either (a) a user explicitly asks for admin-approval UX, or (b) we have more than ~50 dev teams using bare §5.8 rooms and confusion about “where’s my room?” becomes a support issue, that’s the signal to pick this up.



---

<!-- Extension: error-handling-v0.2.0 (Draft — Candidate Extension) -->

# MMP Extension: Error Handling

**Failure as a First-Class Cognition Event**

Version

0.2.0

Status

Draft — Candidate Extension

Date

24 July 2026

Author

Hongwei Xu <[hongwei@sym.bot](mailto:hongwei@sym.bot)\>, SYM.BOT

Extends

[MMP v2.0](/spec/mmp) — application-layer convention over §6.7 (grounding), §9.2 (receiver-autonomous SVAF), and §13 (cognitive state); no changes to the wire format

Canonical URL

[https://meshcognition.org/spec/mmp/extensions/error-handling](https://meshcognition.org/spec/mmp/extensions/error-handling)

Licence

CC BY 4.0 (specification text)

* * *

## 1\. Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the MMP wire format and does not require an MMP version bump. Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §11 (Promotion Criteria). Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

**Maturity note (v0.2.0).** Sections §1–§5 and §9–§10 describe the failure-event convention, of which a reference deployment reports an experimental implementation (§10). Sections **§6–§8 — field-level accountability and the Adaptation-on-Failure loop — are a newer, lower-maturity addition: specified here but not part of any reported implementation, and not yet demonstrated.** Their promotion gate is an unrun, register-first experiment (the router-validation study, §11). Nothing in §6–§8 should be read as a shipped capability.

## 2\. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals. Conformance is claimed by a **publisher** (the harness that publishes failure events) and by a **receiver** (a node that admits and may act on them).

## 3\. Abstract

Agent frameworks conventionally treat failure as an exception to suppress: retry the same agent, fall back, or escalate. A retry that keeps the failed attempt inside its own control flow and records only the final result destroys three things the failure produced — the **evidence** (the failing check’s output), the **record** (a repaired result becomes indistinguishable from a first-pass success), and the **choice of who fixes it** (pre-empted in favour of the agent that just failed). A deployment that assigns every repair to a fixed agent also bypasses receiver-autonomous volunteering for that repair.

This extension specifies the alternative: **failure is a cognition event**. A mechanically detected failure on a completed claim is published to the mesh as an ordinary CMB carrying its evidence, with the failed claim in its lineage. From there the protocol’s existing machinery operates unchanged: every receiver’s own admission (§9.2) judges relevance, an admitting agent may take the corrective as work — nobody assigns — and the failure and any subsequent fix ground as **separate** §6.7 outcomes against the claimer and the fixer respectively. A proposed extension of this loop (§6–§8) lets a failure also _change what a receiver admits or holds_ — the admission-side adaptation the base convention names but does not define.

## 4\. The failure event

When mechanical checks — executed and tallied by the harness outside the claimer’s generation step — fail on a completion claim, the harness SHOULD publish a **corrective request CMB**:

-   **lineage** — `lineage.parents` MUST contain the key of the failed completion claim. Parentage travels in lineage, never only in prose.
-   **focus** — a plain statement that completed work failed its checks, followed by the **evidence** (§4.1), followed by bounded context from the original task.
-   **intent** — `request`. The failure event is an _open invitation_, not an assignment.
-   **commitment** — the acceptance criteria of the original work, carried **byte-for-byte inside a clearly delimited block**, so the _same criteria govern the fix_ — repaired means repaired, by the original bar.
-   **issue** — ordinary descriptive text (e.g. `check-failure`); it carries no normative routing semantics.
-   **addressing** — the corrective request MUST be a room-bound broadcast with no directed recipient, so §9.2 receiver-autonomous delivery and admission remain operative.

### 4.1 Evidence

The event MUST carry the failed check identifiers together with their captured `stdout`/`stderr`, subject to an operator-configured, non-zero byte limit per stream; when either stream is shortened, the event MUST carry an explicit truncation indicator. The numeric limit is implementation-defined. (Conformance test: a known `stderr` sentinel survives publication intact; oversized output arrives marked truncated.)

### 4.2 What MUST NOT happen

-   Publication of a failure event MUST NOT suppress the original completion claim or its `failed:` grounding (§5). Error handling never hides the error.
-   The publisher MUST NOT route, rank, or assign the repair. Publication is mechanical duty; coordination belongs to admission.
-   A completion whose only failed checks are **fabricable** — satisfiable by the claimer’s own unverified action, such as bare file-existence checks — SHOULD NOT spawn a corrective event: there is no independent evidence to ground a fix on.

_Informative:_ deployments typically also surface open, untaken correctives to a human operator through their normal attention surfaces; this document does not standardise that surface.

## 5\. Grounding — the double record

The failure and the fix are **separate grounded outcomes**, each an ordinary §6.7 grounding CMB:

-   the initial failure grounds against the **claimer**: a grounding CMB with a `failed:` commitment prefix whose `lineage.parents` names the original completion claim;
-   a corrective’s result grounds against the **fixer**: a grounding CMB with a `verified:` or `failed:` commitment prefix whose `lineage.parents` names the corrective completion.

Accountability follows the signed authors of those distinct CMBs. An implementation MUST NOT collapse the two into a single record: _who broke what and who fixed it_ is precisely the signal a trust economy needs, and it is what a record-discarding retry destroys.

## 6\. Field-level accountability (extends §5)

> **Status: proposed, not demonstrated (see §1 Maturity note).** §6–§8 specify a receiver-local adaptation loop that no reported implementation yet includes.

Beyond author grounding (§5), the receiver that was driven to failure by an admitted CMB SHOULD attribute the failure to the accountable **field(s)** of that CMB. This is what lets a failure act on the gate that admitted it, rather than only on the trust economy.

-   **Accountability** `a(x, r)`: the semantic match between an admitted field’s content `x` and the failure’s root cause `r`, where `r` is derived from the §4.1 evidence (failed check identifiers, captured `stdout`/`stderr`) and the corrective’s `focus`.
-   The attribution MUST be validated by **counterfactual ablation**: re-evaluate the completed claim with the attributed field withheld. If the failure does not recur, accountability is confirmed; otherwise the attribution is rejected. Counterfactual ablation, not a model’s self-reported root cause, is the normative guard — root-cause narration MAY confabulate.
-   A confirmed attribution is recorded as a field-accountability entry grounded against the **admitting receiver’s own policy** (distinct from the claimer/fixer author records of §5).

## 7\. Adaptation on failure (fulfils “coordination belongs to admission”)

> **Status: proposed, not demonstrated (see §1 Maturity note).**

A receiver holds two _distinct_ mutable objects: its **SVAF admission weights** (the gate, §9.2) and its **cognitive state** (a local CfC liquid net, §13, which never crosses the wire). Admitted signals already evolve the state; the gate is, per the paper-1 gate audit, a hand-set static constant. So a failure has two possible learning targets, and the receiver MUST choose between them per failure. This is the admission-side adaptation §4.2 names (“coordination belongs to admission”) but the base convention leaves undefined.

On a confirmed field accountability (§6), the receiver MUST route to **exactly one** adaptation, chosen receiver-locally, where the **competence-distance** `d(x, s)` is computed from the receiver’s own §13.2 cognitive-state outputs (`trajectory`, `patterns`, `anomaly`, `coherence`) — how far the accountable field sits from what this receiver can hold.

-   **(a) Admission adaptation (gate).** If `d` is large (the field is outside this receiver’s competence), the receiver MUST decrement its per-field SVAF weight for that `(source, field)` (§9.2). The gate lowers; future such fields are rejected. This _records the receiver’s boundary of responsibility_.
-   **(b) State adaptation (cognitive state).** If `d` is small (the field is within reach but the state was unprepared), the receiver SHOULD ingest the field into its local cognitive state via the §13.6 `ingestSignal` API to evolve `h`, and MUST NOT modify the SVAF weight. This grows capability with the gate left open.

The two channels MUST NOT both fire on one failure event: boundary-learning (gate) and capability-learning (state) are separated so that _“not mine”_ and _“mine, now handled”_ remain distinct outcomes. The routing threshold on `d` is receiver-local and MUST NOT be assigned by any coordinator — §9.2 receiver-autonomy is preserved throughout; no coordinator is introduced anywhere in this loop.

**Circularity.** `d(x, s)` judges competence using `s` while `s` is itself being updated; an implementation MUST specify the reference state (the pre-update `s`) used for routing.

## 8\. Validation, rollback, and exploration

> **Status: proposed, not demonstrated (see §1 Maturity note).**

-   Every adaptation is **provisional and outcome-audited**: it is confirmed only by a subsequent reduction in same-class failures, and reverted otherwise.
-   A state adaptation (§7b) that raises `anomaly` or lowers `coherence` beyond an operator-configured bound MUST be **rollback-able** (atomic). This makes state growth safe against catastrophic absorption.
-   A gate decrement (§7a) MUST retain an **exploration allowance**: a decremented `(source, field)` is re-admitted at a bounded rate, so permanent rejection cannot foreclose the evidence that would reverse it. Without this, a boundary can only ever tighten — the abstention trap.

## 9\. Depth rail

A corrective whose own checks fail MUST NOT spawn a further autonomous corrective. One level: a failed repair returns to human judgment. The bound comes from the grammar, not from a retry counter inside any agent.

**Exhaustion → boundary → open gap (proposed, §6–§8).** When the one-level limit is reached and a failure returns to human judgment, a receiver implementing §7 MUST also record a boundary decrement (§7a) for the accountable field: work the mesh could not hold leaves the receiver’s responsibility and, having no taker, surfaces as an open gap — an unclaimed corrective request. That open gap is the trigger condition for a new capability to be admitted at the mesh scale.

## 10\. Reference implementations

A reference deployment reports an experimental implementation as of 2026-07-13, in which a published failure event carrying captured `stderr` was taken by a _different_ agent than the one that failed, a failed corrective stopped at the depth rail, and claimer and fixer were grounded separately. **That report covers §4–§5 and §9 only. The Adaptation-on-Failure loop (§6–§8) is specified here but is not part of any reported implementation; it is registered and awaits the router-validation study (§11).** Independent interoperability has not yet been established. A plain-English companion: [Failure Is a First-Class Cognition Event](https://sym.bot/blog/failure-first-class-cognition).

## 11\. Promotion Criteria

Promotion of the **base convention (§4–§5, §9)** to **Published** status in the MMP §16 registry requires all of:

1.  **A second independent implementation** — a distinct codebase not derived from the reference deployment, maintained by a different implementer.
2.  **A cross-implementation conformance exchange** — a documented run in which a failure event published by one implementation is admitted and repaired by an agent of the other, demonstrating: evidence carriage with the truncation indicator (§4.1), lineage-borne parentage (§4), separate claimer/fixer grounding (§5), and the depth rail (§9).
3.  **Review** — maintainer and community review of this document against the exchange results.

The **Adaptation-on-Failure loop (§6–§8)** carries a distinct, earlier promotion gate, and it is empirical, not interoperability-based:

4.  **The router-validation study** — a register-first experiment showing that failure-driven routing lowers the exception rate while preserving coverage, with attribution confirmed by counterfactual ablation (§6) and a reference calibration of the `d` threshold (§7). Until this study passes, §6–§8 remain proposed and MUST NOT be reported as an implemented capability.

On promotion, the Status section is rewritten to **Published**, an Adopters list is added, and the §16.4 registry row is updated. No other sections change at promotion.



---

<!-- Extension: trust-horizon-v0.1.0 (Draft — Candidate Extension) -->

# MMP Extension: CMB Trust Horizon

**Knowledge-Scoped Trust-Weight Horizon**

Version

0.1.0

Status

Draft — Candidate Extension

Date

13 July 2026

Author

Hongwei Xu <[hongwei@sym.bot](mailto:hongwei@sym.bot)\>, SYM.BOT

Extends

[MMP v2.0](/spec/mmp) — application-layer convention over §6.3 (Canon tier), §6.4 (lifecycle), and §6.7 (grounding); no changes to the wire format

Canonical URL

[https://meshcognition.org/spec/mmp/extensions/trust-horizon](https://meshcognition.org/spec/mmp/extensions/trust-horizon)

Licence

CC BY 4.0 (specification text)

* * *

## 1\. Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the MMP wire format and does not require an MMP version bump. Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §7 (Promotion Criteria). Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

## 2\. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals. Conformance is claimed by a **receiver**: a node that advertises support for this extension and applies §5’s invariants to grants it has authenticated and admitted.

## 3\. Abstract

How long should validated knowledge influence a mesh’s choices? Any single global answer is wrong in both directions, because knowledge in different domains ages at different rates — and the **same agent** may produce knowledge in several domains. Influence lifetime is therefore a property of the **knowledge**, not of the agent.

This extension specifies **verdict-time trust-horizon grants**: when a validator authors a validation CMB (§6.4), it MAY include an opaque, policy-governed statement of how that knowledge’s _weight_ should persist. The grant travels inside ordinary CAT7 text — covered by the existing CMB content address and signature — and each receiver interprets it under its own operator policy. Decay of weight is never decay of memory: Canon-tier retention (§6.3) is untouched.

## 4\. The grant

### 4.1 Carriage — inside existing, content-bound CMB text

A validator granting a trust horizon MUST encode it as a versioned clause inside the validation CMB’s ordinary CAT7 text (RECOMMENDED: a `trust-horizon/1: <opaque policy token>` clause in `categories.commitment.text`). Because CAT7 text is part of the CMB’s §8.2.1 content address, the grant is bound by the existing CMB key and assertion signature — **no new frame type, handshake field, CMB schema field, key construction, or signing construction is introduced**. A receiver that does not support this extension processes the validation CMB as an ordinary MMP v2.0 CMB.

The `<opaque policy token>` identifies a horizon under the **operator’s policy**; its interpretation (durations, curves, parameters) is private to each deployment and out of scope for this document. The clause SHOULD also carry the operator policy version it was granted under, so later policy changes remain auditable without rewriting history.

### 4.2 Non-negotiable rails

-   **The claimer never grants.** A horizon clause is meaningful only in a CMB authored by a validator the receiver recognises for the target (per the receiver’s own §6.4 authority resolution) or in a signed operator-policy record. Horizon clauses authored by the claimer of the work MUST be ignored.
-   **Grants are policy-governed.** A receiver MUST interpret grant tokens only through its operator’s policy; tokens outside that policy have no effect.
-   **Grants are append-only.** A correction, revocation, or supersession is a **new** validator-authored CMB referencing the earlier one through ordinary lineage; recorded grants are never rewritten. This keeps supersession itself on the record — essential in domains where _that something was superseded_ is part of the knowledge.

### 4.3 Receiver autonomy

Validation and grounding remain ordinary, receiver-relative CMBs. A receiver claiming conformance independently authenticates, admits (§9.2), and interprets a grant under local policy; a grounding CMB (§6.7) MAY reference the granting validation through ordinary lineage, but nothing is automatically copied between them, and receipt of a grant never advances any lifecycle by itself.

## 5\. Consumption invariants

A receiver claiming conformance MUST uphold, for any use of grants in deriving influence (authority, ranking, recall weight):

1.  **No minting.** A horizon MUST NOT create initial influence, improve initial rank, or change any CMB’s lifecycle. It governs only how already-earned, grounded influence persists.
2.  **Symmetric semantics.** Positive and negative grounded outcomes referencing the same knowledge MUST receive the same horizon semantics — long-lived merit implies long-lived accountability.
3.  **No implicit cross-domain transfer.** Influence derived within one operator-created domain scope MUST NOT be presented in another except through the receiving operator’s explicit policy.
4.  **Consistent treatment.** Where grounded influence affects more than one consumption path (e.g. both authority derivation and recall ranking), the same attested grant MUST NOT be given conflicting interpretations across those paths.
5.  **Retention separation.** This extension MUST NOT itself delete, expire, archive, or demote a CMB; §6.3 retention remains governed only by lifecycle.

How influence is aggregated — curves, parameters, budgets, caps, defaults, and cross-domain policy shapes — is implementation-defined and deliberately out of scope: the invariants above are the entire conformance surface.

## 6\. Reference implementations

A reference deployment reports an experimental implementation of this convention as of 2026-07-13; independent interoperability has not yet been established.

## 7\. Promotion Criteria

Promotion to **Published** status in the MMP §16 registry requires all of:

1.  **A second independent implementation** — a distinct codebase not derived from the reference deployment, maintained by a different implementer.
2.  **A cross-implementation conformance exchange** — a documented run in which a grant authored by one implementation is authenticated, admitted, and interpreted by the other, and each §5 invariant is demonstrated by an observable test (e.g. a grant demonstrably failing to mint initial influence; a claimer-authored clause demonstrably ignored).
3.  **Review** — maintainer and community review of this document against the exchange results.

On promotion, the Status section is rewritten to **Published**, an Adopters list is added, and the §16.4 registry row is updated. No other sections change at promotion.



---

<!-- Extension: sym-attest-v1 (Draft — Candidate Extension) -->

# MMP Extension: Admission Attestations

**Signed admission evidence, chained per attester, checkpointed and witnessed**

Version

1.0.0

Status

Draft — Candidate Extension

Date

8 October 2026 (revised; first draft 2 October 2026)

Author

SYM.BOT

Negotiation token

`sym-attest-v1`

Extends

[MMP v2.0](/spec/mmp) — §9.2.1 (per-category verdicts), §16 (extension negotiation), §17.2 (admission attestations)

Canonical URL

[https://meshcognition.org/spec/mmp/extensions/sym-attest](https://meshcognition.org/spec/mmp/extensions/sym-attest)

Licence

CC BY 4.0 (specification text)

* * *

## 1\. Status

This document is a **Draft Candidate Extension**. It defines four extension frames negotiated through MMP §16. It changes no core frame, record or construction.

The SYM reference runtime already sends frames with this purpose, under the bare type names `attestation`, `checkpoint`, `witness` and `node-stats`. It sends them without negotiation and signs them with a construction that this document corrects. §9 lists the differences. This document defines the registered form, which an implementation sends only under the negotiated token. Promotion to Published follows §10.

## 2\. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

A node claims conformance by offering `sym-attest-v1` in its handshake and following §4–§8 with every peer that selects it. `lp(x)`, `decimal(x)` and NFC are as defined in MMP §8.8.4. Every signature here is an Ed25519 signature by an identity key, verified by the one rule of MMP §18.3.2. The frames’ shapes are published as [sym-attest-frame.schema.json](/spec/mmp/schema/sym-attest-frame.schema.json): every object is closed, and a frame that fails it is discarded whole. The draft vector [sym-attest-v1.json](/spec/mmp/conformance/v2/sym-attest-v1.json) pins the four signed constructions, a chain of three checkpoints with 1-, 2- and 3-leaf segments, a witness, three conflicting pairs, two pairs that are not conflicts, and the link checks.

## 3\. Abstract

MMP §17.2 requires a cognitive node’s admission attestations to “expose the observable decision and per-category evidence”, and §9.2.1 fixes the per-category verdict vocabulary. MMP defines no wire form for them. This extension defines one:

-   an **attestation**: one signed statement per record a node gated through SVAF, chained to the node’s previous attestation;
-   a **checkpoint**: a signed commitment to a prefix of an attester’s chain;
-   a **witness**: a peer’s signature over a checkpoint it holds, so an attester that signs two different histories can be caught;
-   **node statistics**: an unsigned, informational summary.

An attestation proves who evaluated which record, in which room, with what result. It never proves that the evaluation was honest. That is the same limit MMP §15.8 states for tether attestations.

## 4\. Negotiation and carriage

-   The extension is active between two peers only when both offer `sym-attest-v1` and the server selects it (MMP §16.3). A node MUST NOT send the frames below to a peer for which it is not active. A receiver MUST ignore them from such a peer.
-   The frames travel only on a CONNECTED Core Secure session (MMP §5.3), and only as the inner frame of a `control-encrypted` envelope (MMP §7.1, §18.2.1).
-   **Attestations, checkpoints and witnesses are author-signed.** Their origin is the signature of the node they name, verified against the key the receiver binds to that nodeId (MMP §3.4). It never comes from the session that delivered them. The weight they carry is that node’s authority, resolved as §6 says. They MAY be relayed to other peers for which the extension is active (§6).
-   **Node statistics are session-bound.** They describe the session’s proven peer and no one else.

Frame types follow MMP §16.2 (`<extension>-<name>`), using the extension name `sym-attest`.

## 5\. Frames

### 5.1 `sym-attest-attestation`

```
{
  "type": "sym-attest-attestation",
  "attestation": {
    "of": "cmb-<64 lowercase hex>",
    "assertionId": "asrt-<64 lowercase hex>",
    "by": "<attester nodeId>",
    "at": 1786611600000,
    "room": "<room>",
    "method": "<evaluation method token>",
    "verdict": "aligned",
    "categories": {
      "focus": "admit", "issue": "admit", "intent": "guard", "motivation": "admit",
      "commitment": "silent", "perspective": "admit", "mood": "admit"
    },
    "role": "participant",
    "seq": 42,
    "prev": "<64 lowercase hex>",
    "sigAlg": "ed25519",
    "sig": "<unpadded base64url Ed25519 signature>"
  }
}
```

-   `of` and `assertionId` identify the evaluated record: its cognition key and its assertion identity (MMP §8.8.2).
-   `by` is the attester, a nodeId in its lowercase form (MMP §3.1.1). `at` is the attester’s clock in milliseconds, information only: it is unwitnessed and confers nothing (MMP §6.6.10).
-   `room` is the attester’s authenticated room. A receiver in another room MUST discard the attestation.
-   `method` names the evaluation method (for example `neural` or `heuristic`), as a token matching `^[a-z0-9][a-z0-9_-]{0,31}$`. It is signed.
-   `verdict` is the whole-record decision: `aligned`, `guarded`, `redundant` or `rejected` (MMP §9.2).
-   `categories` MUST carry exactly the seven CAT7 categories, and nothing else. Each value is one of `admit`, `guard`, `redundant`, `reject` and `silent`, exactly as MMP §9.2.1 defines them.
-   `role` is the role the attester claimed when it evaluated, as a token matching `^[a-z0-9][a-z0-9_-]{0,63}$` (long enough for any MMP §6.6.2 role). It is a hint: a receiver resolves the attester’s authority itself (§6).
-   `seq` counts the attester’s attestations from 1, by one each time. `prev` is `genesis` for `seq` 1. Otherwise it is the lowercase hex SHA-256 of the previous attestation’s signature bytes, so the attestations form one chain per attester.

**Signature.** `sig` is the attester’s Ed25519 identity-key signature over:

```
UTF8("mmp-attest-v1\n") ||
lp(of) || lp(assertionId) || lp(by) || lp(decimal(at)) || lp(NFC(room)) ||
lp(method) || lp(verdict) ||
lp(categories.focus) || lp(categories.issue) || lp(categories.intent) ||
lp(categories.motivation) || lp(categories.commitment) ||
lp(categories.perspective) || lp(categories.mood) ||
lp(role) || lp(decimal(seq)) || lp(prev)
```

**Emission.** A node SHOULD emit one attestation for each record it gates through SVAF, whether it admits or refuses it, at gating time. It MUST NOT sign two attestations with the same `seq`. It MUST persist its chain head, so that a restart continues the chain rather than forking it.

-   **Core Secure records only.** A node MUST NOT sign or send an attestation about a record it did not verify under Core Secure (MMP §8.8.5), such as a record held under a Legacy Import profile: that record has no verified assertion identity to name.
-   **Never about a directed record.** An attestation discloses the attested record’s cognition key, assertion identity and verdict to every peer that receives it, which would make it a confirmation oracle on a one-to-one record. A node MUST NOT send or relay an attestation about a record whose signed `metadata.to` is not null. It MAY keep such attestations for its own operator.

### 5.2 `sym-attest-checkpoint`

```
{
  "type": "sym-attest-checkpoint",
  "checkpoint": {
    "by": "<attester nodeId>", "room": "<room>", "fromSeq": 41, "uptoSeq": 48,
    "prev": "<the previous checkpoint's root>", "root": "<64 lowercase hex>",
    "at": 1786611600000, "sigAlg": "ed25519", "sig": "<unpadded base64url>"
  }
}
```

**Chained, never over a suffix.** Each checkpoint covers the attester’s attestations since its previous checkpoint, `seq` `fromSeq` to `uptoSeq` in order, and is chained to the previous checkpoint’s root. So it commits to the whole history from `seq` 1, while the attester needs to hold only the attestations since its last checkpoint. `fromSeq` is 1 and `prev` is `genesis` for an attester’s first checkpoint. Otherwise `fromSeq` is the previous checkpoint’s `uptoSeq` plus 1, and `prev` is its `root`. `uptoSeq` is at least `fromSeq`. An attester MUST NOT sign a root over anything other than this: a root over the attestations it happens to still hold, after it has dropped older ones, is not a checkpoint.

```
leaf(i)     = SHA-256(UTF8("mmp-attest-leaf-v1\n") || signatureBytes(attestation i))
node(l, r)  = SHA-256(UTF8("mmp-attest-node-v1\n") || l || r)

level 0     = leaf(fromSeq), leaf(fromSeq + 1), ..., leaf(uptoSeq)
level n + 1 = node(level n [0], level n [1]), node(level n [2], level n [3]), ...;
              a last node with no partner is carried up unchanged, never paired with itself
segment     = the single node left (leaf(fromSeq) itself when fromSeq = uptoSeq)

root        = lowercaseHex(SHA-256(UTF8("mmp-attest-chain-v1\n") ||
                                   lp(prev) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) ||
                                   lp(lowercaseHex(segment))))
```

`signatureBytes` is the 64 bytes the attestation’s `sig` encodes. This is the promote-odd pairing of MMP §8.2.1, with its own domain tags. A checkpoint is self-verifying given its segment and its signed `prev`. Proving that an old attestation is inside the latest root therefore walks back through every checkpoint since, which costs one segment per checkpoint rather than a logarithmic path; that is the price of the attester holding only its last segment. `sig` is the attester’s signature over:

```
UTF8("mmp-attest-checkpoint-v1\n") ||
lp(by) || lp(NFC(room)) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) ||
lp(prev) || lp(root) || lp(decimal(at))
```

**Emission.** An attester SHOULD checkpoint every 8 attestations, and MAY checkpoint at other times. It MUST persist each attestation since its last checkpoint, with that checkpoint’s `uptoSeq` and `root`, before it sends any of them. An attester that has lost them MUST NOT sign a checkpoint over fewer: its checkpoint chain ends there, visibly, and it signs no further checkpoint: a new chain from `fromSeq` 1 would overlap the old one, and is itself equivocation (§5.2).

**Link checks.** A receiver refuses a checkpoint whose `uptoSeq` is below its `fromSeq`. A receiver that holds the checkpoint whose `root` is a new checkpoint’s `prev` MUST check that the new `fromSeq` is that checkpoint’s `uptoSeq` plus 1, and discard the new one otherwise, as malformed rather than as evidence. (The schema already requires `prev` to be `genesis` exactly when `fromSeq` is 1.)

**Equivocation.** Two valid checkpoints from one attester that are not the same checkpoint (the same `fromSeq`, `uptoSeq`, `prev` and `root`) prove that it signed two histories when their ranges `fromSeq`..`uptoSeq` overlap (they share a seq: `a.fromSeq ≤ b.uptoSeq` and `b.fromSeq ≤ a.uptoSeq`), or when they name the same `prev`. One chain never does either: its ranges are consecutive and each `prev` has one successor. The rule catches a fork whatever boundaries the attester cuts each history at. A receiver keeps the copy it held first as that position’s checkpoint and the other as evidence. From then on it MUST NOT witness any checkpoint of that attester, and MAY drop that attester’s further checkpoints unverified, which also bounds the evidence it keeps. It SHOULD report the conflict to its operator. It relays the conflicting copy once, as evidence, to the peers it relays checkpoints to, so that the conflict spreads as the first copy did. A witness it signed before it knew of the conflict stands: a witness states only what its signer held.

### 5.3 `sym-attest-witness`

```
{
  "type": "sym-attest-witness",
  "witness": {
    "attester": "<attester nodeId>", "room": "<room>", "fromSeq": 41, "uptoSeq": 48,
    "root": "<64 lowercase hex>", "by": "<witness nodeId>", "role": "participant",
    "at": 1786611600000, "sigAlg": "ed25519", "sig": "<unpadded base64url>"
  }
}
```

`sig` is the witness’s signature over:

```
UTF8("mmp-attest-witness-v1\n") ||
lp(attester) || lp(NFC(room)) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) || lp(root) ||
lp(by) || lp(role) || lp(decimal(at))
```

`by` is the witness and `attester` the checkpoint’s signer, each a nodeId in its lowercase form (MMP §3.1.1). `fromSeq`, `uptoSeq` and `root` are the witnessed checkpoint’s. `role` follows the attestation’s `role` grammar.

**Emission.** A node that stores a verified checkpoint from another attester SHOULD witness it, once per (`attester`, `uptoSeq`), including across restarts. It MUST NOT witness its own checkpoint, or a checkpoint it knows to be in conflict. A witness states only that its signer held this root for this range; because the root is chained, it vouches for the attester’s history up to `uptoSeq`. Because a witness carries the range, two witnesses, or a witness and a checkpoint, for one attester whose ranges overlap without being the same range and root show that either the attester signed two histories or a witness signed a range the attester never did. They are a lead, not proof. Only two attester-signed checkpoints that conflict under §5.2 are equivocation evidence and have §5.2’s consequences. A receiver that holds the attester-signed checkpoint for a witness’s range, and finds a different `root`, holds evidence against that witness, and MAY mute it.

### 5.4 `sym-attest-node-stats`

```
{ "type": "sym-attest-node-stats",
  "stats": { "emitted": 120, "admitted": 37, "memory": 157, "at": 1786611600000 } }
```

`emitted` is the number of records this node authored that it holds. `admitted` is the number of peer records it holds. `memory` is the total. The frame is unsigned and self-reported. A receiver MUST attribute it to the session’s proven peer, MUST NOT store it as evidence, and MUST NOT use it for admission, authority, trust or ranking. A node SHOULD NOT send it more often than every 15 seconds.

## 6\. Receiving and relaying

A receiver processes an attestation, checkpoint or witness in this order. It MUST discard the frame at the first step that fails:

1.  Validate the frame against the schema (§2): closed objects, every token’s grammar and vocabulary, lowercase nodeIds, exactly seven category verdicts, and a checkpoint’s `uptoSeq` is not below its `fromSeq`.
2.  Check that the room equals the receiver’s own authenticated room.
3.  Check that the signature is canonical unpadded base64url of 64 bytes.
4.  Drop a duplicate. Duplicates are judged by what a frame asserts, not by its bytes: an attestation is a duplicate when its signature is already held; a checkpoint when one is held for the same (`by`, `fromSeq`, `uptoSeq`) with the same `prev` and `root`; a witness when one is held for the same (`attester`, `fromSeq`, `uptoSeq`, `by`) with the same `root`. A later copy of a held statement (a witness signed again after a restart, for example) is a duplicate, never a new statement to store and relay.
5.  Apply the §5.2 link check against a held checkpoint whose `root` is the new checkpoint’s `prev`: a checkpoint that does not start right after it is discarded as malformed, not kept as evidence.
6.  Resolve the signer’s key through the receiver’s binding for that nodeId (MMP §3.4). If there is no binding, discard. A key carried by the delivering session never stands in for one.
7.  Spend the **session gossip budget** of the session that delivered the frame: RECOMMENDED, a token bucket per session. A frame the budget cannot pay for is discarded unverified. The budget is spent _before_ verification, so that it bounds how much signature verification any one peer can make the receiver do. It is charged to the delivering session, which the session proves, never to the attester the frame names. Before verification a receiver MAY also discard, unverified, a checkpoint or witness for a position older than every position it holds from that attester, a frame from a peer it has muted for relaying invalid frames, a witness for a checkpoint it does not hold, and any further checkpoint from an attester it holds equivocation evidence against (two conflicting checkpoints that attester signed, §5.2). It MUST NOT discard as stale a conflicting copy of a position it holds: that copy is the evidence.
8.  Verify the signature (MMP §18.3.2).
9.  Apply the limits that need an authenticated signer, only _after_ verification: RECOMMENDED, at most 30 attestations per (`of`, `by`) per 60 s, for checkpoints at most 4 a second per attester, and a **global ceiling** on what the receiver stores and relays across all sessions. `by` is unauthenticated until the signature verifies, so a limit spent earlier would let forgeries naming an honest attester use up that attester’s allowance; and a global budget spent before verification would let one peer’s forgeries starve every other peer.
10.  Store it, then relay it once to the other peers for which the extension is active, subject to §5.1 (never an attestation about a directed record the receiver holds). Never relay it back to the peer it came from.

An attestation MUST NOT change the receiver’s own admission decision for the record it describes, nor any lifecycle or authority. Receiver autonomy is unconditional (MMP §9.2). An attestation is evidence about its attester. A receiver that weighs it at all finds the attested record by `assertionId`, not by cognition key, and weighs the attestation by the attester’s authority as MMP §6.6.9 and §6.6.10 resolve it:

-   the attester’s role counts only when the key that verifies the attestation’s signature is the subject key of an in-force grant for `by` (§6.6.9);
-   it is resolved against the receiver’s in-force set at the moment the weight is applied, not when the attestation was signed (§6.6.10);
-   a scoped grant counts only for an attested record inside its scope, judged from that record’s own signed fields, never from anything the attestation says (§6.6.2);
-   an issuer, and any role that confers nothing on admission, counts as a participant.

A tally of attestations is not Sybil-resistant: a participant counts once, and identities cost nothing to mint. A count means no more than the authority behind each attestation in it.

## 7\. Relationship to the core

-   **MMP §17.2.** This is the registered wire form of the admission attestations that §17.2 requires a cognitive node to expose. A node also exposes them to its own operator. It exposes them to peers only through this extension, because a node MUST NOT require a peer to support any extension (MMP §16.1).
-   **MMP §9.2.1** fixes the per-category vocabulary used here.
-   **Placeholder tokens.** The MMP handshake vector offers the strings `receipts-v1`, `admission-attestation-v1` and `checkpoints-v1`. They are example offers that exercise negotiation. They are not registered, and this document does not define them.

## 8\. Security considerations

-   **Disclosure.** Attestations reveal which records a node evaluated and what it decided, to every peer with the extension active. `of` is a content address, which an outsider can use as a confirmation oracle (MMP §5.9). That is why no attestation about a directed record ever leaves its attester (§5.1). A node SHOULD offer the extension only in rooms where the remaining disclosure is acceptable. A gateway MUST NOT relay interior attestations across its boundary.
-   **Equivocation.** The chain (`prev`), checkpoints and witnesses together make a forked history detectable. They do not make it impossible.
-   **Domain separation.** The four signed constructions carry the domain tags `mmp-attest-v1`, `mmp-attest-checkpoint-v1`, `mmp-attest-witness-v1` and, inside the root, the leaf, node and chain tags. They therefore cannot be confused with each other, with the record signature (MMP §8.8.4), with the handshake proof (MMP §5.2.1), or with any other signature made with the same identity key.
-   **Time.** `at` is attester-asserted and confers nothing. Ordering decisions use receiver-local receipt time, as MMP §6.7 does for outcomes.

## 9\. Differences from the deployed runtime (informative)

The SYM 0.13 runtime differs from this document in eight ways:

-   It uses bare frame types (`attestation`, `checkpoint`, `witness`, `node-stats`) and no negotiation.
-   Its attestation signature is over a `|`\-joined string with no domain tag, and `method` is not signed. Its checkpoint and witness payloads use the literal prefixes `checkpoint|` and `witness|`.
-   It names the room field `roster` and the position field `upto_seq`.
-   It carries no `assertionId`.
-   Its checkpoint Merkle tree pairs an unpaired node with itself. MMP §8.2.1 rejects that construction for the cognition address, because it lets two different leaf lists share a root.
-   Its node statistics carry a self-asserted `name` and `nodeId`.
-   It resolves keys from a roster that can be fed by unproven hellos.
-   It relays these frames to every peer, whether or not that peer can use them.

This revision also changes what sym 0.14.0 sends under `sym-attest-v1`: checkpoints are chained (§5.2) where sym 0.14.0 commits to the attestations it still holds, and witnesses carry and sign `fromSeq`; `by` and `attester` are lowercase nodeIds where sym accepts any printable string; `role` may be 64 characters where sym accepts 32; and no attestation is sent about a directed record or a Legacy Import record, where sym 0.14.0 sends both.

The bare-name frames are legacy. A Core Secure session never selects, sends or accepts them. An implementation sends them only under an explicitly selected Legacy Import profile (MMP §17.3), and sends the registered frames only under `sym-attest-v1`.

## 10\. Promotion criteria

The extension is promoted to Published when two conditions hold:

-   a second, independent implementation interoperates with the first on all four frames;
-   a public vector pins the four signed constructions and the checkpoint root, including an odd-length chain and an equivocating pair. The draft vector [sym-attest-v1.json](/spec/mmp/conformance/v2/sym-attest-v1.json) already does; promotion needs it to pass against a second implementation.

## 11\. Change log

-   **1.0.0 (2 October 2026, draft):** first registered form. The receiving order spends the delivering session’s gossip budget before verification and the per-attester limit after it, as sym 0.14.0 does.
-   **1.0.0 (8 October 2026, revised draft, folded into MMP 2.0 update 1):** checkpoints chained to the previous root, with `fromSeq` and `prev`, never over a suffix; equivocation is overlapping ranges or a shared `prev`, with link checks, no further witnessing after a conflict, and a visible end to a chain whose segment was lost; witnesses carry and sign `fromSeq`; a public vector, `sym-attest-v1.json`; duplicates judged by content; on equivocation the conflicting copy is relayed once as evidence, and an earlier witness stands; only the session budget is spent before verification, the global ceiling after, and three more pre-verification drops are allowed; token grammars for `role` and `method`, lowercase nodeIds, a closed schema with exactly seven category verdicts; no attestations about Legacy Import or directed records; weights by MMP §6.6.9 and §6.6.10, matched by `assertionId`; frames sealed in `control-encrypted`; the §18.3.2 verification rule; tallies are not Sybil-resistant.



---

© 2026 SYM.BOT. Specification text licensed under CC BY 4.0. Reference implementations licensed under Apache 2.0.
