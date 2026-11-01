// Build-time guard: load every Vercel function the way Vercel's runtime does (no require() of ES modules)
// and run the content pipeline once, so a dependency that only works on newer local Node fails the build
// instead of crashing the live site with FUNCTION_INVOCATION_FAILED.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FLAG = '--no-experimental-require-module';

if (process.argv[2] === '--child') {
  const files = readdirSync(path.join(root, 'api')).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const m = await import(pathToFileURL(path.join(root, 'api', f)).href);
    if (typeof m.default !== 'function') throw new Error(`api/${f} has no default export handler`);
  }
  const { processContent } = await import(pathToFileURL(path.join(root, 'server/content/article.js')).href);
  const out = processContent('<h2>Check</h2><p>Text with <a href="https://example.com">a link</a>.</p>', new Map());
  if (!out.html.includes('<h2')) throw new Error('content pipeline produced no output');
  console.log(`functions ok: ${files.join(', ')}`);
} else {
  const args = process.allowedNodeEnvironmentFlags.has(FLAG) ? [FLAG] : [];
  if (!args.length) console.warn(`check-functions: ${FLAG} not supported by Node ${process.version}; checking without it`);
  const r = spawnSync(process.execPath, [...args, fileURLToPath(import.meta.url), '--child'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: '', SESSION_SECRET: '' },
  });
  process.exit(r.status ?? 1);
}
