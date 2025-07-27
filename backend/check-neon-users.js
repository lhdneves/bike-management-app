const { PrismaClient } = require('@prisma/client');

async function checkNeonUsers() {
  console.log('🔍 Verificando usuários no Neon...\n');
  
  // Forçar reload do .env
  require('dotenv').config({ override: true });
  
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total de usuários no Neon: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 Usuários encontrados:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ID: ${user.id}`);
      });
    } else {
      console.log('⚠️  Nenhum usuário no Neon!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNeonUsers();