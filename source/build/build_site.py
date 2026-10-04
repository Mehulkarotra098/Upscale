"""Assembles the U Scale site.
Outputs: site/index.html + site/styles.css + site/script.js (deploy as-is), and preview.html (single file, replay button) for review."""
import json, re, urllib.parse, pathlib, html, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import showcase

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

cta_bars = ('<svg viewBox="0 0 400 320" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">'
            + ''.join(f'<path style="fill:var(--lavender);opacity:{o}" d="{slant_bar(x, 78, t, 320, 18, 10)}"/>'
                      for x, t, o in [(14, 210, .08), (112, 150, .12), (210, 86, .17), (308, 10, .24)]) + '</svg>')

# ---------- Work thumbnails (palette only, 400x250) ----------
def svgw(bg, body):
    return f'<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="400" height="250" fill="{bg}"/>{body}</svg>'

th = {}
th['tis'] = svgw(LT, f'<rect x="18" y="18" width="364" height="214" rx="16" fill="none" stroke="{V}" stroke-opacity=".3" stroke-width="2" stroke-dasharray="8 8"/>'
    f'<circle cx="318" cy="72" r="26" fill="{L}"/>'
    + ''.join(f'<rect x="{70+i*62}" y="{200-h}" width="54" height="{h}" rx="8" fill="{V}" fill-opacity="{.55+i*.15:.2f}"/>' for i, h in enumerate([36, 66, 98, 132]))
    + f'<path d="M281 68v-26l22 9-22 9" fill="{L}" stroke="{V}" stroke-width="2" stroke-linejoin="round"/>')
th['antrah'] = svgw(V, ''.join(f'<circle class="th-breathe" cx="200" cy="125" r="{22*k}" fill="none" stroke="{L}" stroke-opacity="{1-.16*(k-1):.2f}" stroke-width="2"/>' for k in range(1, 6))
    + f'<circle cx="200" cy="125" r="7" fill="{L}"/>')
th['roar'] = svgw(LT, f'<rect x="108" y="44" width="184" height="96" rx="16" fill="{V}"/>'
    f'<rect x="132" y="66" width="46" height="52" rx="8" fill="{L}"/><rect x="222" y="66" width="46" height="52" rx="8" fill="{L}"/>'
    f'<circle cx="200" cy="82" r="5" fill="{L}"/><circle cx="200" cy="102" r="5" fill="{L}"/>'
    + ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{V}" fill-opacity="{o}"/>' for y, o, off in [(186, .22, 0), (212, .34, 11), (238, .5, 0)] for x in range(18 + off, 400, 24)))
th['mcm'] = svgw(V, f'<rect x="28" y="28" width="128" height="34" rx="17" fill="{L}" fill-opacity=".16"/><circle cx="48" cy="45" r="7" fill="{L}"/><rect x="64" y="40" width="74" height="10" rx="5" fill="{L}" fill-opacity=".5"/>'
    + ''.join(f'<rect class="th-wave" style="--w:{i}" x="{62+i*12}" y="{150-h/2}" width="6" height="{h}" rx="3" fill="{L}"/>'
              for i, h in enumerate([18, 34, 52, 70, 46, 88, 104, 72, 54, 92, 118, 84, 60, 98, 76, 50, 66, 40, 28, 44, 24, 14, 10, 8])))
th['callmama'] = svgw(LT, f'<rect x="146" y="22" width="108" height="206" rx="22" fill="{S}" stroke="{V}" stroke-width="4"/>'
    f'<rect x="184" y="34" width="32" height="6" rx="3" fill="{V}" fill-opacity=".4"/><rect x="166" y="56" width="68" height="14" rx="7" fill="{L}"/>'
    + ''.join(f'<circle cx="{172+c*28}" cy="{98+r*30}" r="9" fill="{V}" fill-opacity="{.85 if (r,c)!=(3,1) else 1}"/>' for r in range(4) for c in range(3))
    + f'<circle cx="80" cy="70" r="20" fill="none" stroke="{V}" stroke-opacity=".25" stroke-width="2"/><circle cx="320" cy="180" r="30" fill="none" stroke="{V}" stroke-opacity=".2" stroke-width="2"/>')
rings = ''.join(f'<ellipse cx="{200+k*1.5:.1f}" cy="{125-k:.1f}" rx="{14+k*17}" ry="{12+k*15}" fill="none" stroke="{L}" stroke-opacity="{.95-k*.12:.2f}" stroke-width="{2.4-k*.2:.1f}"/>' for k in range(6))
th['growcred'] = svgw(V, f'<g class="th-spin">{rings}</g><path d="M200 136c-14-10-16-30 0-44 16 14 14 34 0 44Z" fill="{L}"/><path d="M200 136v18" stroke="{L}" stroke-width="3" stroke-linecap="round"/>')
th['sashe'] = svgw(LT, ''.join(f'<path d="M{40+i*26} -10 C {120+i*30} 60, {40+i*22} 150, {170+i*34} 260" fill="none" stroke="{V}" stroke-opacity="{.25+i*.14:.2f}" stroke-width="{3+i*2}" stroke-linecap="round"/>' for i in range(6))
    + f'<path d="M262 46a22 22 0 1 1 30 20v12" fill="none" stroke="{V}" stroke-width="4" stroke-linecap="round"/><path d="M226 112l66-34 66 34" fill="none" stroke="{V}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
stripes = ''.join(f'<path d="M{108+i*36} 58 l22 0 l-14 30 l-22 0 Z" fill="{L if i%2==0 else V}"/>' for i in range(6))
th['vidhi'] = svgw(V, f'<g transform="rotate(-8 110 88)"><rect x="98" y="58" width="208" height="30" rx="4" fill="{V}" stroke="{L}" stroke-width="3"/>{stripes}</g>'
    f'<rect x="98" y="96" width="208" height="120" rx="10" fill="none" stroke="{L}" stroke-width="3"/>'
    f'<path d="M188 132v48l40-24-40-24Z" fill="{L}"/>'
    + ''.join(f'<rect x="{116+i*22}" y="198" width="12" height="4" rx="2" fill="{L}" fill-opacity=".6"/>' for i in range(8)))
tiles = ''.join(f'<rect x="{232+c*72}" y="{48+r*80}" width="62" height="70" rx="10" fill="{fill}"/>'
                for (r, c), fill in zip([(0, 0), (0, 1), (1, 0), (1, 1)], [V, L, L, V]))
th['brandgen'] = svgw(LT, f'<circle cx="86" cy="86" r="30" fill="{V}"/><circle cx="118" cy="128" r="30" fill="{L}" stroke="{S}" stroke-width="4"/><circle cx="80" cy="164" r="22" fill="{S}" stroke="{V}" stroke-width="3"/>'
    f'<path d="M156 125h52" stroke="{V}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/><path d="m200 116 10 9-10 9" fill="none" stroke="{V}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>{tiles}'
    f'<rect x="242" y="98" width="30" height="8" rx="4" fill="{L}"/><rect x="314" y="178" width="30" height="8" rx="4" fill="{L}"/>')

ARW = '<span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span>'
WORK = [
 ('tis', 'TIS Admissions 2026–27', 'Education · Kandivali West, Mumbai', 'Concept · Web Development', 'A concept admissions experience: programs, campus life and a friction-free enquiry flow for an ICSE school.', 'https://tis-school-admissions-2026.vercel.app'),
 ('antrah', 'Antrah Wellness', 'Wellness · Mumbai', 'Web Development', 'Launch site for a two-day wellness gathering: five paths to wellbeing, one calm digital home.', 'https://antrah-wellness.vercel.app'),
 ('roar', 'Roar Arena', 'Sports · India', 'Web Development', "A live match center and fan community platform for India's sports watch-party culture.", 'https://roararenaindia.vercel.app'),
 ('mcm', 'My Country Mobile', 'Telecom · In-house role', 'UI/UX + Web', 'Interface design and web development for an AI-first cloud phone and contact center platform, built during an in-house role.', 'https://mycountrymobile.com'),
 ('callmama', 'Callmama', 'Telecom · In-house role', 'UI/UX + Web', 'Product design and web experience for an international calling brand, built during an in-house role.', 'https://www.callmama.com'),
 ('growcred', 'GrowCred', 'Climate Tech · Founder project', 'Product Build', 'Founder-built climate-tech platform: plant trees, upload proof, earn TreeCoin.', 'https://greencred.vercel.app'),
 ('sashe', 'Sashe by Prachi', 'Fashion · Mumbai', 'Web Development', "Digital flagship for a bespoke fashion label: editorial hero, signature looks, studio forms, founder story. Built mobile-first to the founder's pixel-level bar.", 'https://sashebyprachi.vercel.app'),
 ('vidhi', 'Vidhi Parmar', 'Creative · Mumbai', 'Web Development', 'Personal hire-me portfolio for a Mumbai AI visual artist: selected AI ad films, four-step process, services, FAQ.', 'https://vidhi-parmar-ai.vercel.app'),
 ('brandgen', 'BrandGen', 'AI SaaS · Marketing visuals', 'Social Media + Site', 'Website and social media for an AI tool that turns one brand reference into on-brand marketing visuals.', 'https://www.getbrandgen.com'),
]
e = lambda t: html.escape(t, quote=False)
work_cards = '\n'.join(
    f'        <!-- TODO: swap the {name} mockup with a real 1440x900 screenshot when Mehul supplies it -->\n'
    f'        <li class="wcard" data-reveal><a href="{url}" target="_blank" rel="noopener">'
    f'<div class="wcard__thumb">{showcase.MOCKS[k]}</div>'
    f'<div class="wcard__body"><p class="wcard__meta">{e(meta)}</p><h3>{e(name)}</h3><span class="tag">{e(tag)}</span><p>{e(desc)}</p>'
    f'<span class="wcard__cta">View live site {ARW}<span class="sr-only"> (opens in a new tab)</span></span></div></a></li>'
    for k, name, meta, tag, desc, url in WORK)

FAQ = [
 ('How much does digital marketing cost in Mumbai?', "Our retainers start at ₹35,000/month and websites are fixed projects. Every engagement starts with a free audit, so you see exactly what you'd pay for before spending a rupee."),
 ('How long does SEO take to show results?', 'Honest answer: 3–6 months for meaningful movement. Anyone promising page one in 30 days is selling you something. We show you the trajectory every month.'),
 ('How long does it take to build a website?', 'A business website typically takes 4–8 weeks from kickoff to launch, depending on pages and how ready your content is.'),
 ('Do you lock clients into long contracts?', "No. Retainers run month-to-month after an initial 3-month sprint. We'd rather earn your renewal than enforce it."),
 ('What is AI search visibility (GEO)?', 'When someone asks ChatGPT or Perplexity for a recommendation in your category, does your business get mentioned? We optimise your presence so AI answers cite you.'),
 ('How do we start?', 'Book a free strategy call or ping us on WhatsApp. We audit your digital presence free, then send a plan with clear pricing.'),
]
faq = '\n'.join(
    (f'        <div class="qa{" is-open" if i == 0 else ""}"><h3><button class="qa__btn" type="button" id="q{i}" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="a{i}">'
     f'<span>{e(q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3>'
     f'<div class="qa__panel" id="a{i}" role="region" aria-labelledby="q{i}"><div><p>{e(a)}</p></div></div></div>'
     + ('\n        <!-- TODO (optional): add a booking calendar link to "Book a free strategy call" -->' if i == 5 else ''))
    for i, (q, a) in enumerate(FAQ))

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
css = (SRC / 'styles.css').read_text() + '\n' + (SRC / 'showcase.css').read_text()
js = (SRC / 'script.js').read_text()
SHOWCASE_FONTS = ('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Newsreader:ital,wght@0,400;1,400'
  '&family=Archivo:wght@800&family=Outfit:wght@500;600&family=Plus+Jakarta+Sans:wght@800&family=Inter:wght@800;900&display=swap&text='
  + urllib.parse.quote(showcase.font_text())).replace('&', '&amp;')
rep = {'{{LOGO_WALL}}': showcase.logo_wall(), '{{SHOWCASE_FONTS}}': SHOWCASE_FONTS, '{{LOADER_LOGO}}': loader_logo, '{{HEADER_LOGO}}': logo(), '{{FOOTER_LOGO}}': logo('logo--rev'), '{{FAVICON}}': favicon,
       '{{CHART}}': chart, '{{CTA_BARS}}': cta_bars, '{{WORK_CARDS}}': work_cards, '{{FAQ}}': faq, '{{BLUEPRINT}}': blueprint}
rep.update({'{{' + k + '}}': v for k, v in ICONS.items()})
for k, v in rep.items():
    src = src.replace(k, v)
left = re.findall(r'\{\{[A-Z_]+\}\}', src.replace('{{STYLES}}', '').replace('{{SCRIPT}}', ''))
assert not left, left

# Deployable folder
site = REPO
(site / 'index.html').write_text(src.replace('{{STYLES}}', '<link rel="stylesheet" href="styles.css">')
                                    .replace('{{SCRIPT}}', '<script src="script.js"></script>').replace('<!--PREVIEW-REPLAY-->\n', ''))
(site / 'styles.css').write_text(css)
(site / 'script.js').write_text(js)

# Preview: one file; the artifact skeleton supplies doctype/head/body
pv = src.replace('{{STYLES}}', '<style>\n' + css + '\n.pv-replay{position:fixed;left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:1001;display:inline-flex;align-items:center;gap:8px;font:600 14px/1 var(--sans);background:var(--violet);color:var(--white);border:1px solid var(--line-dark);border-radius:999px;padding:13px 18px;cursor:pointer;box-shadow:0 12px 24px -14px rgba(37,30,69,.6)}\n</style>')
pv = pv.replace('{{SCRIPT}}', '<script>\n' + js + '\n</script>')
pv = pv.replace('<!--PREVIEW-REPLAY-->', '<button class="pv-replay" type="button" onclick="window.usReplay&&window.usReplay()">↻ Replay intro</button>')
for t in ['<!doctype html>\n', '<html lang="en-IN">\n', '<head>\n', '</head>\n', '<body>\n', '</body>\n', '</html>\n']:
    pv = pv.replace(t, '', 1)
pv = re.sub(r'<title>.*?</title>', '<title>U Scale Website</title>', pv, count=1)
(REPO / 'source' / 'preview.html').write_text(pv)
print('site/index.html', len((site / 'index.html').read_text()), '| styles', len(css), '| script', len(js), '| preview', len(pv))
