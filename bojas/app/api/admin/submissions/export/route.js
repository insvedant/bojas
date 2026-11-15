import { connectDB } from '@/lib/db';
import Submission from '@/models/Submission';
import { requireAdminApi } from '@/lib/adminGuard';
import { handle } from '@/lib/apiHandler';
import { logActivity } from '@/lib/audit';
import { buildQuery, VIEWS } from '@/lib/submissionQuery';
import { KINDS, STATUSES, sourceSummary } from '@/lib/submissions';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // stop spreadsheet formula injection
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

// CSV download of the current list view (opens in Excel / Google Sheets).
async function _GET(req) {
  const { admin, error } = await requireAdminApi();
  if (error) return error;
  const sp = new URL(req.url).searchParams;
  const view = VIEWS[sp.get('view')] ? sp.get('view') : 'inbox';
  const q = buildQuery({ view, form: sp.get('form') || '', status: sp.get('status') || '', search: sp.get('q') || '' });
  await connectDB();
  const rows = await Submission.find(q).sort({ createdAt: -1 }).limit(5000).lean();

  const kinds = [...new Set(rows.map((r) => r.kind))];
  const dataCols = kinds.flatMap((k) => KINDS[k].fields).filter((f, i, a) => a.indexOf(f) === i);
  const header = ['Received', 'Form', 'Name', 'Email', 'Phone', 'Status', 'Spam', 'Came from', 'Location', 'Landing page', 'Form page', ...dataCols];
  const lines = [header.map(cell).join(',')];
  for (const r of rows) {
    const src = sourceSummary(r.source);
    lines.push([
      new Date(r.createdAt).toISOString(), r.formLabel, r.name, r.email, r.phone, STATUSES[r.status], r.spam ? 'yes' : 'no',
      src.from, src.place, r.source?.landingPage, r.source?.page, ...dataCols.map((c) => r.data?.[c]),
    ].map(cell).join(','));
  }
  await logActivity({ admin, action: 'submission.export', target: VIEWS[view].label, summary: `Downloaded ${rows.length} rows as CSV`, req });
  return new Response('\uFEFF' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bojas-${view}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = handle(_GET);
