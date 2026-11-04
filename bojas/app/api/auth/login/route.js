import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const same = (a, b) => {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
};

export async function POST(req) {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.' }, { status: 500 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const emailOk = same(String(body.email || '').trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const passOk = same(String(body.password || ''), ADMIN_PASSWORD);
  if (!emailOk || !passOk) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(await createSession(ADMIN_EMAIL));
  return res;
}
