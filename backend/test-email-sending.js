const emailService = require('./dist/services/emailService.js').default;

async function testPasswordResetEmail() {
  try {
    console.log('📧 Testando envio direto de email de reset...');
    
    const testToken = 'test-token-' + Date.now();
    
    console.log('🔧 Configuração atual do email service:', emailService.getHealthStatus());
    
    console.log('📤 Enviando email de reset...');
    const result = await emailService.sendPasswordResetEmail(
      'neves.luiz.h@gmail.com',
      'Luiz Neves',
      testToken
    );
    
    console.log('✅ Resultado do envio:', result);
    
    if (result.success) {
      console.log('🎉 Email enviado com sucesso!');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Falha no envio:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPasswordResetEmail();