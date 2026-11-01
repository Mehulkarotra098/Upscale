// The QR controls: what the code opens, its colours, a logo in the centre and its shapes.
// Every change is checked by scanning the real render, because shapes, colours and logos can all break a code.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { qrPayload, resolveSide, sideToSvg } from '../core/render.js';
import { ICONS } from '../core/icons.js';
import { svgToCanvas } from '../core/export.js';
import { BALL_SHAPES, ballPath, BODY_SHAPES, bodyPath, FRAME_SHAPES, framePath, logoShare } from '../core/qr.js';
import { readImage, setField } from './actions.js';
import { endTyping, setUi, state } from './store.js';
import { PaintPicker, Slider } from './panels.jsx';

const KINDS = [
  ['link', 'Open a link (website, Instagram…)'],
  ['vcard', 'Save my contact'],
  ['whatsapp', 'Open WhatsApp chat'],
  ['upi', 'UPI payment'],
  ['maps', 'Open my location'],
  ['wifi', 'Join my Wi-Fi'],
  ['phone', 'Call my number'],
  ['sms', 'Send me an SMS'],
  ['email', 'Send me an email'],
  ['text', 'Plain text'],
];
const CENTRE_ICONS = [
  'phone',
  'mail',
  'globe',
  'map-pin',
  'message-circle',
  'wifi',
  'star',
  'calendar',
  'camera',
  'heart',
  'shopping-bag',
  'user',
].filter((n) => Object.hasOwn(ICONS, n));

const kindOf = (el) => el.qrKind ?? (['vcard', 'whatsapp'].includes(el.data) ? el.data : 'link');
// A link is held either way: older designs and templates keep it in `data`, and the QR tool sends `qrKind: 'link'`.
const linkValue = (el) => (el.qrKind === 'link' ? (el.qrIn?.value ?? '') : el.data === 'website' ? '' : el.data);

// A little corner of code, so each shape shows how neighbouring modules behave.
const SAMPLE = ['10110', '11101', '01011', '11010', '10111'];
const onSample = (r, c) => SAMPLE[r]?.[c] === '1';

function ShapeGrid({ names, value, onPick, draw, label, view }) {
  return (
    <>
      <div class="ce-qrhint">{label}</div>
      <div class="ce-qrgrid">
        {names.map((name) => (
          <button
            key={name}
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
    </>
  );
}

/** Scan what will actually print. A phone sees a code at many distances as it moves, so any one of these will do. */
async function scan(doc, side, el, engine) {
  const op = resolveSide(doc, side, engine).ops.find((o) => o.id === el.id && o.qr);
  if (!op) return 'none';
  const { svg } = sideToSvg(doc, side, engine, { bleed: false });
  const { default: jsQR } = await import('jsqr');
  const pad = 2;
  for (const dpi of [600, 300, 450]) {
    const canvas = await svgToCanvas(svg, dpi);
    const k = dpi / 25.4;
    const sx = el.rot ? 0 : Math.max(0, Math.floor((el.x - pad) * k));
    const sy = el.rot ? 0 : Math.max(0, Math.floor((el.y - pad) * k));
    const sw = el.rot ? canvas.width : Math.min(canvas.width - sx, Math.ceil((el.w + 2 * pad) * k));
    const sh = el.rot ? canvas.height : Math.min(canvas.height - sy, Math.ceil((el.w + 2 * pad) * k));
    const im = canvas.getContext('2d').getImageData(sx, sy, sw, sh);
    const found = jsQR(im.data, im.width, im.height, { inversionAttempts: 'dontInvert' });
    if (found?.data === op.qr.payload) return 'ok';
  }
  return 'bad';
}

function ScanStatus({ t, el, doc, engine }) {
  const [status, setStatus] = useState('wait');
  const side = state.side;
  // The design is replaced on every edit, so this runs again after each change.
  useEffect(() => {
    let live = true;
    setStatus('wait');
    const timer = setTimeout(async () => {
      try {
        const r = await scan(doc, side, el, engine);
        if (live) setStatus(r);
      } catch {
        if (live) setStatus('none');
      }
    }, 450);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [doc, side, el, engine]);
  if (status === 'none') return null;
  const text = {
    wait: t('Checking the code…'),
    ok: `✓ ${t('Scans correctly')}`,
    bad: t('This code did not scan. Try a darker colour, a simpler shape, a smaller logo or a bigger code.'),
  }[status];
  return (
    <p class={`ce-qrscan ce-qrscan--${status}`} role="status" data-qrscan={status}>
      {text}
    </p>
  );
}

function Input({ label, value, onChange, hint, type = 'text', placeholder }) {
  return (
    <label class="ce-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        maxLength={600}
        onInput={(e) => onChange(e.target.value)}
        onBlur={endTyping}
      />
      {hint ? <em>{hint}</em> : null}
    </label>
  );
}

/** A code that reads the card's own details gets its box right here, and typing updates the card too. */
function DetailField({ t, doc, templates, field, label }) {
  return (
    <Input
      label={t(label)}
      value={doc.user?.[field] ?? ''}
      placeholder={t('Type yours here')}
      onChange={(v) => setField(field, v, templates)}
      hint={t('This updates your card too.')}
    />
  );
}

/** Says exactly where the code goes, and whether it's still the design's sample details. */
function WhatItOpens({ t, el, doc, kind }) {
  const payload = qrPayload(el, doc.fields ?? {});
  if (!payload) return <p class="ce-qrsample">{t('Add this to make your code. Until then, nothing prints here.')}</p>;
  const typedSite = String(doc.user?.website ?? '').trim();
  const usesSite = kind === 'link' && !String(el.qrIn?.value ?? '').trim() && (el.qrKind === 'link' || el.data === 'website');
  const usesContact = kind === 'vcard' && !['name', 'phone', 'email', 'company', 'website'].some((k) => String(doc.user?.[k] ?? '').trim());
  const usesWa = kind === 'whatsapp' && !el.qrKind && !['whatsapp', 'phone'].some((k) => String(doc.user?.[k] ?? '').trim());
  if ((usesSite && !typedSite) || usesContact || usesWa) {
    return (
      <p class="ce-qrsample" data-qrsample="yes">
        {t(
          kind === 'link'
            ? 'This code still goes to the design’s sample website. Paste your link above.'
            : 'This code still holds the sample details from the design. Add yours before you print it.',
        )}
      </p>
    );
  }
  if (kind === 'vcard')
    return (
      <p class="ce-qropens">
        {t('Saves the details on your card to their phone. The pattern changes when your details change, because the code holds them.')}
      </p>
    );
  return (
    <p class="ce-qropens" data-qropens={payload}>
      <span>{t('Opens')}:</span> <b>{payload.length > 70 ? `${payload.slice(0, 70)}…` : payload}</b>
    </p>
  );
}

function ContentFields({ t, el, set, kind, doc, templates }) {
  const input = el.qrIn ?? {};
  const put = (k) => (v) => set({ qrIn: { ...input, [k]: v } }, 'qrin');
  if (!el.qrKind && kind === 'whatsapp')
    return <DetailField t={t} doc={doc} templates={templates} field="whatsapp" label="Your WhatsApp number" />;
  if (kind === 'vcard') {
    return (
      <button type="button" class="ce-btn ce-btn--plain" onClick={() => setUi({ sheet: 'details', sheetOpen: true })}>
        {t('Edit your contact details')}
      </button>
    );
  }
  switch (kind) {
    case 'link':
      return (
        <Input
          label={t('Paste your link')}
          value={linkValue(el)}
          placeholder="https://instagram.com/yourshop"
          hint={t('Your website, Instagram, Facebook, YouTube, Google Maps or any page.')}
          onChange={(v) => set({ qrKind: 'link', data: '', qrIn: { ...input, value: v } }, 'qrdata')}
        />
      );
    case 'whatsapp':
      return el.qrKind === 'whatsapp' ? (
        <>
          <Input
            label={t('Open WhatsApp chat')}
            type="tel"
            value={input.value}
            onChange={put('value')}
            hint={t('Leave empty to use your number')}
          />
          <Input label={t('Message (optional)')} value={input.msg} onChange={put('msg')} />
        </>
      ) : null;
    case 'text':
      return <Input label={t('Plain text')} value={input.value} onChange={put('value')} />;
    case 'phone':
      return (
        <Input
          label={t('Call my number')}
          type="tel"
          value={input.value}
          onChange={put('value')}
          hint={t('Leave empty to use your number')}
        />
      );
    case 'sms':
      return (
        <>
          <Input
            label={t('Send me an SMS')}
            type="tel"
            value={input.value}
            onChange={put('value')}
            hint={t('Leave empty to use your number')}
          />
          <Input label={t('Message (optional)')} value={input.msg} onChange={put('msg')} />
        </>
      );
    case 'email':
      return (
        <>
          <Input label={t('Send me an email')} value={input.value} onChange={put('value')} hint={t('Leave empty to use your email')} />
          <Input label={t('Subject (optional)')} value={input.subject} onChange={put('subject')} />
        </>
      );
    case 'upi':
      return (
        <>
          <Input label={t('UPI ID')} value={input.value} onChange={put('value')} hint={t('Pay ₹1 from another phone before you print.')} />
          <Input label={t('Name shown when paying')} value={input.name} onChange={put('name')} />
          <Input label={t('Fixed amount in ₹ (optional)')} value={input.amount} onChange={put('amount')} />
        </>
      );
    case 'wifi':
      return (
        <>
          <Input label={t('Network name')} value={input.value} onChange={put('value')} />
          <Input
            label={t('Password (leave empty if open)')}
            value={input.pass}
            onChange={put('pass')}
            hint={t('Anyone with this card can read the password.')}
          />
        </>
      );
    case 'maps':
      return <Input label={t('Maps link or address')} value={input.value} onChange={put('value')} />;
    default:
      return null;
  }
}

function ColourOverride({ t, label, value, doc, onChange }) {
  return (
    <>
      <PaintPicker label={label} value={value} doc={doc} onChange={onChange} />
      {value ? (
        <button class="ce-btn ce-btn--plain" onClick={() => onChange(undefined)}>
          {t('Same as code')}
        </button>
      ) : null}
    </>
  );
}

export function QrStudio({ t, el, doc, set, engine, templates }) {
  const [notice, setNotice] = useState('');
  const kind = kindOf(el);
  const pickKind = (k) => {
    if (k === 'vcard' || k === 'whatsapp') set({ qrKind: undefined, data: k, keepBlank: true });
    else if (k === 'link') set({ qrKind: 'link', data: '', qrIn: el.qrKind === 'link' ? el.qrIn : {} });
    else set({ qrKind: k, qrIn: el.qrKind === k ? el.qrIn : {} });
  };
  const onLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const img = await readImage(f);
      set({ qrLogo: 'own', qrSrc: img.src, imgW: img.w, imgH: img.h });
      setNotice('');
    } catch {
      setNotice('Use a PNG, JPG, WebP or SVG image under 15 MB.');
    }
    e.target.value = '';
  };
  const previews = useMemo(
    () => ({
      body: (name) => bodyPath(name, 5, onSample, 0, 0, 1),
      frame: (name) => framePath(name, 0, 0, 1, 0),
      ball: (name) => ballPath(name, 0, 0, 1, 0),
    }),
    [],
  );
  const hasStyle = el.body || el.frame || el.ball || el.frameColor || el.ballColor || el.qrLogo;
  return (
    <>
      <label class="ce-field">
        <span>{t('What the code opens')}</span>
        <select value={kind} onChange={(e) => pickKind(e.target.value)}>
          {KINDS.map(([k, label]) => (
            <option key={k} value={k}>
              {t(label)}
            </option>
          ))}
        </select>
      </label>
      <ContentFields t={t} el={el} set={set} kind={kind} doc={doc} templates={templates} />
      <WhatItOpens t={t} el={el} doc={doc} kind={kind} />
      <ScanStatus t={t} el={el} doc={doc} engine={engine} />

      <div class="ce-qrhead">{t('QR shapes')}</div>
      <ShapeGrid
        label={t('Modules')}
        names={BODY_SHAPES}
        value={el.body}
        draw={previews.body}
        view="-0.2 -0.2 5.4 5.4"
        onPick={(v) => set({ body: v })}
      />
      <ShapeGrid
        label={t('Eye frame')}
        names={FRAME_SHAPES}
        value={el.frame}
        draw={previews.frame}
        view="-0.3 -0.3 7.6 7.6"
        onPick={(v) => set({ frame: v })}
      />
      <ShapeGrid
        label={t('Eye centre')}
        names={BALL_SHAPES}
        value={el.ball}
        draw={previews.ball}
        view="-0.4 -0.4 3.8 3.8"
        onPick={(v) => set({ ball: v })}
      />

      <div class="ce-qrhead">{t('QR colours')}</div>
      <PaintPicker label={t('Code colour')} value={el.dark} doc={doc} onChange={(v) => set({ dark: v })} />
      <ColourOverride t={t} label={t('Eye frame colour')} value={el.frameColor} doc={doc} onChange={(v) => set({ frameColor: v })} />
      <ColourOverride t={t} label={t('Eye centre colour')} value={el.ballColor} doc={doc} onChange={(v) => set({ ballColor: v })} />
      <PaintPicker label={t('Background')} value={el.light} doc={doc} onChange={(v) => set({ light: v })} />

      <div class="ce-qrhead">{t('Logo in the centre')}</div>
      <div class="ce-seg">
        {[
          [undefined, 'None'],
          ['card', 'Card logo'],
          ['own', 'Upload'],
          ['icon', 'Icon'],
        ].map(([v, label]) => (
          <button
            key={label}
            aria-pressed={el.qrLogo === v}
            onClick={() => set({ qrLogo: v, ...(v === 'icon' && !el.qrIcon ? { qrIcon: CENTRE_ICONS[0] } : {}) })}
          >
            {t(label)}
          </button>
        ))}
      </div>
      {el.qrLogo === 'card' && !doc.fields?.logo ? <p class="ce-qrhint">{t('Upload your logo in Details first.')}</p> : null}
      {el.qrLogo === 'own' ? (
        <label class="ce-btn ce-btn--plain">
          {t('Upload')}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onLogo} />
        </label>
      ) : null}
      {notice ? <p class="ce-qrhint">{notice}</p> : null}
      {el.qrLogo === 'icon' ? (
        <div class="ce-qrgrid">
          {CENTRE_ICONS.map((name) => (
            <button key={name} title={name} aria-label={name} aria-pressed={el.qrIcon === name} onClick={() => set({ qrIcon: name })}>
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
      {el.qrLogo ? (
        <Slider
          label={t('Logo size')}
          value={logoShare(el.qrLogoSize)}
          min={0.12}
          max={0.3}
          step={0.01}
          onChange={(v) => set({ qrLogoSize: v }, 'qrlogo')}
        />
      ) : null}
      {hasStyle ? (
        <button
          class="ce-btn ce-btn--plain"
          onClick={() =>
            set({ body: undefined, frame: undefined, ball: undefined, frameColor: undefined, ballColor: undefined, qrLogo: undefined })
          }
        >
          {t('Reset QR style')}
        </button>
      ) : null}
    </>
  );
}
