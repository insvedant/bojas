import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'bojas_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be set (at least 32 characters).');
  return new TextEncoder().encode(s);
}

// user: { id, name, email, role, tv }  — id 'owner' is the environment account.
export async function createSession(user) {
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role, tv: user.tv ?? 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  };
}

// Signature + expiry check only (used by middleware). Account status is checked in lib/adminGuard.
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !['owner', 'admin', 'agent'].includes(payload.role)) return null;
    return { id: payload.sub, name: payload.name, email: payload.email, role: payload.role, tv: payload.tv ?? 0 };
  } catch {
    return null;
  }
}
