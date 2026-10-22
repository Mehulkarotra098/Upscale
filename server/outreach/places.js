// Google Places API (New) client for shop reports and outreach. Server-side only; the key never reaches a browser.
//
// What we keep, per Google's terms: only Place IDs (which may be stored indefinitely). Names, phone numbers, ratings
// and reviews are fetched fresh each time a report or the daily batch is built, never saved to the database.
//
// Cost (India pricing, Oct 2026): Text Search with IDs only is free and unlimited; Place Details Enterprise +
// Atmosphere has 7,000 free calls a month; Nearby Search Enterprise has 7,000. A batch of 10 shops a day uses
// roughly 15 details + 10 nearby calls, so normal use stays inside the free allowance.
import { PLACES_KEY, SERPAPI_KEY } from '../config.js';
import { HttpError } from '../lib/errors.js';
import * as serp from './serpapi.js';

const BASE = 'https://places.googleapis.com/v1';
const TIMEOUT_MS = 6000;

const DETAIL_FIELDS = [
  'id',
  'displayName',
  'shortFormattedAddress',
  'formattedAddress',
  'location',
  'primaryType',
  'primaryTypeDisplayName',
  'types',
  'businessStatus',
  'googleMapsUri',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'regularOpeningHours',
  'rating',
  'userRatingCount',
  'photos',
  'reviews',
  'editorialSummary',
].join(',');

const NEARBY_FIELDS = 'places.id,places.displayName,places.rating,places.userRatingCount,places.primaryType';

/** Where shop data comes from: Google's own Places API if its key is set, else SerpApi (no Google Cloud needed). */
export const provider = () => (PLACES_KEY ? 'google' : SERPAPI_KEY ? 'serpapi' : '');
export const hasPlaces = () => Boolean(provider());

async function call(path, { method = 'GET', fields, body, fetchImpl = fetch } = {}) {
  if (!PLACES_KEY) throw new HttpError(503, 'Google Places key is not set up yet');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${BASE}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': fields,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) return null;
    if (!res.ok) throw new HttpError(502, `Google Places error ${res.status}: ${data?.error?.message || 'unknown'}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** Free (IDs-only) text search inside a rectangle. Returns { ids, next } where next is the page token or ''. */
export async function searchIds({ text, rect, pageToken, fetchImpl }) {
  const data = await call('/places:searchText', {
    method: 'POST',
    fields: 'places.id,nextPageToken',
    fetchImpl,
    body: {
      textQuery: text,
      pageSize: 20,
      regionCode: 'IN',
      ...(rect
        ? {
            locationRestriction: {
              rectangle: { low: { latitude: rect[0], longitude: rect[1] }, high: { latitude: rect[2], longitude: rect[3] } },
            },
          }
        : {}),
      ...(pageToken ? { pageToken } : {}),
    },
  });
  return { ids: (data?.places || []).map((p) => p.id).filter(Boolean), next: data?.nextPageToken || '' };
}

/** First match for a free-text query such as "Glow Salon Marol" (used by the public checker and WhatsApp bot). */
export async function findOne(text, { fetchImpl } = {}) {
  if (provider() === 'serpapi') return serp.findOne(text, { fetchImpl });
  const data = await call('/places:searchText', {
    method: 'POST',
    fields: 'places.id,places.displayName,places.shortFormattedAddress',
    fetchImpl,
    body: {
      textQuery: text,
      pageSize: 1,
      regionCode: 'IN',
      locationBias: { circle: { center: { latitude: 19.076, longitude: 72.8777 }, radius: 50000 } },
    },
  });
  const p = data?.places?.[0];
  return p ? { id: p.id, name: p.displayName?.text || '', address: p.shortFormattedAddress || '' } : null;
}

/** Everything a report needs about one place, or null if Google no longer has it. */
export async function details(placeId, { fetchImpl } = {}) {
  if (!/^[A-Za-z0-9_-]{10,300}$/.test(String(placeId || ''))) return null;
  if (provider() === 'serpapi') return serp.details(placeId, { fetchImpl });
  return call(`/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=IN`, { fields: DETAIL_FIELDS, fetchImpl });
}

/** Up to 20 businesses of the same main type within `radius` metres, most popular first. */
export async function nearby({ location, type, label, radius = 1200, fetchImpl }) {
  if (provider() === 'serpapi') return serp.nearby({ location, type, label, fetchImpl });
  if (!location || !type) return [];
  const data = await call('/places:searchNearby', {
    method: 'POST',
    fields: NEARBY_FIELDS,
    fetchImpl,
    body: {
      includedPrimaryTypes: [type],
      maxResultCount: 20,
      rankPreference: 'POPULARITY',
      locationRestriction: { circle: { center: { latitude: location.latitude, longitude: location.longitude }, radius } },
    },
  });
  return (data?.places || []).map((p) => ({
    id: p.id,
    name: p.displayName?.text || '',
    rating: Number(p.rating) || 0,
    reviews: Number(p.userRatingCount) || 0,
  }));
}
