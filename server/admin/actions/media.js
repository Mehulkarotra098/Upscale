// Image library. The browser resizes and compresses before upload (admin/src/image.js); the server checks it.
import { LIMITS } from '../../config.js';
import { badRequest, conflict, notFound } from '../../lib/errors.js';
import * as media from '../../repos/media.js';
import { mediaUrl } from '../../media/urls.js';
import * as input from '../input.js';

/** Detect the format from the file's first bytes; anything else is rejected. */
function imageType(buf) {
  if (buf.length < 12) return null;
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'image/png';
  return null;
}

function decode(base64, maxBytes, label) {
  const buf = Buffer.from(String(base64 || ''), 'base64');
  if (!buf.length) return null;
  if (buf.length > maxBytes) throw badRequest(`${label} is larger than ${(maxBytes / 1024 / 1024).toFixed(1)} MB`);
  const type = imageType(buf);
  if (!type) throw badRequest(`${label} must be a JPG, PNG or WebP image`);
  return { buf, type };
}

const withUrls = (m) => ({ ...m, url: mediaUrl(m), small: mediaUrl(m, Boolean(m.sm_width)) });

export default {
  media: {
    method: 'GET',
    async run({ params }) {
      return { media: (await media.list(input.text(params.q, 80))).map(withUrls) };
    },
  },

  'media-upload': {
    method: 'POST',
    async run({ body, user }) {
      const full = decode(body.full, LIMITS.imageFullBytes, 'The image');
      if (!full) throw badRequest('Choose an image to upload');
      const small = decode(body.small, LIMITS.imageSmallBytes, 'The small copy');
      const width = input.int(body.width, { min: 0, max: LIMITS.imageMaxPx + 1 });
      const height = input.int(body.height, { min: 0, max: LIMITS.imageMaxPx + 1 });
      if (!(width > 0 && height > 0 && width <= LIMITS.imageMaxPx && height <= LIMITS.imageMaxPx)) throw badRequest('Invalid image size');
      const row = await media.insert({
        name: input.text(body.name, 100).replace(/\.[a-z0-9]+$/i, '') || 'image',
        mime: full.type,
        width,
        height,
        full: full.buf,
        small: small?.buf ?? null,
        smWidth: small ? input.int(body.sm_width, { min: 1, max: width, fallback: null }) : null,
        alt: input.text(body.alt, 250),
        caption: input.text(body.caption, 300),
        uploadedBy: user.id,
      });
      return { media: withUrls(row) };
    },
  },

  'media-update': {
    method: 'POST',
    async run({ body }) {
      const row = await media.updateText(input.requireId(body.id, 'image'), {
        alt: input.text(body.alt, 250),
        caption: input.text(body.caption, 300),
      });
      if (!row) throw notFound('Image not found');
      return { media: withUrls(row) };
    },
  },

  'media-delete': {
    method: 'POST',
    async run({ body }) {
      const mediaId = input.requireId(body.id, 'image');
      const used = await media.usage(mediaId);
      if (used && !input.bool(body.force))
        throw conflict(`This image is used in ${used} post${used > 1 ? 's' : ''}. Remove it there first.`);
      if (!(await media.remove(mediaId))) throw notFound('Image not found');
      return { ok: true };
    },
  },
};
