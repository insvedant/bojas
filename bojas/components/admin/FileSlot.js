'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';
import { MAX_PDF_BYTES, formatBytes } from '@/lib/files';

// An optional PDF field. value is null or { id, name, size }.
export default function FileSlot({ label, where, value, onChange, onBusy, maxMB = 4 }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setNote('');
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { setError('Choose a PDF file.'); return; }
    if (file.size > MAX_PDF_BYTES) {
      setError(`This PDF is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${maxMB} MB. Compress it (for example at ilovepdf.com) and try again.`);
      return;
    }
    setBusy(true); onBusy?.(true);
    const fd = new FormData();
    fd.append('file', file);
    const { ok, data, error: err } = await adminFetch('/api/admin/files/', { method: 'POST', body: fd });
    setBusy(false); onBusy?.(false);
    if (!ok) { setError(err); return; }
    onChange({ id: data.id, name: data.name, size: data.size });
    setNote('Uploaded. Click Save changes to publish it.');
  };

  return (
    <div className="file-slot">
      <div className="stack" style={{ gap: 4 }}>
        <span className="image-slot-label">{label} <span className="opt">(optional)</span></span>
        <dl className="image-slot-meta">
          <div><dt>Appears on</dt><dd>{where}</dd></div>
          <div><dt>Format</dt><dd>PDF, up to {maxMB} MB</dd></div>
        </dl>
      </div>

      {value?.id ? (
        <div className="file-current">
          <span className="file-icon" aria-hidden="true">PDF</span>
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <span className="file-name">{value.name}</span>
            <span className="muted" style={{ fontSize: 13 }}>{formatBytes(value.size)} · <a href={`/api/files/${value.id}/`} target="_blank" rel="noopener noreferrer" className="accent">Open to check</a></span>
          </div>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 14 }}>No PDF uploaded. Nothing is shown on the website.</p>
      )}

      <div className="admin-inline" style={{ flexWrap: 'wrap' }}>
        <label className="btn btn-ghost btn-sm" style={{ cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Uploading…' : value?.id ? 'Replace PDF' : 'Upload PDF'}
          <input type="file" accept="application/pdf,.pdf" onChange={onFile} disabled={busy} className="sr-only" />
        </label>
        {value?.id && !busy && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onChange(null); setNote('PDF removed. Click Save changes to remove it from the website.'); }}>Remove</button>
        )}
      </div>
      {note && <p className="ok-note" role="status">{note}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
