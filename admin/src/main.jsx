// U Scale admin: sign-in, shell (sidebar), hash router.
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { api, get } from './api.js';
import { Icon, Toasts, ConfirmHost, toast } from './ui.jsx';
import { Dashboard, PostsList, Categories, Team } from './pages.jsx';
import { PostEditor } from './editor.jsx';
import { MediaPage } from './media.jsx';
import './styles.css';

const Logo = () => (
  <svg class="lg" viewBox="0 0 120 32" aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="#63B849" />
    <path d="M9 9v8.2a7 7 0 0 0 14 0V9h-4.4v8.2a2.6 2.6 0 0 1-5.2 0V9z" fill="#251E45" />
    <text x="40" y="22.5" font-family="Inter, sans-serif" font-weight="800" font-size="17" fill="currentColor" letter-spacing="-.3">
      uscale
    </text>
  </svg>
);

function useHash() {
  const [hash, set] = useState(location.hash || '#/');
  useEffect(() => {
    const f = () => set(location.hash || '#/');
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return hash;
}

function Login({ onIn, setupError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const { user } = await api('login', { email, password });
      onIn(user);
    } catch (er) {
      setErr(er.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div class="login">
      <form class="login__card" onSubmit={submit}>
        <Logo />
        <h1>Blog admin</h1>
        <p class="sub">Sign in to write and publish on uscale.in</p>
        {setupError && <p class="alert">{setupError}</p>}
        <label class="fld">
          <span class="fld__label">Email</span>
          <input type="email" autocomplete="username" value={email} onInput={(e) => setEmail(e.currentTarget.value)} required />
        </label>
        <label class="fld">
          <span class="fld__label">Password</span>
          <input
            type="password"
            autocomplete="current-password"
            value={password}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </label>
        {err && (
          <p class="alert" role="alert">
            {err}
          </p>
        )}
        <button class="btn btn--go btn--block" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a class="login__back" href="/">
          ← Back to uscale.in
        </a>
      </form>
    </div>
  );
}

const NAV = [
  ['#/', 'Dashboard', 'dash'],
  ['#/posts', 'Posts', 'posts'],
  ['#/media', 'Media', 'media'],
  ['#/categories', 'Categories', 'cat'],
  ['#/team', 'Team & account', 'team'],
];

function App() {
  const [me, setMe] = useState(undefined);
  const [setupError, setSetupError] = useState('');
  const [menu, setMenu] = useState(false);
  const hash = useHash();
  useEffect(() => {
    get('me')
      .then((d) => setMe({ ...d.user, site: d.site, services: d.services }))
      .catch((e) => {
        if (e.status === 503) setSetupError(e.message);
        setMe(null);
      });
  }, []);
  useEffect(() => setMenu(false), [hash]);
  if (me === undefined)
    return (
      <div class="boot">
        <Logo />
      </div>
    );
  if (!me)
    return (
      <Login
        setupError={setupError}
        onIn={() =>
          get('me')
            .then((d) => setMe({ ...d.user, site: d.site, services: d.services }))
            .catch((e) => toast(e.message, 'err'))
        }
      />
    );

  const editMatch = hash.match(/^#\/edit\/(\d+)/);
  const isEditor = !!editMatch || hash === '#/new';
  let page;
  if (editMatch)
    page = (
      <PostEditor
        key={editMatch[1]}
        id={Number(editMatch[1])}
        me={me}
        onDone={() => {
          location.hash = '#/posts';
        }}
      />
    );
  else if (hash === '#/new')
    page = (
      <PostEditor
        key={`new-${Date.now()}`}
        id={0}
        me={me}
        onDone={() => {
          location.hash = '#/posts';
        }}
      />
    );
  else if (hash.startsWith('#/posts')) page = <PostsList />;
  else if (hash.startsWith('#/media')) page = <MediaPage />;
  else if (hash.startsWith('#/categories')) page = <Categories me={me} />;
  else if (hash.startsWith('#/team')) page = <Team me={me} onMe={setMe} />;
  else page = <Dashboard me={me} />;

  async function logout() {
    try {
      await api('logout', {});
    } catch {
      /* offline: the cookie expires on its own */
    }
    setMe(null);
  }
  return (
    <div class={`app${isEditor ? ' app--editor' : ''}${menu ? ' menu-open' : ''}`}>
      <aside class="side">
        <div class="side__top">
          <a href="#/" class="side__logo">
            <Logo />
            <span>Blog admin</span>
          </a>
          <button class="side__menu" type="button" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Icon name={menu ? 'x' : 'menu'} />
          </button>
        </div>
        <nav class="side__nav" aria-label="Admin">
          <a class="side__new" href="#/new">
            <Icon name="plus" size={17} />
            New post
          </a>
          {NAV.map(([href, label, icon]) => {
            const on = href === '#/' ? hash === '#/' || hash === '' : hash.startsWith(href) || (href === '#/posts' && isEditor);
            return (
              <a key={href} href={href} class={on ? 'is-on' : ''} aria-current={on ? 'page' : undefined}>
                <Icon name={icon} />
                {label}
              </a>
            );
          })}
        </nav>
        <div class="side__foot">
          <a href="/blog" target="_blank" rel="noopener">
            <Icon name="globe" size={17} />
            View blog
            <Icon name="ext" size={14} />
          </a>
          <div class="side__me">
            <span class="av">
              {me.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              <b>{me.name}</b>
              <small>{me.role}</small>
            </span>
            <button type="button" onClick={logout} title="Sign out" aria-label="Sign out">
              <Icon name="out" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div class="content">{page}</div>
    </div>
  );
}

render(
  <>
    <App />
    <Toasts />
    <ConfirmHost />
  </>,
  document.getElementById('app'),
);
