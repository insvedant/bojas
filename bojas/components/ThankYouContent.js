'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckIcon } from './Icons';

export default function ThankYouContent({ content: t, email }) {
  const params = useSearchParams();
  const isContact = params.get('form') === 'contact';
  const c = isContact
    ? { title: t.contactTitle, lead: t.contactLead, steps: t.contactSteps }
    : { title: t.playerTitle, lead: t.playerLead, steps: t.playerSteps };
  return (
    <div className="split top">
      <div className="stack" style={{ gap: 28 }}>
        <div className="check-mark"><CheckIcon /></div>
        <h1 className="h1">{c.title}</h1>
        <p className="lead">{c.lead}</p>
        <div className="btn-row">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/players/" className="btn btn-outline">See our players</Link>
        </div>
      </div>
      {c.steps.length > 0 && (
        <div className="stack" style={{ gap: 16 }}>
          <h2 className="h3">What happens next</h2>
          <ol className="steps-list">{c.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          {email && (
            <p className="muted" style={{ fontSize: 15 }}>
              Anything to add? Email <a href={`mailto:${email}`} className="accent">{email}</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
