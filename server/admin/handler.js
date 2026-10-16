// /api/admin/<action>: one entry point for the admin app.
//
// Every action declares its HTTP method, whether it needs a signed-in user (all but login/logout) and an optional
// role. Writes are POST and must carry the X-US-Admin header from the same origin: browsers can't add a custom
// header to a cross-site request without CORS (which this API never grants), so that blocks CSRF. The session
// cookie is also SameSite=Strict.
import { currentUser } from '../auth/session.js';
import { describe, forbidden, HttpError, notFound, unauthorized } from '../lib/errors.js';
import { json, query, readJSON } from '../lib/http.js';
import { log } from '../lib/log.js';
import categories from './actions/categories.js';
import dashboard from './actions/dashboard.js';
import media from './actions/media.js';
import posts from './actions/posts.js';
import session from './actions/session.js';
import team from './actions/team.js';

const ACTIONS = { ...session, ...dashboard, ...posts, ...media, ...categories, ...team };

function checkSameOrigin(req) {
  if (req.headers['x-us-admin'] !== '1') throw forbidden('Missing admin header');
  const { origin } = req.headers;
  if (!origin) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    // unparsable Origin: treat as cross-site
  }
  if (originHost !== host) throw forbidden('Cross-site request blocked');
}

export default async function adminHandler(req, res) {
  const name = String(query(req).action || '');
  const action = Object.hasOwn(ACTIONS, name) ? ACTIONS[name] : null;
  try {
    if (!action) throw notFound('Unknown action');
    if (req.method !== action.method) throw new HttpError(405, 'Method not allowed');
    if (action.method === 'POST') checkSameOrigin(req);

    const user = action.public ? null : await currentUser(req);
    if (!action.public && !user) throw unauthorized();
    if (action.role && user.role !== action.role) throw forbidden();

    const ctx = {
      req,
      user,
      params: query(req),
      body: action.method === 'POST' ? await readJSON(req) : {},
      headers: {},
    };
    const data = await action.run(ctx);
    json(res, 200, data, ctx.headers);
  } catch (err) {
    const { status, message } = describe(err);
    if (status >= 500) log.error('admin', 'action failed', { action: name, status, err });
    json(res, status, { error: message }, status === 405 && action ? { Allow: action.method } : {});
  }
}
