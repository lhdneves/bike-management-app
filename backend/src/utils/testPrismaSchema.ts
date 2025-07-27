import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSchema() {
  try {
    // Test if the PasswordResetToken model is available
    console.log('Testing Prisma schema...');
    
    // This would only work if the schema is properly generated
    const tokenCount = await prisma.passwordResetToken.count();
    console.log(`✅ PasswordResetToken table accessible. Current count: ${tokenCount}`);
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSchema();