import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { a4SheetSvg, printPageSvg, resolveSide, sideToSvg, vcard } from '../../card/src/core/render.js';
import { parsePath, pathString } from '../../card/src/core/pathutil.js';
import { FONTS, hasEmoji, TextEngine } from '../../card/src/core/text.js';

const FONT_DIR = join(import.meta.dirname, '../../source/static/assets/card/fonts');
const load = async (file) => {
  const b = readFileSync(join(FONT_DIR, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const engine = new TextEngine(load);
await engine.ensure(['inter', 'notosansdeva', 'anton']);

const box = { font: 'notosansdeva', weight: 500, size: 12, lang: 'hi' };

test('every prepared font includes the rupee sign, or Inter is there as the fallback', () => {
  assert.ok(FONTS.length >= 20);
  assert.ok(FONTS.find((f) => f.id === 'inter').rupee);
  assert.ok(FONTS.filter((f) => f.deva).length >= 5, 'enough Devanagari fonts');
});

test('Devanagari conjuncts shape into fewer glyphs than letters', () => {
  // क्ष is three code points that must become a single conjunct glyph.
  const { placed } = engine.shapeLine('क्ष', box);
  assert.equal(placed.length, 1);
  assert.ok(placed[0].gid > 0, 'not the missing-glyph box');
});

test('Marathi text gets Marathi letter shapes, Hindi text keeps Hindi ones', () => {
  const gids = (lang) => engine.shapeLine('शाळा', { ...box, lang }).placed.map((g) => g.gid);
  assert.notDeepEqual(gids('mr'), gids('hi'));
});

test('a rupee sign and Hindi in a Latin-only font fall back without missing glyphs', () => {
  const { placed } = engine.shapeLine('Rajesh राजेश ₹500', { font: 'anton', weight: 400, size: 12, lang: 'hi' });
  assert.ok(placed.length > 8);
  assert.ok(
    placed.every((g) => g.gid > 0),
    'no missing-glyph boxes',
  );
  assert.ok(new Set(placed.map((g) => g.inst.key)).size >= 2, 'used more than one font');
});

test('text wraps to the box and shrinks when asked to fit', () => {
  const long = 'Shree Laxmi Narayan Saree and Dress Material Emporium';
  const wrapped = engine.layout(long, { font: 'inter', weight: 500, size: 12, w: 40 });
  assert.ok(wrapped.lines.length > 1);
  assert.ok(wrapped.width <= 40.01);
  const fit = engine.layout('Bartholomew Venkataraghavan', { font: 'inter', weight: 700, size: 24, minSize: 8, w: 60, maxLines: 1 });
  assert.ok(fit.fits);
  assert.ok(fit.size < 24);
  assert.equal(fit.lines.length, 1);
});

test('emoji are detected, and the rupee sign is not mistaken for one', () => {
  assert.ok(hasEmoji('Hi 😀'));
  assert.ok(!hasEmoji('₹500 © 2026 क्ष'));
});

test('path parser normalises every command to M, L, C or Z', () => {
  const cmds = parsePath('M10 10h5v5l-1-1c1 1 2 2 3 3s1 1 2 2q1 1 2 2t2 2a2 2 0 01-4 0z');
  assert.ok(cmds.every((c) => 'MLCZ'.includes(c[0])));
  assert.ok(!/[hvsqta]/i.test(pathString(cmds)));
});

const design = (over = {}) => ({
  v: 1,
  lang: 'hi',
  fonts: { heading: 'inter', body: 'inter' },
  palette: { ink: '#111111', paper: '#FFFFFF' },
  fields: { name: 'Anaya Rao', phone: '+91 98765 43210', email: '', website: 'example.in', company: 'Rao Studio' },
  sides: {
    front: {
      background: '$paper',
      elements: [
        { id: 'n', type: 'text', text: '{name}', x: 6, y: 6, w: 60, size: 14, weight: 700, fill: '$ink' },
        { id: 'c', type: 'list', items: ['phone', 'email', 'website'], x: 6, y: 20, w: 60, size: 7, fill: '$ink' },
        { id: 'q', type: 'qr', data: 'vcard', x: 66, y: 28, w: 18, dark: '$ink' },
      ],
    },
    back: {
      background: {
        type: 'linear',
        angle: 45,
        stops: [
          [0, '#000000'],
          [1, '#FFFFFF'],
        ],
      },
      elements: [],
    },
  },
  ...over,
});

test('a side becomes a self-contained SVG: no text tags, no scripts, gradient defined', () => {
  const { svg } = sideToSvg(design(), 'front', engine);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(!/<text\b/.test(svg), 'all text is outlines');
  assert.ok(!/<script/i.test(svg));
  assert.ok(/width="94.9mm" height="56.8mm"/.test(svg), 'includes bleed');
  const back = sideToSvg(design(), 'back', engine, { bleed: false }).svg;
  assert.ok(/width="88.9mm" height="50.8mm"/.test(back), 'trim-only option');
  assert.ok(/linearGradient/.test(back));
});

test('empty contact rows disappear', () => {
  const text = (f) => resolveSide(design({ fields: f }), 'front', engine).ops.filter((o) => o.id === 'c').length;
  assert.equal(text({ name: 'A', phone: '1', website: 'x.in', email: '' }), 4, 'two rows, each text + icon');
  assert.equal(text({ name: 'A', phone: '1', website: 'x.in', email: 'a@x.in' }), 6);
});

test('vertical cards swap width and height', () => {
  const { svg } = sideToSvg(design({ orientation: 'vertical' }), 'front', engine);
  assert.ok(/width="56.8mm" height="94.9mm"/.test(svg));
});

test('QR warns when too small, and vCard escapes and includes the details', () => {
  const small = design();
  small.sides.front.elements[2].w = 8;
  assert.ok(resolveSide(small, 'front', engine).warnings.some((w) => w.code === 'qr-small'));
  const v = vcard({ name: 'Anaya Rao', company: 'Rao, Sons', phone: '+91 1', website: 'x.in' });
  assert.ok(v.includes('N:Rao;Anaya;;;'));
  assert.ok(v.includes('ORG:Rao\\, Sons'));
  assert.ok(v.includes('URL:https://x.in'));
});

test('print page has exact trim and bleed; crop marks add a margin', () => {
  const plain = printPageSvg(design(), 'front', engine);
  assert.deepEqual([plain.page.w.toFixed(1), plain.page.h.toFixed(1)], ['94.9', '56.8']);
  const marked = printPageSvg(design(), 'front', engine, { marks: true });
  assert.ok(marked.page.w > plain.page.w);
  assert.equal(marked.trim.w, 88.9);
  assert.equal(marked.bleed.x, marked.trim.x - 3);
});

test('A4 sheet fits 10 horizontal cards', () => {
  const sheet = a4SheetSvg(design(), 'front', engine);
  assert.equal(sheet.count, 10);
  assert.equal(sheet.cols, 2);
  assert.equal(sheet.rows, 5);
});

test('hanging text keeps its top line on the box top at any size', () => {
  const engineTop = (size) => {
    const lay = engine.layout('क', { font: 'notosansdeva', weight: 700, size, hang: true, x: 0, y: 10, w: 80 });
    return Math.min(...[...lay.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g)].map((m) => Number(m[2])));
  };
  assert.ok(Math.abs(engineTop(27) - 10) < 0.05);
  assert.ok(Math.abs(engineTop(14) - 10) < 0.05);
});
