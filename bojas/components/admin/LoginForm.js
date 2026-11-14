'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminFetch';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const { ok, error: err } = await adminFetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    });
    if (ok) {
      router.replace('/admin/');
      router.refresh();
      return;
    }
    setError(err);
    setBusy(false);
  };

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 18, width: '100%' }}>
      <label className="field"><span>Email</span><input className="input" type="email" name="email" required autoComplete="username" /></label>
      <div className="field">
  <label htmlFor="login-password">Password</label>
  <span className="password-wrap">
    <input id="login-password" className="input" type={show ? 'text' : 'password'} name="password" required autoComplete="current-password" />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShow((s) => !s)}
      aria-label={show ? 'Hide password' : 'Show password'}
      aria-pressed={show}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </span>
</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
