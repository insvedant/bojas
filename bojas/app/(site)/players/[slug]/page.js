import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/Blocks';
import PlayerCard, { PlayerPhoto } from '@/components/PlayerCard';
import { getPublishedPlayers, getPublishedPlayer } from '@/lib/players';
import { getPageContent, } from '@/lib/content';
import { Paragraphs } from '@/components/Blocks';

export async function generateMetadata({ params }) {
  const p = await getPublishedPlayer(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.position}`,
    description: `${p.name}, ${p.position}${p.age ? `, age ${p.age}` : ''}. ${p.bio}`.slice(0, 160),
    alternates: { canonical: `/players/${p.slug}/` },
  };
}

export default async function PlayerPage({ params }) {
  const p = await getPublishedPlayer(params.slug);
  if (!p) notFound();
  const c = await getPageContent('players');
  const others = (await getPublishedPlayers()).filter((o) => o.slug !== p.slug).slice(0, 3);
  const isDemo = p.bio?.startsWith('Demo profile');

  const facts = [
    ['Position', p.position], ['Age', p.age], ['Foot', p.foot], ['Height', p.height],
    ['Weight', p.weight], ['Nationality', p.nationality], ['Club', p.club],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  return (
    <>
      <section className="border-b stripes">
        <div className="wrap split top" style={{ paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
          <div style={{ maxWidth: 520, width: '100%' }}>
            <PlayerPhoto player={p} eager />
          </div>
          <div className="stack" style={{ gap: 24 }}>
            <nav aria-label="Breadcrumb" className="breadcrumb">
              <Link href="/players/">Players</Link> / <span aria-current="page">{p.name}</span>
            </nav>
            <h1 className="h1">{p.name}</h1>
            <Paragraphs text={p.bio} className="lead" />
            {isDemo && <p className="demo-note">This is a demo profile. Edit or delete it in the admin panel.</p>}
            <dl className="facts" style={{ margin: 0 }}>
              {facts.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
            {p.highlights && (
              <a href={p.highlights} className="btn btn-primary" target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
                Watch highlights
              </a>
            )}
          </div>
        </div>
      </section>

      {(p.strengths.length > 0 || p.ratings.length > 0) && (
      <section className="wrap section split top">
        <div className="stack" style={{ gap: 20 }}>
          <h2 className="h2 sm">Strengths</h2>
          <ul className="chips">{p.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <h2 className="h2 sm">Scouting ratings</h2>
          <div className="stack" style={{ gap: 16 }}>
            {p.ratings.map(({ label, value: v }) => (
              <div key={label} className="meter" style={{ fontSize: 16 }}>
                <span className="row-split"><span>{label}</span><span className="badge">{v}/10</span></span>
                <div className="track"><div className="fill" style={{ width: `${v * 10}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {others.length > 0 && (
        <section className="bg-surface border-t">
          <div className="wrap section stack" style={{ gap: 32 }}>
            <h2 className="h2 sm">More players</h2>
            <div className="grid-auto">{others.map((o) => <PlayerCard key={o.slug} player={o} />)}</div>
          </div>
        </section>
      )}

      <CtaBand title={c.profileCtaTitle}>
        <Link href="/contact/" className="btn btn-dark">{c.profileCtaButton}</Link>
      </CtaBand>
    </>
  );
}
