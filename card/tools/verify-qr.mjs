// Scans every QR shape from real exports, so no option in the editor can produce a code that doesn't work.
//   - every module, eye frame and eye centre shape, with a short link and with a full contact
//   - with and without a logo in the centre, at the small size people really use
//   - from the PNG and from the print PDF, at three resolutions. A phone sees a code at many distances as it moves,
//     so a code counts as working if it reads at any of them. The editor's live check uses the same rule.
//
//   CARD_PW_DIR=<folder with playwright, jsqr, pdfjs-dist> node card/tools/verify-qr.mjs
// Fails with a non-zero exit code if any code doesn't scan to exactly what it should say.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { BALL_SHAPES, BODY_SHAPES, FRAME_SHAPES } from '../src/core/qr.js';
import { printPageSvg, resolveSide, sideToSvg, fontsUsed } from '../src/core/render.js';
import { TextEngine } from '../src/core/text.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pwDir = process.env.CARD_PW_DIR || '.';
const req = createRequire(join(pwDir, 'x.js'));
const pw = req('playwright');
const jsQR = req('jsqr');

const fontDir = join(root, 'source/static/assets/card/fonts');
const engine = new TextEngine(async (file) => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
});

const bundle = await build({
  stdin: {
    contents: `export { svgToCanvas, svgsToPdf } from ${JSON.stringify(join(root, 'card/src/core/export.js').replace(/\\/g, '/'))};
export { jsPDF } from 'jspdf';
export { svg2pdf } from 'svg2pdf.js';`,
    resolveDir: root,
    loader: 'js',
  },
  bundle: true,
  format: 'iife',
  globalName: 'lab',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
  external: ['canvas', 'jsdom', 'html2canvas', 'dompurify', 'canvg'],
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
const page = await browser.newPage();
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
  window.crop = async (c, box) => {
    const k = c.width / box.pw;
    const im = c
      .getContext('2d')
      .getImageData(
        Math.max(0, Math.floor((box.x - 2) * k)),
        Math.max(0, Math.floor((box.y - 2) * k)),
        Math.ceil((box.w + 4) * k),
        Math.ceil((box.w + 4) * k),
      );
    const buf = new Uint8Array(im.data.buffer);
    let s = '';
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { w: im.width, h: im.height, d: btoa(s) };
  };
});

const CONTACT = {
  name: 'Ananya Deshpande',
  title: 'Regional Manager',
  company: 'Shree Krishna Traders',
  phone: '+91 98765 43210',
  email: 'ananya@krishnatraders.example',
  website: 'krishnatraders.example',
  address: 'Station Road, Thane West',
};
const makeDoc = (qr, fields) => ({
  v: 1,
  fonts: { heading: 'inter', body: 'inter' },
  palette: { ink: '#111111' },
  fields,
  sides: {
    front: {
      background: '#FFFFFF',
      elements: [{ id: 'qr', type: 'qr', x: 30, y: 12, light: '#FFFFFF', dark: '#111111', quiet: 2, ...qr }],
    },
    back: { background: '#FFFFFF', elements: [] },
  },
});

const cases = [
  ...BODY_SHAPES.map((body) => ({ label: `module ${body}`, style: { body } })),
  ...FRAME_SHAPES.map((frame) => ({ label: `frame ${frame}`, style: { frame } })),
  ...BALL_SHAPES.map((ball) => ({ label: `centre ${ball}`, style: { ball } })),
  {
    label: 'colours',
    style: { dark: '#16325C', frameColor: '#B5125F', ballColor: '#0B6E6E', body: 'rounded', frame: 'round', ball: 'circle' },
  },
];
const contents = [
  { label: 'link, 18 mm', qr: { data: 'website', w: 18 }, fields: { website: 'krishnatraders.example' } },
  { label: 'contact, 26 mm', qr: { data: 'vcard', w: 26 }, fields: CONTACT },
  {
    label: 'UPI, 20 mm',
    qr: { qrKind: 'upi', qrIn: { value: 'krishna.traders@okhdfc', name: 'Shree Krishna Traders' }, data: '', w: 20 },
    fields: CONTACT,
  },
];
const logos = [
  { label: 'no logo', extra: {} },
  { label: 'icon logo', extra: { qrLogo: 'icon', qrIcon: 'phone', qrLogoSize: 0.22 } },
  { label: 'large icon logo', extra: { qrLogo: 'icon', qrIcon: 'star', qrLogoSize: 0.3 } },
];

const DPIS = [600, 300, 450];
const failures = [];
let scans = 0;
const read = (pixels) => {
  const found = jsQR(new Uint8ClampedArray(Buffer.from(pixels.d, 'base64')), pixels.w, pixels.h, { inversionAttempts: 'dontInvert' });
  scans++;
  return found ? found.data : null;
};
const check = async (render, expected, label) => {
  let wrong = false;
  for (const dpi of DPIS) {
    const data = read(await render(dpi));
    if (data === expected) return;
    if (data) wrong = true;
  }
  failures.push(`${label}: ${wrong ? 'scanned to different data' : 'did not scan'}`);
};

for (const c of cases) {
  for (const content of contents) {
    for (const logo of logos) {
      const doc = makeDoc({ ...content.qr, ...c.style, ...logo.extra }, content.fields);
      await engine.ensure(fontsUsed(doc));
      const payload = resolveSide(doc, 'front', engine).ops.find((o) => o.qr).qr.payload;
      const { svg } = sideToSvg(doc, 'front', engine, { bleed: false });
      const box = { x: 30, y: 12, w: content.qr.w, pw: 88.9 };
      const label = `${c.label} / ${content.label} / ${logo.label}`;
      await check(
        (dpi) => page.evaluate(async ({ svg, box, dpi }) => window.crop(await lab.svgToCanvas(svg, dpi), box), { svg, box, dpi }),
        payload,
        `${label} / PNG`,
      );
      // PDF for the worst content only: every shape once with a logo and once without keeps the run short.
      if (content.label.startsWith('contact') && logo.label !== 'large icon logo') {
        const pages = [printPageSvg(doc, 'front', engine, { marks: false })];
        await check(
          (dpi) =>
            page.evaluate(
              async ({ pages, box, dpi }) => {
                const blob = await lab.svgsToPdf(pages, { jsPDF: lab.jsPDF, svg2pdf: lab.svg2pdf }, { title: 'test' });
                const d = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
                const pg = await d.getPage(1);
                const vp = pg.getViewport({ scale: dpi / 72 });
                const c2 = document.createElement('canvas');
                c2.width = Math.ceil(vp.width);
                c2.height = Math.ceil(vp.height);
                await pg.render({ canvasContext: c2.getContext('2d'), viewport: vp, canvas: c2 }).promise;
                return window.crop(c2, { ...box, x: box.x + 3, y: box.y + 3, pw: 94.9 });
              },
              { pages, box, dpi },
            ),
          payload,
          `${label} / PDF`,
        );
      }
    }
  }
}
await browser.close();

console.log(`${scans} scans of ${cases.length} styles, ${contents.length} kinds of content and ${logos.length} logo settings`);
const byStyle = new Map();
for (const f of failures) {
  const k = f.split(' / ')[0];
  byStyle.set(k, (byStyle.get(k) ?? 0) + 1);
}
for (const [k, n] of byStyle) console.log(`  ${k}: ${n} failed`);
if (failures.length) {
  console.log(failures.slice(0, 40).join('\n'));
  console.log(`\n${failures.length} FAILURES`);
  process.exit(1);
}
console.log('All QR styles scan.');
