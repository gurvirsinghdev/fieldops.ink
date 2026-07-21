import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/client";

const globalForPrismaClient = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = globalForPrismaClient.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrismaClient.prisma = prisma;
}
export default prisma;
