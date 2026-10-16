// Shared UI pieces for the admin: icons, modal, toasts, confirm, field helpers, relative time.
import { useEffect, useRef, useState } from 'preact/hooks';

const P = {
  dash: 'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 4v3h6V4z',
  posts: 'M6 3.5h9l3 3V20.5H6zM14.5 3.5V7H18M9 11h6M9 14.5h6M9 18h4',
  plus: 'M12 5v14M5 12h14',
  media: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17M15.5 9.5h.01',
  cat: 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM16.5 14v7M13 17.5h7',
  team: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.6.8 2.7 2.6 3 5.2',
  out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  bold: 'M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z',
  italic: 'M10 4h8M6 20h8M14 4l-4 16',
  underline: 'M7 4v7a5 5 0 0 0 10 0V4M5 20h14',
  strike: 'M5 12h14M16 7a4 3 0 0 0-8 0c0 4 8 2.5 8 7a4 3 0 0 1-8 0',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  ul: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  ol: 'M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5c.6-.8 2.5-.7 2.5.6 0 1-2.5 1.9-2.5 3.4H6',
  quote: 'M7 7h4v4H8c0 2 1 3 3 3.5M14 7h4v4h-3c0 2 1 3 3 3.5',
  code: 'M9 7l-5 5 5 5M15 7l5 5-5 5',
  hr: 'M4 12h16',
  image: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17M15.5 9.5h.01',
  table: 'M4 5h16v14H4zM4 10h16M4 15h16M10 5v14',
  callout: 'M5 4h14v12H9l-4 4zM12 8v3M12 13.5h.01',
  cta: 'M4 7h16v10H4zM8 12h5M15 10.5l2 1.5-2 1.5',
  undo: 'M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2',
  redo: 'M15 7l5 5-5 5M20 12H9a5 5 0 0 0 0 10h2',
  eye: 'M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  up: 'M12 19V5M5 12l7-7 7 7',
  menu: 'M4 7h16M4 12h16M4 17h16',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  history: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4.5H8M12 8v4l3 2',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  key: 'M14.5 9.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM13.5 12.5L20 19M17 16l2-2',
  spark: 'M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5z',
};

export function Icon({ name, size = 18, stroke = 1.9 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={P[name] || ''} />
    </svg>
  );
}

export function Modal({ title, onClose, children, wide = false, footer = null }) {
  const ref = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    const k = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', k);
    setTimeout(() => ref.current?.querySelector('input,textarea,select,button:not(.md__x)')?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', k);
      if (prev && !prev.isContentEditable) prev.focus?.();
    };
  }, []);
  return (
    <div
      class="md"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div class={`md__box${wide ? ' md__box--wide' : ''}`} ref={ref}>
        <header class="md__head">
          <h2>{title}</h2>
          <button class="md__x" type="button" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </header>
        <div class="md__body">{children}</div>
        {footer && <footer class="md__foot">{footer}</footer>}
      </div>
    </div>
  );
}

// ---- toasts
let pushToast = () => {};
export const toast = (msg, kind = 'ok') => pushToast({ msg, kind, id: Math.random() });
export function Toasts() {
  const [list, set] = useState([]);
  pushToast = (t) => {
    set((l) => [...l.slice(-2), t]);
    setTimeout(() => set((l) => l.filter((x) => x.id !== t.id)), t.kind === 'err' ? 6000 : 3200);
  };
  return (
    <div class="toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} class={`toast toast--${t.kind}`}>
          <Icon name={t.kind === 'err' ? 'x' : 'check'} size={16} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ---- confirm
let askConfirm = null;
export const confirmDialog = (opts) => new Promise((resolve) => askConfirm?.({ ...opts, resolve }));
export function ConfirmHost() {
  const [c, set] = useState(null);
  askConfirm = set;
  if (!c) return null;
  const done = (v) => {
    c.resolve(v);
    set(null);
  };
  return (
    <Modal
      title={c.title || 'Are you sure?'}
      onClose={() => done(false)}
      footer={
        <>
          <button class="btn btn--ghost" type="button" onClick={() => done(false)}>
            Cancel
          </button>
          <button class={`btn ${c.danger ? 'btn--danger' : 'btn--go'}`} type="button" onClick={() => done(true)}>
            {c.ok || 'Confirm'}
          </button>
        </>
      }
    >
      <p class="md__text">{c.text}</p>
    </Modal>
  );
}

export function Field({ label, hint, count, max, children, warn }) {
  return (
    <label class="fld">
      <span class="fld__top">
        <span class="fld__label">{label}</span>
        {count !== undefined && (
          <span class={`fld__count${max && count > max ? ' is-over' : ''}`}>
            {count}
            {max ? ` / ${max}` : ''}
          </span>
        )}
      </span>
      {children}
      {hint && <span class={`fld__hint${warn ? ' is-warn' : ''}`}>{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label class="tgl">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} />
      <span class="tgl__ui" aria-hidden="true" />
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export function ago(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 0) return `in ${dur(-s)}`;
  if (s < 45) return 'just now';
  return `${dur(s)} ago`;
}
function dur(s) {
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `${Math.round(s / 3600)} h`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} d`;
  return new Date(Date.now() - s * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function statusOf(p) {
  if (p.status === 'draft') return { key: 'draft', label: 'Draft' };
  if (p.published_at && new Date(p.published_at) > new Date()) return { key: 'sched', label: 'Scheduled' };
  return { key: 'live', label: 'Live' };
}
export const Pill = ({ p }) => {
  const s = statusOf(p);
  return <span class={`pill pill--${s.key}`}>{s.label}</span>;
};

export function Spinner({ label = 'Loading' }) {
  return (
    <div class="spin" role="status">
      <span class="spin__dot" />
      <span class="sr">{label}</span>
    </div>
  );
}
