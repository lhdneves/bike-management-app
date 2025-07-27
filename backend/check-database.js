const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Verificando qual banco está sendo usado...\n');
  
  // Mostrar variáveis de ambiente
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('DIRECT_URL:', process.env.DIRECT_URL);
  
  const prisma = new PrismaClient({
    log: ['query'],
  });
  
  try {
    // Verificar conexão
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server,
        version() as version
    `;
    
    console.log('\n📊 Informações da conexão:');
    console.log(result[0]);
    
    // Verificar usuários
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('\n👥 Últimos usuários cadastrados:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Criado em: ${user.createdAt}`);
    });
    
    // Identificar o banco
    const isNeon = result[0].version.includes('Neon');
    const isSupabase = result[0].server?.toString().includes('supabase');
    
    console.log('\n🏷️ Banco identificado:');
    if (isNeon || result[0].database === 'neondb') {
      console.log('✅ NEON Database');
    } else if (isSupabase || result[0].database === 'postgres') {
      console.log('⚠️  SUPABASE Database');
    } else {
      console.log('❓ Banco desconhecido');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Forçar reload das variáveis de ambiente
require('dotenv').config({ override: true });

checkDatabase();