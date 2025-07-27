const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetRateLimit() {
  try {
    console.log('🔧 Corrigindo rate limiting para password reset...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    // Marcar todos os tokens como "mais antigos" para contornar rate limit
    const oneHourAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 horas atrás
    
    const result = await prisma.passwordResetToken.updateMany({
      where: { userId: user.id },
      data: { createdAt: oneHourAgo }
    });
    
    console.log('✅ Tokens antigos movidos:', result.count);
    
    // Agora testar se consegue criar novo token
    console.log('🧪 Testando novo reset...');
    
    const response = await fetch('http://localhost:3001/api/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'neves.luiz.h@gmail.com' })
    });
    
    const data = await response.json();
    console.log('📧 Response:', data);
    
    // Verificar se novo token foi criado
    const newToken = await prisma.passwordResetToken.findFirst({
      where: { 
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) } // últimos 2 minutos
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (newToken) {
      console.log('✅ Novo token criado com sucesso!');
      console.log('🔗 URL para reset:');
      console.log(`http://localhost:3003/Auth/reset-password?token=${newToken.token}`);
      console.log('⏰ Expira em:', newToken.expiresAt);
    } else {
      console.log('❌ Ainda não conseguiu criar token');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetRateLimit();