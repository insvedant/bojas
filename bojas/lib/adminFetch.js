// Browser helper for admin requests: times out instead of spinning forever and
// always returns a readable error message.
const TIMEOUT_MS = 25000;

export async function adminFetch(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, status: res.status, data };
    let error = data.error;
    if (!error && res.status === 401) error = 'Your session has expired. Refresh the page and sign in again.';
    if (!error && (res.status === 504 || res.status === 502)) error = 'The server took too long to respond. Open /api/admin/health/ to check the database connection.';
    if (!error) error = `Server error (${res.status}). Open /api/admin/health/ to check the setup.`;
    return { ok: false, status: res.status, data, error };
  } catch (err) {
    const error = err.name === 'AbortError'
      ? 'No response after 25 seconds, so nothing was saved. The database is probably unreachable: open /api/admin/health/ to see why.'
      : 'Could not reach the server. Check your internet connection and try again.';
    return { ok: false, status: 0, data: {}, error };
  } finally {
    clearTimeout(timer);
  }
}
