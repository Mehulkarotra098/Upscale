// Admin authentication: scrypt password hashes, an HMAC-signed session cookie, login rate limiting,
// and first-run bootstrap of the owner account from ADMIN_EMAIL / ADMIN_PASSWORD.
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { SESSION_SECRET } from './config.js';
import { q, one } from './db.js';
import { cookies, clientIp } from './http.js';

const scrypt = promisify(crypto.scrypt);
const COOKIE = 'us_admin';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(pw), salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw, stored) {
  const [alg, n, saltB, keyB] = String(stored || '').split('$');
  if (alg !== 'scrypt') return false;
  const key = Buffer.from(keyB, 'base64');
  const got = await scrypt(String(pw), Buffer.from(saltB, 'base64'), key.length, { N: Number(n), r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return crypto.timingSafeEqual(key, got);
}

const b64u = (b) => Buffer.from(b).toString('base64url');
function secret() {
  if (!SESSION_SECRET || SESSION_SECRET.length < 24) throw Object.assign(new Error('SESSION_SECRET is missing or too short (use 32+ random characters)'), { code: 'NO_SECRET' });
  return SESSION_SECRET;
}

export function sign(payload) {
  const body = b64u(JSON.stringify(payload));
  const mac = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export function unsign(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const want = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (p.exp && p.exp < Date.now() / 1000) return null;
    return p;
  } catch { return null; }
}

export function sessionCookie(user, secure) {
  const token = sign({ uid: user.id, tv: user.token_version, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${secure ? '; Secure' : ''}`;
}

export const clearCookie = (secure) => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;

export async function currentUser(req) {
  const p = unsign(cookies(req)[COOKIE]);
  if (!p) return null;
  const u = await one('SELECT id, email, name, role, bio, job_title, avatar_media_id, token_version FROM users WHERE id = $1', [p.uid]);
  if (!u || u.token_version !== p.tv) return null;
  return u;
}

// 8 failed attempts per email+IP per 15 minutes, 30 per IP overall.
async function tooMany(email, ip) {
  const r = await one(
    `SELECT count(*) FILTER (WHERE key = $1) AS pair, count(*) FILTER (WHERE key LIKE $2) AS ip
       FROM login_attempts WHERE at > now() - interval '15 minutes' AND (key = $1 OR key LIKE $2)`,
    [`${email}|${ip}`, `%|${ip}`]);
  return Number(r.pair) >= 8 || Number(r.ip) >= 30;
}

export async function login(req, email, password) {
  email = String(email || '').trim().toLowerCase();
  const ip = clientIp(req);
  if (await tooMany(email, ip)) return { error: 'Too many attempts. Wait 15 minutes and try again.', status: 429 };
  let user = await one('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) {
    // First run: no users yet → the env-configured owner can sign in and is created.
    const count = Number((await one('SELECT count(*) AS n FROM users')).n);
    const envEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPw = String(process.env.ADMIN_PASSWORD || '');
    if (count === 0 && envEmail && envPw && email === envEmail && password === envPw) {
      user = await one(`INSERT INTO users (email, name, password_hash, role, job_title) VALUES ($1, $2, $3, 'owner', 'Founder, U Scale') RETURNING *`,
        [envEmail, process.env.ADMIN_NAME || 'Mehul Karotra', await hashPassword(envPw)]);
    }
  } else if (!(await verifyPassword(password, user.password_hash))) {
    user = null;
  }
  if (!user) {
    await q('INSERT INTO login_attempts (key) VALUES ($1)', [`${email}|${ip}`]);
    await q(`DELETE FROM login_attempts WHERE at < now() - interval '1 day'`);
    return { error: 'Wrong email or password.', status: 401 };
  }
  await q('DELETE FROM login_attempts WHERE key = $1', [`${email}|${ip}`]);
  return { user };
}
