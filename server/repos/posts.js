// Posts: admin reads/writes, public reads, redirects, revisions, the post↔image index and read counts.
import { LIMITS } from '../config.js';
import { exec, one, query, tx } from '../db/client.js';
import { conflict, notFound } from '../lib/errors.js';
import { slugify } from '../lib/text.js';
import { contains, LIVE, TODAY } from './sql.js';

const VIEWS_30D = `coalesce((SELECT sum(n) FROM post_views v WHERE v.post_id = p.id AND v.day > ${TODAY} - 30), 0)::int`;
const ADMIN_ROW = `p.id, p.slug, p.title, p.excerpt, p.status, p.published_at, p.updated_at, p.created_at, p.word_count,
  p.reading_minutes, p.focus_keyword, p.category_id, c.name AS cat_name, p.cover_media_id, m.name AS cover_name,
  u.name AS author_name, ${VIEWS_30D} AS views30`;
const ADMIN_FROM = `FROM posts p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN media m ON m.id = p.cover_media_id
  LEFT JOIN users u ON u.id = p.author_id`;

const CARD = `p.id, p.slug, p.title, p.excerpt, p.published_at, p.content_updated_at, p.reading_minutes, p.tags,
  c.slug AS cat_slug, c.name AS cat_name,
  m.id AS cover_id, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.sm_width AS cover_sm_w, m.alt AS cover_alt`;
const CARD_FROM = `FROM posts p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN media m ON m.id = p.cover_media_id`;

/** Columns written by save(), in a fixed order. */
const WRITABLE = [
  'slug',
  'title',
  'excerpt',
  'content_json',
  'content_html',
  'toc',
  'status',
  'published_at',
  'author_id',
  'category_id',
  'tags',
  'cover_media_id',
  'seo_title',
  'seo_description',
  'focus_keyword',
  'canonical_url',
  'noindex',
  'faq',
  'service_slug',
  'word_count',
  'reading_minutes',
];

// ------------------------------------------------------------------------------------------------ admin reads

const STATUS_FILTER = {
  draft: `p.status = 'draft'`,
  live: LIVE,
  scheduled: `p.status = 'published' AND p.published_at > now()`,
};

export function adminList({ status, term, categoryId } = {}) {
  const where = [];
  const params = [];
  if (STATUS_FILTER[status]) where.push(STATUS_FILTER[status]);
  if (term) {
    params.push(contains(term));
    where.push(`(p.title ILIKE $${params.length} OR p.slug ILIKE $${params.length} OR p.focus_keyword ILIKE $${params.length})`);
  }
  if (categoryId) {
    params.push(categoryId);
    where.push(`p.category_id = $${params.length}`);
  }
  return query(
    `SELECT ${ADMIN_ROW} ${ADMIN_FROM} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY p.updated_at DESC LIMIT 200`,
    params,
  );
}

export const forEditor = (id) =>
  one(
    `SELECT p.*, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.alt AS cover_alt
     FROM posts p LEFT JOIN media m ON m.id = p.cover_media_id WHERE p.id = $1`,
    [id],
  );

export const byId = (id) => one('SELECT * FROM posts WHERE id = $1', [id]);

export const revisions = (postId) =>
  query(
    `SELECT r.id, r.saved_at, r.title, u.name AS user_name FROM post_revisions r LEFT JOIN users u ON u.id = r.user_id
     WHERE r.post_id = $1 ORDER BY r.saved_at DESC LIMIT $2`,
    [postId, LIMITS.revisionsKept],
  );

export const revision = (id) => one('SELECT id, post_id, title, content_json, saved_at FROM post_revisions WHERE id = $1', [id]);

export const sameKeyword = (keyword, exceptId) =>
  query(`SELECT id, title, slug, status FROM posts WHERE focus_keyword = $1 AND id <> $2 LIMIT 5`, [keyword, exceptId]);

export const linkTargets = (term) =>
  term
    ? query(
        `SELECT id, title, slug, status, focus_keyword FROM posts WHERE title ILIKE $1 OR slug ILIKE $1 OR focus_keyword ILIKE $1
         ORDER BY (status = 'published') DESC, published_at DESC NULLS LAST LIMIT 30`,
        [contains(term)],
      )
    : query(
        `SELECT id, title, slug, status, focus_keyword FROM posts ORDER BY (status = 'published') DESC, published_at DESC NULLS LAST LIMIT 30`,
      );

/**
 * First free slug based on `base` ("my-post", then "my-post-2", "my-post-3", …). A slug is taken when another post
 * uses it or it redirects to another post (old URLs keep working).
 */
export async function uniqueSlug(base, exceptId = 0) {
  const root = slugify(base, 80) || 'post';
  const stem = root.slice(0, 74).replace(/-+$/, '');
  const rows = await query(
    `SELECT slug FROM posts WHERE (slug = $1 OR slug LIKE $2) AND id <> $3
     UNION SELECT slug FROM post_redirects WHERE (slug = $1 OR slug LIKE $2) AND post_id <> $3`,
    [root, `${stem}-%`, exceptId],
  );
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) if (!taken.has(`${stem}-${n}`)) return `${stem}-${n}`;
}

// ------------------------------------------------------------------------------------------------ admin writes

/**
 * Insert or update a post in one transaction, and keep everything that depends on it in step:
 * - an old URL of a live post 301-redirects to the new one; a slug that is now used again stops redirecting
 * - post_media lists exactly the images in the article
 * - a revision is kept when the content changed (at most every few minutes) and always on publish
 * An update with `expectedUpdatedAt` fails with a conflict if someone else saved the post in the meantime.
 * @returns the saved row
 */
export function save({ id, values, mediaIds, userId, contentChanged, forceRevision, expectedUpdatedAt }) {
  return tx(async (t) => {
    const vals = WRITABLE.map((c) => values[c]);
    let row;
    if (id) {
      const before = await t.one('SELECT slug, status, updated_at FROM posts WHERE id = $1 FOR UPDATE', [id]);
      if (!before) throw notFound('Post not found');
      if (expectedUpdatedAt && new Date(before.updated_at).getTime() !== expectedUpdatedAt.getTime()) {
        throw conflict('Someone else saved this post a moment ago. Reload to see their changes, then make yours again.');
      }
      row = await t.one(
        `UPDATE posts SET ${WRITABLE.map((c, i) => `${c} = $${i + 2}`).join(', ')}, updated_at = now()
           ${contentChanged ? ', content_updated_at = now()' : ''} WHERE id = $1 RETURNING *`,
        [id, ...vals],
      );
      if (before.slug !== row.slug && before.status === 'published') {
        await t.exec(
          'INSERT INTO post_redirects (slug, post_id) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET post_id = EXCLUDED.post_id',
          [before.slug, id],
        );
      }
    } else {
      row = await t.one(
        `INSERT INTO posts (${WRITABLE.join(', ')}) VALUES (${WRITABLE.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
        vals,
      );
    }
    await t.exec('DELETE FROM post_redirects WHERE slug = $1', [row.slug]);

    await t.exec('DELETE FROM post_media WHERE post_id = $1 AND NOT (media_id = ANY($2::int[]))', [row.id, mediaIds]);
    if (mediaIds.length) {
      await t.exec(`INSERT INTO post_media (post_id, media_id) SELECT $1, id FROM media WHERE id = ANY($2::int[]) ON CONFLICT DO NOTHING`, [
        row.id,
        mediaIds,
      ]);
    }

    if (values.content_json && (contentChanged || forceRevision)) {
      const last = await t.one('SELECT saved_at FROM post_revisions WHERE post_id = $1 ORDER BY saved_at DESC LIMIT 1', [row.id]);
      if (forceRevision || !last || Date.now() - new Date(last.saved_at).getTime() > LIMITS.revisionEveryMs) {
        await t.exec('INSERT INTO post_revisions (post_id, user_id, title, content_json) VALUES ($1, $2, $3, $4)', [
          row.id,
          userId,
          row.title || 'Untitled',
          values.content_json,
        ]);
        await t.exec(
          `DELETE FROM post_revisions WHERE post_id = $1
             AND id NOT IN (SELECT id FROM post_revisions WHERE post_id = $1 ORDER BY saved_at DESC LIMIT $2)`,
          [row.id, LIMITS.revisionsKept],
        );
      }
    }
    return row;
  });
}

export const remove = (id) => exec('DELETE FROM posts WHERE id = $1', [id]);

/** Copy a post as a new draft. The focus keyword is cleared so the two don't compete for the same search. */
export function duplicate(id, slug, userId) {
  return tx(async (t) => {
    const row = await t.one(
      `INSERT INTO posts (slug, title, excerpt, content_json, content_html, toc, status, author_id, category_id, tags, cover_media_id,
         seo_title, seo_description, focus_keyword, faq, service_slug, word_count, reading_minutes)
       SELECT $2, title || ' (copy)', excerpt, content_json, content_html, toc, 'draft', $3, category_id, tags, cover_media_id,
         seo_title, seo_description, '', faq, service_slug, word_count, reading_minutes
       FROM posts WHERE id = $1 RETURNING id`,
      [id, slug, userId],
    );
    if (row)
      await t.exec('INSERT INTO post_media (post_id, media_id) SELECT $2, media_id FROM post_media WHERE post_id = $1', [id, row.id]);
    return row;
  });
}

export const slugOf = async (id) => (await one('SELECT slug FROM posts WHERE id = $1', [id]))?.slug ?? null;

// ------------------------------------------------------------------------------------------------ dashboard

export async function dashboard() {
  const [counts, views, daily, top, recent] = await Promise.all([
    one(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE ${LIVE})::int AS live,
        count(*) FILTER (WHERE p.status = 'published' AND p.published_at > now())::int AS scheduled,
        count(*) FILTER (WHERE p.status = 'draft')::int AS drafts,
        coalesce(sum(p.word_count) FILTER (WHERE p.status = 'published'), 0)::int AS words FROM posts p`),
    one(`SELECT coalesce(sum(n), 0)::int AS d30, coalesce(sum(n) FILTER (WHERE day > ${TODAY} - 7), 0)::int AS d7
         FROM post_views WHERE day > ${TODAY} - 30`),
    query(`SELECT to_char(d, 'YYYY-MM-DD') AS day, coalesce(sum(v.n), 0)::int AS n
           FROM generate_series(${TODAY} - 29, ${TODAY}, '1 day') d LEFT JOIN post_views v ON v.day = d
           GROUP BY d ORDER BY d`),
    query(`SELECT ${ADMIN_ROW} ${ADMIN_FROM} WHERE p.status = 'published' ORDER BY views30 DESC, p.published_at DESC LIMIT 5`),
    query(`SELECT ${ADMIN_ROW} ${ADMIN_FROM} ORDER BY p.updated_at DESC LIMIT 6`),
  ]);
  return { counts, views, daily, top, recent };
}

// ------------------------------------------------------------------------------------------------ public reads

export async function listLive({ page = 1, per = 9, categorySlug = null } = {}) {
  const params = categorySlug ? [categorySlug] : [];
  const where = categorySlug ? `${LIVE} AND c.slug = $1` : LIVE;
  const rows = await query(
    `SELECT ${CARD}, count(*) OVER ()::int AS total ${CARD_FROM} WHERE ${where}
     ORDER BY p.published_at DESC, p.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, per, (page - 1) * per],
  );
  // The window count rides along with the rows; a page past the end has no rows, so count separately.
  const total = rows.length ? rows[0].total : (await one(`SELECT count(*)::int AS n ${CARD_FROM} WHERE ${where}`, params)).n;
  return { rows, total, pages: Math.max(1, Math.ceil(total / per)) };
}

/** Full post for its page. Drafts and scheduled posts only with `includeUnpublished` (signed preview links). */
export const bySlug = (slug, { includeUnpublished = false } = {}) =>
  one(
    `SELECT p.*, c.slug AS cat_slug, c.name AS cat_name, c.service_slug AS cat_service,
       m.id AS cover_id, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.sm_width AS cover_sm_w,
       m.alt AS cover_alt, m.caption AS cover_caption,
       u.name AS author_name, u.bio AS author_bio, u.job_title AS author_title, u.avatar_media_id AS author_avatar, am.name AS author_avatar_name
     FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN media m ON m.id = p.cover_media_id
     LEFT JOIN users u ON u.id = p.author_id
     LEFT JOIN media am ON am.id = u.avatar_media_id
     WHERE p.slug = $1 ${includeUnpublished ? '' : `AND ${LIVE}`}`,
    [slug],
  );

/** Current slug of the live post an old slug points to, or null. */
export const redirectTarget = async (oldSlug) =>
  (await one(`SELECT p.slug FROM post_redirects r JOIN posts p ON p.id = r.post_id WHERE r.slug = $1 AND ${LIVE}`, [oldSlug]))?.slug ??
  null;

/** Same category scores 2, each shared tag 1; ties go to the newest. */
export const related = (post, n = 3) =>
  query(
    `SELECT ${CARD},
       (CASE WHEN p.category_id = $2 THEN 2 ELSE 0 END
        + cardinality(ARRAY(SELECT unnest(p.tags) INTERSECT SELECT unnest($3::text[])))) AS score
     ${CARD_FROM} WHERE ${LIVE} AND p.id <> $1 ORDER BY score DESC, p.published_at DESC LIMIT $4`,
    [post.id, post.category_id, post.tags || [], n],
  );

export const sitemapRows = () =>
  query(`SELECT p.slug, greatest(p.content_updated_at, p.published_at) AS lastmod, m.id AS cover_id, m.name AS cover_name
    FROM posts p LEFT JOIN media m ON m.id = p.cover_media_id
    WHERE ${LIVE} AND NOT p.noindex AND p.canonical_url = '' ORDER BY p.published_at DESC`);

export const feedRows = (n = 30) =>
  query(
    `SELECT ${CARD}, p.content_html, u.name AS author_name ${CARD_FROM} LEFT JOIN users u ON u.id = p.author_id
    WHERE ${LIVE} AND NOT p.noindex ORDER BY p.published_at DESC LIMIT $1`,
    [n],
  );

export const latest = (n) => listLive({ page: 1, per: n }).then((r) => r.rows);

/** Count one read of a live post (India date). Unknown or unpublished ids are ignored. */
export const countView = (id) =>
  exec(
    `INSERT INTO post_views (post_id, day, n)
     SELECT p.id, ${TODAY}, 1 FROM posts p WHERE p.id = $1 AND ${LIVE}
     ON CONFLICT (post_id, day) DO UPDATE SET n = post_views.n + 1`,
    [id],
  );
