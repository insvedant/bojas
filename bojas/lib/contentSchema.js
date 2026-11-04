// ============================================================================
// Everything editable in Admin → Site content is defined here.
// Each page has sections; each field has a type, a label for the admin panel,
// and a default (what the site shows until someone edits it).
//
// Field types:
//   text      one line          textarea  paragraphs (blank line = new paragraph)
//   list      list of short lines          cards     repeatable groups of sub-fields
//   image     photo slot with page location + recommended size (center-cropped on upload)
//   url       a link
// To add a new editable field: add it here, then read it in the page with getPageContent().
// ============================================================================

const text = (key, label, def = '', o = {}) => ({ key, label, type: 'text', default: def, max: 200, ...o });
const area = (key, label, def = '', o = {}) => ({ key, label, type: 'textarea', default: def, max: 6000, ...o });
const list = (key, label, def = [], o = {}) => ({ key, label, type: 'list', default: def, maxItems: 20, ...o });
const url = (key, label, def = '', o = {}) => ({ key, label, type: 'url', default: def, ...o });
const cards = (key, label, fields, def = [], o = {}) => ({ key, label, type: 'cards', fields, default: def, maxItems: 12, ...o });
const image = (key, label, where, w, h, o = {}) => ({ key, label, type: 'image', default: null, where, w, h, ...o });

const CTA = (title, button) => [text('ctaTitle', 'Closing banner headline', title), text('ctaButton', 'Closing banner button', button)];

const DEFAULT_HELP_AREAS = [
  'Contract negotiations', 'Career planning & legal advice', 'Technical football sessions', 'Tactical football sessions',
  '1v1 coaching', 'Self-esteem coaching', 'Life outside football', 'Ambition setting',
  'Motor skill improvement', 'Mental wellbeing in the pro game',
];

const article = (id, number, slug, title, description) => ({
  id, label: `Guide ${number}`, path: `/${slug}/`, group: 'Guides',
  sections: [
    {
      title: 'Article',
      fields: [
        text('title', 'Headline', title, { max: 160 }),
        text('description', 'Search engine description (shown on Google)', description, { max: 300 }),
        image('cover', 'Cover photo', `Guide ${number} page → wide photo under the headline`, 1600, 600),
        area('intro', 'Intro paragraph (large text)', '[Intro paragraph — paste the article copy here.]'),
        text('quote', 'Pull quote (shown after section 1)', '[Pull quote from the article]', { max: 300 }),
        cards('sections', 'Article sections', [
          text('heading', 'Section heading', ''),
          area('body', 'Section text', ''),
        ], [
          { heading: '[Section heading 1]', body: '[Paragraph]' },
          { heading: '[Section heading 2]', body: '[Paragraph]' },
        ]),
      ],
    },
  ],
});

export const CONTENT_PAGES = [
  {
    id: 'global', label: 'Business info & contact', path: null, group: 'Whole website',
    intro: 'Shown on every page: top bar, footer, contact page, forms and Google previews.',
    sections: [
      {
        title: 'Contact details',
        fields: [
          text('tagline', 'Top bar tagline', 'Football agency · Canada'),
          text('region', 'Country / region', 'Canada'),
          text('address', 'Office address', '[Office address]'),
          text('email', 'Email address', 'info@bojas.com', { inputType: 'email' }),
          text('phone', 'Phone number (optional)', ''),
          text('headerCta', 'Header button label', 'Get scouted'),
          text('footerBlurb', 'Footer description', 'Football agency developing young talent into professional players.'),
        ],
      },
      {
        title: 'Social media (leave empty to hide)',
        fields: [
          url('instagram', 'Instagram link', ''),
          url('x', 'X / Twitter link', ''),
          url('linkedin', 'LinkedIn link', ''),
          url('facebook', 'Facebook link', ''),
          url('youtube', 'YouTube link', ''),
        ],
      },
      {
        title: 'Search & sharing',
        fields: [
          text('seoTitle', 'Browser tab / Google title', 'BOJAS — Football Agency in Canada', { max: 120 }),
          text('seoDescription', 'Google description', 'Football (soccer) agency in Canada. We scout and develop young players for MLS and European football.', { max: 300 }),
          image('shareImage', 'Link preview image', 'When the website link is shared on WhatsApp, Facebook, LinkedIn or X', 1200, 630),
        ],
      },
    ],
  },
  {
    id: 'agent', label: 'Agent profile', path: '/about/', group: 'Whole website',
    intro: 'The lead agent shown on the Home page ("About us" block), the About page profile and as the author of the guides.',
    sections: [
      {
        title: 'Name & titles',
        fields: [
          text('name', 'Agent full name', '[Agent name]', { max: 80, help: 'Shown as the big name on About, in the Home "About us" headline and as the guide author.' }),
          text('roleLabel', 'Role label', 'Lead agent', { max: 60, help: 'Small label under the portrait, e.g. "Lead agent" or "Founder & FIFA agent".' }),
          text('titles', 'Professional titles', 'FIFA Agent · UEFA Licensed Coach', { max: 160, help: 'Shown in gold above the name on About and on the portrait banner on Home. Separate titles with " · ".' }),
        ],
      },
      {
        title: 'Portrait',
        fields: [image('portrait', 'Agent portrait', 'Home → "About us" block (left) and About → agent profile (left)', 1200, 1100)],
      },
      {
        title: 'Biography & quote',
        fields: [
          area('bio', 'Biography (About page)', 'A life dedicated to football and to understanding how players develop, travelling to leading European clubs and learning from elite player coaches, with one promise: the best representation for every client.\n\nCoaching badges and experience across age groups in professional European academies. Today the focus is single-minded: contracts, on- and off-field development, and relentless improvement.', { max: 4000 }),
          area('quote', 'Personal quote', 'I only work with select clients: players with a burning ambition to be the best.', { max: 300, help: 'Shown on Home and About. Leave empty to hide.' }),
        ],
      },
      {
        title: 'Licences & badges',
        note: 'Shown in the gold strip on the Home page and in the licence lists on Home and About.',
        fields: [list('credentials', 'Licences / badges', ['FIFA Agent Licence', '[Coaching licence]', '[Coaching award]', '[Other badge]'], { maxItems: 8 })],
      },
      {
        title: 'Contact (optional)',
        fields: [
          text('email', 'Agent email', '', { inputType: 'email', help: 'Shown on the About profile if filled in.' }),
          text('phone', 'Agent phone', '', { help: 'Shown on the About profile if filled in.' }),
          list('languages', 'Languages spoken', [], { maxItems: 8, help: 'Shown on the About profile if filled in.' }),
        ],
      },
    ],
  },
  {
    id: 'home', label: 'Home', path: '/', group: 'Pages',
    sections: [
      {
        title: 'Hero (top of page)',
        fields: [
          text('heroEyebrow', 'Small line above headline', 'Football agency · Canada'),
          text('heroTitle', 'Headline', 'Start your career in'),
          text('heroHighlight', 'Headline — gold word(s)', 'MLS'),
          text('heroTitleEnd', 'Headline — end', 'or Europe.'),
          area('heroLead', 'Intro text', 'We specialise in turning young talent into professional players: scouting, development, representation and contracts, all under one agency.'),
          text('heroPrimary', 'Gold button label', 'Player scouting form'),
          text('heroSecondary', 'Outline button label', 'Our services'),
        ],
      },
      {
        title: 'Scouting report card (right of hero)',
        fields: [
          image('heroImage', 'Card photo', 'Home → hero → photo inside the "Scouting report" card', 1000, 600),
          text('cardName', 'Player name on card', 'Player name'),
          text('cardMeta', 'Player details on card', 'Attacking Midfielder · Right foot · U17'),
          text('cardNumber', 'Shirt number on card', '10', { max: 3 }),
        ],
      },
      {
        title: 'Services',
        fields: [
          text('servicesEyebrow', 'Small label', 'Our services'),
          text('servicesTitle', 'Headline', 'Coaching & scouting experience'),
          cards('services', 'Service cards', [text('title', 'Title'), area('text', 'Text', '', { max: 600 })], [
            { title: 'Contract negotiations & career planning', text: 'For professionals and academy players signing a first pro deal. We handle every negotiation and extension.' },
            { title: 'Tactical & technical 1v1 sessions', text: 'Off-the-ball positioning, attacking and defending movement, and technical skill work, so every client keeps improving.' },
            { title: 'Career-oriented personal coaching', text: 'Life coaching, football law, handling the mental stress of the pro game, goal setting and self-esteem.' },
          ], { maxItems: 6 }),
        ],
      },
      {
        title: 'Licences & team',
        note: 'The licence list itself is edited in Business info & contact.',
        fields: [
          text('licencesTitle', 'Left box headline', 'Pro football licences'),
          text('teamTitle', 'Right box headline', 'Highly experienced team'),
          list('teamItems', 'Right box points', ['Extensive network with MLS, EPL and European clubs', 'Youth development through to professional level', 'Large scouting network of local and nationwide scouts']),
        ],
      },
      {
        title: 'Team sheet (light section)',
        note: 'The numbered list itself is edited on the Services page.',
        fields: [
          text('sheetEyebrow', 'Small label', 'The team sheet'),
          text('sheetTitle', 'Headline', 'This is how we can help you.'),
          area('sheetLead', 'Text', 'Ten areas we work on with every player, on the pitch and off it.', { max: 400 }),
        ],
      },
      {
        title: 'Two-column band',
        fields: [
          text('duoLeftTitle', 'Left headline', 'We connect you with the best coaches and academies.'),
          text('duoLeftLink', 'Left link label', 'Learn about the possibilities'),
          text('duoRightTitle', 'Right headline', 'We use leading technology to discover talent.'),
          text('duoRightLink', 'Right link label', 'View players'),
        ],
      },
      {
        title: 'Players & About teaser',
        fields: [
          text('playersEyebrow', 'Players — small label', 'Our players'),
          text('playersTitle', 'Players — headline', 'On the books'),
          text('aboutEyebrow', 'About — small label', 'About us'),
          text('aboutTitleSuffix', 'About — text after agent name', 'lead agent'),
          area('aboutLead', 'About — text', 'We specialise in player development and the strategic decisions that shape a career. Built on years of coaching, scouting and a worldwide network, our service runs 24/7, 365 days a year: technical, tactical and 1v1 sessions, mental support, contracts and career planning.'),
          text('aboutButton', 'About — button label', 'More about us'),
        ],
      },
      { title: 'Closing banner', fields: [...CTA('Start today. Submit your interest.', 'Player form'), text('ctaButton2', 'Second button', 'Contact us')] },
    ],
  },
  {
    id: 'about', label: 'About', path: '/about/', group: 'Pages',
    sections: [
      { title: 'Header', fields: [text('heroTitle', 'Page headline', 'We aim for perfection. We settle for excellence.')] },
      {
        title: 'What we offer',
        fields: [
          text('offerEyebrow', 'Small label', 'What we offer'),
          text('offerTitle', 'Headline', 'Development and strategy for your career'),
          area('offerText', 'Text', 'We specialise in player development and the strategic decisions behind a career, and clients often see radical change. Our lead agent has built that foundation through coaching, scouting and a worldwide network.\n\nOur service runs 24/7, 365 days a year: tactical, technical and 1v1 sessions, mental support, contract negotiations and career planning.'),
          cards('stats', 'Stat boxes', [text('big', 'Big number', '', { max: 12 }), text('small', 'Label')], [
            { big: '24/7', small: 'Player support' }, { big: '365', small: 'Days a year' }, { big: '1%', small: 'Select clients only' },
          ], { maxItems: 3 }),
        ],
      },
      { title: 'Guides', fields: [text('guidesTitle', 'Headline above guide cards', 'The pathway, explained')] },
      { title: 'Closing banner', fields: CTA('Ready for the 1%?', 'Submit your interest') },
    ],
  },
  {
    id: 'services', label: 'Services', path: '/services/', group: 'Pages',
    sections: [
      { title: 'Header', fields: [text('heroEyebrow', 'Small label', 'What we do'), text('heroTitle', 'Page headline', 'A platform for youth players to turn professional.'), text('heroLink', 'Link label', 'Find out more')] },
      {
        title: 'The pathway',
        fields: [
          text('pathEyebrow', 'Small label', 'Opportunities'),
          text('pathTitle', 'Headline', 'The pathway'),
          cards('pathway', 'Stages', [text('stage', 'Stage label'), text('title', 'Title'), area('text', 'Text', '', { max: 600 })], [
            { stage: 'Stage 1: Scout', title: 'Identifying a talent', text: 'We scout constantly, using our own scouting technology to identify target players and focus on their development. There is no fixed age: it is about potential and raw talent.' },
            { stage: 'Stage 2: Shape', title: 'Shaping raw talent into a pro', text: 'Turning pro takes commitment whatever your talent. It is a full-time job and a continuous journey of development and self-belief.' },
            { stage: 'Stage 3: Improve', title: 'Tactical, technical & personal', text: "Constant work, on and off the pitch. We pinpoint the weaknesses in each player's profile and keep addressing them." },
          ], { maxItems: 6 }),
        ],
      },
      {
        title: 'All services list',
        note: 'This list also appears on the Home page team sheet.',
        fields: [text('listEyebrow', 'Small label', 'All services'), text('listTitle', 'Headline', 'This is how we can help you.'), list('helpAreas', 'Services', DEFAULT_HELP_AREAS, { maxItems: 16 })],
      },
      {
        title: 'Four pillars',
        fields: [
          text('pillarsEyebrow', 'Small label', 'Areas we focus on together'),
          text('pillarsTitle', 'Headline', 'Four pillars of a pro career'),
          area('pillarsLead', 'Text', 'The goal is simple: for our players to become successful professionals.', { max: 400 }),
          list('pillars', 'Pillar names (icons stay in this order: tactical, technical, 1-on-1, mental)', ['Tactical', 'Technical', '1-on-1 sessions', 'Mental preparation'], { maxItems: 4 }),
          text('pillarsButton', 'Button label', 'See coaching'),
        ],
      },
      { title: 'Closing banner', fields: [...CTA("We're accepting new players. Apply now.", 'Player form'), text('ctaButton2', 'Second button', 'Contact us')] },
    ],
  },
  {
    id: 'coaching', label: 'Coaching', path: '/coaching/', group: 'Pages',
    sections: [
      {
        title: 'Header',
        fields: [
          text('heroTitle', 'Headline', 'Tactical positioning. Technical sessions.'),
          text('heroHighlight', 'Headline — gold end', '1-on-1.'),
          area('heroLead', 'Intro text', 'We work with young players on their development, learning their style of play and identity to get the most out of their growth.', { max: 600 }),
          text('heroLink', 'Link label', 'Find out more'),
          image('heroImage', 'Header photo (optional — replaces the tactics board drawing)', 'Coaching → right side of the header', 1200, 800),
        ],
      },
      {
        title: 'Session types',
        fields: [
          text('sessionsTitle', 'Headline', 'Session types'),
          cards('sessions', 'Sessions', [text('tag', 'Small label'), text('title', 'Title'), area('text', 'Text', '', { max: 600 }), text('duration', 'Duration'), text('price', 'Price')], [
            { tag: 'Tactical', title: 'Positioning & movement', text: 'Off-the-ball positioning, attacking runs and defensive shape, so you read the game a second earlier.', duration: '[DURATION]', price: '[PRICE]' },
            { tag: 'Technical', title: 'Skill development', text: 'First touch, both feet, passing range and finishing: the details that separate academy players from pros.', duration: '[DURATION]', price: '[PRICE]' },
            { tag: '1-on-1', title: 'Personal coaching', text: 'Individual work built around your profile. Strengths sharpened, weaknesses addressed, mindset trained.', duration: '[DURATION]', price: '[PRICE]' },
          ], { maxItems: 6 }),
        ],
      },
      {
        title: 'Identity band (light section)',
        fields: [text('identityTitle', 'Headline', 'Your identity on the pitch, made clear.'), area('identityText', 'Text', 'Every programme starts with your style of play: what you represent as a player, how you fit into a team, and where you want to be in three to five years.', { max: 600 })],
      },
      { title: 'Closing banner', fields: CTA("We're accepting new players.", 'Contact us') },
    ],
  },
  {
    id: 'players', label: 'Players page', path: '/players/', group: 'Pages',
    intro: 'Player profiles themselves are managed under Players in the admin menu.',
    sections: [
      { title: 'Header', fields: [text('heroTitle', 'Headline', 'Our players'), area('heroLead', 'Intro text', 'Young players we scout, develop and represent on their way to MLS and European football.', { max: 400 }), text('emptyText', 'Text when no players are published', 'No player profiles are published yet. Check back soon.')] },
      { title: 'Closing banners', fields: [...CTA('Want your profile here?', 'Submit player form'), text('profileCtaTitle', 'Banner on each player profile', 'Clubs and scouts: ask about this player.'), text('profileCtaButton', 'Button on each player profile', 'Contact the agency')] },
    ],
  },
  {
    id: 'forms', label: 'Player forms', path: '/player-form/', group: 'Pages',
    intro: 'Shared by all four forms: Comprehensive, OPDL, League1 Ontario and Ligue1 Québec.',
    sections: [
      {
        title: 'Header',
        fields: [
          text('eyebrow', 'Small label', 'Youth & amateur players'),
          text('title', 'Headline', 'Player intake form'),
          area('lead', 'Intro text', 'Submit your interest and highlights so our team can scout your talent.', { max: 400 }),
          text('linkLabel', 'Link to guide (label)', 'How does a FIFA agent help my career in Canada?'),
        ],
      },
      { title: 'Last step', fields: [area('privacy', 'Privacy & conditions text', 'All information you share with BOJAS, whether verbal, electronic, written or in any other form, is held in strict confidence by both parties and stays confidential after any coaching, representation or other work has ended.', { max: 2000 }), text('consent', 'Agreement checkbox text', 'I agree to the terms and conditions')] },
    ],
  },
  {
    id: 'contact', label: 'Contact', path: '/contact/', group: 'Pages',
    intro: 'Address, email, phone and social links are edited in Business info & contact.',
    sections: [
      {
        title: 'Page text',
        fields: [
          text('eyebrow', 'Small label', 'Contact'),
          text('title', 'Headline', 'Start today. Talk to us.'),
          area('lead', 'Intro text', 'Players, clubs and scouts: send a message and our team will get back to you. Want to be scouted? Use the player form instead.', { max: 600 }),
          text('formTitle', 'Form headline', 'Send a message'),
        ],
      },
      {
        title: 'Map',
        fields: [url('mapEmbed', 'Google Maps embed link', '', { prefix: 'https://www.google.com/maps/embed', help: 'Google Maps → find the office → Share → Embed a map → copy only the link inside src="…" (starts with https://www.google.com/maps/embed). Empty = no map.' })],
      },
    ],
  },
  {
    id: 'thankyou', label: 'Thank-you page', path: '/thank-you/', group: 'Pages',
    sections: [
      { title: 'After the player form', fields: [text('playerTitle', 'Headline', 'Application received.'), area('playerLead', 'Text', 'Thanks for submitting your player form. Our scouting team will review your profile and highlights.', { max: 600 }), list('playerSteps', 'What happens next', ['Our team reviews your form, self-ratings and highlights.', 'If there is a fit, we contact you by phone or email.', 'We arrange a conversation, and a session if needed, to plan your next steps.'], { maxItems: 6 })] },
      { title: 'After the contact form', fields: [text('contactTitle', 'Headline', 'Message sent.'), area('contactLead', 'Text', 'Thanks for getting in touch. A member of our team will reply to your message.', { max: 600 }), list('contactSteps', 'What happens next', ['We read every message that comes in.', 'We reply by email or phone using the details you gave us.'], { maxItems: 6 })] },
    ],
  },
  article('guide1', 1, 'working-with-fifa-agent-in-canada', 'Working with a FIFA agent in Canada', 'How working with a FIFA licensed agent benefits a young player’s soccer career in Canada.'),
  article('guide2', 2, 'becoming-professional-soccer-player-in-canada', 'What it takes to become a first-team player in Canada', 'What is required to become a first team soccer player in Canada.'),
  article('guide3', 3, 'why-only-few-make-it-professional-in-canada', 'Why only a few make it professional in Canada', 'Why only a few young players make it to professional soccer in Canada.'),
];

// Values saved before the Agent profile page existed (kept so nothing is lost).
export const LEGACY_SOURCES = {
  agent: {
    name: ['global', 'agentName'],
    titles: ['global', 'agentRoles'],
    quote: ['global', 'agentQuote'],
    portrait: ['global', 'agentPortrait'],
    credentials: ['global', 'credentials'],
    bio: ['about', 'bio'],
  },
};

// Old default texts that mentioned parents. If a saved value still equals the old
// default, the new default is shown instead.
export const RETIRED_DEFAULTS = {
  contact: { lead: ['Players, parents and clubs: send a message and our team will get back to you. Want to be scouted? Use the player form instead.'] },
  thankyou: { playerSteps: [['Our team reviews your form, self-ratings and highlights.', 'If there is a fit, we contact you or your parent by phone or email.', 'We arrange a conversation, and a session if needed, to plan your next steps.']] },
};

export const PAGE_IDS = CONTENT_PAGES.map((p) => p.id);
export const getPageDef = (id) => CONTENT_PAGES.find((p) => p.id === id);
export const pageFields = (id) => (getPageDef(id)?.sections || []).flatMap((s) => s.fields);

export function pageDefaults(id) {
  return Object.fromEntries(pageFields(id).map((f) => [f.key, structuredClone(f.default)]));
}

// Every image slot on the site, for the admin "Photos" overview.
export function allImageSlots() {
  return CONTENT_PAGES.flatMap((p) => pageFields(p.id).filter((f) => f.type === 'image').map((f) => ({ page: p, field: f })));
}

// Player profile photo spec (used in the player editor).
export const PLAYER_PHOTO = { where: 'Players page cards and the top of each player profile', w: 1200, h: 1020 };
