import Link from 'next/link';
import { PageHero, CtaBand } from '@/components/Blocks';
import PlayerCard from '@/components/PlayerCard';
import { getPublishedPlayers } from '@/lib/players';
import { getPageContent } from '@/lib/content';
import { Paragraphs } from '@/components/Blocks';

export const metadata = {
  title: 'Players',
  description: 'Players represented and developed by BOJAS, a football agency in Canada.',
  alternates: { canonical: '/players/' },
};

export default async function PlayersPage() {
  const [players, c] = await Promise.all([getPublishedPlayers(), getPageContent('players')]);
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Players' }]} title={c.heroTitle}>
        <Paragraphs text={c.heroLead} className="lead" />
      </PageHero>
      <section className="wrap section">
        {players.length > 0 ? (
          <div className="grid-auto">
            {players.map((p) => <PlayerCard key={p.slug} player={p} />)}
          </div>
        ) : (
          <p className="lead">{c.emptyText}</p>
        )}
      </section>
      <CtaBand title={c.ctaTitle}>
        <Link href="/player-form/" className="btn btn-dark">{c.ctaButton}</Link>
      </CtaBand>
    </>
  );
}
