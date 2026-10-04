# U Scale website

Single-page site for **U Scale**, a full-service digital marketing agency in Mumbai, founded by Mehul.

The repo root is the live site: `index.html`, `styles.css` and `script.js`. There is no build step, so it deploys as-is to Vercel, Netlify, GitHub Pages or any static host.

## Deploy

- **Vercel / Netlify:** import this repo, framework preset "Other", no build command, output directory `/`.
- **GitHub Pages:** Settings → Pages → deploy from branch `main`, folder `/ (root)`. (Pages on a private repo needs a paid GitHub plan.)

## What's inside

- Brand loader (plays once per session), sticky header that turns dark over violet panels, mobile menu
- Sections, in order: Hero, Trust bar, Services, How we work, Work (9 projects), Pricing, Free audit, Testimonials, Founder, FAQ, Final CTA, Contact, Footer
- Motion: Lenis smooth scroll (falls back to native), desktop bubble cursor, scroll reveals, marquee, counters, FAQ accordion. Everything respects `prefers-reduced-motion`.
- Brand: midnight violet `#251E45`, vivid green `#63B849`, soft lavender `#C9BCE8`, off-white `#FAF9FC`. Anton for display, Inter for body.

## Editing

Edit the source in `source/src/`, then rebuild:

```bash
cd source/build
python3 build_site.py   # writes index.html, styles.css, script.js to the repo root and source/preview.html
```

`build_site.py` also holds the work-card copy, FAQ copy, icons and project thumbnails. The logo paths in `paths.json` were traced from `logo-uscale.png` with `trace.py` (needs `pip install potracer opencv-python scipy`).

You can also edit the three root files directly for small fixes; just copy the change into `source/src/` too, or the next rebuild will overwrite it.

## Before launch (search the code for `TODO`)

1. Phone and WhatsApp number (placeholder `91XXXXXXXXXX` in every `wa.me` link and `+91 XXXXX XXXXX`)
2. Email: confirm or replace `hello@uscale.in`
3. Wire the contact form to Formspree or Getform (enquiries currently go nowhere)
4. 2–3 real testimonials to replace the placeholders
5. Project screenshots (optional; SVG thumbnails ship otherwise)
6. Live domain (canonical, og:url, JSON-LD) and a 1200×630 share image
7. Booking calendar link for "Book a free strategy call" (optional)
