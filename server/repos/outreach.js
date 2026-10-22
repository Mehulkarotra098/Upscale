// Outreach list: shops Mehul contacts by hand from his own WhatsApp, a small batch each day. The list holds what
// Mehul typed or pasted in (business name, type, area, business mobile, one finding to mention). Nothing here comes
// from the Places API: Google data is only ever linked through a report code (shop_reports holds the Place ID).
import { exec, one, query } from '../db/client.js';
import { TODAY } from './sql.js';

export const STATUSES = ['queued', 'sent', 'replied', 'audit', 'client', 'no', 'stop'];
const COLS = `o.id, o.name, o.kind, o.area, o.phone, o.hook, o.maps_url, o.report_code, o.status, o.note,
  o.batch_day, o.sent_at, o.followed_up_at, o.created_at`;

/**
 * Add shops; numbers already on the list (or that told the bot STOP) are skipped.
 * @returns {Promise<{added: number, skipped: string[]}>}
 */
export async function addMany(rows) {
  let added = 0;
  const skipped = [];
  for (const r of rows) {
    const row = await one(
      `INSERT INTO outreach_shops (name, kind, area, phone, hook, maps_url)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM wa_leads WHERE wa_id = '91' || $4 AND opted_out)
       ON CONFLICT (phone) DO NOTHING RETURNING id`,
      [r.name, r.kind, r.area, r.phone, r.hook, r.maps_url],
    );
    if (row) added++;
    else skipped.push(r.name);
  }
  return { added, skipped };
}

export const get = (id) => one(`SELECT ${COLS} FROM outreach_shops o WHERE o.id = $1`, [id]);

/** Today's batch (India date), in list order. */
export const today = () => query(`SELECT ${COLS} FROM outreach_shops o WHERE o.batch_day = ${TODAY} ORDER BY o.id`);

/**
 * Top today's batch up to `size` shops. Shops from an earlier day's batch that were never sent come first, then new
 * ones in the order they were added. Returns the ids added to today's batch.
 */
export async function fillBatch(size) {
  const rows = await query(
    `WITH have AS (SELECT count(*)::int AS n FROM outreach_shops WHERE batch_day = ${TODAY}),
          pick AS (
            SELECT id FROM outreach_shops
            WHERE status = 'queued' AND (batch_day IS NULL OR batch_day < ${TODAY})
            ORDER BY batch_day NULLS LAST, id
            LIMIT GREATEST(0, $1 - (SELECT n FROM have))
            FOR UPDATE SKIP LOCKED)
     UPDATE outreach_shops SET batch_day = ${TODAY} WHERE id IN (SELECT id FROM pick) RETURNING id`,
    [size],
  );
  return rows.map((r) => r.id);
}

/** Sent at least `days` days ago, no reply recorded and not followed up yet. */
export const followUps = (days = 3) =>
  query(
    `SELECT ${COLS} FROM outreach_shops o
     WHERE o.status = 'sent' AND o.followed_up_at IS NULL AND o.sent_at < now() - make_interval(days => $1)
     ORDER BY o.sent_at LIMIT 30`,
    [days],
  );

export const list = ({ status, limit = 500 } = {}) =>
  query(
    `SELECT ${COLS} FROM outreach_shops o
     WHERE ($1::text IS NULL OR o.status = $1)
     ORDER BY CASE o.status WHEN 'audit' THEN 0 WHEN 'replied' THEN 1 WHEN 'sent' THEN 2 WHEN 'queued' THEN 3 ELSE 4 END,
              o.sent_at DESC NULLS LAST, o.id
     LIMIT $2`,
    [status || null, limit],
  );

/** Change status / note / report code. Marking "sent" stamps the time once. */
export const update = (id, { status, note, reportCode, followedUp }) =>
  one(
    `UPDATE outreach_shops SET
       status = COALESCE($2, status),
       note = COALESCE($3, note),
       report_code = COALESCE($4, report_code),
       sent_at = CASE WHEN $2 = 'sent' AND sent_at IS NULL THEN now() ELSE sent_at END,
       followed_up_at = CASE WHEN $5 THEN COALESCE(followed_up_at, now()) ELSE followed_up_at END
     WHERE id = $1 RETURNING id, status, sent_at, followed_up_at, report_code`,
    [id, status ?? null, note ?? null, reportCode ?? null, Boolean(followedUp)],
  );

/** Fix the details used in the message (type, area, the finding to mention). */
export const edit = (id, { kind, hook, area }) =>
  one(
    `UPDATE outreach_shops SET kind = COALESCE($2, kind), hook = COALESCE($3, hook), area = COALESCE($4, area)
     WHERE id = $1 RETURNING id`,
    [id, kind ?? null, hook ?? null, area ?? null],
  );

export const remove = (id) => exec(`DELETE FROM outreach_shops WHERE id = $1 AND status = 'queued'`, [id]);

export const totals = () =>
  one(
    `SELECT count(*)::int AS shops,
            count(*) FILTER (WHERE status = 'queued')::int AS queued,
            count(*) FILTER (WHERE status = 'queued' AND (batch_day IS NULL OR batch_day < ${TODAY}))::int AS waiting,
            count(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent,
            count(*) FILTER (WHERE (sent_at AT TIME ZONE 'Asia/Kolkata')::date = ${TODAY})::int AS sent_today,
            count(*) FILTER (WHERE status IN ('replied','audit','client'))::int AS replied,
            count(*) FILTER (WHERE status = 'audit')::int AS audits,
            count(*) FILTER (WHERE status = 'client')::int AS clients
     FROM outreach_shops`,
  );

/** Count one public /check lookup against today's site-wide allowance; false once over `max`. */
export async function takeCheck(max) {
  const row = await one(
    `INSERT INTO check_days (day, n) VALUES (${TODAY}, 1)
     ON CONFLICT (day) DO UPDATE SET n = check_days.n + 1 RETURNING n`,
  );
  return row.n <= max;
}
