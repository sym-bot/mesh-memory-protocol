import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  ADDRESS_SCHEME,
  CAT7,
  PROTOCOL_VERSION,
  SIGNATURE_SUITE,
  aeadAADV2,
  applicationCommitmentV1,
  assertionId,
  blockKeyV2,
  categoryKeyV1,
  categoryParentsCommitment,
  ed25519PrivateKey,
  encryptChaChaPoly,
  handshakeProofV2,
  handshakeTranscriptV2,
  hkdf,
  keyConfirmation,
  rawPublicKey,
  sha256,
  signingPayloadV2_0,
  x25519PrivateKey,
  AUTHORITY_ANCHOR_QUOTA,
  AUTHORITY_DELEGATE_QUOTA,
  AUTHORITY_QUOTA,
  MAX_DELEGATION_DEPTH,
  anchorPinDigest,
  authorityId,
  authorityPayloadV1,
  ed25519Equations,
  ed25519PrecheckFailure,
  lifecycleAuthority,
  resolveAuthority,
  scopeNarrows,
  verifyEd25519Strict,
} from './mmp/lib.mjs';
import { SPECCHECK_SOURCE, allEdgeCases } from './mmp/ed25519-cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'conformance', 'v2');   // MIRROR LAYOUT (see MMP-MIRROR.md)
const exampleOut = path.join(root, 'examples', 'v2');   // MIRROR LAYOUT
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(exampleOut, { recursive: true });

const write = (name, value) => {
  fs.writeFileSync(path.join(out, name), `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote public/spec/mmp/conformance/v2/${name}`);
};

const writeExample = (name, value) => {
  fs.writeFileSync(path.join(exampleOut, name), `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote public/spec/mmp/examples/v2/${name}`);
};

const utf8 = (value) => Buffer.from(value, 'utf8');
const b64u = (value) => Buffer.from(value).toString('base64url');
const hex = (value) => Buffer.from(value).toString('hex');
const repeat = (byte) => Buffer.alloc(32, byte);

const appData = utf8('{"action":"deploy","environment":"staging"}');
const application = {
  mediaType: 'application/json',
  schema: 'https://meshcognition.org/schema/action-v1.json',
  encoding: 'base64url',
  byteLength: appData.length,
  digest: `sha256-${hex(sha256(appData))}`,
  data: b64u(appData),
};

write('application-v2.json', {
  protocolVersion: PROTOCOL_VERSION,
  construction: 'mmp-app-v1',
  cases: [
    {
      label: 'application absent',
      application: null,
      expectedCommitment: applicationCommitmentV1(null),
    },
    {
      label: 'application present',
      decodedDataUtf8: appData.toString('utf8'),
      application,
      expectedCommitment: applicationCommitmentV1(application),
    },
  ],
});

const parent = `cmb-${'ab'.repeat(32)}`;
const categoryTexts = {
  focus: 'publish corrected MMP conformance artifacts',
  issue: 'the public vectors and runtime disagree',
  intent: 'make independent implementations interoperate',
  motivation: 'a protocol claim must be executable',
  commitment: 'one contract drives every implementation',
  perspective: 'protocol editor',
  mood: 'determined',
};
const categories = Object.fromEntries(Object.entries(categoryTexts).map(([name, text]) => [name, {
  text,
  meta: { key: categoryKeyV1(name, text), parents: name === 'issue' ? [parent] : [] },
}]));

const baseMetadata = {
  key: blockKeyV2(categories),
  addressScheme: ADDRESS_SCHEME,
  signatureSuite: SIGNATURE_SUITE,
  createdByNodeId: '018f47a0-7b21-7abc-8def-0123456789ab',
  createdBy: 'vector-author',
  createdTimestamp: 1786611600000,
  room: 'conformance-room',
  to: '018f47a0-7b21-7abc-8def-fedcba987654',
  lineage: { parents: [parent], method: 'svaf-heuristic' },
};

const signingSeed = repeat(0x42);
const signingPrivate = ed25519PrivateKey(signingSeed);
const signingPublic = rawPublicKey(crypto.createPublicKey(signingPrivate));

const records = [
  { label: 'same cognition without application', record: { categories, metadata: { ...baseMetadata, application: null } } },
  { label: 'same cognition with application', record: { categories, metadata: { ...baseMetadata, application } } },
];

const signatureCases = records.map(({ label, record }) => {
  const payload = signingPayloadV2_0(record);
  const id = assertionId(record);
  record.metadata.assertionId = id;
  const signature = b64u(crypto.sign(null, payload, signingPrivate));
  record.metadata.sigAlg = 'ed25519';
  record.metadata.sig = signature;
  return {
    label,
    record,
    expectedCategoryParentsCommitment: categoryParentsCommitment(categories),
    expectedSigningPayloadHex: hex(payload),
    expectedAssertionId: id,
    expectedSignature: signature,
    // The field name is the trap: "expected" reads as "required to match", and this holds ONE VALID
    // signature among many. Said at the point of use, because a reader who copies a line copies it
    // from here and not from `usage` six lines up (dev-team-5, 2026-09-13).
    expectedSignatureIsOneOfMany: 'One valid signature over expectedSigningPayloadHex. Verify it; do not reproduce it. A hedged signer (WebKit) returns different valid bytes each call.',
  };
});

write('record-signature-v2.json', {
  protocolVersion: PROTOCOL_VERSION,
  signatureSuite: SIGNATURE_SUITE,
  addressScheme: ADDRESS_SCHEME,
  testKey: {
    warning: 'fixed test key; never use as an identity',
    privateSeedBase64url: b64u(signingSeed),
    publicKeyBase64url: b64u(signingPublic),
  },
  invariant: 'Both cases have one cognition key and two assertion identities.',
  // VERIFICATION, NEVER REPRODUCTION. `expectedSignature` is pinned so an implementation can check
  // that it ACCEPTS a known-good signature — never so it can sign the payload and compare bytes.
  // Ed25519 is deterministic in RFC 8032, and Node, Chromium and Firefox all reproduce the
  // published vector five times out of five; WebKit ships a HEDGED signer, so Safari and every
  // browser on iOS produce a different VALID signature on every call (measured by dev-team-3 on
  // Safari 26.5 and dev-team-5 on three engines, 2026-09-13). A suite that asserts signature
  // equality therefore fails on the platform this protocol most needs to reach, and reads as a
  // browser bug rather than as the invalid assertion it is.
  usage: 'Verification only. Check that your implementation ACCEPTS expectedSignature for the given payload and key; never sign the payload and compare bytes. WebKit (Safari, and every browser on iOS) ships a hedged Ed25519 signer that returns a different valid signature on each call, so signature equality is not a property of a conforming implementation. To test signing, sign the same payload twice and assert that both verify — and assert nothing about whether they are equal.',
  cases: signatureCases,
});

const clientEdSeed = repeat(0x11);
const serverEdSeed = repeat(0x22);
const clientEdPrivate = ed25519PrivateKey(clientEdSeed);
const serverEdPrivate = ed25519PrivateKey(serverEdSeed);
const clientXPrivate = x25519PrivateKey(repeat(0x33));
const serverXPrivate = x25519PrivateKey(repeat(0x44));
const clientXPublic = crypto.createPublicKey(clientXPrivate);
const serverXPublic = crypto.createPublicKey(serverXPrivate);

const handshake = {
  protocolVersion: PROTOCOL_VERSION,
  room: 'conformance-room',
  client: {
    nonce: b64u(repeat(0x55)),
    nodeId: '018f47a0-7b21-7abc-8def-111111111111',
    identityPublicKey: b64u(rawPublicKey(crypto.createPublicKey(clientEdPrivate))),
    e2ePublicKey: b64u(rawPublicKey(clientXPublic)),
    name: 'vector-client',
    implementation: { name: 'mmp-vector', version: '1.0.0' },
    extensions: ['receipts-v1', 'admission-attestation-v1'],
  },
  server: {
    nonce: b64u(repeat(0x66)),
    nodeId: '018f47a0-7b21-7abc-8def-222222222222',
    identityPublicKey: b64u(rawPublicKey(crypto.createPublicKey(serverEdPrivate))),
    e2ePublicKey: b64u(rawPublicKey(serverXPublic)),
    name: 'vector-server',
    implementation: { name: 'mmp-vector', version: '1.0.0' },
    extensions: ['admission-attestation-v1', 'checkpoints-v1'],
  },
  selectedExtensions: ['admission-attestation-v1'],
};

const transcript = handshakeTranscriptV2(handshake);
const transcriptHash = sha256(transcript);
const clientProofPayload = handshakeProofV2('client', transcriptHash);
const serverProofPayload = handshakeProofV2('server', transcriptHash);
const clientShared = crypto.diffieHellman({ privateKey: clientXPrivate, publicKey: serverXPublic });
const serverShared = crypto.diffieHellman({ privateKey: serverXPrivate, publicKey: clientXPublic });
if (!clientShared.equals(serverShared)) throw new Error('X25519 test fixture did not agree');

const clientFinishedKey = hkdf(clientShared, transcriptHash, 'mmp-finished-v2 client');
const serverFinishedKey = hkdf(clientShared, transcriptHash, 'mmp-finished-v2 server');
const clientToServerKey = hkdf(clientShared, transcriptHash, 'mmp-aead-v2 client-to-server');
const serverToClientKey = hkdf(clientShared, transcriptHash, 'mmp-aead-v2 server-to-client');
const sessionId = transcriptHash.subarray(0, 16).toString('hex');
const clientProof = b64u(crypto.sign(null, clientProofPayload, clientEdPrivate));
const serverProof = b64u(crypto.sign(null, serverProofPayload, serverEdPrivate));
const clientConfirmation = b64u(keyConfirmation('client', clientFinishedKey, transcriptHash));
const serverConfirmation = b64u(keyConfirmation('server', serverFinishedKey, transcriptHash));

const clientHello = {
  type: 'client-hello',
  protocolVersion: handshake.protocolVersion,
  room: handshake.room,
  nodeId: handshake.client.nodeId,
  name: handshake.client.name,
  identityPublicKey: handshake.client.identityPublicKey,
  e2ePublicKey: handshake.client.e2ePublicKey,
  nonce: handshake.client.nonce,
  implementation: handshake.client.implementation,
  extensions: handshake.client.extensions,
};
const serverHello = {
  type: 'server-hello',
  protocolVersion: handshake.protocolVersion,
  room: handshake.room,
  nodeId: handshake.server.nodeId,
  name: handshake.server.name,
  identityPublicKey: handshake.server.identityPublicKey,
  e2ePublicKey: handshake.server.e2ePublicKey,
  nonce: handshake.server.nonce,
  implementation: handshake.server.implementation,
  extensions: handshake.server.extensions,
  clientNonce: handshake.client.nonce,
  selectedExtensions: handshake.selectedExtensions,
  proof: serverProof,
  keyConfirmation: serverConfirmation,
};
const clientFinish = {
  type: 'client-finish',
  transcriptHash: hex(transcriptHash),
  proof: clientProof,
  keyConfirmation: clientConfirmation,
};

write('handshake-v2.json', {
  protocolVersion: PROTOCOL_VERSION,
  warning: 'all private keys and nonces are fixed conformance fixtures',
  // The proofs are Ed25519 SIGNATURES, so they carry the same rule as record-signature-v2's
  // expectedSignature and for the same reason — a hedged signer (WebKit, CryptoKit) produces
  // different valid bytes on every call. Said here because a suite reads the vector, not the page.
  usage: 'Verification only, for clientProofBase64url and serverProofBase64url: check that your implementation ACCEPTS each proof over its pinned payload and key; never sign the payload and compare bytes. Every other pinned value here — transcript hash, HKDF outputs, key confirmations — is deterministic and MUST reproduce exactly.',
  fixture: {
    handshake,
    frames: { clientHello, serverHello, clientFinish },
    clientIdentityPrivateSeedBase64url: b64u(clientEdSeed),
    serverIdentityPrivateSeedBase64url: b64u(serverEdSeed),
    clientE2EPrivateKeyBase64url: b64u(repeat(0x33)),
    serverE2EPrivateKeyBase64url: b64u(repeat(0x44)),
  },
  expected: {
    transcriptHex: hex(transcript),
    transcriptHashHex: hex(transcriptHash),
    sessionId,
    clientProofPayloadHex: hex(clientProofPayload),
    clientProofBase64url: clientProof,
    serverProofPayloadHex: hex(serverProofPayload),
    serverProofBase64url: serverProof,
    sharedSecretHex: hex(clientShared),
    clientFinishedKeyHex: hex(clientFinishedKey),
    serverFinishedKeyHex: hex(serverFinishedKey),
    clientKeyConfirmationHex: hex(Buffer.from(clientConfirmation, 'base64url')),
    serverKeyConfirmationHex: hex(Buffer.from(serverConfirmation, 'base64url')),
    clientToServerKeyHex: hex(clientToServerKey),
    serverToClientKeyHex: hex(serverToClientKey),
  },
});

const encryptedRecord = structuredClone(signatureCases[1].record);
delete encryptedRecord.metadata.application.data;
const protectedPlaintext = Buffer.from(JSON.stringify({
  categories: encryptedRecord.categories,
  applicationData: application.data,
}), 'utf8');

const encryptionCases = [
  { direction: 'client-to-server', key: clientToServerKey, sequence: '0' },
  { direction: 'client-to-server', key: clientToServerKey, sequence: '1' },
  { direction: 'server-to-client', key: serverToClientKey, sequence: '0' },
];

// MMP v2.0: absence of an application is distinct from a present zero-byte
// application. When metadata.application is null, applicationData is OMITTED
// from the protected plaintext. An empty string remains available to encode
// the data of a real application whose byteLength is zero.
const noApplicationRecord = structuredClone(signatureCases[0].record);
const noApplicationPlaintext = Buffer.from(JSON.stringify({
  categories: noApplicationRecord.categories,
}), 'utf8');
const noApplicationDirection = 'client-to-server';
const noApplicationSequence = '0';
const noApplicationAAD = aeadAADV2({
  sessionId,
  direction: noApplicationDirection,
  sequence: noApplicationSequence,
  metadata: noApplicationRecord.metadata,
});
const noApplicationSealed = encryptChaChaPoly({
  key: clientToServerKey,
  sequence: noApplicationSequence,
  plaintext: noApplicationPlaintext,
  aad: noApplicationAAD,
});

write('e2e-v2.json', {
  protocolVersion: PROTOCOL_VERSION,
  suite: 'X25519-HKDF-SHA256-ChaCha20-Poly1305',
  sessionId,
  protectedPlaintextUtf8: protectedPlaintext.toString('utf8'),
  metadata: encryptedRecord.metadata,
  cases: encryptionCases.map(({ direction, key, sequence }) => {
    const aad = aeadAADV2({ sessionId, direction, sequence, metadata: encryptedRecord.metadata });
    const sealed = encryptChaChaPoly({ key, sequence, plaintext: protectedPlaintext, aad });
    return {
      direction,
      sequence,
      trafficKeyHex: hex(key),
      nonceHex: BigInt(sequence).toString(16).padStart(24, '0'),
      aadHex: hex(aad),
      sealedBase64url: b64u(sealed),
    };
  }),
  noApplication: {
    rule: 'metadata.application=null means applicationData is omitted; applicationData="" is reserved for a present zero-byte application',
    protectedPlaintextUtf8: noApplicationPlaintext.toString('utf8'),
    metadata: noApplicationRecord.metadata,
    case: {
      direction: noApplicationDirection,
      sequence: noApplicationSequence,
      trafficKeyHex: hex(clientToServerKey),
      nonceHex: BigInt(noApplicationSequence).toString(16).padStart(24, '0'),
      aadHex: hex(noApplicationAAD),
      sealedBase64url: b64u(noApplicationSealed),
    },
  },
});

function exampleFrame({ createdBy, createdByNodeId, createdTimestamp, texts, mood, parent = null, method }) {
  const categoryParents = parent ? [parent] : [];
  const exampleCategories = Object.fromEntries(CAT7.map((name) => {
    const text = texts[name];
    const category = {
      text,
      meta: { key: categoryKeyV1(name, text), parents: categoryParents },
    };
    if (name === 'mood') Object.assign(category, mood);
    return [name, category];
  }));
  const record = {
    categories: exampleCategories,
    metadata: {
      key: blockKeyV2(exampleCategories),
      addressScheme: ADDRESS_SCHEME,
      signatureSuite: SIGNATURE_SUITE,
      createdByNodeId,
      createdBy,
      createdTimestamp,
      room: 'spec-examples',
      to: null,
      lineage: { parents: categoryParents, method },
      application: null,
    },
  };
  record.metadata.assertionId = assertionId(record);
  record.metadata.sigAlg = 'ed25519';
  record.metadata.sig = b64u(crypto.sign(null, signingPayloadV2_0(record), signingPrivate));
  // Both of these are OPTIONAL on the frame, and the examples carry them only to show the shape.
  // The mandatory timestamp is metadata.createdTimestamp INSIDE the record, which is covered by the
  // signature; this frame field is outside it and is the interop fallback only. The version is
  // agreed once, in the authenticated §5.2 handshake, where both parties prove it — a per-frame
  // copy would be unsigned and redundant. An earlier revision of this comment asserted the frame
  // timestamp was mandatory; that was withdrawn the same day and the claim must not outlive it.
  return { type: 'cmb', protocolVersion: PROTOCOL_VERSION, timestamp: createdTimestamp, cmb: record };
}

const transportParent = `cmb-${'10'.repeat(32)}`;
writeExample('transport-cmb.json', exampleFrame({
  createdBy: 'sensor-a',
  createdByNodeId: '018f47a0-7b21-7abc-8def-aaaaaaaaaaaa',
  createdTimestamp: 1711540800000,
  parent: transportParent,
  method: 'svaf-heuristic',
  texts: {
    focus: 'user coding for 3 hours, energy declining',
    issue: 'sedentary since morning, skipping lunch',
    intent: 'recommend movement break before fatigue worsens',
    motivation: 'three agents reported declining energy in the last hour',
    commitment: 'fitness monitoring active, ten-minute stretch queued',
    perspective: 'fitness agent, afternoon session, home office',
    mood: 'concerned, low energy',
  },
  mood: { valence: -0.3, arousal: -0.4 },
}));

const dismissedParent = `cmb-${'20'.repeat(32)}`;
writeExample('feedback-dismissal.json', exampleFrame({
  createdBy: 'validator-node',
  createdByNodeId: '018f47a0-7b21-7abc-8def-bbbbbbbbbbbb',
  createdTimestamp: 1775485628563,
  parent: dismissedParent,
  method: 'operator-dismissal',
  texts: {
    focus: 'Dismissed: frontend framework release flagged as relevant',
    issue: 'Dismissal reasoning: frontend tooling is outside this mesh review scope',
    intent: 'Record the operator dismissal as evidence, not as an unsigned command',
    motivation: 'Prevent wasted analysis on out-of-scope signals',
    commitment: `Dismissed ${dismissedParent}: framework-release analysis`,
    perspective: 'operator, via dashboard',
    mood: 'corrective',
  },
  mood: { valence: -0.1, arousal: 0.2 },
}));

writeExample('feedback-directive.json', exampleFrame({
  createdBy: 'validator-node',
  createdByNodeId: '018f47a0-7b21-7abc-8def-bbbbbbbbbbbb',
  createdTimestamp: 1775485630000,
  method: 'operator-directive',
  texts: {
    focus: 'Frontend framework releases are separate from backend review',
    issue: 'Feed signals about frontend tooling are out-of-scope noise here',
    intent: 'Distinguish backend runtime signals from frontend tooling',
    motivation: 'Prevent wasted analysis outside the mesh scope',
    commitment: 'Standing directive: apply this scope to future feed analysis',
    perspective: 'operator, mesh steward',
    mood: 'clarifying',
  },
  mood: { valence: 0.1, arousal: 0.2 },
}));


// ---------------------------------------------------------------------------------------------
// §18.3.2 Ed25519 edge cases. The rule accepts only the honest case; every other case is rejected
// by a named pre-check. The equations are computed without pre-checks to show what an unchecked
// library may answer, and are deterministic arithmetic, not a library's behaviour.
// ---------------------------------------------------------------------------------------------
{
  const cases = allEdgeCases().map((c) => {
    const m = Buffer.from(c.message, 'hex');
    const A = Buffer.from(c.publicKey, 'hex');
    const sig = Buffer.from(c.signature, 'hex');
    return {
      label: c.label,
      messageHex: c.message,
      publicKeyHex: c.publicKey,
      signatureHex: c.signature,
      expected: verifyEd25519Strict(m, A, sig) ? 'accept' : 'reject',
      precheckFailure: ed25519PrecheckFailure(A, sig),
      equationsWithoutPrechecks: ed25519Equations(m, A, sig),
    };
  });
  const accepted = cases.filter((c) => c.expected === 'accept').map((c) => c.label);
  if (accepted.length !== 1 || accepted[0] !== 'honest key and signature') throw new Error(`ed25519 edge cases: accepted ${accepted}`);
  for (const c of cases) if (c.label !== 'honest key and signature' && c.precheckFailure === null) throw new Error(`ed25519 edge case ${c.label} passes the pre-checks`);
  write('ed25519-strict-v2.json', {
    protocolVersion: PROTOCOL_VERSION,
    rule: 'MMP §18.3.2: RFC 8032 §5.1.7 cofactorless verification, [S]B = R + [k]A, after four pre-checks: A and R are canonical encodings (y < p; x = 0 never with the sign bit set) of points of prime order ([L]P = O and P != O), and S < L. With A and R of prime order the cofactored equation gives the same answer.',
    source: `speccheck cases from Chalkias, Garillot and Nikolaenko, "Taming the many EdDSAs" (SSR 2020), ${SPECCHECK_SOURCE}, Apache-2.0`,
    usage: 'Reproduce expected for every case. precheckFailure names the first pre-check that fails, in the order A encoding, A order, R encoding, R order, S range. equationsWithoutPrechecks is informative: it is what the two RFC 8032 equations give with lenient decoding and no pre-checks, so it shows which unchecked libraries would disagree.',
    cases,
  });
}

// ---------------------------------------------------------------------------------------------
// §6.6 authority statements. Every expectation below is written by hand from the rules in §6.6
// and the reference resolver must reproduce it, so the vector is not only self-consistent.
// ---------------------------------------------------------------------------------------------
const authorityKey = (byte, nodeTail) => {
  const seed = repeat(byte);
  const priv = ed25519PrivateKey(seed);
  return {
    seed,
    priv,
    key: b64u(rawPublicKey(crypto.createPublicKey(priv))),
    nodeId: `018f47a0-7b21-7abc-8def-${nodeTail}`,
  };
};
const K = {
  a1: authorityKey(0xa1, '0000000000a1'), // anchor member 1
  a2: authorityKey(0xa2, '0000000000a2'), // anchor member 2
  a3: authorityKey(0xa3, '0000000000a3'), // anchor member 3
  A: authorityKey(0xad, '00000000000a'), // admin under the anchor
  V: authorityKey(0xb1, '00000000000b'), // validator under A
  W: authorityKey(0xb2, '00000000000c'), // validator under the anchor
  H: authorityKey(0xb3, '00000000000d'), // validator whose grant a receiver has not seen yet
  P: authorityKey(0xc1, '00000000000e'), // participant under V
  R: authorityKey(0xc3, '00000000000f'), // extension role under V
  Q: authorityKey(0xc2, '000000000010'), // participant under W
  P2: authorityKey(0xc4, '000000000011'), // participant under V, later revoked by V
  D: authorityKey(0xd1, '000000000012'), // deployment admin
  WA: authorityKey(0xd2, '000000000013'), // world admin of world w1, under D
  SI: authorityKey(0xd3, '000000000014'), // seat issuer of world w1, under WA
  S1: authorityKey(0xd4, '000000000015'), // a seat in world w1
  X3: authorityKey(0xd5, '000000000016'), // admin three hops down
  X4: authorityKey(0xd6, '000000000017'), // validator four hops down
  B: authorityKey(0xae, '000000000018'), // a second admin under the anchor, beside A
  V2: authorityKey(0xb4, '000000000019'), // a second validator under A
  P3: authorityKey(0xc5, '00000000001a'), // a participant granted by A directly
  WB: authorityKey(0xd7, '00000000001b'), // world admin of world w2, under D
  SR: authorityKey(0xd8, '00000000001c'), // issuer for region-a of world w1, under WA
  S3: authorityKey(0xd9, '00000000001d'), // a seat in region-a of world w1
  M: authorityKey(0xee, '0000000000ee'), // never granted anything
  Kd: authorityKey(0xe1, '0000000000e1'), // key behind many depth-2 grants in the attack cases
  Kc: authorityKey(0xe2, '0000000000e2'), // key behind many depth-3 grants in the attack cases
  Kv: authorityKey(0xe3, '0000000000e3'), // key behind many depth-4 grants in the attack cases
};
const pins = {
  'anchor-2-of-3': { threshold: 2, keys: [{ key: K.a1.key }, { key: K.a2.key }, { key: K.a3.key }] },
  'anchor-1-of-1': { threshold: 1, keys: [{ key: K.a1.key, nodeId: K.a1.nodeId }] },
  'anchor-1-of-2': { threshold: 1, keys: [{ key: K.a1.key, nodeId: K.a1.nodeId }, { key: K.a2.key, nodeId: K.a2.nodeId }] },
};
const nonceOf = (label) => b64u(sha256(Buffer.from(`mmp authority vector nonce ${label}`, 'utf8')).subarray(0, 16));
const nodeOf = (n) => `018f47a0-7b21-7abc-8def-${n.toString(16).padStart(12, '0')}`;
let nodeCounter = 0x100;
const freshNode = (k) => ({ nodeId: nodeOf(nodeCounter++), key: k.key });
const statementDefs = {}; // label -> statement
const sign = (s, signers) => {
  const payload = authorityPayloadV1(s);
  return { ...s, sigs: signers.map((k) => ({ key: k.key, sig: b64u(crypto.sign(null, payload, k.priv)) })) };
};
const idOf = (label) => authorityId(statementDefs[label]);
const define = (label, body, signers) => {
  if (statementDefs[label]) throw new Error(`duplicate label ${label}`);
  statementDefs[label] = sign(body, signers);
  return idOf(label);
};
const grant = (label, subject, role, by, signers, scope) => define(label, {
  kind: 'grant', authorisedBy: by, subject: { nodeId: subject.nodeId, key: subject.key }, role,
  ...(scope === undefined ? {} : { scope }), nonce: nonceOf(label),
}, signers);
const named = (label, kind, targets, by, signers, issuedAt) => define(label, {
  kind, authorisedBy: by, targets: targets.map(idOf), nonce: nonceOf(label), ...(issuedAt === undefined ? {} : { issuedAt }),
}, signers);
const byId = (labels) => [...labels].sort((x, y) => Buffer.compare(Buffer.from(idOf(x)), Buffer.from(idOf(y))));

// The delegation tree.
grant('gA', K.A, 'admin', 'anchor', [K.a1, K.a2]);
grant('gW', K.W, 'validator', 'anchor', [K.a2, K.a3]);
grant('gV', K.V, 'validator', idOf('gA'), [K.A]);
grant('gP', K.P, 'participant', idOf('gV'), [K.V]);
grant('gR', K.R, 'xmesh-worker', idOf('gV'), [K.V]);
grant('gQ', K.Q, 'participant', idOf('gW'), [K.W]);
// Revokes and endorsements. issuedAt is information only: rA carries one, and it changes nothing.
named('rP', 'revoke', ['gP'], idOf('gA'), [K.A]);
named('rA', 'revoke', ['gA'], 'anchor', [K.a1, K.a3], 1786611600000);
named('eV', 'endorse', ['gV', 'rP'], 'anchor', [K.a2, K.a3]);
named('rVbyW', 'revoke', ['gV'], idOf('gW'), [K.W]);
grant('gA2', K.A, 'admin', 'anchor', [K.a1, K.a2]); // a fresh grant to A after rA
// Statements a receiver must find invalid.
grant('xThin', K.M, 'validator', 'anchor', [K.a1]); // one anchor signature, threshold 2
grant('xDupKey', K.M, 'validator', 'anchor', [K.a1, K.a1]); // one key counted once
grant('xValidatorByValidator', K.M, 'validator', idOf('gV'), [K.V]);
named('xEndorseByValidator', 'endorse', ['gQ'], idOf('gW'), [K.W]);
grant('xByParticipant', K.M, 'participant', idOf('gP'), [K.P]);
grant('xWrongKey', K.M, 'participant', idOf('gV'), [K.M]); // signed by a key gV does not name
define('xIdentityKey', { // the identity point as subject key: not well formed (§18.3.2)
  kind: 'grant', authorisedBy: idOf('gV'), subject: { nodeId: K.M.nodeId, key: b64u(Buffer.concat([Buffer.from([1]), Buffer.alloc(31)])) },
  role: 'participant', nonce: nonceOf('xIdentityKey'),
}, [K.V]);
define('xUpperNodeId', { // a nodeId not in canonical lowercase form: not well formed (§6.6.3)
  kind: 'grant', authorisedBy: idOf('gV'), subject: { nodeId: K.M.nodeId.toUpperCase(), key: K.M.key },
  role: 'participant', nonce: nonceOf('xUpperNodeId'),
}, [K.V]);
define('xAuthIsRevoke', {
  kind: 'grant', authorisedBy: idOf('rP'), subject: { nodeId: K.M.nodeId, key: K.M.key }, role: 'participant', nonce: nonceOf('xAuthIsRevoke'),
}, [K.A]);
// A chain that arrives out of order.
grant('gH', K.H, 'validator', 'anchor', [K.a1, K.a3]);
grant('gM', K.M, 'participant', idOf('gH'), [K.H]);
// The quota cases (test parameter quota = 2): V's bucket holds revokes and grants.
grant('gP2', K.P2, 'participant', idOf('gV'), [K.V]);
named('rP2', 'revoke', ['gP2'], idOf('gV'), [K.V]);
named('rRv', 'revoke', ['gR'], idOf('gV'), [K.V]);
named('rPv', 'revoke', ['gP'], idOf('gV'), [K.V]);
// A hosted world: anchor -> deployment admin -> world admin -> seat issuer -> seat (four hops),
// scoped to world w1, beside world w2; a narrower region inside w1.
const W1 = 'xmesh-world:w1';
const W1A = 'xmesh-world:w1/region-a';
const W2 = 'xmesh-world:w2';
grant('gD', K.D, 'admin', 'anchor', [K.a2, K.a3]);
grant('gWA', K.WA, 'admin', idOf('gD'), [K.D], W1);
grant('gWB', K.WB, 'admin', idOf('gD'), [K.D], W2);
grant('gSI', K.SI, 'issuer', idOf('gWA'), [K.WA], W1);
grant('gS1', K.S1, 'xmesh-seat', idOf('gSI'), [K.SI], W1);
grant('gSR', K.SR, 'issuer', idOf('gWA'), [K.WA], W1A);
grant('gS3', K.S3, 'xmesh-seat', idOf('gSR'), [K.SR], W1A);
named('rS1', 'revoke', ['gS1'], idOf('gSI'), [K.SI]); // an issuer revokes a seat it granted
grant('xScopeDropped', K.M, 'issuer', idOf('gWA'), [K.WA]); // no scope under a scoped parent: widens
grant('xScopeSideways', K.M, 'issuer', idOf('gWA'), [K.WA], W2); // another world's scope
grant('xScopeWiderSeat', K.M, 'xmesh-seat', idOf('gSR'), [K.SR], W1); // wider than region-a
grant('xScopeW10', K.M, 'issuer', idOf('gWA'), [K.WA], 'xmesh-world:w10'); // a prefix, not a narrowing
grant('xScopeDotDot', K.M, 'issuer', idOf('gWA'), [K.WA], 'xmesh-world:w1/../w2'); // not well formed
grant('xScopeDot', K.M, 'issuer', idOf('gWA'), [K.WA], 'xmesh-world:w1/./region-a'); // not well formed
grant('xIssuerGrantsValidator', K.M, 'validator', idOf('gSI'), [K.SI], W1);
named('xIssuerEndorses', 'endorse', ['gS1'], idOf('gSI'), [K.SI]);
// One hop too many: admin at depth 3, validator at depth 4, and its grant would be depth 5.
grant('gX3', K.X3, 'admin', idOf('gWA'), [K.WA], W1);
grant('gX4', K.X4, 'validator', idOf('gX3'), [K.X3], W1);
grant('xTooDeep', K.M, 'xmesh-seat', idOf('gX4'), [K.X4], W1);
// Endorsement from the side, from above, and of an endorse.
grant('gB', K.B, 'admin', 'anchor', [K.a1, K.a3]);
named('eVbyB', 'endorse', ['gV'], idOf('gB'), [K.B]); // B is not above A's grant
named('rV', 'revoke', ['gV'], idOf('gA'), [K.A]);
named('eP', 'endorse', ['gP'], idOf('gA'), [K.A]); // A is above V's grant
named('eSelfA', 'endorse', ['gV'], idOf('gA'), [K.A]); // A endorses its own grant: meaningless
named('eKeepSelf', 'endorse', ['eSelfA'], 'anchor', [K.a1, K.a2]); // names an endorse: no effect
named('eVonly', 'endorse', ['gV'], 'anchor', [K.a1, K.a2]);
named('rVanchor', 'revoke', ['gV'], 'anchor', [K.a2, K.a3]);
named('ePanchor', 'endorse', ['gP'], 'anchor', [K.a1, K.a3]); // reaches past a dead grant
// Target by target: A's revoke names a grant below it, a grant on another branch, and a revoke.
named('rWQ', 'revoke', ['gQ'], idOf('gW'), [K.W]);
named('rMix', 'revoke', ['gP', 'gW', 'rWQ'], idOf('gA'), [K.A]);
// The delegate bound (test parameter delegateQuota = 1): A grants two validators and a participant.
grant('gV2', K.V2, 'validator', idOf('gA'), [K.A]);
grant('gP3', K.P3, 'participant', idOf('gA'), [K.A]);
// The single-key anchor of today's model, and a 1-of-2 anchor in which each member is the anchor.
grant('gV1', K.V, 'validator', 'anchor', [K.a1]);
grant('gVa2', K.V2, 'validator', 'anchor', [K.a2]);
// Threshold copies: one statement, two copies with one signature each, and a copy with two.
{
  const body = { kind: 'grant', authorisedBy: 'anchor', subject: { nodeId: K.H.nodeId, key: K.H.key }, role: 'validator', nonce: nonceOf('split') };
  statementDefs.splitA1 = sign(body, [K.a1]);
  statementDefs.splitA2 = sign(body, [K.a2]);
  statementDefs.splitFull = sign(body, [K.a1, K.a3]);
}

// Issuers are delegating grants: a world admin's bucket keeps at most 16 of them.
const issuers = [];
for (let i = 0; i < 17; i++) { issuers.push(`gI${i}`); grant(`gI${i}`, freshNode(K.Kd), 'issuer', idOf('gWA'), [K.WA], W1); }
// Rescue falls through (test parameter quota = 3): two endorsers above a cut-off grant; the one
// with the lower id has a full bucket, so the other keeps the grant.
grant('fB', freshNode(K.Kc), 'admin', idOf('gA'), [K.A]);
grant('fV', freshNode(K.Kv), 'validator', idOf('fB'), [K.Kc]);
grant('fP', freshNode(K.Kd), 'participant', idOf('fV'), [K.Kv]);
named('fRevoke', 'revoke', ['fV'], idOf('fB'), [K.Kc]);
named('fEndorseA', 'endorse', ['fP'], idOf('gA'), [K.A]);
named('fEndorseB', 'endorse', ['fP'], idOf('fB'), [K.Kc]);
const [fLow, fHigh] = byId(['fEndorseA', 'fEndorseB']);
if (fLow === 'fEndorseA') grant('fFill', freshNode(K.Kv), 'participant', idOf('gA'), [K.A]);
else grant('fFill', freshNode(K.Kv), 'participant', idOf('fB'), [K.Kc]);

// The attack cases from the review of this design (r2, r1). A compromised depth-1 admin A tries
// to escape its delegate quota by hanging admins under its over-quota grants and rescuing them, and
// by first revoking those grants itself so that they are "removed" rather than over quota.
const r2D = []; const r2C = [];
for (let i = 0; i < 20; i++) { r2D.push(`r2D${i}`); grant(`r2D${i}`, freshNode(K.Kd), 'admin', idOf('gA'), [K.A]); }
const r2Kept = byId(r2D).slice(0, 16); const r2Over = byId(r2D).slice(16);
for (const d of r2Over) { const c = `r2C_${d}`; r2C.push(c); grant(c, freshNode(K.Kc), 'admin', idOf(d), [K.Kd]); }
named('r2E', 'endorse', r2C, idOf('gA'), [K.A]);
named('r2Launder', 'revoke', r2Over, idOf('gA'), [K.A]);
// A rescue that fits: A keeps 14 delegates, removes a fifteenth, and rescues its three admins.
const fitD = []; for (let i = 0; i < 15; i++) { fitD.push(`fitD${i}`); grant(`fitD${i}`, freshNode(K.Kd), 'admin', idOf('gA'), [K.A]); }
const fitC = []; for (let i = 0; i < 3; i++) { fitC.push(`fitC${i}`); grant(`fitC${i}`, freshNode(K.Kc), 'admin', idOf('fitD0'), [K.Kd]); }
named('fitRevoke', 'revoke', ['fitD0'], idOf('gA'), [K.A]);
named('fitEndorse', 'endorse', fitC, idOf('gA'), [K.A]);
// r1 at test scale (quota 4, delegate quota 2): six depth-2 admins under A, an admin under each,
// four grants under each of those, and A endorsing every depth-3 admin; then the laundered form.
const r1D = []; const r1C = []; const r1V = [];
for (let i = 0; i < 6; i++) {
  r1D.push(`r1D${i}`); grant(`r1D${i}`, freshNode(K.Kd), 'admin', idOf('gA'), [K.A]);
  r1C.push(`r1C${i}`); grant(`r1C${i}`, freshNode(K.Kc), 'admin', idOf(`r1D${i}`), [K.Kd]);
  for (let j = 0; j < 4; j++) { r1V.push(`r1V${i}_${j}`); grant(`r1V${i}_${j}`, freshNode(K.Kv), j < 2 ? 'validator' : 'participant', idOf(`r1C${i}`), [K.Kc]); }
}
named('r1E', 'endorse', r1C, idOf('gA'), [K.A]);
const r1Kept = byId(r1D).slice(0, 2); const r1Over = byId(r1D).slice(2);
named('r1Launder', 'revoke', r1Over, idOf('gA'), [K.A]);
// The bound is reached and not exceeded (quota 2, delegate quota 1): below A at most
// 2 x (1 + 1 + 1) = 6 statements. A full tree reaches it; extra grants, a laundering revoke and
// rescues add nothing.
grant('tD', freshNode(K.Kd), 'admin', idOf('gA'), [K.A]);
grant('tP1', freshNode(K.Kv), 'participant', idOf('gA'), [K.A]);
grant('tC', freshNode(K.Kc), 'admin', idOf('tD'), [K.Kd]);
grant('tP2', freshNode(K.Kv), 'participant', idOf('tD'), [K.Kd]);
grant('tS1', freshNode(K.Kv), 'xmesh-seat', idOf('tC'), [K.Kc]);
grant('tS2', freshNode(K.Kv), 'xmesh-seat', idOf('tC'), [K.Kc]);
grant('tExtraD', freshNode(K.Kd), 'admin', idOf('gA'), [K.A]);
grant('tExtraC', freshNode(K.Kc), 'admin', idOf('tExtraD'), [K.Kd]);
grant('tExtraS', freshNode(K.Kv), 'xmesh-seat', idOf('tC'), [K.Kc]);
named('tLaunder', 'revoke', ['tExtraD'], idOf('gA'), [K.A]);
named('tRescue', 'endorse', ['tExtraC'], idOf('gA'), [K.A]);

const tree = ['gA', 'gW', 'gV', 'gP', 'gR', 'gQ'];
const st = (value, ...labels) => Object.fromEntries(labels.map((l) => [l, value]));
const inForce = (...labels) => st('in-force', ...labels);
const authorityCases = [
  { label: 'a delegation tree is in force', pin: 'anchor-2-of-3', statements: tree, status: inForce(...tree) },
  {
    label: 'a grantor above revokes: the admin removes a participant two hops below it',
    pin: 'anchor-2-of-3', statements: [...tree, 'rP'],
    status: { ...inForce('gA', 'gW', 'gV', 'gR', 'gQ', 'rP'), gP: 'removed' },
  },
  {
    label: 'the anchor removes the admin: everything the admin authorised is dead',
    pin: 'anchor-2-of-3', statements: [...tree, 'rP', 'rA'],
    status: { ...inForce('gW', 'gQ', 'rA'), gA: 'removed', ...st('dead', 'gV', 'gP', 'gR', 'rP') },
  },
  {
    label: 'the anchor endorses the admin\'s validator and its revoke: both survive, the admin does not',
    pin: 'anchor-2-of-3', statements: [...tree, 'rP', 'rA', 'eV'],
    status: { ...inForce('gW', 'gQ', 'rA', 'eV', 'gV', 'rP', 'gR'), gA: 'removed', gP: 'removed' },
    live: ['gA'],
  },
  {
    label: 'an admin beside the removed one cannot endorse its subtree',
    pin: 'anchor-2-of-3', statements: [...tree, 'rA', 'gB', 'eVbyB'],
    status: { ...inForce('gW', 'gQ', 'rA', 'gB', 'eVbyB'), gA: 'removed', ...st('dead', 'gV', 'gP', 'gR') },
  },
  {
    label: 'an admin removes its validator and keeps one of the validator\'s grants, in its own bucket',
    pin: 'anchor-2-of-3', statements: [...tree, 'rV', 'eP'],
    status: { ...inForce('gA', 'gW', 'gQ', 'rV', 'eP', 'gP'), gV: 'removed', gR: 'dead' },
    live: ['gV'],
    keptBy: { gP: 'gA' },
  },
  {
    label: 'an endorse is never rescued, so an endorse that names an endorse keeps nothing',
    pin: 'anchor-2-of-3', statements: [...tree, 'eSelfA', 'rA', 'eKeepSelf'],
    status: { ...inForce('gW', 'gQ', 'rA', 'eKeepSelf'), gA: 'removed', ...st('dead', 'gV', 'gP', 'gR', 'eSelfA') },
  },
  {
    label: 'a fresh grant does not revive the old grant\'s dependents',
    pin: 'anchor-2-of-3', statements: [...tree, 'rP', 'rA', 'gA2'],
    status: { ...inForce('gW', 'gQ', 'rA', 'gA2'), gA: 'removed', ...st('dead', 'gV', 'gP', 'gR', 'rP') },
  },
  {
    label: 'a revoke from off the chain removes nothing',
    pin: 'anchor-2-of-3', statements: [...tree, 'rVbyW'], status: inForce(...tree, 'rVbyW'),
  },
  {
    label: 'invalid statements are inert',
    pin: 'anchor-2-of-3',
    statements: [...tree, 'xThin', 'xDupKey', 'xValidatorByValidator', 'xEndorseByValidator', 'xByParticipant', 'xWrongKey', 'xIdentityKey', 'xUpperNodeId'],
    status: {
      ...inForce(...tree),
      ...st('invalid', 'xThin', 'xDupKey', 'xValidatorByValidator', 'xEndorseByValidator', 'xByParticipant', 'xWrongKey', 'xIdentityKey', 'xUpperNodeId'),
    },
    sameRootAs: 'a delegation tree is in force',
  },
  {
    label: 'authorisedBy must name a grant: one naming a revoke is pending while the revoke is not held, invalid once it is',
    pin: 'anchor-2-of-3', statements: [...tree, 'rP', 'xAuthIsRevoke'],
    status: { ...inForce('gA', 'gW', 'gV', 'gR', 'gQ', 'rP'), gP: 'removed', xAuthIsRevoke: 'invalid' },
    sameRootAs: 'a grantor above revokes: the admin removes a participant two hops below it',
  },
  {
    label: 'a statement whose chain is not held is pending and changes nothing',
    pin: 'anchor-2-of-3', statements: [...tree, 'gM'], status: { ...inForce(...tree), gM: 'pending' },
    sameRootAs: 'a delegation tree is in force',
  },
  {
    label: 'the chain arrives and the pending statement is in force',
    pin: 'anchor-2-of-3', statements: [...tree, 'gM', 'gH'], status: inForce(...tree, 'gM', 'gH'),
  },
  {
    label: 'a hosted world four hops below the anchor, scoped to one world; scopes only narrow; an issuer grants seats only; a fifth hop is too deep',
    pin: 'anchor-2-of-3',
    statements: ['gD', 'gWA', 'gWB', 'gSI', 'gS1', 'gSR', 'gS3', 'xScopeDropped', 'xScopeSideways', 'xScopeWiderSeat', 'xScopeW10', 'xScopeDotDot', 'xScopeDot', 'xIssuerGrantsValidator', 'xIssuerEndorses', 'gX3', 'gX4', 'xTooDeep'],
    status: {
      ...inForce('gD', 'gWA', 'gWB', 'gSI', 'gS1', 'gSR', 'gS3', 'gX3', 'gX4'),
      ...st('invalid', 'xScopeDropped', 'xScopeSideways', 'xScopeWiderSeat', 'xScopeW10', 'xScopeDotDot', 'xScopeDot', 'xIssuerGrantsValidator', 'xIssuerEndorses', 'xTooDeep'),
    },
  },
  (() => {
    const sorted = byId(issuers);
    return {
      label: 'issuers are delegating grants: a world admin\'s bucket keeps 16 of 17, by id',
      pin: 'anchor-2-of-3', statements: ['gD', 'gWA', ...issuers],
      status: { ...inForce('gD', 'gWA', ...sorted.slice(0, 16)), [sorted[16]]: 'over-quota' },
    };
  })(),
  {
    label: 'rescue falls through: the lower endorser\'s bucket is full, so the next endorser keeps the grant (test parameter quota = 3)',
    pin: 'anchor-2-of-3', quota: 3, statements: ['gA', 'fB', 'fV', 'fP', 'fRevoke', 'fEndorseA', 'fEndorseB', 'fFill'],
    status: { ...inForce('gA', 'fB', 'fP', 'fRevoke', 'fEndorseA', 'fEndorseB', 'fFill'), fV: 'removed' },
    keptBy: { fP: fHigh === 'fEndorseA' ? 'gA' : 'fB' },
    live: ['fV'],
  },
  {
    label: 'an issuer revokes a seat it granted',
    pin: 'anchor-2-of-3', statements: ['gD', 'gWA', 'gSI', 'gS1', 'rS1'],
    status: { ...inForce('gD', 'gWA', 'gSI', 'rS1'), gS1: 'removed' },
  },
  {
    // gA carries a1's and a2's signatures. a2 is not pinned here and is not counted; a1 alone meets
    // the threshold of 1, so the same statement is valid under this pin too.
    label: 'a single-key anchor is the 1-of-1 case, and its holder resolves as anchor',
    pin: 'anchor-1-of-1', statements: ['gV1', 'gA'], status: inForce('gV1', 'gA'),
  },
  {
    label: 'under a threshold of 1 every pinned member alone is the anchor',
    pin: 'anchor-1-of-2', statements: ['gV1', 'gVa2'], status: inForce('gV1', 'gVa2'),
  },
  (() => {
    const [keep, over] = byId(['gP', 'gR']);
    return {
      label: 'at the quota a bucket keeps removals first, then grants by ascending id (test parameter quota = 2)',
      pin: 'anchor-2-of-3', quota: 2, statements: ['gA', 'gV', 'gP', 'gR', 'gP2', 'rP2'],
      status: { ...inForce('gA', 'gV', 'rP2', keep), [over]: 'over-quota', gP2: 'removed' },
    };
  })(),
  (() => {
    const revokes = byId(['rP2', 'rRv', 'rPv']);
    const target = { rP2: 'gP2', rRv: 'gR', rPv: 'gP' };
    return {
      label: 'an over-quota revoke removes nothing (test parameter quota = 2)',
      pin: 'anchor-2-of-3', quota: 2, statements: ['gA', 'gV', 'gP', 'gR', 'gP2', 'rP2', 'rRv', 'rPv'],
      status: {
        ...inForce('gA', 'gV', revokes[0], revokes[1]), [revokes[2]]: 'over-quota',
        [target[revokes[0]]]: 'removed', [target[revokes[1]]]: 'removed', [target[revokes[2]]]: 'over-quota',
      },
    };
  })(),
  (() => {
    const [keep, over] = byId(['gV', 'gV2']);
    return {
      label: 'a bucket keeps at most the delegate quota of delegating grants, decided by id; the anchor\'s bucket is exempt (test parameter delegateQuota = 1)',
      pin: 'anchor-2-of-3', delegateQuota: 1, statements: ['gA', 'gW', 'gV', 'gV2', 'gP3'],
      status: { ...inForce('gA', 'gW', 'gP3', keep), [over]: 'over-quota' },
    };
  })(),
  {
    label: 'copies of an anchor statement are judged one by one, never merged',
    pin: 'anchor-2-of-3', statements: ['gA', 'splitA1', 'splitA2'],
    status: { gA: 'in-force', splitA1: 'invalid', splitA2: 'invalid' },
    sameRootAs: null,
  },
  {
    label: 'one copy that meets the threshold makes the statement valid',
    pin: 'anchor-2-of-3', statements: ['splitA1', 'splitA2', 'splitFull'],
    status: inForce('splitA1', 'splitA2', 'splitFull'),
  },
  {
    label: 'an endorse does not override a revoke',
    pin: 'anchor-2-of-3', statements: [...tree, 'rA', 'eVonly', 'rVanchor'],
    status: { ...inForce('gW', 'gQ', 'rA', 'eVonly', 'rVanchor'), gA: 'removed', gV: 'removed', ...st('dead', 'gP', 'gR') },
  },
  {
    label: 'rescue reaches past a dead grant to the revoke that cut it off',
    pin: 'anchor-2-of-3', statements: ['gA', 'gV', 'gP', 'rA', 'ePanchor'],
    status: { ...inForce('rA', 'ePanchor', 'gP'), gA: 'removed', gV: 'dead' },
    live: ['gA', 'gV'],
    keptBy: { gP: 'anchor' },
  },
  {
    label: 'a revoke acts target by target: on its chain it removes, off it and on a revoke it does nothing',
    pin: 'anchor-2-of-3', statements: ['gA', 'gW', 'gV', 'gP', 'gQ', 'rWQ', 'rMix'],
    status: { ...inForce('gA', 'gW', 'gV', 'rWQ', 'rMix'), gP: 'removed', gQ: 'removed' },
  },
  {
    label: 'review attack r2: admins hung under over-quota grants are dead, never rescued',
    pin: 'anchor-2-of-3', statements: ['gA', ...r2D, ...r2C, 'r2E'],
    status: { ...inForce('gA', 'r2E', ...r2Kept), ...st('over-quota', ...r2Over), ...st('dead', ...r2C) },
    bound: { below: 'gA', statements: AUTHORITY_QUOTA * (1 + AUTHORITY_DELEGATE_QUOTA + AUTHORITY_DELEGATE_QUOTA ** 2), delegating: AUTHORITY_DELEGATE_QUOTA * (1 + AUTHORITY_DELEGATE_QUOTA + AUTHORITY_DELEGATE_QUOTA ** 2) },
  },
  {
    label: 'review attack r2 laundered: the admin revokes its own over-quota grants, and their rescue is charged to its full delegate quota',
    pin: 'anchor-2-of-3', statements: ['gA', ...r2D, ...r2C, 'r2E', 'r2Launder'],
    status: { ...inForce('gA', 'r2E', 'r2Launder', ...r2Kept), ...st('removed', ...r2Over), ...st('over-quota', ...r2C) },
    bound: { below: 'gA', statements: AUTHORITY_QUOTA * (1 + AUTHORITY_DELEGATE_QUOTA + AUTHORITY_DELEGATE_QUOTA ** 2), delegating: AUTHORITY_DELEGATE_QUOTA * (1 + AUTHORITY_DELEGATE_QUOTA + AUTHORITY_DELEGATE_QUOTA ** 2) },
  },
  (() => {
    const [c1, c2, c3] = byId(fitC);
    return {
      label: 'a rescue that fits: rescued delegating grants take the endorser\'s free delegate slots, by id',
      pin: 'anchor-2-of-3', statements: ['gA', ...fitD, ...fitC, 'fitRevoke', 'fitEndorse'],
      status: { ...inForce('gA', 'fitRevoke', 'fitEndorse', ...fitD.slice(1), c1, c2), fitD0: 'removed', [c3]: 'over-quota' },
      keptBy: { [c1]: 'gA', [c2]: 'gA' },
      live: ['fitD0'],
    };
  })(),
  {
    label: 'review attack r1 at test scale: depth-3 admins under over-quota grants stay dead (test parameters quota = 4, delegateQuota = 2)',
    pin: 'anchor-2-of-3', quota: 4, delegateQuota: 2, statements: ['gA', ...r1D, ...r1C, ...r1V, 'r1E'],
    status: {
      ...inForce('gA', 'r1E', ...r1Kept, ...r1Kept.map((d) => d.replace('D', 'C')), ...r1V.filter((v) => r1Kept.some((d) => v.startsWith(d.replace('D', 'V'))))),
      ...st('over-quota', ...r1Over),
      ...st('dead', ...r1Over.map((d) => d.replace('D', 'C')), ...r1V.filter((v) => r1Over.some((d) => v.startsWith(d.replace('D', 'V'))))),
    },
    bound: { below: 'gA', statements: 4 * (1 + 2 + 4), delegating: 2 * (1 + 2 + 4) },
  },
  {
    label: 'review attack r1 at test scale, laundered (test parameters quota = 4, delegateQuota = 2)',
    pin: 'anchor-2-of-3', quota: 4, delegateQuota: 2, statements: ['gA', ...r1D, ...r1C, ...r1V, 'r1E', 'r1Launder'],
    status: {
      ...inForce('gA', 'r1E', 'r1Launder', ...r1Kept, ...r1Kept.map((d) => d.replace('D', 'C')), ...r1V.filter((v) => r1Kept.some((d) => v.startsWith(d.replace('D', 'V'))))),
      ...st('removed', ...r1Over),
      ...st('over-quota', ...r1Over.map((d) => d.replace('D', 'C'))),
      ...st('dead', ...r1V.filter((v) => r1Over.some((d) => v.startsWith(d.replace('D', 'V'))))),
    },
    bound: { below: 'gA', statements: 4 * (1 + 2 + 4), delegating: 2 * (1 + 2 + 4) },
  },
  {
    label: 'the bound is reached by a full tree (test parameters quota = 2, delegateQuota = 1)',
    pin: 'anchor-2-of-3', quota: 2, delegateQuota: 1, statements: ['gA', 'tD', 'tP1', 'tC', 'tP2', 'tS1', 'tS2'],
    status: inForce('gA', 'tD', 'tP1', 'tC', 'tP2', 'tS1', 'tS2'),
    bound: { below: 'gA', statements: 2 * (1 + 1 + 1), delegating: 1 * (1 + 1 + 1), exact: true },
  },
  {
    label: 'and not exceeded by extra grants, a laundering revoke and a rescue (test parameters quota = 2, delegateQuota = 1)',
    pin: 'anchor-2-of-3', quota: 2, delegateQuota: 1,
    statements: ['gA', 'tD', 'tP1', 'tC', 'tP2', 'tS1', 'tS2', 'tExtraD', 'tExtraC', 'tExtraS', 'tLaunder', 'tRescue'],
    status: {
      ...inForce('gA', 'tLaunder', 'tRescue'), tExtraD: 'removed', ...st('over-quota', 'tD', 'tP1', 'tExtraC'),
      ...st('dead', 'tC', 'tP2', 'tS1', 'tS2', 'tExtraS'),
    },
    bound: { below: 'gA', statements: 2 * (1 + 1 + 1), delegating: 1 * (1 + 1 + 1) },
  },
];

const keyLabel = new Map(Object.entries(K).map(([label, k]) => [k.key, label]));
const subjectLabel = (nodeId, key) => {
  const label = keyLabel.get(key);
  return K[label]?.nodeId === nodeId ? label : `${label} as ${nodeId}`;
};
const lifecycleRows = (entries) => {
  const scopes = [...new Set(entries.map((e) => e.scope).filter((s) => s !== null))].sort();
  return {
    outsideEveryScope: lifecycleAuthority(entries, () => false),
    insideScope: Object.fromEntries(scopes.map((scope) => [scope, lifecycleAuthority(entries, (s) => scopeNarrows(s, scope))])),
  };
};
const builtCases = authorityCases.map((c) => {
  const pin = pins[c.pin];
  const list = c.statements.map((l) => statementDefs[l]);
  const r = resolveAuthority({ pin, statements: list, quota: c.quota ?? AUTHORITY_QUOTA, delegateQuota: c.delegateQuota ?? AUTHORITY_DELEGATE_QUOTA });
  const status = Object.fromEntries(c.statements.map((l) => [l, r.status.get(idOf(l))]));
  for (const l of c.statements) {
    if (status[l] !== c.status[l]) throw new Error(`authority case "${c.label}": ${l} resolved ${status[l]}, rule says ${c.status[l]}`);
  }
  // Roles, derived from the hand-written statuses alone: every in-force grant's subject, with its
  // scope, and the pinned members of a threshold-1 anchor.
  const want = new Map();
  for (const l of c.statements) {
    const s = statementDefs[l];
    if (c.status[l] !== 'in-force' || s.kind !== 'grant') continue;
    const k = `${s.subject.nodeId} ${s.subject.key}`;
    if (!want.has(k)) want.set(k, new Set());
    want.get(k).add(`${s.role} ${s.scope ?? ''}`);
  }
  if (pin.threshold === 1) for (const m of pin.keys) if (m.nodeId) {
    const k = `${m.nodeId} ${m.key}`;
    if (!want.has(k)) want.set(k, new Set());
    want.get(k).add('anchor ');
  }
  const got = new Map([...r.roles].map(([k, entries]) => [k, new Set(entries.map((e) => `${e.role} ${e.scope ?? ''}`))]));
  const flat = (m) => JSON.stringify([...m].map(([k, v]) => [k, [...v].sort()]).sort());
  if (flat(got) !== flat(want)) throw new Error(`authority case "${c.label}": roles ${flat(got)}, rule says ${flat(want)}`);
  const wantLive = new Set([...r.inForce, ...(c.live ?? []).map(idOf)]);
  if (r.live.length !== wantLive.size || !r.live.every((id) => wantLive.has(id))) throw new Error(`authority case "${c.label}": live set`);
  for (const [l, bucket] of Object.entries(c.keptBy ?? {})) {
    const wantBucket = bucket === 'anchor' ? 'anchor' : idOf(bucket);
    if (r.keptBy.get(idOf(l)) !== wantBucket) throw new Error(`authority case "${c.label}": ${l} kept by ${r.keptBy.get(idOf(l))}, rule says ${bucket}`);
  }
  if (c.bound) {
    const top = idOf(c.bound.below);
    const below = r.inForce.filter((id) => r.chainOf(id).includes(top));
    const delegating = below.filter((id) => { const s = list.find((x) => authorityId(x) === id); return s.kind === 'grant' && ['admin', 'validator', 'issuer'].includes(s.role); });
    if (below.length > c.bound.statements || delegating.length > c.bound.delegating) throw new Error(`authority case "${c.label}": ${below.length} statements and ${delegating.length} delegating grants in force below ${c.bound.below}, bound ${c.bound.statements} and ${c.bound.delegating}`);
    if (c.bound.exact && below.length !== c.bound.statements) throw new Error(`authority case "${c.label}": the bound is not reached (${below.length})`);
    c.boundResult = { inForceBelow: below.length, delegatingBelow: delegating.length };
  }
  return {
    label: c.label,
    pin: c.pin,
    ...(c.quota ? { testQuota: c.quota } : {}),
    ...(c.delegateQuota ? { testDelegateQuota: c.delegateQuota } : {}),
    statements: c.statements,
    expected: {
      status,
      inForce: r.inForce,
      live: r.live,
      keptBy: Object.fromEntries(r.inForce.map((id) => [id, r.keptBy.get(id)])),
      roles: [...r.roles].map(([k, entries]) => {
        const [nodeId, key] = k.split(' ');
        return { subject: subjectLabel(nodeId, key), nodeId, key, roles: entries, lifecycle: lifecycleRows(entries) };
      }).sort((x, y) => (x.subject < y.subject ? -1 : 1)),
      root: r.root,
      ...(c.bound ? { bound: { below: c.bound.below, maxStatements: c.bound.statements, maxDelegating: c.bound.delegating, ...c.boundResult } } : {}),
    },
  };
});
const caseByLabel = new Map(builtCases.map((c) => [c.label, c]));
for (const c of authorityCases) {
  if (!c.sameRootAs) continue;
  if (caseByLabel.get(c.sameRootAs).expected.root !== caseByLabel.get(c.label).expected.root) throw new Error(`authority case "${c.label}": root must equal "${c.sameRootAs}"`);
}

write('authority-v2.json', {
  protocolVersion: PROTOCOL_VERSION,
  construction: 'mmp-authority-v1',
  usage: 'Statement ids, payload bytes, pin digests and authority roots are deterministic and MUST reproduce exactly. Signatures are verification only (§18.3.2; see ed25519-strict-v2.json): check that each verifies over its payload; never sign and compare bytes. For every case, resolve the listed statements in any order, and in every order, and reproduce expected.status, inForce, live, keptBy (the bucket that keeps each in-force statement: its own, or its rescuer\'s), roles and root. A case with testQuota or testDelegateQuota uses that value in place of AUTHORITY_QUOTA or AUTHORITY_DELEGATE_QUOTA. lifecycle is informative: what each subject may advance a CMB to outside every scope, and inside each scope it holds.',
  constants: { MAX_DELEGATION_DEPTH, AUTHORITY_QUOTA, AUTHORITY_ANCHOR_QUOTA, AUTHORITY_DELEGATE_QUOTA },
  warning: 'all private seeds are fixed conformance fixtures; never use them as identities',
  testKeys: Object.fromEntries(Object.entries(K).map(([label, k]) => [label, {
    privateSeedBase64url: b64u(k.seed), publicKeyBase64url: k.key, nodeId: k.nodeId,
  }])),
  pins: Object.fromEntries(Object.entries(pins).map(([label, pin]) => [label, { ...pin, expectedPinDigest: anchorPinDigest(pin) }])),
  statements: Object.fromEntries(Object.entries(statementDefs).map(([label, statement]) => [label, {
    statement,
    expectedPayloadHex: hex(authorityPayloadV1(statement)),
    expectedId: authorityId(statement),
  }])),
  cases: builtCases,
});
