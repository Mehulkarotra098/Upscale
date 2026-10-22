import assert from 'node:assert/strict';
import { test } from 'node:test';

const { scorePlace, indianMobile, grade } = await import('../../server/outreach/score.js');

const NOW = Date.parse('2026-10-21T06:00:00Z');
const day = (n) => new Date(NOW - n * 86_400_000).toISOString();
const rivals = [
  { id: 'r1', name: 'Glow Studio', rating: 4.7, reviews: 640 },
  { id: 'r2', name: 'Looks Salon', rating: 4.5, reviews: 410 },
  { id: 'r3', name: 'Hair Hub', rating: 4.4, reviews: 220 },
  { id: 'me', name: 'Shine Salon', rating: 4.1, reviews: 38 },
];

test('Indian mobiles are recognised; landlines and junk are not', () => {
  assert.equal(indianMobile('098200 12345'), '9820012345');
  assert.equal(indianMobile('+91 98200 12345'), '9820012345');
  assert.equal(indianMobile('919820012345'), '9820012345');
  assert.equal(indianMobile('022 2512 3456'), '');
  assert.equal(indianMobile('1800 123 4567'), '');
  assert.equal(indianMobile(''), '');
});

test('a thin profile scores low, with the right fixes first', () => {
  const place = {
    id: 'me',
    displayName: { text: 'Shine Salon' },
    primaryType: 'beauty_salon',
    rating: 4.1,
    userRatingCount: 38,
    photos: [{}, {}, {}],
    reviews: [{ publishTime: day(120) }],
  };
  const r = scorePlace(place, rivals, NOW);
  assert.ok(r.pts < 45, `expected a low score, got ${r.pts}`);
  assert.equal(r.facts.rank, 4);
  assert.equal(r.facts.bar, 220); // the 3rd best-reviewed rival
  const ids = r.fixes.map((f) => f.id);
  assert.equal(ids[0], 'count');
  for (const want of ['photos', 'website', 'hours', 'phone', 'recent', 'rank']) assert.ok(ids.includes(want), want);
  assert.match(r.fixes[0].text.en, /182 more reviews to catch up with Hair Hub/);
  assert.equal(r.leaders.length, 3);
  assert.equal(
    r.leaders.some((l) => l.id === 'me'),
    false,
  );
});

test('a complete, busy profile scores high and has few fixes', () => {
  const place = {
    id: 'r1',
    displayName: { text: 'Glow Studio' },
    primaryType: 'beauty_salon',
    rating: 4.7,
    userRatingCount: 640,
    photos: Array(10).fill({}),
    regularOpeningHours: { weekdayDescriptions: ['Monday: 10 AM–9 PM'] },
    nationalPhoneNumber: '098200 12345',
    websiteUri: 'https://glow.example',
    reviews: [{ publishTime: day(3) }],
  };
  const r = scorePlace(place, rivals, NOW);
  assert.equal(r.pts, 100);
  assert.equal(r.grade, 'strong');
  assert.equal(r.fixes.length, 0);
});

test('grades', () => {
  assert.equal(grade(85), 'strong');
  assert.equal(grade(65), 'gaps');
  assert.equal(grade(45), 'work');
  assert.equal(grade(20), 'losing');
});
