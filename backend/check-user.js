const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    if (user) {
      console.log('✅ Usuário encontrado:', {
        id: user.id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        createdAt: user.createdAt
      });
    } else {
      console.log('❌ Usuário não encontrado com email: neves.luiz.h@gmail.com');
      
      // Ver todos os usuários
      const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true }
      });
      console.log('📋 Todos os usuários:', allUsers);
    }

    // Verificar tokens de reset de senha
    const passwordResets = await prisma.passwordResetToken.findMany({
      where: { email: 'neves.luiz.h@gmail.com' },
      orderBy: { createdAt: 'desc' }
    });
    console.log('🔑 Tokens de reset:', passwordResets.length);
    
    if (passwordResets.length > 0) {
      console.log('   Último token:', {
        token: passwordResets[0].token.substring(0, 10) + '...',
        usado: passwordResets[0].used,
        criado: passwordResets[0].createdAt,
        expira: passwordResets[0].expiresAt
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();