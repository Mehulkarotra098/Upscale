// The free QR code generator. Everything runs in the visitor's browser: nothing they type leaves the page,
// and the codes hold their content directly, so they never expire and nothing can track who scans them.
import { render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { a4Grid, svgTilesToPdf, svgToCanvas, svgToJpeg, svgToPng, svgsToPdf, zipStore } from '../core/export.js';
import { ICONS } from '../core/icons.js';
import { BALL_SHAPES, ballPath, BODY_SHAPES, bodyPath, FRAME_SHAPES, framePath, logoShare } from '../core/qr.js';
import { fontsUsed, resolveSide, sideToSvg } from '../core/render.js';
import { TextEngine } from '../core/text.js';
import { parseBulk } from './bulk.js';

const engine = new TextEngine(async (file) => {
  const r = await fetch(`/assets/card/fonts/${file}`);
  if (!r.ok) throw new Error(`font ${file}`);
  return r.arrayBuffer();
});

const HL = {
  Link: 'Link',
  Contact: 'Contact',
  'UPI payment': 'UPI payment',
  Location: 'Location',
  'Phone call': 'Phone call',
  Text: 'Text',
  'Website or link': 'Website ya link',
  'WhatsApp number': 'WhatsApp number',
  'Message they start with (optional)': 'Pehla message (optional)',
  'UPI ID': 'UPI ID',
  'Name shown when paying': 'Payment par dikhne wala naam',
  'Fixed amount in ₹ (optional)': 'Fixed amount ₹ me (optional)',
  'Network name': 'Network ka naam',
  'Password (leave empty if open)': 'Password (open ho to khali chhodein)',
  'Maps link or address': 'Maps link ya address',
  'Phone number': 'Phone number',
  'Message (optional)': 'Message (optional)',
  'Email address': 'Email address',
  'Subject (optional)': 'Subject (optional)',
  'Your text': 'Aapka text',
  Name: 'Naam',
  'Job title': 'Job title',
  Business: 'Business',
  Phone: 'Phone',
  Email: 'Email',
  Website: 'Website',
  Address: 'Address',
  'Before you print this, pay ₹1 from another phone and check that it reaches you.':
    'Print se pehle dusre phone se ₹1 bhej kar check karein ki aapko mila.',
  'Anyone who can see this code can read the password.': 'Jo bhi ye code dekh sakta hai, password padh sakta hai.',
  'If the page behind this link stops working, the code stops too. Use a link you plan to keep.':
    'Link ka page band hua to code bhi band ho jayega. Aisa link lagayein jo chalta rahe.',
  'What should it open?': 'Ye kya khole?',
  Style: 'Style',
  Colours: 'Colours',
  'Logo and frame': 'Logo aur frame',
  'Quick styles': 'Quick styles',
  Pattern: 'Pattern',
  'Eye frame': 'Eye frame',
  'Eye centre': 'Eye centre',
  Code: 'Code',
  'Code, start': 'Code, shuru',
  'Code, end': 'Code, ant',
  Background: 'Background',
  'Gradient on the code': 'Code par gradient',
  'Transparent background': 'Transparent background',
  'Make the eyes match the code': 'Eyes ko code jaisa karein',
  'Only place a transparent code on something light and plain, or it may not scan.':
    'Transparent code sirf halke, plain background par lagayein, warna scan nahi hoga.',
  'Logo in the centre': 'Beech me logo',
  None: 'Kuch nahi',
  Upload: 'Upload',
  Icon: 'Icon',
  'Choose another logo': 'Dusra logo chunein',
  'Choose your logo': 'Apna logo chunein',
  'Logo size': 'Logo ka size',
  Frame: 'Frame',
  'Label below': 'Niche label',
  'Label above': 'Upar label',
  Pill: 'Pill',
  Outline: 'Outline',
  Label: 'Label',
  'Frame colour': 'Frame ka colour',
  'Checking that it scans…': 'Scan check ho raha hai…',
  '✓ Scans correctly': '✓ Sahi scan ho raha hai',
  'This code did not scan. Try a darker colour, a simpler shape or a smaller logo.':
    'Ye code scan nahi hua. Gehra colour, simple shape ya chhota logo try karein.',
  'Fill in the details to make your code.': 'Code banane ke liye details bharein.',
  'Type your link to make your code': 'Code banane ke liye apna link likhein',
  'Type your name or number to make your code': 'Code banane ke liye naam ya number likhein',
  'Type your WhatsApp number to make your code': 'Code banane ke liye WhatsApp number likhein',
  'Type your UPI ID to make your code': 'Code banane ke liye UPI ID likhein',
  'Type your network name to make your code': 'Code banane ke liye network ka naam likhein',
  'Type your Maps link or address to make your code': 'Code banane ke liye Maps link ya address likhein',
  'Type your phone number to make your code': 'Code banane ke liye phone number likhein',
  'Type your email address to make your code': 'Code banane ke liye email likhein',
  'Type your text to make your code': 'Code banane ke liye text likhein',
  'PNG size': 'PNG size',
  'Download PNG': 'PNG download karein',
  'Making…': 'Ban raha hai…',
  'Put this on a visiting card →': 'Ise visiting card par lagayein →',
  'Test it with your own phone before you print a lot of copies.': 'Zyada copies print karne se pehle apne phone se test karein.',
  'The pattern changes as you type, because the code holds what you type.':
    'Likhne par pattern badalta hai, kyunki code me wahi likha hota hai.',
  'My styles': 'Mere styles',
  'Save this style': 'Ye style save karein',
  'Many codes at once': 'Ek saath kai codes',
  'One per line. Paste from Excel or Google Sheets, or type a name, a comma, then the link.':
    'Har line me ek. Excel ya Google Sheets se paste karein, ya naam, comma, phir link likhein.',
  'Make all codes': 'Sabhi codes banayein',
  'Print many copies': 'Kai copies print karein',
  'A4 sheet (PDF)': 'A4 sheet (PDF)',
  'Put each name on the frame label': 'Har naam frame ke label par likhein',
};

const KINDS = [
  ['link', 'Link'],
  ['vcard', 'Contact'],
  ['whatsapp', 'WhatsApp'],
  ['upi', 'UPI payment'],
  ['wifi', 'Wi-Fi'],
  ['maps', 'Location'],
  ['phone', 'Phone call'],
  ['sms', 'SMS'],
  ['email', 'Email'],
  ['text', 'Text'],
];

const FIELDS = {
  link: [['value', 'Website or link', 'https://yourbusiness.in', 'url']],
  whatsapp: [
    ['value', 'WhatsApp number', '98765 43210', 'tel'],
    ['msg', 'Message they start with (optional)', 'Hi, I want to know more', 'text'],
  ],
  upi: [
    ['value', 'UPI ID', 'yourname@okhdfc', 'text'],
    ['name', 'Name shown when paying', 'Your business name', 'text'],
    ['amount', 'Fixed amount in ₹ (optional)', 'Leave empty so they can type it', 'text'],
  ],
  wifi: [
    ['value', 'Network name', 'Cafe Guest', 'text'],
    ['pass', 'Password (leave empty if open)', '', 'text'],
  ],
  maps: [['value', 'Maps link or address', 'https://maps.app.goo.gl/…', 'text']],
  phone: [['value', 'Phone number', '+91 98765 43210', 'tel']],
  sms: [
    ['value', 'Phone number', '+91 98765 43210', 'tel'],
    ['msg', 'Message (optional)', '', 'text'],
  ],
  email: [
    ['value', 'Email address', 'you@business.in', 'email'],
    ['subject', 'Subject (optional)', '', 'text'],
  ],
  text: [['value', 'Your text', 'Anything up to about a paragraph', 'text']],
};

const CONTACT_FIELDS = [
  ['name', 'Name', 'Your full name', 'text'],
  ['title', 'Job title', 'Owner', 'text'],
  ['company', 'Business', 'Business or shop name', 'text'],
  ['phone', 'Phone', '+91 98765 43210', 'tel'],
  ['email', 'Email', 'you@business.in', 'email'],
  ['website', 'Website', 'yourbusiness.in', 'url'],
  ['address', 'Address', 'Area, city', 'text'],
];

const NOTES = {
  upi: 'Before you print this, pay ₹1 from another phone and check that it reaches you.',
  wifi: 'Anyone who can see this code can read the password.',
  link: 'If the page behind this link stops working, the code stops too. Use a link you plan to keep.',
};

const EMPTY_TIPS = {
  link: 'Type your link to make your code',
  vcard: 'Type your name or number to make your code',
  whatsapp: 'Type your WhatsApp number to make your code',
  upi: 'Type your UPI ID to make your code',
  wifi: 'Type your network name to make your code',
  maps: 'Type your Maps link or address to make your code',
  phone: 'Type your phone number to make your code',
  sms: 'Type your phone number to make your code',
  email: 'Type your email address to make your code',
  text: 'Type your text to make your code',
};

const PRESETS = [
  ['Classic', {}],
  ['Soft', { body: 'rounded', frame: 'rounded', ball: 'rounded', c1: '#14284B' }],
  ['Dots', { body: 'dots', frame: 'round', ball: 'circle', c1: '#111111' }],
  ['Flow', { body: 'blob', frame: 'round', ball: 'rounded', c1: '#16325C' }],
  ['Leaf', { body: 'leaf', frame: 'leaf', ball: 'leaf', c1: '#0B5D3B' }],
  ['Royal', { body: 'classy', frame: 'leafout', ball: 'leafout', c1: '#43173F', frameC: '#A8326E' }],
  ['Glow', { body: 'rounded', frame: 'round', ball: 'circle', c1: '#4B2FD1', c2: '#C2185B', gradient: true }],
  ['Bars', { body: 'vbars', frame: 'rounded', ball: 'rounded', c1: '#8A2A0B' }],
];
const STYLE_KEYS = ['body', 'frame', 'ball', 'c1', 'c2', 'gradient', 'frameC', 'ballC'];
// A saved style also keeps the background, frame and centre icon. An uploaded logo is too big to keep in the browser's store.
const SAVED_KEYS = [...STYLE_KEYS, 'bg', 'clear', 'outer', 'outerC', 'icon', 'logoSize'];
const SAVED_MAX = 8;
const HEX = /^#[0-9a-f]{6}$/i;

function readStyles() {
  try {
    const list = JSON.parse(localStorage.getItem('us-qr-styles') || '[]');
    if (!Array.isArray(list)) return [];
    return list
      .filter((x) => x && typeof x === 'object')
      .slice(0, SAVED_MAX)
      .map((x) => {
        const out = {};
        for (const k of SAVED_KEYS) {
          const v = x[k];
          if (
            ['c1', 'c2', 'bg', 'outerC'].includes(k) ? HEX.test(v) : ['frameC', 'ballC'].includes(k) ? v === '' || HEX.test(v) : v != null
          )
            out[k] = v;
        }
        out.logo = x.logo === 'icon' ? 'icon' : null;
        return out;
      });
  } catch {
    return [];
  }
}

// Types with one main value, so a list can supply that value line by line. A contact has many fields, so it is left out.
const BULK_KINDS = new Set(['link', 'text', 'phone', 'whatsapp', 'upi', 'maps', 'sms', 'email']);
const BULK_MAX = 200;
const SHEET_WIDTHS = [30, 40, 50, 60, 90];

const fileSlug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'code';
// The sheet's captions use a built-in PDF font, which only has Latin letters.
const latin = (text) =>
  String(text)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .trim();

const FRAMES = [
  ['none', 'None'],
  ['bottom', 'Label below'],
  ['top', 'Label above'],
  ['pill', 'Pill'],
  ['outline', 'Outline'],
];
const CENTRE_ICONS = [
  'phone',
  'mail',
  'globe',
  'map-pin',
  'message-circle',
  'star',
  'calendar',
  'camera',
  'heart',
  'shopping-bag',
  'user',
  'music',
].filter((n) => Object.hasOwn(ICONS, n));

const START = {
  kind: 'link',
  input: { link: { value: 'https://uscale.in/tools' } },
  contact: {},
  body: undefined,
  frame: undefined,
  ball: undefined,
  c1: '#111111',
  c2: '#1F6FEB',
  gradient: false,
  frameC: '',
  ballC: '',
  bg: '#FFFFFF',
  clear: false,
  logo: null,
  logoSrc: null,
  logoW: 1,
  logoH: 1,
  icon: 'phone',
  logoSize: 0.22,
  outer: 'none',
  label: 'Scan me',
  outerC: '#14284B',
  png: 2048,
};

const readable = (hex) => {
  const n = parseInt(String(hex).slice(1, 7).padEnd(6, '0'), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) > 150 ? '#111111' : '#FFFFFF';
};

/** The whole design as one small "card", so it uses the same drawing and export code as the card maker. */
export function toDoc(s) {
  const q = { id: 'qr', type: 'qr', r: 0 };
  if (s.kind === 'vcard') q.data = 'vcard';
  else q.qrKind = s.kind;
  q.data ??= '';
  q.qrIn = s.input[s.kind] ?? {};
  q.body = s.body;
  q.frame = s.frame;
  q.ball = s.ball;
  q.dark = s.gradient
    ? {
        type: 'linear',
        angle: 45,
        stops: [
          [0, s.c1],
          [1, s.c2],
        ],
      }
    : s.c1;
  if (s.frameC) q.frameColor = s.frameC;
  if (s.ballC) q.ballColor = s.ballC;
  q.light = s.clear ? 'none' : s.bg;
  if (s.logo === 'icon') {
    q.qrLogo = 'icon';
    q.qrIcon = s.icon;
  } else if (s.logo === 'own' && s.logoSrc) {
    q.qrLogo = 'own';
    q.qrSrc = s.logoSrc;
    q.imgW = s.logoW;
    q.imgH = s.logoH;
  }
  q.qrLogoSize = s.logoSize;

  const elements = [];
  let size;
  const label = (x, y, w, h, fill) => ({
    id: 'label',
    type: 'text',
    text: s.label,
    x,
    y,
    w,
    h,
    size: 22,
    minSize: 9,
    weight: 700,
    font: '$body',
    fill,
    align: 'center',
    valign: 'middle',
    noWrap: true,
    lineHeight: 1.1,
  });
  const hasLabel = s.outer !== 'none' && s.label.trim();
  if (s.outer === 'bottom' || s.outer === 'top') {
    size = { w: 70, h: 86 };
    const qrY = s.outer === 'top' ? 21 : 5;
    elements.push({ id: 'panel', type: 'rect', x: 0, y: 0, w: 70, h: 86, r: 5, fill: s.outerC });
    elements.push({ id: 'plate', type: 'rect', x: 4, y: qrY - 1, w: 62, h: 62, r: 3, fill: s.clear ? '#FFFFFF' : s.bg });
    Object.assign(q, { x: 5, y: qrY, w: 60, quiet: 2, light: 'none' });
    elements.push(q);
    if (hasLabel) elements.push(label(4, s.outer === 'top' ? 2 : 67, 62, 17, readable(s.outerC)));
  } else if (s.outer === 'pill') {
    size = { w: 66, h: 84 };
    Object.assign(q, { x: 3, y: 3, w: 60, quiet: 2 });
    elements.push(q);
    elements.push({ id: 'panel', type: 'rect', x: 5, y: 66, w: 56, h: 15, r: 7.5, fill: s.outerC });
    if (hasLabel) elements.push(label(7, 66, 52, 15, readable(s.outerC)));
  } else if (s.outer === 'outline') {
    size = { w: 70, h: 86 };
    elements.push({
      id: 'panel',
      type: 'rect',
      x: 1,
      y: 1,
      w: 68,
      h: 84,
      r: 5,
      fill: s.clear ? '#FFFFFF' : s.bg,
      stroke: s.outerC,
      sw: 1.6,
    });
    Object.assign(q, { x: 5, y: 5, w: 60, quiet: 2, light: 'none' });
    elements.push(q);
    if (hasLabel) elements.push(label(4, 67, 62, 16, s.outerC));
  } else {
    size = { w: 60, h: 60 };
    Object.assign(q, { x: 0, y: 0, w: 60, quiet: 3 });
    elements.push(q);
  }
  return {
    v: 1,
    fonts: { heading: 'inter', body: 'inter' },
    palette: {},
    fields: s.kind === 'vcard' ? s.contact : {},
    size,
    sides: { front: { background: s.clear || s.outer !== 'none' ? 'none' : s.bg, elements }, back: { background: 'none', elements: [] } },
  };
}

/** Scan the real render. A phone sees a code at many distances as it moves, so any one of these will do. */
async function scanOk(svg, payload, mm) {
  const { default: jsQR } = await import('jsqr');
  for (const px of [700, 1000, 450]) {
    const dpi = (px / mm) * 25.4;
    const c = await svgToCanvas(svg, dpi);
    const flat = document.createElement('canvas');
    flat.width = c.width;
    flat.height = c.height;
    const x = flat.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, 0, flat.width, flat.height);
    x.drawImage(c, 0, 0);
    const im = x.getImageData(0, 0, flat.width, flat.height);
    const found = jsQR(im.data, im.width, im.height, { inversionAttempts: 'dontInvert' });
    if (found?.data === payload) return true;
  }
  return false;
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const SAMPLE_CELLS = ['10110', '11101', '01011', '11010', '10111'];
const onSample = (r, c) => SAMPLE_CELLS[r]?.[c] === '1';

function ShapeGrid({ label, names, value, draw, view, onPick }) {
  return (
    <div class="qt-field">
      <span>{label}</span>
      <div class="qt-shapes">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={`${label}: ${name}`}
            aria-pressed={(value ?? 'square') === name}
            onClick={() => onPick(name === 'square' ? undefined : name)}
          >
            <svg viewBox={view} aria-hidden="true">
              <path d={draw(name)} fill="currentColor" fill-rule={name === 'dots' ? 'nonzero' : 'evenodd'} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function Colour({ label, value, onChange, children }) {
  return (
    <label class="qt-colour">
      <input type="color" value={value} onInput={(e) => onChange(e.target.value)} />
      <span>{label}</span>
      {children}
    </label>
  );
}

function Section({ n, title, open, onToggle, children }) {
  return (
    <section class={`qt-sec${open ? ' is-open' : ''}`}>
      <h3>
        <button type="button" aria-expanded={open} onClick={onToggle}>
          <i aria-hidden="true">{n}</i>
          {title}
          <b aria-hidden="true">{open ? '−' : '+'}</b>
        </button>
      </h3>
      {open ? <div class="qt-sec__body">{children}</div> : null}
    </section>
  );
}

function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('us-card-ui-lang') === 'hl' ? 'hl' : 'en';
    } catch {
      return 'en';
    }
  });
  const t = (str) => (lang === 'hl' ? (HL[str] ?? str) : str);
  const [s, setS] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('us-qr-tool') || 'null');
      if (saved && typeof saved === 'object' && KINDS.some(([k]) => k === saved.kind)) return { ...START, ...saved };
    } catch {
      /* A blocked or empty store just means starting fresh. */
    }
    return START;
  });
  const [open, setOpen] = useState({ 1: true, 2: true, 3: false, 4: false, 5: false });
  const [preview, setPreview] = useState('');
  const [scan, setScan] = useState('wait');
  const [warnings, setWarnings] = useState([]);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [styles, setStyles] = useState(readStyles);
  const [bulk, setBulk] = useState('');
  const [bulkNames, setBulkNames] = useState(true);
  const [bulkNote, setBulkNote] = useState('');
  const [sheetW, setSheetW] = useState(40);
  const latest = useRef({ svg: '', payload: '', size: null });
  const outRef = useRef(null);
  const toolRef = useRef(null);
  const endRef = useRef(null);
  const [outOfView, setOutOfView] = useState(false);
  const [inTool, setInTool] = useState(true);
  const [pastEnd, setPastEnd] = useState(false);
  // On a phone the controls are below the code, so a small copy stays in sight while choosing shapes and colours.
  // It shows only while the tool itself fills the screen: once you scroll on into the guide below, it goes away.
  useEffect(() => {
    if (!outRef.current || !toolRef.current || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setOutOfView(!e.isIntersecting), { threshold: 0.15 });
    io.observe(outRef.current);
    const tool = new IntersectionObserver(([e]) => setInTool(e.isIntersecting), { rootMargin: '0px 0px -45% 0px' });
    tool.observe(toolRef.current);
    const end = new IntersectionObserver(([e]) => setPastEnd(e.isIntersecting || e.boundingClientRect.top < 0));
    if (endRef.current) end.observe(endRef.current);
    return () => {
      io.disconnect();
      tool.disconnect();
      end.disconnect();
    };
  }, []);
  const set = (patch) => setS((old) => ({ ...old, ...patch }));
  const setInput = (k, v) => setS((old) => ({ ...old, input: { ...old.input, [old.kind]: { ...(old.input[old.kind] ?? {}), [k]: v } } }));

  useEffect(() => {
    let live = true;
    const timer = setTimeout(async () => {
      try {
        const doc = toDoc(s);
        if (s.outer !== 'none' && s.label.trim()) await engine.ensure(fontsUsed(doc));
        if (!live) return;
        const { ops, warnings: found } = resolveSide(doc, 'front', engine);
        const qr = ops.find((o) => o.qr);
        const hasDetails = s.kind !== 'vcard' || Object.values(s.contact).some((v) => String(v ?? '').trim());
        const empty = !qr || !hasDetails;
        // Nothing to encode yet: a faded sample still shows the style being chosen, and can't be mistaken for the real code.
        const shown = empty ? toDoc({ ...s, kind: 'link', input: { link: { value: 'https://uscale.in/tools' } } }) : doc;
        const { svg } = sideToSvg(shown, 'front', engine, { bleed: false });
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
        setWarnings(found.filter((w) => w.code !== 'qr-small'));
        latest.current = empty ? { svg: '', payload: '', size: doc.size } : { svg, payload: qr.qr.payload, size: doc.size };
        if (empty) return setScan('empty');
        setScan('wait');
        const ok = await scanOk(svg, qr.qr.payload, Math.max(doc.size.w, doc.size.h));
        if (live) setScan(ok ? 'ok' : 'bad');
      } catch {
        if (live) setScan('none');
      }
    }, 160);
    try {
      localStorage.setItem('us-qr-tool', JSON.stringify({ ...s, logoSrc: null, logo: s.logo === 'own' ? null : s.logo }));
    } catch {
      /* Remembering choices is only a convenience. */
    }
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [s]);

  const presets = useMemo(
    () =>
      PRESETS.map(([name, style]) => {
        const svg = sideToSvg(
          toDoc({ ...START, ...style, c1: style.c1 ?? '#111111', input: { link: { value: 'uscale.in' } }, kind: 'link' }),
          'front',
          engine,
          { bleed: false },
        ).svg;
        return { name, style, src: `data:image/svg+xml;base64,${btoa(svg)}` };
      }),
    [],
  );
  const previews = useMemo(
    () => ({
      body: (name) => bodyPath(name, 5, onSample, 0, 0, 1),
      frame: (name) => framePath(name, 0, 0, 1, 0),
      ball: (name) => ballPath(name, 0, 0, 1, 0),
    }),
    [],
  );

  const download = async (type) => {
    const { svg, size } = latest.current;
    if (!svg) return;
    setBusy(type);
    setNote('');
    try {
      if (type === 'svg') save(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg');
      if (type === 'png') save(await svgToPng(svg, (s.png / Math.max(size.w, size.h)) * 25.4), `qr-code-${s.png}px.png`);
      if (type === 'jpg') save(await svgToJpeg(svg, (s.png / Math.max(size.w, size.h)) * 25.4), `qr-code-${s.png}px.jpg`);
      if (type === 'pdf') {
        const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
        save(await svgsToPdf([{ svg }], { jsPDF, svg2pdf }, { title: 'QR code' }), 'qr-code.pdf');
      }
      if (type === 'sheet') {
        const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
        const n = a4Grid(sheetW, (sheetW * size.h) / size.w).perPage;
        const items = Array.from({ length: n }, () => ({ svg }));
        save(await svgTilesToPdf(items, { jsPDF, svg2pdf }, { tileW: sheetW, title: 'QR code sheet' }), `qr-code-a4-sheet-${n}.pdf`);
      }
    } catch {
      setNote('That download did not work. Please try again, or open this page in Chrome or Safari.');
    }
    setBusy('');
  };

  const keepStyles = (list) => {
    setStyles(list);
    try {
      localStorage.setItem('us-qr-styles', JSON.stringify(list));
    } catch {
      /* Saved styles are only a convenience. */
    }
  };
  const saveStyle = () => {
    const mine = Object.fromEntries(SAVED_KEYS.map((k) => [k, s[k]]));
    mine.logo = s.logo === 'icon' ? 'icon' : null;
    const same = (a) => SAVED_KEYS.every((k) => a[k] === mine[k]) && a.logo === mine.logo;
    keepStyles([mine, ...styles.filter((a) => !same(a))].slice(0, SAVED_MAX));
  };
  const styleThumb = (style) =>
    `data:image/svg+xml;base64,${btoa(
      sideToSvg(toDoc({ ...START, ...style, label: '', input: { link: { value: 'uscale.in' } }, kind: 'link' }), 'front', engine, {
        bleed: false,
      }).svg,
    )}`;

  const bulkRows = useMemo(() => parseBulk(bulk, s.kind), [bulk, s.kind]);
  const makeBulk = async (format) => {
    const rows = bulkRows.slice(0, BULK_MAX);
    if (!rows.length) return;
    setBusy('bulk');
    setBulkNote('');
    try {
      const useNames = bulkNames && s.outer !== 'none';
      const made = [];
      const unread = [];
      let skipped = 0;
      for (const [i, row] of rows.entries()) {
        const doc = toDoc({
          ...s,
          label: useNames && row.name ? row.name.slice(0, 32) : s.label,
          input: { ...s.input, [s.kind]: { ...(s.input[s.kind] ?? {}), value: row.value } },
        });
        if (i === 0 && s.outer !== 'none') await engine.ensure(fontsUsed(doc));
        const qr = resolveSide(doc, 'front', engine).ops.find((o) => o.qr);
        if (!qr) {
          skipped++;
          continue;
        }
        const { svg } = sideToSvg(doc, 'front', engine, { bleed: false });
        // Each code holds different text, so each one gets the same scan check as the code on screen.
        setBulkNote(`Checking ${i + 1} of ${rows.length}…`);
        if (!(await scanOk(svg, qr.qr.payload, Math.max(doc.size.w, doc.size.h)))) unread.push(i + 1);
        made.push({ svg, size: doc.size, name: row.name, file: `${String(i + 1).padStart(3, '0')}-${fileSlug(row.name || row.value)}` });
      }
      if (!made.length) throw new Error('none');
      const px = Math.min(s.png, 2048);
      if (format === 'pdf') {
        const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
        const items = made.map((m, i) => ({ svg: m.svg, caption: latin(m.name) || String(i + 1) }));
        save(
          await svgTilesToPdf(items, { jsPDF, svg2pdf }, { tileW: sheetW, title: 'QR codes', captions: true }),
          `qr-codes-a4-${made.length}.pdf`,
        );
      } else {
        const files = [];
        for (const [i, m] of made.entries()) {
          setBulkNote(`Making ${i + 1} of ${made.length}…`);
          const blob =
            format === 'svg'
              ? new Blob([m.svg], { type: 'image/svg+xml' })
              : await svgToPng(m.svg, (px / Math.max(m.size.w, m.size.h)) * 25.4);
          files.push({ name: `${m.file}.${format}`, bytes: new Uint8Array(await blob.arrayBuffer()) });
          // Let the page breathe, so the count above is seen and the tab stays responsive.
          if (i % 5 === 4) await new Promise((r) => setTimeout(r, 0));
        }
        save(zipStore(files), `qr-codes-${made.length}.zip`);
      }
      const skippedNote = skipped
        ? ` ${skipped} ${skipped === 1 ? 'line was' : 'lines were'} skipped because nothing could be made from ${skipped === 1 ? 'it' : 'them'}.`
        : '';
      const unreadNote = unread.length
        ? ` Line${unread.length === 1 ? '' : 's'} ${unread.slice(0, 12).join(', ')}${unread.length > 12 ? ' and more' : ''} did not pass the scan check with this style. Pick a simpler pattern or a darker colour, then make ${unread.length === 1 ? 'it' : 'them'} again.`
        : ' Every code passed the scan check.';
      setBulkNote(
        `${made.length} ${made.length === 1 ? 'code' : 'codes'} made.${skippedNote}${unreadNote} Test a few with your phone before you print.`,
      );
    } catch {
      setBulkNote('That did not work. Check the list, then try again, or open this page in Chrome or Safari.');
    }
    setBusy('');
  };

  const toCard = () => {
    const doc = toDoc(s);
    const q = doc.sides.front.elements.find((e) => e.type === 'qr');
    const { x: _x, y: _y, w: _w, quiet: _q, r: _r, ...style } = q;
    try {
      localStorage.setItem(
        'us-qr-for-card',
        JSON.stringify({ el: { ...style, light: s.clear ? '#FFFFFF' : s.bg }, contact: s.kind === 'vcard' ? s.contact : null }),
      );
    } catch {
      setNote('Your browser blocked saving this, so it can’t carry over to the card maker.');
      return;
    }
    location.href = '/tools/visiting-card-maker/editor?addqr=1';
  };

  const onLogo = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type) || f.size > 15 * 1024 * 1024) {
      setNote('Use a PNG, JPG, WebP or SVG image under 15 MB.');
      return;
    }
    const url = URL.createObjectURL(f);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      // Redrawn as a plain PNG: that removes anything active hidden in an SVG, and gives a format every export can embed.
      const w = img.naturalWidth || 512;
      const h = img.naturalHeight || 512;
      const k = Math.min(1, 600 / Math.max(w, h)) || 1;
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * k));
      c.height = Math.max(1, Math.round(h * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      set({ logo: 'own', logoSrc: c.toDataURL('image/png'), logoW: c.width, logoH: c.height });
      setNote('');
    } catch {
      setNote('That image could not be read. Try another file.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const fields = FIELDS[s.kind];
  const input = s.input[s.kind] ?? {};
  const scanText = {
    wait: 'Checking that it scans…',
    ok: '✓ Scans correctly',
    bad: 'This code did not scan. Try a darker colour, a simpler shape or a smaller logo.',
    empty: 'Fill in the details to make your code.',
  }[scan];

  return (
    <div class="qt" ref={toolRef}>
      <div class="qt-controls">
        <div class="qt-lang">
          <button
            type="button"
            aria-label="Switch between English and Hinglish"
            onClick={() => {
              const v = lang === 'en' ? 'hl' : 'en';
              setLang(v);
              try {
                localStorage.setItem('us-card-ui-lang', v);
              } catch {
                /* The choice just won't be remembered. */
              }
            }}
          >
            {lang === 'en' ? 'Hinglish me dekhein' : 'View in English'}
          </button>
        </div>
        <Section n="1" title={t('What should it open?')} open={open[1]} onToggle={() => setOpen({ ...open, 1: !open[1] })}>
          <div class="qt-kinds" role="group" aria-label="Type of QR code">
            {KINDS.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={s.kind === k} onClick={() => set({ kind: k })}>
                {t(label)}
              </button>
            ))}
          </div>
          {s.kind === 'vcard'
            ? CONTACT_FIELDS.map(([k, label, ph, type]) => (
                <label class="qt-input" key={k}>
                  <span>{t(label)}</span>
                  <input
                    type={type}
                    placeholder={ph}
                    value={s.contact[k] ?? ''}
                    maxLength={200}
                    onInput={(e) => set({ contact: { ...s.contact, [k]: e.target.value } })}
                  />
                </label>
              ))
            : fields.map(([k, label, ph, type]) => (
                <label class="qt-input" key={k}>
                  <span>{t(label)}</span>
                  <input type={type} placeholder={ph} value={input[k] ?? ''} maxLength={600} onInput={(e) => setInput(k, e.target.value)} />
                </label>
              ))}
          {NOTES[s.kind] ? <p class="qt-note">{t(NOTES[s.kind])}</p> : null}
        </Section>
        <Section n="2" title={t('Style')} open={open[2]} onToggle={() => setOpen({ ...open, 2: !open[2] })}>
          <div class="qt-field">
            <span>{t('Quick styles')}</span>
            <div class="qt-presets">
              {presets.map(({ name, style, src }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => set({ ...Object.fromEntries(STYLE_KEYS.map((k) => [k, START[k]])), ...style })}
                >
                  <img src={src} alt="" width="64" height="64" />
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div class="qt-field">
            <span>{t('My styles')}</span>
            <div class="qt-mystyles">
              {styles.map((style, i) => (
                <span class="qt-mine" key={i}>
                  <button type="button" aria-label={`Use saved style ${i + 1}`} onClick={() => set({ ...style })}>
                    <img src={styleThumb(style)} alt="" width="64" height="64" />
                  </button>
                  <button
                    type="button"
                    class="qt-mine__x"
                    aria-label={`Remove saved style ${i + 1}`}
                    onClick={() => keepStyles(styles.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button type="button" class="qt-mine__add" onClick={saveStyle}>
                <b aria-hidden="true">+</b>
                {t('Save this style')}
              </button>
            </div>
            <p class="qt-note">Saved in this browser, so your next code can match. Up to {SAVED_MAX} styles.</p>
          </div>
          <ShapeGrid
            label={t('Pattern')}
            names={BODY_SHAPES}
            value={s.body}
            draw={previews.body}
            view="-0.2 -0.2 5.4 5.4"
            onPick={(v) => set({ body: v })}
          />
          <ShapeGrid
            label={t('Eye frame')}
            names={FRAME_SHAPES}
            value={s.frame}
            draw={previews.frame}
            view="-0.3 -0.3 7.6 7.6"
            onPick={(v) => set({ frame: v })}
          />
          <ShapeGrid
            label={t('Eye centre')}
            names={BALL_SHAPES}
            value={s.ball}
            draw={previews.ball}
            view="-0.4 -0.4 3.8 3.8"
            onPick={(v) => set({ ball: v })}
          />
        </Section>
        <Section n="3" title={t('Colours')} open={open[3]} onToggle={() => setOpen({ ...open, 3: !open[3] })}>
          <div class="qt-colours">
            <Colour label={t(s.gradient ? 'Code, start' : 'Code')} value={s.c1} onChange={(v) => set({ c1: v })} />
            {s.gradient ? <Colour label={t('Code, end')} value={s.c2} onChange={(v) => set({ c2: v })} /> : null}
            <Colour label={t('Eye frame')} value={s.frameC || s.c1} onChange={(v) => set({ frameC: v })} />
            <Colour label={t('Eye centre')} value={s.ballC || s.c1} onChange={(v) => set({ ballC: v })} />
            <Colour label={t('Background')} value={s.bg} onChange={(v) => set({ bg: v, clear: false })} />
          </div>
          <label class="qt-check">
            <input type="checkbox" checked={s.gradient} onChange={(e) => set({ gradient: e.target.checked })} />
            {t('Gradient on the code')}
          </label>
          <label class="qt-check">
            <input type="checkbox" checked={s.clear} onChange={(e) => set({ clear: e.target.checked })} />
            {t('Transparent background')}
          </label>
          {s.frameC || s.ballC ? (
            <button type="button" class="qt-link" onClick={() => set({ frameC: '', ballC: '' })}>
              {t('Make the eyes match the code')}
            </button>
          ) : null}
          {s.clear ? <p class="qt-note">{t('Only place a transparent code on something light and plain, or it may not scan.')}</p> : null}
        </Section>
        <Section n="4" title={t('Logo and frame')} open={open[4]} onToggle={() => setOpen({ ...open, 4: !open[4] })}>
          <div class="qt-field">
            <span>{t('Logo in the centre')}</span>
            <div class="qt-seg">
              {[
                [null, 'None'],
                ['own', 'Upload'],
                ['icon', 'Icon'],
              ].map(([v, label]) => (
                <button key={label} type="button" aria-pressed={s.logo === v} onClick={() => set({ logo: v })}>
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          {s.logo === 'own' ? (
            <label class="qt-upload">
              {t(s.logoSrc ? 'Choose another logo' : 'Choose your logo')}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onLogo} />
            </label>
          ) : null}
          {s.logo === 'icon' ? (
            <div class="qt-shapes">
              {CENTRE_ICONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={name}
                  aria-pressed={s.icon === name}
                  onClick={() => set({ icon: name })}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d={ICONS[name]} />
                  </svg>
                </button>
              ))}
            </div>
          ) : null}
          {s.logo ? (
            <label class="qt-input">
              <span>
                {t('Logo size')}: {Math.round(logoShare(s.logoSize) * 100)}%
              </span>
              <input
                type="range"
                min="0.12"
                max="0.3"
                step="0.01"
                value={logoShare(s.logoSize)}
                onInput={(e) => set({ logoSize: Number(e.target.value) })}
              />
            </label>
          ) : null}
          <div class="qt-field">
            <span>{t('Frame')}</span>
            <div class="qt-seg qt-seg--wrap">
              {FRAMES.map(([v, label]) => (
                <button key={v} type="button" aria-pressed={s.outer === v} onClick={() => set({ outer: v })}>
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          {s.outer !== 'none' ? (
            <>
              <label class="qt-input">
                <span>{t('Label')}</span>
                <input type="text" value={s.label} maxLength={32} onInput={(e) => set({ label: e.target.value })} />
              </label>
              <Colour label={t('Frame colour')} value={s.outerC} onChange={(v) => set({ outerC: v })} />
            </>
          ) : null}
        </Section>
        <Section n="5" title={t('Many codes at once')} open={open[5]} onToggle={() => setOpen({ ...open, 5: !open[5] })}>
          {BULK_KINDS.has(s.kind) ? (
            <>
              <label class="qt-input">
                <span>
                  {t(KINDS.find(([k]) => k === s.kind)[1])}:{' '}
                  {t('One per line. Paste from Excel or Google Sheets, or type a name, a comma, then the link.')}
                </span>
                <textarea
                  class="qt-bulk"
                  rows="6"
                  value={bulk}
                  placeholder={
                    s.kind === 'link' ? 'Table 1, https://yourcafe.in/menu?t=1\nTable 2, https://yourcafe.in/menu?t=2' : 'One on each line'
                  }
                  onInput={(e) => setBulk(e.target.value)}
                />
              </label>
              <p class="qt-note">
                {bulkRows.length
                  ? `${Math.min(bulkRows.length, BULK_MAX)} ${bulkRows.length === 1 ? 'code' : 'codes'} ready.${bulkRows.length > BULK_MAX ? ` Only the first ${BULK_MAX} are made in one go.` : ''}`
                  : `Every code uses the style, colours, logo and frame you chose above. Up to ${BULK_MAX} at a time, free.`}
              </p>
              {s.outer !== 'none' ? (
                <label class="qt-check">
                  <input type="checkbox" checked={bulkNames} onChange={(e) => setBulkNames(e.target.checked)} />
                  {t('Put each name on the frame label')}
                </label>
              ) : null}
              <div class="qt-bulkgo">
                <button
                  type="button"
                  class="btn btn--go"
                  disabled={!bulkRows.length || !!busy || scan === 'bad'}
                  onClick={() => makeBulk('png')}
                >
                  {busy === 'bulk' ? t('Making…') : `${t('Make all codes')} (PNG, zip)`}
                </button>
                <button
                  type="button"
                  class="btn btn--ghost-dark"
                  disabled={!bulkRows.length || !!busy || scan === 'bad'}
                  onClick={() => makeBulk('svg')}
                >
                  SVG
                </button>
                <button
                  type="button"
                  class="btn btn--ghost-dark"
                  disabled={!bulkRows.length || !!busy || scan === 'bad'}
                  onClick={() => makeBulk('pdf')}
                >
                  {t('A4 sheet (PDF)')}
                </button>
              </div>
              {bulkNote ? (
                <p class="qt-note" role="status">
                  {bulkNote}
                </p>
              ) : null}
            </>
          ) : (
            <p class="qt-note">
              A list works for links, WhatsApp numbers, UPI IDs, phone numbers, locations, SMS, email and text. Pick one of those above
              first. A contact or Wi-Fi code holds several details, so make those one at a time.
            </p>
          )}
        </Section>
        <span ref={endRef} class="qt-end" aria-hidden="true" />
      </div>
      {outOfView && inTool && !pastEnd && preview ? (
        <button
          type="button"
          class={`qt-mini qt-mini--${scan}`}
          aria-label="Back to your QR code and downloads"
          onClick={() => outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <img src={preview} alt="" />
        </button>
      ) : null}
      <aside class="qt-out" aria-label="Your QR code" ref={outRef}>
        <div class={`qt-preview${s.clear ? ' qt-preview--clear' : ''}${scan === 'empty' ? ' qt-preview--sample' : ''}`}>
          {scan === 'empty' ? <span class="qt-preview__tip">{t(EMPTY_TIPS[s.kind])}</span> : null}
          {preview ? <img src={preview} alt="Preview of your QR code" /> : null}
        </div>
        {/* An empty code already says what to type, right on the preview. */}
        {scanText ? (
          <p class={`qt-scan qt-scan--${scan}${scan === 'empty' ? ' sr-only' : ''}`} role="status" data-scan={scan}>
            {t(scanText)}
          </p>
        ) : null}
        {warnings
          .filter((w) => w.code !== 'qr-empty')
          .map((w) => (
            <p class="qt-warn" key={w.code}>
              {w.message}
            </p>
          ))}
        <label class="qt-input qt-input--row">
          <span>{t('PNG size')}</span>
          <select value={s.png} onChange={(e) => set({ png: Number(e.target.value) })}>
            <option value="1024">1024 px, WhatsApp and web</option>
            <option value="2048">2048 px, print up to A5</option>
            <option value="4096">4096 px, posters</option>
          </select>
        </label>
        <div class="qt-downloads">
          <button type="button" class="btn btn--go" disabled={scan === 'empty' || !!busy} onClick={() => download('png')}>
            {t(busy === 'png' ? 'Making…' : 'Download PNG')}
          </button>
          <button type="button" class="btn btn--ghost-dark" disabled={scan === 'empty' || !!busy} onClick={() => download('svg')}>
            SVG
          </button>
          <button type="button" class="btn btn--ghost-dark" disabled={scan === 'empty' || !!busy} onClick={() => download('pdf')}>
            {busy === 'pdf' ? t('Making…') : 'PDF'}
          </button>
        </div>
        <div class="qt-sheet">
          <span>{t('Print many copies')}</span>
          <select aria-label="Size of each code on the sheet" value={sheetW} onChange={(e) => setSheetW(Number(e.target.value))}>
            {SHEET_WIDTHS.map((w) => {
              const size = latest.current.size ?? { w: 60, h: 60 };
              return (
                <option key={w} value={w}>
                  {w / 10} cm wide, {a4Grid(w, (w * size.h) / size.w).perPage} on a sheet
                </option>
              );
            })}
          </select>
          <button type="button" class="btn btn--ghost-dark" disabled={scan === 'empty' || !!busy} onClick={() => download('sheet')}>
            {busy === 'sheet' ? t('Making…') : t('A4 sheet (PDF)')}
          </button>
          <button type="button" class="btn btn--ghost-dark" disabled={scan === 'empty' || !!busy} onClick={() => download('jpg')}>
            {busy === 'jpg' ? t('Making…') : 'JPG'}
          </button>
        </div>
        <button type="button" class="qt-tocard" disabled={scan === 'empty'} onClick={toCard}>
          {t('Put this on a visiting card →')}
        </button>
        {note ? <p class="qt-warn">{note}</p> : null}
        <p class="qt-fine">
          {t('The pattern changes as you type, because the code holds what you type.')}{' '}
          {t('Test it with your own phone before you print a lot of copies.')}
        </p>
      </aside>
    </div>
  );
}

const root = document.getElementById('qr-tool');
if (root) {
  root.textContent = '';
  render(<App />, root);
}
