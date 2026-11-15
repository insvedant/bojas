import { PLAYER_FORM_FIELDS, CONTACT_FORM_FIELDS, IDENTITY_QUESTIONS, RATING_GROUPS, ratingName } from './formSchema.mjs';
import { playerForms } from './site';

export const KINDS = {
  player: {
    label: 'Player form',
    fields: PLAYER_FORM_FIELDS,
    required: ['first_name', 'last_name', 'email', 'phone', 'consent'],
    minSeconds: 10,
  },
  contact: {
    label: 'Contact form',
    fields: CONTACT_FORM_FIELDS,
    required: ['full_name', 'email', 'message'],
    minSeconds: 4,
  },
};

export const STATUSES = { new: 'New', reviewed: 'Reviewed', contacted: 'Contacted', archived: 'Archived' };

const LONG = new Set(['message', ...IDENTITY_QUESTIONS.map((q) => q.name)]);
const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Keep only known fields, as trimmed strings of a sensible length.
export function cleanFields(kind, raw = {}) {
  const k = KINDS[kind];
  const out = {};
  for (const f of k.fields) {
    let v = raw[f];
    if (v === undefined || v === null) continue;
    v = String(v).replace(/\r\n/g, '\n').trim().slice(0, LONG.has(f) ? 3000 : 300);
    if (f.startsWith('rating_')) {
      const n = Math.round(Number(v));
      if (!(n >= 1 && n <= 10)) continue;
      v = String(n);
    }
    if (v !== '') out[f] = v;
  }
  if (kind === 'player') {
    const t = playerForms.find((p) => p.title === out.form_type);
    out.form_type = t ? t.title : playerForms[0].title;
  }
  return out;
}

export function validationError(kind, data) {
  for (const f of KINDS[kind].required) if (!data[f]) return 'Please fill in all required fields.';
  if (!EMAIL_RE.test(data.email || '')) return 'Please enter a valid email address.';
  if (data.phone && !/^[+()\d\s.-]{6,25}$/.test(data.phone)) return 'Please enter a valid phone number.';
  if (data.highlights_url && !/^https?:\/\//i.test(data.highlights_url)) return 'The highlights link must start with https://';
  return null;
}

// Content-based spam signals.
export function contentSpamReasons(kind, data) {
  const reasons = [];
  const nameText = kind === 'player' ? `${data.first_name || ''} ${data.last_name || ''}` : data.full_name || '';
  if (URL_RE.test(nameText)) reasons.push('Link in the name field');
  URL_RE.lastIndex = 0;
  const free = Object.entries(data)
    .filter(([k]) => k !== 'highlights_url')
    .map(([, v]) => v)
    .join(' ');
  const links = (free.match(URL_RE) || []).length;
  if (links > 2) reasons.push(`${links} links in the text`);
  if (/\b(viagra|casino|crypto|bitcoin|forex|loan|seo services|backlinks)\b/i.test(free)) reasons.push('Common spam words');
  return reasons;
}

export const submissionName = (kind, d) =>
  kind === 'player' ? `${d.first_name || ''} ${d.last_name || ''}`.trim() : d.full_name || '';

// Grouped, labelled view of a player submission for the admin detail page.
export function playerSections(d) {
  const info = [
    ['First name', d.first_name], ['Last name', d.last_name], ['Nationality', d.nationality], ['Age', d.age],
    ['Height', d.height], ['Weight', d.weight], ['Position', d.position], ['Preferred foot', d.preferred_foot],
    ['Current club', d.current_club], ['EU passport', d.eu_passport],
  ];
  const contact = [['Email', d.email], ['Phone', d.phone], ['Highlights video', d.highlights_url], ['Agreed to terms', d.consent ? 'Yes' : 'No']];
  const identity = IDENTITY_QUESTIONS.map((q) => [q.label, d[q.name]]);
  const ratings = RATING_GROUPS.map((g) => ({ title: g.title, items: g.items.map((label) => [label, Number(d[ratingName(label)]) || null]) }));
  return { info, contact, identity, ratings };
}

export const CONTACT_LABELS = [['Full name', 'full_name'], ['I am a', 'role'], ['Email', 'email'], ['Phone', 'phone'], ['Message', 'message']];

// Readable "where it came from".
export function sourceSummary(s = {}) {
  let from = 'Direct visit';
  if (s.utmSource) from = [s.utmSource, s.utmMedium, s.utmCampaign].filter(Boolean).join(' / ');
  else if (s.referrer) {
    try { from = new URL(s.referrer).hostname.replace(/^www\./, ''); } catch { from = s.referrer; }
  }
  const place = [s.city, s.region, s.country].filter(Boolean).join(', ');
  return { from, place };
}
