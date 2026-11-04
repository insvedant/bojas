import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './auth';

// Every admin page and admin API route checks the session itself,
// in addition to middleware.js, so one missed matcher can't expose data.
export async function getAdmin() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login/');
  return admin;
}

export async function requireAdminApi() {
  const admin = await getAdmin();
  if (!admin) return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  return { admin };
}
