// Design files come from outside the page. Nothing in one may reach SVG markup unchecked.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDesign } from '../../card/src/core/schema.js';

const base = (over = {}) => ({
  v: 1,
  fonts: { heading: 'inter', body: 'inter' },
  palette: { ink: '#111111' },
  fields: { name: 'A' },
  sides: { front: { background: '#FFFFFF', elements: [] }, back: { background: '#000000', elements: [] } },
  ...over,
});
const withEl = (el) => base({ sides: { front: { background: '#FFFFFF', elements: [el] }, back: { elements: [] } } });

test('rejects anything that is not a design', () => {
  for (const bad of [null, 5, 'x', {}, { v: 2, sides: {} }, { v: 1 }]) assert.throws(() => validateDesign(bad));
});

test('drops colours that could break out of an SVG attribute', () => {
  const d = validateDesign(base({ palette: { ink: '#000"><script>alert(1)</script>' } }));
  assert.equal(d.palette.ink, undefined);
  const e = validateDesign(withEl({ id: 'a', type: 'rect', x: 1, y: 1, w: 2, h: 2, fill: 'red"/><script>' }));
  assert.equal(e.sides.front.elements[0].fill, undefined);
  const bg = validateDesign(base({ sides: { front: { background: 'x"><script>', elements: [] }, back: {} } }));
  assert.equal(bg.sides.front.background, '#FFFFFF');
});

test('drops path data and images that are not what they claim', () => {
  assert.equal(
    validateDesign(withEl({ id: 'a', type: 'path', d: 'M0 0"/><script>', x: 0, y: 0, w: 1, h: 1 })).sides.front.elements.length,
    0,
  );
  for (const src of ['javascript:alert(1)', 'data:image/svg+xml;base64,AAAA', 'https://evil.example/x.png']) {
    assert.equal(validateDesign(withEl({ id: 'a', type: 'image', src, x: 0, y: 0, w: 1, h: 1 })).sides.front.elements.length, 0, src);
  }
  const ok = validateDesign(withEl({ id: 'a', type: 'image', src: 'data:image/png;base64,AAAA', x: 0, y: 0, w: 1, h: 1 }));
  assert.equal(ok.sides.front.elements.length, 1);
});

test('drops unknown element types, unknown keys, odd ids, bad icons and bad fonts', () => {
  const clean = (el) => validateDesign(withEl(el)).sides.front.elements;
  assert.equal(clean({ id: 'a', type: 'script', x: 1 }).length, 0);
  assert.equal(clean({ id: 'a"><x', type: 'rect', x: 1, y: 1, w: 1, h: 1 }).length, 0);
  assert.equal(clean({ id: 'a', type: 'icon', name: 'constructor', x: 1, y: 1, w: 1 }).length, 0);
  const e = clean({
    id: 'a',
    type: 'text',
    text: 'x',
    x: 1,
    y: 1,
    w: 9,
    size: 9,
    font: '../../evil',
    onload: 'alert(1)',
    __proto__: { polluted: true },
  })[0];
  assert.equal(e.font, undefined);
  assert.equal(e.onload, undefined);
  assert.equal({}.polluted, undefined);
});

test('limits sizes, numbers and duplicate ids', () => {
  const huge = validateDesign(withEl({ id: 'a', type: 'rect', x: 1e12, y: -1e12, w: Infinity, h: 2 })).sides.front.elements[0];
  assert.equal(huge.x, 5000);
  assert.equal(huge.y, -5000);
  assert.equal(huge.w, undefined);
  const dup = validateDesign(
    base({
      sides: {
        front: {
          elements: [
            { id: 'a', type: 'rect', x: 1, y: 1, w: 1, h: 1 },
            { id: 'a', type: 'rect', x: 2, y: 2, w: 1, h: 1 },
          ],
        },
        back: {},
      },
    }),
  );
  assert.equal(dup.sides.front.elements.length, 1);
  const text = validateDesign(base({ fields: { name: 'x'.repeat(5000) } }));
  assert.equal(text.fields.name.length, 400);
});

test('keeps a legitimate design, and adds any missing colour so drawing can never fail', () => {
  const d = validateDesign(withEl({ id: 'a', type: 'rect', x: 1, y: 1, w: 1, h: 1, fill: '$gone' }));
  assert.equal(d.sides.front.elements[0].fill, '$gone');
  assert.equal(d.palette.gone, '#000000');
  assert.equal(d.palette.ink, '#111111');
});
