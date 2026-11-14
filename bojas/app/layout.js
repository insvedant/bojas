import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import './globals.css';

import { site } from '@/lib/site';
import { getPageContent, photoUrl } from '@/lib/content';

export async function generateMetadata() {
  const g = await getPageContent('global');
  const images = g.shareImage ? [{ url: photoUrl(g.shareImage), width: 1200, height: 630 }] : undefined;
  return {
    metadataBase: new URL(site.url),
    title: { default: g.seoTitle, template: '%s | BOJAS' },
    description: g.seoDescription,
    openGraph: { type: 'website', siteName: 'BOJAS', locale: 'en_CA', title: g.seoTitle, description: g.seoDescription, images },
    twitter: { card: 'summary_large_image', images: images?.map((i) => i.url) },
  };
}

export const viewport = { themeColor: '#17100C', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
