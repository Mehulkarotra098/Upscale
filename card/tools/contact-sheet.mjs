// Renders every template to real PNG exports and builds a review sheet, reporting anything the design checks catch.
//   CARD_PW_DIR=<folder with playwright installed> node card/tools/contact-sheet.mjs <output folder> [template ids...]
// Playwright stays out of the repo's dependencies, so Vercel builds never try to download a browser.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLayout, fontsUsed, sideToSvg } from '../src/core/render.js';
import { TextEngine } from '../src/core/text.js';
import { instantiate, TEMPLATES } from '../templates/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const fontDir = join(root, 'source/static/assets/card/fonts');
const [outDir, ...only] = process.argv.slice(2);
if (!outDir) throw new Error('Give an output folder');
const list = only.length ? TEMPLATES.filter((t) => only.includes(t.id)) : TEMPLATES;
mkdirSync(outDir, { recursive: true });

const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});

const STRESS = {
  long: {
    name: 'Bhagyashree Venkataraghavan Subramaniam',
    title: 'Senior Managing Director, Business Development',
    company: 'Shree Laxmi Narayan Enterprises Private Limited',
    tagline: 'Wholesale and retail dealers in everything you need',
    phone: '+91 98765 43210',
    email: 'bhagyashree.subramaniam@laxminarayanenterprises.example',
    website: 'www.laxminarayanenterprises.example',
    address: 'Shop 12, Silver Point, LBS Marg, Ghatkopar West, Mumbai 400086',
    hours: 'Monday to Saturday, 10 am to 1 pm and 5 pm to 9 pm',
  },
  short: {
    name: 'Om Jha',
    title: 'CA',
    company: 'Jha',
    tagline: 'Since 2001',
    phone: '98765 43210',
    email: 'om@jha.in',
    website: 'jha.in',
    address: 'Fort',
    hours: '10 to 6',
  },
  hindi: {
    name: 'अनन्या देशपांडे',
    title: 'क्षेत्र प्रबंधक',
    company: 'श्री कृष्ण ट्रेडर्स',
    tagline: 'शुद्धता हमारी पहचान',
    phone: '+91 98765 43210',
    email: 'ananya@krishna.example',
    website: 'krishna.example',
    address: 'स्टेशन रोड, ठाणे पश्चिम',
  },
};

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

async function png(svg, wmm, hmm, dpi) {
  const w = Math.round((wmm / 25.4) * dpi);
  const h = Math.round((hmm / 25.4) * dpi);
  const b64 = await page.evaluate(
    async ([svg, w, h]) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/png').split(',')[1];
    },
    [svg, w, h],
  );
  return Buffer.from(b64, 'base64');
}

/** Automated design checks: anything a person shouldn't have to spot by eye. */
function lint(doc, side) {
  return [...new Set(checkLayout(doc, side, engine).map((w) => `${w.code}: ${w.message}`))];
}

const report = [];
const rows = [];
for (const t of list) {
  const row = { t, shots: [] };
  const variants = [
    { key: 'sample', fields: t.sample, palette: 0 },
    { key: 'palette2', fields: t.sample, palette: 1 },
    { key: 'palette3', fields: t.sample, palette: 2 },
    { key: 'long', fields: STRESS.long, palette: 0 },
    { key: 'short', fields: STRESS.short, palette: 0 },
    { key: 'hindi', fields: STRESS.hindi, palette: 0 },
  ];
  for (const v of variants) {
    const doc = instantiate(t, { palette: v.palette, fields: v.fields });
    await engine.ensure(fontsUsed(doc));
    for (const side of ['front', 'back']) {
      const { svg } = sideToSvg(doc, side, engine, { bleed: false });
      const vertical = doc.orientation === 'vertical';
      const [w, h] = vertical ? [50.8, 88.9] : [88.9, 50.8];
      const file = `${t.id}-${v.key}-${side}.png`;
      writeFileSync(join(outDir, file), await png(svg, w, h, 300));
      row.shots.push({ file, key: v.key, side, vertical });
      for (const p of lint(doc, side)) report.push(`${t.id} / ${v.key} / ${side}: ${p}`);
    }
  }
  rows.push(row);
  console.log('rendered', t.id);
}
await browser.close();

const cell = (s) => `<img class="${s.vertical ? 'v' : 'h'}" src="${s.file}" alt="">`;
const html = `<!doctype html><meta charset="utf-8"><title>Card templates review</title>
<style>
body{font:14px/1.45 system-ui,sans-serif;background:#E9E7E1;color:#1a1a1a;margin:0;padding:28px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:0}
section{background:#F7F6F2;border-radius:10px;padding:18px 20px;margin:0 0 20px}
.hd{display:flex;gap:10px;align-items:baseline;margin-bottom:12px}.cat{color:#777;font-size:12px}
.g{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
figure{margin:0}figcaption{font-size:11px;color:#666;margin-top:4px}
img{display:block;box-shadow:0 1px 5px rgba(0,0,0,.28);border-radius:2px}
img.h{width:335px;height:auto}img.v{width:192px;height:auto}
.small img.h{width:230px}.small img.v{width:132px}
h3{font-size:12px;color:#666;font-weight:600;margin:14px 0 8px}
</style>
<h1>Card templates: first 12 for review</h1>
<p>Real exports from the engine, at trim size with no bleed shown. All names and businesses are invented.</p>
${rows
  .map(({ t, shots }) => {
    const pick = (k) => shots.filter((s) => s.key === k);
    const fig = (s, label) => `<figure>${cell(s)}<figcaption>${label}</figcaption></figure>`;
    return `<section><div class="hd"><h2>${t.name}</h2><span class="cat">${t.category}</span></div>
    <div class="g">${pick('sample')
      .map((s) => fig(s, s.side))
      .join('')}</div>
    <h3>Colour options</h3><div class="g small">${[...pick('palette2').map((s) => fig(s, `${t.palettes[1].label}, ${s.side}`)), ...pick('palette3').map((s) => fig(s, `${t.palettes[2].label}, ${s.side}`))].join('')}</div>
    <h3>Stress test: very long, very short, and Hindi details</h3><div class="g small">${['long', 'short', 'hindi'].flatMap((k) => pick(k).map((s) => fig(s, `${k}, ${s.side}`))).join('')}</div></section>`;
  })
  .join('\n')}`;
writeFileSync(join(outDir, 'index.html'), html);
writeFileSync(join(outDir, 'checks.txt'), report.join('\n') + '\n');
console.log(`\n${report.length} design check warnings`);
console.log(report.slice(0, 80).join('\n'));
