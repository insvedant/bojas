import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Submission from '@/models/Submission';
import { requireAdminApi, canManageUsers } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { logActivity } from '@/lib/audit';
import { STATUSES } from '@/lib/submissions';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const notFound = () => NextResponse.json({ error: 'Submission not found' }, { status: 404 });

// Change status, spam flag or add an internal note.
async function _PATCH(req, { params }) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return notFound();
  const body = await req.json().catch(() => ({}));
  await connectDB();
  const sub = await Submission.findById(params.id);
  if (!sub) return notFound();
  const by = { name: admin.name, email: admin.email };
  const changes = [];

  if (body.status && STATUSES[body.status] && body.status !== sub.status) {
    changes.push({ field: 'Status', from: STATUSES[sub.status], to: STATUSES[body.status] });
    sub.status = body.status;
    sub.handledBy = { ...by, at: new Date() };
  }
  if (typeof body.spam === 'boolean' && body.spam !== sub.spam) {
    changes.push({ field: 'Spam', from: sub.spam ? 'spam' : 'not spam', to: body.spam ? 'spam' : 'not spam' });
    sub.spam = body.spam;
    if (!body.spam) sub.spamReasons = [];
    else sub.spamReasons = [...sub.spamReasons, `Marked as spam by ${admin.name}`];
  }
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : '';
  if (note) {
    sub.notes.push({ text: note, by: admin.name, email: admin.email, at: new Date() });
    changes.push({ field: 'Note added', from: '—', to: note.slice(0, 300) });
  }
  if (!changes.length) return NextResponse.json({ ok: true });

  await sub.save();
  await logActivity({
    admin, action: 'submission.update', target: `${sub.name || sub.email} (${sub.formLabel})`,
    summary: changes.map((c) => c.field).join(', '), changes, req,
  });
  return NextResponse.json({ ok: true, status: sub.status, spam: sub.spam, notes: sub.notes, handledBy: sub.handledBy });
}

// Delete one submission (admins only).
async function _DELETE(req, { params }) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (!canManageUsers(admin)) return NextResponse.json({ error: 'Only an admin can delete submissions. Archive it instead.' }, { status: 403 });
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return notFound();
  await connectDB();
  const sub = await Submission.findByIdAndDelete(params.id);
  if (!sub) return notFound();
  await logActivity({ admin, action: 'submission.delete', target: `${sub.name || sub.email} (${sub.formLabel})`, summary: 'Deleted submission', req });
  return NextResponse.json({ ok: true });
}

export const PATCH = handle(_PATCH);
export const DELETE = handle(_DELETE);
