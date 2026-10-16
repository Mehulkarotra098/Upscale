// Serves uploaded images: /media/<id>-<name>.webp (full, up to 1600px) and /media/<id>-<name>-800.webp (small).
// Images never change once uploaded (a re-upload gets a new id), so they're cached for a year at the edge and in browsers.
import { one, hasDb } from '../server/db.js';
import { query, send } from '../server/http.js';

export default async function handler(req, res) {
  const f = String(query(req).f || '');
  const m = f.match(/^(\d+)-[a-z0-9-]*?(-800)?\.(webp|jpg|jpeg|png|avif)$/i);
  if (!m || !hasDb()) return send(res, 404, 'Not found', { 'Cache-Control': 'public, max-age=60' });
  try {
    const small = !!m[2];
    const row = await one(`SELECT mime, ${small ? 'coalesce(bytes_sm, bytes)' : 'bytes'} AS b FROM media WHERE id = $1`, [Number(m[1])]);
    if (!row) return send(res, 404, 'Not found', { 'Cache-Control': 'public, max-age=60' });
    send(res, 200, row.b, {
      'Content-Type': row.mime || 'image/webp',
      'Content-Length': String(row.b.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
  } catch (e) {
    console.error('[img]', e);
    send(res, 503, 'Unavailable', { 'Cache-Control': 'no-store' });
  }
}
