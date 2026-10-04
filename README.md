# U Scale website

Single-page site for **U Scale**, a full-service digital marketing agency in Mumbai, founded by Mehul Karotra.

The repo root is the live site: `index.html`, `styles.css`, `script.js` and `assets/` (real screenshots and client logos, WebP, about 1.2 MB). There is no build step, so it deploys as-is to Vercel, Netlify, GitHub Pages or any static host.

## Deploy

- **Vercel / Netlify:** import this repo, framework preset "Other", no build command, output directory `/`.
- **GitHub Pages:** Settings → Pages → deploy from branch `main`, folder `/ (root)`. (Pages on a private repo needs a paid GitHub plan.)

## What's inside

- Brand loader (plays once per session), frosted header with a green scroll-progress line, dark over violet panels, hides on scroll down
- Sections, in order: Hero, Client logo wall, Services, How we work, Work, Pricing, Free audit, Testimonials, Founder, FAQ, Final CTA, Contact, Footer
- Real proof: every work card is a browser frame holding a real full-page capture of the live site (auto-scrolls on hover), with a phone frame showing the real mobile capture where the site allows framing, and the client's real logo. The logo wall uses logos taken from each site.
- Motion, one rAF loop: Lenis smooth scroll (native fallback), bubble-trail cursor on a canvas (desktop only), hero spotlight, pinned process scene and pinned horizontal work gallery (desktop), project index with a floating preview, card tilt, magnetic buttons, count-ups, scramble eyebrows, footer fill.
- Motion toggle in the footer and menu (remembered per visitor). `prefers-reduced-motion` starts it off.
- Brand: midnight violet `#251E45`, vivid green `#63B849`, soft lavender `#C9BCE8`, off-white `#FAF9FC`. Anton for display, Inter for body.

## Editing

Edit the source in `source/src/`, then rebuild:

```bash
cd source/build
python3 build_site.py   # writes index.html, styles.css, script.js to the repo root and source/preview.html
```

`build_site.py` also holds the work-card copy, FAQ copy and icons. `process_assets.py` turned the raw browser captures into `assets/` (raw captures are not in the repo). The logo paths in `paths.json` were traced from `logo-uscale.png` with `trace.py` (needs `pip install potracer opencv-python scipy`).

You can also edit the three root files directly for small fixes; just copy the change into `source/src/` too, or the next rebuild will overwrite it.

## Contact details in the site

WhatsApp and phone +91 79773 60142, email uscalewithus@gmail.com, Instagram @uscalewithus, plus LinkedIn and GitHub in the footer.

## Testimonials (approval-gated)

`source/src/testimonials.json` holds draft reviews for Prachi, Vidhi Parmar, Yash (BrandGen), Raj Patel and Vrushab Jain. A card only appears on the site when its entry has `"approved": true`, so send each person their draft, paste in their edited wording, flip the flag, rebuild. Until at least one is approved, three honest placeholders show.

## Before launch (search the code for `TODO`)

1. Wire the contact form to Formspree or Getform (enquiries currently go nowhere)
2. Get the five testimonial drafts approved (and add Raj's and Vrushab's business names)
3. Live domain (canonical, og:url, JSON-LD) and a 1200×630 share image
4. Booking calendar link for "Book a free strategy call" (optional)
5. GA4 measurement ID (commented snippet in the head)
