// Public instant check (/check): type a shop name or paste a Google Maps link, get the shop's report page.
// The page itself is a plain GET form, so it works without JavaScript. noindex: the indexable tool page is
// /tools/google-business-profile-checker, which this page links to for the full checklist.
import { esc } from '../../lib/text.js';
import { abs, ARROW, head } from './parts.js';

const POINTS = [
  ['Reviews vs nearby rivals', 'How many reviews you have next to the busiest similar places around you.'],
  ['Rating and fresh reviews', 'Your star rating, and whether customers reviewed you in the last month.'],
  ['Photos, hours, category, phone', 'The basics Google uses to decide who to show first.'],
  ['Website', 'Whether your listing sends people to a site that turns them into enquiries.'],
];

export function renderCheck({ q = '', error = '' } = {}) {
  const main = `<div class="wrap hero-shell"><section class="sp-hero on-dark ck-hero" data-tone="dark" aria-labelledby="page-title">
  <p class="eyebrow">Free Google profile check</p>
  <h1 class="sp-hero__title" id="page-title">How does your shop look on Google?</h1>
  <p class="sp-hero__lead">Type your shop’s name and area, or paste its Google Maps link. In a few seconds you get a score out of 100, the top fixes and the competition nearby. Free, no sign-up.</p>
  <form class="ck-form" action="/check" method="get" role="search">
    <label class="sr-only" for="ck-q">Shop name and area, or Google Maps link</label>
    <input id="ck-q" name="q" type="text" value="${esc(q)}" placeholder="e.g. Sharma Sarees Andheri East" required minlength="3" maxlength="200" autocomplete="off" enterkeyhint="search"${error ? ' aria-describedby="ck-err" aria-invalid="true"' : ''}>
    <button class="btn btn--go" type="submit">Check my shop ${ARROW}</button>
  </form>
  ${error ? `<p class="ck-err" id="ck-err" role="alert">${esc(error)}</p>` : ''}
  <p class="ck-hint">Hinglish mein: shop ka naam + area likhiye, ya Google Maps se <b>Share → Copy link</b> karke paste kijiye.</p>
</section></div>
<div class="wrap rp">
  <section class="rp-card"><h2>What we check</h2><ul class="ck-points">${POINTS.map(
    ([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`,
  ).join('')}</ul></section>
  <p class="rp-note">Uses public Google data only. Some things, like your posts and replies to reviews, aren’t public, so the <a href="/tools/google-business-profile-checker">full checklist</a> asks about them.</p>
</div>`;
  return {
    head: head({
      title: 'Free Google profile check for your shop | U Scale',
      desc: 'Type your shop name or paste a Google Maps link: get a score out of 100, the top fixes and the competition nearby. Free.',
      url: abs('check'),
      robots: 'noindex, follow',
    }),
    main,
  };
}
