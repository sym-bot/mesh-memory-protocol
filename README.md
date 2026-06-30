# Mesh Memory Protocol (MMP)

**The wire protocol for mesh cognition — collective intelligence with no center.**

[![Spec](https://img.shields.io/badge/spec-v1.0.3-orange)](https://meshcognition.org/spec/mmp)
[![arXiv](https://img.shields.io/badge/arXiv-2604.19540-b31b1b.svg)](https://arxiv.org/abs/2604.19540)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)

## Canonical home

The Mesh Memory Protocol specification is published at **[meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)**.

- Browse the spec by section: [meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)
- Single-page Markdown: [meshcognition.org/spec/mmp-v1.0.md](https://meshcognition.org/spec/mmp-v1.0.md) ([in this repo](./spec/mmp-v1.0.md))
- Single-page HTML: [meshcognition.org/spec/mmp-v1.0.html](https://meshcognition.org/spec/mmp-v1.0.html) ([in this repo](./spec/mmp-v1.0.html))
- Governance + RFC process: [meshcognition.org/governance](https://meshcognition.org/governance)

## What this repository hosts

- **[`spec/`](./spec/)** — the single-page specification (Markdown + HTML), mirrored from the canonical site. The site is the source of truth; these are kept in sync for git history, offline reading, and GitHub rendering.
- **[`extensions/`](./extensions/)** — community extension drafts, edited via pull request. Promoted to core MMP per the §16.5 lifecycle.
- **[Issues](https://github.com/sym-bot/mesh-memory-protocol/issues)** — public RFC discussion forum for spec changes. File proposals here with `[spec-rfc]` in the title.
- License: [CC BY 4.0](./LICENSE) (specification text). Reference implementations are licensed Apache 2.0.

## Reference implementations

| Language | Project | Scope |
|---|---|---|
| Node.js | [`sym-bot/sym`](https://github.com/sym-bot/sym) | Full L0–L7 |
| Swift | [`sym-bot/sym-swift`](https://github.com/sym-bot/sym-swift) | Full L0–L7, Apple platforms |
| Python | [`sym-bot/mesh-cognition`](https://github.com/sym-bot/mesh-cognition) ([pypi](https://pypi.org/project/mesh-cognition)) | Coupling kernel: L4 (per-field admission) + L6 (Cognitive State) for CfC neural networks |
| Node.js | [`sym-bot/xmesh-agent`](https://github.com/sym-bot/xmesh-agent) | Autonomous agent runtime — Anthropic / OpenAI / Ollama on the MMP wire |
| Node.js | [`sym-bot/sym-mesh-channel`](https://github.com/sym-bot/sym-mesh-channel) | Real-time Claude-to-Claude mesh (Claude Code plugin) — first non-Anthropic Channels implementation on MMP |

## Foundational papers

MMP is one layer of a characterised stack — *which to admit* (SVAF) · *whether a center-free collective can recover the answer* (Mesh Inference) · *how each agent tracks an evolving latent in time* (Liquid Necessity) — carried by the protocol and shown in a deployed reference. The canonical record is **[meshcognition.org/research](https://meshcognition.org/research/)**:

| Paper | arXiv |
|---|---|
| **Mesh Inference** — A Formal Model of Collective Inference Without a Center (convergence, identification-completeness, observation-only confidentiality) | [2606.19537](https://arxiv.org/abs/2606.19537) |
| **On the Necessity of a Liquid Substrate for Mesh Intelligence** — for any *fixed-weight* agent folding peers' projections online, an adaptive timescale and gap-awareness are necessary (necessary, not sufficient) | [2606.28413](https://arxiv.org/abs/2606.28413) |
| **MMP** — Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems | [2604.19540](https://arxiv.org/abs/2604.19540) |
| **SVAF** — Symbolic-Vector Attention Fusion for Collective Intelligence (the per-field admission gate, L4) | [2604.03955](https://arxiv.org/abs/2604.03955) |
| **MeloTune** — On-Device Arousal Learning and Peer-to-Peer Mood Coupling (first deployed reference) | [2604.10815](https://arxiv.org/abs/2604.10815) |

## Citation

If you use MMP in your research, cite the protocol paper:

> Xu, H. (2026). *Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems.* arXiv:2604.19540.
