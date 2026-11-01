// Checks a design before it's used. Design files come from outside the page, so nothing in one is trusted:
// every value is rebuilt from an allow-list, and anything that could reach SVG markup is checked for shape.
import { ICONS } from './icons.js';
import { BALL_SHAPES, BODY_SHAPES, FRAME_SHAPES } from './qr.js';
import { FONTS } from './text.js';

const TYPES = new Set(['text', 'list', 'rect', 'ellipse', 'line', 'path', 'icon', 'qr', 'image', 'logo']);
const FIELD_KEYS = ['name', 'title', 'company', 'tagline', 'phone', 'whatsapp', 'email', 'website', 'address', 'hours'];
const LIST_ITEMS = new Set([...FIELD_KEYS]);
const FONT_IDS = new Set(FONTS.map((f) => f.id));
const NUMBERS = [
  'x',
  'y',
  'w',
  'h',
  'r',
  'sw',
  'size',
  'minSize',
  'maxLines',
  'weight',
  'lineHeight',
  'tracking',
  'opacity',
  'rot',
  'rowHeight',
  'gap',
  'quiet',
  'hangGapLatin',
  'fallbackSize',
  'fallbackWeight',
  'imgW',
  'imgH',
  'qrLogoSize',
];
const BOOLS = ['noWrap', 'upper', 'hang', 'evenodd', 'locked', 'hidden', 'optional'];
const ENUMS = {
  align: ['left', 'center', 'right'],
  valign: ['top', 'middle', 'bottom'],
  cap: ['butt', 'round', 'square'],
  join: ['miter', 'round', 'bevel'],
  fit: ['contain', 'cover'],
  clip: ['circle', 'rounded'],
  lang: ['hi', 'mr'],
  body: BODY_SHAPES,
  frame: FRAME_SHAPES,
  ball: BALL_SHAPES,
  qrKind: ['link', 'whatsapp', 'phone', 'sms', 'email', 'upi', 'wifi', 'maps', 'text'],
  qrLogo: ['card', 'own', 'icon'],
};
const QR_INPUTS = ['value', 'name', 'amount', 'msg', 'subject', 'pass'];
const LIMIT = { elements: 300, text: 2000, path: 400000 };

const isColour = (c) => typeof c === 'string' && (/^#[0-9a-fA-F]{3,8}$/.test(c) || /^\$\w{1,24}$/.test(c));
const isImage = (s) => typeof s === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(s);
const isPathData = (s) => typeof s === 'string' && s.length <= LIMIT.path && /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]*$/.test(s);
const num = (v, min = -5000, max = 5000) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : undefined);

function cleanPaint(p) {
  if (p === 'none') return 'none';
  if (isColour(p)) return p;
  if (p && typeof p === 'object' && Array.isArray(p.stops) && p.stops.length >= 2 && p.stops.length <= 12) {
    const stops = p.stops.filter((s) => Array.isArray(s) && num(s[0], 0, 1) != null && isColour(s[1])).map((s) => [num(s[0], 0, 1), s[1]]);
    if (stops.length < 2) return undefined;
    if (p.type === 'linear') return { type: 'linear', angle: num(p.angle, -360, 360) ?? 0, stops };
    if (p.type === 'radial')
      return { type: 'radial', cx: num(p.cx, -2, 3) ?? 0.5, cy: num(p.cy, -2, 3) ?? 0.5, r: num(p.r, 0, 5) ?? 0.5, stops };
  }
  return undefined;
}

const isFont = (f) => typeof f === 'string' && (/^\$(heading|body)$/.test(f) || FONT_IDS.has(f));
const str = (s, max = LIMIT.text) => (typeof s === 'string' ? s.slice(0, max) : undefined);

function cleanElement(raw, seen) {
  if (
    !raw ||
    typeof raw !== 'object' ||
    !TYPES.has(raw.type) ||
    typeof raw.id !== 'string' ||
    !/^[\w-]{1,40}$/.test(raw.id) ||
    seen.has(raw.id)
  )
    return null;
  seen.add(raw.id);
  const el = { id: raw.id, type: raw.type };
  for (const k of NUMBERS) {
    const v = num(raw[k]);
    if (v != null) el[k] = v;
  }
  for (const k of BOOLS) if (typeof raw[k] === 'boolean') el[k] = raw[k];
  for (const [k, allowed] of Object.entries(ENUMS)) if (allowed.includes(raw[k])) el[k] = raw[k];
  for (const k of ['fill', 'stroke', 'iconFill', 'dark', 'light', 'frameColor', 'ballColor']) {
    const v = cleanPaint(raw[k]);
    if (v != null) el[k] = v;
  }
  for (const k of ['font', 'fallbackFont']) if (isFont(raw[k])) el[k] = raw[k];
  if (raw.text != null) el.text = str(raw.text);
  if (raw.label != null) el.label = str(raw.label, 60);
  if (raw.below != null && /^[\w-]{1,40}$/.test(raw.below)) el.below = raw.below;
  if (raw.stack != null && /^[\w-]{1,24}$/.test(raw.stack)) el.stack = raw.stack;
  if (FIELD_KEYS.includes(raw.when)) el.when = raw.when;
  if (FIELD_KEYS.includes(raw.deva)) el.deva = raw.deva;
  if (Array.isArray(raw.dash))
    el.dash = raw.dash
      .map((d) => num(d, 0, 100))
      .filter((d) => d != null)
      .slice(0, 8);
  if (Array.isArray(raw.vb) && raw.vb.length === 4 && raw.vb.every((v) => num(v) != null)) el.vb = raw.vb.map(Number);
  if (raw.fallback === 'none') el.fallback = 'none';
  if (el.type === 'path') {
    if (!isPathData(raw.d)) return null;
    el.d = raw.d;
  }
  if (el.type === 'icon') {
    if (!Object.hasOwn(ICONS, raw.name)) return null;
    el.name = raw.name;
  }
  if (el.type === 'list') {
    el.items = Array.isArray(raw.items) ? raw.items.filter((i) => LIST_ITEMS.has(i)) : [];
    if (typeof raw.icons === 'boolean') el.icons = raw.icons;
  }
  if (el.type === 'qr') {
    el.data = str(raw.data, 1500) ?? '';
    if (raw.qrIn && typeof raw.qrIn === 'object') {
      el.qrIn = {};
      for (const k of QR_INPUTS) if (typeof raw.qrIn[k] === 'string') el.qrIn[k] = raw.qrIn[k].slice(0, 600);
    }
    if (isImage(raw.qrSrc)) el.qrSrc = raw.qrSrc;
    if (Object.hasOwn(ICONS, String(raw.qrIcon))) el.qrIcon = raw.qrIcon;
  }
  if (el.type === 'image') {
    if (!isImage(raw.src)) return null;
    el.src = raw.src;
  }
  return el;
}

function cleanSide(raw) {
  const seen = new Set();
  const elements = Array.isArray(raw?.elements)
    ? raw.elements
        .slice(0, LIMIT.elements)
        .map((e) => cleanElement(e, seen))
        .filter(Boolean)
    : [];
  const out = { background: cleanPaint(raw?.background) ?? '#FFFFFF', elements };
  if (raw?.stacks && typeof raw.stacks === 'object') {
    const stacks = {};
    for (const [name, st] of Object.entries(raw.stacks).slice(0, 12)) {
      if (!/^[\w-]{1,24}$/.test(name) || !st || typeof st !== 'object') continue;
      const box = { x: num(st.x), y: num(st.y), w: num(st.w), h: num(st.h) };
      if (Object.values(box).some((v) => v == null)) continue;
      stacks[name] = box;
      if (['top', 'middle', 'bottom'].includes(st.anchor)) stacks[name].anchor = st.anchor;
      if (num(st.gap, 0, 100) != null) stacks[name].gap = num(st.gap, 0, 100);
    }
    if (Object.keys(stacks).length) out.stacks = stacks;
  }
  return out;
}

/** Rebuild a design from untrusted data. Returns the clean design, or throws with a message a person can read. */
export function validateDesign(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== 1 || !raw.sides) throw new Error('This file is not a card design.');
  const palette = {};
  for (const [k, v] of Object.entries(raw.palette ?? {})) if (/^\w{1,24}$/.test(k) && isColour(v) && v[0] === '#') palette[k] = v;
  const fields = {};
  for (const k of FIELD_KEYS) if (typeof raw.fields?.[k] === 'string') fields[k] = raw.fields[k].slice(0, 400);
  if (isImage(raw.fields?.logo)) {
    fields.logo = raw.fields.logo;
    fields.logoW = num(raw.fields.logoW, 1, 20000) ?? 1;
    fields.logoH = num(raw.fields.logoH, 1, 20000) ?? 1;
  }
  const user = {};
  for (const k of FIELD_KEYS) if (typeof raw.user?.[k] === 'string') user[k] = raw.user[k].slice(0, 400);
  const fonts = {};
  for (const k of ['heading', 'body']) fonts[k] = FONT_IDS.has(raw.fonts?.[k]) ? raw.fonts[k] : 'inter';
  const doc = {
    v: 1,
    template: typeof raw.template === 'string' ? raw.template.slice(0, 60) : '',
    orientation: raw.orientation === 'vertical' ? 'vertical' : 'horizontal',
    lang: raw.lang === 'mr' ? 'mr' : 'hi',
    fonts,
    palette,
    fields,
    user,
    sides: { front: cleanSide(raw.sides.front), back: cleanSide(raw.sides.back) },
  };
  if (raw.size && num(raw.size.w, 20, 200) != null && num(raw.size.h, 20, 200) != null)
    doc.size = { w: num(raw.size.w, 20, 200), h: num(raw.size.h, 20, 200) };
  // Every colour token used must exist, or drawing would fail later.
  const tokens = JSON.stringify(doc.sides).match(/"\$\w+"/g) ?? [];
  for (const t of tokens) {
    const name = t.slice(2, -1);
    if (name !== 'heading' && name !== 'body' && !palette[name]) palette[name] = '#000000';
  }
  return doc;
}
