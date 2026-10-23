// AI search log end to end against a real Postgres: middleware-style reports land in ai_hits (only with the key),
// junk is refused, and Admin → AI search summarises them.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import pg from 'pg';
import { adminClient, invoke } from '../helpers/invoke.js';

const KEY = 'ai-log-key-for-tests-0123456789abcdef';
process.env.AI_LOG_KEY = KEY;
const { default: admin } = await import('../../api/admin.js');
const { default: blog } = await import('../../api/blog.js');
const { closeDb, exec, query } = await import('../../server/db/client.js');

const owner = adminClient(admin);
const report = (body, key = KEY) =>
  invoke(blog, { method: 'POST', url: '/api/blog?view=ai', headers: key ? { 'x-ai-key': key } : {}, body });

before(async () => {
  const r = await owner.post('login', { email: 'owner@example.com', password: 'owner-password-123' });
  assert.equal(r.status, 200);
});

after(async () => {
  await closeDb();
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query(`DROP SCHEMA IF EXISTS ${process.env.DB_SCHEMA} CASCADE`);
  await c.end();
});

test('reports need the key and a well-formed hit', async () => {
  const hit = { type: 'bot', name: 'ChatGPT', kind: 'live', path: '/services/website-design-mumbai' };
  assert.equal((await report(hit, null)).status, 404, 'no key');
  assert.equal((await report(hit, 'wrong-key-wrong-key-wrong-key-wrong-key')).status, 404, 'wrong key');
  assert.equal((await invoke(blog, { url: '/api/blog?view=ai', headers: { 'x-ai-key': KEY } })).status, 404, 'GET is not allowed');
  assert.equal((await report({ type: 'bot', name: 'Not a bot', kind: 'live', path: '/' })).status, 400);
  assert.equal((await report('not json')).status, 400);
});

test('hits are counted per day, assistant and page', async () => {
  const live = { type: 'bot', name: 'ChatGPT', kind: 'live', path: '/services/website-design-mumbai/' };
  for (let i = 0; i < 3; i++) assert.equal((await report(live)).status, 204);
  await report({ type: 'bot', name: 'ChatGPT search', kind: 'index', path: '/about' });
  await report({ type: 'bot', name: 'Google (Search, AI Overviews)', kind: 'search', path: '/' });
  await report({ type: 'ref', name: 'Perplexity', kind: 'ref', path: '/services/website-design-mumbai/ghatkopar' });
  const rows = await query('SELECT name, kind, path, n FROM ai_hits ORDER BY n DESC, name');
  assert.deepEqual(rows[0], { name: 'ChatGPT', kind: 'live', path: '/services/website-design-mumbai', n: 3 });
  assert.equal(rows.length, 4);
});

test('admin AI search summarises the last 30 days', async () => {
  assert.equal((await adminClient(admin).get('ai-search')).status, 401);
  const s = (await owner.get('ai-search')).json();
  assert.equal(s.logging, true);
  assert.equal(s.days, 30);
  assert.deepEqual(s.totals, { live: 3, referrals: 1, indexed: 1, crawled: 1, answer_pages: 2 });
  assert.equal(s.agents[0].name, 'ChatGPT');
  assert.equal(s.pages[0].path, '/services/website-design-mumbai');
  assert.equal(s.pages[0].answers, 3);
  assert.equal(s.daily.length, 30);
  assert.equal(s.daily.at(-1).answers, 4);
  assert.equal(s.latest.length, 2);
  assert.equal(s.kinds.live, 'Opened live to answer someone');
  assert.equal((await owner.get('ai-search', { days: 7 })).json().daily.length, 7);
});

test('old rows are pruned by the daily cron', async () => {
  await exec(`INSERT INTO ai_hits (day, type, name, kind, path) VALUES (current_date - 500, 'bot', 'GPTBot', 'train', '/')`);
  const r = await invoke(blog, { url: '/api/blog?view=ping' });
  assert.equal(r.status, 200);
  const old = await query(`SELECT 1 FROM ai_hits WHERE day < current_date - 400`);
  assert.equal(old.length, 0);
});
