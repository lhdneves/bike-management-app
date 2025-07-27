const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createResetToken() {
  try {
    const email = 'neves.luiz.h@gmail.com';
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expira em 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Criar token de reset
    const passwordReset = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: expiresAt,
        isUsed: false
      }
    });
    
    console.log('✅ Token de reset criado com sucesso!');
    console.log('🔑 Token:', resetToken.substring(0, 20) + '...');
    console.log('⏰ Expira em:', expiresAt);
    console.log('');
    console.log('🔗 URL completa para reset:');
    console.log(`http://localhost:3003/Auth/reset-password?token=${resetToken}`);
    console.log('');
    console.log('📋 OU use as credenciais já corrigidas:');
    console.log('   Email: neves.luiz.h@gmail.com');
    console.log('   Senha: bike123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createResetToken();