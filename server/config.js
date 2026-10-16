// Runtime settings for the blog + admin functions. Everything comes from environment variables (Vercel → Settings → Environment Variables).
//
// DATABASE_URL     Neon connection string (use the pooled one, host contains "-pooler"). Required for the blog and admin.
// SESSION_SECRET   Long random string that signs admin login cookies. Required for the admin.
// ADMIN_EMAIL      \ First-run bootstrap: when no admin user exists yet, signing in with these creates the owner account.
// ADMIN_PASSWORD   / After that, manage people (and change the password) inside /admin → Team.
// SITE_URL         Public origin, e.g. https://uscale.in (same variable the static build uses).
// INDEXNOW_KEY     Optional. 8-128 hex chars. When set, publishing a post pings IndexNow (Bing, Yandex; feeds ChatGPT search).
// VERCEL_ENV       Set by Vercel. Only "production" is indexable; previews are noindex (override with SITE_INDEXABLE=1/0).

const origin = (raw) => {
  raw = (raw || '').trim();
  if (!raw) return '';
  if (!raw.includes('://')) raw = 'https://' + raw;
  return raw.replace(/\/+$/, '') + '/';
};

export const SITE_URL = origin(process.env.SITE_URL) || 'https://uscale.in/';
const flag = process.env.SITE_INDEXABLE;
const INDEXABLE = flag != null ? !['0', 'false', 'no'].includes(flag) : (process.env.VERCEL_ENV || 'production') === 'production';
export const ROBOTS = INDEXABLE ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow';
export const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || '';
export const SESSION_SECRET = process.env.SESSION_SECRET || '';
export const INDEXNOW_KEY = (process.env.INDEXNOW_KEY || '').trim();
export const IS_PROD = (process.env.VERCEL_ENV || '') === 'production';

export const BRAND = {
  name: 'U Scale',
  blogName: 'The U Scale Blog',
  author: 'Mehul Karotra',
  email: 'uscalewithus@gmail.com',
  phone: '+91 79773 60142',
  wa: 'https://wa.me/917977360142?text=' + encodeURIComponent("Hi Mehul, I read your blog and I'd like to talk about my business."),
  sameAs: ['https://www.instagram.com/uscalewithus/', 'https://www.linkedin.com/in/mehulkarotra/', 'https://github.com/Mehulkarotra098'],
};

// Service landing pages: internal-link targets and the CTA shown under related posts.
export const SERVICES = [
  { slug: 'website-design-mumbai', name: 'Website design in Mumbai', short: 'Website design', pitch: 'Fast, custom websites that turn visitors into enquiries.' },
  { slug: 'seo-mumbai', name: 'SEO services in Mumbai', short: 'SEO', pitch: 'Rank on Google for the searches your customers make.' },
  { slug: 'social-media-management-mumbai', name: 'Social media management', short: 'Social media', pitch: 'Content and reels that keep your business top of mind.' },
  { slug: 'google-meta-ads-mumbai', name: 'Google & Meta ads', short: 'Google & Meta ads', pitch: 'Ads that bring leads, not just clicks.' },
  { slug: 'ai-search-visibility', name: 'AI search visibility', short: 'AI search', pitch: 'Get recommended by ChatGPT, Gemini and Google AI answers.' },
];

export const STATIC_PAGES = [
  { url: '/', title: 'Home: U Scale by Mehul Karotra' },
  { url: '/pricing', title: 'Pricing and quote builder' },
  { url: '/#contact', title: 'Free audit / contact form' },
  { url: '/blog', title: 'Blog: all articles' },
  ...SERVICES.map((s) => ({ url: `/services/${s.slug}`, title: s.name })),
];
