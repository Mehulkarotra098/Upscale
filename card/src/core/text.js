// Text engine: turns a string into exact outlines with HarfBuzz. The preview and all three exports use this output,
// so line breaks, Hindi conjuncts and spacing can't differ between screen and print.
import * as hb from 'harfbuzzjs';
import { FONT_LIST as MANIFEST } from './fonts.js';

export const PT = 25.4 / 72; // mm per point
export const FLOOR_PT = 4.5; // text never shrinks below this
export const FONTS = MANIFEST;
const FONT_BY_ID = Object.fromEntries(MANIFEST.map((f) => [f.id, f]));
const FALLBACK = { deva: 'notosansdeva', latin: 'inter' };
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const isDeva = (s) => /\p{Script=Devanagari}/u.test(s);
// Emoji can't be outlined reliably for print, so the tool rejects them with a clear message.
const EMOJI = /\p{Extended_Pictographic}/u;
const num = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

export const hasEmoji = (s) => EMOJI.test(String(s).replace(/[©®™₹]/g, ''));

export class TextEngine {
  /** @param {(file: string) => Promise<ArrayBuffer>} loadFile fetches a font file by name */
  constructor(loadFile) {
    this.loadFile = loadFile;
    this.faces = new Map();
    this.instances = new Map();
    this.pending = new Map();
    this.glyphs = new Map();
    this.words = new Map();
  }

  /** Load fonts by id. Unknown ids are an error, so a bad template fails loudly. */
  async ensure(ids) {
    await Promise.all(
      [...new Set(ids)].map((id) => {
        if (this.faces.has(id)) return null;
        const meta = FONT_BY_ID[id];
        if (!meta) throw new Error(`Unknown font: ${id}`);
        if (!this.pending.has(id)) {
          this.pending.set(
            id,
            this.loadFile(meta.file).then((buf) => {
              const face = new hb.Face(new hb.Blob(buf));
              this.faces.set(id, { face, meta, upem: face.upem, coverage: new Set(face.collectUnicodes()) });
            }),
          );
        }
        return this.pending.get(id);
      }),
    );
  }

  font(id, weight) {
    const meta = FONT_BY_ID[id];
    const w = meta.weights ? Math.min(meta.weights[1], Math.max(meta.weights[0], weight || 400)) : 400;
    const key = `${id}@${w}`;
    let inst = this.instances.get(key);
    if (!inst) {
      const rec = this.faces.get(id);
      if (!rec) throw new Error(`Font not loaded: ${id}`);
      const font = new hb.Font(rec.face);
      if (meta.weights) font.setVariations([new hb.Variation('wght', w)]);
      const ext = font.hExtents();
      inst = { key, font, upem: rec.upem, ascender: ext.ascender, descender: ext.descender };
      this.instances.set(key, inst);
    }
    return inst;
  }

  glyph(inst, gid) {
    const k = `${inst.key}:${gid}`;
    let g = this.glyphs.get(k);
    if (!g) {
      g = inst.font.glyphToJson(gid);
      this.glyphs.set(k, g);
    }
    return g;
  }

  /** Split text into runs that one font can draw: the chosen font where it can, a fallback where it can't. */
  runs(text, id) {
    const primary = this.faces.get(id);
    const runs = [];
    for (const { segment } of segmenter.segment(text)) {
      const needsDeva = isDeva(segment);
      const covered = (rec) => rec && [...segment].every((ch) => /\u200c|\u200d/.test(ch) || rec.coverage.has(ch.codePointAt(0)));
      let use = id;
      if (!covered(primary)) {
        const fb = FALLBACK[needsDeva ? 'deva' : 'latin'];
        const rec = this.faces.get(fb);
        use = covered(rec) ? fb : id;
      }
      const last = runs[runs.length - 1];
      if (last && last.id === use && last.deva === needsDeva) last.text += segment;
      else if (last && last.id === use && /^\s+$/.test(segment)) last.text += segment;
      else runs.push({ id: use, text: segment, deva: needsDeva });
    }
    return runs;
  }

  /** Shape one line. Returns glyph commands in font units with positions in mm, and the line width. */
  shapeLine(text, opts) {
    const { font, weight, size, lang, tracking = 0 } = opts;
    const mmPerEm = size * PT;
    const placed = [];
    let pen = 0;
    for (const run of this.runs(text, font)) {
      const inst = this.font(run.id, weight);
      const b = new hb.Buffer();
      b.addText(run.text);
      b.guessSegmentProperties();
      if (run.deva && lang) b.setLanguage(lang);
      hb.shape(inst.font, b);
      const infos = b.getGlyphInfos();
      const positions = b.getGlyphPositions();
      const s = mmPerEm / inst.upem;
      infos.forEach((info, i) => {
        const p = positions[i];
        placed.push({ inst, gid: info.codepoint, x: pen + p.xOffset * s, y: -p.yOffset * s, s });
        pen += p.xAdvance * s;
        // Letter spacing only between Latin clusters. Spacing Devanagari would break the top line.
        const next = infos[i + 1];
        if (tracking && !run.deva && (!next || next.cluster !== info.cluster)) pen += tracking * mmPerEm;
      });
    }
    if (tracking && placed.length) pen -= tracking * mmPerEm;
    return { placed, width: pen };
  }

  wordWidth(word, opts) {
    const k = `${opts.font}|${opts.weight}|${opts.size}|${opts.lang}|${opts.tracking}|${word}`;
    let w = this.words.get(k);
    if (w == null) {
      w = this.shapeLine(word, opts).width;
      this.words.set(k, w);
    }
    return w;
  }

  /** Break text into lines that fit maxWidth (mm). A word wider than the box stays on its own line. */
  wrap(text, opts, maxWidth) {
    const lines = [];
    for (const para of String(text).split('\n')) {
      if (!maxWidth) {
        lines.push(para);
        continue;
      }
      const words = para.split(/ +/);
      let cur = '';
      for (const w of words) {
        const t = cur ? `${cur} ${w}` : w;
        if (cur && this.wordWidth(t, opts) > maxWidth) {
          lines.push(cur);
          cur = w;
        } else cur = t;
      }
      lines.push(cur);
    }
    return lines;
  }

  /** Distance from the top line of the first letters to the baseline, measured from the font's real outlines. */
  hangOffset(str, opts) {
    const probe = isDeva(str) ? 'क' : 'H';
    const { placed } = this.shapeLine(probe, opts);
    const g = placed[0];
    const ext = g && g.inst.font.glyphExtents(g.gid);
    return ext ? ext.yBearing * g.s : opts.size * PT * 0.75;
  }

  /**
   * Lay out a text box. Returns the outlines as one path (in mm) and its measurements.
   * opts: font, weight, size (pt), lang, lineHeight, tracking (em), align, upper, w (box width mm), h, maxLines, minSize, valign
   */
  layout(text, o) {
    let str = String(text ?? '');
    if (o.upper) str = str.toUpperCase();
    let size = o.size;
    const min = o.minSize ?? o.size;
    let lines;
    let fits = false;
    for (;;) {
      const opts = { font: o.font, weight: o.weight, size, lang: o.lang, tracking: o.tracking || 0 };
      lines = this.wrap(str, opts, o.noWrap ? 0 : o.w);
      const widest = Math.max(0, ...lines.map((l) => this.wordWidth(l, opts)));
      const lhMm = size * PT * (o.lineHeight || 1.2);
      fits = (!o.w || widest <= o.w + 0.01) && (!o.maxLines || lines.length <= o.maxLines) && (!o.h || lines.length * lhMm <= o.h + 0.01);
      // Shrink to the design's minimum, then keep going to the floor rather than run off the card.
      // The render step warns the user whenever text ends up too small to read in print.
      if (fits || size <= FLOOR_PT) break;
      size = Math.max(size > min ? min : FLOOR_PT, size - 0.25);
    }
    const opts = { font: o.font, weight: o.weight, size, lang: o.lang, tracking: o.tracking || 0 };
    const metric = this.font(o.font, o.weight);
    const em = size * PT;
    const lh = em * (o.lineHeight || 1.2);
    const asc = (metric.ascender / metric.upem) * em;
    const desc = (metric.descender / metric.upem) * em;
    // "hang": the first line hangs from the box top. Hindi hangs by its top line, Latin by its capitals.
    const baseline0 = o.hang ? this.hangOffset(str, opts) + (isDeva(str) ? 0 : (o.hangGapLatin ?? 0)) : (lh - (asc - desc)) / 2 + asc;
    const total = lines.length * lh;
    const top = o.h && o.valign === 'middle' ? (o.h - total) / 2 : o.h && o.valign === 'bottom' ? o.h - total : 0;
    let d = '';
    let widest = 0;
    lines.forEach((line, li) => {
      const { placed, width } = this.shapeLine(line, opts);
      widest = Math.max(widest, width);
      const boxW = o.w || 0;
      const x0 = o.align === 'center' ? (boxW - width) / 2 : o.align === 'right' ? boxW - width : 0;
      const by = top + baseline0 + li * lh;
      for (const g of placed) d += glyphPath(this.glyph(g.inst, g.gid), (o.x || 0) + x0 + g.x, (o.y || 0) + by + g.y, g.s);
    });
    return {
      d,
      lines,
      size,
      width: widest,
      height: total + (o.hang ? baseline0 - lh + (lh - (asc - desc)) / 2 + asc - desc : 0),
      fits,
      lineHeight: lh,
      top,
    };
  }
}

function glyphPath(cmds, x, y, s) {
  let out = '';
  for (const c of cmds) {
    const v = c.values;
    if (c.type === 'Z') {
      out += 'Z';
      continue;
    }
    out += c.type;
    for (let i = 0; i < v.length; i += 2) out += (i ? ' ' : '') + num(x + v[i] * s) + ' ' + num(y - v[i + 1] * s);
  }
  return out;
}
