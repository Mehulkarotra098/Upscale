// Static pages (home, services, pricing, tools…) and the content date IndexNow was last told about for each.
import { exec, query } from '../db/client.js';

export const known = () => query(`SELECT url, to_char(lastmod, 'YYYY-MM-DD') AS lastmod FROM site_pages`);

export const mark = (pages) =>
  exec(
    `INSERT INTO site_pages (url, lastmod) SELECT * FROM unnest($1::text[], $2::date[])
     ON CONFLICT (url) DO UPDATE SET lastmod = EXCLUDED.lastmod, pinged_at = now()`,
    [pages.map((p) => p.url), pages.map((p) => p.lastmod)],
  );
