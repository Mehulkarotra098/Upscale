// The card maker's editor. Everything runs in the visitor's browser.
import { render } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { cardSize, checkLayout, fontsUsed, resolveSide } from '../core/render.js';
import { validateDesign } from '../core/schema.js';
import { TextEngine } from '../core/text.js';
import {
  addElement,
  applyFields,
  clearSample,
  copySelected,
  duplicateSelected,
  leftoverSample,
  nudgeSelected,
  pasteClipboard,
  removeSelected,
  reorderSelected,
  selectAll,
  setEngine,
  unlockElement,
} from './actions.js';
import { downloadDesignFile, downloadPng, downloadPrintPdf, downloadSheetPdf, downloadSvg, inAppBrowser } from './download.js';
import { FloatBar, InlineText } from './floatbar.jsx';
import { translate } from './i18n.js';
import { AddPanel, ColoursPanel, DetailsPanel, LayersPanel, PropertiesPanel, TemplatesPanel } from './panels.jsx';
import { applyTransform, Stage } from './stage.js';
import { commit, endTyping, loadSaved, redo, replaceDoc, setUi, state, subscribe, typingDetails, undo } from './store.js';

const engine = new TextEngine(async (file) => {
  const res = await fetch(`/assets/card/fonts/${file}`);
  if (!res.ok) throw new Error(`Font failed to load: ${file}`);
  return res.arrayBuffer();
});

function useStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
}

const TABS = [
  ['details', 'Details'],
  ['templates', 'Designs'],
  ['colours', 'Colours'],
  ['add', 'Add'],
  ['layers', 'Layers'],
];

function DownloadDialog({ t, close, templates }) {
  const doc = state.doc;
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [bleed, setBleed] = useState(false);
  const [marks, setMarks] = useState(true);
  const leftover = leftoverSample(doc);
  const issues = [];
  for (const side of ['front', 'back']) {
    for (const w of checkLayout(doc, side, engine)) {
      if (!issues.some((x) => x.message === w.message)) issues.push({ ...w, side });
    }
  }
  const run = (key, fn) => async () => {
    setBusy(key);
    setError('');
    try {
      await fn();
    } catch (e) {
      if (e?.name !== 'AbortError') setError('That didn’t work. Please try again, or try a different browser.');
    }
    setBusy('');
  };
  const btn = (key, label, fn, cls = '') => (
    <button class={`ce-btn ${cls}`} disabled={!!busy} onClick={run(key, fn)}>
      {busy === key ? `${t('Working')}…` : label}
    </button>
  );
  return (
    <div class="ce-modal" role="dialog" aria-modal="true" aria-label={t('Download')}>
      <div class="ce-dialog">
        <header>
          <h2>{t('Download')}</h2>
          <button class="ce-btn ce-btn--plain" onClick={close}>
            {t('Close')}
          </button>
        </header>
        {inAppBrowser() ? (
          <p class="ce-notice">
            This app’s built-in browser may block downloads. If nothing saves, tap the menu and choose Open in Chrome or Safari. Your design
            stays saved only in this browser, so save a design file first.
          </p>
        ) : null}
        {leftover.length || issues.length ? (
          <section class="ce-check-box">
            <h3>{t('Check before printing')}</h3>
            {leftover.length ? (
              <div>
                <p>
                  {t('Still showing sample details')}: {leftover.join(', ')}
                </p>
                <button class="ce-btn ce-btn--plain" onClick={() => clearSample(templates)}>
                  {t('Clear sample details')}
                </button>
              </div>
            ) : null}
            <ul>
              {issues.slice(0, 6).map((w) => (
                <li key={w.message}>
                  {w.side === 'back' ? 'Back: ' : 'Front: '}
                  {w.message}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section>
          <h3>{t('For a print shop')}</h3>
          <p class="ce-sub">Front and back, 3 mm bleed, text converted to outlines so no fonts are needed.</p>
          <label class="ce-check">
            <input type="checkbox" checked={marks} onChange={(e) => setMarks(e.target.checked)} />
            {t('Add crop marks')}
          </label>
          {btn('pdf', t('Print PDF'), () => downloadPrintPdf(doc, engine, { marks }), 'ce-btn--go')}
        </section>
        <section>
          <h3>{t('For WhatsApp and sharing')}</h3>
          <p class="ce-sub">PNG at 600 dpi (2100 × 1200 pixels).</p>
          <div class="ce-row ce-row--wrap">
            {btn('pngf', `PNG: ${t('Front')}`, () => downloadPng(doc, 'front', engine, { dpi: 600, bleed }))}
            {btn('pngb', `PNG: ${t('Back')}`, () => downloadPng(doc, 'back', engine, { dpi: 600, bleed }))}
            {btn('png3', 'PNG 300 dpi', () => downloadPng(doc, state.side, engine, { dpi: 300, bleed }), 'ce-btn--plain')}
          </div>
        </section>
        <section>
          <h3>{t('Print at home')}</h3>
          <p class="ce-sub">{t('A4 sheet of 10 cards')}, with cut marks.</p>
          {btn('sheet', `${t('A4 sheet of 10 cards')} (PDF)`, () => downloadSheetPdf(doc, engine))}
        </section>
        <section>
          <h3>{t('For designers')}</h3>
          <p class="ce-sub">True vector SVG. Text is outlined, so it looks the same in any software.</p>
          <div class="ce-row ce-row--wrap">
            {btn('svgf', `SVG: ${t('Front')}`, () => downloadSvg(doc, 'front', engine, { bleed }))}
            {btn('svgb', `SVG: ${t('Back')}`, () => downloadSvg(doc, 'back', engine, { bleed }))}
          </div>
          <label class="ce-check">
            <input type="checkbox" checked={bleed} onChange={(e) => setBleed(e.target.checked)} />
            {t('Include 3 mm bleed')} (PNG, SVG)
          </label>
        </section>
        <section>
          <h3>{t('Keep working later')}</h3>
          <p class="ce-sub">Your design autosaves in this browser. A design file lets you reopen it anywhere.</p>
          <div class="ce-row ce-row--wrap">
            {btn('file', t('Save design file'), () => downloadDesignFile(doc))}
            <label class="ce-btn ce-btn--plain">
              {t('Open design file')}
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    if (f.size > 40e6) throw new Error('This file is too big.');
                    const d = validateDesign(JSON.parse(await f.text()));
                    await engine.ensure(fontsUsed(d));
                    replaceDoc(d);
                    setUi({ side: 'front' });
                    close();
                  } catch (err) {
                    setError(err instanceof SyntaxError ? 'This file is not a card design.' : err.message);
                  }
                }}
              />
            </label>
          </div>
        </section>
        {error ? (
          <p class="ce-notice" role="alert">
            {error}
          </p>
        ) : null}
        <section class="ce-after">
          <p>
            Free, with no watermark. More free tools: <a href="/tools/google-review-qr-code">Google review QR code</a> and{' '}
            <a href="/tools/google-business-profile-checker">Google profile checker</a>.
          </p>
          <p>
            Want a website that matches your card? <a href="/services/website-design-mumbai">See how U Scale builds them</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

function App({ templates, instantiate }) {
  useStore();
  const t = translate(state.uiLang);
  const wrapRef = useRef(null);
  const elRef = useRef(null);
  const stageRef = useRef(null);
  const [dialog, setDialog] = useState(false);
  const [guides, setGuides] = useState(true);
  const [fontBusy, setFontBusy] = useState(false);
  const [selBox, setSelBox] = useState(null);
  const [inlineEdit, setInlineEdit] = useState(null);
  const [lockedHint, setLockedHint] = useState(null);

  const selectIds = useCallback((ids) => setUi({ selection: ids, sheet: 'edit', sheetOpen: true }), []);

  useEffect(() => {
    const stage = new Stage(elRef.current, wrapRef.current, {
      engine,
      onSelect: (ids) => {
        if (stage.silent) return;
        const same = ids.length === state.selection.length && ids.every((i) => state.selection.includes(i));
        if (same) return;
        endTyping();
        setUi({ selection: ids, ...(ids.length ? { sheet: 'edit' } : {}) });
      },
      onModified: (list) => {
        const { boxes } = resolveSide(state.doc, state.side, engine);
        commit((d) => {
          for (const m of list) {
            const el = d.sides[state.side].elements.find((e) => e.id === m.id);
            if (el) applyTransform(el, m, boxes[m.id] ?? { w: m.baseW, h: m.baseH });
          }
        });
      },
      onEditText: (id) => {
        const el = state.doc.sides[state.side].elements.find((x) => x.id === id);
        if (el?.type !== 'text') return;
        setUi({ selection: [id] });
        setInlineEdit(id);
      },
      onLockedTap: (id) => setLockedHint(id),
      onSelectionBox: (box) => setSelBox(box),
    });
    setEngine(engine);
    if (pendingQr) {
      const style = pendingQr;
      pendingQr = null;
      setUi({ side: 'back' });
      // A design that already has a code on its back gets restyled, in place, rather than a second code on top of it.
      const existing = state.doc.sides.back.elements.find((e) => e.type === 'qr');
      if (existing) {
        commit((d) => {
          const el = d.sides.back.elements.find((e) => e.id === existing.id);
          for (const k of [
            'data',
            'qrKind',
            'qrIn',
            'body',
            'frame',
            'ball',
            'frameColor',
            'ballColor',
            'qrLogo',
            'qrSrc',
            'qrIcon',
            'qrLogoSize',
            'imgW',
            'imgH',
          ])
            delete el[k];
          Object.assign(el, style);
        });
        setUi({ selection: [existing.id], sheet: 'edit', sheetOpen: true });
      } else addElement({ type: 'qr', w: 26, quiet: 2, ...style });
    }
    stageRef.current = stage;
    return () => stage.dispose();
  }, []);

  // Redraw when the design or side changes, after any new fonts have loaded.
  useEffect(() => {
    let live = true;
    const doc = state.doc;
    const need = fontsUsed(doc);
    let settle = null;
    const paint = () => {
      if (!live || !stageRef.current) return;
      const holdQr = typingDetails();
      stageRef.current.sync(doc, state.side, state.selection, { holdQr });
      if (holdQr) settle = setTimeout(() => live && stageRef.current?.sync(doc, state.side, state.selection), 700);
    };
    const missing = need.filter((id) => !engine.faces.has(id));
    if (missing.length) {
      setFontBusy(true);
      engine.ensure(need).then(() => {
        setFontBusy(false);
        paint();
      });
    } else paint();
    return () => {
      live = false;
      clearTimeout(settle);
    };
  }, [state.doc, state.side, state.selection]);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.showGuides = guides;
      stageRef.current.canvas.requestRenderAll();
    }
  }, [guides]);

  // Desktop shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (mod && e.key.toLowerCase() === 'c') {
        if (copySelected()) e.preventDefault();
      } else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClipboard();
      } else if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
      } else if (mod && e.key === ']') {
        e.preventDefault();
        reorderSelected(e.shiftKey ? 'front' : 'up');
      } else if (mod && e.key === '[') {
        e.preventDefault();
        reorderSelected(e.shiftKey ? 'back' : 'down');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection.length) {
          e.preventDefault();
          removeSelected();
        }
      } else if (e.key.startsWith('Arrow') && state.selection.length) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.25;
        const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        nudgeSelected(...map[e.key]);
      } else if (e.key === 'Escape') {
        setInlineEdit(null);
        setUi({ selection: [] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const panelKey = state.sheet;
  const panel = {
    details: <DetailsPanel t={t} templates={templates} />,
    templates: <TemplatesPanel t={t} templates={templates} instantiate={instantiate} engine={engine} />,
    colours: <ColoursPanel t={t} templates={templates} />,
    add: <AddPanel t={t} />,
    layers: <LayersPanel t={t} selectIds={selectIds} />,
    edit: <PropertiesPanel t={t} templates={templates} engine={engine} />,
  }[panelKey];
  const warnings = stageRef.current?.warnings?.length ?? 0;
  const { w, h } = cardSize(state.doc);

  return (
    <div class="ce">
      <header class="ce-top">
        <a class="ce-brand" href="/tools/visiting-card-maker" aria-label="Back to the card maker page">
          ← <b>U Scale</b>
        </a>
        <div class="ce-seg ce-sides" role="group" aria-label="Card side">
          {['front', 'back'].map((s) => (
            <button key={s} aria-pressed={state.side === s} onClick={() => setUi({ side: s, selection: [] })}>
              {t(s === 'front' ? 'Front' : 'Back')}
            </button>
          ))}
        </div>
        <div class="ce-tools">
          <button class="ce-ico" disabled={!state.past.length} onClick={undo} aria-label={t('Undo')} title={t('Undo')}>
            ↶
          </button>
          <button class="ce-ico" disabled={!state.future.length} onClick={redo} aria-label={t('Redo')} title={t('Redo')}>
            ↷
          </button>
          <button class="ce-ico ce-hide-sm" onClick={() => stageRef.current?.zoomBy(1.2)} aria-label="Zoom in" title="Zoom in">
            +
          </button>
          <button class="ce-ico ce-hide-sm" onClick={() => stageRef.current?.zoomBy(0.83)} aria-label="Zoom out" title="Zoom out">
            −
          </button>
          <button class="ce-ico" onClick={() => stageRef.current?.fit()} aria-label={t('Fit card')} title={t('Fit card')}>
            ⤢
          </button>
          <button
            class="ce-ico ce-hide-sm"
            aria-pressed={guides}
            onClick={() => setGuides(!guides)}
            aria-label={t('Guides')}
            title={t('Guides')}
          >
            ▦
          </button>
          <button
            class="ce-ico ce-lang"
            onClick={() => {
              const v = state.uiLang === 'en' ? 'hl' : 'en';
              try {
                localStorage.setItem('us-card-ui-lang', v);
              } catch (e) {
                void e;
              }
              setUi({ uiLang: v });
            }}
            aria-label="Switch between English and Hinglish"
          >
            {state.uiLang === 'en' ? 'Hinglish' : 'English'}
          </button>
          <button class="ce-btn ce-btn--go ce-download" onClick={() => setDialog(true)}>
            {t('Download')}
          </button>
        </div>
      </header>
      <div class="ce-main">
        <nav class="ce-nav" aria-label="Tools">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              aria-pressed={state.sheet === k && state.sheetOpen}
              onClick={() => setUi({ sheet: k, sheetOpen: !(state.sheet === k && state.sheetOpen) })}
            >
              {t(l)}
            </button>
          ))}
          <button
            aria-pressed={state.sheet === 'edit' && state.sheetOpen}
            onClick={() => setUi({ sheet: 'edit', sheetOpen: !(state.sheet === 'edit' && state.sheetOpen) })}
          >
            {state.selection.length ? t('Edit') : t('Background')}
          </button>
        </nav>
        <aside class={`ce-side${state.sheetOpen ? ' is-open' : ''}`}>
          <button class="ce-sheet-close" onClick={() => setUi({ sheetOpen: false })} aria-label={t('Close')}>
            ⌄
          </button>
          {panel}
        </aside>
        <main class="ce-stage" ref={wrapRef}>
          {/* Fabric moves the canvas into a wrapper of its own, so it needs a parent that Preact leaves alone. */}
          <div class="ce-canvas">
            <canvas ref={elRef} aria-label={`Card preview, ${w} by ${h} millimetres`} />
          </div>
          {selBox && !inlineEdit ? <FloatBar t={t} box={selBox} wrapRef={wrapRef} onEditText={(id) => setInlineEdit(id)} /> : null}
          {inlineEdit && selBox ? (
            <InlineText t={t} id={inlineEdit} box={selBox} wrapRef={wrapRef} templates={templates} close={() => setInlineEdit(null)} />
          ) : null}
          {lockedHint ? (
            <div class="ce-hint" role="status">
              <span>{t('This is part of the design, so it stays put while you work.')}</span>
              <button
                onClick={() => {
                  unlockElement(lockedHint);
                  setLockedHint(null);
                }}
              >
                {t('Unlock it')}
              </button>
              <button aria-label="Dismiss" onClick={() => setLockedHint(null)}>
                ×
              </button>
            </div>
          ) : null}
          <div class="ce-status" aria-live="polite">
            {fontBusy ? 'Loading fonts…' : state.saved ? t('Saved in this browser') : `${t('Saving')}…`}
            {warnings ? ` · ${warnings} to check` : ''}
          </div>
        </main>
      </div>
      {dialog ? <DownloadDialog t={t} templates={templates} close={() => setDialog(false)} /> : null}
    </div>
  );
}

let pendingQr = null;
/** A code designed in the QR tool, on its way onto a card. Rebuilt through the design check like any outside data. */
function readQrFromTool() {
  if (new URLSearchParams(location.search).get('addqr') !== '1') return null;
  try {
    const raw = JSON.parse(localStorage.getItem('us-qr-for-card') || 'null');
    localStorage.removeItem('us-qr-for-card');
    if (!raw?.el) return null;
    const clean = validateDesign({
      v: 1,
      fonts: {},
      sides: { front: { elements: [{ ...raw.el, id: 'qr', type: 'qr', x: 0, y: 0, w: 26 }] }, back: {} },
    }).sides.front.elements[0];
    const { id: _id, x: _x, y: _y, w: _w, ...style } = clean;
    return style;
  } catch {
    return null;
  }
}

async function start() {
  const root = document.getElementById('app');
  try {
    const [{ TEMPLATES, instantiate }, saved] = await Promise.all([import('../../templates/index.js'), loadSaved()]);
    const wanted = new URLSearchParams(location.search).get('design');
    const pick = TEMPLATES.find((x) => x.id === wanted);
    let doc = pick ? null : saved;
    if (!doc) {
      const tpl = pick ?? TEMPLATES[0];
      doc = instantiate(tpl);
      doc.user = saved?.user ?? {};
      if (saved?.fields?.logo)
        doc.fields = { ...doc.fields, logo: saved.fields.logo, logoW: saved.fields.logoW, logoH: saved.fields.logoH };
      if (saved?.lang && !tpl.lang) doc.lang = saved.lang;
      applyFields(doc, tpl.sample);
    }
    await engine.ensure(fontsUsed(doc));
    state.doc = doc;
    state.sheet = pick ? 'details' : 'templates';
    state.sheetOpen = true;
    pendingQr = readQrFromTool();
    // A design link starts a design once. Left in the address, reloading would throw away everything done since.
    if (location.search) history.replaceState(null, '', location.pathname);
    root.textContent = '';
    render(<App templates={TEMPLATES} instantiate={instantiate} />, root);
  } catch (e) {
    console.error(e);
    root.innerHTML =
      '<p class="ce-fail">The card maker couldn’t start in this browser. Please update your browser, or open this page in Chrome or Safari.</p>';
  }
}

start();
