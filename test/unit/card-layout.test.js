// Layout that holds real details, and alignment that lines up what the eye sees.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fontsUsed, inkBoxes, resolveSide } from '../../card/src/core/render.js';
import { validateDesign } from '../../card/src/core/schema.js';
import { TextEngine } from '../../card/src/core/text.js';
import { addElement, alignSelected, distributeSelected, duplicateSelected, setCardSize, setEngine } from '../../card/src/editor/actions.js';
import { state } from '../../card/src/editor/store.js';
import { T, L, LOGO } from '../../card/templates/kit.js';
import { REAL_DETAILS } from '../../card/templates/real-details.js';

const FONT_DIR = join(import.meta.dirname, '../../source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(FONT_DIR, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});
const LONG = REAL_DETAILS.doctor;

const doc = (side, fields = LONG) => ({
  v: 1,
  fonts: { heading: 'inter', body: 'inter' },
  palette: { ink: '#111111' },
  fields,
  sides: { front: { background: '#FFFFFF', elements: [], ...side }, back: { background: '#000000', elements: [] } },
});
const resolve = async (d) => {
  await engine.ensure(fontsUsed(d));
  return resolveSide(d, 'front', engine);
};

const stacked = (over = {}, box = {}) =>
  doc({
    stacks: { s: { x: 5, y: 5, w: 60, h: 20, anchor: 'top', gap: 1, ...box } },
    elements: [
      T('name', '{name}', 5, 60, 16, { stack: 's', minSize: 8, maxLines: 2, lineHeight: 1.1 }),
      T('title', '{title}', 5, 60, 8, { stack: 's', minSize: 6, maxLines: 2 }),
      T('co', '{company}', 5, 60, 8, { stack: 's', minSize: 6, maxLines: 2, optional: true, ...over }),
    ],
  });

test('a stack flows its text in order, with no overlaps, inside its box', async () => {
  const r = await resolve(stacked());
  const ink = inkBoxes(r.ops);
  assert.ok(ink.name.y + ink.name.h <= ink.title.y + 0.5, 'title sits below name');
  if (ink.co) assert.ok(ink.title.y + ink.title.h <= ink.co.y + 0.5, 'company sits below title');
  for (const b of Object.values(ink)) assert.ok(b.y + b.h <= 25.6, 'nothing leaves the bottom of the box');
});

test('too much for a stack shrinks everything together, then drops optional lines', async () => {
  const roomy = (await resolve(stacked({}, { h: 40 }))).ops;
  const tight = await resolve(stacked({}, { h: 8.5 }));
  assert.ok(inkBoxes(roomy).co, 'a roomy stack keeps the optional line');
  assert.equal(inkBoxes(tight.ops).co, undefined, 'a tight one drops it');
  assert.ok(inkBoxes(tight.ops).name);
});

test('a stack anchored to the bottom ends at the bottom of its box', async () => {
  const r = await resolve(stacked({}, { y: 5, h: 40, anchor: 'bottom' }));
  const lowest = Math.max(...Object.values(inkBoxes(r.ops)).map((b) => b.y + b.h));
  assert.ok(lowest > 42 && lowest <= 45.5, `lowest ink at ${lowest}`);
});

test('empty fields leave no gap in a stack', async () => {
  const r = await resolve(stacked({}, { h: 40 }), { name: 'A' });
  const shortDoc = stacked({}, { h: 40 });
  shortDoc.fields = { name: 'Sam', company: 'Sam Auto' };
  const ink = inkBoxes((await resolve(shortDoc)).ops);
  assert.equal(ink.title, undefined);
  assert.ok(ink.co.y - (ink.name.y + ink.name.h) < 3, 'company closes up under the name');
  assert.ok(r.ops.length);
});

test('a long address wraps to two lines instead of shrinking out of proportion', async () => {
  const d = doc({ elements: [L('c', ['phone', 'address'], 5, 45, 7, { y: 10 })] });
  const r = await resolve(d);
  assert.equal(r.warnings.length, 0);
  const rows = r.ops.filter((o) => o.text);
  const phone = inkBoxes([rows[0]]).c;
  const address = inkBoxes([rows[1]]).c;
  assert.ok(address.h > phone.h * 1.6, 'address is on two lines');
  assert.ok(phone.y + phone.h <= address.y + 0.3, 'and it stays below the phone row');
});

test('stacks survive saving, and bad stack data is dropped', async () => {
  const d = stacked();
  const clean = validateDesign(JSON.parse(JSON.stringify(d)));
  assert.deepEqual(clean.sides.front.stacks, d.sides.front.stacks);
  assert.equal(clean.sides.front.elements[0].stack, 's');
  assert.equal(clean.sides.front.elements[2].optional, true);
  const bad = validateDesign({
    ...JSON.parse(JSON.stringify(d)),
    sides: {
      front: {
        elements: [],
        stacks: { '"><x': { x: 1, y: 1, w: 1, h: 1 }, ok: { x: 'no' }, fine: { x: 1, y: 2, w: 3, h: 4, anchor: 'evil' } },
      },
      back: {},
    },
  });
  assert.deepEqual(bad.sides.front.stacks, { fine: { x: 1, y: 2, w: 3, h: 4 } });
});

// The editor's own alignment, working on real resolved layouts.
const load = async (d, selection) => {
  await engine.ensure(fontsUsed(d));
  setEngine(engine);
  state.doc = d;
  state.side = 'front';
  state.selection = selection;
};
const seen = () => {
  const { ops, boxes } = resolveSide(state.doc, 'front', engine);
  const ink = inkBoxes(ops);
  return (id) => ink[id] ?? boxes[id];
};
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.15, `${msg}: ${a} vs ${b}`);

test('centring text with no set height puts it in the middle of the card, not off it', async () => {
  await load(doc({ elements: [T('t', 'Hello there', 10, 70, 12, { y: 3 })] }), ['t']);
  alignSelected('vcenter');
  const b = seen()('t');
  near(b.y + b.h / 2, 25.4, 'vertical centre');
});

test('aligning goes by the visible text, not its wide invisible box', async () => {
  await load(doc({ elements: [T('t', 'Hi', 10, 70, 12, { y: 10, align: 'center' })] }), ['t']);
  alignSelected('left');
  near(seen()('t').x, 4, 'left edge of the ink meets the safe line');
  alignSelected('right');
  const b = seen()('t');
  near(b.x + b.w, 88.9 - 4, 'right edge of the ink meets the safe line');
  alignSelected('hcenter');
  const c = seen()('t');
  near(c.x + c.w / 2, 88.9 / 2, 'ink centred on the card');
});

test('several selected elements align to each other, not to the card', async () => {
  await load(
    doc({
      elements: [
        { id: 'a', type: 'rect', x: 20, y: 10, w: 10, h: 5, fill: '#000000' },
        { id: 'b', type: 'rect', x: 40, y: 30, w: 8, h: 5, fill: '#000000' },
      ],
    }),
    ['a', 'b'],
  );
  alignSelected('left');
  const s = seen();
  near(s('a').x, 20, 'first stays');
  near(s('b').x, 20, 'second joins it');
  near(s('b').y, 30, 'and its height on the card is unchanged');
});

test('distributing evens out the gaps', async () => {
  await load(
    doc({
      elements: [
        { id: 'a', type: 'rect', x: 5, y: 10, w: 10, h: 5, fill: '#000000' },
        { id: 'b', type: 'rect', x: 18, y: 10, w: 10, h: 5, fill: '#000000' },
        { id: 'c', type: 'rect', x: 65, y: 10, w: 10, h: 5, fill: '#000000' },
      ],
    }),
    ['a', 'b', 'c'],
  );
  distributeSelected('h');
  const s = seen();
  near(s('b').x - (s('a').x + s('a').w), s('c').x - (s('b').x + s('b').w), 'equal gaps');
  near(s('a').x, 5, 'ends stay put');
  near(s('c').x, 65, 'ends stay put');
});

test('aligning a stacked element frees it from where it was drawn, not from its old coordinates', async () => {
  await load(stacked({}, { h: 40 }), ['title']);
  const before = seen()('title');
  alignSelected('left');
  const after = seen()('title');
  near(after.y, before.y, 'stays at the height it was showing at');
  assert.equal(state.doc.sides.front.elements.find((e) => e.id === 'title').stack, undefined);
});

test('new elements land in empty space instead of on top of the details', async () => {
  await load(
    doc({ elements: [T('t', 'A long name across the top of the card', 4, 80, 14, { y: 4 }), LOGO('l', 4, 30, 12, '#000000')] }),
    [],
  );
  const id = addElement({ type: 'qr', data: 'website' });
  const s = seen();
  const q = state.doc.sides.front.elements.find((e) => e.id === id);
  const ink = s('t');
  assert.ok(q.y >= ink.y + ink.h - 0.5 || q.x >= ink.x + ink.w, 'clear of the name');
  assert.deepEqual(state.selection, [id]);
  assert.equal(state.sheet, 'edit');
});

test('duplicating a stacked element places it where the original is drawn', async () => {
  await load(stacked({}, { h: 40 }), ['title']);
  const before = seen()('title');
  duplicateSelected();
  const copy = state.doc.sides.front.elements.at(-1);
  assert.equal(copy.stack, undefined);
  near(seen()(copy.id).y, before.y + 3, 'just below the original');
});

test('changing card size keeps stacks in step with the card', async () => {
  await load(stacked({}, { h: 40 }), []);
  setCardSize({ w: 85, h: 55 });
  const st = state.doc.sides.front.stacks.s;
  near(st.y, (5 * 55) / 50.8, 'scaled with the card');
  near(st.h, (40 * 55) / 50.8, 'scaled with the card');
});
