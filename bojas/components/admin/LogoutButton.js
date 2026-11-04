'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/auth/logout/', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login/');
    router.refresh();
  };
  return <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>;
}
