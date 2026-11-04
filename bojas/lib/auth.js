import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'bojas_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be set (at least 32 characters).');
  return new TextEncoder().encode(s);
}

export async function createSession(email) {
  const token = await new SignJWT({ role: 'admin', email })
    .setProtectedHeader({ alg: 'HS256' })
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

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}
