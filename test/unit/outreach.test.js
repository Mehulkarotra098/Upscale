import assert from 'node:assert/strict';
import { test } from 'node:test';

// Each test file runs in its own process: give this one a SerpApi key (and no Google key) before config.js loads.
process.env.SERPAPI_KEY = 'test-key';
delete process.env.GOOGLE_PLACES_KEY;

const { firstMessage, followUpMessage, kindOf, parseImport, waLink } = await import('../../server/outreach/message.js');
const { resolveQuery, withCity } = await import('../../server/outreach/resolve.js');
const { renderCheck } = await import('../../server/blog/render/check.js');

const SHOP = { name: 'Sharma Sarees', kind: 'clothing', area: 'Andheri East', phone: '9820012345', hook: '4.8 stars, no website' };

test('first message: names the shop, uses the finding, offers the report, says how to opt out', () => {
  const m = firstMessage(SHOP);
  assert.match(m, /^Namaste Sharma Sarees team 🙏/);
  assert.match(m, /Andheri East ke local businesses/);
  assert.match(m, /\n4\.8 stars, no website\.\n/);
  assert.match(m, /boutique near me/);
  assert.match(m, /free report bhej doon, aas-paas ke boutiques/);
  assert.match(m, /"no" likh dijiye/);
  const withLink = firstMessage(SHOP, { reportUrl: 'https://uscale.in/r/abc2345' });
  assert.match(withLink, /free report banayi hai, aas-paas ke boutiques ke comparison ke saath: https:\/\/uscale\.in\/r\/abc2345/);
});

test('first message adapts to cafés and restaurants, and works without a finding or area', () => {
  const m = firstMessage({ name: 'Cafe Aroma', kind: 'cafe', area: '', hook: '' });
  assert.match(m, /Mumbai ke local businesses/);
  assert.match(m, /Zomato\/Swiggy/);
  assert.match(m, /aas-paas ke cafés/);
  assert.doesNotMatch(m, /\n\.\n/);
  assert.match(firstMessage({ name: 'X', kind: 'weird' }), /aas-paas ke businesses/);
});

test('follow-up and wa.me link', () => {
  assert.match(
    followUpMessage(SHOP, { reportUrl: 'https://uscale.in/r/abc2345' }),
    /Free report yahan hai: https:\/\/uscale\.in\/r\/abc2345/,
  );
  assert.match(followUpMessage(SHOP), /bas "haan" likh dijiye/);
  const link = waLink('9820012345', 'Hi there & you');
  assert.equal(link, 'https://wa.me/919820012345?text=Hi%20there%20%26%20you');
});

test('kind from free text', () => {
  assert.equal(kindOf('Saree shop'), 'clothing');
  assert.equal(kindOf('Ladies Boutique'), 'clothing');
  assert.equal(kindOf('Coffee house'), 'cafe');
  assert.equal(kindOf('Andheri Dhaba'), 'restaurant');
  assert.equal(kindOf('Unisex Salon'), 'salon');
  assert.equal(kindOf('Hardware'), 'other');
});

test('parseImport: pipes or tabs, header and comments skipped, mobiles only, duplicates flagged', () => {
  const { rows, errors } = parseImport(
    [
      'name\ttype\tarea\tphone',
      '# a comment',
      'Sharma Sarees | clothing | Andheri East | 098200 12345 | no website | https://maps.app.goo.gl/abc',
      'Cafe Aroma\tcafe\tMarol\t+91 98190 12345\tonly on Swiggy',
      'Landline Shop | | | 022 2852 7873',
      'Dupe | | | 9820012345',
      ' | | | 9876543210',
      'Konkan Chilly | konkani restaurant | | 91362 20356 | | not-a-link',
    ].join('\n'),
  );
  assert.deepEqual(
    rows.map((r) => [r.name, r.kind, r.phone, r.maps_url]),
    [
      ['Sharma Sarees', 'clothing', '9820012345', 'https://maps.app.goo.gl/abc'],
      ['Cafe Aroma', 'cafe', '9819012345', ''],
      ['Konkan Chilly', 'restaurant', '9136220356', ''],
    ],
  );
  assert.equal(errors.length, 3);
  assert.match(errors[0], /Landline Shop.*no mobile/);
  assert.match(errors[1], /Dupe.*same number/);
  assert.match(errors[2], /no shop name/);
});

test('parseImport caps the list', () => {
  const text = Array.from({ length: 5 }, (_, i) => `S${i} | | | 98200 1000${i}`).join('\n');
  const { rows, errors } = parseImport(text, { max: 3 });
  assert.equal(rows.length, 3);
  assert.match(errors[0], /first 3/);
});

test('withCity and resolveQuery: the Maps link wins, else the name is searched in Mumbai', async () => {
  assert.equal(withCity('Glow Salon Marol'), 'Glow Salon Marol, Mumbai');
  assert.equal(withCity('Glow Salon Thane'), 'Glow Salon Thane');
  const seen = [];
  const find = async (q) => (seen.push(q), { id: 'BY_NAME' });
  assert.equal(await resolveQuery('https://maps.app.goo.gl/xyz', { maps: async () => 'BY_LINK', find }), 'BY_LINK');
  assert.equal(await resolveQuery('Sharma Sarees https://maps.app.goo.gl/xyz', { maps: async () => null, find }), 'BY_NAME');
  assert.deepEqual(seen, ['Sharma Sarees, Mumbai']);
  assert.equal(await resolveQuery('https://example.com/shop', { maps: async () => 'NO', find }), null, 'non-Maps link, no name');
  assert.equal(await resolveQuery('ab', { find }), null);
});

test('check page: form, escaped query, error message, noindex', () => {
  const { head, main } = renderCheck({ q: '<b>x</b>', error: 'Not found' });
  assert.match(head, /noindex, follow/);
  assert.match(main, /<form class="ck-form" action="\/check" method="get"/);
  assert.match(main, /value="&lt;b&gt;x&lt;\/b&gt;"/);
  assert.match(main, /role="alert">Not found</);
  assert.match(main, /aria-invalid="true"/);
  assert.doesNotMatch(renderCheck().main, /ck-err/);
});

test('SerpApi place → the fields scoring reads; photos unknown get half marks and no photo fix', async () => {
  const { toPlace, relativeToIso } = await import('../../server/outreach/serpapi.js');
  const { scorePlace } = await import('../../server/outreach/score.js');
  const now = Date.parse('2026-10-22T00:00:00Z');
  assert.equal(relativeToIso('3 weeks ago', now), new Date(now - 21 * 86_400_000).toISOString());
  assert.equal(relativeToIso('a month ago', now), new Date(now - 30 * 86_400_000).toISOString());
  assert.equal(relativeToIso('Edited recently', now), '');
  const place = toPlace(
    {
      place_id: 'ChIJ_test_place_1234',
      title: 'Sharma Sarees',
      address: 'Andheri East, Mumbai',
      gps_coordinates: { latitude: 19.11, longitude: 72.87 },
      rating: 4.6,
      reviews: 40,
      type: 'Sari shop',
      type_ids: ['sari_shop'],
      phone: '098200 12345',
      hours: [{ monday: '10 am–9 pm' }, { tuesday: '10 am–9 pm' }],
      user_reviews: { most_relevant: [{ date: '2 weeks ago' }, { iso_date: '2026-09-01T00:00:00Z' }] },
    },
    now,
  );
  assert.equal(place.primaryType, 'sari_shop');
  assert.equal(place.businessStatus, 'OPERATIONAL');
  assert.equal(place.regularOpeningHours.weekdayDescriptions.length, 2);
  assert.equal(place.reviews.length, 2);
  const s = scorePlace(place, [{ id: 'other', name: 'Big Saree Co', rating: 4.5, reviews: 300 }], now);
  assert.equal(s.parts.find((p) => p.id === 'photos').got, 6);
  assert.ok(!s.fixes.some((f) => f.id === 'photos'));
  assert.equal(s.facts.ageDays, 14);
  assert.equal(toPlace({ place_id: 'x'.repeat(12), open_state: 'Permanently closed' }).businessStatus, 'CLOSED_PERMANENTLY');
});

test('SerpApi client: findOne, details and nearby call the Maps engine and map results', async () => {
  const serp = await import('../../server/outreach/serpapi.js');
  const { provider } = await import('../../server/outreach/places.js');
  assert.equal(provider(), 'serpapi');
  const seen = [];
  const fake = (body) => async (url) => (seen.push(new URL(url)), { ok: true, status: 200, json: async () => body });
  const one = await serp.findOne('Sharma Sarees, Mumbai', {
    fetchImpl: fake({ local_results: [{ place_id: 'P1', title: 'Sharma', address: 'Andheri' }] }),
  });
  assert.deepEqual(one, { id: 'P1', name: 'Sharma', address: 'Andheri' });
  assert.equal(seen[0].searchParams.get('engine'), 'google_maps');
  assert.equal(seen[0].searchParams.get('q'), 'Sharma Sarees, Mumbai');
  const near = await serp.nearby({
    location: { latitude: 19.1, longitude: 72.8 },
    type: 'sari_shop',
    label: 'Sari shop',
    fetchImpl: fake({ local_results: [{ place_id: 'P2', title: 'Rival', rating: 4.4, reviews: 120 }] }),
  });
  assert.deepEqual(near, [{ id: 'P2', name: 'Rival', rating: 4.4, reviews: 120 }]);
  assert.equal(seen[1].searchParams.get('ll'), '@19.1,72.8,15z');
  assert.equal(await serp.details('bad id!'), null);
});
