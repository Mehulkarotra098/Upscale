"""2D motion heroes (Mehul, 17 Nov 2026: "do not go for 3D, a 2D motion graphic does the job, make it perfect").
Real HTML text (crawlable, crisp at any size), CSS-only motion, a calm finished state when motion is reduced.

pricing()  Price tags on a rail: four swing tags with the published prices, a 'fixed price' stamp, and the 20/20/60
           payment track filling for a 5-10 page site (amounts from the price list).
seo()      A local search typing itself, and 'Your business' climbing from #4 to #1 in the results, with stars and a
           Call button; a small calls-from-Google chart rising beside it. Competitors are blank placeholders."""
import geo_pages as GP
from geo_pages import e, icon


def _amt(n):
    return GP._fmt(n)


def pricing():
    tags = [('Landing page', GP.price('Landing page'), 'One page, one offer'),
            ('Business site', GP.price('Business site, 5–10 pages'), '5–10 pages'),
            ('Bigger site', GP.price('Business site, 10–20 pages + blog'), '10–20 pages + blog'),
            ('Online store', GP.price('E-commerce, under 50 products'), 'Under 50 products')]
    t = ''.join(f'<li class="mhp__tag mhp__tag--{i}" style="--i:{i}"><span class="mhp__cord" aria-hidden="true"></span>'
                f'<span class="mhp__card"><i class="mhp__hole" aria-hidden="true"></i><small>{e(n)}</small>' + ('<span class="mhp__from">from</span>' if i == 3 else '') + f'<b>{e(p)}</b><em>{e(s)}</em></span></li>'
                for i, (n, p, s) in enumerate(tags))
    total = GP.rupees('Business site, 5–10 pages')
    parts = [('Start', 20, total * 20 // 100), ('Design OK', 20, total * 20 // 100), ('When it’s live', 60, total * 60 // 100)]
    track = ''.join(f'<li class="mhp__seg mhp__seg--{i}" style="--w:{w};--i:{i}"><span class="mhp__fill"></span>'
                    f'<b>{w}%</b><small>{e(l)}</small><em>{_amt(a)}</em></li>' for i, (l, w, a) in enumerate(parts))
    label = ('Price tags for a landing page ' + tags[0][1] + ', a 5–10 page business site ' + tags[1][1] + ', a 10–20 page site '
             + tags[2][1] + ' and an online store from ' + tags[3][1] + ', stamped fixed price in writing, and the payment split for a '
             + GP.price('Business site, 5–10 pages') + ' site: 20% to start, 20% when the design is approved and 60% when it is live')
    return (f'<div class="fp-art mh mhp" role="img" aria-label="{e(label)}">'
            f'<div class="mhp__rail" aria-hidden="true"><i></i></div><ul class="mhp__tags">{t}</ul>'
            f'<p class="mhp__stamp" aria-hidden="true"><span>Fixed price</span><small>in writing</small></p>'
            f'<div class="mhp__pay"><p class="mhp__k">{icon("check")}You pay, on a {e(GP.price("Business site, 5–10 pages"))} site</p>'
            f'<ul class="mhp__track">{track}</ul><p class="mhp__note">Most of it only after your site is live.</p></div></div>')


def seo():
    rows = [('Your business', '★★★★★', '4.8 · Open now', True)] + [(None, '★★★★', '', False)] * 3
    li = ''
    for i in range(4):
        if i == 0:
            li += ('<li class="mhs__r mhs__r--you"><span class="mhs__pin" aria-hidden="true"></span>'
                   '<span class="mhs__t"><b>Your business</b><small><i class="mhs__stars">★★★★★</i> 4.8 · Open now</small></span>'
                   f'<span class="mhs__call">{icon("chat")}Call</span></li>')
        else:
            li += (f'<li class="mhs__r mhs__r--o mhs__r--o{i}" style="--i:{i}"><span class="mhs__pin mhs__pin--g" aria-hidden="true"></span>'
                   '<span class="mhs__t"><i class="mhs__ln"></i><i class="mhs__ln mhs__ln--s"></i></span></li>')
    bars = ''.join(f'<i style="--h:{h};--i:{i}"></i>' for i, h in enumerate([18, 26, 30, 44, 52, 70, 86]))
    label = ('A Google search for a dentist near Ghatkopar typing itself, and Your business climbing from fourth place to first '
             'in the local results, with five stars and a Call button, beside a chart of calls from Google rising month by month')
    return (f'<div class="fp-art mh mhs" role="img" aria-label="{e(label)}">'
            f'<div class="mhs__panel"><p class="mhs__bar"><span class="mhs__g" aria-hidden="true">G</span>'
            f'<span class="mhs__q"><span>dentist near ghatkopar</span></span><i class="mhs__lens" aria-hidden="true"></i></p>'
            f'<div class="mhs__map" aria-hidden="true"><i class="mhs__road mhs__road--1"></i><i class="mhs__road mhs__road--2"></i>'
            f'<i class="mhs__mp mhs__mp--1"></i><i class="mhs__mp mhs__mp--2"></i><i class="mhs__mp mhs__mp--3"></i><i class="mhs__mp mhs__mp--you"></i></div>'
            f'<div class="mhs__results"><p class="mhs__ranks" aria-hidden="true"><b>#1</b><b>#2</b><b>#3</b><b>#4</b></p><ol class="mhs__list">{li}</ol></div></div>'
            f'<div class="mhs__chip mhs__chip--calls"><p><b>Calls from Google</b><small>month by month</small></p><span class="mhs__bars" aria-hidden="true">{bars}</span></div>'
            f'<p class="mhs__chip mhs__chip--p1"><b>Page 1</b><small>Google Maps</small></p></div>')
