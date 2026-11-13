"""SEO layer for the U Scale site: home JSON-LD, service landing pages, sitemap, robots, llms.txt, 404, icons.
Called from build_site.py after the home page is assembled. Pure static output (standard library only).
URLs come from ctx['SITE_URL'], which build_site.py reads from the SITE_URL environment variable (config.py)."""
import json, re, html, sys, urllib.parse
import config


def wa_link(msg):
    """One-tap WhatsApp with the message already typed, so Mehul knows which page or tool the visitor came from."""
    return 'https://wa.me/917977360142?text=' + urllib.parse.quote(msg)

TODAY = config.BUILD_DATE
e = lambda t: html.escape(t, quote=False)
ea = lambda t: html.escape(t, quote=True)

ENTITY = json.loads((config.REPO / 'source' / 'entity.json').read_text())  # who U Scale is: see source/entity.json
PHONE, PHONE_D, EMAIL = ENTITY['phone'], ENTITY['phoneDisplay'], ENTITY['email']
WA = 'https://wa.me/917977360142?text=Hi%20Mehul%2C%20I%27d%20like%20to%20talk%20about%20my%20business.'

# ---------------------------------------------------------------- service pages
SERVICES = [
 dict(slug='website-design-mumbai', short='Website design', cta='website', name='Website Design & Development',
  title='Website Design & Development in Mumbai, from ₹25,000',
  desc='Website design in Mumbai with every price published and no hidden charges: landing page ₹25,000, business site ₹55,000, online store from ₹95,000.',
  h1='Website design & development in Mumbai',
  og='assets/pages/og-website-design-mumbai.jpg', og_alt='Website design and development in Mumbai by Mehul Karotra of U Scale: websites from ₹25,000, fixed price',
  lead='I design and build websites for Mumbai businesses: landing pages, 5–10 page business sites, online stores and restaurant ordering. Every page is designed in Figma and coded by hand, so what you approve is exactly what goes live, at a fixed price agreed before I start.',
  who='For cafés, restaurants, salons, boutiques, clinics, schools, studios and founders who need a site that looks premium, loads fast on a phone and turns visitors into WhatsApp chats, calls and enquiries.',
  items=[('Custom design, not templates','Your brand, your layout. Designed screen by screen in Figma before a line of code is written.'),
         ('Mobile-first build','Most of your visitors are on a phone, so the mobile version is designed first and tested on real devices.'),
         ('Fast on every phone','Lean code and compressed images, so pages load quickly even on a slow mobile connection and are built to pass Google’s speed checks (Core Web Vitals).'),
         ('Ready for Google from day one','Clear headings, page titles and descriptions, your business details marked up for Google, a sitemap, and Google Search Console (Google’s free report on how people find you) set up at launch.'),
         ('Easy ways to reach you','WhatsApp buttons, tap-to-call links and short forms placed right where people are ready to contact you, with form enquiries sent straight to your email.'),
         ('Hosting, domain and handover','I set up hosting and your domain, then hand over everything you own: code, logins and a short guide.')],
  steps=[('Audit','I review your current site or your competitors’ sites, and we agree on the goals, pages and must-haves.'),
         ('Design','You see real screens in Figma, desktop and mobile, and we refine them together.'),
         ('Build','I code the approved design, connect forms and analytics, and test on phones and browsers.'),
         ('Launch','Domain, hosting, Google Search Console and a final check. After launch, I fix any bugs free for 15–30 days.')],
  price='Landing pages ₹25,000, business sites from ₹55,000, restaurant sites with online ordering ₹90,000 and online stores from ₹95,000. A redesign of your current site costs 70% of a fresh build, and a care plan (updates, backups and security) is ₹3,500/month.',
  work=['spacestudio','tis','antrah','roar','sashe','vidhi'],
  faq=[('How much does a website cost in Mumbai?','It depends on the number of pages and features. I quote a fixed price after a free audit, so there are no surprises and no hourly billing.'),
       ('How long does it take to build a website?','A typical business website goes live in 3 to 4 weeks from kickoff. A landing page can be live in under two weeks.'),
       ('Do you use WordPress or templates?','I build custom sites with modern code, and use WordPress when you need to edit content often yourself. Either way the design is made for you, never a template.'),
       ('Will I own my website?','Yes. The domain, hosting account, code and design files are yours.'),
       ('Can you redesign my existing website?','Yes. I start with an audit of what works and what leaks enquiries, then redesign around that. A redesign costs 70% of a fresh build.')]),
 dict(slug='seo-mumbai', short='SEO', cta='SEO', name='SEO Services', cta_h='Let’s get you found on Google', wa="Hi Mehul, I'd like to talk about SEO for my business.",
  title='SEO Services & Packages in Mumbai, from ₹15,000 a Month',
  desc='SEO packages in Mumbai from a freelance SEO expert: local SEO and Google Maps ₹15,000 a month, technical SEO ₹25,000. No hidden charges, no ranking guarantees.',
  h1='SEO services in Mumbai',
  lead='I’m a freelance SEO consultant in Mumbai. I help your business show up when nearby customers search on Google and Google Maps. Local SEO, technical fixes and content, done personally, with honest monthly reporting.',
  who='For local businesses that depend on people searching "near me", and for service businesses that want steady enquiries without paying for every click.',
  items=[('Google Business Profile and Maps','Your Google Business Profile (the listing people see on Google Maps) set up and filled in properly: categories, photos, posts and a plan for getting more reviews in your area.'),
         ('Technical SEO','Slow pages, pages Google can’t find or read, problems on mobile, and missing business details in your site’s code, fixed at the source.'),
         ('On-page SEO','Titles, descriptions, headings and internal links written around what your customers actually search.'),
         ('Content people search for','Blog posts and service pages planned from keyword research, ₹2,000 per 1,000-word post.'),
         ('Directory listings and links','Consistent listings across Indian directories and genuine local links, no spammy shortcuts.'),
         ('A clear monthly report','Rankings, traffic, calls and enquiries, and what I am doing next.')],
  steps=[('Audit','A full SEO audit of your site, Google Business Profile and top local competitors.'),
         ('Fix','Technical and on-page issues fixed first, because they unlock everything else.'),
         ('Grow','New content, reviews, listings and links added month by month.'),
         ('Report','Monthly report and call. Honest about what moved and what did not.')],
  price='Local SEO and Google Business Profile ₹15,000/month, technical + on-page SEO ₹25,000/month; take one or both. Your first check is free; a full deep-dive SEO audit is ₹7,500, or free if we go on to work together.',
  related='<p class="sp-price" data-reveal><strong>Local SEO near you.</strong> Website design and local SEO for businesses in <a class="tlink" href="/services/website-design-mumbai/ghatkopar">Ghatkopar</a> and <a class="tlink" href="/services/website-design-mumbai/andheri-east">Andheri East</a>.</p>',
  work=['tis','antrah','sashe'],
  faq=[('How long does SEO take to show results?','Honest answer: usually 3 to 6 months before you see real progress. Be careful of anyone who promises page one in 30 days. I show you what has moved every month.'),
       ('What is local SEO?','Local SEO is making sure your business shows up when people nearby search for what you sell, in Google Maps, the top three map results on Google, and “near me” searches. Google says it ranks local results on relevance, distance and prominence. In practice the work is: a complete, verified Google Business Profile with the right primary category, the same name, address and phone on your website and directories, steady genuine reviews with replies, and service pages that name your area. You can check your own listing free with the Google Business Profile checker. Step by step: How to get more Google reviews in 2026 and Why is my business not showing on Google Maps?'),
       ('Do you guarantee first-page rankings?','No one can honestly guarantee rankings. I guarantee the work, the transparency and a clear report of results every month.'),
       ('Do I need a new website for SEO?','Not always. I start by auditing your current site; if it can be fixed, I fix it.')]),
 dict(slug='social-media-management-mumbai', short='Social media', cta='social media', name='Social Media Management',
  title='Social Media Marketing in Mumbai: Packages and Prices',
  desc='Social media marketing packages in Mumbai, priced by the piece: posts from ₹800, reel edits from ₹2,500, inbox care ₹12,000 a month. No hidden charges.',
  h1='Social media marketing in Mumbai',
  lead='Consistent, on-brand social media without you chasing anyone. As your freelance social media manager, I plan, design and post your content on Instagram, Facebook, LinkedIn and YouTube, and keep the focus on bringing you enquiries.',
  who='For businesses that know they should post regularly but never find the time, and for brands that want their feed to look as good as their product.',
  items=[('Monthly content calendar','A clear plan of posts, reels and stories, approved by you before anything goes live.'),
         ('Designed posts and carousels','On-brand creatives designed for your audience: ₹800 a post, ₹1,500 a carousel.'),
         ('Reels and short video','Reels and YouTube Shorts, edited to suit each platform.'),
         ('Posting and scheduling','Everything published at the right times, so your feed stays active without you.'),
         ('Engagement','Comments and DMs monitored and answered in your voice, with leads passed straight to you.'),
         ('Monthly insights','Reach, followers, saves and enquiries, and what I’ll change next month.')],
  steps=[('Audit','I review your profiles, competitors and what your customers respond to.'),
         ('Plan','A content calendar and visual direction for the month.'),
         ('Create','Posts, carousels and reels designed and edited.'),
         ('Post and improve','I publish, reply to comments, track what works and improve it every month.')],
  price='Community & inbox management is ₹12,000/month. Content is priced per piece: posts ₹800, carousels ₹1,500, reel edits ₹2,500, and a half-day shoot with 3 reels ₹15,000.',
  work=['brandgen','vidhi','sashe'],
  faq=[('Which platforms do you manage?','Instagram, Facebook, LinkedIn and YouTube. I recommend focusing on the two where your customers actually spend time.'),
       ('Do I have to approve every post?','You approve the monthly calendar and can review any post before it goes out.'),
       ('Do you shoot photos and videos?','I design and edit content. When a project needs a shoot, I bring in a trusted photographer and stay your single point of contact.'),
       ('How soon will I see results on social media?','Expect to judge it over about three months of steady posting; I show you reach, saves and enquiries every month so you can see the trend.')]),
 dict(slug='google-meta-ads-mumbai', short='Google & Meta ads', cta='Google and Meta ads', name='Google & Meta Ads Management', cta_h='Let’s plan your ads', wa="Hi Mehul, I'd like to talk about running ads for my business.",
  title='Google & Meta Ads Management in Mumbai from ₹20,000/mo',
  desc='Google Ads and Facebook/Instagram ads for Mumbai businesses, including click-to-WhatsApp. ₹20,000 a month up to ₹1.5 lakh spend. You own the accounts.',
  h1='Google & Meta ads management in Mumbai',
  lead='Ads can put you in front of people searching for what you sell from the day they go live. I set up and manage Google Search ads, Performance Max (Google’s automatic ads across Search, YouTube, Maps and more) and Facebook and Instagram ads, including click-to-WhatsApp ads that open a chat with you in one tap.',
  who='For businesses that need enquiries now, while SEO and social build up, and for launches, offers and seasonal pushes.',
  items=[('Google Search ads','Ads shown to people in your area who are searching for what you sell, with careful keyword choices so you don’t pay for the wrong searches.'),
         ('Meta ads (Facebook & Instagram)','Audience targeting, creatives and copy tested to find what actually brings enquiries.'),
         ('Click-to-WhatsApp campaigns','Ads that open a WhatsApp chat with you, so people can ask their question in the app they already use.'),
         ('Landing pages made for the ad','A focused page that matches each ad, so people who click find what they came for instead of leaving straight away.'),
         ('Tracking set up properly','GA4, conversion tracking and the Meta pixel installed, so you can see which ads bring enquiries.'),
         ('Weekly optimisation','Budgets, bids, keywords and creatives adjusted weekly, with a clear monthly report.')],
  steps=[('Audit','Your goals, budget, offers and competitors reviewed.'),
         ('Set up','Tracking, campaigns, audiences, creatives and landing page built.'),
         ('Launch','Ads go live with a test budget, watched closely in week one.'),
         ('Optimise','Weekly improvements and a clear monthly report.')],
  price='Ads management is ₹20,000/month flat up to ₹1.5 lakh of monthly ad spend, then 12% of spend, plus a one-time ₹10,000 setup. Ad spend is paid directly to Google and Meta, so you always see it.',
  work=['brandgen','roar'],
  faq=[('How much should I spend on ads in Mumbai?','It depends on your industry and goal. I recommend a test budget first, then scale what works. Ad spend goes directly to Google and Meta.'),
       ('What are click-to-WhatsApp ads?','Facebook and Instagram ads that open a WhatsApp chat with your business instead of a website, ideal for customers who would rather chat than fill in a form or call.'),
       ('Google Ads or Meta ads, which is better?','Google catches people who are already searching; Meta reaches people nearby who are not searching yet. Many local businesses use both.'),
       ('Will I see where my money goes?','Yes. You own the ad accounts and get a monthly report showing spend, leads and cost per lead.')]),
 dict(slug='ai-search-visibility', short='AI search', cta='AI search visibility', name='AI Search Visibility (GEO)', cta_h='Let’s see what AI says about you', wa="Hi Mehul, I'd like to check what ChatGPT and Google say about my business.",
  title='AI Search Visibility Services in India (GEO & AI SEO)',
  desc='See what ChatGPT, Gemini and Google AI tell customers about your business, then fix the facts they use. ₹2,500 audit or ₹12,000 a month. No mention guaranteed.',
  h1='AI SEO and AI search visibility (GEO)',
  lead="When someone asks ChatGPT, Gemini or Google’s AI to recommend a business like yours, are you mentioned, and is what they say correct? This is what people call AI SEO, GEO or AEO. I check what AI tools say about you today, then correct the facts, listings and pages they draw on, and help you earn genuine reviews. No one can guarantee a mention; I show you what changed every month.",
  who='For local businesses whose customers already ask AI assistants for recommendations, and who want those answers to get their name, services, prices and area right.',
  items=[('AI visibility audit','I test how ChatGPT, Gemini, Perplexity and Google’s AI answers describe your business and your competitors today.'),
         ('Facts that match everywhere','Your name, area, services, prices and timings written plainly on your website and kept identical on your Google Business Profile and directories. I also add them to your site’s code in a format Google and AI tools read easily (called schema markup).'),
         ('Answer-ready content','Clear service pages and FAQs written in the way people ask AI assistants questions.'),
         ('Your site is readable by AI tools','I check that your website’s settings, hosting and security don’t block Google or AI tools from reading your pages. Google says its AI features need no special files.'),
         ('Mentions and reviews','Your business listed the same way across the web, with genuine reviews and mentions that AI answers draw on.'),
         ('Monitoring','Regular checks of what AI tools say about you, and fixes to your pages and listings where they get it wrong.')],
  steps=[('Audit','What AI assistants say about you and your competitors today.'),
         ('Fix the basics','Your facts, listings and website settings put right, so AI tools can read and trust them.'),
         ('Content','Answer-ready pages and FAQs that AI tools can quote.'),
         ('Monitor','Ongoing checks and improvements as AI search changes.')],
  price='AI search visibility is ₹12,000/month, on its own or alongside other services. Your first check is free; a full AI visibility audit is ₹2,500, or free if we go on to work together.',
  work=['brandgen','growcred','vidhi'],
  faq=[('What is GEO (generative engine optimisation)?','GEO is work that helps AI assistants like ChatGPT, Gemini and Perplexity find accurate, consistent facts about your business, so they are more likely to mention it correctly when someone asks for a recommendation.'),
       ('Is AI search replacing Google?','Not replacing, adding to it. More people now ask AI tools for recommendations, so it pays to show up in both.'),
       ('Can you guarantee ChatGPT will recommend me?','No one controls AI answers. I improve the information they rely on and track how often and how accurately you appear.'),
       ('Does this help normal SEO too?','Mostly it is the same work: clear pages, accurate facts, a complete Google Business Profile and genuine reviews. Google says its AI features have no extra requirements beyond normal SEO, so AI visibility work builds on SEO rather than replacing it.')]),
]

def svc_url(site, s): return f'{site}services/{s["slug"]}'

def work_meta(w):
    """Work-card caption. A concept project says so up front, using the same wall_tag the home page shows."""
    return f'{w[8]} project · {w[2]}' if w[8] == 'Concept' else w[2]

# ---------------------------------------------------------------- JSON-LD
def offer_catalog(site):
    """Every published price as schema.org Offers, so search engines and AI tools can quote them accurately."""
    def svc(name, slug=None):
        d = {'@type': 'Service', 'name': name, 'areaServed': __import__('aeo').place('Mumbai'), 'provider': {'@id': site + '#business'}}
        if slug: d['url'] = f'{site}services/{slug}'
        return d
    def offer(name, price, monthly=False, desc=None, minimum=False, slug=None, per_page=False):
        o = {'@type': 'Offer', 'name': name, 'itemOffered': svc(name, slug), 'priceCurrency': 'INR', 'url': site + 'pricing'}
        if price is not None:
            spec = {'@type': 'UnitPriceSpecification', 'priceCurrency': 'INR'}
            spec['minPrice' if minimum else 'price'] = price
            if monthly:
                import aeo
                spec.update(aeo.MONTHLY)
            elif per_page:
                import aeo
                spec.update(aeo.PER_PAGE)
            o['priceSpecification'] = spec
            if not minimum: o['price'] = price
        if desc: o['description'] = desc
        return o
    items = [offer(n, v, monthly=('/mo' in pr), minimum=pr.startswith('from'), slug='website-design-mumbai') for n, pr, v in PD.WEBSITES if v]
    items += [offer(n, v, monthly=('/mo' in pr), desc=note) for n, pr, note, v in PD.ADDONS]
    items += [offer(n, _num(pr), minimum=pr.startswith('from'), per_page='/page' in pr) for g, its in PD.UNITS for n, pr in its]
    return {'@type': 'OfferCatalog', 'name': 'Web design and digital marketing price list', 'url': site + 'pricing', 'itemListElement': items}

def home_jsonld(site, faq):
    import aeo
    # The full price list is marked up on /pricing, where every price is on screen; the home page only shows some of them,
    # so the business points at that catalogue by @id instead of repeating 32 offers that aren't visible here.
    biz = aeo.biz_full(site, {'@type': 'OfferCatalog', '@id': site + 'pricing#prices', 'name': 'U Scale price list', 'url': site + 'pricing'})
    desc = re.search(r'<meta name="description" content="([^"]+)"', (config.REPO / 'source' / 'src' / 'index.src.html').read_text(encoding='utf-8')).group(1)
    person = aeo.person_full(site)
    website = dict(aeo.website_ref(site), description=desc)
    page = {'@type': 'WebPage', '@id': site + '#webpage', 'url': site, 'name': 'Website Design, SEO & Social Media in Mumbai | U Scale',
            'description': desc, 'isPartOf': {'@id': site + '#website'}, 'about': {'@id': site + '#business'},
            'primaryImageOfPage': {'@type': 'ImageObject', '@id': site + '#og-image', 'url': site + 'og-image.png', 'contentUrl': site + 'og-image.png',
                                   'width': 1200, 'height': 630, 'caption': 'U Scale by Mehul Karotra: web design and digital marketing in Mumbai'},
            'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__'}
    faqp = {'@type': 'FAQPage', '@id': site + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}
    return json.dumps({'@context': 'https://schema.org', '@graph': [website, page, biz, person, faqp]}, ensure_ascii=False, separators=(',', ':'))

def service_jsonld(site, s):
    import aeo
    url = svc_url(site, s)
    imgs = []
    if s['slug'] == 'website-design-mumbai':
        GP = __import__('geo_pages')
        for i, k in enumerate(['salon', 'step-audit', 'step-plan', 'step-design', 'step-launch', 'mehul']):
            img = GP.IMG[k]
            imgs.append({'@type': 'ImageObject', '@id': f'{url}#image-{i + 1}', 'url': site + img['file'][1:] + '.webp', 'contentUrl': site + img['file'][1:] + '.webp',
                         'width': img['w'], 'height': img['h'], 'caption': img['caption'], 'description': img['alt'], 'inLanguage': 'en-IN',
                         'encodingFormat': 'image/webp', 'representativeOfPage': i == 0})
    pic = {'primaryImageOfPage': {'@id': imgs[0]['@id']}} if imgs else {}
    return json.dumps({'@context': 'https://schema.org', '@graph': imgs + [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': s['title'], 'description': s['desc'], 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': url + '#service'}, 'mainEntity': {'@id': url + '#service'}, 'author': {'@id': site + '#mehul'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__', **pic},
        {'@type': 'Service', '@id': url + '#service', 'name': s['name'], 'serviceType': s['name'], 'url': url, 'description': s['answer'],
         'provider': {'@id': site + '#business'}, 'areaServed': aeo.area_served(),
         'offers': aeo.offers_ld(site, s['offers']), **({'image': {'@id': imgs[0]['@id']}} if imgs else {})},
        aeo.biz_ref(site), aeo.person_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': site + 'services'},
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

# FAQ answers stay plain text (JSON-LD, llms-full.txt); on the page, these exact phrases become links.
# Blog posts already scheduled in the CMS. Links to them appear from the day after each one goes live; a build before
# that leaves the phrase as plain text, so a deploy never links to a post that isn't published yet.
POST_LIVE = {'/blog/google-business-profile-verification': '2026-11-11', '/blog/dpdp-compliance-checklist-small-business': '2026-11-12',
             '/blog/instagram-algorithm-2026': '2026-11-13', '/blog/seo-cost-in-india': '2026-11-14'}


def live(href):
    return TODAY >= POST_LIVE.get(href, '')


def post_link(href, text):
    """A link to a blog post, or the same words as plain text while the post is still scheduled."""
    return f'<a class="tlink" href="{ea(href)}">{e(text)}</a>' if live(href) else e(text)


FAQ_LINKS = {
    'freelancer vs agency vs website builder': '/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder',
    'website design cost guide': '/blog/website-design-cost-mumbai',
    'website cost calculator': '/tools/website-cost-calculator',
    'website design in Thane': '/services/website-design-thane',
    'website design in Navi Mumbai': '/services/website-design-navi-mumbai',
    'hire me as a freelance web designer': '/freelance-web-designer-mumbai',
    'website design across India': '/services/website-design-india',
    'digital marketing in Mumbai': '/services/digital-marketing-mumbai',
    'Google Business Profile management': '/services/google-business-profile-mumbai',
    'online store page': '/services/ecommerce-website-mumbai',
    'SEO cost in India (2026)': '/blog/seo-cost-in-india',
    'Google Business Profile verification guide': '/blog/google-business-profile-verification',
    'DPDP checklist for small business websites': '/blog/dpdp-compliance-checklist-small-business',
    'How to get more Google reviews in 2026': '/blog/how-to-get-more-google-reviews',
    'Why is my business not showing on Google Maps?': '/blog/business-not-showing-on-google-maps',
    'Google Business Profile checker': '/tools/google-business-profile-checker',
    'How to get your business recommended by ChatGPT and Google AI Mode': '/blog/get-business-recommended-chatgpt-google-ai-mode',
    'Your Instagram posts now show up on Google': '/blog/instagram-posts-google-search-seo',
}

def _faq_answer(a):
    h = e(a)
    for phrase, href in FAQ_LINKS.items():
        if live(href):
            h = h.replace(e(phrase), f'<a class="tlink" href="{href}">{e(phrase)}</a>', 1)
    return h

def faq_html(items, start=0):
    out = []
    for i, (q, a) in enumerate(items):
        n = start + i
        out.append(f'<div class="qa{" is-open" if i == 0 else ""}"><h3><button class="qa__btn" type="button" id="q{n}" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="a{n}">'
                   f'<span class="qa__n" aria-hidden="true">{i+1:02d}</span><span>{e(q)}</span><span class="qa__icon" aria-hidden="true"></span></button></h3>'
                   f'<div class="qa__panel" id="a{n}" role="region" aria-labelledby="q{n}"><div><p>{_faq_answer(a)}</p></div></div></div>')
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
                     f'<span class="rw__body"><img class="rw__logo" src="/assets/logos/{k}.webp" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async"><b>{e(w[1])}</b><small>{e(work_meta(w))}</small></span><span class="sr-only"> (opens in a new tab)</span></a></li>')
    others = ''.join(f'<li><a href="/services/{o["slug"]}">{e(o["name"])}</a></li>' for o in SERVICES if o is not s)
    items = ''.join(f'<li class="svc" data-reveal><span class="svc__n" aria-hidden="true">{i+1:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d) in enumerate(s['items']))
    steps = ''.join(f'<li class="step" data-reveal><span class="step__num" aria-hidden="true" data-n="{i+1}">{i+1:02d}</span><h3><span class="sr-only">Step {i+1}: </span>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d) in enumerate(s['steps']))
    wa = 'https://wa.me/917977360142?text=' + __import__('urllib.parse').parse.quote(s.get('wa') or f"Hi Mehul, I'd like to talk about my {s['cta']}.")
    cta_h = s.get('cta_h') or 'Let’s talk about your ' + s['cta']
    # Website design: the hero gets a product shot (demo salon site) like its focus pages; other services stay text-only.
    GP = __import__('geo_pages') if s['slug'] == 'website-design-mumbai' else None
    art = GP.hero_img('salon') if GP else ''
    # Website design: the area pages' process with pictures, then who you'll work with, instead of a repeated list of steps.
    how_html = (GP._how({}) + GP._who(dict(kind='parent'))) if GP else f'''  <section class="section process sp-process" aria-labelledby="how-title">
    <div class="wrap">
      <header class="proc__head">
        <p class="eyebrow" data-reveal data-scramble>How it works</p>
        <h2 class="h2" id="how-title" data-split>Four clear steps.</h2>
      </header>
      <ol class="steps" data-progress="steps" data-reveal-group>{steps}</ol>
    </div>
  </section>'''
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
<meta property="og:image" content="{site}{s.get('og', 'og-image.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{ea(s.get('og_alt', 'U Scale by Mehul Karotra: Be found. Be chosen.'))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(s['title'])}">
<meta name="twitter:description" content="{ea(s['desc'])}">
<meta name="twitter:image" content="{site}{s.get('og', 'og-image.png')}">
{ctx['ICONS_HEAD']}
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{service_jsonld(site, s)}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
</head>
<body class="page-sub">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
  <div class="wrap hero-shell">
    <section class="sp-hero{' fp-hero fp-hero--parent' if art else ''} on-dark" data-tone="dark" aria-labelledby="page-title">{'<div class="fp-hero__copy">' if art else ''}
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li aria-current="page">{e(s['name'])}</li></ol></nav>
      <h1 class="sp-hero__title{' fp-hero__title' if art else ''}" id="page-title">{e(s['h1'])}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{GP.lead_html(s['lead']) if GP else e(s['lead'])}</p>
      <div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="#contact" data-magnetic>Get a free audit <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>
        <a class="btn btn--ghost" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Chat on WhatsApp</a>
      </div>
      <p class="sp-hero__who">{e(s['who'])}</p>{'</div>' + art if art else ''}
    </section>
  </div>
{__import__('aeo').brief_html(s['answer'], s['facts'], 'Key facts: ' + s['name'], 'brief-title', fold=3 if art else 0)}

  <section class="section" aria-labelledby="inc-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>What's included</p>
        <h2 class="h2" id="inc-title" data-split>Website design services, handled by one person.</h2>
        <p class="lead" data-reveal>You work directly with me, Mehul Karotra. No account managers, no middlemen.</p>
      </header>
      <ul class="bento sp-grid" data-reveal-group>{items}</ul>
    </div>
  </section>
{GP._sections(dict(sections=GP.parent_sections())) if GP else ''}
{how_html}

  <section class="section" aria-labelledby="work-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Selected work</p>
        {'<h2 class="h2" id="work-title" data-split>Sites I designed and built.</h2>' if s['slug'] == 'website-design-mumbai' else
         '<h2 class="h2" id="work-title" data-split>Websites I&rsquo;ve built.</h2><p class="lead" data-reveal>U Scale started in 2026, so most of my work so far is websites. Here are a few.</p>'}
      </header>
      <ul class="rw-grid" data-reveal-group>{''.join(cards)}</ul>
      <p class="sp-price" data-reveal><strong>Pricing.</strong> {e(s['price'])} <a class="tlink" href="/pricing">See every price</a></p>
      {s.get('related', '')}
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
        
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">{e(cta_h)}<span class="dot">.</span></h2>
          <p class="lead">Tell me what you need. I reply within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{EMAIL}">Email me</a>
            <a class="btn btn--ghost" href="tel:+917977360142">Call {PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {EMAIL}</p>
        </div>
      </div>
      <nav class="sp-more" aria-label="Other services"><p class="eyebrow">Other services</p><ul>{others}</ul></nav>
    </div>
  </section>
</main>
{footer}
{tail}
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
<title>Page not found | U Scale</title><meta name="robots" content="noindex">
{ctx['ICONS_HEAD']}
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js','intro-skip');</script>
<link rel="stylesheet" href="/styles.css?v={v}"></head>
<body class="page-sub"><a class="skip" href="#main">Skip to content</a>{header}{menu}
<main id="main"><div class="wrap hero-shell"><section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
<p class="eyebrow">Error 404</p><h1 class="sp-hero__title" id="page-title">Page not found<span class="dot">.</span></h1>
<p class="sp-hero__lead">This page doesn't exist or has moved. Try the home page, or one of my services below.</p>
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
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
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
<script defer src="/script.js?v={v}"></script>
<script defer src="/blog.js?v={bv}"></script>
</body>
</html>
''')

def llms_txt(site, faq, updated=TODAY):
    # llmstxt.org shape: H1, blockquote summary, plain details (no headings), then H2 sections that are only lists of
    # "- [name](url): note" links, with "## Optional" last for what an AI tool can skip. Long prose lives in llms-full.txt.
    pr_ = site + 'pricing'
    lines = ['# U Scale by Mehul Karotra', '',
             '> Freelance web design, development and digital marketing in Mumbai, India. U Scale is Mehul Karotra, a website designer and developer who designs and builds websites and runs SEO, social media, Google and Meta ads and AI search visibility for businesses, personally, on fixed-price contracts or monthly plans. An independent alternative to a digital marketing agency.', '',
             f'- Contact: WhatsApp/phone {PHONE_D}, email {EMAIL}', f'- Based in: {ENTITY["base"]}, Maharashtra, India (meets clients across Mumbai, Thane and Navi Mumbai; works with businesses across India remotely)',
             '- Languages: the site is in English, with some guides in Hinglish (Hindi written in Roman script); enquiries are answered in English or Hindi',
             f'- Last updated: {updated}', '',
             '## Main pages', '',
             f'- [Home]({site}): U Scale by Mehul Karotra, freelance web design and digital marketing in Mumbai',
             f'- [About Mehul Karotra]({site}about): website designer and developer from Mumbai and founder of U Scale, working as an independent, contract-based partner',
             f'- [All services and prices]({site}services)', f'- [Full price list]({pr_})',
             f'- [Blog]({site}blog): guides on websites, SEO, social media, ads and AI search',
             f'- [Full text of every page for AI tools]({site}llms-full.txt)', '',
             '## Pricing (INR)', '',
             f'- [Websites (one-time, fixed price)]({pr_}): ' + ' · '.join(f'{PD.label(n)} {pr}' for n, pr, _ in PD.WEBSITES) + f'. {PD.WEBSITES_NOTE}',
             f'- [Monthly services (combine any)]({pr_}): ' + ' · '.join(f'{n} {pr}' + (f' ({note})' if note else '') for n, pr, note, _ in PD.ADDONS)]
    lines += [f'- [Unit prices: {g}]({pr_}): ' + ' · '.join(f'{n} {pr}' for n, pr in items) for g, items in PD.UNITS]
    lines += [f'- [Terms]({pr_}): ' + ' '.join(PD.TERMS)]
    lines += ['', '## Services', '']
    lines += [f'- [{s["name"]}]({svc_url(site, s)}): {s["desc"]}' for s in SERVICES]
    import geo_pages
    lines += geo_pages.llms_lines(site)
    import city_pages
    lines += city_pages.llms_lines(site)
    import growth_pages
    lines += growth_pages.llms_lines(site)
    lines += ['', '## Free tools', '',
              f'- [Google Business Profile checker]({site}tools/google-business-profile-checker): a score out of 100 with a fix list and review goal (runs in the browser, no sign-up)',
              f'- [Google review QR code and counter standee maker]({site}tools/google-review-qr-code): runs in the browser, no sign-up',
              f'- [Free visiting card and business card maker]({site}tools/visiting-card-maker): editable designs, with PNG, SVG and print PDF downloads, in English, Hindi or Marathi (runs in the browser, no sign-up, no watermark)',
              f'- [Free QR code generator]({site}tools/qr-code-generator): links, contacts, WhatsApp, UPI and Wi-Fi, with your own shapes, colours and logo, and PNG, SVG and PDF downloads. Codes never expire (runs in the browser, no sign-up)',
              f'- [Website cost calculator]({site}tools/website-cost-calculator): an estimate from U Scale’s published prices, with market ranges from 16 price guides and yearly costs (runs in the browser, no sign-up)',
              f'- [All free tools]({site}tools)', '',
              '## Work', '', f'- [Selected work]({site}#work): TIS Admissions (concept), Antrah Wellness, Roar Arena, My Country Mobile (in-house role), Callmama (in-house role), GrowCred, Sashe by Prachi, Vidhi Parmar, BrandGen. Live links are on the home page.', '',
              '## About Mehul Karotra', '', f'- [Profile]({site}about): website designer and developer from Mumbai and founder of U Scale, working as an independent, contract-based partner']
    lines += [f'- [{"LinkedIn" if "linkedin.com" in u else "GitHub" if "github.com" in u else "Portfolio"}]({u}): Mehul Karotra' for u in ENTITY['founder']['sameAs']]
    lines += ['', '## Sister company', '', '- [Apex36 Technologies](https://www.apex36tech.com/): a separate software and AI studio in Mumbai, run independently. U Scale does websites and marketing; Apex36 builds custom software and AI products.', '',
              '## FAQ', '']
    lines += [f'- [{q}]({site}#faq): {a}' for q, a in faq]
    lines += ['', '## Optional', '', f'- [Blog RSS feed]({site}blog/rss.xml): the latest blog posts',
              f'- [Blog sitemap]({site}sitemap-blog.xml): every published blog URL']
    return '\n'.join(lines) + '\n'

# ---------------------------------------------------------------- free tools
TOOL = dict(slug='google-review-qr-code',
  title='Google Review QR Code Maker: Free, With Printable Standee',
  desc='Find your Google review link in 30 seconds, even without owner access, then download a QR code, a printable standee and WhatsApp messages. Free, no sign-up.',
  h1='Free Google review link & QR code maker',
  lead='Find your Google review link in 30 seconds, even if you don\u2019t manage the Google profile. Then download a QR code, a counter standee in 6 designs and ready WhatsApp messages in English, Hinglish, Hindi or Marathi. Free, no sign-up.',
  faq=[('What is a Google review link?','It is a link that opens the "write a review" box for your business on Google, so customers can leave a review in one tap instead of searching for you first.'),
       ('How do I get my Google review link if I don\u2019t manage the Google profile?','Open Google Maps, search your business, tap Share and then Copy link. Paste that link into this tool. It finds your business and turns it into a direct review link, no owner access needed. This works for staff, family members and agencies too.'),
       ('Where do business owners find the review link?','On a computer, open business.google.com (or search your business name on Google while signed in), click Read reviews, then Get more reviews, and copy the link. It looks like g.page/r/\u2026/review.'),
       ('Is this tool really free?','Yes. There is no sign-up and nothing to pay to remove. Your business name, logo and wording stay in your browser. Only a short Google Maps link is checked once on the U Scale server to find your business, and nothing is stored.'),
       ('Can I offer a discount or gift for a Google review?','No. Google does not allow rewards, discounts or gifts in exchange for reviews, or asking only happy customers. Ask every customer for an honest review instead. This tool warns you if your wording looks like an incentive.'),
       ('What size should I print the QR code?','Keep the QR code at least 3 cm wide. The A6 standee prints with the QR code about 4 cm wide (4 per A4 sheet), the square table sticker prints 6 per A4 sheet, the A5 wall poster prints one per A4 sheet, and the WhatsApp Status size is for sharing on your phone.'),
       ('Can I make the review standee in Hindi or Marathi?','Yes. Under “Choose the wording”, pick English, Hinglish, हिंदी or मराठी. The headline, the line under it and the three WhatsApp messages change to that language, and Hindi and Marathi print in proper Devanagari letters. You can also write your own headline in any language.'),
       ('Will the QR code stop working?','No. It is a plain QR code of your Google review link, with no redirect through uscale.in, so it keeps working as long as your business is on Google.'),
       ('Can I add my logo and brand colours?','Yes. Upload your logo, pick one of 10 colour themes or your own brand colour, and choose from 6 designs: Classic, Split, Card, Festive, Minimal and Bold.')])

def tool_jsonld(site, t):
    url = f'{site}tools/{t["slug"]}'
    # Service, not WebApplication: Google's Software App result wants ratings or reviews, which a free tool doesn't have.
    g = [{'@type': 'ImageObject', '@id': url + '#image-1', 'url': site + 'assets/tools/standee-sample.webp', 'contentUrl': site + 'assets/tools/standee-sample.webp',
          'width': 600, 'height': 846, 'caption': 'A sample Google review QR code standee made with the free U Scale tool', 'description': 'Sample Google review standee made with this free tool: Sharma Sarees, Loved shopping with us? Scan to leave a Google review, with the QR code and five stars',
          'inLanguage': 'en-IN', 'encodingFormat': 'image/webp', 'representativeOfPage': True},
         {'@type': 'Service', '@id': url + '#app', 'name': 'Google Review Link & QR Code Maker', 'url': url, 'description': t['desc'], 'image': {'@id': url + '#image-1'},
          'serviceType': 'Free online tool', 'category': 'Local SEO tools', 'provider': {'@id': site + '#business'}, 'areaServed': {'@type': 'Country', 'name': 'India'},
          'availableChannel': {'@type': 'ServiceChannel', 'serviceUrl': url, 'availableLanguage': 'English'},
          'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR', 'url': url}},
         {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': t['title'], 'description': t['desc'], 'isPartOf': {'@id': site + '#website'},
          'mainEntity': {'@id': url + '#app'}, 'author': {'@id': site + '#mehul'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__',
          'primaryImageOfPage': {'@id': url + '#image-1'}},
         __import__('aeo').biz_ref(site), __import__('aeo').person_ref(site),
         {'@type': 'HowTo', 'name': 'How to get your Google review link without owner access', 'totalTime': 'PT1M',
          'step': [{'@type': 'HowToStep', 'position': i + 1, 'name': n, 'text': re.sub(r'<[^>]+>', '', x)} for i, (n, x) in enumerate(RQ_STEPS)]},
         {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Free tools', 'item': site + 'tools'}, {'@type': 'ListItem', 'position': 3, 'name': 'Google review link & QR code maker', 'item': url}]},
         {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity':[{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in t['faq']]}]
    return json.dumps({'@context': 'https://schema.org', '@graph': g}, ensure_ascii=False).replace('</', '<\\/')

F = 'font-family="Inter,Arial,sans-serif"'
INK, MUT, GRN, BLU = '#1F1F1F', '#5F6368', '#1E8E3E', '#0B57D0'

def _t(x, y, txt, size=12, w=500, fill=INK, anchor='start'):
    return f'<text x="{x}" y="{y}" {F} font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}">{txt}</text>'

def _tap(x, y):
    """Pointing hand with its fingertip at (x, y); the hand sits below-right so the target stays readable."""
    return (f'<circle cx="{x}" cy="{y}" r="7" fill="{GRN}" opacity=".35"/>'
            f'<g transform="translate({x - 20} {y - 9.5}) scale(1.75)"><path d="M18.84 15.87l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" fill="#fff" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/></g>')

def _pin(x, y, s=1, c='#EA4335'):
    return f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0c-6.6 0-12 5.2-12 11.6C-12 20.4 0 32 0 32s12-11.6 12-20.4C12 5.2 6.6 0 0 0z" fill="{c}"/><circle cy="11.5" r="4.6" fill="#fff"/></g>'

def _stars(x, y, n=5, size=9):
    st = 'M0-5l1.5 3.1 3.4.5-2.5 2.4.6 3.4L0 3.8-3 5.4l.6-3.4L-4.9-.4l3.4-.5z'
    return ''.join(f'<path transform="translate({x + i * size * 1.15} {y}) scale({size / 10})" d="{st}" fill="#F9AB00"/>' for i in range(n))

def _phone(uid, inner):
    return (f'<svg viewBox="0 0 200 372" class="rq-gphone" aria-hidden="true" focusable="false"><defs><clipPath id="sc{uid}"><rect x="9" y="9" width="182" height="354" rx="24"/></clipPath>'
            f'<filter id="sh{uid}" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".14"/></filter></defs>'
            f'<rect x="1" y="1" width="198" height="370" rx="32" fill="#1D1930"/><rect x="9" y="9" width="182" height="354" rx="24" fill="#fff"/>'
            f'<g clip-path="url(#sc{uid})">{inner}</g><rect x="80" y="15" width="40" height="9" rx="4.5" fill="#1D1930"/></svg>')

def _map(y0=0):
    roads = ''.join([f'<path d="M-10 {y0+60} L210 {y0+120}" stroke="#fff" stroke-width="12"/>', f'<path d="M70 {y0-10} L110 {y0+380}" stroke="#fff" stroke-width="12"/>',
                     f'<path d="M-10 {y0+230} L210 {y0+200}" stroke="#fff" stroke-width="10"/>', f'<path d="M160 {y0-10} L140 {y0+380}" stroke="#FDE293" stroke-width="9"/>'])
    return (f'<rect x="0" y="{y0}" width="200" height="380" fill="#EEF1F4"/><rect x="18" y="{y0+130}" width="44" height="54" rx="6" fill="#D4EBD0"/>'
            f'<rect x="120" y="{y0+250}" width="56" height="60" rx="6" fill="#D4EBD0"/><rect x="118" y="{y0+20}" width="60" height="40" rx="6" fill="#E3DFF0"/>{roads}')

# The four "get your review link" steps shown on the QR tool page; the page's HowTo markup reads the same list.
RQ_STEPS = [('Search your business', 'Open the <b>Google Maps</b> app, type your shop name, tap it.'),
            ('Tap Share', 'On your business page, tap the <b>Share</b> button.'),
            ('Tap Copy link', 'In the menu that pops up, tap <b>Copy link</b>.'),
            ('Paste it here', 'Come back here, press and hold the box in step 1, tap <b>Paste</b>.')]

def tool_guides():
    # 1. Search and tap the business
    s1 = _map(0) + _pin(150, 250, .8) + _pin(40, 300, .7) + (
        f'<rect x="16" y="34" width="168" height="38" rx="19" fill="#fff" filter="url(#sh1)"/>'
        f'<circle cx="35" cy="52" r="6" fill="none" stroke="{MUT}" stroke-width="2.2"/><path d="M39.5 56.5l4.5 4.5" stroke="{MUT}" stroke-width="2.2" stroke-linecap="round"/>'
        + _t(52, 57, 'Sharma Sarees', 13.5, 600) + f'<rect x="146" y="44" width="1.8" height="17" fill="{BLU}"/>'
        f'<rect x="16" y="80" width="168" height="128" rx="14" fill="#fff" filter="url(#sh1)"/>'
        f'<rect x="22" y="86" width="156" height="44" rx="10" fill="#E6F4EA"/>' + _pin(38, 95, .62)
        + _t(54, 105, 'Sharma Sarees', 12.5, 700) + _t(54, 121, 'Saree shop · Andheri E', 10, 500, MUT)
        + ''.join(_pin(38, 141 + i * 32, .55, '#9AA0A6') + _t(54, 151 + i * 32, n, 11.5, 500, '#3C4043') + _t(54, 164 + i * 32, sub, 9, 400, MUT)
                  for i, (n, sub) in enumerate([('Sharma Sweets', 'Sweet shop · 2 km'), ('Sharma Hardware', 'Hardware store · 3 km')]))
        + f'<rect x="22" y="86" width="156" height="44" rx="10" fill="none" stroke="{GRN}" stroke-width="2"/>' + _tap(160, 126))
    # 2. Business page, tap Share
    chips = [('Directions', 68, True), ('Save', 44, False), ('Share', 52, False)]
    cx, chip_svg = 16, ''
    for label, w, filled in chips:
        chip_svg += (f'<rect x="{cx}" y="214" width="{w}" height="30" rx="15" fill="{BLU if filled else "#fff"}" stroke="{"none" if filled else "#C4C7C5"}" stroke-width="1.2"/>'
                     + _t(cx + w / 2, 233.5, label, 11, 600, '#fff' if filled else BLU, 'middle'))
        cx += w + 5
    share_x = 16 + 68 + 5 + 44 + 5
    s2 = (f'<rect x="0" y="0" width="200" height="120" fill="#C77B4A"/><rect x="100" y="0" width="100" height="120" fill="#8E3B5A"/>'
          f'<path d="M0 85 Q50 60 100 88 T200 80 V120 H0z" fill="#E9B04D" opacity=".85"/><path d="M118 20 l14 70 M150 14 l10 80" stroke="#F3D38A" stroke-width="5" opacity=".7"/>'
          f'<rect x="0" y="112" width="200" height="260" rx="18" fill="#fff"/><rect x="88" y="119" width="24" height="4" rx="2" fill="#DADCE0"/>'
          + _t(16, 152, 'Sharma Sarees', 17, 700) + _t(16, 172, '4.5', 11, 600, '#3C4043') + _stars(41, 168.5, 5, 9.5)
          + _t(102, 172, '(212)', 10.5, 500, MUT) + _t(16, 192, 'Saree shop · ', 10.5, 500, MUT) + _t(81, 192, 'Open', 10.5, 600, GRN)
          + chip_svg + ''.join(f'<rect x="16" y="{266 + i * 22}" width="{168 - i * 40}" height="9" rx="4.5" fill="#EEF0F2"/>' for i in range(4))
          + f'<rect x="{share_x - 1.5}" y="212.5" width="55" height="33" rx="16.5" fill="none" stroke="{GRN}" stroke-width="2.5"/>' + _tap(share_x + 40, 242))
    # 3. Share sheet, tap Copy link
    s3 = (f'<rect x="0" y="0" width="200" height="372" fill="#fff"/>' + _t(16, 60, 'Sharma Sarees', 16, 700) + _stars(20, 78, 5, 9)
          + f'<rect x="0" y="0" width="200" height="372" fill="#000" opacity=".42"/>'
          f'<rect x="40" y="104" width="120" height="30" rx="15" fill="#303134"/>' + _t(100, 123.5, '✓ Link copied', 11, 600, '#fff', 'middle')
          + f'<rect x="0" y="152" width="200" height="220" rx="20" fill="#fff"/><rect x="88" y="159" width="24" height="4" rx="2" fill="#DADCE0"/>'
          + _t(16, 188, 'Share', 15, 700)
          + f'<rect x="16" y="198" width="38" height="38" rx="8" fill="#C77B4A"/><rect x="35" y="198" width="19" height="38" rx="0" fill="#8E3B5A"/>'
          + _t(62, 214, 'Sharma Sarees', 11.5, 700) + _t(62, 229, 'maps.app.goo.gl/…', 10, 500, MUT)
          + f'<rect x="16" y="248" width="168" height="40" rx="12" fill="#E6F4EA" stroke="{GRN}" stroke-width="2"/>'
          + f'<g transform="translate(30 259)" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"><path d="M7 11l4-4"/><path d="M5.5 8.5l-1.6 1.6a3 3 0 0 0 4.2 4.2l1.6-1.6"/><path d="M12.5 9.5l1.6-1.6a3 3 0 0 0-4.2-4.2L8.3 5.3"/></g>'
          + _t(56, 273, 'Copy link', 13, 700)
          + ''.join(f'<circle cx="{36 + i * 44}" cy="{318}" r="15" fill="{c}"/>' + _t(36 + i * 44, 347, n, 8.5, 500, MUT, 'middle')
                    for i, (c, n) in enumerate([('#25D366', 'WhatsApp'), ('#E8F0FE', 'Messages'), ('#FCE8E6', 'Email'), ('#F1F3F4', 'More')]))
          + _tap(162, 284))
    # 4. Paste into the tool and download
    qr = ''.join(f'<rect x="{84 + (i % 6) * 5.4}" y="{226 + (i // 6) * 5.4}" width="5" height="5" fill="#000"/>' for i in [0,1,2,4,5,6,8,11,13,14,16,19,21,23,24,25,27,29,30,31,33,34,35])
    s4 = (f'<rect x="0" y="0" width="200" height="372" fill="#FAF9FC"/><rect x="14" y="32" width="172" height="24" rx="12" fill="#ECE7F5"/>'
          + _t(100, 48.5, 'uscale.in/tools', 10.5, 600, '#4A4458', 'middle')
          + f'<circle cx="25" cy="80" r="9" fill="#251E45"/>' + _t(25, 84, '1', 10, 700, '#fff', 'middle') + _t(40, 84.5, 'Paste your link', 12.5, 700, '#251E45')
          + f'<rect x="100" y="94" width="52" height="24" rx="8" fill="#303134"/><path d="M122 118l4 5 4-5z" fill="#303134"/>' + _t(126, 110.5, 'Paste', 11, 600, '#fff', 'middle')
          + f'<rect x="14" y="126" width="172" height="36" rx="10" fill="#fff" stroke="{GRN}" stroke-width="2.2"/>' + _t(24, 149, 'maps.app.goo.gl/x7Kq…', 11.5, 500)
          + _t(16, 182, '✓ Found: Sharma Sarees', 11, 700, GRN)
          + f'<rect x="66" y="194" width="68" height="94" rx="7" fill="#2C2454"/><rect x="78" y="220" width="44" height="44" rx="4" fill="#fff"/>{qr}'
          + _t(100, 211, 'LOVED IT?', 8.5, 800, '#fff', 'middle') + ''.join(f'<circle cx="{88 + i * 6}" cy="276" r="1.8" fill="#FBBC04"/>' for i in range(5))
          + f'<rect x="30" y="304" width="140" height="36" rx="18" fill="#63B849"/>' + _t(100, 327, 'Download', 13, 700, '#1D1930', 'middle')
          + f'<rect x="28" y="302" width="144" height="40" rx="20" fill="none" stroke="{GRN}" stroke-width="2.5" opacity=".6"/>' + _tap(150, 338))
    steps = [(t, d, svg) for (t, d), svg in zip(RQ_STEPS, [s1, s2, s3, s4])]
    return ''.join(f'<li class="rq-gs"><div class="rq-gs__hd"><span class="rq-gs__n" aria-hidden="true">{i + 1}</span><p><b class="rq-gs__t">{t}</b><span>{d}</span></p></div>'
                   f'{_phone(i + 1, svg)}</li>' for i, (t, d, svg) in enumerate(steps))

def tool_page(ctx, parts, tv):
    site, v, t = ctx['SITE_URL'], ctx['_v'], TOOL
    header, menu, footer, tail = parts
    url = f'{site}tools/{t["slug"]}'
    og = f'{site}assets/tools/google-review-qr-og.png'
    themes = [('midnight', 'Midnight', '#2C2454', '#16102C'), ('sunset', 'Sunset', '#FF6B3D', '#C81E63'), ('ocean', 'Ocean', '#1652D8', '#0B7F86'), ('forest', 'Forest', '#17663A', '#0A3520'),
              ('royal', 'Royal', '#5B21B6', '#9D1279'), ('charcoal', 'Charcoal', '#262B36', '#0D1016'), ('paper', 'Paper', '#FFFFFF', '#F5F0E6'), ('mint', 'Mint', '#F4FCF7', '#D9F3E3'),
              ('blush', 'Blush', '#FFF7F9', '#FBDDE6'), ('sky', 'Sky', '#F4F8FF', '#D8E6FF')]
    swatches = ''.join(f'<button type="button" class="rq-sw" style="background:linear-gradient(135deg,{c1},{c2})" data-rq-theme="{k}" aria-pressed="false" aria-label="{n} colours" title="{n}"></button>' for k, n, c1, c2 in themes)
    tpls = ''.join(f'<button type="button" class="rq-tpl" data-rq-tpl="{k}" aria-pressed="false" aria-label="{n}"><canvas aria-hidden="true"></canvas><span>{n}</span></button>'
                   for k, n in [('classic', 'Classic'), ('split', 'Split'), ('card', 'Card'), ('festive', 'Festive'), ('minimal', 'Minimal'), ('bold', 'Bold')])
    formats = ''.join(f'<button type="button" class="rq-fmt" data-rq-format="{k}" aria-pressed="false"><i class="rq-fmt__i rq-fmt__i--{k}" aria-hidden="true"></i><b>{n}</b><small>{d}</small></button>'
                      for k, n, d in [('a6', 'Counter standee', 'A6 \u00b7 4 per A4'), ('square', 'Table sticker', 'Square \u00b7 6 per A4'), ('story', 'WhatsApp Status', 'Phone \u00b7 1080\u00d71920'), ('a5', 'Wall poster', 'A5 \u00b7 1 per A4')])
    body = '''
  <div class="wrap hero-shell">
    <section class="sp-hero rq-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <img class="rq-hero__art" src="/assets/tools/standee-sample.webp" width="600" height="846" alt="Sample Google review standee made with this free tool: Sharma Sarees, Loved shopping with us? Scan to leave a Google review, with the QR code and five stars" decoding="async" fetchpriority="low">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/tools">Free tools</a></li><li aria-current="page">Google review link &amp; QR code maker</li></ol></nav>
      <p class="eyebrow">Free tool</p>
      <h1 class="sp-hero__title" id="page-title">{h1}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{lead}</p>
      <div class="hero__cta"><a class="btn btn--go" href="#rq-start">Make my QR code <span class="arw" aria-hidden="true"><b>↓</b><b>↓</b></span></a><a class="btn btn--ghost" href="#rq-find">How to find my review link</a></div>
    </section>
  </div>

  <section class="section rq" aria-labelledby="rq-title">
    <div class="wrap" data-rq>
      <h2 class="sr-only" id="rq-title">Make your review QR code and standee</h2>
      <p class="sr-only" id="rq-live" role="status" aria-live="polite"></p>
      <div class="rq__grid">
        <form class="rq-form" id="rq-start" onsubmit="return false" novalidate>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">1</span><label class="rq-step__title" for="rq-link">Paste your Google Maps or review link</label></p>
            <input class="rq-input" id="rq-link" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Paste your Google Maps link" aria-describedby="rq-link-hint rq-link-msg">
            <p class="rq-hint" id="rq-link-hint">Any of these work: a Google Maps share link (maps.app.goo.gl/&hellip;), a Google Maps page link, or the owner&rsquo;s review link (g.page/r/&hellip;/review).</p>
            <p class="rq-msg" id="rq-link-msg" role="status"></p>
            <details class="rq-find" id="rq-find">
              <summary>Don&rsquo;t have the link? Get it in 30 seconds</summary>
              <div class="rq-tabs" role="tablist" aria-label="How to get the link">
                <button type="button" role="tab" id="rq-tab-maps" aria-controls="rq-pane-maps" aria-selected="true" data-rq-tab>From Google Maps <small>Anyone &middot; easiest</small></button>
                <button type="button" role="tab" id="rq-tab-owner" aria-controls="rq-pane-owner" aria-selected="false" tabindex="-1" data-rq-tab>From my Business Profile <small>Owners &amp; managers</small></button>
              </div>
              <div class="rq-pane" id="rq-pane-maps" role="tabpanel" aria-labelledby="rq-tab-maps">
                <p class="rq-pane__lead">No login or owner access needed. Works for shop staff, family members and agencies too.</p>
                <ol class="rq-guide">{guides}</ol>
                <p class="rq-pane__pc"><b>On a computer?</b> Open <a class="tlink" href="https://www.google.com/maps" target="_blank" rel="noopener">Google Maps</a>, search your business, click it, then click <b>Share</b> &rarr; <b>Copy link</b>. Or simply copy the address from the browser bar once your business is open.</p>
                <a class="btn btn--line rq-btn-sm" href="https://www.google.com/maps" target="_blank" rel="noopener">Open Google Maps</a>
              </div>
              <div class="rq-pane" id="rq-pane-owner" role="tabpanel" aria-labelledby="rq-tab-owner" hidden>
                <ol class="rq-olist">
                  <li>On a computer, open <a class="tlink" href="https://business.google.com/" target="_blank" rel="noopener">business.google.com</a> and sign in with the Google account that manages your business. (Or search your business name on Google while signed in.)</li>
                  <li>Click <b>Read reviews</b>, then <b>Get more reviews</b>.</li>
                  <li>Click <b>Copy</b>. The link looks like <code>g.page/r/&hellip;/review</code>. Paste it in step 1.</li>
                </ol>
                <p class="rq-pane__note">On a phone, the Google Maps method is quicker and gives the same review box. Google&rsquo;s own help page: <a class="tlink" href="https://support.google.com/business/answer/16816815?hl=en" target="_blank" rel="noopener">Create a Google link or QR code to request reviews</a>.</p>
              </div>
            </details>
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">2</span><label class="rq-step__title" for="rq-name">Your business name</label></p>
            <input class="rq-input" id="rq-name" type="text" maxlength="40" autocomplete="organization" placeholder="Sharma Sarees">
            <div class="rq-logo"><label class="btn btn--line rq-btn-sm" for="rq-logo">Add your logo (optional)</label><input class="sr-only" id="rq-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><button type="button" class="tlink rq-linkbtn" id="rq-logo-clear" hidden>Remove logo</button></div>
            <div class="rq-logo-opts" id="rq-logo-opts" hidden>
              <div><span class="rq-label" id="rq-ls-l">Logo size</span>
                <div class="rq-seg" role="radiogroup" aria-labelledby="rq-ls-l"><input type="radio" name="rq-logo-size" id="rq-ls-s" value="s"><label for="rq-ls-s">Small</label><input type="radio" name="rq-logo-size" id="rq-ls-m" value="m"><label for="rq-ls-m">Medium</label><input type="radio" name="rq-logo-size" id="rq-ls-l2" value="l"><label for="rq-ls-l2">Large</label></div></div>
              <label class="rq-check"><input type="checkbox" id="rq-logo-plate" checked> White box behind the logo <small>(switch it off for a white or light logo on a dark design)</small></label>
            </div>
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">3</span><span class="rq-step__title">Choose the wording</span></p>
            <div class="rq-row rq-row--2">
              <div><span class="rq-label" id="rq-lang-l">Language</span>
                <div class="rq-seg" role="radiogroup" aria-labelledby="rq-lang-l"><input type="radio" name="rq-lang" id="rq-lang-en" value="en"><label for="rq-lang-en">English</label><input type="radio" name="rq-lang" id="rq-lang-hi" value="hi"><label for="rq-lang-hi">Hinglish</label><input type="radio" name="rq-lang" id="rq-lang-dv" value="dv"><label for="rq-lang-dv" lang="hi">हिंदी</label><input type="radio" name="rq-lang" id="rq-lang-mr" value="mr"><label for="rq-lang-mr" lang="mr">मराठी</label></div></div>
              <div><label class="rq-label" for="rq-head">Headline</label><select class="rq-select" id="rq-head"></select></div>
            </div>
            <div data-rq-custom hidden><label class="rq-label" for="rq-custom" style="margin-top:16px">Your headline</label><input class="rq-input" id="rq-custom" type="text" maxlength="60" placeholder="Thank you for visiting us!"></div>
            <p class="rq-policy" id="rq-policy" hidden>Careful: Google does not allow discounts, gifts or rewards for reviews, or asking only for 5 stars. Ask for an honest review instead.</p>
          </div>
          <div class="rq-step">
            <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">4</span><span class="rq-step__title">Design it</span></p>
            <span class="rq-label">Size</span>
            <div class="rq-fmts">{formats}</div>
            <span class="rq-label rq-mt">Design</span>
            <div class="rq-tpls">{tpls}</div>
            <span class="rq-label rq-mt">Colours</span>
            <div class="rq-swatches">{swatches}<label class="rq-color"><input type="color" id="rq-accent-custom" aria-label="Your brand colour">My brand colour</label><button type="button" class="tlink rq-linkbtn" id="rq-accent-reset" hidden>Reset</button></div>
            <label class="rq-check"><input type="checkbox" id="rq-credit"> Show a small &ldquo;Made with uscale.in/tools&rdquo; line</label>
          </div>
        </form>

        <aside class="rq-preview" aria-label="Preview and downloads">
          <canvas class="rq-canvas" id="rq-canvas" width="1240" height="1748" role="img" aria-label="Preview of your review standee"></canvas>
          <p class="rq-preview__cap" id="rq-cap">A6 counter standee (10.5 × 14.8 cm), print-ready at 300 dpi</p>
          <div class="rq-actions">
            <button type="button" class="btn btn--go rq-wide" id="rq-dl-standee" data-rq-need-link disabled>Download design (PNG)</button>
            <button type="button" class="btn btn--ink rq-wide" id="rq-print" data-rq-need-link disabled>Print 4 on one A4 sheet</button>
            <button type="button" class="btn btn--line" id="rq-dl-png" data-rq-need-link disabled>QR code PNG</button>
            <button type="button" class="btn btn--line" id="rq-dl-svg" data-rq-need-link disabled>QR code SVG</button>
          </div>
          <a class="tlink rq-test" id="rq-test" href="#" target="_blank" rel="noopener" hidden>Test my review link</a>
          <p class="rq-private"><span aria-hidden="true">&#128274;</span><span>Private by design: your name, logo and wording stay in this browser. A short Maps link is only checked once to find your business, and nothing is stored.</span></p>
        </aside>
      </div>

      <div class="rq-block" id="rq-wa">
        <header class="sec-head"><p class="eyebrow">WhatsApp</p><h2 class="h2">Send your link on WhatsApp</h2>
          <p class="lead">The simplest way to get a review is a polite message on the same day. Copy one, or send it straight from WhatsApp.</p></header>
        <div class="rq-msgs" data-rq-msgs></div>
      </div>
    </div>
  </section>

{brief}
  <section class="section" id="rq-how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Your review link</p><h2 class="h2" id="how-title">3 ways to get your Google review link</h2>
        <p class="lead">A Google review link opens the &ldquo;write a review&rdquo; box for your business in one tap. Pick whichever way is easiest for you.</p></header>
      <div class="rq-ways">
        <article><span class="rq-ways__n">1</span><h3>From Google Maps (anyone)</h3><p>Open Google Maps, search your business, tap <b>Share</b>, then <b>Copy link</b>, and paste it in this tool. It finds your business and builds the direct review link for you. No owner access needed.</p></article>
        <article><span class="rq-ways__n">2</span><h3>From your Business Profile (owners)</h3><p>On a computer, open business.google.com, click <b>Read reviews</b>, then <b>Get more reviews</b>, and copy the <code>g.page/r/&hellip;/review</code> link.</p></article>
        <article><span class="rq-ways__n">3</span><h3>From a Place ID (advanced)</h3><p>If you already know your Google Place ID (it starts with <code>ChIJ</code>), paste it in step 1 and the tool builds the review link from it.</p></article>
      </div>
      <p class="rq-note">Google&rsquo;s help page explains the owner method: <a class="tlink" href="https://support.google.com/business/answer/16816815?hl=en" target="_blank" rel="noopener">Create a Google link or QR code to request reviews</a>. Google makes a basic QR code on a computer only; this tool works on any phone and adds printable designs and WhatsApp messages.</p>
    </div>
  </section>

  <section class="section" aria-labelledby="rules-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Stay inside the rules</p><h2 class="h2" id="rules-title">Ask every customer. Never pay for reviews.</h2></header>
      <div class="rq-rules">
        <div><h3>Do</h3><ul><li>Ask every customer for an honest review</li><li>Send your link on WhatsApp the same day</li><li>Put the QR code on the counter, bills and bags</li><li>Reply to every review, good or bad</li></ul></div>
        <div><h3>Don&rsquo;t</h3><ul><li>Offer discounts, gifts or cashback for reviews</li><li>Ask only happy customers, or ask for 5 stars</li><li>Post reviews from family, staff or bought accounts</li></ul></div>
      </div>
      <p class="rq-note">Source: Google&rsquo;s <a class="tlink" href="https://support.google.com/contributionpolicy/answer/7400114?hl=en" target="_blank" rel="noopener">policy on fake engagement</a>. For a full 30-day plan, read <a class="tlink" href="/blog/how-to-get-more-google-reviews">how to get more Google reviews</a>.</p>
      <p class="rq-note"><strong>My advice</strong> (not a Google rule): don&rsquo;t set review targets for staff.</p>
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

  <section class="section" aria-labelledby="more-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">More free tools</p><h2 class="h2" id="more-title">Check your Google profile next, or make any QR code</h2></header>
      <div class="th-grid">{more}</div>
    </div>
  </section>

  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Want more customers from Google<span class="dot">?</span></h2>
          <p class="lead">I check your Google profile, reviews and website for free and send you the five fixes that matter most.</p>
          <div class="cta__btns" data-wa-zone><a class="btn btn--go" href="{wa_qr}" target="_blank" rel="noopener" data-magnetic>{icon_chat}Chat on WhatsApp</a><a class="btn btn--ghost" href="/services/seo-mumbai">Local SEO service</a></div>
        </div>
      </div>
    </div>
  </section>
'''
    body = (body.replace('{brief}', __import__('aeo').brief_html(QR_ANSWER, QR_FACTS, 'Key facts: Google review QR code maker', 'rq-brief'))
            .replace('{h1}', e(t['h1'])).replace('{lead}', e(t['lead'])).replace('{swatches}', swatches).replace('{tpls}', tpls).replace('{formats}', formats).replace('{guides}', tool_guides()).replace('{faq}', faq_html(t['faq'])).replace('{more}', _tool_card('gp') + _tool_card('qrgen'))
            .replace('{wa_qr}', ea(wa_link('Hi Mehul, I made my Google review QR code on uscale.in. Can you help me get more Google reviews?'))).replace('{icon_chat}', ctx['ICONS']['ICON_CHAT']))
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
<meta property="og:image:alt" content="Free Google review link and QR code maker by U Scale">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(t['title'])}">
<meta name="twitter:description" content="{ea(t['desc'])}">
<meta name="twitter:image" content="{og}">
{ctx['ICONS_HEAD']}
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{tool_jsonld(site, t)}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
<link rel="stylesheet" href="/tool.css?v={tv}">
</head>
<body class="page-sub page-tool page-rq">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">{body}</main>
{footer}
{tail}
<div id="rq-print-sheet" aria-hidden="true"></div>
<script defer src="/script.js?v={v}"></script>
<script defer src="/assets/vendor/qrcode-generator.min.js?v=1.4.4"></script>
<script defer src="/tool.js?v={tv}"></script>
</body>
</html>
'''

# ---------------------------------------------------------------- Google Business Profile checker + /tools hub
GBP = dict(slug='google-business-profile-checker',
  title='Check Your Google Listing Free: Score Out of 100 in 2 Min',
  desc='Free Google Business Profile (GMB) checker: a score out of 100, your top fixes and a review goal, in about 2 minutes. No sign-up. English or Hinglish.',
  h1='Free Google Business Profile checker',
  lead='See how your shop looks on Google in about 2 minutes: your live listing, a score out of 100, a real website speed test, the fixes most likely to bring customers, and how many reviews you need to beat the shop next door. Free, no sign-up, English or Hinglish.',
  faq=[('Is this a GMB checker?', 'Yes. Google renamed “Google My Business” (GMB) to “Google Business Profile” in November 2021, so this checks the same '
                                     'listing: the one that shows your business on Google Search and Maps. If you want the listing managed for you, see '
                                     'Google Business Profile management.'),
       ('Is this an official Google score?', 'No. Google doesn’t publish a score. This checker is U Scale’s checklist, built on what Google says improves local ranking (verify your business, keep information complete and accurate, respond to reviews, add photos) and on the gaps I most often find when I check local listings.'),
       ('Do I need to be the owner to use it?', 'No. You can check almost every item by looking at the listing on Google Maps or Google Search. To fix things you need the Google account that manages the profile, or you can claim the profile if nobody has.'),
       ('Is Google My Business the same as Google Business Profile?', 'Yes. Google renamed Google My Business to Google Business Profile in 2021. It is the same listing that shows on Google Search and Google Maps.'),
       ('Why doesn’t my business show up on Google Maps?', 'The usual reasons are: the profile isn’t verified, the main category is too broad or wrong, the person searching is far away (distance matters), nearby competitors have many more reviews, or the profile was suspended for breaking a guideline. Fix the basics first, then build reviews every week.'),
       ('Can I pay Google to rank higher on Maps?', 'No. Google says there is no way to request or pay for a better local ranking. Google Ads can show your business as a sponsored result, but that is separate from the free listing.'),
       ('How many Google reviews do I need?', 'There is no fixed number. What matters is having more genuine, recent reviews than the businesses around you, with a good rating. The review goal calculator in your report shows how many 5-star reviews you need for your target rating and how long it takes to catch a competitor.'),
       ('How long before I see results?', 'Edits like hours, category and description usually appear within a few days once Google checks them. The effect of more reviews, photos and posts builds over weeks and months, so keep at it every week.'),
       ('Are my answers saved anywhere?', 'Your answers stay in your browser on this device, so you can come back and check again later. If you check your website, the U Scale server opens your home page once to read it, and your browser runs Google\u2019s free PageSpeed test; nothing is stored. Nothing is sent to U Scale unless you tap \u201cSend my report\u201d, which opens WhatsApp with your summary for you to send.'),
       ('Is the website check real?', 'Yes. Your browser runs Google\u2019s own PageSpeed Insights test on your home page as a phone would load it, so the speed, SEO, accessibility and best-practice scores are Google\u2019s numbers. The tool also reads the page for what local customers need: a tap-to-call button, WhatsApp, your address and map, and business details (schema) Google can match to your profile.'),
       ('How often should I check my profile?', 'Once a month, and every time something changes: new phone number, new address, new timings or a festival holiday.')])

import os
# Google PageSpeed Insights key (free, no billing). Public by design: restrict it in Google Cloud to the PageSpeed
# Insights API and to uscale.in referrers. Without it the browser calls PageSpeed keyless (shared, often exhausted).
PSI_KEY = re.sub(r'[^A-Za-z0-9_-]', '', os.environ.get('PAGESPEED_KEY', ''))[:80]

def _gbp_art(uid='h'):
    """Score card illustration (hero / hub card)."""
    bars = [('Profile basics', .86, '#1E8E3E'), ('Photos & updates', .55, '#C27A00'), ('Reviews', .72, '#4E9A2E'), ('Website & trust', .4, '#C5221F')]
    c = 3.14159 * 80
    rows = ''.join(f'<text x="34" y="{262 + i * 38}" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="600" fill="#251E45">{n}</text>'
                   f'<rect x="34" y="{270 + i * 38}" width="252" height="8" rx="4" fill="#ECE7F5"/><rect x="34" y="{270 + i * 38}" width="{252 * f:.0f}" height="8" rx="4" fill="{col}"/>'
                   for i, (n, f, col) in enumerate(bars))
    return (f'<svg class="gp-hero__art" viewBox="0 0 320 430" aria-hidden="true" focusable="false"><rect width="320" height="430" rx="26" fill="#fff"/>'
            f'<text x="160" y="40" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.4" fill="#4A4458">SHARMA SAREES</text>'
            f'<path d="M80 172a80 80 0 0 1 160 0" transform="translate(0 -12)" fill="none" stroke="#ECE7F5" stroke-width="18" stroke-linecap="round"/>'
            f'<path d="M80 172a80 80 0 0 1 160 0" transform="translate(0 -12)" fill="none" stroke="#4E9A2E" stroke-width="18" stroke-linecap="round" stroke-dasharray="{c * .72:.1f} {c:.1f}"/>'
            f'<text x="160" y="150" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="50" font-weight="800" fill="#251E45">72</text>'
            f'<text x="160" y="172" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="600" fill="#4A4458">/ 100</text>'
            f'<rect x="72" y="196" width="176" height="30" rx="15" fill="#E6F4EA"/><text x="160" y="216" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="800" fill="#1E6B2E">Good, with a few gaps</text>'
            f'{rows}<rect x="34" y="404" width="252" height="2" rx="1" fill="#ECE7F5"/></svg>')

def _tool_head(ctx, url, title, desc, og, og_alt, jsonld, tv, extra_fonts=''):
    site, v = ctx['SITE_URL'], ctx['_v']
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
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{ea(og_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(title)}">
<meta name="twitter:description" content="{ea(desc)}">
<meta name="twitter:image" content="{og}">
{ctx['ICONS_HEAD']}
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{jsonld}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
<link rel="stylesheet" href="/tool.css?v={tv}">
</head>'''

def _crumbs_ld(site, items):
    return {'@type': 'BreadcrumbList', '@id': items[-1][1] + '#breadcrumb',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}

def gbp_jsonld(site, t):
    url = f'{site}tools/{t["slug"]}'
    # Service, not WebApplication: Google's Software App result wants ratings or reviews, which a free tool doesn't have.
    g = [{'@type': 'Service', '@id': url + '#app', 'name': 'Google Business Profile Checker', 'url': url, 'description': t['desc'],
          'serviceType': 'Free online tool', 'category': 'Local SEO tools', 'provider': {'@id': site + '#business'}, 'areaServed': {'@type': 'Country', 'name': 'India'},
          'availableChannel': {'@type': 'ServiceChannel', 'serviceUrl': url, 'availableLanguage': ['English', 'Hindi']},
          'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR', 'url': url}},
         {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': t['title'], 'description': t['desc'], 'isPartOf': {'@id': site + '#website'},
          'mainEntity': {'@id': url + '#app'}, 'author': {'@id': site + '#mehul'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__'},
         __import__('aeo').biz_ref(site), __import__('aeo').person_ref(site),
         # No HowTo: the checker's steps are the tool itself, not written out on the page, and markup must match visible text.
         _crumbs_ld(site, [('Home', site), ('Free tools', site + 'tools'), ('Google Business Profile checker', url)]),
         {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity':[{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in t['faq']]}]
    return json.dumps({'@context': 'https://schema.org', '@graph': g}, ensure_ascii=False).replace('</', '<\\/')

def gbp_page(ctx, parts, tv):
    site, v, t = ctx['SITE_URL'], ctx['_v'], GBP
    header, menu, footer, tail = parts
    url = f'{site}tools/{t["slug"]}'
    og = f'{site}assets/tools/gbp-checker-og.png'
    body = '''
  <div class="wrap hero-shell">
    <section class="sp-hero gp-hero rq-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      {art}
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/tools">Free tools</a></li><li aria-current="page">Google Business Profile checker</li></ol></nav>
      <p class="eyebrow">Free tool &middot; about 2 minutes</p>
      <h1 class="sp-hero__title" id="page-title">{h1}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{lead}</p>
      <div class="hero__cta"><a class="btn btn--go" href="#gp-start">Check my profile <span class="arw" aria-hidden="true"><b>↓</b><b>↓</b></span></a><a class="btn btn--ghost" href="#gp-how">How Google ranks shops</a></div>
      <p class="gp-hero__quick">In a hurry? <a href="/check">Quick check: just type your shop name</a> and get your score next to the busiest shops nearby in about 30 seconds.</p>
    </section>
  </div>

  <section class="section gp" aria-labelledby="gp-title">
    <div class="wrap" data-gp data-psi="{psi}">
      <h2 class="sr-only" id="gp-title">A free Google Business Profile audit in 2 minutes</h2>
      <p class="sr-only" id="gp-live" role="status" aria-live="polite"></p>
      <div class="gp__grid">
        <div class="gp-main" id="gp-start">
          <div class="rq-step gp-intro">
            <div class="gp-intro__top">
              <p class="rq-step__head"><span class="rq-step__n" aria-hidden="true">1</span><span class="rq-step__title"><span data-gp-lang="en">Find your business</span><span data-gp-lang="hi" hidden>Apna business dhoondhiye</span></span></p>
              <div class="rq-seg gp-lang" role="radiogroup" aria-label="Language"><input type="radio" name="gp-lang" id="gp-lang-en" value="en"><label for="gp-lang-en">English</label><input type="radio" name="gp-lang" id="gp-lang-hi" value="hi"><label for="gp-lang-hi">Hinglish</label></div>
            </div>
            <p class="gp-intro__lead" data-gp-lang="en">See your live Google listing, then answer 16 quick questions. Your answers stay on this device.</p>
            <p class="gp-intro__lead" data-gp-lang="hi" hidden>Apni live Google listing dekhiye, phir 16 chhote sawaal. Jawab sirf is device par rehte hain.</p>
            <div class="rq-row rq-row--2">
              <div><label class="rq-label" for="gp-name">Business name and area</label><input class="rq-input" id="gp-name" type="text" maxlength="80" autocomplete="organization" placeholder="Sharma Sarees, Andheri East"></div>
              <div><label class="rq-label" for="gp-link">Google Maps link <small>(optional, most accurate)</small></label><input class="rq-input" id="gp-link" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="maps.app.goo.gl/&hellip;" aria-describedby="gp-link-msg"></div>
            </div>
            <p class="rq-msg" id="gp-link-msg" role="status"></p>
            <div class="rq-row rq-row--2 gp-find">
              <div><label class="rq-label" for="gp-type">What do customers search for?</label><input class="rq-input" id="gp-type" type="text" maxlength="40" placeholder="saree shop"></div>
              <div class="gp-find__btn"><button type="button" class="btn btn--ink" id="gp-show"><span data-gp-lang="en">Show my live listing</span><span data-gp-lang="hi" hidden>Meri live listing dikhao</span></button></div>
            </div>
            <div class="gp-live" id="gp-map" hidden></div>
          </div>
          <div id="gp-qs"></div>
          <noscript><p class="rq-step">This checker needs JavaScript. You can still use the checklist further down this page.</p></noscript>
        </div>
        <aside class="gp-side" id="gp-side" aria-label="Your score"></aside>
      </div>
      <div class="gp-report" id="gp-report" tabindex="-1" hidden></div>
      <div class="gp-mbar" id="gp-mbar"></div>
    </div>
  </section>

{brief}
  <section class="section" id="gp-how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">How it works</p><h2 class="h2" id="how-title">How Google decides which shops show first</h2>
        <p class="lead">Google says local results are mainly based on three things. You can&rsquo;t move your shop closer to every customer, but you control a lot of the rest.</p></header>
      <div class="gp-factors">
        <article><span class="rq-ways__n">1</span><h3>Relevance</h3><p>How well your profile matches what someone searched. A specific category, a clear description, products and complete details all help Google match you to the right searches.</p></article>
        <article><span class="rq-ways__n">2</span><h3>Distance</h3><p>How far your business is from the person searching. You can&rsquo;t change this, which is why the other two matter so much in a busy area like Mumbai.</p></article>
        <article><span class="rq-ways__n">3</span><h3>Prominence</h3><p>How well-known your business is. Google says this is based partly on your reviews and on links and information about you across the web, like your website and listings.</p></article>
      </div>
      <p class="rq-note">Source: Google&rsquo;s help page <a class="tlink" href="https://support.google.com/business/answer/7091?hl=en" target="_blank" rel="noopener">Tips to improve your local ranking on Google</a>. Google also says there is no way to pay for a better local ranking.</p>
    </div>
  </section>

  <section class="section" aria-labelledby="list-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Checklist</p><h2 class="h2" id="list-title">Google Business Profile checklist for local shops</h2>
        <p class="lead">The checks from the tool, as a list you can work through with your team.</p></header>
      <div class="gp-checklist">
        <article><h3>Profile basics</h3><ul><li>Profile claimed and verified</li><li>Most specific main category, plus 2&ndash;4 extra categories that really fit</li><li>Correct hours, with holiday and festival hours</li><li>Phone number that gets answered, and a website link</li><li>Description up to 750 characters: what you sell, who for, which area</li><li>Top products or services with photos and prices</li></ul></article>
        <article><h3>Photos &amp; updates</h3><ul><li>20+ real photos: shop front, inside, products, team</li><li>2&ndash;3 new photos every month</li><li>One update or offer every week</li><li>Every attribute that applies, ticked: UPI and card payments, accessibility, Wi-Fi, parking</li></ul></article>
        <article><h3>Reviews</h3><ul><li>More genuine reviews than nearby competitors</li><li>New reviews every month, not just old ones</li><li>A reply to every review, good and bad</li><li>Never pay or give discounts for reviews</li></ul></article>
        <article><h3>Website &amp; trust</h3><ul><li>A fast, mobile-friendly website with the same name, address and phone</li><li>The same details on Justdial, Sulekha, Bing Places and Apple Maps</li><li>A review QR at the counter, and the link sent on WhatsApp after each sale</li></ul></article>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="hi-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Hinglish mein</p><h2 class="h2" id="hi-title">Google Business Profile ka score kaise badhayein?</h2></header>
      <div class="gp-checklist">
        <article><h3>Pehle yeh 3 kaam</h3><ul><li>Profile claim aur verify kijiye (&ldquo;Own this business?&rdquo; dikhe toh abhi claim kijiye)</li><li>Sabse specific category chuniye, jaise &ldquo;Saree store&rdquo;</li><li>Timing sahi kijiye, Diwali jaisi chhuttiyon ke special hours ke saath</li></ul></article>
        <article><h3>Phir har hafte</h3><ul><li>Ek update post kijiye, aur mahine mein 2&ndash;3 asli photos</li><li>Har customer se review maangiye: counter par QR, WhatsApp par link</li><li>Har review ka jawab dijiye, kharab review ka bhi shaanti se</li></ul></article>
      </div>
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <header class="sec-head"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Google profile questions.</h2></header>
      <div class="faq__list" data-accordion>
{faq}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="more-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">More free tools</p><h2 class="h2" id="more-title">Get more reviews next, or make your visiting card</h2></header>
      <div class="th-grid">{more}</div>
    </div>
  </section>

  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Want your Google profile fixed for you<span class="dot">?</span></h2>
          <p class="lead">I set up and run Google profiles for Mumbai businesses: categories, photos, weekly posts, a review system and a website that matches.</p>
          <div class="cta__btns" data-wa-zone><a class="btn btn--go" href="{wa_gp}" target="_blank" rel="noopener" data-magnetic>{icon_chat}Chat on WhatsApp</a><a class="btn btn--ghost" href="/services/seo-mumbai">Local SEO service</a></div>
        </div>
      </div>
    </div>
  </section>
'''
    body = (body.replace('{brief}', __import__('aeo').brief_html(GBP_ANSWER, GBP_FACTS, 'Key facts: Google Business Profile checker', 'gp-brief'))
            .replace('{art}', _gbp_art()).replace('{h1}', e(t['h1'])).replace('{lead}', e(t['lead'])).replace('{faq}', faq_html(t['faq']))
            .replace('{more}', _tool_card('qr') + _tool_card('card')).replace('{psi}', ea(PSI_KEY))
            .replace('{wa_gp}', ea(wa_link('Hi Mehul, I checked my Google profile on uscale.in. Can you fix it for me?'))).replace('{icon_chat}', ctx['ICONS']['ICON_CHAT']))
    head = _tool_head(ctx, url, t['title'], t['desc'], og, 'Free Google Business Profile checker by U Scale', gbp_jsonld(site, t), tv)
    return f'''{head}
<body class="page-sub page-tool page-gp">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">{body}</main>
{footer}
{tail}
<script defer src="/script.js?v={v}"></script>
<script defer src="/gbp-art.js?v={tv}"></script>
<script defer src="/gbp.js?v={tv}"></script>
</body>
</html>
'''

def _tool_card(which):
    if which == 'calc':
        return ('<a class="th-card th-card--wide" href="/tools/website-cost-calculator"><span class="th-card__art th-card__art--gp" aria-hidden="true">'
                '<img class="th-plan" src="/assets/pages/fixed-price-website-quote-mumbai-640.webp" alt="" width="640" height="480" loading="lazy" decoding="async"></span>'
                '<h3>Website cost calculator</h3><p>Pick your kind of site and the extras you need. See the fixed U Scale price, the market range from 16 published '
                'price guides, and what you pay every year after.</p>'
                '<ul><li>Fixed prices</li><li>Market ranges</li><li>Yearly costs</li></ul><span class="btn btn--go">Work out my cost <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></span></a>')
    if which == 'qrgen':
        return ('<a class="th-card" href="/tools/qr-code-generator"><span class="th-card__art th-card__art--cm" aria-hidden="true"><img class="th-cm" src="/assets/tools/qr-tool-tile.webp" alt="" width="1200" height="800" loading="lazy" decoding="async"></span>'
                '<h3>QR code generator</h3><p>Make a QR code for a link, contact, WhatsApp, UPI or Wi-Fi. Choose its shapes and colours, add your logo, and download it. Codes never expire.</p>'
                '<ul><li>Your logo</li><li>No expiry</li><li>PNG, SVG, PDF</li></ul><span class="btn btn--go">Make my QR code <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></span></a>')
    if which == 'card':
        import card_page
        n = len(card_page.templates())
        return ('<a class="th-card" href="/tools/visiting-card-maker"><span class="th-card__art th-card__art--cm" aria-hidden="true"><img class="th-cm" src="/assets/card/thumbs/rangoli.webp" alt="" width="480" height="274" loading="lazy" decoding="async"></span>'
                '<h3>Visiting card maker</h3><p>Pick a design, type your details and edit anything. Download a PNG, a vector SVG and a print-ready PDF, in English, Hindi or Marathi.</p>'
                f'<ul><li>{n} designs</li><li>No watermark</li><li>PNG, SVG, PDF</li></ul><span class="btn btn--go">Make my card <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></span></a>')
    if which == 'qr':
        return ('<a class="th-card" href="/tools/google-review-qr-code"><span class="th-card__art th-card__art--gp" aria-hidden="true"><img class="th-qr" src="/assets/tools/standee-sample.webp" alt="" width="600" height="846" loading="lazy" decoding="async"></span>'
                '<h3>Google review link &amp; QR code maker</h3><p>Find your Google review link from any Maps link, no owner access needed. Download a QR code, a print-ready counter standee and WhatsApp messages.</p>'
                '<ul><li>6 designs</li><li>Your logo</li><li>English, Hindi or Marathi</li></ul><span class="btn btn--go">Make my review QR <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></span></a>')
    return ('<a class="th-card" href="/tools/google-business-profile-checker"><span class="th-card__art th-card__art--gp" aria-hidden="true">' + _gbp_art().replace('class="gp-hero__art"', 'class="th-gp"') + '</span>'
            '<h3>Google Business Profile checker</h3><p>Answer 16 quick questions about your Google listing. Get a score out of 100, your top fixes with step-by-step help, and a review goal.</p>'
            '<ul><li>Score out of 100</li><li>Top fixes</li><li>Review calculator</li></ul><span class="btn btn--go">Check my profile <span class="arw" aria-hidden="true"><b>→</b><b>→</b></span></span></a>')

# Answer-first "In short" blocks for the tools pages (visible text; AI tools and Google quote these).
TOOLS_ANSWER = ('U Scale has five free tools for local businesses in India. The Google Business Profile checker scores your Google listing '
                'out of 100 in about 2 minutes and gives you a fix list and a review goal. The Google review QR code maker finds your review '
                'link and turns it into a QR code and a printable counter standee. The visiting card maker lets you edit a design and download a PNG, SVG and print PDF. '
                'The QR code generator makes codes for links, contacts, UPI and Wi-Fi, with your own style and logo. '
                'The website cost calculator estimates what a website costs, from published prices and market ranges. '
                'All five are free and need no sign-up.')
TOOLS_FACTS = [('Google Business Profile checker', 'A score out of 100, a fix list and a review goal, in about 2 minutes'),
               ('Google review QR code maker', 'Your review link, a QR code and a printable counter standee'),
               ('Visiting card maker', 'Editable designs that can match your logo, with PNG, SVG and print PDF downloads'),
               ('QR code generator', 'Your own style and logo, one code or 200 at once, for links, contacts, UPI and Wi-Fi'),
               ('Website cost calculator', 'A fixed U Scale price, the market range and yearly costs, in a minute'),
               ('Cost', 'Free, no sign-up'), ('Languages', 'English and Hinglish'), ('Made by', 'Mehul Karotra, U Scale, Mumbai')]
GBP_ANSWER = ('The free Google Business Profile checker from U Scale scores your Google listing out of 100 in about 2 minutes. It looks at '
              'your category, photos, hours, reviews and replies, and your website if you have one, then gives you a fix list in order of '
              'impact and a review goal. No sign-up, in English or Hinglish.')
GBP_FACTS = [('What you get', 'A score out of 100, a fix list and a review goal'), ('Time', 'About 2 minutes'),
             ('Cost', 'Free, no sign-up'), ('Languages', 'English and Hinglish'), ('Made by', 'Mehul Karotra, U Scale, Mumbai')]
QR_ANSWER = ('The free Google review QR code maker from U Scale finds your Google review link and turns it into a QR code and a printable '
             'counter standee, plus ready WhatsApp messages to ask customers for a review. No sign-up, and your business name, logo and '
             'wording stay in your browser.')
QR_FACTS = [('What you get', 'Your Google review link, a QR code and a printable counter standee'),
            ('Extra', 'Ready WhatsApp messages to ask customers for a review'), ('Cost', 'Free, no sign-up'),
            ('Privacy', 'Your name, logo and wording stay in your browser'), ('Made by', 'Mehul Karotra, U Scale, Mumbai')]

def tools_hub(ctx, parts, tv):
    site, v = ctx['SITE_URL'], ctx['_v']
    header, menu, footer, tail = parts
    url = f'{site}tools'
    title = 'Free Tools for Local Businesses, No Sign-up | U Scale'
    desc = '100% free tools with no sign-up for Indian shops, clinics and salons: a Google profile checker, review QR maker, visiting card maker and QR code generator.'
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'inLanguage': 'en-IN', 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': site + '#business'}, 'breadcrumb': {'@id': url + '#breadcrumb'},
         'publisher': {'@id': site + '#business'}, 'dateModified': '__LASTMOD__',
         'mainEntity': {'@type': 'ItemList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'url': f'{site}tools/google-business-profile-checker', 'name': 'Google Business Profile checker'},
            {'@type': 'ListItem', 'position': 2, 'url': f'{site}tools/google-review-qr-code', 'name': 'Google review link & QR code maker'},
            {'@type': 'ListItem', 'position': 3, 'url': f'{site}tools/visiting-card-maker', 'name': 'Visiting card maker'},
            {'@type': 'ListItem', 'position': 4, 'url': f'{site}tools/qr-code-generator', 'name': 'QR code generator'}]}},
        __import__('aeo').biz_ref(site), _crumbs_ld(site, [('Home', site), ('Free tools', url)])]}, ensure_ascii=False).replace('</', '<\\/')
    head = _tool_head(ctx, url, title, desc, f'{site}assets/tools/gbp-checker-og.png', 'Free tools for local businesses by U Scale', ld, tv)
    head = head.replace('</head>', f'<link rel="stylesheet" href="/card.css?v={tv}">\n</head>')
    return f'''{head}
<body class="page-sub page-tool page-hub">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Free tools</li></ol></nav>
      <p class="eyebrow">Free &middot; no sign-up</p>
      <h1 class="sp-hero__title fp-hero__title" id="page-title">Free tools for local businesses<span class="dot">.</span></h1>
      <p class="sp-hero__lead">Simple tools that help shops, clinics, salons and cafés get found on Google and win more reviews. They run in your browser, in English or Hinglish.</p>
      </div>
      {__import__('depth_art').card_tools()}
    </section>
  </div>
{__import__('aeo').brief_html(TOOLS_ANSWER, TOOLS_FACTS, 'Key facts: free tools by U Scale', 'tools-brief')}
  <section class="section" aria-labelledby="tools-title">
    <div class="wrap">
      <header class="sec-head"><p class="eyebrow">Five free tools</p><h2 class="h2" id="tools-title">Pick a tool. No sign-up.</h2></header>
      <div class="th-grid th-grid--4">{_tool_card('gp')}{_tool_card('qr')}{_tool_card('card')}{_tool_card('qrgen')}{_tool_card('calc')}</div>
      <p class="th-more">Want something done for you instead? See <a class="tlink" href="/services/seo-mumbai">local SEO</a>, <a class="tlink" href="/services/website-design-mumbai">website design</a> or <a class="tlink" href="/pricing">the full price list</a>.</p>
    </div>
  </section>
</main>
{footer}
{tail}
<script defer src="/script.js?v={v}"></script>
</body>
</html>
'''

def build(ctx):
    site, out = ctx['SITE_URL'], ctx['site']
    import aeo
    import growth_pages  # SEO programme pages: Thane, Navi Mumbai, online stores (join the website pages), GBP, freelancer, calculator
    aeo.enrich(SERVICES)
    home = (out / 'index.html').read_text()
    parts = chrome_parts(home)
    (out / 'services').mkdir(exist_ok=True)
    import geo_pages
    import svc_pages  # SEO, social media, ads and AI search pages run on the focus-page system; website design keeps this template
    rebuilt = {p['slug']: p for p in svc_pages.SERVICE_PAGES}
    for s in SERVICES:
        if s['slug'] == geo_pages.BASE: s['related'] = geo_pages.related_html()
        html = svc_pages.service_page(ctx, parts, rebuilt[s['slug']]) if s['slug'] in rebuilt else service_page(ctx, s, parts)
        (out / 'services' / f'{s["slug"]}.html').write_text(html)
    (out / '404.html').write_text(page_404(ctx, parts))
    (out / 'pricing.html').write_text(pricing_page(ctx, parts))
    import hashlib
    src = config.REPO / 'source' / 'src'
    tcss, tjs, gjs, gart = (src / 'tool.css').read_text(), (src / 'tool.js').read_text(), (src / 'gbp.js').read_text(), (src / 'gbp-art.js').read_text()
    ccss = (src / 'card.css').read_text()
    tv = hashlib.sha1((tcss + tjs + gjs + gart + ccss).encode()).hexdigest()[:8]
    (out / 'tool.css').write_text(tcss)
    (out / 'card.css').write_text(ccss)
    (out / 'tool.js').write_text(tjs)
    (out / 'gbp.js').write_text(gjs)
    (out / 'gbp-art.js').write_text(gart)
    (out / 'tools').mkdir(exist_ok=True)
    (out / 'tools' / f'{TOOL["slug"]}.html').write_text(tool_page(ctx, parts, tv))
    (out / 'tools' / f'{GBP["slug"]}.html').write_text(gbp_page(ctx, parts, tv))
    import card_page
    (out / 'tools' / f'{card_page.SLUG}.html').write_text(card_page.page(ctx, parts, tv, sys.modules[__name__]))
    import qr_page
    (out / 'tools' / f'{qr_page.SLUG}.html').write_text(qr_page.page(ctx, parts, tv, sys.modules[__name__]))
    (out / 'tools' / 'index.html').write_text(tools_hub(ctx, parts, tv))
    (out / 'about.html').write_text(svc_pages.about_page(ctx, parts))
    (out / f'{aeo.LICENSE_SLUG}.html').write_text(aeo.image_license_page(ctx, parts))
    (out / 'services.html').write_text(aeo.services_hub(ctx, parts))
    import geo_pages  # websites by business type and by area (/services/website-design-mumbai/<slug>)
    geo_rels = geo_pages.build(ctx, parts)
    import city_pages  # website design in other Indian cities (/services/website-design-<city>)
    geo_rels += city_pages.build(ctx, parts)
    geo_rels += growth_pages.build(ctx, parts)
    rels = (['index.html', 'about.html', 'services.html', 'pricing.html'] + [f'services/{x["slug"]}.html' for x in SERVICES] + geo_rels
            + ['tools/index.html', f'tools/{GBP["slug"]}.html', f'tools/{TOOL["slug"]}.html', f'tools/{card_page.SLUG}.html', f'tools/{qr_page.SLUG}.html', f'{aeo.LICENSE_SLUG}.html'])
    dates = aeo.stamp_pages(out, site, rels)  # each page's date moves only when its content changes
    prio = {site: '1.0', site + 'pricing': '0.9', site + 'services': '0.9', site + 'about': '0.8', site + 'tools': '0.7', site + aeo.LICENSE_SLUG: '0.2'}
    # Sitemap index: static pages here, blog posts from the live database at /sitemap-blog.xml (server-rendered).
    pics = geo_pages.images_by_url(site)
    pics.update(svc_pages.images_by_url(site))
    pics.update(city_pages.images_by_url(site))
    pics.update(growth_pages.images_by_url(site))
    # Home and tool pages: the product shots and tool images shown in <main>, read from the built page so the image
    # sitemap lists exactly what people see there (work thumbnails and logos are left out).
    for rel in ['index.html', 'tools/index.html', f'tools/{GBP["slug"]}.html', f'tools/{TOOL["slug"]}.html', f'tools/{card_page.SLUG}.html', f'tools/{qr_page.SLUG}.html']:
        u = site + ('' if rel == 'index.html' else rel[:-5].replace('/index', ''))
        main = re.search(r'<main\b.*?</main>', (out / rel).read_text(), re.S)
        srcs = re.findall(r'<img\b[^>]*?\ssrc="/(assets/(?:pages|tools|card/thumbs)/[^"?]+)(?:\?[^"]*)?"', main.group(0) if main else '')
        have = {i for i, _ in pics.get(u, [])}
        pics[u] = pics.get(u, []) + [(site + s, '') for s in dict.fromkeys(srcs) if site + s not in have]
    img_tags = lambda u: ''.join(f'<image:image><image:loc>{ea(i)}</image:loc></image:image>' for i, _ in pics.get(u, []))
    (out / 'sitemap-pages.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + ''.join(f'  <url><loc>{u}</loc><lastmod>{d}</lastmod><priority>{prio.get(u, "0.8")}</priority>{img_tags(u)}</url>\n' for u, d in dates.items()) + '</urlset>\n')
    (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'  <sitemap><loc>{site}sitemap-pages.xml</loc><lastmod>{max(dates.values())}</lastmod></sitemap>\n'
        f'  <sitemap><loc>{site}sitemap-blog.xml</loc></sitemap>\n</sitemapindex>\n')
    robots = aeo.robots_txt(site) if config.INDEXABLE else 'User-agent: *\nDisallow: /\n'  # previews stay out of search engines
    (out / 'robots.txt').write_text(robots)
    blog_shell(ctx, parts)
    (out / 'llms.txt').write_text(llms_txt(site, ctx['FAQ'], max(dates.values())))
    (out / 'llms-full.txt').write_text(aeo.llms_full(site, ctx['FAQ']))
    # Static pages + their content dates, read by the daily cron to tell IndexNow (Bing, which feeds ChatGPT search) what changed.
    (out / '_blog' / 'pages.json').write_text(json.dumps([{'url': u, 'lastmod': d} for u, d in dates.items()]))
    (out / 'site.webmanifest').write_text(json.dumps({'name': 'U Scale by Mehul Karotra', 'short_name': 'U Scale', 'start_url': '/', 'display': 'standalone',
        'background_color': '#FAF9FC', 'theme_color': '#251E45', 'icons': [{'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=1))
    return ['about', 'services', 'pricing', 'blog-shell', 'tools', 'tools/' + TOOL['slug'], 'tools/' + GBP['slug'], 'tools/' + card_page.SLUG, 'tools/qr-code-generator'] + [s['slug'] for s in SERVICES]

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
        rows = ''.join(f'<li><span>{e(PD.label(r))}</span><b>{e(_lookup(r))}</b></li>' for r in p['rows'])
        pop = p.get('pop')
        cards += (f'<li class="plan plan--pillar{" plan--pop" if pop else ""}" data-reveal>'
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
            '<ul class="pts__facts"><li><b>Free audit</b><span>before every project</span></li><li><b>2–3 revisions</b><span>agreed in writing</span></li><li><b>No long lock-ins</b><span>3 months minimum, then 30 days&rsquo; notice</span></li><li><b>14 days</b><span>to accept a quote</span></li></ul>'
            '<a class="btn btn--go pts__btn" href="/pricing#builder" data-magnetic>Open the quote builder <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>'
            '</div>')

def quote_builder_html(ICON_CHAT):
    web = '<label class="qb__opt"><input type="radio" name="qb-web" value="" checked data-name="" data-once="0"><span class="qb__card"><b>No website for now</b><em>₹0</em></span></label>'
    for n, pr, v in PD.WEBSITES:
        if n.startswith('Redesign') or n.startswith('Care plan'): continue
        frm = ' data-from="1"' if pr.startswith('from') else ''
        web += f'<label class="qb__opt"><input type="radio" name="qb-web" data-name="{ea(PD.label(n))}" data-once="{v}"{frm}><span class="qb__card"><b>{e(PD.label(n))}</b><em>{e(pr)}</em></span></label>'
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
                     f'<span class="qb__qty"><button type="button" data-dec aria-label="Remove one: {ea(n)}">−</button><output aria-label="Quantity of {ea(n)}">0</output><button type="button" data-inc aria-label="Add one: {ea(n)}">+</button></span></div>')
        units += f'<div class="qb__ug"><h3>{e(g)}</h3>{rows}</div>'
    presets = ''.join(f'<button type="button" class="qb__preset" aria-pressed="false" data-preset="{ea(json.dumps(dict(web=p["web"], checks=p["checks"], units=p["units"]), ensure_ascii=False))}">{e(p["label"])}</button>' for p in PD.PRESETS)
    return f'''<div class="qb" id="builder" data-qb data-wa-zone>
  <div class="qb__presets"><p class="qb__plabel" id="qb-p-label">Not sure where to start? Try a common starting point:</p><div role="group" aria-labelledby="qb-p-label">{presets}</div></div>
  <div class="qb__steps">
    <fieldset class="qb__step" id="step-1">
      <legend><span class="qb__num">1</span><span>A website<small>One-time, fixed price after a free audit</small></span></legend>
      <div class="qb__opts qb__opts--web">{web}</div>
      <div class="qb__toggles">
        <label class="qb__switch"><input type="checkbox" data-redesign><span class="qb__sw" aria-hidden="true"></span><span>I already have a site: redesign it for <em>70% of a fresh build</em></span></label>
        <label class="qb__switch"><input type="checkbox" data-name="Care plan" data-mo="{care[2]}" data-once="0"><span class="qb__sw" aria-hidden="true"></span><span>Care plan for updates, backups and security: <em>{e(care[1])}</em></span></label>
      </div>
      <p class="qb__fine">{e(PD.WEBSITES_NOTE)}</p>
    </fieldset>
    <fieldset class="qb__step" id="step-2">
      <legend><span class="qb__num">2</span><span>Monthly growth<small>Combine any of these. 3 months minimum, then month-to-month with 30 days&rsquo; notice.</small></span></legend>
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
  <div class="qb__dock" data-qb-dock aria-hidden="true"><span><small>One-time</small><b data-qb-once2>₹0</b></span><span><small>Monthly</small><b data-qb-mo2>₹0</b></span><a href="#qb-r-title" tabindex="-1">See estimate</a></div>
</div>'''

def terms_html():
    t = PD.TERMS
    return f'''<div class="tt">
  <div class="tt__tile tt__tile--pay"><p class="tt__k">Payments</p><p class="tt__h">20 / 20 / 60</p>
    <div class="tt__bar" aria-hidden="true"><span style="--w:20"></span><span style="--w:20"></span><span style="--w:60"></span></div>
    <p>{e(t[0])}</p></div>
  <div class="tt__tile"><p class="tt__k">Revisions</p><p class="tt__h">2–3 rounds</p><p>{e(t[1])}</p></div>
  <div class="tt__tile"><p class="tt__k">Always included</p><p class="tt__h">The essentials</p><p>{e(t[2])}</p></div>
  <div class="tt__tile"><p class="tt__k">Retainers</p><p class="tt__h">No long lock-ins</p><p>{e(t[3])}</p></div>
  <div class="tt__tile tt__tile--green"><p class="tt__k">Quotes</p><p class="tt__h">14 days</p><p>{e(t[4])}</p></div>
</div>'''

PRICING_FAQ_IDX = [1, 2, 3]  # website cost, marketing cost, contract vs retainer (indexes into the home FAQ)
PRICING_FAQ_MORE = [
    ('Are there any hidden charges?',
     'No. Every price is on this page, and the price of your project is fixed in writing before work starts. The costs that are not part of '
     'a U Scale price are listed here too, and quoted before I begin: website copy, photography, premium plugins, the payment gateway’s own '
     'fee, and the domain and hosting you pay your provider. No GST is charged right now.'),
    ('Do you charge by the hour?',
     'No. Websites are a fixed price agreed in writing before work starts, monthly services are a fixed monthly fee, and every single piece of '
     'work has its own price on this page. Nothing is billed by the hour, so the price can’t grow because a task took longer than planned. '
     'For comparison, freelance developers in India charge from about ₹300 an hour early in their careers to ₹800–₹2,000 an hour with '
     'experience (OnJob, June 2026).'),
    ('How much does a landing page cost?',
     'A landing page is ₹25,000, fixed, and can be live in under two weeks. It is one page built for one job, such as an ad campaign, a launch '
     'or an offer, with your photos, your prices and a clear WhatsApp or call button.'),
]


def compare_html():
    """Guides and tools that put these prices in context, under the price list."""
    import geo_pages as GP
    items = [('/blog/website-design-cost-mumbai', 'rupee', 'Website design cost in Mumbai (2026)', 'Market ranges from 16 price guides, yearly costs, GST and red flags.', ''),
             ('/tools/website-cost-calculator', 'layers', 'Website cost calculator', 'Pick your pages and features for a market range and a fixed U Scale price.', 'Free'),
             ('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'user', 'Freelancer vs agency vs builder', 'Who each one suits, what each costs, and six checks before you hire.', ''),
             ('/services/website-design-mumbai/website-banane-ka-kharcha', 'file', 'Website banane ka kharcha (Hinglish)', 'Poora hisaab: market rates, saal ka kharcha aur GST.', '')]
    if live('/blog/seo-cost-in-india'):
        items.insert(1, ('/blog/seo-cost-in-india', 'search', 'SEO cost in India (2026)', 'Real monthly prices, what you get and the red flags.', ''))
    items += [('/services/website-design-mumbai/restaurants-cafes', 'menu', 'Restaurant websites with ordering', 'What ordering direct saves on app commission.', price_of('Restaurant site + own online ordering')),
              ('/services/ecommerce-website-mumbai', 'cart', 'Online stores', 'Your own store with UPI and card payments.', 'From ' + price_of('E-commerce, under 50 products'))]
    return GP.render(GP.Links(items))


def price_of(name):
    return __import__('aeo')._price(name)[0]
PRICING_ANSWER = ('U Scale publishes every price. Websites are fixed one-time prices: landing page ₹25,000, business site (5–10 pages) ₹55,000, '
                  '10–20 pages with blog ₹85,000, restaurant site with online ordering ₹90,000, online store from ₹95,000. Monthly services run '
                  'for 3 months minimum, then month-to-month: local SEO ₹15,000, technical SEO ₹25,000, AI search visibility ₹12,000, ads '
                  'management ₹20,000 (+₹10,000 setup), community and inbox management ₹12,000, with social posts from ₹800. Payment for '
                  'websites is 20% / 20% / 60%.')
PRICING_FACTS = [('Websites', 'Fixed one-time price, agreed in writing before work starts'),
                 ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
                 ('Monthly services', '3 months minimum, then month-to-month with 30 days’ notice'),
                 ('One-off work', 'From ₹800 for a social post'),
                 ('Quotes', 'Valid for 14 days, after a free audit'),
                 ('GST', 'None charged right now')]

def pricing_page(ctx, parts):
    site, v = ctx['SITE_URL'], ctx['_v']
    header, menu, footer, tail = parts
    url = site + 'pricing'
    title = 'Website Design, SEO & Social Media Prices in Mumbai'
    desc = ('Every U Scale price on one page, no hidden charges: website packages from ₹25,000, SEO ₹15,000 a month, '
            'social posts from ₹800. Build a quote on WhatsApp.')
    faq = [ctx['FAQ'][i] for i in PRICING_FAQ_IDX] + PRICING_FAQ_MORE
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': site + '#business'}, 'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__'},
        dict(offer_catalog(site), **{'@id': url + '#prices'}), __import__('aeo').biz_ref(site),  # provider sits on each itemOffered (not valid on an ItemList)
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
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{ld}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
</head>
<body class="page-sub">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Pricing</li></ol></nav>
      <h1 class="sp-hero__title fp-hero__title" id="page-title">Prices and packages, published openly<span class="dot">.</span></h1>
      <p class="sp-hero__lead">Most agencies hide their prices behind a contact form. Here is everything I charge for web design and digital marketing in Mumbai, on one page: fixed-price websites, monthly growth services and single pieces of work.</p>
      <div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="{ea(WA)}" target="_blank" rel="noopener" data-magnetic>{ctx['ICONS']['ICON_CHAT']}Ask me for a quote</a>
        <a class="btn btn--ghost" href="#builder">Build your quote</a>
      </div>
      <p class="sp-hero__who">Quotes are valid for 14 days. Every website and every monthly service starts with a free audit, so you know exactly what you are paying for before you spend a rupee.</p>
      </div>
      {__import__('depth_art').card_prices()}
    </section>
  </div>
{__import__('aeo').brief_html(PRICING_ANSWER, PRICING_FACTS, 'Key facts: U Scale prices', 'pricing-brief')}

  <section class="section qb-sec" aria-labelledby="qb-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Build your own quote</p>
        <h2 class="h2" id="qb-title" data-split>Website design packages and monthly plans.</h2>
        <p class="lead" data-reveal>Every price I charge is in here. Tick what you need, watch your estimate add up, then send it to me in one tap. No sign-up, no sales call.</p>
      </header>
      {quote_builder_html(ctx['ICONS']['ICON_CHAT'])}
    </div>
  </section>

  <section class="section" aria-labelledby="cmp-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Before you decide</p>
        <h2 class="h2" id="cmp-title" data-split>Compare these prices.</h2>
        <p class="lead" data-reveal>Guides with market prices and their sources, and a calculator for your own estimate.</p>
      </header>
      {compare_html()}
    </div>
  </section>

  <section class="section tt-sec" aria-labelledby="tt-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>The fine print</p>
        <h2 class="h2" id="tt-title" data-split>How I work with you.</h2>
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
<script defer src="/script.js?v={v}"></script>
</body>
</html>
'''
