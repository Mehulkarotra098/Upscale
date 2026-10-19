// Tiny per-instance rate limiter for the free public tools (sliding one-minute window). Serverless instances are
// short-lived and many, so this only blunts bursts from one visitor; the edge cache does the rest.
const windows = new Map();
const WINDOW_MS = 60_000;

/** Record a hit for `key`; false once more than `max` hits happened in the last minute. */
export function allow(key, max, now = Date.now()) {
  const list = (windows.get(key) || []).filter((t) => now - t < WINDOW_MS);
  const ok = list.length < max;
  if (ok) list.push(now);
  windows.set(key, list);
  if (windows.size > 5000) for (const [k, v] of windows) if (!v.some((t) => now - t < WINDOW_MS)) windows.delete(k);
  return ok;
}
export const _resetRateLimits = () => windows.clear();
