// Extras that load only when someone asks for them, so the editor itself stays quick to open:
// colouring a card to match a logo, sharing a card straight from the phone, and a "both sides on a table" picture.
import { svgToCanvas, svgToJpeg, svgToPng } from '../core/export.js';
import { sideToSvg } from '../core/render.js';
import { saveBlob, slug } from './download.js';

// ---------------------------------------------------------------- colour helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function hexToRgb(hex) {
  const n = parseInt(String(hex).replace('#', '').slice(0, 6).padEnd(6, '0'), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((v) =>
      Math.round(clamp(v, 0, 255))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`.toUpperCase();

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, clamp(s), l];
}

export function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** How light a colour looks (WCAG relative luminance), 0 for black to 1 for white. */
export function luminance(r, g, b) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** A colour with the given hue and saturation that looks exactly as light as `lum`, so text contrast stays what the design had. */
export function withLuminance(h, s, lum) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(...hslToRgb(h, s, mid)) < lum) lo = mid;
    else hi = mid;
  }
  return hslToRgb(h, s, (lo + hi) / 2);
}

// ---------------------------------------------------------------- logo colours
/**
 * The one or two colours a logo is "made of". pixels: RGBA bytes. Whites, blacks, greys and see-through pixels are ignored,
 * then the strongest hue wins; a second colour counts only if it is clearly a different hue and takes up real space.
 */
export function coloursFromPixels(pixels) {
  const BINS = 36;
  const bins = Array.from({ length: BINS }, () => ({ n: 0, score: 0, r: 0, g: 0, b: 0 }));
  let seen = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    seen++;
    const [h, s, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    if (s < 0.22 || l < 0.1 || l > 0.92) continue;
    const bin = bins[Math.floor(h / (360 / BINS)) % BINS];
    const w = s * (1 - Math.abs(l - 0.5));
    bin.n++;
    bin.score += w;
    bin.r += pixels[i] * w;
    bin.g += pixels[i + 1] * w;
    bin.b += pixels[i + 2] * w;
  }
  // Neighbouring bins are one colour seen through anti-aliasing and gradients, so each bin is judged with its two neighbours.
  const merged = bins.map((_, i) => {
    const group = [bins[(i + BINS - 1) % BINS], bins[i], bins[(i + 1) % BINS]];
    const score = group.reduce((t, x) => t + x.score, 0);
    const n = group.reduce((t, x) => t + x.n, 0);
    return score ? { i, n, score, rgb: ['r', 'g', 'b'].map((k) => group.reduce((t, x) => t + x[k], 0) / score) } : { i, n: 0, score: 0 };
  });
  const ranked = merged.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  if (!ranked.length || ranked[0].n < Math.max(4, seen * 0.01)) return [];
  const first = ranked[0];
  const firstHue = rgbToHsl(...first.rgb)[0];
  const second = ranked.find((m) => hueGap(rgbToHsl(...m.rgb)[0], firstHue) >= 40 && m.score >= first.score * 0.12);
  return [first, second].filter(Boolean).map((m) => rgbToHex(...m.rgb));
}

export async function logoColours(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const k = Math.min(1, 96 / Math.max(img.naturalWidth || 96, img.naturalHeight || 96));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round((img.naturalWidth || 96) * k));
  c.height = Math.max(1, Math.round((img.naturalHeight || 96) * k));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return coloursFromPixels(ctx.getImageData(0, 0, c.width, c.height).data);
}

/**
 * Recolour a design's palette to a brand. Every colour keeps how light it looked, so text stays as readable as the designer
 * left it; only hue and strength change. The design's main accent takes the first brand colour, a clearly different second
 * accent takes the second, and the paper and ink are tinted towards the brand.
 */
export function matchPalette(palette, brand) {
  if (!brand.length) return palette;
  const [b1, b2] = brand.map((hex) => rgbToHsl(...hexToRgb(hex)));
  const entries = Object.entries(palette).map(([key, hex]) => {
    const rgb = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(...rgb);
    return { key, hex, h, s, l, lum: luminance(...rgb), accent: s >= 0.25 && l >= 0.12 && l <= 0.88 };
  });
  // The accent that carries the most colour is the design's main one.
  const accents = entries.filter((e) => e.accent).sort((a, b) => b.s * (1 - Math.abs(b.l - 0.5)) - a.s * (1 - Math.abs(a.l - 0.5)));
  const mainHue = accents[0]?.h;
  const out = {};
  for (const e of entries) {
    const tail = e.hex.length > 7 ? e.hex.slice(7) : '';
    let target = b1;
    let sat;
    if (e.accent) {
      if (b2 && hueGap(e.h, mainHue) >= 40) target = b2;
      sat = clamp(Math.max(target[1], 0.35), 0, 1);
    } else {
      // Paper, ink and greys: a hint of the brand, never more colour than the design gave them.
      sat = Math.min(e.s, 0.3);
      if (e.s < 0.04) sat = 0;
    }
    out[e.key] = rgbToHex(...withLuminance(target[0], sat, e.lum)) + tail;
  }
  return out;
}

// ---------------------------------------------------------------- sharing and extra formats
const hasContent = (doc, side) => {
  const s = doc.sides[side];
  return s.elements.length > 0 || (s.background && s.background !== '#FFFFFF');
};

export const canShareFiles = () => {
  try {
    return !!navigator.canShare?.({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
};

/** Open the phone's share sheet with the card as a picture, so it can go straight to WhatsApp. */
export async function shareCard(doc, side, engine) {
  const { svg } = sideToSvg(doc, side, engine, { bleed: false });
  const blob = await svgToPng(svg, 600);
  const file = new File([blob], `${slug(doc)}-${side}.png`, { type: 'image/png' });
  await navigator.share({ files: [file], title: doc.fields?.company || doc.fields?.name || 'My visiting card' });
}

export async function downloadJpg(doc, side, engine) {
  const { svg } = sideToSvg(doc, side, engine, { bleed: false });
  await saveBlob(await svgToJpeg(svg, 600), `${slug(doc)}-${side}.jpg`);
}

// ---------------------------------------------------------------- "on a table" picture
export const MOCKUP_SHAPES = {
  square: { w: 1080, h: 1080, label: 'Square, for Instagram and WhatsApp' },
  story: { w: 1080, h: 1920, label: 'Tall, for Status and Stories' },
};

function roundedCard(ctx, img, x, y, w, h, angle) {
  const r = Math.min(w, h) * 0.035;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  // The shadow is cast by a plain shape, then the card is drawn on top with its corners clipped.
  ctx.save();
  ctx.shadowColor = 'rgba(20, 16, 40, 0.28)';
  ctx.shadowBlur = w * 0.07;
  ctx.shadowOffsetY = w * 0.035;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.clip();
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** A soft backdrop taken from the card's own colours, so the picture looks like it belongs to the brand. */
function backdrop(doc) {
  const colours = Object.values(doc.palette ?? {})
    .map((hex) => ({ hex, hsl: rgbToHsl(...hexToRgb(hex)) }))
    .filter((c) => c.hsl[1] >= 0.2 && c.hsl[2] > 0.1 && c.hsl[2] < 0.9)
    .sort((a, b) => b.hsl[1] - a.hsl[1]);
  const hue = colours[0]?.hsl[0] ?? 255;
  const sat = colours.length ? 0.22 : 0.08;
  return [rgbToHex(...hslToRgb(hue, sat, 0.93)), rgbToHex(...hslToRgb(hue, sat, 0.84))];
}

export async function mockupCanvas(doc, engine, shape = 'square') {
  const { w: W, h: H } = MOCKUP_SHAPES[shape] ?? MOCKUP_SHAPES.square;
  const sides = ['front', 'back'].filter((s) => hasContent(doc, s));
  if (!sides.length) sides.push('front');
  const art = [];
  for (const s of sides) art.push(await svgToCanvas(sideToSvg(doc, s, engine, { bleed: false }).svg, 400));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const [top, bottom] = backdrop(doc);
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const ratio = art[0].height / art[0].width;
  const tall = ratio > 1;
  // Two cards overlap like a small stack; one card sits alone, a little turned.
  const two = art.length > 1;
  let cw = W * (two ? 0.66 : 0.74);
  if (tall) cw = Math.min(W * (two ? 0.4 : 0.48), (H * (two ? 0.5 : 0.62)) / ratio);
  const ch = cw * ratio;
  const cx = (W - cw) / 2;
  const cy = (H - ch) / 2;
  if (two) {
    const dx = tall ? cw * 0.42 : cw * 0.1;
    const dy = tall ? ch * 0.1 : ch * 0.46;
    roundedCard(ctx, art[1], cx - dx, cy - dy, cw, ch, -7);
    roundedCard(ctx, art[0], cx + dx, cy + dy, cw, ch, 5);
  } else {
    roundedCard(ctx, art[0], cx, cy, cw, ch, -4);
  }
  return c;
}

export async function mockupBlob(doc, engine, shape) {
  const c = await mockupCanvas(doc, engine, shape);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'));
}

export async function downloadMockup(doc, engine, shape = 'square') {
  await saveBlob(await mockupBlob(doc, engine, shape), `${slug(doc)}-card-photo-${shape}.png`);
}
