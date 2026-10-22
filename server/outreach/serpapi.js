// SerpApi (Google Maps engine) as a no-Google-Cloud source for shop reports. Same shapes as places.js returns, so
// the scoring, report page, bot and /check work unchanged. Used only when GOOGLE_PLACES_KEY isn't set and
// SERPAPI_KEY is. Free plan: about 250 searches a month, so each report (details + nearby = 2 searches) counts.
// Nothing from it is stored: like the Places path, only Place IDs (as report codes) are saved.
import { SERPAPI_KEY } from '../config.js';
import { HttpError } from '../lib/errors.js';

const BASE = 'https://serpapi.com/search.json';
const TIMEOUT_MS = 8000;
const MUMBAI = '@19.076,72.8777,11z';

async function call(params, { fetchImpl = fetch } = {}) {
  if (!SERPAPI_KEY) throw new HttpError(503, 'SerpApi key is not set up yet');
  const url = new URL(BASE);
  for (const [k, v] of Object.entries({ engine: 'google_maps', hl: 'en', gl: 'in', ...params })) url.searchParams.set(k, v);
  url.searchParams.set('api_key', SERPAPI_KEY);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    const data = await res.json().catch(() => ({}));
    if (data?.error) {
      if (/hasn.t returned any results|no results/i.test(data.error)) return null;
      throw new HttpError(502, `SerpApi error: ${String(data.error).slice(0, 120)}`);
    }
    if (!res.ok) throw new HttpError(502, `SerpApi error ${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const DAY = 86_400_000;
const UNIT = { minute: DAY / 1440, hour: DAY / 24, day: DAY, week: 7 * DAY, month: 30 * DAY, year: 365 * DAY };

/** "3 weeks ago" / "a month ago" → ISO date (approximate), or '' if it can't be read. */
export function relativeToIso(text, now = Date.now()) {
  const m = String(text || '').match(/(\d+|an?)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
  if (!m) return '';
  const n = /^an?$/i.test(m[1]) ? 1 : Number(m[1]);
  return new Date(now - n * UNIT[m[2].toLowerCase()]).toISOString();
}

const STATUS = (open) =>
  /permanently closed/i.test(open || '')
    ? 'CLOSED_PERMANENTLY'
    : /temporarily closed/i.test(open || '')
      ? 'CLOSED_TEMPORARILY'
      : 'OPERATIONAL';

function weekdays(hours) {
  if (!hours) return [];
  const list = Array.isArray(hours) ? hours : [hours];
  return list.flatMap((h) => (h && typeof h === 'object' ? Object.entries(h).map(([d, t]) => `${d}: ${t}`) : []));
}

/** SerpApi place_results → the Places API (New) fields score.js and report.js read. */
export function toPlace(p, now = Date.now()) {
  const reviews = Array.isArray(p.user_reviews) ? p.user_reviews : p.user_reviews?.most_relevant || [];
  const type = p.type || (Array.isArray(p.types) ? p.types[0] : '') || '';
  return {
    id: p.place_id,
    displayName: { text: p.title || '' },
    shortFormattedAddress: p.address || '',
    formattedAddress: p.address || '',
    location: p.gps_coordinates ? { latitude: p.gps_coordinates.latitude, longitude: p.gps_coordinates.longitude } : null,
    primaryType:
      p.type_ids?.[0] ||
      type
        .toLowerCase()
        .replace(/[^a-z]+/g, '_')
        .replace(/^_|_$/g, ''),
    primaryTypeDisplayName: { text: type },
    types: p.type_ids || [],
    businessStatus: STATUS(p.open_state),
    googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(p.place_id)}`,
    nationalPhoneNumber: p.phone || '',
    websiteUri: p.website || '',
    regularOpeningHours: { weekdayDescriptions: weekdays(p.operating_hours || p.hours) },
    rating: Number(p.rating) || 0,
    userRatingCount: Number(p.reviews) || 0,
    photos: [],
    photosUnknown: true, // SerpApi doesn't give a photo count; scoring treats photos as unknown
    reviews: reviews.map((r) => ({ publishTime: r.iso_date || r.date_iso8601 || relativeToIso(r.date, now) })).filter((r) => r.publishTime),
  };
}

/** First match for "Glow Salon Marol, Mumbai". */
export async function findOne(text, { fetchImpl } = {}) {
  const data = await call({ type: 'search', q: text, ll: MUMBAI }, { fetchImpl });
  const p = data?.place_results || data?.local_results?.[0];
  return p?.place_id ? { id: p.place_id, name: p.title || '', address: p.address || '' } : null;
}

export async function details(placeId, { fetchImpl, now } = {}) {
  if (!/^[A-Za-z0-9_-]{10,300}$/.test(String(placeId || ''))) return null;
  const data = await call({ place_id: placeId }, { fetchImpl });
  return data?.place_results?.place_id ? toPlace(data.place_results, now) : null;
}

/** Google's own top results for the same kind of business around this spot (≈ who wins "near me" searches). */
export async function nearby({ location, type, label, fetchImpl }) {
  const q = (label || String(type || '').replace(/_/g, ' ')).trim();
  if (!location || !q) return [];
  const data = await call({ type: 'search', q, ll: `@${location.latitude},${location.longitude},15z` }, { fetchImpl });
  return (data?.local_results || []).slice(0, 20).map((r) => ({
    id: r.place_id,
    name: r.title || '',
    rating: Number(r.rating) || 0,
    reviews: Number(r.reviews) || 0,
  }));
}
