"""City pages: website design and development for businesses in other Indian cities, at /services/website-design-<city>.

Why these pages exist: people search "website design company in Pune", "web developer in Bengaluru" and ask AI assistants the
same questions. U Scale works with clients across India over WhatsApp and video calls, at the same fixed prices as in Mumbai,
so a page per city can answer those searches honestly.

Rules (a city page that breaks one of these is a doorway page, and Google demotes the whole site for those):
  * every page is about its city: its businesses, its language, what websites cost there and how to get found there,
    from dated, linked sources. Never the same text with the city name swapped;
  * never claim an office, address, phone number, staff or visits in the city. U Scale is based in Mumbai and works remotely;
  * every U Scale price comes from pricing_data.py; every market price or local fact links to where it came from;
  * no invented clients, results or reviews. Sample designs say they are samples;
  * one page per city covers both "website design" and "website development" (one strong page, not two competing ones).
Built on the focus-page system (geo_pages.py) and the service-page parts (svc_pages.py), so city pages look and move like the rest.
"""
import json, urllib.parse

import aeo
import geo_pages as GP
import seo_pages as SP
import svc_pages as SVP
import depth_art as DA
from geo_pages import (P, Cards, Table, Options, Links, Chips, Note, Stat, Range, Tools, Img, Sec, icon, price, rupees, _fmt, _short)

e, ea = SP.e, SP.ea

LANDING, BIZ, BLOG, STORE = (price('Landing page'), price('Business site, 3–4 pages'), price('Business site, 5–10 pages + blog'),
                             price('E-commerce, under 50 products'))
US_ROW = ('U Scale, fixed price', 'Landing page · 3–4 page business site', rupees('Landing page'), rupees('Business site, 3–4 pages'),
          f'{_short(rupees("Landing page"))} · {_short(rupees("Business site, 3–4 pages"))}')
OFFERS = ['Landing page', 'Business site, 3–4 pages', 'Business site, 5–10 pages + blog', 'E-commerce, under 50 products']


# ---------------------------------------------------------------- hero: what a website costs in this city
def cost_card(p):
    """A sample price sheet with depth: the city's market ranges (from its sources) against U Scale's fixed prices,
    a FIXED PRICE seal and a chip for how the work happens (remotely, from Mumbai)."""
    c = p['cost']
    hi = c['scale']
    pct = lambda v: f'{min(v, hi) / hi * 100:.2f}%'
    rows = ''
    for i, (label, sub, a, z, val) in enumerate(c['rows'] + [US_ROW]):
        us = i == len(c['rows'])
        rows += (f'<li class="{"is-us" if us else ""}" style="--i:{i}"><span class="dk-cost__l">{e(label)}<small>{e(sub)}</small></span><b>{e(val)}</b>'
                 f'<span class="dk-bar"><i style="--a:{pct(a)};--b:{pct(max(z, a + hi * .03))}"></i></span></li>')
    ticks = ''.join(f'<span>{e(_short(t) if t else "₹0")}</span>' for t in c['ticks'])
    card = (f'<div class="dk__card fp-ticket sv-ticket dk-cost"><p class="dk-quote__head"><span class="dk-quote__mark" aria-hidden="true">{icon("pin")}</span>'
            f'<span><b>What a website costs in {e(p["city"])}</b><small>Market ranges vs fixed prices · {e(c["when"])}</small></span></p>'
            f'<ul>{rows}</ul><p class="dk-cost__s" aria-hidden="true">{ticks}</p>'
            f'<p class="fp-ticket__f">{icon("file")}{e(c["foot"])}</p></div>')
    seal = ('<svg viewBox="0 0 120 120"><defs><path id="dkseal-c" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs>'
            '<circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="34" class="in"/>'
            '<text><textPath href="#dkseal-c" startOffset="0" textLength="262" lengthAdjust="spacingAndGlyphs">FIXED PRICE · IN WRITING · </textPath></text>'
            '<text x="60" y="68" text-anchor="middle" class="big">₹</text></svg>')
    floats = (DA._float('dk-seal', seal, 110, 0)
              + DA._float('dk-chip dk-route', f'{icon("chat")}Mumbai ⇄ {e(p["city"])} · WhatsApp &amp; video', 90, 1))
    return DA._dk('city', card, floats, sheets=2, label=f'What a website costs in {p["city"]}: market ranges compared with U Scale’s fixed prices')


def _hero(p, wa, icons):
    long = ' stat__num--long' if any(len(n) >= 8 for n, _ in p['stats']) else ''
    stats = ''.join(f'<li class="stat"><span class="stat__num{long}">{e(n)}</span><span class="stat__label">{e(l)}</span></li>' for n, l in p['stats'])
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li aria-current="page">{e(p['crumb'])}</li></ol></nav>
        <p class="eyebrow">{e(p['eyebrow'])}</p><h1 class="sp-hero__title fp-hero__title" id="page-title">{e(p['h1'])}<span class="dot">.</span></h1>
        <p class="sp-hero__lead">{GP.lead_html(p['lead'])}</p>
        <div class="fp-hero__ctas">
          <div class="hero__cta" data-wa-zone><a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Free audit on WhatsApp</a></div>
          <a class="btn btn--ghost fp-hero__more" href="#brief-title">See prices &amp; facts</a>
        </div>
        <ul class="stats fp-stats">{stats}</ul>
      </div>
      {cost_card(p)}
    </section>
  </div>'''


# ---------------------------------------------------------------- shared parts (the same process everywhere, so shared on purpose)
HOW = dict(head='Same price. Same process. Over WhatsApp.', sub='From a free audit to launch, without either of us travelling.',
           steps=[('search', 'Free audit', 'Send your website, Google listing or Instagram on WhatsApp. I check them and reply with what to fix first.', 'Free'),
                  ('file', 'Written plan', 'Pages, timeline and the exact price, in writing, agreed on a video call before you pay anything.', 'Fixed price'),
                  ('pen', 'Design & build', 'You review real screens in Figma on your own phone and laptop, then I code and test the site.', '20% to start · 20% on design sign-off'),
                  ('check', 'Launch', 'Domain, hosting, Google Search Console and a final check on real phones. Every login handed over to you.', '60% on launch')],
           promise=[('key', 'Your domain, code and logins, in your name'), ('file', 'Price fixed in writing before work starts'), ('shield', '15–30 day bug-fix window after launch')])


def _who(p):
    """svc_pages._who, with a line for clients outside Mumbai."""
    return SVP._who(dict(who=p['who']))


def _related(p):
    others = [q for q in CITIES if q is not p]
    li = ''.join(f'<li><a class="fp-rel" href="/{q["path"]}"><span class="fp-rel__k">Another city</span><b>{e(q["h1"])}</b>'
                 f'<span class="fp-rel__d">{e(q["card"])}</span>{icon("arrow")}</a></li>' for q in others)
    li += (f'<li><a class="fp-rel" href="/services/website-design-mumbai"><span class="fp-rel__k">Based in</span><b>Website design &amp; development in Mumbai</b>'
           f'<span class="fp-rel__d">Where U Scale is based, with every website price.</span>{icon("arrow")}</a></li>')
    for k in ('cost',):
        h, ic, t, d = SVP.GUIDE[k]
        li += f'<li><a class="fp-rel" href="{h}"><span class="fp-rel__k">Guide</span><b>{e(t)}</b><span class="fp-rel__d">{e(d)}</span>{icon("arrow")}</a></li>'
    li += (f'<li><a class="fp-rel" href="/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder"><span class="fp-rel__k">Guide</span>'
           f'<b>Freelancer, agency or website builder?</b><span class="fp-rel__d">Who each one suits, what each costs and what to watch for.</span>{icon("arrow")}</a></li>')
    return f'<nav class="fp-related" aria-label="More website pages"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>'


def _cta(p, wa, icons):
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Get a free audit<span class="dot">.</span></h2>
          <p class="lead">Tell me about your {e(p['city'])} business. I reply within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email me</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {SP.EMAIL}</p>
        </div>
      </div>
      {_related(p)}
      <p class="fp-all"><a class="tlink" href="/services/website-design-mumbai">All website design</a> · <a class="tlink" href="/pricing">Full price list</a></p>
    </div>
  </section>'''


def _jsonld(site, url, p):
    imgs = SVP._images(site, url, dict(art=dict(kind='city'), sections=p['sections'], who=True))
    city = {'@type': 'City', 'name': p['city'], 'sameAs': p['wiki'], 'containedInPlace': {'@type': 'State', 'name': p['state']}}
    main = {'@type': 'Service', '@id': url + '#service', 'name': p['service'], 'serviceType': 'Website design and development', 'url': url,
            'description': p['answer'], 'provider': {'@id': site + '#business'}, 'areaServed': city, 'availableChannel': {
                '@type': 'ServiceChannel', 'name': 'WhatsApp and video calls', 'serviceUrl': 'https://wa.me/' + aeo.ENTITY['whatsapp']},
            'offers': aeo.offers_ld(site, OFFERS),
            'isRelatedTo': {'@type': 'Service', '@id': site + 'services/website-design-mumbai#service', 'name': 'Website design and development',
                            'url': site + 'services/website-design-mumbai'}}
    if imgs: main['image'] = {'@id': imgs[0]['@id']}
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': p['title'], 'description': p['desc'], 'isPartOf': {'@id': site + '#website'},
            'about': {'@id': main['@id']}, 'mainEntity': {'@id': main['@id']}, 'author': {'@id': site + '#mehul'},
            'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__',
            'citation': [GP.SRC[k][2] for k in p['sources']]}
    if imgs: page.update(primaryImageOfPage={'@id': imgs[0]['@id']}, image=[{'@id': i['@id']} for i in imgs])
    graph = [page, main, aeo.biz_ref(site), aeo.person_ref(site),
             {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                 {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
                 {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': site + 'services'},
                 {'@type': 'ListItem', 'position': 3, 'name': p['crumb'], 'item': url}]},
             aeo._faq_ld(url, p['faq']), *imgs]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def page(ctx, parts, p):
    site = ctx['SITE_URL']; url = site + p['path']
    icons = ctx['ICONS']
    wa = SVP.WA + urllib.parse.quote(f"Hi Mehul, I run a business in {p['city']} and found your page. I'd like a free audit for my website.")
    toc = [((s['sid'] or f's{i}') + '-title', s['h']) for i, s in enumerate(p['sections'])] + [('how-title', 'How it works'), ('faq-title', 'Questions')]
    body = (_hero(p, wa, icons)
            + aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title', toc, 'On this page', fold=3)
            + GP._sections(p) + SVP._work(ctx, p) + _who(p) + SVP._how(dict(how=HOW))
            + aeo._faq_section(p['faq'], f'{p["city"]} questions.') + SVP._foot(p) + _cta(p, wa, icons))
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, url, p), body)


def build(ctx, parts):
    """Writes every city page; returns their paths relative to the output folder (for dates, sitemap and IndexNow)."""
    out = ctx['site']
    for p in CITIES:
        (out / f'{p["path"]}.html').write_text(page(ctx, parts, p))
    return [f'{p["path"]}.html' for p in CITIES]


def images_by_url(site):
    def keys(p):
        ks = [b['key'] for s in p['sections'] for b in s['blocks'] if b['t'] == 'img']
        return list(dict.fromkeys(ks)) + ['mehul']
    return {site + p['path']: [(site + GP.IMG[k]['file'][1:] + '.webp', GP.IMG[k]['caption']) for k in keys(p)] for p in CITIES}


def llms_lines(site):
    return ['', '## Website design in other Indian cities (remote, from Mumbai)', ''] + [f'- [{p["h1"]}]({site}{p["path"]}): {p["desc"]}' for p in CITIES]


def llms_full(site):
    L = []
    for p in CITIES:
        L += [f'## {p["h1"]}', '', f'URL: {site}{p["path"]}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for s in p['sections']:
            body = '\n\n'.join(x for x in (GP.text(b) for b in s['blocks']) if x)
            L += [f'### {s["h"]}', '', body, '']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in p['faq']]
        L += ['Sources: ' + '; '.join(f'{GP.SRC[k][1]} ({GP.SRC[k][0]}) {GP.SRC[k][2]}' for k in p['sources']), '']
    return L


def related_cards():
    """Cards for the website-design hub and the services hub."""
    return ''.join(f'<li><a class="fp-rel" href="/{p["path"]}"><span class="fp-rel__k">Other cities</span><b>{e(p["h1"])}</b>'
                   f'<span class="fp-rel__d">{e(p["card"])}</span>{icon("arrow")}</a></li>' for p in CITIES)


# ---------------------------------------------------------------- sources (read on 8 Nov 2026; price pages are the studios' own)
GP.SRC.update({
    # Pune
    'pune-gov': ('Pune district administration', 'About the district: languages and industry', 'https://pune.gov.in/en/about-district-2/'),
    'pune-udyam': ('Deasra, 31 Mar 2026', 'What does Udyam registration data reveal about Pune district?',
                   'https://blog.deasra.in/what-does-udyam-registration-data-reveal-about-pune-district/'),
    'mh-udyam': ('Deasra, 17 Sep 2026', 'What 6.6 million enterprise registrations say about Maharashtra’s districts',
                 'https://blog.deasra.in/what-6-6-million-enterprise-registrations-say-about-maharashtras-districts/'),
    'pune-p1': ('Web Designer Pune, seen 8 Nov 2026', 'Website design pricing, Pune', 'https://webdesignerpune.com/punewebdesign-pricing/'),
    'pune-p2': ('Webvantik, Pune, seen 8 Nov 2026', 'Website development cost in Pune: how much should you pay in 2026',
                'https://webvantik.com/blog/website-development-cost-in-pune-how-much-should-you-pay-in-2026/'),
    'pune-p3': ('Edgelink Technology, Pune, seen 8 Nov 2026', 'Website development cost in Pune',
                'https://blog.edgelinktechnology.com/website-designing/website-development-costpune/'),
    'pune-p4': ('Awrange, Pune, seen 8 Nov 2026', 'Website design cost in Pune', 'https://awrange.com/faq/website-designing/website-design-cost-in-pune/'),
    # Bengaluru
    'blr-lang': ('Wikipedia, from Census of India 2011 (table C-16)', 'Bangalore Urban district: languages', 'https://en.wikipedia.org/wiki/Bangalore_Urban_district'),
    'blr-startups': ('Inc42, from a Lok Sabha answer (data to 31 Oct 2024)', 'DPIIT-recognised startups in Bengaluru',
                     'https://inc42.com/buzz/dpiit-recognised-startups-have-created-over-1-63-lakh-jobs-in-bengaluru'),
    'ka-boards': ('Lexplosion, 2024', 'Kannada Language Comprehensive Development (Amendment) Act, 2024: name boards 60% in Kannada',
                  'https://lexplosion.in/the-kannada-language-comprehensive-development-amendment-act-2024-receives-governors-assent/'),
    'blr-p1': ('OneCity, Bengaluru, seen 8 Nov 2026', 'Web design company in Bangalore: packages', 'https://onecity.co.in/web-design-company-in-bangalore'),
    'blr-p2': ('Aero Business Solutions, Bengaluru, seen 8 Nov 2026', 'Website design packages', 'https://www.aerobusinesssolutions.com/packages/website-design/'),
    'blr-p3': ('RDS Web Techies, Bengaluru office, seen 8 Nov 2026', 'Website design company in Bengaluru', 'https://rdswebtech.com/website-design-company-bengaluru'),
    # Chennai
    'chn-lang': ('Indiastat, from Census of India 2011', 'Chennai district: principal language Tamil, 78.34%',
                 'https://www.indiastatdistrictdemographics.com/tamilnadu/chennai-district'),
    'chn-boards': ('DT Next, updated Sep 2026', 'Madras HC gives retailers final deadline to display shop names in Tamil',
                   'https://www.dtnext.in/news/tamilnadu/madras-hc-gives-retailers-final-deadline-to-display-shop-names-in-tamil'),
    'tn-msme': ('Government of Tamil Nadu, MSME Department', 'Policy Note 2025–26: Udyam registrations as of 31 March 2025',
                'https://tn.gov.in/rti/msme/msme_e_pn_2025_26.pdf'),
    'chn-p1': ('BYB Traction, Chennai, seen 8 Nov 2026', 'Website development cost in Chennai', 'https://bybtraction.com/website-development-cost-in-chennai/'),
    'chn-p2': ('Fluxo Studio, Chennai, seen 8 Nov 2026', 'How much does website development cost in Chennai (2026)',
               'https://fluxo.global/how-much-does-website-development-cost-in-chennai-2026-pricing-guide/'),
    'chn-p3': ('Impress Business Services, seen 8 Nov 2026', 'Website development cost in Chennai',
               'https://impressbss.com/read-more/Website-Development-Cost-in-Chennai-Affordable-Rates'),
})


def chips(*keys):
    return ' '.join(GP.src_chip(k) for k in keys)


COPY = price('Website copy')
FIT_NOTE = 'Not sure? The first audit is free either way, and I’ll tell you honestly if a local studio suits you better.'


# ---------------------------------------------------------------- the cities
CITIES = [
 dict(slug='pune', path='services/website-design-pune', city='Pune', state='Maharashtra', wiki='https://en.wikipedia.org/wiki/Pune',
  crumb='Website design in Pune', service='Website design and development for Pune businesses',
  card='Fixed-price websites for Pune shops, suppliers, institutes and cafés, built from Mumbai over WhatsApp and video calls.',
  title='Website Design & Development in Pune, from ₹25,000',
  desc=f'Websites for Pune businesses, designed and hand-coded by Mehul Karotra: landing page {LANDING}, business site {BIZ}, fixed in writing. Over WhatsApp.',
  h1='Website design & development in Pune', eyebrow='For Pune businesses',
  lead='I’m Mehul Karotra, a website designer and developer based in Mumbai. I design and hand-code websites for Pune businesses over WhatsApp and video '
       'calls, with the same fixed prices, process and ownership as my Mumbai clients.',
  stats=[(LANDING, 'Websites from'), ('3–4 wk', 'Business site, live in'), ('Free', 'Audit before you pay')],
  cost=dict(scale=150000, ticks=[0, 50000, 100000, 150000], when='Nov 2026', foot='From 4 Pune studios’ own price pages, seen 8 Nov 2026',
            rows=[('Template site', 'Ready-made WordPress or Wix theme', 5000, 18000, '₹5k–₹18k'),
                  ('Business site, 5–10 pages', 'Pune studios', 20000, 60000, '₹20k–₹60k'),
                  ('Custom-designed site', 'Pune studios', 60000, 150000, '₹60k–₹1.5L')]),
  answer='U Scale is Mehul Karotra, a Mumbai-based freelance website designer and developer who builds websites for Pune businesses remotely, over '
         f'WhatsApp and video calls. Every site is designed in Figma and hand-coded at a fixed price: a landing page {LANDING}, a 3–4 page business '
         f'site {BIZ} and an online store from {STORE}. For comparison, Pune studios’ own price pages put a template site at ₹5,000–₹18,000 and a '
         'custom-designed site at ₹60,000–₹1.5 lakh. Every project starts with a free audit.',
  facts=[('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Based in', 'Mumbai (Ghatkopar West). No Pune office: the work happens over WhatsApp and video calls'),
         ('Website prices', GP.WEB_PRICES + '. The same prices as in Mumbai'),
         ('Pune market, for comparison', 'Template site ₹5,000–₹18,000 · business site (5–10 pages) ₹20,000–₹60,000 · custom-designed ₹60,000–₹1.5 lakh · '
                                         'online store ₹25,000 to over ₹2.5 lakh (Pune studios’ own pages, seen 8 Nov 2026)'),
         ('Timeline', 'Landing page in under 2 weeks; business site in 3–4 weeks'),
         ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
         ('Languages', 'English and Hindi; Marathi pages built from your own Marathi text'),
         ('Ownership', 'Your domain, code and logins, in your name')],
  sections=[
   Sec('What a website costs in Pune in 2026',
       P('Four Pune web studios publish their prices, and on 8 November 2026 they put a template website (a ready-made WordPress or Wix theme) at '
         '₹5,000–₹18,000, a 5–10 page business website at ₹20,000–₹60,000, a custom-designed site at ₹60,000–₹1.5 lakh and an online store at '
         '₹25,000 to over ₹2.5 lakh. ' + chips('pune-p1', 'pune-p2', 'pune-p3', 'pune-p4')),
       Range([('Template site', 5000, 18000), ('Business site, 5–10 pages', 20000, 60000), ('Custom-designed site', 60000, 150000), ('Online store', 25000, 250000)],
             [(rupees('Landing page'), 'Landing page'), (rupees('Business site, 3–4 pages'), 'Business site'), (rupees('E-commerce, under 50 products'), 'Online store')],
             [0, 50000, 100000, 150000, 200000, 250000], 'U Scale, fixed'),
       Note('My prices sit between the template and custom bands, but every page is designed for your business in Figma and hand-coded, not a theme '
            'with your logo on it. The cheapest packages often bundle the first year of domain and hosting and charge for it every year after: '
            'ask what renewal costs before you pay.'),
       eyebrow='Pune prices', layout='wide', sid='prices'),
   Sec('What Pune’s businesses need from a website',
       Stat('15%', 'of Maharashtra’s 6.6 million Udyam registrations are in Pune district (July 2020 to August 2026)', 'mh-udyam'),
       P('An analysis of about 9.1 lakh Pune district entries in the Udyam data (March 2026) found manufacturing and trade at about 40% of registrations, '
         'food and accommodation at about 9%, and a surprising number of travel agencies, many of them cab operators working around Pune and '
         'Pimpri-Chinchwad. Not every registration is a trading business, but the mix tells you what Pune’s websites have to do. ' + chips('pune-udyam')),
       Cards([('box', 'Manufacturers and suppliers', 'A product catalogue in English with specifications and PDFs, an enquiry form that asks for quantities and '
                'drawings, and a link to your IndiaMART listing. Buyers check your website before they call.'),
              ('store', 'Shops and traders', 'Timings, a map, photos of what’s in stock and an “Order on WhatsApp” button. Your Google listing does most of '
                'the work; the website backs it up.'),
              ('menu', 'Restaurants, cafés and stays', 'Menu, photos and your own ordering or booking link, so regulars stop paying app commission. '
                '<a class="tlink" href="/services/website-design-mumbai/restaurants-cafes">How that works</a>.'),
              ('truck', 'Cabs and travel agencies', 'Routes and fares in plain words, one-tap call and WhatsApp, and your reviews up front. These are booked on a '
                'phone, in a hurry.'),
              ('team', 'Classes and institutes', 'Courses, batches, fees and results, with an enquiry button on every page. Pune is known as the “Oxford of '
                'the East”, and students compare institutes on their phones.')], cols=3,
             cta=('/pricing', 'rupee', 'Every price, published', 'Websites, SEO and monthly services, with a quote builder you can send on WhatsApp.', 'See prices')),
       Img('city-pune'),
       eyebrow='Pune’s businesses'),
   Sec('Getting found in Pune: Google, directories and AI',
       Cards([('pin', 'One Google listing, two cities', 'Pune district has two big urban centres, Pune and Pimpri-Chinchwad. If you visit customers, list both '
                'as service areas; if they visit you, keep the pin exact and name your area on the website.'),
              ('chat', 'Marathi, Hindi and English', 'The district administration names all three as Pune’s major languages. Write your services the way '
                'customers search, and add Marathi pages if your customers read Marathi. ' + chips('pune-gov')),
              ('file', 'The same details everywhere', 'Justdial, Sulekha and IndiaMART listings with exactly the same name, phone number and area as your '
                'website and Google listing.'),
              ('bolt', 'Ready for AI answers', 'Prices, services and timings written as plain text, so ChatGPT, Gemini and Google’s AI can quote them '
                'when someone asks for a recommendation in Pune.')], cols=2),
       eyebrow='Local search', tone='band'),
   Sec('Is a Mumbai designer right for your Pune business?',
       Options([dict(name='A good fit', tag='Most small businesses', hi=True, rows=[
                    ('You want', 'One person who designs and builds the site, at a price fixed in writing'),
                    ('You’re happy with', 'WhatsApp, video calls and reviewing designs on your phone'),
                    ('You care about', 'Owning your domain, code and logins'),
                    ('Typical projects', 'Business sites, landing pages, catalogues and small online stores')]),
                dict(name='Choose a Pune studio', tag='Be honest about it', rows=[
                    ('You want', 'Someone to visit your shop or factory regularly'),
                    ('You need', 'A large team for an app, portal or ERP'),
                    ('You’d like', 'Photos and videos shot at your premises by the same people'),
                    ('Then', 'A local studio is the better choice')])],
               note=FIT_NOTE),
       Img('remote-review'),
       eyebrow='Honest fit', layout='wide'),
   Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
  ],
  work=['spacestudio', 'sashe', 'vidhi'], work_h='Websites I designed and built, live today.',
  work_lead='Space Studio is an architecture practice in Chennai; Sashe by Prachi and Vidhi Parmar are Mumbai clients.',
  who='I design and code every site myself, from Mumbai. Pune clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Pune?',
        'Pune studios’ own price pages (seen November 2026) put a template website at ₹5,000–₹18,000, a 5–10 page business website at ₹20,000–₹60,000, '
        f'a custom-designed site at ₹60,000–₹1.5 lakh and an online store at ₹25,000 to over ₹2.5 lakh. With U Scale, a landing page is {LANDING}, a '
        f'3–4 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Can a web designer in Mumbai build a website for my Pune business?',
        'Yes. With U Scale it starts with a free audit on WhatsApp, then a written plan agreed on a video call. You review the designs in Figma on your '
        'own phone, and at launch every login is handed to you. There is no Pune office, so if you want someone to visit your premises regularly, a '
        'local studio is the better choice.'),
       ('Will my website rank in Pune if my designer is in Mumbai?',
        'Yes. Google ranks local results on relevance, distance and prominence, and distance is measured from your business to the person searching, '
        'not from your designer. What matters is that your website and Google Business Profile name your area, services and timings, and match each other.'),
       ('Can my website be in Marathi and English?',
        'Yes. Marathi, Hindi and English are Pune’s major languages, according to the district administration. I build bilingual pages from your own '
        f'Marathi text, or a translator’s, with a language switch Google understands. Writing the copy is {COPY}.'),
       ('How do I get my Pune business on Google Maps?',
        GP.MAPS_FAQ + ' If you visit customers rather than them visiting you, list Pune and Pimpri-Chinchwad as service areas.'),
       ('How long does a website take?',
        'A landing page usually goes live in under two weeks and a 3–4 page business site in 3–4 weeks, depending on how ready your text and photos '
        'are. Reviews happen on WhatsApp, so nobody waits for a meeting.')],
  sources=['pune-p1', 'pune-p2', 'pune-p3', 'pune-p4', 'mh-udyam', 'pune-udyam', 'pune-gov', 'local-rank']),

 dict(slug='bengaluru', path='services/website-design-bengaluru', city='Bengaluru', state='Karnataka', wiki='https://en.wikipedia.org/wiki/Bengaluru',
  crumb='Website design in Bengaluru', service='Website design and development for Bengaluru businesses',
  card='Fixed-price websites for Bengaluru startups, cafés and shops, built from Mumbai over WhatsApp and video calls.',
  title='Website Design in Bengaluru (Bangalore), from ₹25,000',
  desc=f'Websites for Bengaluru startups, cafés and shops, hand-coded by Mehul Karotra: landing page {LANDING}, business site {BIZ}, fixed in writing.',
  h1='Website design & development in Bengaluru', eyebrow='For Bengaluru businesses',
  lead='I’m Mehul Karotra, a website designer and developer in Mumbai. Bengaluru founders and shop owners hire me for hand-coded websites at a fixed '
       'price, and we work over WhatsApp and video calls.',
  stats=[(LANDING, 'Websites from'), ('3–4 wk', 'Business site, live in'), ('Free', 'Audit before you pay')],
  cost=dict(scale=100000, ticks=[0, 25000, 50000, 75000, 100000], when='Nov 2026', foot='From 3 Bengaluru studios’ own price pages, seen 8 Nov 2026',
            rows=[('Basic site', 'Ready-made design, about 5 pages', 8750, 22750, '₹9k–₹23k'),
                  ('Premium design', 'Up to 10 pages', 19999, 75900, '₹20k–₹76k'),
                  ('Online store', 'Starting prices', 25000, 35000, 'from ₹25k–₹35k')]),
  answer='U Scale is Mehul Karotra, a Mumbai-based freelance website designer and developer who builds websites for Bengaluru startups and small '
         f'businesses remotely, over WhatsApp and video calls. Every site is designed in Figma and hand-coded at a fixed price: a landing page {LANDING}, '
         f'a 3–4 page business site {BIZ} and an online store from {STORE}. For comparison, Bengaluru studios’ own price pages start basic sites at '
         'about ₹8,750–₹22,750 and premium designs at ₹23,350–₹75,900. Every project starts with a free audit.',
  facts=[('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Based in', 'Mumbai (Ghatkopar West). No Bengaluru office: the work happens over WhatsApp and video calls'),
         ('Website prices', GP.WEB_PRICES + '. The same prices as in Mumbai'),
         ('Bengaluru market, for comparison', 'Basic site (about 5 pages) ₹8,750–₹22,750 · premium design ₹23,350–₹75,900 · custom design from ₹15,000 at one '
                                             'studio to ₹64,850+ at another · online store from ₹25,000–₹35,000 (studios’ own pages, seen 8 Nov 2026)'),
         ('Timeline', 'Landing page in under 2 weeks; business site in 3–4 weeks'),
         ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
         ('Languages', 'English and Hindi; Kannada pages built from your own Kannada text'),
         ('Ownership', 'Your domain, code and logins, in your name')],
  sections=[
   Sec('What a website costs in Bengaluru in 2026',
       P('Three Bengaluru studios publish package prices. On 8 November 2026 a basic site of about five pages started at ₹8,750–₹22,750, a premium '
         'design at ₹23,350–₹75,900, and online stores from ₹25,000–₹35,000. Custom design is where they differ most: from ₹15,000 at one studio to '
         '₹64,850 and up at another. Most quotes exclude GST, and some include the first year of domain and hosting. ' + chips('blr-p1', 'blr-p2', 'blr-p3')),
       Range([('Basic site, about 5 pages', 8750, 22750), ('Premium design, up to 10 pages', 19999, 75900), ('Online store, starting prices', 25000, 35000)],
             [(rupees('Landing page'), 'Landing page'), (rupees('Business site, 3–4 pages'), 'Business site'), (rupees('E-commerce, under 50 products'), 'Online store')],
             [0, 25000, 50000, 75000, 100000], 'U Scale, fixed'),
       Note('Package prices are starting points: ask what is in the price (pages, design rounds, copy, hosting) and what renewal costs. My price covers '
            'design and build of every page, fixed in writing, and the domain is registered in your name.'),
       eyebrow='Bengaluru prices', layout='wide', sid='prices'),
   Sec('What Bengaluru’s businesses need from a website',
       Stat('13,649', 'startups in Bengaluru district recognised by DPIIT (as of 31 October 2024, from a Lok Sabha answer)', 'blr-startups'),
       P('Bengaluru has more recognised startups than most countries have, and they set what customers expect: a fast site, clear prices and paying '
         'online without a phone call. A café, clinic or salon competes for attention with the same polish. ' + chips('blr-startups')),
       Cards([('bolt', 'Startups and D2C brands', 'A landing page that explains the product in one screen, a waitlist or checkout, and pages investors and '
                'customers can share. Speed matters more than effects.'),
              ('menu', 'Cafés and restaurants', 'Menu, photos and your own ordering link, so regulars order from you instead of paying app commission. '
                '<a class="tlink" href="/services/website-design-mumbai/restaurants-cafes">How that works</a>.'),
              ('card', 'Clinics, salons and studios', 'Services with prices, timings, your team and a booking or WhatsApp button. Reviews and a clear '
                'location do most of the selling.'),
              ('box', 'Manufacturers and wholesalers', 'A catalogue with specifications, an enquiry form that asks the right questions and a link to your '
                'IndiaMART listing, for the buyers who check you out before they call.')], cols=2),
       Img('city-bengaluru'),
       eyebrow='Bengaluru’s businesses'),
   Sec('Kannada, English or both?',
       P('Bengaluru is the most mixed of the three cities on this site. In the 2011 Census, 44.47% of Bangalore Urban district spoke Kannada as their '
         'first language, with Tamil, Telugu and Urdu next. So English usually carries the website, and Kannada shows you belong. ' + chips('blr-lang')),
       Cards([('tag', 'Your name, the same everywhere', 'Since 2024 Karnataka law requires business name boards to be 60% in Kannada. Use the same Kannada and '
                'English name on your board, your Google listing and your website, so customers and Google match them. ' + chips('ka-boards')),
              ('chat', 'English first, Kannada where it counts', 'Services, prices and FAQs in English; your name, address and key lines in Kannada. A full '
                f'Kannada version is possible from your own text; writing the copy is {COPY}.')], cols=2),
       eyebrow='Language', tone='band'),
   Sec('Is a Mumbai designer right for your Bengaluru business?',
       Options([dict(name='A good fit', tag='Founders and owners', hi=True, rows=[
                    ('You want', 'One person who designs and builds the site, at a price fixed in writing'),
                    ('You’re happy with', 'WhatsApp, video calls and reviewing designs on your phone'),
                    ('You care about', 'Owning your domain, code and logins'),
                    ('Typical projects', 'Landing pages, business sites and small online stores')]),
                dict(name='Choose a Bengaluru team', tag='Be honest about it', rows=[
                    ('You want', 'Engineers in the room, or someone at your office every week'),
                    ('You need', 'A product team for an app, dashboard or platform'),
                    ('You’d like', 'Shoots at your premises by the same people'),
                    ('Then', 'A local agency is the better choice')])],
               note=FIT_NOTE),
       Img('remote-review'),
       eyebrow='Honest fit', layout='wide'),
   Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
  ],
  work=['spacestudio', 'sashe', 'vidhi'], work_h='Websites I designed and built, live today.',
  work_lead='Space Studio is an architecture practice in Chennai; Sashe by Prachi and Vidhi Parmar are Mumbai clients.',
  who='I design and code every site myself, from Mumbai. Bengaluru clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Bengaluru?',
        'Bengaluru studios’ own package pages (seen November 2026) start a basic five-page site at about ₹8,750–₹22,750, premium designs at '
        '₹23,350–₹75,900 and online stores from ₹25,000–₹35,000, usually plus GST. With U Scale, a landing page is '
        f'{LANDING}, a 3–4 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Can a web designer in Mumbai build a website for my Bengaluru startup?',
        'Yes. With U Scale you get a free audit on WhatsApp, a written plan agreed on a video call, designs to review in Figma and a hand-coded site with '
        'every login in your name. For an app or a product with a large engineering team, a Bengaluru agency is the better fit.'),
       ('Should my Bengaluru website be in Kannada?',
        'For most businesses, English should carry the site, with your name, address and key lines in Kannada too: in the 2011 Census, 44.47% of Bangalore '
        'Urban district spoke Kannada as their first language, and Tamil, Telugu and Urdu were next. Since 2024, name boards must be 60% in Kannada, so '
        'keep the same Kannada name on your board, Google listing and website.'),
       ('How do I get my Bengaluru business on Google Maps?', GP.MAPS_FAQ),
       ('Can customers pay online on my website?',
        'Yes. Online stores and booking pages take UPI, cards and netbanking through a payment gateway, which charges a small fee per payment. The '
        'gateway fee is separate from my price and quoted before work starts.')],
  sources=['blr-p1', 'blr-p2', 'blr-p3', 'blr-startups', 'blr-lang', 'ka-boards', 'local-rank']),

 dict(slug='chennai', path='services/website-design-chennai', city='Chennai', state='Tamil Nadu', wiki='https://en.wikipedia.org/wiki/Chennai',
  crumb='Website design in Chennai', service='Website design and development for Chennai businesses',
  card='Fixed-price websites for Chennai businesses, from the designer of Space Studio Chennai’s site.',
  title='Website Design & Development in Chennai, from ₹25,000',
  desc=f'Websites for Chennai businesses by Mehul Karotra, who built Space Studio Chennai’s site. Landing page {LANDING}, business site {BIZ}, fixed in writing.',
  h1='Website design & development in Chennai', eyebrow='For Chennai businesses',
  lead='I’m Mehul Karotra, a website designer and developer in Mumbai. I rebuilt the website of Space Studio, a Chennai architecture practice, and I '
       'build hand-coded websites for Chennai businesses at fixed prices, over WhatsApp and video calls.',
  stats=[(LANDING, 'Websites from'), ('86', 'Pages built for Space Studio, Chennai'), ('Free', 'Audit before you pay')],
  cost=dict(scale=150000, ticks=[0, 50000, 100000, 150000], when='Nov 2026', foot='From 3 Chennai studios’ own price pages, seen 8 Nov 2026',
            rows=[('Template or static site', 'About 5–6 pages', 5000, 30000, '₹5k–₹30k'),
                  ('Custom business site', 'Up to 10 pages', 20000, 100000, '₹20k–₹1L'),
                  ('Online store', 'Most quotes', 40000, 120000, '₹40k–₹1.2L')]),
  answer='U Scale is Mehul Karotra, a Mumbai-based freelance website designer and developer who works with Chennai businesses remotely, over WhatsApp '
         'and video calls. He rebuilt the website of Space Studio, a Chennai office-architecture practice: 86 hand-coded pages. Every U Scale site is '
         f'designed in Figma and hand-coded at a fixed price: a landing page {LANDING}, a 3–4 page business site {BIZ} and an online store from {STORE}. '
         'For comparison, Chennai studios’ own price pages put a template or static site at ₹5,000–₹30,000 and a custom business site at ₹20,000–₹1 lakh.',
  facts=[('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Chennai work', 'Space Studio, an office-architecture practice: a rebuilt website with 86 hand-coded pages, live at spacestudiochennai.com'),
         ('Based in', 'Mumbai (Ghatkopar West). No Chennai office: the work happens over WhatsApp and video calls'),
         ('Website prices', GP.WEB_PRICES + '. The same prices as in Mumbai'),
         ('Chennai market, for comparison', 'Template or static site ₹5,000–₹30,000 · custom business site ₹20,000–₹1 lakh · online store mostly ₹40,000–₹1.2 lakh, '
                                           'from ₹18,000 to over ₹2.5 lakh (Chennai studios’ own pages, seen 8 Nov 2026)'),
         ('Timeline', 'Landing page in under 2 weeks; business site in 3–4 weeks'),
         ('Languages', 'English and Hindi; Tamil pages built from your own Tamil text'),
         ('Ownership', 'Your domain, code and logins, in your name')],
  sections=[
   Sec('What a website costs in Chennai in 2026',
       P('Three Chennai studios publish their price bands. On 8 November 2026 they put a template or static site of about 5–6 pages at ₹5,000–₹30,000, a '
         'custom-designed business site at ₹20,000–₹1 lakh, and most online stores at ₹40,000–₹1.2 lakh, with quotes from ₹18,000 to over ₹2.5 lakh. '
         + chips('chn-p1', 'chn-p2', 'chn-p3')),
       Range([('Template or static site', 5000, 30000), ('Custom business site', 20000, 100000), ('Online store, most quotes', 40000, 120000)],
             [(rupees('Landing page'), 'Landing page'), (rupees('Business site, 3–4 pages'), 'Business site'), (rupees('E-commerce, under 50 products'), 'Online store')],
             [0, 50000, 100000, 150000], 'U Scale, fixed'),
       Note('One Chennai studio’s own guide labels the cheapest template tier “Avoid”. Whoever you hire, ask how many pages are designed for you, who '
            'writes the text, and what the domain and hosting cost after the first year.'),
       eyebrow='Chennai prices', layout='wide', sid='prices'),
   Sec('Tamil first, then English',
       Stat('78.34%', 'of Chennai district has Tamil as its first language (Census 2011)', 'chn-lang'),
       P('Chennai is the most single-language of these cities: in the 2011 Census, 78.34% of the district spoke Tamil as their first language. And the '
         'city now enforces it on the street: the Greater Chennai Corporation requires shop names in Tamil on top, then English, with a ₹2,000 penalty, '
         'and the Madras High Court gave retailers until 1 November 2026 to comply. ' + chips('chn-lang', 'chn-boards')),
       Cards([('tag', 'One name, everywhere', 'Use the same Tamil and English name on your board, your Google listing and your website, so customers and '
                'Google match them.'),
              ('chat', 'Tamil where it sells', 'Shops, clinics and services that serve neighbourhoods do better with Tamil pages; B2B suppliers and '
                f'exporters usually lead in English. I build Tamil pages from your own text; writing the copy is {COPY}.'),
              ('globe', 'English for visitors', 'If patients, students or buyers come from other states, give them a full English version too, with '
                'directions and prices they can read.')], cols=3),
       eyebrow='Language', tone='band'),
   Sec('What Chennai’s businesses need from a website',
       P('Tamil Nadu had 33.6 lakh MSMEs registered on the Udyam portal by 31 March 2025, and Chennai is one of the districts with the most. '
         + chips('tn-msme')),
       Cards([('truck', 'Auto and engineering suppliers', 'A catalogue with specifications, certifications and an enquiry form that asks for drawings and '
                'quantities. Buyers from outside the city judge you by it.'),
              ('tag', 'Textile, apparel and retail', 'Collections with prices, an “Order on WhatsApp” button and store timings. '
                '<a class="tlink" href="/services/website-design-mumbai/boutiques-fashion">How boutique sites work</a>.'),
              ('card', 'Clinics and healthcare', 'Doctors, timings, fees and directions, in Tamil and English, with booking on WhatsApp.'),
              ('layers', 'Architects, consultants and B2B services', 'Projects as proof, services explained plainly and a way to start a conversation. This '
                'is the kind of site I built for Space Studio.')], cols=2),
       Img('city-chennai'),
       eyebrow='Chennai’s businesses'),
   Sec('Is a Mumbai designer right for your Chennai business?',
       Options([dict(name='A good fit', tag='Most small businesses', hi=True, rows=[
                    ('You want', 'One person who designs and builds the site, at a price fixed in writing'),
                    ('You’re happy with', 'WhatsApp, video calls and reviewing designs on your phone'),
                    ('You care about', 'Owning your domain, code and logins'),
                    ('Typical projects', 'Business sites, portfolios, catalogues and small online stores')]),
                dict(name='Choose a Chennai studio', tag='Be honest about it', rows=[
                    ('You want', 'Someone at your premises every week'),
                    ('You need', 'A Tamil copywriter and designer in one team'),
                    ('You’d like', 'Photos and videos shot locally by the same people'),
                    ('Then', 'A local studio is the better choice')])],
               note=FIT_NOTE),
       Img('remote-review'),
       eyebrow='Honest fit', layout='wide'),
   Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
  ],
  work=['sashe', 'vidhi'], work_feature='spacestudio', work_h='A Chennai website I designed and built.',
  work_lead='Space Studio designs offices in Chennai. Their new site has 86 hand-coded pages and kept every old link working.',
  who='I design and code every site myself, from Mumbai. Chennai clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Chennai?',
        'Chennai studios’ own price pages (seen November 2026) put a template or static site at ₹5,000–₹30,000, a custom business site at '
        '₹20,000–₹1 lakh and most online stores at ₹40,000–₹1.2 lakh. With U Scale, a landing page is '
        f'{LANDING}, a 3–4 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Have you built websites for Chennai businesses?',
        'Yes. U Scale rebuilt the website of Space Studio, an office-architecture practice in Chennai: 86 hand-coded pages, live at spacestudiochennai.com.'),
       ('Should my Chennai website be in Tamil?',
        'If your customers are local, yes: in the 2011 Census, 78.34% of Chennai district spoke Tamil as their first language. Keep the same Tamil and '
        'English name on your shop board, Google listing and website. Suppliers and exporters selling outside the state usually lead in English.'),
       ('Do I have to show my shop name in Tamil?',
        'On your shop board in Chennai, yes: the Greater Chennai Corporation requires shop names in Tamil on top, followed by English, with a ₹2,000 '
        'penalty for not complying, and the Madras High Court set 1 November 2026 as the final deadline. Using the same name on Google and your '
        'website keeps everything consistent.'),
       ('How do I get my Chennai business on Google Maps?', GP.MAPS_FAQ)],
  sources=['chn-p1', 'chn-p2', 'chn-p3', 'chn-lang', 'chn-boards', 'tn-msme', 'local-rank']),
]
