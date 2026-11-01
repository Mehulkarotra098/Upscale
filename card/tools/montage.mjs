// One image of many rendered cards, for reviewing designs at a glance. Run contact-sheet.mjs first.
//   CARD_PW_DIR=<folder with playwright> node card/tools/montage.mjs <folder> <out.png> <columns> <cardWidthPx> <variants,comma> <template ids...>
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [dir, out, cols, cw, variant, ...ids] = process.argv.slice(2);
const pw = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'))('playwright');
const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.png')));
const pick = ids
  .flatMap((id) => variant.split(',').flatMap((v) => ['front', 'back'].map((s) => `${id}-${v}-${s}.png`)))
  .filter((f) => files.has(f));
const html = `<!doctype html><style>body{margin:0;padding:14px;background:#DDD9D0;display:grid;grid-template-columns:repeat(${cols},auto);gap:12px;justify-content:start;align-items:start}
img{display:block;box-shadow:0 1px 4px #0005;max-width:${cw}px;max-height:${cw}px}</style>${pick.map((f) => `<div><img src="${f}"></div>`).join('')}`;
const page = join(dir, '_montage.html');
writeFileSync(page, html);
const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const b = await pw.chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: Number(cols) * (Number(cw) + 12) + 28, height: 800 } });
await p.goto(`file:///${page.replace(/\\/g, '/')}`);
await p.waitForLoadState('networkidle');
await p.screenshot({ path: out, fullPage: true });
await b.close();
rmSync(page);
console.log(`${pick.length} images → ${out}`);
