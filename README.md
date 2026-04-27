# Mesh Memory Protocol (MMP)

**A wire protocol for collective intelligence.**

[![Spec](https://img.shields.io/badge/spec-v1.0-orange)](https://meshcognition.org/spec/mmp)
[![arXiv](https://img.shields.io/badge/arXiv-2604.19540-b31b1b.svg)](https://arxiv.org/abs/2604.19540)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)

## Canonical home

The Mesh Memory Protocol specification is published at **[meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)**.

- Browse the spec by section: [meshcognition.org/spec/mmp](https://meshcognition.org/spec/mmp)
- Single-page Markdown: [meshcognition.org/spec/mmp-v1.0.md](https://meshcognition.org/spec/mmp-v1.0.md)
- Single-page HTML: [meshcognition.org/spec/mmp-v1.0.html](https://meshcognition.org/spec/mmp-v1.0.html)
- Governance + RFC process: [meshcognition.org/governance](https://meshcognition.org/governance)

## What this repository hosts

- **[`extensions/`](./extensions/)** — community extension drafts, edited via pull request. Promoted to core MMP per the §16.5 lifecycle.
- **[Issues](https://github.com/sym-bot/mesh-memory-protocol/issues)** — public RFC discussion forum for spec changes. File proposals here with `[spec-rfc]` in the title.
- License: [CC BY 4.0](./LICENSE) (specification text). Reference implementations are licensed Apache 2.0.

## Reference implementations

| Language | Project | Scope |
|---|---|---|
| Node.js | [`sym-bot/sym`](https://github.com/sym-bot/sym) | Full L0–L7 |
| Swift | [`sym-bot/sym-swift`](https://github.com/sym-bot/sym-swift) | Full L0–L7, Apple platforms |
| Python | [`sym-bot/mesh-cognition`](https://github.com/sym-bot/mesh-cognition) ([pypi](https://pypi.org/project/mesh-cognition)) | Coupling kernel: L4 (per-field admission) + L6 (state blending) for CfC neural networks |

## Citation

If you use MMP in your research, cite the foundational paper:

> Xu, H. (2026). *Mesh Memory Protocol: Semantic Infrastructure for Multi-Agent LLM Systems.* arXiv:2604.19540.
