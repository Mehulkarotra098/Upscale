"""Single source of truth for every price on the site (home price explorer, /pricing page, service pages, JSON-LD, llms.txt).
From Mehul's published price sheet. Edit here, rebuild, and every page updates."""

PLANS = [  # monthly retainers (unchanged)
    dict(name='Launch', price=35000, per='/mo', for_='For businesses getting serious about digital.',
         items=['Social media management (12 posts + 4 reels)', 'Google Business Profile setup', 'Baseline SEO', 'Monthly performance report']),
    dict(name='Grow', price=75000, per='/mo', for_='For businesses ready to scale.', pop=True,
         items=['Everything in Launch', 'Google + Meta ads management', 'Technical SEO + 4 blogs/month', 'WhatsApp lead funnels', 'LinkedIn presence']),
    dict(name='Scale', price=None, per='', for_='For businesses playing to win.',
         items=['Everything in Grow', 'Branding and identity', 'A weekly strategy call with me', 'Priority turnaround', 'Quarterly growth roadmap']),
]

WEBSITES = [  # one-time, fixed price after a free audit
    ('Landing page', '₹25,000', 25000),
    ('Portfolio site', '₹40,000', 40000),
    ('Business site, 3–4 pages', '₹55,000', 55000),
    ('Business site, 5–10 pages + blog', '₹85,000', 85000),
    ('E-commerce, under 50 products', '₹95,000', 95000),
    ('E-commerce, 50–500 products', 'from ₹1,50,000', 150000),
    ('Restaurant site + own online ordering', '₹90,000', 90000),
    ('Redesign of your current site', '70% of a fresh build', None),
    ('Care plan: updates, backups, security', '₹3,500/mo', 3500),
]
WEBSITES_NOTE = 'Copywriting (₹2,000/page), photography, premium plugins and payment gateway fees are quoted separately, always before I start.'

ADDONS = [  # monthly; stack on any plan or buy on their own
    ('Local SEO / Google Business Profile', '₹15,000/mo', None, 15000),
    ('Technical + on-page SEO', '₹25,000/mo', None, 25000),
    ('AI search visibility (GEO)', '₹12,000/mo', None, 12000),
    ('Ads management', '₹20,000/mo', 'Flat up to ₹1.5L monthly ad spend, then 12% of spend. Setup ₹10,000 one-time; ad spend paid to Google/Meta directly.', 20000),
    ('Email marketing', '₹8,000/mo', None, 8000),
    ('Review & reputation management', '₹10,000/mo', None, 10000),
    ('WhatsApp automation', '₹8,000 setup', 'One-time setup; the WhatsApp platform is billed at cost.', 8000),
    ('Community & inbox management', '₹12,000/mo', None, 12000),
]

UNITS = [  # pick exactly what you need
    ('Social design', [('Social post', '₹800'), ('Carousel', '₹1,500'), ('Designed story', '₹800'), ('Infographic', '₹4,000')]),
    ('Reel editing', [('Reel edit (your footage)', '₹2,500'), ('Premium edit (grading, motion graphics)', '₹5,000')]),
    ('Reel production', [('Half-day shoot + 3 reels', '₹15,000'), ('Full-day shoot + 6 reels', '₹25,000')]),
    ('Writing', [('SEO blog (~1,000 words)', '₹2,000'), ('Website copy', '₹2,000/page'), ('LinkedIn article', '₹2,500')]),
    ('Brand identity', [('Logo', '₹5,000'), ('Identity kit', '₹20,000'), ('Full identity system', 'from ₹45,000')]),
    ('Audits', [('SEO deep-dive audit (free if we work together)', '₹7,500'), ('AI visibility audit (free if we work together)', '₹2,500')]),
]

TERMS = [
    '20% advance to start, 20% on design sign-off, 60% on launch. Final files are released after the final payment.',
    '2–3 revision rounds included on every project, agreed in writing before I start.',
    'Every website includes mobile-responsive design, enquiry forms, basic SEO, Google Maps, social links and a 15–30 day bug-fix window.',
    'Retainers: free audit first, a 3-month sprint, then month-to-month. 30 days notice to pause or cancel.',
    'Quotes are valid for 14 days.',
]
