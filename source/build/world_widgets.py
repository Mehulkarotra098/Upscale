"""Blocks that only one page has (DESIGN-TAILORING.md): calculators the visitor fills in with their own numbers, a tap-to-ask
chat demo, tabs, and do/don't lists for trades with rules. Every widget works without JavaScript: calculators show their
worked example, the chat shows every answer, tabs show every panel. Script: the end of source/src/script.js."""
import json
import pricing_data as PD
from geo_pages import icon, rupees, price, e, ea
from world_pages import sec

BIZ, REST = 'Business site, 5–10 pages', 'Restaurant site + own online ordering'


def _num(k, label, v, step=1, mx=None, unit='', pre=''):
    return (f'<label class="wx__f"><span>{e(label)}</span><span class="wx__in">{f"<b>{e(pre)}</b>" if pre else ""}'
            f'<input type="number" inputmode="decimal" min="0"{f" max={chr(34)}{mx}{chr(34)}" if mx else ""} step="{step}" value="{v}" data-k="{k}">'
            f'{f"<b>{e(unit)}</b>" if unit else ""}</span></label>')


def calc(kind, title, fields, outs, note, sym, fixed, example):
    """kind: the formula in script.js; fields: (key, label, value, step, max, unit, prefix); outs: (key, label, big?)
    fixed: numbers the formula needs that the visitor doesn't set (our price). example: the worked example as text."""
    f = ''.join(_num(*x) for x in fields)
    o = ''.join(f'<p class="wx__o{" wx__o--big" if big else ""}"><span>{e(lbl)}</span><b data-o="{k}">–</b></p>' for k, lbl, big in outs)
    html = (f'<div class="wx" data-wxcalc="{kind}" data-sym="{ea(sym)}" data-fixed="{ea(json.dumps(fixed))}" data-reveal>'
            f'<div class="wx__in-col"><p class="wx__k">{icon("pen")}{e(title)}</p>{f}<p class="wx__note">{e(note)}</p></div>'
            f'<div class="wx__out-col">{o}<p class="wx__ex">{e(example)}</p></div></div>')
    return html, f'{title}. {example} {note}'


def ask(name, sub, qa, kind='wa'):
    """A chat the visitor drives: tap a question, the answer types itself in. Without JS every answer is already there."""
    btns = ''.join(f'<button type="button" class="ak__q" data-ask="{i}">{e(q)}</button>' for i, (q, _) in enumerate(qa))
    ans = ''.join(f'<li class="ak__pair" data-a="{i}"><p class="ak__m ak__m--you">{e(q)}</p><p class="ak__m ak__m--bot">{e(a)}</p></li>' for i, (q, a) in enumerate(qa))
    html = (f'<div class="ak ak--{kind}" data-askdemo data-reveal><div class="ak__phone"><p class="ak__head"><span class="ak__av">{icon("bot")}</span>'
            f'<span><b>{e(name)}</b><small>{e(sub)}</small></span></p><ol class="ak__log">{ans}</ol><p class="ak__typing" aria-hidden="true"><i></i><i></i><i></i></p></div>'
            f'<div class="ak__side"><p class="ak__k">Tap a question</p><div class="ak__qs">{btns}</div><p class="ak__note">A sample. Yours answers from your own price list and pages.</p></div></div>')
    return html, ' '.join(f'Q: {q} A: {a}' for q, a in qa)


def tabs(sid, items, label):
    """Tabs from radio buttons (no JS): (tab, title, text, chips)."""
    radios = ''.join(f'<input class="tx__r" type="radio" name="{sid}" id="{sid}-{i}"{" checked" if i == 0 else ""}>' for i in range(len(items)))
    labels = ''.join(f'<label for="{sid}-{i}">{e(t)}</label>' for i, (t, *_ ) in enumerate(items))
    panels = ''.join(f'<div class="tx__p tx__p--{i}"><h3>{e(h)}</h3><p>{e(x)}</p>' + (''.join(f'<span class="tx__c">{icon("check")}{e(c)}</span>' for c in chips) if chips else '') + '</div>'
                     for i, (_, h, x, chips) in enumerate(items))
    css = ''.join(f'#{sid}-{i}:checked~.tx__tabs label[for={sid}-{i}]{{background:var(--violet);color:#fff}}#{sid}-{i}:checked~.tx__ps .tx__p--{i}{{display:grid}}'
                  f'#{sid}-{i}:focus-visible~.tx__tabs label[for={sid}-{i}]{{outline:3px solid var(--green);outline-offset:2px}}' for i in range(len(items)))
    html = f'<div class="tx" data-reveal>{radios}<div class="tx__tabs" role="group" aria-label="{ea(label)}">{labels}</div><div class="tx__ps">{panels}</div><style>{css}</style></div>'
    return html, ' '.join(f'{t}: {h}. {x}' for t, h, x, _ in items)


def dodont(do, dont, do_h='Fine on your website', dont_h='Leave it out'):
    li = lambda xs, ic: ''.join(f'<li style="--i:{i}"><span class="dd__ic">{icon(ic)}</span><span>{e(x)}</span></li>' for i, x in enumerate(xs))
    html = (f'<div class="dd" data-reveal><div class="dd__c dd__c--do"><p class="dd__k">{e(do_h)}</p><ul>{li(do, "check")}</ul></div>'
            f'<div class="dd__c dd__c--no"><p class="dd__k">{e(dont_h)}</p><ul>{li(dont, "alert")}</ul></div></div>')
    return html, f'{do_h}: ' + '; '.join(do) + f'. {dont_h}: ' + '; '.join(dont) + '.'


def _site(cur):
    return PD.fx_amount(rupees(BIZ), cur)


def compare():
    """Figma to code: the design and the built page on top of each other; drag to compare. Without JS the split stays at the middle."""
    page = lambda cls, tag: (f'<div class="cm__l cm__l--{cls}"><span class="cm__tag">{e(tag)}</span><p class="cm__nav"><b>Ridgeline</b><i></i><i></i><i></i></p>'
                             '<p class="cm__h">Small-batch coffee, roasted Mondays</p><p class="cm__s">Single origins from Coorg and Chikmagalur, posted the same week.</p>'
                             '<span class="cm__btn">Shop beans</span><span class="cm__img"></span></div>')
    guides = ('<span class="cm__g cm__g--1">48</span><span class="cm__g cm__g--2">24</span><span class="cm__g cm__g--3">Anton 56/58</span>')
    html = (f'<div class="cm" data-compare data-reveal style="--x:50%"><div class="cm__stage">{page("built", "Live site")}'
            f'<div class="cm__top">{page("design", "Your Figma file")}{guides}</div><span class="cm__bar" aria-hidden="true"><i>{icon("code")}</i></span></div>'
            '<label class="cm__range"><span class="sr-only">Compare the design with the built page</span><input type="range" min="0" max="100" value="50" data-compare-range></label>'
            '<p class="cm__k">Drag to compare. Spacing, type and colour come straight from your file.</p></div>')
    return html, 'A sample design and the hand-coded page built from it, side by side: spacing, type and colour taken from the Figma file.'


def draft_edit():
    """AI marketing: what the AI wrote, and what a person sends."""
    html = ('<div class="ed" data-reveal><div class="ed__c ed__c--ai"><p class="ed__k">AI first draft</p>'
            '<p class="ed__t"><s>Elevate your mornings</s> with our <s>amazing, handcrafted</s> coffee! <s>Experience the magic</s> of every cup. ☕✨ <s>#CoffeeLovers #Blessed</s></p>'
            '<p class="ed__n">Generic, too many adjectives, no reason to come in today.</p></div>'
            f'<span class="ed__arrow" aria-hidden="true">{icon("pen")}</span>'
            '<div class="ed__c ed__c--us"><p class="ed__k">After a person edits it</p>'
            '<p class="ed__t">Monday’s roast is out: Ethiopia Guji, fruity and light. 250 g for ₹650, ground the way you like. Pick it up before 11.</p>'
            '<p class="ed__n">Specific, in your voice, with a price and a reason to come in.</p></div></div>')
    return html, ('AI first draft: generic and full of adjectives. After a person edits it: "Monday’s roast is out: Ethiopia Guji, fruity and light. 250 g for ₹650, '
                  'ground the way you like. Pick it up before 11."')


def checkout():
    """Indian fashion labels: the buyer sees shipping and duties before paying. A sample, with sample amounts."""
    rows = [('Chanderi kurta set', '£79.00'), ('Shipping to London, 5–7 days', '£12.00'), ('Duties and taxes', '£18.20')]
    li = ''.join(f'<li style="--i:{i}"><span>{e(a)}</span><b>{e(b)}</b></li>' for i, (a, b) in enumerate(rows))
    html = (f'<div class="co" data-reveal><div class="co__card"><p class="co__head">{icon("cart")}<b>Checkout</b><small>sample · prices in £</small></p><ul>{li}</ul>'
            f'<p class="co__tot"><span>Total, nothing more at the door</span><b>£109.20</b></p><span class="co__btn">Pay £109.20</span></div>'
            '<div class="co__copy"><h3>No surprise bill at the door.</h3><p>A parcel held at customs for unpaid duty is the fastest way to lose a customer abroad. '
            'Your store shows shipping and duties before checkout, by country, so the buyer pays once.</p></div></div>')
    return html, 'A sample checkout: kurta set £79, shipping to London £12, duties and taxes £18.20, total £109.20, shown before paying.'


# ---------------------------------------------------------------- country sections that would repeat the new hero, replaced
def wcag():
    """Ireland: four accessibility checks that light up, with a real contrast pair."""
    rows = [('Contrast', 'Text at least 4.5:1 against its background', '<span class="wg__sw"><i style="background:#251E45;color:#fff">Aa 15.6:1</i><i style="background:#C9BCE8;color:#fff">Aa 1.8:1</i></span>'),
            ('Keyboard', 'Every link and button reachable with Tab, with a visible focus ring', '<span class="wg__kb"><i>Tab</i><i>↵</i></span>'),
            ('Images', 'Alt text that says what the picture shows', '<span class="wg__alt">alt="Double room with a harbour view"</span>'),
            ('Forms', 'Every field labelled, every error explained', '<span class="wg__frm"><b>Email</b><i></i></span>')]
    li = ''.join(f'<li style="--i:{i}"><span class="wg__ok">{icon("check")}</span><span class="wg__t"><b>{e(a)}</b><small>{e(b)}</small></span>{x}</li>' for i, (a, b, x) in enumerate(rows))
    return (f'<ul class="wg" data-reveal>{li}</ul>', 'The checks we run on every page to WCAG 2.1 AA: ' + '; '.join(f'{a}: {b}' for a, b, _ in rows) + '.')


def week():
    """New Zealand: a project week, in Auckland time. Feedback in your afternoon, changes overnight."""
    days = [('Mon', 'You send the brief', '4:30 pm', 'Plan and price back', '9:00 pm'), ('Tue', 'You approve the plan', '12:00 pm', 'Design started', '6:00 pm'),
            ('Wed', 'You see the first design', '8:00 am', 'Your notes, all done', '11:00 pm'), ('Thu', 'You approve it', '9:00 am', 'Build begins', '5:00 pm'),
            ('Fri', 'You check the preview', '8:30 am', 'Fixes from your list', '10:00 pm')]
    li = ''.join(f'<li style="--i:{i}"><b class="wkp__d">{d}</b><span class="wkp__you"><small>{e(t1)}</small>{e(a)}</span><span class="wkp__us"><small>{e(t2)}</small>{e(b)}</span></li>'
                 for i, (d, a, t1, b, t2) in enumerate(days))
    return (f'<div class="wkp" data-reveal><p class="wkp__lg"><span class="wkp__lg-you">You, Auckland</span><span class="wkp__lg-us">Us, Mumbai (in your time)</span></p><ol>{li}</ol></div>',
            'A sample project week in Auckland time: ' + '; '.join(f'{d}: {a} ({t1}), {b} ({t2})' for d, a, t1, b, t2 in days) + '.')


def urls():
    """Canada: English and French, each on its own address, linked so Google shows the right one."""
    html = ('<div class="ul2" data-reveal><div class="ul2__tree"><p class="ul2__dom">yourbusiness.ca</p><ul>'
            '<li style="--i:0"><b>/en/</b><span>Home</span></li><li style="--i:1"><b>/en/services</b><span>Services</span></li>'
            '<li class="is-fr" style="--i:2"><b>/fr/</b><span lang="fr">Accueil</span></li><li class="is-fr" style="--i:3"><b>/fr/services</b><span lang="fr">Services</span></li></ul></div>'
            '<pre class="ul2__code" aria-label="The tags that link each page to its other language"><span>&lt;link rel="alternate" hreflang="en-CA" href="/en/services"&gt;</span>'
            '<span>&lt;link rel="alternate" hreflang="fr-CA" href="/fr/services"&gt;</span></pre>'
            '<p class="ul2__t">Each language gets its own address, so Google can show the French page to French searchers and the English one to everyone else.</p></div>')
    return html, 'English and French pages each get their own address (/en/ and /fr/), linked with hreflang tags so Google shows the right language.'


def template_vs():
    """UAE: what AED 999 buys, and what a custom site does differently. Honest: the template shops are cheaper."""
    html = ('<div class="tv" data-reveal><div class="tv__c"><p class="tv__k">Template shop</p><b class="tv__p">from AED 999</b><ul>'
            '<li>A theme many other businesses also use</li><li>Your text dropped into fixed boxes</li><li>Plugins to update, often slower on phones</li></ul></div>'
            f'<div class="tv__c tv__c--us"><p class="tv__k">U Scale</p><b class="tv__p">{e(PD.fx_label(rupees(BIZ), "AED"))}, fixed</b><ul>'
            '<li>Designed for your business in Figma, approved by you</li><li>Hand-coded: light pages, nothing to update</li><li>WhatsApp on every page; Arabic layout from your translator’s text</li></ul></div></div>')
    return html, (f'A template shop starts around AED 999; a custom, hand-coded 5–10 page site from U Scale is {PD.fx_label(rupees(BIZ), "AED")}, fixed.')


def consent_nl():
    """Netherlands: prior consent, shown the way the site asks."""
    html = ('<div class="ck2" data-reveal><div class="ck2__box"><p class="ck2__k">Cookies</p><p>We use one analytics cookie to see which pages help. It stays off unless you say yes.</p>'
            '<p class="ck2__row"><span>Functional (needed for the site to work)</span><b>Always on</b></p><p class="ck2__row"><span>Analytics</span><b class="ck2__off">Off until you say yes</b></p>'
            '<p class="ck2__btns"><span>No thanks</span><span class="ck2__go">Yes, that’s fine</span></p></div>'
            '<div class="ck2__copy"><h3>Prior consent, done properly.</h3><p>Dutch rules ask for consent before any cookie except the functional ones. Your site asks first, '
            'with “no” as easy as “yes”, in Dutch, English or both.</p></div></div>')
    return html, 'Dutch rules ask for prior consent for every cookie except functional ones; the site asks first, with no as easy as yes.'


SIG_SWAP = {'website-design-ireland': ('eaa', 'wcag', 'Accessibility', 'Four checks on every page.', wcag),
            'website-design-new-zealand': ('relay', 'week', 'A project week', 'Your afternoon. Our evening. Done by morning.', week),
            'website-design-canada': ('french', 'urls', 'English and French', 'Bilingual, the way Google reads it.', urls),
            'website-design-uae': ('day', 'template', 'Not a template', 'Cheaper exists. Here’s the difference.', template_vs),
            'website-design-netherlands': ('english', 'consent', 'Cookies', 'Prior consent, the Dutch way.', consent_nl)}


def swap_sigs(p):
    key = p['path'].replace('services/', '', 1)
    if key not in SIG_SWAP: return
    old, sid, eyebrow, h, fn = SIG_SWAP[key]
    p['blocks'] = [sec(sid, eyebrow, h, '', fn(), tone='band') if isinstance(b, dict) and b.get('sid') == old else b for b in p['blocks']]


# ---------------------------------------------------------------- the blocks, by page slug: (insert before this section id, block)
def extra():
    rest_gbp = PD.fx_amount(rupees(REST), 'GBP')
    return {
     'figma-to-code': [('get', sec('compare', 'Design against build', 'Pixel for pixel.', '', compare(), tone='band'))],
     'ai-marketing': [('prices', sec('edit', 'AI drafts, people decide', 'The difference a person makes.', '', draft_edit()))],
     'website-design-for-indian-fashion-brands': [('trust', sec('checkout', 'Selling abroad', 'Duties shown before they pay.', '', checkout(), tone='band'))],
     'n8n-automation': [('start', sec('jobs', 'Pick a job', 'Four automations small businesses ask for first.', '', tabs('auto', [
        ('New enquiry', 'A new enquiry, handled in seconds', 'The form or Instagram message lands in your sheet, you get a WhatsApp alert, and the customer gets your price list by email.',
         ['Website form', 'Google Sheet', 'WhatsApp alert', 'Reply email']),
        ('Order paid', 'An order, from payment to packing', 'The payment confirms the order, the customer gets a receipt, and your packing list updates itself.',
         ['Payment received', 'Receipt email', 'Packing list', 'Stock count']),
        ('Job done', 'A finished job, turned into a review', 'Mark the job done and the customer gets a thank-you with your Google review link two hours later.',
         ['Job marked done', 'Wait 2 hours', 'WhatsApp thank-you', 'Review link']),
        ('Invoice late', 'A late invoice, chased politely', 'Unpaid after the due date? A polite reminder goes out, and a second one a week later, with you copied in.',
         ['Due date passes', 'Reminder 1', 'Wait 7 days', 'Reminder 2'])], 'Automations')))],
     'website-design-for-indian-restaurants': [('trust', sec('keep', 'Your numbers', 'What the delivery apps cost you.', 'Put in your own numbers. Nothing is sent anywhere.',
        calc('commission', 'Your takeaway, by the month', [('n', 'Orders through apps, a month', 400), ('a', 'Average order', 28, 0.5, None, '', '£'),
              ('c', 'The app’s commission (your rate)', 25, 1, 100, '%'), ('s', 'Share you could move to your own site', 30, 5, 100, '%')],
             [('kept', 'You’d keep, a month', True), ('year', 'In a year', False), ('pay', 'Your own site pays for itself in', False)],
             f'Your own ordering costs card fees only, no commission. A restaurant site with ordering is £{rest_gbp:,}, fixed.', '£', {'site': rest_gbp},
             f'Example: 400 orders at £28, a 25% commission and 30% moved to your own site keep £840 a month. The £{rest_gbp:,} site pays for itself in under a month.')))],
     'website-design-for-independent-hotels': [('trust', sec('direct', 'Your numbers', 'What booking sites cost you.', 'Put in your own numbers. Nothing is sent anywhere.',
        calc('commission', 'Your hotel, by the month', [('n', 'Bookings through booking sites, a month', 120), ('a', 'Average booking value', 260, 5, None, '', '$'),
              ('c', 'Their commission (your rate)', 15, 1, 100, '%'), ('s', 'Share you could move to direct', 20, 5, 100, '%')],
             [('kept', 'You’d keep, a month', True), ('year', 'In a year', False), ('pay', 'A $600 site pays for itself in', False)],
             'Direct bookings still pay your booking engine’s own fee; this compares commission only.', '$', {'site': _site('USD')},
             'Example: 120 bookings at $260, a 15% commission and 20% moved to direct keep $936 a month.')))],
     'ai-receptionist': [('costs', sec('missed', 'Your numbers', 'What missed calls cost you.', 'Put in your own numbers. Nothing is sent anywhere.',
        calc('missed', 'Your phone, by the month', [('n', 'Calls a week', 60), ('m', 'Share you miss', 20, 5, 100, '%'),
              ('b', 'Missed callers who would have booked', 30, 5, 100, '%'), ('v', 'What a new customer is worth', 2000, 100, None, '', '₹')],
             [('lost', 'Lost each month', True), ('people', 'People who went elsewhere', False)],
             'An AI receptionist answers every one of those calls, books them and sends you a summary.', '₹', {},
             'Example: 60 calls a week, 20% missed, 30% of them would have booked at ₹2,000 each: about ₹31,000 a month lost.')))],
     'white-label-web-design': [('process', sec('margin', 'Your numbers', 'Your margin, per site.', 'Our price is fixed. Yours is up to you.',
        calc('margin', 'Your agency, by the month', [('p', 'What you charge your client', 1800, 50, None, '', '$'), ('n', 'Sites a month', 2)],
             [('per', 'Your margin per site', True), ('month', 'A month', False), ('year', 'A year', False)],
             f'Our price for a 5–10 page site is ${_site("USD"):,}, fixed, before we start.', '$', {'ours': _site('USD')},
             f'Example: charge $1,800, pay us ${_site("USD"):,}, keep ${1800 - _site("USD"):,} a site; two a month is ${2 * (1800 - _site("USD")):,}.')))],
     'whatsapp-chatbot': [('start', sec('try', 'Try it', 'Ask the sample bot.', '', ask('Glow Salon', 'sample bot · replies in seconds', [
        ('Are you open on Sunday?', 'Yes, 10 am to 6 pm. Want me to book you a slot?'),
        ('How much is a haircut?', 'Haircut and blow-dry is ₹800. Hair spa from ₹1,200. Shall I book one?'),
        ('Where are you?', 'Shop 4, Sai Plaza, near Ghatkopar station. Sending you the map pin now.'),
        ('I want to talk to someone', 'Of course. Priya from the salon will reply here in a few minutes.')])))],
     'ai-chatbot-for-website': [('start', sec('try', 'Try it', 'Ask the sample chatbot.', 'It answers only from a sample grocery shop’s own pages.', ask('Green Basket', 'answers from this site’s pages', [
        ('Do you deliver to Thane?', 'Yes, Monday to Saturday. Delivery is ₹60 on orders under ₹500. (From: Delivery page)'),
        ('Can I return vegetables?', 'Yes, within 24 hours if anything is spoilt. Send a photo on WhatsApp. (From: Returns page)'),
        ('Do you sell imported cheese?', 'I can’t find that on our pages. Want me to ask the shop on WhatsApp?')], kind='site')))],
     'website-design-india/exporters': [('trust', sec('incoterms', 'For buyers abroad', 'Say who pays for what.', 'Your RFQ form asks which one the buyer wants. Here’s what each means.',
        tabs('inco', [('EXW', 'Ex Works', 'The buyer collects from your factory and pays for everything after that.', ['Least work for you', 'Common for experienced buyers']),
                      ('FOB', 'Free On Board', 'You deliver the goods onto the ship at the Indian port; the buyer pays the sea freight and insurance.', ['The usual choice for exporters', 'Name the port: FOB Nhava Sheva']),
                      ('CIF', 'Cost, Insurance and Freight', 'You pay the freight and insurance to the buyer’s port; the risk passes to them at loading.', ['Buyer sees one landed-port price']),
                      ('DDP', 'Delivered Duty Paid', 'You deliver to the buyer’s door and pay the duties in their country.', ['Most work for you', 'Easiest for small buyers'])],
             'Incoterms')))],
     'website-design-india/clinics': [('prices', sec('ethics', 'Within the rules', 'What a clinic website can say.', '',
        dodont(['Your name, qualifications and registration number', 'Services and consultation fees', 'Timings, location and how to book', 'Health articles that inform'],
               ['“Guaranteed cure” or promised results', 'Before-and-after photos as advertising', 'Paid or invented patient testimonials', 'Claims that you’re the best or cheapest'])))],
     'website-design-india/real-estate': [('prices', sec('rera', 'Within the rules', 'RERA details, the right way.', '',
        dodont(['The RERA registration number on every project page', 'The RERA website address beside it', 'Carpet area, as RERA defines it', 'Possession dates as registered'],
               ['Ads for a project before it’s registered', 'Super built-up area passed off as carpet area', '“Guaranteed returns” or rental promises', 'Renders shown as finished photos'], 'Put this on', 'Leave this out')))],
     'website-design-india/coaching-institutes': [('prices', sec('honest', 'Within the rules', 'Results, stated honestly.', '',
        dodont(['Real results, with the student’s consent', 'The course and year they actually took', 'Tutors’ real qualifications', 'Fees and the refund policy, in full'],
               ['“100% selection” or guaranteed ranks', 'Toppers who only took a test series', 'Photos used without consent', 'Hidden fees or no refund policy'])))],
     'website-design-india/ca-and-law-firms': [('prices', sec('rules', 'Within the rules', 'Facts, not ads.', '',
        dodont(['Names, qualifications, membership or enrolment numbers', 'Practice areas and services', 'Office address, hours and contact', 'Articles on tax and law changes'],
               ['“Best CA in Mumbai” or rankings', 'Client testimonials and case wins', 'Fee discounts and offers', 'Anything about a client without written permission'])))],
    }
