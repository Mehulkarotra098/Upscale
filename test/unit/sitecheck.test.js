import assert from 'node:assert/strict';
import { test } from 'node:test';

const { isPrivateIp, normaliseUrl, analyse, checkSite } = await import('../../server/lib/sitecheck.js');
const { allow, _resetRateLimits } = await import('../../server/lib/ratelimit.js');

test('private, loopback, link-local and metadata addresses are refused', () => {
  for (const ip of [
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ])
    assert.equal(isPrivateIp(ip), true, ip);
  for (const ip of ['8.8.8.8', '76.76.21.21', '172.32.0.1', '2606:4700:4700::1111']) assert.equal(isPrivateIp(ip), false, ip);
  assert.equal(isPrivateIp('not-an-ip'), true);
});

test('only plain public website URLs are accepted', () => {
  assert.equal(normaliseUrl('sharmasarees.in').toString(), 'https://sharmasarees.in/');
  assert.equal(normaliseUrl('http://shop.example.com/about#x').toString(), 'http://shop.example.com/about');
  for (const bad of [
    '',
    'localhost',
    'http://localhost:3000',
    'ftp://x.com',
    'https://x.com:8080',
    'https://user:pw@x.com',
    'http://10.0.0.1',
    'http://[::1]/',
    'intranet',
    'a b.com',
    'https://printer.local',
  ])
    assert.equal(normaliseUrl(bad), null, bad);
});

const GOOD = `<!doctype html><html><head><title>Sharma Sarees | Silk sarees in Andheri East</title>
<meta name="viewport" content="width=device-width"><meta name="description" content="Handwoven silk and cotton sarees in Andheri East, Mumbai. Open 10am to 9pm, all days.">
<script type="application/ld+json">{"@type":"ClothingStore","name":"Sharma Sarees","telephone":"+91 98200 12345","address":{"postalCode":"400069"}}</script></head>
<body><h1>Sharma Sarees</h1><p>Shop 4, MG Road, Andheri East, Mumbai 400069. Call 98200 12345.</p>
<a href="tel:+919820012345">Call</a><a href="https://wa.me/919820012345">WhatsApp</a><iframe src="https://www.google.com/maps/embed?pb=1"></iframe><img src="a.jpg" alt="Shop front"></body></html>`;

test('a good local business home page passes the checks', () => {
  const r = analyse(GOOD, { finalUrl: 'https://sharmasarees.in/', https: true, ms: 420, status: 200, business: 'Sharma Sarees' });
  const by = Object.fromEntries(r.checks.map((c) => [c.id, c.ok]));
  assert.deepEqual(by, {
    https: true,
    mobile: true,
    title: true,
    desc: true,
    h1: true,
    call: true,
    whatsapp: true,
    map: true,
    address: true,
    phone: true,
    schema: true,
    name: true,
    alt: true,
    fast: true,
  });
});

test('a bare page fails the right checks', () => {
  const r = analyse('<html><body><img src=x><img src=y><p>Welcome</p></body></html>', {
    finalUrl: 'http://x.in/',
    https: false,
    ms: 2500,
    status: 200,
    business: 'Sharma Sarees',
  });
  const failed = r.checks.filter((c) => !c.ok).map((c) => c.id);
  assert.deepEqual(failed, [
    'https',
    'mobile',
    'title',
    'desc',
    'h1',
    'call',
    'whatsapp',
    'map',
    'address',
    'phone',
    'schema',
    'name',
    'alt',
    'fast',
  ]);
});

const page = (status, body = '', headers = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: new Map(Object.entries({ 'content-type': 'text/html; charset=utf-8', ...headers })),
  text: async () => body,
});
const publicDns = async () => [{ address: '76.76.21.21', family: 4 }];

test('fetches, follows a safe redirect and analyses the page', async () => {
  const seen = [];
  const hops = [page(301, '', { location: 'https://www.sharmasarees.in/' }), page(200, GOOD)];
  const r = await checkSite('sharmasarees.in', {
    business: 'Sharma Sarees',
    lookup: publicDns,
    fetchImpl: async (u) => (seen.push(u), hops.shift()),
  });
  assert.equal(r.url, 'https://www.sharmasarees.in/');
  assert.deepEqual(seen, ['https://sharmasarees.in/', 'https://www.sharmasarees.in/']);
  assert.equal(
    r.checks.every((c) => c.ok || c.id === 'fast'),
    true,
  );
});

test('refuses hosts that resolve to private addresses, even after a redirect', async () => {
  const r1 = await checkSite('evil.example', {
    lookup: async () => [{ address: '169.254.169.254', family: 4 }],
    fetchImpl: async () => page(200, GOOD),
  });
  assert.equal(r1.error, 'blocked');
  const dns = async (h) => (h === 'rebind.example' ? [{ address: '10.0.0.5', family: 4 }] : [{ address: '76.76.21.21', family: 4 }]);
  const r2 = await checkSite('nice.example', {
    lookup: dns,
    fetchImpl: async () => page(302, '', { location: 'http://rebind.example/admin' }),
  });
  assert.equal(r2.error, 'blocked');
  const r3 = await checkSite('nice.example', {
    lookup: publicDns,
    fetchImpl: async () => page(302, '', { location: 'http://127.0.0.1/' }),
  });
  assert.equal(r3.error, 'blocked');
});

test('unreachable sites and bad input return errors, never throw', async () => {
  assert.equal((await checkSite('not a url')).error, 'bad_url');
  assert.equal((await checkSite('down.example', { lookup: publicDns, fetchImpl: async () => page(503) })).error, 'unreachable');
  assert.equal(
    (
      await checkSite('down.example', {
        lookup: publicDns,
        fetchImpl: async () => {
          throw new Error('ECONNRESET');
        },
      })
    ).error,
    'unreachable',
  );
});

test('rate limiter allows a burst, then blocks for a minute', () => {
  _resetRateLimits();
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(allow('k', 3, t + i), true);
  assert.equal(allow('k', 3, t + 10), false);
  assert.equal(allow('k', 3, t + 61_000), true);
});
