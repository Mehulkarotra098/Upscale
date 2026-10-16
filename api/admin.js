// Admin JSON API: /api/admin/<action> (rewritten to ?action=). Every route except login needs a valid session cookie.
// Mutations also need the X-US-Admin header (a custom header can't be sent cross-site without CORS, so this blocks CSRF).
import { q, one, tx, hasDb } from '../server/db.js';
import { query, readJSON, json, slugify, clientIp } from '../server/http.js';
import { login, currentUser, sessionCookie, clearCookie, hashPassword, verifyPassword, sign } from '../server/auth.js';
import { processContent, referencedMedia, plainExcerpt, mediaUrl } from '../server/content.js';
import { SITE_URL, STATIC_PAGES, SERVICES, INDEXNOW_KEY, SESSION_SECRET, IS_PROD } from '../server/config.js';

const MAX_IMG = 3.5 * 1024 * 1024;
const fail = (status, error) => Object.assign(new Error(error), { status, expose: true });
const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);

function isSecure(req) {
  return (req.headers['x-forwarded-proto'] || '').includes('https') || IS_PROD;
}

function checkCsrf(req) {
  if (req.headers['x-us-admin'] !== '1') throw fail(403, 'Missing admin header');
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (new URL(origin).host !== host) throw fail(403, 'Cross-site request blocked');
  }
}

function magicOk(buf) {
  const h = buf.subarray(0, 12);
  return (h.toString('ascii', 0, 4) === 'RIFF' && h.toString('ascii', 8, 12) === 'WEBP')
    || (h[0] === 0xff && h[1] === 0xd8) || (h[0] === 0x89 && h.toString('ascii', 1, 4) === 'PNG');
}
const mimeOf = (buf) => (buf.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : buf[0] === 0xff ? 'image/jpeg' : 'image/png');

async function uniqueSlug(base, id = 0) {
  let slug = slugify(base) || 'post'; let n = 2;
  for (;;) {
    const hit = await one('SELECT id FROM posts WHERE slug = $1 AND id <> $2', [slug, id]);
    const red = await one('SELECT post_id FROM post_redirects WHERE slug = $1 AND post_id <> $2', [slug, id]);
    if (!hit && !red) return slug;
    slug = `${slugify(base).slice(0, 74)}-${n++}`;
  }
}

async function pingIndexNow(urls) {
  if (!INDEXNOW_KEY || !IS_PROD || !urls.length) return;
  const host = new URL(SITE_URL).host;
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}indexnow-key.txt`, urlList: urls }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (e) { console.warn('[indexnow]', e.message); }
}

const POST_COLS = `p.id, p.slug, p.title, p.excerpt, p.status, p.published_at, p.updated_at, p.created_at, p.word_count, p.reading_minutes,
  p.focus_keyword, p.category_id, c.name AS cat_name, p.cover_media_id, m.name AS cover_name, u.name AS author_name,
  coalesce((SELECT sum(n) FROM post_views v WHERE v.post_id = p.id AND v.day > current_date - 30), 0)::int AS views30`;

const ACTIONS = {
  // ------------------------------------------------------------ session
  async login(req, res) {
    const b = await readJSON(req);
    const r = await login(req, b.email, b.password);
    if (r.error) throw fail(r.status, r.error);
    const u = r.user;
    json(res, 200, { user: { id: u.id, name: u.name, email: u.email, role: u.role } }, { 'Set-Cookie': sessionCookie(u, isSecure(req)) });
  },
  async logout(req, res) { json(res, 200, { ok: true }, { 'Set-Cookie': clearCookie(isSecure(req)) }); },
  async me(req, res, user) { json(res, 200, { user, site: SITE_URL, services: SERVICES, indexnow: !!INDEXNOW_KEY }); },

  // ------------------------------------------------------------ dashboard
  async stats(req, res) {
    const c = await one(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status='published' AND published_at <= now())::int AS live,
        count(*) FILTER (WHERE status='published' AND published_at > now())::int AS scheduled,
        count(*) FILTER (WHERE status='draft')::int AS drafts,
        coalesce(sum(word_count) FILTER (WHERE status='published'),0)::int AS words FROM posts`);
    const views = await one(`SELECT coalesce(sum(n),0)::int AS d30, coalesce(sum(n) FILTER (WHERE day > current_date - 7),0)::int AS d7 FROM post_views WHERE day > current_date - 30`);
    const daily = (await q(`SELECT to_char(d, 'YYYY-MM-DD') AS day, coalesce(sum(v.n),0)::int AS n FROM generate_series(current_date - 29, current_date, '1 day') d
      LEFT JOIN post_views v ON v.day = d GROUP BY d ORDER BY d`)).rows;
    const top = (await q(`SELECT ${POST_COLS} FROM posts p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN media m ON m.id=p.cover_media_id LEFT JOIN users u ON u.id=p.author_id
      WHERE p.status='published' ORDER BY views30 DESC, p.published_at DESC LIMIT 5`)).rows;
    const recent = (await q(`SELECT ${POST_COLS} FROM posts p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN media m ON m.id=p.cover_media_id LEFT JOIN users u ON u.id=p.author_id
      ORDER BY p.updated_at DESC LIMIT 6`)).rows;
    const media = await one('SELECT count(*)::int AS n, coalesce(sum(size),0)::bigint AS bytes FROM media');
    json(res, 200, { counts: c, views, daily, top, recent, media });
  },

  // ------------------------------------------------------------ posts
  async posts(req, res) {
    const p = query(req); const params = []; const where = [];
    if (p.status === 'draft') where.push(`p.status='draft'`);
    if (p.status === 'live') where.push(`p.status='published' AND p.published_at <= now()`);
    if (p.status === 'scheduled') where.push(`p.status='published' AND p.published_at > now()`);
    if (p.q) { params.push(`%${p.q}%`); where.push(`(p.title ILIKE $${params.length} OR p.slug ILIKE $${params.length} OR p.focus_keyword ILIKE $${params.length})`); }
    if (p.category) { params.push(Number(p.category)); where.push(`p.category_id = $${params.length}`); }
    const rows = (await q(`SELECT ${POST_COLS} FROM posts p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN media m ON m.id=p.cover_media_id LEFT JOIN users u ON u.id=p.author_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.updated_at DESC LIMIT 200`, params)).rows;
    json(res, 200, { posts: rows });
  },
  async post(req, res) {
    const id = Number(query(req).id);
    const p = await one(`SELECT p.*, m.name AS cover_name, m.width AS cover_w, m.height AS cover_h, m.alt AS cover_alt FROM posts p LEFT JOIN media m ON m.id = p.cover_media_id WHERE p.id = $1`, [id]);
    if (!p) throw fail(404, 'Post not found');
    const revisions = (await q(`SELECT r.id, r.saved_at, r.title, u.name AS user_name FROM post_revisions r LEFT JOIN users u ON u.id = r.user_id WHERE r.post_id = $1 ORDER BY r.saved_at DESC LIMIT 25`, [id])).rows;
    json(res, 200, { post: p, revisions });
  },
  async revision(req, res) {
    const r = await one('SELECT id, post_id, title, content_json, saved_at FROM post_revisions WHERE id = $1', [Number(query(req).id)]);
    if (!r) throw fail(404, 'Revision not found');
    json(res, 200, { revision: r });
  },
  async save(req, res, user) {
    const b = await readJSON(req);
    const id = Number(b.id) || 0;
    const existing = id ? await one('SELECT * FROM posts WHERE id = $1', [id]) : null;
    if (id && !existing) throw fail(404, 'Post not found');
    const title = str(b.title, 200);
    const status = b.status === 'published' ? 'published' : 'draft';
    if (status === 'published' && !title) throw fail(400, 'Add a title before publishing');
    const slug = await uniqueSlug(str(b.slug, 90) || title || `draft-${Date.now()}`, id);

    // media used in the article → dimensions for responsive images
    const raw = String(b.content_html || '');
    if (raw.length > 800_000) throw fail(413, 'Article is too long');
    const ids = referencedMedia(raw);
    const media = new Map();
    if (ids.length) for (const m of (await q('SELECT id, name, width, height, sm_width, alt FROM media WHERE id = ANY($1)', [ids])).rows) media.set(m.id, m);
    const out = processContent(raw, media);

    const faq = (Array.isArray(b.faq) ? b.faq : []).slice(0, 20).map((f) => ({ q: str(f.q, 300), a: str(f.a, 2000) })).filter((f) => f.q && f.a);
    const tags = [...new Set((Array.isArray(b.tags) ? b.tags : []).map((t) => str(t, 40).toLowerCase()).filter(Boolean))].slice(0, 15);
    let publishedAt = b.published_at ? new Date(b.published_at) : null;
    if (publishedAt && isNaN(publishedAt)) publishedAt = null;
    if (status === 'published' && !publishedAt) publishedAt = existing?.published_at || new Date();
    const contentChanged = !existing || existing.content_html !== out.html || existing.title !== title;
    const canonical = str(b.canonical_url, 300);
    if (canonical && !/^https:\/\//.test(canonical)) throw fail(400, 'Canonical URL must start with https://');

    const vals = {
      slug, title, excerpt: str(b.excerpt, 320) || plainExcerpt(out.lead, 160), content_json: b.content_json ? JSON.stringify(b.content_json) : null, content_html: out.html,
      toc: JSON.stringify(out.toc), status, published_at: publishedAt, author_id: Number(b.author_id) || existing?.author_id || user.id,
      category_id: Number(b.category_id) || null, tags, cover_media_id: Number(b.cover_media_id) || null,
      seo_title: str(b.seo_title, 120), seo_description: str(b.seo_description, 320), focus_keyword: str(b.focus_keyword, 80).toLowerCase(),
      canonical_url: canonical, noindex: !!b.noindex, faq: JSON.stringify(faq), service_slug: SERVICES.some((s) => s.slug === b.service_slug) ? b.service_slug : '',
      word_count: out.words, reading_minutes: out.minutes,
    };
    const saved = await tx(async (c) => {
      let row;
      if (existing) {
        const cols = Object.keys(vals);
        row = (await c.query(`UPDATE posts SET ${cols.map((k, i) => `${k} = $${i + 2}`).join(', ')}, updated_at = now()
          ${contentChanged ? ', content_updated_at = now()' : ''} WHERE id = $1 RETURNING *`, [id, ...Object.values(vals)])).rows[0];
        // keep the old URL working: published post whose slug changed → 301 from the old slug
        if (existing.slug !== slug && existing.status === 'published') {
          await c.query('INSERT INTO post_redirects (slug, post_id) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET post_id = EXCLUDED.post_id', [existing.slug, id]);
        }
        await c.query('DELETE FROM post_redirects WHERE slug = $1', [slug]);
      } else {
        const cols = Object.keys(vals);
        row = (await c.query(`INSERT INTO posts (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, Object.values(vals))).rows[0];
      }
      // revision history: snapshot when content changed and the last snapshot is older than 3 minutes (or on publish)
      const last = await c.query('SELECT saved_at, title FROM post_revisions WHERE post_id = $1 ORDER BY saved_at DESC LIMIT 1', [row.id]);
      const stale = !last.rows[0] || Date.now() - new Date(last.rows[0].saved_at) > 180_000;
      if (vals.content_json && contentChanged && (stale || b.publishNow)) {
        await c.query('INSERT INTO post_revisions (post_id, user_id, title, content_json) VALUES ($1, $2, $3, $4)', [row.id, user.id, title || 'Untitled', vals.content_json]);
        await c.query(`DELETE FROM post_revisions WHERE post_id = $1 AND id NOT IN (SELECT id FROM post_revisions WHERE post_id = $1 ORDER BY saved_at DESC LIMIT 25)`, [row.id]);
      }
      return row;
    });
    const live = saved.status === 'published' && new Date(saved.published_at) <= new Date();
    if (live && (contentChanged || existing?.status !== 'published')) await pingIndexNow([`${SITE_URL}blog/${saved.slug}`, `${SITE_URL}blog`]);
    json(res, 200, { post: saved, stats: { words: out.words, minutes: out.minutes, internal: out.internal, external: out.external, images: out.images.length }, live });
  },
  async 'post-delete'(req, res) {
    const b = await readJSON(req);
    await q('DELETE FROM posts WHERE id = $1', [Number(b.id)]);
    json(res, 200, { ok: true });
  },
  async 'post-duplicate'(req, res, user) {
    const b = await readJSON(req);
    const p = await one('SELECT * FROM posts WHERE id = $1', [Number(b.id)]);
    if (!p) throw fail(404, 'Post not found');
    const slug = await uniqueSlug(`${p.slug}-copy`);
    const row = await one(`INSERT INTO posts (slug, title, excerpt, content_json, content_html, toc, status, author_id, category_id, tags, cover_media_id, seo_title, seo_description, focus_keyword, faq, service_slug, word_count, reading_minutes)
      SELECT $2, title || ' (copy)', excerpt, content_json, content_html, toc, 'draft', $3, category_id, tags, cover_media_id, seo_title, seo_description, '', faq, service_slug, word_count, reading_minutes FROM posts WHERE id = $1 RETURNING id`, [p.id, slug, user.id]);
    json(res, 200, { id: row.id });
  },
  async 'preview-link'(req, res) {
    const b = await readJSON(req);
    const p = await one('SELECT slug FROM posts WHERE id = $1', [Number(b.id)]);
    if (!p) throw fail(404, 'Save the post first');
    const token = sign({ pv: 1, slug: p.slug, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3 });
    json(res, 200, { url: `/blog/${p.slug}?preview=${encodeURIComponent(token)}` });
  },
  async 'slug-check'(req, res) {
    const p = query(req);
    const slug = slugify(p.slug); const id = Number(p.id) || 0;
    const taken = !!(await one('SELECT id FROM posts WHERE slug = $1 AND id <> $2', [slug, id]));
    json(res, 200, { slug, taken, suggestion: taken ? await uniqueSlug(slug, id) : slug });
  },
  async 'keyword-check'(req, res) {
    const p = query(req);
    const kw = str(p.kw, 80).toLowerCase(); if (!kw) return json(res, 200, { posts: [] });
    const rows = (await q(`SELECT id, title, slug, status FROM posts WHERE lower(focus_keyword) = $1 AND id <> $2 LIMIT 5`, [kw, Number(p.id) || 0])).rows;
    json(res, 200, { posts: rows });
  },
  async links(req, res) {
    const p = query(req); const term = str(p.q, 80);
    const posts = (await q(`SELECT id, title, slug, status, focus_keyword FROM posts
      ${term ? `WHERE title ILIKE $1 OR slug ILIKE $1 OR focus_keyword ILIKE $1` : ''} ORDER BY (status='published') DESC, published_at DESC NULLS LAST LIMIT 30`, term ? [`%${term}%`] : [])).rows;
    const cats = (await q('SELECT name, slug FROM categories ORDER BY sort, name')).rows;
    const t = term.toLowerCase();
    const pages = STATIC_PAGES.concat(cats.map((c) => ({ url: `/blog/category/${c.slug}`, title: `Category: ${c.name}` })))
      .filter((x) => !t || x.title.toLowerCase().includes(t) || x.url.includes(t));
    json(res, 200, { pages, posts: posts.map((x) => ({ url: `/blog/${x.slug}`, title: x.title, status: x.status, id: x.id, focus_keyword: x.focus_keyword })) });
  },

  // ------------------------------------------------------------ media
  async media(req, res) {
    const p = query(req); const term = str(p.q, 80);
    const rows = (await q(`SELECT id, name, width, height, sm_width, alt, caption, size, mime, created_at,
        (SELECT count(*) FROM posts WHERE cover_media_id = media.id OR content_html LIKE '%/media/' || media.id || '-%')::int AS used
      FROM media ${term ? 'WHERE name ILIKE $1 OR alt ILIKE $1' : ''} ORDER BY created_at DESC LIMIT 300`, term ? [`%${term}%`] : [])).rows;
    json(res, 200, { media: rows.map((m) => ({ ...m, url: mediaUrl(m), small: m.sm_width ? mediaUrl(m, true) : mediaUrl(m) })) });
  },
  async 'media-upload'(req, res, user) {
    const b = await readJSON(req);
    const full = Buffer.from(String(b.full || ''), 'base64');
    const small = b.small ? Buffer.from(String(b.small), 'base64') : null;
    if (!full.length || full.length > MAX_IMG || !magicOk(full)) throw fail(400, 'Upload a JPG, PNG or WebP image under 3.5 MB');
    if (small && (small.length > MAX_IMG || !magicOk(small))) throw fail(400, 'Invalid small image');
    const w = Number(b.width), h = Number(b.height);
    if (!(w > 0 && h > 0 && w <= 5000 && h <= 5000)) throw fail(400, 'Invalid image size');
    const name = str(b.name, 100).replace(/\.[a-z0-9]+$/i, '') || 'image';
    const row = await one(`INSERT INTO media (name, mime, width, height, bytes, bytes_sm, sm_width, alt, caption, size, uploaded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, name, width, height, sm_width, alt, caption, size, mime, created_at`,
      [name, mimeOf(full), w, h, full, small, small ? Number(b.sm_width) || null : null, str(b.alt, 250), str(b.caption, 300), full.length + (small?.length || 0), user.id]);
    json(res, 200, { media: { ...row, url: mediaUrl(row), small: row.sm_width ? mediaUrl(row, true) : mediaUrl(row), used: 0 } });
  },
  async 'media-update'(req, res) {
    const b = await readJSON(req);
    const row = await one(`UPDATE media SET alt = $2, caption = $3 WHERE id = $1 RETURNING id, name, width, height, sm_width, alt, caption, size`, [Number(b.id), str(b.alt, 250), str(b.caption, 300)]);
    if (!row) throw fail(404, 'Image not found');
    json(res, 200, { media: { ...row, url: mediaUrl(row), small: row.sm_width ? mediaUrl(row, true) : mediaUrl(row) } });
  },
  async 'media-delete'(req, res) {
    const b = await readJSON(req); const id = Number(b.id);
    const used = await one(`SELECT count(*)::int AS n FROM posts WHERE cover_media_id = $1 OR content_html LIKE '%/media/' || $1 || '-%'`, [id]);
    if (used.n && !b.force) throw fail(409, `This image is used in ${used.n} post${used.n > 1 ? 's' : ''}. Remove it there first.`);
    await q('DELETE FROM media WHERE id = $1', [id]);
    json(res, 200, { ok: true });
  },

  // ------------------------------------------------------------ categories
  async categories(req, res) {
    const rows = (await q(`SELECT c.*, (SELECT count(*) FROM posts p WHERE p.category_id = c.id)::int AS n FROM categories c ORDER BY sort, name`)).rows;
    json(res, 200, { categories: rows });
  },
  async 'category-save'(req, res) {
    const b = await readJSON(req);
    const name = str(b.name, 60); if (!name) throw fail(400, 'Category needs a name');
    const slug = slugify(b.slug || name, 60);
    const dupe = await one('SELECT id FROM categories WHERE slug = $1 AND id <> $2', [slug, Number(b.id) || 0]);
    if (dupe) throw fail(409, 'Another category already uses that URL');
    const vals = [name, slug, str(b.description, 400), str(b.seo_title, 120), str(b.seo_description, 320), SERVICES.some((s) => s.slug === b.service_slug) ? b.service_slug : '', Number(b.sort) || 0];
    const row = b.id
      ? await one('UPDATE categories SET name=$2, slug=$3, description=$4, seo_title=$5, seo_description=$6, service_slug=$7, sort=$8 WHERE id=$1 RETURNING *', [Number(b.id), ...vals])
      : await one('INSERT INTO categories (name, slug, description, seo_title, seo_description, service_slug, sort) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', vals);
    json(res, 200, { category: row });
  },
  async 'category-delete'(req, res) {
    const b = await readJSON(req);
    await q('DELETE FROM categories WHERE id = $1', [Number(b.id)]);
    json(res, 200, { ok: true });
  },

  // ------------------------------------------------------------ team / account
  async users(req, res) {
    json(res, 200, { users: (await q(`SELECT u.id, u.email, u.name, u.role, u.bio, u.job_title, u.avatar_media_id, u.created_at,
      (SELECT count(*) FROM posts p WHERE p.author_id = u.id)::int AS posts FROM users u ORDER BY u.id`)).rows });
  },
  async 'user-save'(req, res, user) {
    const b = await readJSON(req);
    const id = Number(b.id) || 0;
    const self = id === user.id;
    if (!self && user.role !== 'owner') throw fail(403, 'Only the owner can manage the team');
    const email = str(b.email, 200).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw fail(400, 'Enter a valid email');
    const name = str(b.name, 80); if (!name) throw fail(400, 'Enter a name');
    if (await one('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id])) throw fail(409, 'That email is already on the team');
    const role = user.role === 'owner' && !self && b.role === 'owner' ? 'owner' : (self ? user.role : 'editor');
    if (!id) {
      if (String(b.password || '').length < 10) throw fail(400, 'Password must be at least 10 characters');
      const row = await one(`INSERT INTO users (email, name, password_hash, role, bio, job_title) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, name, role, bio, job_title`,
        [email, name, await hashPassword(b.password), role, str(b.bio, 600), str(b.job_title, 80)]);
      return json(res, 200, { user: row });
    }
    const row = await one(`UPDATE users SET email=$2, name=$3, role=$4, bio=$5, job_title=$6, avatar_media_id=$7 WHERE id=$1 RETURNING id, email, name, role, bio, job_title, avatar_media_id`,
      [id, email, name, role, str(b.bio, 600), str(b.job_title, 80), Number(b.avatar_media_id) || null]);
    json(res, 200, { user: row });
  },
  async 'user-delete'(req, res, user) {
    const b = await readJSON(req); const id = Number(b.id);
    if (user.role !== 'owner') throw fail(403, 'Only the owner can remove people');
    if (id === user.id) throw fail(400, "You can't remove yourself");
    await q('UPDATE posts SET author_id = $2 WHERE author_id = $1', [id, user.id]);
    await q('DELETE FROM users WHERE id = $1', [id]);
    json(res, 200, { ok: true });
  },
  async password(req, res, user) {
    const b = await readJSON(req);
    const row = await one('SELECT password_hash FROM users WHERE id = $1', [user.id]);
    if (!(await verifyPassword(b.current, row.password_hash))) throw fail(400, 'Current password is wrong');
    if (String(b.next || '').length < 10) throw fail(400, 'New password must be at least 10 characters');
    const u = await one('UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1 RETURNING id, token_version', [user.id, await hashPassword(b.next)]);
    json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(u, isSecure(req)) }); // other devices are signed out
  },
};

const PUBLIC = new Set(['login', 'logout']);
const READS = new Set(['me', 'stats', 'posts', 'post', 'revision', 'slug-check', 'keyword-check', 'links', 'media', 'categories', 'users']);

export default async function handler(req, res) {
  const action = String(query(req).action || '').replace(/[^a-z-]/g, '');
  const fn = ACTIONS[action];
  try {
    if (!hasDb()) throw fail(503, 'Database not configured: set DATABASE_URL in Vercel and redeploy.');
    if (!SESSION_SECRET) throw fail(503, 'SESSION_SECRET is not set in Vercel.');
    if (!fn) throw fail(404, 'Unknown action');
    const isRead = READS.has(action);
    if (isRead ? req.method !== 'GET' : req.method !== 'POST') throw fail(405, 'Method not allowed');
    if (!isRead) checkCsrf(req);
    let user = null;
    if (!PUBLIC.has(action)) {
      user = await currentUser(req);
      if (!user) throw fail(401, 'Please sign in');
    }
    await fn(req, res, user);
  } catch (e) {
    const status = e.status || (e.code === 'NO_SECRET' || e.code === 'NO_DB' ? 503 : 500);
    if (status >= 500) console.error('[admin]', action, clientIp(req), e);
    json(res, status, { error: e.expose || status < 500 || e.code ? e.message : 'Something went wrong. Try again.' });
  }
}
