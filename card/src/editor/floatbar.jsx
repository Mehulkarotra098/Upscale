// The small toolbar beside whatever is selected, and typing right on the card. The quick things stay close to the
// work, so nobody has to hunt through a side panel to change a size or fix a spelling.
import { useEffect, useRef } from 'preact/hooks';
import { hasEmoji } from '../core/text.js';
import { duplicateSelected, NEW_TEXT, removeSelected, reorderSelected, setField, updateElement } from './actions.js';
import { activeElements, endTyping, setUi, state } from './store.js';

const Ico = ({ d }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const ICON = {
  left: 'M4 6h16M4 12h10M4 18h13',
  center: 'M4 6h16M7 12h10M5.5 18h13',
  right: 'M4 6h16M10 12h10M7 18h13',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
};

/** Keep the bar on screen, above the selection when there's room and below it when there isn't. */
// The rotate handle sits 40 px above the selection and a finger needs about 30 px to catch it,
// so the bar stays clear of that spot. It used to sit right on top of the handle.
const CLEAR_OF_ROTATE = 58;

function place(box, wrap, barH = 44) {
  const W = wrap?.clientWidth ?? 800;
  const above = box.y - barH - CLEAR_OF_ROTATE;
  const y = above > 4 ? above : Math.min((wrap?.clientHeight ?? 600) - barH - 4, box.y + box.h + 12);
  const x = Math.max(4, Math.min(W - 4, box.x + box.w / 2));
  return { left: `${x}px`, top: `${y}px` };
}

export function FloatBar({ t, box, wrapRef, onEditText }) {
  const list = activeElements();
  const el = list[0];
  if (!el) return null;
  const single = list.length === 1;
  const isText = single && el.type === 'text';
  const hasSize = single && (el.type === 'text' || el.type === 'list');
  const set = (patch, key) => updateElement(el.id, patch, key ? `${el.id}:${key}` : undefined);
  const step = (d) => {
    const size = Math.max(4.5, Math.min(90, (el.size ?? 10) + d));
    set({ size, minSize: Math.min(el.minSize ?? size, size) }, 'size');
  };
  return (
    <div class="ce-float" style={place(box, wrapRef.current)} role="toolbar" aria-label={t('Quick actions')}>
      {isText ? (
        <button class="ce-float__text" onClick={() => onEditText(el.id)}>
          {t('Edit text')}
        </button>
      ) : null}
      {hasSize ? (
        <span class="ce-float__group">
          <button aria-label={t('Smaller text')} title={t('Smaller text')} onClick={() => step(-0.5)}>
            A−
          </button>
          <b aria-live="polite">{Math.round((el.size ?? 0) * 4) / 4}</b>
          <button aria-label={t('Bigger text')} title={t('Bigger text')} onClick={() => step(0.5)}>
            A+
          </button>
        </span>
      ) : null}
      {isText ? (
        <span class="ce-float__group">
          {['left', 'center', 'right'].map((a) => (
            <button
              key={a}
              aria-label={`${t('Text')}: ${a}`}
              title={a}
              aria-pressed={(el.align ?? 'left') === a}
              onClick={() => set({ align: a })}
            >
              <Ico d={ICON[a]} />
            </button>
          ))}
        </span>
      ) : null}
      <span class="ce-float__group">
        <button aria-label={t('Bring forward')} title={t('Bring forward')} onClick={() => reorderSelected('up')}>
          <Ico d={ICON.up} />
        </button>
        <button aria-label={t('Send backward')} title={t('Send backward')} onClick={() => reorderSelected('down')}>
          <Ico d={ICON.down} />
        </button>
        <button aria-label={t('Duplicate')} title={t('Duplicate')} onClick={duplicateSelected}>
          <Ico d={ICON.copy} />
        </button>
        <button aria-label={t('Delete')} title={t('Delete')} onClick={removeSelected}>
          <Ico d={ICON.trash} />
        </button>
      </span>
      {single ? (
        <button class="ce-float__more" onClick={() => setUi({ sheet: 'edit', sheetOpen: true })}>
          {t('More')}
        </button>
      ) : null}
    </div>
  );
}

/** Type on the card itself. The card updates with every key, because the real render is what people care about. */
export function InlineText({ t, id, box, wrapRef, templates, close }) {
  const ref = useRef(null);
  const el = state.doc.sides[state.side].elements.find((e) => e.id === id);
  const token = el?.type === 'text' ? (el.text || '').match(/^\{(\w+)\}$/) : null;
  const value = token ? (state.doc.fields?.[token[1]] ?? '') : (el?.text ?? '');
  useEffect(() => {
    const node = ref.current;
    node?.focus();
    // Fresh placeholder text is selected whole, so the first key replaces it. Real text gets the cursor at its end.
    if (node?.value === NEW_TEXT) node.select();
    else node?.setSelectionRange(node.value.length, node.value.length);
    return () => endTyping();
  }, [id]);
  if (!el) return null;
  const W = wrapRef.current?.clientWidth ?? 800;
  const H = wrapRef.current?.clientHeight ?? 600;
  const width = Math.min(W - 16, Math.max(260, box.w));
  const left = Math.max(8, Math.min(W - width - 8, box.x + box.w / 2 - width / 2));
  const below = box.y + box.h + 10;
  const top = below + 86 < H ? below : Math.max(8, box.y - 96);
  return (
    <div class="ce-inline" style={{ left: `${left}px`, top: `${top}px`, width: `${width}px` }}>
      <textarea
        ref={ref}
        rows={2}
        value={value}
        aria-label={t('Text')}
        onInput={(e) => {
          const v = e.target.value;
          if (hasEmoji(v)) {
            e.target.value = value;
            return;
          }
          if (token) setField(token[1], v, templates);
          else updateElement(id, { text: v }, `${id}:text`);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) close();
        }}
        onBlur={close}
      />
      <span class="ce-inline__tip">{t('Click away when you’re done')}</span>
    </div>
  );
}
