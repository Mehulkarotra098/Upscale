// Public shop report page (/r/<code>): a business's Google profile score, its top fixes and the competition nearby.
// Shared by link (WhatsApp bot, outreach), so it is noindex: one page per business would be thin content for search.
import { BRAND } from '../../config.js';
import { esc } from '../../lib/text.js';
import { GRADES } from '../../outreach/score.js';
import { abs, head } from './parts.js';

const LABEL = {
  count: ['Reviews compared with rivals', 'Competitors ke mukable reviews'],
  rating: ['Star rating', 'Star rating'],
  recent: ['Recent reviews', 'Naye reviews'],
  volume: ['Total reviews', 'Kul reviews'],
  photos: ['Photos', 'Photos'],
  rank: ['Rank among nearby rivals', 'Aas-paas ke rivals mein rank'],
  website: ['Website on the listing', 'Listing par website'],
  hours: ['Opening hours', 'Timing'],
  category: ['Specific main category', 'Sahi main category'],
  phone: ['Phone number', 'Phone number'],
};
const T = {
  en: {
    eyebrow: 'Free Google profile report',
    score: 'Google profile score',
    fixes: 'What to fix first',
    pts: 'points',
    compare: 'You and the busiest similar places nearby',
    you: 'You',
    reviews: 'reviews',
    noRating: 'no rating',
    breakdown: 'Where the points come from',
    ctaT: 'Want these fixed for you?',
    ctaL: 'I fix Google profiles for Mumbai businesses: reviews system, photos, category, posts and a website that brings enquiries. Send me this report and I’ll reply with a plan.',
    ctaB: 'WhatsApp Mehul',
    again: 'Check another business',
    maps: 'Open on Google Maps',
    note: 'U Scale’s checklist score from public Google data, checked on {d}. It isn’t an official Google score. Some things, like your posts and review replies, aren’t public, so the full free checker asks about them.',
    closed: 'Google shows this business as closed. If that’s wrong, fix it in your Business Profile first.',
    wa: 'Hi Mehul, I saw the Google report for {n} ({u}). Score {s}/100. Can you help me fix it?',
    lang: 'Hinglish mein dekhein',
  },
  hi: {
    eyebrow: 'Free Google profile report',
    score: 'Google profile score',
    fixes: 'Sabse pehle kya theek karein',
    pts: 'points',
    compare: 'Aap aur aas-paas ke sabse busy similar businesses',
    you: 'Aap',
    reviews: 'reviews',
    noRating: 'rating nahi',
    breakdown: 'Points kahan se aate hain',
    ctaT: 'Yeh sab hum theek kar dein?',
    ctaL: 'Main Mumbai ke businesses ke Google profile theek karta hoon: review system, photos, category, posts aur enquiry laane wali website. Yeh report mujhe bhejiye, main plan ke saath reply karunga.',
    ctaB: 'Mehul ko WhatsApp karein',
    again: 'Doosra business check karein',
    maps: 'Google Maps par kholo',
    note: 'Yeh U Scale ka checklist score hai, public Google data se, {d} ko check kiya. Yeh Google ka official score nahi hai. Kuch cheezein, jaise posts aur review replies, public nahi hoti, isliye poora free checker unke baare mein poochta hai.',
    closed: 'Google is business ko band dikha raha hai. Agar galat hai, toh pehle Business Profile mein theek kijiye.',
    wa: 'Hi Mehul, maine {n} ki Google report dekhi ({u}). Score {s}/100. Kya aap theek karne mein madad karenge?',
    lang: 'View in English',
  },
};

const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? '' : String(v[k])));
const tone = (pts) => (pts >= 80 ? '#2F9E44' : pts >= 60 ? '#63B849' : pts >= 40 ? '#E8A33B' : '#E5484D');

function gauge(pts) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return `<svg class="rp-gauge" viewBox="0 0 120 120" role="img" aria-label="${pts} out of 100">
<circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="10"/>
<circle cx="60" cy="60" r="${r}" fill="none" stroke="${tone(pts)}" stroke-width="10" stroke-linecap="round"
 stroke-dasharray="${((c * pts) / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/>
<text x="60" y="58" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">${pts}</text>
<text x="60" y="80" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.7)">/ 100</text></svg>`;
}

const stars = (r) => (r ? `${r.toFixed(1)}★` : '');

export function renderReport(data, { code, lang = 'en', date = new Date() }) {
  const t = T[lang] || T.en;
  const L = lang === 'hi' ? 1 : 0;
  const url = abs(`r/${code}`);
  const when = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const wa = `https://wa.me/${BRAND.phone.replace(/\D/g, '')}?text=${encodeURIComponent(fill(t.wa, { n: data.name, u: url, s: data.pts }))}`;
  const gradeText = GRADES[data.grade][lang === 'hi' ? 'hi' : 'en'];
  const fixes = data.fixes.slice(0, 4);
  const rows = [
    { name: `${t.you}: ${data.name}`, rating: data.facts.rating, reviews: data.facts.count, me: true },
    ...data.leaders.map((l) => ({ name: l.name, rating: l.rating, reviews: l.reviews })),
  ];
  const title = `${data.name}: ${data.pts}/100 on Google | U Scale`;
  const desc = `${gradeText}. Free Google profile report for ${data.name}${data.address ? `, ${data.address}` : ''}, with the top fixes and the competition nearby.`;

  const main = `<div class="wrap hero-shell"><section class="sp-hero on-dark rp-hero" data-tone="dark" aria-labelledby="page-title">
  <p class="eyebrow">${esc(t.eyebrow)}</p>
  <div class="rp-top">${gauge(data.pts)}<div>
    <h1 class="sp-hero__title rp-title" id="page-title">${esc(data.name)}</h1>
    <p class="rp-addr">${esc([data.type, data.address].filter(Boolean).join(' · '))}</p>
    <p class="rp-grade" style="color:${tone(data.pts)}">${esc(gradeText)}</p>
  </div></div>
  ${data.open ? '' : `<p class="rp-warn">${esc(t.closed)}</p>`}
  <div class="hero__cta"><a class="btn btn--go" href="${esc(wa)}" rel="nofollow">${esc(t.ctaB)}</a>
  <a class="btn btn--ghost" href="${esc(data.mapsUrl)}" rel="nofollow noopener" target="_blank">${esc(t.maps)}</a>
  <a class="rp-lang" href="/r/${esc(code)}${lang === 'hi' ? '' : '?lang=hi'}">${esc(t.lang)}</a></div>
</section></div>
<div class="wrap rp">
  ${
    fixes.length
      ? `<section class="rp-card"><h2>${esc(t.fixes)}</h2><ol class="rp-fixes">${fixes
          .map((f) => `<li><p>${esc(f.text[lang === 'hi' ? 'hi' : 'en'])}</p><span class="rp-gain">+${f.gain} ${esc(t.pts)}</span></li>`)
          .join('')}</ol></section>`
      : ''
  }
  ${
    data.leaders.length
      ? `<section class="rp-card"><h2>${esc(t.compare)}</h2><table class="rp-table"><tbody>${rows
          .map(
            (r) =>
              `<tr${r.me ? ' class="is-me"' : ''}><th scope="row">${esc(r.name)}</th><td>${r.rating ? esc(stars(r.rating)) : esc(t.noRating)}</td><td>${r.reviews.toLocaleString('en-IN')} ${esc(t.reviews)}</td></tr>`,
          )
          .join('')}</tbody></table></section>`
      : ''
  }
  <section class="rp-card"><h2>${esc(t.breakdown)}</h2><ul class="rp-bars">${data.parts
    .map(
      (p) =>
        `<li><span>${esc(LABEL[p.id][L])}</span><b>${p.got}/${p.max}</b><i style="--w:${Math.round((p.got / p.max) * 100)}%"></i></li>`,
    )
    .join('')}</ul></section>
  <section class="rp-card rp-cta"><h2>${esc(t.ctaT)}</h2><p>${esc(t.ctaL)}</p>
    <div class="hero__cta"><a class="btn btn--go" href="${esc(wa)}" rel="nofollow">${esc(t.ctaB)}</a>
    <a class="btn btn--ghost" href="/check">${esc(t.again)}</a></div></section>
  <p class="rp-note">${esc(fill(t.note, { d: when }))}</p>
</div>`;

  return { head: head({ title, desc, url, robots: 'noindex, nofollow' }), main };
}
