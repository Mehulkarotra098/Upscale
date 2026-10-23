// Who is reading uscale.in: AI assistants opening a page live for someone, AI search indexers, AI training crawlers,
// classic search crawlers, and people who click through from an AI answer.
//
// Shared by middleware.js (which sees every page request at the edge and must stay tiny and dependency-free) and the
// logging endpoint (which re-checks whatever it is sent). Pure functions, no I/O.
//
// Why both signals: in October 2026 ChatGPT started opening links with rel=noreferrer and often without its
// utm_source tag, so click-throughs from AI answers increasingly look like "direct" visits. The live fetches by
// ChatGPT-User, Perplexity-User and Claude-User still arrive with their own user agent, so they are the most
// reliable sign that an assistant used a page to answer someone.

/** [user-agent token, name shown in the admin, kind]. First match wins. */
export const AGENTS = Object.freeze([
  ['ChatGPT-User', 'ChatGPT', 'live'],
  ['OAI-SearchBot', 'ChatGPT search', 'index'],
  ['GPTBot', 'OpenAI training', 'train'],
  ['Perplexity-User', 'Perplexity', 'live'],
  ['PerplexityBot', 'Perplexity search', 'index'],
  ['Claude-User', 'Claude', 'live'],
  ['Claude-SearchBot', 'Claude search', 'index'],
  ['ClaudeBot', 'Anthropic training', 'train'],
  ['MistralAI-User', 'Mistral Le Chat', 'live'],
  ['DuckAssistBot', 'DuckDuckGo Assist', 'live'],
  ['meta-externalfetcher', 'Meta AI', 'live'],
  ['meta-externalagent', 'Meta AI crawler', 'train'],
  ['Google-CloudVertexBot', 'Google Vertex AI', 'index'],
  ['Applebot', 'Apple (Siri, Spotlight)', 'index'],
  ['Amazonbot', 'Amazon (Alexa)', 'index'],
  ['YouBot', 'You.com', 'index'],
  ['bingbot', 'Bing (Copilot, ChatGPT search)', 'search'],
  ['Googlebot', 'Google (Search, AI Overviews)', 'search'],
  ['CCBot', 'Common Crawl', 'train'],
  ['Bytespider', 'ByteDance', 'train'],
  ['cohere-ai', 'Cohere', 'train'],
]);

/** What each kind means, for the admin. */
export const KINDS = Object.freeze({
  live: 'Opened live to answer someone',
  index: 'AI search index',
  search: 'Search engine (feeds AI answers)',
  train: 'AI training crawler',
  ref: 'Visitor from an AI answer',
});

/** Sites whose links mean "this visitor clicked through from an AI answer": [host, name]. */
export const AI_HOSTS = Object.freeze([
  ['chatgpt.com', 'ChatGPT'],
  ['chat.openai.com', 'ChatGPT'],
  ['perplexity.ai', 'Perplexity'],
  ['gemini.google.com', 'Gemini'],
  ['copilot.microsoft.com', 'Copilot'],
  ['claude.ai', 'Claude'],
  ['meta.ai', 'Meta AI'],
  ['grok.com', 'Grok'],
  ['chat.deepseek.com', 'DeepSeek'],
  ['chat.mistral.ai', 'Mistral Le Chat'],
]);

const LOWER = AGENTS.map(([token, name, kind]) => [token.toLowerCase(), name, kind]);
const NAMES = new Set([...AGENTS.map((a) => a[1]), ...AI_HOSTS.map((h) => h[1])]);
const SAFE_PATH = /^\/[A-Za-z0-9\-._~/%]{0,150}$/;

/** "/Blog/x/" → "/blog/x"; anything odd or very long becomes "(other)" so the table can't fill up with junk. */
export function cleanPath(pathname) {
  let p = String(pathname || '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  p = p.toLowerCase();
  return SAFE_PATH.test(p) ? p : '(other)';
}

function aiHost(value) {
  if (!value) return null;
  let host = String(value).toLowerCase();
  try {
    if (host.includes('/')) host = new URL(host).hostname;
  } catch {
    return null;
  }
  host = host.replace(/^www\./, '');
  const hit = AI_HOSTS.find(([h]) => host === h || host.endsWith(`.${h}`));
  return hit ? hit[1] : null;
}

/**
 * One request → { type: 'bot', name, kind, path } for a known crawler or assistant,
 * { type: 'ref', name, kind: 'ref', path } for a page view that came from an AI answer, or null.
 * @param {{ ua?: string, referer?: string, url: string, dest?: string, accept?: string }} req
 */
export function classify({ ua = '', referer = '', url, dest = '', accept = '' }) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const path = cleanPath(u.pathname);
  const agent = String(ua).toLowerCase();
  if (agent) {
    const hit = LOWER.find(([token]) => agent.includes(token));
    if (hit) return { type: 'bot', name: hit[1], kind: hit[2], path };
  }
  // A person opening a page (not an image, script or prefetch) from an AI answer.
  const isPage = dest ? dest === 'document' : /text\/html/.test(accept);
  if (!isPage) return null;
  const from = aiHost(u.searchParams.get('utm_source')) || aiHost(referer);
  return from ? { type: 'ref', name: from, kind: 'ref', path } : null;
}

/** Re-check a hit sent to the logging endpoint; returns a clean copy or null. */
export function cleanHit(body) {
  if (!body || typeof body !== 'object') return null;
  const { type, name, kind, path } = body;
  if (!['bot', 'ref'].includes(type) || !NAMES.has(name) || !Object.hasOwn(KINDS, kind)) return null;
  if ((type === 'ref') !== (kind === 'ref')) return null;
  const p = cleanPath(path);
  return { type, name, kind, path: p };
}
