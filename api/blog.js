// Public blog: /blog, /blog/page/N, /blog/category/<slug>[/page/N], /blog/<slug>, /blog/rss.xml, /sitemap-blog.xml
// (all mapped here by rewrites in vercel.json). Pages are server-rendered and cached at Vercel's edge.
import { hasDb } from '../server/db.js';
import { query, html, send, redirect, json } from '../server/http.js';
import { getShell, fill } from '../server/shell.js';
import * as S from '../server/store.js';
import * as R from '../server/render.js';
import { unsign } from '../server/auth.js';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless/i;

export default async function handler(req, res) {
  const p = query(req);
  const view = p.view || (p.slug ? 'post' : 'index');
  try {
    if (view === 'hit') { // read counter (beacon from blog.js)
      if (req.method === 'POST' && hasDb() && !BOT.test(req.headers['user-agent'] || '')) await S.countView(Number(p.id) || 0).catch(() => {});
      return send(res, 204, '', { 'Cache-Control': 'no-store' });
    }
    if (view === 'indexnow') { // IndexNow key file (served at /indexnow-key.txt)
      const key = (process.env.INDEXNOW_KEY || '').trim();
      return key ? send(res, 200, key, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }) : send(res, 404, 'Not found');
    }
    if (view === 'ping') { // daily Vercel cron: keeps the free Supabase project from auto-pausing after 7 idle days
      const secret = process.env.CRON_SECRET;
      if (secret && req.headers.authorization !== `Bearer ${secret}`) return send(res, 401, 'Unauthorized');
      if (hasDb()) { const { q } = await import('../server/db.js'); await q('select 1'); }
      return send(res, 200, 'ok', { 'Cache-Control': 'no-store' });
    }
    if (!hasDb()) {
      if (view === 'rss' || view === 'sitemap') return send(res, 404, '', { 'Cache-Control': 'no-store' });
      const shell = await getShell(req); const r = R.renderSetup();
      return html(res, 200, fill(shell, r.head, r.main), 'public, max-age=0, s-maxage=60');
    }
    if (view === 'rss') {
      return send(res, 200, R.renderRss(await S.feedRows()), { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400' });
    }
    if (view === 'sitemap') {
      const [rows, cats] = await Promise.all([S.sitemapRows(), S.categoriesWithCounts()]);
      return send(res, 200, R.renderSitemap(rows, cats), { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400' });
    }
    if (view === 'latest') { // small JSON feed (e.g. for a "latest articles" strip)
      const { rows } = await S.listPosts({ page: 1, per: Math.min(6, Number(p.n) || 3) });
      return json(res, 200, rows.map((r) => ({ title: r.title, url: `/blog/${r.slug}`, excerpt: r.excerpt, date: r.published_at, minutes: r.reading_minutes, category: r.cat_name })),
        { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' });
    }
    const shell = await getShell(req);

    if (view === 'post') {
      const slug = String(p.slug).toLowerCase();
      let preview = false; let post = null;
      if (p.preview) {
        const t = (() => { try { return unsign(p.preview); } catch { return null; } })();
        if (t && t.pv && t.slug === slug) { post = await S.getPostBySlug(slug, { includeDrafts: true }); preview = !!post; }
      }
      if (!post) post = await S.getPostBySlug(slug);
      if (!post) {
        const moved = await S.redirectFor(slug);
        if (moved) return redirect(res, `/blog/${moved.slug}`, 301);
        const r = R.renderNotFound();
        return html(res, 404, fill(shell, r.head, r.main), 'public, max-age=0, s-maxage=60');
      }
      const related = await S.relatedPosts(post, 3);
      const r = R.renderPost({ post, related, preview });
      return html(res, 200, fill(shell, r.head, r.main), preview ? 'private, no-store' : undefined);
    }

    // index / category
    const page = Math.max(1, parseInt(p.page || '1', 10) || 1);
    let category = null;
    if (p.category) {
      category = await S.getCategory(String(p.category).toLowerCase());
      if (!category) { const r = R.renderNotFound(); return html(res, 404, fill(shell, r.head, r.main), 'public, max-age=0, s-maxage=60'); }
    }
    if (p.page === '1') return redirect(res, category ? `/blog/category/${category.slug}` : '/blog', 301);
    const [list, cats] = await Promise.all([S.listPosts({ page, category: category?.slug }), S.categoriesWithCounts()]);
    if (page > list.pages) { const r = R.renderNotFound(); return html(res, 404, fill(shell, r.head, r.main), 'public, max-age=0, s-maxage=60'); }
    const r = R.renderIndex({ posts: list.rows, page, pages: list.pages, total: list.total, cats, category });
    return html(res, 200, fill(shell, r.head, r.main));
  } catch (e) {
    console.error('[blog]', e);
    if (view === 'rss' || view === 'sitemap' || view === 'latest') return send(res, 503, '', { 'Cache-Control': 'no-store', 'Retry-After': '60' });
    const shell = await getShell(req).catch(() => '<!--HEAD--><!--MAIN-->'); const r = R.renderSetup();
    return html(res, 503, fill(shell, r.head.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">'), r.main), 'no-store', { 'Retry-After': '60' });
  }
}
