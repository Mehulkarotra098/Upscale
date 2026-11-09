// Uploaded images. Bytes live in Postgres (full ≤1600px + 800px copy, both WebP/JPEG from the browser).
import { exec, one, query } from '../db/client.js';
import { contains } from './sql.js';

const META = 'id, name, mime, width, height, sm_width, alt, caption, size, created_at';
// Posts that show an image, inline (post_media) or as their cover.
const USED = `(SELECT count(DISTINCT p.id) FROM posts p
  WHERE p.cover_media_id = media.id OR EXISTS (SELECT 1 FROM post_media pm WHERE pm.post_id = p.id AND pm.media_id = media.id))::int AS used`;

export function list(term = '') {
  return term
    ? query(`SELECT ${META}, ${USED} FROM media WHERE name ILIKE $1 OR alt ILIKE $1 ORDER BY created_at DESC LIMIT 300`, [contains(term)])
    : query(`SELECT ${META}, ${USED} FROM media ORDER BY created_at DESC LIMIT 300`);
}

export const usage = async (id) => (await one(`SELECT ${USED} FROM media WHERE id = $1`, [id]))?.used ?? 0;

/** Sizes and alt text for the given ids, as a Map for the article pipeline. */
export async function dimensions(ids) {
  if (!ids.length) return new Map();
  const rows = await query('SELECT id, name, width, height, sm_width, alt FROM media WHERE id = ANY($1::int[])', [ids]);
  return new Map(rows.map((m) => [m.id, m]));
}

export const insert = ({ name, mime, width, height, full, small, smWidth, alt, caption, uploadedBy }) =>
  one(
    `INSERT INTO media (name, mime, width, height, bytes, bytes_sm, sm_width, alt, caption, size, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING ${META}, 0 AS used`,
    [name, mime, width, height, full, small, smWidth, alt, caption, full.length + (small?.length ?? 0), uploadedBy],
  );

export const updateText = (id, { alt, caption }) =>
  one(`UPDATE media SET alt = $2, caption = $3 WHERE id = $1 RETURNING ${META}, ${USED}`, [id, alt, caption]);

export const remove = (id) => exec('DELETE FROM media WHERE id = $1', [id]);

/** Image bytes for /media/…; the small variant falls back to the full one. */
export const bytes = (id, small) =>
  one(`SELECT mime, name, alt, ${small ? 'coalesce(bytes_sm, bytes)' : 'bytes'} AS data FROM media WHERE id = $1`, [id]);

export const totals = () => one('SELECT count(*)::int AS n, coalesce(sum(size), 0)::bigint AS bytes FROM media');
