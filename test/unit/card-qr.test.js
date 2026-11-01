// Custom QR codes: what they say, how they're drawn, and the warnings that protect a print run.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { parsePath } from '../../card/src/core/pathutil.js';
import { BALL_SHAPES, BODY_SHAPES, contrastProblem, FRAME_SHAPES, kindPayload, logoShare } from '../../card/src/core/qr.js';
import { fontsUsed, resolveSide, sideToSvg } from '../../card/src/core/render.js';
import { validateDesign } from '../../card/src/core/schema.js';
import { TextEngine } from '../../card/src/core/text.js';

const FONT_DIR = join(import.meta.dirname, '../../source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(FONT_DIR, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});
const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const doc = (qr, fields = { website: 'shop.example', phone: '+91 98765 43210', company: 'Shop' }) => ({
  v: 1,
  fonts: { heading: 'inter', body: 'inter' },
  palette: { ink: '#111111' },
  fields,
  sides: {
    front: { background: '#FFFFFF', elements: [{ id: 'qr', type: 'qr', data: 'website', x: 30, y: 10, w: 26, ...qr }] },
    back: { background: '#FFFFFF', elements: [] },
  },
});
const resolve = async (d) => {
  await engine.ensure(fontsUsed(d));
  return resolveSide(d, 'front', engine);
};
const codes = (r) => r.warnings.map((w) => w.code);

test('each content type says exactly what a phone expects', () => {
  const fields = { phone: '+91 98765 43210', email: 'a@shop.example', address: 'Fort, Mumbai', company: 'Shree Traders' };
  assert.equal(kindPayload('phone', {}, fields), 'tel:+919876543210');
  assert.equal(kindPayload('phone', { value: '022 1234' }, fields), 'tel:0221234');
  assert.equal(kindPayload('sms', { msg: 'Hi' }, fields), 'SMSTO:+919876543210:Hi');
  assert.equal(kindPayload('email', {}, fields), 'mailto:a@shop.example');
  assert.equal(kindPayload('email', { subject: 'Order now' }, fields), 'mailto:a@shop.example?subject=Order%20now');
  assert.equal(kindPayload('upi', { value: 'shop@okhdfc' }, fields), 'upi://pay?pa=shop@okhdfc&cu=INR&pn=Shree%20Traders');
  assert.equal(
    kindPayload('upi', { value: 'shop@okhdfc', name: 'A', amount: '250.50' }, fields),
    'upi://pay?pa=shop@okhdfc&cu=INR&pn=A&am=250.50',
  );
  assert.equal(kindPayload('wifi', { value: 'My;Net', pass: 'p:w' }, fields), 'WIFI:T:WPA;S:My\\;Net;P:p\\:w;;');
  assert.equal(kindPayload('wifi', { value: 'Open' }, fields), 'WIFI:T:nopass;S:Open;;');
  assert.equal(kindPayload('maps', {}, fields), 'https://www.google.com/maps/search/?api=1&query=Fort%2C%20Mumbai');
  assert.equal(kindPayload('maps', { value: 'https://maps.app.goo.gl/abc' }, fields), 'https://maps.app.goo.gl/abc');
  assert.equal(kindPayload('text', { value: 'Hello' }, fields), 'Hello');
});

test('a wrong UPI ID or amount never goes into a code', () => {
  assert.equal(kindPayload('upi', { value: 'not-a-upi-id' }), '');
  assert.equal(kindPayload('upi', { value: 'a@b', amount: '-5' }), 'upi://pay?pa=a@b&cu=INR');
  assert.equal(kindPayload('upi', { value: 'a@b', amount: 'free' }), 'upi://pay?pa=a@b&cu=INR');
});

test('a type with nothing filled in warns and stays selectable', async () => {
  const r = await resolve(doc({ qrKind: 'upi', qrIn: {} }));
  assert.deepEqual(codes(r), ['qr-empty']);
  assert.ok(r.boxes.qr ?? r.boxes.get?.('qr'));
  assert.ok(!r.ops.some((o) => o.qr));
});

test('too much text warns instead of crashing the editor', async () => {
  const r = await resolve(doc({ data: 'क'.repeat(1500) }));
  assert.deepEqual(codes(r), ['qr-too-long']);
});

test('an unstyled code still draws as one crisp path', async () => {
  const r = await resolve(doc({}));
  const parts = r.ops.filter((o) => o.id === 'qr');
  assert.equal(parts.length, 2);
  assert.ok(parts[1].qr && parts[1].crisp);
});

test('every shape draws clean paths in all three parts of the code', async () => {
  const styles = [
    ...BODY_SHAPES.map((body) => ({ body })),
    ...FRAME_SHAPES.map((frame) => ({ frame })),
    ...BALL_SHAPES.map((ball) => ({ ball })),
  ];
  for (const style of styles) {
    const r = await resolve(doc(style));
    const paths = r.ops.filter((o) => o.id === 'qr' && o.kind === 'path');
    assert.equal(paths.length, 4, JSON.stringify(style));
    for (const p of paths) {
      assert.doesNotMatch(p.d, /NaN|undefined/, JSON.stringify(style));
      assert.ok(parsePath(p.d).length > 0, JSON.stringify(style));
    }
  }
});

test('a logo raises error correction and clears only the centre', async () => {
  const plain = (await resolve(doc({ body: 'dots' }))).ops.find((o) => o.qr);
  const withLogo = await resolve(doc({ body: 'dots', qrLogo: 'icon', qrIcon: 'phone' }));
  const body = withLogo.ops.find((o) => o.qr);
  assert.ok(body.qr.count >= plain.qr.count, 'stronger code has at least as many modules');
  assert.equal(withLogo.warnings.length, 0);
  const inner = withLogo.ops.filter((o) => o.id === 'qr').at(-1);
  assert.ok(inner.stroke, 'the icon is drawn last, on top');
});

test('uploaded and card logos are drawn as images, and logo size is limited', async () => {
  const own = await resolve(doc({ qrLogo: 'own', qrSrc: PNG, imgW: 100, imgH: 50 }));
  const img = own.ops.find((o) => o.kind === 'image');
  assert.equal(img.href, PNG);
  assert.ok(Math.abs(img.w / img.h - 2) < 0.001, 'keeps its proportions');
  const card = await resolve(doc({ qrLogo: 'card' }, { website: 'a.example', logo: PNG, logoW: 10, logoH: 10 }));
  assert.equal(card.ops.find((o) => o.kind === 'image').href, PNG);
  // No logo uploaded yet: the code stays whole instead of showing a hole.
  const none = await resolve(doc({ qrLogo: 'card' }));
  assert.ok(!none.ops.some((o) => o.kind === 'image'));
  assert.equal(logoShare(0.9), 0.3);
  assert.equal(logoShare(0.01), 0.12);
  assert.equal(logoShare(undefined), 0.22);
});

test('colours that phones can not read are flagged before printing', async () => {
  assert.equal(contrastProblem(['#111111'], '#FFFFFF'), null);
  assert.equal(contrastProblem(['#FFFFFF'], '#111111'), 'inverted');
  assert.equal(contrastProblem(['#BBBBBB'], '#FFFFFF'), 'low');
  assert.equal(contrastProblem(['#111111', '#EEEEEE'], '#FFFFFF'), 'low', 'one pale eye is enough to fail');
  assert.equal(contrastProblem(['#111111'], 'none'), null);
  assert.equal(contrastProblem([{ type: 'linear', stops: [[0, '#111111'], [1, '#DDDDDD']] }], '#FFFFFF'), 'low'); // prettier-ignore
  assert.deepEqual(codes(await resolve(doc({ dark: '#FFFFFF', light: '#000000' }))), ['qr-inverted']);
  assert.deepEqual(codes(await resolve(doc({ frameColor: '#EEEEEE', light: '#FFFFFF', dark: '#000000' }))), ['qr-contrast']);
});

test('design files can only choose from the allowed QR options', () => {
  const clean = validateDesign(
    doc({
      body: '"><script>',
      frame: 'circle',
      ball: 'nope',
      qrKind: 'javascript',
      qrLogo: 'evil',
      qrSrc: 'javascript:alert(1)',
      qrIcon: 'constructor',
      frameColor: 'red"/><script>',
      ballColor: '#112233',
      qrIn: { value: 'a@b', hack: 'x', pass: 5 },
    }),
  ).sides.front.elements[0];
  assert.equal(clean.body, undefined);
  assert.equal(clean.frame, 'circle');
  assert.equal(clean.ball, undefined);
  assert.equal(clean.qrKind, undefined);
  assert.equal(clean.qrLogo, undefined);
  assert.equal(clean.qrSrc, undefined);
  assert.equal(clean.qrIcon, undefined);
  assert.equal(clean.frameColor, undefined);
  assert.equal(clean.ballColor, '#112233');
  assert.deepEqual(clean.qrIn, { value: 'a@b' });
});

test('a fully styled code survives saving and reopening, with outlines only', async () => {
  const d = doc({
    body: 'blob',
    frame: 'leaf',
    ball: 'circle',
    dark: '#16325C',
    frameColor: '#B5125F',
    ballColor: '#0B6E6E',
    qrLogo: 'own',
    qrSrc: PNG,
    imgW: 10,
    imgH: 10,
    qrLogoSize: 0.2,
    qrKind: 'upi',
    qrIn: { value: 'shop@okhdfc', name: 'Shop' },
  });
  await engine.ensure(fontsUsed(d));
  const clean = validateDesign(JSON.parse(JSON.stringify(d)));
  const a = sideToSvg(d, 'front', engine).svg;
  assert.equal(sideToSvg(clean, 'front', engine).svg, a);
  assert.ok(!/<text\b|<script/i.test(a));
  assert.match(a, /fill-rule="evenodd"/);
});
