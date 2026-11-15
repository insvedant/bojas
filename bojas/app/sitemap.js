import { site } from '@/lib/site';
import { GUIDES } from '@/lib/guides';
import { getPublishedPlayers } from '@/lib/players';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const players = await getPublishedPlayers();
  const paths = [
    '/', '/about/', '/services/', '/coaching/', '/players/', '/contact/',
    '/player-form/',
    ...GUIDES.map((a) => `/${a.slug}/`),
    ...players.map((p) => `/players/${p.slug}/`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date() }));
}
