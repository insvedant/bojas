// Posts a form to Netlify Forms. Netlify registers the forms from public/__forms.html
// (generated at build). In local development there is no Netlify, so we skip the POST.
export async function submitToNetlify(formName, formData) {
  const data = new URLSearchParams();
  data.append('form-name', formName);
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') data.append(key, value);
  }

  if (process.env.NODE_ENV === 'development') {
    console.info(`[dev] "${formName}" would be submitted:`, Object.fromEntries(data));
    return;
  }

  const res = await fetch('/__forms.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString(),
  });
  if (!res.ok) throw new Error(`Form submission failed (${res.status})`);
}
