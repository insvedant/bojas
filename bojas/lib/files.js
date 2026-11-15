// Limits for PDF uploads. Vercel rejects request bodies over 4.5 MB, so stay safely below it.
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export const formatBytes = (n) => {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

// "My licence (final).pdf" -> safe file name for headers and display.
export function safeFilename(name) {
  const base = String(name || '').split(/[\\/]/).pop().replace(/[^\w .()\-]+/g, '').trim().slice(0, 100);
  if (!base) return 'document.pdf';
  return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}
