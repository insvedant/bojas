// Single source of truth for the form fields.
// Used by the React forms AND by scripts/generate-netlify-forms.mjs, which writes
// public/__forms.html so Netlify can detect every field at deploy time.

export const COUNTRIES = ['Canada','Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan','The Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo, Democratic Republic of the','Congo, Republic of the','Costa Rica','Côte d’Ivoire','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','East Timor (Timor-Leste)','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','The Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Korea, North','Korea, South','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia, Federated States of','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar (Burma)','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway','Oman','Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','Spain','Sri Lanka','Sudan','Sudan, South','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'];

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const AGES = [...range(8, 30).map(String), 'Over 31'];
export const HEIGHTS = [...range(100, 211).map((n) => `${n} cm`), 'Over 212 cm'];
export const WEIGHTS = [...range(30, 99).map((n) => `${n} kg`), 'Over 99 kg'];
export const POSITIONS = ['Goalkeeper','Right Back','Centre Back','Left Back','Defensive Midfielder','Midfielder','Attacking Midfielder','Right Midfielder','Left Midfielder','Striker','Centre Forward'];
export const FEET = ['Left', 'Right', 'Both'];

export const IDENTITY_QUESTIONS = [
  { name: 'strengths', label: 'Attributes you are good at', placeholder: 'e.g. decision making, positioning, technique, finishing' },
  { name: 'improvements', label: 'Attributes you need to work on', placeholder: 'e.g. communication, teamwork, confidence, speed of action' },
  { name: 'identity', label: 'What do you represent as an individual?', placeholder: 'Your style of play. What are your super strengths?' },
  { name: 'team_fit', label: 'How will your playing identity fit into a team?', placeholder: 'Breaking lines, through passes, key runs, hold-up play…' },
  { name: 'goals', label: 'Where do you see yourself in 3–5 years?', placeholder: 'Your long-term goal. Is it clear?' },
];

// Self-rating groups (1–10). Each label becomes a field named rating_<slug>.
export const RATING_GROUPS = [
  { title: 'Technical & mental', items: ['Passing','Shooting','Heading','Receiving the ball','Using both feet','Long shots','Dribbling','Key passes','Crossing','Playing under pressure','Teamwork','Temperament','Personality','Determination','Awareness','Decision making','Reaction to setbacks'] },
  { title: 'Physical', items: ['Aggression','Ball protection','Speed','Aerial duels','Jumping reach','Agility','Stamina','Balance','Power','Acceleration'] },
  { title: 'Tactical', items: ['Running with the ball','Moves to beat an opponent','Change of direction','Positioning','Vision','Reading the game','Anticipation','Losing your marker'] },
  { title: 'Lifestyle & balance', items: ['Career','Family','Friends','Interests and passions','Fitness','Weight and diet','Sleep quality','Energy level','Spiritual or religion','Time management','School and life balance','Organisation','Self-discipline','Clarity of goals','Stress level','Bad habits'] },
];

export const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
export const ratingName = (label) => `rating_${slug(label)}`;

export const PLAYER_FORM_FIELDS = [
  'form_type',
  'first_name', 'last_name', 'nationality', 'age', 'height', 'weight', 'preferred_foot', 'position', 'current_club',
  ...IDENTITY_QUESTIONS.map((q) => q.name),
  ...RATING_GROUPS.flatMap((g) => g.items.map(ratingName)),
  'parent_name', 'parent_phone', 'email', 'phone', 'highlights_url', 'eu_passport', 'consent',
];

export const CONTACT_FORM_FIELDS = ['full_name', 'role', 'email', 'phone', 'message'];
