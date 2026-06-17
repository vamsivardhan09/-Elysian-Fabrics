import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = 
    process.env.GOOGLE_CLIENT_ID !== undefined && 
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET !== undefined && 
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0;
    
  const isProduction = process.env.NODE_ENV === 'production';
    
  return NextResponse.json({ 
    configured: isConfigured, 
    isProduction: isProduction 
  });
}
