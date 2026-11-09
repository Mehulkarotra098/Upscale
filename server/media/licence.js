// Licence metadata (EXIF + XMP) for uploaded blog images, added as they are served. The WebP image data is not touched:
// the two metadata chunks are added around it, so every image (old uploads and new ones) carries the same licence fields
// as the site's own images (see source/build/stamp_image_meta.py and https://uscale.in/image-license).

const LICENCE = 'https://uscale.in/image-license';
const RIGHTS = '© 2026 U Scale by Mehul Karotra. All rights reserved.';
const RIGHTS_ASCII = 'Copyright 2026 U Scale by Mehul Karotra. All rights reserved.';

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ascii = (s) => String(s).replace(/[^\x20-\x7e]/g, '?');

export function xmpPacket(title, desc) {
  return Buffer.from(`<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/">
<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xml(title)}</rdf:li></rdf:Alt></dc:title>
<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${xml(desc)}</rdf:li></rdf:Alt></dc:description>
<dc:creator><rdf:Seq><rdf:li>U Scale</rdf:li></rdf:Seq></dc:creator>
<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${RIGHTS}</rdf:li></rdf:Alt></dc:rights>
<xmpRights:Marked>True</xmpRights:Marked>
<xmpRights:WebStatement>${LICENCE}</xmpRights:WebStatement>
<photoshop:Source>https://uscale.in/</photoshop:Source>
<plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>U Scale</plus:LicensorName><plus:LicensorURL>${LICENCE}</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor>
<photoshop:Credit>U Scale</photoshop:Credit>
<photoshop:City>Mumbai</photoshop:City>
<photoshop:Country>India</photoshop:Country>
<Iptc4xmpCore:AltTextAccessibility><rdf:Alt><rdf:li xml:lang="x-default">${xml(desc)}</rdf:li></rdf:Alt></Iptc4xmpCore:AltTextAccessibility>
</rdf:Description></rdf:RDF></x:xmpmeta>
<?xpacket end="w"?>`, 'utf8');
}

/** A little-endian TIFF (raw EXIF) with ImageDescription, Artist and Copyright. */
export function exifTiff(desc) {
  const tags = [[0x010e, ascii(desc)], [0x013b, 'U Scale'], [0x8298, RIGHTS_ASCII]].map(([t, s]) => [t, Buffer.from(s + '\0', 'latin1')]);
  const ifdLen = 2 + tags.length * 12 + 4;
  let dataOff = 8 + ifdLen;
  const head = Buffer.alloc(8 + ifdLen);
  head.write('II', 0, 'latin1'); head.writeUInt16LE(42, 2); head.writeUInt32LE(8, 4); head.writeUInt16LE(tags.length, 8);
  const datas = [];
  tags.forEach(([tag, val], i) => {
    const o = 10 + i * 12;
    head.writeUInt16LE(tag, o); head.writeUInt16LE(2, o + 2); head.writeUInt32LE(val.length, o + 4);
    if (val.length <= 4) { val.copy(head, o + 8); } else { head.writeUInt32LE(dataOff, o + 8); datas.push(val); dataOff += val.length; }
  });
  head.writeUInt32LE(0, 10 + tags.length * 12);
  return Buffer.concat([head, ...datas]);
}

/** Canvas size and alpha of a simple (VP8 / VP8L) WebP, for the VP8X header. */
function frameInfo(tag, data) {
  if (tag === 'VP8 ' && data[3] === 0x9d && data[4] === 0x01 && data[5] === 0x2a) {
    return { w: data.readUInt16LE(6) & 0x3fff, h: data.readUInt16LE(8) & 0x3fff, alpha: false };
  }
  if (tag === 'VP8L' && data[0] === 0x2f) {
    const b = data.readUInt32LE(1);
    return { w: (b & 0x3fff) + 1, h: ((b >>> 14) & 0x3fff) + 1, alpha: Boolean((b >>> 28) & 1) };
  }
  return null;
}

/** The same WebP with EXIF and XMP licence chunks; anything else (or a file that already has them) comes back unchanged. */
export function withLicence(buf, { title = 'U Scale image', desc = '' } = {}) {
  try {
    if (!Buffer.isBuffer(buf) || buf.length < 20 || buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return buf;
    if (buf.includes('WebStatement')) return buf;
    const chunks = [];
    for (let i = 12; i + 8 <= buf.length;) {
      const tag = buf.toString('latin1', i, i + 4), n = buf.readUInt32LE(i + 4);
      if (i + 8 + n > buf.length) return buf;   // damaged file: serve it as it is
      if (tag !== 'EXIF' && tag !== 'XMP ') chunks.push([tag, buf.subarray(i + 8, i + 8 + n)]);
      i += 8 + n + (n & 1);
    }
    if (!chunks.length) return buf;
    if (chunks[0][0] !== 'VP8X') {
      const f = frameInfo(chunks[0][0], chunks[0][1]);
      if (!f) return buf;
      const v = Buffer.alloc(10);
      v[0] = f.alpha ? 0x10 : 0; v.writeUIntLE(f.w - 1, 4, 3); v.writeUIntLE(f.h - 1, 7, 3);
      chunks.unshift(['VP8X', v]);
    } else {
      chunks[0][1] = Buffer.from(chunks[0][1]);
    }
    chunks[0][1][0] |= 0x08 | 0x04;   // EXIF and XMP present
    chunks.push(['EXIF', exifTiff(desc || title)], ['XMP ', xmpPacket(title, desc || title)]);
    const parts = [Buffer.from('WEBP', 'latin1')];
    for (const [tag, data] of chunks) {
      const h = Buffer.alloc(8); h.write(tag, 0, 'latin1'); h.writeUInt32LE(data.length, 4);
      parts.push(h, data);
      if (data.length & 1) parts.push(Buffer.alloc(1));
    }
    const body = Buffer.concat(parts), head = Buffer.alloc(8);
    head.write('RIFF', 0, 'latin1'); head.writeUInt32LE(body.length, 4);
    return Buffer.concat([head, body]);
  } catch {
    return buf;
  }
}
