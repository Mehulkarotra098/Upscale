// End-to-end check of all three export formats for every template, in a real browser:
//   - PDF: page size, trim and bleed boxes, no fonts, and a pixel comparison with the SVG
//   - PNG: pixel size and print-size metadata
//   - QR codes: decoded from the exported PNG, and compared with what they should contain
//   - Editor canvas: drawn with the live painter inside Fabric, then compared with the SVG, and dragged by touch
//
//   CARD_PW_DIR=<folder with playwright, jsqr, pdfjs-dist> node card/tools/verify-exports.mjs <output folder>
// Fails with a non-zero exit code if anything is out of tolerance.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { PDFDocument } from 'pdf-lib';
import { a4SheetSvg, fontsUsed, printPageSvg, resolveSide, sideToSvg } from '../src/core/render.js';
import { TextEngine } from '../src/core/text.js';
import { instantiate, TEMPLATES } from '../templates/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [outDir, ...onlyIds] = process.argv.slice(2);
if (!outDir) throw new Error('Give an output folder');
mkdirSync(outDir, { recursive: true });
const pwDir = process.env.CARD_PW_DIR || '.';
const req = createRequire(join(pwDir, 'x.js'));
const pw = req('playwright');
const jsQR = req('jsqr');
const MM = 72 / 25.4;
const fontDir = join(root, 'source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});

// Tolerances: edges anti-alias differently between renderers, so a small share of pixels may differ.
const MAX_MEAN_DIFF = 2.5;
const MAX_OFF_PCT = 3;
// A dense QR is nearly all edges, so it adds anti-aliasing noise. Those pages get more room, but only because
// the code is also scanned from the PDF itself below.
const MAX_MEAN_DIFF_QR = 3.5;
const MAX_OFF_PCT_QR = 3.5;

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.log('  FAIL', msg);
};

const entry = `
export { svgToCanvas, svgToPng, svgsToPdf } from ${JSON.stringify(join(root, 'card/src/core/export.js').replace(/\\/g, '/'))};
export { paintOps } from ${JSON.stringify(join(root, 'card/src/core/painter.js').replace(/\\/g, '/'))};
export { jsPDF } from 'jspdf';
export { svg2pdf } from 'svg2pdf.js';
export { Canvas, FabricObject, classRegistry } from 'fabric';
`;
const bundle = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'js' },
  bundle: true,
  format: 'iife',
  globalName: 'lab',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
  external: ['canvas', 'jsdom', 'html2canvas', 'dompurify', 'canvg'],
  define: { 'process.env.NODE_ENV': '"production"' },
});
const labJs = bundle.outputFiles[0].text;

const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });
const context = await browser.newContext({ hasTouch: true, viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => fail(`page error: ${e.message}`));
await page.route('https://lab.local/**', (r) => {
  const u = new URL(r.request().url()).pathname.slice(1);
  if (u === 'page') return r.fulfill({ contentType: 'text/html', body: '<!doctype html><body></body>' });
  if (u === 'lab.js') return r.fulfill({ contentType: 'text/javascript', body: labJs });
  r.fulfill({ contentType: 'text/javascript', body: readFileSync(join(pwDir, u)) });
});
await page.goto('https://lab.local/page');
await page.addScriptTag({ url: 'https://lab.local/lab.js' });
await page.evaluate(async () => {
  const pdfjs = await import('https://lab.local/node_modules/pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://lab.local/node_modules/pdfjs-dist/build/pdf.worker.mjs';
  window.pdfjs = pdfjs;
  window.toB64 = async (blob) => {
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = '';
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  };
  window.fromB64 = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  window.diff = (c1, c2) => {
    const W = Math.min(c1.width, c2.width);
    const H = Math.min(c1.height, c2.height);
    const a = c1.getContext('2d').getImageData(0, 0, W, H).data;
    const e = c2.getContext('2d').getImageData(0, 0, W, H).data;
    let bad = 0;
    let sum = 0;
    for (let i = 0; i < a.length; i += 4) {
      const v = (Math.abs(a[i] - e[i]) + Math.abs(a[i + 1] - e[i + 1]) + Math.abs(a[i + 2] - e[i + 2])) / 3;
      sum += v;
      if (v > 24) bad++;
    }
    return {
      mean: +(sum / (W * H)).toFixed(2),
      off: +((100 * bad) / (W * H)).toFixed(2),
      size: [c1.width, c1.height, c2.width, c2.height],
    };
  };
});

const summary = [];
for (const t of onlyIds.length ? TEMPLATES.filter((x) => onlyIds.includes(x.id)) : TEMPLATES) {
  const doc = instantiate(t);
  await engine.ensure(fontsUsed(doc));
  const row = { id: t.id };

  // PDF, two pages, compared with the SVG page by page
  const pages = ['front', 'back'].map((s) => printPageSvg(doc, s, engine, { marks: false }));
  const qrPayloads = ['front', 'back'].map((s) => resolveSide(doc, s, engine).ops.find((o) => o.qr)?.qr.payload);
  const r = await page.evaluate(
    async ({ pages, qrPayloads }) => {
      const blob = await lab.svgsToPdf(pages, { jsPDF: lab.jsPDF, svg2pdf: lab.svg2pdf }, { title: 'test' });
      const d = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      const results = [];
      for (let i = 0; i < pages.length; i++) {
        const pg = await d.getPage(i + 1);
        const vp = pg.getViewport({ scale: 300 / 72 });
        const c2 = document.createElement('canvas');
        c2.width = Math.ceil(vp.width);
        c2.height = Math.ceil(vp.height);
        await pg.render({ canvasContext: c2.getContext('2d'), viewport: vp, canvas: c2 }).promise;
        const c1 = await lab.svgToCanvas(pages[i].svg, 300);
        const text = await pg.getTextContent();
        const dd = diff(c1, c2);
        const qrLimit = qrPayloads[i];
        const over = qrLimit ? dd.mean > 3.5 || dd.off > 3.5 : dd.mean > 2.5 || dd.off > 3;
        let pdfPixels;
        if (qrLimit) {
          const im = c2.getContext('2d').getImageData(0, 0, c2.width, c2.height);
          pdfPixels = { w: c2.width, h: c2.height, d: await toB64(new Blob([im.data])) };
        }
        // Keep both renders when a page is out of tolerance, so the difference can be looked at.
        results.push({ ...dd, text: text.items.length, pdfPixels, ...(over ? { svgPng: c1.toDataURL(), pdfPng: c2.toDataURL() } : {}) });
      }
      return { pdf: await toB64(blob), results, pageCount: d.numPages };
    },
    { pages, qrPayloads },
  );
  const bytes = Buffer.from(r.pdf, 'base64');
  writeFileSync(join(outDir, `${t.id}.pdf`), bytes);
  if (r.pageCount !== 2) fail(`${t.id}: PDF has ${r.pageCount} pages`);
  const pdf = await PDFDocument.load(bytes);
  pdf.getPages().forEach((p, i) => {
    const expect = pages[i];
    const near = (a, b) => Math.abs(a - b) < 0.02;
    const { width, height } = p.getSize();
    if (!near(width / MM, expect.page.w) || !near(height / MM, expect.page.h))
      fail(`${t.id}: page ${i + 1} is ${width / MM} × ${height / MM} mm`);
    const trim = p.getTrimBox();
    if (!near(trim.width / MM, expect.trim.w) || !near(trim.height / MM, expect.trim.h) || !near(trim.x / MM, expect.trim.x))
      fail(`${t.id}: page ${i + 1} trim box wrong`);
    const bleed = p.getBleedBox();
    if (!near(bleed.width / MM, expect.bleed.w) || !near(bleed.height / MM, expect.bleed.h)) fail(`${t.id}: page ${i + 1} bleed box wrong`);
  });
  r.results.forEach((x, i) => {
    if (x.text) fail(`${t.id}: page ${i + 1} contains live text`);
    if (x.pdfPixels) {
      const found = jsQR(new Uint8ClampedArray(Buffer.from(x.pdfPixels.d, 'base64')), x.pdfPixels.w, x.pdfPixels.h);
      if (!found) fail(`${t.id}: QR did not scan from PDF page ${i + 1}`);
      else if (found.data !== qrPayloads[i]) fail(`${t.id}: QR in PDF page ${i + 1} decoded to different data`);
    }
    if (x.mean > (x.pdfPixels ? MAX_MEAN_DIFF_QR : MAX_MEAN_DIFF) || x.off > (x.pdfPixels ? MAX_OFF_PCT_QR : MAX_OFF_PCT)) {
      fail(`${t.id}: page ${i + 1} PDF differs from SVG: mean ${x.mean}, off ${x.off}%`);
      for (const k of ['svgPng', 'pdfPng'])
        if (x[k]) writeFileSync(join(outDir, `${t.id}-p${i + 1}-${k}.png`), Buffer.from(x[k].split(',')[1], 'base64'));
    }
  });
  row.pdf = r.results.map((x) => `${x.mean}/${x.off}%`).join(' ');
  row.kb = Math.round(bytes.length / 1024);

  // PNG size and metadata
  const front = sideToSvg(doc, 'front', engine, { bleed: false }).svg;
  writeFileSync(join(outDir, `${t.id}-front.svg`), front);
  writeFileSync(join(outDir, `${t.id}-back.svg`), sideToSvg(doc, 'back', engine, { bleed: false }).svg);
  const png = await page.evaluate(async (svg) => toB64(await lab.svgToPng(svg, 600)), front);
  const pb = Buffer.from(png, 'base64');
  writeFileSync(join(outDir, `${t.id}-front.png`), pb);
  const wpx = pb.readUInt32BE(16);
  const hpx = pb.readUInt32BE(20);
  const [ew, eh] = doc.orientation === 'vertical' ? [1200, 2100] : [2100, 1200];
  if (wpx !== ew || hpx !== eh) fail(`${t.id}: PNG is ${wpx} × ${hpx}, expected ${ew} × ${eh}`);
  if (pb.toString('latin1', 37, 41) !== 'pHYs' || pb.readUInt32BE(41) !== 23622) fail(`${t.id}: PNG print-size metadata missing`);
  row.png = `${wpx}x${hpx}`;

  // QR codes: decode from a 300 dpi export (the worst realistic case) in every palette, including Hindi details
  let qrChecked = 0;
  const hindi = { ...t.sample, name: 'अनन्या देशपांडे', company: 'श्री कृष्ण ट्रेडर्स' };
  for (let pi = 0; pi < t.palettes.length; pi++) {
    for (const fields of [t.sample, hindi]) {
      const d = instantiate(t, { palette: pi, fields });
      await engine.ensure(fontsUsed(d));
      for (const side of ['front', 'back']) {
        const qr = resolveSide(d, side, engine).ops.find((o) => o.qr);
        if (!qr) continue;
        const { svg } = sideToSvg(d, side, engine, { bleed: false });
        // A phone sees a code at many distances as it moves, so reading at any of these counts, as in the editor's check.
        let found = null;
        for (const dpi of [300, 450, 600]) {
          const pixels = await page.evaluate(
            async ({ svg, dpi }) => {
              const c = await lab.svgToCanvas(svg, dpi);
              const im = c.getContext('2d').getImageData(0, 0, c.width, c.height);
              return { w: c.width, h: c.height, d: await toB64(new Blob([im.data])) };
            },
            { svg, dpi },
          );
          found = jsQR(new Uint8ClampedArray(Buffer.from(pixels.d, 'base64')), pixels.w, pixels.h);
          if (found) break;
        }
        qrChecked++;
        if (!found) fail(`${t.id}: QR did not scan (${t.palettes[pi].label}, ${side})`);
        else if (found.data !== qr.qr.payload) fail(`${t.id}: QR decoded to different data (${t.palettes[pi].label}, ${side})`);
      }
    }
  }
  row.qr = qrChecked;

  // Live painter inside Fabric, compared with the SVG
  const groups = [];
  for (const side of ['front', 'back']) {
    const { ops } = resolveSide(doc, side, engine);
    const trim = doc.orientation === 'vertical' ? [50.8, 88.9] : [88.9, 50.8];
    groups.push({ side, ops, svg: sideToSvg(doc, side, engine, { bleed: false }).svg, trim });
  }
  const live = await page.evaluate(async (groups) => {
    const out = [];
    for (const g of groups) {
      const scale = 300 / 25.4;
      const w = Math.round(g.trim[0] * scale);
      const h = Math.round(g.trim[1] * scale);
      const el = document.createElement('canvas');
      document.body.appendChild(el);
      class CardOps extends lab.FabricObject {
        _render(ctx) {
          ctx.save();
          ctx.scale(scale, scale);
          lab.paintOps(ctx, g.ops);
          ctx.restore();
        }
      }
      const canvas = new lab.Canvas(el, { width: w, height: h, enableRetinaScaling: false, renderOnAddRemove: false, selection: false });
      canvas.add(
        new CardOps({
          left: 0,
          top: 0,
          width: w,
          height: h,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
          selectable: false,
          strokeWidth: 0,
        }),
      );
      // FabricObject draws around its centre, so the painter's origin moves back to the card's corner.
      const obj = canvas.getObjects()[0];
      obj._render = function (ctx) {
        ctx.save();
        ctx.translate(-w / 2, -h / 2);
        ctx.scale(scale, scale);
        lab.paintOps(ctx, g.ops);
        ctx.restore();
      };
      canvas.renderAll();
      const c1 = await lab.svgToCanvas(g.svg, 300);
      const c2 = document.createElement('canvas');
      c2.width = w;
      c2.height = h;
      c2.getContext('2d').drawImage(canvas.lowerCanvasEl, 0, 0);
      out.push(diff(c1, c2));
      canvas.dispose();
      el.remove();
    }
    return out;
  }, groups);
  live.forEach((x, i) => {
    if (x.mean > MAX_MEAN_DIFF || x.off > MAX_OFF_PCT)
      fail(`${t.id}: live canvas differs from SVG on ${groups[i].side}: mean ${x.mean}, off ${x.off}%`);
  });
  row.live = live.map((x) => `${x.mean}/${x.off}%`).join(' ');

  summary.push(row);
  console.log(`${t.id.padEnd(11)} PDF ${row.pdf.padEnd(22)} live ${row.live.padEnd(22)} ${row.kb} KB  PNG ${row.png}  QR scans ${row.qr}`);
}

// Crop marks and the A4 sheet, on a design with gradients and art
{
  const t = TEMPLATES.find((x) => x.id === 'rangoli');
  const doc = instantiate(t);
  await engine.ensure(fontsUsed(doc));
  const marked = ['front', 'back'].map((s) => printPageSvg(doc, s, engine, { marks: true }));
  const sheet = a4SheetSvg(doc, 'front', engine);
  const res = await page.evaluate(
    async ([marked, sheet]) => {
      const libs = { jsPDF: lab.jsPDF, svg2pdf: lab.svg2pdf };
      const t0 = performance.now();
      const a = await lab.svgsToPdf(marked, libs);
      const b = await lab.svgsToPdf([{ svg: sheet }], libs);
      return { a: await toB64(a), b: await toB64(b), ms: Math.round(performance.now() - t0) };
    },
    [marked, sheet.svg],
  );
  writeFileSync(join(outDir, 'rangoli-print-with-marks.pdf'), Buffer.from(res.a, 'base64'));
  writeFileSync(join(outDir, 'rangoli-a4-sheet.pdf'), Buffer.from(res.b, 'base64'));
  const pg = (await PDFDocument.load(Buffer.from(res.a, 'base64'))).getPage(0);
  const trim = pg.getTrimBox();
  console.log(
    `Crop marks: page ${(pg.getWidth() / MM).toFixed(1)} × ${(pg.getHeight() / MM).toFixed(1)} mm, trim ${(trim.width / MM).toFixed(1)} × ${(trim.height / MM).toFixed(1)} mm at ${(trim.x / MM).toFixed(1)} mm`,
  );
  const a4 = (await PDFDocument.load(Buffer.from(res.b, 'base64'))).getPage(0);
  console.log(
    `A4 sheet: ${(a4.getWidth() / MM).toFixed(1)} × ${(a4.getHeight() / MM).toFixed(1)} mm, ${sheet.count} cards, ${Math.round(Buffer.from(res.b, 'base64').length / 1024)} KB, both PDFs in ${res.ms} ms`,
  );
  if (Math.abs(trim.width / MM - 88.9) > 0.02) fail('crop-marks PDF trim box wrong');
  if (Math.abs(a4.getWidth() / MM - 210) > 0.1) fail('A4 sheet size wrong');
}

// Touch: a finger drag moves an element, using real touch events on the Fabric canvas.
{
  const moved = await page.evaluate(async () => {
    const el = document.createElement('canvas');
    document.body.prepend(el);
    document.body.style.margin = '0';
    const canvas = new lab.Canvas(el, { width: 600, height: 340, enableRetinaScaling: false });
    const obj = new lab.FabricObject({
      left: 100,
      top: 100,
      width: 120,
      height: 80,
      originX: 'left',
      originY: 'top',
      fill: '#c00',
      strokeWidth: 0,
    });
    canvas.add(obj);
    canvas.renderAll();
    window.touchObj = obj;
    window.touchCanvas = canvas;
    return { left: obj.left, top: obj.top };
  });
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', 150, 130);
  for (let i = 1; i <= 8; i++) await touch('touchMove', 150 + i * 15, 130 + i * 10);
  await touch('touchEnd', 0, 0);
  const after = await page.evaluate(() => ({ left: touchObj.left, top: touchObj.top }));
  console.log(`Touch drag: element moved from ${moved.left},${moved.top} to ${Math.round(after.left)},${Math.round(after.top)}`);
  if (Math.abs(after.left - moved.left - 120) > 15 || Math.abs(after.top - moved.top - 80) > 15)
    fail(`touch drag: moved to ${after.left},${after.top}`);
}

await browser.close();
writeFileSync(join(outDir, 'verify-results.json'), JSON.stringify({ summary, failures }, null, 1));
console.log(failures.length ? `\n${failures.length} FAILURES\n${failures.join('\n')}` : '\nAll export checks passed.');
process.exit(failures.length ? 1 : 0);
