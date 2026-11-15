'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');

export default function UsersManager({ initial, max, meId }) {
  const [users, setUsers] = useState(initial);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ kind: '', text: '' });

  const say = (kind, text) => setMsg({ kind, text });
  const replace = (u) => setUsers((list) => list.map((x) => (x.id === u.id ? u : x)));

  const create = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) { e.currentTarget.reportValidity(); return; }
    setBusy('create');
    const { ok, data, error } = await adminFetch('/api/admin/users/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setBusy('');
    if (!ok) return say('error', error);
    setUsers((list) => [...list, data.user]);
    setForm({ name: '', email: '', password: '', role: 'agent' });
    say('ok', `Login created for ${data.user.name}. Send them their email and password privately; they can change the password under their name in the top bar.`);
  };

  const update = async (u, patch, done) => {
    setBusy(u.id);
    const { ok, data, error } = await adminFetch(`/api/admin/users/${u.id}/`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    });
    setBusy('');
    if (!ok) return say('error', error);
    replace(data.user);
    say('ok', done);
  };

  const resetPassword = (u) => {
    const pw = window.prompt(`New password for ${u.name} (at least 10 characters). They will be signed out everywhere.`);
    if (pw) update(u, { password: pw }, `Password reset for ${u.name}. Send them the new password privately.`);
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete the login for ${u.name}? Their past activity stays in the log.`)) return;
    setBusy(u.id);
    const { ok, error } = await adminFetch(`/api/admin/users/${u.id}/`, { method: 'DELETE' });
    setBusy('');
    if (!ok) return say('error', error);
    setUsers((list) => list.filter((x) => x.id !== u.id));
    say('ok', `Deleted the login for ${u.name}.`);
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {msg.text && <p className={msg.kind === 'error' ? 'form-error' : 'ok-note'} role={msg.kind === 'error' ? 'alert' : 'status'}>{msg.text}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Last sign-in</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="muted">No logins yet. Add the first one below.</td></tr>
            )}
            {users.map((u) => {
              const self = u.id === meId;
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong>{self && <span className="muted"> (you)</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="select select-sm" value={u.role} disabled={self || busy === u.id} aria-label={`Role for ${u.name}`}
                      onChange={(e) => update(u, { role: e.target.value }, `${u.name} is now ${e.target.value === 'admin' ? 'an admin' : 'an agent'}.`)}>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span className={`pill ${u.active ? 'pill-on' : ''}`}>{u.active ? 'Active' : 'Deactivated'}</span></td>
                  <td className="muted">{fmt(u.lastLoginAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="btn btn-ghost btn-xs" disabled={busy === u.id} onClick={() => resetPassword(u)}>Reset password</button>
                      {!self && (
                        <button type="button" className="btn btn-ghost btn-xs" disabled={busy === u.id}
                          onClick={() => update(u, { active: !u.active }, `${u.name} ${u.active ? 'can no longer sign in' : 'can sign in again'}.`)}>
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {!self && <button type="button" className="btn btn-danger btn-xs" disabled={busy === u.id} onClick={() => remove(u)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length < max ? (
        <form className="admin-card" onSubmit={create}>
          <div className="stack" style={{ gap: 4 }}>
            <h2 className="h4">Add a login</h2>
            <p className="muted" style={{ fontSize: 14 }}>{users.length} of {max} logins used.</p>
          </div>
          <div className="fields">
            <label className="field"><span>Full name</span><input className="input" required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="field"><span>Email (used to sign in)</span><input className="input" type="email" required maxLength={120} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="field"><span>Temporary password</span><input className="input" type="text" required minLength={10} maxLength={200} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><span className="hint">At least 10 characters. They can change it after signing in.</span></label>
            <label className="field"><span>Role</span>
              <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="agent">Agent (players and site content)</option>
                <option value="admin">Admin (also logins and activity log)</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={busy === 'create'}>{busy === 'create' ? 'Creating…' : 'Create login'}</button>
        </form>
      ) : (
        <p className="muted">All {max} logins are in use. Delete one to add someone new.</p>
      )}
    </div>
  );
}
