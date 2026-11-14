import { explainDbError } from '@/lib/db';
import Link from 'next/link';
import { getAllPlayers, initials } from '@/lib/players';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata = { title: 'Players' };

const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

export default async function AdminPlayersPage() {
  let players = [];
  let loadError = '';
  try {
    players = await getAllPlayers();
  } catch (err) {
    loadError = explainDbError(err);
  }

  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="h2 sm">Players</h1>
          <p className="muted">{players.length} {players.length === 1 ? 'player' : 'players'}. Drafts are hidden from the website.</p>
        </div>
        <Link href="/admin/players/new/" className="btn btn-primary">Add player</Link>
      </div>

      {loadError && (
        <p className="form-error" role="alert">
          Couldn't load players. {loadError}
        </p>
      )}

      {!loadError && players.length === 0 && (
        <div className="admin-empty">
          <p className="h3">No players yet</p>
          <p className="muted">Add your first player, or run <code>npm run seed</code> to load the two demo players.</p>
          <Link href="/admin/players/new/" className="btn btn-primary" style={{ alignSelf: 'center' }}>Add player</Link>
        </div>
      )}

      {players.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Player</th>
                <th scope="col">Position</th>
                <th scope="col">Age</th>
                <th scope="col">Status</th>
                <th scope="col">Visibility</th>
                <th scope="col">Last updated</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-player">
                      {p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" className="admin-thumb" />
                      ) : (
                        <span className="admin-thumb" aria-hidden="true">{initials(p.name)}</span>
                      )}
                      <div className="stack">
                        <Link href={`/admin/players/${p.id}/`} className="admin-name">{p.name}</Link>
                        <span className="muted" style={{ fontSize: 13 }}>#{p.number ?? '—'} · /players/{p.slug}/</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.position || '—'}</td>
                  <td>{p.age ?? '—'}</td>
                  <td>{p.status || '—'}</td>
                  <td><span className={`pill ${p.published ? 'pill-on' : ''}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                  <td className="muted">{fmt(p.updatedAt)}{p.updatedBy && <><br /><span style={{ fontSize: 13 }}>by {p.updatedBy}</span></>}</td>
                  <td>
                    <div className="admin-actions">
                      <Link href={`/admin/players/${p.id}/`} className="btn btn-ghost btn-xs">Edit</Link>
                      {p.published && <a href={`/players/${p.slug}/`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs">View</a>}
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
