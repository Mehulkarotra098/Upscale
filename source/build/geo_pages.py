"""Focus pages: websites by type of business and by area, under /services/website-design-mumbai/.

Why these pages exist (GEO): people now ask ChatGPT, Gemini, Perplexity and Google AI Mode things like "who makes
restaurant websites with online ordering in Mumbai" or "website designer in Ghatkopar". Answer engines quote pages
that answer that exact question near the top, back it with hard facts (prices, timelines, sources), and describe the
same business the same way everywhere. Each page follows the site's answer-first pattern (aeo.py): an "In short"
answer, a key-facts table, question-shaped sections, an FAQ, linked sources and a connected schema graph.

Who reads them (design brief): owner-operators of small Mumbai businesses, on a phone, between customers. They
fear hidden costs, templates sold as custom work and agencies that vanish after the advance. So every page shows a
real face, a fixed rupee price, "you own the domain and logins" and a one-tap WhatsApp first step, and turns facts
into things you can scan: cards, a calculator, range charts and checklists, all plain HTML/CSS/SVG (no chart
libraries, no extra requests). Headings use the words people actually type (Google autocomplete, Oct 2026).

Rules for adding a page:
  * only real work: a business type U Scale sells (with a published price) or an area where Mehul actually is or works,
    never a page per suburb (Google treats those as doorway pages);
  * every number comes from pricing_data.py or a linked, dated source;
  * no client names or shop weaknesses (findings are described in general terms).
"""
import hashlib, json, pathlib, re, urllib.parse

import aeo
import pricing_data as PD
import seo_pages as SP

e, ea = SP.e, SP.ea
BASE = 'website-design-mumbai'
PARENT = next(s for s in SP.SERVICES if s['slug'] == BASE)


def price(name):
    return aeo._price(name)[0]


def rupees(name):
    """Pricing-data price as an int (₹55,000 → 55000)."""
    return int(re.sub(r'\D', '', price(name).split('/')[0]))


def path_of(p):
    """Site path without the leading slash. Most focus pages sit under /services/website-design-mumbai/; a page can set its
    own 'path' when it is not part of Mumbai (Thane, Navi Mumbai) or is a service of its own (online stores)."""
    return p.get('path') or f'services/{BASE}/{p["slug"]}'


def href_of(p):
    return '/' + path_of(p)


def url_of(site, p):
    return site + path_of(p)


def _link(href, text):
    ext = href.startswith('http')
    return (f'<a class="tlink" href="{ea(href)}"' + (' target="_blank" rel="noopener"' if ext else '') + f'>{e(text)}</a>'
            + ('<span class="sr-only"> (opens in a new tab)</span>' if ext else ''))


# ---------------------------------------------------------------- icons (24px line icons, drawn for this site)
_IC = {
    'check': '<path d="M5 12.5l4.2 4.2L19 7"/>',
    'chat': '<path d="M20 11.5a7.5 7.5 0 01-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1120 11.5z"/>',
    'menu': '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    'cart': '<path d="M3.5 4.5h2.2l2.1 10.2a1.5 1.5 0 001.5 1.2h7.9a1.5 1.5 0 001.5-1.2L20 8H6.5"/><circle cx="9.5" cy="19.5" r="1.2"/><circle cx="17" cy="19.5" r="1.2"/>',
    'pin': '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    'card': '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    'qr': '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18v2M18 14h2"/>',
    'camera': '<path d="M4 8.5A2.5 2.5 0 016.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0120 8.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5z"/><circle cx="12" cy="12.5" r="3.5"/>',
    'globe': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>',
    'tag': '<path d="M3.5 12.2V4.5a1 1 0 011-1h7.7l8.3 8.3a1.5 1.5 0 010 2.1l-6.6 6.6a1.5 1.5 0 01-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
    'shield': '<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    'rupee': '<path d="M7 4.5h10M7 9h10M7 4.5h3.5a4.5 4.5 0 010 9H7l7.5 6"/>',
    'user': '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.9-3.6 3.9-5.8 7.5-5.8s6.6 2.2 7.5 5.8"/>',
    'layers': '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
    'pen': '<path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 013 3L8 18.5z"/><path d="M14 6.5l3 3"/>',
    'bolt': '<path d="M13 3.5L5.5 13.5H12l-1 7 7.5-10H12z"/>',
    'box': '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
    'phone': '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
    'refresh': '<path d="M19.5 12a7.5 7.5 0 11-2.2-5.3M19.5 4.5v4h-4"/>',
    'alert': '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17v.01"/>',
    'unlink': '<path d="M9.5 14.5l-1.8 1.8a3 3 0 01-4.2-4.2l1.8-1.8M14.5 9.5l1.8-1.8a3 3 0 014.2 4.2l-1.8 1.8M8 8L5 5M16 16l3 3"/>',
    'star': '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
    'store': '<path d="M4 9.5V20h16V9.5M3 9.5l1.6-5h14.8l1.6 5a2.5 2.5 0 01-4.5 1.5 2.5 2.5 0 01-4.5 0 2.5 2.5 0 01-4.5 0A2.5 2.5 0 013 9.5z"/><path d="M10 20v-5h4v5"/>',
    'truck': '<path d="M3 6.5h11v9H3zM14 10h3.5l3 3v2.5H14"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    'calendar': '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>',
    'photo': '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 15.5l-5-5-9 8.5"/>',
    'key': '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L19 4M16 7l2.5 2.5M14 9l1.5 1.5"/>',
    'file': '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4M9 12.5h6M9 16h6"/>',
    'arrow': '<path d="M7 17L17 7M9 7h8v8"/>',
    'map': '<path d="M3.5 6.5l5.5-2.5 6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    'team': '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 14.6c2.4-.3 4.6 1.2 5.5 4.4"/>',
}


def icon(k, cls='fp-ic'):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" focusable="false">{_IC[k]}</svg>')


# ---------------------------------------------------------------- sources (linked, dated)
SRC = {
    'nrai': ('Inc42, 20 Oct 2026', 'Flipkart eyes October-end launch for food delivery service (NRAI president Sagar Daryani on platform commissions)',
             'https://inc42.com/buzz/flipkart-eyes-october-end-launch-for-food-delivery-service-report/'),
    'gbp-order': ('Google Business Profile Help', 'Manage food ordering on your Business Profile',
                  'https://support.google.com/business/answer/10918858'),
    'razorpay': ('Razorpay, updated Oct 2026', 'Razorpay payment gateway pricing and fees explained',
                 'https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/'),
    'free-listings': ('Google Merchant Center Help', 'Free listings for products', 'https://support.google.com/merchants/answer/13889434'),
    'local-rank': ('Google Business Profile Help', 'How to improve your local ranking on Google', 'https://support.google.com/business/answer/7091'),
    'in-domain': ('Hostinger, checked 21 Oct 2026', '.in domain price and renewal', 'https://www.hostinger.com/in/tld/in-domain'),
    'gd-domain': ('GoDaddy India, checked 21 Oct 2026', '.in domain price and renewal', 'https://www.godaddy.com/en-in/tlds/in-domain'),
    'hosting': ('Hostinger, checked 21 Oct 2026', 'Web hosting plans and renewal prices', 'https://www.hostinger.com/in/web-hosting'),
    'ssl': ('Let’s Encrypt', 'Free SSL certificates', 'https://letsencrypt.org/'),
    'shopify': ('Shopify India, checked 10 Nov 2026', 'Shopify pricing', 'https://www.shopify.com/in/pricing'),
    'wix': ('Wix, checked 10 Nov 2026', 'Wix premium plans (India)', 'https://www.wix.com/plans'),
    'squarespace': ('Squarespace, checked 10 Nov 2026', 'Squarespace pricing (INR)', 'https://www.squarespace.com/pricing'),
    'hostinger-builder': ('Hostinger India, checked 10 Nov 2026', 'Hostinger website builder plans', 'https://www.hostinger.com/in/website-builder'),
    'onjob-rates': ('OnJob, 6 Jun 2026', 'Freelance developer income in India (2026)', 'https://onjob.io/blog/freelance-developer-income-in-india-2026/'),
    'razorpay-pricing': ('Razorpay, checked 23 Oct 2026', 'Razorpay pricing', 'https://razorpay.com/pricing/'),
    'gst-22': ('CBIC', 'CGST Act, section 22: who must register for GST', 'https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter6/section22_v1.00.html'),
    'com-domain': ('Hostinger, checked 23 Oct 2026', '.com domain price and renewal', 'https://www.hostinger.com/in/tld/com-domain'),
    'gd-com': ('GoDaddy India, checked 23 Oct 2026', '.com domain price and renewal', 'https://www.godaddy.com/en-in/tlds/com-domain'),
    'merchant-lp': ('Google Merchant Center Help', 'Landing page requirements', 'https://support.google.com/merchants/answer/4752265'),
    'shopify-payments': ('Shopify Help Center', 'Shopify Payments supported countries', 'https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries'),
    # The 16 website price guides behind the market ranges (read 21 Oct 2026); none is U Scale.
    'g-pac': ('PAC Solution Web, Mumbai, 3 Aug 2026', 'Website Design Cost in Mumbai: Complete Pricing Guide for 2026', 'https://pacsolutionweb.com/website-design-cost-mumbai/'),
    'g-webbird': ('Webbird, Mumbai, updated 4 Apr 2026', 'Website Design Cost in Mumbai', 'https://www.webbird.in/blog/website-design-cost-in-mumbai/'),
    'g-mwd': ('Mumbai Web Design, updated 31 Jul 2026', 'Website design cost in Mumbai 2026', 'https://www.mumbaiwebdesign.in/blogs/website-design-cost-in-mumbai-2026/'),
    'g-five': ('Five Online, Mumbai, 10 Dec 2025', 'How to choose the best website designer in Mumbai: real examples and costs', 'https://fiveonline.in/blogs/how-to-choose-the-best-website-designer-in-mumbai-real-examples-costs'),
    'g-green': ('Green Media Technology, Mumbai, 22 Jun 2026', 'How much does website development cost in Mumbai this year', 'https://greenmediatechnology.com/blog/how-much-does-website-development-cost-in-mumbai-this-year'),
    'g-wgi': ('Web Gurus India, Mumbai, 20 Jul 2026', 'What Does Website Design Actually Cost in Mumbai (2026)?', 'https://blog.webgurusindia.in/what-does-website-design-actually-cost-in-mumbai-2026-a-transparent-inr-breakdow/'),
    'g-rds': ('RDS Web & IT Solutions, Mumbai, 11 Feb 2026', 'Website design cost in Mumbai', 'https://rdswebtech.com/website-design-cost-mumbai'),
    'g-jimmy': ('Jimmy Thakkar, Mumbai, undated (seen 21 Oct 2026)', 'Web design and hosting prices, Mumbai', 'https://www.jimmythakkar.com/web-design-hosting-prices-mumbai'),
    'g-hostinger': ('Hostinger India, updated 26 Feb 2026', 'How much does a website cost in India', 'https://www.hostinger.com/in/tutorials/website-cost'),
    'g-esc': ('Easy Site Coders, 23 Jul 2026', 'Website development cost in India 2026', 'https://easysitecoders.com/blog/website-development-cost-in-india-2026'),
    'g-zethic': ('Zethic Technologies, updated 21 Sep 2026', 'Website development cost in India 2026: full price breakdown', 'https://zethic.com/website-development-cost-in-india-2026-full-price-breakdown/'),
    'g-htbg': ('HT Business Group, 22 Jun 2026', 'Website development cost in India 2026', 'https://htbusinessgroup.com/website-development-cost-in-india-2026/'),
    'g-orange': ('OrangeMantra, 14 Jul 2026', 'Guide on determining website development cost', 'https://www.orangemantra.com/blog/guide-on-determining-website-development-cost/'),
    'g-secuod': ('Secuodsoft, 12 Mar 2026', 'Website development cost in India', 'https://www.secuodsoft.com/blog/web-development/website-development-cost-in-india.php'),
    'g-devg': ('DevGraphiq, updated 20 Aug 2026', 'Website development cost in India', 'https://devgraphiq.com/website-development-cost-in-india'),
    'g-goodfirms': ('GoodFirms, updated 26 Aug 2026', 'Web development cost in India', 'https://www.goodfirms.co/blog/web-development-cost-in-india'),
}
GUIDES = ['g-pac', 'g-webbird', 'g-mwd', 'g-five', 'g-green', 'g-wgi', 'g-rds', 'g-jimmy',
          'g-hostinger', 'g-esc', 'g-zethic', 'g-htbg', 'g-orange', 'g-secuod', 'g-devg', 'g-goodfirms']
GUIDES_NOTE = ('Market ranges come from 16 website price guides (15 dated 2025–26, one undated) by Mumbai and Indian web firms, a hosting company '
               'and a directory, compared by U Scale in October 2026 and listed under Sources below; they overlap rather than agree.')


def src_chip(k):
    return f'<a class="fp-src" href="{ea(SRC[k][2])}" target="_blank" rel="noopener">Source: {e(SRC[k][0])}<span class="sr-only"> (opens in a new tab)</span></a>'


# ---------------------------------------------------------------- content blocks
# Each block is a dict with a 't' (type). render(block) → HTML; text(block) → plain text for llms-full.txt.
def P(*paras):            return dict(t='p', paras=paras)
def Cards(items, cols=3, numbered=False, tone='', cta=None):  # items: (icon or None, title, text html); cta: (href, icon, title, text, button) closes the grid
    return dict(t='cards', items=items, cols=cols, numbered=numbered, tone=tone, cta=cta)
def Stat(big, label, src):  return dict(t='stat', big=big, label=label, src=src)
def Note(text):           return dict(t='note', text=text)
def Check(items):         return dict(t='check', items=items)
def Table(head, rows, caption): return dict(t='table', head=head, rows=rows, caption=caption)
def Options(items, note=''):    return dict(t='options', items=items, note=note)  # items: dict(name, tag, rows, hi)
def Range(rows, marks, ticks, unit_note=''): return dict(t='range', rows=rows, marks=marks, ticks=ticks, note=unit_note)
def Durations(rows, scale, label): return dict(t='dur', rows=rows, scale=scale, label=label)
def Links(items):         return dict(t='links', items=items)  # (href, icon, title, text, price)
def Chips(items, label):  return dict(t='chips', items=items, label=label)
def Svg(key):             return dict(t='svg', key=key)
def Calc():               return dict(t='calc')
def Tools(lang='en'):     return dict(t='tools', lang=lang)
def Img(key):             return dict(t='img', key=key)  # a product shot from IMG, with its caption
def Html(html, text=''):  return dict(t='html', html=html, text=text)  # a ready-made widget (city pages); text is its llms-full.txt version


def Sec(h, *blocks, eyebrow='', lead='', layout='split', tone='', sid=''):
    return dict(h=h, blocks=blocks, eyebrow=eyebrow, lead=lead, layout=layout, tone=tone, sid=sid)


def _fmt(n):
    """₹ in Indian digit grouping: 200000 → ₹2,00,000."""
    s = str(int(round(n)))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        head = re.sub(r'(\d)(?=(\d\d)+$)', r'\1,', head)
        s = head + ',' + tail
    return '₹' + s


def _short(n):
    """₹ in Indian shorthand: 25000 → ₹25k, 200000 → ₹2L."""
    return f'₹{n / 100000:g}L' if n >= 100000 else f'₹{n // 1000}k'


# ---------------------------------------------------------------- the pages
WEB_PRICES = (f'Landing page {price("Landing page")} · Business site, 5–10 pages {price("Business site, 5–10 pages")} · '
              f'10–20 pages + blog {price("Business site, 10–20 pages + blog")} · Online store from {price("E-commerce, under 50 products")}')
INCLUDED = 'mobile-first design, enquiry forms, basic SEO, Google Maps, social links, 2–3 revision rounds and a 15–30 day bug-fix window'


def svc_links(extra=()):
    return Links([
        ('/services/website-design-mumbai', 'globe', 'Website design and development', 'Designed in Figma, hand-coded, fixed price.', f'From {price("Landing page")}'),
        ('/services/seo-mumbai', 'pin', 'Google Business Profile and local SEO', 'A complete, active Google listing, so people nearby can find you on Maps.', price('Local SEO / Google Business Profile')),
        ('/services/social-media-management-mumbai', 'camera', 'Social media management', 'Posts, reels and a monthly calendar.', ''),
        ('/services/ai-search-visibility', 'bolt', 'AI search visibility', 'Giving ChatGPT and Gemini the right facts about your business.', ''),
        *extra])


MAPS_FAQ = ('Verify your Google Business Profile, choose the most specific primary category, keep hours, phone, photos and services complete, '
            'earn genuine reviews every week and reply to them, and show the same name, phone number and area on your website. Google ranks '
            'local results on relevance, distance and prominence, and nobody can change how far a searcher is from you, so no one can promise a top-3 spot.')
RANKING = Cards([
    ('search', 'Relevance', 'How well your listing and website match the search. <b>You control it:</b> categories, services, the words on your site.'),
    ('pin', 'Distance', 'How far you are from the person searching. <b>Nobody can change it</b>, which is why the other two matter.'),
    ('star', 'Prominence', 'How well known you are, judged partly from reviews and from the web. <b>You build it:</b> reviews, replies, links, mentions.'),
], cols=3)

_rest_saving = 50000 * 20 // 100 - round(50000 * 0.0236)  # ₹10,000 commission vs ₹1,180 gateway fee on ₹50,000 of direct orders
PAGES = [
 dict(slug='restaurants-cafes', kind='business', crumb='Restaurants & cafés', service='Restaurant and café website design with online ordering',
  card='Your own menu and online ordering, so you stop paying app commission on your regulars’ orders.',
  title='Restaurant Website Design in Mumbai with Online Ordering',
  desc='Restaurant or café website with your menu and your own online ordering, so regulars order direct, not via an app that takes 20–25%. '
       f'Fixed {price("Restaurant site + own online ordering")}.',
  h1='Restaurant websites with online ordering', eyebrow='Restaurant website design',
  lead='Your menu and your own online ordering, on a website you own. Regulars order from you directly, not through an app that keeps a share of every order.',
  stats=[(price('Restaurant site + own online ordering'), 'Fixed price'), ('0%', 'App commission on direct orders'), ('3–4 weeks', 'To go live')],
  art=dict(kind='img', img='rest', chips=[('cart', 'New order · ₹190 · paid by UPI'), ('check', '0% app commission')]),
  answer='U Scale builds restaurant and café websites in Mumbai with the menu, photos, timings and the restaurant’s own online ordering, for a '
         f'fixed {price("Restaurant site + own online ordering")}. Orders placed on your own website carry no delivery-app commission: you pay only '
         'the payment gateway fee, about 2% plus GST on a standard plan. You can keep Zomato and Swiggy for new customers and give your '
         'regulars a way to order direct.',
  facts=[('Price', f'Website + own online ordering {price("Restaurant site + own online ordering")}, fixed. Without ordering (menu, photos, '
                   f'timings, contact), the business-site price applies: {price("Business site, 5–10 pages")} for 5–10 pages'),
         ('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Commission on direct orders', 'None. Only the payment gateway fee, for example 2% + GST on Razorpay’s standard plan'),
         ('Delivery', 'Your choice: your own riders, takeaway pickup, or a delivery partner you book'),
         ('Timeline', 'Most sites go live in 3–4 weeks'),
         ('Payment', '20% to start, 20% on design sign-off, 60% on launch'),
         ('Care plan', f'Updates, backups and security {price("Care plan: updates, backups, security")}, optional')],
  sections=[
   Sec('How much do Zomato and Swiggy really cost a restaurant?',
       Stat('20–25%', 'of the order value: what restaurants typically pay established delivery apps in commission', 'nrai'),
       P('Restaurants typically pay established delivery platforms a commission of 20–25% of the order value, according to Sagar Daryani, '
         'president of the National Restaurant Association of India (NRAI), in October 2026. He adds that advertising, discounts and promotions add to what restaurants spend. Newer '
         'platforms are pitching lower rates: Flipkart has reportedly proposed a base commission of around 10% for its food delivery launch.',
         'Your own website does not replace the apps. They are where new customers discover you. A website gives the people who already know '
         'you, your regulars, a way to order from you directly.'),
       eyebrow='The commission'),
   Sec('Zomato & Swiggy commission calculator: what ordering direct can save',
       Calc(),
       Note('An illustration with round numbers, not a promise: use your own monthly app sales and commission rate. The apps’ commission also '
            'pays for their riders, so for delivered orders subtract what your own rider or delivery partner costs. For takeaway and pre-orders, '
            'the saving is the full difference.'),
       eyebrow='Worked example', lead='Move your regulars to your own ordering link and keep the commission. Change the numbers to match your restaurant.',
       layout='wide', tone='dark', sid='calculator'),
   Sec('What your restaurant website includes',
       Cards([('menu', 'Your menu, always current', 'Prices and photos, readable on a phone and easy to update.'),
              ('cart', 'Online ordering', 'Takeaway or delivery, with payment by UPI, card or netbanking through a payment gateway.'),
              ('chat', 'Enquiries on WhatsApp', 'Table, party and catering enquiries go straight to your WhatsApp.'),
              ('clock', 'Timings, map, one-tap call', 'Everything someone needs before they walk in or call.'),
              ('search', 'Readable by Google and AI', 'Basic SEO and structured data, so Google and AI assistants read your menu, timings and location correctly.'),
              ('check', 'Everything else, included', f'As on every U Scale site: {INCLUDED}.')], cols=3),
       eyebrow='Included', layout='wide'),
   Sec('Café websites',
       P('A café usually needs less than a full restaurant: the menu with prices, opening hours, photos of the space, and a way to order ahead '
         'or ask on WhatsApp. If you don’t need your own ordering yet, a café site is priced as a business site, '
         f'{price("Business site, 5–10 pages")} for 5–10 pages, and ordering can be added later.'),
       Cards([('menu', 'Menu and prices', 'Readable on a phone, not a photo of a printed menu.'),
              ('clock', 'Hours and holiday hours', 'The same on your website and your Google listing.'),
              ('chat', 'Order ahead or ask', 'A WhatsApp button for pickups, cakes and party orders.')], cols=3),
       eyebrow='Cafés', sid='cafes'),
   Sec('How customers find your ordering link',
       Cards([('pin', 'Your Google Business Profile', 'In India, restaurants can add their own “Place an order” link to their Google listing. It shows on Google Search and Maps.'),
              ('camera', 'Instagram and WhatsApp', 'Your Instagram bio and your WhatsApp Business profile.'),
              ('qr', 'A QR code', 'On menus, bills and takeaway bags, so the next order comes to you.')], cols=3, numbered=True, tone='band'),
       eyebrow='Getting orders', layout='wide', tone='band'),
  ],
  faq=[('How much does a restaurant website with online ordering cost in Mumbai?',
        f'With U Scale, a restaurant or café website with its own online ordering is {price("Restaurant site + own online ordering")}, fixed and agreed in '
        f'writing before work starts. A website without ordering (menu, photos, timings and contact) is {price("Business site, 5–10 pages")} for 5–10 pages. '
        'Payment gateway fees and photography are separate and quoted up front.'),
       ('Should I stop using Zomato and Swiggy?',
        'No. The apps are where new customers discover you. Your own website is for the customers who already know you: give them a reason and a '
        'link to order direct, and keep the apps for reach.'),
       ('How much commission do Zomato and Swiggy charge restaurants?',
        'Rates are agreed restaurant by restaurant, but restaurants typically pay established platforms 20–25% of the order value, according to the '
        'president of the National Restaurant Association of India (October 2026). He adds that advertising, discounts and promotions add to what restaurants spend.'),
       ('Who delivers orders placed on my own website?',
        'You choose: your own delivery staff, takeaway pickup, or a delivery partner you book per order. The website takes the order and the '
        'payment; delivery stays in your control.'),
       ('Can customers pay by UPI on my restaurant website?',
        'Yes. Payments go through a payment gateway that supports UPI, cards and netbanking. Razorpay’s standard plan, for example, charges 2% per '
        'transaction plus 18% GST on that fee, with no setup fee.'),
       ('Can customers book a table on my website?',
        'Yes, as a WhatsApp enquiry: a “Book a table” button opens a chat with the date, time and number of people already typed, and you confirm '
        'it. If you need a full booking system with live table availability, ask about it in the free audit.'),
       ('Can my menu show up in Google and ChatGPT answers?',
        'A clear, crawlable menu page with structured data, consistent timings and an up-to-date Google Business Profile make it much easier for '
        'Google and AI assistants to describe your restaurant correctly. Nobody can guarantee a mention, but a menu locked inside a PDF or a photo '
        'is far harder for them to read.')],
  sources=['nrai', 'gbp-order', 'razorpay'],
  offers=['Restaurant site + own online ordering', 'Business site, 5–10 pages', 'Care plan: updates, backups, security'],
  work=[]),

 dict(slug='boutiques-fashion', kind='business', crumb='Boutiques & fashion', service='Website design for boutiques and fashion labels',
  card='A catalogue with “Order on WhatsApp” on every product, or a full online store.',
  title='Boutique & Clothing Store Website Design, Mumbai | U Scale',
  desc='Websites for Mumbai boutiques and clothing stores: a catalogue with WhatsApp orders, or a full online store from '
       f'{price("E-commerce, under 50 products")}. Designed by Mehul Karotra.',
  h1='Boutique & clothing store website design', eyebrow='Websites by business',
  lead='A catalogue your Instagram followers can browse properly, product pages Google can find, and orders on WhatsApp or online. Fixed price.',
  stats=[(price('Business site, 5–10 pages'), 'Catalogue site, starting price'), (price('E-commerce, under 50 products'), 'Online store, under 50 products'), ('1 tap', 'To order on WhatsApp')],
  art=dict(kind='img', img='bout', chips=[('chat', 'Order on WhatsApp'), ('tag', 'Size M · ₹3,450')]),
  answer='U Scale designs and builds websites for boutiques, saree shops and fashion labels in Mumbai: a catalogue site with an “Order on WhatsApp” '
         f'button on every product, or a full online store with cart and payments from {price("E-commerce, under 50 products")} for under 50 products. '
         'Every product gets its own page that Google can find. Product pages that show the price, availability and a way to buy can also be '
         'submitted to Google Merchant Center for free listings on Google Search, Images, Lens and the Shopping tab.',
  facts=[('Catalogue site', f'Products, lookbook and “Order on WhatsApp” buttons, priced by pages after a free audit, from {price("Business site, 5–10 pages")}'),
         ('Online store', f'Under 50 products {price("E-commerce, under 50 products")} · 50–500 products {price("E-commerce, 50–500 products")}'),
         ('Who builds it', 'Mehul Karotra, personally: designed in Figma, then hand-coded'),
         ('Payments', 'UPI, cards and netbanking through a payment gateway; gateway fees are separate'),
         ('Timeline', 'Most sites go live in 3–4 weeks'),
         ('Ownership', 'Your domain, product pages, code and customer list stay yours'),
         ('Related work', 'Sashe by Prachi, a bespoke fashion label in Mumbai')],
  sections=[
   Sec('Do I need a website if I already sell on Instagram and WhatsApp?',
       P('Instagram is where people discover your designs. A website is where they check you are real, browse everything in one place and find '
         'you again later. When someone searches Google for a style near them, most of what they see is websites, Google Business Profiles and '
         'product listings; a few Instagram posts can appear too (' + _link('/blog/instagram-posts-google-search-seo', 'how that works') + '), but your '
         'whole catalogue does not. A website also keeps your catalogue safe if your account is restricted or reach drops.'),
       Cards([('camera', 'Instagram', 'Where people discover your designs.'),
              ('globe', 'Your website', 'Where they check you are real and browse everything.'),
              ('search', 'Google', 'Where new customers search for a style or a shop near them.')], cols=3, numbered=True),
       eyebrow='Instagram vs website'),
   Sec('List your products on Google for free',
       P('Google Merchant Center lets shops list products for free across Google Search, the Shopping tab, Google Images, Google Lens, Maps and the '
         'products section of a Business Profile. Google’s rules ask for a product page on your own website for every item, showing the price, '
         'availability and a buy button or a similar way to order, plus shipping details for India. Made-to-order pieces without a fixed price may not qualify. Google does not promise that every product is shown.'),
       Chips(['Google Search', 'Shopping tab', 'Google Images', 'Google Lens', 'Google Maps', 'Business Profile'], 'Where free listings can show'),
       eyebrow='Free listings', tone='band'),
   Sec('Catalogue with WhatsApp orders, or a full online store?',
       Options([dict(name='Catalogue + WhatsApp', tag='Made-to-order & bespoke', rows=[
                    ('Best for', 'Made-to-order, bespoke and try-before-you-buy'),
                    ('How people order', 'Tap “Order on WhatsApp” on a product, then you confirm size, fit and delivery in the chat'),
                    ('Payments', 'UPI or a payment link once you confirm'),
                    ('Price with U Scale', f'From {price("Business site, 5–10 pages")}, priced by pages')]),
                dict(name='Online store', tag='Ready stock', hi=True, rows=[
                    ('Best for', 'Ready stock with fixed sizes and prices'),
                    ('How people order', 'Add to cart and pay at checkout'),
                    ('Payments', 'UPI, cards and netbanking at checkout, with a gateway fee per order'),
                    ('Price with U Scale', f'{price("E-commerce, under 50 products")} under 50 products; {price("E-commerce, 50–500 products")} for 50–500')])]),
       eyebrow='Choose your model', layout='wide'),
   Sec('What every boutique website includes',
       Cards([('tag', 'A page for every product', 'Photos, fabric, sizes and price, on its own page Google can find.'),
              ('chat', 'WhatsApp and call buttons', 'On every page, for the questions people ask before they buy.'),
              ('pin', 'Store timings and a map', 'For people who want to visit and try.'),
              ('search', 'Readable by Google and AI', 'Basic SEO and product structured data, so Google and AI assistants read your catalogue correctly.'),
              ('check', 'Everything else, included', f'As on every U Scale site: {INCLUDED}.')], cols=3),
       eyebrow='Included', layout='wide'),
   Sec('Jewellery and saree stores',
       P('Jewellery and saree stores sell high-value pieces that customers want to see closely and ask about before they buy. A catalogue with '
         'large photos, a price or “price on request”, and an “Ask on WhatsApp” button on every piece usually works better than a cart. For ready '
         'stock with fixed prices, an ' + _link('/services/ecommerce-website-mumbai', 'online store') + ' adds checkout.',
         'Wedding season is the busiest time for both: see the ' + _link('/blog/wedding-season-marketing-ideas-local-shops', 'wedding season plan for shops')
         + '. For payments at the counter, a ' + _link('/tools/qr-code-generator', 'UPI QR code') + ' is free to make.'),
       eyebrow='Jewellery & sarees', sid='jewellery'),
  ],
  faq=[('How much does a boutique website cost in Mumbai?',
        f'With U Scale, a catalogue website with WhatsApp ordering starts at {price("Business site, 5–10 pages")} and is priced by pages after a free audit. '
        f'A full online store is {price("E-commerce, under 50 products")} for under 50 products and {price("E-commerce, 50–500 products")} for 50–500 '
        'products. Prices are fixed and agreed in writing before work starts.'),
       ('Can customers order on WhatsApp from my website?',
        'Yes. Each product can have an “Order on WhatsApp” button that opens a chat with the product name already typed, so you confirm size, '
        'colour and delivery in the conversation.'),
       ('Can my products show on Google Shopping for free?',
        'Yes, through Google Merchant Center’s free listings, which can show products on Google Search, the Shopping tab, Images, Lens and Maps. '
        'You need a product page on your own website for each item, showing the price, availability and a buy button or a similar way to order; made-to-order pieces without a fixed price may not qualify. Google does not guarantee that every product is shown.'),
       ('Who takes the product photos?',
        'You can use your own photos. If you need a shoot, photography is quoted separately, always before work starts.')],
  sources=['free-listings', 'merchant-lp', 'razorpay'],
  offers=['E-commerce, under 50 products', 'E-commerce, 50–500 products', 'Business site, 5–10 pages'],
  work=['sashe']),

 dict(slug='ghatkopar', kind='area', crumb='Ghatkopar', service='Website design and local SEO in Ghatkopar',
  card='Websites, Google listings and local SEO for businesses in Ghatkopar, Vikhroli, Kurla and nearby.',
  places=['Ghatkopar', 'Vikhroli', 'Kurla', 'Chembur', 'Powai', 'Mulund'],
  title='Website Designer & Developer in Ghatkopar, Mumbai | U Scale',
  desc=f'Website designer and developer based in Ghatkopar West: websites from {price("Landing page")}, plus Google listings and local SEO for Ghatkopar '
       'businesses. Free audit.',
  h1='Website designer & developer in Ghatkopar', eyebrow='Near you',
  lead='I’m Mehul Karotra, based in Ghatkopar West. I design and build websites and run Google listings and local SEO for businesses here, and I can come to your shop to talk it through.',
  stats=[(price('Landing page'), 'Websites from'), (_fmt(rupees('Local SEO / Google Business Profile')), 'Local SEO, per month'), ('Free', 'Audit at your shop')],
  art=dict(kind='portrait', chips=[('pin', 'Ghatkopar West, Mumbai'), ('chat', 'Replies on WhatsApp')]),
  answer='U Scale is Mehul Karotra, a freelance website designer and digital marketer based in Ghatkopar West, Mumbai. He designs and hand-codes '
         f'websites at fixed prices (a landing page {price("Landing page")}, a 5–10 page business site {price("Business site, 5–10 pages")}) and runs '
         'Google Business Profile and local SEO work for businesses in Ghatkopar, Vikhroli, Kurla, Chembur, Powai and Mulund. Every project starts '
         'with a free audit.',
  facts=[('Based in', 'Ghatkopar West, Mumbai'),
         ('Nearby areas', 'Ghatkopar East and West, Vikhroli, Kurla, Chembur, Powai and Mulund'),
         ('Meetings', 'At your shop or office, or over WhatsApp and video calls'),
         ('Website prices', WEB_PRICES),
         ('Local SEO', f'Google Business Profile and local SEO {price("Local SEO / Google Business Profile")}'),
         ('Free audit', 'Your website, Google listing and Instagram, checked before you pay anything'),
         ('Languages', 'English and Hindi')],
  sections=[
   Sec('Why Ghatkopar customers find you, or your competitor, on Google',
       P('When someone nearby searches “saree shop near me” or “clinic in Ghatkopar”, Google often shows a map with a few local businesses first. Google says '
         'it ranks local results on relevance (how well your listing matches the search), distance (how far you are from the person searching) and '
         'prominence (how well known you are, judged partly from reviews and from the web). A website that names your area, services and timings, '
         'and matches your Google listing exactly, helps with relevance; reviews and mentions across the web build prominence.'),
       Img('tool-checker'),
       eyebrow='Google Maps'),
   Sec('Where I meet clients around Ghatkopar',
       Svg('gk-map'),
       Chips(['Ghatkopar West', 'Ghatkopar East', 'Vikhroli', 'Powai', 'Kurla', 'Chembur', 'Mulund'], 'Areas I visit'),
       P('Further away? I work with businesses across Mumbai, ' + _link('/services/website-design-thane', 'Thane') + ' and '
         + _link('/services/website-design-navi-mumbai', 'Navi Mumbai') + ', and with clients elsewhere in India, over WhatsApp and video calls.'),
       eyebrow='Near you', tone='band', sid='areas'),
   Sec('Ghatkopar by area',
       Cards([('store', 'Around the station, East and West', 'Jewellers, sweet shops, clinics and stores on the station roads, where people search on the way home.'),
              ('pin', 'Pant Nagar and Garodia Nagar', 'Residential lanes in Ghatkopar East, with tuition classes, salons, clinics and home businesses.'),
              ('pin', 'Rajawadi', 'Around Rajawadi hospital in Ghatkopar East: clinics, chemists and diagnostic centres people look up in a hurry.'),
              ('layers', 'LBS Marg', 'Showrooms, offices and the R City mall in Ghatkopar West, with plenty of businesses chasing the same searches.')], cols=2),
       P('Each part of Ghatkopar is searched by its own name, so a clinic in Pant Nagar and a jeweller near the station need different words on their '
         'listing and their website. The same goes for language: plenty of customers here search in Hindi or Hinglish as well as English.'),
       eyebrow='By area', layout='wide', sid='by-area'),
   Sec('Also nearby: Powai, Vikhroli, Kurla, Chembur and Mulund',
       Cards([('pin', 'Ghatkopar East', 'Across the station from my base in Ghatkopar West, so a meeting at your shop is easy to arrange.'),
              ('pin', 'Vikhroli', 'The next station north on the Central line.'),
              ('pin', 'Powai', 'Offices, clinics, cafés and studios around Hiranandani and the lake, a short drive away.'),
              ('pin', 'Kurla', 'Two stations south on the Central line, and on the Harbour line too.'),
              ('pin', 'Chembur', 'On the Harbour line, across the Eastern Express Highway.'),
              ('pin', 'Mulund', 'At Mumbai’s northern edge on the Central line, the station before Thane.')], cols=3),
       eyebrow='Eastern suburbs', layout='wide', sid='nearby'),
   Sec('Websites and digital marketing for Ghatkopar businesses',
       P('Most Ghatkopar shops, clinics and offices win customers from people nearby, so the marketing that works here is local: a complete Google '
         'Business Profile, steady genuine reviews, an Instagram that shows what is new, and WhatsApp for questions. Many customers search in '
         'English, Hindi or Hinglish, so your listing and pages should use the words they type, like “CA in Ghatkopar” or “Ghatkopar mein dentist”.'),
       svc_links(), eyebrow='Services', layout='wide', sid='services'),
   Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
  ],
  faq=[('Is there a website designer near me in Ghatkopar?',
        'Yes. Mehul Karotra of U Scale is based in Ghatkopar West and designs and builds websites for businesses across Ghatkopar and nearby areas. '
        'He can meet you at your shop or office, and every project starts with a free audit.'),
       ('How much does a website cost in Ghatkopar?',
        f'With U Scale, a landing page is {price("Landing page")}, a 5–10 page business website {price("Business site, 5–10 pages")}, a 10–20 page site with a '
        f'blog {price("Business site, 10–20 pages + blog")} and an online store from {price("E-commerce, under 50 products")}. The same fixed prices apply anywhere in Mumbai.'),
       ('How do I get my Ghatkopar business into the Google Maps top 3?',
        'Start with the basics most Ghatkopar listings miss: verify the profile, pick the most specific category, and write the address the way people '
        'give directions here, East or West and the nearest landmark or road, like LBS Marg or the station. Add real photos and timings, and ask every '
        'customer for a review. Distance from the person searching decides part of the ranking, so nobody can promise a top-3 spot.'),
       ('Is there a digital marketing agency in Ghatkopar?',
        'There are several. U Scale is not an agency with a team: it is Mehul Karotra, based in Ghatkopar West, who builds websites and runs '
        'Google listings, local SEO, social media and ads for local businesses himself, at published prices.'),
       ('Can you meet at my shop in Ghatkopar East?',
        'Yes. Ghatkopar East is across the station from my base in Ghatkopar West, so a meeting at your shop or office is easy to arrange. '
        'The first audit is free.'),
       ('Do you also work in Ghatkopar East, Vikhroli and Kurla?',
        'Yes. Ghatkopar East and West, Vikhroli, Kurla, Chembur, Powai and Mulund are all close by, and U Scale works with businesses across Mumbai, '
        'Thane and Navi Mumbai, and with clients elsewhere in India over WhatsApp and video calls.')],
  sources=['local-rank'],
  offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'Local SEO / Google Business Profile'],
  work=[]),

 dict(slug='andheri-east', kind='area', crumb='Andheri East', service='Website design and local SEO in Andheri East',
  card='Websites and Google listings for shops, cafés and offices in Andheri East and West, from Marol to Lokhandwala.',
  places=['Andheri East', 'Marol', 'Chakala', 'Saki Naka', 'MIDC Andheri', 'JB Nagar', 'Andheri West', 'Lokhandwala', 'Versova', 'Oshiwara'],
  title='Website Designer in Andheri East & West | U Scale',
  desc='Websites, Google listings and local SEO for shops, cafés and offices in Andheri East and West: Marol, Chakala, MIDC, Lokhandwala, Versova. '
       f'From {price("Landing page")}.',
  h1='Website design in Andheri, East and West', eyebrow='Near you',
  lead='Shops, cafés and offices in Andheri East compete for the same searches on Google. I design websites and fix Google listings here, and in October 2026 I ran a free audit day for local shops.',
  stats=[('30+', 'Local listings checked'), (price('Landing page'), 'Websites from'), ('Free', 'Audit, in person')],
  art=dict(kind='img', img='found'),
  answer='U Scale’s Mehul Karotra designs websites and sets up Google Business Profiles and local SEO for shops, cafés, restaurants and offices in '
         f'Andheri East, including Marol, Chakala, Saki Naka, MIDC and JB Nagar, and in Andheri West. Websites have fixed prices from {price("Landing page")}, local SEO is '
         f'{price("Local SEO / Google Business Profile")}, and every project starts with a free audit, which U Scale also runs in person for shops in the area.',
  facts=[('Areas', 'Marol, Chakala, Saki Naka, MIDC, JB Nagar, Gundavali and the rest of Andheri East; Lokhandwala, Versova, Oshiwara and Four Bungalows in Andheri West'),
         ('Who', 'Mehul Karotra, personally; based in Ghatkopar West, on the same Metro line'),
         ('Website prices', WEB_PRICES),
         ('Restaurants and cafés', f'Website + own online ordering {price("Restaurant site + own online ordering")}'),
         ('Local SEO', f'Google Business Profile and local SEO {price("Local SEO / Google Business Profile")}'),
         ('Free audit', 'In person at your shop or office, or online')],
  sections=[
   Sec('What I found on Andheri East Google listings',
       P('In October 2026 I looked at the Google listings of more than 30 clothing shops, cafés and restaurants in Andheri East, and visited '
         'shops near Gundavali Metro for a free audit day. The same few gaps came up again and again:'),
       Cards([('globe', 'No website on the listing', 'Good ratings and hundreds of reviews, but people who want the menu or catalogue go to a delivery app, a directory or a competitor.'),
              ('unlink', 'A website link that no longer opens', 'A dead link sends customers away and makes the listing look neglected.'),
              ('alert', 'Someone else’s link in the website field', 'A booking-app, marketplace or free-page link where the shop’s own website should be.'),
              ('star', 'Followers, but few reviews', 'A strong Instagram following but far fewer Google reviews.'),
              ('phone', 'No quick way to ask', 'A website with no WhatsApp or call button, so a visitor on a phone gives up.')], cols=3, numbered=True,
             cta=('/tools/google-business-profile-checker', 'search', 'Check your listing free', 'A score out of 100 and a fix list in about 2 minutes, so you see which of these apply to you.', 'Check my listing')),
       P('A dead or wrong link can be fixed the same day and asking for reviews costs only time; a missing website takes a few weeks.'),
       eyebrow='Audit findings', layout='wide'),
   Sec('Meetings at your shop in Andheri East',
       Svg('ae-metro'),
       P('My office is in Ghatkopar West, at the eastern end of Metro Line 1. The line stops in Andheri East at Western Express Highway, Chakala (J.B. Nagar), '
         'Airport Road, Marol Naka and Saki Naka, so a meeting at your shop is a short ride away.'),
       eyebrow='Getting here', tone='band', sid='metro'),
   Sec('Andheri West: Lokhandwala, Versova, Oshiwara and Four Bungalows',
       P('I work with businesses on the other side of the Western Express Highway too: salons, cafés, studios and production offices around '
         'Lokhandwala, Versova, Oshiwara, Four Bungalows and D N Nagar. Metro Line 1 runs from Ghatkopar, where I’m based, through Andheri to '
         'D N Nagar and Versova, so a meeting at your shop or studio is one train ride away. The prices are the same fixed prices as everywhere else.'),
       Cards([('camera', 'Studios and creatives', 'A portfolio that loads fast on a phone and shows your best work first.'),
              ('star', 'Salons and clinics', 'Services, prices and a “Book on WhatsApp” button, matched to your Google listing.'),
              ('menu', 'Cafés and restaurants', 'Your own menu and ordering, so regulars stop ordering through apps.')], cols=3),
       eyebrow='Andheri West', sid='west'),
   Sec('What I do for businesses in Andheri East',
       svc_links(extra=[(f'/services/{BASE}/restaurants-cafes', 'cart', 'Restaurant & café websites', 'Your own menu and online ordering, no app commission.', price('Restaurant site + own online ordering'))]),
       eyebrow='Services', layout='wide'),
   Sec('Check where you stand, free', Tools(), eyebrow='Free tools', layout='wide'),
  ],
  faq=[('Who designs websites for small businesses in Andheri East?',
        f'U Scale’s Mehul Karotra designs and builds websites for shops, cafés, restaurants and offices in Andheri East, at fixed prices from {price("Landing page")}. '
        'He works personally with each client and offers a free audit, in person or online.'),
       ('Is there a web design company in Andheri East?',
        'There are several. U Scale is not a company with an office in Andheri: it is Mehul Karotra, a one-person practice based in Ghatkopar West, one '
        'Metro line away, who works with Andheri East businesses at published, fixed prices and meets clients at their shop or office.'),
       ('How much does a website cost for a shop or café in Andheri East?',
        f'With U Scale, a landing page is {price("Landing page")}, a 5–10 page business website {price("Business site, 5–10 pages")}, a restaurant or café '
        f'website with its own online ordering {price("Restaurant site + own online ordering")} and an online store from {price("E-commerce, under 50 products")}. '
        'Prices are fixed and agreed in writing before work starts.'),
       ('The website link on my Google listing is broken. What should I do?',
        'Fix it the same day: in your Google Business Profile, change the website field to a page that works, or remove it until you have one. '
        'A dead link sends customers away and makes the listing look neglected.'),
       ('Do you also work in Andheri West?',
        'Yes: Lokhandwala, Versova, Oshiwara, Four Bungalows and D N Nagar, at the same fixed prices. Metro Line 1 runs from Ghatkopar, where '
        'I’m based, through Andheri to D N Nagar and Versova, so meetings at your shop or office are easy to arrange.'),
       ('Can you come to my shop for the audit?',
        'Yes. U Scale runs free audits in person for shops in Andheri East and nearby areas, or online over WhatsApp and a video call if that is easier.')],
  sources=['local-rank'],
  offers=['Landing page', 'Business site, 5–10 pages', 'Restaurant site + own online ordering', 'Local SEO / Google Business Profile'],
  work=[]),

 dict(slug='website-banane-ka-kharcha', kind='guide', lang='hi-Latn', crumb='Website banane ka kharcha',
  card='Market rates, saal ka domain-hosting kharcha aur GST: poora hisaab.',
  service='Website banane ka kharcha, Mumbai (2026)',
  title='Website Banane Ka Kharcha 2026: ₹8,000 se ₹2 Lakh Tak',
  desc='Template website ₹8,000–₹30,000, custom ₹40,000–₹2 lakh. Saal ka domain-hosting kharcha, GST aur pay se pehle 6 sawaal. '
       'U Scale ke fixed prices ₹25,000 se.',
  h1='Website banane me kitna kharcha aata hai?', eyebrow='Guide · Hinglish',
  lead='Main Mehul Karotra hoon, Mumbai se. Main websites khud banata hoon, aur mere saare prices website pe khule mein likhe hain. Yahan seedha hisaab hai.',
  stats=[('₹8k–₹3L', 'Market range, 2025–26 guides'), (price('Landing page'), 'U Scale se shuru'), ('₹4.4k–₹9.4k', 'Har saal ka kharcha')],
  art=dict(kind='img', img='paths', caption='DIY builder, freelancer aur agency ke kaam karne ke tareeqon ke illustrative examples.'),
  answer='Mumbai mein template wali basic business website lagbhag ₹8,000–₹30,000 mein, kisi Mumbai studio se ₹15,000–₹50,000 mein, aur custom '
         'design wali website ₹40,000 se ₹2 lakh tak mein banti hai. U Scale ke fixed prices: landing page ₹25,000, 5–10 page business website '
         '₹55,000 aur online store ₹95,000 se. Iske upar har saal domain aur hosting ka kharcha aata hai: offer khatam hone ke baad lagbhag '
         '₹4,400–₹9,400 saal ka, GST alag.',
  facts=[('Template wali basic website', '₹8,000–₹30,000'),
         ('Mumbai ke kisi studio se business website', '₹15,000–₹50,000'),
         ('Custom design wali website', '₹40,000–₹2,00,000'),
         ('Online store', '₹25,000–₹3,00,000, products aur features pe depend karta hai'),
         ('U Scale ke fixed prices', f'Landing page {price("Landing page")} · Business site {price("Business site, 5–10 pages")} · '
                                     f'Blog ke saath {price("Business site, 10–20 pages + blog")} · Online store {price("E-commerce, under 50 products")} se'),
         ('Har saal ka kharcha', 'Domain + hosting lagbhag ₹4,400–₹9,400 (offer ke baad, GST se pehle)'),
         ('GST', 'Registered agency 18% GST jodti hai; chhote freelancer aksar nahi'),
         ('U Scale aur GST', 'U Scale abhi GST charge nahi karta')],
  sections=[
   Sec('Ek website ₹10,000 ki aur doosri ₹1 lakh ki kyun?',
       Range([('Template wali basic website', 8000, 30000), ('Mumbai ke kisi studio se business website', 15000, 50000),
              ('Custom design wali website', 40000, 200000), ('Online store', 25000, 300000)],
             marks=[(rupees('Landing page'), 'Landing page'), (rupees('Business site, 5–10 pages'), 'Business site'), (rupees('E-commerce, under 50 products'), 'Online store')],
             ticks=[0, 50000, 100000, 150000, 200000, 250000, 300000], unit_note='U Scale ke fixed prices'),
       P('Price ka bada hissa kaam ke time ka hota hai. Sasti websites aksar ek ready-made theme hoti hain jisme aapka logo, colours aur '
         'photos daal diye jaate hain. Bahut businesses ke liye yeh theek hai, bas pata hona chahiye ki aap kya khareed rahe hain.'),
       Cards([('layers', 'Template ya custom design', 'Custom design mein har page aapke business ke hisaab se banta hai.'),
              ('pen', 'Text kaun likhega', 'Aap khud likhenge toh sasta padega; designer ya copywriter likhega toh kharcha badhega.'),
              ('bolt', 'Features', 'Booking, online ordering, payments, product catalogue, ya Hindi-Marathi pages: har ek se kaam aur kharcha badhta hai.'),
              ('box', 'Products', '30 products ka store aur 300 ka store alag projects hain.'),
              ('user', 'Kaun bana raha hai', 'Freelancer projects zyada tar ₹10,000–₹80,000, agency projects ₹50,000–₹3 lakh.')], cols=3),
       Note('Market ranges 16 website price guides se hain jo Mumbai aur baaki India ki web companies, ek hosting company aur ek directory ne haal hi mein publish kiye; U Scale ne inhe October 2026 '
            'mein compare kiya. Yeh ek doosre se poori tarah match nahi karte, isliye ranges di hain.'),
       P('Saare 16 guides ki list (publisher, date aur link) '
         '<a href="/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder#sources">freelancer vs agency guide ke Sources mein</a> hai.'),
       eyebrow='Market rates', layout='wide'),
   Sec('Har saal ka kharcha jo quote mein nahi likha hota',
       Table(['Kharcha', 'Offer price', 'Renewal pe'], [
           ('.in domain', '₹1 pehle saal (GoDaddy pe 3 saal ki purchase ke saath)', '₹899 saal ka (Hostinger, GoDaddy)'),
           ('.com domain', '₹1 pehle saal (GoDaddy pe 3 saal ki purchase ke saath)', '₹1,499–₹1,599 saal ka (Hostinger, GoDaddy)'),
           ('Shared hosting', '₹69–₹199 mahina, 48 mahine (4 saal) advance', '₹289–₹649 mahina renewal pe (Hostinger)'),
           ('SSL (padlock)', 'Free', 'Free (Let’s Encrypt ya aapka host)'),
           ('Online store platform', 'Shopify Basic lagbhag ₹1,500–₹1,800 mahina, saal ka bill', 'Same'),
           ('Payment gateway', 'Razorpay 2% har payment pe, fee pe GST', 'Same'),
       ], 'Website ka saalana kharcha: offer price aur renewal'),
       Note('Prices providers ke apne pages se, 21–23 October 2026, GST se pehle. ₹1 domain aur ₹69 hosting wale offers sach hain, par ₹69 '
            'hosting ke liye 48 mahine (4 saal) ki purchase chahiye, aur renewal pe hosting offer se chaar guna se zyada mehengi ho jaati hai '
            '(₹69 se ₹289 mahina). Offer nahi, renewal ke hisaab se plan kariye.'),
       eyebrow='Saal ka kharcha', tone='band'),
   Sec('GST: 18%, par hamesha nahi',
       Cards([('rupee', 'Agency 18% jodti hai', 'Website design pe 18% GST lagta hai, toh ₹40,000 ka quote ₹47,200 ban jaata hai.'),
              ('user', 'Chhote freelancer aksar GST nahi lete', 'Service provider ko GST registration tab chahiye jab saal ka turnover ₹20 lakh se upar ho '
               '(CGST Act, section 22), aur jo registered nahi hai woh GST collect nahi kar sakta. Agar freelancer GST jode, toh GSTIN maangiye.'),
              ('refresh', 'Aapko wapas mil sakta hai', 'Agar aapka business GST-registered hai, toh apne CA se input tax credit ke baare mein poochiye.')], cols=3),
       eyebrow='GST', layout='wide'),
   Sec('Pay karne se pehle yeh 6 sawaal poochiye',
       Check(['Price GST ke saath hai ya bina?',
              'Domain kiske naam aur email pe register hoga? (Aapke naam pe hona chahiye.)',
              'Launch pe website ka admin login aur hosting login milega?',
              'Offer khatam hone ke baad hosting aur domain ka saal ka kharcha kitna hoga?',
              'Kitne rounds ke changes included hain?',
              'Design custom hai ya theme? Theme hai toh kaunsi?']),
       eyebrow='Checklist', layout='wide', tone='dark'),
   Sec('Website kaise banaye: khud ya designer se?',
       P('Website khud banane ke do raaste hain: Wix, Shopify ya WordPress.com jaise builder pe, ya unke mobile app se. Builder pe monthly plan '
         'aur aapka apna time lagta hai, design template wala hota hai, aur online store pe har sale pe fees lagti hai. Chhote kaam ya idea test '
         'karne ke liye yeh theek hai. Jab website hi naye customers ka pehla stop ban jaaye, tab designer se banwana behtar padta hai.'),
       Cards([('layers', 'Builder pe khud', 'Monthly plan aur aapka time; template design, jo baaki sites jaisa dikh sakta hai.'),
              ('phone', 'Mobile se', 'Kuch builders ke apps se phone pe bhi site ban aur edit ho jaati hai, par design aur features limited rehte hain.'),
              ('user', 'Designer se', 'Custom design, domain aur logins aapke naam pe, aur ek baar ka fixed price.')], cols=3),
       P('Teeno raaston ki poori comparison, prices ke saath: ' + _link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder', 'freelancer vs agency vs website builder') + ' (English).'),
       eyebrow='Khud ya designer', sid='kaise'),
   Sec('Website kitne din mein banti hai?',
       Durations([('Landing page', 3 / 7, 1, '3–7 din'), ('Basic business website', 1, 4, '1–4 hafte'),
                  ('Custom design wali website', 3, 8, '3–8 hafte'), ('Online store', 4, 12, '4–12 hafte')], scale=12, label='hafte'),
       P('Yeh timelines price guides se hain. Online store mein kitna time lagega, yeh is pe depend karta hai ki '
         'kitne products hain. U Scale se website zyada tar 3–4 hafte mein live hoti hai. Sabse bada delay aksar build nahi hota: photos, '
         'prices aur text ka intezaar hota hai.'),
       eyebrow='Timeline'),
  ],
  faq=[('Mumbai mein website banane mein kitna kharcha aata hai?',
        'Template wali basic business website lagbhag ₹8,000–₹30,000, Mumbai studio se ₹15,000–₹50,000, aur custom design ₹40,000 se ₹2 lakh tak. '
        f'U Scale ke fixed prices: landing page {price("Landing page")}, 5–10 page business website {price("Business site, 5–10 pages")}, online store {price("E-commerce, under 50 products")} se.'),
       ('E-commerce website banane mein kitna kharcha aata hai?',
        'Market mein online store ₹25,000 se ₹3 lakh tak, products aur features pe depend karta hai. U Scale se 50 se kam products ka store '
        f'{price("E-commerce, under 50 products")} aur 50–500 products ka {_fmt(rupees("E-commerce, 50–500 products"))} se. Iske upar har payment pe gateway fee, '
        'aur Shopify jaisa platform ho toh uski monthly fee alag.'),
       ('Website ka har saal kya kharcha aata hai?',
        'Domain aur hosting: offer khatam hone ke baad lagbhag ₹4,400–₹9,400 saal ka, GST se pehle. .in domain ka renewal ₹899 saal ka hai. '
        'Online store pe platform fee aur har payment pe gateway fee alag se.'),
       ('Kya website banane pe GST lagta hai?',
        'Haan, website design pe 18% GST lagta hai jab registered agency ya freelancer bill karta hai. Jiska turnover ₹20 lakh se kam hai aur jo '
        'registered nahi hai, woh GST nahi le sakta. U Scale abhi apne prices pe GST charge nahi karta.'),
       ('₹5,000–₹10,000 wali sasti website lena theek hai?',
        'Agar aapko pata hai ki yeh ek theme hai aur domain aur logins aapke naam pe honge, toh chhote kaam ke liye theek ho sakta hai. Theme ka naam, '
        'renewal price aur launch ke baad support ke baare mein likhit mein poochiye.'),
       ('Kya U Scale ka price fixed hai?',
        'Haan. Free audit ke baad price fixed hota hai aur kaam shuru hone se pehle likhit mein agree hota hai: 20% shuru mein, 20% design approve '
        'hone pe, 60% launch pe. Copywriting, photography aur payment gateway fees alag se, hamesha pehle bata ke.')],
  sources=['in-domain', 'gd-domain', 'com-domain', 'gd-com', 'hosting', 'ssl', 'shopify', 'razorpay-pricing', 'gst-22'],
  offers=['Landing page', 'Business site, 5–10 pages', 'Business site, 10–20 pages + blog', 'E-commerce, under 50 products'],
  work=[]),

 dict(slug='freelancer-vs-agency-vs-website-builder', kind='guide', crumb='Freelancer vs agency vs builder',
  card='Typical prices from 16 published sources, who each option suits and what to watch out for.',
  service='Freelancer vs agency vs DIY website builder, Mumbai (2026)',
  title='Freelancer vs Agency vs Website Builder (2026) | U Scale',
  desc='Freelancer, agency or DIY website builder for a Mumbai business? Price ranges from 16 published guides (2025–26), '
       'who each one suits and what to watch for.',
  h1='Freelancer, agency or website builder?', eyebrow='Guide · Compared',
  lead='Should a Mumbai business hire a freelancer or an agency, or build its own website on a DIY builder? I run U Scale, so I am not neutral: the price ranges here come from 16 published price guides (2025–26), listed below, not from my own prices.',
  stats=[('₹10k–₹80k', 'Freelancer'), ('₹50k–₹3L', 'Agency'), ('16', 'Price guides, listed below')],
  art=dict(kind='img', img='paths'),
  answer='For a small Mumbai business with a simple site, a freelancer or one-person studio is often enough, and usually costs less than an agency. Freelancer projects mostly cost '
         '₹10,000–₹80,000 and agency projects ₹50,000–₹3 lakh, according to 16 recent website price guides '
         '(listed below). A DIY builder costs least upfront but takes your time and a monthly fee. Choose an agency when you need a large team '
         'working in parallel. U Scale sits in between: one person doing the work, with written scope and a fixed price.',
  facts=[('DIY website builder', 'A monthly plan (Wix from ₹250/month, Shopify Basic about ₹1,500–₹1,800/month, billed yearly) plus your own time'),
         ('Freelancer', '₹10,000–₹80,000 for most projects'),
         ('Agency', '₹50,000–₹3,00,000 for most projects'),
         ('U Scale', f'Fixed: landing page {price("Landing page")}, business site {price("Business site, 5–10 pages")}, online store from {price("E-commerce, under 50 products")}'),
         ('Whatever you choose', 'Domain, admin login and hosting login in your name')],
  sections=[
   Sec('Freelancer vs agency vs DIY builder, side by side',
       Options([dict(name='DIY builder', tag='Tiny budget', rows=[('Typical cost', 'Monthly plan + your time'), ('Who does the work', 'You'), ('Design', 'A template'),
                     ('Good for', 'Testing an idea on a tiny budget'), ('Watch out for', 'Hours of your time; a template look; fees on every sale')]),
                dict(name='Freelancer', tag='Simple sites', rows=[('Typical cost', '₹10,000–₹80,000'), ('Who does the work', 'One person'), ('Design', 'A theme or custom (ask which)'),
                     ('Good for', 'Simple sites with a clear brief'), ('Watch out for', 'Who fixes things after launch, and who holds the logins')]),
                dict(name='Agency', tag='Large sites', rows=[('Typical cost', '₹50,000–₹3,00,000'), ('Who does the work', 'A team: designer, developer, account manager'), ('Design', 'Custom, or a customised theme (ask which)'),
                     ('Good for', 'Large sites with many people working in parallel'), ('Watch out for', 'Part of the price pays for the team around the work; you may deal with an account manager, not the designer')]),
                dict(name='U Scale', tag='One person, fixed price', hi=True, rows=[('Typical cost', f'Fixed, {price("Landing page")}–{price("E-commerce, under 50 products")} for most sites'),
                     ('Who does the work', 'Mehul Karotra, personally'), ('Design', 'Custom, designed in Figma'),
                     ('Good for', 'Small businesses that want custom work and one point of contact'), ('Watch out for', 'One person, so the start date depends on how busy he is: ask when he can start')])],
               note=GUIDES_NOTE),
       eyebrow='Compared', layout='wide'),
   Sec('When an agency is the better choice',
       P('Pick an agency when the site is large, needs several specialists at once (developers, writers, a photographer, an ads team) or has a hard '
         'launch date that one person can’t meet. You pay for the team, and for a big project that is worth it.'),
       eyebrow='Agency', layout='half'),
   Sec('When a DIY builder is enough',
       P('If you are testing an idea, need a single page for a few weeks, or have more time than budget, a builder like Shopify, Wix or WordPress.com is a '
         'fair choice. Count the hours you will spend and the fees on every sale. On Shopify’s Basic plan in India, Shopify adds its own 2% on '
         'each sale on top of the payment gateway’s fee, because Shopify Payments isn’t available in India.'),
       eyebrow='DIY builder', layout='half'),
   Sec('What Wix, Shopify, Squarespace and Hostinger cost a year in India',
       Table(['Builder', 'Cheapest plan, per month, billed yearly', 'A year at that rate', 'Watch for'],
             [('Wix', '₹250 (Light)', '₹3,000', 'Prices exclude taxes; check which plan takes online payments'),
              ('Squarespace', '₹630 (Basic)', '₹7,560', '2% on store sales on Basic; a 50%-off code was on offer when checked'),
              ('Hostinger Website Builder', '₹139 (Premium, 4-year term)', '₹1,668', 'Renews at ₹449 a month; prices exclude GST'),
              ('Shopify', 'About ₹1,500–₹1,800 (Basic)', '₹18,000–₹21,600', 'Plus 2% on every sale in India, on top of the payment gateway fee')],
             'Yearly cost of website builders in India, cheapest plan, from their own pricing pages on 10 Nov 2026'),
       Note('From each builder’s own pricing page, seen 10 Nov 2026, before GST unless stated. Offers change often: check the renewal price, not just the first year.'),
       eyebrow='Builder costs', layout='wide', sid='builders'),
   Sec('Six checks before you hire anyone',
       Check(['The domain is registered in your business’s name, with your email.',
              'You get the website admin login and the hosting login at launch, in writing.',
              'You know the hosting and domain renewal prices, not just the offer price.',
              'You know whether the design is custom or a theme, and which theme.',
              'Pages, rounds of changes, who writes the text and the timeline are written down before the advance.',
              'You know who fixes things after launch, for how long, and what edits cost after that.']),
       eyebrow='Checklist', layout='wide', tone='dark'),
  ],
  faq=[('Should I hire a freelancer or an agency for my website in Mumbai?',
        'For a small business with a simple site, a freelancer or one-person studio is often enough: you talk directly to the person doing the work, decisions '
        'are faster, and you don’t pay for account managers. Choose an agency for large sites that need a team working in parallel.'),
       ('Is a website builder like Wix or Shopify good enough?',
        'For testing an idea on a small budget, yes. You pay a monthly plan and spend your own time, the design is a template, and online stores pay '
        'fees on every sale. A custom site makes sense once your website is where most new customers first see you.'),
       ('Is U Scale a freelancer or an agency?',
        'A bit of both. U Scale is one person, Mehul Karotra, working with an agency’s process: a written scope, a fixed price agreed before work '
        'starts, and design approval before the build.'),
       ('Who should own my website and domain?',
        'You. Whoever builds it, the domain should be registered in your business’s name with your email, and you should get the admin and hosting '
        'logins at launch.')],
  sources=['shopify', 'shopify-payments', 'wix', 'squarespace', 'hostinger-builder', *GUIDES],
  offers=['Landing page', 'Business site, 5–10 pages', 'E-commerce, under 50 products'],
  work=[]),
]


# ---------------------------------------------------------------- the main website-design page
def parent_sections():
    """Sections for /services/website-design-mumbai (built by seo_pages.service_page), after "What's included"."""
    return [
        Sec('Landing pages for ads and launches',
            P(f'A landing page is a single page built for one job: an ad campaign, a launch, an offer or a new branch. It costs {price("Landing page")}, '
              'fixed, and can be live in under two weeks. It loads fast on a phone, says what you sell and what it costs, and ends in one clear action, '
              'usually a WhatsApp message.',
              'Running Google or Meta ads? A page that matches the ad is part of ' + _link('/services/google-meta-ads-mumbai', 'ads management') + ' too.'),
            Cards([('bolt', 'One goal', 'One offer and one next step, so visitors don’t wander off.'),
                   ('phone', 'Fast on a phone', 'Most ad clicks come from phones, so it is designed for one first.'),
                   ('chat', 'One clear action', 'WhatsApp, a call or a short form, right where people decide.')], cols=3),
            eyebrow='Landing pages', sid='landing'),
        Sec(f'Why {price("Business site, 5–10 pages")} and not a ₹25,000 template?',
            Table(['', 'U Scale business site', 'Template package'],
                  [('Price', f'{price("Business site, 5–10 pages")}, fixed, for 5–10 pages', '₹8,000–₹30,000 in 2025–26 price guides'),
                   ('Design', 'Designed for you in Figma, screen by screen', 'A ready-made theme with your logo and colours'),
                   ('Code', 'Hand-coded, with nothing the site doesn’t use', 'A theme and plugins, often more than the site needs'),
                   ('Speed on a phone', 'Built and tested to pass Google’s Core Web Vitals', 'Depends on the theme and plugins'),
                   ('Domain and logins', 'In your name from day one', 'Ask: sometimes held by the seller'),
                   ('SEO set-up', 'Titles, headings, structured data and Search Console at launch', 'Often extra, or not included')],
                  'What a U Scale business website includes compared with a typical template package'),
            P('A template package can be the right call on a tight budget; just know what you are buying. The market ranges come from 16 published '
              'price guides, listed in the ' + _link('/services/website-design-mumbai/freelancer-vs-agency-vs-website-builder#sources', 'freelancer vs agency guide')
              + ', with six checks to make before you hire anyone. For your own estimate, try the '
              + _link('/tools/website-cost-calculator', 'website cost calculator') + '.'),
            eyebrow='The price gap', layout='wide', tone='band', sid='value'),
        Sec('Areas I work in across Mumbai',
            P('I’m based in Ghatkopar West and meet clients across Mumbai: the western suburbs from Bandra to Borivali, the island city from Dadar '
              'and Lower Parel to Worli and Fort, and the eastern suburbs around me, from Kurla and Chembur to Powai and Mulund.',
              'Two areas have their own pages: ' + _link('/services/website-design-mumbai/ghatkopar', 'Ghatkopar, where I’m based') + ', and '
              + _link('/services/website-design-mumbai/andheri-east', 'Andheri') + '. Beyond Mumbai, I work in person with businesses in '
              + _link('/services/website-design-thane', 'Thane') + ' and ' + _link('/services/website-design-navi-mumbai', 'Navi Mumbai') + ', and '
              'across India over WhatsApp and video calls.'),
            Chips(['Borivali', 'Kandivali', 'Malad', 'Goregaon', 'Andheri', 'Bandra', 'Dadar', 'Lower Parel', 'Worli', 'Ghatkopar', 'Powai', 'Mulund', 'Chembur', 'Thane', 'Navi Mumbai'], 'Areas I visit'),
            eyebrow='Near you', sid='areas'),
    ]


# ---------------------------------------------------------------- images
# All original: device mockups for invented demo brands, Mehul's own photo and real U Scale work. Never photos copied
# from Google Maps or other sites (they belong to their owners, and copies don't rank in image search anyway).
# Charts, maps and price cards are drawn in HTML/SVG on the page instead: sharp at any size, readable by crawlers and
# AI, animated with CSS only, and no extra download. Raster files live in source/static/assets/pages/ as AVIF + WebP,
# each with a phone-sized version; the hero image is the page's primary image (and Largest Contentful Paint), so it
# loads eagerly with high priority and everything below the fold is lazy.
A = '/assets/pages/'
IMG = {
 'rest': dict(file=A + 'restaurant-website-online-ordering-mumbai', w=1200, h=1000, small=640,
              alt='Demo café website with its own online ordering: a Chai Kona menu of masala chai, bun maska and vada pav, and a ₹100 pickup order ready to pay by UPI',
              caption='A demo café menu and checkout with its own online ordering. Chai Kona is a fictional example.'),
 'bout': dict(file=A + 'boutique-website-whatsapp-ordering-mumbai', w=1200, h=1000, small=640,
              alt='Demo boutique product page for a ₹3,450 Chanderi kurta set with an Order on WhatsApp button, next to the WhatsApp chat it opens asking about size M',
              caption='A sample product page and the matching WhatsApp enquiry. Saanjh Studio is fictional.'),
 'found': dict(file=A + 'google-maps-ai-answer-local-seo-mumbai', w=1200, h=1000, small=640,
               alt='Demo café\'s Google search listing in Andheri East with Directions, Website and Call buttons and a map pin, beside an illustrative AI answer that cites the café\'s website and business listing',
               caption='An illustrative café listing, local map and sourced AI answer. Chai Kona is a fictional example.'),
 'social': dict(file=A + 'social-media-ads-whatsapp-enquiries-mumbai', w=1200, h=1000, small=640,
                alt='Demo sponsored post for a café\'s masala chai and bun maska with a Send WhatsApp message button, and the WhatsApp chat it starts where a customer asks about takeaway and picks a pickup time',
                caption='A demo sponsored post leading to a WhatsApp takeaway enquiry. Chai Kona is a fictional example.'),
 'salon': dict(file=A + 'salon-website-whatsapp-booking-mumbai', w=1200, h=1000, small=640,
               alt='Demo salon website shown in a desktop browser and a mobile preview, with hair, skin and nails services and Book on WhatsApp buttons',
               caption='A demo salon website with desktop and mobile previews and a WhatsApp enquiry action. Mira Studio is a fictional example.'),
 'step-audit': dict(file=A + 'free-website-audit-report-mumbai', w=1200, h=900, small=640,
               alt='Sample free audit report listing the first three fixes: make the website enquiry easier to find, complete the Google listing\'s hours and contact details, and link Instagram to an enquiry page',
               caption='A sample free audit from U Scale: the first three fixes, agreed before any work starts. Illustrative example.'),
 'step-plan': dict(file=A + 'fixed-price-website-quote-mumbai', w=1200, h=900, small=640,
               alt='Sample written plan for a 5–10 page business website: design and build, mobile-first pages and basic SEO, a 3–4 week timeline, a fixed price of ₹55,000 and a 20%, 20%, 60% payment schedule',
               caption='A sample written plan from U Scale, with scope, timeline and a fixed price agreed before work starts.'),
 'step-design': dict(file=A + 'website-design-review-approval', w=1200, h=900, small=640,
               alt='Sample design review in a design tool: a boutique product page with its Order on WhatsApp button selected, the layer list and spacing settings beside it',
               caption='A sample design review: you see and approve real screens before the build. Saanjh Studio is fictional.'),
 'step-launch': dict(file=A + 'website-launch-monthly-report', w=1200, h=900, small=640,
               alt='Sample launched boutique website beside a project handover checklist (mobile checked, enquiry tested, logins handed over) and monthly review topics: website enquiries, Google visibility and next priorities',
               caption='A sample launch handover and monthly review. Saanjh Studio is fictional.'),
 'tool-checker': dict(file=A + 'google-business-profile-checker-score', w=1200, h=800, small=640,
               alt='The free Google Business Profile checker with a sample score of 71 out of 100 across profile basics, photos and updates, reviews, and website and trust, and three top fixes',
               caption='A sample report from U Scale\'s free Google Business Profile checker. The score is illustrative.'),
 'tool-qr': dict(file=A + 'google-review-qr-code-standee', w=1200, h=800, small=640,
               alt='The free Google review QR code maker: paste a review link, add a business name, choose English or Hinglish wording and a design, and download a printable QR standee',
               caption='U Scale\'s free review QR maker with a demo design. Scan the code to try the tool.'),
 'paths': dict(file=A + 'freelancer-agency-website-builder-quote-comparison', w=1200, h=1000, small=640,
               alt='Three ways to get a website for a demo plant shop side by side: a DIY site builder editor, a chat with a freelancer, and an agency project board with design, build and review stages',
               caption='Illustrated examples of DIY, direct freelance and agency workflows.'),
 # City pages: sample designs for fictional businesses, built around generated photos (the captions say so)
 'city-pune': dict(file=A + 'pune-coaching-institute-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Pune coaching institute, Disha Tutorials, in a desktop browser and a mobile preview: a classroom photo, Class 10, Class 12 Science and JEE course cards, and an Enquire on WhatsApp button',
              caption='A sample design for a Pune coaching institute. Disha Tutorials is fictional.'),
 'city-bengaluru': dict(file=A + 'bengaluru-d2c-brand-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Bengaluru millet snack brand, Ragi Roots: product cards for Ragi Chips, Jowar Puffs and Bajra Crackers, and a mobile product page with a Pay with UPI button',
              caption='A sample design for a Bengaluru D2C brand. Ragi Roots is fictional.'),
 'city-chennai': dict(file=A + 'chennai-dental-clinic-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Chennai dental clinic, Nalam Dental Care, with an English and Tamil language switch, treatment prices from ₹500, a map card and Book on WhatsApp buttons',
              caption='A sample design for a Chennai clinic. Nalam Dental Care is fictional.'),
 'city-delhi': dict(file=A + 'delhi-ca-firm-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Delhi chartered accountant firm, Mehra & Associates: GST, income tax and company registration fees and an Ask on WhatsApp button, on desktop and phone',
              caption='A sample design for a Delhi CA firm. Mehra & Associates is fictional.'),
 'city-hyderabad': dict(file=A + 'hyderabad-diagnostic-lab-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Hyderabad diagnostic lab, Deccan Diagnostics: home blood-test packages with prices and a time-slot booking on the phone',
              caption='A sample design for a Hyderabad diagnostic lab. Deccan Diagnostics is fictional.'),
 'city-kolkata': dict(file=A + 'kolkata-sweet-shop-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Kolkata sweet shop, Mishti Mahal: rosogolla, sandesh and mishti doi with prices, and a festive gift box with Order on WhatsApp',
              caption='A sample design for a Kolkata sweet shop. Mishti Mahal is fictional.'),
 'city-ahmedabad': dict(file=A + 'ahmedabad-fabric-wholesaler-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Ahmedabad fabric wholesaler, Sabarmati Fabrics: a catalogue of printed cotton and rayon with Get price on WhatsApp buttons',
              caption='A sample design for an Ahmedabad fabric wholesaler. Sabarmati Fabrics is fictional.'),
 'city-surat': dict(file=A + 'surat-diamond-jewellery-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Surat lab-grown diamond jeweller, Tapi Diamonds: certified rings, earrings and a bracelet with prices',
              caption='A sample design for a Surat diamond jeweller. Tapi Diamonds is fictional.'),
 'city-jaipur': dict(file=A + 'jaipur-heritage-hotel-website-sample', w=1200, h=1000, small=640, big=2400,
              alt='Sample website for a fictional Jaipur heritage guesthouse, Haveli Neel: a haveli courtyard, three rooms with nightly prices and a WhatsApp availability check',
              caption='A sample design for a Jaipur heritage stay. Haveli Neel is fictional.'),
 'remote-review': dict(file=A + 'remote-website-design-review-whatsapp', w=1200, h=1000, small=640, big=2400,
              alt='Illustration of a remote design review: a shop homepage design with comments, a chat where the client approves the change, and a video call with the shop owner',
              caption='How a design review works over chat and video. The shop and people are fictional.'),
 'mehul': dict(file=A + 'mehul-karotra-website-designer-ghatkopar', w=1200, h=1200, small=640,
               alt='Mehul Karotra, website designer and founder of U Scale, based in Mumbai',
               caption='Mehul Karotra, who designs and builds every U Scale website himself.'),
}
OG = {'restaurants-cafes': 'og-restaurant-website-mumbai', 'boutiques-fashion': 'og-boutique-website-mumbai',
      'ghatkopar': 'og-website-designer-ghatkopar', 'andheri-east': 'og-website-design-andheri-east',
      'website-banane-ka-kharcha': 'og-website-banane-ka-kharcha', 'freelancer-vs-agency-vs-website-builder': 'og-freelancer-vs-agency-vs-builder'}
OG_ALT = {'restaurants-cafes': 'Restaurant and café websites with online ordering, by U Scale',
          'boutiques-fashion': 'Boutique and clothing store websites, by U Scale',
          'ghatkopar': 'Website designer and developer in Ghatkopar: Mehul Karotra of U Scale',
          'andheri-east': 'Website design for Andheri East businesses, by U Scale',
          'website-banane-ka-kharcha': 'Website banane me kitna kharcha aata hai: Mumbai 2026 guide by U Scale',
          'freelancer-vs-agency-vs-website-builder': 'Freelancer vs agency vs DIY website builder: Mumbai 2026 guide by U Scale'}


def page_images(p):
    """On-page raster images, in order: the hero art first."""
    keys = []
    if p['art']['kind'] == 'img': keys.append(p['art']['img'])
    if p['art']['kind'] == 'portrait': keys.append('mehul')
    keys += [b['key'] for s in p['sections'] for b in s['blocks'] if b['t'] == 'img' and b['key'] not in keys]
    return [IMG[k] for k in keys]


# Cache busting: /assets is cached for 30 days (vercel.json) under plain file names, so every image URL the pages
# emit carries ?v=<first 8 hex of the file's sha1>. Re-encoding a file changes its URL; untouched files keep theirs.
_STATIC = pathlib.Path(__file__).resolve().parent.parent / 'static'
_VER = {}


def vurl(path):
    """'/assets/x.webp' -> '/assets/x.webp?v=1a2b3c4d' (hash of that exact file in source/static, cached per build)."""
    if path not in _VER:
        f = _STATIC / path.lstrip('/')
        if not f.is_file():
            return path  # build_site.py's image guard then stops the build with a clear message
        _VER[path] = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
    return f'{path}?v={_VER[path]}'


def srcset(img, ext, small=None):
    """'<file>-640.avif?v=... 640w, <file>.avif?v=... 1200w' for an IMG entry, plus '<file>-2400.avif 2400w' when the
    entry has a retina version ('big'), so high-density screens get a sharp picture."""
    s, f = small or img['small'], img['file']
    big = f', {vurl(f"{f}-{img["big"]}.{ext}")} {img["big"]}w' if img.get('big') else ''
    return f'{vurl(f"{f}-{s}.{ext}")} {s}w, {vurl(f"{f}.{ext}")} {img["w"]}w{big}'


def _pic(img, sizes, eager=False, cls=''):
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}>'
            f'<source type="image/avif" srcset="{srcset(img, "avif")}" sizes="{sizes}">'
            f'<img src="{vurl(img["file"] + ".webp")}" srcset="{srcset(img, "webp")}" sizes="{sizes}" '
            f'width="{img["w"]}" height="{img["h"]}" alt="{ea(img["alt"])}" {load}></picture>')


def image_ld(site, url, p):
    out = []
    for i, img in enumerate(page_images(p)):
        out.append({'@type': 'ImageObject', '@id': f'{url}#image-{i + 1}', 'url': site + img['file'][1:] + '.webp',
                    'contentUrl': site + img['file'][1:] + '.webp', 'width': img['w'], 'height': img['h'], 'caption': img['caption'],
                    'description': img['alt'], 'inLanguage': 'en-IN', 'encodingFormat': 'image/webp', 'representativeOfPage': i == 0,
                    'creditText': 'U Scale', 'creator': {'@id': site + '#business'}, 'copyrightHolder': {'@id': site + '#business'},
                    'copyrightNotice': '© 2026 U Scale by Mehul Karotra'})
    og = OG[p['slug']]
    out.append({'@type': 'ImageObject', '@id': f'{url}#og-image', 'url': f'{site}assets/pages/{og}.jpg', 'contentUrl': f'{site}assets/pages/{og}.jpg',
                'width': 1200, 'height': 630, 'caption': OG_ALT[p['slug']], 'encodingFormat': 'image/jpeg', 'representativeOfPage': not out,
                'creditText': 'U Scale', 'creator': {'@id': site + '#business'}, 'copyrightHolder': {'@id': site + '#business'},
                'copyrightNotice': '© 2026 U Scale by Mehul Karotra'})
    return out


def images_by_url(site):
    """{page URL: [(image URL, caption)]} for the image sitemap: only images people see on the page (share images
    are in the schema as the page's representative image, but Google wants sitemap images to be on the page)."""
    return {url_of(site, p): [(site + i['file'][1:] + '.webp', i['caption']) for i in page_images(p)] for p in PAGES}


# ---------------------------------------------------------------- maps (drawn as dioramas in depth_art.py)
AE_DESC = ('Schematic, not to scale: Metro Line 1 stations from Western Express Highway through Chakala, Airport Road, Marol Naka, Saki Naka, '
           'Asalpha and Jagruti Nagar to Ghatkopar, where U Scale is based. Andheri East areas marked: Gundavali, Chakala and J.B. Nagar, '
           'Marol and MIDC, Saki Naka.')


SVGS = {'gk-map': lambda: __import__('depth_art').gk_map(), 'ae-metro': lambda: __import__('depth_art').metro_map(),
        'about-map': lambda: __import__('depth_art').about_map()}


# ---------------------------------------------------------------- block renderers
def _cards(b):
    out = []
    for i, (ic, t, d) in enumerate(b['items']):
        mark = f'<span class="fp-card__n" aria-hidden="true">{i + 1:02d}</span>' if b['numbered'] else ''
        ico = f'<span class="fp-card__ic">{icon(ic)}</span>' if ic else ''
        out.append(f'<li class="fp-card" data-reveal>{ico}{mark}<h3>{e(t)}</h3><p>{d}</p></li>')
    if b.get('cta'):  # a dark link card, e.g. to fill the empty sixth cell of a 3-column grid of five
        href, ic, t, d, go = b['cta']
        out.append(f'<li data-reveal><a class="fp-card fp-card--cta on-dark" href="{ea(href)}"><span class="fp-card__ic">{icon(ic)}</span><b class="fp-card__t">{e(t)}</b>'
                   f'<p>{e(d)}</p><span class="fp-card__go">{e(go)}{icon("arrow")}</span></a></li>')
    return f'<ul class="fp-cards fp-cards--{b["cols"]}{" fp-cards--n" if b["numbered"] else ""}" data-reveal-group>{"".join(out)}</ul>'


def _calc():
    total = rupees('Restaurant site + own online ordering')
    sales, rate, share = 200000, 20, 25
    direct = sales * share / 100; com = direct * rate / 100; fee = direct * 0.0236; kept = com - fee
    pay = round(total / kept)
    return f'''<div class="fp-calc" data-calc data-price="{total}" data-reveal>
  <form class="fp-calc__in" aria-label="Your numbers">
    <label class="fp-field"><span>Your sales on delivery apps, per month</span>
      <span class="fp-field__money"><b aria-hidden="true">₹</b><input name="sales" type="number" inputmode="numeric" min="0" step="5000" value="{sales}" aria-describedby="calc-hint"></span></label>
    <label class="fp-field"><span>Commission you pay the apps <output name="rateo">{rate}%</output></span>
      <input name="rate" type="range" min="10" max="35" step="1" value="{rate}"></label>
    <label class="fp-field"><span>Regulars who switch to your website <output name="shareo">{share}%</output></span>
      <input name="share" type="range" min="5" max="60" step="5" value="{share}"></label>
    <p class="fp-calc__hint" id="calc-hint">Gateway fee: 2% + 18% GST on the fee = 2.36% (Razorpay standard plan).</p>
  </form>
  <div class="fp-calc__out" aria-live="polite">
    <table class="fp-receipt">
      <caption class="sr-only">Worked example: commission saved by moving regulars to direct ordering</caption>
      <tbody>
        <tr><th scope="row">Sales on delivery apps, per month</th><td data-o="sales">{_fmt(sales)}</td></tr>
        <tr><th scope="row">Regulars who switch to ordering on your website</th><td data-o="direct">{share}%, so {_fmt(direct)} of orders</td></tr>
        <tr><th scope="row">App commission on those orders at <span data-o="rate">{rate}%</span></th><td data-o="com">{_fmt(com)} a month</td></tr>
        <tr><th scope="row">Payment gateway fee on your own site (2% + 18% GST = 2.36%)</th><td data-o="fee">{_fmt(fee)} a month</td></tr>
      </tbody>
    </table>
    <div class="fp-bars" aria-hidden="true">
      <div class="fp-bar"><span>Commission to the app</span><i style="--w:100%" data-o="bar-com"></i><b data-o="com-s">{_fmt(com)}</b></div>
      <div class="fp-bar fp-bar--go"><span>Gateway fee on your site</span><i style="--w:{fee / com * 100:.1f}%" data-o="bar-fee"></i><b data-o="fee-s">{_fmt(fee)}</b></div>
    </div>
    <p class="fp-kept"><span>Kept by you every month</span><b data-o="kept">{_fmt(kept)}</b></p>
    <p class="fp-payback">Website + ordering, one-time: <b>{_fmt(total)}</b>, paid back in about <b data-o="pay">{pay} months</b></p>
  </div>
</div>'''


def _calc_text():
    total = rupees('Restaurant site + own online ordering')
    return ('Worked example (example café):\n- Sales on delivery apps, per month: ₹2,00,000\n- Regulars who switch to ordering on your website: '
            '25%, so ₹50,000 of orders\n- App commission on those orders at 20%: ₹10,000 a month\n- Payment gateway fee on your own site '
            f'(2% + 18% GST = 2.36%): ₹1,180 a month\n- Kept by you every month: {_fmt(_rest_saving)}\n- Website + ordering, one-time: '
            f'{_fmt(total)}, paid back in about {round(total / _rest_saving)} months')


def _options(b):
    cards = ''
    for o in b['items']:
        rows = ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in o['rows'])
        cards += (f'<li class="fp-opt{" fp-opt--hi on-dark" if o.get("hi") else ""}" data-reveal><p class="fp-opt__tag">{e(o["tag"])}</p>'
                  f'<h3>{e(o["name"])}</h3><dl>{rows}</dl></li>')
    note = f'<p class="fp-note">{e(b["note"])}</p>' if b['note'] else ''
    snap = ' fp-snap" data-snap aria-label="Options compared' if len(b['items']) > 2 else ''  # 3+ cards: a swipe row on phones
    nrows = max(len(o['rows']) for o in b['items'])  # cards share row lines (CSS subgrid), so each label sits level across the row
    return f'<ul class="fp-opts fp-opts--{len(b["items"])} fp-opts--r{nrows}{snap}" data-reveal-group>{cards}</ul>{note}'


def _range(b):
    hi = b['ticks'][-1]
    pct = lambda v: f'{v / hi * 100:.2f}%'
    ticks = ''.join(f'<span style="--x:{pct(t)}">{e(_short(t) if t else "₹0")}</span>' for t in b['ticks'])
    # a mark is also plotted as a green dot on the row it matches ("Business site" → "...business website", "Online store" → "Online store")
    on_row = lambda l: ''.join(f'<b class="fp-range__us" style="--x:{pct(v)}"></b>' for v, ml in b['marks'] if ml.split()[0].lower() in l.lower())
    rows = ''.join(f'<li class="fp-range__row"><span class="fp-range__l">{e(l)}</span><span class="fp-range__track"><i style="--a:{pct(a)};--b:{pct(z)}"></i>{on_row(l)}</span>'
                   f'<span class="fp-range__v">{_short(a)}–{_short(z)}</span></li>' for l, a, z in b['rows'])
    # labels alternate below / above the line so close prices (₹25k, ₹55k) never touch
    marks = ''.join(f'<span class="fp-range__mark{" fp-range__mark--up" if i % 2 else ""}" style="--x:{pct(v)}"><b>{_short(v)}</b><small>{e(l)}</small></span>'
                    for i, (v, l) in enumerate(b['marks']))
    return f'''<div class="fp-range" data-reveal>
  <div class="fp-range__scale" aria-hidden="true">{ticks}</div>
  <ul class="fp-range__rows">{rows}</ul>
  <div class="fp-range__marks"><span class="fp-range__ml">{e(b["note"])}</span><div class="fp-range__mtrack">{marks}</div></div>
</div>'''


def _durations(b):
    pct = lambda v: f'{v / b["scale"] * 100:.2f}%'
    rows = ''.join(f'<li><span class="fp-dur__l">{e(l)}</span><span class="fp-dur__track"><i style="--a:{pct(a)};--b:{pct(z)}"></i></span><b>{e(t)}</b></li>'
                   for l, a, z, t in b['rows'])
    return f'<ul class="fp-dur" data-reveal>{rows}</ul>'


def _table(b):
    th = ''.join(f'<th scope="col">{e(h)}</th>' for h in b['head'])
    body = ''.join('<tr><th scope="row">' + e(r[0]) + '</th>' + ''.join(f'<td data-l="{ea(b["head"][j + 1])}">{e(c)}</td>' for j, c in enumerate(r[1:])) + '</tr>'
                   for r in b['rows'])
    return f'<div class="fp-table" data-reveal><table><caption class="sr-only">{e(b["caption"])}</caption><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def _links(b):
    out = ''
    for href, ic, t, d, pr in b['items']:
        ext = href.startswith('http')  # outside links (profiles) open in a new tab, and say so to screen readers
        out += (f'<li data-reveal><a class="fp-link" href="{ea(href)}"' + (' target="_blank" rel="noopener me"' if ext else '') + f'><span class="fp-card__ic">{icon(ic)}</span><span class="fp-link__t">{e(t)}</span>'
                f'<span class="fp-link__d">{e(d)}</span>{f"<span class={chr(34)}fp-link__p{chr(34)}>{e(pr)}</span>" if pr else ""}'
                f'<span class="fp-link__go">{icon("arrow")}</span>' + ('<span class="sr-only"> (opens in a new tab)</span>' if ext else '') + '</a></li>')
    return f'<ul class="fp-links" data-reveal-group>{out}</ul>'


def _shot(key, sizes, cls):
    """A product shot (IMG key) on the violet stage used across the site; lazy, below the fold."""
    return f'<figure class="{cls}">{_pic(IMG[key], sizes)}</figure>'


def _tools(b):
    sz = '(max-width: 759px) 92vw, 560px'
    return f'''<ul class="fp-tools fp-tools--media" data-reveal-group>
  <li data-reveal><a class="fp-tool fp-tool--dark on-dark" href="/tools/google-business-profile-checker">{_shot('tool-checker', sz, 'fp-tool__media')}<span class="fp-tool__k">Free · no sign-up · 2 min</span><span class="fp-tool__t">Google Business Profile checker</span><span class="fp-tool__d">A score out of 100 and a fix list for your listing.</span><span class="fp-tool__go">Check my listing {icon("arrow")}</span></a></li>
  <li data-reveal><a class="fp-tool" href="/tools/google-review-qr-code">{_shot('tool-qr', sz, 'fp-tool__media')}<span class="fp-tool__k">Free · no sign-up · printable</span><span class="fp-tool__t">Google review QR code maker</span><span class="fp-tool__d">A printable counter standee that makes leaving a review easy.</span><span class="fp-tool__go">Make my QR code {icon("arrow")}</span></a></li>
</ul>'''


def render(b):
    t = b['t']
    if t == 'p': return ''.join(f'<p class="fp-p">{x}</p>' for x in b['paras'])
    if t == 'cards': return _cards(b)
    if t == 'stat': return f'<div class="fp-stat" data-reveal><b>{e(b["big"])}</b><p>{e(b["label"])}</p>{src_chip(b["src"])}</div>'
    if t == 'note': return f'<p class="fp-note">{e(b["text"])}</p>'
    if t == 'check':
        # questions to ask, not things already done: numbered 01–06 rather than ticked
        return '<ol class="fp-check" data-reveal-group>' + ''.join(f'<li data-reveal><span class="fp-check__ic fp-check__n" aria-hidden="true">{i + 1:02d}</span><span>{e(x)}</span></li>' for i, x in enumerate(b['items'])) + '</ol>'
    if t == 'table': return _table(b)
    if t == 'options': return _options(b)
    if t == 'range': return _range(b)
    if t == 'dur': return _durations(b)
    if t == 'links': return _links(b)
    if t == 'chips': return f'<div class="fp-chips" data-reveal><p class="fp-chips__l">{e(b["label"])}</p><ul>' + ''.join(f'<li>{icon("check")}{e(x)}</li>' for x in b['items']) + '</ul></div>'
    if t == 'svg': return SVGS[b['key']]()
    if t == 'calc': return _calc()
    if t == 'tools': return _tools(b)
    if t == 'html': return b['html']
    if t == 'img':
        img = IMG[b['key']]
        return (f'<figure class="fp-shot" data-reveal><div class="fp-shot__stage">{_pic(img, "(max-width: 1023px) 92vw, 720px")}</div>'
                f'<figcaption>{e(img["caption"])}</figcaption></figure>')
    raise ValueError(t)


def _text(html):
    """HTML → plain text for llms-full.txt."""
    t = re.sub(r'<caption.*?</caption>', '', html, flags=re.S)
    t = re.sub(r'</t[hd]>\s*<t[hd][^>]*>', ' | ', t)
    t = re.sub(r'<(?:li|tr)[^>]*>', '\n- ', t)
    t = re.sub(r'</p>|</table>|</ul>', '\n\n', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'^- +\|\s*', '- Compared: ', t, flags=re.M)
    t = re.sub(r'[ \t]+', ' ', t)
    return re.sub(r'\n{3,}', '\n\n', re.sub(r'\n +', '\n', t)).strip()


def text(b):
    t = b['t']
    if t == 'p': return '\n\n'.join(_text(x) for x in b['paras'])
    if t == 'cards': return '\n'.join(f'- {tt}: {_text(d)}' for _, tt, d in b['items'])
    if t == 'stat': return f'{b["big"]} {b["label"]} (source: {SRC[b["src"]][1]}, {SRC[b["src"]][0]})'
    if t == 'note': return b['text']
    if t == 'check': return '\n'.join(f'{i + 1}. {x}' for i, x in enumerate(b['items']))
    if t == 'table': return '\n'.join([' | '.join(b['head'])] + [' | '.join(r) for r in b['rows']])
    if t == 'options': return '\n'.join(f'- {o["name"]}: ' + '; '.join(f'{k}: {v}' for k, v in o['rows']) for o in b['items']) + (f'\n{b["note"]}' if b['note'] else '')
    if t == 'range': return '\n'.join(f'- {l}: {_fmt(a)}–{_fmt(z)}' for l, a, z in b['rows']) + '\n' + f'{b["note"]}: ' + ', '.join(f'{l} {_fmt(v)}' for v, l in b['marks'])
    if t == 'dur': return '\n'.join(f'- {l}: {tt}' for l, a, z, tt in b['rows'])
    if t == 'links': return '\n'.join(f'- {tt}: {d}' + (f' ({pr})' if pr else '') for _, _, tt, d, pr in b['items'])
    if t == 'chips': return f'{b["label"]}: ' + ', '.join(b['items'])
    if t in ('svg', 'img'): return ''
    if t == 'html': return b['text']
    if t == 'calc': return _calc_text()
    if t == 'tools': return ('- Free Google Business Profile checker: a score out of 100 and a fix list in about 2 minutes.\n'
                             '- Free Google review QR code maker: a printable counter standee that brings in reviews.')
    return ''


# ---------------------------------------------------------------- hero art
# Phones: the product shot spans the hero's full content width (92vw); tablets and desktops: a fixed column.
HERO_SIZES = '(max-width: 559px) 92vw, (max-width: 1023px) 600px, 660px'


def hero_img(key, caption=None):
    """Hero product shot for pages outside PAGES (the parent website-design page)."""
    return _hero_art(dict(art=dict(kind='img', img=key, caption=caption)))


def _hero_art(p):
    a = p['art']; k = a['kind']
    chips = ''.join(f'<span class="fp-chip fp-chip--{i + 1}">{icon(ic)}{e(t)}</span>' for i, (ic, t) in enumerate(a.get('chips', [])))
    if k == 'img':
        img = IMG[a['img']]
        return (f'<figure class="fp-art fp-art--img fp-art--{ea(a["img"])}">{_pic(img, HERO_SIZES, eager=True)}{chips}'
                f'<figcaption>{e(a.get("caption") or img["caption"])}</figcaption></figure>')
    if k == 'portrait':
        img = IMG['mehul']
        return (f'<figure class="fp-art fp-art--portrait"><div class="fp-portrait">{_pic(img, "(max-width: 559px) 260px, (max-width: 1023px) 300px, 400px", eager=True)}'
                f'<figcaption class="fp-portrait__plate"><b>Mehul Karotra</b><span>Founder of U Scale</span></figcaption></div>{chips}</figure>')
    if k == 'card':
        return __import__('depth_art').CARDS[a['card']]()
    if k == 'map':
        return SVGS[a['map']]()
    if k == 'ticket':
        rows = [('Landing page', price('Landing page')), ('Business site, 5–10 pages', price('Business site, 5–10 pages')),
                ('10–20 pages + blog', price('Business site, 10–20 pages + blog')), ('Online store se', price('E-commerce, under 50 products'))]
        li = ''.join(f'<li><span>{e(n)}</span><i></i><b>{e(v)}</b></li>' for n, v in rows)
        return (f'<div class="fp-art fp-ticket" aria-label="U Scale ke fixed prices"><p class="fp-ticket__k">U Scale ke fixed prices · 2026</p>'
                f'<ul>{li}</ul><p class="fp-ticket__f">{icon("shield")}Kaam se pehle likhit mein · 20% / 20% / 60%</p></div>')
    if k == 'audit':
        gaps = ['No website on the listing', 'Website link that no longer opens', 'Someone else’s link in the website field',
                'Followers, but few Google reviews', 'No WhatsApp or call button']
        li = ''.join(f'<li style="--i:{i}">{icon("alert")}<span>{e(g)}</span></li>' for i, g in enumerate(gaps))
        return (f'<div class="fp-art fp-audit"><p class="fp-audit__k">{icon("pin")}Free audit day · Andheri East · Oct 2026</p>'
                f'<p class="fp-audit__n"><b>30+</b><span>Google listings of local shops, cafés and restaurants checked</span></p>'
                f'<p class="fp-audit__h">Gaps that came up again and again</p><ul>{li}</ul>'
                f'<p class="fp-audit__f">{icon("check")}Most fixes take days, not months</p></div>')
    if k == 'ranges':
        rows = [('DIY builder', None, None, 'Monthly plan + your time'), ('Freelancer', 10000, 80000, '₹10k–₹80k'),
                ('Agency', 50000, 300000, '₹50k–₹3L'), ('U Scale', rupees('Landing page'), rupees('E-commerce, under 50 products'), f'{_short(rupees("Landing page"))}–{_short(rupees("E-commerce, under 50 products"))}, fixed')]
        li = ''
        for n, a0, z, t in rows:
            bar = (f'<span class="fp-mini__track"><i style="--a:{a0 / 3000:.2f}%;--b:{z / 3000:.2f}%"></i></span>' if a0 else '<span class="fp-mini__track fp-mini__track--na"></span>')
            li += f'<li class="{"is-us" if n == "U Scale" else ""}"><span class="fp-mini__n">{e(n)}</span>{bar}<b>{e(t)}</b></li>'
        return (f'<div class="fp-art fp-mini" aria-label="Typical website cost in Mumbai by option"><p class="fp-mini__k">Typical website cost, from 2025–26 price guides</p>'
                f'<ul>{li}</ul><p class="fp-mini__s" aria-hidden="true"><span>₹0</span><span>₹1L</span><span>₹2L</span><span>₹3L</span></p></div>')
    return ''


# ---------------------------------------------------------------- page assembly
def _jsonld(site, p):
    url = url_of(site, p)
    parent = SP.svc_url(site, PARENT)
    area = (p['area_ld'] if p.get('area_ld') else [{'@type': 'Place', 'name': f'{n}, Mumbai'} for n in p['places']] if p['kind'] == 'area'
            else aeo.area_served())
    lang = p.get('lang', 'en-IN')
    imgs = image_ld(site, url, p)
    service = {'@type': 'Service', '@id': url + '#service', 'name': p['service'], 'serviceType': p.get('service_type', 'Website design'), 'url': url, 'description': p['answer'],
               'provider': {'@id': site + '#business'}, 'areaServed': area, 'offers': aeo.offers_ld(site, p['offers']),
               'isRelatedTo': (p['related_ld'](site) if p.get('related_ld') else {'@type': 'Service', '@id': parent + '#service', 'name': PARENT['name'], 'url': parent})}
    if p.get('main_ld'):  # a page that is something else (a tool: WebApplication) builds its own main node
        main = p['main_ld'](site, url, imgs)
    elif p['kind'] == 'guide':  # a guide is an article by Mehul about the service, not the service itself
        main = {'@type': 'Article', '@id': url + '#article', 'headline': p['h1'], 'description': p['answer'], 'inLanguage': lang,
                'author': {'@id': site + '#mehul'}, 'publisher': {'@id': site + '#business'}, 'datePublished': '2026-10-23T00:00:00+05:30', 'dateModified': '__LASTMOD__',
                'mainEntityOfPage': {'@id': url + '#webpage'}, 'image': [i['contentUrl'] for i in imgs],
                'about': {'@type': 'Service', '@id': parent + '#service', 'name': PARENT['name'], 'url': parent}}
    else:
        main = service
        if imgs: main['image'] = {'@id': imgs[0]['@id']}
    graph = [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': p['title'], 'description': p['desc'], 'isPartOf': {'@id': site + '#website'},
         'about': {'@id': main['@id']}, 'mainEntity': {'@id': main['@id']}, 'author': {'@id': site + '#mehul'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'inLanguage': lang, 'dateModified': '__LASTMOD__',
         'primaryImageOfPage': {'@id': imgs[0]['@id']}, 'image': [{'@id': i['@id']} for i in imgs],
         **({'citation': [SRC[k][2] for k in p['sources']]} if p['sources'] else {})},
        main,
        aeo.biz_ref(site), aeo.person_ref(site),
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(
                [('Home', site)] + [(n, site + h.lstrip('/')) for n, h in trail_of(p)] + [(p['crumb'], url)])]},
        aeo._faq_ld(url, p['faq']),
        *imgs,
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def _hi(p):
    return p.get('lang') == 'hi-Latn'


def trail_of(p):
    """Breadcrumb steps between Home and the page: Services, then Website design, unless the page sets its own."""
    return p.get('trail') or [('Services', '/services'), (PARENT['short'], f'/services/{BASE}')]


def lead_html(t, at=110):
    """Hero lead. On phones a long lead shows only its first sentence; the rest stays in the HTML (and for screen
    readers and crawlers) and is only visually hidden below 560px, so the product shot reaches the first screen."""
    m = re.match(r'(.+?[.?!])\s+(\S.*)$', t, re.S)
    if len(t) <= at or not m: return e(t)
    return f'{e(m[1])} <span class="fp-lead-more">{e(m[2])}</span>'


def _hero(p, wa, icons):
    hi = _hi(p)
    # long values (price ranges) get a smaller size on phones so they never run into the next stat
    # (the whole row shares one size, so the three numbers stay even)
    long = ' stat__num--long' if any(len(n) >= 8 for n, _ in p['stats']) else ''
    stats = ''.join(f'<li class="stat"><span class="stat__num{long}">{e(n)}</span><span class="stat__label">{e(l)}</span></li>'
                    for n, l in p['stats'])
    see = p['hero_more'][1] if p.get('hero_more') else 'Prices dekhiye' if hi else 'See prices & facts'
    talk = 'WhatsApp pe free audit' if hi else 'Free audit on WhatsApp'
    return f'''  <div class="wrap hero-shell">
    <section class="sp-hero fp-hero on-dark" data-tone="dark" aria-labelledby="page-title">
      <div class="fp-hero__copy">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>{''.join(f'<li><a href="{ea(h)}">{e(n)}</a></li>' for n, h in trail_of(p))}<li aria-current="page">{e(p['crumb'])}</li></ol></nav>
        <p class="eyebrow">{e(p['eyebrow'])}</p><h1 class="sp-hero__title fp-hero__title{' fp-hero__title--acc' if re.search('[À-ÖØ-öø-ÿ]', p['h1']) else ''}" id="page-title">{e(p['h1'])}{'' if p['h1'].endswith('?') else '<span class="dot">.</span>'}</h1>
        <p class="sp-hero__lead">{lead_html(p['lead'])}</p>
        <div class="fp-hero__ctas">
          <div class="hero__cta" data-wa-zone><a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}{talk}</a></div>
          <a class="btn btn--ghost fp-hero__more" href="{p['hero_more'][0] if p.get('hero_more') else '#brief-title'}">{see}</a>
        </div>
        <ul class="stats fp-stats">{stats}</ul>
      </div>
      {_hero_art(p)}
    </section>
  </div>'''


def _who(p):
    hi = _hi(p)
    img = IMG['mehul']
    base = 'Ghatkopar West' if p['kind'] == 'area' else 'Mumbai'  # the office area is named only on area pages
    if hi:
        k, h, d = 'Aap kiske saath kaam karenge', 'Mehul Karotra, khud.', ('Main har website Figma mein design karta hoon aur khud code karta hoon. Mumbai '
                                                                     'mein based hoon; baat WhatsApp pe seedha mujhse hoti hai, kisi account manager se nahi.')
        badges = ['Mumbai', 'Figma design, hand-coded', 'English aur Hindi']
        more = 'Mehul ke baare mein'
    else:
        k, h, d = 'Who you’ll work with', 'Mehul Karotra, personally.', (f'I design every site in Figma and code it myself. I’m based in {base}, '
                                                                        'and you talk to me directly on WhatsApp, not to an account manager.')
        badges = [f'Based in {base}', 'Designs in Figma, hand-codes', 'English and Hindi']
        more = 'More about Mehul'
    li = ''.join(f'<li>{icon("check")}{e(x)}</li>' for x in badges)
    return f'''
  <section class="section fp-sec fp-sec--who" aria-labelledby="who-title">
    <div class="wrap">
      <div class="fp-who" data-reveal>
        <picture class="fp-who__img"><source type="image/avif" srcset="{img['file']}-480.avif"><img src="{img['file']}-480.webp" width="480" height="480" alt="{ea(img['alt'])}" loading="lazy" decoding="async"></picture>
        <div class="fp-who__body">
          <p class="eyebrow">{e(k)}</p>
          <h2 class="fp-who__h" id="who-title">{e(h)}</h2>
          <p>{e(d)}</p>
          <ul class="fp-who__badges">{li}</ul>
          <a class="tlink" href="/about">{e(more)}</a>
        </div>
      </div>
    </div>
  </section>'''


def _how(p):
    hi = _hi(p)
    if hi:
        head, sub = 'Fixed price. Koi surprise nahi.', 'Free audit se launch tak, chaar steps.'
        steps = [('Free audit', 'Aapki website, Google listing aur Instagram dekhta hoon, goals aur pages tay karte hain.', 'Free'),
                 ('Written plan', 'Kaun se pages, kab tak, aur exact price, kuch bhi pay karne se pehle likhit mein.', 'Fixed price'),
                 ('Design aur build', 'Figma mein asli screens, desktop aur mobile. Aap approve karte hain, phir main code karke phone pe test karta hoon.', '20% shuru mein · 20% design approve pe'),
                 ('Launch', 'Domain, hosting, Google Search Console aur real phones pe final check. Phir saare logins aapko de deta hoon.', '60% launch pe')]
        promise = [('key', 'Domain, code aur logins aapke naam'), ('file', 'Price kaam se pehle likhit mein'), ('shield', 'Launch ke baad 15–30 din bug-fix')]
    else:
        head, sub = 'Fixed price. No surprises.', 'From free audit to launch, in four steps.'
        # The same four steps as the home page, each shown with its product shot (audit, quote, design review, launch).
        steps = [('Free audit', 'I check your website, Google listing and Instagram, and we agree the goals, pages and must-haves.', 'Free'),
                 ('Written plan', 'What I will build, by when, and the exact price, in writing before you pay anything.', 'Fixed price'),
                 ('Design & build', 'You approve real screens in Figma, desktop and mobile, before I code them and test on phones.', '20% to start · 20% on design sign-off'),
                 ('Launch', 'Domain, hosting, Google Search Console and a final check on real phones. Then I hand over every login.', '60% on launch')]
        promise = [('key', 'Your domain, code and logins, in your name'), ('file', 'Price fixed in writing before work starts'), ('shield', '15–30 day bug-fix window after launch')]
    shots, sz = ['step-audit', 'step-plan', 'step-design', 'step-launch'], '(max-width: 759px) 82vw, (max-width: 1099px) 46vw, 290px'
    li = ''.join(f'<li class="fp-step" data-reveal>{_shot(shots[i], sz, "fp-step__media")}<div class="fp-step__body"><span class="fp-step__n" aria-hidden="true">{i + 1:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p>'
                 + (f'<span class="fp-step__tag">{e(tag)}</span>' if tag else '') + '</div></li>' for i, (t, d, tag) in enumerate(steps))
    pr = ''.join(f'<li>{icon(ic)}<span>{e(x)}</span></li>' for ic, x in promise)
    return f'''
  <section class="section fp-sec fp-sec--how" aria-labelledby="how-title">
    <div class="wrap">
      <header class="sec-head fp-head"><p class="eyebrow">{'Kaise kaam hota hai' if hi else 'How it works'}</p><h2 class="h2 fp-h2" id="how-title">{e(head)}</h2><p class="lead">{e(sub)}</p></header>
      <ol class="fp-steps fp-steps--media fp-snap" data-reveal-group data-snap aria-label="{'Chaar steps' if hi else 'The four steps'}">{li}</ol>
      <ul class="fp-promise" data-reveal>{pr}</ul>
    </div>
  </section>'''


def _work(ctx, keys):
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
      <header class="sec-head fp-head"><p class="eyebrow">Real work</p><h2 class="h2 fp-h2" id="work-title">A website I designed and built for a Mumbai label.</h2>
        <p class="lead">{e(wmap[keys[0]][4])}</p></header>
      <ul class="rw-grid fp-work__grid" data-reveal-group>{cards}</ul>
    </div>
  </section>'''


def _section(i, s):
    sid = s['sid'] or f's{i}'
    head_cls = 'sec-head fp-head'
    eyebrow = f'<p class="eyebrow">{e(s["eyebrow"])}</p>' if s['eyebrow'] else ''
    lead = f'<p class="lead">{e(s["lead"])}</p>' if s['lead'] else ''
    head = f'<header class="{head_cls}">{eyebrow}<h2 class="h2 fp-h2" id="{sid}-title">{e(s["h"])}</h2>{lead}</header>'
    body = ''.join(render(b) for b in s['blocks'])
    tone = f' fp-sec--{s["tone"]}' if s['tone'] else ''
    if s['layout'] == 'split':
        inner = f'<div class="fp-split">{head}<div class="fp-split__body">{body}</div></div>'
    else:
        inner = head + f'<div class="fp-wide">{body}</div>'
    if s['tone'] == 'dark':
        return f'''
  <section class="section fp-sec fp-sec--dark" id="{sid}" aria-labelledby="{sid}-title">
    <div class="wrap"><div class="panel on-dark fp-panel" data-tone="dark">{inner}</div></div>
  </section>'''
    return f'''
  <section class="section fp-sec{tone}" id="{sid}" aria-labelledby="{sid}-title">
    <div class="wrap">{inner}</div>
  </section>'''


def _sections(p):
    out, halves = [], []
    for i, s in enumerate(p['sections']):
        if s['layout'] == 'half':
            halves.append((i, s)); continue
        if halves:
            out.append(_halves(halves)); halves = []
        out.append(_section(i, s))
    if halves: out.append(_halves(halves))
    return ''.join(out)


def _halves(items):
    cards = ''.join(f'<article class="fp-half" aria-labelledby="s{i}-title" data-reveal><p class="eyebrow">{e(s["eyebrow"])}</p><h2 class="fp-half__h" id="s{i}-title">{e(s["h"])}</h2>'
                    + ''.join(render(b) for b in s['blocks']) + '</article>' for i, s in items)
    return f'''
  <section class="section fp-sec fp-sec--halves" aria-label="When to choose which">
    <div class="wrap"><div class="fp-halves" data-reveal-group>{cards}</div></div>
  </section>'''


def _foot(p):
    hi = _hi(p)
    li = ''.join(f'<li><a href="{ea(SRC[k][2])}" target="_blank" rel="noopener">{e(SRC[k][1])}<span class="sr-only"> (opens in a new tab)</span></a><span>{e(SRC[k][0])}</span></li>'
                 for k in p['sources'])
    src = f'<div class="fp-sources" id="sources"><h2 class="fp-mini-h">Sources</h2><ol>{li}</ol></div>' if li else '<div></div>'
    return f'''
  <section class="section fp-sec fp-sec--foot" aria-label="{'Sources aur prices' if hi else 'Sources and prices'}">
    <div class="wrap fp-foot">
      {src}
      <a class="fp-pricecard" href="/pricing"><span class="fp-pricecard__k">{icon('rupee')}{'Har price published hai' if hi else 'Every price is published'}</span><b>{'Poori price list dekhiye' if hi else 'See the full price list'}</b>{icon('arrow')}</a>
    </div>
  </section>'''


def _related(p):
    kinds = {'business': 'By business', 'area': 'Near you', 'guide': 'Guide'}
    # five cards: up to three of the same kind (other areas from an area page), then the closest of the rest
    same = [q for q in PAGES if q is not p and q['kind'] == p['kind']][:3]
    rest = [q for q in PAGES if q is not p and q not in same and q['kind'] == ('guide' if p['kind'] != 'guide' else 'business')]
    others = same + rest[:5 - len(same)]
    li = ''.join(f'<li><a class="fp-rel" href="{href_of(q)}"><span class="fp-rel__k">{kinds[q["kind"]]}</span><b>{e(q["h1"])}</b>'
                 f'<span class="fp-rel__d">{e(q["card"])}</span>{icon("arrow")}</a></li>' for q in others)
    return f'<nav class="fp-related" aria-label="More website pages"><p class="eyebrow">Keep reading</p><ul class="fp-snap" data-snap>{li}</ul></nav>'


def _cta(p, wa, icons):
    return f'''
  <section class="cta sp-cta" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="panel on-dark" data-tone="dark">
        
        <div class="cta__copy">
          <h2 class="sp-cta__title" id="cta-title">{'Free audit karwaiye' if _hi(p) else 'Get a free audit'}<span class="dot">.</span></h2>
          <p class="lead">{'Apne business ke baare mein bataiye. Main 24 ghante ke andar reply karta hoon, WhatsApp pe aksar usse kaafi pehle.' if _hi(p) else 'Tell me about your business. I reply within 24 hours, usually much faster on WhatsApp.'}</p>
          <div class="cta__btns" data-wa-zone>
            <a class="btn btn--go" href="{ea(wa)}" target="_blank" rel="noopener" data-magnetic>{icons['ICON_CHAT']}Chat on WhatsApp</a>
            <a class="btn btn--ghost" href="mailto:{SP.EMAIL}">Email me</a>
            <a class="btn btn--ghost" href="tel:+{aeo.ENTITY['whatsapp']}">Call {SP.PHONE_D}</a>
          </div>
          <p class="sp-cta__mail">Email: {SP.EMAIL}</p>
        </div>
      </div>
      {p.get('related_html') or _related(p)}
      <p class="fp-all">{p.get('all_links') or f'<a class="tlink" href="/services/{BASE}">All website design</a>'} · <a class="tlink" href="/pricing">Full price list</a></p>
    </div>
  </section>'''


def page(ctx, parts, p):
    site = ctx['SITE_URL']; url = url_of(site, p)
    icons = ctx['ICONS']
    msg = p.get('wa_msg') or ("Hi Mehul, I read your guide on uscale.in. I'd like a free audit and a price for my website." if p['kind'] == 'guide'
           else f"Hi Mehul, I found your page on {p['crumb'].lower()} websites. I'd like a free audit for my business.")
    wa = f'https://wa.me/{aeo.ENTITY["whatsapp"]}?text=' + urllib.parse.quote(msg)
    toc = [((s['sid'] or f's{i}') + '-title', s['h']) for i, s in enumerate(p['sections'])]
    toc += [('how-title', 'Kaise kaam hota hai' if _hi(p) else 'How it works'), ('faq-title', 'Sawaal-jawaab' if _hi(p) else 'Questions')]
    content = (_hero(p, wa, icons) + aeo.brief_html(p['answer'], p['facts'], 'Key facts: ' + p['service'], 'brief-title', toc, 'Is page pe' if _hi(p) else 'On this page',
                                                    fold=3, more='Saare facts' if _hi(p) else 'All facts')
               + _sections(p) + p.get('after_sections', '') + _work(ctx, p['work']) + ('' if p['art']['kind'] == 'portrait' else _who(p)) + _how(p)
               + aeo._faq_section(p['faq'], 'Sawaal-jawaab.' if _hi(p) else 'Questions, answered.') + _foot(p))
    body = (f'<div lang="{p["lang"]}">{content}</div>' if p.get('lang') else content) + _cta(p, wa, icons)
    og = (f'{site}assets/pages/{OG[p["slug"]]}.jpg', OG_ALT[p['slug']])
    imgs = page_images(p)
    preload = None
    if imgs and p['art']['kind'] in ('img', 'portrait'):
        i0 = imgs[0]
        sizes = '(max-width: 559px) 260px, (max-width: 1023px) 300px, 400px' if p['art']['kind'] == 'portrait' else HERO_SIZES
        preload = (f'<link rel="preload" as="image" type="image/avif" imagesrcset="{srcset(i0, "avif")}" '
                   f'imagesizes="{sizes}" fetchpriority="high">')
    return aeo._page(ctx, parts, url, p['title'], p['desc'], _jsonld(site, p), body, og, extra_head=preload, lang=p.get('lang', 'en-IN'))


def build(ctx, parts):
    """Writes every focus page; returns their paths relative to the output folder (for dates, sitemap and IndexNow)."""
    rels = []
    for p in PAGES:
        f = ctx['site'] / (path_of(p) + '.html')
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(page(ctx, parts, p))
        rels.append(path_of(p) + '.html')
    return rels


# ---------------------------------------------------------------- llms.txt / llms-full.txt and the parent page's links
def llms_lines(site):
    biz = [p for p in PAGES if p['kind'] == 'business']; area = [p for p in PAGES if p['kind'] == 'area']
    return (['', '## Websites by type of business', ''] + [f'- [{p["h1"]}]({url_of(site, p)}): {p["desc"]}' for p in biz]
            + ['', '## Areas', ''] + [f'- [{p["h1"]}]({url_of(site, p)}): {p["desc"]}' for p in area]
            + ['', '## Guides', ''] + [f'- [{p["h1"]}]({url_of(site, p)}): {p["desc"]}' for p in PAGES if p['kind'] == 'guide'])


def llms_full(site):
    L = []
    for p in PAGES:
        L += [f'## {p["h1"]}', '', f'URL: {url_of(site, p)}', '', p['answer'], ''] + [f'- {k}: {v}' for k, v in p['facts']] + ['']
        for s in p['sections']:
            body = '\n\n'.join(x for x in (text(b) for b in s['blocks']) if x)
            L += [f'### {s["h"]}', '', body, '']
        L += ['### Questions', ''] + [f'**{q}**\n{a}\n' for q, a in p['faq']]
        L += ['Sources: ' + '; '.join(f'{SRC[k][1]} ({SRC[k][0]}) {SRC[k][2]}' for k in p['sources']), '']
    return L


def related_html():
    """Link cards for the main website-design page: by business, near you, guides."""
    kinds = [('business', 'By business'), ('area', 'Near you'), ('guide', 'Guides')]
    li = ''.join(f'<li><a class="fp-rel" href="{href_of(p)}"><span class="fp-rel__k">{label}</span><b>{e(p["h1"])}</b>'
                 f'<span class="fp-rel__d">{e(p["card"])}</span>{icon("arrow")}</a></li>'
                 for kind, label in kinds for p in PAGES if p['kind'] == kind)
    li += __import__('city_pages').related_cards()
    li += (f'<li><a class="fp-rel" href="/services/website-design-india"><span class="fp-rel__k">Other cities</span><b>Website design &amp; development in India</b>'
           f'<span class="fp-rel__d">The same fixed prices in every city, how remote projects run, and every city page.</span>{icon("arrow")}</a></li>')
    return f'<nav class="fp-related fp-related--parent" aria-label="Website design by business, area, city and guide"><p class="eyebrow">By business, near you, guides and other cities</p><ul>{li}</ul></nav>'
