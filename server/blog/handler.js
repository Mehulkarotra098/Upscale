// Public blog, server-rendered and cached at Vercel's edge. vercel.json rewrites these URLs to /api/blog:
//   /blog                         → view=index          /blog/page/N            → view=index&page=N
//   /blog/category/<c>[/page/N]   → view=index&category  /blog/<slug>            → view=post&slug
//   /blog/rss.xml                 → view=rss            /sitemap-blog.xml       → view=sitemap
//   /indexnow-key.txt             → view=indexnow       daily cron              → view=ping
// The read counter beacon posts to view=hit.
import { CRON_SECRET, INDEXNOW_KEY } from '../config.js';
import { verify } from '../auth/tokens.js';
import { hasDb, one } from '../db/client.js';
import { CACHE, html, json, query, redirect, send, text } from '../lib/http.js';
import { log } from '../lib/log.js';
import * as categories from '../repos/categories.js';
import * as posts from '../repos/posts.js';
import { renderArticle } from './render/article.js';
import { renderRss, renderSitemap } from './render/feeds.js';
import { renderListing } from './render/listing.js';
import { renderComingSoon, renderNotFound } from './render/simple.js';
import { fillShell, getShell } from './shell.js';

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless/i;
const PER_PAGE = 9;

const page = async (req, res, status, rendered, cache = CACHE.page, headers) =>
  html(res, status, fillShell(await getShell(req), rendered), cache, headers);
const notFoundPage = (req, res) => page(req, res, 404, renderNotFound(), CACHE.missing);

/** A valid preview token for this slug lets drafts and scheduled posts render (never cached). */
function previewAllowed(token, slug) {
  const claims = token ? verify(token) : null;
  return Boolean(claims?.pv && claims.slug === slug);
}

const VIEWS = {
  async hit(req, res, p) {
    if (req.method === 'POST' && !BOTS.test(req.headers['user-agent'] || '')) {
      await posts.countView(Number(p.id) || 0).catch((err) => log.warn('blog', 'read count failed', { err }));
    }
    send(res, 204, '', { 'Cache-Control': CACHE.none });
  },

  async indexnow(req, res) {
    if (INDEXNOW_KEY) text(res, 200, INDEXNOW_KEY, 'text/plain', 'public, max-age=86400');
    else text(res, 404, 'Not found', 'text/plain', CACHE.missing);
  },

  /** Daily Vercel cron. A query keeps the free Supabase project from pausing after 7 idle days. */
  async ping(req, res) {
    if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`)
      return text(res, 401, 'Unauthorized', 'text/plain', CACHE.none);
    await one('SELECT 1');
    return text(res, 200, 'ok', 'text/plain', CACHE.none);
  },

  async rss(req, res) {
    text(res, 200, renderRss(await posts.feedRows()), 'application/rss+xml', CACHE.feed);
  },

  async sitemap(req, res) {
    const [rows, cats] = await Promise.all([posts.sitemapRows(), categories.list({ liveOnly: true })]);
    text(res, 200, renderSitemap(rows, cats), 'application/xml', CACHE.feed);
  },

  /** Small JSON feed of the newest posts (for a "latest articles" strip elsewhere on the site). */
  async latest(req, res, p) {
    const rows = await posts.latest(Math.min(6, Math.max(1, Number(p.n) || 3)));
    json(
      res,
      200,
      rows.map((r) => ({
        title: r.title,
        url: `/blog/${r.slug}`,
        excerpt: r.excerpt,
        date: r.published_at,
        minutes: r.reading_minutes,
        category: r.cat_name,
      })),
      { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
    );
  },

  async post(req, res, p) {
    const slug = String(p.slug || '').toLowerCase();
    const preview = previewAllowed(p.preview, slug);
    const post = await posts.bySlug(slug, { includeUnpublished: preview });
    if (!post) {
      const moved = await posts.redirectTarget(slug);
      return moved ? redirect(res, `/blog/${moved}`, 301) : notFoundPage(req, res);
    }
    const related = await posts.related(post, 3);
    return page(req, res, 200, renderArticle({ post, related, preview }), preview ? 'private, no-store' : CACHE.page);
  },

  async index(req, res, p) {
    const pageNo = Math.max(1, Number.parseInt(p.page || '1', 10) || 1);
    const category = p.category ? await categories.bySlug(String(p.category).toLowerCase()) : null;
    if (p.category && !category) return notFoundPage(req, res);
    const base = category ? `/blog/category/${category.slug}` : '/blog';
    if (p.page === '1') return redirect(res, base, 301);
    const [list, cats] = await Promise.all([
      posts.listLive({ page: pageNo, per: PER_PAGE, categorySlug: category?.slug }),
      categories.list({ liveOnly: true }),
    ]);
    if (pageNo > list.pages) return notFoundPage(req, res);
    return page(
      req,
      res,
      200,
      renderListing({ posts: list.rows, page: pageNo, pages: list.pages, total: list.total, categories: cats, category }),
    );
  },
};

const NEEDS_DB = new Set(['ping', 'rss', 'sitemap', 'latest', 'post', 'index']);
const MACHINE = new Set(['ping', 'rss', 'sitemap', 'latest']);

export default async function blogHandler(req, res) {
  const p = query(req);
  const name = p.view || (p.slug ? 'post' : 'index');
  const view = Object.hasOwn(VIEWS, name) ? VIEWS[name] : null;
  try {
    if (!view) return notFoundPage(req, res);
    if (NEEDS_DB.has(name) && !hasDb()) {
      // Not set up yet: people get a friendly page, machines a 404.
      return MACHINE.has(name)
        ? text(res, 404, 'Not found', 'text/plain', CACHE.none)
        : page(req, res, 200, renderComingSoon(), CACHE.missing);
    }
    return await view(req, res, p);
  } catch (err) {
    log.error('blog', 'render failed', { view: name, url: req.url, err });
    if (res.headersSent) return undefined;
    if (MACHINE.has(name)) return text(res, 503, 'Unavailable', 'text/plain', CACHE.none, { 'Retry-After': '60' });
    const soon = renderComingSoon();
    return page(
      req,
      res,
      503,
      { ...soon, head: soon.head.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">') },
      CACHE.none,
      { 'Retry-After': '60' },
    );
  }
}
