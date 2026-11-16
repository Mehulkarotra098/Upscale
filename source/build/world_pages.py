"""Pages for clients outside India (Nov 2026): a hub, one page per country, white label, Figma to code and three trades that
sell abroad (Indian restaurants, Indian fashion labels, independent hotels).

  /services/outsource-web-design-india        the hub: prices in eight currencies, how a project runs across time zones
  /services/website-design-<country>          uk, usa, australia, canada, singapore, uae, ireland, new-zealand, netherlands
  /services/white-label-web-design            for agencies: fixed price per site, your brand, NDA first
  /services/figma-to-code                     your design, hand-coded
  /services/website-design-for-indian-restaurants, -for-indian-fashion-brands, -for-independent-hotels

Rules, the same as the city pages (a page that breaks one is a doorway page, and Google demotes the whole site for those):
  * every country page is about that country: its prices, its working hours against ours, its rules, its payment route,
    each from a dated, linked source. Never the same text with the name swapped;
  * never an office, address, phone number or staff abroad. U Scale is in Mumbai and works over WhatsApp and video calls;
  * every price comes from pricing_data.py: the rupee price, converted at the rates fixed there (Mehul, 16 Nov 2026:
    "same as the current site pricing, just converted, rounded to a solid amount");
  * no invented clients, reviews or results. Sample designs say they are samples.
Layout follows the v3 city pages (Mehul, 8 Nov 2026: "too much detail, people will not read"): one picture that moves and
one short line per block; detail lives in the FAQ answers. Mehul, 16 Nov 2026: "I have my own team", so these pages speak
for the studio ("we"), with Mehul named as the person who leads each project.
"""
import json, urllib.parse

import aeo
import geo_pages as GP
import seo_pages as SP
import svc_pages as SVP
import depth_art as DA
import city_pages as CP
import pricing_data as PD
from geo_pages import Html, Sec, icon, price, rupees, e, ea

WA = SVP.WA
LANDING, BIZ, BLOG, STORE, STORE_BIG, REST, CARE = ('Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog',
                                                    'E-commerce, under 50 products', 'E-commerce, 50–500 products',
                                                    'Restaurant site + own online ordering', 'Care plan: updates, backups, security')


def fx(name, cur):
    """A price from the rupee list, in another currency (pricing_data.fx_label); 'INR' gives the rupee price itself."""
    if cur == 'INR':
        return price(name).replace('from ', '').split('/')[0]
    return PD.fx_label(rupees(name), cur, monthly='/mo' in price(name))


def fxn(name, cur):
    return rupees(name) if cur == 'INR' else PD.fx_amount(rupees(name), cur, monthly='/mo' in price(name))


def sym(cur):
    return '₹' if cur == 'INR' else PD.FX[cur][0]


GP._IC.update({
    'cookie': '<path d="M20.5 12.6A8.5 8.5 0 1111.4 3.5a3 3 0 003.6 3.6 3 3 0 003.6 3.6 3 3 0 001.9 1.9z"/><path d="M8.5 9.5h.01M8 14.5h.01M12 12.5h.01M15.5 16h.01M11.5 17h.01"/>',
    'users': '<circle cx="12" cy="4.8" r="1.8"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5V14M12 14l-3 6M12 14l3 6"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    'code': '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"/>',
    'bot': '<rect x="4.5" y="8" width="15" height="11" rx="3.5"/><path d="M12 8V4.5M9.2 13h.01M14.8 13h.01M9.5 16.2h5M2.5 12.5v2.5M21.5 12.5v2.5"/><circle cx="12" cy="4" r="1"/>',
    'mic': '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v2.5M9 20.5h6"/>',
    'flow': '<rect x="3" y="4" width="6" height="5" rx="1.5"/><rect x="15" y="4" width="6" height="5" rx="1.5"/><rect x="9" y="15" width="6" height="5" rx="1.5"/><path d="M9 6.5h6M6 9v2.5a2 2 0 002 2h8a2 2 0 002-2V9M12 13.5V15"/>',
    'spark': '<path d="M12 3.5c.7 4 2.6 5.9 6.5 6.5-3.9.7-5.8 2.6-6.5 6.5-.7-3.9-2.6-5.8-6.5-6.5 3.9-.6 5.8-2.5 6.5-6.5z"/><path d="M18.5 15.5c.3 1.7 1.1 2.5 2.5 2.7-1.4.3-2.2 1-2.5 2.6-.3-1.6-1.1-2.3-2.5-2.6 1.4-.2 2.2-1 2.5-2.7z"/>',
    'bed': '<path d="M3 18.5V6M3 14h18v4.5M21 14v-2.5a3 3 0 00-3-3h-7V14"/><circle cx="7" cy="10.5" r="2"/>',
    'plane': '<path d="M10.5 13.5L3 11l1.5-1.5 8 .5 4.5-5a1.8 1.8 0 012.5 2.5l-5 4.5.5 8L13.5 21 11 13.5"/>',
    'heart': '<path d="M12 19.5s-7.5-4.4-7.5-9.7A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5c0 5.3-7.5 9.7-7.5 9.7z"/>',
    'home': '<path d="M4 11l8-6.5 8 6.5M6 9.5V19.5h12V9.5M10 19.5v-5h4v5"/>',
    'book': '<path d="M4.5 5.5A2 2 0 016.5 3.5H19.5V17H6.5a2 2 0 00-2 2zM4.5 19a2 2 0 002 2h13v-4"/>',
    'scale': '<path d="M12 4v16M7 20h10M5 7.5h14M5 7.5l-2.5 6a3 3 0 005 0zM19 7.5l-2.5 6a3 3 0 005 0z"/>',
    'factory': '<path d="M3 20.5V10l5 3V10l5 3V10l5 3V4.5h3v16zM7 17h2M12 17h2"/>',
    'stethoscope': '<path d="M6 3.5v5a4 4 0 008 0v-5M10 12.5v2a5 5 0 0010 0v-2"/><circle cx="20" cy="10.5" r="2"/>',
    'cap': '<path d="M2.5 9.5L12 5l9.5 4.5L12 14zM6.5 11.5v4.5c3 2 8 2 11 0v-4.5M21.5 9.5v5"/>',
})


PAY_ROUTE = ('a bank transfer in your own currency, to local account details we send with each invoice (we receive through Wise), '
             'so you pay the way you would pay a supplier at home')
TEAM = 'Our own team in Mumbai designs and builds it, and Mehul Karotra, who founded U Scale, leads every project and is the person you talk to.'


# ================================================================ sources (read on 16 Nov 2026 unless the label says otherwise)
GP.SRC.update({
    'uk-a9': ('A9 Web Design, 8 Jan 2026', 'UK small business website cost 2026', 'https://a9webdesign.co.uk/articles/how-much-does-a-small-business-website-cost-uk/'),
    'uk-es': ('ExpertSure, 1 Mar 2026', 'How much do freelance web designers cost in the UK', 'https://www.expertsure.com/uk/web-design/freelance-web-designer-costs/'),
    'uk-pgs': ('Proper Good Sites, 11 May 2026', 'How much does a small business website cost in the UK?', 'https://propergoodsites.com/blog/how-much-does-a-small-business-website-cost-2026/'),
    'uk-pecr': ('GOV.UK, 27 Jun 2025', 'Data (Use and Access) Act factsheet: PEC Regulations (cookies)', 'https://www.gov.uk/government/publications/data-use-and-access-act-2025-factsheets/data-use-and-access-act-factsheet-pec-regulations'),
    'uk-scope': ('Scope for business, 2021', 'UK laws that cover web accessibility', 'https://business.scope.org.uk/uk-law-and-digital-accessibility-what-it-means-for-your-organisation/'),
    'uk-dbt': ('Department for Business and Trade, 5 Nov 2026', 'Business population estimates for the UK and regions 2026', 'https://www.gov.uk/government/statistics/business-population-estimates-2026/business-population-estimates-for-the-uk-and-regions-2026-statistical-release'),
    'us-jim': ('Jim.com, 14 Aug 2026', 'Small business website cost: how to budget from $500 to $15,000', 'https://www.jim.com/blog/small-business-website-cost'),
    'us-le': ('The Lonely Entrepreneur, 2026', 'How much does a small business website cost in 2026?', 'https://lonelyentrepreneur.com/how-much-does-it-cost-to-build-a-website-for-a-small-business/'),
    'us-ada': ('UsableNet, 2025 year-end report', 'Digital accessibility lawsuit report 2025', 'https://info.usablenet.com/hubfs/Remediated%20-%202025_Year-End_Digital_Accessibility_Lawsuit_Report_FINAL.pdf'),
    'us-sba': ('U.S. Small Business Administration, Feb 2026', 'Frequently asked questions about small business 2026', 'https://advocacy.sba.gov/wp-content/uploads/2026/02/FINAL_FAQsAboutSmallBusiness_2026_012826.pdf'),
    'au-wtd': ('What’s The Damage, 10 Jul 2026', 'Web design cost Australia 2026', 'https://whatsthedamage.com.au/web-design-cost/'),
    'au-spam': ('DLA Piper, Data Protection Laws of the World', 'Australia: Privacy Act and Spam Act', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=AU'),
    'au-abs': ('Australian Bureau of Statistics, 18 Aug 2026', 'Counts of Australian businesses, July 2022 to June 2026', 'https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release'),
    'ca-marvel': ('Marvel Marketing, “2026 edition”', 'Website design cost guide', 'https://marvelmarketing.ca/?p=78537'),
    'ca-shift8': ('Shift8, Toronto, 23 Apr 2026', 'Understanding web design pricing: a guide for 2026', 'https://shift8web.ca/?p=9533'),
    'ca-law': ('DLA Piper, Data Protection Laws of the World', 'Canada: PIPEDA, Quebec’s privacy law and CASL', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=CA'),
    'ca-aoda': ('Government of Ontario', 'How to make websites accessible (AODA)', 'https://www.ontario.ca/page/how-make-websites-accessible'),
    'sg-we': ('WE Interactive, 24 Mar 2026', 'How much does a website cost in Singapore (2026)', 'https://we-interactive.com/insights/how-much-does-a-website-cost-in-singapore-2026-guide'),
    'sg-mt': ('Mapletree Media, 8 Jan 2026', 'Website development costs Singapore 2026', 'https://mapletreemedia.com/website-development-costs-singapore-2026/'),
    'sg-pdpa': ('DLA Piper, Data Protection Laws of the World', 'Singapore: PDPA and cookies', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=SG'),
    'sg-stat': ('Department of Statistics Singapore', 'Enterprises and corporate sector: latest data', 'https://www.singstat.gov.sg/find-data/explore-data-themes/industry/enterprises-and-corporate-sector/latest-news-data'),
    'ae-twm': ('The Web Makers, 11 Jun 2026', 'Website design cost Dubai 2026', 'https://thewebmakers.ae/resources/website-design-cost-dubai/'),
    'ae-2m': ('2Marketing, 14 Jan 2026', 'Website design cost in Dubai 2026', 'https://2marketing.com/website-design-cost-in-dubai/'),
    'ae-mea': ('Ministry of External Affairs, India', 'Population of overseas Indians', 'https://www.mea.gov.in/population-of-overseas-indians.htm'),
    'ae-pdpl': ('DLA Piper, Data Protection Laws of the World', 'UAE: Personal Data Protection Law', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=AE'),
    'ie-vimar': ('VIMAR Digital, 23 Dec 2025', 'What does a website cost in Ireland in 2026?', 'https://vimar.ie/blog/what-does-a-website-cost-in-ireland-in-2026-a-complete-web-design-pricing-guide/'),
    'ie-ccpc': ('Competition and Consumer Protection Commission', 'European Accessibility Act guidelines for microenterprises', 'https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/'),
    'ie-gdpr': ('DLA Piper, Data Protection Laws of the World', 'Ireland: GDPR and cookie consent', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=IE'),
    'eu-eaa': ('European Commission', 'European Accessibility Act', 'https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en'),
    'nz-kiwi': ('Kiwi Web Design, 5 Jan 2026', 'Website cost for a New Zealand small business', 'https://kiwiwebdesign.co.nz/affordable-web-design-auckland/website-cost-new-zealand-small-business/'),
    'nz-law': ('DLA Piper, Data Protection Laws of the World', 'New Zealand: Privacy Act 2020', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=NZ'),
    'nl-sl': ('Searchlab, 17 Feb 2026', 'Wat kost een website laten maken in 2026?', 'https://searchlab.nl/blog/wat-kost-een-website-in-2026'),
    'nl-en': ('Language Knowledge EU', 'English speakers in Europe: Netherlands 86%', 'https://languageknowledge.eu/languages/english'),
    'nl-gdpr': ('DLA Piper, Data Protection Laws of the World', 'Netherlands: GDPR and cookie consent', 'https://www.dlapiperdataprotection.com/index.html?t=law&c=NL'),
    'wise-in': ('Wise Help Centre', 'Receiving payments for Indian businesses', 'https://wise.com/help/articles/71lNXW0Ls3gEFhUH8PtodV/receiving-payments-for-indian-businesses'),
    'utc': ('Wikipedia', 'List of UTC offsets', 'https://en.wikipedia.org/wiki/List_of_UTC_offsets'),
    'wl-fry': ('Fryloop, 28 Mar 2026', 'White label web design pricing guide', 'https://www.fryloop.com/blog/white-label-web-design-pricing-guide'),
    'wl-10web': ('10Web, 1 Dec 2025', 'White label website development pricing guide', 'https://10web.io/blog/white-label-website-development-services/'),
    'wl-wha': ('Web Help Agency, 8 Apr 2026', 'White-label WordPress pricing: what agencies pay in 2026', 'https://webhelpagency.com/blog/white-label-wordpress-pricing/'),
})


# ================================================================ graphics
def seal(sym):
    size = 40 if len(sym.strip()) == 1 else 26 if len(sym.strip()) == 2 else 19
    return ('<svg viewBox="0 0 120 120"><defs><path id="wpseal-c" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs>'
            '<circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="34" class="in"/>'
            '<text><textPath href="#wpseal-c" startOffset="0" textLength="262" lengthAdjust="spacingAndGlyphs">FIXED PRICE · IN WRITING · </textPath></text>'
            f'<text x="60" y="{60 + size * .36:.0f}" text-anchor="middle" class="big" style="font-size:{size}px">{e(sym.strip())}</text></svg>')


def _short_fx(v, cur):
    s = PD.FX[cur][0]
    return f'{s}{v / 1000:g}k' if v >= 1000 else f'{s}{v}'


def cost_card(p):
    """Hero: what a website costs in the country (local studios' own ranges, sourced) against our fixed prices, on one scale."""
    cur, hi = p['cur'], p['scale']
    pct = lambda v: f'{min(v, hi) / hi * 100:.2f}%'
    lo_us, hi_us = fxn(LANDING, cur), fxn(BIZ, cur)
    rows = p['market'] + [('U Scale, fixed price', 'Landing page · 5–10 page site', lo_us, hi_us, f'{fx(LANDING, cur)} · {fx(BIZ, cur)}')]
    li = ''
    for i, (label, sub, a, z, val) in enumerate(rows):
        us = i == len(rows) - 1
        li += (f'<li class="{"is-us" if us else ""}" style="--i:{i}"><span class="dk-cost__l">{e(label)}<small>{e(sub)}</small></span><b>{e(val)}</b>'
               f'<span class="dk-bar"><i style="--a:{pct(a)};--b:{pct(max(z, a + hi * .03))}"></i></span></li>')
    ticks = ''.join(f'<span>{e(_short_fx(t, cur) if t else PD.FX[cur][0].strip() + "0")}</span>' for t in p['ticks'])
    card = (f'<div class="dk__card fp-ticket sv-ticket dk-cost dk-cost--fx"><p class="dk-quote__head"><span class="dk-quote__mark" aria-hidden="true">{icon("pin")}</span>'
            f'<span><b>What a website costs in {e(p["the"])}</b><small>Local prices vs ours · in {e(PD.FX[cur][2])}</small></span></p>'
            f'<ul>{li}</ul><p class="dk-cost__s" aria-hidden="true">{ticks}</p>'
            f'<p class="fp-ticket__f">{icon("file")}{e(p["cost_foot"])}</p></div>')
    floats = (DA._float('dk-seal', seal(PD.FX[cur][0]), 110, 0)
              + DA._float('dk-chip dk-route', f'{icon("chat")}<span data-route data-tz="{p["tz"]}" data-city="{ea(p["city"])}"{" data-h12" if p.get("h12") else ""}>'
                          f'Mumbai ⇄ {e(p["city"])}<span class="dk-route__x"> · WhatsApp &amp; video</span></span>', 90, 1))
    return DA._dk('city', card, floats, sheets=2, label=f'What a website costs in {p["the"]}: local price ranges compared with U Scale’s fixed prices')


def _hhmm(h, h12):
    h = h % 24
    m = int(round((h - int(h)) * 60)); hh = int(h)
    if not h12:
        return f'{hh:02d}:{m:02d}'
    suf = 'am' if hh < 12 else 'pm'
    h2 = hh % 12 or 12
    return f'{h2}{":%02d" % m if m else ""} {suf}'


def our_day(off):
    """Our working day (10:00–19:00 in Mumbai, UTC+5:30) in the client's local time, as (start, end) in hours; may cross midnight."""
    return 10 - 5.5 + off, 19 - 5.5 + off


def overlap(off):
    a, b = our_day(off)
    return max(max(0, min(b + s, 18) - max(a + s, 9)) for s in (-24, 0, 24))


def _span_txt(off, h12):
    """Our day in their time as one range, even when it crosses midnight (11:30 pm–8:30 am)."""
    a, b = our_day(off)
    return f'{_hhmm(a, h12)}–{_hhmm(b, h12)}'


def _segs(a, b):
    out = []
    for s in (-24, 0, 24):
        x, y = max(0, a + s), min(24, b + s)
        if y > x: out.append((x, y))
    return out


def hours_html(p):
    """Their working day and ours, on one 24-hour line in their time. The shared hours glow."""
    off, h12 = p['utc'], p.get('h12', False)
    a, b = our_day(off)
    ov = overlap(off)
    bar = lambda segs, cls: ''.join(f'<i class="{cls}" style="--x:{x / 24 * 100:.2f}%;--w:{(y - x) / 24 * 100:.2f}%"></i>' for x, y in segs)
    shared = [(max(x, 9), min(y, 18)) for x, y in _segs(a, b) if min(y, 18) > max(x, 9)]
    ticks = ''.join(f'<span style="--x:{t / 24 * 100:.2f}%">{e(lbl)}</span>' for t, lbl in
                    [(0, 'midnight' if h12 else '00:00'), (6, '6 am' if h12 else '06:00'), (12, 'noon' if h12 else '12:00'), (18, '6 pm' if h12 else '18:00'), (24, '')])
    ours_txt = _span_txt(off, h12)
    big = f'{ov:g}' if ov else '0'
    note = p['hours_note']
    html = (f'<div class="hr" data-reveal><div class="hr__top"><p class="hr__big"><b>{e(big)}</b><span>{"hours of your working day we share" if ov else "shared hours, and that works in your favour"}</span></p>'
            f'<p class="hr__zone">{icon("clock")}{e(p["zone"])}</p></div>'
            f'<div class="hr__rows"><div class="hr__row"><span class="hr__k">Your day</span><span class="hr__t">{bar([(9, 18)], "hr__you")}'
            + ''.join(f'<i class="hr__both" style="--x:{x / 24 * 100:.2f}%;--w:{(y - x) / 24 * 100:.2f}%"></i>' for x, y in shared)
            + f'</span><small>{e(_hhmm(9, h12))}–{e(_hhmm(18, h12))}</small></div>'
            f'<div class="hr__row"><span class="hr__k">Ours</span><span class="hr__t">{bar(_segs(a, b), "hr__us")}</span><small>{e(ours_txt)}</small></div>'
            f'<div class="hr__ticks" aria-hidden="true">{ticks}</div>'
            f'<span class="hr__now" data-now data-tz="{p["tz"]}" hidden><b data-clock data-tz="{p["tz"]}"{" data-h12" if h12 else ""}></b></span></div>'
            f'<p class="hr__live" data-onair data-tz="{p["tz"]}" data-city="{ea(p["city"])}"{" data-h12" if h12 else ""} hidden></p>'
            f'<p class="hr__note">{icon("chat")}<span>{e(note)}</span></p></div>')
    text = f'Their working day 9:00–18:00 and ours 10:00–19:00 in Mumbai ({ours_txt} their time): {big} shared hours in standard time. {note}'
    return html, text


CLUTCH_URL = 'https://clutch.co/go-to-review/eca08f5c-a4b3-4095-b8fb-b46d05187051/505521'
CLUTCH_QUOTE = 'Their creativity, professionalism, attention to detail, and customer-focused approach truly set them apart.'


def review_html():
    """Our first review on Clutch, word for word (Prachi Pandya, Sashe by Prachi, 5.0). No review schema: Google ignores reviews a business shows of itself."""
    stars = ''.join(f'<i style="--s:{k}"></i>' for k in range(5))
    return (f'<figure class="rv" data-reveal><p class="rv__stars" aria-label="Rated 5.0 out of 5 on Clutch">{stars}<b>5.0</b><span>Verified review on Clutch</span></p>'
            f'<blockquote><p>{e(CLUTCH_QUOTE)}</p></blockquote><figcaption><span class="rv__av" aria-hidden="true">P</span><span><b>Prachi Pandya</b>'
            f'<small>Fashion Designer, Sashe by Prachi · Mumbai</small></span><a class="tlink" href="{ea(CLUTCH_URL)}" target="_blank" rel="noopener">Read it on Clutch'
            f'<span class="sr-only"> (opens in a new tab)</span> ↗</a></figcaption></figure>')


def with_review(block):
    html, text = block
    return html + review_html(), text + f' Review on Clutch, 5.0: "{CLUTCH_QUOTE}" (Prachi Pandya, Fashion Designer, Sashe by Prachi).'


def trust(cur, tld, keys=('pay', 'own', 'fix', 'bank')):
    """The four trust tiles of the city pages, in the client's currency, plus a tile for paying in that currency."""
    s_ = sym(cur).strip()
    img = GP.IMG['mehul']
    me = (f'<picture class="tb-me__img"><source type="image/avif" srcset="{GP.vurl(img["file"] + "-480.avif")}">'
          f'<img src="{GP.vurl(img["file"] + "-480.webp")}" width="480" height="480" alt="" loading="lazy" decoding="async"></picture>')
    coin = f'<span class="tb-pay__coin{" tb-pay__coin--long" if len(s_) > 1 else ""}">{e(s_)}</span>'
    tiles = {
        'pay': ('<div class="tb__g tb-pay" aria-hidden="true">'
                + ''.join(f'<span class="tb-pay__col" style="--w:{w};--i:{i}"><b>{w}%</b><i>{c}</i><small>{n}</small></span>'
                          for i, (w, n, c) in enumerate([(20, 'Start', ''), (20, 'Design', ''), (60, 'Launch', coin)])) + '</div>',
                'Pay most after launch.', 'You pay 60% only when your site is live.'),
        'own': (f'<div class="tb__g tb-own" aria-hidden="true"><span class="tb-own__bar">{CP.LOCK}<span>yourbusiness{e(tld)}</span></span>'
                f'<span class="tb-own__tag">{icon("key")}<span>Owner</span><b>You</b></span></div>',
                'All in your name.', 'Domain, code and every login. Yours, always.'),
        'fix': ('<div class="tb__g tb-doc" aria-hidden="true"><span class="tb-doc__paper"><i style="--i:0;--w:88%"></i><i style="--i:1;--w:64%"></i>'
                f'<i style="--i:2;--w:76%"></i><span class="tb-doc__total"><small>Total</small><b>{e(fx(BIZ, cur))}</b></span></span><span class="tb-doc__stamp">Fixed</span></div>',
                'Price fixed in writing.', 'Agreed before work starts. No surprise bills.'),
        'bank': (f'<div class="tb__g tb-bank" aria-hidden="true"><span class="tb-bank__card"><small>Pay to</small><b>U Scale</b>'
                 f'<span class="tb-bank__cur">{e(cur)}</span><span class="tb-bank__no">Local account details</span></span>'
                 f'<span class="tb-bank__ok">{icon("check")}Paid in {e(s_)}</span></div>',
                 f'Pay in {PD.FX[cur][2] if cur in PD.FX else "rupees"}.', 'A bank transfer, like paying a supplier at home.'),
        'me': (f'<div class="tb__g tb-me" aria-hidden="true"><span class="tb-me__on"><i></i>On WhatsApp</span>{me}'
               '<span class="tb-me__chat"><span class="tb-me__typing"><i></i><i></i><i></i></span><span class="tb-me__msg">Your design is ready. Have a look!</span></span></div>',
               'You talk to Mehul.', 'The founder leads your project. No account manager.'),
        'nda': ('<div class="tb__g tb-nda" aria-hidden="true"><span class="tb-nda__doc"><b>NDA</b><i></i><i></i><i></i><span class="tb-nda__sig">Signed</span></span></div>',
                'NDA before the brief.', 'Your client stays your client. We sign first.'),
    }
    tiles.update({k: (g, h, x) for k, g, h, x in CP.EXTRA_TILES})
    li = ''.join(f'<li class="tb__c tb__c--{k}" data-reveal>{tiles[k][0]}<h3>{e(tiles[k][1])}</h3><p>{e(tiles[k][2])}</p></li>' for k in keys)
    text = ' '.join(f'{tiles[k][1]} {tiles[k][2]}' for k in keys)
    return f'<ul class="tb" data-reveal-group tabindex="0" aria-label="How your payment and ownership are protected">{li}</ul>', text


PRICE_CARDS = [('Single page', LANDING, False, 'One page that sells: what you do, photos, prices and a clear way to get in touch.', 'Live in under 2 weeks', 'a one-page website'),
               ('Business site', BIZ, False, '5–10 pages: home, services, work, about and contact, designed around your business.', 'Live in 3–4 weeks', 'a 5–10 page business website'),
               ('Bigger site + blog', BLOG, False, '10–20 pages for many services or products, with a blog that helps you rank.', '', 'a 10–20 page website with a blog'),
               ('Online store', STORE, True, 'Up to 50 products, a cart and card payments through Stripe, Shopify Payments or PayPal.', '', 'an online store')]


def price_cards(cur, market='', where='', descs=None, cards=PRICE_CARDS, note=''):
    """Four plain prices in one currency, with a WhatsApp ask on each, what every site includes and one line of local comparison."""
    li = txt = ''
    for i, (k, name, onwards, d, t, ask) in enumerate(cards):
        d = (descs or {}).get(i, d)
        p_ = fx(name, cur)
        msg = (f"Hi Mehul, I'm in {where} and I'd like" if where else "Hi Mehul, I'd like") + f" {ask} ({p_}{' onwards' if onwards else ''}). Can we talk?"
        li += (f'<li class="pc__c{" pc__c--first" if i == 0 else ""}" data-reveal><div class="pc__g">{CP.PAGE_STACK[min(i, 3)]}</div><p class="pc__k">{e(k)}</p>'
               f'<p class="pc__p"><strong data-countto="{fxn(name, cur)}" data-pre="{ea(sym(cur))}">{e(p_)}</strong>{"<small>onwards</small>" if onwards else ""}</p>'
               f'<p class="pc__d">{e(d)}</p>' + (f'<p class="pc__t">{icon("clock")}{e(t)}</p>' if t else '')
               + f'<a class="pc__go" href="{ea(WA + urllib.parse.quote(msg))}" target="_blank" rel="noopener">{icon("chat")}<span>Ask on WhatsApp<span class="sr-only"> about {e(ask)}</span></span></a></li>')
        txt += f'- {k}: {p_}{" onwards" if onwards else ""}. {d}' + (f' {t}.' if t else '') + '\n'
    inc = f'Every site includes {GP.INCLUDED}.'
    tax = note or 'No tax is added to our invoice. Domain, hosting and any paid apps are billed by their providers, in your name.'
    html = (f'<ul class="pc{" pc--3" if len(cards) == 3 else ""}" data-reveal-group>{li}</ul><p class="pc__inc">{icon("check")}<span>{e(inc)} {e(tax)}</span></p>'
            + (f'<p class="pc__mkt">{e(market)} <a class="tlink" href="#sources">Sources</a></p>' if market else ''))
    return html, txt + f'{inc} {tax}' + (f'\n{market}' if market else '')


def rules_html(rules):
    """The local rules a website has to meet, each as a card that gets its check mark."""
    li = ''.join(f'<li class="rl__c" style="--i:{i}" data-reveal><span class="rl__ic">{icon(ic)}<i>{icon("check")}</i></span><b>{e(t)}</b>'
                 f'<p>{e(x)}</p>{GP.src_chip(s) if s else ""}</li>' for i, (ic, t, x, s) in enumerate(rules))
    return f'<ul class="rl" data-reveal-group>{li}</ul>', ' '.join(f'{t}: {x}' for _, t, x, _ in rules)


def chat_html(msgs, head, sub, kind=''):
    """A chat that plays out when it scrolls in: (side 'in'|'out', time, text). Without JS every message is shown."""
    li = ''.join(f'<li class="ch__m ch__m--{s}" style="--i:{i}"><span>{e(t)}</span><small>{e(tm)}</small></li>' for i, (s, tm, t) in enumerate(msgs))
    return (f'<div class="ch{" ch--" + kind if kind else ""}" data-reveal><p class="ch__head"><span class="ch__av">{icon("chat")}</span><span><b>{e(head)}</b>'
            f'<small>{e(sub)}</small></span></p><ol class="ch__list">{li}</ol></div>',
            ' '.join(f'{tm}: {t}' for _, tm, t in msgs))


def stat3(rows, src):
    h = CP.stat_trio(rows, src)
    return h['html'], h['text']


def hundred(n, big, label, src):
    h = CP.hundred(n, big, label, src)
    return h['html'], h['text']


# ================================================================ page shell
def sec(sid, eyebrow, h, lead, inner, tone=''):
    """A section: (html, plain text for llms-full.txt, heading). inner is (html, text)."""
    html, text = inner
    return dict(html=CP._custom_sec(sid, eyebrow, h, lead, html, tone=tone), text=text, h=h)


def work_sec(ctx_keys=('spacestudio', 'sashe', 'vidhi', 'antrah', 'roar', 'brandgen'), h='Real websites. Live right now.', lead='Tap any card to open the live site.'):
    return lambda ctx: dict(html=CP._custom_sec('work', 'Real work', h, lead, CP.work_rail(ctx, list(ctx_keys)), tone='dark'), text='', h=h)


def process_sec(h='Live in 3–4 weeks. All from your phone.'):
    return dict(html=CP._custom_sec('process', 'How it works', h, '', CP.timeline('remote-review'), tone='band'),
                text='Free audit on day 1 over WhatsApp; a written plan and fixed price on a video call in week 1 (20% to start); '
                     'the design in Figma to approve in week 2 (20% on sign-off); launch in weeks 3–4 with every login handed over (60% on launch).', h=h)


def _crumbs(p):
    return '<li><a href="/">Home</a></li>' + ''.join(f'<li><a href="{ea(h)}">{e(t)}</a></li>' for t, h in p['trail']) + f'<li aria-current="page">{e(p["crumb"])}</li>'


def _hero(p, wa, icons):
    long = ' stat__num--long' if any(len(n) >= 8 for n, _ in p['stats']) else ''
    stats = ''.join(f'<li class="stat"><span class="stat__num{long}">{e(n)}</span><span class="stat__label">{e(l)}</span></li>' for n, l in p['stats'])
    more = p.get('hero_more', ('#prices', 'See prices'))
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
        <nav class="crumbs" aria-label="Breadcrumb"><ol>{_crumbs(p)}</ol></nav>
        <p class="eyebrow">{e(p['eyebrow'])}</p><h1 class="sp-hero__title fp-hero__title" id="page-title">{e(p['h1'])}<span class="dot">.</span></h1>
        <p class="sp-hero__lead">{GP.lead_html(p['lead'])}</p>
        <div class="fp-hero__ctas">
          <div class="hero__cta" data-wa-zone><a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}{e(p.get('hero_btn', 'Free audit on WhatsApp'))}</a></div>
          <a class="btn btn--ghost fp-hero__more" href="{ea(more[0])}">{e(more[1])}</a>
        </div>
        <ul class="stats fp-stats">{stats}</ul>
      </div>
      {p['art'](p)}
    </section>
  </div>'''


def _related(p):
    li = ''.join(f'<li><a class="fp-rel" href="{ea(h)}"><span class="fp-rel__k">{e(k)}</span><b>{e(t)}</b><span class="fp-rel__d">{e(d)}</span>{icon("arrow")}</a></li>'
                 for h, k, t, d in p['related'] if h != '/' + p['path'])
    return f'<nav class="fp-related" aria-label="More pages"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>'


def _cta(p, wa, icons):
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">{e(p.get('cta_h', 'Get a free audit'))}<span class="dot">.</span></h2>
          <p class="lead">{e(p['cta_lead'])}</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email us</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {SP.EMAIL}</p>
        </div>
      </div>
      {_related(p)}
      <p class="fp-all">{p.get('all_links', ALL_LINKS)}</p>
    </div>
  </section>'''


ALL_LINKS = ('<a class="tlink" href="/services/outsource-web-design-india">Prices in your currency</a> · '
             '<a class="tlink" href="/services/white-label-web-design">White label for agencies</a> · <a class="tlink" href="/services">All services</a>')


def _foot(p):
    li = ''.join(f'<li><a href="{ea(GP.SRC[k][2])}" target="_blank" rel="noopener">{e(GP.SRC[k][1])}<span class="sr-only"> (opens in a new tab)</span></a><span>{e(GP.SRC[k][0])}</span></li>'
                 for k in p['sources'])
    src = f'<div class="fp-sources" id="sources"><h2 class="fp-mini-h">Sources</h2><ol>{li}</ol></div>' if li else '<div></div>'
    href, k, b = p.get('foot_card', ('/services/outsource-web-design-india#prices', 'Prices in 8 currencies', 'See every price abroad'))
    return f'''
  <section class="section fp-sec fp-sec--foot" aria-label="Sources and prices">
    <div class="wrap fp-foot">
      {src}
      <a class="fp-pricecard" href="{ea(href)}"><span class="fp-pricecard__k">{icon('tag')}{e(k)}</span><b>{e(b)}</b>{icon('arrow')}</a>
    </div>
  </section>'''


def og_image(site, p):
    return f'{site}assets/pages/og-{p["slug"]}.jpg', p['og_alt']


def _offers(site, url, p):
    out = []
    for name, cur in p.get('offers', []):
        v = fxn(name, cur) if cur != 'INR' else rupees(name)
        frm = name in (STORE, STORE_BIG)
        spec = {'@type': 'UnitPriceSpecification', 'priceCurrency': cur, ('minPrice' if frm else 'price'): v}
        if '/mo' in price(name): spec.update(aeo.MONTHLY)
        o = {'@type': 'Offer', 'name': PD.label(name), 'priceCurrency': cur, 'priceSpecification': spec, 'url': url + '#prices'}
        if not frm: o['price'] = v
        out.append(o)
    return out


def _jsonld(site, url, p):
    main = {'@type': 'Service', '@id': url + '#service', 'name': p['service'], 'serviceType': p.get('service_type', 'Website design and development'),
            'url': url, 'description': p['answer'], 'provider': {'@id': site + '#business'},
            'areaServed': p.get('area') or [{'@type': 'Country', 'name': n} for n in p.get('countries', [])],
            'availableChannel': {'@type': 'ServiceChannel', 'name': 'WhatsApp and video calls', 'serviceUrl': 'https://wa.me/' + aeo.ENTITY['whatsapp']}}
    offers = _offers(site, url, p)
    if offers: main['offers'] = offers
    og_url, og_alt = og_image(site, p)
    img = {'@type': 'ImageObject', '@id': url + '#og-image', 'url': og_url, 'contentUrl': og_url, 'width': 1200, 'height': 630, 'caption': og_alt,
           'encodingFormat': 'image/jpeg', 'creditText': 'U Scale', 'creator': {'@id': site + '#business'}, 'copyrightHolder': {'@id': site + '#business'},
           'copyrightNotice': '© 2026 U Scale by Mehul Karotra', 'license': site + 'image-license', 'acquireLicensePage': site + 'image-license'}
    main['image'] = {'@id': img['@id']}
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': p['title'], 'description': p['desc'], 'isPartOf': {'@id': site + '#website'},
            'about': {'@id': main['@id']}, 'mainEntity': {'@id': main['@id']}, 'author': {'@id': site + '#mehul'},
            'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': p.get('lang', 'en'), 'dateModified': '__LASTMOD__',
            'primaryImageOfPage': {'@id': img['@id']}, 'image': [{'@id': img['@id']}]}
    if p['sources']: page['citation'] = [GP.SRC[k][2] for k in p['sources']]
    crumbs = [('Home', site)] + [(t, site + h.lstrip('/')) for t, h in p['trail'] if h != '/'] + [(p['crumb'], url)]
    graph = [page, main, aeo.biz_ref(site), aeo.person_ref(site),
             {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                 {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(crumbs)]},
             aeo._faq_ld(url, p['faq']), img]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def sections(ctx, p):
    return [s(ctx) if callable(s) else s for s in p['blocks']]


def page(ctx, parts, p):
    site = ctx['SITE_URL']; url = site + p['path']
    icons = ctx['ICONS']
    wa = WA + urllib.parse.quote(p['wa'])
    body = _hero(p, wa, icons) + ''.join(s['html'] for s in sections(ctx, p))
    body += (aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title', None, fold=2)
             .replace('class="section sp-brief-wrap"', 'class="section sp-brief-wrap sp-brief-wrap--fold"', 1)
             + aeo._faq_section(p['faq'], p.get('faq_h', 'Questions.')) + _foot(p) + _cta(p, wa, icons))
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, url, p), body, og=og_image(site, p), lang=p.get('lang', 'en'))


# ================================================================ the countries
HUB = '/services/outsource-web-design-india'
TRAIL = [('Services', '/services'), ('Clients abroad', HUB)]


TZ = {'uk': 'Europe/London', 'usa': 'America/New_York', 'australia': 'Australia/Sydney', 'canada': 'America/Toronto', 'singapore': 'Asia/Singapore', 'uae': 'Asia/Dubai', 'ireland': 'Europe/Dublin', 'new-zealand': 'Pacific/Auckland', 'netherlands': 'Europe/Amsterdam'}
# The order each buyer reads in (DESIGN-TAILORING.md): what that country's buyer checks first comes first.
ORDER = {'uk': ['trust', 'sig', 'prices', 'cost', 'hours', 'work', 'process', 'rules'],
         'usa': ['hours', 'sig', 'prices', 'cost', 'work', 'trust', 'process', 'rules'],
         'australia': ['sig', 'prices', 'cost', 'trust', 'work', 'hours', 'process', 'rules'],
         'canada': ['sig', 'trust', 'prices', 'cost', 'hours', 'work', 'process', 'rules'],
         'singapore': ['hours', 'prices', 'cost', 'sig', 'trust', 'work', 'process', 'rules'],
         'uae': ['sig', 'prices', 'cost', 'trust', 'work', 'hours', 'process', 'rules'],
         'ireland': ['sig', 'trust', 'rules', 'prices', 'cost', 'hours', 'work', 'process'],
         'new-zealand': ['hours', 'sig', 'prices', 'cost', 'trust', 'work', 'process', 'rules'],
         'netherlands': ['sig', 'trust', 'prices', 'cost', 'rules', 'hours', 'work', 'process']}
ADJ = {'uk': 'UK', 'usa': 'US', 'australia': 'Australian', 'canada': 'Canadian', 'singapore': 'Singapore', 'uae': 'UAE', 'ireland': 'Irish',
       'new-zealand': 'New Zealand', 'netherlands': 'Dutch'}
HOURS_H = {'uk': 'Your morning is our afternoon.', 'usa': 'We work while you sleep.', 'australia': 'Your afternoon is our morning.',
           'canada': 'We work while you sleep.', 'singapore': 'We share your afternoon, all year.', 'uae': 'We share almost your whole day.',
           'ireland': 'Your morning is our afternoon.', 'new-zealand': 'Your evening is our afternoon.', 'netherlands': 'Your morning is our afternoon.'}


def country(slug, name, the, short, cur, lang, tld, city, utc, zone, h12, overlap_summer, market, scale, ticks, cost_foot, market_line,
            title, desc, h1, lead, wa, rules, signature, faq_extra, sources, hours_note, card, where, cta_lead, extra_facts=(), price_descs=None,
            summer_note=''):
    ov = overlap(utc)
    p = dict(slug=f'website-design-{slug}', path=f'services/website-design-{slug}', name=name, the=the, short=short, cur=cur, lang=lang, tld=tld, tz=TZ[slug],
             city=city, utc=utc, zone=zone, h12=h12, market=market, scale=scale, ticks=ticks, cost_foot=cost_foot, hours_note=hours_note,
             trail=TRAIL, crumb=short, title=title, desc=desc, h1=h1, eyebrow=f'From Mumbai, for {the}', lead=lead, wa=wa, card=card,
             art=__import__('world_art').ART[slug], cta_lead=cta_lead, countries=[name], service=f'Website design and development for businesses in {the}',
             og_alt=f'Website design for businesses in {the}, from U Scale in Mumbai: fixed prices in {PD.FX[cur][2]}',
             offers=[(LANDING, cur), (BIZ, cur), (BLOG, cur), (STORE, cur)], sources=sources)
    p['stats'] = [(fx(LANDING, cur), 'Websites from'), (f'{ov:g} h' if ov else 'Overnight', 'Shared hours' if ov else 'Work while you sleep'), ('60%', 'Paid after launch')]
    pc = price_cards(cur, market_line, where, price_descs)
    by = {'trust': sec('trust', 'Why it’s safe', 'You’re protected at every step.', '', with_review(trust(cur, tld))),
          'work': work_sec(),
          'prices': sec('prices', f'Prices in {PD.FX[cur][2]}', f'Website prices for {the}', 'Four prices, fixed in writing before work starts.', pc),
          'cost': sec('cost', 'Compared', f'What a website costs in {the}', '', (f'<div class="cost-sec">{cost_card(p)}<p class="cost-sec__t">{e(market_line)} '
                      '<a class="tlink" href="#sources">Sources</a></p></div>', market_line), tone='band'),
          'hours': sec('hours', 'Your time zone', HOURS_H[slug], '', hours_html(p), tone='band'),
          'sig': signature,
          'process': process_sec(),
          'rules': sec('rules', 'Local rules', f'{ADJ[slug]} rules, handled.', '', rules_html(rules))}
    p['blocks'] = [by[k] for k in ORDER[slug]]
    p['answer'] = (f'U Scale is a web design studio in Mumbai, India, that builds hand-coded websites for businesses in {the} over WhatsApp and '
                   f'video calls. Prices are fixed in {PD.FX[cur][2]} and agreed in writing: {fx(LANDING, cur)} for a landing page, {fx(BIZ, cur)} for a '
                   f'5–10 page business site and from {fx(STORE, cur)} for an online store. You pay 60% only when the site is live, and the domain, '
                   'code and logins are in your name.')
    p['facts'] = [('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
                  ('Based in', 'Mumbai, India. No office abroad: projects run over WhatsApp, email and video calls'),
                  (f'Prices in {PD.FX[cur][2]}', f'Landing page {fx(LANDING, cur)} · business site, 5–10 pages {fx(BIZ, cur)} · 10–20 pages with a blog {fx(BLOG, cur)} · online store from {fx(STORE, cur)}'),
                  (f'Local prices in {the}', market_line),
                  ('Payment', f'20% to start, 20% on design sign-off, 60% on launch, by {PAY_ROUTE.split(", so")[0]}'),
                  ('Working hours', f'10:00–19:00 in Mumbai (UTC+5:30), which is {_span_txt(utc, h12)} in {city} in standard time'),
                  ('Timeline', 'Landing page in under 2 weeks; business site in 3–4 weeks'),
                  ('You own', 'Your domain, hosting, code, design files and every login')] + list(extra_facts)
    ours = _span_txt(utc, h12)
    p['faq'] = [
        (f'How much does a website cost in {the}?',
         f'{market_line} With U Scale the price is fixed in {PD.FX[cur][2]}: a landing page is {fx(LANDING, cur)}, a 5–10 page business site {fx(BIZ, cur)}, '
         f'a 10–20 page site with a blog {fx(BLOG, cur)} and an online store from {fx(STORE, cur)}. These are our rupee prices, converted. The rest of the gap '
         'comes from our costs in Mumbai, not from cutting corners: every site is designed for you and hand-coded.'),
        (f'How do I pay you from {the}?',
         f'By {PAY_ROUTE}. You pay in three parts: 20% to start, 20% when you approve the design and 60% when the site is live. '
         'No tax is added to our invoice.'),
        (f'What hours do you work in {city} time?',
         f'We work 10:00 to 19:00 in Mumbai, which is {ours} in {city} in standard time. '
         + (f'That gives us about {ov:g} working hours together' + (f', {overlap_summer:g} when the clocks change' if overlap_summer != ov else '') + '. ' if ov else
            'Our working day ends around the time yours starts, so a short call at the start of your morning works, and the rest happens in writing while you sleep. ')
         + (summer_note + ' ' if summer_note else '') + 'Most of the project runs in writing on WhatsApp and email anyway, with a video call at each stage.'),
        (f'Will my website rank in {the} if you are in India?',
         'Yes. Where your designer sits has nothing to do with it. Google looks at what your pages say, whether they load fast on a phone and who links to you. '
         f'For local searches, it uses your Google Business Profile and how far you are from the searcher. We build with your {tld} domain, your '
         'address and phone number, Search Console set up for you, and page titles written for the words people in your area actually type.'),
        ('Who owns the website when it is done?',
         'You do. The domain and hosting are registered in your name from the start, and at launch you get the code, the design files and every login. '
         'There is no lock-in, and if you ever move to another developer, they get a clean, hand-written codebase.'),
    ] + list(faq_extra)
    k = [q for q, _, _ in RELATED_COUNTRIES].index(slug)
    nxt = [RELATED_COUNTRIES[(k + j) % len(RELATED_COUNTRIES)] for j in range(1, 5)]  # the next four, wrapping, so every country is linked from four others
    p['related'] = [(f'/services/website-design-{q}', 'Another country', f'Website design for {t}', d) for q, t, d in nxt] + TRADE_LINKS.get(slug, []) + [
        (HUB, 'All countries', 'Web design from India, priced in your currency', 'Eight currencies, one price list, every time zone.'),
        ('/services/white-label-web-design', 'For agencies', 'White label web design', 'Fixed price per site, under your brand, NDA first.')]
    return p


TRADE_LINKS = {
    'uk': [('/services/website-design-for-indian-restaurants', 'By trade', 'Indian restaurant websites', 'Your menu and your own online ordering, in pounds.')],
    'usa': [('/services/website-design-for-independent-hotels', 'By trade', 'Hotel and motel websites', 'Direct bookings, built to WCAG 2.1 AA.'),
            ('/services/website-design-for-indian-restaurants', 'By trade', 'Indian restaurant websites', 'Your menu and your own online ordering.')],
    'canada': [('/services/website-design-for-indian-restaurants', 'By trade', 'Indian restaurant websites', 'Your menu and your own online ordering.')],
    'australia': [('/services/website-design-for-indian-restaurants', 'By trade', 'Indian restaurant websites', 'Your menu and your own online ordering.')],
    'uae': [('/services/website-design-for-indian-fashion-brands', 'By trade', 'Online stores for Indian fashion labels', 'Prices in dirhams, pounds or dollars.')],
    'singapore': [('/services/figma-to-code', 'Service', 'Figma to code', 'Your design, hand-coded to match.')],
}


RELATED_COUNTRIES = [('uk', 'the UK', 'Fixed £ prices and 4.5 shared working hours.'),
                     ('usa', 'the US', 'Fixed $ prices; the work happens while you sleep.'),
                     ('australia', 'Australia', 'Fixed A$ prices; your afternoon is our morning.'),
                     ('canada', 'Canada', 'Fixed C$ prices, English and French pages.'),
                     ('singapore', 'Singapore', 'Fixed S$ prices and 5.5 shared hours all year.'),
                     ('uae', 'the UAE', 'AED prices and almost all of your working day shared.'),
                     ('ireland', 'Ireland', 'Fixed € prices, GDPR cookies and the accessibility act.'),
                     ('new-zealand', 'New Zealand', 'Fixed NZ$ prices; feedback at night, changes by morning.'),
                     ('netherlands', 'the Netherlands', 'Fixed € prices, in English, with GDPR cookies.')]


def cookie_demo():
    """UK: the cookie choice we built for uscale.in itself, as a picture. Reject is as easy as accept."""
    html = (f'<div class="ck" data-reveal><div class="ck__site" aria-hidden="true"><span class="ck__bar"><i></i><i></i><i></i><b>yourbusiness.co.uk</b></span>'
            '<span class="ck__line" style="--w:62%"></span><span class="ck__line" style="--w:44%"></span><span class="ck__line ck__line--s" style="--w:80%"></span>'
            '<div class="ck__box"><b>Can I count your visit?</b><p>Google Analytics shows which pages are useful. It stays off unless you say yes.</p>'
            '<span class="ck__btns"><span class="ck__b">No thanks</span><span class="ck__b ck__b--go">Yes, that’s fine</span></span></div></div>'
            f'<div class="ck__copy"><p class="ck__k">{icon("shield")}Built for uscale.in first</p><h3>The choice is real.</h3>'
            '<p>“No thanks” sits next to “Yes”, the same size, and no analytics cookie is set until someone says yes. Browsers that send Global Privacy Control are never asked: '
            'their answer is already no. It is the banner on this site, and the one we build for you.</p>'
            '<p class="ck__small">Since the Data (Use and Access) Act 2025, cookies that only count visits to improve a site can be set without asking, '
            f'as long as people can switch them off. We still ask on our own site, and set yours up the way you prefer. {GP.src_chip("uk-pecr")}</p></div></div>')
    return html, ('The cookie choice we build: “No thanks” next to “Yes”, the same size, and no analytics cookie until a yes. Since the Data (Use and Access) Act 2025, '
                  'cookies that only collect statistics to improve a site no longer need consent in the UK, if people can turn them off.')


def eaa_flow():
    """Ireland: does the European Accessibility Act cover your website? Two questions, from the CCPC's guidance."""
    html = (f'<div class="fl" data-reveal><ol class="fl__q"><li style="--i:0"><span class="fl__n">1</span><b>Do you sell online, or take bookings or payments on your site?</b>'
            '<span class="fl__a"><i>No</i><i class="is-go">Yes</i></span></li>'
            '<li style="--i:1"><span class="fl__n">2</span><b>Fewer than 10 staff, and turnover or balance sheet of €2 million or less?</b>'
            '<span class="fl__a"><i>Yes: a microenterprise</i><i class="is-go">No</i></span></li></ol>'
            f'<div class="fl__out" style="--i:2"><p>{icon("check")}<span><b>Microenterprises</b> that provide services are exempt from the Act’s service rules.</span></p>'
            f'<p>{icon("shield")}<span><b>Everyone else</b> selling to consumers online has had to meet it since 28 June 2025. We build to WCAG 2.1 AA either way.</span></p>'
            f'{GP.src_chip("ie-ccpc")}</div></div>')
    return html, ('Does the European Accessibility Act cover your site? If you sell online or take bookings, and you have 10 or more staff or turnover above '
                  '€2 million, yes: since 28 June 2025. Microenterprises providing services are exempt. We build to WCAG 2.1 AA either way.')


def _lang(sample, other, code, en, local):
    h = CP.lang_demo(sample, other, code, en, local)
    return h['html'], h['text']


COUNTRIES = [
 country('uk', 'United Kingdom', 'the UK', 'UK', 'GBP', 'en-GB', '.co.uk', 'London', 0, 'London, GMT', False, 5.5,
   [('Freelancer', 'Small business site', 800, 3000, '£800–£3,000'), ('Small agency', 'Small to mid-size', 3000, 15000, '£3,000–£15,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From UK price guides, 2026',
   'UK price guides from 2026 put a freelancer’s small business site at £800–£3,000 and a small agency at £3,000–£15,000.',
   'Website Design for UK Businesses, from £200 | U Scale',
   f'Hand-coded websites for UK small businesses, built in Mumbai: landing page {fx(LANDING, "GBP")}, 5–10 pages {fx(BIZ, "GBP")}, fixed in pounds. 4.5 shared working hours.',
   'Website design for UK businesses',
   f'Designed for you and hand-coded, at a fixed price in pounds: {fx(BIZ, "GBP")} for a 5–10 page site. You pay most of it after launch, and you own everything.',
   "Hi Mehul, I run a business in the UK. I'd like a free audit and a price in pounds for my website.",
   [('cookie', 'Cookies, UK GDPR', 'A cookie choice that matches the 2025 rules, and a privacy page in plain English.', 'uk-pecr'),
    ('users', 'Accessibility', 'The Equality Act expects reasonable adjustments. We build to WCAG 2.1 AA: contrast, keyboard, screen readers.', 'uk-scope'),
    ('file', 'An English contract', 'Scope, price and dates in writing, and an NDA if you want one before you share anything.', ''),
    ('tag', 'No VAT on our invoice', 'You pay the fixed price. Domain and hosting are billed in your name by UK providers if you prefer.', '')],
   sec('cookies', 'Done properly', 'A cookie banner people can actually say no to.', '', cookie_demo()),
   [('Can you sign an NDA or a UK-style contract?',
     'Yes. We send a written plan with the scope, price, dates and payment stages before you pay anything, and we sign your NDA first if you have one. '
     'If your accountant needs a particular invoice format, tell us and we follow it.'),
    ('Do you meet UK cookie rules?',
     'Yes. Since the Data (Use and Access) Act 2025, cookies that only collect statistics to improve your site can be set without consent, as long as '
     'people can switch them off. Anything else, such as advertising cookies, waits for a choice. We set up the banner, the consent settings in Google '
     'Tag Manager and a privacy page in plain English.')],
   ['uk-a9', 'uk-es', 'uk-pgs', 'uk-pecr', 'uk-scope', 'wise-in', 'utc'],
   'We overlap with your morning, so calls and quick changes happen the same day. After 1:30 pm, your messages are waiting for us first thing.',
   'Fixed £ prices, 4.5 shared working hours and UK cookie rules handled.', 'the UK',
   'Tell us about your business. We reply within a working day, usually the same morning, your time.',
   summer_note='From the end of March to the end of October, UK summer time makes it 5:30 am to 2:30 pm.'),

 country('usa', 'United States', 'the US', 'USA', 'USD', 'en-US', '.com', 'New York', -5, 'New York, Eastern Time', True, 0.5,
   [('Freelancer', 'Small business site', 1500, 8000, '$1,500–$8,000'), ('Agency', 'Small business site', 6000, 15000, 'from $6,000')],
   10000, [0, 2500, 5000, 7500, 10000], 'From US price guides, 2026',
   'US price guides from 2026 put a freelancer’s small business site at $1,500–$8,000, and agencies start at about $6,000.',
   'Website Design for US Small Businesses, from $250 | U Scale',
   f'Hand-coded websites for US small businesses, built in Mumbai while you sleep: landing page {fx(LANDING, "USD")}, 5–10 pages {fx(BIZ, "USD")}, fixed in dollars.',
   'Website design for US small businesses',
   f'Designed for you and hand-coded, at a fixed price in dollars: {fx(BIZ, "USD")} for a 5–10 page site. We work while you sleep, and you pay most of it after launch.',
   "Hi Mehul, I run a business in the US. I'd like a free audit and a price in dollars for my website.",
   [('users', 'ADA and WCAG 2.1 AA', 'Contrast, alt text, keyboard and screen-reader checks on every page before launch.', 'us-ada'),
    ('cookie', 'State privacy laws', 'A privacy page and cookie settings that fit where your customers are. Most state laws only apply above a size threshold.', ''),
    ('file', 'A written contract', 'Scope, price and dates in writing before you pay, and an NDA if you want one.', ''),
    ('tag', 'Paid in dollars', 'An ACH or wire transfer in USD to local account details. No sales tax on our invoice.', 'wise-in')],
   dict(html=CP._custom_sec('ada', 'Accessibility', 'Small businesses get sued too.', '', '<div class="duo">' + hundred(64, '64 of 100', 'ADA website lawsuits in 2025 were against companies with under $25 million in revenue. UsableNet reviewed more than 5,000 of them.', 'us-ada')[0]
                            + chat_html([('out', '4:45 pm ET', 'Can the menu go above the photo on mobile?'), ('in', '11:40 pm ET', 'Done. Preview link updated, before and after attached.'),
                                         ('out', '7:55 am ET', 'Perfect. Approved!')], 'Your project chat', 'Feedback at the end of your day, changes by morning', 'night')[0] + '</div>', tone=''),
        text='64 of 100 ADA website lawsuits in 2025 were against companies under $25 million in revenue (UsableNet, more than 5,000 lawsuits reviewed). '
             'Feedback sent at the end of your day is on the preview link by morning.', h='Small businesses get sued too.'),
   [('Is my website ADA compliant if you build it?',
     'We build to WCAG 2.1 AA, the standard US courts and the Department of Justice point to: colour contrast, alt text, headings in order, forms with '
     'labels and everything usable with a keyboard. We test with a screen reader before launch. No one can promise you will never be sued, but a site '
     'built this way gives a plaintiff’s firm far less to point at.'),
    ('Can we talk on a call during US business hours?',
     'Yes, at the start of your morning. 8:00 am Eastern is 6:30 pm in Mumbai, so a short call then works well. For the West Coast we book an early slot by '
     'appointment. Most of the work then happens overnight, your time.')],
   ['us-jim', 'us-le', 'us-ada', 'us-sba', 'wise-in', 'utc'],
   'Send feedback by the end of your day. Our day starts at 11:30 pm Eastern, so changes are usually on your preview link before you wake up.',
   'Fixed $ prices, ADA-ready builds, and the work happens while you sleep.', 'the US',
   'Tell us about your business. Message us any time; we reply overnight, so the answer is there in your morning.',
   extra_facts=[('Accessibility', 'Built to WCAG 2.1 AA and checked with a screen reader before launch')],
   summer_note='From March to November, daylight saving time moves our day to 12:30 am–9:30 am Eastern.'),

 country('australia', 'Australia', 'Australia', 'Australia', 'AUD', 'en-AU', '.com.au', 'Sydney', 10, 'Sydney, AEST', True, 2.5,
   [('Small business site', '5–10 pages, local studio', 2000, 6000, 'A$2,000–A$6,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From an Australian price guide, Jul 2026',
   'An Australian price guide from July 2026 puts a 5–10 page small business site at A$2,000–A$6,000.',
   'Website Design for Australian Businesses, from A$400 | U Scale',
   f'Hand-coded websites for Australian small businesses, built in Mumbai: landing page {fx(LANDING, "AUD")}, 5–10 pages {fx(BIZ, "AUD")}, fixed in Australian dollars.',
   'Website design for Australian businesses',
   f'Designed for you and hand-coded, at a fixed price in Australian dollars: {fx(BIZ, "AUD")} for a 5–10 page site. Send feedback after lunch and it’s done by morning.',
   "Hi Mehul, I run a business in Australia. I'd like a free audit and a price in AUD for my website.",
   [('mail', 'Spam Act', 'Enquiry and newsletter forms ask for clear opt-in consent before anyone gets marketing email.', 'au-spam'),
    ('cookie', 'Privacy Act', 'A privacy page that says what the site collects and why. The Act covers firms with A$3 million+ turnover, and good practice covers everyone.', 'au-spam'),
    ('users', 'Accessibility', 'The Disability Discrimination Act covers private websites too. We build to WCAG 2.1 AA.', ''),
    ('tag', 'No GST on our invoice', 'You pay the fixed price in AUD by bank transfer to local account details.', 'wise-in')],
   sec('relay', 'Your afternoon, our morning', 'Feedback after lunch. Changes by morning.', '',
       chat_html([('out', '1:30 pm', 'Can we swap the hero photo and add our ABN to the footer?'), ('in', '4:10 pm', 'On it. You’ll have it tonight.'),
                  ('in', '9:20 pm', 'Done. Preview link updated with both changes.'), ('out', '8:05 am', 'Love it. Approved.')],
                 'Your project chat', 'Times in Sydney', 'relay')),
   [('Do I pay GST on your invoice?',
     'No. No GST or other tax is added to our invoice: you pay the fixed price in Australian dollars. Domain and hosting are bought in your name from '
     'Australian providers if you prefer, and they charge GST as usual.')],
   ['au-wtd', 'au-spam', 'au-abs', 'wise-in', 'utc'],
   'Our day starts at 2:30 pm in Sydney. Message us after lunch and the changes are usually on your preview link by the next morning.',
   'Fixed A$ prices; send feedback after lunch, see the changes by morning.', 'Australia',
   'Tell us about your business. Message us in your afternoon and the reply comes the same day.',
   summer_note='From October to April, daylight saving makes it 3:30 pm to 12:30 am in Sydney.'),

 country('canada', 'Canada', 'Canada', 'Canada', 'CAD', 'en-CA', '.ca', 'Toronto', -5, 'Toronto, Eastern Time', True, 0.5,
   [('Freelancer', 'Small business site', 1500, 7000, 'C$1,500–C$7,000'), ('Toronto studio', 'Brochure site', 3000, 7500, 'C$3,000–C$7,500')],
   10000, [0, 2500, 5000, 7500, 10000], 'From Canadian price guides, 2026',
   'Canadian price guides from 2026 put a freelancer at C$1,500–C$7,000 and a Toronto studio’s brochure site at C$3,000–C$7,500.',
   'Website Design for Canadian Businesses, from C$400 | U Scale',
   f'Hand-coded websites for Canadian small businesses, in English and French: landing page {fx(LANDING, "CAD")}, 5–10 pages {fx(BIZ, "CAD")}, fixed in Canadian dollars.',
   'Website design for Canadian businesses',
   f'Designed for you and hand-coded, at a fixed price in Canadian dollars: {fx(BIZ, "CAD")} for a 5–10 page site, in English, French or both.',
   "Hi Mehul, I run a business in Canada. I'd like a free audit and a price in CAD for my website.",
   [('cookie', 'Quebec privacy law', 'Since September 2023, cookies other than the necessary ones must be off until the visitor turns them on.', 'ca-law'),
    ('mail', 'CASL', 'Forms ask for clear consent before marketing email, and keep a record of it.', 'ca-law'),
    ('users', 'AODA', 'Ontario firms with 50+ staff must meet WCAG 2.0 AA. We build to 2.1 AA for everyone.', 'ca-aoda'),
    ('tag', 'Paid in CAD', 'A bank transfer in Canadian dollars to local account details. No GST/HST on our invoice.', 'wise-in')],
   sec('french', 'English and French', 'Bilingual, the way Google reads it.', 'Each language on its own address, with a switch on every page.',
       _lang('English or French? Tap to switch.', 'Français', 'fr', ('Book a free consultation', 'Call or message us today'),
             ('Réservez une consultation gratuite', 'Appelez-nous ou écrivez-nous aujourd’hui'))),
   [('Can my website be in English and French?',
     'Yes. Each language gets its own pages and addresses, with a switch on every page and the tags Google uses to show the right one. We build from '
     'your French text or your translator’s; we don’t machine-translate it and hope.'),
    ('Do you follow Quebec’s cookie rules and CASL?',
     'Yes. Non-essential cookies stay off until the visitor turns them on, which Quebec has required since September 2023. Newsletter and enquiry forms '
     'ask for consent in plain words, so your email list stays within CASL.')],
   ['ca-marvel', 'ca-shift8', 'ca-law', 'ca-aoda', 'wise-in', 'utc'],
   'Our day starts at 11:30 pm Eastern. Send feedback before you log off, and the changes are on your preview link by morning.',
   'Fixed C$ prices, English and French pages, Quebec cookie rules handled.', 'Canada',
   'Tell us about your business. Message us any time; the reply is there in your morning.',
   summer_note='From March to November, daylight saving moves our day to 12:30 am–9:30 am Eastern.'),

 country('singapore', 'Singapore', 'Singapore', 'Singapore', 'SGD', 'en-SG', '.com.sg', 'Singapore', 8, 'Singapore, SGT', False, 5.5,
   [('Freelancer', 'Template site', 1500, 1600, 'from S$1,500'), ('Small business site', 'Local studios', 3000, 8000, 'S$3,000–S$8,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From Singapore price guides, 2026',
   'Singapore guides from 2026 put a small business site at S$3,000–S$8,000, and a freelancer’s template site from S$1,500.',
   'Website Design for Singapore Businesses, from S$350 | U Scale',
   f'Hand-coded websites for Singapore SMEs, built in Mumbai with 5.5 shared hours all year: landing page {fx(LANDING, "SGD")}, 5–10 pages {fx(BIZ, "SGD")}.',
   'Website design for Singapore businesses',
   f'Designed for you and hand-coded, at a fixed price in Singapore dollars: {fx(BIZ, "SGD")} for a 5–10 page site. We share most of your afternoon, every day of the year.',
   "Hi Mehul, I run a business in Singapore. I'd like a free audit and a price in SGD for my website.",
   [('cookie', 'PDPA', 'Cookies that collect personal data wait for consent, and the privacy notice says what you collect and why.', 'sg-pdpa'),
    ('users', 'Accessibility', 'Not required by law for private sites in Singapore, but we build to WCAG 2.1 AA anyway.', ''),
    ('file', 'A written contract', 'Scope, price and dates in writing before you pay anything.', ''),
    ('tag', 'Paid in SGD', 'A bank transfer in Singapore dollars to local account details. No GST on our invoice.', 'wise-in')],
   sec('year', 'No clock changes', 'The same hours, all year.', '',
       stat3([('clock', '5.5 h', 'shared every working day, all year'), ('chat', 'Same day', 'replies to anything sent before 6 pm'),
              ('users', '369,500', 'SMEs in Singapore, 2025')], ['sg-stat', 'utc'])),
   [('Does Singapore’s PDPA affect my website?',
     'Yes, if your site collects personal data, and almost every enquiry form does. Cookies that collect personal data need consent first, and your '
     'privacy notice should say what you collect and why. We set both up as part of the build.')],
   ['sg-we', 'sg-mt', 'sg-pdpa', 'sg-stat', 'wise-in', 'utc'],
   'Neither of us changes the clocks, so it is 12:30 to 6 pm together, every working day of the year.',
   'Fixed S$ prices and 5.5 shared working hours, all year.', 'Singapore',
   'Tell us about your business. We share your afternoon, so the reply usually comes the same day.'),

 country('uae', 'United Arab Emirates', 'the UAE', 'UAE', 'AED', 'en-AE', '.ae', 'Dubai', 4, 'Dubai, GST', False, 8.5,
   [('Cheapest fixed-price shops', '5–6 pages', 999, 2500, 'AED 999–2,500'), ('Agencies', 'Small business site', 5000, 20000, 'AED 5,000–20,000')],
   10000, [0, 2500, 5000, 7500, 10000], 'From Dubai price pages, 2026',
   'Dubai price pages from 2026 run from AED 999–2,500 at the cheapest fixed-price shops to AED 5,000–20,000 at agencies.',
   'Website Design for UAE Businesses, from AED 1,000 | U Scale',
   f'Custom, hand-coded websites for businesses in Dubai and the UAE, not templates: landing page {fx(LANDING, "AED")}, 5–10 pages {fx(BIZ, "AED")}, almost your whole day shared.',
   'Website design for UAE businesses',
   f'Designed for you and hand-coded, not a template, at a fixed price in dirhams: {fx(BIZ, "AED")} for a 5–10 page site. We share almost your whole working day.',
   "Hi Mehul, I run a business in the UAE. I'd like a free audit and a price in AED for my website.",
   [('cookie', 'UAE data law', 'A privacy notice and consent on your forms. The PDPL is issued; its detailed regulations were still unpublished in early 2025.', 'ae-pdpl'),
    ('chat', 'WhatsApp first', 'A WhatsApp button on every page, because that is where your customers already are.', ''),
    ('globe', 'Arabic, honestly', 'We build Arabic layouts right to left, from your translator’s text. We don’t write Arabic copy ourselves.', ''),
    ('tag', 'Paid in AED', 'A bank transfer in dirhams to local account details. No VAT on our invoice.', 'wise-in')],
   sec('day', 'Same working day', 'Almost your whole day, together.', '',
       chat_html([('out', '9:30 am', 'Can you add our Arabic brochure as a page?'), ('in', '9:42 am', 'Yes. Send the Arabic text and we’ll lay it out right to left.'),
                  ('in', '3:15 pm', 'Done. Have a look on your phone.'), ('out', '3:20 pm', 'Perfect, thank you!')], 'Your project chat', 'Times in Dubai', 'day')),
   [('Can you build a website in Arabic?',
     'We build Arabic pages right to left, with the switch between languages and the tags Google needs, from your own Arabic text or a translator’s. '
     'We don’t write Arabic copy ourselves, and we will say so rather than guess.'),
    ('Why pay more than the AED 999 template shops?',
     'You may not need to. If a template does the job, those shops are good value. Our sites are designed for your business and coded by hand, which '
     'makes them faster and easier to rank, and you own the code. Our 5–10 page site is ' + fx(BIZ, 'AED') + ', fixed.')],
   ['ae-twm', 'ae-2m', 'ae-pdpl', 'wise-in', 'utc'],
   'We start at 8:30 am Dubai time and finish at 5:30 pm, so your questions get answered the same hour.',
   'AED prices, custom design instead of templates, and almost your whole working day shared.', 'the UAE',
   'Tell us about your business. We are online for almost all of your working day.'),

 country('ireland', 'Ireland', 'Ireland', 'Ireland', 'EUR', 'en-IE', '.ie', 'Dublin', 0, 'Dublin, GMT', False, 5.5,
   [('Freelancer', 'Most projects', 500, 5000, '€500–€5,000'), ('Small business site', 'Irish studios', 1500, 7000, '€1,500–€7,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From an Irish price guide, Dec 2025',
   'An Irish price guide from December 2025 puts a small business site at €1,500–€7,000, and most freelance projects at €500–€5,000.',
   'Website Design for Irish Businesses, from €250 | U Scale',
   f'Hand-coded websites for Irish small businesses, GDPR and accessibility-ready: landing page {fx(LANDING, "EUR")}, 5–10 pages {fx(BIZ, "EUR")}, fixed in euros.',
   'Website design for Irish businesses',
   f'Designed for you and hand-coded, at a fixed price in euros: {fx(BIZ, "EUR")} for a 5–10 page site, with GDPR cookies and the accessibility act covered.',
   "Hi Mehul, I run a business in Ireland. I'd like a free audit and a price in euros for my website.",
   [('cookie', 'GDPR cookies', 'Nothing beyond the strictly necessary loads until the visitor agrees.', 'ie-gdpr'),
    ('users', 'European Accessibility Act', 'In force since 28 June 2025 for online shops and bookings. We build to WCAG 2.1 AA.', 'eu-eaa'),
    ('file', 'A written contract', 'Scope, price and dates in writing, and an NDA if you want one.', ''),
    ('tag', 'Paid in euros', 'A SEPA transfer in euros to local account details. No VAT on our invoice.', 'wise-in')],
   sec('eaa', 'Accessibility act', 'Does the accessibility act cover you?', 'Two questions, from the CCPC’s guidance.', eaa_flow()),
   [('Does the European Accessibility Act apply to my website?',
     'It applies if you sell to consumers online, take bookings or payments, and are not a microenterprise. A microenterprise has fewer than 10 staff and a '
     'turnover or balance sheet of €2 million or less, and microenterprises providing services are exempt. We build every site to WCAG 2.1 AA, so you are '
     'covered either way.')],
   ['ie-vimar', 'ie-ccpc', 'ie-gdpr', 'eu-eaa', 'wise-in', 'utc'],
   'We overlap with your whole morning. Messages after 1:30 pm are the first thing we read the next day.',
   'Fixed € prices, GDPR cookies and the accessibility act covered.', 'Ireland',
   'Tell us about your business. We reply within a working day, usually the same morning, your time.',
   summer_note='In Irish summer time it is 5:30 am to 2:30 pm, so the overlap grows to 5.5 hours.'),

 country('new-zealand', 'New Zealand', 'New Zealand', 'New Zealand', 'NZD', 'en-NZ', '.co.nz', 'Auckland', 12, 'Auckland, NZST', True, 0.5,
   [('Small business site', '5–8 pages, before GST', 1500, 6000, 'NZ$1,500–NZ$6,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From a New Zealand price guide, Jan 2026',
   'A New Zealand price guide from January 2026 puts a 5–8 page small business site at NZ$1,500–NZ$6,000 before GST.',
   'Website Design for NZ Businesses, from NZ$500 | U Scale',
   f'Hand-coded websites for New Zealand small businesses, built in Mumbai: landing page {fx(LANDING, "NZD")}, 5–10 pages {fx(BIZ, "NZD")}, fixed in NZ dollars.',
   'Website design for New Zealand businesses',
   f'Designed for you and hand-coded, at a fixed price in NZ dollars: {fx(BIZ, "NZD")} for a 5–10 page site. Send feedback before you log off, and wake up to the changes.',
   "Hi Mehul, I run a business in New Zealand. I'd like a free audit and a price in NZD for my website.",
   [('cookie', 'Privacy Act 2020', 'A privacy statement that says what you collect and why, including the new IPP 3A from 1 May 2026.', 'nz-law'),
    ('users', 'Accessibility', 'Not required by law for private sites, but we build to WCAG 2.1 AA anyway.', ''),
    ('file', 'A written contract', 'Scope, price and dates in writing before you pay anything.', ''),
    ('tag', 'Paid in NZD', 'A bank transfer in NZ dollars to local account details. No GST on our invoice.', 'wise-in')],
   sec('relay', 'You sleep, we work', 'Feedback at night. Changes by morning.', '',
       chat_html([('out', '5:10 pm', 'Can the booking button be bigger on phones?'), ('in', '6:05 pm', 'Yes, doing it now.'),
                  ('in', '10:30 pm', 'Done. Preview link updated.'), ('out', '7:40 am', 'Brilliant. Approved.')], 'Your project chat', 'Times in Auckland', 'relay')),
   [('Do I pay GST on your invoice?',
     'No. No GST is added to our invoice: you pay the fixed price in NZ dollars by bank transfer. Domain and hosting can be bought in your name from New '
     'Zealand providers, who charge GST as usual.')],
   ['nz-kiwi', 'nz-law', 'wise-in', 'utc'],
   'Our day starts at 4:30 pm in Auckland, so we pick up whatever you send in your afternoon and you see the result in the morning.',
   'Fixed NZ$ prices; send feedback in the afternoon, see the changes by morning.', 'New Zealand',
   'Tell us about your business. Message us in your afternoon and the reply comes the same evening.',
   summer_note='From September to April, daylight saving makes it 5:30 pm to 2:30 am in Auckland.'),

 country('netherlands', 'Netherlands', 'the Netherlands', 'Netherlands', 'EUR', 'en-NL', '.nl', 'Amsterdam', 1, 'Amsterdam, CET', False, 6.5,
   [('Freelancer', 'Standard business site', 800, 3000, '€800–€3,000'), ('Agency', 'Professional SME site', 4000, 8000, '€4,000–€8,000')],
   8000, [0, 2000, 4000, 6000, 8000], 'From a Dutch price guide, Feb 2026',
   'A Dutch price guide from February 2026 puts a freelancer’s business site at €800–€3,000 and an agency’s SME site at €4,000–€8,000.',
   'Website Design for Dutch Businesses, from €250 | U Scale',
   f'Hand-coded websites for Dutch small businesses, worked on in English: landing page {fx(LANDING, "EUR")}, 5–10 pages {fx(BIZ, "EUR")}, GDPR cookies done.',
   'Website design for Dutch businesses',
   f'Designed for you and hand-coded, at a fixed price in euros: {fx(BIZ, "EUR")} for a 5–10 page site. We work in English, and your site can be in Dutch.',
   "Hi Mehul, I run a business in the Netherlands. I'd like a free audit and a price in euros for my website.",
   [('cookie', 'GDPR and Dutch cookie rules', 'Prior consent for everything except functional cookies.', 'nl-gdpr'),
    ('users', 'European Accessibility Act', 'In force since 28 June 2025 for online shops and bookings. We build to WCAG 2.1 AA.', 'eu-eaa'),
    ('globe', 'Dutch pages', 'From your Dutch text or your translator’s, with the tags Google needs. We work with you in English.', ''),
    ('tag', 'Paid in euros', 'A SEPA transfer in euros to local account details. No VAT on our invoice.', 'wise-in')],
   sec('english', 'In English', 'We talk in English. Your site can be in Dutch.', '',
       hundred(86, '86%', 'of people in the Netherlands speak English, the highest share in the EU after Ireland.', 'nl-en')),
   [('Can my website be in Dutch?',
     'Yes. We build the Dutch pages from your own text or a translator’s, with a language switch and the tags Google uses, and we talk to you in English '
     'throughout. We don’t write Dutch copy ourselves.')],
   ['nl-sl', 'nl-gdpr', 'nl-en', 'eu-eaa', 'wise-in', 'utc'],
   'We overlap with your morning and early afternoon, from 9 am to 2:30 pm, Monday to Friday.',
   'Fixed € prices, in English, with Dutch pages and GDPR cookies.', 'the Netherlands',
   'Tell us about your business. We reply within a working day, usually the same morning, your time.',
   summer_note='In Dutch summer time it is 6:30 am to 3:30 pm, so we share 6.5 hours.'),
]
