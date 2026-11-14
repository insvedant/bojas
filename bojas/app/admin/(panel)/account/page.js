import { requireAdminPage } from '@/lib/adminGuard';
import AccountForm from '@/components/admin/AccountForm';

export const metadata = { title: 'My account' };

export default async function AccountPage() {
  const me = await requireAdminPage();
  return (
    <div className="stack" style={{ gap: 28, maxWidth: 640 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="h2 sm">My account</h1>
        <p className="muted">{me.name} · {me.email}</p>
      </div>
      {me.id === 'owner' ? (
        <div className="admin-card">
          <h2 className="h4">Owner login</h2>
          <p className="muted">This login comes from ADMIN_EMAIL and ADMIN_PASSWORD in your hosting environment variables. To change the password, update ADMIN_PASSWORD there and redeploy.</p>
        </div>
      ) : (
        <AccountForm />
      )}
    </div>
  );
}
