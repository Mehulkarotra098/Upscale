// Password hashing with scrypt (Node built-in, memory-hard). Stored as scrypt$N$salt$key (base64).
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const N = 16384;
const KEY_LEN = 64;
const opts = (n) => ({ N: n, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(password), salt, KEY_LEN, opts(N));
  return `scrypt$${N}$${salt.toString('base64')}$${key.toString('base64')}`;
}

/** Constant-time check. Malformed or missing hashes simply fail. */
export async function verifyPassword(password, stored) {
  const [alg, n, saltB64, keyB64] = String(stored || '').split('$');
  const cost = Number(n);
  if (alg !== 'scrypt' || !saltB64 || !keyB64 || !Number.isInteger(cost) || cost < 1024 || cost > 1 << 20) return false;
  const key = Buffer.from(keyB64, 'base64');
  if (key.length < 32) return false;
  const got = await scrypt(String(password ?? ''), Buffer.from(saltB64, 'base64'), key.length, opts(cost));
  return crypto.timingSafeEqual(key, got);
}

// Used when the email is unknown, so a failed sign-in takes the same time whether or not the account exists.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));
export async function burnPasswordCheck(password) {
  await verifyPassword(password, await DUMMY_HASH);
  return false;
}
