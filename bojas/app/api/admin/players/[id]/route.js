import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Player from '@/models/Player';
import Photo from '@/models/Photo';
import { requireAdminApi } from '@/lib/adminGuard';
import { playerInput, formatZodError } from '@/lib/playerSchema';
import { getPlayerById, serializePlayer, uniqueSlug } from '@/lib/players';

export const dynamic = 'force-dynamic';

const validId = (id) => /^[a-f0-9]{24}$/i.test(id);
const notFound = () => NextResponse.json({ error: 'Player not found' }, { status: 404 });

export async function GET(_req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const player = await getPlayerById(params.id);
  return player ? NextResponse.json({ player }) : notFound();
}

export async function PUT(req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!validId(params.id)) return notFound();
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }
  const parsed = playerInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

  await connectDB();
  const existing = await Player.findById(params.id);
  if (!existing) return notFound();

  const data = parsed.data;
  data.slug = await uniqueSlug(data.slug || data.name, existing._id);
  const oldPhoto = existing.photoId ? String(existing.photoId) : null;

  existing.set(data);
  await existing.save();

  // Remove a replaced or cleared photo.
  if (oldPhoto && oldPhoto !== (data.photoId || null)) await Photo.deleteOne({ _id: oldPhoto });

  revalidatePath('/', 'layout');
  return NextResponse.json({ player: serializePlayer(existing) });
}

export async function DELETE(_req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!validId(params.id)) return notFound();
  await connectDB();
  const player = await Player.findByIdAndDelete(params.id);
  if (!player) return notFound();
  if (player.photoId) await Photo.deleteOne({ _id: player.photoId });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
