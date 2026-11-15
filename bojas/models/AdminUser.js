import mongoose from 'mongoose';

// Admin panel accounts (created in Admin → Users). The ADMIN_EMAIL/ADMIN_PASSWORD
// environment account is the separate "Owner" login and is not stored here.
const AdminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
    active: { type: Boolean, default: true },
    // Bumped on password reset / deactivation so existing sessions stop working.
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
