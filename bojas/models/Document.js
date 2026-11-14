import mongoose from 'mongoose';

// PDF documents uploaded in the admin panel (e.g. an agent's licence).
// Kept separate from photos so a PDF can never be served as an image or the other way round.
const DocumentSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true, default: 'application/pdf' },
    filename: { type: String, default: 'document.pdf' },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
