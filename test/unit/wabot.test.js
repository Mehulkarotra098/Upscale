import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';

const { reply, resultText, TEXT } = await import('../../server/wa/bot.js');
const { validSignature, messagesOf } = await import('../../server/wa/handler.js');
const { toPayload } = await import('../../server/wa/send.js');

const REPORT = {
  name: 'Shine Salon',
  address: 'Marol, Andheri East',
  pts: 42,
  grade: 'work',
  open: true,
  fixes: [
    { id: 'count', gain: 15, text: { en: 'Get more reviews', hi: 'Aur reviews chahiye' } },
    { id: 'photos', gain: 8, text: { en: 'Add photos', hi: 'Photos daaliye' } },
    { id: 'website', gain: 7, text: { en: 'Add a website', hi: 'Website daaliye' } },
    { id: 'hours', gain: 6, text: { en: 'Add hours', hi: 'Timing daaliye' } },
  ],
};

function deps(over = {}) {
  const calls = [];
  const d = {
    calls,
    lead: async () => ({ last_score: 42, last_code: 'abc2345' }),
    optOut: async (id, v) => calls.push(['optOut', v]),
    wantsHelp: async () => calls.push(['help']),
    takeCheck: async () => true,
    resolveMaps: async () => 'PLACE_FROM_LINK',
    findOne: async (q) => (calls.push(['find', q]), { id: 'PLACE_FROM_TEXT' }),
    buildReport: async (id) => (calls.push(['report', id]), REPORT),
    codeFor: async () => 'abc2345',
    recordCheck: async (...a) => calls.push(['record', ...a]),
    hasPlaces: () => true,
    ...over,
  };
  return d;
}

test('greetings and media get the intro', async () => {
  for (const text of ['hi', 'Hello!', 'namaste', '?', 'ok']) {
    const [m] = await reply({ from: '919800000000', type: 'text', text }, deps());
    assert.equal(m.body, TEXT.intro, text);
  }
  const [m] = await reply({ from: '919800000000', type: 'image' }, deps());
  assert.equal(m.body, TEXT.intro);
});

test('a shop name is looked up in Mumbai and scored, with two buttons', async () => {
  const d = deps();
  const [m] = await reply({ from: '919800000000', type: 'text', text: 'Shine Salon Marol' }, d);
  assert.deepEqual(
    d.calls.find((c) => c[0] === 'find'),
    ['find', 'Shine Salon Marol, Mumbai'],
  );
  assert.equal(m.type, 'buttons');
  assert.match(m.body, /\*42\/100\*/);
  assert.match(m.body, /uscale\.in\/r\/abc2345/);
  assert.equal(m.body.split('\n').filter((l) => /^\d\. /.test(l)).length, 3);
  assert.deepEqual(
    m.buttons.map((b) => b.id),
    ['help', 'again'],
  );
  assert.ok(d.calls.some((c) => c[0] === 'record' && c[2] === 'abc2345' && c[3] === 42));
});

test('a Google Maps link is resolved without a text search', async () => {
  const d = deps();
  await reply({ from: '1', type: 'text', text: 'check this https://maps.app.goo.gl/AbCd123' }, d);
  assert.deepEqual(
    d.calls.find((c) => c[0] === 'report'),
    ['report', 'PLACE_FROM_LINK'],
  );
  assert.equal(
    d.calls.some((c) => c[0] === 'find'),
    false,
  );
});

test('not found, daily limit, not set up, and stop', async () => {
  assert.equal((await reply({ from: '1', type: 'text', text: 'zzzz qqqq' }, deps({ findOne: async () => null })))[0].body, TEXT.notFound);
  assert.equal((await reply({ from: '1', type: 'text', text: 'Shine Salon' }, deps({ takeCheck: async () => false })))[0].body, TEXT.limit);
  assert.equal((await reply({ from: '1', type: 'text', text: 'Shine Salon' }, deps({ hasPlaces: () => false })))[0].body, TEXT.down);
  const d = deps();
  assert.equal((await reply({ from: '1', type: 'text', text: 'STOP' }, d))[0].body, TEXT.stop);
  assert.deepEqual(d.calls[0], ['optOut', true]);
});

test('"Theek karwana hai" marks the lead and hands over to Mehul with the report', async () => {
  const d = deps();
  const [m] = await reply({ from: '1', type: 'button', buttonId: 'help' }, d);
  assert.deepEqual(d.calls[0], ['help']);
  assert.match(m.body, /wa\.me\/917977360142\?text=/);
  assert.match(decodeURIComponent(m.body), /score 42\/100, report: https:\/\/uscale\.in\/r\/abc2345/);
});

test('result text skips the closed warning for open shops', () => {
  assert.doesNotMatch(resultText(REPORT, 'abc2345'), /band/);
  assert.match(resultText({ ...REPORT, open: false }, 'abc2345'), /band/);
});

test('webhook signatures', () => {
  const raw = Buffer.from('{"a":1}');
  const sig = `sha256=${createHmac('sha256', 'shh').update(raw).digest('hex')}`;
  assert.equal(validSignature(raw, sig, 'shh'), true);
  assert.equal(validSignature(raw, sig, 'other'), false);
  assert.equal(validSignature(raw, 'sha256=00', 'shh'), false);
  assert.equal(validSignature(raw, sig, ''), false);
  assert.equal(validSignature(raw, undefined, 'shh'), false);
});

test('Meta payloads are flattened, including button replies', () => {
  const body = {
    entry: [
      {
        changes: [
          {
            value: {
              contacts: [{ wa_id: '919800000000', profile: { name: 'Ravi' } }],
              messages: [
                { id: 'm1', from: '919800000000', type: 'text', text: { body: 'Shine Salon' } },
                { id: 'm2', from: '919800000000', type: 'interactive', interactive: { button_reply: { id: 'help', title: 'x' } } },
              ],
            },
          },
        ],
      },
    ],
  };
  const ms = messagesOf(body);
  assert.equal(ms.length, 2);
  assert.deepEqual([ms[0].name, ms[0].text, ms[1].type, ms[1].buttonId], ['Ravi', 'Shine Salon', 'button', 'help']);
  assert.deepEqual(messagesOf({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] }), []);
});

test('reply buttons are trimmed to WhatsApp limits', () => {
  const p = toPayload('1', {
    type: 'buttons',
    body: 'x'.repeat(2000),
    buttons: [
      { id: 'a', title: 'y'.repeat(30) },
      { id: 'b', title: 'b' },
      { id: 'c', title: 'c' },
      { id: 'd', title: 'd' },
    ],
  });
  assert.equal(p.interactive.body.text.length, 1024);
  assert.equal(p.interactive.action.buttons.length, 3);
  assert.equal(p.interactive.action.buttons[0].reply.title.length, 20);
});
