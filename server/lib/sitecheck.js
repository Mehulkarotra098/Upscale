// Free website check for the Google profile checker: fetches a business's public home page once and reports the
// basics a local customer (and Google) look for. Nothing is stored. Speed scores come from Google PageSpeed
// Insights, which the visitor's browser calls directly (free, no key), so this function stays fast.
//
// Safety: only http(s) on ports 80/443; every hop's host must resolve to public IP addresses (no localhost,
// private ranges, link-local or metadata addresses); at most 4 redirects, 7 s and 1.5 MB.
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { parseDocument } from 'htmlparser2';
import { getElementsByTagName, getAttributeValue, textContent } from 'domutils';

const MAX_BYTES = 1_500_000;
const UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36 (compatible; UScaleSiteCheck/1.0; +https://uscale.in/tools)';
const LOCAL_TYPES =
  /LocalBusiness|Store|Restaurant|Cafe|Bakery|Shop|Salon|Clinic|Dentist|Physician|Hospital|Pharmacy|Hotel|Lodging|Gym|ExerciseGym|AutoRepair|Electrician|Plumber|ProfessionalService|LegalService|Attorney|Accounting|RealEstateAgent|TravelAgency|EducationalOrganization|School|BeautySalon|HairSalon|NailSalon|DaySpa|HealthClub|FoodEstablishment|BarOrPub|CafeOrCoffeeShop|Florist|JewelryStore|ClothingStore|ShoeStore|ElectronicsStore|FurnitureStore|HomeGoodsStore|HardwareStore|GroceryStore|BookStore|PetStore|SportingGoodsStore|MedicalBusiness|MedicalClinic|Optician|VeterinaryCare|ChildCare|Organization/;

/** Is this IP address one we must never fetch from (private, loopback, link-local, CGNAT, multicast, reserved)? */
export function isPrivateIp(ip) {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  if (v === 6) {
    const s = ip.toLowerCase();
    if (s === '::' || s === '::1') return true;
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(s) || s.startsWith('64:ff9b:') || s.startsWith('2001:db8');
  }
  return true;
}

/** Normalise user input to an https?:// URL on a standard port, or null. */
export function normaliseUrl(raw) {
  let s = String(raw || '').trim();
  if (!s || s.length > 300 || /\s/.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  const host = u.hostname.toLowerCase();
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal') || host === 'localhost') return null;
  if (isIP(host.replace(/^\[|\]$/g, ''))) return null; // a business website has a name, not a bare IP
  u.hash = '';
  return u;
}

async function assertPublic(host, lookup) {
  const addrs = await lookup(host, { all: true, verbatim: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('blocked');
}

/** Fetch the page, following redirects safely. Returns { url, status, html, ms, https }. */
async function fetchPage(start, { fetchImpl, lookup, timeoutMs }) {
  const t0 = Date.now();
  const deadline = t0 + timeoutMs;
  let url = start;
  for (let hop = 0; hop <= 4; hop++) {
    await assertPublic(url.hostname, lookup);
    const res = await fetchImpl(url.toString(), {
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en-IN,en;q=0.8' },
      signal: AbortSignal.timeout(Math.max(500, deadline - Date.now())),
    });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      const next = normaliseUrl(new URL(loc, url).toString());
      if (!next) throw new Error('blocked');
      url = next;
      continue;
    }
    const type = String(res.headers.get('content-type') || '');
    if (!/html|xml/i.test(type)) return { url, status: res.status, html: '', ms: Date.now() - t0, https: url.protocol === 'https:' };
    let html = '';
    if (res.body?.getReader) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        html += dec.decode(value, { stream: true });
        if (size > MAX_BYTES) {
          await reader.cancel().catch(() => {});
          break;
        }
      }
    } else html = (await res.text()).slice(0, MAX_BYTES);
    return { url, status: res.status, html, ms: Date.now() - t0, https: url.protocol === 'https:' };
  }
  throw new Error('too_many_redirects');
}

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** What a local customer and Google look for on the home page. Pure function (tested on its own). */
export function analyse(html, { finalUrl, https, ms, status, business = '' }) {
  const doc = parseDocument(html || '', { decodeEntities: true });
  const tags = (n) => getElementsByTagName(n, doc, true);
  const attr = (el, a) => getAttributeValue(el, a) || '';
  const metas = tags('meta');
  const meta = (name) => metas.find((m) => attr(m, 'name').toLowerCase() === name || attr(m, 'property').toLowerCase() === name);
  const title = textContent(tags('title')[0] || [])
    .trim()
    .replace(/\s+/g, ' ');
  const desc = attr(meta('description') || {}, 'content').trim();
  const viewport = Boolean(meta('viewport'));
  const h1 = tags('h1')
    .map((h) => textContent(h).trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const links = tags('a').map((a) => attr(a, 'href').trim());
  const iframes = tags('iframe').map((f) => attr(f, 'src'));
  const tel = links.some((h) => /^tel:/i.test(h));
  const wa = links.some((h) => /(wa\.me\/|api\.whatsapp\.com\/|whatsapp:\/\/|web\.whatsapp\.com\/send)/i.test(h));
  const map =
    iframes.some((s) => /google\.[a-z.]+\/maps|maps\.google\./i.test(s)) ||
    links.some((h) => /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page\/)/i.test(h));
  const ld = tags('script')
    .filter((s) => attr(s, 'type').toLowerCase() === 'application/ld+json')
    .map((s) => textContent(s))
    .join('\n');
  const localSchema = LOCAL_TYPES.test(ld) && /"(address|telephone|geo)"/.test(ld);
  const body = textContent(tags('body')[0] || doc).replace(/\s+/g, ' ');
  const phoneText = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b0\d{2,4}[\s-]?\d{6,8}\b/.test(body);
  const pin = /\b[1-9]\d{2}\s?\d{3}\b/.test(body);
  const imgs = tags('img');
  const noAlt = imgs.filter((i) => !('alt' in (i.attribs || {}))).length;
  const nameOk = business ? norm(title + ' ' + h1.join(' ') + ' ' + body.slice(0, 20000)).includes(norm(business)) : null;
  const checks = [
    { id: 'https', ok: Boolean(https), w: 2 },
    { id: 'mobile', ok: viewport, w: 3 },
    { id: 'title', ok: title.length >= 10 && title.length <= 70, w: 1, v: title.slice(0, 120) },
    { id: 'desc', ok: desc.length >= 50 && desc.length <= 170, w: 1, v: desc.slice(0, 200) },
    { id: 'h1', ok: h1.length >= 1, w: 1, v: (h1[0] || '').slice(0, 120) },
    { id: 'call', ok: tel, w: 2 },
    { id: 'whatsapp', ok: wa, w: 2 },
    { id: 'map', ok: map, w: 1 },
    { id: 'address', ok: pin, w: 1 },
    { id: 'phone', ok: phoneText || tel, w: 1 },
    { id: 'schema', ok: localSchema, w: 2 },
    ...(nameOk === null ? [] : [{ id: 'name', ok: nameOk, w: 1 }]),
    { id: 'alt', ok: imgs.length === 0 || noAlt / imgs.length <= 0.2, w: 1, v: `${noAlt}/${imgs.length}` },
    { id: 'fast', ok: ms < 1800, w: 1, v: ms },
  ];
  return { url: finalUrl, status, ms, checks, empty: !html || body.length < 40 };
}

/**
 * Check a business website. Returns the analysis, or { error } with a status code. Never throws.
 * @param {string} raw  the website as typed
 * @param {{ business?: string, fetchImpl?: typeof fetch, lookup?: typeof dnsLookup, timeoutMs?: number }} [opts]
 */
export async function checkSite(raw, { business = '', fetchImpl = fetch, lookup = dnsLookup, timeoutMs = 7000 } = {}) {
  const start = normaliseUrl(raw);
  if (!start) return { error: 'bad_url', status: 422 };
  try {
    const page = await fetchPage(start, { fetchImpl, lookup, timeoutMs });
    if (page.status >= 400) return { error: 'unreachable', status: 422, code: page.status };
    return analyse(page.html, {
      finalUrl: page.url.toString(),
      https: page.https,
      ms: page.ms,
      status: page.status,
      business: String(business).slice(0, 80),
    });
  } catch (err) {
    return { error: err?.message === 'blocked' ? 'blocked' : 'unreachable', status: 422 };
  }
}
