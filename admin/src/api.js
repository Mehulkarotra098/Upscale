// Thin client for /api/admin/<action>. Throws Error(message) with .status on failure.
export async function api(action, body, { method } = {}) {
  const m = method || (body === undefined ? 'GET' : 'POST');
  let url = `/api/admin/${action}`;
  const init = { method: m, credentials: 'same-origin', headers: { 'X-US-Admin': '1' } };
  if (m === 'GET' && body && typeof body === 'object') url += '?' + new URLSearchParams(Object.entries(body).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  else if (m !== 'GET') { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body ?? {}); }
  let res;
  try { res = await fetch(url, init); } catch { throw Object.assign(new Error('Network error. Check your connection.'), { status: 0 }); }
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status });
  return data;
}

export const get = (action, params) => api(action, params || {}, { method: 'GET' });
