// Looks for what a person would call broken layout, in both tools: text cut off or spilling out of its button or panel,
// anything running off the screen, and buttons too small to tap. Every panel, four screen widths, English and Hinglish.
//   CARD_PW_DIR=<folder with playwright> node card/tools/ui-audit.mjs <output folder>
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

const browsers = join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium_headless_shell-1248');
const sub = readdirSync(browsers)[0];
const exe = join(
  browsers,
  sub,
  readdirSync(join(browsers, sub)).find((f) => f.endsWith('.exe') && f.includes('headless')),
);
const browser = await pw.chromium.launch({ executablePath: exe });

/** Runs in the page: every piece of visible text must sit inside its button or box, and inside the screen. */
const inspect = (scopeSel, touch) => {
  const out = [];
  const say = (el, why) => {
    const text = (el.innerText || el.getAttribute?.('aria-label') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
    out.push(
      `${why}: "${text}" <${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? ` .${el.className.split(' ')[0]}` : ''}>`,
    );
  };
  const scope = document.querySelector(scopeSel) ?? document.body;
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + 1) out.push(`page scrolls sideways by ${document.documentElement.scrollWidth - vw}px`);
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim()) continue;
    const el = node.parentElement;
    if (!el || seen.has(el) || !visible(el) || ['SCRIPT', 'STYLE', 'OPTION'].includes(el.tagName)) continue;
    seen.add(el);
    const range = document.createRange();
    range.selectNodeContents(node);
    const t = range.getBoundingClientRect();
    // A row that scrolls sideways on purpose, such as the design filters, is allowed to run past the edge.
    const inScroller = (e) => {
      for (let p = e.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true;
      }
      return false;
    };
    if ((t.left < -1 || t.right > vw + 1) && !inScroller(el)) say(el, 'runs off the screen');
    const box = el.closest('button, label, a, select, .ce-mini, .ce-add, .qt-sec');
    if (box && visible(box)) {
      const b = box.getBoundingClientRect();
      if (t.left < b.left - 1 || t.right > b.right + 1) say(el, 'text spills out of its box');
      if (t.top < b.top - 2 || t.bottom > b.bottom + 2) say(el, 'text spills out of its box');
    }
  }
  for (const el of scope.querySelectorAll('button, a, select, input, textarea, label')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      let scrolls = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) scrolls = true;
      }
      if (!scrolls) say(el, 'runs off the screen');
    }
    if (s.overflow !== 'visible' && el.scrollWidth > el.clientWidth + 2 && !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      say(el, 'text cut off');
    if (touch && el.matches('button, select') && r.height < 34 && r.width > 0) say(el, `too small to tap (${Math.round(r.height)}px)`);
  }
  // Internal colour names must never reach people.
  for (const el of scope.querySelectorAll('button')) {
    if (/\b\w+ → \w+\b/.test(el.innerText) && !el.innerText.includes('card')) say(el, 'shows an internal name');
  }
  return [...new Set(out)];
};

const problems = [];
const check = async (page, name, scope, touch) => {
  const list = await page.evaluate(({ src, scope, touch }) => (0, eval)(`(${src})`)(scope, touch), {
    src: inspect.toString(),
    scope,
    touch,
  });
  for (const p of list) problems.push(`${name}: ${p}`);
};

for (const [w, h, touch] of [
  [1360, 860, false],
  [1024, 768, false],
  [768, 1024, true],
  [390, 844, true],
]) {
  for (const lang of ['en', 'hl']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    await ctx.addInitScript((l) => localStorage.setItem('us-card-ui-lang', l), lang);
    const page = await ctx.newPage();
    const tag = `${w}px ${lang}`;

    // Card editor
    await page.goto(`${base}/tools/visiting-card-maker/editor`, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    const tabs = page.locator('.ce-nav button');
    const n = await tabs.count();
    await check(page, `${tag} editor top bar`, '.ce-top', touch);
    await check(page, `${tag} editor tabs`, '.ce-nav', touch);
    for (let i = 0; i < n; i++) {
      const label = (await tabs.nth(i).innerText()).trim();
      const pressed = await tabs.nth(i).getAttribute('aria-pressed');
      if (pressed !== 'true') await tabs.nth(i).click();
      await page.waitForTimeout(350);
      await check(page, `${tag} editor panel ${label}`, '.ce-side', touch);
      if (w === 390 && lang === 'en') await page.screenshot({ path: join(outDir, `editor-${w}-${i}.png`) });
    }
    // A selected QR code, and its toolbar
    await tabs.nth(3).click();
    await page.waitForTimeout(250);
    const add = page.locator('.ce-side .ce-qrcta');
    if ((await add.count()) === 0) await tabs.nth(3).click();
    await page.locator('.ce-side .ce-qrcta').first().click();
    await page.waitForTimeout(1000);
    await check(page, `${tag} editor QR panel`, '.ce-side', touch);
    await check(page, `${tag} editor toolbar`, '.ce-float', touch);
    if (w === 1360 && lang === 'en') await page.screenshot({ path: join(outDir, 'editor-qr.png') });

    // QR tool, every type
    await page.goto(`${base}/tools/qr-code-generator`, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    for (const name of ['Colours', 'Logo and frame', 'Logo aur frame']) {
      const b = page.locator('.qt-sec h3 button', { hasText: name });
      if ((await b.count()) && (await b.first().getAttribute('aria-expanded')) === 'false') await b.first().click();
    }
    const kinds = page.locator('.qt-kinds button');
    const k = await kinds.count();
    for (let i = 0; i < k; i++) {
      await kinds.nth(i).click();
      await page.waitForTimeout(260);
      const label = (await kinds.nth(i).innerText()).trim();
      await check(page, `${tag} QR tool ${label}`, '.qt', touch);
      const blank = await page.evaluate(() => !document.querySelector('.qt-preview img'));
      if (blank) problems.push(`${tag} QR tool ${label}: the preview is blank`);
    }
    if (lang === 'en') await page.screenshot({ path: join(outDir, `qr-${w}.png`), fullPage: true });
    await ctx.close();
  }
}

await browser.close();
server.close();
const unique = [...new Set(problems)];
console.log(unique.length ? unique.slice(0, 70).join('\n') : 'No layout problems.');
console.log(`\n${unique.length} problems`);
process.exit(unique.length ? 1 : 0);
