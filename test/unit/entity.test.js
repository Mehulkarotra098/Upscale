import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ENTITY from '../../server/entity.js';

// The static site (Python build) reads source/entity.json; the blog and bot read server/entity.js. Answer engines
// cross-check the business's name, phone, area and profiles across pages, so the two copies must never drift.
test('server/entity.js mirrors source/entity.json exactly', () => {
  const json = JSON.parse(readFileSync(new URL('../../source/entity.json', import.meta.url), 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(ENTITY)), json);
});

test('entity has the details every listing must match', () => {
  assert.equal(ENTITY.name, 'U Scale by Mehul Karotra');
  assert.match(ENTITY.phone, /^\+91-\d{5}-\d{5}$/);
  assert.equal(ENTITY.phoneDisplay.replace(/\D/g, ''), ENTITY.phone.replace(/\D/g, ''));
  assert.equal(ENTITY.whatsapp, ENTITY.phone.replace(/\D/g, ''));
  for (const u of [...ENTITY.sameAs, ...ENTITY.founder.sameAs]) assert.match(u, /^https:\/\/[^\s/]+\.[a-z]+\/\S*$/);
  assert.ok(Object.isFrozen(ENTITY));
});
