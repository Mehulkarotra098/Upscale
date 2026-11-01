// Building blocks for templates. Use these so that text can hold real details: see README.md.
export const W = 88.9;
export const H = 50.8;
export const B = 3;

/** A text element. Give it a `stack` so it flows with its neighbours instead of sitting at a fixed height. */
export const T = (id, text, x, w, size, o = {}) => ({ id, type: 'text', text, x, y: o.y ?? 0, w, size, minSize: o.minSize ?? 5.5, ...o });

/** Contact rows. Empty fields disappear, and a long address wraps to two lines. */
export const L = (id, items, x, w, size, o = {}) => ({
  id,
  type: 'list',
  items,
  x,
  y: o.y ?? 0,
  w,
  size,
  minSize: o.minSize ?? 5.5,
  rowHeight: 1.6,
  ...o,
});

export const R = (id, x, y, w, h, fill, o = {}) => ({ id, type: 'rect', x, y, w, h, fill, ...o });
export const E = (id, x, y, w, h, fill, o = {}) => ({ id, type: 'ellipse', x, y, w, h, fill, ...o });
export const LN = (id, x, y, w, stroke, sw = 0.25, o = {}) => ({ id, type: 'line', x, y, w, h: 0, stroke, sw, ...o });

/** Vector art. `d` is in the card's own millimetres unless `vb` says otherwise. */
export const A = (id, d, o = {}, w = W, h = H) => ({ id, type: 'path', x: 0, y: 0, w, h, d, ...o });

/** The user's logo, or their initials until they upload one. */
export const LOGO = (id, x, y, size, fill, o = {}) => ({
  id,
  type: 'logo',
  x,
  y,
  w: size,
  h: size,
  fill,
  fallbackFont: '$heading',
  fallbackWeight: 700,
  fallbackSize: size * 1.6,
  ...o,
});

/** A QR code, always dark on light. 26 mm or more for a full contact, because that makes a dense code. */
export const QR = (id, x, y, w = 26, o = {}) => ({
  id,
  type: 'qr',
  data: 'vcard',
  x,
  y,
  w,
  light: '#FFFFFF',
  dark: '#111111',
  quiet: 2,
  ...o,
});
