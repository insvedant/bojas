import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema(
  { label: { type: String, required: true, trim: true }, value: { type: Number, required: true, min: 1, max: 10 } },
  { _id: false }
);

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    number: { type: Number, min: 0, max: 99 },
    position: { type: String, trim: true, default: '' },
    age: { type: Number, min: 5, max: 60 },
    nationality: { type: String, trim: true, default: '' },
    foot: { type: String, enum: ['Left', 'Right', 'Both', ''], default: '' },
    height: { type: String, trim: true, default: '' },
    weight: { type: String, trim: true, default: '' },
    club: { type: String, trim: true, default: '' },
    status: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    highlights: { type: String, trim: true, default: '' },
    strengths: { type: [String], default: [] },
    ratings: { type: [RatingSchema], default: [] },
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
