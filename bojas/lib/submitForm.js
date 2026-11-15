// Browser helper: sends a website form to /api/forms/<kind>.
import { SOURCE_KEY } from '@/components/SourceTracker';

export async function submitForm(kind, formEl, { token, turnstile } = {}) {
  const fields = {};
  for (const [k, v] of new FormData(formEl).entries()) if (typeof v === 'string') fields[k] = v;

  let source = {};
  try { source = JSON.parse(sessionStorage.getItem(SOURCE_KEY) || '{}'); } catch {}
  const meta = { ...source, page: window.location.pathname, token, turnstile };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`/api/forms/${kind}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, meta }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Something went wrong (${res.status}).`);
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The server took too long to respond.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
