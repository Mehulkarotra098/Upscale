// Builds a shop report: fresh Google data for one place + the same-type competition nearby, scored by score.js.
// A short in-memory cache per warm function instance keeps repeat views (and the bot's follow-ups) from calling
// Google again within a few hours. Nothing from Google is written to the database.
import { details, nearby } from './places.js';
import { scorePlace } from './score.js';

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

/** Report data for a place, or null if Google no longer lists it. */
export async function buildReport(placeId, { fetchImpl, now = Date.now() } = {}) {
  const hit = cache.get(placeId);
  if (hit && now - hit.at < TTL_MS) return hit.data;
  const place = await details(placeId, { fetchImpl });
  if (!place || !place.id) return null;
  const rivals =
    place.primaryType && place.location
      ? await nearby({ location: place.location, type: place.primaryType, fetchImpl }).catch(() => [])
      : [];
  const score = scorePlace(place, rivals, now);
  const data = {
    placeId: place.id,
    name: place.displayName?.text || 'This business',
    type: place.primaryTypeDisplayName?.text || '',
    address: place.shortFormattedAddress || place.formattedAddress || '',
    mapsUrl: place.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(place.id)}`,
    open: (place.businessStatus || 'OPERATIONAL') === 'OPERATIONAL',
    ...score,
  };
  cache.set(placeId, { at: now, data });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return data;
}

export const _clearReportCache = () => cache.clear();
