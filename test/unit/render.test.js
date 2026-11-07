import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.SITE_URL = 'https://uscale.in';
const { renderArticle } = await import('../../server/blog/render/article.js');
const { renderRss, renderSitemap } = await import('../../server/blog/render/feeds.js');
const { renderListing } = await import('../../server/blog/render/listing.js');
const { auditCta } = await import('../../server/blog/render/parts.js');

const post = {
  id: 1,
  slug: 'hello',
  title: 'Hello </script><script>alert(1)</script> "world"',
  excerpt: 'An <b>excerpt</b>',
  content_html: '<p>Body <img src="/media/1-a.webp" srcset="/media/1-a-800.webp 800w, /media/1-a.webp 1600w"> <a href="/x">x</a></p>',
  published_at: '2026-10-01T10:00:00Z',
  content_updated_at: '2026-10-05T10:00:00Z',
  updated_at: '2026-10-05T10:00:00Z',
  reading_minutes: 3,
  word_count: 600,
  faq: [{ q: 'Q?', a: 'A <script>' }],
  tags: ['seo'],
  toc: [],
};

test('article: title and JSON-LD cannot break out of their context', () => {
  const { head, main } = renderArticle({ post, related: [] });
  assert.ok(!/<script>alert/.test(head + main), 'no injected script tag');
  const ld = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const graph = JSON.parse(ld)['@graph'];
  assert.equal(graph[0]['@type'], 'BlogPosting');
  assert.ok(graph.some((n) => n['@type'] === 'FAQPage'));
  assert.match(head, /<link rel="canonical" href="https:\/\/uscale\.in\/blog\/hello">/);
  assert.match(main, /Updated <time/);
});

test('article: every library image is an ImageObject with licence details; external images are not', () => {
  const html =
    '<figure class="bp-fig"><img src="/media/7-chart.webp" alt="A &quot;chart&quot; &amp; notes" width="2000" height="1300" loading="lazy"></figure>' +
    '<img src="/media/7-chart.webp" alt="dup" width="2000" height="1300"><img src="https://example.com/x.png" alt="ext">';
  const { head } = renderArticle({
    post: { ...post, content_html: html, cover_id: 3, cover_name: 'Cover', cover_w: 2400, cover_h: 1260, cover_alt: 'The cover' },
    related: [],
  });
  const graph = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const images = graph[0].image;
  assert.equal(images.length, 2, 'cover + one inline image (duplicate and external left out)');
  assert.equal(images[0].url, 'https://uscale.in/media/3-cover.webp');
  assert.equal(images[1].url, 'https://uscale.in/media/7-chart.webp');
  assert.equal(images[1].width, 2000);
  assert.equal(images[1].description, 'A "chart" & notes');
  for (const im of images) {
    assert.equal(im.license, 'https://uscale.in/image-license');
    assert.equal(im.acquireLicensePage, 'https://uscale.in/image-license');
    assert.equal(im.creditText, 'U Scale');
  }
});

test('article: preview pages are never indexable', () => {
  assert.match(renderArticle({ post, related: [], preview: true }).head, /<meta name="robots" content="noindex, nofollow">/);
});

test('rss: absolute links (every srcset entry), CDATA-safe', () => {
  const xml = renderRss([{ ...post, content_html: post.content_html + ']]>' }]);
  assert.match(xml, /src="https:\/\/uscale\.in\/media\/1-a\.webp"/);
  assert.match(xml, /srcset="https:\/\/uscale\.in\/media\/1-a-800\.webp 800w, https:\/\/uscale\.in\/media\/1-a\.webp 1600w"/);
  assert.match(xml, /href="https:\/\/uscale\.in\/x"/);
  assert.equal((xml.match(/<!\[CDATA\[/g) || []).length, 2, 'the ]]> inside content splits into two CDATA sections');
});

test('sitemap lists the blog, categories with at least 3 posts, and posts with lastmod', () => {
  const xml = renderSitemap(
    [{ slug: 'hello', lastmod: '2026-10-05T10:00:00Z', cover_id: 3, cover_name: 'Cover' }],
    [
      { slug: 'seo', n: 3 },
      { slug: 'thin', n: 2 },
      { slug: 'empty', n: 0 },
    ],
  );
  assert.match(xml, /<loc>https:\/\/uscale\.in\/blog<\/loc><lastmod>2026-10-05T10:00:00\.000Z<\/lastmod>/);
  assert.match(xml, /blog\/category\/seo/);
  assert.ok(!xml.includes('category/thin'), 'thin category (under 3 posts) is left out');
  assert.ok(!xml.includes('category/empty'));
  assert.match(xml, /<image:loc>https:\/\/uscale\.in\/media\/3-cover\.webp<\/image:loc>/);
});

test('listing: empty state, pagination links', () => {
  const empty = renderListing({ posts: [], page: 1, pages: 1, total: 0, categories: [] });
  assert.match(empty.main, /first articles are on the way/);
  const p2 = renderListing({ posts: [{ ...post, cover_id: null }], page: 2, pages: 3, total: 20, categories: [] });
  assert.match(p2.head, /<link rel="prev" href="https:\/\/uscale\.in\/blog">/);
  assert.match(p2.head, /<link rel="next" href="https:\/\/uscale\.in\/blog\/page\/3">/);
  assert.match(p2.head, /\(page 2\) \| U Scale<\/title>/);
});

test('listing: category pages under 3 posts are noindex, follow; fuller ones and /blog keep the site robots', () => {
  const cat = { slug: 'seo', name: 'SEO' };
  const one = [{ ...post, cover_id: null }];
  const thin = renderListing({ posts: one, page: 1, pages: 1, total: 2, categories: [], category: cat });
  assert.match(thin.head, /<meta name="robots" content="noindex, follow">/);
  const full = renderListing({ posts: one, page: 1, pages: 1, total: 3, categories: [], category: cat });
  assert.ok(!/content="noindex/.test(full.head));
  const blog = renderListing({ posts: one, page: 1, pages: 1, total: 1, categories: [] });
  assert.ok(!/content="noindex/.test(blog.head));
});

test('CTA heading gets the green dot only without its own punctuation', () => {
  assert.ok(!auditCta({ title: 'Online?' }).includes('class="dot"'));
  assert.ok(auditCta({ title: 'Get found' }).includes('class="dot"'));
});
