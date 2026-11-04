// Central place for business details and navigation. Edit here, it updates everywhere.
// Fixed settings. Everything visitors read (contact details, licences, agent,
// headlines, page text, photos) is edited in Admin → Site content.
export const site = {
  url: 'https://www.bojas.com', // TODO: your real domain (used for SEO links and the sitemap)
};

export const nav = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about/',
    children: [
      { label: 'Working with a FIFA agent in Canada', href: '/working-with-fifa-agent-in-canada/' },
      { label: 'What it takes to make a first team in Canada', href: '/becoming-professional-soccer-player-in-canada/' },
      { label: 'Why only a few turn pro in Canada', href: '/why-only-few-make-it-professional-in-canada/' },
    ],
  },
  {
    label: 'Services',
    href: '/services/',
    children: [{ label: 'Coaching', href: '/coaching/' }],
  },
  { label: 'Players', href: '/players/' },
  {
    label: 'Player Form',
    href: '/player-form/',
    children: [
      { label: 'OPDL Player Form', href: '/odpl-player-form/' },
      { label: 'League1 Ontario Player Form', href: '/league-1-ontario/' },
      { label: 'Ligue1 Québec Form', href: '/ligue-1-quebec/' },
    ],
  },
  { label: 'Contact', href: '/contact/' },
];

export const playerForms = [
  { id: 'comprehensive', label: 'Comprehensive', title: 'Comprehensive form', href: '/player-form/' },
  { id: 'opdl', label: 'OPDL', title: 'OPDL player form', href: '/odpl-player-form/' },
  { id: 'league1-ontario', label: 'League1 Ontario', title: 'League1 Ontario player form', href: '/league-1-ontario/' },
  { id: 'ligue1-quebec', label: 'Ligue1 Québec', title: 'Ligue1 Québec form', href: '/ligue-1-quebec/' },
];
