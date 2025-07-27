const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTokens() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Mark all tokens as used to clear rate limit
    const result = await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false
      },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });
    
    console.log(`✅ Marked ${result.count} tokens as used`);
    console.log('Rate limit cleared! You can now request a new password reset.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTokens();