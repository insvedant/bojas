import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  { text: { type: String, maxlength: 2000 }, by: String, email: String, at: { type: Date, default: Date.now } },
  { _id: false }
);

// Player form and contact form entries from the website.
const SubmissionSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['player', 'contact'], required: true, index: true },
    formLabel: { type: String, default: '' }, // e.g. "Comprehensive form", "Contact form"
    name: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, index: true },
    phone: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // every field the visitor filled in
    source: {
      page: String, // page the form was sent from
      landingPage: String, // first page of the visit
      referrer: String, // site the visitor came from (Google, Instagram…)
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
      country: String,
      region: String,
      city: String,
      ip: String,
      userAgent: String,
      secondsToComplete: Number,
    },
    spam: { type: Boolean, default: false, index: true },
    spamReasons: { type: [String], default: [] },
    status: { type: String, enum: ['new', 'reviewed', 'contacted', 'archived'], default: 'new', index: true },
    handledBy: { name: String, email: String, at: Date },
    notes: { type: [NoteSchema], default: [] },
  },
  { timestamps: true }
);

SubmissionSchema.index({ createdAt: -1 });
SubmissionSchema.index({ 'source.ip': 1, createdAt: -1 });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
