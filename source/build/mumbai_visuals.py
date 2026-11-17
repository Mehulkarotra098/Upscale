"""Visual sections for /services/website-design-mumbai (Mehul, 17 Nov 2026: "lots of data needs presentation… people are
lazy to read; make visuals, images, motion"). Each block shows what the old table or text said as a picture that moves,
with a plain-text version kept for llms-full.txt and answer engines. Prices come from pricing_data through
geo_pages.price, so they can't drift. Styles: source/src/visuals.css (classes mv-*). Motion runs once the block is
revealed (.is-in) and stays calm when motion is reduced."""
import geo_pages as GP
from geo_pages import e, icon, price, src_chip

INC = [  # (scene, title, one line)
    ('figma', 'Designed for you', 'Screen by screen in Figma, before any code.'),
    ('phone', 'Phone first', 'Built and tested on real phones.'),
    ('speed', 'Fast', 'Light code and small images, built to pass Google’s speed checks.'),
    ('google', 'Ready for Google', 'Titles, Maps, sitemap and Search Console at launch.'),
    ('reach', 'Easy to reach', 'WhatsApp, call and form buttons where people decide.'),
    ('keys', 'Yours at handover', 'Code, design files, domain and every login.'),
]


def phone(screens, w=230, cls=''):
    """A realistic phone (Mehul: "mobile does not look real"): metal frame with depth and side buttons, Dynamic Island,
    status bar, screen glare, tilted in 3D. screens: inner HTML of each screen (more than one = they take turns)."""
    scr = ''.join(f'<div class="rp__app rp__app--{i}">{s}</div>' for i, s in enumerate(screens))
    return (f'<div class="rp {cls}" style="--w:{w}px" aria-hidden="true"><div class="rp__body"><span class="rp__edge"></span>'
            '<span class="rp__btn rp__btn--a"></span><span class="rp__btn rp__btn--b"></span><span class="rp__btn rp__btn--c"></span><span class="rp__btn rp__btn--p"></span>'
            '<div class="rp__scr"><span class="rp__island"></span><p class="rp__st"><b>9:41</b><span><i class="rp__sig"></i><i class="rp__bat"></i></span></p>'
            f'{scr}<span class="rp__gl"></span></div></div><span class="rp__shadow"></span></div>')


def wa_chat(msgs, name='Chai Kona', ini='CK'):
    """WhatsApp as it looks on an iPhone: header, wallpaper, bubbles with tails, times, blue ticks, message bar."""
    body = ''.join(f'<p class="rp-wa__m rp-wa__m--{d}" style="--i:{i}">{e(x)}<time>{e(tm)}{"<i class=rp-wa__tk></i>" if d == "out" else ""}</time></p>' for i, (d, x, tm) in enumerate(msgs))
    return (f'<div class="rp-wa"><div class="rp-wa__hd"><i class="rp-wa__bk"></i><span class="rp-wa__av">{e(ini)}</span><span class="rp-wa__nm"><b>{e(name)}</b><small>online</small></span>'
            '<i class="rp-wa__vc"></i><i class="rp-wa__cl"></i></div>'
            f'<div class="rp-wa__body"><p class="rp-wa__day">Today</p>{body}</div>'
            '<div class="rp-wa__in"><i class="rp-wa__plus"></i><span>Message</span><i class="rp-wa__mic"></i></div></div>')


def _scene(k):
    """Each card's little world, built as layers lifting off a tilted plane (real depth, soft shadows), turning a
    little with the mouse (data-tilt in script.js)."""
    L = lambda cls, z, inner='': f'<span class="mv-ly {cls}" style="--z:{z}px">{inner}</span>'
    if k == 'figma':
        inner = (L('mv-ly--base mv-ly--frame', 0, '<i class="mv-dots"></i>') + L('mv-ly--hero', 22) + L('mv-ly--lines', 12, '<i></i><i></i><i></i>')
                 + L('mv-ly--cta', 32) + L('mv-ly--cur', 58, '<svg viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z"/></svg>'))
    elif k == 'phone':
        return ('<div class="mv-sc mv-sc--phone" aria-hidden="true"><span class="mv-floor"></span>'
                + phone([('<div class="rp-site"><i class="rp-site__hero"></i><b>Mira Studio</b><i class="rp-site__l"></i><i class="rp-site__l rp-site__l--s"></i>'
                          '<i class="rp-site__btn">Book on WhatsApp</i></div>')], w=86, cls='rp--mini rp--mini-a')
                + '<span class="mv-badge">' + icon('check') + '</span></div>')
    elif k == 'speed':
        inner = (L('mv-ly--base mv-ly--dial', 0, '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" class="mv-dial__bg"/><circle cx="60" cy="60" r="46" class="mv-dial__on"/></svg>')
                 + L('mv-ly--needle', 14, '<i></i>') + L('mv-ly--cap', 20) + L('mv-ly--fast', 30, 'Fast'))
    elif k == 'google':
        inner = (L('mv-ly--base mv-ly--card', 0) + L('mv-ly--q', 10, 'website designer near me') + L('mv-ly--res', 22, '<i class="mv-res__u"></i><i class="mv-res__t"></i><i class="mv-res__s">★★★★★</i>')
                 + L('mv-ly--pin', 44, icon('pin')))
    elif k == 'reach':
        return ('<div class="mv-sc mv-sc--reach" aria-hidden="true"><span class="mv-floor"></span>'
                + phone([wa_chat([('in', 'Hi, can I get a quote?', '10:02'), ('out', 'Sure! Sending it now.', '10:03')], 'Your business', 'YB')], w=96, cls='rp--mini rp--mini-b')
                + '</div>')
    else:
        inner = (L('mv-ly--base mv-ly--folder', 0) + L('mv-ly--file mv-ly--f1', 10, 'Code') + L('mv-ly--file mv-ly--f2', 20, 'Figma') + L('mv-ly--file mv-ly--f3', 30, 'Logins')
                 + L('mv-ly--key', 50, icon('key')))
    return f'<div class="mv-sc mv-sc--{k}" aria-hidden="true"><span class="mv-floor"></span><div class="mv-st"><div class="mv-pl">{inner}</div></div></div>'


def included():
    li = ''.join(f'<li class="mv-inc__c" style="--i:{i}" data-tilt>{_scene(k)}<h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, (k, t, d) in enumerate(INC))
    html = f'<ul class="mv-inc" data-reveal>{li}</ul>'
    return html, 'Included in every website: ' + '; '.join(f'{t}: {d}' for _, t, d in INC)


# ---------------------------------------------------------------- packages
MAIN = [('Landing page', 'Landing page', 'One page for one offer or ad', '1 page', 'Under 2 weeks', 1),
        ('Business site', 'Business site, 5–10 pages', 'Clinics, salons, studios, services', '5–10 pages', '3–4 weeks', 5),
        ('Online store', 'E-commerce, under 50 products', 'A focused range, UPI and cards', 'Up to 50 products', 'Agreed in the plan', 0)]
MORE = [('Portfolio site', 'Portfolio site'), ('10–20 pages + blog', 'Business site, 10–20 pages + blog'), ('Restaurant + own ordering', 'Restaurant site + own online ordering'),
        ('Store, 50–500 products', 'E-commerce, 50–500 products'), ('Redesign', 'Redesign of your current site')]


def _stack(n):
    if n == 0:
        return ('<span class="mv-stack mv-stack--shop" aria-hidden="true"><i class="mv-bag"></i>' + ''.join(f'<i class="mv-tile" style="--k:{k}"></i>' for k in range(4)) + '</span>')
    return '<span class="mv-stack" aria-hidden="true">' + ''.join(f'<i class="mv-sheet" style="--k:{k};--n:{n}"></i>' for k in range(n)) + '</span>'


def packages():
    cards = ''.join(f'<li class="mv-pk{" mv-pk--hi" if i == 1 else ""}" style="--i:{i}">{_stack(n)}<p class="mv-pk__k">{e(name)}</p>'
                    f'<b class="mv-pk__p">{e(price(key))}</b><p class="mv-pk__for">{e(good)}</p>'
                    f'<p class="mv-pk__m"><span>{icon("layers")}{e(size)}</span><span>{icon("clock")}{e(live)}</span></p></li>'
                    for i, (name, key, good, size, live, n) in enumerate(MAIN))
    more = ''.join(f'<li><span>{e(n)}</span><b>{e(price(k))}</b></li>' for n, k in MORE)
    inc = ['Mobile-first design', 'Enquiry forms', 'Basic SEO', 'Google Maps', 'Social links', '2–3 revision rounds', '15–30 day bug-fix window']
    pay = ('<div class="mv-pay" aria-label="Payment: 20% to start, 20% when you approve the design, 60% when the site is live">'
           '<span style="--w:20;--i:0"><b>20%</b>to start</span><span style="--w:20;--i:1"><b>20%</b>design approved</span><span class="mv-pay__go" style="--w:60;--i:2"><b>60%</b>when it’s live</span></div>')
    html = (f'<div class="mv-pks" data-reveal><ul class="mv-pks__main">{cards}</ul>'
            f'<div class="mv-pks__more"><p class="mv-k">Also</p><ul>{more}</ul></div>'
            f'<div class="mv-pks__foot"><div><p class="mv-k">In every package</p><p class="mv-chips">' + ''.join(f'<span>{icon("check")}{e(x)}</span>' for x in inc) + '</p></div>'
            f'<div><p class="mv-k">How you pay</p>{pay}</div></div>'
            f'<p class="mv-note">Every price, with a quote builder, is on the {GP._link("/pricing", "pricing page")}.</p></div>')
    text = ('Packages: ' + '; '.join(f'{n} ({size}, live in {live.lower()}): {price(k)}' for n, k, _, size, live, _ in MAIN) + '. Also: '
            + '; '.join(f'{n}: {price(k)}' for n, k in MORE) + '. Every package includes ' + ', '.join(inc).lower()
            + '. You pay 20% to start, 20% when you approve the design and 60% when the site is live.')
    return html, text


# ---------------------------------------------------------------- the receipt
def receipt():
    lines = [('Business site, 5–10 pages', 'The website', price('Business site, 5–10 pages'), ''),
             ('Domain and hosting', 'In your name, paid to your provider', '~₹4,400–9,400 / yr', ''),
             ('Website copy', 'Only if you want it written', price('Website copy'), 'if'),
             ('Photography', 'Only if you need a shoot', 'Quoted first', 'if'),
             ('Premium plugins', 'Only if a feature needs one', 'At cost', 'if'),
             ('Payment gateway', 'Stores only, paid to Razorpay', '~2% + GST', 'if'),
             ('Care plan', 'Optional, after launch', price('Care plan: updates, backups, security'), 'if'),
             ('GST on U Scale prices', 'None charged right now', '₹0', '')]
    rows = ''.join(f'<li class="mv-rc__l{" mv-rc__l--if" if f else ""}" style="--i:{i}"><span><b>{e(a)}</b><small>{e(b)}</small></span><em>{e(c)}</em></li>'
                   for i, (a, b, c, f) in enumerate(lines))
    html = (f'<div class="mv-rcw" data-reveal><div class="mv-rc"><p class="mv-rc__h"><b>U Scale</b><span>Written plan · before you pay</span></p><ul>{rows}</ul>'
            f'<p class="mv-rc__t" style="--i:{len(lines)}"><span>Hidden charges</span><b>₹0</b></p><span class="mv-rc__stamp">All said upfront</span></div>'
            f'<div class="mv-rcw__t"><p>The package price is the price of the website. These are the only other costs a website can bring, and each one is in your written plan before you pay anything.</p>'
            f'<p class="mv-rcw__s">Domain and hosting are yearly renewal prices from the providers’ own pages, explained in the {GP._link("/blog/website-design-cost-mumbai", "website design cost guide")}. {src_chip("razorpay-pricing")}</p></div></div>')
    text = 'Every cost outside the package, in the written plan before you pay: ' + '; '.join(f'{a}: {c} ({b.lower()})' for a, b, c, _ in lines) + '. Hidden charges: ₹0.'
    return html, text


# ---------------------------------------------------------------- landing pages: ad -> page -> WhatsApp, on one phone
def landing():
    ad = ('<div class="rp-ig"><p class="rp-ig__hd"><span class="rp-ig__av">CK</span><b>chaikona</b><small>Sponsored</small><i>···</i></p>'
          '<div class="rp-ig__img"><span>☕</span><span>🥯</span></div><p class="rp-ig__cta">Order now<i>›</i></p>'
          '<p class="rp-ig__ic"><i>♡</i><i>💬</i><i>➤</i></p><p class="rp-ig__cap"><b>chaikona</b> Masala chai + bun maska, ₹149. Pickup in 10 min.</p></div>')
    page = ('<div class="rp-lp"><p class="rp-lp__url">chaikona.in</p><div class="rp-lp__img"><span>☕</span></div><p class="rp-lp__k">Andheri East · Open till 11 pm</p>'
            '<b class="rp-lp__h">Chai + bun maska combo</b><p class="rp-lp__p">₹149</p><p class="rp-lp__btn"><i></i>Order on WhatsApp</p>'
            '<p class="rp-lp__tr"><span>★ 4.8</span><span>Pickup in 10 min</span></p></div>')
    chat = wa_chat([('out', 'Hi! One combo for pickup, please', '5:31'), ('in', 'Done ✓ Ready at 5:40. Pay by UPI or at the counter.', '5:31'), ('out', 'Perfect, thanks!', '5:32')])
    html = (f'<div class="mv-lp" data-reveal>{phone([ad, page, chat], w=232, cls="rp--lp")}'
            '<ol class="mv-lp__steps"><li style="--i:0"><b>1</b>Someone sees your ad</li><li style="--i:1"><b>2</b>One page, one offer, fast on a phone</li><li style="--i:2"><b>3</b>One tap to WhatsApp you</li></ol></div>')
    return html, 'How a landing page works: someone sees your ad, lands on one fast page with one offer, and messages you on WhatsApp in one tap.'


# ---------------------------------------------------------------- custom against template
def versus():
    rows = [('Design', 'Made for you in Figma', 'Ready-made theme'), ('Code', 'Hand-coded, nothing extra', 'Theme + plugins'),
            ('Speed on a phone', 'Tested for Core Web Vitals', 'Depends on the theme'), ('Domain and logins', 'Yours from day one', 'Ask: sometimes the seller’s'),
            ('SEO set-up', 'Done at launch', 'Often extra')]
    us = ''.join(f'<li style="--i:{i}"><span class="mv-vs__ic mv-vs__ic--ok">{icon("check")}</span><span><small>{e(k)}</small>{e(a)}</span></li>' for i, (k, a, b) in enumerate(rows))
    them = ''.join(f'<li style="--i:{i}"><span class="mv-vs__ic">–</span><span><small>{e(k)}</small>{e(b)}</span></li>' for i, (k, a, b) in enumerate(rows))
    html = (f'<div class="mv-vs" data-reveal><div class="mv-vs__c mv-vs__c--them"><p class="mv-vs__k">Template package</p><b class="mv-vs__p">₹8,000–30,000</b>'
            f'<span class="mv-vs__mock" aria-hidden="true"><i></i><i></i><i></i><em>THEME</em></span><ul>{them}</ul></div>'
            f'<div class="mv-vs__c mv-vs__c--us"><p class="mv-vs__k">U Scale business site</p><b class="mv-vs__p">{e(price("Business site, 5–10 pages"))}, fixed</b>'
            f'<span class="mv-vs__mock mv-vs__mock--us" aria-hidden="true"><i></i><i></i><i></i><em>YOURS</em></span><ul>{us}</ul></div></div>'
            '<p class="mv-note">A template can be the right call on a tight budget; just know what you’re buying. Market ranges are from 16 published price guides, listed in the '
            + GP._link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder#sources', 'freelancer vs agency guide') + '. For your own estimate, try the '
            + GP._link('/tools/website-cost-calculator', 'website cost calculator') + '.</p>')
    text = (f'U Scale business site ({price("Business site, 5–10 pages")}, fixed) against a template package (₹8,000–₹30,000 in 2025–26 price guides): '
            + '; '.join(f'{k}: {a} vs {b}' for k, a, b in rows) + '.')
    return html, text


# ---------------------------------------------------------------- areas: a schematic map of Mumbai
AREAS = [('Borivali', 118, 70, 'w'), ('Kandivali', 122, 108, 'w'), ('Malad', 126, 146, 'w'), ('Goregaon', 130, 184, 'w'), ('Andheri', 134, 226, 'w'),
         ('Bandra', 132, 300, 'w'), ('Dadar', 150, 362, 'c'), ('Lower Parel', 140, 400, 'c'), ('Worli', 112, 414, 'c'), ('Fort', 168, 498, 'c'),
         ('Mulund', 262, 96, 'e'), ('Powai', 236, 206, 'e'), ('Ghatkopar', 236, 262, 'e'), ('Kurla', 206, 300, 'e'), ('Chembur', 250, 318, 'e')]


def areas():
    land = ('M96 40 C110 30 150 30 170 40 L300 52 C318 70 316 110 300 140 L290 190 C300 240 296 280 280 330 C270 370 238 392 214 420 '
            'L196 470 C188 510 176 540 160 548 C146 540 140 510 132 480 C116 450 98 420 92 380 C84 330 90 290 96 250 C100 200 92 150 96 100 Z')
    west = 'M118 70 L122 108 L126 146 L130 184 L134 226 L133 262 L132 300 L150 362 L160 430 L168 498'
    cent = 'M262 96 L250 150 L236 206 L236 262 L206 300 L180 330 L150 362'
    dots = ''.join(
        f'<g class="mv-map__a mv-map__a--{z}{" is-home" if n == "Ghatkopar" else ""}" style="--i:{i}"><circle cx="{x}" cy="{y}" r="{7 if n == "Ghatkopar" else 4.5}"/>'
        f'<text x="{x + (-12 if z == "w" or n == "Worli" else 12)}" y="{y + 4}" text-anchor="{"end" if z == "w" or n == "Worli" else "start"}">{e(n)}</text></g>' for i, (n, x, y, z) in enumerate(AREAS))
    svg = (f'<svg class="mv-map__svg" viewBox="0 0 420 570" role="img" aria-label="Schematic map of the Mumbai areas U Scale works in, from Borivali to Fort and Mulund to Chembur, with the studio in Ghatkopar">'
           f'<rect x="0" y="0" width="420" height="570" rx="26" class="mv-map__sea"/><path d="{land}" class="mv-map__land"/>'
           f'<path d="M322 64 C346 42 392 44 410 70 L410 236 C384 252 344 236 330 206 C320 170 316 104 322 64Z" class="mv-map__land mv-map__land--far"/>'
           f'<path d="M326 300 C350 286 396 292 410 312 L410 470 C384 488 344 474 330 444 C318 404 318 340 326 300Z" class="mv-map__land mv-map__land--far"/>'
           f'<text x="364" y="150" class="mv-map__far">Thane</text><text x="364" y="390" class="mv-map__far">Navi Mumbai</text>'
           f'<path d="{west}" class="mv-map__rail mv-map__rail--w"/><path d="{cent}" class="mv-map__rail mv-map__rail--c"/>'
           f'<circle r="5" class="mv-map__train"><animateMotion dur="9s" repeatCount="indefinite" path="{west}"/></circle>'
           f'<circle r="5" class="mv-map__train mv-map__train--c"><animateMotion dur="7s" repeatCount="indefinite" path="{cent}"/></circle>'
           f'{dots}<circle cx="236" cy="262" r="16" class="mv-map__pulse"/></svg>')
    side = ('<div class="mv-map__t"><p class="mv-map__home"><span>' + icon('pin') + '</span><span class="mv-map__hw"><b>Studio in Ghatkopar West</b><small>Meetings across Mumbai, Thane and Navi Mumbai</small></span></p>'
            '<ul class="mv-map__leg"><li><i class="mv-map__dot mv-map__dot--w"></i>Western suburbs: Bandra to Borivali</li><li><i class="mv-map__dot mv-map__dot--c"></i>Island city: Dadar, Lower Parel, Worli, Fort</li>'
            '<li><i class="mv-map__dot mv-map__dot--e"></i>Eastern suburbs: Kurla, Chembur, Powai, Mulund</li></ul>'
            '<p class="mv-map__links">Own pages: ' + GP._link('/services/website-design-mumbai/ghatkopar', 'Ghatkopar') + ', ' + GP._link('/services/website-design-mumbai/andheri-east', 'Andheri')
            + ', ' + GP._link('/services/website-design-thane', 'Thane') + ' and ' + GP._link('/services/website-design-navi-mumbai', 'Navi Mumbai') + '. Elsewhere in India, over WhatsApp and video.</p>'
            '<p class="mv-map__nb">Schematic, not to scale.</p></div>')
    import hero3d  # the 3D map (assets/3d/scenes/mumbai-areas.js); its poster shows first and stays without WebGL
    html = f'<div class="mv-map" data-reveal><div class="mv-map__fig">{hero3d.section_stage("mumbai-areas")}</div>{side}</div>'
    text = ('Based in Ghatkopar West; meets clients across Mumbai: the western suburbs from Bandra to Borivali, the island city from Dadar and Lower Parel to Worli and Fort, '
            'and the eastern suburbs from Kurla and Chembur to Powai and Mulund; also Thane and Navi Mumbai in person, and the rest of India over WhatsApp and video.')
    return html, text


# ---------------------------------------------------------------- sample designs (images)
SAMPLES = ['salon', 'rest', 'bout']


def samples():
    figs = ''.join(f'<figure class="mv-smp__f" style="--i:{i}"><div class="mv-smp__img">{GP._pic(GP.IMG[k], "(max-width: 799px) 86vw, 420px")}</div>'
                   f'<figcaption>{e(GP.IMG[k]["caption"])}</figcaption></figure>' for i, k in enumerate(SAMPLES))
    html = f'<div class="mv-smp fp-snap" data-reveal data-snap>{figs}</div>'
    return html, 'Sample designs: ' + ' '.join(GP.IMG[k]['alt'] + '.' for k in SAMPLES)
