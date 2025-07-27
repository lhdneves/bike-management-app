import { PrismaClient } from '@prisma/client';

// Use test database URL or fall back to main database with test schema
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 
  process.env.DATABASE_URL || 
  'postgresql://postgres:zFamAEqUXg5O5JNT@db.fhakdgespslknabguesp.supabase.co:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl
    }
  }
});

beforeAll(async () => {
  // Connect to database
  await prisma.$connect();
  
  // Clean up any existing test data
  await cleanupTestData();
  
  // Create test users and basic data
  await seedTestData();
});

beforeEach(async () => {
  // Clean up data before each test to ensure isolation
  await cleanupTransactionalData();
});

afterAll(async () => {
  // Final cleanup
  await cleanupTestData();
  await prisma.$disconnect();
});

async function cleanupTestData() {
  // Delete in correct order to respect foreign key constraints
  await prisma.emailLog.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.userEmailPreference.deleteMany({});
  await prisma.scheduledMaintenance.deleteMany({});
  await prisma.maintenanceRecord.deleteMany({});
  await prisma.component.deleteMany({});
  await prisma.bike.deleteMany({});
  await prisma.mechanic.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test'
      }
    }
  });
}

async function cleanupTransactionalData() {
  // Only clean data that changes between tests
  await prisma.emailLog.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.scheduledMaintenance.deleteMany({
    where: {
      serviceDescription: {
        contains: 'TEST'
      }
    }
  });
  await prisma.maintenanceRecord.deleteMany({
    where: {
      serviceDescription: {
        contains: 'TEST'
      }
    }
  });
}

async function seedTestData() {
  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: '$2b$12$testhashedpassword',
      role: 'BIKE_OWNER'
    }
  });

  // Create test bike
  const testBike = await prisma.bike.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      ownerId: testUser.id,
      name: 'Test Bike',
      description: 'Test bike for testing',
      manufacturer: 'Test Manufacturer',
      type: 'MOUNTAIN_BIKE',
      tractionType: 'MANUAL'
    }
  });

  // Create email preferences
  await prisma.userEmailPreference.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      maintenanceReminders: true,
      reminderFrequency: 'immediate'
    }
  });
}

export { prisma };