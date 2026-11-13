"""New pages from the SEO programme (Nov 2026), built on the focus-page system in geo_pages.py:

  /services/website-design-thane          Thane, Kalyan and Dombivli (area page, in person)
  /services/website-design-navi-mumbai    Navi Mumbai, Vashi to Panvel (area page, in person)
  /services/ecommerce-website-mumbai      online stores (a website type with its own published price)
  /services/google-business-profile-mumbai  Google listing management (the listing side of local SEO)
  /freelance-web-designer-mumbai          for people looking to hire a person, not an agency
  /tools/website-cost-calculator          an estimate from the published prices and sourced market ranges
  /services/digital-marketing-mumbai      for people searching for a digital marketing agency: what one person covers, with prices
  /services/website-design-india          the hub for work outside Mumbai: prices, how remote projects run, and every city page

Same rules as the other focus pages: every rupee figure comes from pricing_data.py or a linked, dated source; nothing is
invented (no clients, results, offices or reviews); illustrations say they are illustrations. Thane and Navi Mumbai get
one deep page each, never a page per suburb.
"""
import json, urllib.parse

import aeo
import geo_pages as GP
import seo_pages as SP
from geo_pages import (P, Cards, Check, Table, Options, Links, Chips, Note, Html, Tools, Img, Sec, icon, price, rupees, _fmt, _link, e, ea, WEB_PRICES, INCLUDED, MAPS_FAQ, RANKING)

GP.SRC.update({
    'gbp-guidelines': ('Google Business Profile Help', 'Guidelines for representing your business on Google', 'https://support.google.com/business/answer/3038177'),
    'ugc-policy': ('Google Maps Help', 'Prohibited and restricted content: fake engagement and reviews', 'https://support.google.com/contributionpolicy/answer/7400114'),
    'gbp-reinstate': ('Google Business Profile Help', 'Business Profile suspensions and how to request reinstatement', 'https://support.google.com/business/answer/4569145'),
    'gbp-sab': ('Google Business Profile Help', 'Manage your service area for businesses that visit or deliver to customers', 'https://support.google.com/business/answer/9157481'),
})

LOCAL, REVIEWS = price('Local SEO / Google Business Profile'), price('Review & reputation management')
STORE, STORE_BIG = price('E-commerce, under 50 products'), price('E-commerce, 50–500 products')
CROSS = [('Services', '/services')]


def _rel(items):
    """A "Keep reading" rail of link cards: (href, kind label, title, text)."""
    li = ''.join(f'<li><a class="fp-rel" href="{ea(h)}"><span class="fp-rel__k">{e(k)}</span><b>{e(t)}</b><span class="fp-rel__d">{e(d)}</span>{icon("arrow")}</a></li>'
                 for h, k, t, d in items if SP.live(h))
    return f'<nav class="fp-related" aria-label="Keep reading"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>'


# ================================================================ Online stores (in GP.PAGES: listed with the other website types)
ECOM = dict(
    slug='ecommerce-website-mumbai', path='services/ecommerce-website-mumbai', kind='business', crumb='Online stores',
    service='E-commerce website development in Mumbai', service_type='E-commerce website development',
    card=f'Your own online store with UPI and card payments, from {STORE} for under 50 products.',
    title='E-commerce Website Development in Mumbai from ₹95,000',
    desc=f'Your own online store, built in Mumbai: under 50 products {STORE}, 50–500 products {STORE_BIG}. UPI and card payments, product pages Google can find.',
    h1='E-commerce websites in Mumbai', eyebrow='Website development',
    lead='Your own online store, designed in Figma and coded by hand: product pages Google can find, a cart, and payments by UPI and cards through a payment gateway. Fixed price, agreed in writing before I start.',
    stats=[(STORE, 'Online store, under 50 products'), ('₹1.5L', '50–500 products, from'), ('0%', 'Marketplace commission')],
    art=dict(kind='card', card='store'),
    answer=(f'U Scale builds e-commerce websites for Mumbai businesses: your own online store with product pages, a cart and online payments by UPI '
            f'and cards, for {STORE} with under 50 products or {STORE_BIG} for 50–500 products, fixed and agreed in writing. You pay the payment '
            'gateway a small fee on each order, about 2% plus GST on Razorpay’s standard plan, and no marketplace commission. Mehul Karotra designs '
            'and builds every store himself.'),
    facts=[('Price', f'Under 50 products {STORE} · 50–500 products {STORE_BIG}'),
           ('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
           ('Payments', 'UPI, cards and netbanking through a payment gateway; gateway fees are separate (Razorpay standard: 2% + GST per payment)'),
           ('Every product', 'Its own page with photos, price and availability, readable by Google'),
           ('Ownership', 'Your domain, your store, your customer list'),
           ('Payment terms', '20% to start, 20% on design sign-off, 60% on launch'),
           ('Care plan', f'Updates, backups and security {price("Care plan: updates, backups, security")}, optional')],
    sections=[
        Sec('Your own store, Shopify or a marketplace?',
            Options([dict(name='A marketplace', tag='Amazon, Flipkart, Meesho', rows=[('You pay', 'A commission and fees on every order, by category'),
                                                                                        ('Customers belong to', 'The marketplace'), ('Good for', 'Reach: people already shopping there')]),
                     dict(name='Shopify', tag='Do it yourself', rows=[('You pay', 'about ₹1,500–₹1,800 a month on Basic, billed yearly, plus 2% on each sale on top of the gateway fee in India'),
                                                                       ('Customers belong to', 'You'), ('Good for', 'Owners who want to run everything themselves from day one')]),
                     dict(name='Your own store', tag='Built by U Scale', hi=True, rows=[('You pay', f'{STORE} once for under 50 products, then only the gateway fee per order'),
                                                                                       ('Customers belong to', 'You'), ('Good for', 'Brands that want their own look, speed and customer list')])],
                    note='Many brands use more than one: a marketplace for reach, and their own store for repeat customers and better margins.'),
            P('Shopify’s Basic plan costs about ₹1,500–₹1,800 a month billed yearly (on 10 Nov 2026 Shopify’s India page showed ₹1,800, and some visitors a ₹1,499 offer). '
              'Because Shopify Payments isn’t available in India, Shopify adds its own 2% to each sale on top of the payment gateway’s fee. ' + GP.src_chip('shopify')),
            eyebrow='Choose your model', layout='wide'),
        Sec('What your online store includes',
            Cards([('tag', 'A page for every product', 'Photos, sizes or variants, price and availability, on its own page Google can find.'),
                   ('cart', 'Cart and checkout', 'Payments by UPI, cards and netbanking through a payment gateway in your name.'),
                   ('search', 'Ready for Google', 'Product structured data and pages that meet Google Merchant Center’s rules for free product listings.'),
                   ('phone', 'Made for phones first', 'Most orders start on a phone, so the store is designed for one first.'),
                   ('chat', 'WhatsApp for questions', 'A button on every product for the questions people ask before they buy.'),
                   ('check', 'Everything else, included', f'As on every U Scale site: {INCLUDED}.')], cols=3),
            eyebrow='Included', layout='wide'),
        Sec('Delivery, cash on delivery and GST',
            P('Who delivers is your choice: your own staff, a courier you book, or a shipping service. Cash on delivery, delivery charges and how '
              'invoices show GST depend on how you run your business, so they are agreed in the written plan before the build, with any cost they '
              'add. Nothing is decided for you later.'),
            Check(['How you will deliver, and to which pin codes', 'Whether you offer cash on delivery', 'Delivery charges and free-delivery rules',
                   'Returns and exchanges, in writing on the site', 'Your GST details for invoices, if you are registered', 'Who updates products and prices after launch']),
            eyebrow='Decided up front', layout='wide', tone='dark', sid='delivery'),
        Sec('List your products on Google for free',
            P('Google Merchant Center lets shops list products for free across Google Search, the Shopping tab, Images and Lens. Google asks for a '
              'product page on your own website for each item, with the price, availability and a way to buy. A marketplace listing doesn’t give '
              'you that; your own store does. Google does not promise that every product is shown. ' + GP.src_chip('free-listings')),
            P('Made-to-order or bespoke pieces? A catalogue with “Order on WhatsApp” may suit you better: see '
              + _link('/services/website-design-mumbai/boutiques-fashion', 'boutique and clothing store websites') + '.'),
            eyebrow='Free listings'),
    ],
    faq=[('How much does an e-commerce website cost in Mumbai?',
          f'With U Scale, an online store with under 50 products is {STORE} and a store with 50–500 products is {STORE_BIG}, fixed and agreed in writing '
          'before work starts. The payment gateway charges a small fee on each order, and a care plan for updates and backups is optional. Market '
          'prices for online stores range from about ₹25,000 to ₹3 lakh, according to the 16 published price guides U Scale compared in 2026.'),
         ('Do you build on Shopify?',
          'I design and build custom stores. If Shopify suits your business better, for example if you want to run and change everything yourself '
          'from day one, I will say so in the free audit. Shopify’s Basic plan costs about ₹1,500–₹1,800 a month billed yearly, plus 2% on each sale in India.'),
         ('Can customers pay by UPI on my online store?',
          'Yes. Payments go through a payment gateway that supports UPI, cards and netbanking. Razorpay’s standard plan, for example, charges 2% per '
          'payment plus 18% GST on that fee, with no setup fee.'),
         ('Should I sell on my own website or on Amazon and Flipkart?',
          'Often both. Marketplaces bring reach but charge a commission and fees on each order, and the customer belongs to them. Your own store '
          'costs a fixed amount once, keeps your margins on repeat orders and gives you your customer list.'),
         ('Who takes the product photos?',
          'You can use your own photos. If you need a shoot, photography is quoted separately, always before work starts.'),
         ('Can my products show on Google Shopping for free?',
          'Yes, through Google Merchant Center’s free listings, if each product has its own page on your website with the price, availability and a '
          'way to buy. Google does not guarantee that every product is shown.')],
    sources=['shopify', 'shopify-payments', 'razorpay-pricing', 'free-listings', 'merchant-lp'],
    offers=['E-commerce, under 50 products', 'E-commerce, 50–500 products', 'Care plan: updates, backups, security'],
    work=[])


# ================================================================ Google Business Profile management (its own page, under SEO)
def gbp_page_dict():
    return dict(
        slug='google-business-profile-mumbai', path='services/google-business-profile-mumbai', kind='business', crumb='Google Business Profile',
        trail=CROSS + [('SEO services', '/services/seo-mumbai')],
        service='Google Business Profile management in Mumbai', service_type='Local SEO',
        related_ld=lambda site: {'@type': 'Service', '@id': site + 'services/seo-mumbai#service', 'name': 'SEO Services', 'url': site + 'services/seo-mumbai'},
        wa_msg="Hi Mehul, I'd like help with my Google Business Profile.",
        title='Google Business Profile Management in Mumbai | U Scale',
        desc=f'Google Business Profile setup, verification, suspension fixes and monthly management for Mumbai businesses, part of local SEO at {LOCAL.replace("/mo", " a month")}.',
        h1='Google Business Profile management in Mumbai', eyebrow='Local SEO',
        lead='Your Google listing is often the first thing a customer sees: your hours, photos, reviews and a button to call. I set it up properly, keep it current every month and help you earn genuine reviews, without breaking Google’s rules.',
        stats=[(LOCAL.split('/')[0], 'Per month, with local SEO'), ('Free', 'Listing check, 2 minutes'), ('You', 'Keep the listing in your name')],
        art=dict(kind='card', card='profile'),
        answer=(f'U Scale manages Google Business Profiles for Mumbai businesses as part of local SEO, at {LOCAL.replace("/mo", " a month")}: set-up and '
                'verification, the right categories and services, hours and photos, weekly posts, a plan for genuine reviews and replies, and help when a '
                f'listing is suspended or missing. Review and reputation management on its own is {REVIEWS.replace("/mo", " a month")}. Mehul Karotra does the '
                'work himself, and the listing always stays in your name.'),
        facts=[('Price', f'Part of local SEO, {LOCAL}; review and reputation management {REVIEWS}'),
               ('Who does the work', 'Mehul Karotra, personally'),
               ('Includes', 'Set-up and verification, categories and services, hours, photos, weekly posts, review plan and replies, monthly report'),
               ('Suspended or missing listings', 'What triggered it checked and fixed, then a reinstatement request through Google’s own form'),
               ('Ownership', 'The listing stays in your name; you add me as a manager, and can remove me any time'),
               ('Contract', aeo.CONTRACT),
               ('First step', 'Free: the Google Business Profile checker, about 2 minutes')],
        sections=[
            Sec('What Google Business Profile management covers',
                Cards([('check', 'Set-up and verification', 'A new listing created, or an old one claimed, and verified the way Google asks.'),
                       ('tag', 'Categories and services', 'The most specific primary category, the right extra ones, and your services with prices.'),
                       ('clock', 'Hours and holiday hours', 'Kept current, and the same on your website, so nobody arrives to a closed shutter.'),
                       ('photo', 'Photos and weekly posts', 'Real photos of your place and work, and a short post every week.'),
                       ('star', 'Reviews, asked for and answered', 'A simple way to ask every customer, and a reply to every review.'),
                       ('file', 'A plain monthly report', 'Calls, direction requests and website taps from your listing, and what changes next.')], cols=3),
                eyebrow='Every month', layout='wide'),
            Sec('Suspended, missing or not verified?',
                P('Most listing problems have a cause you can find: a business name with extra keywords, an address Google can’t verify, a duplicate '
                  'listing, or a recent edit that triggered a review. I check what happened, fix what breaks Google’s guidelines, and file a '
                  'reinstatement request through Google’s own form. Nobody can promise Google will reinstate a listing, and anyone offering to do it '
                  '“through contacts” is not being honest. ' + GP.src_chip('gbp-reinstate')),
                Check(['The name matches your signboard, with no extra keywords', 'The address or service area is real and verifiable',
                       'There is only one listing for your business', 'The primary category is the most specific true one',
                       'The website and phone match your site exactly', 'Recent edits that may have triggered a review']),
                P('Step-by-step guides: ' + _link('/blog/business-not-showing-on-google-maps', 'why a business doesn’t show on Google Maps')
                  + (', and ' + _link('/blog/google-business-profile-verification', 'Google Business Profile verification') if SP.live('/blog/google-business-profile-verification') else '') + '.'),
                eyebrow='Fixes', layout='wide', tone='dark', sid='fixes'),
            Sec('No shop? A service-area listing',
                P('If you serve customers at their place, like AC repair, pest control, tuition at home or a home bakery, you can have a listing that '
                  'shows the areas you cover without showing your home address. Google asks service-area businesses to hide the address and list '
                  'the areas they serve. ' + GP.src_chip('gbp-sab')),
                eyebrow='Service areas'),
            Sec('Reviews: asked for, answered, never bought',
                P('Reviews are part of how Google judges how well known you are, and the first thing most customers read. The work is simple and '
                  'steady: ask every customer, make it one tap with a review link and QR code, and reply to every review, good or bad. Buying or '
                  'filtering reviews breaks Google’s rules and can get reviews removed or a listing restricted. ' + GP.src_chip('ugc-policy')),
                RANKING,
                eyebrow='Reviews', layout='wide'),
            Sec('Check your listing first, free', Tools(), eyebrow='Free tools', layout='wide'),
        ],
        faq=[('How much does Google Business Profile management cost in Mumbai?',
              f'With U Scale, Google Business Profile management is part of local SEO at {LOCAL.replace("/mo", " a month")}, and review and reputation '
              f'management on its own is {REVIEWS.replace("/mo", " a month")}. Monthly plans run for 3 months, then month to month. The first check is free '
              'with the Google Business Profile checker.'),
             ('Can you verify my Google Business Profile?',
              'I set up the listing and guide you through verification, but Google decides the method: often a short video of your business, a phone '
              'call or a text, and sometimes a postcard. Google sends the code to you as the owner, so you share it with me or enter it yourself.'),
             ('My Google listing is suspended. Can you fix it?',
              'I can find what triggered it, fix what goes against Google’s guidelines and file a reinstatement request through Google’s own form. '
              'Nobody can guarantee Google will reinstate a listing.'),
             ('Can I have a Google listing without a shop?',
              'Yes. If you visit or deliver to customers, a service-area listing shows the areas you cover and hides your home address.'),
             ('How long until my business shows in the Google Maps top 3?', MAPS_FAQ),
             ('Will I lose control of my listing?',
              'No. The listing stays in your name. You add me as a manager, and you can remove me any time from your own account.')],
        sources=['gbp-guidelines', 'gbp-reinstate', 'gbp-sab', 'ugc-policy', 'local-rank'],
        offers=['Local SEO / Google Business Profile', 'Review & reputation management'],
        work=[],
        related_html=_rel([('/services/seo-mumbai', 'Service', 'SEO services in Mumbai', 'Local and technical SEO, with a plain monthly report.'),
                           ('/tools/google-business-profile-checker', 'Free tool', 'Google Business Profile checker', 'A score out of 100 and a fix list in about 2 minutes.'),
                           ('/tools/google-review-qr-code', 'Free tool', 'Google review QR code maker', 'Your review link, a QR code and a printable standee.'),
                           ('/blog/google-business-profile-verification', 'Guide', 'Google Business Profile verification (2026)', 'Video steps, why it fails and what to do.'),
                           ('/blog/business-not-showing-on-google-maps', 'Guide', 'Business not showing on Google Maps?', 'Eleven fixes, in the order to try them.'),
                           ('/blog/how-to-get-more-google-reviews', 'Guide', 'How to get more Google reviews', 'Your review link, QR code and WhatsApp scripts.'),
                           ('/blog/why-google-reviews-disappearing', 'Guide', 'Why Google reviews disappear', 'Nine reasons, and who can appeal.')]),
        all_links='<a class="tlink" href="/services/seo-mumbai">SEO services</a>')


# ================================================================ Freelance web designer (people hiring a person)
def freelancer_dict(ctx=None):
    import svc_pages as SVP
    work = '' if ctx is None else SVP._work(ctx, dict(work=['antrah', 'sashe', 'vidhi', 'roar', 'brandgen', 'growcred'], work_feature='spacestudio',
                               work_h='Websites I designed and built.',
                               work_lead='Client websites, and GrowCred, a project of my own. Each one designed in Figma and coded by hand; every card opens the live site.'))
    return dict(
        slug='freelance-web-designer-mumbai', path='freelance-web-designer-mumbai', kind='business', crumb='Freelance web designer',
        trail=CROSS + [('Website design', '/services/website-design-mumbai')],
        service='Freelance web design and development in Mumbai', service_type='Website design',
        wa_msg="Hi Mehul, I'm looking for a freelance web designer. I'd like a free audit and a price for my website.",
        title='Freelance Web Designer in Mumbai: Hire Mehul, from ₹25,000',
        desc='Hire a freelance web designer and developer in Mumbai: Mehul Karotra designs in Figma and hand-codes your site at a fixed price. 21+ projects shipped.',
        h1='Freelance web designer in Mumbai', eyebrow='Hire a person, not an agency',
        lead='I’m Mehul Karotra, a freelance web designer and developer based in Ghatkopar West, Mumbai. You hire me, not a team behind me: I design your site in Figma, code it by hand and answer your WhatsApp myself, at a fixed price agreed before I start.',
        stats=[('21+', 'Projects shipped'), (price('Landing page'), 'Websites from'), ('1', 'Person does the work')],
        art=dict(kind='portrait', chips=[('pen', 'Designs in Figma'), ('bolt', 'Hand-codes every site')]),
        answer=(f'Mehul Karotra is a freelance web designer and developer in Mumbai, based in Ghatkopar West. He designs every website in Figma and '
                f'hand-codes it himself, at a fixed price agreed in writing before work starts: a landing page {price("Landing page")}, a 5–10 page business '
                f'site {price("Business site, 5–10 pages")} and an online store from {STORE}. Clients deal with him directly, from the first WhatsApp '
                'message to launch, and own the domain, code and every login.'),
        facts=[('Who', 'Mehul Karotra, freelance web designer and developer; founder of U Scale'),
               ('Based in', 'Ghatkopar West, Mumbai; meets clients across Mumbai, Thane and Navi Mumbai, and works with businesses across India remotely'),
               ('Website prices', WEB_PRICES),
               ('Timeline', 'Most business sites go live in 3–4 weeks; a landing page in under two weeks'),
               ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
               ('You own', 'Your domain, hosting, code, design files and every login'),
               ('Also', 'SEO, Google Business Profile, social media, Google and Meta ads, AI search visibility'),
               ('Languages', 'English and Hindi')],
        sections=[
            Sec('What hiring a freelance web designer means',
                Cards([('user', 'One person, start to finish', 'The person you talk to on WhatsApp designs the screens and writes the code.'),
                       ('rupee', 'A fixed price, in writing', 'Agreed before work starts: 20% to start, 20% on design sign-off, 60% on launch.'),
                       ('key', 'Everything in your name', 'Your domain, hosting, code and logins, handed over at launch.'),
                       ('calendar', 'A start date before you pay', 'One person can only take a few projects at a time, so you get a start date in writing before the advance.'),
                       ('shield', 'Bug fixes after launch', 'A 15–30 day window to fix anything that doesn’t work as agreed.'),
                       ('team', 'Specialists when needed', 'A photographer for a shoot, a developer friend for a tricky build. I stay your single point of contact.')], cols=3),
                eyebrow='What you get', layout='wide'),
            Sec('A freelancer or an agency?',
                Options([dict(name='A freelance web designer', tag='One person', hi=True, rows=[('Good for', 'Small businesses with a clear brief'),
                                                                                                 ('You deal with', 'The person designing and coding your site'),
                                                                                                 ('Ask about', 'When they can start, and who fixes things after launch')]),
                         dict(name='An agency', tag='A team', rows=[('Good for', 'Large sites that need several specialists at once'),
                                                                    ('You deal with', 'Usually an account manager'),
                                                                    ('Ask about', 'Who actually designs and builds your site')])]),
                P('Prices from 16 published guides, and six checks before you hire anyone, are in the guide: '
                  + _link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'freelancer vs agency vs website builder') + '.'),
                eyebrow='Compared', layout='wide', tone='band', sid='compared'),
            Sec('Fixed prices',
                Table(['Website', 'Price', 'Usually live in'],
                      [('Landing page', price('Landing page'), 'Under 2 weeks'), ('Portfolio site', price('Portfolio site'), '2–3 weeks'),
                       ('Business site, 5–10 pages', price('Business site, 5–10 pages'), '3–4 weeks'),
                       ('Business site, 10–20 pages + blog', price('Business site, 10–20 pages + blog'), 'Agreed in the plan'),
                       ('Restaurant site + own online ordering', price('Restaurant site + own online ordering'), '3–4 weeks'),
                       ('Online store, under 50 products', STORE, 'Agreed in the plan')],
                      'Freelance website prices from Mehul Karotra of U Scale'),
                P('Every price is published on the ' + _link('/pricing', 'pricing page') + '. For a quick estimate with your own choices, try the '
                  + _link('/tools/website-cost-calculator', 'website cost calculator') + '.'),
                eyebrow='Prices', layout='wide', sid='prices'),
        ],
        after_sections=work,
        faq=[('How much does a freelance web designer cost in Mumbai?',
              f'With me, a landing page is {price("Landing page")}, a 5–10 page business site {price("Business site, 5–10 pages")} and an online store '
              f'starts at {STORE}, fixed and agreed in writing before I start. Freelancer projects in Mumbai mostly cost ₹10,000–₹80,000 according to '
              '16 published price guides, compared in the freelancer vs agency vs website builder guide.'),
             ('Is it safe to hire a freelance web designer?',
              'It is when the basics are in writing: a fixed price, what you get, a start date, and the domain and logins in your name. Pay in stages '
              '(I ask for 20% to start, 20% on design sign-off and 60% on launch), so most of the payment comes after you have seen the work.'),
             ('What if you are busy or unavailable?',
              'I take on a few projects at a time and give you a start date in writing before the advance. During a project you get updates on '
              'WhatsApp, and after launch everything is in your name, so you are never locked in.'),
             ('Do you also do SEO and digital marketing?',
              'Yes. Besides websites I run local SEO and Google Business Profiles, social media, Google and Meta ads and AI search visibility, on monthly '
              'plans with published prices.'),
             ('Do you work with businesses outside Mumbai?',
              'Yes. I meet clients across Mumbai, Thane and Navi Mumbai, and work with businesses across India over WhatsApp and video calls, at the same prices.'),
             ('Will I own my website?',
              'Yes. The domain, hosting account, code and design files are yours, and every login is handed over at launch.')],
        sources=['g-pac', 'g-mwd', 'g-webbird', 'g-hostinger', 'g-goodfirms'],
        offers=['Landing page', 'Portfolio site', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products'],
        work=[],
        related_html=_rel([('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'Guide', 'Freelancer vs agency vs builder', 'Who each one suits, what each costs.'),
                           ('/about', 'About', 'About Mehul Karotra', 'Where I worked before, how I work, where I meet clients.'),
                           ('/blog/website-design-cost-mumbai', 'Guide', 'Website design cost in Mumbai (2026)', 'Market ranges, yearly costs and red flags.'),
                           ('/tools/website-cost-calculator', 'Free tool', 'Website cost calculator', 'An estimate in a minute, from published prices.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]))


# ================================================================ Website cost calculator (a tool page)
TYPES = [  # key, label shown, pricing_data name, market row key, pages for copywriting
    ('landing', 'Landing page (1 page)', 'Landing page', 'template', 1),
    ('portfolio', 'Portfolio site', 'Portfolio site', 'custom', 4),
    ('business', 'Business site, 5–10 pages', 'Business site, 5–10 pages', 'custom', 7),
    ('business20', 'Business site, 10–20 pages + blog', 'Business site, 10–20 pages + blog', 'custom', 14),
    ('restaurant', 'Restaurant site + own online ordering', 'Restaurant site + own online ordering', 'custom', 5),
    ('store', 'Online store, under 50 products', 'E-commerce, under 50 products', 'store', 5),
    ('store500', 'Online store, 50–500 products', 'E-commerce, 50–500 products', 'store', 6),
]
# market ranges from the 16 price guides compared in Oct 2026 (the same numbers as the Hinglish cost guide)
MARKET = {'template': (8000, 30000, 'a basic template website'), 'custom': (40000, 200000, 'a custom-designed website'),
          'store': (25000, 300000, 'an online store')}
YEARLY = (4400, 9400)  # domain + hosting after the offer price ends, before GST (providers' own pages, Oct 2026)


def _calc_html():
    data = {k: {'n': n, 'p': rupees(pd), 'from': price(pd).startswith('from'), 'm': list(MARKET[m][:2]), 'ml': MARKET[m][2], 'pages': pg}
            for k, n, pd, m, pg in TYPES}
    data['_'] = {'copy': rupees('Website copy'), 'logo': rupees('Logo'), 'care': rupees('Care plan: updates, backups, security'), 'yearly': list(YEARLY)}
    k0 = 'business'
    d0 = data[k0]
    copy0 = d0['pages'] * data['_']['copy']
    total0 = d0['p'] + copy0
    opts = ''.join(f'<label class="wc-opt"><input type="radio" name="type" value="{k}"{" checked" if k == k0 else ""}><span><b>{e(n)}</b>'
                   f'<small>{"from " if data[k]["from"] else ""}{_fmt(data[k]["p"])}</small></span></label>' for k, n, *_ in TYPES)
    wa = SP.wa_link(f'Hi Mehul, I used the website cost calculator on uscale.in. Estimate: {d0["n"]} + website copy (about {d0["pages"]} pages) = {_fmt(total0)}. I’d like a free audit.')
    return f'''<div class="wc" data-wcalc='{ea(json.dumps(data, ensure_ascii=False))}' data-reveal>
  <form class="wc__in" aria-label="Your website">
    <fieldset class="wc__set"><legend>What do you need?</legend><div class="wc-opts">{opts}</div></fieldset>
    <fieldset class="wc__set"><legend>Add to it</legend><div class="wc-ticks">
      <label class="wc-tick"><input type="checkbox" name="copy" checked><span><b>Text written for you</b><small>Website copy, {price("Website copy")}, about <output name="pages">{d0["pages"]}</output> pages</small></span></label>
      <label class="wc-tick"><input type="checkbox" name="logo"><span><b>A logo</b><small>{price("Logo")}</small></span></label>
      <label class="wc-tick"><input type="checkbox" name="care"><span><b>Care plan</b><small>Updates, backups and security, {price("Care plan: updates, backups, security")}</small></span></label>
    </div></fieldset>
    <a class="wc__peek" href="#wc-out" aria-hidden="true" tabindex="-1"><span>Your estimate</span><b data-w="peek">{_fmt(total0)}</b><i>See the breakdown ↓</i></a>
  </form>
  <div class="wc__out" id="wc-out" aria-live="polite">
    <p class="wc__k">Your estimate</p>
    <p class="wc__total"><span data-w="from"></span><b data-w="total">{_fmt(total0)}</b><small>one-time, fixed after a free audit</small></p>
    <table class="wc__lines"><caption class="sr-only">How the estimate adds up</caption><tbody data-w="lines">
      <tr><th scope="row">{e(d0["n"])}</th><td>{_fmt(d0["p"])}</td></tr>
      <tr><th scope="row">Website copy, about {d0["pages"]} pages</th><td>{_fmt(copy0)}</td></tr>
    </tbody></table>
    <div class="wc__mkt"><p data-w="mlabel">Market price for {e(d0["ml"])}</p><p><b data-w="market">{_fmt(d0["m"][0])}–{_fmt(d0["m"][1])}</b></p>
      <p class="wc__note">From 16 published price guides, compared by U Scale in October 2026.</p></div>
    <div class="wc__year"><p>Every year after</p><ul data-w="yearly"><li>Domain and hosting: about {_fmt(YEARLY[0])}–{_fmt(YEARLY[1])}, before GST</li></ul></div>
    <a class="btn btn--go wc__send" data-w="wa" href="{ea(wa)}" target="_blank" rel="noopener">{icon("chat")}Send on WhatsApp</a>
  </div>
</div>'''


def _calc_text():
    return ('An estimate from U Scale’s published prices: pick a website type (' + ', '.join(f'{n} {price(pd)}' for _, n, pd, _, _ in TYPES)
            + f'), then add website copy ({price("Website copy")}), a logo ({price("Logo")}) or a care plan ({price("Care plan: updates, backups, security")}). '
            f'Market ranges shown beside it: a basic template website ₹8,000–₹30,000, a custom-designed website ₹40,000–₹2,00,000, an online store '
            f'₹25,000–₹3,00,000. Every year after: domain and hosting about {_fmt(YEARLY[0])}–{_fmt(YEARLY[1])}, before GST.')


def calc_dict():
    def main_ld(site, url, imgs):
        return {'@type': 'WebApplication', '@id': url + '#app', 'name': 'Website cost calculator', 'url': url, 'applicationCategory': 'BusinessApplication',
                'operatingSystem': 'Any (runs in the browser)', 'browserRequirements': 'Requires JavaScript', 'inLanguage': 'en-IN',
                'description': 'Estimate what a website costs in India: pick a website type and extras for a fixed U Scale price, the market range and yearly costs.',
                'offers': {'@type': 'Offer', 'price': 0, 'priceCurrency': 'INR'}, 'provider': {'@id': site + '#business'}, 'isAccessibleForFree': True}
    return dict(
        slug='website-cost-calculator', path='tools/website-cost-calculator', kind='guide', crumb='Website cost calculator',
        trail=[('Free tools', '/tools')], main_ld=main_ld, service='Website cost calculator for India', hero_more=('#calculator', 'Use the calculator'),
        wa_msg="Hi Mehul, I used the website cost calculator on uscale.in. I'd like a free audit and a fixed price.",
        title='Website Cost Calculator India: Free Estimate in 1 Minute',
        desc='Free website cost calculator for India: pick your pages and features to see the market range and a fixed U Scale price. Send the estimate on WhatsApp.',
        h1='Website cost calculator', eyebrow='Free tool · no sign-up',
        lead='What will your website cost? Pick the kind of site and what you want added, and see a fixed U Scale price, the market range from 16 published price guides, and what you will pay every year after.',
        stats=[('1 min', 'To an estimate'), (price('Landing page'), 'Websites from'), ('Free', 'No sign-up')],
        art=dict(kind='card', card='estimate'),
        answer=(f'A website in India costs about ₹8,000–₹30,000 for a basic template site, ₹40,000–₹2 lakh for a custom design and ₹25,000–₹3 lakh for an '
                f'online store, according to 16 published price guides. U Scale’s fixed prices are {price("Landing page")} for a landing page, '
                f'{price("Business site, 5–10 pages")} for a 5–10 page business site and {STORE} for an online store with under 50 products. '
                f'Every year after, domain and hosting cost about {_fmt(YEARLY[0])}–{_fmt(YEARLY[1])} before GST.'),
        facts=[('Basic template website', '₹8,000–₹30,000 (market range)'), ('Custom-designed website', '₹40,000–₹2,00,000 (market range)'),
               ('Online store', '₹25,000–₹3,00,000 (market range)'), ('U Scale fixed prices', WEB_PRICES),
               ('Every year after', f'Domain and hosting about {_fmt(YEARLY[0])}–{_fmt(YEARLY[1])}, before GST'),
               ('Website copy', price('Website copy') + ' with U Scale'), ('How exact', 'An estimate; the price is fixed in writing after a free audit')],
        sections=[
            Sec('Work out your website cost', Html(_calc_html(), _calc_text()), eyebrow='Calculator', layout='wide', sid='calculator'),
            Sec('How the estimate works',
                Cards([('rupee', 'U Scale prices', 'Taken from the published price list, the same numbers as the pricing page.'),
                       ('layers', 'Market ranges', 'From 16 website price guides by Mumbai and Indian web firms, a hosting company and a directory, compared in October 2026.'),
                       ('refresh', 'Yearly costs', 'Domain and hosting at renewal prices, from the providers’ own pages, because the first-year offer ends.')], cols=3),
                P('The guides overlap rather than agree, so the market is shown as a range. The full list of sources is in the '
                  + _link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder#sources', 'freelancer vs agency guide')
                  + ', and the yearly bills are explained in the ' + _link('/blog/website-design-cost-mumbai', 'website design cost guide') + '.'),
                eyebrow='Method', layout='wide'),
            Sec('What moves the price',
                Cards([('layers', 'Pages', 'A landing page and a 20-page site are different projects.'),
                       ('pen', 'Who writes the text', 'Your own text costs nothing; written copy is priced per page.'),
                       ('bolt', 'Features', 'Ordering, payments, booking and catalogues each add work.'),
                       ('box', 'Products', 'A store with 30 products and one with 300 are priced differently.'),
                       ('user', 'Who builds it', 'A template, a freelancer or an agency team.'),
                       ('refresh', 'Yearly costs', 'Domain, hosting and, for stores, a fee on each payment.')], cols=3),
                eyebrow='Price factors', layout='wide', tone='band'),
        ],
        faq=[('How much does a website cost in India?',
              'About ₹8,000–₹30,000 for a basic template website, ₹40,000–₹2 lakh for a custom-designed one and ₹25,000–₹3 lakh for an online store, '
              f'according to 16 published price guides compared in 2026. U Scale’s fixed prices start at {price("Landing page")} for a landing page.'),
             ('How much does a website cost per year?',
              f'After the first-year offer ends, a domain and shared hosting cost about {_fmt(YEARLY[0])}–{_fmt(YEARLY[1])} a year before GST. Online stores '
              'also pay a payment gateway fee on each order, and a platform fee if they use one like Shopify.'),
             ('How much does an e-commerce website cost?',
              f'Online stores range from about ₹25,000 to ₹3 lakh in the market. With U Scale, a store with under 50 products is {STORE} and 50–500 '
              f'products is {STORE_BIG}. More on the online store page.'),
             ('Is this estimate the final price?',
              'No. It is an estimate from published prices. The price is fixed in writing after a free audit of what you actually need, before you pay anything.'),
             ('Does the calculator save what I enter?',
              'No. It runs in your browser and sends nothing anywhere, unless you choose to send the estimate to me on WhatsApp.')],
        sources=['g-hostinger', 'g-pac', 'g-mwd', 'g-goodfirms', 'in-domain', 'hosting'],
        offers=['Landing page', 'Business site, 5–10 pages', 'E-commerce, under 50 products'],
        work=[],
        related_html=_rel([('/blog/website-design-cost-mumbai', 'Guide', 'Website design cost in Mumbai (2026)', 'Market ranges, yearly costs, GST and red flags.'),
                           ('/pricing', 'Prices', 'Full price list', 'Every U Scale price, with a quote builder.'),
                           ('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/services/website-design-mumbai/website-banane-ka-kharcha', 'Guide', 'Website banane ka kharcha', 'Poora hisaab, Hinglish mein.'),
                           ('/tools', 'Free tools', 'All free tools', 'Profile checker, review QR, QR codes and visiting cards.')]),
        all_links='<a class="tlink" href="/tools">All free tools</a>')


# ================================================================ Digital marketing in Mumbai (people searching for an agency)
SEO_TECH, ADS, GEO = price('Technical + on-page SEO'), price('Ads management'), price('AI search visibility (GEO)')
GP.SRC.update({
    'dm-edtech': ('EdTech Buzzz, updated 27 Aug 2026', 'Top 10 digital marketing agencies in Mumbai (2026): verified list and pricing',
                  'https://www.edtechbuzzz.com/top-digital-marketing-agencies-in-mumbai/'),
    'dm-scalegrowth': ('ScaleGrowth Digital, Mumbai, 14 Feb 2026 (seen 14 Nov 2026)', 'Digital marketing agency in Mumbai: what retainers cost',
                       'https://scalegrowth.digital/mumbai/'),
})


def _mo(p):
    """'₹15,000/mo' -> '₹15,000 a month'."""
    return p.replace('/mo', ' a month')


def _social_month():
    """A month of social from single pieces, the same mix as the pricing page's preset: 12 posts, 4 carousels, 4 reel edits."""
    return 12 * rupees('Social post') + 4 * rupees('Carousel') + 4 * rupees('Reel edit (your footage)')


def digital_dict():
    social = _fmt(_social_month())
    return dict(
        slug='digital-marketing-mumbai', path='services/digital-marketing-mumbai', kind='business', crumb='Digital marketing',
        trail=CROSS, service='Digital marketing services in Mumbai', service_type='Digital marketing',
        related_ld=lambda site: {'@type': 'Service', '@id': site + 'services/seo-mumbai#service', 'name': 'SEO Services', 'url': site + 'services/seo-mumbai'},
        wa_msg="Hi Mehul, I'm looking for digital marketing for my business. I'd like a free audit.",
        title='Digital Marketing Agency in Mumbai? Meet the Alternative',
        desc=f'Looking for a digital marketing agency in Mumbai? U Scale is one specialist, Mehul Karotra: local SEO {LOCAL}, ads {ADS}, social posts from {price("Social post")}.',
        h1='Digital marketing in Mumbai', eyebrow='An alternative to an agency',
        lead='SEO, Google Maps, social media, Google and Meta ads and AI search, run by one person instead of an agency team. I’m Mehul Karotra; you talk to me, I do the work, and every price is published before we speak.',
        stats=[(LOCAL.split('/')[0], 'Local SEO, per month'), (ADS.split('/')[0], 'Ads, per month'), ('1', 'Person does the work')],
        art=dict(kind='card', card='menu'),
        answer=(f'U Scale is the independent digital marketing practice of Mehul Karotra in Mumbai, an alternative to hiring a digital marketing agency. '
                f'He personally runs local SEO and Google Business Profiles ({_mo(LOCAL)}), technical and on-page SEO ({_mo(SEO_TECH)}), Google and Meta ads '
                f'({_mo(ADS)}, plus a one-time ₹10,000 setup), social media (posts from {price("Social post")}, reel edits from {price("Reel edit (your footage)")}) '
                f'and AI search visibility ({_mo(GEO)}). Every price is published, and monthly plans run for 3 months, then month to month. '
                'Two sources published in 2026 put full-service agency retainers in Mumbai between about ₹25,000 and ₹5 lakh a month.'),
        facts=[('Who does the work', 'Mehul Karotra, personally. U Scale is one person, not an agency team'),
               ('Local SEO and Google Business Profile', LOCAL),
               ('Technical and on-page SEO', SEO_TECH),
               ('Google and Meta ads', f'{ADS} up to ₹1.5 lakh monthly ad spend, then 12% of spend; ₹10,000 one-time setup; ad spend paid to Google or Meta directly'),
               ('Social media', f'Posts {price("Social post")}, carousels {price("Carousel")}, reel edits {price("Reel edit (your footage)")}; community and inbox management {price("Community & inbox management")}'),
               ('AI search visibility', GEO),
               ('Contract', aeo.CONTRACT),
               ('Accounts', 'Your Google listing, ad accounts and social pages stay in your name'),
               ('Based in', 'Ghatkopar West, Mumbai; meets clients across Mumbai, Thane and Navi Mumbai, and works with businesses across India remotely'),
               ('First step', 'A free audit of your website, Google listing and Instagram')],
        sections=[
            Sec('What digital marketing covers, and what each part costs',
                Links([('/services/seo-mumbai', 'search', 'SEO and Google Maps', 'Your Google listing, the pages customers land on and the technical fixes behind them.', f'From {LOCAL}'),
                       ('/services/google-business-profile-mumbai', 'pin', 'Google Business Profile', 'Set-up, verification, weekly posts, review replies and help with suspensions.', LOCAL),
                       ('/services/social-media-management-mumbai', 'chat', 'Social media', 'A monthly plan you approve, designed posts, reels and inbox care.', f'From {price("Social post")} a post'),
                       ('/services/google-meta-ads-mumbai', 'bolt', 'Google and Meta ads', 'Search, Instagram and click-to-WhatsApp campaigns, in your own ad accounts.', ADS),
                       ('/services/ai-search-visibility', 'layers', 'AI search visibility', 'What ChatGPT, Gemini and Google’s AI say about you, and the facts they read.', GEO),
                       ('/services/website-design-mumbai', 'globe', 'A website to send people to', 'Designed in Figma and hand-coded, at a fixed price.', f'From {price("Landing page")}')]),
                P('You don’t need all of it. Most businesses start with one or two and add the rest when the first is working. The '
                  + _link('/pricing', 'pricing page') + ' has a quote builder for mixing them.'),
                eyebrow='Services and prices', layout='wide', sid='services'),
            Sec('A digital marketing agency, or one specialist?',
                Options([dict(name='A digital marketing agency', tag='A team', rows=[('Good for', 'Brands running many channels and campaigns at once'),
                                                                                    ('You deal with', 'Usually an account manager'),
                                                                                    ('Monthly cost', 'About ₹25,000 to ₹5 lakh for full service, in two sources published in 2026')]),
                         dict(name='U Scale', tag='One specialist', hi=True, rows=[('Good for', 'Small and mid-sized businesses that want one person accountable'),
                                                                                   ('You deal with', 'Mehul, who also does the work'),
                                                                                   ('Monthly cost', f'Published for each service, from {price("Email marketing")}')])],
                        note='If you need large shoots every week, influencer campaigns or a team on call all day, an agency is the better choice, and I will tell you so in the free audit.'),
                P('Where the agency figures come from: one 2026 guide to Mumbai agencies puts full-service retainers at ₹25,000 to ₹2.5 lakh a month and more '
                  + GP.src_chip('dm-edtech') + ', and a Mumbai agency’s own page puts them at ₹50,000 to ₹5 lakh ' + GP.src_chip('dm-scalegrowth')
                  + '. They overlap rather than agree, so ask any agency what is included, and who will actually do the work.'),
                eyebrow='Compared', layout='wide', tone='band', sid='compared'),
            Sec('Digital marketing packages: three ways to start',
                Table(['Goal', 'What it includes', 'Cost'],
                      [('Get found on Google', 'Local SEO and Google Business Profile management', LOCAL),
                       ('Enquiries from ads', 'A landing page, then ads management', f'{price("Landing page")} once, then {ADS} and a ₹10,000 setup'),
                       ('A month of social media', '12 posts, 4 carousels and 4 reel edits from your footage', f'{social} for the month')],
                      'Three common starting points for digital marketing with U Scale, priced from the published list'),
                Note('Ad spend is paid by you to Google or Meta directly and is not part of these prices. No GST is charged on U Scale prices right now.'),
                eyebrow='Starting points', layout='wide', sid='start'),
            Sec('What I won’t do',
                Cards([('shield', 'Promise a ranking', 'Nobody controls Google. I report what was done and what changed, every month.'),
                       ('star', 'Buy reviews or followers', 'Bought reviews break Google’s rules and can get reviews removed or a listing restricted. Bought followers don’t buy from you.'),
                       ('key', 'Hold your accounts', 'Your Google listing, ad accounts and pages stay in your name. You add me, and can remove me any time.')], cols=3),
                eyebrow='Straight talk', layout='wide', tone='dark', sid='wont'),
            Sec('Check where you stand first, free', Tools(), eyebrow='Free tools', layout='wide'),
        ],
        faq=[('How much does digital marketing cost in Mumbai?',
              f'With U Scale, local SEO and Google Business Profile management is {_mo(LOCAL)}, technical and on-page SEO {_mo(SEO_TECH)}, Google and Meta ads '
              f'management {_mo(ADS)} plus a ₹10,000 setup, and AI search visibility {_mo(GEO)}. Social media is priced by the piece, from {price("Social post")} '
              'a post. Two sources published in 2026 put full-service agency retainers in Mumbai between about ₹25,000 and ₹5 lakh a month.'),
             ('Is U Scale a digital marketing agency?',
              'No. U Scale is one person, Mehul Karotra, who plans and does the work himself. When a project needs a photographer or another specialist, '
              'he brings one in and stays your single point of contact.'),
             ('Which service should I start with?',
              'If customers look for you on Google Maps, start with your Google Business Profile and local SEO. If you have no website, or one that does '
              'not bring enquiries, start there. The free audit looks at your website, Google listing and Instagram and suggests an order.'),
             ('How long does digital marketing take to work?',
              'Ads begin showing once the campaigns are approved. SEO and Google Maps work builds over months, and distance from the searcher decides part '
              'of the map results. Nobody can promise a ranking or a number of enquiries.'),
             ('Do I have to sign a long contract?',
              'No. Monthly plans run for 3 months, then month to month with 30 days’ notice. Websites are one-time, fixed-price projects.'),
             ('Do you work with businesses outside Mumbai?',
              'Yes. I meet clients across Mumbai, Thane and Navi Mumbai, and work with businesses across India over WhatsApp and video calls, at the same prices.')],
        sources=['dm-edtech', 'dm-scalegrowth', 'local-rank', 'ugc-policy'],
        offers=['Local SEO / Google Business Profile', 'Technical + on-page SEO', 'Ads management', 'AI search visibility (GEO)', 'Community & inbox management'],
        work=[],
        related_html=_rel([('/services/seo-mumbai', 'Service', 'SEO services in Mumbai', 'Local and technical SEO, with a plain monthly report.'),
                           ('/services/google-meta-ads-mumbai', 'Service', 'Google & Meta ads management', 'A flat monthly fee, in your own ad accounts.'),
                           ('/services/social-media-management-mumbai', 'Service', 'Social media marketing in Mumbai', 'A plan you approve, posts, reels and inbox care.'),
                           ('/services/ai-search-visibility', 'Service', 'AI search visibility', 'What AI assistants say about your business.'),
                           ('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'Guide', 'Freelancer vs agency vs builder', 'Who each one suits, and what each costs.'),
                           ('/pricing', 'Prices', 'Full price list', 'Every service, with a quote builder.')]),
        all_links='<a class="tlink" href="/services">All services</a>')


# ================================================================ Website design across India (the hub for the city pages)
def india_dict():
    import city_pages as CP
    cities = [(f'/{c["path"]}', 'pin', c['h1'].replace('Website design & development in ', ''), c['card'], '') for c in CP.CITIES]
    near = [('/services/website-design-mumbai', 'pin', 'Mumbai', 'Where I’m based: meetings in person across the city.', ''),
            ('/services/website-design-thane', 'pin', 'Thane, Kalyan and Dombivli', THANE['card'], ''),
            ('/services/website-design-navi-mumbai', 'pin', 'Navi Mumbai', NAVI['card'], '')]
    names = ', '.join(c['city'] for c in CP.CITIES[:-1]) + ' and ' + CP.CITIES[-1]['city']
    return dict(
        slug='website-design-india', path='services/website-design-india', kind='business', crumb='Across India',
        service='Website design and development for businesses across India', service_type='Website design',
        area_ld=[aeo.place('India', 'Country')],
        wa_msg="Hi Mehul, my business is outside Mumbai. I'd like a free audit and a fixed price for my website.",
        title='Website Design & Development in India, from ₹25,000 Fixed',
        desc=f'Websites for businesses anywhere in India, designed and hand-coded by Mehul Karotra in Mumbai: landing page {price("Landing page")}, business site {price("Business site, 5–10 pages")}, over WhatsApp.',
        h1='Website design & development in India', eyebrow='For businesses anywhere in India',
        lead='I’m Mehul Karotra, a website designer and developer in Mumbai. I build websites for businesses across India over WhatsApp and video calls, at the same fixed prices I charge in Mumbai, agreed in writing before I start.',
        stats=[(price('Landing page'), 'Websites from'), ('3–4 wk', 'Live in'), ('60%', 'Paid after launch')],
        art=dict(kind='card', card='prices'),
        answer=(f'U Scale is Mehul Karotra, a website designer and developer based in Mumbai who works with businesses across India over WhatsApp and video '
                f'calls. Prices are fixed in writing and the same in every city: a landing page {price("Landing page")}, a 5–10 page business site '
                f'{price("Business site, 5–10 pages")}, a 10–20 page site with a blog {price("Business site, 10–20 pages + blog")} and an online store from '
                f'{STORE}. Most business sites go live in 3–4 weeks, 60% of the price is paid at launch, and the domain, code and logins are in your name. '
                'For comparison, 16 published price guides put a custom-designed website in India at about ₹40,000 to ₹2 lakh.'),
        facts=[('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
               ('Based in', 'Mumbai (Ghatkopar West). No offices in other cities: the work happens over WhatsApp and video calls'),
               ('Website prices', WEB_PRICES + '. The same in every city'),
               ('India market, for comparison', 'Basic template website ₹8,000–₹30,000 · custom-designed website ₹40,000–₹2,00,000 · online store ₹25,000–₹3,00,000 (16 published price guides, compared in October 2026)'),
               ('Timeline', 'Most business sites go live in 3–4 weeks; a landing page in under two weeks'),
               ('Payment', '20% to start, 20% on design sign-off, 60% on launch. No GST is charged right now'),
               ('You own', 'Your domain, hosting, code, design files and every login'),
               ('City pages', f'Mumbai, Thane and Navi Mumbai (in person), and {names} (remote)'),
               ('Languages', 'English and Hindi')],
        sections=[
            Sec('What a website costs in India',
                Table(['Kind of website', 'Market range in India', 'U Scale, fixed'],
                      [('One-page or basic template site', '₹8,000–₹30,000', price('Landing page') + ' for a custom landing page'),
                       ('Custom-designed business site', '₹40,000–₹2,00,000', price('Business site, 5–10 pages') + ' for 5–10 pages'),
                       ('Larger site with a blog', '₹40,000–₹2,00,000', price('Business site, 10–20 pages + blog') + ' for 10–20 pages'),
                       ('Online store', '₹25,000–₹3,00,000', f'{STORE} under 50 products · {STORE_BIG} for 50–500')],
                      'What a website costs in India: market ranges from published price guides, beside U Scale’s fixed prices'),
                P(GP.GUIDES_NOTE.replace(' and listed under Sources below', '') + ' The full list is in the '
                  + _link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder#sources', 'freelancer vs agency guide')
                  + '. For an estimate with your own choices, use the ' + _link('/tools/website-cost-calculator', 'website cost calculator') + '.'),
                eyebrow='Prices', layout='wide', sid='prices'),
            Sec('How a project runs when we are in different cities',
                Cards([('chat', 'WhatsApp and video calls', 'You talk to me directly, from the first message to launch. No account manager in between.'),
                       ('pen', 'Designs you review on your own phone', 'Real screens in Figma, desktop and mobile, approved by you before I write any code.'),
                       ('rupee', 'Most of the price after launch', '20% to start, 20% when you approve the design and 60% when the site is live.'),
                       ('key', 'Everything in your name', 'Your domain, hosting, code and logins, handed over at launch.'),
                       ('file', 'A written plan first', 'Pages, timeline and the exact price, agreed before you pay anything.'),
                       ('shield', 'Bug fixes after launch', 'A 15–30 day window to fix anything that doesn’t work as agreed.')], cols=3),
                eyebrow='Working remotely', layout='wide', tone='band', sid='remote'),
            Sec('Website design by city',
                P('Each city has its own page, with what local studios charge there, from their own price pages, and how customers in that city search.'),
                Links(cities),
                P('In and around Mumbai I also meet clients in person:'),
                Links(near),
                eyebrow='City pages', layout='wide', sid='cities'),
            Sec('A local studio, or a designer in another city?',
                Options([dict(name='A studio in your city', tag='Local', rows=[('Good for', 'Owners who want to sit across a table'),
                                                                              ('Ask about', 'Who designs and builds the site, and whose name the domain is in'),
                                                                              ('Price', 'Varies by city: see the city pages')]),
                         dict(name='U Scale, from Mumbai', tag='Remote', hi=True, rows=[('Good for', 'Owners happy to work over WhatsApp and video calls'),
                                                                                        ('Ask about', 'When I can start; I take a few projects at a time'),
                                                                                        ('Price', f'Fixed in writing, from {price("Landing page")}')])],
                        note='Not sure? The first audit is free either way, and I will tell you honestly if a local studio suits you better.'),
                eyebrow='Compared', layout='wide', sid='compared'),
            Sec('Websites by type of business',
                Links([('/services/website-design-mumbai/restaurants-cafes', 'menu', 'Restaurants and cafés', 'Your menu and your own online ordering, with no app commission.', price('Restaurant site + own online ordering')),
                       ('/services/website-design-mumbai/boutiques-fashion', 'tag', 'Boutiques and clothing stores', 'A catalogue with WhatsApp orders, or a full online store.', f'From {price("Business site, 5–10 pages")}'),
                       ('/services/ecommerce-website-mumbai', 'cart', 'Online stores', 'Product pages Google can find, a cart, UPI and card payments.', f'From {STORE}')]),
                eyebrow='By business', layout='wide', sid='types'),
        ],
        faq=[('How much does a website cost in India?',
              'About ₹8,000–₹30,000 for a basic template website, ₹40,000–₹2 lakh for a custom-designed one and ₹25,000–₹3 lakh for an online store, according '
              f'to 16 published price guides compared in 2026. U Scale’s fixed prices are {price("Landing page")} for a landing page, '
              f'{price("Business site, 5–10 pages")} for a 5–10 page business site and from {STORE} for an online store.'),
             ('Can you build my website if I am not in Mumbai?',
              'Yes. The whole project runs over WhatsApp and video calls: a free audit, a written plan with a fixed price, designs you review in Figma on '
              'your own phone and laptop, then the build and launch. The prices are the same as in Mumbai.'),
             ('Which cities do you work with?',
              f'Any city in India. There are pages for {names}, and I meet clients in person in Mumbai, Thane and Navi Mumbai.'),
             ('Do you have an office in my city?',
              'No. U Scale is based in Mumbai (Ghatkopar West) and has no offices elsewhere. If you want someone who can visit you, a studio in your '
              'city is the better choice.'),
             ('How do payments work, and is GST added?',
              'You pay 20% to start, 20% when you approve the design and 60% when the site is live. No GST is charged on U Scale prices right now.'),
             ('How long does a website take?',
              'Most business sites go live in 3–4 weeks from the start date, and a landing page in under two weeks. You get the start date in writing before the advance.'),
             ('Can my website be in Hindi or another Indian language?',
              f'Yes. I write in English and Hindi. For other languages I build the pages from your own text or a translator’s, with a language switch '
              f'Google understands. Writing the copy is {price("Website copy")}.'),
             ('Do you also do SEO for businesses outside Mumbai?',
              'Yes. Technical and on-page SEO, AI search visibility and Google Business Profile management are all done remotely, on monthly plans with '
              'published prices, and your Google listing stays in your name.')],
        sources=['g-hostinger', 'g-goodfirms', 'g-esc', 'g-zethic', 'g-pac', 'g-mwd'],
        offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products'],
        work=[],
        related_html=_rel([('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/freelance-web-designer-mumbai', 'Hire', 'Freelance web designer', 'Hire one person, not an agency team.'),
                           ('/tools/website-cost-calculator', 'Free tool', 'Website cost calculator', 'An estimate in a minute, from published prices.'),
                           ('/blog/website-design-cost-mumbai', 'Guide', 'Website design cost (2026)', 'Market ranges, yearly costs and red flags.'),
                           ('/services/website-design-mumbai/website-banane-ka-kharcha', 'Guide', 'Website banane ka kharcha', 'Poora hisaab, Hinglish mein.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]))


GP.OG.update({'ecommerce-website-mumbai': 'og-ecommerce-website-mumbai', 'google-business-profile-mumbai': 'og-google-business-profile-mumbai',
              'freelance-web-designer-mumbai': 'og-freelance-web-designer-mumbai', 'website-cost-calculator': 'og-website-cost-calculator',
              'website-design-thane': 'og-website-design-thane', 'website-design-navi-mumbai': 'og-website-design-navi-mumbai',
              'digital-marketing-mumbai': 'og-digital-marketing-mumbai', 'website-design-india': 'og-website-design-india'})
GP.OG_ALT.update({'ecommerce-website-mumbai': 'E-commerce website development in Mumbai, by U Scale',
                  'google-business-profile-mumbai': 'Google Business Profile management in Mumbai, by U Scale',
                  'freelance-web-designer-mumbai': 'Freelance web designer in Mumbai: Mehul Karotra of U Scale',
                  'website-cost-calculator': 'Free website cost calculator for India, by U Scale',
                  'website-design-thane': 'Website design in Thane, Kalyan and Dombivli, by U Scale',
                  'website-design-navi-mumbai': 'Website design in Navi Mumbai, Vashi to Panvel, by U Scale',
                  'digital-marketing-mumbai': 'Digital marketing in Mumbai by one specialist: Mehul Karotra of U Scale',
                  'website-design-india': 'Website design and development for businesses across India, by U Scale'})

GP.SRC.update({
    'tmc-list': ('Thane District, Government of Maharashtra', 'Municipal corporations in Thane district', 'https://thane.nic.in/en/municipal-corporations/'),
    'mpcb-thane': ('Maharashtra Pollution Control Board', 'Industries in the Thane region, incl. Wagle Industrial Estate (MIDC)', 'https://mpcb.gov.in/sites/default/files/industrial-statistics/sro-industry/SROthane1_SROdatabase_31072014.pdf'),
    'mpcb-dombivli': ('Maharashtra Pollution Control Board, 2018', 'Action plan for the Dombivli industrial cluster (MIDC Dombivli, set up in 1964)', 'https://www.mpcb.gov.in/sites/default/files/pollution-index/clusture-report/MPCB_CEPI_Report_Dombivali_June_20032018.pdf'),
    'mpcb-ttc': ('Maharashtra Pollution Control Board', 'Navi Mumbai industrial cluster: TTC MIDC, Turbhe to Rabale', 'https://www.mpcb.gov.in/sites/default/files/pollution-index/industrial-clusture/NaviMumbaiCEPIprsentation.pdf'),
    'apmc': ('APMC Mumbai', 'Markets of the Agricultural Produce Market Committee, Vashi', 'https://mumbaiapmc.org/en/market-en'),
    'mindspace': ('Mindspace Business Parks', 'Mindspace Airoli East', 'https://www.mindspaceindia.com/airoli-east/'),
    'cidco': ('CIDCO, Government of Maharashtra', 'About CIDCO, the planning authority for Navi Mumbai', 'https://cidco.maharashtra.gov.in/Page?Token=613552F54'),
    'nmia': ('Business Today, 25 Dec 2025', 'Navi Mumbai International Airport starts operations', 'https://www.businesstoday.in/india/story/navi-mumbai-international-airport-starts-operations-with-15-domestic-flights-indigo-flies-first-arrival-508118-2025-12-25'),
    'th-websetgo': ('WebSetGo, Thane, seen 10 Nov 2026', 'Website packages and prices', 'https://websetgo.co.in/'),
    'th-vebbly': ('Vebbly, Thane, seen 10 Nov 2026', 'Website design company in Thane: prices', 'https://vebbly.in/insights/best-website-design-company-in-thane.php'),
    'th-s2h': ('S2H Digital, Thane West, seen 10 Nov 2026', 'Thane web design company', 'https://s2hdigital.com/thane-web-design-company/'),
    'nm-go1': ('Go One Digital, Kharghar, seen 10 Nov 2026', 'Startup website packages', 'https://go1digital.com/startup-packages/'),
    'nm-sysmic': ('Sysmic, Kalamboli, seen 10 Nov 2026', 'Website design and development prices', 'https://www.sysmic.in/website-design-and-development-company/'),
    'nm-collegare': ('Collegare India, CBD Belapur, seen 10 Nov 2026', 'Website designing company in CBD Belapur', 'https://www.collegareindia.com/Website-Designing-Company-in-CBD-Belapur.html'),
})
GP.SVGS.update({'th-map': lambda: __import__('depth_art').thane_map(), 'nm-map': lambda: __import__('depth_art').navi_map()})

WEB_FAQ = (f'With U Scale, a landing page is {price("Landing page")}, a 5–10 page business website {price("Business site, 5–10 pages")}, a 10–20 page site '
           f'with a blog {price("Business site, 10–20 pages + blog")} and an online store from {STORE}, the same fixed prices as in Mumbai.')

THANE = dict(
    slug='website-design-thane', path='services/website-design-thane', kind='area', crumb='Thane',
    service='Website design and local SEO in Thane, Kalyan and Dombivli', service_type='Website design',
    card='Websites, Google Maps and local SEO for Thane, Kalyan and Dombivli, with meetings at your shop.',
    places=['Thane West', 'Thane East', 'Ghodbunder Road', 'Wagle Estate', 'Kalyan', 'Dombivli'],
    area_ld=[aeo.place('Thane'), {'@type': 'City', 'name': 'Kalyan'}, {'@type': 'City', 'name': 'Dombivli'}],
    wa_msg="Hi Mehul, I run a business in Thane. I'd like a free audit for my website and Google listing.",
    title='Website Design & SEO in Thane, Kalyan & Dombivli | U Scale',
    desc='Websites, Google Maps and local SEO for Thane businesses, from Ghodbunder Road to Kalyan and Dombivli. Fixed prices from ₹25,000, meetings in person.',
    h1='Website design in Thane', eyebrow='Thane, Kalyan and Dombivli',
    lead='I’m Mehul Karotra, a website designer based in Ghatkopar West, a short ride down the Central line from Thane. I design and build websites and run Google listings and local SEO for businesses in Thane, Kalyan and Dombivli, and I can meet you at your shop or office.',
    stats=[(price('Landing page'), 'Websites from'), (LOCAL.split('/')[0], 'Local SEO, per month'), ('In person', 'Meetings at your shop')],
    art=dict(kind='map', map='th-map'),
    answer=(f'U Scale is Mehul Karotra, a website designer and digital marketer based in Ghatkopar West, Mumbai, who works in person with businesses in '
            f'Thane, Kalyan and Dombivli. He designs and hand-codes websites at fixed prices (a landing page {price("Landing page")}, a 5–10 page business '
            f'site {price("Business site, 5–10 pages")}, an online store from {STORE}) and runs Google Business Profile and local SEO work at '
            f'{LOCAL.replace("/mo", " a month")}. Every project starts with a free audit.'),
    facts=[('Based in', 'Ghatkopar West, Mumbai, on the Central line to Thane'),
           ('Areas', 'Thane West (Naupada, Vartak Nagar, Majiwada, Ghodbunder Road), Thane East, Wagle Estate, Kalyan and Dombivli'),
           ('Meetings', 'At your shop or office, or over WhatsApp and video calls'),
           ('Website prices', WEB_PRICES),
           ('Local SEO', f'Google Business Profile and local SEO {LOCAL}'),
           ('Free audit', 'Your website, Google listing and Instagram, checked before you pay anything'),
           ('Languages', 'English and Hindi')],
    sections=[
        Sec('Thane by area: what businesses here need online',
            Cards([('store', 'Thane West', 'Shops, clinics, coaching classes and restaurants from Naupada and Vartak Nagar to Majiwada, where people search on the way home.'),
                   ('pin', 'Ghodbunder Road', 'Newer housing societies, and the salons, clinics, gyms and cafés that serve them. A complete Google listing matters most here.'),
                   ('box', 'Wagle Estate', 'An MIDC industrial estate of manufacturers and suppliers, whose buyers check a website before they ask for a quote. ' + GP.src_chip('mpcb-thane')),
                   ('truck', 'Kalyan and Dombivli', 'Retail and wholesale traders, and the textile, chemical and engineering units of Dombivli MIDC, set up in 1964. ' + GP.src_chip('mpcb-dombivli')),
                   ('pin', 'Thane East', 'Shops, clinics and services east of the station, which people search for as “Thane East”, not just Thane.'),
                   ('layers', 'Kalwa and Mumbra', 'Across the creek but inside Thane’s municipal limits, with busy markets of their own and their own names in search.')], cols=2),
            eyebrow='By area', layout='wide', sid='areas'),
        Sec('How Thane customers search',
            P('Thane, Navi Mumbai and Kalyan-Dombivli each have their own municipal corporation, and people search by their own area names, not “Mumbai”: '
              '“dentist in Thane West”, “CA near Thane station”, “cake shop Dombivli East”. Many search in Marathi, Hindi or Hinglish too. Your Google '
              'listing and your pages should use the words customers type and name the areas you actually serve. ' + GP.src_chip('tmc-list')),
            Chips(['Thane West', 'Thane East', 'Naupada', 'Vartak Nagar', 'Majiwada', 'Ghodbunder Road', 'Wagle Estate', 'Kalwa', 'Mumbra', 'Dombivli', 'Kalyan'],
                  'Area names Thane customers type'),
            eyebrow='Search in Thane'),
        Sec('Prices: the same as in Mumbai',
            Table(['Website', 'U Scale price'], [('Landing page', price('Landing page')), ('Business site, 5–10 pages', price('Business site, 5–10 pages')),
                                                 ('Business site, 10–20 pages + blog', price('Business site, 10–20 pages + blog')), ('Online store, under 50 products', STORE),
                                                 ('Local SEO and Google Business Profile', LOCAL)], 'U Scale prices for Thane businesses'),
            Note('Thane market, for comparison: one Thane studio lists packages from ₹3,999 to ₹20,000 and more; another lists brochure sites at ₹15,000–₹30,000, '
                 'business sites at ₹35,000–₹75,000 and online stores from ₹60,000; a third quotes ₹15,000 to ₹1,50,000 and more (studios’ own pages, seen '
                 '10 Nov 2026). Cheaper packages are usually templates: ask what you get, and whose name the domain is in.'),
            eyebrow='Prices', layout='wide', tone='band', sid='prices'),
        Sec('Websites, SEO and Google Maps for Thane businesses',
            P('Most Thane customers find a local business on Google Maps first, then check its website or Instagram before they call. So the work is '
              'usually three things together: a website that names your area and services, a complete Google Business Profile, and a steady flow of '
              'genuine reviews. For factories and suppliers in Wagle Estate or Dombivli MIDC, a website with your products, capacity and certifications '
              'often matters more than the map. Check where your listing stands first with the free '
              + _link('/tools/google-business-profile-checker', 'Google Business Profile checker') + '.'),
            Links([('/services/website-design-mumbai', 'globe', 'A website for your Thane business', 'Designed in Figma, hand-coded, with your areas and services named the way customers search.', f'From {price("Landing page")}'),
                   ('/services/google-business-profile-mumbai', 'pin', 'Your Google listing, managed', 'Verified, the right categories, hours, photos, weekly posts and replies to reviews.', LOCAL),
                   ('/services/ecommerce-website-mumbai', 'cart', 'An online store', 'For Thane brands selling across India: products, cart, UPI and card payments.', f'From {STORE}')]),
            eyebrow='Services', layout='wide', sid='services'),
    ],
    faq=[('Is there a website designer near me in Thane?',
          'Yes. Mehul Karotra of U Scale is based in Ghatkopar West, a short ride down the Central line, and designs and builds websites for businesses '
          'across Thane, Kalyan and Dombivli. He can meet you at your shop or office, and every project starts with a free audit.'),
         ('How much does a website cost in Thane?', WEB_FAQ + ' Thane studios’ own pages, seen in November 2026, range from about ₹4,000 template packages to over ₹1.5 lakh.'),
         ('Do you work with businesses on Ghodbunder Road?',
          'Yes. Ghodbunder Road’s housing societies keep salons, clinics, gyms, tuition classes and cafés busy, and most of their customers search on '
          'Google Maps by society or landmark. A complete listing with real photos, a website with your services and prices, and steady reviews '
          'from residents is usually the place to start.'),
         ('Can my Thane website be in Marathi?',
          'Yes. Many Thane customers read Marathi, so a Marathi version of your key pages, or a Marathi line next to the English, can help. I build '
          f'the pages from your own Marathi text or a translator’s, with a language switch Google understands; writing the copy is {price("Website copy")}.'),
         ('Do you work in Kalyan and Dombivli?',
          'Yes. Kalyan and Dombivli are further up the same Central line, and the prices are the same. Meetings can be at your shop or office, or over WhatsApp and video calls.'),
         ('Do you build websites for manufacturers in Wagle Estate and Dombivli MIDC?',
          f'Yes. A website for a manufacturer or supplier usually needs product or capability pages, certifications, clients you are allowed to show and '
          f'a clear enquiry form. It is priced as a business site, from {price("Business site, 5–10 pages")} for 5–10 pages.'),
         ('How do I get my Thane business on Google Maps?',
          'Verify your Google Business Profile at your exact Thane address, with the area customers use, Naupada or Ghodbunder Road, in the address. '
          'If you serve customers at home across Thane, Kalyan and Dombivli, list those as service areas instead. Then complete the hours, photos and '
          'services, and ask every customer for a review. Nobody can promise a top-3 spot, because distance from the searcher decides part of it.'),
         ('Do you also handle social media and ads for Thane businesses?',
          'Yes. Besides the website and Google listing, I run Instagram and Facebook, and Google and Meta ads, for Thane businesses on monthly plans with '
          'published prices. Most start with the website and the listing, then add the rest.')],
    sources=['tmc-list', 'mpcb-thane', 'mpcb-dombivli', 'local-rank', 'th-websetgo', 'th-vebbly', 'th-s2h'],
    offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'Local SEO / Google Business Profile'],
    work=[])

NAVI = dict(
    slug='website-design-navi-mumbai', path='services/website-design-navi-mumbai', kind='area', crumb='Navi Mumbai',
    service='Website design and local SEO in Navi Mumbai', service_type='Website design',
    card='Websites, Google Maps and local SEO from Airoli and Vashi to Kharghar and Panvel, with meetings at your shop.',
    places=['Vashi', 'Airoli', 'Nerul', 'CBD Belapur', 'Kharghar', 'Panvel'],
    area_ld=[aeo.place('Navi Mumbai'), {'@type': 'City', 'name': 'Panvel'}],
    wa_msg="Hi Mehul, I run a business in Navi Mumbai. I'd like a free audit for my website and Google listing.",
    title='Website Design & SEO in Navi Mumbai: Vashi to Panvel',
    desc='Websites, Google Maps and local SEO for Navi Mumbai businesses in Vashi, Nerul, Belapur, Kharghar, Airoli and Panvel. Fixed prices from ₹25,000.',
    h1='Website design in Navi Mumbai', eyebrow='Vashi to Panvel',
    lead='I’m Mehul Karotra, a website designer based in Ghatkopar West, across Thane Creek from Navi Mumbai. I design and build websites and run Google listings and local SEO for businesses from Airoli and Vashi to Nerul, Belapur, Kharghar and Panvel, and I can meet you at your shop or office.',
    stats=[(price('Landing page'), 'Websites from'), (LOCAL.split('/')[0], 'Local SEO, per month'), ('In person', 'Meetings at your shop')],
    art=dict(kind='map', map='nm-map'),
    answer=(f'U Scale is Mehul Karotra, a website designer and digital marketer based in Ghatkopar West, Mumbai, who works in person with businesses across '
            f'Navi Mumbai, from Airoli and Vashi to Nerul, CBD Belapur, Kharghar and Panvel. He designs and hand-codes websites at fixed prices (a landing page '
            f'{price("Landing page")}, a 5–10 page business site {price("Business site, 5–10 pages")}, an online store from {STORE}) and runs Google '
            f'Business Profile and local SEO work at {LOCAL.replace("/mo", " a month")}. Every project starts with a free audit.'),
    facts=[('Based in', 'Ghatkopar West, Mumbai, across Thane Creek'),
           ('Areas', 'Airoli, Ghansoli, Vashi, Sanpada, Nerul, CBD Belapur, Kharghar, Panvel and the TTC MIDC belt'),
           ('Meetings', 'At your shop or office, or over WhatsApp and video calls'),
           ('Website prices', WEB_PRICES),
           ('Local SEO', f'Google Business Profile and local SEO {LOCAL}'),
           ('Free audit', 'Your website, Google listing and Instagram, checked before you pay anything'),
           ('Languages', 'English and Hindi')],
    sections=[
        Sec('Navi Mumbai by area: what businesses here need online',
            Cards([('store', 'Vashi', 'Shops, clinics and restaurants, and the wholesale trade around the APMC markets, whose head office is in Vashi. ' + GP.src_chip('apmc')),
                   ('box', 'The TTC MIDC belt', 'Turbhe, Mahape, Koparkhairane and Rabale: manufacturers and suppliers whose buyers check a website before they ask for a quote. ' + GP.src_chip('mpcb-ttc')),
                   ('layers', 'Airoli', 'The Mindspace IT parks, and the cafés, gyms and services around the offices. ' + GP.src_chip('mindspace')),
                   ('pin', 'Nerul, Belapur and Kharghar', 'CBD Belapur’s offices, and the clinics, coaching classes and cafés of Nerul and Kharghar.'),
                   ('truck', 'Panvel', 'A growing town at the end of the Harbour line, near the new Navi Mumbai International Airport, open since December 2025. ' + GP.src_chip('nmia')),
                   ('chat', 'Customers who ask first', 'Wherever you are in Navi Mumbai, a WhatsApp button and a complete Google listing turn searches into enquiries.')], cols=3),
            eyebrow='By area', layout='wide', sid='areas'),
        Sec('How Navi Mumbai customers search',
            P('Navi Mumbai is a planned city, developed by CIDCO since 1970, and its addresses run by node and sector. People search the way they give '
              'directions: “dentist Sector 17 Vashi”, “cafe in Kharghar”, “CA near Belapur station”, not “Mumbai”. Your Google listing and your website '
              'should name your node and sector exactly as customers type them. ' + GP.src_chip('cidco')),
            Table(['Node', 'How people search', 'Name it on your listing as'],
                  [('Vashi', '“physiotherapist sector 17 vashi”', 'Sector and node, e.g. “Sector 17, Vashi”'),
                   ('Kharghar', '“cafe in kharghar sector 35”', 'Sector and node, with the nearest landmark'),
                   ('CBD Belapur', '“ca near belapur station”', 'Node and station, for offices'),
                   ('Airoli', '“gym airoli sector 5”', 'Sector and node; Mindspace for office-park businesses')],
                  'How Navi Mumbai customers search by node and sector: illustrative searches'),
            eyebrow='Search in Navi Mumbai', layout='wide'),
        Sec('Prices: the same as in Mumbai',
            Table(['Website', 'U Scale price'], [('Landing page', price('Landing page')), ('Business site, 5–10 pages', price('Business site, 5–10 pages')),
                                                 ('Business site, 10–20 pages + blog', price('Business site, 10–20 pages + blog')), ('Online store, under 50 products', STORE),
                                                 ('Local SEO and Google Business Profile', LOCAL)], 'U Scale prices for Navi Mumbai businesses'),
            Note('Navi Mumbai market, for comparison: a Kharghar studio lists packages at ₹4,999, ₹9,999 and ₹24,999; a Kalamboli studio lists static sites '
                 'from ₹8,000, dynamic sites at ₹20,000–₹50,000 and online stores from ₹30,000; a CBD Belapur studio starts at ₹7,999 (studios’ own pages, '
                 'seen 10 Nov 2026). A ₹5,000 package is almost always a template, so compare what you get, not just the price.'),
            eyebrow='Prices', layout='wide', tone='band', sid='prices'),
        Sec('Websites, SEO and Google Maps for Navi Mumbai businesses',
            P('In a city of nodes and sectors, people look you up on Google Maps, check your page, then call or message. Three things decide whether they '
              'pick you: a site that names your node and what you do, a Google listing with the right sector and pin, and reviews from people nearby. '
              'B2B buyers in the TTC MIDC belt work differently: they want products, capacity and certifications before they ask for a quote. '
              'Check where your listing stands first with the free ' + _link('/tools/google-business-profile-checker', 'Google Business Profile checker') + '.'),
            Links([('/services/website-design-mumbai', 'globe', 'A website for your Navi Mumbai business', 'Designed in Figma, hand-coded, with your node and sector named the way customers search.', f'From {price("Landing page")}'),
                   ('/services/google-business-profile-mumbai', 'pin', 'Your Google listing, managed', 'Verified, the right categories, hours, photos, weekly posts and replies to reviews.', LOCAL),
                   ('/services/website-design-mumbai/restaurants-cafes', 'menu', 'Restaurant and café websites', 'Your own menu and ordering for Vashi, Nerul and Kharghar regulars, no app commission.', price('Restaurant site + own online ordering'))]),
            eyebrow='Services', layout='wide', sid='services'),
    ],
    faq=[('Is there a website designer near me in Navi Mumbai?',
          'Yes. Mehul Karotra of U Scale is based in Ghatkopar West, across Thane Creek, and designs and builds websites for businesses from Airoli and '
          'Vashi to Nerul, CBD Belapur, Kharghar and Panvel. The first audit is free, in person or on a video call.'),
         ('How much does a website cost in Navi Mumbai?', WEB_FAQ + ' Navi Mumbai studios’ own pages, seen in November 2026, start from about ₹5,000 for template packages.'),
         ('Do you work in Panvel and Kharghar?',
          'Yes, at the same prices as Vashi or Mumbai. Kharghar and Panvel are further along the Harbour line, so we can meet at your place or do most of '
          'the work on WhatsApp and video calls, whichever suits you.'),
         ('Do you build websites for suppliers in the TTC MIDC area?',
          f'Yes. A website for a manufacturer or supplier usually needs product or capability pages, certifications, clients you are allowed to show and '
          f'a clear enquiry form. It is priced as a business site, from {price("Business site, 5–10 pages")} for 5–10 pages.'),
         ('How do I get my Navi Mumbai business on Google Maps?',
          'Write the address the way Navi Mumbai does: building, sector and node, like “Sector 17, Vashi”, and place the pin on your door, not the '
          'sector’s centre. Pick the most specific category, add hours and photos, and ask customers for reviews. Distance from the searcher still '
          'decides part of the ranking, so nobody can promise a top-3 spot.'),
         ('Do you work with APMC traders and MIDC suppliers?',
          'Yes. Wholesale traders around the APMC markets and suppliers in the TTC MIDC belt usually need a catalogue their buyers can check before '
          'they call: products, capacity, certifications and a clear enquiry form. That is a business site, from '
          f'{price("Business site, 5–10 pages")} for 5–10 pages.')],
    sources=['cidco', 'apmc', 'mpcb-ttc', 'mindspace', 'nmia', 'local-rank', 'nm-go1', 'nm-sysmic', 'nm-collegare'],
    offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'Local SEO / Google Business Profile'],
    work=[])

if ECOM not in GP.PAGES:
    GP.PAGES.insert(2, ECOM)  # after restaurants and boutiques: the website types first
    areas_at = max(i for i, q in enumerate(GP.PAGES) if q['kind'] == 'area') + 1
    GP.PAGES[areas_at:areas_at] = [THANE, NAVI]  # after Ghatkopar and Andheri


def hub_cards():
    """Link cards on the services hub for the pages that are not one of the five core services or a website type."""
    items = [('/services/digital-marketing-mumbai', 'Digital marketing', 'Digital marketing in Mumbai', 'What one specialist covers instead of an agency team, with every price.'),
             ('/services/google-business-profile-mumbai', 'Local SEO', 'Google Business Profile management', 'Set-up, verification, weekly posts, reviews and suspension fixes.'),
             ('/freelance-web-designer-mumbai', 'Hire', 'Freelance web designer in Mumbai', 'Hire Mehul directly: fixed price, designed in Figma, hand-coded.'),
             ('/tools/website-cost-calculator', 'Free tool', 'Website cost calculator', 'An estimate in a minute, from published prices.')]
    li = ''.join(f'<li><a class="fp-rel" href="{ea(h)}"><span class="fp-rel__k">{e(k)}</span><b>{e(t)}</b><span class="fp-rel__d">{e(d)}</span>{icon("arrow")}</a></li>'
                 for h, k, t, d in items)
    return f'<nav class="fp-related fp-related--parent" aria-label="More services and pages"><p class="eyebrow">Also on this site</p><ul>{li}</ul></nav>'


def standalone(ctx=None):
    """The pages that are not in GP.PAGES (they don't belong in the website-design "Keep reading" rail)."""
    return [gbp_page_dict(), freelancer_dict(ctx), calc_dict(), digital_dict(), india_dict()]


def build(ctx, parts):
    rels = []
    for p in standalone(ctx):
        f = ctx['site'] / (GP.path_of(p) + '.html')
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(GP.page(ctx, parts, p))
        rels.append(GP.path_of(p) + '.html')
    return rels


def llms_full(site):
    L = []
    for p in standalone():
        L += [f'## {p["h1"]}', '', f'URL: {GP.url_of(site, p)}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for s in p['sections']:
            body = '\n\n'.join(x for x in (GP.text(b) for b in s['blocks']) if x)
            if body: L += [f'### {s["h"]}', '', body, '']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in p['faq']]
        if p['sources']: L += ['Sources: ' + '; '.join(f'{GP.SRC[k][1]} ({GP.SRC[k][0]}) {GP.SRC[k][2]}' for k in p['sources']), '']
    return L


def llms_lines(site):
    pages = standalone()
    return ['', '## More pages', ''] + [f'- [{p["h1"]}]({GP.url_of(site, p)}): {p["desc"]}' for p in pages]


def images_by_url(site):
    return {GP.url_of(site, p): [(site + i['file'][1:] + '.webp', i['caption']) for i in GP.page_images(p)] for p in standalone()}
