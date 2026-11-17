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


def _project(spec, W=400, pad=54):
    # the frame fits the areas; lines run on to the tile's edge and neighbouring places sit on the edge in their direction
    # (Kalyan is 12 km east of Thane's areas, Gandhinagar 12 km north of Ahmedabad's)
    pts = [(a['lat'], a['lon']) for a in spec['areas']]
    la = [p[0] for p in pts]; lo = [p[1] for p in pts]
    lat0 = (min(la) + max(la)) / 2; k = math.cos(math.radians(lat0))
    x0, x1 = min(lo) * k, max(lo) * k; y0, y1 = min(la), max(la)
    H_MAX = 600
    # fit the width, unless the city is tall: then fit the height (the land tile runs 16..H-40, labels need room below)
    scale = min((W - 2 * pad) / max(x1 - x0, 1e-6), (H_MAX - 2 * pad - 40) / max(y1 - y0, 1e-6))
    H = max(380, int((y1 - y0) * scale + 2 * pad + 40))
    cx = (x0 + x1) / 2; cy = (y0 + y1) / 2
    def P(lat, lon):
        return (W / 2 + (lon * k - cx) * scale, (H - 24) / 2 - (lat - cy) * scale)
    return P, W, H


def _overlap(a, b):
    w = min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]); h = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
    return w * h if w > 0 and h > 0 else 0


def _place_labels(items, W, H):
    """Label placement: each label tries eight spots around its pin, at two distances, and takes the one that overlaps
    least with labels already placed, with every pin, and with the edge of the city tile. The most crowded pins go first."""
    pins = [(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4) for _, x, y, r in items]
    tile = (22, 22, W - 44, H - 70)
    near = lambda i: sum(1 for j, (_, x, y, _r) in enumerate(items) if j != i and abs(x - items[i][1]) < 90 and abs(y - items[i][2]) < 40)
    order = sorted(range(len(items)), key=lambda i: -near(i))
    boxes, out = [], [None] * len(items)
    for i in order:
        name, x, y, r = items[i]
        tw = len(name) * 7.4 + 4; th = 15
        best = None
        for k, d in enumerate((r + 5, r + 13, r + 24, r + 36)):
            for dx, dy, anchor in [(d, 4, 'start'), (-d, 4, 'end'), (0, -d - 1, 'middle'), (0, d + 11, 'middle'),
                                   (d - 3, -d + 1, 'start'), (d - 3, d + 9, 'start'), (-d + 3, -d + 1, 'end'), (-d + 3, d + 9, 'end')]:
                bx = x + dx - (tw if anchor == 'end' else tw / 2 if anchor == 'middle' else 0); by = y + dy - 11
                box = (bx, by, tw, th)
                score = ((tw * th - _overlap(box, tile)) * 50 + sum(_overlap(box, b) for b in boxes) * 20
                         + sum(_overlap(box, p) for j, p in enumerate(pins) if j != i) * 20 + k * 30)
                if best is None or score < best[0]: best = (score, box, (x + dx, y + dy, anchor, k, box))
        boxes.append(best[1]); out[i] = best[2]
    return out


def _problems(items, labels, W, H):
    """Labels on labels, labels on someone else's pin, labels off the tile: the count _layout keeps to the minimum."""
    boxes = [l[4] for l in labels]
    bad = sum(1 for i in range(len(boxes)) for j in range(i) if _overlap(boxes[i], boxes[j]) > 0)
    bad += sum(1 for i, b in enumerate(boxes) for j, (_, x, y, r) in enumerate(items) if i != j and _overlap(b, (x - r, y - r, 2 * r, 2 * r)) > 0)
    return bad + sum(1 for b in boxes if b[0] < 22 or b[0] + b[2] > W - 22 or b[1] < 22 or b[1] + b[3] > H - 48)


def _layout(spec):
    """Frame, pins and labels: a few margins are tried and the one whose labels collide least is kept."""
    best = None
    for pad in (54, 48, 60, 44, 66):
        P, W, H = _project(spec, pad=pad)
        items = [(a['name'], *P(a['lat'], a['lon']), 6) for a in spec['areas']]
        nbs = []
        for n in spec.get('neighbours', []):
            x, y = P(n['lat'], n['lon']); x, y = min(max(x, 34), W - 34), min(max(y, 30), H - 52)
            # pushed to the edge, a neighbour can land on a real area: leave it off then
            if all(math.hypot(x - ax, y - ay) > 30 for _, ax, ay, _r in items): nbs.append((n['name'], x, y, 5))
        labels = _place_labels(items + nbs, W, H)
        bad = _problems(items + nbs, labels, W, H)
        if best is None or bad < best[0]: best = (bad, P, W, H, items, nbs, labels)
        if bad == 0: break
    return best


def draw(spec):
    _bad, P, W, H, items, nbs, labels = _layout(spec)
    uid = re.sub(r'[^a-z]', '', spec['city'].lower())[:8]
    gidx = {g['key']: i for i, g in enumerate(spec['groups'])}
    path = lambda pts: 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in (P(a, b) for a, b in pts))
    water = ''
    for wtr in spec.get('water', []):
        d = path(wtr['points'])
        if wtr.get('kind') == 'river':
            water += f'<path d="{d}" class="ca-river"/><path d="{d}" class="ca-river ca-river--in"/>'
        else:
            water += f'<path d="{d} Z" class="ca-lake"/>'
    lines, trains = '', ''
    for i, l in enumerate(spec.get('lines', [])):
        d = path(l['stations'])
        lines += f'<path d="{d}" class="ca-line ca-line--case"/><path d="{d}" class="ca-line" style="stroke:{e(l["color"])}"/>'
        trains += (f'<g class="ca-train"><rect x="-8" y="-4" width="16" height="8" rx="4" style="fill:{e(l["color"])}"/>'
                   f'<animateMotion dur="{8 + i * 2}s" repeatCount="indefinite" rotate="auto" path="{d}"/></g>')
    def leader(x, y, r, lab):
        # a label pushed out to the second or third ring gets a thin line to its pin, so it's clear whose it is
        lx, ly, an, k, (bx, by, bw, bh) = lab
        if k == 0: return ''
        tx = min(max(x, bx), bx + bw); ty = min(max(y, by), by + bh)
        d = math.hypot(tx - x, ty - y)
        if d < r + 4: return ''
        sx, sy = x + (tx - x) / d * (r + 1), y + (ty - y) / d * (r + 1)
        return f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{tx:.1f}" y2="{ty:.1f}" class="ca-lead"/>'
    dots = ''.join(f'<g class="ca-a" style="--i:{i}">{leader(x, y, r, lab)}<circle cx="{x:.1f}" cy="{y:.1f}" r="6" style="fill:{GROUP_COLORS[gidx.get(a["group"], 0) % 4]}"/>'
                   f'<text x="{lab[0]:.1f}" y="{lab[1]:.1f}" text-anchor="{lab[2]}">{e(a["name"])}</text></g>'
                   for i, (a, (n, x, y, r), lab) in enumerate(zip(spec['areas'], items, labels)))
    nb = ''.join(f'<g class="ca-nb">{leader(x, y, r, lab)}<circle cx="{x:.1f}" cy="{y:.1f}" r="5"/><text x="{lab[0]:.1f}" y="{lab[1]:.1f}" text-anchor="{lab[2]}">{e(name)}</text></g>'
                 for (name, x, y, r), lab in zip(nbs, labels[len(items):]))

    # water names, where they fit: along a river (at a third, a half or two thirds of its length) or in a lake or the sea
    taken = [lab[4] for lab in labels] + [(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4) for _, x, y, r in items + nbs]
    wl = ''
    for wtr in spec.get('water', []):
        pts = [P(a, b) for a, b in wtr['points']]
        name = wtr['name'].replace(' river', '').replace(' River', '')
        tw = len(name) * 6.4 + 4
        cands = ([pts[int(len(pts) * f)] for f in (.5, .35, .65, .2, .8)] if wtr.get('kind') == 'river'
                 else [(sum(x for x, _ in pts) / len(pts), sum(y for _, y in pts) / len(pts))])
        for cx_, cy_ in cands:
            for oy in ((-14, 18) if wtr.get('kind') == 'river' else (4,)):
                box = (cx_ - tw / 2, cy_ + oy - 10, tw, 12)
                if box[0] < 24 or box[0] + tw > W - 24 or box[1] < 24 or box[1] + 12 > H - 50: continue
                if any(_overlap(box, b) for b in taken): continue
                taken.append(box); wl += f'<text x="{cx_:.1f}" y="{cy_ + oy:.1f}" text-anchor="middle" class="ca-wl">{e(name)}</text>'; break
            else: continue
            break
    svg = (f'<svg class="ca-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Schematic map of {e(spec["city"])}: '
           + e(', '.join(a['name'] for a in spec['areas'])) + ', with ' + e(', '.join(l['name'] for l in spec.get('lines', [])) or 'the main roads') + '">'
           f'<defs><linearGradient id="caLand{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#EDE8F8"/></linearGradient>'
           f'<filter id="caDrop{uid}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#1B1535" flood-opacity=".28"/></filter>'
           f'<clipPath id="caClip{uid}"><rect x="16" y="16" width="{W - 32}" height="{H - 56}" rx="30"/></clipPath>'
           f'<filter id="caPin{uid}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#1B1535" flood-opacity=".4"/></filter></defs>'
           f'<rect width="{W}" height="{H}" rx="26" class="ca-bg"/>'
           f'<g filter="url(#caDrop{uid})"><rect x="16" y="28" width="{W - 32}" height="{H - 56}" rx="30" class="ca-side"/>'
           f'<rect x="16" y="16" width="{W - 32}" height="{H - 56}" rx="30" fill="url(#caLand{uid})" class="ca-land"/></g>'
           f'<g clip-path="url(#caClip{uid})">{water}{lines}{trains}</g>{wl}{nb}<g filter="url(#caPin{uid})">{dots}</g></svg>')
    legend = ''.join(f'<li><i style="background:{GROUP_COLORS[i % 4]}"></i>{e(g["label"])}</li>' for i, g in enumerate(spec['groups']))
    lines_leg = ''.join(f'<li><i class="ca-ll" style="background:{e(l["color"])}"></i>{e(l["name"])}</li>' for l in spec.get('lines', []))
    city = e(spec['city'])
    html = (f'<div class="ca" data-reveal><div class="ca__fig">{svg}</div><div class="ca__t">'
            f'<p class="ca__home"><b>Wherever you are in {city}</b><small>Briefs on WhatsApp, reviews on video calls, a site that names your area the way people search for it.</small></p>'
            f'<ul class="ca__leg">{legend}</ul>' + (f'<ul class="ca__leg ca__leg--lines">{lines_leg}</ul>' if lines_leg else '')
            + '<p class="ca__nb">Schematic map, not to scale.</p></div></div>')
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
            if 'class="ca"' in html: continue
            at = html.find('<section class="section sp-brief-wrap')
            if at < 0: at = html.find('<section class="section faq')
            if at < 0: continue
            f.write_text(html[:at] + section(spec).lstrip('\n') + '\n  ' + html[at:], encoding='utf-8', newline='\n'); done.append(slug)
    return done
