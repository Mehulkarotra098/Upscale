"""Focus pages: websites by type of business and by area, under /services/website-design-mumbai/.

Why these pages exist (GEO): people now ask ChatGPT, Gemini, Perplexity and Google AI Mode things like "who makes
restaurant websites with online ordering in Mumbai" or "website designer in Ghatkopar". Answer engines quote pages
that answer that exact question near the top, back it with hard facts (prices, timelines, sources), and describe the
same business the same way everywhere. Each page here follows the site's answer-first pattern (aeo.py): an "In short"
answer, a key-facts table, question-shaped sections, an FAQ, linked sources and a connected schema graph.

Rules for adding a page:
  * only real work: a business type U Scale sells (with a published price) or an area where Mehul actually is or works,
    never a page per suburb (Google treats those as doorway pages);
  * every number comes from pricing_data.py or a linked, dated source;
  * no client names or shop weaknesses (findings are described in general terms).
"""
import json, re, urllib.parse

import aeo
import pricing_data as PD
import seo_pages as SP

e, ea = SP.e, SP.ea
BASE = 'website-design-mumbai'
PARENT = next(s for s in SP.SERVICES if s['slug'] == BASE)


def price(name):
    return aeo._price(name)[0]


def url_of(site, p):
    return f'{site}services/{BASE}/{p["slug"]}'


def _link(href, text):
    ext = href.startswith('http')
    return (f'<a class="tlink" href="{ea(href)}"' + (' target="_blank" rel="noopener"' if ext else '') + f'>{e(text)}</a>'
            + ('<span class="sr-only"> (opens in a new tab)</span>' if ext else ''))


# ---------------------------------------------------------------- sources (linked, dated)
SRC = {
    'nrai': ('Inc42, 20 Oct 2026', 'Flipkart eyes October-end launch for food delivery service (NRAI president Sagar Daryani on platform commissions)',
             'https://inc42.com/buzz/flipkart-eyes-october-end-launch-for-food-delivery-service-report/'),
    'gbp-order': ('Google Business Profile Help', 'Manage food ordering on your Business Profile',
                  'https://support.google.com/business/answer/10918858'),
    'razorpay': ('Razorpay, updated Oct 2026', 'Razorpay payment gateway pricing and fees explained',
                 'https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/'),
    'free-listings': ('Google Merchant Center Help', 'Free listings for products', 'https://support.google.com/merchants/answer/13889434'),
    'local-rank': ('Google Business Profile Help', 'How to improve your local ranking on Google', 'https://support.google.com/business/answer/7091'),
}


def sources_html(keys):
    items = ''.join(f'<li>{_link(SRC[k][2], SRC[k][1])} <span>· {e(SRC[k][0])}</span></li>' for k in keys)
    return f'<h3>Sources</h3><ul class="sp-sources">{items}</ul>'


def bullets(items):
    return '<ul class="sp-bullets">' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'


def table(head, rows, caption):
    th = ''.join(f'<th scope="col">{e(h)}</th>' for h in head)
    body = ''.join('<tr><th scope="row">' + e(r[0]) + '</th>' + ''.join(f'<td>{e(c)}</td>' for c in r[1:]) + '</tr>' for r in rows)
    wide = ' sp-compare--wide' if len(head) > 2 else ''
    return f'<div class="sp-tablewrap"><table class="sp-compare{wide}"><caption class="sr-only">{e(caption)}</caption><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


WEB_PRICES = (f'Landing page {price("Landing page")} · Business site, 3–4 pages {price("Business site, 3–4 pages")} · '
              f'5–10 pages + blog {price("Business site, 5–10 pages + blog")} · Online store from {price("E-commerce, under 50 products")}')
INCLUDED = 'mobile-first design, enquiry forms, basic SEO, Google Maps, social links, 2–3 revision rounds and a 15–30 day bug-fix window'
SVC_LINKS = bullets([
    _link('/services/website-design-mumbai', 'Website design and development') + ': designed in Figma, hand-coded, fixed price.',
    _link('/services/seo-mumbai', 'Google Business Profile and local SEO') + f': {price("Local SEO / Google Business Profile")}.',
    _link('/services/social-media-management-mumbai', 'Social media management') + ': posts, reels and a monthly calendar.',
    _link('/services/ai-search-visibility', 'AI search visibility') + ': getting named when people ask ChatGPT or Gemini.',
])
TOOLS = bullets([
    _link('/tools/google-business-profile-checker', 'Free Google Business Profile checker') + ': a score out of 100 and a fix list in about two minutes.',
    _link('/tools/google-review-qr-code', 'Free Google review QR code maker') + ': a printable counter standee that brings in reviews.',
])
MAPS_FAQ = ('Verify your Google Business Profile, choose the most specific primary category, keep hours, phone, photos and services complete, '
            'earn genuine reviews every week and reply to them, and show the same name, phone number and area on your website. Google ranks '
            'local results on relevance, distance and prominence, and nobody can change how far a searcher is from you.')

# ---------------------------------------------------------------- the pages
_rest_saving = 50000 * 20 // 100 - round(50000 * 0.0236)  # ₹10,000 commission vs ₹1,180 gateway fee on ₹50,000 of direct orders
PAGES = [
 dict(slug='restaurants-cafes', kind='business', crumb='Restaurants & cafés', service='Restaurant and café website design with online ordering',
  title='Restaurant Website with Online Ordering, Mumbai | U Scale',
  desc='Your own restaurant or café website with menu and online ordering, so regulars order direct, not through an app that takes 20–25%. '
       f'Fixed {price("Restaurant site + own online ordering")}, by Mehul Karotra.',
  h1='Restaurant & café websites with online ordering', eyebrow='Websites by business',
  lead='Your menu, photos, timings and your own online ordering, on a website you own. Regulars order directly from you instead of through '
       f'an app that keeps a share of every order. Designed and built by me, Mehul Karotra, for a fixed {price("Restaurant site + own online ordering")}.',
  answer='U Scale builds restaurant and café websites in Mumbai with the menu, photos, timings and the restaurant’s own online ordering, for a '
         f'fixed {price("Restaurant site + own online ordering")}. Orders placed on your own website carry no delivery-app commission: you pay only '
         'the payment gateway fee, about 2% plus GST on a standard plan. Most restaurants keep Zomato and Swiggy for new customers and move '
         'their regulars to direct ordering.',
  facts=[('Price', f'Website + own online ordering {price("Restaurant site + own online ordering")}, fixed. Without ordering (menu, photos, '
                   f'timings, contact), the business-site price applies: {price("Business site, 3–4 pages")} for 3–4 pages'),
         ('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Commission on direct orders', 'None. Only the payment gateway fee, for example 2% + GST on Razorpay’s standard plan'),
         ('Delivery', 'Your choice: your own riders, takeaway pickup, or a delivery partner you book'),
         ('Timeline', 'Most sites go live in 4–8 weeks'),
         ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
         ('Care plan', f'Updates, backups and security {price("Care plan: updates, backups, security")}, optional')],
  sections=[
   ('How much do Zomato and Swiggy really cost a restaurant?',
    '<p>Restaurants typically pay established delivery platforms a commission of 20–25% of the order value, according to Sagar Daryani, '
    'president of the National Restaurant Association of India (NRAI), in October 2026. Paid placements on the apps come on top. Newer '
    'platforms are pitching lower rates: Flipkart has reportedly proposed a base commission of around 10% for its food delivery launch.</p>'
    '<p>Your own website does not replace the apps. They are where new customers discover you. A website gives the people who already know '
    'you, your regulars, a way to order from you directly.</p>'),
   ('What ordering direct can save: a worked example',
    table(['Example café', 'Amount'], [
        ('Orders through delivery apps, per month', '₹2,00,000'),
        ('Regulars who switch to ordering on your website', '25%, so ₹50,000 of orders'),
        ('App commission on those orders at 20%', '₹10,000 a month'),
        ('Payment gateway fee on your own site (2% + 18% GST = 2.36%)', '₹1,180 a month'),
        ('Kept by you every month', f'₹{_rest_saving:,}'),
        ('Website + ordering, one-time', f'{price("Restaurant site + own online ordering")}, paid back in about 10 months'),
    ], 'Worked example: commission saved by moving regulars to direct ordering')
    + '<p class="sp-note">An illustration with round numbers, not a promise: use your own monthly app sales and commission rate. The apps’ '
      'commission also pays for their riders, so for delivered orders subtract what your own rider or delivery partner costs. For takeaway '
      'and pre-orders, the saving is the full difference.</p>'),
   ('What your restaurant website includes',
    bullets(['Your menu with prices and photos, readable on a phone and kept current.',
             'Online ordering for takeaway or delivery, with payment by UPI, card or netbanking through a payment gateway.',
             'Table, party and catering enquiries straight to your WhatsApp.',
             'Timings, a location map and a one-tap call button.',
             'Basic SEO and structured data, so Google and AI assistants can read your menu, timings and location correctly.',
             f'As on every U Scale site: {INCLUDED}.'])),
   ('How customers find your ordering link',
    bullets(['Your Google Business Profile: outside the US, restaurants can add their own “Place an order” link, which shows on Google Search and Maps.',
             'Your Instagram bio and WhatsApp Business profile.',
             'A QR code on menus, bills and takeaway bags.'])),
  ],
  faq=[('How much does a restaurant website with online ordering cost in Mumbai?',
        f'With U Scale, a restaurant or café website with its own online ordering is {price("Restaurant site + own online ordering")}, fixed and agreed in '
        f'writing before work starts. A website without ordering (menu, photos, timings and contact) is {price("Business site, 3–4 pages")} for 3–4 pages. '
        'Payment gateway fees and photography are separate and quoted up front.'),
       ('Should I stop using Zomato and Swiggy?',
        'No. The apps are where new customers discover you. Your own website is for the customers who already know you: give them a reason and a '
        'link to order direct, and keep the apps for reach.'),
       ('How much commission do Zomato and Swiggy charge restaurants?',
        'Rates are agreed restaurant by restaurant, but restaurants typically pay established platforms 20–25% of the order value, according to the '
        'president of the National Restaurant Association of India (October 2026). Paid placements and GST on the commission come on top.'),
       ('Who delivers orders placed on my own website?',
        'You choose: your own delivery staff, takeaway pickup, or a delivery partner you book per order. The website takes the order and the '
        'payment; delivery stays in your control.'),
       ('Can customers pay by UPI on my restaurant website?',
        'Yes. Payments go through a payment gateway that supports UPI, cards and netbanking. Razorpay’s standard plan, for example, charges 2% per '
        'transaction plus 18% GST on that fee, with no setup fee.'),
       ('Can my menu show up in Google and ChatGPT answers?',
        'A clear, crawlable menu page with structured data, consistent timings and an up-to-date Google Business Profile make it much easier for '
        'Google and AI assistants to describe your restaurant correctly. Nobody can guarantee a mention, but a menu locked inside a PDF or a photo '
        'is far harder for them to read.')],
  sources=['nrai', 'gbp-order', 'razorpay'],
  offers=['Restaurant site + own online ordering', 'Business site, 3–4 pages', 'Care plan: updates, backups, security'],
  work=[]),

 dict(slug='boutiques-fashion', kind='business', crumb='Boutiques & fashion', service='Website design for boutiques and fashion labels',
  title='Boutique & Clothing Store Website Design in Mumbai | U Scale',
  desc='Websites for Mumbai boutiques and fashion labels: a catalogue with WhatsApp orders, or a full online store from '
       f'{price("E-commerce, under 50 products")}. Designed and hand-coded by Mehul Karotra.',
  h1='Websites for boutiques and fashion labels', eyebrow='Websites by business',
  lead='A catalogue your Instagram followers can browse properly, product pages Google can find, and orders on WhatsApp or online. '
       'Designed in Figma and hand-coded by me, Mehul Karotra, at a fixed price.',
  answer='U Scale designs and builds websites for boutiques, saree shops and fashion labels in Mumbai: a catalogue site with an “Order on WhatsApp” '
         f'button on every product, or a full online store with cart and payments from {price("E-commerce, under 50 products")} for under 50 products. '
         'Every product gets its own page, so it can be found on Google and listed for free across Google Search, Images, Lens and the Shopping tab '
         'through Google Merchant Center.',
  facts=[('Catalogue site', f'Products, lookbook and “Order on WhatsApp” buttons, priced by pages after a free audit, from {price("Business site, 3–4 pages")}'),
         ('Online store', f'Under 50 products {price("E-commerce, under 50 products")} · 50–500 products {price("E-commerce, 50–500 products")}'),
         ('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Payments', 'UPI, cards and netbanking through a payment gateway; gateway fees are separate'),
         ('Timeline', 'Most sites go live in 4–8 weeks'),
         ('Ownership', 'Your domain, product pages, code and customer list stay yours'),
         ('Related work', 'Sashe by Prachi, a bespoke fashion label in Mumbai')],
  sections=[
   ('Do I need a website if I already sell on Instagram and WhatsApp?',
    '<p>Instagram is where people discover your designs. A website is where they check you are real, browse everything in one place and find '
    'you again later. When someone searches Google for a style near them, most of what they see is websites, Google Business Profiles and '
    'product listings; a few Instagram posts can appear too (' + _link('/blog/instagram-posts-google-search-seo', 'how that works') + '), but your '
    'whole catalogue does not. A website also keeps your catalogue safe if your account is restricted or reach drops.</p>'),
   ('List your products on Google for free',
    '<p>Google Merchant Center lets shops list products for free across Google Search, the Shopping tab, Google Images, Google Lens, Maps and the '
    'products section of a Business Profile. It needs a product page on your own website for every item, with price and availability, and '
    'shipping details for India. Google does not promise that every product is shown.</p>'),
   ('Catalogue with WhatsApp orders, or a full online store?',
    table(['', 'Catalogue + WhatsApp', 'Online store'], [
        ('Best for', 'Made-to-order, bespoke and try-before-you-buy', 'Ready stock with fixed sizes and prices'),
        ('How people order', 'Tap “Order on WhatsApp” on a product, then you confirm size, fit and delivery in the chat', 'Add to cart and pay at checkout'),
        ('Payments', 'UPI or a payment link once you confirm', 'UPI, cards and netbanking at checkout, with a gateway fee per order'),
        ('Price with U Scale', f'From {price("Business site, 3–4 pages")}, priced by pages', f'{price("E-commerce, under 50 products")} under 50 products; {price("E-commerce, 50–500 products")} for 50–500'),
    ], 'Catalogue website compared with an online store')),
   ('What every boutique website includes',
    bullets(['A page for every product: photos, fabric, sizes and price.',
             'WhatsApp and call buttons on every page, for the questions people ask before they buy.',
             'Store timings and a Google Map, for people who want to visit and try.',
             'Basic SEO and product structured data, so Google and AI assistants read your catalogue correctly.',
             f'As on every U Scale site: {INCLUDED}.'])),
  ],
  faq=[('How much does a boutique website cost in Mumbai?',
        f'With U Scale, a catalogue website with WhatsApp ordering starts at {price("Business site, 3–4 pages")} and is priced by pages after a free audit. '
        f'A full online store is {price("E-commerce, under 50 products")} for under 50 products and {price("E-commerce, 50–500 products")} for 50–500 '
        'products. Prices are fixed and agreed in writing before work starts.'),
       ('Can customers order on WhatsApp from my website?',
        'Yes. Each product can have an “Order on WhatsApp” button that opens a chat with the product name already typed, so you confirm size, '
        'colour and delivery in the conversation.'),
       ('Can my products show on Google Shopping for free?',
        'Yes, through Google Merchant Center’s free listings, which can show products on Google Search, the Shopping tab, Images, Lens and Maps. '
        'You need a product page on your own website for each item, with price and availability. Google does not guarantee that every product is shown.'),
       ('Who takes the product photos?',
        'You can use your own photos. If you need a shoot, photography is quoted separately, always before work starts.')],
  sources=['free-listings', 'razorpay'],
  offers=['E-commerce, under 50 products', 'E-commerce, 50–500 products', 'Business site, 3–4 pages'],
  work=['sashe']),

 dict(slug='ghatkopar', kind='area', crumb='Ghatkopar', service='Website design and local SEO in Ghatkopar',
  places=['Ghatkopar', 'Vikhroli', 'Kurla', 'Chembur', 'Powai', 'Mulund'],
  title='Website Designer in Ghatkopar, Mumbai | U Scale by Mehul',
  desc='A web designer based in Ghatkopar West: websites from ₹25,000, plus Google Business Profile and local SEO for Ghatkopar businesses, '
       'by Mehul Karotra. Free audit.',
  h1='Website designer in Ghatkopar', eyebrow='Near you',
  lead='I’m Mehul Karotra, a website designer and digital marketer based in Ghatkopar West. I design and build websites, set up Google '
       'Business Profiles and run local SEO for businesses in Ghatkopar and the areas around it, and I can come to your shop or office to talk it through.',
  answer='U Scale is Mehul Karotra, a freelance website designer and digital marketer based in Ghatkopar West, Mumbai. He designs and hand-codes '
         f'websites at fixed prices (a landing page {price("Landing page")}, a 3–4 page business site {price("Business site, 3–4 pages")}) and runs '
         'Google Business Profile and local SEO work for businesses in Ghatkopar, Vikhroli, Kurla, Chembur, Powai and Mulund. Every project starts '
         'with a free audit.',
  facts=[('Based in', 'Ghatkopar West, Mumbai'),
         ('Nearby areas', 'Ghatkopar East and West, Vikhroli, Kurla, Chembur, Powai and Mulund'),
         ('Meetings', 'At your shop or office, or over WhatsApp and video calls'),
         ('Website prices', WEB_PRICES),
         ('Local SEO', f'Google Business Profile and local SEO {price("Local SEO / Google Business Profile")}'),
         ('Free audit', 'Your website, Google listing and Instagram, checked before you pay anything'),
         ('Languages', 'English and Hindi')],
  sections=[
   ('Why Ghatkopar customers find you, or your competitor, on Google',
    '<p>When someone nearby searches “saree shop near me” or “clinic in Ghatkopar”, Google shows a map with three businesses first. Google says '
    'it ranks local results on relevance (how well your listing matches the search), distance (how far you are from the person searching) and '
    'prominence (how well known you are, judged partly from reviews and from the web). A website that names your area, services and timings, '
    'and matches your Google listing exactly, helps with relevance and prominence. Distance is the one thing nobody can change.</p>'),
   ('What I do for businesses in Ghatkopar', SVC_LINKS),
   ('Check where you stand, free', TOOLS),
  ],
  faq=[('Is there a website designer near me in Ghatkopar?',
        'Yes. Mehul Karotra of U Scale is based in Ghatkopar West and designs and builds websites for businesses across Ghatkopar and nearby areas. '
        'He can meet you at your shop or office, and every project starts with a free audit.'),
       ('How much does a website cost in Ghatkopar?',
        f'With U Scale, a landing page is {price("Landing page")}, a 3–4 page business website {price("Business site, 3–4 pages")}, a 5–10 page site with a '
        f'blog {price("Business site, 5–10 pages + blog")} and an online store from {price("E-commerce, under 50 products")}. The same fixed prices apply anywhere in Mumbai.'),
       ('How do I get my Ghatkopar business into the Google Maps top 3?', MAPS_FAQ),
       ('Do you also work in Ghatkopar East, Vikhroli and Kurla?',
        'Yes. Ghatkopar East and West, Vikhroli, Kurla, Chembur, Powai and Mulund are all close by, and U Scale works with businesses across Mumbai, '
        'Thane and Navi Mumbai.')],
  sources=['local-rank'],
  offers=['Landing page', 'Business site, 3–4 pages', 'Business site, 5–10 pages + blog', 'Local SEO / Google Business Profile'],
  work=[]),

 dict(slug='andheri-east', kind='area', crumb='Andheri East', service='Website design and local SEO in Andheri East',
  places=['Andheri East', 'Marol', 'Chakala', 'Saki Naka', 'MIDC Andheri', 'JB Nagar'],
  title='Website Designer for Andheri East Businesses | U Scale',
  desc='Websites, Google listings and local SEO for shops, cafés and offices in Andheri East: Marol, Chakala, Saki Naka and MIDC. Fixed prices '
       'from ₹25,000, free audit.',
  h1='Website design for Andheri East businesses', eyebrow='Near you',
  lead='Shops, cafés, restaurants and offices in Andheri East compete for the same searches on Google. I’m Mehul Karotra: I design and build '
       'websites and fix Google listings for businesses here, and in October 2026 I ran a free audit day for local shops in the area.',
  answer='U Scale’s Mehul Karotra designs websites and sets up Google Business Profiles and local SEO for shops, cafés, restaurants and offices in '
         'Andheri East, including Marol, Chakala, Saki Naka, MIDC and JB Nagar. Websites start at ₹25,000 at a fixed price, local SEO is '
         f'{price("Local SEO / Google Business Profile")}, and every project starts with a free audit, which U Scale also runs in person for shops in the area.',
  facts=[('Areas', 'Marol, Chakala, Saki Naka, MIDC, JB Nagar, Gundavali and the rest of Andheri East'),
         ('Who', 'Mehul Karotra, personally; based in Ghatkopar West, on the same Metro line'),
         ('Website prices', WEB_PRICES),
         ('Restaurants and cafés', f'Website + own online ordering {price("Restaurant site + own online ordering")}'),
         ('Local SEO', f'Google Business Profile and local SEO {price("Local SEO / Google Business Profile")}'),
         ('Free audit', 'In person at your shop or office, or online')],
  sections=[
   ('What we keep finding on Andheri East Google listings',
    '<p>In October 2026 U Scale looked at the Google listings of more than 30 clothing shops, cafés and restaurants in Andheri East, and visited '
    'shops near Gundavali Metro for a free audit day. The same few gaps came up again and again:</p>'
    + bullets(['Good ratings and hundreds of reviews, but no website on the listing, so people who want the menu or catalogue go to a delivery app, '
               'a directory or a competitor.',
               'A website link on the listing that no longer opens.',
               'A booking-app, marketplace or free-page link where the shop’s own website should be.',
               'A strong Instagram following but far fewer Google reviews.',
               'A website with no WhatsApp or call button, so a visitor on a phone has no quick way to ask.'])
    + '<p>Each of these can be fixed in days, and most cost nothing but time. The free Google Business Profile checker below shows which ones apply to you.</p>'),
   ('What I do for businesses in Andheri East', SVC_LINKS + '<p>For restaurants and cafés there is a dedicated page on '
    + _link(f'/services/{BASE}/restaurants-cafes', 'websites with your own online ordering') + '.</p>'),
   ('Check where you stand, free', TOOLS),
  ],
  faq=[('Who designs websites for small businesses in Andheri East?',
        'U Scale’s Mehul Karotra designs and builds websites for shops, cafés, restaurants and offices in Andheri East, at fixed prices from ₹25,000. '
        'He works personally with each client and offers a free audit, in person or online.'),
       ('How much does a website cost for a shop or café in Andheri East?',
        f'With U Scale, a landing page is {price("Landing page")}, a 3–4 page business website {price("Business site, 3–4 pages")}, a restaurant or café '
        f'website with its own online ordering {price("Restaurant site + own online ordering")} and an online store from {price("E-commerce, under 50 products")}. '
        'Prices are fixed and agreed in writing before work starts.'),
       ('The website link on my Google listing is broken. What should I do?',
        'Fix it the same day: in your Google Business Profile, change the website field to a page that works, or remove it until you have one. '
        'A dead link sends customers away and makes the listing look neglected.'),
       ('Can you come to my shop for the audit?',
        'Yes. U Scale runs free audits in person for shops in Andheri East and nearby areas, or online over WhatsApp and a video call if that is easier.')],
  sources=['local-rank'],
  offers=['Landing page', 'Business site, 3–4 pages', 'Restaurant site + own online ordering', 'Local SEO / Google Business Profile'],
  work=[]),
]


# ---------------------------------------------------------------- page assembly
def _jsonld(site, p):
    url = url_of(site, p)
    parent = SP.svc_url(site, PARENT)
    area = ([{'@type': 'Place', 'name': f'{n}, Mumbai'} for n in p['places']] if p['kind'] == 'area'
            else [{'@type': 'City', 'name': 'Mumbai'}, {'@type': 'Country', 'name': 'India'}])
    graph = [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': p['title'], 'description': p['desc'], 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': url + '#service'}, 'mainEntity': {'@id': url + '#service'}, 'author': {'@id': site + '#mehul'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__',
         'citation': [SRC[k][2] for k in p['sources']]},
        {'@type': 'Service', '@id': url + '#service', 'name': p['service'], 'serviceType': 'Website design', 'url': url, 'description': p['answer'],
         'provider': {'@id': site + '#business'}, 'areaServed': area, 'isRelatedTo': {'@type': 'Service', '@id': parent + '#service', 'name': PARENT['name'], 'url': parent},
         'offers': aeo.offers_ld(site, p['offers'])},
        aeo.biz_ref(site), aeo.person_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': site + 'services'},
            {'@type': 'ListItem', 'position': 3, 'name': PARENT['short'], 'item': parent},
            {'@type': 'ListItem', 'position': 4, 'name': p['crumb'], 'item': url}]},
        aeo._faq_ld(url, p['faq']),
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def _hero(p, wa):
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li><a href="/services/{BASE}">{e(PARENT['short'])}</a></li><li aria-current="page">{e(p['crumb'])}</li></ol></nav>
      <p class="eyebrow">{e(p['eyebrow'])}</p><h1 class="sp-hero__title" id="page-title">{e(p['h1'])}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{e(p['lead'])}</p>
      <div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="#contact" data-magnetic>Get a free audit <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>
        <a class="btn btn--ghost" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>Chat on WhatsApp</a>
      </div>
    </section>
  </div>'''


def _work(ctx, keys):
    if not keys: return ''
    wmap = {w[0]: w for w in ctx['WORK']}
    li = ''.join(f'<li>{_link(wmap[k][5], wmap[k][1])} <span>{e(wmap[k][2])}</span></li>' for k in keys)
    return f'<h3>Related work</h3><ul class="sp-list sp-list--work">{li}</ul>'


def _cta(p, wa):
    others = [q for q in PAGES if q is not p]
    nav = ''.join(f'<li><a href="/services/{BASE}/{q["slug"]}">{e(q["crumb"] if q["kind"] == "area" else q["h1"].split(" with ")[0])}</a></li>' for q in others)
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <span class="grain" aria-hidden="true"></span>
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Get a free audit<span class="dot">.</span></h2>
          <p class="lead">Tell me about your business. I reply within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email {SP.EMAIL}</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
        </div>
      </div>
      <nav class="sp-more" aria-label="More website pages"><p class="eyebrow">More</p><ul><li><a href="/services/{BASE}">All website design</a></li>{nav}<li><a href="/pricing">Full price list</a></li></ul></nav>
    </div>
  </section>'''


def page(ctx, parts, p):
    site = ctx['SITE_URL']; url = url_of(site, p)
    wa = f'https://wa.me/{aeo.ENTITY["whatsapp"]}?text=' + urllib.parse.quote(f"Hi Mehul, I found your page on {p['crumb'].lower()} websites. I'd like to talk about my business.")
    secs = ''.join(f'''
  <section class="section sp-q" aria-labelledby="s{i}-title">
    <div class="wrap sp-prose">
      <h2 class="h2 sp-h2" id="s{i}-title">{e(h)}</h2>
      {body}
    </div>
  </section>''' for i, (h, body) in enumerate(p['sections']))
    tail = f'''
  <section class="section sp-tight" aria-label="Related work and sources">
    <div class="wrap sp-prose">
      {_work(ctx, p['work'])}
      {sources_html(p['sources'])}
      <p class="sp-price"><strong>Prices.</strong> Every U Scale price is published. {_link('/pricing', 'See the full price list')}</p>
    </div>
  </section>'''
    body = (_hero(p, wa) + aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title') + secs + tail
            + aeo._faq_section(p['faq'], 'Questions, answered.') + _cta(p, wa))
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, p), body)


def build(ctx, parts):
    """Writes every focus page; returns their paths relative to the output folder (for dates, sitemap and IndexNow)."""
    out = ctx['site'] / 'services' / BASE
    out.mkdir(parents=True, exist_ok=True)
    for p in PAGES:
        (out / f'{p["slug"]}.html').write_text(page(ctx, parts, p))
    return [f'services/{BASE}/{p["slug"]}.html' for p in PAGES]


# ---------------------------------------------------------------- llms.txt / llms-full.txt and the parent page's links
def llms_lines(site):
    biz = [p for p in PAGES if p['kind'] == 'business']; area = [p for p in PAGES if p['kind'] == 'area']
    return (['', '## Websites by type of business', ''] + [f'- [{p["h1"]}]({url_of(site, p)}): {p["desc"]}' for p in biz]
            + ['', '## Areas', ''] + [f'- [{p["h1"]}]({url_of(site, p)}): {p["desc"]}' for p in area])


def _text(html):
    """Section HTML → plain text for llms-full.txt: paragraphs, "- " bullets and "a | b" table rows."""
    t = re.sub(r'<caption.*?</caption>', '', html, flags=re.S)
    t = re.sub(r'</t[hd]>\s*<t[hd][^>]*>', ' | ', t)
    t = re.sub(r'<(?:li|tr)[^>]*>', '\n- ', t)
    t = re.sub(r'</p>|</table>|</ul>', '\n\n', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'^- +\|\s*', '- Compared: ', t, flags=re.M)  # header row with an empty first cell
    t = re.sub(r'[ \t]+', ' ', t)
    return re.sub(r'\n{3,}', '\n\n', re.sub(r'\n +', '\n', t)).strip()


def llms_full(site):
    L = []
    for p in PAGES:
        L += [f'## {p["h1"]}', '', f'URL: {url_of(site, p)}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for h, body in p['sections']:
            L += [f'### {h}', '', _text(body), '']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in p['faq']]
        L += ['Sources: ' + '; '.join(f'{SRC[k][1]} ({SRC[k][0]}) {SRC[k][2]}' for k in p['sources']), '']
    return L


def related_html():
    """Links block for the main website-design page: by business, by area."""
    biz = ''.join(f'<li><a href="/services/{BASE}/{p["slug"]}">{e(p["h1"])}</a></li>' for p in PAGES if p['kind'] == 'business')
    area = ''.join(f'<li><a href="/services/{BASE}/{p["slug"]}">{e(p["h1"])}</a></li>' for p in PAGES if p['kind'] == 'area')
    return (f'<nav class="sp-more" aria-label="Websites by business"><p class="eyebrow">By business</p><ul>{biz}</ul></nav>'
            f'<nav class="sp-more" aria-label="Websites near you"><p class="eyebrow">Near you</p><ul>{area}</ul></nav>')
