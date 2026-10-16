// Dashboard, posts list, categories, team & account pages.
import { useEffect, useState } from 'preact/hooks';
import { api, get } from './api.js';
import { Icon, Modal, toast, confirmDialog, Field, ago, Pill, statusOf, Spinner } from './ui.jsx';
import { slugify } from './editor.jsx';

const go = (hash) => {
  location.hash = hash;
};

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div class="bars" role="img" aria-label={`Reads per day for the last 30 days, peak ${max}`}>
      {data.map((d) => (
        <span
          key={d.day}
          title={`${d.day}: ${d.n} reads`}
          style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }}
          class={d.n ? '' : 'is-zero'}
        />
      ))}
    </div>
  );
}

export function Dashboard({ me }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    get('stats')
      .then(setS)
      .catch((e) => toast(e.message, 'err'));
  }, []);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  if (!s)
    return (
      <div class="page">
        <Spinner />
      </div>
    );
  const c = s.counts;
  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>
            {hello}, {me.name.split(' ')[0]}
          </h1>
          <p class="sub">Here's how the blog is doing.</p>
        </div>
        <button class="btn btn--go" type="button" onClick={() => go('#/new')}>
          <Icon name="plus" size={16} />
          Write a post
        </button>
      </header>
      <div class="kpis">
        <div class="kpi">
          <small>Live posts</small>
          <b>{c.live}</b>
          <span>{c.words.toLocaleString('en-IN')} words published</span>
        </div>
        <div class="kpi">
          <small>Drafts</small>
          <b>{c.drafts}</b>
          <span>{c.scheduled ? `${c.scheduled} scheduled` : 'Nothing scheduled'}</span>
        </div>
        <div class="kpi">
          <small>Reads, 7 days</small>
          <b>{s.views.d7.toLocaleString('en-IN')}</b>
          <span>{s.views.d30.toLocaleString('en-IN')} in 30 days</span>
        </div>
        <div class="kpi">
          <small>Images</small>
          <b>{s.media.n}</b>
          <span>{(Number(s.media.bytes) / 1048576).toFixed(1)} MB stored</span>
        </div>
      </div>
      <div class="dgrid">
        <section class="card">
          <h3>
            Reads per day <small>last 30 days · counted after 10 s on a post, bots excluded</small>
          </h3>
          <Bars data={s.daily} />
        </section>
        <section class="card">
          <h3>
            Top posts <small>30 days</small>
          </h3>
          {s.top.length ? (
            <ol class="toplist">
              {s.top.map((p) => (
                <li key={p.id}>
                  <a href={`#/edit/${p.id}`}>{p.title}</a>
                  <span>{p.views30} reads</span>
                </li>
              ))}
            </ol>
          ) : (
            <p class="empty">Publish your first post to see reads here.</p>
          )}
        </section>
        <section class="card dgrid__wide">
          <h3>Recently edited</h3>
          {s.recent.length ? (
            <ul class="rows">
              {s.recent.map((p) => (
                <li key={p.id}>
                  <a href={`#/edit/${p.id}`}>
                    <b>{p.title || 'Untitled'}</b>
                    <small>
                      {ago(p.updated_at)} · {p.word_count} words
                    </small>
                  </a>
                  <Pill p={p} />
                </li>
              ))}
            </ul>
          ) : (
            <div class="empty-hero">
              <Icon name="spark" size={28} />
              <p>
                <b>Your blog is ready.</b> Write about the questions your clients ask you every week: what a website costs, how to get more
                Google reviews, why their shop doesn't show on Maps.
              </p>
              <button class="btn btn--go" type="button" onClick={() => go('#/new')}>
                Write the first post
              </button>
            </div>
          )}
        </section>
        <section class="card dgrid__wide tips">
          <h3>Ranking checklist</h3>
          <ul>
            <li>
              <b>One focus keyword per post</b>, picked from what customers type (“website design cost mumbai”), not jargon.
            </li>
            <li>
              <b>900+ words, 3–4 images</b> with descriptive alt text, and H2 sections that each answer one question.
            </li>
            <li>
              <b>Link 2+ of your own pages</b> (a service page and a related post), and 1 trusted outside source.
            </li>
            <li>
              <b>Add a FAQ</b> of real customer questions: it feeds Google rich results and AI answers.
            </li>
            <li>
              <b>Publish consistently</b> (1–2 posts a week) and update older posts when facts change.
            </li>
            <li>
              One-time setup: verify uscale.in in{' '}
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener">
                Google Search Console
              </a>{' '}
              and submit <code>/sitemap.xml</code>.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export function PostsList() {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const load = () =>
    get('posts', { status, q })
      .then((d) => setRows(d.posts))
      .catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [status, q]);
  async function dup(p) {
    try {
      const { id } = await api('post-duplicate', { id: p.id });
      toast('Copy created');
      go(`#/edit/${id}`);
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  async function del(p) {
    if (
      !(await confirmDialog({
        title: `Delete “${p.title || 'Untitled'}”?`,
        text: 'This removes the post permanently.',
        ok: 'Delete',
        danger: true,
      }))
    )
      return;
    try {
      await api('post-delete', { id: p.id });
      setRows((r) => r.filter((x) => x.id !== p.id));
      toast('Post deleted');
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>Posts</h1>
        </div>
        <button class="btn btn--go" type="button" onClick={() => go('#/new')}>
          <Icon name="plus" size={16} />
          New post
        </button>
      </header>
      <div class="filters">
        <div class="seg" role="tablist">
          {[
            ['', 'All'],
            ['live', 'Live'],
            ['scheduled', 'Scheduled'],
            ['draft', 'Drafts'],
          ].map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={status === k}
              class={status === k ? 'is-on' : ''}
              onClick={() => setStatus(k)}
            >
              {l}
            </button>
          ))}
        </div>
        <div class="search">
          <Icon name="search" size={16} />
          <input placeholder="Search title, URL or keyword" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
        </div>
      </div>
      {!rows ? (
        <Spinner />
      ) : !rows.length ? (
        <p class="empty">No posts here yet.</p>
      ) : (
        <div class="table-wrap">
          <table class="ptable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th class="hide-s">Category</th>
                <th class="hide-s">Keyword</th>
                <th class="num hide-s">Words</th>
                <th class="num">Reads 30d</th>
                <th>Updated</th>
                <th>
                  <span class="sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <a class="ptitle" href={`#/edit/${p.id}`}>
                      {p.cover_media_id ? (
                        <img src={`/media/${p.cover_media_id}-${slugify(p.cover_name || 'image', 60)}-800.webp`} alt="" loading="lazy" />
                      ) : (
                        <span class="ptitle__ph" />
                      )}
                      <span>
                        <b>{p.title || 'Untitled'}</b>
                        <small>/blog/{p.slug}</small>
                      </span>
                    </a>
                  </td>
                  <td>
                    <Pill p={p} />
                    {statusOf(p).key === 'sched' && (
                      <small class="block">
                        {new Date(p.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </small>
                    )}
                  </td>
                  <td class="hide-s">{p.cat_name || '—'}</td>
                  <td class="hide-s">{p.focus_keyword || <em class="warn">none</em>}</td>
                  <td class="num hide-s">{p.word_count.toLocaleString('en-IN')}</td>
                  <td class="num">{p.views30}</td>
                  <td>{ago(p.updated_at)}</td>
                  <td class="acts">
                    {statusOf(p).key === 'live' && (
                      <a class="ibtn" href={`/blog/${p.slug}`} target="_blank" rel="noopener" title="View live">
                        <Icon name="ext" size={16} />
                      </a>
                    )}
                    <button class="ibtn" type="button" title="Duplicate" onClick={() => dup(p)}>
                      <Icon name="copy" size={16} />
                    </button>
                    <button class="ibtn ibtn--danger" type="button" title="Delete" onClick={() => del(p)}>
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryForm({ cat, services, onSaved, onClose }) {
  const [c, setC] = useState({
    name: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    service_slug: '',
    sort: 0,
    ...cat,
  });
  const [auto, setAuto] = useState(!cat?.id);
  const set = (k) => (e) => {
    const v = e.currentTarget.value;
    setC((x) => ({ ...x, [k]: v, ...(k === 'name' && auto ? { slug: slugify(v, 60) } : {}) }));
    if (k === 'slug') setAuto(false);
  };
  async function save() {
    try {
      const { category } = await api('category-save', c);
      onSaved(category);
      toast('Category saved');
      onClose();
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  return (
    <Modal
      title={c.id ? 'Edit category' : 'New category'}
      onClose={onClose}
      footer={
        <>
          <span class="grow" />
          <button class="btn btn--ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button class="btn btn--go" type="button" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div class="row2">
        <Field label="Name">
          <input value={c.name} onInput={set('name')} placeholder="e.g. Google & local SEO" />
        </Field>
        <Field label="URL">
          <input value={c.slug} onInput={set('slug')} />
        </Field>
      </div>
      <Field label="Description" hint="Shown at the top of the category page. 1–2 sentences with the main keyword.">
        <textarea rows="2" value={c.description} onInput={set('description')} />
      </Field>
      <Field label="SEO title (optional)" count={c.seo_title.length} max={60}>
        <input value={c.seo_title} onInput={set('seo_title')} />
      </Field>
      <Field label="Meta description (optional)" count={c.seo_description.length} max={158}>
        <textarea rows="2" value={c.seo_description} onInput={set('seo_description')} />
      </Field>
      <div class="row2">
        <Field label="Related service">
          <select value={c.service_slug} onChange={set('service_slug')}>
            <option value="">None</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order">
          <input type="number" value={c.sort} onInput={set('sort')} />
        </Field>
      </div>
    </Modal>
  );
}

export function Categories({ me }) {
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    get('categories')
      .then((d) => setRows(d.categories))
      .catch((e) => toast(e.message, 'err'));
  }, []);
  async function del(c) {
    if (
      !(await confirmDialog({
        title: `Delete “${c.name}”?`,
        text: c.n ? `${c.n} post(s) will become uncategorised.` : 'No posts use it.',
        ok: 'Delete',
        danger: true,
      }))
    )
      return;
    try {
      await api('category-delete', { id: c.id });
      setRows((r) => r.filter((x) => x.id !== c.id));
      toast('Category deleted');
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>Categories</h1>
          <p class="sub">Each category gets its own page (/blog/category/…) that can rank too.</p>
        </div>
        <button class="btn btn--go" type="button" onClick={() => setEdit({})}>
          <Icon name="plus" size={16} />
          New category
        </button>
      </header>
      {!rows ? (
        <Spinner />
      ) : !rows.length ? (
        <div class="empty-hero">
          <p>
            <b>No categories yet.</b> Suggested: Websites, Google &amp; local SEO, Social media, Ads, AI search, Case studies.
          </p>
        </div>
      ) : (
        <ul class="cats">
          {rows.map((c) => (
            <li key={c.id} class="card">
              <div>
                <b>{c.name}</b>
                <small>
                  /blog/category/{c.slug} · {c.n} post{c.n === 1 ? '' : 's'}
                </small>
                {c.description && <p>{c.description}</p>}
              </div>
              <div class="acts">
                <button class="btn btn--ghost btn--sm" type="button" onClick={() => setEdit(c)}>
                  Edit
                </button>
                <button class="ibtn ibtn--danger" type="button" onClick={() => del(c)} title="Delete">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <CategoryForm
          cat={edit}
          services={me.services || []}
          onClose={() => setEdit(null)}
          onSaved={(c) =>
            setRows((r) => {
              const i = r.findIndex((x) => x.id === c.id);
              return i >= 0 ? r.map((x) => (x.id === c.id ? { ...x, ...c } : x)) : [...r, { ...c, n: 0 }];
            })
          }
        />
      )}
    </div>
  );
}

function UserForm({ user, me, onSaved, onClose }) {
  const [u, setU] = useState({ name: '', email: '', password: '', bio: '', job_title: '', role: 'editor', ...user });
  const set = (k) => (e) => setU({ ...u, [k]: e.currentTarget.value });
  async function save() {
    try {
      const r = await api('user-save', u);
      onSaved(r.user);
      toast('Saved');
      onClose();
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  return (
    <Modal
      title={u.id ? (u.id === me.id ? 'Your profile' : 'Edit person') : 'Add a writer'}
      onClose={onClose}
      footer={
        <>
          <span class="grow" />
          <button class="btn btn--ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button class="btn btn--go" type="button" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div class="row2">
        <Field label="Name">
          <input value={u.name} onInput={set('name')} />
        </Field>
        <Field label="Email (login)">
          <input type="email" value={u.email} onInput={set('email')} />
        </Field>
      </div>
      {!u.id && (
        <Field label="Temporary password" hint="At least 10 characters. Share it privately; they can change it under Account.">
          <input type="text" value={u.password} onInput={set('password')} autocomplete="new-password" />
        </Field>
      )}
      <Field label="Job title (shown on posts)">
        <input value={u.job_title} onInput={set('job_title')} placeholder="Founder, U Scale" />
      </Field>
      <Field
        label="Short bio (author box under posts)"
        hint="Who you are and why readers should trust you. Google looks for real expertise."
      >
        <textarea rows="3" value={u.bio} onInput={set('bio')} />
      </Field>
      {me.role === 'owner' && u.id !== me.id && (
        <Field label="Role">
          <select value={u.role} onChange={set('role')}>
            <option value="editor">Editor: writes and publishes</option>
            <option value="owner">Owner: also manages the team</option>
          </select>
        </Field>
      )}
    </Modal>
  );
}

export function Team({ me, onMe }) {
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null);
  const [pw, setPw] = useState({ current: '', next: '' });
  useEffect(() => {
    get('users')
      .then((d) => setRows(d.users))
      .catch((e) => toast(e.message, 'err'));
  }, []);
  async function del(u) {
    if (!(await confirmDialog({ title: `Remove ${u.name}?`, text: 'Their posts will be reassigned to you.', ok: 'Remove', danger: true })))
      return;
    try {
      await api('user-delete', { id: u.id });
      setRows((r) => r.filter((x) => x.id !== u.id));
      toast('Removed');
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  async function changePw(e) {
    e.preventDefault();
    try {
      await api('password', pw);
      setPw({ current: '', next: '' });
      toast('Password changed. Other devices are signed out.');
    } catch (er) {
      toast(er.message, 'err');
    }
  }
  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>Team &amp; account</h1>
          <p class="sub">People who can write and publish on the blog.</p>
        </div>
        {me.role === 'owner' && (
          <button class="btn btn--go" type="button" onClick={() => setEdit({})}>
            <Icon name="plus" size={16} />
            Add a writer
          </button>
        )}
      </header>
      {!rows ? (
        <Spinner />
      ) : (
        <ul class="cats">
          {rows.map((u) => (
            <li key={u.id} class="card">
              <div>
                <b>
                  {u.name}
                  {u.id === me.id && ' (you)'}
                </b>
                <small>
                  {u.email} · {u.role} · {u.posts} post{u.posts === 1 ? '' : 's'}
                </small>
                {u.bio && <p>{u.bio}</p>}
              </div>
              <div class="acts">
                {(me.role === 'owner' || u.id === me.id) && (
                  <button class="btn btn--ghost btn--sm" type="button" onClick={() => setEdit(u)}>
                    Edit
                  </button>
                )}
                {me.role === 'owner' && u.id !== me.id && (
                  <button class="ibtn ibtn--danger" type="button" onClick={() => del(u)} title="Remove">
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <section class="card narrow">
        <h3>
          <Icon name="key" size={16} /> Change your password
        </h3>
        <form onSubmit={changePw} class="stack">
          <Field label="Current password">
            <input
              type="password"
              autocomplete="current-password"
              value={pw.current}
              onInput={(e) => setPw({ ...pw, current: e.currentTarget.value })}
            />
          </Field>
          <Field label="New password" hint="At least 10 characters.">
            <input
              type="password"
              autocomplete="new-password"
              value={pw.next}
              onInput={(e) => setPw({ ...pw, next: e.currentTarget.value })}
            />
          </Field>
          <button class="btn btn--go" type="submit" disabled={!pw.current || pw.next.length < 10}>
            Change password
          </button>
        </form>
      </section>
      {edit && (
        <UserForm
          user={edit}
          me={me}
          onClose={() => setEdit(null)}
          onSaved={(u) => {
            setRows((r) => {
              const i = r.findIndex((x) => x.id === u.id);
              return i >= 0 ? r.map((x) => (x.id === u.id ? { ...x, ...u } : x)) : [...r, { ...u, posts: 0 }];
            });
            if (u.id === me.id) onMe({ ...me, ...u });
          }}
        />
      )}
    </div>
  );
}
