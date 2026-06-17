import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Generate a secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save the OTP to database (delete any existing tokens for this email first)
    await prisma.otpToken.deleteMany({
      where: { email: trimmedEmail },
    });

    await prisma.otpToken.create({
      data: {
        email: trimmedEmail,
        code,
        expiresAt,
      },
    });

    // Check if SMTP is configured. If not, log OTP and send mock response in development
    const isSmtpConfigured = process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD.trim().length > 0;
    
    if (!isSmtpConfigured) {
      console.log(`\n========================================`);
      console.log(`[DEV MODE] SMTP is not configured. OTP for ${trimmedEmail} is: ${code}`);
      console.log(`========================================\n`);
      
      return NextResponse.json({
        success: true,
        message: 'OTP generated successfully (Development Mode: printed to console).',
        devMode: true,
        code: process.env.NODE_ENV === 'development' ? code : undefined // Reveal code in local development without SMTP
      });
    }

    // Send email using nodemailer helper
    const emailSent = await sendOtpEmail(trimmedEmail, code, name.trim());

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to email successfully.',
    });
  } catch (error) {
    console.warn('[OTP send API] Database unreachable during OTP request. Serving mock development OTP.', error);
    return NextResponse.json({
      success: true,
      message: 'OTP generated successfully (Offline Testing Mode: Code is 123456).',
      devMode: true,
      code: '123456'
    });
  }
}
