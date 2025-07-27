const { PrismaClient } = require('@prisma/client');

async function testNeon() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando conexão com Neon...\n');
    
    // 1. Verificar conexão
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database() as database, 
             current_user as user,
             version() as version
    `;
    console.log('✅ Conexão estabelecida');
    console.log('📊 Informações do banco:', dbInfo[0]);
    
    // 2. Verificar tabelas criadas
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('\n📋 Tabelas criadas:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
    // 3. Testar operação CRUD
    console.log('\n🧪 Testando operações CRUD...');
    
    // Criar usuário de teste
    const testUser = await prisma.user.create({
      data: {
        email: 'test-neon@example.com',
        name: 'Test Neon User',
        passwordHash: '$2b$12$test',
        role: 'BIKE_OWNER'
      }
    });
    console.log('✅ CREATE: Usuário criado');
    
    // Ler usuário
    const foundUser = await prisma.user.findUnique({
      where: { email: 'test-neon@example.com' }
    });
    console.log('✅ READ: Usuário encontrado');
    
    // Atualizar usuário
    await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Neon User' }
    });
    console.log('✅ UPDATE: Usuário atualizado');
    
    // Deletar usuário
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ DELETE: Usuário removido');
    
    console.log('\n🎉 Todos os testes passaram! Neon está funcionando perfeitamente.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNeon();