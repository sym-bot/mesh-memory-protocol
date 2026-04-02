# MMP Extension: Consent

**Protocol-Level Consent Primitive for Cognitive Mesh Coupling**

| | |
|---|---|
| Version | 0.1.0 |
| Status | Published |
| Date | 28 March 2026 |
| Author | Hongwei Xu <hongwei@sym.bot>, SYM.BOT Ltd |
| Acknowledgement | AxonOS — real-time enforcement constraints, BCI domain requirements, and field-by-field review against the Cognitive Hypervisor |
| Extends | [MMP v0.2.0](https://sym.bot/spec/mmp) — Layer 2 (Connection) |
| Canonical URL | https://sym.bot/spec/mmp-consent |
| Licence | CC BY 4.0 (specification text) |

---

## Abstract

This extension defines a **consent primitive** for the Mesh Memory Protocol. Consent is a Layer 2 (Connection) mechanism that overrides all cognitive coupling evaluation at Layer 4 and above. When a node withdraws consent, all coupling, state blending, memory evaluation, and cognitive state exchange with that node cease — instantaneously, completely, and non-negotiably.

---

## Introduction

MMP's existing coupling engine evaluates drift and decides autonomously whether to accept or reject signals. Both sides can reject. But neither side has a mechanism to withdraw from coupling entirely — to say "stop evaluating me, stop blending with me, now." The consent primitive fills this gap.

This extension is designed for safety-critical domains where coupling withdrawal must complete within bounded time. Brain-computer interfaces (BCI) are the motivating use case: a biological node must be able to withdraw from cognitive coupling with the guarantee that withdrawal completes within one local processing cycle, independent of network conditions.

---

## 1. Motivation

### 1.1 The Protocol Gap

MMP's coupling engine operates at the signal level: each node in the mesh independently evaluates incoming signals from every peer via SVAF and decides whether to accept, guard, or reject per field. This evaluation is symmetric — all nodes, regardless of type, have equal capability to reject any signal.

But rejection is per-signal. A node that rejects every signal from a peer remains connected, continues receiving frames, and continues being evaluated by that peer's coupling engine. MMP has no mechanism for a node to withdraw from coupling entirely — to cease all evaluation, disconnect, and guarantee that no further cognitive state exchange occurs. The consent primitive fills this gap.

### 1.2 Safety-Critical Domains

In safety-critical systems, the established principle is fail-safe on communication loss: a device must enter a known safe state when communication with its controller fails (IEC 60601-1, IEC 62304, ISO 14971). Existing safety-critical protocols — IEC 61508 for industrial systems, ARINC 653 for avionics, AUTOSAR for automotive — detect node loss via timeout and treat all disconnections as faults.

However, none of these protocols distinguish **voluntary withdrawal** from **fault**. A node that intentionally leaves is treated identically to a node that crashes. For MMP, this distinction matters: a node withdrawing consent is making an intentional, protocol-level decision that peers should acknowledge and propagate — not a fault to be recovered from.

Brain-computer interfaces (BCI) present the hardest constraint. Neuroethics scholarship has identified the need for technical mechanisms to enforce consent in neural devices (Yuste et al., 2017; Ienca & Andorno, 2017), but no existing medical device communication protocol — IEEE 11073, Bluetooth Health Device Profile, or others — implements consent as a real-time protocol primitive. Clinical informed consent is a human process, documented on paper or in records. The consent primitive defined here operates at the protocol layer: machine-enforceable, real-time, and locally verifiable.

### 1.3 Hardware Isolation Is Not Sufficient

Safety-critical implementations may provide hardware-level isolation — sealed memory fields, DMA barriers, register locks. These mechanisms protect the **physical boundary**: they prevent data from reaching hardware that should not receive it. But they do not address the **protocol boundary**: peer nodes may continue evaluating drift, blending state, and generating SVAF decisions for a node that has withdrawn. The consent primitive closes this gap — a protocol-level gate that prevents cognitive evaluation from occurring, not just data from flowing.

### 1.4 Why Layer 2

Consent lives at Layer 2 (Connection) — below the Coupling layer (4), below Synthetic Memory (5), below xMesh (6). This placement is deliberate:

- **Below cognition.** Consent is not a cognitive decision. It is a transport-level gate. The coupling engine never sees frames from a withdrawn node.
- **Below evaluation.** No drift computation, no SVAF evaluation, no blending occurs on frames from a node whose consent is withdrawn. The gate closes before evaluation begins.
- **At the transport boundary.** Withdrawal triggers connection teardown. The transport layer enforces it. No higher layer can override it.

---

## 2. Consent Model

### 2.1 States

Each node maintains a consent state per peer:

| State | Coupling | Description |
|---|---|---|
| **granted** | Permitted | Default state. Normal MMP coupling evaluation applies. |
| **withdrawn** | Prohibited | All coupling, blending, and evaluation cease. Connection teardown initiated. |
| **suspended** | Paused | Coupling paused but connection maintained. No cognitive state exchange. Resumable without re-handshake. |

### 2.2 Properties

The consent primitive has four non-negotiable properties:

**Instantaneous.** Withdrawal takes effect before the next coupling evaluation on the withdrawing node. No round-trip required. The local node stops blending immediately; notification to the peer is best-effort.

**Complete.** Withdrawal overrides ALL drift decisions. It is not a threshold adjustment. It is a hard gate that prevents any cognitive state from the withdrawn node from entering the coupling engine, SVAF evaluator, or state blender.

**Non-negotiable.** The peer cannot reject, delay, or override a withdrawal. The peer receives a notification frame and MUST comply. There is no "consent negotiation" — consent is unilateral.

**Locally enforceable.** The withdrawing node enforces consent locally without depending on peer acknowledgement. Even if the notification frame is lost, the local node has already stopped coupling. Network partition cannot prevent withdrawal.

---

## 3. Frame Specification

This extension adds three frame types to MMP. The normative content is the **field semantics** — the named fields, their types, and their meaning. The JSON encoding below is the canonical representation used by the MMP reference implementations (Node.js, Swift) over TCP/WebSocket.

Implementations on constrained or real-time transports (e.g., BLE mesh, bare-metal IPC) MAY use alternative encodings (CBOR, packed binary, protobuf) provided the same fields and semantics are preserved. The consent state machine, enforcement sequence, and interaction with MMP layers are encoding-independent.

### 3.1 consent-withdraw

Sent by a node to withdraw consent for cognitive coupling with a specific peer or all peers.

| Field | Type | Required | Description |
|---|---|---|---|
| type | string | MUST | `"consent-withdraw"` |
| scope | string | MUST | `"peer"` (single peer) or `"all"` (all peers) |
| reasonCode | uint8 | OPTIONAL | Machine-readable reason code (see Section 3.4) |
| reason | string | OPTIONAL | Human-readable explanation. Not used for protocol decisions. |
| epoch | uint64 | OPTIONAL | Swarm epoch index *k* at which withdrawal was decided |
| timestamp | uint64 | OPTIONAL | Unix milliseconds. Canonical for general-purpose implementations. |
| timestamp_us | uint64 | OPTIONAL | Unix microseconds. When present, takes precedence over `timestamp`. |

Canonical JSON example (peer withdrawal):

```json
{
  "type": "consent-withdraw",
  "scope": "peer",
  "reasonCode": 1,
  "reason": "user requested disconnect",
  "timestamp": 1711540800000
}
```

Canonical JSON example (all peers, real-time):

```json
{
  "type": "consent-withdraw",
  "scope": "all",
  "reasonCode": 2,
  "epoch": 48291,
  "timestamp_us": 1711540800000000
}
```

**Scope semantics.**
- `scope: "peer"` — withdraw consent for the receiving peer only. Connection to this peer MUST be closed after sending.
- `scope: "all"` — withdraw consent for all peers. The withdrawing node MUST send `consent-withdraw` to all connected peers. Delivery is asynchronous — local enforcement completes before any notification is sent. The delivery requirement is eventual, not simultaneous.

**Epoch field.** For real-time implementations with synchronised scheduling: the swarm epoch index *k* (from *t_start[k] = T₀ + k × T_swarm*) at which withdrawal was decided. Peers synchronised via SC0 (clock sync) and SC2 (synchronised start) SHOULD enforce withdrawal at epoch *k+1* at the latest. For general-purpose implementations without epoch synchronisation, this field is informational. The `epoch` field provides coarse ordering independent of timestamp resolution.

**Enforcement ordering.** The withdrawing node MUST stop all coupling evaluation for the target peer(s) **before** sending this frame. The frame is notification, not request.

### 3.2 consent-suspend

Pauses cognitive coupling while maintaining the transport connection.

| Field | Type | Required | Description |
|---|---|---|---|
| type | string | MUST | `"consent-suspend"` |
| reasonCode | uint8 | OPTIONAL | Machine-readable reason code (see Section 3.4) |
| reason | string | OPTIONAL | Human-readable explanation |
| timestamp | uint64 | OPTIONAL | Unix milliseconds |
| timestamp_us | uint64 | OPTIONAL | Unix microseconds. When present, takes precedence over `timestamp`. |

Canonical JSON example:

```json
{
  "type": "consent-suspend",
  "reasonCode": 1,
  "reason": "user entering focus mode",
  "timestamp": 1711540800000
}
```

**Frame filtering during SUSPENDED state.** The peer MUST NOT send cognitive frames (`state-sync`, `memory-share`, `xmesh-insight`) to a suspended node. Transport frames (`ping`/`pong`, `message`, `peer-info`) continue normally. This classification aligns with the base spec Connection State Machine ([MMP Section 5.3](https://sym.bot/spec/mmp/connection#state-machine)): cognitive frames are gated; transport frames are ungated.

### 3.3 consent-resume

Resumes cognitive coupling after suspension. The peer SHOULD send a `state-sync` frame immediately after receiving `consent-resume` to re-establish coupling state.

| Field | Type | Required | Description |
|---|---|---|---|
| type | string | MUST | `"consent-resume"` |
| timestamp | uint64 | OPTIONAL | Unix milliseconds |
| timestamp_us | uint64 | OPTIONAL | Unix microseconds. When present, takes precedence over `timestamp`. |

Canonical JSON example:

```json
{
  "type": "consent-resume",
  "timestamp": 1711540860000
}
```

**Re-coupling cost.** The first `state-sync` after `consent-resume` triggers a cold re-initialisation of the coupling engine for that peer. The coupling engine has no cached state — the first post-resume drift computation and SVAF evaluation MAY exhibit higher latency than steady-state. Implementations SHOULD document the resume-to-steady-state convergence time.

### 3.4 Reason Code Registry

The `reasonCode` field carries a machine-readable reason for consent transitions. Constrained implementations MAY use `reasonCode` in place of the `reason` string to avoid variable-length string parsing on the critical path.

| Code | Name | Description |
|---|---|---|
| 0x00 | UNSPECIFIED | No reason given |
| 0x01 | USER_INITIATED | User or operator requested withdrawal |
| 0x02 | SAFETY_VIOLATION | Safety constraint violated |
| 0x03 | HARDWARE_FAULT | Hardware-level fault detected |

**Registry allocation.** Codes 0x00–0x0F are reserved by this specification. Future versions of this extension MAY define additional codes in this range. Codes 0x10–0xFF are available for implementation-specific use and MUST NOT be given cross-implementation semantics without registration in a future version of this specification.

---

## 4. Consent State Machine

Consent state is **per-node, per-peer, and unilateral**. Each node maintains its own consent state for each peer. Only the node that owns the state can transition it. A peer cannot transition another node's consent state — it can only observe the effect (frame suppression, connection teardown).

```
     ┌─────────┐  consent-suspend   ┌───────────┐
     │ GRANTED │ ─────────────────> │ SUSPENDED │
     │         │ <───────────────── │           │
     └────┬────┘  consent-resume    └─────┬─────┘
          │                               │
          │ consent-withdraw              │ consent-withdraw
          │                               │
          v                               v
     ┌──────────────────────────────────────┐
     │            WITHDRAWN                 │
     │    connection closed (terminal)      │
     └──────────────────────────────────────┘
```

| Transition | Trigger | Effect |
|---|---|---|
| GRANTED → SUSPENDED | `consent-suspend` | Coupling pauses. Connection stays. Peer stops sending cognitive frames. Resumable. |
| SUSPENDED → GRANTED | `consent-resume` | Coupling resumes. Peer re-sends `state-sync`. Cold re-init of coupling engine (Section 3.3). |
| GRANTED → WITHDRAWN | `consent-withdraw` | Coupling stops. Connection closes. Terminal. |
| SUSPENDED → WITHDRAWN | `consent-withdraw` | Connection closes. Terminal. |

`WITHDRAWN` is terminal. Re-connection requires a new handshake and starts in `GRANTED` state on a new connection — the previous consent state is not carried forward.

### 4.1 Directionality

Consent is **unilateral**. Only the node that sent `consent-suspend` can send `consent-resume` for that relationship. A peer receiving `consent-suspend` MUST NOT send `consent-resume` — it did not initiate the suspension. If the peer independently wants to suspend coupling in its own direction, it sends its own `consent-suspend`.

This means two nodes in a coupling relationship each maintain independent consent states. Node A may be GRANTED toward B while B is SUSPENDED toward A. The coupling is asymmetric — A continues sending cognitive frames to B, but B has stopped accepting them from A.

### 4.2 Edge Cases

**Connection loss during SUSPENDED.** If the transport connection drops while consent is in `SUSPENDED` state, both sides MUST treat this as equivalent to `WITHDRAWN`. There is no implicit resume — re-connection starts a new handshake in `GRANTED` state. Implementations with sub-second fault detection (e.g., BLE at ≤8ms intervals) SHOULD use an elevated heartbeat threshold for SUSPENDED peers (RECOMMENDED ≥ 500ms) to prevent transient transport dropout from triggering false WITHDRAWN. The elevated threshold MUST still be below human reaction time for safety-critical applications.

**Idempotency.** Duplicate consent frames MUST be handled gracefully. A second `consent-suspend` while already suspended is a no-op. A `consent-resume` while already in `GRANTED` state is a no-op. Implementations MUST NOT treat duplicates as errors.

**Simultaneous withdrawal.** If both peers send `consent-withdraw` simultaneously, both close the connection independently. This is safe — withdrawal is locally enforced before notification. No coordination is required.

**Invalid transitions.** A `consent-resume` from a node that is in `GRANTED` state (never suspended) MUST be silently ignored. A `consent-suspend` or `consent-resume` from a `WITHDRAWN` node is impossible (connection is already closed).

---

## 5. Enforcement Semantics

### 5.1 Enforcement Sequence

The withdrawing node MUST enforce consent locally before notifying the peer. The normative enforcement sequence is:

```
1. Set local consent state to WITHDRAWN for target peer(s)
2. [Safety-critical only] Persist consent state to non-volatile storage
3. Remove peer(s) from coupling engine (no further blending)
4. Discard any buffered frames from target peer(s)
5. Send consent-withdraw frame to peer(s)          // best-effort notification
6. Close transport connection(s)                    // teardown
```

Steps 1–4 are local and MUST complete before step 5. If step 5 fails (network partition), the withdrawal is still enforced locally. The peer will detect disconnection via heartbeat timeout ([MMP Section 5.4](https://sym.bot/spec/mmp/connection#heartbeat)).

Step 2 is SHOULD for safety-critical implementations and MAY be omitted by general-purpose implementations. When step 2 is implemented, it MUST complete before step 3. See Section 5.4 for persistence requirements.

### 5.2 Peer Enforcement

Upon receiving `consent-withdraw`, a peer MUST:

1. Immediately stop sending cognitive frames (`state-sync`, `memory-share`, `xmesh-insight`) to the withdrawing node.
2. Remove the withdrawing node from its coupling engine.
3. Close the transport connection.
4. Propagate the withdrawal to other peers via `peer-info` gossip (consent state SHOULD be included in gossip metadata — see Section 6.4).

### 5.3 Timing Contracts

MMP defines the semantics of withdrawal. The timing guarantee is implementation-specific and depends on the execution environment:

| Environment | Local enforcement | Peer notification | Guarantee |
|---|---|---|---|
| General-purpose OS | < 1 ms (typical) | Best-effort | Soft real-time. Local enforcement before next event loop tick. |
| iOS / macOS | < 1 ms (typical) | Best-effort | Soft real-time. Main actor dispatch. |
| Real-time kernel | Implementation-defined WCET | Next epoch boundary | Hard real-time. Local enforcement within one pipeline period. Consent-only path expected to be a small fraction of full pipeline WCET. |

For implementations with bounded peer counts (N ≤ 8), `scope: "all"` notification completes within N × per-frame send time.

Implementations targeting safety-critical domains MUST document their worst-case enforcement latency. MMP does not mandate a specific WCET — it mandates that local enforcement completes before notification, and that the guarantee is documented.

### 5.4 Power-Cycle Persistence

Safety-critical implementations SHOULD persist consent state to non-volatile storage (e.g., NVRAM, secure element) **before** removing the peer from the coupling engine (step 2 in Section 5.1).

On power-cycle recovery, a previously `WITHDRAWN` state MUST NOT auto-reconnect to the withdrawn peer. Re-connection requires explicit user action and starts a new handshake in `GRANTED` state. This ensures fail-safe behaviour — power loss during withdrawal does not silently restore coupling.

Implementations MUST document their consent state persistence mechanism and the failure mode when persistence is unavailable (e.g., does the implementation default to WITHDRAWN or GRANTED on recovery without persisted state).

### 5.5 Fault Detection

When a `consent-withdraw` notification is lost (network partition), the peer MUST detect the withdrawal via transport-level failure (heartbeat timeout, connection close). For real-time implementations with distributed fault detection, node silence SHOULD be detected within 2 scheduling periods. The peer MUST treat a detected-silent node identically to a node that sent `consent-withdraw`: remove from coupling, stop all cognitive evaluation.

---

## 6. Interaction with MMP Layers

### 6.1 Layer 2 (Connection)

Consent state MUST be checked before processing any frame from a peer. If consent is `withdrawn` or `suspended`, cognitive frames (`state-sync`, `memory-share`, `xmesh-insight`) MUST be silently discarded. Heartbeat (`ping`/`pong`), `message`, and `peer-info` frames are processed normally in `suspended` state.

### 6.2 Layer 4 (Coupling)

The coupling engine MUST check consent state before evaluating drift. If consent is not `granted`, the coupling engine MUST NOT compute drift, MUST NOT blend state, and MUST NOT invoke SVAF evaluation for that peer. Consent overrides all drift thresholds.

### 6.3 Handshake

Implementations SHOULD include consent capability in the handshake frame to signal support for this extension:

```json
{
  "type": "handshake",
  "nodeId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "name": "my-agent",
  "version": "0.2.0",
  "extensions": ["consent"]
}
```

Extension negotiation follows [MMP Section 15.3](https://sym.bot/spec/mmp/extensions#negotiation): if both peers advertise `"consent"` in their handshake, the extension is active. If only one peer advertises it, the extension is NOT active — the advertising peer MUST NOT send consent frames to a peer that does not support them. Consent state defaults to `GRANTED` for peers that do not support this extension.

### 6.4 Gossip Propagation

When a node withdraws consent, peers SHOULD propagate this via `peer-info` gossip. The `peer-info` frame MAY include a `consentState` field per peer entry. This allows nodes that have never directly connected to a withdrawn node to learn its consent state transitively.

```json
{
  "type": "peer-info",
  "peers": [
    { "nodeId": "a1b2c3d4-...", "name": "agent-a", "consentState": "granted", "lastSeen": 1711540800000 },
    { "nodeId": "e5f6a7b8-...", "name": "agent-b", "consentState": "withdrawn", "lastSeen": 1711540700000 }
  ]
}
```

**Gossip about SUSPENDED peers.** Nodes SHOULD include `consentState` in gossip so that other nodes know a peer's consent state for their own coupling decisions. A SUSPENDED node MUST continue receiving `peer-info` frames (transport-level, ungated). However, peers SHOULD NOT propagate SVAF evaluation results or state-sync derivatives about the suspended node while it is suspended.

**Constrained gossip encoding.** Implementations operating under payload size constraints (e.g., BLE ATT MTU of 251 bytes) MAY use compressed consent state encoding: 2 bits per peer for the full state machine (00 = granted, 01 = suspended, 10 = withdrawn, 11 = reserved). The `consentState` field in `peer-info` is a backward-compatible schema extension — nodes that do not support it MUST ignore unrecognised fields per [MMP Section 7](https://sym.bot/spec/mmp/frames).

### 6.5 Relay Interaction

Relay nodes ([MMP Section 4.4](https://sym.bot/spec/mmp/transport#relay)) forward frames without cognitive processing. A relay MUST forward consent frames like any other frame — the relay does not interpret or enforce consent. Consent enforcement is the responsibility of the endpoint nodes. If a node withdraws consent from a peer reachable only via relay, the withdrawing node MUST still close its relay-mediated logical connection to that peer.

---

## 7. Relationship to Other Control Mechanisms

The consent primitive is one of several layered control mechanisms that compose in MMP-based systems. Implementers MUST understand the distinction — each operates at a different layer with different granularity and purpose.

| Mechanism | Layer | Controls | Granularity | User-facing |
|---|---|---|---|---|
| **Consent** (this extension) | 2 (Connection) | Whether coupling happens at all | Binary: on / paused / off | Emergency stop, privacy mode, DND |
| **SVAF field weights** (α_f) | 4 (Coupling) | Which semantic fields matter for this agent type | Per-field continuous weights | Agent configuration |
| **Mood influence gate** | 7 (Application) | How much mesh mood blends into local device/app mood | Continuous: 0–100% | Daily user preference |

These mechanisms do not conflict — they compose. A node with consent `GRANTED`, high SVAF mood weight, and 50% mood influence gate will: accept coupling (Layer 2), strongly weight mood in signal evaluation (Layer 4), and blend 50% of the accepted mesh mood into local state (Layer 7).

Consent overrides everything below it. If consent is `SUSPENDED`, SVAF evaluation never runs and the mood influence gate receives nothing — regardless of their settings. This is by design: consent is the safety mechanism. SVAF and the influence gate are the intelligence mechanisms.

**Domain-specific control mechanisms.** BCI implementations MAY enforce additional hardware-level control mechanisms (e.g., charge-limit enforcement, ≤30 μC/cm² per phase) that operate as a continuous bound independent of both consent (binary gate) and SVAF (per-field weights). These mechanisms are domain-specific and outside MMP scope, but implementers SHOULD document how they compose with the three protocol-level control mechanisms above. If domain-specific mechanisms require protocol-level coordination in the future, they SHOULD be defined as separate MMP extensions following the extension mechanism in [MMP Section 15](https://sym.bot/spec/mmp/extensions).

Implementations SHOULD expose the mood influence gate as a user-facing control (slider, percentage). Implementations SHOULD NOT expose consent state as a routine user control — it is a safety and privacy mechanism, not a preference.

---

## 8. Brain-Computer Interface Considerations

The consent primitive was designed with BCI safety requirements as the hardest constraint. The following considerations apply to implementations interfacing with biological neural systems:

**Biological sovereignty.** A biological node interfaces with a human brain. The human's withdrawal of consent is absolute. No coupling decision, no drift threshold, no peer state may override it. The consent primitive is the protocol-level expression of this principle.

**Hardware-level isolation.** In BCI implementations, consent withdrawal SHOULD trigger hardware-level isolation (e.g., sealed fields, DMA barriers) in addition to protocol-level teardown. The protocol defines the semantics; the hardware enforces the physics.

**Stimulation channel lockout.** For bidirectional BCI implementations, consent withdrawal SHOULD trigger stimulation channel lockout in addition to coupling cessation. The protocol defines coupling semantics; hardware safety layers enforce stimulation isolation. Implementations targeting bidirectional BCI MUST document how `consent-withdraw` maps to their stimulation safety mechanism.

**Consent sovereignty.** In MMP, all nodes — biological and artificial — have equal capability to evaluate, reject, and withdraw. The consent primitive is symmetric by design. In BCI contexts, implementations MUST ensure that the biological node's withdrawal cannot be overridden, delayed, or circumvented by any system-initiated decision. The human behind the biological node has absolute authority over withdrawal — this is the protocol-level expression of cognitive liberty (Ienca & Andorno, 2017).

**Epoch synchronisation.** Real-time BCI implementations with synchronised scheduling SHOULD use the `epoch` field to coordinate withdrawal timing across peers. MMP defines the frame; the real-time kernel enforces the deadline.

---

## 9. Division of Responsibility

The consent primitive separates **what** withdrawal means from **when** it completes:

| Concern | Defined by | Enforced by |
|---|---|---|
| Withdrawal semantics | This extension | Protocol implementation |
| Frame format and field semantics | This extension | Protocol implementation |
| Timing guarantee (WCET) | Implementation | Execution environment (OS / kernel) |
| Hardware isolation | Implementation | Hardware (sealed fields, DMA barriers) |
| Stimulation lockout | Implementation | Hardware safety layer |
| Consent state persistence | Implementation | Non-volatile storage |

MMP defines what withdrawal means semantically. The execution environment guarantees when it completes physically. This separation allows the same consent spec to be implemented across general-purpose operating systems (soft real-time), mobile platforms (best-effort), and real-time kernels (hard real-time with bounded WCET).

---

## 10. Conformance

### 10.1 General Conformance

An implementation claiming conformance with this extension MUST:

1. Implement the three consent frame types (`consent-withdraw`, `consent-suspend`, `consent-resume`).
2. Maintain per-peer consent state (`granted` / `suspended` / `withdrawn`).
3. Enforce local withdrawal before notification (steps 1, 3–4 before steps 5–6 in Section 5.1).
4. Check consent state before any coupling evaluation (Section 6.2).
5. Filter cognitive frames during `SUSPENDED` state (Section 3.2, Section 6.1).
6. Handle duplicate consent frames as no-ops (Section 4.2).
7. Treat connection loss during `SUSPENDED` as `WITHDRAWN` (Section 4.2).
8. Silently ignore consent frames if the extension is not supported (forward compatibility per [MMP Section 7](https://sym.bot/spec/mmp/frames)).
9. Document worst-case enforcement latency.

### 10.2 Safety-Critical Conformance

Implementations targeting safety-critical domains (BCI, medical, autonomous systems) MUST additionally:

10. Persist consent state to non-volatile storage before notification (Section 5.4).
11. Prevent auto-reconnect to previously `WITHDRAWN` peers after power-cycle (Section 5.4).
12. Document the failure mode when persistence is unavailable (Section 5.4).
13. Document stimulation lockout mapping for bidirectional BCI (Section 8), if applicable.

---

## 11. Change Log

| Version | Date | Changes |
|---|---|---|
| 0.1.0 | 2026-03-28 | Initial specification. State machine, enforcement sequence, frame specification, BCI considerations, timing contracts. Reason code registry. Sub-millisecond timestamps. Power-cycle persistence. Relay interaction. Stimulation channel lockout. Safety-critical conformance tier. |

---

## 12. References

- **[MMP]** Xu, H. (2026). [Mesh Memory Protocol Specification v0.2.0](https://sym.bot/spec/mmp). SYM.BOT Ltd.
- **[RFC 2119]** Bradner, S. (1997). Key words for use in RFCs to Indicate Requirement Levels. IETF.
- **[IEC 60601-1]** IEC 60601-1:2005+A2:2020. Medical electrical equipment — General requirements for basic safety and essential performance. IEC.
- **[IEC 62304]** IEC 62304:2006+A1:2015. Medical device software — Software life cycle processes. IEC.
- **[ISO 14971]** ISO 14971:2019. Medical devices — Application of risk management to medical devices. ISO.
- **[IEC 61508]** IEC 61508:2010. Functional safety of electrical/electronic/programmable electronic safety-related systems. IEC.
- **[Yuste 2017]** Yuste, R. et al. (2017). Four ethical priorities for neurotechnologies and AI. *Nature*, 551, 159–163.
- **[Ienca 2017]** Ienca, M. & Andorno, R. (2017). Towards new human rights in the age of neuroscience and neurotechnology. *Life Sciences, Society and Policy*, 13(1), 5.
- **[AxonOS]** AxonOS. Real-Time OS for Brain-Computer Interfaces. [axonos.org](https://axonos.org).

---

## Acknowledgements

The consent primitive was developed through technical exchange between SYM.BOT Ltd and [AxonOS](https://axonos.org). The BCI safety requirements, real-time enforcement constraints, stimulation channel lockout requirements, reason code registry design, sub-millisecond timestamp precision, elevated heartbeat thresholds for SUSPENDED state, power-cycle persistence ordering, and the insight that hardware-level isolation requires a protocol-level equivalent originated from AxonOS's Cognitive Hypervisor architecture and their field-by-field review against a working BCI implementation. The protocol design, frame specification, and placement within the MMP layer stack are by SYM.BOT Ltd.

---

*© 2026 SYM.BOT Ltd. Specification text licenced under CC BY 4.0.*
