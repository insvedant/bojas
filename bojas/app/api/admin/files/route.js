import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Document from '@/models/Document';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { MAX_PDF_BYTES, safeFilename } from '@/lib/files';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Upload a PDF. Returns { id, name, size } to store in a content field.
async function _POST(req) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: `This PDF is ${(file.size / 1048576).toFixed(1)} MB. The limit is 4 MB. Compress it (for example at ilovepdf.com) and try again.` }, { status: 413 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  // Check the file itself, not just the name or the type the browser claims.
  if (buf.length < 8 || buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return NextResponse.json({ error: 'That file is not a valid PDF.' }, { status: 415 });
  }

  await connectDB();
  const name = safeFilename(file.name);
  const doc = await Document.create({ data: buf, contentType: 'application/pdf', filename: name, size: buf.length });
  return NextResponse.json({ id: String(doc._id), name, size: buf.length }, { status: 201 });
}

export const POST = handle(_POST);
