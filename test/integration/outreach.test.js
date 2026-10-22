// Admin → Outreach end to end against a real Postgres: add shops, build today's batch, mark sent, follow-ups.
// Also the public /check page without a Places key (it sends people to the full checklist instead).
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import pg from 'pg';
import { adminClient, invoke } from '../helpers/invoke.js';

delete process.env.GOOGLE_PLACES_KEY;
const { default: admin } = await import('../../api/admin.js');
const { default: blog } = await import('../../api/blog.js');
const { closeDb, exec } = await import('../../server/db/client.js');

const owner = adminClient(admin);

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

const lines = (n, from = 0) =>
  Array.from(
    { length: n },
    (_, i) => `Shop ${from + i} | ${i % 2 ? 'cafe' : 'boutique'} | Andheri East | 98200 ${String(10000 + from + i)} | Finding ${from + i}`,
  ).join('\n');

test('outreach needs a signed-in user', async () => {
  assert.equal((await adminClient(admin).get('outreach')).status, 401);
  assert.equal((await adminClient(admin).post('outreach-import', { text: lines(1) })).status, 401);
});

test('import adds shops, skips duplicates, landlines and people who said STOP to the bot', async () => {
  await exec(`INSERT INTO wa_leads (wa_id, opted_out) VALUES ('919820099999', true)`);
  const text = [
    'name | type | area | phone | hook',
    lines(12),
    'Old Saree House | saree | Ghatkopar | 022 2852 7873 | landline only',
    'Shop 0 again | clothing | Andheri | 9820010000 | same number',
    'Stopped Shop | cafe | Marol | 98200 99999 | said stop',
  ].join('\n');
  const r = await owner.post('outreach-import', { text });
  assert.equal(r.status, 200, r.text);
  const body = r.json();
  assert.equal(body.added, 12);
  assert.deepEqual(body.skipped, ['Stopped Shop']);
  assert.equal(body.errors.length, 2, body.errors.join(' / '));

  const again = (await owner.post('outreach-import', { text: lines(2) })).json();
  assert.equal(again.added, 0, 'already on the list');
  assert.equal((await owner.post('outreach-import', { text: 'nothing useful' })).status, 400);
});

test('today’s batch is capped at the daily number and carries each shop’s message', async () => {
  let page = (await owner.get('outreach')).json();
  assert.equal(page.today.length, 0);
  assert.equal(page.places, false);
  assert.equal(page.totals.queued, 12);
  assert.equal(page.totals.waiting, 12);

  assert.equal((await owner.post('outreach-batch', {})).json().added, 10);
  assert.equal((await owner.post('outreach-batch', {})).json().added, 0, 'already full today');
  page = (await owner.get('outreach')).json();
  assert.equal(page.today.length, 10);
  assert.equal(page.totals.waiting, 2, 'today’s batch is no longer waiting');
  const first = page.today[0];
  assert.equal(first.name, 'Shop 0');
  assert.equal(first.kind, 'clothing');
  assert.match(first.message, /^Namaste Shop 0 team/);
  assert.match(first.message, /Finding 0\./);
  assert.match(first.message, /free report bhej doon/, 'no report link without a Places key');
  assert.match(first.message, /"no" likh dijiye/);
  assert.ok(first.wa.startsWith('https://wa.me/919820010000?text=Namaste'));
});

test('status changes: sent stamps the time once, follow-ups appear after a few days', async () => {
  const page = (await owner.get('outreach')).json();
  const [a, b] = page.today;
  assert.equal((await owner.post('outreach-update', { id: a.id, status: 'sent' })).status, 200);
  assert.equal((await owner.post('outreach-update', { id: b.id, status: 'sent' })).status, 200);
  assert.equal((await owner.post('outreach-update', { id: b.id, status: 'replied', note: 'Owner Ravi, call Friday' })).status, 200);
  assert.equal((await owner.post('outreach-update', { id: a.id, status: 'bogus' })).status, 400);
  assert.equal((await owner.post('outreach-update', { id: 999999, status: 'sent' })).status, 404);

  let now = (await owner.get('outreach')).json();
  assert.equal(now.totals.sent_today, 2);
  assert.equal(now.totals.replied, 1);
  assert.equal(now.followUps.length, 0, 'too soon for a follow-up');

  await exec(`UPDATE outreach_shops SET sent_at = now() - interval '4 days' WHERE id IN ($1, $2)`, [a.id, b.id]);
  now = (await owner.get('outreach')).json();
  assert.deepEqual(
    now.followUps.map((r) => r.id),
    [a.id],
    'only the one with no reply',
  );
  assert.match(now.followUps[0].follow_up, /follow-up/);
  await owner.post('outreach-update', { id: a.id, followedUp: true });
  assert.equal((await owner.get('outreach')).json().followUps.length, 0, 'one follow-up only');

  const replied = (await owner.get('outreach', { status: 'replied' })).json().all;
  assert.equal(replied.length, 1);
  assert.equal(replied[0].note, 'Owner Ravi, call Friday');
});

test('report links need the Places key', async () => {
  const [row] = (await owner.get('outreach')).json().today;
  const r = await owner.post('outreach-report', { id: row.id });
  assert.equal(r.status, 409);
  assert.match(r.json().error, /GOOGLE_PLACES_KEY/);
});

test('edit and delete (only shops not yet contacted can be deleted)', async () => {
  const page = (await owner.get('outreach')).json();
  const sent = page.today.find((r) => r.status === 'replied');
  const queued = page.all.find((r) => r.status === 'queued');
  assert.equal((await owner.post('outreach-edit', { id: queued.id, kind: 'restaurant', hook: 'New finding' })).status, 200);
  assert.equal((await owner.post('outreach-edit', { id: queued.id, kind: 'spaceship' })).status, 400);
  const edited = (await owner.get('outreach')).json().all.find((r) => r.id === queued.id);
  assert.match(edited.message, /Zomato\/Swiggy/);
  assert.match(edited.message, /New finding\./);

  await owner.post('outreach-delete', { id: sent.id });
  await owner.post('outreach-delete', { id: queued.id });
  const ids = (await owner.get('outreach')).json().all.map((r) => r.id);
  assert.ok(ids.includes(sent.id), 'contacted shops stay for the record');
  assert.ok(!ids.includes(queued.id));
});

test('/check without a Places key sends people to the full checklist', async () => {
  const r = await invoke(blog, { url: '/api/blog?view=check&q=Sharma%20Sarees' });
  assert.equal(r.status, 302);
  assert.equal(r.headers.location, '/tools/google-business-profile-checker');
});
