# MMP Extension: Mesh Group

**Generic Transient Subgroup Primitive for the Mesh Memory Protocol**

| | |
|---|---|
| Version | 0.1.0 |
| Status | Draft — Candidate Extension |
| Date | 15 April 2026 |
| Author | Hongwei Xu &lt;hongwei@sym.bot&gt;, SYM.BOT |
| Extends | [MMP v1.0](/spec/mmp) — formalises §5.8 (Mesh Groups) without changes to the wire format |
| Canonical URL | https://meshcognition.org/spec/mmp/extensions/mesh-group |
| Licence | CC BY 4.0 (specification text) |

---

## Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v1.0; it does not change the MMP wire format and does not require an MMP version bump.

Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §10. Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension.

This status discipline preserves the SYMBit whitepaper §4.1 commitment: SYMBit does not require changes to the MMP protocol specification. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

---

## Abstract

This extension defines a generic application-layer convention for a **mesh group** — a small set of MMP nodes that have explicitly joined a shared, named group within the broader mesh — and the canonical CMB conventions members use to broadcast state to the group.

The convention does not change MMP wire format. CMBs remain MMP v1.0 CMBs. This convention specifies how members agree on group identity, how they discover each other, how they tag CMBs as group-scoped, and how they bound group lifetime.

The convention is the protocol primitive that real-world co-located group experiences are built on. The first use case (§9) is MeloTune's "Mood Room" feature; the convention is intentionally generic so that other applications — group meditation, collaborative work sessions, multiplayer co-located experiences — can adopt it and interoperate at the protocol layer.

---

## Introduction

MMP v1.0 §5.8 (Mesh Groups) names mesh groups as a structural concept but does not specify how a group is identified, discovered, or membership-managed. Implementers have adopted ad-hoc conventions, which has prevented cross-application interoperability.

This extension formalises the conventions that §5.8 leaves underspecified:

- A canonical `group_id` carried in CMB metadata.
- A Bonjour service type for LAN discovery and a relay channel pattern for WAN.
- A focus-prefix convention so multiple applications can share group infrastructure without colliding on state semantics.
- A receiver-side filtering rule for group-scoped CMBs.
- A membership lifecycle (join, heartbeat, leave, expire) covered by short, optional CMBs.

Nothing in this extension changes MMP wire format. Implementers conforming to MMP v1.0 already have everything they need at the transport layer; this document specifies the application-layer agreement that lets two MMP implementations form an interoperable group.

---

## 1. Motivation

### 1.1 The §5.8 Gap

MMP v1.0 §5.8 introduces "mesh groups" but treats them as an opaque concept. Two implementers reading §5.8 cannot independently produce code that joins each other's groups. The §5.8 text describes the semantic intent without specifying:

- The wire format of the group identifier.
- The discovery mechanism for finding co-members.
- The CMB tagging that lets receivers filter group-scoped traffic.
- The lifecycle events that mark joins, leaves, and expiration.

This extension fills the gap by formalising the conventions that §5.8 leaves to implementers.

### 1.2 Real-World Co-located Group Use Cases

Group experiences happen at human scale: a small number of people, briefly co-located, sharing some state. MeloTune's Mood Room is one example: 2–6 listeners in the same physical space, each running MeloTune on their own device, each broadcasting their music-agent state into the shared room.

Other use cases follow the same pattern: a group meditation app where N practitioners share breathing-cycle state; a collaborative work app where N team members share focus-context; a multiplayer co-located experience where N participants share game-state. All of these need the same protocol primitive: a transient, named, peer-discovered subgroup of the broader mesh.

The mesh-group convention is intentionally generic so that an application implementing it for one use case interoperates at the protocol level with another application using it for an unrelated purpose. Each application defines its own state semantics (per §5.4 focus-prefix); the group-membership and CMB-routing primitives are shared.

---

## 2. Mesh Group Model

A mesh group is an explicit, transient grouping of MMP nodes. Membership is voluntary on both sides: a node joins by advertising its membership; the group exists from the moment its first member joins until either the last member leaves or an optional `expires_at` timestamp passes.

The mesh group is **not** a long-lived addressable entity. It does not have a persistent state on any node beyond the transient list of currently-known members. A group that has zero members for more than a brief grace period is effectively terminated.

| Term | Definition |
|---|---|
| mesh group | A named, transient subgroup of the broader MMP mesh whose members have explicitly joined and are mutually discoverable. |
| `group_id` | Stable string identifier for a mesh group. UUIDv4 RECOMMENDED. Carried in CMB metadata. |
| group token | OPTIONAL bearer token shared out-of-band among joiners; REQUIRED for WAN relay-mediated groups, OPTIONAL for Bonjour-LAN groups. |
| member | An MMP node with a joined session in the group. Identified by its standard MMP identity (Ed25519 public key per MMP §3.2). |
| group-scoped CMB | A CMB whose `meta.group_id` field equals the group's `group_id`; receivers MAY filter on this. |
| lifetime | A group exists from the moment its first member joins until either the last member leaves OR the optional `expires_at` timestamp passes. |

This document uses [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) keywords (MUST, SHOULD, MAY) as written in capital letters.

---

## 3. Group Identity

A mesh group MUST have:

- A `group_id` (string, UUIDv4 RECOMMENDED).

A mesh group MAY have:

- A `group_label` (human-readable string, ≤64 UTF-8 bytes).
- An `expires_at` (RFC 3339 timestamp).
- A `group_token` (opaque bearer string).

The `group_token` is REQUIRED for WAN relay-mediated discovery (§4.2) and is OPTIONAL for Bonjour-LAN-mediated discovery (§4.1).

The convention does not specify how `group_id`, `group_label`, `expires_at`, or `group_token` are agreed among members. Implementations typically distribute these out-of-band: one node generates them, and other nodes receive them via QR code, NFC tap, push notification, share-sheet link, or any other application-layer channel.

---

## 4. Discovery

### 4.1 LAN Discovery via Bonjour

Members MUST advertise the group via Bonjour service type `_mmp-mesh-group._tcp` with the following TXT record:

```
group_id        = <UUIDv4>
group_label     = <optional, ≤64 bytes>
mmp_version     = 0.2.2
member_identity = <Ed25519 public-key fingerprint, first 16 hex chars>
```

A node joining the group browses for `_mmp-mesh-group._tcp`, filters by matching `group_id` in TXT records, and connects to the discovered peers using standard MMP Layer 1 (TCP) transport.

**Concrete TXT record example:**

```
group_id        = 550e8400-e29b-41d4-a716-446655440000
group_label     = Living Room Sunday
mmp_version     = 0.2.2
member_identity = a1b2c3d4e5f6a7b8
```

Bonjour TXT records are key=value pairs of UTF-8 bytes; total record size MUST stay under the mDNS ~400-byte practical limit. `group_label` SHOULD be omitted if it would push the record over budget.

### 4.2 WAN Discovery via Relay (OPTIONAL)

Groups MAY operate LAN-only via Bonjour alone. Implementations without relay support interoperate with relay-aware implementations on the Bonjour path.

When a relay is used, members register membership with the SYM relay by:

1. Opening a WebSocket connection to the relay endpoint.
2. Presenting `group_token` as a bearer credential in the connection handshake (`Authorization: Bearer <group_token>` header).
3. Subscribing to the per-group channel named by `group_id`.

The relay enforces token-based authorisation and forwards group-scoped CMBs (those whose `meta.group_id` matches the channel) only among members holding a valid token for that `group_id`.

Members SHOULD reconnect on disconnection with exponential backoff (default: 1 second initial, 60 seconds maximum).

The relay protocol's wire format is anchored in MMP v1.0 §4 transport conventions; a normative public-spec reference will be added at promotion time per §10.

---

## 5. CMB Tagging Conventions

### 5.1 Group-Scoped CMBs

A member's CMB is "group-scoped" when its `meta.group_id` field equals the group's `group_id`.

Members MAY emit:

- **Group-scoped CMBs** — `meta.group_id` set, intended for delivery to other group members.
- **Un-scoped CMBs** — no `meta.group_id`, intended for the broader mesh per existing MMP rules.

A member MAY filter inbound CMBs by `meta.group_id` to restrict processing to group-scoped traffic. Receivers are NOT REQUIRED to filter; this convention only specifies the tagging semantics.

### 5.2 Application Focus-Prefix Convention

For inter-application interoperability, group members MAY use a CMB `focus` field prefix to indicate the kind of group state being broadcast. The prefix format is `<app>:<state-type>`. Examples:

- MeloTune Mood Room: `focus: "melotune-room:state"`, `"melotune-room:peer"`
- (hypothetical) Group meditation: `focus: "meditation:phase"`
- (hypothetical) Collaborative work: `focus: "cowork:status"`

This is a RECOMMENDED convention, not a requirement. Applications MAY use any focus content. Inter-application namespace registration is deferred to a future version of this extension (§11).

---

## 6. Membership Lifecycle

| Event | Behaviour |
|---|---|
| Join | Member begins advertising via Bonjour AND/OR registering with relay. Member SHOULD emit one group-scoped CMB with `focus: "mesh-group:join"` and `mood: { valence: 0, arousal: 0 }` (neutral presence). |
| Heartbeat | Member SHOULD re-advertise Bonjour at default mDNS cadence. No required heartbeat CMB; absence-of-CMB is detected at the application layer per receiver policy. |
| Leave | Member ceases Bonjour advertisement and unregisters from relay. Member SHOULD emit one group-scoped CMB with `focus: "mesh-group:leave"` and `mood: { valence: 0, arousal: 0 }`. |
| Expire | At `expires_at` if set, members SHOULD treat the group as terminated and stop emitting group-scoped CMBs. Receivers SHOULD discard group-scoped CMBs received after `expires_at`. |

The recommended `mesh-group:join` and `mesh-group:leave` CMBs are convention-level; applications MAY detect membership changes via Bonjour churn alone.

---

## 7. Receiver Behaviour

A node receiving a group-scoped CMB SHOULD verify:

1. The sender's identity is currently a known member of the group (via the Bonjour browse list AND/OR relay registration).
2. The CMB is received before `expires_at` (if set).

A node MAY accept group-scoped CMBs from unknown senders if the application context warrants it (for example, a listener entering a Mood Room mid-session may not yet have observed the original joiner's announcement).

---

## 8. Failure Modes

| Failure | RECOMMENDED Behaviour |
|---|---|
| `expires_at` passes during active broadcasts | Members SHOULD stop emitting group-scoped CMBs at the timestamp; receivers SHOULD discard group-scoped CMBs received with `meta.received_at > expires_at`. Active media playback or application sessions are NOT terminated by this specification — applications decide their own response. |
| `group_token` rejected by relay mid-session | Member SHOULD treat as a group-leave event and surface the failure to the application layer. Reconnection policy is application-defined. |
| Bonjour advertisement fails (mDNS error, sandbox rejection) | Member MAY fall back to relay-only registration if `group_token` is available. If neither path works, the member is effectively isolated; the failure SHOULD be surfaced to the application layer rather than silently absorbed. |
| Two members generate the same `group_id` independently | UUIDv4 collision probability is negligible; if observed, the second-joining member SHOULD detect via Bonjour (existing TXT record with the same `group_id` from a different `member_identity`) and refuse to join. |
| Group has zero members for more than 60 seconds | Group is effectively terminated. Receivers MAY ignore subsequent late-arriving CMBs from a member that had not yet observed the empty state. |

The interop test specification for the §10 promotion criterion ("two implementations interoperate") is **deferred to post-v0.1.0** and will be specified jointly with the second implementer when adoption occurs. The test suite will minimally cover Bonjour discovery of cross-implementation peers, group-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-group:join` / `mesh-group:leave` lifecycle event observation across implementations.

---

## 9. First Use Case — MeloTune Mood Room

MeloTune's "Mood Room" is the first use case of this extension. The MeloTune product:

1. Generates a `group_id` UUID per Mood Room.
2. Sets `group_label` to the room's user-facing name (e.g., "Living Room Sunday").
3. Sets `expires_at` to 24 hours after creation (configurable in MeloTune settings).
4. Distributes `group_token` to invited listeners via the in-app share sheet (Bonjour-LAN rooms can omit token; relay-WAN rooms require it).
5. Each MeloTune instance joins the group, advertises via Bonjour `_mmp-mesh-group._tcp` and registers with the relay, and emits group-scoped CMBs with `focus: "melotune-room:state"` carrying the listener's current music-agent state (mood, genre, current track).
6. Each MeloTune instance receives the other listeners' `melotune-room:state` CMBs and feeds them into MeloTune's Personal Arousal Function for music curation.

The MeloTune-product naming, UX, and music semantics are MeloTune-specific and are NOT part of this extension. Other applications adopting this extension would use their own focus prefixes and their own state semantics.

---

## 10. Promotion Criteria

This document is a Draft Candidate Extension. Promotion to Published status in the MMP §16 Extensions registry requires:

1. **A second independent implementer adopts.** At least one application outside MeloTune ships a working implementation. "Implementer" means a distinct codebase, not a MeloTune-derived fork.
2. **Two implementations interoperate.** Demonstrated via documented interop test vectors, not anecdotal co-presence. The test vectors minimally cover Bonjour discovery of cross-implementation peers, group-scoped CMB delivery via both Bonjour-LAN and (where supported) relay-WAN paths, and `mesh-group:join` / `mesh-group:leave` lifecycle observation across implementations.
3. **No accumulated breaking changes.** If the convention has been revised to v0.2.0 or later during the wait, promote the stable v0.x.0 that both implementers ran against.

When the promotion criteria are met, this document moves from candidate status to a Published §16 Extension. The Status field above changes from "Draft — Candidate Extension" to "Published"; an "Adopters" section replaces this Promotion Criteria section; the spec body (§§1–9, 11, 12) is unchanged at promotion.

Until promotion, this document does NOT establish a formal MMP extension. The SYMBit whitepaper §4.1 ("SYMBit does not require changes to the MMP protocol specification") remains strictly true: this extension does not add MMP wire format, does not add §16 registry entries, does not require the MMP version to bump.

---

## 11. Future Work

Items deferred past initial draft:

- **Cryptographic group membership.** Replace shared bearer token with per-member capability tokens signed by a designated group authority.
- **Group key agreement.** TLS-style session key derivation between members for end-to-end encryption of group-scoped CMBs.
- **Group state persistence.** Currently transient (`expires_at` then gone). v0.2.0+ MAY add optional persistent group state (rejoinable, history-replayable).
- **Multi-app group interop.** Once two or more applications adopt the convention, formalise focus-prefix registration so applications do not collide on the `<app>:<state-type>` namespace.
- **IANA service-type registration.** A formal RFC track would require Bonjour service type `_mmp-mesh-group._tcp` registration with IANA per RFC 6335. Out of scope for v0.1.0; named here as post-promotion work.
- **Rate limiting and DoS considerations.** A malicious or buggy member could flood the group with CMBs at rates that overwhelm receivers. v0.2.0+ defines per-member rate-limit guidance and receiver-side back-pressure semantics.
- **Versioning strategy.** Co-existence rules for v0.1 and v0.2+ implementations in the same group. Forward-compatibility (v0.1 receiver tolerates v0.2 fields it does not understand) and backward-compatibility (v0.2 emitter degrades gracefully when a v0.1 receiver is detected via TXT record).
- **Bonjour and relay membership reconciliation.** When the same `group_id` returns conflicting membership lists from Bonjour browse and relay subscription, this v0.1.0 convention does not specify resolution. v0.2.0+ defines the canonical merge rule.

---

## 12. Security Considerations

- **Group token distribution is out-of-band.** Compromise of the token allows a third party to join the group and observe or inject CMBs. v0.1.0 does not protect against this; v0.2.0+ adds capability tokens.
- **Bonjour discovery is unauthenticated.** Any node on the local network can browse `_mmp-mesh-group._tcp` and learn `group_id` values. Confidential group identity requires the WAN-relay path with `group_token`.
- **CMB content is not encrypted at this layer.** Existing MMP transport-layer encryption (per MMP v1.0 §3.4) applies between adjacent peers; end-to-end encryption among group members requires the group key agreement deferred to v0.2.0+.
- **No per-member access control.** All members see all group-scoped CMBs in v0.1.0. Per-member ACLs are out of scope.

These limitations are documented openly because this is a Draft Candidate Extension. They will be addressed in subsequent versions before this extension is recommended for safety-critical or high-confidentiality deployments.

---

## 13. Conformance

A conforming implementation MUST:

1. Support `group_id` as a UUIDv4 string carried in CMB `meta`.
2. Advertise group membership via Bonjour service type `_mmp-mesh-group._tcp` with the TXT record format in §4.1.
3. Filter group-scoped CMBs by matching `meta.group_id` if filtering is performed at all.
4. Honour `expires_at` if set: cease emitting group-scoped CMBs after the timestamp; discard inbound group-scoped CMBs received after the timestamp.

A conforming implementation SHOULD:

1. Emit `mesh-group:join` and `mesh-group:leave` CMBs at lifecycle boundaries.
2. Re-advertise Bonjour at the default mDNS cadence.
3. Implement the receiver-side membership verification rules in §7.
4. Surface failure modes from §8 to the application layer rather than absorbing them silently.

A conforming implementation MAY:

1. Support WAN relay-mediated discovery per §4.2.
2. Accept group-scoped CMBs from unknown senders if the application context warrants it.
3. Use the application focus-prefix convention from §5.2.

---

## 14. Change Log

- **v0.1.0** (2026-04-15) — Initial Draft Candidate Extension. Authored by Hongwei Xu (SYM.BOT) with design review from `claude-strategic-win` (operations) and `claude-research-win` (research) under Hongwei's direction. First use case: MeloTune Mood Room.

---

## 15. References

1. [MMP v1.0 — Mesh Memory Protocol Specification](/spec/mmp). Particularly §3 (Identity), §4 (Transport), §5.8 (Mesh Groups), §16 (Extensions).
2. [RFC 2119 — Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119).
4. [RFC 6335 — IANA Procedures for Service Name and Transport Protocol Port Number Registry](https://datatracker.ietf.org/doc/html/rfc6335). Cited in §11 for the IANA service-type registration future-work item.
5. Xu, H. (2026). *Symbolic-Vector Attention Fusion for Collective Intelligence.* arXiv:[2604.03955](https://arxiv.org/abs/2604.03955) [cs.MA, cs.AI]. The cognitive-coupling layer that consumes CMBs delivered via this convention.

---

## Acknowledgements

Spec design and review under SYM.BOT's CTO/COO/CMO peer-audit cycle. No external implementer adoption at v0.1.0 publication; promotion criteria in §10 govern progression to Published status.
