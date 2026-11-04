'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COUNTRIES, POSITIONS, FEET } from '@/lib/formSchema.mjs';
import DeleteButton from './DeleteButton';
import ImageSlot from './ImageSlot';
import { PLAYER_PHOTO } from '@/lib/contentSchema';

const EMPTY = {
  name: '', slug: '', number: '', position: '', age: '', nationality: 'Canada', foot: '', height: '', weight: '',
  club: '', status: '', bio: '', highlights: '', strengths: [], ratings: [], photoId: null, photo: '', published: true, order: 0,
};

const STATUS_SUGGESTIONS = ['Represented', 'Open to trials', 'Signed', 'On loan', 'Injured'];
const RATING_SUGGESTIONS = ['Vision', 'Passing', 'Dribbling', 'Finishing', 'Speed', 'Stamina', 'Positioning', 'Aerial duels', 'Decision making'];

export default function PlayerEditor({ player }) {
  const router = useRouter();
  const isNew = !player;
  const [p, setP] = useState(() => ({ ...EMPTY, ...(player || {}), number: player?.number ?? '', age: player?.age ?? '' }));
  const [strengthDraft, setStrengthDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const uploading = uploads > 0;
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setP((s) => ({ ...s, [key]: v }));
  };

  const addStrength = () => {
    const parts = strengthDraft.split(',').map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return;
    setP((s) => ({ ...s, strengths: [...new Set([...s.strengths, ...parts])].slice(0, 12) }));
    setStrengthDraft('');
  };
  const removeStrength = (x) => setP((s) => ({ ...s, strengths: s.strengths.filter((y) => y !== x) }));

  const setRating = (i, key, value) =>
    setP((s) => ({ ...s, ratings: s.ratings.map((r, j) => (j === i ? { ...r, [key]: key === 'value' ? Number(value) : value } : r)) }));
  const addRating = (label = '') => setP((s) => ({ ...s, ratings: [...s.ratings, { label, value: 7 }].slice(0, 20) }));
  const removeRating = (i) => setP((s) => ({ ...s, ratings: s.ratings.filter((_, j) => j !== i) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) { e.currentTarget.reportValidity(); return; }
    setSaving(true);
    setError('');
    const { id, photo, updatedAt, ...body } = p;
    body.ratings = body.ratings.filter((r) => r.label.trim());
    const res = await fetch(isNew ? '/api/admin/players/' : `/api/admin/players/${player.id}/`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setError(data?.error || 'Could not reach the server. Your changes are not saved yet. Try again.');
      setSaving(false);
      return;
    }
    router.push('/admin/');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 28 }} noValidate>
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <Link href="/admin/" className="breadcrumb">Players</Link>
          <h1 className="h2 sm">{isNew ? 'Add player' : `Edit ${player.name}`}</h1>
        </div>
        <div className="admin-actions">
          {!isNew && player.published && (
            <a href={`/players/${player.slug}/`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View on site</a>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading}>
            {saving ? 'Saving…' : isNew ? 'Add player' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="admin-grid">
        <div className="stack" style={{ gap: 24 }}>
          <section className="admin-card">
            <h2 className="h4">Basic details</h2>
            <div className="fields">
              <label className="field"><span>Full name</span><input className="input" value={p.name} onChange={set('name')} required minLength={2} maxLength={80} /></label>
              <label className="field"><span>Shirt number <span className="opt">(optional)</span></span><input className="input" type="number" min="0" max="99" value={p.number} onChange={set('number')} /></label>
              <label className="field"><span>Position</span>
                <input className="input" list="positions" value={p.position} onChange={set('position')} maxLength={60} />
              </label>
              <label className="field"><span>Age</span><input className="input" type="number" min="5" max="60" value={p.age} onChange={set('age')} /></label>
              <label className="field"><span>Nationality</span>
                <input className="input" list="countries" value={p.nationality} onChange={set('nationality')} maxLength={60} />
              </label>
              <label className="field"><span>Preferred foot</span>
                <select className="select" value={p.foot} onChange={set('foot')}>
                  <option value="">Not set</option>
                  {FEET.map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
              <label className="field"><span>Height</span><input className="input" value={p.height} onChange={set('height')} placeholder="e.g. 180 cm" maxLength={20} /></label>
              <label className="field"><span>Weight</span><input className="input" value={p.weight} onChange={set('weight')} placeholder="e.g. 72 kg" maxLength={20} /></label>
              <label className="field"><span>Current club</span><input className="input" value={p.club} onChange={set('club')} maxLength={80} /></label>
              <label className="field"><span>Status label</span>
                <input className="input" list="statuses" value={p.status} onChange={set('status')} placeholder="e.g. Open to trials" maxLength={40} />
              </label>
            </div>
            <datalist id="positions">{POSITIONS.map((x) => <option key={x} value={x} />)}</datalist>
            <datalist id="countries">{COUNTRIES.map((x) => <option key={x} value={x} />)}</datalist>
            <datalist id="statuses">{STATUS_SUGGESTIONS.map((x) => <option key={x} value={x} />)}</datalist>
          </section>

          <section className="admin-card">
            <h2 className="h4">Profile</h2>
            <label className="field"><span>Bio</span>
              <textarea className="textarea" rows={5} value={p.bio} onChange={set('bio')} maxLength={2000} placeholder="Playing style, strengths, what the player is working on." />
            </label>
            <label className="field"><span>Highlights video link <span className="opt">(optional)</span></span>
              <input className="input" type="url" value={p.highlights} onChange={set('highlights')} placeholder="https://youtube.com/…" maxLength={300} />
            </label>
            <div className="field">
              <span>Strengths</span>
              <div className="admin-inline">
                <input
                  className="input"
                  value={strengthDraft}
                  onChange={(e) => setStrengthDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStrength(); } }}
                  placeholder="Type a strength and press Enter"
                  aria-label="New strength"
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addStrength}>Add</button>
              </div>
              {p.strengths.length > 0 && (
                <ul className="chips">
                  {p.strengths.map((s) => (
                    <li key={s} className="chip-x">
                      {s}
                      <button type="button" onClick={() => removeStrength(s)} aria-label={`Remove ${s}`}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="admin-card">
            <div className="row-split" style={{ flexWrap: 'wrap', gap: 12 }}>
              <h2 className="h4">Scouting ratings (1–10)</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRating()}>Add rating</button>
            </div>
            {p.ratings.length === 0 && (
              <div className="stack" style={{ gap: 10 }}>
                <p className="muted" style={{ fontSize: 15 }}>No ratings yet. They show as bars on the player's page. Quick add:</p>
                <div className="admin-inline" style={{ flexWrap: 'wrap' }}>
                  {RATING_SUGGESTIONS.map((r) => (
                    <button key={r} type="button" className="btn btn-ghost btn-xs" onClick={() => addRating(r)}>{r}</button>
                  ))}
                </div>
              </div>
            )}
            {p.ratings.map((r, i) => (
              <div key={i} className="admin-rating">
                <input className="input" value={r.label} onChange={(e) => setRating(i, 'label', e.target.value)} placeholder="Skill" aria-label={`Rating ${i + 1} skill`} maxLength={40} />
                <input type="range" min="1" max="10" value={r.value} onChange={(e) => setRating(i, 'value', e.target.value)} aria-label={`${r.label || 'Rating'} score`} />
                <output className="badge">{r.value}</output>
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => removeRating(i)} aria-label={`Remove ${r.label || 'rating'}`}>Remove</button>
              </div>
            ))}
          </section>
        </div>

        <aside className="stack" style={{ gap: 24 }}>
          <section className="admin-card">
            <h2 className="h4">Photo</h2>
            <ImageSlot
              label="Player photo"
              where={PLAYER_PHOTO.where}
              w={PLAYER_PHOTO.w}
              h={PLAYER_PHOTO.h}
              value={p.photoId}
              onChange={(id) => setP((s) => ({ ...s, photoId: id, photo: id ? `/api/photos/${id}/` : '' }))}
              onBusy={(b) => setUploads((n) => n + (b ? 1 : -1))}
            />
          </section>

          <section className="admin-card">
            <h2 className="h4">Publishing</h2>
            <label className="check">
              <input type="checkbox" checked={p.published} onChange={set('published')} />
              <span>Show on the website</span>
            </label>
            <label className="field"><span>Display order</span>
              <input className="input" type="number" min="0" max="9999" value={p.order} onChange={set('order')} />
              <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>Lower numbers appear first.</span>
            </label>
            <label className="field"><span>Page address <span className="opt">(optional)</span></span>
              <input className="input" value={p.slug} onChange={set('slug')} placeholder="made from the name" maxLength={80} />
              <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>/players/{p.slug || 'player-name'}/</span>
            </label>
          </section>

          {!isNew && (
            <section className="admin-card">
              <h2 className="h4">Delete player</h2>
              <p className="muted" style={{ fontSize: 14 }}>Removes the profile and photo from the website.</p>
              <DeleteButton id={player.id} name={player.name} redirectTo="/admin/" />
            </section>
          )}
        </aside>
      </div>

      <div className="form-actions">
        <Link href="/admin/" className="btn btn-ghost">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : isNew ? 'Add player' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
