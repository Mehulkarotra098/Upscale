// The static build writes public/_blog/pages.json: every static page with the date its content last changed.
// The daily cron compares it with what IndexNow was last told, so Bing (and through it ChatGPT search and Copilot)
// recrawls a page soon after its content changes. Missing or unreadable file → nothing to announce.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILES = [path.join(process.cwd(), 'public', '_blog', 'pages.json'), path.join(ROOT, 'public', '_blog', 'pages.json')];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function staticPages(site) {
  for (const f of FILES) {
    try {
      const list = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (Array.isArray(list))
        return list.filter((p) => typeof p?.url === 'string' && p.url.startsWith(site) && DATE.test(p.lastmod || ''));
    } catch {
      // try the next location
    }
  }
  return [];
}

/** Pages whose content date differs from the one last announced (or that were never announced). */
export const changedPages = (pages, knownRows) => {
  const seen = new Map(knownRows.map((r) => [r.url, r.lastmod]));
  return pages.filter((p) => seen.get(p.url) !== p.lastmod);
};
