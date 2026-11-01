# Writing card templates

Each template is a JavaScript object in a `set-N.js` file. Read `set-1.js` for 12 working examples, and `art.js` for the kind of code-drawn artwork they use.

## The bar

A template must be something a real shop owner, doctor or freelancer would actually print and hand out with their own details on it. Beauty and usefulness come first. A clever idea only counts if it survives real details.

- **Real details first.** People type long clinic names, long addresses and Hindi. A template that only looks good with its short sample text is broken. See "Stacks" below.
- **Clear hierarchy.** At arm's length you should read the name or business first, then what they do, then how to reach them. Name or business is 11 pt or more. Contact details are 6.5 pt or more, and never shrink below 5.5.
- **Real polish.** Considered proportions, generous margins, confident type pairing, a controlled palette and one strong visual idea per card. It should look professionally designed, not like clip art, and not busy. Text sits on calm space, never on busy art.
- **A front and a back that belong together.** The back carries the brand and a QR code that is easy to scan.
- **A logo slot.** Each template has a `logo` element on the front or back, so a person's logo has a home. It shows their initials until they upload one.
- **No gimmick copy.** Nothing printed on the card that the person didn't type, except small generic words such as "Scan to save". No "TO LET", no fake times, no invented slogans.
- Don't repeat an idea or layout from another template. Colour swaps never count as new designs.
- Work must be original. Don't copy or imitate any existing template, brand or product. Draw art with code.
- No stock photos, no photo placeholders, no famous brand names or logos.
- No religious symbols or gods (no Om, swastik, crosses, deities). Festive and cultural patterns are fine.
- No claims about results, and nothing like "No. 1" or "best in Mumbai" in sample copy.
- Sample details are invented. Never use a real business or person. Use `.example` for web and email domains, and phone `+91 98765 43210`.

## Stacks: how text holds real details

**All details text goes in a stack.** Import the helpers from `kit.js`, and see `set-6.js` for working examples.

A stack is a box on one side of the card. Its members flow one after another inside the box, so they can't collide or leave it. Too much text, and they all shrink together down to their `minSize`, then members marked `optional: true` are dropped, last first.

```js
front: {
  background: '$paper',
  stacks: {
    who: { x: 31, y: 6, w: 53, h: 21, anchor: 'top', gap: 0.8 },       // anchor: top, middle or bottom
    reach: { x: 31, y: 28, w: 53, h: 18.8, anchor: 'bottom' },
  },
  elements: [
    T('name', '{name}', 31, 53, 15, { stack: 'who', font: '$heading', weight: 800, fill: '$ink', minSize: 9.5, maxLines: 2, lineHeight: 1.1 }),
    T('company', '{company}', 31, 53, 7.8, { stack: 'who', fill: '$accent', minSize: 6, maxLines: 2, optional: true }),
    L('contact', ['phone', 'email', 'website', 'address'], 31, 53, 6.8, { stack: 'reach', fill: '$ink', iconFill: '$accent' }),
  ],
}
```

- Keep the art out of the stack's box. That box is the promise that text sits on calm space, whatever someone types.
- Use two stacks, top and bottom, rather than one long one. It keeps the layout's shape when details are short.
- Give members `x` and `w` matching their stack. `gap` on a member overrides the stack's gap.
- Use `when: 'field'` for art that only makes sense when a field is filled in.
- Every long field needs room to wrap: give `maxLines` of 2 or 3 rather than `noWrap`, except for phone numbers.
- QR codes are 26 mm wide or more when they hold a contact (`data: 'vcard'`), because a full contact makes a dense code.

## Size and safety

- Units are millimetres, and font sizes are points.
- Trim is 88.9 × 50.8 mm. A vertical template (`orientation: 'vertical'`) is 50.8 × 88.9 mm.
- The origin (0,0) is the top-left of the trim. Backgrounds and art may run 3 mm past the edge (x or y = -3).
- Keep text and QR codes at least 4 mm inside the edge. The check fails anything within 2 mm.
- Keep body text at 6 pt or more, and never set `minSize` below 5.5.
- QR codes must be at least 18 mm wide, dark on light with strong contrast. Use `dark` that's near-black or very deep and `light` that's very pale. Don't use `light: 'none'` unless the background behind it is very pale.

## Template shape

```js
{
  id: 'short-kebab-id',          // unique across all sets
  name: 'Display Name',          // 1 or 2 words
  category: 'retail',            // retail, food, health, beauty, professional, trades, creative, tech, bold, minimal, luxury, playful, traditional, hindi, marathi
  tags: ['boutique', 'saree'],   // searched in the gallery: business types and styles
  orientation: 'vertical',       // optional
  lang: 'hi',                    // optional: 'hi' (default) or 'mr'. Sets letter shapes for Devanagari text
  fonts: { heading: 'fraunces', body: 'dmsans' },
  palettes: [                    // at least 4. Same colour names in each, plus a label. Each must look deliberately different
    { label: 'Maroon', paper: '#F7EEDD', deep: '#6E1423' },
  ],
  sample: { name, title, company, tagline, phone, whatsapp, email, website, address, hours }, // only those the design uses
  sides: { front: { background, elements: [] }, back: { background, elements: [] } },
}
```

Colours can be `'$paper'` (from the palette) or `'#112233'`. Fonts can be `'$heading'`, `'$body'` or a font id. A paint can be a colour, or a gradient: `{ type: 'linear', angle: 45, stops: [[0, '$a'], [1, '$b']] }` or `{ type: 'radial', cx: 0.5, cy: 0.5, r: 0.7, stops: [...] }`.

Elements draw in order, bottom first. Every element needs a unique `id` within its side.

| Type | Key properties |
|---|---|
| `text` | `text` (`'{name}'` tokens fill from details), `x y w`, optional `h`, `size`, `minSize`, `maxLines`, `noWrap`, `weight`, `font`, `fill`, `align`, `valign` (needs `h`), `lineHeight`, `tracking`, `upper`, `opacity`, `rot`, `hang`, `hangGapLatin` |
| `list` | Contact rows. `items: ['phone','email','website','address','hours','whatsapp','name']`, `x y w`, `h` + `valign: 'bottom'`, `size`, `rowHeight`, `icons: false`, `fill`, `iconFill`, `align`, `font`, `weight`, `minSize`. Empty fields vanish and rows close up |
| `rect` | `x y w h r fill stroke sw dash opacity rot` |
| `ellipse` | `x y w h fill stroke sw dash opacity rot` |
| `line` | `x y w h stroke sw dash cap` (`h: 0` is horizontal) |
| `path` | `x y w h d` (SVG path, any commands), `vb: [x, y, w, h]` to scale, `fill stroke sw dash cap join evenodd opacity rot` |
| `icon` | `name x y w stroke sw` (names in `src/core/icons.js`) |
| `qr` | `data: 'vcard' | 'website' | 'whatsapp'` or literal text, `x y w light dark quiet r` |
| `logo` | The user's logo, or their initials if none. `x y w h align fallbackFont fallbackWeight fallbackSize fill fallback` |

**Text growth.** User details vary hugely, and your layout must survive it:
- Give every text a `minSize` so it shrinks, and `maxLines` where it must not grow.
- `below: 'otherId'` makes an element move down if the one above grows. `gap` sets the space. Use it for stacked text.
- Lists with `valign: 'bottom'` stay anchored to the bottom.
- `hang: true` hangs text by its top line from `y`, which suits Hindi headline designs.

**Field tokens** are `{name} {title} {company} {tagline} {phone} {whatsapp} {email} {website} {address} {hours}`. A `text` element disappears when its tokens are all empty. Use `when: 'website'` to hide anything else (like an icon or a label) when that field is empty.

**Hindi text** falls back to Noto Sans Devanagari in Latin-only fonts. Hindi-first designs should use a Devanagari font for headings: `baloo2`, `rozha`, `tiro`, `yatra`, `notosansdeva`, `notoserifdeva`.

**Latin fonts:** `inter manrope outfit montserrat dmsans spacegrotesk bricolage syne anton bebas playfair fraunces cormorant lora dmserif marcellus jetbrains caveat`.

Draw art with functions at the top of your own set file. Return path data in millimetres from the box's top-left, and pass `w`, `h` equal to the box so no `vb` is needed. Keep paths reasonably small: thousands of tiny shapes slow down phones and bloat files. Aim for under 60 KB of path data per template.

Avoid: blur, shadows and blend modes (the engine has none), text over busy art without a solid shape behind it, very thin lines (use `sw` of 0.1 mm or more), and pale text on pale backgrounds.

## Checking your work

`CARD_PW_DIR` points to a folder that has Playwright, jsQR and pdf.js installed.

```
node card/tools/contact-sheet.mjs <folder> <id> <id> ...      # renders samples, palettes, and stress tests, prints warnings
node card/tools/montage.mjs <folder> <out.png> <cols> <cardWidth> <variants> <id> ...   # variants: sample, palette2, palette3, long, short, hindi
node card/tools/verify-exports.mjs <folder> <id> ...          # PDF, PNG and QR scan checks
```

**A template is done when:**
1. `node card/tools/design-audit.mjs <ids>` reports zero problems. It tries each template with 7 sets of details (a long clinic name, Hindi, Marathi, almost nothing, and so on) on both sides, and it catches text that's unreadable on its background, covered, cut off, colliding or too small. Don't lower any floor to pass, and don't hide problems: fix the layout, or drop the design.
2. You've looked at it with real details, every palette included, using `--sheet out.png <set> both` (sets: `sample founder doctor hindi marathi tiny shop`). Nothing collides, clips or looks accidental, and it still looks good with the `tiny` set, where most fields are empty.
3. `verify-exports` passes.
4. Someone would be happy to hand it to a customer.
