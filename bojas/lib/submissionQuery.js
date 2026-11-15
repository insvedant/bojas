// Shared filters for the submissions list and CSV export.
export const VIEWS = {
  inbox: { label: 'Inbox', q: { spam: false, status: { $ne: 'archived' } } },
  player: { label: 'Player forms', q: { spam: false, kind: 'player', status: { $ne: 'archived' } } },
  contact: { label: 'Contact messages', q: { spam: false, kind: 'contact', status: { $ne: 'archived' } } },
  archived: { label: 'Archived', q: { spam: false, status: 'archived' } },
  spam: { label: 'Spam', q: { spam: true } },
};

export function buildQuery({ view = 'inbox', form = '', status = '', search = '' }) {
  const q = { ...(VIEWS[view] || VIEWS.inbox).q };
  if (form) q.formLabel = form;
  if (status && status !== 'archived' && view !== 'archived') q.status = status;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80), 'i');
    q.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  return q;
}
