const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function createExpiredToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Create an already expired token
    const expiredToken = crypto.randomBytes(32).toString('hex');
    const expiredTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: expiredToken,
        expiresAt: expiredTime
      }
    });
    
    console.log('✅ Expired token created for testing');
    console.log(`Token: ${expiredToken}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createExpiredToken();