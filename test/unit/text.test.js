import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clip, esc, excerpt, slugify } from '../../server/lib/text.js';

test('slugify makes clean URL slugs', () => {
  assert.equal(slugify("Café & Bar's Menu!"), 'cafe-and-bars-menu');
  assert.equal(
    slugify('  Why Your Shop Is Invisible on Google Maps (and How to Fix It)  '),
    'why-your-shop-is-invisible-on-google-maps-and-how-to-fix-it',
  );
  assert.equal(slugify('---'), '');
  assert.equal(slugify(null), '');
  assert.equal(slugify('a'.repeat(100), 10), 'aaaaaaaaaa');
  assert.ok(!slugify('hello world again', 6).endsWith('-'), 'never ends with a dash after cutting');
});

test('esc escapes HTML special characters', () => {
  assert.equal(esc(`<a href="x" onclick='y'>&</a>`), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  assert.equal(esc(undefined), '');
  assert.equal(esc(0), '0');
});

test('excerpt cuts at a word boundary with an ellipsis', () => {
  assert.equal(excerpt('short text'), 'short text');
  const long = 'word '.repeat(60);
  const out = excerpt(long, 50);
  assert.ok(out.length <= 51 && out.endsWith('…'));
  assert.ok(!out.includes('  '));
  assert.equal(excerpt('  spaced\n\nout  '), 'spaced out');
});

test('clip trims and caps', () => {
  assert.equal(clip('  hello  ', 3), 'hel');
  assert.equal(clip(null, 5), '');
});
