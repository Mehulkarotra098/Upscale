// WhatsApp Cloud API sender. Replies inside the 24-hour window after a person messages us are service messages
// (the first 1,000 a month per number are free since Oct 2026), so the bot never starts conversations itself.
import { WA } from '../config.js';
import { log } from '../lib/log.js';

const clip = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));

/** Turn the bot's reply objects into Cloud API payloads. */
export function toPayload(to, msg) {
  if (msg.type === 'buttons') {
    return {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: clip(msg.body, 1024) },
        action: { buttons: msg.buttons.slice(0, 3).map((b) => ({ type: 'reply', reply: { id: b.id, title: clip(b.title, 20) } })) },
      },
    };
  }
  return { messaging_product: 'whatsapp', to, type: 'text', text: { body: clip(msg.body, 4096), preview_url: true } };
}

export async function send(to, msg, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`https://graph.facebook.com/${WA.graph}/${WA.phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(to, msg)),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    log.warn('wa', 'send failed', { status: res.status, code: err?.error?.code, msg: err?.error?.message });
    return false;
  }
  return true;
}

/** Blue ticks: tells the sender we've read their message. Best effort. */
export function markRead(messageId, { fetchImpl = fetch } = {}) {
  return fetchImpl(`https://graph.facebook.com/${WA.graph}/${WA.phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', status: 'read', message_id: messageId }),
  }).catch(() => {});
}
