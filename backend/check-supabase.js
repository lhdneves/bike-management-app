const { PrismaClient } = require('@prisma/client');

async function checkSupabase() {
  console.log('🔍 Verificando banco Supabase...\n');
  
  // Conectar diretamente no Supabase
  const supabaseUrl = "postgresql://postgres:zFamAEqUXg5O5JNT@db.fhakdgespslknabguesp.supabase.co:5432/postgres";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: supabaseUrl
      }
    }
  });
  
  try {
    // Verificar conexão
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user
    `;
    
    console.log('📊 Conectado em:', result[0]);
    
    // Verificar usuários
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('\n👥 Usuários no Supabase:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Criado em: ${user.createdAt}`);
    });
    
    if (users.length === 0) {
      console.log('✅ Nenhum usuário encontrado no Supabase (banco vazio)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar no Supabase:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabase();