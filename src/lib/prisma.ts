import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Lazy proxy - only creates the PrismaClient when first accessed at runtime,
// preventing the pg.Pool from hanging during next build on Vercel
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    const client = globalForPrisma.prisma;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
