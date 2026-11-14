import Link from 'next/link';
import { SiteImage, Paragraphs } from './Blocks';
import { GUIDES, guideBySlug } from '@/lib/guides';
import { getPageContent, photoUrl } from '@/lib/content';
import { getAgents, joinNames } from '@/lib/agents';
import { site } from '@/lib/site';

const anchor = (i) => `section-${i + 1}`;

export async function articleMetadata(slug) {
  const g = guideBySlug(slug);
  const a = await getPageContent(g.id);
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/${slug}/` },
    openGraph: { type: 'article', title: a.title, description: a.description, images: a.cover ? [photoUrl(a.cover)] : undefined },
  };
}

export default async function ArticlePage({ slug }) {
  const guide = guideBySlug(slug);
  const [a, agents, ...all] = await Promise.all([
    getPageContent(guide.id), getAgents(), ...GUIDES.map((x) => getPageContent(x.id)),
  ]);
  const authors = agents.map((x) => x.name);
  const others = GUIDES.map((x, i) => ({ ...x, title: all[i].title })).filter((x) => x.slug !== slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    author: authors.length ? authors.map((name) => ({ '@type': 'Person', name })) : { '@type': 'Organization', name: 'BOJAS' },
    publisher: { '@type': 'Organization', name: 'BOJAS' },
    mainEntityOfPage: `${site.url}/${slug}/`,
  };

  return (
    <>
      <section className="border-b">
        <div className="wrap stack" style={{ gap: 22, paddingTop: 'clamp(64px, 8vw, 88px)', paddingBottom: 64 }}>
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/about/">About</Link> / <span aria-current="page">Guide {String(guide.number).padStart(2, '0')}</span>
          </nav>
          <h1 className="h1" style={{ maxWidth: 1000 }}>{a.title}</h1>
          {authors.length > 0 && <span className="breadcrumb">By {joinNames(authors)}</span>}
        </div>
        <div className="wrap">
          <SiteImage id={a.cover} label="Article cover image" alt="" style={{ height: 'clamp(240px, 32vw, 440px)' }} eager />
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="article-layout">
          {a.sections.length > 1 && (
            <nav className="article-toc" aria-label="In this guide">
              <span className="breadcrumb" style={{ marginBottom: 8 }}>In this guide</span>
              {a.sections.map((s, i) => <a key={i} href={`#${anchor(i)}`}>{s.heading}</a>)}
            </nav>
          )}
          <article className="prose">
            <Paragraphs text={a.intro} className="intro" />
            {a.sections.map((s, i) => (
              <div key={i} className="stack" style={{ gap: 24 }}>
                {s.heading && <h2 id={anchor(i)}>{s.heading}</h2>}
                <Paragraphs text={s.body} />
                {i === 0 && a.quote && <blockquote>{a.quote}</blockquote>}
              </div>
            ))}
            <div className="boxed row-split" style={{ marginTop: 24, padding: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="h3" style={{ color: 'var(--text)' }}>Think you're ready?</span>
              <Link href="/player-form/" className="btn btn-primary">Submit player form</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-surface border-t">
        <div className="wrap section stack" style={{ gap: 32 }}>
          <h2 className="h2 sm">Keep reading</h2>
          <div className="grid-auto">
            {others.map((o) => (
              <Link key={o.slug} href={`/${o.slug}/`} className="card" style={{ background: 'var(--bg)', minHeight: 200, justifyContent: 'space-between', gap: 32 }}>
                <span className="tag">Guide {String(o.number).padStart(2, '0')}</span>
                <span className="h3">{o.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
