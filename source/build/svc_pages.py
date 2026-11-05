"""Service pages (SEO, social media, ads, AI search) and the About page, built on the focus-page system (geo_pages.py).

Same URLs, titles and meta descriptions as before. What changed: each page now answers its own Mumbai questions
in its own sections, with its own hero graphic, process, honest limits, sources and related guides, instead of one
shared template that repeated "Everything handled by one person" and "Four clear steps" on every page.

Rules (same as geo_pages.py): every rupee figure comes from pricing_data.py; every outside fact links to the official
page it came from; nothing invented: no results, clients, numbers or reviews. Illustrations say they are illustrations.
"""
import json, urllib.parse

import aeo
import geo_pages as GP
import seo_pages as SP
from geo_pages import (P, Cards, Table, Options, Links, Chips, Svg, Tools, Img, Sec, icon, price, _fmt)

e, ea = SP.e, SP.ea

# Official sources these pages cite (checked 5 Nov 2026). Added to geo_pages' list so its renderers can use them.
GP.SRC.update({
    'gbp-guidelines': ('Google Business Profile Help', 'Guidelines for representing your business on Google', 'https://support.google.com/business/answer/3038177'),
    'ugc-policy': ('Google Maps Help', 'Prohibited and restricted content: fake engagement and reviews', 'https://support.google.com/contributionpolicy/answer/7400114'),
    'seo-starter': ('Google Search Central', 'SEO Starter Guide: the basics', 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'),
    'helpful': ('Google Search Central', 'Creating helpful, reliable, people-first content', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'),
    'ai-features': ('Google Search Central', 'AI features and your website', 'https://developers.google.com/search/docs/appearance/ai-features'),
    'openai-bots': ('OpenAI', 'Overview of OpenAI crawlers (OAI-SearchBot, ChatGPT-User, GPTBot)', 'https://platform.openai.com/docs/bots'),
    'pplx-bots': ('Perplexity', 'Perplexity crawlers', 'https://docs.perplexity.ai/guides/bots'),
    'pmax': ('Google Ads Help', 'About Performance Max campaigns', 'https://support.google.com/google-ads/answer/10724817'),
    'ctwa': ('WhatsApp Business', 'Ads that click to WhatsApp', 'https://whatsappbusiness.com/products/ads-that-click-to-whatsapp/'),
    'local-schema': ('Google Search Central', 'Local business structured data', 'https://developers.google.com/search/docs/appearance/structured-data/local-business'),
})

WA = 'https://wa.me/' + aeo.ENTITY['whatsapp'] + '?text='
GUIDE = {  # blog guides, for "read next" links
    'maps': ('/blog/business-not-showing-on-google-maps', 'pin', 'Business not showing on Google Maps? 11 fixes', 'Visibility and ranking fixes, including address problems common in Indian cities.'),
    'reviews': ('/blog/how-to-get-more-google-reviews', 'star', 'How to get more Google reviews in 2026', 'Your review link and QR code, WhatsApp scripts in English and Hinglish, reply templates.'),
    'vanish': ('/blog/why-google-reviews-disappearing', 'alert', 'Why Google reviews disappear', 'Nine reasons reviews vanish, who can appeal, and how to protect them.'),
    'insta': ('/blog/instagram-posts-google-search-seo', 'camera', 'Your Instagram posts now show up on Google', 'Captions Google can read, and linking Instagram to your Google profile.'),
    'wa': ('/blog/whatsapp-business-charges-india', 'chat', 'WhatsApp Business charges in India (2026)', 'What is free on the app, what the API costs per message, and what changed.'),
    'chatgpt': ('/blog/get-business-recommended-chatgpt-google-ai-mode', 'bolt', 'Get recommended by ChatGPT and Google AI Mode', 'How AI picks local businesses, and six steps for Indian businesses.'),
    'askmaps': ('/blog/ask-maps-google-maps-india', 'map', 'Ask Maps is here in India, in Hindi too', 'What Google Maps’ AI chat says about your shop, and how to check it.'),
    'diwali': ('/blog/diwali-2026-marketing-ideas-small-business', 'calendar', 'Diwali 2026 marketing ideas', 'A dated checklist for Google offers, holiday hours, photos and WhatsApp.'),
    'wedding': ('/blog/wedding-season-marketing-ideas-local-shops', 'calendar', 'Wedding season 2026–27 plan for shops', 'Muhurat dates and a four-week plan for Google, Instagram and WhatsApp.'),
    'cost': ('/blog/website-design-cost-mumbai', 'rupee', 'Website design cost in Mumbai (2026)', 'Real price ranges, yearly costs, GST and red flags before you pay.'),
}


def guides(*keys):
    return Links([(h, ic, t, d, '') for h, ic, t, d in (GUIDE[k] for k in keys)])


def svc(slug):
    return next(s for s in SP.SERVICES if s['slug'] == slug)


def faq_of(slug, extra=()):
    """The service's existing questions (with their richer answers from aeo.BRIEF), then any new ones; no repeats."""
    s = svc(slug)
    seen, out = set(), []
    for q, a in list(s['faq']) + list(extra):
        if q not in seen:
            seen.add(q); out.append((q, a))
    return out


# ---------------------------------------------------------------- hero graphics, one per page, drawn with depth in depth_art.py
ARTS = {k: __import__('depth_art').CARDS[k] for k in ('pack', 'calendar', 'answer', 'menu', 'prices')}  # the cards with depth


def hero_art(p):
    k = p['art']['kind']
    return ARTS[k]() if k in ARTS else GP._hero_art(p)


# ---------------------------------------------------------------- the pages
LOCAL, TECH = price('Local SEO / Google Business Profile'), price('Technical + on-page SEO')

SEO = dict(
    slug='seo-mumbai', path='services/seo-mumbai', crumbs=[('Services', '/services')], crumb='SEO services', service='SEO services in Mumbai',
    eyebrow='Local and technical SEO', art=dict(kind='pack'),
    stats=[(LOCAL.split('/')[0], 'Local SEO, per month'), ('3–6 mo', 'To real progress'), ('Free', 'First check')],
    wa="Hi Mehul, I'd like to talk about SEO for my business.",
    sections=[
        Sec('How people in Mumbai search for a business like yours',
            P('Most people who need a dentist, a CA, a salon or an AC repair in Mumbai start on their phone: “near me”, the name of their area, or a station '
              'they know. Many type in English, some in Hindi or Hinglish (“Ghatkopar mein CA”), and a lot of them never reach a website at all. They call, '
              'ask for directions or tap WhatsApp straight from the Google listing.'),
            Cards([('pin', '“Near me” and area names', 'Searches like “clinic near Ghatkopar station” or “salon in Powai” show a map with a few businesses first. Being in that map is the job.'),
                   ('phone', 'On a phone, between things', 'People decide in seconds: rating, photos, timings, distance. A complete listing answers those questions before they ask.'),
                   ('chat', 'English, Hindi and Hinglish', 'Your services, area and timings are written the way your customers search, on your listing and on your website.')], cols=3),
            eyebrow='Search in Mumbai'),
        Sec('What Google weighs in the map results',
            P('Google says it ranks local results on three things. Two of them are in your hands. The work is making both of those as strong as they can be, '
              'so distance is the only thing left between you and the customer. ' + GP.src_chip('local-rank')),
            GP.RANKING, Img('found'), eyebrow='Google Maps'),
        Sec('Local SEO or technical SEO: which do you need?',
            Options([dict(name='Local SEO', tag='Shops, clinics, salons, cafés', hi=True,
                          rows=[('Price', LOCAL), ('Main work', 'Google Business Profile, a review plan, directory listings, area pages'),
                                ('Best for', 'Businesses people visit or call'), ('You see', 'Calls, direction requests, website taps, reviews')]),
                     dict(name='Technical + on-page SEO', tag='Websites that should rank', rows=[('Price', TECH), ('Main work', 'Speed, crawling and indexing, titles, headings, internal links, structured data'),
                          ('Best for', 'Service businesses and online stores that win customers from search'), ('You see', 'Rankings, clicks and enquiries from Search Console')])],
                    note='Take one or both. Not sure which? The first check is free, and a full deep-dive audit is ' + price('SEO deep-dive audit (free if we work together)') + ', free if we go on to work together.'),
            eyebrow='Two plans', layout='wide'),
        Sec('A typical month of SEO',
            Table(['Week', 'What happens', 'What you get'],
                  [('Week 1', 'Fix what is broken: listing details, technical errors, tracking', 'A short note of what changed'),
                   ('Week 2', 'Categories, services, photos and pages updated for what people search', 'Before and after, in plain words'),
                   ('Week 3', 'New content or area page, directory consistency, review requests', 'A draft for you to check'),
                   ('Week 4', 'Report and call: what moved, what did not, what is next', 'Calls, directions, clicks and rankings')],
                  'What a typical month of SEO looks like with U Scale'),
            P('SEO is slow on purpose. Expect about 3 to 6 months before real progress, and be wary of anyone promising page one in 30 days.'),
            eyebrow='How it runs', layout='wide', tone='band'),
        Sec('What I won’t do',
            Cards([('alert', 'Fake or paid reviews', 'They break Google’s rules and can get reviews removed or a listing restricted. ' + GP.src_chip('ugc-policy')),
                   ('alert', 'Ranking guarantees', 'Nobody controls Google’s results, or how far a searcher is from you. I guarantee the work and an honest report.'),
                   ('alert', 'Spammy links and keyword stuffing', 'Bought links and pages stuffed with area names can hurt you. Google asks for content written for people. ' + GP.src_chip('helpful')),
                   ('alert', 'Keywords in your business name', 'Adding “best dentist Mumbai” to your Google name breaks its guidelines. Your real name, as on your board. ' + GP.src_chip('gbp-guidelines'))], cols=2),
            eyebrow='Honest SEO'),
        Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
        Sec('Read these first', guides('maps', 'reviews', 'vanish', 'insta'), eyebrow='Guides', layout='wide'),
    ],
    how=dict(head='No guarantees. Clear reports.', sub='From a free check to a report every month.',
             steps=[('search', 'Audit', 'Your website, Google Business Profile and the top local competitors, checked against what customers search.', 'First check free'),
                    ('pen', 'Fix', 'Technical and listing problems fixed first, because they unlock everything else.', 'Month 1'),
                    ('layers', 'Grow', 'Content, reviews, listings and genuine local links, added month by month.', 'Month 2 onwards'),
                    ('file', 'Report', 'A monthly report and call. Honest about what moved and what did not.', 'Every month')],
             promise=[('shield', 'No ranking guarantees, ever'), ('key', 'Your listing and accounts stay in your name'), ('refresh', '3 months minimum, then month-to-month')]),
    who='I check your listing, fix your website and write your pages myself. You talk to me directly on WhatsApp, not to an account manager.',
    faq_extra=[('Can you help if my Google listing is suspended?',
                'Yes. I check what triggered it, fix what goes against Google’s guidelines, and help you file a reinstatement request through Google’s own form. '
                'No one can guarantee Google will reinstate a listing, and anyone who promises to do it for a fee “through contacts” is not being honest.'),
               ('Do I need a Google listing if I don’t have a shop?',
                'If you serve customers at their place, like AC repair, pest control or tuition at home, you can have a service-area listing that shows the areas you '
                'cover without showing your home address.')],
    sources=['local-rank', 'gbp-guidelines', 'ugc-policy', 'helpful', 'seo-starter'],
    offers=['Local SEO / Google Business Profile', 'Technical + on-page SEO', 'SEO deep-dive audit (free if we work together)', 'SEO blog (~1,000 words)'],
    related=['maps', 'reviews', 'askmaps'],
)

POSTS, CAROUSELS, REELS = 12, 4, 4
_content = POSTS * GP.rupees('Social post') + CAROUSELS * GP.rupees('Carousel') + REELS * GP.rupees('Reel edit (your footage)')

SOCIAL = dict(
    slug='social-media-management-mumbai', path='services/social-media-management-mumbai', crumbs=[('Services', '/services')], crumb='Social media management',
    service='Social media management in Mumbai', eyebrow='Instagram, Facebook, LinkedIn, YouTube', art=dict(kind='calendar'),
    stats=[(price('Community & inbox management').split('/')[0], 'Community and inbox, per month'), (price('Social post'), 'Per designed post'), ('You', 'Approve every month')],
    wa="Hi Mehul, I'd like to talk about social media for my business.",
    sections=[
        Sec('Where your Mumbai customers actually are',
            P('For most local businesses, Instagram is where people discover you and WhatsApp is where they ask the question. Facebook still matters for '
              'older customers and local groups, LinkedIn for B2B services, and YouTube Shorts for anything that is easier to show than to tell. '
              'Two platforms done well beat four done badly.'),
            Table(['Platform', 'Best for', 'What I post'],
                  [('Instagram', 'Shops, food, fashion, salons, clinics, studios', 'Reels, carousels, stories, highlights'),
                   ('Facebook', 'Local reach, events, older customers', 'Posts, offers, event pages'),
                   ('LinkedIn', 'CAs, consultants, B2B services', 'Posts and articles that show expertise'),
                   ('YouTube', 'Anything easier to show than tell', 'Shorts, and longer videos when they earn it')],
                  'Which social media platforms suit which Mumbai businesses'),
            P('Instagram posts can now appear in Google search too, so captions written in plain words help you on both. More in the guide: '
              '<a class="tlink" href="/blog/instagram-posts-google-search-seo">your Instagram posts now show up on Google</a>.'),
            eyebrow='Platforms', layout='wide'),
        Sec('A starting month, priced',
            Table(['What', 'How many', 'Price'],
                  [('Designed posts', str(POSTS), _fmt(POSTS * GP.rupees('Social post'))),
                   ('Carousels', str(CAROUSELS), _fmt(CAROUSELS * GP.rupees('Carousel'))),
                   ('Reel edits from your footage', str(REELS), _fmt(REELS * GP.rupees('Reel edit (your footage)'))),
                   ('Content for the month', '20 pieces', _fmt(_content)),
                   ('Community and inbox management', 'Monthly', price('Community & inbox management'))],
                  'A typical starting month of social media with U Scale, priced from the published price list'),
            P(f'Content is priced per piece, so you pay only for what you post. Need footage? A half-day shoot with 3 reels is {price("Half-day shoot + 3 reels")} '
              f'and a full day with 6 reels {price("Full-day shoot + 6 reels")}, at your shop or studio anywhere in Mumbai, Thane or Navi Mumbai.'),
            eyebrow='Prices', tone='band'),
        Sec('What you do, and what I handle',
            Options([dict(name='You', tag='About 30 minutes a month', rows=[('Approve', 'The monthly calendar, before anything goes live'), ('Share', 'Offers, new stock, events, photos you already have'),
                                                                          ('Answer', 'Serious enquiries I pass on to you')]),
                     dict(name='Me', tag='Everything else', hi=True, rows=[('Plan', 'Calendar, ideas and visual direction'), ('Create', 'Posts, carousels and reel edits'),
                                                                            ('Post and reply', 'Publishing, comments and DMs in your voice'), ('Report', 'Reach, saves and enquiries, and what changes next month')])]),
            eyebrow='Who does what', layout='wide'),
        Sec('What I won’t do',
            Cards([('alert', 'Buy followers or likes', 'Fake followers never buy anything, and they make your real reach worse.'),
                   ('alert', 'Promise you’ll go viral', 'No one can. I promise a steady plan, on time, and an honest monthly report.'),
                   ('alert', 'Pass off AI images as your products', 'Customers notice. Real products, real places, real people.'),
                   ('alert', 'Post without your OK', 'You approve the calendar first, and can check any post before it goes out.')], cols=2),
            eyebrow='Honest social'),
        Sec('Read these next', guides('insta', 'wa', 'diwali', 'wedding'), eyebrow='Guides', layout='wide'),
    ],
    how=dict(head='A plan you approve. Posts you’re proud of.', sub='Four steps, then the same rhythm every month.',
             steps=[('search', 'Audit', 'Your profiles, competitors and what your customers already respond to.', 'Free'),
                    ('calendar', 'Plan', 'A content calendar and visual direction for the month.', 'You approve it'),
                    ('pen', 'Create', 'Posts, carousels and reels designed and edited.', 'Priced per piece'),
                    ('refresh', 'Post and improve', 'Publishing, replies, and a monthly look at what worked.', 'Every month')],
             promise=[('key', 'Your accounts stay in your name'), ('file', 'Every price per piece, published'), ('refresh', '3 months minimum, then month-to-month')]),
    who='I plan your calendar, design your posts and edit your reels myself. When a shoot needs a photographer, I bring one in and stay your single point of contact.',
    work=['brandgen', 'vidhi', 'sashe'], work_h='Brands I’ve designed for.',
    work_lead='U Scale started in 2026, so my work so far is mostly websites and marketing visuals. Here are three.',
    faq_extra=[],
    sources=[],
    offers=['Community & inbox management', 'Social post', 'Carousel', 'Designed story', 'Reel edit (your footage)',
            'Premium edit (colour grading, motion graphics)', 'Half-day shoot + 3 reels', 'Full-day shoot + 6 reels'],
    related=['insta', 'wa', 'wedding'],
)


def _fee(spend):
    flat, cap = GP.rupees('Ads management'), 150000
    return flat if spend <= cap else round(spend * 0.12)


ADS = dict(
    slug='google-meta-ads-mumbai', path='services/google-meta-ads-mumbai', crumbs=[('Services', '/services')], crumb='Google & Meta ads',
    service='Google and Meta ads management in Mumbai', eyebrow='Google, Facebook, Instagram, WhatsApp',
    art=dict(kind='img', img='social', chips=[('chat', 'Opens a WhatsApp chat'), ('rupee', 'Ad spend paid to Meta directly')]),
    stats=[(price('Ads management').split('/')[0], 'Per month, up to ₹1.5 lakh spend'), ('₹10,000', 'One-time setup'), ('You', 'Own the ad accounts')],
    wa="Hi Mehul, I'd like to talk about running ads for my business.",
    sections=[
        Sec('Google ads or Meta ads: which first?',
            Options([dict(name='Google Search ads', tag='People already looking', rows=[('Reaches', 'People searching for what you sell, in your area'), ('Best for', 'Urgent and high-intent services: repairs, clinics, coaching, B2B'),
                          ('Also', 'Performance Max: Google’s automatic ads across Search, YouTube and Maps')]),
                     dict(name='Meta ads', tag='People nearby, not searching yet', hi=True, rows=[('Reaches', 'People on Facebook and Instagram, by area and interest'), ('Best for', 'Food, fashion, salons, events, offers, launches'),
                          ('Also', 'Click-to-WhatsApp: the ad opens a chat with you')])],
                    note='Many local businesses use both: Google for people with a need today, Meta to be known before they need you.'),
            eyebrow='Where to start', layout='wide'),
        Sec('How the fee works',
            Table(['Your ad spend a month', 'U Scale fee a month', 'Where the spend goes'],
                  [(_fmt(s), _fmt(_fee(s)), 'Paid by you to Google or Meta') for s in (30000, 150000, 200000, 300000)],
                  'U Scale ads management fee at different monthly ad budgets'),
            P(f'The fee is {price("Ads management")} flat up to ₹1.5 lakh of monthly spend, then 12% of spend, plus a one-time {_fmt(10000)} setup. '
              'Your ad spend is never routed through me: you pay Google and Meta directly from accounts in your name, so you always see every rupee.'),
            eyebrow='Prices', tone='band'),
        Sec('Click-to-WhatsApp ads, explained',
            P('A click-to-WhatsApp ad runs on Facebook or Instagram and opens a WhatsApp chat with your business, with a message already typed. For many '
              'Mumbai customers that is easier than a form or a call, and you keep the chat to follow up. ' + GP.src_chip('ctwa')),
            P('Replies from the WhatsApp Business app are free; the WhatsApp API is charged per message. What changed in 2026: '
              '<a class="tlink" href="/blog/whatsapp-business-charges-india">WhatsApp Business charges in India</a>.'),
            eyebrow='WhatsApp'),
        Sec('Tracking you can trust',
            Cards([('search', 'Google Analytics (GA4)', 'Set up to count calls, WhatsApp taps and form enquiries, not just clicks.'),
                   ('bolt', 'Conversion tracking', 'Google Ads conversions and the Meta pixel, so each campaign shows what it brought in.'),
                   ('key', 'Your accounts', 'The ad accounts, analytics and pixels are in your name, and stay yours if we stop.'),
                   ('file', 'A plain monthly report', 'Spend, leads, cost per lead and what changes next month. No vanity numbers.')], cols=2),
            eyebrow='Measurement'),
        Sec('What I won’t do',
            Cards([('alert', 'Promise a number of leads', 'Results depend on your offer, budget and market. I test, measure and improve every week.'),
                   ('alert', 'Mark up your ad spend', 'Spend goes straight from you to Google and Meta. My fee is separate and published.'),
                   ('alert', 'Lock you out', 'You own the accounts from day one. Nothing is held back if we part ways.'),
                   ('alert', 'Run misleading ads', 'Claims your business can back up, within Google’s and Meta’s ad policies.')], cols=2),
            eyebrow='Honest ads'),
        Sec('Read these next', guides('insta', 'wa', 'diwali', 'wedding'), eyebrow='Guides', layout='wide'),
    ],
    how=dict(head='Test small. Scale what works.', sub='From your goals to a weekly rhythm.',
             steps=[('search', 'Audit', 'Your goals, budget, offers and competitors reviewed.', 'Free'),
                    ('layers', 'Set up', 'Tracking, campaigns, audiences, creatives and a landing page that matches the ad.', f'{_fmt(10000)} once'),
                    ('bolt', 'Launch', 'Ads go live on a test budget, watched closely in week one.', 'Week 1'),
                    ('refresh', 'Optimise', 'Budgets, keywords and creatives adjusted weekly; a clear report monthly.', 'Every week')],
             promise=[('key', 'Ad accounts in your name'), ('rupee', 'Spend paid directly to Google and Meta'), ('refresh', '3 months minimum, then month-to-month')]),
    who='I set up the tracking, build the campaigns and watch them every week myself. You get one person who knows your account, on WhatsApp.',
    faq_extra=[('Can you run ads in Hindi or Marathi?',
                'Yes. Ads, landing pages and WhatsApp replies can be in English, Hindi or Hinglish, or Marathi where your customers prefer it.')],
    sources=['pmax', 'ctwa'],
    offers=['Ads management'],
    related=['wa', 'diwali', 'wedding'],
)

AI = dict(
    slug='ai-search-visibility', path='services/ai-search-visibility', crumbs=[('Services', '/services')], crumb='AI search visibility',
    service='AI search visibility (GEO) in India', eyebrow='ChatGPT, Gemini, Perplexity, Google AI', art=dict(kind='answer'),
    stats=[(price('AI visibility audit (free if we work together)'), 'AI visibility audit'), (price('AI search visibility (GEO)').split('/')[0], 'Per month, ongoing'), ('Monthly', 'Answers re-checked')],
    wa="Hi Mehul, I'd like to check what ChatGPT and Google say about my business.",
    sections=[
        Sec('What an AI visibility audit checks',
            Table(['Check', 'What I look for'],
                  [('Are you named?', 'Real questions your customers ask, put to ChatGPT, Gemini, Perplexity and Google’s AI Overviews and AI Mode'),
                   ('Are the facts right?', 'Name, area, services, prices, timings and phone in each answer'),
                   ('Which sources are cited?', 'Your site, your Google listing, directories, reviews, or a competitor’s page'),
                   ('Can AI crawlers read your site?', 'robots.txt, firewalls and bot protection, and whether your key facts are in the page’s text'),
                   ('Do your facts match everywhere?', 'Website, Google Business Profile, Instagram and directories, line by line'),
                   ('How do competitors appear?', 'Who gets named instead of you, and what their pages do that yours do not')],
                  'What a U Scale AI visibility audit checks'),
            P(f'The audit is {price("AI visibility audit (free if we work together)")}, free if we go on to work together, and you get the answers as screenshots, '
              'not just a score.'),
            eyebrow='AI visibility audit, India', layout='wide'),
        Sec('Questions people in Mumbai now ask AI',
            Cards([('chat', '“Best dentist near Ghatkopar station that’s open on Sunday?”', 'Answered from listings, timings and reviews.'),
                   ('chat', '“Restaurant in Andheri East with its own online ordering?”', 'Answered from websites that say so plainly.'),
                   ('chat', '“Which CA in Mumbai does GST registration, and for how much?”', 'Answered from pages that publish services and prices.'),
                   ('chat', '“Powai mein achha salon kaun sa hai?”', 'Asked in Hinglish, answered from the same facts.')], cols=2),
            P('These are illustrative questions, the kind customers type or speak. Google Maps now answers them too, in Hindi as well: '
              '<a class="tlink" href="/blog/ask-maps-google-maps-india">Ask Maps is here in India</a>.'),
            eyebrow='Real questions'),
        Sec('GEO and SEO: what’s different',
            Table(['', 'SEO', 'GEO (AI search)'],
                  [('Goal', 'Rank your pages in search results', 'Get named, correctly, inside AI answers'),
                   ('Where it shows', 'Google’s blue links and map', 'ChatGPT, Gemini, Perplexity, AI Overviews, AI Mode'),
                   ('What it rests on', 'Readable pages, links, reviews, a complete listing', 'The same, plus clear quotable facts that match everywhere'),
                   ('How it’s measured', 'Rankings, clicks, calls', 'How often and how accurately you are mentioned')],
                  'SEO and GEO compared'),
            P('Mostly it is the same work done more carefully. Google says its AI features have no extra requirements beyond normal SEO. ' + GP.src_chip('ai-features')),
            eyebrow='GEO vs SEO', layout='wide', tone='band'),
        Sec('Make sure AI tools can read your site',
            Cards([('globe', 'Crawlers allowed', 'Your robots.txt and hosting let search and AI crawlers in, such as OpenAI’s OAI-SearchBot and PerplexityBot. ' + GP.src_chip('openai-bots')),
                   ('shield', 'No accidental blocks', 'Firewalls and bot protection often block AI crawlers by default. I check what they actually see. ' + GP.src_chip('pplx-bots')),
                   ('file', 'Facts in the text', 'Prices, timings and services written as text on the page, not only inside images or PDFs.'),
                   ('layers', 'Business details in the code', 'Structured data for your business, the format Google documents for local businesses. ' + GP.src_chip('local-schema'))], cols=2),
            P('This site follows the same rules: every AI crawler is welcome, and a plain-text summary sits at <a class="tlink" href="/llms.txt">uscale.in/llms.txt</a>.'),
            eyebrow='Readable by AI'),
        Sec('What I can’t promise',
            Cards([('alert', 'A mention in ChatGPT', 'No one controls AI answers. I improve the facts they rely on and track how often and how accurately you appear.'),
                   ('alert', 'The same answer every time', 'AI answers change with wording, location and time. I check the same questions every month to see the trend.'),
                   ('alert', 'Shortcuts', 'No fake reviews, paid mentions or pages written for bots. They put your Google listing at risk too.')], cols=3),
            eyebrow='Honest GEO'),
        Sec('Read these next', guides('chatgpt', 'askmaps', 'maps', 'reviews'), eyebrow='Guides', layout='wide'),
    ],
    how=dict(head='See what AI says. Fix what it reads.', sub='An audit, then a monthly loop.',
             steps=[('search', 'Audit', 'What AI assistants say about you and your competitors today, with screenshots.', price('AI visibility audit (free if we work together)')),
                    ('pen', 'Fix the basics', 'Facts, listings and website settings put right, so AI tools can read and trust them.', 'Month 1'),
                    ('file', 'Content', 'Answer-ready pages and FAQs that AI tools can quote.', 'Month by month'),
                    ('refresh', 'Monitor', 'The same questions re-asked every month, and fixes where answers are wrong.', 'Every month')],
             promise=[('shield', 'No promised mentions'), ('file', 'Screenshots of every answer'), ('refresh', '3 months minimum, then month-to-month')]),
    who='I ask the AI tools, read the answers and fix your facts and pages myself. You talk to me directly on WhatsApp.',
    faq_extra=[('Which agency in India can audit how my brand shows up in ChatGPT, Gemini and Perplexity?',
                f'U Scale does, from Mumbai, for businesses across India. An AI visibility audit is {price("AI visibility audit (free if we work together)")}: '
                'Mehul Karotra puts the questions your customers ask to ChatGPT, Gemini, Perplexity and Google’s AI features, and shows you the answers, '
                'the sources they cite and what to fix.'),
               ('Do I need llms.txt for AI search?',
                'No. Google says its AI features need no special files, and other AI companies have not said they rely on llms.txt. It is a tidy extra, not a requirement.')],
    sources=['ai-features', 'openai-bots', 'pplx-bots', 'local-schema', 'helpful'],
    offers=['AI search visibility (GEO)', 'AI visibility audit (free if we work together)'],
    related=['chatgpt', 'askmaps', 'maps'],
)

SERVICE_PAGES = [SEO, SOCIAL, ADS, AI]


# ---------------------------------------------------------------- shared page parts
def _hero(p, wa, icons):
    long = ' stat__num--long' if any(len(n) >= 8 for n, _ in p['stats']) else ''
    stats = ''.join(f'<li class="stat"><span class="stat__num{long}">{e(n)}</span><span class="stat__label">{e(l)}</span></li>' for n, l in p['stats'])
    crumbs = ''.join(f'<li><a href="{ea(h)}">{e(n)}</a></li>' for n, h in p['crumbs'])
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>{crumbs}<li aria-current="page">{e(p['crumb'])}</li></ol></nav>
        <p class="eyebrow">{e(p['eyebrow'])}</p><h1 class="sp-hero__title fp-hero__title" id="page-title">{e(p['h1'])}<span class="dot">.</span></h1>
        <p class="sp-hero__lead">{GP.lead_html(p['lead'])}</p>
        <div class="fp-hero__ctas">
          <div class="hero__cta" data-wa-zone><a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}{e(p.get('cta_label', 'Free audit on WhatsApp'))}</a></div>
          <a class="btn btn--ghost fp-hero__more" href="#brief-title">See prices &amp; facts</a>
        </div>
        <ul class="stats fp-stats">{stats}</ul>
      </div>
      {hero_art(p)}
    </section>
  </div>'''


def _how(p):
    h = p['how']
    li = ''.join(f'<li class="fp-step sv-step" data-reveal><div class="fp-step__body"><span class="sv-step__ic">{icon(ic)}</span><span class="fp-step__n" aria-hidden="true">{i + 1:02d}</span>'
                 f'<h3>{e(t)}</h3><p>{e(d)}</p>' + (f'<span class="fp-step__tag">{e(tag)}</span>' if tag else '') + '</div></li>'
                 for i, (ic, t, d, tag) in enumerate(h['steps']))
    pr = ''.join(f'<li>{icon(ic)}<span>{e(x)}</span></li>' for ic, x in h['promise'])
    return f'''
  <section class="section fp-sec fp-sec--how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head fp-head"><p class="eyebrow">How it works</p><h2 class="h2 fp-h2" id="how-title">{e(h['head'])}</h2><p class="lead">{e(h['sub'])}</p></header>
      <ol class="fp-steps sv-steps fp-snap" data-reveal-group data-snap aria-label="The four steps">{li}</ol>
      <ul class="fp-promise" data-reveal>{pr}</ul>
    </div>
  </section>'''


def _who(p):
    img = GP.IMG['mehul']
    badges = ['Based in Mumbai', 'Works with businesses across India', 'English and Hindi']
    li = ''.join(f'<li>{icon("check")}{e(x)}</li>' for x in badges)
    return f'''
  <section class="section fp-sec fp-sec--who" aria-labelledby="who-title">
    <div class="wrap">
      <div class="fp-who" data-reveal>
        <picture class="fp-who__img"><source type="image/avif" srcset="{GP.vurl(img['file'] + '-480.avif')}"><img src="{GP.vurl(img['file'] + '-480.webp')}" width="480" height="480" alt="{ea(img['alt'])}" loading="lazy" decoding="async"></picture>
        <div class="fp-who__body">
          <p class="eyebrow">Who you’ll work with</p>
          <h2 class="fp-who__h" id="who-title">Mehul Karotra, personally.</h2>
          <p>{e(p['who'])}</p>
          <ul class="fp-who__badges">{li}</ul>
          <a class="tlink" href="/about">More about Mehul</a>
        </div>
      </div>
    </div>
  </section>'''


def _work(ctx, p):
    keys = p.get('work') or []
    if not keys: return ''
    wmap = {w[0]: w for w in ctx['WORK']}
    cards = ''
    for k in keys:
        w = wmap[k]; lw, lh = ctx['SZ'][k]
        cards += (f'<li class="rw"><a href="{w[5]}" target="_blank" rel="noopener" data-cursor="view"><span class="rw__img"><img src="/assets/work/{k}-peek.webp" width="768" height="480" '
                  f'alt="Website for {ea(w[1])}, designed and built by U Scale" loading="lazy" decoding="async"></span><span class="rw__body"><img class="rw__logo" src="/assets/logos/{k}.webp" '
                  f'width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async"><b>{e(w[1])}</b><small>{e(w[2])}</small></span><span class="sr-only"> (opens in a new tab)</span></a></li>')
    return f'''
  <section class="section fp-sec" aria-labelledby="work-title">
    <div class="wrap fp-work">
      <header class="sec-head fp-head"><p class="eyebrow">Real work</p><h2 class="h2 fp-h2" id="work-title">{e(p['work_h'])}</h2>
        <p class="lead">{e(p['work_lead'])}</p></header>
      {_feature(ctx, p['work_feature']) if p.get('work_feature') else ''}
      <ul class="rw-grid{' fp-work__grid' if len(keys) < 3 else ''}" data-reveal-group>{cards}</ul>
    </div>
  </section>'''


def _feature(ctx, k):
    """The latest project, large: its live site in a browser frame with the phone version in front, and the story beside it."""
    w = {x[0]: x for x in ctx['WORK']}[k]
    lw, lh = ctx['SZ'][k]
    dom = w[5].split('//')[1].rstrip('/')
    vu = GP.vurl
    return f'''<article class="rwf" data-reveal aria-labelledby="rwf-{k}">
        <a class="rwf__stage" href="{w[5]}" target="_blank" rel="noopener" data-cursor="view" tabindex="-1" aria-hidden="true">
          <span class="rwf__glow"></span>
          <span class="rwf__browser"><span class="rwf__bar"><i></i><i></i><i></i><b>{e(dom)}</b></span>
            <img src="{vu(f'/assets/work/{k}-feature.webp')}" srcset="{vu(f'/assets/work/{k}-feature-960.webp')} 960w, {vu(f'/assets/work/{k}-feature.webp')} 1536w"
              sizes="(max-width: 899px) 92vw, 640px" width="1536" height="960" alt="" loading="lazy" decoding="async"></span>
          <span class="rwf__phone"><span class="rwf__status"><b>9:41</b></span><img src="{vu(f'/assets/work/{k}-mobile.webp')}" srcset="{vu(f'/assets/work/{k}-mobile.webp')} 1x, {vu(f'/assets/work/{k}-mobile@2x.webp')} 2x"
              width="360" height="805" alt="" loading="lazy" decoding="async"></span>
        </a>
        <div class="rwf__copy">
          <p class="rwf__k"><span class="rwf__dot" aria-hidden="true"></span>Latest project · live</p>
          <img class="rwf__logo" src="{vu(f'/assets/logos/{k}.webp')}" width="{lw}" height="{lh}" alt="" loading="lazy" decoding="async">
          <h3 class="rwf__h" id="rwf-{k}">{e(w[1])}</h3>
          <p class="rwf__meta">{e(w[2])} · {e(w[3])}</p>
          <p class="rwf__d">{e(w[4])}</p>
          <a class="tlink rwf__go" href="{w[5]}" target="_blank" rel="noopener">Visit {e(dom)}<span class="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a>
        </div>
      </article>'''


def _foot(p):
    li = ''.join(f'<li><a href="{ea(GP.SRC[k][2])}" target="_blank" rel="noopener">{e(GP.SRC[k][1])}<span class="sr-only"> (opens in a new tab)</span></a><span>{e(GP.SRC[k][0])}</span></li>'
                 for k in p['sources'])
    src = f'<div class="fp-sources" id="sources"><h2 class="fp-mini-h">Sources</h2><ol>{li}</ol></div>' if li else '<div></div>'
    return f'''
  <section class="section fp-sec fp-sec--foot" aria-label="Sources and prices">
    <div class="wrap fp-foot">
      {src}
      <a class="fp-pricecard" href="/pricing"><span class="fp-pricecard__k">{icon('rupee')}Every price is published</span><b>See the full price list</b>{icon('arrow')}</a>
    </div>
  </section>'''


def _cta(p, wa, icons):
    others = [s for s in SP.SERVICES if s['slug'] != p['slug']]
    li = ''.join(f'<li><a class="fp-rel" href="/services/{s["slug"]}"><span class="fp-rel__k">Service</span><b>{e(s["name"])}</b>'
                 f'<span class="fp-rel__d">{e(aeo.SVC_FROM.get(s["slug"], ""))}</span>{icon("arrow")}</a></li>' for s in others)
    li += ''.join(f'<li><a class="fp-rel" href="{GUIDE[k][0]}"><span class="fp-rel__k">Guide</span><b>{e(GUIDE[k][2])}</b>'
                  f'<span class="fp-rel__d">{e(GUIDE[k][3])}</span>{icon("arrow")}</a></li>' for k in p.get('related', [])[:2])  # 4 services + 2 guides: two full rows of three
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">{e(p.get('cta_h', 'Get a free audit'))}<span class="dot">.</span></h2>
          <p class="lead">Tell me about your business. I reply within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email me</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {SP.EMAIL}</p>
        </div>
      </div>
      <nav class="fp-related" aria-label="More services and guides"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>
      <p class="fp-all"><a class="tlink" href="/services">All services</a> · <a class="tlink" href="/pricing">Full price list</a></p>
    </div>
  </section>'''


def _images(site, url, p):
    """Every raster image on the page, as ImageObjects. aeo.complete_graph adds the licence fields Google reads."""
    keys = []
    if p['art']['kind'] == 'img': keys.append(p['art']['img'])
    if p['art']['kind'] == 'portrait': keys.append('mehul')
    keys += [b['key'] for s in p['sections'] for b in s['blocks'] if b['t'] == 'img' and b['key'] not in keys]
    if p.get('who') and 'mehul' not in keys: keys.append('mehul')
    out = []
    for i, k in enumerate(keys):
        img = GP.IMG[k]
        out.append({'@type': 'ImageObject', '@id': f'{url}#image-{i + 1}', 'url': site + img['file'][1:] + '.webp', 'contentUrl': site + img['file'][1:] + '.webp',
                    'width': img['w'], 'height': img['h'], 'caption': img['caption'], 'description': img['alt'], 'inLanguage': 'en-IN',
                    'encodingFormat': 'image/webp', 'representativeOfPage': i == 0})
    return out


def _jsonld(site, url, p, faq):
    imgs = _images(site, url, p)
    main = {'@type': 'Service', '@id': url + '#service', 'name': svc(p['slug'])['name'], 'serviceType': svc(p['slug'])['name'], 'url': url,
            'description': p['answer'], 'provider': {'@id': site + '#business'}, 'areaServed': aeo.area_served(),
            'offers': aeo.offers_ld(site, p['offers'])}
    if imgs: main['image'] = {'@id': imgs[0]['@id']}
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': p['title'], 'description': p['desc'], 'isPartOf': {'@id': site + '#website'},
            'about': {'@id': main['@id']}, 'mainEntity': {'@id': main['@id']}, 'author': {'@id': site + '#mehul'},
            'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': 'en-IN', 'dateModified': '__LASTMOD__'}
    if imgs: page.update(primaryImageOfPage={'@id': imgs[0]['@id']}, image=[{'@id': i['@id']} for i in imgs])
    if p['sources']: page['citation'] = [GP.SRC[k][2] for k in p['sources']]
    crumbs = [('Home', site)] + [(n, site + h.lstrip('/')) for n, h in p['crumbs']] + [(p['crumb'], url)]
    graph = [page, main, aeo.biz_ref(site), aeo.person_ref(site),
             {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                 {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(crumbs)]},
             aeo._faq_ld(url, faq), *imgs]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def _fill(p):
    """Title, description, H1, lead, answer, facts and FAQ come from the service's existing data (same URL, same title)."""
    s = svc(p['slug'])
    p.setdefault('title', s['title']); p.setdefault('desc', s['desc']); p.setdefault('h1', s['h1']); p.setdefault('lead', s['lead'])
    p.setdefault('answer', s['answer']); p.setdefault('facts', s['facts']); p.setdefault('cta_h', s.get('cta_h') or 'Let’s talk about your ' + s['cta'])
    return p


def service_page(ctx, parts, p):
    p = _fill(p)
    site = ctx['SITE_URL']; url = site + p['path']
    icons = ctx['ICONS']
    wa = WA + urllib.parse.quote(p['wa'])
    faq = faq_of(p['slug'], p.get('faq_extra', ()))
    toc = [((s['sid'] or f's{i}') + '-title', s['h']) for i, s in enumerate(p['sections'])] + [('how-title', 'How it works'), ('faq-title', 'Questions')]
    body = (_hero(p, wa, icons) + aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + svc(p['slug'])['name'], 'brief-title', toc, 'On this page', fold=3)
            + GP._sections(p) + _work(ctx, p) + _who(p) + _how(p) + aeo._faq_section(faq, svc(p['slug'])['short'] + ' questions.') + _foot(p) + _cta(p, wa, icons))
    preload = None
    if p['art']['kind'] == 'img':
        img = GP.IMG[p['art']['img']]
        preload = (f'<link rel="preload" as="image" type="image/avif" imagesrcset="{GP.srcset(img, "avif")}" imagesizes="{GP.HERO_SIZES}" fetchpriority="high">')
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, url, p, faq), body, extra_head=preload)


# ---------------------------------------------------------------- About
def about_page(ctx, parts):
    site = ctx['SITE_URL']; url = site + 'about'
    icons = ctx['ICONS']
    title = 'About Mehul Karotra, Founder of U Scale | Mumbai'
    desc = ('Mehul Karotra is a Mumbai website designer and developer, and founder of U Scale: websites, SEO, social media, ads and '
            'AI search visibility, done personally.')
    wa = WA + urllib.parse.quote("Hi Mehul, I read about you on uscale.in. I'd like to talk about my business.")
    founder = aeo.FOUNDER
    p = dict(slug='about', crumbs=[], crumb='About', h1='About Mehul Karotra', eyebrow='The person doing your work',
             lead=('I’m Mehul, a website designer and developer from Mumbai and the person behind U Scale. I started U Scale because small businesses '
                   'deserve agency-quality work without paying for account managers and middlemen. When you work with U Scale, you work with me.'),
             art=dict(kind='portrait', chips=[('pin', 'Ghatkopar West, Mumbai'), ('chat', 'Replies on WhatsApp')]),
             stats=[('2026', 'U Scale founded'), ('1', 'Person does your work'), ('Every', 'Price published')],
             cta_label='Chat with me on WhatsApp',
             sections=[
                 Sec('Why I started U Scale',
                     P('Before U Scale, I designed and built digital products in-house: interface design and web development at My Country Mobile and Callmama, '
                       'two telecom brands, and work at ApplQ Innovations and Threepin Info Tec. I learnt how good products are made, and how much small '
                       'businesses pay agencies for meetings, hand-offs and account managers instead of the work itself.'),
                     P('U Scale is my answer: one person, fixed prices you can read before you call, and the same care a funded product gets. I design in Figma, '
                       'build every site by hand, and run the SEO, social media, ads and AI search work myself. When a project needs a photographer, I bring '
                       'one in and stay your single point of contact.'),
                     P('I also work as a UI/UX developer at <a class="tlink" href="https://www.apex36tech.com/" target="_blank" rel="noopener">Apex36 Technologies</a>'
                       '<span class="sr-only"> (opens in a new tab)</span>, a separate sister company for custom software and AI. When a business needs an app '
                       'or an AI product built, that is where I point them; websites and marketing stay with U Scale.'),
                     eyebrow='The story'),
                 Sec('How I work',
                     Cards([('rupee', 'Every price published', 'Websites, SEO, ads and single pieces, all on the <a class="tlink" href="/pricing">pricing page</a>. No “call for a quote”.'),
                            ('user', 'You talk to me', 'No account managers. The person who answers your WhatsApp is the person doing the work.'),
                            ('file', 'Fixed price, in writing', 'Websites are 20% to start, 20% on design sign-off and 60% on launch. Monthly work is 3 months minimum, then month-to-month.'),
                            ('key', 'You own everything', 'Your domain, code, logins, ad accounts and listings stay in your name, always.'),
                            ('shield', 'No promises I can’t keep', 'No guaranteed rankings, leads or AI mentions. Honest monthly reports instead.'),
                            ('team', 'Specialists when needed', 'A photographer for a shoot, a developer friend for a tricky build. I stay your single point of contact.')], cols=3),
                     eyebrow='Principles', layout='wide'),
                 Sec('Where I meet clients',
                     Svg('about-map'),
                     Chips(['Ghatkopar', 'Vikhroli', 'Powai', 'Kurla', 'Chembur', 'Mulund', 'Andheri East'], 'Areas I visit'),
                     P('I’m based in Ghatkopar West. I meet clients across Mumbai, Thane and Navi Mumbai, and work with businesses across India over WhatsApp and video calls.'),
                     eyebrow='Mumbai', tone='band', sid='areas'),
                 Sec('Free tools I built for local businesses',
                     Links([('/tools/google-business-profile-checker', 'search', 'Google Business Profile checker', 'A score out of 100 and a fix list in about 2 minutes.', 'Free'),
                            ('/tools/google-review-qr-code', 'qr', 'Google review QR code maker', 'Your review link, a QR code and a printable standee.', 'Free'),
                            ('/tools/visiting-card-maker', 'card', 'Visiting card maker', 'Designs in English, Hindi and Marathi, with print-ready PDF.', 'Free'),
                            ('/tools/qr-code-generator', 'qr', 'QR code generator', 'Links, UPI, WhatsApp and Wi-Fi codes with your logo.', 'Free')]),
                     eyebrow='Free tools', layout='wide'),
                 Sec('Elsewhere',
                     Links([(aeo.LINKEDIN, 'user', 'LinkedIn', 'Work history and posts.', ''),
                            (aeo.GITHUB, 'file', 'GitHub', 'Code I’ve published.', ''),
                            (aeo.INSTAGRAM, 'camera', 'Instagram @uscalewithus', 'Short tips for local businesses.', ''),
                            (next(u for u in founder['sameAs'] if 'linkedin' not in u and 'github' not in u), 'globe', 'Portfolio', 'My personal portfolio site.', '')]),
                     eyebrow='Find me', layout='wide'),
             ])
    work_keys = [w[0] for w in ctx['WORK']]
    p.update(work=work_keys[1:], work_feature=work_keys[0], work_h='Work I’ve designed and built.',
             work_lead='Client websites, in-house product work and my own projects. Each card opens the live site.')
    faq = list(aeo.ABOUT_FAQ) + [('Who owns U Scale?', 'Mehul Karotra owns U Scale. Apex36 Technologies is a separate sister company for custom software and AI.')]
    body = (_hero(p, wa, icons) + aeo.brief_html(aeo.ABOUT_ANSWER, aeo.ABOUT_FACTS, 'Key facts about Mehul Karotra', 'brief-title',
                                                 [((s['sid'] or f's{i}') + '-title', s['h']) for i, s in enumerate(p['sections'])] + [('faq-title', 'Questions')], 'On this page', fold=4)
            + GP._sections(p) + _work(ctx, p) + aeo._faq_section(faq, 'About U Scale.') + _cta_about(wa, icons))
    img = GP.IMG['mehul']
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': ['AboutPage', 'ProfilePage'], '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'inLanguage': 'en-IN',
         'isPartOf': {'@id': site + '#website'}, 'mainEntity': {'@id': site + '#mehul'}, 'about': {'@id': site + '#business'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'primaryImageOfPage': {'@id': url + '#image-1'},
         'dateCreated': '2026-10-19T20:42:57+05:30', 'dateModified': '__LASTMOD__'},
        aeo.person_full(site), aeo.biz_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': site}, {'@type': 'ListItem', 'position': 2, 'name': 'About', 'item': url}]},
        aeo._faq_ld(url, faq),
        {'@type': 'ImageObject', '@id': url + '#image-1', 'url': site + img['file'][1:] + '.webp', 'contentUrl': site + img['file'][1:] + '.webp',
         'width': img['w'], 'height': img['h'], 'caption': img['caption'], 'description': img['alt'], 'inLanguage': 'en-IN', 'encodingFormat': 'image/webp',
         'representativeOfPage': True}]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    preload = (f'<link rel="preload" as="image" type="image/avif" imagesrcset="{GP.srcset(img, "avif")}" '
               f'imagesizes="(max-width: 559px) 260px, (max-width: 1023px) 300px, 400px" fetchpriority="high">')
    return aeo._page(ctx, parts, url, title, desc, ld, body, extra_head=preload)


def _cta_about(wa, icons):
    li = ''.join(f'<li><a class="fp-rel" href="/services/{s["slug"]}"><span class="fp-rel__k">Service</span><b>{e(s["name"])}</b>'
                 f'<span class="fp-rel__d">{e(aeo.SVC_FROM.get(s["slug"], ""))}</span>{icon("arrow")}</a></li>' for s in SP.SERVICES)
    li += f'<li><a class="fp-rel" href="/pricing"><span class="fp-rel__k">Prices</span><b>Full price list</b><span class="fp-rel__d">Websites, monthly plans and single pieces</span>{icon("arrow")}</a></li>'
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">Let’s talk about your business<span class="dot">.</span></h2>
          <p class="lead">I reply personally within 24 hours, usually much faster on WhatsApp.</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email me</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {SP.EMAIL}</p>
        </div>
      </div>
      <nav class="fp-related" aria-label="Services"><p class="eyebrow">What I do</p><ul class="fp-snap" data-snap>{li}</ul></nav>
    </div>
  </section>'''


# ---------------------------------------------------------------- llms-full.txt and the image sitemap
def llms_full(site):
    L = []
    for p in SERVICE_PAGES:
        p = _fill(p)
        L += [f'## {svc(p["slug"])["name"]}', '', f'URL: {site}{p["path"]}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for s in p['sections']:
            body = '\n\n'.join(x for x in (GP.text(b) for b in s['blocks']) if x)
            if body: L += [f'### {s["h"]}', '', body, '']
        L += ['### How it works', ''] + [f'{i + 1}. {t}: {d}' for i, (_, t, d, _) in enumerate(p['how']['steps'])] + ['']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in faq_of(p['slug'], p.get('faq_extra', ()))]
        if p['sources']: L += ['Sources: ' + '; '.join(f'{GP.SRC[k][1]} ({GP.SRC[k][0]}) {GP.SRC[k][2]}' for k in p['sources']), '']
    return L


def images_by_url(site):
    out = {}
    for p in SERVICE_PAGES:
        imgs = _images(site, site + p['path'], p)
        out[site + p['path']] = [(i['contentUrl'], i['caption']) for i in imgs]
    img = GP.IMG['mehul']
    out[site + 'about'] = [(site + img['file'][1:] + '.webp', img['caption'])]
    return out
