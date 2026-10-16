// Pure text helpers shared by the server and its tests.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape for HTML text and double/single-quoted attributes. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** URL-safe slug: "Café & Bar's Menu!" → "cafe-and-bars-menu". Never ends in "-". */
export function slugify(value, max = 80) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
}

/** Collapse whitespace and cut at a word boundary, adding an ellipsis when shortened. */
export function excerpt(text, max = 155) {
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[,;:.\s]+$/, '')}…`;
}

/** "16 Oct 2026" in India time. */
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

export const isoDate = (d) => new Date(d).toISOString();

/** Trimmed string capped at `max` characters ('' for null/undefined). */
export const clip = (value, max) =>
  String(value ?? '')
    .trim()
    .slice(0, max);
