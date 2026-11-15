export const MAX_ACCOUNTS = 5; // agent/admin logins stored in the database (the Owner login is extra)

export const serializeUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active !== false,
  lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
});
