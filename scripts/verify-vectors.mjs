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
} from '../conformance/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'conformance', 'v2', name), 'utf8'));
const b64u = (value) => Buffer.from(value, 'base64url');
const hex = (value) => Buffer.from(value).toString('hex');
const schema = (name) => JSON.parse(fs.readFileSync(path.join(root, 'schema', name), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const schemaNames = fs.readdirSync(path.join(root, 'schema')).filter((name) => name.endsWith('.schema.json')).sort();
for (const name of schemaNames) {
  ajv.addSchema(schema(name));
}
for (const name of schemaNames) {
  const id = schema(name).$id;
  assert.ok(ajv.getSchema(id), `${name}: schema must compile`);
}
const validateCMB = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/cmb.schema.json');
const validateHandshake = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/handshake.schema.json');
const validateEncrypted = ajv.getSchema('https://meshcognition.org/spec/mmp/schema/encrypted-cmb-frame.schema.json');

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

assert.equal(requireNextSequence('0', '0'), '1');
assert.throws(() => requireNextSequence('1', '0'), /unexpected sequence/, 'replay must be refused');
assert.throws(() => requireNextSequence('1', '2'), /unexpected sequence/, 'gap must be refused on ordered transport');

console.log('MMP v2.0 conformance vectors verified');
