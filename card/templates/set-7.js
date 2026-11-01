// Fourteen cards for working professionals in India: each is one clear idea drawn from that person's own world,
// held by a calm grid, so a real doctor, CA, advocate or architect would print it. Built on stacks, so real details fit.
import { A, B, E, H, L, LN, LOGO, QR, R, T, W } from './kit.js';

// A vertical card is the horizontal one turned on its side.
const VW = H;
const VH = W;

const n = (v) => String(Math.round(v * 100) / 100);
const poly = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
const open = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}`;
const circle = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** A Greek cross that fills a square of side `s` around its centre, with arms `arm` wide. */
function greekCross(cx, cy, s, arm) {
  const a = arm / 2;
  const o = s / 2;
  return poly([
    [cx - a, cy - o],
    [cx + a, cy - o],
    [cx + a, cy - a],
    [cx + o, cy - a],
    [cx + o, cy + a],
    [cx + a, cy + a],
    [cx + a, cy + o],
    [cx - a, cy + o],
    [cx - a, cy + a],
    [cx - o, cy + a],
    [cx - o, cy - a],
    [cx - a, cy - a],
  ]);
}

/** The smile line: lowest in the middle of the card, rising gently to both edges. */
const smileY = (x, mid, rise, w) => mid - rise * (1 - Math.cos((Math.PI * (x - w / 2)) / (w + 8)));
const smilePts = (mid, rise, w) =>
  Array.from({ length: 29 }, (_, k) => {
    const x = -B + ((w + 2 * B) * k) / 28;
    return [x, smileY(x, mid, rise, w)];
  });
/** Everything below or above the smile line, as a filled shape running off the card. */
const smileFill = (mid, rise, w, h, below = true) => {
  const edge = below ? h + B : -B;
  return poly([...smilePts(mid, rise, w), [w + B, edge], [-B, edge]]);
};
/** An orthodontist's arch wire: small square brackets sitting on one fine line. */
function bracketsOn(mid, rise, w, count, size) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = (w * (i + 0.5)) / count;
    const y = smileY(x, mid, rise, w);
    const slope = smileY(x + 0.05, mid, rise, w) - y;
    const a = Math.atan2(slope, 0.05);
    const [c, t] = [Math.cos(a), Math.sin(a)];
    const q = size / 2;
    const at = (u, v) => [x + u * c - v * t, y + u * t + v * c];
    d += poly([at(-q, -q), at(q, -q), at(q, q), at(-q, q)]);
  }
  return d;
}

/** Looking down a corridor: nested frames drawing towards a door at the far end. */
function corridor([ox, oy, ow, oh], [ix, iy, iw, ih], steps) {
  let d = '';
  const box = (x, y, w, h) => `M${n(x)} ${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
  for (let i = 1; i < steps; i++) {
    const t = 1 - 1 / (1 + (i * 2.2) / steps) ** 1.6;
    const k = t / (1 - 1 / (1 + 2.2) ** 1.6);
    d += box(ox + (ix - ox) * k, oy + (iy - oy) * k, ow + (iw - ow) * k, oh + (ih - oh) * k);
  }
  const corners = [
    [ox, oy, ix, iy],
    [ox + ow, oy, ix + iw, iy],
    [ox + ow, oy + oh, ix + iw, iy + ih],
    [ox, oy + oh, ix, iy + ih],
  ];
  for (const [a, b, c, e] of corners) d += `M${n(a)} ${n(b)}L${n(c)} ${n(e)}`;
  return d + box(ix, iy, iw, ih);
}

/** Fluted columns: fine upright lines cut into a solid shaft. */
function flutes(x, w, y0, y1, count) {
  let d = '';
  for (let i = 1; i <= count; i++) {
    const fx = x + (w * i) / (count + 1);
    d += `M${n(fx)} ${n(y0)}V${n(y1)}`;
  }
  return d;
}

/** One percentile line on a child's growth chart at position t (0 to 1). u is 0 for the lowest line, 1 for the highest. */
const growthPoint = ({ x0, x1, y0, start, lift, spread, ease }, u, t) => {
  const frac = (1 - Math.exp(-ease * t)) / (1 - Math.exp(-ease));
  return [x0 + (x1 - x0) * t, y0 - (u - 0.5) * start - (lift + spread * (u - 0.5)) * frac];
};
const growthLine = (c, u) => open(Array.from({ length: 25 }, (_, k) => growthPoint(c, u, k / 24)));

/** Thin hairlines that climb like compound interest: nearly flat for most of the way, then steep. */
function compoundBars(x0, x1, bottom, low, high, power, pitch, bar) {
  let d = '';
  for (let x = x0; x <= x1 + 0.01; x += pitch) {
    const t = (x - x0) / (x1 - x0);
    d += poly([
      [x, bottom],
      [x + bar, bottom],
      [x + bar, bottom - low - high * t ** power],
      [x, bottom - low - high * t ** power],
    ]);
  }
  return d;
}

/** Fine ticks round a dial, like the bezel of a good watch. */
function dialTicks(cx, cy, r, count, every = 5, short = 1.1, long = 2.3) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = i % every === 0 ? long : short;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    d += `M${n(cx + c * r)} ${n(cy + s * r)}L${n(cx + c * (r - len))} ${n(cy + s * (r - len))}`;
  }
  return d;
}

/** One bold wedge on the dial, pointing inwards: the direction you're heading. */
function dialMark(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  const at = (rad, off) => [cx + Math.cos(a + off) * rad, cy + Math.sin(a + off) * rad];
  return poly([at(r + 0.3, -0.05), at(r + 0.3, 0.05), at(r - 4, 0)]);
}

/** The turned page edges of an open book, seen from the end: curves that lift from the spine and fall away. */
function pageEdges(cx, base, count, reach, lift) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    for (const s of [-1, 1]) {
      const ex = cx + s * reach * (0.62 + 0.38 * u);
      const ey = base - lift * (0.18 + 0.1 * u) - lift * 0.1 * (1 - u);
      const top = base - lift * (1 - 0.62 * u);
      d += `M${n(cx)} ${n(base)}C${n(cx + s * reach * 0.06)} ${n(top - lift * 0.1)} ${n(cx + s * reach * (0.34 + 0.2 * u))} ${n(top)} ${n(ex)} ${n(ey)}`;
    }
  }
  return d;
}

/** A building's face at night, as a grid of windows. `tops` gives the first row of each column. Some are lit. */
function windowGrid(x0, y0, cols, rows, pitchX, pitchY, wW, wH, tops, seed = 7) {
  let dim = '';
  let lit = '';
  let v = seed;
  for (let c = 0; c < cols; c++) {
    for (let r = tops[c] ?? 0; r < rows; r++) {
      v = (v * 73 + 41) % 101;
      const x = x0 + c * pitchX;
      const y = y0 + r * pitchY;
      const win = poly([
        [x, y],
        [x + wW, y],
        [x + wW, y + wH],
        [x, y + wH],
      ]);
      if (v % 7 === 0) lit += win;
      else dim += win;
    }
  }
  return { dim, lit };
}

const FACADE = windowGrid(-1.2, 53.6, 20, 12, 2.8, 3.4, 1.5, 2.3, [5, 5, 5, 5, 5, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2], 7);
const FACADE_BACK = windowGrid(-1.2, 75.2, 20, 5, 2.8, 3.4, 1.5, 2.3, [], 19);

// A surveyor's plan: a road and the lots along it, with one plot picked out.
const PLOT_ROAD = 'M-3 20.2C22 20.2 40 9.4 92 9.2M-3 17.6C20 17.6 38 6.8 92 6.6';
const PLOT_LINES =
  'M30.6 13.6L28.8 -3M44 8.8L42.4 -3M56 7.2L55.4 -3M69 6.8L69.6 -3M81 6.6L82.6 -3M37 13.8L39.6 21M50 10.6L52.4 21M63 9.4L64.4 21M76 9.2L75.4 21M88 9.2L87 21';
const PLOT_GOLD = [
  [5.4, -3],
  [27.6, -3],
  [29.2, 12.4],
  [18, 15.6],
  [5.4, 16.4],
];
const PLOT_BACK =
  'M47 -3L44 15L46 40L43 54M47 -3M44 15L92 11M46 40L92 45M60 -3L60.6 13.8M74 -3L73.4 12.6M87 -3L87 11.4M58 41L57 54M72 42.3L72.6 54M86 44L85.6 54';
const PLOT_BACK_GOLD = [
  [48.4, 8.6],
  [86.4, 6.8],
  [85.8, 44],
  [49.8, 42.6],
];

const CHART_FRONT = { x0: 5, x1: 36, y0: 38.4, start: 6, lift: 17.5, spread: 12, ease: 2.2 };
const CHART_BACK = { x0: -B, x1: W + B, y0: 50, start: 9, lift: 15, spread: 13, ease: 1.1 };

const PEOPLE = {
  doctor: {
    name: 'Dr. Meera Iyengar',
    title: 'MD, Consultant Physician',
    company: 'Iyengar Family Clinic',
    tagline: 'General medicine and diabetes care',
    phone: '+91 98765 43210',
    email: 'clinic@iyengarcare.example',
    website: 'iyengarcare.example',
    address: 'Hill Road, Bandra West, Mumbai',
    hours: 'Mon to Sat, 10 am to 7 pm',
  },
  dentist: {
    name: 'Dr. Nikhil Sawant',
    title: 'BDS, MDS, Orthodontist',
    company: 'Sawant Dental Studio',
    tagline: 'Braces, aligners and family dentistry',
    phone: '+91 98765 43210',
    email: 'smile@sawantdental.example',
    website: 'sawantdental.example',
    address: 'FC Road, Shivajinagar, Pune',
    hours: '10 am to 1 pm, 4 pm to 8 pm',
  },
  paediatric: {
    name: 'Dr. Farah Siddiqui',
    title: 'MD, Consultant Paediatrician',
    company: 'Little Steps Child Clinic',
    tagline: 'Newborn care, vaccination and growth',
    phone: '+91 98765 43210',
    email: 'hello@littlesteps.example',
    website: 'littlesteps.example',
    address: 'Indiranagar 2nd Stage, Bengaluru',
    hours: 'Mon to Sat, 10 am to 8 pm',
  },
  wealth: {
    name: 'Aditi Bhatia',
    title: 'Certified Financial Planner',
    company: 'Bhatia Wealth Advisors',
    tagline: 'Long-term financial planning for families',
    phone: '+91 98765 43210',
    email: 'aditi@bhatiawealth.example',
    website: 'bhatiawealth.example',
    address: 'Nariman Point, Mumbai 400021',
  },
  advocate: {
    name: 'Adv. Vikram Deshmukh',
    title: 'Advocate, Bombay High Court',
    company: 'Deshmukh Law Chambers',
    tagline: 'Civil, property and commercial matters',
    phone: '+91 98765 43210',
    email: 'chambers@deshmukhlaw.example',
    website: 'deshmukhlaw.example',
    address: 'Fort Chambers, Mahatma Gandhi Road, Fort, Mumbai',
  },
  architect: {
    name: 'Ishaan Menon',
    title: 'Principal Architect, COA registered',
    company: 'Menon + Rao Architects',
    tagline: 'Homes, schools and small workplaces',
    phone: '+91 98765 43210',
    email: 'ishaan@menonrao.example',
    website: 'menonrao.example',
    address: 'Panampilly Nagar, Kochi',
  },
  interiors: {
    name: 'Tara Kapoor',
    title: 'Interior Designer',
    company: 'Studio Kapoor Interiors',
    tagline: 'Calm homes, made to measure',
    phone: '+91 98765 43210',
    email: 'tara@studiokapoor.example',
    website: 'studiokapoor.example',
    address: 'Jubilee Hills, Hyderabad',
  },
  builder: {
    name: 'Harshad Thakkar',
    title: 'Managing Director',
    company: 'Thakkar Developers',
    tagline: 'Residential towers in western Mumbai',
    phone: '+91 98765 43210',
    email: 'harshad@thakkardevelopers.example',
    website: 'thakkardevelopers.example',
    address: 'SV Road, Goregaon West, Mumbai',
  },
  realty: {
    name: 'Sneha Kulkarni',
    title: 'Land and Plots Consultant',
    company: 'Kulkarni Estates',
    tagline: 'NA plots and farmland near Pune',
    phone: '+91 98765 43210',
    email: 'sneha@kulkarniestates.example',
    website: 'kulkarniestates.example',
    address: 'Baner Road, Pune 411045',
  },
  sales: {
    name: 'Arjun Nair',
    title: 'Regional Sales Manager',
    company: 'Northline Logistics',
    tagline: 'Freight and warehousing across India',
    phone: '+91 98765 43210',
    email: 'arjun.nair@northline.example',
    website: 'northline.example',
    address: 'Sector 44, Gurugram',
  },
  director: {
    name: 'Kavita Rangan',
    title: 'Director, Strategy',
    company: 'Rangan Holdings',
    tagline: 'Investments in manufacturing',
    phone: '+91 98765 43210',
    email: 'kavita@ranganholdings.example',
    website: 'ranganholdings.example',
    address: 'MG Road, Bengaluru 560001',
  },
  consultant: {
    name: 'Rahul Sengupta',
    title: 'Leadership Coach and Consultant',
    company: 'Truenorth Advisory',
    tagline: 'Helping founders lead growing teams',
    phone: '+91 98765 43210',
    email: 'rahul@truenorthadvisory.example',
    website: 'truenorthadvisory.example',
    address: 'Salt Lake Sector V, Kolkata',
  },
  teacher: {
    name: 'Prof. Anjali Mathur',
    title: 'Mathematics Tutor, IIT-JEE',
    company: 'Mathur Learning Centre',
    tagline: 'Small batches for classes 9 to 12',
    phone: '+91 98765 43210',
    email: 'anjali@mathurlearning.example',
    website: 'mathurlearning.example',
    address: 'Civil Lines, Jaipur',
  },
  ca: {
    name: 'CA Rohan Khandelwal',
    title: 'Chartered Accountant, Partner',
    company: 'Khandelwal & Bhatt Associates',
    tagline: 'Audit, GST and income tax',
    phone: '+91 98765 43210',
    email: 'rohan@khandelwalbhatt.example',
    website: 'khandelwalbhatt.example',
    address: '402 Commerce House, Ashram Road, Ahmedabad 380009',
  },
};

export const SET_7 = [
  {
    id: 'quadrant-cross',
    name: 'Quadrant',
    category: 'health',
    tags: ['doctor', 'clinic', 'physician', 'hospital', 'medical', 'specialist', 'elegant', 'professional'],
    fonts: { heading: 'fraunces', body: 'dmsans' },
    palettes: [
      {
        label: 'Deep Teal',
        paper: '#FFFFFF',
        deep: '#0D3B42',
        plus: '#F3F8F7',
        ink: '#0D3B42',
        soft: '#566F73',
        rule: '#A9BFC0',
        accent: '#128C8C',
        onDeep: '#F3F8F7',
      },
      {
        label: 'Navy',
        paper: '#FCFCFA',
        deep: '#14264D',
        plus: '#F5F6F9',
        ink: '#14264D',
        soft: '#5B667F',
        rule: '#B3BACA',
        accent: '#2F62C9',
        onDeep: '#F5F6F9',
      },
      {
        label: 'Forest',
        paper: '#FBFBF6',
        deep: '#1D3C30',
        plus: '#F5F7EF',
        ink: '#1D3C30',
        soft: '#5C7065',
        rule: '#B4C0B3',
        accent: '#3E8B5F',
        onDeep: '#F5F7EF',
      },
      {
        label: 'Aubergine',
        paper: '#FEFBFA',
        deep: '#3A1C3E',
        plus: '#FBF4F4',
        ink: '#3A1C3E',
        soft: '#715F73',
        rule: '#C7B9C6',
        accent: '#A53E78',
        onDeep: '#FBF4F4',
      },
    ],
    sample: PEOPLE.doctor,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 33.5, y: 5, w: W - 33.5 - 5, h: 22, anchor: 'bottom', gap: 0.9 },
          reach: { x: 33.5, y: 31.5, w: W - 33.5 - 5, h: 15.3, anchor: 'top' },
        },
        elements: [
          LN('across', -B, 29, W + 2 * B, '$rule', 0.18),
          { id: 'down', type: 'line', x: 29, y: -B, w: 0, h: H + 2 * B, stroke: '$rule', sw: 0.18 },
          A('plus', greekCross(29, 29, 6, 1.5), { fill: '$accent' }),
          LOGO('logo', 5, 7, 18, '$deep', { fallbackWeight: 500, fallbackSize: 25 }),
          T('name', '{name}', 33.5, W - 38.5, 16, {
            stack: 'who',
            font: '$heading',
            weight: 500,
            fill: '$ink',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 33.5, W - 38.5, 7.2, { stack: 'who', fill: '$soft', minSize: 6, maxLines: 2, lineHeight: 1.22 }),
          T('company', '{company}', 33.5, W - 38.5, 7.2, {
            stack: 'who',
            weight: 600,
            fill: '$accent',
            minSize: 6,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 33.5, W - 38.5, 6.7, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 6, w: 29, h: H - 12, anchor: 'bottom', gap: 1.5 } },
        elements: [
          A('plus', greekCross(W - H / 2, H / 2, H + 2 * B + 0.1, 30), { fill: '$plus' }),
          T('company', '{company}', 6, 29, 13, {
            stack: 'brand',
            font: '$heading',
            weight: 500,
            fill: '$onDeep',
            minSize: 8.5,
            maxLines: 5,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 6, 29, 6.8, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.8,
            minSize: 5.8,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
          T('hours', '{hours}', 6, 29, 6.8, {
            stack: 'brand',
            weight: 600,
            fill: '$onDeep',
            minSize: 5.8,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', W - H / 2 - 13, H / 2 - 13, 26, { light: '$plus', dark: '#0B1414' }),
        ],
      },
    },
  },
  {
    id: 'arch-wire',
    name: 'Arch Wire',
    category: 'health',
    orientation: 'vertical',
    tags: ['dentist', 'dental', 'orthodontist', 'braces', 'clinic', 'doctor', 'smile', 'modern', 'vertical'],
    fonts: { heading: 'outfit', body: 'outfit' },
    palettes: [
      {
        label: 'Lagoon',
        paper: '#FFFFFF',
        deep: '#0B4A50',
        wire: '#0B4A50',
        bracket: '#22A699',
        ink: '#0B4A50',
        soft: '#567779',
        onDeep: '#F1FAF8',
      },
      {
        label: 'Ocean',
        paper: '#FCFDFF',
        deep: '#123A73',
        wire: '#123A73',
        bracket: '#3E8BE0',
        ink: '#123A73',
        soft: '#566B8C',
        onDeep: '#F3F7FD',
      },
      {
        label: 'Plum',
        paper: '#FFFDFC',
        deep: '#5B2240',
        wire: '#5B2240',
        bracket: '#D0628F',
        ink: '#5B2240',
        soft: '#7F636F',
        onDeep: '#FFF6F6',
      },
      {
        label: 'Graphite',
        paper: '#F9F9F7',
        deep: '#23272D',
        wire: '#23272D',
        bracket: '#E0703A',
        ink: '#23272D',
        soft: '#62676E',
        onDeep: '#F6F6F4',
      },
    ],
    sample: PEOPLE.dentist,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 4.4, y: 4.5, w: VW - 8.8, h: 36, anchor: 'middle', gap: 0.9 },
          reach: { x: 4.4, y: 54.5, w: VW - 8.8, h: 30, anchor: 'middle' },
        },
        elements: [
          A('mouth', smileFill(51, 7, VW, VH), { fill: '$deep' }, VW, VH),
          A('wire', open(smilePts(47.4, 7, VW)), { stroke: '$wire', sw: 0.2 }, VW, VH),
          A('brackets', bracketsOn(47.4, 7, VW, 9, 2), { fill: '$bracket' }, VW, VH),
          LOGO('logo', VW / 2 - 6.5, 5, 13, '$ink', { stack: 'who', gap: 0, fallbackWeight: 500, fallbackSize: 19 }),
          T('name', '{name}', 4.4, VW - 8.8, 14, {
            stack: 'who',
            gap: 2,
            font: '$heading',
            weight: 600,
            fill: '$ink',
            align: 'center',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 4.4, VW - 8.8, 7, {
            stack: 'who',
            fill: '$soft',
            align: 'center',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
          }),
          T('company', '{company}', 4.4, VW - 8.8, 7, {
            stack: 'who',
            weight: 600,
            fill: '$ink',
            align: 'center',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address', 'hours'], 4.4, VW - 8.8, 6.7, {
            stack: 'reach',
            fill: '$onDeep',
            align: 'center',
            icons: false,
            rowHeight: 1.65,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 5, y: 5.5, w: VW - 10, h: 35, anchor: 'middle', gap: 1.3 } },
        elements: [
          A('roof', smileFill(47.4, 7, VW, VH, false), { fill: '$deep' }, VW, VH),
          A('wire', open(smilePts(51, 7, VW)), { stroke: '$wire', sw: 0.2 }, VW, VH),
          A('brackets', bracketsOn(51, 7, VW, 9, 2), { fill: '$bracket' }, VW, VH),
          T('company', '{company}', 5, VW - 10, 14, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$onDeep',
            align: 'center',
            minSize: 8.5,
            maxLines: 4,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 5, VW - 10, 6.8, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.84,
            align: 'center',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', VW / 2 - 13.5, 56.5, 27, { light: 'none', dark: '#101416' }),
        ],
      },
    },
  },
  {
    id: 'growth-chart',
    name: 'Growth Chart',
    category: 'health',
    tags: ['paediatrician', 'pediatric', 'child specialist', 'children', 'clinic', 'doctor', 'vaccination', 'friendly'],
    fonts: { heading: 'bricolage', body: 'dmsans' },
    palettes: [
      {
        label: 'Sunshine',
        paper: '#FFFDF8',
        panel: '#FFD45E',
        line: '#1F2A5C',
        dot: '#E5502B',
        ink: '#1F2A5C',
        soft: '#5A6285',
        mark: '#1F2A5C',
      },
      {
        label: 'Sky',
        paper: '#FBFDFF',
        panel: '#B9E2F6',
        line: '#0F4A73',
        dot: '#F0642F',
        ink: '#0F3F63',
        soft: '#557186',
        mark: '#0F3F63',
      },
      {
        label: 'Mint',
        paper: '#FBFEFB',
        panel: '#B8E8CF',
        line: '#11574B',
        dot: '#E9662C',
        ink: '#0F4A40',
        soft: '#527368',
        mark: '#0F4A40',
      },
      {
        label: 'Coral',
        paper: '#FFFCFA',
        panel: '#FFBFAB',
        line: '#6A1E33',
        dot: '#16627A',
        ink: '#5B1A2D',
        soft: '#845F68',
        mark: '#5B1A2D',
      },
    ],
    sample: PEOPLE.paediatric,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 40.5, y: 5.5, w: W - 45, h: 21.5, anchor: 'top', gap: 0.9 },
          reach: { x: 40.5, y: 28, w: W - 45, h: 17.5, anchor: 'bottom' },
        },
        elements: [
          R('panel', 5, 5, 31, H - 10, '$panel', { r: 3.5 }),
          A('curves', [0, 0.25, 0.75, 1].map((u) => growthLine(CHART_FRONT, u)).join(''), { stroke: '$line', sw: 0.2, join: 'round' }),
          A('median', growthLine(CHART_FRONT, 0.5), { stroke: '$line', sw: 0.5, join: 'round' }),
          E('dot', ...[growthPoint(CHART_FRONT, 0.5, 0.78)].flatMap(([x, y]) => [x - 1.5, y - 1.5]), 3, 3, '$dot'),
          LOGO('logo', 7.5, 7.5, 11, '$mark', { fallbackWeight: 700, fallbackSize: 15 }),
          T('name', '{name}', 40.5, W - 45, 14.5, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.08,
          }),
          T('title', '{title}', 40.5, W - 45, 7, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.22 }),
          T('company', '{company}', 40.5, W - 45, 7, {
            stack: 'who',
            weight: 700,
            fill: '$ink',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 40.5, W - 45, 6.5, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$panel',
        stacks: { brand: { x: 6, y: 6, w: 46, h: 21, anchor: 'top', gap: 1.2 } },
        elements: [
          A('curves', [0, 0.25, 0.75, 1].map((u) => growthLine(CHART_BACK, u)).join(''), { stroke: '$line', sw: 0.2, join: 'round' }),
          A('median', growthLine(CHART_BACK, 0.5), { stroke: '$line', sw: 0.5, join: 'round' }),
          T('company', '{company}', 6, 46, 14, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 9,
            maxLines: 3,
            lineHeight: 1.08,
          }),
          T('tagline', '{tagline}', 6, 46, 7, {
            stack: 'brand',
            fill: '$ink',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', W - 31, H / 2 - 13, 26, { r: 2, dark: '#101A33' }),
        ],
      },
    },
  },
  {
    id: 'double-rule',
    name: 'Double Rule',
    category: 'professional',
    tags: ['ca', 'chartered accountant', 'tax', 'audit', 'gst', 'accountant', 'finance', 'classic', 'ledger'],
    fonts: { heading: 'lora', body: 'inter' },
    palettes: [
      {
        label: 'Ledger Red',
        paper: '#FBF8F0',
        deep: '#16233F',
        ink: '#16233F',
        soft: '#596178',
        rule: '#B3261E',
        ruleBack: '#E6C98A',
        onDeep: '#FBF8F0',
      },
      {
        label: 'Bottle',
        paper: '#F8F8F1',
        deep: '#12392E',
        ink: '#12392E',
        soft: '#566B60',
        rule: '#12392E',
        ruleBack: '#D8C386',
        onDeep: '#F8F8F1',
      },
      {
        label: 'Oxford',
        paper: '#FFFFFF',
        deep: '#0F2747',
        ink: '#0F2747',
        soft: '#58677E',
        rule: '#2B6CB0',
        ruleBack: '#9CC3EA',
        onDeep: '#FFFFFF',
      },
      {
        label: 'Carbon',
        paper: '#F4F2EC',
        deep: '#1E1E20',
        ink: '#1E1E20',
        soft: '#5F5F62',
        rule: '#1E1E20',
        ruleBack: '#D5B36B',
        onDeep: '#F4F2EC',
      },
    ],
    sample: PEOPLE.ca,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 5, w: 62, h: 20.2, anchor: 'bottom', gap: 0.8 },
          left: { x: 6, y: 30, w: 44.2, h: 16, anchor: 'top', gap: 0.4 },
          right: { x: 53, y: 30, w: W - 59, h: 16, anchor: 'top', gap: 0.4 },
        },
        elements: [
          LN('rule1', -B, 26.6, W + 2 * B, '$rule', 0.3),
          LN('rule2', -B, 27.7, W + 2 * B, '$rule', 0.3),
          LOGO('logo', W - 19, 9.5, 13, '$ink', { fallbackWeight: 600, fallbackSize: 18 }),
          T('name', '{name}', 6, 62, 16.5, {
            stack: 'who',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 6, 62, 7, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.2 }),
          L('contact', ['phone', 'email', 'website'], 6, 44.2, 6.6, { stack: 'left', fill: '$ink', icons: false, rowHeight: 1.55 }),
          T('company', '{company}', 53, W - 59, 6.8, {
            stack: 'right',
            weight: 700,
            fill: '$ink',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.25,
          }),
          T('address', '{address}', 53, W - 59, 6.4, { stack: 'right', fill: '$soft', minSize: 5.6, maxLines: 4, lineHeight: 1.28 }),
        ],
      },
      back: {
        background: '$deep',
        stacks: {
          brand: { x: 6, y: 5, w: 44, h: 20.2, anchor: 'bottom', gap: 0.8 },
          line: { x: 6, y: 30, w: 44, h: 16, anchor: 'top', gap: 0.8 },
        },
        elements: [
          LN('rule1', -B, 26.6, 54 + B, '$ruleBack', 0.3),
          LN('rule2', -B, 27.7, 54 + B, '$ruleBack', 0.3),
          T('company', '{company}', 6, 44, 14, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$onDeep',
            minSize: 9,
            maxLines: 3,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 6, 44, 7, {
            stack: 'line',
            fill: '$onDeep',
            opacity: 0.86,
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.25,
          }),
          T('website', '{website}', 6, 44, 6.6, { stack: 'line', weight: 600, fill: '$onDeep', minSize: 5.5, noWrap: true }),
          QR('qr', W - 31, H / 2 - 13, 26, { r: 0.6 }),
        ],
      },
    },
  },
  {
    id: 'compound-lines',
    name: 'Compound',
    category: 'luxury',
    tags: ['finance', 'wealth', 'investment', 'mutual fund', 'financial planner', 'insurance', 'stock broker', 'gold', 'dark'],
    fonts: { heading: 'playfair', body: 'manrope' },
    palettes: [
      {
        label: 'Noir Gold',
        ground: '#0F1319',
        ink: '#F6F1E3',
        soft: '#B4B0A4',
        foil1: '#8F6E2E',
        foil2: '#F2DDA0',
        foil3: '#B8924A',
        plate: '#F6F1E3',
        onPlate: '#14181F',
      },
      {
        label: 'Emerald',
        ground: '#0B2B24',
        ink: '#F2F1E4',
        soft: '#A8BCAF',
        foil1: '#94803F',
        foil2: '#F0E4AE',
        foil3: '#BBA25B',
        plate: '#F2F1E4',
        onPlate: '#0B2B24',
      },
      {
        label: 'Ink Silver',
        ground: '#101E3B',
        ink: '#F2F5FA',
        soft: '#A9B5CB',
        foil1: '#7F8BA3',
        foil2: '#F1F4F9',
        foil3: '#A7B1C6',
        plate: '#F2F5FA',
        onPlate: '#101E3B',
      },
      {
        label: 'Ivory',
        ground: '#F6F1E4',
        ink: '#1B1E26',
        soft: '#5F5E5A',
        foil1: '#6F5220',
        foil2: '#8F6B2C',
        foil3: '#7D5E27',
        plate: '#FFFDF7',
        onPlate: '#1B1E26',
      },
    ],
    sample: PEOPLE.wealth,
    sides: {
      front: {
        background: '$ground',
        stacks: {
          who: { x: 6, y: 5.5, w: 58, h: 19, anchor: 'top', gap: 0.9 },
          reach: { x: 6, y: 25, w: 45, h: 18, anchor: 'bottom' },
        },
        elements: [
          A('bars', compoundBars(6, W + 2, H + B, 3.6, 46, 3.4, 1.28, 0.26), {
            fill: {
              type: 'linear',
              angle: 70,
              stops: [
                [0, '$foil1'],
                [0.55, '$foil3'],
                [0.82, '$foil2'],
                [1, '$foil1'],
              ],
            },
          }),
          T('name', '{name}', 6, 58, 17, {
            stack: 'who',
            font: '$heading',
            weight: 500,
            fill: '$ink',
            minSize: 10.5,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 6, 58, 7.2, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.22 }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 45, 6.5, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$ground',
        stacks: { brand: { x: 37, y: 6, w: 31, h: H - 12, anchor: 'top', gap: 1.2 } },
        elements: [
          A('bars', compoundBars(38, W + 2, H + B, 2.2, 49, 4.4, 1.28, 0.26), {
            fill: {
              type: 'linear',
              angle: 70,
              stops: [
                [0, '$foil1'],
                [0.55, '$foil3'],
                [0.82, '$foil2'],
                [1, '$foil1'],
              ],
            },
          }),
          QR('qr', 6, H / 2 - 13, 26, { r: 0.8, light: '$plate', dark: '#10141A' }),
          LOGO(
            'logo',
            37,
            6,
            11,
            {
              type: 'linear',
              angle: 60,
              stops: [
                [0, '$foil1'],
                [0.5, '$foil2'],
                [1, '$foil3'],
              ],
            },
            { stack: 'brand', fallbackWeight: 500, fallbackSize: 17, align: 'left' },
          ),
          T('company', '{company}', 37, 31, 11.5, {
            stack: 'brand',
            font: '$heading',
            weight: 500,
            fill: '$ink',
            minSize: 8,
            maxLines: 4,
            lineHeight: 1.14,
          }),
          T('tagline', '{tagline}', 37, 31, 6.4, {
            stack: 'brand',
            fill: '$soft',
            minSize: 5.6,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'fluted-column',
    name: 'Colonnade',
    category: 'professional',
    tags: ['lawyer', 'advocate', 'law firm', 'legal', 'solicitor', 'high court', 'notary', 'chambers', 'classic'],
    fonts: { heading: 'cormorant', body: 'montserrat' },
    palettes: [
      {
        label: 'Gown Black',
        ground: '#121214',
        stone: '#F4F1E8',
        flute: '#8E8B83',
        ink: '#F7F5EE',
        soft: '#B9B7B0',
        paper: '#F7F5EE',
        backInk: '#121214',
        backSoft: '#5D5D5E',
      },
      {
        label: 'Oxblood',
        ground: '#3F0F16',
        stone: '#F5E8D9',
        flute: '#A9837A',
        ink: '#FBF4EA',
        soft: '#D6BDB1',
        paper: '#FBF4EA',
        backInk: '#3F0F16',
        backSoft: '#6F5550',
      },
      {
        label: 'Court Navy',
        ground: '#101D38',
        stone: '#EEF0F4',
        flute: '#8590A8',
        ink: '#F5F6F8',
        soft: '#AEB7C8',
        paper: '#F5F6F8',
        backInk: '#101D38',
        backSoft: '#566079',
      },
      {
        label: 'Ivory',
        ground: '#F5F1E6',
        stone: '#1B1B1E',
        flute: '#77756F',
        ink: '#1B1B1E',
        soft: '#5E5C57',
        paper: '#1B1B1E',
        backInk: '#F5F1E6',
        backSoft: '#BDBAB0',
      },
    ],
    sample: PEOPLE.advocate,
    sides: {
      front: {
        background: '$ground',
        stacks: {
          who: { x: 33, y: 5.5, w: W - 38.5, h: 22, anchor: 'top', gap: 1 },
          reach: { x: 33, y: 28.5, w: W - 38.5, h: 17, anchor: 'bottom' },
        },
        elements: [
          R('lintel', -B, -B, 29 + B, 6.2, '$stone'),
          R('plinth', -B, H - 3.2, 29 + B, 3.2 + B, '$stone'),
          R('c1', 2.2, 2.8, 6, H - 5.6, '$stone'),
          R('c2', 11.4, 2.8, 6, H - 5.6, '$stone'),
          R('c3', 20.6, 2.8, 6, H - 5.6, '$stone'),
          R('cap1', 1.2, 3.2, 8, 1, '$ground'),
          R('cap2', 10.4, 3.2, 8, 1, '$ground'),
          R('cap3', 19.6, 3.2, 8, 1, '$ground'),
          R('foot1', 1.2, H - 4.2, 8, 1, '$ground'),
          R('foot2', 10.4, H - 4.2, 8, 1, '$ground'),
          R('foot3', 19.6, H - 4.2, 8, 1, '$ground'),
          A('flutes', flutes(2.2, 6, 5.4, H - 5.4, 6) + flutes(11.4, 6, 5.4, H - 5.4, 6) + flutes(20.6, 6, 5.4, H - 5.4, 6), {
            stroke: '$flute',
            sw: 0.14,
          }),
          T('name', '{name}', 33, W - 38.5, 19, {
            stack: 'who',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            minSize: 11,
            maxLines: 2,
            lineHeight: 1.04,
          }),
          T('title', '{title}', 33, W - 38.5, 6.1, {
            stack: 'who',
            fill: '$soft',
            upper: true,
            tracking: 0.05,
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.3,
          }),
          T('company', '{company}', 33, W - 38.5, 6.4, {
            stack: 'who',
            weight: 600,
            fill: '$ink',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.3,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 33, W - 38.5, 6, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 6, y: 8, w: 45, h: H - 14, anchor: 'middle', gap: 1.4 } },
        elements: [
          R('lintel', -B, -B, W + 2 * B, 6.2, '$ground'),
          R('plinth', -B, H - 3.2, W + 2 * B, 3.2 + B, '$ground'),
          LOGO('logo', 6, 8, 12, '$backInk', { stack: 'brand', fallbackWeight: 600, fallbackSize: 21, align: 'left' }),
          T('company', '{company}', 6, 45, 18, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$backInk',
            minSize: 10.5,
            maxLines: 3,
            lineHeight: 1.06,
          }),
          T('tagline', '{tagline}', 6, 45, 6.2, {
            stack: 'brand',
            fill: '$backSoft',
            minSize: 5.5,
            maxLines: 2,
            lineHeight: 1.3,
            optional: true,
          }),
          QR('qr', W - 32, H / 2 - 13, 26, { light: '#FFFFFF', dark: '#111114', r: 0.4 }),
        ],
      },
    },
  },
  {
    id: 'vanishing-point',
    name: 'Vanishing Point',
    category: 'creative',
    tags: ['architect', 'architecture', 'civil engineer', 'planner', 'interiors', 'studio', 'technical', 'line art', 'perspective'],
    fonts: { heading: 'spacegrotesk', body: 'spacegrotesk' },
    palettes: [
      {
        label: 'Drafting',
        paper: '#FBFAF6',
        line: '#3A3A3C',
        door: '#C4472B',
        onDoor: '#FBFAF6',
        ink: '#1A1A1C',
        soft: '#66645E',
        deep: '#1A1A1C',
        backLine: '#77756F',
        onDeep: '#F4F2EB',
      },
      {
        label: 'Cobalt',
        paper: '#F4F7FC',
        line: '#2A4E8F',
        door: '#123C7A',
        onDoor: '#F4F7FC',
        ink: '#123C7A',
        soft: '#54698C',
        deep: '#123C7A',
        backLine: '#6C8BC0',
        onDeep: '#F3F7FC',
      },
      {
        label: 'Sage',
        paper: '#F3F4EC',
        line: '#435749',
        door: '#A85B2C',
        onDoor: '#F3F4EC',
        ink: '#2B3D32',
        soft: '#5F6D60',
        deep: '#2B3D32',
        backLine: '#74877A',
        onDeep: '#F3F4EC',
      },
      {
        label: 'Night',
        paper: '#16181C',
        line: '#8E8D87',
        door: '#E0A458',
        onDoor: '#16181C',
        ink: '#EDEAE1',
        soft: '#A3A29B',
        deep: '#0C0D10',
        backLine: '#55554F',
        onDeep: '#EDEAE1',
      },
    ],
    sample: PEOPLE.architect,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 6, w: 45.6, h: 20, anchor: 'top', gap: 1 },
          reach: { x: 6, y: 27, w: 45.6, h: 18, anchor: 'bottom' },
        },
        elements: [
          A('corridor', corridor([55, -B, W - 55 + B, H + 2 * B], [65.5, 17, 13, 17], 8), { stroke: '$line', sw: 0.14 }),
          R('door', 65.5, 17, 13, 17, '$door'),
          LOGO('logo', 66, 19, 12, '$onDoor', { h: 13, fallbackWeight: 500, fallbackSize: 15 }),
          T('name', '{name}', 6, 45.6, 15.5, {
            stack: 'who',
            font: '$heading',
            weight: 500,
            fill: '$ink',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.08,
            tracking: -0.015,
          }),
          T('title', '{title}', 6, 45.6, 6.8, { stack: 'who', fill: '$soft', minSize: 5.6, maxLines: 2, lineHeight: 1.25 }),
          T('company', '{company}', 6, 45.6, 6.8, {
            stack: 'who',
            weight: 600,
            fill: '$door',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 45.6, 6.3, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 6, w: 32, h: H - 12, anchor: 'bottom', gap: 1.4 } },
        elements: [
          A('corridor', corridor([42, -B, W - 42 + B, H + 2 * B], [55.4, 10.9, 29, 29], 6), { stroke: '$backLine', sw: 0.14 }),
          QR('qr', 56.9, H / 2 - 13, 26, { r: 0.3 }),
          T('company', '{company}', 6, 32, 12, {
            stack: 'brand',
            font: '$heading',
            weight: 500,
            fill: '$onDeep',
            minSize: 8,
            maxLines: 4,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 6, 32, 6.3, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.8,
            minSize: 5.6,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'golden-section',
    name: 'Golden Section',
    category: 'creative',
    orientation: 'vertical',
    tags: ['interior designer', 'interiors', 'decor', 'architect', 'furniture', 'studio', 'colour block', 'vertical', 'modern'],
    fonts: { heading: 'marcellus', body: 'outfit' },
    palettes: [
      {
        label: 'Terracotta',
        paper: '#FBF7F0',
        t1: '#C65D3B',
        t2: '#E9B99C',
        t3: '#2D2A26',
        t4: '#6F7A55',
        t5: '#E7C07A',
        mark: '#FBF7F0',
        ink: '#2D2A26',
        soft: '#6C665C',
        backGround: '#2D2A26',
        onBack: '#FBF7F0',
      },
      {
        label: 'Monsoon',
        paper: '#F5F6F2',
        t1: '#1F5560',
        t2: '#8FB8B4',
        t3: '#18262B',
        t4: '#C98F4A',
        t5: '#D9D3C2',
        mark: '#F5F6F2',
        ink: '#18262B',
        soft: '#5B676A',
        backGround: '#18262B',
        onBack: '#F5F6F2',
      },
      {
        label: 'Rosewood',
        paper: '#FBF6F3',
        t1: '#7A2F3C',
        t2: '#E2B5AE',
        t3: '#2F1A20',
        t4: '#B98B5E',
        t5: '#EADCCB',
        mark: '#FBF6F3',
        ink: '#2F1A20',
        soft: '#6F5D60',
        backGround: '#2F1A20',
        onBack: '#FBF6F3',
      },
      {
        label: 'Stone',
        paper: '#F6F5F1',
        t1: '#3A3A38',
        t2: '#B9B6AD',
        t3: '#171716',
        t4: '#D6A642',
        t5: '#DDDAD1',
        mark: '#F6F5F1',
        ink: '#171716',
        soft: '#62615C',
        backGround: '#171716',
        onBack: '#F6F5F1',
      },
    ],
    sample: PEOPLE.interiors,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 4.4, y: 36, w: VW - 8.8, h: 21, anchor: 'top', gap: 1 },
          reach: { x: 4.4, y: 58, w: VW - 8.8, h: 26.5, anchor: 'bottom' },
        },
        elements: [
          R('s1', -B, -B, 34.4, 34.4, '$t1'),
          A('a1', 'M-3 31.4A34.4 34.4 0 0 1 31.4 -3V31.4Z', { fill: '$t2' }, VW, VH),
          R('s2', 31.4, -B, 19.4 + B, 22.4, '$t3'),
          R('s3', 38.8, 19.4, 12 + B, 12, '$t5'),
          A('a3', 'M50.8 19.4H53.8V19.4A15 15 0 0 1 38.8 31.4V19.4Z', { fill: '$t4' }, VW, VH),
          R('s4', 31.4, 19.4, 7.4, 7.4, '$t4'),
          R('s5', 31.4, 26.8, 7.4, 4.6, '$t1'),
          LOGO('logo', 33.6, 1.8, 15, '$mark', { fallbackSize: 21 }),
          T('name', '{name}', 4.4, VW - 8.8, 17, {
            stack: 'who',
            font: '$heading',
            fill: '$ink',
            minSize: 10.5,
            maxLines: 2,
            lineHeight: 1.08,
          }),
          T('title', '{title}', 4.4, VW - 8.8, 7, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.22 }),
          T('company', '{company}', 4.4, VW - 8.8, 7, {
            stack: 'who',
            weight: 600,
            fill: '$ink',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 4.4, VW - 8.8, 6.6, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$backGround',
        stacks: { brand: { x: 4.4, y: 6, w: VW - 8.8, h: 40, anchor: 'top', gap: 1.4 } },
        elements: [
          A('disc', 'M53.8 37.5A54.4 54.4 0 0 0 -0.6 91.9H53.8Z', { fill: '$t1' }, VW, VH),
          QR('qr', VW - 30.4, VH - 30.4, 26, { r: 0.4 }),
          T('company', '{company}', 4.4, VW - 8.8, 15, {
            stack: 'brand',
            font: '$heading',
            fill: '$onBack',
            minSize: 9,
            maxLines: 4,
            lineHeight: 1.1,
          }),
          T('tagline', '{tagline}', 4.4, VW - 8.8, 6.8, {
            stack: 'brand',
            fill: '$onBack',
            opacity: 0.8,
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'lit-facade',
    name: 'Lit Facade',
    category: 'professional',
    orientation: 'vertical',
    tags: ['builder', 'developer', 'real estate', 'property', 'construction', 'towers', 'night', 'vertical', 'premium'],
    fonts: { heading: 'syne', body: 'syne' },
    palettes: [
      {
        label: 'Night',
        ground: '#10172A',
        win: '#26304A',
        lit: '#F2C66B',
        ink: '#F6F3EA',
        soft: '#A9AFBD',
        paper: '#F6F3EA',
        backInk: '#10172A',
        backSoft: '#585F70',
      },
      {
        label: 'Forest',
        ground: '#0F2A25',
        win: '#214239',
        lit: '#EFD27F',
        ink: '#F3F4EA',
        soft: '#A5B8AE',
        paper: '#F3F4EA',
        backInk: '#0F2A25',
        backSoft: '#536A61',
      },
      {
        label: 'Graphite',
        ground: '#1A1B1F',
        win: '#32343B',
        lit: '#E9694A',
        ink: '#F4F2EE',
        soft: '#ACACA9',
        paper: '#F4F2EE',
        backInk: '#1A1B1F',
        backSoft: '#5D5D5D',
      },
      {
        label: 'Dusk',
        ground: '#2B1838',
        win: '#46305A',
        lit: '#FFB866',
        ink: '#FBF3EC',
        soft: '#BBAFC4',
        paper: '#FBF3EC',
        backInk: '#2B1838',
        backSoft: '#675A70',
      },
    ],
    sample: PEOPLE.builder,
    sides: {
      front: {
        background: '$ground',
        stacks: {
          who: { x: 4.4, y: 6, w: VW - 8.8, h: 22, anchor: 'top', gap: 1 },
          reach: { x: 4.4, y: 29, w: VW - 8.8, h: 22, anchor: 'top' },
        },
        elements: [
          A('dim', FACADE.dim, { fill: '$win' }, VW, VH),
          A('lit', FACADE.lit, { fill: '$lit' }, VW, VH),
          T('name', '{name}', 4.4, VW - 8.8, 14, {
            stack: 'who',
            font: '$heading',
            weight: 700,
            fill: '$ink',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.08,
          }),
          T('title', '{title}', 4.4, VW - 8.8, 6.8, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.22 }),
          T('company', '{company}', 4.4, VW - 8.8, 6.8, {
            stack: 'who',
            weight: 700,
            fill: '$ink',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 4.4, VW - 8.8, 6.2, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 4.4, y: 6, w: VW - 8.8, h: 29, anchor: 'top', gap: 1.2 } },
        elements: [
          R('base', -B, 72, VW + 2 * B, VH - 72 + B, '$ground'),
          A('dim', FACADE_BACK.dim, { fill: '$win' }, VW, VH),
          A('lit', FACADE_BACK.lit, { fill: '$lit' }, VW, VH),
          LOGO('logo', 4.4, 6, 11, '$backInk', { stack: 'brand', fallbackWeight: 700, fallbackSize: 15 }),
          T('company', '{company}', 4.4, VW - 8.8, 12.5, {
            stack: 'brand',
            font: '$heading',
            weight: 700,
            fill: '$backInk',
            minSize: 8.5,
            maxLines: 3,
            lineHeight: 1.1,
          }),
          T('tagline', '{tagline}', 4.4, VW - 8.8, 6.4, {
            stack: 'brand',
            fill: '$backSoft',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', 4.4 - 1, 40, 28, { light: 'none', dark: '#111114', quiet: 2 }),
        ],
      },
    },
  },
  {
    id: 'survey-plot',
    name: 'Survey Plot',
    category: 'professional',
    tags: ['real estate', 'property', 'plots', 'land', 'broker', 'agent', 'consultant', 'developer', 'map', 'gold'],
    fonts: { heading: 'dmserif', body: 'manrope' },
    palettes: [
      {
        label: 'Estate Green',
        deep: '#12392D',
        line: '#4F7A69',
        foil1: '#C49B4E',
        foil2: '#F1DDA2',
        paper: '#FBFAF4',
        ink: '#12392D',
        soft: '#5B6F65',
        onDeep: '#FBFAF4',
        mark: '#12392D',
      },
      {
        label: 'Harbour',
        deep: '#10264A',
        line: '#51688F',
        foil1: '#BFA35F',
        foil2: '#EEDFAE',
        paper: '#FAFBFC',
        ink: '#10264A',
        soft: '#59657D',
        onDeep: '#FAFBFC',
        mark: '#10264A',
      },
      {
        label: 'Laterite',
        deep: '#6A2C1D',
        line: '#A36753',
        foil1: '#E7BE78',
        foil2: '#F8E6BE',
        paper: '#FCF8F2',
        ink: '#4F2013',
        soft: '#7C6054',
        onDeep: '#FCF8F2',
        mark: '#4F2013',
      },
      {
        label: 'Slate',
        deep: '#2A2E35',
        line: '#646A74',
        foil1: '#D1D4D8',
        foil2: '#F3F4F5',
        paper: '#F7F7F5',
        ink: '#23262C',
        soft: '#60646B',
        onDeep: '#F7F7F5',
        mark: '#23262C',
      },
    ],
    sample: PEOPLE.realty,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 24.5, w: 32, h: 22, anchor: 'top', gap: 0.9 },
          reach: { x: 40, y: 24.5, w: W - 45, h: 22, anchor: 'top' },
        },
        elements: [
          R('band', -B, -B, W + 2 * B, 24 - 2, '$deep'),
          A('lots', PLOT_LINES, { stroke: '$line', sw: 0.18 }),
          A('road', PLOT_ROAD, { stroke: '$line', sw: 0.3 }),
          A('plot', poly(PLOT_GOLD), {
            fill: {
              type: 'linear',
              angle: 60,
              stops: [
                [0, '$foil1'],
                [0.55, '$foil2'],
                [1, '$foil1'],
              ],
            },
          }),
          LOGO('logo', 11.5, 2, 13, '$mark', { fallbackSize: 18 }),
          T('name', '{name}', 6, 32, 13.5, { stack: 'who', font: '$heading', fill: '$ink', minSize: 10, maxLines: 2, lineHeight: 1.08 }),
          T('title', '{title}', 6, 32, 6.8, { stack: 'who', fill: '$soft', minSize: 5.6, maxLines: 3, lineHeight: 1.22 }),
          T('company', '{company}', 6, 32, 6.8, {
            stack: 'who',
            weight: 700,
            fill: '$ink',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 40, W - 45, 6.4, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 6, y: 6, w: 33, h: H - 12, anchor: 'bottom', gap: 1.3 } },
        elements: [
          A('lots', PLOT_BACK, { stroke: '$line', sw: 0.18 }),
          A('plot', poly(PLOT_BACK_GOLD), { fill: '$paper' }),
          A('edge', poly(PLOT_BACK_GOLD), { stroke: '$foil1', sw: 0.5, join: 'miter' }),
          QR('qr', 54, H / 2 - 13, 26, { light: 'none', dark: '#121416' }),
          T('company', '{company}', 6, 33, 14, {
            stack: 'brand',
            font: '$heading',
            fill: '$onDeep',
            minSize: 9,
            maxLines: 4,
            lineHeight: 1.1,
          }),
          T('tagline', '{tagline}', 6, 33, 6.5, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.82,
            minSize: 5.6,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'swiss-poster',
    name: 'Swiss Poster',
    category: 'bold',
    tags: ['sales', 'manager', 'corporate', 'executive', 'business development', 'startup', 'typographic', 'bold', 'modern'],
    fonts: { heading: 'bebas', body: 'inter' },
    palettes: [
      { label: 'Vermilion', paper: '#FFFFFF', ink: '#121212', soft: '#5C5C5C', hot: '#E23D17', onHot: '#FFFFFF' },
      { label: 'Cobalt', paper: '#FFFFFF', ink: '#0E1530', soft: '#555B70', hot: '#1C3FD8', onHot: '#FFFFFF' },
      { label: 'Emerald', paper: '#FBFBF7', ink: '#0F1F19', soft: '#566259', hot: '#0B7350', onHot: '#FBFBF7' },
      { label: 'Black', paper: '#F3F0E7', ink: '#111111', soft: '#5A5852', hot: '#111111', onHot: '#F3F0E7' },
    ],
    sample: PEOPLE.sales,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 6, y: 4.5, w: W - 12, h: 21.5, anchor: 'bottom' },
          left: { x: 6, y: 30.5, w: 31, h: 16, anchor: 'top', gap: 0.7 },
          reach: { x: 40, y: 30.5, w: W - 45, h: 16, anchor: 'top' },
        },
        elements: [
          R('bar', 6, 27, W - 12, 1.1, '$hot'),
          T('name', '{name}', 6, W - 12, 40, { stack: 'who', font: '$heading', fill: '$ink', minSize: 15, maxLines: 2, lineHeight: 0.98 }),
          T('title', '{title}', 6, 31, 7.2, { stack: 'left', weight: 700, fill: '$ink', minSize: 5.8, maxLines: 3, lineHeight: 1.2 }),
          T('company', '{company}', 6, 31, 7, { stack: 'left', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.2 }),
          L('contact', ['phone', 'email', 'website', 'address'], 40, W - 45, 6.4, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { brand: { x: 6, y: 28, w: 44, h: 18, anchor: 'bottom', gap: 0.8 } },
        elements: [
          R('split', -B, -B, 54.9 + B, H + 2 * B, '$hot'),
          LOGO('logo', 4, 4.5, 30, '$onHot', { h: 23, fallbackSize: 68 }),
          T('company', '{company}', 6, 44, 21, {
            stack: 'brand',
            font: '$heading',
            fill: '$onHot',
            minSize: 11,
            maxLines: 2,
            lineHeight: 1,
          }),
          T('tagline', '{tagline}', 6, 44, 6.4, {
            stack: 'brand',
            fill: '$onHot',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          QR('qr', 58.9, H / 2 - 13, 26, { light: 'none', dark: '#111111' }),
        ],
      },
    },
  },
  {
    id: 'signet-ring',
    name: 'Signet',
    category: 'luxury',
    tags: ['director', 'ceo', 'founder', 'corporate', 'executive', 'holdings', 'monogram', 'gold', 'elegant', 'luxury'],
    fonts: { heading: 'marcellus', body: 'dmsans' },
    palettes: [
      {
        label: 'Graphite Gold',
        ground: '#17181B',
        foil1: '#94712F',
        foil2: '#F4E0A6',
        foil3: '#B8904A',
        paper: '#FAF7EF',
        ink: '#17181B',
        soft: '#5E5D58',
        rule: '#B8904A',
        onGround: '#E9E2CF',
      },
      {
        label: 'Midnight Silver',
        ground: '#0F1A30',
        foil1: '#7F8CA4',
        foil2: '#F3F5F9',
        foil3: '#A9B4C8',
        paper: '#F7F8FA',
        ink: '#0F1A30',
        soft: '#5A6478',
        rule: '#7F8CA4',
        onGround: '#DDE3EE',
      },
      {
        label: 'Emerald Gold',
        ground: '#0B2C25',
        foil1: '#937C3C',
        foil2: '#F2E5AE',
        foil3: '#BCA35B',
        paper: '#F8F7EE',
        ink: '#0B2C25',
        soft: '#576A60',
        rule: '#A68D48',
        onGround: '#E6E3CC',
      },
      {
        label: 'Wine Rose',
        ground: '#34111F',
        foil1: '#A9705D',
        foil2: '#F7D9C7',
        foil3: '#CE9C85',
        paper: '#FBF6F2',
        ink: '#34111F',
        soft: '#6F5A5E',
        rule: '#B57F6B',
        onGround: '#F0DDD1',
      },
    ],
    sample: PEOPLE.director,
    sides: {
      front: {
        background: '$ground',
        stacks: { brand: { x: 8, y: 35.5, w: W - 16, h: 11, anchor: 'top', gap: 0.8 } },
        elements: [
          A(
            'ring',
            circle(14.2, 14.2, 14.2) + circle(14.2, 14.2, 13.75) + circle(14.2, 14.2, 13.2) + circle(14.2, 14.2, 12.1),
            {
              fill: {
                type: 'linear',
                angle: 50,
                stops: [
                  [0, '$foil1'],
                  [0.48, '$foil2'],
                  [1, '$foil3'],
                ],
              },
              evenodd: true,
              x: W / 2 - 14.2,
              y: 4.3,
            },
            28.4,
            28.4,
          ),
          LOGO(
            'logo',
            W / 2 - 10,
            8.5,
            20,
            {
              type: 'linear',
              angle: 50,
              stops: [
                [0, '$foil3'],
                [0.5, '$foil2'],
                [1, '$foil3'],
              ],
            },
            { fallbackSize: 28 },
          ),
          T('company', '{company}', 8, W - 16, 8.2, {
            stack: 'brand',
            font: '$heading',
            fill: '$onGround',
            align: 'center',
            upper: true,
            tracking: 0.16,
            minSize: 6.5,
            maxLines: 2,
            lineHeight: 1.25,
          }),
        ],
      },
      back: {
        background: '$paper',
        stacks: { who: { x: 6, y: 5.5, w: 49, h: H - 11, anchor: 'middle', gap: 0.9 } },
        elements: [
          T('name', '{name}', 6, 49, 15.5, { stack: 'who', font: '$heading', fill: '$ink', minSize: 10, maxLines: 2, lineHeight: 1.08 }),
          T('title', '{title}', 6, 49, 7, { stack: 'who', fill: '$soft', minSize: 5.8, maxLines: 2, lineHeight: 1.22 }),
          LN('rule', 6, 0, 10, '$rule', 0.3, { stack: 'who', gap: 2.4 }),
          L('contact', ['phone', 'email', 'website', 'address'], 6, 49, 6.5, {
            stack: 'who',
            gap: 2,
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
          QR('qr', W - 31, H / 2 - 13, 26, { light: 'none', dark: '#141416' }),
        ],
      },
    },
  },
  {
    id: 'bezel-dial',
    name: 'Bezel',
    category: 'professional',
    tags: ['consultant', 'coach', 'advisor', 'mentor', 'strategy', 'management', 'trainer', 'line art', 'modern'],
    fonts: { heading: 'montserrat', body: 'inter' },
    palettes: [
      { label: 'Petrol', ground: '#0E2F35', tick: '#7FA8A8', mark: '#E8A15C', ink: '#F3F5F1', soft: '#A5BDBB', logo: '#F3F5F1' },
      { label: 'Porcelain', ground: '#F6F5F0', tick: '#55606A', mark: '#C8452B', ink: '#1C2329', soft: '#5C646B', logo: '#1C2329' },
      { label: 'Royal', ground: '#17205A', tick: '#8892CC', mark: '#F4C95D', ink: '#F4F5FB', soft: '#AEB5DA', logo: '#F4F5FB' },
      { label: 'Onyx', ground: '#131416', tick: '#77797D', mark: '#39C3A6', ink: '#F2F2EF', soft: '#AAABA9', logo: '#F2F2EF' },
    ],
    sample: PEOPLE.consultant,
    sides: {
      front: {
        background: '$ground',
        stacks: {
          who: { x: 40, y: 6, w: W - 45, h: 21, anchor: 'top', gap: 1 },
          reach: { x: 40, y: 28, w: W - 45, h: 17, anchor: 'bottom' },
        },
        elements: [
          A('ticks', dialTicks(11.5, H / 2, 23.2, 72, 6, 1.4, 3), { stroke: '$tick', sw: 0.2 }),
          A('needle', dialMark(11.5, H / 2, 23.2, -30), { fill: '$mark' }),
          LOGO('logo', 3.5, H / 2 - 8, 16, '$logo', { fallbackWeight: 600, fallbackSize: 21 }),
          T('name', '{name}', 40, W - 45, 13.5, {
            stack: 'who',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            minSize: 9.5,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 40, W - 45, 6.8, { stack: 'who', fill: '$soft', minSize: 5.6, maxLines: 2, lineHeight: 1.22 }),
          T('company', '{company}', 40, W - 45, 6.8, {
            stack: 'who',
            weight: 700,
            fill: '$ink',
            minSize: 5.6,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 40, W - 45, 6.3, {
            stack: 'reach',
            fill: '$ink',
            icons: false,
            rowHeight: 1.55,
          }),
        ],
      },
      back: {
        background: '$ground',
        stacks: { brand: { x: 6, y: 6, w: 31, h: H - 12, anchor: 'bottom', gap: 1.3 } },
        elements: [
          A('ticks', dialTicks(W - H / 2, H / 2, 24, 72, 6, 1.4, 3), { stroke: '$tick', sw: 0.2 }),
          A('needle', dialMark(W - H / 2, H / 2, 24, -30), { fill: '$mark' }),
          QR('qr', W - H / 2 - 13, H / 2 - 13, 26, { r: 0.8 }),
          T('company', '{company}', 6, 31, 11, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            minSize: 8,
            maxLines: 4,
            lineHeight: 1.14,
          }),
          T('tagline', '{tagline}', 6, 31, 6.4, {
            stack: 'brand',
            fill: '$soft',
            minSize: 5.6,
            maxLines: 3,
            lineHeight: 1.25,
            optional: true,
          }),
        ],
      },
    },
  },
  {
    id: 'open-pages',
    name: 'Open Pages',
    category: 'professional',
    orientation: 'vertical',
    tags: ['teacher', 'tutor', 'professor', 'coaching classes', 'education', 'school', 'author', 'trainer', 'vertical', 'book'],
    fonts: { heading: 'lora', body: 'fraunces' },
    palettes: [
      {
        label: 'Parchment',
        paper: '#FBF7EC',
        page: '#8A3B2A',
        ink: '#2A2118',
        soft: '#6C6152',
        deep: '#2F3E30',
        pageBack: '#94A68D',
        onDeep: '#FBF7EC',
      },
      {
        label: 'Classroom',
        paper: '#F5F8F5',
        page: '#1F6A5A',
        ink: '#14352D',
        soft: '#566B65',
        deep: '#14352D',
        pageBack: '#6D9B8E',
        onDeep: '#F5F8F5',
      },
      {
        label: 'Ink Blue',
        paper: '#F7F8FB',
        page: '#27408B',
        ink: '#172452',
        soft: '#58617F',
        deep: '#172452',
        pageBack: '#7384BD',
        onDeep: '#F7F8FB',
      },
      {
        label: 'Mulberry',
        paper: '#FCF6F7',
        page: '#8A2C5A',
        ink: '#3E1730',
        soft: '#725C69',
        deep: '#3E1730',
        pageBack: '#A9708D',
        onDeep: '#FCF6F7',
      },
    ],
    sample: PEOPLE.teacher,
    sides: {
      front: {
        background: '$paper',
        stacks: {
          who: { x: 4.4, y: 6, w: VW - 8.8, h: 26, anchor: 'bottom', gap: 1 },
          reach: { x: 4.4, y: 58.5, w: VW - 8.8, h: 26, anchor: 'top' },
        },
        elements: [
          A('pages', pageEdges(VW / 2, 54, 9, 21, 19), { stroke: '$page', sw: 0.18 }, VW, VH),
          T('name', '{name}', 4.4, VW - 8.8, 14.5, {
            stack: 'who',
            font: '$heading',
            weight: 600,
            fill: '$ink',
            align: 'center',
            minSize: 10,
            maxLines: 2,
            lineHeight: 1.1,
          }),
          T('title', '{title}', 4.4, VW - 8.8, 7, {
            stack: 'who',
            fill: '$soft',
            align: 'center',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
          }),
          T('company', '{company}', 4.4, VW - 8.8, 7, {
            stack: 'who',
            weight: 600,
            fill: '$page',
            align: 'center',
            minSize: 5.8,
            maxLines: 2,
            lineHeight: 1.22,
            optional: true,
          }),
          L('contact', ['phone', 'email', 'website', 'address'], 4.4, VW - 8.8, 6.6, {
            stack: 'reach',
            fill: '$ink',
            align: 'center',
            icons: false,
            rowHeight: 1.6,
          }),
        ],
      },
      back: {
        background: '$deep',
        stacks: { brand: { x: 5, y: 6, w: VW - 10, h: 32, anchor: 'top', gap: 1.3 } },
        elements: [
          A('pages', pageEdges(VW / 2, VH + 1, 9, 25, 16), { stroke: '$pageBack', sw: 0.18 }, VW, VH),
          LOGO('logo', VW / 2 - 6, 6, 12, '$onDeep', { stack: 'brand', fallbackWeight: 600, fallbackSize: 17 }),
          T('company', '{company}', 5, VW - 10, 12, {
            stack: 'brand',
            font: '$heading',
            weight: 600,
            fill: '$onDeep',
            align: 'center',
            minSize: 8.5,
            maxLines: 3,
            lineHeight: 1.12,
          }),
          T('tagline', '{tagline}', 5, VW - 10, 6.6, {
            stack: 'brand',
            fill: '$onDeep',
            opacity: 0.82,
            align: 'center',
            minSize: 5.7,
            maxLines: 2,
            lineHeight: 1.25,
            optional: true,
          }),
          QR('qr', VW / 2 - 13, 41, 26, { r: 0.8 }),
        ],
      },
    },
  },
];
