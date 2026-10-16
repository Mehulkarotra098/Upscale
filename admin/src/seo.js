// Live on-page SEO + readability analysis for the editor. Pure function of the post state; no network.
// Each check: { id, group, status: 'good'|'ok'|'bad', label, tip, weight }. Score = weighted share of passes.

const STOP = new Set('a an and are as at be but by for from how i in is it of on or our the this to was what when where which who why will with you your'.split(' '));

export const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const countOf = (hay, needle) => { if (!needle) return 0; let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; } return n; };
// keyword "present" = exact phrase, or every meaningful word of it within the text
const has = (text, kw) => {
  const t = ` ${norm(text)} `, k = norm(kw);
  if (!k) return false;
  if (t.includes(` ${k} `) || t.includes(k)) return true;
  const words = k.split(' ').filter((w) => !STOP.has(w));
  return words.length > 1 && words.every((w) => t.includes(` ${w}`));
};

export function parseDoc(html, siteHost) {
  const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  const root = doc.body.firstChild;
  root.querySelectorAll('[data-type="cta"]').forEach((n) => n.remove());
  const text = (root.innerText || root.textContent || '').replace(/\s+/g, ' ').trim();
  const paras = [...root.querySelectorAll('p')].map((p) => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const headings = [...root.querySelectorAll('h1,h2,h3,h4')].map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim() }));
  const links = [...root.querySelectorAll('a[href]')].map((a) => {
    const href = a.getAttribute('href') || '';
    let internal = href.startsWith('/') || href.startsWith('#');
    try { if (!internal) internal = new URL(href).host.replace(/^www\./, '') === siteHost; } catch {}
    return { href, internal, text: a.textContent.trim(), rel: a.getAttribute('rel') || '' };
  });
  const images = [...root.querySelectorAll('img')].map((i) => ({ alt: (i.getAttribute('alt') || '').trim(), src: i.getAttribute('src') }));
  const words = text ? text.split(' ').length : 0;
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.split(' ').length > 2);
  return { text, paras, headings, links, images, words, sentences };
}

export function analyze(post, html, { siteHost = 'uscale.in', duplicateKeyword = [] } = {}) {
  const d = parseDoc(html, siteHost);
  const kw = norm(post.focus_keyword);
  const seoTitle = post.seo_title || `${post.title} | U Scale`;
  const desc = post.seo_description || post.excerpt || '';
  const C = [];
  const add = (id, group, ok, label, tip, weight = 1, warn = false) => C.push({ id, group, status: ok ? 'good' : warn ? 'ok' : 'bad', label, tip, weight });

  // ---- keyword
  if (!kw) {
    add('kw', 'Keyword', false, 'Set a focus keyword', 'The main phrase someone types into Google to find this post, e.g. "website design cost in mumbai".', 3);
  } else {
    const t = norm(d.text);
    const n = countOf(` ${t} `, ` ${kw} `);
    const density = d.words ? (n * kw.split(' ').length * 100) / d.words : 0;
    add('kw-title', 'Keyword', has(seoTitle, kw), 'Keyword in the SEO title', 'Put the focus keyword in the title, ideally near the start.', 3);
    add('kw-title-start', 'Keyword', norm(seoTitle).indexOf(kw.split(' ')[0]) > -1 && norm(seoTitle).indexOf(kw.split(' ')[0]) < 20, 'Keyword near the start of the title', 'Titles that open with the keyword get more clicks.', 1, true);
    add('kw-desc', 'Keyword', has(desc, kw), 'Keyword in the meta description', 'Google bolds matching words in the snippet, which lifts clicks.', 2);
    add('kw-slug', 'Keyword', has((post.slug || '').replace(/-/g, ' '), kw), 'Keyword in the URL', 'Keep the slug short and include the keyword.', 2);
    add('kw-intro', 'Keyword', has(d.paras[0] || '', kw) || has(post.excerpt || '', kw), 'Keyword in the first paragraph', 'Say what the post is about in the first two sentences.', 2);
    add('kw-heading', 'Keyword', d.headings.some((h) => has(h.text, kw)), 'Keyword in a subheading', 'Use the keyword (or a close variant) in at least one H2 or H3.', 2);
    add('kw-density', 'Keyword', density >= 0.4 && density <= 2.8, `Keyword used ${n}× (${density.toFixed(1)}%)`,
      density < 0.4 ? 'Use the keyword a few more times, naturally.' : density > 2.8 ? 'Too many repeats: Google may see this as stuffing. Use synonyms.' : 'Good balance.', 1, n > 0);
    add('kw-img', 'Keyword', d.images.some((i) => has(i.alt, kw)) || has(post.cover_alt || '', kw), 'Keyword in an image alt text', 'Describe at least one image using the keyword (helps Google Images).', 1, true);
    add('kw-unique', 'Keyword', !duplicateKeyword.length, duplicateKeyword.length ? `Keyword already used by: ${duplicateKeyword.map((p) => p.title).join(', ')}` : 'Keyword not used by another post',
      'Two posts targeting the same keyword compete with each other. Pick a different angle.', 2);
  }

  // ---- title & meta
  const tl = seoTitle.length;
  add('title-len', 'Title & snippet', tl >= 35 && tl <= 62, `SEO title length: ${tl} characters`, tl < 35 ? 'Too short: add a benefit or location (e.g. "in Mumbai").' : tl > 62 ? 'Will be cut off in Google. Aim for 45–60 characters.' : 'Fits Google results.', 2, tl > 62 && tl <= 70);
  const dl = desc.length;
  add('desc', 'Title & snippet', dl >= 110 && dl <= 160, desc ? `Meta description: ${dl} characters` : 'Write a meta description',
    !desc ? 'The 1–2 sentences under your title in Google. Make it a promise + reason to click.' : dl < 110 ? 'A bit short: aim for 120–158 characters.' : dl > 160 ? 'Will be cut off. Aim for 120–158 characters.' : 'Good length.', 2, dl > 80);
  const slugWords = (post.slug || '').split('-').filter(Boolean);
  add('slug', 'Title & snippet', slugWords.length > 0 && slugWords.length <= 7 && (post.slug || '').length <= 60, `URL: /blog/${post.slug || '…'}`, 'Short, readable URLs (3–6 words) rank and share better.', 1, slugWords.length <= 10);

  // ---- content
  add('length', 'Content', d.words >= 900, `${d.words} words`, d.words < 600 ? 'Thin content rarely ranks. Aim for 900+ words that fully answer the question.' : d.words < 900 ? 'Decent. Posts of 900–2,000 words tend to rank best for guides.' : 'Great depth.', 3, d.words >= 600);
  const h2 = d.headings.filter((h) => h.level === 2).length;
  add('headings', 'Content', h2 >= 2, `${h2} H2 subheadings`, 'Break the post into sections with H2s (Google uses them for jump links and AI answers).', 2, h2 === 1);
  add('h1', 'Content', !d.headings.some((h) => h.level === 1), 'No extra H1 in the body', 'The title is already the H1. Use H2/H3 inside the article.', 1);
  const intLinks = d.links.filter((l) => l.internal).length, extLinks = d.links.filter((l) => !l.internal).length;
  add('internal', 'Content', intLinks >= 2, `${intLinks} internal link${intLinks === 1 ? '' : 's'}`, 'Link to 2+ of your own pages (a service page, a related post). It spreads ranking power and keeps readers on the site.', 2, intLinks === 1);
  add('external', 'Content', extLinks >= 1, `${extLinks} external link${extLinks === 1 ? '' : 's'}`, 'Cite 1–2 trusted sources (Google docs, research, news). It builds trust.', 1, true);
  add('service-link', 'Content', d.links.some((l) => l.internal && /\/services\/|\/pricing|#contact/.test(l.href)), 'Links to a service, pricing or contact page', 'Turn readers into enquiries: link to the matching service page.', 1, true);
  const imgs = d.images.length + (post.cover_media_id ? 1 : 0);
  add('images', 'Content', imgs >= 3, `${imgs} image${imgs === 1 ? '' : 's'} (incl. cover)`, 'Aim for 3–4 images: a cover plus screenshots/photos that explain the steps.', 2, imgs >= 1);
  const missingAlt = d.images.filter((i) => !i.alt).length;
  add('alt', 'Content', missingAlt === 0, missingAlt ? `${missingAlt} image${missingAlt === 1 ? '' : 's'} missing alt text` : 'All images have alt text', 'Alt text helps Google Images and screen readers. Describe what the image shows.', 2);
  add('cover', 'Content', !!post.cover_media_id, post.cover_media_id ? 'Cover image set' : 'Add a cover image', 'Shown in Google Discover, WhatsApp/LinkedIn previews and the blog list.', 2);
  add('faq', 'Content', (post.faq || []).filter((f) => f.q && f.a).length >= 2, `${(post.faq || []).filter((f) => f.q && f.a).length} FAQ answers`, 'Add 2–5 real questions customers ask. They can appear in Google and in AI answers (ChatGPT, Gemini).', 1, true);

  // ---- readability
  const longParas = d.paras.filter((p) => p.split(' ').length > 120).length;
  add('paras', 'Readability', longParas === 0, longParas ? `${longParas} long paragraph${longParas === 1 ? '' : 's'}` : 'Paragraphs are short', 'Keep paragraphs under ~100 words. Most readers are on phones.', 1, longParas <= 1);
  const avg = d.sentences.length ? d.words / d.sentences.length : 0;
  add('sentences', 'Readability', avg > 0 && avg <= 21, `Average sentence: ${avg ? avg.toFixed(0) : 0} words`, 'Short sentences (under ~20 words) are easier to read.', 1, avg <= 26);
  const lists = /<(ul|ol)[\s>]/.test(html || '');
  add('lists', 'Readability', lists, lists ? 'Uses lists' : 'No bullet lists', 'Steps and checklists as bullet lists get skimmed (and picked for featured snippets).', 1, true);

  const total = C.reduce((s, c) => s + c.weight, 0);
  const got = C.reduce((s, c) => s + c.weight * (c.status === 'good' ? 1 : c.status === 'ok' ? 0.5 : 0), 0);
  const score = total ? Math.round((got / total) * 100) : 0;
  return { score, checks: C, words: d.words, doc: d, grade: score >= 80 ? 'good' : score >= 55 ? 'ok' : 'bad' };
}

// Pixel-ish width for the Google title preview (Arial 20px-ish average)
export function titleFits(s) {
  let w = 0;
  for (const ch of s) w += /[mwMW]/.test(ch) ? 15 : /[A-Z]/.test(ch) ? 12 : /[il.,'|! ]/.test(ch) ? 5 : 9.2;
  return w <= 580;
}
