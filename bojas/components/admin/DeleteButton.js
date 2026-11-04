'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id, name, redirectTo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!window.confirm(`Delete ${name}? This removes the player and their photo from the website. It can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/players/${id}/`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      window.alert(data?.error || `Couldn't delete ${name}. Try again.`);
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
