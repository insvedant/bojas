import { handle } from '@/lib/apiHandler';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import SiteContent from '@/models/SiteContent';
import Photo from '@/models/Photo';
import { requireAdminApi } from '@/lib/adminGuard';
import { CONTENT_TAG, cleanPageInput, getPageContentFresh, imageIdsOf } from '@/lib/content';
import { getPageDef, pageFields } from '@/lib/contentSchema';
import { logActivity, diff } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function _GET(_req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!getPageDef(params.page)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  return NextResponse.json(await getPageContentFresh(params.page));
}

async function _PUT(req, { params }) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  const id = params.page;
  if (!getPageDef(id)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }

  const cleaned = cleanPageInput(id, await req.json().catch(() => ({})));
  if (cleaned.error) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  await connectDB();
  const beforeValues = (await getPageContentFresh(id)).values;
  const before = await SiteContent.findOne({ page: id }).lean();
  const merged = { ...(before?.data || {}), ...cleaned.data };
  await SiteContent.updateOne(
    { page: id },
    { $set: { data: merged, updatedBy: { name: admin.name, email: admin.email } } },
    { upsert: true }
  );

  // Delete photos that were replaced or removed on this page.
  const keep = new Set(imageIdsOf(id, merged));
  const orphaned = imageIdsOf(id, before?.data).filter((x) => !keep.has(x));
  if (orphaned.length) await Photo.deleteMany({ _id: { $in: orphaned } });

  revalidateTag(CONTENT_TAG);
  revalidatePath('/', 'layout');
  const fresh = await getPageContentFresh(id);

  const fields = pageFields(id);
  const labels = Object.fromEntries(fields.map((f) => [f.key, f.label]));
  const images = fields.filter((f) => f.type === 'image').map((f) => f.key);
  const changes = diff(beforeValues, fresh.values, Object.keys(cleaned.data), labels, images);
  if (changes.length) {
    const page = getPageDef(id);
    await logActivity({ admin, action: 'content.update', target: page.label, summary: `Changed ${changes.map((c) => c.field).join(', ')}`.slice(0, 400), changes, req });
  }
  return NextResponse.json(fresh);
}

export const GET = handle(_GET);
export const PUT = handle(_PUT);
