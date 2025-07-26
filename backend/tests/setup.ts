import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:zFamAEqUXg5O5JNT@db.fhakdgespslknabguesp.supabase.co:5432/postgres'
    }
  }
});

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };