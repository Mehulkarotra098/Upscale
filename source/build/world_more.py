"""Pages for clients abroad, part 2: the hub, white label, Figma to code, and three trades that sell abroad
(Indian restaurants, Indian fashion labels, independent hotels). Shared parts and the country pages are in world_pages.py."""
import aeo
import geo_pages as GP
import world_pages as WP
import depth_art as DA
import pricing_data as PD
from geo_pages import icon, price, e
from world_pages import (COUNTRIES, LANDING, BIZ, BLOG, STORE, STORE_BIG, REST, CARE, HUB, TRAIL, TEAM, PAY_ROUTE, fx, overlap, our_day, _segs,
                         seal, sec, trust, price_cards, rules_html, hundred, work_sec, process_sec)


# ================================================================ shared widgets for the hub and the trade pages
# The cheapest local price for a 5–10 page business site in each currency, from the country pages' own sources.
LOCAL = {'GBP': ('A UK freelancer', 800, 'uk-a9'), 'USD': ('A US freelancer', 1500, 'us-jim'), 'AUD': ('An Australian studio', 2000, 'au-wtd'),
         'CAD': ('A Canadian freelancer', 1500, 'ca-marvel'), 'NZD': ('A New Zealand studio', 1500, 'nz-kiwi'), 'SGD': ('A Singapore studio', 3000, 'sg-mt'),
         'EUR': ('An Irish studio', 1500, 'ie-vimar'), 'AED': ('A Dubai agency', 5000, 'ae-2m')}


def _vs(c):
    who, lo, src = LOCAL[c]
    ours = PD.fx_amount(GP.rupees(BIZ), c)
    s = PD.FX[c][0]
    return (f'<div class="fxs__v fxs__v--{c.lower()}"><p class="fxs__vk">The same 5–10 page site</p>'
            f'<p class="fxs__vb"><span>{e(who)}, from</span><i style="--w:100%"></i><b>{e(s)}{lo:,}</b></p>'
            f'<p class="fxs__vb fxs__vb--us"><span>U Scale, fixed</span><i style="--w:{ours / lo * 100:.1f}%"></i><b>{e(s)}{ours:,}</b></p>'
            f'<p class="fxs__vd"><b>{e(s)}{lo - ours:,}</b> less than the cheapest local option we found.</p>'
            + (f'<p class="fxs__vn">Template shops in Dubai start at AED 999, below us. We win on custom design and hand-written code.</p>' if c == 'AED' else '')
            + f'{GP.src_chip(src)}</div>')


def cur_switch(items, curs=('USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'AED', 'NZD'), sid='cur', inr=False, vs=False):
    """Prices in every currency, switched with radio buttons (no JavaScript needed). items: [(label, pricing name, note)]."""
    curs = (('INR',) if inr else ()) + tuple(curs)
    sym = lambda c: '₹' if c == 'INR' else PD.FX[c][0]
    val = lambda name, c: price(name).replace('from ', '') if c == 'INR' else fx(name, c)
    radios = ''.join(f'<input class="fxs__r" type="radio" name="{sid}" id="{sid}-{c.lower()}" value="{c}"{" checked" if i == 0 else ""}>' for i, c in enumerate(curs))
    labels = ''.join(f'<label for="{sid}-{c.lower()}">{e(sym(c).strip())}<span>{e(c)}</span></label>' for c in curs)
    panels = ''
    for c in curs:
        li = ''.join(f'<li style="--i:{i}"><span>{e(lbl)}<small>{e(note)}</small></span><b>{e(val(name, c))}'
                     f'{"<small> onwards</small>" if name in (STORE, STORE_BIG) else "<small> a month</small>" if "/mo" in price(name) else ""}</b></li>'
                     for i, (lbl, name, note) in enumerate(items))
        panels += f'<ul class="fxs__p fxs__p--{c.lower()}" aria-label="Prices in {e(c)}">{li}</ul>'
    css = ''.join(f'#{sid}-{c.lower()}:checked~.fxs__tabs label[for={sid}-{c.lower()}]{{background:var(--violet);color:#fff}}'
                  f'#{sid}-{c.lower()}:checked~.fxs__ps .fxs__p--{c.lower()}{{display:grid}}'
                  f'#{sid}-{c.lower()}:focus-visible~.fxs__tabs label[for={sid}-{c.lower()}]{{outline:3px solid var(--green);outline-offset:2px}}' for c in curs)
    side = ''
    if vs:
        side = '<div class="fxs__vs" aria-live="polite">' + ''.join(_vs(c) for c in curs if c in LOCAL) + '</div>'
        css += ''.join(f'#{sid}-{c.lower()}:checked~.fxs__vs .fxs__v--{c.lower()}{{display:grid}}' for c in curs if c in LOCAL)
    html = (f'<div class="fxs{" fxs--vs" if vs else ""}" data-reveal data-fxs>{radios}<div class="fxs__tabs" role="group" aria-label="Currency">{labels}</div>'
            f'<div class="fxs__ps">{panels}</div>{side}<p class="fxs__geo" data-geo hidden></p><style>{css}</style></div>')
    text = '\n'.join(f'- {lbl}: ' + ', '.join(val(name, c) for c in curs) for lbl, name, _ in items)
    return html, text


def country_grid():
    """Hub: one card per country with its price, currency and the hours we share."""
    li = ''
    for i, p in enumerate(COUNTRIES):
        ov = overlap(p['utc'])
        segs = ''.join(f'<i style="--x:{x / 24 * 100:.1f}%;--w:{(y - x) / 24 * 100:.1f}%"></i>' for x, y in _segs(*our_day(p['utc'])))
        li += (f'<li style="--i:{i}" data-reveal data-cur="{p["cur"]}" data-tz="{p["tz"]}"><a class="cg__c" href="/{p["path"]}"><span class="cg__cur">{e(p["cur"])}</span><b>{e(p["short"])}</b>'
               f'<span class="cg__p">{e(fx(BIZ, p["cur"]))}<small>5–10 page site</small></span>'
               f'<span class="cg__h" aria-hidden="true"><span class="cg__you"></span>{segs}</span>'
               f'<span class="cg__o">{icon("clock")}{e(f"{ov:g} shared hours" if ov else "We work while you sleep")}</span>{icon("arrow")}</a></li>')
    return (f'<ul class="cg" data-reveal-group>{li}</ul>',
            '\n'.join(f'- {p["short"]}: business site {fx(BIZ, p["cur"])}; {overlap(p["utc"]):g} shared working hours' for p in COUNTRIES))


def steps_html(steps, img=None):
    """A process line like the city pages' timeline: (icon, title, when, chip label, chip value)."""
    li = ''.join(f'<li style="--i:{i}"><span class="tl__dot">{icon(ic)}</span><span class="tl__t"><b>{e(t)}</b><small>{e(w)}</small></span>'
                 f'<em><small>{e(k)}</small>{e(v)}</em></li>' for i, (ic, t, w, k, v) in enumerate(steps))
    pic = ''
    if img:
        im = GP.IMG[img]
        pic = (f'<figure class="tlw__img fp-shot" data-reveal><div class="fp-shot__stage">{GP._pic(im, "(max-width: 899px) 92vw, 560px")}</div>'
               f'<figcaption>{e(im["caption"])}</figcaption></figure>')
    return f'<div class="tlw{"" if img else " tlw--solo"}"><ol class="tl" data-reveal>{li}</ol>{pic}</div>', '; '.join(f'{t} ({w})' for _, t, w, _, _ in steps)


def features(items):
    """Cards with an icon that gets its check mark: what the site does. (icon, title, text)."""
    return rules_html([(ic, t, x, '') for ic, t, x in items])


def page_dict(**kw):
    kw.setdefault('trail', TRAIL)
    kw.setdefault('lang', 'en')
    kw.setdefault('path', 'services/' + kw['slug'])
    return kw


# ================================================================ hero cards
def board_card(p):
    """Hub hero: a departures board of the nine countries: currency, the 5–10 page price and the hours we share. The letters flip in."""
    def flaps(s, cls=''):
        return f'<span class="fb__f{cls}">' + ''.join(f'<i style="--k:{k}">{e(ch)}</i>' for k, ch in enumerate(s)) + '</span>'
    rows = ''
    for r, c in enumerate(COUNTRIES):
        ov = overlap(c['utc'])
        rows += (f'<li style="--r:{r}">{flaps(c["city"].upper())}{flaps(c["cur"], " fb__f--c")}'
                 f'{flaps(fx(BIZ, c["cur"]).replace("AED ", "").rjust(8), " fb__f--p")}{flaps((f"{ov:g}H" if ov else "NIGHT").rjust(5), " fb__f--h")}</li>')
    card = (f'<div class="dk__card fb"><p class="fb__head"><span>{icon("plane")}From Mumbai</span></p>'
            f'<ul class="fb__rows">{rows}</ul><p class="fb__foot">{icon("check")}A 5–10 page site in each currency · H: working hours we share</p></div>')
    return DA._dk('board', card, DA._float('dk-seal', seal('$'), 110, 0), sheets=1,
                  label='A board of nine countries with the price of a 5–10 page site in each currency and the working hours we share')


def label_card(p):
    """White label hero: the studio's credit fades out and the agency's name stamps in."""
    card = ('<div class="dk__card wl"><p class="wl__bar"><i></i><i></i><i></i><b>client-site.com</b></p>'
            '<div class="wl__page"><span class="wl__h"></span><span class="wl__l" style="--w:70%"></span><span class="wl__l" style="--w:52%"></span>'
            '<span class="wl__btn"></span><span class="wl__img"></span></div>'
            '<p class="wl__foot"><span class="wl__old">Designed by U Scale</span><span class="wl__new">Built by <b>Your Agency</b></span></p></div>')
    floats = (DA._float('dk-chip wl__chip', f'{icon("shield")}NDA signed', 120, 0)
              + DA._float('dk-chip wl__chip wl__chip--b', f'{icon("tag")}{e(fx(BIZ, "USD"))} a site, fixed', 90, 1))
    return DA._dk('label', card, floats, sheets=2, label='A client website whose footer credit changes from U Scale to your agency')


def figma_card(p):
    """Figma to code hero: a design frame and its layers on one side, the code typing itself on the other."""
    code = ['<span class="k">&lt;header</span> <span class="a">class</span>=<span class="s">"hero"</span><span class="k">&gt;</span>',
            '  <span class="k">&lt;h1&gt;</span>Fresh bread, daily<span class="k">&lt;/h1&gt;</span>',
            '  <span class="k">&lt;a</span> <span class="a">href</span>=<span class="s">"/order"</span><span class="k">&gt;</span>Order<span class="k">&lt;/a&gt;</span>',
            '<span class="k">&lt;/header&gt;</span>']
    lines = ''.join(f'<span style="--i:{i}">{l}</span>' for i, l in enumerate(code))
    card = ('<div class="dk__card fg"><div class="fg__design"><p class="fg__tab">Design</p><ul class="fg__layers"><li>Home</li><li>Hero</li><li class="is-on">Button</li><li>Image</li></ul>'
            '<div class="fg__frame"><span class="fg__h"></span><span class="fg__l"></span><span class="fg__b"></span><span class="fg__sel"></span></div></div>'
            f'<div class="fg__code"><p class="fg__tab">Code</p><pre>{lines}<i class="fg__cur"></i></pre></div></div>')
    floats = (DA._float('dk-chip fg__chip', f'{icon("check")}Checked at 16 screen sizes', 120, 0)
              + DA._float('dk-chip fg__chip fg__chip--b', f'{icon("code")}No page builder', 90, 1))
    return DA._dk('figma', card, floats, sheets=2, label='A Figma design and the hand-written code it becomes')


def menu_card(p):
    """Indian restaurants abroad: a phone menu with prices in pounds and a direct order button. The restaurant is fictional."""
    dishes = [('Chicken biryani', 'Hyderabadi dum, raita', '£13.50'), ('Masala dosa', 'Potato masala, sambar', '£9.95'),
              ('Paneer tikka', 'Charcoal grill, mint chutney', '£8.50'), ('Mango lassi', 'Alphonso', '£3.95')]
    li = ''.join(f'<li style="--i:{i}"><span><b>{e(n)}</b><small>{e(d)}</small></span><em>{e(pr)}</em><i aria-hidden="true">+</i></li>' for i, (n, d, pr) in enumerate(dishes))
    card = (f'<div class="dk__card mn"><p class="mn__top"><b>Saffron Lane</b><small>Indian kitchen · sample design</small></p>'
            f'<p class="mn__tabs"><span class="is-on">Mains</span><span>Starters</span><span>Drinks</span></p><ul class="mn__list">{li}</ul>'
            f'<p class="mn__go">{icon("cart")}Order for collection · £35.90</p></div>')
    floats = (DA._float('dk-chip mn__chip', f'{icon("check")}Orders come straight to you', 120, 0)
              + DA._float('dk-chip mn__chip mn__chip--b', f'{icon("pin")}On Google Maps', 90, 1))
    return DA._dk('menu', card, floats, sheets=2, label='A sample menu page for a fictional Indian restaurant, Saffron Lane, with prices in pounds and an order button')


def fashion_card(p):
    """Indian fashion labels: one product, its price shown in rupees, pounds and dollars in turn, and worldwide shipping."""
    card = ('<div class="dk__card fs"><div class="fs__img"><span class="fs__drape"></span><span class="fs__tag">New</span></div>'
            '<p class="fs__n"><b>Chanderi kurta set</b><small>Handwoven · made to measure · sample</small></p>'
            '<p class="fs__p"><span style="--i:0">₹8,450</span><span style="--i:1">£79</span><span style="--i:2">$99</span></p>'
            f'<p class="fs__go">{icon("cart")}Add to bag</p></div>')
    floats = (DA._float('dk-chip fs__chip', f'{icon("plane")}Ships worldwide', 120, 0)
              + DA._float('dk-chip fs__chip fs__chip--b', f'{icon("globe")}₹ · £ · $', 90, 1))
    return DA._dk('fashion', card, floats, sheets=2, label='A sample product page for a kurta set, priced in rupees, pounds and dollars, shipping worldwide')


def hotel_card(p):
    """Independent hotels: a direct booking box on the hotel's own site. The hotel is fictional."""
    card = (f'<div class="dk__card ht"><p class="ht__top"><b>The Pines Inn</b><small>Independent · sample design</small></p>'
            '<div class="ht__dates"><span><small>Check in</small><b>Fri 12</b></span><span><small>Check out</small><b>Sun 14</b></span><span><small>Guests</small><b>2</b></span></div>'
            '<ul class="ht__rooms"><li style="--i:0"><b>King room</b><em>$129</em></li><li style="--i:1"><b>Two queens</b><em>$139</em></li></ul>'
            f'<p class="ht__go">{icon("calendar")}Book direct</p></div>')
    floats = (DA._float('dk-chip ht__chip', f'{icon("check")}Your booking engine', 120, 0)
              + DA._float('dk-chip ht__chip ht__chip--b', f'{icon("users")}Accessible rooms listed', 90, 1))
    return DA._dk('hotel', card, floats, sheets=2, label='A direct booking box on a sample independent hotel website, The Pines Inn')


# ================================================================ the hub
def _hub():
    curs = [(LANDING, 'Single page', 'One page that sells'), (BIZ, 'Business site', '5–10 pages'), (BLOG, 'Bigger site + blog', '10–20 pages'),
            (STORE, 'Online store', 'Under 50 products'), (CARE, 'Care plan', 'Updates, backups, security')]
    return page_dict(
        slug='outsource-web-design-india', trail=[('Services', '/services')], crumb='Clients abroad',
        service='Web design and development for businesses outside India', countries=[c['name'] for c in COUNTRIES],
        title='Outsource Web Design to India: Fixed Prices in $, £, € | U Scale',
        desc=f'A Mumbai studio that hand-codes websites for businesses in the UK, US, Australia and six more countries. From {fx(LANDING, "USD")}, fixed in your currency.',
        h1='Web design from India, priced in your currency', eyebrow='For businesses outside India',
        lead='A studio in Mumbai that designs and hand-codes websites for businesses in nine countries. One price list, fixed in your currency. You pay most of it after launch.',
        stats=[(fx(LANDING, 'USD'), 'Websites from'), ('8', 'Currencies'), ('60%', 'Paid after launch')], art=__import__('world_art').hub_clocks, hero_more=('#countries', 'Find your country'),
        wa="Hi Mehul, my business is outside India. I'd like a free audit and a price in my currency.",
        og_alt='Web design from India for businesses abroad, by U Scale: one price list in eight currencies',
        offers=[(LANDING, 'USD'), (BIZ, 'USD'), (BLOG, 'USD'), (STORE, 'USD'), (LANDING, 'GBP'), (BIZ, 'GBP'), (LANDING, 'EUR'), (BIZ, 'EUR'),
                ('Technical + on-page SEO', 'USD'), ('Local SEO / Google Business Profile', 'USD'), ('AI search visibility (GEO)', 'USD'), ('Ads management', 'USD')],
        blocks=[
            sec('trust', 'Why it’s safe', 'Safe to pay a studio on the other side of the world.', '', WP.with_review(trust('USD', '.com'))),
            work_sec(),
            sec('prices', 'One price list', 'Pick your currency.', 'The same work and the same price everywhere, converted and rounded. Fixed in writing.',
                cur_switch([(t, n, d) for n, t, d in curs], vs=True)),
            sec('monthly', 'Monthly work', 'SEO, ads and AI search, by the month.', 'The same monthly prices as in India, converted. Three months minimum, then month to month.',
                cur_switch([('Technical and on-page SEO', 'Technical + on-page SEO', 'Speed, page titles and fixes'),
                            ('Local SEO', 'Local SEO / Google Business Profile', 'Google Business Profile and local rankings'),
                            ('AI search visibility', 'AI search visibility (GEO)', 'How ChatGPT, Gemini and Google’s AI describe you'),
                            ('Ads management', 'Ads management', 'Google and Meta; ad spend paid to them directly')], sid='mo')),
            sec('countries', 'Nine countries', 'Find your country.', 'Each page has local prices to compare, the hours we share and the rules your site has to meet.', country_grid(), tone='band'),
            process_sec(),
            sec('more', 'Other ways we help', 'For agencies, designers and owners abroad.', '', (GP.render(GP.Links([
                ('/services/white-label-web-design', 'tag', 'White label for agencies', 'We build, you deliver under your brand. NDA first.', f'From {fx(LANDING, "USD")} a site'),
                ('/services/figma-to-code', 'code', 'Figma to code', 'Your design, hand-coded to match at every screen size.', f'From {fx(LANDING, "USD")}'),
                ('/services/website-design-for-indian-restaurants', 'menu', 'Indian restaurants', 'Menus, your own online ordering and bookings.', f'{fx(REST, "GBP")} · {fx(REST, "USD")}'),
                ('/services/website-design-for-independent-hotels', 'bed', 'Independent hotels', 'Direct-booking websites for owner-run hotels and motels.', f'From {fx(LANDING, "USD")}'),
                ('/services/website-design-for-indian-fashion-brands', 'store', 'Indian fashion labels', 'Online stores that sell to the diaspora, in their currency.', f'From {fx(STORE, "USD")}'),
                ('/services/whatsapp-chatbot', 'bot', 'AI chatbots and automation', 'Built by our sister company, Apex36.', 'Quoted after a call')])),
                'White label for agencies; Figma to code; Indian restaurants; independent hotels; Indian fashion labels; AI chatbots and automation built by Apex36.')),
        ],
        answer=(f'U Scale is a web design studio in Mumbai, India, that designs and hand-codes websites for businesses in the UK, US, Australia, Canada, '
                f'Singapore, the UAE, Ireland, New Zealand and the Netherlands. Prices are fixed in your currency: in US dollars, a landing page is '
                f'{fx(LANDING, "USD")}, a 5–10 page business site {fx(BIZ, "USD")} and an online store from {fx(STORE, "USD")}. You pay 20% to start, 20% on '
                'design sign-off and 60% at launch, by bank transfer in your own currency, and you own the domain, code and logins.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Based in', 'Mumbai, India. No offices abroad: projects run over WhatsApp, email and video calls'),
               ('Prices in US dollars', f'Landing page {fx(LANDING, "USD")} · 5–10 pages {fx(BIZ, "USD")} · 10–20 pages with a blog {fx(BLOG, "USD")} · online store from {fx(STORE, "USD")} · care plan {fx(CARE, "USD")} a month'),
               ('Monthly work (USD)', f'Technical SEO {fx("Technical + on-page SEO", "USD")} · local SEO {fx("Local SEO / Google Business Profile", "USD")} · AI search visibility {fx("AI search visibility (GEO)", "USD")} · ads management {fx("Ads management", "USD")}, a month'),
               ('Currencies', 'US, Australian, Canadian, Singapore and New Zealand dollars, pounds, euros and dirhams'),
               ('How prices are set', f'Our rupee prices, converted at the rates of {PD.FX_DATE} and rounded'),
               ('Payment', f'20% to start, 20% on design sign-off, 60% on launch, by {PAY_ROUTE.split(", so")[0]}'),
               ('Working hours', '10:00–19:00 in Mumbai (UTC+5:30)'),
               ('You own', 'Your domain, hosting, code, design files and every login')],
        faq=[('How much does it cost to outsource a website to India?',
              f'With us, a landing page is {fx(LANDING, "USD")}, a 5–10 page business site {fx(BIZ, "USD")}, a 10–20 page site with a blog {fx(BLOG, "USD")} '
              f'and an online store from {fx(STORE, "USD")}, fixed in writing. The same prices are on this page in pounds, euros, Australian, Canadian, '
              'Singapore and New Zealand dollars and dirhams.'),
             ('Why are your prices so much lower than local studios?',
              'They are our Indian prices, converted. Rent, salaries and living costs in Mumbai are a fraction of London’s or Sydney’s, and we pass that on '
              'instead of charging what the market abroad would bear. The work is the same: designed for you in Figma, hand-coded, tested on real phones.'),
             ('Who actually does the work?', TEAM + ' Nothing is handed to freelancers you have never heard of.'),
             ('How do I pay, and is it safe?',
              f'By {PAY_ROUTE}. You pay 20% to start, 20% when you approve the design and 60% when the site is live, so most of the money moves only after '
              'you have seen the finished site working.'),
             ('How do we work across time zones?',
              'Mostly in writing, on WhatsApp and email, with a video call at the start and at each design review. With the UK, Ireland, the Netherlands, '
              'Singapore and the UAE we share several working hours. For the US, Canada and New Zealand, we work while you sleep: send feedback at the end '
              'of your day and the changes are usually ready by morning.'),
             ('Who owns the website?',
              'You do. The domain and hosting are in your name from the start, and you get the code, the design files and every login at launch. We sign '
              'your NDA before you share anything, if you want one.'),
             ('What happens after launch?',
              f'Every site has a 15–30 day bug-fix window. After that, the optional care plan covers updates, backups and security for {fx(CARE, "USD")} a '
              'month, or you look after the site yourself: it is hand-written code with no plugins to update.')],
        sources=['wise-in', 'utc'],
        related=[('/services/website-design-uk', 'Country', 'Website design for UK businesses', 'Fixed £ prices and 4.5 shared hours.'),
                 ('/services/website-design-usa', 'Country', 'Website design for US small businesses', 'Fixed $ prices; we work while you sleep.'),
                 ('/services/white-label-web-design', 'For agencies', 'White label web design', 'Your brand, our build, NDA first.'),
                 ('/services/figma-to-code', 'Service', 'Figma to code', 'Your design, hand-coded.'),
                 ('/services/whatsapp-chatbot', 'AI', 'WhatsApp chatbot for business', 'Built by our sister company, Apex36.')],
        cta_lead='Tell us where you are and what you need. We reply within one working day, usually much faster on WhatsApp.',
        foot_card=('/pricing', 'Prices in rupees', 'See the full Indian price list'),
        card='One price list in eight currencies, for nine countries.')


# ================================================================ white label
def _white_label():
    cards = [('Landing page', LANDING, False, 'One page for a launch, a campaign or a small client.', 'In under 2 weeks', 'a white-label landing page'),
             ('Business site', BIZ, False, '5–10 pages, designed to your brief or built from your Figma.', 'In 3–4 weeks', 'a white-label 5–10 page site'),
             ('Bigger site + blog', BLOG, False, '10–20 pages with a blog your client can edit.', '', 'a white-label 10–20 page site'),
             ('Online store', STORE, True, 'Up to 50 products, a cart and card payments.', '', 'a white-label online store')]
    pc = price_cards('USD', 'For comparison, white-label partners charge agencies $500–$5,000 a site (10Web), a flat $999 (Fryloop) or $2,500–$5,000 for a '
                     'theme-based WordPress site (Web Help Agency).', '', cards=cards,
                     note='Per site, fixed in writing before we start. You set your own price to your client. No tax is added to our invoice.')
    return page_dict(
        slug='white-label-web-design', crumb='White label', service='White label web design and development for agencies', service_type='White label web design',
        countries=['United States', 'United Kingdom', 'Australia', 'Canada'],
        title=f'White Label Web Design for Agencies, from {fx(LANDING, "USD")} a Site | U Scale',
        desc=f'White label web design for agencies: a fixed price per site from {fx(LANDING, "USD")}, your brand on everything, an NDA first, and no contact with your client.',
        h1='White label web design for agencies', eyebrow='For agencies',
        lead='We design and hand-code the sites; you deliver them under your name. A fixed price per site, an NDA before the brief, and we never contact your client.',
        stats=[(fx(BIZ, 'USD'), '5–10 page site'), ('NDA', 'Before the brief'), ('0', 'Contact with your client')], art=label_card,
        wa="Hi Mehul, I run an agency and I'm looking for a white-label web design partner. Can we talk?", hero_btn='Talk on WhatsApp',
        og_alt=f'White label web design for agencies by U Scale: from {fx(LANDING, "USD")} a site, NDA first',
        offers=[(LANDING, 'USD'), (BIZ, 'USD'), (BLOG, 'USD'), (STORE, 'USD')],
        blocks=[
            sec('trust', 'Why agencies trust it', 'Your client stays yours.', '', WP.with_review(trust('USD', '.com', keys=('nda', 'fix', 'code', 'pay')))),
            work_sec(h='Work we can show. Yours we never will.', lead='White-label sites never appear in our portfolio. These are our own clients.'),
            sec('prices', 'Per site, fixed', 'One price per site. You set the markup.', '', pc),
            sec('process', 'How it works', 'From your brief to your launch.', '', steps_html([
                ('shield', 'NDA, then the brief', 'Day 1: we sign first', 'Cost', 'Free'),
                ('file', 'Written scope and price', 'Day 2: pages, dates, price', 'Pay', '20%'),
                ('pen', 'Design in Figma', 'Weeks 1–2: in your Figma or ours', 'Pay', '20%'),
                ('code', 'Hand-coded and tested', 'Weeks 2–3: 16 screen sizes', 'Check', 'QA'),
                ('check', 'Handover under your brand', 'Weeks 3–4: files, code, logins', 'Pay', '60%')]), tone='band'),
            sec('yours', 'What stays yours', 'Your brand. Your client. Your price.', '', features([
                ('tag', 'Your brand', 'No “Designed by U Scale” in the footer, the code or the file names.'),
                ('users', 'Your client', 'We never contact them, and we put that in writing, with a no-poaching clause.'),
                ('file', 'Your files', 'Figma, code and every login, handed to you at the end.'),
                ('chat', 'Your channel', 'We talk to you only, on Slack, WhatsApp or email.')])),
        ],
        answer=(f'U Scale is a web design studio in Mumbai that designs and hand-codes websites for agencies to deliver under their own brand. Each site has a '
                f'fixed price: {fx(LANDING, "USD")} for a landing page, {fx(BIZ, "USD")} for a 5–10 page site, {fx(BLOG, "USD")} for 10–20 pages with a blog and '
                f'from {fx(STORE, "USD")} for an online store. We sign an NDA before the brief, never contact the end client, and keep white-label work out of our portfolio.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team').replace('is the person you talk to', 'is your contact')),
               ('Price per site (USD)', f'Landing page {fx(LANDING, "USD")} · 5–10 pages {fx(BIZ, "USD")} · 10–20 pages with a blog {fx(BLOG, "USD")} · online store from {fx(STORE, "USD")}'),
               ('Also priced in', f'Pounds ({fx(BIZ, "GBP")}), euros ({fx(BIZ, "EUR")}), Australian dollars ({fx(BIZ, "AUD")}) and Canadian dollars ({fx(BIZ, "CAD")}) for a 5–10 page site'),
               ('Confidentiality', 'NDA before the brief; no contact with your client; no credit on the site; never shown in our portfolio'),
               ('Payment', f'20% to start, 20% on design sign-off, 60% on handover, by {PAY_ROUTE.split(", so")[0]}'),
               ('Design', 'To your brief, or built from your own Figma file'),
               ('Hand-off', 'Code, design files and every login, at the end of each project')],
        faq=[('What does white label web design mean?',
              'We design and build the website, and you sell and deliver it to your client as your own work. Your client sees your agency’s name, not ours, '
              'and we only ever talk to you.'),
             ('How much do you charge agencies?',
              f'A fixed price per site: {fx(LANDING, "USD")} for a landing page, {fx(BIZ, "USD")} for 5–10 pages, {fx(BLOG, "USD")} for 10–20 pages with a '
              f'blog and from {fx(STORE, "USD")} for an online store. You set your own price to the client. For comparison, published white-label '
              'prices run from about $500 to $5,000 a site.'),
             ('Will you ever contact my client?',
              'No. We sign your NDA before you share the brief, add a no-poaching clause to our agreement, and talk only to you. White-label work never appears '
              'in our portfolio or on our social media.'),
             ('Can you build from our designs?',
              'Yes. Send the Figma file and we hand-code it to match at every screen size. Or we design it to your brief in your Figma workspace, so the files '
              'stay with you.'),
             ('What do you build with?',
              'Hand-written HTML, CSS and JavaScript for most sites, so they load fast and need no plugin updates. For online stores, Shopify or WooCommerce '
              'when the client needs to manage products themselves.'),
             ('How fast can you start?',
              'Usually within a week of the brief. A landing page takes under 2 weeks and a 5–10 page site 3–4 weeks, with dates agreed in writing.')],
        sources=['wl-10web', 'wl-fry', 'wl-wha', 'wise-in'],
        related=[(HUB, 'Clients abroad', 'Web design from India, in your currency', 'One price list in eight currencies.'),
                 ('/services/figma-to-code', 'Service', 'Figma to code', 'Your design, hand-coded to match.'),
                 ('/services/website-design-usa', 'Country', 'Website design for US small businesses', 'Fixed $ prices.'),
                 ('/services/website-design-uk', 'Country', 'Website design for UK businesses', 'Fixed £ prices.')],
        cta_h='Start with one site', cta_lead='Send a brief for one site and see how we work. We reply within one working day, with questions and a fixed price.',
        card='Fixed price per site, your brand, NDA before the brief.')


# ================================================================ Figma to code
def _figma():
    return page_dict(
        slug='figma-to-code', crumb='Figma to code', service='Figma to code: hand-coded websites from your design', service_type='Web development',
        countries=[c['name'] for c in COUNTRIES] + ['India'],
        title=f'Figma to Code: Your Design, Hand-Coded, from {fx(LANDING, "USD")} | U Scale',
        desc=f'Send your Figma file and we hand-code it into a fast website that matches the design at every screen size. No page builder. From {fx(LANDING, "USD")} or {price(LANDING)}, fixed.',
        h1='Figma to code, by hand', eyebrow='For designers and founders',
        lead='Send us your Figma file and we code it by hand, so the live site matches your design on every screen and loads fast. No page builder, no plugins.',
        stats=[(fx(LANDING, 'USD'), 'From'), ('16', 'Screen sizes checked'), ('0', 'Page builders')], art=figma_card,
        wa="Hi Mehul, I have a Figma design I'd like turned into a website. Can I send it over?", hero_btn='Send your Figma file',
        og_alt='Figma to code by U Scale: your design, hand-coded to match at every screen size',
        offers=[(LANDING, 'USD'), (BIZ, 'USD'), (BLOG, 'USD'), (LANDING, 'INR'), (BIZ, 'INR')],
        blocks=[
            sec('trust', 'Why it’s safe', 'Your design, exactly. In writing.', '', trust('USD', '.com', keys=('code', 'fix', 'own', 'pay'))),
            sec('prices', 'Prices', 'The same price list as our own designs.', 'Fixed per site, in your currency.',
                cur_switch([('Single page', LANDING, 'One page'), ('Business site', BIZ, '5–10 pages'), ('Bigger site + blog', BLOG, '10–20 pages'),
                            ('Online store', STORE, 'Under 50 products')], curs=('USD', 'GBP', 'EUR', 'AUD', 'CAD'), sid='fc', inr=True)),
            sec('get', 'What you get', 'Your design, exactly. Then a bit more.', '', features([
                ('layers', 'Matches your file', 'Spacing, type and colour from your Figma styles, checked side by side.'),
                ('phone', 'Every screen size', 'Checked at 16 sizes, from a small phone to a wide monitor, including the ones you didn’t design.'),
                ('bolt', 'Fast pages', 'Images in modern formats, fonts served from your own site, no bloat.'),
                ('users', 'Accessible', 'Headings, alt text, contrast and keyboard checks to WCAG 2.1 AA.'),
                ('search', 'Ready for Google', 'Page titles, descriptions, a sitemap and Search Console at launch.'),
                ('key', 'Yours to keep', 'Clean, commented code in your repository, with every login.')])),
            work_sec(),
            sec('process', 'How it works', 'From your file to a live site.', '', steps_html([
                ('file', 'Send the file', 'Day 1: we check every frame', 'Cost', 'Free'),
                ('search', 'Questions and a fixed price', 'Day 2: what’s missing, in writing', 'Pay', '20%'),
                ('code', 'Coded by hand', 'Weeks 1–2: a preview link to check', 'Pay', '20%'),
                ('check', 'Live, every login to you', 'Weeks 2–4', 'Pay', '60%')]), tone='band'),
        ],
        answer=(f'U Scale is a web studio in Mumbai that turns Figma designs into hand-coded websites, without a page builder. The site matches your design '
                f'at every screen size and is checked at 16 widths before launch. Prices are fixed per site: {fx(LANDING, "USD")} ({price(LANDING)}) for one '
                f'page and {fx(BIZ, "USD")} ({price(BIZ)}) for 5–10 pages, with 60% paid at launch.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Built with', 'Hand-written HTML, CSS and JavaScript; Shopify or WooCommerce for stores when needed'),
               ('Prices', f'One page {fx(LANDING, "USD")} / {price(LANDING)} · 5–10 pages {fx(BIZ, "USD")} / {price(BIZ)} · 10–20 pages {fx(BLOG, "USD")} / {price(BLOG)}'),
               ('Checked at', '16 screen sizes, from 360px phones to 1920px monitors'),
               ('Payment', '20% to start, 20% on the first preview, 60% on launch'),
               ('You own', 'The code, in your repository, and every login')],
        faq=[('How much does Figma to code cost?',
              f'The same as our own designs: {fx(LANDING, "USD")} ({price(LANDING)}) for a one-page site, {fx(BIZ, "USD")} ({price(BIZ)}) for 5–10 pages and '
              f'{fx(BLOG, "USD")} ({price(BLOG)}) for 10–20 pages with a blog, fixed after we have looked at the file.'),
             ('Do you code the phone layout if I only designed desktop?',
              'Yes. We follow your desktop design and work out the phone and tablet layouts in the same style, then show you a preview before anything goes live. '
              'If you have mobile frames, we follow those exactly.'),
             ('Do you use Webflow, Framer or a page builder?',
              'No. We write the code by hand, which keeps pages light and means you are not paying a builder every month. If you need to edit content '
              'yourself, we add a simple editor for the parts that change.'),
             ('How close will the site be to my design?',
              'Very close. We take spacing, type and colours from your Figma styles and compare the build with the design side by side. Anything that '
              'can’t work in a browser, we raise before we build, not after.'),
             ('Can you work with my developer or agency?',
              'Yes. We can push to your repository and follow your conventions. For agencies, we also work white label.')],
        sources=[],
        related=[('/services/white-label-web-design', 'For agencies', 'White label web design', 'Your brand, our build.'),
                 (HUB, 'Clients abroad', 'Web design from India, in your currency', 'One price list in eight currencies.'),
                 ('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded.')],
        cta_h='Send your Figma file', cta_lead='Share the file or a link. We look at every frame and reply with questions and a fixed price within one working day.',
        card='Your design, hand-coded to match at every screen size.')


# ================================================================ trades that sell abroad
def _restaurants():
    items = [('Single page', LANDING, 'Menu, hours, map, call button'), ('Restaurant site + ordering', REST, 'Menu, your own ordering, bookings'),
             ('Business site', BIZ, '5–10 pages, catering and events')]
    return page_dict(
        slug='website-design-for-indian-restaurants', crumb='Indian restaurants', service='Website design for Indian restaurants abroad',
        service_type='Restaurant website design', countries=['United Kingdom', 'United States', 'Canada', 'Australia'],
        title='Indian Restaurant Websites with Online Ordering | U Scale',
        desc=f'Websites for Indian restaurants and takeaways abroad: a menu you can edit, your own online ordering and table bookings. From {fx(REST, "GBP")} or {fx(REST, "USD")}, fixed.',
        h1='Indian restaurant websites', eyebrow='For Indian restaurants and takeaways',
        lead='A menu you can update yourself, your own online ordering and table bookings, on a site that loads fast on a phone. Built in Mumbai, by people who know the food.',
        stats=[(fx(REST, 'GBP'), 'With ordering, UK'), (fx(REST, 'USD'), 'With ordering, US'), ('60%', 'Paid after launch')], art=menu_card,
        wa="Hi Mehul, I run an Indian restaurant abroad and I'd like a website with online ordering.",
        og_alt='Websites for Indian restaurants in the UK, US, Canada and Australia, with their own online ordering, by U Scale',
        offers=[(REST, 'GBP'), (REST, 'USD'), (REST, 'CAD'), (REST, 'AUD')],
        blocks=[
            sec('does', 'What it does', 'Everything a hungry person looks for.', '', features([
                ('menu', 'A menu you can edit', 'Change a price or add a special from your phone, in a minute.'),
                ('cart', 'Your own ordering', 'Collection and delivery orders come straight to you, paid by card.'),
                ('calendar', 'Table bookings', 'Party and table requests to your WhatsApp or email, or your booking system.'),
                ('pin', 'Found on Google', 'Your Google Business Profile, map and reviews, set up to match the site.'),
                ('heart', 'Spice, veg and allergens', 'Clear labels on every dish, so nobody has to ring and ask.'),
                ('bolt', 'Fast on a phone', 'Most people look at your menu on a phone, outside, hungry.')])),
            sec('trust', 'Why it’s safe', 'You’re protected at every step.', '', trust('GBP', '.co.uk')),
            sec('prices', 'Prices', 'Fixed, in your currency.', '', cur_switch(items, curs=('GBP', 'USD', 'CAD', 'AUD'), sid='rs')),
            work_sec(),
            process_sec(),
        ],
        answer=(f'U Scale is a web design studio in Mumbai that builds websites for Indian restaurants and takeaways in the UK, US, Canada and Australia: '
                f'a menu the owner can edit, the restaurant’s own online ordering and table bookings. A restaurant site with ordering is {fx(REST, "GBP")} in '
                f'the UK, {fx(REST, "USD")} in the US, {fx(REST, "CAD")} in Canada and {fx(REST, "AUD")} in Australia, fixed, with 60% paid at launch.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Restaurant site with ordering', f'{fx(REST, "GBP")} · {fx(REST, "USD")} · {fx(REST, "CAD")} · {fx(REST, "AUD")}'),
               ('One-page menu site', f'{fx(LANDING, "GBP")} · {fx(LANDING, "USD")} · {fx(LANDING, "CAD")} · {fx(LANDING, "AUD")}'),
               ('Ordering', 'Collection and delivery, card payments through your own Stripe or Square account; card fees are the provider’s'),
               ('Payment', '20% to start, 20% on design sign-off, 60% on launch, by bank transfer in your currency'),
               ('You own', 'Your domain, menu, customer list and every login')],
        faq=[('How much does a website for an Indian restaurant cost?',
              f'A one-page menu site is {fx(LANDING, "GBP")} in the UK or {fx(LANDING, "USD")} in the US. A full restaurant site with your own online ordering and '
              f'bookings is {fx(REST, "GBP")}, {fx(REST, "USD")}, {fx(REST, "CAD")} in Canada or {fx(REST, "AUD")} in Australia, fixed in writing.'),
             ('Can customers order online from my own website?',
              'Yes. Orders for collection or delivery come straight to you, paid by card through your own Stripe or Square account. You pay the card '
              'provider’s fee on each order, and no commission to us.'),
             ('Can I keep using Uber Eats, Deliveroo or DoorDash?',
              'Of course. Most restaurants keep the apps for new customers and send regulars to their own site. The site gives them a reason: the full menu, '
              'your specials and ordering without the app.'),
             ('Can I change the menu myself?',
              'Yes, from your phone. Prices, dishes, specials and opening hours are all yours to edit, and the changes show straight away.'),
             ('Do you understand Indian food menus?',
              'We are in Mumbai, so yes: regional dishes, spice levels, veg and non-veg, Jain options and thali sets are things we get right without '
              'long explanations.')],
        sources=[],
        related=[(HUB, 'Clients abroad', 'Web design from India, in your currency', 'One price list in eight currencies.'),
                 ('/services/website-design-uk', 'Country', 'Website design for UK businesses', 'Fixed £ prices.'),
                 ('/services/website-design-mumbai/restaurants-cafes', 'In Mumbai', 'Restaurant and café websites in Mumbai', 'The same idea, in rupees.')],
        cta_h='Send us your menu', cta_lead='Send a photo of your menu or your current site. We reply with a free audit and a fixed price within one working day.',
        card='Menus, your own ordering and bookings, for the UK, US, Canada and Australia.')


def _fashion():
    items = [('Business site', BIZ, 'Lookbook, collections, enquiries'), ('Online store', STORE, 'Under 50 products'),
             ('Bigger online store', STORE_BIG, '50–500 products')]
    return page_dict(
        slug='website-design-for-indian-fashion-brands', crumb='Indian fashion labels', service='Online stores for Indian fashion and ethnic wear labels',
        service_type='E-commerce website development', countries=['India', 'United Kingdom', 'United States', 'Canada', 'United Arab Emirates'],
        title='Online Stores for Indian Fashion and Ethnic Wear Labels | U Scale',
        desc=f'Online stores for Indian fashion labels selling at home and abroad: prices in rupees and the buyer’s currency, worldwide shipping. From {price(STORE)}.',
        h1='Online stores for Indian fashion labels', eyebrow='For labels in India and boutiques abroad',
        lead='Online stores that show the fabric properly and sell in your customers’ currency. For labels in India selling abroad, and boutiques abroad selling Indian wear.',
        stats=[(price(STORE), 'Store, in India'), (fx(STORE, 'USD'), 'Store, abroad'), ('60%', 'Paid after launch')], art=fashion_card,
        wa="Hi Mehul, I have a fashion label and I'd like an online store that sells abroad too.", lang='en-IN',
        og_alt='Online stores for Indian fashion and ethnic wear labels selling in India and abroad, by U Scale',
        offers=[(STORE, 'INR'), (STORE, 'USD'), (STORE, 'GBP'), (BIZ, 'INR')],
        blocks=[
            work_sec(('sashe', 'spacestudio', 'vidhi', 'antrah', 'roar', 'brandgen'), h='A fashion label we built for.',
                     lead='Sashe by Prachi, a made-to-order label in Mumbai: signature looks, studio enquiries and the founder’s story.'),
            sec('does', 'What it does', 'Shows the drape. Sells abroad.', '', features([
                ('photo', 'Photos that sell fabric', 'Zoom on weave and embroidery, and the drape on a real person.'),
                ('globe', 'Their currency', 'Prices in rupees at home, and in pounds, dollars or dirhams abroad.'),
                ('plane', 'Shipping, said plainly', 'Delivery times and duties shown before checkout, not after.'),
                ('pen', 'Made to measure', 'A size form that asks the right questions, sent straight to you.'),
                ('chat', 'WhatsApp for questions', 'A button on every product, because people ask before they buy.'),
                ('search', 'Found on Google', 'Product pages written for what people search, like “indian clothing store online uk”.')])),
            sec('trust', 'Why it’s safe', 'In the words of the label we built for.', '', WP.with_review(trust('USD', '.com'))),
            sec('prices', 'Prices', 'Fixed, in rupees or your currency.', '', cur_switch(items, curs=('USD', 'GBP', 'CAD', 'AED'), sid='fb', inr=True)),
            process_sec(),
        ],
        answer=(f'U Scale is a web design studio in Mumbai that builds online stores for Indian fashion and ethnic wear labels selling in India and abroad, '
                f'and for boutiques abroad selling Indian wear. An online store with under 50 products is {price(STORE)} in India or {fx(STORE, "USD")} '
                f'({fx(STORE, "GBP")}) abroad, fixed, with prices in the customer’s currency and shipping and duties shown before checkout. U Scale built '
                'the website for Sashe by Prachi, a Mumbai fashion label.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Online store, under 50 products', f'{price(STORE)} · {fx(STORE, "USD")} · {fx(STORE, "GBP")}'),
               ('Online store, 50–500 products', f'{price(STORE_BIG)} · {fx(STORE_BIG, "USD")} · {fx(STORE_BIG, "GBP")}'),
               ('Payments', 'UPI and cards in India; cards and PayPal abroad, through your own payment account'),
               ('Fashion work', 'Sashe by Prachi, Mumbai (sashebyprachi.in)'),
               ('You own', 'Your domain, store, customer list and every login')],
        faq=[('How much does an online store for a fashion label cost?',
              f'{price(STORE)} in India, or {fx(STORE, "USD")} ({fx(STORE, "GBP")}) abroad, for a store with under 50 products, and {price(STORE_BIG)} '
              f'({fx(STORE_BIG, "USD")}) for 50–500 products. Fixed in writing, with 60% paid at launch.'),
             ('Can my store show prices in pounds and dollars?',
              'Yes. Customers abroad see prices in their own currency and pay by card or PayPal; customers in India see rupees and pay by UPI or card.'),
             ('How do I handle shipping and customs duties abroad?',
              'We set up shipping rates by country and show delivery times and duties before checkout, so nobody gets a surprise bill at the door. Your courier '
              'account handles the actual shipping.'),
             ('Have you built websites for fashion brands?',
              'Yes. We designed and built the website for Sashe by Prachi, a made-to-order fashion label in Mumbai, with its signature looks, studio enquiry forms and '
              'the founder’s story. It is live at sashebyprachi.in.'),
             ('Shopify or a custom store?',
              'For most labels with stock that changes often, Shopify, designed by us so it doesn’t look like a template. For a small made-to-order range, a '
              'hand-coded store with enquiry-led checkout can be faster and cheaper to run.')],
        sources=[],
        related=[(HUB, 'Clients abroad', 'Web design from India, in your currency', 'One price list in eight currencies.'),
                 ('/services/ecommerce-website-mumbai', 'Service', 'E-commerce websites', 'Your own online store, UPI and cards.'),
                 ('/services/website-design-mumbai/boutiques-fashion', 'In Mumbai', 'Boutique and clothing store websites', 'Catalogue with WhatsApp orders.')],
        cta_h='Show us your label', cta_lead='Send your Instagram or current store. We reply with a free audit and a fixed price within one working day.',
        card='Online stores that sell to the diaspora, priced in their currency.')


def _hotels():
    items = [('Single page', LANDING, 'Rooms, photos, book button'), ('Business site', BIZ, '5–10 pages, rooms and area guide'),
             ('Bigger site + blog', BLOG, '10–20 pages, local guides')]
    return page_dict(
        slug='website-design-for-independent-hotels', crumb='Independent hotels', service='Direct-booking websites for independent hotels and motels',
        service_type='Hotel website design', countries=['United States', 'Canada', 'United Kingdom', 'India'],
        title=f'Hotel and Motel Websites for Direct Bookings, from {fx(BIZ, "USD")} | U Scale',
        desc=f'Websites for independent hotels and motels that send guests to book direct, built around your booking engine. 5–10 pages {fx(BIZ, "USD")}, fixed, built to WCAG 2.1 AA.',
        h1='Hotel and motel websites', eyebrow='For owner-run hotels',
        lead='A fast website that gets guests to book with you directly, built around the booking engine you already use. For owner-run hotels and motels in the US, and anywhere else.',
        stats=[(fx(BIZ, 'USD'), '5–10 pages'), ('2.1 AA', 'WCAG'), ('60%', 'After launch')], art=hotel_card,
        wa="Hi Mehul, I own a hotel and I'd like a website that brings more direct bookings.", lang='en-US',
        og_alt='Direct-booking websites for independent hotels and motels, by U Scale',
        offers=[(LANDING, 'USD'), (BIZ, 'USD'), (BLOG, 'USD')],
        blocks=[
            sec('does', 'What it does', 'Built to get the booking.', '', features([
                ('calendar', 'Book direct, on every page', 'Your booking engine’s button where guests look for it, on phone and desktop.'),
                ('bed', 'Rooms, honestly shown', 'Real photos, sizes, beds and what’s included, room by room.'),
                ('users', 'Accessible rooms listed', 'Accessible features described clearly, and the site itself built to WCAG 2.1 AA.'),
                ('pin', 'Found on Google', 'Your Google Business Profile and local guide pages for what’s nearby.'),
                ('star', 'Your reviews', 'Your best guest reviews, linked to where they were left.'),
                ('bolt', 'Fast on the road', 'Light pages for guests searching on a phone, on bad signal.')])),
            sec('ada', 'Accessibility', 'Small businesses get sued too.', '',
                hundred(64, '64 of 100', 'ADA website lawsuits in 2025 were against companies with under $25 million in revenue.', 'us-ada')),
            sec('trust', 'Why it’s safe', 'You’re protected at every step.', '', trust('USD', '.com')),
            sec('prices', 'Prices', 'Fixed, in your currency.', 'Your booking engine’s own fees stay between you and them.',
                cur_switch(items, curs=('USD', 'CAD', 'GBP'), sid='ht', inr=True)),
            process_sec(),
        ],
        answer=(f'U Scale is a web design studio in Mumbai that builds direct-booking websites for independent hotels and motels, mainly in the US. The site '
                f'is built around the hotel’s existing booking engine, lists rooms and accessible features clearly, and is built to WCAG 2.1 AA. A 5–10 page '
                f'site is {fx(BIZ, "USD")}, fixed, with 60% paid at launch.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Prices', f'One page {fx(LANDING, "USD")} · 5–10 pages {fx(BIZ, "USD")} · 10–20 pages with local guides {fx(BLOG, "USD")}'),
               ('Booking', 'Your existing booking engine, linked on every page; its fees are between you and the provider'),
               ('Accessibility', 'WCAG 2.1 AA, with accessible room features described'),
               ('Payment', '20% to start, 20% on design sign-off, 60% on launch, by ACH or wire in USD'),
               ('You own', 'Your domain, site and every login')],
        faq=[('How much does a hotel website cost?',
              f'{fx(LANDING, "USD")} for a one-page site, {fx(BIZ, "USD")} for 5–10 pages and {fx(BLOG, "USD")} for 10–20 pages with local guides, fixed in '
              'writing. Your booking engine is billed separately by its provider.'),
             ('Do you build the booking engine?',
              'No. We build the site around the booking engine you already use, so rates and availability stay in one place. If you don’t have one yet, we '
              'help you choose.'),
             ('Is the website ADA compliant?',
              'We build to WCAG 2.1 AA, test with a screen reader before launch and describe your accessible rooms and features clearly, which is what guests '
              'with disabilities look for first. In 2025, 64% of ADA website lawsuits were against companies with under $25 million in revenue.'),
             ('Can you help me get more direct bookings?',
              'The site does its part: a book button on every page, honest room pages and local guides that bring people searching for your area. We also '
              'set up your Google Business Profile so its “Website” button takes people to you.')],
        sources=['us-ada'],
        related=[(HUB, 'Clients abroad', 'Web design from India, in your currency', 'One price list in eight currencies.'),
                 ('/services/website-design-usa', 'Country', 'Website design for US small businesses', 'Fixed $ prices.')],
        cta_h='Get a free audit', cta_lead='Send your hotel’s website or booking link. We reply with a free audit and a fixed price within one working day.',
        card='Direct-booking websites for owner-run hotels and motels.')


def pages():
    return [_hub()] + COUNTRIES + [_white_label(), _figma(), _restaurants(), _fashion(), _hotels()]


# ================================================================ build hooks (seo_pages.build, llms.txt, llms-full.txt, sitemap images)
def all_pages():
    import ai_pages, trade_pages, world_widgets, world_images
    out = pages() + ai_pages.pages() + trade_pages.pages()
    ex = world_widgets.extra()
    for p in out:
        key = p['path'].replace('services/', '', 1)
        for before, block in ex.get(key, []):
            sids = [b.get('sid') if isinstance(b, dict) else None for b in p['blocks']]
            p['blocks'].insert(sids.index(before) if before in sids else len(p['blocks']) - 1, block)
        world_widgets.swap_sigs(p)
        world_images.attach(p, sec, process_sec)
        if key in ('website-design-india/clinics', 'website-design-india/ca-and-law-firms'):  # the do/don't list replaces the unsourced rules cards
            p['blocks'] = [b for b in p['blocks'] if not (isinstance(b, dict) and b.get('sid') == 'rules' and b['h'].startswith('Within'))]
    return out


def build(ctx, parts):
    import world_pages as WP
    rels = []
    for p in all_pages():
        f = ctx['site'] / (p['path'] + '.html')
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(WP.page(ctx, parts, p))
        rels.append(p['path'] + '.html')
    return rels


def llms_lines(site):
    return ['', '## Clients outside India, AI services and trades across India', ''] + [f'- [{p["h1"]}]({site}{p["path"]}): {p["desc"]}' for p in all_pages()]


def llms_full(site):
    L = []
    for p in all_pages():
        L += [f'## {p["h1"]}', '', f'URL: {site}{p["path"]}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for s in p['blocks']:
            if callable(s): continue
            if s.get('text'): L += [f'### {s["h"]}', '', s['text'], '']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in p['faq']]
        if p['sources']: L += ['Sources: ' + '; '.join(f'{GP.SRC[k][1]} ({GP.SRC[k][0]}) {GP.SRC[k][2]}' for k in p['sources']), '']
    return L


def images_by_url(site):
    import world_images
    return {site + p['path']: [(f'{site}assets/pages/og-{p["slug"]}.jpg', p['og_alt'])] + world_images.image_urls(site, p['slug']) for p in all_pages()}
