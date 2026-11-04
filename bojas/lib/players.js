import { connectDB } from './db';
import Player from '@/models/Player';

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const slugify = (s = '') =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Plain JSON shape used by pages and the admin editor.
export function serializePlayer(doc) {
  if (!doc) return null;
  const p = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    number: p.number ?? null,
    position: p.position || '',
    age: p.age ?? null,
    nationality: p.nationality || '',
    foot: p.foot || '',
    height: p.height || '',
    weight: p.weight || '',
    club: p.club || '',
    status: p.status || '',
    bio: p.bio || '',
    highlights: p.highlights || '',
    strengths: p.strengths || [],
    ratings: (p.ratings || []).map((r) => ({ label: r.label, value: r.value })),
    photoId: p.photoId ? String(p.photoId) : null,
    photo: p.photoId ? `/api/photos/${p.photoId}/` : '',
    published: p.published !== false,
    order: p.order ?? 0,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
    updatedBy: p.updatedBy?.name || '',
  };
}

const SORT = { order: 1, createdAt: 1 };

// Public site: published players only. Returns [] if the database is unreachable
// so the rest of the site still renders.
export async function getPublishedPlayers(limit = 0) {
  try {
    await connectDB();
    const q = Player.find({ published: true }).sort(SORT).lean();
    if (limit) q.limit(limit);
    return (await q).map(serializePlayer);
  } catch (err) {
    console.error('[players] could not load players:', err.message);
    return [];
  }
}

export async function getPublishedPlayer(slug) {
  try {
    await connectDB();
    return serializePlayer(await Player.findOne({ slug, published: true }).lean());
  } catch (err) {
    console.error('[players] could not load player:', err.message);
    return null;
  }
}

// Admin: everything, including drafts.
export async function getAllPlayers() {
  await connectDB();
  return (await Player.find({}).sort(SORT).lean()).map(serializePlayer);
}

export async function getPlayerById(id) {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  return serializePlayer(await Player.findById(id).lean());
}

export async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || 'player';
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await Player.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select('_id').lean();
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}
