import mongoose from 'mongoose';

const ChangeSchema = new mongoose.Schema({ field: String, from: String, to: String }, { _id: false });

// One row per action in the admin panel: who, what, when.
const AuditLogSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now, index: true },
    userId: { type: String, default: '' },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '', index: true },
    action: { type: String, required: true, index: true }, // e.g. player.update, content.update, auth.login
    target: { type: String, default: '' }, // e.g. "John Smile", "Home page"
    summary: { type: String, default: '' },
    changes: { type: [ChangeSchema], default: [] },
    ip: { type: String, default: '' },
  },
  { versionKey: false }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
