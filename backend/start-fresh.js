// Force reload environment variables and start server
require('dotenv').config({ override: true });

console.log('🔄 Starting server with fresh environment...');
console.log('📊 Database URL:', process.env.DATABASE_URL);

// Verify it's Neon
if (process.env.DATABASE_URL.includes('neon.tech')) {
  console.log('✅ Using Neon database');
} else if (process.env.DATABASE_URL.includes('supabase')) {
  console.error('❌ ERROR: Still using Supabase!');
  process.exit(1);
} else {
  console.warn('⚠️  Unknown database provider');
}

// Start the server
require('./dist/index.js');