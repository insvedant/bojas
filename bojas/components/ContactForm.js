'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitForm } from '@/lib/submitForm';
import Turnstile, { turnstileOn } from './Turnstile';

export default function ContactForm({ title, email, token }) {
  const router = useRouter();
  const ref = useRef(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [human, setHuman] = useState('');
  const onHuman = useCallback((t) => setHuman(t), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = ref.current;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (turnstileOn && !human) { setError('Please complete the security check above the button.'); return; }
    setSending(true);
    setError('');
    try {
      await submitForm('contact', form, { token, turnstile: human });
      router.push('/thank-you/?form=contact');
    } catch (err) {
      setError(`Your message wasn't sent. ${err.message} Press Send message again, or email ${email}.`);
      setSending(false);
    }
  };

  return (
    <form ref={ref} className="form-panel" name="contact" method="POST" onSubmit={onSubmit} style={{ gap: 20 }}>
      <p className="hp"><label>Leave this field blank <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <h2 className="h2 sm">{title}</h2>
      <div className="fields" style={{ gap: 18 }}>
        <label className="field"><span>Full name</span><input className="input" name="full_name" required autoComplete="name" /></label>
        <label className="field">
          <span>I am a…</span>
          <select className="select" name="role" defaultValue="Player">
            <option>Player</option><option>Club / Academy</option><option>Scout</option><option>Other</option>
          </select>
        </label>
        <label className="field"><span>Email</span><input className="input" type="email" name="email" required autoComplete="email" /></label>
        <label className="field"><span>Phone <span className="opt">(optional)</span></span><input className="input" type="tel" name="phone" autoComplete="tel" /></label>
      </div>
      <label className="field"><span>Message</span><textarea className="textarea" name="message" rows={6} required /></label>
      <Turnstile onToken={onHuman} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={sending}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
