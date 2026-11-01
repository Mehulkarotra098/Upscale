// Looks at every template the way a person would, with real details, and reports what's wrong:
//   - layout warnings: text too small, not fitting, colliding, or too near the cut
//   - unreadable text: glyphs sitting on art or a background they don't contrast with
//   - covered text: something drawn on top of the words
//   - cut-off text: glyphs outside the card
//
//   CARD_PW_DIR=<folder with playwright> node card/tools/design-audit.mjs [--json out.json] [--sheet out.png set side] [template ids...]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { cardSize, checkLayout, fontsUsed, inkBounds, resolveSide, sideToSvg } from '../src/core/render.js';
import { TextEngine } from '../src/core/text.js';
import { instantiate, TEMPLATES } from '../templates/index.js';
import { REAL_DETAILS } from '../templates/real-details.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const take = (flag, n = 1) => {
  const i = args.indexOf(flag);
  if (i < 0) return null;
  return args.splice(i, n + 1).slice(1);
};
const jsonOut = take('--json')?.[0];
const sheet = take('--sheet', 3);
const ids = args;
const list = ids.length ? TEMPLATES.filter((t) => ids.includes(t.id)) : TEMPLATES;

const req = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'));
const pw = req('playwright');
const fontDir = join(root, 'source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});

const bundle = await build({
  stdin: {
    contents: `export { paintOps } from ${JSON.stringify(join(root, 'card/src/core/painter.js').replace(/\\/g, '/'))};`,
    resolveDir: root,
  },
  bundle: true,
  format: 'iife',
  globalName: 'lab',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
});
const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
await page.setContent('<!doctype html><body></body>');
await page.addScriptTag({ content: bundle.outputFiles[0].text });
await page.evaluate(() => {
  const SCALE = 6; // px per mm
  const lum = (r, g, b) => {
    const ch = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  // Draw the card one operation at a time. At each piece of text, see what it's about to land on.
  window.inspectSide = (ops, w, h) => {
    const W = Math.ceil(w * SCALE);
    const H = Math.ceil(h * SCALE);
    const make = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      return [c, x];
    };
    const [, ctx] = make();
    const [, maskCtx] = make();
    const pending = [];
    const problems = [];
    for (const op of ops) {
      if (!(op.text && op.d)) {
        lab.paintOps(ctx, [op], new Map());
        continue;
      }
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, W, H);
      maskCtx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      lab.paintOps(maskCtx, [{ ...op, fill: '#000000', opacity: 1 }], new Map());
      const mask = maskCtx.getImageData(0, 0, W, H).data;
      const under = ctx.getImageData(0, 0, W, H).data;
      lab.paintOps(ctx, [op], new Map());
      const after = ctx.getImageData(0, 0, W, H).data;
      // The glyph as it really looks, with opacity and gradients, against what it landed on.
      const idx = [];
      let bad = 0;
      for (let i = 0; i < mask.length; i += 4) {
        if (mask[i + 3] < 200) continue;
        idx.push(i);
        const a = lum(after[i], after[i + 1], after[i + 2]);
        const u = lum(under[i], under[i + 1], under[i + 2]);
        if (contrast(a, u) < 2.6) bad++;
      }
      if (!idx.length) continue;
      const share = bad / idx.length;
      if (share > 0.06) problems.push({ id: op.id, code: 'unreadable', share: Math.round(share * 100) });
      pending.push({ id: op.id, idx, seen: idx.map((i) => [after[i], after[i + 1], after[i + 2]]) });
    }
    // Anything drawn later that changes the glyph's pixels is covering it.
    const final = ctx.getImageData(0, 0, W, H).data;
    for (const p of pending) {
      let off = 0;
      p.idx.forEach((i, k) => {
        const s = p.seen[k];
        if (Math.abs(final[i] - s[0]) + Math.abs(final[i + 1] - s[1]) + Math.abs(final[i + 2] - s[2]) > 60) off++;
      });
      const share = off / p.idx.length;
      if (share > 0.08) problems.push({ id: p.id, code: 'covered', share: Math.round(share * 100) });
    }
    return problems;
  };
});

const report = [];
const tally = {};
for (const t of list) {
  const runs = Object.entries({ sample: t.sample, ...REAL_DETAILS }).map(([setName, fields]) => ({ setName, fields, palette: 0 }));
  for (let palette = 1; palette < t.palettes.length; palette++) {
    runs.push({ setName: `founder/colours ${palette + 1}`, fields: REAL_DETAILS.founder, palette });
    runs.push({ setName: `hindi/colours ${palette + 1}`, fields: REAL_DETAILS.hindi, palette });
  }
  for (const { setName, fields, palette } of runs) {
    const doc = instantiate(t, { fields, palette });
    await engine.ensure(fontsUsed(doc));
    const { w, h } = cardSize(doc);
    for (const side of ['front', 'back']) {
      const found = checkLayout(doc, side, engine).map((x) => ({ id: x.id, code: x.code, message: x.message }));
      const { ops } = resolveSide(doc, side, engine);
      // Anything past the trim gets cut off by the guillotine.
      for (const op of ops) {
        if (!op.text || !op.d || op.rot) continue;
        const b = inkBounds(op.d);
        if (b.x < -0.02 || b.y < -0.02 || b.x + b.w > w + 0.02 || b.y + b.h > h + 0.02) found.push({ id: op.id, code: 'cut-off' });
      }
      const flat = ops.map(({ rot: _r, ...o }) => (o.kind === 'image' ? null : o)).filter(Boolean);
      found.push(...(await page.evaluate(({ flat, w, h }) => window.inspectSide(flat, w, h), { flat, w, h })));
      for (const f of found) {
        tally[f.code] = (tally[f.code] ?? 0) + 1;
        report.push({ template: t.id, set: setName, side, ...f });
      }
    }
  }
}

const perTemplate = {};
for (const r of report) perTemplate[r.template] = (perTemplate[r.template] ?? 0) + 1;
const clean = list.filter((t) => !perTemplate[t.id]).map((t) => t.id);
console.log(`${list.length} templates, ${Object.keys(REAL_DETAILS).length + 1} sets of details and every colour set, 2 sides each`);
console.log('problems by kind:', JSON.stringify(tally));
console.log(`clean: ${clean.length} of ${list.length}`);
console.log(
  Object.entries(perTemplate)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join(' '),
);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 1));

if (sheet) {
  const [out, setName, sideName] = sheet;
  let cells = '';
  for (const t of list) {
    const doc = instantiate(t, { fields: setName === 'sample' ? t.sample : REAL_DETAILS[setName] });
    await engine.ensure(fontsUsed(doc));
    for (const s of sideName === 'both' ? ['front', 'back'] : [sideName]) {
      const { svg } = sideToSvg(doc, s, engine, { bleed: false });
      const n = report.filter((r) => r.template === t.id && r.set === setName && r.side === s).length;
      cells += `<div class=c><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"><span>${t.id}${n ? ` <b>${n}</b>` : ''}</span></div>`;
    }
  }
  const cols = list.length > 16 ? 6 : 4;
  const cw = list.length > 16 ? 300 : 440;
  const p = await browser.newPage({ viewport: { width: cols * (cw + 10) + 20, height: 800 } });
  await p.setContent(
    `<!doctype html><style>body{margin:0;padding:10px;background:#ddd9d0;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:10px;font:12px sans-serif}.c img{display:block;max-width:${cw}px;max-height:${cw}px;box-shadow:0 1px 3px #0005}b{color:#c00}</style>${cells}`,
    { waitUntil: 'load' },
  );
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: true });
}
await browser.close();
process.exitCode = report.length ? 1 : 0;
