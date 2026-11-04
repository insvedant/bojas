import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import SiteContent from '@/models/SiteContent';
import Photo from '@/models/Photo';
import { requireAdminApi } from '@/lib/adminGuard';
import { CONTENT_TAG, cleanPageInput, getPageContentFresh, imageIdsOf } from '@/lib/content';
import { getPageDef } from '@/lib/contentSchema';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!getPageDef(params.page)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  return NextResponse.json(await getPageContentFresh(params.page));
}

export async function PUT(req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const id = params.page;
  if (!getPageDef(id)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }

  const cleaned = cleanPageInput(id, await req.json().catch(() => ({})));
  if (cleaned.error) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  await connectDB();
  const before = await SiteContent.findOne({ page: id }).lean();
  const merged = { ...(before?.data || {}), ...cleaned.data };
  await SiteContent.updateOne({ page: id }, { $set: { data: merged } }, { upsert: true });

  // Delete photos that were replaced or removed on this page.
  const keep = new Set(imageIdsOf(id, merged));
  const orphaned = imageIdsOf(id, before?.data).filter((x) => !keep.has(x));
  if (orphaned.length) await Photo.deleteMany({ _id: { $in: orphaned } });

  revalidateTag(CONTENT_TAG);
  revalidatePath('/', 'layout');
  return NextResponse.json(await getPageContentFresh(id));
}
