---
title: 'MMP Extension: Admission Attestations (sym-attest) — Mesh Memory Protocol'
description: 'The wire form of admission attestations: a signed, chained attestation per gated record, signed checkpoints over each chain, witness co-signatures, and informational node statistics. Negotiated as sym-attest-v1.'
---

# MMP Extension: Admission Attestations

**Signed admission evidence, chained per attester, checkpointed and witnessed**

| | |
|---|---|
| Version | 1.0.0 |
| Status | Draft — Candidate Extension |
| Date | 8 October 2026 (revised; first draft 2 October 2026) |
| Author | SYM.BOT |
| Negotiation token | `sym-attest-v1` |
| Extends | [MMP v2.0](/spec/mmp) — §9.2.1 (per-category verdicts), §16 (extension negotiation), §17.2 (admission attestations) |
| Canonical URL | https://meshcognition.org/spec/mmp/extensions/sym-attest |
| Licence | CC BY 4.0 (specification text) |

---

## 1. Status

This document is a **Draft Candidate Extension**. It defines four extension frames negotiated through MMP §16. It changes no core frame, record or construction.

The SYM reference runtime already sends frames with this purpose, under the bare type names `attestation`, `checkpoint`, `witness` and `node-stats`. It sends them without negotiation and signs them with a construction that this document corrects. §9 lists the differences. This document defines the registered form, which an implementation sends only under the negotiated token. Promotion to Published follows §10.

## 2. Conventions and conformance

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

A node claims conformance by offering `sym-attest-v1` in its handshake and following §4–§8 with every peer that selects it. `lp(x)`, `decimal(x)` and NFC are as defined in MMP §8.8.4. Every signature here is an Ed25519 signature by an identity key, verified by the one rule of MMP §18.3.2. The frames' shapes are published as [sym-attest-frame.schema.json](/spec/mmp/schema/sym-attest-frame.schema.json): every object is closed, and a frame that fails it is discarded whole. The draft vector [sym-attest-v1.json](/spec/mmp/conformance/v2/sym-attest-v1.json) pins the four signed constructions, a chain of three checkpoints with 1-, 2- and 3-leaf segments, a witness, three conflicting pairs, two pairs that are not conflicts, and the link checks.

## 3. Abstract

MMP §17.2 requires a cognitive node's admission attestations to "expose the observable decision and per-category evidence", and §9.2.1 fixes the per-category verdict vocabulary. MMP defines no wire form for them. This extension defines one:

- an **attestation**: one signed statement per record a node gated through SVAF, chained to the node's previous attestation;
- a **checkpoint**: a signed commitment to a prefix of an attester's chain;
- a **witness**: a peer's signature over a checkpoint it holds, so an attester that signs two different histories can be caught;
- **node statistics**: an unsigned, informational summary.

An attestation proves who evaluated which record, in which room, with what result. It never proves that the evaluation was honest. That is the same limit MMP §15.8 states for tether attestations.

## 4. Negotiation and carriage

- The extension is active between two peers only when both offer `sym-attest-v1` and the server selects it (MMP §16.3). A node MUST NOT send the frames below to a peer for which it is not active. A receiver MUST ignore them from such a peer.
- The frames travel only on a CONNECTED Core Secure session (MMP §5.3), and only as the inner frame of a `control-encrypted` envelope (MMP §7.1, §18.2.1).
- **Attestations, checkpoints and witnesses are author-signed.** Their origin is the signature of the node they name, verified against the key the receiver binds to that nodeId (MMP §3.4). It never comes from the session that delivered them. The weight they carry is that node's authority, resolved as §6 says. They MAY be relayed to other peers for which the extension is active (§6).
- **Node statistics are session-bound.** They describe the session's proven peer and no one else.

Frame types follow MMP §16.2 (`<extension>-<name>`), using the extension name `sym-attest`.

## 5. Frames

### 5.1 `sym-attest-attestation`

```
{
  "type": "sym-attest-attestation",
  "attestation": {
    "of": "cmb-<64 lowercase hex>",
    "assertionId": "asrt-<64 lowercase hex>",
    "by": "<attester nodeId>",
    "at": 1786611600000,
    "room": "<room>",
    "method": "<evaluation method token>",
    "verdict": "aligned",
    "categories": {
      "focus": "admit", "issue": "admit", "intent": "guard", "motivation": "admit",
      "commitment": "silent", "perspective": "admit", "mood": "admit"
    },
    "role": "participant",
    "seq": 42,
    "prev": "<64 lowercase hex>",
    "sigAlg": "ed25519",
    "sig": "<unpadded base64url Ed25519 signature>"
  }
}
```

- `of` and `assertionId` identify the evaluated record: its cognition key and its assertion identity (MMP §8.8.2).
- `by` is the attester, a nodeId in its lowercase form (MMP §3.1.1). `at` is the attester's clock in milliseconds, information only: it is unwitnessed and confers nothing (MMP §6.6.10).
- `room` is the attester's authenticated room. A receiver in another room MUST discard the attestation.
- `method` names the evaluation method (for example `neural` or `heuristic`), as a token matching `^[a-z0-9][a-z0-9_-]{0,31}$`. It is signed.
- `verdict` is the whole-record decision: `aligned`, `guarded`, `redundant` or `rejected` (MMP §9.2).
- `categories` MUST carry exactly the seven CAT7 categories, and nothing else. Each value is one of `admit`, `guard`, `redundant`, `reject` and `silent`, exactly as MMP §9.2.1 defines them.
- `role` is the role the attester claimed when it evaluated, as a token matching `^[a-z0-9][a-z0-9_-]{0,63}$` (long enough for any MMP §6.6.2 role). It is a hint: a receiver resolves the attester's authority itself (§6).
- `seq` counts the attester's attestations from 1, by one each time. `prev` is `genesis` for `seq` 1. Otherwise it is the lowercase hex SHA-256 of the previous attestation's signature bytes, so the attestations form one chain per attester.

**Signature.** `sig` is the attester's Ed25519 identity-key signature over:

```
UTF8("mmp-attest-v1\n") ||
lp(of) || lp(assertionId) || lp(by) || lp(decimal(at)) || lp(NFC(room)) ||
lp(method) || lp(verdict) ||
lp(categories.focus) || lp(categories.issue) || lp(categories.intent) ||
lp(categories.motivation) || lp(categories.commitment) ||
lp(categories.perspective) || lp(categories.mood) ||
lp(role) || lp(decimal(seq)) || lp(prev)
```

**Emission.** A node SHOULD emit one attestation for each record it gates through SVAF, whether it admits or refuses it, at gating time. It MUST NOT sign two attestations with the same `seq`. It MUST persist its chain head, so that a restart continues the chain rather than forking it.

- **Core Secure records only.** A node MUST NOT sign or send an attestation about a record it did not verify under Core Secure (MMP §8.8.5), such as a record held under a Legacy Import profile: that record has no verified assertion identity to name.
- **Never about a directed record.** An attestation discloses the attested record's cognition key, assertion identity and verdict to every peer that receives it, which would make it a confirmation oracle on a one-to-one record. A node MUST NOT send or relay an attestation about a record whose signed `metadata.to` is not null. It MAY keep such attestations for its own operator.

### 5.2 `sym-attest-checkpoint`

```
{
  "type": "sym-attest-checkpoint",
  "checkpoint": {
    "by": "<attester nodeId>", "room": "<room>", "fromSeq": 41, "uptoSeq": 48,
    "prev": "<the previous checkpoint's root>", "root": "<64 lowercase hex>",
    "at": 1786611600000, "sigAlg": "ed25519", "sig": "<unpadded base64url>"
  }
}
```

**Chained, never over a suffix.** Each checkpoint covers the attester's attestations since its previous checkpoint, `seq` `fromSeq` to `uptoSeq` in order, and is chained to the previous checkpoint's root. So it commits to the whole history from `seq` 1, while the attester needs to hold only the attestations since its last checkpoint. `fromSeq` is 1 and `prev` is `genesis` for an attester's first checkpoint. Otherwise `fromSeq` is the previous checkpoint's `uptoSeq` plus 1, and `prev` is its `root`. `uptoSeq` is at least `fromSeq`. An attester MUST NOT sign a root over anything other than this: a root over the attestations it happens to still hold, after it has dropped older ones, is not a checkpoint.

```
leaf(i)     = SHA-256(UTF8("mmp-attest-leaf-v1\n") || signatureBytes(attestation i))
node(l, r)  = SHA-256(UTF8("mmp-attest-node-v1\n") || l || r)

level 0     = leaf(fromSeq), leaf(fromSeq + 1), ..., leaf(uptoSeq)
level n + 1 = node(level n [0], level n [1]), node(level n [2], level n [3]), ...;
              a last node with no partner is carried up unchanged, never paired with itself
segment     = the single node left (leaf(fromSeq) itself when fromSeq = uptoSeq)

root        = lowercaseHex(SHA-256(UTF8("mmp-attest-chain-v1\n") ||
                                   lp(prev) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) ||
                                   lp(lowercaseHex(segment))))
```

`signatureBytes` is the 64 bytes the attestation's `sig` encodes. This is the promote-odd pairing of MMP §8.2.1, with its own domain tags. A checkpoint is self-verifying given its segment and its signed `prev`. Proving that an old attestation is inside the latest root therefore walks back through every checkpoint since, which costs one segment per checkpoint rather than a logarithmic path; that is the price of the attester holding only its last segment. `sig` is the attester's signature over:

```
UTF8("mmp-attest-checkpoint-v1\n") ||
lp(by) || lp(NFC(room)) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) ||
lp(prev) || lp(root) || lp(decimal(at))
```

**Emission.** An attester SHOULD checkpoint every 8 attestations, and MAY checkpoint at other times. It MUST persist each attestation since its last checkpoint, with that checkpoint's `uptoSeq` and `root`, before it sends any of them. An attester that has lost them MUST NOT sign a checkpoint over fewer: its checkpoint chain ends there, visibly, and it signs no further checkpoint: a new chain from `fromSeq` 1 would overlap the old one, and is itself equivocation (§5.2).

**Link checks.** A receiver refuses a checkpoint whose `uptoSeq` is below its `fromSeq`. A receiver that holds the checkpoint whose `root` is a new checkpoint's `prev` MUST check that the new `fromSeq` is that checkpoint's `uptoSeq` plus 1, and discard the new one otherwise, as malformed rather than as evidence. (The schema already requires `prev` to be `genesis` exactly when `fromSeq` is 1.)

**Equivocation.** Two valid checkpoints from one attester that are not the same checkpoint (the same `fromSeq`, `uptoSeq`, `prev` and `root`) prove that it signed two histories when their ranges `fromSeq`..`uptoSeq` overlap (they share a seq: `a.fromSeq ≤ b.uptoSeq` and `b.fromSeq ≤ a.uptoSeq`), or when they name the same `prev`. One chain never does either: its ranges are consecutive and each `prev` has one successor. The rule catches a fork whatever boundaries the attester cuts each history at. A receiver keeps the copy it held first as that position's checkpoint and the other as evidence. From then on it MUST NOT witness any checkpoint of that attester, and MAY drop that attester's further checkpoints unverified, which also bounds the evidence it keeps. It SHOULD report the conflict to its operator. It relays the conflicting copy once, as evidence, to the peers it relays checkpoints to, so that the conflict spreads as the first copy did. A witness it signed before it knew of the conflict stands: a witness states only what its signer held.

### 5.3 `sym-attest-witness`

```
{
  "type": "sym-attest-witness",
  "witness": {
    "attester": "<attester nodeId>", "room": "<room>", "fromSeq": 41, "uptoSeq": 48,
    "root": "<64 lowercase hex>", "by": "<witness nodeId>", "role": "participant",
    "at": 1786611600000, "sigAlg": "ed25519", "sig": "<unpadded base64url>"
  }
}
```

`sig` is the witness's signature over:

```
UTF8("mmp-attest-witness-v1\n") ||
lp(attester) || lp(NFC(room)) || lp(decimal(fromSeq)) || lp(decimal(uptoSeq)) || lp(root) ||
lp(by) || lp(role) || lp(decimal(at))
```

`by` is the witness and `attester` the checkpoint's signer, each a nodeId in its lowercase form (MMP §3.1.1). `fromSeq`, `uptoSeq` and `root` are the witnessed checkpoint's. `role` follows the attestation's `role` grammar.

**Emission.** A node that stores a verified checkpoint from another attester SHOULD witness it, once per (`attester`, `uptoSeq`), including across restarts. It MUST NOT witness its own checkpoint, or a checkpoint it knows to be in conflict. A witness states only that its signer held this root for this range; because the root is chained, it vouches for the attester's history up to `uptoSeq`. Because a witness carries the range, two witnesses, or a witness and a checkpoint, for one attester whose ranges overlap without being the same range and root show that either the attester signed two histories or a witness signed a range the attester never did. They are a lead, not proof. Only two attester-signed checkpoints that conflict under §5.2 are equivocation evidence and have §5.2's consequences. A receiver that holds the attester-signed checkpoint for a witness's range, and finds a different `root`, holds evidence against that witness, and MAY mute it.

### 5.4 `sym-attest-node-stats`

```
{ "type": "sym-attest-node-stats",
  "stats": { "emitted": 120, "admitted": 37, "memory": 157, "at": 1786611600000 } }
```

`emitted` is the number of records this node authored that it holds. `admitted` is the number of peer records it holds. `memory` is the total. The frame is unsigned and self-reported. A receiver MUST attribute it to the session's proven peer, MUST NOT store it as evidence, and MUST NOT use it for admission, authority, trust or ranking. A node SHOULD NOT send it more often than every 15 seconds.

## 6. Receiving and relaying

A receiver processes an attestation, checkpoint or witness in this order. It MUST discard the frame at the first step that fails:

1. Validate the frame against the schema (§2): closed objects, every token's grammar and vocabulary, lowercase nodeIds, exactly seven category verdicts, and a checkpoint's `uptoSeq` is not below its `fromSeq`.
2. Check that the room equals the receiver's own authenticated room.
3. Check that the signature is canonical unpadded base64url of 64 bytes.
4. Drop a duplicate. Duplicates are judged by what a frame asserts, not by its bytes: an attestation is a duplicate when its signature is already held; a checkpoint when one is held for the same (`by`, `fromSeq`, `uptoSeq`) with the same `prev` and `root`; a witness when one is held for the same (`attester`, `fromSeq`, `uptoSeq`, `by`) with the same `root`. A later copy of a held statement (a witness signed again after a restart, for example) is a duplicate, never a new statement to store and relay.
5. Apply the §5.2 link check against a held checkpoint whose `root` is the new checkpoint's `prev`: a checkpoint that does not start right after it is discarded as malformed, not kept as evidence.
6. Resolve the signer's key through the receiver's binding for that nodeId (MMP §3.4). If there is no binding, discard. A key carried by the delivering session never stands in for one.
7. Spend the **session gossip budget** of the session that delivered the frame: RECOMMENDED, a token bucket per session. A frame the budget cannot pay for is discarded unverified. The budget is spent *before* verification, so that it bounds how much signature verification any one peer can make the receiver do. It is charged to the delivering session, which the session proves, never to the attester the frame names. Before verification a receiver MAY also discard, unverified, a checkpoint or witness for a position older than every position it holds from that attester, a frame from a peer it has muted for relaying invalid frames, a witness for a checkpoint it does not hold, and any further checkpoint from an attester it holds equivocation evidence against (two conflicting checkpoints that attester signed, §5.2). It MUST NOT discard as stale a conflicting copy of a position it holds: that copy is the evidence.
8. Verify the signature (MMP §18.3.2).
9. Apply the limits that need an authenticated signer, only *after* verification: RECOMMENDED, at most 30 attestations per (`of`, `by`) per 60 s, for checkpoints at most 4 a second per attester, and a **global ceiling** on what the receiver stores and relays across all sessions. `by` is unauthenticated until the signature verifies, so a limit spent earlier would let forgeries naming an honest attester use up that attester's allowance; and a global budget spent before verification would let one peer's forgeries starve every other peer.
10. Store it, then relay it once to the other peers for which the extension is active, subject to §5.1 (never an attestation about a directed record the receiver holds). Never relay it back to the peer it came from.

An attestation MUST NOT change the receiver's own admission decision for the record it describes, nor any lifecycle or authority. Receiver autonomy is unconditional (MMP §9.2). An attestation is evidence about its attester. A receiver that weighs it at all finds the attested record by `assertionId`, not by cognition key, and weighs the attestation by the attester's authority as MMP §6.6.9 and §6.6.10 resolve it:

- the attester's role counts only when the key that verifies the attestation's signature is the subject key of an in-force grant for `by` (§6.6.9);
- it is resolved against the receiver's in-force set at the moment the weight is applied, not when the attestation was signed (§6.6.10);
- a scoped grant counts only for an attested record inside its scope, judged from that record's own signed fields, never from anything the attestation says (§6.6.2);
- an issuer, and any role that confers nothing on admission, counts as a participant.

A tally of attestations is not Sybil-resistant: a participant counts once, and identities cost nothing to mint. A count means no more than the authority behind each attestation in it.

## 7. Relationship to the core

- **MMP §17.2.** This is the registered wire form of the admission attestations that §17.2 requires a cognitive node to expose. A node also exposes them to its own operator. It exposes them to peers only through this extension, because a node MUST NOT require a peer to support any extension (MMP §16.1).
- **MMP §9.2.1** fixes the per-category vocabulary used here.
- **Placeholder tokens.** The MMP handshake vector offers the strings `receipts-v1`, `admission-attestation-v1` and `checkpoints-v1`. They are example offers that exercise negotiation. They are not registered, and this document does not define them.

## 8. Security considerations

- **Disclosure.** Attestations reveal which records a node evaluated and what it decided, to every peer with the extension active. `of` is a content address, which an outsider can use as a confirmation oracle (MMP §5.9). That is why no attestation about a directed record ever leaves its attester (§5.1). A node SHOULD offer the extension only in rooms where the remaining disclosure is acceptable. A gateway MUST NOT relay interior attestations across its boundary.
- **Equivocation.** The chain (`prev`), checkpoints and witnesses together make a forked history detectable. They do not make it impossible.
- **Domain separation.** The four signed constructions carry the domain tags `mmp-attest-v1`, `mmp-attest-checkpoint-v1`, `mmp-attest-witness-v1` and, inside the root, the leaf, node and chain tags. They therefore cannot be confused with each other, with the record signature (MMP §8.8.4), with the handshake proof (MMP §5.2.1), or with any other signature made with the same identity key.
- **Time.** `at` is attester-asserted and confers nothing. Ordering decisions use receiver-local receipt time, as MMP §6.7 does for outcomes.

## 9. Differences from the deployed runtime (informative)

The SYM 0.13 runtime differs from this document in eight ways:

- It uses bare frame types (`attestation`, `checkpoint`, `witness`, `node-stats`) and no negotiation.
- Its attestation signature is over a `|`-joined string with no domain tag, and `method` is not signed. Its checkpoint and witness payloads use the literal prefixes `checkpoint|` and `witness|`.
- It names the room field `roster` and the position field `upto_seq`.
- It carries no `assertionId`.
- Its checkpoint Merkle tree pairs an unpaired node with itself. MMP §8.2.1 rejects that construction for the cognition address, because it lets two different leaf lists share a root.
- Its node statistics carry a self-asserted `name` and `nodeId`.
- It resolves keys from a roster that can be fed by unproven hellos.
- It relays these frames to every peer, whether or not that peer can use them.

This revision also changes what sym 0.14.0 sends under `sym-attest-v1`: checkpoints are chained (§5.2) where sym 0.14.0 commits to the attestations it still holds, and witnesses carry and sign `fromSeq`; `by` and `attester` are lowercase nodeIds where sym accepts any printable string; `role` may be 64 characters where sym accepts 32; and no attestation is sent about a directed record or a Legacy Import record, where sym 0.14.0 sends both.

The bare-name frames are legacy. A Core Secure session never selects, sends or accepts them. An implementation sends them only under an explicitly selected Legacy Import profile (MMP §17.3), and sends the registered frames only under `sym-attest-v1`.

## 10. Promotion criteria

The extension is promoted to Published when two conditions hold:

- a second, independent implementation interoperates with the first on all four frames;
- a public vector pins the four signed constructions and the checkpoint root, including an odd-length chain and an equivocating pair. The draft vector [sym-attest-v1.json](/spec/mmp/conformance/v2/sym-attest-v1.json) already does; promotion needs it to pass against a second implementation.

## 11. Change log

- **1.0.0 (2 October 2026, draft):** first registered form. The receiving order spends the delivering session's gossip budget before verification and the per-attester limit after it, as sym 0.14.0 does.
- **1.0.0 (8 October 2026, revised draft, folded into MMP 2.0 update 1):** checkpoints chained to the previous root, with `fromSeq` and `prev`, never over a suffix; equivocation is overlapping ranges or a shared `prev`, with link checks, no further witnessing after a conflict, and a visible end to a chain whose segment was lost; witnesses carry and sign `fromSeq`; a public vector, `sym-attest-v1.json`; duplicates judged by content; on equivocation the conflicting copy is relayed once as evidence, and an earlier witness stands; only the session budget is spent before verification, the global ceiling after, and three more pre-verification drops are allowed; token grammars for `role` and `method`, lowercase nodeIds, a closed schema with exactly seven category verdicts; no attestations about Legacy Import or directed records; weights by MMP §6.6.9 and §6.6.10, matched by `assertionId`; frames sealed in `control-encrypted`; the §18.3.2 verification rule; tallies are not Sybil-resistant.
