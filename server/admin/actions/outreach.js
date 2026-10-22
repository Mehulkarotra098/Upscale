// Admin → Outreach: a short list of shops to message by hand each day from Mehul's own WhatsApp.
// The server writes each shop's message (and the one follow-up) so the page only has to show it and open WhatsApp.
import { OUTREACH, SITE_URL } from '../../config.js';
import { badRequest, conflict, notFound } from '../../lib/errors.js';
import { log } from '../../lib/log.js';
import { firstMessage, followUpMessage, KINDS, parseImport, waLink } from '../../outreach/message.js';
import { hasPlaces } from '../../outreach/places.js';
import { resolveQuery } from '../../outreach/resolve.js';
import * as outreach from '../../repos/outreach.js';
import * as shops from '../../repos/shops.js';

const reportUrl = (code) => (code ? `${SITE_URL}r/${code}` : '');

/** A row plus its ready-to-send messages and wa.me links. */
function withMessages(row) {
  const url = reportUrl(row.report_code);
  const first = firstMessage(row, { reportUrl: url });
  const follow = followUpMessage(row, { reportUrl: url });
  return {
    ...row,
    report_url: url,
    message: first,
    wa: waLink(row.phone, first),
    follow_up: follow,
    wa_follow_up: waLink(row.phone, follow),
  };
}

/** Find the shop on Google (Maps link first, else name + area) and give it a report code. Null if not found. */
async function makeReport(row) {
  const text = row.maps_url || `${row.name} ${row.area}`.trim();
  const placeId = await resolveQuery(text);
  if (!placeId) return null;
  const code = await shops.codeFor(placeId, 'outreach');
  await outreach.update(row.id, { reportCode: code });
  return code;
}

const idOf = (body) => {
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) throw badRequest('Unknown shop');
  return id;
};

export default {
  outreach: {
    method: 'GET',
    async run({ params }) {
      const status = outreach.STATUSES.includes(params.status) ? params.status : undefined;
      const [today, follow, all, totals] = await Promise.all([
        outreach.today(),
        outreach.followUps(OUTREACH.followUpDays),
        outreach.list({ status }),
        outreach.totals(),
      ]);
      return {
        daily: OUTREACH.daily,
        followUpDays: OUTREACH.followUpDays,
        places: hasPlaces(),
        today: today.map(withMessages),
        followUps: follow.map(withMessages),
        all: all.map(withMessages),
        totals,
      };
    },
  },

  /** Top up today's batch to the daily number; with a Places key, also make each new shop's report link. */
  'outreach-batch': {
    method: 'POST',
    async run() {
      const ids = await outreach.fillBatch(OUTREACH.daily);
      let reports = 0;
      if (hasPlaces() && ids.length) {
        const rows = (await outreach.today()).filter((r) => ids.includes(r.id) && !r.report_code);
        const done = await Promise.allSettled(rows.map(makeReport));
        reports = done.filter((d) => d.status === 'fulfilled' && d.value).length;
        for (const d of done) if (d.status === 'rejected') log.warn('outreach', 'report link failed', { err: d.reason });
      }
      return { added: ids.length, reports };
    },
  },

  'outreach-import': {
    method: 'POST',
    async run({ body }) {
      const { rows, errors } = parseImport(String(body.text || '').slice(0, 200_000));
      if (!rows.length) throw badRequest(errors[0] || 'Paste at least one shop: name | type | area | mobile | finding');
      const { added, skipped } = await outreach.addMany(rows);
      return { added, skipped, errors };
    },
  },

  'outreach-update': {
    method: 'POST',
    async run({ body }) {
      const id = idOf(body);
      const status = body.status == null ? undefined : String(body.status);
      if (status && !outreach.STATUSES.includes(status)) throw badRequest('Unknown status');
      const note = body.note == null ? undefined : String(body.note).slice(0, 500);
      const row = await outreach.update(id, { status, note, followedUp: body.followedUp === true });
      if (!row) throw notFound('Shop not found');
      return { ok: true, row };
    },
  },

  'outreach-edit': {
    method: 'POST',
    async run({ body }) {
      const id = idOf(body);
      const kind = body.kind == null ? undefined : String(body.kind);
      if (kind && !KINDS.includes(kind)) throw badRequest('Unknown type');
      const row = await outreach.edit(id, {
        kind,
        hook: body.hook == null ? undefined : String(body.hook).slice(0, 300),
        area: body.area == null ? undefined : String(body.area).slice(0, 60),
      });
      if (!row) throw notFound('Shop not found');
      return { ok: true };
    },
  },

  'outreach-report': {
    method: 'POST',
    async run({ body }) {
      if (!hasPlaces()) throw conflict('Reports need the Google Places key (GOOGLE_PLACES_KEY) in Vercel.');
      const row = await outreach.get(idOf(body));
      if (!row) throw notFound('Shop not found');
      const code = row.report_code || (await makeReport(row));
      if (!code) throw badRequest('Couldn’t find this shop on Google. Add its Google Maps link and try again.');
      return { code, url: reportUrl(code) };
    },
  },

  'outreach-delete': {
    method: 'POST',
    async run({ body }) {
      await outreach.remove(idOf(body));
      return { ok: true };
    },
  },
};
