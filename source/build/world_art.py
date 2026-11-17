"""Hero graphics for the pages for clients abroad: one idea per page (plan: D:\\U-Scale-SEO-Program\\DESIGN-TAILORING.md).
Mehul, 16 Nov 2026: "the design is the same for all the places ... each page different, graphics, animation tailored".
Each card is built on the depth hero of the city pages (depth_art._dk); motion lives in world-art.css, live times in script.js.
Without JavaScript, or with motion off, every card shows its finished state."""
import depth_art as DA
import pricing_data as PD
from geo_pages import icon, rupees, e, ea

BIZ = 'Business site, 5–10 pages'


def _p(cur):
    return PD.fx_label(rupees(BIZ), cur)


def _dk(kind, card, chips=(), label=''):
    floats = ''.join(DA._float(f'dk-chip wa__chip{" wa__chip--b" if i else ""}', f'{icon(ic)}{t}', 120 - i * 30, i) for i, (ic, t) in enumerate(chips))
    return DA._dk(kind, card, floats, sheets=2, label=label)


def uk_letter(p):
    """UK: a written quote on letter paper, signed, with a FIXED wax seal."""
    rows = [('5–10 page website, designed in Figma', ''), ('Hand-coded and tested on phones', ''), ('Domain and code in your name', ''), ('VAT', 'none added')]
    li = ''.join(f'<li style="--i:{i}"><span>{e(a)}</span><b>{e(b)}</b></li>' for i, (a, b) in enumerate(rows))
    card = (f'<div class="dk__card ql"><p class="ql__head"><b>Quote</b><small>U Scale · Mumbai · for a UK business</small></p><ul class="ql__rows">{li}</ul>'
            f'<p class="ql__total"><span>Total, fixed</span><b>{e(_p("GBP"))}</b></p><p class="ql__sig"><i>Mehul Karotra</i><small>Signed before you pay a penny</small></p>'
            '<span class="ql__seal" aria-hidden="true"><b>FIXED</b></span></div>')
    return _dk('ql', card, [('clock', 'Quick changes, same day'), ('shield', 'UK GDPR cookies done')],
               f'A written, signed quote for a UK business: a 5–10 page website for {_p("GBP")}, fixed, no VAT added')


def us_arc(p):
    """USA: day and night. The sun sets over New York while it rises over Mumbai; the preview link updates overnight."""
    stars = ''.join(f'<i style="--x:{x}%;--y:{y}%;--i:{i}"></i>' for i, (x, y) in enumerate([(12, 18), (28, 34), (44, 12), (62, 26), (80, 14), (88, 38), (20, 52), (70, 46)]))
    sky = ''.join(f'<i style="--h:{h}%;--w:{w}%"></i>' for h, w in [(38, 9), (62, 7), (48, 10), (80, 6), (55, 8), (70, 9), (42, 8), (58, 10)])
    card = (f'<div class="dk__card dn"><div class="dn__half dn__half--night"><span class="dn__stars">{stars}</span><span class="dn__moon"></span>'
            f'<span class="dn__sky">{sky}</span><p><small>New York</small><b>11:40 pm</b><em>You’re asleep</em></p></div>'
            '<div class="dn__half dn__half--day"><span class="dn__sun"></span><p><small>Mumbai</small><b>10:10 am</b><em>We’re building</em></p></div>'
            f'<p class="dn__bar">{icon("check")}<span>Preview link updated overnight</span><i></i></p></div>')
    return _dk('dn', card, [('bolt', 'You sleep. We build.')], 'Night in New York while it is day in Mumbai: the work happens while you sleep')


def au_job(p):
    """Australia: a tradie's job sheet, ticked off."""
    ticks = ['Brief on WhatsApp', 'Design approved in Figma', 'Built and tested on phones', 'Handed over: domain, code, logins']
    li = ''.join(f'<li style="--i:{i}"><span class="jsh__box">{icon("check")}</span>{e(t)}</li>' for i, t in enumerate(ticks))
    card = (f'<div class="dk__card jsh"><p class="jsh__head"><b>Job sheet</b><small>No. 2051</small></p>'
            f'<dl class="jsh__dl"><div><dt>Job</dt><dd>5–10 page website</dd></div><div><dt>Quote</dt><dd>{e(_p("AUD"))} fixed</dd></div><div><dt>GST</dt><dd>None added</dd></div></dl>'
            f'<ul class="jsh__list">{li}</ul><span class="jsh__stamp" aria-hidden="true">Sorted</span></div>')
    return _dk('jsh', card, [('chat', 'Feedback after lunch, done that night')], f'A job sheet for an Australian business: a 5–10 page website for {_p("AUD")} fixed, ticked off step by step')


def ca_flip(p):
    """Canada: the same card in English and French, flipping, with Quebec's cookies off by default."""
    card = ('<div class="dk__card bf"><p class="bf__sw" aria-hidden="true"><span class="bf__en">EN</span><span class="bf__fr">FR</span></p>'
            '<div class="bf__flip"><div class="bf__face bf__face--en"><small>yourbusiness.ca/en</small><b>Book a free consultation</b><span>Call or message us today</span><i>Book now</i></div>'
            '<div class="bf__face bf__face--fr" lang="fr"><small>yourbusiness.ca/fr</small><b>Réservez une consultation gratuite</b><span>Appelez-nous ou écrivez-nous aujourd’hui</span><i>Réserver</i></div></div>'
            '<p class="bf__ck"><span>Analytics cookies</span><span class="bf__tog" aria-hidden="true"><i></i></span><b>Off until they say yes</b></p></div>')
    return _dk('bf', card, [('globe', 'English and French pages')], 'A Canadian website card that flips between English and French, with analytics cookies off until the visitor agrees')


def sg_dash(p):
    """Singapore: a small dashboard: shared hours all year, PDPA consent, the price, the time in Singapore now."""
    card = (f'<div class="dk__card sd2"><div class="sd2__t sd2__t--big"><small>Shared every working day</small><b>5.5 h</b><span class="sd2__bar"><i></i></span><em>No clock changes, all year</em></div>'
            f'<div class="sd2__t"><small>Singapore now</small><b data-clock data-tz="Asia/Singapore">14:30</b></div>'
            f'<div class="sd2__t"><small>5–10 page site</small><b>{e(_p("SGD"))}</b></div>'
            f'<div class="sd2__t sd2__t--ok"><small>PDPA</small><b>{icon("check")}Consent first</b></div></div>')
    return _dk('sd2', card, [('clock', 'Your afternoon, our working day')], f'A dashboard for a Singapore business: 5.5 shared hours all year, PDPA consent, {_p("SGD")} fixed')


def ae_phone(p):
    """UAE: WhatsApp first, and a layout that flips right to left for Arabic (skeleton lines: we don't write Arabic copy)."""
    card = (f'<div class="dk__card rt"><p class="rt__top"><span class="rt__av">{icon("store")}</span><span><b>Your business</b><small>online now</small></span>'
            '<span class="rt__sw" aria-hidden="true"><i class="rt__l">EN</i><i class="rt__r">ع</i></span></p>'
            '<div class="rt__page"><span class="rt__h"></span><span class="rt__l1"></span><span class="rt__l2"></span><span class="rt__btn"></span></div>'
            f'<p class="rt__msg">Can you show our prices in dirhams?</p><p class="rt__msg rt__msg--us">Done. {e(_p("AED"))} for 5–10 pages, fixed.</p></div>')
    return _dk('rt', card, [('chat', 'WhatsApp on every page'), ('clock', '8.5 hours of your day, together')],
               'A UAE website on a phone: a chat in English and a layout that flips right to left for Arabic')


def ie_flow(p):
    """Ireland: the accessibility act, as two questions and an answer."""
    card = (f'<div class="dk__card fl2"><p class="fl2__head">{icon("users")}<b>Does the European Accessibility Act cover you?</b></p>'
            '<ol><li style="--i:0"><span>Selling online or taking bookings?</span><i class="is-go">Yes</i></li>'
            '<li style="--i:1"><span>10+ staff, or over €2M turnover?</span><i class="is-go">Yes</i></li></ol>'
            f'<p class="fl2__out" style="--i:2">{icon("check")}<span>Then yes, since 28 June 2025. We build to WCAG 2.1 AA either way.</span></p></div>')
    return _dk('fl2', card, [('shield', 'GDPR cookies done too')], 'Does the European Accessibility Act cover your Irish business: two questions and the answer')


def nz_relay(p):
    """New Zealand: the evening message and the morning reply."""
    msgs = [('out', '5:10 pm', 'Can the booking button be bigger on phones?'), ('in', '10:30 pm', 'Done. Preview link updated.'), ('out', '7:40 am', 'Brilliant. Approved.')]
    li = ''.join(f'<li class="nr__m nr__m--{s}" style="--i:{i}"><span>{e(t)}</span><small>{e(tm)}</small></li>' for i, (s, tm, t) in enumerate(msgs))
    card = (f'<div class="dk__card nr"><p class="nr__head"><b>Your project chat</b><small>Times in Auckland</small></p><ol>{li}</ol>'
            '<p class="nr__ruler" aria-hidden="true"><span>Auckland</span><i></i><span>Mumbai</span><b>7.5 h behind</b></p></div>')
    return _dk('nr', card, [('clock', 'Done the same evening')], 'A project chat: feedback sent in the Auckland evening, changes done by the morning')


def nl_donut(p):
    """Netherlands: 86% speak English; the site switches between Dutch and English."""
    r, circ = 52, 2 * 3.14159 * 52
    card = (f'<div class="dk__card nd"><div class="nd__d"><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="{r}" class="nd__bg"/>'
            f'<circle cx="70" cy="70" r="{r}" class="nd__v" style="--c:{circ:.1f};--v:{.86 * circ:.1f}"/></svg><b>86%</b></div>'
            '<p class="nd__t">of people in the Netherlands speak English. We work with you in English.</p>'
            '<p class="nd__sw" aria-hidden="true"><span class="nd__nl">NL</span><span class="nd__en">EN</span></p>'
            '<p class="nd__line"><span class="nd__w nd__w--nl" lang="nl">Vandaag gerepareerd</span><span class="nd__w nd__w--en">Fixed today</span></p></div>')
    return _dk('nd', card, [('globe', 'Your site in Dutch, English or both')], '86% of people in the Netherlands speak English; a site that switches between Dutch and English')


CLOCK_CITIES = [('London', 'Europe/London', 'GBP', 0), ('New York', 'America/New_York', 'USD', -5), ('Sydney', 'Australia/Sydney', 'AUD', 10),
                ('Toronto', 'America/Toronto', 'CAD', -5), ('Singapore', 'Asia/Singapore', 'SGD', 8), ('Dubai', 'Asia/Dubai', 'AED', 4),
                ('Dublin', 'Europe/Dublin', 'EUR', 0), ('Auckland', 'Pacific/Auckland', 'NZD', 12), ('Amsterdam', 'Europe/Amsterdam', 'EUR', 1)]


def hub_clocks(p):
    """Hub: a wall of nine live clocks, each with its price; the visitor's own clock lights up. The fallback hands show the
    time in each city when it is noon in Mumbai."""
    li = ''
    for i, (c, tz, cur, off) in enumerate(CLOCK_CITIES):
        h = (12 - 5.5 + off) % 12; m = ((12 - 5.5 + off) % 1) * 60
        li += (f'<li style="--i:{i}" data-tz="{tz}"><span class="wc__face" data-hands data-tz="{tz}" style="--hr:{(h * 30 + m * .5):.1f}deg;--mn:{m * 6:.1f}deg">'
               f'<i class="wc__h"></i><i class="wc__m"></i></span><b>{e(c)}</b><small>{e(_p(cur))}</small></li>')
    card = (f'<div class="dk__card wc"><p class="wc__head"><span>{icon("globe")}One studio, nine time zones</span><small>5–10 page site</small></p>'
            f'<ul class="wc__g">{li}</ul><p class="wc__foot">{icon("check")}One price list, fixed in your currency</p></div>')
    return _dk('wc', card, [], 'Nine clocks for nine countries, each with the price of a 5–10 page site in that currency')


ART = {'uk': uk_letter, 'usa': us_arc, 'australia': au_job, 'canada': ca_flip, 'singapore': sg_dash, 'uae': ae_phone,
       'ireland': ie_flow, 'new-zealand': nz_relay, 'netherlands': nl_donut}
