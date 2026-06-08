import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[NextAuth] Login attempt for email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing email or password in request.');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.trim().toLowerCase() }
          });

          console.log('[NextAuth] Database query complete. User found in DB:', !!user);
          if (!user) {
            console.log('[NextAuth] Authentication failed: User not found in database.');
            return null;
          }

          // Support both hashed comparison and unhashed fallback
          const isHashedMatch = await bcrypt.compare(credentials.password, user.password).catch(() => false);
          const isPlaintextMatch = user.password === credentials.password;
          const isPasswordValid = isHashedMatch || isPlaintextMatch;

          console.log('[NextAuth] Password checks: Hashed match:', isHashedMatch, '| Plaintext match:', isPlaintextMatch);

          if (isPasswordValid) {
            console.log('[NextAuth] Authentication successful for:', user.email, 'with role:', user.role);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          console.log('[NextAuth] Authentication failed: Password incorrect.');
          return null;
        } catch (error: any) {
          console.error('[NextAuth] Database connection or query error during login:', error.message || error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_demo"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

