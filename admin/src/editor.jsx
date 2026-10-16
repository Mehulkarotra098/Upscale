// Post editor: TipTap writing canvas + publish / SEO side panels, autosave, revisions, link + image + CTA dialogs.
import { h, Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState, useCallback } from 'preact/hooks';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TableKit } from '@tiptap/extension-table';
import { Callout, Cta, MediaImage } from './extensions.js';
import { api, get } from './api.js';
import { analyze, norm, titleFits } from './seo.js';
import { MediaPicker } from './media.jsx';
import { Icon, Modal, toast, confirmDialog, Field, Toggle, ago, fmtDate, statusOf, Pill } from './ui.jsx';

export const slugify = (s, max = 80) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/g, '');

const EMPTY = { id: 0, title: '', slug: '', excerpt: '', status: 'draft', published_at: null, category_id: null, tags: [], cover_media_id: null, cover: null,
  seo_title: '', seo_description: '', focus_keyword: '', canonical_url: '', noindex: false, faq: [], service_slug: '', author_id: null, content_json: null };

const SERVICE_HINTS = [
  [/website|web design|landing page/i, '/services/website-design-mumbai', 'Website design in Mumbai'],
  [/\bseo\b|google ranking|rank on google|search engine/i, '/services/seo-mumbai', 'SEO services in Mumbai'],
  [/instagram|social media|reels/i, '/services/social-media-management-mumbai', 'Social media management'],
  [/google ads|meta ads|facebook ads|ads\b/i, '/services/google-meta-ads-mumbai', 'Google & Meta ads'],
  [/chatgpt|gemini|ai search|ai answers|perplexity/i, '/services/ai-search-visibility', 'AI search visibility'],
  [/price|pricing|cost/i, '/pricing', 'Pricing'],
];

// ---------------------------------------------------------------- the TipTap instance
function useTiptap(holder, content, { onUpdate, onSave, onLinkKey, onFiles }) {
  const [editor, setEditor] = useState(null);
  const [, force] = useState(0);
  const cbs = useRef({}); cbs.current = { onUpdate, onSave, onLinkKey, onFiles };
  useEffect(() => {
    const ed = new Editor({
      element: holder.current,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
          link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https', HTMLAttributes: { target: null, rel: null, class: null } },
        }),
        Placeholder.configure({ placeholder: ({ node }) => (node.type.name === 'heading' ? 'Section heading' : 'Start writing… Use “H2” for each section. Add 3–4 images, links to your services, and a CTA box.') }),
        TableKit.configure({ table: { resizable: false } }),
        MediaImage, Callout, Cta,
      ],
      content: content || '',
      editorProps: {
        attributes: { class: 'prose ed-prose', spellcheck: 'true' },
        handleKeyDown: (view, e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); cbs.current.onSave?.(); return true; }
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cbs.current.onLinkKey?.(); return true; }
          return false;
        },
        handleDrop: (view, e) => { const f = [...(e.dataTransfer?.files || [])].filter((x) => x.type.startsWith('image/')); if (f.length) { e.preventDefault(); cbs.current.onFiles?.(f); return true; } return false; },
        handlePaste: (view, e) => { const f = [...(e.clipboardData?.files || [])].filter((x) => x.type.startsWith('image/')); if (f.length) { cbs.current.onFiles?.(f); return true; } return false; },
      },
      onUpdate: ({ editor }) => cbs.current.onUpdate?.(editor),
      onSelectionUpdate: () => force((n) => n + 1),
      onTransaction: () => force((n) => n + 1),
    });
    setEditor(ed);
    return () => ed.destroy();
  }, []);
  return editor;
}

// ---------------------------------------------------------------- toolbar
function Toolbar({ editor, onLink, onImage, onCta }) {
  if (!editor) return <div class="tb" />;
  const c = () => editor.chain().focus();
  const B = ({ name, label, on, active, disabled }) => (
    <button type="button" class={`tb__b${active ? ' is-on' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={on} title={label} aria-label={label} aria-pressed={active ? 'true' : 'false'} disabled={disabled}><Icon name={name} size={17} /></button>);
  const level = [2, 3, 4].find((l) => editor.isActive('heading', { level: l }));
  const inTable = editor.isActive('table');
  const inCallout = editor.isActive('callout');
  return (
    <div class="tb" role="toolbar" aria-label="Formatting">
      <select class="tb__sel" value={level ? `h${level}` : 'p'} aria-label="Text style" onChange={(e) => {
        const v = e.currentTarget.value; v === 'p' ? c().setParagraph().run() : c().setHeading({ level: Number(v[1]) }).run(); }}>
        <option value="p">Paragraph</option><option value="h2">Heading 2 (section)</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option>
      </select>
      <span class="tb__sep" />
      <B name="bold" label="Bold (Ctrl+B)" active={editor.isActive('bold')} on={() => c().toggleBold().run()} />
      <B name="italic" label="Italic (Ctrl+I)" active={editor.isActive('italic')} on={() => c().toggleItalic().run()} />
      <B name="underline" label="Underline" active={editor.isActive('underline')} on={() => c().toggleUnderline().run()} />
      <B name="strike" label="Strikethrough" active={editor.isActive('strike')} on={() => c().toggleStrike().run()} />
      <B name="link" label="Link (Ctrl+K)" active={editor.isActive('link')} on={onLink} />
      <span class="tb__sep" />
      <B name="ul" label="Bullet list" active={editor.isActive('bulletList')} on={() => c().toggleBulletList().run()} />
      <B name="ol" label="Numbered list" active={editor.isActive('orderedList')} on={() => c().toggleOrderedList().run()} />
      <B name="quote" label="Quote" active={editor.isActive('blockquote')} on={() => c().toggleBlockquote().run()} />
      <B name="code" label="Code" active={editor.isActive('codeBlock')} on={() => c().toggleCodeBlock().run()} />
      <span class="tb__sep" />
      <B name="image" label="Insert image" on={onImage} />
      <B name="table" label="Insert table" active={inTable} on={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <B name="callout" label="Callout box (tip, note, warning, key number)" active={inCallout} on={() => c().toggleCallout('tip').run()} />
      <B name="cta" label="Call-to-action box" on={onCta} />
      <B name="hr" label="Divider" on={() => c().setHorizontalRule().run()} />
      <span class="tb__sep" />
      <B name="undo" label="Undo" on={() => c().undo().run()} disabled={!editor.can().undo()} />
      <B name="redo" label="Redo" on={() => c().redo().run()} disabled={!editor.can().redo()} />
      {inCallout && <div class="tb__ctx">Callout:
        {['tip', 'note', 'warning', 'stat'].map((v) => <button key={v} type="button" class={editor.isActive('callout', { variant: v }) ? 'is-on' : ''} onClick={() => c().setCalloutVariant(v).run()}>{{ tip: 'Tip', note: 'Note', warning: 'Warning', stat: 'Key number' }[v]}</button>)}
        <button type="button" onClick={() => c().toggleCallout().run()}>Remove</button></div>}
      {inTable && <div class="tb__ctx">Table:
        <button type="button" onClick={() => c().addRowAfter().run()}>+ Row</button><button type="button" onClick={() => c().addColumnAfter().run()}>+ Column</button>
        <button type="button" onClick={() => c().deleteRow().run()}>− Row</button><button type="button" onClick={() => c().deleteColumn().run()}>− Column</button>
        <button type="button" onClick={() => c().toggleHeaderRow().run()}>Header row</button><button type="button" onClick={() => c().deleteTable().run()}>Delete table</button></div>}
    </div>
  );
}

// ---------------------------------------------------------------- link dialog (internal search + external options)
function LinkDialog({ editor, onClose }) {
  const cur = editor.getAttributes('link');
  const isExt = cur.href && !cur.href.startsWith('/') && !cur.href.startsWith('#');
  const [tab, setTab] = useState(isExt ? 'ext' : 'int');
  const [q, setQ] = useState('');
  const [res, setRes] = useState({ pages: [], posts: [] });
  const [url, setUrl] = useState(isExt ? cur.href : '');
  const rel = String(cur.rel || '');
  const [nofollow, setNofollow] = useState(rel.includes('nofollow'));
  const [sponsored, setSponsored] = useState(rel.includes('sponsored'));
  const sel = editor.state.selection;
  const [text, setText] = useState(sel.empty ? '' : editor.state.doc.textBetween(sel.from, sel.to, ' '));
  useEffect(() => { const t = setTimeout(() => get('links', { q }).then(setRes).catch(() => {}), 180); return () => clearTimeout(t); }, [q]);
  function apply(href, attrs = {}) {
    let ch = editor.chain().focus();
    if (sel.empty && !editor.isActive('link')) {
      const label = text.trim() || href;
      ch = ch.insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs: { href, ...attrs } }] }).insertContent(' ');
    } else {
      ch = ch.extendMarkRange('link').setLink({ href, ...attrs });
    }
    ch.run(); onClose();
  }
  function ext() {
    let u = url.trim(); if (!u) return;
    if (!/^(https?:|mailto:|tel:)/i.test(u)) u = 'https://' + u;
    const r = ['noopener', nofollow && 'nofollow', sponsored && 'sponsored'].filter(Boolean).join(' ');
    apply(u, { target: '_blank', rel: r });
  }
  return (
    <Modal title="Add link" onClose={onClose} footer={<>
      {cur.href && <button class="btn btn--danger-ghost" type="button" onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); onClose(); }}>Remove link</button>}
      <span class="grow" />
      <button class="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
      {tab === 'ext' && <button class="btn btn--go" type="button" onClick={ext} disabled={!url.trim()}>Add external link</button>}</>}>
      {sel.empty && !editor.isActive('link') && <Field label="Link text"><input value={text} onInput={(e) => setText(e.currentTarget.value)} placeholder="Words people click" /></Field>}
      <div class="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'int'} class={tab === 'int' ? 'is-on' : ''} onClick={() => setTab('int')}>Your site (internal)</button>
        <button type="button" role="tab" aria-selected={tab === 'ext'} class={tab === 'ext' ? 'is-on' : ''} onClick={() => setTab('ext')}>Another website (external)</button>
      </div>
      {tab === 'int' ? <>
        <div class="search search--full"><Icon name="search" size={16} /><input value={q} onInput={(e) => setQ(e.currentTarget.value)} placeholder="Search your pages and posts" /></div>
        <ul class="lres">
          {res.pages.map((p) => <li key={p.url}><button type="button" onClick={() => apply(p.url)}><b>{p.title}</b><small>{p.url}</small></button></li>)}
          {res.posts.map((p) => <li key={p.url}><button type="button" onClick={() => apply(p.url)}><b>{p.title || 'Untitled'}</b><small>{p.url}{p.status === 'draft' ? ' · draft (not live yet)' : ''}</small></button></li>)}
        </ul>
        <p class="hint">Internal links pass ranking power between your pages and keep readers on uscale.in.</p>
      </> : <>
        <Field label="URL"><input value={url} onInput={(e) => setUrl(e.currentTarget.value)} placeholder="https://support.google.com/business/…" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ext(); } }} /></Field>
        <Toggle checked={nofollow} onChange={setNofollow} label="nofollow" hint="Don't pass ranking credit (use for sites you don't vouch for, user content)." />
        <Toggle checked={sponsored} onChange={setSponsored} label="sponsored" hint="Paid or affiliate link. Google requires this label." />
        <p class="hint">External links open in a new tab and get rel="noopener" automatically. Link to trusted sources only.</p>
      </>}
    </Modal>
  );
}

function CtaDialog({ attrs, onSave, onClose, onDelete }) {
  const [a, setA] = useState({ title: 'Not sure where your business stands online?', text: 'Get a free audit of your website, Google listing and social media. I reply within 24 hours.', button: 'Get my free audit', href: '/#contact', ...(attrs || {}) });
  const set = (k) => (e) => setA({ ...a, [k]: e.currentTarget.value });
  return (
    <Modal title="Call-to-action box" onClose={onClose} footer={<>
      {onDelete && <button class="btn btn--danger-ghost" type="button" onClick={onDelete}>Remove box</button>}<span class="grow" />
      <button class="btn btn--ghost" type="button" onClick={onClose}>Cancel</button><button class="btn btn--go" type="button" onClick={() => onSave(a)}>Save</button></>}>
      <Field label="Headline"><input value={a.title} onInput={set('title')} /></Field>
      <Field label="Text"><textarea rows="2" value={a.text} onInput={set('text')} /></Field>
      <div class="row2"><Field label="Button label"><input value={a.button} onInput={set('button')} /></Field>
        <Field label="Button link" hint="/#contact opens the audit form"><input value={a.href} onInput={set('href')} /></Field></div>
      <div class="ed-cta ed-cta--preview"><small>Preview</small><b>{a.title}</b><p>{a.text}</p><span class="ed-cta__btn">{a.button} ↗</span></div>
    </Modal>
  );
}

// ---------------------------------------------------------------- side panels
function GooglePreview({ title, desc, slug, site, date }) {
  const [mobile, setMobile] = useState(false);
  const host = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const t = title.length > 62 ? title.slice(0, 60).replace(/\s+\S*$/, '') + ' …' : title;
  const d = desc.length > 158 ? desc.slice(0, 155).replace(/\s+\S*$/, '') + ' …' : desc;
  return (
    <div class="serp-wrap">
      <div class="serp-tabs"><button type="button" class={!mobile ? 'is-on' : ''} onClick={() => setMobile(false)}>Desktop</button><button type="button" class={mobile ? 'is-on' : ''} onClick={() => setMobile(true)}>Mobile</button></div>
      <div class={`serp${mobile ? ' serp--m' : ''}`}>
        <div class="serp__site"><span class="serp__fav">u</span><span><b>U Scale</b><small>{host} › blog › {slug || '…'}</small></span></div>
        <div class={`serp__t${titleFits(title) ? '' : ' is-cut'}`}>{t || 'Your SEO title'}</div>
        <div class="serp__d">{date && <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — </span>}{d || 'Write a meta description: one or two sentences that make people want to click.'}</div>
      </div>
    </div>
  );
}

function Ring({ score, grade }) {
  const r = 26, C = 2 * Math.PI * r;
  return (<svg class={`ring ring--${grade}`} width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`SEO score ${score} out of 100`}>
    <circle cx="34" cy="34" r={r} class="ring__bg" /><circle cx="34" cy="34" r={r} class="ring__fg" stroke-dasharray={C} stroke-dashoffset={C * (1 - score / 100)} transform="rotate(-90 34 34)" />
    <text x="34" y="39" text-anchor="middle">{score}</text></svg>);
}

function TagInput({ value, onChange }) {
  const [v, setV] = useState('');
  const add = () => { const t = v.trim().toLowerCase().replace(/,$/, ''); if (t && !value.includes(t) && value.length < 15) onChange([...value, t]); setV(''); };
  return (<div class="tags">
    {value.map((t) => <span class="tag" key={t}>{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>×</button></span>)}
    <input value={v} onInput={(e) => setV(e.currentTarget.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !v && value.length) onChange(value.slice(0, -1)); }}
      onBlur={add} placeholder={value.length ? 'Add tag' : 'e.g. local seo, google reviews'} /></div>);
}

function FaqEditor({ value, onChange }) {
  const set = (i, k, v) => onChange(value.map((f, j) => (j === i ? { ...f, [k]: v } : f)));
  return (<div class="faqed">
    {value.map((f, i) => (<div class="faqed__item" key={i}>
      <input value={f.q} placeholder="Question customers ask" onInput={(e) => set(i, 'q', e.currentTarget.value)} />
      <textarea rows="3" value={f.a} placeholder="Short, direct answer (2–3 sentences)" onInput={(e) => set(i, 'a', e.currentTarget.value)} />
      <button type="button" class="link-btn" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove</button></div>))}
    <button type="button" class="btn btn--ghost btn--sm" onClick={() => onChange([...value, { q: '', a: '' }])}><Icon name="plus" size={15} />Add question</button>
  </div>);
}

// ---------------------------------------------------------------- page
export function PostEditor({ id, me, onDone }) {
  const [post, setPost] = useState(null);
  const [cats, setCats] = useState([]);
  const [team, setTeam] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [tab, setTab] = useState('post');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [html, setHtml] = useState('');
  const [dialog, setDialog] = useState(null);
  const [dupes, setDupes] = useState([]);
  const [targets, setTargets] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const holder = useRef();
  const postRef = useRef(); postRef.current = post;
  const dirtyRef = useRef(); dirtyRef.current = dirty;

  // load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, u, l] = await Promise.all([get('categories'), get('users'), get('links')]);
        if (!alive) return;
        setCats(c.categories); setTeam(u.users); setTargets(l.posts);
        if (id) {
          const d = await get('post', { id });
          const p = d.post;
          setPost({ ...EMPTY, ...p, tags: p.tags || [], faq: p.faq || [], cover: p.cover_media_id ? { id: p.cover_media_id, name: p.cover_name, alt: p.cover_alt, url: `/media/${p.cover_media_id}-${slugify(p.cover_name || 'image', 60)}.webp` } : null });
          setRevisions(d.revisions); setSlugTouched(true); setSavedAt(p.updated_at);
        } else setPost({ ...EMPTY, author_id: me.id });
      } catch (e) { toast(e.message, 'err'); }
    })();
    return () => { alive = false; };
  }, [id]);

  const editor = useTiptap(holder, null, {
    onUpdate: (ed) => { setHtml(ed.getHTML()); setDirty(true); },
    onSave: () => save(),
    onLinkKey: () => setDialog({ type: 'link' }),
    onFiles: (files) => setDialog({ type: 'image', files }),
  });
  // put loaded content into the editor once both exist
  const loadedFor = useRef(null);
  useEffect(() => {
    if (!editor || !post || loadedFor.current === (post.id || 'new')) return;
    loadedFor.current = post.id || 'new';
    editor.commands.setContent(post.content_json && post.content_json.type === 'doc' ? post.content_json : (post.content_html || ''), { emitUpdate: false });
    setHtml(editor.getHTML());
    const onCta = ({ pos, attrs }) => setDialog({ type: 'cta', pos, attrs });
    editor.on('cta-edit', onCta);
  }, [editor, post]);

  const upd = (patch) => { setPost((p) => ({ ...p, ...patch })); setDirty(true); };
  // auto slug from the title until it's edited by hand or the post has gone live
  useEffect(() => { if (post && !slugTouched && post.status === 'draft') setPost((p) => ({ ...p, slug: slugify(p.title) })); }, [post?.title]);

  // duplicate keyword check
  useEffect(() => {
    if (!post?.focus_keyword) return setDupes([]);
    const t = setTimeout(() => get('keyword-check', { kw: post.focus_keyword, id: post.id || 0 }).then((d) => setDupes(d.posts)).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [post?.focus_keyword, post?.id]);

  const site = me.site || 'https://uscale.in/';
  const seo = useMemo(() => post ? analyze({ ...post, cover_alt: post.cover?.alt }, html, { siteHost: new URL(site).host.replace(/^www\./, ''), duplicateKeyword: dupes }) : null, [post, html, dupes]);

  async function save(opts = {}) {
    const p = postRef.current; if (!p || !editor) return;
    const status = opts.status || p.status;
    if (status === 'published' && !p.title.trim()) { toast('Add a title first', 'err'); return; }
    setSaving(true);
    try {
      const body = { ...p, status, content_json: editor.getJSON(), content_html: editor.getHTML(), cover_media_id: p.cover?.id || null, publishNow: !!opts.publishNow };
      delete body.cover;
      const d = await api('save', body);
      const s = d.post;
      setPost((cur) => ({ ...cur, id: s.id, slug: s.slug, status: s.status, published_at: s.published_at, excerpt: cur.excerpt, updated_at: s.updated_at }));
      setDirty(false); setSavedAt(new Date().toISOString());
      try { localStorage.removeItem(`us-draft-${s.id}`); } catch {}
      if (!p.id) history.replaceState(null, '', `#/edit/${s.id}`);
      if (opts.toastMsg !== false) toast(opts.toastMsg || (s.status === 'published' ? (d.live ? 'Published. It is live now.' : `Scheduled for ${fmtDate(s.published_at)}`) : 'Draft saved'));
      if (opts.refreshRevisions !== false && s.id) get('post', { id: s.id }).then((x) => setRevisions(x.revisions)).catch(() => {});
      return s;
    } catch (e) { toast(e.message, 'err'); } finally { setSaving(false); }
  }

  // autosave drafts every 20s of inactivity; published posts keep a local backup instead (so edits don't go live unreviewed)
  useEffect(() => {
    if (!dirty || !post || saving) return;
    const t = setTimeout(() => {
      const p = postRef.current;
      if (p.status === 'draft' && (p.title.trim() || html.length > 20)) save({ toastMsg: false, refreshRevisions: false });
      else if (p.id) { try { localStorage.setItem(`us-draft-${p.id}`, JSON.stringify({ at: Date.now(), json: editor.getJSON(), title: p.title })); } catch {} }
    }, 20000);
    return () => clearTimeout(t);
  }, [dirty, html, post]);

  useEffect(() => {
    const warn = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  async function publish() {
    const p = postRef.current;
    const future = p.published_at && new Date(p.published_at) > new Date();
    if (seo.score < 60 && p.status !== 'published') {
      const ok = await confirmDialog({ title: `SEO score is ${seo.score}/100`, text: `Fix the red items in the SEO tab first and this post will have a much better chance on Google. Publish anyway?`, ok: future ? 'Schedule anyway' : 'Publish anyway' });
      if (!ok) { setTab('seo'); setPanelOpen(true); return; }
    }
    await save({ status: 'published', publishNow: true });
  }
  async function unpublish() {
    if (!(await confirmDialog({ title: 'Unpublish this post?', text: 'It will disappear from the blog and Google will drop it over time. You can publish it again later.', ok: 'Unpublish', danger: true }))) return;
    await save({ status: 'draft', toastMsg: 'Moved back to drafts' });
  }
  async function preview() {
    let p = postRef.current;
    if (!p.id || dirtyRef.current) { const s = await save({ toastMsg: false }); if (!s) return; p = { ...p, id: s.id }; }
    try { const { url } = await api('preview-link', { id: p.id }); window.open(url, '_blank', 'noopener'); } catch (e) { toast(e.message, 'err'); }
  }
  async function restore(r) {
    if (!(await confirmDialog({ title: 'Restore this version?', text: `Replace the editor content with the version from ${fmtDate(r.saved_at)}. Nothing is saved until you save.`, ok: 'Restore' }))) return;
    try { const d = await get('revision', { id: r.id }); editor.commands.setContent(d.revision.content_json); setHtml(editor.getHTML()); setDirty(true); toast('Version restored. Save to keep it.'); } catch (e) { toast(e.message, 'err'); }
  }

  // internal link ideas: other posts' focus keywords / service topics that appear in the text but aren't linked yet
  const ideas = useMemo(() => {
    if (!seo) return [];
    const text = ` ${norm(seo.doc.text)} `; const linked = new Set(seo.doc.links.map((l) => l.href.replace(/^https?:\/\/[^/]+/, '')));
    const out = [];
    for (const t of targets) if (t.status === 'published' && t.id !== post?.id && t.focus_keyword && text.includes(` ${norm(t.focus_keyword)} `) && !linked.has(t.url)) out.push({ phrase: t.focus_keyword, url: t.url, title: t.title });
    for (const [re, url, title] of SERVICE_HINTS) { const m = seo.doc.text.match(re); if (m && !linked.has(url)) out.push({ phrase: m[0], url, title }); }
    return out.slice(0, 6);
  }, [seo, targets]);
  function addIdea(idea) {
    const want = idea.phrase.toLowerCase(); let found = null;
    editor.state.doc.descendants((node, pos) => {
      if (found || !node.isText) return !found;
      if (node.marks.some((m) => m.type.name === 'link')) return false;
      const i = node.text.toLowerCase().indexOf(want);
      if (i >= 0) found = { from: pos + i, to: pos + i + want.length };
      return !found;
    });
    if (!found) return toast('Could not find that phrase', 'err');
    editor.chain().focus().setTextSelection(found).setLink({ href: idea.url }).run();
    toast(`Linked “${idea.phrase}” → ${idea.title}`);
  }

  if (!post) return <div class="page"><p class="empty">Loading…</p></div>;
  const st = statusOf(post);
  const future = post.published_at && new Date(post.published_at) > new Date();
  const liveUrl = `/blog/${post.slug}`;
  const pubLocal = post.published_at ? new Date(new Date(post.published_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  const bad = seo.checks.filter((c) => c.status === 'bad');

  return (
    <div class="edpage">
      <header class="edbar">
        <button class="btn btn--ghost btn--sm" type="button" onClick={async () => { if (dirty && !(await confirmDialog({ title: 'Leave without saving?', text: 'You have unsaved changes.', ok: 'Leave', danger: true }))) return; onDone(); }}>← Posts</button>
        <Pill p={post} />
        <span class="edbar__state">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? `Saved ${ago(savedAt)}` : 'New post'}</span>
        <span class="grow" />
        <button class={`seo-chip seo-chip--${seo.grade}`} type="button" onClick={() => { setTab('seo'); setPanelOpen(true); }} title="SEO score">SEO {seo.score}</button>
        {post.id && st.key === 'live' && <a class="btn btn--ghost btn--sm" href={liveUrl} target="_blank" rel="noopener"><Icon name="ext" size={15} />View</a>}
        <button class="btn btn--ghost btn--sm" type="button" onClick={preview}><Icon name="eye" size={15} />Preview</button>
        {post.status === 'draft' && <button class="btn btn--ghost btn--sm" type="button" onClick={() => save()} disabled={saving}>Save draft</button>}
        {post.status === 'draft'
          ? <button class="btn btn--go btn--sm" type="button" onClick={publish} disabled={saving}>{future ? 'Schedule' : 'Publish'}</button>
          : <button class="btn btn--go btn--sm" type="button" onClick={() => save({ status: 'published' })} disabled={saving}>Update</button>}
        <button class="btn btn--ghost btn--sm edbar__panel" type="button" onClick={() => setPanelOpen(!panelOpen)} aria-expanded={panelOpen}>Settings</button>
      </header>

      <div class="edgrid">
        <main class="edmain">
          <textarea class="ed-title" rows="1" placeholder="Post title" value={post.title} maxLength={200}
            onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; upd({ title: el.value }); }}
            ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }} />
          <div class="ed-url"><span>{site.replace(/^https?:\/\//, '')}blog/</span>
            <input value={post.slug} aria-label="URL slug" onInput={(e) => { setSlugTouched(true); upd({ slug: slugify(e.currentTarget.value, 90) }); }} placeholder="url-of-the-post" />
            {post.status === 'published' && <small>Changing the URL of a live post keeps the old link working (301 redirect).</small>}</div>
          <textarea class="ed-dek" rows="2" placeholder="Intro line shown under the title and in the blog list (1–2 sentences)" value={post.excerpt} maxLength={320} onInput={(e) => upd({ excerpt: e.currentTarget.value })} />
          <div class="ed-tb-wrap"><Toolbar editor={editor} onLink={() => setDialog({ type: 'link' })} onImage={() => setDialog({ type: 'image' })} onCta={() => setDialog({ type: 'cta' })} /></div>
          <div class="ed-canvas" ref={holder} />
          <footer class="ed-foot"><span>{seo.words} words · {Math.max(1, Math.round(seo.words / 220))} min read</span><span>{seo.doc.headings.filter((x) => x.level === 2).length} sections · {seo.doc.images.length} images · {seo.doc.links.filter((l) => l.internal).length} internal / {seo.doc.links.filter((l) => !l.internal).length} external links</span></footer>
        </main>

        <aside class={`edside${panelOpen ? ' is-open' : ''}`} aria-label="Post settings">
          <div class="edside__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'post'} class={tab === 'post' ? 'is-on' : ''} onClick={() => setTab('post')}>Post</button>
            <button type="button" role="tab" aria-selected={tab === 'seo'} class={tab === 'seo' ? 'is-on' : ''} onClick={() => setTab('seo')}>SEO <span class={`dot dot--${seo.grade}`}>{seo.score}</span></button>
            <button type="button" class="edside__close" onClick={() => setPanelOpen(false)} aria-label="Close settings"><Icon name="x" /></button>
          </div>

          {tab === 'post' && <div class="edside__body">
            <section class="card">
              <h3>Publishing</h3>
              <Field label={post.status === 'published' ? 'Published on' : 'Publish date (optional, set a future date to schedule)'}>
                <input type="datetime-local" value={pubLocal} onInput={(e) => upd({ published_at: e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null })} />
              </Field>
              {future && <p class="note"><Icon name="clock" size={15} /> Goes live {fmtDate(post.published_at)}</p>}
              {post.status === 'published' && <button class="link-btn danger" type="button" onClick={unpublish}>Unpublish (back to draft)</button>}
            </section>
            <section class="card">
              <h3>Cover image</h3>
              {post.cover ? <div class="cover"><img src={post.cover.url} alt="" /><div><p>{post.cover.alt || <em class="warn">No alt text</em>}</p>
                <button class="link-btn" type="button" onClick={() => setDialog({ type: 'cover' })}>Change</button> · <button class="link-btn danger" type="button" onClick={() => upd({ cover: null })}>Remove</button></div></div>
                : <button class="btn btn--ghost btn--block" type="button" onClick={() => setDialog({ type: 'cover' })}><Icon name="image" size={16} />Choose cover image</button>}
              <p class="hint">1600×900 works best. Shown at the top, in the blog list, Google Discover and link previews on WhatsApp.</p>
            </section>
            <section class="card">
              <h3>Organise</h3>
              <Field label="Category">
                <select value={post.category_id || ''} onChange={(e) => upd({ category_id: Number(e.currentTarget.value) || null })}>
                  <option value="">No category</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </Field>
              <Field label="Tags" hint="3–6 topics. Press Enter after each."><TagInput value={post.tags} onChange={(tags) => upd({ tags })} /></Field>
              <Field label="Related service (CTA under the post)">
                <select value={post.service_slug} onChange={(e) => upd({ service_slug: e.currentTarget.value })}>
                  <option value="">Use the category's service</option>{(me.services || []).map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
              </Field>
              <Field label="Author">
                <select value={post.author_id || ''} onChange={(e) => upd({ author_id: Number(e.currentTarget.value) })}>{team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
              </Field>
            </section>
            <section class="card">
              <h3><Icon name="history" size={16} /> Revisions</h3>
              {revisions.length ? <ul class="revs">{revisions.map((r) => <li key={r.id}><span>{fmtDate(r.saved_at)}<small>{r.user_name || ''}</small></span><button class="link-btn" type="button" onClick={() => restore(r)}>Restore</button></li>)}</ul>
                : <p class="hint">Versions are kept automatically as you save (last 25).</p>}
            </section>
            {post.id ? <section class="card card--danger"><button class="link-btn danger" type="button" onClick={async () => {
              if (!(await confirmDialog({ title: 'Delete this post?', text: 'This removes it permanently, including its revisions.', ok: 'Delete', danger: true }))) return;
              try { await api('post-delete', { id: post.id }); setDirty(false); toast('Post deleted'); onDone(); } catch (e) { toast(e.message, 'err'); } }}><Icon name="trash" size={15} /> Delete post</button></section> : null}
          </div>}

          {tab === 'seo' && <div class="edside__body">
            <section class="card seo-head">
              <Ring score={seo.score} grade={seo.grade} />
              <div><h3>SEO score</h3><p class="hint">{seo.score >= 80 ? 'Great. This post is well set up to rank.' : seo.score >= 55 ? 'Good start. Fix the red items below.' : 'Needs work before publishing.'}</p></div>
            </section>
            <section class="card">
              <Field label="Focus keyword" hint="The exact phrase customers type into Google. One per post." warn={!post.focus_keyword}>
                <input value={post.focus_keyword} onInput={(e) => upd({ focus_keyword: e.currentTarget.value })} placeholder="e.g. website design cost in mumbai" />
              </Field>
              <Field label="SEO title" count={(post.seo_title || `${post.title} | U Scale`).length} max={60} hint="Blank = post title + “| U Scale”. Lead with the keyword.">
                <input value={post.seo_title} onInput={(e) => upd({ seo_title: e.currentTarget.value })} placeholder={`${post.title || 'Post title'} | U Scale`} />
              </Field>
              <Field label="Meta description" count={(post.seo_description || post.excerpt || '').length} max={158} hint="Blank = the intro line. Promise + reason to click, 120–158 characters.">
                <textarea rows="3" value={post.seo_description} onInput={(e) => upd({ seo_description: e.currentTarget.value })} placeholder={post.excerpt} />
              </Field>
              <GooglePreview title={post.seo_title || `${post.title} | U Scale`} desc={post.seo_description || post.excerpt} slug={post.slug} site={site} date={post.published_at} />
            </section>
            <section class="card">
              <h3>Checklist <small>{bad.length ? `${bad.length} to fix` : 'all clear'}</small></h3>
              {['Keyword', 'Title & snippet', 'Content', 'Readability'].map((g) => {
                const list = seo.checks.filter((c) => c.group === g); if (!list.length) return null;
                return <div class="chk" key={g}><p class="chk__g">{g}</p><ul>{list.map((c) => <li key={c.id} class={`chk__i chk__i--${c.status}`}><span class="chk__dot" aria-hidden="true" /><div><b>{c.label}</b>{c.status !== 'good' && <small>{c.tip}</small>}</div></li>)}</ul></div>;
              })}
            </section>
            {ideas.length > 0 && <section class="card">
              <h3><Icon name="link" size={16} /> Internal link ideas</h3>
              <ul class="ideas">{ideas.map((i) => <li key={i.url + i.phrase}><span>“{i.phrase}” → <b>{i.title}</b></span><button class="btn btn--ghost btn--sm" type="button" onClick={() => addIdea(i)}>Link it</button></li>)}</ul>
            </section>}
            <section class="card">
              <h3>FAQ (rich results + AI answers)</h3>
              <p class="hint">Shown at the end of the post and marked up as FAQPage for Google, ChatGPT and Gemini.</p>
              <FaqEditor value={post.faq} onChange={(faq) => upd({ faq })} />
            </section>
            <section class="card">
              <h3>Advanced</h3>
              <Field label="Canonical URL (only if this was first published elsewhere)"><input value={post.canonical_url} onInput={(e) => upd({ canonical_url: e.currentTarget.value })} placeholder="https://…" /></Field>
              <Toggle checked={post.noindex} onChange={(v) => upd({ noindex: v })} label="Hide from Google (noindex)" hint="For thin or private posts. Still visible on the blog." />
            </section>
          </div>}
        </aside>
      </div>

      {dialog?.type === 'link' && editor && <LinkDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog?.type === 'image' && <MediaPicker files={dialog.files} onClose={() => setDialog(null)} onPick={({ media, alt, caption }) => {
        editor.chain().focus().setImage({ src: media.url, alt, title: caption || null, 'data-id': String(media.id) }).run();
        setDialog(null); toast('Image added');
      }} />}
      {dialog?.type === 'cover' && <MediaPicker title="Cover image" askCaption={false} initial={post.cover} onClose={() => setDialog(null)} onPick={({ media, alt }) => { upd({ cover: { ...media, alt } }); setDialog(null); }} />}
      {dialog?.type === 'cta' && <CtaDialog attrs={dialog.attrs} onClose={() => setDialog(null)}
        onDelete={dialog.pos != null ? () => { editor.chain().focus().setNodeSelection(dialog.pos).deleteSelection().run(); setDialog(null); } : null}
        onSave={(a) => {
          if (dialog.pos != null) editor.chain().focus().setNodeSelection(dialog.pos).updateAttributes('cta', a).run();
          else editor.chain().focus().insertCta(a).run();
          setDialog(null);
        }} />}
    </div>
  );
}
