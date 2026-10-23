import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AGENTS, classify, cleanHit, cleanPath } from '../../server/ai/agents.js';

const URL0 = 'https://uscale.in/services/website-design-mumbai/';
const UA = {
  chatgpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  oai: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  gpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
  pplxUser:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
  claudeSearch: 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)',
  bing: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0 Safari/537.36',
  chrome: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36',
};

test('AI assistants and crawlers are told apart by user agent', () => {
  assert.deepEqual(classify({ ua: UA.chatgpt, url: URL0 }), {
    type: 'bot',
    name: 'ChatGPT',
    kind: 'live',
    path: '/services/website-design-mumbai',
  });
  assert.equal(classify({ ua: UA.oai, url: URL0 }).name, 'ChatGPT search');
  assert.equal(classify({ ua: UA.gpt, url: URL0 }).kind, 'train');
  assert.equal(classify({ ua: UA.pplxUser, url: URL0 }).name, 'Perplexity');
  assert.equal(classify({ ua: UA.claudeSearch, url: URL0 }).kind, 'index');
  assert.equal(classify({ ua: UA.bing, url: 'https://uscale.in/llms.txt' }).path, '/llms.txt');
  assert.equal(classify({ ua: UA.chrome, url: URL0, dest: 'document' }), null, 'a normal visitor is not logged');
});

test('every agent token matches only itself', () => {
  for (const [token, name] of AGENTS) {
    const hit = classify({ ua: `Mozilla/5.0 (compatible; ${token}/1.0)`, url: URL0 });
    assert.equal(hit?.name, name, token);
  }
});

test('visitors from an AI answer: referrer or utm_source, page views only', () => {
  const page = { ua: UA.chrome, dest: 'document' };
  assert.deepEqual(classify({ ...page, url: URL0, referer: 'https://chatgpt.com/' }), {
    type: 'ref',
    name: 'ChatGPT',
    kind: 'ref',
    path: '/services/website-design-mumbai',
  });
  assert.equal(classify({ ...page, url: `${URL0}?utm_source=chatgpt.com` }).name, 'ChatGPT');
  assert.equal(classify({ ...page, url: URL0, referer: 'https://www.perplexity.ai/search/abc' }).name, 'Perplexity');
  assert.equal(classify({ ...page, url: URL0, referer: 'https://gemini.google.com/app' }).name, 'Gemini');
  assert.equal(
    classify({ ua: UA.chrome, url: URL0, referer: 'https://chatgpt.com/', accept: 'text/html,application/xhtml+xml' }).name,
    'ChatGPT',
  );
  assert.equal(classify({ ...page, url: URL0, referer: 'https://www.google.com/' }), null, 'normal search is not an AI answer');
  assert.equal(classify({ ...page, url: `${URL0}?utm_source=google` }), null);
  assert.equal(classify({ ...page, url: URL0, referer: 'https://notchatgpt.com/' }), null, 'look-alike hosts do not count');
  assert.equal(classify({ ua: UA.chrome, url: URL0, referer: 'https://chatgpt.com/', dest: 'image' }), null, 'not a page view');
});

test('paths are cleaned so the log cannot fill with junk', () => {
  assert.equal(cleanPath('/Blog/Post-1/'), '/blog/post-1');
  assert.equal(cleanPath('/'), '/');
  assert.equal(cleanPath('/x<script>'), '(other)');
  assert.equal(cleanPath(`/${'a'.repeat(200)}`), '(other)');
});

test('cleanHit accepts only well-formed hits', () => {
  assert.deepEqual(cleanHit({ type: 'bot', name: 'ChatGPT', kind: 'live', path: '/About/' }), {
    type: 'bot',
    name: 'ChatGPT',
    kind: 'live',
    path: '/about',
  });
  assert.equal(cleanHit({ type: 'bot', name: 'Evil bot', kind: 'live', path: '/' }), null);
  assert.equal(cleanHit({ type: 'ref', name: 'ChatGPT', kind: 'live', path: '/' }), null);
  assert.equal(cleanHit({ type: 'bot', name: 'ChatGPT', kind: 'nope', path: '/' }), null);
  assert.equal(cleanHit(null), null);
});

test('middleware: always continues; reports AI hits in the background only with a key', async () => {
  const { default: middleware, config } = await import('../../middleware.js');
  assert.equal(config.runtime, 'edge');
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => (calls.push([String(url), init]), new Response(null, { status: 204 }));
  try {
    const waits = [];
    const ctx = { waitUntil: (p) => waits.push(p) };
    const req = (ua, extra = {}) => new Request(URL0, { headers: { 'user-agent': ua, ...extra } });

    delete process.env.AI_LOG_KEY;
    let res = middleware(req(UA.chatgpt), ctx);
    assert.equal(res.headers.get('x-middleware-next'), '1');
    assert.equal(calls.length, 0, 'no key, no logging');

    process.env.AI_LOG_KEY = 'k'.repeat(32);
    res = middleware(req(UA.chatgpt), ctx);
    assert.equal(res.headers.get('x-middleware-next'), '1');
    await Promise.all(waits);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'https://uscale.in/api/blog?view=ai');
    assert.equal(calls[0][1].headers['x-ai-key'], 'k'.repeat(32));
    assert.deepEqual(JSON.parse(calls[0][1].body), { type: 'bot', name: 'ChatGPT', kind: 'live', path: '/services/website-design-mumbai' });

    middleware(req(UA.chrome, { 'sec-fetch-dest': 'document' }), ctx);
    assert.equal(calls.length, 1, 'ordinary visitors are not reported');
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.AI_LOG_KEY;
  }
});

test('middleware matcher skips assets, the API and admin but keeps pages, llms.txt and robots.txt', async () => {
  const { config } = await import('../../middleware.js');
  // Vercel's matcher syntax: a path-to-regexp pattern whose inner group is a plain regular expression.
  const inner = new RegExp(`^${config.matcher[0].replace(/^\/\(/, '/(?:')}$`);
  for (const p of ['/', '/about', '/services/website-design-mumbai/ghatkopar', '/blog/x', '/llms.txt', '/robots.txt', '/sitemap.xml'])
    assert.ok(inner.test(p), p);
  for (const p of [
    '/api/blog',
    '/assets/x.webp',
    '/styles.css',
    '/script.js',
    '/admin',
    '/admin/app.js',
    '/favicon-32.png',
    '/media/a.jpg',
  ])
    assert.ok(!inner.test(p), p);
});
