const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getValidToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    // Get valid tokens (not used and not expired)
    const validTokens = await prisma.passwordResetToken.findMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (validTokens.length > 0) {
      const token = validTokens[0];
      console.log('✅ Valid token found:');
      console.log(`Token: ${token.token}`);
      console.log(`Created: ${token.createdAt.toISOString()}`);
      console.log(`Expires: ${token.expiresAt.toISOString()}`);
      console.log('');
      console.log('🔗 Test URL:');
      console.log(`http://localhost:3003/Auth/reset-password?token=${token.token}`);
    } else {
      console.log('❌ No valid tokens found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getValidToken();