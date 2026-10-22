// Turns what a person types (a shop name, or any kind of Google Maps link) into a Google Place ID.
// Shared by the WhatsApp bot, the public /check page and the admin Outreach page.
import { featureId, placeIdFromFeature, placeName, resolveShortLink } from '../lib/maplink.js';
import { findOne } from './places.js';

/** Links we treat as Google Maps links (full, short and share links). */
export const MAPS_LINK = /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page|share\.google|maps\.google\.)/i;
const CITY = /mumbai|thane|navi|delhi|pune|bengaluru|bangalore|hyderabad|chennai|kolkata|ahmedabad|surat|jaipur/i;

/** "Glow Salon Marol" → "Glow Salon Marol, Mumbai"; text that already names a city is left alone. */
export const withCity = (text) => (CITY.test(text) ? text : `${text}, Mumbai`);

/** Any Google Maps link → Place ID, or null. */
export async function resolveMaps(link, { find = findOne } = {}) {
  const short = await resolveShortLink(link).catch(() => null);
  if (short?.placeId) return short.placeId;
  const pid = link.match(/place_id[:=]([A-Za-z0-9_-]{10,})/)?.[1];
  if (pid) return pid;
  const fid = featureId(link);
  if (fid) return placeIdFromFeature(fid);
  const name = placeName(link);
  return name ? (await find(name))?.id || null : null;
}

/**
 * Free text that may hold a Maps link and/or a name → Place ID, or null.
 * The link wins; if it can't be resolved, whatever text is left is searched by name.
 */
export async function resolveQuery(text, { maps = resolveMaps, find = findOne } = {}) {
  const q = String(text || '').trim();
  const link = q.match(/https?:\/\/\S+/)?.[0];
  if (link && MAPS_LINK.test(link)) {
    const id = await maps(link);
    if (id) return id;
  }
  const rest = (link ? q.replace(link, '') : q).trim().slice(0, 120);
  if (rest.length < 3) return null;
  return (await find(withCity(rest)))?.id || null;
}
