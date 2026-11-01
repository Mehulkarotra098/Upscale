// Share image and tile for the QR code generator: real codes, in real styles, drawn by the tool's own code.
//   CARD_PW_DIR=<folder with playwright> node card/tools/gen-qr-assets.mjs
import { readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sideToSvg } from '../src/core/render.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const req = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'));
const pw = req('playwright');

const code = (style) =>
  sideToSvg(
    {
      v: 1,
      fonts: {},
      palette: {},
      fields: { website: 'uscale.in/tools' },
      size: { w: 60, h: 60 },
      sides: {
        front: { background: '#FFFFFF', elements: [{ id: 'qr', type: 'qr', data: 'website', x: 0, y: 0, w: 60, quiet: 3, ...style }] },
        back: { background: '#FFFFFF', elements: [] },
      },
    },
    'front',
    null,
    { bleed: false },
  ).svg;

const STYLES = [
  { body: 'rounded', frame: 'round', ball: 'circle', dark: '#14284B' },
  { body: 'dots', frame: 'rounded', ball: 'rounded', dark: '#0B5D3B', qrLogo: 'icon', qrIcon: 'star' },
  { body: 'blob', frame: 'leaf', ball: 'leaf', dark: '#8A2A0B' },
  { body: 'classy', frame: 'leafout', ball: 'leafout', dark: '#43173F', frameColor: '#A8326E' },
  {
    body: 'rounded',
    frame: 'circle',
    ball: 'circle',
    dark: {
      type: 'linear',
      angle: 45,
      stops: [
        [0, '#4B2FD1'],
        [1, '#C2185B'],
      ],
    },
    qrLogo: 'icon',
    qrIcon: 'phone',
  },
  { body: 'vbars', frame: 'rounded', ball: 'rounded', dark: '#111111' },
];

const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });

async function shot(width, height, out, type) {
  const cell = Math.round(Math.min((width - 180) / 3, (height - 120) / 2));
  const cards = STYLES.map(
    (s, i) =>
      `<div style="width:${cell}px;height:${cell}px;border-radius:${cell * 0.08}px;overflow:hidden;box-shadow:0 22px 50px rgba(0,0,0,.35);transform:rotate(${[-2, 1.5, -1, 1.5, -1.5, 2][i]}deg)"><img style="display:block;width:100%;height:100%" src="data:image/svg+xml;base64,${Buffer.from(code(s)).toString('base64')}"></div>`,
  ).join('');
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(
    `<!doctype html><body style="margin:0;width:${width}px;height:${height}px;display:grid;place-items:center;background:radial-gradient(circle at 70% 25%,#4a3f78,#251e45 62%)"><div style="display:grid;grid-template-columns:repeat(3,${cell}px);gap:30px">${cards}</div></body>`,
    { waitUntil: 'load' },
  );
  await page.waitForTimeout(300);
  const buf = await page.screenshot({ type: 'png' });
  if (type === 'webp') {
    const url = `data:image/png;base64,${buf.toString('base64')}`;
    const b64 = await page.evaluate(async (u) => {
      const img = new Image();
      img.src = u;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.82).split(',')[1];
    }, url);
    writeFileSync(out, Buffer.from(b64, 'base64'));
  } else writeFileSync(out, buf);
  await page.close();
}

const dir = join(root, 'source/static/assets/tools');
await shot(1200, 630, join(dir, 'qr-tool-og.png'), 'png');
await shot(1200, 800, join(dir, 'qr-tool-tile.webp'), 'webp');
await browser.close();
console.log('qr tool images written');
