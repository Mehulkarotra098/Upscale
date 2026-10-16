// Postgres access (Supabase via the shared Supavisor pooler in transaction mode, or any Postgres such as Neon/local).
// One small pool per warm function instance. The schema lives in its own `uscale` schema and is created/updated
// automatically on first use, inside a single transaction (transaction-mode poolers don't allow session locks).
import pg from 'pg';
import { DATABASE_URL } from './config.js';

const SCHEMA = 'uscale';
let pool = null;
let ready = null;
let hostIdx = 0;

export const hasDb = () => !!DATABASE_URL;

// Supabase shared-pooler hosts are aws-<N>-<region>.pooler.supabase.com and N can't be derived from the region,
// so if the configured host is wrong (DNS miss / "Tenant or user not found") we try the sibling clusters.
function candidates() {
  const u = new URL(DATABASE_URL);
  const m = u.hostname.match(/^aws-(\d+)-(.+\.pooler\.supabase\.com)$/);
  const hosts = [u.hostname];
  if (m) for (const n of [0, 1, 2]) { const h = `aws-${n}-${m[2]}`; if (!hosts.includes(h)) hosts.push(h); }
  return hosts;
}

function makePool() {
  const u = new URL(DATABASE_URL);
  const local = ['localhost', '127.0.0.1'].includes(u.hostname);
  u.hostname = candidates()[hostIdx] || u.hostname;
  // TLS is configured explicitly, so drop sslmode/channel_binding (newer pg reinterprets sslmode and warns).
  u.searchParams.delete('sslmode'); u.searchParams.delete('channel_binding');
  const p = new pg.Pool({
    connectionString: u.toString(),
    ssl: local ? false : { rejectUnauthorized: false }, // pooler certs are valid, but Supabase's CA isn't in Node's store
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    // Unqualified table names resolve to the uscale schema. On Supabase the role default (ALTER ROLE uscale_app
    // SET search_path = uscale) does this, which is what keeps it correct behind the transaction-mode pooler
    // (startup options aren't forwarded there). Other hosts (Neon direct, local) get it as a startup option.
    ...(/pooler\.supabase\.com$/.test(u.hostname) ? {} : { options: `-c search_path=${SCHEMA}` }),
  });
  p.on('error', () => {}); // a dropped idle client must not crash the function
  return p;
}

function getPool() {
  if (!pool) pool = makePool();
  return pool;
}

const wrongHost = (e) => /tenant or user not found|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(`${e?.code} ${e?.message}`);

const MIGRATIONS = [
  `CREATE SCHEMA IF NOT EXISTS ${SCHEMA};
   SET LOCAL search_path TO ${SCHEMA};
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor')),
     bio TEXT NOT NULL DEFAULT '',
     job_title TEXT NOT NULL DEFAULT '',
     avatar_media_id INT,
     token_version INT NOT NULL DEFAULT 1,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE TABLE IF NOT EXISTS login_attempts (
     id BIGSERIAL PRIMARY KEY, key TEXT NOT NULL, at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE INDEX IF NOT EXISTS login_attempts_key_at ON login_attempts (key, at);
   CREATE TABLE IF NOT EXISTS media (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     mime TEXT NOT NULL DEFAULT 'image/webp',
     width INT NOT NULL, height INT NOT NULL,
     bytes BYTEA NOT NULL,
     bytes_sm BYTEA,
     sm_width INT,
     alt TEXT NOT NULL DEFAULT '',
     caption TEXT NOT NULL DEFAULT '',
     size INT NOT NULL DEFAULT 0,
     uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE TABLE IF NOT EXISTS categories (
     id SERIAL PRIMARY KEY,
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     description TEXT NOT NULL DEFAULT '',
     seo_title TEXT NOT NULL DEFAULT '',
     seo_description TEXT NOT NULL DEFAULT '',
     service_slug TEXT NOT NULL DEFAULT '',
     sort INT NOT NULL DEFAULT 0
   );
   CREATE TABLE IF NOT EXISTS posts (
     id SERIAL PRIMARY KEY,
     slug TEXT NOT NULL UNIQUE,
     title TEXT NOT NULL DEFAULT '',
     excerpt TEXT NOT NULL DEFAULT '',
     content_json JSONB,
     content_html TEXT NOT NULL DEFAULT '',
     toc JSONB NOT NULL DEFAULT '[]',
     status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
     published_at TIMESTAMPTZ,
     author_id INT REFERENCES users(id) ON DELETE SET NULL,
     category_id INT REFERENCES categories(id) ON DELETE SET NULL,
     tags TEXT[] NOT NULL DEFAULT '{}',
     cover_media_id INT REFERENCES media(id) ON DELETE SET NULL,
     seo_title TEXT NOT NULL DEFAULT '',
     seo_description TEXT NOT NULL DEFAULT '',
     focus_keyword TEXT NOT NULL DEFAULT '',
     canonical_url TEXT NOT NULL DEFAULT '',
     noindex BOOLEAN NOT NULL DEFAULT false,
     faq JSONB NOT NULL DEFAULT '[]',
     service_slug TEXT NOT NULL DEFAULT '',
     word_count INT NOT NULL DEFAULT 0,
     reading_minutes INT NOT NULL DEFAULT 1,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     content_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE INDEX IF NOT EXISTS posts_live ON posts (status, published_at DESC);
   CREATE INDEX IF NOT EXISTS posts_category ON posts (category_id);
   CREATE TABLE IF NOT EXISTS post_redirects (
     slug TEXT PRIMARY KEY, post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE
   );
   CREATE TABLE IF NOT EXISTS post_revisions (
     id SERIAL PRIMARY KEY,
     post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     user_id INT REFERENCES users(id) ON DELETE SET NULL,
     title TEXT NOT NULL,
     content_json JSONB,
     saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE INDEX IF NOT EXISTS post_revisions_post ON post_revisions (post_id, saved_at DESC);
   CREATE TABLE IF NOT EXISTS post_views (
     post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     day DATE NOT NULL,
     n INT NOT NULL DEFAULT 0,
     PRIMARY KEY (post_id, day)
   );
   -- Defence in depth on Supabase: even if this schema were ever exposed through the Data API, anon/authenticated
   -- roles get nothing (RLS on, no policies). The app connects as the table owner, which RLS doesn't restrict.
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE media ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE post_redirects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;`,
];

async function migrate() {
  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    await c.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
    await c.query(`SET LOCAL search_path TO ${SCHEMA}`);
    await c.query('SELECT pg_advisory_xact_lock(722011)'); // racing cold starts migrate one at a time
    await c.query('CREATE TABLE IF NOT EXISTS schema_version (v INT NOT NULL)');
    const r = await c.query('SELECT v FROM schema_version LIMIT 1');
    let v = r.rows[0]?.v ?? 0;
    if (!r.rows.length) await c.query('INSERT INTO schema_version (v) VALUES (0)');
    for (; v < MIGRATIONS.length; v++) await c.query(MIGRATIONS[v]);
    await c.query('UPDATE schema_version SET v = $1', [MIGRATIONS.length]);
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

async function connectCheck() {
  for (;;) {
    try {
      const c = await getPool().connect();
      c.release();
      return;
    } catch (e) {
      if (wrongHost(e) && hostIdx < candidates().length - 1) {
        hostIdx++; const old = pool; pool = null; old?.end().catch(() => {});
        continue;
      }
      throw e;
    }
  }
}

export async function db() {
  if (!DATABASE_URL) throw Object.assign(new Error('DATABASE_URL is not set'), { code: 'NO_DB' });
  if (!ready) ready = connectCheck().then(migrate).catch((e) => { ready = null; throw e; });
  await ready;
  return getPool();
}

export async function q(text, params = []) {
  const p = await db();
  return p.query(text, params);
}

export async function one(text, params = []) {
  return (await q(text, params)).rows[0] || null;
}

export async function tx(fn) {
  const p = await db();
  const c = await p.connect();
  try {
    await c.query('BEGIN');
    await c.query(`SET LOCAL search_path TO ${SCHEMA}`);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
