// Public URLs of uploaded images. The id identifies the image; the name part is only for SEO and humans.
import { toDbId } from '../lib/ids.js';
import { slugify } from '../lib/text.js';

/** /media/<id>-<name>.webp, or the 800px copy with `small`. */
export function mediaUrl(media, small = false) {
  const name = slugify(media.name || 'image', 60) || 'image';
  return `/media/${media.id}-${name}${small ? '-800' : ''}.webp`;
}

const PATTERN = /^(\d+)-[a-z0-9-]*?(-800)?\.(?:webp|jpe?g|png|avif)$/i;

/** Parse the file part of a /media/ URL → { id, small } or null. */
export function parseMediaFile(file) {
  const m = String(file || '').match(PATTERN);
  const id = m ? toDbId(m[1]) : null;
  return id ? { id, small: Boolean(m[2]) } : null;
}

/** Media id from an <img src> pointing at our /media/ route (absolute or root-relative), else null. */
export function mediaIdFromSrc(src) {
  const m = String(src || '').match(/^(?:https?:\/\/[^/]+)?\/media\/([^?#]+)/i);
  return m ? (parseMediaFile(m[1])?.id ?? null) : null;
}
