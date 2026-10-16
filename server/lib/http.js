// Framework-free request/response helpers. They work with Vercel's Node runtime and with dev/server.mjs.
import { LIMITS } from '../config.js';
import { badRequest, tooLarge } from './errors.js';

export const CACHE = Object.freeze({
  none: 'no-store',
  page: 'public, max-age=0, s-maxage=120, stale-while-revalidate=86400',
  missing: 'public, max-age=0, s-maxage=60',
  feed: 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
  immutable: 'public, max-age=31536000, immutable',
  redirect: 'public, max-age=3600, s-maxage=86400',
});

/** Query string as a plain object (last value wins). */
export function query(req) {
  return Object.fromEntries(new URL(req.url, 'http://localhost').searchParams.entries());
}

/** Parse a JSON body, enforcing the size limit. Vercel pre-parses `req.body`; the dev server passes the raw stream. */
export async function readJSON(req, limit = LIMITS.bodyBytes) {
  let raw;
  if (req.body != null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    if (Buffer.byteLength(raw) > limit) throw tooLarge();
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > limit) throw tooLarge();
      chunks.push(chunk);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  }
  if (!raw) return {};
  try {
    const body = JSON.parse(raw);
    if (body === null || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
    return body;
  } catch {
    throw badRequest('Request body must be a JSON object');
  }
}

export function send(res, status, body = '', headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(body);
}

export const json = (res, status, data, headers = {}) =>
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': CACHE.none, ...headers });

export const html = (res, status, body, cache = CACHE.page, headers = {}) =>
  send(res, status, body, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cache, ...headers });

export const text = (res, status, body, type, cache, headers = {}) =>
  send(res, status, body, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': cache, ...headers });

export const redirect = (res, location, status = 301) =>
  send(res, status, '', { Location: location, 'Cache-Control': status === 301 ? CACHE.redirect : CACHE.none });

export function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i <= 0) continue;
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      // malformed cookie value from some other site script: ignore it
    }
  }
  return out;
}

/**
 * Client IP for rate limiting. On Vercel `x-real-ip` is set by the platform and cannot be supplied by the client;
 * `x-forwarded-for` can carry client-chosen values in front of the real one, so it is only a local fallback.
 */
export function clientIp(req) {
  const h = req.headers;
  const ip = h['x-real-ip'] || h['x-vercel-forwarded-for'] || (process.env.VERCEL ? '' : String(h['x-forwarded-for'] || '').split(',')[0]);
  return String(ip || req.socket?.remoteAddress || 'unknown').trim();
}

/** True when the request arrived over HTTPS (cookies get the Secure flag). */
export const isHttps = (req) =>
  String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim() === 'https';
