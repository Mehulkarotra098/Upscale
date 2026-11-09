// Blog images get licence metadata as they are served, without the image data changing.
import assert from 'node:assert/strict';
import test from 'node:test';
import { withLicence } from '../../server/media/licence.js';

const LOSSY = Buffer.from('UklGRjQAAABXRUJQVlA4ICgAAABwAQCdASoFAAMAAUAmJaACdAFAAAD+77zxU/+4OP/7g4//uDj90wAA', 'base64');   // 5x3
const ALPHA = Buffer.from('UklGRiIAAABXRUJQVlA4TBYAAAAvA0ABEAdQ5CpUq3gBgCD8b5uI6H8I', 'base64');                          // 4x6, lossless, alpha

function chunks(buf) {
  const out = [];
  for (let i = 12; i + 8 <= buf.length;) { const n = buf.readUInt32LE(i + 4); out.push([buf.toString('latin1', i, i + 4), buf.subarray(i + 8, i + 8 + n)]); i += 8 + n + (n & 1); }
  return out;
}

test('a simple lossy WebP gets VP8X, EXIF and XMP; the image chunk is byte-for-byte the same', () => {
  const out = withLicence(LOSSY, { title: 'Sample', desc: 'Alt & “text” ₹' });
  assert.equal(out.readUInt32LE(4), out.length - 8);
  const c = chunks(out);
  assert.deepEqual(c.map((x) => x[0]), ['VP8X', 'VP8 ', 'EXIF', 'XMP ']);
  assert.equal(c[0][1][0] & 0x0c, 0x0c);
  assert.equal(c[0][1].readUIntLE(4, 3) + 1, 5);
  assert.equal(c[0][1].readUIntLE(7, 3) + 1, 3);
  assert.ok(c[1][1].equals(chunks(LOSSY)[0][1]));
  const xmp = c[3][1].toString('utf8');
  assert.match(xmp, /<xmpRights:WebStatement>https:\/\/uscale\.in\/image-license</);
  assert.match(xmp, /Alt &amp; “text” ₹/);
  assert.match(c[2][1].toString('latin1'), /Copyright 2026 U Scale by Mehul Karotra/);
});

test('a lossless WebP with alpha keeps its alpha flag and size', () => {
  const c = chunks(withLicence(ALPHA, { title: 'a' }));
  assert.equal(c[0][0], 'VP8X');
  assert.equal(c[0][1][0] & 0x10, 0x10);
  assert.equal(c[0][1].readUIntLE(4, 3) + 1, 4);
  assert.equal(c[0][1].readUIntLE(7, 3) + 1, 6);
});

test('already stamped, damaged or non-WebP files come back unchanged', () => {
  const once = withLicence(LOSSY, { title: 'x' });
  assert.equal(withLicence(once), once);
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
  assert.equal(withLicence(png), png);
  const cut = LOSSY.subarray(0, 30);
  assert.equal(withLicence(cut), cut);
});
