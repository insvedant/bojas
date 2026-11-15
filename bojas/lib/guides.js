// The three guide articles. URLs are fixed (kept for SEO); all text and the
// cover photo are edited in Admin → Site content → Guide 1/2/3.
export const GUIDES = [
  { id: 'guide1', number: 1, slug: 'working-with-fifa-agent-in-canada' },
  { id: 'guide2', number: 2, slug: 'becoming-professional-soccer-player-in-canada' },
  { id: 'guide3', number: 3, slug: 'why-only-few-make-it-professional-in-canada' },
];
export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
