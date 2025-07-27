const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPasswordReset() {
  console.log('🔍 DEBUG: Password Reset System\n');
  
  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    console.log('👤 User found:', user ? '✅ YES' : '❌ NO');
    if (user) {
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
    }
    
    // 2. Check recent password reset tokens
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        userId: user?.id,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('\n🔑 Recent Password Reset Tokens:');
    if (tokens.length === 0) {
      console.log('   ❌ No tokens found in last 10 minutes');
    } else {
      tokens.forEach((token, index) => {
        console.log(`   ${index + 1}. Token: ${token.token.substring(0, 8)}...`);
        console.log(`      Created: ${token.createdAt.toISOString()}`);
        console.log(`      Expires: ${token.expiresAt.toISOString()}`);
        console.log(`      Used: ${token.isUsed ? '✅' : '❌'}`);
        console.log(`      Valid: ${token.expiresAt > new Date() && !token.isUsed ? '✅' : '❌'}`);
        console.log('');
      });
    }
    
    // 3. Test email service
    console.log('📧 Testing Email Service...');
    const emailService = require('./backend/src/services/emailService.js').default;
    const healthStatus = emailService.getHealthStatus();
    
    console.log('   Email Service Status:');
    console.log(`   - Configured: ${healthStatus.configured ? '✅' : '❌'}`);
    console.log(`   - Use Resend: ${healthStatus.useResend ? '✅' : '❌'}`);
    console.log(`   - From Email: ${healthStatus.fromEmail}`);
    
    // 4. Test connection
    try {
      const connectionTest = await emailService.testConnection();
      console.log(`   - Connection Test: ${connectionTest.success ? '✅' : '❌'}`);
      if (!connectionTest.success) {
        console.log(`     Error: ${connectionTest.error}`);
      }
    } catch (error) {
      console.log(`   - Connection Test: ❌ ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPasswordReset();