const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTokens() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Delete all old tokens
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        createdAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000) // Older than 5 minutes
        }
      }
    });
    
    console.log(`✅ Deleted ${result.count} old tokens`);
    console.log('Rate limit cleared! You can now request a new password reset.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTokens();