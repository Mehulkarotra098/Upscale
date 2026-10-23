// /blog/<slug>: the article page.
import { BRAND, ROBOTS, SERVICES } from '../../config.js';
import { esc, excerpt, fmtDate, isoDate } from '../../lib/text.js';
import { mediaUrl } from '../../media/urls.js';
import {
  abs,
  ARROW,
  auditCta,
  breadcrumbLd,
  breadcrumbs,
  DEFAULT_OG,
  head,
  ICON_CALENDAR,
  ICON_CLOCK,
  ORGANIZATION,
  postCard,
} from './parts.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function tableOfContents(toc, hasFaq) {
  const items = (toc || []).filter((t) => t.level === 2 || t.level === 3);
  if (items.length < 2) return '';
  return `<nav class="btoc" aria-labelledby="toc-title"><p class="btoc__title" id="toc-title">On this page</p><ol>${items
    .map((t) => `<li class="btoc__l${t.level}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
    .join('')}${hasFaq ? '<li class="btoc__l2"><a href="#faq">FAQ</a></li>' : ''}</ol></nav>`;
}

function faqSection(faq) {
  if (!faq.length) return '';
  const items = faq
    .map(
      (f, i) =>
        `<div class="qa${i === 0 ? ' is-open' : ''}"><h3><button class="qa__btn" type="button" id="bq${i}" aria-expanded="${i === 0}" aria-controls="ba${i}"><span class="qa__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span>${esc(f.q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3><div class="qa__panel" id="ba${i}" role="region" aria-labelledby="bq${i}"><div><p>${esc(f.a)}</p></div></div></div>`,
    )
    .join('');
  return `<section class="bfaq faq" id="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Frequently asked questions</h2>
    <div class="faq__list" data-accordion>${items}</div>
  </section>`;
}

function shareLinks(url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return `<div class="bshare" aria-label="Share this article"><p>Share</p>
        <a href="https://wa.me/?text=${t}%20${u}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">LinkedIn</a>
        <a href="https://x.com/intent/post?url=${u}&amp;text=${t}" target="_blank" rel="noopener" aria-label="Share on X">X</a>
        <button type="button" data-copy="${esc(url)}">Copy link</button>
      </div>`;
}

/**
 * @param {{ post: object, related: object[], preview?: boolean }} data post row from repos/posts.bySlug()
 * @returns {{ head: string, main: string }}
 */
export function renderArticle({ post, related, preview = false }) {
  const url = abs(`blog/${post.slug}`);
  const title = post.seo_title || `${post.title} | U Scale`;
  const desc = post.seo_description || post.excerpt || excerpt(post.content_html.replace(/<[^>]+>/g, ' '));
  const cover = post.cover_id ? { id: post.cover_id, name: post.cover_name } : null;
  const coverUrl = cover ? abs(mediaUrl(cover)) : DEFAULT_OG;
  const published = post.published_at || post.updated_at;
  const modified = new Date(post.content_updated_at) > new Date(published) ? post.content_updated_at : published;
  const showUpdated = new Date(modified) - new Date(published) > DAY_MS;
  const author = post.author_name || BRAND.author;
  const authorTitle = post.author_title || BRAND.authorTitle;
  const faq = (post.faq || []).filter((f) => f?.q && f?.a);
  const tags = post.tags || [];
  const service = SERVICES.find((s) => s.slug === (post.service_slug || post.cat_service));
  const trail = [
    ['Home', '/'],
    ['Blog', '/blog'],
    ...(post.cat_slug ? [[post.cat_name, `/blog/category/${post.cat_slug}`]] : []),
    [post.title, `/blog/${post.slug}`],
  ];

  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: post.title.slice(0, 110),
      description: desc,
      image: cover ? [{ '@type': 'ImageObject', url: coverUrl, width: post.cover_w, height: post.cover_h }] : [DEFAULT_OG],
      datePublished: isoDate(published),
      dateModified: isoDate(modified),
      inLanguage: 'en-IN',
      wordCount: post.word_count,
      timeRequired: `PT${post.reading_minutes}M`,
      articleSection: post.cat_name || undefined,
      keywords: [post.focus_keyword, ...tags].filter(Boolean).join(', ') || undefined,
      author: {
        '@type': 'Person',
        '@id': abs('#mehul'),
        name: author,
        url: abs('about'),
        jobTitle: authorTitle,
        sameAs: BRAND.authorSameAs,
      },
      publisher: { '@id': ORGANIZATION['@id'] },
    },
    ORGANIZATION,
    breadcrumbLd(trail),
  ];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }

  const coverSrcset = cover && post.cover_sm_w ? `${mediaUrl(cover, true)} ${post.cover_sm_w}w, ${mediaUrl(cover)} ${post.cover_w}w` : '';
  const coverSizes = '(max-width: 1100px) 100vw, 1060px';
  const extra = [
    `<meta property="article:published_time" content="${isoDate(published)}">`,
    `<meta property="article:modified_time" content="${isoDate(modified)}">`,
    `<meta property="article:author" content="${esc(author)}">`,
    post.cat_name ? `<meta property="article:section" content="${esc(post.cat_name)}">` : '',
    ...tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`),
    cover ? `<meta property="og:image:width" content="${post.cover_w}">\n<meta property="og:image:height" content="${post.cover_h}">` : '',
    cover
      ? `<link rel="preload" as="image" href="${mediaUrl(cover)}"${coverSrcset ? ` imagesrcset="${coverSrcset}" imagesizes="${coverSizes}"` : ''} fetchpriority="high">`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const robots = preview ? 'noindex, nofollow' : post.noindex ? 'noindex, follow' : ROBOTS;

  const initials = author
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatar = post.author_avatar
    ? `<img src="${mediaUrl({ id: post.author_avatar, name: post.author_avatar_name || author }, true)}" alt="" width="48" height="48" loading="lazy">`
    : `<span aria-hidden="true">${esc(initials)}</span>`;

  const main = `${preview ? '<div class="bpreview" role="status">Preview: this is how the post will look. It is not public yet.</div>' : ''}
<article class="bpost" data-post="${post.id}"${preview ? ' data-preview' : ''}>
  <header class="bpost__head wrap">
    ${breadcrumbs(trail, { light: true })}
    ${post.cat_name ? `<a class="bchip bchip--lg" href="/blog/category/${esc(post.cat_slug)}">${esc(post.cat_name)}</a>` : ''}
    <h1 class="bpost__title">${esc(post.title)}</h1>
    ${post.excerpt ? `<p class="bpost__dek">${esc(post.excerpt)}</p>` : ''}
    <div class="bpost__meta">
      <span class="bauthor"><span class="bauthor__av">${avatar}</span><span><b><a href="/about" rel="author">${esc(author)}</a></b><small>${esc(authorTitle)}</small></span></span>
      <span class="bpost__facts">
        <span>${ICON_CALENDAR}<time datetime="${isoDate(published)}">${fmtDate(published)}</time></span>
        ${showUpdated ? `<span class="bpost__upd">Updated <time datetime="${isoDate(modified)}">${fmtDate(modified)}</time></span>` : ''}
        <span>${ICON_CLOCK}${post.reading_minutes} min read</span>
      </span>
    </div>
  </header>
  ${
    cover
      ? `<figure class="bpost__cover wrap"><img src="${mediaUrl(cover)}"${coverSrcset ? ` srcset="${coverSrcset}" sizes="${coverSizes}"` : ''} width="${post.cover_w}" height="${post.cover_h}" alt="${esc(post.cover_alt || '')}" fetchpriority="high" decoding="async">${post.cover_caption ? `<figcaption>${esc(post.cover_caption)}</figcaption>` : ''}</figure>`
      : ''
  }
  <div class="bpost__grid wrap">
    <aside class="bpost__side" aria-label="Article tools">
      ${tableOfContents(post.toc, faq.length > 0)}
      <div class="bside-cta on-dark" data-tone="dark"><p class="bside-cta__t">Want this done for your business?</p><p>Free audit of your website, Google listing and socials.</p><a class="btn btn--go btn--sm" href="/#contact" data-intent="audit">Get a free audit</a></div>
      ${shareLinks(url, post.title)}
    </aside>
    <div class="bpost__body">
      <div class="prose">${post.content_html}</div>
      ${faqSection(faq)}
      ${tags.length ? `<p class="btags"><span>Tagged</span>${tags.map((t) => `<span class="btag">${esc(t)}</span>`).join('')}</p>` : ''}
      <section class="bbio" aria-label="About the author"><span class="bauthor__av bauthor__av--lg">${avatar}</span><div><p class="bbio__name">Written by ${esc(author)}</p><p>${esc(post.author_bio || BRAND.authorBio)}</p><p><a class="tlink" href="/#about">More about Mehul</a></p></div></section>
    </div>
  </div>
</article>
${related.length ? `<section class="section brel" aria-labelledby="rel-title"><div class="wrap"><header class="sec-head"><p class="eyebrow">Keep reading</p><h2 class="h2" id="rel-title">Related articles</h2></header><div class="bgrid">${related.map((p) => postCard(p)).join('')}</div></div></section>` : ''}
${service ? `<section class="bsvc" aria-label="Related service"><div class="wrap"><a class="bsvc__card" href="/services/${service.slug}"><span class="eyebrow">Related service</span><b>${esc(service.name)}</b><span>${esc(service.pitch)}</span><span class="bsvc__go">See how it works ${ARROW}</span></a></div></section>` : ''}
${auditCta()}`;

  return {
    head: head({
      title,
      desc,
      url: post.canonical_url || url,
      image: coverUrl,
      imageAlt: post.cover_alt || post.title,
      type: 'article',
      robots,
      extra: `${extra}\n`,
      graph,
    }),
    main,
  };
}
