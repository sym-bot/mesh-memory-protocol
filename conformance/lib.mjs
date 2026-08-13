import crypto from 'node:crypto';

export const PROTOCOL_VERSION = '2.0';
export const SIGNATURE_SUITE = 'mmp-sig-v2.1';
export const ADDRESS_SCHEME = 'mmp-cmb-merkle-v2';
export const CAT7 = ['focus', 'issue', 'intent', 'motivation', 'commitment', 'perspective', 'mood'];

export function lp(value) {
  const bytes = Buffer.from(String(value), 'utf8');
  return Buffer.concat([Buffer.from(`${bytes.length}:`, 'ascii'), bytes]);
}

export function decimal(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`expected non-negative safe integer, got ${value}`);
  }
  return String(value);
}

export function sortedBytewise(values) {
  return [...values].map(String).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
}

export function framedList(values) {
  const items = sortedBytewise(new Set(values));
  return Buffer.concat([lp(decimal(items.length)), ...items.map(lp)]);
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest();
}

export function sha256Hex(value) {
  return sha256(value).toString('hex');
}

export function categoryKeyV1(name, text) {
  return sha256Hex(Buffer.concat([
    Buffer.from('mmp-cmb-v1\n', 'utf8'),
    lp(name),
    lp(String(text ?? '').normalize('NFC')),
  ]));
}

export function categoryParentsCommitment(categories) {
  const parts = [Buffer.from('mmp-fp-v1\n', 'utf8')];
  for (const name of CAT7) {
    const refs = sortedBytewise(categories?.[name]?.meta?.parents ?? []);
    parts.push(lp(name), lp(decimal(refs.length)), ...refs.map(lp));
  }
  return sha256Hex(Buffer.concat(parts));
}

export function blockKeyV2(categories) {
  let level = CAT7.map((name) => {
    const digest = Buffer.from(categoryKeyV1(name, categories?.[name]?.text ?? ''), 'hex');
    return sha256(Buffer.concat([Buffer.from([0]), digest]));
  });
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(i + 1 < level.length
        ? sha256(Buffer.concat([Buffer.from([1]), level[i], level[i + 1]]))
        : level[i]);
    }
    level = next;
  }
  return `cmb-${level[0].toString('hex')}`;
}

export function applicationBytes(application) {
  if (application == null) return null;
  if (application.encoding !== 'base64url') throw new Error('application encoding must be base64url');
  if (typeof application.data !== 'string' || application.data.includes('=')) {
    throw new Error('application data must be unpadded base64url');
  }
  const bytes = Buffer.from(application.data, 'base64url');
  if (bytes.toString('base64url') !== application.data) throw new Error('application data is not canonical base64url');
  if (bytes.length !== application.byteLength) throw new Error('application byteLength mismatch');
  if (bytes.length > 524288) throw new Error('application exceeds 524288-byte limit');
  if (`sha256-${sha256Hex(bytes)}` !== application.digest) throw new Error('application digest mismatch');
  return bytes;
}

export function applicationCommitmentV1(application) {
  const domain = Buffer.from('mmp-app-v1\n', 'utf8');
  if (application == null) return sha256Hex(Buffer.concat([domain, lp('0')]));
  applicationBytes(application);
  if (!/^[a-z0-9][a-z0-9!#$&^_.+\/-]*$/.test(application.mediaType) || application.mediaType.includes(';')) {
    throw new Error('application mediaType must be canonical lowercase ASCII without parameters');
  }
  const schema = String(application.schema ?? '').normalize('NFC');
  return sha256Hex(Buffer.concat([
    domain,
    lp('1'),
    lp(application.mediaType),
    lp(schema),
    lp('base64url'),
    lp(decimal(application.byteLength)),
    lp(application.digest),
  ]));
}

export function signingPayloadV2_1(record) {
  const m = record?.metadata;
  if (!m) throw new Error('metadata is required');
  if (m.signatureSuite !== SIGNATURE_SUITE) throw new Error(`signatureSuite must be ${SIGNATURE_SUITE}`);
  if (m.addressScheme !== ADDRESS_SCHEME) throw new Error(`addressScheme must be ${ADDRESS_SCHEME}`);
  const parents = sortedBytewise(m.lineage?.parents ?? []);
  return Buffer.concat([
    Buffer.from('mmp-sig-v2.1\n', 'utf8'),
    lp(PROTOCOL_VERSION),
    lp(ADDRESS_SCHEME),
    lp(m.key),
    lp(m.createdByNodeId),
    lp(String(m.createdBy).normalize('NFC')),
    lp(decimal(m.createdTimestamp)),
    lp(String(m.room).normalize('NFC')),
    lp(m.to ?? ''),
    lp(decimal(parents.length)),
    ...parents.map(lp),
    lp(categoryParentsCommitment(record.categories)),
    lp(applicationCommitmentV1(m.application ?? null)),
  ]);
}

export function assertionId(record) {
  return `asrt-${sha256Hex(signingPayloadV2_1(record))}`;
}

export function handshakeTranscriptV2(h) {
  if (h.protocolVersion !== PROTOCOL_VERSION) throw new Error('protocolVersion must be 2.0');
  return Buffer.concat([
    Buffer.from('mmp-handshake-transcript-v2\n', 'utf8'),
    lp(PROTOCOL_VERSION),
    lp(String(h.room).normalize('NFC')),
    lp(h.client.nonce),
    lp(h.server.nonce),
    lp(h.client.nodeId),
    lp(h.client.identityPublicKey),
    lp(h.client.e2ePublicKey),
    lp(String(h.client.name).normalize('NFC')),
    lp(h.client.implementation.name),
    lp(h.client.implementation.version),
    framedList(h.client.extensions),
    lp(h.server.nodeId),
    lp(h.server.identityPublicKey),
    lp(h.server.e2ePublicKey),
    lp(String(h.server.name).normalize('NFC')),
    lp(h.server.implementation.name),
    lp(h.server.implementation.version),
    framedList(h.server.extensions),
    framedList(h.selectedExtensions),
  ]);
}

export function handshakeProofV2(role, transcriptHash) {
  if (role !== 'client' && role !== 'server') throw new Error('handshake role must be client or server');
  return Buffer.concat([
    Buffer.from('mmp-handshake-proof-v2\n', 'utf8'),
    lp(role),
    lp(Buffer.from(transcriptHash).toString('hex')),
  ]);
}

export function hkdf(sharedSecret, salt, info) {
  return Buffer.from(crypto.hkdfSync('sha256', sharedSecret, salt, Buffer.from(info, 'utf8'), 32));
}

export function keyConfirmation(role, finishedKey, transcriptHash) {
  const payload = Buffer.concat([
    Buffer.from('mmp-key-confirm-v2\n', 'utf8'),
    lp(role),
    lp(Buffer.from(transcriptHash).toString('hex')),
  ]);
  return crypto.createHmac('sha256', finishedKey).update(payload).digest();
}

export function nonceFromSequence(sequence) {
  const n = BigInt(sequence);
  if (n < 0n || n >= (1n << 96n)) throw new RangeError('sequence outside unsigned 96-bit range');
  const nonce = Buffer.alloc(12);
  nonce.writeUInt32BE(Number((n >> 64n) & 0xffffffffn), 0);
  nonce.writeBigUInt64BE(n & 0xffffffffffffffffn, 4);
  return nonce;
}

export function requireNextSequence(expected, received) {
  const e = BigInt(expected);
  const r = BigInt(received);
  if (r !== e) throw new Error(`unexpected sequence: expected ${e}, received ${r}`);
  return (e + 1n).toString();
}

export function aeadAADV2({ sessionId, direction, sequence, metadata }) {
  if (direction !== 'client-to-server' && direction !== 'server-to-client') throw new Error('invalid direction');
  return Buffer.concat([
    Buffer.from('mmp-aead-aad-v2\n', 'utf8'),
    lp(PROTOCOL_VERSION),
    lp(sessionId),
    lp(direction),
    lp(String(sequence)),
    lp(metadata.key),
    lp(metadata.assertionId),
    lp(metadata.createdByNodeId),
    lp(String(metadata.room).normalize('NFC')),
    lp(metadata.to ?? ''),
  ]);
}

export function encryptChaChaPoly({ key, sequence, plaintext, aad }) {
  const nonce = nonceFromSequence(sequence);
  const cipher = crypto.createCipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  cipher.setAAD(aad, { plaintextLength: plaintext.length });
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([ciphertext, cipher.getAuthTag()]);
}

export function decryptChaChaPoly({ key, sequence, sealed, aad }) {
  const nonce = nonceFromSequence(sequence);
  const ciphertext = sealed.subarray(0, -16);
  const tag = sealed.subarray(-16);
  const decipher = crypto.createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  decipher.setAAD(aad, { plaintextLength: ciphertext.length });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

const ED25519_PRIVATE_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const ED25519_PUBLIC_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const X25519_PRIVATE_PREFIX = Buffer.from('302e020100300506032b656e04220420', 'hex');
const X25519_PUBLIC_PREFIX = Buffer.from('302a300506032b656e032100', 'hex');

export function ed25519PrivateKey(raw) {
  return crypto.createPrivateKey({ key: Buffer.concat([ED25519_PRIVATE_PREFIX, raw]), format: 'der', type: 'pkcs8' });
}

export function ed25519PublicKey(raw) {
  return crypto.createPublicKey({ key: Buffer.concat([ED25519_PUBLIC_PREFIX, raw]), format: 'der', type: 'spki' });
}

export function x25519PrivateKey(raw) {
  return crypto.createPrivateKey({ key: Buffer.concat([X25519_PRIVATE_PREFIX, raw]), format: 'der', type: 'pkcs8' });
}

export function x25519PublicKey(raw) {
  return crypto.createPublicKey({ key: Buffer.concat([X25519_PUBLIC_PREFIX, raw]), format: 'der', type: 'spki' });
}

export function rawPublicKey(keyObject) {
  return keyObject.export({ format: 'der', type: 'spki' }).subarray(-32);
}
