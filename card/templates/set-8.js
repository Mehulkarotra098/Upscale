// Cards for Indian shops and trades, drawn from things people here already know: shop awnings, floor tiles, kolam, ledgers and kites.
import { ellipsePath, rectPath } from '../src/core/pathutil.js';
import { A, B, E, H, L, LOGO, QR, R, T, W } from './kit.js';

const VW = H;
const VH = W;
const n = (v) => String(Math.round(v * 100) / 100);
const circle = (x, y, r) => ellipsePath(x, y, r, r);
const poly = (pts) => `M${pts.map((p) => `${n(p[0])} ${n(p[1])}`).join('L')}Z`;

/** A leaf shape between two points, pointed at both ends. */
const lens = (x0, y0, x1, y1, bulge) => {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * bulge;
  const oy = (dx / len) * bulge;
  return `M${n(x0)} ${n(y0)}Q${n(mx + ox)} ${n(my + oy)} ${n(x1)} ${n(y1)}Q${n(mx - ox)} ${n(my - oy)} ${n(x0)} ${n(y0)}Z`;
};

/* ------------------------------------------------------------------ Shamiana: a striped tent edge */

/** Tent stripes with round tips. `phase` 0 or 1 picks every other stripe, so each colour is its own path. */
function shamiana(w, stripe, depth, phase, top = -B) {
  let d = '';
  const count = Math.ceil(w / stripe) + 2;
  for (let i = -1; i < count; i++) {
    if (((i % 2) + 2) % 2 !== phase) continue;
    const x = i * stripe;
    const r = stripe / 2;
    d += `M${n(x)} ${n(top)}L${n(x + stripe)} ${n(top)}L${n(x + stripe)} ${n(depth)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(depth)}Z`;
  }
  return d;
}

/* ------------------------------------------------------------------ Athangudi: Chettinad cement floor tile */

/** Colour layers for a grid of floor tiles. 0: diamonds, 1: petals and corner rounds, 2: centres. */
function floorTile(x0, y0, cols, rows, u, layer) {
  let d = '';
  const m = u / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * u;
      const y = y0 + r * u;
      const cx = x + m;
      const cy = y + m;
      if (layer === 0) {
        d += poly([
          [cx, y],
          [x + u, cy],
          [cx, y + u],
          [x, cy],
        ]);
      } else if (layer === 1) {
        const a = u * 0.09;
        const b = u * 0.37;
        const bulge = u * 0.17;
        for (const [sx, sy] of [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]) {
          d += lens(cx + sx * a, cy + sy * a, cx + sx * b * 0.72, cy + sy * b * 0.72, bulge);
        }
      } else if (layer === 2) {
        d += circle(cx, cy, u * 0.075);
      }
    }
  }
  if (layer === 1 || layer === 2) {
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = x0 + c * u;
        const y = y0 + r * u;
        d += circle(x, y, layer === 1 ? u * 0.2 : u * 0.085);
      }
    }
  }
  return d;
}

/* ------------------------------------------------------------------ Kolam: one line looping round a grid of dots */

/**
 * A pulli kolam as a mirror curve: the line runs diagonally across a grid of dots and bounces off the edge and any
 * inner mirrors. The whole figure is turned 45 degrees, the way a kolam sits on a doorstep.
 */
function kolam(cx, cy, size, a, mirrors = []) {
  const unit = size / (2 * a) / Math.SQRT2;
  const place = (x, y) => {
    const u = x - a;
    const v = y - a;
    return [cx + (u - v) * unit, cy + (u + v) * unit];
  };
  const blocked = new Set(mirrors.map(([x, y]) => `${x},${y}`));
  const isMirror = (x, y) => x === 0 || y === 0 || x === 2 * a || y === 2 * a || blocked.has(`${x},${y}`);
  const seen = new Set();
  let line = '';
  for (let sy = 0; sy <= 2 * a; sy++) {
    for (let sx = 0; sx <= 2 * a; sx++) {
      if ((sx + sy) % 2 === 0) continue;
      for (const [ddx, ddy] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        if (seen.has(`${sx},${sy},${ddx},${ddy}`)) continue;
        const nx = sx + ddx;
        const ny = sy + ddy;
        if (nx < 0 || ny < 0 || nx > 2 * a || ny > 2 * a) continue;
        const pts = [];
        let [x, y, dx, dy] = [sx, sy, ddx, ddy];
        while (!seen.has(`${x},${y},${dx},${dy}`)) {
          seen.add(`${x},${y},${dx},${dy}`);
          pts.push([x, y]);
          x += dx;
          y += dy;
          if (isMirror(x, y)) {
            if (x % 2 === 0) dx = -dx;
            else dy = -dy;
          }
        }
        // The same loop travelled backwards: mark it so it isn't drawn twice.
        const m = pts.length;
        for (let i = 0; i < m; i++) {
          const p = pts[i];
          const q = pts[(i + m - 1) % m];
          seen.add(`${p[0]},${p[1]},${q[0] - p[0]},${q[1] - p[1]}`);
        }
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const start = place(...mid(pts[m - 1], pts[0]));
        line += `M${n(start[0])} ${n(start[1])}`;
        for (let i = 0; i < m; i++) {
          const ctrl = place(...pts[i]);
          const end = place(...mid(pts[i], pts[(i + 1) % m]));
          line += `Q${n(ctrl[0])} ${n(ctrl[1])} ${n(end[0])} ${n(end[1])}`;
        }
        line += 'Z';
      }
    }
  }
  let dots = '';
  for (let y = 1; y < 2 * a; y += 2) {
    for (let x = 1; x < 2 * a; x += 2) {
      const p = place(x, y);
      dots += circle(p[0], p[1], unit * 0.2);
    }
  }
  return { line, dots };
}

const KOLAM_MIRRORS = [
  [4, 3],
  [3, 4],
  [8, 3],
  [3, 8],
  [4, 9],
  [9, 4],
  [8, 9],
  [9, 8],
  [6, 5],
  [5, 6],
  [7, 6],
  [6, 7],
];

/* ------------------------------------------------------------------ Mehndi: fine line rings, as drawn on a palm */

function mehndiFan(cx, cy, R, layer) {
  let d = '';
  const TAU = Math.PI * 2;
  const pt = (rad, a) => [cx + Math.cos(a) * R * rad, cy + Math.sin(a) * R * rad];
  const leaf = (r0, r1, a, bulge) => lens(...pt(r0, a), ...pt(r1, a), R * bulge);
  const dots = (rad, m, size, off = 0) => {
    for (let i = 0; i < m; i++) d += circle(...pt(rad, ((i + off) / m) * TAU), R * size);
  };
  const arcs = (rad, tip, m, off = 0) => {
    for (let i = 0; i < m; i++) {
      const a0 = ((i + off) / m) * TAU;
      const a1 = ((i + off + 1) / m) * TAU;
      const p0 = pt(rad, a0);
      const p1 = pt(rad, a1);
      const c = pt(tip, (a0 + a1) / 2);
      d += `M${n(p0[0])} ${n(p0[1])}Q${n(c[0])} ${n(c[1])} ${n(p1[0])} ${n(p1[1])}`;
    }
  };
  if (layer === 'fill') {
    for (let i = 0; i < 8; i++) d += leaf(0.04, 0.2, (i / 8) * TAU, 0.05);
    dots(0.27, 24, 0.009);
    for (let i = 0; i < 12; i++) d += leaf(0.37, 0.5, (i / 12) * TAU, 0.022);
    dots(0.735, 24, 0.013, 0.5);
    dots(0.965, 24, 0.012);
    dots(0.885, 24, 0.008);
  } else {
    d += circle(cx, cy, R * 0.235) + circle(cx, cy, R * 0.57) + circle(cx, cy, R * 0.6) + circle(cx, cy, R * 0.68);
    for (let i = 0; i < 12; i++) d += leaf(0.31, 0.56, (i / 12) * TAU, 0.075);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU;
      const p0 = pt(0.6, a);
      const p1 = pt(0.68, a);
      d += `M${n(p0[0])} ${n(p0[1])}L${n(p1[0])} ${n(p1[1])}`;
    }
    arcs(0.68, 0.9, 24);
    arcs(0.8, 1.01, 24, 0.5);
  }
  return d;
}

/* ------------------------------------------------------------------ Bindi: a large disc with a few sequins */

function sequins(cx, cy, radius, from, to, count, size) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const a = ((from + (to - from) * t) * Math.PI) / 180;
    d += circle(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, size * (0.45 + 0.55 * Math.sin(t * Math.PI)));
  }
  return d;
}

/* ------------------------------------------------------------------ Bagru: hand block sprigs */

/** One sprig. Layer 0 is the flower, layer 1 the stem and leaves, each cut as its own block. */
function buti(cx, cy, s, layer) {
  let d = '';
  if (layer === 0) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      d += lens(
        cx + Math.cos(a) * s * 0.13,
        cy + Math.sin(a) * s * 0.13,
        cx + Math.cos(a) * s * 0.62,
        cy + Math.sin(a) * s * 0.62,
        s * 0.3,
      );
    }
  } else {
    d += circle(cx, cy, s * 0.13);
    d += lens(cx, cy + s * 0.55, cx, cy + s * 1.2, s * 0.05);
    d += lens(cx, cy + s * 1.0, cx - s * 0.62, cy + s * 0.62, s * 0.17);
    d += lens(cx, cy + s * 1.0, cx + s * 0.62, cy + s * 0.62, s * 0.17);
  }
  return d;
}

function butiField(x0, y0, x1, y1, px, py, s, layer) {
  let d = '';
  let row = 0;
  for (let y = y0; y <= y1; y += py, row++) {
    for (let x = x0 + (row % 2 ? px / 2 : 0); x <= x1; x += px) d += buti(x, y, s, layer);
  }
  return d;
}

/** A row of little triangles, the kungri edge on a sari border. Tips point away from the band. */
function kungri(x0, x1, y, pitch, height) {
  let d = '';
  for (let x = x0; x < x1; x += pitch) {
    d += poly([
      [x, y],
      [x + pitch / 2, y - height],
      [x + pitch, y],
    ]);
  }
  return d;
}

function kungriV(y0, y1, x, pitch, height) {
  let d = '';
  for (let y = y0; y < y1; y += pitch) {
    d += poly([
      [x, y],
      [x + height, y + pitch / 2],
      [x, y + pitch],
    ]);
  }
  return d;
}

/* ------------------------------------------------------------------ Masala dabba: the spice tin from above */

function dabbaBowls(cx, cy, r) {
  const d = r * 2.12;
  const out = [[cx, cy]];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    out.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]);
  }
  return out;
}

const SPICES = ['s1', 's2', 's3', 's4', 's5', 's6'];

/** Tin, bowl rims and spices as elements. The centre bowl is left clear when `logoFill` is given. */
function dabba(prefix, cx, cy, r, w, h, centre = '$c') {
  const bowls = dabbaBowls(cx, cy, r);
  const R = r * 3.4;
  const out = [
    E(`${prefix}-tin`, cx - R, cy - R, 2 * R, 2 * R, '$tin'),
    E(`${prefix}-lip`, cx - R * 0.965, cy - R * 0.965, 1.93 * R, 1.93 * R, 'none', { stroke: '$rim', sw: 0.18 }),
    A(`${prefix}-rims`, bowls.map((b) => circle(b[0], b[1], r * 1.06)).join(''), { fill: '$rim' }, w, h),
  ];
  bowls.slice(1).forEach((b, i) => {
    out.push(E(`${prefix}-${SPICES[i]}`, b[0] - r * 0.92, b[1] - r * 0.92, r * 1.84, r * 1.84, `$${SPICES[i]}`));
  });
  out.push(E(`${prefix}-centre`, cx - r * 0.92, cy - r * 0.92, r * 1.84, r * 1.84, centre));
  return out;
}

/* ------------------------------------------------------------------ Bahi khata: the red cloth trader's ledger */

/** Binding thread, whipped over the edge of the spine at a slant. */
function stitches(w, y, reach, pitch) {
  let d = '';
  for (let x = -pitch; x < w + pitch; x += pitch) d += `M${n(x)} ${n(y - reach)}L${n(x + pitch * 0.55)} ${n(y + reach)}`;
  return d;
}

/* ------------------------------------------------------------------ Three phase: red, yellow and blue conductors */

const bend = (x0, y, x, r, yEnd) => `M${n(x0)} ${n(y)}L${n(x - r)} ${n(y)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + r)}L${n(x)} ${n(yEnd)}`;

/* ------------------------------------------------------------------ Wall paint: a hand painted ad on a lime-washed wall */

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A rectangle painted by hand: its edges wander a little, and its right end breaks up where the brush ran dry. */
function paintedBlock(x, y, w, h, seed, { wobble = 0.22, tail = 6 } = {}) {
  const rnd = seeded(seed);
  const j = () => (rnd() - 0.5) * 2 * wobble;
  const pts = [];
  for (let px = x; px < x + w; px += 3.2) pts.push([px, y + j()]);
  const strokes = Math.max(4, Math.round(h / 0.85));
  const reaches = [];
  for (let i = 0; i < strokes; i++) reaches.push(x + w + rnd() * rnd() * tail);
  for (let i = 0; i < strokes; i++) {
    const t0 = y + (i / strokes) * h;
    const t1 = y + ((i + 1) / strokes) * h;
    const dt = t1 - t0;
    pts.push([reaches[i] - 0.25, t0 + dt * 0.08], [reaches[i], t0 + dt * 0.5], [reaches[i] - 0.25, t1 - dt * 0.08]);
    if (i + 1 < strokes) pts.push([Math.min(reaches[i], reaches[i + 1]) - 0.5 - rnd() * 1.6, t1]);
  }
  for (let px = x + w; px > x; px -= 3.2) pts.push([px, y + h + j()]);
  for (let py = y + h; py > y; py -= 3) pts.push([x + j(), py]);
  return poly(pts);
}

/* ------------------------------------------------------------------ Copy label: the label on a brown-paper school book */

function notched(x, y, w, h, r) {
  return (
    `M${n(x + r)} ${n(y)}L${n(x + w - r)} ${n(y)}A${n(r)} ${n(r)} 0 0 0 ${n(x + w)} ${n(y + r)}L${n(x + w)} ${n(y + h - r)}` +
    `A${n(r)} ${n(r)} 0 0 0 ${n(x + w - r)} ${n(y + h)}L${n(x + r)} ${n(y + h)}A${n(r)} ${n(r)} 0 0 0 ${n(x)} ${n(y + h - r)}` +
    `L${n(x)} ${n(y + r)}A${n(r)} ${n(r)} 0 0 0 ${n(x + r)} ${n(y)}Z`
  );
}

function ruled(x0, x1, y0, pitch, count) {
  let d = '';
  for (let i = 0; i < count; i++) d += `M${n(x0)} ${n(y0 + i * pitch)}L${n(x1)} ${n(y0 + i * pitch)}`;
  return d;
}

/* ------------------------------------------------------------------ Jaali: a pierced stone screen */

function star(cx, cy, r) {
  const pts = [];
  const r2 = r * 0.7654;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rad = i % 2 ? r2 : r;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return poly(pts);
}

/** Stars and small diamonds to cut out of a solid panel: draw with the panel's rectangle and `evenodd`. */
function jaali(x, y, w, h, u) {
  let d = rectPath(x, y, w, h);
  const inside = (px, py, m) => px - m > x && px + m < x + w && py - m > y && py + m < y + h;
  for (let r = 0; r * u < h + u; r++) {
    for (let c = 0; c * u < w + u; c++) {
      const px = x + c * u;
      const py = y + r * u;
      if (inside(px, py, u * 0.46)) d += star(px, py, u * 0.45);
      const qx = px + u / 2;
      const qy = py + u / 2;
      if (inside(qx, qy, u * 0.17)) {
        d += poly([
          [qx, qy - u * 0.17],
          [qx + u * 0.17, qy],
          [qx, qy + u * 0.17],
          [qx - u * 0.17, qy],
        ]);
      }
    }
  }
  return d;
}

/* ------------------------------------------------------------------ Iris: a lens opening, drawn flat */

/** One path per blade. The opening is a regular polygon, and each of its edges runs on until it meets the outer circle. */
function irisBlades(cx, cy, R, r, count, phase = 0) {
  const inner = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + phase;
    inner.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const outer = inner.map((p, i) => {
    const q = inner[(i + 1) % count];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const fx = p[0] - cx;
    const fy = p[1] - cy;
    const b = fx * ux + fy * uy;
    const t = -b + Math.sqrt(b * b - (fx * fx + fy * fy - R * R));
    return [p[0] + ux * t, p[1] + uy * t];
  });
  return inner.map((p, i) => {
    const q = inner[(i + 1) % count];
    const prev = outer[(i + count - 1) % count];
    const out = outer[i];
    return `M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}L${n(out[0])} ${n(out[1])}A${n(R)} ${n(R)} 0 0 0 ${n(prev[0])} ${n(prev[1])}Z`;
  });
}

const octagon = (cx, cy, r, count = 8, phase = Math.PI / 8) => {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + phase;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts);
};

/* ------------------------------------------------------------------ Patang: kites over a rooftop */

function kite(cx, cy, a, deg) {
  const t = (deg * Math.PI) / 180;
  const p = (x, y) => [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)];
  const top = p(0, -a);
  const right = p(a, 0);
  const bottom = p(0, a);
  const left = p(-a, 0);
  const capL = p(-a * 0.42, -a * 0.58);
  const capR = p(a * 0.42, -a * 0.58);
  const capM = p(0, -a * 0.16);
  const bow = p(0, -a * 0.55);
  const tail = [p(0, a * 0.82), p(a * 0.3, a * 1.28), p(-a * 0.3, a * 1.28)];
  return {
    left: poly([top, bottom, left]),
    right: poly([top, right, bottom]),
    cap: poly([top, capR, capM, capL]),
    tail: poly(tail),
    frame: `M${n(top[0])} ${n(top[1])}L${n(bottom[0])} ${n(bottom[1])}M${n(left[0])} ${n(left[1])}Q${n(bow[0])} ${n(bow[1])} ${n(right[0])} ${n(right[1])}`,
    bottom,
  };
}

const KITE_MAIN = kite(31, 21, 20, -13);
const KITE_MID = kite(8.5, 31, 7, 20);
const KITE_SMALL = kite(45, 42, 4.6, -24);

const kiteArt = (prefix, k) => [
  A(`${prefix}-left`, k.left, { fill: '$k1' }, VW, VH),
  A(`${prefix}-right`, k.right, { fill: '$k2' }, VW, VH),
  A(`${prefix}-cap`, k.cap, { fill: '$k3' }, VW, VH),
  A(`${prefix}-tail`, k.tail, { fill: '$k3' }, VW, VH),
];

/** A short rule that runs in from the edge and stops just before a hanging Hindi headline, as if its top line had started off the card. */
const lead = (id, x, y, t, fill, from = -B) => R(id, from, y, x - 0.4 - from, t, fill, { deva: 'company' });

export const SET_8 = [
  {
    id: 'shamiana-edge',
    name: 'Shamiana',
    category: 'hindi',
    lang: 'hi',
    tags: ['sweets', 'mithai', 'caterer', 'halwai', 'tent', 'wedding food', 'hindi', 'devanagari', 'striped', 'festive'],
    fonts: { heading: 'rozha', body: 'notoserifdeva' },
    palettes: [
      { label: 'Kesar', paper: '#FFF8EA', a: '#D8430F', b: '#F4A019', ink: '#54120A', soft: '#7E4A2C', plate: '#FFF8EA' },
      { label: 'Rani', paper: '#FFF6F4', a: '#B5114F', b: '#EE7B6D', ink: '#4F0A2A', soft: '#84485E', plate: '#FFF6F4' },
      { label: 'Pista', paper: '#FBF9EC', a: '#14573F', b: '#9DBB3C', ink: '#0F3A2A', soft: '#4F6A52', plate: '#FBF9EC' },
      { label: 'Neel', paper: '#F7F5EC', a: '#17307F', b: '#E9B020', ink: '#101F55', soft: '#4D5879', plate: '#F7F5EC' },
    ],
    sample: {
      name: 'रामनिवास अग्रवाल',
      title: 'प्रोप्राइटर',
      company: 'अग्रवाल मिष्ठान भंडार',
      tagline: 'मिठाई, नमकीन और शादी के ऑर्डर',
      phone: '+91 98765 43210',
      website: 'agrawalmishthan.example',
      address: 'सदर बाज़ार, गांधी चौक, जयपुर',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          sign: { x: 8, y: 17.5, w: 75, h: 18.5, anchor: 'top' },
          rest: { x: 8, y: 29.5, w: 75, h: 17.3, anchor: 'bottom', gap: 0.5 },
        },
        elements: [
          A('stripes-a', shamiana(W, W / 11, 8.5, 1), { fill: '$a' }),
          A('stripes-b', shamiana(W, W / 11, 8.5, 0), { fill: '$b' }),
          lead('lead', 8, 17.5, 0.8, '$ink'),
          T('company', '{company}', 8, 75, 25, {
            stack: 'sign',
            font: '$heading',
            fill: '$ink',
            minSize: 11,
            maxLines: 2,
            lineHeight: 1.12,
            hang: true,
          }),
          T('who', '{name}', 8, 75, 8.6, {
            stack: 'rest',
            weight: 600,
            fill: '$soft',
            minSize: 6.5,
            maxLines: 1,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'website', 'address'], 8, 75, 7.2, { stack: 'rest', fill: '$ink', iconFill: '$a' }),
        ],
      },
      back: {
        background: '$a',
        stacks: { brand: { x: 11, y: 12, w: 38, h: 26.8, anchor: 'middle', gap: 1.4 } },
        elements: [
          A('stripes', shamiana(W, W / 11, H + 8, 0), { fill: '$b' }),
          R('plate', 5.5, 6.5, W - 11, H - 13, '$plate', { r: 1.2 }),
          LOGO('logo', 11, 12, 11, '$a', { stack: 'brand', align: 'left', fallbackSize: 15 }),
          T('company', '{company}', 11, 38, 14, {
            stack: 'brand',
            font: '$heading',
            fill: '$ink',
            minSize: 9,
            maxLines: 3,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 11, 38, 7, {
            stack: 'brand',
            fill: '$soft',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', W - 37, H / 2 - 13, 26, { light: '$plate', dark: '#1A1008' }),
        ],
      },
    },
  },
  {
    id: 'athangudi-floor',
    name: 'Athangudi',
    category: 'food',
    orientation: 'vertical',
    tags: ['cafe', 'coffee', 'bakery', 'tea room', 'restaurant', 'tile', 'chettinad', 'pattern', 'south indian'],
    fonts: { heading: 'fraunces', body: 'outfit' },
    palettes: [
      {
        label: 'Oxide',
        paper: '#F6EAD2',
        t0: '#F6EAD2',
        t1: '#B23A22',
        t2: '#17504C',
        t3: '#E8A91F',
        accent: '#B23A22',
        ink: '#2B1A12',
        soft: '#6E5340',
        onDisc: '#F6EAD2',
      },
      {
        label: 'Neel',
        paper: '#F3F1E7',
        t0: '#F3F1E7',
        t1: '#1B3A7A',
        t2: '#D9502E',
        t3: '#F1C14B',
        accent: '#1B3A7A',
        ink: '#14234C',
        soft: '#515B78',
        onDisc: '#F3F1E7',
      },
      {
        label: 'Rose',
        paper: '#FBEFE6',
        t0: '#FBEFE6',
        t1: '#D96A7E',
        t2: '#233F36',
        t3: '#E9B44C',
        accent: '#A63A52',
        ink: '#233F36',
        soft: '#5E6C62',
        onDisc: '#FBEFE6',
      },
      {
        label: 'Coal',
        paper: '#EFE9DC',
        t0: '#EFE9DC',
        t1: '#23211E',
        t2: '#A9792B',
        t3: '#EFE9DC',
        accent: '#855C1A',
        ink: '#23211E',
        soft: '#5F5A50',
        onDisc: '#EFE9DC',
      },
    ],
    sample: {
      name: 'Anita Pillai',
      title: 'Owner and Head Baker',
      company: 'The Verandah Cafe',
      tagline: 'Filter coffee, fresh bakes, long afternoons',
      phone: '+91 98765 43210',
      email: 'hello@verandahcafe.example',
      website: 'verandahcafe.example',
      address: '14 Besant Avenue, Adyar, Chennai',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 5, y: 45, w: VW - 10, h: 20, anchor: 'top', gap: 0.9 },
          reach: { x: 5, y: 65.5, w: VW - 9, h: 19.4, anchor: 'bottom' },
        },
        elements: [
          R('field', -B, -B, VW + 2 * B, 33.87 + B, '$t0'),
          A('tile-0', floorTile(-VW / 3, -VW / 3, 5, 3, VW / 3, 0), { fill: '$t1' }, VW, VH),
          A('tile-1', floorTile(-VW / 3, -VW / 3, 5, 3, VW / 3, 1), { fill: '$t2' }, VW, VH),
          A('tile-2', floorTile(-VW / 3, -VW / 3, 5, 3, VW / 3, 2), { fill: '$t3' }, VW, VH),
          R('seam-paper', -B, 33.87, VW + 2 * B, 60, '$paper'),
          R('seam', -B, 33.87, VW + 2 * B, 1, '$t2'),
          E('disc', 5, 26.4, 16, 16, '$t2', { stroke: '$paper', sw: 0.9 }),
          LOGO('logo', 6.5, 27.9, 13, '$onDisc', { fallbackSize: 18 }),
          T('company', '{company}', 5, VW - 10, 17, {
            stack: 'who',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.08,
          }),
          T('name', '{name}', 5, VW - 10, 7.6, { stack: 'who', weight: 500, fill: '$accent', minSize: 6.5, maxLines: 2, lineHeight: 1.2 }),
          T('title', '{title}', 5, VW - 10, 6.8, {
            stack: 'who',
            fill: '$soft',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            gap: 0.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 5, VW - 9, 6.8, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.5,
          }),
        ],
      },
      back: {
        background: '$t0',
        stacks: { brand: { x: 10.4, y: 48.5, w: 30, h: 22, anchor: 'middle', gap: 1.2 } },
        elements: [
          A('tile-0', floorTile(-VW / 3, -VW / 3, 5, 7, VW / 3, 0), { fill: '$t1' }, VW, VH),
          A('tile-1', floorTile(-VW / 3, -VW / 3, 5, 7, VW / 3, 1), { fill: '$t2' }, VW, VH),
          A('tile-2', floorTile(-VW / 3, -VW / 3, 5, 7, VW / 3, 2), { fill: '$t3' }, VW, VH),
          R('plate', 7, 14, VW - 14, VH - 28, '$paper', { r: 1 }),
          QR('qr', 11.4, 18.4, 28, { light: '$paper', dark: '#141210' }),
          T('company', '{company}', 10.4, 30, 11.5, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            align: 'center',
            minSize: 8,
            maxLines: 4,
            lineHeight: 1.1,
          }),
          T('tagline', '{tagline}', 10.4, 30, 6.4, {
            stack: 'brand',
            fill: '$soft',
            align: 'center',
            minSize: 5.5,
            maxLines: 3,
            lineHeight: 1.2,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'pulli-kolam',
    name: 'Pulli Kolam',
    category: 'food',
    tags: ['restaurant', 'udupi', 'south indian', 'caterer', 'mess', 'tiffin', 'kolam', 'traditional'],
    fonts: { heading: 'dmserif', body: 'outfit' },
    palettes: [
      {
        label: 'Red Oxide',
        deep: '#8E2A1C',
        chalk: '#FBF3E2',
        paper: '#FBF3E2',
        ink: '#FBF3E2',
        soft: '#F2C9A0',
        onPaper: '#5B170D',
        softPaper: '#7D4A38',
      },
      {
        label: 'Kadapa',
        deep: '#20302F',
        chalk: '#F4F0E4',
        paper: '#F4F0E4',
        ink: '#F4F0E4',
        soft: '#E7B765',
        onPaper: '#20302F',
        softPaper: '#57635F',
      },
      {
        label: 'Haldi',
        deep: '#E2A116',
        chalk: '#3A1B0B',
        paper: '#FFF7E3',
        ink: '#3A1B0B',
        soft: '#5E2E0E',
        onPaper: '#3A1B0B',
        softPaper: '#7A5A36',
      },
      {
        label: 'Banana',
        deep: '#1E5B3A',
        chalk: '#F6F4E2',
        paper: '#F6F4E2',
        ink: '#F6F4E2',
        soft: '#D9DD96',
        onPaper: '#17472D',
        softPaper: '#4F6D5A',
      },
    ],
    sample: {
      name: 'K. Venkatesh Rao',
      title: 'Proprietor',
      company: 'Sri Lakshmi Udupi Home',
      tagline: 'Pure vegetarian meals and outdoor catering',
      phone: '+91 98765 43210',
      email: 'orders@lakshmiudupi.example',
      website: 'lakshmiudupi.example',
      address: '21 Gandhi Bazaar, Basavanagudi, Bengaluru',
    },
    sides: {
      front: {
        background: '$deep',
        stacks: {
          who: { x: 6, y: 6, w: 47, h: 20.5, anchor: 'top', gap: 1 },
          reach: { x: 6, y: 27, w: 47, h: 19.8, anchor: 'bottom' },
        },
        elements: [
          A('kolam', kolam(84, H / 2, 62, 6, KOLAM_MIRRORS).line, { stroke: '$chalk', sw: 0.42, fill: 'none', join: 'round' }),
          A('dots', kolam(84, H / 2, 62, 6, KOLAM_MIRRORS).dots, { fill: '$chalk' }),
          T('company', '{company}', 6, 47, 17, {
            stack: 'who',
            font: '$heading',
            fill: '$ink',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.08,
          }),
          T('name', '{name}', 6, 47, 7.4, {
            stack: 'who',
            fill: '$soft',
            weight: 500,
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 47, 6.8, { stack: 'reach', fill: '$ink', iconFill: '$soft' }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 47, y: 5, w: 36.9, h: 13.5, anchor: 'bottom', gap: 0.8 } },
        elements: [
          A('kolam', kolam(23, H / 2, 40, 6, KOLAM_MIRRORS).line, { stroke: '$onPaper', sw: 0.32, fill: 'none', join: 'round' }),
          A('dots', kolam(23, H / 2, 40, 6, KOLAM_MIRRORS).dots, { fill: '$onPaper' }),
          T('company', '{company}', 47, 36.9, 12, {
            stack: 'brand',
            font: '$heading',
            fill: '$onPaper',
            align: 'right',
            minSize: 8,
            maxLines: 3,
            lineHeight: 1.08,
          }),
          QR('qr', W - 31.5, 19.8, 26.5, { light: '$paper', dark: '#180C06', quiet: 1 }),
          E('hub', 14, H / 2 - 9, 18, 18, '$paper', { stroke: '$onPaper', sw: 0.32 }),
          LOGO('logo', 16, H / 2 - 7, 14, '$onPaper', { fallbackSize: 15 }),
        ],
      },
    },
  },
  {
    id: 'mehndi-corner',
    name: 'Mehndi Corner',
    category: 'beauty',
    tags: ['salon', 'beauty parlour', 'bridal', 'makeup', 'mehndi', 'hair', 'spa', 'elegant', 'line art'],
    fonts: { heading: 'cormorant', body: 'montserrat' },
    palettes: [
      {
        label: 'Wine',
        paper: '#FBF2EC',
        art: '#7D1B3F',
        ink: '#3E0D20',
        soft: '#7A5361',
        deep: '#4A0F27',
        gold: '#E9BE8C',
        onDeep: '#FBF2EC',
      },
      {
        label: 'Henna',
        paper: '#F8F0E1',
        art: '#A8481C',
        ink: '#47200D',
        soft: '#7D5B44',
        deep: '#5E2710',
        gold: '#EDBD72',
        onDeep: '#F8F0E1',
      },
      {
        label: 'Peacock',
        paper: '#EEF5F2',
        art: '#0E5A5E',
        ink: '#0A3236',
        soft: '#50706F',
        deep: '#0A3D44',
        gold: '#E2C27C',
        onDeep: '#EEF5F2',
      },
      {
        label: 'Aubergine',
        paper: '#2A1230',
        art: '#E8B98A',
        ink: '#FBEFE4',
        soft: '#CFAEB8',
        deep: '#E8B98A',
        gold: '#2A1230',
        onDeep: '#2A1230',
      },
    ],
    sample: {
      name: 'Farah Sheikh',
      title: 'Senior Stylist and Owner',
      company: 'Noor Hair & Beauty Studio',
      tagline: 'Hair, skin and bridal makeup',
      phone: '+91 98765 43210',
      email: 'book@noorstudio.example',
      website: 'noorstudio.example',
      address: '9 Hill Road, Bandra West, Mumbai',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6.5, w: 42, h: 21.5, anchor: 'top', gap: 1 },
          reach: { x: 6, y: 29, w: 52, h: 17.8, anchor: 'bottom' },
        },
        elements: [
          A('fan-line', mehndiFan(W - 2, -2, 38, 'line'), { stroke: '$art', sw: 0.2, fill: 'none' }),
          A('fan-fill', mehndiFan(W - 2, -2, 38, 'fill'), { fill: '$art' }),
          T('company', '{company}', 6, 42, 19, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 11,
            maxLines: 3,
            lineHeight: 0.98,
          }),
          T('name', '{name}', 6, 42, 7, {
            stack: 'who',
            weight: 500,
            fill: '$art',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 52, 6.4, { stack: 'reach', fill: '$ink', iconFill: '$art' }),
          LOGO('logo', W - 18, H - 16, 12, '$art', { fallbackSize: 18 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 5.5, w: 46, h: 15, anchor: 'top', gap: 0.8 } },
        elements: [
          A('fan-line', mehndiFan(2, H - 2, 28, 'line'), { stroke: '$gold', sw: 0.17, fill: 'none' }),
          A('fan-fill', mehndiFan(2, H - 2, 28, 'fill'), { fill: '$gold' }),
          T('company', '{company}', 6, 46, 15, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$onDeep',
            minSize: 10,
            maxLines: 3,
            lineHeight: 1,
          }),
          T('tagline', '{tagline}', 6, 46, 6.4, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.85,
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', W - 32, H / 2 - 13, 26, { r: 1, light: '#FFFBF5', dark: '#1C0A12' }),
        ],
      },
    },
  },
  {
    id: 'bindi-disc',
    name: 'Bindi',
    category: 'hindi',
    lang: 'hi',
    orientation: 'vertical',
    tags: ['beauty parlour', 'salon', 'makeup', 'bridal', 'ladies', 'hindi', 'devanagari', 'bold', 'pink'],
    fonts: { heading: 'notoserifdeva', body: 'baloo2' },
    palettes: [
      {
        label: 'Rani',
        bg: '#BE0F63',
        disc: '#F2401C',
        dot: '#FFC53D',
        ink: '#FFF6EA',
        soft: '#FFD9C2',
        plate: '#FFF6EA',
        onDisc: '#FFF6EA',
        ground2: '#F2401C',
      },
      {
        label: 'Baingan',
        bg: '#351040',
        disc: '#E63B2E',
        dot: '#F4B63F',
        ink: '#FBEFE6',
        soft: '#E0BFD0',
        plate: '#FBEFE6',
        onDisc: '#FBEFE6',
        ground2: '#E63B2E',
      },
      {
        label: 'Mor',
        bg: '#0A4B5A',
        disc: '#F39C12',
        dot: '#F7D9A0',
        ink: '#F4F4EA',
        soft: '#B9DAD6',
        plate: '#F4F4EA',
        onDisc: '#1B1405',
        ground2: '#0A4B5A',
      },
      {
        label: 'Gulab',
        bg: '#F9DCCF',
        disc: '#BC1B3B',
        dot: '#E8904D',
        ink: '#4E0C1F',
        soft: '#7E3B48',
        plate: '#FFF8F3',
        onDisc: '#FFF4EC',
        ground2: '#BC1B3B',
      },
    ],
    sample: {
      name: 'रूपाली वर्मा',
      title: 'ब्यूटीशियन',
      company: 'रूपाली ब्यूटी पार्लर',
      tagline: 'ब्राइडल मेकअप, हेयर और स्किन केयर',
      phone: '+91 98765 43210',
      website: 'rupaliparlour.example',
      address: 'सेक्टर 15, मार्केट रोड, नोएडा',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          sign: { x: 6, y: 48, w: 40.8, h: 24, anchor: 'top' },
          rest: { x: 5, y: 63.5, w: 41.8, h: 21.4, anchor: 'bottom', gap: 0.8 },
        },
        elements: [
          E('disc', 10, -1, 44, 44, '$disc'),
          A('sequins', sequins(32, 21, 25, 112, 232, 15, 0.8) + sequins(32, 21, 28.2, 136, 212, 7, 0.42), { fill: '$dot' }, VW, VH),
          LOGO('logo', 22, 11, 20, '$onDisc', { fallbackSize: 30 }),
          lead('lead', 6, 48, 0.55, '$ink'),
          T('company', '{company}', 6, 40.8, 19, {
            stack: 'sign',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            minSize: 11,
            maxLines: 3,
            lineHeight: 1.22,
            hang: true,
          }),
          T('name', '{name}', 5, 41.8, 8.4, {
            stack: 'rest',
            weight: 600,
            fill: '$soft',
            minSize: 6.5,
            maxLines: 2,
            lineHeight: 1.15,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 5, 41.8, 7, {
            stack: 'rest',
            fill: '$ink',
            icons: false,
            rowHeight: 1.45,
          }),
        ],
      },
      back: {
        background: '$disc',
        stacks: { brand: { x: 6, y: 56, w: 38.8, h: 28.9, anchor: 'middle', gap: 1.1 } },
        elements: [
          E('plate', VW / 2 - 21.5, 8, 43, 43, '$plate'),
          QR('qr', VW / 2 - 13, 16.5, 26, { light: '$plate', dark: '#1F0A14' }),
          T('company', '{company}', 6, 38.8, 14, {
            stack: 'brand',
            font: '$heading',
            weight: 800,
            fill: '$onDisc',
            align: 'center',
            minSize: 9,
            maxLines: 3,
            lineHeight: 1.22,
          }),
          T('tagline', '{tagline}', 6, 38.8, 7, {
            stack: 'brand',
            fill: '$onDisc',
            align: 'center',
            minSize: 6,
            maxLines: 3,
            lineHeight: 1.15,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'bagru-block',
    name: 'Bagru Block',
    category: 'retail',
    tags: ['boutique', 'saree', 'kurti', 'fashion', 'tailor', 'textile', 'block print', 'handloom', 'sari border'],
    fonts: { heading: 'playfair', body: 'outfit' },
    palettes: [
      { label: 'Indigo', paper: '#F8F3E6', dye: '#1C2F63', print: '#F8F3E6', spot: '#D9593A', ink: '#1C2F63', soft: '#5B648A' },
      { label: 'Madder', paper: '#FAF2E3', dye: '#92271F', print: '#FAF2E3', spot: '#E7B04A', ink: '#5E140F', soft: '#845A4C' },
      { label: 'Harda', paper: '#F7F3DF', dye: '#3F5A2C', print: '#F7F3DF', spot: '#D69A2D', ink: '#2B3F1C', soft: '#66745A' },
      { label: 'Kala', paper: '#F4EEE1', dye: '#201C1A', print: '#F4EEE1', spot: '#C2452F', ink: '#201C1A', soft: '#6A635A' },
    ],
    sample: {
      name: 'Meera Rathore',
      title: 'Designer and Owner',
      company: 'Kesari Threads',
      tagline: 'Hand block printed sarees and kurtas',
      phone: '+91 98765 43210',
      email: 'meera@kesarithreads.example',
      website: 'kesarithreads.example',
      address: '38 Bhawani Singh Road, C-Scheme, Jaipur',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 35.5, h: 26.5, anchor: 'top', gap: 1 },
          reach: { x: 44, y: 6, w: 40.9, h: 26.5, anchor: 'top' },
        },
        elements: [
          A('band-tips', kungri(-W / 40, W + 3, 37, W / 32, 1.7), { fill: '$dye' }),
          R('band', -B, 37, W + 2 * B, H - 37 + B, '$dye'),
          A('band-flowers', butiField(W / 16, 43.2, W + 3, 43.2, W / 8, 20, 3.5, 0), { fill: '$print' }),
          A('band-leaves', butiField(W / 16, 43.2, W + 3, 43.2, W / 8, 20, 3.5, 1), { fill: '$spot' }),
          T('company', '{company}', 6, 35.5, 17, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.08,
          }),
          T('name', '{name}', 6, 35.5, 7.2, {
            stack: 'who',
            weight: 500,
            fill: '$soft',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 44, 40.9, 6.8, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 54, y: 33.5, w: 30.9, h: 13.3, anchor: 'top', gap: 0.5 } },
        elements: [
          R('cloth', -B, -B, 49 + B, H + 2 * B, '$dye'),
          A('tips', kungriV(-3, H + 3, 49, W / 32, 1.7), { fill: '$dye' }),
          A('flowers', butiField(5.5, 3.5, 47, H + 6, 11.4, 9, 3.3, 0), { fill: '$print' }),
          A('leaves', butiField(5.5, 3.5, 47, H + 6, 11.4, 9, 3.3, 1), { fill: '$spot' }),
          E('seal', 12.5, H / 2 - 11, 22, 22, '$dye', { stroke: '$print', sw: 0.5 }),
          LOGO('logo', 15.5, H / 2 - 8, 16, '$print', { fallbackSize: 22 }),
          QR('qr', 56, 5.5, 26, { light: '$paper', dark: '#14110E', quiet: 1 }),
          T('company', '{company}', 54, 30.9, 10, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            align: 'center',
            minSize: 7.5,
            maxLines: 3,
            lineHeight: 1.1,
          }),
        ],
      },
    },
  },
  {
    id: 'masala-dabba',
    name: 'Masala Dabba',
    category: 'retail',
    tags: ['kirana', 'grocery', 'general store', 'spices', 'provision', 'home food', 'colourful', 'modern'],
    fonts: { heading: 'bricolage', body: 'manrope' },
    palettes: [
      {
        label: 'Steel',
        paper: '#FBF6EA',
        tin: '#D5D8D8',
        rim: '#A9AEB0',
        s1: '#EFB111',
        s2: '#C9281C',
        s3: '#6E8A2C',
        s4: '#7A4B26',
        s5: '#E97A17',
        s6: '#2C2622',
        c: '#FBF6EA',
        ink: '#2A1B10',
        soft: '#7A5F47',
        accent: '#C9281C',
        deep: '#2A1B10',
        onDeep: '#FBF6EA',
        onC: '#2A1B10',
      },
      {
        label: 'Mirchi',
        paper: '#B7211A',
        tin: '#F4E5C7',
        rim: '#D6BE94',
        s1: '#EFB111',
        s2: '#7D120D',
        s3: '#6E8A2C',
        s4: '#5A3519',
        s5: '#E97A17',
        s6: '#26130D',
        c: '#B7211A',
        ink: '#FFF6E3',
        soft: '#FBD3A5',
        accent: '#FFD45C',
        deep: '#FFF6E3',
        onDeep: '#7D120D',
        onC: '#FFF6E3',
      },
      {
        label: 'Elaichi',
        paper: '#1F4733',
        tin: '#E7E2CE',
        rim: '#BFB99F',
        s1: '#F0BC2B',
        s2: '#C33C22',
        s3: '#8BA53C',
        s4: '#6D4522',
        s5: '#E0812A',
        s6: '#1E1A14',
        c: '#1F4733',
        ink: '#F7F3E2',
        soft: '#C6D6B4',
        accent: '#F0BC2B',
        deep: '#F7F3E2',
        onDeep: '#1F4733',
        onC: '#F7F3E2',
      },
      {
        label: 'Haldi',
        paper: '#F3B41B',
        tin: '#FFF8E6',
        rim: '#D8C88F',
        s1: '#D4890B',
        s2: '#B8261A',
        s3: '#55731E',
        s4: '#6A401F',
        s5: '#E2601A',
        s6: '#231A10',
        c: '#231A10',
        ink: '#231A10',
        soft: '#5A3E10',
        accent: '#8C1D12',
        deep: '#231A10',
        onDeep: '#F3B41B',
        onC: '#F3B41B',
      },
    ],
    sample: {
      name: 'Bharat Patel',
      title: 'Proprietor',
      company: 'Patel Provision Stores',
      tagline: 'Groceries, spices and home delivery',
      phone: '+91 98765 43210',
      website: 'patelprovision.example',
      address: '6 Station Road, Maninagar, Ahmedabad',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 37, y: 6, w: 47.9, h: 21.5, anchor: 'top', gap: 1 },
          reach: { x: 37, y: 28, w: 47.9, h: 18.8, anchor: 'bottom' },
        },
        elements: [
          ...dabba('tin', 3.5, H / 2, 8.6, W, H, '$s5'),
          T('company', '{company}', 37, 47.9, 16.5, {
            stack: 'who',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.04,
          }),
          T('name', '{name}', 37, 47.9, 7.4, {
            stack: 'who',
            weight: 600,
            fill: '$accent',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 37, 47.9, 6.6, { stack: 'reach', fill: '$ink', iconFill: '$accent' }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 5, w: 40, h: 13.5, anchor: 'bottom', gap: 0.6 } },
        elements: [
          ...dabba('tin', 72, 34, 8.6, W, H),
          LOGO('logo', 72 - 7, 34 - 7, 14, '$onC', { fallbackSize: 18 }),
          T('company', '{company}', 6, 40, 13, {
            stack: 'brand',
            font: '$heading',
            weight: 800,
            fill: '$onDeep',
            minSize: 8.5,
            maxLines: 3,
            lineHeight: 1.04,
          }),
          QR('qr', 6, 20, 26.5, { light: '#FFFFFF', dark: '#14100C', quiet: 2 }),
        ],
      },
    },
  },
  {
    id: 'bahi-khata',
    name: 'Bahi Khata',
    category: 'hindi',
    lang: 'hi',
    orientation: 'vertical',
    tags: ['wholesale', 'trader', 'grain merchant', 'gaddi', 'marwari', 'kirana', 'hindi', 'devanagari', 'red', 'ledger'],
    fonts: { heading: 'tiro', body: 'baloo2' },
    palettes: [
      {
        label: 'Lal',
        cloth: '#A8141D',
        spine: '#7C0C14',
        thread: '#F4E3BD',
        gold: '#F1C662',
        ink: '#FFF4DC',
        soft: '#F6D49A',
        page: '#FBF3DF',
        fold: '#E7C9A5',
        onPage: '#6D0B12',
        softPage: '#7D5A45',
      },
      {
        label: 'Neel',
        cloth: '#16306B',
        spine: '#0E2049',
        thread: '#E9E2C8',
        gold: '#EDC25C',
        ink: '#F8F3E2',
        soft: '#D9CD9C',
        page: '#F6F2E2',
        fold: '#C9CDD8',
        onPage: '#16306B',
        softPage: '#5A6480',
      },
      {
        label: 'Hara',
        cloth: '#14583C',
        spine: '#0B3D29',
        thread: '#EFE7C7',
        gold: '#E9C25B',
        ink: '#F9F4E0',
        soft: '#DAD6A0',
        page: '#F7F3DF',
        fold: '#CFD6BC',
        onPage: '#10452F',
        softPage: '#5D6F58',
      },
      {
        label: 'Kala',
        cloth: '#1E1B1A',
        spine: '#0E0C0B',
        thread: '#E8DDC3',
        gold: '#D9B25A',
        ink: '#F7EFDF',
        soft: '#CDBE96',
        page: '#F5EEDE',
        fold: '#D8CDB7',
        onPage: '#1E1B1A',
        softPage: '#6B6256',
      },
    ],
    sample: {
      name: 'मोहनलाल अग्रवाल',
      title: 'प्रोप्राइटर',
      company: 'मोहनलाल एंड संस',
      tagline: 'थोक किराना और अनाज व्यापारी',
      phone: '+91 98765 43210',
      email: 'mohanlalsons@mail.example',
      website: 'mohanlalsons.example',
      address: 'गद्दी नं. 14, अनाज मंडी, इंदौर',
    },
    sides: {
      front: {
        background: '$cloth',
        stacks: {
          sign: { x: 5.5, y: 34, w: 41.3, h: 24, anchor: 'top' },
          rest: { x: 5.5, y: 50, w: 41.3, h: 32.5, anchor: 'bottom', gap: 0.9 },
        },
        elements: [
          R('spine', -B, -B, VW + 2 * B, 13 + B, '$spine'),
          A('stitch', stitches(VW, 13, 2.2, VW / 15), { stroke: '$thread', sw: 0.42, cap: 'round', fill: 'none' }, VW, VH),
          R('rule', -B, 17.2, VW + 2 * B, 0.3, '$gold'),
          A(
            'corner',
            poly([
              [VW + 3, VH - 8],
              [VW + 3, VH + 3],
              [VW - 8, VH + 3],
            ]),
            { fill: '$spine' },
            VW,
            VH,
          ),
          LOGO('logo', 5.5, 20.5, 11, '$gold', { fallbackSize: 15, align: 'left' }),
          lead('lead', 5.5, 34, 0.45, '$gold'),
          T('company', '{company}', 5.5, 41.3, 20, {
            stack: 'sign',
            font: '$heading',
            fill: '$gold',
            minSize: 11,
            maxLines: 3,
            lineHeight: 1.2,
            hang: true,
          }),
          T('tagline', '{tagline}', 5.5, 41.3, 7.6, {
            stack: 'rest',
            fill: '$ink',
            gap: 0,
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.15,
            optional: true,
          }),
          T('name', '{name}', 5.5, 41.3, 8.4, {
            stack: 'rest',
            weight: 700,
            gap: 2,
            fill: '$ink',
            minSize: 6.5,
            maxLines: 1,
            lineHeight: 1.2,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 5.5, 41.3, 7, {
            stack: 'rest',
            fill: '$soft',
            icons: false,
            rowHeight: 1.45,
          }),
        ],
      },
      back: {
        background: '$page',
        stacks: { brand: { x: 9.5, y: 47, w: 31.8, h: 37, anchor: 'top', gap: 1.1 } },
        elements: [
          A('folds', `M5.6 11V${VH + 3}M${VW - 5.6} 11V${VH + 3}`, { stroke: '$fold', sw: 0.3, fill: 'none' }, VW, VH),
          R('spine', -B, -B, VW + 2 * B, 11 + B, '$cloth'),
          A('stitch', stitches(VW, 11, 2.2, VW / 11), { stroke: '$thread', sw: 0.42, cap: 'round', fill: 'none' }, VW, VH),
          QR('qr', VW / 2 - 13.5, 17.5, 27, { light: '#FFFFFF', dark: '#111111', quiet: 1.5 }),
          T('company', '{company}', 9.5, 31.8, 14, {
            stack: 'brand',
            font: '$heading',
            fill: '$onPage',
            align: 'center',
            minSize: 9,
            maxLines: 4,
            lineHeight: 1.2,
          }),
          T('phone', '{phone}', 9.5, 31.8, 8, {
            stack: 'brand',
            weight: 600,
            fill: '$softPage',
            align: 'center',
            minSize: 6.5,
            noWrap: true,
          }),
        ],
      },
    },
  },
  {
    id: 'three-phase',
    name: 'Three Phase',
    category: 'trades',
    tags: ['electrician', 'wiring', 'plumber', 'ac repair', 'contractor', 'solar', 'inverter', 'pipes', 'bold'],
    fonts: { heading: 'spacegrotesk', body: 'dmsans' },
    palettes: [
      {
        label: 'RYB',
        paper: '#FBF8F0',
        box: '#16181D',
        p1: '#D7263D',
        p2: '#F2B90F',
        p3: '#1B4FBF',
        ink: '#16181D',
        soft: '#5B5E66',
        onBox: '#FBF8F0',
      },
      {
        label: 'Copper',
        paper: '#F3EFE6',
        box: '#0F3B3A',
        p1: '#B8683A',
        p2: '#DE9C57',
        p3: '#7C3F22',
        ink: '#0F3B3A',
        soft: '#5A6B66',
        onBox: '#F3EFE6',
      },
      {
        label: 'PVC',
        paper: '#EAF1F6',
        box: '#0B2A4A',
        p1: '#FF7A1A',
        p2: '#8FA7BC',
        p3: '#0B6BCB',
        ink: '#0B2A4A',
        soft: '#4F6478',
        onBox: '#EAF1F6',
      },
      {
        label: 'Night',
        paper: '#14161C',
        box: '#F2B90F',
        p1: '#E8443A',
        p2: '#F2B90F',
        p3: '#3D7BF5',
        ink: '#F5F2E8',
        soft: '#AEB0B8',
        onBox: '#14161C',
      },
    ],
    sample: {
      name: 'Thomas Joseph',
      title: 'Licensed Electrical Contractor',
      company: 'Joseph Wiring Works',
      tagline: 'House wiring, inverters and repairs',
      phone: '+91 98765 43210',
      email: 'thomas@josephwiring.example',
      website: 'josephwiring.example',
      address: '17 MG Road, Ernakulam, Kochi',
    },
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 19.5, w: 66, h: 11, anchor: 'top', gap: 0.6 },
          reach: { x: 6, y: 30.5, w: 66, h: 16.3, anchor: 'bottom' },
        },
        elements: [
          A('wire-1', bend(10, 5.4, W - 5.4, 13.2, H + 3), { stroke: '$p1', sw: 2.5, fill: 'none' }),
          A('wire-2', bend(10, 9, W - 9, 9.6, H + 3), { stroke: '$p2', sw: 2.5, fill: 'none' }),
          A('wire-3', bend(10, 12.6, W - 12.6, 6, H + 3), { stroke: '$p3', sw: 2.5, fill: 'none' }),
          R('box', 6, 3, 13, 12, '$box', { r: 1 }),
          LOGO('logo', 6.75, 3.25, 11.5, '$onBox', { fallbackSize: 15, h: 11.5 }),
          T('company', '{company}', 6, 66, 16, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 2,
            lineHeight: 1.05,
          }),
          T('name', '{name}', 6, 66, 7.2, {
            stack: 'who',
            weight: 500,
            fill: '$soft',
            minSize: 6,
            maxLines: 1,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 66, 6.6, {
            stack: 'reach',
            fill: '$ink',
            iconFill: '$p3',
            rowHeight: 1.45,
          }),
        ],
      },
      back: {
        background: '$box',
        stacks: {
          brand: { x: 37, y: 5, w: 47.9, h: 13.5, anchor: 'bottom' },
          call: { x: 37, y: 32.5, w: 47.9, h: 13.5, anchor: 'top', gap: 0.6 },
        },
        elements: [
          A('wire-1', `M30 ${H / 2 - 3.6}L${W + 3} ${H / 2 - 3.6}`, { stroke: '$p1', sw: 2.5, fill: 'none' }),
          A('wire-2', `M30 ${H / 2}L${W + 3} ${H / 2}`, { stroke: '$p2', sw: 2.5, fill: 'none' }),
          A('wire-3', `M30 ${H / 2 + 3.6}L${W + 3} ${H / 2 + 3.6}`, { stroke: '$p3', sw: 2.5, fill: 'none' }),
          QR('qr', 6, H / 2 - 13, 26, { r: 1, light: '#FFFFFF', dark: '#111318' }),
          T('company', '{company}', 37, 47.9, 13, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$onBox',
            minSize: 8.5,
            maxLines: 3,
            lineHeight: 1.05,
          }),
          T('phone', '{phone}', 37, 47.9, 11, { stack: 'call', font: '$heading', weight: 700, fill: '$onBox', minSize: 8, noWrap: true }),
          T('tagline', '{tagline}', 37, 47.9, 6.6, {
            stack: 'call',
            fill: '$onBox',
            opacity: 0.85,
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'wall-paint',
    name: 'Wall Paint',
    category: 'hindi',
    lang: 'hi',
    tags: [
      'electrician',
      'plumber',
      'ac repair',
      'mobile repair',
      'driver',
      'tuition',
      'hindi',
      'devanagari',
      'sign painting',
      'phone first',
    ],
    fonts: { heading: 'yatra', body: 'notosansdeva' },
    palettes: [
      {
        label: 'Neel',
        wall: '#F1EBDB',
        paint: '#1534A1',
        onPaint: '#FFFFFF',
        band: '#F7C414',
        onBand: '#141414',
        ink: '#1E1C18',
        iconC: '#1534A1',
        white: '#FBF8EE',
      },
      {
        label: 'Lal',
        wall: '#F2ECDD',
        paint: '#C3201F',
        onPaint: '#FFF8E7',
        band: '#14406B',
        onBand: '#FFFFFF',
        ink: '#221A16',
        iconC: '#C3201F',
        white: '#FBF8EE',
      },
      {
        label: 'Hara',
        wall: '#EEF0DE',
        paint: '#0C6A3C',
        onPaint: '#FFFFFF',
        band: '#F4A91B',
        onBand: '#141414',
        ink: '#1C2118',
        iconC: '#0C6A3C',
        white: '#FBF9EE',
      },
      {
        label: 'Kala',
        wall: '#F4B915',
        paint: '#161514',
        onPaint: '#F9C927',
        band: '#C3201F',
        onBand: '#FFFFFF',
        ink: '#161514',
        iconC: '#161514',
        white: '#FFF9E6',
      },
    ],
    sample: {
      name: 'दिनेश शर्मा',
      title: 'इलेक्ट्रिशियन',
      company: 'शर्मा इलेक्ट्रिकल्स',
      tagline: 'बिजली फिटिंग, इन्वर्टर और एसी रिपेयर',
      phone: '+91 98765 43210',
      website: 'sharmaelectricals.example',
      address: 'शिवाजी नगर, भोपाल',
    },
    sides: {
      front: {
        background: '$wall',
        stacks: {
          sign: { x: 7, y: 6.5, w: 74, h: 18, anchor: 'top' },
          who: { x: 7, y: 19.5, w: 74, h: 4.4, anchor: 'bottom' },
          call: { x: 7, y: 25.5, w: 74, h: 11.5, anchor: 'middle' },
          reach: { x: 7, y: 38.5, w: 74, h: 8.8, anchor: 'bottom' },
        },
        elements: [
          A('paint', paintedBlock(2.6, 2.4, W - 8.5, 22.6, 11), { fill: '$paint' }),
          A('band', paintedBlock(2.6, 25.4, W - 11, 11.6, 23), { fill: '$band' }),
          lead('lead', 7, 6.5, 0.75, '$onPaint', 2.6),
          T('company', '{company}', 7, 74, 24, {
            stack: 'sign',
            font: '$heading',
            fill: '$onPaint',
            minSize: 12,
            maxLines: 2,
            lineHeight: 1.12,
            hang: true,
          }),
          T('name', '{name}', 7, 74, 8, {
            stack: 'who',
            weight: 600,
            fill: '$onPaint',
            minSize: 6.5,
            maxLines: 1,
            lineHeight: 1.15,
            optional: true,
          }),
          T('phone', '{phone}', 7, 72, 25, { stack: 'call', font: 'anton', fill: '$onBand', minSize: 17, noWrap: true, lineHeight: 1.12 }),
          L('contact', ['website', 'address'], 7, 74, 6.8, { stack: 'reach', fill: '$ink', iconFill: '$iconC', rowHeight: 1.45 }),
        ],
      },
      back: {
        background: '$paint',
        stacks: { brand: { x: 7, y: 7, w: 42, h: 36.8, anchor: 'middle', gap: 1.4 } },
        elements: [
          A('white', paintedBlock(W - 36, 8, 31, H - 16, 41, { tail: 1.5 }), { fill: '$white' }),
          LOGO('logo', 7, 7, 13, '$onPaint', { stack: 'brand', align: 'left', fallbackSize: 18 }),
          T('company', '{company}', 7, 42, 17, {
            stack: 'brand',
            font: '$heading',
            fill: '$onPaint',
            minSize: 10,
            maxLines: 3,
            lineHeight: 1.14,
          }),
          T('tagline', '{tagline}', 7, 42, 7, {
            stack: 'brand',
            fill: '$onPaint',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', W - 34, H / 2 - 13, 26, { light: '$white', dark: '#141414', quiet: 1 }),
        ],
      },
    },
  },
  {
    id: 'copy-label',
    name: 'Copy Label',
    category: 'marathi',
    lang: 'mr',
    tags: ['tuition', 'coaching', 'classes', 'school', 'teacher', 'marathi', 'devanagari', 'notebook', 'education'],
    fonts: { heading: 'tiro', body: 'notosansdeva' },
    palettes: [
      {
        label: 'Kraft',
        cover: '#B58A5B',
        fold: '#9C7448',
        slip: '#FFFDF6',
        red: '#C7302B',
        blue: '#2C5DA8',
        ink: '#16233F',
        soft: '#4F5C77',
        page: '#FDFBF2',
        rule: '#A9C4E4',
      },
      {
        label: 'Nilam',
        cover: '#1E3F8A',
        fold: '#16306D',
        slip: '#FFFDF6',
        red: '#D8392F',
        blue: '#1E3F8A',
        ink: '#14275A',
        soft: '#4F5C7E',
        page: '#FBFBF4',
        rule: '#B5C6E4',
      },
      {
        label: 'Popat',
        cover: '#2E7D4F',
        fold: '#22633D',
        slip: '#FFFDF3',
        red: '#D8542B',
        blue: '#2E7D4F',
        ink: '#123C25',
        soft: '#4F6B59',
        page: '#FBFCF2',
        rule: '#B5D4BD',
      },
      {
        label: 'Jambhul',
        cover: '#5B2A6E',
        fold: '#472056',
        slip: '#FFFCF6',
        red: '#E0663A',
        blue: '#5B2A6E',
        ink: '#34143F',
        soft: '#6B5574',
        page: '#FCFAF4',
        rule: '#CDBBD8',
      },
    ],
    sample: {
      name: 'प्रा. सुनील कुलकर्णी',
      title: 'गणित आणि विज्ञान शिक्षक',
      company: 'प्रगती क्लासेस',
      tagline: 'पाचवी ते दहावी, गणित आणि विज्ञान',
      phone: '+91 98765 43210',
      website: 'pragaticlasses.example',
      address: 'कर्वे रस्ता, कोथरूड, पुणे',
    },
    sides: {
      front: {
        background: '$cover',
        stacks: {
          sign: { x: 13.5, y: 12.5, w: 64, h: 18, anchor: 'top' },
          rest: { x: 13.5, y: 24.5, w: 64, h: 17, anchor: 'bottom', gap: 0.6 },
        },
        elements: [
          A('fold', `M-3 12L10 -3M${W - 10} ${H + 3}L${W + 3} ${H - 12}`, { stroke: '$fold', sw: 0.3, fill: 'none' }),
          A('label', notched(6, 5, W - 12, H - 10, 3.6), { fill: '$slip' }),
          A('edge', notched(7.1, 6.1, W - 14.2, H - 12.2, 3.2), { stroke: '$red', sw: 0.42, fill: 'none' }),
          A('edge2', notched(8, 7, W - 16, H - 14, 2.9), { stroke: '$blue', sw: 0.14, fill: 'none' }),
          A('line', `M8 12.5L${W - 8} 12.5`, { stroke: '$blue', sw: 0.2, fill: 'none' }),
          T('company', '{company}', 13.5, 64, 23, {
            stack: 'sign',
            font: '$heading',
            fill: '$ink',
            minSize: 11,
            maxLines: 2,
            lineHeight: 1.18,
            hang: true,
          }),
          T('name', '{name}', 13.5, 64, 8.4, {
            stack: 'rest',
            weight: 600,
            fill: '$soft',
            minSize: 6.5,
            maxLines: 1,
            lineHeight: 1.2,
            optional: true,
          }),
          L('contact', ['phone', 'website', 'address'], 13.5, 64, 7, { stack: 'rest', fill: '$ink', iconFill: '$red', rowHeight: 1.45 }),
        ],
      },
      back: {
        background: '$page',
        stacks: {
          brand: { x: 12.5, y: 23.6, w: 40, h: 20, anchor: 'top' },
          line: { x: 12.5, y: 36.5, w: 40, h: 10.3, anchor: 'bottom' },
        },
        elements: [
          A('rules', ruled(-3, W + 3, 5.9, 5.9, 8), { stroke: '$rule', sw: 0.14, fill: 'none' }),
          A('margin', `M9.5 -3V${H + 3}`, { stroke: '$red', sw: 0.22, fill: 'none' }),
          R('qr-plate', W - 33, H / 2 - 15, 29, 30, '$page'),
          QR('qr', W - 31.5, H / 2 - 13.5, 26.5, { light: '$page', dark: '#10182E', quiet: 1 }),
          LOGO('logo', 12.5, 6.8, 13, '$blue', { fallbackSize: 18, align: 'left' }),
          T('company', '{company}', 12.5, 40, 16, {
            stack: 'brand',
            font: '$heading',
            fill: '$ink',
            minSize: 9.5,
            maxLines: 3,
            lineHeight: 1.18,
            hang: true,
          }),
          T('tagline', '{tagline}', 12.5, 40, 7, {
            stack: 'line',
            fill: '$soft',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.2,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'jaali-screen',
    name: 'Jaali Screen',
    category: 'luxury',
    tags: ['jeweller', 'gold', 'silver', 'saree house', 'textile', 'heritage', 'luxury', 'lattice', 'wedding'],
    fonts: { heading: 'marcellus', body: 'manrope' },
    palettes: [
      {
        label: 'Panna',
        deep: '#0C3B2E',
        gold: '#D2A94C',
        mark: '#E9CB80',
        ink: '#F7F1DF',
        soft: '#CFC59A',
        paper: '#FAF5E6',
        onPaper: '#0C3B2E',
        softPaper: '#5B6A5C',
      },
      {
        label: 'Manik',
        deep: '#5A0F20',
        gold: '#D9AE58',
        mark: '#EFD08A',
        ink: '#FBF1E2',
        soft: '#E0C49E',
        paper: '#FBF4E8',
        onPaper: '#5A0F20',
        softPaper: '#7A5A58',
      },
      {
        label: 'Neelam',
        deep: '#10204B',
        gold: '#CFB070',
        mark: '#E8D4A0',
        ink: '#F4F1E6',
        soft: '#C4C2AE',
        paper: '#F7F4EA',
        onPaper: '#10204B',
        softPaper: '#5A627C',
      },
      {
        label: 'Moti',
        deep: '#F5EEDD',
        gold: '#A98232',
        mark: '#7D5E1E',
        ink: '#2C2413',
        soft: '#6E6242',
        paper: '#FBF6E8',
        onPaper: '#2C2413',
        softPaper: '#6E6242',
      },
    ],
    sample: {
      name: 'Mayur Soni',
      title: 'Partner',
      company: 'Mayur Kantilal Jewellers',
      tagline: 'Gold, diamond and silver jewellery',
      phone: '+91 98765 43210',
      email: 'mayur@mkjewellers.example',
      website: 'mkjewellers.example',
      address: '112 Manek Chowk, Old City, Ahmedabad',
    },
    sides: {
      front: {
        background: '$deep',
        stacks: {
          who: { x: 37, y: 6.5, w: 47.9, h: 21, anchor: 'top', gap: 1.2 },
          reach: { x: 37, y: 28, w: 47.9, h: 18.3, anchor: 'bottom' },
        },
        elements: [
          A('screen', jaali(-3, -3, 33, H + 6, 8), { fill: '$gold', evenodd: true }),
          E('seal', 3.5, H / 2 - 10.5, 21, 21, '$deep', { stroke: '$gold', sw: 0.6 }),
          LOGO('logo', 6.5, H / 2 - 7.5, 15, '$mark', { fallbackSize: 22 }),
          T('company', '{company}', 37, 47.9, 16, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$mark',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.1,
          }),
          T('name', '{name}', 37, 47.9, 7.4, { stack: 'who', fill: '$ink', minSize: 6, maxLines: 2, lineHeight: 1.2, optional: true }),
          L('contact', ['phone', 'email', 'website', 'address'], 37, 47.9, 6.6, {
            stack: 'reach',
            fill: '$soft',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 18, y: 33.5, w: W - 36, h: 13, anchor: 'top', gap: 0.5 } },
        elements: [
          A('left', jaali(-3, -3, 14.5, H + 6, 8), { fill: '$gold', evenodd: true }),
          A('right', jaali(W - 11.5, -3, 14.5, H + 6, 8), { fill: '$gold', evenodd: true }),
          QR('qr', W / 2 - 13.5, 4.5, 27, { light: '$paper', dark: '#14110A', quiet: 1 }),
          T('company', '{company}', 18, W - 36, 12, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$onPaper',
            align: 'center',
            minSize: 8,
            maxLines: 2,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 18, W - 36, 6.2, {
            stack: 'brand',
            fill: '$softPaper',
            align: 'center',
            minSize: 5.5,
            maxLines: 1,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'iris-rosette',
    name: 'Iris',
    category: 'creative',
    tags: ['photographer', 'wedding photography', 'videographer', 'studio', 'camera', 'portrait', 'bold'],
    fonts: { heading: 'syne', body: 'dmsans' },
    palettes: [
      {
        label: 'Dusk',
        bg: '#15121B',
        i0: '#F7B733',
        i1: '#EE8434',
        i2: '#C94F2B',
        i3: '#7E2A2E',
        ink: '#F8F2E6',
        soft: '#B9B0A6',
        plate: '#FFFBF2',
      },
      {
        label: 'Rose',
        bg: '#FAEFE9',
        i0: '#7A1C3F',
        i1: '#B02E5B',
        i2: '#DE6D7E',
        i3: '#F2A7A0',
        ink: '#3D0E22',
        soft: '#83596A',
        plate: '#FFFBF7',
      },
      {
        label: 'Sea',
        bg: '#07333D',
        i0: '#D6E4C3',
        i1: '#7FC4A8',
        i2: '#2E9C94',
        i3: '#136A72',
        ink: '#EEF5E9',
        soft: '#A5C2BB',
        plate: '#FBFDF7',
      },
      {
        label: 'Mono',
        bg: '#F3F2EE',
        i0: '#141414',
        i1: '#4C4C4C',
        i2: '#8D8D8D',
        i3: '#C4C4C4',
        ink: '#141414',
        soft: '#5F5F5C',
        plate: '#FFFFFF',
      },
    ],
    sample: {
      name: 'Kaveri Nair',
      title: 'Wedding and Portrait Photographer',
      company: 'Studio Kaveri',
      tagline: 'Weddings, portraits and family stories',
      phone: '+91 98765 43210',
      email: 'kaveri@studiokaveri.example',
      website: 'studiokaveri.example',
      address: 'Panampilly Nagar, Kochi',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          who: { x: 6, y: 6.5, w: 60, h: 20.5, anchor: 'top', gap: 1 },
          reach: { x: 6, y: 28, w: 44, h: 18.8, anchor: 'bottom' },
        },
        elements: [
          ...irisBlades(W - 11, H - 7, 27, 7.5, 8, Math.PI / 8).map((d, i) => A(`blade-${i}`, d, { fill: `$i${i % 4}` })),
          T('name', '{name}', 6, 60, 18, {
            stack: 'who',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 2,
            lineHeight: 1.04,
          }),
          T('title', '{title}', 6, 60, 7.2, { stack: 'who', fill: '$soft', minSize: 6, maxLines: 2, lineHeight: 1.2, optional: true }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 44, 6.6, { stack: 'reach', fill: '$ink', icons: false }),
        ],
      },
      back: {
        background: '$bg',
        stacks: { brand: { x: 6, y: 6, w: 28, h: 38.8, anchor: 'middle', gap: 1.4 } },
        elements: [
          A('opening', octagon(63, H / 2, 21.4), { fill: '$plate' }),
          ...irisBlades(63, H / 2, 29, 21, 8, Math.PI / 8).map((d, i) => A(`blade-${i}`, d, { fill: `$i${i % 4}` })),
          QR('qr', 63 - 13.5, H / 2 - 13.5, 27, { light: '$plate', dark: '#111014', quiet: 1 }),
          LOGO('logo', 6, 6, 13, '$ink', { stack: 'brand', align: 'left', fallbackSize: 18 }),
          T('company', '{company}', 6, 28, 12, {
            stack: 'brand',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            minSize: 8,
            maxLines: 4,
            lineHeight: 1.08,
          }),
        ],
      },
    },
  },
  {
    id: 'patang-string',
    name: 'Patang',
    category: 'marathi',
    lang: 'mr',
    orientation: 'vertical',
    tags: ['event planner', 'decorator', 'wedding planner', 'birthday', 'marathi', 'devanagari', 'kites', 'festive', 'colourful'],
    fonts: { heading: 'baloo2', body: 'baloo2' },
    palettes: [
      {
        label: 'Haldi',
        sky: '#F7B500',
        k1: '#D31F4F',
        k2: '#12355B',
        k3: '#FFF6DF',
        string: '#2B1406',
        ink: '#2B1406',
        soft: '#5C3707',
        plate: '#FFF9E9',
      },
      {
        label: 'Aakash',
        sky: '#BEE7E8',
        k1: '#F2542D',
        k2: '#F5B700',
        k3: '#0E7C86',
        string: '#0B3A44',
        ink: '#0B3A44',
        soft: '#2E5F68',
        plate: '#F6FDFC',
      },
      {
        label: 'Rani',
        sky: '#C2185B',
        k1: '#F9B233',
        k2: '#1B2B65',
        k3: '#FFF5EA',
        string: '#FFF5EA',
        ink: '#FFF5EA',
        soft: '#FFD8D0',
        plate: '#FFF8F2',
      },
      {
        label: 'Raat',
        sky: '#12254F',
        k1: '#F2542D',
        k2: '#F5B700',
        k3: '#F7EFE0',
        string: '#F7EFE0',
        ink: '#F7EFE0',
        soft: '#BEC6DA',
        plate: '#FBF7EE',
      },
    ],
    sample: {
      name: 'स्नेहा जोशी',
      title: 'संचालिका',
      company: 'रंगोत्सव इव्हेंट्स',
      tagline: 'लग्न, वाढदिवस आणि कार्यक्रम नियोजन',
      phone: '+91 98765 43210',
      website: 'rangotsav.example',
      address: 'गंगापूर रोड, नाशिक',
    },
    sides: {
      front: {
        background: '$sky',
        stacks: {
          sign: { x: 8, y: 52, w: 38.8, h: 24, anchor: 'top' },
          rest: { x: 5, y: 66, w: 41.8, h: 18.9, anchor: 'bottom', gap: 0.8 },
        },
        elements: [
          A(
            'strings',
            `M${n(KITE_MID.bottom[0])} ${n(KITE_MID.bottom[1])}C2 44 8 47 -3 50M${n(KITE_SMALL.bottom[0])} ${n(KITE_SMALL.bottom[1])}C43 49 50 49 54 53`,
            { stroke: '$string', sw: 0.2, fill: 'none' },
            VW,
            VH,
          ),
          ...kiteArt('mid', KITE_MID),
          ...kiteArt('small', KITE_SMALL),
          ...kiteArt('main', KITE_MAIN),
          A(
            'string',
            `M${n(KITE_MAIN.bottom[0])} ${n(KITE_MAIN.bottom[1])}C24 50 3.4 40 3.4 49Q3.4 52 6 52L7.6 52`,
            { stroke: '$string', sw: 0.42, fill: 'none', cap: 'round' },
            VW,
            VH,
          ),
          T('company', '{company}', 8, 38.8, 19, {
            stack: 'sign',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            minSize: 11,
            maxLines: 3,
            lineHeight: 1.1,
            hang: true,
          }),
          T('name', '{name}', 5, 41.8, 8.4, {
            stack: 'rest',
            weight: 600,
            fill: '$soft',
            minSize: 6.5,
            maxLines: 1,
            lineHeight: 1.1,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 5, 41.8, 7, { stack: 'rest', fill: '$ink', icons: false, rowHeight: 1.4 }),
        ],
      },
      back: {
        background: '$sky',
        stacks: { brand: { x: 6, y: 63, w: 38.8, h: 21.9, anchor: 'middle', gap: 0.8 } },
        elements: [
          A(
            'plate',
            poly([
              [VW / 2, 1],
              [VW / 2 + 29.5, 30.5],
              [VW / 2, 60],
              [VW / 2 - 29.5, 30.5],
            ]),
            { fill: '$plate' },
            VW,
            VH,
          ),
          QR('qr', VW / 2 - 13.5, 17, 27, { light: '$plate', dark: '#141018', quiet: 1 }),
          LOGO('logo', VW / 2 - 5, 4.5, 10, '$ink', { fallbackSize: 13, fill: '#141018' }),
          T('company', '{company}', 6, 38.8, 15, {
            stack: 'brand',
            font: '$heading',
            weight: 800,
            fill: '$ink',
            align: 'center',
            minSize: 9.5,
            maxLines: 3,
            lineHeight: 1.1,
          }),
          T('tagline', '{tagline}', 6, 38.8, 7, {
            stack: 'brand',
            fill: '$soft',
            align: 'center',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.1,
            optional: true,
          }),
        ],
      },
    },
  },
];
