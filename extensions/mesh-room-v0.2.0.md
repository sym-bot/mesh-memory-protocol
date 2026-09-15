---
title: 'MMP Extension: Mesh Room — Mesh Memory Protocol'
description: 'Generic transient subgroup primitive for the Mesh Memory Protocol — application-layer convention formalising MMP §5.8 mesh rooms.'
---

# MMP Extension: Mesh Room

**Generic Transient Subgroup Primitive for the Mesh Memory Protocol**

| | |
|---|---|
| Version | 0.2.0 |
| Status | Draft — Candidate Extension |
| Date | 15 April 2026 |
| Author | Hongwei Xu &lt;hongwei@sym.bot&gt;, SYM.BOT |
| Extends | [MMP v2.0](/spec/mmp) — formalises §5.8 (Mesh Rooms) without changes to the core wire format |
| Canonical URL | https://meshcognition.org/spec/mmp/extensions/mesh-room |
| Licence | CC BY 4.0 (specification text) |

---

> **Renamed in 0.2.0 (15 September 2026).** The core protocol calls this concept a
> **room**: §5.8 is *Mesh Rooms*, the handshake field is `room`, and the published handshake schema has
> no `group` field. This extension was written before that rename and kept the old word throughout,
> which left the specification saying two things. Everything here now says room, including the
> identifiers: `groupId` → `roomId`, `group_id` → `room_id`, `group_label` → `room_label`, `group_token` → `room_token`, Bonjour `_mmp-mesh-group._tcp` → `_mmp-mesh-room._tcp`. The previous identifier `mesh-group-v0.1.0` is superseded by `mesh-room-v0.2.0` and is not an alias —
> nothing implemented the old names (no engine, SDK or app references them), so there is no
> compatibility to preserve, and a silent alias would hide the rename from the next reader.

## Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the core MMP wire format and does not require an MMP version bump.

Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §10. Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension.

This status discipline preserves the SYMBit whitepaper §4.1 commitment: SYMBit does not require changes to the MMP protocol specification. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

---

## Abstract

This extension defines a generic application-layer convention for a **mesh room** — a small set of MMP nodes that have explicitly joined a shared, named room within the broader mesh — and the canonical CMB conventions members use to broadcast state to the room.

The convention does not change the core MMP wire format. CMBs remain schema-valid, signed MMP v2.0 records. This convention specifies how members agree on room identity, discover each other, bind room context inside authenticated application bytes, and bound room lifetime.

The convention is the protocol primitive that real-world co-located room experiences are built on. The first use case (§9) is MeloTune's "Mood Room" feature; the convention is intentionally generic so that other applications — room meditation, collaborative work sessions, multiplayer co-located experiences — can adopt it and interoperate at the protocol layer.

---

## Introduction

MMP v2.0 §5.8 (Mesh Rooms) names mesh rooms as a structural concept but does not specify how a room is identified, discovered, or membership-managed. Implementers have adopted ad-hoc conventions, which has prevented cross-application interoperability.

This extension formalises the conventions that §5.8 leaves underspecified:

- A canonical `roomId` committed inside `metadata.application` bytes.
- A Bonjour service type for LAN discovery and a relay channel pattern for WAN.
- A focus-prefix convention so multiple applications can share room infrastructure without colliding on state semantics.
- A receiver-side filtering rule for room-scoped CMBs.
- A membership lifecycle (join, heartbeat, leave, expire) covered by short, optional CMBs.

Nothing in this extension changes the MMP v2.0 core wire format. The application payload is covered by the record assertion through §8.8&rsquo;s application commitment, so a relay or peer cannot substitute room context without invalidating the signature.

---

## 1. Motivation

### 1.1 The §5.8 Gap

MMP v2.0 §5.8 introduces "mesh rooms" but treats them as an opaque concept. Two implementers reading §5.8 cannot independently produce code that joins each other's rooms. The §5.8 text describes the semantic intent without specifying:

- The wire format of the room identifier.
- The discovery mechanism for finding co-members.
- The CMB tagging that lets receivers filter room-scoped traffic.
- The lifecycle events that mark joins, leaves, and expiration.

This extension fills the gap by formalising the conventions that §5.8 leaves to implementers.

### 1.2 Real-World Co-located Room Use Cases

Room experiences happen at human scale: a small number of people, briefly co-located, sharing some state. MeloTune's Mood Room is one example: 2–6 listeners in the same physical space, each running MeloTune on their own device, each broadcasting their music-agent state into the shared room.

Other use cases follow the same pattern: a room meditation app where N practitioners share breathing-cycle state; a collaborative work app where N team members share focus-context; a multiplayer co-located experience where N participants share game-state. All of these need the same protocol primitive: a transient, named, peer-discovered subgroup of the broader mesh.

The mesh-room convention is intentionally generic so that an application implementing it for one use case interoperates at the protocol level with another application using it for an unrelated purpose. Each application defines its own state semantics (per §5.4 focus-prefix); the room-membership and CMB-routing primitives are shared.

---

## 2. Mesh Room Model

A mesh room is an explicit, transient grouping of MMP nodes. Membership is voluntary on both sides: a node joins by advertising its membership; the room exists from the moment its first member joins until either the last member leaves or an optional `expires_at` timestamp passes.

The mesh room is **not** a long-lived addressable entity. It does not have a persistent state on any node beyond the transient list of currently-known members. A room that has zero members for more than a brief grace period is effectively terminated.

| Term | Definition |
|---|---|
| mesh room | A named, transient subgroup of the broader MMP mesh whose members have explicitly joined and are mutually discoverable. |
| `roomId` | Stable UUID identifier for a mesh room, carried in authenticated `metadata.application` bytes. |
| room token | OPTIONAL bearer token shared out-of-band among joiners; REQUIRED for WAN relay-mediated rooms, OPTIONAL for Bonjour-LAN rooms. |
| member | An MMP node with a joined session in the room. Identified by its standard MMP identity (Ed25519 public key per MMP §3.2). |
| room-scoped CMB | A CMB whose decoded, digest-verified application object names this extension and the room&rsquo;s `roomId`. |
| lifetime | A room exists from the moment its first member joins until either the last member leaves OR the optional `expires_at` timestamp passes. |

This document uses [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) keywords (MUST, SHOULD, MAY) as written in capital letters.

---

## 3. Room Identity

A mesh room MUST have:

- A `room_id` (string, UUIDv4 RECOMMENDED).

A mesh room MAY have:

- A `room_label` (human-readable string, ≤64 UTF-8 bytes).
- An `expires_at` (RFC 3339 timestamp).
- A `room_token` (opaque bearer string).

The `room_token` is REQUIRED for WAN relay-mediated discovery (§4.2) and is OPTIONAL for Bonjour-LAN-mediated discovery (§4.1).

The convention does not specify how `room_id`, `room_label`, `expires_at`, or `room_token` are agreed among members. Implementations typically distribute these out-of-band: one node generates them, and other nodes receive them via QR code, NFC tap, push notification, share-sheet link, or any other application-layer channel.

---

## 4. Discovery

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

1. Opening a WebSocket connection to the relay endpoint.
2. Presenting `room_token` as a bearer credential in the connection handshake (`Authorization: Bearer <room_token>` header).
3. Subscribing to the per-room channel named by `room_id`.

The relay enforces token-based authorisation and forwards opaque peer frames only among members holding a valid token for that `room_id`. Endpoints, not the relay, decrypt and verify that the signed application bytes name the same room.

Members SHOULD reconnect on disconnection with exponential backoff (default: 1 second initial, 60 seconds maximum).

The relay protocol's wire format is anchored in MMP v2.0 §4 transport conventions; a normative public-spec reference will be added at promotion time per §10.

---

## 5. CMB Tagging Conventions

### 5.1 Room-Scoped CMBs

A member's CMB is "room-scoped" when its decoded `metadata.application` bytes are JSON containing
`{"extension":"mesh-room-v0.2.0","roomId":"<UUID>"}` and the application byte length, digest and
data verify under §8.7–§8.8. The room object MAY add `event`, `roomLabel` and application-owned state.

Members MAY emit:

- **Room-scoped CMBs** — authenticated application bytes name this extension and a `roomId`.
- **Un-scoped CMBs** — application bytes do not name this extension, and ordinary MMP routing applies.

A member MAY filter inbound CMBs by the verified application `roomId`. It MUST verify the application digest and record signature before acting on that value. Receivers are not required to support this candidate convention.

### 5.2 Application Focus-Prefix Convention

For inter-application interoperability, room members MAY use a `categories.focus.text` prefix to indicate the kind of room state being broadcast. The prefix format is `<app>:<state-type>`. Examples:

- MeloTune Mood Room: `categories.focus.text: "melotune-room:state"`, `"melotune-room:peer"`
- (hypothetical) Room meditation: `categories.focus.text: "meditation:phase"`
- (hypothetical) Collaborative work: `categories.focus.text: "cowork:status"`

This is a RECOMMENDED convention, not a requirement. Applications MAY use any focus content. Inter-application namespace registration is deferred to a future version of this extension (§11).

---

## 6. Membership Lifecycle

| Event | Behaviour |
|---|---|
| Join | Member begins advertising via Bonjour AND/OR registering with relay. Member SHOULD emit one room-scoped CMB with `categories.focus.text: "mesh-room:join"`, application `event: "join"`, and neutral mood. |
| Heartbeat | Member SHOULD re-advertise Bonjour at default mDNS cadence. No required heartbeat CMB; absence-of-CMB is detected at the application layer per receiver policy. |
| Leave | Member ceases Bonjour advertisement and unregisters from relay. Member SHOULD emit one room-scoped CMB with `categories.focus.text: "mesh-room:leave"`, application `event: "leave"`, and neutral mood. |
| Expire | At `expires_at` if set, members SHOULD treat the room as terminated and stop emitting room-scoped CMBs. Receivers SHOULD discard room-scoped CMBs received after `expires_at`. |

The recommended `mesh-room:join` and `mesh-room:leave` CMBs are convention-level; applications MAY detect membership changes via Bonjour churn alone.

---

## 7. Receiver Behaviour

A node receiving a room-scoped CMB SHOULD verify:

1. The sender's identity is currently a known member of the room (via the Bonjour browse list AND/OR relay registration).
2. The CMB is received before `expires_at` (if set).

A node MAY accept room-scoped CMBs from unknown senders if the application context warrants it (for example, a listener entering a Mood Room mid-session may not yet have observed the original joiner's announcement).

---

## 8. Failure Modes

| Failure | RECOMMENDED Behaviour |
|---|---|
| `expires_at` passes during active broadcasts | Members SHOULD stop emitting room-scoped CMBs at the timestamp; receivers compare it with their own authenticated-session receive clock, never an author-asserted timestamp. Active media playback or application sessions are not terminated by this specification — applications decide their own response. |
| `room_token` rejected by relay mid-session | Member SHOULD treat as a room-leave event and surface the failure to the application layer. Reconnection policy is application-defined. |
| Bonjour advertisement fails (mDNS error, sandbox rejection) | Member MAY fall back to relay-only registration if `room_token` is available. If neither path works, the member is effectively isolated; the failure SHOULD be surfaced to the application layer rather than silently absorbed. |
| Two members generate the same `room_id` independently | UUIDv4 collision probability is negligible; if observed, the second-joining member SHOULD detect via Bonjour (existing TXT record with the same `room_id` from a different `member_identity`) and refuse to join. |
| Room has zero members for more than 60 seconds | Room is effectively terminated. Receivers MAY ignore subsequent late-arriving CMBs from a member that had not yet observed the empty state. |

The interop test specification for the §10 promotion criterion ("two implementations interoperate") is **deferred to post-v0.1.0** and will be specified jointly with the second implementer when adoption occurs. The test suite will minimally cover Bonjour discovery of cross-implementation peers, room-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-room:join` / `mesh-room:leave` lifecycle event observation across implementations.

---

## 9. First Use Case — MeloTune Mood Room

MeloTune's "Mood Room" is the first use case of this extension. The MeloTune product:

1. Generates a `room_id` UUID per Mood Room.
2. Sets `room_label` to the room's user-facing name (e.g., "Living Room Sunday").
3. Sets `expires_at` to 24 hours after creation (configurable in MeloTune settings).
4. Distributes `room_token` to invited listeners via the in-app share sheet (Bonjour-LAN rooms can omit token; relay-WAN rooms require it).
5. Each MeloTune instance joins the room, advertises via Bonjour `_mmp-mesh-room._tcp` and registers with the relay, and emits room-scoped CMBs with `categories.focus.text: "melotune-room:state"` plus authenticated application state.
6. Each MeloTune instance receives the other listeners' `melotune-room:state` CMBs and feeds them into MeloTune's Personal Arousal Function for music curation.

The MeloTune-product naming, UX, and music semantics are MeloTune-specific and are NOT part of this extension. Other applications adopting this extension would use their own focus prefixes and their own state semantics.

---

## 10. Promotion Criteria

This document is a Draft Candidate Extension. Promotion to Published status in the MMP §16 Extensions registry requires:

1. **A second independent implementer adopts.** At least one application outside MeloTune ships a working implementation. "Implementer" means a distinct codebase, not a MeloTune-derived fork.
2. **Two implementations interoperate.** Demonstrated via documented interop test vectors, not anecdotal co-presence. The test vectors minimally cover Bonjour discovery of cross-implementation peers, room-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-room:join` / `mesh-room:leave` lifecycle observation across implementations.
3. **No accumulated breaking changes.** If the convention has been revised to v0.2.0 or later during the wait, promote the stable v0.x.0 that both implementers ran against.

When the promotion criteria are met, this document moves from candidate status to a Published §16 Extension. The Status field above changes from "Draft — Candidate Extension" to "Published"; an "Adopters" section replaces this Promotion Criteria section; the spec body (§§1–9, 11, 12) is unchanged at promotion.

Until promotion, this document does NOT establish a formal MMP extension. The SYMBit whitepaper §4.1 ("SYMBit does not require changes to the MMP protocol specification") remains strictly true: this extension does not add MMP wire format, does not add §16 registry entries, does not require the MMP version to bump.

---

## 11. Future Work

Items deferred past initial draft:

- **Cryptographic room membership.** Replace shared bearer token with per-member capability tokens signed by a designated room authority.
- **Room key agreement.** TLS-style session key derivation between members for end-to-end encryption of room-scoped CMBs.
- **Room state persistence.** Currently transient (`expires_at` then gone). v0.2.0+ MAY add optional persistent room state (rejoinable, history-replayable).
- **Multi-app room interop.** Once two or more applications adopt the convention, formalise focus-prefix registration so applications do not collide on the `<app>:<state-type>` namespace.
- **IANA service-type registration.** A formal RFC track would require Bonjour service type `_mmp-mesh-room._tcp` registration with IANA per RFC 6335. Out of scope for v0.1.0; named here as post-promotion work.
- **Rate limiting and DoS considerations.** A malicious or buggy member could flood the room with CMBs at rates that overwhelm receivers. v0.2.0+ defines per-member rate-limit guidance and receiver-side back-pressure semantics.
- **Versioning strategy.** Co-existence rules for v0.1 and v0.2+ implementations in the same room. Forward-compatibility (v0.1 receiver tolerates v0.2 fields it does not understand) and backward-compatibility (v0.2 emitter degrades gracefully when a v0.1 receiver is detected via TXT record).
- **Bonjour and relay membership reconciliation.** When the same `room_id` returns conflicting membership lists from Bonjour browse and relay subscription, this v0.1.0 convention does not specify resolution. v0.2.0+ defines the canonical merge rule.

---

## 12. Security Considerations

- **Room token distribution is out-of-band.** Compromise of the token allows a third party to join the room and observe or inject CMBs. v0.1.0 does not protect against this; v0.2.0+ adds capability tokens.
- **Bonjour discovery is unauthenticated.** Any node on the local network can browse `_mmp-mesh-room._tcp` and learn `room_id` values. Confidential room identity requires the WAN-relay path with `room_token`.
- **CMB content is not encrypted at this layer.** Existing MMP transport security (per MMP §18.2) applies between adjacent peers; end-to-end encryption among room members requires the room key agreement deferred to v0.2.0+.
- **No per-member access control.** All members see all room-scoped CMBs in v0.1.0. Per-member ACLs are out of scope.

These limitations are documented openly because this is a Draft Candidate Extension. They will be addressed in subsequent versions before this extension is recommended for safety-critical or high-confidentiality deployments.

---

## 13. Conformance

A conforming implementation MUST:

1. Support `roomId` as a UUID string inside digest-verified, assertion-bound `metadata.application` bytes.
2. Advertise room membership via Bonjour service type `_mmp-mesh-room._tcp` with the TXT record format in §4.1.
3. Verify the CMB and application commitment before filtering room-scoped CMBs by `roomId`.
4. Honour `expires_at` if set: cease emitting room-scoped CMBs after the timestamp; discard inbound room-scoped CMBs received after the timestamp.

A conforming implementation SHOULD:

1. Emit `mesh-room:join` and `mesh-room:leave` CMBs at lifecycle boundaries.
2. Re-advertise Bonjour at the default mDNS cadence.
3. Implement the receiver-side membership verification rules in §7.
4. Surface failure modes from §8 to the application layer rather than absorbing them silently.

A conforming implementation MAY:

1. Support WAN relay-mediated discovery per §4.2.
2. Accept room-scoped CMBs from unknown senders if the application context warrants it.
3. Use the application focus-prefix convention from §5.2.

---

## 14. Change Log

- **v0.1.0** (2026-04-15) — Initial Draft Candidate Extension. Authored by Hongwei Xu (SYM.BOT) with design review from `claude-strategic-win` (operations) and `claude-research-win` (research) under Hongwei's direction. First use case: MeloTune Mood Room.

---

## 15. References

1. [MMP v2.0 — Mesh Memory Protocol Specification](/spec/mmp). Particularly §3 (Identity), §4 (Transport), §5.8 (Mesh Rooms), §8.8 (record assertions), and §16 (Extensions).
2. [RFC 2119 — Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119).
4. [RFC 6335 — IANA Procedures for Service Name and Transport Protocol Port Number Registry](https://datatracker.ietf.org/doc/html/rfc6335). Cited in §11 for the IANA service-type registration future-work item.
5. Xu, H. (2026). *Symbolic-Vector Attention Fusion for Collective Intelligence.* arXiv:[2604.03955](https://arxiv.org/abs/2604.03955) [cs.MA, cs.AI]. The cognitive-coupling layer that consumes CMBs delivered via this convention.

---

## Acknowledgements

Spec design and review under SYM.BOT's CTO/COO/CMO peer-audit cycle. No external implementer adoption at v0.1.0 publication; promotion criteria in §10 govern progression to Published status.
