'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav } from '@/lib/site';
import { LogoMark, Wordmark } from './Logo';
import { MenuIcon, CloseIcon } from './Icons';

const norm = (p) => (p.endsWith('/') ? p : `${p}/`);

export default function Header({ info }) {
  const pathname = norm(usePathname() || '/');
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isCurrent = (href) => norm(href) === pathname;
  const inSection = (item) =>
    isCurrent(item.href) || (item.children || []).some((c) => isCurrent(c.href)) ||
    (item.href === '/players/' && pathname.startsWith('/players/'));

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <div className="group">
            {info.address && <span>{info.address}</span>}
            {info.phone && <a href={`tel:${info.phone.replace(/[^+\d]/g, '')}`}>{info.phone}</a>}
            {info.email && <a href={`mailto:${info.email}`}>{info.email}</a>}
          </div>
          {info.tagline && <span className="accent">● {info.tagline}</span>}
        </div>
      </div>
      <header className="site-header">
        <div className="wrap bar">
          <Link href="/" className="brand" aria-label="BOJAS home">
            <LogoMark />
            <Wordmark />
          </Link>

          <nav id="site-nav" className={`site-nav${open ? ' open' : ''}`} aria-label="Main">
            <ul className="menu">
              {nav.map((item) => (
                <li key={item.href} className={inSection(item) ? 'is-active' : undefined}>
                  <Link href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
                    {item.label}
                    {item.children && <span className="caret" aria-hidden="true">▾</span>}
                  </Link>
                  {item.children && (
                    <ul className="submenu">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} aria-current={isCurrent(c.href) ? 'page' : undefined}>{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <Link href="/player-form/" className="btn btn-primary mobile-cta">{info.headerCta}</Link>
          </nav>

          <Link href="/player-form/" className="btn btn-primary btn-sm header-cta">{info.headerCta}</Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>
    </>
  );
}
