import Link from 'next/link';
import { CtaBand, PitchLines, SiteImage, Paragraphs } from '@/components/Blocks';
import PlayerCard from '@/components/PlayerCard';
import { getPublishedPlayers } from '@/lib/players';
import { getPageContent } from '@/lib/content';
import { getAgents, agencyCredentials } from '@/lib/agents';

export const metadata = { alternates: { canonical: '/' } };

const sampleMeters = [['Vision', 80], ['Key passes', 70], ['Decision making', 60], ['Under pressure', 50]];

export default async function HomePage() {
  const [c, agents, s, players] = await Promise.all([
    getPageContent('home'), getAgents(), getPageContent('services'), getPublishedPlayers(3),
  ]);
  const credentials = agencyCredentials(agents);

  return (
    <>
      {/* Hero */}
      <section className="hero stripes border-b">
        <PitchLines />
        <div className="wrap inner split">
          <div className="stack" style={{ gap: 28 }}>
            {c.heroEyebrow && <span className="eyebrow">{c.heroEyebrow}</span>}
            <h1 className="h1">
              {c.heroTitle} {c.heroHighlight && <span className="accent">{c.heroHighlight}</span>} {c.heroTitleEnd}
            </h1>
            <Paragraphs text={c.heroLead} className="lead" />
            <div className="btn-row">
              <Link href="/player-form/" className="btn btn-primary">{c.heroPrimary}</Link>
              <Link href="/services/" className="btn btn-outline">{c.heroSecondary}</Link>
            </div>
          </div>

          <div className="scout-card" aria-label="Example scouting report">
            <div className="row-split eyebrow muted" style={{ fontSize: 12 }}>
              <span>Scouting report</span><span className="accent">Example</span>
            </div>
            <SiteImage id={c.heroImage} label="Player action photo" alt="" style={{ height: 220 }} eager />
            <div className="row-split" style={{ alignItems: 'flex-end' }}>
              <div>
                <div className="h3" style={{ fontWeight: 800 }}>{c.cardName}</div>
                <div className="muted" style={{ fontSize: 14 }}>{c.cardMeta}</div>
              </div>
              <div className="jersey">{c.cardNumber}</div>
            </div>
            <div className="meters">
              {sampleMeters.map(([label, v]) => (
                <div key={label} className="meter">
                  <span>{label}</span>
                  <div className="track"><div className="fill" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      {credentials.length > 0 && (
        <section className="strip" aria-label="Licences">
          <div className="wrap">{credentials.map((x) => <span key={x}>{x}</span>)}</div>
        </section>
      )}

      {/* Services */}
      <section className="wrap section stack" style={{ gap: 48, paddingBottom: 64 }}>
        <div className="row-split" style={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px 48px' }}>
          <div className="stack" style={{ gap: 12 }}>
            <span className="eyebrow">{c.servicesEyebrow}</span>
            <h2 className="h2" style={{ maxWidth: 640 }}>{c.servicesTitle}</h2>
          </div>
          <Link href="/services/" className="link-line">All services</Link>
        </div>
        <div className="grid-auto">
          {c.services.map((x, i) => (
            <div key={i} className="card">
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="h3">{x.title}</h3>
              <p className="text-2">{x.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Licences + team */}
      <section className="wrap" style={{ paddingBottom: 'var(--section-y)' }}>
        <div className="boxed-cols">
          <div>
            <h3 className="h3">{c.licencesTitle}</h3>
            <div className="rows">{credentials.map((x) => <div key={x}>{x}</div>)}</div>
          </div>
          <div>
            <h3 className="h3">{c.teamTitle}</h3>
            <div className="rows">{c.teamItems.map((x) => <div key={x}>{x}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Team sheet */}
      <section className="paper">
        <div className="wrap section split top">
          <div className="stack" style={{ gap: 20 }}>
            <span className="eyebrow">{c.sheetEyebrow}</span>
            <h2 className="h2">{c.sheetTitle}</h2>
            <Paragraphs text={c.sheetLead} className="lead" />
          </div>
          <div className="sheet">
            {s.helpAreas.map((a, i) => (
              <div key={a}><span className="n">{i + 1}</span>{a}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Two bands */}
      <section className="duo border-b">
        <div>
          <h2 className="h2">{c.duoLeftTitle}</h2>
          <Link href="/services/" className="link-line">{c.duoLeftLink}</Link>
        </div>
        <div>
          <h2 className="h2">{c.duoRightTitle}</h2>
          <Link href="/players/" className="link-line">{c.duoRightLink}</Link>
        </div>
      </section>

      {/* Players */}
      {players.length > 0 && (
        <section className="wrap section stack" style={{ gap: 40 }}>
          <div className="row-split" style={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px 48px' }}>
            <div className="stack" style={{ gap: 12 }}>
              <span className="eyebrow">{c.playersEyebrow}</span>
              <h2 className="h2">{c.playersTitle}</h2>
            </div>
            <Link href="/players/" className="link-line">All players</Link>
          </div>
          <div className="grid-auto">
            {players.map((p) => <PlayerCard key={p.slug} player={p} />)}
          </div>
        </section>
      )}

      {/* About teaser: both agents */}
      <section className="bg-surface border-t border-b">
        <div className="wrap section split">
          {agents.length > 0 && (
            <div className="agent-duo">
              {agents.map((ag) => (
                <Link key={ag.id} href={`/about/#${ag.anchor}`} className="agent-tile">
                  <SiteImage id={ag.portrait} label={`Portrait — ${ag.name}`} alt={ag.name} style={{ aspectRatio: '1200 / 1100', height: 'auto' }} />
                  <span className="agent-tile-cap">
                    <strong>{ag.name}</strong>
                    {ag.titles && <span>{ag.titles}</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="stack" style={{ gap: 24 }}>
            <span className="eyebrow">{c.aboutEyebrow}</span>
            <h2 className="h2">{c.aboutTitle}</h2>
            <Paragraphs text={c.aboutLead} className="lead" />
            <Link href="/about/" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>{c.aboutButton}</Link>
          </div>
        </div>
      </section>

      <CtaBand title={c.ctaTitle}>
        <Link href="/player-form/" className="btn btn-dark">{c.ctaButton}</Link>
        <Link href="/contact/" className="btn btn-dark-outline">{c.ctaButton2}</Link>
      </CtaBand>
    </>
  );
}
