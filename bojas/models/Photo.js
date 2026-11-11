import mongoose from 'mongoose';

// Player photos are stored in MongoDB (resized in the browser before upload),
// so no separate file storage service is needed.
const PhotoSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
