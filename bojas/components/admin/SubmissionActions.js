'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminFetch';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function SubmissionActions({ id, status: s0, spam: sp0, statuses, notes: n0, handledBy: h0, canDelete }) {
  const router = useRouter();
  const [status, setStatus] = useState(s0);
  const [spam, setSpam] = useState(sp0);
  const [notes, setNotes] = useState(n0);
  const [handledBy, setHandledBy] = useState(h0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const patch = async (body) => {
    setBusy(true); setError('');
    const { ok, data, error: err } = await adminFetch(`/api/admin/submissions/${id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    setBusy(false);
    if (!ok) { setError(err); return false; }
    if (data.status) setStatus(data.status);
    if (typeof data.spam === 'boolean') setSpam(data.spam);
    if (data.notes) setNotes(data.notes);
    if (data.handledBy?.name) setHandledBy({ name: data.handledBy.name, at: data.handledBy.at });
    router.refresh();
    return true;
  };

  const remove = async () => {
    if (!window.confirm('Delete this submission permanently?')) return;
    setBusy(true);
    const { ok, error: err } = await adminFetch(`/api/admin/submissions/${id}/`, { method: 'DELETE' });
    setBusy(false);
    if (!ok) return setError(err);
    router.push('/admin/submissions/');
    router.refresh();
  };

  return (
    <>
      <section className="admin-card">
        <h2 className="h4">Status</h2>
        <div className="status-buttons" role="group" aria-label="Status">
          {Object.entries(statuses).map(([k, label]) => (
            <button key={k} type="button" className={`btn btn-xs ${status === k ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={status === k} disabled={busy} onClick={() => patch({ status: k })}>
              {label}
            </button>
          ))}
        </div>
        {handledBy?.name && <p className="muted" style={{ fontSize: 13 }}>Last updated by {handledBy.name}{handledBy.at ? `, ${fmt(handledBy.at)}` : ''}</p>}
        <div className="admin-inline" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => patch({ spam: !spam })}>{spam ? 'Not spam' : 'Mark as spam'}</button>
          {canDelete && <button type="button" className="btn btn-danger btn-xs" disabled={busy} onClick={remove}>Delete</button>}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <section className="admin-card">
        <h2 className="h4">Internal notes</h2>
        <p className="muted" style={{ fontSize: 13 }}>Only visible in the admin panel.</p>
        {notes.length > 0 && (
          <ul className="sub-notes">
            {notes.map((n, i) => (
              <li key={i}><p>{n.text}</p><span className="muted">{n.by} · {fmt(n.at)}</span></li>
            ))}
          </ul>
        )}
        <form onSubmit={async (e) => { e.preventDefault(); if (note.trim() && (await patch({ note }))) setNote(''); }} className="stack" style={{ gap: 10 }}>
          <textarea className="textarea" rows={3} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Called the player, trial booked for Saturday" aria-label="New note" />
          <button type="submit" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} disabled={busy || !note.trim()}>Add note</button>
        </form>
      </section>
    </>
  );
}
