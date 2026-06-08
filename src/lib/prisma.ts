import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Self-healing database connection: automatically rewrite port 6543 (pooler) 
// to port 5432 (direct) to bypass connection timeouts on deployed platforms.
const getCleanDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes(':6543')) {
    console.log('[Prisma] Auto-rewriting pooler port 6543 to direct port 5432...');
    return url.replace(':6543', ':5432').replace('pgbouncer=true', 'sslmode=require');
  }
  return url;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getCleanDatabaseUrl(),
      },
    },
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
