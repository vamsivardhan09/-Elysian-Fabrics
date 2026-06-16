import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
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
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        const email = user.email?.trim().toLowerCase();
        if (!email) {
          console.log('[NextAuth] Google sign in failed: missing email in profile');
          return false;
        }

        try {
          // Check if user exists in the database
          let existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (!existingUser) {
            console.log('[NextAuth] Creating new user for Google login:', email);
            
            // Auto-assign ADMIN role to owner emails
            const role = (email === 'vamsivardhan0918@gmail.com' || email === 'vv727457@gmail.com') ? 'ADMIN' : 'USER';
            
            existingUser = await prisma.user.create({
              data: {
                email,
                name: user.name || 'Google User',
                password: await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10), // secure random password
                role: role
              }
            });
            console.log('[NextAuth] Google user registered in DB with role:', role);
          } else {
            console.log('[NextAuth] Google user exists in DB:', email, 'with role:', existingUser.role);
          }

          // Attach database fields to user object for the jwt callback
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.name = existingUser.name;
        } catch (error: any) {
          console.error('[NextAuth] Error syncing Google user in DB:', error.message || error);
          return false; // Block sign-in if db write fails
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (token.email && !token.role) {
        // Fallback session lookup for OAuth sessions
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.trim().toLowerCase() }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch {
          // Ignore DB connection errors in token sign-ins
        }
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

