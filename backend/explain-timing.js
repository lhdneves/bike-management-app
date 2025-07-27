function explainTiming() {
  console.log('⏰ TIMING DO SISTEMA DE LEMBRETES DE MANUTENÇÃO');
  console.log('='.repeat(60));
  
  console.log('\n📋 CONFIGURAÇÃO ATUAL:');
  console.log('   Cron Expression: 0 9 * * * (Todo dia às 9:00)');
  console.log('   Timezone: America/Sao_Paulo');
  console.log('   Ambiente: Development');
  console.log('   Enabled: true');
  
  console.log('\n🕐 QUANDO O SISTEMA EXECUTA:');
  console.log('   1. AUTOMÁTICO: Todo dia às 09:00 (horário de Brasília)');
  console.log('   2. MANUAL: Via API POST /api/jobs/cron/trigger');
  console.log('   3. STARTUP: Uma vez ao iniciar em modo development');
  
  const now = new Date();
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(9, 0, 0, 0);
  
  if (now.getHours() >= 9) {
    // Se já passou das 9h hoje, próxima execução é amanhã
    console.log('\n📅 PRÓXIMA EXECUÇÃO AUTOMÁTICA:');
    console.log(`   Data: ${nextRun.toLocaleDateString('pt-BR')}`);
    console.log(`   Hora: ${nextRun.toLocaleTimeString('pt-BR')}`);
    
    const hoursUntil = Math.ceil((nextRun.getTime() - now.getTime()) / (1000 * 60 * 60));
    console.log(`   Em: ${hoursUntil} horas`);
  } else {
    // Ainda não passou das 9h hoje
    const todayRun = new Date();
    todayRun.setHours(9, 0, 0, 0);
    
    console.log('\n📅 PRÓXIMA EXECUÇÃO AUTOMÁTICA:');
    console.log(`   Data: HOJE ${todayRun.toLocaleDateString('pt-BR')}`);
    console.log(`   Hora: ${todayRun.toLocaleTimeString('pt-BR')}`);
    
    const hoursUntil = Math.ceil((todayRun.getTime() - now.getTime()) / (1000 * 60 * 60));
    console.log(`   Em: ${hoursUntil} horas`);
  }
  
  console.log('\n🚀 PARA TESTE IMEDIATO:');
  console.log('   curl -X POST http://localhost:3001/api/jobs/cron/trigger');
  console.log('   ↳ Executa AGORA (não precisa esperar às 9h)');
  
  console.log('\n📧 LÓGICA DE ENVIO:');
  console.log('   ✅ Envia IMEDIATO: Se data do lembrete já passou');
  console.log('   ⏰ Agenda: Se data do lembrete é futura');
  console.log('   🚫 Pula: Se já enviou lembrete para esta manutenção');
  
  console.log('\n💡 EXEMPLO PRÁTICO:');
  console.log('   - Você cria manutenção para 30/07 com lembrete 2 dias antes');
  console.log('   - Sistema deveria enviar em 28/07');
  console.log('   - Se hoje é 28/07 ou depois: ENVIA IMEDIATO');
  console.log('   - Se hoje é 27/07: AGENDA para amanhã');
  
  console.log('\n⚙️ CONFIGURAÇÕES PERSONALIZÁVEIS:');
  console.log('   MAINTENANCE_REMINDER_CRON=0 9 * * * (no .env)');
  console.log('   ↳ Para mudar horário: 0 14 * * * (14:00 todo dia)');
  console.log('   ↳ Para cada 6 horas: 0 */6 * * * (6h, 12h, 18h, 0h)');
  console.log('   ↳ Para apenas dias úteis: 0 9 * * 1-5 (seg-sex)');
}

explainTiming();