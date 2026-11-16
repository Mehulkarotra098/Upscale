"""Where each of Mehul's ChatGPT images goes on the pages abroad, written by hand after checking every image by eye
(16 Nov 2026; six were corrected first, see fix_images.py in D:\\U-Scale-SEO-Program\\image-pack-abroad).

Per page:
  sample   the website mockup: its own section, placed before the section id `before`, with three numbered pins.
           Pin positions are in the 768 x 512 frame of the image (half of 1536 x 1024).
  timeline the photo that replaces the shared picture beside the "How it works" timeline.
  moment   a second photo with its own line, placed after (or before) a section, with a small chip on the photo.
Alt text describes what the image shows; captions say the businesses and people are fictional, as on the city pages."""

FICT = 'The people are fictional.'

PAGES = {
    'outsource-web-design-india': dict(
        sample=dict(n=1, before='countries', h='Three countries. Three currencies.',
                    alt='Sample page shown on a laptop and a phone, “Web design for local businesses”, with three sample client sites: Crumb & Co., a Leeds bakery '
                        '(£4.50, Order for collection); Lone Oak Landscaping in Austin (from $350, Get a free quote); and Bondi Sparks, an electrician in Sydney (A$120 callout, Book a sparky)',
                    caption='Three sample designs. Crumb & Co., Lone Oak Landscaping and Bondi Sparks are fictional.',
                    pins=[(108, 357, 'Pounds for a Leeds bakery'), (313, 357, 'Dollars for an Austin landscaper'), (498, 357, 'A$ for a Sydney electrician')]),
        timeline=dict(n=2, alt='A café owner at a window table in rainy London points a pen at his laptop during a video call, with a website draft open beside the call',
                      caption='Reviewing a design on a video call from London. ' + FICT)),

    'website-design-uk': dict(
        sample=dict(n=1, before='hours', h='A Leeds bakery, ready for the morning rush.',
                    alt='Sample website for Crumb & Co., a bakery in Leeds, on a laptop and a phone: the heading “Baked in Leeds since 6am”, a baker loading sourdough into an oven, '
                        'an Order for collection button and prices for a sourdough loaf (£4.50), a cinnamon bun (£3.20) and a flat white (£3.40)',
                    caption='A sample design for a Leeds bakery. Crumb & Co. is fictional.',
                    pins=[(200, 308, 'Order for collection, up top'), (225, 377, 'Prices in pounds'), (604, 327, 'The same menu on a phone')]),
        timeline=dict(n=2, alt='A smiling baker in an apron leans on her counter during a video call on a laptop, with customers queueing behind her',
                      caption='Checking a design between customers. ' + FICT),
        moment=dict(n=3, after='cookies', side='r', h='One tap to say no.',
                    p='On a phone, on the bus, the banner is still clear, and “No thanks” is as easy as “Yes”.', chip=('shield', 'Analytics off until yes'),
                    alt='A hand holds a phone on a London bus; the café site on screen shows a cookie banner with two equal buttons, No thanks and Yes, that’s fine',
                    caption='The café is fictional.')),

    'website-design-usa': dict(
        sample=dict(n=1, before='trust', h='Built to win the quote.',
                    alt='Sample website for Lone Oak Landscaping in Austin on a laptop and a phone: “Yards that work as hard as you”, a crew laying turf, a Get a free quote button, '
                        'lawn care from $45 and a short quote form on the phone',
                    caption='A sample design for an Austin landscaper. Lone Oak Landscaping is fictional.',
                    pins=[(185, 303, 'Free quote, front and centre'), (225, 377, 'Prices in dollars'), (604, 322, 'A two-field quote form')]),
        timeline=dict(n=3, alt='A dentist in scrubs at her desk in the evening looks at her clinic’s website draft; a sticky note on the screen says send feedback tonight',
                      caption='Feedback sent at the end of her day. ' + FICT),
        moment=dict(n=2, after='hours', side='l', h='Changes in before your first coffee.',
                    p='You send notes in your evening. We make them in our day, and the preview is updated by your morning.', chip=('clock', '7:05 am CT · preview updated'),
                    alt='A man in a work shirt holds a coffee mug in his kitchen in the morning and reads a landscaping website and a chat message on his phone',
                    caption='The people and the business are fictional.')),

    'website-design-australia': dict(
        sample=dict(n=1, before='trust', h='A sparky’s site that books the job.',
                    alt='Sample website for Bondi Sparks Electrical on a laptop and a phone: “Sparkies on call in Bondi” with the licence number under it, an electrician at a switchboard, '
                        'a callout price of A$120 and a Book a sparky form asking for a name and postcode',
                    caption='A sample design for a Bondi electrician. Bondi Sparks Electrical is fictional.',
                    pins=[(154, 260, 'Licence number under the heading'), (225, 377, 'Callout price in A$'), (604, 332, 'Book with a name and postcode')]),
        timeline=dict(n=2, alt='An electrician in a hi-vis shirt eats a sandwich in his ute and checks his phone on a lunch break',
                      caption='Checking the preview on a lunch break. ' + FICT)),

    'website-design-canada': dict(
        sample=dict(n=1, before='trust', h='The same bakery, in both languages.',
                    alt='Sample bilingual website for Boulangerie Maple, a Montréal bakery: the laptop shows the French page “Du pain frais chaque matin” and the phone the English page '
                        '“Fresh bread every morning”, each with an EN | FR switch',
                    caption='A sample design for a Montréal bakery. Boulangerie Maple is fictional.',
                    pins=[(283, 190, 'French on the laptop'), (604, 316, 'English on the phone'), (568, 118, 'One switch between them')]),
        timeline=dict(n=2, alt='A physiotherapist in a fleece checks a tablet at her clinic’s front desk on a snowy day',
                      caption='Checking the new site on a tablet in winter. ' + FICT)),

    'website-design-singapore': dict(
        sample=dict(n=1, before='year', h='A tuition centre parents can check in a minute.',
                    alt='Sample website for Bright Path Tuition in Singapore on a laptop and a phone: “Small classes. Steady grades.”, a tutor helping two students, '
                        'Sec 3 Maths at S$320 a month and trial lesson times on the phone',
                    caption='A sample design for a Singapore tuition centre. Bright Path Tuition is fictional.',
                    pins=[(168, 282, 'Free trial, one tap'), (225, 377, 'Fees in S$, per month'), (604, 325, 'Trial times on the phone')]),
        timeline=dict(n=2, alt='A man in glasses on a laptop video call at a desk by the open shutters of a Singapore shophouse office',
                      caption='A video call from a shophouse office. ' + FICT)),

    'website-design-uae': dict(
        sample=dict(n=1, before='prices', h='This is what custom looks like.',
                    alt='Sample website for Dune Realty in Dubai Marina on a laptop and a phone: “Homes in Dubai Marina”, a living room with marina towers in the window, '
                        'a Book a viewing button and yearly rents from AED 62,000 to AED 140,000',
                    caption='A sample design for a Dubai property agency. Dune Realty is fictional.',
                    pins=[(182, 271, 'Book a viewing, first screen'), (225, 377, 'Yearly rents in AED'), (604, 313, 'Listings first on the phone')]),
        timeline=dict(n=2, alt='A boutique owner in an abaya checks her phone beside a laptop in her Dubai shop, with the Burj Al Arab outside the window',
                      caption='Checking the site between customers. ' + FICT)),

    'website-design-ireland': dict(
        sample=dict(n=1, before='prices', h='Accessible from the first screen.',
                    alt='Sample website for The Harbour Room, a guesthouse in Galway, on a laptop and a phone: “Wake up on the harbour”, a bedroom window over coloured harbour houses, '
                        'a Check availability button, a double room from €135 and labelled date choices on the phone',
                    caption='A sample design for a Galway guesthouse. The Harbour Room is fictional.',
                    pins=[(190, 271, 'A big, clear button'), (225, 377, 'Rates in euro'), (604, 316, 'Labelled date choices')]),
        timeline=dict(n=2, alt='A guesthouse owner talks on a laptop video call at her kitchen table, with a teapot and a guestbook beside her',
                      caption='A video call from a Galway guesthouse. ' + FICT)),

    'website-design-new-zealand': dict(
        sample=dict(n=1, before='trust', h='Tours booked while you’re out on the water.',
                    alt='Sample website for Remarkables Kayak in Queenstown on a laptop and a phone: “Paddle the lake at sunrise”, kayaks on Lake Wakatipu, '
                        'a sunrise tour at NZ$129 and tour times to tap on the phone',
                    caption='A sample design for a Queenstown kayak tour company. Remarkables Kayak is fictional.',
                    pins=[(167, 275, 'Book without a phone call'), (225, 377, 'Prices in NZ$'), (604, 324, 'Tour times to tap')]),
        timeline=dict(n=2, alt='A kayak guide in a wetsuit reads his phone on a jetty at dawn, with yellow kayaks and snowy mountains behind him',
                      caption='Checking the preview before the first tour. ' + FICT)),

    'website-design-netherlands': dict(
        sample=dict(n=1, before='rules', h='Dutch first. English one tap away.',
                    alt='Sample website for Fietsfabriek, a bike workshop in Amsterdam, on a laptop and a phone: “Your bike fixed today”, a mechanic at work by a canal, '
                        'an NL | EN switch, a puncture repair for €18 and a Book a repair button',
                    caption='A sample design for an Amsterdam bike workshop. Fietsfabriek is fictional.',
                    pins=[(568, 118, 'Dutch and English'), (225, 377, 'Prices in euro'), (175, 282, 'Book a repair online')]),
        timeline=dict(n=2, alt='A bike mechanic in overalls talks on a laptop video call in her workshop, with bikes on the wall and a canal outside',
                      caption='A video call from an Amsterdam workshop. ' + FICT)),

    'white-label-web-design': dict(
        sample=dict(n=1, before='prices', h='Your name in the footer. Ours nowhere.',
                    alt='Sample white-label website for Smile Studio, a dental practice in Brooklyn, on a laptop and a phone: “Gentle dentistry in Brooklyn”, a dentist talking with a patient, '
                        'and a footer credit that reads Website by Northline Digital',
                    caption='A sample white-label design. Smile Studio and Northline Digital are fictional.',
                    pins=[(162, 409, 'Your agency’s credit in the footer'), (188, 107, 'On your client’s domain'), (604, 300, 'Phone layout included')]),
        moment=dict(n=2, before='process', side='l', h='Your team reviews. Your client sees your name.',
                    p='We work under NDA and stay out of sight. You present the site as your own work.', chip=('check', 'Client website · 2 of 5 done'),
                    alt='Two agency staff holding coffee review a client website on a wall screen, beside a checklist of design, content, SEO, accessibility and launch',
                    caption=FICT)),

    'figma-to-code': dict(
        sample=dict(n=1, before='get', h='The build, on laptop and phone.',
                    alt='Sample website for Ridgeline Roasters on a laptop and a phone: “Small-batch coffee, roasted Mondays”, a coffee bag beside a roasting drum, '
                        'a Shop beans button and links to the roasts and a brewing guide',
                    caption='A sample build from a Figma file. Ridgeline Roasters is fictional.',
                    pins=[(250, 190, 'Type set as in the file'), (575, 180, 'Photo cropped as designed'), (604, 300, 'Your mobile frames, built')]),
        moment=dict(n=2, before='process', side='r', h='Your file on one screen. The build on the other.',
                    p='We check every frame against the built page before you see it: spacing, type and crops.', chip=('layers', 'Spacing 64 / 48 / 24 px'),
                    alt='A designer compares a design file on one monitor with the built page on the other, with spacing notes in an open notebook',
                    caption='The people and Oak & Ash are fictional.')),

    'website-design-for-indian-restaurants': dict(
        sample=dict(n=1, before='keep', h='Your menu. Your orders. No app in the middle.',
                    alt='Sample website for Saffron Lane, a Hyderabadi restaurant in Leicester, on a laptop and a phone: “Home-style Hyderabadi, in Leicester”, biryani and naan on a table, '
                        'chicken biryani £13.50, masala dosa £9.95, paneer tikka £8.50, an order total of £31.95 and an Order for collection button',
                    caption='A sample design for an Indian restaurant in Leicester. Saffron Lane is fictional.',
                    pins=[(198, 285, 'Orders come straight to you'), (225, 377, 'Menu prices in pounds'), (668, 371, 'A running total before checkout')]),
        timeline=dict(n=2, alt='A restaurant owner in an apron checks orders on a tablet in his kitchen while a chef cooks behind him',
                      caption='Checking orders in the kitchen. ' + FICT),
        moment=dict(n=3, after='keep', side='r', h='The order comes to you.',
                    p='Customers order on your own site, so the order and the customer’s details come straight to you.', chip=('cart', 'New order · collect 8:15 pm'),
                    alt='A hand taps Add on a curry on a phone, outside a lit restaurant at night',
                    caption='The restaurant is fictional.')),

    'website-design-for-indian-fashion-brands': dict(
        sample=dict(n=1, before='checkout', h='A label that sells in three currencies.',
                    alt='Sample online store for Noor & Thread on a laptop and a phone: a Chanderi kurta set at £79 with a matching dupatta, a ₹ / £ / $ currency switch, '
                        'sizes XS to L and Ships worldwide',
                    caption='A sample store for an Indian label. Noor & Thread is fictional.',
                    pins=[(568, 118, 'Shoppers pick ₹, £ or $'), (604, 363, 'Sizes on the product page'), (664, 400, 'Ships worldwide, said up front')]),
        timeline=dict(n=2, alt='A designer in a block-printed kurta packs an embroidered outfit into a box in her studio, with fabric swatches and a laptop showing her store',
                      caption='Packing an order in the studio. ' + FICT),
        moment=dict(n=3, after='checkout', side='l', h='No surprise at the door.',
                    p='Shipping and duties show before your customer pays, so the parcel isn’t refused when it reaches London.', chip=('truck', 'Duties shown at checkout'),
                    alt='A woman in an embroidered kurta smiles at a lehenga on her phone, on a sofa in a London terraced house in the evening',
                    caption=FICT)),

    'website-design-for-independent-hotels': dict(
        sample=dict(n=1, before='ada', h='Direct bookings, with no booking-site fee.',
                    alt='Sample website for The Pines Inn, an independent inn in North Carolina, on a laptop and a phone: “Stay among the pines”, the inn at dusk, '
                        'a Book direct button, rooms from $129 and dates to tap on the phone',
                    caption='A sample design for an independent inn. The Pines Inn is fictional.',
                    pins=[(167, 281, 'Book direct, first screen'), (225, 377, 'Room rates in dollars'), (604, 324, 'Dates to tap on the phone')]),
        timeline=dict(n=2, alt='An innkeeper smiles at a laptop at her front desk, with room keys on hooks behind her',
                      caption='Checking direct bookings at the front desk. ' + FICT)),

    'whatsapp-chatbot': dict(
        sample=dict(n=1, before='start', h='A salon that books itself.',
                    alt='Sample WhatsApp booking view for Glow Salon on a laptop and a phone: a customer asks “Are you open on Sunday?”, the reply offers Book a slot, Price list and '
                        'Talk to a person, confirms Tuesday 11:30, and a card counts 12 bookings today',
                    caption='A sample design. Glow Salon is fictional.',
                    pins=[(252, 205, 'A customer asks on WhatsApp'), (300, 252, 'Tap a reply, no typing'), (585, 180, 'Bookings counted for you')]),
        timeline=dict(n=2, alt='A stylist blow-dries a client’s hair in a Mumbai salon while a phone on the counter shows Booking confirmed',
                      caption='A booking confirms while she works. ' + FICT)),

    'ai-chatbot-for-website': dict(
        sample=dict(n=1, before='start', h='Answers from your own pages.',
                    alt='Sample website for Green Basket, a grocery delivery shop, on a laptop and a phone: a chat answers “Do you deliver to Thane?” with “Yes, Monday to Saturday. '
                        'Delivery is ₹60 on orders under ₹500” and shows the answer came from the delivery page',
                    caption='A sample design. Green Basket is fictional.',
                    pins=[(462, 285, 'A real customer question'), (462, 335, 'Shows the page it answered from'), (604, 380, 'The same chat on a phone')]),
        timeline=dict(n=2, alt='A woman at a laptop late at night in a high-rise flat uses a chat window on a business website',
                      caption='Asking a question late at night. ' + FICT)),

    'ai-receptionist': dict(
        sample=dict(n=1, before='missed', h='Every call, summed up.',
                    alt='Sample call log headed Today’s calls on a laptop and a phone: a cleaning booked for Saturday 10:30, a question about insurance, a check-up booked for Monday 5:00 '
                        'and an urgent toothache call passed to Dr. Mehta, with a Call back button',
                    caption='A sample design. The clinic and the calls are fictional.',
                    pins=[(560, 193, 'Each call, with its time'), (560, 354, 'Urgent calls go to a person'), (505, 141, 'Call back from the list')]),
        timeline=dict(n=2, alt='A busy dental clinic reception: the receptionist talks to a patient at the counter while the desk phone waits and other patients sit behind',
                      caption='A busy front desk. ' + FICT)),

    'n8n-automation': dict(
        sample=dict(n=1, before='jobs', h='One form. Four jobs done.',
                    alt='Sample automation on a laptop and a phone: a website form goes to a Google Sheet, then a WhatsApp alert, then a reply email, with a new enquiry from Priya '
                        'for 3 BHK interiors',
                    caption='A sample automation. The business and the enquiry are fictional.',
                    pins=[(220, 255, 'Starts when a form is sent'), (458, 255, 'An alert on your WhatsApp'), (570, 330, 'Every enquiry, logged')]),
        timeline=dict(n=2, alt='An interior designer with a tape measure reads her phone on a building site under renovation',
                      caption='A new enquiry reaches her on site. ' + FICT)),

    'ai-marketing': dict(
        sample=dict(n=1, before='prices', h='A week of posts, planned.',
                    alt='Sample content plan for Glow Café on a laptop and a phone: a week from Monday to Saturday with reels, posts, a carousel and a story, each marked approved, '
                        'editing or draft, and an Approve week button',
                    caption='A sample design. Glow Café is fictional.',
                    pins=[(174, 200, 'A week planned, post by post'), (165, 299, 'Each post shows its status'), (500, 141, 'Approve the week in one tap')]),
        timeline=dict(n=2, alt='A barista pours latte art while a woman films it on a phone on a tripod, in a café across from old Mumbai buildings',
                      caption='Filming a reel in a café. ' + FICT)),

    'clinics': dict(
        sample=dict(n=1, before='prices', h='The facts patients look for.',
                    alt='Sample website for Rao Family Clinic in Kothrud on a laptop and a phone: “Family doctors in Kothrud”, Dr. Asha Rao, MBBS, MD, a ₹600 consultation fee, '
                        'today’s times of 10:30, 11:00 and 5:30 and a Book on WhatsApp button',
                    caption='A sample design for a family clinic. Rao Family Clinic is fictional.',
                    pins=[(225, 377, 'Doctor’s name and degrees'), (403, 377, 'The fee, shown up front'), (604, 325, 'Today’s times on the phone')]),
        timeline=dict(n=2, alt='A mother holding her young son books a visit on her phone in a clinic waiting room',
                      caption='Booking from the waiting room. ' + FICT)),

    'real-estate': dict(
        sample=dict(n=1, before='prices', h='A project page with its RERA number on it.',
                    alt='Sample website for Skyline Residency in Thane West on a laptop and a phone: “2 and 3 BHK homes in Thane West”, the building at dusk, carpet areas of 712 and '
                        '980 sq ft from ₹1.18 Cr, a Book a site visit button and the MahaRERA number with the MahaRERA website',
                    caption='A sample design for a housing project. Skyline Residency and its RERA number are fictional.',
                    pins=[(268, 409, 'RERA number and website'), (205, 371, 'Carpet area and starting price'), (194, 287, 'Book a site visit')]),
        timeline=dict(n=2, alt='A sales manager shows a young couple a floor plan on a tablet in a bright, empty flat with city views',
                      caption='Walking through a floor plan. ' + FICT)),

    'exporters': dict(
        sample=dict(n=1, before='trust', h='A catalogue buyers can quote from.',
                    alt='Sample website for Jamnagar Brass Works on a laptop and a phone: “Precision brass fittings since 1998”, brass fittings on a workbench, compression fittings, '
                        'hose barbs, ISO 9001 certified, and a quote form asking for the product, quantity and destination port',
                    caption='A sample design for a brass exporter. Jamnagar Brass Works is fictional.',
                    pins=[(268, 188, 'What you make, in one line'), (580, 377, 'Certification on the first screen'), (604, 338, 'Quote form asks for the port')]),
        timeline=dict(n=2, alt='A worker in safety glasses checks a brass fitting with callipers in a factory, beside a tablet showing the product catalogue',
                      caption='Checking fittings against the catalogue. ' + FICT),
        moment=dict(n=3, after='abroad', side='r', h='They check you before they write.',
                    p='Buyers look at your site before the first email. It should answer what they would ask: what you make, your certificates and how to get a quote.',
                    chip=('file', 'RFQ · 5,000 pcs · Rotterdam'),
                    alt='A buyer at his office desk abroad studies an Indian brass fittings manufacturer’s website on a large monitor',
                    caption='The people and the business are fictional.')),

    'coaching-institutes': dict(
        sample=dict(n=1, before='prices', h='Fees, seats and tutors, said plainly.',
                    alt='Sample website for Praxis Academy on a laptop and a phone: “JEE 2027 weekend batch”, a teacher at a whiteboard, tutors who are IIT and NIT graduates, '
                        'fees of ₹68,000 a year with a refund policy, 12 of 40 seats left and a Book a free demo class button',
                    caption='A sample design for a coaching institute. Praxis Academy is fictional.',
                    pins=[(228, 368, 'Who teaches, said plainly'), (405, 368, 'Fees and refund policy'), (582, 368, 'Seats left, kept current')]),
        timeline=dict(n=2, alt='A father and his teenage son look at batch details on a phone at the dining table in the evening',
                      caption='Checking the batch together. ' + FICT)),

    'ca-and-law-firms': dict(
        sample=dict(n=1, before='prices', h='A firm site that sticks to the facts.',
                    alt='Sample website for Mehta & Co., chartered accountants in Andheri East, on a laptop and a phone: an office photo, GST returns, income tax and audit, '
                        'the partners’ names and membership numbers and an Ask a question button',
                    caption='A sample design for a CA firm. Mehta & Co. is fictional.',
                    pins=[(185, 368, 'Services, as plain facts'), (585, 368, 'Partners and membership numbers'), (180, 285, 'A plain Ask a question button')]),
        timeline=dict(n=2, alt='A chartered accountant goes through a GST form with a client across her desk, with old Mumbai buildings outside the window',
                      caption='A client meeting about GST. ' + FICT)),
}
