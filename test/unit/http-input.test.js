import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import * as input from '../../server/admin/input.js';
import { HttpError } from '../../server/lib/errors.js';
import { clientIp, cookies, readJSON } from '../../server/lib/http.js';

const stream = (s) => Object.assign(Readable.from([Buffer.from(s)]), { headers: {} });

test('readJSON: pre-parsed, string and streamed bodies', async () => {
  assert.deepEqual(await readJSON({ body: { a: 1 } }), { a: 1 });
  assert.deepEqual(await readJSON({ body: '{"a":2}' }), { a: 2 });
  assert.deepEqual(await readJSON(stream('{"a":3}')), { a: 3 });
  assert.deepEqual(await readJSON(stream('')), {});
});

test('readJSON: rejects oversized, invalid and non-object bodies with a 4xx', async () => {
  await assert.rejects(readJSON(stream('x'.repeat(50)), 10), (e) => e instanceof HttpError && e.status === 413);
  await assert.rejects(readJSON(stream('{nope')), (e) => e.status === 400);
  await assert.rejects(readJSON(stream('[1,2]')), (e) => e.status === 400);
  await assert.rejects(readJSON(stream('null')), (e) => e.status === 400);
});

test('cookies tolerate malformed values', () => {
  assert.deepEqual(cookies({ headers: { cookie: 'a=1; bad=%E0%A4%A; b=x%20y' } }), { a: '1', b: 'x y' });
});

test('clientIp prefers the platform header over spoofable forwarded-for', () => {
  const prev = process.env.VERCEL;
  process.env.VERCEL = '1';
  try {
    assert.equal(clientIp({ headers: { 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '6.6.6.6, 1.1.1.1' } }), '1.1.1.1');
    assert.equal(clientIp({ headers: { 'x-forwarded-for': '6.6.6.6' }, socket: { remoteAddress: '9.9.9.9' } }), '9.9.9.9');
  } finally {
    if (prev === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = prev;
  }
});

test('input helpers shape untrusted values', () => {
  assert.equal(input.id('12'), 12);
  for (const bad of ['0', '-1', '1.5', 'x', null, '9007199254740993']) assert.equal(input.id(bad), null);
  assert.throws(() => input.requireId('x', 'post'), /invalid post id/);
  assert.equal(input.email(' Me@Example.COM '), 'me@example.com');
  assert.throws(() => input.email('nope'), /valid email/);
  assert.equal(input.httpsUrl(''), '');
  assert.equal(input.httpsUrl('https://a.co/x'), 'https://a.co/x');
  assert.throws(() => input.httpsUrl('http://a.co'), /https/);
  assert.throws(() => input.httpsUrl('javascript:alert(1)'), /https/);
  assert.deepEqual(input.tags([' SEO ', 'seo', '', 'Local SEO', 5]), ['seo', 'local seo', '5']);
  assert.deepEqual(input.faq([{ q: 'Q', a: 'A' }, { q: 'no answer' }, null]), [{ q: 'Q', a: 'A' }]);
  assert.equal(input.int('7.9', { max: 5 }), 5);
  assert.equal(input.date('not a date'), null);
  assert.throws(() => input.password('short', 10), /at least 10/);
});
