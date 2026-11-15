import mongoose from 'mongoose';

// Reuse one connection across hot reloads and serverless invocations.
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Add it in your hosting environment variables and redeploy.');
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Fail fast with a clear error instead of hanging when Atlas is unreachable.
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        maxPoolSize: 5,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Turns low-level MongoDB errors into something an admin can act on.
export function explainDbError(err) {
  const m = String(err?.message || err);
  if (/MONGODB_URI is not set/.test(m)) return m;
  if (/bad auth|authentication failed/i.test(m)) return 'MongoDB rejected the username or password in MONGODB_URI. Check the database user in Atlas → Database Access (and that <db_password> was replaced).';
  if (/ENOTFOUND|querySrv|Invalid scheme|URI must|mongodb\+srv/i.test(m)) return 'MONGODB_URI looks wrong (the cluster address could not be found). Copy it again from Atlas → Connect → Drivers.';
  if (/timed out|Server selection|ECONNREFUSED|whitelist|not authorized.*IP/i.test(m)) return 'MongoDB Atlas did not respond. In Atlas → Network Access, allow 0.0.0.0/0, then try again.';
  return `Database error: ${m}`;
}
