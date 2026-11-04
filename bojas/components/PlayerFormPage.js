import Link from 'next/link';
import PlayerForm from './PlayerForm';
import { playerForms } from '@/lib/site';
import { getPageContent } from '@/lib/content';

export default async function PlayerFormPage({ formId }) {
  const current = playerForms.find((f) => f.id === formId);
  const [c, g] = await Promise.all([getPageContent('forms'), getPageContent('global')]);
  return (
    <>
      <section className="border-b stripes">
        <div className="wrap-narrow stack" style={{ gap: 20, paddingTop: 'clamp(56px, 7vw, 80px)', paddingBottom: 48 }}>
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 className="h1">{c.title}</h1>
          <p className="lead">
            {c.lead}{' '}
            {c.linkLabel && <Link href="/working-with-fifa-agent-in-canada/" className="accent">{c.linkLabel}</Link>}
          </p>
          <nav className="tabs" aria-label="Form type" style={{ paddingTop: 12 }}>
            {playerForms.map((f) => (
              <Link key={f.id} href={f.href} aria-current={f.id === formId ? 'page' : undefined}>{f.label}</Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="wrap-narrow" style={{ paddingTop: 48, paddingBottom: 'var(--section-y)' }}>
        <PlayerForm formType={current.title} privacy={c.privacy} consent={c.consent} email={g.email} />
      </section>
    </>
  );
}
