// Call a Vercel-style handler in-process with a fake request/response, and a small admin client with a cookie jar.
import { Readable } from 'node:stream';

/**
 * @param {(req, res) => Promise<void>} handler
 * @param {{ method?: string, url: string, headers?: Record<string,string>, body?: unknown }} request
 */
export async function invoke(handler, { method = 'GET', url, headers = {}, body } = {}) {
  const raw = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  const req = Readable.from(raw ? [Buffer.from(raw)] : []);
  Object.assign(req, {
    method,
    url,
    headers: { host: 'uscale.test', 'x-forwarded-proto': 'https', 'x-real-ip': '203.0.113.7', ...lower(headers) },
    socket: { remoteAddress: '127.0.0.1' },
  });

  const res = {
    statusCode: 200,
    headersSent: false,
    headers: {},
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    getHeader(k) {
      return this.headers[k.toLowerCase()];
    },
    end(chunk) {
      this.headersSent = true;
      this.body = chunk === undefined ? Buffer.alloc(0) : Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    },
  };
  await handler(req, res);
  const text = res.body ? res.body.toString('utf8') : '';
  return {
    status: res.statusCode,
    headers: res.headers,
    raw: res.body,
    text,
    json: () => JSON.parse(text),
  };
}

const lower = (h) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));

/** Talks to /api/admin like the admin app does: same-origin header, cookie kept between calls. */
export function adminClient(handler, { ip = '203.0.113.7' } = {}) {
  let cookie = '';
  async function call(action, { method, params, body, headers = {} } = {}) {
    const m = method || (body === undefined ? 'GET' : 'POST');
    const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
    const r = await invoke(handler, {
      method: m,
      url: `/api/admin?${qs}`,
      body: m === 'POST' ? (body ?? {}) : undefined,
      headers: { 'x-us-admin': '1', origin: 'https://uscale.test', 'x-real-ip': ip, ...(cookie ? { cookie } : {}), ...headers },
    });
    const set = r.headers['set-cookie'];
    if (set) cookie = String(set).split(';')[0].endsWith('=') ? '' : String(set).split(';')[0];
    return r;
  }
  return {
    call,
    get: (action, params) => call(action, { method: 'GET', params }),
    post: (action, body) => call(action, { method: 'POST', body }),
    get cookie() {
      return cookie;
    },
    set cookie(v) {
      cookie = v;
    },
  };
}

/** A real 1×1 PNG, base64 (valid magic bytes for upload tests). */
export const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
