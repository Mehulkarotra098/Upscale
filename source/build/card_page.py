"""Landing page for the free visiting card maker (/tools/visiting-card-maker).

The editor itself is a separate full-screen page built by card/build.mjs. This page is what search engines read: what the
tool does, the template gallery, print sizes and questions. The template list comes from card_templates.json, written by
card/tools/gen-assets.mjs, so the numbers on the page always match what's really there.
"""
import json
import pathlib
import re

SLUG = 'visiting-card-maker'
HERE = pathlib.Path(__file__).resolve().parent


def templates():
    return json.loads((HERE / 'card_templates.json').read_text(encoding='utf-8'))


CATEGORIES = [('retail', 'Shops'), ('food', 'Food'), ('health', 'Health'), ('beauty', 'Beauty'), ('professional', 'Professional'),
              ('trades', 'Trades'), ('creative', 'Creative'), ('tech', 'Tech'), ('traditional', 'Traditional'), ('hindi', 'Hindi'),
              ('marathi', 'Marathi'), ('bold', 'Bold'), ('minimal', 'Minimal'), ('luxury', 'Luxury'), ('playful', 'Playful')]


def page_copy(count):
    return dict(
        title='Free Visiting Card Maker Online, No Sign-up | U Scale',
        desc=(f'Make a visiting card or business card online, 100% free with no sign-up or watermark. {count} designs in English, Hindi and Marathi. '
              'Download PDF, PNG and SVG.'),
        h1='Free visiting card maker',
        lead=(f'100% free, with no sign-up and no watermark. Pick from {count} original designs, type your details once, and change anything you like. '
              'Then download a print-ready PDF, an SVG and a PNG.'),
        answer=(f'The free visiting card and business card maker from U Scale has {count} original designs and works on a phone or computer. You can edit '
                'every part of a card, in English, Hindi or Marathi, then download a PNG, a vector SVG and a print PDF with 3 mm bleed. '
                'There is no sign-up and no watermark, and your details stay in your browser.'),
        facts=[('Designs', f'{count} original designs, front and back'), ('Downloads', 'PNG, SVG, print PDF, and an A4 sheet of 10 cards'),
               ('Card languages', 'English, Hindi and Marathi'), ('Cost', '100% free, with no paid version'), ('Sign-up', 'None needed, and no watermark'),
               ('QR codes', 'Add your own, with your style and logo'),
               ('Privacy', 'Your details and logo stay in your browser'), ('Made by', 'Mehul Karotra, U Scale, Mumbai')],
        faq=[
            ('Is this visiting card maker really free?', 'Yes, 100% free. Every design and every download format is free. There is no paid version, no watermark and nothing to unlock.'),
            ('Do I need to sign up or log in?', 'No. There is no account, no email and no sign-up. Open the editor and start. Your design saves automatically in your browser.'),
            ('Visiting card kaise banaye?', 'Design chunein, apna naam, number aur business likhein, logo ya QR code add karein, aur print PDF ya PNG download karein. Ye bilkul free hai, koi sign-up nahi chahiye, aur phone par bhi chalta hai.'),
            ('Is a visiting card the same as a business card?', 'Yes. They are the same thing. “Visiting card” is the usual name in India, and “business card” is used more widely elsewhere. This tool makes both, at the usual sizes.'),
            ('Can I make a visiting card on my phone?', 'Yes. The editor works in your phone’s browser, with nothing to install. You can type, move things with your finger, and download the files directly.'),
            ('What is the standard visiting card size in India?', 'The usual size is 3.5 × 2 inches, which is 88.9 × 50.8 mm. That is the size this tool starts with. You can also choose 85 × 55 mm, 90 × 54 mm or a square card. It is worth confirming the size with your print shop before you order.'),
            ('Which file should I give to the print shop?', 'Give them the Print PDF. It has both sides, 3 mm of bleed, the correct trim size and crop marks if you want them. All text is converted to outlines, so the shop does not need your fonts.'),
            ('What is bleed, and why does my card need it?', 'Bleed is extra background that runs past the cut line, usually 3 mm on each side. Cutting machines can shift slightly, and bleed stops a thin white edge showing when they do. Keep important text at least 4 mm inside the cut line. The editor shows this safe area as a dashed line.'),
            ('Can I make a visiting card in Hindi or Marathi?', 'Yes. Type in Hindi or Marathi anywhere on the card. Joined letters such as क्ष and त्र come out correctly, and you can switch to Marathi letter shapes for words like शाळा. Some designs are made Hindi or Marathi first.'),
            ('Is the colour in the PDF RGB or CMYK?', 'The PDF is RGB. A web browser cannot convert colours accurately for a particular printing press, so the print shop does that step. Printed colours can look a little different from your screen, so ask for a proof if the exact colour matters.'),
            ('Can I add a QR code to my card?', 'Yes. Paste any link, such as your website, Instagram, Facebook or YouTube, and the code opens it. It can also start a WhatsApp chat, take a UPI payment, join your Wi-Fi, open your location, or save your contact on someone’s phone. You can pick its shapes and colours and add your logo, and the editor checks that it still scans. Always test it with your phone before printing.'),
            ('Where are my details stored?', 'In your own browser. Your name, number and logo are not sent to U Scale. Your design saves automatically on that device, and you can download a design file to open it somewhere else.'),
            ('Can I print cards at home?', 'Yes. Download the A4 sheet, which fits 10 cards with cut marks. Use thick card paper of about 250 to 300 gsm if your printer can take it, and check your printer’s margins. For the cleanest edges, a print shop will do a better job.'),
            ('Can I use these designs for my business?', 'Yes. Cards you make are yours to print and use. Please don’t resell the templates themselves. The fonts are open-licence Google Fonts and the icons are from Lucide, both listed on this page.'),
        ])


def jsonld(site, c, items=()):
    url = f'{site}tools/{SLUG}'
    strip = lambda s: re.sub(r'<[^>]+>', '', s)
    by_id = {t['id']: t for t in items}
    imgs = [{'@type': 'ImageObject', '@id': f'{url}#image-{n + 1}', 'url': f'{site}assets/card/thumbs/{i}.webp', 'contentUrl': f'{site}assets/card/thumbs/{i}.webp',
             'width': 480, 'height': 274, 'caption': f'{by_id[i]["name"]} visiting card design from the free U Scale card maker',
             'description': f'{by_id[i]["name"]} visiting card design, {by_id[i]["category"]}', 'inLanguage': 'en-IN', 'encodingFormat': 'image/webp',
             'representativeOfPage': n == 0} for n, i in enumerate(i for i in HERO_IDS if i in by_id)]
    g = imgs + [{'@type': 'Service', '@id': url + '#app', 'name': 'Free Visiting Card Maker', 'alternateName': ['Free Business Card Maker', 'Online Visiting Card Maker'], 'url': url, 'description': c['desc'], 'serviceType': 'Free online tool',
          **({'image': [{'@id': x['@id']} for x in imgs]} if imgs else {}),
          'category': 'Design tools', 'provider': {'@id': site + '#business'}, 'areaServed': {'@type': 'Country', 'name': 'India'},
          'availableChannel': {'@type': 'ServiceChannel', 'serviceUrl': url, 'availableLanguage': 'English'}, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR', 'url': url}},
         {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': c['title'], 'description': c['desc'], 'isPartOf': {'@id': site + '#website'},
          'mainEntity': {'@id': url + '#app'}, 'author': {'@id': site + '#mehul'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__', 'isAccessibleForFree': True,
          **({'primaryImageOfPage': {'@id': imgs[0]['@id']}} if imgs else {}),
          'keywords': 'visiting card maker, free visiting card maker online, business card maker, visiting card design, Hindi visiting card, Marathi visiting card'},
         __import__('aeo').biz_ref(site), __import__('aeo').person_ref(site),
         {'@type': 'HowTo', 'name': 'How to make a visiting card for free', 'totalTime': 'PT3M',
          'step': [{'@type': 'HowToStep', 'position': i + 1, 'name': n, 'text': strip(t)} for i, (n, t) in enumerate(STEPS)]},
         {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Free tools', 'item': site + 'tools'}, {'@type': 'ListItem', 'position': 3, 'name': 'Visiting card maker', 'item': url}]},
         {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in c['faq']]}]
    return json.dumps({'@context': 'https://schema.org', '@graph': g}, ensure_ascii=False).replace('</', '<\\/')


HERO_IDS = ('double-rule', 'mehndi-corner', 'shamiana-edge')  # the three cards fanned in the hero


# Who it's for, with a real design to open for each. Written for how people search: "visiting card for doctors" and so on.
BUSINESSES = [('Doctors and clinics', 'Clean cards that make your name, qualifications and timings easy to read.', [('quadrant-cross', 'Quadrant'), ('growth-chart', 'Growth Chart')]),
              ('CAs, tax and finance', 'Quiet, precise layouts that feel trustworthy.', [('double-rule', 'Double Rule'), ('compound-lines', 'Compound')]),
              ('Lawyers and advocates', 'Formal cards with room for your court and practice areas.', [('fluted-column', 'Fluted Column')]),
              ('Shops and traders', 'Your shop name first, with your number big enough to read.', [('masala-dabba', 'Masala Dabba'), ('bahi-khata', 'Bahi Khata')]),
              ('Sweets, restaurants and cafés', 'Warm designs with space for your menu QR code and timings.', [('shamiana-edge', 'Shamiana'), ('athangudi-floor', 'Athangudi Floor')]),
              ('Salons and boutiques', 'Elegant patterns inspired by mehndi and block print.', [('mehndi-corner', 'Mehndi Corner'), ('bagru-block', 'Bagru Block')]),
              ('Electricians, plumbers and repair', 'Bold cards that people can find in a drawer when something breaks.', [('three-phase', 'Three Phase'), ('wall-paint', 'Wall Paint')]),
              ('Hindi and Marathi cards', 'Designs made for Devanagari, with joined letters that print correctly.', [('shop-sign', 'Shop Sign'), ('patang-string', 'Patang String')])]

STEPS = [('Pick a design', 'Choose any design from the gallery. You can switch at any time without losing your details.'),
         ('Add your details', 'Type your name, business and contact details once, in English, Hindi or Marathi, and add your logo if you have one.'),
         ('Make it yours', 'Move, resize, rotate or recolour anything. Change fonts, add shapes, icons, photos and QR codes.'),
         ('Download and print', 'Get a print PDF for the shop, a PNG for WhatsApp, an SVG for designers, or an A4 sheet to print at home.')]

SIZES = [('Card size', '3.5 × 2 in (88.9 × 50.8 mm)'), ('With 3 mm bleed', '94.9 × 56.8 mm'), ('Safe area for text', 'At least 4 mm inside the cut'),
         ('PNG at 600 dpi', '2100 × 1200 pixels'), ('PNG at 300 dpi', '1050 × 600 pixels'), ('A4 sheet', '10 cards with cut marks')]

CARD_CONTENT = [('Your name and role', 'Make the name the first thing people read. Add a title only if it tells them something useful.'),
                ('Your business name', 'Use the same spelling as your shop board and Google listing, so people can find you later.'),
                ('A phone number that works on WhatsApp', 'For most customers in India, this is how they will actually reach you.'),
                ('A QR code', 'One scan can open your website or Instagram, so nobody has to type a link. Test it on a real phone before printing.'),
                ('An area, not your whole address', 'Unless people need to walk in, the area and city are often enough, and they keep the card clean.'),
                ('Room to breathe', 'A card with less on it is easier to read. Six details are usually plenty.')]


def page(ctx, parts, tv, sp):
    site = ctx['SITE_URL']
    v = ctx['_v']
    e, ea = sp.e, sp.ea
    header, menu, footer, tail = parts
    url = f'{site}tools/{SLUG}'
    items = templates()
    c = page_copy(len(items))
    og = f'{site}assets/tools/card-maker-og.png'
    head = sp._tool_head(ctx, url, c['title'], c['desc'], og, 'Visiting cards made with the free U Scale card maker', jsonld(site, c, items), tv)
    head = head.replace('</head>', f'<link rel="stylesheet" href="/card.css?v={tv}">\n</head>')
    editor = f'/tools/{SLUG}/editor'

    used = {t['category'] for t in items}
    chips = ''.join(f'<button type="button" class="cm-chip" data-cm-cat="{k}" aria-pressed="false">{e(n)}</button>' for k, n in CATEGORIES if k in used)
    cards = ''.join(
        f'<li class="cm-item{" cm-item--v" if t.get("orientation") == "vertical" else ""}" data-cat="{ea(t["category"])}">'
        f'<a href="{editor}?design={ea(t["id"])}"><img src="/assets/card/thumbs/{ea(t["id"])}.webp" width="{ "240" if t.get("orientation") == "vertical" else "480"}" height="{ "420" if t.get("orientation") == "vertical" else "274"}" '
        f'alt="{ea(t["name"])} visiting card design, {ea(t["category"])}" loading="lazy" decoding="async"><span>{e(t["name"])}</span></a></li>' for t in items)
    steps = ''.join(f'<li><b>{e(n)}</b><span>{e(t)}</span></li>' for n, t in STEPS)
    sizes = ''.join(f'<tr><th scope="row">{e(k)}</th><td>{e(val)}</td></tr>' for k, val in SIZES)
    content = ''.join(f'<li><b>{e(n)}</b> {e(t)}</li>' for n, t in CARD_CONTENT)
    hero_ids = [i for i in HERO_IDS if any(t['id'] == i for t in items)]
    hero_art = ''.join(f'<img class="cm-fan cm-fan--{n}" src="/assets/card/thumbs/{i}.webp" width="480" height="274" alt="" decoding="async" fetchpriority="{"high" if n == 0 else "low"}">' for n, i in enumerate(hero_ids))
    known = {t['id'] for t in items}
    businesses = ''.join(
        f'<li><b>{e(n)}</b> {e(t)} ' + ' '.join(f'<a class="tlink" href="{editor}?design={ea(i)}">{e(lab)}</a>' for i, lab in d if i in known) + '</li>'
        for n, t, d in BUSINESSES)
    aeo = __import__('aeo')
    body = f'''
  <div class="wrap hero-shell">
    <section class="sp-hero cm-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="cm-hero__art" aria-hidden="true">{hero_art}</div>
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/tools">Free tools</a></li><li aria-current="page">Visiting card maker</li></ol></nav>
      <p class="eyebrow">100% free · no sign-up</p>
      <h1 class="sp-hero__title" id="page-title">{e(c['h1'])}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{e(c['lead'])}</p>
      <div class="hero__cta"><a class="btn btn--go" href="{editor}">Make my card <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></a><a class="btn btn--ghost" href="#designs">See the designs</a></div>
    </section>
  </div>
{aeo.brief_html(c['answer'], c['facts'], 'Key facts: free visiting card maker', 'cm-brief')}
  <section class="section" id="designs" aria-labelledby="designs-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">{len(items)} original designs</p><h2 class="h2" id="designs-title">Start from a design made for your work.</h2></header>
      <p class="cm-note">Each design comes with several colour sets. Tap one to open it in the editor.</p>
      <div class="cm-chips" role="group" aria-label="Filter designs" hidden data-cm-chips><button type="button" class="cm-chip" data-cm-cat="" aria-pressed="true">All</button>{chips}</div>
      <ul class="cm-grid" data-cm-grid>{cards}</ul>
    </div>
  </section>
  <section class="section" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">How it works</p><h2 class="h2" id="how-title">How to make a visiting card online for free.</h2></header>
      <ol class="cm-steps">{steps}</ol>
      <p class="cm-center"><a class="btn btn--go" href="{editor}">Make my card <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></a></p>
    </div>
  </section>
  <section class="section" aria-labelledby="for-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">For your work</p><h2 class="h2" id="for-title">Visiting card designs for every kind of business.</h2></header>
      <ul class="cm-tips">{businesses}</ul>
    </div>
  </section>
  <section class="section" aria-labelledby="freedom-title">
    <div class="wrap cm-split">
      <div>
        <header class="sec-head"><p class="eyebrow">Full freedom</p><h2 class="h2" id="freedom-title">Change anything.</h2></header>
        <ul class="cm-list">
          <li>Move, resize and rotate anything, with guides that line up what you see</li>
          <li>Type on the card itself, and align or evenly space anything in a tap</li>
          <li>Over 20 fonts, including Hindi and Marathi fonts</li>
          <li>Your own colours, or a matching colour set in one tap</li>
          <li>Shapes, lines, gradients, icons and your own photos</li>
          <li>QR codes for any link: your website, Instagram, WhatsApp, UPI, Wi-Fi, location or contact</li>
          <li>Your own QR style: shapes, colours and a logo in the centre, with a live check that it still scans</li>
          <li>Front and back, horizontal or vertical</li>
          <li>Undo, layers, and an automatic save in your browser</li>
        </ul>
      </div>
      <div>
        <header class="sec-head"><p class="eyebrow">Print details</p><h2 class="h2">Sizes and files.</h2></header>
        <table class="cm-table"><caption class="sr-only">Visiting card sizes and export details</caption><tbody>{sizes}</tbody></table>
        <p class="cm-note">Sizes vary a little between print shops, so confirm yours before ordering.</p>
      </div>
    </div>
  </section>
  <section class="section" aria-labelledby="content-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Good to know</p><h2 class="h2" id="content-title">What to put on a visiting card.</h2></header>
      <ul class="cm-tips">{content}</ul>
    </div>
  </section>
  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Visiting card questions.</h2></header>
      <div class="faq__list" data-accordion>
{sp.faq_html(c['faq'])}
      </div>
    </div>
  </section>
  <section class="section" aria-labelledby="more-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">More free tools</p><h2 class="h2" id="more-title">Get found once they have your card.</h2></header>
      <div class="th-grid">{sp._tool_card('qrgen')}{sp._tool_card('gp')}</div>
      <p class="cm-note cm-credits">Fonts: open-licence fonts from Google Fonts, under the SIL Open Font License. Icons: Lucide, under the ISC licence. All card artwork is original to U Scale.</p>
    </div>
  </section>
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Want a website that matches your card<span class="dot">?</span></h2>
          <p class="lead">I design and build websites for small businesses in Mumbai and across India.</p>
          <div class="cta__btns" data-wa-zone><a class="btn btn--go" href="{sp.ea(sp.wa_link("Hi Mehul, I made my visiting card on uscale.in. Can you also make a website for my business?"))}" target="_blank" rel="noopener" data-magnetic>{ctx["ICONS"]["ICON_CHAT"]}Chat on WhatsApp</a><a class="btn btn--ghost" href="/services/website-design-mumbai">See website design</a></div>
        </div>
      </div>
    </div>
  </section>
'''
    filter_js = '''<script>(function(){var w=document.querySelector('[data-cm-chips]'),g=document.querySelector('[data-cm-grid]');if(!w||!g)return;w.hidden=false;w.addEventListener('click',function(e){var b=e.target.closest('[data-cm-cat]');if(!b)return;var c=b.getAttribute('data-cm-cat');w.querySelectorAll('[data-cm-cat]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});g.querySelectorAll('li').forEach(function(li){li.hidden=!!c&&li.getAttribute('data-cat')!==c;});});})();</script>'''
    return f'''{head}
<body class="page-sub page-tool page-cm">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">{body}</main>
{footer}
{tail}
<script defer src="/script.js?v={v}"></script>
{filter_js}
</body>
</html>
'''
