// Test Supabase connection with Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test connection by counting users
    const userCount = await prisma.user.count();
    console.log(`✅ Connection successful! Found ${userCount} users in database.`);
    
    // Test fetching sample users
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Sample users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Test bikes count
    const bikeCount = await prisma.bike.count();
    console.log(`\n🚴 Found ${bikeCount} bikes in database.`);
    
    // Test mechanics count
    const mechanicCount = await prisma.mechanic.count();
    console.log(`🔧 Found ${mechanicCount} mechanics in database.`);
    
    console.log('\n🎉 All tests passed! Database is ready for development.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: Check your DATABASE_URL password in .env file');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Make sure you ran the SQL script in Supabase dashboard');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n💡 Tip: Check your internet connection and Supabase project URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();