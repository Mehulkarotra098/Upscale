import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.SESSION_SECRET = 'unit-test-secret-0123456789-abcdefghij';
const { sign, verify, expiresIn } = await import('../../server/auth/tokens.js');
const { hashPassword, verifyPassword } = await import('../../server/auth/passwords.js');

test('tokens: round trip, tamper and expiry', () => {
  const t = sign({ uid: 1, tv: 3, exp: expiresIn(60) });
  assert.equal(verify(t).uid, 1);

  const [body, mac] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: 2, tv: 3, exp: expiresIn(60) })).toString('base64url');
  assert.equal(verify(`${forged}.${mac}`), null, 'changed payload');
  assert.equal(verify(`${body}.${mac.slice(0, -2)}xx`), null, 'changed signature');
  assert.equal(verify(sign({ uid: 1, exp: Math.floor(Date.now() / 1000) - 1 })), null, 'expired');
  for (const junk of [undefined, '', 'abc', 'a.b.c', '.', '%%%.%%%']) assert.equal(verify(junk), null, `junk ${junk}`);
});

test('passwords: hash, verify, reject wrong and malformed', async () => {
  const h = await hashPassword('correct horse battery');
  assert.match(h, /^scrypt\$16384\$/);
  assert.equal(await verifyPassword('correct horse battery', h), true);
  assert.equal(await verifyPassword('wrong', h), false);
  for (const bad of [null, '', 'bcrypt$x', 'scrypt$1$a$b', 'scrypt$99999999$c2FsdA==$a2V5']) {
    assert.equal(await verifyPassword('x', bad), false, `malformed ${bad}`);
  }
});
