// Sign in / out and "who am I".
import { INDEXNOW_KEY, SERVICES, SITE_URL } from '../../config.js';
import { clearedCookie, sessionCookie, signIn } from '../../auth/session.js';
import * as users from '../../repos/users.js';

export default {
  login: {
    method: 'POST',
    public: true,
    async run({ req, body, headers }) {
      const user = await signIn(req, body.email, body.password);
      headers['Set-Cookie'] = sessionCookie(req, user);
      return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    },
  },

  logout: {
    method: 'POST',
    public: true,
    async run({ req, headers }) {
      headers['Set-Cookie'] = clearedCookie(req);
      return { ok: true };
    },
  },

  me: {
    method: 'GET',
    async run({ user }) {
      return { user: users.forClient(user), site: SITE_URL, services: SERVICES, indexnow: Boolean(INDEXNOW_KEY) };
    },
  },
};
