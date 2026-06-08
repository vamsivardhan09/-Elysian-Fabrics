import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, code } = body;

    if (!email || !password || !name || !code) {
      return NextResponse.json({ error: 'Name, email, password, and OTP code are required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Verify OTP Code
    const activeToken = await prisma.otpToken.findFirst({
      where: {
        email: trimmedEmail,
        code: code.trim(),
        expiresAt: { gt: new Date() }
      }
    });

    if (!activeToken) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Clean up OTP token
    await prisma.otpToken.delete({
      where: { id: activeToken.id }
    });

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: name.trim(),
        role: 'USER' // Defaults to USER role
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to register customer:", error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
