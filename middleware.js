// Vercel Routing Middleware: notices AI assistants and crawlers reading the site, and people arriving from an AI
// answer (ChatGPT, Perplexity, Gemini, Claude…), so Admin → AI search can show which pages AI tools actually use.
//
// It never changes a response: every request continues untouched. A matching request is reported to
// /api/blog?view=ai in the background (after the response), with AI_LOG_KEY as proof it came from here.
// Without AI_LOG_KEY it does nothing. Images, scripts, styles, fonts and the API never reach it (see matcher).
import { classify } from './server/ai/agents.js';

export const config = {
  runtime: 'edge',
  matcher: [
    '/((?!api/|assets/|admin|_blog/|media/|.*\\.(?:css|js|mjs|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|webmanifest|mp4|webm|pdf)$).*)',
  ],
};

const CONTINUE = { headers: { 'x-middleware-next': '1' } };

export default function middleware(request, context) {
  const key = process.env.AI_LOG_KEY;
  if (key) {
    const h = request.headers;
    const hit = classify({
      ua: h.get('user-agent') || '',
      referer: h.get('referer') || '',
      url: request.url,
      dest: h.get('sec-fetch-dest') || '',
      accept: h.get('accept') || '',
    });
    if (hit) {
      const sent = fetch(new URL('/api/blog?view=ai', request.url), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ai-key': key },
        body: JSON.stringify(hit),
      }).catch(() => {});
      if (typeof context?.waitUntil === 'function') context.waitUntil(sent);
    }
  }
  return new Response(null, CONTINUE);
}
