---
title: 'MMP Extension: CMB Trust Horizon — Mesh Memory Protocol'
description: 'Knowledge-scoped trust-weight horizon — a validator may attest, at verdict time, how a validated CMB''s influence should persist. Opaque, policy-governed, receiver-interpreted; no wire-format changes, retention untouched.'
---

# MMP Extension: CMB Trust Horizon

**Knowledge-Scoped Trust-Weight Horizon**

| | |
|---|---|
| Version | 0.1.0 |
| Status | Draft — Candidate Extension |
| Date | 13 July 2026 |
| Author | Hongwei Xu &lt;hongwei@sym.bot&gt;, SYM.BOT |
| Extends | [MMP v2.0](/spec/mmp) — application-layer convention over §6.3 (Canon tier), §6.4 (lifecycle), and §6.7 (grounding); no changes to the wire format |
| Canonical URL | https://meshcognition.org/spec/mmp/extensions/trust-horizon |
| Licence | CC BY 4.0 (specification text) |

---

## 1. Status

This document is a **Draft Candidate Extension**. It defines an application-layer convention over MMP v2.0; it does not change the MMP wire format and does not require an MMP version bump. Promotion to **Published** status in the MMP §16 Extensions registry requires a second independent implementer to ship interoperable software per the criteria in §7 (Promotion Criteria). Until promotion, this document is published for community visibility and review; it is not yet a registered MMP §16 Extension. A Draft Candidate Extension introduces no protocol-level additions and no entries in the MMP §16 registry until promotion is earned.

## 2. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals. Conformance is claimed by a **receiver**: a node that advertises support for this extension and applies §5's invariants to grants it has authenticated and admitted.

## 3. Abstract

How long should validated knowledge influence a mesh's choices? Any single global answer is wrong in both directions, because knowledge in different domains ages at different rates — and the **same agent** may produce knowledge in several domains. Influence lifetime is therefore a property of the **knowledge**, not of the agent.

This extension specifies **verdict-time trust-horizon grants**: when a validator authors a validation CMB (§6.4), it MAY include an opaque, policy-governed statement of how that knowledge's *weight* should persist. The grant travels inside ordinary CAT7 text — covered by the existing CMB content address and signature — and each receiver interprets it under its own operator policy. Decay of weight is never decay of memory: Canon-tier retention (§6.3) is untouched.

## 4. The grant

### 4.1 Carriage — inside existing, content-bound CMB text

A validator granting a trust horizon MUST encode it as a versioned clause inside the validation CMB's ordinary CAT7 text (RECOMMENDED: a `trust-horizon/1: <opaque policy token>` clause in `categories.commitment.text`). Because CAT7 text is part of the CMB's §8.2.1 content address, the grant is bound by the existing CMB key and assertion signature — **no new frame type, handshake field, CMB schema field, key construction, or signing construction is introduced**. A receiver that does not support this extension processes the validation CMB as an ordinary MMP v2.0 CMB.

The `<opaque policy token>` identifies a horizon under the **operator's policy**; its interpretation (durations, curves, parameters) is private to each deployment and out of scope for this document. The clause SHOULD also carry the operator policy version it was granted under, so later policy changes remain auditable without rewriting history.

### 4.2 Non-negotiable rails

- **The claimer never grants.** A horizon clause is meaningful only in a CMB authored by a validator the receiver recognises for the target (per the receiver's own §6.4 authority resolution) or in a signed operator-policy record. Horizon clauses authored by the claimer of the work MUST be ignored.
- **Grants are policy-governed.** A receiver MUST interpret grant tokens only through its operator's policy; tokens outside that policy have no effect.
- **Grants are append-only.** A correction, revocation, or supersession is a **new** validator-authored CMB referencing the earlier one through ordinary lineage; recorded grants are never rewritten. This keeps supersession itself on the record — essential in domains where *that something was superseded* is part of the knowledge.

### 4.3 Receiver autonomy

Validation and grounding remain ordinary, receiver-relative CMBs. A receiver claiming conformance independently authenticates, admits (§9.2), and interprets a grant under local policy; a grounding CMB (§6.7) MAY reference the granting validation through ordinary lineage, but nothing is automatically copied between them, and receipt of a grant never advances any lifecycle by itself.

## 5. Consumption invariants

A receiver claiming conformance MUST uphold, for any use of grants in deriving influence (authority, ranking, recall weight):

1. **No minting.** A horizon MUST NOT create initial influence, improve initial rank, or change any CMB's lifecycle. It governs only how already-earned, grounded influence persists.
2. **Symmetric semantics.** Positive and negative grounded outcomes referencing the same knowledge MUST receive the same horizon semantics — long-lived merit implies long-lived accountability.
3. **No implicit cross-domain transfer.** Influence derived within one operator-created domain scope MUST NOT be presented in another except through the receiving operator's explicit policy.
4. **Consistent treatment.** Where grounded influence affects more than one consumption path (e.g. both authority derivation and recall ranking), the same attested grant MUST NOT be given conflicting interpretations across those paths.
5. **Retention separation.** This extension MUST NOT itself delete, expire, archive, or demote a CMB; §6.3 retention remains governed only by lifecycle.

How influence is aggregated — curves, parameters, budgets, caps, defaults, and cross-domain policy shapes — is implementation-defined and deliberately out of scope: the invariants above are the entire conformance surface.

## 6. Reference implementations

A reference deployment reports an experimental implementation of this convention as of 2026-07-13; independent interoperability has not yet been established.

## 7. Promotion Criteria

Promotion to **Published** status in the MMP §16 registry requires all of:

1. **A second independent implementation** — a distinct codebase not derived from the reference deployment, maintained by a different implementer.
2. **A cross-implementation conformance exchange** — a documented run in which a grant authored by one implementation is authenticated, admitted, and interpreted by the other, and each §5 invariant is demonstrated by an observable test (e.g. a grant demonstrably failing to mint initial influence; a claimer-authored clause demonstrably ignored).
3. **Review** — maintainer and community review of this document against the exchange results.

On promotion, the Status section is rewritten to **Published**, an Adopters list is added, and the §16.4 registry row is updated. No other sections change at promotion.
