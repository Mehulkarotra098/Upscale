// End-to-end admin API against a real Postgres (own schema per run, see test/helpers/env.js).
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import pg from 'pg';
import { adminClient, invoke, PNG_1PX } from '../helpers/invoke.js';

const { default: admin } = await import('../../api/admin.js');
const { default: blog } = await import('../../api/blog.js');
const { default: img } = await import('../../api/img.js');
const { closeDb } = await import('../../server/db/client.js');

const owner = adminClient(admin);
const OWNER = { email: 'owner@example.com', password: 'owner-password-123' };

before(async () => {
  // The first request creates the schema and runs every migration.
  const r = await adminClient(admin).post('login', { email: 'nobody@example.com', password: 'x' });
  assert.equal(r.status, 401);
});

after(async () => {
  await closeDb();
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query(`DROP SCHEMA IF EXISTS ${process.env.DB_SCHEMA} CASCADE`);
  await c.end();
});

test('protection: unknown action, wrong method, missing header, cross-site origin, no session', async () => {
  const anon = adminClient(admin);
  assert.equal((await anon.get('nope')).status, 404);
  assert.equal((await anon.call('save', { method: 'GET' })).status, 405);
  assert.equal((await anon.call('login', { body: OWNER, headers: { 'x-us-admin': '' } })).status, 403);
  assert.equal((await anon.call('login', { body: OWNER, headers: { origin: 'https://evil.example' } })).status, 403);
  assert.equal((await anon.get('me')).status, 401);
  assert.equal((await anon.post('save', { title: 'x' })).status, 401);
});

test('first sign-in with the configured owner creates the account', async () => {
  const r = await owner.post('login', OWNER);
  assert.equal(r.status, 200);
  assert.equal(r.json().user.role, 'owner');
  assert.match(r.headers['set-cookie'], /us_admin=.+; Path=\/; HttpOnly; SameSite=Strict; Max-Age=\d+; Secure/);
  const me = (await owner.get('me')).json();
  assert.equal(me.user.email, OWNER.email);
  assert.equal(me.user.token_version, undefined, 'internal fields stay on the server');
  assert.equal(me.user.password_hash, undefined);
});

test('wrong passwords are rate limited per account and IP', async () => {
  const attacker = adminClient(admin, { ip: '198.51.100.9' });
  for (let i = 0; i < 8; i++) assert.equal((await attacker.post('login', { ...OWNER, password: 'nope' })).status, 401);
  assert.equal((await attacker.post('login', OWNER)).status, 429, 'even the right password waits out the lockout');
  assert.equal((await adminClient(admin, { ip: '198.51.100.10' }).post('login', OWNER)).status, 200, 'other IPs unaffected');
});

let categoryId;
let imageId;
let postId;

test('categories and image uploads', async () => {
  const c = await owner.post('category-save', { name: 'Local SEO', description: 'Get found nearby' });
  assert.equal(c.status, 200);
  categoryId = c.json().category.id;
  assert.equal(c.json().category.slug, 'local-seo');
  assert.equal((await owner.post('category-save', { name: 'Local SEO' })).status, 409, 'duplicate URL');

  const bad = await owner.post('media-upload', { full: Buffer.from('<svg onload=alert(1)>').toString('base64'), width: 10, height: 10 });
  assert.equal(bad.status, 400, 'only real JPG/PNG/WebP bytes');

  const up = await owner.post('media-upload', {
    name: 'shop-front.png',
    full: PNG_1PX,
    small: PNG_1PX,
    width: 1,
    height: 1,
    sm_width: 1,
    alt: 'Shop front',
  });
  assert.equal(up.status, 200);
  imageId = up.json().media.id;
  assert.equal(up.json().media.url, `/media/${imageId}-shop-front.webp`);

  const served = await invoke(img, { url: `/api/img?f=${imageId}-shop-front-800.webp` });
  assert.equal(served.status, 200);
  assert.equal(served.headers['content-type'], 'image/png');
  assert.match(served.headers['cache-control'], /immutable/);
  assert.equal((await invoke(img, { url: '/api/img?f=../../etc/passwd' })).status, 404);
});

test('draft → publish with images, links, FAQ; content is cleaned and indexed', async () => {
  const draft = await owner.post('save', {
    title: 'Why your shop is invisible on Google Maps',
    content_html: `<h1>Claim your profile</h1><p>Start here <script>alert(1)</script><a href="https://support.google.com/x" rel="nofollow">guide</a> and <a href="/services/seo-mumbai">SEO</a>.</p><p><img src="/media/${imageId}-shop-front.webp" data-id="${imageId}" alt="Shop"></p>`,
    content_json: { type: 'doc', content: [] },
    category_id: categoryId,
    tags: ['Google Maps', 'local seo'],
    focus_keyword: 'Google Maps',
    faq: [{ q: 'How long?', a: 'About a week.' }],
  });
  assert.equal(draft.status, 200);
  const saved = draft.json().post;
  postId = saved.id;
  assert.equal(saved.status, 'draft');
  assert.equal(saved.slug, 'why-your-shop-is-invisible-on-google-maps');
  assert.ok(!saved.content_html.includes('<script'));
  assert.match(saved.content_html, /<h2 id="claim-your-profile">/);
  assert.match(saved.content_html, /target="_blank" rel="noopener nofollow"/);
  assert.equal(saved.focus_keyword, 'google maps');
  assert.equal(draft.json().stats.images, 1);

  const media = (await owner.get('media')).json().media.find((m) => m.id === imageId);
  assert.equal(media.used, 1, 'post_media tracks the inline image');

  assert.equal((await invoke(blog, { url: `/api/blog?slug=${saved.slug}` })).status, 404, 'drafts are not public');

  const pub = await owner.post('save', {
    ...saved,
    id: postId,
    status: 'published',
    content_html: saved.content_html,
    cover_media_id: imageId,
  });
  assert.equal(pub.status, 200);
  assert.equal(pub.json().live, true);

  const list = (await owner.get('posts', { status: 'live' })).json().posts;
  assert.deepEqual(
    list.map((p) => p.id),
    [postId],
  );
  assert.equal((await owner.get('revision', { id: (await owner.get('post', { id: postId })).json().revisions[0].id })).status, 200);
});

test('public pages: article, listing, category, feeds, sitemap, read counter', async () => {
  const page = await invoke(blog, { url: '/api/blog?slug=why-your-shop-is-invisible-on-google-maps' });
  assert.equal(page.status, 200);
  assert.match(page.text, /<h1 class="bpost__title">Why your shop is invisible on Google Maps<\/h1>/);
  assert.match(page.text, /"@type":"FAQPage"/);
  assert.match(page.text, /<link rel="canonical" href="https:\/\/uscale\.test\/blog\/why-your-shop-is-invisible-on-google-maps">/);

  const index = await invoke(blog, { url: '/api/blog' });
  assert.equal(index.status, 200);
  assert.match(index.text, /1 article/);
  assert.equal((await invoke(blog, { url: '/api/blog?category=local-seo' })).status, 200);
  assert.equal((await invoke(blog, { url: '/api/blog?category=nope' })).status, 404);
  assert.equal((await invoke(blog, { url: '/api/blog?page=9' })).status, 404);
  const p1 = await invoke(blog, { url: '/api/blog?page=1' });
  assert.equal(p1.status, 301);
  assert.equal(p1.headers.location, '/blog');

  const rss = await invoke(blog, { url: '/api/blog?view=rss' });
  assert.match(rss.headers['content-type'], /rss\+xml/);
  assert.match(rss.text, /<link>https:\/\/uscale\.test\/blog\/why-your-shop-is-invisible-on-google-maps<\/link>/);
  const map = await invoke(blog, { url: '/api/blog?view=sitemap' });
  assert.match(map.text, /blog\/category\/local-seo/);

  assert.equal(
    (await invoke(blog, { method: 'POST', url: `/api/blog?view=hit&id=${postId}`, headers: { 'user-agent': 'Mozilla/5.0' } })).status,
    204,
  );
  await invoke(blog, { method: 'POST', url: `/api/blog?view=hit&id=${postId}`, headers: { 'user-agent': 'Googlebot' } });
  await invoke(blog, { method: 'POST', url: '/api/blog?view=hit&id=999999', headers: { 'user-agent': 'Mozilla/5.0' } });
  assert.equal((await owner.get('stats')).json().views.d7, 1, 'bots and unknown posts are not counted');
});

test('renaming a live post keeps the old URL working with a 301', async () => {
  const current = (await owner.get('post', { id: postId })).json().post;
  const r = await owner.post('save', { ...current, slug: 'google-maps-visibility' });
  assert.equal(r.json().post.slug, 'google-maps-visibility');
  const old = await invoke(blog, { url: '/api/blog?slug=why-your-shop-is-invisible-on-google-maps' });
  assert.equal(old.status, 301);
  assert.equal(old.headers.location, '/blog/google-maps-visibility');

  const second = await owner.post('save', { title: 'Why your shop is invisible on Google Maps', content_html: '<p>x</p>' });
  assert.equal(second.json().post.slug, 'why-your-shop-is-invisible-on-google-maps-2', 'a redirecting slug stays reserved');
  await owner.post('post-delete', { id: second.json().post.id });
});

test('preview links show drafts only with a valid token and are never cached', async () => {
  const draft = (await owner.post('save', { title: 'Secret draft', content_html: '<p>Hidden</p>' })).json().post;
  const { url } = (await owner.post('preview-link', { id: draft.id })).json();
  const token = new URL(url, 'https://x').searchParams.get('preview');
  const ok = await invoke(blog, { url: `/api/blog?slug=secret-draft&preview=${encodeURIComponent(token)}` });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers['cache-control'], 'private, no-store');
  assert.match(ok.text, /noindex, nofollow/);
  assert.equal((await invoke(blog, { url: '/api/blog?slug=secret-draft&preview=forged.token' })).status, 404);
  assert.equal((await invoke(blog, { url: `/api/blog?slug=other-post&preview=${encodeURIComponent(token)}` })).status, 404);
  await owner.post('post-delete', { id: draft.id });
});

test('images in use are protected from deletion; duplicates copy the image index', async () => {
  const dup = await owner.post('post-duplicate', { id: postId });
  assert.equal(dup.status, 200);
  assert.equal((await owner.get('media')).json().media.find((m) => m.id === imageId).used, 2);
  assert.equal((await owner.post('media-delete', { id: imageId })).status, 409);
  await owner.post('post-delete', { id: dup.json().id });
});

test('team: editors are limited; owners manage people; password change signs out other sessions', async () => {
  const add = await owner.post('user-save', { email: 'writer@example.com', name: 'Writer', role: 'editor', password: 'writer-password-1' });
  assert.equal(add.status, 200);
  const writerId = add.json().user.id;
  assert.equal((await owner.post('user-save', { email: 'writer@example.com', name: 'Dup', password: 'xxxxxxxxxxxx' })).status, 409);

  const writer = adminClient(admin, { ip: '192.0.2.50' });
  assert.equal((await writer.post('login', { email: 'writer@example.com', password: 'writer-password-1' })).status, 200);
  assert.equal(
    (await writer.post('user-save', { email: 'x@example.com', name: 'X', password: 'xxxxxxxxxxxx' })).status,
    403,
    'editors cannot add people',
  );
  assert.equal((await writer.post('user-delete', { id: 1 })).status, 403);
  const selfEdit = await writer.post('user-save', { id: writerId, email: 'writer@example.com', name: 'Writer Two', role: 'owner' });
  assert.equal(selfEdit.json().user.role, 'editor', 'nobody promotes themselves');

  const me = (await owner.get('me')).json().user;
  const demote = await owner.post('user-save', { id: me.id, email: me.email, name: me.name, role: 'editor' });
  assert.equal(demote.json().user.role, 'owner', 'the last owner stays an owner');

  const otherDevice = adminClient(admin, { ip: '192.0.2.51' });
  otherDevice.cookie = writer.cookie;
  assert.equal((await writer.post('password', { current: 'wrong', next: 'new-password-123' })).status, 400);
  assert.equal((await writer.post('password', { current: 'writer-password-1', next: 'short' })).status, 400);
  assert.equal((await writer.post('password', { current: 'writer-password-1', next: 'new-password-123' })).status, 200);
  assert.equal((await writer.get('me')).status, 200, 'this device stays signed in');
  assert.equal((await otherDevice.get('me')).status, 401, 'other sessions end');

  assert.equal((await owner.post('user-delete', { id: writerId })).status, 200);
  assert.equal((await writer.get('me')).status, 401);
});

test('cron ping and logout', async () => {
  const ping = await invoke(blog, { url: '/api/blog?view=ping' });
  assert.equal(ping.status, 200);
  const out = await owner.post('logout', {});
  assert.match(out.headers['set-cookie'], /Max-Age=0/);
  assert.equal((await owner.get('me')).status, 401);
});
