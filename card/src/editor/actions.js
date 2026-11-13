// What the editor can do to a design: details, templates, adding elements, ordering, importing images.
import { cardSize, inkBoxes, resolveSide, SIZE } from '../core/render.js';
import { hasEmoji } from '../core/text.js';
import { commit, commitTyping, newId, replaceDoc, setUi, state } from './store.js';

export const FIELDS = ['name', 'title', 'company', 'tagline', 'phone', 'whatsapp', 'email', 'website', 'address', 'hours'];

/** Effective details are the user's, with the template's sample filling whatever they haven't touched. */
export function applyFields(doc, sample) {
  const out = {};
  for (const k of FIELDS) {
    const v = doc.user?.[k] ?? sample?.[k];
    if (v) out[k] = v;
  }
  if (doc.fields?.logo) {
    out.logo = doc.fields.logo;
    out.logoW = doc.fields.logoW;
    out.logoH = doc.fields.logoH;
  }
  doc.fields = out;
}

export function sampleFor(templates) {
  return templates?.find((t) => t.id === state.doc?.template)?.sample;
}

export function setField(key, value, templates) {
  if (hasEmoji(value)) return false;
  commitTyping(`field:${key}`, (d) => {
    d.user = { ...d.user, [key]: value };
    applyFields(d, templates?.find((t) => t.id === d.template)?.sample);
  });
  return true;
}

/** Fields still showing a template's invented sample details. */
export function leftoverSample(doc) {
  return FIELDS.filter((k) => doc.fields?.[k] && doc.user?.[k] == null);
}

export function clearSample(templates) {
  commit((d) => {
    d.user = { ...d.user };
    for (const k of leftoverSample(d)) d.user[k] = '';
    applyFields(d, templates?.find((t) => t.id === d.template)?.sample);
  });
}

// What someone chose for their QR code, which should follow them to a new design. Fixed colours come too; a design's
// named colours don't, because the new design has its own.
const QR_CHOICES = [
  'data',
  'qrKind',
  'qrIn',
  'keepBlank',
  'body',
  'frame',
  'ball',
  'qrLogo',
  'qrSrc',
  'qrIcon',
  'qrLogoSize',
  'imgW',
  'imgH',
];
const fixedColour = (p) => typeof p === 'string' && p[0] === '#';
function carryQr(old, next) {
  const mine = Object.values(old?.sides ?? {})
    .flatMap((s) => s.elements)
    .find(
      (e) => e.type === 'qr' && (e.qrIn?.value || (e.qrKind && e.qrKind !== 'link') || e.data || e.body || e.frame || e.ball || e.qrLogo),
    );
  if (!mine) return;
  for (const side of Object.values(next.sides)) {
    for (const e of side.elements) {
      if (e.type !== 'qr') continue;
      for (const k of QR_CHOICES) {
        if (mine[k] !== undefined) e[k] = structuredClone(mine[k]);
        else delete e[k];
      }
      for (const k of ['frameColor', 'ballColor']) if (fixedColour(mine[k])) e[k] = mine[k];
    }
  }
}

export function applyTemplate(template, instantiate, paletteIndex = 0) {
  const old = state.doc;
  const next = instantiate(template, { palette: paletteIndex });
  carryQr(old, next);
  next.user = old?.user ?? {};
  next.fields = { ...next.fields };
  if (old?.fields?.logo) {
    next.fields.logo = old.fields.logo;
    next.fields.logoW = old.fields.logoW;
    next.fields.logoH = old.fields.logoH;
  }
  if (old?.lang && !template.lang) next.lang = old.lang;
  applyFields(next, template.sample);
  replaceDoc(next);
  setUi({ side: 'front', selection: [] });
}

function readableInk(doc, sideName) {
  const bg = doc.sides[sideName].background;
  const hex =
    typeof bg === 'string'
      ? bg[0] === '$'
        ? doc.palette[bg.slice(1)]
        : bg
      : bg?.stops?.[0]?.[1]?.[0] === '$'
        ? doc.palette[bg.stops[0][1].slice(1)]
        : bg?.stops?.[0]?.[1];
  if (!hex || hex[0] !== '#') return '#111111';
  const n = parseInt(hex.slice(1, 7).padEnd(6, '0'), 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum > 140 ? '#111111' : '#FFFFFF';
}

let engine = null;
/** Moving and aligning work from what's really on the card, which needs the text engine. */
/** Details someone typed that this design has no place for on either side. */
export function hiddenDetails(doc) {
  const typed = Object.entries(doc.user ?? {})
    .filter(([, v]) => String(v ?? '').trim())
    .map(([k]) => k);
  const shown = new Set();
  for (const side of Object.values(doc.sides)) {
    for (const e of side.elements) {
      if (e.hidden) continue;
      if (e.type === 'list') e.items.forEach((k) => shown.add(k));
      if (e.type === 'text') for (const m of String(e.text ?? '').matchAll(/\{(\w+)\}/g)) shown.add(m[1]);
    }
  }
  return typed.filter((k) => !shown.has(k));
}

export function setEngine(e) {
  engine = e;
}
const resolved = () => {
  const { ops, boxes } = resolveSide(state.doc, state.side, engine);
  return { boxes, inks: inkBoxes(ops) };
};
/** Pin an element where it's currently drawn, so it can move on its own without leaving its stack behind. */
function release(e, box) {
  if (box) {
    e.x = box.x;
    e.y = box.y;
  }
  delete e.below;
  delete e.stack;
}

/** The emptiest place for something new, so it doesn't land on top of the name or the phone number. */
function freeSpot(d, itemW, itemH, prefer) {
  const { w, h } = cardSize(d);
  const { boxes, inks } = resolved();
  const taken = d.sides[state.side].elements
    .filter((e) => !e.locked && !e.hidden)
    .map((e) => inks[e.id] ?? boxes[e.id])
    .filter(Boolean);
  const m = SIZE.safe;
  const cands = [];
  for (let y = m; y + itemH <= h - m + 0.01; y += 2) for (let x = m; x + itemW <= w - m + 0.01; x += 2) cands.push({ x, y });
  if (!cands.length) return { x: Math.max(m, (w - itemW) / 2), y: Math.max(m, (h - itemH) / 2) };
  const overlap = (c) =>
    taken.reduce((sum, b) => {
      const ox = Math.min(c.x + itemW, b.x + b.w) - Math.max(c.x, b.x);
      const oy = Math.min(c.y + itemH, b.y + b.h) - Math.max(c.y, b.y);
      return sum + (ox > 0 && oy > 0 ? ox * oy : 0);
    }, 0);
  const lean = (c) => (prefer === 'corner' ? -(c.x + c.y) * 0.001 : Math.hypot(c.x + itemW / 2 - w / 2, c.y + itemH / 2 - h / 2) * 0.001);
  return cands.reduce(
    (best, c) => {
      const score = overlap(c) + lean(c);
      return score < best.score ? { ...c, score } : best;
    },
    { score: Infinity },
  );
}

/** What a newly added text box says until the person types their own. */
export const NEW_TEXT = 'Your text';

export function addElement(partial) {
  const id = newId(partial.type);
  commit((d) => {
    const { w, h } = cardSize(d);
    const ink = readableInk(d, state.side);
    const defaults = {
      text: { text: NEW_TEXT, x: w * 0.2, y: h * 0.4, w: w * 0.6, size: 12, weight: 600, font: '$body', fill: ink, minSize: 5.5 },
      rect: { x: w * 0.35, y: h * 0.3, w: w * 0.3, h: h * 0.4, fill: ink, r: 0 },
      ellipse: { x: w / 2 - 8, y: h / 2 - 8, w: 16, h: 16, fill: ink },
      line: { x: w * 0.25, y: h / 2, w: w * 0.5, h: 0, stroke: ink, sw: 0.35 },
      icon: { x: w / 2 - 5, y: h / 2 - 5, w: 10, stroke: ink, sw: 2 },
      qr: { x: w - 26, y: h - 26, w: 22, data: '', qrKind: 'link', qrIn: {}, light: '#FFFFFF', dark: '#111111', quiet: 2 },
      image: { x: w * 0.3, y: h * 0.2, w: 24, h: 24, fit: 'contain' },
      list: {
        x: 6,
        y: h * 0.55,
        w: w - 12,
        items: ['phone', 'email', 'website'],
        size: 6.6,
        fill: ink,
        iconFill: ink,
        font: '$body',
        rowHeight: 1.75,
        minSize: 5.5,
      },
      logo: { x: 6, y: 6, w: 16, h: 16, fallbackSize: 22, fallbackFont: '$heading', fill: ink },
    }[partial.type];
    const el = { id, ...defaults, ...partial };
    if (partial.x == null && engine) {
      const spot = freeSpot(d, el.w ?? 20, el.h ?? el.w ?? (el.type === 'text' ? 6 : 10), el.type === 'qr' ? 'corner' : 'centre');
      el.x = spot.x;
      el.y = spot.y;
    }
    d.sides[state.side].elements.push(el);
  });
  // New text is ready to type into straight away on a wide screen. On a phone the edit sheet opens instead,
  // because the on-card box and the keyboard together would hide the card.
  const typeNow = partial.type === 'text' && typeof matchMedia === 'function' && matchMedia('(min-width: 900px)').matches;
  setUi({ selection: [id], sheet: 'edit', sheetOpen: true, editText: typeNow ? id : null });
  return id;
}

export function updateElement(id, patch, typingKey) {
  const fn = (d) => {
    const el = d.sides[state.side].elements.find((e) => e.id === id);
    if (el) Object.assign(el, patch);
  };
  if (typingKey) commitTyping(typingKey, fn);
  else commit(fn);
}

export function removeSelected() {
  const ids = new Set(state.selection);
  if (!ids.size) return;
  commit((d) => {
    d.sides[state.side].elements = d.sides[state.side].elements.filter((e) => !ids.has(e.id));
  });
  setUi({ selection: [] });
}

export function duplicateSelected() {
  const ids = new Set(state.selection);
  if (!ids.size) return;
  const made = [];
  const { boxes } = resolved();
  commit((d) => {
    const list = d.sides[state.side].elements;
    for (const e of list.filter((x) => ids.has(x.id))) {
      const id = newId(e.type);
      const { below: _below, stack: _stack, ...rest } = e;
      made.push(id);
      list.push({ ...rest, id, locked: false, x: (boxes[e.id]?.x ?? e.x) + 3, y: (boxes[e.id]?.y ?? e.y) + 3 });
    }
  });
  setUi({ selection: made });
}

export function reorderSelected(how) {
  const ids = new Set(state.selection);
  commit((d) => {
    const list = d.sides[state.side].elements;
    const chosen = list.filter((e) => ids.has(e.id));
    const rest = list.filter((e) => !ids.has(e.id));
    if (how === 'front') d.sides[state.side].elements = [...rest, ...chosen];
    else if (how === 'back') d.sides[state.side].elements = [...chosen, ...rest];
    else {
      const out = [...list];
      const step = how === 'up' ? 1 : -1;
      const order = step > 0 ? [...out.keys()].reverse() : [...out.keys()];
      for (const i of order) {
        const j = i + step;
        if (ids.has(out[i].id) && out[j] && !ids.has(out[j].id)) [out[i], out[j]] = [out[j], out[i]];
      }
      d.sides[state.side].elements = out;
    }
  });
}

/**
 * Line things up by what the eye sees, not by their invisible boxes.
 * One element aligns to the card's safe area. Several align to each other.
 */
export function alignSelected(how) {
  const ids = state.selection;
  if (!ids.length) return;
  const { boxes, inks } = resolved();
  const seen = (id) => inks[id] ?? boxes[id];
  const items = ids.filter(seen);
  const { w, h } = cardSize(state.doc);
  const m = SIZE.safe;
  let area = { x: m, y: m, w: w - 2 * m, h: h - 2 * m };
  if (items.length > 1) {
    const x0 = Math.min(...items.map((i) => seen(i).x));
    const y0 = Math.min(...items.map((i) => seen(i).y));
    const x1 = Math.max(...items.map((i) => seen(i).x + seen(i).w));
    const y1 = Math.max(...items.map((i) => seen(i).y + seen(i).h));
    area = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  commit((d) => {
    for (const id of items) {
      const e = d.sides[state.side].elements.find((x) => x.id === id);
      if (!e) continue;
      const v = seen(id);
      const box = boxes[id];
      let dx = 0;
      let dy = 0;
      if (how === 'left') dx = area.x - v.x;
      if (how === 'hcenter') dx = area.x + area.w / 2 - (v.x + v.w / 2);
      if (how === 'right') dx = area.x + area.w - (v.x + v.w);
      if (how === 'top') dy = area.y - v.y;
      if (how === 'vcenter') dy = area.y + area.h / 2 - (v.y + v.h / 2);
      if (how === 'bottom') dy = area.y + area.h - (v.y + v.h);
      release(e, { x: box.x + dx, y: box.y + dy });
    }
  });
}

/** Even out the gaps between three or more elements. */
export function distributeSelected(axis) {
  const ids = state.selection;
  if (ids.length < 3) return;
  const { boxes, inks } = resolved();
  const seen = (id) => inks[id] ?? boxes[id];
  const [pos, size] = axis === 'h' ? ['x', 'w'] : ['y', 'h'];
  const order = ids.filter(seen).sort((a, b) => seen(a)[pos] - seen(b)[pos]);
  const first = seen(order[0]);
  const last = seen(order.at(-1));
  const span = last[pos] + last[size] - first[pos];
  const used = order.reduce((a, id) => a + seen(id)[size], 0);
  const gap = (span - used) / (order.length - 1);
  commit((d) => {
    let at = first[pos];
    for (const id of order) {
      const e = d.sides[state.side].elements.find((x) => x.id === id);
      const delta = at - seen(id)[pos];
      release(e, axis === 'h' ? { x: boxes[id].x + delta, y: boxes[id].y } : { x: boxes[id].x, y: boxes[id].y + delta });
      at += seen(id)[size] + gap;
    }
  });
}

let clipboard = [];
export function copySelected() {
  const { boxes } = resolved();
  clipboard = state.doc.sides[state.side].elements
    .filter((e) => state.selection.includes(e.id))
    .map((e) => ({ ...structuredClone(e), x: boxes[e.id]?.x ?? e.x, y: boxes[e.id]?.y ?? e.y }));
  return clipboard.length;
}
export function pasteClipboard() {
  if (!clipboard.length) return;
  const made = [];
  commit((d) => {
    for (const e of clipboard) {
      const { below: _below, stack: _stack, ...rest } = structuredClone(e);
      const id = newId(e.type);
      made.push(id);
      d.sides[state.side].elements.push({ ...rest, id, locked: false, x: e.x + 3, y: e.y + 3 });
    }
  });
  setUi({ selection: made });
}
export function selectAll() {
  setUi({ selection: state.doc.sides[state.side].elements.filter((e) => !e.locked && !e.hidden).map((e) => e.id) });
}
export function unlockElement(id) {
  commit((d) => {
    const e = d.sides[state.side].elements.find((x) => x.id === id);
    if (e) e.locked = false;
  });
  setUi({ selection: [id], sheet: 'edit', sheetOpen: true });
}

export const CARD_SIZES = [
  { id: 'standard', label: '3.5 × 2 in (India standard)', w: 88.9, h: 50.8 },
  { id: 'eu', label: '85 × 55 mm', w: 85, h: 55 },
  { id: 'wide', label: '90 × 54 mm', w: 90, h: 54 },
];

/** Change the card's size, scaling the design to fill it. Vertical designs stay vertical. */
export function setCardSize(size) {
  commit((d) => {
    const old = cardSize(d);
    const vertical = d.orientation === 'vertical' && size.w !== size.h;
    const next = vertical ? { w: size.h, h: size.w } : { w: size.w, h: size.h };
    const sx = next.w / old.w;
    const sy = next.h / old.h;
    const k = Math.min(sx, sy);
    for (const side of Object.values(d.sides)) {
      for (const st of Object.values(side.stacks ?? {})) {
        st.x *= sx;
        st.w *= sx;
        st.y *= sy;
        st.h *= sy;
      }
      for (const e of side.elements) {
        if (e.type === 'path' && !e.vb) e.vb = [0, 0, e.w, e.h];
        e.x *= sx;
        e.y *= sy;
        if (e.type === 'qr' || e.type === 'icon') e.w *= k;
        else if (e.w != null) e.w *= sx;
        if (e.h != null) e.h *= sy;
        if (e.size) e.size *= k;
        if (e.minSize) e.minSize = Math.min(e.size, Math.max(5.5, e.minSize * k));
        if (e.fallbackSize) e.fallbackSize *= k;
      }
    }
    d.size = next;
  });
}

export function nudgeSelected(dx, dy) {
  const ids = new Set(state.selection);
  if (!ids.size) return;
  const { boxes } = resolved();
  commitTyping(`nudge:${[...ids].join()}`, (d) => {
    for (const e of d.sides[state.side].elements) {
      if (ids.has(e.id)) {
        const box = e.stack || e.below ? boxes[e.id] : null;
        release(e, box);
        e.x += dx;
        e.y += dy;
      }
    }
  });
}

/**
 * Read an uploaded image and redraw it as plain PNG or JPEG. That drops anything active hidden in an SVG, removes metadata,
 * and gives a format PDF export can embed. Vector logos are drawn at high resolution for the same reason.
 */
export async function readImage(file) {
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new Error('bad-type');
  if (file.size > 15e6) throw new Error('too-big');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const MAX = 2400;
    const nw = img.naturalWidth || 1200;
    const nh = img.naturalHeight || 1200;
    const isVector = file.type === 'image/svg+xml';
    const k = isVector ? MAX / Math.max(nw, nh) : Math.min(1, MAX / Math.max(nw, nh));
    const c = document.createElement('canvas');
    c.width = Math.round(nw * k);
    c.height = Math.round(nh * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const asJpeg = file.type === 'image/jpeg';
    const src = c.toDataURL(asJpeg ? 'image/jpeg' : 'image/png', 0.92);
    return { src, w: c.width, h: c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
