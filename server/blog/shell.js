// Blog pages render inside the same chrome as every other page (header, mobile menu, footer, WhatsApp button).
// The static build writes that chrome to public/_blog/shell.html with <!--HEAD--> and <!--MAIN--> slots.
// Lookup order: the copy bundled with the function (vercel.json includeFiles) → the deployed static copy → a minimal
// built-in page, so a blog page always renders.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GTM_BODY, GTM_HEAD } from '../lib/gtm.js';
import { log } from '../lib/log.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILES = [path.join(process.cwd(), 'public', '_blog', 'shell.html'), path.join(ROOT, 'public', '_blog', 'shell.html')];

// Site CSS/JS are cached for a year by URL, so the fallback gets its own version per function instance.
const V = Date.now().toString(36);
const FALLBACK = `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8">${GTM_HEAD}<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!--HEAD-->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${V}"><link rel="stylesheet" href="/blog.css?v=${V}">
</head><body class="page-sub page-blog">${GTM_BODY}<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap"><a class="brand" href="/" aria-label="U Scale home"><b style="font:400 28px/1 var(--display);color:var(--violet)">uscale</b></a>
<nav class="nav" aria-label="Main"><ul><li><a href="/#services">Services</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/blog">Blog</a></li><li><a href="/#contact">Contact</a></li></ul></nav></div></header>
<main id="main"><!--MAIN--></main>
<footer class="site-footer on-dark" data-tone="dark"><div class="wrap footer__bottom"><p>© U Scale by Mehul Karotra · Mumbai, India.</p></div></footer>
<script defer src="/blog.js?v=${V}"></script></body></html>`;

let cached = null;

function readBundled() {
  for (const file of FILES) {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch {
      // try the next location
    }
  }
  return null;
}

async function fetchDeployed(req) {
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (!host) return null;
  const proto = /^(localhost|127\.)/.test(host) ? 'http' : 'https';
  try {
    const res = await fetch(`${proto}://${host}/_blog/shell`, { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** The page chrome. Cached for the life of the function instance once found. */
export async function getShell(req) {
  cached ??= readBundled() ?? (await fetchDeployed(req));
  if (cached?.includes('<!--MAIN-->')) return cached;
  cached = null;
  log.warn('blog', 'page shell not found, using the built-in fallback');
  return FALLBACK;
}

/** Put head tags and page content into the chrome. */
export const fillShell = (shell, { head, main }) => shell.replace('<!--HEAD-->', () => head).replace('<!--MAIN-->', () => main);
