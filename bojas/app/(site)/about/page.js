import Link from 'next/link';
import { PageHero, CtaBand, SiteImage, Paragraphs, LicenseLink } from '@/components/Blocks';
import { getPageContent } from '@/lib/content';
import { GUIDES } from '@/lib/guides';
import { getAgents } from '@/lib/agents';

export const metadata = {
  title: 'About',
  description: 'Meet BOJAS, a football agency in Canada specialising in youth player development, contracts and career planning.',
  alternates: { canonical: '/about/' },
};

export default async function AboutPage() {
  const [c, agents, ...guides] = await Promise.all([
    getPageContent('about'), getAgents(), ...GUIDES.map((x) => getPageContent(x.id)),
  ]);

  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} title={c.heroTitle} />

      <section className="wrap section split top">
        <div className="stack" style={{ gap: 14 }}>
          <span className="eyebrow">{c.offerEyebrow}</span>
          <h2 className="h2">{c.offerTitle}</h2>
        </div>
        <div className="stack text-2" style={{ gap: 20, fontSize: 19 }}>
          <Paragraphs text={c.offerText} />
          {c.stats.length > 0 && (
            <div className="stat-grid" style={{ marginTop: 12, gridTemplateColumns: `repeat(${c.stats.length}, minmax(0, 1fr))` }}>
              {c.stats.map((x, i) => (
                <div key={i}><div className="big">{x.big}</div><div style={{ fontSize: 14 }}>{x.small}</div></div>
              ))}
            </div>
          )}
        </div>
      </section>

      {agents.map((a, i) => (
        <section key={a.id} id={a.anchor} className={i % 2 === 0 ? 'bg-surface border-t border-b' : 'border-b'}>
          <div className={`wrap section split top${i % 2 === 1 ? ' reverse' : ''}`}>
            <div>
              <SiteImage id={a.portrait} label={`Portrait — ${a.name}`} alt={a.name} style={{ aspectRatio: '1200 / 1100', height: 'auto' }} />
              <div className="strip row-split" style={{ padding: '18px 20px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>{a.roleLabel}</span><span>BOJAS</span>
              </div>
            </div>
            <div className="stack" style={{ gap: 24 }}>
              {a.titles && <span className="eyebrow">{a.titles}</span>}
              <h2 className="h2" style={{ fontSize: 'clamp(48px, 5.4vw, 80px)', lineHeight: 0.9 }}>{a.name}</h2>
              <Paragraphs text={a.bio} className="lead" />
              {a.quote && (
                <blockquote className="quote boxed" style={{ padding: 28, marginTop: 8 }}>“{a.quote}”</blockquote>
              )}
              {(a.email || a.phone || a.languages.length > 0) && (
                <dl className="facts" style={{ margin: 0 }}>
                  {a.email && <div><dt>Email</dt><dd style={{ textTransform: 'none', fontSize: 18 }}><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>}
                  {a.phone && <div><dt>Phone</dt><dd><a href={`tel:${a.phone.replace(/[^+\d]/g, '')}`}>{a.phone}</a></dd></div>}
                  {a.languages.length > 0 && <div><dt>Languages</dt><dd>{a.languages.join(', ')}</dd></div>}
                </dl>
              )}
              {a.credentials.length > 0 && (
                <div className="rows" style={{ fontSize: 17 }}>{a.credentials.map((x) => <div key={x}>{x}</div>)}</div>
              )}
              <LicenseLink agent={a} />
            </div>
          </div>
        </section>
      ))}

      <section className="wrap section stack" style={{ gap: 40 }}>
        <h2 className="h2 sm">{c.guidesTitle}</h2>
        <div className="grid-auto">
          {GUIDES.map((x, i) => (
            <Link key={x.slug} href={`/${x.slug}/`} className="card" style={{ minHeight: 260, justifyContent: 'space-between', gap: 40 }}>
              <span className="tag">Guide {String(x.number).padStart(2, '0')}</span>
              <span className="h3">{guides[i].title}</span>
              <span className="muted" style={{ fontSize: 15 }}>Read the guide</span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand title={c.ctaTitle}>
        <Link href="/player-form/" className="btn btn-dark">{c.ctaButton}</Link>
      </CtaBand>
    </>
  );
}
