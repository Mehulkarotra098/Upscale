// HTML for the public blog: index (with category + pagination), article, 404, "coming soon", RSS and the blog sitemap.
import { SITE_URL, ROBOTS, BRAND, SERVICES } from './config.js';
import { esc, fmtDate, isoDate } from './http.js';
import { mediaUrl, plainExcerpt } from './content.js';

const abs = (p) => SITE_URL + String(p).replace(/^\//, '');
const BLOG_TITLE = 'Blog: website, SEO & growth tips for Indian businesses | U Scale';
const BLOG_DESC = 'Practical guides on websites, Google rankings, social media, ads and AI search for Mumbai and Indian businesses, from Mehul Karotra at U Scale.';
const DEFAULT_OG = abs('og-image.png');
const ARW = '<span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
const ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>';

const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function head({ title, desc, url, image = DEFAULT_OG, imageAlt = 'U Scale by Mehul Karotra', type = 'website', robots = ROBOTS, extra = '', ld = [] }) {
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${esc(robots)}">
<meta name="author" content="${esc(BRAND.author)}">
<link rel="canonical" href="${esc(url)}">
<link rel="alternate" hreflang="en-IN" href="${esc(url)}">
<link rel="alternate" hreflang="x-default" href="${esc(url)}">
<link rel="alternate" type="application/rss+xml" title="${esc(BRAND.blogName)}" href="${abs('blog/rss.xml')}">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
${extra}${ld.map(jsonld).join('\n')}`;
}

const crumbs = (items, dark = true) => `<nav class="crumbs${dark ? '' : ' crumbs--light'}" aria-label="Breadcrumb"><ol>${items.map(([label, href], i) =>
  i === items.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join('')}</ol></nav>`;

const crumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href) })),
});

const ORG = { '@type': 'Organization', '@id': abs('#org'), name: 'U Scale', url: SITE_URL, logo: { '@type': 'ImageObject', url: abs('icon-512.png'), width: 512, height: 512 }, sameAs: BRAND.sameAs };

function coverImg(p, { eager = false, cls = '', sizes = '(max-width: 760px) 100vw, 420px' } = {}) {
  if (!p.cover_id) return `<span class="bcard__ph" aria-hidden="true"><b>${esc((p.cat_name || 'U Scale').slice(0, 18))}</b></span>`;
  const m = { id: p.cover_id, name: p.cover_name };
  const srcset = p.cover_sm_w ? ` srcset="${mediaUrl(m, true)} ${p.cover_sm_w}w, ${mediaUrl(m)} ${p.cover_w}w" sizes="${sizes}"` : '';
  return `<img${cls ? ` class="${cls}"` : ''} src="${p.cover_sm_w ? mediaUrl(m, true) : mediaUrl(m)}"${srcset} width="${p.cover_w}" height="${p.cover_h}" alt="${esc(p.cover_alt || '')}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
}

function card(p, { hTag = 'h3', featured = false, eager = false } = {}) {
  const date = p.published_at;
  return `<article class="bcard${featured ? ' bcard--feat' : ''}">
  <a class="bcard__link" href="/blog/${esc(p.slug)}">
    <span class="bcard__img">${coverImg(p, { eager, sizes: featured ? '(max-width: 900px) 100vw, 640px' : undefined })}</span>
    <span class="bcard__body">
      <span class="bcard__meta">${p.cat_name ? `<span class="bchip">${esc(p.cat_name)}</span>` : ''}<span>${p.reading_minutes} min read</span></span>
      <${hTag} class="bcard__title">${esc(p.title)}</${hTag}>
      ${p.excerpt ? `<span class="bcard__ex">${esc(p.excerpt)}</span>` : ''}
      <span class="bcard__date"><time datetime="${isoDate(date)}">${fmtDate(date)}</time><span class="bcard__go" aria-hidden="true">Read ${ARW}</span></span>
    </span>
  </a>
</article>`;
}

function auditCta(title = 'Is your business easy to find online?', lead = 'Get a free audit of your website, Google listing and social media. I reply within 24 hours, usually faster on WhatsApp.') {
  return `<section class="cta sp-cta bp-endcta" aria-labelledby="cta-title">
  <div class="wrap"><div class="panel on-dark" data-tone="dark"><span class="grain" aria-hidden="true"></span>
    <div class="cta__copy">
      <h2 class="sp-cta__title" id="cta-title">${esc(title)}${/[?!.]$/.test(title) ? '' : '<span class="dot">.</span>'}</h2>
      <p class="lead">${esc(lead)}</p>
      <div class="cta__btns" data-wa-zone>
        <a class="btn btn--go" href="/#contact" data-intent="audit" data-magnetic>Get a free audit ${ARW}</a>
        <a class="btn btn--ghost" href="${esc(BRAND.wa)}" target="_blank" rel="noopener" data-magnetic>Chat on WhatsApp</a>
      </div>
    </div>
  </div></div>
</section>`;
}

function catNav(cats, active) {
  const live = cats.filter((c) => c.n > 0);
  if (!live.length) return '';
  return `<nav class="bcats" aria-label="Blog categories"><ul>
  <li><a href="/blog"${!active ? ' aria-current="page"' : ''}>All</a></li>
  ${live.map((c) => `<li><a href="/blog/category/${esc(c.slug)}"${active === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)} <small>${c.n}</small></a></li>`).join('')}
</ul></nav>`;
}

function pager(base, page, pages) {
  if (pages <= 1) return '';
  const href = (n) => (n === 1 ? base : `${base}/page/${n}`);
  let out = '';
  for (let n = 1; n <= pages; n++) out += n === page ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${href(n)}">${n}</a></li>`;
  return `<nav class="bpager" aria-label="Pagination"><ul>
  ${page > 1 ? `<li><a href="${href(page - 1)}" rel="prev">← Newer</a></li>` : ''}${out}${page < pages ? `<li><a href="${href(page + 1)}" rel="next">Older →</a></li>` : ''}
</ul></nav>`;
}

// ------------------------------------------------------------------ index / category
export function renderIndex({ posts, page, pages, total, cats, category = null }) {
  const base = category ? `/blog/category/${category.slug}` : '/blog';
  const url = abs(page > 1 ? `${base.slice(1)}/page/${page}` : base.slice(1));
  const titleBase = category ? (category.seo_title || `${category.name}: guides and tips | U Scale Blog`) : BLOG_TITLE;
  const title = page > 1 ? `${titleBase.replace(/ \| U Scale.*$/, '')} (page ${page}) | U Scale` : titleBase;
  const desc = category ? (category.seo_description || category.description || `${category.name} articles from U Scale: practical, no-jargon advice for Indian businesses.`) : BLOG_DESC;
  const bc = [['Home', '/'], ['Blog', '/blog']].concat(category ? [[category.name, base]] : []);
  const items = posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`blog/${p.slug}`), datePublished: isoDate(p.published_at),
    ...(p.cover_id ? { image: abs(mediaUrl({ id: p.cover_id, name: p.cover_name }).slice(1)) } : {}) }));
  const ld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': category ? 'CollectionPage' : 'Blog', '@id': url + '#page', url, name: category ? category.name : BRAND.blogName, description: desc, inLanguage: 'en-IN', publisher: { '@id': abs('#org') },
      ...(category ? { mainEntity: { '@type': 'ItemList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: it.url })) } } : { blogPost: items }) },
    ORG, crumbLd(bc)] }];
  const extra = (page > 1 ? `<link rel="prev" href="${abs((page === 2 ? base : `${base}/page/${page - 1}`).slice(1))}">\n` : '')
    + (page < pages ? `<link rel="next" href="${abs(`${base}/page/${page + 1}`.slice(1))}">\n` : '')
    + (posts[0]?.cover_id && page === 1 ? `<link rel="preload" as="image" href="${mediaUrl({ id: posts[0].cover_id, name: posts[0].cover_name }, !!posts[0].cover_sm_w)}" fetchpriority="high">\n` : '');
  const h1 = category ? category.name : 'The U Scale Blog';
  const lead = category ? (category.description || desc) : 'Plain-English guides to getting found on Google, winning on social media and turning visitors into customers. Written for Indian business owners, from real client work.';
  const [first, ...rest] = posts;
  const list = !posts.length
    ? `<div class="bempty"><p class="eyebrow">Coming soon</p><h2 class="h2">The first articles are on the way.</h2><p>Meanwhile, get a free audit and see exactly what's holding your business back online.</p><a class="btn btn--go" href="/#contact" data-intent="audit">Get a free audit ${ARW}</a></div>`
    : `${page === 1 && first ? `<div class="bfeat">${card(first, { hTag: 'h2', featured: true, eager: true })}</div>` : ''}
       <div class="bgrid">${(page === 1 ? rest : posts).map((p, i) => card(p, { hTag: page === 1 ? 'h3' : 'h2', eager: page > 1 && i < 2 })).join('')}</div>
       ${pager(base, page, pages)}`;
  const main = `<div class="wrap hero-shell">
  <section class="sp-hero bp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
    ${crumbs(bc)}
    <h1 class="sp-hero__title" id="page-title">${esc(h1)}<span class="dot">.</span></h1>
    <p class="sp-hero__lead">${esc(lead)}</p>
    ${catNav(cats, category?.slug)}
  </section>
</div>
<section class="section bp-list" aria-label="${esc(category ? `${category.name} articles` : 'Latest articles')}">
  <div class="wrap">${total ? `<p class="bcount">${total} article${total === 1 ? '' : 's'}${page > 1 ? ` · page ${page} of ${pages}` : ''}</p>` : ''}${list}</div>
</section>
${auditCta()}`;
  return { head: head({ title, desc, url, ld, extra }), main };
}

// ------------------------------------------------------------------ article
export function renderPost({ post, related, preview = false }) {
  const url = abs(`blog/${post.slug}`);
  const canonical = post.canonical_url || url;
  const title = post.seo_title || `${post.title} | U Scale`;
  const desc = post.seo_description || post.excerpt || plainExcerpt(post.content_html.replace(/<[^>]+>/g, ' '));
  const cover = post.cover_id ? { id: post.cover_id, name: post.cover_name } : null;
  const coverAbs = cover ? abs(mediaUrl(cover).slice(1)) : DEFAULT_OG;
  const published = post.published_at || post.updated_at;
  const modified = post.content_updated_at > published ? post.content_updated_at : published;
  const updated = new Date(modified) - new Date(published) > 86400000;
  const author = post.author_name || BRAND.author;
  const bc = [['Home', '/'], ['Blog', '/blog']].concat(post.cat_slug ? [[post.cat_name, `/blog/category/${post.cat_slug}`]] : []).concat([[post.title, `/blog/${post.slug}`]]);
  const faq = (post.faq || []).filter((f) => f && f.q && f.a);
  const service = SERVICES.find((s) => s.slug === (post.service_slug || post.cat_service));

  const graph = [
    { '@type': 'BlogPosting', '@id': url + '#article', mainEntityOfPage: { '@type': 'WebPage', '@id': url }, headline: post.title.slice(0, 110), description: desc,
      image: cover ? [{ '@type': 'ImageObject', url: coverAbs, width: post.cover_w, height: post.cover_h }] : [DEFAULT_OG],
      datePublished: isoDate(published), dateModified: isoDate(modified), inLanguage: 'en-IN', wordCount: post.word_count,
      timeRequired: `PT${post.reading_minutes}M`, articleSection: post.cat_name || undefined, keywords: [post.focus_keyword, ...(post.tags || [])].filter(Boolean).join(', ') || undefined,
      author: { '@type': 'Person', '@id': abs('#mehul'), name: author, url: abs('#about'), jobTitle: post.author_title || 'Founder, U Scale', sameAs: BRAND.sameAs },
      publisher: { '@id': abs('#org') } },
    ORG, crumbLd(bc),
  ];
  if (faq.length) graph.push({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

  const extra = `<meta property="article:published_time" content="${isoDate(published)}">
<meta property="article:modified_time" content="${isoDate(modified)}">
<meta property="article:author" content="${esc(author)}">
${post.cat_name ? `<meta property="article:section" content="${esc(post.cat_name)}">\n` : ''}${(post.tags || []).map((t) => `<meta property="article:tag" content="${esc(t)}">`).join('\n')}
${cover ? `<meta property="og:image:width" content="${post.cover_w}">\n<meta property="og:image:height" content="${post.cover_h}">\n<link rel="preload" as="image" href="${mediaUrl(cover)}"${post.cover_sm_w ? ` imagesrcset="${mediaUrl(cover, true)} ${post.cover_sm_w}w, ${mediaUrl(cover)} ${post.cover_w}w" imagesizes="(max-width: 1100px) 100vw, 1060px"` : ''} fetchpriority="high">\n` : ''}`;

  const robots = preview ? 'noindex, nofollow' : (post.noindex ? 'noindex, follow' : ROBOTS);
  const toc = (post.toc || []).filter((t) => t.level === 2 || t.level === 3);
  const tocHtml = toc.length >= 2 ? `<nav class="btoc" aria-labelledby="toc-title"><p class="btoc__title" id="toc-title">On this page</p><ol>${toc.map((t) =>
    `<li class="btoc__l${t.level}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join('')}${faq.length ? '<li class="btoc__l2"><a href="#faq">FAQ</a></li>' : ''}</ol></nav>` : '';
  const initials = author.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const avatar = post.author_avatar ? `<img src="${mediaUrl({ id: post.author_avatar, name: post.author_avatar_name || author }, true)}" alt="" width="48" height="48" loading="lazy">` : `<span aria-hidden="true">${esc(initials)}</span>`;
  const share = encodeURIComponent(url); const shareT = encodeURIComponent(post.title);

  const faqHtml = faq.length ? `<section class="bfaq faq" id="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Frequently asked questions</h2>
    <div class="faq__list" data-accordion>${faq.map((f, i) => `<div class="qa${i === 0 ? ' is-open' : ''}"><h3><button class="qa__btn" type="button" id="bq${i}" aria-expanded="${i === 0}" aria-controls="ba${i}"><span class="qa__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span>${esc(f.q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3><div class="qa__panel" id="ba${i}" role="region" aria-labelledby="bq${i}"><div><p>${esc(f.a)}</p></div></div></div>`).join('')}</div>
  </section>` : '';

  const main = `${preview ? '<div class="bpreview" role="status">Preview: this is how the post will look. It is not public yet.</div>' : ''}
<article class="bpost" data-post="${post.id}"${preview ? ' data-preview' : ''}>
  <header class="bpost__head wrap">
    ${crumbs(bc, false)}
    ${post.cat_name ? `<a class="bchip bchip--lg" href="/blog/category/${esc(post.cat_slug)}">${esc(post.cat_name)}</a>` : ''}
    <h1 class="bpost__title">${esc(post.title)}</h1>
    ${post.excerpt ? `<p class="bpost__dek">${esc(post.excerpt)}</p>` : ''}
    <div class="bpost__meta">
      <span class="bauthor"><span class="bauthor__av">${avatar}</span><span><b>${esc(author)}</b><small>${esc(post.author_title || 'Founder, U Scale')}</small></span></span>
      <span class="bpost__facts">
        <span>${ICON_CAL}<time datetime="${isoDate(published)}">${fmtDate(published)}</time></span>
        ${updated ? `<span class="bpost__upd">Updated <time datetime="${isoDate(modified)}">${fmtDate(modified)}</time></span>` : ''}
        <span>${ICON_CLOCK}${post.reading_minutes} min read</span>
      </span>
    </div>
  </header>
  ${cover ? `<figure class="bpost__cover wrap"><img src="${mediaUrl(cover)}"${post.cover_sm_w ? ` srcset="${mediaUrl(cover, true)} ${post.cover_sm_w}w, ${mediaUrl(cover)} ${post.cover_w}w" sizes="(max-width: 1100px) 100vw, 1060px"` : ''} width="${post.cover_w}" height="${post.cover_h}" alt="${esc(post.cover_alt || '')}" fetchpriority="high" decoding="async">${post.cover_caption ? `<figcaption>${esc(post.cover_caption)}</figcaption>` : ''}</figure>` : ''}
  <div class="bpost__grid wrap">
    <aside class="bpost__side" aria-label="Article tools">
      ${tocHtml}
      <div class="bside-cta on-dark" data-tone="dark"><p class="bside-cta__t">Want this done for your business?</p><p>Free audit of your website, Google listing and socials.</p><a class="btn btn--go btn--sm" href="/#contact" data-intent="audit">Get a free audit</a></div>
      <div class="bshare" aria-label="Share this article"><p>Share</p>
        <a href="https://wa.me/?text=${shareT}%20${share}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">LinkedIn</a>
        <a href="https://x.com/intent/post?url=${share}&amp;text=${shareT}" target="_blank" rel="noopener" aria-label="Share on X">X</a>
        <button type="button" data-copy="${esc(url)}">Copy link</button>
      </div>
    </aside>
    <div class="bpost__body">
      <div class="prose">${post.content_html}</div>
      ${faqHtml}
      ${(post.tags || []).length ? `<p class="btags"><span>Tagged</span>${post.tags.map((t) => `<span class="btag">${esc(t)}</span>`).join('')}</p>` : ''}
      <section class="bbio" aria-label="About the author"><span class="bauthor__av bauthor__av--lg">${avatar}</span><div><p class="bbio__name">Written by ${esc(author)}</p><p>${esc(post.author_bio || 'Mehul Karotra is a UI/UX developer-designer in Mumbai. Through U Scale he personally builds websites and runs SEO, social media, ads and AI search visibility for Indian businesses.')}</p><p><a class="tlink" href="/#about">More about Mehul</a></p></div></section>
    </div>
  </div>
</article>
${related.length ? `<section class="section brel" aria-labelledby="rel-title"><div class="wrap"><header class="sec-head"><p class="eyebrow">Keep reading</p><h2 class="h2" id="rel-title">Related articles</h2></header><div class="bgrid">${related.map((p) => card(p)).join('')}</div></div></section>` : ''}
${service ? `<section class="bsvc" aria-label="Related service"><div class="wrap"><a class="bsvc__card" href="/services/${service.slug}"><span class="eyebrow">Related service</span><b>${esc(service.name)}</b><span>${esc(service.pitch)}</span><span class="bsvc__go">See how it works ${ARW}</span></a></div></section>` : ''}
${auditCta()}`;
  return { head: head({ title, desc, url: canonical, image: coverAbs, imageAlt: post.cover_alt || post.title, type: 'article', robots, extra, ld: [{ '@context': 'https://schema.org', '@graph': graph }] }), main };
}

export function renderNotFound() {
  const main = `<div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
  <p class="eyebrow">Error 404</p><h1 class="sp-hero__title" id="page-title">Article not found<span class="dot">.</span></h1>
  <p class="sp-hero__lead">It may have moved. Browse all articles, or get a free audit of your business.</p>
  <div class="hero__cta"><a class="btn btn--go" href="/blog">All articles ${ARW}</a><a class="btn btn--ghost" href="/#contact">Free audit</a></div></section></div>`;
  return { head: head({ title: 'Article not found | U Scale', desc: BLOG_DESC, url: abs('blog'), robots: 'noindex, follow' }), main };
}

export function renderSetup() {
  const main = `<div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
  <p class="eyebrow">Blog</p><h1 class="sp-hero__title" id="page-title">Coming soon<span class="dot">.</span></h1>
  <p class="sp-hero__lead">Guides on websites, SEO, social media and AI search for Indian businesses are on the way.</p>
  <div class="hero__cta"><a class="btn btn--go" href="/#contact" data-intent="audit">Get a free audit ${ARW}</a></div></section></div>`;
  return { head: head({ title: BLOG_TITLE, desc: BLOG_DESC, url: abs('blog'), robots: 'noindex, follow' }), main };
}

// ------------------------------------------------------------------ feeds
const xml = (s) => esc(s);
export function renderRss(rows) {
  const items = rows.map((p) => `<item>
  <title>${xml(p.title)}</title>
  <link>${abs(`blog/${p.slug}`)}</link>
  <guid isPermaLink="true">${abs(`blog/${p.slug}`)}</guid>
  <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
  ${p.cat_name ? `<category>${xml(p.cat_name)}</category>` : ''}
  <dc:creator>${xml(p.author_name || BRAND.author)}</dc:creator>
  <description>${xml(p.excerpt || '')}</description>
  <content:encoded><![CDATA[${String(p.content_html).replace(/]]>/g, ']]&gt;').replace(/(src|href|srcset)="\//g, `$1="${SITE_URL}`)}]]></content:encoded>
  ${p.cover_id ? `<enclosure url="${abs(mediaUrl({ id: p.cover_id, name: p.cover_name }).slice(1))}" type="image/webp" length="0"/>` : ''}
</item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${xml(BRAND.blogName)}</title>
  <link>${abs('blog')}</link>
  <atom:link href="${abs('blog/rss.xml')}" rel="self" type="application/rss+xml"/>
  <description>${xml(BLOG_DESC)}</description>
  <language>en-in</language>
  ${rows[0] ? `<lastBuildDate>${new Date(rows[0].published_at).toUTCString()}</lastBuildDate>` : ''}
${items}
</channel>
</rss>`;
}

export function renderSitemap(rows, cats) {
  const newest = rows[0]?.lastmod;
  const urls = [`<url><loc>${abs('blog')}</loc>${newest ? `<lastmod>${isoDate(newest)}</lastmod>` : ''}</url>`]
    .concat(cats.filter((c) => c.n > 0).map((c) => `<url><loc>${abs(`blog/category/${c.slug}`)}</loc></url>`))
    .concat(rows.filter((r) => !r.noindex && !r.canonical_url).map((r) => `<url><loc>${abs(`blog/${r.slug}`)}</loc><lastmod>${isoDate(r.lastmod)}</lastmod>${r.cover_id
      ? `<image:image><image:loc>${abs(mediaUrl({ id: r.cover_id, name: r.cover_name }).slice(1))}</image:loc></image:image>` : ''}</url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}
