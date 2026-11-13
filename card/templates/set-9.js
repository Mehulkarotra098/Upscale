// Illustrated cards, part one. Each is built around one drawn picture: waves of light, a stack of cubes, a glass orb,
// a flower in one line, a marble slab, deco fans, a capsule, spectacles, a cup of coffee and an aeroplane window.
import { A, B, E, H, LN, QR, R, W } from './kit.js';
import {
  brand,
  circle,
  glow,
  grad,
  line,
  n,
  P,
  poly,
  reach,
  rng,
  roundRect,
  shop,
  smooth,
  sparkle,
  stroke,
  turn,
  VH,
  VW,
  who,
} from './blocks.js';

// ---------- Aurora: bands of light ----------
const waves = (tops) =>
  tops.flatMap((top, i) => [
    A(`wave${i}`, `${top}L92 54L-3 54Z`, { fill: grad(70, `$w${i + 1}a`, `$w${i + 1}b`) }),
    A(`glint${i}`, top, stroke('$glint', 0.18, { opacity: 0.5 })),
  ]);
const AURORA_FRONT = [
  'M-3 43.5C16 39.5 34 47.5 52 41C66 36 76 14 92 6',
  'M-3 46.5C18 43 38 50 56 44.5C70 40 80 24 92 17',
  'M-3 49.5C20 46.5 42 52 60 47.5C73 44 83 35 92 29',
];
const AURORA_BACK = [
  'M-3 41C18 36.5 36 46 56 40.5C70 36.5 80 38.5 92 35',
  'M-3 44.5C20 40.5 40 49 60 44C72 41 82 42.5 92 40',
  'M-3 48C22 45 42 51 62 47.5C74 45.5 84 46.5 92 45',
];

// ---------- Cube Stack: isometric blocks ----------
function cubes(cx, cy, s, list) {
  const p = (i, j, k) => [cx + (i - j) * s * 0.866, cy + (i + j) * s * 0.5 - k * s];
  return list.flatMap(([i, j, k, hi], q) => {
    const c = hi ? ['$ht', '$hl', '$hr'] : ['$t', '$l', '$r'];
    return [
      A(`c${q}l`, poly([p(i, j + 1, k + 1), p(i + 1, j + 1, k + 1), p(i + 1, j + 1, k), p(i, j + 1, k)]), { fill: c[1] }),
      A(`c${q}r`, poly([p(i + 1, j, k + 1), p(i + 1, j + 1, k + 1), p(i + 1, j + 1, k), p(i + 1, j, k)]), { fill: c[2] }),
      A(`c${q}t`, poly([p(i, j, k + 1), p(i + 1, j, k + 1), p(i + 1, j + 1, k + 1), p(i, j + 1, k + 1)]), { fill: c[0] }),
    ];
  });
}
const plate = (cx, cy, s, size) => {
  const p = (i, j) => [cx + (i - j) * s * 0.866, cy + (i + j) * s * 0.5 + 0.7];
  return poly([p(0, 0), p(size, 0), p(size, size), p(0, size)]);
};
// Back to front, so nearer blocks cover the ones behind. The last one floats above the tallest column.
const STACK = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 0, 2],
  [1, 0, 0],
  [1, 0, 1],
  [0, 1, 0],
  [0, 1, 1],
  [2, 0, 0],
  [1, 1, 0],
  [0, 2, 0],
  [0, 0, 3.5, true],
];

// ---------- Line Bloom: a flower in one line ----------
function bloom(cx, cy, R0, petals) {
  const at = (r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const f = (p) => `${n(p[0])} ${n(p[1])}`;
  let d = '';
  for (let i = 0; i < petals; i++) {
    const a = -90 + (360 / petals) * i;
    d += `M${f([cx, cy])}C${f(at(R0 * 0.5, a - 38))} ${f(at(R0 * 1.02, a - 15))} ${f(at(R0, a))}C${f(at(R0 * 1.02, a + 15))} ${f(at(R0 * 0.5, a + 38))} ${f([cx, cy])}`;
  }
  return d;
}
const STEM =
  'M71.5 20C72.9 30 69.7 42 71.2 54' +
  'M71.25 37.6C66 33 60.4 34 58.4 38.2C62.4 40.8 68 40.5 71.25 37.6C67 37.3 62.5 37.4 58.4 38.2' +
  'M70.6 44.4C75.8 40 81 41.2 82.9 45.2C78.9 47.6 73.9 47.3 70.6 44.4C74.6 44.3 79 44.5 82.9 45.2';
const SPRIG =
  'M-3 52C6 48 14 44.5 24 43' +
  'M6.5 47.5C6 43.5 8.6 41 12.4 40.6C12.6 44 10.4 46.6 6.5 47.5' +
  'M14 44.9C14.6 41.4 17.6 39.6 21 39.9C20.6 43 18 44.8 14 44.9' +
  'M10.6 46.2C13.6 47.6 16.8 47.4 19.2 45.4C16.4 44.2 13.2 44.4 10.6 46.2';

// ---------- Marble: a slab with gold veins ----------
function veins(seed, x0, x1, count) {
  const r = rng(seed);
  const all = [];
  for (let v = 0; v < count; v++) {
    let x = x0 + ((v + r() * 0.8) / count) * (x1 - x0);
    let y = -4;
    const lean = 0.45 + r() * 0.35;
    const pts = [[x, y]];
    while (y < 55) {
      const dy = 3.5 + r() * 4.5;
      y += dy;
      x += lean * dy + (r() - 0.5) * 3.4;
      pts.push([x, y]);
    }
    all.push(pts);
    const forks = r() < 0.6 ? 1 : 0;
    for (let b = 0; b < forks; b++) {
      const from = pts[1 + Math.floor(r() * (pts.length - 2))];
      const side = r() < 0.5 ? -1 : 1;
      let [bx, by] = from;
      const fork = [[bx, by]];
      const steps = 3 + Math.floor(r() * 3);
      for (let k = 0; k < steps; k++) {
        bx += side * (1.2 + r() * 2.4);
        by += 2.4 + r() * 3.4;
        fork.push([bx, by]);
      }
      all.push(fork);
    }
  }
  return all.map(smooth).join('');
}
const marble = (seed, x0, x1, count) => {
  const d = veins(seed, x0, x1, count);
  return [
    A('veinsoft', d, stroke('$vein', 2.6, { opacity: 0.1 })),
    A('veinmid', d, stroke('$vein', 0.85, { opacity: 0.24 })),
    A('veinfine', d, stroke('$gold', 0.24)),
  ];
};

// ---------- Deco Fans: overlapping scales, drawn top row first so each row tucks under the next ----------
function scales(r, rows, y0, pitch) {
  const out = [];
  for (let k = 0; k < rows; k++) {
    const y = y0 + k * pitch;
    const xs = k % 2 ? [r, 3 * r, 5 * r, 7 * r] : [0, 2 * r, 4 * r, 6 * r, 8 * r];
    out.push(A(`disc${k}`, xs.map((x) => circle(x, y, r)).join(''), { fill: '$deep', stroke: '$gold', sw: 0.24 }, VW, VH));
    out.push(
      A(`ring${k}`, xs.map((x) => [0.8, 0.6, 0.4].map((f) => circle(x, y, r * f)).join('')).join(''), stroke('$gold', 0.14), VW, VH),
    );
    out.push(A(`pip${k}`, xs.map((x) => circle(x, y, r * 0.16)).join(''), { fill: '$gold' }, VW, VH));
  }
  return out;
}
const corners = (inset, r) =>
  [
    [inset, inset, 1, 1],
    [VW - inset, inset, -1, 1],
    [inset, VH - inset, 1, -1],
    [VW - inset, VH - inset, -1, -1],
  ]
    .map(([x, y, sx, sy]) =>
      [1, 0.66, 0.33]
        .map((f) => `M${n(x + sx * r * f)} ${n(y)}A${n(r * f)} ${n(r * f)} 0 0 ${sx * sy > 0 ? 1 : 0} ${n(x)} ${n(y + sy * r * f)}`)
        .join(''),
    )
    .join('');

// ---------- Capsule ----------
function pill(cx, cy, len, r, deg) {
  const a = len / 2 - r;
  const p = (x, y) =>
    turn([cx + x, cy + y], deg, [cx, cy])
      .map(n)
      .join(' ');
  return {
    left: `M${p(0, -r)}L${p(-a, -r)}A${r} ${r} 0 0 0 ${p(-a, r)}L${p(0, r)}Z`,
    right: `M${p(0, -r)}L${p(a, -r)}A${r} ${r} 0 0 1 ${p(a, r)}L${p(0, r)}Z`,
    whole: `M${p(-a, -r)}L${p(a, -r)}A${r} ${r} 0 0 1 ${p(a, r)}L${p(-a, r)}A${r} ${r} 0 0 1 ${p(-a, -r)}Z`,
    shine: `M${p(-a + 0.4, -r * 0.52)}L${p(a - 0.4, -r * 0.52)}`,
    seam: `M${p(0, -r)}L${p(0, r)}`,
    box: [cx - r, cy - r, 2 * r, 2 * r],
  };
}
function capsule(id, cx, cy, len, r, deg) {
  const c = pill(cx, cy, len, r, deg);
  const shade = pill(cx + 1.5, cy + 2.2, len, r, deg);
  return [
    A(`${id}shadow`, shade.whole, { fill: '$shade' }),
    P(`${id}a`, c.left, c.box, { fill: grad(deg, '$c3', '$c2', '$c1') }),
    P(`${id}b`, c.right, c.box, { fill: grad(deg, '$w3', '$w2', '$w1') }),
    A(`${id}seam`, c.seam, stroke('$c3', 0.2, { opacity: 0.55, cap: 'butt' })),
    A(`${id}shine`, c.shine, stroke('#FFFFFF', r * 0.26, { opacity: 0.55 })),
  ];
}
function tablet(id, cx, cy, r, deg) {
  const ends = [turn([cx - r * 0.72, cy], deg, [cx, cy]), turn([cx + r * 0.72, cy], deg, [cx, cy])];
  return [
    E(`${id}shadow`, cx - r + 1.2, cy - r + 1.8, 2 * r, 2 * r, '$shade'),
    E(`${id}body`, cx - r, cy - r, 2 * r, 2 * r, glow(0.38, 0.32, 0.75, '$w1', '$w2', '$w3')),
    A(`${id}rim`, circle(cx, cy, r * 0.8), stroke('$w3', 0.18, { opacity: 0.8 })),
    A(`${id}score`, line(ends), stroke('$w3', 0.32)),
  ];
}

// ---------- Spectacles ----------
function specs(cx, cy, lw, lh, gap, deg, o = {}) {
  const c = [cx, cy];
  const lx = cx - gap / 2 - lw;
  const rx = cx + gap / 2;
  const y = cy - lh / 2;
  const lenses = [lx, rx].map((x) => roundRect(x, y, lw, lh, Math.min(lw, lh) * 0.4, deg, c));
  const p = (px, py) => turn([px, py], deg, c).map(n).join(' ');
  const bridge = `M${p(lx + lw, y + lh * 0.3)}Q${p(cx, y + lh * 0.08)} ${p(rx, y + lh * 0.3)}`;
  const hinges = `M${p(lx, y + lh * 0.28)}L${p(lx - lw * 0.16, y + lh * 0.22)}M${p(rx + lw, y + lh * 0.28)}L${p(rx + lw * 1.16, y + lh * 0.22)}`;
  const glare = [lx, rx]
    .map(
      (x) =>
        `M${p(x + lw * 0.2, y + lh * 0.62)}L${p(x + lw * 0.5, y + lh * 0.2)}M${p(x + lw * 0.36, y + lh * 0.7)}L${p(x + lw * 0.56, y + lh * 0.42)}`,
    )
    .join('');
  if (o.outline) return [A('specline', lenses.join('') + bridge + hinges, stroke(o.outline, o.sw ?? 0.5))];
  return [
    ...lenses.map((d, i) => P(`lens${i}`, d, [i ? rx : lx, y, lw, lh], { fill: grad(35, '$g2', '$g1') })),
    A('glare', glare, stroke('#FFFFFF', lw * 0.045, { opacity: 0.8 })),
    A('frame', lenses.join(''), stroke('$frame', o.sw ?? 1.3)),
    A('bridge', bridge + hinges, stroke('$frame', (o.sw ?? 1.3) * 0.85)),
  ];
}

// ---------- Latte art ----------
function rosetta(cx, cy) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const y = cy + 5.6 - i * 1.95;
    const a = 6.3 - i * 0.78;
    d += `M${n(cx - a)} ${n(y)}Q${n(cx)} ${n(y - 4.4)} ${n(cx + a)} ${n(y)}Q${n(cx)} ${n(y - 2.2)} ${n(cx - a)} ${n(y)}Z`;
  }
  const hy = cy - 6.3;
  d += `M${n(cx)} ${n(hy + 1.9)}C${n(cx - 3.4)} ${n(hy - 0.4)} ${n(cx - 1.6)} ${n(hy - 2.6)} ${n(cx)} ${n(hy - 1)}C${n(cx + 1.6)} ${n(hy - 2.6)} ${n(cx + 3.4)} ${n(hy - 0.4)} ${n(cx)} ${n(hy + 1.9)}Z`;
  return d;
}
function bean(id, cx, cy, deg) {
  const p = (x, y) =>
    turn([cx + x, cy + y], deg, [cx, cy])
      .map(n)
      .join(' ');
  return [
    E(id, cx - 1.9, cy - 1.3, 3.8, 2.6, '$bean', { rot: deg }),
    A(`${id}slit`, `M${p(-1.5, 0.1)}Q${p(-0.4, -0.7)} ${p(0.2, 0)}Q${p(0.8, 0.7)} ${p(1.5, -0.1)}`, stroke('$k1', 0.22)),
  ];
}
function cup(cx, cy) {
  return [
    E('tableshade', cx - 18.5 + 1.6, cy - 18.5 + 2.4, 37, 37, '$shadow'),
    E('saucer', cx - 18.5, cy - 18.5, 37, 37, glow(0.4, 0.35, 0.8, '$s1', '$s1', '$s2')),
    A('saucerrim', circle(cx, cy, 17.1) + circle(cx, cy, 12.6), stroke('$s3', 0.2, { opacity: 0.8 })),
    A('handle', roundRect(cx + 9.4, cy - 2.1, 9, 4.2, 2.1, 38, [cx, cy]), { fill: '$cup', stroke: '$s3', sw: 0.18 }),
    E('cupshade', cx - 11.6 + 0.8, cy - 11.6 + 1.2, 23.2, 23.2, '$s3', { opacity: 0.55 }),
    E('cup', cx - 11.6, cy - 11.6, 23.2, 23.2, '$cup'),
    E('coffee', cx - 10.2, cy - 10.2, 20.4, 20.4, glow(0.5, 0.5, 0.5, [0, '$k1'], [0.72, '$k1'], [1, '$k2'])),
    A('art', rosetta(cx, cy + 0.6), { fill: '$foam' }),
    A('stem', `M${cx} ${n(cy + 7.4)}L${cx} ${n(cy - 4.6)}`, stroke('$k1', 0.42)),
    A('cuprim', circle(cx, cy, 10.2), stroke('$k2', 0.22, { opacity: 0.5 })),
  ];
}

// ---------- Window Seat ----------
function cabinWindow(cx, cy) {
  const gw = 21.6;
  const gh = 31.6;
  const gx = cx - gw / 2;
  const gy = cy - gh / 2;
  const X = (f) => n(gx + gw * f);
  const Y = (f) => n(gy + gh * f);
  const glass = roundRect(gx, gy, gw, gh, 9.2);
  const bezel = roundRect(gx - 1.6, gy - 1.6, gw + 3.2, gh + 3.2, 10.8);
  const frame = roundRect(gx - 3.9, gy - 3.9, gw + 7.8, gh + 7.8, 13.1);
  const cast = roundRect(gx - 3.9 + 0.7, gy - 3.9 + 1.1, gw + 7.8, gh + 7.8, 13.1);
  const r = 9.2;
  // Everything inside the glass ends on the glass's own rounded corners, so nothing pokes out past the frame.
  const floor = `L${n(gx + gw)} ${n(gy + gh - r)}A${r} ${r} 0 0 1 ${n(gx + gw - r)} ${n(gy + gh)}L${n(gx + r)} ${n(gy + gh)}A${r} ${r} 0 0 1 ${n(gx)} ${n(gy + gh - r)}Z`;
  const far = `M${X(0)} ${Y(0.66)}C${X(0.2)} ${Y(0.6)} ${X(0.4)} ${Y(0.69)} ${X(0.6)} ${Y(0.64)}C${X(0.8)} ${Y(0.6)} ${X(0.92)} ${Y(0.67)} ${X(1)} ${Y(0.63)}${floor}`;
  const near = `M${X(0)} ${Y(0.84)}C${X(0.15)} ${Y(0.76)} ${X(0.32)} ${Y(0.8)} ${X(0.46)} ${Y(0.84)}C${X(0.6)} ${Y(0.78)} ${X(0.76)} ${Y(0.8)} ${X(0.85)} ${Y(0.86)}L${X(1)} ${Y(0.9)}L${X(1)} ${Y(0.9)}${floor}`;
  const wing = poly([
    [gx + gw, gy + gh * 0.55],
    [gx + gw * 0.36, gy + gh * 0.615],
    [gx + gw * 0.3, gy + gh * 0.52],
    [gx + gw * 0.262, gy + gh * 0.526],
    [gx + gw * 0.3, gy + gh * 0.652],
    [gx + gw, gy + gh * 0.74],
  ]);
  const lip = gy + gh * 0.2;
  return [
    A('cast', cast, { fill: '$seam', opacity: 0.45 }),
    A('frame', frame, { fill: '$frame1', stroke: '$seam', sw: 0.2 }),
    P('sky', glass, [gx, gy, gw, gh], { fill: grad(0, '$sky3', '$sky2', '$sky1') }),
    E('sun', gx + gw * 0.58, gy + gh * 0.3, 5.6, 5.6, '$sun'),
    A('cloudfar', far, { fill: '$cloud', opacity: 0.55 }),
    A('wing', wing, { fill: '$wing' }),
    A('wingline', line([[gx + gw, gy + gh * 0.655], [gx + gw * 0.34, gy + gh * 0.632]]), stroke('$seam', 0.16)), // prettier-ignore
    A('cloudnear', near, { fill: '$cloud' }),
    A('shade', `M${n(gx)} ${n(lip)}L${n(gx)} ${n(gy + r)}A${r} ${r} 0 0 1 ${n(gx + r)} ${n(gy)}L${n(gx + gw - r)} ${n(gy)}A${r} ${r} 0 0 1 ${n(gx + gw)} ${n(gy + r)}L${n(gx + gw)} ${n(lip)}Z`, { fill: '$shade' }), // prettier-ignore
    A('shadelip', line([[gx, lip], [gx + gw, lip]]), stroke('$seam', 0.3, { cap: 'butt' })), // prettier-ignore
    R('shadetab', cx - 2.2, lip - 1.5, 4.4, 0.8, '$seam', { r: 0.4 }),
    A('glare', poly([[gx + gw * 0.55, lip], [gx + gw * 0.78, lip], [gx + gw * 0.46, gy + gh * 0.9], [gx + gw * 0.23, gy + gh * 0.9]]), { fill: '#FFFFFF', opacity: 0.12 }), // prettier-ignore
    A('bezel', bezel + glass, { fill: '$frame2', evenodd: true }),
    A('bezelline', glass, stroke('$seam', 0.16)),
  ];
}
const cloudBank = (y) =>
  `M-3 ${y + 4}C4 ${y - 1} 12 ${y + 1} 17 ${y + 4}C22 ${y - 2} 32 ${y - 3} 37 ${y + 2}C43 ${y - 1} 50 ${y} 54 ${y + 4}C60 ${y - 1} 69 ${y - 2} 74 ${y + 3}C80 ${y} 87 ${y + 1} 92 ${y + 5}L92 54L-3 54Z`;

export const SET_9 = [
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'tech',
    tags: ['software', 'startup', 'developer', 'saas', 'app', 'it services', 'founder', 'digital marketing', 'gradient', 'modern'],
    fonts: { heading: 'spacegrotesk', body: 'inter' },
    palettes: [
      { label: 'Aurora', night: '#0B1020', ink: '#F4F6FF', soft: '#A9B4D0', accent: '#5EEAD4', mark: '#F4F6FF', w1a: '#7C3AED', w1b: '#EC4899', w2a: '#2563EB', w2b: '#22D3EE', w3a: '#0D9488', w3b: '#A3E635', glint: '#FFFFFF' }, // prettier-ignore
      { label: 'Ember', night: '#1A0B12', ink: '#FFF4EC', soft: '#D3B4B0', accent: '#FDBA74', mark: '#FFF4EC', w1a: '#9D174D', w1b: '#F97316', w2a: '#EA580C', w2b: '#FACC15', w3a: '#BE123C', w3b: '#FB7185', glint: '#FFFFFF' }, // prettier-ignore
      { label: 'Lagoon', night: '#06202B', ink: '#EFFCFA', soft: '#9EC3C4', accent: '#67E8F9', mark: '#EFFCFA', w1a: '#0E7490', w1b: '#34D399', w2a: '#0369A1', w2b: '#38BDF8', w3a: '#115E59', w3b: '#2DD4BF', glint: '#FFFFFF' }, // prettier-ignore
      { label: 'Daybreak', night: '#F7F8FC', ink: '#171B2E', soft: '#5C6382', accent: '#6D28D9', mark: '#171B2E', w1a: '#C4B5FD', w1b: '#F9A8D4', w2a: '#93C5FD', w2b: '#A5F3FC', w3a: '#6366F1', w3b: '#EC4899', glint: '#FFFFFF' }, // prettier-ignore
    ],
    sample: {
      name: 'Rohan Kulkarni',
      title: 'Founder and Developer',
      company: 'Northwind Labs',
      tagline: 'Web apps and automation',
      phone: '+91 98765 43210',
      email: 'rohan@northwind.example',
      website: 'northwind.example',
      address: 'Baner Road, Pune',
    },
    sides: {
      front: {
        background: '$night',
        stacks: {
          who: { x: 6, y: 6, w: 52, h: 17.5, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 24.5, w: 49, h: 15.4, anchor: 'bottom' },
        },
        elements: [...waves(AURORA_FRONT), ...who('who', 6, 52), reach('reach', 6, 49, { size: 6.6, list: { rowHeight: 1.55 } })],
      },
      back: {
        background: '$night',
        stacks: { brand: { x: 6, y: 6, w: 46, h: 28, anchor: 'middle', gap: 1.5 } },
        elements: [...waves(AURORA_BACK), ...brand('brand', 6, 46, { size: 14.5 }), QR('qr', W - 32, 5.5, 26, { r: 1.6 })],
      },
    },
  },
  {
    id: 'cube-stack',
    name: 'Cube Stack',
    category: 'tech',
    tags: ['software', 'it services', 'startup', 'cloud', 'data', 'engineer', 'consultant', 'builder', '3d', 'isometric'],
    fonts: { heading: 'manrope', body: 'manrope' },
    palettes: [
      { label: 'Indigo', paper: '#F5F6FB', deep: '#1E1B4B', mark: '#F5F6FB', ink: '#1B1E3A', soft: '#5E6385', accent: '#4F46E5', t: '#A5B4FC', l: '#6366F1', r: '#4338CA', ht: '#FDE68A', hl: '#F59E0B', hr: '#D97706' }, // prettier-ignore
      { label: 'Mint', paper: '#F2FAF7', deep: '#064E3B', mark: '#F2FAF7', ink: '#0F2F28', soft: '#56736B', accent: '#059669', t: '#A7F3D0', l: '#34D399', r: '#059669', ht: '#FECACA', hl: '#F87171', hr: '#DC2626' }, // prettier-ignore
      { label: 'Coral', paper: '#FFF7F3', deep: '#7C2D12', mark: '#FFF7F3', ink: '#3B1D12', soft: '#7A5B4F', accent: '#EA580C', t: '#FED7AA', l: '#FB923C', r: '#EA580C', ht: '#BAE6FD', hl: '#38BDF8', hr: '#0284C7' }, // prettier-ignore
      { label: 'Graphite', paper: '#16181D', deep: '#0B0C0F', mark: '#F3F4F6', ink: '#F3F4F6', soft: '#A5ABB8', accent: '#A3E635', t: '#6B7280', l: '#4B5563', r: '#374151', ht: '#D9F99D', hl: '#A3E635', hr: '#65A30D' }, // prettier-ignore
    ],
    sample: {
      name: 'Sneha Pillai',
      title: 'Co-founder',
      company: 'Stackwise Systems',
      tagline: 'Cloud and software services',
      phone: '+91 98765 43210',
      email: 'sneha@stackwise.example',
      website: 'stackwise.example',
      address: 'Infopark Road, Kakkanad, Kochi',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 49, h: 19, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27, w: 49, h: 19.8, anchor: 'bottom' },
        },
        elements: [
          A('plate', plate(71, 32.2, 5.4, 3), { fill: '$ink', opacity: 0.07 }),
          ...cubes(71, 32.2, 5.4, STACK),
          ...who('who', 6, 49, { weight: 800 }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [
          ...cubes(80.4, 42.2, 2.7, [
            [0, 0, 0],
            [1, 0, 0, true],
            [0, 1, 0],
          ]),
          ...brand('brand', 6, 46, { weight: 800 }),
          QR('qr', W - 32, 7, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'glass-orb',
    name: 'Glass Orb',
    category: 'minimal',
    tags: ['consultant', 'designer', 'coach', 'therapist', 'freelancer', 'studio', 'minimal', 'modern', 'gradient', 'clean'],
    fonts: { heading: 'dmserif', body: 'dmsans' },
    palettes: [
      { label: 'Coral', paper: '#FBF8F4', ink: '#221C1A', soft: '#6E625D', accent: '#D9482B', o1: '#FFE3B8', o2: '#F9735B', o3: '#B01E4A', s1: '#FDECCB', s2: '#F59E0B', sh: '#E7DFD5', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Lagoon', paper: '#F5F9FA', ink: '#12222B', soft: '#57707B', accent: '#0B7F95', o1: '#D5FBEF', o2: '#22B8CF', o3: '#1E3A8A', s1: '#E0F2FE', s2: '#38BDF8', sh: '#DCE6EA', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Lilac', paper: '#FAF7FC', ink: '#241B33', soft: '#6C6280', accent: '#7C3AED', o1: '#FFD9EC', o2: '#A78BFA', o3: '#4C1D95', s1: '#FCE7F3', s2: '#F472B6', sh: '#E6DFEE', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Honey', paper: '#17150F', ink: '#F7F1E3', soft: '#B9B09B', accent: '#F5B83D', o1: '#FFF3C4', o2: '#F59E0B', o3: '#7C2D12', s1: '#FDE68A', s2: '#F97316', sh: '#0C0B07', mark: '#FFFFFF' }, // prettier-ignore
    ],
    sample: {
      name: 'Kavya Menon',
      title: 'Brand Strategist',
      company: 'Menon & Co.',
      tagline: 'Brand strategy and identity',
      phone: '+91 98765 43210',
      email: 'kavya@menonco.example',
      website: 'menonco.example',
      address: 'Hill Road, Bandra West, Mumbai',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6.5, w: 48, h: 19, anchor: 'top', gap: 0.9 },
          reach: { x: 6, y: 27.5, w: 49, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          E('shade', 59.5, 39.2, 23, 3.6, glow(0.5, 0.5, 0.5, '$sh', '$paper')),
          E('orb', 57.5, 8.5, 27, 27, glow(0.34, 0.28, 0.82, '$o1', '$o2', '$o3')),
          E('moon', 79.5, 6, 6.4, 6.4, glow(0.34, 0.28, 0.82, '$s1', '$s2')),
          ...who('who', 6, 48, { size: 16, weight: 400 }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        // The light stays in the top right corner, so the name sits on the deep colour and reads clearly.
        background: glow(0.94, 0.04, 1.02, [0, '$o1'], [0.2, '$o2'], [0.62, '$o3'], [1, '$o3']),
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'bottom', gap: 1.6 } },
        elements: [...brand('brand', 6, 46, { size: 16, weight: 400 }), QR('qr', W - 32, H / 2 - 13, 26, { r: 1.6 })],
      },
    },
  },
  {
    id: 'line-bloom',
    name: 'Line Bloom',
    category: 'minimal',
    tags: ['florist', 'boutique', 'salon', 'therapist', 'wellness', 'coach', 'stylist', 'minimal', 'line art', 'elegant', 'feminine'],
    fonts: { heading: 'cormorant', body: 'dmsans' },
    palettes: [
      {
        label: 'Peach',
        paper: '#FFFBF7',
        blob: '#FAD9C6',
        line: '#2B2623',
        ink: '#2B2623',
        soft: '#6F645E',
        accent: '#C9502C',
        mark: '#2B2623',
      },
      {
        label: 'Sage',
        paper: '#FAFBF7',
        blob: '#D4E3CF',
        line: '#1F2A22',
        ink: '#1F2A22',
        soft: '#5F6E62',
        accent: '#3F7350',
        mark: '#1F2A22',
      },
      {
        label: 'Sky',
        paper: '#F8FAFD',
        blob: '#CFE0F5',
        line: '#1B2433',
        ink: '#1B2433',
        soft: '#5B6779',
        accent: '#2A63BF',
        mark: '#1B2433',
      },
      {
        label: 'Rosewood',
        paper: '#2A1A1F',
        blob: '#4A2A33',
        line: '#F6E7DF',
        ink: '#F6E7DF',
        soft: '#C8AFA9',
        accent: '#F0A58A',
        mark: '#F6E7DF',
      },
    ],
    sample: {
      name: 'Aarohi Sen',
      title: 'Floral Designer',
      company: 'Petal & Stem',
      tagline: 'Flowers for weddings and homes',
      phone: '+91 98765 43210',
      email: 'aarohi@petalandstem.example',
      website: 'petalandstem.example',
      address: 'Lake Road, Kolkata',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6.5, w: 49, h: 19, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 49, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          A('blob', 'M58.5 21C57 10.5 65.5 3.5 75 5.5C84.5 7.5 90 16 87.5 26.5C85.5 36 76.5 41.5 67.5 38.5C61.5 36.5 59.3 28.5 58.5 21Z', {
            fill: '$blob',
          }),
          E('dot', 82.6, 35.4, 2.6, 2.6, '$accent'),
          A('stem', STEM, stroke('$line', 0.34)),
          A('flower', bloom(71.5, 20, 10.4, 7), { fill: '$paper', stroke: '$line', sw: 0.34, join: 'round', cap: 'round' }),
          E('eye', 69.9, 18.4, 3.2, 3.2, '$accent'),
          ...who('who', 6, 49, { size: 17, weight: 600, company: { weight: 600 } }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        background: '$blob',
        stacks: { brand: { x: 6, y: 7, w: 46, h: 30, anchor: 'top', gap: 1.6 } },
        elements: [
          A('sprig', SPRIG, stroke('$line', 0.34)),
          ...brand('brand', 6, 46, { size: 17, weight: 600 }),
          QR('qr', W - 32, H / 2 - 13, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'marble-vein',
    name: 'Marble',
    category: 'luxury',
    tags: ['interior', 'architect', 'stone', 'tiles', 'jeweller', 'real estate', 'luxury', 'boutique', 'salon', 'marble', 'gold'],
    fonts: { heading: 'marcellus', body: 'montserrat' },
    palettes: [
      { label: 'Nero', paper: '#111112', m1: '#1D1D20', m2: '#08080A', vein: '#F1F1F1', gold: '#D8B25A', ink: '#F4EFE6', soft: '#B9B2A4', accent: '#D8B25A', mark: '#F4EFE6', plaque: '#111112' }, // prettier-ignore
      { label: 'Carrara', paper: '#FBFAF7', m1: '#F6F5F2', m2: '#E4E3DF', vein: '#6F7379', gold: '#B08D3C', ink: '#1E1D1B', soft: '#6A675F', accent: '#8F6F22', mark: '#1E1D1B', plaque: '#FBFAF7' }, // prettier-ignore
      { label: 'Verde', paper: '#F7F5EF', m1: '#11503E', m2: '#082F24', vein: '#C9EBD9', gold: '#DDBB62', ink: '#182A23', soft: '#5E6E66', accent: '#8A6A1E', mark: '#182A23', plaque: '#F7F5EF' }, // prettier-ignore
      { label: 'Rosa', paper: '#FCF7F5', m1: '#F4DAD3', m2: '#E2B4AB', vein: '#9C5F58', gold: '#B5654F', ink: '#33211F', soft: '#7B625E', accent: '#A4523D', mark: '#33211F', plaque: '#FCF7F5' }, // prettier-ignore
    ],
    sample: {
      name: 'Devika Sarin',
      title: 'Principal Designer',
      company: 'Sarin Stone Gallery',
      tagline: 'Marble, granite and quartz',
      phone: '+91 98765 43210',
      email: 'devika@sarinstone.example',
      website: 'sarinstone.example',
      address: 'Kirti Nagar, New Delhi',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6.5, w: 47, h: 19, anchor: 'top', gap: 0.9 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          P('slab', 'M58 -3H92V54H58Z', [58, -3, 34, 57], { fill: grad(155, '$m2', '$m1') }),
          ...marble(11, 30, 88, 5),
          R('mask', -3, -3, 61, 57, '$paper'),
          LN('edge', 58, -3, 0, '$gold', 0.5, { h: 57 }),
          LN('edge2', 56.8, -3, 0, '$gold', 0.16, { h: 57 }),
          ...who('who', 6, 47, { size: 15.5, weight: 400 }),
          reach('reach', 6, 48, { size: 6.4, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: grad(155, '$m2', '$m1'),
        stacks: { brand: { x: 12, y: 11, w: 38, h: 28.8, anchor: 'middle', gap: 1.5 } },
        elements: [
          ...marble(23, -26, 86, 10),
          R('plaque', 7, 7, W - 14, H - 14, '$plaque', { stroke: '$gold', sw: 0.4 }),
          R('plaqueline', 8.2, 8.2, W - 16.4, H - 16.4, 'none', { stroke: '$gold', sw: 0.14 }),
          ...brand('brand', 12, 38, { size: 13.5, weight: 400, logo: 10 }),
          QR('qr', W - 38.5, H / 2 - 13, 26, { r: 1 }),
        ],
      },
    },
  },
  {
    id: 'deco-fans',
    name: 'Deco Fans',
    category: 'luxury',
    orientation: 'vertical',
    tags: ['couture', 'jeweller', 'hotel', 'bar', 'salon', 'wedding', 'designer', 'luxury', 'art deco', 'gold', 'vertical'],
    fonts: { heading: 'playfair', body: 'outfit' },
    palettes: [
      { label: 'Emerald', deep: '#0E3B2E', gold: '#D8B76A', ink: '#F6EEDB', soft: '#D3C7A6', accent: '#E7CB86', mark: '#F6EEDB' },
      { label: 'Midnight', deep: '#101B3A', gold: '#D5BE84', ink: '#F4F0E4', soft: '#C7C4B5', accent: '#E5D3A0', mark: '#F4F0E4' },
      { label: 'Noir', deep: '#141414', gold: '#CDA85A', ink: '#F5EFE2', soft: '#C4BBA6', accent: '#E0C17C', mark: '#F5EFE2' },
      { label: 'Bordeaux', deep: '#4A1020', gold: '#E3B58F', ink: '#FBEFE6', soft: '#DFC4B6', accent: '#F0CBAB', mark: '#FBEFE6' },
    ],
    sample: {
      name: 'Anaya Mirchandani',
      title: 'Founder and Designer',
      company: 'Maison Anaya',
      tagline: 'Bespoke bridal couture',
      phone: '+91 98765 43210',
      email: 'anaya@maisonanaya.example',
      website: 'maisonanaya.example',
      address: 'Kala Ghoda, Mumbai',
    },
    sides: {
      front: {
        background: '$deep',
        stacks: {
          who: { x: 5, y: 37.5, w: VW - 10, h: 21, anchor: 'middle', gap: 1 },
          reach: { x: 4.4, y: 63, w: VW - 8.8, h: 20.5, anchor: 'top' },
        },
        elements: [
          ...scales(6.35, 8, 2.4, 3.9),
          R('floor', -B, 29.7, VW + 2 * B, VH, '$deep'),
          LN('base', -B, 29.7, VW + 2 * B, '$gold', 0.5),
          LN('base2', -B, 31, VW + 2 * B, '$gold', 0.16),
          A('gem', poly([[VW / 2, 59.3], [VW / 2 + 1.5, 60.8], [VW / 2, 62.3], [VW / 2 - 1.5, 60.8]]), { fill: '$gold' }, VW, VH), // prettier-ignore
          LN('gemleft', VW / 2 - 12, 60.8, 9, '$gold', 0.16),
          LN('gemright', VW / 2 + 3, 60.8, 9, '$gold', 0.16),
          ...who('who', 5, VW - 10, { size: 15, weight: 600, align: 'center', company: { weight: 600 } }),
          reach('reach', 4.4, VW - 8.8, { size: 6.4, align: 'center', list: { icons: false, rowHeight: 1.65 } }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 7, y: 11, w: VW - 14, h: 36, anchor: 'middle', gap: 1.8 } },
        elements: [
          R('frame', 3, 3, VW - 6, VH - 6, 'none', { stroke: '$gold', sw: 0.3 }),
          A('corners', corners(3, 6.2), stroke('$gold', 0.2, { cap: 'butt' }), VW, VH),
          ...brand('brand', 7, VW - 14, { size: 14.5, weight: 600, align: 'center', logo: 13 }),
          QR('qr', VW / 2 - 13, 51, 26, { r: 1 }),
        ],
      },
    },
  },
  {
    id: 'capsule',
    name: 'Capsule',
    category: 'health',
    tags: ['pharmacy', 'chemist', 'medical store', 'medicines', 'druggist', 'clinic', 'doctor', 'health', 'surgical'],
    fonts: { heading: 'bricolage', body: 'dmsans' },
    palettes: [
      { label: 'Teal', paper: '#F2FAF8', halo: '#DCF1EC', shade: '#C2E4DC', deep: '#0F4C45', mark: '#F2FAF8', ink: '#12302C', soft: '#55726D', accent: '#0B7F72', c1: '#7EF0DD', c2: '#14B8A6', c3: '#0B6B63', w1: '#FFFFFF', w2: '#F1F4F6', w3: '#C5CFD9' }, // prettier-ignore
      { label: 'Cherry', paper: '#FFF8F6', halo: '#FCE3DD', shade: '#F5CABF', deep: '#7F1D1D', mark: '#FFF8F6', ink: '#3A1614', soft: '#7C5A56', accent: '#C81E1E', c1: '#FFB4B4', c2: '#EF4444', c3: '#A61B1B', w1: '#FFFFFF', w2: '#F6F2F1', w3: '#D9CCCA' }, // prettier-ignore
      { label: 'Royal', paper: '#F5F8FE', halo: '#DFE9FB', shade: '#C3D5F5', deep: '#1E3A8A', mark: '#F5F8FE', ink: '#14213D', soft: '#5A6B8C', accent: '#1D4ED8', c1: '#A9CEFF', c2: '#3B82F6', c3: '#1B44B8', w1: '#FFFFFF', w2: '#F1F4F9', w3: '#C7D0DF' }, // prettier-ignore
      { label: 'Amber', paper: '#FFFAF0', halo: '#FDEDCB', shade: '#F5DBA5', deep: '#78350F', mark: '#FFFAF0', ink: '#33230E', soft: '#7A6648', accent: '#B45309', c1: '#FFE08A', c2: '#F59E0B', c3: '#B45309', w1: '#FFFFFF', w2: '#F7F3EA', w3: '#DDD3BF' }, // prettier-ignore
    ],
    sample: {
      name: 'Nilesh Gupta',
      title: 'Pharmacist',
      company: 'Aarogya Medicals',
      tagline: 'Medicines, surgicals and home delivery',
      phone: '+91 98765 43210',
      email: 'hello@aarogyamedicals.example',
      website: 'aarogyamedicals.example',
      address: 'Tilak Road, Nashik',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 49, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 49, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          E('halo', 54, 1.5, 44, 44, '$halo'),
          ...capsule('big', 72.5, 20, 30, 5.6, -34),
          ...tablet('tab', 63, 39.5, 4.6, -20),
          ...capsule('small', 80.5, 40.5, 11, 2.3, 24),
          ...shop('who', 6, 49, { size: 15, weight: 800 }),
          reach('reach', 6, 49, { size: 6.6 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [
          E('ring', 50, -12, 54, 54, 'none', { stroke: '$c2', sw: 0.3, opacity: 0.5 }),
          ...brand('brand', 6, 46, { weight: 800 }),
          QR('qr', W - 32, H / 2 - 13, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'spectacles',
    name: 'Spectacles',
    category: 'health',
    tags: ['optician', 'opticals', 'eye clinic', 'eye care', 'optometrist', 'frames', 'lenses', 'sunglasses'],
    fonts: { heading: 'outfit', body: 'inter' },
    palettes: [
      { label: 'Tortoise', paper: '#FBF6EE', halo: '#F3E5CE', deep: '#3B2414', mark: '#FBF6EE', ink: '#2A1D12', soft: '#6F5E4E', accent: '#A3561F', frame: '#5B3518', g1: '#FFF1D6', g2: '#EDB869' }, // prettier-ignore
      { label: 'Navy', paper: '#F5F8FC', halo: '#DDE8F6', deep: '#14284B', mark: '#F5F8FC', ink: '#14213A', soft: '#5C6B85', accent: '#2563C9', frame: '#17305E', g1: '#EAF4FF', g2: '#8FBDF3' }, // prettier-ignore
      { label: 'Jet', paper: '#F7F7F5', halo: '#E7E7E2', deep: '#151515', mark: '#F7F7F5', ink: '#1A1A1A', soft: '#666660', accent: '#C7331F', frame: '#1A1A1A', g1: '#F6F6F3', g2: '#BCC3CA' }, // prettier-ignore
      { label: 'Rose', paper: '#FFF7F8', halo: '#FBDDE3', deep: '#5B1A32', mark: '#FFF7F8', ink: '#3A1424', soft: '#7D5B67', accent: '#C4285F', frame: '#9D2B55', g1: '#FFEAF0', g2: '#F6A1BC' }, // prettier-ignore
    ],
    sample: {
      name: 'Dr. Kunal Shah',
      title: 'Optometrist',
      company: 'Drishti Eye Care & Opticals',
      tagline: 'Eye testing, frames and lenses',
      phone: '+91 98765 43210',
      email: 'care@drishtieyecare.example',
      website: 'drishtieyecare.example',
      address: 'MG Road, Indore',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 47, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          E('halo', 56, -6, 50, 50, '$halo'),
          ...specs(81, 21.5, 23, 18.5, 5, -7),
          A('sparkle', sparkle(60.6, 37, 2.6) + sparkle(65.4, 41.6, 1.3), { fill: '$accent' }),
          ...shop('who', 6, 47, { size: 14.5, weight: 700 }),
          reach('reach', 6, 47, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [
          ...specs(70, 43.6, 7.4, 5.6, 1.8, 0, { outline: '$mark', sw: 0.45 }),
          ...brand('brand', 6, 46),
          QR('qr', W - 32, 6, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'latte-art',
    name: 'Latte Art',
    category: 'food',
    tags: ['cafe', 'coffee', 'coffee shop', 'bakery', 'tea', 'breakfast', 'barista', 'roastery', 'restaurant'],
    fonts: { heading: 'fraunces', body: 'dmsans' },
    palettes: [
      { label: 'Forest', bg: '#1F3A2E', shadow: '#162A21', deep: '#14271F', mark: '#F6EFE2', ink: '#F6EFE2', soft: '#C3CDBE', accent: '#E9B872', s1: '#FBF6EC', s2: '#E6DAC4', s3: '#CDBFA5', cup: '#FFFFFF', k1: '#A56F45', k2: '#5C3317', foam: '#FFF4DE', bean: '#6B3F1F' }, // prettier-ignore
      { label: 'Cream', bg: '#F4E9D8', shadow: '#E3D2B8', deep: '#3B2416', mark: '#F4E9D8', ink: '#2E1F12', soft: '#7A6652', accent: '#A04E24', s1: '#FFFFFF', s2: '#EFE8DD', s3: '#D5CABB', cup: '#FFFFFF', k1: '#A56F45', k2: '#5C3317', foam: '#FFF4DE', bean: '#5A3418' }, // prettier-ignore
      { label: 'Terracotta', bg: '#B4502D', shadow: '#984124', deep: '#3A1A0E', mark: '#FFF3E6', ink: '#FFF3E6', soft: '#F8D9C7', accent: '#FFD9A0', s1: '#FFF8EE', s2: '#F0DFC9', s3: '#D9C3A6', cup: '#FFFFFF', k1: '#A56F45', k2: '#522C13', foam: '#FFF4DE', bean: '#4A2710' }, // prettier-ignore
      { label: 'Slate', bg: '#24303B', shadow: '#19232C', deep: '#151C23', mark: '#F2EEE6', ink: '#F2EEE6', soft: '#B7C0C8', accent: '#F0B36A', s1: '#F7F4EE', s2: '#DED8CC', s3: '#BFB7A8', cup: '#FFFFFF', k1: '#A56F45', k2: '#5C3317', foam: '#FFF4DE', bean: '#7A4A26' }, // prettier-ignore
    ],
    sample: {
      name: "Nikhil D'Souza",
      title: 'Owner and Head Barista',
      company: 'Filter & Foam',
      tagline: 'Speciality coffee and all-day breakfast',
      phone: '+91 98765 43210',
      email: 'hello@filterandfoam.example',
      website: 'filterandfoam.example',
      address: 'Chapel Road, Bandra West, Mumbai',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          ...cup(75, 24.6),
          ...bean('bean1', 59.5, 46.2, -30),
          ...bean('bean2', 64.4, 47.6, 20),
          ...shop('who', 6, 47, { size: 16, weight: 700 }),
          reach('reach', 6, 48, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 8, w: 46, h: 34.8, anchor: 'middle', gap: 1.6 } },
        elements: [
          A('stain', circle(83, 47, 11.5), stroke('$k1', 1.1, { opacity: 0.4 })),
          A('stain2', circle(83.5, 46.6, 12.4), stroke('$k1', 0.25, { opacity: 0.4 })),
          ...brand('brand', 6, 46, { size: 16 }),
          QR('qr', W - 32, 5.5, 26, { r: 1.6 }),
        ],
      },
    },
  },
  {
    id: 'window-seat',
    name: 'Window Seat',
    category: 'professional',
    tags: ['travel agent', 'tours', 'travels', 'holidays', 'visa', 'tickets', 'airline', 'pilot', 'cabin crew', 'immigration'],
    fonts: { heading: 'montserrat', body: 'inter' },
    palettes: [
      { label: 'Sunset', wall: '#F1EEEA', seam: '#C7BFB5', frame1: '#FBFAF8', frame2: '#DAD4CC', shade: '#F4F1ED', sky1: '#3B4A8C', sky2: '#E8748A', sky3: '#FDBA74', sun: '#FFF1C2', cloud: '#FFE9DC', wing: '#C9CED6', ink: '#23262E', soft: '#636873', accent: '#C9413D', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Morning', wall: '#EEF2F5', seam: '#BCC6CF', frame1: '#FAFCFD', frame2: '#D5DDE4', shade: '#F1F4F7', sky1: '#1F6FE0', sky2: '#6DB7F5', sky3: '#D8EEFD', sun: '#FFF6D6', cloud: '#FFFFFF', wing: '#C2CAD3', ink: '#1C2530', soft: '#5C6875', accent: '#1A64C4', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Dusk', wall: '#EFEDF2', seam: '#C3BECB', frame1: '#FAF9FC', frame2: '#D8D4DF', shade: '#F2F0F5', sky1: '#1B1F4B', sky2: '#5B3F8C', sky3: '#E79AB0', sun: '#FCE7B2', cloud: '#D9C7E8', wing: '#AEB2C4', ink: '#231F33', soft: '#665F78', accent: '#6D3FB0', mark: '#FFFFFF' }, // prettier-ignore
      { label: 'Golden', wall: '#F3F0E8', seam: '#C9C1AE', frame1: '#FCFBF7', frame2: '#DCD6C6', shade: '#F5F2EA', sky1: '#17707C', sky2: '#EFBE62', sky3: '#FCE3A8', sun: '#FFFFFF', cloud: '#FFF3D6', wing: '#C4C8CC', ink: '#22261F', soft: '#62675A', accent: '#A8650C', mark: '#FFFFFF' }, // prettier-ignore
    ],
    sample: {
      name: 'Priya Nambiar',
      title: 'Travel Consultant',
      company: 'Udaan Tours & Travels',
      tagline: 'Flights, visas and holiday packages',
      phone: '+91 98765 43210',
      email: 'priya@udaantravels.example',
      website: 'udaantravels.example',
      address: 'MG Road, Ernakulam, Kochi',
    },
    sides: {
      front: {
        background: '$wall',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20, anchor: 'top', gap: 0.8 },
          reach: { x: 6, y: 27.5, w: 48, h: 19.3, anchor: 'bottom' },
        },
        elements: [
          ...cabinWindow(72.6, 25),
          ...shop('who', 6, 47, { size: 14.5, weight: 700 }),
          reach('reach', 6, 48, { size: 6.5, list: { icons: false, rowHeight: 1.6 } }),
        ],
      },
      back: {
        // The upper half stays the deep sky colour, so the business name always reads clearly.
        background: { type: 'linear', angle: 0, stops: [[0, '$sky3'], [0.16, '$sky2'], [0.48, '$sky1'], [1, '$sky1']] }, // prettier-ignore
        stacks: { brand: { x: 6, y: 6, w: 46, h: 26, anchor: 'top', gap: 1.4 } },
        elements: [
          E('sun', 59, 30, 9.5, 9.5, '$sun'),
          A('cloudsfar', cloudBank(37.5), { fill: '$cloud', opacity: 0.55 }),
          A('cloudsnear', cloudBank(42.5), { fill: '$cloud' }),
          ...brand('brand', 6, 46, { size: 14 }),
          QR('qr', W - 32, 5.5, 26, { r: 1.6 }),
        ],
      },
    },
  },
];
