import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Photo from '@/models/Photo';
import { requireAdminApi } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 2 * 1024 * 1024; // the editor resizes photos to well under this
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file received' }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: 'Use a JPG, PNG or WebP image' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image is larger than 2 MB' }, { status: 413 });

  await connectDB();
  const photo = await Photo.create({
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
    size: file.size,
  });
  return NextResponse.json({ id: String(photo._id), url: `/api/photos/${photo._id}/` }, { status: 201 });
}
