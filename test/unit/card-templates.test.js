// Every template, checked the way a real user would stress it. A new template can't ship with text collisions,
// missing colours, or details too long or too Hindi for its layout.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkLayout, fontsUsed, printPageSvg, sideToSvg } from '../../card/src/core/render.js';
import { validateDesign } from '../../card/src/core/schema.js';
import { TextEngine } from '../../card/src/core/text.js';
import { instantiate, TEMPLATES } from '../../card/templates/index.js';
import { REAL_DETAILS } from '../../card/templates/real-details.js';

const FONT_DIR = join(import.meta.dirname, '../../source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(FONT_DIR, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});

const SHORT = {
  name: 'Om Jha',
  title: 'CA',
  company: 'Jha',
  tagline: 'Since 2001',
  phone: '98765 43210',
  email: 'om@jha.in',
  website: 'jha.in',
  address: 'Fort',
  hours: '10 to 6',
};
const HINDI = {
  name: 'अनन्या देशपांडे',
  title: 'क्षेत्र प्रबंधक',
  company: 'श्री कृष्ण ट्रेडर्स',
  tagline: 'शुद्धता हमारी पहचान',
  phone: '+91 98765 43210',
  email: 'ananya@krishna.example',
  website: 'krishna.example',
  address: 'स्टेशन रोड, ठाणे पश्चिम',
};

test('template ids are unique and well formed', () => {
  const ids = TEMPLATES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});

test('sample details are invented: example domains only, and no real-looking phone numbers', () => {
  for (const t of TEMPLATES) {
    const { email, website, phone } = t.sample;
    if (email) assert.match(email, /\.example$/, `${t.id} email`);
    if (website) assert.match(website, /\.example$/, `${t.id} website`);
    if (phone) assert.match(phone, /98765 43210/, `${t.id} phone`);
  }
});

for (const t of TEMPLATES) {
  test(`template "${t.id}" holds up`, async () => {
    assert.ok(t.name && t.category, 'has a name and category');
    assert.ok(t.tags?.length, 'has search tags');
    assert.ok(t.palettes.length >= 4, 'at least 4 colour sets');
    const keys = Object.keys(t.palettes[0]).sort().join();
    for (const p of t.palettes) assert.equal(Object.keys(p).sort().join(), keys, `colour set ${p.label} has the same colours`);
    for (const [variant, fields] of [['sample', t.sample], ['short', SHORT], ['hindi', HINDI], ...Object.entries(REAL_DETAILS)]) {
      for (let i = 0; i < t.palettes.length; i++) {
        const doc = instantiate(t, { palette: i, fields });
        await engine.ensure(fontsUsed(doc));
        for (const side of ['front', 'back']) {
          const { svg } = sideToSvg(doc, side, engine);
          assert.ok(!/<text\b|<script/i.test(svg), 'all outlines, no scripts');
          assert.ok(svg.length < 900000, `${side} SVG is small enough (${svg.length} bytes)`);
          if (i === 0) {
            const problems = checkLayout(doc, side, engine);
            assert.deepEqual(
              problems.map((w) => w.message),
              [],
              `${variant} ${side}`,
            );
          }
        }
      }
    }
  });
}

test('no template strokes with a gradient: the print PDF would drop those lines', () => {
  for (const t of TEMPLATES) {
    const doc = instantiate(t);
    for (const side of ['front', 'back']) {
      for (const el of doc.sides[side].elements) {
        const paint = typeof el.stroke === 'string' && el.stroke.startsWith('$') ? doc.palette[el.stroke.slice(1)] : el.stroke;
        assert.ok(!paint || typeof paint === 'string', `${t.id} ${side} ${el.id}`);
      }
    }
  }
});

test('front and back use different gradient ids, so a PDF back keeps its own colours', async () => {
  const doc = instantiate(TEMPLATES.find((x) => x.id === 'profile-screen'));
  await engine.ensure(fontsUsed(doc));
  const ids = (side) => [...printPageSvg(doc, side, engine).svg.matchAll(/Gradient id="([^"]+)"/g)].map((m) => m[1]);
  const front = ids('front');
  const back = ids('back');
  assert.ok(front.length && back.length);
  assert.equal(front.filter((id) => back.includes(id)).length, 0);
});

test('every template has a home for a logo, and a QR code', () => {
  for (const t of TEMPLATES) {
    const all = [...t.sides.front.elements, ...t.sides.back.elements];
    assert.ok(all.some((e) => e.type === 'logo'), `${t.id} logo`); // prettier-ignore
    assert.ok(all.some((e) => e.type === 'qr'), `${t.id} QR`); // prettier-ignore
  }
});

test('a gradient on text in a stack draws without failing', async () => {
  const doc = instantiate(TEMPLATES.find((t) => t.id === 'side-panel'));
  const name = doc.sides.front.elements.find((e) => e.id === 'name');
  name.fill = { type: 'linear', angle: 45, stops: [[0, '#111111'], [1, '#333333']] }; // prettier-ignore
  const list = doc.sides.front.elements.find((e) => e.id === 'contact');
  list.fill = name.fill;
  await engine.ensure(fontsUsed(doc));
  assert.doesNotMatch(sideToSvg(doc, 'front', engine).svg, /NaN/);
});

test('every template survives the design-file check unchanged', async () => {
  for (const t of TEMPLATES) {
    const doc = instantiate(t);
    await engine.ensure(fontsUsed(doc));
    const clean = validateDesign(JSON.parse(JSON.stringify(doc)));
    assert.equal(sideToSvg(clean, 'front', engine).svg, sideToSvg(doc, 'front', engine).svg, t.id);
    assert.equal(sideToSvg(clean, 'back', engine).svg, sideToSvg(doc, 'back', engine).svg, t.id);
  }
});
