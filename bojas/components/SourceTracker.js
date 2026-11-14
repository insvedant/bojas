'use client';

import { useEffect } from 'react';

// Remembers how the visitor arrived (first page, referring site, UTM tags) for this
// browser session, so form submissions can show where they came from.
export const SOURCE_KEY = 'bojas_source';

export default function SourceTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SOURCE_KEY)) return;
      const url = new URL(window.location.href);
      const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '';
      sessionStorage.setItem(SOURCE_KEY, JSON.stringify({
        landingPage: url.pathname + url.search,
        referrer: ref,
        utmSource: url.searchParams.get('utm_source') || '',
        utmMedium: url.searchParams.get('utm_medium') || '',
        utmCampaign: url.searchParams.get('utm_campaign') || '',
      }));
    } catch {}
  }, []);
  return null;
}
