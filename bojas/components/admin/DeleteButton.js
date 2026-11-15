'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminFetch';

export default function DeleteButton({ id, name, redirectTo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!window.confirm(`Delete ${name}? This removes the player and their photo from the website. It can't be undone.`)) return;
    setBusy(true);
    const { ok, error } = await adminFetch(`/api/admin/players/${id}/`, { method: 'DELETE' });
    if (!ok) {
      window.alert(`Couldn't delete ${name}. ${error}`);
      setBusy(false);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  };

  return (
    <button type="button" className="btn btn-danger btn-xs" onClick={onDelete} disabled={busy}>
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
