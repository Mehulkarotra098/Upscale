// AI search: which AI assistants and crawlers read uscale.in, and which pages they used to answer people.
// Data comes from middleware.js → /api/blog?view=ai → ai_hits (daily counts only, nothing personal).
import { useEffect, useState } from 'preact/hooks';
import { get } from './api.js';
import { Spinner, toast } from './ui.jsx';

const n = (x) => Number(x || 0).toLocaleString('en-IN');
const day = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.answers));
  return (
    <div class="bars" role="img" aria-label={`AI answers per day, peak ${max}`}>
      {data.map((d) => (
        <span
          key={d.day}
          title={`${d.day}: ${d.answers} AI answers, ${d.n} AI visits in all`}
          style={{ height: `${Math.max(3, (d.answers / max) * 100)}%` }}
          class={d.answers ? '' : 'is-zero'}
        />
      ))}
    </div>
  );
}

export function AiSearchPage() {
  const [days, setDays] = useState(30);
  const [s, setS] = useState(null);
  useEffect(() => {
    setS(null);
    get('ai-search', { days })
      .then(setS)
      .catch((e) => toast(e.message, 'err'));
  }, [days]);

  const head = (
    <header class="page__head">
      <div>
        <h1>AI search</h1>
        <p class="sub">Which AI assistants read uscale.in, and which pages they used to answer people.</p>
      </div>
      <div class="seg" role="tablist" aria-label="Period">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" role="tab" aria-selected={days === d} class={days === d ? 'is-on' : ''} onClick={() => setDays(d)}>
            {d} days
          </button>
        ))}
      </div>
    </header>
  );
  if (!s)
    return (
      <div class="page">
        {head}
        <Spinner />
      </div>
    );
  const t = s.totals || {};
  return (
    <div class="page">
      {head}
      {!s.logging && (
        <p class="oc__info">
          Logging is off. Add an <code>AI_LOG_KEY</code> environment variable in Vercel (any long random string) and redeploy.
        </p>
      )}
      <div class="kpis">
        <div class="kpi">
          <small>AI answers</small>
          <b>{n(t.live)}</b>
          <span>pages opened live by ChatGPT, Perplexity, Claude…</span>
        </div>
        <div class="kpi">
          <small>Visitors from AI</small>
          <b>{n(t.referrals)}</b>
          <span>clicked through from an AI answer</span>
        </div>
        <div class="kpi">
          <small>AI search indexing</small>
          <b>{n(t.indexed)}</b>
          <span>visits by ChatGPT, Perplexity and Claude search bots</span>
        </div>
        <div class="kpi">
          <small>Pages used in answers</small>
          <b>{n(t.answer_pages)}</b>
          <span>
            {n(t.crawled)} search and training crawls in {s.days} days
          </span>
        </div>
      </div>
      <div class="dgrid">
        <section class="card dgrid__wide">
          <h3>
            AI answers per day <small>live reads + visitors from AI, last {s.days} days</small>
          </h3>
          <Bars data={s.daily || []} />
        </section>
        <section class="card">
          <h3>
            Who is reading <small>{s.days} days</small>
          </h3>
          {s.agents?.length ? (
            <ol class="toplist">
              {s.agents.map((a) => (
                <li key={`${a.name}-${a.kind}`}>
                  <span>
                    <b>{a.name}</b> <small>· {s.kinds[a.kind]}</small>
                  </span>
                  <span>
                    {n(a.n)} · {a.pages} {a.pages === 1 ? 'page' : 'pages'} · last {day(a.last)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p class="empty">Nothing yet. AI crawlers usually show up within a few days of logging being switched on.</p>
          )}
        </section>
        <section class="card">
          <h3>
            Pages AI used <small>answers · indexing · all</small>
          </h3>
          {s.pages?.length ? (
            <ol class="toplist">
              {s.pages.map((p) => (
                <li key={p.path}>
                  <a href={p.path} target="_blank" rel="noopener">
                    {p.path}
                  </a>
                  <span>
                    {n(p.answers)} · {n(p.indexed)} · {n(p.n)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p class="empty">No pages yet.</p>
          )}
        </section>
        <section class="card dgrid__wide">
          <h3>Latest AI answers</h3>
          {s.latest?.length ? (
            <ul class="rows">
              {s.latest.map((r) => (
                <li key={`${r.day}${r.name}${r.path}`}>
                  <a href={r.path} target="_blank" rel="noopener">
                    <b>{r.path}</b>
                    <small>
                      {day(r.day)} · {r.name} · {r.kind === 'ref' ? 'visitor clicked through' : 'read live to answer someone'}
                    </small>
                  </a>
                  <span>×{r.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p class="empty">
              When someone asks ChatGPT, Perplexity or Claude something and it opens a uscale.in page to answer, it shows up here.
            </p>
          )}
        </section>
        <section class="card dgrid__wide tips">
          <h3>Reading these numbers</h3>
          <ul>
            <li>
              <b>AI answers</b> are the clearest sign of AI visibility: an assistant fetched the page while answering a real question.
            </li>
            <li>
              <b>Visitors from AI</b> are undercounted. Since October 2026 ChatGPT often hides where a click came from, and AI apps on
              phones rarely pass it on, so many of these visits look like direct traffic.
            </li>
            <li>
              <b>Indexing</b> by OAI-SearchBot, PerplexityBot and Claude-SearchBot decides whether a page can be found by those assistants
              at all. Google AI Overviews and AI Mode use Google’s normal index (Googlebot).
            </li>
            <li>Counts are per day and page only. No IP addresses, cookies or personal data are stored.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
