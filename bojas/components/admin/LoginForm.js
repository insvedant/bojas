'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace('/admin/');
      router.refresh();
      return;
    }
    const data = await res?.json().catch(() => ({}));
    setError(data?.error || 'Could not reach the server. Check your connection and try again.');
    setBusy(false);
  };

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 18, width: '100%' }}>
      <label className="field"><span>Email</span><input className="input" type="email" name="email" required autoComplete="username" /></label>
      <label className="field"><span>Password</span><input className="input" type="password" name="password" required autoComplete="current-password" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
