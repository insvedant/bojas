import { site } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/thank-you/', '/__forms.html', '/admin/', '/api/'] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
