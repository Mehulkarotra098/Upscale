// RSS feed (/blog/rss.xml) and the blog sitemap (/sitemap-blog.xml).
import { BRAND, SITE_URL } from '../../config.js';
import { esc, isoDate } from '../../lib/text.js';
import { mediaUrl } from '../../media/urls.js';
import { abs, BLOG_DESC } from './parts.js';

/** Root-relative links and images become absolute, so feed readers can load them. */
const absolutize = (html) =>
  String(html)
    .replace(/(src|href)="\//g, `$1="${SITE_URL}`)
    .replace(/(srcset="[^"]*)/g, (m) => m.replace(/(^srcset="|, )\//g, `$1${SITE_URL}`));
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export function renderRss(rows) {
  const items = rows
    .map(
      (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${abs(`blog/${p.slug}`)}</link>
  <guid isPermaLink="true">${abs(`blog/${p.slug}`)}</guid>
  <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
  ${p.cat_name ? `<category>${esc(p.cat_name)}</category>` : ''}
  <dc:creator>${esc(p.author_name || BRAND.author)}</dc:creator>
  <description>${esc(p.excerpt || '')}</description>
  <content:encoded>${cdata(absolutize(p.content_html))}</content:encoded>
  ${p.cover_id ? `<enclosure url="${abs(mediaUrl({ id: p.cover_id, name: p.cover_name }))}" type="image/webp" length="0"/>` : ''}
</item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${esc(BRAND.blogName)}</title>
  <link>${abs('blog')}</link>
  <atom:link href="${abs('blog/rss.xml')}" rel="self" type="application/rss+xml"/>
  <description>${esc(BLOG_DESC)}</description>
  <language>en-in</language>
  ${rows[0] ? `<lastBuildDate>${new Date(rows[0].published_at).toUTCString()}</lastBuildDate>` : ''}
${items}
</channel>
</rss>`;
}

/** @param rows indexable live posts (repos/posts.sitemapRows) @param categories with live post counts */
export function renderSitemap(rows, categories) {
  const newest = rows[0]?.lastmod;
  const urls = [
    `<url><loc>${abs('blog')}</loc>${newest ? `<lastmod>${isoDate(newest)}</lastmod>` : ''}</url>`,
    ...categories.filter((c) => c.n > 0).map((c) => `<url><loc>${abs(`blog/category/${c.slug}`)}</loc></url>`),
    ...rows.map(
      (r) =>
        `<url><loc>${abs(`blog/${r.slug}`)}</loc><lastmod>${isoDate(r.lastmod)}</lastmod>${
          r.cover_id ? `<image:image><image:loc>${abs(mediaUrl({ id: r.cover_id, name: r.cover_name }))}</image:loc></image:image>` : ''
        }</url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}
