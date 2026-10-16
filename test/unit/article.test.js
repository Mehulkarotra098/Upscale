import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.SITE_URL = 'https://uscale.in';
const { processContent, referencedMedia, classifyLink } = await import('../../server/content/article.js');

const MEDIA = new Map([[7, { id: 7, name: 'Shop Front', width: 1600, height: 900, sm_width: 800, alt: 'stored alt' }]]);

test('removes scripts, event handlers, iframes, styles and dangerous URLs', () => {
  const { html } = processContent(`
    <p onclick="alert(1)">Hi<script>alert(1)</script></p>
    <iframe src="https://evil.example"></iframe><style>p{}</style>
    <p><a href="javascript:alert(1)">bad</a> <img src="x" onerror="alert(1)"> <img src="data:image/png;base64,AAA"></p>
    <p><a href="vbscript:x">v</a></p>`);
  for (const bad of ['<script', 'onclick', 'onerror', '<iframe', '<style', 'javascript:', 'data:image', 'vbscript:']) {
    assert.ok(!html.toLowerCase().includes(bad), `output must not contain ${bad}: ${html}`);
  }
  assert.match(html, /<p>Hi<\/p>/);
});

test('headings: H1 becomes H2, ids are unique, TOC has H2/H3 only', () => {
  const out = processContent('<h1>Intro</h1><h2>Intro</h2><h3>Detail</h3><h4>Small</h4><h2> </h2>');
  assert.match(out.html, /<h2 id="intro">Intro<\/h2><h2 id="intro-2">Intro<\/h2><h3 id="detail">Detail<\/h3><h4 id="small">Small<\/h4>$/);
  assert.deepEqual(
    out.toc.map((t) => [t.id, t.level]),
    [
      ['intro', 2],
      ['intro-2', 2],
      ['detail', 3],
    ],
  );
});

test('links: external open in a new tab with rel flags; own domain becomes relative', () => {
  const { html, internal, external } = processContent(
    '<p><a href="https://example.com/x" rel="nofollow sponsored evil" target="_self">ext</a> ' +
      '<a href="https://www.uscale.in/pricing?a=1#b">own</a> <a href="/services/seo-mumbai">svc</a> <a href="mailto:a@b.co">mail</a></p>',
  );
  assert.match(html, /<a href="https:\/\/example\.com\/x" target="_blank" rel="noopener nofollow sponsored">ext<\/a>/);
  assert.match(html, /<a href="\/pricing\?a=1#b">own<\/a>/);
  assert.match(html, /<a href="mailto:a@b\.co">mail<\/a>/);
  assert.equal(internal, 2);
  assert.equal(external, 1);
});

test('classifyLink handles junk safely', () => {
  assert.deepEqual(classifyLink(''), { internal: true, href: '#' });
  assert.deepEqual(classifyLink('not a url'), { internal: true, href: '#' });
  assert.equal(classifyLink('//evil.example/x').internal, true, 'protocol-relative is not treated as a site path');
});

test('images: our uploads get sizes, srcset and a figure; missing ones are dropped', () => {
  const raw =
    '<p><img src="/media/7-old-name.webp" alt="A shop" title="Caption here" data-id="7"></p><p><img src="/media/99-gone.webp"></p>';
  assert.deepEqual(referencedMedia(raw), [7, 99]);
  const out = processContent(raw, MEDIA);
  assert.match(
    out.html,
    /^<figure class="bp-fig"><img src="\/media\/7-shop-front\.webp" alt="A shop" width="1600" height="900" loading="lazy" decoding="async" srcset="\/media\/7-shop-front-800\.webp 800w, \/media\/7-shop-front\.webp 1600w" sizes="[^"]+"><figcaption>Caption here<\/figcaption><\/figure>$/,
  );
  assert.deepEqual(out.images, [7]);
});

test('images: alt falls back to the library alt; external https images are kept', () => {
  const out = processContent('<p><img src="/media/7-x.webp"></p><p><img src="https://cdn.example/a.jpg" alt="ext"></p>', MEDIA);
  assert.match(out.html, /alt="stored alt"/);
  assert.match(out.html, /<img src="https:\/\/cdn\.example\/a\.jpg" alt="ext" loading="lazy" decoding="async">/);
});

test('tables are wrapped so they scroll on phones', () => {
  const { html } = processContent('<table><tbody><tr><th>A</th></tr></tbody></table>');
  assert.match(html, /^<div class="bp-table" role="region" aria-label="Table" tabindex="0"><table>/);
});

test('callouts and CTA boxes render as components, escaping their text', () => {
  const { html } = processContent(
    '<div data-type="callout" data-variant="stat"><p>42%</p></div><div data-type="callout" data-variant="bogus"><p>x</p></div>' +
      '<div data-type="cta" data-title="<b>Hi</b>" data-text="T" data-button="Go" data-href="https://example.com"></div>',
  );
  assert.match(html, /<aside class="bp-callout bp-callout--stat"><p class="bp-callout__label">Key number<\/p><p>42%<\/p><\/aside>/);
  assert.match(html, /bp-callout--tip/, 'unknown variant falls back to tip');
  assert.match(html, /<p class="bp-cta__title">&lt;b&gt;Hi&lt;\/b&gt;<\/p>/);
  assert.match(html, /href="https:\/\/example\.com\/" target="_blank" rel="noopener"/);
});

test('stats: words exclude CTA boxes; lead is the first real paragraph; empty paragraphs go', () => {
  const out = processContent('<p></p><h2>Title here</h2><p>One two three four.</p><div data-type="cta"></div><p>Five six.</p>');
  assert.ok(!out.html.includes('<p></p>'));
  assert.equal(out.lead, 'One two three four.');
  assert.equal(out.words, 8);
  assert.equal(out.minutes, 1);
});

test('CTA and link hrefs only allow web, mail and phone links', () => {
  const { html } = processContent(
    '<div data-type="cta" data-href="javascript:alert(document.domain)"></div>' +
      '<div data-type="cta" data-href="data:text/html,<script>alert(1)</script>"></div>' +
      '<p><a href="https://uscale.in//evil.example/x">own-host trick</a> <a href="//evil.example">proto-relative</a></p>',
  );
  assert.ok(!/javascript:|data:text/i.test(html), html);
  assert.equal((html.match(/class="btn btn--go" href="#"/g) || []).length, 2, 'unsafe CTA links become dead links');
  assert.match(html, /<a href="\/evil\.example\/x">own-host trick<\/a>/, 'leading slashes collapse, so the link stays on the site');
  assert.ok(!html.includes('href="//'), 'no protocol-relative links');
});

test('image ids outside the database range are ignored, not passed to SQL', () => {
  assert.deepEqual(referencedMedia('<p><img src="/media/99999999999-x.webp" data-id="1e30"></p>'), []);
});
