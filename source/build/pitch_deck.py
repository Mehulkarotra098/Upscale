"""The U Scale pitch deck at /pitch-deck: ten animated slides that tell who U Scale is for, why it exists, what it does,
how a project runs, what it costs, the work, the free tools and how to start.

Every fact comes from the site itself: prices from pricing_data.py, client quotes from testimonials.json (approved ones
only), the work list from build_site.py (passed in as ctx['WORK']) and the process and principles from the About page.
The drawings are inline SVG and HTML made for this deck; the motion lives in source/src/pitch.css and pitch.js.

Each slide is a canvas that pitch.js scales to the screen (1280x720 design units on wide screens, 380x680 on phones),
so a slide keeps its composition at any window size. Without JavaScript the slides stack as a normal page, and when
printed (Save as PDF) each slide becomes one landscape page."""
import hashlib
import html
import json
import pathlib
import re
import urllib.parse

import config
import pricing_data as PD

e = lambda t: html.escape(t, quote=False)
ea = lambda t: html.escape(t, quote=True)

SLUG = 'pitch-deck'
SRC = config.REPO / 'source' / 'src'
BUILD = pathlib.Path(__file__).resolve().parent
TITLE = 'U Scale Pitch Deck: Be Found. Be Chosen.'
DESC = ('Ten slides on U Scale: why it exists, what we do, how a project runs from the free audit to the handover, '
        'every price, live client work and our free tools.')
WA_NUMBER = '917977360142'
WA = f'https://wa.me/{WA_NUMBER}?text=' + urllib.parse.quote("Hi Mehul, I've seen the U Scale pitch deck. I'd like a free audit. My business is: ")


# ---------------------------------------------------------------- brand marks
def _r1(d):
    return re.sub(r'-?\d+\.\d+', lambda m: f"{float(m.group()):.1f}".rstrip('0').rstrip('.'), d)

_P = json.load(open(BUILD / 'paths.json'))
U_PATH = _r1(_P['u'])
LETTERS = [_r1(p) for p in _P['letters']]


def lockup(cls='', label='U Scale'):
    """The full logo: green u, then 'scale' in the current text colour."""
    return (f'<svg class="lk {cls}" viewBox="262 272 1221 305" fill-rule="evenodd" role="img" aria-label="{ea(label)}">'
            f'<path class="lk-u" d="{U_PATH}"/>' + ''.join(f'<path class="lk-l" style="--i:{i}" d="{p}"/>' for i, p in enumerate(LETTERS))
            + '</svg>')


def u_mark(x, y, h, fill):
    """The logo's u as an SVG fragment, centred on (x, y) and h units tall."""
    ux0, uy0, uw, uh = 263.75, 351.25, 186.5, 220.75
    s = h / uh
    tx, ty = x - (ux0 + uw / 2) * s, y - (uy0 + uh / 2) * s
    return f'<path fill="{fill}" fill-rule="evenodd" transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})" d="{U_PATH}"/>'


def ic(body, sw=1.8):
    return (f'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" focusable="false">{body}</svg>')

I = {
    'search': ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20.5 20.5-5.2-5.2"/>'),
    'pin': ic('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
    'insta': ic('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>'),
    'ai': ic('<path d="M10 3.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"/><path d="M18 14.5c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z"/>'),
    'ads': ic('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    'web': ic('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18"/><circle cx="6" cy="6.8" r=".6" fill="currentColor"/><circle cx="8.2" cy="6.8" r=".6" fill="currentColor"/><path d="M7 13h6M7 16h10"/>'),
    'seo': ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20.5 20.5-5.2-5.2"/><path d="m7.6 12.2 2-2 1.6 1.4 2.2-2.6"/>'),
    'social': ic('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><path d="M17 20.5s-3.5-2-3.5-4.3a1.8 1.8 0 0 1 3.5-.6 1.8 1.8 0 0 1 3.5.6c0 2.3-3.5 4.3-3.5 4.3Z"/>'),
    'chat': ic('<path d="M20.2 11.6a8.2 8.2 0 0 1-12 7.3L3.8 20l1.2-4.1a8.2 8.2 0 1 1 15.2-4.3Z"/><path d="M8.8 10.2h6.4M8.8 13.6h4"/>', 1.9),
    'audit': ic('<path d="M9 4.5h6M9 3h6v3H9z"/><rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="m8.5 12.5 2 2 4-4.5M8.5 18h7"/>'),
    'plan': ic('<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10Z"/><path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5"/>'),
    'design': ic('<path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16Z"/><path d="m14 7 3 3"/>'),
    'phone': ic('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
    'key': ic('<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>'),
    'shield': ic('<path d="M12 3 19.5 6v6c0 4.4-3.2 7.7-7.5 9-4.3-1.3-7.5-4.6-7.5-9V6Z"/><path d="m8.8 12.2 2.2 2.2 4.4-4.6"/>'),
    'rupee': ic('<path d="M7 4.5h10M7 9h10M7 4.5h3.5a4.5 4.5 0 0 1 0 9H7l7.5 6.5"/>'),
    'arrow': ic('<path d="M5 12h14M13 6l6 6-6 6"/>', 2),
    'back': ic('<path d="M19 12H5M11 6l-6 6 6 6"/>', 2),
    'full': ic('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', 1.9),
    'pdf': ic('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>', 1.9),
    'ext': ic('<path d="M14 4h6v6M20 4l-9 9M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
    'star': '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 3.2 2.7 5.5 6 .9-4.35 4.2 1.03 6-5.38-2.83L6.62 19.8l1.03-6L3.3 9.6l6-.9Z"/></svg>',
}


def A(kind, d=0.0, extra=''):
    """Entry animation attributes: the element plays `kind` when its slide comes in, after d seconds."""
    return f'class="a-{kind}{(" " + extra) if extra else ""}" style="--d:{d:.2f}s"'


def head(eyebrow, h, tag='h2', hid=None, d=0.0):
    """Eyebrow + headline. Each headline line rises out of its own mask; lines are split on '|'."""
    lines = h.split('|')
    spans = ' '.join(f'<span class="ln"><span {A("ln", d + .12 + i * .1)}>{x}</span></span>' for i, x in enumerate(lines))
    return (f'<p {A("up", d, "eb")}><span class="eb__dot"></span>{e(eyebrow)}</p>'
            f'<{tag} class="hx"{f" id={chr(34)}{hid}{chr(34)}" if hid else ""}>{spans}</{tag}>')


# ---------------------------------------------------------------- facts
def _price(rows, name):
    for r in rows:
        if r[0] == name:
            return r
    raise KeyError(name)

PRICE_ROWS = [  # (visible name, rupees, monthly) — read from pricing_data so this slide never disagrees with /pricing
    (PD.label('Landing page'), _price(PD.WEBSITES, 'Landing page')[2], False),
    (PD.label('Business site, 5–10 pages'), _price(PD.WEBSITES, 'Business site, 5–10 pages')[2], False),
    (PD.label('E-commerce, under 50 products'), _price(PD.WEBSITES, 'E-commerce, under 50 products')[2], False),
    ('Local SEO and Google listing', _price(PD.ADDONS, 'Local SEO / Google Business Profile')[3], True),
    ('Ads management', _price(PD.ADDONS, 'Ads management')[3], True),
    ('AI search visibility', _price(PD.ADDONS, 'AI search visibility (GEO)')[3], True),
    ('Care plan: updates, backups, security', _price(PD.WEBSITES, 'Care plan: updates, backups, security')[2], True),
]
CURRENCIES = [('INR', '₹', 'Indian rupees')] + [(k, v[0].strip(), v[2]) for k, v in PD.FX.items()]


def inr(n):
    s = str(int(n))
    if len(s) <= 3:
        return '₹' + s
    head_, tail = s[:-3], s[-3:]
    head_ = re.sub(r'(\d)(?=(\d\d)+$)', r'\1,', head_)
    return f'₹{head_},{tail}'


def _quotes():
    data = json.loads((SRC / 'testimonials.json').read_text(encoding='utf-8'))
    return [t for t in data if t.get('approved')]


# ---------------------------------------------------------------- slides
def s_cover(ctx):
    chips = [('search', 'Google Search', 'c1', .95), ('pin', 'Maps', 'c2', 1.05), ('insta', 'Instagram', 'c3', 1.15),
             ('ai', 'AI answers', 'c4', 1.25), ('ads', 'Ads', 'c5', 1.35)]
    chip_html = ''.join(f'<span class="chip-w {c}"><span {A("pop", d, "chip")}>{I[k]}{e(t)}</span></span>' for k, t, c, d in chips)
    windows = lambda x0, y0, cols, rows, dx=18, dy=22, lit=(): ''.join(
        f'<rect x="{x0 + c * dx}" y="{y0 + r * dy}" width="10" height="12" rx="1.5" class="win{" lit" if (r * cols + c) in lit else ""}" style="--w:{(r * 7 + c * 3) % 9}"/>'
        for r in range(rows) for c in range(cols))
    art = f'''
<div class="cov-art">
 <svg class="cov-svg" viewBox="0 0 600 520" aria-hidden="true" focusable="false">
  <defs>
   <radialGradient id="cvGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#63B849" stop-opacity=".35"/><stop offset="1" stop-color="#63B849" stop-opacity="0"/></radialGradient>
   <linearGradient id="cvBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63B849" stop-opacity=".55"/><stop offset="1" stop-color="#63B849" stop-opacity="0"/></linearGradient>
   <linearGradient id="cvTower" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40376E"/><stop offset="1" stop-color="#2C2552"/></linearGradient>
  </defs>
  <g class="stars">{''.join(f'<circle cx="{x}" cy="{y}" r="{r}" style="--t:{t}s"/>' for x, y, r, t in [(70,40,1.6,0),(520,70,1.3,1.2),(560,190,1.8,.6),(30,210,1.2,2),(470,20,1.5,1.6),(200,30,1.1,.9),(380,60,1.4,2.4),(110,120,1,1.8)])}</g>
  <ellipse cx="300" cy="462" rx="290" ry="58" fill="url(#cvGlow)" {A("fade", .4)}/>
  <g class="floor" stroke="#C9BCE8" stroke-opacity=".16" fill="none" stroke-width="1.2">
   <path d="M10 452H590M60 478H540M130 500H470" {A("draw", .2)} pathLength="1"/>
  </g>
  <g class="tw"><g {A("grow", .15)}><rect x="34" y="96" width="112" height="356" rx="8" fill="url(#cvTower)"/><path d="M146 104l22 12v336h-22z" fill="#211A40"/>{windows(48, 122, 5, 14, lit=(3, 12, 27, 40, 51, 64))}<rect x="54" y="74" width="72" height="22" rx="5" fill="#3B3268"/><text x="90" y="90" class="tw-t">BIG NAME</text></g></g>
  <g class="tw"><g {A("grow", .3)}><rect x="166" y="190" width="70" height="262" rx="7" fill="#2F2858"/>{windows(178, 210, 3, 10, lit=(4, 17, 26))}</g></g>
  <g class="tw"><g {A("grow", .25)}><rect x="372" y="150" width="74" height="302" rx="7" fill="#2F2858"/>{windows(384, 170, 3, 12, lit=(2, 13, 30))}</g></g>
  <g class="tw"><g {A("grow", .2)}><rect x="448" y="56" width="118" height="396" rx="8" fill="url(#cvTower)"/><path d="M566 64l20 12v376h-20z" fill="#211A40"/>{windows(462, 84, 5, 16, lit=(6, 19, 33, 47, 58, 71))}<rect x="470" y="34" width="74" height="22" rx="5" fill="#3B3268"/><text x="507" y="50" class="tw-t">BIG NAME</text></g></g>
  <path class="beam" d="M286 292h28l86 160H200z" fill="url(#cvBeam)" {A("fade", 1.2)}/>
  <g class="ripples"><ellipse cx="300" cy="452" rx="92" ry="15"/><ellipse cx="300" cy="452" rx="92" ry="15" style="--r:1.1s"/><ellipse cx="300" cy="452" rx="92" ry="15" style="--r:2.2s"/></g>
  <g class="shop"><g {A("pop", .45)}>
   <ellipse cx="306" cy="454" rx="96" ry="9" fill="#120E26" opacity=".55"/>
   <rect x="238" y="348" width="124" height="104" rx="4" fill="#FAF9FC"/>
   <path d="M362 352l18 10v90h-18z" fill="#C9BCE8"/>
   <rect x="252" y="378" width="54" height="42" rx="4" fill="#ECE7F5" stroke="#C9BCE8" stroke-width="2"/>
   <path d="M258 420c3-12 9-16 9-16s6 6 4 16M268 420c2-9 8-13 8-13s4 5 2 13" fill="#63B849"/>
   <rect x="316" y="384" width="32" height="68" rx="3" fill="#251E45"/><circle cx="341" cy="420" r="2.4" fill="#63B849"/>
   <rect x="320" y="392" width="24" height="11" rx="2" fill="#63B849"/><text x="332" y="400.6" class="open-t">OPEN</text>
   <path d="M230 330h140v18H230z" fill="#63B849"/>
   {''.join(f'<rect x="{230 + i * 23.33:.2f}" y="330" width="11.67" height="18" fill="#FAF9FC"/>' for i in range(6))}
   {''.join(f'<circle cx="{235.83 + i * 11.67:.2f}" cy="348" r="5.83" fill="{"#63B849" if i % 2 == 0 else "#FAF9FC"}"/>' for i in range(12))}
   <rect x="250" y="300" width="100" height="28" rx="6" fill="#251E45" stroke="#63B849" stroke-width="2"/>
   <text x="300" y="319.5" class="sign-t">YOUR SHOP</text>
  </g></g>
  <g class="pin-w"><g {A("drop", .75)}><g class="pin-bob">
   <path d="M300 168c-26 0-44 19-44 42 0 30 44 74 44 74s44-44 44-74c0-23-18-42-44-42z" fill="#63B849"/>
   <path d="M300 168c-26 0-44 19-44 42 0 30 44 74 44 74" fill="none" stroke="#8ED474" stroke-width="3" stroke-linecap="round" opacity=".7"/>
   <circle cx="300" cy="210" r="22" fill="#FAF9FC"/>
   {u_mark(300, 211, 24, '#251E45')}
  </g></g></g>
 </svg>
 {chip_html}
</div>'''
    founder = GP_IMG(ctx)
    return f'''
<div class="lay lay--split lay--cover">
 <div class="hd">
  {head('U Scale · The pitch deck', 'Be found.|<em>Be chosen.</em>', tag='h1', hid='deck-title')}
 </div>
 <div class="bd">
  <p {A("up", .45, "lead")}>U Scale designs websites and runs digital marketing for independent businesses, so they get a fair chance next to the big names.</p>
  <div {A("up", .6, "byline")}>{founder}<span><b>Mehul Karotra</b>Founder. Based in Mumbai, working with clients across India and abroad.</span></div>
  <p {A("fade", 1.6, "hint")}><span class="hint--key"><kbd>→</kbd> next slide</span><span class="hint--touch">Swipe to go through the deck</span></p>
 </div>
 <div class="art">{art}</div>
</div>'''


def GP_IMG(ctx, cls='face'):
    base = '/assets/pages/mehul-karotra-website-designer-ghatkopar'
    return (f'<picture class="{cls}"><source type="image/avif" srcset="{base}-480.avif"><img src="{base}-480.webp" width="480" height="480" '
            f'alt="Mehul Karotra, founder of U Scale" loading="lazy" decoding="async"></picture>')


def s_problem(ctx):
    art = f'''
<div class="srch">
 <div {A("up", .2, "srch__card")}>
  <div class="srch__bar">{I["search"]}<span class="typed" data-type="tailor near me">tailor near me</span><i class="caret"></i></div>
  <ol class="srch__res">
   <li {A("up", 1.0, "res res--big res--pick")}><span class="res__logo"></span><span class="res__body"><b>Big name tailors</b><span class="res__meta"><span class="stars">{I["star"] * 5}</span> Open now</span><span class="res__chips"><i>Prices</i><i>Photos</i><i>Book online</i></span></span><span class="res__chosen">Chosen</span></li>
   <li {A("up", 1.15, "res res--big")}><span class="res__logo res__logo--2"></span><span class="res__body"><b>Another big name</b><span class="res__meta"><span class="stars">{I["star"] * 4}</span> Open now</span><span class="res__chips"><i>Menu</i><i>Directions</i><i>Call</i></span></span></li>
   <li {A("up", 1.3, "res res--you")}><span class="res__logo res__logo--you"></span><span class="res__body"><b>Your shop</b><span class="res__meta">Hours not listed</span><span class="res__chips"><i class="q">No photos</i><i class="q">Price?</i><i class="q">How to book?</i></span></span></li>
  </ol>
  <span class="tap" aria-hidden="true"></span>
 </div>
</div>'''
    return f'''
<div class="lay lay--split lay--problem">
 <div class="hd">{head('02 · The problem', 'Good work can|still lose|the customer.')}</div>
 <div class="bd">
  <p {A("up", .45, "lead")}>Someone searches, can’t find the hours, can’t see the work, can’t tell what it costs or how to book, and goes with the bigger name that made all of that easy.</p>
  <p {A("up", .6, "body")}>None of that is about the quality of the work. It’s about what the customer can see before they decide.</p>
 </div>
 <div class="art">{art}</div>
</div>'''


def s_jobs(ctx):
    pts = [(42, 58, 'Search'), (152, 70, 'Maps'), (160, 150, 'Social'), (48, 146, 'Ads'), (100, 30, 'AI answers')]
    radar = f'''
<svg class="radar" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
 <defs><linearGradient id="rdSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#63B849" stop-opacity="0"/><stop offset="1" stop-color="#63B849" stop-opacity=".55"/></linearGradient></defs>
 <circle cx="100" cy="100" r="92" class="rd-ring" {A("pop", .3)}/><circle cx="100" cy="100" r="62" class="rd-ring" {A("pop", .4)}/><circle cx="100" cy="100" r="32" class="rd-ring" {A("pop", .5)}/>
 <g class="rd-sweep"><path d="M100 100 L100 8 A92 92 0 0 1 178 52 Z" fill="url(#rdSweep)"/></g>
 {''.join(f'<g class="rd-pt" transform="translate({x} {y})"><g {A("pop", .8 + i * .18)}><circle r="9" class="rd-halo" style="--r:{i * .4:.1f}s"/><circle r="4.5" fill="#251E45"/></g></g>' for i, (x, y, _) in enumerate(pts))}
 <g transform="translate(100 100)"><g {A("pop", .6)}><circle r="16" fill="#63B849"/>{u_mark(0, 1, 15, '#251E45')}</g></g>
</svg>'''
    checks = ['Clear information', 'Real work to look at', 'Genuine reviews', 'Honest prices', 'One simple next step']
    tick = '<svg class="tk" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="21" height="21" rx="7" class="tk-b"/><path d="m7 12.5 3.3 3.3L17.2 8.6" pathLength="1" class="a-tick" style="--d:{d:.2f}s"/></svg>'
    return f'''
<div class="lay lay--stack lay--jobs">
 <div class="hd">{head('03 · What the work is for', 'Two jobs,|in this order.')}</div>
 <div class="jobs">
  <article {A("up", .35, "job job--found")}>
   <div class="job__art">{radar}</div>
   <div class="job__txt"><h3><span class="job__n">1</span>Be found</h3>
    <p>Show up where your customer is already looking: Google Search, Maps, social media, ads and, more and more, AI answers.</p></div>
  </article>
  <article {A("up", .5, "job job--chosen")}>
   <div class="job__art"><ul class="checks">{''.join(f'<li>{tick.format(d=1.0 + i * .22)}<span>{e(c)}</span></li>' for i, c in enumerate(checks))}</ul></div>
   <div class="job__txt"><h3><span class="job__n">2</span>Be chosen</h3>
    <p>Once they’ve found you, give them enough to feel sure, and one simple next step: call, enquire, book or buy.</p></div>
  </article>
 </div>
 <p {A("up", .8, "foot")}>Ads and search help people discover a business. The website, the work and the reviews help them decide.</p>
</div>'''


def s_why(ctx):
    tower_w = ''.join(f'<rect x="{34 + c * 11}" y="{124 + r * 13}" width="6" height="8" rx="1" fill="#C9BCE8" opacity=".35"/>' for r in range(4) for c in range(3))
    scale = f'''
<svg class="bal" viewBox="0 0 440 360" aria-hidden="true" focusable="false">
 <defs><radialGradient id="balGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#63B849" stop-opacity=".28"/><stop offset="1" stop-color="#63B849" stop-opacity="0"/></radialGradient></defs>
 <ellipse cx="220" cy="336" rx="200" ry="22" fill="url(#balGlow)"/>
 <g {A("up", .2)}>
  <path d="M186 336h68l-12-24h-44z" fill="#3B3268"/><path d="M198 312h44" stroke="#C9BCE8" stroke-opacity=".5" stroke-width="2"/>
  <rect x="214" y="96" width="12" height="218" rx="5" fill="#C9BCE8"/><rect x="214" y="96" width="4" height="218" rx="2" fill="#FFFFFF" opacity=".35"/>
 </g>
 <g class="bal-l"><g {A("tilt-l", 1.7)}>
  <path d="M50 92 12 196M50 92l38 104" stroke="#C9BCE8" stroke-opacity=".7" stroke-width="1.6"/>
  <rect x="30" y="118" width="40" height="78" rx="4" fill="#4A4180"/><path d="M70 122l9 5v69h-9z" fill="#2C2552"/>{tower_w}
  <text x="50" y="112" class="bal-t">BIG NAME</text>
  <path d="M2 196h96c0 14-20 22-48 22S2 210 2 196z" fill="#C9BCE8"/><path d="M2 196h96" stroke="#FFFFFF" stroke-width="2" opacity=".6"/>
 </g></g>
 <g class="bal-r"><g {A("tilt-r", 1.7)}>
  <path d="M390 92l-38 104M390 92l38 104" stroke="#C9BCE8" stroke-opacity=".7" stroke-width="1.6"/>
  <rect x="360" y="166" width="40" height="30" rx="3" fill="#FAF9FC"/><path d="M356 158h48v9h-48z" fill="#63B849"/>
  <rect x="384" y="176" width="10" height="20" rx="1.5" fill="#251E45"/><rect x="366" y="174" width="12" height="10" rx="1.5" fill="#ECE7F5"/>
  <g {A("drop", 1.05)}><rect x="404" y="160" width="28" height="36" rx="7" fill="#63B849"/>{u_mark(418, 178, 20, '#251E45')}</g>
  <path d="M342 196h96c0 14-20 22-48 22s-48-8-48-22z" fill="#C9BCE8"/><path d="M342 196h96" stroke="#FFFFFF" stroke-width="2" opacity=".6"/>
 </g></g>
 <g class="bal-beam"><g {A("tilt", 1.7)}>
  <rect x="40" y="86" width="360" height="12" rx="6" fill="#C9BCE8"/><rect x="40" y="86" width="360" height="4" rx="2" fill="#FFFFFF" opacity=".4"/>
  <circle cx="50" cy="92" r="6" fill="#FAF9FC"/><circle cx="390" cy="92" r="6" fill="#FAF9FC"/>
 </g></g>
 <circle cx="220" cy="92" r="13" fill="#63B849"/><circle cx="220" cy="92" r="5" fill="#251E45"/>
</svg>'''
    return f'''
<div class="lay lay--split lay--why">
 <div class="hd">{head('04 · Why U Scale exists', 'A fair chance|next to the|big names.')}</div>
 <div class="bd">
  <figure {A("up", .45, "quote")}>
   <blockquote><p>I started U Scale so that an independent business, or someone starting their first one, gets a fair chance next to the big names: the same standard of care in the work, at a price you can see and plan for.</p></blockquote>
   <figcaption>{GP_IMG(ctx)}<span><b>Mehul Karotra</b>Founder, U Scale</span></figcaption>
  </figure>
 </div>
 <div class="art">{scale}</div>
</div>'''


def s_what(ctx):
    slabs = [  # bottom to top
        ('web', 'Website', 'The base everything stands on.', '/services/website-design-mumbai'),
        ('seo', 'SEO', 'Slow start, then it compounds.', '/services/seo-mumbai'),
        ('social', 'Social media', 'Steady trust, week after week.', '/services/social-media-management-mumbai'),
        ('ads', 'Google and Meta ads', 'In front of buyers from day one.', '/services/google-meta-ads-mumbai'),
        ('ai', 'AI search', 'The right facts when people ask AI.', '/services/ai-search-visibility'),
    ]
    n = len(slabs)
    items = ''.join(
        f'<li class="slab-w" style="--k:{i}"><a {A("drop-s", .35 + i * .16, "slab slab--" + k)} href="{h}">'
        f'<span class="slab__ic">{I[k]}</span><span class="slab__t"><b>{e(t)}</b><span>{e(d)}</span></span><span class="slab__go">{I["arrow"]}</span></a></li>'
        for i, (k, t, d, h) in enumerate(slabs))
    return f'''
<div class="lay lay--split lay--what">
 <div class="hd">{head('05 · What we do', 'Five ways|we help.|Start with one.')}</div>
 <div class="bd">
  <p {A("up", .45, "lead")}>Most owners don’t need everything at once. Pick the one thing worth doing now, and add the rest when it makes sense.</p>
  <p {A("up", .6, "body")}>Nothing is bundled, so you pay only for what you pick.</p>
 </div>
 <div class="art"><div class="tower">
  <svg class="tower__line" viewBox="0 0 60 400" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M30 396 C30 300 30 250 30 8" pathLength="1" {A("draw", 1.2)}/><path d="M18 22 30 6l12 16" pathLength="1" {A("draw", 2.0)}/></svg>
  <ol class="slabs" reversed>{items}</ol>
 </div></div>
</div>'''


def s_how(ctx):
    steps = [
        ('audit', 'Free audit', 'What to fix first. It costs nothing.'),
        ('plan', 'Written plan', 'What we’ll do, by when, and the exact price.'),
        ('design', 'Design you approve', 'Real screens in Figma, before anything is built.'),
        ('phone', 'Build and test', 'Tested on phones, enquiry form and Search Console set up.'),
        ('key', 'Launch and handover', 'Domain and hosting in your name. Code and logins handed over.'),
        ('shield', '30 days of bug fixes', 'Then your choice: look after it yourself, or take the care plan.'),
    ]
    cards = ''.join(
        f'<li {A("pop-s", .5 + i * .2, "step")}><span class="step__n">{i + 1:02d}</span><span class="step__ic">{I[k]}</span>'
        f'<b>{e(t)}</b><span class="step__p">{e(p)}</span></li>' for i, (k, t, p) in enumerate(steps))
    pay = [('20%', 'to start'), ('20%', 'when you approve the design'), ('60%', 'at launch')]
    bar = ''.join(f'<span class="pay__seg pay__seg--{i}"><span class="pay__trk"><span {A("growx", 1.9 + i * .25, "pay__fill")}></span></span><b>{w}</b> <span class="pay__l">{e(t)}</span></span>' for i, (w, t) in enumerate(pay))
    return f'''
<div class="lay lay--stack lay--how">
 <div class="hd">{head('06 · How we work with you', 'From the free audit|to the handover.')}</div>
 <div class="route">
  <svg class="route__line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 10H1000" pathLength="1" {A("draw", .45)}/></svg>
  <span class="route__dot" aria-hidden="true"></span>
  <ol class="steps">{cards}</ol>
 </div>
 <div class="how-foot">
  <div {A("up", 1.8, "pay")}><span class="pay__h">How you pay</span><span class="pay__bar">{bar}</span></div>
  <p {A("up", 2.1, "talk")}>{I["chat"]}<span>You talk to Mehul directly, on WhatsApp, at any stage. Replies come within 24 hours, usually much faster.</span></p>
 </div>
</div>'''


def s_price(ctx):
    rows = ''
    for i, (name, rupees, monthly) in enumerate(PRICE_ROWS):
        labels = {'INR': inr(rupees)}
        labels.update({k: PD.fx_label(rupees, k, monthly) for k in PD.FX})
        per = '<small>/mo</small>' if monthly else ''
        rows += (f'<li {A("up", 1.0 + i * .12, "rc-row")}><span class="rc-n">{e(name)}</span><span class="rc-dots"></span>'
                 f'<span class="rc-p"><span class="rc-v" data-inr="{rupees}" data-fx="{ea(json.dumps(labels, ensure_ascii=False))}">{labels["INR"]}</span>{per}</span></li>')
    opts = ''.join(f'<option value="{k}">{e(s)} · {e(n)}</option>' for k, s, n in CURRENCIES)
    principles = [('audit', 'Free audit first', 'You see what to fix before you pay anything.'),
                  ('key', 'You own everything', 'Domain, code, logins, ad accounts and listings stay in your name.'),
                  ('shield', 'No promises we can’t keep', 'No guaranteed rankings, leads or AI mentions. A plain monthly report instead.')]
    pr = ''.join(f'<li {A("up", .7 + i * .14, "pr")}><span class="pr__ic">{I[k]}</span><span><b>{e(t)}</b><span class="pr__p">{e(p)}</span></span></li>' for i, (k, t, p) in enumerate(principles))
    return f'''
<div class="lay lay--split lay--price">
 <div class="hd">{head('07 · Every price on the table', 'Prices you can|see and plan for.')}</div>
 <div class="bd">
  <p {A("up", .45, "lead")}>Every price is published on the site, and yours is fixed in writing before we start.</p>
  <ul class="prs">{pr}</ul>
 </div>
 <div class="art">
  <div class="printer">
   <div {A("fade", .3, "printer__slot")}><span class="printer__led"></span>{lockup("printer__lk")}</div>
   <div class="paper-w"><div {A("print", .55, "paper")}>
    <div class="rc-hd"><b>Price list</b><label class="cur"><span class="sr-only">Show prices in</span><select class="cur__s" aria-label="Show prices in">{opts}</select></label></div>
    <ol class="rc-rows">{rows}</ol>
    <p class="rc-ft rc-ft--inr">Ad spend is paid to Google or Meta directly. No GST is charged on these prices right now.</p>
    <p class="rc-ft rc-ft--fx" hidden>Converted from the rupee prices at the rates of {e(PD.FX_DATE)}, then rounded. Ad spend is paid to Google or Meta directly.</p>
    <a class="rc-link" href="/pricing">See every price {I["arrow"]}</a>
    <span {A("stamp", 2.1, "stamp")}>Fixed in writing</span>
   </div></div>
  </div>
 </div>
</div>'''


def s_work(ctx):
    work = {w[0]: w for w in ctx['WORK']}
    phones = [('spacestudio', 'Architecture, Chennai'), ('sashe', 'Fashion, Mumbai'), ('vidhi', 'AI visual artist, Mumbai')]
    ph = ''
    for i, (k, meta) in enumerate(phones):
        w = work[k]
        ph += (f'<li {A("rise-p", .35 + i * .16, "ph ph--" + str(i))}><a href="{ea(w[5])}" target="_blank" rel="noopener">'
               f'<span class="ph__frame"><span class="ph__btn ph__btn--a"></span><span class="ph__btn ph__btn--b"></span><span class="ph__screen">'
               f'<img src="/assets/work/{k}-mobile.webp" srcset="/assets/work/{k}-mobile.webp 360w, /assets/work/{k}-mobile@2x.webp 720w" sizes="(max-width: 700px) 120px, 240px" '
               f'width="360" height="805" alt="{ea(w[1])} website on a phone" loading="lazy" decoding="async"><span class="ph__island"></span><span class="ph__glare"></span></span></span>'
               f'<span class="ph__cap"><b>{e(w[1])}</b><span>{e(meta)} {I["ext"]}<span class="sr-only"> (opens the live site in a new tab)</span></span></span></a></li>')
    qs = _quotes()
    quotes = ''
    for i, q in enumerate(qs):
        stars = f'<span class="stars" aria-label="Rated 5 out of 5">{I["star"] * 5}</span>' if q.get('rating') == 5 else ''
        src = f'<a href="{ea(q["url"])}" target="_blank" rel="noopener">{e(q["url_label"])}<span class="sr-only"> (opens in a new tab)</span></a>' if q.get('url') else ''
        quotes += (f'<figure class="qt{" is-on" if i == 0 else ""}" data-q="{i}"{"" if i == 0 else " inert aria-hidden=" + chr(34) + "true" + chr(34)}><blockquote><p>{e(q["quote"])}</p></blockquote>'
                   f'<figcaption>{stars}<b>{e(q["name"])}</b><span>{e(q["role"])}</span>{src}</figcaption></figure>')
    dots = ''.join(f'<button type="button" class="qd{" is-on" if i == 0 else ""}" data-q="{i}" aria-label="Show quote {i + 1} of {len(qs)}"></button>' for i in range(len(qs)))
    return f'''
<div class="lay lay--split lay--work">
 <div class="hd">{head('08 · Work you can open', 'Live sites,|and what clients|said.')}</div>
 <div class="bd">
  <div {A("up", .6, "quotes")}><div class="qts" aria-live="polite">{quotes}</div><div class="qds">{dots}</div></div>
 </div>
 <div class="art">
  <ul class="phones">{ph}</ul>
  <p {A("up", 1.1, "fact")}><b>Space Studio Chennai:</b> 86 hand-coded pages, a live 3D building model on every service page, and every old link kept for search.</p>
 </div>
</div>'''


def s_tools(ctx):
    qr = ''.join(f'<rect x="{x * 10}" y="{y * 10}" width="9" height="9" rx="2" class="a-px" style="--d:{.6 + ((x * 7 + y * 3) % 11) * .06:.2f}s"/>'
                 for y in range(7) for x in range(7)
                 if not (x < 3 and y < 3) and not (x > 3 and y < 3) and not (x < 3 and y > 3) and (x * 5 + y * 3 + x * y) % 3 != 0)
    finders = ''.join(f'<rect x="{x}" y="{y}" width="27" height="27" rx="6" class="qr-f"/><rect x="{x + 8}" y="{y + 8}" width="11" height="11" rx="3" class="qr-c"/>' for x, y in [(0, 0), (43, 0), (0, 43)])
    arts = {
        'gauge': f'''<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false"><path d="M14 68a46 46 0 0 1 92 0" class="g-track"/><path d="M14 68a46 46 0 0 1 92 0" pathLength="1" class="g-arc a-arc" style="--d:.7s"/>
            <g transform="translate(60 68)"><g class="g-needle a-needle" style="--d:.7s"><path d="M-3 0 0-40 3 0z" fill="#251E45"/></g><circle r="6" fill="#251E45"/></g><text x="60" y="30" class="g-t">/100</text></svg>''',
        'review': f'''<svg viewBox="0 0 80 80" aria-hidden="true" focusable="false"><g transform="translate(5 5)">{finders}{qr}</g><g transform="translate(40 40)"><g class="a-pop" style="--d:1.3s"><circle r="12" fill="#FAF9FC"/><circle r="9.5" fill="#63B849"/><path d="m0-6 1.8 3.6 4 .6-2.9 2.8.7 4L0 3.1-3.6 5l.7-4L-5.8-1.8l4-.6Z" fill="#FAF9FC"/></g></g></svg>''',
        'card': '''<div class="vc" aria-hidden="true"><span class="vc__c vc__c--1"><b>Your Name</b><i>English</i></span><span class="vc__c vc__c--2" lang="hi"><b>आपका नाम</b><i>हिन्दी</i></span><span class="vc__c vc__c--3" lang="mr"><b>तुमचे नाव</b><i>मराठी</i></span></div>''',
        'qr': f'''<div class="qg" aria-hidden="true"><svg viewBox="0 0 80 80"><g transform="translate(5 5)">{finders}{qr}</g><g transform="translate(40 40)"><g class="a-pop" style="--d:1.2s"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="#251E45"/>{u_mark(0, 0, 13, '#63B849')}</g></g></svg>
            <span class="qg__tags"><i>UPI</i><i>Wi-Fi</i><i>WhatsApp</i></span></div>''',
        'calc': '''<div class="cc" aria-hidden="true"><span class="cc__lbl">Market range</span><span class="cc__range"><span class="a-growx" style="--d:.7s"></span></span>
            <span class="cc__lbl">Our fixed price</span><span class="cc__track"><span class="cc__knob a-slide" style="--d:1.1s"></span></span></div>''',
    }
    tools = [
        ('gauge', 'Google Business Profile checker', 'A score out of 100 and a fix list in about 2 minutes.', '/tools/google-business-profile-checker'),
        ('review', 'Google review QR code maker', 'Your review link, a QR code and a printable standee.', '/tools/google-review-qr-code'),
        ('card', 'Visiting card maker', 'Designs in English, Hindi and Marathi, with a print-ready PDF.', '/tools/visiting-card-maker'),
        ('qr', 'QR code generator', 'Links, UPI, WhatsApp and Wi-Fi codes with your logo.', '/tools/qr-code-generator'),
        ('calc', 'Website cost calculator', 'Our fixed price, the market range and the yearly costs.', '/tools/website-cost-calculator'),
    ]
    cards = ''.join(f'<li {A("pop-s", .45 + i * .14, "tl")}><a href="{h}"><span class="tl__art tl__art--{k}">{arts[k]}</span>'
                    f'<span class="tl__t"><b>{e(t)}</b><span>{e(p)}</span></span><span class="tl__free">Free</span></a></li>'
                    for i, (k, t, p, h) in enumerate(tools))
    return f'''
<div class="lay lay--stack lay--tools">
 <div class="hd hd--row">{head('09 · Free tools', 'Useful before|you hire anyone.')}
  <p {A("up", .4, "lead")}>Five free tools for local businesses, with no sign-up. You can use all of them without hiring us.</p></div>
 <ul class="tls">{cards}</ul>
</div>'''


def s_close(ctx):
    steps = ['Free audit', 'First page', 'Found on Google', 'Ads', 'WhatsApp chatbot']
    sx, sy, w, h = 20, 300, 112, 52
    blocks, labels = '', ''
    for i, t in enumerate(steps):
        x, y = sx + i * w, sy - i * h
        blocks += (f'<g {A("grow", .4 + i * .12)}><rect x="{x}" y="{y}" width="{w}" height="{340 - y + 20}" rx="6" class="st-b st-b--{i}"/>'
                   f'<rect x="{x}" y="{y}" width="{w}" height="6" rx="3" class="st-top"/></g>')
        l1, _, l2 = t.partition(' ')
        lines = f'<tspan x="{x + w / 2}" dy="0">{e(l1)}</tspan>' + (f'<tspan x="{x + w / 2}" dy="1.15em">{e(l2)}</tspan>' if l2 else '')
        labels += f'<text x="{x + w / 2}" y="{y + 36}" class="st-t a-fade" style="--d:{.9 + i * .12:.2f}s">{lines}</text>'
    stairs = f'''
<svg class="stairs" viewBox="0 0 600 380" aria-hidden="true" focusable="false">
 <defs><radialGradient id="stGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#63B849" stop-opacity=".3"/><stop offset="1" stop-color="#63B849" stop-opacity="0"/></radialGradient></defs>
 <ellipse cx="300" cy="364" rx="300" ry="26" fill="url(#stGlow)"/>
 {blocks}{labels}
 <g class="climb"><g class="climb__a"><g class="climb__s">
  <g transform="translate(-14 0)"><path d="M0-40c-11 0-19 8-19 18 0 13 19 32 19 32s19-19 19-32c0-10-8-18-19-18z" fill="#63B849"/><circle cy="-22" r="8" fill="#FAF9FC"/></g>
  <g transform="translate(16 0)"><circle cy="-16" r="15" fill="#C9BCE8"/>{u_mark(16 - 16, -15, 14, '#251E45')}</g>
 </g></g></g>
</svg>'''
    return f'''
<div class="lay lay--split lay--close">
 <div class="hd">{head('10 · You scale, we scale with you', 'Start small.|Grow when it|makes sense.')}</div>
 <div class="bd">
  <p {A("up", .45, "lead")}>A first project can be small. A landing page is {inr(PRICE_ROWS[0][1])} and can be live in under two weeks. What comes next depends on what the first step shows, and the work grows as your business does.</p>
  <div {A("up", .6, "ctas")}><a class="bt bt--go" href="{ea(WA)}" target="_blank" rel="noopener">{I["chat"]}Get a free audit on WhatsApp</a><a class="bt bt--line" href="/pricing">See every price</a></div>
  <p {A("up", .75, "contact")}><a href="/">uscale.in</a><span>·</span><a href="https://wa.me/{WA_NUMBER}" target="_blank" rel="noopener">+91 79773 60142</a><span>·</span><a href="/about">About U Scale</a></p>
 </div>
 <div class="art">{stairs}<p class="legend" aria-hidden="true"><span class="lg lg--you"></span>You <span class="lg lg--us"></span>U Scale</p></div>
</div>'''


SLIDES = [  # id, short name for the counter, tone, builder
    ('cover', 'Be found. Be chosen.', 'dark', s_cover),
    ('problem', 'The problem', 'light', s_problem),
    ('jobs', 'What the work is for', 'tint', s_jobs),
    ('why', 'Why U Scale exists', 'dark', s_why),
    ('what', 'What we do', 'light', s_what),
    ('how', 'How we work with you', 'tint', s_how),
    ('price', 'Every price on the table', 'dark', s_price),
    ('work', 'Work you can open', 'light', s_work),
    ('tools', 'Free tools', 'tint', s_tools),
    ('close', 'You scale, we scale with you', 'dark', s_close),
]

BG = {  # one background pattern per slide; each fades out at its edges instead of being cut
    'cover': '<span class="bg-glow bg-glow--a"></span><span class="bg-glow bg-glow--b"></span>',
    'problem': '<span class="bg-dots"></span>',
    'jobs': '<span class="bg-rings"></span>',
    'why': '<span class="bg-glow bg-glow--c"></span><span class="bg-spark"></span>',
    'what': '<span class="bg-diag"></span>',
    'how': '<span class="bg-route"></span>',
    'price': '<span class="bg-grid"></span><span class="bg-glow bg-glow--d"></span>',
    'work': '<span class="bg-blob bg-blob--a"></span><span class="bg-blob bg-blob--b"></span>',
    'tools': '<span class="bg-dots bg-dots--v"></span>',
    'close': '<span class="bg-glow bg-glow--e"></span><span class="bg-rise"></span>',
}


def page(ctx):
    site = ctx['SITE_URL']
    url = site + SLUG
    n = len(SLIDES)
    sections = ''
    for i, (sid, name, tone, fn) in enumerate(SLIDES):
        sections += (f'<section class="sl sl--{tone} sl--{sid}" id="{sid}" data-name="{ea(name)}" aria-roledescription="slide" aria-label="{i + 1} of {n}: {ea(name)}">'
                     f'<div class="bg" aria-hidden="true">{BG[sid]}</div><div class="cv"><div class="cvi">{fn(ctx)}</div></div></section>\n')
    prog = ''.join(f'<li><button type="button" data-go="{i}" aria-label="Slide {i + 1}: {ea(name)}"><i></i></button></li>' for i, (_, name, _, _) in enumerate(SLIDES))
    css = (SRC / 'pitch.css').read_text(encoding='utf-8')
    js = (SRC / 'pitch.js').read_text(encoding='utf-8')
    v = hashlib.sha1((css + js).encode()).hexdigest()[:8]
    out = ctx['site']
    (out / 'pitch.css').write_text(css, encoding='utf-8')
    (out / 'pitch.js').write_text(js, encoding='utf-8')
    og = site + 'assets/pages/pitch-deck-og.png'
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': TITLE, 'description': DESC, 'inLanguage': 'en-IN',
         'isPartOf': {'@id': site + '#website'}, 'about': {'@id': site + '#business'}, 'author': {'@id': site + '#mehul'},
         'primaryImageOfPage': {'@type': 'ImageObject', 'url': og, 'width': 1200, 'height': 630},
         'mainEntity': {'@type': 'PresentationDigitalDocument', 'name': 'The U Scale pitch deck', 'description': DESC,
                        'author': {'@id': site + '#mehul'}, 'publisher': {'@id': site + '#business'}, 'url': url},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'datePublished': '2026-11-19', 'dateModified': '__LASTMOD__'},
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Pitch deck', 'item': url}]},
    ]}, ensure_ascii=False, separators=(',', ':'))
    return f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(TITLE)}</title>
<meta name="description" content="{ea(DESC)}">
<meta name="robots" content="{ea(ctx['ROBOTS'])}">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#251E45">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en-IN" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(TITLE)}">
<meta property="og:description" content="{ea(DESC)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The U Scale pitch deck: Be found. Be chosen.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(TITLE)}">
<meta name="twitter:description" content="{ea(DESC)}">
<meta name="twitter:image" content="{og}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{ld}</script>
<script>document.documentElement.classList.add('js');</script>
<link rel="stylesheet" href="/pitch.css?v={v}">
<script defer src="/pitch.js?v={v}"></script>
</head>
<body class="deck-page">
<a class="skip" href="#deck">Skip to the slides</a>
<header class="dk-top">
 <a class="dk-brand" href="/">{lockup("dk-lk", "U Scale home")}</a>
 <p class="dk-title" aria-hidden="true"><span class="dk-title__n">01</span><span class="dk-title__t">{e(SLIDES[0][1])}</span></p>
 <div class="dk-acts">
  <a class="dk-cta" href="{ea(WA)}" target="_blank" rel="noopener">{I["chat"]}<span>Free audit</span></a>
  <button class="dk-ic" type="button" data-act="pdf" aria-label="Save the deck as a PDF" title="Save as PDF">{I["pdf"]}</button>
  <button class="dk-ic" type="button" data-act="fs" aria-label="Full screen" title="Full screen">{I["full"]}</button>
 </div>
</header>
<main class="deck" id="deck" tabindex="-1" aria-roledescription="slide deck" aria-label="The U Scale pitch deck">
{sections}</main>
<nav class="dk-bot" aria-label="Slides">
 <button class="dk-nav" type="button" data-act="prev" aria-label="Previous slide">{I["back"]}</button>
 <ol class="dk-prog">{prog}</ol>
 <p class="dk-count" aria-live="polite"><span class="dk-count__n">1</span> / {n}</p>
 <button class="dk-nav dk-nav--next" type="button" data-act="next" aria-label="Next slide">{I["arrow"]}</button>
</nav>
<span class="more-cue" aria-hidden="true">{I["arrow"]}</span>
<div class="dk-wipe" aria-hidden="true"><i class="dk-wipe__a"></i><i class="dk-wipe__b"><svg viewBox="262 340 200 240"><path d="{U_PATH}"/></svg></i></div>
</body>
</html>
'''
