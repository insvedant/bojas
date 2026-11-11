import Link from 'next/link';
import { PageHero, CtaBand, Paragraphs } from '@/components/Blocks';
import { getPageContent } from '@/lib/content';
import { TacticalIcon, TechnicalIcon, MentalIcon } from '@/components/Icons';

export const metadata = {
  title: 'Services',
  description: 'Scouting, development, contract negotiations, career planning and coaching for youth players aiming to turn professional.',
  alternates: { canonical: '/services/' },
};

const ICONS = [TacticalIcon, TechnicalIcon, MentalIcon];

export default async function ServicesPage() {
  const c = await getPageContent('services');
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]} eyebrow={c.heroEyebrow} title={c.heroTitle}>
        <Link href="/working-with-fifa-agent-in-canada/" className="link-line">{c.heroLink}</Link>
      </PageHero>

      <section className="wrap section stack" style={{ gap: 48 }}>
        <div className="stack" style={{ gap: 12 }}>
          <span className="eyebrow">{c.pathEyebrow}</span>
          <h2 className="h2 sm">{c.pathTitle}</h2>
        </div>
        <ol className="pathway" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {c.pathway.map((p, i) => (
            <li key={i}>
              <span className="tag">{p.stage}</span>
              <h3 className="h3" style={{ fontSize: 34, lineHeight: 1 }}>{p.title}</h3>
              <p className="text-2">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="paper">
        <div className="wrap section split top">
          <div className="stack" style={{ gap: 16 }}>
            <span className="eyebrow">{c.listEyebrow}</span>
            <h2 className="h2">{c.listTitle}</h2>
          </div>
          <div className="sheet">{c.helpAreas.map((a) => <div key={a}>{a}</div>)}</div>
        </div>
      </section>

      <section className="wrap section split top">
        <div className="stack" style={{ gap: 20 }}>
          <span className="eyebrow">{c.pillarsEyebrow}</span>
          <h2 className="h2 sm">{c.pillarsTitle}</h2>
          <Paragraphs text={c.pillarsLead} className="lead" />
          <Link href="/coaching/" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>{c.pillarsButton}</Link>
        </div>
        <div className="tile-grid">
          {c.pillars.map((label, i) => {
            const Icon = ICONS[i] || TacticalIcon;
            return <div key={label}><Icon /><span className="h3">{label}</span></div>;
          })}
        </div>
      </section>

      <CtaBand title={c.ctaTitle}>
        <Link href="/player-form/" className="btn btn-dark">{c.ctaButton}</Link>
        <Link href="/contact/" className="btn btn-dark-outline">{c.ctaButton2}</Link>
      </CtaBand>
    </>
  );
}
