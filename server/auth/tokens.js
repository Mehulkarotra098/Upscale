// Compact signed tokens: base64url(JSON payload) + "." + HMAC-SHA256. Used for the session cookie and preview links.
import crypto from 'node:crypto';
import { SESSION_SECRET } from '../config.js';
import { unavailable } from '../lib/errors.js';

function key() {
  if (SESSION_SECRET.length < 24)
    throw unavailable('SESSION_SECRET is missing or too short in Vercel (use 32+ random characters).', 'NO_SECRET');
  return SESSION_SECRET;
}

const mac = (body) => crypto.createHmac('sha256', key()).update(body).digest('base64url');

/** @param {object} payload include `exp` (unix seconds) for an expiring token */
export function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${mac(body)}`;
}

/** Payload if the signature is valid and the token hasn't expired, otherwise null. Never throws on bad input. */
export function verify(token) {
  const [body, sig, extra] = String(token || '').split('.');
  if (!body || !sig || extra !== undefined) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export const expiresIn = (seconds) => Math.floor(Date.now() / 1000) + seconds;
