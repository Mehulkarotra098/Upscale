// Local stand-in for Vercel: serves public/ (clean URLs), applies vercel.json redirects/rewrites/headers and runs api/*.js.
// Usage: npm run build && npm run dev   (reads .env.local; needs a Postgres in DATABASE_URL)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 8787);

// .env.local → process.env (before importing handlers)
for (const f of ['.env.local', '.env']) {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // no such file: that's fine
  }
}

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const toRe = (src) =>
  new RegExp(
    '^' +
      src
        .replace(/[.]/g, '\\.')
        .replace(/\/:(\w+)\*/g, '(?:/(?<$1>.*))?')
        .replace(/:(\w+)/g, '(?<$1>[^/]+)')
        .replace(/\(\.\*\)/g, '(.*)') +
      '$',
  );
const rewrites = (cfg.rewrites || []).map((r) => ({ re: toRe(r.source), dest: r.destination }));
const redirects = (cfg.redirects || []).map((r) => ({ re: toRe(r.source), dest: r.destination, code: r.permanent ? 308 : 307 }));
const headerRules = (cfg.headers || []).map((h) => ({
  re: new RegExp('^' + h.source.replace(/\(\.\*\)/g, '(.*)') + '$'),
  headers: h.headers,
}));
const sub = (dest, g) => dest.replace(/:(\w+)/g, (_, k) => encodeURIComponent(g?.[k] ?? ''));
const handlers = {};
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function staticFile(p) {
  const clean = decodeURIComponent(p).replace(/\.\.+/g, '');
  const tries = [clean, clean + '.html', path.join(clean, 'index.html')];
  for (const t of tries) {
    const f = path.join(PUB, t);
    if (f.startsWith(PUB) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

async function runApi(name, req, res, search) {
  if (!handlers[name]) handlers[name] = (await import(pathToFileURL(path.join(ROOT, 'api', name + '.js')).href)).default;
  req.url = `/api/${name}${search}`;
  return handlers[name](req, res);
}

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    for (const h of headerRules) if (h.re.test(u.pathname)) for (const { key, value } of h.headers) res.setHeader(key, value);
    try {
      for (const r of redirects) {
        const m = u.pathname.match(r.re);
        if (m) {
          res.writeHead(r.code, { Location: sub(r.dest, m.groups) });
          return res.end();
        }
      }
      if (u.pathname.endsWith('.html') && u.pathname !== '/admin/index.html') {
        res.writeHead(308, { Location: u.pathname.replace(/(index)?\.html$/, '') || '/' });
        return res.end();
      }
      const file = u.pathname.startsWith('/api/') ? null : staticFile(u.pathname);
      if (file) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        return fs.createReadStream(file).pipe(res);
      }
      let target = null;
      for (const r of rewrites) {
        const m = u.pathname.match(r.re);
        if (m) {
          target = new URL(sub(r.dest, m.groups), 'http://x');
          break;
        }
      }
      const dest = target || u;
      if (target) for (const [k, v] of u.searchParams) if (!dest.searchParams.has(k)) dest.searchParams.set(k, v);
      const api = dest.pathname.match(/^\/api\/([a-z]+)$/);
      if (api) return await runApi(api[1], req, res, dest.search);
      if (target) {
        const f = staticFile(dest.pathname);
        if (f) {
          res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'text/html' });
          return fs.createReadStream(f).pipe(res);
        }
      }
      const nf = path.join(PUB, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    } catch (e) {
      console.error(e);
      if (!res.headersSent) res.writeHead(500);
      res.end('dev server error');
    }
  })
  .on('error', (e) => {
    console.error(
      e.code === 'EADDRINUSE' ? `dev: port ${PORT} is already in use (another dev server running?). Try PORT=8788 npm run dev` : e,
    );
    process.exit(1);
  })
  .listen(PORT, () => console.log(`dev: http://localhost:${PORT}`));
