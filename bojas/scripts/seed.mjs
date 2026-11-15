// Adds the two demo players (John Smile, Chris Tucker) to MongoDB.
// Usage: npm run seed   (reads MONGODB_URI from .env.local)
// Safe to run more than once: existing slugs are skipped.
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing. Create .env.local from .env.example first.');
  process.exit(1);
}

const now = new Date();
const demo = [
  {
    name: 'John Smile', slug: 'john-smile', number: 10, position: 'Attacking Midfielder', age: 17,
    nationality: 'Canada', foot: 'Right', height: '175 cm', weight: '66 kg', club: 'Demo Academy U17',
    status: 'Open to trials', highlights: '',
    bio: 'Demo profile. A creative number 10 who finds pockets between the lines and plays forward early. Working on his defensive work rate and physical strength ahead of a first professional contract.',
    strengths: ['Vision', 'Key passes', 'Receiving under pressure', 'Set pieces'],
    ratings: [
      { label: 'Vision', value: 8 }, { label: 'Key passes', value: 8 }, { label: 'Dribbling', value: 7 },
      { label: 'Decision making', value: 7 }, { label: 'Speed', value: 6 }, { label: 'Stamina', value: 6 },
    ],
    photoId: null, published: true, order: 1,
  },
  {
    name: 'Chris Tucker', slug: 'chris-tucker', number: 4, position: 'Centre Back', age: 18,
    nationality: 'Canada', foot: 'Left', height: '188 cm', weight: '80 kg', club: 'Demo FC Reserves',
    status: 'Represented', highlights: '',
    bio: 'Demo profile. A left-footed centre back who is comfortable stepping into midfield with the ball. Strong in the air and calm under pressure, now building consistency at senior level.',
    strengths: ['Aerial duels', 'Passing out from the back', 'Reading the game', 'Leadership'],
    ratings: [
      { label: 'Aerial duels', value: 8 }, { label: 'Reading the game', value: 8 }, { label: 'Passing', value: 7 },
      { label: 'Positioning', value: 7 }, { label: 'Acceleration', value: 6 }, { label: 'Agility', value: 6 },
    ],
    photoId: null, published: true, order: 2,
  },
];

await mongoose.connect(uri);
const players = mongoose.connection.collection('players');
await players.createIndex({ slug: 1 }, { unique: true });
for (const p of demo) {
  const res = await players.updateOne(
    { slug: p.slug },
    { $setOnInsert: { ...p, createdAt: now, updatedAt: now } },
    { upsert: true }
  );
  console.log(res.upsertedCount ? `Added ${p.name}` : `Skipped ${p.name} (already exists)`);
}
await mongoose.disconnect();
