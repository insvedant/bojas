import mongoose from 'mongoose';

// One document per editable page (see lib/contentSchema.js). `data` holds only
// the values that were edited; anything missing falls back to the default.
const SiteContentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
