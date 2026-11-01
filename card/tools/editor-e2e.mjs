// Drives the real editor in a browser, the way a person would. Needs a built public/ folder.
//   CARD_PW_DIR=<folder with playwright> node card/tools/editor-e2e.mjs <output folder>
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pub = join(root, 'public');
const outDir = process.argv[2];
if (!outDir) throw new Error('Give an output folder');
mkdirSync(outDir, { recursive: true });
const pw = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'))('playwright');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const tries = [p, `${p}.html`, join(p, 'index.html')].map((x) => join(pub, x));
  const file = tries.find((f) => existsSync(f) && statSync(f).isFile());
  if (!file) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/tools/visiting-card-maker/editor`;

const failures = [];
const check = (ok, msg) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`);
  if (!ok) failures.push(msg);
};

const base = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(base)[0];
const exe = join(
  base,
  sub,
  readdirSync(join(base, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });

const canvasHash = (page) =>
  page.evaluate(() => {
    const c = document.querySelector('.ce-stage canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0;
    return h;
  });

async function open(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/404|thumbs/.test(m.text())) errors.push(m.text());
  });
  await page.goto(url);
  await page.waitForSelector('.ce-stage canvas', { timeout: 30000 });
  await page.waitForTimeout(800);
  return { page, errors };
}

// ---------------------------------------------------------------- desktop
{
  console.log('Desktop');
  const context = await browser.newContext({ viewport: { width: 1360, height: 860 }, acceptDownloads: true });
  const { page, errors } = await open(context);
  await page.screenshot({ path: join(outDir, 'desktop-1-start.png') });
  check((await page.locator('.ce-tpl').count()) >= 12, 'template gallery lists designs');

  await page.getByRole('button', { name: 'Details', exact: true }).click();
  const before = await canvasHash(page);
  await page.getByLabel('Name', { exact: true }).fill('Zoya Kapoor');
  await page.getByLabel('Phone', { exact: true }).fill('+91 90000 00001');
  await page.waitForTimeout(400);
  check((await canvasHash(page)) !== before, 'typing a name changes the card');
  await page.screenshot({ path: join(outDir, 'desktop-2-details.png') });

  // Switching design keeps details
  await page.getByRole('button', { name: 'Designs', exact: true }).click();
  await page.locator('.ce-tpl').nth(2).click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Details', exact: true }).click();
  check((await page.getByLabel('Name', { exact: true }).inputValue()) === 'Zoya Kapoor', 'details stay after switching design');

  // Click, drag and undo on the canvas
  const box = await page.locator('.ce-stage').boundingBox();
  // Find something selectable the way a person does, by clicking on the card until something responds.
  let cx = 0;
  let cy = 0;
  find: for (const fy of [0.5, 0.42, 0.58, 0.36, 0.64]) {
    for (const fx of [0.62, 0.5, 0.42, 0.7, 0.34, 0.78]) {
      cx = box.x + box.width * fx;
      cy = box.y + box.height * fy;
      await page.mouse.click(cx, cy);
      await page.waitForTimeout(120);
      if (await page.locator('.ce-float').count()) break find;
    }
  }
  const hadSelection = await page.locator('.ce-field textarea, .ce-field select').count();
  check(hadSelection > 0, 'clicking the card selects an element and shows its controls');
  const h1 = await canvasHash(page);
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy + 30, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const h2 = await canvasHash(page);
  check(h1 !== h2, 'dragging moves it');
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(300);
  check((await canvasHash(page)) !== h2, 'undo reverses the drag');
  await page.getByRole('button', { name: 'Redo' }).click();
  await page.waitForTimeout(200);

  // Add and edit text
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.ce-add', { hasText: 'Text' }).first().click();
  await page.waitForTimeout(300);
  const ta = page.locator('#ce-text-input');
  check((await ta.count()) === 1, 'added text opens its editor');
  await ta.fill('नमस्ते ₹500 शाळा');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, 'desktop-3-text.png') });
  await ta.fill('Hello 😀');
  check(!(await ta.inputValue()).includes('😀'), 'emoji are refused');
  check((await page.locator('.ce-notice').count()) > 0, 'with a clear message');
  await ta.fill('नमस्ते ₹500 शाळा');

  // Add a QR code and an icon
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.ce-qrcta').click();
  await page.waitForTimeout(300);

  // Custom QR: shapes, a centre logo and another content type, each confirmed by the live scan
  const scanned = page.locator('[data-qrscan="ok"]');
  await scanned.waitFor({ timeout: 15000 });
  check(true, 'a new QR code reports that it scans');
  const qrBefore = await canvasHash(page);
  await page.getByRole('button', { name: 'Modules: dots', exact: true }).click();
  await page.getByRole('button', { name: 'Eye frame: leaf', exact: true }).click();
  await page.getByRole('button', { name: 'Eye centre: circle', exact: true }).click();
  await page.waitForTimeout(200);
  check((await canvasHash(page)) !== qrBefore, 'QR shapes change the card');
  await scanned.waitFor({ timeout: 15000 });
  check(true, 'a shaped QR code still scans');
  await page.locator('.ce-seg button', { hasText: 'Icon' }).click();
  await scanned.waitFor({ timeout: 15000 });
  check(true, 'a QR code with a centre icon still scans');
  // Every kind of code shows where its content comes from, and says so if it's still the design's sample
  const kindSelect = page.locator('label.ce-field', { hasText: 'What the code opens' }).locator('select');
  await kindSelect.selectOption('link');
  await page.waitForTimeout(250);
  const site = page.getByLabel('Paste your link');
  check((await site.count()) === 1, 'a new code has a box to paste a link');
  check((await page.locator('[data-qrsample="yes"]').count()) === 1, 'a code still on the sample website says so');
  await site.fill('instagram.com/zoyakapoor');
  await page.waitForTimeout(250);
  check(
    (await page.locator('[data-qropens="https://instagram.com/zoyakapoor"]').count()) === 1 &&
      (await page.locator('[data-qrsample="yes"]').count()) === 0,
    'pasting a link shows exactly where the code goes',
  );
  await scanned.waitFor({ timeout: 15000 });
  check(true, 'and it scans');
  await kindSelect.selectOption('whatsapp');
  await page.waitForTimeout(250);
  check((await page.getByLabel('Your WhatsApp number').count()) === 1, 'Open WhatsApp has a box for the number');
  await kindSelect.selectOption('vcard');
  await page.waitForTimeout(250);
  check((await page.getByRole('button', { name: 'Edit your contact details' }).count()) === 1, 'Save my contact leads to the details');
  await page.locator('label.ce-field', { hasText: 'What the code opens' }).locator('select').selectOption('upi');
  await page.waitForTimeout(200);
  check((await page.locator('[data-qrscan="ok"]').count()) === 0, 'a UPI code with no ID is not reported as working');
  await page.getByLabel('UPI ID').fill('zoya.kapoor@okhdfc');
  await scanned.waitFor({ timeout: 15000 });
  check(true, 'a UPI code scans once its ID is filled in');
  await page.screenshot({ path: join(outDir, 'desktop-4-qr.png') });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, 'desktop-4-qr.png') });

  // Colours
  await page.getByRole('button', { name: 'Colours', exact: true }).click();
  const h3 = await canvasHash(page);
  await page.locator('.ce-palette').nth(1).click();
  await page.waitForTimeout(300);
  check((await canvasHash(page)) !== h3, 'colour set changes the card');

  // Back side
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, 'desktop-5-back.png') });

  // Downloads
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, 'desktop-6-download.png') });
  const files = {};
  const grab = async (label) => {
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.getByRole('button', { name: label, exact: true }).click(),
    ]);
    const path = join(outDir, dl.suggestedFilename());
    await dl.saveAs(path);
    files[label] = path;
    return path;
  };
  const pdf = await grab('Print PDF');
  check(readFileSync(pdf).subarray(0, 5).toString() === '%PDF-', `print PDF saved (${Math.round(statSync(pdf).size / 1024)} KB)`);
  const pngf = await grab('PNG: Front');
  const pb = readFileSync(pngf);
  check(pb.readUInt32BE(16) === 2100 && pb.readUInt32BE(20) === 1200, 'PNG is 2100 × 1200');
  const svgf = await grab('SVG: Front');
  const sv = readFileSync(svgf, 'utf8');
  check(sv.startsWith('<svg') && !/<text\b|<script/i.test(sv), 'SVG has outlined text and no scripts');
  const sheet = await grab('A4 sheet of 10 cards (PDF)');
  check(readFileSync(sheet).subarray(0, 5).toString() === '%PDF-', `A4 sheet saved (${Math.round(statSync(sheet).size / 1024)} KB)`);
  const design = await grab('Save design file');
  const parsed = JSON.parse(readFileSync(design, 'utf8'));
  check(parsed.user.name === 'Zoya Kapoor', 'design file holds the details');
  await page.getByRole('button', { name: 'Close', exact: true }).click();

  // Autosave survives a reload
  await page.waitForTimeout(900);
  await page.reload();
  await page.waitForSelector('.ce-stage canvas');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Details', exact: true }).click();
  check((await page.getByLabel('Name', { exact: true }).inputValue()) === 'Zoya Kapoor', 'design is still there after reloading');

  // A malicious design file is cleaned or refused
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  const evil = JSON.stringify({
    v: 1,
    fonts: { heading: 'inter', body: 'inter' },
    palette: { x: '#000"><script>alert(1)</script>' },
    fields: { name: '<img src=x onerror=alert(1)>' },
    sides: {
      front: {
        background: 'red"><script>alert(1)</script>',
        elements: [
          { id: 'a', type: 'image', src: 'javascript:alert(1)', x: 1, y: 1, w: 5, h: 5 },
          { id: 'b', type: 'path', d: 'M0 0"/><script>alert(1)</script>', x: 0, y: 0, w: 1, h: 1 },
          { id: 'c', type: 'text', text: '{name}', x: 5, y: 5, w: 50, size: 10, fill: '#000' },
        ],
      },
      back: { elements: [] },
    },
  });
  await page
    .locator('input[type=file][accept*="json"]')
    .setInputFiles({ name: 'evil.json', mimeType: 'application/json', buffer: Buffer.from(evil) });
  await page.waitForTimeout(600);
  const injected = await page.evaluate(() => document.querySelectorAll('script:not([src])').length + (window.__evil ? 1 : 0));
  check(injected === 0, 'a hostile design file injects nothing');

  check(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await context.close();
}

// ---------------------------------------------------------------- phone
{
  console.log('Phone (emulated)');
  const context = await browser.newContext({ ...pw.devices['Pixel 7'], acceptDownloads: true });
  const { page, errors } = await open(context);
  await page.screenshot({ path: join(outDir, 'phone-1-start.png') });
  await page.getByRole('button', { name: 'Details', exact: true }).tap();
  await page.waitForTimeout(250);
  await page.getByLabel('Name', { exact: true }).fill('Isha Rane');
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(outDir, 'phone-2-details.png') });
  await page.locator('.ce-sheet-close').tap();
  await page.waitForTimeout(250);

  const box = await page.locator('.ce-stage').boundingBox();
  // Tap around the card until something responds, the way a person does.
  const hit = { x: 0, y: 0 };
  find: for (const fy of [0.42, 0.5, 0.36, 0.58, 0.3, 0.64]) {
    for (const fx of [0.3, 0.5, 0.2, 0.7, 0.4, 0.6]) {
      hit.x = box.x + box.width * fx;
      hit.y = box.y + box.height * fy;
      await page.touchscreen.tap(hit.x, hit.y);
      await page.waitForTimeout(180);
      if (await page.locator('.ce-float').count()) break find;
    }
  }
  check(
    (await page.evaluate(() => document.querySelector('.ce-nav').textContent.includes('Edit'))) === true,
    'tapping the card selects an element',
  );
  await page.screenshot({ path: join(outDir, 'phone-3-selected.png') });
  const h1 = await canvasHash(page);
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', hit.x, hit.y);
  for (let i = 1; i <= 10; i++) await touch('touchMove', hit.x + i * 4, hit.y + i * 2);
  await touch('touchEnd', 0, 0);
  await page.waitForTimeout(350);
  check((await canvasHash(page)) !== h1, 'a finger drag moves it');
  await page.screenshot({ path: join(outDir, 'phone-4-dragged.png') });

  await page.getByRole('button', { name: 'Edit', exact: true }).tap();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(outDir, 'phone-5-edit.png') });
  await page.getByRole('button', { name: 'Download', exact: true }).tap();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(outDir, 'phone-6-download.png') });
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.getByRole('button', { name: 'PNG: Front', exact: true }).tap(),
  ]);
  await dl.saveAs(join(outDir, 'phone-card.png'));
  check(statSync(join(outDir, 'phone-card.png')).size > 5000, 'PNG downloads on a phone');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check(!overflow, 'no sideways page scroll');
  check(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await context.close();
}

await browser.close();
server.close();
console.log(failures.length ? `\n${failures.length} FAILED:\n${failures.join('\n')}` : '\nAll editor checks passed.');
process.exit(failures.length ? 1 : 0);
