import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { createSession } from '@/lib/auth';
import { hashPassword, verifyPassword, passwordProblem } from '@/lib/passwords';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Change your own password.
async function _PUT(req) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (admin.id === 'owner') {
    return NextResponse.json({ error: 'The Owner password is ADMIN_PASSWORD in your hosting environment variables. Change it there and redeploy.' }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const pwErr = passwordProblem(body.newPassword);
  if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

  await connectDB();
  const user = await AdminUser.findById(admin.id);
  if (!user || !(await verifyPassword(String(body.currentPassword || ''), user.passwordHash))) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400 });
  }
  user.passwordHash = await hashPassword(body.newPassword);
  user.tokenVersion += 1; // signs out other devices
  await user.save();
  await logActivity({ admin, action: 'account.password', target: `${user.name} (${user.email})`, summary: 'Changed own password', req });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(await createSession({ id: String(user._id), name: user.name, email: user.email, role: user.role, tv: user.tokenVersion }));
  return res;
}

export const PUT = handle(_PUT);
