// Who U Scale is, for the Node side (blog structured data, bot, admin). Mirrors source/entity.json, which the static
// site build reads; test/unit/entity.test.js fails if the two ever differ. Edit both together.
export default Object.freeze({
  _about:
    "Single source of truth for who U Scale is, used in every page's structured data, llms.txt and the blog. Keep it identical to the Google Business Profile and directory listings (same name, phone, area). Add a profile URL to sameAs only once it is live and public. server/entity.js mirrors this file for the Node side; test/unit/entity.test.js keeps them equal.",
  name: 'U Scale by Mehul Karotra',
  alternateName: ['U Scale', 'uscale'],
  description:
    'Freelance web design, development and digital marketing in Mumbai by Mehul Karotra: an independent, contract-based alternative to a digital marketing agency. Websites, SEO, social media, Google and Meta ads and AI search visibility, with every price published.',
  disambiguatingDescription:
    'The independent web design and digital marketing practice of Mehul Karotra, based in Mumbai and working with businesses across India, at uscale.in.',
  slogan: 'Agency-quality work, without the agency.',
  foundingDate: '2026',
  phone: '+91-79773-60142',
  phoneDisplay: '+91 79773 60142',
  whatsapp: '917977360142',
  email: 'uscalewithus@gmail.com',
  base: 'Mumbai',
  priceRange: '₹800 – ₹1,50,000',
  address: {
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  areaServed: ['Mumbai', 'Thane', 'Navi Mumbai'],
  languages: ['English', 'Hindi'],
  sameAs: ['https://www.instagram.com/uscalewithus/'],
  founder: {
    name: 'Mehul Karotra',
    givenName: 'Mehul',
    familyName: 'Karotra',
    jobTitle: 'Founder of U Scale; freelance website designer, developer and digital marketer',
    sameAs: ['https://www.linkedin.com/in/mehulkarotra/', 'https://github.com/Mehulkarotra098', 'https://mehulpatel.vercel.app/'],
    image: 'assets/pages/mehul-karotra-website-designer-ghatkopar.webp',
  },
});
