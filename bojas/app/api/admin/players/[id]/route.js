import { handle } from '@/lib/apiHandler';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Player from '@/models/Player';
import Photo from '@/models/Photo';
import { requireAdminApi } from '@/lib/adminGuard';
import { playerInput, formatZodError } from '@/lib/playerSchema';
import { getPlayerById, serializePlayer, uniqueSlug } from '@/lib/players';
import { logActivity, diff } from '@/lib/audit';

const PLAYER_FIELDS = {
  name: 'Name', slug: 'Page address', number: 'Shirt number', position: 'Position', age: 'Age', nationality: 'Nationality',
  foot: 'Preferred foot', height: 'Height', weight: 'Weight', club: 'Club', status: 'Status label', bio: 'Bio',
  highlights: 'Highlights link', strengths: 'Strengths', ratings: 'Ratings', photoId: 'Photo', published: 'Show on website', order: 'Display order',
};


export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const validId = (id) => /^[a-f0-9]{24}$/i.test(id);
const notFound = () => NextResponse.json({ error: 'Player not found' }, { status: 404 });

async function _GET(_req, { params }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const player = await getPlayerById(params.id);
  return player ? NextResponse.json({ player }) : notFound();
}

async function _PUT(req, { params }) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (!validId(params.id)) return notFound();
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }
  const raw = await req.json().catch(() => ({}));
  await connectDB();
  const existing = await Player.findById(params.id);
  if (!existing) return notFound();

  // Only fields that were sent are changed; the rest keep their saved values.
  const current = serializePlayer(existing);
  const input = { ...current, ...raw };
  const parsed = playerInput.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

  const data = parsed.data;
  data.slug = await uniqueSlug(data.slug || data.name, existing._id);
  const oldPhoto = existing.photoId ? String(existing.photoId) : null;
  const before = serializePlayer(existing);

  existing.set({ ...data, updatedBy: { name: admin.name, email: admin.email } });
  await existing.save();
  const after = serializePlayer(existing);
  const changes = diff(before, after, Object.keys(PLAYER_FIELDS), PLAYER_FIELDS, ['photoId']);
  if (changes.length) {
    await logActivity({ admin, action: 'player.update', target: after.name, summary: `Changed ${changes.map((c) => c.field).join(', ')}`, changes, req });
  }

  // Remove a replaced or cleared photo.
  if (oldPhoto && oldPhoto !== (data.photoId || null)) await Photo.deleteOne({ _id: oldPhoto });

  revalidatePath('/', 'layout');
  return NextResponse.json({ player: serializePlayer(existing) });
}

async function _DELETE(req, { params }) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (!validId(params.id)) return notFound();
  await connectDB();
  const player = await Player.findByIdAndDelete(params.id);
  if (!player) return notFound();
  if (player.photoId) await Photo.deleteOne({ _id: player.photoId });
  await logActivity({ admin, action: 'player.delete', target: player.name, summary: `Deleted ${player.name}`, req });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

export const GET = handle(_GET);
export const PUT = handle(_PUT);
export const DELETE = handle(_DELETE);
