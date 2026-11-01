// Generates what the website needs from the templates: gallery thumbnails, the list the landing page reads, and share images.
// Commit the results. Run when templates change: CARD_PW_DIR=<folder with playwright> node card/tools/gen-assets.mjs
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontsUsed, sideToSvg } from '../src/core/render.js';
import { TextEngine } from '../src/core/text.js';
import { instantiate, TEMPLATES } from '../templates/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const thumbs = join(root, 'source/static/assets/card/thumbs');
const toolsDir = join(root, 'source/static/assets/tools');
mkdirSync(thumbs, { recursive: true });
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(root, 'source/static/assets/card/fonts', file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});
const pw = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'))('playwright');
const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');

const dataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const svgs = {};
let total = 0;
for (const t of TEMPLATES) {
  const doc = instantiate(t);
  await engine.ensure(fontsUsed(doc));
  const { svg } = sideToSvg(doc, 'front', engine, { bleed: false });
  svgs[t.id] = svg;
  const vertical = t.orientation === 'vertical';
  const [w, h] = vertical ? [240, 420] : [480, 274];
  const b64 = await page.evaluate(
    async ([src, w, h]) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w * 2;
      c.height = h * 2;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.82).split(',')[1];
    },
    [dataUri(svg), w, h],
  );
  const bytes = Buffer.from(b64, 'base64');
  total += bytes.length;
  writeFileSync(join(thumbs, `${t.id}.webp`), bytes);
}
writeFileSync(
  join(root, 'source/build/card_templates.json'),
  JSON.stringify(
    TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category, orientation: t.orientation || 'horizontal' })),
    null,
    1,
  ) + '\n',
);

// Share and tile images: real cards, fanned out on the brand background
const fan = async (ids, w, h, file, type = 'png') => {
  const scale = h / 630;
  const spots = [
    { x: 0.05, y: 0.1, r: -7 },
    { x: 0.48, y: 0.05, r: 5 },
    { x: 0.12, y: 0.53, r: 4 },
    { x: 0.53, y: 0.5, r: -5 },
  ];
  const cw = Math.round(500 * scale * (w / h > 1.6 ? 1 : 0.92));
  const imgs = ids
    .filter((i) => svgs[i])
    .slice(0, 4)
    .map(
      (id, i) =>
        `<img src="${dataUri(svgs[id]).replace(/"/g, '&quot;')}" style="position:absolute;left:${spots[i].x * w}px;top:${spots[i].y * h}px;width:${cw}px;height:auto;transform:rotate(${spots[i].r}deg);box-shadow:0 ${18 * scale}px ${40 * scale}px rgba(0,0,0,.5)">`,
    )
    .join('');
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(
    `<!doctype html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;position:relative;background:linear-gradient(135deg,#2C2454,#16102C)">${imgs}</body>`,
  );
  await p.waitForLoadState('networkidle');
  await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  await p.screenshot({ path: join(toolsDir, file), type: type === 'webp' ? 'png' : type });
  if (type === 'webp') {
    const b = readFileSync(join(toolsDir, file));
    const out = await page.evaluate(
      async ([b64, w, h]) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0);
        return c.toDataURL('image/webp', 0.84).split(',')[1];
      },
      [b.toString('base64'), w, h],
    );
    writeFileSync(join(toolsDir, file), Buffer.from(out, 'base64'));
  }
  await p.close();
};
const showcase = ['rangoli', 'blueprint', 'shirorekha', 'jharokha'];
await fan(showcase, 1200, 630, 'card-maker-og.png');
await fan(showcase, 1200, 800, 'card-maker-tile.webp', 'webp');
await browser.close();
console.log(`${TEMPLATES.length} thumbnails, ${Math.round(total / 1024)} KB`);
