import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Player from '@/models/Player';
import { requireAdminApi } from '@/lib/adminGuard';
import { playerInput, formatZodError } from '@/lib/playerSchema';
import { getAllPlayers, serializePlayer, uniqueSlug } from '@/lib/players';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json({ players: await getAllPlayers() });
}

export async function POST(req) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }
  const parsed = playerInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

  await connectDB();
  const data = parsed.data;
  data.slug = await uniqueSlug(data.slug || data.name);
  const player = await Player.create(data);
  revalidatePath('/', 'layout');
  return NextResponse.json({ player: serializePlayer(player) }, { status: 201 });
}
