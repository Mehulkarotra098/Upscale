// Small, framework-free request/response helpers (work on Vercel Node functions and on the local dev server).

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function urlOf(req) {
  return new URL(req.url, 'http://localhost');
}

export function query(req) {
  return Object.fromEntries(urlOf(req).searchParams.entries());
}

export async function readJSON(req, limit = 6 * 1024 * 1024) {
  // Vercel exposes a lazily-parsed req.body; the local server gives the raw stream.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
    if (Buffer.isBuffer(req.body)) return req.body.length ? JSON.parse(req.body.toString('utf8')) : {};
    return req.body;
  }
  const chunks = []; let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error('Payload too large'), { status: 413 });
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(body);
}

export function json(res, status, data, headers = {}) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
}

export function html(res, status, body, cache = 'public, max-age=0, s-maxage=120, stale-while-revalidate=86400', headers = {}) {
  send(res, status, body, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cache, ...headers });
}

export function redirect(res, to, status = 301) {
  send(res, status, '', { Location: to, 'Cache-Control': status === 301 ? 'public, max-age=3600, s-maxage=86400' : 'no-store' });
}

export function cookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim() || 'unknown';
}

export function slugify(s, max = 80) {
  return String(s || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, max).replace(/-+$/g, '');
}

export function fmtDate(d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts });
}

export const isoDate = (d) => new Date(d).toISOString();
