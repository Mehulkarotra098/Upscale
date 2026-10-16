// Small blog pages: 404 and "coming soon" (no database yet, or it's temporarily unreachable).
import { abs, ARROW, BLOG_DESC, BLOG_TITLE, head, simpleHero } from './parts.js';

export function renderNotFound() {
  return {
    head: head({ title: 'Article not found | U Scale', desc: BLOG_DESC, url: abs('blog'), robots: 'noindex, follow' }),
    main: simpleHero({
      eyebrow: 'Error 404',
      title: 'Article not found',
      lead: 'It may have moved. Browse all articles, or get a free audit of your business.',
      actions: `<a class="btn btn--go" href="/blog">All articles ${ARROW}</a><a class="btn btn--ghost" href="/#contact">Free audit</a>`,
    }),
  };
}

export function renderComingSoon() {
  return {
    head: head({ title: BLOG_TITLE, desc: BLOG_DESC, url: abs('blog'), robots: 'noindex, follow' }),
    main: simpleHero({
      eyebrow: 'Blog',
      title: 'Coming soon',
      lead: 'Guides on websites, SEO, social media and AI search for Indian businesses are on the way.',
      actions: `<a class="btn btn--go" href="/#contact" data-intent="audit">Get a free audit ${ARROW}</a>`,
    }),
  };
}
