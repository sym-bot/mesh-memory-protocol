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
} from './mmp/lib.mjs';

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
