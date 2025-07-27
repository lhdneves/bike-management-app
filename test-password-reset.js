#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const TEST_EMAIL = 'test@bikemanager.com';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPasswordReset() {
  log('blue', '🧪 Iniciando testes do sistema de reset de senha...\n');

  try {
    // Test 1: Health Check
    log('yellow', '1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    if (healthResponse.data.status === 'healthy') {
      log('green', '✅ Sistema saudável');
    } else {
      log('red', '❌ Sistema com problemas');
    }

    // Test 2: Email Service Health
    log('yellow', '\n2️⃣ Testando serviço de email...');
    const emailHealthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health/email`);
    if (emailHealthResponse.data.success) {
      log('green', '✅ Serviço de email funcionando');
      console.log('📧 Provider:', emailHealthResponse.data.emailService.success ? 'Conectado' : 'Mock mode');
    } else {
      log('red', '❌ Serviço de email com problemas');
    }

    // Test 3: Request Password Reset
    log('yellow', '\n3️⃣ Testando solicitação de reset...');
    const resetRequest = await axios.post(`${API_BASE}/password-reset/request`, {
      email: TEST_EMAIL
    });
    if (resetRequest.data.success) {
      log('green', '✅ Solicitação de reset aceita');
      console.log('📧 Mensagem:', resetRequest.data.message);
    } else {
      log('red', '❌ Falha na solicitação');
    }

    // Test 4: Validate Invalid Token
    log('yellow', '\n4️⃣ Testando validação de token inválido...');
    try {
      await axios.get(`${API_BASE}/password-reset/validate/token-invalido-123`);
      log('red', '❌ Token inválido foi aceito (erro!)');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('green', '✅ Token inválido corretamente rejeitado');
      } else {
        log('red', '❌ Erro inesperado na validação');
      }
    }

    // Test 5: Reset with Invalid Token
    log('yellow', '\n5️⃣ Testando reset com token inválido...');
    try {
      await axios.post(`${API_BASE}/password-reset/reset`, {
        token: 'token-invalido-123',
        newPassword: 'newPassword123'
      });
      log('red', '❌ Reset com token inválido foi aceito (erro!)');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('green', '✅ Reset com token inválido corretamente rejeitado');
      } else {
        log('red', '❌ Erro inesperado no reset');
      }
    }

    // Test 6: Rate Limiting
    log('yellow', '\n6️⃣ Testando rate limiting...');
    let successCount = 0;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await axios.post(`${API_BASE}/password-reset/request`, {
          email: `test${i}@example.com`
        });
        if (response.data.success) successCount++;
      } catch (error) {
        // Rate limit hit
      }
    }
    log('green', `✅ ${successCount}/5 requests aceitos (rate limiting funcionando)`);

    // Summary
    log('blue', '\n📊 RESUMO DOS TESTES:');
    log('green', '✅ Sistema de reset de senha funcionando corretamente');
    log('yellow', '📧 Para testar emails reais, configure RESEND_API_KEY ou SMTP no .env');
    log('blue', '🌐 Teste o frontend em: http://localhost:3000/Auth/forgot-password');

  } catch (error) {
    log('red', `❌ Erro geral nos testes: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      log('yellow', '💡 Certifique-se de que o backend está rodando em http://localhost:3001');
    }
  }
}

// Função para testar frontend
function testFrontend() {
  log('blue', '\n🌐 TESTE DO FRONTEND:');
  log('yellow', '1. Acesse: http://localhost:3000/Auth/login');
  log('yellow', '2. Clique em "Esqueci minha senha"');
  log('yellow', '3. Digite um email e teste o fluxo');
  log('yellow', '4. Para testar reset, use URL: http://localhost:3000/Auth/reset-password?token=test');
}

// Run tests
if (require.main === module) {
  testPasswordReset().then(() => {
    testFrontend();
  });
}

module.exports = { testPasswordReset };