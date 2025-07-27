async function testRealTimeScan() {
  console.log('⏱️ TESTE EM TEMPO REAL - FREQUÊNCIA DOS SCANS');
  console.log('='.repeat(60));
  
  // Função para timestamp
  const timestamp = () => new Date().toLocaleTimeString('pt-BR', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3 
  });
  
  console.log(`🕐 Iniciando teste às: ${timestamp()}`);
  
  // Função para checar stats
  async function checkStats() {
    try {
      const response = await fetch('http://localhost:3001/api/jobs/queue/stats');
      const data = await response.json();
      return data.stats.completed || 0;
    } catch (error) {
      return 'ERROR';
    }
  }
  
  // Stats inicial
  const initialCompleted = await checkStats();
  console.log(`📊 Jobs completados antes: ${initialCompleted}`);
  
  console.log(`\n🚀 Disparando trigger manual às: ${timestamp()}`);
  
  // Trigger manual
  try {
    const triggerResponse = await fetch('http://localhost:3001/api/jobs/cron/trigger', {
      method: 'POST'
    });
    const triggerData = await triggerResponse.json();
    console.log(`✅ Trigger response: ${triggerData.message}`);
  } catch (error) {
    console.log(`❌ Erro no trigger: ${error.message}`);
    return;
  }
  
  console.log(`\n🔍 Monitorando processamento da fila (scan a cada 5s):`);
  
  // Monitorar por 20 segundos
  for (let i = 0; i < 4; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const currentCompleted = await checkStats();
    const diff = currentCompleted - initialCompleted;
    
    console.log(`   ${timestamp()} → Jobs: ${currentCompleted} (+${diff} novos) ${diff > 0 ? '📧 EMAIL ENVIADO!' : '⏳ aguardando...'}`);
    
    if (diff > 0) {
      console.log(`\n🎉 CONFIRMADO: Email processado em ~${(i + 1) * 5} segundos após trigger!`);
      break;
    }
  }
  
  console.log(`\n📋 RESUMO DO TIMING:`);
  console.log(`   ⏰ Scan de manutenções: 1x por dia (09:00)`);
  console.log(`   ⚡ Scan da fila de emails: A cada 5 segundos`);
  console.log(`   🚀 Trigger manual: Processamento imediato`);
  console.log(`   📧 Envio real: Até 5 segundos após encontrar job`);
  
  console.log(`\n💡 CONCLUSÃO:`);
  console.log(`   Quando você cria um agendamento que precisa de lembrete HOJE:`);
  console.log(`   - Trigger automático: Próximo às 09:00 + até 5s = emails enviados às ~09:00:05`);
  console.log(`   - Trigger manual: Imediato + até 5s = emails enviados em ~5 segundos`);
}

testRealTimeScan();