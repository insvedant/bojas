import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { hashPassword, passwordProblem } from '@/lib/passwords';
import { logActivity } from '@/lib/audit';
import { serializeUser } from '@/lib/users';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const notFound = () => NextResponse.json({ error: 'Login not found' }, { status: 404 });

async function _PUT(req, { params }) {
  const { admin, error } = await requireAdminApi({ manageUsers: true });
  if (error) return error;
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return notFound();
  const body = await req.json().catch(() => ({}));
  await connectDB();
  const user = await AdminUser.findById(params.id);
  if (!user) return notFound();
  const isSelf = admin.id === String(user._id);
  const notes = [];

  if (typeof body.name === 'string' && body.name.trim().length >= 2 && body.name.trim() !== user.name) {
    notes.push({ field: 'Name', from: user.name, to: body.name.trim().slice(0, 80) });
    user.name = body.name.trim().slice(0, 80);
  }
  if ((body.role === 'admin' || body.role === 'agent') && body.role !== user.role) {
    if (isSelf) return NextResponse.json({ error: 'You can’t change your own role.' }, { status: 400 });
    notes.push({ field: 'Role', from: user.role, to: body.role });
    user.role = body.role;
    user.tokenVersion += 1;
  }
  if (typeof body.active === 'boolean' && body.active !== user.active) {
    if (isSelf) return NextResponse.json({ error: 'You can’t deactivate your own login.' }, { status: 400 });
    notes.push({ field: 'Status', from: user.active ? 'active' : 'deactivated', to: body.active ? 'active' : 'deactivated' });
    user.active = body.active;
    user.tokenVersion += 1; // signs them out everywhere
  }
  if (body.password) {
    const pwErr = passwordProblem(body.password);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });
    user.passwordHash = await hashPassword(body.password);
    user.tokenVersion += 1;
    notes.push({ field: 'Password', from: '—', to: 'reset' });
  }
  if (!notes.length) return NextResponse.json({ user: serializeUser(user) });

  await user.save();
  await logActivity({ admin, action: 'user.update', target: `${user.name} (${user.email})`, summary: notes.map((n) => n.field).join(', ') + ' changed', changes: notes, req });
  return NextResponse.json({ user: serializeUser(user) });
}

async function _DELETE(req, { params }) {
  const { admin, error } = await requireAdminApi({ manageUsers: true });
  if (error) return error;
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return notFound();
  if (admin.id === params.id) return NextResponse.json({ error: 'You can’t delete your own login.' }, { status: 400 });
  await connectDB();
  const user = await AdminUser.findByIdAndDelete(params.id);
  if (!user) return notFound();
  await logActivity({ admin, action: 'user.delete', target: `${user.name} (${user.email})`, summary: 'Login deleted', req });
  return NextResponse.json({ ok: true });
}

export const PUT = handle(_PUT);
export const DELETE = handle(_DELETE);
