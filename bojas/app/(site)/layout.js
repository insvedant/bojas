import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SourceTracker from '@/components/SourceTracker';
import { getPageContent } from '@/lib/content';
import { site } from '@/lib/site';

// Content is edited in the admin panel, so pages render on request (content itself is cached).
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const info = await getPageContent('global');
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'BOJAS',
    url: site.url,
    email: info.email || undefined,
    telephone: info.phone || undefined,
    address: info.address || undefined,
    sport: 'Soccer',
    sameAs: ['instagram', 'x', 'linkedin', 'facebook', 'youtube'].map((k) => info[k]).filter(Boolean),
  };
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header info={info} />
      <main id="main">{children}</main>
      <Footer info={info} />
      <SourceTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    </>
  );
}
