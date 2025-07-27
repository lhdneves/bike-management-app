const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUserLogin() {
  try {
    const email = 'neves.luiz.h@gmail.com';
    const newPassword = 'bike123'; // Senha temporária
    
    console.log('🔧 Corrigindo problema de login para:', email);
    
    // 1. Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.name);
    console.log('   ID:', user.id);
    console.log('   Tem senha:', !!user.passwordHash);
    
    // 2. Gerar hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // 3. Atualizar senha do usuário
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', newPassword);
    
    // 4. Verificar tokens de reset existentes
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('🔑 Tokens de reset existentes:', resetTokens.length);
    
    if (resetTokens.length > 0) {
      // Marcar tokens antigos como usados
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, isUsed: false },
        data: { isUsed: true, usedAt: new Date() }
      });
      console.log('✅ Tokens antigos marcados como usados');
    }
    
    // 5. Testar o login
    console.log('\n🧪 Testando login...');
    const testUser = await prisma.user.findUnique({
      where: { email }
    });
    
    const isValidPassword = await bcrypt.compare(newPassword, testUser.passwordHash);
    
    if (isValidPassword) {
      console.log('✅ Login funcionando corretamente!');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. Acesse: http://localhost:3003/Auth/login');
      console.log('2. Email:', email);
      console.log('3. Senha:', newPassword);
      console.log('4. Após login, vá em perfil/configurações para alterar a senha');
    } else {
      console.log('❌ Erro no teste de login');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserLogin();