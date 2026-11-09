// /media/<id>-<name>.webp (full size) and /media/<id>-<name>-800.webp (800px copy).
// An image never changes after upload (a new upload gets a new id), so responses are cached for a year.
import { hasDb } from '../db/client.js';
import { CACHE, query, send } from '../lib/http.js';
import { log } from '../lib/log.js';
import * as media from '../repos/media.js';
import { withLicence } from './licence.js';
import { parseMediaFile } from './urls.js';

const missing = (res) =>
  send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=60' });

export default async function mediaHandler(req, res) {
  const file = parseMediaFile(query(req).f);
  if (!file || !hasDb()) return missing(res);
  try {
    const row = await media.bytes(file.id, file.small);
    if (!row) return missing(res);
    // licence metadata goes in as the image is served (the stored image is left as uploaded)
    const data = withLicence(row.data, { title: row.name, desc: row.alt });
    return send(res, 200, data, {
      'Content-Type': row.mime || 'image/webp',
      'Content-Length': String(data.length),
      'Cache-Control': CACHE.immutable,
      'X-Content-Type-Options': 'nosniff',
    });
  } catch (err) {
    log.error('media', 'read failed', { id: file.id, err });
    return send(res, 503, 'Unavailable', { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': CACHE.none, 'Retry-After': '30' });
  }
}
