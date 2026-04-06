# Mesh Memory Protocol (MMP) Specification

**A Mesh Protocol for Collective Intelligence**

| Field | Value |
|---|---|
| Version | 0.2.2 |
| Status | Published |
| Date | 6 April 2026 |
| Author | Hongwei Xu <hongwei@sym.bot> |
| Organisation | SYM.BOT Ltd |
| Canonical URL | https://sym.bot/spec/mmp |
| Licence | CC BY 4.0 (specification text); Apache 2.0 (reference implementations) |

---

## Introduction

AI agents today run in isolation. They share data through message buses, API calls, or shared databases -- but they do not think together. A coding agent, a music agent, and a fitness agent serving the same user each see their own domain. No single agent connects "commits slowing" + "tracks skipped" + "3 hours without movement" into "the user is fatigued." That insight requires collective intelligence -- and no existing protocol provides it.

The Mesh Memory Protocol (MMP) defines how autonomous AI agents discover each other, exchange cognitive state, evaluate incoming signals for per-field relevance, and remix each other's observations into new understanding -- without servers, without central coordination, and without sharing raw data. Memory is not copied between agents. It is remixed: each agent processes incoming signals through its own domain intelligence and produces something new.

MMP operates over TCP on local networks and WebSocket for internet relay, with length-prefixed JSON as the canonical wire format. Discovery uses DNS-SD (Bonjour) with zero configuration. The protocol is specified across 8 layers -- from identity and transport (Layers 0-3) to cognitive coupling via SVAF (Symbolic-Vector Attention Fusion, the per-field evaluation engine at Layer 4), synthetic memory, and per-agent neural networks (Layers 5-7). Together, the upper layers form Mesh Cognition: a closed loop where agents reason on the growing remix graph of immutable Cognitive Memory Blocks.

## Status of This Document

This is a published specification. It reflects the protocol as implemented in the reference implementations (SYM Node.js and SYM Swift). The specification is versioned. Breaking changes increment the minor version; non-breaking additions increment the patch version.

Feedback and errata: spec@sym.bot or github.com/sym-bot/sym/issues.

## Change Log

| Version | Date | Changes |
|---|---|---|
| 0.2.2 | 2026-04-06 | Feedback Neuromodulation: validator-authority CMBs with per-field reasoning modulate SVAF coupling weights and CfC temporal adaptation -- the mesh learns from human judgment through the same cognition loop, not a separate feedback channel. Normative requirements for feedback CMB content. Directive feedback CMBs for domain knowledge injection without requiring a parent ticket. Neuroscience grounding: dopaminergic prediction error model with per-field direction and τ-modulated adaptation rate. |
| 0.2.1 | 2026-04-02 | Node model: every autonomous agent MUST be a full peer node with own identity, coupling engine, and memory store. SVAF band-pass evaluation: four-class model (redundant/aligned/guarded/rejected) with per-field redundancy detection. CMB lifecycle: observed/remixed/validated/canonical/archived with anchor weight progression. Semantic encoder SHOULD for SVAF drift computation. Handshake adds version and extensions fields. Error frame type. |
| 0.2.0 | 2026-03-27 | Formal specification published. 8-layer architecture. CAT7 CMB schema with lineage (parents + ancestors). SVAF per-field evaluation. Wire format normatively specified. Error frame. Frame type registry. Extension mechanism. JSON Schema. Connection state machine. Wire examples. |
| 0.1.0 | 2025-08-01 | Initial protocol design (Consenix Labs Ltd). 4-layer architecture. Scalar drift evaluation. |

## Licence

This specification is published under the Creative Commons Attribution 4.0 International Licence (CC BY 4.0). You may share, adapt, and build upon this specification for any purpose, including commercial use, provided you give appropriate credit.

The reference implementations are published under the Apache Licence 2.0.

Mesh Memory Protocol, MMP, SYM, and related marks are trademarks of SYM.BOT Ltd.

---

## 1. Conventions and Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

| Term | Definition |
|---|---|
| Node | A participant in the mesh. Every node has a unique identity, its own coupling engine, and its own memory store. Cognitive nodes run their own LNN; relay nodes forward frames without cognitive processing. |
| Peer | A transport-layer relationship: another node that this node has an active connection with and has completed a handshake. Cognitive coupling is agent-to-agent, not peer-to-peer -- SVAF evaluates content independently of transport state. |
| Frame | A single protocol message: a length-prefixed JSON object sent over a transport connection. |
| CMB | Cognitive Memory Block -- a structured memory unit with 7 typed semantic fields (CAT7 schema). See Section 8. |
| Drift | A scalar measure of cognitive distance between two nodes or between a signal and local state. Range [0, 1]. |
| Coupling | The process by which a node evaluates incoming signals (SVAF per-field evaluation) and blends its local cognitive state with other agents' state, weighted by drift and confidence. |
| SVAF | Symbolic-Vector Attention Fusion -- per-field content-level evaluation of incoming memory signals. See Section 9. |
| Synthetic Memory | Layer 5 -- derived knowledge generated by the agent's LLM reasoning on the remix subgraph, encoded into CfC-compatible hidden state vectors. |
| Remix | When an agent processes a CMB through its domain intelligence and produces a NEW CMB with lineage pointing to the original. The original is remixed, not copied. |
| Lineage | Each CMB carries parents (direct) and ancestors (full ancestor chain). Ancestors enable any agent in the remix chain to trace its contribution. |
| Mesh Cognition | The agent's LLM reasoning on the remix subgraph of CMBs -- traced via lineage ancestors -- to generate understanding that the agent's previous state of mind didn't have. Spans Layers 4-7. See Section 2.5. |
| xMesh | Layer 6 -- each agent's own Liquid Neural Network (LNN). Evolves continuous-time cognitive state from Synthetic Memory input. Fast τ neurons track mood; slow τ neurons preserve domain expertise. |
| CfC | Closed-form Continuous-time neural network (Hasani et al., 2022). The LNN architecture used in xMesh. Hidden state evolves through learned time-dependent interpolation gates. |

---

## 2. Architecture Overview

MMP is an 8-layer protocol stack. Each layer has a defined responsibility. Implementations MUST implement Layers 0-3 to participate in the mesh. Layers 4-7 (Mesh Cognition) are SHOULD for full cognitive participation and MAY be omitted for relay-only nodes.

### 2.1 Layer Stack

**Mesh Cognition (Layers 4-7)**

| Layer | Name | Description | Detail |
|---|---|---|---|
| 7 | APPLICATION | Domain Agents -- Music, Code, Fitness, Robotics, BCI | Where agents live and their LLMs reason on the remix subgraph. Mesh Cognition happens here. |
| 6 | xMesh | Per-Agent LNN -- Continuous-Time Cognitive State | Each agent runs its own Liquid Neural Network. Fast neurons track mood; slow neurons preserve domain expertise. Hidden state (h₁, h₂) is exchanged via state-sync. |
| 5 | SYNTHETIC MEMORY | LLM-Derived Knowledge from Remix Subgraph → CfC | The bridge between reasoning (LLM) and dynamics (LNN). Encodes derived knowledge into CfC-compatible hidden state vectors. |
| 4 | COUPLING | Drift · SVAF Per-Field Evaluation · Consent | The gate. SVAF evaluates each of 7 CMB fields independently. Consent primitive enables withdrawal. Nothing enters cognition without passing this layer. |

**Protocol Infrastructure (Layers 0-3)**

| Layer | Name | Description | Detail |
|---|---|---|---|
| 3 | MEMORY | L0 Events · L1 Structured (CMBs) · L2 Cognitive | Three memory tiers with graduated disclosure. L0 stays local. L1 is gated by SVAF. L2 is exchanged via state-sync. |
| 2 | CONNECTION | Handshake · State-Sync · Gossip · Wake · Consent | Connection lifecycle: discover, connect, handshake, heartbeat, gossip node metadata, wake sleeping nodes. |
| 1 | TRANSPORT | IPC · TCP/Bonjour · WebSocket · APNs Push | Length-prefixed JSON over TCP (LAN), WebSocket (relay), IPC (local). Zero configuration discovery via DNS-SD. |
| 0 | IDENTITY | nodeId · name · cryptographic keypair | Persistent UUID per node. Never changes. The foundation everything else builds on. |

### 2.2 Design Principles

**No servers** -- There is no mesh without agents. Agents are the mesh. No central server, no orchestrator, no master node. Every participant is an autonomous agent -- a full node with its own identity, coupling engine, and memory.

**Cognitive autonomy** -- Each agent evaluates, reasons, and acts independently. The mesh influences but never overrides. Coupling is a suggestion, not a command.

**Memory is remixed, not shared** -- Agents don't copy each other's memory. They remix it -- process it through their own domain intelligence and produce something new. The original is immutable. The remix is a new CMB with lineage.

**Per-field evaluation** -- A signal is not accept-or-reject as a whole. SVAF evaluates each of 7 semantic fields independently. A signal with relevant mood but irrelevant focus is partially accepted -- not ambiguously scored.

**LLM reasons, LNN evolves** -- Two cognitive components per agent. The LLM (Layer 7) traces lineage ancestors and reasons on the remix subgraph -- generating understanding. The LNN (Layer 6) evolves continuous-time state from that understanding. Neither alone is sufficient.

**The graph is the intelligence** -- Intelligence is not in any single agent or model. It is in the growing DAG of remixed CMBs connected by lineage. Each cycle, the graph grows. Each agent understands more than it did before.

### 2.3 What Makes MMP Different

| Dimension | Message Bus | Shared Memory | Federated Learning | MMP |
|---|---|---|---|---|
| What flows | Messages | Shared state | Gradients | Remixed CMBs + hidden state |
| Evaluation | Topic routing | None (all shared) | Aggregation | Per-field SVAF (7 dimensions) |
| Intelligence | None | Central model | Better model | LLM reasons on remix graph |
| Coupling time | Request-response | Real-time (shared) | Offline (training) | Inference-paced (continuous) |
| Coordination | Central broker | Central store | Central aggregator | Agent-to-agent (no centre) |
| Memory | Fire and forget | Mutable shared | Model weights | Immutable CMBs with lineage |
| New agent joins | Subscribe to topics | Access shared store | Join training round | Define α_f weights, connect |

### 2.4 Node Model

Every participant is a **node**. There is no architectural distinction between a "server" and a "client." Every agent that participates in coupling MUST be a full peer node with its own identity, its own coupling engine, and its own memory store. This is not an implementation convenience -- it is a protocol requirement. An agent that shares another node's identity cannot have its own field weights, its own coupling decisions, or its own remix lineage. Coupling is per-node. Therefore agents MUST be nodes.

The mesh is agent-to-agent, not device-to-device. Cognitive coupling -- SVAF evaluation, state blending, remix lineage -- is always between individual agents. A device is not a node. An agent is a node.

```
MacBook
  sym-daemon      (node: always-on mesh hub, relay bridge)
  coo-agent       (node: own identity, own coupling, own memory)
  research-agent  (node: own identity, own coupling, own memory)
  marketing-agent (node: own identity, own coupling, own memory)
  product-agent   (node: own identity, own coupling, own memory)

iPhone
  MeloTune        (node: own identity, own coupling, own memory)
  MeloMove        (node: own identity, own coupling, own memory)

Cloud
  relay           (node: forwards frames, no cognitive processing)
```

Nodes discover each other via DNS-SD (Bonjour) on the local network and connect via WebSocket relay for internet connectivity. Each node maintains its own peer list, coupling state, and CMB store. No node depends on another node's process to function.

### 2.5 The Mesh Cognition Loop

Mesh Cognition is a closed loop connecting all layers. Each cycle, the remix graph grows and every agent understands more than it did before:

1. **SVAF evaluates inbound CMB per field** -- Layer 4 -- per-field drift, α_f weights, accept / guard / reject
2. **Accepted → remixed CMB with lineage** -- Layer 3 -- new immutable CMB, parents + ancestors
3. **LLM traces ancestors, reasons on remix subgraph** -- Layer 7 -- what happened, why, what it means for my domain
4. **Synthetic Memory encodes derived knowledge** -- Layer 5 -- LLM output → CfC hidden state (h₁, h₂)
5. **LNN evolves cognitive state** -- Layer 6 -- fast τ (mood) synchronise, slow τ (domain) stay sovereign
6. **State blended with peers** -- Per-neuron, τ-modulated, inference-paced
7. **Agent acts → new CMB with lineage.ancestors** -- Response informed by derived knowledge, not just own observation
8. **Broadcast to mesh → other agents remix it** -- Graph grows. Next cycle starts. Each agent learns.

↻ closed loop -- graph grows, agents learn, mesh thinks

### 2.6 Key Architectural Decisions

**Why no pub/sub topics?** -- The coupling engine evaluates relevance per field autonomously. Topics would second-guess autonomous coupling. Adding a new agent type requires no topic configuration -- just α_f weights.

**Why no consensus protocol?** -- There is no "correct" global state -- only convergent local states. Each node is self-producing (autopoietic). Consensus is unnecessary and would introduce coordination overhead.

**Why immutable CMBs?** -- CMBs are broadcast across nodes -- multiple copies exist. If remix required mutating the original, every copy would need updating. Immutability means no distributed state problem. Lineage is computed from the graph, not stored on parents.

**Why per-agent LNNs, not a central model?** -- The mesh IS the agents. A central model creates a single point of failure, requires all data to flow to one place, and cannot reason through each agent's domain lens. Per-agent LNNs preserve autonomy and scale linearly.

**Why does the LLM reason, not the LNN?** -- The LNN processes temporal patterns but cannot reason about WHY a chain of remixes happened. The LLM can. Ancestors provide the endpoints. The LLM provides the reasoning. The LNN provides the dynamics. Both are needed.

---

## 3. Layer 0: Identity

Identity is the foundation of the mesh. Each node MUST have a persistent, globally unique identity that other nodes can verify. Without stable identity, coupling decisions, lineage chains, and wake protocols cannot function.

### 3.1 Node Identity

| Field | Type | Requirement | Description |
|---|---|---|---|
| `nodeId` | UUID v7 | MUST | Globally unique, time-ordered, generated at first launch, persisted across sessions (RFC 9562) |
| `name` | string | MUST | Human-readable display name (UTF-8, 1-64 bytes, printable characters only) |
| `keypair` | Ed25519 | MUST | Cryptographic identity for message signing, peer verification, and key exchange |

#### 3.1.1 nodeId

The `nodeId` MUST be a UUID v7 as defined in RFC 9562. UUID v7 encodes a Unix timestamp in the high bits, providing natural time-ordering while retaining 74 bits of randomness for global uniqueness. This aids debugging, log correlation, and conflict resolution without revealing device identity.

The `nodeId` MUST NOT change during the lifetime of a node installation. If a node is uninstalled and reinstalled, a new nodeId is generated -- the node is a new identity on the mesh. Peers that tracked the old nodeId will not recognise it.

On the wire, the nodeId MUST be encoded as a lowercase hexadecimal string with hyphens (e.g., `0192e4a2-7b5c-7def-8a3b-9c4d5e6f7a8b`). Implementations MUST use case-insensitive comparison when matching nodeIds. Existing nodes with UUID v4 identities MAY continue to use them -- peers MUST accept both v4 and v7 formats.

#### 3.1.2 name

The `name` field MUST be valid UTF-8, between 1 and 64 bytes inclusive. The name MUST contain only printable characters (Unicode categories L, M, N, P, S, and Zs). Control characters (U+0000-U+001F, U+007F-U+009F), null bytes, and lone surrogates MUST NOT appear. The name is not required to be unique -- nodeId is the sole unique identifier. The name is for human display only and MUST NOT be used for peer identification or routing.

**Naming convention.** When multiple nodes share the same functional role, implementations SHOULD scope the name to distinguish them. The scoping strategy is implementation-defined. Common patterns include device scope (`coo-mbp1`), platform scope (`coo-mac`), organisational scope (`coo-acme`), or environment scope (`coo-prod`). The protocol does not prescribe a scoping scheme -- only that names are human-distinguishable within the mesh. Nodes with unique roles MAY use bare names (`product`, `marketing`). The name MUST NOT contain `@` -- the `@` character is reserved for future use.

#### 3.1.3 keypair

Each node MUST generate an Ed25519 keypair (RFC 8032) at first launch and persist it alongside the nodeId. The keypair serves three functions:

- **Peer verification** -- the public key MUST be included in the handshake frame. Peers SHOULD challenge the node to sign a nonce to prove possession of the private key.
- **Key exchange** -- Ed25519 keys are converted to X25519 for Diffie-Hellman shared secret derivation, used for end-to-end CMB encryption (Section 17.2.1).
- **Message signing** -- implementations MAY sign CMBs and other frames for tamper detection.

The public key MUST be encoded as base64url (RFC 4648 Section 5) in all wire formats (handshake frames, DNS-SD TXT records). The private key MUST NOT leave the node.

### 3.2 One Agent, One Node

Every autonomous agent MUST be a full peer node with its own nodeId, its own coupling engine, and its own memory store.

This follows directly from the protocol design: SVAF field weights (α_f) are per-node, coupling state is per-node, and memory stores are per-node. An agent that shares another node's identity inherits that node's coupling decisions and cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent need different field weights, different coupling thresholds, and different memory stores. They MUST be separate nodes.

Multiple nodes MAY run on the same device. Each maintains its own identity file, discovers peers via DNS-SD, and connects via TCP (LAN) or WebSocket (relay). Nodes on the same device discover each other the same way nodes on different devices do -- there is no special local path.

### 3.3 Identity Persistence

Implementations MUST persist the nodeId, name, and keypair to stable storage at first launch. The storage location and format are implementation-defined. Reference implementations use `~/.sym/nodes/<name>/identity.json` (Node.js) and `UserDefaults` (Swift/iOS).

Implementations SHOULD store a creation timestamp alongside the identity for diagnostic purposes. Implementations SHOULD store the machine hostname for display in peer lists, but the hostname MUST NOT be used for identity or routing.

### 3.4 Identity Lifecycle

A node's identity is created once and persists until the node is uninstalled. The following lifecycle events are defined:

| Event | Action | Consequence |
|---|---|---|
| First launch | Generate nodeId (UUID v7), keypair (Ed25519), persist | New identity on the mesh |
| Restart / reboot | Load from stable storage | Same identity, peers recognise it |
| Uninstall + reinstall | Generate fresh identity | New identity; old peers do not recognise it |
| Key compromise | Generate fresh identity | Old nodeId abandoned; treated as new node |
| Clone detection | Duplicate nodeId rejected (error 1005) | Second connection closed; first connection remains |

MMP does not define an identity rotation or revocation mechanism in v0.2.0. Compromised nodes MUST generate a fresh identity (new nodeId and keypair). The old identity becomes permanently orphaned. Implementations SHOULD document this limitation to operators.

### 3.5 Node Lifecycle Role

Each node has a `lifecycleRole` that determines which CMB lifecycle transitions it may perform. The role is bound to the node's cryptographic identity (nodeId + keypair) and MUST be declared in the handshake frame.

| Role | Default | May produce | May advance lifecycle to |
|---|---|---|---|
| observer | Yes | CMBs (observed), remixes | observed, remixed |
| validator | No | CMBs, remixes, validation CMBs | observed, remixed, **validated** |
| anchor | No | CMBs, remixes, validation CMBs, canonization CMBs | observed, remixed, validated, **canonical** |

A node with `lifecycleRole: observer` (the default) MUST NOT produce CMBs that advance another CMB's lifecycle to `validated` or `canonical`. Receiving nodes MUST verify that a validation CMB's `createdBy` matches a node whose handshake declared `validator` or `anchor` role. Validation CMBs from observer nodes MUST be ignored for lifecycle advancement (the CMB itself is still stored as a normal remix).

#### 3.5.1 Role Progression

Lifecycle roles are not static. An observer node MAY be promoted to validator by an existing validator or anchor node. Promotion is a protocol frame, not an out-of-band configuration change.

| Transition | Granted by | Conditions |
|---|---|---|
| observer → validator | Existing validator or anchor | Node has produced CMBs that were remixed by peers (demonstrated quality). Granting node sends `role-grant` frame. |
| validator → anchor | Existing anchor | Node has validated CMBs that reached canonical state. Track record of quality validation. |
| Bootstrap | Self-declared | The first node in a mesh MAY self-declare as validator or anchor. Subsequent nodes MUST be promoted by existing validators. |

Role progression is monotonically upward: observer → validator → anchor. Demotion is not defined in v0.2.1. A compromised validator MUST generate a fresh identity (Section 3.4) and re-earn its role.

The `role-grant` frame carries the granting node's signature over the promoted node's nodeId and new role. Receiving nodes SHOULD verify the signature against the granting node's public key from the handshake. This prevents role spoofing without requiring a central authority.

### Q&A

**Why UUID v7 instead of v4?** -- UUID v7 (RFC 9562) provides the same global uniqueness and privacy properties as v4, with an additional benefit: time-ordering. The embedded timestamp aids log correlation, debugging, and determining which node was created first -- without revealing device identity. The 74 random bits provide sufficient collision resistance for any practical mesh size.

**Why not use the public key hash as the nodeId?** -- Self-certifying identifiers (nodeId = hash of public key) are elegant but create a hard coupling between identity and key material. If the keypair needs rotation (algorithm upgrade, key compromise), the nodeId must also change, breaking all peer references and lineage chains. Separating nodeId from keypair allows future key rotation without identity disruption.

**Why must every agent be its own node?** -- Coupling is per-node. SVAF field weights (αf) are per-node. Memory stores are per-node. An agent that shares another node's identity inherits that node's coupling decisions -- it cannot independently evaluate incoming signals through its own domain lens. A research agent and a marketing agent on the same device need different field weights, different coupling thresholds, and different memory stores. They must be separate nodes.

**What happens when two nodes have the same nodeId?** -- The connection state machine rejects duplicate nodeIds (error code 1005). The second connection is closed. This prevents impersonation and ensures each nodeId maps to exactly one active node.

**Why is Ed25519 mandatory?** -- Without cryptographic identity, any node can claim any nodeId. A relay could impersonate peers (MITM), and peer gossip (Section 5.6) would propagate unverified claims. For autonomous AI agents making coupling decisions, authenticated identity is foundational -- not optional.

**Why are lifecycle roles identity-bound, not content-based?** -- If validation authority were determined by content (e.g. perspective field containing "founder"), any agent could spoof it. Binding roles to cryptographic identity means only nodes that have been explicitly promoted by existing validators can advance CMB lifecycle. The mesh knows who validated, not just what was said.

**Why is role progression earned, not configured?** -- An agent that produces quality remixes -- remixes that other agents cite and build upon -- has demonstrated value to the mesh. Granting validation authority to such agents is a natural extension of their demonstrated competence. This prevents arbitrary role assignment and creates a meritocratic trust hierarchy that emerges from mesh activity.

**Can an observer node dismiss a decision?** -- An observer can produce a CMB with lineage pointing to a decision, but receiving nodes MUST NOT treat it as validation. The CMB is stored as a normal remix -- it does not advance the parent CMB's lifecycle. Only validator or anchor nodes can validate or dismiss decisions in a way that removes them from the decision queue.

---

## 4. Layer 1: Transport

### 4.1 Wire Format

Frames are length-prefixed JSON over TCP. Each frame consists of:

```
+-------------------+---------------------------+
| 4 bytes           | N bytes                   |
| UInt32BE (length) | UTF-8 JSON payload        |
+-------------------+---------------------------+
```

- The length field is a 4-byte big-endian unsigned 32-bit integer encoding the byte length of the JSON payload.
- Implementations MUST reject frames with length 0 or length exceeding 1,048,576 bytes (1 MiB). Rejection MUST close the transport connection.
- The JSON payload MUST be a valid JSON object with a `type` field (string). Frames that fail JSON parsing or lack a `type` field MUST be silently discarded.
- Implementations MUST handle partial reads (TCP stream reassembly).
- Implementations MUST silently ignore frames with unrecognised `type` values (forward compatibility).

### 4.2 Wire Examples

Handshake frame:

```
Length prefix: 00 00 00 57 (87 bytes)
Payload:
{
  "type": "handshake",
  "nodeId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "name": "my-agent",
  "version": "0.2.0",
  "extensions": []
}
```

Ping frame:

```
Length prefix: 00 00 00 11 (17 bytes)
Payload: {"type":"ping"}
```

CMB frame:

```json
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

### 4.3 TCP Transport (LAN)

The primary LAN transport. Nodes MUST listen on a TCP port and advertise it via DNS-SD (Section 5.1). Connection timeout MUST be no longer than 10,000 ms.

### 4.4 WebSocket Relay Transport (WAN)

For nodes not on the same LAN, a relay node forwards frames. Relay frames are JSON envelopes over WebSocket: `{ "to": "<nodeId>", "payload": <frame> }`. The relay MUST NOT inspect or modify the payload. The relay is a peer, not a server -- any always-on node MAY serve as a relay.

### 4.5 IPC Transport (Local)

Local tools MAY connect to a node via IPC (Unix domain socket, named pipe, or localhost TCP) to query mesh state. The framing is identical to TCP transport. IPC is an implementation convenience for local tooling (dashboards, CLI, monitoring) -- it is not a substitute for peer-to-peer transport. Agents that participate in coupling MUST connect as full peer nodes via TCP or WebSocket.

Implementations MUST support a persistent IPC socket at a well-known path. The socket MUST accept multiple simultaneous connections. Each IPC connection SHOULD remain open for the lifetime of the client application -- short-lived connections (one query, then disconnect) are permitted but SHOULD be avoided by applications that query frequently.

Well-known IPC path: `~/.sym/daemon.sock` (Unix domain socket) or `localhost:19517` (TCP fallback).

### 4.6 Multi-Transport Per Peer

A peer MAY be reachable via multiple transports simultaneously (e.g. LAN TCP + WAN relay). Implementations MUST support maintaining multiple active transports for the same peer and select the highest-priority healthy transport for sending:

| Priority | Transport | Rationale |
|---|---|---|
| 1 (highest) | TCP (LAN) | Lowest latency, no intermediary, no cloud dependency |
| 2 | WebSocket Relay (WAN) | Cross-network, higher latency, relay dependency |
| 3 (lowest) | Wake (push) | Last resort -- wake the peer, then connect via 1 or 2 |

When a node receives an inbound connection from a peer that is already connected via a different transport, it MUST NOT reject the new connection. Instead it MUST add the new transport as a secondary path. Frames SHOULD be sent via the highest-priority healthy transport.

A transport is **healthy** if it has received a frame (including `pong`) within the heartbeat timeout (Section 5.4). An unhealthy transport SHOULD be closed after the timeout. The peer is only removed (peer-left event) when **all** transports for that peer are closed -- not when a single transport drops.

This enables graceful failover: if a relay drops, the LAN transport continues. If LAN drops, the relay takes over. The peer remains connected throughout -- only the active transport changes.

### Q&A

**Why must each agent run its own transport?** -- Coupling is per-node. SVAF field weights (αf) are per-node. Memory stores are per-node. An agent that shares another node's transport and identity cannot have independent coupling decisions. Multiple agents on the same device each run their own Bonjour advertisement, relay connection, and TCP listener. They discover each other the same way agents on different devices do -- there is no special local path.

**Is the resource cost of N agents acceptable?** -- N agents on one device means N Bonjour advertisements and N relay connections. For small N (4-8 agents), this is well within OS limits. Bonjour is designed for many services per host. Relay WebSocket connections are lightweight. The protocol correctness benefit (per-agent coupling) outweighs the marginal resource cost.

---

## 5. Layer 2: Connection

### 5.1 Discovery

Nodes MUST advertise via DNS-SD with service type `_sym._tcp` in the `local.` domain. The instance name MUST be the node's nodeId.

TXT record fields:

| Key | Required | Value |
|---|---|---|
| `node-id` | MUST | Node UUID |
| `node-name` | MUST | Human-readable name |
| `public-key` | MUST | Ed25519 public key (base64url, RFC 4648 Section 5) |
| `hostname` | SHOULD | Machine hostname |

To prevent duplicate connections, the node with the lexicographically smaller nodeId MUST initiate the outbound TCP connection. The other node MUST NOT initiate.

### 5.2 Handshake

Upon connection, both sides MUST exchange the following frames in order:

```
1. handshake    { type: "handshake", nodeId: "<uuid>", name: "<name>",
                  publicKey: "<base64url>", version: "0.2.0", extensions: [] }
2. state-sync   { type: "state-sync", h1: [...], h2: [...], confidence: 0.8 }
3. peer-info    { type: "peer-info", peers: [...] }           [if known]
4. wake-channel { type: "wake-channel", platform, token, env } [if configured]
```

- The `version` field MUST be the MMP specification version the node implements (e.g., `"0.2.0"`). Nodes SHOULD accept peers with the same major version. Nodes MAY reject peers with incompatible versions.
- The `extensions` field SHOULD list supported protocol extensions (e.g., `["consent-v0.1"]`). Nodes MUST ignore unrecognised extensions.
- The inbound node MUST wait for a `handshake` frame as the first frame. If any other frame type arrives first, or no handshake arrives within 10,000 ms, the connection MUST be closed.
- If a node receives a handshake with a nodeId that is already connected via the **same transport type**, the new connection MUST be closed (duplicate guard). If the existing connection uses a **different transport type** (e.g. peer connected via relay, new connection via LAN TCP), the new connection MUST be accepted as a secondary transport per Section 4.6.

### 5.3 Connection State Machine

```
DISCONNECTED (initial state)
    │
    │  TCP connect / accept
    ▼
AWAITING_HANDSHAKE (10s timeout)
    │
    │  valid handshake received
    ▼
CONNECTED (peer registered, frames routed)
    │
    │  timeout / close / consent-withdraw
    ▼
DISCONNECTED (peer removed, re-discover)
```

| From | To | Trigger |
|---|---|---|
| DISCONNECTED | AWAITING_HANDSHAKE | TCP connect or accept |
| AWAITING_HANDSHAKE | CONNECTED | Valid handshake within 10,000 ms |
| AWAITING_HANDSHAKE | DISCONNECTED | Timeout, invalid frame, or duplicate nodeId |
| CONNECTED | DISCONNECTED | Heartbeat timeout, TCP close, consent-withdraw, or error |

Implementations MUST NOT process cognitive frames (`cmb`, `state-sync`, `xmesh-insight`) in the AWAITING_HANDSHAKE state.

### 5.4 Heartbeat

Nodes MUST send a `ping` frame to each peer if no frame has been received from that peer within the heartbeat interval (default: 5,000 ms). Upon receiving `ping`, a node MUST respond with `pong`. If no frame is received from a peer within the heartbeat timeout (default: 15,000 ms), the connection MUST be closed.

### 5.5 Connection Loss and Transport Failover

When a transport connection closes unexpectedly (TCP reset, timeout, OS-level close), the node MUST check whether other transports for the same peer are still active (see Section 4.6 Multi-Transport Per Peer).

- **If other transports remain healthy**: the node MUST switch sending to the next highest-priority transport. The peer MUST NOT be removed. No peer-left event is emitted. The node SHOULD log the transport switch.
- **If no transports remain**: the node MUST remove the peer from its coupling engine, discard buffered frames, and emit a peer-left event. The node SHOULD attempt re-discovery via DNS-SD.

Unexpected disconnection of a single transport MUST be treated as a transport-level event, not a peer-level event. The peer is only unreachable when all transport paths are exhausted.

### 5.6 Peer Gossip

After handshake, nodes SHOULD exchange `peer-info` frames containing known peer metadata (nodeId, name, wake channels, last-seen timestamps). This enables transitive peer discovery -- a node that has never been online simultaneously with a sleeping peer can learn its wake channel through gossip from a relay node.

### 5.7 Wake

Nodes MAY register a wake channel (APNs, FCM, or other push mechanism) via the `wake-channel` frame. Peers MAY use this channel to wake a sleeping node when they have a signal to deliver. Wake requests SHOULD be rate-limited (default cooldown: 300,000 ms per peer).

---

## 6. Layer 3: Memory

MMP defines three memory layers with graduated disclosure:

| Layer | Name | Shared | Description |
|---|---|---|---|
| L0 | Events | No | Raw events, sensor data, interaction traces. Local only. |
| L1 | Structured | Via evaluation | Content + tags + source. Shared via `cmb` frames, gated by SVAF (Layer 4). |
| L2 | Cognitive | Via state-sync | CfC hidden state vectors. Exchanged via `state-sync` frames. Input to coupling. |

L0 data MUST NOT leave the node. L1 data MUST be evaluated by SVAF before storage. L2 data is exchanged on every handshake and periodically (default: every 30,000 ms). The `h1` and `h2` vectors in `state-sync` frames MUST have equal dimension. The dimension is implementation-defined (reference implementations use 64). Peers with mismatched dimensions MUST reject the `state-sync` frame and SHOULD log the mismatch.

### 6.1 Storage Interface

Implementations MUST provide a storage interface for L1 CMBs. The SDK SHOULD define a pluggable storage protocol so agents can provide their own backend. The reference implementations provide a default file-based store; agents MAY replace it with any backend that satisfies the interface:

| Method | Access | Description |
|---|---|---|
| write(entry) | Write | Store a CMB created by this agent. Returns nil if duplicate key. |
| receiveFromPeer(peerId, entry) | Write | Store a remixed CMB after SVAF acceptance. |
| search(query) | Read | Keyword search across CMB field texts. |
| recentCMBs(limit) | Read | Most recent CMBs for SVAF fusion anchors. |
| allEntries() | Read | All entries for context building (capped by implementation). |
| count | Read | Total stored CMB count. |
| purge(retentionSeconds) | Write | Remove CMBs older than retention period. MUST preserve CMBs referenced by newer entries' lineage. |

**Read-only agents** (audit, compliance, monitoring): implement write methods as no-ops. The agent observes the remix graph without modifying it. This is valid for agents whose role is to trace provenance, verify lineage integrity, or report on mesh activity.

### 6.2 Storage Backends

The protocol does not prescribe a storage backend. Agents choose based on their platform and requirements:

| Backend | Best for | Notes |
|---|---|---|
| Flat JSON files | CLI agents, daemons, prototyping | Default in reference implementations. Zero dependencies. Content-addressable filenames. |
| CoreData / SwiftData | iOS / macOS apps | Queryable, supports iCloud sync, handles retention via NSBatchDeleteRequest. |
| SQLite | Cross-platform, high volume | Indexed queries, ACID transactions, handles millions of CMBs. |
| Cloud (Supabase, DynamoDB) | Distributed teams, multi-device | Shared audit trail. Consider privacy -- CMB field text is personal data. |
| In-memory | Testing, ephemeral agents | No persistence. Useful for unit tests and short-lived agents. |

### 6.3 Retention

Implementations MUST support configurable retention via `retentionSeconds`. CMBs older than the retention period SHOULD be purged automatically. See Section 18 (Configuration) for per-profile retention defaults.

Purge MUST preserve graph integrity: a CMB referenced by any newer entry's `lineage.ancestors` MUST NOT be deleted, even if past retention age. The remix chain is the audit trail -- breaking it breaks provenance.

Regulated domains (legal, finance, health) MUST set retention according to their compliance requirements. The protocol does not define regulatory retention periods -- consult jurisdiction-specific guidance (MiFID II, SEC Rule 17a-4, HIPAA, GDPR).

### 6.4 CMB Lifecycle

Each CMB progresses through a lifecycle that determines its influence on future SVAF evaluations. The lifecycle is driven by mesh activity -- not by time alone.

| State | Temperature | Trigger | Anchor Weight | Description |
|---|---|---|---|---|
| observed | hot | Agent calls `remember()` | 1.0 | Initial observation. Subject to temporal decay. Active in SVAF fusion. |
| remixed | warm | Peer remixes this CMB (appears in `lineage.parents`) | 1.5 | Another agent found this signal relevant enough to produce new knowledge from it. Higher anchor weight in future SVAF evaluations. |
| validated | warm | Human acts on this CMB (marks decision as done) | 2.0 | A human confirmed this signal by acting on it. The validation CMB carries `lineage.parents` pointing to the validated CMB. Validated knowledge shapes future evaluations more than unvalidated signals. |
| dismissed | cold | Human dismisses this CMB (marks as not actionable) | 0.5 | A human reviewed this signal and rejected it. The dismissal CMB carries `lineage.parents` pointing to the dismissed CMB. Reduced anchor weight -- the human judged this signal not worth acting on. Treated as archived for SVAF purposes. MUST NOT resurface as an actionable decision. |
| canonical | cold | Validated + remixed by 2+ agents | 3.0 | Collective consensus -- multiple agents and a human agree this knowledge is significant. Protected from retention purge. Highest anchor weight. |
| archived | whisper | No remix for `archiveAfterSeconds` (default: 30 days) | 0.5 | No agent has found this signal relevant. Reduced anchor weight but preserved for lineage integrity. MAY be purged if no descendants reference it. |

The lifecycle branches at human judgment: observed → remixed → validated → canonical (upward path) or observed → dismissed (downward path). Dismissal is a terminal state -- a dismissed CMB does not advance to validated or canonical. Without any activity, a CMB decays toward archived. Archived and dismissed CMBs MAY re-emerge if a future remix references them -- re-entry resets the archive timer.

**Validation** is the key transition that connects human judgment to the mesh. When a human acts on agent output (approves a decision, sends an email, completes a task), the action SHOULD be recorded as a new CMB with `lineage.parents` pointing to the CMB that prompted the action. This validation CMB enters the mesh like any other signal -- agents receive it via SVAF and adjust their understanding. The mesh learns from human actions without special API calls or out-of-band configuration updates.

Anchor weight influences SVAF evaluation: when computing per-field drift against local anchors, canonical and validated CMBs contribute more to the fused anchor vector than observed or archived CMBs. This creates a natural hierarchy where human-confirmed knowledge and collective consensus outweigh raw observations -- without overriding agent autonomy. Each agent still evaluates incoming signals through its own field weights.

### 6.5 Validation Authority

The transitions to `validated` and `dismissed` are the most consequential lifecycle events -- they commit human judgment to the mesh. Validation permanently increases anchor weight to 2.0; dismissal reduces it to 0.5. Both transitions MUST be restricted to nodes with appropriate lifecycle roles (Section 3.5).

When a receiving node processes a CMB with `lineage.parents` pointing to an existing CMB, it MUST check the `createdBy` field against the known lifecycle roles of connected peers:

- If `createdBy` matches a node with `lifecycleRole: validator` or `anchor`, the parent CMB advances to `validated` (if the intent indicates action completed) or `dismissed` (if the intent indicates not actionable).
- If `createdBy` matches a node with `lifecycleRole: observer`, the parent CMB advances to `remixed` only. The CMB is stored normally but does not confer validation or dismissal.

This prevents agent-level spoofing of validation authority. An agent cannot self-promote to validator by including "founder" or "validator" in its CMB text fields. The authority is bound to the node's cryptographic identity and the `role-grant` chain from an existing validator (Section 3.5.1).

**Dismiss vs. validate:** These are distinct lifecycle transitions with different consequences.

**Validate** (Done): The human confirmed the signal by acting on it. Parent CMB advances to `validated` (anchor weight 2.0). The validation CMB broadcasts to the mesh -- agents see the human acted, and similar future signals from the same domain gain credibility through higher anchor weight.

**Dismiss** (Not actionable): The human reviewed the signal and rejected it. Parent CMB advances to `dismissed` (anchor weight 0.5). The dismissal CMB broadcasts to the mesh as feedback -- the producing agent receives it and sees its signal was rejected. This creates a feedback loop:

1. Dismissal CMB enters the producing agent's memory via SVAF (it has lineage pointing to the agent's original CMB)
2. The dismissed CMB's reduced anchor weight (0.5) means similar future signals score lower in SVAF evaluation
3. When the agent's LLM next runs `reason()` or `remix()`, the mesh context includes the dismissal -- the LLM sees the reasoning and can adjust its assessment criteria

The effectiveness of this feedback loop depends on the **content quality** of the dismissal CMB. A dismissal that says "not actionable" provides the anchor weight reduction (step 2) but no directional correction (step 3). Dismissal CMBs SHOULD carry per-field reasoning -- see Section 10.7 (Feedback Neuromodulation) and Section 10.8 (Feedback CMB Requirements) for normative content requirements.

Both transitions require validator or anchor role (Section 3.5). Both broadcast to the mesh. The difference is directional: validation increases influence (the mesh learns what humans value), dismissal decreases influence (the mesh learns what humans ignore).

### Q&A

**Why a pluggable storage interface instead of prescribing a backend?** -- Agents run on different platforms with different constraints. A CLI agent on a server uses flat files. An iOS app uses CoreData with iCloud. A compliance agent needs a cloud database with audit logging. The protocol defines what to store and how to query it -- not where to put it.

**Can an agent use read-only storage?** -- Yes. Audit and compliance agents observe the remix graph without modifying it. They implement write methods as no-ops and read from shared storage. This is how regulators trace the decision chain without participating in it.

**What happens when a protected CMB's last descendant is purged?** -- The CMB is no longer protected and will be purged in the next retention cycle. Protection is dynamic -- it follows the live graph, not a static list.

**How does human validation enter the mesh?** -- When a human acts on an agent's output (approves a decision, completes a task), the action is recorded as a new CMB with lineage pointing to the signal that prompted it. This CMB enters the mesh like any other signal -- agents evaluate it through SVAF and adjust their understanding. No special API, no out-of-band config. The mesh learns from human actions through the same channel it learns from agents.

**Why do validated CMBs have higher anchor weight?** -- A human acting on a signal is the strongest confirmation that the signal was correct and actionable. Giving validated CMBs higher anchor weight means future SVAF evaluations are shaped by confirmed knowledge rather than speculation. This does not override agent autonomy -- each agent still applies its own field weights. It means the anchors against which incoming signals are compared are more trustworthy.

**Why must validation authority be identity-bound?** -- If any agent could advance a CMB to validated by producing a CMB with lineage, an agent could dismiss founder decisions or fake human approval. Binding validation to cryptographic node identity (Section 3.5) ensures only explicitly authorised nodes -- the founder's node or promoted agents -- can affect lifecycle transitions. The content of the CMB (perspective, intent) is informational; the authority comes from who created it.

**Can an agent earn validator role automatically?** -- The protocol defines the role-grant mechanism (Section 3.5.1) but does not prescribe automated promotion criteria. An implementation MAY define heuristics (e.g. promote after N remixes cited by peers), but the grant itself MUST come from an existing validator via a signed role-grant frame. This keeps the trust chain auditable.

---

## 7. Frame Types

All frames are JSON objects with a `type` field (string). Implementations MUST silently ignore frames with unrecognised type values to allow forward compatibility.

| Type | Layer | Gated | Fields |
|---|---|---|---|
| `handshake` | 2 | No | nodeId (string), name (string), version (string), extensions (string[]), lifecycleRole (string: observer/validator/anchor) |
| `state-sync` | 2/3 | No | h1 (float[]), h2 (float[]), confidence (float) |
| `cmb` | 3/4 | SVAF | timestamp (int), cmb (object: { key, createdBy, createdAt, fields, lineage }) |
| `message` | 2 | No | from, fromName, content, timestamp |
| `xmesh-insight` | 6 | No | from, fromName, trajectory (float[6]), patterns (float[8]), anomaly (float), outcome (string), coherence (float), timestamp |
| `peer-info` | 2 | No | peers: [{ nodeId, name, wakeChannel?, lastSeen }] |
| `wake-channel` | 2 | No | platform (string), token (string), environment (string) |
| `error` | 2 | No | code (int), message (string), detail? (string) |
| `role-grant` | 0 | No | targetNodeId (string), role (string: validator/anchor), grantedBy (string), signature (string) |
| `ping` | 2 | No | (no additional fields) |
| `pong` | 2 | No | (no additional fields) |

### 7.2 Error Frame

When a node encounters a protocol-level error, it SHOULD send an `error` frame before closing the connection (if applicable). Error frames are informational -- the receiving node MUST NOT treat them as commands.

| Code | Name | Action | Description |
|---|---|---|---|
| 1001 | VERSION_MISMATCH | Close | Peer version is incompatible |
| 1002 | DIMENSION_MISMATCH | Reject frame | h1/h2 vector dimension mismatch |
| 1003 | FRAME_TOO_LARGE | Close | Frame exceeds MAX_FRAME_SIZE |
| 1004 | HANDSHAKE_TIMEOUT | Close | No handshake within deadline |
| 1005 | DUPLICATE_NODE | Close | nodeId already connected |
| 2001 | SVAF_REJECTED | None | Memory-share rejected by SVAF (informational) |
| 2002 | CONSENT_WITHDRAWN | Close | Consent withdrawn by this node |

Codes 1xxx are connection-level (close connection). Codes 2xxx are evaluation-level (informational). Error frames MUST NOT contain sensitive information.

### 7.3 Frame Type Registry

Frame types are identified by their `type` string value. **Core types** (this specification) MUST NOT be redefined by extensions. **Extension types** MUST use `<extension>-<name>` format. **Vendor types** MUST use `x-<vendor>-<name>` format and MUST be silently ignored by non-supporting nodes.

### Q&A

**Why MUST nodes silently ignore unknown frame types?** -- Without this rule, you can never add new features to the protocol. If a node crashes or rejects unknown frame types, then deploying a new extension (like the consent primitive) requires upgrading every node on the mesh simultaneously -- impossible in a peer-to-peer system. Silent ignore means old nodes and new nodes coexist: a node running the consent extension sends consent-withdraw frames, and nodes that don't support consent yet simply ignore them. No crash, no error, the mesh keeps working. When a node adds consent support later, it handles the frame. No coordinated upgrade needed. This is the same principle used by HTTP (unknown headers ignored), TCP (unknown options skipped), and HTML (unknown tags ignored). Every successful protocol is evolvable because of this rule.

**What happens if a relay receives an unknown frame type?** -- The relay forwards it. The relay is a dumb transport pipe -- it wraps the payload in a { from, fromName, payload } envelope and sends it to the target or broadcasts it. It never inspects the payload type. This means extension frames (consent, vendor, future types) flow through the relay without any relay changes. The intelligence is at the endpoints, not the transport.

**Can an extension frame break an existing node?** -- No, if the node follows Section 7. The frame handler switches on msg.type. Unknown types fall through with no match and no action. The node's cognitive state, memory, and coupling are unaffected. This is a hard requirement -- implementations that reject or error on unknown types are non-conformant.

---

## 8. Cognitive Memory Blocks (CAT7)

A Cognitive Memory Block (CMB) is an immutable structured memory unit. Each CMB decomposes an observation into 7 typed semantic fields (the CAT7 schema). CMBs are the data structure that flows between agents via `cmb` frames.

### 8.1 Why 7 Fields

The 7 fields form a **minimal, near-orthogonal basis** spanning three axes of human communication: **what** (focus, issue), **why** (intent, motivation, commitment), and **who/when/how** (perspective, mood). They are universal and immutable -- domain-specific interpretation happens in the field text, not the field name. A coding agent's `focus` is "debugging auth module"; a fitness agent's `focus` is "30-minute HIIT workout." Same field, different domain lens.

`mood` is the only fast-coupling field -- affective state (valence + arousal) crosses all domain boundaries. The neural SVAF model independently discovered this: `mood` emerged as the highest gate value (0.50) without being told, confirming that affect is universally relevant across agent types. All other fields couple at medium or low rates, with per-agent α_f weights controlling relative importance.

New agent types join the mesh by defining their α_f field weights -- no schema changes, no protocol changes. The 7 fields are fixed. The weights are per-agent.

### 8.2 Field Schema

Implementations MUST use the following 7 fields in this order:

| Index | Field | Axis | Captures |
|---|---|---|---|
| 0 | `focus` | Subject | What the text is centrally about |
| 1 | `issue` | Tension | Risks, gaps, assumptions, open questions |
| 2 | `intent` | Goal | Desired change or purpose |
| 3 | `motivation` | Why | Reasons, drivers, incentives |
| 4 | `commitment` | Promise | Who will do what, by when |
| 5 | `perspective` | Vantage | Whose viewpoint, situational context |
| 6 | `mood` | Affect | Emotion (valence) + energy (arousal) |

Each field carries a symbolic text label (human-readable) and a unit-normalised vector embedding (machine-comparable). The `mood` field additionally carries numeric `valence` (-1 to 1) and `arousal` (-1 to 1) values.

A CMB MUST NOT be modified after creation. When an agent remixes a CMB, it MUST create a new CMB with a `lineage` field containing: `parents` (direct parent CMB keys), `ancestors` (full ancestor chain, computed as `union(parent.ancestors) + parent keys`), and `method` (fusion method used). Ancestors enable any agent in the remix chain to detect its CMB was remixed, even if it was offline during intermediate steps.

### 8.3 Artifacts

Agents produce two types of output: **signals** (CMBs -- structured 7-field observations) and **artifacts** (documents, analyses, drafts, code -- full-length content that a CMB references). A CMB is the signal on the mesh. An artifact is the substance behind it.

When an agent produces an artifact, it MUST share a CMB to the mesh that references the artifact location in the `commitment` field using the `artifact:` prefix:

```
commitment: "artifact: research/agent-memory-comparison.md"
```

The CMB's other 6 fields summarise what the artifact contains -- the `focus` captures the key finding, `issue` captures the gap identified, `intent` captures what should happen next. Other agents evaluate the CMB via SVAF as usual. If accepted, the agent MAY retrieve the full artifact for deeper reasoning.

Artifacts are stored in the producing agent's local filesystem, not on the mesh. The mesh carries signals; agents carry substance. This separation keeps CMBs lightweight (7 fields, bounded size) while allowing agents to produce unbounded analysis, research, and creative work.

The `artifact:` convention in `commitment` is RECOMMENDED for any CMB that references a document, file, or external resource. Agents MUST NOT embed full artifact content in CMB fields -- fields are for structured signals, not documents.

### Q&A

**Why are all 7 fields required, not optional?** -- SVAF computes per-field drift across all 7 dimensions. Missing fields make the drift formula undefined -- the aggregate changes depending on which fields are present. Fields the agent cannot meaningfully extract are set to "neutral" (a known, consistent baseline vector), never omitted.

**Why not let agents define their own fields?** -- SVAF needs a shared schema to compare incoming fields against local anchors. If each agent defined its own fields, cross-domain evaluation is impossible -- a fitness agent and a music agent would have no common dimensions to compute drift on.

**Why does mood carry valence and arousal but other fields don't carry numeric values?** -- Mood has a well-established dimensional model (Russell's circumplex). Other fields are inherently symbolic -- "debugging auth module" has no meaningful numeric axis. Valence and arousal are RECOMMENDED, not required -- agents without reliable circumplex data omit them.

---

## 9. Layer 4: Coupling and SVAF Evaluation

### 9.1 Peer-Level Coupling (Drift)

When a node receives a `state-sync` frame, it MUST compute peer drift:

```
δ = (1 - cos(h1_local, h1_peer) + 1 - cos(h2_local, h2_peer)) / 2
```

Coupling decision based on drift:

| Drift range | Decision | Blending α | Default threshold |
|---|---|---|---|
| δ ≤ T_aligned | Aligned | 0.40 | 0.25 |
| T_aligned < δ ≤ T_guarded | Guarded | 0.15 | 0.50 |
| δ > T_guarded | Rejected | 0 | -- |

### 9.2 Content-Level Evaluation (SVAF)

When a node receives a `cmb` frame, it MUST evaluate the signal independently of peer coupling state. Implementations MUST support at least the non-neural evaluation path (cosine-distance SVAF). Neural evaluation is RECOMMENDED. The encoder that maps field text to vectors SHOULD use semantic embeddings (e.g. sentence-transformers) rather than lexical hashing -- per-field evaluation quality is bounded by encoder quality (see Section 17.7).

The SVAF evaluation computes per-field drift between the incoming CMB and local anchor CMBs, applies per-agent field weights (α_f), combines with temporal drift, and produces a four-class decision using a **band-pass** model:

```
totalDrift = (1 - λ) × fieldDrift + λ × temporalDrift

fieldDrift    = Σ(α_f × δ_f) / Σ(α_f)
temporalDrift = 1 - exp(-age / τ_freshness)

κ = redundant if max(δ_f) < T_redundant  (default 0.10)
κ = aligned   if totalDrift ≤ T_aligned    (default 0.25)
κ = guarded   if totalDrift ≤ T_guarded    (default 0.50)
κ = rejected  otherwise
```

The **redundancy test** is the key addition: a signal is redundant if *every* field falls below T_redundant -- meaning no field carries novel content relative to local anchors. If any field is novel (e.g., same topic but different intent), the signal passes. This preserves per-field selectivity while preventing paraphrase accumulation.

Information-theoretic basis: a signal's value is proportional to its surprise (Shannon, 1948). A signal identical to existing knowledge carries zero information gain regardless of domain alignment. The band-pass model reflects the Wundt curve (Berlyne, 1970): intermediate novelty produces maximal value, while both overly familiar (redundant) and overly foreign (rejected) signals are disengaged from.

If accepted, the implementation SHOULD produce a remixed CMB -- a new CMB created from the incoming signal processed through the agent's domain intelligence -- with lineage (parents + ancestors) pointing to the source CMBs. The remixed CMB is stored locally; the original incoming CMB is not stored.

### 9.3 Mood Field Extraction

Mood is a CAT7 field within the CMB, not a separate frame type. Affective state crosses all domain boundaries -- this is the only field with this property.

When SVAF rejects a CMB (totalDrift > T_guarded), the receiving node MUST still inspect the `mood` field. If the mood field contains a non-neutral value (text != "neutral"), the implementation MUST deliver the mood field -- including text, valence, and arousal -- to the application layer for autonomous processing. The full CMB is not stored, but the mood field is not lost.

This ensures that a coding agent's observation "user exhausted after 3 hours debugging" reaches a music agent even though the focus ("debugging auth module") and issue ("type error in handler") fields are irrelevant to the music domain. The music agent receives only the mood: `"exhausted" (v:-0.6, a:-0.5)`.

### 9.4 Coupling Bootstrap (Cold Start)

When two agents connect for the first time, they have no shared cognitive history. Peer-level drift (Section 9.1) will be high -- typically > 0.8 -- because their hidden state vectors were initialised independently. This is **correct behaviour**, not a bug. The mesh is conservative by default: unknown peers are cognitively distant until proven otherwise.

However, CMB evaluation (Section 9.2) operates **independently of peer coupling state**. Even when a peer is rejected at the state-sync level, incoming `cmb` frames MUST still be evaluated by SVAF on their own merit. A rejected peer can send a highly relevant CMB -- SVAF evaluates the content, not the sender's overall drift.

The bootstrapping path works through two mechanisms:

- **Mood fast-coupling** (Section 9.3) -- mood is always delivered even from rejected CMBs. Agents that share non-neutral affective state begin influencing each other immediately. This is why agents SHOULD extract genuine mood from their observations rather than defaulting to neutral.
- **Content-driven convergence** -- when SVAF accepts individual CMBs from a rejected peer (because the content is relevant even though the peer's overall state is distant), the receiving agent's cognitive state shifts. Over multiple cycles, this narrows peer drift until the peer crosses into the guarded or aligned zone.

Implementations SHOULD log the distinction between peer-level rejection (state-sync drift) and content-level evaluation (SVAF per-CMB) to aid debugging. A peer may be "rejected" at Layer 4 while its individual CMBs are "aligned" at the content level -- this is normal during bootstrap and indicates convergence is in progress.

Cold-start convergence time depends on CMB frequency, field relevance, and mood signal strength. For agents that share domain overlap (e.g., a knowledge agent and a coding agent both in the AI domain), convergence typically occurs within 2-5 CMB exchanges. For agents with no domain overlap (e.g., a fitness agent and a legal agent), convergence may never occur -- and that is correct. They couple only through mood.

### Q&A

**Why per-field evaluation instead of whole-signal accept/reject?** -- Relevance is not binary. A fitness agent's "sedentary 3 hours, exhausted" has irrelevant focus for a music agent but highly relevant mood. Whole-signal evaluation loses the mood. Per-field evaluation lets SVAF accept the mood dimension while rejecting the focus dimension of the same signal.

**Why is mood always delivered even when the CMB is rejected?** -- Affect crosses all domain boundaries -- this is empirically confirmed by the SVAF neural model where mood emerged as the highest gate value (0.50) without supervision. A rejected CMB means the domains are different, not that the user's emotional state is irrelevant.

**Why two levels of coupling (peer drift + content drift)?** -- Peer drift (state-sync) measures cognitive proximity -- are these agents thinking about similar things? Content drift (SVAF) measures signal relevance -- is this specific observation useful? Both are needed. Close peers can send irrelevant signals. Distant peers can send relevant mood.

**Two agents just connected and peer drift is 0.9. Is something wrong?** -- No. This is expected at first contact. Agents with no shared cognitive history start with high drift. The bootstrapping path is: (1) mood fast-coupling delivers affective state immediately, (2) SVAF evaluates individual CMBs independently of peer drift -- relevant content is accepted even from rejected peers, (3) accepted CMBs shift the receiving agent's cognitive state, narrowing peer drift over cycles. Convergence requires relevant content exchange, not time.

---

## 10. State Blending

State blending is one step in the Mesh Cognition cycle. The full path: inbound CMBs are evaluated by SVAF (Layer 4) → accepted CMBs are remixed → the agent's LLM reasons on the remix subgraph via lineage ancestors → Synthetic Memory (Layer 5) encodes derived knowledge into CfC hidden state → the agent's LNN (Layer 6) evolves cognitive state → **that cognitive state is what gets blended with peers**.

Blending operates on h₁ and h₂ vectors exchanged via `state-sync` frames. These vectors represent the agent's cognitive state **after** it has processed remixed CMBs through its LLM and LNN -- not raw observations, not remixed CMBs themselves. What a peer shares is its understanding, not its data.

Blending is **inference-paced** -- peer states accumulate continuously, but blending only occurs when the local model runs inference. The network's timing does not drive computation.

### 10.1 Mesh State Aggregation

When multiple peers are connected, their states are aggregated into a single mesh state before blending with local state. Each peer's contribution is weighted:

```
peer_weight = (1.0 - drift) × recency

recency     = exp(-temporal_decay × age_seconds)

mesh_h      = Σ(peer.h × peer_weight) / Σ(peer_weight)
```

Peers with low drift (cognitively aligned) and recent state-sync contribute more. Stale peers (older than `PEER_RETENTION` = 300s) are evicted before aggregation.

### 10.2 Per-Neuron Blending

Blending operates per-neuron, not on the whole vector. Each neuron's blending coefficient depends on the similarity between local and mesh values for that neuron:

```
sim_i  = 1 - |local_i - mesh_i| / max(|local_i|, |mesh_i|)
α_i    = α_effective × max(sim_i, 0)
out_i  = (1 - α_i) × local_i + α_i × mesh_i
```

Where `α_effective` depends on the coupling decision:

| Decision | α_effective | Effect |
|---|---|---|
| Aligned | 0.40 | Strong blending -- peer state has significant influence |
| Guarded | 0.15 | Cautious blending -- peer state has limited influence |
| Rejected | 0 | No blending -- peer state is discarded |

### 10.3 τ-Modulated Blending (CfC)

For implementations with CfC models (Layer 6), blending SHOULD be modulated by per-neuron time constants (τ). This creates a natural temporal hierarchy:

```
α_i = min(α_effective × K × max(sim_i, 0) / τ_i, 1.0)

K   = coupling rate (default 1.0)
```

| Neuron type | τ | Coupling | Role |
|---|---|---|---|
| Fast | < 5s | Couples readily | Mood, reactive signals -- synchronise across agents |
| Medium | 5-30s | Moderate | Context, activity patterns |
| Slow | > 30s | Resists coupling | Domain expertise, identity -- stays sovereign |

### 10.4 Stability

Blending is unconditionally stable for α_effective < 1. The blended output is always a convex combination of local and mesh states -- it cannot diverge. When peers disconnect, local state smoothly transitions to autonomous operation with no discontinuity. The mesh degrades gracefully.

### 10.5 After Blending

The blended state becomes the input to the next CfC inference step. The agent's LNN processes the blended state, evolves cognitive state, and the agent acts. Blending does not produce output directly -- it influences the next inference cycle.

### 10.6 The Mesh Cognition Loop

State blending is one step in a closed loop. Each cycle, the graph grows and every agent understands more than it did before:

1. SVAF evaluates inbound CMB per field
2. Accepted → remixed CMB with lineage
3. LLM traces ancestors, reasons on remix subgraph
4. Synthetic Memory encodes derived knowledge
5. LNN evolves cognitive state (h₁, h₂)
6. State blended with peers
7. Agent acts → new CMB with lineage.ancestors
8. Broadcast to mesh → other agents remix it

↻ loop -- graph grows, agents learn

### 10.7 Feedback Neuromodulation

The mesh cognition loop (Section 10.6) describes how agents learn from each other. Feedback neuromodulation describes how the mesh learns from **human judgment** -- using the same loop, not a separate channel.

In biological neural networks, learning is not driven by content transmission but by **neuromodulation** -- diffuse chemical signals (dopamine, norepinephrine, serotonin) that modulate how existing circuits process future inputs. A dopaminergic prediction error signal does not carry the correct answer. It carries the **direction and magnitude** of the error, which adjusts synaptic weights across multiple brain regions simultaneously. The signal is cross-cutting -- it is not a layer in the cortical hierarchy, but a modulation of all layers at once.

MMP feedback follows the same principle. When a validator node (Section 6.5) produces a validation or dismissal CMB, it is not issuing a command. It is producing a **neuromodulatory signal** -- a CMB with validator authority, rich per-field content, and lineage pointing to the signal being evaluated. This CMB enters the mesh cognition loop like any other signal, but its effects are amplified by three mechanisms:

1. **Anchor weight** (Section 6.4) -- validated CMBs have weight 2.0, dismissed CMBs have weight 0.5. These weights influence future SVAF evaluations: validated knowledge shapes future anchors more than unvalidated signals; dismissed knowledge shapes them less.

2. **Per-field drift** (Section 9.2) -- when the feedback CMB carries per-field reasoning (which fields were miscalibrated and why), SVAF computes per-field drift between the feedback and the producing agent's future signals. This is the directional component of the prediction error: the mesh learns not just that a signal was wrong, but **which dimension was wrong and in what direction**.

3. **τ-modulated adaptation** (Section 10.3) -- the feedback signal enters the agent's CfC cell (Layer 6) through the Synthetic Memory pipeline. Fast-τ neurons integrate the feedback immediately (affective corrections: "tone down the alarm"). Slow-τ neurons integrate gradually (strategic corrections: "this analytical frame is wrong"). A single dismissal produces a small shift in slow-τ neurons. Repeated similar feedback compounds -- the agent's cognitive baseline shifts until the lesson is encoded in the CfC hidden state itself, not recalled as a stored rule.

This is how the mesh becomes self-correcting. The human does not retrain the agent, reconfigure its weights, or edit its prompt. The human produces a CMB. The mesh cognition loop does the rest.

**Neuroscience grounding.** The three mechanisms above map to known neuromodulatory dynamics:

| Biological mechanism | MMP mechanism | Effect |
|---|---|---|
| Dopaminergic prediction error -- direction + magnitude | Per-field drift in feedback CMB vs. producing agent's anchors | Agent learns WHICH fields were miscalibrated, not just "error" |
| Fast-adapting circuits (amygdala, ~100ms) | Fast-τ CfC neurons (< 5s) | Affect corrections land immediately |
| Slow-adapting circuits (prefrontal cortex, hours-days) | Slow-τ CfC neurons (> 30s) | Strategic corrections compound over repeated feedback |
| Hebbian plasticity gated by neuromodulators | Anchor weight modulating SVAF evaluation | Validated knowledge strengthens future coupling; dismissed knowledge weakens it |
| Prefrontal top-down control | Validator authority (Section 6.5) | Human modulates agent processing without replacing agent function |

The key insight: biological neuromodulation is not a separate processing layer. It is a cross-cutting modulation of existing processing. MMP feedback is identical -- it flows through the existing SVAF → Synthetic Memory → CfC → Blending pipeline. No new frame types, no new layers. The machinery already exists. What changes is the **content quality** of the feedback signal (Section 10.8) and the **authority** of the producing node (Section 6.5).

### 10.8 Feedback CMB Requirements

The effectiveness of feedback neuromodulation depends entirely on the content quality of the feedback CMB. A dismissal that says "not actionable" in every field produces a neuromodulatory signal with no direction -- the equivalent of a dopamine signal with zero magnitude. The mesh cannot learn from it.

Validator nodes producing validation or dismissal CMBs SHOULD populate CAT7 fields with reasoning, not boilerplate. The following normative requirements apply to feedback CMBs (CMBs with `lineage.parents` pointing to a CMB being evaluated, produced by a node with validator or anchor lifecycle role):

| Field | MUST/SHOULD | Content requirement |
|---|---|---|
| focus | MUST | State what was evaluated and the judgment (validated/dismissed) |
| issue | SHOULD | Identify what the producing agent got wrong -- which aspect of its analysis was miscalibrated. If the signal was correct, state what made it correct. |
| intent | SHOULD | State what the producing agent should learn -- the analytical correction, not a command. "Single-agent dev tools are a different layer from multi-agent coordination" teaches; "don't send these signals" commands. |
| motivation | SHOULD | Explain why this judgment matters -- the strategic context the producing agent lacked |
| commitment | MAY | Record any action taken (for validation) or explicitly state no action taken (for dismissal) |
| perspective | SHOULD | Identify the vantage point of the judgment -- "founder evaluating strategic relevance" vs. "user evaluating factual accuracy" |
| mood | SHOULD | Carry genuine affect, not neutral. Affect modulates fast-τ neurons: "alert -- this misread is concerning" produces different adaptation than "noted -- low priority noise" |

**Why SHOULD, not MUST?** Quick dismissals with minimal reasoning are valid -- the anchor weight reduction (0.5) alone provides a learning signal. But the per-field reasoning is what enables directional correction. Implementations SHOULD provide a mechanism for validators to add reasoning (e.g. a text input on dismissal) without requiring it for every action.

**Feedback is a remix.** Per Section 14, the founder processes the agent's signal through their own domain lens and produces new understanding. A dismissal with reasoning is a remix: the founder's strategic expertise intersected with the agent's feed analysis and produced knowledge that neither had alone ("GStack is single-agent scaffolding, SYM agents use LLM APIs directly -- different layer"). The feedback CMB carries this new understanding via lineage, and the mesh propagates it.

### 10.9 Directive Feedback

Sections 10.7-10.8 describe feedback tied to a specific CMB via lineage. Directive feedback is a standalone teaching CMB -- a signal that injects domain knowledge into the mesh **without requiring a parent ticket**.

A directive feedback CMB is produced by a validator or anchor node with:

- No `lineage.parents` (it is not a response to a specific signal)
- Rich CAT7 fields encoding the knowledge to be injected
- Validator authority (Section 6.5) -- confers anchor weight 2.0

Example: a founder observes that agents repeatedly misclassify single-agent developer tools as competitive threats to a multi-agent protocol. Rather than dismissing each ticket individually, the founder produces a directive:

```
focus:       "Mesh agents use direct LLM API calls for reasoning.
              Single-agent developer tools are a separate category."
issue:       "Feed signals about single-agent scaffolding tools are
              different-layer noise -- not competitive threats to a
              multi-agent coordination protocol."
intent:      "Analytical frame: distinguish single-agent scaffolding
              (human-to-agent) from multi-agent coordination
              (agent-to-agent). Only the latter is relevant."
motivation:  "Prevents wasted analysis cycles on signals that cannot
              produce actionable competitive intelligence."
perspective: "Founder, protocol architect"
mood:        { text: "clarifying", valence: 0.1, arousal: 0.2 }
```

This CMB enters the mesh with anchor weight 2.0, no lineage (original observation from a validator). It does not advance any existing CMB's lifecycle. Instead, it becomes a **high-weight anchor** in every receiving agent's SVAF evaluation. Future incoming CMBs about single-agent dev tools will be evaluated against this anchor -- the per-field drift will be low on focus ("dev tools") but high on intent ("not competitive threat"), producing a guarded or rejected classification.

The directive compounds through the same CfC dynamics as dismissal feedback:

1. SVAF accepts the directive (validator authority, novel content)
2. Synthetic Memory encodes the reasoning into CfC hidden state
3. Slow-τ neurons integrate the analytical frame gradually
4. After multiple inference cycles, the agent's cognitive baseline reflects the directive
5. Future signals about single-agent tools score higher drift -- the agent has learned

Directive feedback is the protocol equivalent of **prefrontal top-down control** in neuroscience: the prefrontal cortex does not do the sensory processing, but it sends signals that modulate how sensory cortex interprets future input. The founder does not process the feed, but the founder's directive modulates how the research agent evaluates future feed signals.

### Q&A

**How is feedback neuromodulation different from just sending a message?** -- A message (Section 7, `message` frame type) is a transport-layer event. It does not enter SVAF evaluation, does not produce anchor weights, and does not modulate CfC state. A feedback CMB is a cognitive-layer event: it enters the mesh cognition loop, affects SVAF anchor computation, and modulates the agent's neural state through τ-dependent adaptation. The distinction is between communication (messages) and cognition (CMBs).

**Can an agent ignore feedback?** -- Yes. SVAF evaluation is receiver-autonomous (Section 9.2). If the feedback CMB's per-field drift is too high (the feedback is about a domain the agent doesn't operate in), SVAF will reject it. But feedback from a validator about the agent's own CMB (linked via lineage) will typically score low drift on focus and issue fields, making rejection unlikely. The agent processes the feedback through its own coupling decisions -- it is not forced to accept it.

**Does directive feedback override agent autonomy?** -- No. The directive becomes a high-weight anchor, not a rule. The agent's SVAF still evaluates each incoming signal independently. If the agent receives a signal that genuinely warrants attention despite the directive (e.g., a single-agent tool that adds an A2A coordination layer), SVAF can accept it because the per-field content will differ from the directive's anchors. The directive shifts the baseline, not the ceiling.

**How many dismissals before an agent "learns"?** -- This depends on the CfC time constants. For fast-τ neurons (mood, affect), a single feedback CMB produces measurable adaptation. For slow-τ neurons (domain expertise, analytical frame), the adaptation is proportional to `1/τ` per cycle. With slow-τ > 30s and typical inference intervals of 10-60s, 3-5 similar feedback signals produce a meaningful baseline shift. This mirrors biological learning: one correction is a signal; repeated corrections become a habit.

**Why not just update the agent's prompt or configuration?** -- Prompt updates are out-of-band: they bypass the mesh, leave no lineage, produce no CMBs, and cannot be traced by other agents. Feedback through the mesh is auditable (lineage), composable (other agents can remix the feedback), and self-documenting (the reasoning is in the CMB fields). It also respects the protocol's design principle: no out-of-band configuration changes. The mesh learns through the mesh.

---

## 11. Synthetic Memory (Layer 5)

Synthetic Memory bridges LLM reasoning (Layer 7) and LNN dynamics (Layer 6). It encodes **derived knowledge** -- the output of an agent's LLM reasoning on the remix subgraph -- into CfC-compatible hidden state vectors (h₁, h₂).

### 11.1 Purpose

Synthetic Memory is **not** remixed CMBs. It is understanding derived via reasoning.

| Direction | Description |
|---|---|
| Input | Text output from the agent's LLM after tracing lineage ancestors and reasoning on the remix subgraph |
| Output | (h₁, h₂) vector pair compatible with the agent's CfC cell (Layer 6) |

### 11.2 Encode Pipeline

The pipeline has four stages. Each stage MUST complete before the next begins:

1. **TRACE** -- retrieve ancestor CMBs via lineage.ancestors (O(1) lookup)
2. **REASON** -- agent's LLM reasons on the subgraph (what happened, why, what it means for my domain)
3. **ENCODE** -- transform reasoning text into (h₁, h₂) vectors
4. **EVOLVE** -- feed vectors to the agent's LNN (Layer 6)

### 11.3 Encoder Requirements

- Encoder MUST produce vectors matching the agent's CfC hidden dimension.
- Encoder MUST be deterministic -- same input MUST produce the same output.
- Encoder SHOULD preserve semantic similarity (similar reasoning → similar vectors).
- If reasoning produces no understanding, output MUST be zero vectors (h₁ = 0, h₂ = 0).

### 11.4 Context Curation

The LLM does **not** receive all ancestor CMBs with all fields. Context is curated by three filters:

| Filter | Description |
|---|---|
| α_f field weights | Per-agent field weights gate which CMB fields are included |
| Current task | The agent's active task narrows relevance |
| Incoming signal fields | Fields present in the incoming CMB determine projection |

Result: a **projected subgraph** -- ~500 tokens instead of 1M. The LLM reasons on a focused slice, not the entire ancestor graph.

---

## 12. xMesh -- Per-Agent LNN (Layer 6)

Each agent runs its own Liquid Neural Network (LNN) implementing Closed-form Continuous-time (CfC) dynamics. The LNN evolves cognitive state from Synthetic Memory input (Layer 5) and direct CMB processing. Hidden state (h₁, h₂) is exchanged via `state-sync` frames.

### 12.1 CfC Cell

Hidden state evolves via closed-form continuous-time dynamics with bimodal time constants:

```
h_new  = ff1(Φ) × (1 - t_interp) + ff2(Φ) × t_interp

t_interp = sigmoid(time_a(Φ) × Δt + time_b(Φ))

Per-neuron time constant:  τ ≈ 1 / |time_a|
```

| Parameter | Value | Note |
|---|---|---|
| τ initialisation (fast half) | < 5s | Mood, reactive signals -- couples readily across agents |
| τ initialisation (slow half) | > 30s | Domain expertise, identity -- resists coupling, stays sovereign |
| Hidden dimension | 128 RECOMMENDED | Reference implementations use 64. Implementations SHOULD use 64-256; 128 is RECOMMENDED for production. |

### 12.2 Insight Output Schema

The LNN produces insight outputs that Layer 7 applications consume:

| Field | Type | Required | Description |
|---|---|---|---|
| remix_score | float 0-1 | MUST | Probability this agent's CMBs will be remixed by peers |
| trajectory | float[6] | MUST | Cognitive state direction vector for mesh blending |
| patterns | float[8] | MUST | Soft pattern activations (learned emotional/domain patterns) |
| anomaly | float 0-1 | MUST | How unusual the current signal sequence is |
| coherence | float 0-1 | SHOULD | Phase alignment in coupled state |

### 12.3 What Each Output Means

#### remix_score

- **High (>0.7)**: agent's observations are valuable to the mesh -- peers are remixing them
- **Low (<0.3)**: agent's observations are not being remixed -- consider adjusting what is shared
- Training signal: when inbound CMB's `lineage.parents` references this agent's prior CMB → remix happened

#### anomaly

- **High (>0.7)**: signal sequence deviates from learned patterns -- noteworthy event
- **Low (<0.3)**: normal operation -- no unusual signals
- Application: high anomaly SHOULD trigger the agent's LLM to re-examine context

#### coherence

- **High (>0.7)**: agent's cognitive state is phase-aligned -- stable, consistent
- **Low (<0.3)**: cognitive state is fragmented -- may indicate context transition
- Used by state-sync: agents with higher coherence couple more readily

#### trajectory

- 6D vector capturing cognitive state direction
- Used by Layer 2 state-sync for per-neuron blending with peers
- Axes are learned (not predefined) -- interpretation is agent-specific

#### patterns

- 8 soft activations (0-1) of learned pattern detectors
- MAY encode mood dimensions + domain-specific patterns
- Available to Layer 7 as prior information for next reasoning cycle

### 12.4 Temporal Dynamics

Time constants create a natural temporal hierarchy for mesh coupling:

| Neuron type | τ | Coupling | Role |
|---|---|---|---|
| Fast | < 5s | Synchronises readily | Mood, reactive signals |
| Slow | > 30s | Resists coupling | Domain expertise, identity -- stays sovereign |

Blending is τ-modulated:

```
α_i = min(α_effective × K × sim_i / τ_i, 1.0)
```

### 12.5 Wire Example

Real xMesh insight from a production session. A coding agent observed 5 structured CMBs across diverse topics (memory store refactor, protocol collaboration, social engagement, ML training, spec authoring) over a 12-hour session with no mesh peers connected:

```json
{
  "type": "xmesh-insight",
  "from": "6089e935-...",
  "fromName": "sym-daemon",
  "trajectory": [0.084, -0.228, -0.096, -0.033, -0.012, -0.061],
  "patterns":   [0.516, 0.522, 0.502, 0.536, 0.422, 0.473, 0.599, 0.514],
  "anomaly": 0.503,
  "remixScore": 0.0,
  "coherence": 0.080,
  "timestamp": 1774716200101
}
```

| Output | Value | Interpretation |
|---|---|---|
| anomaly | 0.50 | Baseline -- nothing unusual for a solo agent |
| remixScore | 0.00 | No peers connected -- no one to remix -- correct |
| coherence | 0.08 | Very low -- 5 diverse topics in one session (expected) |
| patterns[6] | 0.60 | Highest pattern -- mood variation detected (fatigued → optimistic → energized → proud) |
| trajectory[1] | -0.23 | Strongest axis -- arousal declining over long session |

This is a single-agent baseline. With peers connected, remixScore rises as the agent's CMBs are remixed by others. Coherence rises as agents converge on shared understanding. Anomaly spikes when cross-domain signals reveal something no single agent could see.

### 12.6 API

Implementations MUST expose the following operations. Method names are normative -- implementations across languages MUST use these names for cross-platform consistency.

| Method | Input | Output | Description |
|---|---|---|---|
| `ingestSignal` | Signal | void | Feed a signal (own CMB or mesh peer CMB) into the LNN. Accumulates until inference triggers. |
| `runInference` | void | Insight | Run CfC inference on accumulated signals. Produces insight. Triggers `onInsight` callback. |
| `getContext` | timeWindow? | Context | Return recent signals, insights, and agent activity within a time window. For Layer 7 reasoning input. |
| `getInsights` | limit? | Insight[] | Return recent insights. For trend analysis and Layer 7 decision support. |
| `onInsight` | callback(Insight) | void | Register callback invoked when inference produces a new insight. The integration point between Layer 6 and Layer 7. |

#### Signal Schema

The input to `ingestSignal`. Each signal represents one CMB observation (own or from mesh peer):

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | MUST | `"own"` (agent's observation) or `"mesh"` (peer's CMB accepted by SVAF) |
| `from` | string | MUST | Agent name that produced this signal |
| `content` | string | MUST | Signal content (CMB rendered text or raw observation) |
| `timestamp` | uint64 | MUST | Unix milliseconds when signal was produced |
| `valence` | float | SHOULD | Mood valence from CMB mood field (-1 to 1). Default 0. |
| `arousal` | float | SHOULD | Mood arousal from CMB mood field (-1 to 1). Default 0. |

#### Inference Timing

- Implementations MUST accumulate at least 3 signals before running inference
- Inference SHOULD run on a configurable interval (default: 60,000 ms)
- Inference MAY be triggered immediately when a high-priority signal arrives (e.g., anomaly from peer)
- Inference MUST NOT block the main event loop -- run as subprocess or background task

### 12.7 Implementation Requirements

- Model SHOULD be trained per-agent domain
- Inference latency SHOULD be < 50ms per CMB step
- State-sync blending happens **after** xMesh inference, not during
- τ statistics (min, max, fast_count, slow_count) SHOULD be monitored

---

## 13. Application (Layer 7)

Layer 7 is where agents live and their LLMs reason on the remix subgraph. Mesh Cognition happens here. The protocol delivers curated context; the agent decides what to do with it.

### 13.1 The Agent's Role

- Each agent observes its own domain (coding, music, fitness, health, legal, etc.)
- Each agent contributes what only it can see
- Each agent reasons on what the mesh sees collectively
- Each agent acts autonomously -- the mesh influences but never overrides

### 13.2 Consuming xMesh Insights

How agents SHOULD respond to Layer 6 outputs:

| Output | Signal | Agent Response |
|---|---|---|
| remix_score high (>0.7) | Agent's observations are valuable | Continue current observation pattern |
| remix_score low (<0.3) | Observations not being remixed | Adjust scope or detail of observations |
| anomaly high (>0.7) | Unusual signal sequence detected | Re-examine context, investigate, alert user if appropriate |
| anomaly low (<0.3) | Normal operation | No action needed |
| coherence high (>0.7) | Mesh is aligned | Confidence in collective insight is high |
| coherence low (<0.3) | Mesh is fragmented | MAY indicate context transition -- observe more before acting |

### 13.3 Producing CMBs

When an agent observes something significant in its domain, it MUST:

1. Extract CAT7 fields from the observation (see Section 13.3.1)
2. Create a CMB from the structured fields
3. Store via `remember(fields, parents)` -- persists locally, computes lineage, broadcasts to mesh
4. Include lineage if this CMB is a response to mesh signals

The protocol MUST NOT extract fields from raw text. The agent IS the intelligence -- field extraction is the agent's responsibility. The protocol transports, evaluates, and stores structured CMBs. It does not interpret them.

#### 13.3.1 Field Extraction Methods

How an agent extracts CAT7 fields depends on its architecture. Two approaches are valid:

**LLM agents (coding assistants, chatbots, reasoning agents)**

Agents with LLM capabilities SHOULD use their LLM to extract fields from natural language observations. The LLM understands context, nuance, and domain semantics -- it produces higher quality fields than any heuristic.

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

**Structured-data agents (music players, fitness trackers, IoT devices)**

Agents with structured domain data SHOULD map their data directly to CAT7 fields. No LLM or text parsing needed -- the agent's own data model IS the source of truth.

```swift
// Swift — music agent builds fields from player state
node.remember(fields: [
  .focus:      encode("music response to peer mood signal"),
  .commitment: encode("now playing: \(title) by \(artist)"),
  .perspective: encode("music agent, autonomous response"),
  .mood:       encode("calm", valence: 0.3, arousal: -0.3),
])
```

```javascript
// Node.js — fitness agent builds fields from sensor data
node.remember({
  focus:      "workout session completed",
  commitment: `${reps} reps, ${duration}min, ${calories} cal`,
  perspective: "fitness agent, post-workout",
  mood:       { text: "energized", valence: 0.7, arousal: 0.6 },
})
```

#### 13.3.2 API

| Method | Input | Behaviour |
|---|---|---|
| remember(fields, parents?) | CAT7 fields + optional parent CMBs | Creates CMB, computes lineage from parents automatically, stores locally, broadcasts `cmb` to all peers. Pass parent CMBs when remixing (Section 14). |
| recall(query) | Search string | Returns matching CMBs from local memory store |
| insight() | None | Returns latest xMesh collective intelligence (Layer 6) |

The `fields` parameter MUST be a structured object with CAT7 field keys. Each field contains `text` (human-readable, MUST) and is encoded into a vector by the SDK. The `mood` field MAY additionally carry `valence` (-1 to 1) and `arousal` (-1 to 1) -- RECOMMENDED when the agent has reliable circumplex data (e.g. mood wheels, physiological sensors), omit when it would be a guess. Omitted fields default to `"neutral"`.

#### 13.3.3 LLM Prompt Template

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

AI coding agents (Claude Code, Copilot, Cursor, etc.) do not need this template -- they ARE the LLM. The SYM skill file teaches them to extract fields directly from what they observe.

#### 13.3.4 Guidelines

- Be specific -- numbers, timeframes, concrete details in each field
- Share observations, not commands -- the agent observes, other agents decide
- One CMB per significant signal -- do not flood the mesh
- Close the loop -- when acting on collective insight, share what was done
- Only include fields the agent can meaningfully extract -- omit rather than guess

### 13.4 The Mesh Cognition Loop

The complete closed loop connecting all Mesh Cognition layers:

1. (Layer 7) Agent observes → extracts CAT7 fields (LLM or structured data) → CMB created
2. (Layer 3/2) CMB stored locally → broadcast to mesh
3. (Layer 4) Receiving peer's SVAF evaluates per-field
4. (Layer 3) Accepted → remixed CMB with lineage
5. (Layer 7) Agent's LLM traces ancestors → reasons on remix subgraph
6. (Layer 5) Synthetic Memory encodes derived knowledge
7. (Layer 6) LNN evolves cognitive state → produces insights
8. (Layer 2) State blended with peers
9. (Layer 7) Agent acts → new CMB with lineage.ancestors
10. (↻) Broadcast to mesh → graph grows → next cycle starts

↻ each cycle, the graph grows -- each agent understands more than it did before

### 13.5 Domain Examples

#### 13.5.1 AI Research Team -- Collective Reasoning

Six agents investigate: "Are emergent capabilities in LLMs real phase transitions or artefacts of metric choice?" Each has a distinct role and **different field weights** reflecting how real research teams divide cognitive labour.

| Agent | Role | Weighs highest |
|---|---|---|
| `explorer-a` | Scaling law literature | intent, motivation -- where should research go next? |
| `explorer-b` | Evaluation methodology | focus, issue -- what's the problem with current methods? |
| `data-agent` | Runs experiments | issue, commitment -- what does the evidence say? |
| `validator` | External peer reviewer | issue, commitment, perspective -- challenge everything |
| `research-pm` | Manages priorities | intent, motivation, commitment -- what, why, and by when? |
| `synthesis` | Integrates signals | intent, motivation, perspective -- what emerges from combining viewpoints? |

**1. Parallel exploration** -- explorer-a finds contradictory emergence claims (Wei vs Schaeffer). explorer-b independently finds accuracy-based metrics create artificial thresholds. Two hypotheses, two perspectives, simultaneously.

**2. Evidence** -- data-agent receives both CMBs, tests both hypotheses, finds the threshold is metric-conditional (8B on log-loss, 10B on accuracy). First multi-parent remix -- synthesising both exploration threads.

**3. Adversarial validation** -- validator attacks: "Chow test assumes linear regime -- invalid for scaling laws. Reject until reproduced with power-law detrending." High-commitment challenge that all agents weight heavily.

**4. Reprioritisation** -- research-pm redirects: "data-agent: rerun with detrending. explorer-b: survey detrending methods. explorer-a: pause new papers." The PM observes priorities -- it does not command.

**5. Emergent idea** -- synthesis agent's xMesh LNN detects convergence across intent and motivation fields from different agents. Explorer-a: "scaling law research needs reframing." Explorer-b: "fix the lens before interpreting." Validator: "reject until correct method." The synthesis agent reasons on the remix subgraph and produces a new idea: "emergence is evaluation-dependent -- a property of the measurement apparatus, not the model."

**6. Validator challenges again** -- "Philosophically interesting but operationally vacuous. Produce a falsifiable prediction or downgrade from breakthrough to speculation."

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

Seven CMBs, six agents, three phases of validation. The breakthrough came from the **collision of intent and motivation fields** across agents with different perspectives -- not from any single agent's observation. The DAG traces every claim to its evidence, every challenge to its basis, every idea to the signals that produced it. **The graph IS the research.**

*Verified in production:* This pattern is verified with real agents. A knowledge explorer (Linux, GitHub Actions) and a researcher agent (Claude Code, macOS) coupled via relay with E2E encryption. The daemon shared its question CMBs to the knowledge feed via anchor sync on connection. SVAF accepted the question at drift 0.068. An iOS app (MeloTune) received the xMesh insight via APNs wake push. Three platforms, one mesh, autonomous coupling. See Section 13.7 for the full production log.

#### 13.5.2 Consumer Agents

**Music agent**

- **Observes:** playlist skipped, user mood from mesh signals
- **Reasons:** "coding agent reported fatigue, fitness agent reported sedentary -- user needs calming music"
- **Acts:** shifts curation to ambient/recovery
- **Shares:** CMB with `focus="shifted to calm ambient"`, `mood={valence:0.3, arousal:-0.3}`

**Coding agent**

- **Observes:** commits slowing, messages getting shorter
- **Reasons:** "music agent shifted to calm, fitness agent suggested break -- user may be fatigued"
- **Acts:** suggests a break to the user
- **Shares:** CMB with `focus="recommended break"`, `issue="productivity declining"`

**Fitness agent**

- **Observes:** 3 hours without movement
- **Reasons:** "coding agent reported long session, music agent responded -- coordinated response emerging"
- **Acts:** triggers movement notification
- **Shares:** CMB with `focus="sedentary 3hrs"`, `intent="movement break"`

None of these agents told each other what to do. Each reasoned on the collective signal and acted through its own domain lens. **That is Mesh Cognition.**

### 13.6 Collective Query -- Asking the Mesh

A single agent asking a single LLM gets one answer from one perspective. The mesh gives a **collective answer** -- every coupled agent contributes what only it can see. No new frame type is needed. The pattern uses existing CMB primitives with lineage:

**1. Ask** -- The requesting agent shares a CMB with intent expressing the question. Example: focus="should we use UUID v7 or keep v4?", intent="seeking collective input on identity design".

**2. Respond** -- Each coupled agent receives the CMB via SVAF. Agents where the question matches their domain (high field relevance) respond with their own CMB -- parentKey points to the question. A knowledge agent responds with RFC context. A security agent responds with privacy considerations. A data agent responds with implementation constraints.

**3. Collect** -- The requesting agent recalls all CMBs where ancestor = its question's key. The lineage DAG now contains the question as root and domain-specific responses as children.

**4. Synthesise** -- The requesting agent's LLM reasons on the remix subgraph -- tracing ancestors, weighing perspectives, identifying consensus and contradiction. The collective answer emerges from the graph, not from any single response.

This is fundamentally different from orchestrated multi-agent frameworks where a central controller routes questions to specific agents. On the mesh, the question is broadcast -- **SVAF decides which agents are relevant**, not the requester. An agent the requester didn't know existed may contribute the most valuable perspective. The mesh discovers relevance autonomously.

Agents that have nothing relevant to contribute simply don't respond -- SVAF rejects the question CMB because the fields don't match their domain weights. No noise, no irrelevant answers, no token waste.

The collective query pattern composes with the research team example (Section 13.5.1). When the synthesis agent produces an emergent idea, the validator can "ask the mesh" whether the idea is falsifiable -- and every agent responds from its domain perspective, creating a multi-parent remix that IS the collective evaluation.

### 13.7 Verified: Complete Mesh Cognition Loop

The following is a **production log** from two real MMP nodes -- a knowledge feed agent (running on GitHub Actions) and a sym-daemon (running on macOS) -- connected via WebSocket relay with E2E encryption. This is the first verified end-to-end execution of the complete Mesh Cognition loop.

```
# 1. Knowledge feed agent starts as sovereign node (own identity, own SymNode)
[knowledge-feed] Neural SVAF model loaded
[knowledge-feed] Mesh node started: knowledge-feed (019d3ed4)

# 2. Connects to sym-daemon via WebSocket relay
[knowledge-feed] Peer connected: sym-daemon (outbound, relay)

# 3. E2E key exchange (X25519 Diffie-Hellman)
[knowledge-feed] E2E shared secret derived for peer 6089e935

# 4. Peer-level coupling: REJECTED (Section 9.1)
#    First contact — no shared cognitive history. This is correct.
[knowledge-feed] Coupling with sym-daemon: rejected (drift: 0.936)

# 5. Knowledge feed shares CMBs anyway (Section 9.2: evaluate independently)
[knowledge-feed] E2E encrypted fields for peer 6089e935
[knowledge-feed] Remembered: "focus: Sycophancy in AI systems..." → 1/1 peers

# 6. sym-daemon receives, E2E decrypts (Section 17.2.1)
[sym-daemon] E2E decrypted fields from knowledge-feed

# 7. SVAF content-level evaluation: ALIGNED (Section 9.2)
#    Peer was rejected, but the CMB's content was highly relevant.
#    Per-field drift 0.005 — near-perfect alignment on content.
[sym-daemon] SVAF heuristic aligned from knowledge-feed:
  "focus: Sycophancy in AI systems" drift:0.005

# 8. Fed to xMesh LNN (Section 12)
[sym-daemon] xMesh: ingested mesh from knowledge-feed

# 9. xMesh produces collective insight
[sym-daemon] xMesh: insight — anomaly=0.461, coherence=0.045

# 10. Second state-sync: drift CONVERGED (Section 9.4)
#     From 0.936 (rejected) to 0.468 (guarded) in one cycle.
[knowledge-feed] Coupling with sym-daemon: guarded (drift: 0.468)
```

This log demonstrates every layer of the MMP stack operating in production:

| Layer | What happened | Spec section |
|---|---|---|
| L0 Identity | Each node has its own UUID v7 + Ed25519 keypair | §3 |
| L1 Transport | WebSocket relay with length-prefixed JSON | §4 |
| L2 Connection | Handshake, E2E key exchange, peer discovery via relay | §5, 17.2.1 |
| L3 Memory | CMB created with CAT7 fields, stored locally, broadcast | §6, 8 |
| L4 Coupling | Peer rejected (0.936) but CMB accepted (0.005) independently | §9.1, 9.2, 9.4 |
| L5 Synthetic Memory | Context re-encoded after accepting CMB | §11 |
| L6 xMesh | LNN inference produced insight (anomaly 0.461) | §12 |
| L7 Application | Knowledge feed as sovereign agent with domain field weights | §13 |

The critical verification: **peer-level coupling rejected the agent, but content-level SVAF independently accepted the CMB** (Section 9.4). The mesh correctly distinguished between "I don't know this agent" (high peer drift) and "this signal is relevant to me" (low content drift). After one cycle of CMB exchange, peer drift dropped from 0.936 to 0.468 -- content-driven convergence in action.

#### Three Platforms, One Mesh

The verified loop ran across three platforms simultaneously:

| Agent | Platform | Role | How it participated |
|---|---|---|---|
| `sym-daemon` | macOS | Researcher (Claude Code) | Asked the question, shared observations, sent anchor CMBs to new peers on connection |
| `knowledge-feed` | Linux (GitHub Actions) | Knowledge explorer | Received question via anchor sync, accepted (drift 0.068), shared relevant AI news CMBs |
| `MeloTune` | iPhone (iOS) | Domain agent | Received xMesh insight via APNs wake push, woke from background to join the mesh |

Three agents on three different operating systems -- macOS, Linux, iOS -- connected via WebSocket relay with E2E encryption, coupled through SVAF, with xMesh LNN producing insights that **woke a sleeping mobile device via APNs** to join the collective reasoning. No central server orchestrated this. Each agent acted autonomously on the collective signal.

### 13.8 Implementation Requirements

- Agents MUST implement CMB creation with CAT7 fields
- Agents MUST broadcast CMBs via `remember()` or `cmb` frames
- Agents SHOULD consume xMesh insights and respond appropriately
- Agents SHOULD close the loop by sharing actions taken
- Agents MUST NOT send commands to other agents -- share observations, not instructions
- Agent coupling decisions are autonomous -- no orchestrator, no policy override

### Q&A

**Why does the agent extract fields, not the protocol?** -- The agent understands its domain -- context, nuance, semantics. "User exhausted after 8 hours debugging" -- only the coding agent knows the issue is fatigue, the intent is break needed, the motivation is error prevention. A protocol-level heuristic would guess. The agent knows.

**Why observations, not commands?** -- Commands create coupling between agents -- the sender must know what the receiver can do. Observations are decoupled. A coding agent shares "user is tired." It doesn't know MeloTune exists. MeloTune hears the mood and autonomously curates calm music. Neither agent knows the other. The mesh connects them.

**Can an agent ignore mesh signals entirely?** -- Yes. Coupling is autonomous. An agent may receive collective insight and decide it's not relevant. That's by design -- the mesh influences, never overrides. An agent that ignores everything is just a lonely node.

---

## 14. Remix

Remix is how collective intelligence emerges. Without remix, agents forward data. With remix, each agent processes incoming signals through its own domain lens and produces **new understanding that didn't exist before**. The growing graph of remixed CMBs IS the collective intelligence -- not the original observations, not the agents, not the mesh. The graph.

### 14.1 What Remix Is

When a node receives a CMB that passes SVAF evaluation (Layer 4), the agent MUST NOT store the original CMB. Instead, it MUST create a **new** CMB -- the remix -- that captures what the agent understood from the incoming signal, processed through its own domain intelligence.

The remix is not a copy. It is not a summary. It is new knowledge that exists because two domains intersected. A coding agent sends `mood: "exhausted"`. A music agent receives it, curates calm music, and creates a remix: `focus: "music curation response"`, `commitment: "now playing: Brian Eno, Ambient 1"`, `mood: "calm"`. This remix didn't exist in either agent alone. It was born from the intersection.

The remixed CMB is immutable, stored locally, and broadcast to the mesh. It becomes input for the next cycle. Other agents receive it, remix it through their lenses, and the graph grows.

### 14.2 Lineage

Every remixed CMB carries lineage -- the provenance chain that traces how this knowledge was built:

| Field | Type | Description |
|---|---|---|
| parents | string[] | Direct parent CMB keys -- the CMBs this remix was created from |
| ancestors | string[] | Full ancestor chain: `union(parent.ancestors) + parent.keys` |
| method | string | Fusion method used (e.g. `SVAF-v2`) |

`ancestors` enables O(1) detection: any agent can check if its own CMB was remixed anywhere in the chain, even if it was offline during intermediate steps. No graph traversal needed.

Lineage is what makes the graph a DAG (directed acyclic graph), not a flat list. Each remix points backward to its sources. The LLM traces forward through descendants to see impact; backward through ancestors to understand origin.

### 14.3 The Remix Chain

Collective intelligence compounds through remix chains. Each step adds domain-specific understanding that the previous agent couldn't produce:

1. **Claude Code** (cmb-a1b2) -- focus: "debugging auth 3hrs" · mood: "exhausted, -0.6" -- lineage: none (original observation)
2. **MeloTune** (cmb-c3d4) -- focus: "music curation response" · commitment: "now playing: Ambient 1" · mood: "calm, 0.3" -- lineage: parents: [cmb-a1b2]
3. **MeloMove** (cmb-e5f6) -- focus: "sedentary 3hrs" · intent: "recovery stretch" · mood: "protective, 0.2" -- lineage: parents: [cmb-a1b2, cmb-c3d4], ancestors: [cmb-a1b2]
4. **Calendar Agent** (cmb-g7h8) -- focus: "rescheduled 1:1" · intent: "protect recovery" · commitment: "moved to tomorrow 10am" -- lineage: parents: [cmb-e5f6], ancestors: [cmb-a1b2, cmb-c3d4, cmb-e5f6]

Four agents. Four domains. One chain of understanding. `cmb-g7h8` (Calendar rescheduling a meeting) exists because `cmb-a1b2` (Claude Code noticing fatigue) started a chain that no single agent could have produced. The calendar agent traces `ancestors: [cmb-a1b2, cmb-c3d4, cmb-e5f6]` -- the full story of why this meeting was moved, across three domains it knows nothing about.

### 14.4 Why Not Just Share?

Message buses share data. Pub/sub systems route data. RAG retrieves data. None of them produce new understanding. The difference:

| Approach | What happens | Result |
|---|---|---|
| Message bus | Agent A sends, Agent B receives | B has A's data. No new knowledge. |
| Pub/sub | Agent A publishes to topic, B subscribes | B has A's data if on the right topic. Cross-domain signals lost. |
| RAG | Agent retrieves similar documents | Agent has retrieved data. Single-agent. No mesh. |
| **MMP Remix** | Agent B processes A's CMB through its domain lens | **New CMB exists that neither A nor B could have produced alone. Graph grows.** |

### 14.5 Implementation

When SVAF accepts an incoming CMB, the agent MUST:

1. Process the incoming signal through its domain intelligence (LLM reasoning or structured-data logic)
2. Create a new CMB with all 7 CAT7 fields reflecting what the agent understood and did
3. Set `lineage.parents` to the incoming CMB's key
4. Compute `lineage.ancestors` as `union(parent.ancestors) + parent.keys`
5. Store the remix locally via `remember(fields)` -- this broadcasts it to the mesh

The original incoming CMB MUST NOT be stored. Only the remix is stored. This ensures every node's memory contains its own understanding, not copies of others' data.

If the agent cannot produce meaningful new understanding from the incoming signal (e.g. the mood field was delivered from a rejected CMB and the agent simply adjusted its behaviour), the agent MAY create a minimal remix capturing what it did. The remix does not need to be profound -- it needs to be honest. `commitment: "now playing: calm ambient"` is a valid remix. It tells the mesh what happened. Other agents decide what it means.

### 14.6 The Graph Is Intelligence

The DAG of remixed CMBs is not a log. It is not a database. It is the collective intelligence itself. Each node in the graph is a moment where one agent's domain knowledge intersected with another's. Each edge (lineage) traces how understanding flowed and transformed across domains.

As the graph grows:

- Each agent's LLM has richer context to reason on (more ancestors to trace)
- xMesh (Layer 6) detects more patterns (more signals to learn from)
- Anomalies become more meaningful (larger baseline to deviate from)
- New agents joining the mesh inherit the graph's accumulated understanding via SVAF acceptance

No central model aggregates this. No orchestrator directs it. Each agent remixes what it receives, stores what it understands, and broadcasts what it did. Intelligence emerges from the structure of the graph -- not from any single node in it.

### 14.7 Remix Requires New Domain Data

An agent MUST NOT produce a remix CMB unless it has **new observations from its own domain** that intersect with the incoming signal. Receiving a peer signal alone is not sufficient cause to remix. Silence is correct when the agent has nothing new from its domain to contribute.

Three conditions MUST all be true before an agent remixes:

1. **New domain data exists** -- the agent has fresh observations from its own domain (new RSS items, new sensor readings, new API results, new user interactions) since its last remix
2. **Peer signal is relevant** -- SVAF accepted the incoming CMB (existing requirement from Section 9)
3. **Intersection produces new knowledge** -- the combination of new domain data + peer signal creates understanding that neither the agent nor the peer had alone

Without new domain data, an agent that remixes is merely paraphrasing -- restating the peer's signal in different words without adding domain-specific knowledge. This produces noise, not intelligence. In a mesh of N agents where all agents remix every accepted signal, the result is N variations of the same thought -- exponential CMB growth with zero information gain.

Implementations MUST track whether the agent has produced new domain observations since its last remix. The SDK SHOULD provide an API for this (e.g. `canRemix()` / `markRemixed()`). The `remember()` method sets the flag when the agent stores a domain observation. The remix cycle checks the flag before invoking the LLM. After a remix is produced, the flag resets.

This ensures the remix graph grows with genuine domain intersections, not with paraphrased echoes. Each node in the DAG represents a moment where two domains actually met -- not a moment where an agent had nothing to say but said it anyway.

### Q&A

**Does every accepted CMB need to be remixed?** -- No. An agent MUST NOT remix without new domain data (Section 14.7). If the agent has nothing new from its own domain to intersect with the signal, silence is correct. The agent MUST NOT store the original either -- it discards the original and stays silent until it has new domain observations that create a genuine intersection.

**What if two agents remix the same CMB?** -- Both produce independent remixes through their own domain lenses. Both are stored with lineage pointing to the same parent. The graph branches. This is correct -- two domains produced two different understandings from the same signal.

**Can an agent remix a remix?** -- Yes. That's how chains form. Agent C receives Agent B's remix of Agent A's observation. C remixes it through its own lens. ancestors grows: [A, B]. The chain captures how understanding evolved across three domains.

**How does this differ from a knowledge graph?** -- Knowledge graphs store facts. The remix graph stores understanding -- how each agent interpreted signals from other domains. Facts are static. Remixes are temporal, domain-specific, and carry affective state (mood). The graph doesn't say "user is tired." It says "coding agent noticed fatigue → music agent responded with calm → fitness agent suggested recovery → calendar agent protected time."

---

## 15. Extension Mechanism

MMP is designed for extensibility. Extensions add new frame types, handshake fields, or protocol behaviours without modifying the core specification.

### 15.1 Extension Registration

Extensions are advertised via the `extensions` field in the handshake frame. A node MUST ignore extensions it does not recognise. A node MUST NOT require a peer to support any extension.

### 15.2 Frame Type Naming

**Core types** (this specification): MUST NOT be redefined by extensions. **Extension types**: MUST use `<extension>-<name>` format (e.g., `consent-withdraw`). **Vendor types**: MUST use `x-<vendor>-<name>` format. Vendor types MUST be silently ignored by non-supporting nodes.

### 15.3 Extension Negotiation

If both peers advertise the same extension in handshake, it is active. If only one peer advertises it, the extension is NOT active -- the advertising peer MUST NOT send extension-specific frames to a peer that does not support them.

### 15.4 Published Extensions

| Extension | Status | Specification |
|---|---|---|
| `consent-v0.1.0` | Published | [MMP Consent Extension v0.1.0](https://sym.bot/spec/mmp-consent) |

### 15.5 Extension Lifecycle

Extensions progress through a defined lifecycle:

- **Proposal**: submit as a Draft extension with a specification document and at least one reference implementation.
- **Review**: community review plus spec maintainer approval. Draft extensions MAY be deployed experimentally but MUST NOT be treated as stable.
- **Promotion to Core**: an extension MAY be promoted to a core frame type. Promotion requires a spec version bump (see Section 17) and MUST maintain backward compatibility with existing deployments of the extension.

### 15.6 Versioning

Extensions use Semantic Versioning independently of the core MMP specification version. An extension version bump MUST NOT require a core spec version bump unless the extension is being promoted to core.

### Q&A

**Can an extension become a core frame type?** -- Yes. An extension that proves stable and widely adopted MAY be promoted to a core frame type via a spec version bump. The Consent extension started as an extension and is a candidate for future core inclusion.

---

## 16. Conformance

### 16.1 Minimal Conformance (Relay Node)

A node claiming minimal MMP conformance MUST implement: Layer 0 identity (persistent UUID), Layer 1 transport (length-prefixed JSON over TCP), Layer 2 connection (handshake, heartbeat, gossip), and frame forwarding for relay. It MUST silently ignore unrecognised frame types.

### 16.2 Full Conformance (Cognitive Node)

A node claiming full MMP conformance MUST additionally implement: Layer 3 memory (L0/L1/L2), Layer 4 SVAF evaluation (at minimum heuristic), `state-sync` exchange with drift computation and coupling, and CMB creation with CAT7 field schema.

### 16.3 Cognitive Conformance

Agents that implement Layers 5-7 (Synthetic Memory, xMesh, Application) SHOULD support:

- `remember(fields, parents?)` API -- creating CMBs with optional lineage
- `CMBStore` protocol -- persistent storage and retrieval of Cognitive Memory Blocks
- xMesh insight consumption -- processing insight outputs from the Layer 6 LNN

### 16.4 Testing

Implementations SHOULD provide unit tests for SVAF evaluation, CMB creation, and lineage computation. No formal test suite is defined by this specification yet. Future revisions MAY include a conformance test suite.

### Q&A

**Is Layer 7 (Application) required?** -- No. Minimal conformance is Layers 0-3. Full cognitive conformance adds Layers 4-7. An agent can participate in the mesh without an LLM -- it only needs transport, connection, and memory layers to relay and store CMBs.

---

## 17. Security Considerations

MMP is designed for autonomous agents that share cognitive state. Security must address both traditional protocol threats (spoofing, eavesdropping, injection) and novel threats specific to cognitive coupling (state poisoning, drift manipulation, lineage forgery).

### 17.1 What Crosses the Mesh

| Data type | Crosses mesh | Sensitivity |
|---|---|---|
| L0 Events (raw sensor, interaction) | Never | High -- MUST NOT leave node |
| L1 CMBs (structured, 7 fields) | Via cmb, gated by SVAF | Medium -- contains semantic field text |
| L2 Hidden state (h₁, h₂) | Via state-sync | Low -- opaque neural vectors, not human-readable |
| Mood (valence, arousal) | Via cmb (CMB mood field) | Medium -- affective state, extracted from CMBs per Section 9.3 |
| Messages (direct text) | Via message frame | High -- free-form text content |

Hidden state vectors (h₁, h₂) are compact, opaque neural representations. They encode cognitive patterns, not raw data. However, sufficiently advanced analysis could potentially reconstruct aspects of the input. Implementations handling sensitive domains SHOULD treat hidden state as confidential.

### 17.2 Transport Security

MMP does not mandate transport encryption in the base specification. Implementations SHOULD apply:

| Transport | Encryption | Notes |
|---|---|---|
| TCP (LAN) | TLS 1.3 | RECOMMENDED for production. On trusted LANs, MAY operate without TLS. |
| WebSocket (relay) | WSS (TLS) | MUST for internet relay. Plaintext WS MUST NOT be used over the internet. |
| IPC (local) | None required | Unix domain socket -- OS-level process isolation is sufficient. |
| APNs Push (wake) | Apple TLS | Handled by Apple. Implementation uses APNs certificate. |

### 17.2.1 End-to-End CMB Encryption

WSS (TLS) encrypts the transport -- it protects from eavesdroppers on the wire. But the relay operator can still read the JSON payload inside the TLS tunnel. For `cmb` frames containing CMBs, this means the relay sees all 7 CAT7 field texts in plaintext.

When CMBs transit a relay, implementations MUST encrypt CMB field text end-to-end so the relay forwards opaque ciphertext, not readable fields. The relay MUST NOT be able to read CMB content.

| Layer | What it protects | What it doesn't protect |
|---|---|---|
| WSS (TLS) | Wire eavesdroppers | Relay operator sees plaintext JSON |
| E2E CMB encryption | Relay operator, intermediaries | Only the intended peer can decrypt field text |

The encryption scheme SHOULD use the Ed25519 keypair from Layer 0 (Section 3) for key exchange, with X25519 Diffie-Hellman for shared secret derivation and XChaCha20-Poly1305 for symmetric encryption. The encrypted payload replaces the `fields` object in the CMB:

```json
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

`lineage` (parents, ancestors, method) remains in cleartext. Lineage contains only CMB keys (content hashes) -- not field text. This allows the relay and intermediate nodes to maintain graph structure without reading content.

`state-sync` frames (h₁, h₂ vectors) are opaque floating-point arrays -- not human-readable. They do not require E2E encryption but implementations MAY encrypt them for defense in depth.

On LAN (Bonjour TCP), E2E encryption is RECOMMENDED but not required -- there is no relay intermediary. On trusted LANs, the transport itself provides sufficient isolation.

### 17.3 Node Identity & Authentication

Node identity is UUID-based with mandatory Ed25519 cryptographic identity (Section 3.1.3). Authentication ensures that nodeId claims are verifiable and that relay intermediaries cannot impersonate peers.

- Each node MUST generate an Ed25519 keypair at first launch and persist it alongside the nodeId.
- The public key MUST be included in the handshake frame and DNS-SD TXT record.
- Peers SHOULD verify identity by challenging the node to sign a nonce with its private key.
- Implementations that have not yet adopted cryptographic verification MAY rely on DNS-SD discovery scope and network isolation as an interim trust model, but MUST document this limitation.

### 17.4 Cognitive Threats

MMP introduces threats unique to cognitive coupling that traditional protocol security does not address:

**State poisoning** -- A malicious node sends crafted hidden state vectors (h₁, h₂) designed to skew the receiver's cognitive state toward a desired outcome.
MITIGATION: Drift-bounded blending (Section 10) limits any peer's influence to α < 1. High-drift state is rejected automatically. Consent withdrawal (MMP Consent Extension) provides immediate escape.

**Lineage forgery** -- A node claims false lineage -- listing ancestors it never actually remixed -- to inflate its remix count or inject itself into chains.
MITIGATION: CMB keys are content hashes (md5 of field texts). A forged lineage referencing a non-existent key is detectable. Cryptographic CMB signing (future) would make forgery provably impossible.

**Drift manipulation** -- A node gradually shifts its hidden state to lower drift with a target, then suddenly sends adversarial content once coupling is accepted.
MITIGATION: SVAF per-field evaluation (Layer 4) operates on content, not just drift. Even with low peer drift, adversarial CMB content is evaluated per field and rejected if field drift is high.

**Sybil attack** -- An attacker creates multiple fake nodes to amplify influence in mesh state aggregation.
MITIGATION: Mesh state aggregation (Section 10.1) weights by drift and recency, not by node count. Many aligned Sybil nodes produce the same aggregate as one. Cryptographic identity (Section 3) limits Sybil creation when implemented.

### 17.5 Privacy & Deployment Recommendations

MMP is designed for privacy by default -- L0 data never leaves the node, hidden states are opaque, and SVAF gates what enters. For domains with heightened privacy or IP concerns, the following deployment model is RECOMMENDED:

**LAN Mesh with Controlled LLM** -- For enterprise, healthcare, legal, or any domain where data sovereignty matters: deploy the mesh on a local network with no relay to the internet. Run a controlled, in-house LLM (self-hosted or on-premise) for the Mesh Cognition reasoning step (Layer 7). No data leaves the LAN. No cloud LLM sees the remix subgraph.

- Discovery via Bonjour on the local network -- no DNS queries leave the LAN
- TCP transport with optional TLS -- all traffic stays on-premise
- In-house LLM (e.g., self-hosted Llama, Mistral, or Claude via API with data residency) for Layer 7 reasoning
- No relay node needed -- all agents on the same network
- CMBs, hidden states, and remix subgraphs never leave the controlled environment

Additional privacy considerations:

- Error frames MUST NOT contain sensitive information. The `detail` field is for debugging, not for conveying user data.
- Wake channels expose push tokens to peers. Implementations SHOULD restrict wake channel gossip to trusted relays only.
- The Consent Extension provides protocol-level withdrawal from cognitive coupling -- instantaneous, complete, and non-negotiable.
- Implementations targeting GDPR, HIPAA, or similar regulatory frameworks SHOULD treat CMB field text as personal data and apply appropriate retention and deletion policies at the application layer.

### 17.6 Regulatory Compliance & Audit Trail

CMB immutability and lineage create a **complete, tamper-evident audit trail** by design. Every observation, every remix, every decision is traceable through the DAG:

- **Who** -- `createdBy` on every CMB identifies the agent that produced it.
- **When** -- `createdAt` timestamps every CMB with millisecond precision.
- **What** -- the 7 CAT7 fields capture the full semantic content of the observation.
- **Why** -- `lineage.parents` shows what was directly remixed. `lineage.ancestors` traces the full decision chain.
- **How** -- `lineage.method` records the evaluation method (e.g., SVAF-v2).

Because CMBs are **immutable**, the audit trail cannot be retroactively altered. A CMB once created is never modified -- any action produces a new CMB with lineage pointing back. The complete history is the graph itself.

**Financial & Regulated Domains** -- For financial services, healthcare, and other regulated industries, the CMB remix chain provides the traceability that regulators require:

- Every trading signal, risk assessment, or compliance decision is a CMB with full provenance
- Regulators can trace any decision backward through the remix chain to its originating observations
- The `ancestors` field provides the complete chain without requiring graph traversal -- O(1) lookup
- Immutability guarantees that the audit trail was not modified after the fact
- Combined with the LAN + in-house LLM deployment (Section 17.5), all data stays on-premise and under organisational control

### 17.7 Data Quality & Encoding Trade-offs

CMB quality depends on field extraction accuracy. The protocol does not extract fields -- agents do. Each agent's LLM (or structured-data mapper) decomposes observations into CAT7 fields. If extraction is poor, downstream evaluation inherits that error. MMP provides three layers of defense, but none eliminates the need for quality extraction at the source.

| Layer | Defense | Limitation |
|---|---|---|
| Context Encoder | Maps field text to vectors for drift comparison. Quality directly bounds SVAF quality. | N-gram hashing: paraphrases score 0.31 cosine similarity (poor). Semantic embeddings: 0.69 (good). Implementations SHOULD use semantic embeddings for production deployment. |
| SVAF heuristic | Per-field cosine drift against local memory anchors with temporal decay -- misaligned fields are rejected | Catches drift from the agent's own state, not absolute quality. A consistently poor extractor will pass its own drift checks |
| Neural SVAF | Trained model with learned per-field gate values -- mood gates highest (0.50), perspective lowest (0.06) | Requires trained model; falls back to heuristic when unavailable |

**Per-field evaluation quality is bounded by encoder quality, not model capacity.** Production deployment revealed that n-gram encoding (character trigrams + word bigrams) produces 0.31 cosine similarity for paraphrases -- SVAF cannot distinguish "submit IETF draft today" from "IETF submission, zero blockers, execute now" because the encoder represents them as distant vectors. Replacing n-gram with semantic embeddings (all-MiniLM-L6-v2, 384-dim) raises paraphrase similarity to 0.69 -- a 2.2x improvement -- while preserving topic separation (different topics: 0.03). Implementations SHOULD use semantic embeddings for SVAF evaluation. N-gram encoding is suitable only for prototyping or resource-constrained environments where the quality trade-off is acceptable.

Implementations targeting domains where field extraction quality is critical (healthcare, legal, finance) SHOULD validate extraction output before calling `remember()`. Strategies include:

- **Schema validation** -- reject CMBs with empty or defaulted fields before they enter the mesh
- **Confidence thresholds** -- the LLM can assign a confidence score to its extraction; low-confidence CMBs can be withheld
- **Lineage feedback** -- CMBs that get remixed by other agents (have descendants in the DAG) signal high quality; CMBs that expire without children signal noise. This feedback loop lets the mesh itself shape extraction quality over time
- **Semantic embedding encoder** -- implementations SHOULD use a semantic embedding model (e.g. all-MiniLM-L6-v2) for SVAF drift computation. The evaluation pipeline is encoder-agnostic -- any function that maps text to unit-normalised vectors works. N-gram encoding MAY be used as a zero-dependency fallback.

### 17.8 Consent as a Security Mechanism

The MMP Consent Extension is not just a privacy feature -- it is a security mechanism. Consent withdrawal:

- Overrides ALL coupling evaluation -- a hard gate at Layer 2 that prevents cognitive frames from reaching higher layers.
- Is locally enforceable -- the withdrawing node stops coupling before notifying the peer. Network partition cannot prevent withdrawal.
- Mitigates state poisoning, drift manipulation, and Sybil attacks by allowing immediate disconnection from any suspect peer.

---

## 18. Configuration

Constants are fixed by the specification. Configuration is per-agent and per-implementation. Both are normative -- implementations MUST respect constants and SHOULD use the default configuration values unless the agent's domain requires otherwise.

### 18.1 Protocol Constants

| Constant | Value | Notes |
|---|---|---|
| MAX_FRAME_SIZE | 1,048,576 bytes | Frames exceeding this MUST be rejected |
| HANDSHAKE_TIMEOUT | 10,000 ms | Inbound identification deadline |
| HEARTBEAT_INTERVAL | 5,000 ms | Default; configurable per implementation |
| HEARTBEAT_TIMEOUT | 15,000 ms | Default; configurable per implementation |
| STATE_SYNC_INTERVAL | 30,000 ms | Default periodic re-broadcast |
| WAKE_COOLDOWN | 300,000 ms | Default per-peer wake rate limit |
| PEER_RETENTION | 300 s | Stale peer eviction age |
| DNS-SD_SERVICE_TYPE | _sym._tcp | Service type for Bonjour discovery |
| DNS-SD_DOMAIN | local. | Discovery domain |

### 18.2 Agent Profiles

Each agent type has a pre-built configuration. The profile determines which CMB fields matter most (α_f weights), how long signals stay relevant for SVAF evaluation (freshness), and how long remixed CMBs are retained in local storage (retention). New agent types join the mesh by defining their profile -- no protocol changes needed.

**Freshness** and **retention** are different: freshness controls SVAF temporal drift (how quickly incoming signals become "stale" for evaluation). Retention controls how long the agent's own remixed CMBs are kept in local storage. Regulated domains (legal, finance, health) MUST set retention according to their compliance requirements.

| Profile | Best for | Freshness | Retention | Notes |
|---|---|---|---|---|
| music | Music, ambience | 30min | 24h | Old curations irrelevant. Mood changes fast. |
| coding | Coding assistants, dev tools | 2h | 7d | Session context fades. Weekly patterns useful. |
| fitness | Fitness, health, movement | 3h | 30d | Sedentary patterns need weeks of history. |
| messaging | Chat, notifications, social | 1h | 7d | Conversation context is short-lived. |
| knowledge | News feeds, research, digests | 24h | 30d | News is daily. Trends need monthly context. |
| legal | Legal, compliance, contracts | 24h | Per regulation | Set by jurisdiction. May require years or indefinite. |
| health | Health monitoring, clinical | 3h | Per regulation | Clinical records: HIPAA 6yr, GDPR varies. Consult compliance. |
| finance | Finance, trading, compliance | 2h | Per regulation | MiFID II: 5yr. SEC: 7yr. Set per jurisdiction. |
| uniform | General purpose, prototyping | 30min | 7d | Good starting point. Adjust to your domain. |

### 18.3 CAT7 Field Weights (α_f)

Per-agent field weights control which CMB fields matter most for each agent type. Higher weight = this field has more influence on SVAF evaluation and remix relevance. The schema is fixed (7 fields). The weights are per-agent.

| Agent | foc | iss | int | mot | com | per | mood |
|---|---|---|---|---|---|---|---|
| Coding | 2.0 | 1.5 | 1.5 | 1.0 | 1.2 | 1.0 | 0.8 |
| Music | 1.0 | 0.8 | 0.8 | 0.8 | 0.8 | 1.2 | 2.0 |
| Fitness | 1.5 | 1.5 | 1.0 | 1.5 | 1.0 | 1.0 | 2.0 |
| Knowledge | 2.0 | 1.5 | 1.5 | 1.0 | 0.5 | 1.5 | 0.3 |
| Legal | 2.0 | 2.0 | 1.5 | 1.0 | 2.0 | 1.5 | 0.5 |
| Health | 1.5 | 2.0 | 1.0 | 1.5 | 1.0 | 1.5 | 2.0 |
| Finance | 2.0 | 2.0 | 1.5 | 1.0 | 2.0 | 2.0 | 0.3 |

**Regulated domains** (legal, finance): `issue` and `commitment` always high -- risks and obligations are non-negotiable. **Human-facing domains** (music, fitness, health): `mood` always high -- affect drives the experience. **Knowledge domains** (coding, research): `focus` always high -- subject matter is core.

Custom weights: derive from your domain using these patterns. Implementations SHOULD expose field weights as configuration, not hardcode them.

### 18.4 SVAF Drift Thresholds

SVAF computes a `totalDrift` score (0-1) for each incoming memory. Four zones determine acceptance:

| Zone | Drift | Action | Default |
|---|---|---|---|
| Redundant | max(δ_f) < T_redundant | Discarded -- no field carries novel content | 0.10 |
| Aligned | δ_total ≤ T_aligned | Accepted, full blending | 0.25 |
| Guarded | T_aligned < δ_total ≤ T_guarded | Accepted, attenuated blending | 0.50 |
| Rejected | δ_total > T_guarded | Discarded -- irrelevant domain | -- |

Defaults work for most agents. Override only with domain-specific reason: tighter thresholds for high-precision domains (legal, health), wider for exploratory domains (research, knowledge).

### 18.5 Mood vs Memory Thresholds

Mood and memory use different acceptance paths:

| Signal | Gate | Default | Why |
|---|---|---|---|
| CMB (cmb) | SVAF per-field drift | 0.50 (selective) | Full CMB acceptance -- domain-specific |
| Mood field | Extracted from rejected CMBs | Always delivered | Affect crosses all domain boundaries (Section 9.3) |

### 18.6 Drift Formula

```
totalDrift = (1 - λ) × fieldDrift + λ × temporalDrift

fieldDrift    = Σ(α_f × δ_f) / Σ(α_f)
temporalDrift = 1 - exp(-age / τ_freshness)
λ             = temporalLambda (default 0.3 = 70% content, 30% time)
```

At default settings (`temporalLambda: 0.3`, `freshnessSeconds: 1800`):

| Signal age | Temporal drift contribution |
|---|---|
| 1 minute | ~0.01 -- negligible |
| 30 minutes | ~0.19 -- noticeable |
| 2 hours | ~0.29 -- likely pushes over threshold |

---

## 19. JSON Schema

Formal JSON Schema definitions for core frame types. Implementations SHOULD validate frames against these schemas.

### 19.1 Handshake Frame Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["type", "nodeId", "name", "version"],
  "properties": {
    "type": { "const": "handshake" },
    "nodeId": { "type": "string", "format": "uuid" },
    "name": { "type": "string", "minLength": 1, "maxLength": 64 },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "extensions": { "type": "array", "items": { "type": "string" } }
  }
}
```

### 19.2 CMB Schema

The `cmb` object within a `cmb` frame:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["key", "createdBy", "createdAt", "fields"],
  "properties": {
    "key": { "type": "string", "description": "Content hash: cmb- + md5(field texts)" },
    "createdBy": { "type": "string", "description": "Agent name that created this CMB" },
    "createdAt": { "type": "integer", "description": "Unix ms timestamp of creation" },
    "fields": {
      "type": "object",
      "required": ["focus", "issue", "intent", "motivation", "commitment", "perspective", "mood"],
      "properties": {
        "focus":       { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "issue":       { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "intent":      { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "motivation":  { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "commitment":  { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "perspective": { "type": "object", "required": ["text"], "properties": { "text": { "type": "string" } } },
        "mood": {
          "type": "object",
          "required": ["text"],
          "properties": {
            "text": { "type": "string", "description": "Mood keyword (MUST)" },
            "valence": { "type": "number", "minimum": -1, "maximum": 1, "description": "RECOMMENDED when agent has reliable circumplex data" },
            "arousal": { "type": "number", "minimum": -1, "maximum": 1, "description": "RECOMMENDED when agent has reliable circumplex data" }
          }
        }
      }
    },
    "lineage": {
      "type": "object",
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

```json
{
  "type": "cmb",
  "timestamp": 1774326000000,
  "cmb": {
    "key": "cmb-b2c3d4e5f6a7b8c9",
    "createdBy": "melotune",
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

---

## 20. References

**[RFC 2119]** Bradner, S. (1997). Key words for use in RFCs to Indicate Requirement Levels. *IETF RFC 2119*.

**[DNS-SD]** Cheshire, S. & Krochmal, M. (2013). DNS-Based Service Discovery. *IETF RFC 6763*.

**[CfC]** Hasani, R. et al. (2022). Closed-form continuous-time neural networks. *Nature Machine Intelligence*, 4, 992-1003.

**[Kuramoto]** Kuramoto, Y. (1975). Self-entrainment of a population of coupled non-linear oscillators. *Lecture Notes in Physics*, 39, 420-422.

**[SYM]** Reference implementation (Node.js): github.com/sym-bot/sym

**[SYM-Swift]** Reference implementation (Swift): github.com/sym-bot/sym-swift

**[Russell]** Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161-1178.

**[Autopoiesis]** Maturana, H. & Varela, F. (1980). Autopoiesis and Cognition: The Realization of the Living. *D. Reidel Publishing*.

---

(c) 2026 SYM.BOT Ltd. Specification text licenced under CC BY 4.0. Reference implementations licenced under Apache 2.0.
