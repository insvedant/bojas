'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitToNetlify } from '@/lib/submitForm';

export default function ContactForm({ title, email }) {
  const router = useRouter();
  const ref = useRef(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = ref.current;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setSending(true);
    setError('');
    try {
      await submitToNetlify('contact', new FormData(form));
      router.push('/thank-you/?form=contact');
    } catch {
      setError(`Your message wasn't sent. Check your connection and press Send message again, or email ${email}.`);
      setSending(false);
    }
  };

  return (
    <form ref={ref} className="form-panel" name="contact" method="POST" onSubmit={onSubmit} style={{ gap: 20 }}>
      <input type="hidden" name="form-name" value="contact" />
      <p className="hp"><label>Leave this field blank <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <h2 className="h2 sm">{title}</h2>
      <div className="fields" style={{ gap: 18 }}>
        <label className="field"><span>Full name</span><input className="input" name="full_name" required autoComplete="name" /></label>
        <label className="field">
          <span>I am a…</span>
          <select className="select" name="role" defaultValue="Player">
            <option>Player</option><option>Parent</option><option>Club / Academy</option><option>Other</option>
          </select>
        </label>
        <label className="field"><span>Email</span><input className="input" type="email" name="email" required autoComplete="email" /></label>
        <label className="field"><span>Phone <span className="opt">(optional)</span></span><input className="input" type="tel" name="phone" autoComplete="tel" /></label>
      </div>
      <label className="field"><span>Message</span><textarea className="textarea" name="message" rows={6} required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={sending}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
