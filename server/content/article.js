// Editor HTML → safe, SEO-ready article HTML.
//  1. sanitize-html allowlist: no scripts, styles, event handlers, iframes or data:/javascript: URLs
//  2. DOM pass: heading ids + table of contents, internal vs external links, responsive lazy images in <figure>,
//     callout and CTA blocks, horizontally scrollable tables
//  3. stats: word count, reading time, image ids, link counts, lead paragraph
import sanitizeHtml from 'sanitize-html';
import { parseDocument } from 'htmlparser2';
import render from 'dom-serializer';
import { Element, Text } from 'domhandler';
import * as DU from 'domutils';
import { SITE_HOST } from '../config.js';
import { esc, slugify } from '../lib/text.js';
import { mediaIdFromSrc, mediaUrl } from '../media/urls.js';

const SANITIZE = {
  allowedTags: [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'hr',
    'br',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'div',
    'span',
    'mark',
    'sup',
    'sub',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'data-id'],
    div: ['data-type', 'data-variant', 'data-title', 'data-text', 'data-button', 'data-href'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    ol: ['start'],
    code: ['class'],
    pre: ['class'],
  },
  allowedClasses: { code: [/^language-[a-z0-9+-]+$/], pre: [/^language-[a-z0-9+-]+$/] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

const CALLOUTS = { tip: 'Tip', note: 'Note', warning: 'Watch out', stat: 'Key number' };
const CTA_DEFAULTS = {
  title: 'Not sure where your business stands online?',
  text: 'Get a free audit of your website, Google listing and social media. I reply within 24 hours.',
  button: 'Get my free audit',
  href: '/#contact',
};
const ARROW = '<span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span>';
const WORDS_PER_MINUTE = 220;
const BLOCKS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'li',
  'blockquote',
  'pre',
  'figcaption',
  'td',
  'th',
  'tr',
  'div',
  'aside',
  'figure',
  'br',
  'hr',
  'ul',
  'ol',
  'table',
]);

const isTag = (node, ...names) => node?.type === 'tag' && names.includes(node.name);
const findAll = (root, ...names) => DU.findAll((n) => isTag(n, ...names), root.children);
const textOfNode = (node) => DU.textContent(node).replace(/\s+/g, ' ').trim();

function el(name, attribs = {}, children = []) {
  const node = new Element(name, attribs, []);
  for (const child of children) DU.appendChild(node, child);
  return node;
}

/** Internal links become root-relative; returns { internal, href, contact }. */
export function classifyLink(rawHref) {
  const href = String(rawHref || '').trim();
  if (!href) return { internal: true, href: '#' };
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))) return { internal: true, href };
  if (/^(mailto|tel):/i.test(href)) return { internal: false, href, contact: true };
  try {
    const u = new URL(href);
    if (u.host.replace(/^www\./, '') === SITE_HOST) return { internal: true, href: u.pathname + u.search + u.hash || '/' };
    return { internal: false, href: u.toString() };
  } catch {
    return { internal: true, href: '#' };
  }
}

const imageId = (img) => Number(img.attribs['data-id']) || mediaIdFromSrc(img.attribs.src);

/** Media ids used by <img> tags, so the caller can load their sizes before processContent(). */
export function referencedMedia(rawHtml) {
  const ids = new Set();
  for (const img of findAll(parseDocument(sanitizeHtml(rawHtml || '', SANITIZE)), 'img')) {
    const id = imageId(img);
    if (id) ids.add(id);
  }
  return [...ids];
}

function processHeadings(doc) {
  const toc = [];
  const used = new Set();
  for (const h of findAll(doc, 'h1', 'h2', 'h3', 'h4')) {
    if (h.name === 'h1') h.name = 'h2'; // the page title is the only H1
    const text = textOfNode(h);
    if (!text) {
      DU.removeElement(h);
      continue;
    }
    const base = slugify(text, 56) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    h.attribs = { id };
    if (h.name === 'h2' || h.name === 'h3') toc.push({ id, text, level: Number(h.name[1]) });
  }
  return toc;
}

function processLinks(doc) {
  let internal = 0;
  let external = 0;
  for (const a of findAll(doc, 'a')) {
    const link = classifyLink(a.attribs.href);
    const { title } = a.attribs;
    if (link.internal || link.contact) {
      a.attribs = { href: link.href };
      if (link.internal) internal++;
    } else {
      external++;
      const flags = String(a.attribs.rel || '')
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => ['nofollow', 'sponsored', 'ugc'].includes(t));
      a.attribs = { href: link.href, target: '_blank', rel: ['noopener', ...new Set(flags)].join(' ') };
    }
    if (title) a.attribs.title = title;
  }
  return { internal, external };
}

function processImages(doc, media) {
  const ids = [];
  for (const img of findAll(doc, 'img')) {
    const id = imageId(img);
    const m = id ? media.get(id) : null;
    const alt = (img.attribs.alt ?? m?.alt ?? '').trim();
    const caption = (img.attribs.title || '').trim();
    if (m) {
      ids.push(id);
      img.attribs = { src: mediaUrl(m), alt, width: String(m.width), height: String(m.height), loading: 'lazy', decoding: 'async' };
      if (m.sm_width) {
        img.attribs.srcset = `${mediaUrl(m, true)} ${m.sm_width}w, ${mediaUrl(m)} ${m.width}w`;
        img.attribs.sizes = '(max-width: 820px) 100vw, 760px';
      }
    } else if (/^https?:\/\//.test(img.attribs.src || '')) {
      img.attribs = { src: img.attribs.src, alt, loading: 'lazy', decoding: 'async' };
    } else {
      DU.removeElement(img); // our image that no longer exists, or an unsupported source
      continue;
    }
    const figure = el('figure', { class: 'bp-fig' });
    const { parent } = img;
    const alone = isTag(parent, 'p') && parent.children.every((c) => c === img || (c.type === 'text' && !c.data.trim()));
    DU.replaceElement(alone ? parent : img, figure);
    DU.appendChild(figure, img);
    if (caption) DU.appendChild(figure, el('figcaption', {}, [new Text(caption)]));
  }
  return ids;
}

function processTables(doc) {
  for (const table of findAll(doc, 'table')) {
    const wrap = el('div', { class: 'bp-table', role: 'region', 'aria-label': 'Table', tabindex: '0' });
    DU.replaceElement(table, wrap);
    DU.appendChild(wrap, table);
  }
}

function ctaBlock(div) {
  const title = div.attribs['data-title'] || CTA_DEFAULTS.title;
  const text = div.attribs['data-text'] || CTA_DEFAULTS.text;
  const button = div.attribs['data-button'] || CTA_DEFAULTS.button;
  const link = classifyLink(div.attribs['data-href'] || CTA_DEFAULTS.href);
  const target = link.internal || link.contact ? '' : ' target="_blank" rel="noopener"';
  return parseDocument(
    `<div class="bp-cta on-dark" data-tone="dark"><div><p class="bp-cta__title">${esc(title)}</p><p>${esc(text)}</p></div>` +
      `<a class="btn btn--go" href="${esc(link.href)}"${target} data-intent="audit">${esc(button)} ${ARROW}</a></div>`,
  ).children[0];
}

function processBlocks(doc) {
  for (const div of DU.findAll((n) => isTag(n, 'div') && Boolean(n.attribs['data-type']), doc.children)) {
    const type = div.attribs['data-type'];
    if (type === 'callout') {
      const variant = Object.hasOwn(CALLOUTS, div.attribs['data-variant']) ? div.attribs['data-variant'] : 'tip';
      const aside = el('aside', { class: `bp-callout bp-callout--${variant}` }, [
        el('p', { class: 'bp-callout__label' }, [new Text(CALLOUTS[variant])]),
      ]);
      for (const child of [...div.children]) DU.appendChild(aside, child);
      DU.replaceElement(div, aside);
    } else if (type === 'cta') {
      DU.replaceElement(div, ctaBlock(div));
    } else {
      div.attribs = {};
    }
  }
}

function removeEmptyParagraphs(doc) {
  for (const p of findAll(doc, 'p')) {
    if (!DU.textContent(p).trim() && !DU.findOne((n) => isTag(n, 'img', 'br'), p.children)) DU.removeElement(p);
  }
}

/** Article text with spaces between blocks (for word count and excerpts). CTA boxes aren't article words. */
function articleText(nodes) {
  let s = '';
  for (const n of nodes) {
    if (n.type === 'text') s += n.data;
    else if (n.type === 'tag' && !String(n.attribs?.class || '').includes('bp-cta')) {
      const inner = articleText(n.children || []);
      s += BLOCKS.has(n.name) ? ` ${inner} ` : inner;
    }
  }
  return s;
}

/**
 * @param {string} rawHtml editor HTML
 * @param {Map<number, {id:number,name:string,width:number,height:number,sm_width?:number,alt?:string}>} media
 */
export function processContent(rawHtml, media = new Map()) {
  const doc = parseDocument(sanitizeHtml(rawHtml || '', SANITIZE));
  const toc = processHeadings(doc);
  const links = processLinks(doc);
  const images = processImages(doc, media);
  processTables(doc);
  processBlocks(doc);
  removeEmptyParagraphs(doc);

  const text = articleText(doc.children).replace(/\s+/g, ' ').trim();
  const firstParagraph = DU.findOne(
    (n) => isTag(n, 'p') && !String(n.attribs.class || '').startsWith('bp-') && Boolean(textOfNode(n)),
    doc.children,
  );
  const words = text ? text.split(' ').length : 0;
  return {
    html: render(doc, { encodeEntities: 'utf8' }),
    toc,
    images,
    internal: links.internal,
    external: links.external,
    words,
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    text,
    lead: firstParagraph ? textOfNode(firstParagraph) : text,
  };
}
