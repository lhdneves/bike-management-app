import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(email: string) {
  try {
    console.log(`🔍 Verificando usuário: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log(`👤 Nome: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👑 Role: ${user.role}`);
      console.log(`📅 Criado: ${user.createdAt}`);
      console.log(`🆔 ID: ${user.id}`);
      
      // Check for recent password reset tokens
      const tokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      
      console.log(`\n🎫 Tokens de reset encontrados: ${tokens.length}`);
      tokens.forEach((token, index) => {
        const isValid = !token.isUsed && new Date() < token.expiresAt;
        console.log(`${index + 1}. ${token.token.substring(0, 20)}... (${isValid ? 'VÁLIDO' : 'EXPIRADO/USADO'})`);
      });
      
    } else {
      console.log('❌ Usuário NÃO encontrado no banco de dados');
      console.log('💡 O email não está cadastrado no sistema');
      
      // Search for similar emails
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: email.split('@')[0] // Search by username part
          }
        },
        select: {
          email: true,
          name: true
        },
        take: 5
      });
      
      if (similarUsers.length > 0) {
        console.log('\n🔍 Usuários similares encontrados:');
        similarUsers.forEach(u => console.log(`📧 ${u.email} (${u.name})`));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check the specific email
checkUser('neves.luiz.h@gmail.com');