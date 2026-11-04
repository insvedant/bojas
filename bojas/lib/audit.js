import { connectDB } from './db';
import AuditLog from '@/models/AuditLog';

const clip = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > 300 ? `${s.slice(0, 297)}…` : s;
};

export const clientIp = (req) =>
  (req?.headers?.get('x-forwarded-for') || '').split(',')[0].trim() || req?.headers?.get('x-real-ip') || '';

// Compare two plain objects field by field. labels maps key → readable name.
export function diff(before = {}, after = {}, keys, labels = {}, imageKeys = []) {
  const out = [];
  for (const k of keys) {
    const a = before?.[k];
    const b = after?.[k];
    if (JSON.stringify(a ?? null) === JSON.stringify(b ?? null)) continue;
    if (imageKeys.includes(k)) {
      out.push({ field: labels[k] || k, from: a ? 'photo' : 'no photo', to: b ? (a ? 'new photo' : 'photo added') : 'photo removed' });
    } else {
      out.push({ field: labels[k] || k, from: clip(a), to: clip(b) });
    }
  }
  return out;
}

// Never let logging break the action itself.
export async function logActivity({ admin, action, target = '', summary = '', changes = [], req, email }) {
  try {
    await connectDB();
    await AuditLog.create({
      userId: admin?.id || '',
      userName: admin?.name || '',
      userEmail: admin?.email || email || '',
      action, target, summary,
      changes: changes.slice(0, 60),
      ip: clientIp(req),
    });
  } catch (err) {
    console.error('[audit] could not write log:', err.message);
  }
}

export const ACTION_LABELS = {
  'auth.login': 'Signed in',
  'auth.login_failed': 'Failed sign-in',
  'player.create': 'Added player',
  'player.update': 'Edited player',
  'player.delete': 'Deleted player',
  'content.update': 'Edited site content',
  'user.create': 'Created login',
  'user.update': 'Changed login',
  'user.delete': 'Deleted login',
  'account.password': 'Changed own password',
};
