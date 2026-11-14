import { explainDbError } from '@/lib/db';
import Link from 'next/link';
import { CONTENT_PAGES, allUploadSlots, pageFields, PLAYER_PHOTO } from '@/lib/contentSchema';
import { getAllUpdatedAt, getPageContentFresh } from '@/lib/content';

export const metadata = { title: 'Site content' };

const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not edited yet');

export default async function ContentIndex() {
  let updated = {};
  let filled = {};
  let loadError = '';
  try {
    updated = await getAllUpdatedAt();
    const pagesWithImages = [...new Set(allUploadSlots().map((s) => s.page.id))];
    const vals = await Promise.all(pagesWithImages.map((id) => getPageContentFresh(id)));
    pagesWithImages.forEach((id, i) => { filled[id] = vals[i].values; });
  } catch (err) {
    loadError = explainDbError(err);
  }
  const groups = [...new Set(CONTENT_PAGES.map((p) => p.group))];

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="h2 sm">Site content</h1>
        <p className="muted">Edit every headline, text, contact detail, licence and photo on the website. Pick a page to start.</p>
      </div>
      {loadError && <p className="form-error" role="alert">Couldn't reach the database: {loadError}</p>}

      {groups.map((group) => (
        <section key={group} className="stack" style={{ gap: 14 }}>
          <h2 className="h4">{group}</h2>
          <div className="content-grid">
            {CONTENT_PAGES.filter((p) => p.group === group).map((p) => {
              const fields = pageFields(p.id);
              const photos = fields.filter((f) => f.type === 'image').length;
              return (
                <Link key={p.id} href={`/admin/content/${p.id}/`} className="content-tile">
                  <span className="h3">{p.label}</span>
                  <span className="muted" style={{ fontSize: 14 }}>{p.path ? `Page: ${p.path}` : 'Every page'}</span>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {fields.length} fields{photos ? ` · ${photos} photo${photos > 1 ? 's' : ''}` : ''} · {fmt(updated[p.id])}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="stack" style={{ gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h2 className="h4">All photos and documents on the website</h2>
          <p className="muted" style={{ fontSize: 14 }}>Where each photo or PDF appears and what to upload. Click Edit to change it.</p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ minWidth: 760 }}>
            <thead>
              <tr><th scope="col">Upload</th><th scope="col">Appears on</th><th scope="col">Recommended</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Edit</span></th></tr>
            </thead>
            <tbody>
              {allUploadSlots().map(({ page, field }) => {
                const has = Boolean(filled[page.id]?.[field.key]);
                return (
                  <tr key={`${page.id}-${field.key}`}>
                    <td><strong>{page.group === 'Agents' ? `${page.label}: ` : ''}{field.label}</strong></td>
                    <td className="muted">{field.where}</td>
                    <td>{field.type === 'pdf' ? `PDF, up to ${field.maxMB || 4} MB` : `${field.w} × ${field.h} px`}</td>
                    <td><span className={`pill ${has ? 'pill-on' : ''}`}>{has ? 'Uploaded' : field.type === 'pdf' ? 'None (hidden)' : 'Placeholder'}</span></td>
                    <td><Link href={`/admin/content/${page.id}/`} className="btn btn-ghost btn-xs">Edit</Link></td>
                  </tr>
                );
              })}
              <tr>
                <td><strong>Player photos</strong></td>
                <td className="muted">{PLAYER_PHOTO.where}</td>
                <td>{PLAYER_PHOTO.w} × {PLAYER_PHOTO.h} px</td>
                <td><span className="pill">Per player</span></td>
                <td><Link href="/admin/" className="btn btn-ghost btn-xs">Players</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
