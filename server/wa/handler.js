// /api/wa: WhatsApp Cloud API webhook for the Google score bot.
//   GET  → Meta's one-time verification (hub.challenge)
//   POST → incoming messages. Every call is checked against Meta's signature before anything is read.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { WA } from '../config.js';
import { hasDb } from '../db/client.js';
import { query, send as sendRaw, text } from '../lib/http.js';
import { log } from '../lib/log.js';
import { buildReport } from '../outreach/report.js';
import { findOne, hasPlaces } from '../outreach/places.js';
import { resolveMaps } from '../outreach/resolve.js';
import * as shops from '../repos/shops.js';
import { reply } from './bot.js';
import { markRead, send } from './send.js';

const MAX_BODY = 1_000_000;

async function readRaw(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw new Error('too large');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/** Meta signs the raw body with the app secret: X-Hub-Signature-256: sha256=<hex>. */
export function validSignature(raw, header, secret) {
  if (!secret || !header || !header.startsWith('sha256=')) return false;
  const want = Buffer.from(createHmac('sha256', secret).update(raw).digest('hex'));
  const got = Buffer.from(header.slice(7));
  return want.length === got.length && timingSafeEqual(want, got);
}

export { resolveMaps };

const deps = {
  lead: shops.lead,
  optOut: shops.optOut,
  wantsHelp: shops.wantsHelp,
  takeCheck: (waId) => shops.takeCheck(waId, WA.dailyChecks),
  resolveMaps,
  findOne,
  buildReport,
  codeFor: shops.codeFor,
  recordCheck: shops.recordCheck,
  hasPlaces,
};

/** Flatten Meta's webhook payload into the messages we handle. */
export function messagesOf(body) {
  const out = [];
  for (const entry of body?.entry || [])
    for (const change of entry.changes || []) {
      const v = change.value || {};
      const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || '']));
      for (const m of v.messages || [])
        out.push({
          id: m.id,
          from: m.from,
          name: names[m.from] || '',
          type: m.type === 'interactive' ? 'button' : m.type,
          text: m.text?.body || '',
          buttonId: m.interactive?.button_reply?.id || m.button?.payload || '',
        });
    }
  return out;
}

export default async function waHandler(req, res) {
  const p = query(req);
  if (req.method === 'GET') {
    if (p['hub.mode'] === 'subscribe' && WA.verifyToken && p['hub.verify_token'] === WA.verifyToken)
      return text(res, 200, String(p['hub.challenge'] || ''), 'text/plain', 'no-store');
    return text(res, 403, 'Forbidden', 'text/plain', 'no-store');
  }
  if (req.method !== 'POST') return sendRaw(res, 405, '', { Allow: 'GET, POST' });

  let raw;
  try {
    raw = await readRaw(req);
  } catch {
    return sendRaw(res, 413, '');
  }
  if (!validSignature(raw, req.headers['x-hub-signature-256'], WA.appSecret)) return sendRaw(res, 401, '');
  let body;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    return sendRaw(res, 400, '');
  }
  if (!hasDb() || !WA.token || !WA.phoneId) return sendRaw(res, 200, ''); // not set up: accept so Meta doesn't retry forever

  for (const m of messagesOf(body)) {
    try {
      if (!(await shops.firstSeen(m.id))) continue; // Meta retry of a message we already answered
      await shops.touchLead(m.from, m.name);
      markRead(m.id);
      for (const out of await reply(m, deps)) await send(m.from, out);
    } catch (err) {
      log.error('wa', 'message failed', { err });
    }
  }
  return sendRaw(res, 200, '');
}
