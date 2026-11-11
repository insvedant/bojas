import Link from 'next/link';
import { LogoMark, Wordmark } from './Logo';
import { InstagramIcon, XIcon, LinkedInIcon, FacebookIcon, YouTubeIcon } from './Icons';

export const SOCIALS = [
  ['instagram', 'Instagram', InstagramIcon],
  ['x', 'X (Twitter)', XIcon],
  ['linkedin', 'LinkedIn', LinkedInIcon],
  ['facebook', 'Facebook', FacebookIcon],
  ['youtube', 'YouTube', YouTubeIcon],
];

export default function Footer({ info }) {
  const socials = SOCIALS.filter(([k]) => info[k]);
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="top">
          <div className="col">
            <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}><LogoMark size={52} /><Wordmark /></span>
            <span className="muted">{info.footerBlurb}</span>
          </div>
          <div className="col">
            <span className="col-title">Pages</span>
            <Link href="/">Home</Link>
            <Link href="/about/">About</Link>
            <Link href="/services/">Services</Link>
            <Link href="/coaching/">Coaching</Link>
            <Link href="/players/">Players</Link>
            <Link href="/player-form/">Player form</Link>
            <Link href="/contact/">Contact</Link>
          </div>
          <div className="col">
            <span className="col-title">Contact</span>
            {info.address && <span>{info.address}</span>}
            {info.phone && <a href={`tel:${info.phone.replace(/[^+\d]/g, '')}`}>{info.phone}</a>}
            {info.email && <a href={`mailto:${info.email}`}>{info.email}</a>}
            {socials.length > 0 && (
              <div className="socials">
                {socials.map(([k, label, Icon]) => (
                  <a key={k} href={info[k]} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon /></a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} BOJAS</span>
          <span>{info.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
