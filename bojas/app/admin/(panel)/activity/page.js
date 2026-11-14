import Link from 'next/link';
import { requireAdminPage } from '@/lib/adminGuard';
import { connectDB, explainDbError } from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { ACTION_LABELS } from '@/lib/audit';

export const metadata = { title: 'Activity log' };

const PER_PAGE = 50;
const GROUPS = {
  '': 'All activity',
  changes: 'Website changes only',
  player: 'Players',
  content: 'Site content',
  user: 'Logins & passwords',
  submission: 'Form submissions',
  auth: 'Sign-ins',
};
const groupFilter = (g) => {
  if (g === 'changes') return { action: { $regex: '^(player|content)\\.' } };
  if (g === 'user') return { action: { $regex: '^(user|account)\\.' } };
  if (g && GROUPS[g]) return { action: { $regex: `^${g}\\.` } };
  return {};
};
const fmt = (d) => new Date(d).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });

export default async function ActivityPage({ searchParams }) {
  await requireAdminPage({ manageUsers: true });
  const group = GROUPS[searchParams.type] ? searchParams.type || '' : '';
  const who = String(searchParams.who || '').slice(0, 120);
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  let rows = [];
  let people = [];
  let total = 0;
  let loadError = '';
  try {
    await connectDB();
    const q = { ...groupFilter(group), ...(who ? { userEmail: who } : {}) };
    [rows, total, people] = await Promise.all([
      AuditLog.find(q).sort({ at: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).lean(),
      AuditLog.countDocuments(q),
      AuditLog.distinct('userEmail', { userEmail: { $ne: '' } }),
    ]);
  } catch (err) {
    loadError = explainDbError(err);
  }
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (p) => {
    const sp = new URLSearchParams();
    if (group) sp.set('type', group);
    if (who) sp.set('who', who);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/admin/activity/${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="h2 sm">Activity log</h1>
        <p className="muted">Who changed what on the website, newest first. Click a row to see the exact changes.</p>
      </div>

      <form className="log-filters" method="get">
        <label className="field"><span>Show</span>
          <select className="select" name="type" defaultValue={group}>
            {Object.entries(GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="field"><span>By</span>
          <select className="select" name="who" defaultValue={who}>
            <option value="">Everyone</option>
            {people.sort().map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn-ghost btn-sm">Filter</button>
        {(group || who) && <Link href="/admin/activity/" className="btn btn-ghost btn-sm">Clear</Link>}
      </form>

      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      {!loadError && rows.length === 0 && <div className="admin-empty"><p className="muted">No activity yet.</p></div>}

      {rows.length > 0 && (
        <ul className="log-list">
          {rows.map((r) => (
            <li key={String(r._id)} className={`log-row ${r.action === 'auth.login_failed' ? 'log-warn' : ''}`}>
              <details>
                <summary>
                  <span className="log-time">{fmt(r.at)}</span>
                  <span className="log-who">{r.userName || r.userEmail || 'Unknown'}{r.userName && r.userEmail ? <span className="muted"> · {r.userEmail}</span> : null}</span>
                  <span className="log-action">{ACTION_LABELS[r.action] || r.action}{r.target ? <> · <strong>{r.target}</strong></> : null}</span>
                  <span className="log-summary muted">{r.summary}</span>
                </summary>
                <div className="log-detail">
                  {r.changes?.length > 0 ? (
                    <table className="admin-table" style={{ minWidth: 0 }}>
                      <thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
                      <tbody>
                        {r.changes.map((c, i) => (
                          <tr key={i}><td>{c.field}</td><td className="muted log-val">{c.from}</td><td className="log-val">{c.to}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted" style={{ fontSize: 14 }}>No field-level details for this action.</p>
                  )}
                  {r.ip && <p className="muted" style={{ fontSize: 12 }}>IP address: {r.ip}</p>}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="admin-actions" aria-label="Pages">
          {page > 1 && <Link href={link(page - 1)} className="btn btn-ghost btn-sm">Newer</Link>}
          <span className="muted">Page {page} of {pages}</span>
          {page < pages && <Link href={link(page + 1)} className="btn btn-ghost btn-sm">Older</Link>}
        </nav>
      )}
    </div>
  );
}
