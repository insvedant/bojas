import Link from 'next/link';

export function PageHero({ crumbs = [], eyebrow, title, children, stripes = true }) {
  return (
    <section className={`page-hero border-b${stripes ? ' stripes' : ''}`}>
      <div className="wrap inner">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 && ' / '}
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="h1 xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function CtaBand({ title, children }) {
  return (
    <section className="band">
      <div className="wrap inner">
        <h2 className="h2">{title}</h2>
        <div className="btn-row">{children}</div>
      </div>
    </section>
  );
}

export function Placeholder({ label, style, className = '' }) {
  return (
    <div className={`placeholder ${className}`} style={style} role="img" aria-label={label}>
      [{label}]
    </div>
  );
}

export function PitchLines() {
  return (
    <svg className="pitch-lines" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="#EFE7DA" strokeWidth="2">
        <rect x="40" y="40" width="1360" height="680" />
        <line x1="720" y1="40" x2="720" y2="720" />
        <circle cx="720" cy="380" r="110" />
        <rect x="1180" y="200" width="220" height="360" />
        <rect x="1320" y="290" width="80" height="180" />
        <path d="M1180 310 A90 90 0 0 0 1180 450" />
        <rect x="40" y="200" width="220" height="360" />
        <rect x="40" y="290" width="80" height="180" />
      </g>
    </svg>
  );
}

// A photo slot editable in the admin panel. Shows a labelled placeholder until a photo is uploaded.
export function SiteImage({ id, alt = '', label, style, className = '', eager = false }) {
  if (!id) return <Placeholder label={label} style={style} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/photos/${id}/`}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      style={{ width: '100%', objectFit: 'cover', ...style }}
    />
  );
}

// Renders admin textarea content: a blank line starts a new paragraph.
export function Paragraphs({ text, className, style }) {
  const parts = String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts.map((p, i) => (
    <p key={i} className={className} style={style}>{p}</p>
  ));
}
