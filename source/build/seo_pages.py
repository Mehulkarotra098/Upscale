"""SEO layer for the U Scale site: home JSON-LD, service landing pages, sitemap, robots, llms.txt, 404, icons.
Called from build_site.py after the home page is assembled. Pure static output, no build step needed to deploy."""
import json, re, html, datetime

TODAY = datetime.date.today().isoformat()
e = lambda t: html.escape(t, quote=False)
ea = lambda t: html.escape(t, quote=True)

PHONE, PHONE_D, EMAIL = '+91-79773-60142', '+91 79773 60142', 'uscalewithus@gmail.com'
WA = 'https://wa.me/917977360142?text=Hi%20Mehul%2C%20I%27d%20like%20to%20talk%20about%20my%20business.'
SAME = ['https://www.instagram.com/uscalewithus/', 'https://www.linkedin.com/in/mehulkarotra/', 'https://github.com/Mehulkarotra098', 'https://mehulpatel.vercel.app/']

# ---------------------------------------------------------------- service pages
SERVICES = [
 dict(slug='website-design-mumbai', short='Website design', name='Website Design & Development',
  title='Website Design & Development in Mumbai | U Scale by Mehul',
  desc='Custom, fast websites for Mumbai businesses, designed and coded by Mehul Karotra. No templates, SEO-ready from day one, live in 4 to 8 weeks.',
  h1='Website design & development in Mumbai',
  lead='I design and build fast, conversion-focused websites for Mumbai businesses. Every page is designed in Figma and hand-built by me, so what you approve is exactly what goes live.',
  who='For clinics, schools, studios, cafes, startups and founders who need a site that looks premium, loads fast on a phone and turns visitors into WhatsApp chats, calls and enquiries.',
  items=[('Custom design, not templates','Your brand, your layout. Designed screen by screen in Figma before a line of code is written.'),
         ('Mobile-first build','Most of your visitors are on a phone, so the mobile version is designed first and tested on real devices.'),
         ('Speed and Core Web Vitals','Lean code, compressed images and no page-builder bloat, so pages load fast and rank better.'),
         ('SEO-ready structure','Clean headings, meta tags, schema markup, sitemap and Google Search Console set up at launch.'),
         ('Enquiry flows that convert','WhatsApp buttons, call links and simple forms placed where people decide, wired to your inbox.'),
         ('Hosting, domain and handover','I set up hosting and your domain, then hand over everything you own: code, logins and a short guide.')],
  steps=[('Audit','I review your current site or competitors and agree the goals, pages and must-haves.'),
         ('Design','You see real screens in Figma, desktop and mobile, and we refine them together.'),
         ('Build','I code the approved design, connect forms and analytics, and test on phones and browsers.'),
         ('Launch','Domain, hosting, Search Console and a final check. Then small tweaks are on me for two weeks.')],
  price='Websites are fixed-price projects quoted after a free audit, typically live in 4 to 8 weeks depending on pages and how ready your content is.',
  work=['tis','antrah','roar','sashe','vidhi','growcred'],
  faq=[('How much does a website cost in Mumbai?','It depends on the number of pages and features. I quote a fixed price after a free audit, so there are no surprises and no hourly billing.'),
       ('How long does it take to build a website?','A typical business website takes 4 to 8 weeks from kickoff to launch. A single landing page can be faster.'),
       ('Do you use WordPress or templates?','I build custom sites with modern code, and use WordPress when you need to edit content often yourself. Either way the design is made for you, never a template.'),
       ('Will I own my website?','Yes. The domain, hosting account, code and design files are yours.'),
       ('Can you redesign my existing website?','Yes. I start with an audit of what works and what leaks enquiries, then redesign around that.')]),
 dict(slug='seo-mumbai', short='SEO', name='SEO Services',
  title='SEO Services in Mumbai: Local & Technical | U Scale',
  desc='Honest SEO for Mumbai businesses: local SEO, Google Business Profile, technical fixes and content, done personally by Mehul Karotra. Clear monthly reporting.',
  h1='SEO services in Mumbai',
  lead='I help Mumbai businesses show up when nearby customers search on Google and Maps. Local SEO, technical fixes and content, done personally, with honest monthly reporting.',
  who='For local businesses that depend on people searching "near me", and for service businesses that want steady enquiries without paying for every click.',
  items=[('Local SEO and Google Maps','Google Business Profile set up and optimised, categories, photos, posts and review strategy for your area.'),
         ('Technical SEO','Site speed, indexing, crawl errors, mobile usability, schema markup and Core Web Vitals fixed at the source.'),
         ('On-page SEO','Titles, descriptions, headings and internal links written around what your customers actually search.'),
         ('Content that ranks','Blog posts and service pages planned from keyword research, 4 per month on the Grow plan.'),
         ('Citations and links','Consistent listings across Indian directories and genuine local links, no spammy shortcuts.'),
         ('Plain-English reports','Every month: rankings, traffic, calls and enquiries, and what I am doing next.')],
  steps=[('Audit','A full SEO audit of your site, Google Business Profile and top local competitors.'),
         ('Fix','Technical and on-page issues fixed first, because they unlock everything else.'),
         ('Grow','Content, local signals and links added month by month.'),
         ('Report','Monthly report and call. Honest about what moved and what did not.')],
  price='Baseline SEO is part of the Launch plan from ₹35,000/month; technical SEO with 4 blogs a month is in Grow from ₹75,000/month. Every plan starts with a free audit.',
  work=['tis','antrah','sashe'],
  faq=[('How long does SEO take to show results?','Honest answer: 3 to 6 months for meaningful movement. Anyone promising page one in 30 days is selling you something. I show you the trajectory every month.'),
       ('What is local SEO?','Local SEO helps you appear in Google Maps and "near me" searches in your part of Mumbai. Your Google Business Profile is the heart of it.'),
       ('Do you guarantee first-page rankings?','No one can honestly guarantee rankings. I guarantee the work, the transparency and a clear report of results every month.'),
       ('Do I need a new website for SEO?','Not always. I start by auditing your current site; if it can be fixed, I fix it.')]),
 dict(slug='social-media-management-mumbai', short='Social media', name='Social Media Management',
  title='Social Media Management in Mumbai | U Scale by Mehul',
  desc='Social media management for Mumbai businesses: content calendars, posts, reels and engagement on Instagram, Facebook, LinkedIn and YouTube, by Mehul Karotra.',
  h1='Social media management in Mumbai',
  lead='Consistent, on-brand social media without you chasing anyone. I plan, design and post your content on Instagram, Facebook, LinkedIn and YouTube, and keep it tied to enquiries.',
  who='For businesses that know they should post regularly but never find the time, and for brands that want their feed to look as good as their product.',
  items=[('Monthly content calendar','A clear plan of posts, reels and stories, approved by you before anything goes live.'),
         ('Designed posts and carousels','On-brand creatives designed for your audience, 12 posts and 4 reels a month on Launch.'),
         ('Reels and short video','Scroll-stopping reels and shorts, edited for each platform.'),
         ('Posting and scheduling','Everything published at the right times, so your feed stays active without you.'),
         ('Engagement','Comments and DMs monitored and answered in your voice, with leads passed straight to you.'),
         ('Monthly insights','Reach, followers, saves and enquiries, and what the next month changes.')],
  steps=[('Audit','I review your profiles, competitors and what your customers respond to.'),
         ('Plan','A content calendar and visual direction for the month.'),
         ('Create','Posts, carousels and reels designed and edited.'),
         ('Post and learn','Published, engaged with, measured and improved every month.')],
  price='Social media management (12 posts + 4 reels a month) is included in the Launch plan from ₹35,000/month, with LinkedIn presence added on Grow.',
  work=['brandgen','vidhi','sashe'],
  faq=[('Which platforms do you manage?','Instagram, Facebook, LinkedIn and YouTube. I recommend focusing on the two where your customers actually spend time.'),
       ('Do I have to approve every post?','You approve the monthly calendar and can review any post before it goes out.'),
       ('Do you shoot photos and videos?','I design and edit content. When a project needs a shoot, I bring in a trusted photographer and stay your single point of contact.'),
       ('How soon will I see results on social media?','Consistency builds trust over weeks. Most businesses see engagement improve within the first month or two of steady posting.')]),
 dict(slug='google-meta-ads-mumbai', short='Google & Meta ads', name='Google & Meta Ads Management',
  title='Google & Meta Ads Management in Mumbai | U Scale',
  desc='Google Ads and Facebook/Instagram ads for Mumbai businesses, including click-to-WhatsApp campaigns. Set up, managed and reported personally by Mehul Karotra.',
  h1='Google & Meta ads in Mumbai',
  lead='Ads that put you in front of buyers from day one. I set up and manage Google Search, Performance Max and Facebook/Instagram campaigns, including click-to-WhatsApp ads that turn chats into customers.',
  who='For businesses that need enquiries now, while SEO and social build up, and for launches, offers and seasonal pushes.',
  items=[('Google Search ads','Campaigns built around high-intent searches in your area, with tight keywords and negatives.'),
         ('Meta ads (Facebook & Instagram)','Audience targeting, creatives and copy tested to find what actually brings enquiries.'),
         ('Click-to-WhatsApp campaigns','Ads that open a WhatsApp chat with you, the fastest path to a conversation in India.'),
         ('Landing pages that convert','Focused pages built for the ad, so you are not paying for clicks that bounce.'),
         ('Tracking set up properly','GA4, conversion tracking and the Meta pixel installed, so every rupee is measured.'),
         ('Weekly optimisation','Budgets, bids, keywords and creatives adjusted weekly, with a clear monthly report.')],
  steps=[('Audit','Your goals, budget, offers and competitors reviewed.'),
         ('Set up','Tracking, campaigns, audiences, creatives and landing page built.'),
         ('Launch','Ads go live with a test budget, watched closely in week one.'),
         ('Optimise','Weekly improvements and a monthly report in plain English.')],
  price='Google + Meta ads management is included in the Grow plan from ₹75,000/month. Ad spend is paid directly to Google and Meta, so you always see it.',
  work=['brandgen','roar'],
  faq=[('How much should I spend on ads in Mumbai?','It depends on your industry and goal. I recommend a test budget first, then scale what works. Ad spend goes directly to Google and Meta.'),
       ('What are click-to-WhatsApp ads?','Facebook and Instagram ads that open a WhatsApp chat with your business instead of a website, ideal for Indian customers who prefer to chat.'),
       ('Google Ads or Meta ads, which is better?','Google catches people already searching; Meta creates demand with the right audience. Most businesses do best with a mix.'),
       ('Will I see where my money goes?','Yes. You own the ad accounts and get a monthly report showing spend, leads and cost per lead.')]),
 dict(slug='ai-search-visibility', short='AI search', name='AI Search Visibility (GEO)',
  title='AI Search Visibility (GEO) in India | U Scale by Mehul',
  desc='Get your business named in ChatGPT, Gemini and Perplexity answers. Generative engine optimisation (GEO) for Mumbai and Indian businesses by Mehul Karotra.',
  h1='AI search visibility (GEO)',
  lead='When someone asks ChatGPT, Gemini or Perplexity for a recommendation in your category, does your business get mentioned? I optimise your presence so AI answers cite you.',
  who='For businesses that want to be early in the next shift in search, while most competitors are still only thinking about Google.',
  items=[('AI visibility audit','I test how ChatGPT, Gemini and Perplexity describe your business and competitors today.'),
         ('Entity and schema markup','Structured data that tells search engines and AI exactly who you are, what you do and where.'),
         ('Answer-ready content','Clear service pages and FAQs written in the way people ask AI assistants questions.'),
         ('llms.txt and crawl access','Your site made easy for AI crawlers to read, summarise and cite correctly.'),
         ('Mentions and reviews','Consistent listings, reviews and mentions across the web, which AI answers draw on.'),
         ('Monitoring','Regular checks of what AI tools say about you, with fixes where they get it wrong.')],
  steps=[('Audit','What AI assistants say about you and your competitors today.'),
         ('Structure','Schema, entity data and crawlable pages fixed.'),
         ('Content','Answer-ready pages and FAQs that AI tools can quote.'),
         ('Monitor','Ongoing checks and improvements as AI search changes.')],
  price='AI search visibility is available as part of the Grow and Scale plans, and every engagement starts with a free audit.',
  work=['brandgen','growcred','vidhi'],
  faq=[('What is GEO (generative engine optimisation)?','GEO is optimising your online presence so AI assistants like ChatGPT, Gemini and Perplexity mention and recommend your business in their answers.'),
       ('Is AI search replacing Google?','Not replacing, adding to it. More people now ask AI tools for recommendations, so it pays to show up in both.'),
       ('Can you guarantee ChatGPT will recommend me?','No one controls AI answers. I improve the signals they rely on and track how often and how accurately you appear.'),
       ('Does this help normal SEO too?','Yes. Clean structure, schema and answer-ready content also help Google rankings.')]),
]

def svc_url(site, s): return f'{site}services/{s["slug"]}'

# ---------------------------------------------------------------- JSON-LD
def offer_catalog(site):
    def svc(name, slug=None):
        d = {'@type': 'Service', 'name': name, 'areaServed': {'@type': 'City', 'name': 'Mumbai'}, 'provider': {'@id': site + '#business'}}
        if slug: d['url'] = f'{site}services/{slug}'
        return d
    def plan(n, price, inc):
        return {'@type': 'Offer', 'name': f'{n} plan', 'description': inc, 'priceCurrency': 'INR', 'price': str(price),
                'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': str(price), 'priceCurrency': 'INR', 'unitText': 'MONTH', 'billingDuration': 'P1M'},
                'itemOffered': svc(f'U Scale {n} plan')}
    items = [{'@type': 'Offer', 'itemOffered': svc(s['name'], s['slug'])} for s in SERVICES]
    items += [plan('Launch', 35000, 'Social media management (12 posts + 4 reels), Google Business Profile setup, baseline SEO, monthly performance report.'),
              plan('Grow', 75000, 'Everything in Launch plus Google + Meta ads management, technical SEO with 4 blogs a month, WhatsApp lead funnels and LinkedIn presence.')]
    return {'@type': 'OfferCatalog', 'name': 'Web design and digital marketing services', 'itemListElement': items}

def home_jsonld(site, faq):
    biz = {'@type': 'ProfessionalService', '@id': site + '#business', 'name': 'U Scale by Mehul Karotra', 'alternateName': 'U Scale',
           'url': site, 'logo': site + 'icon-512.png', 'image': site + 'og-image.png',
           'description': 'Independent web design, development and digital marketing in Mumbai by Mehul Karotra. Websites, SEO, social media, Google and Meta ads and AI search visibility, handled personally.',
           'telephone': PHONE, 'email': EMAIL, 'priceRange': '₹35,000+/month',
           'address': {'@type': 'PostalAddress', 'addressLocality': 'Mumbai', 'addressRegion': 'Maharashtra', 'addressCountry': 'IN'},
           'areaServed': [{'@type': 'City', 'name': 'Mumbai'}, {'@type': 'Country', 'name': 'India'}],
           'founder': {'@id': site + '#mehul'}, 'sameAs': SAME[:2],
           'contactPoint': {'@type': 'ContactPoint', 'telephone': PHONE, 'email': EMAIL, 'contactType': 'sales', 'areaServed': 'IN', 'availableLanguage': ['English', 'Hindi']},
           'knowsAbout': ['Web design', 'Web development', 'UI/UX design', 'Search engine optimisation', 'Local SEO', 'Social media marketing', 'Google Ads', 'Meta Ads', 'Generative engine optimisation'],
           'hasOfferCatalog': offer_catalog(site)}
    person = {'@type': 'Person', '@id': site + '#mehul', 'name': 'Mehul Karotra', 'jobTitle': 'UI/UX developer-designer and digital marketer',
              'url': site + '#about', 'image': site + 'og-image.png', 'sameAs': SAME[1:],
              'homeLocation': {'@type': 'City', 'name': 'Mumbai'},
              'alumniOf': {'@type': 'EducationalOrganization', 'name': 'Bachelor of Computer Application (Information Technology)'},
              'knowsAbout': ['Figma', 'React.js', 'Tailwind CSS', 'WordPress', 'Illustrator', 'Photoshop', 'SEO']}
    website = {'@type': 'WebSite', '@id': site + '#website', 'url': site, 'name': 'U Scale', 'inLanguage': 'en-IN', 'publisher': {'@id': site + '#business'}}
    page = {'@type': 'WebPage', '@id': site + '#webpage', 'url': site, 'name': 'Web Design, SEO & Social Media in Mumbai | U Scale by Mehul',
            'isPartOf': {'@id': site + '#website'}, 'about': {'@id': site + '#business'}, 'primaryImageOfPage': site + 'og-image.png', 'inLanguage': 'en-IN', 'dateModified': TODAY}
    faqp = {'@type': 'FAQPage', '@id': site + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}
    return json.dumps({'@context': 'https://schema.org', '@graph': [website, page, biz, person, faqp]}, ensure_ascii=False, separators=(',', ':'))

def service_jsonld(site, s):
    url = svc_url(site, s)
    return json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': s['title'], 'description': s['desc'], 'isPartOf': {'@id': site + '#website'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': TODAY},
        {'@type': 'Service', '@id': url + '#service', 'name': s['name'], 'serviceType': s['name'], 'url': url, 'description': s['desc'],
         'provider': {'@type': 'ProfessionalService', '@id': site + '#business', 'name': 'U Scale by Mehul Karotra', 'url': site, 'telephone': PHONE,
                      'address': {'@type': 'PostalAddress', 'addressLocality': 'Mumbai', 'addressRegion': 'Maharashtra', 'addressCountry': 'IN'}},
         'areaServed': [{'@type': 'City', 'name': 'Mumbai'}, {'@type': 'Country', 'name': 'India'}]},
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': site + '#services'},
            {'@type': 'ListItem', 'position': 3, 'name': s['name'], 'item': url}]},
        {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in s['faq']]},
    ]}, ensure_ascii=False, separators=(',', ':'))

# ---------------------------------------------------------------- page assembly
def chrome_parts(home_html):
    """Reuse the home page's header, menu and footer so every page shares one design. In-page anchors become /#anchor."""
    grab = lambda pat: re.search(pat, home_html, re.S).group(0)
    header = grab(r'<header class="site-header".*?</header>')
    menu = grab(r'<div class="menu on-dark" id="menu".*?\n</div>')
    footer = grab(r'<footer class="site-footer.*?</footer>')
    tail = grab(r'<div class="sprog".*?<a class="wa-float".*?</a>')
    fix = lambda h: re.sub(r'href="#(?!top")', 'href="/#', h).replace('brand" href="#top"', 'brand" href="/"')
    return fix(header), fix(menu), fix(footer), fix(tail)

def faq_html(items, start=0):
    out = []
    for i, (q, a) in enumerate(items):
        n = start + i
        out.append(f'<div class="qa{" is-open" if i == 0 else ""}"><h3><button class="qa__btn" type="button" id="q{n}" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="a{n}">'
                   f'<span class="qa__n" aria-hidden="true">{i+1:02d}</span><span>{e(q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3>'
                   f'<div class="qa__panel" id="a{n}" role="region" aria-labelledby="q{n}"><div><p>{e(a)}</p></div></div></div>')
    return '\n'.join(out)

def service_page(ctx, s, parts):
    site, v, WORK = ctx['SITE_URL'], ctx['_v'], ctx['WORK']
    header, menu, footer, tail = parts
    url = svc_url(site, s)
    wmap = {w[0]: w for w in WORK}
    cards = []
    for k in s['work']:
        w = wmap[k]
        cards.append(f'<li class="rw"><a href="{w[5]}" target="_blank" rel="noopener" data-cursor="view"><span class="rw__img"><img src="/assets/work/{k}-peek.webp" width="768" height="480" alt="{ea(w[1])} website" loading="lazy" decoding="async"></span>'
                     f'<span class="rw__body"><img class="rw__logo" src="/assets/logos/{k}.webp" width="{ctx['SZ'][k][0]}" height="{ctx['SZ'][k][1]}" alt="" loading="lazy" decoding="async"><b>{e(w[1])}</b><small>{e(w[2])}</small></span><span class="sr-only"> (opens in a new tab)</span></a></li>')
    others = ''.join(f'<li><a href="/services/{o["slug"]}">{e(o["name"])}</a></li>' for o in SERVICES if o is not s)
    items = ''.join(f'<li class="svc" data-reveal><span class="svc__n" aria-hidden="true">{i+1:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d) in enumerate(s['items']))
    steps = ''.join(f'<li class="step" data-reveal><span class="step__num" aria-hidden="true" data-n="{i+1}">{i+1:02d}</span><h3><span class="sr-only">Step {i+1}: </span>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d) in enumerate(s['steps']))
    wa = 'https://wa.me/917977360142?text=' + __import__('urllib.parse').parse.quote(f"Hi Mehul, I'm interested in {s['short'].lower()} for my business.")
    return f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(s['title'])}</title>
<meta name="description" content="{ea(s['desc'])}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#FAF9FC">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en-IN" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(s['title'])}">
<meta property="og:description" content="{ea(s['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{site}og-image.png">
{ctx['ICONS_HEAD']}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script type="application/ld+json">{service_jsonld(site, s)}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
</head>
<body class="page-sub">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
  <div class="wrap hero-shell">
    <section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#services">Services</a></li><li aria-current="page">{e(s['short'])}</li></ol></nav>
      <h1 class="sp-hero__title" id="page-title">{e(s['h1'])}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{e(s['lead'])}</p>
      <div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="#contact" data-magnetic>Get a free audit <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>
        <a class="btn btn--ghost" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Chat on WhatsApp</a>
      </div>
      <p class="sp-hero__who">{e(s['who'])}</p>
    </section>
  </div>

  <section class="section" aria-labelledby="inc-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>What's included</p>
        <h2 class="h2" id="inc-title" data-split>Everything handled, by one person.</h2>
        <p class="lead" data-reveal>You work directly with me, Mehul Karotra. No account managers, no hand-offs.</p>
      </header>
      <ul class="bento sp-grid" data-reveal-group>{items}</ul>
    </div>
  </section>

  <section class="section process sp-process" aria-labelledby="how-title">
    <div class="wrap">
      <header class="proc__head">
        <p class="eyebrow" data-reveal data-scramble>How it works</p>
        <h2 class="h2" id="how-title" data-split>Four clear steps.</h2>
      </header>
      <ol class="steps" data-progress="steps" data-reveal-group>{steps}</ol>
    </div>
  </section>

  <section class="section" aria-labelledby="work-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Related work</p>
        <h2 class="h2" id="work-title" data-split>Sites I designed and built.</h2>
      </header>
      <ul class="rw-grid" data-reveal-group>{''.join(cards)}</ul>
      <p class="sp-price" data-reveal><strong>Pricing.</strong> {e(s['price'])} <a class="tlink" href="/#pricing">See all plans</a></p>
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>FAQ</p>
        <h2 class="h2" id="faq-title" data-split>{e(s['short'])} questions.</h2>
      </header>
      <div class="faq__list" data-accordion data-reveal>
{faq_html(s['faq'])}
      </div>
    </div>
  </section>

  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <span class="grain" aria-hidden="true"></span>
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Let's talk about your {e(s['short'].lower())}<span class="dot">.</span></h2>
          <p class="lead">Tell me what you need. I reply within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{EMAIL}">Email {EMAIL}</a>
            <a class="btn btn--ghost" href="tel:+917977360142">Call {PHONE_D}</a>
          </div>
        </div>
      </div>
      <nav class="sp-more" aria-label="Other services"><p class="eyebrow">Other services</p><ul>{others}</ul></nav>
    </div>
  </section>
</main>
{footer}
{tail}
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
<script defer src="/script.js?v={v}"></script>
</body>
</html>
'''

def page_404(ctx, parts):
    header, menu, footer, tail = parts
    site, v = ctx['SITE_URL'], ctx['_v']
    links = ''.join(f'<li><a class="tlink" href="/services/{s["slug"]}">{e(s["name"])}</a></li>' for s in SERVICES)
    return f'''<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | U Scale by Mehul</title><meta name="robots" content="noindex">
{ctx['ICONS_HEAD']}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script>document.documentElement.classList.add('js','intro-skip');</script>
<link rel="stylesheet" href="/styles.css?v={v}"></head>
<body class="page-sub">{header}{menu}
<main id="main"><div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
<p class="eyebrow">Error 404</p><h1 class="sp-hero__title" id="page-title">Not found<span class="dot">.</span></h1>
<p class="sp-hero__lead">This page doesn't exist, but your next customer might be searching for you right now.</p>
<div class="hero__cta"><a class="btn btn--go" href="/">Back to home <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a></div>
<ul class="sp-404">{links}</ul></section></div></main>
{footer}{tail}
<script defer src="/script.js?v={v}"></script></body></html>
'''

def llms_txt(site, faq):
    lines = ['# U Scale by Mehul Karotra', '',
             '> Independent web design, development and digital marketing in Mumbai, India. U Scale is one person, Mehul Karotra, a UI/UX developer-designer who designs and builds websites and runs SEO, social media, Google and Meta ads and AI search visibility for businesses, personally. Not an agency.', '',
             f'- Website: {site}', f'- Contact: WhatsApp/phone {PHONE_D}, email {EMAIL}', '- Based in: Mumbai, Maharashtra, India (serves clients across India)',
             '- Pricing: Launch plan from ₹35,000/month, Grow plan from ₹75,000/month, Scale plan custom. Websites are fixed-price projects. Every plan starts with a free digital audit. Plans start with a 3-month sprint, then run month-to-month.', '',
             '## Services', '']
    lines += [f'- [{s["name"]}]({svc_url(site, s)}): {s["desc"]}' for s in SERVICES]
    lines += ['', '## Work', '', '- TIS Admissions (concept), Antrah Wellness, Roar Arena, My Country Mobile (in-house role), Callmama (in-house role), GrowCred, Sashe by Prachi, Vidhi Parmar, BrandGen. Live links are on the home page.', '',
              '## About Mehul Karotra', '', f'- UI/UX developer-designer from Mumbai. LinkedIn: {SAME[1]} . Portfolio: {SAME[3]}', '',
              '## FAQ', '']
    lines += [f'- **{q}** {a}' for q, a in faq]
    return '\n'.join(lines) + '\n'

def build(ctx):
    site, out = ctx['SITE_URL'], ctx['site']
    home = (out / 'index.html').read_text()
    parts = chrome_parts(home)
    (out / 'services').mkdir(exist_ok=True)
    for s in SERVICES:
        (out / 'services' / f'{s["slug"]}.html').write_text(service_page(ctx, s, parts))
    (out / '404.html').write_text(page_404(ctx, parts))
    urls = [(site, '1.0')] + [(svc_url(site, s), '0.8') for s in SERVICES]
    (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join(f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{p}</priority></url>\n' for u, p in urls) + '</urlset>\n')
    (out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /404\n\n# AI assistants are welcome to read and cite this site\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\n\nSitemap: {site}sitemap.xml\n')
    (out / 'llms.txt').write_text(llms_txt(site, ctx['FAQ']))
    (out / 'site.webmanifest').write_text(json.dumps({'name': 'U Scale by Mehul Karotra', 'short_name': 'U Scale', 'start_url': '/', 'display': 'standalone',
        'background_color': '#FAF9FC', 'theme_color': '#251E45', 'icons': [{'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=1))
    return [s['slug'] for s in SERVICES]
