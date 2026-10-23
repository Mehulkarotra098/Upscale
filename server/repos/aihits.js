// AI search visibility log: one row per day × assistant or crawler × page, with a count. Nothing personal is kept
// (no IP, no user agent string, no cookies). Written by /api/blog?view=ai, which middleware.js calls in the background.
import { exec, one, query } from '../db/client.js';
import { TODAY } from './sql.js';

/** Count one hit (already validated by cleanHit). */
export const add = ({ type, name, kind, path }) =>
  exec(
    `INSERT INTO ai_hits (day, type, name, kind, path) VALUES (${TODAY}, $1, $2, $3, $4)
     ON CONFLICT (day, name, path) DO UPDATE SET n = ai_hits.n + 1`,
    [type, name, kind, path],
  );

/** Keep about a year of history. */
export const prune = (days = 400) => exec(`DELETE FROM ai_hits WHERE day < ${TODAY} - $1::int`, [days]);

/**
 * Everything the admin "AI search" page shows for the last `days` days. "Answers" = live fetches by an assistant
 * answering someone (ChatGPT-User, Perplexity-User…) plus visitors who clicked through from an AI answer.
 */
export async function summary(days = 30) {
  const since = `${TODAY} - ($1::int - 1)`;
  const [totals, agents, pages, daily, latest] = await Promise.all([
    one(
      `SELECT coalesce(sum(n) FILTER (WHERE kind = 'live'), 0)::int AS live,
              coalesce(sum(n) FILTER (WHERE kind = 'ref'), 0)::int AS referrals,
              coalesce(sum(n) FILTER (WHERE kind = 'index'), 0)::int AS indexed,
              coalesce(sum(n) FILTER (WHERE kind IN ('search', 'train')), 0)::int AS crawled,
              count(DISTINCT path) FILTER (WHERE kind IN ('live', 'ref'))::int AS answer_pages
       FROM ai_hits WHERE day >= ${since}`,
      [days],
    ),
    query(
      `SELECT name, kind, sum(n)::int AS n, count(DISTINCT path)::int AS pages, to_char(max(day), 'YYYY-MM-DD') AS last
       FROM ai_hits WHERE day >= ${since} GROUP BY name, kind ORDER BY sum(n) DESC LIMIT 30`,
      [days],
    ),
    query(
      `SELECT path, coalesce(sum(n) FILTER (WHERE kind IN ('live', 'ref')), 0)::int AS answers,
              coalesce(sum(n) FILTER (WHERE kind = 'index'), 0)::int AS indexed, sum(n)::int AS n
       FROM ai_hits WHERE day >= ${since} AND path <> '(other)'
       GROUP BY path ORDER BY 2 DESC, 3 DESC, 4 DESC LIMIT 15`,
      [days],
    ),
    query(
      `SELECT to_char(d, 'YYYY-MM-DD') AS day,
              coalesce(sum(h.n) FILTER (WHERE h.kind IN ('live', 'ref')), 0)::int AS answers,
              coalesce(sum(h.n), 0)::int AS n
       FROM generate_series(${since}, ${TODAY}, interval '1 day') AS d
       LEFT JOIN ai_hits h ON h.day = d::date
       GROUP BY d ORDER BY d`,
      [days],
    ),
    query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, name, kind, path, n FROM ai_hits
       WHERE kind IN ('live', 'ref') ORDER BY day DESC, n DESC LIMIT 20`,
    ),
  ]);
  return { days, totals, agents, pages, daily, latest };
}
