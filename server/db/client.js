// Postgres access. Production uses Supabase through its shared pooler in transaction mode; local dev and tests use
// a plain Postgres. One small pool per warm function instance. The first query on a cold instance connects and runs
// any pending migrations (see migrations.js) inside one transaction.
import pg from 'pg';
import { DATABASE_URL, DB_SCHEMA } from '../config.js';
import { unavailable } from '../lib/errors.js';
import { log } from '../lib/log.js';
import { MIGRATIONS } from './migrations.js';

const MIGRATION_LOCK = 722011;

let pool = null;
let ready = null;
let hostIndex = 0;

export const hasDb = () => Boolean(DATABASE_URL);

/**
 * Supabase shared-pooler hosts look like aws-<N>-<region>.pooler.supabase.com and N can't be derived from the
 * region, so when the configured host is wrong (DNS miss or "Tenant or user not found") the sibling clusters are tried.
 */
function hostCandidates() {
  const { hostname } = new URL(DATABASE_URL);
  const m = hostname.match(/^aws-(\d+)-(.+\.pooler\.supabase\.com)$/);
  const hosts = [hostname];
  if (m) for (const n of [0, 1, 2]) if (!hosts.includes(`aws-${n}-${m[2]}`)) hosts.push(`aws-${n}-${m[2]}`);
  return hosts;
}

const isWrongHost = (e) => /tenant or user not found|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(`${e?.code} ${e?.message}`);

function createPool() {
  const url = new URL(DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  url.hostname = hostCandidates()[hostIndex] || url.hostname;
  // TLS is configured below, so these URL flags are dropped (newer pg reinterprets sslmode and warns).
  url.searchParams.delete('sslmode');
  url.searchParams.delete('channel_binding');
  const supabasePooler = /\.pooler\.supabase\.com$/.test(url.hostname);
  const p = new pg.Pool({
    connectionString: url.toString(),
    // Traffic is encrypted. Supabase's certificate chain ends at its own CA, which isn't in Node's trust store.
    ssl: local ? false : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    // Table names resolve to the app schema. The transaction-mode pooler drops startup options, so on Supabase
    // the role's default (ALTER ROLE uscale_app SET search_path = uscale) does this instead.
    ...(supabasePooler ? {} : { options: `-c search_path=${DB_SCHEMA}` }),
  });
  p.on('error', (err) => log.warn('db', 'idle client error', { err })); // a dropped idle client must not crash the instance
  return p;
}

const getPool = () => (pool ??= createPool());

async function connectWithFailover() {
  for (;;) {
    try {
      (await getPool().connect()).release();
      return;
    } catch (e) {
      if (!isWrongHost(e) || hostIndex >= hostCandidates().length - 1) throw e;
      hostIndex += 1;
      const old = pool;
      pool = null;
      old?.end().catch(() => {});
    }
  }
}

async function migrate() {
  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    // CREATE SCHEMA IF NOT EXISTS checks the database-level CREATE privilege even when the schema exists,
    // and the app role (which owns the schema) doesn't need that privilege, so look first.
    const { rowCount } = await c.query('SELECT 1 FROM pg_namespace WHERE nspname = $1', [DB_SCHEMA]);
    if (!rowCount) await c.query(`CREATE SCHEMA ${DB_SCHEMA}`);
    await c.query(`SET LOCAL search_path TO ${DB_SCHEMA}`);
    await c.query('SELECT pg_advisory_xact_lock($1)', [MIGRATION_LOCK]); // concurrent cold starts migrate one at a time
    await c.query('CREATE TABLE IF NOT EXISTS schema_version (v INT NOT NULL)');
    const { rows } = await c.query('SELECT v FROM schema_version');
    if (!rows.length) await c.query('INSERT INTO schema_version (v) VALUES (0)');
    const from = rows[0]?.v ?? 0;
    for (let v = from; v < MIGRATIONS.length; v++) {
      await c.query(MIGRATIONS[v].sql);
      log.info('db', 'migrated', { to: v + 1, name: MIGRATIONS[v].name });
    }
    if (from < MIGRATIONS.length) await c.query('UPDATE schema_version SET v = $1', [MIGRATIONS.length]);
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

async function ensureReady() {
  if (!hasDb()) throw unavailable('Database not configured: set DATABASE_URL in Vercel and redeploy.', 'NO_DB');
  ready ??= connectWithFailover()
    .then(migrate)
    .catch((e) => {
      ready = null; // retry on the next request
      throw e;
    });
  await ready;
}

function executor(client) {
  return {
    /** All rows. */
    query: async (sql, params = []) => (await client.query(sql, params)).rows,
    /** First row or null. */
    one: async (sql, params = []) => (await client.query(sql, params)).rows[0] ?? null,
    /** Number of rows changed. */
    exec: async (sql, params = []) => (await client.query(sql, params)).rowCount,
  };
}

const poolExec = executor({ query: async (sql, params) => (await ensureReady(), getPool().query(sql, params)) });

export const query = poolExec.query;
export const one = poolExec.one;
export const exec = poolExec.exec;

/** Run `fn` in a transaction. It receives { query, one, exec } bound to the transaction's connection. */
export async function tx(fn) {
  await ensureReady();
  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    await c.query(`SET LOCAL search_path TO ${DB_SCHEMA}`);
    const out = await fn(executor(c));
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** For tests: close the pool so the process can exit. */
export async function closeDb() {
  const p = pool;
  pool = null;
  ready = null;
  await p?.end();
}
