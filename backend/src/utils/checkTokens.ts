import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTokens() {
  try {
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        user: {
          email: 'delivered@resend.dev'
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📊 Found ${tokens.length} password reset tokens for delivered@resend.dev:`);
    
    tokens.forEach((token, index) => {
      console.log(`\n${index + 1}. Token: ${token.token}`);
      console.log(`   Created: ${token.createdAt}`);
      console.log(`   Expires: ${token.expiresAt}`);
      console.log(`   Used: ${token.isUsed}`);
      console.log(`   User: ${token.user.name} (${token.user.email})`);
      
      // Show if token is still valid
      const isValid = !token.isUsed && new Date() < token.expiresAt;
      console.log(`   Status: ${isValid ? '✅ VALID' : '❌ EXPIRED/USED'}`);
    });
    
    if (tokens.length > 0) {
      const latestToken = tokens[0];
      const isValid = !latestToken.isUsed && new Date() < latestToken.expiresAt;
      
      if (isValid) {
        console.log(`\n🔗 Test URL: http://localhost:3000/Auth/reset-password?token=${latestToken.token}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();