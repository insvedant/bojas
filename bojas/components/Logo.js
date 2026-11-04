// BOJAS "Maison" logo: interlaced B + J monogram in a double ring, wide-set serif wordmark.
export function LogoMark({ size = 44, ring = 'var(--accent)', b = 'var(--text)', j = 'var(--accent)', title }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={ring} strokeWidth="1" />
      <text x="43" y="66" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" fontSize="50" fill={b}>B</text>
      <text x="60" y="70" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="500" fontStyle="italic" fontSize="44" fill={j}>J</text>
    </svg>
  );
}

export function Wordmark({ large = false }) {
  return <span className={`wordmark${large ? ' lg' : ''}`}>BOJAS</span>;
}
