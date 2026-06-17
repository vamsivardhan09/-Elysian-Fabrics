import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Run a fast raw query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ connected: true });
  } catch (error: any) {
    console.warn('[db-status API] Database connection test failed:', error.message || error);
    return NextResponse.json({ 
      connected: false, 
      error: error.message || 'Database connection failed' 
    });
  }
}
