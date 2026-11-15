import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { requireAdminPage, canManageUsers } from '@/lib/adminGuard';
import { connectDB, explainDbError } from '@/lib/db';
import Submission from '@/models/Submission';
import { STATUSES, playerSections, CONTACT_LABELS, sourceSummary } from '@/lib/submissions';
import { logActivity } from '@/lib/audit';
import SubmissionActions from '@/components/admin/SubmissionActions';

export const metadata = { title: 'Submission' };

const fmt = (d) => (d ? new Date(d).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const digits = (p = '') => p.replace(/[^\d]/g, '');

function Rows({ rows }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!shown.length) return <p className="muted">Not filled in.</p>;
  return (
    <dl className="sub-rows">
      {shown.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{/^https?:\/\//.test(String(v)) ? <a href={v} target="_blank" rel="noopener noreferrer nofollow" className="accent">{v}</a> : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SubmissionPage({ params }) {
  const me = await requireAdminPage();
  if (!/^[a-f0-9]{24}$/i.test(params.id)) notFound();
  let sub;
  try {
    await connectDB();
    sub = await Submission.findById(params.id).lean();
  } catch (err) {
    return <p className="form-error" role="alert">{explainDbError(err)}</p>;
  }
  if (!sub) notFound();

  // First time someone opens a new entry: mark it reviewed and log who read it.
  if (sub.status === 'new' && !sub.spam) {
    const handledBy = { name: me.name, email: me.email, at: new Date() };
    await Submission.updateOne({ _id: sub._id, status: 'new' }, { $set: { status: 'reviewed', handledBy } });
    sub.status = 'reviewed';
    sub.handledBy = handledBy;
    await logActivity({ admin: me, action: 'submission.view', target: `${sub.name || sub.email} (${sub.formLabel})`, summary: 'Opened and marked as reviewed', req: { headers: headers() } });
  }

  const d = sub.data || {};
  const s = sub.source || {};
  const src = sourceSummary(s);
  const player = sub.kind === 'player' ? playerSections(d) : null;
  const wa = digits(sub.phone);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <Link href={sub.spam ? '/admin/submissions/?view=spam' : '/admin/submissions/'} className="breadcrumb">Submissions</Link>
          <h1 className="h2 sm">{sub.name || '(no name)'}</h1>
          <p className="muted">{sub.formLabel} · received {fmt(sub.createdAt)}</p>
        </div>
        <div className="admin-actions">
          {sub.email && <a className="btn btn-primary btn-sm" href={`mailto:${sub.email}?subject=${encodeURIComponent('Your BOJAS ' + (sub.kind === 'player' ? 'player application' : 'message'))}`}>Reply by email</a>}
          {sub.phone && <a className="btn btn-ghost btn-sm" href={`tel:${sub.phone.replace(/[^+\d]/g, '')}`}>Call</a>}
          {wa.length >= 8 && <a className="btn btn-ghost btn-sm" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        </div>
      </div>

      {sub.spam && (
        <div className="form-error" role="status">
          <strong>Caught by the spam filter.</strong> {(sub.spamReasons || []).join('; ')}
        </div>
      )}

      <div className="admin-grid">
        <div className="stack" style={{ gap: 24 }}>
          {player ? (
            <>
              <section className="admin-card"><h2 className="h4">Player information</h2><Rows rows={player.info} /></section>
              <section className="admin-card"><h2 className="h4">Contact</h2><Rows rows={player.contact} /></section>
              <section className="admin-card"><h2 className="h4">Playing identity</h2><Rows rows={player.identity} /></section>
              <section className="admin-card">
                <h2 className="h4">Self-ratings</h2>
                <div className="sub-ratings">
                  {player.ratings.map((g) => (
                    <div key={g.title} className="stack" style={{ gap: 10 }}>
                      <span className="tag">{g.title}</span>
                      {g.items.map(([label, v]) => (
                        <div key={label} className="meter">
                          <span className="row-split"><span>{label}</span><span className="badge">{v ?? '—'}</span></span>
                          <div className="track"><div className="fill" style={{ width: `${(v || 0) * 10}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="admin-card">
              <h2 className="h4">Message</h2>
              <Rows rows={CONTACT_LABELS.filter(([, k]) => k !== 'message').map(([l, k]) => [l, d[k]])} />
              <div className="sub-message">{d.message}</div>
            </section>
          )}
        </div>

        <aside className="stack" style={{ gap: 24 }}>
          <SubmissionActions
            id={String(sub._id)}
            status={sub.status}
            spam={sub.spam}
            statuses={STATUSES}
            notes={(sub.notes || []).map((n) => ({ ...n, at: n.at ? new Date(n.at).toISOString() : null }))}
            handledBy={sub.handledBy?.name ? { name: sub.handledBy.name, at: sub.handledBy.at ? new Date(sub.handledBy.at).toISOString() : null } : null}
            canDelete={canManageUsers(me)}
          />
          <section className="admin-card">
            <h2 className="h4">Where it came from</h2>
            <Rows rows={[
              ['Form', sub.formLabel],
              ['Sent from page', s.page],
              ['Came from', src.from],
              ['Referring page', s.referrer],
              ['First page visited', s.landingPage],
              ['Campaign (UTM)', [s.utmSource, s.utmMedium, s.utmCampaign].filter(Boolean).join(' / ')],
              ['Location', src.place],
              ['Time to fill in', s.secondsToComplete != null ? `${Math.floor(s.secondsToComplete / 60)}m ${s.secondsToComplete % 60}s` : ''],
              ['IP address', s.ip],
              ['Device / browser', s.userAgent],
            ]} />
          </section>
        </aside>
      </div>
    </div>
  );
}
