// Turns editor HTML into safe, SEO-ready article HTML.
// 1) sanitize-html whitelist (no scripts, styles, iframes, data: URLs)
// 2) DOM pass: heading ids + table of contents, internal vs external links (rel/target), responsive lazy images
//    wrapped in <figure> with captions, callout and CTA blocks, scrollable tables
// 3) stats: word count, reading time, image ids, link counts
import sanitizeHtml from 'sanitize-html';
import { parseDocument } from 'htmlparser2';
import render from 'dom-serializer';
import { Element, Text } from 'domhandler';
import * as DU from 'domutils';
import { SITE_URL } from './config.js';
import { esc, slugify } from './http.js';

const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, '');

const ALLOWED = {
  allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
    'hr', 'br', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'mark', 'sup', 'sub'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'data-id'],
    div: ['data-type', 'data-variant', 'data-title', 'data-text', 'data-button', 'data-href'],
    th: ['colspan', 'rowspan', 'colwidth'], td: ['colspan', 'rowspan', 'colwidth'],
    ol: ['start'], code: ['class'], pre: ['class'], span: ['class'], p: [], li: [],
  },
  allowedClasses: { code: [/^language-[a-z0-9+-]+$/], pre: [/^language-[a-z0-9+-]+$/] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

const isTag = (n, ...names) => n && n.type === 'tag' && names.includes(n.name);
const el = (name, attribs = {}, children = []) => {
  const e = new Element(name, attribs, []);
  for (const c of children) DU.appendChild(e, c);
  return e;
};
const txt = (s) => new Text(s);

function mediaIdFromSrc(src) {
  const m = String(src || '').match(/^(?:https?:\/\/[^/]+)?\/media\/(\d+)-[a-z0-9-]*?(?:-800)?\.(?:webp|jpg|jpeg|png|gif|avif)(?:\?.*)?$/i);
  return m ? Number(m[1]) : null;
}

export function mediaUrl(m, small = false) {
  const name = slugify(m.name || 'image', 60) || 'image';
  return `/media/${m.id}-${name}${small ? '-800' : ''}.webp`;
}

// Classify a link: returns { internal, href } with internal links made root-relative.
function classifyLink(href) {
  href = String(href || '').trim();
  if (!href) return { internal: true, href: '#' };
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))) return { internal: true, href };
  if (/^(mailto|tel):/i.test(href)) return { internal: false, href, contact: true };
  try {
    const u = new URL(href);
    if (u.host.replace(/^www\./, '') === SITE_HOST) return { internal: true, href: (u.pathname + u.search + u.hash) || '/' };
    return { internal: false, href: u.toString() };
  } catch { return { internal: true, href: '#' }; }
}

// First pass only: collect media ids referenced by <img> so the caller can load their dimensions.
export function referencedMedia(rawHtml) {
  const ids = new Set();
  const doc = parseDocument(sanitizeHtml(rawHtml || '', ALLOWED));
  for (const img of DU.findAll((n) => isTag(n, 'img'), doc.children)) {
    const id = Number(img.attribs['data-id']) || mediaIdFromSrc(img.attribs.src);
    if (id) ids.add(id);
  }
  return [...ids];
}

/**
 * @param {string} rawHtml   editor HTML
 * @param {Map<number,{id,name,width,height,sm_width,alt,caption}>} media
 */
export function processContent(rawHtml, media = new Map()) {
  const clean = sanitizeHtml(rawHtml || '', ALLOWED);
  const doc = parseDocument(clean);
  const toc = []; const used = new Set(); const images = [];
  let internal = 0, external = 0;

  // Headings: no H1 inside the article (the page title is the H1); unique ids for anchors + TOC.
  for (const h of DU.findAll((n) => isTag(n, 'h1', 'h2', 'h3', 'h4'), doc.children)) {
    if (h.name === 'h1') h.name = 'h2';
    const text = DU.textContent(h).replace(/\s+/g, ' ').trim();
    if (!text) { DU.removeElement(h); continue; }
    let id = slugify(text, 60) || 'section'; let k = 2;
    while (used.has(id)) id = `${slugify(text, 56)}-${k++}`;
    used.add(id); h.attribs = { id };
    if (h.name === 'h2' || h.name === 'h3') toc.push({ id, text, level: h.name === 'h2' ? 2 : 3 });
  }

  // Links
  for (const a of DU.findAll((n) => isTag(n, 'a'), doc.children)) {
    const c = classifyLink(a.attribs.href);
    const relIn = String(a.attribs.rel || '').toLowerCase().split(/\s+/).filter((t) => ['nofollow', 'sponsored', 'ugc'].includes(t));
    const title = a.attribs.title;
    if (c.internal || c.contact) {
      a.attribs = { href: c.href };
      if (c.internal) internal++;
    } else {
      external++;
      a.attribs = { href: c.href, target: '_blank', rel: ['noopener', ...relIn].join(' ') };
    }
    if (title) a.attribs.title = title;
  }

  // Images → <figure><img ...><figcaption>
  for (const img of DU.findAll((n) => isTag(n, 'img'), doc.children)) {
    const id = Number(img.attribs['data-id']) || mediaIdFromSrc(img.attribs.src);
    const m = id ? media.get(id) : null;
    const alt = (img.attribs.alt ?? m?.alt ?? '').trim();
    const caption = (img.attribs.title || '').trim();
    let attrs;
    if (m) {
      images.push(id);
      attrs = { src: mediaUrl(m), alt, width: String(m.width), height: String(m.height), loading: 'lazy', decoding: 'async' };
      if (m.sm_width) {
        attrs.srcset = `${mediaUrl(m, true)} ${m.sm_width}w, ${mediaUrl(m)} ${m.width}w`;
        attrs.sizes = '(max-width: 820px) 100vw, 760px';
      }
    } else if (/^https?:\/\//.test(img.attribs.src || '')) {
      attrs = { src: img.attribs.src, alt, loading: 'lazy', decoding: 'async' };
    } else { DU.removeElement(img); continue; }
    img.attribs = attrs;
    const fig = el('figure', { class: 'bp-fig' });
    const parent = img.parent;
    const onlyChild = isTag(parent, 'p') && parent.children.filter((c) => !(c.type === 'text' && !c.data.trim())).length === 1;
    if (onlyChild) DU.replaceElement(parent, fig); else DU.replaceElement(img, fig);
    DU.appendChild(fig, img);
    if (caption) DU.appendChild(fig, el('figcaption', {}, [txt(caption)]));
  }

  // Tables scroll sideways on phones
  for (const t of DU.findAll((n) => isTag(n, 'table'), doc.children)) {
    if (isTag(t.parent, 'div') && t.parent.attribs.class === 'bp-table') continue;
    const wrap = el('div', { class: 'bp-table', role: 'region', 'aria-label': 'Table', tabindex: '0' });
    DU.replaceElement(t, wrap); DU.appendChild(wrap, t);
    for (const cell of DU.findAll((n) => isTag(n, 'th', 'td'), t.children)) delete cell.attribs.colwidth;
  }

  // Custom blocks from the editor
  for (const d of DU.findAll((n) => isTag(n, 'div') && !!n.attribs['data-type'], doc.children)) {
    const type = d.attribs['data-type'];
    if (type === 'callout') {
      const v = ['tip', 'note', 'warning', 'stat'].includes(d.attribs['data-variant']) ? d.attribs['data-variant'] : 'tip';
      const label = { tip: 'Tip', note: 'Note', warning: 'Watch out', stat: 'Key number' }[v];
      const aside = el('aside', { class: `bp-callout bp-callout--${v}` }, [el('p', { class: 'bp-callout__label' }, [txt(label)])]);
      for (const c of [...d.children]) DU.appendChild(aside, c);
      DU.replaceElement(d, aside);
    } else if (type === 'cta') {
      const title = d.attribs['data-title'] || 'Not sure where your business stands online?';
      const text = d.attribs['data-text'] || 'Get a free audit of your website, Google listing and social media. I reply within 24 hours.';
      const button = d.attribs['data-button'] || 'Get my free audit';
      let href = classifyLink(d.attribs['data-href'] || '/#contact');
      const box = parseDocument(`<div class="bp-cta on-dark" data-tone="dark"><div><p class="bp-cta__title">${esc(title)}</p><p>${esc(text)}</p></div><a class="btn btn--go" href="${esc(href.href)}"${href.internal ? '' : ' target="_blank" rel="noopener"'} data-intent="audit">${esc(button)} <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a></div>`).children[0];
      DU.replaceElement(d, box);
    } else {
      d.attribs = {};
    }
  }

  // Drop empty paragraphs (editor leftovers) but keep ones holding images/line breaks
  for (const p of DU.findAll((n) => isTag(n, 'p'), doc.children)) {
    if (!DU.textContent(p).trim() && !DU.findOne((n) => isTag(n, 'img', 'br'), p.children)) DU.removeElement(p);
  }

  const out = render(doc, { encodeEntities: 'utf8' });
  const text = textOf(doc.children).replace(/\s+/g, ' ').trim();
  const firstP = DU.findOne((n) => isTag(n, 'p') && !(n.attribs.class || '').startsWith('bp-') && !!DU.textContent(n).trim(), doc.children);
  const lead = firstP ? DU.textContent(firstP).replace(/\s+/g, ' ').trim() : text;
  const words = text ? text.split(' ').length : 0;
  return { html: out, toc, words, minutes: Math.max(1, Math.round(words / 220)), images, internal, external, text, lead };
}

const BLOCK = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'li', 'blockquote', 'pre', 'figcaption', 'td', 'th', 'tr', 'div', 'aside', 'figure', 'br', 'hr', 'ul', 'ol', 'table']);
// Article text with spaces between blocks (for word count / excerpts); CTA boxes don't count as article words.
function textOf(nodes) {
  let s = '';
  for (const n of nodes) {
    if (n.type === 'text') s += n.data;
    else if (n.type === 'tag') {
      if ((n.attribs?.class || '').includes('bp-cta')) continue;
      const inner = textOf(n.children || []);
      s += BLOCK.has(n.name) ? ` ${inner} ` : inner;
    }
  }
  return s;
}

export function plainExcerpt(text, n = 155) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n + 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)).replace(/[,;:.\s]+$/, '') + '…';
}
