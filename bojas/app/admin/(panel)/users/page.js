import { requireAdminPage } from '@/lib/adminGuard';
import { connectDB, explainDbError } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { MAX_ACCOUNTS, serializeUser } from '@/lib/users';
import UsersManager from '@/components/admin/UsersManager';

export const metadata = { title: 'Logins' };

export default async function UsersPage() {
  const me = await requireAdminPage({ manageUsers: true });
  let users = [];
  let loadError = '';
  try {
    await connectDB();
    users = (await AdminUser.find({}).sort({ createdAt: 1 }).lean()).map(serializeUser);
  } catch (err) {
    loadError = explainDbError(err);
  }
  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="h2 sm">Logins</h1>
        <p className="muted">
          Up to {MAX_ACCOUNTS} agent and admin logins. Agents can edit players and site content.
          Admins can also manage logins and see the activity log. The Owner login (set in the hosting
          environment variables) always works and isn’t counted here.
        </p>
      </div>
      {loadError ? <p className="form-error" role="alert">{loadError}</p> : <UsersManager initial={users} max={MAX_ACCOUNTS} meId={me.id} />}
    </div>
  );
}
