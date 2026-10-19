import assert from 'node:assert/strict';
import { test } from 'node:test';

const { featureId, placeIdFromFeature, placeName, isShortLink, resolveShortLink, reviewUrl } = await import('../../server/lib/maplink.js');

// Real example checked by hand: this feature id opens "Gateway Of India Mumbai", and the Place ID below opens its review box.
const FULL =
  'https://www.google.com/maps/place/Gateway+Of+India+Mumbai/@18.9219841,72.8346543,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7d1c73a0d5cad:0xc70a25a7209c733c!8m2!3d18.9219841!4d72.8346543';

test('feature id → Place ID matches Google', () => {
  assert.equal(featureId(FULL), '0x3be7d1c73a0d5cad:0xc70a25a7209c733c');
  assert.equal(placeIdFromFeature('0x3be7d1c73a0d5cad:0xc70a25a7209c733c'), 'ChIJrVwNOsfR5zsRPHOcIKclCsc');
  assert.equal(featureId('...%211s0x3BE7d1c73a0d5cad%3A0xc70a25a7209c733c...'), '0x3be7d1c73a0d5cad:0xc70a25a7209c733c');
  assert.equal(placeIdFromFeature('nonsense'), null);
  assert.equal(placeIdFromFeature('0x1:0xZZ'), null);
});

test('place name comes from the /maps/place/ path', () => {
  assert.equal(placeName(FULL), 'Gateway Of India Mumbai');
  assert.equal(placeName('https://www.google.com/maps/place/Caf%C3%A9+Mondegar/@1,2'), 'Café Mondegar');
  assert.equal(placeName('https://www.google.com/search?q=x'), '');
});

test('only short Google links are expanded (no open redirect / SSRF)', () => {
  assert.equal(isShortLink('https://maps.app.goo.gl/n1zbbYH7r5RaFjJ18'), true);
  assert.equal(isShortLink('https://goo.gl/maps/abc'), true);
  assert.equal(isShortLink('https://goo.gl/other'), false);
  assert.equal(isShortLink('https://g.page/r/abc/review'), false);
  assert.equal(isShortLink('https://g.page/sharma-sarees'), true);
  assert.equal(isShortLink('https://evil.example/maps'), false);
  assert.equal(isShortLink('http://169.254.169.254/latest'), false);
  assert.equal(isShortLink('file:///etc/passwd'), false);
  assert.equal(isShortLink('not a url'), false);
});

const resp = (status, headers = {}, body = '') => ({
  status,
  ok: status >= 200 && status < 300,
  headers: new Map(Object.entries(headers)),
  text: async () => body,
});

test('follows Google redirects to the place', async () => {
  const hops = [resp(302, { location: FULL })];
  const r = await resolveShortLink('https://maps.app.goo.gl/n1zbbYH7r5RaFjJ18', { fetchImpl: async () => hops.shift() });
  assert.deepEqual(r, { placeId: 'ChIJrVwNOsfR5zsRPHOcIKclCsc', name: 'Gateway Of India Mumbai', url: FULL });
  assert.equal(reviewUrl(r.placeId), 'https://search.google.com/local/writereview?placeid=ChIJrVwNOsfR5zsRPHOcIKclCsc');
});

test('refuses to follow a redirect off Google', async () => {
  const seen = [];
  const r = await resolveShortLink('https://maps.app.goo.gl/x1', {
    fetchImpl: async (u) => (seen.push(u), resp(302, { location: 'https://evil.example/0x1:0x2' })),
  });
  assert.equal(r, null);
  assert.equal(seen.length, 1);
});

test('finds the feature id in the page body when there is no redirect', async () => {
  const r = await resolveShortLink('https://share.google/abc', {
    fetchImpl: async () => resp(200, {}, '<a href="/maps?ftid=0x3be7d1c73a0d5cad:0xc70a25a7209c733c">'),
  });
  assert.equal(r.placeId, 'ChIJrVwNOsfR5zsRPHOcIKclCsc');
});

test('network errors return null', async () => {
  assert.equal(
    await resolveShortLink('https://maps.app.goo.gl/x', {
      fetchImpl: async () => {
        throw new Error('down');
      },
    }),
    null,
  );
});
