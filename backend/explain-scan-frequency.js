function explainScanFrequency() {
  console.log('🔍 FREQUÊNCIA DE SCANS DO SISTEMA');
  console.log('='.repeat(50));
  
  console.log('\n📋 EXISTEM 2 TIPOS DE SCAN:');
  
  console.log('\n1️⃣ SCAN DE MANUTENÇÕES (MaintenanceReminderCron):');
  console.log('   ⏰ Frequência: 1x por dia às 09:00');
  console.log('   🎯 Função: Procura novas manutenções que precisam de lembrete');
  console.log('   📧 Ação: Adiciona jobs de email na fila');
  console.log('   ⚙️ Configurável via: MAINTENANCE_REMINDER_CRON');
  
  console.log('\n2️⃣ SCAN DA FILA DE EMAILS (EmailQueueMemory):');
  console.log('   ⏰ Frequência: A cada 5 segundos');
  console.log('   🎯 Função: Processa emails agendados na fila');
  console.log('   📧 Ação: Envia emails que estão prontos');
  console.log('   ⚙️ Fixo: 5000ms (não configurável)');
  
  console.log('\n🔄 FLUXO COMPLETO:');
  console.log('   1. 09:00 → MaintenanceReminderCron roda');
  console.log('   2. 09:00 → Encontra manutenções que precisam de lembrete');
  console.log('   3. 09:00 → Adiciona job na EmailQueue');
  console.log('   4. 09:00:05 → EmailQueueMemory processa (5s depois)');
  console.log('   5. 09:00:05 → Email enviado!');
  
  console.log('\n⚡ PROCESSAMENTO EM TEMPO REAL:');
  console.log('   - Trigger manual → Imediato');
  console.log('   - Job adicionado → Processado em até 5 segundos');
  console.log('   - Email enviado → Logs atualizados instantaneamente');
  
  console.log('\n📊 EXEMPLO PRÁTICO:');
  const now = new Date();
  console.log(`   Agora: ${now.toLocaleTimeString('pt-BR')}`);
  console.log('   ↓');
  console.log('   Você faz trigger manual agora');
  console.log('   ↓');
  console.log('   Sistema encontra manutenções (imediato)');
  console.log('   ↓');
  console.log('   Adiciona jobs na fila (imediato)');
  console.log('   ↓');
  console.log('   Próximo scan da fila: em até 5 segundos');
  console.log('   ↓');
  console.log('   Email enviado!');
  
  console.log('\n🎛️ CONFIGURAÇÕES:');
  console.log('   EmailQueue scan: 5000ms (hardcoded)');
  console.log('   MaintenanceCron: 0 9 * * * (configurável)');
  console.log('   Queue concurrency: 5 emails simultâneos');
  
  console.log('\n🔧 PARA DEVELOPMENT:');
  console.log('   - Sistema roda scan inicial no startup');
  console.log('   - Triggers manuais funcionam a qualquer momento');
  console.log('   - Fila processa a cada 5 segundos sempre');
  
  console.log('\n📈 MONITORAMENTO:');
  console.log('   curl http://localhost:3001/api/jobs/queue/stats');
  console.log('   ↳ Mostra quantos jobs estão sendo processados');
  console.log('   curl http://localhost:3001/api/jobs/cron/status'); 
  console.log('   ↳ Mostra se o cron está ativo e próxima execução');
}

explainScanFrequency();