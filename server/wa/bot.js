// The U Scale Google score bot's conversation. Someone sends a shop name or a Google Maps link; the bot replies with
// the shop's Google profile score, the top fixes and a link to the full report, then offers Mehul's help.
// It only ever replies: it never messages anyone first. Dependencies are injected so the flow is easy to test.
import { BRAND, SITE_URL } from '../config.js';
import { GRADES } from '../outreach/score.js';
import { MAPS_LINK as MAPS, withCity } from '../outreach/resolve.js';

const MEHUL = BRAND.phone.replace(/\D/g, '');
const GREETING = /^(hi+|hii+|hello|hey|helo|namaste|namaskar|start|menu|help|score|check|hy|hlo|\?)[\s!.,]*$/i;
const STOP = /^(stop|unsubscribe|band karo|mat bhejo|no more)[\s!.]*$/i;

const BTN_HELP = { id: 'help', title: 'Theek karwana hai' };
const BTN_AGAIN = { id: 'again', title: 'Doosri shop check' };

export const TEXT = {
  intro:
    'Namaste! 🙏 Main U Scale ka *Google score bot* hoon.\n\nApni shop ka *naam aur area* bhejiye (jaise: _Glow Salon Marol_), ya Google Maps se *Share → Copy link* karke bhejiye.\n\n30 second mein aapko milega: Google score /100, sabse zaroori fixes, aur aas-paas ke competitors se comparison. Free hai.',
  ask: 'Bilkul! Agli shop ka naam aur area bhejiye, ya uska Google Maps link.',
  working: '🔎 Check kar raha hoon…',
  notFound:
    'Yeh business Google par nahi mila. 🤔\n\nShop ka *naam + area* bhejiye (jaise: _Sharma Sarees Ghatkopar_), ya Google Maps mein shop kholiye → *Share* → *Copy link* → yahan paste kijiye.',
  limit: 'Aaj ke liye free checks ho gaye. 🙏 Kal phir try kijiye, ya Mehul se seedha baat kijiye: https://wa.me/' + MEHUL,
  down: 'Checker abhi update ho raha hai. Thodi der baad try kijiye, ya Mehul se baat kijiye: https://wa.me/' + MEHUL,
  stop: 'Theek hai, ab aapko message nahi aayenge. Kabhi bhi *START* bhejkar wapas aa sakte hain.',
  closed: '⚠️ Google is business ko *band* dikha raha hai. Agar galat hai, toh pehle Business Profile mein theek kijiye.',
};

/** Message text for a finished check. */
export function resultText(report, code) {
  const grade = GRADES[report.grade].hi;
  const fixes = report.fixes.slice(0, 3).map((f, i) => `${i + 1}. ${f.text.hi}`);
  return [
    `*${report.name}*`,
    report.address ? `📍 ${report.address}` : '',
    '',
    `Google score: *${report.pts}/100* (${grade})`,
    report.open ? '' : `\n${TEXT.closed}`,
    fixes.length
      ? `\n*Sabse pehle yeh theek karein:*\n${fixes.join('\n')}`
      : '\nKoi bada kaam baaki nahi. Photos aur naye reviews aate rahein. 👏',
    '',
    `Poori report, competitors ke saath: ${SITE_URL}r/${code}`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n')
    .trim();
}

export function helpText(lead) {
  const pre = encodeURIComponent(
    `Hi Mehul, maine U Scale bot se apni shop check ki${lead?.last_score != null ? ` (score ${lead.last_score}/100` : ''}${lead?.last_code ? `, report: ${SITE_URL}r/${lead.last_code}` : ''}${lead?.last_score != null ? ')' : ''}. Theek karwana hai.`,
  );
  return `Badhiya! 🙌 Mehul (U Scale) aapki report dekh kar aaj hi aapse baat karenge.\n\nAbhi baat karni ho toh yahan tap kijiye: https://wa.me/${MEHUL}?text=${pre}`;
}

/**
 * @param {{ from: string, name?: string, type: string, text?: string, buttonId?: string }} msg
 * @param {object} d dependencies: lead, optOut, wantsHelp, takeCheck, resolveMaps, findOne, buildReport, codeFor, recordCheck, hasPlaces
 * @returns {Promise<Array<{type:'text', body:string}|{type:'buttons', body:string, buttons:Array}>>}
 */
export async function reply(msg, d) {
  const text = String(msg.text || '').trim();
  const lead = await d.lead(msg.from);

  if (STOP.test(text)) {
    await d.optOut(msg.from, true);
    return [{ type: 'text', body: TEXT.stop }];
  }
  if (lead?.opted_out && /^start$/i.test(text)) await d.optOut(msg.from, false);

  if (msg.buttonId === 'help') {
    await d.wantsHelp(msg.from);
    return [{ type: 'text', body: helpText(lead) }];
  }
  if (msg.buttonId === 'again') return [{ type: 'text', body: TEXT.ask }];

  if (msg.type !== 'text' || !text || text.length < 3 || GREETING.test(text)) return [{ type: 'text', body: TEXT.intro }];
  if (!d.hasPlaces()) return [{ type: 'text', body: TEXT.down }];
  if (!(await d.takeCheck(msg.from))) return [{ type: 'text', body: TEXT.limit }];

  let placeId = null;
  const link = text.match(/https?:\/\/\S+/)?.[0];
  if (link && MAPS.test(link)) placeId = await d.resolveMaps(link);
  if (!placeId) {
    const query = (link ? text.replace(link, '') : text).trim().slice(0, 120);
    if (query.length >= 3) placeId = (await d.findOne(withCity(query)))?.id || null;
  }
  if (!placeId) return [{ type: 'text', body: TEXT.notFound }];

  const report = await d.buildReport(placeId);
  if (!report) return [{ type: 'text', body: TEXT.notFound }];
  const code = await d.codeFor(placeId, 'bot');
  await d.recordCheck(msg.from, code, report.pts);
  return [{ type: 'buttons', body: resultText(report, code), buttons: [BTN_HELP, BTN_AGAIN] }];
}
