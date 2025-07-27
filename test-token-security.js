const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTokenSecurity() {
  try {
    // Get recent tokens to check randomness
    const recentTokens = await prisma.passwordResetToken.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { token: true }
    });
    
    console.log('🔐 Token Security Analysis:');
    console.log('================================');
    
    if (recentTokens.length >= 2) {
      console.log(`✅ Token Length: ${recentTokens[0].token.length} characters`);
      console.log(`✅ Token Format: Hexadecimal (${/^[a-f0-9]+$/i.test(recentTokens[0].token) ? 'VALID' : 'INVALID'})`);
      
      // Check uniqueness
      const uniqueTokens = new Set(recentTokens.map(t => t.token));
      console.log(`✅ Token Uniqueness: ${uniqueTokens.size}/${recentTokens.length} unique tokens`);
      
      // Check entropy (basic test)
      const token = recentTokens[0].token;
      const charCount = {};
      for (let char of token) {
        charCount[char] = (charCount[char] || 0) + 1;
      }
      const entropy = Object.keys(charCount).length;
      console.log(`✅ Character Diversity: ${entropy}/16 possible hex chars used`);
      
      console.log('\n🔑 Recent Tokens (first 16 chars):');
      recentTokens.forEach((t, i) => {
        console.log(`  ${i+1}. ${t.token.substring(0, 16)}...`);
      });
    } else {
      console.log('❌ Not enough tokens to analyze');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTokenSecurity();