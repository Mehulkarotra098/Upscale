// Runtime configuration for the blog and admin functions. Read once from the environment (Vercel → Settings →
// Environment Variables, or .env.local for `npm run dev`). See README → "Environment variables".

const env = process.env;

/** Normalise an origin to `https://host/` (always a trailing slash, so `${SITE_URL}blog` works). */
function toOrigin(raw) {
  let value = String(raw || '').trim();
  if (!value) return '';
  if (!value.includes('://')) value = `https://${value}`;
  return `${value.replace(/\/+$/, '')}/`;
}

const indexableFlag = env.SITE_INDEXABLE;

export const SITE_URL = toOrigin(env.SITE_URL) || 'https://uscale.in/';
export const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, '');
export const IS_PROD = env.VERCEL_ENV === 'production';
const INDEXABLE = indexableFlag != null ? !['0', 'false', 'no'].includes(indexableFlag) : (env.VERCEL_ENV || 'production') === 'production';
export const ROBOTS = INDEXABLE ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow';

export const DATABASE_URL = env.DATABASE_URL || env.POSTGRES_URL || '';
/** Postgres schema for all tables. Tests give each run its own schema. */
export const DB_SCHEMA = /^[a-z_][a-z0-9_]{0,40}$/.test(env.DB_SCHEMA || '') ? env.DB_SCHEMA : 'uscale';
export const SESSION_SECRET = env.SESSION_SECRET || '';
// IndexNow keys are public by design (served at /indexnow-key.txt to prove domain ownership), so a default lives here.
export const INDEXNOW_KEY = (env.INDEXNOW_KEY || '438167be6e90a125783a393266a7650e').trim();
export const CRON_SECRET = env.CRON_SECRET || '';
/** Google Places API (New) key for shop reports and outreach. Server-side only: restrict it to the Places API. */
export const PLACES_KEY = (env.GOOGLE_PLACES_KEY || '').trim();

/** First-run owner account: the first sign-in with these credentials creates it (only while no users exist). */
export const BOOTSTRAP_ADMIN = {
  email: String(env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase(),
  password: String(env.ADMIN_PASSWORD || ''),
  name: env.ADMIN_NAME || 'Mehul Karotra',
};

/** Hard limits, in one place. Vercel rejects request bodies over 4.5 MB before they reach a function. */
export const LIMITS = Object.freeze({
  bodyBytes: 4 * 1024 * 1024,
  imageFullBytes: 2 * 1024 * 1024, // full + small, base64-encoded (+33%), must stay under bodyBytes
  imageSmallBytes: 0.75 * 1024 * 1024,
  imageMaxPx: 5000,
  articleHtmlChars: 800_000,
  passwordMin: 10,
  revisionsKept: 25,
  revisionEveryMs: 3 * 60 * 1000,
  loginFailuresPerAccount: 8,
  loginFailuresPerIp: 30,
  loginWindowMinutes: 15,
  sessionDays: 14,
  previewDays: 3,
});

export const BRAND = Object.freeze({
  name: 'U Scale',
  blogName: 'The U Scale Blog',
  author: 'Mehul Karotra',
  authorTitle: 'Founder, U Scale',
  authorBio:
    'Mehul Karotra is a UI/UX developer-designer in Mumbai. Through U Scale he personally builds websites and runs SEO, social media, ads and AI search visibility for Indian businesses.',
  email: 'uscalewithus@gmail.com',
  phone: '+91 79773 60142',
  wa: `https://wa.me/917977360142?text=${encodeURIComponent("Hi Mehul, I read your blog and I'd like to talk about my business.")}`,
  sameAs: ['https://www.instagram.com/uscalewithus/', 'https://www.linkedin.com/in/mehulkarotra/', 'https://github.com/Mehulkarotra098'],
});

/** Service landing pages: internal-link targets and the CTA shown under related posts. */
export const SERVICES = Object.freeze([
  {
    slug: 'website-design-mumbai',
    name: 'Website design in Mumbai',
    short: 'Website design',
    pitch: 'Fast, custom websites that turn visitors into enquiries.',
  },
  { slug: 'seo-mumbai', name: 'SEO services in Mumbai', short: 'SEO', pitch: 'Rank on Google for the searches your customers make.' },
  {
    slug: 'social-media-management-mumbai',
    name: 'Social media management',
    short: 'Social media',
    pitch: 'Content and reels that keep your business top of mind.',
  },
  {
    slug: 'google-meta-ads-mumbai',
    name: 'Google & Meta ads',
    short: 'Google & Meta ads',
    pitch: 'Ads that bring leads, not just clicks.',
  },
  {
    slug: 'ai-search-visibility',
    name: 'AI search visibility',
    short: 'AI search',
    pitch: 'Get recommended by ChatGPT, Gemini and Google AI answers.',
  },
]);

export const SERVICE_SLUGS = new Set(SERVICES.map((s) => s.slug));

/** Pages offered in the editor's internal-link search. */
export const STATIC_PAGES = Object.freeze([
  { url: '/', title: 'Home: U Scale by Mehul Karotra' },
  { url: '/pricing', title: 'Pricing and quote builder' },
  { url: '/#contact', title: 'Free audit / contact form' },
  { url: '/blog', title: 'Blog: all articles' },
  ...SERVICES.map((s) => ({ url: `/services/${s.slug}`, title: s.name })),
]);
