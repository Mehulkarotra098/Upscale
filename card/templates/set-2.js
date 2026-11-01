// Template set 2: retail and food. Every card is one idea that belongs to one trade. All art is drawn by the code below.
// Sizes are millimetres and points. Trim is 88.9 × 50.8 mm (vertical: 50.8 × 88.9). Sample details are invented.
import { ellipsePath, rectPath } from '../src/core/pathutil.js';
import { B, H, L, LOGO, QR, R, T, W } from './kit.js';

const TAU = Math.PI * 2;

const n = (v) => {
  const r = Math.round(v * 100) / 100;
  return String(Object.is(r, -0) ? 0 : r);
};
const poly = (list, close = true) => `M${list.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}${close ? 'Z' : ''}`;
const polar = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

/** A small seeded random generator, so the art comes out the same every time. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Element shorthands. Path art uses card coordinates directly, so its box is simply the card.
const art = (id, d, o = {}) => ({ id, type: 'path', x: 0, y: 0, w: W, h: H, d, ...o });
const vart = (id, d, o = {}) => ({ id, type: 'path', x: 0, y: 0, w: H, h: W, d, ...o });
const disc = (id, cx, cy, r, o = {}) => ({ id, type: 'ellipse', x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, ...o });
// ---------------------------------------------------------------------------------------------------------------------
// Gunny sack: jute weave, a stitched hem, and a tea chest for the back.

/** Jute weave as two dashed thread layers. Dashes on alternate rows are offset, which reads as over-and-under. */
function weave(w, h, pitch = 0.64, seed = 3) {
  const r = rng(seed);
  let across = '';
  let down = '';
  let row = 0;
  for (let y = -B; y <= h + B; y += pitch, row++) {
    const x0 = -B - (row % 2 ? pitch : 0);
    const j = (r() - 0.5) * 0.14;
    across += `M${n(x0)} ${n(y + j)}L${n(w + B)} ${n(y - j)}`;
  }
  row = 0;
  for (let x = -B; x <= w + B; x += pitch, row++) {
    const y0 = -B - (row % 2 ? pitch : 0);
    const j = (r() - 0.5) * 0.14;
    down += `M${n(x + j)} ${n(y0)}L${n(x - j)} ${n(h + B)}`;
  }
  return { across, down };
}

/** Big diagonal twine stitches along a hem. */
function hemStitches(x0, x1, y, step = 3.4, rise = 2.2) {
  let d = '';
  for (let x = x0; x < x1; x += step) d += `M${n(x)} ${n(y + rise / 2)}L${n(x + step * 0.62)} ${n(y - rise / 2)}`;
  return d;
}

/** The crossed-out hook that real sacks carry: USE NO HOOKS. */
function noHook(x, y, s) {
  const hook = `M${n(x + s * 0.56)} ${n(y + s * 0.12)}V${n(y + s * 0.56)}C${n(x + s * 0.56)} ${n(y + s * 0.84)} ${n(x + s * 0.22)} ${n(y + s * 0.84)} ${n(x + s * 0.22)} ${n(y + s * 0.56)}`;
  const cross = `M${n(x + s * 0.1)} ${n(y + s * 0.1)}L${n(x + s * 0.9)} ${n(y + s * 0.9)}M${n(x + s * 0.9)} ${n(y + s * 0.1)}L${n(x + s * 0.1)} ${n(y + s * 0.9)}`;
  return { hook, cross };
}

/** Plank boards with long wavering grain. */
function planks(w, h, count, seed = 9) {
  const r = rng(seed);
  let seams = '';
  let grain = '';
  const ph = (h + 2 * B) / count;
  for (let i = 0; i < count; i++) {
    const top = -B + i * ph;
    if (i) seams += `M${-B} ${n(top)}L${n(w + B)} ${n(top)}`;
    for (let g = 0; g < 7; g++) {
      const y = top + 1 + r() * (ph - 2);
      const a = (r() - 0.5) * 1.2;
      const b = (r() - 0.5) * 1.2;
      grain += `M${-B} ${n(y)}C${n(w * 0.3)} ${n(y + a)} ${n(w * 0.6)} ${n(y + b)} ${n(w + B)} ${n(y + (a - b) / 2)}`;
    }
  }
  return { seams, grain };
}

/** A stencilled This Side Up arrow. */
function upArrow(x, y, s) {
  return poly([
    [x + s * 0.5, y],
    [x + s, y + s * 0.5],
    [x + s * 0.68, y + s * 0.5],
    [x + s * 0.68, y + s],
    [x + s * 0.32, y + s],
    [x + s * 0.32, y + s * 0.5],
    [x, y + s * 0.5],
  ]);
}

const weaveH = weave(W, H);
const sackHook = noHook(70.2, 31.6, 10.6);
const chest = planks(W, H, 3);
const rivets = [6, 18, 32, 44].flatMap((y) => [ellipsePath(0.8, y, 0.75, 0.75), ellipsePath(W - 0.8, y, 0.75, 0.75)]).join('');

// ---------------------------------------------------------------------------------------------------------------------
// Cracked screen: a spider web of broken glass, and the phone's insides on the back.

/** Broken glass radiating from one impact. Returns the heavy cracks, the fine web between them, and lit shards. */
function crackWeb(cx, cy, reach, yMax, seed) {
  const r = rng(seed);
  const N = 15;
  const rays = [];
  for (let i = 0; i < N; i++) {
    let a = (i / N) * TAU + (r() - 0.5) * 0.28;
    const len = reach * (0.5 + r() * 0.75);
    const line = [polar(cx, cy, 0.5, a)];
    let d = 0.5;
    while (d < len) {
      d += 3 + r() * 5.5;
      a += (r() - 0.5) * 0.2;
      const last = line[line.length - 1];
      const step = d - Math.hypot(last[0] - cx, last[1] - cy);
      const p = polar(last[0], last[1], Math.max(1.6, step), a);
      if (p[1] > yMax) break;
      line.push(p);
    }
    rays.push(line);
  }
  let heavy = '';
  rays.forEach((l) => (heavy += poly(l, false)));
  const at = (ray, rad) => {
    for (let i = 1; i < ray.length; i++) {
      const d0 = Math.hypot(ray[i - 1][0] - cx, ray[i - 1][1] - cy);
      const d1 = Math.hypot(ray[i][0] - cx, ray[i][1] - cy);
      if (d1 >= rad) {
        const t = (rad - d0) / Math.max(d1 - d0, 0.01);
        return [ray[i - 1][0] + (ray[i][0] - ray[i - 1][0]) * t, ray[i - 1][1] + (ray[i][1] - ray[i - 1][1]) * t];
      }
    }
    return null;
  };
  let fine = '';
  let shards = '';
  [1.8, 3.6, 6, 9.4, 14, 20].forEach((base, ringIndex) => {
    for (let i = 0; i < N; i++) {
      if (r() < 0.1 + ringIndex * 0.09) continue;
      const a = at(rays[i], base * (0.9 + r() * 0.22));
      const b = at(rays[(i + 1) % N], base * (0.9 + r() * 0.22));
      if (!a || !b) continue;
      const mid = [(a[0] + b[0]) / 2 + (r() - 0.5) * 1.1, (a[1] + b[1]) / 2 + (r() - 0.5) * 1.1];
      fine += poly([a, mid, b], false);
      if (r() < 0.3) {
        const a2 = at(rays[i], base * 1.42);
        const b2 = at(rays[(i + 1) % N], base * 1.42);
        if (a2 && b2) shards += poly([a, mid, b, b2, a2]);
      }
    }
  });
  // A few long splinters leave the web.
  for (let i = 0; i < 7; i++) {
    const ray = rays[Math.floor(r() * N)];
    const start = ray[Math.min(2, ray.length - 1)];
    let a = Math.atan2(start[1] - cy, start[0] - cx) + (r() - 0.5) * 1.1;
    const line = [start];
    for (let k = 0; k < 3; k++) {
      a += (r() - 0.5) * 0.3;
      const p = polar(line[line.length - 1][0], line[line.length - 1][1], 3 + r() * 4, a);
      if (p[1] > yMax) break;
      line.push(p);
    }
    fine += poly(line, false);
  }
  return { heavy, fine, shards };
}

/** Circuit traces: each entry is a list of points. Vias are drawn at the free ends. */
function traces(lines) {
  let d = '';
  let vias = '';
  for (const l of lines) {
    d += poly(l, false);
    const [x, y] = l[l.length - 1];
    vias += ellipsePath(x, y, 0.55, 0.55);
  }
  return { d, vias };
}

/** IC legs around a square chip. */
function chipPins(x, y, s, count, len = 1.1, wid = 0.42) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const p = ((i + 0.5) / count) * s;
    d += rectPath(x + p - wid / 2, y - len, wid, len);
    d += rectPath(x + p - wid / 2, y + s, wid, len);
    d += rectPath(x - len, y + p - wid / 2, len, wid);
    d += rectPath(x + s, y + p - wid / 2, len, wid);
  }
  return d;
}

/** Tiny surface-mount parts scattered on the board. */
function smdParts(list) {
  return list.map(([x, y, w, h]) => rectPath(x, y, w, h, 0.1)).join('');
}

const phoneTraces = traces([
  [
    [12.5, 28.6],
    [12.5, 26],
    [10, 23.5],
  ],
  [
    [16.5, 28.6],
    [16.5, 25],
    [14, 22.5],
  ],
  [
    [20.5, 28.6],
    [20.5, 24],
    [20.5, 21],
  ],
  [
    [30.5, 28.6],
    [30.5, 24.5],
    [33, 22],
  ],
  [
    [34.5, 28.6],
    [34.5, 25.5],
    [38, 22],
  ],
  [
    [38.5, 28.6],
    [38.5, 26.5],
    [43, 22],
  ],
  [
    [8.4, 34],
    [5.6, 36.8],
    [5.6, 44],
  ],
  [
    [8.4, 38],
    [7, 39.4],
    [7, 49],
  ],
  [
    [8.4, 44],
    [8.4, 54],
  ],
  [
    [42.4, 34],
    [45.2, 36.8],
    [45.2, 44],
  ],
  [
    [42.4, 38],
    [43.8, 39.4],
    [43.8, 49],
  ],
  [
    [42.4, 44],
    [42.4, 54],
  ],
]);
const crackV = crackWeb(33, 23, 36, 45, 41);

// ---------------------------------------------------------------------------------------------------------------------
// Brilliant cut: a round brilliant in flat facets, shaded by chosen tones instead of any effect.

/** A round brilliant seen from above. Returns five tone layers, plus the facet edges. */
function brilliant(cx, cy, R, seed = 7) {
  const r = rng(seed);
  const step = TAU / 8;
  const off = step / 2;
  const At = (i) => polar(cx, cy, R * 0.54, i * step + off);
  const St = (i) => polar(cx, cy, R * 0.74, (i + 0.5) * step + off);
  const Gi = (i) => polar(cx, cy, R, i * step + off);
  const Mi = (i) => polar(cx, cy, R, (i + 0.5) * step + off);
  const In = (i) => polar(cx, cy, R * 0.27, (i + 0.5) * step + off);
  const faces = [];
  for (let i = 0; i < 8; i++) {
    faces.push([At(i), At(i + 1), St(i)]);
    faces.push([At(i), St(i), Gi(i), St(i - 1)]);
    faces.push([St(i), Gi(i), Mi(i)]);
    faces.push([St(i), Mi(i), Gi(i + 1)]);
    faces.push([At(i), At(i + 1), In(i)]);
    faces.push([At(i), In(i), In(i - 1)]);
    faces.push([[cx, cy], In(i), In(i + 1)]);
  }
  const layers = ['', '', '', '', ''];
  let edges = '';
  for (const face of faces) {
    const mx = face.reduce((a, p) => a + p[0], 0) / face.length;
    const my = face.reduce((a, p) => a + p[1], 0) / face.length;
    // Light falls from the upper left, and every facet then flashes on its own.
    const lit = (-(mx - cx) - (my - cy)) / (R * 1.4);
    const v = 2 + lit * 1.3 + (r() - 0.5) * 3.9;
    layers[Math.max(0, Math.min(4, Math.round(v)))] += poly(face);
    edges += poly(face);
  }
  return { layers, edges };
}

/** A four-point glint. */
function glint(x, y, s) {
  const k = s * 0.1;
  return `M${n(x)} ${n(y - s)}Q${n(x + k)} ${n(y - k)} ${n(x + s)} ${n(y)}Q${n(x + k)} ${n(y + k)} ${n(x)} ${n(y + s)}Q${n(x - k)} ${n(y + k)} ${n(x - s)} ${n(y)}Q${n(x - k)} ${n(y - k)} ${n(x)} ${n(y - s)}Z`;
}

/** The same stone in side elevation, as drawn on a grading report. */
function gemProfile(x, y, w) {
  const R = w / 2;
  const cx = x + R;
  const girdle = y + w * 0.17;
  const culet = y + w * 0.6;
  const t = R * 0.54;
  const out = poly([
    [cx - t, y],
    [cx + t, y],
    [cx + R, girdle],
    [cx, culet],
    [cx - R, girdle],
  ]);
  let inner = `M${n(cx - R)} ${n(girdle)}L${n(cx + R)} ${n(girdle)}`;
  for (const k of [-0.62, -0.26, 0.26, 0.62]) inner += `M${n(cx + k * R)} ${n(girdle)}L${n(cx)} ${n(culet)}`;
  for (const [a, b] of [
    [-0.62, -0.54],
    [-0.62, 0],
    [0, -0.54],
    [0, 0.54],
    [0.62, 0],
    [0.62, 0.54],
  ]) {
    inner += `M${n(cx + a * R)} ${n(girdle)}L${n(cx + b * R)} ${n(y)}`;
  }
  return { out, inner, girdle, culet };
}

const gem = brilliant(84.5, 25.4, 36);
const gemSide = gemProfile(23, 6.2, 31);

// ---------------------------------------------------------------------------------------------------------------------
// Kaju katli: diamonds cut from one sheet, with silver varak leaf that has crinkled and torn.

function katliPiece(cx, cy, a, b, r, gap = 0.16) {
  const A = a - gap;
  const Bb = b - gap;
  const piece = poly([
    [cx, cy - Bb],
    [cx + A, cy],
    [cx, cy + Bb],
    [cx - A, cy],
  ]);
  const edge = `M${n(cx + A)} ${n(cy)}L${n(cx)} ${n(cy + Bb)}L${n(cx - A)} ${n(cy)}`;
  const flake = (scale, ox, oy, sides) => {
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const t = (i / sides) * TAU + r() * 0.5;
      const k = scale * (0.55 + r() * 0.45);
      pts.push([cx + ox + Math.cos(t) * A * k, cy + oy + Math.sin(t) * Bb * k]);
    }
    // Keep the leaf inside the diamond.
    return poly(
      pts.map(([x, y]) => {
        const q = Math.abs(x - cx) / A + Math.abs(y - cy) / Bb;
        return q > 0.9 ? [cx + ((x - cx) / q) * 0.9, cy + ((y - cy) / q) * 0.9] : [x, y];
      }),
    );
  };
  const foil = flake(0.74, (r() - 0.5) * A * 0.2, (r() - 0.5) * Bb * 0.2, 9);
  const foil2 = flake(0.3, (r() - 0.5) * A * 0.5, (r() - 0.5) * Bb * 0.5, 6);
  return { piece, edge, foil, foil2 };
}

/** A tray of pieces on a diamond lattice. keep(x, y) decides which ones are there. */
function katliTray(a, b, keep, seed, ox = 0, oy = 0) {
  const r = rng(seed);
  const out = { piece: '', edge: '', foil: '', foil2: '' };
  for (let row = -4; row < 30; row++) {
    const y = oy + row * b;
    if (y < -b - B || y > H + b + B) continue;
    for (let k = -3; k < 16; k++) {
      const x = ox + (Math.abs(row) % 2 ? a : 0) + k * 2 * a;
      if (x < -a - B || x > W + a + B || !keep(x, y)) continue;
      const p = katliPiece(x, y, a, b, r);
      for (const key of Object.keys(out)) out[key] += p[key];
    }
  }
  return out;
}

/** One loose piece with a bite out of its corner, turned on the table. */
function bittenKatli(cx, cy, a, b, turn, seed) {
  const r = rng(seed);
  const rot = ([x, y]) => [cx + x * Math.cos(turn) - y * Math.sin(turn), cy + x * Math.sin(turn) + y * Math.cos(turn)];
  const p = (x, y) => {
    const [px, py] = rot([x, y]);
    return `${n(px)} ${n(py)}`;
  };
  // Tooth marks: three scallops bitten out of the right-hand point.
  const piece =
    `M${p(0, -b)}L${p(a * 0.46, -b * 0.54)}Q${p(a * 0.3, -b * 0.3)} ${p(a * 0.42, -b * 0.16)}` +
    `Q${p(a * 0.24, 0)} ${p(a * 0.42, b * 0.16)}Q${p(a * 0.3, b * 0.3)} ${p(a * 0.46, b * 0.54)}L${p(0, b)}L${p(-a, 0)}Z`;
  const edge = `M${p(a * 0.46, b * 0.54)}L${p(0, b)}L${p(-a, 0)}`;
  const pts = [];
  for (let i = 0; i < 9; i++) {
    const t = (i / 9) * TAU;
    const k = 0.34 + r() * 0.18;
    pts.push(rot([-a * 0.22 + Math.cos(t) * a * k, Math.sin(t) * b * k]));
  }
  const crumbs = [
    [a * 0.86, -b * 0.3, 0.42],
    [a * 1.1, b * 0.1, 0.3],
    [a * 0.84, b * 0.42, 0.24],
  ]
    .map(([x, y, s]) => {
      const [px, py] = rot([x, y]);
      return ellipsePath(px, py, s, s * 0.8);
    })
    .join('');
  return { piece, edge, foil: poly(pts), crumbs };
}

const KA = 8.4;
const KB = 5.7;
const katliFront = katliTray(KA, KB, (x, y) => x >= (y > 30 ? 67 : 58), 12, 0, -KB);
const katliBack = katliTray(9, 6.1, (x, y) => y < 4 || y > H - 4, 27, W / 2 - 36, H / 2 - 24.4);
const katliLoose = bittenKatli(57.6, 41.6, KA, KB, -0.42, 5);

// ---------------------------------------------------------------------------------------------------------------------
// Genda toran: strings of marigolds with mango leaves, the way a doorway is dressed.

/** A ruffled ring as a relative path, so one flower shape can be stamped many times cheaply. */
function ruffleRing(R, bumps, seed, depth = 0.24) {
  const r = rng(seed);
  // Tenths of a millimetre, measured from the rounded position so errors can't add up. Flowers repeat hundreds of times.
  const tenth = (v) => Math.round(v * 10) / 10;
  const num = (v) => String(tenth(v) || 0).replace(/^(-?)0./, '$1.');
  let s = '';
  let px = R;
  let py = 0;
  for (let i = 1; i <= bumps; i++) {
    const a = (i / bumps) * TAU;
    const rad = i === bumps ? R : R * (1 - depth * 0.55 * r());
    const [x, y] = polar(0, 0, rad, a);
    const [qx, qy] = polar(0, 0, R * (1 + depth * 0.5), a - TAU / bumps / 2);
    s += `q${[qx - px, qy - py, x - px, y - py].map(num).join(' ')}`.replace(/ -/g, '-');
    px += tenth(x - px);
    py += tenth(y - py);
  }
  return `${s}Z`;
}

/** Stamp marigolds in two colourways. list: [x, y, 'a' | 'b']. */
function marigolds(list, R, seed) {
  const forms = [0, 1, 2].map((v) => ({
    o: ruffleRing(R, 11, seed + v * 11),
    m: ruffleRing(R * 0.76, 8, seed + v * 13),
    i: ruffleRing(R * 0.48, 7, seed + v * 17),
    c: ruffleRing(R * 0.2, 5, seed + v * 19),
  }));
  const out = { a1: '', a2: '', a3: '', a4: '', b1: '', b2: '', b3: '', b4: '' };
  list.forEach(([x, y, c], i) => {
    const f = forms[i % 3];
    out[`${c}1`] += `M${n(x + R)} ${n(y)}${f.o}`;
    out[`${c}2`] += `M${n(x + R * 0.7)} ${n(y - R * 0.05)}${f.m}`;
    out[`${c}3`] += `M${n(x + R * 0.4)} ${n(y - R * 0.1)}${f.i}`;
    out[`${c}4`] += `M${n(x + R * 0.16)} ${n(y - R * 0.1)}${f.c}`;
  });
  return out;
}

function leaf(x, y, len, wid, a) {
  const c = (d, o) => [x + Math.cos(a) * d - Math.sin(a) * o, y + Math.sin(a) * d + Math.cos(a) * o];
  const [tx, ty] = c(len, 0);
  const [ax, ay] = c(len * 0.35, wid);
  const [bx, by] = c(len * 0.75, wid * 0.7);
  const [ex, ey] = c(len * 0.75, -wid * 0.7);
  const [fx, fy] = c(len * 0.35, -wid);
  return `M${n(x)} ${n(y)}C${n(ax)} ${n(ay)} ${n(bx)} ${n(by)} ${n(tx)} ${n(ty)}C${n(ex)} ${n(ey)} ${n(fx)} ${n(fy)} ${n(x)} ${n(y)}Z`;
}

/** Strands that stay short over the words and then fall the full height of the card on the right. */
function toranStrands() {
  const pitch = 4.72;
  const list = [];
  let thread = '';
  let leaves = '';
  let tips = '';
  const counts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 5, 7, 9, 11, 11];
  counts.forEach((c, i) => {
    const x = 2.6 + i * 5.3;
    const drop = 7 + (i % 2 ? 2.2 : 0);
    thread += `M${n(x)} -3L${n(x)} ${n(drop + (c - 1) * pitch)}`;
    for (let k = 0; k < c; k++) list.push([x, drop + k * pitch, (i + k) % 2 ? 'a' : 'b']);
    // A little leaf closes each strand.
    tips += leaf(x, drop + (c - 1) * pitch + 2.3, 3.6, 0.95, Math.PI / 2);
  });
  for (let x = -2.65; x < W + 3; x += 5.3) {
    leaves += leaf(x + 2.65, -2.6, 7.6, 1.7, Math.PI / 2 + 0.36);
    leaves += leaf(x + 2.65, -2.6, 7.6, 1.7, Math.PI / 2 - 0.36);
  }
  return { list, thread, leaves, tips };
}

/** A solid wall of flowers, staggered. */
function flowerWall(R, w, h) {
  const list = [];
  let row = 0;
  for (let y = -B; y < h + B + R; y += R * 1.5, row++) {
    for (let x = row % 2 ? -B + R * 0.88 : -B; x < w + B + R; x += R * 1.76) list.push([x, y, (row + Math.round(x)) % 3 ? 'a' : 'b']);
  }
  return list;
}

const toran = toranStrands();
const toranBlooms = marigolds(toran.list, 2.95, 71);
const wallBlooms = marigolds(
  flowerWall(4.9, W, H).filter(([x, y]) => !(x > 13 && x < W - 13 && y > 13 && y < H - 13)),
  4.9,
  85,
);

// ---------------------------------------------------------------------------------------------------------------------
// Lapel: a suit front with the tailor's tape round its neck. The back is the inside of the jacket.

const LC = H / 2;
function chalkStripes(w, h, pitch) {
  let d = '';
  for (let x = pitch / 2; x < w; x += pitch) d += `M${n(x)} -3L${n(x)} ${n(h + 3)}`;
  return d;
}
function twill(w, h, pitch) {
  let d = '';
  for (let o = -h; o < w + h; o += pitch) d += `M${n(o)} -3L${n(o + h + 6)} ${n(h + 3)}`;
  return d;
}
const mirror = (list) => list.map(([x, y]) => [2 * LC - x, y]);
const lapelL = [
  [LC - 14, -3],
  [LC, 47],
  [LC - 13.6, 31],
  [LC - 20.5, 18],
  [LC - 14.4, 16],
  [LC - 20.8, 10.2],
  [LC - 18, -3],
];
const lapelSeamL = [
  [LC - 2.5, 42.5],
  [LC - 13, 31],
  [LC - 19.2, 18.8],
];
const collarL = [
  [LC - 13.5, -3],
  [LC - 0.8, 7.2],
  [LC - 6.8, 15.2],
  [LC - 14.4, 1.2],
];
const tapeL = `M${n(LC - 15.5)} -3C${n(LC - 15)} 12 ${n(LC - 9.5)} 24 ${n(LC - 11)} 52`;
const tapeR = `M${n(LC + 15.5)} -3C${n(LC + 15)} 10 ${n(LC + 11)} 26 ${n(LC + 12.5)} 45`;

// ---------------------------------------------------------------------------------------------------------------------
// Thali: a full plate on the front and a finished one on the back.

function speckle(cx, cy, rad, count, size, seed) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const [x, y] = polar(cx, cy, rad * Math.sqrt(r()), r() * TAU);
    d += ellipsePath(x, y, size * (0.6 + r() * 0.6), size * (0.6 + r() * 0.6));
  }
  return d;
}
function riceGrains(cx, cy, rx, ry, count, seed) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const [ux, uy] = polar(0, 0, Math.sqrt(r()), r() * TAU);
    const x = cx + ux * rx;
    const y = cy + uy * ry;
    const a = r() * TAU;
    d += `M${n(x)} ${n(y)}L${n(x + Math.cos(a) * 0.9)} ${n(y + Math.sin(a) * 0.9)}`;
  }
  return d;
}
/** An organic, pooled shape. */
function blob(cx, cy, rx, ry, seed, wob = 0.14, N = 10) {
  const r = rng(seed);
  const p = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const k = 1 + (r() - 0.5) * 2 * wob;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  let d = `M${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < N; i++) {
    const a = p[(i + N - 1) % N];
    const b = p[i];
    const c = p[(i + 1) % N];
    const e = p[(i + 2) % N];
    d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`;
  }
  return `${d}Z`;
}
const STEEL = (a, b, c) => ({
  type: 'radial',
  cx: 0.38,
  cy: 0.32,
  r: 0.72,
  stops: [
    [0, a],
    [0.55, b],
    [1, c],
  ],
});

/** A steel katori. inner: what's in it, or steel if it's been emptied. */
function katori(id, cx, cy, r, inner) {
  return [
    disc(`${id}rim`, cx, cy, r, { fill: STEEL('#F2F4F5', '#AEB6BB', '#6F777D'), stroke: '#596167', sw: 0.14 }),
    disc(`${id}bowl`, cx, cy, r * 0.84, { fill: inner ?? STEEL('#7E868C', '#B7BEC3', '#E5E8EA') }),
  ];
}
const swirl = (cx, cy, r, a, b, c, e) =>
  `M${n(cx + r * a)} ${n(cy + r * b)}C${n(cx - r * 0.2)} ${n(cy - r * 0.6)} ${n(cx + r * 0.3)} ${n(cy + r * 0.5)} ${n(cx + r * c)} ${n(cy + r * e)}`;

const food = {
  dal: (id, cx, cy, r) => [
    ...katori(id, cx, cy, r, '#E8A317'),
    art(`${id}a`, blob(cx - r * 0.1, cy - r * 0.12, r * 0.5, r * 0.4, 3, 0.2), { fill: '#F6C544' }),
    art(`${id}b`, speckle(cx, cy, r * 0.66, 12, 0.24, 8), { fill: '#6B2C0B' }),
    art(`${id}c`, speckle(cx, cy, r * 0.6, 5, 0.34, 15), { fill: '#3F8A2E' }),
  ],
  palak: (id, cx, cy, r) => [
    ...katori(id, cx, cy, r, '#2F6E2A'),
    art(`${id}a`, blob(cx + r * 0.1, cy, r * 0.56, r * 0.5, 6, 0.2), { fill: '#3F8A36' }),
    art(`${id}b`, swirl(cx, cy, r, -0.5, 0.1, 0.55, -0.2), { stroke: '#FBF6E6', sw: 0.5, cap: 'round' }),
    ...[
      [-0.26, -0.34],
      [0.34, 0.26],
      [-0.3, 0.38],
    ].map(([ox, oy], i) => ({
      id: `${id}cube${i}`,
      type: 'rect',
      x: cx + r * ox - 0.95,
      y: cy + r * oy - 0.95,
      w: 1.9,
      h: 1.9,
      r: 0.35,
      fill: '#FBF1D4',
      rot: 20 * i + 12,
    })),
  ],
  makhani: (id, cx, cy, r) => [
    ...katori(id, cx, cy, r, '#C4421A'),
    art(`${id}a`, blob(cx - r * 0.1, cy + r * 0.05, r * 0.52, r * 0.46, 11, 0.2), { fill: '#E0612A' }),
    art(`${id}b`, swirl(cx, cy, r, -0.42, -0.22, 0.42, 0.2), { stroke: '#FFF4E0', sw: 0.42, cap: 'round' }),
    art(`${id}c`, speckle(cx, cy, r * 0.6, 4, 0.3, 21), { fill: '#2E7D32' }),
  ],
  raita: (id, cx, cy, r) => [
    ...katori(id, cx, cy, r, '#F7F2E4'),
    art(`${id}a`, speckle(cx, cy, r * 0.68, 9, 0.26, 31), { fill: '#B0451E' }),
    art(`${id}b`, speckle(cx, cy, r * 0.62, 7, 0.3, 37), { fill: '#4E9A3D' }),
  ],
  gulab: (id, cx, cy, r) => [
    ...katori(id, cx, cy, r, '#E9B44C'),
    disc(`${id}a`, cx - r * 0.15, cy - r * 0.02, r * 0.42, { fill: '#7A3210' }),
    disc(`${id}b`, cx + r * 0.33, cy + r * 0.17, r * 0.33, { fill: '#8C3B13' }),
    disc(`${id}c`, cx - r * 0.3, cy - r * 0.2, r * 0.12, { fill: '#C1763B' }),
  ],
  empty: (id, cx, cy, r, tone) => [
    ...katori(id, cx, cy, r),
    art(`${id}s`, swirl(cx, cy + r * 0.25, r * 0.7, -0.6, 0.3, 0.7, 0.1), { stroke: tone, sw: 0.5, cap: 'round', opacity: 0.6 }),
  ],
};

/** Roti seen from above: toasted spots and a soft edge. */
function roti(id, cx, cy, r, seed) {
  return [
    art(`${id}a`, blob(cx, cy, r, r * 0.97, seed, 0.03, 14), { fill: '#D9A566' }),
    art(`${id}b`, blob(cx, cy, r * 0.88, r * 0.86, seed + 1, 0.05, 12), { fill: '#E6BC82' }),
    art(`${id}c`, speckle(cx, cy, r * 0.8, 15, 0.42, seed), { fill: '#8C5A26', opacity: 0.85 }),
  ];
}
const plate = (id, cx, cy, R) => [
  disc(`${id}base`, cx, cy, R, { fill: STEEL('$s1', '$s2', '$s3'), stroke: '$s4', sw: 0.24 }),
  disc(`${id}lip`, cx, cy, R - 1.5, { stroke: '$s4', sw: 0.14, opacity: 0.6 }),
];

// ---------------------------------------------------------------------------------------------------------------------
// Tiffin: a stacked dabba, every tier one detail.

const TX0 = 6.6;
const TW = 37.6;
const CYL = {
  type: 'linear',
  angle: 90,
  stops: [
    [0, '$c'],
    [0.16, '$a'],
    [0.36, '$b'],
    [0.72, '$a'],
    [1, '$c'],
  ],
};
/** One tier of the dabba, with a curved foot so it reads as a cylinder. */
function tier(id, y, h) {
  const box = { type: 'path', x: TX0, y, w: TW, h: h + 1.2 };
  return [
    { id, ...box, d: `M0 0H${TW}V${h}Q${TW / 2} ${h + 2.4} 0 ${h}Z`, fill: CYL },
    { id: `${id}lip`, ...box, d: `M0 ${h}Q${TW / 2} ${h + 2.4} ${TW} ${h}`, stroke: '$ring', sw: 0.5 },
    { id: `${id}top`, ...box, d: 'M0 1.2Q18.8 3 37.6 1.2', stroke: '$ring', sw: 0.14, opacity: 0.7 },
  ];
}

// ---------------------------------------------------------------------------------------------------------------------
// Ganache drip: chocolate poured over the card, and a piping bag on the back.

/** A curtain of chocolate. drips: [x, half width, length below the base line]. */
function dripCurtain(drips, base) {
  const f = 1.3;
  let d = `M${-B} ${-B}L${n(W + B)} ${-B}L${n(W + B)} ${n(base)}`;
  for (const [x, hw, len] of [...drips].sort((a, b) => b[0] - a[0])) {
    const tip = base + len;
    const bulb = Math.min(hw * 1.14, len * 0.5);
    const neck = Math.max(base + f, tip - bulb * 2);
    d +=
      `L${n(x + hw + f)} ${n(base)}C${n(x + hw + 0.3)} ${n(base)} ${n(x + hw)} ${n(base + 0.5)} ${n(x + hw)} ${n(base + f)}` +
      `L${n(x + hw * 0.92)} ${n(neck)}C${n(x + hw * 0.92)} ${n(tip - bulb)} ${n(x + bulb)} ${n(tip - bulb * 1.2)} ${n(x + bulb)} ${n(tip - bulb * 0.5)}` +
      `C${n(x + bulb)} ${n(tip + 0.1)} ${n(x - bulb)} ${n(tip + 0.1)} ${n(x - bulb)} ${n(tip - bulb * 0.5)}C${n(x - bulb)} ${n(tip - bulb * 1.2)} ${n(x - hw * 0.92)} ${n(tip - bulb)} ${n(x - hw * 0.92)} ${n(neck)}` +
      `L${n(x - hw)} ${n(base + f)}C${n(x - hw)} ${n(base + 0.5)} ${n(x - hw - 0.3)} ${n(base)} ${n(x - hw - f)} ${n(base)}`;
  }
  return `${d}L${-B} ${n(base)}Z`;
}
function dripGloss(drips, base) {
  let d = '';
  for (const [x, hw, len] of drips) {
    const tip = base + len;
    if (len > 5) d += `M${n(x - hw * 0.42)} ${n(tip - hw * 0.6)}L${n(x - hw * 0.42)} ${n(Math.max(base + 2, tip - len * 0.56))}`;
  }
  return d;
}
const DRIPS = [
  [3, 2.2, 2.5],
  [10.4, 2.6, 4.6],
  [18, 1.9, 2],
  [25, 2.7, 4],
  [33, 2, 2.2],
  [40, 2.5, 5],
  [47.4, 2, 2.6],
  [54, 2.5, 9],
  [60.8, 2.2, 15],
  [67.4, 1.9, 6],
  [74, 2.8, 23],
  [81.4, 2.1, 12],
  [88, 2.4, 19],
];
const DRIP_BASE = 17.5;
function sprinkles(seed, zones, count) {
  const r = rng(seed);
  const layers = ['', '', '', ''];
  for (let i = 0; i < count; i++) {
    const zone = zones[i % zones.length];
    const x = zone[0] + r() * zone[2];
    const y = zone[1] + r() * zone[3];
    const a = r() * TAU;
    const dx = Math.cos(a) * 0.68;
    const dy = Math.sin(a) * 0.68;
    layers[i % 4] += `M${n(x - dx)} ${n(y - dy)}L${n(x + dx)} ${n(y + dy)}`;
  }
  return layers;
}
const crumbs = sprinkles(
  17,
  [
    [53, 30, 11, 17],
    [64, 34, 8, 13],
    [78, 34, 9, 13],
  ],
  34,
);
const icingLine = 'M62.8 16.6C60.4 20 61.6 24.4 58 25.4C54.6 26.4 53.8 21.6 56.8 21.2C60 20.8 60.2 26 56 27.2C52 28.4 47.6 26.6 46.2 23.4';

// ---------------------------------------------------------------------------------------------------------------------
// Banana leaf: a sadhya laid out in order, and a hall full of leaves for the back.

function leafVeins(y0, y1, w, seed) {
  const r = rng(seed);
  let light = '';
  let dark = '';
  let x = -30;
  while (x < w + 8) {
    const y = y0 + ((x + 3) / (w + 6)) * (y1 - y0);
    const lean = 21;
    const line = `M${n(x)} ${n(y)}C${n(x + 7)} ${n(y - 16)} ${n(x + 14)} ${n(y - 34)} ${n(x + lean)} -4`;
    if (r() < 0.62) light += line;
    else dark += line;
    x += 0.9 + r() * 1.1;
  }
  return { light, dark };
}

/** A wedding hall from above: row on row of identical leaves, each with its scoop of rice. */
function leafRows(cols, rows, x0, y0, cw, ch, skip) {
  let leaves = '';
  let spine = '';
  let rice = '';
  let dabs = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cw + (r % 2 ? cw / 2 : 0);
      const y = y0 + r * ch;
      if (skip(x, y)) continue;
      const lw = cw * 0.44;
      const lh = ch * 0.36;
      leaves += leaf(x - lw, y, 2 * lw, lh * 1.25, 0);
      spine += `M${n(x - lw)} ${n(y)}L${n(x + lw)} ${n(y)}`;
      rice += ellipsePath(x + lw * 0.34, y + lh * 0.22, lw * 0.2, lh * 0.36);
      dabs += ellipsePath(x - lw * 0.3, y - lh * 0.24, 0.36, 0.36);
    }
  }
  return { leaves, spine, rice, dabs };
}

const veins = leafVeins(48.5, 43.5, W, 8);
const hallRows = leafRows(12, 8, -2, 2.4, 8.4, 6.6, (x, y) => x > 47.5 && y > 90);

/** The row of small servings along the far edge of the leaf, left to right. */
const sadhyaRow = [
  [8, 7.4, 2.6, 2.2, '#F7EFD8', '#D9C9A0'],
  [15.4, 8.2, 3, 2.6, '#A61E1E', '#6E0F0F'],
  [23.2, 7.2, 2.8, 2.5, '#6B3A14', '#3F2008'],
  [31.2, 8.4, 3.5, 2.9, '#E9B714', '#3F8A2E'],
  [40, 7.2, 3.3, 2.8, '#C2256B', '#8C1248'],
  [48.8, 8.2, 3.6, 3, '#F1E4B8', '#6FA33D'],
  [58, 7.2, 3.6, 3, '#E4842A', '#8C4A10'],
  [67.2, 8, 3.2, 2.7, '#D9B64C', '#5B8A2B'],
];

// ---------------------------------------------------------------------------------------------------------------------
// Citrus sun: a cut fruit rising like the sun, with its rays behind it.

function sunRays(cx, cy, count, reach) {
  let d = '';
  for (let i = 0; i < count; i += 2) {
    const a0 = (i / count) * TAU;
    const a1 = ((i + 1) / count) * TAU;
    d += poly([[cx, cy], polar(cx, cy, reach, a0), polar(cx, cy, reach, a1)]);
  }
  return d;
}

/** Segments of a cut citrus, each with its juice cells. from and to are the angles it covers. */
function citrus(cx, cy, R, segs, from, to, seed, cellCount = 18) {
  const r = rng(seed);
  const span = (to - from) / segs;
  let flesh = '';
  let cellsA = '';
  let cellsB = '';
  let seeds = '';
  for (let i = 0; i < segs; i++) {
    const a0 = from + i * span + span * 0.035;
    const a1 = from + (i + 1) * span - span * 0.035;
    const mid = (a0 + a1) / 2;
    const r0 = R * 0.12;
    const r1 = R * 0.86;
    const [ax, ay] = polar(cx, cy, r0, mid);
    const [bx, by] = polar(cx, cy, r1 * 0.94, a0 + span * 0.02);
    const [qx, qy] = polar(cx, cy, r1 * 1.03, mid);
    const [dx, dy] = polar(cx, cy, r1 * 0.94, a1 - span * 0.02);
    flesh += `M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}Q${n(qx)} ${n(qy)} ${n(dx)} ${n(dy)}Z`;
    for (let k = 0; k < cellCount; k++) {
      const rad = r0 + (r1 - r0) * (0.2 + r() * 0.74);
      const halfSpread = (span / 2) * 0.82 * ((rad - r0) / (r1 - r0));
      const a = mid + (r() * 2 - 1) * halfSpread;
      const len = R * (0.05 + r() * 0.08);
      const line = poly([polar(cx, cy, rad, a), polar(cx, cy, Math.min(rad + len, r1 * 0.96), a)], false);
      if (k % 2) cellsA += line;
      else cellsB += line;
    }
    if (i % 2 === 0) {
      const [sx, sy] = polar(cx, cy, R * 0.28, mid + span * 0.06);
      seeds += leaf(sx, sy, R * 0.1, R * 0.028, mid);
    }
  }
  return { flesh, cellsA, cellsB, seeds };
}

const SUN = { cx: 74, cy: 57.5, R: 35 };
const sunSlice = citrus(SUN.cx, SUN.cy, SUN.R, 12, Math.PI, TAU, 91, 22);
const wheel = citrus(71, H / 2, 33, 12, 0.2, TAU + 0.2, 33, 16);

// ---------------------------------------------------------------------------------------------------------------------

export const SET_2 = [
  // Brilliant cut: a huge stone in flat facets, cropped by the card, with its grading-report elevation behind it.
  {
    id: 'brilliant-cut',
    name: 'Brilliant Cut',
    category: 'retail',
    tags: ['jewellery', 'jeweller', 'gold', 'diamond', 'gems', 'luxury'],
    fonts: { heading: 'cormorant', body: 'marcellus' },
    palettes: [
      {
        label: 'Diamond',
        bg: '#0B0D13',
        t0: '#1A2231',
        t1: '#3B4B66',
        t2: '#7E93B0',
        t3: '#C7D6E8',
        t4: '#F7FBFF',
        text: '#F4EFE3',
        gold: '#CDAA63',
        ink: '#10141D',
      },
      {
        label: 'Ruby',
        bg: '#17040A',
        t0: '#4A0716',
        t1: '#8A0F2B',
        t2: '#C4163F',
        t3: '#EE4C6D',
        t4: '#FFC9D3',
        text: '#FBEFE6',
        gold: '#E2BE78',
        ink: '#2A0610',
      },
      {
        label: 'Emerald',
        bg: '#03140F',
        t0: '#063D2C',
        t1: '#0B6B4A',
        t2: '#14A06E',
        t3: '#4BD69D',
        t4: '#CFFBE8',
        text: '#F2F3E6',
        gold: '#D8B769',
        ink: '#04211A',
      },
      {
        label: 'Sapphire',
        bg: '#050A1F',
        t0: '#0B1C5C',
        t1: '#12308F',
        t2: '#1F4FCB',
        t3: '#4F88F2',
        t4: '#CDE0FF',
        text: '#F3F1EA',
        gold: '#DDBB6E',
        ink: '#0A1236',
      },
    ],
    sample: {
      name: 'Nirali Zaveri',
      title: 'Gemmologist and Director',
      company: 'Tara Gems & Jewels',
      tagline: 'Fine jewellery, made to order',
      phone: '+91 98765 43210',
      email: 'nirali@taragems.example',
      website: 'taragems.example',
      address: 'Zaveri Bazaar, Mumbai',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          brand: { x: 5, y: 5, w: 41, h: 20, anchor: 'top', gap: 1 },
          reach: { x: 5, y: 26, w: 41, h: 20.8, anchor: 'bottom', gap: 0.3 },
        },
        elements: [
          ...gem.layers.map((d, i) => art(`f${i}`, d, { fill: `$t${i}` })),
          art('edges', gem.edges, { stroke: '$t4', sw: 0.07, opacity: 0.4 }),
          art('spark', glint(61.6, 12.4, 3.6) + glint(69.4, 34.4, 2.4) + glint(57.6, 33.6, 1.4), { fill: '#FFFFFF' }),
          T('co', '{company}', 5, 41, 23, {
            stack: 'brand',
            minSize: 12,
            maxLines: 3,
            lineHeight: 0.98,
            weight: 600,
            font: '$heading',
            fill: '$text',
          }),
          T('tag', '{tagline}', 5, 41, 6.4, { stack: 'brand', minSize: 5.6, maxLines: 2, lineHeight: 1.2, fill: '$gold', optional: true }),
          T('name', '{name}', 5, 41, 8, { stack: 'reach', minSize: 6.4, maxLines: 2, lineHeight: 1.15, fill: '$text' }),
          T('role', '{title}', 5, 41, 5.9, { stack: 'reach', minSize: 5.5, maxLines: 2, lineHeight: 1.18, fill: '$gold' }),
          L('contact', ['phone', 'website', 'address'], 5, 41, 6.2, { stack: 'reach', gap: 0.8, icons: false, fill: '$text' }),
        ],
      },
      back: {
        background: '$t0',
        stacks: { brand: { x: 5, y: 25.5, w: 49.5, h: 21.3, anchor: 'bottom', gap: 1 } },
        elements: [
          LOGO('mark', 5, 6.4, 13, '$gold', { fallbackSize: 30, fallbackWeight: 600 }),
          art('gem', gemSide.out, { stroke: '$gold', sw: 0.3, join: 'round' }),
          art('gemlines', gemSide.inner, { stroke: '$gold', sw: 0.1, opacity: 0.85 }),
          QR('qr', 58.9, 8, 26, { quiet: 1.4 }),
          T('scan', 'Scan to save', 58.9, 26, 6, { y: 35, minSize: 5.6, align: 'center', fill: '$text' }),
          T('co', '{company}', 5, 49.5, 17, {
            stack: 'brand',
            minSize: 10,
            maxLines: 3,
            lineHeight: 1,
            weight: 600,
            font: '$heading',
            fill: '$text',
          }),
          L('contact', ['email', 'website'], 5, 49.5, 6.2, { stack: 'brand', icons: false, fill: '$gold' }),
        ],
      },
    },
  },

  // Kaju katli: a tray cut into diamonds, varak and all. One has been taken and bitten. On the back the QR waits in the gap.
  {
    id: 'kaju-katli',
    name: 'Kaju Katli',
    category: 'food',
    tags: ['mithai', 'sweet shop', 'sweets', 'halwai', 'gifting', 'festive'],
    fonts: { heading: 'rozha', body: 'dmsans' },
    palettes: [
      {
        label: 'Rani',
        box: '#B0124F',
        katli: '#F6E8CC',
        edge: '#C9A470',
        foil: '#FFFFFF',
        foil2: '#C9CED3',
        text: '#FFF4E2',
        soft: '#FFD27F',
        dark: '#3A0519',
      },
      {
        label: 'Pista',
        box: '#2E6B45',
        katli: '#F8EDD6',
        edge: '#C7A976',
        foil: '#FFFFFF',
        foil2: '#C8CFCF',
        text: '#FBF7E6',
        soft: '#F6D37A',
        dark: '#0B2A1A',
      },
      {
        label: 'Kesar',
        box: '#D9480F',
        katli: '#FBEFD8',
        edge: '#CFA56C',
        foil: '#FFFFFF',
        foil2: '#D0CFCB',
        text: '#FFF8E8',
        soft: '#FFE08A',
        dark: '#401203',
      },
      {
        label: 'Raat',
        box: '#20123A',
        katli: '#EFE0C2',
        edge: '#B8976A',
        foil: '#FFFFFF',
        foil2: '#BFC2CB',
        text: '#F8F0DC',
        soft: '#E7BE63',
        dark: '#120A24',
      },
    ],
    sample: {
      name: 'Pramod Agarwal',
      title: 'Third-generation halwai',
      company: 'Kesar Thaal',
      tagline: 'Mithai made fresh every morning',
      phone: '+91 98765 43210',
      website: 'kesarthaal.example',
      address: 'Chandni Chowk, Delhi',
    },
    sides: {
      front: {
        background: '$box',
        stacks: {
          brand: { x: 5, y: 5, w: 42, h: 19.5, anchor: 'top', gap: 1 },
          reach: { x: 5, y: 25, w: 42, h: 21.8, anchor: 'bottom', gap: 0.5 },
        },
        elements: [
          art('edge', katliFront.edge, { stroke: '$edge', sw: 0.5, join: 'round' }),
          art('pieces', katliFront.piece, { fill: '$katli' }),
          art('foil', katliFront.foil, { fill: '$foil2' }),
          art('foil2', katliFront.foil2, { fill: '$foil' }),
          art('loosee', katliLoose.edge, { stroke: '$dark', sw: 0.6, join: 'round', opacity: 0.45 }),
          art('loose', katliLoose.piece, { fill: '$katli' }),
          art('loosef', katliLoose.foil, { fill: '$foil2' }),
          art('crumbs', katliLoose.crumbs, { fill: '$katli' }),
          T('co', '{company}', 5, 42, 24, { stack: 'brand', minSize: 12, maxLines: 3, lineHeight: 1.06, font: '$heading', fill: '$text' }),
          T('tag', '{tagline}', 5, 42, 6.8, {
            stack: 'brand',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.2,
            weight: 500,
            fill: '$soft',
            optional: true,
          }),
          T('name', '{name}', 5, 42, 8, { stack: 'reach', minSize: 6.4, maxLines: 2, lineHeight: 1.15, weight: 700, fill: '$text' }),
          L('contact', ['phone', 'website', 'address'], 5, 42, 6.4, { stack: 'reach', icons: false, weight: 500, fill: '$text' }),
        ],
      },
      back: {
        background: '$dark',
        stacks: { brand: { x: 6, y: 9, w: 46, h: 32.8, anchor: 'middle', gap: 1.4 } },
        elements: [
          art('edge', katliBack.edge, { stroke: '$edge', sw: 0.5, join: 'round' }),
          art('pieces', katliBack.piece, { fill: '$katli' }),
          art('foil', katliBack.foil, { fill: '$foil2' }),
          art('foil2', katliBack.foil2, { fill: '$foil' }),
          QR('qr', 57.9, H / 2 - 13, 26, { light: '#FFFDF6', quiet: 1.4 }),
          LOGO('mark', 6, 0, 10, '$soft', { stack: 'brand', fallbackSize: 24, fallbackWeight: 400 }),
          T('co', '{company}', 6, 46, 15, { stack: 'brand', minSize: 9.5, maxLines: 3, lineHeight: 1.1, font: '$heading', fill: '$text' }),
          L('contact', ['email', 'phone'], 6, 46, 6.4, { stack: 'brand', icons: false, fill: '$text' }),
        ],
      },
    },
  },

  // Cracked screen: the problem on the front, the phone opened up on the back, with the chip as the QR.
  {
    id: 'cracked-screen',
    name: 'Cracked Screen',
    category: 'retail',
    tags: ['mobile repair', 'phone', 'electronics', 'screen', 'service centre', 'tech'],
    orientation: 'vertical',
    fonts: { heading: 'syne', body: 'spacegrotesk' },
    palettes: [
      {
        label: 'Violet',
        top: '#3A1E8C',
        low: '#0B0520',
        hot: '#C9F73A',
        pcb: '#2A1460',
        copper: '#D9A441',
        silk: '#F4F1FF',
        part: '#120A2E',
        cell: '#D9F85C',
        cellink: '#141A02',
      },
      {
        label: 'Teal',
        top: '#0C6B75',
        low: '#02161D',
        hot: '#FFC247',
        pcb: '#0E4A36',
        copper: '#E0B04B',
        silk: '#F2FFF7',
        part: '#07241B',
        cell: '#FFC247',
        cellink: '#231700',
      },
      {
        label: 'Ember',
        top: '#B3261E',
        low: '#190503',
        hot: '#FFE8A3',
        pcb: '#141414',
        copper: '#E6B34A',
        silk: '#FFF5E6',
        part: '#000000',
        cell: '#F25B2A',
        cellink: '#1A0602',
      },
      {
        label: 'Graphite',
        top: '#3C4654',
        low: '#0C0F13',
        hot: '#58D6FF',
        pcb: '#123B73',
        copper: '#EBC15C',
        silk: '#EEF6FF',
        part: '#081A36',
        cell: '#E9EEF4',
        cellink: '#0C1B33',
      },
    ],
    sample: {
      name: 'Imran Qureshi',
      title: 'Technician',
      company: 'FixPoint Mobiles',
      tagline: 'Screens, batteries, water damage',
      phone: '+91 98765 43210',
      website: 'fixpoint.example',
      address: 'Lamington Road, Mumbai',
    },
    sides: {
      front: {
        background: '#050505',
        stacks: {
          who: { x: 5.5, y: 47.5, w: 39.8, h: 21, anchor: 'bottom', gap: 0.8 },
          reach: { x: 5.5, y: 69, w: 39.8, h: 14.6, anchor: 'bottom' },
        },
        elements: [
          {
            id: 'glass',
            type: 'rect',
            x: 1.5,
            y: 1.5,
            w: H - 3,
            h: W - 3,
            r: 4.6,
            fill: {
              type: 'radial',
              cx: 0.65,
              cy: 0.22,
              r: 0.95,
              stops: [
                [0, '$top'],
                [1, '$low'],
              ],
            },
          },
          vart('shards', crackV.shards, { fill: '#FFFFFF', opacity: 0.1 }),
          vart('web', crackV.fine, { stroke: '#FFFFFF', sw: 0.1, opacity: 0.72 }),
          vart('cracks', crackV.heavy, { stroke: '#FFFFFF', sw: 0.2, opacity: 0.95, join: 'round' }),
          disc('hole', H / 2, 4.3, 1.1, { fill: '#000000' }),
          R('bar', H / 2 - 7, 84.8, 14, 0.8, '#FFFFFF', { r: 0.4, opacity: 0.85 }),
          T('co', '{company}', 5.5, 39.8, 17, {
            stack: 'who',
            minSize: 9,
            maxLines: 3,
            lineHeight: 1.04,
            weight: 800,
            font: '$heading',
            fill: '#FFFFFF',
          }),
          T('tag', '{tagline}', 5.5, 39.8, 6.4, {
            stack: 'who',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.18,
            weight: 600,
            fill: '$hot',
            optional: true,
          }),
          L('contact', ['name', 'phone', 'address'], 5.5, 39.8, 6.4, { stack: 'reach', icons: false, weight: 500, fill: '#FFFFFF' }),
        ],
      },
      back: {
        background: '$pcb',
        stacks: {
          head: { x: 5, y: 3.8, w: 40.8, h: 6.6, anchor: 'middle' },
          cell: { x: 7.4, y: 62.4, w: 36, h: 13.4, anchor: 'middle', gap: 0.3 },
        },
        elements: [
          vart('tr', phoneTraces.d, { stroke: '$copper', sw: 0.3, join: 'round', cap: 'round' }),
          vart('vias', phoneTraces.vias, { fill: '$copper' }),
          vart(
            'smd',
            smdParts([
              [4.6, 54.6, 1.4, 0.8],
              [6.6, 54.6, 1.4, 0.8],
              [44.6, 54.6, 1.4, 0.8],
              [42.6, 54.6, 1.4, 0.8],
              [36, 79, 1.8, 0.9],
              [13, 79, 1.8, 0.9],
            ]),
            { fill: '$silk', opacity: 0.8 },
          ),
          T('co', '{company}', 5, 40.8, 8.4, {
            stack: 'head',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.08,
            weight: 800,
            font: '$heading',
            fill: '$silk',
          }),
          R('camera', 5, 11.2, 13, 7.4, '$part', { r: 1.4 }),
          disc('lens1', 8.6, 14.9, 2.6, { fill: '#000000', stroke: '$copper', sw: 0.3 }),
          disc('lens2', 14, 14.9, 1.6, { fill: '#000000', stroke: '$copper', sw: 0.3 }),
          R('flex', 20, 12.2, 14, 5.4, '$part', { r: 0.5 }),
          vart('fingers', Array.from({ length: 8 }, (_, i) => rectPath(21 + i * 1.55, 13, 0.8, 3.8)).join(''), { fill: '$copper' }),
          R('logochip', 36, 10.6, 9.8, 8.6, '$part', { r: 0.8 }),
          LOGO('mark', 36.6, 11.4, 8.6, '$silk', { h: 7, fallbackSize: 20, fallbackWeight: 800 }),
          R('die', 9.9, 28.1, 31, 31, '$part', { r: 0.6 }),
          vart('pins', chipPins(9.9, 28.1, 31, 14, 1.6, 0.56), { fill: '$copper' }),
          QR('qr', 12.4, 30.6, 26, { quiet: 1.4 }),
          R('cell', 5, 61.6, 40.8, 15, '$cell', { r: 1.2 }),
          T('phone', '{phone}', 7.4, 36, 12.5, {
            stack: 'cell',
            minSize: 8,
            noWrap: true,
            weight: 800,
            font: '$heading',
            fill: '$cellink',
          }),
          T('web', '{website}', 7.4, 36, 6.2, { stack: 'cell', minSize: 5.5, noWrap: true, weight: 600, fill: '$cellink', optional: true }),
          R('port', 18.4, 80.6, 14, 3.6, '$part', { r: 1.8, stroke: '$copper', sw: 0.3 }),
        ],
      },
    },
  },

  // Genda toran: strings of marigolds falling down a doorway, short over the words and full height at the side.
  {
    id: 'genda-toran',
    name: 'Genda Toran',
    category: 'retail',
    tags: ['flowers', 'florist', 'phoolwala', 'wedding decor', 'garlands', 'festive'],
    fonts: { heading: 'baloo2', body: 'outfit' },
    palettes: [
      {
        label: 'Rani',
        bg: '#A30F55',
        a1: '#D9540B',
        a2: '#F47A0E',
        a3: '#FF9A1F',
        a4: '#C4420A',
        b1: '#E8A400',
        b2: '#FBC11A',
        b3: '#FFD84D',
        b4: '#D08A00',
        leaf: '#1E6B3A',
        thread: '#FFE7B0',
        text: '#FFF6E2',
        soft: '#FFD27F',
      },
      {
        label: 'Neel',
        bg: '#14205A',
        a1: '#D9540B',
        a2: '#F47A0E',
        a3: '#FF9A1F',
        a4: '#C4420A',
        b1: '#D8D2BE',
        b2: '#F0ECDD',
        b3: '#FFFFFA',
        b4: '#C2A23A',
        leaf: '#2C8A4E',
        thread: '#E7E2C8',
        text: '#FBF7E6',
        soft: '#FFC15C',
      },
      {
        label: 'Patta',
        bg: '#0F4A33',
        a1: '#C81D4B',
        a2: '#E5356A',
        a3: '#F86A92',
        a4: '#A9123A',
        b1: '#E8A400',
        b2: '#FBC11A',
        b3: '#FFD84D',
        b4: '#D08A00',
        leaf: '#5FAE4F',
        thread: '#F7EDC8',
        text: '#FBF7E6',
        soft: '#FFD27F',
      },
      {
        label: 'Chandan',
        bg: '#FBF0DC',
        a1: '#D9540B',
        a2: '#F47A0E',
        a3: '#FF9A1F',
        a4: '#C4420A',
        b1: '#C81D4B',
        b2: '#E5356A',
        b3: '#F86A92',
        b4: '#A9123A',
        leaf: '#1E6B3A',
        thread: '#8A5A2B',
        text: '#4A1608',
        soft: '#B5340B',
      },
    ],
    sample: {
      name: 'Lata Bhosale',
      title: 'Owner',
      company: 'Sugandh Flowers',
      tagline: 'Toran, garlands and wedding decor',
      phone: '+91 98765 43210',
      website: 'sugandhflowers.example',
      address: 'Dadar Phool Market, Mumbai',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          brand: { x: 5, y: 16.5, w: 45, h: 13.6, anchor: 'top', gap: 0.5 },
          reach: { x: 5, y: 30.4, w: 56, h: 16.4, anchor: 'bottom', gap: 0.4 },
        },
        elements: [
          art('thread', toran.thread, { stroke: '$thread', sw: 0.16 }),
          art('tips', toran.tips, { fill: '$leaf' }),
          ...['a', 'b'].flatMap((c) => [1, 2, 3, 4].map((k) => art(`${c}${k}`, toranBlooms[`${c}${k}`], { fill: `$${c}${k}` }))),
          art('leaves', toran.leaves, { fill: '$leaf' }),
          T('co', '{company}', 5, 45, 18, {
            stack: 'brand',
            minSize: 11,
            maxLines: 2,
            lineHeight: 1,
            weight: 800,
            font: '$heading',
            fill: '$text',
          }),
          T('tag', '{tagline}', 5, 45, 6.4, { stack: 'brand', minSize: 5.8, maxLines: 1, weight: 500, fill: '$soft', optional: true }),
          T('name', '{name}', 5, 56, 7.6, { stack: 'reach', minSize: 6.4, maxLines: 1, weight: 700, fill: '$text' }),
          L('contact', ['phone', 'website', 'address'], 5, 56, 6.4, { stack: 'reach', icons: false, weight: 500, fill: '$text' }),
        ],
      },
      back: {
        background: '$bg',
        stacks: { brand: { x: 12, y: 10.5, w: 38, h: 29.8, anchor: 'middle', gap: 1.2 } },
        elements: [
          ...['a', 'b'].flatMap((c) => [1, 2, 3, 4].map((k) => art(`${c}${k}`, wallBlooms[`${c}${k}`], { fill: `$${c}${k}` }))),
          R('window', 6.4, 6.4, W - 12.8, H - 12.8, '$bg', { r: 10 }),
          R('windowline', 7.6, 7.6, W - 15.2, H - 15.2, undefined, { r: 8.9, stroke: '$soft', sw: 0.2 }),
          QR('qr', 53, H / 2 - 13, 26, { r: 1, quiet: 1.4 }),
          LOGO('mark', 12, 0, 10, '$soft', { stack: 'brand', fallbackSize: 24, fallbackWeight: 800 }),
          T('co', '{company}', 12, 38, 15, {
            stack: 'brand',
            minSize: 9.5,
            maxLines: 4,
            lineHeight: 1,
            weight: 800,
            font: '$heading',
            fill: '$text',
          }),
          T('phone', '{phone}', 12, 38, 7.6, { stack: 'brand', minSize: 6, noWrap: true, weight: 600, fill: '$soft' }),
        ],
      },
    },
  },

  // Lapel: the card wears the suit, with the tailor's tape round its neck. Turn it over and you're looking at the lining.
  {
    id: 'lapel',
    name: 'Lapel',
    category: 'retail',
    tags: ['tailor', 'menswear', 'suits', 'sherwani', 'bespoke', 'alterations'],
    orientation: 'vertical',
    fonts: { heading: 'playfair', body: 'lora' },
    palettes: [
      {
        label: 'Navy',
        suit: '#14233F',
        lapel: '#1B2E50',
        stripe: '#AEBBD2',
        shirt: '#FDFCF8',
        shade: '#D5D8DF',
        tie: '#A32030',
        tie2: '#D9B15C',
        tape: '#F5C518',
        tick: '#1A1608',
        text: '#F6F2E7',
        lining: '#7A1C2E',
        twill: '#A23549',
        tag: '#F7F1E0',
        ink: '#22151A',
        gold: '#D9B15C',
      },
      {
        label: 'Charcoal',
        suit: '#2A2B2F',
        lapel: '#35363B',
        stripe: '#C8C9CC',
        shirt: '#FBF8F4',
        shade: '#D8D4CE',
        tie: '#20496B',
        tie2: '#E7E2D5',
        tape: '#F5C518',
        tick: '#1A1608',
        text: '#F7F4EC',
        lining: '#20496B',
        twill: '#3A6C94',
        tag: '#F7F3E8',
        ink: '#101C26',
        gold: '#C7CDD2',
      },
      {
        label: 'Bottle',
        suit: '#123D31',
        lapel: '#185040',
        stripe: '#A9CFBF',
        shirt: '#FCFBF4',
        shade: '#D6D8CC',
        tie: '#C2882B',
        tie2: '#123D31',
        tape: '#F2EBD8',
        tick: '#123D31',
        text: '#F5F2E2',
        lining: '#B8892E',
        twill: '#D7A94A',
        tag: '#FAF4E2',
        ink: '#14281F',
        gold: '#E2C074',
      },
      {
        label: 'Wine',
        suit: '#4A1020',
        lapel: '#5C182B',
        stripe: '#D9A9B4',
        shirt: '#FDF9F2',
        shade: '#E0D5CC',
        tie: '#1E1B1C',
        tie2: '#D9B15C',
        tape: '#F5C518',
        tick: '#1A1608',
        text: '#FBF1E4',
        lining: '#1E2A44',
        twill: '#33456B',
        tag: '#FBF3E2',
        ink: '#1E1320',
        gold: '#D9B15C',
      },
    ],
    sample: {
      name: 'Faiz Ansari',
      title: 'Master Tailor',
      company: 'Ansari & Sons Tailors',
      tagline: 'Suits, sherwanis, alterations',
      phone: '+91 98765 43210',
      email: 'faiz@ansaritailors.example',
      website: 'ansaritailors.example',
      address: 'Linking Road, Bandra West',
    },
    sides: {
      front: {
        background: '$suit',
        stacks: {
          brand: { x: 5, y: 55, w: 40.8, h: 17, anchor: 'top', gap: 0.7 },
          who: { x: 5, y: 72.4, w: 40.8, h: 12.4, anchor: 'bottom', gap: 0.2 },
        },
        elements: [
          vart('stripes', chalkStripes(H, W, 2.54), { stroke: '$stripe', sw: 0.1, dash: [0.5, 0.34], opacity: 0.32 }),
          vart(
            'shirt',
            poly([
              [LC - 15, -3],
              [LC + 15, -3],
              [LC, 47],
            ]),
            { fill: '$shirt' },
          ),
          vart(
            'blade',
            poly([
              [LC - 2, 11],
              [LC + 2, 11],
              [LC + 3.6, 34],
              [LC, 39],
              [LC - 3.6, 34],
            ]),
            { fill: '$tie' },
          ),
          vart('tiestripes', 'M21.6 16.4L28.4 21.4M22 22.4L28.8 27.4M22 28.4L29 33.6M22.8 11.6L27 14.8', { stroke: '$tie2', sw: 0.42 }),
          vart(
            'knot',
            poly([
              [LC - 3.1, 5.8],
              [LC + 3.1, 5.8],
              [LC + 2, 11.6],
              [LC - 2, 11.6],
            ]),
            { fill: '$tie' },
          ),
          vart('collarl', poly(collarL), { fill: '$shirt', stroke: '$shade', sw: 0.3, join: 'round' }),
          vart('collarr', poly(mirror(collarL)), { fill: '$shirt', stroke: '$shade', sw: 0.3, join: 'round' }),
          vart('lapell', poly(lapelL), { fill: '$lapel' }),
          vart('lapelr', poly(mirror(lapelL)), { fill: '$lapel' }),
          vart('edgel', poly([lapelL[1], lapelL[2], lapelL[3], lapelL[4], lapelL[5]], false), {
            stroke: '$stripe',
            sw: 0.14,
            opacity: 0.7,
          }),
          vart('edger', poly(mirror([lapelL[1], lapelL[2], lapelL[3], lapelL[4], lapelL[5]]), false), {
            stroke: '$stripe',
            sw: 0.14,
            opacity: 0.7,
          }),
          vart('picks', poly(lapelSeamL, false) + poly(mirror(lapelSeamL), false), {
            stroke: '$text',
            sw: 0.14,
            dash: [0.3, 0.8],
            cap: 'round',
            opacity: 0.8,
          }),
          vart('hole', 'M41.2 21.2L44 20.6', { stroke: '$text', sw: 0.36, cap: 'round' }),
          vart('front', `M${LC} 47L${LC + 1} 53`, { stroke: '#000000', sw: 0.3, opacity: 0.5 }),
          disc('button', LC + 0.5, 49.8, 1.5, { fill: '$lapel', stroke: '$text', sw: 0.16 }),
          vart('tapelayer', tapeL + tapeR, { stroke: '$tape', sw: 3.5 }),
          vart('ticks', tapeL + tapeR, { stroke: '$tick', sw: 3.5, dash: [0.14, 0.86] }),
          vart('tapecentre', tapeL + tapeR, { stroke: '$tape', sw: 2 }),
          vart('tapemajor', tapeL + tapeR, { stroke: '$tick', sw: 3.5, dash: [0.22, 4.78] }),
          vart('tips', rectPath(LC - 12.75, 52, 3.5, 1.5) + rectPath(LC + 10.75, 45, 3.5, 1.5), { fill: '$text' }),
          T('co', '{company}', 5, 40.8, 16.5, {
            stack: 'brand',
            minSize: 10,
            maxLines: 3,
            lineHeight: 1.06,
            weight: 700,
            align: 'center',
            font: '$heading',
            fill: '$text',
          }),
          T('tag', '{tagline}', 5, 40.8, 6.6, {
            stack: 'brand',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.18,
            align: 'center',
            fill: '$text',
            opacity: 0.86,
            optional: true,
          }),
          T('name', '{name}', 5, 40.8, 7.6, { stack: 'who', minSize: 6, maxLines: 1, weight: 700, align: 'center', fill: '$text' }),
          T('role', '{title}', 5, 40.8, 6, {
            stack: 'who',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.16,
            align: 'center',
            fill: '$text',
            opacity: 0.86,
          }),
        ],
      },
      back: {
        background: '$lining',
        stacks: { label: { x: 5, y: 6.4, w: 40.8, h: 33.2, anchor: 'middle', gap: 1 } },
        elements: [
          vart('twill', twill(H, W, 1.1), { stroke: '$twill', sw: 0.14, opacity: 0.8 }),
          vart('seam', `M${LC} -3V92`, { stroke: '#000000', sw: 0.5, opacity: 0.3 }),
          R('label', 3.2, 4.6, H - 6.4, 36.8, '$tag', { r: 0.6 }),
          R('stitch', 4, 5.4, H - 8, 35.2, undefined, { r: 0.3, stroke: '$lining', sw: 0.2, dash: [0.7, 0.55] }),
          vart('cord', `M${LC} 41.4V46`, { stroke: '$gold', sw: 0.28 }),
          {
            id: 'swing',
            type: 'path',
            x: 0,
            y: 0,
            w: H,
            h: W,
            d: poly([
              [9.4, 47.4],
              [12.4, 44.6],
              [38.4, 44.6],
              [41.4, 47.4],
              [41.4, 84.4],
              [9.4, 84.4],
            ]),
            fill: '$tag',
          },
          disc('eye', LC, 46.8, 0.8, { fill: '$lining', stroke: '$gold', sw: 0.28 }),
          QR('qr', LC - 13, 49.4, 26, { quiet: 1.2 }),
          T('scan', 'Scan to save', 9.4, 32, 6.2, { y: 77, minSize: 5.6, align: 'center', fill: '$ink' }),
          LOGO('mark', LC - 5, 0, 8, '$ink', { stack: 'label', w: 10, fallbackSize: 20, fallbackWeight: 700 }),
          T('co', '{company}', 5, 40.8, 11.5, {
            stack: 'label',
            minSize: 7.5,
            maxLines: 3,
            lineHeight: 1.06,
            weight: 700,
            align: 'center',
            font: '$heading',
            fill: '$ink',
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 5, 40.8, 6, {
            stack: 'label',
            icons: false,
            font: 'fraunces',
            align: 'center',
            fill: '$ink',
          }),
        ],
      },
    },
  },

  // Thali: everything on the plate on the front. The same plate, wiped clean, on the back.
  {
    id: 'thali',
    name: 'Thali',
    category: 'food',
    tags: ['restaurant', 'thali', 'dining', 'vegetarian', 'bhojanalay', 'lunch'],
    fonts: { heading: 'yatra', body: 'montserrat' },
    palettes: [
      {
        label: 'Terracotta',
        table: '#B4441F',
        s1: '#FAFBFB',
        s2: '#D2D7DA',
        s3: '#9AA2A8',
        s4: '#5F676D',
        text: '#FFF6E6',
        soft: '#FFD58A',
        qr: '#1B0D07',
      },
      {
        label: 'Indigo',
        table: '#1C2F6B',
        s1: '#FAFBFB',
        s2: '#D2D7DA',
        s3: '#9AA2A8',
        s4: '#5F676D',
        text: '#F7F4E8',
        soft: '#F6C453',
        qr: '#0C1533',
      },
      {
        label: 'Kansa',
        table: '#1F1A17',
        s1: '#FFF3C4',
        s2: '#E6BE63',
        s3: '#B18430',
        s4: '#7A5417',
        text: '#F7EDD6',
        soft: '#E6BE63',
        qr: '#1F1A17',
      },
      {
        label: 'Pudina',
        table: '#DDEBD3',
        s1: '#FAFBFB',
        s2: '#D2D7DA',
        s3: '#9AA2A8',
        s4: '#5F676D',
        text: '#19351F',
        soft: '#A5381C',
        qr: '#19351F',
      },
    ],
    sample: {
      name: 'Mahesh Rathod',
      title: 'Owner',
      company: 'Aangan Thali House',
      tagline: 'Unlimited Gujarati thali',
      phone: '+91 98765 43210',
      website: 'aanganthali.example',
      address: 'CG Road, Ahmedabad',
      hours: 'Noon to 3 pm, 7 to 11 pm',
    },
    sides: {
      front: {
        background: '$table',
        stacks: {
          brand: { x: 5, y: 5, w: 37.5, h: 22, anchor: 'top', gap: 0.9 },
          reach: { x: 5, y: 27.5, w: 37.5, h: 19.3, anchor: 'bottom', gap: 0.4 },
        },
        elements: [
          ...plate('p', 80, 25.4, 37),
          ...food.dal('k1', 57.4, 13.2, 8.8),
          ...food.palak('k2', 57, 37.8, 8.8),
          ...food.makhani('k3', 74.4, 1.8, 8.6),
          ...food.raita('k4', 73.4, 49, 8.6),
          ...food.gulab('k5', 93.4, 5.6, 8.6),
          ...roti('r1', 91, 30, 10.6, 3),
          ...roti('r2', 86.4, 26, 10.6, 8),
          art('rice', blob(71.6, 26, 7.6, 7.2, 4, 0.1), { fill: '#FCFAF2' }),
          art('grains', riceGrains(71.6, 26, 6.2, 5.8, 42, 7), { stroke: '#D9D2BE', sw: 0.2, cap: 'round' }),
          art('chili', 'M71 15.2C73 14.4 77 15.4 79.4 18.2', { stroke: '#2C8A3A', sw: 0.8, cap: 'round' }),
          art('lemon', 'M63.2 26C63 22.4 66 20 67 20.4C66.6 23 65.8 25.4 63.2 26Z', { fill: '#F3D22E', stroke: '#C9A414', sw: 0.14 }),
          T('co', '{company}', 5, 37.5, 17, {
            stack: 'brand',
            minSize: 10.5,
            maxLines: 4,
            lineHeight: 1.06,
            font: '$heading',
            fill: '$text',
          }),
          T('tag', '{tagline}', 5, 37.5, 6, {
            stack: 'brand',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.2,
            weight: 600,
            fill: '$soft',
            optional: true,
          }),
          T('name', '{name}', 5, 37.5, 7, { stack: 'reach', minSize: 6, maxLines: 1, weight: 700, fill: '$text' }),
          L('contact', ['phone', 'address'], 5, 37.5, 6, { stack: 'reach', icons: false, weight: 500, fill: '$text' }),
        ],
      },
      back: {
        background: '$table',
        stacks: { brand: { x: 50.5, y: 6, w: 34.4, h: 38.8, anchor: 'middle', gap: 1.2 } },
        elements: [
          ...plate('p', 18, 25.4, 31),
          ...food.empty('k1', 38, 14.4, 7, '#D08A1C'),
          ...food.empty('k2', 38, 36.6, 7, '#2F6E2A'),
          ...food.empty('k3', 24, 1.6, 6.8, '#C4421A'),
          ...food.empty('k4', 24, 49.2, 6.8, '#CDBF9E'),
          art('leftover', leaf(33.4, 24, 5.6, 1.1, 0.4), { fill: '#2C8A3A' }),
          QR('qr', 5, H / 2 - 13, 26, { r: 0.6, quiet: 1.4 }),
          LOGO('mark', 50.5, 0, 10, '$soft', { stack: 'brand', fallbackSize: 24, fallbackWeight: 400 }),
          T('co', '{company}', 50.5, 34.4, 13, {
            stack: 'brand',
            minSize: 9.5,
            maxLines: 4,
            lineHeight: 1.06,
            font: '$heading',
            fill: '$text',
          }),
          T('hours', '{hours}', 50.5, 34.4, 6.4, {
            stack: 'brand',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.2,
            weight: 600,
            fill: '$soft',
            optional: true,
          }),
          T('web', '{website}', 50.5, 34.4, 6.2, {
            stack: 'brand',
            gap: 0.5,
            minSize: 5.5,
            noWrap: true,
            weight: 500,
            fill: '$text',
            optional: true,
          }),
        ],
      },
    },
  },

  // Tiffin stack: a dabba, one tier for each thing you need to know. A kitchen with no dining room, only a door you order from.
  {
    id: 'tiffin-stack',
    name: 'Tiffin Stack',
    category: 'food',
    tags: ['cloud kitchen', 'tiffin', 'dabba', 'home food', 'delivery', 'meal plan'],
    orientation: 'vertical',
    fonts: { heading: 'bebas', body: 'manrope' },
    palettes: [
      {
        label: 'Steel',
        bg: '#D6341F',
        a: '#C9CFD3',
        b: '#F7F9FA',
        c: '#7F878D',
        ring: '#535B61',
        ink: '#15181A',
        grip: '#15181A',
        text: '#FFF6E6',
      },
      {
        label: 'Enamel',
        bg: '#F2B632',
        a: '#A5DAC7',
        b: '#DDF4EB',
        c: '#5FA98F',
        ring: '#1F5C4A',
        ink: '#0F3026',
        grip: '#B83A22',
        text: '#2A1606',
      },
      {
        label: 'Cobalt',
        bg: '#12355B',
        a: '#F2E6CE',
        b: '#FFFCF2',
        c: '#C4AF88',
        ring: '#B1372A',
        ink: '#12233B',
        grip: '#B1372A',
        text: '#FFF6E6',
      },
      {
        label: 'Brass',
        bg: '#191A1C',
        a: '#CF9A37',
        b: '#F6DA8B',
        c: '#7A4F14',
        ring: '#4F310B',
        ink: '#1E1204',
        grip: '#6B1E12',
        text: '#F6DA8B',
      },
    ],
    sample: {
      name: 'Radhika Menon',
      title: 'Home chef',
      company: 'Ghar Ka Dabba',
      tagline: 'No tables. Only deliveries.',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      website: 'gharkadabba.example',
      address: 'Kothrud, Pune',
      hours: 'Lunch and dinner, all week',
    },
    sides: {
      front: {
        background: '$bg',
        stacks: {
          one: { x: 9.4, y: 22, w: 32, h: 17.6, anchor: 'middle', gap: 0.5 },
          two: { x: 9.4, y: 43, w: 32, h: 16.6, anchor: 'middle', gap: 0.3 },
          three: { x: 9.4, y: 63.4, w: 32, h: 15.6, anchor: 'middle' },
        },
        elements: [
          vart('handle', 'M14.6 15V9.6Q14.6 5.2 19 5.2H31.8Q36.2 5.2 36.2 9.6V15', { stroke: '$c', sw: 1.5, cap: 'round' }),
          R('grip', 18.8, 3.6, 13.2, 3.2, '$grip', { r: 1.6 }),
          R('rodl', 4.6, 11.6, 1.5, 70.4, '$c', { r: 0.7 }),
          R('rodr', 44.7, 11.6, 1.5, 70.4, '$c', { r: 0.7 }),
          R('base', 8.4, 80.8, 34, 3, '$c', { r: 0.8 }),
          ...tier('t3', 61.2, 19.4),
          ...tier('t2', 41.2, 19.6),
          ...tier('t1', 19.6, 21.2),
          { id: 'lid', type: 'path', x: TX0, y: 12.6, w: TW, h: 7, d: `M0 7Q0 0 6.5 0H${TW - 6.5}Q${TW} 0 ${TW} 7Z`, fill: CYL },
          { id: 'lidlip', type: 'path', x: TX0, y: 12.6, w: TW, h: 7, d: `M0 7H${TW}`, stroke: '$ring', sw: 0.5 },
          R('latchl', 3.8, 12.6, 5, 2.2, '$ring', { r: 0.6 }),
          R('latchr', 42, 12.6, 5, 2.2, '$ring', { r: 0.6 }),
          T('co', '{company}', 9.4, 32, 22, {
            stack: 'one',
            weight: 700,
            minSize: 11,
            maxLines: 3,
            lineHeight: 0.98,
            align: 'center',
            font: '$heading',
            fill: '$ink',
          }),
          T('tag', '{tagline}', 9.4, 32, 6.2, {
            stack: 'one',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.16,
            weight: 600,
            align: 'center',
            fill: '$ink',
            optional: true,
          }),
          T('name', '{name}', 9.4, 32, 17, {
            stack: 'two',
            weight: 700,
            minSize: 10,
            maxLines: 2,
            lineHeight: 1,
            align: 'center',
            font: '$heading',
            fill: '$ink',
          }),
          T('role', '{title}', 9.4, 32, 6.2, {
            stack: 'two',
            minSize: 5.5,
            maxLines: 3,
            lineHeight: 1.16,
            weight: 600,
            align: 'center',
            fill: '$ink',
          }),
          L('contact', ['phone', 'website'], 9.4, 32, 6.6, { stack: 'three', icons: false, weight: 700, align: 'center', fill: '$ink' }),
        ],
      },
      back: {
        background: '$bg',
        stacks: { foot: { x: 5, y: 55.5, w: 40.8, h: 29.4, anchor: 'middle', gap: 1 } },
        elements: [
          R('clampl', 0.6, 27.6, 6, 6.4, '$c', { r: 0.8 }),
          R('clampr', 44.2, 27.6, 6, 6.4, '$c', { r: 0.8 }),
          disc('lidtop', H / 2, 30.8, 21.8, {
            fill: {
              type: 'radial',
              cx: 0.4,
              cy: 0.34,
              r: 0.74,
              stops: [
                [0, '$b'],
                [0.6, '$a'],
                [1, '$c'],
              ],
            },
            stroke: '$ring',
            sw: 0.5,
          }),
          disc('ring1', H / 2, 30.8, 20.2, { stroke: '$ring', sw: 0.14 }),
          QR('qr', H / 2 - 13, 17.8, 26, { r: 0.8, quiet: 1.4 }),
          LOGO('mark', H / 2 - 5, 0, 8, '$text', { stack: 'foot', w: 10, fallbackSize: 20, fallbackWeight: 400 }),
          T('co', '{company}', 5, 40.8, 15, {
            stack: 'foot',
            weight: 700,
            minSize: 10,
            maxLines: 3,
            lineHeight: 1,
            align: 'center',
            font: '$heading',
            fill: '$text',
          }),
          T('hours', '{hours}', 5, 40.8, 6.4, {
            stack: 'foot',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.18,
            weight: 600,
            align: 'center',
            fill: '$text',
            optional: true,
          }),
          T('addr', '{address}', 5, 40.8, 6, {
            stack: 'foot',
            minSize: 5.5,
            maxLines: 3,
            lineHeight: 1.18,
            align: 'center',
            fill: '$text',
            optional: true,
          }),
        ],
      },
    },
  },

  // Ganache drip: the card has been iced. On the back, the bag is still in the baker's hand, writing.
  {
    id: 'ganache-drip',
    name: 'Ganache Drip',
    category: 'food',
    tags: ['bakery', 'cakes', 'home baker', 'patisserie', 'cupcakes', 'desserts'],
    fonts: { heading: 'caveat', body: 'fraunces' },
    palettes: [
      {
        label: 'Chocolate',
        cake: '#FBE3DC',
        choc: '#3B1D10',
        deep: '#1F0E07',
        gloss: '#8A5A3C',
        cream: '#FFF3E4',
        ink: '#3B1D10',
        icing: '#F59FB4',
        icing2: '#D96C8A',
        s1: '#F2B632',
        s2: '#E5476B',
        s3: '#2FA7A0',
        s4: '#FFFFFF',
        bag: '#FFF8EE',
        tip: '#BFC5CA',
      },
      {
        label: 'Strawberry',
        cake: '#FFF6E8',
        choc: '#D93B6A',
        deep: '#A61D4A',
        gloss: '#F58DAA',
        cream: '#FFF8EE',
        ink: '#7A1238',
        icing: '#FFFFFF',
        icing2: '#F3C6D3',
        s1: '#F2B632',
        s2: '#3B1D10',
        s3: '#2FA7A0',
        s4: '#7A1238',
        bag: '#FFF8EE',
        tip: '#BFC5CA',
      },
      {
        label: 'Caramel',
        cake: '#FFF1D9',
        choc: '#B86A1B',
        deep: '#8A4A0D',
        gloss: '#E6A455',
        cream: '#FFF9EC',
        ink: '#5A2F08',
        icing: '#FFF4DC',
        icing2: '#E7C48E',
        s1: '#3B1D10',
        s2: '#D93B6A',
        s3: '#FFFFFF',
        s4: '#2C7A70',
        bag: '#FFF8EE',
        tip: '#BFC5CA',
      },
      {
        label: 'Blueberry',
        cake: '#EFEBFA',
        choc: '#3A2A7D',
        deep: '#241858',
        gloss: '#7C6BC7',
        cream: '#F7F3FF',
        ink: '#2A1D63',
        icing: '#B9E4DD',
        icing2: '#7DBFB5',
        s1: '#F2B632',
        s2: '#EE6C8E',
        s3: '#FFFFFF',
        s4: '#7DBFB5',
        bag: '#FBF9FF',
        tip: '#BFC5CA',
      },
    ],
    sample: {
      name: 'Zoya Merchant',
      title: 'Baker and Founder',
      company: 'Butter & Crumb',
      tagline: 'Custom cakes, baked to order',
      phone: '+91 98765 43210',
      email: 'zoya@buttercrumb.example',
      website: 'buttercrumb.example',
      address: 'Koregaon Park, Pune',
    },
    sides: {
      front: {
        background: '$cake',
        stacks: {
          sign: { x: 5, y: 3.8, w: W - 10, h: 13, anchor: 'middle' },
          reach: { x: 5, y: 24, w: 45, h: 22.8, anchor: 'bottom', gap: 0.5 },
        },
        elements: [
          art('shadow', dripCurtain(DRIPS, DRIP_BASE + 0.7), { fill: '$deep' }),
          art('curtain', dripCurtain(DRIPS, DRIP_BASE), { fill: '$choc' }),
          art('gloss', dripGloss(DRIPS, DRIP_BASE), { stroke: '$gloss', sw: 0.5, cap: 'round' }),
          ...crumbs.map((d, i) => art(`sp${i}`, d, { stroke: `$s${i + 1}`, sw: 0.5, cap: 'round' })),
          T('co', '{company}', 5, W - 10, 36, {
            stack: 'sign',
            minSize: 16,
            maxLines: 2,
            lineHeight: 0.84,
            weight: 700,
            font: '$heading',
            fill: '$cream',
          }),
          T('tag', '{tagline}', 5, 45, 7, {
            stack: 'reach',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.16,
            weight: 500,
            fill: '$ink',
            optional: true,
          }),
          T('name', '{name}', 5, 45, 7.6, { stack: 'reach', gap: 1, minSize: 6.2, maxLines: 1, weight: 700, fill: '$ink' }),
          L('contact', ['phone', 'email', 'website', 'address'], 5, 45, 6.2, { stack: 'reach', icons: false, fill: '$ink' }),
        ],
      },
      back: {
        background: '$choc',
        stacks: { brand: { x: 46.5, y: 29, w: 38.4, h: 17.8, anchor: 'bottom', gap: 0.6 } },
        elements: [
          disc('cookie', 23.8, H / 2, 19.5, { fill: '$cream' }),
          disc('cookiering', 23.8, H / 2, 18.4, { stroke: '$icing2', sw: 0.5, dash: [0.1, 1.1], cap: 'round' }),
          QR('qr', 10.8, H / 2 - 13, 26, { r: 0.5, quiet: 1.2 }),
          art('line0', icingLine, { stroke: '$icing2', sw: 2, cap: 'round', join: 'round' }),
          art('line1', icingLine, { stroke: '$icing', sw: 1.5, cap: 'round', join: 'round' }),
          art('line2', icingLine, { stroke: '$icing2', sw: 2, dash: [0.18, 0.62] }),
          art('line3', icingLine, { stroke: '#FFFFFF', sw: 0.3, cap: 'round', opacity: 0.8 }),
          art(
            'bag',
            poly([
              [92, -3],
              [92, 7.4],
              [66, 16.4],
              [61.4, 12],
            ]),
            { fill: '$bag' },
          ),
          art('bagfold', 'M78 -1L66.6 13M88 3L68 14.6', { stroke: '$icing2', sw: 0.2, opacity: 0.7 }),
          art(
            'nozzle',
            poly([
              [61.4, 12],
              [66, 16.4],
              [63.4, 18.6],
              [60.4, 15.6],
            ]),
            { fill: '$tip' },
          ),
          LOGO('mark', 46.5, 5, 11, '$cream', { fallbackSize: 28, fallbackWeight: 700 }),
          T('co', '{company}', 46.5, 38.4, 10, {
            stack: 'brand',
            minSize: 7.5,
            maxLines: 3,
            lineHeight: 1.08,
            weight: 600,
            fill: '$cream',
          }),
          L('contact', ['phone', 'website'], 46.5, 38.4, 6.4, { stack: 'brand', icons: false, fill: '$cream' }),
        ],
      },
    },
  },

  // Banana leaf: a sadhya laid out in its proper order. The back pulls back to show the whole hall being fed.
  {
    id: 'banana-leaf',
    name: 'Banana Leaf',
    category: 'food',
    tags: ['caterer', 'catering', 'wedding food', 'sadhya', 'events', 'south indian'],
    fonts: { heading: 'dmserif', body: 'manrope' },
    palettes: [
      {
        label: 'Kerala',
        l1: '#2E8B3D',
        l2: '#1E6B2E',
        vein: '#6DBB5E',
        veind: '#14511F',
        rib: '#CFE58A',
        text: '#FFFBEA',
        soft: '#FFE28A',
        hall: '#10301C',
        panel: '#FFF9E8',
        ink: '#123019',
      },
      {
        label: 'Monsoon',
        l1: '#14604A',
        l2: '#0B4436',
        vein: '#3F9A7E',
        veind: '#072E24',
        rib: '#A8D9A0',
        text: '#F7F4DE',
        soft: '#F2C14E',
        hall: '#07241C',
        panel: '#F7F4DE',
        ink: '#07241C',
      },
      {
        label: 'Tender',
        l1: '#A8CF5C',
        l2: '#7FB244',
        vein: '#D2E98E',
        veind: '#649A32',
        rib: '#F2F6C8',
        text: '#16330F',
        soft: '#7A2F06',
        hall: '#3B5F1F',
        panel: '#FCFBE6',
        ink: '#16330F',
      },
      {
        label: 'Night',
        l1: '#1A3A3A',
        l2: '#102A2B',
        vein: '#3C6E67',
        veind: '#0A1E1F',
        rib: '#8FBFA6',
        text: '#F8EFD8',
        soft: '#E9B44C',
        hall: '#081617',
        panel: '#F8EFD8',
        ink: '#0A1E1F',
      },
    ],
    sample: {
      name: 'Gopi Nair',
      title: 'Head Caterer',
      company: 'Sadhya House Caterers',
      tagline: 'Weddings, events and office lunches',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      website: 'sadhyahouse.example',
      address: 'MG Road, Kochi',
    },
    sides: {
      front: {
        background: {
          type: 'linear',
          angle: 20,
          stops: [
            [0, '$l2'],
            [1, '$l1'],
          ],
        },
        stacks: {
          brand: { x: 5, y: 12.5, w: 41, h: 15.5, anchor: 'top', gap: 0.7 },
          reach: { x: 5, y: 28.4, w: 41, h: 16.8, anchor: 'bottom', gap: 0.3 },
        },
        elements: [
          art('veinl', veins.light, { stroke: '$vein', sw: 0.14, opacity: 0.3 }),
          art('veind', veins.dark, { stroke: '$veind', sw: 0.18, opacity: 0.38 }),
          art(
            'below',
            poly([
              [-3, 48.6],
              [92, 43.6],
              [92, 54],
              [-3, 54],
            ]),
            { fill: '$l2' },
          ),
          art('rib', 'M-3 48.6L92 43.6', { stroke: '$rib', sw: 1.1 }),
          art('slit', 'M83 44C84.6 34 85 22 88 12', { stroke: '$veind', sw: 0.3 }),
          ...sadhyaRow.flatMap(([x, y, rx, ry, c, s], i) => [
            art(`dol${i}`, blob(x, y, rx, ry, 100 + i, 0.16, 9), { fill: c }),
            art(`spk${i}`, speckle(x, y, Math.min(rx, ry) * 0.7, 6, 0.26, 200 + i), { fill: s }),
          ]),
          art('chipa', ellipsePath(77.4, 7, 2.8, 2.6) + ellipsePath(81.4, 9, 2.8, 2.6) + ellipsePath(84.8, 6, 2.8, 2.6), {
            fill: '#EFC12F',
            stroke: '#B98B12',
            sw: 0.14,
          }),
          disc('papad', 55.8, 34.6, 8, { fill: '#F4E3B4', stroke: '#CFB77A', sw: 0.16 }),
          art('blisters', speckle(55.8, 34.6, 6.8, 18, 0.52, 41), { fill: '#D9BE82' }),
          art('rice', blob(72, 30, 13.6, 10.6, 77, 0.08, 12), { fill: '#FDFBF2' }),
          art('grains', riceGrains(72, 30, 12.2, 9.2, 80, 66), { stroke: '#DAD4C2', sw: 0.2, cap: 'round' }),
          art('sambar', blob(74, 30.6, 7.2, 5.4, 12, 0.2, 10), { fill: '#D9651E' }),
          art('sambar2', blob(72.8, 29.6, 4, 2.6, 15, 0.22, 8), { fill: '#EE8A33' }),
          art('drums', speckle(74, 30.8, 4.8, 6, 0.46, 18), { fill: '#3F6B1F' }),
          T('co', '{company}', 5, 41, 18, { stack: 'brand', minSize: 11, maxLines: 3, lineHeight: 1.04, font: '$heading', fill: '$text' }),
          T('tag', '{tagline}', 5, 41, 6.2, {
            stack: 'brand',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.18,
            weight: 600,
            fill: '$soft',
            optional: true,
          }),
          T('name', '{name}', 5, 41, 7.4, { stack: 'reach', minSize: 6.2, maxLines: 1, weight: 700, fill: '$text' }),
          L('contact', ['phone', 'website', 'address'], 5, 41, 6.2, { stack: 'reach', icons: false, weight: 600, fill: '$text' }),
        ],
      },
      back: {
        background: '$hall',
        stacks: { brand: { x: 49.5, y: 33.2, w: 35.4, h: 13.6, anchor: 'middle', gap: 0.5 } },
        elements: [
          art('hall', hallRows.leaves, { fill: '$l1' }),
          art('spines', hallRows.spine, { stroke: '$rib', sw: 0.16 }),
          art('rices', hallRows.rice, { fill: '#FDFBF2' }),
          art('dabs', hallRows.dabs, { fill: '#E4842A' }),
          R('panel', 46, -B, W + B - 46, H + 2 * B, '$panel'),
          disc('seal', 23, H / 2, 11.5, { fill: '$panel' }),
          LOGO('mark', 15.5, H / 2 - 7.5, 15, '$ink', { fallbackSize: 36, fallbackWeight: 400 }),
          QR('qr', 54.2, 5, 26, { quiet: 1.2 }),
          T('co', '{company}', 49.5, 35.4, 9, {
            stack: 'brand',
            minSize: 7,
            maxLines: 3,
            lineHeight: 1.08,
            align: 'center',
            font: '$heading',
            fill: '$ink',
          }),
          T('addr', '{address}', 49.5, 35.4, 6, {
            stack: 'brand',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.16,
            align: 'center',
            fill: '$ink',
            optional: true,
          }),
        ],
      },
    },
  },

  // Citrus sun: a cut fruit coming up over the counter, with rays behind it. Each palette is a different fruit.
  {
    id: 'citrus-sun',
    name: 'Citrus Sun',
    category: 'food',
    tags: ['juice', 'juice bar', 'street food', 'stall', 'smoothies', 'fruit', 'cart'],
    fonts: { heading: 'bricolage', body: 'dmsans' },
    palettes: [
      {
        label: 'Santra',
        deep: '#0B4347',
        sky: '#0E6E73',
        ray: '#128087',
        rind: '#EE7A0C',
        pith: '#FFEFD0',
        flesh: '#F99A1C',
        cell: '#FFC04D',
        cell2: '#E27B08',
        seed: '#FFF3D6',
        text: '#FFF7E6',
        soft: '#FFD27F',
      },
      {
        label: 'Mosambi',
        deep: '#6E0C30',
        sky: '#D81E5B',
        ray: '#E63670',
        rind: '#7FA82A',
        pith: '#F7F6CC',
        flesh: '#D9D23A',
        cell: '#F3EE76',
        cell2: '#B5B31E',
        seed: '#FFFCE0',
        text: '#FFF8E8',
        soft: '#FFE88A',
      },
      {
        label: 'Tarbooz',
        deep: '#231308',
        sky: '#FFC91F',
        ray: '#FFD64D',
        rind: '#1E7A3E',
        pith: '#E8F5C9',
        flesh: '#EE2F4C',
        cell: '#FF6F81',
        cell2: '#C81B37',
        seed: '#1B1212',
        text: '#231308',
        soft: '#A5122B',
      },
      {
        label: 'Anar',
        deep: '#1C1742',
        sky: '#1C1742',
        ray: '#262058',
        rind: '#A9173A',
        pith: '#FBE3D5',
        flesh: '#D81F4C',
        cell: '#FF6B8B',
        cell2: '#A70F35',
        seed: '#FFF0E8',
        text: '#FFF5EA',
        soft: '#FFB7C6',
      },
    ],
    sample: {
      name: 'Bablu Yadav',
      title: 'Owner',
      company: 'Santra Stop',
      tagline: 'Pressed while you wait',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      website: 'santrastop.example',
      address: 'Juhu Beach Road',
    },
    sides: {
      front: {
        background: '$sky',
        stacks: {
          brand: { x: 5, y: 3.8, w: W - 10, h: 22.4, anchor: 'top', gap: 1.4 },
          reach: { x: 5, y: 27, w: 35, h: 19.8, anchor: 'bottom', gap: 0.3 },
        },
        elements: [
          art('rays', sunRays(SUN.cx, SUN.cy, 44, 110), { fill: '$ray' }),
          disc('rind', SUN.cx, SUN.cy, SUN.R, { fill: '$rind' }),
          disc('pith', SUN.cx, SUN.cy, SUN.R * 0.93, { fill: '$pith' }),
          art('flesh', sunSlice.flesh, { fill: '$flesh', stroke: '$flesh', sw: 0.5, join: 'round' }),
          art('cells', sunSlice.cellsA, { stroke: '$cell', sw: 0.5, cap: 'round' }),
          art('cells2', sunSlice.cellsB, { stroke: '$cell2', sw: 0.42, cap: 'round' }),
          art('seeds', sunSlice.seeds, { fill: '$seed' }),
          T('co', '{company}', 5, W - 10, 38, {
            stack: 'brand',
            minSize: 13,
            maxLines: 2,
            lineHeight: 0.98,
            weight: 800,
            font: '$heading',
            fill: '$text',
          }),
          T('tag', '{tagline}', 5, 50, 7.2, {
            stack: 'brand',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.16,
            weight: 700,
            fill: '$soft',
            optional: true,
          }),
          T('name', '{name}', 5, 35, 7.2, { stack: 'reach', minSize: 6, maxLines: 2, lineHeight: 1.15, weight: 700, fill: '$text' }),
          L('contact', ['phone', 'address'], 5, 35, 6.2, { stack: 'reach', icons: false, weight: 600, fill: '$text' }),
        ],
      },
      back: {
        background: '$pith',
        stacks: { brand: { x: 5, y: 6, w: 32, h: 38.8, anchor: 'middle', gap: 1.2 } },
        elements: [
          disc('rind', 71, H / 2, 33, { fill: '$rind' }),
          disc('pulp', 71, H / 2, 30.6, { fill: '$pith' }),
          art('flesh', wheel.flesh, { fill: '$flesh', stroke: '$flesh', sw: 0.5, join: 'round' }),
          art('cells', wheel.cellsA, { stroke: '$cell', sw: 0.5, cap: 'round' }),
          art('cells2', wheel.cellsB, { stroke: '$cell2', sw: 0.42, cap: 'round' }),
          disc('core', 71, H / 2, 19.8, { fill: '$pith' }),
          QR('qr', 58, H / 2 - 13, 26, { quiet: 1.2 }),
          LOGO('mark', 5, 0, 11, '$deep', { stack: 'brand', fallbackSize: 26, fallbackWeight: 800 }),
          T('co', '{company}', 5, 32, 13, {
            stack: 'brand',
            minSize: 9.5,
            maxLines: 5,
            lineHeight: 1.02,
            weight: 800,
            font: '$heading',
            fill: '$deep',
          }),
          L('contact', ['phone', 'website'], 5, 32, 6.4, { stack: 'brand', icons: false, weight: 600, fill: '$deep' }),
        ],
      },
    },
  },

  // Gunny sack: the merchant's name stencilled onto a stitched jute bag, printed into the weave.
  {
    id: 'gunny-sack',
    name: 'Gunny Sack',
    category: 'retail',
    tags: ['tea', 'spice', 'masala', 'wholesale', 'merchant', 'grocery', 'rustic'],
    fonts: { heading: 'anton', body: 'jetbrains' },
    palettes: [
      {
        label: 'Jute',
        jute: '#C9A36A',
        shade: '#8F6B38',
        glint: '#E3C592',
        ink: '#1E1610',
        stamp: '#A5281B',
        hem: '#A98449',
        wood: '#D2A869',
        grain: '#8E6631',
        steel: '#3C3A36',
        sticker: '#FBF5E4',
      },
      {
        label: 'Hessian',
        jute: '#4A3424',
        shade: '#2A1C12',
        glint: '#6E5238',
        ink: '#F4E7CF',
        stamp: '#E9A23B',
        hem: '#37261A',
        wood: '#59402B',
        grain: '#2F2015',
        steel: '#D9D2C2',
        sticker: '#FBF5E4',
      },
      {
        label: 'Indigo',
        jute: '#23395F',
        shade: '#14233F',
        glint: '#3D5A89',
        ink: '#F2EEE1',
        stamp: '#F2B441',
        hem: '#1A2B4A',
        wood: '#2C4670',
        grain: '#172844',
        steel: '#D6D9DE',
        sticker: '#F8F6EC',
      },
      {
        label: 'Haldi',
        jute: '#E3A81E',
        shade: '#B97F0A',
        glint: '#F5CC5F',
        ink: '#3B1208',
        stamp: '#8E1B10',
        hem: '#C78D12',
        wood: '#E9B73E',
        grain: '#B6810F',
        steel: '#3B1208',
        sticker: '#FFF9E6',
      },
    ],
    sample: {
      name: 'Harish Vora',
      title: 'Proprietor',
      company: 'Vora & Sons',
      tagline: 'Tea and spice merchants',
      phone: '+91 98765 43210',
      website: 'vorasons.example',
      address: 'Masjid Bunder, Mumbai',
    },
    sides: {
      front: {
        background: '$jute',
        stacks: {
          brand: { x: 5, y: 5.6, w: 58, h: 16.6, anchor: 'middle' },
          reach: { x: 7.6, y: 25.2, w: 54.8, h: 19.4, anchor: 'middle', gap: 0.3 },
        },
        elements: [
          art('across', weaveH.across, { stroke: '$shade', sw: 0.3, dash: [0.64, 0.64], opacity: 0.32 }),
          art('down', weaveH.down, { stroke: '$glint', sw: 0.26, dash: [0.64, 0.64], opacity: 0.36 }),
          R('hem', -B, -B, W + 2 * B, 6.6, '$hem'),
          { id: 'hemline', type: 'line', x: -B, y: 3.6, w: W + 2 * B, h: 0, stroke: '$shade', sw: 0.5 },
          art('twine', hemStitches(-3, W + 3, 1.6), { stroke: '$ink', sw: 0.62, cap: 'round' }),
          disc('ring', 74.3, 15.8, 10.1, { stroke: '$stamp', sw: 0.7 }),
          disc('ring2', 74.3, 15.8, 8.7, { stroke: '$stamp', sw: 0.18 }),
          LOGO('mark', 68.3, 9.8, 12, '$ink', { fallbackSize: 26, fallbackWeight: 400 }),
          art('hook', sackHook.hook, { stroke: '$ink', sw: 0.75, cap: 'round' }),
          art('hookx', sackHook.cross, { stroke: '$stamp', sw: 0.6, cap: 'round' }),
          R('patch', 5, 23.4, 60, 23.4, '$sticker', { r: 0.5 }),
          R('stitch', 5.8, 24.2, 58.4, 21.8, undefined, { r: 0.3, stroke: '#16100A', sw: 0.16, dash: [0.8, 0.7], opacity: 0.55 }),
          T('co', '{company}', 5, 58, 30, {
            stack: 'brand',
            weight: 700,
            minSize: 13,
            maxLines: 2,
            lineHeight: 1.06,
            font: '$heading',
            fill: '$ink',
            upper: true,
          }),
          T('tag', '{tagline}', 7.6, 54.8, 6.2, {
            stack: 'reach',
            minSize: 5.5,
            maxLines: 1,
            weight: 700,
            fill: '#16100A',
            optional: true,
          }),
          T('name', '{name}', 7.6, 54.8, 6.8, { stack: 'reach', minSize: 5.8, maxLines: 1, weight: 700, fill: '#16100A' }),
          L('contact', ['phone', 'email', 'address'], 7.6, 54.8, 6, { stack: 'reach', gap: 0.6, icons: false, fill: '#16100A' }),
        ],
      },
      back: {
        background: '$wood',
        stacks: { brand: { x: 7, y: 6, w: 44.5, h: 29.5, anchor: 'top', gap: 1 } },
        elements: [
          art('grain', chest.grain, { stroke: '$grain', sw: 0.14, opacity: 0.45 }),
          art('seams', chest.seams, { stroke: '$grain', sw: 0.5, opacity: 0.6 }),
          R('band1', -B, -B, 6.1, H + 2 * B, '$steel'),
          R('band2', W - 3.1, -B, 6.1, H + 2 * B, '$steel'),
          art('rivets', rivets, { fill: '$wood' }),
          art('arrow1', upArrow(7, 37, 8), { fill: '$ink' }),
          art('arrow2', upArrow(16.4, 37, 8), { fill: '$ink' }),
          R('paper', 54.2, 7.4, 29.4, 36, '$sticker'),
          art('tape', rectPath(62.9, 5.4, 12, 4), { fill: '$steel', opacity: 0.35 }),
          QR('qr', 55.9, 10.4, 26, { quiet: 1.2 }),
          T('scan', 'Scan to save', 54.2, 29.4, 5.8, { y: 37.6, minSize: 5.5, weight: 700, align: 'center', fill: '#16100A' }),
          T('co', '{company}', 7, 44.5, 25, {
            stack: 'brand',
            weight: 700,
            minSize: 12,
            maxLines: 3,
            lineHeight: 1.06,
            font: '$heading',
            fill: '$ink',
            upper: true,
          }),
          T('tag', '{website}', 7, 44.5, 6.4, { stack: 'brand', minSize: 5.6, noWrap: true, weight: 700, fill: '$ink', optional: true }),
        ],
      },
    },
  },
];
