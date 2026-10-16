// Read-side queries shared by the public blog pages (and a few by the admin).
import { q, one } from './db.js';

const LIVE = `p.status = 'published' AND p.published_at <= now()`;

const CARD_COLS = `p.id, p.slug, p.title, p.excerpt, p.published_at, p.content_updated_at, p.reading_minutes, p.tags,
  c.slug AS cat_slug, c.name AS cat_name,
  m.id AS cover_id, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.sm_width AS cover_sm_w, m.alt AS cover_alt`;

const FROM = `FROM posts p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN media m ON m.id = p.cover_media_id`;

export async function listPosts({ page = 1, per = 9, category = null } = {}) {
  const params = []; let where = LIVE;
  if (category) { params.push(category); where += ` AND c.slug = $${params.length}`; }
  const total = Number((await one(`SELECT count(*) AS n ${FROM} WHERE ${where}`, params)).n);
  params.push(per, (page - 1) * per);
  const rows = (await q(`SELECT ${CARD_COLS} ${FROM} WHERE ${where} ORDER BY p.published_at DESC, p.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params)).rows;
  return { rows, total, pages: Math.max(1, Math.ceil(total / per)) };
}

export async function categoriesWithCounts() {
  return (await q(`SELECT c.*, count(p.id)::int AS n FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id AND ${LIVE}
    GROUP BY c.id ORDER BY c.sort, c.name`)).rows;
}

export async function getCategory(slug) {
  return one('SELECT * FROM categories WHERE slug = $1', [slug]);
}

export async function getPostBySlug(slug, { includeDrafts = false } = {}) {
  return one(`SELECT p.*, c.slug AS cat_slug, c.name AS cat_name, c.service_slug AS cat_service,
      m.id AS cover_id, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.sm_width AS cover_sm_w, m.alt AS cover_alt, m.caption AS cover_caption,
      u.name AS author_name, u.bio AS author_bio, u.job_title AS author_title, u.avatar_media_id AS author_avatar, am.name AS author_avatar_name
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN media m ON m.id = p.cover_media_id
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN media am ON am.id = u.avatar_media_id
    WHERE p.slug = $1 ${includeDrafts ? '' : `AND ${LIVE}`}`, [slug]);
}

export async function redirectFor(slug) {
  return one(`SELECT p.slug FROM post_redirects r JOIN posts p ON p.id = r.post_id WHERE r.slug = $1 AND ${LIVE}`, [slug]);
}

// Related: same category first, then shared tags, then newest.
export async function relatedPosts(post, n = 3) {
  return (await q(`SELECT ${CARD_COLS},
      (CASE WHEN p.category_id = $2 THEN 2 ELSE 0 END + cardinality(ARRAY(SELECT unnest(p.tags) INTERSECT SELECT unnest($3::text[])))) AS score
    ${FROM} WHERE ${LIVE} AND p.id <> $1
    ORDER BY score DESC, p.published_at DESC LIMIT $4`, [post.id, post.category_id, post.tags || [], n])).rows;
}

export async function sitemapRows() {
  return (await q(`SELECT p.slug, p.title, greatest(p.content_updated_at, p.published_at) AS lastmod, p.noindex, p.canonical_url,
      m.id AS cover_id, m.name AS cover_name, m.alt AS cover_alt
    FROM posts p LEFT JOIN media m ON m.id = p.cover_media_id WHERE ${LIVE} ORDER BY p.published_at DESC`)).rows;
}

export async function feedRows(n = 30) {
  return (await q(`SELECT ${CARD_COLS}, p.content_html, u.name AS author_name ${FROM} LEFT JOIN users u ON u.id = p.author_id
    WHERE ${LIVE} AND NOT p.noindex ORDER BY p.published_at DESC LIMIT $1`, [n])).rows;
}

export async function countView(id) {
  await q(`INSERT INTO post_views (post_id, day, n) VALUES ($1, (now() AT TIME ZONE 'Asia/Kolkata')::date, 1)
    ON CONFLICT (post_id, day) DO UPDATE SET n = post_views.n + 1`, [id]);
}
