// Drives the QR code generator in a real browser, the way a person would. Needs a built public/ folder.
//   CARD_PW_DIR=<folder with playwright, jsqr> node card/tools/qr-tool-e2e.mjs <output folder>
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pub = join(root, 'public');
const outDir = process.argv[2];
if (!outDir) throw new Error('Give an output folder');
mkdirSync(outDir, { recursive: true });
const req = createRequire(join(process.env.CARD_PW_DIR || '.', 'x.js'));
const pw = req('playwright');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};
const server = http.createServer((q, r) => {
  let f = join(pub, decodeURIComponent(q.url.split('?')[0]));
  if (existsSync(`${f}.html`)) f += '.html';
  else if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) {
    r.writeHead(404);
    return r.end();
  }
  r.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream' });
  createReadStream(f).pipe(r);
});
await new Promise((res) => server.listen(0, '127.0.0.1', res));
const base = `http://127.0.0.1:${server.address().port}`;

let failed = 0;
const check = (ok, msg) => {
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${msg}`);
};

const browsers = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(browsers)[0];
const exe = join(
  browsers,
  sub,
  readdirSync(join(browsers, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });

const ok = (page) => page.locator('[data-scan="ok"]').waitFor({ timeout: 20000 });
const settle = (page) => page.waitForTimeout(350);

console.log('Desktop');
{
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/tools/qr-code-generator`, { waitUntil: 'load' });
  await ok(page);
  check(true, 'opens with a working code');
  await page.screenshot({ path: join(outDir, 'desktop-1.png') });

  // Every content type, filled in as a person would
  const fill = async (label, v) => page.getByLabel(label, { exact: true }).fill(v);
  const kind = (k) => page.locator('.qt-kinds button', { hasText: new RegExp(`^${k}$`) }).click();
  const types = [
    ['Link', async () => fill('Website or link', 'krishnatraders.example/menu')],
    [
      'Contact',
      async () => {
        await fill('Name', 'Ananya Deshpande');
        await fill('Business', 'Shree Krishna Traders');
        await fill('Phone', '+91 98765 43210');
        await fill('Address', 'स्टेशन रोड, ठाणे पश्चिम');
      },
    ],
    ['WhatsApp', async () => fill('WhatsApp number', '98765 43210')],
    ['UPI payment', async () => fill('UPI ID', 'krishna.traders@okhdfc')],
    ['Wi-Fi', async () => fill('Network name', 'Cafe Guest')],
    ['Location', async () => fill('Maps link or address', 'Station Road, Thane West')],
    ['Phone call', async () => fill('Phone number', '+91 98765 43210')],
    ['SMS', async () => fill('Phone number', '+91 98765 43210')],
    ['Email', async () => fill('Email address', 'hello@krishnatraders.example')],
    ['Text', async () => fill('Your text', 'नमस्ते, thank you for visiting')],
  ];
  for (const [name, act] of types) {
    await kind(name);
    await settle(page);
    await act();
    await settle(page);
    await ok(page);
    check(true, `${name} code scans`);
  }
  await kind('UPI payment');
  await fill('UPI ID', 'not-a-upi-id');
  await page.locator('[data-scan="empty"]').waitFor({ timeout: 8000 });
  check(await page.locator('.qt-downloads button').first().isDisabled(), 'a wrong UPI ID makes no code, and downloads wait');
  await fill('UPI ID', 'krishna.traders@okhdfc');
  await kind('Link');
  await settle(page);

  // Every quick style
  const presets = page.locator('.qt-presets button');
  const n = await presets.count();
  for (let i = 0; i < n; i++) {
    await presets.nth(i).click();
    await settle(page);
    await ok(page);
  }
  check(n === 8, `all ${n} quick styles scan`);
  await page.screenshot({ path: join(outDir, 'desktop-2-style.png') });

  // Colours that can't work are called out
  await page.getByRole('button', { name: /Colours/ }).click();
  await page
    .locator('.qt-colour', { hasText: /^Code/ })
    .first()
    .locator('input')
    .evaluate((el) => {
      el.value = '#EEEEEE';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  await page.locator('.qt-warn').first().waitFor({ timeout: 8000 });
  check(true, 'a pale code on white gets a warning');
  await page.locator('.qt-presets button').first().click();
  await settle(page);

  // Logo: icon and upload
  await page.getByRole('button', { name: /Logo and frame/ }).click();
  await page.locator('.qt-seg button', { hasText: 'Icon' }).click();
  await settle(page);
  await ok(page);
  check(true, 'a centre icon still scans');
  const png = join(outDir, 'logo.png');
  writeFileSync(
    png,
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAMTRDfW1jxdCAAAAAElFTkSuQmCC', 'base64'),
  );
  await page.locator('.qt-seg button', { hasText: 'Upload' }).click();
  await page.locator('.qt-upload input').setInputFiles(png);
  await settle(page);
  await ok(page);
  check(true, 'an uploaded logo still scans');

  // Frames, with a Hindi label: this loads the text engine only now
  for (const f of ['Label below', 'Label above', 'Pill', 'Outline']) {
    await page.locator('.qt-seg--wrap button', { hasText: f }).click();
    await settle(page);
    await ok(page);
  }
  check(true, 'all four frames scan');
  await page.getByLabel('Label', { exact: true }).fill('यहाँ स्कैन करें');
  await settle(page);
  await ok(page);
  await page.screenshot({ path: join(outDir, 'desktop-3-frame.png') });
  check(true, 'a Hindi label renders and scans');

  // Downloads
  const grab = async (label) => {
    const [d] = await Promise.all([page.waitForEvent('download'), page.locator('.qt-downloads button', { hasText: label }).click()]);
    const p = join(outDir, d.suggestedFilename());
    await d.saveAs(p);
    return p;
  };
  const pngFile = readFileSync(await grab('Download PNG'));
  check(
    pngFile.toString('latin1', 1, 4) === 'PNG' && Math.max(pngFile.readUInt32BE(16), pngFile.readUInt32BE(20)) === 2048,
    'PNG downloads at 2048 px',
  );
  const svgFile = readFileSync(await grab('SVG'), 'utf8');
  check(svgFile.startsWith('<svg') && !/<text\b|<script/i.test(svgFile), 'SVG is outlined, with no scripts');
  const pdfFile = readFileSync(await grab('PDF'));
  check(pdfFile.subarray(0, 5).toString() === '%PDF-', `PDF saved (${Math.round(pdfFile.length / 1024)} KB)`);

  // Nothing leaves the browser
  const calls = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) calls.push(r.url());
  });
  await page.locator('.qt-presets button').nth(1).click();
  await settle(page);
  check(calls.length === 0, 'making a code sends nothing out');

  // Choices come back after a reload
  await page.reload({ waitUntil: 'load' });
  await ok(page);
  check((await page.getByRole('button', { name: /Logo and frame/ }).count()) === 1, 'still works after reloading');

  // Onto a visiting card
  await page.getByRole('button', { name: 'Put this on a visiting card →' }).click();
  await page.waitForURL(/addqr=1/, { timeout: 15000 });
  await page.locator('[data-qrscan="ok"]').waitFor({ timeout: 25000 });
  check(true, 'the code opens on a card in the editor, selected, and scans');
  check((await page.getByLabel('Paste your link').inputValue()).length > 0, 'the editor shows the link it came with');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, 'desktop-4-card.png') });
  check(errors.length === 0, `no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

console.log('Phone (emulated)');
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/tools/qr-code-generator`, { waitUntil: 'load' });
  await ok(page);
  await page.locator('.qt').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, 'phone-1.png') });
  check((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, 'no sideways page scroll');
  await page.locator('.qt-presets button').nth(2).tap();
  await settle(page);
  await ok(page);
  check(true, 'tapping a style works');
  const tiny = await page.$$eval(
    '.qt button',
    (list) => list.filter((b) => b.getBoundingClientRect().height < 36 && b.getBoundingClientRect().height > 0).length,
  );
  check(tiny === 0, `buttons are big enough to tap (${tiny} too small)`);
  const [d] = await Promise.all([page.waitForEvent('download'), page.locator('.qt-downloads button', { hasText: 'Download PNG' }).tap()]);
  check(!!d.suggestedFilename(), 'PNG downloads on a phone');
  check(errors.length === 0, 'no page errors');
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} FAILURES` : '\nAll QR tool checks passed.');
process.exit(failed ? 1 : 0);
