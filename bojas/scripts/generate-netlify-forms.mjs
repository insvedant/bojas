// Writes public/__forms.html: a hidden static copy of every form so Netlify
// registers the forms and all their fields at deploy time.
// The React forms POST to /__forms.html (see components/PlayerForm.js).
import { writeFileSync, mkdirSync } from 'node:fs';
import { PLAYER_FORM_FIELDS, CONTACT_FORM_FIELDS } from '../lib/formSchema.mjs';

const form = (name, fields) => `
<form name="${name}" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input type="hidden" name="form-name" value="${name}">
  <input name="bot-field">
${fields.map((f) => `  <input name="${f}">`).join('\n')}
</form>`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Forms</title></head>
<body>${form('player-form', PLAYER_FORM_FIELDS)}
${form('contact', CONTACT_FORM_FIELDS)}
</body></html>
`;

mkdirSync('public', { recursive: true });
writeFileSync('public/__forms.html', html);
console.log(`Netlify forms written: player-form (${PLAYER_FORM_FIELDS.length} fields), contact (${CONTACT_FORM_FIELDS.length} fields)`);
