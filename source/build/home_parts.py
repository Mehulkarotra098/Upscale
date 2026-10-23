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
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/avif" srcset="{GP.srcset(img, "avif", small)}" sizes="{sizes}">'
            f'<img src="{GP.vurl(img["file"] + ".webp")}" srcset="{GP.srcset(img, "webp", small)}" sizes="{sizes}" width="{img["w"]}" height="{img["h"]}" '
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
    proof = [('check', '12+ projects shipped'), ('tag', 'Every price published'), ('chat', 'WhatsApp replies within 24 hours'), ('key', 'Domain and code in your name')]
    chips = '<ul class="brief-proof">' + ''.join(f'<li>{icon(ic)}<span>{e(t)}</span></li>' for ic, t in proof) + '</ul>'
    html = aeo.brief_html(answer, facts, 'Key facts: U Scale by Mehul Karotra', 'brief-title')
    i = html.index('<table class="sp-facts"')
    j = html.rindex('</div>', 0, i)
    return html[:j] + chips + html[j:]


# ---------------------------------------------------------------- service images
# Rendered product shots of one sample café (Chai Kona) across the three services, so a shop owner sees the result, not
# a diagram: a salon site taking WhatsApp bookings, a café at the top of maps and AI answers, an ad turning into orders.
SVC_IMG = {'web': 'salon', 'found': 'found', 'customers': 'social'}


def svc_media(key, wide=False):
    sizes = '(max-width: 1099px) 92vw, 400px' if wide else '(max-width: 759px) 92vw, (max-width: 1099px) 46vw, 400px'
    return f'<figure class="svc3__media" data-live>{_pic(GP.IMG[SVC_IMG[key]], sizes)}</figure>'


def services3():
    cards = [
        dict(cls=' svc3__card--web on-dark', viz='web', ic='globe', k='Get a website', h='A website that brings you enquiries',
             p='Designed in Figma and hand-coded, mobile first, with WhatsApp and call buttons where people decide.',
             chips=['Landing pages', 'Business sites', 'Online stores', 'Restaurant ordering'],
             price=f'{price("Landing page")} to {price("E-commerce, under 50 products")}, fixed',
             links=[('/services/website-design-mumbai', 'Website design in Mumbai')]),
        dict(cls='', viz='found', ic='pin', k='Get found', h='Show up on Google, Maps and AI answers',
             p='Your Google Business Profile, local and technical SEO, and getting named when people ask ChatGPT or Gemini.',
             chips=['Google Business Profile', 'Local SEO', 'Technical SEO', 'AI search (GEO)'],
             price=f'Local SEO {price("Local SEO / Google Business Profile")} · AI search {price("AI search visibility (GEO)")}',
             links=[('/services/seo-mumbai', 'SEO services in Mumbai'), ('/services/ai-search-visibility', 'AI search visibility')]),
        dict(cls='', viz='customers', ic='camera', k='Get customers', h='More customers from social media and ads',
             p='A monthly calendar of posts and reels, and Google and Meta ads that send people to WhatsApp, with a plain-English report.',
             chips=['Instagram & Facebook', 'Reels', 'Google & Meta ads', 'WhatsApp follow-ups'],
             price=f'Ads management {price("Ads management")} · posts from ₹800',
             links=[('/services/social-media-management-mumbai', 'Social media management'), ('/services/google-meta-ads-mumbai', 'Google & Meta ads')]),
    ]
    li = ''
    for c in cards:
        chips = ''.join(f'<li>{e(x)}</li>' for x in c['chips'])
        links = ''.join(f'<a class="svc3__link" href="{ea(h)}">{e(t)} {icon("arrow")}</a>' for h, t in c['links'])
        li += (f'<li class="svc3__card{c["cls"]}" data-reveal>{svc_media(c["viz"], wide=c["viz"] == "web")}<p class="svc3__k">{icon(c["ic"])}{e(c["k"])}</p>'
               f'<h3>{e(c["h"])}</h3><p class="svc3__p">{e(c["p"])}</p><ul class="svc3__chips">{chips}</ul>'
               f'<p class="svc3__price">{e(c["price"])}</p><div class="svc3__links">{links}</div></li>')
    also = ['Branding & identity', 'Content & reels', 'WhatsApp & email automation', 'Reviews & reputation', 'Analytics & reporting']
    also_li = ''.join(f'<li>{icon("check")}{e(x)}</li>' for x in also)
    return (f'      <ul class="svc3" data-reveal-group>{li}</ul>\n'
            f'      <div class="svc3__also" data-reveal><p>Also on request</p><ul>{also_li}</ul><a class="tlink" href="/services">All services</a></div>')


def for_cards():
    """Two picture cards (cafés, boutiques: the demo sites people can picture as theirs) and two guide cards."""
    by = {p['slug']: p for p in GP.PAGES}
    pics = [('restaurants-cafes', 'rest', 'Restaurants & cafés', 'See café websites'), ('boutiques-fashion', 'bout', 'Boutiques & fashion', 'See boutique websites')]
    big = ''.join(f'<li data-reveal><a class="mf" href="/services/{GP.BASE}/{slug}"><figure class="mf__media">'
                  f'{_pic(GP.IMG[img], "(max-width: 759px) 92vw, 560px")}</figure><span class="mf__body"><span class="mf__k">{e(k)}</span>'
                  f'<b class="mf__t">{e(by[slug]["h1"])}</b><span class="mf__d">{e(by[slug]["card"])}</span>'
                  f'<span class="mf__go">{e(go)} {icon("arrow")}</span></span></a></li>' for slug, img, k, go in pics)
    guides = ''.join(f'<li data-reveal><a class="fp-rel" href="/services/{GP.BASE}/{p["slug"]}"><span class="fp-rel__k">Guide</span><b>{e(p["h1"])}</b>'
                     f'<span class="fp-rel__d">{e(p["card"])}</span>{icon("arrow")}</a></li>' for p in GP.PAGES if p['kind'] == 'guide')
    return (f'      <ul class="mf-list" data-reveal-group>{big}</ul>\n'
            f'      <div class="fp-related home-for__list"><ul data-reveal-group>{guides}</ul></div>')


def how():
    steps = [('Free audit', 'I check your website, Google listing and Instagram, and show you where enquiries slip away.', 'Free'),
             ('Written plan', 'What I will do, by when, and the exact price, in writing before you pay anything.', 'Fixed price'),
             ('Design & build', 'You see real screens in Figma and approve them before I build. You see progress every week.', '20% to start · 20% on design sign-off'),
             ('Launch & grow', 'Launch, then monthly SEO, social or ads only if you want them, with a plain-English report.', '60% on launch')]
    promise = [('key', 'Your domain, code and logins, in your name'), ('file', 'Every price published and fixed in writing'),
               ('shield', '15–30 day bug-fix window after launch')]
    shots = ['step-audit', 'step-plan', 'step-design', 'step-launch']
    li = ''.join(f'<li class="fp-step" data-reveal><figure class="fp-step__media">{_pic(GP.IMG[shots[i]], "(max-width: 759px) 92vw, (max-width: 1099px) 46vw, 290px")}</figure>'
                 f'<div class="fp-step__body"><span class="fp-step__n" aria-hidden="true">{i + 1:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p>'
                 f'<span class="fp-step__tag">{e(tag)}</span></div></li>' for i, (t, d, tag) in enumerate(steps))
    pr = ''.join(f'<li>{icon(ic)}<span>{e(x)}</span></li>' for ic, x in promise)
    return f'''  <!-- HOW IT WORKS: risk removed up front -->
  <section class="section home-how" id="how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>How it works</p>
        <h2 class="h2" id="how-title" data-split>Fixed price. No surprises.</h2>
        <p class="lead" data-reveal>From a free audit to launch in four steps. Monthly work runs as a 3-month sprint, then month-to-month with 30 days&rsquo; notice.</p>
      </header>
      <ol class="fp-steps" data-reveal-group>{li}</ol>
      <ul class="fp-promise" data-reveal>{pr}</ul>
    </div>
  </section>'''


def founder_photo():
    return f'''      <figure class="founder__photo" data-reveal>
        {_pic(MEHUL, "(max-width: 899px) 92vw, 460px")}
        <figcaption class="hv__plate"><b>Mehul Karotra</b><span>Founder of U&nbsp;Scale · Mumbai</span></figcaption>
      </figure>'''


def tools():
    sz = '(max-width: 759px) 92vw, 560px'
    return f'''      <ul class="fp-tools home-tools__list" data-reveal-group>
  <li data-reveal><a class="fp-tool fp-tool--dark" href="/tools/google-business-profile-checker"><figure class="fp-tool__media">{_pic(GP.IMG['tool-checker'], sz)}</figure><span class="fp-tool__k">Free · about 2 minutes</span><span class="fp-tool__t">Google Business Profile checker</span><span class="fp-tool__d">A score out of 100, a fix list for your listing and a review goal.</span><span class="fp-tool__go">Check my listing {icon("arrow")}</span></a></li>
  <li data-reveal><a class="fp-tool" href="/tools/google-review-qr-code"><figure class="fp-tool__media">{_pic(GP.IMG['tool-qr'], sz)}</figure><span class="fp-tool__k">Free · printable</span><span class="fp-tool__t">Google review QR code maker</span><span class="fp-tool__d">A counter standee that turns happy customers into Google reviews.</span><span class="fp-tool__go">Make my QR code {icon("arrow")}</span></a></li>
</ul>'''


def cx_me():
    return f'''          <div class="cx__me"><span class="cx__badge" aria-hidden="true">{icon("chat")}<i></i></span>
            <p><b>Mehul Karotra replies personally</b><span>Within 24 hours, usually much faster on WhatsApp.</span><span class="js-only">Mumbai · <time data-ist>--:--</time> IST right now</span></p></div>'''


def parts(handset):
    return {'{{WA_AUDIT}}': ea(WA_AUDIT), '{{FROM_WEB}}': '₹' + format(GP.rupees('Landing page') // 1000) + 'k',
            '{{BRIEF}}': brief(), '{{SERVICES3}}': services3(), '{{FOR_CARDS}}': for_cards(),
            '{{HOW}}': how(), '{{FOUNDER_PHOTO}}': founder_photo(), '{{TOOLS}}': tools(), '{{CX_ME}}': cx_me()}
