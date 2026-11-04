import ContactForm from '@/components/ContactForm';
import { Paragraphs } from '@/components/Blocks';
import { SOCIALS } from '@/components/Footer';
import { getPageContent } from '@/lib/content';

export const metadata = {
  title: 'Contact',
  description: 'Contact BOJAS, a football agency in Canada. Players, clubs and scouts welcome.',
  alternates: { canonical: '/contact/' },
};

export default async function ContactPage() {
  const [c, g] = await Promise.all([getPageContent('contact'), getPageContent('global')]);
  const socials = SOCIALS.filter(([k]) => g[k]);
  const rows = [
    g.address && ['Office', <span key="a" style={{ fontSize: 19 }}>{g.address}</span>],
    g.phone && ['Phone', <a key="p" href={`tel:${g.phone.replace(/[^+\d]/g, '')}`} style={{ fontSize: 19 }}>{g.phone}</a>],
    g.email && ['Email', <a key="e" href={`mailto:${g.email}`} style={{ fontSize: 19 }}>{g.email}</a>],
    socials.length > 0 && ['Follow', (
      <div key="s" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 19 }}>
        {socials.map(([k, label]) => <a key={k} href={g[k]} target="_blank" rel="noopener noreferrer">{label}</a>)}
      </div>
    )],
  ].filter(Boolean);

  return (
    <>
      <section className="wrap section split top">
        <div className="stack" style={{ gap: 28 }}>
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 className="h1">{c.title}</h1>
          <Paragraphs text={c.lead} className="lead" />
          <div className="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {rows.map(([label, node]) => (
              <div key={label} className="stack" style={{ gap: 4, padding: '20px 0' }}>
                <span className="breadcrumb">{label}</span>
                {node}
              </div>
            ))}
          </div>
        </div>
        <ContactForm title={c.formTitle} email={g.email} />
      </section>
      {c.mapEmbed && (
        <iframe
          src={c.mapEmbed}
          title="Office location map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ display: 'block', width: '100%', height: 360, border: 0, filter: 'grayscale(0.4) contrast(1.05)' }}
        />
      )}
    </>
  );
}
