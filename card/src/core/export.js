// Browser-only download builders. PNG comes from the SVG drawn to a canvas, PDF from the same SVG through jsPDF + svg2pdf.js,
// so all three formats start from one piece of artwork. jsPDF and svg2pdf.js are loaded by the caller only when a PDF is asked for.

const MM = 72 / 25.4;
const CRC = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Add print-size metadata to a PNG, so design and print software open it at the right physical size. */
async function withDpi(blob, dpi) {
  const src = new Uint8Array(await blob.arrayBuffer());
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4); // pHYs
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1;
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const at = 33; // right after the PNG signature and IHDR
  const out = new Uint8Array(src.length + 21);
  out.set(src.subarray(0, at));
  out.set(chunk, at);
  out.set(src.subarray(at), at + 21);
  return new Blob([out], { type: 'image/png' });
}

const mmFromSvg = (svg) => {
  const m = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/);
  if (!m) throw new Error('SVG has no size in mm');
  return { w: Number(m[1]), h: Number(m[2]) };
};

/** Draw an SVG into a canvas at a given dpi. */
export async function svgToCanvas(svg, dpi) {
  const { w, h } = mmFromSvg(svg);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = Math.round((w / 25.4) * dpi);
    c.height = Math.round((h / 25.4) * dpi);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    // Safari can draw an SVG with embedded images blank on the first pass, so it gets a second one when images are present.
    if (svg.includes('<image')) {
      await new Promise((r) => setTimeout(r, 60));
      ctx.drawImage(img, 0, 0, c.width, c.height);
    }
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function svgToPng(svg, dpi = 600) {
  const c = await svgToCanvas(svg, dpi);
  const blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'));
  return withDpi(blob, dpi);
}

/**
 * Build a PDF, one page per SVG. pages: [{ svg, trim?, bleed? }], with trim and bleed in mm from the page's top-left.
 * libs: { jsPDF, svg2pdf }. Binary output only: jsPDF's data-URI output damaged files in testing.
 */
export async function svgsToPdf(pages, libs, { title = 'Card' } = {}) {
  const { jsPDF, svg2pdf } = libs;
  let doc = null;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  document.body.appendChild(holder);
  try {
    for (const p of pages) {
      const { w, h } = mmFromSvg(p.svg);
      const W = w * MM;
      const H = h * MM;
      const orientation = W > H ? 'landscape' : 'portrait'; // must match, or jsPDF swaps the page's width and height
      if (!doc) doc = new jsPDF({ unit: 'pt', format: [W, H], orientation, compress: true });
      else doc.addPage([W, H], orientation);
      const box = (b) => ({
        bottomLeftX: b.x * MM,
        bottomLeftY: H - (b.y + b.h) * MM,
        topRightX: (b.x + b.w) * MM,
        topRightY: H - b.y * MM,
      });
      const ctx = doc.internal.getCurrentPageInfo().pageContext;
      if (p.trim) ctx.trimBox = box(p.trim);
      if (p.bleed) ctx.bleedBox = box(p.bleed);
      const el = new DOMParser().parseFromString(p.svg, 'image/svg+xml').documentElement;
      holder.replaceChildren(el);
      await svg2pdf(el, doc, { x: 0, y: 0, width: W, height: H });
    }
    doc.setProperties({ title, creator: 'U Scale free card maker (uscale.in/tools)' });
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } finally {
    holder.remove();
  }
}

/** JPG copy of an SVG, on a white ground (JPG has no transparency). */
export async function svgToJpeg(svg, dpi = 300, quality = 0.92) {
  const c = await svgToCanvas(svg, dpi);
  const flat = document.createElement('canvas');
  flat.width = c.width;
  flat.height = c.height;
  const x = flat.getContext('2d');
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, flat.width, flat.height);
  x.drawImage(c, 0, 0);
  return new Promise((res, rej) => flat.toBlob((b) => (b ? res(b) : rej(new Error('JPG failed'))), 'image/jpeg', quality));
}

/**
 * A zip file with no compression. PNG and PDF are already compressed, so storing them as they are keeps this tiny and fast.
 * files: [{ name, bytes: Uint8Array }]. Names are written as UTF-8.
 */
export function zipStore(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  // A fixed date: zip needs one, and a constant keeps the same input producing the same file.
  const time = 0;
  const date = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.bytes);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // names are UTF-8
    lv.setUint16(8, 0, true); // stored
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, f.bytes.length, true);
    lv.setUint32(22, f.bytes.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    const head = new Uint8Array(46 + name.length);
    const hv = new DataView(head.buffer);
    hv.setUint32(0, 0x02014b50, true);
    hv.setUint16(4, 20, true);
    hv.setUint16(6, 20, true);
    hv.setUint16(8, 0x0800, true);
    hv.setUint16(10, 0, true);
    hv.setUint16(12, time, true);
    hv.setUint16(14, date, true);
    hv.setUint32(16, crc, true);
    hv.setUint32(20, f.bytes.length, true);
    hv.setUint32(24, f.bytes.length, true);
    hv.setUint16(28, name.length, true);
    hv.setUint32(42, offset, true);
    head.set(name, 46);
    parts.push(local, f.bytes);
    central.push(head);
    offset += local.length + f.bytes.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}

/** How many tiles of a given width fit on an A4 page, and where each one goes (all in mm). */
export function a4Grid(tileW, tileH, { margin = 10, gap = 4, caption = 0 } = {}) {
  const cols = Math.max(1, Math.floor((210 - 2 * margin + gap) / (tileW + gap)));
  const rows = Math.max(1, Math.floor((297 - 2 * margin + gap) / (tileH + caption + gap)));
  const left = (210 - (cols * tileW + (cols - 1) * gap)) / 2;
  const top = (297 - (rows * (tileH + caption) + (rows - 1) * gap)) / 2;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) cells.push({ x: left + c * (tileW + gap), y: top + r * (tileH + caption + gap) });
  return { cols, rows, perPage: cols * rows, cells };
}

/**
 * A4 pages of codes to print and cut. items: [{ svg, caption? }], laid out left to right, top to bottom, as many pages as
 * they need. Every tile is drawn as vector art, with a light dashed cut line around it.
 */
export async function svgTilesToPdf(items, libs, { tileW = 40, title = 'QR codes', captions = false } = {}) {
  const { jsPDF, svg2pdf } = libs;
  const first = mmFromSvg(items[0].svg);
  const tileH = (tileW * first.h) / first.w;
  const caption = captions ? 6 : 0;
  const grid = a4Grid(tileW, tileH, { caption });
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true });
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  document.body.appendChild(holder);
  try {
    for (let i = 0; i < items.length; i++) {
      const slot = i % grid.perPage;
      if (i && slot === 0) doc.addPage('a4', 'portrait');
      const { x, y } = grid.cells[slot];
      const el = new DOMParser().parseFromString(items[i].svg, 'image/svg+xml').documentElement;
      holder.replaceChildren(el);
      await svg2pdf(el, doc, { x: x * MM, y: y * MM, width: tileW * MM, height: tileH * MM });
      doc.setDrawColor(170);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect((x - 2) * MM, (y - 2) * MM, (tileW + 4) * MM, (tileH + caption + 4) * MM);
      doc.setLineDashPattern([], 0);
      if (captions && items[i].caption) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(Math.max(6, Math.min(9, tileW / 4.5)));
        doc.setTextColor(40);
        doc.text(items[i].caption, (x + tileW / 2) * MM, (y + tileH + 4.2) * MM, { align: 'center', maxWidth: tileW * MM });
      }
    }
    doc.setProperties({ title, creator: 'U Scale free QR code generator (uscale.in/tools)' });
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } finally {
    holder.remove();
  }
}
