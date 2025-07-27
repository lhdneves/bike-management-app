import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const testEmail = 'delivered@resend.dev'; // Email de teste do Resend
    const testPassword = 'testPassword123';
    
    // Hash the password
    const passwordHash = await bcrypt.hash(testPassword, 12);
    
    // Create test user
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {},
      create: {
        name: 'Test User for Resend',
        email: testEmail,
        passwordHash: passwordHash,
        role: 'BIKE_OWNER'
      }
    });
    
    console.log('✅ Test user created/updated:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`🔑 Password: ${testPassword} (for testing)`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();