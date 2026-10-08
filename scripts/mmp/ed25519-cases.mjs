// Ed25519 edge cases for the §18.3.2 verification rule.
//
// SPECCHECK: the twelve cases of Chalkias, Garillot and Nikolaenko, "Taming the many EdDSAs"
// (SSR 2020), copied byte for byte from github.com/novifinancial/ed25519-speccheck, cases.json at
// commit 65519336fda78a3d016e947df6d82848aca0c9da (Apache-2.0). [index, message, public key, signature], hex.
// The constructed cases below add what those twelve do not isolate: the identity key, a mixed-order
// key, an identity R under a prime-order key, a mixed-order R, an unreduced S, and an honest case.
import crypto from 'node:crypto';
import { ED25519_L, ed25519Points as P, ed25519PrivateKey, rawPublicKey } from './lib.mjs';

export const SPECCHECK_SOURCE = 'https://github.com/novifinancial/ed25519-speccheck/blob/65519336fda78a3d016e947df6d82848aca0c9da/cases.json';
export const SPECCHECK = [
  [0, '8c93255d71dcab10e8f379c26200f3c7bd5f09d9bc3068d3ef4edeb4853022b6', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a0000000000000000000000000000000000000000000000000000000000000000'],
  [1, '9bd9f44f4dcc75bd531b56b2cd280b0bb38fc1cd6d1230e14861d861de092e79', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa', 'f7badec5b8abeaf699583992219b7b223f1df3fbbea919844e3f7c554a43dd43a5bb704786be79fc476f91d3f3f89b03984d8068dcf1bb7dfc6637b45450ac04'],
  [2, 'aebf3f2601a0c8c5d39cc7d8911642f740b78168218da8471772b35f9d35b9ab', 'f7badec5b8abeaf699583992219b7b223f1df3fbbea919844e3f7c554a43dd43', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa8c4bd45aecaca5b24fb97bc10ac27ac8751a7dfe1baff8b953ec9f5833ca260e'],
  [3, '9bd9f44f4dcc75bd531b56b2cd280b0bb38fc1cd6d1230e14861d861de092e79', 'cdb267ce40c5cd45306fa5d2f29731459387dbf9eb933b7bd5aed9a765b88d4d', '9046a64750444938de19f227bb80485e92b83fdb4b6506c160484c016cc1852f87909e14428a7a1d62e9f22f3d3ad7802db02eb2e688b6c52fcd6648a98bd009'],
  [4, 'e47d62c63f830dc7a6851a0b1f33ae4bb2f507fb6cffec4011eaccd55b53f56c', 'cdb267ce40c5cd45306fa5d2f29731459387dbf9eb933b7bd5aed9a765b88d4d', '160a1cb0dc9c0258cd0a7d23e94d8fa878bcb1925f2c64246b2dee1796bed5125ec6bc982a269b723e0668e540911a9a6a58921d6925e434ab10aa7940551a09'],
  [5, 'e47d62c63f830dc7a6851a0b1f33ae4bb2f507fb6cffec4011eaccd55b53f56c', 'cdb267ce40c5cd45306fa5d2f29731459387dbf9eb933b7bd5aed9a765b88d4d', '21122a84e0b5fca4052f5b1235c80a537878b38f3142356b2c2384ebad4668b7e40bc836dac0f71076f9abe3a53f9c03c1ceeeddb658d0030494ace586687405'],
  [6, '85e241a07d148b41e47d62c63f830dc7a6851a0b1f33ae4bb2f507fb6cffec40', '442aad9f089ad9e14647b1ef9099a1ff4798d78589e66f28eca69c11f582a623', 'e96f66be976d82e60150baecff9906684aebb1ef181f67a7189ac78ea23b6c0e547f7690a0e2ddcd04d87dbc3490dc19b3b3052f7ff0538cb68afb369ba3a514'],
  [7, '85e241a07d148b41e47d62c63f830dc7a6851a0b1f33ae4bb2f507fb6cffec40', '442aad9f089ad9e14647b1ef9099a1ff4798d78589e66f28eca69c11f582a623', '8ce5b96c8f26d0ab6c47958c9e68b937104cd36e13c33566acd2fe8d38aa19427e71f98a473474f2f13f06f97c20d58cc3f54b8bd0d272f42b695dd7e89a8c22'],
  [8, '9bedc267423725d473888631ebf45988bad3db83851ee85c85e241a07d148b41', 'f7badec5b8abeaf699583992219b7b223f1df3fbbea919844e3f7c554a43dd43', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03be9678ac102edcd92b0210bb34d7428d12ffc5df5f37e359941266a4e35f0f'],
  [9, '9bedc267423725d473888631ebf45988bad3db83851ee85c85e241a07d148b41', 'f7badec5b8abeaf699583992219b7b223f1df3fbbea919844e3f7c554a43dd43', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffca8c5b64cd208982aa38d4936621a4775aa233aa0505711d8fdcfdaa943d4908'],
  [10, 'e96b7021eb39c1a163b6da4e3093dcd3f21387da4cc4572be588fafae23c155b', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'a9d55260f765261eb9b84e106f665e00b867287a761990d7135963ee0a7d59dca5bb704786be79fc476f91d3f3f89b03984d8068dcf1bb7dfc6637b45450ac04'],
  [11, '39a591f5321bbe07fd5a23dc2f39d025d74526615746727ceefd6e82ae65c06f', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'a9d55260f765261eb9b84e106f665e00b867287a761990d7135963ee0a7d59dca5bb704786be79fc476f91d3f3f89b03984d8068dcf1bb7dfc6637b45450ac04'],
];

const h = (b) => Buffer.from(b).toString('hex');
const scalarOf = (label) => P.scalar(crypto.createHash('sha512').update(`mmp-ed25519-edge ${label}`).digest());
// A signature (R, S) by scalar a for public key bytes Abytes, with nonce point Rpt and nonce scalar r.
const signWith = (message, Abytes, Rpt, r, a) => {
  const R = P.encode(Rpt);
  const k = P.challenge(R, Abytes, message);
  const S = (r + k * a) % ED25519_L;
  return { R, S, k };
};

export function constructedCases() {
  const out = [];
  const msg = (label) => Buffer.from(`mmp authority edge case: ${label}`, 'utf8');
  // An honest signature by Node's signer over a fixed seed: the control case.
  {
    const seed = crypto.createHash('sha256').update('mmp-ed25519-edge honest').digest();
    const priv = ed25519PrivateKey(seed);
    const A = rawPublicKey(crypto.createPublicKey(priv));
    const m = msg('honest');
    out.push({ label: 'honest key and signature', message: h(m), publicKey: h(A), signature: h(crypto.sign(null, m, priv)) });
    // The same signature with S + L: the equation still holds for an unreduced S.
    const sig = crypto.sign(null, m, priv);
    const S = P.scalar(sig.subarray(32)) + ED25519_L;
    out.push({ label: 'honest signature with S + L (unreduced S)', message: h(m), publicKey: h(A), signature: h(Buffer.concat([sig.subarray(0, 32), P.le32(S)])) });
  }
  // The identity as public key, R = identity, S = 0: holds for every message under the cofactorless equation.
  {
    const id = P.encode(P.identity);
    for (const label of ['identity key, R = identity, S = 0, message one', 'identity key, R = identity, S = 0, message two']) {
      out.push({ label, message: h(msg(label)), publicKey: h(id), signature: h(Buffer.concat([id, Buffer.alloc(32)])) });
    }
  }
  // A mixed-order key A = aB + T8 with an honest-looking S = r + k*a: the cofactored equation holds
  // always, the cofactorless one only when 8 divides k. One case of each.
  {
    const a = scalarOf('mixed key');
    const Abytes = P.encode(P.add(P.mul(P.base, a), P.torsion8));
    let found = { zero: false, nonzero: false };
    for (let i = 0; i < 256 && !(found.zero && found.nonzero); i++) {
      const m = msg(`mixed-order key ${i}`);
      const r = scalarOf(`mixed key nonce ${i}`);
      const { R, S, k } = signWith(m, Abytes, P.mul(P.base, r), r, a);
      const kind = k % 8n === 0n ? 'zero' : 'nonzero';
      if (found[kind]) continue;
      found[kind] = true;
      out.push({ label: `mixed-order key, S = r + k*a, k mod 8 ${kind === 'zero' ? '= 0' : '!= 0'}`, message: h(m), publicKey: h(Abytes), signature: h(Buffer.concat([R, P.le32(S)])) });
    }
  }
  // A prime-order key with R = identity and S = k*a: both equations hold; the rule rejects R.
  {
    const a = scalarOf('identity R key');
    const Abytes = P.encode(P.mul(P.base, a));
    const m = msg('identity R');
    const { R, S } = signWith(m, Abytes, P.identity, 0n, a);
    out.push({ label: 'prime-order key, R = identity, S = k*a', message: h(m), publicKey: h(Abytes), signature: h(Buffer.concat([R, P.le32(S)])) });
  }
  // A prime-order key with a mixed-order R = rB + T8 and S = r + k*a: cofactored holds, cofactorless fails.
  {
    const a = scalarOf('mixed R key');
    const Abytes = P.encode(P.mul(P.base, a));
    const m = msg('mixed-order R');
    const r = scalarOf('mixed R nonce');
    const { R, S } = signWith(m, Abytes, P.add(P.mul(P.base, r), P.torsion8), r, a);
    out.push({ label: 'prime-order key, mixed-order R = rB + T8, S = r + k*a', message: h(m), publicKey: h(Abytes), signature: h(Buffer.concat([R, P.le32(S)])) });
  }
  // A prime-order key with a pure small-order R (the point of order 8, then the point of order 2)
  // and S = k*a: the cofactored equation holds, the cofactorless one fails; the rule rejects R.
  for (const [label, Rpt] of [['a point of order 8', P.torsion8], ['the point of order 2', P.mul(P.torsion8, 4n)]]) {
    const a = scalarOf(`small-order R key ${label}`);
    const Abytes = P.encode(P.mul(P.base, a));
    const m = msg(`small-order R ${label}`);
    const R = P.encode(Rpt);
    const k = P.challenge(R, Abytes, m);
    out.push({ label: `prime-order key, R = ${label}, S = k*a`, message: h(m), publicKey: h(Abytes), signature: h(Buffer.concat([R, P.le32((k * a) % ED25519_L)])) });
  }
  // A prime-order key with R = a non-canonical encoding of the identity (y = p + 1) and S = k*a:
  // a library that reduces y accepts it; the rule rejects R's encoding.
  {
    const a = scalarOf('noncanonical R key');
    const Abytes = P.encode(P.mul(P.base, a));
    const m = msg('non-canonical R');
    const R = Buffer.concat([Buffer.from([0xee]), Buffer.alloc(30, 0xff), Buffer.from([0x7f])]);
    const k = P.challenge(R, Abytes, m);
    out.push({ label: 'prime-order key, R = non-canonical identity (y = p + 1), S = k*a', message: h(m), publicKey: h(Abytes), signature: h(Buffer.concat([R, P.le32((k * a) % ED25519_L)])) });
  }
  return out;
}

export function allEdgeCases() {
  return [
    ...SPECCHECK.map(([i, message, publicKey, signature]) => ({ label: `speccheck case ${i}`, message, publicKey, signature })),
    ...constructedCases(),
  ];
}
