// The blog renders inside the same chrome as every other page (header, mobile menu, footer, WhatsApp float).
// The static build writes that chrome to public/_blog/shell.html with <!--HEAD--> and <!--MAIN--> slots.
// Lookup order: the file bundled with the function (vercel.json includeFiles) → the deployed static copy → a minimal fallback.
import fs from 'node:fs';
import path from 'node:path';

let cached = null;

const FALLBACK = `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!--HEAD-->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script>document.documentElement.classList.add('js','intro-skip');</script>
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/blog.css">
</head><body class="page-sub page-blog"><a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap"><a class="brand" href="/" aria-label="U Scale home"><b style="font:400 28px/1 var(--display);color:var(--violet)">uscale</b></a>
<nav class="nav" aria-label="Main"><ul><li><a href="/#services">Services</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/blog">Blog</a></li><li><a href="/#contact">Contact</a></li></ul></nav></div></header>
<main id="main"><!--MAIN--></main>
<footer class="site-footer on-dark" data-tone="dark"><div class="wrap footer__bottom"><p>© U Scale by Mehul Karotra · Mumbai, India.</p></div></footer>
<script defer src="/blog.js"></script></body></html>`;

export async function getShell(req) {
  if (cached) return cached;
  const candidates = [
    path.join(process.cwd(), 'public', '_blog', 'shell.html'),
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', '_blog', 'shell.html'),
  ];
  for (const p of candidates) {
    try { cached = fs.readFileSync(p, 'utf8'); return cached; } catch {}
  }
  try {
    const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
    if (host) {
      const proto = /^(localhost|127\.)/.test(host) ? 'http' : 'https';
      const r = await fetch(`${proto}://${host}/_blog/shell.html`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) { cached = await r.text(); return cached; }
    }
  } catch {}
  return FALLBACK; // not cached: try again on the next request
}

export function fill(shell, head, main) {
  return shell.replace('<!--HEAD-->', () => head).replace('<!--MAIN-->', () => main);
}
