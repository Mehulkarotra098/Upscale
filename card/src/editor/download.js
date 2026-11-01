// Building and saving files. PDF libraries load only when someone asks for a PDF.
import { svgToPng, svgsToPdf } from '../core/export.js';
import { a4SheetSvg, printPageSvg, sideToSvg } from '../core/render.js';

export const slug = (doc) =>
  (doc.fields?.company || doc.fields?.name || 'my-card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'my-card';

/** Instagram, Facebook and WhatsApp open links in built-in browsers, and these often block downloads. */
export const inAppBrowser = () => /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|Snapchat|\bwv\b/i.test(navigator.userAgent);

export async function saveBlob(blob, name) {
  if (inAppBrowser() && navigator.canShare) {
    const file = new File([blob], name, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}

async function pdfLibs() {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  return { jsPDF, svg2pdf };
}

export async function downloadPng(doc, side, engine, { dpi = 600, bleed = false } = {}) {
  const { svg } = sideToSvg(doc, side, engine, { bleed });
  await saveBlob(await svgToPng(svg, dpi), `${slug(doc)}-${side}-${dpi}dpi.png`);
}

export async function downloadSvg(doc, side, engine, { bleed = false } = {}) {
  const { svg } = sideToSvg(doc, side, engine, { bleed });
  await saveBlob(new Blob([svg], { type: 'image/svg+xml' }), `${slug(doc)}-${side}.svg`);
}

export async function downloadPrintPdf(doc, engine, { marks = false } = {}) {
  const pages = ['front', 'back'].filter((s) => hasContent(doc, s)).map((s) => printPageSvg(doc, s, engine, { marks }));
  const blob = await svgsToPdf(pages, await pdfLibs(), { title: `${doc.fields?.company || doc.fields?.name || 'Card'} visiting card` });
  await saveBlob(blob, `${slug(doc)}-print.pdf`);
}

export async function downloadSheetPdf(doc, engine) {
  const pages = ['front', 'back'].filter((s) => hasContent(doc, s)).map((s) => ({ svg: a4SheetSvg(doc, s, engine).svg }));
  const blob = await svgsToPdf(pages, await pdfLibs(), { title: `${doc.fields?.company || doc.fields?.name || 'Card'} A4 sheet` });
  await saveBlob(blob, `${slug(doc)}-a4-sheet.pdf`);
}

const hasContent = (doc, side) => {
  const s = doc.sides[side];
  return s.elements.length > 0 || (s.background && s.background !== '#FFFFFF');
};

export function downloadDesignFile(doc) {
  return saveBlob(new Blob([JSON.stringify(doc)], { type: 'application/json' }), `${slug(doc)}.uscale-card.json`);
}
