// Template set 3: health and beauty. Each card is built on one object or test from that trade, drawn with code.
// Sizes are millimetres and points. Trim is 88.9 × 50.8 mm (vertical: 50.8 × 88.9). Sample details are invented.
import { ellipsePath, rectPath } from '../src/core/pathutil.js';
import { A, B, E, H, L, LN, LOGO, QR, R, T, W } from './kit.js';

const n = (v) => String(Math.round(v * 100) / 100);

/** Small repeatable random numbers, so art comes out the same on every render. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const poly = (pts, close = false) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}${close ? 'Z' : ''}`;

/** Smooth closed or open curve through points, as cubic Béziers. */
function spline(pts, close = false) {
  const N = pts.length;
  const at = (i) => (close ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < (close ? N : N - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d + (close ? 'Z' : '');
}

// Tiny engraved numerals and letters, for scales and stamps. Drawn as strokes on a 1 × 2 grid.
const STROKES = {
  0: [
    [
      [0.5, 0],
      [0.15, 0.2],
      [0, 0.7],
      [0, 1.3],
      [0.15, 1.8],
      [0.5, 2],
      [0.85, 1.8],
      [1, 1.3],
      [1, 0.7],
      [0.85, 0.2],
      [0.5, 0],
    ],
  ],
  1: [
    [
      [0.2, 0.45],
      [0.55, 0],
      [0.55, 2],
    ],
  ],
  2: [
    [
      [0, 0.5],
      [0.12, 0.15],
      [0.5, 0],
      [0.88, 0.15],
      [1, 0.5],
      [0.85, 0.95],
      [0, 2],
      [1, 2],
    ],
  ],
  3: [
    [
      [0.05, 0.25],
      [0.5, 0],
      [0.92, 0.2],
      [0.95, 0.6],
      [0.5, 0.95],
      [0.98, 1.25],
      [0.98, 1.7],
      [0.5, 2],
      [0.05, 1.75],
    ],
  ],
  4: [
    [
      [0.75, 2],
      [0.75, 0],
      [0, 1.4],
      [1, 1.4],
    ],
  ],
  5: [
    [
      [0.9, 0],
      [0.15, 0],
      [0.08, 0.9],
      [0.5, 0.75],
      [0.92, 0.95],
      [1, 1.4],
      [0.85, 1.8],
      [0.45, 2],
      [0.05, 1.8],
    ],
  ],
  6: [
    [
      [0.85, 0.12],
      [0.5, 0],
      [0.15, 0.3],
      [0, 1],
      [0, 1.5],
      [0.2, 1.9],
      [0.55, 2],
      [0.9, 1.8],
      [1, 1.4],
      [0.85, 1],
      [0.5, 0.9],
      [0.15, 1.05],
      [0, 1.4],
    ],
  ],
  7: [
    [
      [0, 0],
      [1, 0],
      [0.35, 2],
    ],
  ],
  8: [
    [
      [0.5, 0.95],
      [0.1, 0.7],
      [0.1, 0.3],
      [0.5, 0],
      [0.9, 0.3],
      [0.9, 0.7],
      [0.5, 0.95],
      [0.05, 1.25],
      [0.05, 1.7],
      [0.5, 2],
      [0.95, 1.7],
      [0.95, 1.25],
      [0.5, 0.95],
    ],
  ],
  9: [
    [
      [0.15, 1.88],
      [0.5, 2],
      [0.85, 1.7],
      [1, 1],
      [1, 0.5],
      [0.8, 0.1],
      [0.45, 0],
      [0.1, 0.2],
      [0, 0.6],
      [0.15, 1],
      [0.5, 1.1],
      [0.85, 0.95],
      [1, 0.6],
    ],
  ],
  '/': [
    [
      [0.1, 2],
      [0.9, 0],
    ],
  ],
};

// ---------------------------------------------------------------- Dentist: a whole mouth, one gold tooth.

const smileUpper = (x) => 13.8 - 0.0017 * (x - W / 2) ** 2;
const smileLower = (x) => 41.2 - 0.0017 * (x - W / 2) ** 2;
const UPPER_WIDTHS = [7.6, 8.4, 8.6, 9.2, 10, 11.6];
const LOWER_WIDTHS = [7.4, 8.2, 8.2, 8.6, 8.6, 8.4];

function toothColumns(widths) {
  const half = [...widths].reverse();
  const row = [...half.slice().reverse(), ...half];
  const total = row.reduce((a, b) => a + b, 0);
  let x = W / 2 - total / 2;
  return row.map((w, i) => {
    const c = { x0: x + 0.32, x1: x + w - 0.32, i };
    x += w;
    return c;
  });
}

function upperTooth({ x0, x1 }, canine) {
  const cx = (x0 + x1) / 2;
  const tip = smileUpper(cx);
  const r = 2.1;
  if (canine)
    return `M${n(x0)} -3L${n(x0)} ${n(tip - 3)}C${n(x0)} ${n(tip - 1.2)} ${n(cx - 2)} ${n(tip + 0.1)} ${n(cx)} ${n(tip + 0.9)}C${n(cx + 2)} ${n(tip + 0.1)} ${n(x1)} ${n(tip - 1.2)} ${n(x1)} ${n(tip - 3)}L${n(x1)} -3Z`;
  return `M${n(x0)} -3L${n(x0)} ${n(tip - r)}Q${n(x0)} ${n(tip)} ${n(x0 + r)} ${n(tip)}L${n(x1 - r)} ${n(tip)}Q${n(x1)} ${n(tip)} ${n(x1)} ${n(tip - r)}L${n(x1)} -3Z`;
}

function lowerTooth({ x0, x1 }) {
  const cx = (x0 + x1) / 2;
  const tip = smileLower(cx);
  const r = 1.9;
  return `M${n(x0)} ${n(H + 3)}L${n(x0)} ${n(tip + r)}Q${n(x0)} ${n(tip)} ${n(x0 + r)} ${n(tip)}L${n(x1 - r)} ${n(tip)}Q${n(x1)} ${n(tip)} ${n(x1)} ${n(tip + r)}L${n(x1)} ${n(H + 3)}Z`;
}

function gumLine(cols, upper) {
  const edge = upper ? -B : H + B;
  const off = upper ? -9.2 : 8.6;
  const line = (x) => (upper ? smileUpper(x) : smileLower(x)) + off;
  const dip = upper ? 1.5 : -1.5;
  let d = `M${-B} ${n(edge)}L${-B} ${n(line(cols[0].x0) + dip)}`;
  for (const c of cols) {
    const cx = (c.x0 + c.x1) / 2;
    const top = line(cx) - dip;
    d += `L${n(c.x0 - 0.32)} ${n(line(c.x0) + dip)}`;
    d += `C${n(c.x0 + 0.5)} ${n(top)} ${n(c.x1 - 0.5)} ${n(top)} ${n(c.x1 + 0.32)} ${n(line(c.x1) + dip)}`;
  }
  return `${d}L${n(W + B)} ${n(line(W) + dip)}L${n(W + B)} ${n(edge)}Z`;
}

function smile() {
  const up = toothColumns(UPPER_WIDTHS);
  const low = toothColumns(LOWER_WIDTHS);
  const goldIndex = 8;
  return {
    upper: up
      .filter((c) => c.i !== goldIndex)
      .map((c) => upperTooth(c, false))
      .join(''),
    gold: upperTooth(up[goldIndex], true),
    lower: low.map(lowerTooth).join(''),
    gumTop: gumLine(up, true),
    gumBottom: gumLine(low, false),
    glint: (() => {
      const cx = (up[goldIndex].x0 + up[goldIndex].x1) / 2 + 1.1;
      const cy = smileUpper(cx) - 4.4;
      const r = 1.5;
      return `M${n(cx)} ${n(cy - r)}Q${n(cx)} ${n(cy)} ${n(cx + r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy + r)}Q${n(cx)} ${n(cy)} ${n(cx - r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy - r)}Z`;
    })(),
  };
}

/** The dentist's own map of a mouth: 32 teeth around two arches, seen from above. */
function dentalChart(rx, ry) {
  const side = [2.3, 2.1, 2.6, 2.9, 2.9, 3.9, 3.9, 3.5];
  const teeth = [];
  const arch = (a0, a1, flip) => {
    const row = [...[...side].reverse(), ...side];
    const total = row.reduce((a, b) => a + b, 0);
    let t = 0;
    row.forEach((w, i) => {
      const u = (t + w / 2) / total;
      t += w;
      const a = a0 + (a1 - a0) * u;
      const x = rx + Math.cos(a) * rx;
      const y = ry + Math.sin(a) * ry * flip;
      const tan = Math.atan2(Math.cos(a) * ry * flip, -Math.sin(a) * rx);
      const size = w * 0.82;
      const depth = Math.max(size * 1.02, 2.7);
      const r = size * 0.34;
      const pts = [
        [-size / 2, -depth / 2],
        [size / 2, -depth / 2],
        [size / 2, depth / 2],
        [-size / 2, depth / 2],
      ];
      const ca = Math.cos(tan);
      const sa = Math.sin(tan);
      const map = ([px, py]) => [x + px * ca - py * sa, y + px * sa + py * ca];
      let d = '';
      pts.forEach((p, k) => {
        const q = pts[(k + 1) % 4];
        const dx = Math.sign(q[0] - p[0]);
        const dy = Math.sign(q[1] - p[1]);
        const a1p = map([p[0] + dx * r, p[1] + dy * r]);
        const b1p = map([q[0] - dx * r, q[1] - dy * r]);
        const c = map(q);
        const q2 = pts[(k + 2) % 4];
        const dx2 = Math.sign(q2[0] - q[0]);
        const dy2 = Math.sign(q2[1] - q[1]);
        const e = map([q[0] + dx2 * r, q[1] + dy2 * r]);
        d += `${k ? 'L' : 'M'}${n(a1p[0])} ${n(a1p[1])}L${n(b1p[0])} ${n(b1p[1])}Q${n(c[0])} ${n(c[1])} ${n(e[0])} ${n(e[1])}`;
      });
      teeth.push({ d: `${d}Z`, i, top: flip < 0 });
    });
  };
  const a0 = Math.PI * 0.03;
  const a1 = Math.PI * 0.97;
  arch(a0, a1, -1);
  arch(a0, a1, 1);
  return teeth;
}

/** A rounded box of any rotation, centred on (cx, cy). */
function roundedBox(cx, cy, w, h, r, angle = 0) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const m = (x, y) => `${n(cx + x * ca - y * sa)} ${n(cy + x * sa + y * ca)}`;
  const [a, b] = [w / 2, h / 2];
  return (
    `M${m(-a + r, -b)}L${m(a - r, -b)}Q${m(a, -b)} ${m(a, -b + r)}L${m(a, b - r)}Q${m(a, b)} ${m(a - r, b)}` +
    `L${m(-a + r, b)}Q${m(-a, b)} ${m(-a, b - r)}L${m(-a, -b + r)}Q${m(-a, -b)} ${m(-a + r, -b)}Z`
  );
}

// ---------------------------------------------------------------- Ayurveda: a pressed neem sprig on a herbarium sheet.

/** One serrated neem leaflet, curving like a sickle. Returns its outline and midrib. */
function leaflet(x, y, angle, len, wid, bend, teeth = 7) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const place = (px, py) => [x + px * ca - py * sa, y + px * sa + py * ca];
  const mid = (t) => [t * len, bend * len * t * t];
  const profile = (t) => wid * Math.sin(Math.PI * t ** 0.72) ** 0.8;
  const up = [];
  const down = [];
  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const [mx, my] = mid(t);
    up.push(place(mx, my - profile(t)));
    down.push(place(mx, my + profile(t) * 0.72));
    if (i < teeth) {
      const tm = t + 0.72 / teeth;
      const [hx, hy] = mid(tm);
      up.push(place(hx, hy - profile(tm) * 0.8));
      down.push(place(hx, hy + profile(tm) * 0.58));
    }
  }
  const outline = poly([...up, ...down.reverse()], true);
  const rib = spline([0, 0.5, 0.92].map((t) => place(...mid(t))));
  return { outline, rib };
}

/** A whole compound neem leaf: leaflets in near pairs along a curving stalk. */
function neemLeaf(x, y, angle, len, pairs, size, bend = 0.1, seed = 3) {
  const rnd = seeded(seed);
  let leaves = '';
  let ribs = '';
  const stalk = [];
  const STEPS = pairs + 1;
  const point = (t) => {
    const a = angle + bend * t * 2.2;
    return [x + Math.cos(a) * len * t, y + Math.sin(a) * len * t];
  };
  for (let i = 0; i <= STEPS; i++) stalk.push(point(i / STEPS));
  for (let i = 1; i <= pairs; i++) {
    const t = i / STEPS;
    const [px, py] = point(t);
    const heading = angle + bend * t * 2.2;
    const grow = 0.68 + 0.42 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    const L = size * grow;
    const jitter = () => (rnd() - 0.5) * 0.14;
    const a = leaflet(px, py, heading - 0.98 + jitter(), L, L * 0.2, 0.18);
    const off = (len / STEPS) * 0.26;
    const b = leaflet(px - Math.cos(heading) * off, py - Math.sin(heading) * off, heading + 0.98 + jitter(), L, L * 0.2, -0.18);
    leaves += a.outline + b.outline;
    ribs += a.rib + b.rib;
  }
  const [ex, ey] = point(1);
  const tip = leaflet(ex, ey, angle + bend * 2.2, size * 0.78, size * 0.15, 0.06);
  leaves += tip.outline;
  ribs += tip.rib;
  return { leaves, ribs, stalk: spline(stalk) };
}

function neemSprig() {
  const stem = [
    [20.6, 63],
    [21.6, 50],
    [24.2, 38],
    [25.6, 24],
    [24.4, 9],
  ];
  const parts = [
    neemLeaf(21.2, 52, -2.72, 17, 5, 7.2, 0.05, 2),
    neemLeaf(22.4, 44, -0.5, 21, 6, 7.4, 0.1, 4),
    neemLeaf(24.2, 37, -2.56, 19, 6, 7.2, 0.09, 6),
    neemLeaf(25.2, 28, -0.72, 18, 6, 6.6, 0.11, 8),
    neemLeaf(25.6, 21, -2.34, 16, 5, 6.2, 0.13, 10),
    neemLeaf(25.2, 14, -0.98, 12, 4, 5.4, 0.1, 12),
    neemLeaf(24.4, 9.6, -1.72, 7, 3, 4.2, 0.04, 14),
  ];
  const berries = [
    [14.6, 59.4],
    [12.2, 56.4],
    [16.4, 55.6],
    [31.2, 54.6],
    [34, 52],
    [29.6, 51],
  ];
  const twig =
    'M20.9 57C18.6 57.6 15.8 58 14.6 59.4M18.6 57.4C16.8 56.8 13.6 56.6 12.2 56.4M18.6 57.4C18 56.4 17 55.8 16.4 55.6M21.5 51.6C24.6 52.4 28.6 53.6 31.2 54.6M26.4 53C28.6 52.6 32 52.2 34 52M26.4 53C27.6 52 28.8 51.2 29.6 51';
  return {
    leaves: parts.map((p) => p.leaves).join(''),
    ribs: parts.map((p) => p.ribs).join(''),
    stalks: spline(stem) + parts.map((p) => p.stalk).join('') + twig,
    berries: berries.map(([x, y]) => ellipsePath(x, y, 0.95, 1.15)).join(''),
  };
}

// ---------------------------------------------------------------- Barber: a skin fade in real stubble, then a comb.

/** Short hairs thinning out from `top` to `bottom`, the way a fade does. */
function fadeHairs(w, top, bottom, count) {
  const rnd = seeded(41);
  let d = '';
  let made = 0;
  for (let tries = 0; tries < count * 8 && made < count; tries++) {
    const y = top + rnd() * (bottom - top);
    const u = (bottom - y) / (bottom - top);
    if (rnd() > u ** 1.75) continue;
    const x = -B + rnd() * (w + 2 * B);
    const len = 0.45 + 1.15 * u * (0.7 + rnd() * 0.5);
    const lean = 0.25 + (rnd() - 0.5) * 0.5;
    d += `M${n(x)} ${n(y)}L${n(x + Math.sin(lean) * len)} ${n(y - Math.cos(lean) * len)}`;
    made++;
  }
  return d;
}

/** A barber's comb: coarse teeth one end, fine the other, with the spine above them. */
function comb(x0, x1, spineTop, spineH, toothH) {
  const y0 = spineTop + spineH - 0.6;
  let d = roundedBox((x0 + x1) / 2, spineTop + spineH / 2, x1 - x0, spineH, 2.2);
  const split = x0 + (x1 - x0) * 0.56;
  let x = x0 + 0.2;
  let i = 0;
  while (x < x1 - 1) {
    const coarse = x < split;
    const tw = coarse ? 1.02 : 0.62;
    const pitch = coarse ? 1.92 : 1.2;
    const edge = x < x0 + 1 || x + tw + pitch > x1 - 0.2;
    const width = edge ? 1.5 : tw;
    const len = toothH * (edge ? 1 : 0.98);
    d += `M${n(x + width)} ${n(y0)}L${n(x + width * 0.86)} ${n(y0 + len - width / 2)}Q${n(x + width / 2)} ${n(y0 + len + 0.3)} ${n(x + width * 0.14)} ${n(y0 + len - width / 2)}L${n(x)} ${n(y0)}Z`;
    x += edge ? width + 0.8 : pitch;
    i++;
  }
  return i ? d : '';
}

// ---------------------------------------------------------------- Makeup artist: the bullet of a lipstick, and its swipe.

/** A dragged lipstick swipe with dry, streaked ends. Returns the solid swipe and the bare streaks through it. */
function lipstickSwipe(x0, y0, x1, y1, width, seed = 4) {
  const rnd = seeded(seed);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const m = (u, v) => [x0 + u * ca - v * sa, y0 + u * sa + v * ca];
  const BANDS = 30;
  const left = [];
  const right = [];
  let streaks = '';
  for (let i = 0; i <= BANDS; i++) {
    const v = (i / BANDS - 0.5) * width * (1 - 0.0 * i);
    const bow = Math.sin((i / BANDS) * Math.PI);
    left.push(m(-3 * bow + rnd() * 3.4 - (i % 2) * 2.2, v));
    left.push(m(-3 * bow + rnd() * 3.4 - (i % 2) * 2.2, v + width / BANDS));
    right.push(m(len + 4 * bow - rnd() * 7 - ((i + 1) % 2) * 3.4, v));
    right.push(m(len + 4 * bow - rnd() * 7 - ((i + 1) % 2) * 3.4, v + width / BANDS));
  }
  for (let i = 0; i < 12; i++) {
    const v = (rnd() - 0.5) * width * 0.92;
    const fromEnd = rnd() > 0.5;
    const u0 = fromEnd ? len * (0.76 + rnd() * 0.16) : -2;
    const u1 = fromEnd ? len + 4 : len * (0.04 + rnd() * 0.1);
    const th = 0.1 + rnd() * 0.28;
    streaks += poly([m(u0, v), m(u1, v - th / 2), m(u1, v + th / 2)], true);
  }
  return { swipe: poly([...left, ...right.reverse()], true), streaks };
}

// ---------------------------------------------------------------- Spa: a stack of rolled towels, a flower on top.

/** One rolled towel seen from the end: a spiral that starts tight and opens out. */
function towelSpiral(cx, cy, R, turns = 3.1, start = 0.4) {
  const pts = [];
  const STEPS = Math.round(turns * 7);
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const a = start + t * turns * Math.PI * 2;
    const r = R * (0.09 + 0.82 * t ** 0.92);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return spline(pts);
}

/** The five petals of a frangipani, each overlapping the next like a pinwheel. */
function frangipani(cx, cy, R) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const m = (x, y) => `${n(cx + x * c - y * s)} ${n(cy + x * s + y * c)}`;
    d += `M${m(R * 0.08, 0)}C${m(R * 0.24, -R * 0.52)} ${m(R * 0.86, -R * 0.62)} ${m(R, -R * 0.18)}C${m(R * 1.06, R * 0.12)} ${m(R * 0.62, R * 0.38)} ${m(R * 0.08, 0)}Z`;
  }
  return d;
}

// ---------------------------------------------------------------- Yoga: the twelve poses of a sun salutation, as one wheel.

const POSE = {
  pranam: {
    head: [0.05, -0.78],
    limbs: [
      [
        [0, -0.52],
        [0, 0.12],
        [0, 1],
      ],
      [
        [0, -0.46],
        [0.38, -0.14],
        [0.34, -0.5],
      ],
    ],
  },
  reach: {
    head: [-0.28, -0.72],
    limbs: [
      [
        [0.06, 1],
        [0.04, 0.14],
        [-0.17, -0.48],
      ],
      [
        [-0.17, -0.48],
        [-0.42, -0.98],
        [-0.55, -1.2],
      ],
    ],
  },
  fold: {
    head: [0.42, 0.66],
    limbs: [
      [
        [-0.1, 1],
        [-0.1, -0.02],
        [0.3, 0.1],
        [0.46, 0.36],
      ],
      [
        [0.46, 0.36],
        [0.62, 0.7],
        [0.66, 1],
      ],
    ],
  },
  lunge: {
    head: [0.52, -0.32],
    limbs: [
      [
        [0.68, 1],
        [0.66, 0.42],
        [0.08, 0.5],
      ],
      [
        [0.08, 0.5],
        [-0.42, 0.86],
        [-0.96, 1],
      ],
      [
        [0.08, 0.5],
        [0.3, -0.1],
      ],
      [
        [0.3, -0.1],
        [0.5, 0.42],
        [0.84, 1],
      ],
    ],
  },
  plank: {
    head: [0.86, 0.1],
    limbs: [
      [
        [-1, 1],
        [0.58, 0.32],
      ],
      [
        [0.58, 0.32],
        [0.62, 1],
      ],
    ],
  },
  eight: {
    head: [0.74, 0.78],
    limbs: [
      [
        [-1, 1],
        [-0.5, 0.98],
        [-0.14, 0.5],
        [0.38, 0.88],
      ],
      [
        [0.38, 0.88],
        [0.24, 0.5],
        [0.46, 1],
      ],
    ],
  },
  cobra: {
    head: [0.5, -0.1],
    limbs: [
      [
        [-1, 1],
        [-0.16, 0.92],
        [0.22, 0.56],
        [0.36, 0.14],
      ],
      [
        [0.36, 0.14],
        [0.5, 0.56],
        [0.48, 1],
      ],
    ],
  },
  mountain: {
    head: [0.36, 0.4],
    limbs: [
      [
        [-0.78, 1],
        [-0.02, -0.06],
        [0.82, 1],
      ],
    ],
  },
};
const SEQUENCE = ['pranam', 'reach', 'fold', 'lunge', 'plank', 'eight', 'cobra', 'mountain', 'lunge', 'fold', 'reach', 'pranam'];

/** One pose drawn at (cx, cy) at `s` mm per unit. Returns stroked limbs and a filled head. */
function pose(name, cx, cy, s, flip = 1) {
  const p = POSE[name];
  const at = ([x, y]) => [cx + flip * x * s, cy + y * s];
  return {
    limbs: p.limbs.map((l) => poly(l.map(at))).join(''),
    head: ellipsePath(...at(p.head), s * 0.2, s * 0.2),
  };
}

function poseWheel(cx, cy, R, s) {
  let limbs = '';
  let head = '';
  SEQUENCE.forEach((name, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12;
    const flip = i < 6 ? 1 : -1;
    const q = pose(name, cx + Math.cos(a) * R, cy + Math.sin(a) * R, s, flip);
    limbs += q.limbs;
    head += q.head;
  });
  return { limbs, head };
}

function poseRow(x0, x1, y, s) {
  let limbs = '';
  let head = '';
  SEQUENCE.forEach((name, i) => {
    const q = pose(name, x0 + ((x1 - x0) * (i + 0.5)) / 12, y, s);
    limbs += q.limbs;
    head += q.head;
  });
  return { limbs, head };
}

// ---------------------------------------------------------------- Gym: a loaded barbell, then one plate face on.

const PLATES = [
  { w: 4.5, h: 47, paint: '$a', label: '25' },
  { w: 4, h: 47, paint: '$b', label: '20' },
  { w: 3.1, h: 37, paint: '$c', label: '15' },
  { w: 2.5, h: 27, paint: '$d', label: '' },
];

/** The plates on one side of the bar, stacked outward from the collar, with their weights stamped sideways. */
function plateElements(side, inner) {
  const out = [];
  let x = inner;
  PLATES.forEach((p, i) => {
    const px = side < 0 ? x - p.w : x;
    out.push({ id: `pl${side}${i}`, type: 'rect', x: px, y: H / 2 - p.h / 2, w: p.w, h: p.h, r: 0.9, fill: p.paint });
    if (p.label) {
      const hh = 2.4;
      const chars = [...p.label];
      let d = '';
      chars.forEach((c, k) => {
        for (const seg of STROKES[c]) {
          d += poly(
            seg.map(([a, b]) => {
              const u = (a + k * 1.5) * (hh / 2);
              const v = (b * hh) / 2;
              return [px + p.w / 2 + (v - hh / 2) * 1, H / 2 + p.h / 2 - 4 - u];
            }),
          );
        }
      });
      out.push({ id: `st${side}${i}`, type: 'path', x: 0, y: 0, w: W, h: H, d, stroke: '$stamp', sw: 0.3, cap: 'round', join: 'round' });
    }
    x += side * (p.w + 0.38);
  });
  return out;
}

/** The raised rings and grip slots on the face of a bumper plate. */
function plateFace(cx, cy, r) {
  let grooves = '';
  for (const k of [0.92, 0.72]) grooves += ellipsePath(cx, cy, r * k, r * k);
  return grooves;
}

// ---------------------------------------------------------------- Mehendi: one giant paisley, worked in bands of line and dot.

const PAISLEY = [
  [86.4, 2.6],
  [81.4, 17.2],
  [74, 31],
  [62, 42.4],
  [44, 47.6],
  [24.4, 45.6],
  [9.4, 34.8],
  [4.2, 20.4],
  [11.4, 7.6],
  [28, 2.4],
  [48, 3.2],
  [66, 6],
  [78.6, 4.6],
];
const PAISLEY_C = [37.4, 25.4];

/** Points evenly spaced along the paisley outline, scaled towards its heart. */
function paisleyRing(scale, step) {
  const N = PAISLEY.length;
  const dense = [];
  for (let i = 0; i < N; i++) {
    const [p0, p1, p2, p3] = [PAISLEY[(i + N - 1) % N], PAISLEY[i], PAISLEY[(i + 1) % N], PAISLEY[(i + 2) % N]];
    for (let k = 0; k < 40; k++) {
      const t = k / 40;
      const b = (a0, a1, a2, a3) =>
        0.5 * (2 * a1 + (a2 - a0) * t + (2 * a0 - 5 * a1 + 4 * a2 - a3) * t * t + (3 * a1 - a0 - 3 * a2 + a3) * t ** 3);
      const x = b(p0[0], p1[0], p2[0], p3[0]);
      const y = b(p0[1], p1[1], p2[1], p3[1]);
      dense.push([PAISLEY_C[0] + (x - PAISLEY_C[0]) * scale, PAISLEY_C[1] + (y - PAISLEY_C[1]) * scale]);
    }
  }
  const out = [dense[0]];
  let run = 0;
  for (let i = 1; i < dense.length; i++) {
    run += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    if (run >= step) {
      out.push(dense[i]);
      run = 0;
    }
  }
  return out;
}

function paisleyLine(scale) {
  return spline(paisleyRing(scale, 3.2), true);
}

/** A tiny diamond bead: far lighter than a circle, and it prints the same at this size. */
const bead = (x, y, r) => `M${n(x - r)} ${n(y)}L${n(x)} ${n(y - r)}L${n(x + r)} ${n(y)}L${n(x)} ${n(y + r)}Z`;

/** Every band of the mehendi, by weight: fine lines, medium lines and solid dots and petals. */
function paisleyBands() {
  let fine = '';
  let medium = '';
  let solid = '';
  // Outer scallops, each with a dot in its arch.
  const sc = paisleyRing(0.955, 3.3);
  sc.forEach((p, i) => {
    const q = sc[(i + 1) % sc.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const dx = mx - PAISLEY_C[0];
    const dy = my - PAISLEY_C[1];
    const L = Math.hypot(dx, dy);
    medium += `M${n(p[0])} ${n(p[1])}Q${n(mx + (dx / L) * 2.2)} ${n(my + (dy / L) * 2.2)} ${n(q[0])} ${n(q[1])}`;
    solid += bead(mx - (dx / L) * 0.1, my - (dy / L) * 0.1, 0.42);
  });
  medium += paisleyLine(0.925);
  fine += paisleyLine(0.905);
  // A row of slanted leaves.
  const a = paisleyRing(0.875, 2.1);
  a.forEach((p, i) => {
    const q = a[(i + 1) % a.length];
    const dx = p[0] - PAISLEY_C[0];
    const dy = p[1] - PAISLEY_C[1];
    const L = Math.hypot(dx, dy);
    const nx = dx / L;
    const ny = dy / L;
    const tx = q[0] - p[0];
    const ty = q[1] - p[1];
    const tipx = p[0] + nx * 1.2 + tx * 0.8;
    const tipy = p[1] + ny * 1.2 + ty * 0.8;
    const basex = p[0] - nx * 0.9;
    const basey = p[1] - ny * 0.9;
    solid += `M${n(basex)} ${n(basey)}Q${n(basex + tx * 0.9)} ${n(basey + ty * 0.9)} ${n(tipx)} ${n(tipy)}Q${n(basex - tx * 0.1 + nx)} ${n(basey - ty * 0.1 + ny)} ${n(basex)} ${n(basey)}Z`;
  });
  fine += paisleyLine(0.838);
  // Tiny beads.
  for (const p of paisleyRing(0.82, 1.5)) solid += bead(p[0], p[1], 0.28);
  fine += paisleyLine(0.8);
  // Trellis: two zigzags in opposite phase make a lattice of diamonds.
  const outer = paisleyRing(0.785, 1.7);
  const count = outer.length;
  const innerRing = (() => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const p = outer[i];
      out.push([PAISLEY_C[0] + ((p[0] - PAISLEY_C[0]) * 0.71) / 0.785, PAISLEY_C[1] + ((p[1] - PAISLEY_C[1]) * 0.71) / 0.785]);
    }
    return out;
  })();
  const zig = (phase) => {
    const pts = [];
    for (let i = 0; i < count; i++) pts.push(((i + phase) % 2 ? outer : innerRing)[i]);
    return poly(pts, true);
  };
  fine += zig(0) + zig(1);
  for (let i = 0; i < count; i += 1) {
    const p = outer[i];
    const q = innerRing[(i + 1) % count];
    solid += bead((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0.2);
  }
  medium += paisleyLine(0.71);
  return { fine, medium, solid, edge: spline(paisleyRing(1, 3), true) };
}

/** A small mehendi flower: eight petals around a dot. */
function mFlower(cx, cy, R, count = 8) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const m = (x, y) => `${n(cx + x * c - y * s)} ${n(cy + x * s + y * c)}`;
    d += `M${m(R * 0.24, 0)}Q${m(R * 0.62, -R * 0.3)} ${m(R, 0)}Q${m(R * 0.62, R * 0.3)} ${m(R * 0.24, 0)}Z`;
  }
  return d + ellipsePath(cx, cy, R * 0.15, R * 0.15);
}

/** A small paisley motif for the jaal. */
function mPaisley(cx, cy, s, angle = 0) {
  const c = Math.cos(angle);
  const si = Math.sin(angle);
  const m = (x, y) => `${n(cx + (x * c - y * si) * s)} ${n(cy + (x * si + y * c) * s)}`;
  const outer = `M${m(0.72, -0.86)}C${m(0.9, -0.2)} ${m(0.72, 0.8)} ${m(-0.1, 0.84)}C${m(-0.9, 0.84)} ${m(-0.96, -0.2)} ${m(-0.3, -0.42)}C${m(0.08, -0.54)} ${m(0.42, -0.42)} ${m(0.72, -0.86)}Z`;
  const inner = `M${m(0.34, -0.2)}C${m(0.46, 0.2)} ${m(0.26, 0.48)} ${m(-0.1, 0.48)}C${m(-0.54, 0.48)} ${m(-0.56, -0.08)} ${m(-0.2, -0.16)}C${m(-0.02, -0.2)} ${m(0.18, -0.14)} ${m(0.34, -0.2)}Z`;
  return { outer, inner, dot: ellipsePath(cx + (-0.08 * c - 0.14 * si) * s, cy + (-0.08 * si + 0.14 * c) * s, s * 0.11, s * 0.11) };
}

function jaal(w, h, pitchX, pitchY) {
  let lines = '';
  let solid = '';
  let thin = '';
  for (let k = -8; k <= 12; k++) {
    const x0 = k * pitchX;
    lines += `M${n(x0)} 0L${n(x0 + (h / pitchY) * pitchX)} ${n(h)}`;
    lines += `M${n(x0)} 0L${n(x0 - (h / pitchY) * pitchX)} ${n(h)}`;
  }
  let row = 0;
  for (let y = pitchY / 2; y < h + pitchY; y += pitchY / 2, row++) {
    for (let col = -1; col * pitchX < w + pitchX; col++) {
      const x = col * pitchX + (row % 2 ? 0 : pitchX / 2);
      if (row % 2) {
        const q = mPaisley(x, y, pitchY * 0.24, row % 4 === 1 ? 0.2 : Math.PI + 0.2);
        thin += q.outer + q.inner;
        solid += q.dot;
      } else {
        solid += mFlower(x, y, pitchY * 0.22, 6);
      }
    }
  }
  return { lines, solid, thin };
}

const SAMPLE_PHONE = '+91 98765 43210';

export const SET_3 = [
  // Full Smile: the card is an open mouth, and one tooth is gold. The back is the dentist's own chart of all 32, around a QR code.
  (() => {
    const art = smile();
    const rx = 20;
    const ry = 21.6;
    const chart = dentalChart(rx, ry);
    const goldTop = chart.find((t) => t.top && t.i === 11);
    const cx = W - 4.2 - rx;
    const at = { x: cx - rx, y: H / 2 - ry, w: 2 * rx, h: 2 * ry };
    return {
      id: 'full-smile',
      name: 'Full Smile',
      category: 'health',
      tags: ['dentist', 'dental', 'orthodontist', 'clinic', 'playful'],
      fonts: { heading: 'baloo2', body: 'dmsans' },
      palettes: [
        { label: 'Berry', mouth: '#3B0B2E', gum: '#EF5B7E', tooth: '#FFFDF7', gold: '#F4B731', soft: '#FFC2D0' },
        { label: 'Lagoon', mouth: '#06343A', gum: '#25BFA4', tooth: '#FFFFFF', gold: '#FFCB3D', soft: '#A5EFE0' },
        { label: 'Grape', mouth: '#1E1250', gum: '#8E7BF2', tooth: '#FFFEFA', gold: '#FFC23C', soft: '#CFC6FF' },
        { label: 'Terracotta', mouth: '#5A1A0D', gum: '#F08A5D', tooth: '#FFF9EE', gold: '#F9D04A', soft: '#FFD2B8' },
      ],
      sample: {
        name: 'Dr. Ritika Bhandari',
        title: 'BDS, MDS (Orthodontics)',
        company: 'Daant Dental Studio',
        tagline: 'Open wide. We will take it from here.',
        phone: SAMPLE_PHONE,
        email: 'hello@daantstudio.example',
        website: 'daantstudio.example',
        address: 'Linking Road, Khar West, Mumbai',
        hours: 'Mon to Sat, 10 am to 8 pm',
      },
      sides: {
        front: {
          background: '$mouth',
          stacks: { mouth: { x: 9, y: 15.6, w: W - 18, h: 23.4, anchor: 'middle', gap: 1 } },
          elements: [
            A('upper', art.upper, { fill: '$tooth' }),
            A('gold', art.gold, { fill: '$gold' }),
            A('lower', art.lower, { fill: '$tooth' }),
            A('gumtop', art.gumTop, { fill: '$gum' }),
            A('gumbot', art.gumBottom, { fill: '$gum' }),
            A('glint', art.glint, { fill: '#FFFFFF' }),
            T('name', '{name}', 9, W - 18, 21, {
              stack: 'mouth',
              font: '$heading',
              weight: 800,
              fill: '$tooth',
              align: 'center',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1.02,
            }),
            T('role', '{title}', 9, W - 18, 7.4, {
              stack: 'mouth',
              weight: 600,
              fill: '$soft',
              align: 'center',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.18,
            }),
            T('phone', '{phone}', 9, W - 18, 10, {
              stack: 'mouth',
              weight: 800,
              fill: '$gold',
              align: 'center',
              minSize: 7.5,
              noWrap: true,
              lineHeight: 1.15,
              gap: 1.3,
            }),
            T('email', '{email}', 9, W - 18, 6.6, {
              stack: 'mouth',
              fill: '$soft',
              align: 'center',
              minSize: 5.6,
              noWrap: true,
              lineHeight: 1.15,
              gap: 0.3,
            }),
          ],
        },
        back: {
          background: '$tooth',
          stacks: {
            brand: { x: 5, y: 5, w: 35.5, h: 21, anchor: 'top', gap: 1.1 },
            reach: { x: 5, y: 26.6, w: 38.4, h: 19.6, anchor: 'bottom' },
          },
          elements: [
            ...chart.filter((t) => t !== goldTop).map((t, i) => ({ id: `t${i}`, type: 'path', ...at, d: t.d, stroke: '$mouth', sw: 0.22 })),
            { id: 'tgold', type: 'path', ...at, d: goldTop.d, fill: '$gold', stroke: '$mouth', sw: 0.22 },
            QR('qr', cx - 13, H / 2 - 13, 26, { r: 1.5, quiet: 1.4 }),
            LOGO('logo', 5, 5, 9, '$mouth', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 5, 35.5, 14, {
              stack: 'brand',
              font: '$heading',
              weight: 800,
              fill: '$mouth',
              minSize: 9,
              maxLines: 3,
              lineHeight: 1.04,
            }),
            T('tag', '{tagline}', 5, 35.5, 6.6, {
              stack: 'brand',
              fill: '$mouth',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.22,
              optional: true,
            }),
            L('contact', ['phone', 'website', 'hours'], 5, 38.4, 6.5, { stack: 'reach', icons: false, fill: '$mouth', rowHeight: 1.55 }),
            T('addr', '{address}', 5, 38.4, 6.3, { stack: 'reach', fill: '$mouth', minSize: 5.6, maxLines: 3, lineHeight: 1.2, gap: 0.4 }),
          ],
        },
      },
    };
  })(),

  // Herbarium: a neem sprig pressed on the sheet, with your details on the specimen label.
  (() => {
    const sprig = neemSprig();
    const big = neemLeaf(-6, 84, -1.16, 86, 8, 21, 0.06, 9);
    const up = { x: 1.8, y: -2.6, vb: [0, 0, H, W] };
    const sw = H * 0.92;
    const sh = W * 0.92;
    const LX = 7.6;
    const LW = H - 2 * LX;
    return {
      id: 'herbarium',
      name: 'Herbarium',
      category: 'health',
      tags: ['ayurveda', 'wellness', 'vaidya', 'herbal', 'naturopathy', 'botanical'],
      orientation: 'vertical',
      fonts: { heading: 'cormorant', body: 'outfit' },
      palettes: [
        {
          label: 'Neem',
          paper: '#F3EBD8',
          leaf: '#2F5D34',
          rib: '#BFD1A0',
          stem: '#5B4A2A',
          berry: '#C9A227',
          tape: '#E7DBC0',
          ink: '#22301F',
          soft: '#7A6A45',
          stamp: '#A23B2A',
          deep: '#1E3D26',
          pale: '#2C5536',
        },
        {
          label: 'Turmeric',
          paper: '#FBF0CF',
          leaf: '#5C6B1F',
          rib: '#D7DC97',
          stem: '#6B4A18',
          berry: '#D9811E',
          tape: '#F1E2B4',
          ink: '#2F2A10',
          soft: '#8A7330',
          stamp: '#B5451A',
          deep: '#6D3F06',
          pale: '#865212',
        },
        {
          label: 'Ash',
          paper: '#ECEDE6',
          leaf: '#23403F',
          rib: '#A7BDB3',
          stem: '#3E3A32',
          berry: '#B9673A',
          tape: '#DFE0D6',
          ink: '#1B2526',
          soft: '#6C7470',
          stamp: '#8C2F39',
          deep: '#16282A',
          pale: '#21393B',
        },
        {
          label: 'Kumkum',
          paper: '#F7E8E0',
          leaf: '#6A2331',
          rib: '#E2B4A6',
          stem: '#4E2C22',
          berry: '#C98A1E',
          tape: '#EFDACD',
          ink: '#34141B',
          soft: '#8E6355',
          stamp: '#3F5A34',
          deep: '#51121F',
          pale: '#6A1C2C',
        },
      ],
      sample: {
        name: 'Vaidya Ira Menon',
        title: 'BAMS, Ayurveda Physician',
        company: 'Nimba Ayurveda',
        tagline: 'Rooted in daily routine',
        phone: SAMPLE_PHONE,
        website: 'nimbaayurveda.example',
        email: 'ira@nimbaayurveda.example',
        address: 'Panampilly Nagar, Kochi',
        hours: 'Mon to Sat, 9 am to 6 pm',
      },
      sides: {
        front: {
          background: '$paper',
          stacks: { label: { x: LX, y: 55.2, w: LW, h: 28.6, anchor: 'middle', gap: 0.9 } },
          elements: [
            A('stalks', sprig.stalks, { ...up, stroke: '$stem', sw: 0.36, cap: 'round', join: 'round' }, sw, sh),
            A('leaves', sprig.leaves, { ...up, fill: '$leaf' }, sw, sh),
            A('ribs', sprig.ribs, { ...up, stroke: '$rib', sw: 0.1 }, sw, sh),
            A('berries', sprig.berries, { ...up, fill: '$berry' }, sw, sh),
            R('strap1', 18.6, 31.4, 11, 2.2, '$tape', { stroke: '$soft', sw: 0.08, rot: -12 }),
            E('stampring', 35, 4.6, 11.4, 11.4, undefined, { stroke: '$stamp', sw: 0.3, opacity: 0.85 }),
            E('stampring2', 35.8, 5.4, 9.8, 9.8, undefined, { stroke: '$stamp', sw: 0.14, opacity: 0.85 }),
            LOGO('logo', 35.8, 5.4, 9.8, '$stamp', { fallbackSize: 12 }),
            R('card', 4.8, 52.8, H - 9.6, 33.4, '#FFFDF6', { stroke: '$ink', sw: 0.2 }),
            T('co', '{company}', LX, LW, 12.6, {
              stack: 'label',
              font: '$heading',
              weight: 700,
              fill: '$ink',
              minSize: 8,
              maxLines: 2,
              lineHeight: 1.02,
            }),
            LN('rule', LX, 0, LW, '$ink', 0.14, { stack: 'label' }),
            T('name', '{name}', LX, LW, 13, {
              stack: 'label',
              font: 'caveat',
              weight: 700,
              fill: '$ink',
              minSize: 9,
              maxLines: 2,
              lineHeight: 1,
            }),
            T('role', '{title}', LX, LW, 6.6, { stack: 'label', fill: '$soft', minSize: 5.6, maxLines: 2, lineHeight: 1.2 }),
            T('phone', '{phone}', LX, LW, 7.4, { stack: 'label', weight: 700, fill: '$ink', minSize: 6.5, noWrap: true, lineHeight: 1.15 }),
          ],
        },
        back: {
          background: '$deep',
          stacks: { label: { x: 4.6, y: 37.6, w: H - 9.2, h: 47.2, anchor: 'top', gap: 1.1 } },
          elements: [
            A('leaf', big.leaves, { fill: '$pale' }, H, W),
            A('stalk', big.stalk, { stroke: '$pale', sw: 0.5 }, H, W),
            QR('qr', H / 2 - 13, 4.6, 26, { r: 1.2 }),
            R('card', -B, 34.4, H + 2 * B, W - 34.4 + B, '$paper'),
            T('co', '{company}', 4.6, H - 9.2, 15, {
              stack: 'label',
              font: '$heading',
              weight: 700,
              fill: '$deep',
              minSize: 9,
              maxLines: 3,
              lineHeight: 1,
            }),
            T('tag', '{tagline}', 4.6, H - 9.2, 6.8, {
              stack: 'label',
              fill: '$stamp',
              weight: 500,
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.2,
              optional: true,
            }),
            LN('rule', 4.6, 0, 12, '$soft', 0.2, { stack: 'label', gap: 1.6 }),
            L('contact', ['email', 'website', 'address', 'hours'], 4.6, H - 9.2, 6.5, {
              stack: 'label',
              fill: '$ink',
              icons: false,
              gap: 1.2,
            }),
          ],
        },
      },
    };
  })(),

  // Skin Fade: the card is a haircut. Real stubble thins out across it, down to clean skin where your name sits. The back is a comb.
  (() => {
    const fadeTop = 10.6;
    const fadeEnd = 25;
    const hairs = fadeHairs(W, fadeTop, fadeEnd, 2000);
    return {
      id: 'skin-fade',
      name: 'Skin Fade',
      category: 'beauty',
      tags: ['barber', 'salon', 'mens grooming', 'haircut', 'bold'],
      fonts: { heading: 'bebas', body: 'spacegrotesk' },
      palettes: [
        { label: 'Classic', hair: '#14110F', skin: '#E7C09A', edge: '#D3A47A', accent: '#A7281E' },
        { label: 'Bone', hair: '#0E0E10', skin: '#F2EEE5', edge: '#DAD4C6', accent: '#1F4FBF' },
        { label: 'Deep', hair: '#0C0806', skin: '#B47A4E', edge: '#9A6339', accent: '#3A1206' },
        { label: 'Pomade', hair: '#2A0F3A', skin: '#F4C6A8', edge: '#E4AB88', accent: '#D1274B' },
      ],
      sample: {
        name: 'Imran Shaikh',
        title: 'Master Barber',
        company: 'The Fade Room',
        phone: SAMPLE_PHONE,
        website: 'thefaderoom.example',
        address: 'Carter Road, Bandra West, Mumbai',
        hours: 'Tue to Sun, 11 am to 9 pm',
      },
      sides: {
        front: {
          background: {
            type: 'linear',
            angle: 180,
            stops: [
              [0, '$edge'],
              [0.5, '$skin'],
              [1, '$skin'],
            ],
          },
          stacks: {
            band: { x: 4.6, y: 2.9, w: W - 18, h: 7.2, anchor: 'middle' },
            who: { x: 4.6, y: 26, w: W - 9.2, h: 12.4, anchor: 'bottom' },
            role: { x: 4.6, y: 38.9, w: 37, h: 7.9, anchor: 'top' },
            reach: { x: 43, y: 38.9, w: W - 47.6, h: 7.9, anchor: 'top' },
          },
          elements: [
            R('solid', -B, -B, W + 2 * B, fadeTop + B + 0.4, '$hair'),
            A('hairs', hairs, { stroke: '$hair', sw: 0.24, cap: 'round' }),
            LOGO('logo', W - 11.8, 2.9, 7.2, '$skin', { fallbackSize: 13 }),
            T('co', '{company}', 4.6, W - 18, 17, {
              stack: 'band',
              font: '$heading',
              fill: '$skin',
              minSize: 8.5,
              noWrap: true,
              lineHeight: 1,
              tracking: 0.05,
            }),
            T('name', '{name}', 4.6, W - 9.2, 31, {
              stack: 'who',
              font: '$heading',
              fill: '$hair',
              minSize: 12,
              maxLines: 2,
              lineHeight: 0.98,
            }),
            T('role', '{title}', 4.6, 37, 7, { stack: 'role', weight: 700, fill: '$accent', minSize: 5.8, maxLines: 2, lineHeight: 1.15 }),
            L('contact', ['phone', 'hours'], 43, W - 47.6, 6.6, {
              stack: 'reach',
              icons: false,
              align: 'right',
              weight: 500,
              fill: '$hair',
              rowHeight: 1.55,
            }),
          ],
        },
        back: {
          background: '$hair',
          stacks: {
            spine: { x: 9, y: 3.4, w: W - 18, h: 9.6, anchor: 'middle' },
            reach: { x: 4.6, y: 22, w: 51.6, h: 24.8, anchor: 'bottom', gap: 1.6 },
          },
          elements: [
            A('comb', comb(4.6, 84.3, 3.4, 9.6, 6.4), { fill: '$skin' }),
            T('co', '{company}', 9, W - 18, 22, {
              stack: 'spine',
              font: '$heading',
              fill: '$hair',
              align: 'center',
              minSize: 9,
              noWrap: true,
              lineHeight: 1,
              tracking: 0.03,
            }),
            QR('qr', W - 30.6, 20.8, 26, { r: 1 }),
            L('contact', ['phone', 'email', 'website', 'address'], 4.6, 51.6, 6.6, {
              stack: 'reach',
              weight: 500,
              fill: '$skin',
              iconFill: '$skin',
            }),
          ],
        },
      },
    };
  })(),

  // Bullet: the whole card is a lipstick, in the shade you pick. The back is its swipe.
  (() => {
    const cx = H / 2;
    const up = { x: 0, y: -4.4 };
    const bullet = 'M15 50L15 31C15.2 24 26 10.6 33.4 6.6C35.2 5.6 35.8 6.8 35.8 9L35.8 50Z';
    const facet = 'M15 31C15.2 24 26 10.6 33.4 6.6C35.2 5.6 35.8 6.8 35.8 9C34.4 17.6 25 29.8 17.6 33.2C15.8 34 15 33 15 31Z';
    const metal = {
      type: 'linear',
      angle: 90,
      stops: [
        [0, '$goldDark'],
        [0.2, '$gold'],
        [0.38, '$goldLit'],
        [0.6, '$gold'],
        [1, '$goldDark'],
      ],
    };
    const { swipe, streaks } = lipstickSwipe(-6, 74, 60, 10, 42);
    const caseTop = 53;
    return {
      id: 'lipstick-bullet',
      name: 'Bullet',
      category: 'beauty',
      tags: ['makeup artist', 'mua', 'bridal makeup', 'cosmetics', 'luxury'],
      orientation: 'vertical',
      fonts: { heading: 'playfair', body: 'outfit' },
      palettes: [
        {
          label: 'Sindoor',
          bg: '#F7DFCF',
          shade: '#B3122B',
          shadeLit: '#DE3C4B',
          shadeDeep: '#7D0A1E',
          coInk: '#7D0A1E',
          roleInk: '#D2A24C',
          case: '#14100F',
          gold: '#D2A24C',
          goldLit: '#F8E3AE',
          goldDark: '#8C6420',
          text: '#F7DFCF',
        },
        {
          label: 'Rani',
          bg: '#FCE6EE',
          shade: '#C2185B',
          shadeLit: '#EC4C8B',
          shadeDeep: '#8A0F40',
          coInk: '#8A0F40',
          roleInk: '#CDA5B0',
          case: '#1C0F1E',
          gold: '#CDA5B0',
          goldLit: '#F8E4EA',
          goldDark: '#8A5F6C',
          text: '#FCE6EE',
        },
        {
          label: 'Nude',
          bg: '#2A1B18',
          shade: '#B6705A',
          shadeLit: '#D99A83',
          shadeDeep: '#8A4F3C',
          coInk: '#F3E3D6',
          roleInk: '#7A5A26',
          case: '#F3E3D6',
          gold: '#CFA869',
          goldLit: '#F6E5BD',
          goldDark: '#8B6A33',
          text: '#2A1B18',
        },
        {
          label: 'Plum',
          bg: '#EDE3F1',
          shade: '#5A1846',
          shadeLit: '#8A3372',
          shadeDeep: '#380D2B',
          coInk: '#380D2B',
          roleInk: '#B9BCC4',
          case: '#0F0A14',
          gold: '#B9BCC4',
          goldLit: '#F2F3F6',
          goldDark: '#6F727B',
          text: '#EDE3F1',
        },
      ],
      sample: {
        name: 'Naina Sethi',
        title: 'Bridal and Party Makeup Artist',
        company: 'Naina Sethi Studio',
        phone: SAMPLE_PHONE,
        email: 'hello@nainasethi.example',
        website: 'nainasethi.example',
      },
      sides: {
        front: {
          background: '$bg',
          stacks: {
            who: { x: 4.4, y: caseTop + 2.8, w: H - 8.8, h: 16, anchor: 'middle', gap: 0.9 },
            reach: { x: 4.4, y: 72.2, w: H - 8.8, h: 12.6, anchor: 'bottom' },
          },
          elements: [
            A(
              'bullet',
              bullet,
              {
                ...up,
                fill: {
                  type: 'linear',
                  angle: 90,
                  stops: [
                    [0, '$shadeDeep'],
                    [0.3, '$shade'],
                    [0.46, '$shadeLit'],
                    [0.62, '$shade'],
                    [1, '$shadeDeep'],
                  ],
                },
              },
              H,
              W,
            ),
            A('facet', facet, { ...up, fill: '$shadeLit' }, H, W),
            R('collar', cx - 11.6, 42.6, 23.2, 10.4, metal),
            R('collarlip', cx - 11.6, 42.6, 23.2, 0.5, '$goldLit'),
            R('collarband', cx - 11.6, 50.4, 23.2, 0.5, '$goldDark'),
            R('case', -B, caseTop, H + 2 * B, W - caseTop + B, '$case'),
            R('caseline', -B, caseTop, H + 2 * B, 0.7, '$gold'),
            LOGO('logo', 4.4, 4.4, 11, '$coInk', { fallbackFont: '$heading' }),
            T('name', '{name}', 4.4, H - 8.8, 20, {
              stack: 'who',
              font: '$heading',
              weight: 500,
              fill: '$text',
              align: 'center',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1.04,
            }),
            T('role', '{title}', 4.4, H - 8.8, 6.5, {
              stack: 'who',
              fill: '$roleInk',
              align: 'center',
              minSize: 5.6,
              maxLines: 3,
              lineHeight: 1.18,
            }),
            L('contact', ['phone', 'website', 'email'], 4.4, H - 8.8, 6.6, {
              stack: 'reach',
              icons: false,
              align: 'center',
              weight: 600,
              fill: '$text',
              rowHeight: 1.6,
            }),
          ],
        },
        back: {
          background: '$bg',
          stacks: { brand: { x: 10.6, y: 33.4, w: 30, h: 22, anchor: 'middle', gap: 1.2 } },
          elements: [
            A('swipe', swipe, { fill: '$shade' }, H, W),
            A('streaks', streaks, { fill: '$shadeLit', opacity: 0.55 }, H, W),
            T('co', '{company}', 10.6, 30, 15, {
              stack: 'brand',
              font: '$heading',
              weight: 700,
              fill: '$bg',
              minSize: 8.5,
              maxLines: 4,
              lineHeight: 1.04,
            }),
            T('tag', '{tagline}', 10.6, 30, 6.6, {
              stack: 'brand',
              fill: '$bg',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.2,
              optional: true,
            }),
            QR('qr', H - 30.4, W - 30.4, 26, { r: 0.8 }),
          ],
        },
      },
    };
  })(),

  // Towel Fold: rolled towels stacked like a spa shelf, a single flower on top, and all the room in the world.
  (() => {
    const roll = 7.4;
    const rows = [
      { y: H - 3.6, xs: [55, 70, 85, 100] },
      { y: H - 16.5, xs: [62.5, 77.5, 92.5] },
      { y: H - 29.4, xs: [70, 85] },
    ];
    const rolls = rows.flatMap((r, ri) => r.xs.map((x, i) => ({ x, y: r.y, k: (ri + i) % 3 })));
    const discFor = (k) =>
      rolls
        .filter((r) => r.k === k)
        .map((r) => ellipsePath(r.x, r.y, roll, roll))
        .join('');
    const spirals = rolls.map((r) => towelSpiral(r.x, r.y, roll, 3.1, r.x * 0.3)).join('');
    const fx = 77;
    const fy = 8.6;
    const backRolls = [];
    for (let row = 0; row < 6; row++) {
      for (let c = -1; c < 10; c++) backRolls.push([c * 11.4 + (row % 2 ? 5.7 : 0), row * 9.9 + 0.4]);
    }
    const backSpirals = backRolls.map(([x, y]) => towelSpiral(x, y, 5.5, 2.4, x)).join('');
    const backDiscs = backRolls.map(([x, y]) => ellipsePath(x, y, 5.5, 5.5)).join('');
    return {
      id: 'towel-fold',
      name: 'Towel Fold',
      category: 'beauty',
      tags: ['spa', 'massage', 'wellness', 'retreat', 'calm'],
      fonts: { heading: 'marcellus', body: 'outfit' },
      palettes: [
        {
          label: 'Eucalyptus',
          bg: '#DDE5D8',
          t1: '#F7F4EA',
          t2: '#B9CBB7',
          t3: '#6D8F7E',
          line: '#3F5F52',
          ink: '#22392F',
          petal: '#FFFDF5',
          glow: '#F2B84B',
          deep: '#2C4A3E',
          soft: '#3A5C4E',
        },
        {
          label: 'Sand',
          bg: '#F2E7D8',
          t1: '#FFFBF3',
          t2: '#E0C7A8',
          t3: '#B08D68',
          line: '#6F5236',
          ink: '#3A2A1B',
          petal: '#FFFFFF',
          glow: '#EFA93C',
          deep: '#5B4029',
          soft: '#6C4F35',
        },
        {
          label: 'Night',
          bg: '#12282B',
          t1: '#E9E5D6',
          t2: '#7FA3A0',
          t3: '#2F5D5F',
          line: '#0C1D1F',
          ink: '#EFEBDD',
          petal: '#FFFBF0',
          glow: '#F4BC52',
          deep: '#0B1C1F',
          soft: '#1E3E41',
        },
        {
          label: 'Lotus',
          bg: '#F6E1E0',
          t1: '#FFF8F4',
          t2: '#E9BDBA',
          t3: '#B97F86',
          line: '#7A4650',
          ink: '#47222B',
          petal: '#FFFFFF',
          glow: '#EDAA45',
          deep: '#6B3540',
          soft: '#7D4250',
        },
      ],
      sample: {
        name: 'Maya Fernandes',
        title: 'Founder and Lead Therapist',
        company: 'Stillwater Spa',
        tagline: 'Leave the day at the door',
        phone: SAMPLE_PHONE,
        website: 'stillwaterspa.example',
        address: 'Candolim, North Goa',
        hours: 'By appointment, 10 am to 8 pm',
      },
      sides: {
        front: {
          background: '$bg',
          stacks: {
            who: { x: 5.4, y: 5.4, w: 44, h: 18.6, anchor: 'top', gap: 1 },
            reach: { x: 5.4, y: 24.6, w: 41.4, h: 21.4, anchor: 'bottom', gap: 0.5 },
          },
          elements: [
            A('d1', discFor(0), { fill: '$t1' }),
            A('d2', discFor(1), { fill: '$t2' }),
            A('d3', discFor(2), { fill: '$t3' }),
            A('spirals', spirals, { stroke: '$line', sw: 0.2, cap: 'round' }),
            A('flower', frangipani(fx, fy, 5.6), { fill: '$petal', stroke: '$line', sw: 0.1, join: 'round' }),
            E('heart', fx - 1.6, fy - 1.6, 3.2, 3.2, {
              type: 'radial',
              cx: 0.5,
              cy: 0.5,
              r: 0.5,
              stops: [
                [0, '$glow'],
                [1, '$petal'],
              ],
            }),
            T('co', '{company}', 5.4, 44, 18, { stack: 'who', font: '$heading', fill: '$ink', minSize: 10, maxLines: 3, lineHeight: 1.06 }),
            T('tag', '{tagline}', 5.4, 44, 6.8, {
              stack: 'who',
              weight: 300,
              fill: '$ink',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.22,
              optional: true,
            }),
            T('person', '{name}', 5.4, 41.4, 8, { stack: 'reach', weight: 500, fill: '$ink', minSize: 6.5, maxLines: 2, lineHeight: 1.15 }),
            T('role', '{title}', 5.4, 41.4, 6.4, {
              stack: 'reach',
              weight: 300,
              fill: '$ink',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.18,
              optional: true,
            }),
            L('contact', ['phone', 'website', 'address'], 5.4, 41.4, 6.5, {
              stack: 'reach',
              icons: false,
              fill: '$ink',
              gap: 1.2,
              rowHeight: 1.6,
            }),
          ],
        },
        back: {
          background: '$deep',
          stacks: { brand: { x: 10.6, y: 9.4, w: 41.6, h: 32, anchor: 'middle', gap: 1.3 } },
          elements: [
            A('discs', backDiscs, { fill: '$soft' }),
            A('spirals', backSpirals, { stroke: '$deep', sw: 0.22, cap: 'round' }),
            R('plaque', 7, 6.4, W - 14, H - 12.8, '$bg', { r: 3 }),
            LOGO('logo', 10.6, 9, 9.4, '$ink', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 10.6, 41.6, 12.5, {
              stack: 'brand',
              font: '$heading',
              fill: '$ink',
              minSize: 8,
              maxLines: 4,
              lineHeight: 1.06,
            }),
            L('contact', ['email', 'hours'], 10.6, 41.6, 6.5, { stack: 'brand', icons: false, fill: '$ink', rowHeight: 1.6 }),
            QR('qr', W - 35.4, H / 2 - 13, 26, { r: 1 }),
          ],
        },
      },
    };
  })(),

  // Twelve Poses: a sun salutation as a wheel, each pose in its place, turning around a rising sun.
  (() => {
    const cx = 66.4;
    const cy = H / 2;
    const wheel = poseWheel(cx, cy, 16.6, 2.85);
    const row = poseRow(-1, W + 1, 39.8, 2.7);
    const sun = 9.8;
    return {
      id: 'twelve-poses',
      name: 'Twelve Poses',
      category: 'health',
      tags: ['yoga', 'yoga teacher', 'instructor', 'fitness', 'wellness'],
      fonts: { heading: 'bricolage', body: 'dmsans' },
      palettes: [
        {
          label: 'Sunrise',
          top: '#FFD9A0',
          bottom: '#FFF3DE',
          sun: '#F46A2E',
          sunLit: '#FFB14E',
          ink: '#3C1810',
          deep: '#3C1810',
          pale: '#FFE8C7',
        },
        {
          label: 'Dawn',
          top: '#BFD6F2',
          bottom: '#F4F0E6',
          sun: '#E85D75',
          sunLit: '#FFB27F',
          ink: '#14274A',
          deep: '#14274A',
          pale: '#E3ECF8',
        },
        {
          label: 'Clay',
          top: '#E9A67C',
          bottom: '#F7DDBE',
          sun: '#B8391A',
          sunLit: '#E8622C',
          ink: '#34130A',
          deep: '#34130A',
          pale: '#FBE3C8',
        },
        {
          label: 'Sage',
          top: '#CFDDBF',
          bottom: '#F4F3E2',
          sun: '#C07A16',
          sunLit: '#E3A32C',
          ink: '#1F3322',
          deep: '#1F3322',
          pale: '#E7EFD9',
        },
      ],
      sample: {
        name: 'Ishita Rao',
        title: 'Yoga Teacher',
        company: 'Slow Morning Yoga',
        tagline: 'Small batches, from 6 am',
        phone: SAMPLE_PHONE,
        email: 'ishita@slowmorning.example',
        website: 'slowmorning.example',
        address: 'Indiranagar, Bengaluru',
      },
      sides: {
        front: {
          background: {
            type: 'linear',
            angle: 180,
            stops: [
              [0, '$top'],
              [1, '$bottom'],
            ],
          },
          stacks: {
            who: { x: 5, y: 5, w: 39.5, h: 22, anchor: 'top', gap: 1.1 },
            reach: { x: 5, y: 27.6, w: 40.5, h: 18.2, anchor: 'bottom', gap: 0.9 },
          },
          elements: [
            E('sun', cx - sun, cy - sun, 2 * sun, 2 * sun, {
              type: 'linear',
              angle: 180,
              stops: [
                [0, '$sun'],
                [1, '$sunLit'],
              ],
            }),
            A('limbs', wheel.limbs, { stroke: '$ink', sw: 0.56, cap: 'round', join: 'round' }),
            A('heads', wheel.head, { fill: '$ink' }),
            T('name', '{name}', 5, 39.5, 21, {
              stack: 'who',
              font: '$heading',
              weight: 700,
              fill: '$ink',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1,
            }),
            T('role', '{title}', 5, 39.5, 7, { stack: 'who', weight: 600, fill: '$ink', minSize: 5.8, maxLines: 3, lineHeight: 1.16 }),
            T('co', '{company}', 5, 40.5, 7.4, {
              stack: 'reach',
              font: '$heading',
              weight: 700,
              fill: '$ink',
              minSize: 6.5,
              maxLines: 2,
              lineHeight: 1.12,
              optional: true,
            }),
            L('contact', ['phone', 'website'], 5, 40.5, 6.6, { stack: 'reach', icons: false, weight: 500, fill: '$ink', rowHeight: 1.6 }),
          ],
        },
        back: {
          background: '$deep',
          stacks: { brand: { x: 5, y: 4.6, w: 49, h: 29, anchor: 'top', gap: 1.2 } },
          elements: [
            A('sun', `M${W / 2 - 11} 43.4A11 11 0 0 1 ${W / 2 + 11} 43.4Z`, {
              fill: {
                type: 'linear',
                angle: 180,
                stops: [
                  [0, '$sunLit'],
                  [1, '$sun'],
                ],
              },
            }),
            R('ground', -B, 43.2, W + 2 * B, H - 43.2 + B, '$pale'),
            A('limbs', row.limbs, { stroke: '$pale', sw: 0.56, cap: 'round', join: 'round' }),
            A('heads', row.head, { fill: '$pale' }),
            LOGO('logo', 5, 4.6, 9, '$pale', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 5, 49, 13.6, {
              stack: 'brand',
              font: '$heading',
              weight: 700,
              fill: '$pale',
              minSize: 9,
              maxLines: 2,
              lineHeight: 1.04,
            }),
            T('tag', '{tagline}', 5, 49, 6.8, {
              stack: 'brand',
              fill: '$pale',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.2,
              optional: true,
            }),
            L('contact', ['email'], 5, 49, 6.5, { stack: 'brand', icons: false, fill: '$pale', rowHeight: 1.55 }),
            T('addr', '{address}', 5, 49, 6.3, { stack: 'brand', fill: '$pale', minSize: 5.6, maxLines: 2, lineHeight: 1.2, gap: 0.3 }),
            QR('qr', W - 30.6, 4.6, 26, { r: 0.8 }),
          ],
        },
      },
    };
  })(),

  // Loaded Bar: your name is what is on the bar today. The back is one plate, face on, with a QR code in its hub.
  (() => {
    const inner = 15.6;
    const steel = {
      type: 'linear',
      angle: 180,
      stops: [
        [0, '$steel'],
        [0.5, '#FFFFFF'],
        [1, '$steelDark'],
      ],
    };
    const cx = 69;
    const plate = 31.5;
    return {
      id: 'loaded-bar',
      name: 'Loaded Bar',
      category: 'health',
      tags: ['gym', 'personal trainer', 'fitness', 'crossfit', 'strength', 'bold'],
      fonts: { heading: 'anton', body: 'bricolage' },
      palettes: [
        {
          label: 'Competition',
          bg: '#101012',
          a: '#D8232F',
          b: '#1E5FC4',
          c: '#F2B705',
          d: '#21A35B',
          text: '#F6F4EE',
          soft: '#F2B705',
          steel: '#C6CBD2',
          steelDark: '#6E7480',
          stamp: '#FFFFFF',
        },
        {
          label: 'Iron',
          bg: '#F1EDE3',
          a: '#1B1B1D',
          b: '#2F2F33',
          c: '#47474C',
          d: '#65656B',
          text: '#16161A',
          soft: '#C92A2A',
          steel: '#8F949C',
          steelDark: '#44474D',
          stamp: '#F1EDE3',
        },
        {
          label: 'Volt',
          bg: '#0C0F0C',
          a: '#C8F31D',
          b: '#9BC40F',
          c: '#6E8C0A',
          d: '#F2F5EC',
          text: '#F2F5EC',
          soft: '#C8F31D',
          steel: '#BFC5BC',
          steelDark: '#5B615A',
          stamp: '#0C0F0C',
        },
        {
          label: 'Blush',
          bg: '#2A0B1F',
          a: '#FF4F7E',
          b: '#FF9A5C',
          c: '#FFD166',
          d: '#FFFFFF',
          text: '#FFEFF4',
          soft: '#FFD166',
          steel: '#E0C8D2',
          steelDark: '#7D5E6C',
          stamp: '#2A0B1F',
        },
      ],
      sample: {
        name: 'Arjun Thakur',
        title: 'Strength Coach',
        company: 'Thakur Barbell Club',
        phone: SAMPLE_PHONE,
        website: 'thakurbarbell.example',
        address: 'Sector 29, Gurugram',
      },
      sides: {
        front: {
          background: '$bg',
          stacks: {
            above: { x: 19.9, y: 4.4, w: W - 39.8, h: 18.4, anchor: 'bottom' },
            below: { x: 19.9, y: 28.2, w: W - 39.8, h: 18.2, anchor: 'top', gap: 0.9 },
          },
          elements: [
            R('bar', -B, H / 2 - 0.9, W + 2 * B, 1.8, steel),
            R('collarl', inner + 0.3, H / 2 - 3.8, 2.6, 7.6, steel, { r: 0.5 }),
            R('collarr', W - inner - 2.9, H / 2 - 3.8, 2.6, 7.6, steel, { r: 0.5 }),
            ...plateElements(-1, inner),
            ...plateElements(1, W - inner),
            T('name', '{name}', 19.9, W - 39.8, 31, {
              stack: 'above',
              font: '$heading',
              fill: '$text',
              align: 'center',
              upper: true,
              minSize: 12,
              maxLines: 2,
              lineHeight: 1.02,
            }),
            T('role', '{title}', 19.9, W - 39.8, 7.4, {
              stack: 'below',
              weight: 700,
              fill: '$soft',
              align: 'center',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.15,
            }),
            L('contact', ['phone', 'email', 'website'], 19.9, W - 39.8, 6.6, {
              stack: 'below',
              icons: false,
              align: 'center',
              weight: 500,
              fill: '$text',
              rowHeight: 1.6,
            }),
          ],
        },
        back: {
          background: '$bg',
          stacks: { brand: { x: 5, y: 5, w: 30.5, h: 40.8, anchor: 'middle', gap: 1.5 } },
          elements: [
            E('plate', cx - plate, H / 2 - plate, 2 * plate, 2 * plate, '$a'),
            A('rings', plateFace(cx, H / 2, plate), { stroke: '$bg', sw: 0.3, opacity: 0.35 }),
            E('hub', cx - 20.4, H / 2 - 20.4, 40.8, 40.8, {
              type: 'linear',
              angle: 135,
              stops: [
                [0, '#FFFFFF'],
                [0.5, '$steel'],
                [1, '$steelDark'],
              ],
            }),
            E('hub2', cx - 19.3, H / 2 - 19.3, 38.6, 38.6, '#FFFFFF'),
            QR('qr', cx - 13, H / 2 - 13, 26, { quiet: 1.2 }),
            LOGO('logo', 5, 5, 10, '$text', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 5, 30.5, 15, {
              stack: 'brand',
              font: '$heading',
              fill: '$text',
              upper: true,
              minSize: 9,
              maxLines: 4,
              lineHeight: 1.06,
            }),
            T('addr', '{address}', 5, 30.5, 6.5, {
              stack: 'brand',
              fill: '$text',
              minSize: 5.6,
              maxLines: 4,
              lineHeight: 1.2,
              optional: true,
            }),
          ],
        },
      },
    };
  })(),

  // Paisley: one giant ambi fills the card, worked band by band the way a bride's hand is, with your details in its clear heart.
  (() => {
    const bands = paisleyBands();
    const outside = rectPath(-B, -B, W + 2 * B, H + 2 * B) + bands.edge;
    const corner =
      mFlower(80, 42.6, 5.6) +
      ellipsePath(72.6, 46.2, 0.5, 0.5) +
      ellipsePath(84.6, 34.2, 0.5, 0.5) +
      ellipsePath(70.2, 48.2, 0.32, 0.32) +
      ellipsePath(86.2, 31.6, 0.32, 0.32);
    const j = jaal(W + 2 * B, H + 2 * B, 19, 19);
    const off = { x: -B, y: -B };
    const fw = W + 2 * B;
    const fh = H + 2 * B;
    const hx = 18.6;
    const hw = 42.6;
    return {
      id: 'ambi-paisley',
      name: 'Ambi',
      category: 'beauty',
      tags: ['mehendi', 'henna', 'bridal', 'traditional', 'artist'],
      fonts: { heading: 'rozha', body: 'lora' },
      palettes: [
        { label: 'Fresh henna', skin: '#F7E3C6', henna: '#5B220F', stain: '#A4411A' },
        { label: 'Wet paste', skin: '#EFF0D6', henna: '#2B3512', stain: '#68781F' },
        { label: 'Bridal rani', skin: '#FFE9E4', henna: '#7D0E38', stain: '#C2185B' },
        { label: 'Midnight', skin: '#F8E8C9', henna: '#1F1438', stain: '#A5641A' },
      ],
      sample: {
        name: 'Zoya Ansari',
        title: 'Bridal Mehendi Artist',
        company: 'Rang-e-Heena',
        tagline: 'Bridal, Arabic and party mehendi',
        phone: SAMPLE_PHONE,
        website: 'rangeheena.example',
        address: 'Bhopal, Madhya Pradesh',
      },
      sides: {
        front: {
          background: '$skin',
          stacks: { heart: { x: hx, y: 12.4, w: hw, h: 26, anchor: 'middle', gap: 0.7 } },
          elements: [
            A('outside', outside, { fill: '$henna', evenodd: true }),
            A('corner', corner, { fill: '$skin' }),
            A('fine', bands.fine, { stroke: '$henna', sw: 0.14, join: 'round' }),
            A('medium', bands.medium, { stroke: '$henna', sw: 0.26, join: 'round' }),
            A('solid', bands.solid, { fill: '$henna' }),
            T('co', '{company}', hx, hw, 16, {
              stack: 'heart',
              font: '$heading',
              fill: '$henna',
              align: 'center',
              minSize: 9,
              maxLines: 2,
              lineHeight: 1.04,
            }),
            T('tag', '{tagline}', hx, hw, 6, {
              stack: 'heart',
              weight: 600,
              fill: '$stain',
              align: 'center',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.15,
              optional: true,
            }),
            T('person', '{name}', hx, hw, 8.4, {
              stack: 'heart',
              weight: 700,
              fill: '$henna',
              align: 'center',
              minSize: 6.5,
              maxLines: 1,
              noWrap: true,
              gap: 1.1,
              lineHeight: 1.15,
            }),
            T('phone', '{phone}', hx, hw, 7.4, {
              stack: 'heart',
              weight: 600,
              fill: '$henna',
              align: 'center',
              minSize: 6.5,
              noWrap: true,
              lineHeight: 1.15,
            }),
          ],
        },
        back: {
          background: '$henna',
          stacks: { brand: { x: 9.6, y: 9.2, w: 43.6, h: 32.4, anchor: 'middle', gap: 1.2 } },
          elements: [
            A('lattice', j.lines, { ...off, stroke: '$skin', sw: 0.14, opacity: 0.55 }, fw, fh),
            A('thin', j.thin, { ...off, stroke: '$skin', sw: 0.16, opacity: 0.85 }, fw, fh),
            A('solid', j.solid, { ...off, fill: '$skin', opacity: 0.85 }, fw, fh),
            R('panel', 6, 5.8, W - 12, H - 11.6, '$skin', { r: 5 }),
            R('panelline', 7.2, 7, W - 14.4, H - 14, undefined, { r: 4, stroke: '$henna', sw: 0.2, dash: [0.2, 0.9], cap: 'round' }),
            LOGO('logo', 9.6, 9, 9.4, '$henna', { stack: 'brand', align: 'left' }),
            T('role', '{title}', 9.6, 43.6, 6.8, {
              stack: 'brand',
              weight: 600,
              fill: '$stain',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.16,
            }),
            L('contact', ['email', 'website', 'address'], 9.6, 43.6, 6.5, { stack: 'brand', icons: false, fill: '$henna', rowHeight: 1.6 }),
            QR('qr', W - 35.3, H / 2 - 13, 26, { r: 1 }),
          ],
        },
      },
    };
  })(),
];
