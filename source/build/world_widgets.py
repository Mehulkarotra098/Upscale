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


# ---------------------------------------------------------------- the blocks, by page slug: (insert before this section id, block)
def extra():
    rest_gbp = PD.fx_amount(rupees(REST), 'GBP')
    return {
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
