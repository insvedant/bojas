import Link from 'next/link';
import { requireAdminPage, canManageUsers } from '@/lib/adminGuard';
import { LogoMark, Wordmark } from '@/components/Logo';
import LogoutButton from '@/components/admin/LogoutButton';
import { connectDB } from '@/lib/db';
import Submission from '@/models/Submission';

export const dynamic = 'force-dynamic';

const ROLE = { owner: 'Owner', admin: 'Admin', agent: 'Agent' };

export default async function PanelLayout({ children }) {
  const admin = await requireAdminPage();
  const manager = canManageUsers(admin);
  let unread = 0;
  try {
    await connectDB();
    unread = await Submission.countDocuments({ spam: false, status: 'new' });
  } catch {}
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
            <Link href="/admin/submissions/">Submissions{unread > 0 && <span className="nav-badge">{unread}</span>}</Link>
            <Link href="/admin/content/">Site content</Link>
            {manager && <Link href="/admin/activity/">Activity log</Link>}
            {manager && <Link href="/admin/users/">Logins</Link>}
            <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
          </nav>
          <div className="admin-user">
            <Link href="/admin/account/" className="admin-me">
              <span>{admin.name}</span>
              <span className="muted">{admin.role === 'owner' ? `Owner · ${admin.email}` : ROLE[admin.role]}</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main" className="wrap admin-main">{children}</main>
    </>
  );
}
