"""Website design prices in India: what studios in 12 cities publish, side by side, at /website-design-prices-india.

A living data page (research roadmap of 23 Nov 2026, W2). Every market figure here is one already published on a uscale.in city or
guide page, taken from the studio's or guide's own page on the date shown, with its source linked. Nothing is estimated. U Scale's own
prices are shown separately and are not counted in any range. Refresh every three months: re-open each source, update the figures and
the "seen" dates, and add a line to CHANGES.
"""
import geo_pages as GP
from geo_pages import P, Cards, Check, Html, Note, Sec, Table, price, _fmt

e, ea = GP.e, GP.ea
TOP = 300000

# city, our page, (lowest, highest) package seen, note under the bar, what each studio page publishes, sources, date seen
CITIES = [
    ('Mumbai', '/services/website-design-mumbai', 8000, 300000, 'from a template site to an online store',
     ['Basic template site ₹8,000–₹30,000', 'Custom-designed site ₹40,000–₹2,00,000', 'Online store ₹25,000–₹3,00,000'],
     GP.GUIDES, '16 price guides, 2025–26, compared in October 2026'),
    ('Thane', '/services/website-design-thane', 4000, 150000, 'to over ₹1.5 lakh',
     ['From about ₹4,000 for a template package to over ₹1.5 lakh'], ['th-websetgo', 'th-vebbly', 'th-s2h'], 'seen 10 Nov 2026'),
    ('Navi Mumbai', '/services/website-design-navi-mumbai', 4999, 24999, 'one Kharghar studio’s three packages',
     ['Studios start at about ₹5,000', 'One Kharghar studio: ₹4,999, ₹9,999 and ₹24,999'], ['nm-go1', 'nm-sysmic', 'nm-collegare'], 'seen 10 Nov 2026'),
    ('Pune', '/services/website-design-pune', 5000, 250000, 'to over ₹2.5 lakh for a store',
     ['Template site ₹5,000–₹18,000', 'Business site, 5–10 pages ₹20,000–₹60,000', 'Custom-designed ₹60,000–₹1.5 lakh', 'Online store ₹25,000 to over ₹2.5 lakh'],
     ['pune-p1', 'pune-p2', 'pune-p3', 'pune-p4'], 'seen 8 Nov 2026'),
    ('Bengaluru', '/services/website-design-bengaluru', 8750, 75900, 'basic to “premium” packages',
     ['Basic site, about 5 pages ₹8,750–₹22,750', '“Premium” design ₹23,350–₹75,900', 'Custom design from ₹15,000 at one studio to ₹64,850+ at another',
      'Online store from ₹25,000–₹35,000'], ['blr-p1', 'blr-p2', 'blr-p3'], 'seen 8 Nov 2026'),
    ('Chennai', '/services/website-design-chennai', 5000, 250000, 'to over ₹2.5 lakh for a store',
     ['Template or static site ₹5,000–₹30,000', 'Custom business site ₹20,000–₹1 lakh', 'Online store mostly ₹40,000–₹1.2 lakh, from ₹18,000 to over ₹2.5 lakh'],
     ['chn-p1', 'chn-p2', 'chn-p3'], 'seen 8 Nov 2026'),
    ('Delhi NCR', '/services/website-design-delhi-ncr', 9999, 100000, 'agency CMS sites start at ₹1 lakh + GST',
     ['Starter site from ₹9,999', '1–5 page WordPress site ₹15,000–₹35,000', 'Agency CMS sites from ₹1,00,000 + GST'], ['dl-p1', 'dl-p2', 'dl-p3'], 'seen 9 Nov 2026'),
    ('Hyderabad', '/services/website-design-hyderabad', 6999, 15000, '5-page and 10-page packages',
     ['5-page static site ₹6,999–₹9,900', '10-page site ₹12,999–₹15,000'], ['hy-p1', 'hy-p2', 'hy-p3'], 'seen 9 Nov 2026'),
    ('Kolkata', '/services/website-design-kolkata', 2499, 19999, 'one-page to 15-page packages',
     ['One-page site ₹2,499–₹2,999', '8–15 page site ₹9,999–₹19,999'], ['kol-p1', 'kol-p2', 'kol-p3'], 'seen 9 Nov 2026'),
    ('Ahmedabad', '/services/website-design-ahmedabad', 24999, 50000, 'starter to a 10-page CMS site',
     ['Starter site from ₹24,999–₹25,000', '10-page CMS site ₹50,000'], ['ahd-p1', 'ahd-p2'], 'seen 9 Nov 2026'),
    ('Surat', '/services/website-design-surat', 2999, 20000, 'one-page to a 5-page WordPress site',
     ['One-page site from ₹2,999', 'Basic business site from about ₹15,000', '5-page WordPress site ₹20,000'], ['srt-p1', 'srt-p2', 'srt-p3'], 'seen 9 Nov 2026'),
    ('Jaipur', '/services/website-design-jaipur', 9000, 25000, '5-page to custom packages',
     ['5-page site ₹9,000', 'Custom sites from ₹22,000–₹25,000'], ['jpr-p1', 'jpr-p2', 'jpr-p3'], 'seen 9 Nov 2026'),
]
BUILDER_SRC = ['wix', 'squarespace', 'hostinger-builder', 'shopify']
YEARLY_SRC = ['in-domain', 'hosting']
CHANGES = [('23 Nov 2026', 'First published. Figures as seen on 8–10 November 2026 (cities) and in October 2026 (Mumbai and India price guides). '
            'On 23 November all 55 sources were checked again: 54 were online, and one Surat studio’s page returned a server error, so its figure is shown as seen on 9 November.')]


def _bars():
    """Lowest to highest package seen in each city, on one scale. No U Scale marker: our prices are shown separately."""
    lab = lambda v: '₹0' if v == 0 else f'₹{v // 100000}L'
    axis = ''.join(f'<span style="--x:{v / TOP * 100:.2f}%">{lab(v)}</span>' for v in (0, 100000, 200000, 300000))
    li = ''.join(f'<li style="--lo:{lo / TOP * 100:.2f}%;--hi:{hi / TOP * 100:.2f}%;--i:{i}"><b>{e(c)}</b>'
                 f'<span class="mv-rg__track"><i class="mv-rg__bar"></i></span><small>{_fmt(lo)}–{_fmt(hi)} · {e(n)}</small></li>'
                 for i, (c, _, lo, hi, n, *_r) in enumerate(CITIES))
    html = (f'<div class="mv-rg mv-rg--plain" data-reveal><p class="mv-rg__key"><span class="mv-rg__k1">Lowest to highest package seen, by city</span></p>'
            f'<ul>{li}</ul><p class="mv-rg__axis" aria-hidden="true">{axis}</p></div>')
    return html, '; '.join(f'{c}: {_fmt(lo)} to {_fmt(hi)} ({n})' for c, _, lo, hi, n, *_r in CITIES)


def _src_links(keys):
    return ', '.join(f'<a class="tlink" href="{ea(GP.SRC[k][2])}" target="_blank" rel="noopener">{e(GP.SRC[k][0].split(",")[0])}</a>'
                     for k in keys) + '<span class="sr-only"> (links open in a new tab)</span>'


def _city_cards():
    items = []
    for c, href, lo, hi, n, lines, srcs, seen in CITIES:
        body = '<br>'.join(e(x) for x in lines)
        if c == 'Mumbai':
            src = f'From {e(seen)}, listed under Sources below.'
        else:
            src = f'Studios’ own pages, {e(seen)}: {_src_links(srcs)}.'
        items.append(('pin', c, f'{body}<span class="sv-from sv-from--list"><span><span>{src}</span></span>'
                                f'<span><a class="tlink" href="{href}">Website design in {e(c)}</a></span></span>'))
    return Cards(items, cols=3)


def page(ctx=None):
    bars = _bars()
    return dict(
        slug='website-design-prices-india', path='website-design-prices-india', kind='guide', crumb='Website prices in India',
        trail=[('Services', '/services'), ('Website design', '/services/website-design-mumbai')],
        published='2026-11-23T00:00:00+05:30',
        service='Website design prices in India, compared by city', service_type='Website design',
        wa_msg="Hi Mehul, I saw the website prices page. I have a quote and I'd like a second opinion.",
        title='Website Design Prices in India 2026: 12 Cities Compared',
        desc='What web design studios in 12 Indian cities publish as prices, each figure linked to its source: ₹2,499 for one page to ₹3 lakh for a store.',
        h1='Website design prices in India, city by city', eyebrow='Data · Updated every three months',
        lead='Here is what web design studios in 12 Indian cities publish as website prices on their own pages, side by side, with every figure linked to where it came from. We sell websites too, so our prices are shown separately and not counted in any range.',
        stats=[('12', 'Cities compared'), ('49', 'Studio pages and price guides'), ('₹2,499', 'Lowest package seen')],
        art=dict(kind='card', card='prices'),
        answer='Published website prices in India run from ₹2,499 for a one-page site (Kolkata) to ₹3 lakh for an online store (Mumbai price guides), '
               'according to the pages of web design studios in 12 Indian cities and 16 Mumbai and India price guides, collected by U Scale in October and '
               'November 2026. In 11 of the 12 cities the cheapest package seen costs under ₹10,000. Custom design starts between ₹15,000 (one Bengaluru '
               'studio) and ₹60,000 (Pune studios). Domain and hosting add about ₹4,400–₹9,400 a year at renewal prices, before GST.',
        facts=[('Cities', 'Mumbai, Thane, Navi Mumbai, Pune, Bengaluru, Chennai, Delhi NCR, Hyderabad, Kolkata, Ahmedabad, Surat and Jaipur'),
               ('Sources', '33 studio pages in 11 cities, and 16 price guides for Mumbai and India'),
               ('Lowest package seen', '₹2,499 for a one-page site, Kolkata'),
               ('Highest figure seen', '₹3 lakh for an online store, Mumbai price guides'),
               ('Yearly costs', 'Domain and hosting about ₹4,400–₹9,400 a year at renewal, before GST'),
               ('Collected', 'October 2026 (guides) and 8–10 November 2026 (cities); next refresh by 23 February 2027'),
               ('Who collected it', 'U Scale. We sell websites, so our prices are listed apart and not counted')],
        sections=[
            Sec('The short version',
                P('Website prices in India are not one market. A one-page site was listed for ₹2,499 in Kolkata, and Mumbai’s price guides put an online '
                  'store at up to ₹3 lakh. Most of that spread comes from what is being sold: a template filled in with your text, or a site designed for you.',
                  'Use the figures below to judge a quote you already have. Look for the line that matches what you are being offered, then check what is included.'),
                eyebrow='In short', sid='short'),
            Sec('Published prices, city by city',
                Html(*bars),
                Note('Each bar runs from the cheapest to the most expensive package we saw on that city’s studio pages. Packages are not alike, so read the '
                     'details below before comparing two cities. Two to four studios were checked per city, so treat these as examples, not averages.'),
                _city_cards(),
                eyebrow='The data', layout='wide', sid='cities'),
            Sec('What the numbers say',
                Cards([('rupee', 'Cheap packages are everywhere', 'In 11 of the 12 cities the cheapest package seen was under ₹10,000. Ahmedabad was the exception: its two studios started at about ₹25,000.'),
                       ('pen', 'Custom design is where prices split', 'Custom design started at ₹15,000 at one Bengaluru studio and at ₹60,000 at Pune studios. Packages below that are mostly described as templates, static pages or basic sites.'),
                       ('layers', 'One city, a very wide range', 'Inside one city the range can run from a few thousand rupees to over ₹2.5 lakh, as in Pune and Chennai. The city tells you less than the package does.'),
                       ('file', 'GST is often extra', 'Several studios list prices before GST, such as the agency CMS sites in Delhi NCR and most Bengaluru packages. Ask whether a quote includes it.')], cols=2),
                eyebrow='Findings', layout='wide', sid='findings'),
            Sec('Costs you pay every year, whoever builds the site',
                P('A website has running costs after the build. Domain and hosting together come to about ₹4,400–₹9,400 a year at renewal prices, before GST, '
                  'going by the providers’ own pages. Offer prices for the first year are lower, so check the renewal price too.',
                  'If you build the site yourself on a website builder, you pay a monthly plan instead:'),
                Table(['Builder', 'Cheapest plan, per month, billed yearly', 'A year at that rate'],
                      [('Wix', '₹250 (Light)', '₹3,000'), ('Squarespace', '₹630 (Basic)', '₹7,560'),
                       ('Hostinger Website Builder', '₹139 (Premium, 4-year term; renews at ₹449)', '₹1,668'), ('Shopify', 'About ₹1,500–₹1,800 (Basic)', '₹18,000–₹21,600, plus 2% on every sale in India')],
                      'Yearly cost of website builders in India, from their own pricing pages, checked 10 November 2026'),
                eyebrow='Every year', layout='wide', sid='yearly'),
            Sec('Our own prices, shown apart',
                P('We build websites, so we are not neutral, and our prices are not part of any range on this page. For comparison: a landing page is '
                  f'{price("Landing page")}, a 5–10 page business site {price("Business site, 5–10 pages")}, a 10–20 page site with a blog '
                  f'{price("Business site, 10–20 pages + blog")} and an online store from {price("E-commerce, under 50 products")}. Every site is designed '
                  'in Figma for you and coded by hand, and the price is fixed in writing. They are the same in every city.',
                  'Every price is on the <a class="tlink" href="/pricing">pricing page</a>, and the <a class="tlink" href="/tools/website-cost-calculator">website cost calculator</a> puts them next to the market range for your own choices.'),
                eyebrow='Disclosure', sid='ours'),
            Sec('How to use this when you get a quote',
                Check(['Find the package that matches what you are offered: pages, custom design or template, and whether it is an online store.',
                       'Ask whether the price includes GST.',
                       'Ask for the renewal price of the domain and hosting as well as the first year’s price.',
                       'Ask whether the design is made for you or a theme, and which theme.',
                       'Make sure the domain, hosting and admin logins are in your name.',
                       'Ask who fixes things after launch, for how long, and what changes cost after that.']),
                P('Comparing a freelancer, an agency and a website builder? The <a class="tlink" href="/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder">freelancer vs agency vs website builder</a> guide covers who each one suits.'),
                eyebrow='Before you pay', layout='wide', tone='dark', sid='quote'),
            Sec('How this was collected',
                P('In October 2026 we read 16 website price guides published by Mumbai and Indian web firms, a hosting company and a directory, and noted the '
                  'ranges they give. On 8, 9 and 10 November 2026 we opened the pages where two to four studios in each of the other 11 cities list their '
                  'packages, and noted the prices exactly as written. Every source is linked on this page.',
                  'What this is not: a survey or an average. Studios that publish prices may differ from those that don’t, packages include different things, '
                  'and prices change. The date each figure was seen is shown with it.',
                  'This page is checked every three months. If you spot a figure that has changed, email <a class="tlink" href="mailto:uscalewithus@gmail.com">uscalewithus@gmail.com</a> and it will be corrected.'),
                Table(['Date', 'What changed'], CHANGES, 'Change log for this page'),
                eyebrow='Method', sid='method'),
        ],
        faq=[('How much does a website cost in India in 2026?',
              'Published prices run from ₹2,499 for a one-page site to ₹3 lakh for an online store. A basic template site is about ₹8,000–₹30,000 in Mumbai price '
              'guides, and a custom-designed site ₹40,000–₹2 lakh. The figures for each city, with sources, are on this page.'),
             ('Why are website prices so different between studios?',
              'Mostly because they sell different things. A cheap package is usually a template filled in with your text; a custom site is designed for you. '
              'Pages, an online store, writing, photos and GST also change the price.'),
             ('Is a website cheaper outside Mumbai?',
              'Cheap packages exist in every city we checked. In 11 of the 12 cities the cheapest package seen was under ₹10,000. What differs more is what each package includes.'),
             ('What yearly costs come after the website is built?',
              'Domain and hosting together come to about ₹4,400–₹9,400 a year at renewal prices, before GST. A website builder such as Wix or Shopify charges a monthly plan instead.'),
             ('Are U Scale’s prices included in these ranges?',
              'No. We build websites, so our prices are shown separately on this page and are not counted in any range.')],
        sources=[k for c in CITIES if c[0] != 'Mumbai' for k in c[6]] + list(GP.GUIDES) + BUILDER_SRC + YEARLY_SRC,
        offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products'], work=[],
        related_html=__import__('growth_pages')._rel([
            ('/tools/website-cost-calculator', 'Free tool', 'Website cost calculator', 'An estimate for your own choices, beside the market range.'),
            ('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'Guide', 'Freelancer vs agency vs builder', 'Who each one suits, and what each costs.'),
            ('/services/website-design-mumbai/website-banane-ka-kharcha', 'Guide', 'Website banane ka kharcha', 'Poora hisaab, Hinglish mein.'),
            ('/services/website-design-india', 'Service', 'Website design across India', 'How we work with businesses outside Mumbai.'),
            ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.'),
            ('/work/space-studio-chennai', 'Case study', 'Space Studio Chennai', 'A website rebuilt with every old link kept.')]),
        all_links='<a class="tlink" href="/services/website-design-india">Website design across India</a>')


GP.OG.update({'website-design-prices-india': 'og-website-design-prices-india'})
GP.OG_ALT.update({'website-design-prices-india': 'Website design prices in India, 12 cities compared, by U Scale'})
