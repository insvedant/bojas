import Link from 'next/link';
import { requireAdminPage, canManageUsers } from '@/lib/adminGuard';
import { connectDB, explainDbError } from '@/lib/db';
import Submission from '@/models/Submission';
import { VIEWS, buildQuery } from '@/lib/submissionQuery';
import { STATUSES, sourceSummary } from '@/lib/submissions';
import { playerForms } from '@/lib/site';
import EmptySpamButton from '@/components/admin/EmptySpamButton';

export const metadata = { title: 'Submissions' };

const PER_PAGE = 40;
const FORM_OPTIONS = [...playerForms.map((f) => f.title), 'Contact form'];
const fmt = (d) => new Date(d).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });

export default async function SubmissionsPage({ searchParams }) {
  const me = await requireAdminPage();
  const view = VIEWS[searchParams.view] ? searchParams.view : 'inbox';
  const form = FORM_OPTIONS.includes(searchParams.form) ? searchParams.form : '';
  const status = STATUSES[searchParams.status] ? searchParams.status : '';
  const search = String(searchParams.q || '').slice(0, 80);
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  let rows = [];
  let total = 0;
  let counts = {};
  let loadError = '';
  try {
    await connectDB();
    const q = buildQuery({ view, form, status, search });
    // Badges: unread count for open folders, total for spam, none for archived.
    const countQ = Object.entries(VIEWS).filter(([k]) => k !== 'archived').map(([k, v]) => Submission.countDocuments(k === 'spam' ? v.q : { ...v.q, status: 'new' }).then((n) => [k, n]));
    [rows, total, counts] = await Promise.all([
      Submission.find(q).sort({ createdAt: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).select('-data').lean(),
      Submission.countDocuments(q),
      Promise.all(countQ).then(Object.fromEntries),
    ]);
  } catch (err) {
    loadError = explainDbError(err);
  }
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (over = {}) => {
    const sp = new URLSearchParams();
    const v = { view, form, status, q: search, page: 1, ...over };
    if (v.view !== 'inbox') sp.set('view', v.view);
    if (v.form) sp.set('form', v.form);
    if (v.status) sp.set('status', v.status);
    if (v.q) sp.set('q', v.q);
    if (v.page > 1) sp.set('page', String(v.page));
    const s = sp.toString();
    return `/admin/submissions/${s ? `?${s}` : ''}`;
  };
  const exportHref = `/api/admin/submissions/export/?${new URLSearchParams({ view, form, status, q: search }).toString()}`;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="h2 sm">Submissions</h1>
          <p className="muted">Player forms and contact messages from the website. Everyone with a login can see them.</p>
        </div>
        <div className="admin-actions">
          <a href={exportHref} className="btn btn-ghost btn-sm">Download CSV</a>
          {view === 'spam' && canManageUsers(me) && total > 0 && <EmptySpamButton />}
        </div>
      </div>

      <nav className="sub-tabs" aria-label="Folders">
        {Object.entries(VIEWS).map(([k, v]) => (
          <Link key={k} href={href({ view: k, status: '' })} aria-current={k === view ? 'page' : undefined}>
            {v.label}{counts[k] ? <span className="count">{counts[k]}{k === 'spam' ? '' : ' new'}</span> : null}
          </Link>
        ))}
      </nav>

      <form className="log-filters" method="get">
        {view !== 'inbox' && <input type="hidden" name="view" value={view} />}
        <label className="field"><span>Search</span><input className="input" name="q" defaultValue={search} placeholder="Name, email or phone" /></label>
        <label className="field"><span>Form</span>
          <select className="select" name="form" defaultValue={form}>
            <option value="">All forms</option>
            {FORM_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        {view !== 'archived' && view !== 'spam' && (
          <label className="field"><span>Status</span>
            <select className="select" name="status" defaultValue={status}>
              <option value="">Any</option>
              {Object.entries(STATUSES).filter(([k]) => k !== 'archived').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        )}
        <button type="submit" className="btn btn-ghost btn-sm">Filter</button>
        {(form || status || search) && <Link href={href({ form: '', status: '', q: '' })} className="btn btn-ghost btn-sm">Clear</Link>}
      </form>

      {view === 'spam' && (
        <p className="muted" style={{ fontSize: 14 }}>
          Entries the spam filter caught. Senders were shown a normal “thank you”, so nothing tips off bots. If a real
          person landed here, open it and click “Not spam”.
        </p>
      )}

      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      {!loadError && rows.length === 0 && <div className="admin-empty"><p className="muted">Nothing here yet.</p></div>}

      {rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table sub-table">
            <thead>
              <tr><th scope="col">Received</th><th scope="col">From</th><th scope="col">Form</th><th scope="col">Came from</th><th scope="col">{view === 'spam' ? 'Why it’s spam' : 'Status'}</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const src = sourceSummary(r.source);
                return (
                  <tr key={String(r._id)} className={r.status === 'new' && !r.spam ? 'is-new' : ''}>
                    <td className="muted" style={{ whiteSpace: 'nowrap' }}>{fmt(r.createdAt)}</td>
                    <td>
                      <Link href={`/admin/submissions/${r._id}/`} className="admin-name">{r.name || '(no name)'}</Link>
                      <div className="muted" style={{ fontSize: 13 }}>{r.email}{r.phone ? ` · ${r.phone}` : ''}</div>
                    </td>
                    <td><span className={`pill ${r.kind === 'player' ? 'pill-on' : ''}`}>{r.formLabel}</span></td>
                    <td>
                      <div>{src.from}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{[src.place, r.source?.page].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td>
                      {view === 'spam'
                        ? <span className="muted" style={{ fontSize: 13 }}>{(r.spamReasons || []).join('; ')}</span>
                        : <span className={`pill status-${r.status}`}>{STATUSES[r.status]}</span>}
                      {r.handledBy?.name && view !== 'spam' && <div className="muted" style={{ fontSize: 12 }}>by {r.handledBy.name}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="admin-actions" aria-label="Pages">
          {page > 1 && <Link href={href({ page: page - 1 })} className="btn btn-ghost btn-sm">Newer</Link>}
          <span className="muted">Page {page} of {pages} · {total} total</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="btn btn-ghost btn-sm">Older</Link>}
        </nav>
      )}
    </div>
  );
}
