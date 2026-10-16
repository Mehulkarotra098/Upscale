// Shaping untrusted admin input into clean values. Each helper returns a safe value or throws a 400 with a message
// the admin UI can show as is.
import { badRequest } from '../lib/errors.js';
import { clip } from '../lib/text.js';
import { toDbId } from '../lib/ids.js';

export const text = clip;

/** Positive database id (Postgres INT range), or null. */
export const id = toDbId;

/** Positive integer id, or a 400. */
export function requireId(value, what = 'item') {
  const n = id(value);
  if (!n) throw badRequest(`Missing or invalid ${what} id`);
  return n;
}

export const bool = (value) => value === true || value === 'true' || value === 1 || value === '1';

export const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

export function int(value, { min = -2147483648, max = 2147483647, fallback = 0 } = {}) {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function email(value) {
  const e = clip(value, 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw badRequest('Enter a valid email');
  return e;
}

export function required(value, max, message) {
  const t = clip(value, max);
  if (!t) throw badRequest(message);
  return t;
}

export function password(value, min) {
  const p = String(value ?? '');
  if (p.length < min) throw badRequest(`Password must be at least ${min} characters`);
  if (p.length > 200) throw badRequest('Password is too long');
  return p;
}

/** Empty, or an https:// URL. */
export function httpsUrl(value, max = 300) {
  const u = clip(value, max);
  if (!u) return '';
  try {
    if (new URL(u).protocol === 'https:') return u;
  } catch {
    // fall through
  }
  throw badRequest('URL must start with https://');
}

/** Valid date or null. */
export function date(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Unique, lower-cased, non-empty strings. */
export function tags(value, { max = 15, len = 40 } = {}) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => clip(t, len).toLowerCase()).filter(Boolean))].slice(0, max);
}

export function faq(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 20)
    .map((f) => ({ q: clip(f?.q, 300), a: clip(f?.a, 2000) }))
    .filter((f) => f.q && f.a);
}
