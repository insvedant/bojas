'use client';

import { useEffect, useRef } from 'react';

// Cloudflare Turnstile human check. Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
let scriptPromise;

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile failed to load')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export const turnstileOn = Boolean(SITE_KEY);

export default function Turnstile({ onToken }) {
  const ref = useRef(null);
  const idRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || idRef.current !== null) return;
        idRef.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (t) => onToken(t),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        });
      })
      .catch(() => onToken(''));
    return () => {
      cancelled = true;
      if (idRef.current !== null && window.turnstile) { try { window.turnstile.remove(idRef.current); } catch {} }
      idRef.current = null;
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="turnstile" />;
}
