"""Graphics with depth for uscale.in pages (never the home page).

Maps are small dioramas: plan coordinates go through one affine projection (rotate, then squash the ground), so the
ground (paper grid, water, parks, roads, rails, painted labels) is drawn once in plan space inside an SVG matrix group,
while anything with height (the slab's edge, buildings, the elevated Metro, pins) is extruded in screen space from the
same projection. Labels people must read are HTML chips laid over the SVG at the projected points: they stay crisp,
keep a readable size on phones, and float a little above the map when the pointer moves ([data-depth] in script.js).
Everything is schematic and says so; nothing here is a real business or a promised result.
"""
import math, random

import geo_pages as GP
from geo_pages import icon, e, ea

# Light comes from the top left. Surfaces facing left are lit, facing right are in shade.
COL = dict(top='#FFFFFF', top2='#F2EEFA', grid='#E7E1F3', edge='#D6CEEA', edge2='#B4A8D8', water='#BFD0F2', water2='#9CB3E6', shore='#E9F0FC',
           park='#DCEED2', tree='#86BE6F', tree2='#5C9C4A', mangrove='#CFE5C4', road='#FFFFFF', casing='#DCD5EC', rail='#5B4F96', ballast='#E3DDF1',
           metro='#63B849', metro2='#3E8A2B', bld_top='#FFFFFF', bld_l='#ECE7F7', bld_r='#CFC6E8', ink='#251E45')


class Proj:
    """Plan (x east, y south) to screen: rotate by theta, squash y by k, lift by z."""

    def __init__(self, theta, k):
        t = math.radians(theta)
        self.c, self.s, self.k, self.ox, self.oy = math.cos(t), math.sin(t), k, 0.0, 0.0

    def __call__(self, x, y, z=0.0):
        return ((x * self.c - y * self.s) + self.ox, (x * self.s + y * self.c) * self.k + self.oy - z)

    def matrix(self):
        return f'matrix({self.c:.5f} {self.s * self.k:.5f} {-self.s:.5f} {self.c * self.k:.5f} {self.ox:.2f} {self.oy:.2f})'


def _f(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')


def smooth(pts, closed=False):
    """Catmull-Rom through the points, as cubic Beziers (affine-safe, so plan paths stay smooth after projection)."""
    n = len(pts)
    if n < 3:
        return 'M' + ' L'.join(f'{_f(x)} {_f(y)}' for x, y in pts) + ('Z' if closed else '')
    g = (lambda i: pts[i % n]) if closed else (lambda i: pts[max(0, min(n - 1, i))])
    d = f'M{_f(pts[0][0])} {_f(pts[0][1])}'
    for i in range(n if closed else n - 1):
        p0, p1, p2, p3 = g(i - 1), g(i), g(i + 1), g(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p2[0])} {_f(p2[1])}'
    return d + ('Z' if closed else '')


def poly(pts):
    return 'M' + ' L'.join(f'{_f(x)} {_f(y)}' for x, y in pts) + 'Z'


def hull(points):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in points))
    if len(pts) < 3:
        return pts
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0: hi.pop()
        hi.append(p)
    return lo[:-1] + hi[:-1]


def rrect(x0, y0, x1, y1, r, steps=8):
    """Rounded rectangle outline in plan space, as points."""
    out = []
    for cx, cy, a0 in [(x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)]:
        for i in range(steps + 1):
            a = math.radians(a0 + 90 * i / steps)
            out.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return out


def seg_dist(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def line_dist(p, pts):
    return min(seg_dist(p, pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def inside(p, pts):
    x, y = p; c = False
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def along(pts, step):
    """Points every `step` units along a polyline (for pillars and sleepers)."""
    out, carry = [], 0.0
    for i in range(len(pts) - 1):
        (ax, ay), (bx, by) = pts[i], pts[i + 1]
        L = math.hypot(bx - ax, by - ay); d = step - carry
        while d <= L:
            out.append((ax + (bx - ax) * d / L, ay + (by - ay) * d / L)); d += step
        carry = (carry + L) % step
    return out


def clip_line(pts, rect):
    """The first stretch of a polyline that lies inside rect (x0, y0, x1, y1), cut exactly at the border."""
    x0, y0, x1, y1 = rect
    ins = lambda p: x0 <= p[0] <= x1 and y0 <= p[1] <= y1

    def cut(a, b):  # point where a->b crosses the rect border (a inside, b outside), by bisection
        for _ in range(30):
            m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            a, b = (m, b) if ins(m) else (a, m)
        return a
    out = []
    for i, p in enumerate(pts):
        if ins(p):
            if not out and i > 0: out.append(cut(p, pts[i - 1]))
            out.append(p)
        elif out:
            out.append(cut(out[-1], p)); break
    return out


def box(P, x, y, w, d, h, z0=0.0, tone='', cls='dm-b', windows=True):
    """An extruded block: shadow on the ground, the faces that look at us (with window bands on tall ones), then the lit top."""
    foot = [(x, y), (x + w, y), (x + w, y + d), (x, y + d)]
    base = [P(px, py, z0) for px, py in foot]; top = [P(px, py, z0 + h) for px, py in foot]
    cx = sum(p[0] for p in base) / 4; cy = sum(p[1] for p in base) / 4
    out = ''
    if z0 == 0:  # cast shadow to the south-east, longer for taller blocks
        sx, sy = h * .34, h * .44
        out += f'<path class="dm-shadow" d="{poly(hull([P(px, py) for px, py in foot] + [P(px + sx, py + sy) for px, py in foot]))}"/>'
    faces = []
    for i in range(4):
        a, b = i, (i + 1) % 4
        mx, my = (base[a][0] + base[b][0]) / 2 - cx, (base[a][1] + base[b][1]) / 2 - cy
        if my > 0.01:
            faces.append((my, 'l' if mx < 0 else 'r', a, b))
    for _, side, a, b in sorted(faces):
        out += f'<path class="{cls}__{side}{tone}" d="{poly([base[a], base[b], top[b], top[a]])}"/>'
        if windows and h >= 34:
            n = int(h // 13)
            ln = ''
            for k in range(1, n):
                z = h * k / n
                (ax, ay), (bx, by) = base[a], base[b]
                ln += f'M{_f(ax + (bx - ax) * .14)} {_f(ay + (by - ay) * .14 - z)}L{_f(ax + (bx - ax) * .86)} {_f(ay + (by - ay) * .86 - z)}'
            out += f'<path class="dm-win dm-win--{side}" d="{ln}"/>'
    out += f'<path class="{cls}__t{tone}" d="{poly(top)}"/>'
    if windows and h >= 20 and w >= 15 and d >= 13 and int(abs(x * 7 + y * 13)) % 3 == 0:
        tw = min(7, w * .32)
        out += box(P, x + w * .22, y + d * .24, tw, tw, 5 + h * .05, z0=z0 + h, cls='dm-r', windows=False)
    return out


def _tree(P, kind, x, y):
    """A tree: a soft shadow, a crown in one of three greens with a lit side. Size and colour vary by position."""
    k = int(abs(x * 3.1 + y * 1.7))
    r = (4.6 + (k % 5) * .85) if kind == 't' else (3.6 + (k % 3) * .5)
    tone = 'abc'[k % 3] if kind == 't' else 'm'
    X, Y = P(x, y); Xt, Yt = P(x, y, r + 2.5)
    return (f'<ellipse class="dm-tree-s" cx="{_f(X + r * .7)}" cy="{_f(Y + 1.5)}" rx="{_f(r + 1.5)}" ry="{_f(r * .5)}"/>'
            f'<circle class="dm-tree dm-tree--{tone}" cx="{_f(Xt)}" cy="{_f(Yt)}" r="{_f(r)}"/>'
            f'<circle class="dm-tree-h" cx="{_f(Xt - r * .32)}" cy="{_f(Yt - r * .38)}" r="{_f(r * .45)}"/>')


def _stage(sp, var):
    """One projection of a map spec. Returns (svg, labels html, aspect W, H)."""
    sp = dict(sp, **var)
    P = Proj(sp['theta'], sp['k'])
    x0, y0, x1, y1 = sp['slab']
    rect_in = (x0 + 14, y0 + 14, x1 - 14, y1 - 14)
    T = sp.get('thick', 26)
    outline = rrect(x0, y0, x1, y1, sp.get('radius', 46))
    proj = [P(x, y) for x, y in outline]
    lift = sp.get('lift', 150)  # head room for pins and the Metro above the slab
    minx = min(p[0] for p in proj); maxx = max(p[0] for p in proj)
    miny = min(p[1] for p in proj) - lift; maxy = max(p[1] for p in proj) + T + sp.get('floor', 48)  # floor: room for the slab's shadow
    pad = 14
    P.ox, P.oy = -minx + pad, -miny + pad
    W, H = maxx - minx + 2 * pad, maxy - miny + 2 * pad
    proj = [P(x, y) for x, y in outline]
    uid = sp['id'] + '-' + sp['name']
    inside_slab = lambda x, y: rect_in[0] <= x <= rect_in[2] and rect_in[1] <= y <= rect_in[3]

    # ---- ground, in plan space inside one matrix group
    g = f'<path d="{poly(outline)}" fill="url(#{uid}-top)"/>'
    step = sp.get('grid', 40)
    gl = ''.join(f'M{x} {y0}V{y1}' for x in range(int(x0 // step * step), int(x1) + 1, step)) + \
        ''.join(f'M{x0} {y}H{x1}' for y in range(int(y0 // step * step), int(y1) + 1, step))
    g += f'<path class="dm-grid" d="{gl}"/>'
    for kind, pts in sp.get('areas', []):  # parks, mangroves, water
        g += f'<path class="dm-{kind}" d="{smooth(pts, True)}"/>'
        if kind == 'water':
            g += f'<path class="dm-shoreline" d="{smooth(pts, True)}"/>'
    for ax, ay, bx2, by2 in sp.get('plots', []):
        g += f'<rect class="dm-plot" x="{ax}" y="{ay}" width="{bx2 - ax}" height="{by2 - ay}" rx="16"/>'
    for cx, cy, rx, ry in sp.get('ripples', []):
        g += f'<path class="dm-ripple" d="M{cx - rx} {cy}q{rx / 2} {-ry} {rx} 0t{rx} 0"/>'
    for kind, pts, label in sp.get('roads', []):
        d = smooth(pts)
        g += f'<path class="dm-road-c dm-road-c--{kind}" d="{d}"/><path class="dm-road dm-road--{kind}" d="{d}"/>'
        if kind == 'hwy':
            g += f'<path class="dm-road-mid" d="{d}"/>'
    for kind, pts in sp.get('rails', []):
        d = smooth(pts)
        g += f'<path class="dm-ballast" d="{d}"/><path class="dm-sleepers" d="{d}"/><path class="dm-rail dm-rail--{kind}" d="{d}"/><path class="dm-rail-gap" d="{d}"/>'
    defs_paths = ''
    for i, (kind, pts, label) in enumerate(sp.get('roads', [])):
        at = sp.get('road_label_at', {}).get(i)
        if label and at:
            lp = pts if P(*pts[-1])[0] >= P(*pts[0])[0] else pts[::-1]  # text runs left to right on screen
            defs_paths += f'<path id="{uid}-r{i}" d="{smooth(lp)}"/>'
            g += f'<text class="dm-paint dm-paint--road"><textPath href="#{uid}-r{i}" startOffset="{at}" text-anchor="middle">{e(label)}</textPath></text>'
    for text, x, y, rot, cls in sp.get('paint', []):
        g += f'<text class="dm-paint {cls}" x="{x}" y="{y}" transform="rotate({rot} {x} {y})" text-anchor="middle">{e(text)}</text>'
    if sp.get('compass'):
        cx, cy = sp['compass']
        g += (f'<g class="dm-compass"><circle cx="{cx}" cy="{cy}" r="26"/><path d="M{cx} {cy - 19} L{cx + 8} {cy + 5} L{cx} {cy + 1} L{cx - 8} {cy + 5}Z"/>'
              f'<text x="{cx}" y="{cy - 33}" text-anchor="middle">N</text></g>')
    if sp.get('route'):
        g += f'<path class="dm-route-c" d="{smooth(sp["route"])}"/><path class="dm-route" d="{smooth(sp["route"])}"/>'
    if sp.get('me'):
        mx, my = sp['me']
        g += f'<circle class="dm-me-ring" cx="{mx}" cy="{my}" r="26"/><circle class="dm-me" cx="{mx}" cy="{my}" r="11"/>'
    bx, by = sp['base']
    g += f'<circle cx="{bx}" cy="{by}" r="130" fill="url(#{uid}-glow)"/>'
    g += ''.join(f'<circle class="dm-pulse dm-pulse--{i}" cx="{bx}" cy="{by}" r="34"/>' for i in range(3))

    # ---- things with height, painted back to front, only where they stand on the slab
    items = []
    for (x, y, w, d, h, tone) in sp.get('buildings', []):
        if inside_slab(x, y) and inside_slab(x + w, y + d):
            items.append((P(x + w / 2, y + d)[1], box(P, x, y, w, d, h, tone=tone)))
    keep_clear = sp.get('clear', [])  # (x, y, half-width, half-height) zones where painted labels sit
    for kind, x, y in sp.get('trees', []):
        if not inside_slab(x, y) or any(abs(x - cx) < hw and abs(y - cy) < hh for cx, cy, hw, hh in keep_clear): continue
        items.append((P(x, y)[1], _tree(P, kind, x, y)))
    metro = sp.get('metro')
    if metro:
        h = metro['h']
        pts = clip_line(metro['pts'], rect_in)
        deck = [P(x, y, h) for x, y in pts]
        pil = ''.join(f'<path class="dm-pillar" d="M{_f(P(x, y)[0])} {_f(P(x, y)[1])}V{_f(P(x, y, h)[1] + 5)}"/>' for x, y in along(pts, metro.get('every', 44)))
        sh = smooth([P(x + h * .34, y + h * .44) for x, y in pts])
        top = smooth(deck)
        st = ''
        for (x, y) in metro.get('stations', []):
            if not inside_slab(x, y): continue
            X, Y = P(x, y, h)
            st += f'<rect class="dm-station" x="{_f(X - 15)}" y="{_f(Y - 9)}" width="30" height="13" rx="4"/><rect class="dm-station__roof" x="{_f(X - 17)}" y="{_f(Y - 13)}" width="34" height="6" rx="3"/>'
        mid = sum(P(x, y)[1] for x, y in pts) / len(pts)
        items.append((mid, f'<path class="dm-metro-shadow" d="{sh}"/>{pil}<path class="dm-metro-under" d="{smooth([(X, Y + 6) for X, Y in deck])}"/><path class="dm-metro" d="{top}"/>{st}'
                           f'<g class="dm-train"><rect x="-19" y="-6" width="38" height="11" rx="5"/><path d="M-12 -2h7M-2 -2h7M8 -2h5"/>'
                           f'<animateMotion dur="{metro.get("dur", 9)}s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1;0;0" keyTimes="0;.42;.5;.92;1" calcMode="linear" path="{top}"/></g>'))
    items.sort(key=lambda t: t[0])
    pins, labels, n = '', '', 0
    for name, x, y, side, extra in sp.get('pins', []):
        if not inside_slab(x, y): continue
        X, Y = P(x, y)
        if side.startswith('base'):
            Xh, Yh = P(x, y, 70)
            pins += (f'<ellipse class="dm-pin-s" cx="{_f(X + 6)}" cy="{_f(Y + 2)}" rx="17" ry="6.5"/><path class="dm-stick dm-stick--base" d="M{_f(X)} {_f(Y)}V{_f(Yh)}"/>'
                     f'<circle class="dm-head dm-head--base" cx="{_f(Xh)}" cy="{_f(Yh)}" r="13"/><circle class="dm-head-hl" cx="{_f(Xh - 4)}" cy="{_f(Yh - 4)}" r="4"/>')
            labels += (f'<span class="dm__tag dm__tag--{side}" style="left:{Xh / W * 100:.2f}%;top:{(Yh - 20) / H * 100:.2f}%;--i:{n}"><b>{e(name)}</b><small>{e(extra)}</small></span>')
        else:
            Xh, Yh = P(x, y, 46)
            pins += (f'<ellipse class="dm-pin-s" cx="{_f(X + 4)}" cy="{_f(Y + 1.5)}" rx="10" ry="4"/><path class="dm-stick" d="M{_f(X)} {_f(Y)}V{_f(Yh)}"/>'
                     f'<circle class="dm-head" cx="{_f(Xh)}" cy="{_f(Yh)}" r="8"/><circle class="dm-head-hl" cx="{_f(Xh - 2.5)}" cy="{_f(Yh - 2.5)}" r="2.6"/>')
            labels += f'<span class="dm__l dm__l--{side}" style="left:{Xh / W * 100:.2f}%;top:{Yh / H * 100:.2f}%;--i:{n}">{e(name)}</span>' if name else ''
        n += 1
    for text, x, y, side in sp.get('notes', []):  # small upright labels without a pin (a Metro line, a station)
        X, Y = P(x, y, (metro or {}).get('h', 0) if side.startswith('m') else 0)
        labels += f'<span class="dm__n dm__n--{side}" style="left:{X / W * 100:.2f}%;top:{Y / H * 100:.2f}%;--i:{n}">{e(text)}</span>'
        n += 1

    side_hull = hull(proj + [(x, y + T) for x, y in proj])
    shadow = hull([(x + 26, y + 42) for x, y in proj] + [(x + 26, y + 42 + T) for x, y in proj])
    svg = f'''<svg class="dm__svg" viewBox="0 0 {_f(W)} {_f(H)}" role="img" aria-labelledby="{uid}-t {uid}-d">
    <title id="{uid}-t">{e(sp['title'])}</title><desc id="{uid}-d">{e(sp['desc'])}</desc>
    <defs>
      <linearGradient id="{uid}-top" gradientUnits="userSpaceOnUse" x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}"><stop offset="0" stop-color="{COL['top']}"/><stop offset="1" stop-color="{COL['top2']}"/></linearGradient>
      <linearGradient id="{uid}-side" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="{COL['edge']}"/><stop offset=".55" stop-color="#C6BCE1"/><stop offset="1" stop-color="{COL['edge2']}"/></linearGradient>
      <radialGradient id="{uid}-glow"><stop offset="0" stop-color="#63B849" stop-opacity=".2"/><stop offset="1" stop-color="#63B849" stop-opacity="0"/></radialGradient>
      <filter id="{uid}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
      <clipPath id="{uid}-clip"><path d="{poly(outline)}"/></clipPath>
      {defs_paths}
    </defs>
    <path class="dm-slab-shadow" d="{poly(shadow)}" filter="url(#{uid}-blur)"/>
    <path d="{poly(side_hull)}" fill="url(#{uid}-side)"/>
    <g transform="{P.matrix()}"><g clip-path="url(#{uid}-clip)">{g}</g></g>
    <path class="dm-slab-lip" d="{poly(proj)}"/>
    <g class="dm-raised">{''.join(s for _, s in items)}</g>
    <g class="dm-pins">{pins}</g>
  </svg>'''
    return (f'<div class="dm__stage dm__stage--{sp["name"]}" style="aspect-ratio:{_f(W)} / {_f(H)}">\n  {svg}\n'
            f'  <div class="dm__labels" aria-hidden="true">{labels}</div>\n  </div>')


def diorama(sp, variants=(dict(name='one'),)):
    """A map as a <figure>: one stage per projection (wide for tablets and up, tall for phones), one caption."""
    stages = '\n'.join(_stage(sp, v) for v in variants)
    return f'<figure class="dm dm--{sp["id"]}" data-reveal data-depth>\n{stages}\n  <figcaption>{e(sp["caption"])}</figcaption>\n</figure>'


def _scatter(rnd, n, region, avoid, gap, size):
    """n random points inside a region polygon, kept `gap` away from every line in `avoid` and `size` apart."""
    out, tries = [], 0
    xs = [p[0] for p in region]; ys = [p[1] for p in region]
    while len(out) < n and tries < n * 80:
        tries += 1
        p = (rnd.uniform(min(xs), max(xs)), rnd.uniform(min(ys), max(ys)))
        if not inside(p, region) or any(line_dist(p, l) < gap for l in avoid) or any(math.hypot(p[0] - q[0], p[1] - q[1]) < size for q in out):
            continue
        out.append(p)
    return out


def _blocks(rnd, clusters, avoid):
    out = []
    for (ax, ay, bx, by), n, h0, h1 in clusters:
        for (x, y) in _scatter(rnd, n, [(ax, ay), (bx, ay), (bx, by), (ax, by)], avoid, 20, 30):
            w, d, h = rnd.uniform(14, 26), rnd.uniform(14, 24), rnd.uniform(h0, h1)
            q = rnd.random()
            tone = '--v' if h > 52 and q < .45 else '--g' if q < .12 else '--w' if q < .36 else ''
            out.append((x - w / 2, y - d / 2, w, d, h, tone))
    return out


# ---------------------------------------------------------------- Ghatkopar and around (area page)
def gk_spec():
    central = [(205, -640), (170, -470), (128, -350), (88, -230), (50, -112), (28, -5), (-18, 95), (-75, 190), (-112, 300), (-138, 470)]
    harbour = [(-75, 190), (-28, 228), (40, 250), (112, 266), (205, 282), (300, 300), (520, 330)]
    metro = [(28, -5), (-62, -16), (-152, -30), (-250, -46), (-360, -60), (-520, -78)]
    lbs = [(135, -640), (102, -470), (58, -232), (-14, -112), (-48, 0), (-96, 122), (-152, 252), (-190, 470)]
    eeh = [(262, -640), (232, -470), (182, -232), (156, -62), (146, 60), (168, 190), (218, 330), (246, 470)]
    jvlr = [(58, -238), (-58, -250), (-196, -206), (-330, -214), (-520, -236)]
    lake = [(-336, -336), (-286, -384), (-206, -378), (-160, -330), (-172, -268), (-238, -238), (-310, -258), (-350, -298)]
    park = [(-520, -660), (-236, -660), (-286, -560), (-376, -466), (-520, -440)]
    creek = [(398, -660), (370, -330), (382, -40), (420, 230), (472, 470), (600, 470), (600, -660)]
    mangrove = [(318, -660), (296, -330), (306, -40), (340, 230), (392, 470), (480, 470), (430, 230), (392, -40), (380, -330), (408, -660)]
    lines = [central, harbour, metro, lbs, eeh, jvlr]
    rnd = random.Random(11)
    clusters = [((-150, -100, -60, 90), 10, 14, 48), ((60, -60, 140, 110), 9, 12, 40), ((-200, 140, -110, 260), 7, 12, 34),
                ((40, 200, 200, 330), 8, 12, 36), ((40, -300, 140, -170), 7, 12, 44), ((110, -540, 220, -400), 6, 12, 40),
                ((-246, -236, -120, -140), 7, 30, 92), ((-420, -130, -280, 60), 7, 10, 32), ((-300, 110, -220, 300), 6, 10, 30),
                ((-60, -200, 20, -130), 4, 10, 26), ((-120, 300, 40, 400), 6, 10, 30)]
    blds = _blocks(rnd, clusters, lines)
    plots = [(ax - 14, ay - 14, bx + 14, by + 14) for (ax, ay, bx, by), *_ in clusters]
    trees = ([('t', x, y) for x, y in _scatter(rnd, 90, park, [], 0, 15)]
             + [('t', x, y) for x, y in _scatter(rnd, 12, [(-390, -430), (-200, -440), (-140, -400), (-170, -362), (-390, -392)], [], 0, 19)]
             + [('m', x, y) for x, y in _scatter(rnd, 46, mangrove, [], 0, 15)])
    pins_wide = [('Mulund', 170, -470, 'r', ''), ('Vikhroli', 88, -230, 'r', ''), ('Powai', -166, -340, 'r', ''),
                 ('Ghatkopar East', 128, 22, 'r', ''), ('Kurla', -75, 190, 'l', ''), ('Chembur', 112, 266, 'r', ''),
                 ('Ghatkopar West', -40, 18, 'base', 'U Scale · Mehul Karotra')]
    return dict(
        id='gkmap', seed=3,
        title='Areas around Ghatkopar West where U Scale meets clients',
        desc=('Schematic map, not to scale: Ghatkopar West in the centre, with Vikhroli and Mulund to the north along the Central line, Powai and '
              'Powai Lake to the north-west, Ghatkopar East across the tracks, Kurla to the south-west and Chembur to the south-east on the Harbour '
              'line. Metro Line 1 runs west from Ghatkopar towards Andheri. Thane Creek and its mangroves lie to the east.'),
        caption='Areas around Ghatkopar where Mehul meets clients. Schematic, not to scale.',
        areas=[('park', park), ('mangrove', mangrove), ('water', creek), ('water', lake)],
        ripples=[(-262, -330, 30, 7), (-228, -300, 24, 6), (-292, -296, 18, 5)],
        roads=[('hwy', eeh, 'EASTERN EXPRESS HIGHWAY'), ('road', lbs, 'LBS MARG'), ('road', jvlr, 'JVLR')],
        rails=[('central', central), ('harbour', harbour)],
        paint=[('THANE CREEK', 488, -150, 82, 'dm-paint--water')], plots=plots,
        base=(-40, 18),
        metro=dict(pts=metro, h=34, stations=[(28, -5), (-62, -16), (-152, -30), (-250, -46), (-360, -60)], dur=10),
        buildings=blds, trees=trees, pins=pins_wide)


def gk_map():
    sp = gk_spec()
    return diorama(sp, [
        dict(name='wide', theta=-17, k=.6, slab=(-470, -560, 470, 420), lift=52, compass=(412, 362),
             road_label_at={0: '30%', 1: '27%', 2: '62%'},
             notes=[('Metro Line 1 → Andheri', -440, -70, 'm-l')]),
        dict(name='tall', theta=-9, k=.76, slab=(-250, -560, 430, 420), lift=62, compass=(376, 372), radius=40,
             road_label_at={0: '30%', 1: '30%'},
             pins=[(n, x, y, {'Kurla': 'r'}.get(n, s), t) for n, x, y, s, t in sp['pins']],
             notes=[('Metro → Andheri', -236, -50, 'm-b')]),
    ])


# ---------------------------------------------------------------- About: the same neighbourhood from the other side, with what lies beyond it
def about_map():
    """About gets its own view: the camera swings round to the south-west, the Metro runs out to Andheri East, and markers at
    the edges point on to Thane (north, up the line) and Navi Mumbai (east, across the creek)."""
    sp = gk_spec()
    sp.update(id='aboutmap',
              title='Where Mehul Karotra meets clients, around Ghatkopar and beyond',
              desc=('Schematic map, not to scale: U Scale is based in Ghatkopar West. Around it are Vikhroli and Mulund to the north, Powai to the '
                    'north-west, Ghatkopar East, Kurla and Chembur. Metro Line 1 runs west to Andheri East, the Central line runs north to Thane, '
                    'and Navi Mumbai lies east across Thane Creek. Mehul also works with businesses across India over WhatsApp and video calls.'),
              caption='Ghatkopar, the areas around it, and the way on to Andheri East, Thane and Navi Mumbai. Schematic, not to scale.')
    beyond = [('Thane ↑', 262, -536, 'g'), ('Navi Mumbai →', 470, 250, 'g')]
    return diorama(sp, [
        dict(name='wide', theta=16, k=.6, slab=(-470, -560, 470, 420), lift=52, compass=(-410, 362),
             road_label_at={0: '22%', 1: '70%', 2: '40%'},
             pins=[(n, x, y, {'Kurla': 'r', 'Mulund': 'l'}.get(n, s_), t) for n, x, y, s_, t in sp['pins']],
             notes=[('Metro 1 → Andheri East', -352, -59, 'm')] + beyond),
        dict(name='tall', theta=6, k=.76, slab=(-250, -560, 430, 420), lift=62, compass=(-196, 372), radius=40,
             road_label_at={0: '30%', 1: '30%'},
             pins=[(n, x, y, {'Kurla': 'r', 'Mulund': 'l'}.get(n, s_), t) for n, x, y, s_, t in sp['pins']],
             notes=[('Metro → Andheri East', -236, -50, 'm-b'), ('Thane ↑', 262, -536, 'g'), ('Navi Mumbai →', 388, 300, 'g-l')]),
    ])


# ---------------------------------------------------------------- Andheri East to Ghatkopar on Metro Line 1 (area page)
def metro_map():
    st = ['W. E. Highway · Gundavali', 'Chakala · J.B. Nagar', 'Airport Road', 'Marol Naka · MIDC', 'Saki Naka', 'Asalpha', 'Jagruti Nagar', 'Ghatkopar']
    xs = [-480 + i * 137 for i in range(8)]
    ys = [6 if i % 2 == 0 else -6 for i in range(8)]
    line = [(xs[0] - 60, 6)] + list(zip(xs, ys))
    zone = [(-560, -150), (120, -150), (150, 0), (120, 150), (-560, 150)]
    runway = [(-300, -150), (-116, -112)]
    weh = [(-470, -260), (-480, 0), (-490, 260)]
    lbs = [(400, -260), (430, 0), (460, 260)]
    rnd = random.Random(9)
    blds = _blocks(rnd, [((-560, 30, -360, 140), 8, 10, 40), ((-340, 40, -160, 140), 7, 10, 34), ((-100, -140, 40, -40), 6, 10, 30),
                         ((-60, 40, 120, 140), 8, 10, 36), ((160, -140, 330, -40), 6, 10, 28), ((180, 40, 340, 140), 6, 10, 28),
                         ((370, -140, 520, -30), 6, 12, 40), ((370, 40, 520, 140), 6, 12, 36), ((-560, -140, -420, -40), 5, 10, 34)],
                   [line, weh, lbs, runway])
    trees = [('t', x, y) for x, y in _scatter(rnd, 22, [(-420, 150), (100, 150), (100, 205), (-420, 205)], [line, weh, lbs], 18, 24)]
    sp = dict(
        id='aemap', seed=9,
        title='Andheri East and Ghatkopar on Mumbai Metro Line 1',
        desc=GP.AE_DESC,
        caption='Andheri East and Ghatkopar are on the same Metro line. Schematic, not to scale.',
        areas=[('zone', zone)],
        roads=[('hwy', weh, 'W. E. HIGHWAY'), ('road', lbs, 'LBS MARG'), ('runway', runway, '')],
        base=(xs[-1], ys[-1]),
        metro=dict(pts=line, h=40, stations=list(zip(xs, ys)), dur=11, every=40),
        buildings=blds, trees=trees,
        pins=[('Ghatkopar West', xs[-1], ys[-1], 'base', 'U Scale base')])
    stations = list(zip(st[:-1], xs[:-1], ys[:-1]))
    return diorama(sp, [
        dict(name='wide', theta=-10, k=.5, slab=(-570, -220, 560, 210), lift=150, radius=36, road_label_at={0: '22%', 1: '78%'},
             paint=[('ANDHERI EAST', -250, 182, 10, 'dm-paint--zone'), ('AIRPORT', -208, -150, -2, 'dm-paint--rail'), ('GHATKOPAR', 446, 182, 10, 'dm-paint--zone')],
             clear=[(-250, 178, 160, 30)],
             notes=[(n, x, y, 'm' if i % 2 == 0 else 'm2') for i, (n, x, y) in enumerate(stations)]),
        dict(name='tall', theta=78, k=.86, slab=(-570, -220, 560, 210), lift=120, radius=36, road_label_at={},
             paint=[('ANDHERI EAST', -400, -176, -78, 'dm-paint--zone'), ('GHATKOPAR', 300, -176, -78, 'dm-paint--zone')],
             pins=[('Ghatkopar West', xs[-1], ys[-1], 'base-l', 'U Scale base')],
             notes=[(n, x, y, 'm-s') for n, x, y in stations]),
    ])


# ---------------------------------------------------------------- hero cards with depth
# Each card is a small CSS 3D scene: a perspective box (.dk), a tilted plane that follows the pointer (.dk__tilt, preserve-3d),
# paper sheets stacked behind it, and accents floating in front at their own depth (--z). Because the layers really sit at
# different depths, they separate by themselves as the plane tilts. Reduced motion keeps the resting tilt and stops the bobbing.
def _dk(kind, card, floats='', sheets=2, label=''):
    st = ''.join(f'<i style="--s:{i + 1}"></i>' for i in range(sheets))
    lab = f' role="group" aria-label="{ea(label)}"' if label else ''
    return (f'<div class="fp-art dk dk--{kind}" data-depth{lab}><div class="dk__tilt">'
            f'<div class="dk__stack" aria-hidden="true">{st}</div>{card}{floats}</div></div>')


def _float(cls, html, z, i=0):
    return f'<span class="dk__f {cls}" style="--z:{z}px;--i:{i}" aria-hidden="true">{html}</span>'


def card_pack():
    """SEO: a local search. The search field sits on the card, the map shows your listing as the beacon with the way to it
    from where the searcher is (Distance), and the rows say what Google weighs. Illustrative: no real business, no position promised."""
    rnd = random.Random(4)
    roads = [('road', [(-260, 40), (-80, 20), (80, -10), (260, -30)], ''), ('road', [(40, -200), (20, 0), (-10, 200)], '')]
    blds = _blocks(rnd, [((-240, -170, -60, -40), 6, 10, 32), ((80, -170, 240, -70), 5, 10, 28), ((-240, 70, -60, 170), 5, 10, 26), ((90, 40, 240, 170), 5, 10, 30)],
                   [r[1] for r in roads])
    sp = dict(id='packmap', name='mini', title='Illustration: a local map search, with your listing, two others and the way to you',
              desc='Your listing in green with a tag, two other businesses nearby, and a dotted route from where the person searching is. Illustrative only.',
              theta=-16, k=.56, slab=(-260, -190, 260, 190), lift=58, floor=18, radius=26, thick=12, grid=40, roads=roads, road_label_at={},
              buildings=blds, base=(-6, 58), me=(-200, 150), route=[(-200, 150), (-140, 112), (-70, 30), (-24, 26), (-6, 58)],
              pins=[('Your listing', -6, 58, 'base', 'Open now · Directions'), ('', 160, -96, 'r', ''), ('', -168, -116, 'r', '')])
    stage = _stage(sp, {})
    rows = [('search', 'Relevance', 'You control it', 86), ('pin', 'Distance', 'Nobody can change it', 0), ('star', 'Prominence', 'You build it', 64)]
    li = ''.join(f'<li style="--i:{i}"><span class="sv-pack__ic">{icon(ic)}</span><span class="sv-pack__l"><b>{e(n)}</b><small>{e(t)}</small></span>'
                 + (f'<span class="dk-bar"><i style="--w:{w}%"></i></span>' if w else '<span class="dk-bar dk-bar--fixed"></span>')
                 + '</li>' for i, (ic, n, t, w) in enumerate(rows))
    card = (f'<div class="dk__card sv-card sv-pack"><p class="dk-q">{icon("search")}<span>dentist near me</span><i aria-hidden="true"></i><b>{icon("pin")}Mumbai</b></p>'
            f'<div class="dk-mini" aria-hidden="true">{stage}</div>'
            f'<p class="sv-card__h">What Google weighs</p><ul>{li}</ul>'
            f'<p class="sv-card__f">{icon("check")}Monthly report: calls, directions, website taps</p></div>')
    return _dk('pack', card, '', label='What Google weighs in local map results: relevance, distance and prominence')


def card_calendar():
    """Social media: a month's plan as real-looking tiles (post, reel, carousel), last month's pages behind, a phone with the next reel."""
    plan = {2: 'p', 4: 'r', 6: 'c', 9: 'p', 11: 'r', 13: 'p', 16: 'c', 18: 'p', 20: 'r', 23: 'p', 25: 'c', 27: 'r'}
    tile = {'p': '<b class="th th--p"></b>', 'r': '<b class="th th--r"></b>', 'c': '<b class="th th--c"></b>'}
    cells = ''.join(f'<li class="sv-cal__d{" sv-cal__d--" + plan[d] if d in plan else ""}" style="--i:{d}">{tile.get(plan.get(d), "")}<span>{d}</span></li>' for d in range(1, 29))
    days = ''.join(f'<li>{x}</li>' for x in 'MTWTFSS')
    card = (f'<div class="dk__card sv-card sv-cal"><p class="sv-card__k">{icon("calendar")}Your content plan · 4 weeks</p>'
            f'<ul class="sv-cal__wd" aria-hidden="true">{days}</ul><ol class="sv-cal__g" aria-hidden="true">{cells}</ol>'
            f'<p class="sv-cal__key" aria-hidden="true"><span class="sv-k sv-k--p">Post</span><span class="sv-k sv-k--r">Reel</span><span class="sv-k sv-k--c">Carousel</span></p>'
            f'<p class="sv-card__f">{icon("check")}You approve the calendar before anything goes live</p></div>')
    floats = (_float('dk-phone', '<i class="dk-phone__isl"></i><b class="dk-phone__reel"><i></i></b><b class="dk-phone__bar"></b><b class="dk-phone__bar dk-phone__bar--s"></b>', 110, 0)
              + _float('dk-chip dk-chip--ok', f'{icon("check")}Approved', 140, 1))
    return _dk('cal', card, floats, sheets=2, label='A sample month of social media content: posts, reels and carousels across four weeks')


def card_answer():
    """AI search: a chat window. The answer cites four sources, and each source card rises off the card at its own depth."""
    src = [('globe', 'Your website'), ('pin', 'Google Business Profile'), ('star', 'Reviews'), ('file', 'Directories')]
    li = ''.join(f'<li style="--i:{i}"><span class="dk-n">{i + 1}</span>{icon(ic)}<span>{e(t)}</span>{icon("check", "fp-ic sv-ok")}</li>'
                 for i, (ic, t) in enumerate(src))
    card = (f'<div class="dk__card sv-card sv-ans"><p class="dk-win" aria-hidden="true"><i></i><i></i><i></i><span>AI assistant</span></p>'
            f'<p class="sv-ans__q">Who makes restaurant websites with online ordering in Mumbai?</p>'
            f'<div class="sv-ans__a dk-ans"><p>A few Mumbai studios build these. Compare published prices, past restaurant sites, and whether ordering is commission-free.</p>'
            f'<span class="dk-cites" aria-hidden="true"><b>1</b><b>2</b><b>3</b><b>4</b></span></div>'
            f'<p class="sv-card__h">Where the answer comes from</p><ul class="dk-src">{li}</ul>'
            f'<p class="sv-card__f">{icon("refresh")}Re-checked every month · illustration</p></div>')
    return _dk('ans', card, '', label='Illustration: an AI assistant answers a local question and cites the business’s website, Google listing, reviews and directories')


def card_menu():
    """Services hub: a rate card clipped to a board, each service on its own raised tile."""
    rows = [('globe', 'Websites', f'from {GP.price("Landing page")}'), ('pin', 'Local SEO', GP.price('Local SEO / Google Business Profile')),
            ('camera', 'Social media', GP.price('Community & inbox management')), ('bolt', 'Google & Meta ads', GP.price('Ads management')),
            ('chat', 'AI search (GEO)', GP.price('AI search visibility (GEO)'))]
    li = ''.join(f'<li style="--i:{i}"><span class="dk-tile">{icon(ic)}</span><span>{e(n)}</span><i></i><b>{e(v)}</b></li>' for i, (ic, n, v) in enumerate(rows))
    card = (f'<div class="dk__card fp-ticket sv-ticket dk-menu"><p class="fp-ticket__k">U Scale rate card · 2026</p>'
            f'<ul>{li}</ul><p class="fp-ticket__f">{icon("shield")}Every price published. No GST charged right now.</p></div>')
    stamp = ('<svg viewBox="0 0 124 66"><rect x="3" y="3" width="118" height="60" rx="9" class="o"/><rect x="9" y="9" width="106" height="48" rx="5" class="i"/>'
             '<text x="62" y="36" class="big">FREE</text><text x="62" y="50" class="small">FIRST AUDIT</text></svg>')
    floats = _float('dk-clip', '<i></i><s></s><s></s>', 40, 0) + _float('dk-ink', stamp, 24, 1)
    return _dk('menu', card, floats, sheets=1, label='U Scale services and prices')


def card_prices():
    """Pricing: a sample written quote. Fixed prices, the 20 / 20 / 60 schedule, a seal, the next pages behind."""
    rows = [('Landing page', GP.price('Landing page')), ('Business site, 3–4 pages', GP.price('Business site, 3–4 pages')),
            ('5–10 pages + blog', GP.price('Business site, 5–10 pages + blog')), ('Online store', 'from ' + GP.price('E-commerce, under 50 products'))]
    li = ''.join(f'<li style="--i:{i}"><span>{e(n)}</span><i></i><b>{e(v)}</b></li>' for i, (n, v) in enumerate(rows))
    card = (f'<div class="dk__card fp-ticket sv-ticket dk-quote"><p class="dk-quote__head"><span class="dk-quote__mark" aria-hidden="true">u</span>'
            f'<span><b>Sample quote</b><small>Fixed website prices · 2026</small></span></p>'
            f'<ul>{li}</ul>'
            f'<div class="dk-pay" aria-label="Payment: 20% to start, 20% on design sign-off, 60% on launch"><span style="--w:20"><b>20%</b>Start</span><span style="--w:20"><b>20%</b>Design</span><span style="--w:60"><b>60%</b>Launch</span></div>'
            f'<p class="fp-ticket__f">{icon("file")}In writing before work starts</p></div>')
    floats = _float('dk-seal', '<svg viewBox="0 0 120 120"><defs><path id="dkseal" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs>'
                    '<circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="34" class="in"/>'
                    '<text><textPath href="#dkseal" startOffset="0" textLength="262" lengthAdjust="spacingAndGlyphs">FIXED PRICE · IN WRITING · </textPath></text>'
                    '<text x="60" y="68" text-anchor="middle" class="big">₹</text></svg>', 110, 0)
    return _dk('quote', card, floats, sheets=2, label='U Scale fixed website prices')


CARDS = {'pack': card_pack, 'calendar': card_calendar, 'answer': card_answer, 'menu': card_menu, 'prices': card_prices}


def _qr_path(n=21, seed=21):
    """A QR-like pattern (finder squares in three corners, a fixed scatter elsewhere). Decorative, it encodes nothing."""
    rnd = random.Random(seed)
    cells = set()
    for ox, oy in ((0, 0), (n - 7, 0), (0, n - 7)):
        for i in range(7):
            for j in range(7):
                if i in (0, 6) or j in (0, 6) or (2 <= i <= 4 and 2 <= j <= 4):
                    cells.add((ox + i, oy + j))
    for x in range(n):
        for y in range(n):
            near = (x < 8 and y < 8) or (x > n - 9 and y < 8) or (x < 8 and y > n - 9)
            if not near and rnd.random() < .46:
                cells.add((x, y))
    return ''.join(f'M{x} {y}h1v1h-1z' for x, y in sorted(cells))


def card_tools():
    """Tools hub: what the four free tools make, as objects on a desk at their own depth: a visiting card lying behind,
    the printed review standee standing up, a profile score card and a QR code card in front. Same images the tools use."""
    vu = GP.vurl
    objs = (
        f'<span class="dk-o dk-o--card" style="--z:0px"><img src="{vu("/assets/card/thumbs/rangoli.webp")}" width="480" height="274" alt="" decoding="async"></span>'
        f'<span class="dk-o dk-o--standee" style="--z:34px"><img src="{vu("/assets/tools/standee-sample.webp")}" width="600" height="846" alt="" decoding="async"></span>'
        f'<span class="dk-o dk-o--score" style="--z:70px"><span class="dk-o__k">{icon("pin")}Profile check</span>'
        f'<span class="dk-ring"><b>72</b><small>/100</small></span><span class="dk-o__pill">Good, a few gaps</span></span>'
        f'<span class="dk-o dk-o--qr" style="--z:96px"><svg viewBox="-1 -1 23 23" aria-hidden="true"><path d="{_qr_path()}"/></svg><span class="dk-o__k">{icon("qr")}Your link</span></span>'
    )
    return (f'<div class="fp-art dk dk--tools" data-depth role="group" aria-label="What the free tools make: a Google profile score, a review QR standee, '
            f'a visiting card and a QR code"><div class="dk__tilt dk-desk" aria-hidden="true">{objs}</div></div>')


CARDS['tools'] = card_tools
