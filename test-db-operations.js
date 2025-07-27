const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseOperations() {
  try {
    console.log('🗄️ Database Operations Test');
    console.log('============================\n');
    
    // Test 1: Check schema constraints
    console.log('1. Testing Schema Constraints:');
    
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    // Test token creation with required fields
    const token = 'test-token-' + Date.now();
    const futureDate = new Date(Date.now() + 3600000);
    
    const newToken = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: token,
        expiresAt: futureDate
      }
    });
    
    console.log('✅ Token created with all required fields');
    
    // Test 2: Index performance
    console.log('\n2. Testing Index Usage:');
    
    const start = Date.now();
    const tokenByToken = await prisma.passwordResetToken.findFirst({
      where: { token: token }
    });
    const tokenSearchTime = Date.now() - start;
    
    console.log(`✅ Token lookup by token: ${tokenSearchTime}ms (should be fast with index)`);
    
    const start2 = Date.now();
    const tokensByUser = await prisma.passwordResetToken.findMany({
      where: { userId: user.id }
    });
    const userSearchTime = Date.now() - start2;
    
    console.log(`✅ Token lookup by user: ${userSearchTime}ms (${tokensByUser.length} tokens found)`);
    
    // Test 3: Cleanup
    await prisma.passwordResetToken.delete({
      where: { id: newToken.id }
    });
    
    console.log('✅ Test token cleaned up');
    
    // Test 4: Data integrity
    console.log('\n3. Testing Data Integrity:');
    
    const allTokens = await prisma.passwordResetToken.findMany({
      where: { userId: user.id },
      include: { user: true }
    });
    
    const hasValidRelations = allTokens.every(token => 
      token.user && token.user.id === user.id
    );
    
    console.log(`✅ User relations: ${hasValidRelations ? 'VALID' : 'INVALID'}`);
    
    // Test 5: Expiration logic
    const expiredCount = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() }
      }
    });
    
    const validCount = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
        isUsed: false
      }
    });
    
    console.log(`✅ Token status: ${validCount} valid, ${expiredCount} expired`);
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseOperations();