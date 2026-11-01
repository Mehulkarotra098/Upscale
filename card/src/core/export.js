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
