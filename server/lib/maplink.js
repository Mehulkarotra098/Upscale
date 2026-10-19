// Turns any Google Maps link for a business into its Google Place ID, so the review tool can build a direct
// "write a review" link for people who don't manage the Business Profile.
//
// Full Maps URLs carry a feature id like 0x3be7d1c73a0d5cad:0xc70a25a7209c733c. A "ChIJ…" Place ID is that same pair
// of 64-bit numbers wrapped in a tiny protobuf and base64url-encoded, so the conversion needs no API key.
// Short share links (maps.app.goo.gl/…) are expanded server-side by following redirects, only ever to Google hosts.

const SHORT_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl', 'g.co', 'share.google', 'g.page', 'www.g.page']);
const GOOGLE_HOST = /(^|\.)(google\.[a-z]{2,3}(\.[a-z]{2})?|goo\.gl|g\.co|g\.page|share\.google)$/i;
const FID = /0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16}/i;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

/** "0x…:0x…" feature id found anywhere in a string (raw or URL-encoded), lower-cased, or null. */
export function featureId(s) {
  const str = String(s || '');
  const m = str.match(FID) || safeDecode(str).match(FID);
  return m ? m[0].toLowerCase() : null;
}

/** Feature id → "ChIJ…" Place ID. */
export function placeIdFromFeature(fid) {
  const parts = String(fid || '')
    .toLowerCase()
    .split(':');
  if (parts.length !== 2 || !parts.every((p) => /^0x[0-9a-f]{1,16}$/.test(p))) return null;
  const buf = Buffer.alloc(20); // 0a 12 | 09 <8 bytes> | 11 <8 bytes>
  buf.set([0x0a, 0x12, 0x09], 0);
  buf.writeBigUInt64LE(BigInt(parts[0]), 3);
  buf[11] = 0x11;
  buf.writeBigUInt64LE(BigInt(parts[1]), 12);
  return buf.toString('base64url');
}

/** Business name from a /maps/place/<Name>/ URL, or ''. */
export function placeName(url) {
  const m = String(url || '').match(/\/maps\/place\/([^/@?#]+)/);
  if (!m) return '';
  return safeDecode(m[1].replace(/\+/g, ' ')).trim().slice(0, 80);
}

export const reviewUrl = (placeId) => `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Is this a short Google link we're willing to expand? */
export function isShortLink(raw) {
  let u;
  try {
    u = new URL(String(raw).trim());
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const host = u.hostname.toLowerCase();
  if (!SHORT_HOSTS.has(host)) return false;
  if (host === 'goo.gl') return u.pathname.startsWith('/maps');
  if (host.endsWith('g.page')) return !/\/review\/?$/.test(u.pathname);
  return u.pathname.length > 1;
}

/**
 * Follow a short Google link (max 5 hops, Google hosts only) until a feature id appears.
 * Returns { placeId, name, url } or null. Never throws.
 */
export async function resolveShortLink(raw, { fetchImpl = fetch, timeoutMs = 6000 } = {}) {
  if (!isShortLink(raw)) return null;
  let url = new URL(String(raw).trim());
  url.protocol = 'https:';
  let name = '';
  const deadline = Date.now() + timeoutMs;
  try {
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetchImpl(url.toString(), {
        redirect: 'manual',
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.8', Accept: 'text/html' },
        signal: AbortSignal.timeout(Math.max(500, deadline - Date.now())),
      });
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        const next = new URL(loc, url);
        if (!GOOGLE_HOST.test(next.hostname)) return null;
        name = placeName(next.toString()) || name;
        const fid = featureId(next.toString());
        if (fid) return { placeId: placeIdFromFeature(fid), name, url: next.toString() };
        url = next;
        continue;
      }
      if (!res.ok) return null;
      const body = (await res.text()).slice(0, 400_000);
      const fid = featureId(url.toString()) || featureId(body);
      if (!fid) return null;
      return { placeId: placeIdFromFeature(fid), name: name || placeName(url.toString()), url: url.toString() };
    }
  } catch {
    return null;
  }
  return null;
}
