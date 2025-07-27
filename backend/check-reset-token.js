const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkResetToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    const latestToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, isUsed: false },
      orderBy: { createdAt: 'desc' }
    });
    
    if (latestToken) {
      console.log('🔑 Token de reset criado:', {
        token: latestToken.token.substring(0, 20) + '...',
        expira: latestToken.expiresAt,
        usado: latestToken.isUsed
      });
      console.log('🔗 URL de reset:');
      console.log('http://localhost:3003/Auth/reset-password?token=' + latestToken.token);
    } else {
      console.log('❌ Nenhum token válido encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkResetToken();