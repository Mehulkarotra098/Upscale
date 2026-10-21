// WhatsApp score bot leads: everyone who checked a shop through the bot. "Wants help" people come first.
import { useEffect, useState } from 'preact/hooks';
import { api, get } from './api.js';
import { Icon, Spinner, ago, toast } from './ui.jsx';

const STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['audit', 'Audit booked'],
  ['client', 'Client'],
  ['no', 'Not interested'],
];

const phone = (waId) => (waId.startsWith('91') && waId.length === 12 ? `+91 ${waId.slice(2, 7)} ${waId.slice(7)}` : `+${waId}`);

export function LeadsPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    get('wa-leads')
      .then(setData)
      .catch((e) => toast(e.message, 'err'));
  }, []);

  async function save(l, patch) {
    try {
      await api('wa-lead', { waId: l.wa_id, ...patch });
      setData((d) => ({ ...d, leads: d.leads.map((x) => (x.wa_id === l.wa_id ? { ...x, ...patch } : x)) }));
      toast('Saved');
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  if (!data)
    return (
      <div class="page">
        <Spinner />
      </div>
    );
  const t = data.totals;
  return (
    <div class="page">
      <header class="page__head">
        <div>
          <h1>WhatsApp leads</h1>
          <p class="sub">Everyone who checked a shop with the Google score bot. Reply from the U Scale WhatsApp.</p>
        </div>
      </header>
      <div class="kpis">
        <div class="kpi">
          <small>People</small>
          <b>{t.people}</b>
          <span>{t.new_7d} new this week</span>
        </div>
        <div class="kpi">
          <small>Shops checked</small>
          <b>{t.checks}</b>
          <span>across all people</span>
        </div>
        <div class="kpi">
          <small>Want help</small>
          <b>{t.want_help}</b>
          <span>tapped “Theek karwana hai”</span>
        </div>
        <div class="kpi">
          <small>Audits · clients</small>
          <b>
            {t.audits} · {t.clients}
          </b>
          <span>from the bot</span>
        </div>
      </div>
      {!data.leads.length ? (
        <p class="empty">No one has used the bot yet. Share the bot number in a reel or on a card to start.</p>
      ) : (
        <div class="table-wrap">
          <table class="ptable">
            <thead>
              <tr>
                <th>Person</th>
                <th class="num">Score</th>
                <th>Status</th>
                <th class="hide-s">Note</th>
                <th>Last message</th>
                <th>
                  <span class="sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((l) => (
                <tr key={l.wa_id}>
                  <td>
                    <b>{l.profile_name || 'Unknown'}</b>
                    {l.wants_help && (
                      <small class="block" style="color:#2F7A1F;font-weight:700">
                        Wants help
                      </small>
                    )}
                    {l.opted_out && <small class="block warn">Said stop</small>}
                    <small class="block">
                      {phone(l.wa_id)} · {l.checks} check{l.checks === 1 ? '' : 's'}
                    </small>
                  </td>
                  <td class="num">{l.last_score ?? '—'}</td>
                  <td>
                    <select value={l.status} onChange={(e) => save(l, { status: e.currentTarget.value })} aria-label="Status">
                      {STATUSES.map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td class="hide-s">
                    <input
                      value={l.note}
                      placeholder="Shop name, owner, next step…"
                      onChange={(e) => save(l, { note: e.currentTarget.value })}
                      aria-label="Note"
                    />
                  </td>
                  <td>{ago(l.last_message_at)}</td>
                  <td class="acts">
                    {l.last_code && (
                      <a class="ibtn" href={`/r/${l.last_code}`} target="_blank" rel="noopener" title="Open their report">
                        <Icon name="eye" size={16} />
                      </a>
                    )}
                    {!l.opted_out && (
                      <a class="ibtn" href={`https://wa.me/${l.wa_id}`} target="_blank" rel="noopener" title="Open WhatsApp chat">
                        <Icon name="ext" size={16} />
                      </a>
                    )}
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
