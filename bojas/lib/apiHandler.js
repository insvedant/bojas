import { NextResponse } from 'next/server';
import { explainDbError } from './db';

// Wraps an API route so any failure returns a JSON error message instead of
// an HTML error page (which the admin panel can't display).
export const handle = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    console.error('[api]', err);
    return NextResponse.json({ error: explainDbError(err) }, { status: 500 });
  }
};
