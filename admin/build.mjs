// Bundles the admin SPA (Preact + TipTap) into public/admin/. Run after the site build.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'admin');
mkdirSync(out, { recursive: true });

await build({
  entryPoints: { app: join(root, 'admin/src/main.jsx') },
  outdir: out,
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  jsxImportSource: 'preact',
  legalComments: 'none',
  logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"' },
});

const v = (f) =>
  createHash('sha1')
    .update(readFileSync(join(out, f)))
    .digest('hex')
    .slice(0, 10);
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Blog admin · U Scale</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/admin/app.css?v=${v('app.css')}">
</head>
<body>
<div id="app"></div>
<script type="module" src="/admin/app.js?v=${v('app.js')}"></script>
</body>
</html>
`,
);
console.log('admin built →', out);
