import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import AuditLog from '@/models/AuditLog';
import { verifyPassword, sameText } from '@/lib/passwords';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_FAILS = 8; // per email per 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const fail = (msg = 'Email or password is incorrect.', status = 401) => NextResponse.json({ error: msg }, { status });

export async function POST(req) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return fail('AUTH_SECRET is missing or shorter than 32 characters. Add it in your hosting environment variables and redeploy.', 500);
  }
  let body;
  try { body = await req.json(); } catch { return fail('Invalid request', 400); }
  const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
  const password = String(body.password || '').slice(0, 200);
  if (!email || !password) return fail('Enter your email and password.', 400);

  // Database is optional for the Owner login, required for agent logins.
  let dbOk = true;
  try { await connectDB(); } catch { dbOk = false; }

  if (dbOk) {
    const recentFails = await AuditLog.countDocuments({
      action: 'auth.login_failed', userEmail: email, at: { $gte: new Date(Date.now() - WINDOW_MS) },
    }).catch(() => 0);
    if (recentFails >= MAX_FAILS) return fail('Too many failed attempts for this email. Wait 15 minutes and try again.', 429);
  }

  let user = null;
  const ownerEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (ownerEmail && process.env.ADMIN_PASSWORD && sameText(email, ownerEmail)) {
    if (sameText(password, process.env.ADMIN_PASSWORD)) user = { id: 'owner', name: 'Owner', email: ownerEmail, role: 'owner', tv: 0 };
  } else if (dbOk) {
    const doc = await AdminUser.findOne({ email });
    if (doc?.active && (await verifyPassword(password, doc.passwordHash))) {
      user = { id: String(doc._id), name: doc.name, email: doc.email, role: doc.role, tv: doc.tokenVersion ?? 0 };
      doc.lastLoginAt = new Date();
      await doc.save();
    }
  } else {
    return fail('The database is not reachable, so agent logins are unavailable. The Owner login still works.', 503);
  }

  if (!user) {
    if (dbOk) await logActivity({ action: 'auth.login_failed', email, summary: 'Wrong email or password', req });
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return fail();
  }

  if (dbOk) await logActivity({ admin: user, action: 'auth.login', summary: 'Signed in', req });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(await createSession(user));
  return res;
}
