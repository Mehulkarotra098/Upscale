// Blog categories.
import { exec, one, query } from '../db/client.js';
import { LIVE } from './sql.js';

/** Every category with its number of posts: all posts for the admin, live posts for the public blog. */
export const list = ({ liveOnly = false } = {}) =>
  query(`SELECT c.*, count(p.id)::int AS n FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id ${liveOnly ? `AND ${LIVE}` : ''}
    GROUP BY c.id ORDER BY c.sort, c.name`);

export const bySlug = (slug) => one('SELECT * FROM categories WHERE slug = $1', [slug]);
export const slugTaken = async (slug, exceptId = 0) =>
  Boolean(await one('SELECT 1 FROM categories WHERE slug = $1 AND id <> $2', [slug, exceptId]));

const COLS = ['name', 'slug', 'description', 'seo_title', 'seo_description', 'service_slug', 'sort'];

export function save(id, values) {
  const vals = COLS.map((c) => values[c]);
  return id
    ? one(`UPDATE categories SET ${COLS.map((c, i) => `${c} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *`, [id, ...vals])
    : one(`INSERT INTO categories (${COLS.join(', ')}) VALUES (${COLS.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, vals);
}

export const remove = (id) => exec('DELETE FROM categories WHERE id = $1', [id]);
