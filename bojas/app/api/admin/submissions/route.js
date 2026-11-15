import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Submission from '@/models/Submission';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// DELETE ?spam=1 — empty the spam folder (admins only).
async function _DELETE(req) {
  const { admin, error } = await requireAdminApi({ manageUsers: true });
  if (error) return error;
  if (new URL(req.url).searchParams.get('spam') !== '1') return NextResponse.json({ error: 'Nothing to delete' }, { status: 400 });
  await connectDB();
  const { deletedCount } = await Submission.deleteMany({ spam: true });
  await logActivity({ admin, action: 'submission.delete', target: 'Spam folder', summary: `Emptied spam (${deletedCount} deleted)`, req });
  return NextResponse.json({ ok: true, deleted: deletedCount });
}

export const DELETE = handle(_DELETE);
