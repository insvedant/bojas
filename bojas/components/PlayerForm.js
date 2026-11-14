'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  COUNTRIES, AGES, HEIGHTS, WEIGHTS, POSITIONS, FEET,
  IDENTITY_QUESTIONS, RATING_GROUPS, ratingName,
} from '@/lib/formSchema.mjs';
import { submitForm } from '@/lib/submitForm';
import Turnstile, { turnstileOn } from './Turnstile';

const STEP_TITLES = ['Player information', 'Playing identity', ...RATING_GROUPS.map((g) => g.title), 'Contact details'];
const TOTAL = STEP_TITLES.length;

const initialRatings = Object.fromEntries(
  RATING_GROUPS.flatMap((g) => g.items.map((i) => [ratingName(i), 5]))
);

function Select({ name, label, options, required, placeholder = 'Select…', defaultValue = '' }) {
  return (
    <label className="field">
      <span>{label}{!required && <span className="opt"> (optional)</span>}</span>
      <select className="select" name={name} required={required} defaultValue={defaultValue}>
        <option value="" disabled={required}>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Input({ name, label, type = 'text', required, placeholder, autoComplete }) {
  return (
    <label className="field">
      <span>{label}{!required && <span className="opt"> (optional)</span>}</span>
      <input className="input" type={type} name={name} required={required} placeholder={placeholder} autoComplete={autoComplete} />
    </label>
  );
}

export default function PlayerForm({ formType, privacy, consent, email, token }) {
  const router = useRouter();
  const formRef = useRef(null);
  const panelRef = useRef(null);
  const stepRefs = useRef([]);
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState(initialRatings);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [human, setHuman] = useState('');
  const onHuman = useCallback((t) => setHuman(t), []);

  const validateStep = (i) => {
    const el = stepRefs.current[i];
    if (!el) return true;
    const controls = [...el.querySelectorAll('input, select, textarea')];
    for (const c of controls) {
      const ok = c.checkValidity();
      c.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) { c.reportValidity(); c.focus(); return false; }
    }
    return true;
  };

  const go = (next) => {
    setError('');
    setStep(next);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onNext = () => { if (validateStep(step)) go(Math.min(TOTAL - 1, step + 1)); };
  const onBack = () => go(Math.max(0, step - 1));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step < TOTAL - 1) return onNext();
    if (!validateStep(step)) return;
    if (turnstileOn && !human) { setError('Please complete the security check below.'); return; }
    setSending(true);
    setError('');
    try {
      await submitForm('player', formRef.current, { token, turnstile: human });
      router.push('/thank-you/?form=player');
    } catch (err) {
      setError(`${err.message} Your answers are still here, so press Submit application again. If it keeps failing, email ${email}.`);
      setSending(false);
    }
  };

  const stepProps = (i) => ({
    ref: (el) => (stepRefs.current[i] = el),
    hidden: step !== i,
    'aria-labelledby': `step-title-${i}`,
  });

  return (
    <div className="stack" style={{ gap: 32 }} ref={panelRef}>
      <div className="stack" style={{ gap: 14 }}>
        <div className="progress-meta">
          <span className="accent">Step {step + 1} of {TOTAL}</span>
          <span>{STEP_TITLES[step]}</span>
        </div>
        <div className="progress" aria-hidden="true">
          {STEP_TITLES.map((t, i) => <span key={t} className={i <= step ? 'done' : ''} />)}
        </div>
      </div>

      <form ref={formRef} className="form-panel" name="player-form" method="POST" noValidate onSubmit={onSubmit}>
        <input type="hidden" name="form_type" value={formType} />
        <p className="hp"><label>Leave this field blank <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>

        {/* Step 1 */}
        <section className="stack" style={{ gap: 24 }} {...stepProps(0)}>
          <h2 id="step-title-0" className="h2 sm">Player information</h2>
          <div className="fields">
            <Input name="first_name" label="First name" required autoComplete="given-name" />
            <Input name="last_name" label="Last name" required autoComplete="family-name" />
            <Select name="nationality" label="Nationality" options={COUNTRIES} required defaultValue="Canada" />
            <Select name="age" label="Age" options={AGES} required />
            <Select name="height" label="Height" options={HEIGHTS} required />
            <Select name="weight" label="Weight" options={WEIGHTS} required />
            <Select name="position" label="Position" options={POSITIONS} required />
            <Input name="current_club" label="Current club" />
          </div>
          <fieldset className="fieldset">
            <legend className="legend">Preferred foot</legend>
            <div className="choice-row">
              {FEET.map((f) => (
                <label key={f} className="choice">
                  <input type="radio" name="preferred_foot" value={f} required /> {f}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* Step 2 */}
        <section className="stack" style={{ gap: 24 }} {...stepProps(1)}>
          <h2 id="step-title-1" className="h2 sm">Your playing identity</h2>
          {IDENTITY_QUESTIONS.map((q) => (
            <label key={q.name} className="field">
              <span>{q.label}</span>
              <textarea className="textarea" name={q.name} rows={3} placeholder={q.placeholder} />
            </label>
          ))}
        </section>

        {/* Steps 3–6: self ratings */}
        {RATING_GROUPS.map((g, gi) => {
          const i = gi + 2;
          return (
            <section key={g.title} className="stack" style={{ gap: 24 }} {...stepProps(i)}>
              <div className="stack" style={{ gap: 6 }}>
                <h2 id={`step-title-${i}`} className="h2 sm">{g.title}</h2>
                <p className="muted" style={{ fontSize: 15 }}>Rate yourself honestly from 1 (needs work) to 10 (elite).</p>
              </div>
              <div className="rating-grid">
                {g.items.map((label) => {
                  const name = ratingName(label);
                  return (
                    <label key={name} className="rating">
                      <span className="head"><span>{label}</span><output htmlFor={name}>{ratings[name]}</output></span>
                      <input
                        id={name}
                        type="range"
                        name={name}
                        min="1"
                        max="10"
                        value={ratings[name]}
                        onChange={(e) => setRatings((r) => ({ ...r, [name]: Number(e.target.value) }))}
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Step 7 */}
        <section className="stack" style={{ gap: 24 }} {...stepProps(TOTAL - 1)}>
          <h2 id={`step-title-${TOTAL - 1}`} className="h2 sm">Contact details</h2>
          <div className="fields">
            <Input name="email" label="Email address" type="email" required autoComplete="email" />
            <Input name="phone" label="Phone number" type="tel" required autoComplete="tel" />
            <Input name="highlights_url" label="YouTube match highlights" type="url" placeholder="https://youtube.com/…" />
            <Select name="eu_passport" label="Do you have an EU passport?" options={['Yes', 'No']} />
          </div>
          <div className="notice">
            <strong>Privacy protection &amp; conditions.</strong> {privacy}
          </div>
          <label className="check">
            <input type="checkbox" name="consent" value="Agreed" required />
            <span>{consent}</span>
          </label>
          {step === TOTAL - 1 && <Turnstile onToken={onHuman} />}
        </section>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={step === 0} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
            Back
          </button>
          {step < TOTAL - 1 ? (
            <button type="button" className="btn btn-primary" onClick={onNext}>Continue</button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending…' : 'Submit application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
