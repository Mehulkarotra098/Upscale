// Scores a Google Business Profile out of 100 from its public Google data and the competition nearby.
// This is U Scale's own checklist (the same areas as the free checker), not a score Google publishes.
// Pure functions only: no network, so it is easy to test and reuse in the report page, the daily outreach batch
// and the WhatsApp bot.

const GENERIC = new Set(['store', 'point_of_interest', 'establishment', 'service', 'premise', 'food', 'health']);
const DAY = 86_400_000;

/** Indian mobile number as 10 digits ("9820012345"), or '' for landlines, toll-free and anything unparsable. */
export function indianMobile(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}

export const grade = (pts) =>
  pts >= 80 ? 'strong' : pts >= 60 ? 'gaps' : pts >= 40 ? 'work' : 'losing';

export const GRADES = {
  strong: { en: 'Strong profile', hi: 'Shandaar profile' },
  gaps: { en: 'Good, with a few gaps', hi: 'Achha hai, thodi kami hai' },
  work: { en: 'Needs work', hi: 'Kaafi kaam baaki hai' },
  losing: { en: 'Losing customers to competitors', hi: 'Customers competitors ke paas ja rahe hain' },
};

/** Newest review date we can see (Google returns up to 5 "most relevant" reviews, so this is a lower bound). */
function newestReview(place) {
  const times = (place.reviews || []).map((r) => Date.parse(r.publishTime)).filter(Number.isFinite);
  return times.length ? Math.max(...times) : null;
}

/**
 * @param {object} place Places API (New) place (see places.js DETAIL_FIELDS)
 * @param {Array<{id,name,rating,reviews}>} nearbyList same-type businesses nearby, most popular first (may include the place itself)
 * @param {number} [now]
 */
export function scorePlace(place, nearbyList = [], now = Date.now()) {
  const name = place.displayName?.text || 'Your business';
  const count = Number(place.userRatingCount) || 0;
  const rating = Number(place.rating) || 0;
  const photos = (place.photos || []).length; // the API returns at most 10
  const hours = (place.regularOpeningHours?.weekdayDescriptions || []).length > 0;
  const phone = Boolean(place.nationalPhoneNumber || place.internationalPhoneNumber);
  const website = Boolean(place.websiteUri);
  const specific = Boolean(place.primaryType) && !GENERIC.has(place.primaryType);
  const newest = newestReview(place);
  const ageDays = newest ? Math.floor((now - newest) / DAY) : null;

  const rank = nearbyList.findIndex((p) => p.id === place.id) + 1; // 0 = not among the most popular nearby
  const others = nearbyList.filter((p) => p.id !== place.id);
  const byReviews = [...others].sort((a, b) => b.reviews - a.reviews);
  const bar = Math.max(30, byReviews[2]?.reviews || byReviews[0]?.reviews || 30); // the 3rd best-reviewed rival
  const leaders = others.slice(0, 3);

  const parts = [
    { id: 'count', max: 18, got: 18 * Math.min(1, count / bar) },
    { id: 'rating', max: 15, got: rating >= 4.6 ? 15 : rating >= 4.3 ? 11 : rating >= 4.0 ? 7 : rating >= 3.5 ? 3 : 0 },
    { id: 'recent', max: 10, got: ageDays == null ? 0 : ageDays <= 30 ? 10 : ageDays <= 90 ? 6 : ageDays <= 180 ? 3 : 0 },
    { id: 'volume', max: 7, got: count >= 50 ? 7 : count >= 20 ? 4 : count >= 5 ? 2 : 0 },
    { id: 'photos', max: 12, got: 12 * Math.min(1, photos / 10) },
    { id: 'rank', max: 13, got: rank && rank <= 3 ? 13 : rank && rank <= 7 ? 8 : rank && rank <= 12 ? 4 : 0 },
    { id: 'website', max: 7, got: website ? 7 : 0 },
    { id: 'hours', max: 6, got: hours ? 6 : 0 },
    { id: 'category', max: 6, got: specific ? 6 : 0 },
    { id: 'phone', max: 6, got: phone ? 6 : 0 },
  ];
  const pts = Math.round(parts.reduce((s, p) => s + p.got, 0));

  const gap = Math.max(0, bar - count);
  const leaderName = byReviews[2]?.name || byReviews[0]?.name || '';
  const FIX = {
    count: gap > 0 && {
      en: leaderName
        ? `Get about ${gap} more reviews to catch up with ${leaderName} (${bar} reviews). Ask every customer, with a QR code at the counter.`
        : `Get about ${gap} more reviews. Ask every customer, with a QR code at the counter.`,
      hi: leaderName
        ? `${leaderName} ke ${bar} reviews tak pahunchne ke liye lagbhag ${gap} aur reviews chahiye. Har customer se maangiye, counter par QR code rakhiye.`
        : `Lagbhag ${gap} aur reviews chahiye. Har customer se maangiye, counter par QR code rakhiye.`,
    },
    rating: rating > 0 && rating < 4.3 && {
      en: `Your rating is ${rating.toFixed(1)}. Reply to every review, fix what people complain about, and ask happy customers to review.`,
      hi: `Aapki rating ${rating.toFixed(1)} hai. Har review ka jawab dijiye, shikayaton ko theek kijiye, aur khush customers se review maangiye.`,
    },
    recent: (ageDays == null || ageDays > 30) && {
      en: 'We couldn’t see a review from the last month. Customers trust fresh reviews: ask this week’s customers.',
      hi: 'Pichhle mahine ka koi review nahi dikha. Customers naye reviews par bharosa karte hain: is hafte ke customers se maangiye.',
    },
    volume: false,
    photos: photos < 10 && {
      en: `Only ${photos} photo${photos === 1 ? '' : 's'} on the listing. Add at least 10 real ones: shop front, inside, your work and your team.`,
      hi: `Listing par sirf ${photos} photo hain. Kam se kam 10 asli photos daaliye: dukaan ka bahar, andar, aapka kaam aur team.`,
    },
    rank: (!rank || rank > 3) && {
      en: rank
        ? `You’re #${rank} of ${nearbyList.length} similar businesses nearby on Google. The top 3 get most of the calls.`
        : `You’re not in Google’s top ${nearbyList.length || 20} similar businesses nearby. The top 3 get most of the calls.`,
      hi: rank
        ? `Google par aas-paas ke ${nearbyList.length} businesses mein aap #${rank} par hain. Zyadatar calls top 3 ko milti hain.`
        : `Google par aas-paas ke top ${nearbyList.length || 20} businesses mein aap nahi dikhte. Zyadatar calls top 3 ko milti hain.`,
    },
    website: !website && {
      en: 'No website on the listing. A simple site with your services, prices and a WhatsApp button turns searchers into enquiries.',
      hi: 'Listing par website nahi hai. Services, prices aur WhatsApp button wali simple website se search karne wale customers ban jaate hain.',
    },
    hours: !hours && {
      en: 'Opening hours are missing. Google shows “hours unknown”, and people go to a shop that shows it’s open.',
      hi: 'Timing nahi daala hai. Google “hours unknown” dikhata hai, aur log khuli dikhne wali dukaan chun lete hain.',
    },
    category: !specific && {
      en: 'The main category is too general. Pick the most specific one, like “Beauty salon” instead of “Store”.',
      hi: 'Main category bahut general hai. Sabse specific chuniye, jaise “Store” ki jagah “Beauty salon”.',
    },
    phone: !phone && {
      en: 'No phone number on the listing. Add a mobile number that’s on WhatsApp.',
      hi: 'Listing par phone number nahi hai. WhatsApp wala mobile number daaliye.',
    },
  };
  const fixes = parts
    .map((p) => ({ id: p.id, gain: Math.round(p.max - p.got), text: FIX[p.id] }))
    .filter((f) => f.text && f.gain > 0)
    .sort((a, b) => b.gain - a.gain);

  return {
    name,
    pts,
    grade: grade(pts),
    parts: parts.map((p) => ({ ...p, got: Math.round(p.got) })),
    fixes,
    facts: { count, rating, photos, hours, phone, website, specific, ageDays, rank, nearby: nearbyList.length, bar },
    leaders,
  };
}
