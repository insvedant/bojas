import { Suspense } from 'react';
import ThankYouContent from '@/components/ThankYouContent';
import { getPageContent } from '@/lib/content';

export const metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
  const [t, g] = await Promise.all([getPageContent('thankyou'), getPageContent('global')]);
  return (
    <section className="stripes border-b">
      <div className="wrap section">
        <Suspense fallback={null}>
          <ThankYouContent content={t} email={g.email} />
        </Suspense>
      </div>
    </section>
  );
}
