// Bundles the card maker's editor into public/card/ and writes its page. Run after the site build.
// Code is split so the PDF libraries and templates load only when needed. Hashed names can be cached forever.
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { GTM_BODY, GTM_HEAD } from '../server/lib/gtm.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = process.env.OUTPUT_DIR ? join(root, process.env.OUTPUT_DIR) : join(root, 'public');
const out = join(pub, 'card');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Budget for the code a visitor must download before they can start (everything except fonts and PDF libraries).
const START_BUDGET_KB = 335;

const result = await build({
  entryPoints: { editor: join(root, 'card/src/editor/main.jsx'), qr: join(root, 'card/src/qrtool/main.jsx') },
  outdir: out,
  bundle: true,
  splitting: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  jsx: 'automatic',
  jsxImportSource: 'preact',
  legalComments: 'none',
  logLevel: 'warning',
  chunkNames: 'c-[hash]',
  entryNames: '[name]-[hash]',
  metafile: true,
  // Optional jsPDF features and HarfBuzz's Node-only branch, none of which ever run in the browser.
  external: ['module', 'canvas', 'jsdom', 'html2canvas', 'dompurify', 'canvg'],
  define: { 'process.env.NODE_ENV': '"production"' },
});

// HarfBuzz finds its wasm file next to its own code, so the name has to stay fixed.
copyFileSync(join(root, 'node_modules/harfbuzzjs/dist/harfbuzz.wasm'), join(out, 'harfbuzz.wasm'));
const css = readFileSync(join(root, 'card/src/editor/editor.css'));
const hash = createHash('sha1').update(css).digest('hex').slice(0, 10);
writeFileSync(join(out, `editor-${hash}.css`), css);

const entryOf = (name) => Object.keys(result.metafile.outputs).find((f) => result.metafile.outputs[f].entryPoint?.endsWith(name));
const entry = entryOf('editor/main.jsx');
// The QR tool's page comes from the site build, which runs first, so its script name is filled in here.
const qrEntry = entryOf('qrtool/main.jsx').split('/').pop();
const qrPage = join(pub, 'tools', 'qr-code-generator.html');
writeFileSync(qrPage, readFileSync(qrPage, 'utf8').replace('__QR_TOOL_ENTRY__', qrEntry));
const entryName = entry.split('/').pop();
const page = join(pub, 'tools', 'visiting-card-maker');
mkdirSync(page, { recursive: true });
writeFileSync(
  join(page, 'editor.html'),
  `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
${GTM_HEAD}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#251E45">
<title>Card editor · Free visiting card maker · U Scale</title>
<link rel="canonical" href="https://uscale.in/tools/visiting-card-maker">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/card/editor-${hash}.css">
</head>
<body>${GTM_BODY}
<div id="app"><div class="ce-boot">Opening the card maker…</div></div>
<noscript><p class="ce-fail">The card maker needs JavaScript. Please turn it on, or open this page in another browser.</p></noscript>
<script type="module" src="/card/${entryName}"></script>
</body>
</html>
`,
);

// Report real download sizes, and fail the build if the startup code outgrows its budget.
const gz = (f) => gzipSync(readFileSync(f)).length / 1024;
const lazy = new Set();
const outputs = result.metafile.outputs;
const walk = (f, seen) => {
  if (seen.has(f)) return;
  seen.add(f);
  for (const i of outputs[f].imports) if (i.kind === 'import-statement' && outputs[i.path]) walk(i.path, seen);
};
const start = new Set();
walk(entry, start);
let startKb = gz(join(out, 'harfbuzz.wasm'));
for (const f of start) if (f.endsWith('.js')) startKb += gz(join(root, f));
for (const f of Object.keys(outputs)) if (f.endsWith('.js') && !start.has(f)) lazy.add(f);
const lazyKb = [...lazy].reduce((a, f) => a + gz(join(root, f)), 0);
const files = readdirSync(out).filter((f) => statSync(join(out, f)).isFile()).length;
console.log(
  `card editor built → ${out}: ${files} files, ${Math.round(startKb)} KB to start, ${Math.round(lazyKb)} KB loaded on demand (gzipped)`,
);
// The QR tool stays small: the text engine's wasm and fonts load only if someone adds a label.
const qrStart = new Set();
walk(entryOf('qrtool/main.jsx'), qrStart);
const qrKb = [...qrStart].filter((f) => f.endsWith('.js')).reduce((a, f) => a + gz(join(root, f)), 0);
console.log(`qr tool: ${Math.round(qrKb)} KB to start (gzipped)`);
if (startKb > START_BUDGET_KB) throw new Error(`Card editor start size ${Math.round(startKb)} KB is over the ${START_BUDGET_KB} KB budget`);
