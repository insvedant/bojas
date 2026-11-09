import Link from 'next/link';
import { CtaBand, SiteImage, Paragraphs } from '@/components/Blocks';
import { getPageContent } from '@/lib/content';

export const metadata = {
  title: 'Coaching — Tactical, Technical & 1-on-1',
  description: 'Tactical positioning and technical sessions. We learn each young player’s style of play and identity to maximise their growth.',
  alternates: { canonical: '/coaching/' },
};



export default async function CoachingPage() {
  const c = await getPageContent('coaching');
  return (
    <>
      <section className="border-b">
        <div className="wrap split" style={{ paddingTop: 'clamp(64px, 8vw, 96px)', paddingBottom: 'clamp(64px, 8vw, 88px)' }}>
          <div className="stack" style={{ gap: 24 }}>
            <nav aria-label="Breadcrumb" className="breadcrumb">
              <Link href="/services/">Services</Link> / <span aria-current="page">Coaching</span>
            </nav>
            <h1 className="h1">{c.heroTitle} {c.heroHighlight && <span className="accent">{c.heroHighlight}</span>}</h1>
            <Paragraphs text={c.heroLead} className="lead" />
            <Link href="/working-with-fifa-agent-in-canada/" className="link-line">{c.heroLink}</Link>
          </div>
          {c.heroImage ? (
            <SiteImage id={c.heroImage} alt="" style={{ aspectRatio: '3 / 2', height: 'auto' }} eager />
          ) : (
          <figure className="board" style={{ margin: 0 }}>
            <svg viewBox="0 0 520 340" role="img" aria-label="Tactics board showing an off-the-ball run into space">
              <g fill="none" stroke="#EFE7DA" strokeOpacity="0.55" strokeWidth="2">
                <rect x="10" y="10" width="500" height="320" />
                <line x1="260" y1="10" x2="260" y2="330" />
                <circle cx="260" cy="170" r="48" />
                <rect x="420" y="90" width="90" height="160" />
                <rect x="480" y="135" width="30" height="70" />
              </g>
              <g fill="#EFE7DA"><circle cx="180" cy="120" r="9" /><circle cx="200" cy="230" r="9" /><circle cx="300" cy="90" r="9" /></g>
              <g fill="#17100C" stroke="#EFE7DA" strokeWidth="2"><circle cx="360" cy="150" r="9" /><circle cx="380" cy="215" r="9" /></g>
              <circle cx="300" cy="200" r="11" fill="var(--accent)" />
              <path d="M300 200 C 340 210, 380 190, 430 172" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="8 7" />
              <path d="M180 120 L 420 172" fill="none" stroke="#EFE7DA" strokeWidth="2" strokeOpacity="0.7" />
              <circle cx="438" cy="170" r="7" fill="none" stroke="var(--accent)" strokeWidth="3" />
            </svg>
            <figcaption className="caption"><span>Off-the-ball run</span><span className="accent">Session focus</span></figcaption>
          </figure>
          )}
        </div>
      </section>

      <section className="wrap section stack" style={{ gap: 48 }}>
        <h2 className="h2 sm">{c.sessionsTitle}</h2>
        <div className="grid-auto">
          {c.sessions.map((s, i) => (
            <div key={i} className="card" style={{ gap: 18 }}>
              <span className="tag">{s.tag}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="text-2">{s.text}</p>
              <div className="row-split muted" style={{ paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 15, marginTop: 'auto' }}>
                <span>{s.duration}</span><span>{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="paper">
        <div className="wrap section split">
          <h2 className="h2">{c.identityTitle}</h2>
          <div className="stack" style={{ gap: 16 }}><Paragraphs text={c.identityText} className="lead" style={{ fontSize: 20 }} /></div>
        </div>
      </section>

      <CtaBand title={c.ctaTitle}>
        <Link href="/contact/" className="btn btn-dark">{c.ctaButton}</Link>
      </CtaBand>
    </>
  );
}
