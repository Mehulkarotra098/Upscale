// Admin sessions: signed HttpOnly cookie → user. Sign-in with rate limiting and first-run owner bootstrap.
import { BOOTSTRAP_ADMIN, BRAND, LIMITS } from '../config.js';
import { tooMany, unauthorized } from '../lib/errors.js';
import { cookies, clientIp, isHttps } from '../lib/http.js';
import * as users from '../repos/users.js';
import { burnPasswordCheck, hashPassword, verifyPassword } from './passwords.js';
import { expiresIn, sign, verify } from './tokens.js';

const COOKIE = 'us_admin';
const MAX_AGE = LIMITS.sessionDays * 24 * 60 * 60;

/** Set-Cookie value for a signed-in user. Bumping users.token_version invalidates every earlier cookie. */
export function sessionCookie(req, user) {
  const token = sign({ uid: user.id, tv: user.token_version, exp: expiresIn(MAX_AGE) });
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${isHttps(req) ? '; Secure' : ''}`;
}

export const clearedCookie = (req) => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isHttps(req) ? '; Secure' : ''}`;

/** The signed-in user (public fields) or null. */
export async function currentUser(req) {
  const claims = verify(cookies(req)[COOKIE]);
  if (!claims?.uid) return null;
  const user = await users.byId(claims.uid);
  return user && user.token_version === claims.tv ? user : null;
}

/**
 * Check credentials. Failures are rate limited per account+IP and per IP. While no users exist, the
 * ADMIN_EMAIL / ADMIN_PASSWORD pair from the environment creates the owner account.
 */
export async function signIn(req, rawEmail, password) {
  const email = String(rawEmail || '')
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const ip = clientIp(req);
  // Record the attempt as a failure first and count afterwards (clearing it on success): parallel guesses each
  // see the others, so a burst can't slip past the limit before any failure is written.
  await users.recordLoginFailure(email, ip);
  const recent = await users.recentLoginFailures(email, ip, LIMITS.loginWindowMinutes);
  if (recent.account > LIMITS.loginFailuresPerAccount || recent.ip > LIMITS.loginFailuresPerIp) {
    throw tooMany(`Too many attempts. Wait ${LIMITS.loginWindowMinutes} minutes and try again.`);
  }

  const user = await checkCredentials(email, password);
  if (!user) throw unauthorized('Wrong email or password.');
  await users.clearLoginFailures(email, ip);
  return users.publicFields(user);
}

async function checkCredentials(email, password) {
  const stored = await users.withHashByEmail(email);
  if (stored) return (await verifyPassword(password, stored.password_hash)) ? stored : null;
  if (!(await bootstrapAllowed(email, password))) return burnPasswordCheck(password);
  try {
    return await users.create({
      email,
      name: BOOTSTRAP_ADMIN.name,
      role: 'owner',
      jobTitle: BRAND.authorTitle,
      passwordHash: await hashPassword(password),
    });
  } catch (err) {
    if (err?.code !== '23505') throw err;
    return checkCredentials(email, password); // a parallel first sign-in created the owner a moment ago
  }
}

async function bootstrapAllowed(email, password) {
  const b = BOOTSTRAP_ADMIN;
  if (!b.email || !b.password || email !== b.email || String(password) !== b.password) return false;
  return (await users.count()) === 0;
}
