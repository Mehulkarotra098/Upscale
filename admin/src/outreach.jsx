// Outreach: a few shops a day, messaged by hand from Mehul's own WhatsApp. Each shop comes with its message
// written; "Open WhatsApp" opens the chat with the text typed in and marks the shop as sent.
import { useEffect, useState } from 'preact/hooks';
import { api, get } from './api.js';
import { Icon, Modal, Spinner, ago, toast } from './ui.jsx';

const STATUSES = [
  ['queued', 'To send'],
  ['sent', 'Sent'],
  ['replied', 'Replied'],
  ['audit', 'Audit booked'],
  ['client', 'Client'],
  ['no', 'Not interested'],
  ['stop', 'Said stop'],
];
const LABEL = Object.fromEntries(STATUSES);
const KIND = { clothing: 'Clothing', cafe: 'Café', restaurant: 'Restaurant', salon: 'Salon', other: 'Other' };
const PILL = { queued: 'pill--draft', sent: 'pill--sched', replied: 'pill--live', audit: 'pill--live', client: 'pill--live' };
const phone = (p) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;

const EXAMPLE = `Sharma Sarees | clothing | Andheri East | 98200 12345 | 4.8★ from 60 reviews, but no website on the listing | https://maps.app.goo.gl/...
Cafe Aroma | cafe | Marol | 9819012345 | Only on Swiggy; no menu or ordering of its own`;

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Message copied');
  } catch {
    toast('Couldn’t copy. Open the message and copy it by hand.', 'err');
  }
}

function StatusSelect({ row, onSave }) {
  return (
    <select
      class="oc__status"
      value={row.status}
      onChange={(e) => onSave(row, { status: e.currentTarget.value })}
      aria-label={`Status of ${row.name}`}
    >
      {STATUSES.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function ShopCard({ row, places, onSave, onSent, onReport, follow = false }) {
  const [busy, setBusy] = useState(false);
  const text = follow ? row.follow_up : row.message;
  const link = follow ? row.wa_follow_up : row.wa;
  const done = follow ? Boolean(row.followed_up_at) : row.status !== 'queued';
  return (
    <article class={`oc${done ? ' oc--done' : ''}`}>
      <header class="oc__head">
        <div>
          <b class="oc__name">{row.name}</b>
          <small class="block">
            {KIND[row.kind]}
            {row.area ? ` · ${row.area}` : ''} · {phone(row.phone)}
            {follow && row.sent_at ? ` · first message ${ago(row.sent_at)}` : ''}
          </small>
        </div>
        <StatusSelect row={row} onSave={onSave} />
      </header>
      {row.hook && <p class="oc__hook">{row.hook}</p>}
      <details class="oc__msg">
        <summary>{follow ? 'Follow-up message' : 'Message'}</summary>
        <pre>{text}</pre>
      </details>
      <div class="oc__acts">
        <a
          class={`btn btn--sm ${done ? 'btn--ghost' : 'btn--go'}`}
          href={link}
          target="_blank"
          rel="noopener"
          onClick={() => onSent(row, follow)}
        >
          <Icon name="ext" size={15} />
          {done ? 'Open WhatsApp again' : follow ? 'Send follow-up' : 'Open WhatsApp'}
        </a>
        <button class="btn btn--ghost btn--sm" type="button" onClick={() => copy(text)}>
          <Icon name="copy" size={15} />
          Copy
        </button>
        {row.report_url ? (
          <a class="btn btn--ghost btn--sm" href={row.report_url} target="_blank" rel="noopener">
            <Icon name="eye" size={15} />
            Report
          </a>
        ) : (
          places && (
            <button
              class="btn btn--ghost btn--sm"
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onReport(row);
                setBusy(false);
              }}
            >
              <Icon name="spark" size={15} />
              {busy ? 'Finding on Google…' : 'Make report link'}
            </button>
          )
        )}
      </div>
      <input
        class="oc__note"
        value={row.note}
        placeholder="Note: owner’s name, what they said, next step…"
        onChange={(e) => onSave(row, { note: e.currentTarget.value })}
        aria-label={`Note for ${row.name}`}
      />
    </article>
  );
}

function ImportModal({ onClose, onDone }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  async function submit() {
    setBusy(true);
    try {
      const r = await api('outreach-import', { text });
      setResult(r);
      toast(`Added ${r.added} shop${r.added === 1 ? '' : 's'}`);
      onDone();
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Add shops"
      wide
      onClose={onClose}
      footer={
        <>
          <button class="btn btn--ghost" type="button" onClick={onClose}>
            {result ? 'Done' : 'Cancel'}
          </button>
          <button class="btn btn--go" type="button" disabled={busy || !text.trim()} onClick={submit}>
            {busy ? 'Adding…' : 'Add to list'}
          </button>
        </>
      }
    >
      <p class="sub" style="margin-top:0">
        One shop per line: <b>name | type | area | mobile | one finding to mention | Google Maps link</b>. Only the name and a mobile number
        are needed. You can paste straight from a spreadsheet. Numbers already on the list, or that told the bot STOP, are skipped.
      </p>
      <textarea rows={10} value={text} placeholder={EXAMPLE} onInput={(e) => setText(e.currentTarget.value)} aria-label="Shops to add" />
      {result && (
        <div class="oc__result">
          <p>
            <b>{result.added}</b> added
            {result.skipped.length ? `, ${result.skipped.length} already on the list: ${result.skipped.slice(0, 8).join(', ')}` : ''}.
          </p>
          {result.errors.length > 0 && (
            <ul class="warn">
              {result.errors.slice(0, 12).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

export function OutreachPage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('today');
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [filling, setFilling] = useState(false);

  const load = () =>
    get('outreach', { status: filter || undefined })
      .then(setData)
      .catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
  }, [filter]);

  const patchRow = (id, patch) =>
    setData((d) => {
      const fix = (list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x));
      return { ...d, today: fix(d.today), followUps: fix(d.followUps), all: fix(d.all) };
    });

  async function save(row, patch) {
    try {
      const { row: r } = await api('outreach-update', { id: row.id, ...patch });
      patchRow(row.id, { ...patch, ...r });
      if (patch.status) toast(`${row.name}: ${LABEL[patch.status]}`);
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function sent(row, follow) {
    if (follow ? row.followed_up_at : row.status !== 'queued') return;
    await save(row, follow ? { followedUp: true } : { status: 'sent' });
  }

  async function report(row) {
    try {
      const { code, url } = await api('outreach-report', { id: row.id });
      await load();
      toast(`Report ready: /r/${code}`);
      return url;
    } catch (e) {
      toast(e.message, 'err');
      return null;
    }
  }

  async function fill() {
    setFilling(true);
    try {
      const r = await api('outreach-batch', {});
      toast(
        r.added
          ? `Added ${r.added} shop${r.added === 1 ? '' : 's'} to today${r.reports ? `, ${r.reports} with report links` : ''}`
          : 'Nothing new to add',
      );
      await load();
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setFilling(false);
    }
  }

  if (!data)
    return (
      <div class="page">
        <Spinner />
      </div>
    );
  const t = data.totals;
  const left = Math.max(0, data.daily - data.today.length);
  const sentToday = data.today.filter((r) => r.status !== 'queued').length;

  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>Outreach</h1>
          <p class="sub">{data.daily} shops a day, sent by hand from your own WhatsApp. Spread them through the day and reply fast.</p>
        </div>
        <button class="btn btn--ghost" type="button" onClick={() => setAdding(true)}>
          <Icon name="plus" size={17} />
          Add shops
        </button>
      </header>

      <div class="kpis">
        <div class="kpi">
          <small>Today</small>
          <b>
            {sentToday}/{data.daily}
          </b>
          <span>sent today</span>
        </div>
        <div class="kpi">
          <small>Replied</small>
          <b>{t.replied}</b>
          <span>of {t.sent} sent</span>
        </div>
        <div class="kpi">
          <small>Audits · clients</small>
          <b>
            {t.audits} · {t.clients}
          </b>
          <span>from outreach</span>
        </div>
        <div class="kpi">
          <small>In the queue</small>
          <b>{t.waiting}</b>
          <span>
            {t.waiting
              ? `about ${Math.ceil(t.waiting / data.daily)} more day${t.waiting > data.daily ? 's' : ''} of shops`
              : 'add more shops'}
          </span>
        </div>
      </div>

      {!data.places && (
        <p class="oc__info">
          Report links are off until a shop-data key (Google Places or SerpApi) is added in Vercel. Messages still work: they offer to send
          the report instead.
        </p>
      )}
      {data.provider === 'serpapi' && (
        <p class="oc__info">
          Shop data comes from SerpApi’s free plan (about 80 reports a month). Messages offer the report; when a shop replies “haan”, tap
          “Make report link” and send it.
        </p>
      )}

      <div class="tabs" role="tablist">
        {[
          ['today', `Today (${data.today.length})`],
          ['follow', `Follow-ups (${data.followUps.length})`],
          ['all', `All shops (${t.shops})`],
        ].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} class={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <section>
          {left > 0 && (
            <div class="oc__fill">
              <p>
                {data.today.length
                  ? `${left} more shop${left === 1 ? '' : 's'} can go out today.`
                  : t.waiting
                    ? 'Start today: pick the next shops from the queue.'
                    : 'The queue is empty. Add shops to start.'}
              </p>
              {t.waiting > 0 && (
                <button class="btn btn--go" type="button" disabled={filling} onClick={fill}>
                  {filling
                    ? 'Picking…'
                    : data.today.length
                      ? `Add ${Math.min(left, t.waiting)} more`
                      : `Get today’s ${Math.min(data.daily, t.waiting)}`}
                </button>
              )}
            </div>
          )}
          <div class="oc__grid">
            {data.today.map((r) => (
              <ShopCard key={r.id} row={r} places={data.places} onSave={save} onSent={sent} onReport={report} />
            ))}
          </div>
        </section>
      )}

      {tab === 'follow' && (
        <section>
          <p class="sub" style="margin:0 0 12px">
            Sent {data.followUpDays}+ days ago with no reply. One follow-up each, then leave them be.
          </p>
          {data.followUps.length ? (
            <div class="oc__grid">
              {data.followUps.map((r) => (
                <ShopCard key={r.id} row={r} follow places={data.places} onSave={save} onSent={sent} onReport={report} />
              ))}
            </div>
          ) : (
            <p class="empty">No follow-ups due.</p>
          )}
        </section>
      )}

      {tab === 'all' && (
        <section>
          <div class="filters" style="margin-bottom:12px">
            <select value={filter} onChange={(e) => setFilter(e.currentTarget.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {data.all.length ? (
            <div class="table-wrap">
              <table class="ptable">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Status</th>
                    <th class="hide-s">Note</th>
                    <th>Sent</th>
                    <th>
                      <span class="sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.all.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <b>{r.name}</b>
                        <small class="block">
                          {KIND[r.kind]}
                          {r.area ? ` · ${r.area}` : ''} · {phone(r.phone)}
                        </small>
                      </td>
                      <td>
                        <span class={`pill ${PILL[r.status] || ''}`} style="margin-right:6px">
                          {LABEL[r.status]}
                        </span>
                        <StatusSelect row={r} onSave={save} />
                      </td>
                      <td class="hide-s">
                        <input
                          value={r.note}
                          placeholder="Note"
                          onChange={(e) => save(r, { note: e.currentTarget.value })}
                          aria-label={`Note for ${r.name}`}
                        />
                      </td>
                      <td>{r.sent_at ? ago(r.sent_at) : '—'}</td>
                      <td class="acts">
                        {r.report_url && (
                          <a class="ibtn" href={r.report_url} target="_blank" rel="noopener" title="Open report">
                            <Icon name="eye" size={16} />
                          </a>
                        )}
                        {r.status !== 'stop' && r.status !== 'no' && (
                          <a class="ibtn" href={`https://wa.me/91${r.phone}`} target="_blank" rel="noopener" title="Open WhatsApp chat">
                            <Icon name="ext" size={16} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p class="empty">No shops here yet.</p>
          )}
        </section>
      )}

      {adding && <ImportModal onClose={() => setAdding(false)} onDone={load} />}
    </div>
  );
}
