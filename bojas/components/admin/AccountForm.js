'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

export default function AccountForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('newPassword') !== fd.get('confirm')) { setMsg({ kind: 'error', text: 'The new passwords don’t match.' }); return; }
    setBusy(true);
    const { ok, error } = await adminFetch('/api/admin/account/', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword') }),
    });
    setBusy(false);
    if (!ok) { setMsg({ kind: 'error', text: error }); return; }
    form.reset();
    setMsg({ kind: 'ok', text: 'Password changed. Other devices have been signed out.' });
  };

  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <h2 className="h4">Change password</h2>
      <label className="field"><span>Current password</span><input className="input" type="password" name="currentPassword" required autoComplete="current-password" /></label>
      <label className="field"><span>New password</span><input className="input" type="password" name="newPassword" required minLength={10} autoComplete="new-password" /><span className="hint">At least 10 characters.</span></label>
      <label className="field"><span>Repeat new password</span><input className="input" type="password" name="confirm" required minLength={10} autoComplete="new-password" /></label>
      {msg.text && <p className={msg.kind === 'error' ? 'form-error' : 'ok-note'} role={msg.kind === 'error' ? 'alert' : 'status'}>{msg.text}</p>}
      <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
    </form>
  );
}
