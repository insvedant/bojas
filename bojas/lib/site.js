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
  { label: 'Player Form', href: '/player-form/' },
  { label: 'Contact', href: '/contact/' },
];

// The website has one player form. Its title is saved with every submission.
export const playerForms = [
  { id: 'comprehensive', label: 'Comprehensive', title: 'Comprehensive form', href: '/player-form/' },
];
