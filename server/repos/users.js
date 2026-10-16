// Users (admin accounts) and failed sign-in tracking. All SQL for these tables lives here.
import { exec, one, query, tx } from '../db/client.js';

const PUBLIC = 'id, email, name, role, bio, job_title, avatar_media_id, token_version, created_at';

/** Row without the password hash (still has token_version, which the session check needs). */
export const publicFields = ({ password_hash: _hash, ...user }) => user;

/** What the admin UI may see about a person. */
export const forClient = ({ password_hash: _hash, token_version: _tv, ...user }) => user;

export const byId = (id) => one(`SELECT ${PUBLIC} FROM users WHERE id = $1`, [id]);
export const withHashByEmail = (email) => one(`SELECT ${PUBLIC}, password_hash FROM users WHERE email = $1`, [email]);
export const passwordHash = async (id) => (await one('SELECT password_hash FROM users WHERE id = $1', [id]))?.password_hash ?? null;
export const count = async () => (await one('SELECT count(*)::int AS n FROM users')).n;
export const ownerCount = async () => (await one(`SELECT count(*)::int AS n FROM users WHERE role = 'owner'`)).n;
export const emailTaken = async (email, exceptId = 0) =>
  Boolean(await one('SELECT 1 FROM users WHERE email = $1 AND id <> $2', [email, exceptId]));

export const list = () =>
  query(`SELECT ${PUBLIC}, (SELECT count(*) FROM posts p WHERE p.author_id = u.id)::int AS posts FROM users u ORDER BY u.id`);

export const create = ({ email, name, role, bio = '', jobTitle = '', passwordHash: hash }) =>
  one(`INSERT INTO users (email, name, role, bio, job_title, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${PUBLIC}`, [
    email,
    name,
    role,
    bio,
    jobTitle,
    hash,
  ]);

export const update = (id, { email, name, role, bio, jobTitle, avatarMediaId }) =>
  one(
    `UPDATE users SET email = $2, name = $3, role = $4, bio = $5, job_title = $6, avatar_media_id = $7 WHERE id = $1 RETURNING ${PUBLIC}`,
    [id, email, name, role, bio, jobTitle, avatarMediaId],
  );

/** New hash and a new token version, which signs out every existing session. */
export const setPassword = (id, hash) =>
  one(`UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1 RETURNING ${PUBLIC}`, [id, hash]);

/** Remove a user; their posts move to `heirId` so nothing is left without an author. */
export const remove = (id, heirId) =>
  tx(async (t) => {
    await t.exec('UPDATE posts SET author_id = $2 WHERE author_id = $1', [id, heirId]);
    return t.exec('DELETE FROM users WHERE id = $1', [id]);
  });

// ---- failed sign-ins ----

export const recentLoginFailures = (email, ip, minutes) =>
  one(
    `SELECT count(*) FILTER (WHERE email = $1)::int AS account, count(*)::int AS ip
       FROM login_failures WHERE ip = $2 AND at > now() - make_interval(mins => $3)`,
    [email, ip, minutes],
  );

export async function recordLoginFailure(email, ip) {
  await exec('INSERT INTO login_failures (email, ip) VALUES ($1, $2)', [email, ip]);
  await exec(`DELETE FROM login_failures WHERE at < now() - interval '1 day'`);
}

export const clearLoginFailures = (email, ip) => exec('DELETE FROM login_failures WHERE email = $1 AND ip = $2', [email, ip]);
