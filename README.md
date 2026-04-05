# Mesh Memory Protocol (MMP)

**An Agent-to-Agent Protocol for Collective Intelligence**

[![MMP Spec](https://img.shields.io/badge/spec-v0.2.1-purple)](https://sym.bot/spec/mmp)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)

---

AI agents today run in isolation. They share data through message buses, API calls, or shared databases — but they do not think together. MMP defines how autonomous agents discover each other, exchange cognitive state, evaluate incoming signals per-field, and remix each other's observations into new understanding — without servers, without central coordination, and without sharing raw data.

## What Makes MMP Different

| Dimension | Message Bus | Shared Memory | MCP / A2A | **MMP** |
|---|---|---|---|---|
| What flows | Messages | Shared state | Tool calls / Tasks | **Remixed CMBs + hidden state** |
| Evaluation | Topic routing | None | None | **Per-field SVAF (7 dimensions)** |
| Intelligence | None | Central model | None | **LLM reasons on remix graph** |
| Coordination | Central broker | Central store | Client-server | **Agent-to-agent (no centre)** |
| Memory | Fire and forget | Mutable shared | Stateless | **Immutable CMBs with lineage** |

## Specification

The full specification is published at **[sym.bot/spec/mmp](https://sym.bot/spec/mmp)** and mirrored in this repository:

- **[spec.md](spec.md)** — MMP v0.2.1 (current)
- **[extensions/consent-v0.1.0.md](extensions/consent-v0.1.0.md)** — Consent Extension

### 8-Layer Architecture

| Layer | Name | Description |
|---|---|---|
| 7 | Application | Domain agents — where LLMs reason on the remix subgraph |
| 6 | xMesh | Per-agent LNN — continuous-time cognitive state (CfC) |
| 5 | Synthetic Memory | LLM-derived knowledge encoded to CfC hidden state |
| 4 | Coupling | SVAF per-field evaluation — the gate. Nothing enters cognition without passing. |
| 3 | Memory | Three tiers: L0 events (local), L1 structured (CMBs), L2 cognitive (state-sync) |
| 2 | Connection | Handshake, heartbeat, gossip, wake, consent |
| 1 | Transport | TCP/Bonjour (LAN), WebSocket (relay), IPC (local tools) |
| 0 | Identity | UUID v7 + Ed25519 keypair per node |

## Reference Implementations

| SDK | Language | Install | Repo |
|---|---|---|---|
| **SYM** | Node.js | `npm install @sym-bot/sym` | [sym-bot/sym](https://github.com/sym-bot/sym) |
| **SYM Swift** | Swift/iOS | Swift Package Manager | [sym-bot/sym-swift](https://github.com/sym-bot/sym-swift) |

## Key Concepts

### Cognitive Memory Blocks (CMBs)

Every signal is decomposed into 7 typed semantic fields (CAT7 schema): **focus**, **issue**, **intent**, **motivation**, **commitment**, **perspective**, **mood**. CMBs are immutable — when an agent remixes a signal, it creates a new CMB with lineage pointing to the source.

### SVAF (Symbolic-Vector Attention Fusion)

Per-field evaluation of incoming signals. Each of 7 fields is evaluated independently — a signal with relevant mood but irrelevant focus is partially accepted, not ambiguously scored. Each agent defines its own field weights (α_f) — no routing configuration needed.

### Remix

When an agent processes a peer's CMB through its own domain intelligence and produces **new knowledge** that didn't exist before. The growing DAG of remixed CMBs IS the collective intelligence.

### CMB Lifecycle

| State | Trigger | Anchor Weight |
|---|---|---|
| observed | Agent creates CMB | 1.0 |
| remixed | Peer remixes it | 1.5 |
| validated | Human acts on it | 2.0 |
| canonical | Validated + remixed by 2+ agents | 3.0 |
| archived | No remix for 30 days | 0.5 |

## Production Deployment

SYM.BOT Ltd runs its operations on MMP with 4 autonomous agents (COO, Research, Marketing, Product) producing real decisions for the founder daily. This is both the reference deployment and the most credible demonstration of the protocol.

## Contributing

MMP is an open specification published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reference implementations are [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

- Spec feedback: [issues](https://github.com/sym-bot/mesh-memory-protocol/issues) or spec@sym.bot
- SDK contributions: see [sym](https://github.com/sym-bot/sym) and [sym-swift](https://github.com/sym-bot/sym-swift)

## Author

**Hongwei Xu** — [SYM.BOT Ltd](https://sym.bot)

Mesh Memory Protocol, MMP, SYM, and related marks are trademarks of SYM.BOT Ltd.
