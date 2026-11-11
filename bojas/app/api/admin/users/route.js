import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { hashPassword, passwordProblem } from '@/lib/passwords';
import { logActivity } from '@/lib/audit';
import { MAX_ACCOUNTS, serializeUser } from '@/lib/users';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function _GET() {
  const { error } = await requireAdminApi({ manageUsers: true });
  if (error) return error;
  await connectDB();
  const users = await AdminUser.find({}).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ users: users.map(serializeUser), max: MAX_ACCOUNTS });
}

async function _POST(req) {
  const { admin, error } = await requireAdminApi({ manageUsers: true });
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 80);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
  const role = body.role === 'admin' ? 'admin' : 'agent';
  if (name.length < 2) return NextResponse.json({ error: 'Enter the person’s name.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (email === (process.env.ADMIN_EMAIL || '').trim().toLowerCase()) {
    return NextResponse.json({ error: 'That email is the Owner login. Use a different email.' }, { status: 400 });
  }
  const pwErr = passwordProblem(body.password);
  if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

  await connectDB();
  if ((await AdminUser.countDocuments({})) >= MAX_ACCOUNTS) {
    return NextResponse.json({ error: `You already have ${MAX_ACCOUNTS} logins. Delete one before adding another.` }, { status: 400 });
  }
  if (await AdminUser.exists({ email })) return NextResponse.json({ error: 'A login with this email already exists.' }, { status: 400 });

  const user = await AdminUser.create({ name, email, role, passwordHash: await hashPassword(body.password) });
  await logActivity({ admin, action: 'user.create', target: `${name} (${email})`, summary: `Created ${role} login`, req });
  return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
}

export const GET = handle(_GET);
export const POST = handle(_POST);
