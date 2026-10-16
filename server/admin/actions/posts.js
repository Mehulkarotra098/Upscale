// Writing and managing posts.
import { IS_PROD, INDEXNOW_KEY, LIMITS, SERVICE_SLUGS, SITE_URL, STATIC_PAGES } from '../../config.js';
import { expiresIn, sign } from '../../auth/tokens.js';
import { processContent, referencedMedia } from '../../content/article.js';
import { badRequest, notFound, tooLarge } from '../../lib/errors.js';
import { log } from '../../lib/log.js';
import { excerpt } from '../../lib/text.js';
import * as categories from '../../repos/categories.js';
import * as media from '../../repos/media.js';
import * as posts from '../../repos/posts.js';
import * as input from '../input.js';

async function pingIndexNow(urls) {
  if (!INDEXNOW_KEY || !IS_PROD) return;
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}indexnow-key.txt`, urlList: urls }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    log.warn('indexnow', 'ping failed', { err });
  }
}

const isLive = (row) => row.status === 'published' && new Date(row.published_at) <= new Date();

export default {
  posts: {
    method: 'GET',
    async run({ params }) {
      const rows = await posts.adminList({ status: params.status, term: input.text(params.q, 80), categoryId: input.id(params.category) });
      return { posts: rows };
    },
  },

  post: {
    method: 'GET',
    async run({ params }) {
      const postId = input.requireId(params.id, 'post');
      const post = await posts.forEditor(postId);
      if (!post) throw notFound('Post not found');
      return { post, revisions: await posts.revisions(postId) };
    },
  },

  revision: {
    method: 'GET',
    async run({ params }) {
      const rev = await posts.revision(input.requireId(params.id, 'revision'));
      if (!rev) throw notFound('Revision not found');
      return { revision: rev };
    },
  },

  save: {
    method: 'POST',
    async run({ body, user }) {
      const postId = input.id(body.id);
      const existing = postId ? await posts.byId(postId) : null;
      if (postId && !existing) throw notFound('Post not found');

      const title = input.text(body.title, 200);
      const status = input.oneOf(body.status, ['draft', 'published'], 'draft');
      if (status === 'published' && !title) throw badRequest('Add a title before publishing');

      const raw = String(body.content_html ?? '');
      if (raw.length > LIMITS.articleHtmlChars) throw tooLarge('This article is too long to save');
      const article = processContent(raw, await media.dimensions(referencedMedia(raw)));

      let publishedAt = input.date(body.published_at);
      if (status === 'published' && !publishedAt) publishedAt = existing?.published_at ?? new Date();
      const contentJson = body.content_json && typeof body.content_json === 'object' ? JSON.stringify(body.content_json) : null;

      const values = {
        slug: await posts.uniqueSlug(input.text(body.slug, 90) || title || `draft-${Date.now()}`, postId ?? 0),
        title,
        excerpt: input.text(body.excerpt, 320) || excerpt(article.lead, 160),
        content_json: contentJson,
        content_html: article.html,
        toc: JSON.stringify(article.toc),
        status,
        published_at: publishedAt,
        author_id: input.id(body.author_id) ?? existing?.author_id ?? user.id,
        category_id: input.id(body.category_id),
        tags: input.tags(body.tags),
        cover_media_id: input.id(body.cover_media_id),
        seo_title: input.text(body.seo_title, 120),
        seo_description: input.text(body.seo_description, 320),
        focus_keyword: input.text(body.focus_keyword, 80).toLowerCase(),
        canonical_url: input.httpsUrl(body.canonical_url),
        noindex: input.bool(body.noindex),
        faq: JSON.stringify(input.faq(body.faq)),
        service_slug: SERVICE_SLUGS.has(body.service_slug) ? body.service_slug : '',
        word_count: article.words,
        reading_minutes: article.minutes,
      };
      const contentChanged = !existing || existing.content_html !== article.html || existing.title !== title;
      const publishing = status === 'published' && existing?.status !== 'published';

      const saved = await posts.save({
        id: postId,
        values,
        mediaIds: article.images,
        userId: user.id,
        contentChanged,
        forceRevision: publishing,
      });

      const live = isLive(saved);
      if (live && (contentChanged || publishing)) await pingIndexNow([`${SITE_URL}blog/${saved.slug}`, `${SITE_URL}blog`]);
      return {
        post: saved,
        live,
        stats: {
          words: article.words,
          minutes: article.minutes,
          internal: article.internal,
          external: article.external,
          images: article.images.length,
        },
      };
    },
  },

  'post-delete': {
    method: 'POST',
    async run({ body }) {
      if (!(await posts.remove(input.requireId(body.id, 'post')))) throw notFound('Post not found');
      return { ok: true };
    },
  },

  'post-duplicate': {
    method: 'POST',
    async run({ body, user }) {
      const sourceId = input.requireId(body.id, 'post');
      const slug = await posts.slugOf(sourceId);
      if (!slug) throw notFound('Post not found');
      const row = await posts.duplicate(sourceId, await posts.uniqueSlug(`${slug}-copy`), user.id);
      return { id: row.id };
    },
  },

  'preview-link': {
    method: 'POST',
    async run({ body }) {
      const slug = await posts.slugOf(input.requireId(body.id, 'post'));
      if (!slug) throw notFound('Save the post first');
      const token = sign({ pv: 1, slug, exp: expiresIn(LIMITS.previewDays * 24 * 60 * 60) });
      return { url: `/blog/${slug}?preview=${encodeURIComponent(token)}` };
    },
  },

  'keyword-check': {
    method: 'GET',
    async run({ params }) {
      const keyword = input.text(params.kw, 80).toLowerCase();
      return { posts: keyword ? await posts.sameKeyword(keyword, input.id(params.id) ?? 0) : [] };
    },
  },

  /** Internal-link search for the editor: site pages, categories and posts. */
  links: {
    method: 'GET',
    async run({ params }) {
      const term = input.text(params.q, 80);
      const needle = term.toLowerCase();
      const [rows, cats] = await Promise.all([posts.linkTargets(term), categories.list()]);
      const pages = STATIC_PAGES.concat(cats.map((c) => ({ url: `/blog/category/${c.slug}`, title: `Category: ${c.name}` }))).filter(
        (p) => !needle || p.title.toLowerCase().includes(needle) || p.url.includes(needle),
      );
      return {
        pages,
        posts: rows.map((p) => ({ id: p.id, url: `/blog/${p.slug}`, title: p.title, status: p.status, focus_keyword: p.focus_keyword })),
      };
    },
  },
};
