import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  aeadAADV2,
  applicationCommitmentV1,
  assertionId,
  blockKeyV2,
  categoryParentsCommitment,
  decryptChaChaPoly,
  ed25519PrivateKey,
  handshakeProofV2,
  handshakeTranscriptV2,
  hkdf,
  keyConfirmation,
  nonceFromSequence,
  requireNextSequence,
  rawPublicKey,
  sha256,
  signingPayloadV2_0,
  x25519PrivateKey,
  AUTHORITY_ANCHOR_QUOTA,
  AUTHORITY_DELEGATE_QUOTA,
  AUTHORITY_QUOTA,
  MAX_DELEGATION_DEPTH,
  DELEGATING_ROLES,
  anchorPinDigest,
  authorityId,
  authorityOrder,
  authorityPayloadV1,
  authorityRoot,
  authorityWellFormed,
  ed25519Equations,
  ed25519PrecheckFailure,
  ed25519PublicKey,
  lifecycleAuthority,
  resolveAuthority,
  scopeNarrows,
  verifyEd25519Strict,
  verifyEd25519StrictFull,
} from './mmp/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactRoot = root;   // MIRROR LAYOUT: the source's public/spec/mmp/* lives at this repo's root
const read = (name) => JSON.parse(fs.readFileSync(path.join(artifactRoot, 'conformance', 'v2', name), 'utf8'));
const readExample = (name) => JSON.parse(fs.readFileSync(path.join(artifactRoot, 'examples', 'v2', name), 'utf8'));
const b64u = (value) => Buffer.from(value, 'base64url');
const hex = (value) => Buffer.from(value).toString('hex');
const schema = (name) => JSON.parse(fs.readFileSync(path.join(artifactRoot, 'schema', name), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const schemaNames = fs.readdirSync(path.join(artifactRoot, 'schema')).filter((name) => name.endsWith('.schema.json')).sort();
for (const name of schemaNames) {
  ajv.addSchema(schema(name));
}
for (const name of schemaNames) {
  const id = schema(name).$id;
  assert.ok(ajv.getSchema(id), `${name}: schema must compile`);
}
const validateCMB = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/cmb.schema.json');
const validateCMBFrame = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/cmb-frame.schema.json');
const validateHandshake = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/handshake.schema.json');
const validateEncrypted = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/encrypted-cmb-frame.schema.json');
const validateControl = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/control-frame.schema.json');
const validateAuthority = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/authority-frame.schema.json');
const validateRelay = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/relay-frame.schema.json');
const validateFrameRegistry = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/frame-registry.schema.json');

const registry = JSON.parse(fs.readFileSync(path.join(artifactRoot, 'frame-registry.json'), 'utf8'));
assert.ok(validateFrameRegistry(registry), `frame registry schema ${JSON.stringify(validateFrameRegistry.errors)}`);
assert.equal(registry.protocolVersion, '2.0', 'frame registry protocol version');
assert.equal(new Set(registry.frames.map(({ type }) => type)).size, registry.frames.length, 'frame types must be unique');
for (const frame of registry.frames) {
  if (frame.status === 'legacy') {
    assert.equal(frame.schema, null, `${frame.type}: legacy types do not define a v2 schema`);
  } else {
    assert.ok(frame.schema, `${frame.type}: active frame must name a schema`);
    assert.ok(schemaNames.includes(frame.schema), `${frame.type}: missing ${frame.schema}`);
  }
}

const nodeA = '018f47a0-7b21-7abc-8def-111111111111';
const nodeB = '018f47a0-7b21-7abc-8def-222222222222';
const wake = { platform: 'apns', token: 'fixture-token', environment: 'development' };
for (const frame of [
  { type: 'peer-info', peers: [{ nodeId: nodeA, name: 'fixture-node', wakeChannel: wake, lastSeen: 1786611600000 }] },
  { type: 'wake-channel', ...wake },
  { type: 'error', code: 1001, message: 'version mismatch' },
  { type: 'ping' },
  { type: 'pong' },
]) assert.ok(validateControl(frame), `${frame.type}: control schema ${JSON.stringify(validateControl.errors)}`);

const authId = `auth-${'ab'.repeat(32)}`;
const keyA = 'A'.repeat(43);
const keyB = `${'B'.repeat(42)}A`;
const sigEntry = { key: keyA, sig: 'A'.repeat(86) };
const grantShape = { kind: 'grant', authorisedBy: 'anchor', subject: { nodeId: nodeB, key: keyA }, role: 'validator', nonce: 'A'.repeat(22), sigs: [sigEntry, { ...sigEntry, key: keyB }] };
const revokeShape = { kind: 'revoke', authorisedBy: authId, targets: [`auth-${'cd'.repeat(32)}`], nonce: 'A'.repeat(22), issuedAt: 1786611600000, sigs: [sigEntry] };
const endorseShape = { kind: 'endorse', authorisedBy: authId, targets: [authId.replace('ab', 'ef')], nonce: 'A'.repeat(22), sigs: [sigEntry] };
for (const frame of [
  { type: 'authority-statement', statement: grantShape },
  { type: 'authority-statement', statement: revokeShape },
  { type: 'authority-statement', statement: endorseShape },
  { type: 'authority-statement', statement: { ...grantShape, role: 'xmesh-seat' } },
  { type: 'authority-statement', statement: { ...grantShape, role: 'issuer', scope: 'xmesh-world:w1/region-a' } },
  { type: 'authority-statement', statement: { ...revokeShape, issuedAt: Number.MAX_SAFE_INTEGER } },
  { type: 'authority-digest', root: 'ab'.repeat(32), count: 3 },
  { type: 'authority-fetch', reqId: 'af-0123456789abcdef', ids: [authId] },
  { type: 'authority-fetch', reqId: 'af-0123456789abcdef', after: '' },
  { type: 'authority-set', reqId: 'af-0123456789abcdef', statements: [grantShape, revokeShape], missing: [authId], next: 'opaque-cursor' },
]) assert.ok(validateAuthority(frame), `${frame.type}: authority schema ${JSON.stringify(validateAuthority.errors)}`);
for (const [label, frame] of [
  ['a non-anchor statement carries one signature', { type: 'authority-statement', statement: { ...revokeShape, sigs: [sigEntry, sigEntry] } }],
  ['targets are unique', { type: 'authority-statement', statement: { ...revokeShape, targets: [authId, authId] } }],
  ['a revoke names at least one grant', { type: 'authority-statement', statement: { ...revokeShape, targets: [] } }],
  ['there is no time field that resolution reads', { type: 'authority-statement', statement: { ...grantShape, grantedAt: 1786611600000 } }],
  ['a revoke carries no cutoff', { type: 'authority-statement', statement: { ...revokeShape, cutoff: 0 } }],
  ['the anchor is not a grantable role', { type: 'authority-statement', statement: { ...grantShape, role: 'anchor' } }],
  ['a fetch asks for ids or a page, not both', { type: 'authority-fetch', reqId: 'x', ids: [authId], after: '' }],
  ['a fetch asks for something', { type: 'authority-fetch', reqId: 'x' }],
  ['the retired role-grant frame has no schema', { type: 'role-grant', grant: { type: 'role-grant', grantee: nodeB, grantedBy: nodeA, grantedAt: 0, sigAlg: 'ed25519', sig: 'A'.repeat(86) } }],
]) assert.ok(!validateAuthority(frame), `authority schema must reject: ${label}`);
// The schema and the reference accept exactly the same shapes (finding 3). The one difference is
// the point check on a subject key, which no JSON Schema can express; it is listed last.
{
  const base = { kind: 'grant', authorisedBy: 'anchor', subject: { nodeId: '018f47a0-7b21-7abc-8def-0000000000a1', key: rawPublicKey(crypto.createPublicKey(ed25519PrivateKey(Buffer.alloc(32, 7)))).toString('base64url') }, role: 'validator', nonce: 'AAAAAAAAAAAAAAAAAAAAAQ', sigs: [{ key: keyA, sig: 'A'.repeat(86) }] };
  const shapes = [
    ['the base grant', base, true],
    ['issuedAt = 2^53 - 1', { ...base, issuedAt: Number.MAX_SAFE_INTEGER }, true],
    ['issuedAt = 2^53 + 2', { ...base, issuedAt: 2 ** 53 + 2 }, false],
    ['nodeId in upper case', { ...base, subject: { ...base.subject, nodeId: base.subject.nodeId.toUpperCase() } }, false],
    ['nodeId as urn:uuid:', { ...base, subject: { ...base.subject, nodeId: `urn:uuid:${base.subject.nodeId}` } }, false],
    ['nodeId without hyphens', { ...base, subject: { ...base.subject, nodeId: base.subject.nodeId.replaceAll('-', '') } }, false],
    ['a non-canonical nonce', { ...base, nonce: 'AAAAAAAAAAAAAAAAAAAAAB' }, false],
    ['a non-canonical key in a signature entry', { ...base, sigs: [{ key: `${'A'.repeat(42)}B`, sig: 'A'.repeat(86) }] }, false],
    ['a non-canonical signature', { ...base, sigs: [{ key: keyA, sig: `${'A'.repeat(85)}B` }] }, false],
    ['a scope', { ...base, scope: 'xmesh-world:w1' }, true],
    ['a scope with a trailing slash', { ...base, scope: 'xmesh-world:w1/' }, false],
    ['a scope with a ".." segment', { ...base, scope: 'xmesh-world:w1/../w2' }, false],
    ['a scope with a "." segment', { ...base, scope: 'xmesh-world:w1/./a' }, false],
    ['a scope whose path is only dots', { ...base, scope: 'xmesh-world:...' }, false],
    ['a scope segment that starts with dots', { ...base, scope: 'xmesh-world:w1/..x' }, true],
    ['a scope with no namespace', { ...base, scope: 'w1' }, false],
    ['a scope of 257 characters', { ...base, scope: `x:${'a'.repeat(255)}` }, false],
    ['the role issuer', { ...base, role: 'issuer' }, true],
    ['an extension role', { ...base, role: 'xmesh-seat' }, true],
    ['a role with no hyphen that is not a core role', { ...base, role: 'seat' }, false],
  ];
  for (const [label, s, want] of shapes) {
    assert.equal(validateAuthority({ type: 'authority-statement', statement: s }), want, `schema on ${label}`);
    assert.equal(authorityWellFormed(s), want, `reference on ${label}`);
  }
  const identityKey = { ...base, subject: { ...base.subject, key: Buffer.concat([Buffer.from([1]), Buffer.alloc(31)]).toString('base64url') } };
  assert.ok(validateAuthority({ type: 'authority-statement', statement: identityKey }), 'the schema cannot see that the identity is not a usable key');
  assert.ok(!authorityWellFormed(identityKey), 'the reference rejects a grant whose subject key is the identity point (§18.3.2)');
}

for (const frame of [
  { type: 'relay-auth', nodeId: nodeA, name: 'fixture-node', token: 'fixture-token', wakeChannel: wake },
  { type: 'relay-peers', peers: [{ nodeId: nodeB, name: 'peer-node', offline: false }] },
  { type: 'relay-ping' }, { type: 'relay-pong' }, { type: 'relay-reauth' },
  { type: 'relay-peer-joined', nodeId: nodeB, name: 'peer-node' },
  { type: 'relay-peer-left', nodeId: nodeB, name: 'peer-node' },
  { type: 'relay-error', message: 'fixture error' },
]) assert.ok(validateRelay(frame), `${frame.type}: relay schema ${JSON.stringify(validateRelay.errors)}`);

const app = read('application-v2.json');
for (const c of app.cases) assert.equal(applicationCommitmentV1(c.application), c.expectedCommitment, c.label);
const tamperedApplication = structuredClone(app.cases[1].application);
tamperedApplication.data = Buffer.from('tampered', 'utf8').toString('base64url');
assert.throws(() => applicationCommitmentV1(tamperedApplication), /byteLength mismatch|digest mismatch/);

const records = read('record-signature-v2.json');
const signingPrivate = ed25519PrivateKey(b64u(records.testKey.privateSeedBase64url));
const signingPublic = crypto.createPublicKey(signingPrivate);
assert.equal(rawPublicKey(signingPublic).toString('base64url'), records.testKey.publicKeyBase64url);
for (const c of records.cases) {
  assert.ok(validateCMB(c.record), `${c.label}: schema ${JSON.stringify(validateCMB.errors)}`);
  assert.equal(blockKeyV2(c.record.categories), c.record.metadata.key, `${c.label}: cognition key`);
  assert.equal(categoryParentsCommitment(c.record.categories), c.expectedCategoryParentsCommitment, `${c.label}: category parents`);
  const payload = signingPayloadV2_0(c.record);
  assert.equal(hex(payload), c.expectedSigningPayloadHex, `${c.label}: payload`);
  assert.equal(assertionId(c.record), c.expectedAssertionId, `${c.label}: assertion id`);
  assert.ok(crypto.verify(null, payload, signingPublic, b64u(c.expectedSignature)), `${c.label}: signature`);
}
assert.equal(records.cases[0].record.metadata.key, records.cases[1].record.metadata.key, 'same CAT7 must collapse');
assert.notEqual(records.cases[0].expectedAssertionId, records.cases[1].expectedAssertionId, 'different application must not dedupe as one assertion');
const wrongAddressScheme = structuredClone(records.cases[0].record);
wrongAddressScheme.metadata.addressScheme = 'unknown-scheme';
assert.throws(() => signingPayloadV2_0(wrongAddressScheme), /addressScheme/);

for (const name of ['transport-cmb.json', 'feedback-dismissal.json', 'feedback-directive.json']) {
  const frame = readExample(name);
  assert.ok(validateCMBFrame(frame), `${name}: frame schema ${JSON.stringify(validateCMBFrame.errors)}`);
  assert.equal(blockKeyV2(frame.cmb.categories), frame.cmb.metadata.key, `${name}: cognition key`);
  assert.equal(assertionId(frame.cmb), frame.cmb.metadata.assertionId, `${name}: assertion id`);
  assert.ok(crypto.verify(
    null,
    signingPayloadV2_0(frame.cmb),
    signingPublic,
    b64u(frame.cmb.metadata.sig),
  ), `${name}: signature`);
}

const hv = read('handshake-v2.json');
for (const [name, frame] of Object.entries(hv.fixture.frames)) {
  assert.ok(validateHandshake(frame), `${name}: handshake schema ${JSON.stringify(validateHandshake.errors)}`);
}
const transcript = handshakeTranscriptV2(hv.fixture.handshake);
const transcriptHash = sha256(transcript);
assert.equal(hex(transcript), hv.expected.transcriptHex);
assert.equal(hex(transcriptHash), hv.expected.transcriptHashHex);
assert.equal(transcriptHash.subarray(0, 16).toString('hex'), hv.expected.sessionId);
const clientEd = ed25519PrivateKey(b64u(hv.fixture.clientIdentityPrivateSeedBase64url));
const serverEd = ed25519PrivateKey(b64u(hv.fixture.serverIdentityPrivateSeedBase64url));
for (const [role, key] of [['client', clientEd], ['server', serverEd]]) {
  const payload = handshakeProofV2(role, transcriptHash);
  assert.equal(hex(payload), hv.expected[`${role}ProofPayloadHex`]);
  assert.ok(crypto.verify(null, payload, crypto.createPublicKey(key), b64u(hv.expected[`${role}ProofBase64url`])));
}
const substitutedHandshake = structuredClone(hv.fixture.handshake);
substitutedHandshake.server.nodeId = '018f47a0-7b21-7abc-8def-333333333333';
const substitutedHash = sha256(handshakeTranscriptV2(substitutedHandshake));
assert.ok(!crypto.verify(
  null,
  handshakeProofV2('server', substitutedHash),
  crypto.createPublicKey(serverEd),
  b64u(hv.expected.serverProofBase64url),
), 'nodeId substitution must invalidate the server proof');
const clientX = x25519PrivateKey(b64u(hv.fixture.clientE2EPrivateKeyBase64url));
const serverX = x25519PrivateKey(b64u(hv.fixture.serverE2EPrivateKeyBase64url));
const shared = crypto.diffieHellman({ privateKey: clientX, publicKey: crypto.createPublicKey(serverX) });
assert.equal(hex(shared), hv.expected.sharedSecretHex);
for (const role of ['client', 'server']) {
  const finished = hkdf(shared, transcriptHash, `mmp-finished-v2 ${role}`);
  assert.equal(hex(finished), hv.expected[`${role}FinishedKeyHex`]);
  assert.equal(hex(keyConfirmation(role, finished, transcriptHash)), hv.expected[`${role}KeyConfirmationHex`]);
}
for (const direction of ['client-to-server', 'server-to-client']) {
  assert.equal(hex(hkdf(shared, transcriptHash, `mmp-aead-v2 ${direction}`)), hv.expected[`${direction === 'client-to-server' ? 'clientToServer' : 'serverToClient'}KeyHex`]);
}

const ev = read('e2e-v2.json');
const plaintext = Buffer.from(ev.protectedPlaintextUtf8, 'utf8');
for (const c of ev.cases) {
  const key = Buffer.from(c.trafficKeyHex, 'hex');
  const aad = aeadAADV2({ sessionId: ev.sessionId, direction: c.direction, sequence: c.sequence, metadata: ev.metadata });
  assert.equal(hex(nonceFromSequence(c.sequence)), c.nonceHex, `${c.direction}/${c.sequence}: nonce`);
  assert.equal(hex(aad), c.aadHex, `${c.direction}/${c.sequence}: aad`);
  const frame = {
    type: 'cmb-encrypted',
    protocolVersion: ev.protocolVersion,
    suite: ev.suite,
    sessionId: ev.sessionId,
    sequence: c.sequence,
    direction: c.direction,
    metadata: ev.metadata,
    sealed: c.sealedBase64url,
  };
  assert.ok(validateEncrypted(frame), `${c.direction}/${c.sequence}: encrypted schema ${JSON.stringify(validateEncrypted.errors)}`);
  assert.deepEqual(decryptChaChaPoly({ key, sequence: c.sequence, sealed: b64u(c.sealedBase64url), aad }), plaintext, `${c.direction}/${c.sequence}: decrypt`);
  const tamperedAAD = Buffer.from(aad);
  tamperedAAD[tamperedAAD.length - 1] ^= 1;
  assert.throws(() => decryptChaChaPoly({ key, sequence: c.sequence, sealed: b64u(c.sealedBase64url), aad: tamperedAAD }), undefined, `${c.direction}/${c.sequence}: tampered AAD`);
  const tamperedSealed = b64u(c.sealedBase64url);
  tamperedSealed[0] ^= 1;
  assert.throws(() => decryptChaChaPoly({ key, sequence: c.sequence, sealed: tamperedSealed, aad }), undefined, `${c.direction}/${c.sequence}: tampered ciphertext`);
}

const noApp = ev.noApplication;
assert.equal(noApp.metadata.application, null, 'no-application metadata must remain explicit null');
const noAppShape = JSON.parse(noApp.protectedPlaintextUtf8);
assert.deepEqual(Object.keys(noAppShape), ['categories'], 'applicationData must be omitted when metadata.application is null');
assert.deepEqual(noAppShape.categories, JSON.parse(ev.protectedPlaintextUtf8).categories, 'application presence must not alter cognition bytes');
const noAppCase = noApp.case;
const noAppKey = Buffer.from(noAppCase.trafficKeyHex, 'hex');
const noAppAAD = aeadAADV2({
  sessionId: ev.sessionId,
  direction: noAppCase.direction,
  sequence: noAppCase.sequence,
  metadata: noApp.metadata,
});
assert.equal(hex(nonceFromSequence(noAppCase.sequence)), noAppCase.nonceHex, 'no-application: nonce');
assert.equal(hex(noAppAAD), noAppCase.aadHex, 'no-application: aad');
assert.ok(validateEncrypted({
  type: 'cmb-encrypted',
  protocolVersion: ev.protocolVersion,
  suite: ev.suite,
  sessionId: ev.sessionId,
  sequence: noAppCase.sequence,
  direction: noAppCase.direction,
  metadata: noApp.metadata,
  sealed: noAppCase.sealedBase64url,
}), `no-application: encrypted schema ${JSON.stringify(validateEncrypted.errors)}`);
assert.deepEqual(
  decryptChaChaPoly({ key: noAppKey, sequence: noAppCase.sequence, sealed: b64u(noAppCase.sealedBase64url), aad: noAppAAD }),
  Buffer.from(noApp.protectedPlaintextUtf8, 'utf8'),
  'no-application: decrypt',
);

// §18.3.2 Ed25519: the edge cases, through the rule as Node implements it and as written.
{
  const ev = read('ed25519-strict-v2.json');
  assert.ok(ev.cases.length >= 20, 'ed25519 edge cases');
  for (const c of ev.cases) {
    const m = Buffer.from(c.messageHex, 'hex');
    const A = Buffer.from(c.publicKeyHex, 'hex');
    const sig = Buffer.from(c.signatureHex, 'hex');
    const want = c.expected === 'accept';
    assert.equal(verifyEd25519Strict(m, A, sig), want, `${c.label}: the rule via a cofactorless library`);
    assert.equal(verifyEd25519StrictFull(m, A, sig), want, `${c.label}: the rule as written`);
    assert.equal(ed25519PrecheckFailure(A, sig), c.precheckFailure, `${c.label}: pre-check`);
    assert.deepEqual(ed25519Equations(m, A, sig), c.equationsWithoutPrechecks, `${c.label}: equations`);
    if (c.precheckFailure === null) {
      const eq = ed25519Equations(m, A, sig);
      assert.equal(eq.cofactored, eq.cofactorless, `${c.label}: once the pre-checks pass the equations agree`);
      assert.equal(crypto.verify(null, m, ed25519PublicKey(A), sig), eq.cofactorless, `${c.label}: and the library agrees`);
    }
  }
  assert.equal(ev.cases.filter((c) => c.equationsWithoutPrechecks.cofactored !== c.equationsWithoutPrechecks.cofactorless).length > 0, true, 'the vector contains cases where unchecked equations disagree');
  // Honest signatures and single-bit flips: the two implementations of the rule agree.
  for (let i = 0; i < 16; i++) {
    const priv = ed25519PrivateKey(sha256(Buffer.from(`ed25519 agreement ${i}`)));
    const A = rawPublicKey(crypto.createPublicKey(priv));
    const m = sha256(Buffer.from(`message ${i}`));
    const sig = crypto.sign(null, m, priv);
    assert.ok(verifyEd25519Strict(m, A, sig) && verifyEd25519StrictFull(m, A, sig), `honest signature ${i}`);
    const flipped = Buffer.from(sig); flipped[(i * 7) % 64] ^= 1 << (i % 8);
    assert.equal(verifyEd25519Strict(m, A, flipped), verifyEd25519StrictFull(m, A, flipped), `flipped signature ${i}`);
  }
}

// §6.6 authority: canonical bytes, ids, pins, roots, and set resolution in every order.
const av = read('authority-v2.json');
assert.equal(av.construction, 'mmp-authority-v1');
assert.deepEqual(av.constants, { MAX_DELEGATION_DEPTH, AUTHORITY_QUOTA, AUTHORITY_ANCHOR_QUOTA, AUTHORITY_DELEGATE_QUOTA }, 'authority constants');
assert.deepEqual({ MAX_DELEGATION_DEPTH, AUTHORITY_QUOTA, AUTHORITY_ANCHOR_QUOTA, AUTHORITY_DELEGATE_QUOTA }, { MAX_DELEGATION_DEPTH: 4, AUTHORITY_QUOTA: 256, AUTHORITY_ANCHOR_QUOTA: 4096, AUTHORITY_DELEGATE_QUOTA: 16 }, 'the constants of §19.1');
for (const [label, k] of Object.entries(av.testKeys)) {
  const priv = ed25519PrivateKey(b64u(k.privateSeedBase64url));
  assert.equal(rawPublicKey(crypto.createPublicKey(priv)).toString('base64url'), k.publicKeyBase64url, `${label}: test key`);
}
for (const [label, pin] of Object.entries(av.pins)) assert.equal(anchorPinDigest(pin), pin.expectedPinDigest, `${label}: pin digest`);
// A pin's nodeIds name the anchor only under a threshold of 1, so only there do they enter the digest.
assert.equal(anchorPinDigest({ threshold: 2, keys: av.pins['anchor-2-of-3'].keys.map((m, i) => ({ ...m, nodeId: `018f47a0-7b21-7abc-8def-00000000000${i}` })) }), av.pins['anchor-2-of-3'].expectedPinDigest, 'nodeIds do not change a threshold-2 pin');
assert.notEqual(anchorPinDigest({ threshold: 1, keys: [{ key: av.pins['anchor-1-of-1'].keys[0].key }] }), av.pins['anchor-1-of-1'].expectedPinDigest, 'a nodeId changes a threshold-1 pin');
const malformedLabels = new Set(['xIdentityKey', 'xUpperNodeId', 'xScopeDotDot', 'xScopeDot']);
const labelsById = new Map();
for (const [label, entry] of Object.entries(av.statements)) {
  const s = entry.statement;
  const payload = authorityPayloadV1(s);
  assert.equal(hex(payload), entry.expectedPayloadHex, `${label}: payload`);
  assert.equal(authorityId(s), entry.expectedId, `${label}: id`);
  assert.equal(entry.expectedId, `auth-${hex(sha256(payload))}`, `${label}: id is the SHA-256 of the payload`);
  assert.equal(authorityWellFormed(s), !malformedLabels.has(label), `${label}: well formed`);
  if (label !== 'xIdentityKey') assert.equal(validateAuthority({ type: 'authority-statement', statement: s }), !malformedLabels.has(label), `${label}: schema`);
  for (const e of s.sigs) {
    // Verification only. Every fixture signature verifies; the invalid fixtures fail on authority,
    // on shape, or by a key the chain does not name, never on bytes.
    assert.ok(verifyEd25519Strict(payload, b64u(e.key), b64u(e.sig)), `${label}: signature by ${e.key.slice(0, 8)}`);
  }
  if (!labelsById.has(entry.expectedId)) labelsById.set(entry.expectedId, label);
  assert.equal(authorityId({ ...s, sigs: [] }), entry.expectedId, `${label}: id excludes signatures`);
  assert.notEqual(authorityId({ ...s, nonce: 'B'.repeat(21) + 'A' }), entry.expectedId, `${label}: id covers the nonce`);
  assert.notEqual(authorityId({ ...s, issuedAt: (s.issuedAt ?? 0) + 1 }), entry.expectedId, `${label}: id covers issuedAt`);
  if (s.kind === 'grant') assert.notEqual(authorityId({ ...s, scope: s.scope ? `${s.scope}/x` : 'x:y' }), entry.expectedId, `${label}: id covers the scope`);
}
{
  const e = av.statements.eV.statement;
  assert.equal(authorityId({ ...e, targets: [...e.targets].reverse() }), av.statements.eV.expectedId, 'target order is not signed');
}
let seed = 0x6d6d70;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const roleRows = (roles) => [...roles].map(([k, entries]) => { const [nodeId, key] = k.split(' '); return { nodeId, key, roles: entries }; })
  .sort((a, b) => (a.nodeId + a.key < b.nodeId + b.key ? -1 : 1));
const caseByLabel = new Map(av.cases.map((c) => [c.label, c]));
for (const c of av.cases) {
  const pin = av.pins[c.pin];
  const list = c.statements.map((l) => av.statements[l].statement);
  const opts = { quota: c.testQuota ?? AUTHORITY_QUOTA, delegateQuota: c.testDelegateQuota ?? AUTHORITY_DELEGATE_QUOTA };
  const want = c.expected;
  const wantRoles = want.roles.map(({ nodeId, key, roles }) => ({ nodeId, key, roles })).sort((a, b) => (a.nodeId + a.key < b.nodeId + b.key ? -1 : 1));
  const check = (statements, tag) => {
    const r = resolveAuthority({ pin, statements, ...opts });
    for (const l of c.statements) assert.equal(r.status.get(av.statements[l].expectedId), want.status[l], `${c.label} [${tag}]: ${l}`);
    assert.deepEqual(r.inForce, want.inForce, `${c.label} [${tag}]: in force`);
    assert.deepEqual(r.live, want.live, `${c.label} [${tag}]: live set`);
    assert.deepEqual(Object.fromEntries(r.inForce.map((id) => [id, r.keptBy.get(id)])), want.keptBy, `${c.label} [${tag}]: kept by`);
    assert.deepEqual(roleRows(r.roles), wantRoles, `${c.label} [${tag}]: roles`);
    assert.equal(r.root, want.root, `${c.label} [${tag}]: root`);
    assert.equal(authorityRoot(pin, want.inForce), want.root, `${c.label} [${tag}]: root bytes`);
    return r;
  };
  const r0 = check(list, 'listed order');
  const shuffles = list.length > 60 ? 6 : 24;
  for (let i = 0; i < shuffles; i++) check(shuffle(list), `order ${i}`);
  // A copy of a statement with a broken signature neither displaces the good copy nor counts.
  const forged = list.map((s) => ({ ...s, sigs: s.sigs.map((e) => ({ ...e, sig: `${e.sig.slice(0, 84)}${e.sig[84] === 'A' ? 'B' : 'A'}${e.sig[85]}` })) }));
  check(shuffle([...forged, ...list, ...forged]), 'with forged copies');
  // Invalid, pending, dead and over-quota statements change nothing: the live set alone resolves
  // to the same in-force set and root. This is how a claimed root is checked (§6.6.7).
  const live = want.live.map((id) => r0.statementOf(id));
  const fromLive = resolveAuthority({ pin, statements: shuffle(live), ...opts });
  assert.deepEqual(fromLive.inForce, want.inForce, `${c.label}: the live set resolves to the same in-force set`);
  assert.equal(fromLive.root, want.root, `${c.label}: the live set reproduces the root`);
  // Authority order puts every statement after its chain.
  const entries = live.map((s) => ({ s, id: authorityId(s), depth: r0.depthOf(authorityId(s)) }));
  const seen = new Set();
  for (const e of authorityOrder(entries)) {
    if (e.s.authorisedBy !== 'anchor') assert.ok(seen.has(e.s.authorisedBy), `${c.label}: authority order sends a chain first`);
    seen.add(e.id);
  }
  // The stated bound, recomputed from chains.
  if (want.bound) {
    const top = av.statements[want.bound.below].expectedId;
    const below = r0.inForce.filter((id) => r0.chainOf(id).includes(top));
    const delegating = below.filter((id) => { const s = av.statements[labelsById.get(id)].statement; return s.kind === 'grant' && DELEGATING_ROLES.has(s.role); });
    assert.ok(below.length <= want.bound.maxStatements && delegating.length <= want.bound.maxDelegating, `${c.label}: within the bound`);
    assert.equal(below.length, want.bound.inForceBelow, `${c.label}: in force below`);
  }
}
// The same statements under another pin are another authority: the root names the pin.
{
  const c = caseByLabel.get('a delegation tree is in force');
  const other = { threshold: 3, keys: av.pins['anchor-2-of-3'].keys };
  const r = resolveAuthority({ pin: other, statements: c.statements.map((l) => av.statements[l].statement) });
  assert.deepEqual(r.inForce, [], 'under a 3-of-3 pin no two-signature anchor statement is valid');
  assert.notEqual(r.root, c.expected.root, 'a different pin gives a different root');
}
// Independent readings of the rules, so the vector cannot drift into self-consistency only.
{
  const stOf = (label) => caseByLabel.get(label).expected.status;
  const rowOf = (label, subject) => caseByLabel.get(label).expected.roles.find((r) => r.subject === subject);
  const roleOf = (label, subject) => (rowOf(label, subject)?.roles ?? []).map((r) => r.role);
  assert.equal(stOf('the anchor removes the admin: everything the admin authorised is dead').gV, 'dead', 'removing a grant kills what it authorised');
  const endorsed = 'the anchor endorses the admin\'s validator and its revoke: both survive, the admin does not';
  assert.deepEqual(roleOf(endorsed, 'V'), ['validator'], 'an endorsed grant survives its signer');
  assert.deepEqual(roleOf(endorsed, 'A'), [], 'endorsement does not restore the signer');
  assert.equal(stOf(endorsed).gP, 'removed', 'an endorsed revoke still removes');
  assert.equal(stOf('an endorse does not override a revoke').gV, 'removed', 'an endorse does not override a revoke (M5)');
  assert.equal(stOf('rescue reaches past a dead grant to the revoke that cut it off').gP, 'in-force', 'rescue past a dead grant (M9)');
  assert.equal(stOf('an endorse is never rescued, so an endorse that names an endorse keeps nothing').eSelfA, 'dead', 'an endorse is never rescued');
  assert.equal(stOf('a revoke from off the chain removes nothing').gV, 'in-force', 'a sibling cannot revoke');
  const tbt = stOf('a revoke acts target by target: on its chain it removes, off it and on a revoke it does nothing');
  assert.deepEqual([tbt.gP, tbt.gW, tbt.rWQ, tbt.gQ], ['removed', 'in-force', 'in-force', 'removed'], 'target by target (M7, M8)');
  assert.equal(stOf('copies of an anchor statement are judged one by one, never merged').splitA1, 'invalid', 'copies are never merged (M3)');
  assert.equal(stOf('one copy that meets the threshold makes the statement valid').splitA1, 'in-force', 'one sufficient copy');
  const oq = stOf('an over-quota revoke removes nothing (test parameter quota = 2)');
  assert.equal(Object.values(oq).filter((v) => v === 'removed').length, 2, 'two kept revokes remove two grants; the over-quota one removes nothing (M6)');
  const dq = stOf('a bucket keeps at most the delegate quota of delegating grants, decided by id; the anchor\'s bucket is exempt (test parameter delegateQuota = 1)');
  assert.deepEqual([dq.gA, dq.gW, dq.gP3], ['in-force', 'in-force', 'in-force'], 'the anchor bucket is exempt from the delegate quota (M4)');
  assert.deepEqual(roleOf('under a threshold of 1 every pinned member alone is the anchor', 'a1'), ['anchor'], 'a 1-of-2 member is the anchor (M18)');
  assert.deepEqual(roleOf('under a threshold of 1 every pinned member alone is the anchor', 'a2'), ['anchor'], 'so is the other (M18)');
  assert.deepEqual(roleOf('a single-key anchor is the 1-of-1 case, and its holder resolves as anchor', 'a1'), ['anchor'], 'a 1-of-1 member is the anchor');
  const hosted = 'a hosted world four hops below the anchor, scoped to one world; scopes only narrow; an issuer grants seats only; a fifth hop is too deep';
  assert.equal(stOf(hosted).gS1, 'in-force', 'four hops are within MAX_DELEGATION_DEPTH');
  assert.equal(stOf(hosted).xTooDeep, 'invalid', 'a fifth hop is not');
  for (const x of ['xScopeDropped', 'xScopeSideways', 'xScopeWiderSeat', 'xScopeW10', 'xScopeDotDot', 'xScopeDot']) assert.equal(stOf(hosted)[x], 'invalid', `a scope never widens: ${x}`);
  assert.ok(!scopeNarrows('xmesh-world:w1', 'xmesh-world:w10') && scopeNarrows('xmesh-world:w1', 'xmesh-world:w1/region-a'), 'narrowing adds whole segments, never characters');
  const iss = stOf('issuers are delegating grants: a world admin\'s bucket keeps 16 of 17, by id');
  assert.equal(Object.values(iss).filter((v) => v === 'over-quota').length, 1, 'the seventeenth issuer is over the delegate quota');
  const fall = caseByLabel.get('rescue falls through: the lower endorser\'s bucket is full, so the next endorser keeps the grant (test parameter quota = 3)');
  const lowE = ['fEndorseA', 'fEndorseB'].sort((x, y) => Buffer.compare(Buffer.from(av.statements[x].expectedId), Buffer.from(av.statements[y].expectedId)))[0];
  const lowBucket = av.statements[lowE].statement.authorisedBy;
  assert.equal(fall.expected.status.fP, 'in-force', 'a rescue falls through to the next endorser');
  assert.notEqual(fall.expected.keptBy[av.statements.fP.expectedId], lowBucket, 'and the lower endorser, whose bucket is full, does not keep it');
  for (const x of ['xIssuerGrantsValidator', 'xIssuerEndorses']) assert.equal(stOf(hosted)[x], 'invalid', `an issuer grants seats only and never endorses: ${x}`);
  assert.deepEqual(rowOf(hosted, 'SI').roles, [{ role: 'issuer', scope: 'xmesh-world:w1' }], 'the seat issuer holds issuer, in its world');
  assert.equal(lifecycleAuthority(rowOf(hosted, 'SI').roles, () => true), 'none', 'an issuer\'s validation carries no weight anywhere');
  assert.equal(lifecycleAuthority(rowOf(hosted, 'WA').roles, () => false), 'none', 'a world admin has no lifecycle authority outside its world');
  assert.equal(lifecycleAuthority(rowOf(hosted, 'WA').roles, (s) => scopeNarrows(s, 'xmesh-world:w1/region-a')), 'canonical', 'and full authority inside it, including narrower scopes');
  assert.equal(lifecycleAuthority(rowOf(hosted, 'WA').roles, (s) => scopeNarrows(s, 'xmesh-world:w2')), 'none', 'and none in another world');
  assert.equal(stOf('an issuer revokes a seat it granted').gS1, 'removed', 'an issuer revokes below itself');
  assert.equal(stOf('a fresh grant does not revive the old grant\'s dependents').gV, 'dead', 'a re-grant is a new id');
  assert.equal(caseByLabel.get('invalid statements are inert').expected.root, caseByLabel.get('a delegation tree is in force').expected.root, 'invalid statements leave the root unchanged');
  assert.equal(caseByLabel.get('a statement whose chain is not held is pending and changes nothing').expected.root, caseByLabel.get('a delegation tree is in force').expected.root, 'pending statements leave the root unchanged');
  const q = caseByLabel.get('at the quota a bucket keeps removals first, then grants by ascending id (test parameter quota = 2)');
  assert.equal(q.expected.status.rP2, 'in-force', 'removals are kept first at the quota');
  const keptGrant = ['gP', 'gR'].find((l) => q.expected.status[l] === 'in-force');
  const otherGrant = keptGrant === 'gP' ? 'gR' : 'gP';
  assert.ok(Buffer.compare(Buffer.from(av.statements[keptGrant].expectedId), Buffer.from(av.statements[otherGrant].expectedId)) < 0, 'the lower id is kept');
  const r2 = stOf('review attack r2: admins hung under over-quota grants are dead, never rescued');
  assert.equal(Object.entries(r2).filter(([l, v]) => l.startsWith('r2C_') && v !== 'dead').length, 0, 'r2: nothing under an over-quota grant is rescued');
  const r2l = stOf('review attack r2 laundered: the admin revokes its own over-quota grants, and their rescue is charged to its full delegate quota');
  assert.equal(Object.entries(r2l).filter(([l, v]) => l.startsWith('r2C_') && v === 'in-force').length, 0, 'r2 laundered: a full delegate quota rescues nothing');
  const fit = caseByLabel.get('a rescue that fits: rescued delegating grants take the endorser\'s free delegate slots, by id');
  assert.equal(Object.entries(fit.expected.status).filter(([l, v]) => l.startsWith('fitC') && v === 'in-force').length, 2, 'a rescue takes exactly the free delegate slots');
  assert.equal(caseByLabel.get('the bound is reached by a full tree (test parameters quota = 2, delegateQuota = 1)').expected.bound.inForceBelow, 6, 'the bound is reached');
}
// A mutated statement is a different statement, and its signature no longer verifies.
{
  const g = av.statements.gV.statement;
  const mutated = { ...g, role: 'admin' };
  assert.notEqual(authorityId(mutated), av.statements.gV.expectedId, 'a mutated field changes the id');
  assert.ok(!verifyEd25519Strict(authorityPayloadV1(mutated), b64u(g.sigs[0].key), b64u(g.sigs[0].sig)), 'a mutated field breaks the signature');
  assert.ok(!authorityWellFormed({ ...g, sigs: [g.sigs[0], g.sigs[0]] }), 'a non-anchor statement carries one signature');
}
// The bound of §6.6.6, checked on random adversarial sets. A compromised holder X and everything
// below it sign at random: grants of every role to keys from a small pool (so keys repeat), revokes
// of random targets, endorsements of random targets, including X revoking its own grants to rescue
// what hung from them. Signatures are not the subject here, so they are not computed; every
// statement is still well formed and every chain still checked. Small quotas make every limit bite.
{
  const Q = 3; const DQ = 2;
  const pool = Array.from({ length: 6 }, (_, i) => rawPublicKey(crypto.createPublicKey(ed25519PrivateKey(sha256(Buffer.from(`bound pool ${i}`))))).toString('base64url'));
  const anchorKey = pool[0];
  const pin = { threshold: 1, keys: [{ key: anchorKey }] };
  const stub = (payload, e) => true;
  let prng = 0x5eed;
  const rand = (n) => { prng = (prng * 1103515245 + 12345) & 0x7fffffff; return prng % n; };
  const sigOf = (key) => [{ key, sig: 'A'.repeat(86) }];
  let worst = { d1: 0, d1Delegating: 0, d2: 0 };
  for (let trial = 0; trial < 160; trial++) {
    const S = [];
    const add = (s) => { const full = { ...s, nonce: Buffer.from(sha256(Buffer.from(`n ${trial} ${S.length}`)).subarray(0, 16)).toString('base64url') }; S.push(full); return full; };
    const nid = () => `018f47a0-7b21-7abc-8def-${(trial * 1000 + S.length).toString(16).padStart(12, '0')}`;
    const top = add({ kind: 'grant', authorisedBy: 'anchor', subject: { nodeId: nid(), key: pool[1] }, role: 'admin', sigs: sigOf(anchorKey) });
    // A depth-2 holder Y for the second bound: an admin under the anchor grants it.
    const mid = add({ kind: 'grant', authorisedBy: 'anchor', subject: { nodeId: nid(), key: pool[2] }, role: 'admin', sigs: sigOf(anchorKey) });
    const y = add({ kind: 'grant', authorisedBy: authorityId(mid), subject: { nodeId: nid(), key: pool[3] }, role: 'admin', sigs: sigOf(pool[2]) });
    const signers = trial % 2 === 0 ? [top] : [y];
    const depthOf = new Map([[authorityId(top), 1], [authorityId(mid), 1], [authorityId(y), 2]]);
    for (let n = 0; n < 70; n++) {
      const g = signers[rand(signers.length)];
      const gid = authorityId(g);
      const d = depthOf.get(gid);
      const action = n < 24 ? 0 : rand(10);
      if (action < 6 && d < 4) {
        const roles = g.role === 'admin'
          ? (n < 24 ? ['admin', 'admin', 'validator', 'issuer'] : ['admin', 'validator', 'issuer', 'participant', 'xmesh-seat'])
          : ['participant', 'xmesh-seat'];
        const s = add({ kind: 'grant', authorisedBy: gid, subject: { nodeId: nid(), key: pool[rand(pool.length)] }, role: roles[rand(roles.length)], sigs: sigOf(g.subject.key) });
        depthOf.set(authorityId(s), d + 1);
        if (DELEGATING_ROLES.has(s.role) && d + 1 < 4) signers.push(s);
      } else if (action < 8) {
        const targets = [...new Set(Array.from({ length: 1 + rand(3) }, () => authorityId(S[rand(S.length)])))];
        add({ kind: 'revoke', authorisedBy: gid, targets, sigs: sigOf(g.subject.key) });
      } else if (g.role === 'admin') {
        const targets = [...new Set(Array.from({ length: 1 + rand(5) }, () => authorityId(S[rand(S.length)])))];
        add({ kind: 'endorse', authorisedBy: gid, targets, sigs: sigOf(g.subject.key) });
      }
    }
    const r = resolveAuthority({ pin, statements: S, quota: Q, delegateQuota: DQ, verifySignature: stub });
    const below = (g) => r.inForce.filter((id) => r.chainOf(id).includes(authorityId(g)));
    const isDelegatingId = (id) => { const s = S.find((x) => authorityId(x) === id); return s.kind === 'grant' && DELEGATING_ROLES.has(s.role); };
    const b1 = below(top); const b2 = below(y);
    worst = { d1: Math.max(worst.d1, b1.length), d1Delegating: Math.max(worst.d1Delegating, b1.filter(isDelegatingId).length), d2: Math.max(worst.d2, b2.length) };
    assert.ok(b1.length <= Q * (1 + DQ + DQ * DQ), `bound below a depth-1 holder, trial ${trial}: ${b1.length}`);
    assert.ok(b1.filter(isDelegatingId).length <= DQ * (1 + DQ + DQ * DQ), `delegating bound below a depth-1 holder, trial ${trial}`);
    assert.ok(b2.length <= Q * (1 + DQ), `bound below a depth-2 holder, trial ${trial}: ${b2.length}`);
    const counts = new Map();
    for (const id of r.inForce) counts.set(r.keptBy.get(id), (counts.get(r.keptBy.get(id)) ?? 0) + 1);
    for (const [bucket, n] of counts) assert.ok(n <= (bucket === 'anchor' ? AUTHORITY_ANCHOR_QUOTA : Q), `no bucket keeps more than its quota, trial ${trial}`);
  }
  console.log(`  bound check: 160 random adversarial sets; worst below a depth-1 holder ${worst.d1}/${Q * (1 + DQ + DQ * DQ)} statements, ${worst.d1Delegating}/${DQ * (1 + DQ + DQ * DQ)} delegating; below a depth-2 holder ${worst.d2}/${Q * (1 + DQ)}`);
}

assert.equal(requireNextSequence('0', '0'), '1');
assert.throws(() => requireNextSequence('1', '0'), /unexpected sequence/, 'replay must be refused');
assert.throws(() => requireNextSequence('1', '2'), /unexpected sequence/, 'gap must be refused on ordered transport');

console.log('MMP v2.0 conformance vectors verified');
