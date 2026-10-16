// Media library: drag-and-drop uploads (compressed in the browser), alt text + caption editing, picker for the editor.
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { api, get } from './api.js';
import { prepareImage } from './image.js';
import { Icon, Modal, toast, confirmDialog, Field, kb, ago, Spinner } from './ui.jsx';

export function useMedia() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const load = (term = q) => get('media', { q: term }).then((d) => setItems(d.media)).catch((e) => toast(e.message, 'err'));
  useEffect(() => { load(''); }, []);
  return { items, setItems, q, setQ, load };
}

export function Uploader({ onUploaded, compact = false, initialFiles = null }) {
  const [busy, setBusy] = useState([]);
  const [drag, setDrag] = useState(false);
  const input = useRef();
  async function handle(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif)$/i.test(f.name));
    if (!list.length) return toast('Choose image files (JPG, PNG or WebP)', 'err');
    setBusy((b) => [...b, ...list.map((f) => f.name)]);
    for (const f of list) {
      try {
        const img = await prepareImage(f);
        const alt = img.name.replace(/[-]+/g, ' ').replace(/\s+/g, ' ').trim();
        const { media } = await api('media-upload', { ...img, alt: alt.length > 3 && !/^(img|image|dsc|pxl|screenshot)\b/i.test(alt) ? alt : '' });
        onUploaded?.(media);
        toast(`Uploaded ${f.name} (${kb(img.originalBytes)} → ${kb(img.bytes)})`);
      } catch (e) { toast(e.message, 'err'); }
      setBusy((b) => b.filter((n) => n !== f.name));
    }
  }
  useEffect(() => { if (initialFiles?.length) handle(initialFiles); }, []);
  return (
    <div class={`drop${drag ? ' is-drag' : ''}${compact ? ' drop--compact' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { handle(e.currentTarget.files); e.currentTarget.value = ''; }} />
      <Icon name="upload" size={compact ? 18 : 26} />
      <div><b>{busy.length ? `Uploading ${busy.length} image${busy.length > 1 ? 's' : ''}…` : 'Drop images here'}</b>
        {!compact && <small>JPG, PNG or WebP. Resized to 1600px and compressed to WebP automatically.</small>}</div>
      <button class="btn btn--ghost btn--sm" type="button" onClick={() => input.current.click()} disabled={busy.length > 0}>Choose files</button>
    </div>
  );
}

function MediaDetails({ m, onSaved, onDeleted, onClose }) {
  const [alt, setAlt] = useState(m.alt || '');
  const [caption, setCaption] = useState(m.caption || '');
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { const { media } = await api('media-update', { id: m.id, alt, caption }); onSaved({ ...m, ...media }); toast('Image details saved'); onClose(); }
    catch (e) { toast(e.message, 'err'); } finally { setSaving(false); }
  }
  async function del() {
    if (!(await confirmDialog({ title: 'Delete this image?', text: m.used ? `It's used in ${m.used} post(s). Deleting it will leave a gap there.` : 'This cannot be undone.', ok: 'Delete', danger: true }))) return;
    try { await api('media-delete', { id: m.id, force: true }); onDeleted(m.id); toast('Image deleted'); onClose(); } catch (e) { toast(e.message, 'err'); }
  }
  return (
    <Modal title="Image details" onClose={onClose} wide footer={<>
      <button class="btn btn--danger-ghost" type="button" onClick={del}><Icon name="trash" size={16} />Delete</button>
      <span class="grow" />
      <button class="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
      <button class="btn btn--go" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
      <div class="mdet">
        <img src={m.small || m.url} alt="" />
        <div class="mdet__form">
          <Field label="Alt text (what the image shows)" count={alt.length} max={125} hint="Describe it for Google and screen readers, e.g. “Owner showing his Google reviews on a phone”." warn={!alt}>
            <textarea rows="3" value={alt} onInput={(e) => setAlt(e.currentTarget.value)} />
          </Field>
          <Field label="Default caption (optional)"><input value={caption} onInput={(e) => setCaption(e.currentTarget.value)} /></Field>
          <dl class="mdet__meta"><dt>Size</dt><dd>{m.width} × {m.height}px · {kb(m.size)}</dd><dt>Uploaded</dt><dd>{ago(m.created_at)}</dd><dt>Used in</dt><dd>{m.used} post{m.used === 1 ? '' : 's'}</dd>
            <dt>URL</dt><dd><a href={m.url} target="_blank" rel="noopener">{m.url}</a></dd></dl>
        </div>
      </div>
    </Modal>
  );
}

function Grid({ items, onPick, pickedId, onOpen }) {
  if (!items) return <Spinner />;
  if (!items.length) return <p class="empty">No images yet. Upload your first one above.</p>;
  return (
    <ul class="mgrid">
      {items.map((m) => (
        <li key={m.id}>
          <button type="button" class={`mtile${pickedId === m.id ? ' is-picked' : ''}`} onClick={() => (onPick ? onPick(m) : onOpen(m))}>
            <img src={m.small || m.url} alt="" loading="lazy" />
            <span class="mtile__cap">{m.alt ? m.alt : <em class="warn">No alt text</em>}</span>
            {!!m.used && <span class="mtile__used">In use</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MediaPage() {
  const { items, setItems, q, setQ, load } = useMedia();
  const [open, setOpen] = useState(null);
  const total = (items || []).reduce((s, m) => s + m.size, 0);
  return (
    <div class="page">
      <header class="page__head"><div><h1>Media</h1><p class="sub">{items ? `${items.length} images · ${kb(total)}` : '…'} · Every image needs alt text for SEO.</p></div>
        <form class="search" onSubmit={(e) => { e.preventDefault(); load(q); }}><Icon name="search" size={16} /><input placeholder="Search images" value={q} onInput={(e) => setQ(e.currentTarget.value)} /></form></header>
      <Uploader onUploaded={(m) => setItems((l) => [m, ...(l || [])])} />
      <Grid items={items} onOpen={setOpen} />
      {open && <MediaDetails m={open} onClose={() => setOpen(null)} onSaved={(m) => setItems((l) => l.map((x) => (x.id === m.id ? m : x)))} onDeleted={(id) => setItems((l) => l.filter((x) => x.id !== id))} />}
    </div>
  );
}

// Picker used by the editor (insert image / choose cover). Returns {media, alt, caption}.
export function MediaPicker({ title = 'Insert image', onClose, onPick, askCaption = true, initial = null, files = null }) {
  const { items, setItems, q, setQ, load } = useMedia();
  const [picked, setPicked] = useState(initial);
  const [alt, setAlt] = useState(initial?.alt || '');
  const [caption, setCaption] = useState('');
  const choose = (m) => { setPicked(m); setAlt(m.alt || ''); setCaption(m.caption || ''); };
  async function done() {
    if (!picked) return;
    if (!alt.trim()) return toast('Add alt text: describe what the image shows', 'err');
    if (alt !== picked.alt) api('media-update', { id: picked.id, alt, caption: picked.caption || '' }).catch(() => {});
    onPick({ media: { ...picked, alt }, alt: alt.trim(), caption: caption.trim() });
  }
  return (
    <Modal title={title} wide onClose={onClose} footer={<>
      {picked && <div class="pick__form">
        <Field label="Alt text" hint="Required. What does the image show?" warn={!alt}><input value={alt} onInput={(e) => setAlt(e.currentTarget.value)} placeholder="e.g. Shop owner checking Google reviews on his phone" /></Field>
        {askCaption && <Field label="Caption (optional, shown under the image)"><input value={caption} onInput={(e) => setCaption(e.currentTarget.value)} /></Field>}
      </div>}
      <span class="grow" />
      <button class="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
      <button class="btn btn--go" type="button" onClick={done} disabled={!picked}>Use image</button></>}>
      <div class="pick__top">
        <Uploader compact initialFiles={files} onUploaded={(m) => { setItems((l) => [m, ...(l || [])]); choose(m); }} />
        <form class="search" onSubmit={(e) => { e.preventDefault(); load(q); }}><Icon name="search" size={16} /><input placeholder="Search" value={q} onInput={(e) => setQ(e.currentTarget.value)} /></form>
      </div>
      <Grid items={items} onPick={choose} pickedId={picked?.id} />
    </Modal>
  );
}
