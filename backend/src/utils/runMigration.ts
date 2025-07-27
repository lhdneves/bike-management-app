import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Running password reset tokens migration...');
    
    // Check if table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
      );
    `;

    console.log('Table exists check:', tableExists);

    // Create the password_reset_tokens table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "user_id" UUID NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ(6) NOT NULL,
        "is_used" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
        "used_at" TIMESTAMPTZ(6)
      );
    `;

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id" 
      ON "password_reset_tokens"("user_id");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_expires_at" 
      ON "password_reset_tokens"("expires_at");
    `;

    // Add foreign key constraint if it doesn't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'password_reset_tokens_user_id_fkey'
        ) THEN
          ALTER TABLE "password_reset_tokens" 
          ADD CONSTRAINT "password_reset_tokens_user_id_fkey" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `;

    console.log('✅ Migration completed successfully!');
    
    // Test the new table
    const tokenCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM password_reset_tokens;
    `;
    console.log('✅ Password reset tokens table created and accessible. Count:', tokenCount);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();