const { PrismaClient } = require('@prisma/client');

async function testProductionDatabase() {
  console.log('🔍 Testando conexão Neon em modo produção...\n');
  
  // Simular ambiente de produção
  process.env.NODE_ENV = 'production';
  
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    console.log('📊 Environment Info:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- Database URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
    
    // 1. Test connection
    console.log('\n🔗 1. Testing connection...');
    const startTime = Date.now();
    await prisma.$connect();
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connected in ${connectionTime}ms`);
    
    // 2. Test query performance
    console.log('\n⚡ 2. Testing query performance...');
    const queryStart = Date.now();
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        pg_database_size(current_database()) as size_bytes
    `;
    const queryTime = Date.now() - queryStart;
    
    console.log(`✅ Query executed in ${queryTime}ms`);
    console.log('📊 Database Info:', result[0]);
    
    // 3. Test CRUD operations
    console.log('\n🧪 3. Testing CRUD performance...');
    
    // Create
    const createStart = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `test-prod-${Date.now()}@example.com`,
        name: 'Production Test User',
        passwordHash: '$2b$12$test',
        role: 'BIKE_OWNER'
      }
    });
    const createTime = Date.now() - createStart;
    console.log(`✅ CREATE: ${createTime}ms`);
    
    // Read
    const readStart = Date.now();
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    const readTime = Date.now() - readStart;
    console.log(`✅ READ: ${readTime}ms`);
    
    // Update
    const updateStart = Date.now();
    await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Production User' }
    });
    const updateTime = Date.now() - updateStart;
    console.log(`✅ UPDATE: ${updateTime}ms`);
    
    // Delete
    const deleteStart = Date.now();
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    const deleteTime = Date.now() - deleteStart;
    console.log(`✅ DELETE: ${deleteTime}ms`);
    
    // 4. Test connection pooling
    console.log('\n🏊 4. Testing connection pooling...');
    const poolPromises = Array(5).fill().map(async (_, i) => {
      const start = Date.now();
      await prisma.user.count();
      return Date.now() - start;
    });
    
    const poolTimes = await Promise.all(poolPromises);
    const avgPoolTime = poolTimes.reduce((a, b) => a + b, 0) / poolTimes.length;
    console.log(`✅ Concurrent queries avg: ${avgPoolTime.toFixed(1)}ms`);
    
    // 5. Test migrations status
    console.log('\n📋 5. Checking migrations status...');
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 3
    `;
    console.log('✅ Latest migrations:', migrations);
    
    console.log('\n🎉 All production database tests passed!');
    console.log('\n📊 Performance Summary:');
    console.log(`- Connection: ${connectionTime}ms`);
    console.log(`- Query: ${queryTime}ms`);
    console.log(`- CRUD avg: ${((createTime + readTime + updateTime + deleteTime) / 4).toFixed(1)}ms`);
    console.log(`- Pool avg: ${avgPoolTime.toFixed(1)}ms`);
    
    // Performance recommendations
    if (connectionTime > 1000) {
      console.log('\n⚠️  Connection time > 1s - Consider upgrading Neon tier');
    }
    if (avgPoolTime > 500) {
      console.log('\n⚠️  Pool queries > 500ms - Monitor in production');
    }
    
  } catch (error) {
    console.error('❌ Production database test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionDatabase();