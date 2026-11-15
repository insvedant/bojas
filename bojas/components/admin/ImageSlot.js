'use client';

import { useState } from 'react';
import { cropResize, uploadPhoto } from '@/lib/imageClient';

// A photo field: shows where the photo appears, the recommended size, a preview
// in the exact shape used on the site, and upload / replace / remove.
export default function ImageSlot({ label, where, w, h, value, onChange, onBusy }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError('Use a JPG, PNG or WebP image.'); return; }
    setBusy(true); onBusy?.(true); setError(''); setNote('');
    try {
      const { blob, width, height, small } = await cropResize(file, w, h);
      const { id } = await uploadPhoto(blob);
      onChange(id);
      setNote(small
        ? `Uploaded, but your photo is ${width} × ${height} px, smaller than the recommended ${w} × ${h} px. It may look blurry on large screens.`
        : 'Uploaded. Click Save changes to publish it.');
    } catch (err) {
      setError(`Photo not uploaded: ${err.message}.`);
    } finally {
      setBusy(false); onBusy?.(false);
    }
  };

  return (
    <div className="image-slot">
      <div className="image-slot-preview" style={{ aspectRatio: `${w} / ${h}` }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photos/${value}/`} alt={`${label} preview`} />
        ) : (
          <span>No photo yet. The site shows a labelled placeholder.</span>
        )}
      </div>
      <div className="stack" style={{ gap: 10 }}>
        <span className="image-slot-label">{label}</span>
        <dl className="image-slot-meta">
          <div><dt>Appears on</dt><dd>{where}</dd></div>
          <div><dt>Recommended</dt><dd>{w} × {h} px · JPG, PNG or WebP</dd></div>
        </dl>
        <p className="muted" style={{ fontSize: 13 }}>Photos are cropped from the centre to this shape and resized automatically.</p>
        <div className="admin-inline" style={{ flexWrap: 'wrap' }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: busy ? 'wait' : 'pointer' }}>
            {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} disabled={busy} className="sr-only" />
          </label>
          {value && !busy && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onChange(null); setNote('Photo removed. Click Save changes to publish.'); }}>Remove</button>}
        </div>
        {note && <p className="ok-note" role="status">{note}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
