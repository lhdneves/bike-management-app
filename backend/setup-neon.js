const { PrismaClient } = require('@prisma/client');

async function setupNeon() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Configurando banco Neon...');
    
    // Habilitar extensão UUID
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log('✅ Extensão UUID habilitada');
    
    // Verificar conexão
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Conexão estabelecida com Neon');
    console.log('📊 Versão do PostgreSQL:', result[0].version);
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupNeon();