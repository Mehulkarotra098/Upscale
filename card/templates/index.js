// All card templates, plus the function that turns one into an editable design.
import { SET_1 } from './set-1.js';
import { SET_2 } from './set-2.js';
import { SET_3 } from './set-3.js';
import { SET_4 } from './set-4.js';
import { SET_5 } from './set-5.js';
import { SET_6 } from './set-6.js';
import { SET_7 } from './set-7.js';
import { SET_8 } from './set-8.js';

// Everyday professional and local-business cards come first, then the more playful ideas.
export const TEMPLATES = [...SET_7, ...SET_8, ...SET_1, ...SET_6, ...SET_2, ...SET_3, ...SET_4, ...SET_5];

// Decorative art stays put while people work, so a stray drag can't wreck a layout. One tap unlocks any of it.
const FREE_TYPES = new Set(['text', 'list', 'qr', 'logo', 'image', 'icon']);
function lockArt(sides) {
  for (const side of Object.values(sides)) {
    for (const el of side.elements) {
      if (!FREE_TYPES.has(el.type) && el.locked == null) el.locked = true;
      // A QR code opens a link people paste: their website, Instagram or anything else. It uses the card's website until then.
      if (el.type === 'qr' && ['vcard', 'website'].includes(el.data ?? 'vcard')) {
        el.data = '';
        el.qrKind = 'link';
        el.qrIn = {};
      }
      // A QR code opens a link people paste: their website, Instagram or anything else. It uses the card's website until then.
      if (el.type === 'qr' && ['vcard', 'website'].includes(el.data ?? 'vcard')) {
        el.data = '';
        el.qrKind = 'link';
        el.qrIn = {};
      }
    }
  }
  return sides;
}

/** Make an editable design from a template, a palette choice and the user's details. */
export function instantiate(template, { palette = 0, fields } = {}) {
  const { label: _label, ...colours } = template.palettes[palette] ?? template.palettes[0];
  return {
    v: 1,
    template: template.id,
    orientation: template.orientation || 'horizontal',
    lang: template.lang || 'hi',
    fonts: { ...template.fonts },
    palette: colours,
    fields: { ...(fields ?? template.sample) },
    sides: lockArt(structuredClone(template.sides)),
  };
}
