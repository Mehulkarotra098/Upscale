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
from geo_pages import (P, Cards, Table, Options, Links, Chips, Note, Stat, Range, Tools, Img, Html, Sec, icon, price, rupees, _fmt, _short)

e, ea = SP.e, SP.ea

LANDING, BIZ, BLOG, STORE = (price('Landing page'), price('Business site, 5–10 pages'), price('Business site, 10–20 pages + blog'),
                             price('E-commerce, under 50 products'))
US_ROW = ('U Scale, fixed price', 'Landing page · 5–10 page business site', rupees('Landing page'), rupees('Business site, 5–10 pages'),
          f'{_short(rupees("Landing page"))} · {_short(rupees("Business site, 5–10 pages"))}')
OFFERS = ['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products']


# ---------------------------------------------------------------- hero: what a website costs in this city
SEAL = ('<svg viewBox="0 0 120 120"><defs><path id="dkseal-c" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs>'
        '<circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="34" class="in"/>'
        '<text><textPath href="#dkseal-c" startOffset="0" textLength="262" lengthAdjust="spacingAndGlyphs">FIXED PRICE · IN WRITING · </textPath></text>'
        '<text x="60" y="68" text-anchor="middle" class="big">₹</text></svg>')


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
    floats = (DA._float('dk-seal', SEAL, 110, 0)
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
          <div class="hero__cta" data-wa-zone><a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}{e(p.get('hero_btn', 'Free audit on WhatsApp'))}</a></div>
          <a class="btn btn--ghost fp-hero__more" href="{ea(p.get('hero_more', ('#brief-title', ''))[0])}">{e(p.get('hero_more', ('', 'See prices & facts'))[1])}</a>
        </div>
        <ul class="stats fp-stats">{stats}</ul>
      </div>
      {ART[p.get('art', 'cost')](p)}
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
    # the next cities in the list, wrapping round, so every city page is linked from three others (not all from the first three)
    i = next(k for k, q in enumerate(CITIES) if q is p)
    others = [CITIES[(i + k) % len(CITIES)] for k in range(1, len(CITIES))]
    n = p.get('related')  # how many cards; None = all
    li = ''.join(f'<li><a class="fp-rel" href="/{q["path"]}"><span class="fp-rel__k">Another city</span><b>{e(q["h1"])}</b>'
                 f'{icon("arrow")}</a></li>' for q in others)
    li += (f'<li><a class="fp-rel" href="/services/website-design-mumbai"><span class="fp-rel__k">Based in</span><b>Website design &amp; development in Mumbai</b>'
           f'<span class="fp-rel__d">Where U Scale is based, with every website price.</span>{icon("arrow")}</a></li>')
    for k in ('cost',):
        h, ic, t, d = SVP.GUIDE[k]
        li += f'<li><a class="fp-rel" href="{h}"><span class="fp-rel__k">Guide</span><b>{e(t)}</b><span class="fp-rel__d">{e(d)}</span>{icon("arrow")}</a></li>'
    li += (f'<li><a class="fp-rel" href="/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder"><span class="fp-rel__k">Guide</span>'
           f'<b>Freelancer, agency or website builder?</b><span class="fp-rel__d">Who each one suits, what each costs and what to watch for.</span>{icon("arrow")}</a></li>')
    if n:
        li = ''.join(x + '</li>' for x in li.split('</li>')[:n])
    return f'<nav class="fp-related" aria-label="More website pages"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>'


def _cta(p, wa, icons):
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">{e(p.get('cta_h', 'Get a free audit'))}<span class="dot">.</span></h2>
          <p class="lead">{e(p.get('cta_lead') or f"Tell me about your {p['city']} business. I reply within 24 hours, usually much faster on WhatsApp.")}</p>
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


def og_image(site, p):
    """The page's own share image (rendered by work/og/make_og.cjs in the City SEO folder): its URL and alt text."""
    slug = p['path'].rsplit('website-design-', 1)[1]
    return (f'{site}assets/pages/og-website-design-{slug}.jpg',
            f'Website design and development in {p["city"]} by U Scale: websites from ₹25,000, fixed price, over WhatsApp')


def _jsonld(site, url, p):
    extra = [Sec('', *[Img(k) for k in p.get('imgs', [])])]  # images inside widgets (the business picker)
    imgs = SVP._images(site, url, dict(art=dict(kind='city'), sections=p['sections'] + extra, who=True))
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
    og_url, og_alt = og_image(site, p)
    imgs = imgs + [{'@type': 'ImageObject', '@id': url + '#og-image', 'url': og_url, 'contentUrl': og_url, 'width': 1200, 'height': 630,
                    'caption': og_alt, 'encodingFormat': 'image/jpeg', 'inLanguage': 'en-IN', 'creditText': 'U Scale',
                    'creator': {'@id': site + '#business'}, 'copyrightHolder': {'@id': site + '#business'},
                    'copyrightNotice': '© 2026 U Scale by Mehul Karotra', 'license': site + 'image-license', 'acquireLicensePage': site + 'image-license'}]
    if imgs: page.update(primaryImageOfPage={'@id': imgs[0]['@id']}, image=[{'@id': i['@id']} for i in imgs])
    graph = [page, main, aeo.biz_ref(site), aeo.person_ref(site),
             {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                 {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
                 {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': site + 'services'},
                 {'@type': 'ListItem', 'position': 3, 'name': p['crumb'], 'item': url}]},
             aeo._faq_ld(url, p['faq']), *imgs]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def page(ctx, parts, p):
    if p.get('v2'):
        return page_v2(ctx, parts, p)
    site = ctx['SITE_URL']; url = site + p['path']
    icons = ctx['ICONS']
    wa = SVP.WA + urllib.parse.quote(p.get('wa') or f"Hi Mehul, I run a business in {p['city']} and found your page. I'd like a free audit for my website.")
    toc = [((s['sid'] or f's{i}') + '-title', s['h']) for i, s in enumerate(p['sections'])] + [('how-title', 'How it works'), ('faq-title', 'Questions')]
    body = (_hero(p, wa, icons)
            + aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title', toc, 'On this page', fold=3)
            + GP._sections(p) + SVP._work(ctx, p) + _who(p) + SVP._how(dict(how=HOW))
            + aeo._faq_section(p['faq'], f'{p["city"]} questions.') + SVP._foot(p) + _cta(p, wa, icons))
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, url, p), body, og=og_image(site, p))


def build(ctx, parts):
    """Writes every city page; returns their paths relative to the output folder (for dates, sitemap and IndexNow)."""
    out = ctx['site']
    for p in CITIES:
        (out / f'{p["path"]}.html').write_text(page(ctx, parts, p))
    return [f'{p["path"]}.html' for p in CITIES]


def images_by_url(site):
    def keys(p):
        ks = [b['key'] for s in p['sections'] for b in s['blocks'] if b['t'] == 'img']
        return list(dict.fromkeys(ks + p.get('imgs', []))) + ['mehul']
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
REST, LSEO = price('Restaurant site + own online ordering'), price('Local SEO / Google Business Profile')


# ---------------------------------------------------------------- widgets that tailor a page to how its city buys
# Each city page leads with what its owners care about most, not one template with the facts swapped:
#   Pune: owners compare quotes hard (studios there advertise ₹5k–₹10k packages) and like plain talk, so the page opens on a
#   Puneri patya of honest terms, then a quote checker, then a picker for the city's real business mix.
def patya_card(p):
    """Pune's famous blunt signboards (puneri patya), turned into U Scale's terms. The 1-to-4 line is the city's own joke."""
    rules = ['Price is fixed in writing. No “extras” later.',
             'Your domain is registered in your name. Not mine.',
             'Questions on WhatsApp are welcome. Even between 1 and 4.',
             'If a Pune studio suits you better, I’ll say so.']
    li = ''.join(f'<li style="--i:{i}"><b>{i + 1}.</b><span>{e(r)}</span></li>' for i, r in enumerate(rules))
    card = (f'<div class="dk__card patya"><span class="patya__screw" aria-hidden="true"></span><span class="patya__screw patya__screw--r" aria-hidden="true"></span>'
            f'<p class="patya__h"><b lang="mr">सूचना</b><span>Notice to Pune businesses</span></p><ol>{li}</ol>'
            f'<p class="patya__s">Signed: Mehul, U Scale</p></div>')
    floats = (DA._float('dk-seal', SEAL, 110, 0)
              + DA._float('dk-chip dk-route', f'{icon("chat")}Mumbai ⇄ {e(p["city"])} · WhatsApp &amp; video', 90, 1))
    return DA._dk('patya', card, floats, sheets=1, label='Notice to Pune businesses: ' + ' '.join(rules))


ART = {'cost': cost_card, 'patya': patya_card}


PRICE_CARDS = [('Single page', 'Landing page', False, 'One page that sells: what you do, photos, prices and a WhatsApp button.', 'Live in under 2 weeks', 'a one-page website'),
               ('Business site', 'Business site, 5–10 pages', False, '5–10 pages: home, services, work, about and contact, designed around your business.', 'Live in 3–4 weeks', 'a 5–10 page business website'),
               ('Bigger site + blog', 'Business site, 10–20 pages + blog', False, '10–20 pages for catalogues and many services, with a blog that helps you rank.', '', 'a 10–20 page website with a blog'),
               ('Online store', 'E-commerce, under 50 products', True, 'Up to 50 products, a cart and online payments by UPI and cards.', '', 'an online store')]


# What each price buys, said for the businesses of that city (the same four prices everywhere).
CARD_DESC = {
    'Pune': ['For a cab service, tuition class or home business: what you do, your prices and a WhatsApp button.',
             'For a Kothrud clinic or a Chakan supplier: 5–10 pages built around what buyers ask first.',
             'For manufacturers with a product range: catalogue pages, and a blog that answers buyers’ questions.',
             'For a Pune brand selling online: up to 50 products, a cart, and UPI and card payments.'],
    'Bengaluru': ['For a launch or a waitlist: one fast page, live in under 2 weeks, ready for your first ads.',
                  'For a startup or studio: product, pricing, team and contact, designed and hand-coded.',
                  'For software and services with many pages, and a blog that brings search traffic.',
                  'For a D2C brand: up to 50 products, a cart, and UPI and card checkout.'],
    'Chennai': ['For a clinic or tuition centre starting out: services, timings and a WhatsApp button.',
                'For an architect, CA or clinic: 5–10 pages, in English and Tamil if you need both.',
                'For practices with many services or projects, and a blog that brings search traffic.',
                'For a Chennai brand selling online: up to 50 products, a cart, and UPI and card payments.'],
    'Delhi NCR': ['For a Gurugram consultant or a Noida coaching class: your services, fees and a WhatsApp button.',
                  'For a CA firm or clinic: services with fees, your team, and an enquiry form that asks the right questions.',
                  'For firms with many services across NCR: a page per service, and a blog that answers clients’ questions.',
                  'For a Delhi brand selling online: up to 50 products, a cart, and UPI and card payments.'],
    'Hyderabad': ['For a home-collection lab or a Hitech City startup: one page, live in under 2 weeks.',
                  'For a diagnostic lab or clinic: tests or treatments with prices, timings and booking enquiries.',
                  'For groups with several centres: a page per branch, and a blog that answers patients’ questions.',
                  'For a Hyderabad brand selling online: up to 50 products, a cart, and UPI and card payments.'],
    'Kolkata': ['For a sweet shop or a home bakery: what you make, your prices and an “Order on WhatsApp” button.',
                'For a shop, clinic or school: 5–10 pages, in Bengali and English if your customers read both.',
                'For businesses with many products or branches: a page per range, and a blog for festival season.',
                'For a Kolkata brand shipping across India: up to 50 products, a cart, and UPI and card payments.'],
    'Ahmedabad': ['For a trader or a new brand: your range, your minimum order and a WhatsApp button.',
                  'For a wholesaler or manufacturer: a catalogue by fabric or product, with “Get price on WhatsApp”.',
                  'For exporters and manufacturers: product pages, certifications, and a blog for buyers outside Gujarat.',
                  'For an Ahmedabad brand selling online: up to 50 products, a cart, and UPI and card payments.'],
    'Surat': ['For a textile trader: your range, your market and shop number, and a WhatsApp button for rates.',
              'For a jeweller or saree maker: collections, certificates, and an enquiry form for retailers.',
              'For traders with large catalogues: a page per range, and a blog that answers bulk buyers’ questions.',
              'For a Surat brand selling direct: up to 50 products, a cart, and UPI and card payments.'],
    'Jaipur': ['For a guesthouse or a craft maker: photos, prices and a WhatsApp button for availability.',
               'For a heritage stay or a showroom: rooms or collections, how to find you, and how to book direct.',
               'For hotels and makers with many rooms or products: a page each, and a blog for travellers.',
               'For a Jaipur craft brand shipping across India: up to 50 products, a cart, and UPI and card payments.'],
}


def price_cards(market, sources, city=''):
    """Four plain prices, then what every site includes, then one line on what local studios charge (with its sources).
    Each card: a picture of its size on a small stage, the name, the price, one line, how soon it goes live, and a WhatsApp ask.
    The rows line up across the four cards (CSS subgrid), and nothing sits on top of the price ("onwards" goes after it, not before)."""
    li = ''
    local = CARD_DESC.get(city)
    for i, (k, name, onwards, d, t, ask) in enumerate(PRICE_CARDS):
        d = local[i] if local else d
        msg = f"Hi Mehul, I'm in {city} and I'd like {ask} ({price(name)}{' onwards' if onwards else ''}). Can we talk?" if city else \
              f"Hi Mehul, I'd like {ask} ({price(name)}{' onwards' if onwards else ''}). Can we talk?"
        li += (f'<li class="pc__c{" pc__c--first" if i == 0 else ""}" data-reveal><div class="pc__g">{PAGE_STACK[i]}</div><p class="pc__k">{e(k)}</p>'
               f'<p class="pc__p"><strong data-countto="{rupees(name)}" data-pre="₹">{e(price(name))}</strong>{"<small>onwards</small>" if onwards else ""}</p>'
               f'<p class="pc__d">{e(d)}</p>'
               + (f'<p class="pc__t">{icon("clock")}{e(t)}</p>' if t else '')
               + f'<a class="pc__go" href="{ea(SVP.WA + urllib.parse.quote(msg))}" target="_blank" rel="noopener">{icon("chat")}<span>Ask on WhatsApp<span class="sr-only"> about {e(ask)}</span></span></a></li>')
    inc = f'Every site includes {GP.INCLUDED}.'
    return Html(f'<ul class="pc" data-reveal-group>{li}</ul><p class="pc__inc">{icon("check")}<span>{e(inc)}</span></p>'
                f'<p class="pc__mkt">{e(market)} <a class="tlink" href="#sources">Sources</a></p>',
                text='\n'.join(f'- {k}: {price(name)}{" onwards" if onwards else ""}. {(CARD_DESC.get(city) or [c[3] for c in PRICE_CARDS])[i]}' + (f' {t}.' if t else '')
                               for i, (k, name, onwards, d, t, _) in enumerate(PRICE_CARDS))
                     + f'\n{inc}\n{market}')

QC_ITEMS = ['A design made for your business, not a ready-made theme', 'The number of pages, written down', 'Built and tested for phones',
            'Who writes the text, and what it costs', 'The domain registered in your name', 'What hosting and the domain cost after year one',
            'How many rounds of design changes', 'A bug-fix period after launch', 'Basic SEO: page titles, Search Console, speed',
            'Every login handed over to you']


def quote_checker(p, bands):
    """Tick what a studio's quote includes: a score, what to ask about, and the result typed into a WhatsApp message.
    Without JavaScript it is still a checklist of what a quote should say. bands: [(up to ₹, text)], 0 = everything above."""
    wa = SVP.WA + urllib.parse.quote(f"Hi Mehul, I got a website quote in {p['city']}. Can you check it for me?")
    li = ''.join(f'<li><label class="qc__opt"><input type="checkbox" data-qc-item="{ea(t)}"><span class="qc__box" aria-hidden="true">{icon("check")}</span>'
                 f'<span>{e(t)}</span></label></li>' for t in QC_ITEMS)
    return Html(f'''<div class="qc" data-qcheck data-city="{ea(p['city'])}" data-bands="{ea(json.dumps(bands, ensure_ascii=False))}" data-reveal>
        <div class="qc__form">
          <label class="qc__price"><span>The quote’s price</span><span class="qc__inr"><b aria-hidden="true">₹</b><input type="number" inputmode="numeric" min="0" step="500" placeholder="18000" data-qc-price></span></label>
          <p class="qc__q">What does it include, in writing? <span class="qc__live" data-qc-live></span></p>
          <ul class="qc__list">{li}</ul>
        </div>
        <div class="qc__out" aria-live="polite">
          <p class="qc__k">Your quote</p>
          <p class="qc__score"><b data-qc-n>0</b><span>of {len(QC_ITEMS)} covered</span></p>
          <p class="qc__band" data-qc-band>Enter the price and tick what the quote includes.</p>
          <p class="qc__msg" data-qc-msg></p>
          <div class="qc__miss" data-qc-misswrap hidden><p>Ask about these before you pay:</p><ul data-qc-miss></ul></div>
          <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-qc-wa>{icon("chat")}Send me your quote: free check</a>
          <p class="qc__note">I’ll tell you honestly if it’s a fair deal, even if it isn’t mine.</p>
        </div>
      </div>''', text='Before you pay any web studio, check that the quote includes, in writing: ' + '; '.join(QC_ITEMS).lower() + '.')


def picker(items, label):
    """Tabs, one per kind of local business: what its website must do, and what it usually costs with U Scale.
    Without JavaScript every panel shows, one after another. items: (key, icon, tab, title, lead, musts, fit, extra html)."""
    tabs = panels = ''
    for i, (k, ic, tab, title, lead, musts, fit, extra) in enumerate(items):
        tabs += (f'<button type="button" role="tab" id="bp-t-{k}" aria-controls="bp-p-{k}" aria-selected="{"true" if i == 0 else "false"}" '
                 f'tabindex="{0 if i == 0 else -1}">{icon(ic)}<span>{e(tab)}</span></button>')
        must = ''.join(f'<li>{icon("check")}<span>{e(m)}</span></li>' for m in musts)
        panels += (f'<div class="bp__panel{"" if extra else " bp__panel--solo"}" role="tabpanel" id="bp-p-{k}" aria-labelledby="bp-t-{k}"{"" if i == 0 else " data-off"}>'
                   f'<div><h3>{e(title)}</h3><p>{lead}</p><ul class="bp__must">{must}</ul><p class="bp__fit">{icon("rupee")}<span>{fit}</span></p></div>{extra}</div>')
    text = '\n'.join(f'- {title}: ' + '; '.join(musts) + f'. {GP._text(fit)}' for _, _, _, title, _, musts, fit, _ in items)
    return Html(f'<div class="bp" data-picker data-reveal><div class="bp__tabs" role="tablist" aria-label="{ea(label)}">{tabs}</div>{panels}</div>', text=text)


def lang_demo(sample, local_name, code, en, local):
    """The same two lines in English and the city's language, switchable: what a bilingual site looks like."""
    def v(l, pair, lang=''):
        return f'<div class="ld__v" data-l="{l}"{f" lang={chr(34)}{lang}{chr(34)}" if lang else ""}{"" if l == "en" else " data-off"}><b>{e(pair[0])}</b><span>{e(pair[1])}</span></div>'
    return Html(f'''<div class="ld" data-langdemo data-reveal>
        <div class="ld__sw" role="group" aria-label="Language of the sample"><button type="button" data-l="en" aria-pressed="true">English</button><button type="button" data-l="{code}" lang="{code}" aria-pressed="false">{e(local_name)}</button></div>
        <div class="ld__card"><p class="ld__k">{e(sample)}</p>{v("en", en)}{v(code, local, code)}</div>
      </div>''', text=f'{sample}: "{en[0]}" / "{local[0]}"')



# ---------------------------------------------------------------- Pune v3: fewer words, more pictures
# Mehul, 8 Nov 2026: "too much detail ... people will not read all this ... build trust properly ... animated and dynamic graphical
# components". So each block is one picture that moves and one short line: what keeps you safe, real live work, simple prices, how
# it runs week by week, and what your kind of business needs. Animations run when the block arrives (the site's reveal observer
# adds .is-in); without JavaScript, or with motion off, every graphic shows its finished state.
def _sheets(n, cls=''):
    return f'<span class="pg{cls}" aria-hidden="true">' + ''.join(f'<i style="--k:{k};--m:{(n - 1) / 2}"></i>' for k in range(n)) + '</span>'


PAGE_STACK = [_sheets(1), _sheets(3), _sheets(5),
              '<span class="pg pg--store" aria-hidden="true"><i style="--k:0;--m:1"></i><i style="--k:1;--m:1"></i><i style="--k:2;--m:1"></i><b></b></span>']
PROJECTS = 21  # Mehul, 9 Nov 2026 (the home page stat says the same)
LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></svg>'


def trust_bento(keys=('pay', 'own', 'fix', 'me')):
    img = GP.IMG['mehul']
    me = (f'<picture class="tb-me__img"><source type="image/avif" srcset="{GP.vurl(img["file"] + "-480.avif")}">'
          f'<img src="{GP.vurl(img["file"] + "-480.webp")}" width="480" height="480" alt="" loading="lazy" decoding="async"></picture>')
    tiles = [
        ('pay', '<div class="tb__g tb-pay" aria-hidden="true">'
                + ''.join(f'<span class="tb-pay__col" style="--w:{w};--i:{i}"><b>{w}%</b><i>{coin}</i><small>{n}</small></span>'
                          for i, (w, n, coin) in enumerate([(20, 'Start', ''), (20, 'Design', ''), (60, 'Launch', '<span class="tb-pay__coin">₹</span>')]))
                + '</div>',
         'Pay most after launch.', 'You pay 60% only when your site is live.'),
        ('own', f'<div class="tb__g tb-own" aria-hidden="true"><span class="tb-own__bar">{LOCK}<span>yourbusiness.in</span></span>'
                f'<span class="tb-own__tag">{icon("key")}<span>Owner</span><b>You</b></span></div>',
         'All in your name.', 'Domain, code and every login. Yours, always.'),
        ('fix', '<div class="tb__g tb-doc" aria-hidden="true"><span class="tb-doc__paper"><i style="--i:0;--w:88%"></i><i style="--i:1;--w:64%"></i>'
                f'<i style="--i:2;--w:76%"></i><span class="tb-doc__total"><small>Total</small><b>{e(BIZ)}</b></span></span><span class="tb-doc__stamp">Fixed</span></div>',
         'Price fixed in writing.', 'Agreed before work starts. No surprise bills.'),
        ('me', f'<div class="tb__g tb-me" aria-hidden="true"><span class="tb-me__on"><i></i>On WhatsApp</span>{me}'
               '<span class="tb-me__chat"><span class="tb-me__typing"><i></i><i></i><i></i></span><span class="tb-me__msg">Your design is ready. Have a look!</span></span></div>',
         'You talk to me.', 'Mehul, directly. Never an account manager.'),
    ]
    tiles += EXTRA_TILES
    by = {k: (k, g, h, x) for k, g, h, x in tiles}
    li = ''.join(f'<li class="tb__c tb__c--{k}" data-reveal>{g}<h3>{e(h)}</h3><p>{e(x)}</p></li>' for k, g, h, x in (by[k] for k in keys))
    return f'<ul class="tb" data-reveal-group>{li}</ul>'


def work_rail(ctx, keys):
    wmap = {w[0]: w for w in ctx['WORK']}
    li = ''
    for k in keys[:3]:
        w = wmap[k]; lw, lh = ctx['SZ'][k]
        li += (f'<li><a class="wr__c" href="{w[5]}" target="_blank" rel="noopener" data-cursor="view"><span class="wr__img"><img src="{GP.vurl(f"/assets/work/{k}-peek.webp")}" '
               f'width="768" height="480" alt="{ea("Website for " + w[1] + ", designed and built by U Scale")}" loading="lazy" decoding="async"></span>'
               f'<span class="wr__meta"><span class="wr__logo"><img src="{GP.vurl(f"/assets/logos/{k}.webp")}" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async"></span>'
               f'<span class="wr__name"><b>{e(w[1])}</b><small>{e(w[2])}</small></span></span><span class="wr__go">Visit live ↗<span class="sr-only"> (opens in a new tab)</span></span></a></li>')
    dots = ''.join(f'<i style="--i:{i}"></i>' for i in range(PROJECTS))
    return (f'<div class="wr-top"><div class="wr-count" data-reveal><b data-countto="{PROJECTS}" data-suf="+">{PROJECTS}+</b><span>projects shipped</span>'
            f'<span class="wr-dots" aria-hidden="true">{dots}</span></div>'
            f'<div class="wr-nav"><button type="button" data-rail-go="-1" aria-label="Previous projects">←</button><button type="button" data-rail-go="1" aria-label="Next projects">→</button></div></div>'
            f'<ul class="wr fp-snap" data-snap>{li}</ul>')


def timeline(img_key):
    steps = [('search', 'Free audit', 'Day 1, on WhatsApp', 'Free'),
             ('file', 'Written plan & fixed price', 'Week 1, on a video call', '20%'),
             ('pen', 'Design on your phone', 'Week 2, approve in Figma', '20%'),
             ('check', 'Launch & every login to you', 'Weeks 3–4', '60%')]
    li = ''.join(f'<li style="--i:{i}"><span class="tl__dot">{icon(ic)}</span><span class="tl__t"><b>{e(t)}</b><small>{e(w)}</small></span>'
                 f'<em><small>Pay</small>{e(pay)}</em></li>' for i, (ic, t, w, pay) in enumerate(steps))
    img = GP.IMG[img_key]
    pic = (f'<figure class="tlw__img fp-shot" data-reveal><div class="fp-shot__stage">{GP._pic(img, "(max-width: 899px) 92vw, 560px")}</div>'
           f'<figcaption>{e(img["caption"])}</figcaption></figure>')
    return f'<div class="tlw"><ol class="tl" data-reveal>{li}</ol>{pic}</div>'


def mix_bars(rows, label, src):
    mx = max(v for _, v in rows)
    li = ''.join(f'<li style="--v:{v};--w:{v / mx * 96:.1f};--i:{i}"><span>{e(t)}</span><i aria-hidden="true"></i><b>{v:g}%</b></li>' for i, (t, v) in enumerate(rows))
    return Html(f'<div class="mix" data-reveal><p class="mix__k">{e(label)}</p><ul>{li}</ul>{chips(src)}</div>',
                text=label + ': ' + ', '.join(f'{t} {v}%' for t, v in rows) + '.')


def _custom_sec(sid, eyebrow, h, lead, inner, tone=''):
    head = (f'<header class="sec-head fp-head"><p class="eyebrow">{e(eyebrow)}</p><h2 class="h2 fp-h2" id="{sid}-title">{e(h)}</h2>'
            + (f'<p class="lead">{e(lead)}</p>' if lead else '') + '</header>')
    if tone == 'dark':
        return (f'\n  <section class="section fp-sec fp-sec--dark" id="{sid}" aria-labelledby="{sid}-title">\n    <div class="wrap"><div class="panel on-dark fp-panel" '
                f'data-tone="dark" data-rail>{head}{inner}</div></div>\n  </section>')
    return (f'\n  <section class="section fp-sec{" fp-sec--" + tone if tone else ""}" id="{sid}" aria-labelledby="{sid}-title">\n    <div class="wrap">{head}{inner}</div>\n  </section>')


def page_v2(ctx, parts, p):
    """A page in the order the visitor needs it: hook, safety, proof, price, check, process, fit; facts and questions last."""
    site = ctx['SITE_URL']; url = site + p['path']
    icons = ctx['ICONS']
    wa = SVP.WA + urllib.parse.quote(p['wa'])
    by_sid = {s['sid']: (i, s) for i, s in enumerate(p['sections'])}
    body = _hero(p, wa, icons)
    for item in p['v2']:
        if callable(item):
            body += item(ctx)
        else:
            i, sec = by_sid[item]
            body += GP._section(i, sec)
    body += (aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title', None, fold=2).replace('class="section sp-brief-wrap"', 'class="section sp-brief-wrap sp-brief-wrap--fold"', 1)
             + aeo._faq_section(p['faq'], f'{p["city"]} questions.') + SVP._foot(p) + _cta(p, wa, icons))
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, url, p), body, og=og_image(site, p))


# ---------------------------------------------------------------- Bengaluru and Chennai (v2)
# Bengaluru: founders and owners who move fast and buy online. The page leads with speed of launch, hand-coded build and UPI.
# Chennai: trust first. The page leads with real Chennai work (Space Studio), long-term care and the Tamil-first name board.
CARE = price('Care plan: updates, backups, security')
CODE_LINES = ['<span class="k">&lt;section</span> <span class="a">class</span>=<span class="s">"hero"</span><span class="k">&gt;</span>',
              '  <span class="k">&lt;h1&gt;</span>Millet snacks, baked<span class="k">&lt;/h1&gt;</span>',
              '  <span class="k">&lt;a</span> <span class="a">href</span>=<span class="s">"/shop"</span><span class="k">&gt;</span>Shop now<span class="k">&lt;/a&gt;</span>',
              '<span class="k">&lt;/section&gt;</span>']
EXTRA_TILES = [
    ('code', '<div class="tb__g tb-code" aria-hidden="true"><span class="tb-code__tag">No page builder</span><pre>'
             + ''.join(f'<span class="tb-code__l" style="--i:{i}">{l}</span>' for i, l in enumerate(CODE_LINES)) + '<i class="tb-code__cur"></i></pre></div>',
     'Hand-coded. No bloat.', 'Light pages, without a page builder or a pile of plugins.'),
    ('care', f'<div class="tb__g tb-care" aria-hidden="true"><span class="tb-care__shield">{icon("shield")}</span><ul>'
             + ''.join(f'<li style="--i:{i}">{icon("check")}{x}</li>' for i, x in enumerate(['Updates', 'Backups', 'Security'])) + '</ul></div>',
     'Looked after, later too.', f'Optional care plan: updates, backups and security, {CARE}.'),
]


def launch_card(p):
    # Bengaluru hero: a launch checklist that ticks itself off, a bar that fills, and the site going live.
    items = ['Brief and audit on WhatsApp', 'Design approved in Figma', 'Hand-coded and tested on phones', 'UPI checkout connected', 'Domain and logins handed over']
    li = ''.join(f'<li style="--i:{i}"><span class="lc__box">{icon("check")}</span><span>{e(x)}</span></li>' for i, x in enumerate(items))
    card = (f'<div class="dk__card fp-ticket sv-ticket lc"><p class="dk-quote__head"><span class="dk-quote__mark">{icon("bolt")}</span>'
            f'<span><b>Your launch checklist</b><small>Landing page · under 2 weeks</small></span></p>'
            f'<span class="lc__bar" aria-hidden="true"><i></i></span><ul>{li}</ul><p class="lc__live"><i></i>Live · yourbrand.in</p></div>')
    floats = (DA._float('dk-seal', SEAL, 110, 0)
              + DA._float('dk-chip dk-route', f'{icon("chat")}Mumbai ⇄ {e(p["city"])} · WhatsApp &amp; video', 90, 1))
    return DA._dk('launch', card, floats, sheets=2, label='A launch checklist: brief, design, build, UPI checkout and handover, ending with the site live')


def proof_card(p):
    # Chennai hero: the real Space Studio Chennai site, desktop and phone, with what was built.
    vu = GP.vurl
    card = (f'<div class="dk__card pf__win"><p class="pf__bar"><i></i><i></i><i></i><b>spacestudiochennai.com</b></p>'
            f'<img src="{vu("/assets/work/spacestudio-feature-960.webp")}" width="960" height="600" alt="" decoding="async" fetchpriority="high"></div>')
    floats = (DA._float('pf__phone', f'<img src="{vu("/assets/work/spacestudio-mobile.webp")}" width="360" height="805" alt="" decoding="async">', 120, 0)
              + DA._float('dk-chip pf__chip', f'{icon("check")}Live · a Chennai client', 90, 1)
              + DA._float('dk-chip pf__chip pf__chip--b', f'{icon("file")}86 hand-coded pages', 140, 2))
    return DA._dk('proof', card, floats, sheets=1, label='The Space Studio Chennai website, built by U Scale: 86 hand-coded pages')


ART.update({'launch': launch_card, 'proof': proof_card})


def case_study():
    # Chennai: what was built for Space Studio, three facts, each with its own picture.
    pages = ''.join(f'<i style="--i:{i}"></i>' for i in range(86))
    links = ''.join(f'<span class="cs-links__r" style="--i:{i}"><s>/{a}</s>{icon("arrow")}<b>/{b}</b>{icon("check")}</span>'
                    for i, (a, b) in enumerate([('?p=214', 'projects/…'), ('services-2', 'services/…'), ('contact-us', 'contact')]))
    tiles = [(f'<div class="cs__g cs-pages" aria-hidden="true">{pages}</div>', '<b data-countto="86">86</b>', 'hand-coded pages, each one designed'),
             ('<div class="cs__g cs-cube" aria-hidden="true"><span class="cs-cube__c"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>',
              '<b>3D</b>', 'a live building model on every service page'),
             (f'<div class="cs__g cs-links" aria-hidden="true">{links}</div>', '<b>Every</b>', 'old WordPress link kept, so search traffic stayed')]
    li = ''.join(f'<li class="cs__c" data-reveal>{g}<p class="cs__n">{n}</p><p class="cs__d">{e(d)}</p></li>' for g, n, d in tiles)
    return (f'<ul class="cs" data-reveal-group>{li}</ul><p class="cs__go"><a class="tlink" href="https://spacestudiochennai.com" target="_blank" rel="noopener">'
            f'Visit spacestudiochennai.com<span class="sr-only"> (opens in a new tab)</span> ↗</a></p>')


def name_board(local, en, lang, stat, stat_label, src):
    # A shop board with the local-language name on top and English below, next to a donut of the city's first-language share.
    r = 52
    circ = 2 * 3.14159 * r
    donut = (f'<svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="{r}" class="nb-d__bg"/>'
             f'<circle cx="70" cy="70" r="{r}" class="nb-d__v" style="--c:{circ:.1f};--v:{stat / 100 * circ:.1f}"/></svg>')
    html = (f'<div class="nb"><div class="nb__board" data-reveal><span class="nb__screws" aria-hidden="true"><i></i><i></i></span>'
            f'<span class="nb__l" lang="{lang}">{e(local)}</span><span class="nb__en">{e(en)}</span><span class="nb__rule">Tamil on top, then English</span></div>'
            f'<div class="nb__stat" data-reveal><span class="nb-d">{donut}<b>{round(stat)}%</b></span><p>{e(stat_label)}</p>{chips(src)}</div></div>')
    return Html(html, text=f'{stat_label}: {stat:g}%.')


def dot_stat(n, per, label, src, unit='startups'):
    # A big number with a field of dots under it, one dot per `per`.
    dots = ''.join(f'<i style="--i:{i}"></i>' for i in range(round(n / per)))
    return Html(f'<div class="sd" data-reveal><p class="sd__n"><b data-countto="{n}">{n:,}</b><span>{e(label)}</span></p>'
                f'<div class="sd__dots" aria-hidden="true">{dots}</div><p class="sd__k">Each dot is about {per:,} {unit}. {chips(src)}</p></div>',
                text=f'{label}: {n:,}.')


# ---------------------------------------------------------------- wave 2 sources (read 8–9 Nov 2026; price pages are the studios' own)
GP.SRC.update({
    'gbp-areas': ('Google Business Profile Help', 'Manage your service areas (up to 20)', 'https://support.google.com/business/answer/9157481'),
    'dl-ec': ('Delhi Government, 14 Mar 2016', 'Sixth Economic Census, Delhi: 8.75 lakh establishments in 2013',
              'https://publicity.delhi.gov.in/publicity/deputy-chief-minister-releases-sixth-economic-census-delhi-14th-march-2016'),
    'dl-lang': ('Wikipedia, from Census of India 2011', 'Languages in NCT of Delhi', 'https://en.wikipedia.org/wiki/Delhi'),
    'dl-p1': ('Ahmad Web Solutions, New Delhi, seen 9 Nov 2026', 'Affordable web designing company in Delhi', 'https://www.ahmadwebsolutions.com/affordable-web-designing-company.html'),
    'dl-p2': ('Aanve, Delhi, seen 9 Nov 2026', 'Website design pricing', 'https://www.aanve.com/website-design-pricing/'),
    'dl-p3': ('DigiStreet Media, Noida and Delhi, seen 9 Nov 2026', 'Website design agency, Delhi NCR', 'https://digistreetmedia.com/website-design-agency-delhi-ncr/'),
    'hy-corp': ('ThePrint, Feb 2026', 'Telangana reorganises GHMC into three municipal corporations',
                'https://theprint.in/india/telangana-govt-reorganises-ghmc-into-three-separate-municipal-corporations/2851596'),
    'hy-lang': ('Census of India 2011, table C-16', 'Hyderabad district: population by mother tongue',
                'https://censusindia.gov.in/nada/index.php/catalog/10193/download/13305/DDW-C16-STMT-MDDS-2800.XLSX'),
    'hy-pharma': ('Business Today, 19 Feb 2026', 'What is driving global life sciences investment into Telangana',
                  'https://www.businesstoday.in/industry/pharma/story/what-is-driving-global-life-sciences-investment-into-telangana-516967-2026-02-19'),
    'hy-p1': ('EasyQuickWeb, Hyderabad, seen 9 Nov 2026', 'Website packages in Hyderabad', 'https://easyquickweb.com/pricing/'),
    'hy-p2': ('VS Techno Solutions, Hyderabad, seen 9 Nov 2026', 'Website development packages, Hyderabad', 'https://www.vstechnosolutions.com/website-development-packages-hyderabad.php'),
    'hy-p3': ('Hyderabad Graphics, seen 9 Nov 2026', 'Website design packages', 'https://hyderabadgraphics.com/'),
    'kol-lang': ('Wikipedia, from Census of India 2011', 'Kolkata district: languages', 'https://en.wikipedia.org/wiki/Kolkata_district'),
    'kol-boards': ('Outlook, Sep 2025', 'Bengali now mandatory on all signboards in Kolkata',
                   'https://www.outlookindia.com/national/bengali-now-mandatory-on-all-signboards-in-kolkata-civic-body-orders'),
    'kol-p1': ('WebAdis, Kolkata, seen 9 Nov 2026', 'Website design company in Kolkata', 'https://webadis.com/website-design-company-kolkata'),
    'kol-p2': ('AS Webmarketings, Kolkata, seen 9 Nov 2026', 'Website design company in Kolkata', 'https://aswebmarketings.com/website-design-company-kolkata'),
    'kol-p3': ('RedX Studios, Kolkata, seen 9 Nov 2026', 'Web development services in Kolkata', 'https://redxstudios.in/web-development-services-in-kolkata'),
    'ahd-msme': ('NewKerala, 9 Mar 2026', 'MSME units in Ahmedabad district (Gujarat Assembly answer)',
                 'https://www.newkerala.com/news/a/3283-msme-units-ahmedabad-granted-rs-6283-crore-960.htm'),
    'ahd-lang': ('Census of India 2011, table C-16', 'Ahmedabad district: population by mother tongue',
                 'https://censusindia.gov.in/nada/index.php/catalog/10203/download/13315/DDW-C16-STMT-MDDS-2400.XLSX'),
    'ahd-heritage': ('Ahmedabad Municipal Corporation', 'Manek Chowk heritage site', 'https://heritage.ahmedabadcity.gov.in/details/97/heritage_site/en'),
    'ahd-p1': ('DC Technolabs, Ahmedabad, seen 9 Nov 2026', 'Web design company in Ahmedabad', 'https://dctechnolabs.in/services/web-design/'),
    'ahd-p2': ('Clients Now, Ahmedabad, seen 9 Nov 2026', 'Website development pricing in Ahmedabad', 'https://www.clientsnow.in/website-development-pricing-in-ahmedabad-india'),
    'srt-tex': ('DeshGujarat, 27 Apr 2026', 'Textile industry in Surat and South Gujarat contributes over 25% to state GDP',
                'https://deshgujarat.com/2026/04/27/textile-industry-in-surat-and-south-gujarat-contributes-over-25-to-state-gdp-govt/'),
    'srt-dia': ('Scroll, Apr 2026', 'How the Iran war has plunged India’s diamond industry into a deeper crisis',
                'https://scroll.in/article/1092358/how-the-iran-war-has-plunged-indias-diamond-industry-into-a-deeper-crisis'),
    'srt-lang': ('Wikipedia, from Census of India 2011', 'Surat district: languages', 'https://en.wikipedia.org/wiki/Surat_district'),
    'srt-p1': ('Karasa Infotech, Surat, seen 9 Nov 2026', 'Website packages', 'https://karasa.co.in/'),
    'srt-p2': ('Agentic Digital Marketing, Surat, seen 9 Nov 2026', 'Website development company in Adajan, Surat',
               'https://agenticdigitalmarketing.in/website-development-company-adajan-surat/'),
    'srt-p3': ('Tejas Suthar, Surat, seen 9 Nov 2026', 'Website design plans', 'https://tejassuthar.in/'),
    'jpr-tour': ('Travel Trade Journal, 2026', 'Rajasthan records 10.92 crore tourist visits in H1 2026',
                 'https://traveltradejournal.com/rajasthan-records-10-92-crore-tourist-visits-in-h1-2026-sikar-leads-domestic-jaipur-foreign-arrivals/'),
    'jpr-lang': ('Wikipedia, from Census of India 2011', 'Jaipur district: languages', 'https://en.wikipedia.org/wiki/Jaipur_district'),
    'jpr-p1': ('Web Design Company Jaipur, seen 9 Nov 2026', 'Web development packages', 'https://www.webdesigncompanyjaipur.com/web-development-packages'),
    'jpr-p2': ('PashGen, Jaipur, seen 9 Nov 2026', 'Pricing', 'https://www.pashgen.com/pricing'),
    'jpr-p3': ('Web Seasoning, Jaipur, seen 9 Nov 2026', 'Web development in Jaipur', 'https://webseasoning.com/services/web-development-jaipur'),
})


# ---------------------------------------------------------------- wave 2 cities: heroes built from each city's own fact
def _hero_card(kind, head, small, body, label, ic='pin'):
    card = (f'<div class="dk__card fp-ticket sv-ticket h2c h2c--{kind}"><p class="dk-quote__head"><span class="dk-quote__mark">{icon(ic)}</span>'
            f'<span><b>{e(head)}</b><small>{e(small)}</small></span></p>{body}</div>')
    floats = (DA._float('dk-seal', SEAL, 110, 0))
    return DA._dk(kind, card, floats, sheets=2, label=label)


def ncr_card(p):
    # Delhi: one Google listing serving the NCR cities as service areas (Google allows up to 20).
    cities = [('Delhi', 46, 42, 1), ('Gurugram', 27, 74, 0), ('Noida', 72, 56, 0), ('Ghaziabad', 78, 22, 0), ('Faridabad', 52, 84, 0)]
    lines = ''.join(f'<line x1="46" y1="42" x2="{x}" y2="{y}" style="--i:{i}"/>' for i, (_, x, y, hub) in enumerate(cities) if not hub)
    nodes = ''.join(f'<span class="ncr__n{" ncr__n--hub" if hub else ""}" style="left:{x}%;top:{y}%;--i:{i}"><i></i><b>{e(n)}</b></span>'
                    for i, (n, x, y, hub) in enumerate(cities))
    body = (f'<div class="ncr" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none">{lines}</svg><span class="ncr__ring"></span>'
            f'<span class="ncr__ring ncr__ring--2"></span>{nodes}</div><p class="h2c__f">{icon("check")}One Google listing, up to 20 service areas</p>')
    return _hero_card('ncr', 'One listing. Every NCR city.', 'Delhi · Gurugram · Noida · Ghaziabad · Faridabad', body,
                      'One Google listing that serves Delhi, Gurugram, Noida, Ghaziabad and Faridabad as service areas')


def zones_card(p):
    # Hyderabad: three municipal corporations since 11 Feb 2026; name your locality, not just "Hyderabad".
    zones = [('Greater Hyderabad', 'Old City · Secunderabad', 0), ('Cyberabad', 'Serilingampally · Kukatpally · Qutbullapur', 1), ('Malkajgiri', 'North and east', 0)]
    li = ''.join(f'<li class="{"is-you" if you else ""}" style="--i:{i}"><b>{e(n)}</b><small>{e(d)}</small>'
                 + (f'<span class="zn__pin">{icon("pin")}Your locality: Kukatpally</span>' if you else '') + '</li>' for i, (n, d, you) in enumerate(zones))
    body = f'<ul class="zn" aria-hidden="true">{li}</ul><p class="h2c__f">{icon("check")}Name your locality on your site and Google listing</p>'
    return _hero_card('zones', 'Hyderabad is three cities now', 'Three municipal corporations since 11 Feb 2026', body,
                      'Hyderabad is now three municipal corporations: Greater Hyderabad, Cyberabad and Malkajgiri. Name your locality.')


def bengali_board(p):
    # Kolkata: Bengali on top of the shop board (KMC, 2025), the same name on Google and the website.
    body = ('<div class="bb" aria-hidden="true"><span class="bb__l" lang="bn">মিষ্টি মহল</span><span class="bb__en">MISHTI MAHAL</span>'
            '<span class="bb__s">Sweets · since morning</span></div>'
            f'<ul class="bb__m" aria-hidden="true"><li style="--i:0">{icon("check")}Shop board</li><li style="--i:1">{icon("check")}Google listing</li><li style="--i:2">{icon("check")}Website</li></ul>')
    return _hero_card('bboard', 'Bengali on top. Same name everywhere.', 'Kolkata signboard rule, 2025', body,
                      'A Kolkata shop board with the Bengali name on top and English below, and the same name on Google and the website', ic='tag')


def pin_card(p):
    # Ahmedabad: old-city lanes (pols) need an exact pin, a landmark and the right opening hours.
    lanes = ''.join(f'<i style="--x:{x}%;--y:{y}%;--w:{w}%;--r:{r}deg"></i>' for x, y, w, r in
                    [(4, 30, 60, 0), (30, 62, 66, 0), (14, 45, 40, 90), (60, 40, 34, 90), (8, 82, 80, 0)])
    body = (f'<div class="pn" aria-hidden="true"><span class="pn__map">{lanes}</span><span class="pn__pin">{icon("pin")}</span><span class="pn__tag">Sabarmati Fabrics</span></div>'
            '<ul class="pn__rows" aria-hidden="true"><li>' + icon('pin') + 'Landmark: near Manek Chowk</li><li>' + icon('clock') + 'Open 10 am to 8 pm</li></ul>'
            f'<p class="h2c__f">{icon("check")}An exact pin, so buyers find you in the lanes</p>')
    return _hero_card('pin', 'Old-city lanes need an exact pin', 'Directions, landmark and hours that match', body,
                      'A Google listing for an old-city shop with an exact map pin, a landmark and opening hours')


def market_card(p):
    # Surat: 240 markets and 70,000+ traders. The address must name the market, floor and shop number.
    floors = [('3', '301–360', True), ('2', '201–260', False), ('1', '101–160', False), ('G', '1–40', False)]
    li = ''.join(f'<li class="{"is-you" if you else ""}" style="--i:{i}"><b>{e(f)}</b><span>Shops {e(r)}</span>'
                 + ('<em>Shop 314 · you</em>' if you else '') + '</li>' for i, (f, r, you) in enumerate(floors))
    body = (f'<p class="mk__t" aria-hidden="true">Textile Market · Ring Road</p><ul class="mk" aria-hidden="true">{li}</ul>'
            f'<p class="h2c__f">{icon("check")}Market, floor and shop number on your site and listing</p>')
    return _hero_card('market', 'Which market? Which floor?', '240 markets, 70,000+ traders', body,
                      'A market directory board: floor 3, shop 314. Your address should name the market, floor and shop number', ic='store')


def booking_card(p):
    # Jaipur: tourists search in English and want to book direct.
    body = ('<p class="bk__q" aria-hidden="true">' + icon('search') + '<span>heritage haveli stay jaipur</span></p>'
            '<div class="bk__r" aria-hidden="true"><b>Haveli Neel</b><small>Heritage stay · Old city, Jaipur</small>'
            '<span class="bk__chips"><i>English</i><i>हिंदी</i><i>Breakfast</i></span>'
            f'<span class="bk__btn">{icon("chat")}Check availability</span></div>'
            f'<p class="h2c__f">{icon("check")}Guests book direct, on WhatsApp</p>')
    return _hero_card('book', 'Tourists search in English', 'Then they book the place that answers', body,
                      'A tourist searches for a heritage stay in Jaipur and books direct on WhatsApp', ic='search')


ART.update({'ncr': ncr_card, 'zones': zones_card, 'bboard': bengali_board, 'pin': pin_card, 'market': market_card, 'book': booking_card})


def stat_trio(rows, src):
    # Three big numbers, each with a small picture.
    li = ''.join(f'<li data-reveal><span class="st3__ic">{icon(ic)}</span><b>{e(n)}</b><span>{e(t)}</span></li>' for ic, n, t in rows)
    return Html(f'<div class="st3-wrap"><ul class="st3" data-reveal-group>{li}</ul><p class="st3__src">{chips(*src)}</p></div>', text='; '.join(f'{n} {t}' for _, n, t in rows) + '.')


def hundred(n, big, label, src):
    # 100 dots, n of them lit: "98 of every 100".
    dots = ''.join(f'<i class="{"on" if k < n else ""}" style="--i:{k}"></i>' for k in range(100))
    return Html(f'<div class="hd" data-reveal><div class="hd__dots" aria-hidden="true">{dots}</div><div><p class="hd__n">{e(big)}</p><p class="hd__t">{e(label)}</p>{chips(src)}</div></div>',
                text=f'{big}: {label}.')

# ---------------------------------------------------------------- the cities
CITIES = [
 dict(slug='pune', path='services/website-design-pune', city='Pune', state='Maharashtra', wiki='https://en.wikipedia.org/wiki/Pune',
  crumb='Website design in Pune', service='Website design and development for Pune businesses',
  card='Fixed-price websites for Pune shops, suppliers, institutes and cafés, built from Mumbai over WhatsApp and video calls.',
  title='Website Design & Development in Pune, from ₹25,000',
  desc=f'Websites for Pune businesses, designed and hand-coded by Mehul Karotra: landing page {LANDING}, business site {BIZ}, fixed in writing. Over WhatsApp.',
  h1='Website design & development in Pune', eyebrow='For Pune businesses',
  lead='Hand-coded websites at a fixed price, over WhatsApp. You pay most after launch, and you own everything.',
  stats=[(LANDING, 'Websites from'), ('3–4 wk', 'Live in'), ('60%', 'Paid after launch')],
  art='patya', imgs=['city-pune'], hero_btn='Free audit on WhatsApp', hero_more=('#prices', 'See prices'), wa="Hi Mehul, I run a business in Pune. I'd like a free audit for my website.",
  cta_h='Get a free audit',
  cta_lead='Tell me about your Pune business. Got a quote from another studio? Send that too, and I’ll tell you honestly if it’s fair. I reply within 24 hours.',
  cost=dict(scale=150000, ticks=[0, 50000, 100000, 150000], when='Nov 2026', foot='From 4 Pune studios’ own price pages, seen 8 Nov 2026',
            rows=[('Template site', 'Ready-made WordPress or Wix theme', 5000, 18000, '₹5k–₹18k'),
                  ('Business site, 5–10 pages', 'Pune studios', 20000, 60000, '₹20k–₹60k'),
                  ('Custom-designed site', 'Pune studios', 60000, 150000, '₹60k–₹1.5L')]),
  answer='U Scale is Mehul Karotra, a Mumbai web designer who builds hand-coded websites for Pune businesses over WhatsApp and video calls. '
         f'Prices are fixed in writing: {LANDING} for one page, {BIZ} for 5–10 pages and from {STORE} for an online store, '
         'and you pay 60% only after launch.',
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
   Sec('Website prices for Pune businesses',
       price_cards('For comparison, Pune studios’ own price pages put a ready-made theme at ₹5,000–₹18,000 and a custom-designed site at ₹60,000–₹1.5 lakh (seen 8 November 2026).',
                   ['pune-p1', 'pune-p2', 'pune-p3', 'pune-p4'], 'Pune'),
       eyebrow='Pune prices', lead='Four prices. Fixed in writing. The same as in Mumbai.',
       layout='wide', sid='prices'),
   Sec('What does your Pune business need?',
       mix_bars([('Manufacturing & trade', 40), ('Food & stays', 9), ('Cabs & travel', 7)],
                'What Pune runs on: share of 9.1 lakh Udyam registrations, March 2026', 'pune-udyam'),
       picker([
        ('make', 'box', 'Manufacturer or supplier', 'Manufacturers and suppliers',
         'Buyers judge you by your website before they call. Give them specs, not slogans.',
         ['A product catalogue in English, with specifications and PDF downloads', 'An enquiry form that asks for quantity, material and drawings',
          'Certifications and the industries you supply, on the first screen', 'A link to your IndiaMART listing, with the same details on both'],
         f'Usually a 10–20 page site with a blog: {BLOG}, fixed in writing.', ''),
        ('shop', 'store', 'Shop or trader', 'Shops and traders',
         'Customers find you on Google Maps first. Your site backs it up and takes orders.',
         ['Timings, an exact map pin and one-tap directions', 'Photos of what’s in stock, easy for you to update',
          'An “Order on WhatsApp” button on every product or category', 'Marathi and English, if your customers read both'],
         f'Usually a landing page ({LANDING}) with local SEO ({LSEO}).', ''),
        ('food', 'menu', 'Café or restaurant', 'Cafés and restaurants',
         'Let regulars order from you directly, not through an app.',
         ['A menu with prices you can update yourself', 'Your own ordering link, so regulars skip the app commission',
          'Timings, map and a one-tap call button', 'Table and party enquiries straight to WhatsApp'],
         f'A restaurant site with your own online ordering: {REST}, fixed. <a class="tlink" href="/services/website-design-mumbai/restaurants-cafes">How that works</a>.', ''),
        ('cabs', 'truck', 'Cabs or travel', 'Cabs and travel agencies',
         'People book cabs on a phone, in a hurry. Make it one tap.',
         ['Routes and fares in plain words: airport, Mumbai, outstation', 'One-tap call and WhatsApp, visible without scrolling',
          'Your reviews and vehicle photos up front', 'Pages that load fast on mobile data'],
         f'Usually a landing page: {LANDING}, live in under 2 weeks.', ''),
        ('class', 'team', 'Classes or institute', 'Classes and institutes',
         'In the “Oxford of the East”, students compare institutes on their phones.',
         ['Courses, batches and fees on one clear page', 'Results and teachers, with real photos',
          'An enquiry button on every page, straight to WhatsApp', 'Marathi for parents who prefer it'],
         f'Usually a 5–10 page business site: {BIZ}, fixed.', GP.render(Img('city-pune'))),
       ], 'Your kind of business'),
       lang_demo('Marathi and English? Tap to switch.', 'मराठी', 'mr',
                 ('Admissions open for Class 10', 'Call or WhatsApp us'), ('इयत्ता दहावीसाठी प्रवेश सुरू', 'कॉल किंवा WhatsApp करा')),
       eyebrow='Pune’s businesses', layout='wide', sid='business'),
  ],
  v2=[lambda ctx: _custom_sec('trust', 'Why it’s safe', 'You’re protected at every step.', '', trust_bento()),
      lambda ctx: _custom_sec('work', 'Real work', 'Real websites. Live right now.', 'Tap any card to open the live site.',
                              work_rail(ctx, ['spacestudio', 'sashe', 'vidhi', 'antrah', 'roar', 'brandgen']), tone='dark'),
      'prices',
      lambda ctx: _custom_sec('process', 'How it works', 'Live in 3–4 weeks. All from your phone.', '', timeline('remote-review'), tone='band'),
      'business'],
  work=['spacestudio', 'sashe', 'vidhi'], work_h='Websites I designed and built, live today.',
  work_lead='Space Studio is an architecture practice in Chennai; Sashe by Prachi and Vidhi Parmar are Mumbai clients.',
  who='I design and code every site myself, from Mumbai. Pune clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Pune?',
        'Pune studios’ own price pages (seen November 2026) put a template website at ₹5,000–₹18,000, a 5–10 page business website at ₹20,000–₹60,000, '
        f'a custom-designed site at ₹60,000–₹1.5 lakh and an online store at ₹25,000 to over ₹2.5 lakh. With U Scale, a landing page is {LANDING}, a '
        f'5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Will my website rank in Pune if my designer is in Mumbai?',
        'Yes. Google ranks local results on relevance, distance and prominence, and distance is measured from your business to the person searching, '
        'not from your designer. What matters is that your website and Google Business Profile name your area, services and timings, and match each other.'),
       ('Can my website be in Marathi and English?',
        'Yes. Marathi, Hindi and English are Pune’s major languages, according to the district administration. I build bilingual pages from your own '
        f'Marathi text, or a translator’s, with a language switch Google understands. Writing the copy is {COPY}.'),
       ('How do I get my Pune business on Google Maps?',
        GP.MAPS_FAQ + ' If you visit customers rather than them visiting you, list Pune and Pimpri-Chinchwad as service areas.'),
       ('Is it safe to pay a web designer in another city?',
        'With U Scale the price is fixed in writing before work starts, and you pay in three parts: 20% to start, 20% when you approve the design and 60% '
        'only when the site is live. Your domain is registered in your name, and every login is handed to you at launch.'),
       ('Do you work with businesses in Pimpri-Chinchwad?',
        'Yes. Pune district has two big urban centres, Pune and Pimpri-Chinchwad, and U Scale works with businesses in both, remotely. For a Google '
        'listing, list both as service areas if you visit customers; keep the pin exact if they visit you. Use the same name, phone and area on '
        'Justdial, Sulekha, IndiaMART, your Google listing and your website.')],
  sources=['pune-p1', 'pune-p2', 'pune-p3', 'pune-p4', 'pune-udyam', 'pune-gov', 'local-rank'], related=3),

 dict(slug='bengaluru', path='services/website-design-bengaluru', city='Bengaluru', state='Karnataka', wiki='https://en.wikipedia.org/wiki/Bengaluru',
  crumb='Website design in Bengaluru', service='Website design and development for Bengaluru businesses',
  card='Fixed-price websites for Bengaluru startups, cafés and shops, built from Mumbai over WhatsApp and video calls.',
  title='Website Design in Bengaluru (Bangalore), from ₹25,000',
  desc=f'Websites for Bengaluru startups, cafés and shops, hand-coded by Mehul Karotra: landing page {LANDING}, business site {BIZ}, fixed in writing.',
  h1='Website design & development in Bengaluru', eyebrow='For Bengaluru businesses',
  lead='Hand-coded websites at a fixed price. A landing page goes live in under 2 weeks, and you pay most of it after launch.',
  stats=[(LANDING, 'Websites from'), ('<2 wk', 'Landing page live'), ('60%', 'Paid after launch')],
  art='launch', imgs=['city-bengaluru'], hero_btn='Free audit on WhatsApp', hero_more=('#prices', 'See prices'),
  wa="Hi Mehul, I'm building something in Bengaluru. I'd like a free audit and a price for my website.",
  cta_h='Get a free audit', cta_lead='Tell me what you’re building in Bengaluru. I reply within 24 hours, usually much faster on WhatsApp.',
  cost=dict(scale=100000, ticks=[0, 25000, 50000, 75000, 100000], when='Nov 2026', foot='From 3 Bengaluru studios’ own price pages, seen 8 Nov 2026',
            rows=[('Basic site', 'Ready-made design, about 5 pages', 8750, 22750, '₹9k–₹23k'),
                  ('Premium design', 'Up to 10 pages', 19999, 75900, '₹20k–₹76k'),
                  ('Online store', 'Starting prices', 25000, 35000, 'from ₹25k–₹35k')]),
  answer='U Scale is Mehul Karotra, a Mumbai web designer who builds hand-coded websites for Bengaluru startups and small businesses over WhatsApp and '
         f'video calls. Prices are fixed in writing: {LANDING} for one page, {BIZ} for 5–10 pages and from {STORE} for an online store with UPI '
         'checkout, and you pay 60% only after launch.',
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
   Sec('Website prices for Bengaluru businesses',
       price_cards('For comparison, Bengaluru studios’ package pages start a basic five-page site at ₹8,750–₹22,750 and premium designs at ₹23,350–₹75,900, usually plus GST (seen 8 November 2026).',
                   ['blr-p1', 'blr-p2', 'blr-p3'], 'Bengaluru'),
       eyebrow='Bengaluru prices', lead='Four prices. Fixed in writing. The same as in Mumbai.', layout='wide', sid='prices'),
   Sec('What does your Bengaluru business need?',
       dot_stat(13649, 500, 'DPIIT-recognised startups in Bengaluru district, to 31 October 2024', 'blr-startups'),
       picker([
        ('startup', 'bolt', 'Startup or D2C brand', 'Startups and D2C brands', 'Say what it is in one screen, then let people buy or sign up.',
         ['A landing page that explains the product in one screen', 'Checkout with UPI and cards, or a waitlist',
          'Pages investors and customers can share', 'Fast on mobile data, with nothing extra loading'],
         f'Usually a landing page ({LANDING}), or an online store from {STORE}.', GP.render(Img('city-bengaluru'))),
        ('cafe', 'menu', 'Café or restaurant', 'Cafés and restaurants', 'Regulars should order from you, not through an app.',
         ['A menu with prices you update yourself', 'Your own ordering link, without app commission',
          'Timings, map and a one-tap call button', 'Table and party enquiries on WhatsApp'],
         f'A restaurant site with your own ordering: {REST}, fixed. <a class="tlink" href="/services/website-design-mumbai/restaurants-cafes">How that works</a>.', ''),
        ('clinic', 'card', 'Clinic, salon or studio', 'Clinics, salons and studios', 'People choose on reviews, prices and how easy it is to book.',
         ['Services with prices and timings', 'Your team, with real photos', 'Book on WhatsApp from every page', 'Reviews and a clear location'],
         f'Usually a 5–10 page business site: {BIZ}, fixed.', ''),
        ('maker', 'box', 'Manufacturer or wholesaler', 'Manufacturers and wholesalers', 'Buyers check your website before they call.',
         ['A catalogue with specifications and PDF downloads', 'An enquiry form that asks the right questions',
          'Certifications on the first screen', 'A link to your IndiaMART listing'],
         f'Usually a 10–20 page site with a blog: {BLOG}, fixed.', ''),
       ], 'Your kind of business'),
       lang_demo('Kannada and English? Tap to switch.', 'ಕನ್ನಡ', 'kn',
                 ('Order online', 'Free delivery across Bengaluru'), ('ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ', 'ಬೆಂಗಳೂರಿನಾದ್ಯಂತ ಉಚಿತ ಡೆಲಿವರಿ')),
       eyebrow='Bengaluru’s businesses', layout='wide', sid='business'),
  ],
  v2=[lambda ctx: _custom_sec('trust', 'Built like a product', 'Fast to launch. Safe to pay.', '', trust_bento(('code', 'pay', 'own', 'me'))),
      lambda ctx: _custom_sec('work', 'Real work', 'Real websites. Live right now.', 'Tap any card to open the live site.',
                              work_rail(ctx, ['spacestudio', 'brandgen', 'roar', 'sashe', 'vidhi', 'antrah']), tone='dark'),
      'prices',
      lambda ctx: _custom_sec('process', 'How it works', 'Landing page in under 2 weeks. Bigger sites in 3–4.', '', timeline('remote-review'), tone='band'),
      'business'],
  related=3,
  work=['spacestudio', 'sashe', 'vidhi'], work_h='Websites I designed and built, live today.',
  work_lead='Space Studio is an architecture practice in Chennai; Sashe by Prachi and Vidhi Parmar are Mumbai clients.',
  who='I design and code every site myself, from Mumbai. Bengaluru clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Bengaluru?',
        'Bengaluru studios’ own package pages (seen November 2026) start a basic five-page site at about ₹8,750–₹22,750, premium designs at '
        '₹23,350–₹75,900 and online stores from ₹25,000–₹35,000, usually plus GST. With U Scale, a landing page is '
        f'{LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Can a web designer in Mumbai build a website for my Bengaluru startup?',
        'Yes. With U Scale you get a free audit on WhatsApp, a written plan agreed on a video call, designs to review in Figma and a hand-coded site with '
        'every login in your name. For an app or a product with a large engineering team, a Bengaluru agency is the better fit.'),
       ('Is it safe to pay a web designer in another city?',
        'With U Scale the price is fixed in writing before work starts, and you pay in three parts: 20% to start, 20% when you approve the design and 60% '
        'only when the site is live. Your domain is registered in your name, and every login is handed to you at launch.'),
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
  lead='I rebuilt the website of Space Studio, a Chennai architecture practice. Your business gets the same care, at a fixed price, over WhatsApp.',
  stats=[(LANDING, 'Websites from'), ('3–4 wk', 'Live in'), ('60%', 'Paid after launch')],
  art='proof', imgs=['city-chennai'], hero_btn='Free audit on WhatsApp', hero_more=('#case', 'See the Chennai work'),
  wa="Hi Mehul, I run a business in Chennai. I'd like a free audit for my website.",
  cta_h='Get a free audit', cta_lead='Tell me about your Chennai business. I reply within 24 hours, usually much faster on WhatsApp.',
  cost=dict(scale=150000, ticks=[0, 50000, 100000, 150000], when='Nov 2026', foot='From 3 Chennai studios’ own price pages, seen 8 Nov 2026',
            rows=[('Template or static site', 'About 5–6 pages', 5000, 30000, '₹5k–₹30k'),
                  ('Custom business site', 'Up to 10 pages', 20000, 100000, '₹20k–₹1L'),
                  ('Online store', 'Most quotes', 40000, 120000, '₹40k–₹1.2L')]),
  answer='U Scale is Mehul Karotra, a Mumbai web designer who rebuilt the website of Space Studio, a Chennai architecture practice: 86 hand-coded pages. '
         f'He builds websites for Chennai businesses over WhatsApp and video calls, at fixed prices: {LANDING} for one page, {BIZ} for 5–10 pages '
         f'and from {STORE} for an online store.',
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
   Sec('Tamil first, then English',
       name_board('நலம் பல் மருத்துவமனை', 'NALAM DENTAL CARE', 'ta', 78.34, 'of Chennai district has Tamil as its first language (Census 2011)', 'chn-lang'),
       lang_demo('Tamil and English? Tap to switch.', 'தமிழ்', 'ta',
                 ('Book your visit now', 'Open Monday to Saturday'), ('இப்போதே முன்பதிவு செய்யுங்கள்', 'திங்கள் முதல் சனி வரை திறந்திருக்கும்')),
       eyebrow='Language', lead='Chennai asks for shop names in Tamil on top. Your website and Google listing should match your board.',
       layout='wide', tone='band', sid='tamil'),
   Sec('Website prices for Chennai businesses',
       price_cards('For comparison, Chennai studios’ own price pages put a template or static site at ₹5,000–₹30,000 and a custom business site at ₹20,000–₹1 lakh (seen 8 November 2026).',
                   ['chn-p1', 'chn-p2', 'chn-p3'], 'Chennai'),
       eyebrow='Chennai prices', lead='Four prices. Fixed in writing. The same as in Mumbai.', layout='wide', sid='prices'),
   Sec('What does your Chennai business need?',
       picker([
        ('auto', 'truck', 'Auto or engineering', 'Auto and engineering suppliers', 'Buyers from other states judge you by your website.',
         ['A catalogue with specifications and certifications', 'An enquiry form that asks for drawings and quantities',
          'The industries you supply, on the first screen', 'A link to your IndiaMART listing'],
         f'Usually a 10–20 page site with a blog: {BLOG}, fixed.', ''),
        ('retail', 'tag', 'Textile or retail', 'Textile and retail', 'Show the collection and take orders on WhatsApp.',
         ['Collections with prices', '“Order on WhatsApp” on every product', 'Store timings and a map', 'Tamil and English'],
         f'A catalogue site from {BIZ}, or an online store from {STORE}.', ''),
        ('clinic', 'card', 'Clinic or hospital', 'Clinics and healthcare', 'Patients compare doctors, timings and fees on their phones.',
         ['Doctors, timings and fees on one page', 'Booking on WhatsApp', 'Directions in Tamil and English', 'An English version for patients from other states'],
         f'Usually a 5–10 page business site: {BIZ}, fixed.', GP.render(Img('city-chennai'))),
        ('b2b', 'layers', 'Architect or consultant', 'Architects and consultants', 'Your work is the proof. Show it properly.',
         ['Projects as case studies', 'Services explained plainly', 'A clear way to start a conversation', 'Every old link kept when you leave WordPress'],
         f'The kind of site I built for Space Studio: priced after a free audit, from {BIZ}.', ''),
       ], 'Your kind of business'),
       eyebrow='Chennai’s businesses', layout='wide', sid='business'),
  ],
  v2=[lambda ctx: _custom_sec('case', 'Real Chennai work', 'Space Studio, Chennai.', 'What I built for an office-architecture practice.', case_study()),
      lambda ctx: _custom_sec('trust', 'Why it’s safe', 'Looked after at every step.', '', trust_bento(('pay', 'own', 'care', 'me'))),
      'tamil', 'prices',
      lambda ctx: _custom_sec('process', 'How it works', 'Live in 3–4 weeks. All from your phone.', '', timeline('remote-review'), tone='band'),
      'business',
      lambda ctx: _custom_sec('work', 'More work', 'More websites, live right now.', 'Tap any card to open the live site.',
                              work_rail(ctx, ['sashe', 'vidhi', 'brandgen', 'roar', 'antrah']), tone='dark')],
  related=3,
  work=['sashe', 'vidhi'], work_feature='spacestudio', work_h='A Chennai website I designed and built.',
  work_lead='Space Studio designs offices in Chennai. Their new site has 86 hand-coded pages and kept every old link working.',
  who='I design and code every site myself, from Mumbai. Chennai clients talk to me directly on WhatsApp and video calls, never to an account manager.',
  faq=[('How much does a website cost in Chennai?',
        'Chennai studios’ own price pages (seen November 2026) put a template or static site at ₹5,000–₹30,000, a custom business site at '
        '₹20,000–₹1 lakh and most online stores at ₹40,000–₹1.2 lakh. With U Scale, a landing page is '
        f'{LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing before work starts.'),
       ('Have you built websites for Chennai businesses?',
        'Yes. U Scale rebuilt the website of Space Studio, an office-architecture practice in Chennai: 86 hand-coded pages, live at spacestudiochennai.com.'),
       ('Is it safe to pay a web designer in another city?',
        'With U Scale the price is fixed in writing before work starts, and you pay in three parts: 20% to start, 20% when you approve the design and 60% '
        'only when the site is live. Your domain is registered in your name, and every login is handed to you at launch.'),
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


# ---------------------------------------------------------------- wave 2: six more cities, each tailored to how it buys
SAFE_Q = ('Is it safe to pay a web designer in another city?',
          'With U Scale the price is fixed in writing before work starts, and you pay in three parts: 20% to start, 20% when you approve the design and 60% '
          'only when the site is live. Your domain is registered in your name, and every login is handed to you at launch.')


def _facts(city, market, langs):
    return [('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
            ('Based in', f'Mumbai (Ghatkopar West). No {city} office: the work happens over WhatsApp and video calls'),
            ('Website prices', GP.WEB_PRICES + '. The same prices as in Mumbai'),
            (f'{city} market, for comparison', market),
            ('Timeline', 'Landing page in under 2 weeks; business site in 3–4 weeks'),
            ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
            ('Languages', langs),
            ('Ownership', 'Your domain, code and logins, in your name')]


def _answer(city, who):
    return (f'U Scale is Mehul Karotra, a Mumbai web designer who builds hand-coded websites for {who} over WhatsApp and video calls. '
            f'Prices are fixed in writing: {LANDING} for one page, {BIZ} for 5–10 pages and from {STORE} for an online store, and you pay 60% only after launch.')


def _city(slug, city, state, wiki, eyebrow, lead, who, art, img, wa, cta_lead, trust_h, trust_keys, market_line, market_src, market_fact,
          langs, sections_mid, picker_items, lang_demo_args, faq_mid, sources, extra_v2=None, wiki_state=None):
    sec_prices = Sec(f'Website prices for {city} businesses', price_cards(market_line, market_src, city),
                     eyebrow=f'{city} prices', lead='Four prices. Fixed in writing. The same as in Mumbai.', layout='wide', sid='prices')
    biz_blocks = list(sections_mid) + [picker(picker_items, 'Your kind of business')] + ([lang_demo(*lang_demo_args)] if lang_demo_args else [])
    sec_biz = Sec(f'What does your {city} business need?', *biz_blocks, eyebrow=f'{city}’s businesses', layout='wide', sid='business')
    v2 = [lambda ctx: _custom_sec('trust', 'Why it’s safe', trust_h, '', trust_bento(trust_keys)),
          lambda ctx: _custom_sec('work', 'Real work', 'Real websites. Live right now.', 'Tap any card to open the live site.',
                                  work_rail(ctx, ['spacestudio', 'sashe', 'vidhi', 'antrah', 'roar', 'brandgen']), tone='dark'),
          'prices',
          lambda ctx: _custom_sec('process', 'How it works', 'Live in 3–4 weeks. All from your phone.', '', timeline('remote-review'), tone='band'),
          'business'] + (extra_v2 or [])
    faq = [(f'How much does a website cost in {city}?', faq_mid[0]), SAFE_Q,
           (f'Will my website rank in {city} if my designer is in Mumbai?',
            'Yes. Google ranks local results on relevance, distance and prominence, and distance is measured from your business to the person searching, '
            'not from your designer. What matters is that your website and Google Business Profile name your area, services and timings, and match each other.'),
           *faq_mid[1:],
           (f'How do I get my {city} business on Google Maps?', GP.MAPS_FAQ)]
    return dict(slug=slug, path=f'services/website-design-{slug}', city=city, state=state, wiki=wiki,
                crumb=f'Website design in {city}', service=f'Website design and development for {city} businesses',
                card=f'Fixed-price websites for {city} businesses, built from Mumbai over WhatsApp and video calls.',
                title=f'Website Design & Development in {city}, from ₹25,000',
                desc=f'Websites for {city} businesses, designed and hand-coded by Mehul Karotra: landing page {LANDING}, business site {BIZ}, fixed in writing. Over WhatsApp.',
                h1=f'Website design & development in {city}', eyebrow=eyebrow, lead=lead,
                stats=[(LANDING, 'Websites from'), ('3–4 wk', 'Live in'), ('60%', 'Paid after launch')],
                art=art, imgs=[img], hero_btn='Free audit on WhatsApp', hero_more=('#prices', 'See prices'), wa=wa,
                cta_h='Get a free audit', cta_lead=cta_lead,
                answer=_answer(city, who), facts=_facts(city, market_fact, langs),
                sections=[sec_prices, sec_biz], v2=v2, faq=faq, sources=sources, related=3, work=[], work_h='', work_lead='', who='')


def _p(k, ic, tab, title, lead, musts, fit, extra=''):
    return (k, ic, tab, title, lead, musts, fit, extra)


CITIES += [
 _city('delhi-ncr', 'Delhi NCR', 'Delhi', 'https://en.wikipedia.org/wiki/National_Capital_Region_(India)', 'For Delhi NCR businesses',
       'Hand-coded websites at a price fixed in writing, for businesses across Delhi NCR. You pay most of it after launch.',
       'businesses across Delhi NCR', 'ncr', 'city-delhi', "Hi Mehul, I run a business in Delhi NCR. I'd like a free audit for my website.",
       'Tell me about your Delhi NCR business. I reply within 24 hours, usually much faster on WhatsApp.',
       'Fixed in writing. Safe to pay.', ('fix', 'pay', 'own', 'me'),
       'For comparison, Delhi studios’ own pages list a starter site from ₹9,999, a 1–5 page WordPress site at ₹15,000–₹35,000 and agency CMS sites from ₹1,00,000 plus GST (seen 9 November 2026).',
       ['dl-p1', 'dl-p2', 'dl-p3'],
       'Starter site from ₹9,999 · 1–5 page WordPress site ₹15,000–₹35,000 · agency CMS sites from ₹1,00,000 + GST (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi',
       [mix_bars([('Trade', 42.3), ('Manufacturing', 17.8), ('Transport & storage', 8.3), ('Food & stays', 5.5)],
                 'What Delhi’s 8.75 lakh establishments do (Sixth Economic Census, 2013)', 'dl-ec')],
       [_p('trade', 'store', 'Wholesale trader', 'Wholesale traders', 'Retailers check you online before they visit the market.',
           ['Your product range, with photos', 'Minimum order and prices on request, on WhatsApp', 'Market, lane and shop number, exactly', 'The same name on your board, Google and IndiaMART'],
           f'Usually a 5–10 page catalogue site: {BIZ}, fixed.'),
        _p('retail', 'tag', 'Retail shop', 'Retail shops', 'Customers find you on Google Maps first. Your site backs it up.',
           ['Timings, a map pin and one-tap directions', 'What’s in stock, easy to update', '“Order on WhatsApp” on every product', 'Hindi and English, if your customers read both'],
           f'Usually a landing page ({LANDING}) with local SEO ({LSEO}).'),
        _p('pro', 'file', 'CA or consultant', 'CAs, lawyers and consultants', 'Clients compare fees and trust before they call.',
           ['Services with fixed fees', 'Who you are, with real photos', 'Book a call on WhatsApp', 'Your office, and the NCR cities you serve'],
           f'Usually a 5–10 page business site: {BIZ}, fixed.', GP.render(Img('city-delhi'))),
        _p('make', 'box', 'Small manufacturer', 'Small manufacturers', 'Buyers check your website before they ask for a quote.',
           ['A catalogue with specifications', 'An enquiry form for quantity and drawings', 'Certifications on the first screen', 'A link to your IndiaMART listing'],
           f'Usually a 10–20 page site with a blog: {BLOG}, fixed.'),
        _p('food', 'menu', 'Restaurant or café', 'Restaurants and cafés', 'Let regulars order from you directly, not through an app.',
           ['A menu you update yourself', 'Your own ordering link', 'Timings, map and one-tap call', 'Party orders on WhatsApp'],
           f'A restaurant site with your own ordering: {REST}, fixed.')],
       ('Hindi and English? Tap to switch.', 'हिंदी', 'hi', ('File your ITR on time', 'Fixed fees, written up front'), ('अपना ITR समय पर फ़ाइल करें', 'तय फ़ीस, पहले से लिखित में')),
       ['Delhi studios’ own pages (seen November 2026) list a starter site from ₹9,999, a 1–5 page WordPress site at ₹15,000–₹35,000 and agency CMS sites '
        f'from ₹1,00,000 plus GST. With U Scale, a landing page is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('Can one Google listing cover Gurugram, Noida and the rest of NCR?',
         'If you visit customers or deliver to them, yes: Google lets a business list up to 20 service areas, so a Delhi business can add Gurugram, Noida, '
         'Ghaziabad and Faridabad. If customers come to you, keep your exact address instead, and name the NCR cities you serve on your website.'),
        ('Should my Delhi website be in Hindi?',
         'Hindi is the first language of about 81% of Delhi (Census 2011), so Hindi pages help if your customers search in Hindi. Most business sites lead in '
         f'English and add Hindi for key pages. I build them from your own Hindi text; writing the copy is {COPY}.')],
       ['dl-p1', 'dl-p2', 'dl-p3', 'dl-ec', 'dl-lang', 'gbp-areas', 'local-rank']),

 _city('hyderabad', 'Hyderabad', 'Telangana', 'https://en.wikipedia.org/wiki/Hyderabad', 'For Hyderabad businesses',
       'Hand-coded websites at a fixed price, for everyone from Old City shops to Cyberabad firms. Over WhatsApp.',
       'Hyderabad businesses', 'zones', 'city-hyderabad', "Hi Mehul, I run a business in Hyderabad. I'd like a free audit for my website.",
       'Tell me about your Hyderabad business. I reply within 24 hours, usually much faster on WhatsApp.',
       'Built clean. Safe to pay.', ('code', 'pay', 'own', 'me'),
       'For comparison, Hyderabad studios’ own pages list 5-page static sites at ₹6,999–₹9,900 and 10-page sites at ₹12,999–₹15,000 (seen 9 November 2026).',
       ['hy-p1', 'hy-p2', 'hy-p3'],
       '5-page static site ₹6,999–₹9,900 · 10-page site ₹12,999–₹15,000 (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi; Telugu or Urdu pages built from your own text',
       [mix_bars([('Telugu', 43.35), ('Urdu', 43.24), ('Hindi', 5.86)], 'First languages in Hyderabad district (Census 2011)', 'hy-lang')],
       [_p('food', 'menu', 'Restaurant', 'Restaurants and caterers', 'Hyderabad is a UNESCO City of Gastronomy. Let regulars order from you directly.',
           ['A menu with prices you update yourself', 'Your own ordering link, without app commission', 'Timings, map and one-tap call', 'Catering and party orders on WhatsApp'],
           f'A restaurant site with your own ordering: {REST}, fixed.'),
        _p('lab', 'search', 'Lab or clinic', 'Labs, clinics and pharmacies', 'People book tests and visits on their phones. Make it one tap.',
           ['Tests and packages with prices', 'Book a home visit or slot on WhatsApp', 'Reports sent on WhatsApp', 'Your locality named clearly'],
           f'Usually a 5–10 page business site: {BIZ}, fixed.', GP.render(Img('city-hyderabad'))),
        _p('pharma', 'box', 'Pharma or supplier', 'Pharma and life-science suppliers', 'Hyderabad has more than 800 pharma and life-science companies. Buyers check you first.',
           ['Products and certifications, clearly listed', 'An enquiry form for quantities and specs', 'Who you supply, on the first screen', 'English first, for buyers across India'],
           f'Usually a 10–20 page site with a blog: {BLOG}, fixed.'),
        _p('jewel', 'tag', 'Jeweller', 'Jewellers and bangle shops', 'Show the collection, and take enquiries on WhatsApp.',
           ['Collections with photos and prices', '“Ask on WhatsApp” on every piece', 'Your bazaar, lane and timings', 'Telugu, Urdu and English, as your customers read'],
           f'A catalogue site from {BIZ}, or an online store from {STORE}.')],
       None,
       ['Hyderabad studios’ own pages (seen November 2026) list 5-page static sites at ₹6,999–₹9,900 and 10-page sites at ₹12,999–₹15,000. With U Scale, '
        f'a landing page is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('Should my listing say Hyderabad or Cyberabad?',
         'Since 11 February 2026 the old GHMC area is three municipal corporations: Greater Hyderabad, Cyberabad and Malkajgiri. Customers still search '
         '“Hyderabad”, so keep it, and also name your locality (Kukatpally, Gachibowli, Secunderabad and so on) on your website and Google listing.'),
        ('Should my website be in Telugu or Urdu?',
         'In the 2011 Census, Telugu and Urdu were each the first language of about 43% of Hyderabad district. Most business sites lead in English; '
         f'add Telugu or Urdu pages if your customers are local. I build them from your own text; writing the copy is {COPY}.')],
       ['hy-p1', 'hy-p2', 'hy-p3', 'hy-corp', 'hy-lang', 'hy-pharma', 'local-rank']),

 _city('kolkata', 'Kolkata', 'West Bengal', 'https://en.wikipedia.org/wiki/Kolkata', 'For Kolkata businesses',
       'Websites for Kolkata businesses, in Bengali and English, at a fixed price. You talk to me directly, on WhatsApp.',
       'Kolkata businesses', 'bboard', 'city-kolkata', "Hi Mehul, I run a business in Kolkata. I'd like a free audit for my website.",
       'Tell me about your Kolkata business. I reply within 24 hours, usually much faster on WhatsApp.',
       'A person you can talk to.', ('me', 'pay', 'own', 'care'),
       'For comparison, Kolkata studios’ own pages list one-page sites from ₹2,499–₹2,999 and 8–15 page sites at ₹9,999–₹19,999 (seen 9 November 2026).',
       ['kol-p1', 'kol-p2', 'kol-p3'],
       'One-page site ₹2,499–₹2,999 · 8–15 page site ₹9,999–₹19,999 (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi; Bengali pages built from your own text',
       [mix_bars([('Bengali', 61.45), ('Hindi', 22.19), ('Urdu', 13.04)], 'First languages in Kolkata district (Census 2011)', 'kol-lang')],
       [_p('sweets', 'menu', 'Sweet shop or caterer', 'Sweet shops and caterers', 'Festive orders come in on phones. Make ordering one tap.',
           ['Sweets and gift boxes with prices', '“Order on WhatsApp” on every item', 'Delivery areas and timings', 'Bengali and English'],
           f'Usually a 5–10 page site: {BIZ}, or an online store from {STORE}.', GP.render(Img('city-kolkata'))),
        _p('sari', 'tag', 'Sari or clothing', 'Sari and clothing stores', 'Puja shopping starts online. Show the collection early.',
           ['Collections with prices', '“Order on WhatsApp” on every piece', 'Store timings and a map', 'Bengali and English'],
           f'A catalogue site from {BIZ}, or an online store from {STORE}.'),
        _p('leather', 'box', 'Leather goods', 'Leather goods makers', 'West Bengal has 26.6% of India’s tanneries. Buyers check you before they order.',
           ['A catalogue with materials and finishes', 'An enquiry form for quantities', 'Export and certification details', 'English first, for buyers abroad'],
           f'Usually a 10–20 page site with a blog: {BLOG}, fixed.'),
        _p('events', 'calendar', 'Decor or events', 'Decor, lighting and events', 'People book you months ahead of the season. Show past work.',
           ['Past work as photo galleries', 'Packages and what they include', 'Enquiry on WhatsApp', 'Your areas and dates'],
           f'Usually a 5–10 page business site: {BIZ}, fixed.')],
       ('Bengali and English? Tap to switch.', 'বাংলা', 'bn', ('Fresh sweets every morning', 'Order on WhatsApp'), ('প্রতিদিন সকালে টাটকা মিষ্টি', 'হোয়াটসঅ্যাপে অর্ডার করুন')),
       ['Kolkata studios’ own pages (seen November 2026) list one-page sites from ₹2,499–₹2,999 and 8–15 page sites at ₹9,999–₹19,999. With U Scale, '
        f'a landing page is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('Do I have to show my shop name in Bengali?',
         'On your shop board in Kolkata, yes: in 2025 the civic body ordered signboards to show Bengali prominently at the top. Google asks that your listing '
         'name matches the name on your storefront, so use the same Bengali and English name on your board, Google listing and website.'),
        ('Should my Kolkata website be in Bengali?',
         'Bengali is the first language of about 61% of Kolkata district (Census 2011), with Hindi and Urdu next. Lead in the language your customers search in, '
         f'and add the other for key pages. I build Bengali pages from your own text; writing the copy is {COPY}.')],
       ['kol-p1', 'kol-p2', 'kol-p3', 'kol-lang', 'kol-boards', 'gbp-guidelines', 'local-rank']),

 _city('ahmedabad', 'Ahmedabad', 'Gujarat', 'https://en.wikipedia.org/wiki/Ahmedabad', 'For Ahmedabad businesses',
       'Websites for Ahmedabad businesses at a price fixed in writing. You pay most of it after launch, and you own everything.',
       'Ahmedabad businesses', 'pin', 'city-ahmedabad', "Hi Mehul, I run a business in Ahmedabad. I'd like a free audit for my website.",
       'Tell me about your Ahmedabad business. I reply within 24 hours, usually much faster on WhatsApp.',
       'Value for money, in writing.', ('fix', 'pay', 'own', 'care'),
       'For comparison, Ahmedabad studios’ own pages list a starter site from ₹24,999–₹25,000 and a 10-page CMS site at ₹50,000 (seen 9 November 2026).',
       ['ahd-p1', 'ahd-p2'],
       'Starter site from ₹24,999–₹25,000 · 10-page CMS site ₹50,000 (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi; Gujarati pages built from your own text',
       [hundred(98, '5.99 lakh', 'registered MSMEs in Ahmedabad district, and 98 of every 100 are micro businesses (March 2026)', 'ahd-msme')],
       [_p('textile', 'tag', 'Textile or cloth trader', 'Textile and cloth traders', 'Buyers across India check your range before they call.',
           ['A catalogue with fabric, width and minimum order', '“Get price on WhatsApp” on every product', 'Market address and shop number', 'Gujarati and English'],
           f'Usually a 5–10 page catalogue site: {BIZ}, fixed.', GP.render(Img('city-ahmedabad'))),
        _p('jewel', 'star', 'Jeweller', 'Jewellers', 'Manek Chowk’s jewellery market is one of India’s largest. Stand out online.',
           ['Collections with photos', '“Ask on WhatsApp” on every piece', 'Exact pin and landmark in the old city', 'Opening hours that match the market'],
           f'A catalogue site from {BIZ}, or an online store from {STORE}.'),
        _p('food', 'menu', 'Eatery', 'Eateries and caterers', 'Evening crowds decide on their phones. Be the one they find.',
           ['Menu and prices', 'Timings, including late hours', 'An exact map pin', 'Orders on WhatsApp'],
           f'Usually a landing page ({LANDING}) with local SEO ({LSEO}).'),
        _p('make', 'box', 'Manufacturer or pharma', 'Manufacturers and pharma firms', 'Buyers judge you by your website before they ask for a quote.',
           ['A catalogue with specifications', 'Certifications on the first screen', 'An enquiry form for quantities', 'A link to your IndiaMART listing'],
           f'Usually a 10–20 page site with a blog: {BLOG}, fixed.')],
       ('Gujarati and English? Tap to switch.', 'ગુજરાતી', 'gu', ('Wholesale fabrics from Ahmedabad', 'Get price on WhatsApp'), ('અમદાવાદથી હોલસેલ કાપડ', 'WhatsApp પર ભાવ મેળવો')),
       ['Ahmedabad studios’ own pages (seen November 2026) list a starter site from ₹24,999–₹25,000 and a 10-page CMS site at ₹50,000. With U Scale, a '
        f'landing page is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('My shop is in the old city. How do customers find it?',
         'Set an exact pin on your Google listing, add a landmark people know (Manek Chowk, a pol name, a gate) to your directions, and keep your hours '
         'exact: in the old city, some markets change trade through the day. Put the same address and landmark on your website.'),
        ('Should my Ahmedabad website be in Gujarati?',
         'Gujarati is the first language of about 75% of Ahmedabad district (Census 2011), with Hindi next. Lead in English or Gujarati, whichever your '
         f'customers use, and add the other for key pages. I build Gujarati pages from your own text; writing the copy is {COPY}.')],
       ['ahd-p1', 'ahd-p2', 'ahd-msme', 'ahd-lang', 'ahd-heritage', 'local-rank']),

 _city('surat', 'Surat', 'Gujarat', 'https://en.wikipedia.org/wiki/Surat', 'For Surat traders and makers',
       'Websites for Surat traders and makers at a fixed price, built so buyers across India find your shop and your stock.',
       'Surat traders and businesses', 'market', 'city-surat', "Hi Mehul, I run a business in Surat. I'd like a free audit for my website.",
       'Tell me about your Surat business. I reply within 24 hours, usually much faster on WhatsApp.',
       'Pay most after launch.', ('pay', 'fix', 'own', 'me'),
       'For comparison, Surat studios list a one-page site from ₹2,999, a basic business site from about ₹15,000 and a 5-page WordPress site at ₹20,000 (seen 9 November 2026).',
       ['srt-p1', 'srt-p2', 'srt-p3'],
       'One-page site from ₹2,999 · basic business site from about ₹15,000 · 5-page WordPress site ₹20,000 (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi; Gujarati pages built from your own text',
       [stat_trio([('layers', '65%', 'of India’s man-made fibre segment is in Surat'), ('store', '70,000+', 'traders in 240 large textile markets'),
                   ('star', '8–10 lakh', 'people work in diamond cutting and polishing')], ['srt-tex', 'srt-dia'])],
       [_p('trader', 'store', 'Textile trader', 'Textile traders', 'Buyers across India search for your range before they call.',
           ['A catalogue with fabric, design and minimum order', '“Get price on WhatsApp” on every design', 'Market, floor and shop number', 'Hindi, Gujarati and English'],
           f'Usually a 5–10 page catalogue site: {BIZ}, fixed.'),
        _p('unit', 'box', 'Processing or powerloom unit', 'Processing and powerloom units', 'Traders compare capacity and quality before they send work.',
           ['What you process, with photos', 'Capacity and turnaround', 'An enquiry form for job work', 'Your unit’s exact location'],
           f'Usually a 5–10 page business site: {BIZ}, fixed.'),
        _p('diamond', 'star', 'Diamond or jewellery', 'Diamond and jewellery businesses', 'Buyers want proof: certificates, photos and a real address.',
           ['Pieces with certificates and photos', '“Ask on WhatsApp” on every piece', 'Your office or showroom address', 'English first, for buyers everywhere'],
           f'A catalogue site from {BIZ}, or an online store from {STORE}.', GP.render(Img('city-surat'))),
        _p('food', 'menu', 'Restaurant or farsan', 'Restaurants and farsan shops', 'Let regulars order from you directly.',
           ['A menu you update yourself', 'Your own ordering link', 'Timings and a map pin', 'Orders on WhatsApp'],
           f'A restaurant site with your own ordering: {REST}, fixed.')],
       ('Gujarati and English? Tap to switch.', 'ગુજરાતી', 'gu', ('Certified diamonds', 'Visit our showroom'), ('પ્રમાણિત હીરા', 'અમારા શોરૂમની મુલાકાત લો')),
       ['Surat studios’ own pages (seen November 2026) list a one-page site from ₹2,999, a basic business site from about ₹15,000 and a 5-page WordPress '
        f'site at ₹20,000. With U Scale, a landing page is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('My shop is in a big textile market. How do buyers find it?',
         'Put the market name, floor and shop number in your address. Google allows suite, floor and building numbers in a business address, and with 240 '
         'markets in Surat, buyers need all three. Use exactly the same address on your website, Google listing and IndiaMART.'),
        ('Should my Surat website be in Gujarati?',
         'Gujarati is the first language of about 60% of Surat district (Census 2011), with Hindi and Marathi next. Traders selling across India usually '
         f'lead in English or Hindi; shops serving Surat add Gujarati. I build the pages from your own text; writing the copy is {COPY}.')],
       ['srt-p1', 'srt-p2', 'srt-p3', 'srt-tex', 'srt-dia', 'srt-lang', 'gbp-guidelines', 'local-rank']),

 _city('jaipur', 'Jaipur', 'Rajasthan', 'https://en.wikipedia.org/wiki/Jaipur', 'For Jaipur stays, shops and makers',
       'Websites for Jaipur stays, shops and makers: English for tourists, Hindi for locals. Fixed price, over WhatsApp.',
       'Jaipur stays, shops and makers', 'book', 'city-jaipur', "Hi Mehul, I run a business in Jaipur. I'd like a free audit for my website.",
       'Tell me about your Jaipur business. I reply within 24 hours, usually much faster on WhatsApp.',
       'Safe to pay. Yours to keep.', ('pay', 'own', 'me', 'care'),
       'For comparison, Jaipur studios list a 5-page site at ₹9,000 and custom sites from ₹22,000–₹25,000 (seen 9 November 2026).',
       ['jpr-p1', 'jpr-p2', 'jpr-p3'],
       '5-page site ₹9,000 · custom sites from ₹22,000–₹25,000 (studios’ own pages, seen 9 Nov 2026)',
       'English and Hindi',
       [dot_stat(256293, 10000, 'foreign tourist visits to Jaipur, January to June 2026: the most of any city in Rajasthan', 'jpr-tour', unit='visits')],
       [_p('stay', 'pin', 'Hotel or homestay', 'Hotels, havelis and homestays', 'Guests compare on their phones, then book the place that answers.',
           ['Rooms with photos and nightly prices', '“Check availability” on WhatsApp', 'English first, with Hindi', 'Exact location and directions'],
           f'Usually a 5–10 page business site: {BIZ}, fixed.', GP.render(Img('city-jaipur'))),
        _p('gems', 'star', 'Gems or jewellery', 'Gems and jewellery', 'Tourists and buyers want proof before they visit.',
           ['Pieces with photos and certificates', '“Ask on WhatsApp” on every piece', 'Showroom address and timings', 'English for visitors'],
           f'A catalogue site from {BIZ}, or an online store from {STORE}.'),
        _p('craft', 'tag', 'Blue pottery or handicrafts', 'Blue pottery and handicrafts', 'Visitors want to take a piece home, or order it later.',
           ['A catalogue with sizes and prices', 'Shipping across India and abroad', 'Workshop visits, with directions', 'English and Hindi'],
           f'An online store from {STORE}, or a catalogue site from {BIZ}.'),
        _p('tours', 'truck', 'Tours or taxi', 'Tours and taxis', 'Tourists book in a hurry, on a phone, in English.',
           ['Routes and prices in plain words', 'One-tap WhatsApp and call', 'Reviews up front', 'Fast on mobile data'],
           f'Usually a landing page: {LANDING}, live in under 2 weeks.')],
       ('Hindi and English? Tap to switch.', 'हिंदी', 'hi', ('Book your stay directly', 'Breakfast on the rooftop'), ('सीधे अपना कमरा बुक करें', 'छत पर नाश्ता')),
       ['Jaipur studios’ own pages (seen November 2026) list a 5-page site at ₹9,000 and custom sites from ₹22,000–₹25,000. With U Scale, a landing page '
        f'is {LANDING}, a 5–10 page business site {BIZ} and an online store from {STORE}, fixed in writing.',
        ('My guests are tourists. What should my website do?',
         'Answer in English first: rooms or products, prices, location and how to book. Jaipur recorded 2,56,293 foreign tourist visits from January to '
         'June 2026, the most of any city in Rajasthan, and visitors book the place that answers quickly. A “Check availability on WhatsApp” button helps.'),
        ('Should my Jaipur website be in Hindi?',
         'Hindi was the first language of about 46% of Jaipur district in the 2011 Census, with Rajasthani next. Lead in English if you serve tourists, '
         f'and add Hindi for local customers. I build Hindi pages from your own text; writing the copy is {COPY}.')],
       ['jpr-p1', 'jpr-p2', 'jpr-p3', 'jpr-tour', 'jpr-lang', 'local-rank']),
]


# ---------------------------------------------------------------- each city's own answers to the three questions every city page asks
# (they were word for word the same on all nine pages)
_SAFE = {
    'pune': 'Pune buyers compare quotes hard, so here is the deal in writing before any work starts: a fixed price, 20% to start, 20% when you approve '
            'the design on your phone, and 60% only when the site is live. The domain is registered in your name from day one, and every login is handed '
            'over at launch, so you never pay for work you haven’t seen.',
    'bengaluru': 'You never pay for what you haven’t seen. The scope and price are written down first; then it is 20% to start, 20% once you approve the '
                 'screens in Figma, and the last 60% when the site is live. The domain, hosting and code are in your company’s name, not mine.',
    'chennai': 'The terms are the same for every client, near or far: a written scope and fixed price, then 20% to start, 20% after you approve the '
               'design, and 60% when the site is live. You can follow every step on WhatsApp and video calls, and the domain and logins are yours from the start.',
    'delhi-ncr': 'Distance doesn’t change the terms. You get the scope and a fixed price in writing, pay 20% to start and 20% on design approval, and '
                 'keep 60% until the site is live. Your firm owns the domain, the code and every login, so nothing is held back at the end.',
    'hyderabad': 'Yes, if the money follows the work. With U Scale you pay 20% to start, 20% when you approve the design and 60% only after launch, '
                 'against a scope and price written down first. The domain is registered in your name and all logins come to you at launch.',
    'kolkata': 'Pay in three steps, each after you see progress: 20% to start, 20% when you have approved the design, and 60% when the site is live. '
               'The price is fixed in writing before work begins, and the domain and logins are in your name, so the site is yours whoever maintains it.',
    'ahmedabad': 'Treat it like any supplier: terms in writing first. The price is fixed before work starts; you pay 20% to start, 20% on design '
                 'approval and the balance 60% only when the site is live. Domain and logins are in your firm’s name from day one.',
    'surat': 'The terms are written down before work starts: a fixed price, 20% advance, 20% when you approve the design and 60% on launch, the way '
             'traders like to settle against delivery. The domain is booked in your name, and you get every login when the site goes live.',
    'jaipur': 'Most of the payment comes after you see the result: 20% to start, 20% when you approve the design, and 60% once the site is live. '
              'The scope and price are agreed in writing first, and your domain, booking pages and logins stay in your name.',
}
_RANK = {
    'pune': 'Yes. For a search in Kothrud or Hinjewadi, Google weighs how relevant, how close and how well known your business is, and the distance it '
            'measures is between your business and the searcher, not your designer. Name your Pune areas and services on your site and your Google listing, '
            'keep them identical, and collect reviews from Pune customers.',
    'delhi-ncr': 'Yes, for searches near your office. NCR is several cities, and a search in Noida mostly shows Noida businesses. Google measures distance '
                 'from your business to the person searching, not from your designer, so name the city and sector you serve on your site and your listing.',
    'hyderabad': 'Yes. The distance Google weighs is between your business and the person searching in Hyderabad, not your designer in Mumbai. Name '
                 'your area, whether Banjara Hills or Gachibowli, on your site and your listing, keep the two identical, and build genuine reviews.',
    'kolkata': 'Yes. Google judges relevance, distance and prominence, and distance runs from your shop to the person searching in Kolkata. Name your '
               'neighbourhood, Gariahat or Salt Lake, on your site and listing, and the same Bengali or English name everywhere.',
    'ahmedabad': 'Yes. What Google measures is the distance between your business and the buyer searching in Ahmedabad, not where your designer sits. '
                 'Name your area, from the old city to SG Highway, the same way on your site and your Google listing, and earn reviews from local buyers.',
    'surat': 'Yes. Google ranks local results by relevance, distance and prominence, and distance is from your shop to the buyer, not from your '
             'designer. Name your market and area, a Ring Road textile market or Varachha, exactly as buyers search for it, on your site and your listing.',
    'jaipur': 'Yes. Travellers search from their phones, often near you, and Google measures distance from your property to them, not to your '
              'designer. Name your area, C-Scheme or the walled city, on your site and listing, and keep the same name on booking sites.',
}
_MAPS = {
    'pune': 'Claim and verify your Google Business Profile with your exact Pune address, or set Pune and Pimpri-Chinchwad as service areas if you '
            'travel to customers. Pick the most specific category, add timings and real photos, and ask every happy customer for a review. Use the same '
            'name and phone on Justdial and IndiaMART.',
    'bengaluru': 'If customers visit you, verify a Google Business Profile at your exact address, in Indiranagar or Whitefield or wherever you are. '
                 'Google’s guidelines leave out businesses that only work online, so a SaaS company may not need one. Choose the most specific category, '
                 'keep hours and photos current, and reply to every review.',
    'chennai': 'Verify your Google Business Profile at your exact Chennai address, from T. Nagar to OMR, with the name exactly as it is on your board, '
               'in English or Tamil. Pick the most specific category, add hours, photos and services, and ask for a review after each visit.',
    'delhi-ncr': 'Verify one Google Business Profile at your real office address in Delhi, Gurugram or Noida, and pick the most specific category, '
                 'like “Chartered accountant”. If you visit clients across NCR, add the cities you cover as service areas. Keep timings, photos '
                 'and services complete, and reply to every review.',
    'hyderabad': 'Verify your Google Business Profile at the exact address, with the locality people know, like Madhapur or Kukatpally. Choose the '
                 'most specific category, for a lab “Medical laboratory”, add hours, home-collection areas and photos, and ask patients for reviews.',
    'kolkata': 'Verify your Google Business Profile with your shop’s exact address and the name on your signboard. Add opening hours, festival hours '
               'before Durga Puja, photos of what you sell, and reply to reviews in the language the customer used.',
    'ahmedabad': 'Verify your Google Business Profile with the exact address, and if your shop is in a busy old-city lane, place the pin carefully '
                 'and describe how to find you. Pick the most specific category, add photos of your range, and ask regular buyers for reviews.',
    'surat': 'Verify your Google Business Profile with the market name, floor and shop number in the address, so buyers reach the right shop in a big '
             'market. Add your categories, photos of your range and timings, and ask regular buyers to leave a review.',
    'jaipur': 'Verify your Google Business Profile with the exact location, pinned where guests actually arrive. Add photos of rooms or pieces, '
              'opening hours and the languages you speak, and reply to every review, because travellers read them closely.',
}


def _uniquify():
    extra = {
        'ahmedabad': ('Can my website help me sell to buyers outside Gujarat?',
                      'Yes. Buyers in other states search in English for what you make, like “cotton fabric manufacturer Ahmedabad”, so a page for each '
                      'range, with photos, minimum order and a WhatsApp button, is what they find and trust. Keep the same firm name and phone on '
                      'IndiaMART and your Google listing.'),
        'hyderabad': ('Should my lab or clinic show test prices online?',
                      'It helps. Patients compare labs on their phones before they book, so clear prices for common tests and packages, the areas you '
                      'collect from and when reports arrive answer their first questions. The prices online must match what you charge at the counter.'),
        'kolkata': ('Can my sweet shop take festival and wedding orders online?',
                    'Yes. A page for festival and wedding orders, with boxes, quantities and an “Order on WhatsApp” button, lets customers book ahead for '
                    'Durga Puja, Bijoya and weddings, and you confirm each order in the chat.'),
        'jaipur': ('Can guests book directly on my website?',
                   'Yes, as a direct enquiry: guests pick dates, the number of people and a room, and the details arrive on your WhatsApp for you to '
                   'confirm. A full booking engine with live availability is a bigger project, priced after the free audit.'),
    }
    for p in CITIES:
        if p['slug'] in extra and extra[p['slug']] not in p['faq']:
            p['faq'] = list(p['faq']) + [extra[p['slug']]]
    more = {'ahmedabad': ('Do you work with businesses in Gandhinagar?',
                          'Yes, remotely and at the same prices. Gandhinagar and Ahmedabad customers search by their own city names, so if you serve both, '
                          'say so on your website, and if you visit customers there, list both as service areas on your Google listing.'),
            'hyderabad': ('Do you work with businesses in Secunderabad?',
                          'Yes, remotely and at the same prices. People search “Secunderabad” and “Hyderabad” separately, so name the side of the city you '
                          'are on, and the localities you serve, in your listing and on your pages.')}
    for p in CITIES:
        k = p['slug']
        if k in more and more[k] not in p['faq']: p['faq'] = list(p['faq']) + [more[k]]
        faq = []
        for q, a in p['faq']:
            if q.startswith('Is it safe to pay') and k in _SAFE: a = _SAFE[k]
            elif q.startswith('Will my website rank') and k in _RANK: a = _RANK[k]
            elif 'on Google Maps?' in q and k in _MAPS: a = _MAPS[k]
            faq.append((q, a))
        p['faq'] = faq


_uniquify()
