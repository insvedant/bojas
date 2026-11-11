import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './auth';
import { connectDB } from './db';
import AdminUser from '@/models/AdminUser';

// Roles: owner (environment login) and admin can manage users and see the activity log.
// agent can edit players and site content.
export const canManageUsers = (u) => u?.role === 'owner' || u?.role === 'admin';

// Every admin page and API route checks the session here, in addition to middleware.js.
// Database accounts are re-checked so deactivated users or reset passwords lock out immediately.
export async function getAdmin() {
  const session = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) return null;
  if (session.id === 'owner') {
    return process.env.ADMIN_EMAIL && session.email === process.env.ADMIN_EMAIL.trim().toLowerCase() ? session : null;
  }
  if (!/^[a-f0-9]{24}$/i.test(session.id)) return null;
  await connectDB();
  const user = await AdminUser.findById(session.id).select('name email role active tokenVersion').lean();
  if (!user || !user.active || (user.tokenVersion ?? 0) !== session.tv) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, tv: user.tokenVersion ?? 0 };
}

export async function requireAdminPage({ manageUsers = false } = {}) {
  let admin = null;
  try { admin = await getAdmin(); } catch { admin = null; }
  if (!admin) redirect('/admin/login/');
  if (manageUsers && !canManageUsers(admin)) redirect('/admin/');
  return admin;
}

export async function requireAdminApi({ manageUsers = false } = {}) {
  const admin = await getAdmin();
  if (!admin) return { error: NextResponse.json({ error: 'Your session has expired. Refresh the page and sign in again.' }, { status: 401 }) };
  if (manageUsers && !canManageUsers(admin)) {
    return { error: NextResponse.json({ error: 'Only an admin can do this.' }, { status: 403 }) };
  }
  return { admin };
}
