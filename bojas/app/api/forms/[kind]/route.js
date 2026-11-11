import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Submission from '@/models/Submission';
import { readFormToken } from '@/lib/formToken';
import { verifyTurnstile } from '@/lib/turnstile';
import { clientIp } from '@/lib/audit';
import { KINDS, cleanFields, validationError, contentSpamReasons, submissionName } from '@/lib/submissions';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5; // submissions per IP per 10 minutes
const DUP_WINDOW_MS = 2 * 60 * 1000;

const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const str = (v, n = 500) => (typeof v === 'string' ? v.slice(0, n) : '');

function geo(req) {
  const h = req.headers;
  const dec = (v) => { try { return v ? decodeURIComponent(v) : ''; } catch { return v || ''; } };
  let country = h.get('x-vercel-ip-country') || '';
  let region = h.get('x-vercel-ip-country-region') || '';
  let city = dec(h.get('x-vercel-ip-city'));
  const nf = h.get('x-nf-geo'); // Netlify
  if (!country && nf) {
    try {
      const g = JSON.parse(Buffer.from(nf, 'base64').toString('utf8'));
      country = g.country?.code || ''; region = g.subdivision?.name || ''; city = g.city || '';
    } catch {}
  }
  return { country, region, city };
}

export async function POST(req, { params }) {
  const kind = params.kind;
  const def = KINDS[kind];
  if (!def) return bad('Unknown form', 404);
  if (Number(req.headers.get('content-length') || 0) > 100_000) return bad('Form is too large', 413);

  let body;
  try { body = await req.json(); } catch { return bad('Invalid form data'); }
  const raw = body?.fields && typeof body.fields === 'object' ? body.fields : {};
  const meta = body?.meta && typeof body.meta === 'object' ? body.meta : {};
  const ip = clientIp(req);

  const data = cleanFields(kind, raw);
  const invalid = validationError(kind, data);
  if (invalid) return bad(invalid);

  try {
    await connectDB();
  } catch (err) {
    console.error('[forms] database unavailable:', err.message);
    return bad('We could not send your form right now. Please try again in a few minutes.', 503);
  }

  // Flood protection: too many submissions from one connection.
  if (ip) {
    const recent = await Submission.countDocuments({ 'source.ip': ip, createdAt: { $gte: new Date(Date.now() - RATE_WINDOW_MS) } });
    if (recent >= RATE_MAX) return bad('Too many forms sent from your connection. Please wait 10 minutes and try again.', 429);
  }

  // Human check (only when Turnstile keys are configured).
  const human = await verifyTurnstile(str(meta.turnstile, 3000), ip);
  if (!human.ok) return bad('Please complete the security check and press send again.');

  // Bot signals: these are stored as spam (so nothing real is lost) but the sender sees success.
  const reasons = [];
  if (str(raw['bot-field'])) reasons.push('Hidden trap field was filled in');
  const token = readFormToken(meta.token);
  let seconds = null;
  if (!token.ok) reasons.push('Form was not opened on this website');
  else {
    seconds = Math.round(token.ageMs / 1000);
    if (seconds < def.minSeconds) reasons.push(`Sent ${seconds}s after opening the form`);
  }
  reasons.push(...contentSpamReasons(kind, data));

  // Double-click / resend protection.
  const dup = await Submission.exists({ kind, email: data.email.toLowerCase(), createdAt: { $gte: new Date(Date.now() - DUP_WINDOW_MS) } });
  if (dup) return NextResponse.json({ ok: true });

  await Submission.create({
    kind,
    formLabel: kind === 'player' ? data.form_type : def.label,
    name: submissionName(kind, data).slice(0, 160),
    email: data.email,
    phone: data.phone || '',
    data,
    source: {
      page: str(meta.page, 300),
      landingPage: str(meta.landingPage, 300),
      referrer: str(meta.referrer, 500),
      utmSource: str(meta.utmSource, 100),
      utmMedium: str(meta.utmMedium, 100),
      utmCampaign: str(meta.utmCampaign, 150),
      ...geo(req),
      ip,
      userAgent: str(req.headers.get('user-agent'), 300),
      secondsToComplete: seconds,
    },
    spam: reasons.length > 0,
    spamReasons: reasons,
  });

  return NextResponse.json({ ok: true });
}
