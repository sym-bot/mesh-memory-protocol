# MMP Machine-Readable Schemas (§20)

JSON Schema (draft 2020-12) for MMP wire objects, matching what the reference
implementation emits. `additionalProperties` is `true` by design (§8: ignore
unrecognised fields), so a schema never rejects a forward-compatible extension.

| File | Sections |
|---|---|
| `handshake.schema.json` | §20.1 |
| `cmb.schema.json` | §20.2, §8.2.1, §18.3.1, §15.8 (optional tether attestation) |
| `cmb-frame.schema.json` | §7 |
| `cmb-fetch.schema.json` / `cmb-fetch-result.schema.json` | §7, §15.8 |
| `tether-attestation.schema.json` | §15.8 (`mmp-tether-v1`) |

Guarded by the reference implementation's suite: real wire objects it produces
must validate against these schemas. See also [`../conformance/`](../conformance/)
for the normative value-level test vectors.
