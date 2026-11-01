// Original vector artwork for the card templates, generated from code. No stock art, nothing traced.
// Every function returns SVG path data in millimetres, measured from the top-left of its own box.
import { ellipsePath, rectPath } from '../src/core/pathutil.js';

const f = (v) => String(Math.round(v * 1000) / 1000);

/** Tie-dye dots: small rings of dots arranged in a diamond lattice, like bandhani cloth. */
const arcDot = (x, y, r) => `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;

export function bandhani(w, h, { pitch = 5.2, dot = 0.34, clip = true } = {}) {
  let d = '';
  let row = 0;
  for (let y = 0; y <= h + pitch; y += pitch * 0.5, row++) {
    for (let x = row % 2 ? pitch / 2 : 0; x <= w + pitch; x += pitch) {
      // A band stops cleanly at its edge. Only a full-bleed sheet (clip: false) runs dots off the side.
      if (clip && x + dot * 3.2 > w) continue;
      // Two arcs per dot: a card back holds about 800 clusters, and this keeps the file a third of the size.
      d += arcDot(x, y, dot);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        d += arcDot(x + Math.cos(a) * dot * 2.6, y + Math.sin(a) * dot * 2.6, dot * 0.46);
      }
    }
  }
  return d;
}

/** One cusped Mughal arch, as seen in a jharokha window. */
export function archPath(x, y, w, h, spring = 0.42) {
  const m = x + w / 2;
  const s = y + h * spring;
  const b = y + h;
  const rise = s - y;
  return (
    `M${f(x)} ${f(b)}L${f(x)} ${f(s)}` +
    `C${f(x)} ${f(s - rise * 0.36)} ${f(x + w * 0.06)} ${f(s - rise * 0.5)} ${f(x + w * 0.17)} ${f(s - rise * 0.56)}` +
    `C${f(x + w * 0.2)} ${f(s - rise * 0.74)} ${f(x + w * 0.31)} ${f(s - rise * 0.78)} ${f(x + w * 0.37)} ${f(s - rise * 0.78)}` +
    `C${f(x + w * 0.41)} ${f(s - rise * 0.9)} ${f(m - w * 0.03)} ${f(y + rise * 0.05)} ${f(m)} ${f(y)}` +
    `C${f(m + w * 0.03)} ${f(y + rise * 0.05)} ${f(x + w * 0.59)} ${f(s - rise * 0.9)} ${f(x + w * 0.63)} ${f(s - rise * 0.78)}` +
    `C${f(x + w * 0.69)} ${f(s - rise * 0.78)} ${f(x + w * 0.8)} ${f(s - rise * 0.74)} ${f(x + w * 0.83)} ${f(s - rise * 0.56)}` +
    `C${f(x + w * 0.94)} ${f(s - rise * 0.5)} ${f(x + w)} ${f(s - rise * 0.36)} ${f(x + w)} ${f(s)}` +
    `L${f(x + w)} ${f(b)}Z`
  );
}

/** A colonnade of arches, row on row. */
export function archRows(w, h, aw = 11, ah = 15) {
  let d = '';
  let row = 0;
  for (let y = -ah / 2; y < h; y += ah * 0.92, row++) {
    for (let x = row % 2 ? -aw / 2 : 0; x < w; x += aw) d += archPath(x + 0.8, y + 0.8, aw - 1.6, ah - 1.6);
  }
  return d;
}

/** Map contour lines around a hill, built from a smooth height function. Closed loops that wobble naturally. */
export function contours(w, h, { cx = 0.7, cy = 0.45, rings = 13, step = 4.2, wobble = 1 } = {}) {
  const px = cx * w;
  const py = cy * h;
  let d = '';
  for (let r = 1; r <= rings; r++) {
    const base = r * step;
    const pts = [];
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const n =
        Math.sin(a * 2 + r * 0.33) * 1.1 +
        Math.sin(a * 3 - r * 0.21 + 1.3) * 0.8 +
        Math.sin(a * 5 + r * 0.12) * 0.35 +
        Math.cos(a * 1 + 0.6) * r * 0.22;
      const R = base + n * wobble * (0.5 + r * 0.09);
      pts.push([px + Math.cos(a) * R * 1.25, py + Math.sin(a) * R * 0.9]);
    }
    // Catmull-Rom through the points gives smooth curves as cubic Béziers.
    d += `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i + N - 1) % N];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % N];
      const p3 = pts[(i + 2) % N];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    d += 'Z';
  }
  return d;
}

const petal = (cx, cy, r0, r1, a, width) => {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const pt = (rad, off) => [cx + ca * rad - sa * off, cy + sa * rad + ca * off];
  const [ax, ay] = pt(r0, 0);
  const [bx, by] = pt(r1, 0);
  const mid = r0 + (r1 - r0) * 0.45;
  const [c1x, c1y] = pt(mid, width);
  const [c2x, c2y] = pt(r0 + (r1 - r0) * 0.8, width * 0.6);
  const [c3x, c3y] = pt(r0 + (r1 - r0) * 0.8, -width * 0.6);
  const [c4x, c4y] = pt(mid, -width);
  return `M${f(ax)} ${f(ay)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(bx)} ${f(by)}C${f(c3x)} ${f(c3y)} ${f(c4x)} ${f(c4y)} ${f(ax)} ${f(ay)}Z`;
};

/** Rangoli: layered rings of petals and dots. `layer` picks one colour layer, so each can have its own paint. */
export function rangoli(size, layer) {
  const c = size / 2;
  const R = size / 2;
  let d = '';
  const ring = (n, r0, r1, wid, offset = 0) => {
    for (let i = 0; i < n; i++) d += petal(c, c, R * r0, R * r1, (i / n) * Math.PI * 2 + offset, R * wid);
  };
  const dots = (n, rad, s, offset = 0) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + offset;
      d += ellipsePath(c + Math.cos(a) * R * rad, c + Math.sin(a) * R * rad, R * s, R * s);
    }
  };
  if (layer === 0) {
    ring(16, 0.56, 1, 0.13);
    ring(8, 0.12, 0.38, 0.09);
  } else if (layer === 1) {
    ring(16, 0.42, 0.78, 0.11, Math.PI / 16);
    d += ellipsePath(c, c, R * 0.09, R * 0.09);
  } else if (layer === 2) {
    ring(8, 0.2, 0.46, 0.06, Math.PI / 8);
    dots(32, 0.5, 0.009);
    dots(16, 0.965, 0.012, Math.PI / 16);
  }
  return d;
}

/** Drafting grid: fine lines every `minor`, heavier every `major`. Returns [fine, heavy]. */
export function grid(w, h, minor = 2.54, major = 12.7) {
  let fine = '';
  let heavy = '';
  const eps = 0.001;
  for (let x = 0; x <= w + eps; x += minor) {
    const line = `M${f(x)} 0L${f(x)} ${f(h)}`;
    if (Math.abs(x / major - Math.round(x / major)) < eps) heavy += line;
    else fine += line;
  }
  for (let y = 0; y <= h + eps; y += minor) {
    const line = `M0 ${f(y)}L${f(w)} ${f(y)}`;
    if (Math.abs(y / major - Math.round(y / major)) < eps) heavy += line;
    else fine += line;
  }
  return [fine, heavy];
}

/** A small floor plan: outer walls, rooms and door swings. Drawn for this template, in a 60 × 34 box. */
export function floorPlan() {
  const walls =
    'M0 0H60V34H0Z' + // outer shell
    'M24 0V13M24 19V34' + // main partition, with a door gap
    'M24 13H38M44 13H60' + // bedroom wall, with a door gap
    'M42 13V34' + // bath wall
    'M0 22H9M15 22H24'; // kitchen wall, with a door gap
  const swings =
    'M24 13A6 6 0 0 1 30 19M30 13V19' + // door to the hall
    'M38 13A6 6 0 0 0 44 19M44 13V19' + // door to the bedroom
    'M9 22A6 6 0 0 0 15 28M15 22V28'; // door to the kitchen
  const fittings =
    rectPath(46, 3, 11, 7, 0.6) + // bed
    rectPath(3, 3, 14, 6.5, 1) + // sofa
    rectPath(27, 24, 12, 7, 0.4) + // table
    rectPath(3, 25, 18, 2.2) + // counter
    ellipsePath(51, 25, 2.6, 3.2); // basin
  return { walls, swings, fittings };
}

/** A soft medical plus, drawn large so it can run off the card edge. */
export function softPlus(size, arm = 0.34, r = 0.09) {
  const a = size * arm;
  const o = (size - a) / 2;
  const cr = size * r;
  return rectPath(o, 0, a, size, cr) + rectPath(0, o, size, a, cr);
}

/** Evenly spaced horizontal rules, like ruled accounts paper. */
export function rules(w, y0, pitch, count) {
  let d = '';
  for (let i = 0; i < count; i++) d += `M0 ${f(y0 + i * pitch)}L${f(w)} ${f(y0 + i * pitch)}`;
  return d;
}
