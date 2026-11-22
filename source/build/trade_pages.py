"""Website design for trades across India (Nov 2026), at /services/website-design-india/<trade>.

Directories hold the India-wide "web design company in India" searches, but not "website for a clinic" or "real estate
website" (research/global/serp/SERP-COMPETITORS.md). So each trade gets one page: what its website has to do, the rules
that trade works under, rupee prices from pricing_data.py, and the same process as every other page.

Rules: no invented clients or results (sample designs say they are samples); a rule is stated only with a source, or in
general words when it is common knowledge in the trade (doctors, CAs and lawyers may not advertise like shops).
"""
import geo_pages as GP
import depth_art as DA
from geo_pages import icon, price, e
from world_pages import (LANDING, BIZ, BLOG, STORE, sec, trust, price_cards, rules_html, process_sec, work_sec, TEAM)
from world_more import features, page_dict

GP.SRC.update({
    'rera-11': ('LiveLaw, 21 Mar 2024', 'WBRERA order on Section 11(2) of RERA: registration number and website in every advertisement',
                'https://www.livelaw.in/consumer-cases/west-bengal-rera-registration-website-addresses-advertisements-252995'),
    'coach-moe': ('Lawrbit, 2024', 'Key highlights of the Ministry of Education guidelines for coaching centres, 2024',
                  'https://www.lawrbit.com/article/key-highlights-of-guidelines-for-regulation-of-coaching-centers-2024/'),
    'coach-ccpa': ('PIB, 16 Feb 2024', 'CCPA draft guidelines to prevent misleading advertisements in the coaching sector',
                   'https://pib.gov.in/PressReleasePage.aspx?PRID=2006533'),
})

TRAIL = [('Services', '/services'), ('Across India', '/services/website-design-india')]
RELATED = [('/services/website-design-india/clinics', 'By trade', 'Websites for clinics and doctors', 'Timings, fees and booking on WhatsApp.'),
           ('/services/website-design-india/real-estate', 'By trade', 'Real estate websites', 'Projects with RERA details, site visits on WhatsApp.'),
           ('/services/website-design-india/exporters', 'By trade', 'Websites for exporters', 'Catalogues and RFQs that buyers abroad trust.'),
           ('/services/website-design-india/coaching-institutes', 'By trade', 'Websites for coaching institutes', 'Courses, fees and honest results.'),
           ('/services/website-design-india/ca-and-law-firms', 'By trade', 'Websites for CA and law firms', 'Services, partners and office, within the rules.'),
           ('/services/website-design-india', 'Across India', 'Website design across India', 'The same prices in every city.')]
ALL_LINKS = ('<a class="tlink" href="/services/website-design-india">Website design across India</a> · <a class="tlink" href="/services/website-design-mumbai">All website design</a> · '
             '<a class="tlink" href="/pricing">Full price list</a>')


def _card(kind, head, small, body, chips, label, ic='pin'):
    card = (f'<div class="dk__card fp-ticket sv-ticket tr tr--{kind}"><p class="dk-quote__head"><span class="dk-quote__mark">{icon(ic)}</span>'
            f'<span><b>{e(head)}</b><small>{e(small)}</small></span></p>{body}</div>')
    floats = ''.join(DA._float(f'dk-chip ai__chip{" ai__chip--b" if i else ""}', f'{icon(c)}{e(t)}', 120 - i * 30, i) for i, (c, t) in enumerate(chips))
    return DA._dk('ai', card, floats, sheets=2, label=label)


def _rows(rows):
    return '<ul class="tr__rows">' + ''.join(f'<li style="--i:{i}"><span>{icon(ic)}{e(k)}</span><b>{e(v)}</b></li>' for i, (ic, k, v) in enumerate(rows)) + '</ul>'


def clinic_card(p):
    body = (_rows([('user', 'Dr. Asha Rao', 'MBBS, MD · Reg. no. shown'), ('clock', 'Today', '10:30 · 11:00 · 5:30'), ('tag', 'Consultation', '₹600')])
            + f'<p class="tr__go">{icon("chat")}Book on WhatsApp</p>')
    return _card('clinic', 'Rao Family Clinic', 'Sample design · Pune', body, [('calendar', 'Booking in two taps'), ('pin', 'On Google Maps')],
                 'A sample clinic website: the doctor’s qualifications and registration, today’s slots, the fee and a WhatsApp booking button', 'heart')


def estate_card(p):
    body = (_rows([('home', '2 BHK · 712 sq ft carpet', '₹1.18 Cr onwards'), ('file', 'RERA registration', 'P5170000XXXXX'), ('globe', 'RERA website', 'maharera.maharashtra.gov.in')])
            + f'<p class="tr__go">{icon("calendar")}Book a site visit</p>')
    return _card('estate', 'Skyline Residency', 'Sample design · Thane West', body, [('check', 'RERA details on every page'), ('chat', 'Site visits on WhatsApp')],
                 'A sample real estate project page with the price, the RERA registration number and website, and a site visit button', 'home')


def export_card(p):
    body = (_rows([('box', 'Brass pipe fittings', 'HS 7412 · ISO 9001'), ('layers', 'Quantity', '5,000 pcs'), ('plane', 'Delivery', 'FOB Nhava Sheva → Hamburg')])
            + f'<p class="tr__go">{icon("file")}Send RFQ</p>')
    return _card('export', 'Request a quote', 'Sample design · Jamnagar', body, [('globe', 'Reads like a supplier abroad'), ('clock', 'Reply in the buyer’s morning')],
                 'A sample request-for-quote form for brass fittings, with HS code, certification, quantity and shipping terms', 'factory')


def coach_card(p):
    body = (_rows([('user', 'Tutors', 'Qualifications listed'), ('tag', 'Fees', '₹68,000 · refund policy linked'), ('users', 'Seats left', '12 of 40')])
            + f'<p class="tr__go">{icon("calendar")}Book a free demo class</p>')
    return _card('coach', 'JEE 2027 · Weekend batch', 'Sample design · Kota', body, [('check', 'Real results, with consent'), ('chat', 'Parents ask on WhatsApp')],
                 'A sample coaching batch page with tutor qualifications, fees with a refund policy, seats left and a demo class button', 'cap')


def ca_card(p):
    body = (_rows([('file', 'Services', 'GST · Income tax · Audit'), ('users', 'Partners', 'Names and membership numbers'), ('pin', 'Office', 'Andheri East, with map')])
            + f'<p class="tr__go">{icon("chat")}Ask a question</p>')
    return _card('ca', 'Mehta & Co.', 'Sample design · Chartered accountants', body, [('scale', 'Sticks to the facts'), ('shield', 'Client details kept private')],
                 'A sample chartered accountants’ website: services, partners with membership numbers, the office and a question button', 'scale')


def _trade(slug, crumb, h1, eyebrow, title, desc, lead, art, wa, does, rules, rules_h, prices, faq, answer, facts_extra, card, sources=(), extra=None, stats=None):
    blocks = [sec('does', 'What it does', does[0], '', features(does[1])),
              sec('trust', 'Why it’s safe', 'You’re protected at every step.', '', trust('INR', '.in', keys=('pay', 'own', 'fix', 'me')))]
    if rules:
        blocks.append(sec('rules', 'Your rules', rules_h, '', rules_html(rules), tone='band'))
    if extra:
        blocks.append(extra)
    blocks += [sec('prices', 'Prices', f'Website prices for {crumb.lower()}', 'Fixed in writing. The same in every city.',
                   price_cards('INR', '', '', cards=prices, note='No GST is charged on these prices right now. Domain and hosting are paid to your provider, in your name.')),
               work_sec(), process_sec()]
    return page_dict(
        slug=slug, path=f'services/website-design-india/{slug}', trail=TRAIL, crumb=crumb, lang='en-IN', h1=h1, eyebrow=eyebrow, title=title, desc=desc,
        lead=lead, art=art, wa=wa, blocks=blocks, faq=faq, answer=answer, card=card, sources=list(sources), related=RELATED, all_links=ALL_LINKS,
        stats=stats or [(price(LANDING), 'Websites from'), ('3–4 wk', 'Live in'), ('60%', 'Paid after launch')],
        service=f'Website design for {crumb.lower()} in India', service_type='Website design', countries=['India'],
        og_alt=f'{h1}, by U Scale: fixed prices from {price(LANDING)}', offers=[(n, 'INR') for _, n, *_ in prices],
        foot_card=('/pricing', 'Every price is published', 'See the full price list'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team')),
               ('Based in', 'Mumbai. Projects across India run over WhatsApp and video calls; in person in Mumbai, Thane and Navi Mumbai'),
               ('Prices', ' · '.join(f'{k} {price(n)}{" onwards" if o else ""}' for k, n, o, *_ in prices)),
               ('Payment', '20% to start, 20% on design sign-off, 60% on launch. No GST charged right now'),
               ('You own', 'Your domain, hosting, code and every login')] + list(facts_extra),
        cta_lead='Tell us about your practice or business. We reply within 24 hours, usually much faster on WhatsApp.')


def _p(k, name, onwards, d, t, ask):
    return (k, name, onwards, d, t, ask)


def pages():
    return [
     _trade('clinics', 'Clinics and doctors', 'Websites for clinics and doctors', 'For clinics and doctors',
        f'Clinic and Doctor Websites in India, from {price(LANDING)} | U Scale',
        f'Websites for clinics, dentists and doctors across India: timings, fees, your registration and booking on WhatsApp. From {price(LANDING)}, fixed in writing.',
        'Your timings, fees, qualifications and a booking button, on a site patients can use one-handed in a waiting room. It states facts, the way medical ethics rules expect.',
        clinic_card, "Hi Mehul, I run a clinic and I'd like a website. Can we talk?",
        ('What patients look for, before they call.', [
            ('clock', 'Timings and today’s slots', 'Which doctor is in, and when, without ringing to ask.'),
            ('tag', 'Fees up front', 'Consultation and common treatment fees, so nobody is surprised.'),
            ('user', 'Your qualifications', 'Degrees, registration number and experience, stated plainly.'),
            ('chat', 'Book on WhatsApp', 'A booking message that goes straight to your reception.'),
            ('pin', 'Found on Google Maps', 'Your Google listing set up to match the site, with directions.'),
            ('shield', 'Patient privacy', 'Forms that ask only what you need, and a privacy page that says so.')]),
        [('scale', 'Medical ethics', 'Doctors in India may not advertise like a shop. The site states facts: qualifications, registration, services, fees and timings.', ''),
         ('alert', 'No promised results', 'No “guaranteed cure”, no before-and-after claims, no paid-for testimonials.', ''),
         ('shield', 'Privacy', 'Enquiry forms collect the minimum, and patient details never go into analytics.', '')],
        'Within the medical rules.',
        [_p('Single page', LANDING, False, 'One doctor or a small clinic: timings, fees, location and a booking button.', 'Live in under 2 weeks', 'a one-page clinic website'),
         _p('Clinic site', BIZ, False, '5–10 pages: doctors, treatments with fees, timings, location and booking.', 'Live in 3–4 weeks', 'a clinic website'),
         _p('Multi-doctor site + blog', BLOG, False, '10–20 pages for several doctors or branches, and a blog that answers patients’ questions.', '', 'a larger clinic website')],
        [('How much does a website for a clinic cost?',
          f'With us, a one-page clinic website is {price(LANDING)}, a 5–10 page clinic site {price(BIZ)} and a 10–20 page site for several doctors or branches, '
          f'with a blog, {price(BLOG)}, fixed in writing. You pay 60% only when the site is live.'),
         ('Can patients book appointments online?',
          'Yes. The simplest way is a WhatsApp booking message that goes to your reception. If you use a practice system with online booking, we link it '
          'from every page instead.'),
         ('What can a doctor put on a website in India?',
          'You can state the facts: your name, qualifications, registration number, services, fees, timings and how to reach you. Medical ethics rules stop doctors '
          'advertising like a business, so we leave out promised results, before-and-after claims and testimonials that promise outcomes.'),
         ('Do you work with dental and physiotherapy clinics too?',
          'Yes. Dentists, physiotherapists, diagnostic labs and specialist clinics all need the same basics: clear services, fees, timings and booking.')],
        'U Scale designs and hand-codes websites for clinics and doctors across India, written within medical ethics rules. Patients see your timings, fees, '
        f'qualifications and registration, and book on WhatsApp. A one-page clinic site is {price(LANDING)} and a 5–10 page clinic site {price(BIZ)}, fixed in writing, '
        'with 60% paid at launch.',
        [('Covers', 'Clinics, doctors, dentists, physiotherapists and diagnostic labs')],
        'Timings, fees and booking on WhatsApp, within medical ethics rules.'),

     _trade('real-estate', 'Real estate', 'Real estate websites', 'For builders and brokers',
        f'Real Estate Website Design for Builders, from {price(LANDING)}',
        f'Real estate websites for builders and brokers: project pages with RERA details, floor plans, prices and site visits on WhatsApp. From {price(LANDING)}, fixed.',
        'Project pages with floor plans, prices and the RERA details the law asks for, and a site visit button that reaches your sales team on WhatsApp.',
        estate_card, "Hi Mehul, I'm a builder or broker and I'd like a real estate website. Can we talk?",
        ('What buyers check before they visit.', [
            ('home', 'Every project, its own page', 'Configurations, carpet areas, floor plans and photos of the actual site.'),
            ('file', 'RERA details', 'Registration number and the RERA website on every project page and ad.'),
            ('tag', 'Prices, honestly', '“Onwards” prices with what’s included, so the right buyers call.'),
            ('calendar', 'Site visits on WhatsApp', 'One tap to book a visit, straight to your sales team.'),
            ('pin', 'Location that sells', 'Distances to stations, schools and offices, on a real map.'),
            ('bolt', 'Fast with heavy photos', 'Images sized for phones, so the gallery loads on mobile data.')]),
        [('file', 'RERA, Section 11(2)', 'Every advertisement of a registered project must show its RERA registration number and the RERA website. Your site counts.', 'rera-11'),
         ('scale', 'Carpet area', 'Areas stated as carpet area, the way RERA defines it, so buyers compare like with like.', ''),
         ('alert', 'No guaranteed returns', 'Prices and possession dates as registered. No promises the project can’t back.', '')],
        'RERA details, done right.',
        [_p('Project microsite', LANDING, False, 'One project: configurations, plans, price, location and site visits.', 'Live in under 2 weeks', 'a project microsite'),
         _p('Builder or broker site', BIZ, False, '5–10 pages: your projects, about you, location guides and enquiries.', 'Live in 3–4 weeks', 'a real estate website'),
         _p('Many projects + blog', BLOG, False, '10–20 pages for several projects or areas, and a blog for buyers’ questions.', '', 'a larger real estate website')],
        [('How much does a real estate website cost?',
          f'A single-project microsite is {price(LANDING)}, a 5–10 page builder or broker website {price(BIZ)} and a 10–20 page site with several projects and a '
          f'blog {price(BLOG)}, fixed in writing. Property portals and listing feeds, if you want them, are quoted in the written plan.'),
         ('Do I need to show my RERA number on the website?',
          'Yes, for a registered project. Section 11(2) of RERA requires every advertisement or prospectus to show the project’s registration number and the '
          'RERA website address, and state authorities treat websites and social posts as advertisements. We put both on every project page.'),
         ('Can buyers book site visits online?',
          'Yes. A site visit button on every project opens WhatsApp with the project name filled in, so your sales team knows which project the buyer means.'),
         ('Can you add a WhatsApp chatbot for enquiries?',
          'Yes. We set up a simple WhatsApp flow that sends brochures, prices and visit slots. An AI assistant that answers buyers’ questions is built '
          'by our sister company, Apex36.')],
        'U Scale designs and hand-codes real estate websites for builders and brokers across India. Each project gets its own page with configurations, floor plans, '
        f'prices and the RERA registration number and website, and buyers book site visits on WhatsApp. A project microsite is {price(LANDING)} and a 5–10 page site '
        f'{price(BIZ)}, fixed in writing.',
        [('RERA', 'Registration number and RERA website on every project page (Section 11(2))')],
        'Project pages with RERA details, and site visits on WhatsApp.', sources=['rera-11']),

     _trade('exporters', 'Exporters and manufacturers', 'Websites for exporters and manufacturers', 'For exporters',
        f'Websites for Exporters and Manufacturers, from {price(LANDING)}',
        f'Websites for Indian exporters and manufacturers that buyers abroad trust: product specs, certifications, RFQ forms and fast replies. From {price(LANDING)}.',
        'A website that reads like a supplier buyers abroad already trust: specifications, certifications, a proper RFQ form, and replies in their morning.',
        export_card, "Hi Mehul, we're exporters and we'd like a website that brings enquiries from abroad.",
        ('What a buyer abroad checks first.', [
            ('box', 'Specs first', 'Materials, sizes, tolerances and PDFs a buyer can forward to their engineer.'),
            ('check', 'Certifications', 'ISO, CE or whatever your buyers ask for, with the certificates themselves.'),
            ('file', 'A proper RFQ form', 'Quantity, destination port, Incoterms and drawings, in one go.'),
            ('globe', 'English that reads naturally', 'Written from scratch for buyers in the US, Europe or the Gulf.'),
            ('factory', 'Your factory, shown', 'Real photos of machines, QC and packing. Buyers want to see the floor.'),
            ('search', 'Found by buyers', 'Pages for each product line, written for the words buyers abroad search.')]),
        [], '',
        [_p('Single page', LANDING, False, 'One product line: specs, certifications and an RFQ form.', 'Live in under 2 weeks', 'a one-page export website'),
         _p('Company site', BIZ, False, '5–10 pages: products, factory, certifications, about and RFQ.', 'Live in 3–4 weeks', 'an exporter website'),
         _p('Catalogue + blog', BLOG, False, '10–20 pages for a full product range, with a blog that answers buyers’ questions.', '', 'an export catalogue website')],
        [('How much does a website for an exporter cost?',
          f'A one-page product site is {price(LANDING)}, a 5–10 page company website {price(BIZ)} and a 10–20 page catalogue with a blog {price(BLOG)}, fixed in '
          'writing. Copywriting in English for buyers abroad is quoted per page in the written plan.'),
         ('Do you write the English for buyers abroad?',
          f'Yes, if you want. We write product and company pages in plain English that reads naturally to buyers in the US, Europe and the Gulf, at '
          f'{price("Website copy")}. We work from your specs and certificates, so the facts stay yours.'),
         ('Should I list on IndiaMART and Alibaba as well?',
          'Usually yes. Marketplaces bring enquiries; your own site is where a serious buyer checks you before placing an order. Use the same company name, '
          'address and certifications everywhere.'),
         ('Can buyers abroad pay through the website?',
          'For samples and small orders, yes, by card. Bulk orders usually go by bank transfer or letter of credit, so the site focuses on getting a good RFQ.')],
        'U Scale designs and hand-codes websites for Indian exporters and manufacturers. Each one has product specifications and PDFs, certifications, a request-for-quote '
        f'form that asks for quantity, destination port and Incoterms, and English written for buyers abroad. A 5–10 page company site is {price(BIZ)} and a 10–20 page '
        f'catalogue {price(BLOG)}, fixed in writing.',
        [('Copywriting', f'{price("Website copy")}, in English written for buyers abroad')],
        'Catalogues and RFQs that buyers abroad trust.',
        extra=sec('abroad', 'Selling abroad', 'We build for buyers abroad every day.', '', features([
            ('globe', 'Nine countries', 'We build sites for businesses in the UK, US, Australia and six more, so we know what buyers there expect.'),
            ('clock', 'Their time zone', 'RFQ alerts to your WhatsApp so you can reply in the buyer’s morning.'),
            ('tag', 'Their units and currency', 'Prices or MOQs in dollars or euros, sizes in their units where it helps.')]))),

     _trade('coaching-institutes', 'Coaching institutes', 'Coaching institute websites', 'For coaching institutes',
        f'Coaching Institute Websites, from {price(LANDING)} | U Scale',
        f'Websites for coaching institutes and schools: courses, batches, tutors, fees and refund policy, with demo-class booking. From {price(LANDING)}, fixed.',
        'Courses, batches, tutors, fees and your refund policy, laid out the way the 2024 guidelines ask, with a demo-class button parents can tap.',
        coach_card, "Hi Mehul, I run a coaching institute and I'd like a website. Can we talk?",
        ('What parents and students compare.', [
            ('book', 'Courses and batches', 'Every course, its duration, timings and seats, on one clear page.'),
            ('user', 'Your tutors', 'Names, qualifications and photos. Parents want to know who teaches.'),
            ('tag', 'Fees and refunds', 'Fees, instalments and the refund policy, stated before anyone asks.'),
            ('star', 'Results, honestly', 'Real results with the student’s consent, the course they took and the year.'),
            ('chat', 'Demo class on WhatsApp', 'One tap to book a free demo, straight to your front desk.'),
            ('pin', 'Each branch on Google', 'Every branch with its own listing, timings and directions.')]),
        [('book', 'Ministry of Education guidelines, 2024', 'Coaching centres should keep a website with tutors’ qualifications, courses, duration, fees, and exit and refund policies.', 'coach-moe'),
         ('alert', 'No false claims', 'The consumer authority’s 2024 rules target false claims about success rates and selections. No “100% selection”.', 'coach-ccpa'),
         ('users', 'Students’ consent', 'Toppers’ names and photos only with their consent, and with the course they actually took.', 'coach-ccpa')],
        'Within the 2024 rules.',
        [_p('Single page', LANDING, False, 'One course or a small centre: batches, fees, tutors and a demo-class button.', 'Live in under 2 weeks', 'a one-page coaching website'),
         _p('Institute site', BIZ, False, '5–10 pages: courses, tutors, fees and refunds, results and branches.', 'Live in 3–4 weeks', 'a coaching institute website'),
         _p('Many courses + blog', BLOG, False, '10–20 pages for many courses or branches, with a blog for exam questions.', '', 'a larger institute website')],
        [('How much does a website for a coaching institute cost?',
          f'A one-page site is {price(LANDING)}, a 5–10 page institute website {price(BIZ)} and a 10–20 page site with many courses or branches and a blog '
          f'{price(BLOG)}, fixed in writing.'),
         ('What do the 2024 coaching guidelines say about websites?',
          'The Ministry of Education’s 2024 guidelines say coaching centres should keep a website with up-to-date details of tutors’ qualifications, courses, '
          'duration, hostel facilities, fees, and the exit and refund policy. States bring them into force through their own rules, so check yours; we build '
          'every institute site with these sections anyway.'),
         ('Can we show our toppers and results?',
          'Yes, as long as they are real: each result with the student’s consent, the course they actually took and the year. The consumer authority’s 2024 rules target '
          'claims like “100% selection”, so we leave those out.'),
         ('Can parents pay fees online?',
          'Yes. We can add a payment link or a fee page with UPI and cards through your own payment account, with a receipt sent automatically.')],
        'U Scale designs and hand-codes websites for coaching institutes and schools across India, following the 2024 coaching guidelines. Each site shows courses '
        f'and batches, tutors and qualifications, fees and the refund policy, and honest results, with demo-class booking on WhatsApp. A 5–10 page institute site is {price(BIZ)}, '
        'fixed in writing.',
        [('Follows', 'The Ministry of Education’s 2024 coaching guidelines and the 2024 rules on misleading coaching ads')],
        'Courses, fees and honest results, within the 2024 rules.', sources=['coach-moe', 'coach-ccpa']),

     _trade('ca-and-law-firms', 'CA and law firms', 'Websites for CA firms and law firms', 'For CAs and advocates',
        f'Websites for CA Firms and Law Firms, from {price(LANDING)} | U Scale',
        f'Websites for chartered accountants and law firms that stay within professional rules: services, partners, office and a contact form. From {price(LANDING)}.',
        'A calm, factual website that clients and referrers can check: your services, partners and office, within the rules your profession sets on advertising.',
        ca_card, "Hi Mehul, I'd like a website for our CA or law firm. Can we talk?",
        ('What a careful client checks.', [
            ('file', 'Services, plainly', 'GST, tax, audit, company law or practice areas, each explained in a line.'),
            ('users', 'The people', 'Partners and associates with qualifications and membership or enrolment numbers.'),
            ('pin', 'Where you are', 'Office address, map and hours, the same as your Google listing.'),
            ('mail', 'A careful contact form', 'Asks only what you need, sent privately to you.'),
            ('book', 'Updates and articles', 'GST and tax updates that show what you know, without selling.'),
            ('shield', 'Confidential by design', 'No chat widgets recording client details, no tracking on sensitive pages.')]),
        [('scale', 'Advertising rules', 'CAs and advocates may not advertise or solicit work like a business. The site states facts and stays quiet about the rest.', ''),
         ('alert', 'No claims, no testimonials', 'No “best CA in town”, no client reviews, no promised outcomes.', ''),
         ('shield', 'Client confidentiality', 'Nothing about a client or a case on the site, ever, without written permission.', '')],
        'Within your profession’s rules.',
        [_p('Single page', LANDING, False, 'A one-page profile: services, partners, office and contact.', 'Live in under 2 weeks', 'a one-page firm website'),
         _p('Firm website', BIZ, False, '5–10 pages: services, people, office, updates and contact.', 'Live in 3–4 weeks', 'a firm website'),
         _p('Firm site + articles', BLOG, False, '10–20 pages with a section for tax and law updates.', '', 'a larger firm website')],
        [('How much does a website for a CA firm or law firm cost?',
          f'A one-page profile is {price(LANDING)}, a 5–10 page firm website {price(BIZ)} and a 10–20 page site with an updates section {price(BLOG)}, fixed in writing.'),
         ('Are CA and law firms allowed to have websites?',
          'Yes, within limits. Both professions restrict advertising and soliciting work, so a firm website should state facts: who you are, qualifications, '
          'membership or enrolment numbers, practice areas and contact details. We leave out claims, rankings and testimonials. Check your institute’s or '
          'bar council’s current rules; we follow whatever they say.'),
         ('Can we publish articles on tax and law changes?',
          'Yes. Updates on GST, income tax or new judgments are a good way to show what you know without advertising. We set up a simple section you can add to yourself.'),
         ('How do you handle client confidentiality?',
          'The contact form sends messages privately to you, there is no chat widget storing client conversations, and analytics stays off the contact page. '
          'Nothing about a client appears on the site.')],
        'U Scale designs and hand-codes websites for chartered accountants and law firms across India, kept within professional advertising rules. '
        f'Each site shows your services, partners with membership or enrolment numbers, the office and a private contact form. A 5–10 page firm website is {price(BIZ)}, fixed in writing.',
        [('Covers', 'Chartered accountants, company secretaries, advocates and law firms')],
        'Services, partners and office, within your profession’s rules.'),
    ]
