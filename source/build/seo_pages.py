"""SEO layer for the U Scale site: home JSON-LD, service landing pages, sitemap, robots, llms.txt, 404, icons.
Called from build_site.py after the home page is assembled. Pure static output (standard library only).
URLs come from ctx['SITE_URL'], which build_site.py reads from the SITE_URL environment variable (config.py)."""
import json, re, html
import config

TODAY = config.BUILD_DATE
e = lambda t: html.escape(t, quote=False)
ea = lambda t: html.escape(t, quote=True)

PHONE, PHONE_D, EMAIL = '+91-79773-60142', '+91 79773 60142', 'uscalewithus@gmail.com'
WA = 'https://wa.me/917977360142?text=Hi%20Mehul%2C%20I%27d%20like%20to%20talk%20about%20my%20business.'
SAME = ['https://www.instagram.com/uscalewithus/', 'https://www.linkedin.com/in/mehulkarotra/', 'https://github.com/Mehulkarotra098']

# ---------------------------------------------------------------- service pages
SERVICES = [
 dict(slug='website-design-mumbai', short='Website design', name='Website Design & Development',
  title='Freelance Website Designer in Mumbai | U Scale by Mehul',
  desc='Custom, fast websites for Mumbai businesses, designed and coded by Mehul Karotra. No templates, SEO-ready from day one, live in 4 to 8 weeks.',
  h1='Website design & development in Mumbai',
  lead='I am a freelance web designer and developer in Mumbai. I design every page in Figma and build it by hand, so what you approve is exactly what goes live, at a fixed price agreed before I start.',
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
  price='Landing pages ₹25,000, business sites from ₹55,000, a 5–10 page site with blog ₹85,000, e-commerce from ₹95,000 and restaurant sites with online ordering ₹90,000. Redesigns are 70% of a fresh build, and a care plan is ₹3,500/month.',
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
  lead='I work as a freelance SEO consultant for Mumbai businesses, helping you show up when nearby customers search on Google and Maps. Local SEO, technical fixes and content, done personally, with honest monthly reporting.',
  who='For local businesses that depend on people searching "near me", and for service businesses that want steady enquiries without paying for every click.',
  items=[('Local SEO and Google Maps','Google Business Profile set up and optimised, categories, photos, posts and review strategy for your area.'),
         ('Technical SEO','Site speed, indexing, crawl errors, mobile usability, schema markup and Core Web Vitals fixed at the source.'),
         ('On-page SEO','Titles, descriptions, headings and internal links written around what your customers actually search.'),
         ('Content that ranks','Blog posts and service pages planned from keyword research, ₹2,000 per 1,000-word post.'),
         ('Citations and links','Consistent listings across Indian directories and genuine local links, no spammy shortcuts.'),
         ('Plain-English reports','Every month: rankings, traffic, calls and enquiries, and what I am doing next.')],
  steps=[('Audit','A full SEO audit of your site, Google Business Profile and top local competitors.'),
         ('Fix','Technical and on-page issues fixed first, because they unlock everything else.'),
         ('Grow','Content, local signals and links added month by month.'),
         ('Report','Monthly report and call. Honest about what moved and what did not.')],
  price='Local SEO and Google Business Profile ₹15,000/month, technical + on-page SEO ₹25,000/month, or both together. A deep-dive SEO audit is ₹7,500, free if we work together.',
  work=['tis','antrah','sashe'],
  faq=[('How long does SEO take to show results?','Honest answer: 3 to 6 months for meaningful movement. Anyone promising page one in 30 days is selling you something. I show you the trajectory every month.'),
       ('What is local SEO?','Local SEO helps you appear in Google Maps and "near me" searches in your part of Mumbai. Your Google Business Profile is the heart of it.'),
       ('Do you guarantee first-page rankings?','No one can honestly guarantee rankings. I guarantee the work, the transparency and a clear report of results every month.'),
       ('Do I need a new website for SEO?','Not always. I start by auditing your current site; if it can be fixed, I fix it.')]),
 dict(slug='social-media-management-mumbai', short='Social media', name='Social Media Management',
  title='Social Media Management in Mumbai | U Scale by Mehul',
  desc='Social media management for Mumbai businesses: content calendars, posts, reels and engagement on Instagram, Facebook, LinkedIn and YouTube, by Mehul Karotra.',
  h1='Social media management in Mumbai',
  lead='Consistent, on-brand social media without you chasing anyone. As your freelance social media manager, I plan, design and post your content on Instagram, Facebook, LinkedIn and YouTube, and keep it tied to enquiries.',
  who='For businesses that know they should post regularly but never find the time, and for brands that want their feed to look as good as their product.',
  items=[('Monthly content calendar','A clear plan of posts, reels and stories, approved by you before anything goes live.'),
         ('Designed posts and carousels','On-brand creatives designed for your audience: ₹800 a post, ₹1,500 a carousel.'),
         ('Reels and short video','Scroll-stopping reels and shorts, edited for each platform.'),
         ('Posting and scheduling','Everything published at the right times, so your feed stays active without you.'),
         ('Engagement','Comments and DMs monitored and answered in your voice, with leads passed straight to you.'),
         ('Monthly insights','Reach, followers, saves and enquiries, and what the next month changes.')],
  steps=[('Audit','I review your profiles, competitors and what your customers respond to.'),
         ('Plan','A content calendar and visual direction for the month.'),
         ('Create','Posts, carousels and reels designed and edited.'),
         ('Post and learn','Published, engaged with, measured and improved every month.')],
  price='Community & inbox management is ₹12,000/month. Content is priced per piece: posts ₹800, carousels ₹1,500, reel edits ₹2,500, and a half-day shoot with 3 reels ₹15,000.',
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
  price='Ads management is ₹20,000/month flat up to ₹1.5 lakh of monthly ad spend, then 12% of spend, plus a one-time ₹10,000 setup. Ad spend is paid directly to Google and Meta, so you always see it.',
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
  price='AI search visibility is ₹12,000/month, on its own or alongside other services. An AI visibility audit is ₹2,500, free if we work together.',
  work=['brandgen','growcred','vidhi'],
  faq=[('What is GEO (generative engine optimisation)?','GEO is optimising your online presence so AI assistants like ChatGPT, Gemini and Perplexity mention and recommend your business in their answers.'),
       ('Is AI search replacing Google?','Not replacing, adding to it. More people now ask AI tools for recommendations, so it pays to show up in both.'),
       ('Can you guarantee ChatGPT will recommend me?','No one controls AI answers. I improve the signals they rely on and track how often and how accurately you appear.'),
       ('Does this help normal SEO too?','Yes. Clean structure, schema and answer-ready content also help Google rankings.')]),
]

def svc_url(site, s): return f'{site}services/{s["slug"]}'

# ---------------------------------------------------------------- JSON-LD
def offer_catalog(site):
    """Every published price as schema.org Offers, so search engines and AI tools can quote them accurately."""
    def svc(name, slug=None):
        d = {'@type': 'Service', 'name': name, 'areaServed': {'@type': 'City', 'name': 'Mumbai'}, 'provider': {'@id': site + '#business'}}
        if slug: d['url'] = f'{site}services/{slug}'
        return d
    def offer(name, price, monthly=False, desc=None, minimum=False, slug=None):
        o = {'@type': 'Offer', 'name': name, 'itemOffered': svc(name, slug), 'priceCurrency': 'INR', 'url': site + 'pricing'}
        if price is not None:
            spec = {'@type': 'UnitPriceSpecification', 'priceCurrency': 'INR'}
            spec['minPrice' if minimum else 'price'] = price
            if monthly: spec.update({'unitText': 'MONTH', 'billingDuration': 'P1M'})
            o['priceSpecification'] = spec
            if not minimum: o['price'] = price
        if desc: o['description'] = desc
        return o
    items = [offer(n, v, monthly=('/mo' in pr), minimum=pr.startswith('from'), slug='website-design-mumbai') for n, pr, v in PD.WEBSITES if v]
    items += [offer(n, v, monthly=('/mo' in pr), desc=note) for n, pr, note, v in PD.ADDONS]
    items += [offer(n, _num(pr), minimum=pr.startswith('from')) for g, its in PD.UNITS for n, pr in its]
    return {'@type': 'OfferCatalog', 'name': 'Web design and digital marketing price list', 'url': site + 'pricing', 'itemListElement': items}

def home_jsonld(site, faq):
    biz = {'@type': 'ProfessionalService', '@id': site + '#business', 'name': 'U Scale by Mehul Karotra', 'alternateName': 'U Scale',
           'url': site, 'logo': site + 'icon-512.png', 'image': site + 'og-image.png',
           'description': 'Freelance web design, development and digital marketing in Mumbai by Mehul Karotra: an independent, contract-based alternative to a digital marketing agency. Websites, SEO, social media, Google and Meta ads and AI search visibility, with every price published.', 'slogan': 'Agency-quality work, without the agency.',
           'telephone': PHONE, 'email': EMAIL, 'priceRange': '₹800 – ₹1,50,000',
           'address': {'@type': 'PostalAddress', 'addressLocality': 'Mumbai', 'addressRegion': 'Maharashtra', 'addressCountry': 'IN'},
           'areaServed': [{'@type': 'City', 'name': 'Mumbai'}, {'@type': 'Country', 'name': 'India'}],
           'founder': {'@id': site + '#mehul'}, 'sameAs': SAME[:2],
           'contactPoint': {'@type': 'ContactPoint', 'telephone': PHONE, 'email': EMAIL, 'contactType': 'sales', 'areaServed': 'IN', 'availableLanguage': ['English', 'Hindi']},
           'knowsAbout': ['Freelance web design', 'Web design', 'Web development', 'Digital marketing', 'UI/UX design', 'Search engine optimisation', 'Local SEO', 'Social media marketing', 'Google Ads', 'Meta Ads', 'Generative engine optimisation'],
           'hasOfferCatalog': offer_catalog(site)}
    person = {'@type': 'Person', '@id': site + '#mehul', 'name': 'Mehul Karotra', 'jobTitle': 'Freelance web designer, developer and digital marketer',
              'url': site + '#about', 'image': site + 'og-image.png', 'sameAs': SAME[1:],
              'homeLocation': {'@type': 'City', 'name': 'Mumbai'},
              'alumniOf': {'@type': 'EducationalOrganization', 'name': 'Bachelor of Computer Application (Information Technology)'},
              'knowsAbout': ['Figma', 'React.js', 'Tailwind CSS', 'WordPress', 'Illustrator', 'Photoshop', 'SEO']}
    website = {'@type': 'WebSite', '@id': site + '#website', 'url': site, 'name': 'U Scale', 'inLanguage': 'en-IN', 'publisher': {'@id': site + '#business'}}
    page = {'@type': 'WebPage', '@id': site + '#webpage', 'url': site, 'name': 'Freelance Web Designer & Digital Marketer in Mumbai | U Scale',
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
    fix = lambda h: re.sub(r'href="#(?!top")', 'href="/#', h).replace('brand" href="#top"', 'brand" href="/"').replace('href="/#pricing"', 'href="/pricing"')
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
        w = wmap[k]; lw, lh = ctx['SZ'][k]
        cards.append(f'<li class="rw"><a href="{w[5]}" target="_blank" rel="noopener" data-cursor="view"><span class="rw__img"><img src="/assets/work/{k}-peek.webp" width="768" height="480" alt="{ea(w[1])} website" loading="lazy" decoding="async"></span>'
                     f'<span class="rw__body"><img class="rw__logo" src="/assets/logos/{k}.webp" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async"><b>{e(w[1])}</b><small>{e(w[2])}</small></span><span class="sr-only"> (opens in a new tab)</span></a></li>')
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
<meta name="robots" content="{ctx['ROBOTS']}">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#FAF9FC">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en-IN" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(s['title'])}">
<meta property="og:description" content="{ea(s['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="U Scale by Mehul Karotra: Be found. Be chosen.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(s['title'])}">
<meta name="twitter:description" content="{ea(s['desc'])}">
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
      <p class="sp-price" data-reveal><strong>Pricing.</strong> {e(s['price'])} <a class="tlink" href="/pricing">See every price</a></p>
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
<body class="page-sub"><a class="skip" href="#main">Skip to content</a>{header}{menu}
<main id="main"><div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
<p class="eyebrow">Error 404</p><h1 class="sp-hero__title" id="page-title">Not found<span class="dot">.</span></h1>
<p class="sp-hero__lead">This page doesn't exist, but your next customer might be searching for you right now.</p>
<div class="hero__cta"><a class="btn btn--go" href="/">Back to home <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a></div>
<ul class="sp-404">{links}</ul></section></div></main>
{footer}{tail}
<script defer src="/script.js?v={v}"></script></body></html>
'''

def blog_shell(ctx, parts):
    """Chrome for the server-rendered blog (api/blog.js): same head assets, header, menu, footer and scripts as every page,
    with <!--HEAD--> and <!--MAIN--> slots. Also publishes blog.css / blog.js with a content hash for cache-busting."""
    import hashlib
    header, menu, footer, tail = parts
    out, v = ctx['site'], ctx['_v']
    src = config.REPO / 'source' / 'src'
    bcss, bjs = (src / 'blog.css').read_text(), (src / 'blog.js').read_text()
    bv = hashlib.sha1((bcss + bjs).encode()).hexdigest()[:8]
    (out / 'blog.css').write_text(bcss)
    (out / 'blog.js').write_text(bjs)
    (out / '_blog').mkdir(exist_ok=True)
    (out / '_blog' / 'shell.html').write_text(f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!--HEAD-->
<meta name="theme-color" content="#FAF9FC">
{ctx['ICONS_HEAD']}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
<link rel="stylesheet" href="/blog.css?v={bv}">
</head>
<body class="page-sub page-blog">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
<!--MAIN-->
</main>
{footer}
{tail}
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
<script defer src="/script.js?v={v}"></script>
<script defer src="/blog.js?v={bv}"></script>
</body>
</html>
''')

def llms_txt(site, faq):
    lines = ['# U Scale by Mehul Karotra', '',
             '> Freelance web design, development and digital marketing in Mumbai, India. U Scale is Mehul Karotra, a UI/UX developer-designer who designs and builds websites and runs SEO, social media, Google and Meta ads and AI search visibility for businesses, personally, on fixed-price contracts or monthly plans. An independent alternative to a digital marketing agency.', '',
             f'- Website: {site}', f'- Contact: WhatsApp/phone {PHONE_D}, email {EMAIL}', '- Based in: Mumbai, Maharashtra, India (serves clients across India)',
             f'- Full price list: {site}pricing', f'- Blog (guides on websites, SEO, social media, ads and AI search): {site}blog',
             f'- Free tool: Google review QR code and counter standee maker (runs in the browser, no sign-up): {site}tools/google-review-qr-code', '',
             '## Pricing (INR)', '']
    lines += ['### Websites (one-time, fixed price)'] + [f'- {n}: {pr}' for n, pr, _ in PD.WEBSITES] + [f'- {PD.WEBSITES_NOTE}']
    lines += ['', '### Monthly services (combine any)'] + [f'- {n}: {pr}' + (f' ({note})' if note else '') for n, pr, note, _ in PD.ADDONS]
    lines += ['', '### Unit prices'] + [f'- {g}: ' + '; '.join(f'{n} {pr}' for n, pr in items) for g, items in PD.UNITS]
    lines += ['', '### Terms'] + [f'- {t}' for t in PD.TERMS]
    lines += ['', '## Services', '']
    lines += [f'- [{s["name"]}]({svc_url(site, s)}): {s["desc"]}' for s in SERVICES]
    lines += ['', '## Work', '', '- TIS Admissions (concept), Antrah Wellness, Roar Arena, My Country Mobile (in-house role), Callmama (in-house role), GrowCred, Sashe by Prachi, Vidhi Parmar, BrandGen. Live links are on the home page.', '',
              '## About Mehul Karotra', '', f'- UI/UX developer-designer from Mumbai working as an independent, contract-based partner. LinkedIn: {SAME[1]}', '',
              '## FAQ', '']
    lines += [f'- **{q}** {a}' for q, a in faq]
    return '\n'.join(lines) + '\n'

# ---------------------------------------------------------------- free tools
TOOL = dict(slug='google-review-qr-code',
  title='Free Google Review QR Code & Standee Maker | U Scale',
  desc='Make a free Google review QR code, a print-ready counter standee and WhatsApp review messages in English or Hinglish. No sign-up, nothing stored.',
  h1='Free Google review QR code & standee maker',
  lead='Paste your Google review link and get a QR code, a print-ready counter standee and ready-to-send WhatsApp messages, in English or Hinglish. Free, no sign-up, and nothing leaves your browser.',
  faq=[('Is this tool really free?','Yes. There is no sign-up and no watermark you have to pay to remove. Everything runs in your browser: your link and business name are never sent to a server.'),
       ('Where do I find my Google review link?','Search your business name on Google while signed in to the account that manages your Business Profile (or open business.google.com). Click Read reviews, then Get more reviews, and copy the link Google gives you.'),
       ('Can I offer a discount or gift for a Google review?','No. Google does not allow rewards, discounts or gifts in exchange for reviews, or asking only happy customers. Ask every customer for an honest review instead. This tool warns you if your wording looks like an incentive.'),
       ('What size should I print the QR code?','Keep the QR code at least 3 cm wide. The standee prints at A6 (10.5 x 14.8 cm) with the QR code about 4.3 cm wide, and the print option fits four standees on one A4 sheet.'),
       ('Will the QR code stop working?','No. It is a plain QR code of your own Google link, with no redirect through us, so it keeps working as long as your Google link does.'),
       ('Can I use the QR code on bills and packaging?','Yes. Download the QR code as PNG or SVG (best for printers) and add it to bills, bags, menus and visiting cards.')])

def tool_jsonld(site, t):
    url = f'{site}tools/{t["slug"]}'
    g = [{'@type': 'WebApplication', '@id': url + '#app', 'name': 'Google Review QR Code & Standee Maker', 'url': url, 'description': t['desc'],
          'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Any (runs in the browser)', 'isAccessibleForFree': True, 'inLanguage': 'en-IN',
          'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR'},
          'publisher': {'@type': 'Organization', 'name': 'U Scale', 'url': site}, 'creator': {'@type': 'Person', 'name': 'Mehul Karotra', 'url': site}},
         {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Free tools', 'item': url}, {'@type': 'ListItem', 'position': 3, 'name': 'Google review QR code maker', 'item': url}]},
         {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in t['faq']]}]
    return json.dumps({'@context': 'https://schema.org', '@graph': g}, ensure_ascii=False).replace('</', '<\\/')

def tool_page(ctx, parts, tv):
    site, v, t = ctx['SITE_URL'], ctx['_v'], TOOL
    header, menu, footer, tail = parts
    url = f'{site}tools/{t["slug"]}'
    og = f'{site}assets/tools/google-review-qr-og.png'
    swatches = ''.join(f'<button type="button" class="rq-sw" style="background:{c}" data-rq-accent="{c}" aria-pressed="false" aria-label="{n}"></button>'
                       for c, n in [('#63B849', 'Green'), ('#F59E0B', 'Saffron'), ('#B3123E', 'Maroon'), ('#1D4ED8', 'Royal blue'), ('#0F766E', 'Teal'), ('#111111', 'Black')])
    body = '''
  <div class="wrap hero-shell">
    <section class="sp-hero rq-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <img class="rq-hero__art" src="/assets/tools/standee-sample.webp" width="600" height="846" alt="" decoding="async" fetchpriority="low">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Free tools</li></ol></nav>
      <p class="eyebrow">Free tool</p>
      <h1 class="sp-hero__title" id="page-title">{h1}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{lead}</p>
      <div class="hero__cta"><a class="btn btn--go" href="#rq-start">Make my QR code <span class="arw" aria-hidden="true"><b>↓</b><b>↓</b></span></a></div>
    </section>
  </div>

  <section class="section rq" aria-labelledby="rq-title">
    <div class="wrap" data-rq>
      <h2 class="sr-only" id="rq-title">Make your review QR code and standee</h2>
      <p class="sr-only" id="rq-live" role="status" aria-live="polite"></p>
      <div class="rq__grid">
        <form class="rq-form" id="rq-start" onsubmit="return false" novalidate>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">1</span><label class="rq-step__title" for="rq-link">Paste your Google review link</label></p>
            <input class="rq-input" id="rq-link" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://g.page/r/your-link/review" aria-describedby="rq-link-hint rq-link-msg">
            <p class="rq-hint" id="rq-link-hint">Find it in your Google Business Profile: <b>Read reviews</b>, then <b>Get more reviews</b>. <a class="tlink" href="#rq-how">Step-by-step help</a></p>
            <p class="rq-msg" id="rq-link-msg" role="status"></p>
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">2</span><label class="rq-step__title" for="rq-name">Your business name</label></p>
            <input class="rq-input" id="rq-name" type="text" maxlength="40" autocomplete="organization" placeholder="Sharma Sarees">
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">3</span><span class="rq-step__title">Choose the wording</span></p>
            <div class="rq-row rq-row--2">
              <div><span class="rq-label" id="rq-lang-l">Language</span>
                <div class="rq-seg" role="radiogroup" aria-labelledby="rq-lang-l"><input type="radio" name="rq-lang" id="rq-lang-en" value="en"><label for="rq-lang-en">English</label><input type="radio" name="rq-lang" id="rq-lang-hi" value="hi"><label for="rq-lang-hi">Hinglish</label></div></div>
              <div><label class="rq-label" for="rq-head">Headline</label><select class="rq-select" id="rq-head"></select></div>
            </div>
            <div data-rq-custom hidden><label class="rq-label" for="rq-custom" style="margin-top:16px">Your headline</label><input class="rq-input" id="rq-custom" type="text" maxlength="60" placeholder="Thank you for visiting us!"></div>
            <p class="rq-policy" id="rq-policy" hidden>Careful: Google does not allow discounts, gifts or rewards for reviews, or asking only for 5 stars. Ask for an honest review instead.</p>
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">4</span><span class="rq-step__title">Pick a look</span></p>
            <div class="rq-row rq-row--2">
              <div><span class="rq-label" id="rq-theme-l">Background</span>
                <div class="rq-seg" role="radiogroup" aria-labelledby="rq-theme-l"><input type="radio" name="rq-theme" id="rq-theme-d" value="dark"><label for="rq-theme-d">Dark</label><input type="radio" name="rq-theme" id="rq-theme-l2" value="light"><label for="rq-theme-l2">Light</label></div></div>
              <div><span class="rq-label">Brand colour</span><div class="rq-swatches">{swatches}<label class="rq-color"><input type="color" id="rq-accent-custom" aria-label="Custom brand colour">Custom</label></div></div>
            </div>
            <label class="rq-check"><input type="checkbox" id="rq-credit"> Show a small &ldquo;Made free at uscale.in&rdquo; line</label>
          </div>
        </form>

        <aside class="rq-preview" aria-label="Preview and downloads">
          <canvas class="rq-canvas" id="rq-canvas" width="1240" height="1748" role="img" aria-label="Preview of your review standee"></canvas>
          <p class="rq-preview__cap">A6 counter standee (10.5 x 14.8 cm), print-ready at 300 dpi</p>
          <div class="rq-actions">
            <button type="button" class="btn btn--go rq-wide" id="rq-dl-standee" data-rq-need-link disabled>Download standee (PNG)</button>
            <button type="button" class="btn btn--ink rq-wide" id="rq-print" data-rq-need-link disabled>Print 4 on one A4 sheet</button>
            <button type="button" class="btn btn--line" id="rq-dl-png" data-rq-need-link disabled>QR code PNG</button>
            <button type="button" class="btn btn--line" id="rq-dl-svg" data-rq-need-link disabled>QR code SVG</button>
          </div>
          <a class="tlink rq-test" id="rq-test" href="#" target="_blank" rel="noopener" hidden>Test my review link</a>
          <p class="rq-private"><span aria-hidden="true">&#128274;</span><span>Private by design: your link and business name stay in this browser. Nothing is uploaded or stored by us.</span></p>
        </aside>
      </div>

      <div class="rq-block" id="rq-wa">
        <header class="sec-head"><p class="eyebrow">WhatsApp</p><h2 class="h2">Send your link on WhatsApp</h2>
          <p class="lead">Most reviews come from a polite message on the same day. Copy one, or send it straight from WhatsApp.</p></header>
        <div class="rq-msgs" data-rq-msgs></div>
      </div>
    </div>
  </section>

  <section class="section" id="rq-how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Your review link</p><h2 class="h2" id="how-title">Find your Google review link in a minute</h2></header>
      <ol class="rq-how">
        <li><b>Search your business name on Google</b> while signed in to the Google account that manages your Business Profile. Or open business.google.com.</li>
        <li>On your profile, click <b>Read reviews</b>, then <b>Get more reviews</b> (on some phones it says <b>Ask for reviews</b>).</li>
        <li><b>Copy the link</b> and paste it in step 1 above. It looks like g.page/r/&hellip;/review.</li>
      </ol>
      <p class="rq-note">Google explains this in its help page, <a class="tlink" href="https://support.google.com/business/answer/16816815?hl=en" target="_blank" rel="noopener">Create a Google link or QR code to request reviews</a>. Google can make a basic QR code too; this tool adds a print-ready standee and WhatsApp messages.</p>
    </div>
  </section>

  <section class="section" aria-labelledby="rules-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Stay inside the rules</p><h2 class="h2" id="rules-title">Ask every customer. Never pay for reviews.</h2></header>
      <div class="rq-rules">
        <div><h3>Do</h3><ul><li>Ask every customer for an honest review</li><li>Send your link on WhatsApp the same day</li><li>Put the QR code on the counter, bills and bags</li><li>Reply to every review, good or bad</li></ul></div>
        <div><h3>Don&rsquo;t</h3><ul><li>Offer discounts, gifts or cashback for reviews</li><li>Ask only happy customers, or ask for 5 stars</li><li>Set review targets for staff</li><li>Post reviews from family, staff or bought accounts</li></ul></div>
      </div>
      <p class="rq-note">Source: Google&rsquo;s <a class="tlink" href="https://support.google.com/contributionpolicy/answer/7400114?hl=en" target="_blank" rel="noopener">policy on fake engagement</a>. For a full 30-day plan, read <a class="tlink" href="/blog/how-to-get-more-google-reviews">how to get more Google reviews</a>.</p>
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Review QR code questions.</h2></header>
      <div class="faq__list" data-accordion>
{faq}
      </div>
    </div>
  </section>

  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <span class="grain" aria-hidden="true"></span>
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Want more customers from Google<span class="dot">.</span></h2>
          <p class="lead">I check your Google profile, reviews and website for free and send you the five fixes that matter most.</p>
          <div class="cta__btns"><a class="btn btn--go" href="/#contact">Get a free audit <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a><a class="btn btn--ghost" href="/services/seo-mumbai">Local SEO service</a></div>
        </div>
      </div>
    </div>
  </section>
'''
    body = (body.replace('{h1}', e(t['h1'])).replace('{lead}', e(t['lead'])).replace('{swatches}', swatches).replace('{faq}', faq_html(t['faq'])))
    return f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(t['title'])}</title>
<meta name="description" content="{ea(t['desc'])}">
<meta name="robots" content="{ctx['ROBOTS']}">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#FAF9FC">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en-IN" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(t['title'])}">
<meta property="og:description" content="{ea(t['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Free Google review QR code and counter standee maker by U Scale">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(t['title'])}">
<meta name="twitter:description" content="{ea(t['desc'])}">
<meta name="twitter:image" content="{og}">
{ctx['ICONS_HEAD']}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script type="application/ld+json">{tool_jsonld(site, t)}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
<link rel="stylesheet" href="/tool.css?v={tv}">
</head>
<body class="page-sub page-tool">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">{body}</main>
{footer}
{tail}
<div id="rq-print-sheet" aria-hidden="true"></div>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
<script defer src="/script.js?v={v}"></script>
<script defer src="/assets/vendor/qrcode-generator.min.js?v=1.4.4"></script>
<script defer src="/tool.js?v={tv}"></script>
</body>
</html>
'''

def build(ctx):
    site, out = ctx['SITE_URL'], ctx['site']
    home = (out / 'index.html').read_text()
    parts = chrome_parts(home)
    (out / 'services').mkdir(exist_ok=True)
    for s in SERVICES:
        (out / 'services' / f'{s["slug"]}.html').write_text(service_page(ctx, s, parts))
    (out / '404.html').write_text(page_404(ctx, parts))
    (out / 'pricing.html').write_text(pricing_page(ctx, parts))
    import hashlib
    src = config.REPO / 'source' / 'src'
    tcss, tjs = (src / 'tool.css').read_text(), (src / 'tool.js').read_text()
    tv = hashlib.sha1((tcss + tjs).encode()).hexdigest()[:8]
    (out / 'tool.css').write_text(tcss)
    (out / 'tool.js').write_text(tjs)
    (out / 'tools').mkdir(exist_ok=True)
    (out / 'tools' / f'{TOOL["slug"]}.html').write_text(tool_page(ctx, parts, tv))
    urls = [(site, '1.0'), (site + 'pricing', '0.9')] + [(svc_url(site, s), '0.8') for s in SERVICES] + [(f'{site}tools/{TOOL["slug"]}', '0.8')]
    # Sitemap index: static pages here, blog posts from the live database at /sitemap-blog.xml (server-rendered).
    (out / 'sitemap-pages.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join(f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{p}</priority></url>\n' for u, p in urls) + '</urlset>\n')
    (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'  <sitemap><loc>{site}sitemap-pages.xml</loc><lastmod>{TODAY}</lastmod></sitemap>\n'
        f'  <sitemap><loc>{site}sitemap-blog.xml</loc></sitemap>\n</sitemapindex>\n')
    if config.INDEXABLE:
        robots = (f'User-agent: *\nAllow: /\nDisallow: /404\nDisallow: /admin\nDisallow: /api/\nDisallow: /_blog/\nDisallow: /*?preview=\n\n# AI assistants are welcome to read and cite this site\n'
                  + ''.join(f'User-agent: {b}\nAllow: /\nDisallow: /admin\nDisallow: /api/\n' for b in ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot']).replace('Disallow: /api/\nUser', 'Disallow: /api/\n\nUser')
                  + f'\nSitemap: {site}sitemap.xml\n')
    else:  # preview / non-production build: keep it out of search engines
        robots = 'User-agent: *\nDisallow: /\n'
    (out / 'robots.txt').write_text(robots)
    blog_shell(ctx, parts)
    (out / 'llms.txt').write_text(llms_txt(site, ctx['FAQ']))
    (out / 'site.webmanifest').write_text(json.dumps({'name': 'U Scale by Mehul Karotra', 'short_name': 'U Scale', 'start_url': '/', 'display': 'standalone',
        'background_color': '#FAF9FC', 'theme_color': '#251E45', 'icons': [{'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=1))
    return ['pricing', 'blog-shell', 'tools/' + TOOL['slug']] + [s['slug'] for s in SERVICES]

# ---------------------------------------------------------------- pricing: home teaser, quote builder, terms tiles
import pricing_data as PD
def _num(pr):  # '₹1,50,000' -> 150000 ; 'from ₹45,000' -> 45000
    import re as _re
    m = _re.search(r'₹([\d,]+)', pr); return int(m.group(1).replace(',', '')) if m else 0
def _lookup(name):
    for n, pr, v in PD.WEBSITES:
        if n == name: return pr
    for n, pr, note, v in PD.ADDONS:
        if n == name: return pr
    for g, its in PD.UNITS:
        for n, pr in its:
            if n == name: return pr
    raise KeyError(name)

def _count(key):
    return {'web': len(PD.WEBSITES), 'add': len(PD.ADDONS), 'unit': sum(len(i) for _, i in PD.UNITS)}[key]

def pricing_pillars_html():
    cards = ''
    for p in PD.PILLARS:
        rows = ''.join(f'<li><span>{e(r)}</span><b>{e(_lookup(r))}</b></li>' for r in p['rows'])
        pop = p.get('pop')
        cards += (f'<li class="plan plan--pillar{" plan--pop" if pop else ""}" data-reveal>'
                  + (f'<span class="plan__badge">Where growth happens</span>' if pop else '')
                  + f'<p class="plan__kick">{e(p["kick"])}</p><h3 class="plan__name">{e(p["name"])}</h3><p class="plan__for">{e(p["lead"])}</p>'
                  + f'<p class="plan__price"><small>from</small><strong>₹{p["start"]}</strong><span>{e(p["unit"])}</span></p>'
                  + f'<ul class="plan__rows"{" aria-label=\"Monthly prices\"" if p["unit"] else ""}>{rows}</ul>'
                  + f'<a class="plan__all" href="/pricing#{p["step"]}">See all {_count(p["key"])} {e(p["noun"])} <span aria-hidden="true">→</span></a>'
                  + f'<a class="btn {"btn--go" if pop else "btn--ghost"}" href="/pricing#{p["step"]}"{" data-magnetic" if pop else ""}>{e(p["cta"])} <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a></li>')
    return f'<ul class="plans plans--pillars" data-reveal-group>{cards}</ul>'

def pricing_terms_strip_html():
    return ('<div class="pts" data-reveal>'
            '<div class="pts__pay"><p class="pts__k">How payment works</p><div class="pts__bar" aria-hidden="true"><span style="--w:20"><b>20%</b></span><span style="--w:20"><b>20%</b></span><span style="--w:60"><b>60%</b></span></div>'
            '<p class="pts__cap">To start · On design sign-off · At launch</p></div>'
            '<ul class="pts__facts"><li><b>Free audit</b><span>before every project</span></li><li><b>2–3 revisions</b><span>agreed in writing</span></li><li><b>No lock-ins</b><span>30 days notice on monthly work</span></li><li><b>14 days</b><span>every quote is valid</span></li></ul>'
            '<a class="btn btn--go pts__btn" href="/pricing#builder" data-magnetic>Open the quote builder <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>'
            '</div>')

def quote_builder_html(ICON_CHAT):
    web = '<label class="qb__opt"><input type="radio" name="qb-web" value="" checked data-name="" data-once="0"><span class="qb__card"><b>No website for now</b><em>₹0</em></span></label>'
    for n, pr, v in PD.WEBSITES:
        if n.startswith('Redesign') or n.startswith('Care plan'): continue
        frm = ' data-from="1"' if pr.startswith('from') else ''
        web += f'<label class="qb__opt"><input type="radio" name="qb-web" data-name="{ea(n)}" data-once="{v}"{frm}><span class="qb__card"><b>{e(n)}</b><em>{e(pr)}</em></span></label>'
    care = next(x for x in PD.WEBSITES if x[0].startswith('Care plan'))
    adds = ''
    for n, pr, note, v in PD.ADDONS:
        once = 10000 if n == 'Ads management' else (v if 'setup' in pr else 0)
        mo = 0 if 'setup' in pr else v
        extra = f'<small>{e(note)}</small>' if note else ''
        adds += (f'<label class="qb__opt qb__opt--add"><input type="checkbox" data-name="{ea(n)}" data-mo="{mo}" data-once="{once}"{" data-from=\"1\"" if n == "Ads management" else ""}>'
                 f'<span class="qb__card"><i class="qb__tick" aria-hidden="true"></i><b>{e(n)}</b><em>{e(pr)}</em>{extra}</span></label>')
    units = ''
    for g, items in PD.UNITS:
        rows = ''
        for n, pr in items:
            per = ' data-per="page"' if '/page' in pr else ''
            rows += (f'<div class="qb__unit" data-name="{ea(n)}" data-once="{_num(pr)}"{per}{" data-from=\"1\"" if pr.startswith("from") else ""}>'
                     f'<span class="qb__uname">{e(n)}<em>{e(pr)}</em></span>'
                     f'<span class="qb__qty"><button type="button" data-dec aria-label="One fewer: {ea(n)}">−</button><output aria-label="Quantity of {ea(n)}">0</output><button type="button" data-inc aria-label="Add one: {ea(n)}">+</button></span></div>')
        units += f'<div class="qb__ug"><h3>{e(g)}</h3>{rows}</div>'
    presets = ''.join(f'<button type="button" class="qb__preset" aria-pressed="false" data-preset="{ea(json.dumps(dict(web=p["web"], checks=p["checks"], units=p["units"]), ensure_ascii=False))}">{e(p["label"])}</button>' for p in PD.PRESETS)
    return f'''<div class="qb" id="builder" data-qb data-wa-zone>
  <div class="qb__presets"><p class="qb__plabel" id="qb-p-label">Not sure where to start? Try a common starting point:</p><div role="group" aria-labelledby="qb-p-label">{presets}</div></div>
  <div class="qb__steps">
    <fieldset class="qb__step" id="step-1">
      <legend><span class="qb__num">1</span><span>A website<small>One-time, fixed price after a free audit</small></span></legend>
      <div class="qb__opts qb__opts--web">{web}</div>
      <div class="qb__toggles">
        <label class="qb__switch"><input type="checkbox" data-redesign><span class="qb__sw" aria-hidden="true"></span><span>I already have a site. Redesign it <em>70% of a fresh build</em></span></label>
        <label class="qb__switch"><input type="checkbox" data-name="Care plan" data-mo="{care[2]}" data-once="0"><span class="qb__sw" aria-hidden="true"></span><span>Care plan: updates, backups, security <em>{e(care[1])}</em></span></label>
      </div>
      <p class="qb__fine">{e(PD.WEBSITES_NOTE)}</p>
    </fieldset>
    <fieldset class="qb__step" id="step-2">
      <legend><span class="qb__num">2</span><span>Monthly growth<small>Combine any of these. A 3-month sprint, then month-to-month with 30 days notice.</small></span></legend>
      <div class="qb__opts qb__opts--add">{adds}</div>
    </fieldset>
    <fieldset class="qb__step" id="step-3">
      <legend><span class="qb__num">3</span><span>One-off work<small>A single post, a reel, a logo: buy exactly what you need.</small></span></legend>
      <div class="qb__units">{units}</div>
    </fieldset>
  </div>
  <aside class="qb__receipt" aria-labelledby="qb-r-title">
    <div class="qb__paper">
      <p class="qb__rlabel" id="qb-r-title">Your estimate</p>
      <div class="qb__totals" aria-live="polite">
        <div><small>One-time</small><strong data-qb-once>₹0</strong></div>
        <div><small>Monthly</small><strong data-qb-mo>₹0</strong></div>
      </div>
      <ul class="qb__lines" data-qb-lines><li class="qb__empty">Nothing picked yet. Start with a website, a monthly service or a single piece of work.</li></ul>
      <div class="qb__split" data-qb-split hidden>
        <p>How the one-time amount is paid</p>
        <div class="qb__bar"><span style="--w:20"><b>20%</b></span><span style="--w:20"><b>20%</b></span><span style="--w:60"><b>60%</b></span></div>
        <ol><li><i></i><small>20% to start</small><b data-qb-p1>₹0</b></li><li><i></i><small>20% on design sign-off</small><b data-qb-p2>₹0</b></li><li><i></i><small>60% at launch</small><b data-qb-p3>₹0</b></li></ol>
      </div>
      <a class="btn btn--go qb__send" data-qb-send href="{ea(WA)}" target="_blank" rel="noopener">{ICON_CHAT}Send this to Mehul</a>
      <button class="qb__reset" type="button" data-qb-reset>Start over</button>
      <p class="qb__fine">An estimate, not a quote. Your fixed quote follows a free audit and stays valid for 14 days.</p>
    </div>
  </aside>
  <div class="qb__dock" data-qb-dock aria-hidden="true"><span><small>One-time</small><b data-qb-once2>₹0</b></span><span><small>Monthly</small><b data-qb-mo2>₹0</b></span><a href="#qb-r-title" tabindex="-1">Review</a></div>
</div>'''

def terms_html():
    t = PD.TERMS
    return f'''<div class="tt">
  <div class="tt__tile tt__tile--pay"><p class="tt__k">Payments</p><p class="tt__h">20 / 20 / 60</p>
    <div class="tt__bar" aria-hidden="true"><span style="--w:20"></span><span style="--w:20"></span><span style="--w:60"></span></div>
    <p>{e(t[0])}</p></div>
  <div class="tt__tile"><p class="tt__k">Revisions</p><p class="tt__h">2–3 rounds</p><p>{e(t[1])}</p></div>
  <div class="tt__tile"><p class="tt__k">Always included</p><p class="tt__h">The essentials</p><p>{e(t[2])}</p></div>
  <div class="tt__tile"><p class="tt__k">Retainers</p><p class="tt__h">No lock-ins</p><p>{e(t[3])}</p></div>
  <div class="tt__tile tt__tile--green"><p class="tt__k">Quotes</p><p class="tt__h">14 days</p><p>{e(t[4])}</p></div>
</div>'''

PRICING_FAQ_IDX = [1, 2, 3]  # website cost, marketing cost, contract vs retainer (indexes into the home FAQ)

def pricing_page(ctx, parts):
    site, v = ctx['SITE_URL'], ctx['_v']
    header, menu, footer, tail = parts
    url = site + 'pricing'
    title = 'Website & Digital Marketing Prices in Mumbai | U Scale'
    desc = 'Every price, published: websites from ₹25,000, monthly SEO, ads and social from ₹8,000, and one-off work from ₹800. Freelance web design in Mumbai.'
    faq = [ctx['FAQ'][i] for i in PRICING_FAQ_IDX]
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': site + '#business'}, 'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': TODAY},
        dict(offer_catalog(site), **{'@id': url + '#prices', 'provider': {'@type': 'ProfessionalService', '@id': site + '#business', 'name': 'U Scale by Mehul Karotra', 'url': site, 'telephone': PHONE}}),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site}, {'@type': 'ListItem', 'position': 2, 'name': 'Pricing', 'item': url}]},
        {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]},
    ]}, ensure_ascii=False, separators=(',', ':'))
    return f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{ea(desc)}">
<meta name="robots" content="{ctx['ROBOTS']}">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#FAF9FC">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en-IN" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(title)}">
<meta property="og:description" content="{ea(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="U Scale by Mehul Karotra: Be found. Be chosen.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(title)}">
<meta name="twitter:description" content="{ea(desc)}">
<meta name="twitter:image" content="{site}og-image.png">
{ctx['ICONS_HEAD']}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap">
<script type="application/ld+json">{ld}</script>
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
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Pricing</li></ol></nav>
      <h1 class="sp-hero__title" id="page-title">Pricing, published openly<span class="dot">.</span></h1>
      <p class="sp-hero__lead">Most agencies hide their prices behind a contact form. Here is everything I charge for web design and digital marketing in Mumbai, on one page: fixed-price websites, monthly growth services and single pieces of work.</p>
      <div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="{ea(WA)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Ask me for a quote</a>
        <a class="btn btn--ghost" href="#builder">Build your quote</a>
      </div>
      <p class="sp-hero__who">Quotes are valid for 14 days. Every website and every monthly service starts with a free audit, so you know exactly what you are paying for before you spend a rupee.</p>
    </section>
  </div>

  <section class="section qb-sec" aria-labelledby="qb-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Build your own</p>
        <h2 class="h2" id="qb-title" data-split>Pick what you need.</h2>
        <p class="lead" data-reveal>Every price I charge is in here. Tick what you need, watch your estimate add up, then send it to me in one tap. No sign-up, no sales call.</p>
      </header>
      {quote_builder_html(ctx['ICONS']['ICON_CHAT'])}
    </div>
  </section>

  <section class="section tt-sec" aria-labelledby="tt-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>The fine print</p>
        <h2 class="h2" id="tt-title" data-split>How working with me works.</h2>
        <p class="lead" data-reveal>Simple, written down, and the same for everyone.</p>
      </header>
      {terms_html()}
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>FAQ</p>
        <h2 class="h2" id="faq-title" data-split>Pricing questions.</h2>
      </header>
      <div class="faq__list" data-accordion data-reveal>
{faq_html(faq)}
      </div>
    </div>
  </section>

  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Not sure what you need<span class="dot">?</span></h2>
          <p class="lead">Tell me about your business and your budget. I will tell you honestly what to start with, even if it is the smallest thing on this page.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(WA)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{EMAIL}">Email {EMAIL}</a>
            <a class="btn btn--ghost" href="tel:+917977360142">Call {PHONE_D}</a>
          </div>
        </div>
      </div>
      <nav class="sp-more" aria-label="Services"><p class="eyebrow">Services</p><ul>{''.join(f'<li><a href="/services/{o["slug"]}">{e(o["name"])}</a></li>' for o in SERVICES)}</ul></nav>
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
