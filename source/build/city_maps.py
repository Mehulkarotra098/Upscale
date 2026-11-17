"""Area maps for the city pages (Mehul, 17 Nov 2026: every city page at the Mumbai page's level). Each city's data lives
in source/build/city_maps/<page slug>.json: localities with real coordinates and a group, real metro/rail lines in route
order with their official colours, rivers, lakes or sea, and a few neighbouring places (researched 17 Nov 2026).
draw() turns that into a drawn map with depth, like the Mumbai areas map: a raised city tile with a side edge and a
drop shadow, water, cased lines with a train running on each, pins coloured by group with labels that don't collide.
apply() adds the map as its own section to each built city page, before the 'In short' facts (or the questions)."""
import json, math, pathlib, re
from html import escape as e

DATA = pathlib.Path(__file__).resolve().parent / 'city_maps'
GROUP_COLORS = ['#5B4C9B', '#251E45', '#63B849', '#C0679A']


def _project(spec, W=460):
    pts = [(a['lat'], a['lon']) for a in spec['areas']] + [tuple(p) for l in spec.get('lines', []) for p in l['stations']] + [(n['lat'], n['lon']) for n in spec.get('neighbours', [])]
    la = [p[0] for p in pts]; lo = [p[1] for p in pts]
    lat0 = (min(la) + max(la)) / 2; k = math.cos(math.radians(lat0))
    x0, x1 = min(lo) * k, max(lo) * k; y0, y1 = min(la), max(la)
    span = max(x1 - x0, (y1 - y0) * 0.6, 1e-6)
    pad = 46; w = W - 2 * pad; scale = w / span
    H = max(380, min(620, int((y1 - y0) * scale + 2 * pad + 20)))
    cx = (x0 + x1) / 2; cy = (y0 + y1) / 2
    def P(lat, lon):
        return (W / 2 + (lon * k - cx) * scale, H / 2 - (lat - cy) * scale)
    return P, W, H


def _place_labels(items, W, H):
    """Greedy label placement: right, left, above, below, whichever doesn't hit an earlier label or the edge."""
    boxes, out = [], []
    for name, x, y, r in items:
        tw = len(name) * 6.6 + 6; th = 13
        for dx, dy, anchor in [(r + 6, 4, 'start'), (-r - 6, 4, 'end'), (0, -r - 7, 'middle'), (0, r + 15, 'middle')]:
            bx = x + dx - (tw if anchor == 'end' else tw / 2 if anchor == 'middle' else 0); by = y + dy - 11
            if bx < 6 or bx + tw > W - 6 or by < 6 or by + th > H - 6: continue
            if any(not (bx + tw < a or a + c < bx or by + th < b or b + d < by) for a, b, c, d in boxes): continue
            boxes.append((bx, by, tw, th)); out.append((x + dx, y + dy, anchor)); break
        else:
            out.append((x + r + 6, y + 4, 'start')); boxes.append((x + r + 6, y - 7, tw, th))
    return out


def draw(spec):
    P, W, H = _project(spec)
    uid = re.sub(r'[^a-z]', '', spec['city'].lower())[:8]
    gidx = {g['key']: i for i, g in enumerate(spec['groups'])}
    path = lambda pts: 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in (P(a, b) for a, b in pts))
    water = ''
    for wtr in spec.get('water', []):
        d = path(wtr['points'])
        if wtr.get('kind') == 'river':
            water += f'<path d="{d}" class="cm-river"/><path d="{d}" class="cm-river cm-river--in"/>'
        else:
            water += f'<path d="{d} Z" class="cm-lake"/>'
    lines, trains = '', ''
    for i, l in enumerate(spec.get('lines', [])):
        d = path(l['stations'])
        lines += f'<path d="{d}" class="cm-line cm-line--case"/><path d="{d}" class="cm-line" style="stroke:{e(l["color"])}"/>'
        trains += (f'<g class="cm-train"><rect x="-8" y="-4" width="16" height="8" rx="4" style="fill:{e(l["color"])}"/>'
                   f'<animateMotion dur="{8 + i * 2}s" repeatCount="indefinite" rotate="auto" path="{d}"/></g>')
    items = [(a['name'], *P(a['lat'], a['lon']), 5) for a in spec['areas']]
    labels = _place_labels(items, W, H)
    dots = ''.join(f'<g class="cm-a" style="--i:{i}"><circle cx="{x:.1f}" cy="{y:.1f}" r="5" style="fill:{GROUP_COLORS[gidx.get(a["group"], 0) % 4]}"/>'
                   f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="{an}">{e(a["name"])}</text></g>'
                   for i, (a, (n, x, y, r), (lx, ly, an)) in enumerate(zip(spec['areas'], items, labels)))
    nb = ''
    for n in spec.get('neighbours', []):
        x, y = P(n['lat'], n['lon']); x = min(max(x, 40), W - 40); y = min(max(y, 24), H - 18)
        nb += f'<g class="cm-nb"><circle cx="{x:.1f}" cy="{y:.1f}" r="5"/><text x="{x:.1f}" y="{y - 10:.1f}" text-anchor="middle">{e(n["name"])}</text></g>'
    svg = (f'<svg class="cm-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Schematic map of {e(spec["city"])}: '
           + e(', '.join(a['name'] for a in spec['areas'])) + ', with ' + e(', '.join(l['name'] for l in spec.get('lines', [])) or 'the main roads') + '">'
           f'<defs><linearGradient id="cmLand{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#EDE8F8"/></linearGradient>'
           f'<filter id="cmDrop{uid}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#1B1535" flood-opacity=".28"/></filter>'
           f'<clipPath id="cmClip{uid}"><rect x="16" y="16" width="{W - 32}" height="{H - 56}" rx="30"/></clipPath>'
           f'<filter id="cmPin{uid}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#1B1535" flood-opacity=".4"/></filter></defs>'
           f'<rect width="{W}" height="{H}" rx="26" class="cm-bg"/>'
           f'<g filter="url(#cmDrop{uid})"><rect x="16" y="28" width="{W - 32}" height="{H - 56}" rx="30" class="cm-side"/>'
           f'<rect x="16" y="16" width="{W - 32}" height="{H - 56}" rx="30" fill="url(#cmLand{uid})" class="cm-land"/></g>'
           f'<g clip-path="url(#cmClip{uid})">{water}</g>{lines}{trains}{nb}<g filter="url(#cmPin{uid})">{dots}</g></svg>')
    legend = ''.join(f'<li><i style="background:{GROUP_COLORS[i % 4]}"></i>{e(g["label"])}</li>' for i, g in enumerate(spec['groups']))
    lines_leg = ''.join(f'<li><i class="cm-ll" style="background:{e(l["color"])}"></i>{e(l["name"])}</li>' for l in spec.get('lines', []))
    city = e(spec['city'])
    html = (f'<div class="cm" data-reveal><div class="cm__fig">{svg}</div><div class="cm__t">'
            f'<p class="cm__home"><b>Wherever you are in {city}</b><small>Briefs on WhatsApp, reviews on video calls, a site that names your area the way people search for it.</small></p>'
            f'<ul class="cm__leg">{legend}</ul>' + (f'<ul class="cm__leg cm__leg--lines">{lines_leg}</ul>' if lines_leg else '')
            + '<p class="cm__nb">Schematic map, not to scale.</p></div></div>')
    return html


def section(spec):
    city = e(spec['city'])
    return (f'\n  <section class="section fp-sec" id="area-map" aria-labelledby="area-map-title">\n    <div class="wrap"><header class="sec-head fp-head">'
            f'<p class="eyebrow">Area by area</p><h2 class="h2 fp-h2" id="area-map-title">{city}, area by area.</h2></header>{draw(spec)}</div>\n  </section>')


def apply(public):
    done = []
    for js in sorted(DATA.glob('*.json')):
        spec = json.loads(js.read_text(encoding='utf-8')); slug = js.stem
        for f in list(public.glob(f'services/{slug}.html')):
            html = f.read_text(encoding='utf-8')
            if 'class="cm"' in html: continue
            at = html.find('<section class="section sp-brief-wrap')
            if at < 0: at = html.find('<section class="section faq')
            if at < 0: continue
            f.write_text(html[:at] + section(spec).lstrip('\n') + '\n  ' + html[at:], encoding='utf-8', newline='\n'); done.append(slug)
    return done
