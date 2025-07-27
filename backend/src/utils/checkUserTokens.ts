import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserTokens() {
  try {
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        user: {
          email: 'neves.luiz.h@gmail.com'
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
    
    console.log(`📊 Tokens encontrados para neves.luiz.h@gmail.com: ${tokens.length}`);
    
    tokens.forEach((token, index) => {
      console.log(`\n${index + 1}. Token: ${token.token}`);
      console.log(`   Criado: ${token.createdAt}`);
      console.log(`   Expira: ${token.expiresAt}`);
      console.log(`   Usado: ${token.isUsed}`);
      
      const isValid = !token.isUsed && new Date() < token.expiresAt;
      console.log(`   Status: ${isValid ? '✅ VÁLIDO' : '❌ EXPIRADO/USADO'}`);
      
      if (isValid) {
        console.log(`   🔗 URL de teste: http://localhost:3003/Auth/reset-password?token=${token.token}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTokens();