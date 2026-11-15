import { createHmac, timingSafeEqual } from 'node:crypto';

// A signed "form opened at" timestamp, put into each form when the page renders.
// Lets the server reject forged or replayed tokens and spot forms filled in by bots in seconds.
const key = () => process.env.AUTH_SECRET || 'dev-only-form-secret-change-me';
const sig = (ts) => createHmac('sha256', key()).update(`form:${ts}`).digest('base64url').slice(0, 32);

export function createFormToken() {
  const ts = Date.now();
  return `${ts}.${sig(ts)}`;
}

// Returns { ok, ageMs } or { ok: false }.
export function readFormToken(token) {
  const [tsStr, s] = String(token || '').split('.');
  const ts = Number(tsStr);
  if (!ts || !s) return { ok: false };
  const expected = Buffer.from(sig(ts));
  const given = Buffer.from(s);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false };
  return { ok: true, ageMs: Date.now() - ts };
}
