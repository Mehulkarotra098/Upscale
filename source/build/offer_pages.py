"""Two small fixed-price jobs a business can start with: /google-maps-fix and /website-rescue.

Each is one job with a fixed price, a fixed list of what is done and a fixed number of working days, so an owner can say yes
without a long proposal. Prices come from pricing_data.py (the "Quick fixes" group), so /pricing, the home price explorer,
the JSON-LD offers and llms.txt carry the same figures. Nothing here promises a ranking, a speed score or a result Google
controls. Built with the shared page system in geo_pages.py; growth_pages.standalone() adds these to the build and sitemap.
"""
import geo_pages as GP
from geo_pages import P, Cards, Sec, price

MAPS, RESCUE = 'Google Maps Fix', 'Website Rescue'
MAPS_DAYS, RESCUE_DAYS = 5, 7
TRAIL = [('Services', '/services')]
GP.OG.update({'google-maps-fix': 'og-google-maps-fix', 'website-rescue': 'og-website-rescue'})
GP.OG_ALT.update({'google-maps-fix': f'Google Maps Fix by U Scale: your Google listing fixed in {MAPS_DAYS} working days, one fixed price',
                  'website-rescue': f'Website Rescue by U Scale: your current website fixed in {RESCUE_DAYS} working days, one fixed price'})
EXT = '<span class="sr-only"> (opens in a new tab)</span>'


def _site(url, text):
    return f'<a class="tlink" href="{url}" target="_blank" rel="noopener">{text}</a>{EXT}'


def _link(href, text):
    return f'<a class="tlink" href="{href}">{text}</a>'


def _rel(items):
    return __import__('growth_pages')._rel(items)


def maps_fix(ctx=None):
    pr = price(MAPS)
    return dict(
        slug='google-maps-fix', path='google-maps-fix', kind='business', crumb='Google Maps Fix', trail=TRAIL, no_how=True,
        service='Google Maps Fix: a one-time clean-up of a Google Business Profile', service_type='Local SEO',
        related_ld=lambda site: {'@type': 'Service', '@id': site + 'services/google-business-profile-mumbai#service',
                                 'name': 'Google Business Profile management in Mumbai', 'url': site + 'services/google-business-profile-mumbai'},
        wa_msg=f"Hi Mehul, I'd like the Google Maps Fix ({pr}). My business is: ", talk='Book on WhatsApp',
        title=f'Google Maps Fix: Your Listing Fixed in {MAPS_DAYS} Days, {pr} | U Scale',
        desc=f'One fixed job for your Google Business Profile: categories, hours, photos, WhatsApp button, review QR standee and 4 posts. {pr}, done in {MAPS_DAYS} working days.',
        h1='Google Maps Fix', eyebrow=f'One-time · {pr} · {MAPS_DAYS} working days',
        lead=f'Your Google listing is where most local customers first see you. In {MAPS_DAYS} working days I fix what is holding it back: the categories, the hours, '
             f'the photos, the WhatsApp button and the way you ask for reviews. One price, {pr}, and the listing stays in your name.',
        stats=[(pr, 'One-time, fixed'), (f'{MAPS_DAYS} days', 'Working days, start to finish'), ('Yours', 'The listing stays in your name')],
        art=dict(kind='card', card='mapsfix'),
        answer=(f'Google Maps Fix is a one-time job from U Scale, a web design studio in Mumbai led by Mehul Karotra. For {pr}, a verified Google Business Profile '
                f'is checked and cleaned up in {MAPS_DAYS} working days: the right categories and services, hours and contact details, your photos, a WhatsApp '
                'chat link so the Message button can show on Google Maps, a review link with a printable QR standee, and four Google posts. You pay half to '
                'start and half when you have seen the changes. The listing stays in your name, and no ranking is promised.'),
        facts=[('Price', f'{pr}, one-time. No monthly contract'),
               ('Time', f'{MAPS_DAYS} working days from the day you add me as a manager'),
               ('Payment', 'Half to start, half when you have seen the changes'),
               ('Who does the work', 'Mehul Karotra and the U Scale team; Mehul leads every job'),
               ('You need', 'A verified Google Business Profile, and to add me as a manager from your own account'),
               ('Ownership', 'The listing stays in your name; you can remove me any time'),
               ('Not promised', 'A position on Google Maps. Google decides rankings'),
               ('First step', 'Free: the Google Business Profile checker, about 2 minutes')],
        sections=[
            Sec('What gets fixed',
                Cards([('search', 'A full check, with a list', 'Every part of your listing checked against Google’s own guidelines. You get the list of what was wrong and what I changed.'),
                       ('tag', 'Categories and services', 'The most specific true primary category, the right extra ones, and your services or products with prices.'),
                       ('clock', 'Hours and contact details', 'Opening hours, holiday hours, phone, website and description, matching your signboard and your website.'),
                       ('chat', 'WhatsApp on your listing', 'Your WhatsApp chat link added to the profile, so the Message button can show next to Call on Google Maps where Google offers it.'),
                       ('photo', 'Your photos, sorted', 'You send the photos you have. I pick the strongest, crop them and put them in the right places: cover, inside, work, team.'),
                       ('star', 'A review kit', 'Your review link, a QR standee ready to print for the counter, and a short WhatsApp message to send customers.'),
                       ('pen', 'Four Google posts', 'Written for your business and posted one a week for four weeks, so the listing looks alive.'),
                       ('check', 'A handover note', 'One page: before, after, and what to keep doing each month. Nothing is left that only I understand.')], cols=2),
                eyebrow='Included', layout='wide', sid='included'),
            Sec(f'How the {MAPS_DAYS} days go',
                Cards([('search', 'Day 1: check', 'You add me as a manager from your own Google account. I check the listing and send you the list of fixes.'),
                       ('pen', 'Days 2 to 4: fix', 'Categories, services, hours, details, photos, WhatsApp link and the first post. You see each change on your own listing.'),
                       ('star', 'Day 5: handover', 'Review kit and handover note sent. You pay the second half once you have seen the changes.')], cols=3, numbered=True),
                P('Google reviews some edits before it shows them, so a change can take a few days to appear after I make it. I tell you which ones are waiting.'),
                eyebrow='How it works', layout='wide', tone='dark', sid='days'),
            Sec('Why the WhatsApp button matters now',
                P('Since November 2026, Google Maps shows a Message button next to Call on listings that have a chat option added. It opens the chat the '
                  'business has set up, such as WhatsApp. A listing with nothing added has no button, and a customer who would rather type than call has '
                  'no easy way to reach you.',
                  'Google says chat options are available in select regions and may not show on every profile. If yours has the option, I set it up and '
                  'test it from another phone. The steps are on ' + _site('https://support.google.com/business/answer/15013580?hl=en-IN', 'Google’s help page')
                  + ', if you would rather do it yourself.'),
                eyebrow='New on Google Maps', sid='message'),
            Sec('What this job does not cover',
                Cards([('alert', 'A promised position', 'Nobody can honestly promise where you will show on Google Maps. Google decides that.'),
                       ('alert', 'A suspended listing', 'I can find the cause and file the reinstatement request, but Google decides, so it is quoted separately.'),
                       ('alert', 'Verification itself', f'If the listing is not verified yet, I guide you through it free. The {MAPS_DAYS} days start once Google has verified you.'),
                       ('alert', 'Bought or filtered reviews', 'They break Google’s rules and can get reviews removed. I only set up the honest way to ask.'),
                       ('alert', 'Work after the four posts', 'Ongoing posts, review replies and reports are local SEO, a separate monthly plan.')], cols=3,
                      cta=('/services/google-business-profile-mumbai', 'refresh', 'Want it looked after every month?', 'Weekly posts, review replies and a plain monthly report.', 'See the monthly plan')),
                P(f'If you want the listing looked after every month, with weekly posts, review replies and a report, that is '
                  + _link('/services/google-business-profile-mumbai', 'Google Business Profile management') + f' at {price("Local SEO / Google Business Profile")}.'),
                eyebrow='Plainly', layout='wide', sid='not'),
            Sec('Check your listing first, free',
                P('Before you pay anything, run your listing through my ' + _link('/tools/google-business-profile-checker', 'free Google Business Profile checker')
                  + '. It takes about 2 minutes and gives you a score out of 100 with a fix list. If you can do the fixes yourself, do. If you would '
                  'rather hand them over, send me the report on WhatsApp and I will confirm the price and the start date.'),
                eyebrow='Start here', sid='check'),
        ],
        faq=[('What is the Google Maps Fix?',
              f'A one-time job for your Google Business Profile: a full check, the right categories and services, hours and details, your photos, a WhatsApp '
              f'chat link, a review QR standee and four Google posts. It costs {pr} and takes {MAPS_DAYS} working days.'),
             ('Will this put my business at the top of Google Maps?',
              'I can’t promise that, and nobody honestly can. Google ranks local results mainly on relevance, distance and how well known the business is. '
              'A complete, accurate listing with steady genuine reviews helps with the parts you control.'),
             ('How do I pay?',
              'Half to start and half when you have seen the changes on your own listing. You get the price and the list of work in writing first.'),
             ('Do I have to give you my Google password?',
              'No. You add me as a manager from your own Google account, and you can remove me the day the job is done. I never ask for a password or a code over the phone.'),
             ('My listing is not verified, or it is suspended. Can you still help?',
              f'Not verified: I guide you through verification free, and the {MAPS_DAYS} days start once Google has verified you. Suspended: I can find what '
              'triggered it and file a reinstatement request, but Google decides, so that is quoted separately.'),
             ('Do you work with businesses outside Mumbai?',
              'Yes. The whole job is done online, so it works for a business anywhere in India. In Mumbai I can also come to your shop.')],
        sources=[], offers=[MAPS, 'Local SEO / Google Business Profile'], work=[],
        related_html=_rel([('/tools/google-business-profile-checker', 'Free tool', 'Google Business Profile checker', 'A score out of 100 and a fix list in about 2 minutes.'),
                           ('/tools/google-review-qr-code', 'Free tool', 'Google review QR code maker', 'Your review link, a QR code and a printable standee.'),
                           ('/services/google-business-profile-mumbai', 'Service', 'Google Business Profile management', 'The monthly plan: posts, reviews and a report.'),
                           ('/website-rescue', 'Quick fix', 'Website Rescue', 'Your current website fixed for phones, speed and enquiries.'),
                           ('/blog/how-to-rank-on-google-maps', 'Guide', 'How to rank higher on Google Maps', 'The 12 steps, if you want to do it yourself.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]),
        all_links='<a class="tlink" href="/services">All services</a>')


def rescue(ctx=None):
    pr = price(RESCUE)
    return dict(
        slug='website-rescue', path='website-rescue', kind='business', crumb='Website Rescue', trail=TRAIL, no_how=True,
        service='Website Rescue: a one-time fix of an existing business website', service_type='Website maintenance',
        wa_msg=f"Hi Mehul, I'd like the Website Rescue ({pr}). My website is: ", talk='Book on WhatsApp',
        title=f'Website Rescue: Your Current Site Fixed in {RESCUE_DAYS} Days, {pr} | U Scale',
        desc=f'Slow, broken on phones or getting no enquiries? One fixed job for a website you already have: phone fixes, speed, WhatsApp button, forms, Google setup. {pr}.',
        h1='Website Rescue', eyebrow=f'One-time · {pr} · {RESCUE_DAYS} working days',
        lead=f'You already have a website, but it is slow, awkward on a phone, or nobody gets in touch through it. In {RESCUE_DAYS} working days I fix the things '
             f'that lose you customers, without a redesign. One price, {pr}, agreed in writing before I touch anything.',
        stats=[(pr, 'One-time, fixed'), (f'{RESCUE_DAYS} days', 'Working days, start to finish'), ('Up to 10', 'Pages checked and fixed')],
        art=dict(kind='card', card='rescue'),
        answer=(f'Website Rescue is a one-time job from U Scale, a web design studio in Mumbai led by Mehul Karotra. For {pr}, an existing website of up to '
                f'10 pages is fixed in {RESCUE_DAYS} working days: layout problems on phones, heavy images and slow loading, a WhatsApp button and tap-to-call, a '
                'contact form that is tested, Google Search Console and Analytics set up in your name, and a title and description for every page. It is not '
                f'a redesign. If you decide on a redesign within 30 days, the {pr} comes off its price.'),
        facts=[('Price', f'{pr}, one-time, for a site of up to 10 pages'),
               ('Time', f'{RESCUE_DAYS} working days from the day I have access'),
               ('Payment', 'Half to start, half when you have seen the fixes on your own phone'),
               ('Who does the work', 'Mehul Karotra and the U Scale team; Mehul leads every job'),
               ('Works on', 'WordPress, Shopify, Wix and hand-coded sites, wherever you can give me access'),
               ('Not included', 'New design, new pages or new copy. That is a redesign'),
               ('If you redesign later', f'Within 30 days, the {pr} comes off the redesign price'),
               ('Ownership', 'Your domain, hosting and logins stay in your name')],
        sections=[
            Sec('What gets fixed',
                Cards([('phone', 'Phones first', 'Every page opened on real phone sizes. Text that runs off the screen, buttons too small to tap and menus that don’t open get fixed.'),
                       ('bolt', 'Speed', 'Oversized images compressed and resized, and heavy scripts loaded later. I show you the before and after, but I don’t promise a score.'),
                       ('chat', 'Ways to reach you', 'A WhatsApp button, tap-to-call on your number, and a contact form that I test until the message really arrives.'),
                       ('search', 'Google set up properly', 'Google Search Console and Analytics in your name, your sitemap sent to Google, and a check that Google can read every page.'),
                       ('pen', 'Titles and descriptions', 'A clear title and description for each page, written for what your customers search, so the Google result says what you do and where.'),
                       ('shield', 'Broken things', 'Dead links, missing images and an expired or missing security certificate. On WordPress, updates and a backup before I change anything.')], cols=2),
                eyebrow='Included', layout='wide', sid='included'),
            Sec(f'How the {RESCUE_DAYS} days go',
                Cards([('search', 'Day 1: check', 'You give me access. I go through the site on phones and send you a written list of what I will fix.'),
                       ('pen', 'Days 2 to 6: fix', 'I take a backup, then fix the list. You can open the site on your own phone at any point and see the changes.'),
                       ('check', 'Day 7: handover', 'A before-and-after report and every login back with you. You pay the second half once you have checked it.')], cols=3, numbered=True),
                eyebrow='How it works', layout='wide', tone='dark', sid='days'),
            Sec('When a rescue is not enough',
                P('Some sites are past fixing: a theme nobody supports, a builder you can’t get into, or a design that was never made for phones. If yours is one '
                  'of them, I will tell you on day 1, before you pay the second half, and you can stop there.',
                  f'A redesign of your current site costs 70% of a fresh build, and a new landing page is {price("Landing page")}. If you go ahead with a redesign '
                  f'within 30 days of the rescue, the {pr} comes off its price. More on ' + _link('/services/website-design-mumbai', 'website design')
                  + ' and ' + _link('/blog/website-redesign-cost', 'what a redesign costs in India') + '.'),
                eyebrow='Honestly', sid='enough'),
            Sec('What this job does not cover',
                Cards([('alert', 'A new design', 'New design, new pages or new photos are a redesign or a new build, not a rescue.'),
                       ('alert', 'New copy', 'Writing or rewriting your pages is quoted per page.'),
                       ('alert', 'A promised score or position', 'I fix the causes and show you the before and after. Nobody can promise a speed score or a Google position.'),
                       ('alert', 'Bigger sites', 'More than 10 pages, or an online store with many products, is quoted after a free look.'),
                       ('alert', 'Monthly care', 'Updates, backups and security every month are the care plan, which is optional.')], cols=3,
                      cta=('/services/website-design-mumbai', 'pen', 'Need more than a fix?', 'A redesign costs 70% of a fresh build, fixed in writing.', 'See website design')),
                P(f'The care plan is {price("Care plan: updates, backups, security")}. It is optional, and the rescue stands on its own without it.'),
                eyebrow='Plainly', layout='wide', sid='not'),
            Sec('Not sure what your site needs?',
                P('Send me the address on WhatsApp. I will open it on a phone and tell you, free, whether a rescue will do or whether you would be wasting '
                  f'{pr} on a site that needs replacing. You can also get a rough price for a new site in a minute with the '
                  + _link('/tools/website-cost-calculator', 'website cost calculator') + '.'),
                eyebrow='Start here', sid='start'),
        ],
        faq=[('What is Website Rescue?',
              f'A one-time fix of a website you already have, up to 10 pages: phone layout problems, speed, a WhatsApp button and working contact form, Google '
              f'Search Console and Analytics, and page titles and descriptions. It costs {pr} and takes {RESCUE_DAYS} working days.'),
             ('Is this a redesign?',
              'No. The design, pages and words stay as they are. I fix what stops the site working for visitors and for Google. If the site needs a redesign, I tell you on day 1.'),
             ('How do I pay?',
              'Half to start and half when you have checked the fixes on your own phone. You get the price and the list of work in writing first.'),
             ('Which websites can you fix?',
              'WordPress, Shopify, Wix and hand-coded sites, as long as you can give me access. If the site sits with a developer or company you can’t reach, '
              'I will tell you what access to ask them for.'),
             ('Will my website rank higher after this?',
              'I can’t promise a position. The job removes common reasons a site is hard to find or slow to load, and sets up Google’s own tools so you can see what happens next.'),
             ('What if I decide to redesign after the rescue?',
              f'If you go ahead within 30 days, the {pr} you paid comes off the redesign price. A redesign costs 70% of a fresh build.')],
        sources=[], offers=[RESCUE, 'Care plan: updates, backups, security'], work=[],
        related_html=_rel([('/tools/website-cost-calculator', 'Free tool', 'Website cost calculator', 'A rough price for a new site in about a minute.'),
                           ('/services/website-design-mumbai', 'Service', 'Website design in Mumbai', 'Designed in Figma, hand-coded, fixed price.'),
                           ('/blog/website-redesign-cost', 'Guide', 'Website redesign cost in India', 'What a redesign costs, and when a fix is enough.'),
                           ('/google-maps-fix', 'Quick fix', 'Google Maps Fix', f'Your Google listing cleaned up in {MAPS_DAYS} working days.'),
                           ('/website-design-prices-india', 'Data', 'Website design prices in India', 'What studios in 12 cities publish.'),
                           ('/pricing', 'Prices', 'Full price list', 'Websites, monthly plans and single pieces.')]),
        all_links='<a class="tlink" href="/services">All services</a>')


def pages(ctx=None):
    return [maps_fix(ctx), rescue(ctx)]
