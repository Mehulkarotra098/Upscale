"""The Services menu, designed around what a visitor came to do (Mehul, 16 Nov 2026: "our own thing, think SEO
specialist and UI/UX designer").
- Three columns by goal, in the visitor's words: get a website, get customers, save time with AI. Each link says in
  one line what you get, so nobody has to open a page to find out.
- A prices card with real starting prices from pricing_data.py (fixed prices are what sets U Scale apart).
- A strip for place: a few cities and countries, then the two hub pages that list the rest. Cities, trades and
  countries are linked from those hubs and the footer, so the header carries the pages that sell, not all 60.
Desktop: the "Services" button opens the panel (script: "Services menu" at the end of source/src/script.js; without
JavaScript it opens on hover and focus). Phone: "Services" in the menu opens the same links.
Fills {{MEGA}} and {{MEGA_M}} in source/src/index.src.html; other pages copy the header and menu from the home page."""
from html import escape as _e
import pricing_data as PD

GOALS = [
    ('Get a website', [
        ('Website design', 'Designed in Figma, live in 3–4 weeks', '/services/website-design-mumbai'),
        ('Online store', 'Sell from your own site and checkout', '/services/ecommerce-website-mumbai'),
        ('Figma to code', 'Your design, built to match', '/services/figma-to-code'),
        ('White label for agencies', 'Your name on it, ours nowhere', '/services/white-label-web-design')]),
    ('Get customers', [
        ('SEO', 'Rank for what people search near you', '/services/seo-mumbai'),
        ('Google Business Profile', 'More calls and directions from Maps', '/services/google-business-profile-mumbai'),
        ('Google and Meta ads', 'Ads run for enquiries, reported monthly', '/services/google-meta-ads-mumbai'),
        ('Social media', 'Posts and reels, planned and made', '/services/social-media-management-mumbai'),
        ('AI search visibility', 'How ChatGPT and Gemini describe you', '/services/ai-search-visibility')]),
    ('Save time with AI', [
        ('WhatsApp chatbot', 'Answers and bookings on your number', '/services/whatsapp-chatbot'),
        ('Chatbot for your website', 'Answers from your own pages', '/services/ai-chatbot-for-website'),
        ('AI receptionist', 'Every call answered and summed up', '/services/ai-receptionist'),
        ('Automation', 'Forms, sheets and alerts that run themselves', '/services/n8n-automation'),
        ('AI for marketing', 'AI drafts, people decide', '/services/ai-marketing')]),
]
NEAR = [('Mumbai', '/services/website-design-mumbai'), ('Thane', '/services/website-design-thane'), ('Pune', '/services/website-design-pune'),
        ('Delhi NCR', '/services/website-design-delhi-ncr'), ('Bengaluru', '/services/website-design-bengaluru'), ('Hyderabad', '/services/website-design-hyderabad')]
ABROAD = [('UK', '/services/website-design-uk'), ('USA', '/services/website-design-usa'), ('Australia', '/services/website-design-australia'),
          ('Canada', '/services/website-design-canada'), ('UAE', '/services/website-design-uae')]
ALL_CITIES, ALL_COUNTRIES = '/services/website-design-india', '/services/outsource-web-design-india'
CHEVRON = ('<svg class="nav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" '
           'stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>')


def _rupees(n):
    s = f'{n:,}'  # Indian grouping for 5-6 digit amounts: 1,50,000
    if n >= 100000:
        h, t = divmod(n, 1000); s = f'{h // 100},{h % 100:02d},{t:03d}'
    return '₹' + s


def prices():
    """(label, amount) starting prices, read from the price list so the menu can never disagree with /pricing."""
    web = min(r[2] for r in PD.WEBSITES if r[2] and 'Care' not in r[0])
    add = {r[0]: r[3] for r in PD.ADDONS}
    return [('Websites', 'from ' + _rupees(web)), ('Google profile and local SEO', _rupees(add['Local SEO / Google Business Profile']) + '/mo'),
            ('Ads management', _rupees(add['Ads management']) + '/mo')]


def paths():
    return [h for _, items in GOALS for *_, h in items] + [h for _, h in NEAR + ABROAD] + [ALL_CITIES, ALL_COUNTRIES, '/pricing', '/services']


def desktop():
    cols = ''.join(f'<div class="mm__col"><p class="mm__k">{_e(goal)}</p><ul>'
                   + ''.join(f'<li><a href="{h}"><b>{_e(n)}</b><span>{_e(d)}</span></a></li>' for n, d, h in items) + '</ul></div>'
                   for goal, items in GOALS)
    rows = ''.join(f'<li><span>{_e(l)}</span><b>{_e(v)}</b></li>' for l, v in prices())
    card = (f'<div class="mm__card"><p class="mm__card-k">Fixed prices</p><p class="mm__card-t">Agreed before we start.</p><ul class="mm__px">{rows}</ul>'
            '<a class="mm__card-go" href="/pricing">See every price <b aria-hidden="true">→</b></a>'
            f'<a class="mm__card-fx" href="{ALL_COUNTRIES}">Outside India? Prices in £, $ and €</a></div>')
    place = lambda label, items, all_h, all_t: (f'<p class="mm__place"><span class="mm__place-k">{_e(label)}</span>'
                                                + ''.join(f'<a href="{h}">{_e(t)}</a>' for t, h in items) + f'<a class="mm__place-all" href="{all_h}">{_e(all_t)} →</a></p>')
    strip = ('<div class="mm__strip">' + place('Near you', NEAR, ALL_CITIES, 'All cities') + place('Abroad', ABROAD, ALL_COUNTRIES, 'All countries') + '</div>')
    return (f'<li class="nav__mm"><button class="nav__more" type="button" aria-expanded="false" aria-controls="mm">Services{CHEVRON}</button>'
            f'<div class="mm" id="mm"><div class="mm__in"><div class="mm__cols">{cols}</div>{card}{strip}</div></div></li>')


def mobile():
    groups = ''.join(f'<p class="mmm__h">{_e(goal)}</p><ul class="mmm__l">' + ''.join(f'<li><a href="{h}">{_e(n)}</a></li>' for n, d, h in items) + '</ul>'
                     for goal, items in GOALS)
    place = lambda label, items, all_h, all_t: (f'<p class="mmm__h">{_e(label)}</p><p class="mmm__chips">'
                                                + ''.join(f'<a href="{h}">{_e(t)}</a>' for t, h in items) + f'<a class="is-all" href="{all_h}">{_e(all_t)} →</a></p>')
    return (f'<li><details class="mmm"><summary class="menu__link" style="--i:0">Services</summary><div class="mmm__in">{groups}'
            + place('Near you', NEAR, ALL_CITIES, 'All cities') + place('Abroad', ABROAD, ALL_COUNTRIES, 'All countries')
            + '<a class="mmm__all" href="/pricing">See every price ↗</a></div></details></li>')
