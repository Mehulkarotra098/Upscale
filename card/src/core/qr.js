// QR codes: what a code says, how its parts are shaped, and whether it should still scan.
// Everything is drawn as filled paths, so the live canvas, SVG, PNG and PDF all match.
import qrcode from 'qrcode-generator';

const f = (v) => String(Math.round(v * 1000) / 1000);
export const MIN_QR_MODULE_MM = 0.3;

/* ---------- What the code says ---------- */

export const normaliseUrl = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
const digits = (s) => String(s || '').replace(/[^\d+]/g, '');
const wifiEsc = (s) => String(s).replace(/([\\;,:"])/g, '\\$1');

/** wa.me needs the country code. Ten digits on their own is an Indian mobile number. */
export function waNumber(s) {
  const n = String(s || '').replace(/\D/g, '');
  return n.length === 10 ? `91${n}` : n;
}

/** Content types beyond the card's own contact details. Empty means the user hasn't filled in enough yet. */
export function kindPayload(kind, input = {}, fields = {}) {
  const v = (k) => String(input[k] ?? '').trim();
  switch (kind) {
    case 'link': {
      const u = v('value');
      if (!u) return '';
      return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : normaliseUrl(u);
    }
    case 'whatsapp': {
      const n = waNumber(v('value') || fields.whatsapp || fields.phone);
      if (!n) return '';
      return v('msg') ? `https://wa.me/${n}?text=${encodeURIComponent(v('msg'))}` : `https://wa.me/${n}`;
    }
    case 'phone': {
      const n = digits(v('value') || fields.phone);
      return n ? `tel:${n}` : '';
    }
    case 'sms': {
      const n = digits(v('value') || fields.phone);
      return n ? `SMSTO:${n}:${v('msg')}` : '';
    }
    case 'email': {
      const to = v('value') || String(fields.email || '').trim();
      if (!to) return '';
      return v('subject') ? `mailto:${to}?subject=${encodeURIComponent(v('subject'))}` : `mailto:${to}`;
    }
    case 'upi': {
      const id = v('value');
      if (!/^[\w.-]+@[\w.-]+$/.test(id)) return '';
      const name = v('name') || fields.company || fields.name || '';
      let out = `upi://pay?pa=${encodeURIComponent(id).replace('%40', '@')}&cu=INR`;
      if (name) out += `&pn=${encodeURIComponent(name)}`;
      if (/^\d+(\.\d{1,2})?$/.test(v('amount')) && Number(v('amount')) > 0) out += `&am=${v('amount')}`;
      return out;
    }
    case 'wifi': {
      const ssid = v('value');
      if (!ssid) return '';
      const pass = v('pass');
      return pass ? `WIFI:T:WPA;S:${wifiEsc(ssid)};P:${wifiEsc(pass)};;` : `WIFI:T:nopass;S:${wifiEsc(ssid)};;`;
    }
    case 'maps': {
      const place = v('value') || String(fields.address || '').trim();
      if (!place) return '';
      if (/^https?:\/\//i.test(place)) return place;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
    }
    case 'text':
      return v('value');
    default:
      return '';
  }
}

/* ---------- Building the matrix ---------- */

const LEVELS = ['H', 'Q', 'M', 'L'];

/**
 * Make the code at the strongest level that both fits the data and keeps modules printable.
 * A logo hides part of the code, so it needs error correction to stay readable and never drops below Q.
 * Returns null when the data can't fit in any QR code.
 */
export function buildMatrix(text, size, quiet, { logo = false } = {}) {
  // The library treats each character as one byte, so hand it UTF-8 bytes. Hindi names then scan correctly.
  const bytes = String.fromCharCode(...new TextEncoder().encode(text));
  const make = (level) => {
    try {
      const code = qrcode(0, level);
      code.addData(bytes, 'Byte');
      code.make();
      return code;
    } catch {
      return null; // Too much data for this level.
    }
  };
  const wanted = logo ? ['H', 'Q'] : ['M', 'L'];
  let best = null;
  for (const level of wanted) {
    const code = make(level);
    if (!code) continue;
    best = code;
    // Print is sharp, so when modules would be too small, trade some error correction for bigger modules.
    if (size / (code.getModuleCount() + quiet * 2) >= MIN_QR_MODULE_MM) break;
  }
  if (!best) {
    for (const level of LEVELS) {
      best = make(level);
      if (best) break;
    }
  }
  return best;
}

/* ---------- Shapes ---------- */

/** A rectangle with its own radius per corner, always drawn clockwise so overlapping shapes never cancel out. */
export function cornerRect(x, y, w, h, [tl, tr, br, bl] = [0, 0, 0, 0]) {
  const arc = (r, ex, ey) => (r > 0 ? `A${f(r)} ${f(r)} 0 0 1 ${f(ex)} ${f(ey)}` : '');
  return (
    `M${f(x + tl)} ${f(y)}L${f(x + w - tr)} ${f(y)}${arc(tr, x + w, y + tr)}` +
    `L${f(x + w)} ${f(y + h - br)}${arc(br, x + w - br, y + h)}` +
    `L${f(x + bl)} ${f(y + h)}${arc(bl, x, y + h - bl)}` +
    `L${f(x)} ${f(y + tl)}${arc(tl, x + tl, y)}Z`
  );
}

const circle = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx - r)} ${f(cy)}Z`;

const poly = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

/**
 * Module shapes. Each gets the cell box, its size, and `on(dr, dc)` to see its neighbours.
 * Square and bars are handled as runs instead, in bodyPath, to keep files small.
 */
const CELL = {
  gap: (x, y, m) => {
    const i = m * 0.08;
    return cornerRect(x + i, y + i, m - 2 * i, m - 2 * i);
  },
  rounded: (x, y, m) => {
    const r = m * 0.3;
    return cornerRect(x, y, m, m, [r, r, r, r]);
  },
  dots: (x, y, m) => circle(x + m / 2, y + m / 2, m * 0.47),
  blob: (x, y, m, on) => {
    const r = m * 0.5;
    const up = on(-1, 0);
    const down = on(1, 0);
    const left = on(0, -1);
    const right = on(0, 1);
    return cornerRect(x, y, m, m, [up || left ? 0 : r, up || right ? 0 : r, down || right ? 0 : r, down || left ? 0 : r]);
  },
  classy: (x, y, m, on) => {
    const r = m * 0.5;
    return cornerRect(x, y, m, m, [on(-1, 0) || on(0, -1) ? 0 : r, 0, on(1, 0) || on(0, 1) ? 0 : r, 0]);
  },
  leaf: (x, y, m) => {
    const r = m * 0.5;
    return cornerRect(x, y, m, m, [r, 0, r, 0]);
  },
  diamond: (x, y, m) => {
    const c = m / 2;
    const r = m * 0.66;
    return poly([
      [x + c, y + c - r],
      [x + c + r, y + c],
      [x + c, y + c + r],
      [x + c - r, y + c],
    ]);
  },
  plus: (x, y, m) => {
    const a = m * 0.2;
    const b = m * 0.8;
    return poly([
      [x + a, y],
      [x + b, y],
      [x + b, y + a],
      [x + m, y + a],
      [x + m, y + b],
      [x + b, y + b],
      [x + b, y + m],
      [x + a, y + m],
      [x + a, y + b],
      [x, y + b],
      [x, y + a],
      [x + a, y + a],
    ]);
  },
  octagon: (x, y, m) => {
    const a = m * 0.26;
    return poly([
      [x + a, y],
      [x + m - a, y],
      [x + m, y + a],
      [x + m, y + m - a],
      [x + m - a, y + m],
      [x + a, y + m],
      [x, y + m - a],
      [x, y + a],
    ]);
  },
};

export const BODY_SHAPES = ['square', 'gap', 'rounded', 'dots', 'blob', 'classy', 'leaf', 'hbars', 'vbars', 'diamond', 'plus', 'octagon'];
export const FRAME_SHAPES = ['square', 'rounded', 'round', 'circle', 'leaf', 'leafout', 'pinch', 'dots'];
// Diamond, nine-dot and bar eye centres were tried and removed: scanners find a code by its eyes, and those didn't read.
export const BALL_SHAPES = ['square', 'rounded', 'circle', 'leaf', 'leafout', 'pinch'];

/** `dark(r, c)` says whether a module should be drawn at all, so finder zones and the logo plate stay empty. */
export function bodyPath(shape, n, dark, x0, y0, m) {
  let d = '';
  if (shape === 'hbars' || shape === 'square' || !shape) {
    const inset = shape === 'hbars' ? m * 0.07 : 0;
    const r = shape === 'hbars' ? (m - 2 * inset) / 2 : 0;
    for (let r0 = 0; r0 < n; r0++) {
      for (let c = 0; c < n; c++) {
        if (!dark(r0, c)) continue;
        let e = c;
        while (e + 1 < n && dark(r0, e + 1)) e++;
        d += cornerRect(x0 + c * m, y0 + r0 * m + inset, (e - c + 1) * m, m - 2 * inset, [r, r, r, r]);
        c = e;
      }
    }
    return d;
  }
  if (shape === 'vbars') {
    const inset = m * 0.07;
    const r = (m - 2 * inset) / 2;
    for (let c = 0; c < n; c++) {
      for (let r0 = 0; r0 < n; r0++) {
        if (!dark(r0, c)) continue;
        let e = r0;
        while (e + 1 < n && dark(e + 1, c)) e++;
        d += cornerRect(x0 + c * m + inset, y0 + r0 * m, m - 2 * inset, (e - r0 + 1) * m, [r, r, r, r]);
        r0 = e;
      }
    }
    return d;
  }
  const cell = CELL[shape] ?? CELL.gap;
  for (let r0 = 0; r0 < n; r0++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r0, c)) continue;
      d += cell(x0 + c * m, y0 + r0 * m, m, (dr, dc) => dark(r0 + dr, c + dc));
    }
  }
  return d;
}

// Which corner stays sharp on leaf shapes, per eye: 0 top left, 1 top right, 2 bottom left.
const TOWARD_CENTRE = [2, 3, 1];
const OUTWARD = [0, 1, 3];
const leafCorners = (r, sharp) => [0, 1, 2, 3].map((i) => (i === sharp ? 0 : r));

/** One eye frame, 7 modules wide. Holes rely on the even-odd fill rule. */
export function framePath(shape, x, y, m, eye = 0) {
  const s = 7 * m;
  const hole = (r) => cornerRect(x + m, y + m, s - 2 * m, s - 2 * m, r);
  switch (shape) {
    case 'rounded':
      return cornerRect(x, y, s, s, Array(4).fill(1.6 * m)) + hole(Array(4).fill(0.8 * m));
    case 'round':
      return cornerRect(x, y, s, s, Array(4).fill(2.6 * m)) + hole(Array(4).fill(1.7 * m));
    case 'circle':
      // Just short of a true circle: a true one keeps enough straight edge for people's eyes, but not for scanners.
      return cornerRect(x, y, s, s, Array(4).fill(2.9 * m)) + hole(Array(4).fill(2 * m));
    case 'leaf':
      return cornerRect(x, y, s, s, leafCorners(2.6 * m, TOWARD_CENTRE[eye])) + hole(leafCorners(1.7 * m, TOWARD_CENTRE[eye]));
    case 'leafout':
      return cornerRect(x, y, s, s, leafCorners(2.6 * m, OUTWARD[eye])) + hole(leafCorners(1.7 * m, OUTWARD[eye]));
    case 'pinch':
      return cornerRect(x, y, s, s, [2.6 * m, 0, 2.6 * m, 0]) + hole([1.7 * m, 0, 1.7 * m, 0]);
    case 'dots': {
      let d = '';
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6) d += circle(x + (j + 0.5) * m, y + (i + 0.5) * m, m * 0.5);
        }
      }
      return d;
    }
    default:
      return cornerRect(x, y, s, s) + hole();
  }
}

/** One eye centre, 3 modules wide. */
export function ballPath(shape, x, y, m, eye = 0) {
  const s = 3 * m;
  switch (shape) {
    case 'rounded':
      return cornerRect(x, y, s, s, Array(4).fill(0.8 * m));
    case 'circle':
      return cornerRect(x, y, s, s, Array(4).fill(1.35 * m));
    case 'leaf':
      return cornerRect(x, y, s, s, leafCorners(1.4 * m, TOWARD_CENTRE[eye]));
    case 'pinch':
      return cornerRect(x, y, s, s, [1.4 * m, 0, 1.4 * m, 0]);
    case 'leafout':
      return cornerRect(x, y, s, s, leafCorners(1.4 * m, OUTWARD[eye]));
    default:
      return cornerRect(x, y, s, s);
  }
}

const inFinder = (r, c, n) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

/** Clamp a logo so it can't hide more than error correction can repair. */
export const logoShare = (v) => Math.min(0.3, Math.max(0.12, v ?? 0.22));

/**
 * Draw a whole code. `style` holds the shape names and logoShare (0 = no logo).
 * Returns { body, frames, balls, plate, module, count }; plate is the logo's clear box in mm, or null.
 */
export function qrPaths(code, x, y, size, quiet, style = {}) {
  const n = code.getModuleCount();
  const m = size / (n + quiet * 2);
  const x0 = x + quiet * m;
  const y0 = y + quiet * m;
  let plate = null;
  let clear = () => false;
  if (style.logoShare) {
    // Snap the box to whole modules, so no module is left half covered.
    const span = Math.min(n - 16, Math.round((style.logoShare * size) / m));
    const cells = span % 2 === n % 2 ? span : span + 1;
    const from = (n - cells) / 2;
    clear = (r, c) => r >= from && r < from + cells && c >= from && c < from + cells;
    const side = cells * m;
    plate = { x: x0 + from * m, y: y0 + from * m, w: side, h: side };
  }
  const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && code.isDark(r, c) && !inFinder(r, c, n) && !clear(r, c);
  const eyes = [
    [x0, y0],
    [x0 + (n - 7) * m, y0],
    [x0, y0 + (n - 7) * m],
  ];
  return {
    body: bodyPath(style.body, n, dark, x0, y0, m),
    frames: eyes.map(([ex, ey], i) => framePath(style.frame, ex, ey, m, i)).join(''),
    balls: eyes.map(([ex, ey], i) => ballPath(style.ball, ex + 2 * m, ey + 2 * m, m, i)).join(''),
    plate,
    module: m,
    count: n,
  };
}

/* ---------- Will it scan? ---------- */

function luminance(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join('');
  if (h.length < 6) return null;
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

const paintColours = (p) => (typeof p === 'string' ? [p] : (p?.stops ?? []).map((s) => s[1]));

/** Phones read dark on light. Returns 'inverted', 'low' or null for resolved paints. */
export function contrastProblem(darkPaints, lightPaint) {
  if (!lightPaint || lightPaint === 'none') return null;
  const lights = paintColours(lightPaint).map(luminance);
  const darks = darkPaints.flatMap(paintColours).map(luminance);
  if ([...lights, ...darks].some((v) => v == null)) return null;
  const light = Math.min(...lights);
  const dark = Math.max(...darks);
  if (dark > light) return 'inverted';
  return (light + 0.05) / (dark + 0.05) < 3 ? 'low' : null;
}
