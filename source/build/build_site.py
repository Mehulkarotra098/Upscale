"""Assembles the U Scale site.
Outputs: site/index.html + site/styles.css + site/script.js (deploy as-is), and preview.html (single file, replay button) for review."""
import json, re, urllib.parse, pathlib, html, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

ROOT = pathlib.Path(__file__).resolve().parent
REPO = ROOT.parent.parent
SRC = REPO / 'source' / 'src'
P = json.load(open(ROOT / 'paths.json'))

def r1(d):
    return re.sub(r'-?\d+\.\d+', lambda m: f"{float(m.group()):.1f}".rstrip('0').rstrip('.'), d)

U = r1(P['u']); LET = [r1(p) for p in P['letters']]; VB = "262 272 1221 305"
V, G, L, S = '#251E45', '#63B849', '#C9BCE8', '#FAF9FC'
LT = '#ECE7F5'

loader_logo = (f'<svg class="usl__logo" viewBox="{VB}" fill-rule="evenodd" role="img" aria-label="uscale">'
               f'<path id="usl-u" style="fill:var(--green)" d="{U}"/>'
               + ''.join(f'<path class="l" style="--i:{i};fill:var(--violet)" d="{p}"/>' for i, p in enumerate(LET)) + '</svg>')

def logo(extra_cls=''):
    return (f'<svg class="logo {extra_cls}" viewBox="{VB}" fill-rule="evenodd" aria-hidden="true" focusable="false">'
            f'<path class="bu" style="--i:0;fill:var(--green)" d="{U}"/>'
            + ''.join(f'<path class="bl" style="--i:{i+1}" d="{p}"/>' for i, p in enumerate(LET)) + '</svg>')

# Favicon: green u on a midnight violet rounded square
ux0, uy0, uw, uh = 263.75, 351.25, 186.5, 220.75
s = 150 / uh; tx = 128 - (ux0 + uw / 2) * s; ty = 128 - (uy0 + uh / 2) * s + 4
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="60" fill="{V}"/>'
       f'<path fill="{G}" fill-rule="evenodd" transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})" d="{U}"/></svg>')
favicon = 'data:image/svg+xml,' + urllib.parse.quote(fav, safe=" /:=,.'")

def ic(body, sw=1.8):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" focusable="false">{body}</svg>')

ICONS = {
 'ICON_CHAT': ic('<path d="M20.2 11.6a8.2 8.2 0 0 1-12 7.3L3.8 20l1.2-4.1a8.2 8.2 0 1 1 15.2-4.3Z"/><path d="M8.8 10.2h6.4M8.8 13.6h4"/>', 1.9),
 'IC_SOCIAL': ic('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><path d="M17 20.5s-3.5-2-3.5-4.3a1.8 1.8 0 0 1 3.5-.6 1.8 1.8 0 0 1 3.5.6c0 2.3-3.5 4.3-3.5 4.3Z"/>'),
 'IC_SEO': ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20.5 20.5-5.2-5.2"/><path d="m7.6 12.2 2-2 1.6 1.4 2.2-2.6"/>'),
 'IC_AI': ic('<path d="M10 3.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"/><path d="M18 14.5c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z"/>'),
 'IC_ADS': ic('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
 'IC_BRAND': ic('<path d="M12 3 20 9.5 12 21 4 9.5 12 3Z"/><path d="M4 9.5h16M9 9.5 12 21l3-11.5"/>'),
 'IC_REELS': ic('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9.2v5.6l4.6-2.8L10 9.2Z" fill="currentColor"/>'),
 'IC_AUTO': ic('<circle cx="5.5" cy="6" r="2.5"/><circle cx="18.5" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 6h8M6.8 8.2l3.9 7.4M17.2 8.2l-3.9 7.4"/>'),
 'IC_STAR': ic('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>'),
 'IC_CHART': ic('<path d="M4 4v16h16"/><path d="m7.5 14.5 3.5-4 3 2.5 5-6"/>'),
 'IC_CHECK': ic('<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.6"/>'),
 'IC_PHONE': ic('<path d="M6.6 3.5h2.6l1.5 4.1-2 1.4a11 11 0 0 0 6.3 6.3l1.4-2 4.1 1.5v2.6a2.1 2.1 0 0 1-2.3 2.1A16.6 16.6 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3Z"/>'),
 'IC_MAIL': ic('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
 'IC_INSTA': ic('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>'),
 'IC_PIN': ic('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
}

def slant_bar(x, w, top, bottom, slant=12, r=7):
    k = r * slant / w
    return (f"M{x},{bottom-r} L{x},{top+slant+r} Q{x},{top+slant} {x+r},{top+slant-k:.2f} "
            f"L{x+w-r},{top+k:.2f} Q{x+w},{top} {x+w},{top+r} L{x+w},{bottom-r} "
            f"Q{x+w},{bottom} {x+w-r},{bottom} L{x+r},{bottom} Q{x},{bottom} {x},{bottom-r} Z")

bars = [(40, 166, 1), (126, 134, .85), (212, 98, .7), (298, 46, .55)]
chart = ('<svg viewBox="0 0 420 300" aria-hidden="true" focusable="false">'
         '<rect class="ln" style="--b:0;fill:var(--lavender)" x="40" y="34" width="150" height="11" rx="5.5"/>'
         '<rect class="ln" style="--b:1;fill:var(--violet)" x="40" y="70" width="322" height="15" rx="7.5"/>'
         '<rect class="ln" style="--b:2;fill:var(--violet);opacity:.5" x="40" y="100" width="232" height="15" rx="7.5"/>'
         '<line x1="40" x2="380" y1="267" y2="267" style="stroke:var(--violet);opacity:.12" stroke-width="2" stroke-linecap="round"/>'
         + ''.join(f'<path class="bar" style="--b:{i};fill:var(--green);opacity:{o}" d="{slant_bar(x, 58, t, 266)}"/>' for i, (x, t, o) in enumerate(bars))
         + '</svg>')


# ---------- Hero growth stack (interactive in script.js; this is the no-JS / motion-off render) ----------
import math as _m
GS = [('web', 'Website', 'Website: the base everything stands on.'),
      ('seo', 'SEO', 'SEO: slow start, then it compounds.'),
      ('social', 'Social', 'Social: steady trust, week after week.'),
      ('ads', 'Ads', 'Ads: in front of buyers from day one.'),
      ('ai', 'AI search', 'AI search: named when people ask AI.')]
def gs_f(k, t):
    if k == 'web': return .12 + .16 * t
    if k == 'seo': return .36 * t ** 2.2
    if k == 'social': return .17 * (1 - _m.exp(-3 * t)) / (1 - _m.exp(-3))
    if k == 'ads': return .13 * (1 - _m.exp(-14 * t)) + .02 * t
    s_ = min(1, max(0, (t - .25) / .75)); return .17 * s_ * s_ * (3 - 2 * s_)
GN, GX0, GX1, GYB, GH, GMAX = 40, 4, 384, 196, 184, 1.2
def gs_paths():
    xs = [GX0 + (GX1 - GX0) * j / GN for j in range(GN + 1)]
    low = [0.0] * (GN + 1); out = []
    y = lambda v: GYB - GH * v / GMAX
    for k, _, _ in GS:
        up = [low[j] + gs_f(k, j / GN) for j in range(GN + 1)]
        d = 'M' + ' L'.join(f'{xs[j]:.1f},{y(up[j]):.1f}' for j in range(GN + 1)) + ' L' + ' L'.join(f'{xs[j]:.1f},{y(low[j]):.1f}' for j in range(GN, -1, -1)) + 'Z'
        out.append((k, d)); low = up
    line = 'M' + ' L'.join(f'{xs[j]:.1f},{y(low[j]):.1f}' for j in range(GN + 1))
    return out, line, (xs[-1], y(low[-1]))
_lay, _line, (_ex, _ey) = gs_paths()
growth = (
    '<div class="gs" data-growth>'
    '<div class="gs__head"><div class="gs__hl"><span class="gs__label">Your business online</span>'
    '<span class="gs__status"><b data-gs-status>Chosen</b><i>.</i></span></div>'
    '<span class="gs__count"><b data-gs-n>5</b>/5 channels</span></div>'
    '<div class="gs__chart"><svg viewBox="0 0 400 204" role="img" aria-label="Illustration: website, SEO, social, ads and AI search stacking into one rising growth curve over twelve months" focusable="false">'
    + ''.join(f'<line class="gs__grid" x1="4" x2="384" y1="{GYB - GH * i / 4:.0f}" y2="{GYB - GH * i / 4:.0f}"/>' for i in range(1, 5))
    + ''.join(f'<path class="gs__layer" data-gs-layer="{k}" d="{d}"/>' for k, d in _lay)
    + f'<line class="gs__base" x1="4" x2="384" y1="{GYB}" y2="{GYB}"/>'
    + f'<path class="gs__line" data-gs-line d="{_line}"/>'
    + f'<path class="gs__flow" data-gs-flow pathLength="1" d="{_line}"/>'
    + '<g class="gs__comet" data-gs-comet transform="translate(-40 -40)"><circle class="gs__glow" r="9"/><circle r="3.6"/></g>'
    + f'<g class="gs__end" data-gs-dot transform="translate({_ex:.1f} {_ey:.1f})"><circle class="gs__ring" r="11"/><circle class="gs__dot" r="5.5"/></g>'
    + '</svg><div class="gs__axis" aria-hidden="true"><span>Month 1</span><span>Month 12</span></div></div>'
    '<div class="gs__chips" role="group" aria-label="Channels: switch them on and off">'
    + ''.join(f'<button class="gs__chip" type="button" data-k="{k}" aria-pressed="true"><i aria-hidden="true"></i>{html.escape(n)}</button>' for k, n, _ in [GS[0], GS[1], GS[3], GS[2], GS[4]])
    + '</div><p class="gs__tip" data-gs-tip>Five channels, one plan. Tap any to switch it off.</p>'
    '<p class="gs__note">Illustration, not a forecast.</p>'
    '<span class="gs__badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></span>'
    '</div>'
    '<div class="hf hf--search" aria-hidden="true"><div class="hf__bar"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><span data-hf-q>web designer in mumbai</span><i class="hf__caret"></i></div>'
    '<div class="hf__res"><span class="hf__fav"></span><span><b>Your business</b><small>Found, first page</small></span></div></div>'
    '<div class="hf hf--toast" aria-hidden="true"><span class="hf__wa"><svg viewBox="0 0 24 24"><path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.6z"/></svg></span><span><b>New enquiry</b><small>WhatsApp · just now</small></span></div>')

cta_bars = ('<svg viewBox="0 0 400 320" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">'
            + ''.join(f'<path style="fill:var(--lavender);opacity:{o}" d="{slant_bar(x, 78, t, 320, 18, 10)}"/>'
                      for x, t, o in [(14, 210, .08), (112, 150, .12), (210, 86, .17), (308, 10, .24)]) + '</svg>')

# ---------- v3 content: real screenshots, real logos ----------
SITE_URL = 'https://uscalebymehul.vercel.app/'  # live URL, set at deploy
BOOK = 'https://wa.me/917977360142?text=' + urllib.parse.quote("Hi Mehul, I'd like to book a free strategy call. A good time for me is: ")
SZ = json.load(open(ROOT / 'asset_sizes.json'))
ARW = '<span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span>'
e = lambda t: html.escape(t, quote=False)
# slug, name, meta, tag, description, url, accent, has_mobile, wall_tag, page alt detail
WORK = [
 ('tis', 'TIS Admissions 2026–27', 'Education · Kandivali West, Mumbai', 'Concept · Web Development', 'A concept admissions experience: programs, campus life and a friction-free enquiry flow for an ICSE school.', 'https://tis-school-admissions-2026.vercel.app', '#FCC513', True, 'Concept', 'admissions hero, learning stages and campus sections'),
 ('antrah', 'Antrah Wellness', 'Wellness · Mumbai', 'Web Development', 'Launch site for a two-day wellness gathering: five paths to wellbeing, one calm digital home.', 'https://antrah-wellness.vercel.app', '#6B2F0A', True, '', 'hero with the five paths and the story section'),
 ('roar', 'Roar Arena', 'Sports · India', 'Web Development', "A live match center and fan community platform for India's sports watch-party culture.", 'https://roararenaindia.vercel.app', '#FF5428', True, '', 'matchday board hero and what we are building'),
 ('mcm', 'My Country Mobile', 'Telecom · In-house role', 'UI/UX + Web', 'Interface design and web development for an AI-first cloud phone and contact center platform, built during an in-house role.', 'https://mycountrymobile.com', '#3B82F6', False, 'In-house', 'AI contact center hero, platform and core tools sections'),
 ('callmama', 'Callmama', 'Telecom · In-house role', 'UI/UX + Web', 'Product design and web experience for an international calling brand, built during an in-house role.', 'https://www.callmama.com', '#1B99F9', False, 'In-house', 'calling app hero, country numbers and products'),
 ('growcred', 'GrowCred', 'Climate Tech · Founder project', 'Product Build', 'Founder-built climate-tech platform: plant trees, upload proof, earn TreeCoin.', 'https://greencred.vercel.app', '#22C55E', True, '', 'hero and the plant, prove, protect loop'),
 ('sashe', 'Sashe by Prachi', 'Fashion · Mumbai', 'Web Development', "Digital flagship for a bespoke fashion label: editorial hero, signature looks, studio forms, founder story. Built mobile-first to the founder's pixel-level bar.", 'https://sashebyprachi.vercel.app', '#641F2A', True, '', 'editorial hero, signature looks and studio forms'),
 ('vidhi', 'Vidhi Parmar', 'Creative · Mumbai', 'Web Development', 'Personal hire-me portfolio for a Mumbai AI visual artist: selected AI ad films, four-step process, services, FAQ.', 'https://vidhi-parmar-ai.vercel.app', '#F0457F', True, '', 'showreel hero and about section'),
 ('brandgen', 'BrandGen', 'AI SaaS · Marketing visuals', 'Social Media + Site', 'Website and social media for an AI tool that turns one brand reference into on-brand marketing visuals.', 'https://www.getbrandgen.com', '#F97015', False, '', 'models and voice prompt sections'),
]
def dom(u): return u.split('//')[1].rstrip('/')
def work_card(w, i):
    k, name, meta, tag, desc, url, acc, mob, _, alt = w
    pw, ph = SZ[k + '-page']; lw, lh = SZ[k]
    phone = (f'<div class="wk__phone"><div class="wk__screen"><img src="assets/work/{k}-mobile.webp" width="360" height="805" alt="{e(name)} on a phone" loading="lazy" decoding="async"></div></div>' if mob else '')
    return (f'            <!-- TODO (optional): swap {e(name)} captures for fresh 1440x900 screenshots if the site changes -->\n'
            f'            <li class="wk" style="--acc:{acc}" data-i="{i}" data-cursor="view"><a class="wk__a" href="{url}" target="_blank" rel="noopener">'
            f'<div class="wk__media"><div class="wk__frame"><div class="wk__bar" aria-hidden="true"><i></i><i></i><i></i><span>{dom(url)}</span></div>'
            f'<div class="wk__view"><img class="wk__page" src="assets/work/{k}-page.webp" width="{pw}" height="{ph}" alt="{e(name)} live site: {alt}" loading="lazy" decoding="async"></div></div>{phone}</div>'
            f'<div class="wk__body"><div class="wk__top"><img class="wk__logo" src="assets/logos/{k}.webp" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async"><span class="wk__meta">{e(meta)}</span></div>'
            f'<h3>{e(name)}</h3><span class="tag">{e(tag)}</span><p>{e(desc)}</p>'
            f'<span class="wk__cta">View live site {ARW}<span class="sr-only"> (opens in a new tab)</span></span></div></a></li>')
work_cards = '\n'.join(work_card(w, i) for i, w in enumerate(WORK))
project_index = '\n'.join(
    f'        <li><a href="{w[5]}" target="_blank" rel="noopener" data-peek="assets/work/{w[0]}-peek.webp"><b>{e(w[1])}</b><span>{e(w[2])} · {e(w[3])}</span><i aria-hidden="true">↗</i><span class="sr-only"> (opens in a new tab)</span></a></li>'
    for w in WORK)
def wall_cell(w, dup=False):
    k = w[0]; lw, lh = SZ[k]; t = f'<span class="lw__tag">{w[8]}</span>' if w[8] else ''
    return f'<div class="lw__cell{" lw__dup" if dup else ""}"><img src="assets/logos/{k}.webp" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async">{t}</div>'
names = ''.join(f'<li>{e(w[1])}{" (concept project)" if w[8]=="Concept" else " (in-house role)" if w[8]=="In-house" else ""}</li>' for w in WORK)
r1, r2 = WORK[:5], WORK[5:]
logo_wall = (f'<ul class="sr-only">{names}</ul>'
             f'<div class="wrap"><div class="lw__grid" aria-hidden="true">{"".join(wall_cell(w) for w in WORK)}</div></div>'
             '<div class="lw__marq" aria-hidden="true">'
             f'<div class="lw__row r1"><div class="lw__track">{"".join(wall_cell(w) for w in r1)}{"".join(wall_cell(w, True) for w in r1)}</div></div>'
             f'<div class="lw__row r2"><div class="lw__track">{"".join(wall_cell(w) for w in r2)}{"".join(wall_cell(w, True) for w in r2)}</div></div></div>')

FAQ = [
 ('Is U Scale an agency or a freelancer?', "A bit of both, in the best way. U Scale is me, Mehul Karotra, working as an independent, contract-based partner. You get agency-quality design, development and marketing, but you sign with me directly and talk to me directly. If a project ever needs a specialist, like a photographer, I bring them in and stay your single point of contact."),
 ('How much does a website cost in Mumbai?', "With me, a landing page is ₹25,000, a 3–4 page business site ₹55,000, a 5–10 page site with a blog ₹85,000, and e-commerce starts at ₹95,000. Every price is fixed and agreed in writing before I start. Every price is listed on the pricing page."),
 ('How much does digital marketing cost in Mumbai?', "There are no bundles to squeeze into: you pay only for what you need. Local SEO is ₹15,000/month, technical SEO ₹25,000/month, ads management ₹20,000/month (plus a ₹10,000 setup), AI search visibility ₹12,000/month, and one-off work starts at ₹800 for a social post. The quote builder on the pricing page adds it up for you."),
 ('Do you work on contract or monthly retainer?', "Both. Websites and branding are fixed-price contracts: 20% to start, 20% on design sign-off and 60% on launch. Marketing runs as a monthly retainer: a 3-month sprint, then month-to-month with 30 days notice. No long lock-ins."),
 ('How long does SEO take to show results?', 'Honest answer: 3–6 months for meaningful movement. Anyone promising page one in 30 days is selling you something. I show you the trajectory every month.'),
 ('How long does it take to build a website?', 'A business website typically takes 4–8 weeks from kickoff to launch, depending on pages and how ready your content is. A landing page can be live in under two weeks.'),
 ('What is AI search visibility (GEO)?', 'When someone asks ChatGPT or Perplexity for a recommendation in your category, does your business get mentioned? I optimise your presence so AI answers cite you.'),
 ('How do we start?', 'Book a free strategy call or ping me on WhatsApp. I audit your digital presence for free, then send a plan with clear pricing.'),
]
faq = '\n'.join(
    (f'        <div class="qa{" is-open" if i == 0 else ""}"><h3><button class="qa__btn" type="button" id="q{i}" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="a{i}">'
     f'<span class="qa__n" aria-hidden="true">{i+1:02d}</span><span>{e(q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3>'
     f'<div class="qa__panel" id="a{i}" role="region" aria-labelledby="q{i}"><div><p>{e(a)}</p></div></div></div>'
     )
    for i, (q, a) in enumerate(FAQ))
faq = faq.replace('<p>Book a free strategy call', f'<p><a class="tlink" href="{e(BOOK)}" target="_blank" rel="noopener">Book a free strategy call</a>',1)

# Founder blueprint: wireframe (design) underneath, filled build revealed by scroll
def bp(built):
    st = '' if built else f' fill="none" stroke="{L}" stroke-width="2" stroke-dasharray="7 7"'
    f = (lambda c, o=1: f' fill="{c}" fill-opacity="{o}"') if built else (lambda c, o=1: st)
    grid = '' if built else ''.join(f'<path d="M{x} 0V500" stroke="{L}" stroke-opacity=".09"/>' for x in range(0, 401, 25)) + ''.join(f'<path d="M0 {y}H400" stroke="{L}" stroke-opacity=".09"/>' for y in range(0, 501, 25))
    return (f'<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            + ('' if not built else f'<rect width="400" height="500" fill="{V}"/>') + grid
            + f'<rect x="40" y="72" width="320" height="30" rx="8"{f(S, .1)}/>'
            + f'<rect x="40" y="118" width="320" height="140" rx="14"{f(L, .95)}/>'
            + f'<rect x="62" y="146" width="170" height="16" rx="8"{f(V, 1)}/><rect x="62" y="172" width="120" height="16" rx="8"{f(V, .6)}/>'
            + f'<rect x="62" y="212" width="86" height="26" rx="8"{f(G, 1)}/>'
            + ''.join(f'<rect x="{40+i*110}" y="274" width="100" height="82" rx="12"{f(S, .14)}/>' for i in range(3))
            + f'<rect x="40" y="372" width="200" height="12" rx="6"{f(L, .4)}/>'
            + '</svg>')
blueprint = bp(False) + f'<div class="blueprint__built"><div>{bp(True)}</div></div><span class="blueprint__seam"></span>'

src = (SRC / 'index.src.html').read_text()
css = '\n'.join((SRC / f).read_text() for f in ['styles.css', 'work.css', 'motion.css', 'growth.css', 'seo.css'])
def _rules(block):
    out, i, depth, start = [], 0, 0, 0
    for j, ch in enumerate(block):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                out.append(block[start:j+1].strip()); start = j + 1
    return [r for r in out if r]
def _prefix(rule, mode):
    sel, body = rule.split('{', 1)
    def one(x):
        x = x.strip()
        if mode == 'rm':
            return 'html.js.rm' + x[3:] if x.startswith('.js') else ('html.rm' + x[4:] if x.startswith('html') else 'html.rm ' + x)
        return 'html.js:not(.rm)' + x[3:] if x.startswith('.js') else ('html:not(.rm)' + x[4:] if x.startswith('html') else 'html:not(.rm) ' + x)
    return ','.join(one(x) for x in sel.split(',')) + '{' + body
def motion_css(c):
    out, pos = [], 0
    for m in re.finditer(r'@media \(prefers-reduced-motion:(reduce|no-preference)\)\{', c):
        if m.start() < pos: continue
        depth, j = 1, m.end()
        while depth:
            depth += {'{': 1, '}': -1}.get(c[j], 0); j += 1
        inner = c[m.end():j-1]; out.append(c[pos:m.start()])
        rules = _rules(inner)
        # Motion is decided by the visitor's Motion toggle (html.rm), not silently by the OS setting:
        # "reduce" rules apply only when motion is off, "no-preference" rules whenever it is on.
        if m.group(1) == 'reduce':
            out.append('\n'.join(_prefix(r, 'rm') for r in rules))
        else:
            out.append('\n'.join(_prefix(r, 'on') for r in rules))
        pos = j
    out.append(c[pos:]); return ''.join(out)
css = motion_css(css)
js = (SRC / 'script.js').read_text()
TQ = json.load(open(SRC/'testimonials.json')) if (SRC/'testimonials.json').exists() else []
def quotes_html():
    dash='<svg class="dash" aria-hidden="true" focusable="false"><rect x=".75" y=".75" rx="20"/></svg><span class="quote__mark" aria-hidden="true">“</span>'
    ok=[t for t in TQ if t.get('approved')]
    if not ok:
        return '\n'.join(f'      <li class="quote" style="--q:{i}" data-reveal>{dash}<blockquote><p>Real client stories land here soon: our work speaks first.</p></blockquote><p class="quote__by">Your business could be next.</p></li>' for i in range(3))
    out=[]
    for i,t in enumerate(ok):
        ini=''.join(w[0] for w in t['name'].split()[:2]).upper()
        logo=(f'<img class="quote__logo" src="assets/logos/{t["logo"]}.webp" alt="" loading="lazy" decoding="async">' if t.get('logo') else '')
        out.append(f'      <li class="quote quote--real" style="--q:{i%3}" data-reveal>{dash}<blockquote><p>{e(t["quote"])}</p></blockquote><p class="quote__by"><span class="quote__av" aria-hidden="true">{ini}</span><span><strong>{e(t["name"])}</strong><br>{e(t["role"])}</span>{logo}</p></li>')
    return '\n'.join(out)
ICONS_HEAD = ('<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">\n'
              '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">')
import seo_pages
rep = {'{{PRICE_PILLARS}}': seo_pages.pricing_pillars_html(), '{{PRICE_TERMS}}': seo_pages.pricing_terms_strip_html(), '{{ICONS_HEAD}}': ICONS_HEAD, '{{JSONLD}}': seo_pages.home_jsonld('https://uscale.in/', FAQ), '{{QUOTES}}': quotes_html(),'{{LOGO_WALL}}': logo_wall, '{{WORK_TOTAL}}': f'{len(WORK):02d}', '{{PROJECT_INDEX}}': project_index, '{{LOADER_LOGO}}': loader_logo, '{{HEADER_LOGO}}': logo(), '{{FOOTER_LOGO}}': logo('logo--rev'), '{{FAVICON}}': favicon,
       '{{CHART}}': growth, '{{CTA_BARS}}': cta_bars, '{{WORK_CARDS}}': work_cards, '{{FAQ}}': faq, '{{BLUEPRINT}}': blueprint}
rep.update({'{{' + k + '}}': v for k, v in ICONS.items()})
for k, v in rep.items():
    src = src.replace(k, v)
src = src.replace('https://uscale.in/', SITE_URL)
left = re.findall(r'\{\{[A-Z_]+\}\}', src.replace('{{STYLES}}', '').replace('{{SCRIPT}}', ''))
assert not left, left

# Deployable folder
site = REPO
import hashlib as _h
_v = _h.sha1((css + js).encode()).hexdigest()[:8]
(site / 'index.html').write_text(src.replace('{{STYLES}}', f'<link rel="stylesheet" href="styles.css?v={_v}">')
                                    .replace('{{SCRIPT}}', f'<script defer src="script.js?v={_v}"></script>').replace('<!--PREVIEW-REPLAY-->\n', ''))
(site / 'styles.css').write_text(css)
(site / 'script.js').write_text(js)
(site / 'favicon.svg').write_text(fav)
if not (site / 'icon-512.png').exists() or (site / 'favicon.svg').stat().st_mtime > (site / 'icon-512.png').stat().st_mtime:
    import asyncio
    from playwright.async_api import async_playwright
    async def _icons():
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page()
            for name, sz in [('favicon-32.png', 32), ('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)]:
                await pg.set_viewport_size({'width': sz, 'height': sz})
                await pg.set_content(f'<html><body style="margin:0;background:#251E45"><img src="{favicon}" style="width:{sz}px;height:{sz}px;display:block"></body></html>')
                await pg.wait_for_timeout(150); await pg.screenshot(path=str(site / name))
            await b.close()
    asyncio.run(_icons())
_slugs = seo_pages.build({'SITE_URL': SITE_URL, 'site': site, '_v': _v, 'WORK': WORK, 'FAQ': FAQ, 'ICONS': ICONS, 'ICONS_HEAD': ICONS_HEAD, 'SZ': SZ})
print('service pages:', ', '.join(_slugs))

# Preview: one file; the artifact skeleton supplies doctype/head/body
pv = src.replace('{{STYLES}}', '<style>\n' + css + '\n.pv-replay{position:fixed;left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:1001;display:inline-flex;align-items:center;gap:8px;font:600 14px/1 var(--sans);background:var(--violet);color:var(--white);border:1px solid var(--line-dark);border-radius:999px;padding:13px 18px;cursor:pointer;box-shadow:0 12px 24px -14px rgba(37,30,69,.6)}\n</style>')
pv = pv.replace('{{SCRIPT}}', '<script>\n' + js + '\n</script>')
pv = pv.replace('<!--PREVIEW-REPLAY-->', '<button class="pv-replay" type="button" onclick="window.usReplay&&window.usReplay()">↻ Replay intro</button>')
for t in ['<!doctype html>\n', '<html lang="en-IN">\n', '<head>\n', '</head>\n', '<body>\n', '</body>\n', '</html>\n']:
    pv = pv.replace(t, '', 1)
pv = re.sub(r'<title>.*?</title>', '<title>U Scale Website</title>', pv, count=1)
(REPO / 'source' / 'preview.html').write_text(pv.replace('"assets/', '"../assets/'))
print('site/index.html', len((site / 'index.html').read_text()), '| styles', len(css), '| script', len(js), '| preview', len(pv))
