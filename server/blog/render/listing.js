// /blog, /blog/page/N and /blog/category/<slug>[/page/N].
import { BRAND } from '../../config.js';
import { esc, isoDate } from '../../lib/text.js';
import { mediaUrl } from '../../media/urls.js';
import {
  abs,
  ARROW,
  auditCta,
  BLOG_DESC,
  BLOG_TITLE,
  breadcrumbLd,
  breadcrumbs,
  head,
  MIN_CATEGORY_POSTS,
  ORGANIZATION,
  postCard,
} from './parts.js';

const INTRO =
  'Simple, practical guides to getting found on Google, growing on social media and turning visitors into customers. Written for Indian business owners, from real client work.';

// A short, written introduction for each category's first page, with the service it relates to. Category pages
// otherwise hold only a list of cards, which leaves search engines and AI tools little to understand them by.
const CATEGORY_GUIDE = {
  'ai-search': {
    text: [
      'More people now ask ChatGPT, Gemini, Perplexity and Google’s AI Mode which business to call. These guides explain how those answers choose local businesses, what changed in India in 2026, from ads inside ChatGPT to Ask Maps in Google Maps, and the steps that make your facts easy for AI tools to read and repeat correctly.',
      'The work is mostly the same as good local SEO: a complete Google Business Profile, the same name, phone and services everywhere, clear service pages and genuine reviews. Nobody can guarantee a mention in an AI answer; these guides show what you can control.',
    ],
    link: [
      '/services/ai-search-visibility',
      'AI search visibility',
      'See what AI tools say about your business today, then fix the facts they rely on.',
    ],
  },
  'google-local-seo': {
    text: [
      'Most people find a shop, clinic or salon through Google Maps on their phone. These guides cover the Google Business Profile end to end: getting verified, why a business doesn’t show on Maps, how Google ranks local results on relevance, distance and prominence, how to get more genuine reviews, and why reviews disappear.',
      'Every step here can be done yourself. Start with the free Google Business Profile checker to see where your listing stands, then fix the gaps in the order the guides suggest.',
    ],
    link: [
      '/services/seo-mumbai',
      'Local SEO in Mumbai',
      'Google Business Profile and local SEO, done for you, with a plain monthly report.',
    ],
    tool: ['/tools/google-business-profile-checker', 'Free Google Business Profile checker'],
  },
  'social-media': {
    text: [
      'For most local businesses, Instagram is where customers discover you and WhatsApp is where they ask the question. These guides cover what gets reels seen in 2026, how Instagram posts now show up on Google, what WhatsApp Business costs in India, and dated seasonal plans for festivals and the wedding season.',
      'Each guide uses examples from Indian shops, salons, cafés and boutiques, with steps you can follow this week.',
    ],
    link: [
      '/services/social-media-management-mumbai',
      'Social media management',
      'A monthly plan, designed posts and reels, approved by you before anything goes live.',
    ],
  },
  websites: {
    text: [
      'What a website really costs in Mumbai and across India, what you should own when it is finished, and what to check before you pay an advance. These guides use published prices with sources, not guesses.',
    ],
    link: [
      '/services/website-design-mumbai',
      'Website design in Mumbai',
      'Designed in Figma, hand-coded, at a fixed price agreed in writing.',
    ],
  },
};

function categoryIntro(slug) {
  const g = CATEGORY_GUIDE[slug];
  if (!g) return '';
  const [href, name, text] = g.link;
  const tool = g.tool ? `<p class="bintro__tool"><a class="tlink" href="${esc(g.tool[0])}">${esc(g.tool[1])}</a></p>` : '';
  return `<div class="bintro">
    <div class="bintro__text">${g.text.map((t) => `<p>${esc(t)}</p>`).join('')}${tool}</div>
    <a class="bintro__svc" href="${esc(href)}"><span class="bintro__k">Service</span><b>${esc(name)}</b><span>${esc(text)}</span>${ARROW}</a>
  </div>`;
}

function categoryNav(categories, activeSlug) {
  const withPosts = categories.filter((c) => c.n > 0);
  if (!withPosts.length) return '';
  return `<nav class="bcats" aria-label="Blog categories"><ul>
  <li><a href="/blog"${activeSlug ? '' : ' aria-current="page"'}>All</a></li>
  ${withPosts
    .map(
      (c) =>
        `<li><a href="/blog/category/${esc(c.slug)}"${activeSlug === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)} <small>${c.n}</small></a></li>`,
    )
    .join('')}
</ul></nav>`;
}

function pager(base, page, pages) {
  if (pages <= 1) return '';
  const href = (n) => (n === 1 ? base : `${base}/page/${n}`);
  const numbers = Array.from({ length: pages }, (_, i) => i + 1)
    .map((n) => (n === page ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${href(n)}">${n}</a></li>`))
    .join('');
  return `<nav class="bpager" aria-label="Pagination"><ul>
  ${page > 1 ? `<li><a href="${href(page - 1)}" rel="prev">← Newer</a></li>` : ''}${numbers}${page < pages ? `<li><a href="${href(page + 1)}" rel="next">Older →</a></li>` : ''}
</ul></nav>`;
}

const EMPTY = `<div class="bempty"><p class="eyebrow">Coming soon</p><h2 class="h2">The first articles are on the way.</h2><p>Meanwhile, get a free audit and see exactly what's holding your business back online.</p><a class="btn btn--go" href="/#contact" data-intent="audit">Get a free audit ${ARROW}</a></div>`;

/**
 * @param {{ posts: object[], page: number, pages: number, total: number, categories: object[], category?: object|null }} data
 * @returns {{ head: string, main: string }}
 */
export function renderListing({ posts, page, pages, total, categories, category = null }) {
  const base = category ? `/blog/category/${category.slug}` : '/blog';
  const pageUrl = (n) => abs(n > 1 ? `${base}/page/${n}` : base);
  const url = pageUrl(page);
  const baseTitle = category ? category.seo_title || `${category.name}: guides and tips | U Scale Blog` : BLOG_TITLE;
  const title = page > 1 ? `${baseTitle.replace(/ \| U Scale.*$/, '')} (page ${page}) | U Scale` : baseTitle;
  const baseDesc = category
    ? category.seo_description ||
      category.description ||
      `${category.name} articles from U Scale: practical, no-jargon advice for Indian businesses.`
    : BLOG_DESC;
  // Later pages get their own description and H1, so they don't repeat page 1 word for word.
  const desc =
    page > 1
      ? category
        ? `${category.name} guides from the U Scale blog, page ${page} of ${pages}: older articles for Indian small businesses.`
        : `Older guides from the U Scale blog, page ${page} of ${pages}: Google Maps, reviews, WhatsApp, social media and AI search for Indian small businesses.`
      : baseDesc;
  const trail = [
    ['Home', '/'],
    ['Blog', '/blog'],
    ...(category ? [[category.name, base]] : []),
    ...(page > 1 ? [[`Page ${page}`, `${base}/page/${page}`]] : []),
  ];

  const items = posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: abs(`blog/${p.slug}`),
    datePublished: isoDate(p.published_at),
    ...(p.cover_id ? { image: abs(mediaUrl({ id: p.cover_id, name: p.cover_name })) } : {}),
  }));
  const pageNode = {
    '@type': category ? 'CollectionPage' : 'Blog',
    '@id': `${url}#page`,
    url,
    name: category ? category.name : BRAND.blogName,
    description: desc,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANIZATION['@id'] },
    ...(category
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: it.url })),
          },
        }
      : { blogPost: items }),
  };

  const [first, ...rest] = posts;
  const preloadCover =
    page === 1 && first?.cover_id
      ? `<link rel="preload" as="image" href="${mediaUrl({ id: first.cover_id, name: first.cover_name }, Boolean(first.cover_sm_w))}" fetchpriority="high">\n`
      : '';
  const extra =
    (page > 1 ? `<link rel="prev" href="${pageUrl(page - 1)}">\n` : '') +
    (page < pages ? `<link rel="next" href="${pageUrl(page + 1)}">\n` : '') +
    preloadCover;

  const list = posts.length
    ? `${page === 1 ? `<div class="bfeat">${postCard(first, { heading: 'h2', featured: true, eager: true })}</div>` : ''}
       <div class="bgrid">${(page === 1 ? rest : posts).map((p, i) => postCard(p, { heading: page === 1 ? 'h3' : 'h2', eager: page > 1 && i < 2 })).join('')}</div>
       ${pager(base, page, pages)}`
    : EMPTY;
  const h1 = (category ? category.name : BRAND.blogName) + (page > 1 ? `: page ${page}` : '');

  const main = `<div class="wrap hero-shell">
  <section class="sp-hero bp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
    ${breadcrumbs(trail)}
    <h1 class="sp-hero__title" id="page-title">${esc(h1)}<span class="dot">.</span></h1>
    <p class="sp-hero__lead">${esc(category ? category.description || baseDesc : INTRO)}</p>
    ${categoryNav(categories, category?.slug)}
  </section>
</div>
<section class="section bp-list" aria-label="${esc(category ? `${category.name} articles` : 'Latest articles')}">
  <div class="wrap">${category && page === 1 ? categoryIntro(category.slug) : ''}${total ? `<p class="bcount">${total} article${total === 1 ? '' : 's'}${page > 1 ? ` · page ${page} of ${pages}` : ''}</p>` : ''}${list}</div>
</section>
${auditCta()}`;

  // Thin category pages (under MIN_CATEGORY_POSTS live posts) are kept out of the index but their links are still followed.
  const thin = Boolean(category) && total < MIN_CATEGORY_POSTS;
  return {
    head: head({
      title,
      desc,
      url,
      extra,
      ...(thin ? { robots: 'noindex, follow' } : {}),
      graph: [pageNode, ORGANIZATION, breadcrumbLd(trail)],
    }),
    main,
  };
}
