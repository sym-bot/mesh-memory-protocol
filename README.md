# Mesh Memory Protocol (MMP)

**The wire protocol for mesh cognition — collective intelligence with no center.**

[![Spec](https://img.shields.io/badge/spec-v2.0-orange)](https://meshcognition.org/spec/mmp)
[![arXiv](https://img.shields.io/badge/arXiv-2604.19540-b31b1b.svg)](https://arxiv.org/abs/2604.19540)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)

## Canonical source and mirror status

The Mesh Memory Protocol specification is published at **[meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)**.
Its normative source is
[`sym-bot/meshcognition-website`](https://github.com/sym-bot/meshcognition-website).
This repository is a manually synchronized public mirror for offline use, releases and RFC discussion.
When the repositories differ, the website source controls. See [MIRROR-SOURCE.md](./MIRROR-SOURCE.md)
for the synchronized revision.

- Browse the spec by section: [meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)
- Single-page Markdown: [meshcognition.org/spec/mmp-v2.0.md](https://meshcognition.org/spec/mmp-v2.0.md) ([in this repo](./spec/mmp-v2.0.md))
- Single-page HTML: [meshcognition.org/spec/mmp-v2.0.html](https://meshcognition.org/spec/mmp-v2.0.html) ([in this repo](./spec/mmp-v2.0.html))
- Governance + RFC process: [meshcognition.org/governance](https://meshcognition.org/governance)

## What this repository hosts

- **[`spec/`](./spec/)** — the single-page specification (Markdown + HTML), mirrored from the canonical site for history, offline reading and GitHub rendering.
- **[`schema/`](./schema/)** and **[`conformance/`](./conformance/)** — a mirror of the machine-readable MMP v2.0 contract owned by the website source repository.
- **[`scripts/verify-vectors.mjs`](./scripts/verify-vectors.mjs)** — mirrored implementation-neutral verifier for the published byte constructions and negative cases. Run `npm ci && npm test`.
- **[`extensions/`](./extensions/)** — community extension drafts, edited via pull request. Promoted to core MMP per the §16.5 lifecycle.
- **[Issues](https://github.com/sym-bot/mesh-memory-protocol/issues)** — public RFC discussion forum for spec changes. File proposals here with `[spec-rfc]` in the title.
- License: [CC BY 4.0](./LICENSE) (specification text). Reference implementations are licensed Apache 2.0.

## Reference implementations

| Language | Project | Scope |
|---|---|---|
| Node.js | [`sym-bot/sym`](https://github.com/sym-bot/sym) | Open protocol substrate and transparent baseline admission profile |
| Swift | [`sym-bot/sym-swift`](https://github.com/sym-bot/sym-swift) | Apple-platform implementation |
| Node.js | [`sym-bot/sym-mesh-channel`](https://github.com/sym-bot/sym-mesh-channel) | MCP channel using the MMP/SYM substrate |

`xmesh-core` is a proprietary conforming cognition runtime. It is tested at the
public MMP boundary but is not represented as an open reference implementation.

The published specification and artifacts generated from the website source define conformance.
This mirror makes them convenient to consume; it does not independently define alternative bytes.
A reference implementation is evidence of conformance, not the standard itself.

## Foundational papers

MMP is one layer of a characterised stack — *which records to admit* (SVAF, with per-category evidence and one whole-record outcome) · *whether a center-free collective can recover the answer* (Mesh Inference) · *how each agent tracks an evolving latent in time* (Liquid Necessity) — carried by the protocol and shown in deployed implementations. The canonical record is **[meshcognition.org/research](https://meshcognition.org/research/)**:

| Paper | arXiv |
|---|---|
| **On the Necessity of a Liquid Substrate for Mesh Intelligence** — for any *fixed-weight* agent folding peers' projections online, an adaptive timescale and gap-awareness are necessary (necessary, not sufficient) | [2606.28413](https://arxiv.org/abs/2606.28413) |
| **Mesh Inference** — A Formal Model of Collective Inference Without a Center (convergence, identification-completeness, observation-only confidentiality) | [2606.19537](https://arxiv.org/abs/2606.19537) |
| **MMP** — Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems | [2604.19540](https://arxiv.org/abs/2604.19540) |
| **MeloTune** — On-Device Arousal Learning and Peer-to-Peer Mood Coupling (first deployed reference) | [2604.10815](https://arxiv.org/abs/2604.10815) |
| **SVAF** — Symbolic-Vector Attention Fusion for Collective Intelligence (whole-record receiver admission with per-category evidence, L4) | [2604.03955](https://arxiv.org/abs/2604.03955) |

## Citation

If you use MMP in your research, cite the protocol paper:

> Xu, H. (2026). *Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems.* arXiv:2604.19540.
