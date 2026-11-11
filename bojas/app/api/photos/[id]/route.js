import { connectDB } from '@/lib/db';
import Photo from '@/models/Photo';

export const dynamic = 'force-dynamic';

// Public: serves a player photo. Each upload gets a new id, so it can be cached forever.
export async function GET(_req, { params }) {
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return new Response('Not found', { status: 404 });
  await connectDB();
  const photo = await Photo.findById(params.id).lean();
  if (!photo || !String(photo.contentType).startsWith('image/')) return new Response('Not found', { status: 404 });
  const raw = photo.data;
  const body = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer);
  return new Response(body, {
    headers: {
      'Content-Type': photo.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
