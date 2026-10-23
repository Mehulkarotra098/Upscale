"""Generated parts of the home page (source/src/index.src.html placeholders).

Design brief: the home page is read mostly on phones by owner-operators of small Mumbai businesses. In the first
screen they should see who (a real person, Mehul, in Mumbai), what (websites, Google, social and ads), what
it costs (published prices) and one easy first step (a free audit on WhatsApp). Further down: three outcomes instead
of ten services, proof from real live sites, how working together goes (fixed price, 20/20/60, you own everything),
the person, free tools, answers, and one place to start.

Every price comes from pricing_data.py through aeo._price; every component is shared with the focus pages
(geo_pages.py) so the site reads as one system.
"""
import urllib.parse

import aeo
import geo_pages as GP

e, ea = GP.e, GP.ea
price = GP.price
icon = GP.icon

WA = 'https://wa.me/917977360142?text='
WA_AUDIT = WA + urllib.parse.quote("Hi Mehul, I'd like a free audit for my business. My website or Instagram: ")
MEHUL = GP.IMG['mehul']


def _pic(img, sizes, eager=False, small=None):
    s = small or img['small']
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    f = img['file']
    return (f'<picture><source type="image/avif" srcset="{f}-{s}.avif {s}w, {f}.avif {img["w"]}w" sizes="{sizes}">'
            f'<img src="{f}.webp" srcset="{f}-{s}.webp {s}w, {f}.webp {img["w"]}w" sizes="{sizes}" width="{img["w"]}" height="{img["h"]}" '
            f'alt="{ea(img["alt"])}" {load}></picture>')


def brief():
    answer = ('U Scale is the web design and digital marketing practice of Mehul Karotra, based in Mumbai. He designs and '
              f'hand-codes websites at fixed prices, from a {price("Landing page")} landing page to an online store from '
              f'{price("E-commerce, under 50 products")}, and runs local SEO, Google Business Profile, social media, ads and AI search '
              'visibility on monthly plans for businesses across Mumbai, Thane and Navi Mumbai, and for clients across India. Every price is published, and every project '
              'starts with a free audit.')
    facts = [('Who', 'Mehul Karotra, personally: he designs, builds and markets every project'),
             ('Based in', 'Mumbai; meets clients across Mumbai, Thane and Navi Mumbai, and works remotely with businesses across India'),
             ('Websites', f'Landing page {price("Landing page")} · Business site {price("Business site, 3–4 pages")} · '
                          f'Online store from {price("E-commerce, under 50 products")}, all fixed'),
             ('Monthly growth', f'Local SEO {price("Local SEO / Google Business Profile")} · Ads management {price("Ads management")} · '
                                f'AI search visibility {price("AI search visibility (GEO)")}'),
             ('Timeline', 'Most websites go live in 4–8 weeks; a landing page in under two weeks'),
             ('Payment', '20% to start, 20% on design sign-off, 60% on launch; monthly work is month-to-month after a 3-month sprint'),
             ('First step', 'A free audit of your website, Google listing and Instagram')]
    return aeo.brief_html(answer, facts, 'Key facts: U Scale by Mehul Karotra', 'brief-title')


# ---------------------------------------------------------------- live mini scenes (HTML/CSS only)
# Three moments from a Mumbai shop owner's week, drawn as real screens rather than wireframes: their own site taking an
# order on WhatsApp, their name rising to the top of "near me" on the map and in an AI answer, and a post turning into
# messages. Each plays only while on screen ([data-live] → .is-live in script.js) and rests on its final frame when motion
# is off. Sizes are in --u (1/340 of the stage width), so every scene scales as one drawing from 300px to 430px wide.
_SV = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"'
LOCK = f'<svg {_SV} fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
HEART = f'<svg {_SV} fill="currentColor"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.8 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>'
TALK = f'<svg {_SV} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/></svg>'
SEND = f'<svg {_SV} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>'
SPARK = f'<svg {_SV} fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>'
CUP = ('<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none"><path class="vb-steam" d="M24 20c-3-4 3-6 0-10M33 20c-3-4 3-6 0-10" '
       'stroke="#C9BCE8" stroke-width="3" stroke-linecap="round"/><path d="M13 25h31v12a14 14 0 0 1-14 14h-3a14 14 0 0 1-14-14z" fill="#FFFFFF"/>'
       '<path d="M44 29h4a6 6 0 0 1 0 12h-5" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/><path d="M19 32h19" stroke="#63B849" stroke-width="3" '
       'stroke-linecap="round"/><ellipse cx="29" cy="56" rx="20" ry="3" fill="rgba(10,6,25,.35)"/></svg>')
MAP = ('<svg class="vf-map__svg" viewBox="0 0 300 222" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
       '<rect width="300" height="222" fill="#ECE7F6"/><path d="M0 0h34c-8 38 12 66-2 104-12 34 8 78-4 118H0z" fill="#D8CEEE"/>'
       '<rect x="196" y="150" width="70" height="44" rx="14" fill="#63B849" fill-opacity=".2"/>'
       '<g fill="none" stroke="#FFFFFF" stroke-linecap="round"><path d="M34 58c80 12 160-16 266 0M30 168c90-12 170 22 270 6M128 0c12 80-10 150 18 222M236 0c-12 70 22 140-4 222" stroke-width="10"/>'
       '<path d="M60 112h240M182 0v222M34 22l266 40" stroke-width="4" stroke-opacity=".8"/></g></svg>')
STARS = '<i class="vf-stars"><i></i></i>'

VIZ = {
 'build': f"""<div class="viz viz--build" data-live aria-hidden="true"><div class="vz">
  <div class="vb-win">
    <div class="vb-win__bar"><i></i><i></i><i></i><span class="vb-url">{LOCK}yourcafe.in</span></div>
    <div class="vb-site">
      <div class="vb-nav"><b>Your Café</b><span>Menu</span><span>Visit us</span></div>
      <div class="vb-hero">
        <div><p class="vb-h">Fresh chai,<br>all day.</p><p class="vb-s">Order on WhatsApp, pick up in 15 minutes.</p>
          <span class="vb-cta">{icon("chat")}Order on WhatsApp</span></div>
        <div class="vb-art">{CUP}</div>
      </div>
    </div>
  </div>
  <div class="vb-phone"><div class="vb-phone__scr">
    <p class="vb-ph-h">Fresh chai, all day.</p>
    <ul class="vb-menu"><li><span>Masala chai</span><b>₹40</b></li><li><span>Bun maska</span><b>₹60</b></li><li><span>Cold coffee</span><b>₹120</b></li></ul>
    <span class="vb-ph-cta">{icon("chat")}Order now<i class="vb-tap"></i></span>
  </div></div>
  <div class="vb-toast"><span class="vb-toast__ic">{icon("chat")}</span><span><b>New order</b><em>“2 masala chai, pickup at 6”</em></span><time>now</time></div>
</div></div>""",
 'found': f"""<div class="viz viz--found" data-live aria-hidden="true"><div class="vz">
  <div class="vf-map">{MAP}<i class="vf-pin vf-pin--a"></i><i class="vf-pin vf-pin--b"></i><i class="vf-pin vf-pin--you"></i></div>
  <div class="vf-card">
    <div class="vf-q">{icon("search")}<span class="vf-q__t">cafe near me</span><i class="vf-caret"></i></div>
    <ol class="vf-list">
      <li class="vf-r vf-r--you"><span class="vf-r__n">Your Café</span><span class="vf-r__m"><b>4.9</b>{STARS}<span>(212) · Open now</span></span><em>#1</em></li>
      <li class="vf-r vf-r--a"><span class="vf-r__n">Café next door</span><span class="vf-r__m"><b>4.2</b><i class="vf-star">★</i><span>(88)</span></span></li>
      <li class="vf-r vf-r--b"><span class="vf-r__n">Café down the road</span><span class="vf-r__m"><b>3.9</b><i class="vf-star">★</i><span>(41)</span></span></li>
    </ol>
  </div>
  <div class="vf-ai"><span class="vf-ai__k">{SPARK}AI answer</span><p>Top pick nearby: <b>Your Café</b>, rated 4.9 and open till 11 pm.</p></div>
</div></div>""",
 'leads': f"""<div class="viz viz--leads" data-live aria-hidden="true"><div class="vz">
  <div class="vl-post">
    <div class="vl-post__hd"><i class="vl-av">YC</i><span><b>yourcafe</b><small>Sponsored</small></span></div>
    <div class="vl-post__img"><p>Chai + bun<b>₹99</b></p><span class="vl-stk">Mon–Fri</span><i class="vl-big">{HEART}</i></div>
    <div class="vl-post__ft"><i class="vl-like">{HEART}</i>{TALK}{SEND}</div>
  </div>
  <ul class="vl-msgs">
    <li><span class="vl-ic">{icon("camera")}</span><span><b>Instagram message</b><em>“Do you deliver to Powai?”</em></span></li>
    <li><span class="vl-ic">{icon("phone")}</span><span><b>Call from your Google ad</b><em>Asked about weekend tables</em></span></li>
    <li><span class="vl-ic vl-ic--wa">{icon("chat")}</span><span><b>WhatsApp</b><em>“Booked a table for 6!”</em></span></li>
  </ul>
</div></div>""",
}


def services3():
    cards = [
        dict(cls=' svc3__card--web on-dark', viz='build', ic='globe', k='Get a website', h='A website that brings you enquiries',
             p='Designed in Figma and hand-coded, mobile first, with WhatsApp and call buttons where people decide.',
             chips=['Landing pages', 'Business sites', 'Online stores', 'Restaurant ordering'],
             price=f'{price("Landing page")} to {price("E-commerce, under 50 products")}, fixed',
             links=[('/services/website-design-mumbai', 'Website design in Mumbai')]),
        dict(cls='', viz='found', ic='pin', k='Get found', h='Show up on Google, Maps and AI answers',
             p='Your Google Business Profile, local and technical SEO, and getting named when people ask ChatGPT or Gemini.',
             chips=['Google Business Profile', 'Local SEO', 'Technical SEO', 'AI search (GEO)'],
             price=f'Local SEO {price("Local SEO / Google Business Profile")} · AI search {price("AI search visibility (GEO)")}',
             links=[('/services/seo-mumbai', 'SEO services in Mumbai'), ('/services/ai-search-visibility', 'AI search visibility')]),
        dict(cls='', viz='leads', ic='camera', k='Get customers', h='More customers from social media and ads',
             p='A monthly calendar of posts and reels, and Google and Meta ads that send people to WhatsApp, with a plain-English report.',
             chips=['Instagram & Facebook', 'Reels', 'Google & Meta ads', 'WhatsApp follow-ups'],
             price=f'Ads management {price("Ads management")} · posts from ₹800',
             links=[('/services/social-media-management-mumbai', 'Social media management'), ('/services/google-meta-ads-mumbai', 'Google & Meta ads')]),
    ]
    li = ''
    for c in cards:
        chips = ''.join(f'<li>{e(x)}</li>' for x in c['chips'])
        links = ''.join(f'<a class="svc3__link" href="{ea(h)}">{e(t)} {icon("arrow")}</a>' for h, t in c['links'])
        li += (f'<li class="svc3__card{c["cls"]}" data-reveal>{VIZ[c["viz"]]}<p class="svc3__k">{icon(c["ic"])}{e(c["k"])}</p>'
               f'<h3>{e(c["h"])}</h3><p class="svc3__p">{e(c["p"])}</p><ul class="svc3__chips">{chips}</ul>'
               f'<p class="svc3__price">{e(c["price"])}</p><div class="svc3__links">{links}</div></li>')
    also = ['Branding & identity', 'Content & reels', 'WhatsApp & email automation', 'Reviews & reputation', 'Analytics & reporting']
    also_li = ''.join(f'<li>{icon("check")}{e(x)}</li>' for x in also)
    return (f'      <ul class="svc3" data-reveal-group>{li}</ul>\n'
            f'      <div class="svc3__also" data-reveal><p>Also on request</p><ul>{also_li}</ul><a class="tlink" href="/services">All services</a></div>')


def for_cards():
    # Mumbai-wide: business types and guides only. The neighbourhood pages stay linked from /services/website-design-mumbai.
    kinds = [('business', 'By business'), ('guide', 'Guide')]
    li = ''.join(f'<li data-reveal><a class="fp-rel" href="/services/{GP.BASE}/{p["slug"]}"><span class="fp-rel__k">{label}</span><b>{e(p["h1"])}</b>'
                 f'<span class="fp-rel__d">{e(p["card"])}</span>{icon("arrow")}</a></li>'
                 for kind, label in kinds for p in GP.PAGES if p['kind'] == kind)
    return f'      <div class="fp-related home-for__list"><ul data-reveal-group>{li}</ul></div>'


def how():
    steps = [('Free audit', 'I check your website, Google listing and Instagram, and show you where enquiries slip away.', 'Free'),
             ('Written plan', 'What I will do, by when, and the exact price, in writing before you pay anything.', 'Fixed price'),
             ('Design & build', 'You see real screens in Figma and approve them before I build. You see progress every week.', '20% to start · 20% on design sign-off'),
             ('Launch & grow', 'Launch, then monthly SEO, social or ads only if you want them, with a plain-English report.', '60% on launch')]
    promise = [('key', 'Your domain, code and logins, in your name'), ('file', 'Every price published and fixed in writing'),
               ('shield', '15–30 day bug-fix window after launch')]
    li = ''.join(f'<li class="fp-step" data-reveal><span class="fp-step__n" aria-hidden="true">{i + 1:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p>'
                 f'<span class="fp-step__tag">{e(tag)}</span></li>' for i, (t, d, tag) in enumerate(steps))
    pr = ''.join(f'<li>{icon(ic)}<span>{e(x)}</span></li>' for ic, x in promise)
    return f'''  <!-- HOW IT WORKS: risk removed up front -->
  <section class="section home-how" id="how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>How it works</p>
        <h2 class="h2" id="how-title" data-split>Fixed price. No surprises.</h2>
        <p class="lead" data-reveal>From a free audit to launch in four steps. Monthly work runs as a 3-month sprint, then month-to-month with 30 days notice.</p>
      </header>
      <ol class="fp-steps" data-reveal-group data-live>{li}</ol>
      <ul class="fp-promise" data-reveal>{pr}</ul>
    </div>
  </section>'''


def founder_photo():
    return f'''      <figure class="founder__photo" data-reveal>
        {_pic(MEHUL, "(max-width: 899px) 92vw, 460px")}
        <figcaption class="hv__plate"><b>Mehul Karotra</b><span>Founder of U&nbsp;Scale · Mumbai</span></figcaption>
      </figure>'''


def _qr():
    """A decorative QR-style pattern (not a working code): finder squares plus a fixed scatter of modules."""
    import random
    rnd = random.Random(7); cells = []
    for y in range(21):
        for x in range(21):
            finder = (x < 7 and y < 7) or (x > 13 and y < 7) or (x < 7 and y > 13)
            if not finder and rnd.random() < .47:
                cells.append(f'<rect x="{x}" y="{y}" width="1" height="1" style="--d:{(x + y) * 18}ms"/>')
    fz = ''.join(f'<rect x="{x}" y="{y}" width="7" height="7" rx="1.6" class="q-f"/><rect x="{x + 2}" y="{y + 2}" width="3" height="3" rx=".6"/>' for x, y in ((0, 0), (14, 0), (0, 14)))
    return f'<svg class="vq" viewBox="-1 -1 23 23" aria-hidden="true">{fz}<g class="q-m">{"".join(cells)}</g></svg>'


def tools():
    return f'''      <ul class="fp-tools home-tools__list" data-reveal-group>
  <li data-reveal><a class="fp-tool fp-tool--dark on-dark" href="/tools/google-business-profile-checker"><span class="vs" data-live aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="vs__track" cx="60" cy="60" r="50"/><circle class="vs__fill" cx="60" cy="60" r="50" pathLength="100"/></svg><b>86<small>/100</small></b></span><span class="fp-tool__k">Free · about 2 minutes</span><span class="fp-tool__t">Google Business Profile checker</span><span class="fp-tool__d">A score out of 100 and a fix list for your listing.</span><span class="fp-tool__go">Check my listing {icon("arrow")}</span></a></li>
  <li data-reveal><a class="fp-tool" href="/tools/google-review-qr-code"><span class="vqw" data-live aria-hidden="true">{_qr()}<span class="vqw__l">{icon("star")}Scan to review</span></span><span class="fp-tool__k">Free · printable</span><span class="fp-tool__t">Google review QR code maker</span><span class="fp-tool__d">A counter standee that brings in reviews.</span><span class="fp-tool__go">Make my QR code {icon("arrow")}</span></a></li>
</ul>'''


def cx_me():
    return f'''          <div class="cx__me"><span class="cx__badge" aria-hidden="true">{icon("chat")}<i></i></span>
            <p><b>Mehul Karotra replies personally</b><span>Within 24 hours, usually much faster on WhatsApp.</span><span class="js-only">Mumbai · <time data-ist>--:--</time> IST right now</span></p></div>'''


def parts(handset):
    return {'{{WA_AUDIT}}': ea(WA_AUDIT), '{{FROM_WEB}}': '₹' + format(GP.rupees('Landing page') // 1000) + 'k',
            '{{BRIEF}}': brief(), '{{SERVICES3}}': services3(), '{{FOR_CARDS}}': for_cards(),
            '{{HOW}}': how(), '{{FOUNDER_PHOTO}}': founder_photo(), '{{TOOLS}}': tools(), '{{CX_ME}}': cx_me()}
