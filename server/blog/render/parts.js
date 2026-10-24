// Building blocks shared by the blog pages: <head> tags, breadcrumbs, cards, CTAs and structured data.
import { BRAND, ENTITY, ROBOTS, SITE_URL } from '../../config.js';
import { esc, fmtDate, isoDate } from '../../lib/text.js';
import { mediaUrl } from '../../media/urls.js';

/** Absolute URL for a site path ("/blog" or "blog" → "https://uscale.in/blog"). */
export const abs = (path) => SITE_URL + String(path).replace(/^\//, '');

export const BLOG_TITLE = 'Blog: website, SEO & growth tips for Indian businesses | U Scale';
export const BLOG_DESC =
  'Practical guides on websites, Google rankings, social media, ads and AI search for businesses in Mumbai and across India, from Mehul Karotra at U Scale.';
export const DEFAULT_OG = abs('og-image.png');
/** A category page with fewer live posts than this is thin: it stays crawlable (noindex, follow) but out of the sitemap. */
export const MIN_CATEGORY_POSTS = 3;
export const ARROW = '<span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span>';
export const ICON_CLOCK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
export const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>';

// Same @id as the static pages (#business), so the blog and the site describe one entity.
export const ORGANIZATION = {
  '@type': 'LocalBusiness', // not ProfessionalService: schema.org marks that type deprecated
  '@id': abs('#business'),
  name: ENTITY.name,
  alternateName: ENTITY.alternateName,
  disambiguatingDescription: ENTITY.disambiguatingDescription,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: abs('icon-512.png'), width: 512, height: 512 },
  telephone: ENTITY.phone,
  email: ENTITY.email,
  address: { '@type': 'PostalAddress', ...ENTITY.address },
  founder: { '@id': abs('#mehul') },
  sameAs: ENTITY.sameAs,
};

/** JSON-LD script. "<" is escaped so content can never close the script tag. */
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Everything that goes in <head> for a blog page. */
export function head({
  title,
  desc,
  url,
  image = DEFAULT_OG,
  imageAlt = 'U Scale by Mehul Karotra',
  type = 'website',
  robots = ROBOTS,
  extra = '',
  graph = [],
}) {
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
<meta property="og:site_name" content="${esc(BRAND.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
${extra}${graph.length ? jsonLd({ '@context': 'https://schema.org', '@graph': graph }) : ''}`;
}

/** @param {Array<[label: string, href: string]>} items */
export const breadcrumbs = (items, { light = false } = {}) =>
  `<nav class="crumbs${light ? ' crumbs--light' : ''}" aria-label="Breadcrumb"><ol>${items
    .map(([label, href], i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${esc(href)}">${esc(label)}</a></li>`,
    )
    .join('')}</ol></nav>`;

export const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href) })),
});

/** Cover image of a post row (cover_* columns), or a coloured placeholder. */
function coverImage(p, { eager = false, sizes = '(max-width: 760px) 100vw, 420px' } = {}) {
  if (!p.cover_id) return `<span class="bcard__ph" aria-hidden="true"><b>${esc((p.cat_name || BRAND.name).slice(0, 18))}</b></span>`;
  const m = { id: p.cover_id, name: p.cover_name };
  const srcset = p.cover_sm_w ? ` srcset="${mediaUrl(m, true)} ${p.cover_sm_w}w, ${mediaUrl(m)} ${p.cover_w}w" sizes="${sizes}"` : '';
  const loading = eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  return `<img src="${mediaUrl(m, Boolean(p.cover_sm_w))}"${srcset} width="${p.cover_w}" height="${p.cover_h}" alt="${esc(p.cover_alt || '')}" ${loading}>`;
}

export function postCard(p, { heading = 'h3', featured = false, eager = false } = {}) {
  return `<article class="bcard${featured ? ' bcard--feat' : ''}">
  <a class="bcard__link" href="/blog/${esc(p.slug)}">
    <span class="bcard__img">${coverImage(p, { eager, sizes: featured ? '(max-width: 900px) 100vw, 640px' : undefined })}</span>
    <span class="bcard__body">
      <span class="bcard__meta">${p.cat_name ? `<span class="bchip">${esc(p.cat_name)}</span>` : ''}<span>${p.reading_minutes} min read</span></span>
      <${heading} class="bcard__title">${esc(p.title)}</${heading}>
      ${p.excerpt ? `<span class="bcard__ex">${esc(p.excerpt)}</span>` : ''}
      <span class="bcard__date"><time datetime="${isoDate(p.published_at)}">${fmtDate(p.published_at)}</time><span class="bcard__go" aria-hidden="true">Read ${ARROW}</span></span>
    </span>
  </a>
</article>`;
}

/** Green full stop after a heading, unless it already ends in punctuation. */
const headingDot = (text) => (/[?!.]$/.test(text) ? '' : '<span class="dot">.</span>');

export function auditCta({
  title = 'Is your business easy to find online?',
  lead = 'Get a free audit of your website, Google listing and social media. I reply within 24 hours, usually faster on WhatsApp.',
} = {}) {
  return `<section class="cta sp-cta bp-endcta" aria-labelledby="cta-title">
  <div class="wrap"><div class="panel on-dark" data-tone="dark"><span class="grain" aria-hidden="true"></span>
    <div class="cta__copy">
      <h2 class="sp-cta__title" id="cta-title">${esc(title)}${headingDot(title)}</h2>
      <p class="lead">${esc(lead)}</p>
      <div class="cta__btns" data-wa-zone>
        <a class="btn btn--go" href="/#contact" data-intent="audit" data-magnetic>Get a free audit ${ARROW}</a>
        <a class="btn btn--ghost" href="${esc(BRAND.wa)}" target="_blank" rel="noopener" data-magnetic>Chat on WhatsApp</a>
      </div>
    </div>
  </div></div>
</section>`;
}

/** Hero block for simple pages (404, coming soon). */
export const simpleHero = ({
  eyebrow,
  title,
  lead,
  actions,
}) => `<div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
  <p class="eyebrow">${esc(eyebrow)}</p><h1 class="sp-hero__title" id="page-title">${esc(title)}${headingDot(title)}</h1>
  <p class="sp-hero__lead">${esc(lead)}</p>
  <div class="hero__cta">${actions}</div></section></div>`;
