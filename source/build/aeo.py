"""Answer-engine layer (AEO / GEO) for the U Scale site.

What answer engines (ChatGPT search, Perplexity, Gemini, Google AI Overviews, Copilot) need from a page:
  * a short, quotable answer near the top ("In short"), written so it is still true when lifted out of the page;
  * hard facts in a predictable shape (a key-facts table: who, price, timeline, terms);
  * question-shaped FAQs whose first sentence is the answer;
  * a clear entity graph: the business (#business) and the person (#mehul) with stable @ids on every page;
  * honest dates: a page's "updated" date changes only when its content changes;
  * crawl access for AI crawlers, a full-text llms-full.txt and fast re-crawl signals (IndexNow).

Everything here is built from Mehul's own published facts and prices (pricing_data.py). No invented results or claims.
"""
import hashlib, json, os, re, urllib.parse
from datetime import date

import config
import pricing_data as PD
import seo_pages as SP

e, ea = SP.e, SP.ea
TODAY = config.BUILD_DATE

# ---------------------------------------------------------------- entities
# Who U Scale is comes from one file (source/entity.json), shared with the blog, so every page, llms.txt and the
# blog describe exactly the same business. AI answer engines cross-check these details against the Google Business
# Profile and directory listings, so they must match those word for word.
ENTITY = json.loads((config.REPO / 'source' / 'entity.json').read_text())
FOUNDER = ENTITY['founder']
_pick = lambda urls, host: next((u for u in urls if host in u), '')
INSTAGRAM = _pick(ENTITY['sameAs'], 'instagram.com')
LINKEDIN, GITHUB = _pick(FOUNDER['sameAs'], 'linkedin.com'), _pick(FOUNDER['sameAs'], 'github.com')
ADDRESS = {'@type': 'PostalAddress', **ENTITY['address']}
CITIES = {'Mumbai', 'Thane', 'Navi Mumbai'}
PRICE_RANGE = ENTITY['priceRange']


# Entity links: each topic or place is tied to its Wikipedia article (sameAs), so search engines and AI systems match it to the
# right thing in their knowledge graphs ("Thane" the city, "GEO" the marketing practice). Only articles checked to exist.
WIKI = 'https://en.wikipedia.org/wiki/'
PLACES = {'Mumbai': 'Mumbai', 'Thane': 'Thane', 'Navi Mumbai': 'Navi_Mumbai', 'India': 'India'}
TOPICS = [('Web design', 'Web_design'), ('Web development', 'Web_development'), ('UI/UX design', 'User_experience_design'),
          ('Search engine optimisation', 'Search_engine_optimization'), ('Local SEO', 'Local_search_engine_optimisation'),
          ('Google Business Profile', None), ('Social media marketing', 'Social_media_marketing'), ('Google Ads', 'Google_Ads'),
          ('Meta Ads', None), ('Digital marketing', 'Digital_marketing'), ('Generative engine optimisation', 'Generative_engine_optimization')]


def place(name, kind='City'):
    d = {'@type': kind, 'name': name}
    if name in PLACES: d['sameAs'] = WIKI + PLACES[name]
    return d


def topics():
    return [{'@type': 'Thing', 'name': n, 'sameAs': WIKI + w} if w else n for n, w in TOPICS]


def area_served():
    """Mumbai first, then Thane and Navi Mumbai (met in person), then India (remote work). Matches the footer line on every page."""
    return [place(n) for n in ENTITY['areaServed']] + [place('India', 'Country')]


def biz_ref(site):
    """Compact node for the business, repeated with the same @id on every page so each page's graph is self-contained."""
    # LocalBusiness, not ProfessionalService: schema.org marks ProfessionalService as deprecated (confused with Service).
    return {'@type': 'LocalBusiness', '@id': site + '#business', 'name': ENTITY['name'], 'alternateName': ENTITY['alternateName'],
            'disambiguatingDescription': ENTITY['disambiguatingDescription'],
            'url': site, 'logo': site + 'icon-512.png', 'image': site + 'og-image.png', 'telephone': ENTITY['phone'], 'email': ENTITY['email'],
            'priceRange': PRICE_RANGE, 'address': ADDRESS, 'founder': {'@id': site + '#mehul'}, 'sameAs': ENTITY['sameAs']}


def biz_full(site, catalog=None):
    """The full business node (home page): the compact node plus description, areas, languages and the price catalogue."""
    b = dict(biz_ref(site), description=ENTITY['description'], slogan=ENTITY['slogan'], foundingDate=ENTITY['foundingDate'],
             areaServed=area_served(), knowsLanguage=ENTITY['languages'],
             contactPoint=[{'@type': 'ContactPoint', 'telephone': ENTITY['phone'], 'email': ENTITY['email'], 'contactType': 'sales',
                            'areaServed': 'IN', 'availableLanguage': ENTITY['languages']},
                           {'@type': 'ContactPoint', 'name': 'WhatsApp', 'contactType': 'customer support',
                            'url': 'https://wa.me/' + ENTITY['whatsapp'], 'telephone': ENTITY['phone'], 'areaServed': 'IN',
                            'availableLanguage': ENTITY['languages']}],
             knowsAbout=topics())
    if catalog: b['hasOfferCatalog'] = catalog
    return b


def person_full(site):
    """The one full description of Mehul Karotra. Used on the home page and /about; other pages refer to it by @id."""
    return {'@type': 'Person', '@id': site + '#mehul', 'name': FOUNDER['name'], 'givenName': FOUNDER['givenName'], 'familyName': FOUNDER['familyName'],
            'jobTitle': FOUNDER['jobTitle'], 'url': site + 'about',
            'description': 'Mumbai-based website designer and developer who personally designs and builds websites and runs SEO, social media, '
                           'Google and Meta ads and AI search visibility for businesses through U Scale.',
            'worksFor': [{'@id': site + '#business'},
                         {'@type': 'Organization', 'name': 'Apex36 Technologies', 'url': 'https://www.apex36tech.com/'}],
            'homeLocation': place('Mumbai'),
            'knowsLanguage': ENTITY['languages'], 'sameAs': FOUNDER['sameAs'], 'image': person_image(site),
            'knowsAbout': topics()}


def person_image(site):
    return {'@type': 'ImageObject', '@id': site + '#mehul-photo', 'url': site + FOUNDER['image'], 'contentUrl': site + FOUNDER['image'],
            'width': 1200, 'height': 1200, 'caption': 'Mehul Karotra, founder of U Scale', 'creditText': 'U Scale'}


def person_ref(site):
    return {'@type': 'Person', '@id': site + '#mehul', 'name': FOUNDER['name'], 'url': site + 'about', 'sameAs': FOUNDER['sameAs'],
            'image': site + FOUNDER['image']}


def website_ref(site):
    # name + alternateName are what Google reads for the site name shown in results.
    return {'@type': 'WebSite', '@id': site + '#website', 'url': site, 'name': 'U Scale', 'alternateName': ['Uscale', 'U Scale by Mehul Karotra'],
            'inLanguage': 'en-IN', 'publisher': {'@id': site + '#business'}}


_LD = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)
LICENSE_SLUG = 'image-license'
COPYRIGHT = '© 2026 U Scale by Mehul Karotra. All rights reserved.'


def image_rights(site):
    """Rights fields Google's image metadata report asks for: creator, credit, copyright notice, licence and where to ask for one."""
    # creator is a standalone Organization (no @id): Google merges same-@id nodes, and the business node is a LocalBusiness,
    # which the image metadata report flags as an invalid type for creator (it accepts Organization or Person).
    return {'creator': {'@type': 'Organization', 'name': ENTITY['name'], 'url': site},
            'creditText': 'U Scale', 'copyrightHolder': {'@id': site + '#business'}, 'copyrightNotice': COPYRIGHT,
            'license': site + LICENSE_SLUG, 'acquireLicensePage': site + LICENSE_SLUG}


def _is_image(x):
    t = x.get('@type')
    return (t == 'ImageObject' or (isinstance(t, list) and 'ImageObject' in t)) and ('contentUrl' in x or 'url' in x)


def _add_rights(x, rights):
    if isinstance(x, dict):
        if _is_image(x):
            for k, v in rights.items(): x[k] = v  # one consistent set on every image in the graph
        for v in x.values(): _add_rights(v, rights)
    elif isinstance(x, list):
        for v in x: _add_rights(v, rights)


def _refs(x, out):
    if isinstance(x, dict):
        if set(x) == {'@id'}: out.add(x['@id'])
        for v in x.values(): _refs(v, out)
    elif isinstance(x, list):
        for v in x: _refs(v, out)
    return out


def complete_graph(html, site):
    """Make every page's schema graph self-contained: if a page points at the site (#website), the business (#business) or
    Mehul (#mehul) by @id without describing it, add the compact node, so an answer engine reading one page alone still
    knows exactly who is behind it."""
    nodes = {site + '#website': website_ref, site + '#business': biz_ref, site + '#mehul': person_ref}

    def fix(m):
        try:
            d = json.loads(m.group(2).replace('<\\/', '</'))
        except ValueError:
            return m.group(0)
        g = d.get('@graph')
        if not isinstance(g, list): return m.group(0)
        for _ in range(3):  # an added node can itself point at another (website → business → mehul)
            have = {n.get('@id') for n in g if isinstance(n, dict) and len(n) > 1}
            missing = [i for i in sorted(_refs(g, set()) - have) if i in nodes]
            if not missing: break
            g += [nodes[i](site) for i in missing]
        _add_rights(g, image_rights(site))
        return m.group(1) + json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + m.group(3)
    return _LD.sub(fix, html)


# ---------------------------------------------------------------- prices
# A monthly price: UN/CEFACT unit code MON (month) plus the readable unit, billed every month.
MONTHLY = {'unitCode': 'MON', 'unitText': 'MONTH', 'referenceQuantity': {'@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'MON'},
           'billingDuration': 'P1M'}

def _price(name):
    for n, pr, v in PD.WEBSITES:
        if n == name: return pr, v, '/mo' in pr
    for n, pr, note, v in PD.ADDONS:
        if n == name: return pr, v, '/mo' in pr
    for _, items in PD.UNITS:
        for n, pr in items:
            if n == name: return pr, SP._num(pr), '/mo' in pr
    raise KeyError(name)


# A per-page price (website copy): one page is the unit, nothing recurring.
PER_PAGE = {'unitText': 'page', 'referenceQuantity': {'@type': 'QuantitativeValue', 'value': 1, 'unitText': 'page'}}


def offers_ld(site, names):
    out = []
    for n in names:
        pr, v, monthly = _price(n)
        spec = {'@type': 'UnitPriceSpecification', 'priceCurrency': 'INR'}
        spec['minPrice' if pr.startswith('from') else 'price'] = v
        if monthly: spec.update(MONTHLY)
        elif '/page' in pr: spec.update(PER_PAGE)
        o = {'@type': 'Offer', 'name': n, 'priceCurrency': 'INR', 'priceSpecification': spec, 'url': site + 'pricing'}
        if not pr.startswith('from'): o['price'] = v
        out.append(o)
    return out


# ---------------------------------------------------------------- service briefs (answer, facts, extra FAQs, offers)
CONTRACT = '3 months minimum, then month-to-month with 30 days’ notice'
BRIEF = {
 'website-design-mumbai': dict(
  answer='U Scale is Mehul Karotra, a freelance website designer and developer in Mumbai. Every site is designed in Figma and hand-coded, '
         'at a fixed price agreed in writing before work starts: a landing page is ₹25,000, a 5–10 page business site ₹55,000 and '
         'an online store starts at ₹95,000. Most business sites go live in 3–4 weeks.',
  facts=[('Who does the work', 'Mehul Karotra designs and codes every site himself. No templates.'),
         ('Price', 'Landing page ₹25,000 · Portfolio ₹40,000 · Business site, 5–10 pages ₹55,000 · 10–20 pages + blog ₹85,000 · '
                   'Restaurant site + online ordering ₹90,000 · Online store from ₹95,000'),
         ('Timeline', '3–4 weeks for a business site; a landing page can be live in under two weeks'),
         ('Payment', '20% to start, 20% on design sign-off, 60% on launch; no GST charged right now'),
         ('Included', 'Mobile-first design, enquiry forms, basic SEO, Google Maps, social links, 2–3 revision rounds and a 15–30 day bug-fix window'),
         ('Ownership', 'Your domain, hosting, code and design files belong to you'),
         ('Where', 'Mumbai; remote work with businesses across India')],
  faq_replace={'How much does a website cost in Mumbai?':
      'With U Scale, a landing page costs ₹25,000, a 5–10 page business site ₹55,000, a 10–20 page site with a blog ₹85,000 and an '
      'online store from ₹95,000. Every price is fixed and agreed in writing before work starts, with no hourly billing.'},
  faq_more=[('Should I hire a freelance web designer or an agency?',
             'It depends on the project. A freelancer often suits a small business: you talk directly to the person designing and coding '
             'your site, and you are not paying for account managers. An agency makes sense when you need a large team working in parallel, '
             'and a website builder can work if your budget is very small and you are happy to do it yourself. I compare all three, with '
             'price ranges, in my guide: freelancer vs agency vs website builder.'),
            ('Do I need a website if I already have Instagram?',
             'Instagram is good for discovery, but you don’t own it. A simple website gives people one place to check prices, timings and '
             'your work, and it keeps working if your reach drops or your account is restricted. Start small: a ₹25,000 landing page linked '
             'from your Instagram bio and Google listing is enough for many shops. More on Instagram and search: '
             'Your Instagram posts now show up on Google.'),
            ('What is included in every website?',
             'Every U Scale website includes a mobile-responsive design, enquiry forms, basic SEO, Google Maps, social links, 2–3 rounds of '
             'revisions and a 15–30 day bug-fix window after launch.'),
            ('Do you build websites for businesses outside Mumbai?',
             'Yes. I’m based in Mumbai and work with businesses across India remotely, over WhatsApp, calls and video meetings.')],
  offers=['Landing page', 'Portfolio site', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products',
          'Restaurant site + own online ordering', 'Care plan: updates, backups, security']),
 'seo-mumbai': dict(
  answer='U Scale offers SEO in Mumbai done personally by Mehul Karotra: local SEO and Google Business Profile, technical and on-page SEO, '
         'and content. Local SEO costs ₹15,000 a month and technical + on-page SEO ₹25,000 a month. SEO usually takes '
         '3–6 months to show real progress, and you get a clear report every month.',
  facts=[('Who does the work', 'Mehul Karotra, personally'),
         ('Price', 'Local SEO / Google Business Profile ₹15,000/month · Technical + on-page SEO ₹25,000/month'),
         ('SEO audit', 'First check free; full deep-dive audit ₹7,500, free if we go on to work together'),
         ('Results', 'Usually 3–6 months to show real progress; no ranking guarantees'),
         ('Contract', CONTRACT),
         ('Reporting', 'A monthly report and call: rankings, traffic, calls and enquiries'),
         ('Content', 'SEO blog posts, ₹2,000 each (about 1,000 words)')],
  faq_more=[('How much does SEO cost in Mumbai?',
             'With U Scale, local SEO and Google Business Profile management costs ₹15,000 a month, and technical + on-page SEO costs '
             '₹25,000 a month. A deep-dive SEO audit is ₹7,500, or free if we go on to work together.'),
            ('How do I get my business into the Google Maps top 3?',
             'Verify your Google Business Profile, choose the most specific primary category, keep hours, phone, photos and services '
             'complete, earn genuine reviews every week and reply to them, and show the same name, address and phone number on your '
             'website. Distance from the person searching also matters, and nobody can change that.'),
            ('What is included in local SEO?',
             'Local SEO with U Scale covers Google Business Profile setup and optimisation (categories, photos and posts), a review '
             'strategy, consistent listings across Indian directories, genuine local links and a monthly report on calls and enquiries.')],
  offers=['Local SEO / Google Business Profile', 'Technical + on-page SEO', 'SEO deep-dive audit (free if we work together)', 'SEO blog (~1,000 words)']),
 'social-media-management-mumbai': dict(
  answer='U Scale manages social media for Mumbai businesses on Instagram, Facebook, LinkedIn and YouTube: a monthly content calendar, '
         'designed posts, reels, posting and engagement, all by Mehul Karotra. Community and inbox management costs ₹12,000 a month, '
         'and content is priced per piece: ₹800 per post, ₹1,500 per carousel and ₹2,500 per reel edit.',
  facts=[('Who does the work', 'Mehul Karotra; a trusted photographer joins only when a shoot is needed'),
         ('Platforms', 'Instagram, Facebook, LinkedIn and YouTube'),
         ('Price', 'Community & inbox management ₹12,000/month'),
         ('Content', 'Post ₹800 · Carousel ₹1,500 · Designed story ₹800 · Reel edit ₹2,500 · Premium reel edit ₹5,000'),
         ('Shoots', 'Half-day shoot + 3 reels ₹15,000 · Full-day shoot + 6 reels ₹25,000'),
         ('Approval', 'You approve the monthly calendar before anything goes live'),
         ('Contract', CONTRACT)],
  faq_more=[('How much does social media management cost in Mumbai?',
             'With U Scale, community and inbox management is ₹12,000 a month and content is priced per piece: ₹800 per post, ₹1,500 per '
             'carousel and ₹2,500 per reel edit. A typical starting month of 12 posts, 4 carousels and 4 reels comes to ₹25,600 in content.'),
            ('How many posts a month should a small business publish?',
             'Consistency matters more than volume. A practical starting point is about 12 posts, 4 carousels and 4 reels a month, then '
             'adjust to what your audience responds to.'),
            ('Can you edit reels from my own footage?',
             'Yes. A reel edit from your own footage is ₹2,500, and a premium edit with colour grading and motion graphics is ₹5,000.')],
  offers=['Community & inbox management', 'Social post', 'Carousel', 'Designed story', 'Reel edit (your footage)',
          'Premium edit (colour grading, motion graphics)', 'Half-day shoot + 3 reels', 'Full-day shoot + 6 reels']),
 'google-meta-ads-mumbai': dict(
  answer='U Scale manages Google Ads and Meta (Facebook and Instagram) ads for Mumbai businesses, including click-to-WhatsApp campaigns. '
         'The fee is ₹20,000 a month flat for up to ₹1.5 lakh of monthly ad spend, then 12% of spend, plus a one-time ₹10,000 setup. '
         'Ad spend is paid directly to Google and Meta, and you own the ad accounts.',
  facts=[('Who does the work', 'Mehul Karotra, personally'),
         ('Management fee', '₹20,000/month flat up to ₹1.5 lakh monthly ad spend, then 12% of spend'),
         ('Setup', '₹10,000 one-time'),
         ('Ad spend', 'Paid directly to Google and Meta from accounts you own'),
         ('Campaigns', 'Google Search, Performance Max, Facebook & Instagram, click-to-WhatsApp'),
         ('Tracking', 'Google Analytics (GA4), conversion tracking and the Meta pixel, so you can see which ads bring calls, chats and enquiries'),
         ('Reporting', 'Weekly optimisation and a monthly report: spend, leads and cost per lead'),
         ('Contract', CONTRACT)],
  faq_more=[('How much does ads management cost in Mumbai?',
             'With U Scale, ads management is ₹20,000 a month flat for up to ₹1.5 lakh of monthly ad spend, then 12% of spend, plus a '
             'one-time ₹10,000 setup. Your ad spend is separate and paid directly to Google and Meta.'),
            ('How fast do ads bring enquiries?',
             'Ads can bring enquiries within days of launch, unlike SEO. The first few weeks are a learning phase in which budgets, '
             'keywords and creatives are tested and improved.')],
  offers=['Ads management']),
 'ai-search-visibility': dict(
  answer='AI search visibility, also called GEO or AEO, is work that helps ChatGPT, Gemini, Perplexity and Google AI Overviews describe '
         'your business accurately when people ask for a recommendation. Mehul Karotra checks what AI tools say about you, '
         'corrects the facts, listings and pages they draw on, helps you earn genuine reviews, and re-checks every month, for ₹12,000 a month. A one-off AI '
         'visibility audit is ₹2,500. No one can guarantee a mention.',
  facts=[('Who does the work', 'Mehul Karotra, personally'),
         ('Price', '₹12,000/month, on its own or with other services'),
         ('AI visibility audit', 'First check free; full audit ₹2,500, free if we go on to work together'),
         ('AI tools covered', 'ChatGPT, Gemini, Perplexity, and Google’s AI Overviews and AI Mode'),
         ('Work includes', 'Matching facts everywhere; clear pages and FAQs; making sure AI tools can read your site; listings and genuine reviews; monthly checks'),
         ('Contract', CONTRACT)],
  faq_more=[('How much does AI search optimisation (GEO) cost in India?',
             'With U Scale, AI search visibility costs ₹12,000 a month, on its own or alongside SEO. A one-off AI visibility audit is '
             '₹2,500, or free if we go on to work together.'),
            ('What is the difference between SEO and GEO?',
             'SEO helps your pages rank in search results. GEO, also called AEO (answer engine optimisation), helps your business get named '
             'and cited inside AI-generated answers. Both rest on the same foundations, like pages Google can read, accurate business details and genuine reviews, but GEO puts '
             'more weight on clear, quotable facts and consistent mentions across the web.'),
            ('How do AI assistants decide which businesses to recommend?',
             'They rely on what they can find and trust: clear facts on your website, written so both people and AI tools can read them, your Google Business Profile, '
             'reviews, directory listings and mentions on other sites. Consistent name, address, phone and service details everywhere make '
             'a business easier to recommend. Step-by-step guide: How to get your business recommended by ChatGPT and Google AI Mode.'),
            ('What is llms.txt?',
             'llms.txt is an optional plain-text summary that some sites publish for AI tools. Google says its AI features don’t need it, '
             'and other AI companies have not said they rely on it, so treat it as a tidy extra, not a requirement. '
             'U Scale’s own is at uscale.in/llms.txt.')],
  offers=['AI search visibility (GEO)', 'AI visibility audit (free if we work together)']),
}


def enrich(services):
    """Merge the briefs into SERVICES: answer, facts, offers, sharper answers and question-intent FAQs (cost question first)."""
    for s in services:
        b = BRIEF[s['slug']]
        s['answer'], s['facts'], s['offers'] = b['answer'], b['facts'], b['offers']
        faq = [(q, b.get('faq_replace', {}).get(q, a)) for q, a in s['faq']]
        have = {q for q, _ in faq}
        more = [x for x in b.get('faq_more', []) if x[0] not in have]
        cost = [x for x in more if x[0].lower().startswith('how much')]
        s['faq'] = cost + faq + [x for x in more if x not in cost]


def human(d):
    when = date.fromisoformat(d)
    return f'{when.day} {when:%b %Y}'  # %-d only works on Linux


def byline():
    return ('<p class="sp-byline">By <a href="/about">Mehul Karotra</a>, founder of U Scale · '
            '<span>Updated <time datetime="__LASTMOD__">__LASTMOD_H__</time></span></p>')


def facts_html(facts, caption, fold=0, more='All facts', tid=''):
    """Key-facts table. With fold=N, phones show the first N rows and an "All facts" button (aria-expanded) for the
    rest; every row stays in the HTML (answer engines read the whole table), only CSS hides them, and only with JS."""
    if not fold or len(facts) <= fold:
        rows = ''.join(f'<tr><th scope="row">{e(k)}</th><td>{e(v)}</td></tr>' for k, v in facts)
        return f'<table class="sp-facts"><caption class="sr-only">{e(caption)}</caption><tbody>{rows}</tbody></table>'
    x = ' class="sp-facts__x"'
    rows = ''.join(f'<tr{x if i >= fold else ""}><th scope="row">{e(k)}</th><td>{e(v)}</td></tr>' for i, (k, v) in enumerate(facts))
    return (f'<div class="sp-facts-wrap"><table class="sp-facts sp-facts--fold" id="{tid}"><caption class="sr-only">{e(caption)}</caption><tbody>{rows}</tbody></table>'
            f'<button class="sp-facts__more" type="button" aria-expanded="false" aria-controls="{tid}" data-facts-more>'
            f'<span>{e(more)} ({len(facts)})</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9.5l6 6 6-6"/></svg></button></div>')


def brief_html(answer, facts, caption, head_id, toc=None, toc_label='On this page', fold=0, more='All facts'):
    """The 'In short' answer card that sits right under the hero: one quotable paragraph + a key-facts table + byline,
    and optionally an 'On this page' list of jump links (toc = [(anchor id, label)]), a swipe row of chips on phones.
    fold: see facts_html."""
    nav = (f'<nav class="sp-toc" aria-label="{ea(toc_label)}"><p>{e(toc_label)}</p><ol>'
           + ''.join(f'<li><a href="#{ea(a)}">{e(t)}</a></li>' for a, t in toc) + '</ol></nav>') if toc else ''
    return f'''
  <section class="section sp-brief-wrap" aria-labelledby="{head_id}">
    <div class="wrap">
      <div class="sp-brief" data-reveal>
        <div class="sp-brief__answer">
          <h2 class="eyebrow" id="{head_id}">In short</h2>
          <p class="sp-brief__text">{e(answer)}</p>
          {byline()}{nav}
        </div>
        {facts_html(facts, caption, fold, more, f'{head_id}-facts')}
      </div>
    </div>
  </section>'''


# ---------------------------------------------------------------- shared page shell for /about and /services
def _head(ctx, url, title, desc, ld, og=None, extra_head=None, lang='en-IN'):
    site, v = ctx['SITE_URL'], ctx['_v']
    og = og or (site + 'og-image.png', 'U Scale by Mehul Karotra: Be found. Be chosen.')
    # hreflang only for the English pages (one language per URL, no translated twins); a Hinglish page declares its own
    # language on <html> and in og:locale instead of claiming to be the en-IN version.
    alt = (f'<link rel="alternate" hreflang="en-IN" href="{url}">\n<link rel="alternate" hreflang="x-default" href="{url}">\n'
           if lang == 'en-IN' else '')
    locale = 'hi_IN' if lang.startswith('hi') else 'en_IN'
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{ea(desc)}">
<meta name="robots" content="{ctx['ROBOTS']}">
<meta name="author" content="Mehul Karotra">
<meta name="theme-color" content="#FAF9FC">
<link rel="canonical" href="{url}">
{alt}<meta property="og:type" content="{'profile' if url.endswith('/about') else 'website'}">
<meta property="og:locale" content="{locale}">
<meta property="og:site_name" content="U Scale">
<meta property="og:title" content="{ea(title)}">
<meta property="og:description" content="{ea(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og[0]}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{ea(og[1])}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ea(title)}">
<meta name="twitter:description" content="{ea(desc)}">
<meta name="twitter:image" content="{og[0]}">
{ctx['ICONS_HEAD']}
<link rel="preload" href="/assets/fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
{extra_head + chr(10) if extra_head else ''}<script type="application/ld+json">{ld}</script>
<script>(function(){{var d=document.documentElement;d.classList.add('js','intro-skip');var m=null;try{{m=localStorage.getItem('us-motion');}}catch(e){{}}if(m==='off')d.classList.add('rm');if(navigator.webdriver)d.classList.add('agent','rm','intro-skip');}})();</script>
<link rel="stylesheet" href="/styles.css?v={v}">
</head>'''


def _hero(crumb, title, lead, eyebrow=None, cta=True):
    wa = 'https://wa.me/917977360142?text=' + urllib.parse.quote("Hi Mehul, I'd like to talk about my business.")
    eb = f'<p class="eyebrow">{e(eyebrow)}</p>' if eyebrow else ''
    btns = (f'''<div class="hero__cta" data-wa-zone>
        <a class="btn btn--go" href="/#contact" data-magnetic>Get a free audit <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></a>
        <a class="btn btn--ghost" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>Chat on WhatsApp</a>
      </div>''' if cta else '')
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">{e(crumb)}</li></ol></nav>
      {eb}<h1 class="sp-hero__title" id="page-title">{e(title)}<span class="dot">.</span></h1>
      <p class="sp-hero__lead">{e(lead)}</p>
      {btns}
    </section>
  </div>'''


def _page(ctx, parts, url, title, desc, ld, body, og=None, extra_head=None, lang='en-IN'):
    header, menu, footer, tail = parts
    v = ctx['_v']
    return f'''{_head(ctx, url, title, desc, ld, og, extra_head, lang)}
<body class="page-sub">
<a class="skip" href="#main">Skip to content</a>
{header}
{menu}
<main id="main">
{body}
</main>
{footer}
{tail}
<script defer src="/script.js?v={v}"></script>
</body>
</html>
'''


def _faq_section(items, title, hid='faq-title'):
    return f'''
  <section class="section faq" aria-labelledby="{hid}">
    <div class="wrap faq__grid">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>FAQ</p>
        <h2 class="h2" id="{hid}" data-split>{e(title)}</h2>
      </header>
      <div class="faq__list" data-accordion data-reveal>
{SP.faq_html(items)}
      </div>
    </div>
  </section>'''


def _faq_ld(url, items):
    return {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in items]}


# ---------------------------------------------------------------- /about
ABOUT_FACTS = [('Name', 'Mehul Karotra'), ('Role', 'Founder of U Scale; website designer and developer (UI/UX)'), ('Founded', 'U Scale, 2026'),
               ('Based in', ENTITY['base'] + ', Maharashtra, India'), ('Now', 'UI/UX Developer, Apex36 Technologies'),
               ('Formerly', 'My Country Mobile · ApplQ Innovations · Threepin Info Tec.'),
               ('Languages', 'English and Hindi'), ('Contact', f'WhatsApp or call {SP.PHONE_D} · {SP.EMAIL}')]
ABOUT_FAQ = [
    ('Who is Mehul Karotra?', 'Mehul Karotra is a website designer and developer based in Mumbai, India, and the founder of U Scale. He personally designs '
     'and builds websites and runs SEO, social media, Google and Meta ads and AI search visibility for businesses.'),
    ('What is U Scale?', 'U Scale is Mehul Karotra’s independent web design and digital marketing practice in Mumbai. Clients sign with him '
     'directly, on fixed-price contracts for websites or monthly plans for marketing, and every price is published at uscale.in/pricing.'),
    ('Is U Scale an agency or a freelancer?', 'A bit of both. U Scale is one person, Mehul Karotra, working as an independent, contract-based partner. '
     'You get the design, development and marketing an agency offers, but you sign with him and talk to him directly. If a project needs a specialist, '
     'like a photographer, he brings them in and stays your single point of contact.'),
    ('Where is U Scale based?', 'U Scale is based in Mumbai. Mehul meets clients across Mumbai, Thane and Navi Mumbai, and works '
     'with businesses across India remotely.'),
    ('How do I contact Mehul Karotra?', f'WhatsApp or call {SP.PHONE_D}, or email {SP.EMAIL}. He replies personally within 24 hours, usually much faster on WhatsApp.'),
]
ABOUT_ANSWER = ('Mehul Karotra is a website designer and developer based in Mumbai, India, and the founder of U Scale. He personally designs and '
                'builds websites and runs SEO, social media, Google and Meta ads and AI search visibility for businesses, on fixed-price '
                'contracts or monthly plans, with every price published at uscale.in/pricing.')
HOW = [('Audit', 'I go through your website, Google listing and social media and show you exactly where you are losing enquiries.'),
       ('Written plan', 'What I will do, by when, and the exact price, all in writing. No jargon.'),
       ('Build', 'I design, build and launch it myself, and you see progress every week.'),
       ('Grow', 'Every month I improve what is working, cut what is not, and send you a clear report.')]


def about_page(ctx, parts):
    site = ctx['SITE_URL']; url = site + 'about'
    title = 'About Mehul Karotra, Founder of U Scale | Mumbai'
    desc = ('Mehul Karotra is a Mumbai website designer and developer, and founder of U Scale: websites, SEO, social media, ads and '
            'AI search visibility, done personally.')
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': ['AboutPage', 'ProfilePage'], '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'inLanguage': 'en-IN',
         'isPartOf': {'@id': site + '#website'}, 'mainEntity': {'@id': site + '#mehul'}, 'about': {'@id': site + '#business'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'dateCreated': '2026-10-19T20:42:57+05:30', 'dateModified': '__LASTMOD__'},
        person_full(site), biz_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site}, {'@type': 'ListItem', 'position': 2, 'name': 'About', 'item': url}]},
        _faq_ld(url, ABOUT_FAQ)]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    work = ''.join(f'<li><a class="tlink" href="{ea(w[5])}" target="_blank" rel="noopener">{e(w[1])}</a> <span>{e(SP.work_meta(w))}</span>'
                   f'<span class="sr-only"> (opens in a new tab)</span></li>' for w in ctx['WORK'])
    svcs = ''.join(f'<li><a class="tlink" href="/services/{s["slug"]}">{e(s["name"])}</a></li>' for s in SP.SERVICES)
    steps = ''.join(f'<li class="step" data-reveal><span class="step__num" aria-hidden="true" data-n="{i+1}">{i+1:02d}</span><h3><span class="sr-only">Step {i+1}: </span>{e(t)}</h3><p>{e(d)}</p></li>'
                    for i, (t, d) in enumerate(HOW))
    body = f'''{_hero('About', 'About Mehul Karotra', 'I’m Mehul, a website designer and developer from Mumbai and the person behind U Scale. I started U Scale because small businesses deserve agency-quality work without paying for account managers and middlemen. When you work with U Scale, you work with me: I design it, build it, market it, and answer your WhatsApp myself.', eyebrow='The person doing your work')}
{brief_html(ABOUT_ANSWER, ABOUT_FACTS, 'Key facts about Mehul Karotra', 'about-brief')}

  <section class="section sp-q sp-q--img" aria-label="Photo">
    <div class="wrap sp-prose"><figure class="sp-fig sp-fig--portrait"><picture><source type="image/avif" srcset="/{FOUNDER['image'].replace('.webp', '')}-480.avif 480w, /{FOUNDER['image'].replace('.webp', '')}-640.avif 640w, /{FOUNDER['image'].replace('.webp', '')}.avif 1200w" sizes="(max-width: 400px) 100vw, 340px"><img src="/{FOUNDER['image']}" srcset="/{FOUNDER['image'].replace('.webp', '')}-480.webp 480w, /{FOUNDER['image'].replace('.webp', '')}-640.webp 640w, /{FOUNDER['image'].replace('.webp', '')}.webp 1200w" sizes="(max-width: 400px) 100vw, 340px" width="1200" height="1200" alt="Mehul Karotra, website designer and founder of U Scale, based in Mumbai" loading="lazy" decoding="async"></picture><figcaption>Mehul Karotra, founder of U Scale.</figcaption></figure></div>
  </section>

  <section class="section" aria-labelledby="what-title">
    <div class="wrap sp-prose">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>What U Scale is</p>
        <h2 class="h2" id="what-title" data-split>Agency-quality work, without the agency.</h2>
      </header>
      <p>U Scale is not an agency with account managers. It is me, working as an independent, contract-based partner. Websites and branding are fixed-price contracts: 20% to start, 20% on design sign-off and 60% on launch. Marketing runs as a monthly plan: 3 months minimum, then month-to-month with 30 days’ notice. Every price is on the <a class="tlink" href="/pricing">pricing page</a>.</p>
      <p>If a project ever needs a specialist, like a photographer, I bring them in and stay your single point of contact. I reply personally within 24 hours, usually much faster on WhatsApp.</p>
      <p>Websites and marketing are what I do. When a business needs custom software or an AI product built, I point them to U Scale’s sister company, <a class="tlink" href="https://www.apex36tech.com/" target="_blank" rel="noopener">Apex36 Technologies</a><span class="sr-only"> (opens in a new tab)</span>, a separate Mumbai studio for software and AI.</p>
      <h3>What I do</h3>
      <ul class="sp-list">{svcs}<li><a class="tlink" href="/services">All services and prices</a></li></ul>
      <h3>Selected work</h3>
      <ul class="sp-list sp-list--work">{work}</ul>
      <h3>Elsewhere</h3>
      <ul class="sp-list"><li><a class="tlink" href="{LINKEDIN}" target="_blank" rel="noopener me">LinkedIn</a><span class="sr-only"> (opens in a new tab)</span></li><li><a class="tlink" href="{GITHUB}" target="_blank" rel="noopener me">GitHub</a><span class="sr-only"> (opens in a new tab)</span></li><li><a class="tlink" href="{INSTAGRAM}" target="_blank" rel="noopener me">Instagram @uscalewithus</a><span class="sr-only"> (opens in a new tab)</span></li></ul>
    </div>
  </section>

  <section class="section process sp-process" aria-labelledby="how-title">
    <div class="wrap">
      <header class="proc__head">
        <p class="eyebrow" data-reveal data-scramble>How I work</p>
        <h2 class="h2" id="how-title" data-split>Four clear steps.</h2>
      </header>
      <ol class="steps" data-progress="steps" data-reveal-group>{steps}</ol>
    </div>
  </section>
{_faq_section(ABOUT_FAQ, 'About U Scale.')}'''
    return _page(ctx, parts, url, title, desc, ld, body)


# ---------------------------------------------------------------- /image-license
def image_license_page(ctx, parts):
    site = ctx['SITE_URL']; url = site + LICENSE_SLUG
    title = 'Image Use and Licensing | U Scale'
    desc = ('Photos, graphics and mockups on uscale.in are © U Scale by Mehul Karotra. Who owns them and how to ask before you reuse one.')
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'inLanguage': 'en-IN',
         'isPartOf': {'@id': site + '#website'}, 'about': {'@id': site + '#business'}, 'publisher': {'@id': site + '#business'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'dateModified': '__LASTMOD__'},
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site},
            {'@type': 'ListItem', 'position': 2, 'name': 'Image use and licensing', 'item': url}]}]},
        ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    body = f'''{_hero('Image use', 'Image use and licensing', 'The photos, graphics and mockups on this site are made for U Scale. Here is who owns them and how to ask before you use one.', cta=False)}

  <section class="section" aria-labelledby="own-title">
    <div class="wrap sp-prose">
      <h3 id="own-title">Who owns the images</h3>
      <p>Unless a caption says otherwise, every photo, illustration, mockup and graphic on uscale.in is {e(COPYRIGHT)}</p>
      <p>Brands shown in demo images, such as Chai Kona or Saanjh Studio, are made-up samples, not real businesses. Screenshots of client websites show work U Scale did; those websites, their names and their logos belong to the businesses that own them.</p>
      <h3 id="use-title">Using an image</h3>
      <p>You are welcome to link to any page on this site. To reuse an image anywhere else, in an article, a presentation, a listing or a social post, please ask first.</p>
      <p>Email <a class="tlink" href="mailto:{ea(SP.EMAIL)}">{e(SP.EMAIL)}</a> or WhatsApp {e(SP.PHONE_D)} with a link to the image and where you would like to use it. I reply personally within 24 hours. If I say yes, credit it as “Image: U Scale (uscale.in)”.</p>
    </div>
  </section>'''
    return _page(ctx, parts, url, title, desc, ld, body)


# ---------------------------------------------------------------- /services (hub)
EXTRA_SERVICES = [  # offered on the price list, without a page of their own
    ('Branding & identity', 'Logos, visual identity and messaging.', ['Logo', 'Identity kit', 'Full identity system']),
    ('Content & reels production', 'Reels, shorts and ad creatives, shot and edited for your brand.', ['Reel edit (your footage)', 'Half-day shoot + 3 reels', 'Full-day shoot + 6 reels']),
    ('WhatsApp automation', 'Automatic replies, broadcast messages and follow-ups for your WhatsApp enquiries.', ['WhatsApp automation']),
    ('Email marketing', 'Newsletters and automated email follow-ups.', ['Email marketing']),
    ('Review & reputation management', 'Reviews monitored and answered, and new ones requested from real customers.', ['Review & reputation management']),
    ('Writing', 'SEO blogs, website copy and LinkedIn articles.', ['SEO blog (~1,000 words)', 'Website copy', 'LinkedIn article']),
]
SVC_FROM = {'website-design-mumbai': 'From ₹25,000 one-time', 'seo-mumbai': 'From ₹15,000/month', 'social-media-management-mumbai': '₹12,000/month + content from ₹800',
            'google-meta-ads-mumbai': '₹20,000/month + ₹10,000 setup', 'ai-search-visibility': '₹12,000/month'}
HUB_ANSWER = ('U Scale offers website design and development (from ₹25,000), SEO (from ₹15,000 a month), social media management '
              '(₹12,000 a month plus content), Google & Meta ads management (₹20,000 a month) and AI search visibility (₹12,000 a month), '
              'plus branding, reels, WhatsApp automation and reputation management. Every service is handled personally by Mehul Karotra in Mumbai.')
HUB_FAQ = [
    ('What services does U Scale offer?', 'Website design and development, SEO, social media management, Google and Meta ads, AI search visibility (GEO), '
     'branding and identity, content and reels production, WhatsApp automation, email marketing, review and reputation management, and writing.'),
    ('Can I combine services?', 'Yes. There are no fixed packages: you pick only what you need and the quote builder on the pricing page adds it up. '
     'Monthly services run for 3 months minimum, then month-to-month with 30 days’ notice.'),
    ('Who does the work?', 'Mehul Karotra, personally. If a project needs a specialist like a photographer, he brings them in and '
     'stays your single point of contact.'),
]


def services_hub(ctx, parts):
    site = ctx['SITE_URL']; url = site + 'services'
    title = 'Web Design, SEO & Ads Services in Mumbai, With Prices'
    desc = ('Websites, SEO, social media, Google and Meta ads and AI search visibility from one person, Mehul Karotra, '
            'with every price published. Free audit on WhatsApp.')
    # No Offers here: most of those prices are not on this page. Each service page and /pricing carry the priced Offers.
    items = []
    for i, s in enumerate(SP.SERVICES):
        items.append({'@type': 'ListItem', 'position': i + 1, 'item': {
            '@type': 'Service', '@id': SP.svc_url(site, s) + '#service', 'name': s['name'], 'url': SP.svc_url(site, s), 'description': s['answer'],
            'provider': {'@id': site + '#business'}}})
    for j, (n, d, names) in enumerate(EXTRA_SERVICES):
        items.append({'@type': 'ListItem', 'position': len(SP.SERVICES) + j + 1, 'item': {
            '@type': 'Service', 'name': n, 'description': d, 'url': site + 'pricing', 'provider': {'@id': site + '#business'}}})
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'inLanguage': 'en-IN',
         'isPartOf': {'@id': site + '#website'}, 'about': {'@id': site + '#business'}, 'author': {'@id': site + '#mehul'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'mainEntity': {'@id': url + '#list'}, 'dateModified': '__LASTMOD__'},
        {'@type': 'ItemList', '@id': url + '#list', 'name': 'U Scale services', 'itemListElement': items},
        biz_ref(site), person_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site}, {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': url}]},
        _faq_ld(url, HUB_FAQ)]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    import geo_pages as GP, svc_pages as SVP
    SVC_ICON = {'website-design-mumbai': 'globe', 'seo-mumbai': 'pin', 'social-media-management-mumbai': 'camera', 'google-meta-ads-mumbai': 'bolt', 'ai-search-visibility': 'chat'}
    cards = GP._cards(dict(cols=3, numbered=False, items=[
        (SVC_ICON[s['slug']], s['name'], f'{e(s["answer"])}<span class="sv-from"><b>{e(SVC_FROM[s["slug"]])}</b><a class="tlink" href="/services/{s["slug"]}">{e(s["short"])} details<span class="sr-only">: {e(s["name"])}</span></a></span>')
        for s in SP.SERVICES], cta=('/#contact', 'chat', 'Not sure where to start?', 'Tell me about your business and I’ll suggest the smallest useful first step. The first check is free.', 'Get a free audit')))
    EXTRA_ICON = {'Branding & identity': 'pen', 'Content & reels production': 'camera', 'WhatsApp automation': 'chat', 'Email marketing': 'file',
                  'Review & reputation management': 'star', 'Writing': 'layers'}
    extra = GP._cards(dict(cols=3, numbered=False, items=[
        (EXTRA_ICON[n], n, f'{e(d)}<span class="sv-from sv-from--list">' + ''.join(f'<span>{"" if x == n else e(x) + " "}<b>{e(_price(x)[0])}</b></span>' for x in names) + '</span>') for n, d, names in EXTRA_SERVICES]))
    hub = dict(crumbs=[], crumb='Services', eyebrow='Web design and digital marketing', h1='Services and prices',
               lead='Web design, SEO and digital marketing for Mumbai businesses, done by me, Mehul Karotra. No account managers, nothing comes out of a template, and every price is published.',
               art=dict(kind='menu'), stats=[('5', 'Core services'), ('₹800', 'Single pieces from'), ('Free', 'First audit')])
    hero = SVP._hero(hub, 'https://wa.me/' + ENTITY['whatsapp'] + '?text=' + urllib.parse.quote("Hi Mehul, I'd like to talk about my business."), ctx['ICONS'])
    body = f'''{hero}
{brief_html(HUB_ANSWER, [('Who does the work', 'Mehul Karotra, personally'), ('Where', 'Mumbai, and businesses across India'),
                         ('Websites', 'Fixed price: 20% to start, 20% on design sign-off, 60% on launch'), ('Monthly services', CONTRACT),
                         ('Free audit', 'Every project starts with a free audit of your website, Google listing and social media')],
            'Key facts about U Scale services', 'svc-brief')}

  <section class="section" aria-labelledby="svc-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Core services</p>
        <h2 class="h2" id="svc-title" data-split>Five ways I can help your business grow.</h2>
      </header>
      {cards}
    </div>
  </section>

  <section class="section" aria-labelledby="by-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Website design</p>
        <h2 class="h2" id="by-title" data-split>Websites by business type and area.</h2>
      </header>
      {__import__('geo_pages').related_html()}
    </div>
  </section>

  <section class="section" aria-labelledby="also-title">
    <div class="wrap">
      <header class="sec-head">
        <p class="eyebrow" data-reveal data-scramble>Also available</p>
        <h2 class="h2" id="also-title" data-split>Single pieces and add-ons.</h2>
      </header>
      {extra}
      <p class="fp-all"><a class="tlink" href="/pricing">See the full price list and quote builder</a></p>
    </div>
  </section>
{_faq_section(HUB_FAQ, 'Services questions.')}'''
    return _page(ctx, parts, url, title, desc, ld, body)


# ---------------------------------------------------------------- honest dates
DATES_FILE = config.REPO / 'source' / 'build' / 'page-dates.json'


_FP_PARTS = re.compile(r'<main\b.*?</main>|<title>.*?</title>|<meta name="description"[^>]*>|<script type="application/ld\+json">.*?</script>', re.S)


def _fingerprint(html):
    """Content hash of what the page says: <main>, the title, the meta description and the JSON-LD. Shared chrome
    (header, nav, footer, scripts) is left out, so a footer tweak does not move every page's "updated" date.
    Also ignores what changes on every build: dates, asset versions, build stamps."""
    h = '\n'.join(_FP_PARTS.findall(html)) or html
    h = re.sub(r'__LASTMOD(_H)?__', '', h)
    h = re.sub(r'\?v=[A-Za-z0-9]+', '', h)
    h = re.sub(r'\d{4}-\d{2}-\d{2}', '', h)
    return hashlib.sha1(h.encode()).hexdigest()[:16]


def ld_datetime(day):
    """YYYY-MM-DD -> ISO 8601 datetime in India time. Visible <time> tags and sitemaps keep the plain date."""
    return f'{day}T00:00:00+05:30'


def stamp_pages(out, site, rels):
    """For each built page: keep its last-changed date while its content is unchanged, else set it to today.
    Writes the dates into the page (__LASTMOD__ placeholders) and returns {url: date} for the sitemap and IndexNow.
    page-dates.json is committed, so the dates survive deploys; Vercel builds read it but never write it."""
    try:
        known = json.loads(DATES_FILE.read_text())
    except (OSError, ValueError):
        known = {}
    dates, changed = {}, False
    for rel in rels:
        p = out / rel
        html = complete_graph(p.read_text(), site)
        url = site + ('' if rel == 'index.html' else rel[:-5].replace('/index', ''))
        fp = _fingerprint(html)
        k = known.get(url)
        if not k or k.get('fp') != fp:
            k = {'fp': fp, 'date': TODAY}; known[url] = k; changed = True
        dates[url] = k['date']
        html = html.replace('"dateModified":"__LASTMOD__"', f'"dateModified":"{ld_datetime(k["date"])}"')
        p.write_text(html.replace('__LASTMOD_H__', human(k['date'])).replace('__LASTMOD__', k['date']))
    if changed and not os.environ.get('VERCEL'):
        DATES_FILE.write_text(json.dumps(dict(sorted(known.items())), indent=1) + '\n')
    return dates


# ---------------------------------------------------------------- crawlers
AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
           'Google-Extended', 'GoogleOther', 'Google-CloudVertexBot', 'Applebot', 'Applebot-Extended', 'Bingbot',
           # Meta AI (including Muse) reads the web through Meta's own crawlers
           'meta-externalagent', 'meta-externalfetcher', 'FacebookBot', 'facebookexternalhit',
           'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'YouBot', 'PhindBot', 'AI2Bot', 'Diffbot', 'DeepSeekBot',
           'Bytespider', 'TikTokSpider', 'PetalBot', 'CCBot']


def robots_txt(site):
    rules = '\n'.join(f'User-agent: {b}\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /_blog/\nDisallow: /import-media/\nDisallow: /*?preview=\n' for b in AI_BOTS)
    return ('User-agent: *\nAllow: /\nDisallow: /404\nDisallow: /admin\nDisallow: /api/\nDisallow: /_blog/\nDisallow: /import-media/\nDisallow: /*?preview=\n\n'
            '# AI assistants and answer engines are welcome to read, quote and cite this site.\n'
            f'# Summary for AI tools: {site}llms.txt (full text: {site}llms-full.txt)\n\n'
            + rules + f'\nSitemap: {site}sitemap.xml\n')


def llms_full(site, faq):
    """Everything an AI assistant needs to describe U Scale accurately, in one plain-text file."""
    L = [SP.llms_txt(site, faq).rstrip(), '', '---', '', '# Full detail', '']
    L += ['## About Mehul Karotra', '', ABOUT_ANSWER, ''] + [f'- {k}: {v}' for k, v in ABOUT_FACTS] + ['', f'Profile: {site}about', '']
    import svc_pages
    rebuilt = {p['slug'] for p in svc_pages.SERVICE_PAGES}
    for s in SP.SERVICES:
        if s['slug'] in rebuilt: continue
        L += [f'## {s["name"]}', '', f'URL: {SP.svc_url(site, s)}', '', s['answer'], '']
        L += [f'- {k}: {v}' for k, v in s['facts']] + ['', '### What is included', '']
        L += [f'- {t}: {d}' for t, d in s['items']] + ['', '### How it works', '']
        L += [f'{i+1}. {t}: {d}' for i, (t, d) in enumerate(s['steps'])] + ['', '### Questions', '']
        L += [f'**{q}**\n{a}\n' for q, a in s['faq']]
    L += svc_pages.llms_full(site)
    import geo_pages
    L += geo_pages.llms_full(site)
    import city_pages
    L += city_pages.llms_full(site)
    L += ['## Free tools', '',
          f'- Google Business Profile checker: {site}tools/google-business-profile-checker. {SP.GBP["lead"]}',
          f'- Google review link & QR code maker: {site}tools/google-review-qr-code. {SP.TOOL["lead"]}',
          f'- Visiting card maker: {site}tools/visiting-card-maker. Free, with editable designs and PNG, SVG and print PDF downloads, in English, Hindi or Marathi. No sign-up and no watermark.',
          f'- QR code generator: {site}tools/qr-code-generator. Free codes for links, contacts, WhatsApp, UPI, Wi-Fi and more, with your own shapes, colours and logo, and PNG, SVG and PDF downloads. Codes never expire. No sign-up and no watermark.', '']
    return '\n'.join(L) + '\n'
