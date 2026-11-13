// Illustrated cards, part two: a cassette, a ring light, a star wheel, a cricket ball, balloons, a pencil, a dog,
// a Warli dance, a Paithani border and an ikat weave.
import { A, B, E, H, LN, LOGO, QR, R, T, W } from './kit.js';
import { brand, circle, glow, grad, line, n, poly, reach, rng, roundRect, shop, sparkle, stroke, turn, VH, VW, who } from './blocks.js';

// ---------- Cassette ----------
function reel(id, cx, cy, pack) {
  let teeth = '';
  for (let i = 0; i < 6; i++) teeth += line([turn([cx, cy - 1.8], i * 60, [cx, cy]), turn([cx, cy - 0.9], i * 60, [cx, cy])]);
  return [
    E(`${id}pack`, cx - pack, cy - pack, 2 * pack, 2 * pack, '$tape'),
    E(`${id}hub`, cx - 2.9, cy - 2.9, 5.8, 5.8, '$hub'),
    E(`${id}hole`, cx - 1.8, cy - 1.8, 3.6, 3.6, '$win'),
    A(`${id}teeth`, teeth, stroke('$hub', 0.6, { cap: 'butt' })),
  ];
}
const screws = () =>
  [
    [3.4, 3.4],
    [W - 3.4, 3.4],
    [3.4, H - 3.4],
    [W - 3.4, H - 3.4],
  ].flatMap(([x, y], i) => [
    E(`screw${i}`, x - 1, y - 1, 2, 2, '$shell2'),
    A(
      `slot${i}`,
      line([turn([x - 0.7, y], 35 + i * 40, [x, y]), turn([x + 0.7, y], 35 + i * 40, [x, y])]),
      stroke('$shell', 0.22, { cap: 'butt' }),
    ),
  ]);

// ---------- Ring light ----------
const ringGlow = (id, cx, cy, r) => [
  E(
    `${id}glow`,
    cx - r,
    cy - r,
    2 * r,
    2 * r,
    glow(0.5, 0.5, 0.5, [0, '$n2'], [0.6, '$n2'], [0.66, '$g2'], [0.715, '$g1'], [0.755, '$g1'], [0.84, '$g2'], [1, '$night']),
  ),
  { ...A(`${id}tube`, circle(cx, cy, r * 0.735), stroke('$g0', r * 0.045), VW, VH) },
];

// ---------- Star wheel ----------
function wheel(cx, cy, r0, r1, r2) {
  let spokes = '';
  let ticks = '';
  for (let i = 0; i < 12; i++) spokes += line([turn([cx, cy - r2], i * 30, [cx, cy]), turn([cx, cy - r1], i * 30, [cx, cy])]);
  for (let i = 0; i < 72; i++) ticks += line([turn([cx, cy - r1], i * 5, [cx, cy]), turn([cx, cy - r1 - (i % 6 ? 1 : 2), ], i * 5, [cx, cy])]); // prettier-ignore
  return [
    A('rings', circle(cx, cy, r0) + circle(cx, cy, r2), stroke('$gold', 0.26)),
    A('ringfine', circle(cx, cy, r1) + circle(cx, cy, r0 + 0.9), stroke('$gold', 0.12)),
    A('spokes', spokes + ticks, stroke('$gold', 0.13, { cap: 'butt' })),
    A('orbit', circle(cx, cy, (r1 + r2) / 2), stroke('$gold', 0.12, { dash: [0.5, 0.9], cap: 'butt' })),
  ];
}
function stars(seed, count, ok, id = 'stars') {
  const r = rng(seed);
  let dim = '';
  let bright = '';
  let made = 0;
  for (let guard = 0; made < count && guard < 4000; guard++) {
    const x = r() * 92 - 2;
    const y = r() * 54 - 2;
    const size = 0.1 + r() * r() * 0.34;
    if (!ok(x, y)) continue;
    if (size > 0.24) bright += circle(x, y, size);
    else dim += circle(x, y, size);
    made++;
  }
  return [A(`${id}dim`, dim, { fill: '$star', opacity: 0.55 }), A(`${id}bright`, bright, { fill: '$star' })];
}
function crescent(cx, cy, r) {
  // A circle with a smaller circle bitten out of its left side.
  const q = r * 0.84;
  const d = r * 0.38;
  const x = (q * q - r * r - d * d) / (2 * d);
  const y = Math.sqrt(r * r - x * x);
  return `M${n(cx + x)} ${n(cy - y)}A${r} ${r} 0 1 1 ${n(cx + x)} ${n(cy + y)}A${n(q)} ${n(q)} 0 1 0 ${n(cx + x)} ${n(cy - y)}Z`;
}

// ---------- Cricket ball ----------
function seam(cx, cy, r, deg) {
  const row = (k) => {
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = -r * 0.985 + (2 * r * 0.985 * i) / 30;
      pts.push(turn([cx + k * Math.sqrt(Math.max(0, r * r - t * t)), cy + t], deg, [cx, cy]));
    }
    return line(pts);
  };
  return {
    mid: row(-0.035) + row(0.035),
    stitch: [0.085, 0.15, 0.215].map((k) => row(k) + row(-k)).join(''),
  };
}

// ---------- Balloons ----------
function balloon(id, cx, cy, w, h, colour, knot) {
  const by = cy + h / 2;
  return [
    A(
      `${id}string`,
      `M${n(cx)} ${n(by + 1)}C${n(cx)} ${n(by + 7)} ${n(knot[0])} ${n(knot[1] - 9)} ${n(knot[0])} ${n(knot[1])}`,
      stroke('$string', 0.2),
    ),
    A(`${id}knot`, poly([[cx, by - 0.4], [cx - 0.9, by + 1.3], [cx + 0.9, by + 1.3]]), { fill: colour }), // prettier-ignore
    E(id, cx - w / 2, cy - h / 2, w, h, colour),
    E(`${id}shine`, cx - w * 0.32, cy - h * 0.36, w * 0.2, h * 0.3, '#FFFFFF', { opacity: 0.45, rot: 28 }),
  ];
}
function confetti(seed, count, ok) {
  const r = rng(seed);
  const by = ['', '', '', '', ''];
  let made = 0;
  for (let guard = 0; made < count && guard < 4000; guard++) {
    const x = r() * 94 - 3;
    const y = r() * 56 - 3;
    const k = Math.floor(r() * 5);
    const kind = Math.floor(r() * 3);
    const a = r() * 180;
    if (!ok(x, y)) continue;
    if (kind === 0) by[k] += poly([[x - 1, y - 0.38], [x + 1, y - 0.38], [x + 1, y + 0.38], [x - 1, y + 0.38]].map((p) => turn(p, a, [x, y]))); // prettier-ignore
    else if (kind === 1) by[k] += circle(x, y, 0.55);
    else by[k] += poly([[x, y - 0.9], [x + 0.8, y + 0.6], [x - 0.8, y + 0.6]].map((p) => turn(p, a, [x, y]))); // prettier-ignore
    made++;
  }
  return by.map((d, i) => A(`confetti${i}`, d, { fill: `$c${i + 1}` }));
}

// ---------- Pencil ----------
function pencil(id, tip, deg, len, o = {}) {
  const p = (x, y) =>
    turn([tip[0] + x, tip[1] + y], deg, tip)
      .map(n)
      .join(' ');
  const hw = 3.4;
  const cone = 10.5;
  const lead = 3.1;
  const lw = (hw * lead) / (cone + 1.4);
  const third = (2 * hw) / 3;
  const tones = o.flip ? ['$p3', '$p2', '$p1'] : ['$p1', '$p2', '$p3'];
  const out = [
    A(`${id}wood`, `M${p(lead, -lw)}L${p(cone + 1.4, -hw)}L${p(cone + 1.4, hw)}L${p(lead, lw)}Z`, { fill: '$wood' }),
    A(`${id}lead`, `M${p(0, 0)}L${p(lead, -lw)}L${p(lead, lw)}Z`, { fill: '$lead' }),
    ...tones.map((c, i) => {
      const y0 = -hw + i * third;
      const y1 = y0 + third;
      return A(`${id}s${i}`, `M${p(cone + 1.4, y0)}Q${p(cone - 1.3, (y0 + y1) / 2)} ${p(cone + 1.4, y1)}L${p(len, y1)}L${p(len, y0)}Z`, {
        fill: c,
      });
    }),
  ];
  if (o.end)
    out.push(
      A(`${id}ferrule`, `M${p(len, -hw)}L${p(len + 5, -hw)}L${p(len + 5, hw)}L${p(len, hw)}Z`, { fill: '$metal' }),
      A(
        `${id}ridges`,
        [1.3, 2.5, 3.7].map((x) => `M${p(len + x, -hw)}L${p(len + x, hw)}`).join(''),
        stroke('$lead', 0.18, { opacity: 0.4, cap: 'butt' }),
      ),
      A(`${id}rubber`, `M${p(len + 5, -hw)}L${p(len + 9.5, -hw)}A${hw} ${hw} 0 0 1 ${p(len + 9.5, hw)}L${p(len + 5, hw)}Z`, {
        fill: '$rubber',
      }),
    );
  return out;
}
const star5 = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) pts.push(turn([cx, cy - (i % 2 ? r * 0.45 : r)], i * 36, [cx, cy]));
  return poly(pts);
};

// ---------- Dog and cat ----------
function paw(id, cx, cy, s, deg) {
  const p = (x, y) => turn([cx + x * s, cy + y * s], deg, [cx, cy]);
  const toes = [
    [-1.7, -0.9],
    [-0.6, -1.9],
    [0.6, -1.9],
    [1.7, -0.9],
  ]
    .map(([x, y]) => circle(...p(x, y), 0.62 * s))
    .join('');
  const [px, py] = p(0, 0.5);
  return A(id, toes + circle(px, py, 1.25 * s), { fill: '$paw' });
}
function dog(cx, cy) {
  const X = (v) => n(cx + v);
  const Y = (v) => n(cy + v);
  return [
    A(
      'body',
      `M${X(-12.5)} ${Y(24)}C${X(-12.5)} ${Y(13)} ${X(-8)} ${Y(9.5)} ${X(0)} ${Y(9.5)}C${X(8)} ${Y(9.5)} ${X(12.5)} ${Y(13)} ${X(12.5)} ${Y(24)}Z`,
      { fill: '$fur' },
    ),
    A(
      'collar',
      `M${X(-8.4)} ${Y(11.3)}Q${X(0)} ${Y(15.4)} ${X(8.4)} ${Y(11.3)}L${X(8.9)} ${Y(14)}Q${X(0)} ${Y(18.4)} ${X(-8.9)} ${Y(14)}Z`,
      { fill: '$collar' },
    ),
    E('tag', cx - 2.1, cy + 15.6, 4.2, 4.2, '$tag'),
    E('tagshine', cx - 1.2, cy + 16.3, 1.1, 1.1, '#FFFFFF', { opacity: 0.6 }),
    E('earl', cx - 15.6, cy - 8.6, 9.6, 20.5, '$ear', { rot: 16 }),
    E('earr', cx + 6, cy - 8.6, 9.6, 20.5, '$ear', { rot: -16 }),
    E('head', cx - 12.4, cy - 13.4, 24.8, 26.2, '$fur'),
    E('patch', cx - 10.2, cy - 8.6, 8.6, 10.2, '$ear', { rot: -12 }),
    E('muzzle', cx - 6.9, cy + 0.6, 13.8, 11.2, '$muzzle'),
    A('tongue', `M${X(-1.8)} ${Y(7.6)}C${X(-1.8)} ${Y(11.9)} ${X(1.8)} ${Y(11.9)} ${X(1.8)} ${Y(7.6)}Z`, { fill: '$tongue' }),
    A(
      'mouth',
      `M${X(0)} ${Y(5.2)}L${X(0)} ${Y(7)}C${X(-1.2)} ${Y(8.8)} ${X(-3.8)} ${Y(8.6)} ${X(-4.7)} ${Y(6.8)}M${X(0)} ${Y(7)}C${X(1.2)} ${Y(8.8)} ${X(3.8)} ${Y(8.6)} ${X(4.7)} ${Y(6.8)}`,
      stroke('$nose', 0.5),
    ),
    E('nose', cx - 2.5, cy + 2.2, 5, 3.5, '$nose'),
    E('noseshine', cx - 1.3, cy + 2.7, 1.5, 0.8, '#FFFFFF', { opacity: 0.35 }),
    E('eyel', cx - 7.3, cy - 5.2, 3.3, 3.5, '$nose'),
    E('eyer', cx + 4, cy - 5.2, 3.3, 3.5, '$nose'),
    A('eyeshine', circle(cx - 5.2, cy - 4.2, 0.5) + circle(cx + 6.1, cy - 4.2, 0.5), { fill: '#FFFFFF' }),
  ];
}
function cat(cx, cy) {
  const X = (v) => n(cx + v);
  const Y = (v) => n(cy + v);
  return [
    A(
      'catears',
      `M${X(-10.6)} ${Y(-2)}L${X(-9.4)} ${Y(-13)}L${X(-2.2)} ${Y(-8.2)}ZM${X(10.6)} ${Y(-2)}L${X(9.4)} ${Y(-13)}L${X(2.2)} ${Y(-8.2)}Z`,
      { fill: '$cat' },
    ),
    A(
      'catinner',
      `M${X(-8.9)} ${Y(-5.6)}L${X(-8.3)} ${Y(-10.4)}L${X(-5)} ${Y(-8.1)}ZM${X(8.9)} ${Y(-5.6)}L${X(8.3)} ${Y(-10.4)}L${X(5)} ${Y(-8.1)}Z`,
      { fill: '$tongue' },
    ),
    E('cathead', cx - 11.5, cy - 9.6, 23, 21, '$cat'),
    E('cateyel', cx - 6.6, cy - 3.6, 3.6, 4.2, '$eye'),
    E('cateyer', cx + 3, cy - 3.6, 3.6, 4.2, '$eye'),
    A('catpupils', roundRect(cx - 5.2, cy - 3.2, 0.8, 3.4, 0.4) + roundRect(cx + 4.4, cy - 3.2, 0.8, 3.4, 0.4), { fill: '$nose' }),
    A('catnose', poly([[cx - 0.9, cy + 1.6], [cx + 0.9, cy + 1.6], [cx, cy + 2.6]]), { fill: '$tongue' }), // prettier-ignore
    A(
      'whiskers',
      `M${X(-4)} ${Y(2.4)}L${X(-13.5)} ${Y(1.2)}M${X(-4)} ${Y(3.2)}L${X(-13)} ${Y(4.6)}M${X(4)} ${Y(2.4)}L${X(13.5)} ${Y(1.2)}M${X(4)} ${Y(3.2)}L${X(13)} ${Y(4.6)}`,
      stroke('$muzzle', 0.2),
    ),
  ];
}

// ---------- Warli ----------
function figure(x, y, deg, s = 1, arm = 4.1) {
  const p = (px, py) =>
    turn([x + px * s, y + py * s], deg, [x, y])
      .map(n)
      .join(' ');
  const [hx, hy] = turn([x, y - 3.45 * s], deg, [x, y]);
  return {
    fill: `M${p(-1.5, -2.4)}L${p(1.5, -2.4)}L${p(0, 0)}ZM${p(0, 0)}L${p(-1.3, 2.2)}L${p(1.3, 2.2)}Z${circle(hx, hy, 0.82 * s)}`,
    limbs: `M${p(-1.5, -2.4)}L${p(-arm, -1.9)}M${p(1.5, -2.4)}L${p(arm, -1.9)}M${p(-0.7, 2.2)}L${p(-1.2, 3.9)}M${p(0.7, 2.2)}L${p(1.5, 3.6)}`,
  };
}
function warliRing(cx, cy, r, count) {
  let fill = '';
  let limbs = '';
  for (let i = 0; i < count; i++) {
    const a = (360 / count) * i;
    const [x, y] = turn([cx, cy - r], a, [cx, cy]);
    const f = figure(x, y, a, 1, (Math.PI * (r + 2.2)) / count);
    fill += f.fill;
    limbs += f.limbs;
  }
  let rays = '';
  for (let i = 0; i < 12; i++) rays += line([turn([cx, cy - 3.4], i * 30, [cx, cy]), turn([cx, cy - 4.9], i * 30, [cx, cy])]);
  return [
    A('dancers', fill, { fill: '$chalk' }),
    A('limbs', limbs + rays + circle(cx, cy, 2.4), stroke('$chalk', 0.32)),
    E('sundot', cx - 0.7, cy - 0.7, 1.4, 1.4, '$chalk'),
  ];
}
function warliRow(y, x0, x1, pitch) {
  let fill = '';
  let limbs = '';
  for (let x = x0, i = 0; x <= x1; x += pitch, i++) {
    const f = figure(x, y + (i % 2 ? 0.35 : 0), 0, 0.95, pitch / 2 / 0.95);
    fill += f.fill;
    limbs += f.limbs;
  }
  return [A('rowfill', fill, { fill: '$chalk' }), A('rowlimbs', limbs, stroke('$chalk', 0.32))];
}
function warliEdges() {
  let t = '';
  for (let x = -1.5; x < W + 3; x += 3) {
    t += poly([[x, 2.4], [x + 3, 2.4], [x + 1.5, 4.5]]); // prettier-ignore
    t += poly([[x, H - 2.4], [x + 3, H - 2.4], [x + 1.5, H - 4.5]]); // prettier-ignore
  }
  return [
    A('teeth', t, { fill: '$chalk' }),
    LN('edgetop', -B, 2.4, W + 2 * B, '$chalk', 0.3),
    LN('edgebottom', -B, H - 2.4, W + 2 * B, '$chalk', 0.3),
  ];
}

// ---------- Paithani ----------
function zari(top) {
  const y = (v) => (top ? v : H - v);
  const k = top ? 't' : 'b';
  let diamonds = '';
  let gems = '';
  let pips = '';
  let kath = '';
  for (let x = 1.2; x < W + 3; x += 5.2) {
    diamonds += poly([[x, y(0.75)], [x + 1.7, y(2.1)], [x, y(3.45)], [x - 1.7, y(2.1)]]); // prettier-ignore
    gems += circle(x, y(2.1), 0.46);
    pips += circle(x + 2.6, y(2.1), 0.32);
  }
  for (let x = -1.5; x < W + 3; x += 2.6) kath += poly([[x, y(4.15)], [x + 2.6, y(4.15)], [x + 1.3, y(6.1)]]); // prettier-ignore
  return [
    R(`band${k}`, -B, top ? -B : H - 4.2, W + 2 * B, 4.2 + B, '$zari'),
    A(`kath${k}`, kath, { fill: '$zari' }),
    LN(`rule${k}a`, -B, y(0.36), W + 2 * B, '$zari2', 0.18),
    LN(`rule${k}b`, -B, y(3.84), W + 2 * B, '$zari2', 0.18),
    A(`dia${k}`, diamonds + pips, { fill: '$silk1' }),
    A(`gem${k}`, gems, { fill: '$e2' }),
  ];
}
function peacock(cx, cy) {
  const base = [cx, cy + 7.5];
  const feather = (deg, len, wide) => {
    const p = (x, y) =>
      turn([base[0] + x, base[1] + y], deg, base)
        .map(n)
        .join(' ');
    return `M${p(0, 0)}C${p(-wide * 0.6, -len * 0.38)} ${p(-wide, -len * 0.74)} ${p(0, -len)}C${p(wide, -len * 0.74)} ${p(wide * 0.6, -len * 0.38)} ${p(0, 0)}Z`;
  };
  const long = [-78, -52, -26, 0, 26, 52, 78];
  const short = [-65, -39, -13, 13, 39, 65];
  const eyes = long.map((a) => turn([base[0], base[1] - 12.2], a, base));
  return [
    A('fanback', short.map((a) => feather(a, 12.4, 2)).join(''), { fill: '$zari2' }),
    A('fan', long.map((a) => feather(a, 16, 2.7)).join(''), { fill: '$zari', stroke: '$silk1', sw: 0.16 }),
    A('eyeouter', eyes.map(([x, y]) => circle(x, y, 1.55)).join(''), { fill: '$e1' }),
    A('eyeinner', eyes.map(([x, y]) => circle(x, y, 0.85)).join(''), { fill: '$e2' }),
    A('eyepip', eyes.map(([x, y]) => circle(x, y, 0.3)).join(''), { fill: '$zari' }),
    A(
      'legs',
      `M${n(cx - 1.2)} ${n(cy + 12.4)}L${n(cx - 1.5)} ${n(cy + 15.2)}M${n(cx + 1.2)} ${n(cy + 12.4)}L${n(cx + 1.5)} ${n(cy + 15.2)}`,
      stroke('$zari', 0.3),
    ),
    A(
      'bird',
      `M${n(cx)} ${n(cy + 13)}C${n(cx - 4.8)} ${n(cy + 13)} ${n(cx - 5.6)} ${n(cy + 6.6)} ${n(cx - 2.9)} ${n(cy + 3.4)}C${n(cx - 1.5)} ${n(cy + 1.7)} ${n(cx + 1.5)} ${n(cy + 1.7)} ${n(cx + 2.9)} ${n(cy + 3.4)}C${n(cx + 5.6)} ${n(cy + 6.6)} ${n(cx + 4.8)} ${n(cy + 13)} ${n(cx)} ${n(cy + 13)}Z`,
      { fill: '$e1', stroke: '$zari', sw: 0.26 },
    ),
    A(
      'neck',
      `M${n(cx)} ${n(cy + 3.6)}C${n(cx + 1)} ${n(cy - 0.6)} ${n(cx - 2.8)} ${n(cy - 2.4)} ${n(cx - 2.3)} ${n(cy - 6)}`,
      stroke('$e1', 2.3),
    ),
    E('birdhead', cx - 3.9, cy - 8, 3.3, 3.3, '$e1'),
    A('beak', poly([[cx - 3.6, cy - 7], [cx - 5.9, cy - 6], [cx - 3.5, cy - 5.6]]), { fill: '$zari' }), // prettier-ignore
    E('birdeye', cx - 2.9, cy - 7.1, 0.7, 0.7, '$ink'),
    A(
      'crest',
      `M${n(cx - 2.3)} ${n(cy - 7.9)}L${n(cx - 3.4)} ${n(cy - 10.6)}M${n(cx - 2.1)} ${n(cy - 7.9)}L${n(cx - 1.9)} ${n(cy - 10.9)}M${n(cx - 1.8)} ${n(cy - 7.8)}L${n(cx - 0.4)} ${n(cy - 10.4)}`,
      stroke('$zari', 0.2),
    ),
    A('crestdots', circle(cx - 3.5, cy - 10.9, 0.42) + circle(cx - 1.9, cy - 11.3, 0.42) + circle(cx - 0.3, cy - 10.7, 0.42), {
      fill: '$zari',
    }),
  ];
}

// ---------- Ikat ----------
function ikat(r, cx, cy, a, b, step = 0.55, fuzz = 0.75) {
  let d = '';
  for (let y = -b; y < b - 0.01; y += step) {
    const w = a * (1 - Math.abs(y + step / 2) / b);
    const l = Math.max(0.12, w + (r() - 0.5) * 2 * fuzz);
    const rt = Math.max(0.12, w + (r() - 0.5) * 2 * fuzz);
    d += `M${n(cx - l)} ${n(cy + y)}H${n(cx + rt)}V${n(cy + y + step)}H${n(cx - l)}Z`;
  }
  return d;
}
function ikatPanel() {
  const r = rng(77);
  const layers = ['', '', '', ''];
  for (const cy of [-8.6, 8.4, 25.4, 42.4, 59.4]) {
    [1, 0.72, 0.45, 0.19].forEach((s, i) => {
      layers[i] += ikat(r, 13.5, cy, 12.6 * s, 8.3 * s, 0.55, i === 3 ? 0.35 : 0.75);
    });
  }
  let side = '';
  for (const cy of [-0.1, 16.9, 33.9, 50.9]) side += ikat(r, -1.6, cy, 5.2, 4.4) + ikat(r, 28.6, cy, 5.2, 4.4);
  let fray = '';
  for (let y = -3; y < 54; y += 0.55) fray += `M30.6 ${n(y)}H${n(30.8 + r() * 1.5)}V${n(y + 0.55)}H30.6Z`;
  return [
    R('panel', -B, -B, 33.8, H + 2 * B, '$base'),
    A('ik1', layers[0], { fill: '$c1' }),
    A('ik2', layers[1], { fill: '$c2' }),
    A('ik3', layers[2], { fill: '$base' }),
    A('ik4', layers[3], { fill: '$c1' }),
    A('ikside', side, { fill: '$c2' }),
    R('panelmask', 30.8, -B, 8, H + 2 * B, '$paper'),
    A('fray', fray, { fill: '$base' }),
  ];
}
function ikatBand(y) {
  const r = rng(31);
  const rows = ['', ''];
  for (let x = 1, i = 0; x < W + 4; x += 9.4, i++) rows[i % 2] += ikat(r, x, y, 4.6, 3.3, 0.5, 0.55);
  let core = '';
  for (let x = 1; x < W + 4; x += 9.4) core += ikat(r, x, y, 1.7, 1.2, 0.5, 0.25);
  return [A('band1', rows[0], { fill: '$c1' }), A('band2', rows[1], { fill: '$c2' }), A('bandcore', core, { fill: '$base' })];
}

export const SET_10 = [
  {
    id: 'cassette',
    name: 'Cassette',
    category: 'creative',
    tags: ['music', 'dj', 'producer', 'studio', 'band', 'singer', 'music teacher', 'podcast', 'radio', 'retro', 'tape'],
    fonts: { heading: 'caveat', body: 'outfit' },
    palettes: [
      { label: 'Classic', shell: '#1E1E20', shell2: '#303034', sticker: '#F4EBD8', win: '#101012', tape: '#3A2A20', hub: '#F2F2F2', s1: '#E4572E', s2: '#F2A32C', s3: '#2E86AB', ink: '#1E1E20', soft: '#5F5A50', accent: '#B5390F', mark: '#1E1E20' }, // prettier-ignore
      { label: 'Mint', shell: '#0F4C47', shell2: '#186B64', sticker: '#F3F8F1', win: '#0A2E2B', tape: '#3A2A20', hub: '#F5F5F0', s1: '#F25F5C', s2: '#FFE066', s3: '#70C1B3', ink: '#0E2F2C', soft: '#4E6A66', accent: '#B8382A', mark: '#0E2F2C' }, // prettier-ignore
      { label: 'Bubblegum', shell: '#E85D9A', shell2: '#F286B7', sticker: '#FFFDF8', win: '#3A1228', tape: '#4A2A3A', hub: '#FFFFFF', s1: '#7B2CBF', s2: '#FFD23F', s3: '#3BCEAC', ink: '#3A1228', soft: '#7A5568', accent: '#A4148F', mark: '#3A1228' }, // prettier-ignore
      { label: 'Cobalt', shell: '#1D3FA8', shell2: '#3459CC', sticker: '#F7F6F2', win: '#0D1B4A', tape: '#2B2330', hub: '#FFFFFF', s1: '#FF6B35', s2: '#FFD166', s3: '#06D6A0', ink: '#111B3D', soft: '#55607F', accent: '#C9420D', mark: '#111B3D' }, // prettier-ignore
    ],
    sample: {
      name: 'Kabir Anand',
      title: 'Music Producer and Guitar Tutor',
      company: 'Tape Deck Studio',
      tagline: 'Recording, mixing and lessons',
      phone: '+91 98765 43210',
      email: 'kabir@tapedeck.example',
      website: 'tapedeck.example',
      address: '12th Main, Indiranagar, Bengaluru',
    },
    sides: {
      front: {
        background: '$shell',
        stacks: { who: { x: 9.5, y: 6, w: W - 19, h: 12.6, anchor: 'middle', gap: 0.3 } },
        elements: [
          R('edge', 1.5, 1.5, W - 3, H - 3, 'none', { stroke: '$shell2', sw: 0.3, r: 2.6 }),
          R('label', 5.5, 4.5, W - 11, 31.5, '$sticker', { r: 2 }),
          R('stripe1', 5.5, 21.4, W - 11, 2.8, '$s1'),
          R('stripe2', 5.5, 24.2, W - 11, 2.8, '$s2'),
          R('stripe3', 5.5, 27, W - 11, 2.8, '$s3'),
          R('window', 22.5, 19.4, 43.9, 12.8, '$win', { r: 6.4 }),
          ...reel('reell', 31.4, 25.8, 5.8),
          ...reel('reelr', 57.5, 25.8, 4.3),
          R('peek', 40.6, 23.1, 7.7, 5.4, '$shell2', { r: 0.8 }),
          A('deck', poly([[16.5, H + B], [20.6, 39.4], [W - 20.6, 39.4], [W - 16.5, H + B]]), { fill: '$shell2' }), // prettier-ignore
          A('holes', circle(28.6, 45.2, 1.5) + circle(W - 28.6, 45.2, 1.5) + circle(37.6, 46.4, 1) + circle(W - 37.6, 46.4, 1), {
            fill: '$win',
          }),
          R('pad', W / 2 - 2.4, 42, 4.8, 2.4, '$win', { r: 0.5 }),
          ...screws(),
          T('name', '{name}', 9.5, W - 19, 19, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 11,
            maxLines: 1,
            lineHeight: 1,
          }),
          T('title', '{title}', 9.5, W - 19, 7, { stack: 'who', fill: '$soft', minSize: 6, maxLines: 1 }),
        ],
      },
      back: {
        background: '$sticker',
        stacks: {
          brand: { x: 18.5, y: 5.5, w: 34, h: 10.5, anchor: 'middle', gap: 0.6 },
          reach: { x: 6, y: 19.5, w: 48, h: 18.4, anchor: 'top' },
        },
        elements: [
          R('stripe1', -B, 40.6, W + 2 * B, 2, '$s1'),
          R('stripe2', -B, 42.6, W + 2 * B, 2, '$s2'),
          R('stripe3', -B, 44.6, W + 2 * B, 2, '$s3'),
          LOGO('logo', 6, 5.5, 10.5, '$mark'),
          T('company', '{company}', 18.5, 34, 13.5, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 9,
            maxLines: 2,
            lineHeight: 1,
          }),
          T('tagline', '{tagline}', 18.5, 34, 6.4, { stack: 'brand', fill: '$soft', minSize: 5.6, maxLines: 2, optional: true }),
          reach('reach', 6, 48, { size: 6.6 }),
          QR('qr', W - 32, 6, 26, { r: 1.2 }),
        ],
      },
    },
  },
  {
    id: 'ring-light',
    name: 'Ring Light',
    category: 'creative',
    orientation: 'vertical',
    tags: ['content creator', 'influencer', 'makeup artist', 'photographer', 'videographer', 'youtuber', 'reels', 'model', 'vertical'],
    fonts: { heading: 'syne', body: 'outfit' },
    palettes: [
      { label: 'Warm', night: '#17120E', n2: '#261D15', g0: '#FFFFFF', g1: '#FFE9C2', g2: '#8A6A3F', metal: '#6A5E53', ink: '#FFF6E8', soft: '#C9B9A3', accent: '#FFCF8A', mark: '#FFF6E8' }, // prettier-ignore
      { label: 'Cool', night: '#0B1220', n2: '#141F33', g0: '#FFFFFF', g1: '#D6EBFF', g2: '#3E6A99', metal: '#55627A', ink: '#F1F7FF', soft: '#A9B8CC', accent: '#9CCBFF', mark: '#F1F7FF' }, // prettier-ignore
      { label: 'Blush', night: '#1A0B14', n2: '#2B1321', g0: '#FFFFFF', g1: '#FFD0E4', g2: '#99476E', metal: '#6B4F5D', ink: '#FFF1F6', soft: '#D0AEBD', accent: '#FF9EC4', mark: '#FFF1F6' }, // prettier-ignore
      { label: 'Violet', night: '#120C22', n2: '#1F1539', g0: '#FFFFFF', g1: '#E2D4FF', g2: '#6B4FB3', metal: '#5C5278', ink: '#F6F1FF', soft: '#B9AED3', accent: '#C4A7FF', mark: '#F6F1FF' }, // prettier-ignore
    ],
    sample: {
      name: 'Zoya Khan',
      title: 'Content Creator and Makeup Artist',
      company: 'Zoya Creates',
      tagline: 'Reels, shoots and bridal makeup',
      phone: '+91 98765 43210',
      email: 'hello@zoyacreates.example',
      website: 'zoyacreates.example',
      address: 'Lokhandwala, Andheri West, Mumbai',
    },
    sides: {
      front: {
        background: '$night',
        stacks: {
          who: { x: 5, y: 50.5, w: VW - 10, h: 15.5, anchor: 'middle', gap: 0.8 },
          reach: { x: 4.4, y: 67.2, w: VW - 8.8, h: 17.6, anchor: 'top' },
        },
        elements: [
          ...ringGlow('ring', VW / 2, 21.2, 19.6),
          R('pole', VW / 2 - 0.65, 35.4, 1.3, 9, '$metal'),
          E('mount', VW / 2 - 1.5, 34.6, 3, 3, '$metal'),
          A(
            'legs',
            `M${VW / 2} 44L${VW / 2 - 6.4} 48.4M${VW / 2} 44L${VW / 2 + 6.4} 48.4M${VW / 2} 44L${VW / 2} 49`,
            stroke('$metal', 0.8),
            VW,
            VH,
          ),
          LOGO('logo', VW / 2 - 6.2, 15, 12.4, '$ink'),
          ...who('who', 5, VW - 10, { size: 14, weight: 700, align: 'center' }),
          reach('reach', 4.4, VW - 8.8, { size: 6.2, align: 'center', list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$night',
        stacks: { brand: { x: 6, y: 8, w: VW - 12, h: 22, anchor: 'middle', gap: 1.4 } },
        elements: [
          ...ringGlow('ring', VW / 2, 58, 27),
          ...brand('brand', 6, VW - 12, { size: 15, align: 'center' }).slice(1),
          QR('qr', VW / 2 - 13, 45, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'star-wheel',
    name: 'Star Wheel',
    category: 'professional',
    tags: ['astrologer', 'numerologist', 'tarot', 'vastu', 'healer', 'astronomy', 'planetarium', 'night', 'stars', 'jyotish'],
    fonts: { heading: 'marcellus', body: 'outfit' },
    palettes: [
      {
        label: 'Midnight',
        n1: '#0B1437',
        n2: '#1E2163',
        gold: '#E3C27A',
        star: '#FFFFFF',
        ink: '#F7F1E1',
        soft: '#B9BEDD',
        accent: '#E3C27A',
        mark: '#F7F1E1',
      },
      {
        label: 'Plum',
        n1: '#1E0B33',
        n2: '#4A2163',
        gold: '#F0B9A0',
        star: '#FFFFFF',
        ink: '#FBEFF2',
        soft: '#CDB5D6',
        accent: '#F0B9A0',
        mark: '#FBEFF2',
      },
      {
        label: 'Teal',
        n1: '#052A30',
        n2: '#0E4F54',
        gold: '#D9DEE6',
        star: '#FFFFFF',
        ink: '#EFFAF8',
        soft: '#A7CBC9',
        accent: '#BFE9E2',
        mark: '#EFFAF8',
      },
      {
        label: 'Dawn',
        n1: '#FBF3E4',
        n2: '#F6DFC9',
        gold: '#A8702A',
        star: '#A8702A',
        ink: '#2A2140',
        soft: '#6E6482',
        accent: '#8F5318',
        mark: '#2A2140',
      },
    ],
    sample: {
      name: 'Meenakshi Rao',
      title: 'Astrologer and Numerologist',
      company: 'Nakshatra Guidance',
      tagline: 'Kundli, numerology and vastu',
      phone: '+91 98765 43210',
      email: 'meenakshi@nakshatraguidance.example',
      website: 'nakshatraguidance.example',
      address: '4th Block, Jayanagar, Bengaluru',
    },
    sides: {
      front: {
        background: grad(60, '$n1', '$n2'),
        stacks: {
          who: { x: 6, y: 6.5, w: 48, h: 19, anchor: 'top', gap: 0.9 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          ...stars(5, 46, (x, y) => x > 56 && Math.hypot(x - 86, y - 25.4) > 9.5),
          ...wheel(86, 25.4, 25, 21, 9),
          A('moon', crescent(86, 25.4, 5), { fill: '$gold' }),
          A('planets', [[-62, 15], [-118, 15], [-150, 15], [-90, 23], [-38, 23], [-165, 23]].map(([a, r]) => circle(...turn([86, 25.4 - r], a + 90, [86, 25.4]), r > 20 ? 0.7 : 0.55)).join(''), { fill: '$gold' }), // prettier-ignore
          A('sparks', sparkle(60.5, 8.5, 1.9) + sparkle(63.2, 43.8, 1.3) + sparkle(57.6, 30, 0.9), { fill: '$gold' }),
          ...who('who', 6, 48, { size: 15.5, weight: 400 }),
          reach('reach', 6, 48, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: grad(60, '$n1', '$n2'),
        stacks: { brand: { x: 6, y: 8, w: 40, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [
          ...stars(9, 30, (x, y) => (x > 49 && Math.hypot(x - 67, y - 25.4) > 23.5) || (x < 46 && (y < 6 || y > 45))),
          A('rings', circle(67, 25.4, 20.4), stroke('$gold', 0.26)),
          A('ringfine', circle(67, 25.4, 22.6), stroke('$gold', 0.12, { dash: [0.5, 0.9], cap: 'butt' })),
          A('sparks', sparkle(48.5, 8, 1.5) + sparkle(86, 46.5, 1.2), { fill: '$gold' }),
          ...brand('brand', 6, 40, { size: 14.5, weight: 400 }),
          QR('qr', 54, H / 2 - 13, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'cricket-seam',
    name: 'Leather Ball',
    category: 'bold',
    tags: ['cricket', 'academy', 'coach', 'sports', 'sports shop', 'turf', 'club', 'tournament', 'umpire', 'box cricket'],
    fonts: { heading: 'anton', body: 'manrope' },
    palettes: [
      {
        label: 'Test',
        field: '#14532D',
        deep: '#0C3A1F',
        b1: '#F87171',
        b2: '#B91C1C',
        b3: '#6B0F0F',
        stitch: '#FDF3DC',
        ink: '#FFFFFF',
        soft: '#CFE5D6',
        accent: '#FACC15',
        mark: '#FFFFFF',
      },
      { label: 'Day-night', field: '#1F2329', deep: '#14171B', b1: '#FDB5CF', b2: '#EC4899', b3: '#9D174D', stitch: '#16181C', ink: '#FFFFFF', soft: '#C4C9D1', accent: '#F9A8D4', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'One-day', field: '#14275A', deep: '#0C1B42', b1: '#FFFFFF', b2: '#E6E7EC', b3: '#A4A9B6', stitch: '#2F8F5B', ink: '#FFFFFF', soft: '#C2CAE0', accent: '#FDE047', mark: '#FFFFFF' }, // prettier-ignore
      {
        label: 'Club',
        field: '#F5EFE0',
        deep: '#7F1D1D',
        b1: '#F87171',
        b2: '#B91C1C',
        b3: '#6B0F0F',
        stitch: '#FDF3DC',
        ink: '#1F1A14',
        soft: '#6B6355',
        accent: '#B91C1C',
        mark: '#FFF7E8',
      },
    ],
    sample: {
      name: 'Arjun Bhatt',
      title: 'Head Coach',
      company: 'Cover Drive Cricket Academy',
      tagline: 'Coaching for ages 6 to 19',
      phone: '+91 98765 43210',
      email: 'arjun@coverdrive.example',
      website: 'coverdrive.example',
      address: 'Shivaji Park, Dadar, Mumbai',
    },
    sides: {
      front: {
        background: '$field',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          E('ball', 54.5, 6.5, 47, 47, glow(0.32, 0.26, 0.8, '$b1', '$b2', '$b3')),
          A('seammid', seam(78, 30, 23.5, 33).mid, stroke('$b3', 0.26, { cap: 'butt' })),
          A('stitches', seam(78, 30, 23.5, 33).stitch, stroke('$stitch', 0.5, { dash: [1, 0.85], cap: 'butt' })),
          E('shine', 60.5, 12.5, 9, 5.4, '#FFFFFF', { opacity: 0.22, rot: -38 }),
          ...who('who', 6, 47, { size: 17, weight: 400, name: { upper: true, lineHeight: 1.05 }, company: { weight: 700 } }),
          reach('reach', 6, 48, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 6, w: 46, h: 31, anchor: 'middle', gap: 1.5 } },
        elements: [
          LN('seammid1', -B, 44.6, W + 2 * B, '$b2', 0.3),
          LN('seammid2', -B, 45.4, W + 2 * B, '$b2', 0.3),
          A(
            'stitches',
            [42.2, 43.4, 46.6, 47.8].map((y) => `M-3 ${y}H92`).join(''),
            stroke('$stitch', 0.5, { dash: [1, 0.85], cap: 'butt' }),
          ),
          ...brand('brand', 6, 46, { size: 15.5, weight: 400 }),
          QR('qr', W - 32, 6, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'balloons',
    name: 'Balloons',
    category: 'playful',
    tags: ['event planner', 'party', 'birthday', 'balloon decoration', 'decorator', 'kids', 'gift shop', 'baby shower', 'celebration'],
    fonts: { heading: 'baloo2', body: 'outfit' },
    palettes: [
      { label: 'Party', paper: '#FFF9F0', deep: '#2B1B4B', c1: '#FF5A5F', c2: '#FFB400', c3: '#00A699', c4: '#7B61FF', c5: '#FF8FB1', string: '#8B8378', ink: '#2B1B4B', soft: '#6E6485', accent: '#D9363E', mark: '#FFF9F0' }, // prettier-ignore
      { label: 'Candy', paper: '#FFF5F8', deep: '#5B1A45', c1: '#FF7AA2', c2: '#FFC75F', c3: '#9B5DE5', c4: '#00C2A8', c5: '#F15BB5', string: '#A08A93', ink: '#4A1238', soft: '#7F5F74', accent: '#C2255C', mark: '#FFF5F8' }, // prettier-ignore
      { label: 'Ocean', paper: '#F3FAFD', deep: '#0E3A5B', c1: '#1FA2FF', c2: '#12D8FA', c3: '#7AE582', c4: '#FFD166', c5: '#5E60CE', string: '#7F8C99', ink: '#0F2F4A', soft: '#57708A', accent: '#1272C4', mark: '#F3FAFD' }, // prettier-ignore
      { label: 'Sunset', paper: '#FFF8EE', deep: '#4A1D0F', c1: '#F9844A', c2: '#F9C74F', c3: '#F94144', c4: '#90BE6D', c5: '#F8961E', string: '#9A8872', ink: '#40200F', soft: '#7B604C', accent: '#C2410C', mark: '#FFF8EE' }, // prettier-ignore
    ],
    sample: {
      name: 'Tanvi Shah',
      title: 'Party Planner',
      company: 'Pop & Confetti Events',
      tagline: 'Birthdays, baby showers and balloon decor',
      phone: '+91 98765 43210',
      email: 'tanvi@popandconfetti.example',
      website: 'popandconfetti.example',
      address: 'Satellite Road, Ahmedabad',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 48, h: 20, anchor: 'top', gap: 0.7 },
          reach: { x: 6, y: 27.5, w: 49, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          ...confetti(8, 26, (x, y) => x > 57 && (y < 5 || y > 34 || x > 86 || x < 60)),
          ...balloon('b1', 63.6, 17.5, 10, 12.4, '$c3', [74.5, 44]),
          ...balloon('b2', 85, 18.5, 10.4, 12.8, '$c5', [74.5, 44]),
          ...balloon('b3', 74.2, 11.4, 12, 14.8, '$c2', [74.5, 44]),
          ...balloon('b4', 68.2, 25.6, 11, 13.6, '$c1', [74.5, 44]),
          ...balloon('b5', 80.4, 26.6, 11.4, 14, '$c4', [74.5, 44]),
          A('tail', 'M74.5 44C74 47.5 75.4 50 74.6 54', stroke('$string', 0.2)),
          A('bow', 'M74.5 44C72.4 42.6 71.4 44.6 74.5 44C77.6 44.6 76.6 42.6 74.5 44', stroke('$string', 0.3)),
          ...shop('who', 6, 48, { size: 15.5, weight: 800 }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 7, w: 46, h: 31, anchor: 'middle', gap: 1.5 } },
        elements: [
          ...confetti(3, 46, (x, y) => y > 41 || y < 3.6 || (x > 86.6 && y > 34)),
          ...brand('brand', 6, 46, { size: 15, weight: 800 }),
          QR('qr', W - 32, 7, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'sharp-pencil',
    name: 'Sharp Pencil',
    category: 'playful',
    tags: ['tuition', 'classes', 'coaching', 'teacher', 'school', 'preschool', 'stationery', 'writer', 'tutor', 'art class', 'education'],
    fonts: { heading: 'bricolage', body: 'outfit' },
    palettes: [
      { label: 'Classic', paper: '#FFFBEF', deep: '#22313F', p1: '#FFE680', p2: '#FFC83D', p3: '#E9A820', wood: '#F2D2A2', lead: '#2B2B2B', metal: '#B8BEC6', rubber: '#F28B9B', ink: '#22313F', soft: '#5E6B78', accent: '#C2410C', mark: '#FFFBEF' }, // prettier-ignore
      { label: 'Red', paper: '#FFF7F4', deep: '#3A1E22', p1: '#FF9A8B', p2: '#EF5B4C', p3: '#C93F33', wood: '#F2D2A2', lead: '#2B2B2B', metal: '#B8BEC6', rubber: '#F7C6A3', ink: '#3A1E22', soft: '#7A5E60', accent: '#B8322A', mark: '#FFF7F4' }, // prettier-ignore
      { label: 'Blue', paper: '#F4F8FE', deep: '#17284A', p1: '#8CBEFF', p2: '#3D8BFF', p3: '#1F68D9', wood: '#F2D2A2', lead: '#2B2B2B', metal: '#B8BEC6', rubber: '#F28B9B', ink: '#17284A', soft: '#5A6A88', accent: '#1F5FC4', mark: '#F4F8FE' }, // prettier-ignore
      { label: 'Green', paper: '#F5FAF2', deep: '#1D3524', p1: '#9BE096', p2: '#4FBF5B', p3: '#2E9A45', wood: '#F2D2A2', lead: '#2B2B2B', metal: '#B8BEC6', rubber: '#F28B9B', ink: '#1D3524', soft: '#5C7262', accent: '#257A36', mark: '#F5FAF2' }, // prettier-ignore
    ],
    sample: {
      name: 'Shruti Kulkarni',
      title: 'Founder and Maths Teacher',
      company: 'Bright Minds Tuition Classes',
      tagline: 'Std 5 to 10, all boards',
      phone: '+91 98765 43210',
      email: 'shruti@brightminds.example',
      website: 'brightminds.example',
      address: 'Paud Road, Kothrud, Pune',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 48, h: 20, anchor: 'top', gap: 0.7 },
          reach: { x: 6, y: 27.5, w: 49, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          A(
            'scribble',
            'M61.5 43.6C64.6 47 70.4 47.6 74.4 45.4C77.4 43.8 76.6 41.2 74.5 41.9C72.2 42.7 73.6 46.6 78 46.9C81.4 47.1 84.4 45.9 86.6 44.4',
            stroke('$lead', 0.42),
          ),
          A('doodles', star5(64.4, 12.4, 3.1) + circle(84.6, 33.5, 1.5), stroke('$lead', 0.32)),
          A('dashes', 'M60.4 21.5L62.6 22.3M59.6 24.8L62 24.9M60.2 28.2L62.5 27.5', stroke('$lead', 0.32)),
          ...pencil('pen', [61.5, 43.6], -54, 66),
          ...shop('who', 6, 48, { size: 15, weight: 800 }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 5.5, w: 46, h: 31, anchor: 'middle', gap: 1.4 } },
        elements: [
          ...pencil('pen', [84.5, 43.6], 180, 68, { end: true, flip: true }),
          ...brand('brand', 6, 46, { size: 14.5, weight: 800 }),
          QR('qr', W - 32, 5.5, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'good-boy',
    name: 'Good Boy',
    category: 'playful',
    tags: ['pet shop', 'vet', 'veterinary', 'dog', 'cat', 'groomer', 'pet boarding', 'trainer', 'kennel', 'pet food', 'animal clinic'],
    fonts: { heading: 'fraunces', body: 'outfit' },
    palettes: [
      { label: 'Sunny', bg: '#FFD86B', deep: '#3B2A1A', fur: '#C98B4E', ear: '#8A5529', muzzle: '#FFF6E9', nose: '#2B1D14', tongue: '#F2748B', collar: '#D7263D', tag: '#FFF1B8', paw: '#F5C449', cat: '#8D99AE', eye: '#C7F09A', ink: '#2B1D14', soft: '#6B5338', accent: '#A8231C', mark: '#FFF6E9' }, // prettier-ignore
      { label: 'Sky', bg: '#BFE3FF', deep: '#12324F', fur: '#F2E3CC', ear: '#D2AE7E', muzzle: '#FFFFFF', nose: '#2A2622', tongue: '#F2748B', collar: '#1D4ED8', tag: '#FFD23F', paw: '#A3D2F7', cat: '#F4A259', eye: '#D4F77A', ink: '#12324F', soft: '#44627F', accent: '#1D4ED8', mark: '#F4FAFF' }, // prettier-ignore
      { label: 'Mint', bg: '#C9F0DE', deep: '#173F35', fur: '#6B4A3A', ear: '#4A3126', muzzle: '#E8D5C4', nose: '#1F1512', tongue: '#F2748B', collar: '#F59E0B', tag: '#F4F4F5', paw: '#A9E0C8', cat: '#3A3A40', eye: '#FDE047', ink: '#173F35', soft: '#4A6B61', accent: '#A84E08', mark: '#F1FBF6' }, // prettier-ignore
      { label: 'Peach', bg: '#FFD9C7', deep: '#4A2018', fur: '#FBF7F2', ear: '#B9B3AB', muzzle: '#FFFFFF', nose: '#2B2523', tongue: '#F2748B', collar: '#7C3AED', tag: '#FFD23F', paw: '#F8C3AC', cat: '#D98C5F', eye: '#C7F09A', ink: '#4A2018', soft: '#7B5248', accent: '#6D28D9', mark: '#FFF4EE' }, // prettier-ignore
    ],
    sample: {
      name: 'Ritu Malhotra',
      title: 'Groomer and Owner',
      company: 'Wag & Whiskers',
      tagline: 'Grooming, boarding and pet supplies',
      phone: '+91 98765 43210',
      email: 'woof@wagandwhiskers.example',
      website: 'wagandwhiskers.example',
      address: 'Sector 50 Market, Noida',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          paw('paw1', 60, 8.6, 1.05, -24),
          paw('paw2', 84.4, 7.4, 0.8, 18),
          ...dog(72.5, 28.2),
          ...shop('who', 6, 47, { size: 16.5, weight: 800 }),
          reach('reach', 6, 48, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [...cat(72.5, 47.2), ...brand('brand', 6, 46, { size: 16, weight: 800 }), QR('qr', W - 32, 4.6, 26, { r: 1.6 })],
      },
    },
  },
  {
    id: 'warli-dance',
    name: 'Warli Dance',
    category: 'marathi',
    lang: 'mr',
    tags: ['marathi', 'handicraft', 'handmade', 'art', 'gifts', 'home decor', 'resort', 'agro tourism', 'ngo', 'warli', 'devanagari'],
    fonts: { heading: 'rozha', body: 'notosansdeva' },
    palettes: [
      {
        label: 'Geru',
        mud: '#8F3B1F',
        chalk: '#FFF6E6',
        haldi: '#FFC94A',
        ink: '#FFF6E6',
        soft: '#F2D5BF',
        accent: '#FFC94A',
        mark: '#FFF6E6',
      },
      {
        label: 'Shen',
        mud: '#4E5A2C',
        chalk: '#FBF6E3',
        haldi: '#F6D365',
        ink: '#FBF6E3',
        soft: '#DDE0C0',
        accent: '#F6D365',
        mark: '#FBF6E3',
      },
      {
        label: 'Kajal',
        mud: '#1F1B18',
        chalk: '#FFF9EE',
        haldi: '#F2A65A',
        ink: '#FFF9EE',
        soft: '#CFC6B8',
        accent: '#F2A65A',
        mark: '#FFF9EE',
      },
      {
        label: 'Haldi',
        mud: '#F6E2B3',
        chalk: '#7A2E12',
        haldi: '#A8401A',
        ink: '#4A1D0C',
        soft: '#7C4A30',
        accent: '#A8401A',
        mark: '#4A1D0C',
      },
    ],
    sample: {
      name: 'वैशाली पाटील',
      title: 'संचालिका',
      company: 'माती हस्तकला',
      tagline: 'हाताने घडवलेल्या भेटवस्तू',
      phone: '+91 98765 43210',
      email: 'namaste@matihastakala.example',
      website: 'matihastakala.example',
      address: 'लक्ष्मी रोड, पुणे',
    },
    sides: {
      front: {
        background: '$mud',
        stacks: {
          who: { x: 6, y: 7.5, w: 46, h: 17, anchor: 'top', gap: 0.6 },
          reach: { x: 6, y: 26, w: 47, h: 17.4, anchor: 'bottom' },
        },
        elements: [
          ...warliEdges(),
          ...warliRing(70.6, 25.4, 12.6, 12),
          ...shop('who', 6, 46, { size: 15, weight: 400, small: 7.2 }),
          reach('reach', 6, 47, { size: 6.4, accent: '$haldi', list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$mud',
        stacks: { brand: { x: 6, y: 7.5, w: 46, h: 26, anchor: 'middle', gap: 1.2 } },
        elements: [
          ...warliEdges(),
          ...warliRow(39.2, 7.5, 82, 6.2),
          ...brand('brand', 6, 46, { size: 15, weight: 400, logo: 10.5, soft: '$soft' }),
          QR('qr', W - 31.5, 7.3, 25.5, { r: 1.2 }),
        ],
      },
    },
  },
  {
    id: 'paithani-mor',
    name: 'Paithani',
    category: 'marathi',
    lang: 'mr',
    tags: [
      'marathi',
      'saree',
      'paithani',
      'silk',
      'boutique',
      'wedding',
      'jeweller',
      'mangal karyalay',
      'caterer',
      'traditional',
      'devanagari',
    ],
    fonts: { heading: 'tiro', body: 'notosansdeva' },
    palettes: [
      { label: 'Jambhla', silk1: '#4A1259', silk2: '#8E1E6B', zari: '#E8C26A', zari2: '#B98F3A', e1: '#0E8C7A', e2: '#F2545B', ink: '#FFF3DA', soft: '#EBCFE0', accent: '#F4D58D', mark: '#FFF3DA' }, // prettier-ignore
      { label: 'Morpankhi', silk1: '#0B3C5D', silk2: '#0E7C7B', zari: '#EBCB7A', zari2: '#BC963F', e1: '#B5179E', e2: '#FFD166', ink: '#FFF6E0', soft: '#CFE6E6', accent: '#F6DC9A', mark: '#FFF6E0' }, // prettier-ignore
      { label: 'Rani', silk1: '#A50E55', silk2: '#DD3F77', zari: '#F3D27A', zari2: '#C59A3D', e1: '#1B7F5C', e2: '#2F4BC7', ink: '#FFF6E3', soft: '#FBD9E5', accent: '#FBE3A2', mark: '#FFF6E3' }, // prettier-ignore
      { label: 'Hirva', silk1: '#0F4D2E', silk2: '#2A8239', zari: '#EFCF7C', zari2: '#BF9A40', e1: '#B3123F', e2: '#F2A007', ink: '#FFF7E0', soft: '#D5ECD3', accent: '#F7E09F', mark: '#FFF7E0' }, // prettier-ignore
    ],
    sample: {
      name: 'मीनल जोशी',
      title: 'संचालिका',
      company: 'मीनल पैठणी',
      tagline: 'येवला पैठणी आणि रेशमी साड्या',
      phone: '+91 98765 43210',
      email: 'minal@minalpaithani.example',
      website: 'minalpaithani.example',
      address: 'तुळशीबाग, पुणे',
    },
    sides: {
      front: {
        background: grad(100, '$silk1', '$silk2'),
        stacks: {
          who: { x: 6, y: 9, w: 46, h: 16, anchor: 'top', gap: 0.6 },
          reach: { x: 6, y: 26, w: 47, h: 15.8, anchor: 'bottom' },
        },
        elements: [
          ...zari(true),
          ...zari(false),
          ...peacock(71.5, 25.8),
          ...shop('who', 6, 46, { size: 15, weight: 400, small: 7.2 }),
          reach('reach', 6, 47, { size: 6.3, list: { icons: false, rowHeight: 1.55 } }),
        ],
      },
      back: {
        background: grad(100, '$silk1', '$silk2'),
        stacks: { brand: { x: 6, y: 9, w: 46, h: 32.8, anchor: 'middle', gap: 1.3 } },
        elements: [
          ...zari(true),
          ...zari(false),
          ...brand('brand', 6, 46, { size: 15, weight: 400, logo: 10.5, soft: '$soft' }),
          QR('qr', W - 31.5, H / 2 - 12.75, 25.5, { r: 1.2 }),
        ],
      },
    },
  },
  {
    id: 'ikat-weave',
    name: 'Ikat',
    category: 'traditional',
    tags: ['handloom', 'saree', 'textile', 'boutique', 'fabric', 'home decor', 'handicraft', 'export', 'weaver', 'ikat', 'pochampally'],
    fonts: { heading: 'lora', body: 'outfit' },
    palettes: [
      {
        label: 'Indigo',
        paper: '#FBF6EA',
        base: '#1F2A5C',
        c1: '#FBF6EA',
        c2: '#C8352B',
        ink: '#1D2347',
        soft: '#5A5F7D',
        accent: '#B32D24',
        mark: '#FBF6EA',
      },
      {
        label: 'Madder',
        paper: '#FBF3E6',
        base: '#9C2B1F',
        c1: '#FBF3E6',
        c2: '#1E1A17',
        ink: '#3A1611',
        soft: '#77534C',
        accent: '#9C2B1F',
        mark: '#FBF3E6',
      },
      {
        label: 'Turmeric',
        paper: '#FFF8E4',
        base: '#C9860B',
        c1: '#FFF8E4',
        c2: '#7A1F2B',
        ink: '#3B2A08',
        soft: '#77633A',
        accent: '#7A1F2B',
        mark: '#2E1F05',
      },
      {
        label: 'Leaf',
        paper: '#F7F6E9',
        base: '#1E4D3A',
        c1: '#F7F6E9',
        c2: '#E4683C',
        ink: '#173326',
        soft: '#56705F',
        accent: '#C24E22',
        mark: '#F7F6E9',
      },
    ],
    sample: {
      name: 'Sarita Reddy',
      title: 'Proprietor',
      company: 'Tana Bana Handlooms',
      tagline: 'Ikat sarees and dress material',
      phone: '+91 98765 43210',
      email: 'sarita@tanabana.example',
      website: 'tanabana.example',
      address: 'Tilak Road, Abids, Hyderabad',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 36.5, y: 6, w: 47.4, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 36.5, y: 27.5, w: 47.4, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          ...ikatPanel(),
          ...shop('who', 36.5, 47.4, { size: 15, weight: 700 }),
          reach('reach', 36.5, 47.4, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$base',
        stacks: { brand: { x: 6, y: 5.5, w: 46, h: 31, anchor: 'middle', gap: 1.4 } },
        elements: [...ikatBand(43.4), ...brand('brand', 6, 46, { size: 15 }), QR('qr', W - 32, 5.5, 26, { r: 1.2 })],
      },
    },
  },
];
