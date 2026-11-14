import { connectDB } from '@/lib/db';
import Document from '@/models/Document';

export const dynamic = 'force-dynamic';

// Public: serves an uploaded PDF (only reachable through a link shown on the website).
// Each upload gets a new id, so it can be cached for a long time.
export async function GET(_req, { params }) {
  if (!/^[a-f0-9]{24}$/i.test(params.id)) return new Response('Not found', { status: 404 });
  try {
    await connectDB();
    const doc = await Document.findById(params.id).lean();
    if (!doc) return new Response('Not found', { status: 404 });
    const raw = doc.data;
    const body = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer);
    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${String(doc.filename || 'document.pdf').replace(/"/g, '')}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[files] could not load document:', err.message);
    return new Response('Unavailable', { status: 503 });
  }
}
