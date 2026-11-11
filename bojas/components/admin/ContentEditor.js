'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPageDef } from '@/lib/contentSchema';
import ImageSlot from './ImageSlot';
import FileSlot from './FileSlot';
import { adminFetch } from '@/lib/adminFetch';

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

function RowTools({ i, n, onMove, onRemove, label }) {
  return (
    <div className="row-tools">
      <button type="button" className="icon-btn" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={`Move ${label} up`}>↑</button>
      <button type="button" className="icon-btn" onClick={() => onMove(i, 1)} disabled={i === n - 1} aria-label={`Move ${label} down`}>↓</button>
      <button type="button" className="icon-btn" onClick={onRemove} aria-label={`Remove ${label}`}>×</button>
    </div>
  );
}

function Field({ f, value, onChange, onBusy, idPrefix = '' }) {
  const id = `${idPrefix}${f.key}`;
  if (f.type === 'image') {
    return <ImageSlot label={f.label} where={f.where} w={f.w} h={f.h} value={value} onChange={onChange} onBusy={onBusy} />;
  }
  if (f.type === 'pdf') {
    return <FileSlot label={f.label} where={f.where} maxMB={f.maxMB} value={value} onChange={onChange} onBusy={onBusy} />;
  }
  if (f.type === 'textarea') {
    const rows = Math.min(14, Math.max(3, Math.ceil(String(value || '').length / 90) + String(value || '').split('\n').length));
    return (
      <label className="field" htmlFor={id}>
        <span>{f.label}</span>
        <textarea id={id} className="textarea" rows={rows} value={value || ''} maxLength={f.max} onChange={(e) => onChange(e.target.value)} />
        <span className="hint">{f.help ? `${f.help} ` : ''}Leave an empty line between paragraphs.</span>
      </label>
    );
  }
  if (f.type === 'list') {
    const items = value || [];
    return (
      <fieldset className="fieldset stack" style={{ gap: 8 }}>
        <legend className="legend">{f.label}</legend>
        {f.help && <span className="hint">{f.help}</span>}
        {items.map((v, i) => (
          <div key={i} className="admin-inline">
            <input className="input" value={v} maxLength={200} aria-label={`${f.label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <RowTools i={i} n={items.length} label={`item ${i + 1}`} onMove={(a, d) => onChange(move(items, a, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
        ))}
        {items.length < (f.maxItems ?? 20) && (
          <button type="button" className="btn btn-ghost btn-xs" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...items, ''])}>Add item</button>
        )}
      </fieldset>
    );
  }
  if (f.type === 'cards') {
    const items = value || [];
    const blank = Object.fromEntries(f.fields.map((sf) => [sf.key, '']));
    return (
      <fieldset className="fieldset stack" style={{ gap: 12 }}>
        <legend className="legend">{f.label}</legend>
        {items.map((item, i) => (
          <div key={i} className="card-editor">
            <div className="row-split">
              <span className="tag">{i + 1}</span>
              <RowTools i={i} n={items.length} label={`card ${i + 1}`} onMove={(a, d) => onChange(move(items, a, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
            <div className="fields" style={{ gap: 14 }}>
              {f.fields.map((sf) => (
                <div key={sf.key} style={sf.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
                  <Field f={sf} idPrefix={`${f.key}-${i}-`} value={item[sf.key]} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [sf.key]: v } : x)))} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length < (f.maxItems ?? 12) && (
          <button type="button" className="btn btn-ghost btn-xs" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...items, { ...blank }])}>Add</button>
        )}
      </fieldset>
    );
  }
  return (
    <label className="field" htmlFor={id}>
      <span>{f.label}</span>
      <input
        id={id}
        className="input"
        type={f.type === 'url' ? 'url' : f.inputType || 'text'}
        value={value || ''}
        maxLength={f.type === 'url' ? 600 : f.max}
        placeholder={f.type === 'url' ? 'https://…' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {f.help && <span className="hint">{f.help}</span>}
    </label>
  );
}

export default function ContentEditor({ pageId, initial, updatedAt: initialUpdated, updatedBy: initialBy }) {
  const page = getPageDef(pageId);
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState(initialUpdated);
  const [updatedBy, setUpdatedBy] = useState(initialBy);
  const [busyUploads, setBusyUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ kind: '', text: '' });
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));
  const onBusy = (b) => setBusyUploads((n) => n + (b ? 1 : -1));

  const save = async () => {
    setSaving(true);
    setStatus({ kind: '', text: '' });
    const { ok, data, error } = await adminFetch(`/api/admin/content/${pageId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (!ok) {
      setStatus({ kind: 'error', text: error });
      return;
    }
    setValues(data.values);
    setSaved(data.values);
    setUpdatedAt(data.updatedAt);
    setUpdatedBy(data.updatedBy?.name || '');
    setStatus({ kind: 'ok', text: 'Saved. The website is updated.' });
  };

  const disabled = saving || busyUploads > 0 || !dirty;

  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <Link href="/admin/content/" className="breadcrumb">Site content</Link>
          <h1 className="h2 sm">{page.label}</h1>
          <p className="muted" style={{ fontSize: 15 }}>
            {page.path ? <>Page: <a href={page.path} target="_blank" rel="noopener noreferrer" className="accent">{page.path}</a></> : 'Used across the whole website'}
            {updatedAt && <> · Last saved {new Date(updatedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}{updatedBy && ` by ${updatedBy}`}</>}
          </p>
          {page.intro && <p className="muted" style={{ fontSize: 15 }}>{page.intro}</p>}
        </div>
        <div className="admin-actions">
          {page.path && <a href={page.path} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View page</a>}
          <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={disabled}>
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      {status.text && <p className={status.kind === 'error' ? 'form-error' : 'ok-note'} role={status.kind === 'error' ? 'alert' : 'status'}>{status.text}</p>}

      {page.sections.map((s) => (
        <section key={s.title} className="admin-card">
          <div className="stack" style={{ gap: 4 }}>
            <h2 className="h4">{s.title}</h2>
            {s.note && <p className="muted" style={{ fontSize: 14 }}>{s.note}</p>}
          </div>
          <div className="content-fields">
            {s.fields.map((f) => (
              <div key={f.key} className={`cf cf-${f.type}`}>
                <Field f={f} value={values[f.key]} onChange={set(f.key)} onBusy={onBusy} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="form-actions save-bar">
        <span className="muted" style={{ fontSize: 14 }}>{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
        <button type="button" className="btn btn-primary" onClick={save} disabled={disabled}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
