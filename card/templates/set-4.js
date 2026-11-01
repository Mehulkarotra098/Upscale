// Template set 4: professional services and trades. Every card borrows one object or moment from its trade.
// Sizes are millimetres and points. Trim is 88.9 × 50.8 mm (vertical: 50.8 × 88.9). Sample details are invented.
import { ellipsePath, parsePath, pathString } from '../src/core/pathutil.js';
import { B, H, L, LOGO, QR, T, W } from './kit.js';

const n3 = (v) => String(Math.round(v * 1000) / 1000);
const PHONE = '+91 98765 43210';

// Short forms for elements, so each template reads as a layout rather than a wall of properties.
const art = (id, x, y, w, h, d, rest = {}) => ({ id, type: 'path', x, y, w, h, d, ...rest });
const box = (id, x, y, w, h, rest = {}) => ({ id, type: 'rect', x, y, w, h, ...rest });
const disc = (id, x, y, d, rest = {}) => ({ id, type: 'ellipse', x, y, w: d, h: d, ...rest });
const poly = (pts) => `M${pts.map(([x, y]) => `${n3(x)} ${n3(y)}`).join('L')}Z`;
const circle = (cx, cy, r) => ellipsePath(cx, cy, r, r);

/** A repeatable pseudo-random sequence, so the art is identical on every render. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Map every point of a path through fn(x, y) => [x, y]. */
function mapPath(d, fn) {
  return pathString(
    parsePath(d).map((c) => {
      const out = [c[0]];
      for (let i = 1; i < c.length; i += 2) out.push(...fn(c[i], c[i + 1]));
      return out;
    }),
  );
}

// ---------------------------------------------------------------- Drawn lettering

// Monoline numerals in a 6 × 10 box, for the dial.
const STROKE = {
  0: 'M3 0Q0 0 0 3V7Q0 10 3 10Q6 10 6 7V3Q6 0 3 0Z',
  1: 'M1.4 2.2L3.4 0V10',
  2: 'M0 3Q0 0 3 0Q6 0 6 3Q6 5 0 10H6',
  3: 'M0 1.5Q1 0 3 0Q6 0 6 2.6Q6 5 3 5Q6 5 6 7.4Q6 10 3 10Q1 10 0 8.5',
  4: 'M4.5 10V0L0 7H6',
  5: 'M5.5 0H1L.5 4.6Q1.6 3.8 3 3.8Q6 3.8 6 6.9Q6 10 3 10Q1 10 0 8.6',
  6: 'M5.2 .8Q4 0 3 0Q0 0 0 4V7Q0 10 3 10Q6 10 6 7Q6 4 3 4Q0 4 0 7',
  7: 'M0 0H6L2 10',
  8: 'M3 0Q.6 0 .6 2.5Q.6 5 3 5Q5.4 5 5.4 2.5Q5.4 0 3 0ZM3 5Q0 5 0 7.5Q0 10 3 10Q6 10 6 7.5Q6 5 3 5Z',
  9: 'M.8 9.2Q2 10 3 10Q6 10 6 6V3Q6 0 3 0Q0 0 0 3Q0 6 3 6Q6 6 6 3',
};

/** Set a word in the monoline alphabet. (x, y) is the top-left of the first letter, `rot` turns the word about that point. */
function inked(str, x, y, h, { rot = 0, gap = 2, centre = false } = {}) {
  const s = h / 10;
  const a = (rot * Math.PI) / 180;
  const adv = (6 + gap) * s;
  const width = str.length * adv - gap * s;
  const x0 = centre ? -width / 2 : 0;
  let d = '';
  [...str].forEach((ch, i) => {
    const g = STROKE[ch];
    if (!g) return;
    const lx = x0 + i * adv;
    d += mapPath(g, (px, py) => {
      const ux = lx + px * s;
      const uy = py * s;
      return [x + ux * Math.cos(a) - uy * Math.sin(a), y + ux * Math.sin(a) + uy * Math.cos(a)];
    });
  });
  return d;
}

// ---------------------------------------------------------------- Monsoon (insurance)

const W_V = H; // A vertical card's width.
const H_V = W; // A vertical card's height.
const CANOPY = { x0: 7.5, x1: 82.5, top: 6.2, base: 19, ribs: 8 };
const SLANT = 0.26;

/** Slanted rain across the bleed box. It skips anywhere `dry(x, y)` says, measured in card coordinates. */
function rain(dry, { seed = 7, pitchX = 3.5, pitchY = 4.3, len = 2.6 } = {}) {
  const r = seeded(seed);
  let d = '';
  for (let y = -B; y < H + B; y += pitchY) {
    for (let x = -B; x < W + B + 4; x += pitchX) {
      const px = x + (r() - 0.5) * 2.4;
      const py = y + (r() - 0.5) * 3;
      const l = len * (0.7 + r() * 0.6);
      if (dry(px, py) || dry(px - l * SLANT, py + l)) continue;
      d += `M${n3(px + B)} ${n3(py + B)}L${n3(px + B - l * SLANT)} ${n3(py + B + l)}`;
    }
  }
  return d;
}

/** The dry shadow under the canopy, which leans the same way the rain does. */
function underCanopy(x, y) {
  const { x0, x1, top, base } = CANOPY;
  if (y < top) return false;
  const mid = (x0 + x1) / 2;
  if (y < base) {
    const t = (y - top) / (base - top);
    return Math.abs(x - mid) < ((x1 - x0) / 2) * Math.sqrt(1 - (1 - t) * (1 - t));
  }
  const off = (y - base) * SLANT;
  return x > x0 - off && x < x1 - off;
}

/** Umbrella panels seen side-on. `which` 0 or 1 picks alternate panels so each set takes its own colour. */
function canopyPanels(which) {
  const { x0, x1, top, base, ribs } = CANOPY;
  const cx = (x0 + x1) / 2;
  const sag = 2.2;
  let d = '';
  for (let i = 0; i < ribs; i++) {
    if (i % 2 !== which) continue;
    const a = x0 + ((x1 - x0) * i) / ribs;
    const b = x0 + ((x1 - x0) * (i + 1)) / ribs;
    const ctrl = (px) => {
      const k = (px - cx) / ((x1 - x0) / 2);
      return `${n3(cx + (px - cx) * 1.02)} ${n3(top + (base - top) * (0.02 + 0.32 * (1 - Math.abs(k))))}`;
    };
    d += `M${n3(cx)} ${n3(top)}Q${ctrl(a)} ${n3(a)} ${n3(base)}Q${n3((a + b) / 2)} ${n3(base - sag)} ${n3(b)} ${n3(base)}Q${ctrl(b)} ${n3(cx)} ${n3(top)}Z`;
  }
  return d;
}

/** An umbrella from straight above: eight scalloped wedges. `which` picks alternate wedges. */
function umbrellaTop(cx, cy, R, which, n = 8) {
  let d = '';
  for (let i = 0; i < n; i++) {
    if (i % 2 !== which) continue;
    const a0 = (i / n) * Math.PI * 2 + Math.PI / n;
    const a1 = ((i + 1) / n) * Math.PI * 2 + Math.PI / n;
    const am = (a0 + a1) / 2;
    const p = (a, r) => `${n3(cx + Math.cos(a) * r)} ${n3(cy + Math.sin(a) * r)}`;
    d += `M${n3(cx)} ${n3(cy)}L${p(a0, R)}Q${p(am, R * 0.8)} ${p(a1, R)}Z`;
  }
  return d;
}

function umbrellaTips(cx, cy, R, n = 8) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / n;
    d += circle(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 0.55);
  }
  return d;
}

// ---------------------------------------------------------------- Switch plate (electrician)

function rocker(id, x, y, w, h, on) {
  return [
    box(`${id}-seat`, x, y, w, h, { r: 0.7, fill: '$seat' }),
    box(`${id}-a`, x + 0.5, y + 0.5, w - 1, (h - 1) / 2, { r: 0.45, fill: on ? '$rockerDark' : '$rockerLight' }),
    box(`${id}-b`, x + 0.5, y + h / 2, w - 1, (h - 1) / 2, { r: 0.45, fill: on ? '$rockerLight' : '$rockerDark' }),
    disc(`${id}-dot`, x + w / 2 - 0.5, y + (on ? h - 1.9 : 1), 1, { fill: on ? '$neon' : '$seat' }),
  ];
}

function screwCap(id, cx, cy) {
  return [
    disc(`${id}-c`, cx - 1.9, cy - 1.9, 3.8, { fill: '$rockerLight', stroke: '$edge', sw: 0.14 }),
    art(`${id}-s`, 0, 0, W, H, `M${n3(cx - 1.1)} ${n3(cy + 0.5)}L${n3(cx + 1.1)} ${n3(cy - 0.5)}`, {
      stroke: '$edge',
      sw: 0.3,
      cap: 'round',
    }),
  ];
}

// An unlit bulb hanging on its flex, in a 20 × 40 box whose top is the wire's start.
const BULB_GLASS = 'M6.2 26.6C6.2 23.6 3 22 3 17.4C3 12.8 6.2 9.8 10 9.8C13.8 9.8 17 12.8 17 17.4C17 22 13.8 23.6 13.8 26.6Z';
const BULB_CAP = 'M6.4 27.2H13.6V28.6H6.4ZM6.8 29.2H13.2V30.6H6.8ZM7.6 31.2H12.4L11 33H9Z';
const BULB_FILAMENT = 'M8.2 26.4L7.2 19.4L8.8 21L10 18.8L11.2 21L12.8 19.4L11.8 26.4';

// ---------------------------------------------------------------- Tap (plumber)

/** A bib tap in side view, coming in from the left edge of a vertical card. The spout's mouth is at (29.2, 24.2). */
const TAP_BODY =
  'M-3 11.2H8.6V9.6H10.2V8.8H17V5.6H20V8.8H24.5C29 8.8 32.4 12.2 32.4 16.7V24.2H26V17.2C26 16 25.2 15.2 24 15.2H10.2V14.4H8.6V12.8H-3Z';
const TAP_HANDLE =
  'M10.6 2.2C10.6 1.4 11.2 .9 12 .9H25C25.8 .9 26.4 1.4 26.4 2.2V3.4C26.4 4.2 25.8 4.8 25 4.8H12C11.2 4.8 10.6 4.2 10.6 3.4Z';

function drop(cx, top, h) {
  const w = h * 0.36;
  return `M${n3(cx)} ${n3(top)}C${n3(cx + w * 0.3)} ${n3(top + h * 0.3)} ${n3(cx + w)} ${n3(top + h * 0.46)} ${n3(cx + w)} ${n3(top + h * 0.68)}C${n3(cx + w)} ${n3(top + h * 0.88)} ${n3(cx + w * 0.55)} ${n3(top + h)} ${n3(cx)} ${n3(top + h)}C${n3(cx - w * 0.55)} ${n3(top + h)} ${n3(cx - w)} ${n3(top + h * 0.88)} ${n3(cx - w)} ${n3(top + h * 0.68)}C${n3(cx - w)} ${n3(top + h * 0.46)} ${n3(cx - w * 0.3)} ${n3(top + h * 0.3)} ${n3(cx)} ${n3(top)}Z`;
}

/** Water filling a box from a wavy top edge down past the bottom of the bleed. */
function water(w, y, bottom, amp, waves, phase = 0) {
  const step = w / waves;
  const start = -B - step;
  let d = `M${n3(start)} ${n3(y)}`;
  for (let i = 0; i < waves + 3; i++) {
    const x = start + i * step;
    const up = (i + phase) % 2 === 0 ? -amp : amp;
    d += `Q${n3(x + step / 2)} ${n3(y + up)} ${n3(x + step)} ${n3(y)}`;
  }
  return `${d}L${n3(w + B + step)} ${n3(bottom)}L${n3(start)} ${n3(bottom)}Z`;
}

const paperBoat = (x, y, s) =>
  poly([
    [x, y],
    [x + 9 * s, y],
    [x + 12.4 * s, y - 3.4 * s],
    [x + 7.4 * s, y - 3.4 * s],
    [x + 6.2 * s, y - 8 * s],
    [x + 5 * s, y - 3.4 * s],
    [x - 3.4 * s, y - 3.4 * s],
  ]);

// ---------------------------------------------------------------- Room (interior design)

const ROOM = { vx: 44.45, vy: 20, far: 1 / 0.6, near: 0.84 };
const onScreen = (X, Y, d) => [ROOM.vx + (X - ROOM.vx) / d, ROOM.vy + (Y - ROOM.vy) / d];
const FAR = {
  x: onScreen(0, 0, ROOM.far)[0],
  y: onScreen(0, 0, ROOM.far)[1],
  r: onScreen(W, H, ROOM.far)[0],
  b: onScreen(W, H, ROOM.far)[1],
};

const plane = (corner) => poly(corner.map(([X, Y, d]) => onScreen(X, Y, d)));
const ROOM_PLANES = {
  ceiling: plane([
    [0, 0, ROOM.near],
    [W, 0, ROOM.near],
    [W, 0, ROOM.far],
    [0, 0, ROOM.far],
  ]),
  left: plane([
    [0, 0, ROOM.near],
    [0, 0, ROOM.far],
    [0, H, ROOM.far],
    [0, H, ROOM.near],
  ]),
  right: plane([
    [W, 0, ROOM.near],
    [W, 0, ROOM.far],
    [W, H, ROOM.far],
    [W, H, ROOM.near],
  ]),
  floor: plane([
    [0, H, ROOM.near],
    [W, H, ROOM.near],
    [W, H, ROOM.far],
    [0, H, ROOM.far],
  ]),
};

/** Chequered floor tiles in true perspective. */
function roomTiles(cols = 8, rows = 6) {
  let d = '';
  const dStep = (ROOM.far - ROOM.near) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2) continue;
      const X0 = (W * c) / cols;
      const X1 = (W * (c + 1)) / cols;
      const d0 = ROOM.far - r * dStep;
      const d1 = d0 - dStep;
      d += poly([onScreen(X0, H, d0), onScreen(X1, H, d0), onScreen(X1, H, d1), onScreen(X0, H, d1)]);
    }
  }
  return d;
}

/** An arched window on the left wall, and its bars. */
function roomWindow() {
  const d0 = 1.05;
  const d1 = 1.42;
  const dm = (d0 + d1) / 2;
  const a = (d1 - d0) / 2;
  const top = 7;
  const spring = 17;
  const sill = 35;
  const pts = [onScreen(0, sill, d1)];
  for (let i = 0; i <= 14; i++) {
    const t = (i / 14) * Math.PI;
    pts.push(onScreen(0, spring - (spring - top) * Math.sin(t), dm + a * Math.cos(t)));
  }
  pts.push(onScreen(0, sill, d0));
  const bars =
    `M${onScreen(0, sill, dm).map(n3).join(' ')}L${onScreen(0, top, dm).map(n3).join(' ')}` +
    `M${onScreen(0, spring, d1).map(n3).join(' ')}L${onScreen(0, spring, d0).map(n3).join(' ')}` +
    `M${onScreen(0, (spring + sill) / 2, d1)
      .map(n3)
      .join(' ')}L${onScreen(0, (spring + sill) / 2, d0)
      .map(n3)
      .join(' ')}`;
  return { glass: poly(pts), bars };
}

/** A dome pendant lamp, its cord coming down off the top of the card. */
function roomLamp(cx, y) {
  return {
    cord: `M${n3(cx)} -3L${n3(cx)} ${n3(y)}`,
    shade: `M${n3(cx - 5.6)} ${n3(y + 5)}C${n3(cx - 5.6)} ${n3(y + 1.2)} ${n3(cx - 2.8)} ${n3(y)} ${n3(cx)} ${n3(y)}C${n3(cx + 2.8)} ${n3(y)} ${n3(cx + 5.6)} ${n3(y + 1.2)} ${n3(cx + 5.6)} ${n3(y + 5)}Z`,
    bulb: ellipsePath(cx, y + 5.1, 1.5, 1),
  };
}

function roomElements(walls, side) {
  const win = roomWindow();
  const lamp = roomLamp(79.4, 8);
  return [
    art(`${side}ceil`, 0, 0, W, H, ROOM_PLANES.ceiling, { fill: walls.ceil }),
    art(`${side}left`, 0, 0, W, H, ROOM_PLANES.left, { fill: walls.left }),
    art(`${side}right`, 0, 0, W, H, ROOM_PLANES.right, { fill: walls.right }),
    art(`${side}floor`, 0, 0, W, H, ROOM_PLANES.floor, { fill: walls.tileA }),
    art(`${side}tiles`, 0, 0, W, H, roomTiles(), { fill: walls.tileB }),
    box(`${side}wall`, FAR.x, FAR.y, FAR.r - FAR.x, FAR.b - FAR.y, { fill: walls.wall }),
    art(`${side}glass`, 0, 0, W, H, win.glass, { fill: walls.sky }),
    art(`${side}bars`, 0, 0, W, H, win.bars, { stroke: walls.left, sw: 0.3 }),
    art(`${side}cord`, 0, 0, W, H, lamp.cord, { stroke: walls.brass, sw: 0.22 }),
    art(`${side}bulb`, 0, 0, W, H, lamp.bulb, { fill: '#FFF3C4' }),
    art(`${side}shade`, 0, 0, W, H, lamp.shade, { fill: walls.brass }),
  ];
}

// ---------------------------------------------------------------- Speedo (garage)

const DIAL = { cx: 63.2, cy: 25.4, R: 22.6, a0: 135, sweep: 270, max: 8 };
const dialAngle = (v) => ((DIAL.a0 + (DIAL.sweep * v) / DIAL.max) * Math.PI) / 180;

function dialTicks(minor) {
  const { cx, cy, R } = DIAL;
  let d = '';
  const steps = minor ? DIAL.max * 5 : DIAL.max;
  for (let i = 0; i <= steps; i++) {
    if (minor && i % 5 === 0) continue;
    const a = dialAngle((i / steps) * DIAL.max);
    const r0 = R - (minor ? 1.5 : 3);
    const r1 = R - 0.2;
    d += `M${n3(cx + Math.cos(a) * r0)} ${n3(cy + Math.sin(a) * r0)}L${n3(cx + Math.cos(a) * r1)} ${n3(cy + Math.sin(a) * r1)}`;
  }
  return d;
}

function dialNumbers() {
  const { cx, cy, R } = DIAL;
  let d = '';
  for (let v = 0; v <= DIAL.max; v++) {
    const a = dialAngle(v);
    d += inked(String(v), cx + Math.cos(a) * (R - 6.2) - 0.75, cy + Math.sin(a) * (R - 6.2) - 1.25, 2.5);
  }
  return d;
}

function dialArc(v0, v1, r) {
  const { cx, cy } = DIAL;
  const a0 = dialAngle(v0);
  const a1 = dialAngle(v1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `M${n3(cx + Math.cos(a0) * r)} ${n3(cy + Math.sin(a0) * r)}A${r} ${r} 0 ${large} 1 ${n3(cx + Math.cos(a1) * r)} ${n3(cy + Math.sin(a1) * r)}`;
}

function dialNeedle(v) {
  const { cx, cy, R } = DIAL;
  const a = dialAngle(v);
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const pt = (r, o) => [cx + ca * r - sa * o, cy + sa * r + ca * o];
  return poly([pt(-4.5, 0.75), pt(R - 3.6, 0.1), pt(R - 3.6, -0.1), pt(-4.5, -0.75)]);
}

// Warning lamps, drawn on a 24 × 24 grid.
const LAMPS = {
  engine: 'M3 10V17M3 13.5H5.5M5.5 10H8V7.5H10.5V5.5H16V7.5H12.5M16 7.5H18L20 10H22V17H20L18 19H9L6.5 16.5H5.5V10',
  oil: 'M2.5 9.5L6.5 11M6.5 9H12.5L14.5 11H17.5L22 8.5L17.5 16.5H7.5Q6.5 16.5 6.5 15.5ZM9.5 9V6.8M7.5 6.8H11.5M4 13.6C3.2 14.8 2.7 15.5 2.7 16.3C2.7 17.1 3.3 17.6 4 17.6C4.7 17.6 5.3 17.1 5.3 16.3C5.3 15.5 4.8 14.8 4 13.6Z',
  battery: 'M3 7.5H21V19H3ZM6 7.5V5H10V7.5M14 7.5V5H18V7.5M6 13.2H10M8 11.2V15.2M14 13.2H18',
  temp: 'M12 3V13.2M12 13.2A2.6 2.6 0 1 0 12.01 13.2M12 5.2H16M12 8H15M12 10.8H16M3 19.5C5 18 7 18 9 19.5C11 21 13 21 15 19.5C17 18 19 18 21 19.5',
  brake: 'M12 5.5A6.5 6.5 0 1 0 12.01 5.5M12 8.6V12.6M12 15V15.3M4.6 5.5C2 9.5 2 14.5 4.6 18.5M19.4 5.5C22 9.5 22 14.5 19.4 18.5',
};

function lamp(id, name, x, y, size, stroke) {
  const s = size / 24;
  return art(id, x, y, size, size, LAMPS[name], { vb: [0, 0, 24, 24], stroke, sw: 1.7 * s, cap: 'round', join: 'round' });
}

// ---------------------------------------------------------------- Truck art (transport)

/** A fringe of hanging scallops, the way a truck's tailboard is edged. */
function scallops(y, r, w = W + 2 * B, x0 = -B) {
  let d = '';
  for (let x = x0; x < x0 + w; x += 2 * r) d += `M${n3(x)} ${n3(y)}A${r} ${r} 0 0 0 ${n3(x + 2 * r)} ${n3(y)}Z`;
  return d;
}

function beads(y, r, pitch, w = W + 2 * B, x0 = -B) {
  let d = '';
  for (let x = x0 + pitch / 2; x < x0 + w; x += pitch) d += circle(x, y, r);
  return d;
}

/** Yellow-and-black road stripes. */
function hazard(y, h, pitch = 5) {
  let d = '';
  for (let x = -B - h; x < W + B + h; x += pitch) {
    d += poly([
      [x, y + h],
      [x + pitch / 2, y + h],
      [x + pitch / 2 + h, y],
      [x + h, y],
    ]);
  }
  return d;
}

/** One petal pointing along angle a. */
function petalAt(cx, cy, r0, r1, a, wid) {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const pt = (r, o) => `${n3(cx + ca * r - sa * o)} ${n3(cy + sa * r + ca * o)}`;
  const m = r0 + (r1 - r0) * 0.5;
  return `M${pt(r0, 0)}Q${pt(m, wid)} ${pt(r1, 0)}Q${pt(m, -wid)} ${pt(r0, 0)}Z`;
}

/** A painted flower: rings of petals around a centre. `ring` picks one colour's worth of it. */
function truckFlower(cx, cy, R, ring) {
  let d = '';
  if (ring === 0) for (let i = 0; i < 12; i++) d += petalAt(cx, cy, R * 0.34, R, (i / 12) * Math.PI * 2, R * 0.27);
  if (ring === 1) for (let i = 0; i < 12; i++) d += petalAt(cx, cy, R * 0.28, R * 0.7, ((i + 0.5) / 12) * Math.PI * 2, R * 0.17);
  if (ring === 2) d += circle(cx, cy, R * 0.3);
  return d;
}

function flowerAt(id, cx, cy, R, c0, c1, c2) {
  return [
    art(`${id}0`, 0, 0, W, H, truckFlower(cx, cy, R, 0), { fill: c0 }),
    art(`${id}1`, 0, 0, W, H, truckFlower(cx, cy, R, 1), { fill: c1 }),
    art(`${id}2`, 0, 0, W, H, truckFlower(cx, cy, R, 2), { fill: c2 }),
  ];
}

/** A round red reflector with a ring. */
function reflector(id, cx, cy, r) {
  return [
    disc(`${id}o`, cx - r, cy - r, 2 * r, { fill: '#111111' }),
    disc(`${id}i`, cx - r * 0.78, cy - r * 0.78, 1.56 * r, { fill: '#E3121B' }),
    disc(`${id}g`, cx - r * 0.42, cy - r * 0.5, 0.5 * r, { fill: '#FF9A8C' }),
  ];
}

// ---------------------------------------------------------------- Press sheet (printing)

/** A printer's registration mark: ring, inner ring and crosshair. */
function regMark(cx, cy, R) {
  const r2 = R * 0.56;
  return (
    circle(cx, cy, R) +
    circle(cx, cy, r2) +
    `M${n3(cx - R * 1.34)} ${n3(cy)}L${n3(cx + R * 1.34)} ${n3(cy)}M${n3(cx)} ${n3(cy - R * 1.34)}L${n3(cx)} ${n3(cy + R * 1.34)}`
  );
}

/** Corner crop marks, set inside the card so the sheet reads as a sheet. */
function cropTicks(w, h, inset = 2.6, reach = 3) {
  const c = (x, y, dx, dy) => `M${n3(x)} ${n3(y)}L${n3(x + dx * reach)} ${n3(y)}M${n3(x)} ${n3(y)}L${n3(x)} ${n3(y + dy * reach)}`;
  return c(inset, inset, 1, 1) + c(w - inset, inset, -1, 1) + c(inset, h - inset, 1, -1) + c(w - inset, h - inset, -1, -1);
}

/** One screen of halftone dots at an angle, as several paths of equal-sized dots. Returns [{ d, size }]. */
function halftone(w, h, angleDeg, pitch, tone, buckets = 5) {
  const a = (angleDeg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const reach = Math.hypot(w, h);
  const out = Array.from({ length: buckets }, () => '');
  for (let u = -reach; u < reach; u += pitch) {
    for (let v = -reach; v < reach; v += pitch) {
      const x = w / 2 + u * ca - v * sa;
      const y = h / 2 + u * sa + v * ca;
      if (x < -1 || y < -1 || x > w + 1 || y > h + 1) continue;
      const t = tone(x / w, y / h);
      if (t < 0.06) continue;
      const b = Math.min(buckets - 1, Math.floor(t * buckets));
      out[b] += `M${n3(x)} ${n3(y)}l.01 0`;
    }
  }
  return out.map((d, i) => ({ d, size: ((i + 0.7) / buckets) * pitch * 0.92 })).filter((b) => b.d);
}

function halftoneLayers(prefix, w, h, angle, pitch, tone, stroke) {
  return halftone(w, h, angle, pitch, tone).map((b, i) =>
    art(`${prefix}${i}`, -B, -B, w, h, b.d, { stroke, sw: Number(n3(b.size)), cap: 'round' }),
  );
}

/** The colour control strip that runs along the edge of a press sheet. */
function colourBar(x, y, cell, inks) {
  const els = [];
  inks.forEach((ink, i) => {
    [1, 0.55, 0.25].forEach((o, j) => {
      els.push(box(`bar${i}${j}`, x + (i * 3 + j) * cell, y, cell - 0.25, cell, { fill: ink, opacity: o }));
    });
  });
  return els;
}

export const SET_4 = [
  // Monsoon: rain over the whole card, except under your umbrella. Your details stay dry.
  (() => {
    const dryFront = (x, y) => underCanopy(x, y);
    const ucx = 64.4;
    const uR = 30.4;
    const dryBack = (x, y) => (x < 34 && y > 3 && y < H - 3) || Math.hypot(x - ucx, y - H / 2) < uR + 1;
    const tx = 9.4;
    const tw = 63.4;
    return {
      id: 'monsoon-cover',
      name: 'Monsoon',
      category: 'professional',
      tags: ['insurance', 'adviser', 'agent', 'life', 'health', 'financial'],
      fonts: { heading: 'fraunces', body: 'outfit' },
      palettes: [
        {
          label: 'Monsoon',
          bg: '#14304A',
          rain: '#A9D2EC',
          hot: '#F6B90F',
          hot2: '#E39A04',
          on: '#14304A',
          text: '#F3F8FB',
          soft: '#BAD4E6',
        },
        { label: 'Dusk', bg: '#2B1B40', rain: '#C0ADE6', hot: '#FF6B57', hot2: '#E64C3B', on: '#2B1B40', text: '#FBF4FF', soft: '#CDBDEA' },
        {
          label: 'Kerala',
          bg: '#0A4A45',
          rain: '#A0E7D8',
          hot: '#FFF2CF',
          hot2: '#F1D999',
          on: '#0A4A45',
          text: '#F4FBF8',
          soft: '#AEE3D7',
        },
        {
          label: 'Daylight',
          bg: '#E9F0F4',
          rain: '#6A8BA8',
          hot: '#D5341C',
          hot2: '#AF2410',
          on: '#FFFFFF',
          text: '#10283B',
          soft: '#3F5C73',
        },
      ],
      sample: {
        name: 'Farida Contractor',
        title: 'Insurance Adviser',
        company: 'Contractor Cover',
        tagline: 'For the day it rains',
        phone: PHONE,
        email: 'farida@contractorcover.example',
        website: 'contractorcover.example',
        address: 'Camp, Pune',
      },
      sides: {
        front: {
          background: '$bg',
          stacks: {
            who: { x: tx, y: 21, w: tw, h: 13.6, anchor: 'top', gap: 0.8 },
            reach: { x: tx, y: 35, w: tw, h: 12, anchor: 'bottom' },
          },
          elements: [
            art('rainfar', -B, -B, W + 2 * B, H + 2 * B, rain(dryFront, { seed: 11, pitchX: 2.7, pitchY: 3.2, len: 1.9 }), {
              stroke: '$rain',
              sw: 0.14,
              cap: 'round',
              opacity: 0.5,
            }),
            art('rainnear', -B, -B, W + 2 * B, H + 2 * B, rain(dryFront, { seed: 29, pitchX: 5.1, pitchY: 6, len: 3.8 }), {
              stroke: '$rain',
              sw: 0.28,
              cap: 'round',
            }),
            art('panel0', 0, 0, W, H, canopyPanels(0), { fill: '$hot' }),
            art('panel1', 0, 0, W, H, canopyPanels(1), { fill: '$hot2' }),
            box('ferrule', (CANOPY.x0 + CANOPY.x1) / 2 - 0.3, CANOPY.top - 2.6, 0.6, 3, { fill: '$hot2', r: 0.2 }),
            T('name', '{name}', tx, tw, 16, {
              stack: 'who',
              font: '$heading',
              weight: 600,
              fill: '$text',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1.08,
            }),
            T('role', '{title}', tx, tw, 6.8, { stack: 'who', weight: 500, fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.18 }),
            L('contact', ['phone', 'email', 'website'], tx, tw, 6.6, { stack: 'reach', fill: '$text', iconFill: '$hot', rowHeight: 1.6 }),
          ],
        },
        back: {
          background: '$bg',
          stacks: { brand: { x: 5, y: 5.6, w: 27.4, h: 39.6, anchor: 'middle', gap: 1.5 } },
          elements: [
            art('rainfar', -B, -B, W + 2 * B, H + 2 * B, rain(dryBack, { seed: 5, pitchX: 2.7, pitchY: 3.2, len: 1.9 }), {
              stroke: '$rain',
              sw: 0.14,
              cap: 'round',
              opacity: 0.5,
            }),
            art('rainnear', -B, -B, W + 2 * B, H + 2 * B, rain(dryBack, { seed: 17, pitchX: 5.1, pitchY: 6, len: 3.8 }), {
              stroke: '$rain',
              sw: 0.28,
              cap: 'round',
            }),
            art('top0', 0, 0, W + B, H + B, umbrellaTop(ucx, H / 2, uR, 0), { fill: '$hot' }),
            art('top1', 0, 0, W + B, H + B, umbrellaTop(ucx, H / 2, uR, 1), { fill: '$hot2' }),
            art('tips', 0, 0, W + B, H + B, umbrellaTips(ucx, H / 2, uR), { fill: '$hot2' }),
            QR('qr', ucx - 13, H / 2 - 13, 26, { r: 1.2, quiet: 1.4 }),
            LOGO('logo', 5, 5.6, 10, '$text', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 5, 27.4, 12.5, {
              stack: 'brand',
              font: '$heading',
              weight: 600,
              fill: '$text',
              minSize: 8.5,
              maxLines: 4,
              lineHeight: 1.08,
            }),
            T('tag', '{tagline}', 5, 27.4, 6.8, {
              stack: 'brand',
              fill: '$soft',
              minSize: 5.8,
              maxLines: 3,
              lineHeight: 1.2,
              optional: true,
            }),
            T('addr', '{address}', 5, 27.4, 6.2, {
              stack: 'brand',
              fill: '$soft',
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

  // Switch Plate: the card is the plate on your wall, your name on a strip of insulation tape. On the back, the one bulb in a dark room.
  (() => {
    const tx = 7.4;
    const tw = 55.4;
    const plate = {
      type: 'linear',
      angle: 155,
      stops: [
        [0, '$plate'],
        [1, '$plate2'],
      ],
    };
    const mx = 66.6;
    const mw = 13.2;
    const mh = 9;
    const rows = [11.2, 20.9, 30.6];
    const hang = { x: W - 24.1, y: -3.6, w: 12.2, h: 24.4, vb: [0, 0, 20, 40] };
    return {
      id: 'switch-plate',
      name: 'Switch Plate',
      category: 'trades',
      tags: ['electrician', 'electrical', 'wiring', 'contractor', 'repairs', 'inverter'],
      fonts: { heading: 'manrope', body: 'manrope' },
      palettes: [
        {
          label: 'Ivory',
          tape: '#D6231C',
          tapeInk: '#FFFFFF',
          plate: '#FFFEFA',
          plate2: '#E9E5DA',
          edge: '#B8B2A4',
          seat: '#C9C4B6',
          rockerLight: '#FFFFFF',
          rockerDark: '#E2DDCF',
          neon: '#E8251F',
          ink: '#1F1D18',
          dim: '#6E695B',
          room: '#0A0A0C',
          pop: '#FFD23F',
          roomText: '#F3F1E9',
        },
        {
          label: 'Graphite',
          tape: '#FFC91F',
          tapeInk: '#141414',
          plate: '#34373C',
          plate2: '#1E2023',
          edge: '#5B5F66',
          seat: '#111214',
          rockerLight: '#4A4E55',
          rockerDark: '#2A2C31',
          neon: '#FF3B2F',
          ink: '#F4F4F2',
          dim: '#A6A9AE',
          room: '#050507',
          pop: '#FF3B2F',
          roomText: '#F4F4F2',
        },
        {
          label: 'Champagne',
          tape: '#14398E',
          tapeInk: '#FFFFFF',
          plate: '#EADBC2',
          plate2: '#CDB792',
          edge: '#9C855F',
          seat: '#A8926E',
          rockerLight: '#F5EAD6',
          rockerDark: '#D8C6A5',
          neon: '#D5261C',
          ink: '#2B2114',
          dim: '#6B5A3F',
          room: '#14100A',
          pop: '#FFC94A',
          roomText: '#F5EAD6',
        },
        {
          label: 'Blue tape',
          tape: '#1F5FBF',
          tapeInk: '#FFFFFF',
          plate: '#E6EEF5',
          plate2: '#C5D4E2',
          edge: '#8EA3B8',
          seat: '#9DB0C3',
          rockerLight: '#F7FAFD',
          rockerDark: '#D3DFEA',
          neon: '#E8251F',
          ink: '#0F2238',
          dim: '#4A5E75',
          room: '#071220',
          pop: '#7FD4FF',
          roomText: '#E6EEF5',
        },
      ],
      sample: {
        name: 'Sunil Yadav',
        title: 'Electrician and Wireman',
        company: 'Yadav Electricals',
        phone: PHONE,
        email: 'sunil@yadavelectricals.example',
        website: 'yadavelectricals.example',
        address: 'Sector 15, Noida',
      },
      sides: {
        front: {
          background: plate,
          stacks: {
            tape: { x: tx, y: 4.6, w: tw, h: 7, anchor: 'middle' },
            who: { x: tx, y: 13.4, w: tw, h: 11.6, anchor: 'top', gap: 0.7 },
            reach: { x: tx, y: 25.6, w: tw, h: 20.6, anchor: 'bottom' },
          },
          elements: [
            box('rim', 2.4, 2.4, W - 4.8, H - 4.8, { r: 2.6, stroke: '$edge', sw: 0.14 }),
            art('tape', 0, 0, W, H, 'M-3 4.2H64L62.6 5.6L64 7L62.6 8.4L64 9.8L62.6 11.9H-3Z', { fill: '$tape' }),
            ...screwCap('st', mx + mw / 2, 6.6),
            ...screwCap('sb', mx + mw / 2, H - 6.6),
            ...rocker('r0', mx, rows[0], mw, mh, true),
            ...rocker('r1', mx, rows[1], mw, mh, false),
            ...rocker('r2', mx, rows[2], mw, mh, false),
            T('name', '{name}', tx, tw, 15, {
              stack: 'tape',
              font: '$heading',
              weight: 800,
              fill: '$tapeInk',
              minSize: 11,
              noWrap: true,
              lineHeight: 1.05,
            }),
            T('role', '{title}', tx, tw, 7, { stack: 'who', weight: 600, fill: '$dim', minSize: 5.8, maxLines: 2, lineHeight: 1.16 }),
            T('co', '{company}', tx, tw, 7.4, {
              stack: 'who',
              weight: 800,
              fill: '$ink',
              minSize: 6,
              maxLines: 2,
              lineHeight: 1.16,
              optional: true,
            }),
            L('contact', ['phone', 'email', 'website', 'address'], tx, tw, 6.6, {
              stack: 'reach',
              weight: 600,
              fill: '$ink',
              iconFill: '$dim',
              rowHeight: 1.6,
            }),
          ],
        },
        back: {
          background: '$room',
          stacks: { brand: { x: 5, y: 5.6, w: 50, h: 39.6, anchor: 'middle', gap: 1.5 } },
          elements: [
            art('flex', 0, 0, W, H, `M${hang.x + 6.1} -3V${hang.y + 5.6}`, { stroke: '$pop', sw: 0.24, opacity: 0.55 }),
            art('glass', hang.x, hang.y, hang.w, hang.h, BULB_GLASS, { vb: hang.vb, stroke: '$pop', sw: 0.3, join: 'round' }),
            art('fil', hang.x, hang.y, hang.w, hang.h, BULB_FILAMENT, {
              vb: hang.vb,
              stroke: '$pop',
              sw: 0.2,
              opacity: 0.55,
              join: 'round',
              cap: 'round',
            }),
            art('cap', hang.x, hang.y, hang.w, hang.h, BULB_CAP, { vb: hang.vb, fill: '$pop', opacity: 0.55 }),
            QR('qr', W - 31, 20.8, 26, { r: 1 }),
            LOGO('logo', 5, 5.6, 10.4, '$pop', { stack: 'brand', align: 'left' }),
            T('co', '{company}', 5, 50, 17, {
              stack: 'brand',
              font: 'bricolage',
              weight: 800,
              fill: '$pop',
              minSize: 10,
              maxLines: 3,
              lineHeight: 1.02,
            }),
            T('phone', '{phone}', 5, 50, 13, {
              stack: 'brand',
              weight: 800,
              fill: '$roomText',
              minSize: 9,
              noWrap: true,
              lineHeight: 1.15,
            }),
            T('hours', '{hours}', 5, 50, 6.4, {
              stack: 'brand',
              weight: 500,
              fill: '$roomText',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.2,
              optional: true,
            }),
          ],
        },
      },
    };
  })(),

  // Tap Tap: a dripping tap, each drop heavier than the last, and your details on the water it has made. The back is the flood.
  (() => {
    const mouth = 29.2;
    const pool = 48;
    const drops = drop(mouth, 27, 3.4) + drop(mouth, 32, 5) + drop(mouth, 38.4, 7);
    const tx = 4.6;
    const tw = W_V - 9.2;
    return {
      id: 'tap-tap',
      name: 'Tap Tap',
      category: 'trades',
      tags: ['plumber', 'plumbing', 'sanitary', 'bathroom', 'leak', 'fitting'],
      orientation: 'vertical',
      fonts: { heading: 'baloo2', body: 'outfit' },
      palettes: [
        { label: 'Cream tile', sky: '#FFF5DC', water: '#0B66B5', foam: '#7FBDEB', metal: '#1B2A41', metal2: '#D1361B', on: '#FFFFFF' },
        { label: 'Mango', sky: '#FFC83A', water: '#10337F', foam: '#3F68C4', metal: '#10204A', metal2: '#D8232A', on: '#FFFFFF' },
        { label: 'Bathroom mint', sky: '#DDF3EA', water: '#0A7F73', foam: '#5DBFB3', metal: '#0E2F33', metal2: '#E4572E', on: '#FFFFFF' },
        { label: 'Midnight', sky: '#101A32', water: '#2F9BE8', foam: '#1D6FB0', metal: '#DCE5EF', metal2: '#FF6B4A', on: '#06122A' },
      ],
      sample: {
        name: 'Baldev Singh',
        title: 'Master Plumber',
        company: 'Singh Plumbing Works',
        phone: PHONE,
        website: 'singhplumbing.example',
        address: 'Model Town, Ludhiana',
      },
      sides: {
        front: {
          background: '$sky',
          stacks: {
            who: { x: tx, y: 51.6, w: tw, h: 18, anchor: 'top', gap: 0.5 },
            reach: { x: tx, y: 70, w: tw, h: 14.8, anchor: 'bottom', gap: 0.4 },
          },
          elements: [
            art('tap', 0, 1.4, W_V, H_V, TAP_BODY, { fill: '$metal' }),
            art('handle', 0, 1.4, W_V, H_V, TAP_HANDLE, { fill: '$metal2' }),
            art('drops', 0, 0, W_V, H_V, drops, { fill: '$water' }),
            art('pool', 0, 0, W_V, H_V, water(W_V, pool, H_V + B, 1.1, 5), { fill: '$water' }),
            art('ripple', 0, 0, W_V, H_V, ellipsePath(mouth, pool + 1.2, 6.4, 0.8) + ellipsePath(mouth, pool + 1.2, 3, 0.36), {
              stroke: '$foam',
              sw: 0.2,
            }),
            T('co', '{company}', tx, tw, 13, {
              stack: 'who',
              font: '$heading',
              weight: 800,
              fill: '$on',
              minSize: 9,
              maxLines: 2,
              lineHeight: 1.02,
            }),
            T('who', '{name}', tx, tw, 7.6, { stack: 'who', weight: 600, fill: '$on', minSize: 6.2, maxLines: 2, lineHeight: 1.15 }),
            T('role', '{title}', tx, tw, 6.2, { stack: 'who', fill: '$on', minSize: 5.6, maxLines: 2, lineHeight: 1.15, optional: true }),
            T('phone', '{phone}', tx, tw, 12.5, {
              stack: 'reach',
              font: '$heading',
              weight: 700,
              fill: '$on',
              minSize: 9,
              noWrap: true,
              lineHeight: 1.1,
            }),
            T('addr', '{address}', tx, tw, 6.2, { stack: 'reach', fill: '$on', minSize: 5.6, maxLines: 2, lineHeight: 1.15 }),
          ],
        },
        back: {
          background: '$sky',
          stacks: { brand: { x: tx, y: 46.6, w: tw, h: 38.2, anchor: 'middle', gap: 1.3 } },
          elements: [
            art('boat', 0, 0, W_V, H_V, paperBoat(19, 12.4, 1.14), { fill: '$metal2' }),
            art('flood', 0, 0, W_V, H_V, water(W_V, 11, H_V + B, 1, 5), { fill: '$water' }),
            QR('qr', W_V / 2 - 13, 17, 26, { r: 1, quiet: 1.4 }),
            LOGO('logo', W_V / 2 - 5.5, 47, 11, '$on', { stack: 'brand' }),
            T('co', '{company}', tx, tw, 12, {
              stack: 'brand',
              font: '$heading',
              weight: 800,
              fill: '$on',
              align: 'center',
              minSize: 9,
              maxLines: 3,
              lineHeight: 1.04,
            }),
            L('contact', ['email', 'website'], tx, tw, 6.5, {
              stack: 'brand',
              icons: false,
              align: 'center',
              weight: 500,
              fill: '$on',
              rowHeight: 1.6,
            }),
          ],
        },
      },
    };
  })(),

  // Room View: a one-point perspective room, and your details are what's on its far wall. The back is the same room repainted.
  (() => {
    const wx = FAR.x + 2.6;
    const ww = FAR.r - FAR.x - 5.2;
    const frontWalls = {
      ceil: '$ceil',
      left: '$left',
      right: '$right',
      wall: '$wall',
      tileA: '$tileA',
      tileB: '$tileB',
      sky: '$sky',
      brass: '$brass',
    };
    const backWalls = {
      ceil: '$wall',
      left: '$right',
      right: '$left',
      wall: '$left',
      tileA: '$tileB',
      tileB: '$wall',
      sky: '$sky',
      brass: '$brass',
    };
    const qx = FAR.x + 2.4;
    const bx = qx + 28;
    const bw = FAR.r - 2 - bx;
    return {
      id: 'room-view',
      name: 'Room View',
      category: 'professional',
      tags: ['interior designer', 'interiors', 'decor', 'home', 'furnishing', 'modular'],
      fonts: { heading: 'marcellus', body: 'outfit' },
      palettes: [
        {
          label: 'Terracotta',
          ceil: '#F6EBDC',
          left: '#B4552F',
          right: '#D07A4D',
          wall: '#FBF4E8',
          tileA: '#EFE1CC',
          tileB: '#3F2A20',
          sky: '#CFE6EC',
          brass: '#C0902F',
          ink: '#3A1F12',
        },
        {
          label: 'Peacock',
          ceil: '#EAF1EC',
          left: '#0F4C5C',
          right: '#1F6F78',
          wall: '#F6F3E7',
          tileA: '#EDE5CF',
          tileB: '#0B2B33',
          sky: '#F5E6B8',
          brass: '#D1A02E',
          ink: '#0B2B33',
        },
        {
          label: 'Aubergine',
          ceil: '#F7E7E3',
          left: '#4F1E45',
          right: '#7C3B66',
          wall: '#FBF0EC',
          tileA: '#EBD3CC',
          tileB: '#2A0F26',
          sky: '#F4D8C4',
          brass: '#D59A4C',
          ink: '#2F1029',
        },
        {
          label: 'Sage',
          ceil: '#EFF0E2',
          left: '#5B6B47',
          right: '#7F8F63',
          wall: '#F8F6EA',
          tileA: '#E7E2C8',
          tileB: '#2E3522',
          sky: '#F3EDC6',
          brass: '#B7842A',
          ink: '#262D1B',
        },
      ],
      sample: {
        name: 'Aisha Kapoor',
        title: 'Interior Designer',
        company: 'Kapoor Interiors',
        tagline: 'Same room. Different paint.',
        phone: PHONE,
        email: 'aisha@kapoorinteriors.example',
        website: 'kapoorinteriors.example',
        address: 'Jubilee Hills, Hyderabad',
      },
      sides: {
        front: {
          background: '$wall',
          stacks: { wall: { x: wx, y: FAR.y + 1.4, w: ww, h: FAR.b - FAR.y - 2.8, anchor: 'middle', gap: 0.7 } },
          elements: [
            ...roomElements(frontWalls, 'f'),
            T('name', '{name}', wx, ww, 15.5, {
              stack: 'wall',
              font: '$heading',
              fill: '$ink',
              align: 'center',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1.08,
            }),
            T('role', '{title}', wx, ww, 6.3, {
              stack: 'wall',
              weight: 500,
              fill: '$ink',
              align: 'center',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.18,
            }),
            T('co', '{company}', wx, ww, 6.3, {
              stack: 'wall',
              weight: 700,
              fill: '$ink',
              align: 'center',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.18,
              optional: true,
            }),
            box('rule', W / 2 - 5, 0, 10, 0.3, { fill: '$brass', stack: 'wall', gap: 1.2 }),
            L('contact', ['phone', 'email', 'website'], wx, ww, 6.5, {
              stack: 'wall',
              icons: false,
              align: 'center',
              fill: '$ink',
              rowHeight: 1.55,
              gap: 1,
            }),
          ],
        },
        back: {
          background: '$left',
          stacks: { brand: { x: bx, y: FAR.y + 1.8, w: bw, h: FAR.b - FAR.y - 3.6, anchor: 'middle', gap: 1.2 } },
          elements: [
            ...roomElements(backWalls, 'b'),
            QR('qr', qx, (FAR.y + FAR.b) / 2 - 13, 26, { quiet: 1.4 }),
            LOGO('logo', bx, FAR.y + 2, 8, '$wall', { stack: 'brand', align: 'left' }),
            T('co', '{company}', bx, bw, 10.5, {
              stack: 'brand',
              font: '$heading',
              fill: '$wall',
              minSize: 7.5,
              maxLines: 4,
              lineHeight: 1.08,
            }),
            T('tag', '{tagline}', bx, bw, 6.2, {
              stack: 'brand',
              fill: '$wall',
              minSize: 5.6,
              maxLines: 4,
              lineHeight: 1.16,
              optional: true,
            }),
          ],
        },
      },
    };
  })(),

  // Speedo: the phone number is on the odometer. On the back, the warning lights every driver worries about.
  (() => {
    const { cx, cy, R: dial } = DIAL;
    const winW = 26.4;
    const winH = 5.6;
    const winY = cy + 4.6;
    const lampY = 4.4;
    const lampS = 9.2;
    const lampGap = (W - 10 - 5 * lampS) / 4;
    const lx = (i) => 5 + i * (lampS + lampGap);
    return {
      id: 'speedo-dial',
      name: 'Speedo',
      category: 'trades',
      tags: ['garage', 'car repair', 'mechanic', 'service centre', 'auto', 'workshop'],
      fonts: { heading: 'bebas', body: 'spacegrotesk' },
      palettes: [
        {
          label: 'Night drive',
          dash: '#0C0D10',
          face: '#15171C',
          tick: '#F4F4F0',
          hot: '#FF5A1F',
          drum: '#F4F4F0',
          drumInk: '#0C0D10',
          text: '#F4F4F0',
          soft: '#A8ABB2',
          amber: '#FFB000',
          red: '#FF3B30',
        },
        {
          label: 'Racing red',
          dash: '#7C0F14',
          face: '#5C090E',
          tick: '#FFF6EA',
          hot: '#FFD400',
          drum: '#16090A',
          drumInk: '#FFF6EA',
          text: '#FFF6EA',
          soft: '#F4C9BE',
          amber: '#FFD400',
          red: '#FFFFFF',
        },
        {
          label: 'Vintage cream',
          dash: '#EFE6D2',
          face: '#FBF5E6',
          tick: '#1E1A14',
          hot: '#C8261B',
          drum: '#1E1A14',
          drumInk: '#FBF5E6',
          text: '#1E1A14',
          soft: '#6C6250',
          amber: '#B86B00',
          red: '#C8261B',
        },
        {
          label: 'Petrol blue',
          dash: '#06262F',
          face: '#0A3540',
          tick: '#E4F7F6',
          hot: '#3EF0D0',
          drum: '#E4F7F6',
          drumInk: '#06262F',
          text: '#E4F7F6',
          soft: '#8FC2C4',
          amber: '#FFC93C',
          red: '#FF6B5B',
        },
      ],
      sample: {
        name: 'Salim Sheikh',
        title: 'Head Mechanic',
        company: 'Sheikh Motor Garage',
        phone: PHONE,
        email: 'salim@sheikhmotors.example',
        website: 'sheikhmotors.example',
        address: 'MIDC Road, Aurangabad',
      },
      sides: {
        front: {
          background: '$dash',
          stacks: {
            who: { x: 4.8, y: 4.8, w: 31.8, h: 24, anchor: 'top' },
            reach: { x: 4.8, y: 29.4, w: 32.4, h: 16.8, anchor: 'bottom', gap: 0.7 },
            odo: { x: cx - winW / 2 + 0.6, y: winY, w: winW - 1.2, h: winH, anchor: 'middle' },
          },
          elements: [
            disc('face', cx - dial, cy - dial, 2 * dial, { fill: '$face', stroke: '$tick', sw: 0.28 }),
            art('minor', 0, 0, W, H, dialTicks(true), { stroke: '$tick', sw: 0.16 }),
            art('major', 0, 0, W, H, dialTicks(false), { stroke: '$tick', sw: 0.42 }),
            art('red', 0, 0, W, H, dialArc(6.4, 8, dial - 0.9), { stroke: '$hot', sw: 1.4 }),
            art('nums', 0, 0, W, H, dialNumbers(), { stroke: '$tick', sw: 0.3, cap: 'round', join: 'round' }),
            box('window', cx - winW / 2, winY, winW, winH, { r: 0.7, fill: '$drum' }),
            T('odo', '{phone}', cx - winW / 2 + 0.6, winW - 1.2, 8.2, {
              stack: 'odo',
              font: 'jetbrains',
              weight: 700,
              fill: '$drumInk',
              align: 'center',
              minSize: 6.5,
              noWrap: true,
              lineHeight: 1.1,
            }),
            art('needle', 0, 0, W, H, dialNeedle(1.25), { fill: '$hot' }),
            disc('hub', cx - 2.6, cy - 2.6, 5.2, { fill: '$tick' }),
            disc('hub2', cx - 1, cy - 1, 2, { fill: '$hot' }),
            T('co', '{company}', 4.8, 31.8, 25, {
              stack: 'who',
              font: '$heading',
              fill: '$text',
              minSize: 12,
              maxLines: 3,
              lineHeight: 0.98,
            }),
            T('name', '{name}', 4.8, 32.4, 7.6, {
              stack: 'reach',
              weight: 700,
              fill: '$text',
              minSize: 6.2,
              maxLines: 2,
              lineHeight: 1.15,
            }),
            T('role', '{title}', 4.8, 32.4, 6.2, {
              stack: 'reach',
              fill: '$soft',
              minSize: 5.6,
              maxLines: 2,
              lineHeight: 1.15,
              optional: true,
            }),
            T('addr', '{address}', 4.8, 32.4, 6, {
              stack: 'reach',
              fill: '$soft',
              minSize: 5.6,
              maxLines: 3,
              lineHeight: 1.18,
              optional: true,
            }),
          ],
        },
        back: {
          background: '$dash',
          stacks: { brand: { x: 5, y: 15.4, w: 49.6, h: 30.8, anchor: 'bottom', gap: 1 } },
          elements: [
            lamp('l0', 'engine', lx(0), lampY, lampS, '$amber'),
            lamp('l1', 'oil', lx(1), lampY, lampS, '$red'),
            lamp('l2', 'battery', lx(2), lampY, lampS, '$red'),
            lamp('l3', 'temp', lx(3), lampY, lampS, '$red'),
            lamp('l4', 'brake', lx(4), lampY, lampS, '$amber'),
            LOGO('logo', 5, 19, 7, '$text', { stack: 'brand', align: 'left' }),
            T('co2', '{company}', 5, 49.6, 19, {
              stack: 'brand',
              font: '$heading',
              fill: '$text',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1,
            }),
            T('phone', '{phone}', 5, 49.6, 11, { stack: 'brand', weight: 700, fill: '$hot', minSize: 8, noWrap: true, lineHeight: 1.15 }),
            L('contact', ['email', 'website'], 5, 49.6, 6.6, { stack: 'brand', icons: false, fill: '$text', rowHeight: 1.55 }),
            QR('qr', W - 31, 20.8, 26, { r: 0.8 }),
          ],
        },
      },
    };
  })(),

  // Truck Art: the hand-painted tailboard of an Indian truck, with your firm's name where the owner's would be.
  (() => {
    return {
      id: 'horn-ok',
      name: 'Truck Art',
      category: 'trades',
      tags: ['transport', 'logistics', 'truck', 'cargo', 'courier', 'movers', 'packers'],
      fonts: { heading: 'yatra', body: 'dmsans' },
      palettes: [
        {
          label: 'Highway',
          base: '#0E7C86',
          panel: '#FFD21F',
          a: '#E6176B',
          b: '#FFFFFF',
          c: '#F2711C',
          ink: '#1A1208',
          on: '#FFFFFF',
          road: '#FFD21F',
          roadInk: '#111111',
        },
        {
          label: 'Marigold',
          base: '#F2711C',
          panel: '#14398E',
          a: '#FFD21F',
          b: '#FFFFFF',
          c: '#D81B60',
          ink: '#FFF4D0',
          on: '#1A1208',
          road: '#FFD21F',
          roadInk: '#111111',
        },
        {
          label: 'Parrot',
          base: '#2E9E3F',
          panel: '#FFF3C4',
          a: '#D81B3A',
          b: '#FFD21F',
          c: '#14398E',
          ink: '#7A0E1C',
          on: '#FFFFFF',
          road: '#FFD21F',
          roadInk: '#111111',
        },
        {
          label: 'Rani pink',
          base: '#C2185B',
          panel: '#FFF0D6',
          a: '#16A5A5',
          b: '#FFD21F',
          c: '#3F1D8A',
          ink: '#3F1D8A',
          on: '#FFFFFF',
          road: '#111111',
          roadInk: '#FFD21F',
        },
      ],
      sample: {
        name: 'Gurdeep Gill',
        title: 'Fleet Owner',
        company: 'Gill Roadways',
        phone: PHONE,
        email: 'gurdeep@gillroadways.example',
        website: 'gillroadways.example',
        address: 'Transport Nagar, Indore',
      },
      sides: {
        front: {
          background: '$base',
          stacks: {
            plate: { x: 15.4, y: 8, w: W - 30.8, h: 16.2, anchor: 'middle', gap: 0.5 },
            lower: { x: 12.4, y: 27, w: W - 24.8, h: 15.6, anchor: 'middle', gap: 0.5 },
          },
          elements: [
            box('fringetop', -B, -B, W + 2 * B, B + 1.2, { fill: '$c' }),
            art('fringe', 0, 0, W, H, scallops(1.2, 2.22), { fill: '$a' }),
            art('beads', 0, 0, W, H, beads(1.9, 0.5, 4.44), { fill: '$b' }),
            box('plate', 12.5, 6.4, W - 25, 19.4, { fill: '$panel', r: 2.4, stroke: '$b', sw: 0.5 }),
            box('plate2', 13.5, 7.4, W - 27, 17.4, { r: 1.6, stroke: '$a', sw: 0.24 }),
            ...flowerAt('fl', 5.4, 16, 6.2, '$b', '$a', '$panel'),
            ...flowerAt('fr', W - 5.4, 16, 6.2, '$b', '$a', '$panel'),
            ...flowerAt('gl', 5.6, 32.4, 4.6, '$panel', '$c', '$b'),
            ...flowerAt('gr', W - 5.6, 32.4, 4.6, '$panel', '$c', '$b'),
            T('co', '{company}', 15.4, W - 30.8, 21, {
              stack: 'plate',
              font: '$heading',
              fill: '$ink',
              align: 'center',
              minSize: 11,
              maxLines: 2,
              lineHeight: 1.04,
            }),
            T('phone', '{phone}', 15.4, W - 30.8, 9.4, {
              stack: 'plate',
              weight: 800,
              fill: '$ink',
              align: 'center',
              minSize: 7.5,
              noWrap: true,
              lineHeight: 1.1,
            }),
            T('name', '{name}', 12.4, W - 24.8, 11, {
              stack: 'lower',
              weight: 800,
              fill: '$on',
              align: 'center',
              minSize: 8,
              maxLines: 2,
              lineHeight: 1.1,
            }),
            T('role', '{title}', 12.4, W - 24.8, 6.8, {
              stack: 'lower',
              weight: 500,
              fill: '$on',
              align: 'center',
              minSize: 5.8,
              maxLines: 2,
              lineHeight: 1.16,
            }),
            art('road', 0, 0, W, H, `M-3 44.6H${W + 3}V${H + 3}H-3Z`, { fill: '$road' }),
            art('stripes', 0, 0, W, H, hazard(44.6, H + B - 44.6), { fill: '$roadInk' }),
            ...reflector('rl', 6.2, 44.4, 2.6),
            ...reflector('rr', W - 6.2, 44.4, 2.6),
          ],
        },
        back: {
          background: '$panel',
          stacks: { brand: { x: 5, y: 6.6, w: 50.4, h: 34, anchor: 'middle', gap: 1.1 } },
          elements: [
            box('fringetop', -B, -B, W + 2 * B, B + 1, { fill: '$a' }),
            art('fringe', 0, 0, W, H, scallops(1, 2.22), { fill: '$base' }),
            art('beads', 0, 0, W, H, beads(1.7, 0.5, 4.44), { fill: '$b' }),
            LOGO('logo', 5, 6.6, 10, '$ink', { stack: 'brand', align: 'left' }),
            T('co2', '{company}', 5, 50.4, 12, {
              stack: 'brand',
              font: '$heading',
              fill: '$ink',
              minSize: 9,
              maxLines: 2,
              lineHeight: 1.08,
            }),
            L('contact', ['email', 'website', 'address'], 5, 50.4, 6.6, {
              stack: 'brand',
              icons: false,
              weight: 500,
              fill: '$ink',
              rowHeight: 1.55,
            }),
            QR('qr', W - 31, 7.8, 26, { quiet: 1.4 }),
            art('road', 0, 0, W, H, `M-3 42.4H${W + 3}V${H + 3}H-3Z`, { fill: '$road' }),
            art('stripes', 0, 0, W, H, hazard(42.4, H + B - 42.4), { fill: '$roadInk' }),
          ],
        },
      },
    };
  })(),

  // Press Sheet: a printer's registration mark blown up huge, with its four plates slightly out of line.
  (() => {
    const cx = 77;
    const cy = H / 2;
    const mark = regMark(cx, cy, 20);
    const sheet = (id, dx, dy, stroke) => art(id, dx, dy, W, H, mark, { stroke, sw: 1.15 });
    const toneC = (x, y) => Math.pow(Math.max(0, 1 - Math.hypot(x, y) / 1.15), 1.1);
    const toneM = (x, y) => Math.pow(Math.max(0, 1 - Math.hypot(x - 1, y - 0.1) / 1.1), 1.1);
    const toneY = (x, y) => Math.pow(Math.max(0, 1 - Math.hypot(x - 0.5, y - 1) / 1), 1.1);
    const bw = W + 2 * B;
    const bh = H + 2 * B;
    const pw = 68;
    const px = (W - pw) / 2;
    const ph = 34;
    return {
      id: 'press-sheet',
      name: 'Press Sheet',
      category: 'trades',
      tags: ['printing', 'press', 'signage', 'flex', 'offset', 'graphics'],
      fonts: { heading: 'montserrat', body: 'dmsans' },
      palettes: [
        { label: 'Process', paper: '#FFFFFF', c: '#00AEEF', m: '#EC008C', y: '#FFE600', k: '#111111' },
        { label: 'Riso', paper: '#F6F0E2', c: '#2F5BEA', m: '#FF4F6E', y: '#FFB000', k: '#1B1B3A' },
        { label: 'Newsprint', paper: '#EFEBDD', c: '#7A8A8C', m: '#D1291C', y: '#D9BE5A', k: '#161616' },
        { label: 'Blackplate', paper: '#F4F6F5', c: '#00B8A9', m: '#6A2CF0', y: '#F7E04B', k: '#0C1020' },
      ],
      sample: {
        name: 'Harpreet Sethi',
        title: 'Press Manager',
        company: 'Sethi Offset & Signs',
        phone: PHONE,
        email: 'harpreet@sethioffset.example',
        website: 'sethioffset.example',
        address: 'Naraina Industrial Area, Delhi',
      },
      sides: {
        front: {
          background: '$paper',
          stacks: {
            who: { x: 5.6, y: 5.6, w: 44, h: 16, anchor: 'top' },
            reach: { x: 5.6, y: 22, w: 44, h: 20, anchor: 'bottom', gap: 0.6 },
          },
          elements: [
            sheet('plateY', 0.95, 0.7, '$y'),
            sheet('plateC', -0.95, 0.35, '$c'),
            sheet('plateM', 0.55, -0.85, '$m'),
            sheet('plateK', 0, 0, '$k'),
            art('crop', 0, 0, W, H, cropTicks(W, H), { stroke: '$k', sw: 0.14 }),
            T('co', '{company}', 5.6, 44, 16, {
              stack: 'who',
              font: '$heading',
              weight: 800,
              fill: '$k',
              minSize: 10,
              maxLines: 3,
              lineHeight: 1.02,
            }),
            T('name', '{name}', 5.6, 44, 7.6, {
              stack: 'reach',
              font: '$heading',
              weight: 700,
              fill: '$k',
              minSize: 6.5,
              maxLines: 2,
              lineHeight: 1.12,
            }),
            T('role', '{title}', 5.6, 44, 6.2, { stack: 'reach', fill: '$k', minSize: 5.6, maxLines: 2, lineHeight: 1.16, optional: true }),
            L('contact', ['phone', 'email', 'website'], 5.6, 44, 6.4, { stack: 'reach', icons: false, fill: '$k', rowHeight: 1.5, gap: 1 }),
            ...colourBar(5.6, 43.2, 2.1, ['$c', '$m', '$y', '$k']),
          ],
        },
        back: {
          background: '$paper',
          stacks: { brand: { x: px + 30.4, y: H / 2 - ph / 2 + 2.6, w: pw - 33, h: ph - 5.2, anchor: 'middle', gap: 1.2 } },
          elements: [
            ...halftoneLayers('hy', bw, bh, 8, 3, toneY, '$y'),
            ...halftoneLayers('hc', bw, bh, 68, 3, toneC, '$c'),
            ...halftoneLayers('hm', bw, bh, 38, 3, toneM, '$m'),
            box('plate', px, H / 2 - ph / 2, pw, ph, { fill: '#FFFFFF' }),
            QR('qr', px + 2.6, H / 2 - 13, 26, { quiet: 1 }),
            LOGO('logo', px + 30.4, 10, 8.6, '$k', { stack: 'brand', align: 'left' }),
            T('co2', '{company}', px + 30.4, pw - 33, 10.5, {
              stack: 'brand',
              font: '$heading',
              weight: 800,
              fill: '$k',
              minSize: 7.5,
              maxLines: 3,
              lineHeight: 1.06,
            }),
            T('site', '{address}', px + 30.4, pw - 33, 6.2, {
              stack: 'brand',
              fill: '#111111',
              minSize: 5.6,
              maxLines: 4,
              lineHeight: 1.18,
              optional: true,
            }),
          ],
        },
      },
    };
  })(),
];
