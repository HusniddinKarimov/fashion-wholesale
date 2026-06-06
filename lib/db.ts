import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // RDS PostgreSQL 15+ defaults to rds.force_ssl=1, so TLS is required.
  // Local dev (localhost) connects without SSL.
  const isLocal = !connectionString || /localhost|127\.0\.0\.1/.test(connectionString);
  const adapter = new PrismaPg({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
