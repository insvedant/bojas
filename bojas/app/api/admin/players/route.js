import { handle } from '@/lib/apiHandler';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Player from '@/models/Player';
import { requireAdminApi } from '@/lib/adminGuard';
import { playerInput, formatZodError } from '@/lib/playerSchema';
import { getAllPlayers, serializePlayer, uniqueSlug } from '@/lib/players';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function _GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json({ players: await getAllPlayers() });
}

async function _POST(req) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }
  const parsed = playerInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

  await connectDB();
  const data = parsed.data;
  data.slug = await uniqueSlug(data.slug || data.name);
  const by = { name: admin.name, email: admin.email };
  const player = await Player.create({ ...data, createdBy: by, updatedBy: by });
  await logActivity({ admin, action: 'player.create', target: player.name, summary: `Added ${player.name}${player.published ? '' : ' (draft)'}`, req });
  revalidatePath('/', 'layout');
  return NextResponse.json({ player: serializePlayer(player) }, { status: 201 });
}

export const GET = handle(_GET);
export const POST = handle(_POST);
