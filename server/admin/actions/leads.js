// WhatsApp score bot leads for the admin: everyone who checked a shop through the bot, newest and "wants help" first.
import { badRequest } from '../../lib/errors.js';
import * as shops from '../../repos/shops.js';

const STATUSES = new Set(['new', 'contacted', 'audit', 'client', 'no']);

export default {
  'wa-leads': {
    method: 'GET',
    async run() {
      const [rows, totals] = await Promise.all([shops.leads({ limit: 300 }), shops.leadTotals()]);
      return { leads: rows, totals };
    },
  },
  'wa-lead': {
    method: 'POST',
    async run({ body }) {
      const waId = String(body.waId || '');
      if (!/^\d{8,15}$/.test(waId)) throw badRequest('Unknown lead');
      const status = body.status == null ? undefined : String(body.status);
      if (status && !STATUSES.has(status)) throw badRequest('Unknown status');
      const note = body.note == null ? undefined : String(body.note).slice(0, 500);
      const row = await shops.setLead(waId, { status, note });
      if (!row) throw badRequest('Unknown lead');
      return { ok: true };
    },
  },
};
