// Outreach messages Mehul sends by hand from his own WhatsApp: one first message per shop and, at most, one
// follow-up. Pure functions, so the wording is easy to test and tweak. Hinglish, short and specific to the shop:
// it names one real finding (the "hook") and offers a free report. Every first message says how to opt out.
import { indianMobile } from './score.js';

export const KINDS = ['clothing', 'cafe', 'restaurant', 'salon', 'other'];
export const KIND_LABEL = {
  clothing: 'Clothing',
  cafe: 'Café',
  restaurant: 'Restaurant',
  salon: 'Salon',
  other: 'Other',
};

/** Free-text business type → one of KINDS. */
export function kindOf(raw) {
  const s = String(raw || '').toLowerCase();
  if (/cloth|boutique|saree|sari|garment|fashion|kurti|ethnic|designer|wear|lehenga/.test(s)) return 'clothing';
  if (/caf|coffee|bakery|bistro|dessert|tea/.test(s)) return 'cafe';
  if (/restaurant|restro|dhaba|kitchen|food|biryani|bar|darbar|hotel|eat/.test(s)) return 'restaurant';
  if (/salon|spa|parlou?r|beauty|hair|nail/.test(s)) return 'salon';
  return 'other';
}

const PLACE = { clothing: 'boutiques', cafe: 'cafés', restaurant: 'restaurants', salon: 'salons', other: 'businesses' };

// One line on why it matters for this kind of business.
const ANGLE = {
  clothing:
    'Aajkal log "boutique near me" search karke ya Instagram se aate hain. Ek simple website jahan designs aur prices dikhein, aur seedha WhatsApp pe order ho, wahi customers ko pakad leti hai.',
  cafe: 'Zomato/Swiggy har order pe commission kaat-te hain. Apni website pe menu aur seedha WhatsApp/call se order ho, toh regular customers ka commission bachta hai.',
  restaurant:
    'Zomato/Swiggy har order pe commission kaat-te hain. Apni website pe menu aur seedha WhatsApp/call se order ho, toh regular customers ka commission bachta hai.',
  salon: 'Log "salon near me" search karke hi aate hain. Google pe top 3 mein aana aur WhatsApp booking ho, toh calls badh jaati hain.',
  other: 'Log Google pe search karke hi aate hain. Listing aur website theek ho, toh enquiries badh jaati hain.',
};

const clean = (s) =>
  String(s || '')
    .replace(/\s+/g, ' ')
    .trim();

/** First message for a shop. `reportUrl` is the /r/<code> link when a report exists. */
export function firstMessage(shop, { reportUrl = '' } = {}) {
  const kind = KINDS.includes(shop.kind) ? shop.kind : 'other';
  const area = clean(shop.area) || 'Mumbai';
  const hook = clean(shop.hook).replace(/[.!]?$/, '.');
  return [
    `Namaste ${clean(shop.name)} team 🙏`,
    `Main Mehul, U Scale se. Main ${area} ke local businesses ki Google listing aur website pe kaam karta hoon.`,
    '',
    ...(hook.length > 1 ? [hook] : []),
    ANGLE[kind],
    '',
    reportUrl
      ? `Maine aapke liye ek free report banayi hai, aas-paas ke ${PLACE[kind]} ke comparison ke saath: ${reportUrl}`
      : `Chahein toh main aapko ek free report bhej doon, aas-paas ke ${PLACE[kind]} ke comparison ke saath?`,
    '',
    'Interest na ho toh bas "no" likh dijiye, dobara message nahi karunga.',
  ].join('\n');
}

/** The one follow-up, a few days after the first message got no reply. */
export function followUpMessage(shop, { reportUrl = '' } = {}) {
  return [
    `Namaste 🙏 ${clean(shop.name)} ke liye bas ek chhota follow-up.`,
    reportUrl ? `Free report yahan hai: ${reportUrl}` : 'Free report abhi bhi bhej sakta hoon, bas "haan" likh dijiye.',
    '10 minute ki call ho sake toh main bata deta hoon pehle kya theek karna chahiye. Abhi time nahi hai toh koi baat nahi.',
  ].join('\n');
}

/** wa.me link that opens a chat with `phone` (10-digit Indian mobile) and the text typed in. */
export const waLink = (phone, text) => `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;

/**
 * Pasted shop list → rows. One shop per line, fields split by "|" or tabs:
 *   name | type | area | phone | hook (one finding to mention) | Google Maps link
 * Only the name and a mobile number are required. Lines starting with # and header lines are skipped.
 * @returns {{ rows: Array<{name,kind,area,phone,hook,maps_url}>, errors: string[] }}
 */
export function parseImport(text, { max = 300 } = {}) {
  const rows = [];
  const errors = [];
  const seen = new Set();
  const lines = String(text || '').split(/\r?\n/);
  lines.forEach((line, i) => {
    const raw = line.trim();
    if (!raw || raw.startsWith('#')) return;
    const f = (raw.includes('\t') ? raw.split('\t') : raw.split('|')).map((x) => x.trim());
    if (/^name$/i.test(f[0])) return; // header row from a spreadsheet
    const n = i + 1;
    if (rows.length >= max) {
      if (rows.length === max && !errors.some((e) => e.startsWith('Only'))) errors.push(`Only the first ${max} shops were read.`);
      return;
    }
    const name = clean(f[0]).slice(0, 120);
    const phone = indianMobile(f[3]);
    if (!name) return errors.push(`Line ${n}: no shop name.`);
    if (!phone) return errors.push(`Line ${n} (${name}): no mobile number (landlines can't get WhatsApp).`);
    if (seen.has(phone)) return errors.push(`Line ${n} (${name}): same number as another shop in this list.`);
    seen.add(phone);
    const maps = clean(f[5]);
    rows.push({
      name,
      kind: KINDS.includes(f[1]) ? f[1] : kindOf(f[1] || name),
      area: clean(f[2]).slice(0, 60),
      phone,
      hook: clean(f[4]).slice(0, 300),
      maps_url: /^https?:\/\//.test(maps) ? maps.slice(0, 500) : '',
    });
  });
  return { rows, errors };
}
