'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminFetch';

export default function EmptySpamButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (!window.confirm('Delete everything in the spam folder? This can’t be undone.')) return;
    setBusy(true);
    const { ok, error } = await adminFetch('/api/admin/submissions/?spam=1', { method: 'DELETE' });
    setBusy(false);
    if (!ok) return window.alert(error);
    router.refresh();
  };
  return <button type="button" className="btn btn-danger btn-sm" onClick={onClick} disabled={busy}>{busy ? 'Deleting…' : 'Empty spam'}</button>;
}
