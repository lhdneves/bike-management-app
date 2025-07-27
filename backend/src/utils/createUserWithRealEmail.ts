import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUserWithRealEmail() {
  try {
    const email = 'neves.luiz.h@gmail.com';
    const name = 'Luiz Neves';
    const password = 'testPassword123'; // Senha temporária para teste
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: {
        name: name,
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        role: 'BIKE_OWNER'
      }
    });
    
    console.log('✅ Usuário criado/atualizado:');
    console.log(`👤 Nome: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`🔑 Senha temporária: ${password}`);
    console.log('\n🚀 Agora você pode testar o reset de senha!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserWithRealEmail();