import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = 
    process.env.GOOGLE_CLIENT_ID !== undefined && 
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET !== undefined && 
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0;
    
  return NextResponse.json({ configured: isConfigured });
}
