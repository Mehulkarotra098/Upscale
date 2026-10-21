// Shop report codes and WhatsApp bot leads. Only Google Place IDs are stored for shops (allowed by Google's terms);
// names, numbers, ratings and reviews are always fetched fresh. Bot leads are people who messaged U Scale first.
import { randomBytes } from 'node:crypto';
import { exec, one, query } from '../db/client.js';
import { TODAY } from './sql.js';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no look-alikes (0/o, 1/l/i)
export const newCode = () => Array.from(randomBytes(7), (b) => ALPHABET[b % ALPHABET.length]).join('');
export const isCode = (c) => /^[a-z2-9]{7}$/.test(String(c || ''));

/** Existing report code for this place, or a new one. */
export async function codeFor(placeId, source = 'bot') {
  const found = await one('SELECT code FROM shop_reports WHERE place_id = $1', [placeId]);
  if (found) return found.code;
  for (let i = 0; i < 3; i++) {
    const row = await one(
      `INSERT INTO shop_reports (code, place_id, source) VALUES ($1, $2, $3)
       ON CONFLICT (place_id) DO UPDATE SET place_id = EXCLUDED.place_id RETURNING code`,
      [newCode(), placeId, source],
    ).catch((e) => (e.code === '23505' ? null : Promise.reject(e))); // code collision: try another
    if (row) return row.code;
  }
  throw new Error('Could not create a report code');
}

export const byCode = (code) => one('SELECT code, place_id FROM shop_reports WHERE code = $1', [code]);
export const countView = (code) => exec('UPDATE shop_reports SET views = views + 1 WHERE code = $1', [code]);

/** First time we see a WhatsApp message id: true. Meta retries webhooks, so repeats return false. */
export async function firstSeen(msgId) {
  const row = await one('INSERT INTO wa_seen (msg_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING msg_id', [msgId]);
  return Boolean(row);
}

export const lead = (waId) => one('SELECT * FROM wa_leads WHERE wa_id = $1', [waId]);

export const touchLead = (waId, profileName) =>
  one(
    `INSERT INTO wa_leads (wa_id, profile_name) VALUES ($1, $2)
     ON CONFLICT (wa_id) DO UPDATE SET last_message_at = now(),
       profile_name = CASE WHEN EXCLUDED.profile_name <> '' THEN EXCLUDED.profile_name ELSE wa_leads.profile_name END
     RETURNING *`,
    [waId, String(profileName || '').slice(0, 80)],
  );

/** Count a check against today's allowance; false once the person is over `max` checks today (India time). */
export async function takeCheck(waId, max) {
  const row = await one(
    `UPDATE wa_leads SET
       checks_today = CASE WHEN checks_day = ${TODAY} THEN checks_today + 1 ELSE 1 END,
       checks_day = ${TODAY}
     WHERE wa_id = $1 RETURNING checks_today`,
    [waId],
  );
  return Boolean(row) && row.checks_today <= max;
}

export const recordCheck = (waId, code, score) =>
  exec('UPDATE wa_leads SET checks = checks + 1, last_code = $2, last_score = $3 WHERE wa_id = $1', [waId, code, score]);
export const wantsHelp = (waId) => exec('UPDATE wa_leads SET wants_help = true WHERE wa_id = $1', [waId]);
export const optOut = (waId, out = true) => exec('UPDATE wa_leads SET opted_out = $2 WHERE wa_id = $1', [waId, out]);

export const leads = ({ limit = 200 } = {}) =>
  query(
    `SELECT l.wa_id, l.profile_name, l.last_code, l.last_score, l.checks, l.wants_help, l.opted_out, l.status, l.note,
            l.created_at, l.last_message_at
     FROM wa_leads l ORDER BY l.wants_help DESC, l.last_message_at DESC LIMIT $1`,
    [limit],
  );

export const setLead = (waId, { status, note }) =>
  one(`UPDATE wa_leads SET status = COALESCE($2, status), note = COALESCE($3, note) WHERE wa_id = $1 RETURNING wa_id`, [
    waId,
    status ?? null,
    note ?? null,
  ]);

export const leadTotals = () =>
  one(
    `SELECT count(*)::int AS people, COALESCE(sum(checks),0)::int AS checks,
            count(*) FILTER (WHERE wants_help)::int AS want_help,
            count(*) FILTER (WHERE status = 'audit')::int AS audits,
            count(*) FILTER (WHERE status = 'client')::int AS clients,
            count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS new_7d
     FROM wa_leads`,
  );
