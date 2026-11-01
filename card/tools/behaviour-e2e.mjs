// Checks the things that surprise people rather than crash: the cursor jumping while typing, a QR code dancing on every
// key, undo not really undoing, settings lost when switching design or reloading.
//   CARD_PW_DIR=<folder with playwright> node card/tools/behaviour-e2e.mjs <output folder>
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
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
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
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
const browsers = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(browsers)[0];
const exe = join(
  browsers,
  sub,
  readdirSync(join(browsers, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });

let failed = 0;
const check = (ok, msg) => {
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${msg}`);
};
const attempt = async (name, fn) => {
  try {
    await fn();
  } catch (e) {
    check(
      false,
      `${name}: ${String(e.message)
        // eslint-disable-next-line no-control-regex
        .replace(/\x1b\[[0-9;]*m/g, '')
        .split('\n')
        .slice(0, 3)
        .join(' ')
        .slice(0, 260)}`,
    );
  }
};

const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const tab = async (name) => {
  const b = page.locator('.ce-nav button', { hasText: new RegExp(`^${name}$`) });
  if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  await page.waitForTimeout(120);
};
const field = (label) => page.getByLabel(label, { exact: true });
/** Typing in the middle of a word must leave the cursor where it was. */
const caretHolds = async (input, what) => {
  await input.click();
  await input.fill('Northline');
  await input.press('Home');
  await page.keyboard.type('AB', { delay: 40 });
  await page.waitForTimeout(150);
  const value = await input.inputValue();
  check(value.startsWith('AB'), `${what}: the cursor stays put while typing (${value.slice(0, 12)})`);
  check(await input.evaluate((el) => document.activeElement === el), `${what}: the box keeps focus while typing`);
};
const hashRight = () =>
  page.evaluate(() => {
    const c = document.querySelector('canvas.lower-canvas');
    const x = Math.floor(c.width * 0.74);
    const im = c.getContext('2d').getImageData(x, 0, c.width - x, c.height).data;
    let h = 0;
    for (let i = 0; i < im.length; i += 4) h = (h * 31 + im[i] + im[i + 1] * 3 + im[i + 2] * 7) >>> 0;
    return h;
  });

await attempt('editor', async () => {
  console.log('Typing');
  await page.goto(`${base}/tools/visiting-card-maker/editor?design=ticket`, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await tab('Details');
  for (const label of ['Name', 'Business', 'Website', 'Address']) await caretHolds(field(label), `Details, ${label}`);

  console.log('A QR code while typing');
  await field('Business').fill('Northline');
  await field('Business').blur();
  await page.waitForTimeout(1000);
  const still = await hashRight();
  await field('Business').click();
  await page.keyboard.type(' Log', { delay: 60 });
  await page.waitForTimeout(1100);
  check((await hashRight()) === still, 'typing the business name leaves the QR code alone');
  await field('Website').fill('northline.example');
  await field('Website').blur();
  await page.waitForTimeout(1100);
  check((await hashRight()) !== still, 'typing a website updates the code, which opens that site');

  console.log('Undo');
  await field('Business').fill('First Name Co');
  await field('Business').blur();
  await page.waitForTimeout(300);
  await field('Business').fill('Second Name Co');
  await field('Business').blur();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.waitForTimeout(200);
  check((await field('Business').inputValue()) === 'First Name Co', 'undo brings back the last value');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.waitForTimeout(200);
  check((await field('Business').inputValue()) === 'Second Name Co', 'redo brings the new one back');

  console.log('QR settings stay');
  await page.locator('.ce-qrcta').click();
  await page.locator('label.ce-field', { hasText: 'What the code opens' }).locator('select').waitFor();
  const kind = () => page.locator('label.ce-field', { hasText: 'What the code opens' }).locator('select');
  await kind().selectOption('upi');
  await page.getByLabel('UPI ID').fill('northline@okhdfc');
  await page.getByLabel('UPI ID').blur();
  await page.getByRole('button', { name: 'Modules: dots', exact: true }).click();
  await page.waitForTimeout(300);
  const stillSet = async (what) => {
    check((await kind().inputValue()) === 'upi', `${what}: still a UPI code`);
    check((await page.getByLabel('UPI ID').inputValue()) === 'northline@okhdfc', `${what}: UPI ID kept`);
    check(
      (await page.getByRole('button', { name: 'Modules: dots', exact: true }).getAttribute('aria-pressed')) === 'true',
      `${what}: shape kept`,
    );
  };
  await caretHolds(page.getByLabel('UPI ID'), 'QR panel, UPI ID');
  await page.getByLabel('UPI ID').fill('northline@okhdfc');
  await page.getByLabel('UPI ID').blur();
  await page.waitForTimeout(600);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await tab('Details');
  await page.locator('.ce-qrcta').click();
  await kind().waitFor();
  await stillSet('after reloading');

  await tab('Colours');
  await page.locator('.ce-side .ce-palette').nth(1).click();
  await page.waitForTimeout(250);
  await tab('Details');
  await page.locator('.ce-qrcta').click();
  await kind().waitFor();
  await stillSet('after changing colour set');

  await tab('Designs');
  await page.locator('.ce-tpl').nth(1).click();
  await page.waitForTimeout(800);
  await tab('Details');
  check((await field('Business').inputValue()) === 'Second Name Co', 'switching design keeps the details');
  await page.locator('.ce-qrcta').click();
  await kind().waitFor();
  await stillSet('after switching design');

  console.log('Delete and undo');
  const hint = page.getByRole('button', { name: 'Delete', exact: true }).first();
  await hint.click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.waitForTimeout(250);
  await tab('Details');
  await page.locator('.ce-qrcta').click();
  await kind().waitFor();
  await stillSet('after deleting and undoing');

  console.log('Empty and huge details');
  await tab('Details');
  for (const label of ['Name', 'Job title', 'Business', 'Tagline', 'Phone', 'WhatsApp', 'Email', 'Website', 'Address', 'Timings'])
    await field(label).fill('');
  await page.waitForTimeout(400);
  check(errors.length === 0, 'clearing every detail breaks nothing');
  await field('Business').fill('W'.repeat(200));
  await page.waitForTimeout(500);
  check(errors.length === 0, 'a very long business name breaks nothing');
  await page.screenshot({ path: join(outDir, 'long-name.png') });
  await field('Business').fill('😀');
  await page.waitForTimeout(150);
  check(!(await field('Business').inputValue()).includes('😀'), 'emoji are refused');
  check(errors.length === 0, 'and nothing breaks');
});

await attempt('QR tool', async () => {
  console.log('QR tool');
  await page.goto(`${base}/tools/qr-code-generator`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const kind = (k) => page.locator('.qt-kinds button', { hasText: new RegExp(`^${k}$`) }).click();
  await kind('Link');
  await caretHolds(page.getByLabel('Website or link', { exact: true }), 'QR tool, link');
  await page.getByLabel('Website or link', { exact: true }).fill('https://first.example');
  await kind('UPI payment');
  await page.getByLabel('UPI ID', { exact: true }).fill('a@okhdfc');
  await kind('Link');
  await page.waitForTimeout(150);
  check(
    (await page.getByLabel('Website or link', { exact: true }).inputValue()) === 'https://first.example',
    'switching type keeps what was typed',
  );
  await page.locator('.qt-presets button').nth(3).click();
  await page.waitForTimeout(150);
  check(
    (await page.getByLabel('Website or link', { exact: true }).inputValue()) === 'https://first.example',
    'a quick style keeps the content',
  );
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(800);
  check(
    (await page.getByLabel('Website or link', { exact: true }).inputValue()) === 'https://first.example',
    'reloading keeps the content',
  );
  check(errors.length === 0, `no page errors ${errors.slice(0, 2).join(' | ')}`);
});

await browser.close();
server.close();
console.log(failed ? `\n${failed} FAILURES` : '\nAll behaviour checks passed.');
process.exit(failed ? 1 : 0);
