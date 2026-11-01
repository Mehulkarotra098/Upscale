// Side panels. On phones these same panels open as a bottom sheet.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { cardSize, sideToSvg, fontsUsed } from '../core/render.js';
import { FONTS, hasEmoji } from '../core/text.js';
import { ICONS } from '../core/icons.js';
import {
  addElement,
  alignSelected,
  distributeSelected,
  hiddenDetails,
  CARD_SIZES,
  nudgeSelected,
  setCardSize,
  applyFields,
  applyTemplate,
  duplicateSelected,
  readImage,
  removeSelected,
  reorderSelected,
  setField,
  updateElement,
} from './actions.js';
import { activeElements, commit, endTyping, setUi, state } from './store.js';

const FIELD_ROWS = [
  ['name', 'Name', 'Your full name', 'text'],
  ['title', 'Job title', 'Owner, Doctor, Designer…', 'text'],
  ['company', 'Business', 'Business or shop name', 'text'],
  ['tagline', 'Tagline', 'A short line about you', 'text'],
  ['phone', 'Phone', '+91 …', 'tel'],
  ['whatsapp', 'WhatsApp', 'If different from phone', 'tel'],
  ['email', 'Email', 'you@business.in', 'email'],
  ['website', 'Website', 'yourbusiness.in', 'url'],
  ['address', 'Address', 'Area, city', 'text'],
  ['hours', 'Timings', 'Mon to Sat, 10 am to 8 pm', 'text'],
];

function Notice({ text }) {
  return text ? (
    <p class="ce-notice" role="status">
      {text}
    </p>
  ) : null;
}

/** QR codes are one of the first things people ask for, so the way in is right beside their details. */
function QrShortcut({ t, doc }) {
  const find = (side) => doc.sides[side].elements.find((e) => e.type === 'qr' && !e.hidden);
  const open = () => {
    const front = find('front');
    const back = find('back');
    const here = find(state.side);
    if (here) return setUi({ selection: [here.id], sheet: 'edit', sheetOpen: true });
    if (front || back) {
      const side = front ? 'front' : 'back';
      return setUi({ side, selection: [(front ?? back).id], sheet: 'edit', sheetOpen: true });
    }
    addElement({ type: 'qr', data: 'vcard' });
  };
  const has = find('front') || find('back');
  return (
    <button class="ce-qrcta" onClick={open}>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 20h2M18 18h2v2" />
      </svg>
      <span>
        <b>{t(has ? 'Customise your QR code' : 'Add a QR code')}</b>
        <em>{t('Your style, colours and logo. Contact, UPI, Wi-Fi, WhatsApp and more.')}</em>
      </span>
    </button>
  );
}

export function DetailsPanel({ t, templates }) {
  const [notice, setNotice] = useState('');
  const doc = state.doc;
  const sample = templates?.find((x) => x.id === doc.template)?.sample ?? {};
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const img = await readImage(f);
      commit((d) => {
        d.fields = { ...d.fields, logo: img.src, logoW: img.w, logoH: img.h };
      });
      setNotice('');
    } catch (err) {
      setNotice(err.message === 'too-big' ? 'That file is over 15 MB. Try a smaller one.' : 'Use a PNG, JPG, WebP or SVG image.');
    }
    e.target.value = '';
  };
  return (
    <div class="ce-panel">
      <h2>{t('Your details')}</h2>
      <p class="ce-sub">{t('Type once. They stay when you switch design.')}</p>
      {FIELD_ROWS.map(([key, label, ph, type]) => (
        <label class="ce-field" key={key}>
          <span>{t(label)}</span>
          <input
            type={type === 'text' ? 'text' : type}
            value={doc.user?.[key] ?? ''}
            placeholder={sample[key] || ph}
            maxLength={200}
            onInput={(e) => {
              if (!setField(key, e.target.value, templates)) {
                e.target.value = doc.user?.[key] ?? '';
                setNotice('Emoji can’t be printed reliably. Add an icon from the Add tab instead.');
              } else setNotice('');
            }}
            onBlur={endTyping}
          />
        </label>
      ))}
      <Notice text={notice} />
      {hiddenDetails(doc).length ? (
        <p class="ce-hidden">
          {t('This design has no place for')}{' '}
          <b>
            {hiddenDetails(doc)
              .map((k) => t(FIELD_ROWS.find((r) => r[0] === k)?.[1] ?? k).toLowerCase())
              .join(', ')}
          </b>
          . {t('A contact QR code still carries it. Pick another design, or add it as text.')}
        </p>
      ) : null}
      <QrShortcut t={t} doc={doc} />
      <div class="ce-field">
        <span>{t('Logo')}</span>
        <div class="ce-row">
          <label class="ce-btn">
            {t('Upload logo')}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onFile} />
          </label>
          {doc.fields?.logo ? (
            <button
              class="ce-btn ce-btn--plain"
              onClick={() =>
                commit((d) => {
                  const { logo: _a, logoW: _b, logoH: _c, ...rest } = d.fields;
                  d.fields = rest;
                  applyFields(d, sample);
                })
              }
            >
              {t('Remove logo')}
            </button>
          ) : null}
        </div>
      </div>
      <div class="ce-field">
        <span>Tool language</span>
        <div class="ce-seg">
          {[
            ['en', 'English'],
            ['hl', 'Hinglish'],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={state.uiLang === v}
              onClick={() => {
                try {
                  localStorage.setItem('us-card-ui-lang', v);
                } catch (err) {
                  void err;
                }
                setUi({ uiLang: v });
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div class="ce-field">
        <span>{t('Language of Devanagari text')}</span>
        <div class="ce-seg">
          {[
            ['hi', 'Hindi'],
            ['mr', 'Marathi'],
          ].map(([v, l]) => (
            <button key={v} aria-pressed={doc.lang === v} onClick={() => commit((d) => void (d.lang = v))}>
              {t(l)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS = {
  all: 'All',
  retail: 'Shops',
  food: 'Food',
  health: 'Health',
  beauty: 'Beauty',
  professional: 'Professional',
  trades: 'Trades',
  creative: 'Creative',
  tech: 'Tech',
  traditional: 'Traditional',
  hindi: 'Hindi',
  marathi: 'Marathi',
  bold: 'Bold',
  minimal: 'Minimal',
  luxury: 'Luxury',
  playful: 'Playful',
};

/** A template preview: the static picture first, then the user's own details once they've typed something. */
function TemplateCard({ tpl, engine, instantiate, onPick, active, personal }) {
  const ref = useRef(null);
  const [live, setLive] = useState(null);
  useEffect(() => {
    if (!personal) {
      setLive(null);
      return undefined;
    }
    let done = false;
    let url = null;
    const io = new IntersectionObserver(
      async (entries) => {
        if (done || !entries[0].isIntersecting) return;
        done = true;
        io.disconnect();
        const d = instantiate(tpl);
        d.user = state.doc.user;
        if (state.doc.fields?.logo)
          d.fields = { ...d.fields, logo: state.doc.fields.logo, logoW: state.doc.fields.logoW, logoH: state.doc.fields.logoH };
        applyFields(d, tpl.sample);
        await engine.ensure(fontsUsed(d));
        const { svg } = sideToSvg(d, 'front', engine, { bleed: false });
        url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        setLive(url);
      },
      { rootMargin: '200px' },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      done = true;
      io.disconnect();
      if (url) URL.revokeObjectURL(url);
    };
  }, [tpl, personal, engine, instantiate]);
  return (
    <button ref={ref} class={`ce-tpl${tpl.orientation === 'vertical' ? ' ce-tpl--v' : ''}`} aria-pressed={active} onClick={onPick}>
      <img src={live || `/assets/card/thumbs/${tpl.id}.webp`} alt="" loading="lazy" decoding="async" />
      <span>{tpl.name}</span>
    </button>
  );
}

export function TemplatesPanel({ t, templates, instantiate, engine }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const personal = useMemo(
    () => Object.values(state.doc.user ?? {}).some(Boolean) || !!state.doc.fields?.logo,
    [state.doc.user, state.doc.fields?.logo],
  );
  if (!templates) return <div class="ce-panel ce-sub">…</div>;
  const cats = ['all', ...new Set(templates.map((x) => x.category))];
  const needle = q.trim().toLowerCase();
  const list = templates.filter(
    (x) =>
      (cat === 'all' || x.category === cat) &&
      (!needle || `${x.name} ${x.category} ${(x.tags ?? []).join(' ')}`.toLowerCase().includes(needle)),
  );
  return (
    <div class="ce-panel">
      <input
        class="ce-search"
        type="search"
        placeholder={t('Search designs')}
        aria-label={t('Search designs')}
        value={q}
        onInput={(e) => setQ(e.target.value)}
      />
      <div class="ce-chips">
        {cats.map((c) => (
          <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {t(CATEGORY_LABELS[c] ?? c)}
          </button>
        ))}
      </div>
      <div class="ce-tpls">
        {list.map((x) => (
          <TemplateCard
            key={x.id}
            tpl={x}
            engine={engine}
            instantiate={instantiate}
            personal={personal}
            active={state.doc.template === x.id}
            onPick={() => applyTemplate(x, instantiate)}
          />
        ))}
      </div>
    </div>
  );
}

export function ColoursPanel({ t, templates }) {
  const doc = state.doc;
  const tpl = templates?.find((x) => x.id === doc.template);
  return (
    <div class="ce-panel">
      {tpl ? (
        <>
          <h2>{t('Colour sets')}</h2>
          <div class="ce-palettes">
            {tpl.palettes.map((p) => {
              const { label, ...cols } = p;
              return (
                <button
                  key={label}
                  class="ce-palette"
                  onClick={() =>
                    commit((d) => {
                      d.palette = { ...cols };
                    })
                  }
                >
                  <span class="ce-swatches">
                    {Object.values(cols).map((c, i) => (
                      <i key={i} style={{ background: c }} />
                    ))}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
      <h2>{t('Your colours')}</h2>
      <div class="ce-colours">
        {Object.entries(doc.palette).map(([k, v], i) => (
          <label key={k} class="ce-colour">
            <input type="color" value={v.slice(0, 7)} onInput={(e) => commit((d) => void (d.palette[k] = e.target.value))} />
            <span>
              {t('Colour')} {i + 1}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

const ICON_NAMES = Object.keys(ICONS);

export function AddPanel({ t }) {
  const [notice, setNotice] = useState('');
  const onImage = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const img = await readImage(f);
      const r = img.w / img.h;
      addElement({ type: 'image', src: img.src, imgW: img.w, imgH: img.h, w: r >= 1 ? 30 : 30 * r, h: r >= 1 ? 30 / r : 30 });
      setNotice('');
    } catch (err) {
      setNotice('Use a PNG, JPG, WebP or SVG image under 15 MB.');
    }
    e.target.value = '';
  };
  return (
    <div class="ce-panel">
      <button class="ce-qrcta" onClick={() => addElement({ type: 'qr', data: 'vcard' })}>
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 20h2M18 18h2v2" />
        </svg>
        <span>
          <b>{t('Add a QR code')}</b>
          <em>{t('Your style, colours and logo. Contact, UPI, Wi-Fi, WhatsApp and more.')}</em>
        </span>
      </button>
      <div class="ce-addgrid">
        <button class="ce-add" onClick={() => addElement({ type: 'text' })}>
          <b>Aa</b>
          {t('Text')}
        </button>
        <button class="ce-add" onClick={() => addElement({ type: 'rect' })}>
          <i class="ce-shape" />
          {t('Rectangle')}
        </button>
        <button class="ce-add" onClick={() => addElement({ type: 'ellipse' })}>
          <i class="ce-shape ce-shape--round" />
          {t('Circle')}
        </button>
        <button class="ce-add" onClick={() => addElement({ type: 'line' })}>
          <i class="ce-shape ce-shape--line" />
          {t('Line')}
        </button>
        <button class="ce-add" onClick={() => addElement({ type: 'list' })}>
          <b>≡</b>
          {t('Contact list')}
        </button>
        <label class="ce-add">
          <b>▣</b>
          {t('Image')}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onImage} />
        </label>
        <button class="ce-add" onClick={() => addElement({ type: 'logo' })}>
          <b>◎</b>
          {t('Logo')}
        </button>
      </div>
      <Notice text={notice} />
      <h2>{t('Icons')}</h2>
      <div class="ce-icons">
        {ICON_NAMES.map((name) => (
          <button key={name} title={name} aria-label={name} onClick={() => addElement({ type: 'icon', name })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d={ICONS[name]} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

const elementLabel = (el, doc) => {
  if (el.label) return el.label;
  if (el.type === 'text') return (el.text || '').replace(/\{(\w+)\}/g, (_, k) => doc.fields?.[k] ?? k).slice(0, 30) || 'Text';
  return (
    {
      list: 'Contact list',
      rect: 'Rectangle',
      ellipse: 'Circle',
      line: 'Line',
      path: 'Artwork',
      icon: el.name,
      qr: 'QR code',
      image: 'Image',
      logo: 'Logo',
    }[el.type] || el.type
  );
};

export function LayersPanel({ t, selectIds }) {
  const doc = state.doc;
  const list = [...doc.sides[state.side].elements].reverse();
  const toggle = (id, key) =>
    commit((d) => {
      const e = d.sides[state.side].elements.find((x) => x.id === id);
      e[key] = !e[key];
    });
  return (
    <div class="ce-panel">
      <h2>{t('Layers')}</h2>
      <ul class="ce-layers">
        {list.map((el) => (
          <li key={el.id} aria-current={state.selection.includes(el.id)}>
            <button class="ce-layer" disabled={el.locked || el.hidden} onClick={() => selectIds([el.id])}>
              {elementLabel(el, doc)}
            </button>
            <button class="ce-mini" aria-pressed={!!el.hidden} title="Hide" onClick={() => toggle(el.id, 'hidden')}>
              {el.hidden ? 'Hidden' : 'Shown'}
            </button>
            <button class="ce-mini" aria-pressed={!!el.locked} title={t('Lock')} onClick={() => toggle(el.id, 'locked')}>
              {el.locked ? t('Unlock') : t('Lock')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PaintPicker({ label, value, doc, onChange, allowNone }) {
  const tokens = Object.entries(doc.palette);
  const hex = typeof value === 'string' ? (value[0] === '$' ? doc.palette[value.slice(1)] : value) : null;
  return (
    <div class="ce-field">
      <span>{label}</span>
      <div class="ce-paint">
        {tokens.map(([k, v]) => (
          <button
            key={k}
            class="ce-dot"
            style={{ background: v }}
            aria-label={k}
            aria-pressed={value === `$${k}`}
            onClick={() => onChange(`$${k}`)}
          />
        ))}
        <input
          type="color"
          aria-label={label}
          value={hex && hex !== 'none' ? hex.slice(0, 7) : '#000000'}
          onInput={(e) => onChange(e.target.value)}
        />
        {allowNone ? (
          <button class="ce-mini" aria-pressed={!value || value === 'none'} onClick={() => onChange('none')}>
            None
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, unit = '' }) {
  return (
    <label class="ce-field">
      <span>
        {label}
        <em>
          {Math.round((value ?? 0) * 100) / 100}
          {unit}
        </em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? 0}
        onInput={(e) => onChange(Number(e.target.value))}
        onChange={endTyping}
      />
    </label>
  );
}

function FontPicker({ value, doc, onChange, t }) {
  const id = value?.[0] === '$' ? doc.fonts[value.slice(1)] : value;
  const groups = { Latin: FONTS.filter((f) => !f.deva), 'Hindi & Marathi': FONTS.filter((f) => f.deva) };
  return (
    <label class="ce-field">
      <span>{t('Font')}</span>
      <select value={id} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(groups).map(([g, list]) => (
          <optgroup key={g} label={g}>
            {list.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/** The QR controls load only when a QR code is selected, so the editor itself stays quick to open. */
function LazyQrStudio(props) {
  const [Studio, setStudio] = useState(null);
  useEffect(() => {
    let live = true;
    import('./qrpanel.jsx').then((m) => live && setStudio(() => m.QrStudio));
    return () => {
      live = false;
    };
  }, []);
  return Studio ? <Studio {...props} /> : null;
}

export function PropertiesPanel({ t, templates, engine }) {
  const doc = state.doc;
  const list = activeElements();
  const [notice, setNotice] = useState('');
  const el = list[0];
  if (!el) {
    const bg = doc.sides[state.side].background;
    return (
      <div class="ce-panel">
        <h2>{t('Background')}</h2>
        <PaintPicker
          label={t('Colour')}
          value={typeof bg === 'string' ? bg : ''}
          doc={doc}
          onChange={(v) => commit((d) => void (d.sides[state.side].background = v))}
        />
        <label class="ce-field">
          <span>{t('Card size')}</span>
          <select
            value={
              CARD_SIZES.find((s) => {
                const c = cardSize(doc);
                return (
                  (Math.abs(s.w - c.w) < 0.01 && Math.abs(s.h - c.h) < 0.01) || (Math.abs(s.w - c.h) < 0.01 && Math.abs(s.h - c.w) < 0.01)
                );
              })?.id
            }
            onChange={(e) => setCardSize(CARD_SIZES.find((s) => s.id === e.target.value))}
          >
            {CARD_SIZES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div class="ce-field">
          <span>{t('Gradient')}</span>
          <div class="ce-row ce-row--tight">
            {Object.keys(doc.palette)
              .slice(0, 3)
              .map((k, i, arr) => (
                <button
                  key={k}
                  class="ce-grad"
                  aria-label={`${t('Gradient')} ${i + 1}`}
                  title={`${t('Gradient')} ${i + 1}`}
                  style={{ background: `linear-gradient(135deg, ${doc.palette[k]}, ${doc.palette[arr[(i + 1) % arr.length]]})` }}
                  onClick={() =>
                    commit((d) => {
                      d.sides[state.side].background = {
                        type: 'linear',
                        angle: 135,
                        stops: [
                          [0, `$${k}`],
                          [1, `$${arr[(i + 1) % arr.length]}`],
                        ],
                      };
                    })
                  }
                />
              ))}
          </div>
        </div>
      </div>
    );
  }
  const set = (patch, key) => updateElement(el.id, patch, key ? `${el.id}:${key}` : undefined);
  const multi = list.length > 1;
  const singleToken = el.type === 'text' ? (el.text || '').match(/^\{(\w+)\}$/) : null;
  const shownText = el.type === 'text' ? (singleToken ? (doc.fields?.[singleToken[1]] ?? '') : el.text) : '';
  return (
    <div class="ce-panel">
      {!multi && el.type === 'text' ? (
        <label class="ce-field">
          <span>{t('Text')}</span>
          <textarea
            id="ce-text-input"
            rows={2}
            value={shownText}
            onInput={(e) => {
              const v = e.target.value;
              if (hasEmoji(v)) {
                e.target.value = shownText;
                setNotice('Emoji can’t be printed reliably. Add an icon from the Add tab instead.');
                return;
              }
              setNotice('');
              if (singleToken) setField(singleToken[1], v, templates);
              else set({ text: v }, 'text');
            }}
            onBlur={endTyping}
          />
        </label>
      ) : null}
      <Notice text={notice} />
      {!multi && (el.type === 'text' || el.type === 'list') ? (
        <>
          <FontPicker value={el.font ?? '$body'} doc={doc} t={t} onChange={(v) => set({ font: v })} />
          <Slider
            label={t('Size')}
            unit=" pt"
            value={el.size}
            min={4.5}
            max={90}
            step={0.25}
            onChange={(v) => set({ size: v, minSize: Math.min(el.minSize ?? v, v) }, 'size')}
          />
          {(() => {
            const id = (el.font ?? '$body')[0] === '$' ? doc.fonts[(el.font ?? '$body').slice(1)] : el.font;
            const range = FONTS.find((f) => f.id === id)?.weights;
            if (!range) return null;
            return (
              <Slider
                label={t('Weight')}
                value={Math.min(range[1], Math.max(range[0], el.weight ?? 400))}
                min={range[0]}
                max={range[1]}
                step={100}
                onChange={(v) => set({ weight: v }, 'weight')}
              />
            );
          })()}
          <PaintPicker label={t('Colour')} value={el.fill} doc={doc} onChange={(v) => set({ fill: v })} />
          <div class="ce-field">
            <span>{t('Align')}</span>
            <div class="ce-seg">
              {['left', 'center', 'right'].map((a) => (
                <button key={a} aria-pressed={(el.align ?? 'left') === a} onClick={() => set({ align: a })}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          {el.type === 'text' ? (
            <>
              <Slider
                label={t('Line spacing')}
                value={el.lineHeight ?? 1.2}
                min={0.8}
                max={2.2}
                step={0.02}
                onChange={(v) => set({ lineHeight: v }, 'lh')}
              />
              <Slider
                label={t('Letter spacing')}
                value={el.tracking ?? 0}
                min={-0.05}
                max={0.4}
                step={0.01}
                onChange={(v) => set({ tracking: v }, 'track')}
              />
              <label class="ce-check">
                <input type="checkbox" checked={!!el.upper} onChange={(e) => set({ upper: e.target.checked })} />
                {t('Capitals')}
              </label>
            </>
          ) : (
            <div class="ce-field">
              <span>{t('Contact list')}</span>
              <div class="ce-checks">
                {['name', 'phone', 'whatsapp', 'email', 'website', 'address', 'hours'].map((k) => (
                  <label class="ce-check" key={k}>
                    <input
                      type="checkbox"
                      checked={el.items.includes(k)}
                      onChange={(e) => set({ items: e.target.checked ? [...el.items, k] : el.items.filter((x) => x !== k) })}
                    />
                    {k}
                  </label>
                ))}
              </div>
              <label class="ce-check">
                <input type="checkbox" checked={el.icons !== false} onChange={(e) => set({ icons: e.target.checked })} />
                {t('Icons')}
              </label>
            </div>
          )}
        </>
      ) : null}
      {!multi && ['rect', 'ellipse', 'path'].includes(el.type) ? (
        <PaintPicker label={t('Fill')} value={el.fill} doc={doc} allowNone onChange={(v) => set({ fill: v })} />
      ) : null}
      {!multi && ['rect', 'ellipse', 'path', 'line', 'icon'].includes(el.type) ? (
        <>
          <PaintPicker
            label={t('Border')}
            value={el.stroke}
            doc={doc}
            allowNone={el.type !== 'line' && el.type !== 'icon'}
            onChange={(v) => set({ stroke: v, sw: el.sw ?? 0.3 })}
          />
          <Slider
            label="Border width"
            value={el.sw ?? 0}
            min={0}
            max={el.type === 'icon' ? 4 : 3}
            step={0.05}
            onChange={(v) => set({ sw: v }, 'sw')}
          />
        </>
      ) : null}
      {!multi && el.type === 'rect' ? (
        <Slider label={t('Corners')} value={el.r ?? 0} min={0} max={20} step={0.1} onChange={(v) => set({ r: v }, 'r')} />
      ) : null}
      {!multi && el.type === 'qr' ? <LazyQrStudio t={t} el={el} doc={doc} set={set} engine={engine} /> : null}
      {!multi && el.type === 'logo' ? (
        <PaintPicker label="Initials colour" value={el.fill} doc={doc} onChange={(v) => set({ fill: v })} />
      ) : null}
      {!multi && el.type === 'image' ? (
        <div class="ce-field">
          <span>Shape</span>
          <div class="ce-seg">
            {[
              ['', 'Original'],
              ['rounded', 'Rounded'],
              ['circle', 'Circle'],
            ].map(([v, l]) => (
              <button
                key={l}
                aria-pressed={(el.clip ?? '') === v}
                onClick={() => {
                  const patch = v ? { clip: v, fit: 'cover', r: v === 'rounded' ? 3 : 0 } : { clip: undefined, fit: 'contain' };
                  set(patch);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {!multi ? (
        <Slider
          label={t('Opacity')}
          value={el.opacity ?? 1}
          min={0.05}
          max={1}
          step={0.05}
          onChange={(v) => set({ opacity: v }, 'opacity')}
        />
      ) : null}
      <div class="ce-field">
        <span>{t(multi ? 'Align to each other' : 'Align on the card')}</span>
        <div class="ce-row ce-row--tight">
          {[
            ['left', 'Left', 'M4 3v18M8 7h12v4H8zM8 14h7v4H8z'],
            ['hcenter', 'Centre', 'M12 3v18M5 7h14v4H5zM8 14h8v4H8z'],
            ['right', 'Right', 'M20 3v18M4 7h12v4H4zM9 14h7v4H9z'],
            ['top', 'Top', 'M3 4h18M7 8h4v12H7zM14 8h4v7h-4z'],
            ['vcenter', 'Middle', 'M3 12h18M7 5h4v14H7zM14 8h4v8h-4z'],
            ['bottom', 'Bottom', 'M3 20h18M7 4h4v12H7zM14 9h4v7h-4z'],
          ].map(([how, label, d]) => (
            <button key={how} class="ce-mini" aria-label={t(label)} title={t(label)} onClick={() => alignSelected(how)}>
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d={d} />
              </svg>
            </button>
          ))}
        </div>
      </div>
      {list.length > 2 ? (
        <div class="ce-field">
          <span>{t('Even out the gaps')}</span>
          <div class="ce-row ce-row--tight">
            {[
              ['h', 'Across', 'M4 4v16M20 4v16M10 7h4v10h-4z'],
              ['v', 'Down', 'M4 4h16M4 20h16M7 10h10v4H7z'],
            ].map(([axis, label, d]) => (
              <button key={axis} class="ce-mini" aria-label={t(label)} title={t(label)} onClick={() => distributeSelected(axis)}>
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d={d} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div class="ce-field">
        <span>Move a little</span>
        <div class="ce-nudge">
          <i />
          <button aria-label="Move up" onClick={() => nudgeSelected(0, -0.25)}>
            ↑
          </button>
          <i />
          <button aria-label="Move left" onClick={() => nudgeSelected(-0.25, 0)}>
            ←
          </button>
          <button aria-label="Move down" onClick={() => nudgeSelected(0, 0.25)}>
            ↓
          </button>
          <button aria-label="Move right" onClick={() => nudgeSelected(0.25, 0)}>
            →
          </button>
        </div>
      </div>
      <div class="ce-row ce-row--wrap">
        <button class="ce-btn ce-btn--plain" onClick={() => reorderSelected('up')}>
          {t('Bring forward')}
        </button>
        <button class="ce-btn ce-btn--plain" onClick={() => reorderSelected('down')}>
          {t('Send back')}
        </button>
        <button class="ce-btn ce-btn--plain" onClick={duplicateSelected}>
          {t('Duplicate')}
        </button>
        <button class="ce-btn ce-btn--danger" onClick={removeSelected}>
          {t('Delete')}
        </button>
      </div>
    </div>
  );
}
