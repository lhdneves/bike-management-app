const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTokens() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Check all tokens for this user
    const allTokens = await prisma.passwordResetToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Total tokens for user: ${allTokens.length}`);
    
    // Check tokens in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Tokens in last hour: ${recentTokens.length}`);
    
    if (recentTokens.length > 0) {
      console.log('Recent tokens:');
      recentTokens.forEach((token, i) => {
        console.log(`  ${i+1}. ${token.token.substring(0, 8)}... (${token.createdAt.toISOString()})`);
      });
    }
    
    // Check rate limit
    const rateLimit = parseInt(process.env.PASSWORD_RESET_RATE_LIMIT || '3');
    console.log(`Rate limit: ${rateLimit}`);
    console.log(`Rate limit exceeded: ${recentTokens.length >= rateLimit ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();