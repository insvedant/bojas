import { getPageContent } from './content';
import { TEAM_SIZE } from './contentSchema';

// Team section for the About page. Members with an empty name are left out.
export async function getTeam() {
  const t = await getPageContent('team');
  const members = Array.from({ length: TEAM_SIZE }, (_, i) => i + 1)
    .map((n) => ({ n, name: t[`member${n}Name`], role: t[`member${n}Role`], email: t[`member${n}Email`], photo: t[`member${n}Photo`], bio: t[`member${n}Bio`] }))
    .filter((m) => m.name);
  return { eyebrow: t.eyebrow, title: t.title, lead: t.lead, members };
}
