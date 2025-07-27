const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLatestToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    // Buscar o token mais recente (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const latestTokens = await prisma.passwordResetToken.findMany({
      where: { 
        userId: user.id,
        createdAt: { gte: fiveMinutesAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    console.log('🔍 Tokens criados nos últimos 5 minutos:', latestTokens.length);
    
    if (latestTokens.length > 0) {
      latestTokens.forEach((token, index) => {
        console.log(`🔑 Token ${index + 1}:`, {
          token: token.token.substring(0, 20) + '...',
          criado: token.createdAt,
          expira: token.expiresAt,
          usado: token.isUsed
        });
      });
      
      console.log('');
      console.log('🔗 URL do token mais recente:');
      console.log(`http://localhost:3003/Auth/reset-password?token=${latestTokens[0].token}`);
    } else {
      console.log('❌ Nenhum token recente encontrado');
      
      // Mostrar todos os tokens do usuário
      const allTokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('📋 Últimos 5 tokens do usuário:', allTokens.length);
      allTokens.forEach((token, index) => {
        console.log(`   ${index + 1}. ${token.createdAt.toISOString()} - Usado: ${token.isUsed}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestToken();