import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, explainDbError } from '@/lib/db';
import { requireAdminApi } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Open /api/admin/health/ while signed in to check the database connection.
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  const env = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    AUTH_SECRET: (process.env.AUTH_SECRET || '').length >= 32,
  };
  const start = Date.now();
  try {
    await connectDB();
    await mongoose.connection.db.admin().ping();
    return NextResponse.json({ database: 'connected', name: mongoose.connection.name, ms: Date.now() - start, env });
  } catch (err) {
    return NextResponse.json({ database: 'error', error: explainDbError(err), ms: Date.now() - start, env }, { status: 500 });
  }
}
