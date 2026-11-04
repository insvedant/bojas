import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageContent } from '@/lib/content';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default async function NotFound() {
  const info = await getPageContent('global');
  return (
    <>
      <Header info={info} />
      <main id="main">
        <section className="stripes">
          <div className="wrap section stack" style={{ gap: 24 }}>
            <span className="eyebrow">404</span>
            <h1 className="h1">Offside. This page doesn't exist.</h1>
            <p className="lead">The link may be old or mistyped. Head back to the homepage or find what you need below.</p>
            <div className="btn-row">
              <Link href="/" className="btn btn-primary">Go to homepage</Link>
              <Link href="/player-form/" className="btn btn-outline">Player form</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer info={info} />
    </>
  );
}
