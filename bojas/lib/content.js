import { unstable_cache } from 'next/cache';
import { connectDB } from './db';
import SiteContent from '@/models/SiteContent';
import { getPageDef, pageFields, pageDefaults } from './contentSchema';

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

function merge(id, stored = {}) {
  const out = pageDefaults(id);
  for (const f of pageFields(id)) {
    if (stored[f.key] !== undefined && stored[f.key] !== null) out[f.key] = stored[f.key];
    else if (f.type === 'image' && stored[f.key] === null) out[f.key] = null;
  }
  return out;
}

// Public pages: defaults overlaid with whatever the admin edited.
// If the database is unreachable the site still renders with defaults.
export async function getPageContent(id) {
  let stored = {};
  try {
    stored = (await loadStored())[id] || {};
  } catch (err) {
    console.error('[content] using defaults, could not load content:', err.message);
  }
  return merge(id, stored);
}

// Admin editor: always fresh from the database.
export async function getPageContentFresh(id) {
  await connectDB();
  const doc = await SiteContent.findOne({ page: id }).lean();
  return { values: merge(id, doc?.data || {}), updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null };
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
