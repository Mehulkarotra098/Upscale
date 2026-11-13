// Text blocks and drawing helpers shared by the illustrated sets (set-9 and set-10).
import { L, LOGO, T } from './kit.js';

export const VW = 50.8; // a vertical card is the same sheet turned: 50.8 wide, 88.9 tall
export const VH = 88.9;
export const n = (v) => Math.round(v * 100) / 100;

/** A path with its own box, so a gradient runs across the shape and not across the whole card. */
export const P = (id, d, [x, y, w, h], o = {}) => ({ id, type: 'path', x, y, w, h, vb: [x, y, w, h], d, ...o });
export const circle = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
export const poly = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
export const line = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}`;

/** Turn a point about a centre. Positive angles turn clockwise on the card. */
export function turn([x, y], deg, [cx, cy] = [0, 0]) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
}

/** A rounded rectangle turned about a centre. */
export function roundRect(x, y, w, h, r, deg = 0, c = [x + w / 2, y + h / 2]) {
  const p = (px, py) => turn([px, py], deg, c).map(n).join(' ');
  const a = `A${n(r)} ${n(r)} 0 0 1 `;
  return (
    `M${p(x + r, y)}L${p(x + w - r, y)}${a}${p(x + w, y + r)}L${p(x + w, y + h - r)}${a}${p(x + w - r, y + h)}` +
    `L${p(x + r, y + h)}${a}${p(x, y + h - r)}L${p(x, y + r)}${a}${p(x + r, y)}Z`
  );
}

/** The same numbers every build, so art never changes between runs. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A smooth open curve through points. */
export function smooth(pts) {
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}

/** Name, job and business, flowing in one stack. */
export const who = (stack, x, w, o = {}) => [
  T('name', '{name}', x, w, o.size ?? 14.5, {
    stack,
    font: '$heading',
    weight: o.weight ?? 700,
    fill: o.ink ?? '$ink',
    minSize: 9.5,
    maxLines: 2,
    lineHeight: 1.1,
    align: o.align,
    ...o.name,
  }),
  T('title', '{title}', x, w, o.small ?? 7.4, {
    stack,
    fill: o.soft ?? '$soft',
    minSize: 6,
    maxLines: 2,
    lineHeight: 1.2,
    align: o.align,
    ...o.title,
  }),
  T('company', '{company}', x, w, (o.small ?? 7.4) + 0.2, {
    stack,
    weight: 700,
    fill: o.accent ?? '$accent',
    minSize: 6,
    maxLines: 2,
    lineHeight: 1.2,
    optional: true,
    align: o.align,
    ...o.company,
  }),
];

/** The same block for a shop or studio: the business leads, then what it does, then the person. */
export const shop = (stack, x, w, o = {}) =>
  who(stack, x, w, {
    ...o,
    name: { text: '{company}', ...o.name },
    title: { text: '{tagline}', ...o.title },
    company: { text: '{name}', weight: 600, ...o.company },
  });

/** The contact rows. */
export const reach = (stack, x, w, o = {}) =>
  L('contact', o.items ?? ['phone', 'email', 'website', 'address'], x, w, o.size ?? 6.8, {
    stack,
    fill: o.ink ?? '$ink',
    iconFill: o.accent ?? '$accent',
    align: o.align,
    ...o.list,
  });

/** Logo, business name and tagline for the back. */
export const brand = (stack, x, w, o = {}) => [
  LOGO('logo', x, 0, o.logo ?? 12, o.mark ?? '$mark', { stack, align: o.align ?? 'left' }),
  T('company', '{company}', x, w, o.size ?? 14, {
    stack,
    font: '$heading',
    weight: o.weight ?? 700,
    fill: o.mark ?? '$mark',
    minSize: 9,
    maxLines: 3,
    lineHeight: 1.12,
    align: o.align,
  }),
  T('tagline', '{tagline}', x, w, 7.2, {
    stack,
    fill: o.soft ?? o.mark ?? '$mark',
    minSize: 6,
    maxLines: 2,
    lineHeight: 1.25,
    optional: true,
    align: o.align,
  }),
];

/** Paint shorthands. A gradient runs bottom to top at angle 0, and turns clockwise from there. */
export const grad = (angle, ...stops) => ({ type: 'linear', angle, stops: stops.map((c, i) => [i / (stops.length - 1), c]) });
export const glow = (cx, cy, r, ...stops) => ({
  type: 'radial',
  cx,
  cy,
  r,
  stops: stops.map((c, i) => (Array.isArray(c) ? c : [i / (stops.length - 1), c])),
});
export const stroke = (colour, sw, o = {}) => ({ fill: 'none', stroke: colour, sw, cap: 'round', join: 'round', ...o });

/** A four-point sparkle. */
export function sparkle(cx, cy, r) {
  const k = r * 0.2;
  return (
    `M${n(cx)} ${n(cy - r)}Q${n(cx + k)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + r)}` +
    `Q${n(cx - k)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - r)}Z`
  );
}
