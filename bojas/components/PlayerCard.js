import Link from 'next/link';
import { initials } from '@/lib/players';

export function PlayerPhoto({ player, eager = false }) {
  return (
    <div className="player-photo">
      {player.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.photo} alt={player.name} loading={eager ? 'eager' : 'lazy'} />
      ) : (
        <span className="initials" aria-hidden="true">{initials(player.name)}</span>
      )}
      {player.status && <span className="status">{player.status}</span>}
      <span className="no" aria-hidden="true">{player.number}</span>
    </div>
  );
}

export default function PlayerCard({ player }) {
  return (
    <Link href={`/players/${player.slug}/`} className="player-card">
      <PlayerPhoto player={player} />
      <div className="player-body">
        <span className="h3">{player.name}</span>
        <span className="muted" style={{ fontSize: 15 }}>
          {[player.position, player.foot && `${player.foot} foot`, player.age && `Age ${player.age}`].filter(Boolean).join(' · ')}
        </span>
        <span className="link-line" style={{ fontSize: 16 }}>View profile</span>
      </div>
    </Link>
  );
}
