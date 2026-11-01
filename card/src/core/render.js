// Turns a card design (JSON) into a flat list of drawing operations, then into one SVG.
// Rule for the whole tool: the editor only offers what SVG, PNG and PDF can all reproduce, so there's no blur,
// soft shadow or blend mode here. Everything is a filled or stroked path, or an image.
import { ellipsePath, parsePath, pathString, rectPath, transformCmds } from './pathutil.js';
import { ICONS } from './icons.js';
import { FONTS, PT } from './text.js';
import { buildMatrix, contrastProblem, kindPayload, logoShare, MIN_QR_MODULE_MM, normaliseUrl, qrPaths, waNumber } from './qr.js';

export { MIN_QR_MODULE_MM };

export const SIZE = { w: 88.9, h: 50.8, bleed: 3, safe: 4 };
export const MIN_TEXT_PT = 5.5;

const FIELD_ICONS = { phone: 'phone', whatsapp: 'message-circle', email: 'mail', website: 'globe', address: 'map-pin', hours: 'clock' };

export const cardSize = (doc) => doc.size ?? (doc.orientation === 'vertical' ? { w: SIZE.h, h: SIZE.w } : { w: SIZE.w, h: SIZE.h });

function fillTokens(str, fields) {
  return String(str ?? '').replace(/\{(\w+)\}/g, (_, k) => fields[k] ?? '');
}

function color(c, palette) {
  if (typeof c === 'string' && c[0] === '$') {
    const v = palette[c.slice(1)];
    if (!v) throw new Error(`Palette has no colour ${c}`);
    return v;
  }
  return c;
}

/** Resolve a paint to a flat colour or a gradient in the element's own coordinates. */
function paint(p, box, palette) {
  if (p == null || p === 'none') return null;
  if (typeof p === 'string') return color(p, palette);
  const stops = p.stops.map(([o, c]) => [o, color(c, palette)]);
  if (p.type === 'linear') {
    const a = ((p.angle ?? 0) * Math.PI) / 180;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const half = (Math.abs(box.w * dx) + Math.abs(box.h * dy)) / 2;
    return { type: 'linear', x1: cx - dx * half, y1: cy - dy * half, x2: cx + dx * half, y2: cy + dy * half, stops };
  }
  return {
    type: 'radial',
    cx: box.x + (p.cx ?? 0.5) * box.w,
    cy: box.y + (p.cy ?? 0.5) * box.h,
    r: (p.r ?? 0.5) * Math.max(box.w, box.h),
    stops,
  };
}

/** Build the QR payload for a QR element from the card's fields. */
export function qrPayload(el, fields) {
  if (el.qrKind) return kindPayload(el.qrKind, el.qrIn, fields);
  if (el.data === 'vcard') return vcard(fields);
  if (el.data === 'website') return fields.website ? normaliseUrl(fields.website) : '';
  if (el.data === 'whatsapp') {
    const n = waNumber(fields.whatsapp || fields.phone);
    return n ? `https://wa.me/${n}` : '';
  }
  return fillTokens(el.data, fields);
}

const vesc = (s) => String(s).replace(/([\\;,])/g, '\\$1');

export function vcard(f) {
  const parts = String(f.name || '')
    .trim()
    .split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : '';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vesc(last)};${vesc(parts.join(' '))};;;`, `FN:${vesc(f.name || f.company || '')}`];
  if (f.company) lines.push(`ORG:${vesc(f.company)}`);
  if (f.title) lines.push(`TITLE:${vesc(f.title)}`);
  if (f.phone) lines.push(`TEL;TYPE=CELL:${f.phone}`);
  if (f.whatsapp && f.whatsapp !== f.phone) lines.push(`TEL;TYPE=WORK:${f.whatsapp}`);
  if (f.email) lines.push(`EMAIL:${f.email}`);
  if (f.website) lines.push(`URL:${normaliseUrl(f.website)}`);
  if (f.address) lines.push(`ADR;TYPE=WORK:;;${vesc(f.address)};;;;`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function qrPath(text, x, y, size, quiet = 2) {
  const q = buildMatrix(text, size, quiet);
  if (!q) return null;
  const n = q.getModuleCount();
  const m = size / (n + quiet * 2);
  let d = '';
  // Merge dark modules into row runs to keep the path small.
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!q.isDark(r, c)) continue;
      let e = c;
      while (e + 1 < n && q.isDark(r, e + 1)) e++;
      const x0 = x + (c + quiet) * m;
      const y0 = y + (r + quiet) * m;
      d += rectPath(x0, y0, (e - c + 1) * m, m);
      c = e;
    }
  }
  return { d, module: m, count: n };
}

const familyOf = (token, doc) => (typeof token === 'string' && token[0] === '$' ? doc.fonts[token.slice(1)] : token);

/** Every font id a design needs, so they can all load before drawing. */
export function fontsUsed(doc) {
  const out = new Set(['inter', 'notosansdeva']);
  const visit = (el) => {
    if (el.font) out.add(familyOf(el.font, doc));
    if (el.type === 'logo' && el.fallbackFont) out.add(familyOf(el.fallbackFont, doc));
  };
  for (const side of Object.values(doc.sides)) side.elements.forEach(visit);
  Object.values(doc.fonts || {}).forEach((f) => out.add(f));
  return [...out].filter((id) => FONTS.some((f) => f.id === id));
}

function initials(fields) {
  const src = String(fields.company || fields.name || '').trim();
  if (!src) return '';
  // Skip titles and symbols, so "Mehta & Associates" gives MA and "Dr. Rao" gives R.
  const words = src
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w) && !/^(dr\.?|ca|adv\.?|mr\.?|ms\.?|mrs\.?|shri|shree|sri|श्री)$/i.test(w));
  const chars = (w) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(w)][0]?.segment || '';
  return (words.length > 1 ? chars(words[0]) + chars(words[1]) : chars(words[0] || src)).toUpperCase();
}

/**
 * Resolve one side of a design to drawing operations.
 * Returns { ops, warnings, boxes }. Each operation: { id, kind:'path'|'image', d, fill, stroke, strokeWidth, ... }.
 */
export function resolveSide(doc, sideName, engine) {
  const { w, h } = cardSize(doc);
  const palette = doc.palette || {};
  const fields = doc.fields || {};
  const side = doc.sides[sideName];
  const ops = [];
  const warnings = [];
  const boxes = {};
  const b = SIZE.bleed;

  const pushBox = (id, box) => {
    boxes[id] = boxes[id] ? union(boxes[id], box) : box;
  };

  const bgBox = { x: -b, y: -b, w: w + 2 * b, h: h + 2 * b };
  ops.push({
    id: '_bg',
    kind: 'path',
    d: rectPath(bgBox.x, bgBox.y, bgBox.w, bgBox.h),
    fill: paint(side.background ?? '#FFFFFF', bgBox, palette),
  });

  const textOp = (el, str, rect, extra = {}) => {
    const font = familyOf(el.font ?? '$body', doc);
    const lay = engine.layout(str, {
      font,
      weight: el.weight,
      size: el.size,
      minSize: el.minSize,
      lang: el.lang || doc.lang,
      lineHeight: el.lineHeight,
      tracking: el.tracking,
      align: el.align,
      valign: el.valign,
      upper: el.upper,
      maxLines: el.maxLines,
      noWrap: el.noWrap,
      hang: el.hang,
      hangGapLatin: el.hangGapLatin,
      ...rect,
      ...extra,
    });
    return { lay, font };
  };

  /** A contact list's rows. A long line wraps to two rather than shrinking out of proportion with the rest. */
  const listRows = (el) => {
    const fontPt = el.size;
    const base = fontPt * PT * (el.rowHeight ?? 1.75);
    const iconSize = el.icons === false ? 0 : fontPt * PT * 1.25;
    const gap = iconSize ? fontPt * PT * 0.7 : 0;
    const textW = el.w - iconSize - gap;
    const floor = el.minSize ?? MIN_TEXT_PT;
    const wrapMin = Math.max(Math.min(floor, fontPt), fontPt * 0.9);
    const rows = el.items
      .filter((k) => fields[k])
      .map((key) => {
        const one = textOp(
          el,
          fields[key],
          { x: 0, y: 0, w: textW, h: base },
          { valign: 'middle', noWrap: true, minSize: floor, lineHeight: 1.15 },
        ).lay;
        if (one.fits && one.size >= fontPt * 0.9) return { key, h: base };
        const two = textOp(
          el,
          fields[key],
          { x: 0, y: 0, w: textW },
          { noWrap: false, maxLines: 2, minSize: wrapMin, lineHeight: 1.15 },
        ).lay;
        if (two.fits && two.size >= wrapMin && two.lines.length === 2) {
          const h = two.height + (base - two.lineHeight);
          return { key, h, wrap: { minSize: wrapMin, pad: (h - two.height) / 2, lineH: two.lineHeight } };
        }
        return { key, h: base };
      });
    return { rows, iconSize, gap, textW, floor, base, total: rows.reduce((a, r) => a + r.h, 0) };
  };

  // Stacks: text blocks that flow one after another inside a box, so they can never collide or leave it.
  // When there's too much to fit, everything shrinks together, then any optional lines are dropped.
  const placed = {};
  const dropped = new Set();
  for (const [name, st] of Object.entries(side.stacks ?? {})) {
    const hasContent = (e) => {
      if (e.stack !== name || e.hidden || (e.when && !fields[e.when])) return false;
      if (e.type === 'text') return !!fillTokens(e.text, fields).trim();
      if (e.type === 'list') return e.items.some((k) => fields[k]);
      return true;
    };
    const sized = (e, scale) => {
      if (e.type !== 'text' && e.type !== 'list') return e;
      const floor = Math.min(e.size, e.minSize ?? MIN_TEXT_PT);
      return { ...e, size: Math.max(floor, Math.round(e.size * scale * 4) / 4), h: undefined };
    };
    const heightOf = (e, scale) => {
      const s = sized(e, scale);
      if (e.type === 'text') return textOp(s, fillTokens(e.text, fields), { x: 0, y: 0, w: e.w }).lay.height;
      if (e.type === 'list') return listRows(s).total;
      return e.h ?? e.w ?? 0;
    };
    const gapOf = (e, i) => (i === 0 ? 0 : (e.gap ?? st.gap ?? 1));
    const totalOf = (list, scale) => list.reduce((a, e, i) => a + heightOf(e, scale) + gapOf(e, i), 0);
    const fit = (list) => {
      for (let s = 1; s >= 0.59; s -= 0.05) if (totalOf(list, s) <= st.h + 0.01) return s;
      return null;
    };
    const all = side.elements.filter(hasContent);
    let list = all;
    let scale = fit(list);
    while (scale == null && list.some((e) => e.optional)) {
      const last = list.findLast((e) => e.optional);
      list = list.filter((e) => e !== last);
      scale = fit(list);
    }
    if (scale == null) {
      scale = 0.6;
      if (list[0])
        warnings.push({
          id: list[0].id,
          code: 'text-overflow',
          message: 'Too much text to fit here. Shorten your details or remove a line',
        });
    }
    for (const e of all) if (!list.includes(e)) dropped.add(e.id);
    const total = totalOf(list, scale);
    let y = st.anchor === 'bottom' ? st.y + st.h - total : st.anchor === 'middle' ? st.y + (st.h - total) / 2 : st.y;
    list.forEach((e, i) => {
      y += gapOf(e, i);
      placed[e.id] = { y, size: sized(e, scale).size };
      y += heightOf(e, scale);
    });
  }

  const bottoms = {};
  for (const source of side.elements) {
    if (source.hidden || dropped.has(source.id)) continue;
    if (source.when && !fields[source.when]) continue;
    // Art that only makes sense beside Devanagari, such as a rule that continues a headline's top line.
    if (source.deva && !/[ऀ-ॿ]/.test(fields[source.deva] ?? '')) continue;
    const spot = placed[source.id];
    const raw =
      spot && (source.type === 'text' || source.type === 'list')
        ? { ...source, y: spot.y, size: spot.size, h: undefined }
        : spot
          ? { ...source, y: spot.y }
          : source;
    // "below": sit under another element, moving down only if it has grown past its usual size.
    const el = raw.below && bottoms[raw.below] != null ? { ...raw, y: Math.max(raw.y, bottoms[raw.below] + (raw.gap ?? 0.5)) } : raw;
    bottoms[el.id] = el.y + (el.h || 0);
    const common = {
      id: el.id,
      opacity: el.opacity ?? 1,
      rot: el.rot ? { deg: el.rot, cx: el.x + (el.w || 0) / 2, cy: el.y + (el.h || 0) / 2 } : null,
    };

    if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'line' || el.type === 'path') {
      const box = { x: el.x, y: el.y, w: el.w, h: el.h };
      let d;
      if (el.type === 'rect') d = rectPath(el.x, el.y, el.w, el.h, el.r);
      else if (el.type === 'ellipse') d = ellipsePath(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2);
      else if (el.type === 'line') d = `M${el.x} ${el.y}L${el.x + el.w} ${el.y + el.h}`;
      else {
        const vb = el.vb || [0, 0, el.w, el.h];
        const sx = el.w / vb[2];
        const sy = el.h / vb[3];
        d = pathString(transformCmds(parsePath(el.d), sx, sy, el.x - vb[0] * sx, el.y - vb[1] * sy));
      }
      ops.push({
        ...common,
        kind: 'path',
        d,
        fill: paint(el.fill, box, palette),
        stroke: paint(el.stroke, box, palette),
        strokeWidth: el.sw,
        dash: el.dash,
        cap: el.cap,
        join: el.join,
        evenodd: el.evenodd,
      });
      pushBox(el.id, box);
    } else if (el.type === 'text') {
      const str = fillTokens(el.text, fields);
      if (!str.trim()) continue;
      const { lay } = textOp(el, str, { x: el.x, y: el.y, w: el.w, h: el.h });
      if (!lay.fits) warnings.push({ id: el.id, code: 'text-overflow', message: `"${str.slice(0, 30)}" doesn't fit its box` });
      if (lay.size < MIN_TEXT_PT)
        warnings.push({ id: el.id, code: 'text-small', message: `"${str.slice(0, 30)}" is ${lay.size}pt, too small to read in print` });
      const measuredH = el.h ?? lay.height;
      const rot = el.rot ? { deg: el.rot, cx: el.x + el.w / 2, cy: el.y + measuredH / 2 } : null;
      ops.push({
        ...common,
        rot,
        kind: 'path',
        d: lay.d,
        fill: paint(el.fill ?? '#000000', { x: el.x, y: el.y, w: el.w, h: measuredH }, palette),
        text: true,
      });
      bottoms[el.id] = el.h ? el.y + lay.top + lay.height : el.y + lay.height;
      pushBox(el.id, { x: el.x, y: el.y, w: el.w, h: el.h ?? lay.height });
    } else if (el.type === 'list') {
      // Contact rows. Empty fields disappear and the remaining rows close up.
      const { rows, iconSize, gap, textW, floor, total } = listRows(el);
      let y = el.valign === 'bottom' ? el.y + (el.h ?? total) - total : el.y;
      for (const { key, h: rowH, wrap } of rows) {
        const textX = el.align === 'right' ? el.x : el.x + iconSize + gap;
        const { lay } = wrap
          ? textOp(
              el,
              fields[key],
              { x: textX, y: y + wrap.pad, w: textW },
              { noWrap: false, maxLines: 2, minSize: wrap.minSize, lineHeight: 1.15 },
            )
          : textOp(
              el,
              fields[key],
              { x: textX, y, w: textW, h: rowH },
              { valign: 'middle', noWrap: true, minSize: floor, lineHeight: 1.15 },
            );
        if (!lay.fits) warnings.push({ id: el.id, code: 'text-overflow', message: `"${fields[key].slice(0, 30)}" doesn't fit its row` });
        if (lay.size < MIN_TEXT_PT)
          warnings.push({
            id: el.id,
            code: 'text-small',
            message: `"${fields[key].slice(0, 30)}" is ${lay.size}pt, too small to read in print`,
          });
        const listBox = { x: el.x, y: el.y, w: el.w, h: el.h ?? total };
        ops.push({ ...common, id: el.id, kind: 'path', d: lay.d, fill: paint(el.fill ?? '#000000', listBox, palette), text: true });
        if (iconSize) {
          const ix = el.align === 'right' ? el.x + el.w - iconSize : el.x;
          // A wrapped row keeps its icon beside the first line.
          const iy = wrap ? y + wrap.pad + (wrap.lineH - iconSize) / 2 : y + (rowH - iconSize) / 2;
          ops.push({
            ...common,
            id: el.id,
            kind: 'path',
            d: iconPath(FIELD_ICONS[key] || 'circle', ix, iy, iconSize),
            stroke: paint(el.iconFill ?? el.fill ?? '#000000', listBox, palette),
            strokeWidth: (2 / 24) * iconSize,
            cap: 'round',
            join: 'round',
          });
        }
        y += rowH;
      }
      pushBox(el.id, { x: el.x, y: el.y, w: el.w, h: el.h ?? total });
    } else if (el.type === 'icon') {
      const box = { x: el.x, y: el.y, w: el.w, h: el.h ?? el.w };
      ops.push({
        ...common,
        kind: 'path',
        d: iconPath(el.name, el.x, el.y, el.w),
        stroke: paint(el.stroke ?? '#000000', box, palette),
        strokeWidth: (el.sw ?? 2) * (el.w / 24),
        cap: 'round',
        join: 'round',
      });
      pushBox(el.id, box);
    } else if (el.type === 'qr') {
      const payload = qrPayload(el, fields);
      // A code someone is setting up stays as a blank square. A template's optional code just steps aside.
      if (!payload && !el.qrKind && !el.keepBlank) continue;
      const box = { x: el.x, y: el.y, w: el.w, h: el.w };
      const lightPaint = el.light === 'none' ? 'none' : paint(el.light ?? '#FFFFFF', box, palette);
      if (!payload) {
        // Nothing to open yet. The blank square shows in the editor so it can be selected, but it's never printed.
        ops.push({ ...common, kind: 'path', d: rectPath(el.x, el.y, el.w, el.w, el.r), fill: '#FFFFFF', editorOnly: true });
        warnings.push({ id: el.id, code: 'qr-empty', message: 'Paste the link this QR code should open' });
        pushBox(el.id, box);
        continue;
      }
      const logoSrc = el.qrLogo === 'card' ? fields.logo : el.qrLogo === 'own' ? el.qrSrc : null;
      const logoIcon = el.qrLogo === 'icon' && Object.hasOwn(ICONS, String(el.qrIcon)) ? el.qrIcon : null;
      const hasLogo = !!(logoSrc || logoIcon);
      const styled = hasLogo || el.body || el.frame || el.ball || el.frameColor || el.ballColor;
      const quiet = el.quiet ?? 2;
      const code = styled ? buildMatrix(payload, el.w, quiet, { logo: hasLogo }) : null;
      const plain = styled ? null : qrPath(payload, el.x, el.y, el.w, quiet);
      if (!code && !plain) {
        warnings.push({ id: el.id, code: 'qr-too-long', message: 'Too much text for one QR code. Shorten it' });
        pushBox(el.id, box);
        continue;
      }
      if (el.light !== 'none') ops.push({ ...common, kind: 'path', d: rectPath(el.x, el.y, el.w, el.w, el.r), fill: lightPaint });
      const darkPaint = paint(el.dark ?? '#000000', box, palette);
      const framePaint = el.frameColor ? paint(el.frameColor, box, palette) : darkPaint;
      const ballPaint = el.ballColor ? paint(el.ballColor, box, palette) : darkPaint;
      const problem = contrastProblem([darkPaint, framePaint, ballPaint], lightPaint);
      if (problem === 'inverted')
        warnings.push({
          id: el.id,
          code: 'qr-inverted',
          message: "QR code is lighter than its background. Many phones can't read that, so use a dark code on a light background",
        });
      if (problem === 'low')
        warnings.push({ id: el.id, code: 'qr-contrast', message: 'QR code and its background are too close in colour to scan' });
      const q = code
        ? qrPaths(code, el.x, el.y, el.w, quiet, {
            body: el.body,
            frame: el.frame,
            ball: el.ball,
            logoShare: hasLogo ? logoShare(el.qrLogoSize) : 0,
          })
        : plain;
      if (q.module < MIN_QR_MODULE_MM)
        warnings.push({
          id: el.id,
          code: 'qr-small',
          message: `QR modules are ${q.module.toFixed(2)} mm. Make it bigger or shorten the details so it scans reliably`,
        });
      const qrMeta = { payload, module: q.module, count: q.count };
      if (plain) {
        ops.push({ ...common, kind: 'path', d: q.d, fill: darkPaint, crisp: true, qr: qrMeta });
      } else {
        const isSquare = (s) => !s || s === 'square';
        ops.push({ ...common, kind: 'path', d: q.body, fill: darkPaint, crisp: isSquare(el.body), qr: qrMeta });
        ops.push({ ...common, kind: 'path', d: q.frames, fill: framePaint, evenodd: el.frame !== 'dots', crisp: isSquare(el.frame) });
        ops.push({ ...common, kind: 'path', d: q.balls, fill: ballPaint, crisp: isSquare(el.ball) });
      }
      if (q.plate) {
        const inset = q.module * 0.7;
        const inner = { x: q.plate.x + inset, y: q.plate.y + inset, w: q.plate.w - 2 * inset, h: q.plate.h - 2 * inset };
        if (el.light === 'none')
          ops.push({ ...common, kind: 'path', d: rectPath(q.plate.x, q.plate.y, q.plate.w, q.plate.h, q.module), fill: '#FFFFFF' });
        if (logoIcon) {
          ops.push({
            ...common,
            kind: 'path',
            d: iconPath(logoIcon, inner.x, inner.y, inner.w),
            stroke: darkPaint,
            strokeWidth: (2 / 24) * inner.w,
            cap: 'round',
            join: 'round',
          });
        } else {
          const iw = (el.qrLogo === 'card' ? fields.logoW : el.imgW) || 1;
          const ih = (el.qrLogo === 'card' ? fields.logoH : el.imgH) || 1;
          const r = Math.min(inner.w / iw, inner.h / ih);
          ops.push({
            ...common,
            kind: 'image',
            href: logoSrc,
            x: inner.x + (inner.w - iw * r) / 2,
            y: inner.y + (inner.h - ih * r) / 2,
            w: iw * r,
            h: ih * r,
          });
        }
      }
      pushBox(el.id, box);
    } else if (el.type === 'image' || el.type === 'logo') {
      const box = { x: el.x, y: el.y, w: el.w, h: el.h };
      const src = el.type === 'logo' ? fields.logo : el.src;
      if (src) {
        const iw = (el.type === 'logo' ? fields.logoW : el.imgW) || 1;
        const ih = (el.type === 'logo' ? fields.logoH : el.imgH) || 1;
        const cover = el.fit === 'cover';
        const r = cover ? Math.max(el.w / iw, el.h / ih) : Math.min(el.w / iw, el.h / ih);
        const dw = iw * r;
        const dh = ih * r;
        const clip =
          el.clip === 'circle'
            ? ellipsePath(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2)
            : cover || el.clip
              ? rectPath(el.x, el.y, el.w, el.h, el.r)
              : null;
        const ax = el.align === 'left' ? 0 : el.align === 'right' ? el.w - dw : (el.w - dw) / 2;
        ops.push({ ...common, kind: 'image', href: src, x: el.x + ax, y: el.y + (el.h - dh) / 2, w: dw, h: dh, clip });
        const dpi = (iw / dw) * 25.4;
        if (dpi < 200)
          warnings.push({
            id: el.id,
            code: 'image-low-res',
            message: `Image is ${Math.round(dpi)} dpi at this size and may print blurry. Aim for 300`,
          });
      } else if (el.type === 'logo' && el.fallback !== 'none') {
        const label = initials(fields);
        if (label) {
          const { lay } = textOp(
            {
              ...el,
              font: el.fallbackFont ?? '$heading',
              weight: el.fallbackWeight ?? 700,
              size: el.fallbackSize ?? el.h * 1.1,
              upper: false,
            },
            label,
            { x: el.x, y: el.y, w: el.w, h: el.h },
            { align: el.align ?? 'center', valign: 'middle', noWrap: true, lineHeight: 1, minSize: 6 },
          );
          ops.push({ ...common, kind: 'path', d: lay.d, fill: paint(el.fill ?? '#000000', box, palette), text: true });
        }
      }
      pushBox(el.id, box);
    } else {
      throw new Error(`Unknown element type: ${el.type}`);
    }
  }
  return { ops, warnings, boxes };
}

/** What the eye sees of each piece of text: its ink, not its box. Alignment and snapping work from these. */
export function inkBoxes(ops) {
  const out = {};
  for (const op of ops) {
    if (!op.text || !op.d || op.rot) continue;
    const b = inkBounds(op.d);
    out[op.id] = out[op.id] ? union(out[op.id], b) : b;
  }
  return out;
}

/** Real extent of a path, from its coordinates. Control points can overshoot slightly, which is fine for checks. */
export function inkBounds(d) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const c of parsePath(d)) {
    for (let i = 1; i < c.length; i += 2) {
      x0 = Math.min(x0, c[i]);
      x1 = Math.max(x1, c[i]);
      y0 = Math.min(y0, c[i + 1]);
      y1 = Math.max(y1, c[i + 1]);
    }
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Checks that need the finished layout: text running into text or a QR code, or too near the cut. */
export function checkLayout(doc, sideName, engine) {
  const { ops, warnings } = resolveSide(doc, sideName, engine);
  const { w, h } = cardSize(doc);
  const decorative = new Set(doc.sides[sideName].elements.filter((e) => e.type === 'logo').map((e) => e.id));
  const rects = new Map();
  for (const op of ops) {
    if (op.kind !== 'path' || !op.d || !(op.text || op.qr) || decorative.has(op.id)) continue;
    const b = inkBounds(op.d);
    const key = op.id;
    rects.set(key, [...(rects.get(key) || []), b]);
  }
  const out = [...warnings];
  const entries = [...rects.entries()];
  const margin = 2;
  for (const [id, list] of entries) {
    for (const r of list) {
      if (r.x < margin - 0.01 || r.y < margin - 0.01 || r.x + r.w > w - margin + 0.01 || r.y + r.h > h - margin + 0.01) {
        out.push({ id, code: 'near-edge', message: `${id} is within ${margin} mm of the cut` });
        break;
      }
    }
  }
  const OVERLAP = 0.35;
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const hit = entries[i][1].some((a) =>
        entries[j][1].some(
          (b) => a.x + OVERLAP < b.x + b.w && b.x + OVERLAP < a.x + a.w && a.y + OVERLAP < b.y + b.h && b.y + OVERLAP < a.y + a.h,
        ),
      );
      if (hit) out.push({ id: entries[i][0], code: 'overlap', message: `${entries[i][0]} runs into ${entries[j][0]}` });
    }
  }
  return out;
}

function union(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + (a.h || 0), b.y + (b.h || 0)) - y };
}

export function iconPath(name, x, y, size) {
  const d = ICONS[name];
  if (!d) throw new Error(`Unknown icon: ${name}`);
  const s = size / 24;
  return pathString(transformCmds(parsePath(d), s, s, x, y));
}

const fmt = (v) => String(Math.round(v * 1000) / 1000);
const attr = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Draw operations as SVG markup (no <svg> wrapper). `prefix` keeps gradient ids unique when cards repeat on a sheet. */
export function opsToMarkup(ops, prefix = 'c') {
  const defs = [];
  let n = 0;
  const addPaint = (p) => {
    if (!p) return 'none';
    if (typeof p === 'string') return p;
    const id = `${prefix}g${n++}`;
    const stops = p.stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
    if (p.type === 'linear') {
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(p.x1)}" y1="${fmt(p.y1)}" x2="${fmt(p.x2)}" y2="${fmt(p.y2)}">${stops}</linearGradient>`,
      );
    } else {
      defs.push(
        `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.r)}">${stops}</radialGradient>`,
      );
    }
    return `url(#${id})`;
  };
  let body = '';
  for (const op of ops) {
    if ((op.kind === 'path' && !op.d) || op.editorOnly) continue;
    let a = '';
    if (op.opacity != null && op.opacity !== 1) a += ` opacity="${op.opacity}"`;
    if (op.rot) a += ` transform="rotate(${fmt(op.rot.deg)} ${fmt(op.rot.cx)} ${fmt(op.rot.cy)})"`;
    if (op.kind === 'path') {
      a += ` fill="${addPaint(op.fill)}"`;
      if (op.stroke) {
        a += ` stroke="${addPaint(op.stroke)}" stroke-width="${fmt(op.strokeWidth ?? 0.25)}"`;
        if (op.dash) a += ` stroke-dasharray="${op.dash.join(' ')}"`;
        if (op.cap) a += ` stroke-linecap="${op.cap}"`;
        if (op.join) a += ` stroke-linejoin="${op.join}"`;
      }
      if (op.evenodd) a += ' fill-rule="evenodd"';
      if (op.crisp) a += ' shape-rendering="crispEdges"';
      body += `<path${a} d="${op.d}"/>`;
    } else if (op.kind === 'image') {
      const href = attr(op.href);
      const img = `<image x="${fmt(op.x)}" y="${fmt(op.y)}" width="${fmt(op.w)}" height="${fmt(op.h)}" preserveAspectRatio="none" href="${href}" xlink:href="${href}"/>`;
      if (op.clip) {
        const id = `${prefix}c${n++}`;
        defs.push(`<clipPath id="${id}"><path d="${op.clip}"/></clipPath>`);
        body += `<g${a} clip-path="url(#${id})">${img}</g>`;
      } else body += `<g${a}>${img}</g>`;
    }
  }
  return { defs: defs.join(''), body };
}

const NS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';

/** A complete SVG for one side. `bleed: true` includes the 3 mm bleed, otherwise the file is exactly trim size. */
export function sideToSvg(doc, sideName, engine, { bleed = true } = {}) {
  const { w, h } = cardSize(doc);
  const { ops, warnings, boxes } = resolveSide(doc, sideName, engine);
  const { defs, body } = opsToMarkup(ops);
  const b = bleed ? SIZE.bleed : 0;
  const W = w + 2 * b;
  const H = h + 2 * b;
  const svg = `<svg ${NS} width="${fmt(W)}mm" height="${fmt(H)}mm" viewBox="${fmt(-b)} ${fmt(-b)} ${fmt(W)} ${fmt(H)}"><title>${attr(`${doc.fields?.name || doc.fields?.company || 'Card'} (${sideName})`)}</title><defs>${defs}</defs>${body}</svg>`;
  return { svg, warnings, ops, boxes };
}

const MARK = { reach: 4, gap: 0.5, sw: 0.09 };

function cropMarks(x, y, w, h, b) {
  const g = b + MARK.gap;
  const r = MARK.reach;
  const seg = (x1, y1, x2, y2) => `M${fmt(x1)} ${fmt(y1)}L${fmt(x2)} ${fmt(y2)}`;
  const d = [
    seg(x, y - g, x, y - g - r),
    seg(x - g, y, x - g - r, y),
    seg(x + w, y - g, x + w, y - g - r),
    seg(x + w + g, y, x + w + g + r, y),
    seg(x, y + h + g, x, y + h + g + r),
    seg(x - g, y + h, x - g - r, y + h),
    seg(x + w, y + h + g, x + w, y + h + g + r),
    seg(x + w + g, y + h, x + w + g + r, y + h),
  ].join('');
  return `<path d="${d}" fill="none" stroke="#000000" stroke-width="${MARK.sw}"/>`;
}

/** Print-shop page for one side: bleed included, optionally with crop marks around it. */
export function printPageSvg(doc, sideName, engine, { marks = false } = {}) {
  const { w, h } = cardSize(doc);
  const b = SIZE.bleed;
  const pad = marks ? b + MARK.gap + MARK.reach + 1 : b;
  const { ops } = resolveSide(doc, sideName, engine);
  // Pages of one PDF share a gradient list by id, so a back reusing the front's ids would print in the front's colours.
  const { defs, body } = opsToMarkup(ops, sideName[0]);
  const W = w + 2 * pad;
  const H = h + 2 * pad;
  const svg = `<svg ${NS} width="${fmt(W)}mm" height="${fmt(H)}mm" viewBox="${fmt(-pad)} ${fmt(-pad)} ${fmt(W)} ${fmt(H)}"><defs>${defs}<clipPath id="bleedclip"><path d="${rectPath(-b, -b, w + 2 * b, h + 2 * b)}"/></clipPath></defs><g clip-path="url(#bleedclip)">${body}</g>${marks ? cropMarks(0, 0, w, h, b) : ''}</svg>`;
  return { svg, page: { w: W, h: H }, trim: { x: pad, y: pad, w, h }, bleed: { x: pad - b, y: pad - b, w: w + 2 * b, h: h + 2 * b } };
}

export const A4 = { w: 210, h: 297 };

/** A4 sheet of cards for home printing: as many as fit, centred, with crop marks in the margins. */
export function a4SheetSvg(doc, sideName, engine) {
  const { w, h } = cardSize(doc);
  const b = SIZE.bleed;
  const cw = w + 2 * b;
  const ch = h + 2 * b;
  const cols = Math.floor((A4.w - 2) / cw);
  const rows = Math.floor((A4.h - 2) / ch);
  const left = (A4.w - cols * cw) / 2;
  const top = (A4.h - rows * ch) / 2;
  const { ops } = resolveSide(doc, sideName, engine);
  let defs = `<clipPath id="bleedclip"><path d="${rectPath(-b, -b, cw, ch)}"/></clipPath>`;
  let body = '';
  const { defs: d0, body: b0 } = opsToMarkup(ops, `s${sideName[0]}`);
  defs += d0;
  let marks = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = left + c * cw + b;
      const ty = top + r * ch + b;
      body += `<g transform="translate(${fmt(tx)} ${fmt(ty)})"><g clip-path="url(#bleedclip)">${b0}</g></g>`;
    }
  }
  // Marks only in the outer margins, because neighbouring cards share the space between them.
  const line = (x1, y1, x2, y2) => `M${fmt(x1)} ${fmt(y1)}L${fmt(x2)} ${fmt(y2)}`;
  for (let c = 0; c < cols; c++) {
    for (const x of [left + c * cw + b, left + c * cw + b + w]) {
      marks += line(x, 0.5, x, top - 0.5) + line(x, A4.h - top + 0.5, x, A4.h - 0.5);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (const y of [top + r * ch + b, top + r * ch + b + h]) {
      marks += line(0.5, y, left - 0.5, y) + line(A4.w - left + 0.5, y, A4.w - 0.5, y);
    }
  }
  const svg = `<svg ${NS} width="${A4.w}mm" height="${A4.h}mm" viewBox="0 0 ${A4.w} ${A4.h}"><defs>${defs}</defs><rect width="${A4.w}" height="${A4.h}" fill="#FFFFFF"/>${body}<path d="${marks}" fill="none" stroke="#000000" stroke-width="${MARK.sw}"/></svg>`;
  return { svg, cols, rows, count: cols * rows };
}
