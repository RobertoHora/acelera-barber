import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString && !process.env.ELEVA_BACKEND_ORIGIN) throw new Error('DATABASE_URL must be explicitly configured.');
if (process.env.NODE_ENV === 'test' && !/\/(eleva_agenda_test|eleva_agenda_e2e)(?:[?]|$)/.test(connectionString||'')) {
  throw new Error('Tests require an explicitly isolated eleva_agenda_test or eleva_agenda_e2e database.');
}

const pool = globalForPrisma.pool ?? new Pool({ connectionString:connectionString||'postgresql://disabled@127.0.0.1:1/disabled',connectionTimeoutMillis:1000 });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;
