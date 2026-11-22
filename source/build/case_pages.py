"""Case studies: one page per client project, at /work/<slug>.

Each page follows the same line: the client's situation, the decisions we made, and what anyone can open and check today.
Every fact here is either on the client's live site or already published on uscale.in (work cards, client quotes). No results,
traffic or sales figures are claimed, because none have been measured and agreed with the client.
Built with the shared page system in geo_pages.py; growth_pages.standalone() adds these to the build, the sitemap and llms-full.txt.
"""
import geo_pages as GP
import proof
from geo_pages import P, Cards, Check, Html, Sec, price

TRAIL = [('Work', '/#work')]
GP.OG.update({'space-studio-chennai': 'og-case-space-studio-chennai', 'sashe-by-prachi': 'og-case-sashe-by-prachi'})
GP.OG_ALT.update({'space-studio-chennai': 'Case study: the Space Studio Chennai website rebuild, by U Scale',
                  'sashe-by-prachi': 'Case study: the Sashe by Prachi fashion label website, by U Scale'})
EXT = '<span class="sr-only"> (opens in a new tab)</span>'


def _site(url, text):
    return f'<a class="tlink" href="{url}" target="_blank" rel="noopener">{text}</a>{EXT}'


def _link(href, text):
    return f'<a class="tlink" href="{href}">{text}</a>'


def _feature(ctx, key):
    """The client's live site in a browser frame with the phone version in front. Needs the build context; llms-full.txt skips it."""
    if ctx is None: return []
    import svc_pages as SVP
    w = {x[0]: x for x in ctx['WORK']}[key]
    return [Html(SVP._feature(ctx, key).replace('Latest project · live', 'Live site'), f'{w[1]}: {w[4]} Live at {w[5]}')]


def _rel(items):
    return __import__('growth_pages')._rel(items)


def space_studio(ctx=None):
    live = 'https://spacestudiochennai.com'
    return dict(
        slug='space-studio-chennai', path='work/space-studio-chennai', kind='guide', crumb='Space Studio Chennai', trail=TRAIL, published='2026-11-22T00:00:00+05:30',
        service='Website rebuild and SEO for an architecture practice', service_type='Website design',
        wa_msg="Hi Mehul, I read the Space Studio case study. I'd like a free audit of my website.",
        title='Space Studio Chennai Website Rebuild: Case Study | U Scale',
        desc='How we rebuilt the website of Space Studio, an office architecture practice in Chennai: 86 hand-coded pages, a 3D building model and every old link kept.',
        h1='Case study: Space Studio Chennai', eyebrow='Case study · Website rebuild and SEO',
        lead='Space Studio is an office architecture practice in Chennai, led by Ar. Shashi. We rebuilt its website, moving it off WordPress into 86 pages coded by hand, and kept every old address working. The site is live, so you can check each point on this page yourself.',
        stats=[('86', 'Pages, coded by hand'), ('3D', 'Building model on service pages'), ('Every', 'Old link kept working')],
        art=dict(kind='portrait', chips=[('pin', 'Client in Chennai'), ('pen', 'Built from Mumbai')]),
        answer='U Scale rebuilt the website of Space Studio Chennai, an office architecture practice, moving it from WordPress to 86 hand-coded pages with a '
               'live 3D building model on every service page. Every old address was kept working, so a link or a search result that pointed to the old '
               'site still opens the right page. The work covered web development and SEO, was led by Mehul Karotra, and is live at spacestudiochennai.com.',
        facts=[('Client', 'Space Studio Chennai, an office architecture practice led by Ar. Shashi'),
               ('What we did', 'Web development and SEO: the rebuild, the move off WordPress and the search set-up'),
               ('Size', '86 pages, each coded by hand'),
               ('Kept', 'Every old WordPress address still opens the right page'),
               ('Went live', 'November 2026'),
               ('See it', 'spacestudiochennai.com'),
               ('In the client’s words', 'A LinkedIn post by Ar. Shashi Rekha, quoted and linked on this page')],
        sections=[
            Sec('The site today', *_feature(ctx, 'spacestudio'),
                P('Open ' + _site(live, 'spacestudiochennai.com') + ' on your phone before you read on. Everything below is there to be checked.'),
                eyebrow='Live', layout='wide', sid='today'),
            Sec('The situation',
                P('Space Studio designs workplaces: headquarters, office buildings, factories and office facades. Its old website ran on WordPress, '
                  'and its pages were already in Google’s results under their old addresses.',
                  'So the rebuild had one rule before any design decision. Nothing that already worked could break.'),
                eyebrow='Where it started', sid='situation'),
            Sec('Four decisions we made',
                Cards([('refresh', 'Keep every old address', 'Each old WordPress address now opens the matching new page. A search result or a saved link that pointed to the old site still lands in the right place.'),
                       ('layers', 'Show the building itself', 'Every service page carries a live 3D model of a building, so a client sees the kind of structure the service is about before reading a word.'),
                       ('chat', 'End the menu with one action', 'The menu ends in “Start a project”. The enquiry begins with what you want to build, then asks for the site, the area and the start date.'),
                       ('pen', 'Code each page by hand', '86 pages with no page builder and no bought theme. Each page is made for its own subject: a service, a project or an article.')], cols=2),
                eyebrow='The work', layout='wide', sid='decisions'),
            Sec('Check it yourself',
                Check(['Open spacestudiochennai.com on your phone and open the menu. The last item is “Start a project”.',
                       'Go to What We Do and open a service, such as Factory Buildings. The 3D building model is on the page.',
                       'Open Projects, then Full Register. Every project is listed by stage and type.',
                       'Tap “Start a project”. The form begins with what you want to build.']),
                eyebrow='On the live site', layout='wide', tone='dark', sid='check'),
            Sec('What the client said',
                P('Ar. Shashi Rekha wrote this on LinkedIn when the site went live. The link opens her post.'),
                Html(*proof.block('spacestudio')),
                eyebrow='In her words', sid='client'),
            Sec('If you are rebuilding a website',
                P('A rebuild should not cost you the visitors you already get. Before the new site goes live, ask whoever is building it for a list of '
                  'your old addresses and where each one will point.',
                  f'We do this on every rebuild. A redesign of your current site costs 70% of a fresh build, and a new 5–10 page business site is '
                  f'{price("Business site, 5–10 pages")}. More on ' + _link('/services/website-design-mumbai', 'website design in Mumbai')
                  + ' and ' + _link('/services/seo-mumbai', 'SEO services in Mumbai') + '.'),
                eyebrow='For your site', sid='yours'),
        ],
        faq=[('Who built the Space Studio Chennai website?',
              'U Scale, a web design studio in Mumbai founded and led by Mehul Karotra. The work was web development and SEO: the rebuild, the move off '
              'WordPress and the search set-up.'),
             ('Was the work done in Chennai?',
              'No. The practice is in Chennai and U Scale is in Mumbai. U Scale has no office in Chennai.'),
             ('Can you rebuild my WordPress website the same way?',
              'Yes. We start with a free audit of your current site, list every address it has, and agree in writing where each one will point before '
              'the new site goes live. A redesign costs 70% of a fresh build.'),
             ('What did this project cost?',
              'We don’t publish what a client paid. A site of this size is quoted individually after a free audit. Our standard prices are public on the pricing page.')],
        sources=[], offers=['Business site, 5–10 pages', 'Business site, 10–20 pages + blog'], work=[],
        related_html=_rel([('/work/sashe-by-prachi', 'Case study', 'Sashe by Prachi', 'A made-to-order fashion label’s website, built around enquiries.'),
                           ('/services/website-design-chennai', 'City', 'Website design in Chennai', 'What local studios charge, and how we work with Chennai businesses.'),
                           ('/services/seo-mumbai', 'Service', 'SEO services in Mumbai', 'Local and technical SEO, with a plain monthly report.'),
                           ('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/about', 'About', 'About Mehul Karotra', 'Why I started U Scale and who you’ll work with.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]),
        all_links='<a class="tlink" href="/#work">All our work</a>')


def sashe(ctx=None):
    live = 'https://sashebyprachi.in'
    return dict(
        slug='sashe-by-prachi', path='work/sashe-by-prachi', kind='guide', crumb='Sashe by Prachi', trail=TRAIL, published='2026-11-22T00:00:00+05:30',
        service='Website design and build for a made-to-order fashion label', service_type='Website design',
        wa_msg="Hi Mehul, I read the Sashe by Prachi case study. I'd like a free audit for my label.",
        title='Sashe by Prachi Website: Fashion Label Case Study | U Scale',
        desc='How we built the website of Sashe by Prachi, a made-to-order fashion label in Mumbai: no cart, before-and-after upcycling and one tap to WhatsApp.',
        h1='Case study: Sashe by Prachi', eyebrow='Case study · Fashion label website',
        lead='Sashe by Prachi is a made-to-order fashion label run by designer Prachi Pandya from her studio in Ghatkopar West, Mumbai. Nothing is sold off a shelf, so we built her website around enquiries and left out the cart. The site is live, so you can check each point on this page yourself.',
        stats=[('5.0', 'Client review on Clutch'), ('15', 'Before-and-after upcycling pieces'), ('1 tap', 'To WhatsApp the designer')],
        art=dict(kind='portrait', chips=[('pin', 'Client in Ghatkopar West'), ('chat', 'Enquiries on WhatsApp')]),
        answer='U Scale designed and built the website of Sashe by Prachi, a made-to-order fashion label in Ghatkopar West, Mumbai. Because every piece '
               'is made for one client, the site has no cart: it shows the work, including 15 before-and-after saree and dupatta upcycling pieces, and '
               'leads to WhatsApp or a studio enquiry form. The project was led by Mehul Karotra and is live at sashebyprachi.in. The client reviewed the '
               'work 5.0 on Clutch.',
        facts=[('Client', 'Sashe by Prachi, a made-to-order fashion label by designer Prachi Pandya, Ghatkopar West, Mumbai'),
               ('What we did', 'Web development: the design and build of the website, phone first'),
               ('How people order', 'On WhatsApp or through the studio enquiry form. There is no cart'),
               ('Shown on the site', 'Bespoke sarees, contemporary wear, saree and dupatta upcycling, personal styling'),
               ('Went live', 'November 2026'),
               ('See it', 'sashebyprachi.in'),
               ('In the client’s words', 'A 5.0 review on Clutch, quoted and linked on this page')],
        sections=[
            Sec('The site today', *_feature(ctx, 'sashe'),
                P('Open ' + _site(live, 'sashebyprachi.in') + ' on your phone before you read on. Everything below is there to be checked.'),
                eyebrow='Live', layout='wide', sid='today'),
            Sec('The situation',
                P('Prachi makes bespoke sarees and contemporary wear, turns sarees and dupattas her clients already own into new outfits, and offers '
                  'personal styling. Each piece starts with the person who will wear it.',
                  'An online store with a cart would have been the wrong tool. There is nothing to add to a basket until Prachi and her client have talked.'),
                eyebrow='Where it started', sid='situation'),
            Sec('Four decisions we made',
                Cards([('chat', 'An enquiry in place of a cart', 'The first screen has a “WhatsApp Prachi” button, and the header carries “Enquire” on every screen. Every section leads to a conversation.'),
                       ('refresh', 'Show the change, side by side', 'The upcycling section pairs the saree or dupatta a client brought with the outfit made from it. There are 15 pairs, and you can filter them by saree or dupatta.'),
                       ('camera', 'Open like a magazine', 'The front page opens on Prachi at her atelier table, with one line: “Made to feel like you.” The work follows as signature looks.'),
                       ('layers', 'Phone first', 'Every screen was designed for the phone first, then widened for the desktop.')], cols=2),
                eyebrow='The work', layout='wide', sid='decisions'),
            Sec('Check it yourself',
                Check(['Open sashebyprachi.in on your phone. The “WhatsApp Prachi” button is on the first screen.',
                       'Tap Upcycling. Each piece shows the saree before and the outfit after.',
                       'Switch between Sarees and Dupattas to filter the pieces.',
                       'Look for a cart or a checkout. There isn’t one, by design.']),
                eyebrow='On the live site', layout='wide', tone='dark', sid='check'),
            Sec('What the client said',
                P('Prachi Pandya reviewed the project on Clutch, an independent review site that verifies its reviewers. The link opens the full review.'),
                Html(*proof.block('sashe')),
                eyebrow='In her words', sid='client'),
            Sec('If you run a boutique or a label',
                P('Start from how your customers really order. If they ask before they buy, a catalogue with an “Order on WhatsApp” button on every piece '
                  'will serve you better than a store with a cart, and it costs less.',
                  f'A catalogue site starts at {price("Business site, 5–10 pages")}, and a full online store at {price("E-commerce, under 50 products")} for up to 50 products. '
                  'More on ' + _link('/services/website-design-mumbai/boutiques-fashion', 'boutique and clothing store websites') + ' and '
                  + _link('/services/ecommerce-website-mumbai', 'online stores') + '.'),
                eyebrow='For your label', sid='yours'),
        ],
        faq=[('Who built the Sashe by Prachi website?',
              'U Scale, a web design studio in Mumbai founded and led by Mehul Karotra. The work was the design and build of the website.'),
             ('Is Sashe by Prachi an online store?',
              'No. The pieces are made to order, so the site takes enquiries on WhatsApp and through a studio form. It has no cart.'),
             ('Can I get a website like this for my boutique?',
              'Yes. We start with a free audit of your Instagram, your Google listing and any site you already have, then give you a written plan '
              'with a fixed price before you pay anything.'),
             ('What did this project cost?',
              'We don’t publish what a client paid. Our standard prices are public on the pricing page, and yours is fixed in writing before work starts.')],
        sources=[], offers=['Business site, 5–10 pages', 'E-commerce, under 50 products'], work=[],
        related_html=_rel([('/work/space-studio-chennai', 'Case study', 'Space Studio Chennai', 'An architecture practice’s website, rebuilt with every old link kept.'),
                           ('/services/website-design-mumbai/boutiques-fashion', 'Website type', 'Boutique and fashion websites', 'A catalogue with WhatsApp orders, or a full store.'),
                           ('/services/ecommerce-website-mumbai', 'Service', 'Online stores', 'Product pages, a cart, UPI and card payments.'),
                           ('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/about', 'About', 'About Mehul Karotra', 'Why I started U Scale and who you’ll work with.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]),
        all_links='<a class="tlink" href="/#work">All our work</a>')


def pages(ctx=None):
    return [space_studio(ctx), sashe(ctx)]
