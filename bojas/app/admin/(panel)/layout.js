import Link from 'next/link';
import { requireAdminPage } from '@/lib/adminGuard';
import { LogoMark, Wordmark } from '@/components/Logo';
import LogoutButton from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  const admin = await requireAdminPage();
  return (
    <>
      <header className="admin-bar">
        <div className="wrap admin-bar-inner">
          <Link href="/admin/" className="brand" aria-label="BOJAS admin home">
            <LogoMark size={36} />
            <Wordmark />
          </Link>
          <nav className="admin-nav" aria-label="Admin">
            <Link href="/admin/">Players</Link>
            <Link href="/admin/content/">Site content</Link>
            <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
          </nav>
          <div className="admin-user">
            <span className="muted">{admin.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main" className="wrap admin-main">{children}</main>
    </>
  );
}
