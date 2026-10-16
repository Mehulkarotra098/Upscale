// People who can sign in. Owners manage the team; everyone manages their own profile and password.
import { LIMITS } from '../../config.js';
import { hashPassword, verifyPassword } from '../../auth/passwords.js';
import { sessionCookie } from '../../auth/session.js';
import { badRequest, conflict, forbidden, notFound } from '../../lib/errors.js';
import * as users from '../../repos/users.js';
import * as input from '../input.js';

export default {
  users: {
    method: 'GET',
    async run() {
      return { users: (await users.list()).map(users.forClient) };
    },
  },

  'user-save': {
    method: 'POST',
    async run({ body, user }) {
      const targetId = input.id(body.id);
      const self = targetId === user.id;
      if (!self && user.role !== 'owner') throw forbidden('Only an owner can manage the team');

      const email = input.email(body.email);
      const name = input.required(body.name, 80, 'Enter a name');
      if (await users.emailTaken(email, targetId ?? 0)) throw conflict('That email is already on the team');
      const fields = { email, name, bio: input.text(body.bio, 600), jobTitle: input.text(body.job_title, 80) };

      if (!targetId) {
        const role = input.oneOf(body.role, ['owner', 'editor'], 'editor');
        const created = await users.create({
          ...fields,
          role,
          passwordHash: await hashPassword(input.password(body.password, LIMITS.passwordMin)),
        });
        return { user: users.forClient(created) };
      }

      const target = await users.byId(targetId);
      if (!target) throw notFound('Person not found');
      // Nobody changes their own role, and the last owner can't be turned into an editor.
      let role = self ? target.role : input.oneOf(body.role, ['owner', 'editor'], target.role);
      if (target.role === 'owner' && role !== 'owner' && (await users.ownerCount()) <= 1) role = 'owner';
      const updated = await users.update(targetId, { ...fields, role, avatarMediaId: input.id(body.avatar_media_id) });
      return { user: users.forClient(updated) };
    },
  },

  'user-delete': {
    method: 'POST',
    role: 'owner',
    async run({ body, user }) {
      const targetId = input.requireId(body.id, 'person');
      if (targetId === user.id) throw badRequest("You can't remove yourself");
      if (!(await users.remove(targetId, user.id))) throw notFound('Person not found');
      return { ok: true };
    },
  },

  password: {
    method: 'POST',
    async run({ req, body, user, headers }) {
      if (!(await verifyPassword(body.current, await users.passwordHash(user.id)))) throw badRequest('Current password is wrong');
      const next = input.password(body.next, LIMITS.passwordMin);
      const updated = await users.setPassword(user.id, await hashPassword(next));
      headers['Set-Cookie'] = sessionCookie(req, updated); // this device stays signed in; every other session ends
      return { ok: true };
    },
  },
};
