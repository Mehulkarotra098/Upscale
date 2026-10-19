/* Free Google Business Profile checker (/tools/google-business-profile-checker). Costs nothing to run, needs no API key.
   - Shows the business's live Google listing and the nearby competition (Google's free Maps embed), so owners answer
     16 questions while looking at the real thing, then get a score out of 100, ranked fixes and a review goal.
   - Real website check: /api/blog?view=site reads the home page once (call/WhatsApp buttons, map, schema…), and the
     visitor's browser runs Google PageSpeed Insights directly (free, keyless) for real mobile speed and SEO scores.
   - Short Maps links are expanded by /api/blog?view=maplink. Answers stay in localStorage on this device only. */
(function () {
  'use strict';
  var root = document.querySelector('[data-gp]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var KEY = 'us-gbpcheck-v1';
  var WA = '917977360142';

  /* ---------- copy: en = English, hi = Hinglish ---------- */
  var UI = {
    en: {
      progress: '{n} of {t} answered', soFar: 'Score so far', yours: 'Your score', see: 'See my results', more: 'Answer {n} more for your full result',
      grades: ['Strong profile', 'Good, with a few gaps', 'Needs work', 'Losing customers to competitors'],
      top: 'Your top fixes', gain: '+{p} points', all: 'Nothing big left to fix. Keep adding photos, posting and asking every customer for a review.',
      where: 'Where to edit:', steps: 'How to fix it', open: 'Open my listing', none: 'Pick an answer',
      calcT: 'Review goal calculator', calcL: 'How many new 5-star reviews do you need, and how long will it take?',
      rating: 'Your rating', count: 'Your reviews', target: 'Target rating', comp: 'Top competitor’s reviews', pace: 'New reviews per week',
      need: 'You need about <b>{x} more 5-star reviews</b> to show <b>{t}★</b>.', have: 'You’re already at or above <b>{t}★</b>. Keep it there with steady new reviews.',
      first: 'Start with your first 10 reviews: ask your regular customers this week.', gap: 'To match your competitor’s <b>{c}</b> reviews you need <b>{g} more</b>.',
      weeks: 'At {w} a week that takes about <b>{k}</b>.', faster: 'Ask every customer and get {w} a week, and it’s about <b>{k}</b>.', ahead: 'You already have more reviews than your competitor. Nice.', noPace: 'Set how many reviews you get each week to see how long it takes.',
      wk: ['week', 'weeks'], mo: ['month', 'months'], yr: ['year', 'years'],
      sum: { strong: 'Strongest: {a}.', weak: 'Biggest gap: {b}.' },
      pdf: 'Save report as PDF', send: 'Send my report to U Scale', copy: 'Copy report', copied: 'Copied', reset: 'Start again', resetQ: 'Clear all answers and start again?',
      waIntro: 'Hi Mehul, I checked my Google Business Profile on uscale.in.', waBiz: 'Business', waScore: 'Score', waFix: 'Top fixes', waAsk: 'Can you help me fix these?',
      found: '✓ Found: {n}', finding: 'Finding your business…', badLink: 'Paste the link from Google Maps (Share → Copy link).', yourBiz: 'Your business',
      cta: 'Want these fixed for you?', ctaL: 'I fix Google profiles for Mumbai businesses: categories, photos, posts, review system and website. Send me your report and I’ll reply with a plan.',
      keep: 'Keep going: {n} to go', cheer: '🎉 {s} done! {n} to go.', cheerAll: '🎉 All done! Here’s your report.', next: 'Next: {s}', secLeft: '{n} of {t} answered', secDone: 'Done · tap to change', tabMe: 'Your listing', tabNear: 'Who’s near you',
      needName: 'Type your business name and area, or paste your Google Maps link.', live: 'Your live Google listing', liveNote: 'Live from Google Maps. Keep it open while you answer the questions below.',
      openMaps: 'Open in Google Maps', compT: 'Who shows up near you', compNote: 'This is what a customer sees when they search “{t}” near you. Are you in the first few?', compOpen: 'Open this search in Google Maps', compNeed: 'Add what customers search for (like “saree shop”) to see your competition.',
      siteT: 'Check your website (free, real data)', siteL: 'We open your home page like a customer on a phone, and run Google’s own PageSpeed test on it.', siteIn: 'Your website', siteBtn: 'Check my website', siteNo: 'No website? Choose “No website” below.',
      siteBusy: ['Opening your website…', 'Checking call, WhatsApp and map buttons…', 'Running Google’s PageSpeed test on a phone (this takes 20–40 seconds)…', 'Measuring how fast the main content loads…'],
      siteErr: 'We couldn’t open that website. Check the address and try again.', psiErr: 'Google’s speed test didn’t finish this time. Try again in a minute.', psiT: 'Google PageSpeed (mobile)', fromSite: 'From your website check', fromGoogle: 'Real data',
      webRep: 'Your website report', webOk: 'Looks good', webFix: 'Needs fixing', lcp: 'Main content loads in', speed: 'Mobile speed', seo: 'SEO', a11y: 'Accessibility', bp: 'Best practices', slowNote: 'Google suggests under 2.5 s.',
    },
    hi: {
      progress: '{t} mein se {n} sawaal ho gaye', soFar: 'Abhi tak ka score', yours: 'Aapka score', see: 'Mera result dikhao', more: 'Poora result dekhne ke liye {n} aur sawaal',
      grades: ['Shandaar profile', 'Achha hai, thodi kami hai', 'Kaafi kaam baaki hai', 'Customers competitors ke paas ja rahe hain'],
      top: 'Sabse zaroori fixes', gain: '+{p} points', all: 'Koi bada kaam baaki nahi. Photos daalte rahiye, post karte rahiye aur har customer se review maangiye.',
      where: 'Edit kahan karein:', steps: 'Kaise theek karein', open: 'Meri listing kholo', none: 'Ek jawab chuniye',
      calcT: 'Review goal calculator', calcL: 'Kitne naye 5-star reviews chahiye, aur kitna time lagega?',
      rating: 'Aapki rating', count: 'Aapke reviews', target: 'Target rating', comp: 'Top competitor ke reviews', pace: 'Har hafte naye reviews',
      need: '<b>{t}★</b> dikhane ke liye lagbhag <b>{x} aur 5-star reviews</b> chahiye.', have: 'Aap pehle se <b>{t}★</b> ya usse upar hain. Naye reviews aate rahenge toh rating bani rahegi.',
      first: 'Pehle 10 reviews se shuru kijiye: is hafte apne regular customers se maangiye.', gap: 'Competitor ke <b>{c}</b> reviews tak pahunchne ke liye <b>{g} aur</b> chahiye.',
      weeks: 'Hafte mein {w} reviews ki speed se lagbhag <b>{k}</b> lagenge.', faster: 'Har customer se maangiye aur hafte mein {w} laaiye, toh lagbhag <b>{k}</b>.', ahead: 'Aapke reviews competitor se zyada hain. Badhiya!', noPace: 'Har hafte kitne reviews aate hain, woh daaliye, phir time dikhega.',
      wk: ['hafta', 'hafte'], mo: ['mahina', 'mahine'], yr: ['saal', 'saal'],
      sum: { strong: 'Sabse achha: {a}.', weak: 'Sabse badi kami: {b}.' },
      pdf: 'Report PDF mein save karo', send: 'Report U Scale ko bhejo', copy: 'Report copy karo', copied: 'Copy ho gaya', reset: 'Phir se shuru karo', resetQ: 'Saare jawab hata kar phir se shuru karein?',
      waIntro: 'Hi Mehul, maine uscale.in par apna Google Business Profile check kiya.', waBiz: 'Business', waScore: 'Score', waFix: 'Zaroori fixes', waAsk: 'Kya aap yeh theek karne mein madad karenge?',
      found: '✓ Mil gaya: {n}', finding: 'Aapka business dhoondh rahe hain…', badLink: 'Google Maps se link copy karke daaliye (Share → Copy link).', yourBiz: 'Aapka business',
      cta: 'Yeh sab hum theek kar dein?', ctaL: 'Main Mumbai ke businesses ke Google profile theek karta hoon: category, photos, posts, review system aur website. Apni report bhejiye, main plan ke saath reply karunga.',
      keep: 'Chaliye, {n} aur baaki', cheer: '🎉 {s} ho gaya! {n} aur baaki.', cheerAll: '🎉 Sab ho gaya! Yeh rahi aapki report.', next: 'Aage: {s}', secLeft: '{t} mein se {n} ho gaye', secDone: 'Ho gaya · badalne ke liye tap karein', tabMe: 'Aapki listing', tabNear: 'Aas-paas kaun hai',
      needName: 'Business ka naam aur area likhiye, ya Google Maps link daaliye.', live: 'Aapki live Google listing', liveNote: 'Seedha Google Maps se. Neeche ke sawaal isse dekh kar jawab dijiye.',
      openMaps: 'Google Maps mein kholo', compT: 'Aapke aas-paas kaun dikhta hai', compNote: 'Jab customer aapke paas “{t}” search karta hai, toh yeh dikhta hai. Kya aap pehle kuch mein hain?', compOpen: 'Yeh search Google Maps mein kholo', compNeed: 'Customer kya search karte hain (jaise “saree shop”) woh daaliye, competition dikhega.',
      siteT: 'Apni website check kijiye (free, asli data)', siteL: 'Hum aapki website phone par customer ki tarah kholte hain, aur us par Google ka apna PageSpeed test chalate hain.', siteIn: 'Aapki website', siteBtn: 'Meri website check karo', siteNo: 'Website nahi hai? Neeche “Website nahi hai” chuniye.',
      siteBusy: ['Website khol rahe hain…', 'Call, WhatsApp aur map buttons check kar rahe hain…', 'Phone par Google ka PageSpeed test chal raha hai (20–40 second lagte hain)…', 'Main content kitni jaldi khulta hai, naap rahe hain…'],
      siteErr: 'Yeh website khul nahi paayi. Address check karke phir try kijiye.', psiErr: 'Google ka speed test is baar poora nahi hua. Ek minute baad phir try kijiye.', psiT: 'Google PageSpeed (mobile)', fromSite: 'Website check se', fromGoogle: 'Asli data',
      webRep: 'Aapki website report', webOk: 'Theek hai', webFix: 'Theek karna hai', lcp: 'Main content khulta hai', speed: 'Mobile speed', seo: 'SEO', a11y: 'Accessibility', bp: 'Best practices', slowNote: 'Google 2.5 second se kam suggest karta hai.',
    },
  };
  var SECS = [
    { id: 'basics', en: 'Profile basics', hi: 'Profile ki basics' },
    { id: 'photos', en: 'Photos & updates', hi: 'Photos aur updates' },
    { id: 'reviews', en: 'Reviews', hi: 'Reviews' },
    { id: 'web', en: 'Website & trust', hi: 'Website aur bharosa' },
  ];
  /* website checks: label + how to fix, [en, hi] */
  var SITE = {
    https: [['Secure (https)', 'Secure (https)'], ['Turn on SSL so the address starts with https://. Most hosts do this free.', 'SSL chalu kijiye taaki address https:// se shuru ho. Zyaadatar hosting free mein karti hai.']],
    mobile: [['Made for phones', 'Phone ke liye bani'], ['Add a mobile viewport and a phone-friendly layout. Most of your customers open it on a phone.', 'Mobile viewport aur phone-friendly layout lagaiye. Zyaadatar customer phone par kholte hain.']],
    title: [['Clear page title', 'Saaf page title'], ['Write a 50–60 character title: business name + what you sell + area.', '50–60 characters ka title: business naam + kya bechte hain + area.']],
    desc: [['Search description', 'Search description'], ['Add a 150-character meta description saying what you offer and where. It shows under your name on Google.', '150 characters ki meta description likhiye: kya dete hain aur kahan. Yeh Google par naam ke neeche dikhti hai.']],
    h1: [['Main heading', 'Main heading'], ['Add one main heading (H1) that says what you do, like “Silk sarees in Andheri East”.', 'Ek main heading (H1) jo bataye aap kya karte hain, jaise “Silk sarees in Andheri East”.']],
    call: [['Tap-to-call button', 'Tap karke call button'], ['Add a Call button (tel: link) at the top. On a phone, one tap should start the call.', 'Upar Call button (tel: link) lagaiye. Phone par ek tap mein call lage.']],
    whatsapp: [['WhatsApp button', 'WhatsApp button'], ['Add a WhatsApp chat button (wa.me link). Indian customers often prefer chatting before visiting.', 'WhatsApp chat button (wa.me link) lagaiye. Customer aane se pehle chat karna pasand karte hain.']],
    map: [['Google Maps on the site', 'Website par Google Maps'], ['Embed your Google Maps location on the contact section so people can get directions.', 'Contact section mein Google Maps location lagaiye taaki log rasta dekh sakein.']],
    address: [['Address with PIN code', 'PIN code ke saath address'], ['Show your full address with PIN code, exactly as on Google.', 'Poora address PIN code ke saath, bilkul Google jaisa, likhiye.']],
    phone: [['Phone number shown', 'Phone number dikhta hai'], ['Show your phone number as text, exactly as on your Google profile.', 'Phone number text mein likhiye, bilkul Google profile jaisa.']],
    schema: [['Business details for Google (schema)', 'Google ke liye business details (schema)'], ['Add LocalBusiness schema (name, address, phone, hours) so Google can match your site to your profile.', 'LocalBusiness schema (naam, address, phone, timing) lagaiye taaki Google website ko profile se match kare.']],
    name: [['Business name on the page', 'Page par business ka naam'], ['Use the same business name on the home page as on Google.', 'Home page par wahi business naam jo Google par hai.']],
    alt: [['Image descriptions', 'Image descriptions'], ['Add short alt text to images, like “Silk saree display at Sharma Sarees”.', 'Images par chhota alt text daaliye, jaise “Sharma Sarees mein silk saree display”.']],
    fast: [['Server answers quickly', 'Server jaldi jawab deta hai'], ['Your server took a while to answer. Better hosting or caching usually fixes this.', 'Server ne jawab dene mein time liya. Achhi hosting ya caching se theek hota hai.']],
  };
  var MANAGE = {
    en: 'Sign in to the Google account that manages your business, then search your business name on Google. Your profile tools (Edit profile, Read reviews, Add update, Add photo) show at the top.',
    hi: 'Jo Google account aapka business manage karta hai usse sign in kijiye, phir Google par apne business ka naam search kijiye. Upar profile tools dikhenge: Edit profile, Read reviews, Add update, Add photo.',
  };
  /* type c = choice (points = w × f), n = number. fix steps: arrays of [en, hi]. link: [href, en label, hi label] */
  var Q = [
    { id: 'verified', s: 'basics', w: 10,
      q: ['Is your business claimed and verified on Google?', 'Kya aapka business Google par claimed aur verified hai?'],
      h: ['Search your business name on Google. If you see “Own this business?” or “Claim this business”, nobody has claimed it yet.', 'Google par apne business ka naam search kijiye. Agar “Own this business?” ya “Claim this business” dikhe, toh abhi tak kisi ne claim nahi kiya.'],
      o: [[1, 'Yes, we manage it and it’s verified', 'Haan, hum manage karte hain, verified hai'], [0.3, 'Not sure', 'Pata nahi'], [0, 'No, or I see “Own this business?”', 'Nahi, ya “Own this business?” dikhta hai']],
      fix: { t: ['Claim and verify your profile', 'Profile claim aur verify kijiye'], why: ['Google says verified businesses are more likely to show up in local results, and only a verified owner can edit the details.', 'Google ke hisaab se verified businesses local results mein zyada dikhte hain, aur sirf verified owner hi details badal sakta hai.'],
        st: [['Search your business on Google or Google Maps and tap “Own this business?” or “Claim this business”.', 'Google ya Google Maps par business search karke “Own this business?” ya “Claim this business” dabaiye.'],
          ['If your business isn’t on Maps at all, add it at business.google.com.', 'Agar business Maps par hai hi nahi, toh business.google.com par add kijiye.'],
          ['Follow Google’s verification steps (it may ask for a short video of your shop, a call, SMS or email). Keep your shop signboard and a bill or licence ready.', 'Google ke verification steps follow kijiye (shop ka chhota video, call, SMS ya email maang sakta hai). Shop ka board aur bill ya licence ready rakhiye.']],
        link: ['https://support.google.com/business/answer/7107242?hl=en', 'Google: verify your business', 'Google: business verify kaise karein'], cta: 'seo' } },
    { id: 'category', s: 'basics', w: 7,
      q: ['Is your main category the most specific one?', 'Kya aapki main category sabse specific hai?'],
      h: ['The category shows right under your name on Maps, like “Saree store” or “Dental clinic”. “Store” or “Shop” is too broad.', 'Category Maps par naam ke neeche dikhti hai, jaise “Saree store” ya “Dental clinic”. Sirf “Store” ya “Shop” bahut general hai.'],
      o: [[1, 'Yes, a specific one', 'Haan, specific hai'], [0.4, 'Not sure', 'Pata nahi'], [0, 'No, it’s broad or wrong', 'Nahi, general ya galat hai']],
      fix: { t: ['Pick the most specific category', 'Sabse specific category chuniye'], why: ['Category is one of the strongest relevance signals: it decides which searches Google shows you for.', 'Category sabse important relevance signal hai: isi se Google tay karta hai ki aap kin searches mein dikhenge.'],
        st: [['Edit profile → Business category. Choose the most specific primary category (e.g. “Saree store”, not “Clothing store”).', 'Edit profile → Business category. Sabse specific primary category chuniye (jaise “Saree store”, “Clothing store” nahi).'],
          ['Add 2–4 extra categories only if they’re really true for you.', '2–4 extra categories tabhi daaliye jab woh sach mein aap par lagu hon.']], cta: 'seo' } },
    { id: 'hours', s: 'basics', w: 6,
      q: ['Are your opening hours correct, including holidays?', 'Kya aapka timing sahi hai, chhuttiyon ke saath?'],
      h: ['Check the hours on your listing, and whether special hours are set for festivals and holidays.', 'Listing par timing check kijiye, aur tyohaar/chhutti ke special hours set hain ya nahi.'],
      o: [[1, 'Correct, with holiday hours', 'Sahi hai, holiday hours ke saath'], [0.6, 'Regular hours only', 'Sirf regular timing'], [0, 'Missing or wrong', 'Nahi hai ya galat hai']],
      fix: { t: ['Fix your hours and add holiday hours', 'Timing theek kijiye aur holiday hours daaliye'], why: ['Wrong hours send customers to a closed shutter, and they leave bad reviews.', 'Galat timing se customer band shutter dekh kar laut jaate hain, aur kharab review dete hain.'],
        st: [['Edit profile → Hours. Set every day correctly, including the weekly off.', 'Edit profile → Hours. Har din ka sahi timing daaliye, weekly off ke saath.'],
          ['Add special hours before Diwali, Eid, Christmas and other holidays.', 'Diwali, Eid, Christmas jaisi chhuttiyon se pehle special hours daaliye.']], cta: 'seo' } },
    { id: 'contact', s: 'basics', w: 5,
      q: ['Does your profile have a phone number and a website?', 'Kya profile par phone number aur website hai?'],
      h: ['Look for the Call and Website buttons on your listing.', 'Listing par Call aur Website buttons dekhiye.'],
      o: [[1, 'Both', 'Dono hain'], [0.5, 'Only one of them', 'Sirf ek hai'], [0, 'Neither', 'Dono nahi hain']],
      fix: { t: ['Add a phone number and a website', 'Phone number aur website daaliye'], why: ['Most customers call or check the website before they visit. No button means they call the shop next door.', 'Zyaadatar customer aane se pehle call karte hain ya website dekhte hain. Button nahi toh woh bagal wali shop ko call karenge.'],
        st: [['Edit profile → Contact. Add a number someone actually answers, and your website.', 'Edit profile → Contact. Aisa number daaliye jo koi uthaye, aur apni website.'],
          ['No website yet? A simple, fast one-page site with WhatsApp and call buttons is enough to start.', 'Website nahi hai? Shuru karne ke liye WhatsApp aur call button wali ek fast one-page website kaafi hai.']], cta: 'web' } },
    { id: 'desc', s: 'basics', w: 4,
      q: ['Have you written a business description?', 'Kya aapne business description likha hai?'],
      h: ['It’s the “From the business” text on your profile. You can write up to 750 characters.', 'Profile par “From the business” wala text. 750 characters tak likh sakte hain.'],
      o: [[1, 'Yes, detailed: what we sell and our area', 'Haan, detail mein: kya bechte hain aur area'], [0.5, 'Just a short line', 'Bas ek chhoti line'], [0, 'No description', 'Description nahi hai']],
      fix: { t: ['Write a proper description', 'Achha description likhiye'], why: ['It tells Google and customers exactly what you offer, in words people search for.', 'Isse Google aur customers ko pata chalta hai ki aap kya dete hain, unhi shabdon mein jo log search karte hain.'],
        st: [['Edit profile → Description. Write up to 750 characters: what you sell, who it’s for, your area and what makes you different.', 'Edit profile → Description. 750 characters tak: kya bechte hain, kiske liye, kaunsa area, aur aap alag kyun hain.'],
          ['Keep it plain: no links, phone numbers or offers (Google may reject those).', 'Seedha rakhiye: link, phone number ya offer mat daaliye (Google reject kar sakta hai).']], cta: 'seo' } },
    { id: 'products', s: 'basics', w: 4,
      q: ['Have you added your products or services?', 'Kya aapne products ya services add kiye hain?'],
      h: ['Look for a Products or Services section on your listing.', 'Listing par Products ya Services section dekhiye.'],
      o: [[1, 'Yes, with photos or prices', 'Haan, photos ya price ke saath'], [0.5, 'A few', 'Thode se'], [0, 'None', 'Bilkul nahi']],
      fix: { t: ['Add your best products or services', 'Apne best products ya services daaliye'], why: ['They help you show up when people search for a specific item, and they sell for you before the visit.', 'Isse aap specific cheez search karne walon ko dikhte hain, aur customer aane se pehle hi decide kar leta hai.'],
        st: [['Edit products (shops) or Edit services (service businesses). Add your top 10 with a photo, a price or price range and one line each.', 'Edit products (shops) ya Edit services. Top 10 items photo, price ya price range aur ek line ke saath daaliye.']], cta: 'seo' } },
    { id: 'photos', s: 'photos', w: 8,
      q: ['How many photos does your profile have?', 'Profile par kitni photos hain?'],
      h: ['Count the photos on your listing, and check if any were added in the last 3 months.', 'Listing ki photos giniye, aur dekhiye ki pichhle 3 mahine mein koi nayi photo aayi ya nahi.'],
      o: [[1, '20+ photos, some from the last 3 months', '20+ photos, kuch pichhle 3 mahine ki'], [0.5, 'Some, but mostly old', 'Kuch hain, par purani'], [0, 'Fewer than 5', '5 se kam']],
      fix: { t: ['Add real photos every month', 'Har mahine asli photos daaliye'], why: ['Google lists photos as a way to stand out, and customers decide in seconds from them.', 'Google bhi photos ko zaroori maanta hai, aur customer photos dekh kar seconds mein decide karta hai.'],
        st: [['Add photo: shop front (so people recognise it), inside, best products, team at work. Take them in daylight.', 'Add photo: shop ka front (pehchaan ke liye), andar ka, best products, kaam karti team. Din ki roshni mein lijiye.'],
          ['Add 2–3 new photos every month. Use real photos, not stock images or text banners.', 'Har mahine 2–3 nayi photos. Asli photos, stock images ya text banners nahi.']], cta: 'social' } },
    { id: 'posts', s: 'photos', w: 5,
      q: ['Have you posted an update or offer recently?', 'Kya aapne haal hi mein update ya offer post kiya?'],
      h: ['Updates appear on your profile under “Updates” or “From the owner”.', 'Updates profile par “Updates” ya “From the owner” mein dikhte hain.'],
      o: [[1, 'Yes, in the last 30 days', 'Haan, pichhle 30 din mein'], [0.4, 'Earlier than that', 'Usse pehle'], [0, 'Never', 'Kabhi nahi']],
      fix: { t: ['Post one update a week', 'Hafte mein ek update post kijiye'], why: ['Fresh updates show customers you’re open and active, and give them a reason to visit now.', 'Naye updates se customer ko pata chalta hai ki aap active hain, aur abhi aane ki wajah milti hai.'],
        st: [['Add update: one photo plus 2–3 lines about new stock, an offer, an event or a festival timing.', 'Add update: ek photo aur 2–3 lines: naya stock, offer, event ya festival timing.'],
          ['Do it every week, same day. Reuse your Instagram posts.', 'Har hafte, ek hi din. Apne Instagram posts reuse kar sakte hain.']], cta: 'social' } },
    { id: 'attrs', s: 'photos', w: 5,
      q: ['Have you added attributes like “Accepts UPI” or “Wheelchair accessible”?', 'Kya aapne “Accepts UPI”, “Wheelchair accessible” jaise attributes daale hain?'],
      h: ['Attributes are the small highlights on your profile: payments, accessibility, Wi-Fi, parking and so on.', 'Attributes profile ki chhoti highlights hain: payment, accessibility, Wi-Fi, parking waghera.'],
      o: [[1, 'Yes, all that apply', 'Haan, jo bhi lagu hain'], [0.5, 'Some', 'Kuch'], [0, 'None, or not sure', 'Nahi, ya pata nahi']],
      fix: { t: ['Tick every attribute that’s true', 'Jo sach hai woh saare attributes tick kijiye'], why: ['Google lists attributes like parking or Wi-Fi as part of complete info, and people filter searches by them.', 'Google parking ya Wi-Fi jaise attributes ko complete info ka hissa maanta hai, aur log inse filter karte hain.'],
        st: [['Edit profile → More (attributes). Tick payments (UPI, cards), accessibility, Wi-Fi, parking, women-owned and anything else that’s true.', 'Edit profile → More (attributes). Payments (UPI, card), accessibility, Wi-Fi, parking, women-owned aur jo bhi sach ho, tick kijiye.']], cta: 'seo' } },
    { id: 'count', s: 'reviews', w: 12, type: 'n', max: 100000,
      q: ['How many Google reviews do you have?', 'Aapke Google par kitne reviews hain?'],
      h: ['The number in brackets next to your star rating, e.g. 4.3 ★ (87).', 'Star rating ke bagal bracket mein number, jaise 4.3 ★ (87).'],
      fix: { t: ['Get more Google reviews, every week', 'Har hafte zyada Google reviews laaiye'], why: ['Google says prominence is partly based on how many reviews you have, and shoppers trust shops with more reviews.', 'Google ke hisaab se prominence mein reviews ki ginti bhi count hoti hai, aur log zyada reviews wali shop par bharosa karte hain.'],
        st: [['Ask every customer on the same day, in person and on WhatsApp.', 'Har customer se usi din poochiye, saamne aur WhatsApp par.'],
          ['Keep a review QR standee at the counter and on bills.', 'Counter aur bill par review QR standee rakhiye.'],
          ['Never pay, give discounts or gifts for reviews: Google removes them.', 'Review ke badle paise, discount ya gift kabhi mat dijiye: Google unhe hata deta hai.']],
        link: ['/tools/google-review-qr-code', 'Make your free review QR standee', 'Free review QR standee banaiye'], cta: 'qr' } },
    { id: 'rating', s: 'reviews', w: 8, type: 'n', max: 5, step: 0.1,
      q: ['What is your star rating?', 'Aapki star rating kitni hai?'],
      h: ['The number before the stars, e.g. 4.3.', 'Stars se pehle wala number, jaise 4.3.'],
      fix: { t: ['Lift your rating the right way', 'Rating sahi tareeke se badhaiye'], why: ['Many people skip shops below 4 stars without reading a single review.', 'Bahut log 4 star se kam wali shop bina review padhe skip kar dete hain.'],
        st: [['Reply calmly to every bad review, fix the problem, and invite the customer back.', 'Har kharab review ka shaanti se jawab dijiye, problem theek kijiye, customer ko wapas bulaiye.'],
          ['Ask all your happy regulars for an honest review: new reviews slowly lift the average.', 'Apne khush regular customers se honest review maangiye: naye reviews se average dheere-dheere badhta hai.'],
          ['Use the review goal calculator below to see your target.', 'Neeche review goal calculator se apna target dekhiye.']], cta: 'qr' } },
    { id: 'recent', s: 'reviews', w: 5,
      q: ['How many new reviews did you get in the last 30 days?', 'Pichhle 30 din mein kitne naye reviews aaye?'],
      h: ['Sort reviews by “Newest” on your listing and count.', 'Listing par reviews ko “Newest” se sort karke giniye.'],
      o: [[1, '5 or more', '5 ya zyada'], [0.5, '1 to 4', '1 se 4'], [0, 'None', 'Ek bhi nahi']],
      fix: { t: ['Get a steady flow of new reviews', 'Lagaatar naye reviews laaiye'], why: ['Old reviews alone look like a shop that has gone quiet. Customers read the newest ones first.', 'Sirf purane reviews se lagta hai shop band jaisi hai. Customer pehle naye reviews padhte hain.'],
        st: [['Set a daily habit: every bill gets a “Please review us” line and the QR.', 'Roz ki aadat: har bill ke saath “Please review us” line aur QR.'],
          ['Send your review link on WhatsApp the same evening.', 'Usi shaam WhatsApp par review link bhejiye.']],
        link: ['/tools/google-review-qr-code', 'Get your review link and WhatsApp messages', 'Review link aur WhatsApp messages paaiye'], cta: 'qr' } },
    { id: 'replies', s: 'reviews', w: 6,
      q: ['Do you reply to your reviews?', 'Kya aap reviews ka jawab dete hain?'],
      h: ['Open your reviews and look for “Response from the owner”.', 'Reviews kholiye aur “Response from the owner” dekhiye.'],
      o: [[1, 'Every review, good and bad', 'Har review, achha ho ya bura'], [0.5, 'Some of them', 'Kuch ka'], [0, 'Never', 'Kabhi nahi']],
      fix: { t: ['Reply to every review', 'Har review ka jawab dijiye'], why: ['Google lists responding to reviews as a way to improve local ranking, and new customers read your replies.', 'Google bhi reviews ka jawab dene ko ranking sudhaarne ka tareeka maanta hai, aur naye customer aapke jawab padhte hain.'],
        st: [['Read reviews → Reply. Thank them by name, mention what they bought, keep it to 2 lines.', 'Read reviews → Reply. Naam se shukriya, unhone kya liya woh likhiye, 2 lines mein.'],
          ['For a bad review: apologise, share a number to sort it out, never argue in public.', 'Kharab review par: maafi maangiye, baat karne ke liye number dijiye, public mein behes mat kijiye.']], cta: 'seo' } },
    { id: 'website', s: 'web', w: 6,
      q: ['Do you have a website that matches your Google profile?', 'Kya aapki website hai jo Google profile se match karti hai?'],
      h: ['Same business name, address and phone number as on Google, and it works well on a phone.', 'Google jaisa hi naam, address aur phone number, aur phone par achhe se chalti ho.'],
      o: [[1, 'Yes, mobile-friendly with the same details', 'Haan, mobile-friendly aur same details'], [0.4, 'Yes, but it’s old or details differ', 'Haan, par purani hai ya details alag hain'], [0, 'No website', 'Website nahi hai']],
      fix: { t: ['Get a fast website that matches Google', 'Google se match karti fast website banaiye'], why: ['Google’s prominence also uses information from the web, and a matching website backs up your profile.', 'Google prominence ke liye web ki jaankari bhi dekhta hai, aur match karti website aapke profile ko mazboot karti hai.'],
        st: [['Use the exact same name, address and phone on the site as on Google.', 'Website par bilkul wahi naam, address aur phone jo Google par hai.'],
          ['Make it load fast on phones, with call and WhatsApp buttons and a Google Maps embed.', 'Phone par fast khule, call aur WhatsApp buttons aur Google Maps embed ke saath.'],
          ['Add the website link to your Google profile (Edit profile → Contact).', 'Website link Google profile mein daaliye (Edit profile → Contact).']], cta: 'web' } },
    { id: 'listings', s: 'web', w: 4,
      q: ['Are you listed on other sites with the same details?', 'Kya aap dusri sites par same details ke saath listed hain?'],
      h: ['Think Justdial, Sulekha, IndiaMART (if you sell wholesale), Bing Places and Apple Maps.', 'Jaise Justdial, Sulekha, IndiaMART (wholesale ho toh), Bing Places aur Apple Maps.'],
      o: [[1, 'Yes, same details everywhere', 'Haan, sab jagah same details'], [0.5, 'Some, not sure they match', 'Kuch par, pata nahi match karti hain ya nahi'], [0, 'No', 'Nahi']],
      fix: { t: ['Make your details match everywhere', 'Sab jagah details ek jaisi kijiye'], why: ['Google says prominence uses links and information from across the web. Matching details build trust.', 'Google ke hisaab se prominence poore web ki jaankari se banti hai. Ek jaisi details se bharosa banta hai.'],
        st: [['Write down your exact name, address and phone as on Google.', 'Google wala exact naam, address aur phone ek jagah likh lijiye.'],
          ['Claim and update Justdial, Sulekha, Bing Places and Apple Business Connect with exactly the same details.', 'Justdial, Sulekha, Bing Places aur Apple Business Connect par claim karke bilkul same details daaliye.']], cta: 'seo' } },
    { id: 'ask', s: 'web', w: 5,
      q: ['Do you ask every customer for a review?', 'Kya aap har customer se review maangte hain?'],
      h: ['Be honest: a review QR at the counter or a WhatsApp message after each sale counts.', 'Sach bataiye: counter par review QR ya har sale ke baad WhatsApp message bhi count hota hai.'],
      o: [[1, 'Yes, every customer', 'Haan, har customer se'], [0.4, 'Sometimes', 'Kabhi-kabhi'], [0, 'Never', 'Kabhi nahi']],
      fix: { t: ['Ask every customer (it’s the habit that wins)', 'Har customer se maangiye (yahi aadat jeetati hai)'], why: ['The shops with the most reviews aren’t lucky: they ask every single customer.', 'Sabse zyada reviews wali shops lucky nahi hoti: woh har ek customer se maangti hain.'],
        st: [['Put a review QR standee on the counter today.', 'Aaj hi counter par review QR standee rakhiye.'],
          ['Train staff to say one line at billing: “Please leave us a Google review, it helps us a lot.”', 'Staff billing par ek line bole: “Please Google par review dijiye, humein bahut madad milti hai.”']],
        link: ['/tools/google-review-qr-code', 'Make your free review QR standee', 'Free review QR standee banaiye'], cta: 'qr' } },
  ];
  var TOTAL = Q.reduce(function (a, q) { return a + q.w; }, 0); // 100

  var noReviews = function () { return state.a.count !== undefined && state.a.count !== '' && +state.a.count === 0; };
  function frac(q, v) {
    if (q.id === 'rating' && noReviews()) return 0; // no reviews = no rating yet
    if (v === undefined || v === null || v === '') return null;
    if (q.type !== 'n') return q.o[+v] ? q.o[+v][0] : null;
    var x = +v;
    if (!isFinite(x) || x < 0 || x > q.max) return null;
    if (q.id === 'count') return x >= 200 ? 1 : x >= 100 ? 0.9 : x >= 50 ? 0.75 : x >= 25 ? 0.55 : x >= 10 ? 0.3 : x >= 1 ? 0.1 : 0;
    if (x < 1) return null;
    return x >= 4.7 ? 1 : x >= 4.4 ? 0.9 : x >= 4.1 ? 0.7 : x >= 3.8 ? 0.4 : 0;
  }

  /* ---------- state ---------- */
  var state = { lang: 'en', name: '', link: '', type: '', place: null, a: {}, auto: {}, target: 4.5, comp: '', pace: '', shown: false, site: '', siteRes: null, psi: null, siteErr: '', psiErr: '', liveOn: false, open: 'basics', mapTab: 'me' };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv) for (var k in state) if (k in sv) state[k] = sv[k]; } catch (e) { /* storage blocked */ }
  if (!UI[state.lang]) state.lang = 'en';
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  var T = function () { return UI[state.lang]; };
  var L = function (pair) { return pair[state.lang === 'hi' ? 1 : 0]; };
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var fill = function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); };

  /* ---------- scoring ---------- */
  function score() {
    var pts = 0, n = 0, by = {};
    SECS.forEach(function (s) { by[s.id] = { got: 0, max: 0 }; });
    Q.forEach(function (q) {
      var f = frac(q, state.a[q.id]);
      by[q.s].max += q.w;
      if (f !== null) { n++; pts += q.w * f; by[q.s].got += q.w * f; }
    });
    return { pts: Math.round(pts), n: n, by: by };
  }
  function grade(p) { var g = T().grades; return p >= 85 ? g[0] : p >= 70 ? g[1] : p >= 50 ? g[2] : g[3]; }
  function tone(p) { return p >= 85 ? '#1E8E3E' : p >= 70 ? '#4E9A2E' : p >= 50 ? '#C27A00' : '#C5221F'; }
  function fixes() {
    return Q.map(function (q) { var f = frac(q, state.a[q.id]); return { q: q, lost: f === null ? q.w : q.w * (1 - f), answered: f !== null }; })
      .filter(function (x) { return x.lost >= 1; })
      .sort(function (a, b) { return b.lost - a.lost || b.q.w - a.q.w; });
  }

  /* ---------- gauge ---------- */
  function gauge(p, big, color) {
    var r = 80, c = Math.PI * r, f = Math.max(0, Math.min(100, p)) / 100, col = color || tone(p);
    return '<svg class="gp-gauge' + (big ? ' gp-gauge--big' : '') + '" viewBox="0 0 200 118" aria-hidden="true" focusable="false">' +
      '<path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="#ECE7F5" stroke-width="18" stroke-linecap="round"/>' +
      '<path class="gp-gauge__val" d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="' + col + '" stroke-width="18" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '<text x="100" y="92" text-anchor="middle" class="gp-gauge__n" fill="#251E45">' + p + '</text>' +
      '<text x="100" y="113" text-anchor="middle" class="gp-gauge__of" fill="#4A4458">/ 100</text></svg>';
  }
  function bars(by, neutral) {
    return SECS.map(function (s) {
      var b = by[s.id], pc = b.max ? Math.round(b.got / b.max * 100) : 0;
      if (neutral) return '<div class="gp-bar"><div class="gp-bar__t"><span>' + esc(L([s.en, s.hi])) + '</span><b>' + secStat(s.id).done + '/' + secStat(s.id).total + '</b></div><div class="gp-bar__track"><i style="width:' + Math.round(secStat(s.id).done / secStat(s.id).total * 100) + '%;background:#63B849"></i></div></div>';
      return '<div class="gp-bar"><div class="gp-bar__t"><span>' + esc(L([s.en, s.hi])) + '</span><b>' + Math.round(b.got) + '/' + b.max + '</b></div>' +
        '<div class="gp-bar__track"><i style="width:' + pc + '%;background:' + tone(pc) + '"></i></div></div>';
    }).join('');
  }

  /* ---------- questions ---------- */
  /* question illustrations live in gbp-art.js (loaded first) */
  var ART = function (id) { return typeof window.UScaleGbpArt === 'function' ? window.UScaleGbpArt(id) : ''; };

  var qsBox = $('#gp-qs');
  function drawQuestions() {
    var n = 0;
    qsBox.innerHTML = SECS.map(function (s, si) {
      var qs = Q.filter(function (q) { return q.s === s.id; });
      var body = qs.map(function (q) {
        n++;
        var badge = state.auto[q.id] ? ' <span class="gp-auto">' + esc(T().fromSite) + '</span>' : '';
        var head = '<legend class="gp-q__q"><span class="gp-q__n" aria-hidden="true">' + n + '</span><span>' + esc(L(q.q)) + badge + '</span><span class="gp-pts" data-gp-pts="' + q.id + '" aria-hidden="true"></span></legend>';
        var fig = '<figure class="gp-q__art">' + ART(q.id) + '<figcaption><b>' + (state.lang === 'hi' ? 'Kahan dekhein: ' : 'Where to look: ') + '</b>' + esc(L(q.h)) + '</figcaption></figure>';
        var ctl;
        if (q.type === 'n') {
          var off = q.id === 'rating' && noReviews();
          ctl = '<div class="gp-num"><input class="rq-input" type="number" inputmode="decimal" id="gp-in-' + q.id + '" data-gp-num="' + q.id + '" min="' + (q.id === 'rating' ? 1 : 0) + '" max="' + q.max + '" step="' + (q.step || 1) + '" placeholder="' + (off ? '–' : q.id === 'rating' ? '4.3' : '87') + '" value="' + esc(state.a[q.id] != null ? state.a[q.id] : '') + '" aria-label="' + esc(L(q.q)) + '"' + (off ? ' disabled' : '') + '>' +
            '<span class="gp-num__u">' + (q.id === 'rating' ? '★' : (state.lang === 'hi' ? 'reviews' : 'reviews')) + '</span></div>';
        } else {
          ctl = '<div class="gp-opts">' + q.o.map(function (o, i) {
            var id = 'gp-' + q.id + '-' + i;
            return '<input type="radio" name="gp-' + q.id + '" id="' + id + '" value="' + i + '" data-gp-q="' + q.id + '"' + (String(state.a[q.id]) === String(i) ? ' checked' : '') + '><label for="' + id + '">' + esc(state.lang === 'hi' ? o[2] : o[1]) + '</label>';
          }).join('') + '</div>';
        }
        return '<fieldset class="gp-q" id="gp-q-' + q.id + '" data-done="' + (frac(q, state.a[q.id]) !== null) + '">' + head + '<div class="gp-q__body">' + fig + ctl + '</div></fieldset>';
      }).join('');
      var open = state.open === s.id, nxt = SECS[si + 1], t = T();
      var nextBtn = '<button type="button" class="btn ' + (nxt ? 'btn--ink' : 'btn--go') + ' gp-next" data-gp-next="' + (nxt ? nxt.id : '') + '">' +
        esc(nxt ? fill(t.next, { s: L([nxt.en, nxt.hi]) }) : t.see) + ' <span aria-hidden="true">' + (nxt ? '↓' : '→') + '</span></button>';
      return '<section class="gp-sec rq-step" id="gp-sec-' + s.id + '" data-open="' + open + '">' +
        '<h3 class="gp-sec__h"><button type="button" class="gp-sec__hd" data-gp-sec="' + s.id + '" aria-expanded="' + open + '" aria-controls="gp-secb-' + s.id + '">' +
        '<span class="rq-step__n" aria-hidden="true">' + (si + 2) + '</span><span class="gp-sec__t"><b>' + esc(L([s.en, s.hi])) + '</b><small data-gp-sec-sub="' + s.id + '"></small></span>' +
        '<span class="gp-sec__s" data-gp-sec-score="' + s.id + '"></span><i class="gp-sec__chev" aria-hidden="true"></i></button></h3>' +
        '<div class="gp-sec__b" id="gp-secb-' + s.id + '"' + (open ? '' : ' hidden') + '>' + (s.id === 'web' ? siteCard() : '') + body + '<div class="gp-sec__ft">' + nextBtn + '</div></div></section>';
    }).join('');
    secHeads();
  }
  function secStat(id) {
    var qs = Q.filter(function (q) { return q.s === id; }), done = 0, got = 0, max = 0;
    qs.forEach(function (q) { var f = frac(q, state.a[q.id]); max += q.w; if (f !== null) { done++; got += q.w * f; } });
    return { done: done, total: qs.length, got: Math.round(got), max: max, complete: done === qs.length };
  }
  function secHeads() {
    var t = T();
    SECS.forEach(function (s) {
      var st = secStat(s.id), sub = root.querySelector('[data-gp-sec-sub="' + s.id + '"]'), sc = root.querySelector('[data-gp-sec-score="' + s.id + '"]'), sec = $('#gp-sec-' + s.id);
      if (!sub) return;
      sub.textContent = st.complete ? t.secDone : fill(t.secLeft, { n: st.done, t: st.total });
      sc.textContent = st.complete ? st.got + '/' + st.max : '';
      sc.style.color = st.complete ? tone(st.got / st.max * 100) : '';
      sec.setAttribute('data-complete', String(st.complete));
    });
  }
  var toastEl = null, toastT = 0;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'gp-toast'; toastEl.setAttribute('aria-hidden', 'true'); root.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.remove('is-on'); void toastEl.offsetWidth; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }
  function celebrate(id) {
    var sec = $('#gp-sec-' + id), t = T(), done = SECS.filter(function (s) { return secStat(s.id).complete; }).length, left = SECS.length - done;
    if (sec) { sec.classList.remove('is-party'); void sec.offsetWidth; sec.classList.add('is-party'); setTimeout(function () { sec.classList.remove('is-party'); }, 1400); }
    var s0 = SECS.filter(function (s) { return s.id === id; })[0];
    var msg = left ? fill(t.cheer, { s: L([s0.en, s0.hi]), n: left }) : t.cheerAll;
    toast(msg); say(msg);
  }
  function openSec(id, scroll) {
    state.open = id;
    SECS.forEach(function (s) {
      var sec = $('#gp-sec-' + s.id), on = s.id === id;
      sec.setAttribute('data-open', String(on)); sec.querySelector('.gp-sec__hd').setAttribute('aria-expanded', String(on)); sec.querySelector('.gp-sec__b').hidden = !on;
    });
    save();
    if (scroll && id) { var h = $('#gp-sec-' + id); var y = h.getBoundingClientRect().top + window.scrollY - (document.querySelector('.site-header') || { offsetHeight: 70 }).offsetHeight - 12; window.scrollTo({ top: y, behavior: 'smooth' }); }
  }

  /* ---------- website check: our server reads the page, the browser runs Google PageSpeed (free, keyless) ---------- */
  var PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  var siteBusy = false, siteStep = 0, siteTimer = 0;
  function siteCard() {
    var t = T();
    return '<div class="gp-site" id="gp-site"><p class="gp-site__t"><b>' + esc(t.siteT) + '</b><span>' + esc(t.siteL) + '</span></p>' +
      '<div class="gp-site__row"><label class="sr-only" for="gp-site-in">' + esc(t.siteIn) + '</label><input class="rq-input" id="gp-site-in" type="url" inputmode="url" autocomplete="url" spellcheck="false" placeholder="www.yourshop.in" value="' + esc(state.site) + '">' +
      '<button type="button" class="btn btn--go" id="gp-site-go"' + (siteBusy ? ' disabled' : '') + '>' + esc(t.siteBtn) + '</button></div>' +
      '<p class="gp-site__no">' + esc(t.siteNo) + '</p><div class="gp-site__out" id="gp-site-out" aria-live="polite">' + siteOut() + '</div></div>';
  }
  function dial(label, v) {
    if (v == null) return '';
    var c = v >= 90 ? '#1E8E3E' : v >= 50 ? '#C27A00' : '#C5221F';
    return '<div class="gp-dial"><span class="gp-dial__v" style="--v:' + v + ';--c:' + c + '"><b>' + v + '</b></span><small>' + esc(label) + '</small></div>';
  }
  function checkList(only) {
    var r = state.siteRes; if (!r || !r.checks) return '';
    return r.checks.filter(function (c) { return only == null || c.ok === only; }).map(function (c) {
      var lab = SITE[c.id] ? L(SITE[c.id][0]) : c.id;
      return '<li class="gp-chk gp-chk--' + (c.ok ? 'ok' : 'no') + '"><span aria-hidden="true">' + (c.ok ? '✓' : '✕') + '</span>' + esc(lab) + '<span class="sr-only">: ' + (c.ok ? esc(T().webOk) : esc(T().webFix)) + '</span></li>';
    }).join('');
  }
  function psiBlock() {
    var p = state.psi, t = T(); if (!p) return '';
    return '<div class="gp-psi"><p class="gp-psi__t">' + esc(t.psiT) + '</p><div class="gp-dials">' + dial(t.speed, p.perf) + dial(t.seo, p.seo) + dial(t.a11y, p.a11y) + dial(t.bp, p.bp) + '</div>' +
      (p.lcp ? '<p class="gp-psi__m">' + esc(t.lcp) + ' <b>' + esc(p.lcp) + '</b>' + (p.lcpMs > 2500 ? ' · ' + esc(t.slowNote) : '') + '</p>' : '') + '</div>';
  }
  function siteOut() {
    var t = T();
    if (siteBusy) return '<p class="rq-msg rq-msg--busy gp-site__busy">' + esc(t.siteBusy[Math.min(siteStep, t.siteBusy.length - 1)]) + '</p>';
    var out = '';
    if (state.siteErr && !state.psi) return '<p class="rq-msg rq-msg--bad">' + esc(t.siteErr) + '</p>';
    if (state.siteRes && state.siteRes.checks) out += '<ul class="gp-chks">' + checkList() + '</ul>';
    out += psiBlock();
    if (state.psiErr && state.siteRes) out += '<p class="rq-msg rq-msg--warn">' + esc(t.psiErr) + '</p>';
    return out;
  }
  function drawSiteOut() { var o = $('#gp-site-out'), b = $('#gp-site-go'); if (o) o.innerHTML = siteOut(); if (b) b.disabled = siteBusy; }
  function pickPsi(j) {
    var c = (j.lighthouseResult || {}).categories || {}, a = (j.lighthouseResult || {}).audits || {};
    var pc = function (k) { return c[k] && typeof c[k].score === 'number' ? Math.round(c[k].score * 100) : null; };
    var lcp = a['largest-contentful-paint'] || {};
    return { perf: pc('performance'), seo: pc('seo'), a11y: pc('accessibility'), bp: pc('best-practices'), lcp: lcp.displayValue || '', lcpMs: lcp.numericValue || 0 };
  }
  function bizShort() { return bizName().split(',')[0].trim().slice(0, 60); }
  function autoWebsite() {
    var r = state.siteRes, p = state.psi;
    if (!(r && r.checks) && !p) return;
    var ok = function (id) { return r && r.checks ? (r.checks.filter(function (c) { return c.id === id; })[0] || {}).ok : true; };
    var passRate = r && r.checks ? r.checks.filter(function (c) { return c.ok; }).length / r.checks.length : 1;
    var good = ok('https') && ok('mobile') && (ok('call') || ok('whatsapp')) && passRate >= 0.6 && (!p || p.perf == null || p.perf >= 50);
    state.a.website = good ? 0 : 1; state.auto.website = true;
  }
  function runSite() {
    var inp = $('#gp-site-in'), url = (inp && inp.value || '').trim();
    if (!url) { if (inp) inp.focus(); return; }
    state.site = url; state.siteRes = null; state.psi = null; state.siteErr = ''; state.psiErr = '';
    siteBusy = true; siteStep = 0; drawSiteOut();
    clearInterval(siteTimer); siteTimer = setInterval(function () { siteStep++; drawSiteOut(); }, 5500);
    var full = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    var p1 = fetch('/api/blog?view=site&u=' + encodeURIComponent(url) + '&b=' + encodeURIComponent(bizShort()))
      .then(function (r) { return r.json().then(function (j) { return r.ok ? j : Promise.reject(j.error || 'x'); }); })
      .then(function (j) { state.siteRes = j; }, function () { state.siteErr = 'x'; });
    var p2 = fetch(PSI + '?url=' + encodeURIComponent(full) + '&strategy=mobile&locale=en&category=performance&category=seo&category=accessibility&category=best-practices')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) { state.psi = pickPsi(j); }, function () { state.psiErr = 'x'; });
    Promise.all([p1, p2]).then(function () {
      siteBusy = false; clearInterval(siteTimer);
      autoWebsite();
      refresh(true);
      var o = $('#gp-site'); if (o && o.getBoundingClientRect().top < 0) o.scrollIntoView({ block: 'start' });
      say(state.psi && state.psi.perf != null ? T().speed + ': ' + state.psi.perf + '/100' : (state.siteRes ? T().webRep : T().siteErr));
    });
  }
  function webReport() {
    var t = T(), r = state.siteRes, p = state.psi;
    if (!(r && r.checks) && !p) return '';
    var bad = r && r.checks ? r.checks.filter(function (c) { return !c.ok; }) : [];
    var good = r && r.checks ? r.checks.filter(function (c) { return c.ok; }) : [];
    if (p && p.perf != null && p.perf < 50) bad.unshift({ id: 'speed' });
    var fixLi = bad.map(function (c) {
      if (c.id === 'speed') return '<li><b>' + esc(t.speed) + ': ' + p.perf + '/100</b> ' + esc(state.lang === 'hi' ? 'Images chhoti kijiye (WebP), bhaari plugins hataiye aur achhi hosting lijiye. Phone par site 2.5 second mein khulni chahiye.' : 'Compress images (WebP), remove heavy plugins and use good hosting. The page should load in under 2.5 s on a phone.') + '</li>';
      return SITE[c.id] ? '<li><b>' + esc(L(SITE[c.id][0])) + '</b> ' + esc(L(SITE[c.id][1])) + '</li>' : '';
    }).join('');
    return '<div class="gp-web"><h3 class="gp-rep__h">' + esc(t.webRep) + (r && r.url ? ' <small>' + esc(r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</small>' : '') + '</h3>' + psiBlock() +
      (fixLi ? '<p class="gp-fix__k">' + esc(t.webFix) + '</p><ol class="gp-web__fix">' + fixLi + '</ol>' : '') +
      (good.length ? '<p class="gp-fix__k">' + esc(t.webOk) + '</p><ul class="gp-chks gp-chks--ok">' + checkList(true) + '</ul>' : '') +
      '<a class="tlink gp-fix__a" href="/services/website-design-mumbai">' + esc(state.lang === 'hi' ? 'U Scale fast local business websites banata hai' : 'U Scale builds fast websites for local businesses') + ' <span aria-hidden="true">→</span></a></div>';
  }

  /* ---------- side panel + mobile bar ---------- */
  var side = $('#gp-side'), mbar = $('#gp-mbar'), report = $('#gp-report'), live = $('#gp-live');
  function drawSide() {
    var s = score(), t = T(), left = Q.length - s.n, done = left === 0;
    var col = done ? tone(s.pts) : '#63B849';
    side.innerHTML = '<p class="gp-side__k">' + (done ? t.yours : t.soFar) + '</p>' + gauge(s.pts, false, col) +
      '<p class="gp-side__g" style="color:' + (done ? tone(s.pts) : 'var(--violet)') + '">' + (done ? esc(grade(s.pts)) : s.n ? esc(fill(t.keep, { n: left })) : '&nbsp;') + '</p>' +
      '<div class="gp-prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + Q.length + '" aria-valuenow="' + s.n + '" aria-label="' + esc(fill(t.progress, { n: s.n, t: Q.length })) + '"><i style="width:' + (s.n / Q.length * 100) + '%"></i></div>' +
      '<p class="gp-side__p">' + esc(fill(t.progress, { n: s.n, t: Q.length })) + '</p>' +
      '<div class="gp-bars">' + bars(s.by, !done) + '</div>' +
      '<button type="button" class="btn btn--go gp-see" data-gp-see' + (s.n ? '' : ' disabled') + '>' + esc(t.see) + '</button>' +
      (done ? '' : '<p class="gp-side__more">' + esc(fill(t.more, { n: left })) + '</p>');
    mbar.innerHTML = '<span class="gp-mbar__s" style="background:' + (done ? tone(s.pts) : '#4E9A2E') + '">' + s.pts + '</span><span class="gp-mbar__t"><b>' + (done ? t.yours : t.soFar) + '</b><small>' + esc(fill(t.progress, { n: s.n, t: Q.length })) + '</small></span>' +
      '<button type="button" class="btn btn--go rq-btn-sm" data-gp-see' + (s.n ? '' : ' disabled') + '>' + esc(t.see) + '</button>';
  }

  /* ---------- report ---------- */
  var plural = function (n, w) { return n + ' ' + (n === 1 ? w[0] : w[1]); };
  function duration(weeks) {
    var t = T();
    if (weeks <= 10) return plural(Math.max(1, Math.ceil(weeks)), t.wk);
    if (weeks <= 104) return plural(Math.max(1, Math.round(weeks / 4.345)), t.mo);
    return plural(Math.round(weeks / 52.18 * 2) / 2, t.yr);
  }
  function paceDefault() { var r = state.a.recent; return r === undefined ? '' : String(['2', '0.5', '0.25'][+r] || ''); }
  function calcHtml() {
    var t = T(), R = parseFloat(state.a.rating), N = parseInt(state.a.count, 10), tg = +state.target, out = [];
    if (isFinite(N) && N === 0) out.push(t.first);
    else if (isFinite(R) && isFinite(N) && N > 0) {
      if (R >= tg) out.push(fill(t.have, { t: tg.toFixed(1) }));
      else { var x = Math.ceil(N * (tg - R) / (5 - tg)); out.push(fill(t.need, { x: x, t: tg.toFixed(1) })); }
    }
    var C = parseInt(state.comp, 10), w = parseFloat(state.pace || paceDefault());
    if (isFinite(C) && C > 0 && isFinite(N)) {
      var g = C - N;
      if (g <= 0) out.push(t.ahead);
      else {
        out.push(fill(t.gap, { c: C, g: g }));
        out.push(isFinite(w) && w > 0 ? fill(t.weeks, { w: w, k: duration(g / w) }) : t.noPace);
        var fast = Math.max(5, isFinite(w) ? w * 3 : 5);
        if (!(isFinite(w) && w >= 5)) out.push(fill(t.faster, { w: fast, k: duration(g / fast) }));
      }
    }
    return out.map(function (l) { return '<p>' + l + '</p>'; }).join('');
  }
  function bizName() { return (state.name || '').trim(); }
  function reportText() {
    var t = T(), s = score(), fx = fixes().slice(0, 5);
    var web = state.psi && state.psi.perf != null ? 'Website: ' + (state.siteRes && state.siteRes.url ? state.siteRes.url + ' · ' : '') + t.speed + ' ' + state.psi.perf + '/100, SEO ' + state.psi.seo + '/100' : '';
    return [t.waIntro, bizName() ? t.waBiz + ': ' + bizName() : '', t.waScore + ': ' + s.pts + '/100 (' + grade(s.pts) + ')', web, t.waFix + ':']
      .concat(fx.map(function (f, i) { return (i + 1) + ') ' + L(f.q.fix.t); })).filter(Boolean).join('\n');
  }
  function drawReport() {
    var t = T(), s = score(), fx = fixes(), by = s.by;
    var ranked = SECS.slice().sort(function (a, b) { return by[b.id].got / by[b.id].max - by[a.id].got / by[a.id].max; });
    var sum = fill(t.sum.strong, { a: L([ranked[0].en, ranked[0].hi]).toLowerCase() }) + ' ' + fill(t.sum.weak, { b: L([ranked[3].en, ranked[3].hi]).toLowerCase() });
    var fixHtml = fx.length ? fx.slice(0, 6).map(function (f, i) {
      var q = f.q, x = q.fix, link = x.link ? '<a class="tlink gp-fix__a" href="' + x.link[0] + (x.link[0].charAt(0) === '/' && state.link ? '?link=' + encodeURIComponent(state.link) : '') + '"' + (x.link[0].charAt(0) === '/' ? '' : ' target="_blank" rel="noopener"') + '>' + esc(state.lang === 'hi' ? x.link[2] : x.link[1]) + ' <span aria-hidden="true">→</span></a>' : '';
      return '<li class="gp-fix"><div class="gp-fix__hd"><span class="gp-fix__i" aria-hidden="true">' + (i + 1) + '</span><h4>' + esc(L(x.t)) + '</h4><span class="gp-fix__p">' + esc(fill(t.gain, { p: Math.round(f.lost) })) + '</span></div>' +
        '<p class="gp-fix__why">' + esc(L(x.why)) + '</p><p class="gp-fix__k">' + esc(t.steps) + '</p><ol>' + x.st.map(function (st) { return '<li>' + esc(L(st)) + '</li>'; }).join('') + '</ol>' + link + '</li>';
    }).join('') : '';
    var targets = [4.0, 4.2, 4.3, 4.5, 4.7, 4.8].map(function (v) { return '<option value="' + v + '"' + (+state.target === v ? ' selected' : '') + '>' + v.toFixed(1) + ' ★</option>'; }).join('');
    report.innerHTML =
      '<div class="gp-rep__hd"><div class="gp-rep__gauge">' + gauge(s.pts, true) + '</div><div class="gp-rep__sum">' +
        '<p class="eyebrow">' + esc(bizName() || t.yourBiz) + '</p><h3 class="gp-rep__g" style="color:' + tone(s.pts) + '">' + esc(grade(s.pts)) + '</h3><p class="gp-rep__s">' + esc(sum) + '</p>' +
        '<div class="gp-bars gp-bars--wide">' + bars(by) + '</div></div></div>' +
      '<h3 class="gp-rep__h">' + esc(t.top) + '</h3>' + (fx.length ? '<p class="gp-manage"><b>' + esc(t.where) + '</b> ' + esc(L([MANAGE.en, MANAGE.hi])) + '</p><ol class="gp-fixes">' + fixHtml + '</ol>' : '<p class="gp-all">' + esc(t.all) + '</p>') +
      webReport() +
      '<div class="gp-calc" id="gp-calc"><h3 class="gp-rep__h">' + esc(t.calcT) + '</h3><p class="gp-calc__l">' + esc(t.calcL) + '</p>' +
        '<div class="gp-calc__in">' +
          '<label><span>' + esc(t.rating) + '</span><input class="rq-input" type="number" inputmode="decimal" min="1" max="5" step="0.1" data-gp-calc="rating" value="' + esc(state.a.rating != null ? state.a.rating : '') + '" placeholder="4.3"></label>' +
          '<label><span>' + esc(t.count) + '</span><input class="rq-input" type="number" inputmode="numeric" min="0" data-gp-calc="count" value="' + esc(state.a.count != null ? state.a.count : '') + '" placeholder="87"></label>' +
          '<label><span>' + esc(t.target) + '</span><select class="rq-select" data-gp-calc="target">' + targets + '</select></label>' +
          '<label><span>' + esc(t.comp) + '</span><input class="rq-input" type="number" inputmode="numeric" min="0" data-gp-calc="comp" value="' + esc(state.comp) + '" placeholder="240"></label>' +
          '<label><span>' + esc(t.pace) + '</span><input class="rq-input" type="number" inputmode="decimal" min="0" step="0.5" data-gp-calc="pace" value="' + esc(state.pace || paceDefault()) + '" placeholder="2"></label>' +
        '</div><div class="gp-calc__out" id="gp-calc-out" aria-live="polite">' + calcHtml() + '</div></div>' +
      '<div class="gp-acts"><button type="button" class="btn btn--go" data-gp-send>' + esc(t.send) + '</button><button type="button" class="btn btn--ink" data-gp-pdf>' + esc(t.pdf) + '</button>' +
        '<button type="button" class="btn btn--line" data-gp-copy>' + esc(t.copy) + '</button><button type="button" class="tlink rq-linkbtn" data-gp-reset>' + esc(t.reset) + '</button></div>' +
      '<div class="gp-cta"><div><h3>' + esc(t.cta) + '</h3><p>' + esc(t.ctaL) + '</p></div><button type="button" class="btn btn--go" data-gp-send>' + esc(t.send) + ' <span class="arw" aria-hidden="true"><b>↗</b><b>↗</b></span></button></div>';
  }

  /* ---------- find the business: live Google listing + nearby competition (Google's free Maps embed) ---------- */
  var linkIn = $('#gp-link'), nameIn = $('#gp-name'), typeIn = $('#gp-type'), linkMsg = $('#gp-link-msg'), liveBox = $('#gp-map'), resolved = {};
  function placeName(url) { var m = String(url).match(/\/maps\/place\/([^/@?#]+)/); if (!m) return ''; try { return decodeURIComponent(m[1].replace(/\+/g, ' ')).trim(); } catch (e) { return m[1].replace(/\+/g, ' '); } }
  function coordsFrom(url) { var u = String(url), m = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/); return m ? { lat: +(+m[1]).toFixed(6), lng: +(+m[2]).toFixed(6) } : null; }
  function setMsg(txt, kind) { linkMsg.textContent = txt || ''; linkMsg.className = 'rq-msg' + (kind ? ' rq-msg--' + kind : ''); }
  /* read the Maps link: name + coordinates (short links are expanded by our server) */
  function readLink(done) {
    var raw = (state.link || '').trim(), t = T();
    if (!raw) { state.place = null; setMsg(''); return done && done(); }
    var s = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw, u;
    try { u = new URL(s); } catch (e) { setMsg(t.badLink, 'bad'); return done && done(); }
    var host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (!(/(^|\.)google\.[a-z.]+$/.test(host) || ['maps.app.goo.gl', 'goo.gl', 'g.page', 'g.co', 'share.google'].indexOf(host) >= 0)) { setMsg(t.badLink, 'bad'); return done && done(); }
    var apply = function (name, url) {
      state.place = { name: name || '', url: s, at: coordsFrom(url || s) };
      if (name && !state.name) { state.name = name.slice(0, 80); nameIn.value = state.name; }
      if (name) setMsg(fill(t.found, { n: name }), 'ok'); else setMsg('');
      save(); if (done) done();
    };
    var nm = placeName(s);
    if (nm || coordsFrom(s)) return apply(nm, s);
    var key = u.toString(), r = resolved[key];
    if (r && r !== 'busy') return apply(r === 'fail' ? '' : r.name, r === 'fail' ? '' : r.url);
    if (r === 'busy') return;
    resolved[key] = 'busy'; setMsg(t.finding, 'busy');
    fetch('/api/blog?view=maplink&u=' + encodeURIComponent(key)).then(function (x) { return x.ok ? x.json() : Promise.reject(); })
      .then(function (j) { resolved[key] = { name: j.name || '', url: j.url || '' }; }, function () { resolved[key] = 'fail'; })
      .then(function () { if ((state.link || '').trim() === raw) readLink(done); });
  }
  var embed = function (q, at, z) { return 'https://maps.google.com/maps?hl=' + (state.lang === 'hi' ? 'hi' : 'en') + '&q=' + encodeURIComponent(q) + (at ? '&ll=' + at.lat + ',' + at.lng : '') + '&z=' + z + '&output=embed'; };
  function showLive() {
    var t = T(), name = (state.place && state.place.name) || bizName(), at = state.place && state.place.at;
    if (!name && !at) { setMsg(t.needName, 'warn'); nameIn.focus(); return; }
    var q = name || (at.lat + ',' + at.lng), area = bizName().indexOf(',') > 0 ? bizName().split(',').slice(1).join(',').trim() : '';
    var open = state.place && state.place.url ? state.place.url : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
    var ty = (state.type || '').trim(), near = area || (at ? '' : name);
    var compQ = ty ? ty + (near ? ' near ' + near : '') : '';
    var compOpen = compQ ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(compQ + (at && !near ? ' near ' + at.lat + ',' + at.lng : '')) : '';
    var tab = state.mapTab === 'near' ? 'near' : 'me';
    var src = tab === 'me' ? embed(q, at, 17) : compQ ? embed(compQ, at, 15) : '';
    var note = tab === 'me' ? t.liveNote : compQ ? fill(t.compNote, { t: ty }) : t.compNeed;
    var btn = tab === 'me' ? '<a class="btn btn--line rq-btn-sm" href="' + esc(open) + '" target="_blank" rel="noopener">' + esc(t.openMaps) + ' <span aria-hidden="true">↗</span></a>'
      : compQ ? '<a class="btn btn--line rq-btn-sm" href="' + esc(compOpen) + '" target="_blank" rel="noopener">' + esc(t.compOpen) + ' <span aria-hidden="true">↗</span></a>' : '';
    liveBox.innerHTML =
      '<div class="gp-tabs" role="tablist" aria-label="' + esc(t.live) + '">' +
        '<button type="button" role="tab" data-gp-tab="me" aria-selected="' + (tab === 'me') + '">' + esc(t.tabMe) + '</button>' +
        '<button type="button" role="tab" data-gp-tab="near" aria-selected="' + (tab === 'near') + '">' + esc(t.tabNear) + '</button></div>' +
      '<p class="gp-live__note">' + esc(note) + '</p>' +
      (src ? '<iframe title="' + esc(tab === 'me' ? t.live : t.compT) + '" src="' + esc(src) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' : '<div class="gp-live__empty"><p>' + esc(t.compNeed) + '</p></div>') +
      '<div class="gp-live__act">' + btn + '</div>';
    liveBox.hidden = false; state.liveOn = true; save();
  }

  /* ---------- render ---------- */
  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
  function refresh(full) {
    if (full) drawQuestions();
    $$('.gp-q').forEach(function (fs) {
      var q = Q.filter(function (x) { return 'gp-q-' + x.id === fs.id; })[0], f = frac(q, state.a[q.id]), chip = fs.querySelector('[data-gp-pts]');
      fs.setAttribute('data-done', String(f !== null));
      if (!chip) return;
      var txt = f === null ? '' : '+' + Math.round(q.w * f) + ' / ' + q.w;
      if (chip.textContent !== txt) { chip.textContent = txt; chip.className = 'gp-pts' + (f === null ? '' : f >= 0.99 ? ' gp-pts--top' : f > 0 ? ' gp-pts--mid' : ' gp-pts--low'); if (txt && !full) { chip.classList.remove('is-pop'); void chip.offsetWidth; chip.classList.add('is-pop'); } }
    });
    secHeads();
    drawSide();
    report.hidden = !state.shown;
    if (state.shown) drawReport();
    root.classList.toggle('gp--done', state.shown);
    save();
  }
  function setLang(l) {
    state.lang = l;
    $$('input[name="gp-lang"]').forEach(function (r) { r.checked = r.value === l; });
    document.querySelectorAll('[data-gp-lang]').forEach(function (el) { el.hidden = el.getAttribute('data-gp-lang') !== l; });
    readLink(); if (state.liveOn) showLive(); refresh(true);
  }

  /* ---------- events ---------- */
  root.addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'gp-lang') { setLang(el.value); return; }
    var qid = el.getAttribute('data-gp-q');
    if (qid) {
      var q0 = Q.filter(function (x) { return x.id === qid; })[0], wasDone = secStat(q0.s).complete;
      state.a[qid] = +el.value;
      if (state.auto[qid]) { delete state.auto[qid]; refresh(true); } else refresh();
      /* section just completed: open the next one; otherwise bring the next unanswered question into view */
      if (!wasDone && secStat(q0.s).complete) {
        celebrate(q0.s);
        var si = SECS.map(function (x) { return x.id; }).indexOf(q0.s), nx = SECS.slice(si + 1).filter(function (x) { return !secStat(x.id).complete; })[0];
        setTimeout(function () { if (nx) openSec(nx.id, true); else { openSec('', false); showReport(); } }, 450);
        return;
      }
      var all = $$('.gp-q'), at = all.indexOf(el.closest('.gp-q'));
      var next = all.slice(at + 1).filter(function (f) { return f.getAttribute('data-done') !== 'true' && f.offsetParent; })[0];
      if (next && next.getBoundingClientRect().top > window.innerHeight * 0.78) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var c = el.getAttribute('data-gp-calc');
    if (c === 'target') { state.target = +el.value; $('#gp-calc-out').innerHTML = calcHtml(); save(); }
  });
  root.addEventListener('input', function (e) {
    var el = e.target, n = el.getAttribute('data-gp-num'), c = el.getAttribute('data-gp-calc');
    if (n) {
      var q = Q.filter(function (x) { return x.id === n; })[0], v = el.value.trim();
      if (v === '' || !isFinite(+v) || +v < 0 || +v > q.max) delete state.a[n]; else state.a[n] = v;
      el.setAttribute('aria-invalid', String(v !== '' && state.a[n] === undefined));
      if (n === 'count') { var ri = $('#gp-in-rating'); if (ri) { ri.disabled = noReviews(); ri.placeholder = noReviews() ? '–' : '4.3'; } }
      refresh();
      return;
    }
    if (c && c !== 'target') {
      var val = el.value.trim();
      if (c === 'rating' || c === 'count') { var qq = Q.filter(function (x) { return x.id === c; })[0]; if (val === '' || !isFinite(+val) || +val < 0 || +val > qq.max) delete state.a[c]; else state.a[c] = val; var inp = $('#gp-in-' + c); if (inp) inp.value = val; drawSide(); }
      else state[c] = val;
      $('#gp-calc-out').innerHTML = calcHtml(); save();
    }
  });
  var linkTimer = 0;
  linkIn.addEventListener('input', function () { state.link = linkIn.value; clearTimeout(linkTimer); linkTimer = setTimeout(function () { readLink(); }, 300); });
  nameIn.addEventListener('input', function () { state.name = nameIn.value; save(); if (state.shown) drawReport(); });
  typeIn.addEventListener('input', function () { state.type = typeIn.value; save(); });
  $('#gp-show').addEventListener('click', function () { readLink(showLive); });
  [nameIn, typeIn].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); readLink(showLive); } }); });
  root.addEventListener('keydown', function (e) { if (e.target.id === 'gp-site-in' && e.key === 'Enter') { e.preventDefault(); runSite(); } });

  function showReport() {
    state.shown = true; refresh();
    report.focus({ preventScroll: true });
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var s = score(); say(T().yours + ': ' + s.pts + ' / 100. ' + grade(s.pts));
  }
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-gp-see]')) { showReport(); return; }
    if (e.target.closest('#gp-site-go')) { runSite(); return; }
    var sh = e.target.closest('[data-gp-sec]');
    if (sh) { var id = sh.getAttribute('data-gp-sec'); openSec(state.open === id ? '' : id, state.open !== id); return; }
    var nb = e.target.closest('[data-gp-next]');
    if (nb) { var to = nb.getAttribute('data-gp-next'); if (to) openSec(to, true); else showReport(); return; }
    var tb = e.target.closest('[data-gp-tab]');
    if (tb) { state.mapTab = tb.getAttribute('data-gp-tab'); showLive(); return; }
    if (e.target.closest('[data-gp-send]')) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(reportText()), '_blank', 'noopener'); return; }
    if (e.target.closest('[data-gp-pdf]')) { document.body.classList.add('gp-printing'); window.print(); return; }
    var cp = e.target.closest('[data-gp-copy]');
    if (cp) {
      var txt = reportText() + '\n\n' + fixes().slice(0, 6).map(function (f, i) { return (i + 1) + '. ' + L(f.q.fix.t) + '\n' + f.q.fix.st.map(function (s) { return '   - ' + L(s); }).join('\n'); }).join('\n\n') + '\n\nhttps://uscale.in/tools/google-business-profile-checker';
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { var o = cp.textContent; cp.textContent = T().copied; say(T().copied); setTimeout(function () { cp.textContent = o; }, 1600); }, function () { say('Copy failed'); });
      return;
    }
    if (e.target.closest('[data-gp-reset]')) {
      if (!window.confirm(T().resetQ)) return;
      state.a = {}; state.auto = {}; state.comp = ''; state.pace = ''; state.shown = false; state.siteRes = null; state.psi = null; state.open = 'basics'; refresh(true);
      $('#gp-start').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('gp-printing'); });

  /* show the mobile bar only while the questions are on screen */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { mbar.classList.toggle('is-on', en.isIntersecting); document.body.classList.toggle('gp-bar-on', en.isIntersecting && !state.shown); }); }, { rootMargin: '0px 0px -40% 0px' });
    io.observe(qsBox);
  }

  /* init */
  nameIn.value = state.name; linkIn.value = state.link; typeIn.value = state.type || '';
  if (!state.auto) state.auto = {};
  setLang(state.lang);
})();
