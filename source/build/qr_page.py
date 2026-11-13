"""The free QR code generator (/tools/qr-code-generator).

The tool itself is a small bundle built by card/build.mjs, which fills in its file name. The page around it is plain HTML, so search
engines and people without JavaScript still get the whole explanation.
"""
import json
import re

SLUG = 'qr-code-generator'
ENTRY_MARK = '__QR_TOOL_ENTRY__'

TITLE = 'Free QR Code Generator: Logo, UPI, WhatsApp, Wi-Fi, Link'
DESC = ('Make one QR code or 200 at once, with your logo and colours, for a link, WhatsApp, UPI or Wi-Fi. Free, no sign-up, no watermark, never expires.')
H1 = 'Free QR code generator'
LEAD = ('100% free, with no sign-up and no watermark. Make a QR code for a link, contact, WhatsApp, UPI payment or Wi-Fi, choose its shapes and colours, '
        'add your logo, and download it. It never expires.')
ANSWER = ('The free QR code generator from U Scale makes codes for links, contacts, WhatsApp, UPI payments, Wi-Fi, locations, phone calls, SMS, email and plain text. '
          'You can change the pattern, eye shapes and colours, add a logo or frame, and download a PNG, a JPG, a vector SVG or a PDF. '
          'You can also make up to 200 codes from a list in one go, or print an A4 sheet of one code as stickers. '
          'It checks that each code still scans as you design it. There is no sign-up and no watermark. '
          'Your details stay in your browser, and because the content sits in the code itself, it never expires.')
FACTS = [('Code types', 'Link, contact, WhatsApp, UPI, Wi-Fi, location, phone, SMS, email, text'),
         ('Design', '12 patterns, 8 eye frames, 6 eye centres, your colours, logo and frame'),
         ('Downloads', 'PNG up to 4096 px, JPG, vector SVG and PDF'),
         ('Many at once', 'Up to 200 codes from a list, as a zip of PNG or SVG files or as A4 sheets'),
         ('Sticker sheet', 'An A4 PDF of one code, 3 to 9 cm wide, with cut lines'),
         ('Expiry', 'Never. The content is stored in the code itself'),
         ('Cost', '100% free, with no paid version and no limit'),
         ('Sign-up', 'None needed, and no watermark'),
         ('Privacy', 'Runs in your browser. Nothing you type is sent to U Scale')]

STEPS = [('Choose what it opens', 'A link, your contact, a WhatsApp chat, a UPI payment, your Wi-Fi or something else, then fill in the details.'),
         ('Make it yours', 'Pick a quick style or choose the pattern, eyes and colours yourself. Add your logo and a “Scan me” frame if you like.'),
         ('Check it scans', 'The tool scans your design as you work and tells you if a choice stops it working.'),
         ('Download it', 'A PNG or JPG for WhatsApp and the web, an SVG or PDF for printing, an A4 sheet of stickers, or put it straight onto a visiting card.')]

TYPES = [('Link QR code', 'Paste any link: your website, Instagram, Facebook, YouTube, menu, form or PDF. Use a link you plan to keep working.'),
         ('UPI QR code', 'Customers scan it with any UPI app and pay you directly. Type your UPI ID, and leave the amount empty so they can enter it, or fix an amount for a set price.'),
         ('WhatsApp QR code', 'Opens a chat with your number, with no need to save it first. You can add a first message, such as “Hi, I want to book a table”.'),
         ('Wi-Fi QR code', 'Guests scan and join your network without typing the password. Most newer phones do this from the camera.'),
         ('Contact QR code (vCard)', 'Saves your name, number, email and address straight to their phone. Its pattern changes whenever your details change.'),
         ('Google Maps location QR code', 'Opens your location for directions. Paste your Maps link, or just type your address.')]

COMPARE = [('Cost', 'Free, with no limit', 'Usually a monthly fee'),
           ('Expiry', 'Never expires', 'Stops if the subscription ends'),
           ('Change the link later', 'No, make a new code', 'Yes'),
           ('Scan counts', 'None', 'Yes'),
           ('Who can see scans', 'Nobody', 'The service in the middle')]

SIZES = [('Visiting card', 'At least 2 cm wide. A full contact code needs about 2.6 cm'),
         ('Table tent or counter card', '3 to 5 cm'),
         ('A4 poster on a wall', '8 to 10 cm'),
         ('Rule of thumb', 'Make it about one tenth of the distance it’s scanned from')]

USES = [('Shop counters', 'A UPI code for payments, or a link to your menu or price list.'),
        ('Visiting cards', 'One scan opens your website or Instagram, so nobody has to type a link.'),
        ('Cafés and clinics', 'Wi-Fi for guests, or a WhatsApp chat for bookings and appointments.'),
        ('Posters and flyers', 'Send people to a page, a location or a form. Use the SVG, so it stays sharp at any size.'),
        ('Packaging', 'Link to instructions, reorder details or your Instagram page.'),
        ('Events', 'Share a location, a schedule or a contact without printing a long link.')]

FAQ = [
    ('Is this QR code generator really free?', 'Yes, 100% free. Every style and every download is free, with no paid version, no watermark and no limit on how many codes you make. You can use them for your business.'),
    ('Do I need to sign up or log in?', 'No. There is no account, no email and no sign-up. Open the page, make your code and download it.'),
    ('QR code kaise banaye?', 'Upar chunein ki code kya khole, jaise link, WhatsApp ya UPI. Apni details likhein, colours aur logo chunein, aur PNG, SVG ya PDF download karein. Ye bilkul free hai, aur koi sign-up nahi chahiye.'),
    ('Do these QR codes expire?', 'No. The content is stored inside the code itself, so it keeps working as long as it can be scanned. If a code points to a website link and that page goes away, the code will open a dead page, so use a link you plan to keep.'),
    ('Can I change where the code points later?', 'No. These are static codes, so to change the content you make a new code. Changing it later would need a code that passes through a server first, which is what makes other services charge monthly and able to count your scans. These codes stay free and private because they don’t do that.'),
    ('Do you track who scans my code?', 'No. Scans go straight to your link or your details and never pass through U Scale, so there’s nothing to track and no scan counts to show you.'),
    ('Can I add my logo to the QR code?', 'Yes. Upload your logo or choose an icon. A logo covers part of the code, so the tool switches on stronger error correction, limits the logo’s size and checks that the code still scans.'),
    ('Why does my code say it did not scan?', 'Usually the colours are too close together, the code is lighter than its background, or the logo is too big. Phones read dark codes on a light background best. Try a darker colour, a simpler pattern or a smaller logo.'),
    ('How do I make a UPI QR code?', 'Choose UPI payment, type your UPI ID and the name to show, and download. You can leave the amount empty so customers type it, or fix an amount. Before you print it, pay ₹1 from another phone to check that it reaches you.'),
    ('How do I make a WhatsApp QR code?', 'Choose WhatsApp and type your number. A 10-digit Indian number gets +91 added for you. You can also add a first message. Anyone who scans it lands in a chat with you, without saving your number.'),
    ('How do I make a Wi-Fi QR code?', 'Choose Wi-Fi, then type your network name and password. Guests scan it to join without typing anything. Keep in mind that anyone who can see the code can read the password.'),
    ('What size should a QR code be?', 'Keep it at least 2 cm wide on paper. As a rule of thumb, make it about one tenth of the distance it will be scanned from, and always test a printed copy with your phone.'),
    ('Which file should I use for printing?', 'Use the SVG or PDF. They are vector files, so they stay sharp at any size. Keep the code at least 2 cm wide on paper, and larger if it holds a lot of details or will be scanned from far away.'),
    ('Can I make many QR codes at once?', 'Yes. Open “Many codes at once” and paste a list with one link, number or UPI ID on each line. You get up to 200 codes in one go, as a zip of PNG or SVG files or as A4 sheets with a name under each code. To name them, copy two columns from Excel or Google Sheets, or type a name, a comma and the link, such as “Table 1, https://yourcafe.in/menu”. Every code uses the style you chose and gets the same scan check. It is free, with no sign-up.'),
    ('Can I print a sheet of QR code stickers?', 'Yes. Under the downloads, choose how wide each code should be, from 3 cm to 9 cm, and download an A4 PDF filled with your code and light cut lines. At 4 cm wide, one sheet holds 24 plain codes. Print it at 100% size, not “fit to page”, on sticker paper or plain paper.'),
    ('Can I save my QR code style to use again?', 'Yes. Press “Save this style” and it is kept in your browser, up to 8 styles, so your next code can match. An uploaded logo is not kept, so add it again when you come back.'),
    ('Can I put the QR code on my visiting card?', 'Yes. Press “Put this on a visiting card” and your code opens in the free visiting card maker, with your style already applied.'),
    ('How is this different from the Google review QR code maker?', 'That tool finds your Google review link and makes a printable counter standee. This one makes a general QR code for anything else, with full control over how it looks.'),
]


def jsonld(site):
    url = f'{site}tools/{SLUG}'
    aeo = __import__('aeo')
    strip = lambda s: re.sub(r'<[^>]+>', '', s)
    g = [{'@type': 'Service', '@id': url + '#app', 'name': 'Free QR Code Generator', 'alternateName': ['QR Code Generator with Logo', 'UPI QR Code Generator', 'WhatsApp QR Code Generator', 'Wi-Fi QR Code Generator'], 'url': url, 'description': DESC, 'serviceType': 'Free online tool',
          'category': 'Design tools', 'provider': {'@id': site + '#business'}, 'areaServed': {'@type': 'Country', 'name': 'India'},
          'availableChannel': {'@type': 'ServiceChannel', 'serviceUrl': url, 'availableLanguage': 'English'}, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR', 'url': url}},
         {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': TITLE, 'description': DESC, 'isPartOf': {'@id': site + '#website'},
          'mainEntity': {'@id': url + '#app'}, 'author': {'@id': site + '#mehul'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__', 'isAccessibleForFree': True,
          'keywords': 'free QR code generator, QR code generator with logo, UPI QR code generator, WhatsApp QR code, Wi-Fi QR code, vCard QR code, QR code that never expires'},
         aeo.biz_ref(site), aeo.person_ref(site),
         {'@type': 'HowTo', 'name': 'How to make a free QR code', 'totalTime': 'PT2M',
          'step': [{'@type': 'HowToStep', 'position': i + 1, 'name': n, 'text': strip(t)} for i, (n, t) in enumerate(STEPS)]},
         {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Free tools', 'item': site + 'tools'}, {'@type': 'ListItem', 'position': 3, 'name': 'QR code generator', 'item': url}]},
         {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ]}]
    return json.dumps({'@context': 'https://schema.org', '@graph': g}, ensure_ascii=False).replace('</', '<\\/')


def page(ctx, parts, tv, sp):
    site = ctx['SITE_URL']
    v = ctx['_v']
    e = sp.e
    header, menu, footer, tail = parts
    url = f'{site}tools/{SLUG}'
    og = f'{site}assets/tools/qr-tool-og.png'
    head = sp._tool_head(ctx, url, TITLE, DESC, og, 'QR codes in several styles, made with the free U Scale QR code generator', jsonld(site), tv)
    head = head.replace('</head>', f'<link rel="stylesheet" href="/card.css?v={tv}">\n</head>')
    steps = ''.join(f'<li><b>{e(n)}</b><span>{e(t)}</span></li>' for n, t in STEPS)
    uses = ''.join(f'<li><b>{e(n)}</b> {e(t)}</li>' for n, t in USES)
    types = ''.join(f'<li><h3>{e(n)}</h3><p>{e(t)}</p></li>' for n, t in TYPES)
    compare = ''.join(f'<tr><th scope="row">{e(a)}</th><td>{e(b)}</td><td>{e(c)}</td></tr>' for a, b, c in COMPARE)
    sizes = ''.join(f'<tr><th scope="row">{e(a)}</th><td>{e(b)}</td></tr>' for a, b in SIZES)
    aeo = __import__('aeo')
    body = f'''
  <div class="wrap hero-shell">
    <section class="sp-hero on-dark qt-hero" data-tone="dark" aria-labelledby="page-title">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/tools">Free tools</a></li><li aria-current="page">QR code generator</li></ol></nav>
      <p class="eyebrow">100% free · no sign-up</p>
      <h1 class="sp-hero__title" id="page-title">{e(H1)}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{e(LEAD)}</p>
    </section>
  </div>
  <section class="section qt-section" aria-label="QR code generator">
    <div class="wrap">
      <div id="qr-tool"><p class="qt-boot">Opening the QR code generator…</p></div>
      <noscript><p class="cm-note">This tool needs JavaScript. Please turn it on, or open this page in another browser.</p></noscript>
    </div>
  </section>
{aeo.brief_html(ANSWER, FACTS, 'Key facts: free QR code generator', 'cm-brief')}
  <section class="section" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">How it works</p><h2 class="h2" id="how-title">How to make a QR code for free.</h2></header>
      <ol class="cm-steps">{steps}</ol>
    </div>
  </section>
  <section class="section" aria-labelledby="types-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Every kind of code</p><h2 class="h2" id="types-title">UPI, WhatsApp, <span class="qt-nb">Wi-Fi</span> and link QR codes.</h2></header>
      <ul class="qt-types">{types}</ul>
    </div>
  </section>
  <section class="section" aria-labelledby="static-title">
    <div class="wrap cm-split">
      <div>
        <header class="sec-head"><p class="eyebrow">Good to know</p><h2 class="h2" id="static-title">Static or dynamic QR code?</h2></header>
        <p class="cm-note">These are static codes: your content sits inside the code itself. Dynamic codes send people through a company’s server first, which is why they can be edited and counted, and why they usually cost money.</p>
        <table class="cm-table qt-compare"><caption class="sr-only">Static and dynamic QR codes compared</caption><thead><tr><td></td><th scope="col">Static (this tool)</th><th scope="col">Dynamic</th></tr></thead><tbody>{compare}</tbody></table>
      </div>
      <div>
        <header class="sec-head"><p class="eyebrow">Printing</p><h2 class="h2">What size should it be?</h2></header>
        <table class="cm-table"><caption class="sr-only">Recommended QR code print sizes</caption><tbody>{sizes}</tbody></table>
        <p class="cm-note">Print one copy and test it with your phone before you print a lot.</p>
      </div>
    </div>
  </section>
  <section class="section" aria-labelledby="uses-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Ideas</p><h2 class="h2" id="uses-title">Where a QR code earns its place.</h2></header>
      <ul class="cm-tips">{uses}</ul>
    </div>
  </section>
  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">QR code questions.</h2></header>
      <div class="faq__list" data-accordion>
{sp.faq_html(FAQ)}
      </div>
    </div>
  </section>
  <section class="section" aria-labelledby="more-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">More free tools</p><h2 class="h2" id="more-title">Put your code to work.</h2></header>
      <div class="th-grid">{sp._tool_card('card')}{sp._tool_card('qr')}</div>
    </div>
  </section>
'''
    return f'''{head}
<body class="page-sub page-tool page-qt">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">{body}</main>
{footer}
{tail}
<script defer src="/script.js?v={v}"></script>
<script type="module" src="/card/{ENTRY_MARK}"></script>
</body>
</html>
'''
