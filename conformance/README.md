# MMP Conformance Test Vectors

The machine-readable vectors this specification names as the **normative
contract** (§8.2.1, §17.4). A conforming implementation MUST reproduce every
expectation exactly.

| File | Sections | Covers |
|---|---|---|
| `cmb-key-v1.json` | §8.2.1 | `cmb1-` content addresses: root + remix forms, NFC normalization, delimiter-injection inertness, sorted-parent-set + receiver binding |
| `cmb-sig-v1.json` | §18.3.1 | `mmp-sig-v1` signing payload bytes + deterministic Ed25519 signatures, broadcast and directed audience binding |
| `svaf-baseline.json` | §9.2, §9.2.1 | Reference-baseline admission math on fixed field vectors: nearest-anchor redundancy basis (both witness directions), aligned/guarded thresholds, the evaluation-time flip window, cold-start bootstrap |
| `tether-v1.json` | §15.8 | Lineage-tether drift checks (faithful / severed / unverifiable / α-weighted), `mmp-tether-v1` attestation payload bytes + signature, kernel comparability |

Signature vectors use a **fixed TEST keypair** (seed = 32×`0x42`, included in
`cmb-sig-v1.json`) — never use it as an identity.

Vectors are generated deterministically from the reference implementation
(`@sym-bot/core`, `scripts/generate-conformance-vectors.js`) and guarded by its
test suite, so the reference implementation cannot drift from this published
contract without failing its own tests. The SVAF vectors carry raw field
vectors and no text: they test the *math*, not the encoder (§9.2.1 — live
admission is receiver-divergent by design; thresholds are meaningful only
within a pinned encoder).
