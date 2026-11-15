import { notFound } from 'next/navigation';
import PlayerEditor from '@/components/admin/PlayerEditor';
import { getPlayerById } from '@/lib/players';

export const metadata = { title: 'Edit player' };

export default async function EditPlayerPage({ params }) {
  const player = await getPlayerById(params.id);
  if (!player) notFound();
  return <PlayerEditor player={player} />;
}
