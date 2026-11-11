import { unstable_cache } from 'next/cache';
import { connectDB } from './db';
import SiteContent from '@/models/SiteContent';
import { getPageDef, pageFields, pageDefaults, LEGACY_SOURCES, RETIRED_DEFAULTS } from './contentSchema';

export const CONTENT_TAG = 'site-content';

export const photoUrl = (id) => (id ? `/api/photos/${id}/` : '');

// All stored page content in one query, cached until an admin saves (revalidateTag).
const loadStored = unstable_cache(
  async () => {
    await connectDB();
    const docs = await SiteContent.find({}).lean();
    return Object.fromEntries(docs.map((d) => [d.page, d.data || {}]));
  },
  ['site-content-v1'],
  { tags: [CONTENT_TAG], revalidate: 300 }
);

const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// Defaults, then legacy values (moved fields), then what the admin saved on this page.
export function merge(id, all = {}) {
  const stored = all[id] || {};
  const legacy = LEGACY_SOURCES[id] || {};
  const retired = RETIRED_DEFAULTS[id] || {};
  const out = pageDefaults(id);
  for (const f of pageFields(id)) {
    let v = stored[f.key];
    if (v === undefined && legacy[f.key]) {
      const [page, key] = legacy[f.key];
      v = all[page]?.[key];
    }
    if (v === undefined) continue;
    if (retired[f.key]?.some((old) => same(old, v))) continue; // outdated default text
    if (v === null && f.type !== 'image') continue;
    out[f.key] = v;
  }
  return out;
}

// Public pages: defaults overlaid with whatever the admin edited.
// If the database is unreachable the site still renders with defaults.
export async function getPageContent(id) {
  let stored = {};
  try {
    stored = await loadStored();
  } catch (err) {
    console.error('[content] using defaults, could not load content:', err.message);
  }
  return merge(id, stored);
}

// Admin editor: always fresh from the database.
export async function getPageContentFresh(id) {
  await connectDB();
  const docs = await SiteContent.find({}).lean();
  const all = Object.fromEntries(docs.map((d) => [d.page, d.data || {}]));
  const doc = docs.find((d) => d.page === id);
  return {
    values: merge(id, all),
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    updatedBy: doc?.updatedBy || null,
  };
}

export async function getAllUpdatedAt() {
  await connectDB();
  const docs = await SiteContent.find({}, { page: 1, updatedAt: 1 }).lean();
  return Object.fromEntries(docs.map((d) => [d.page, d.updatedAt ? new Date(d.updatedAt).toISOString() : null]));
}

// ---------- validation for saves ----------
const isId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
const str = (v, max) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '');

function cleanField(f, v) {
  switch (f.type) {
    case 'text':
      return { value: str(v, f.max ?? 200) };
    case 'textarea':
      return { value: str(v, f.max ?? 6000) };
    case 'url': {
      const s = str(v, 600);
      if (s && !/^https?:\/\//i.test(s)) return { error: `${f.label}: must be a full link starting with https://` };
      if (s && f.prefix && !s.startsWith(f.prefix)) return { error: `${f.label}: must start with ${f.prefix}` };
      return { value: s };
    }
    case 'list':
      return { value: (Array.isArray(v) ? v : []).map((x) => str(x, 200)).filter(Boolean).slice(0, f.maxItems ?? 20) };
    case 'image':
      return { value: isId(v) ? v : null };
    case 'pdf': {
      // Stored as { id, name, size } so the admin can show the file name without another lookup.
      if (!v || typeof v !== 'object' || !isId(v.id)) return { value: null };
      const size = Math.max(0, Math.min(Number(v.size) || 0, 50_000_000));
      return { value: { id: v.id, name: str(v.name, 120) || 'document.pdf', size } };
    }
    case 'cards': {
      const items = (Array.isArray(v) ? v : []).slice(0, f.maxItems ?? 12).map((item) => {
        const o = {};
        for (const sf of f.fields) {
          const r = cleanField(sf, item?.[sf.key]);
          o[sf.key] = r.value ?? '';
        }
        return o;
      });
      return { value: items.filter((o) => Object.values(o).some((x) => x !== '' && x !== null)) };
    }
    default:
      return { value: undefined };
  }
}

export function cleanPageInput(id, input) {
  if (!getPageDef(id)) return { error: 'Unknown page' };
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid content' };
  const data = {};
  for (const f of pageFields(id)) {
    if (!Object.prototype.hasOwnProperty.call(input, f.key)) continue; // only change fields that were sent
    const r = cleanField(f, input[f.key]);
    if (r.error) return { error: r.error };
    if (r.value !== undefined) data[f.key] = r.value;
  }
  return { data };
}

export const imageIdsOf = (id, data) =>
  pageFields(id).filter((f) => f.type === 'image').map((f) => data?.[f.key]).filter(isId);

export const pdfIdsOf = (id, data) =>
  pageFields(id).filter((f) => f.type === 'pdf').map((f) => data?.[f.key]?.id).filter(isId);
