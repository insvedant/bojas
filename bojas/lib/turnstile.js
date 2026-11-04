// Optional Cloudflare Turnstile check (free). Enabled only when both keys are set:
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY
export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export async function verifyTurnstile(token, ip) {
  if (!turnstileEnabled()) return { ok: true, skipped: true };
  if (!token) return { ok: false };
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body, signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return { ok: Boolean(data.success) };
  } catch {
    // If Cloudflare is unreachable, let it through and rely on the other checks.
    return { ok: true, skipped: true };
  }
}
