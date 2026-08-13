# MMP Machine-Readable Schemas (§20)

JSON Schema (draft 2020-12) for the corrected MMP v2.0 Core Secure profile.
Core objects are closed with `additionalProperties: false`; extension data is
accepted only through the negotiated extension container. This prevents a typo
or an unsigned sibling from being mistaken for a forward-compatible field.

| File | Sections |
|---|---|
| `handshake.schema.json` | Authenticated `client-hello` / `server-hello` / `client-finish` exchange |
| `application.schema.json` | Authenticated opaque application bytes under `metadata.application` |
| `cmb.schema.json` | Two-section decrypted record, cognition key, assertion identity and `mmp-sig-v2.1` |
| `encrypted-cmb-frame.schema.json` | X25519/HKDF/ChaCha20-Poly1305 transport envelope |
| `cmb-frame.schema.json` | Unencrypted migration/profile frame |
| `cmb-fetch.schema.json` / `cmb-fetch-result.schema.json` | §7, §15.8 |
| `tether-attestation.schema.json` | §15.8 (`mmp-tether-v1`) |

Guarded first by the implementation-neutral verifier in this repository and
then by each conforming implementation's packaged-release tests. See
[`../conformance/`](../conformance/) for the normative value-level vectors.
