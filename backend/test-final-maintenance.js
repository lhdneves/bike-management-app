const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFinalMaintenance() {
  try {
    console.log('🎯 Teste final - manutenção para amanhã com lembrete hoje...');
    
    const bike = await prisma.bike.findFirst();
    
    // Deletar manutenções de teste anteriores
    await prisma.scheduledMaintenance.deleteMany({
      where: { 
        OR: [
          { serviceDescription: { contains: 'URGENTE' } },
          { serviceDescription: { contains: 'TESTE FINAL' } }
        ]
      }
    });
    
    // Criar para amanhã às 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    console.log('📅 Data: AMANHÃ às 10:00');
    console.log('   Data exata:', tomorrow.toLocaleString('pt-BR'));
    console.log('⏰ Lembrete: 1 dia antes (HOJE)');
    
    const maintenance = await prisma.scheduledMaintenance.create({
      data: {
        bikeId: bike.id,
        scheduledDate: tomorrow,
        serviceDescription: '🔥 TESTE FINAL - Revisão completa',
        notificationDaysBefore: 1, // 1 dia antes = hoje
        isCompleted: false
      }
    });
    
    console.log('✅ Manutenção criada:', maintenance.id);
    
    // Aguardar 1 segundo e disparar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🚀 Disparando scan...');
    const response = await fetch('http://localhost:3001/api/jobs/cron/trigger', {
      method: 'POST'
    });
    
    console.log('📧 Response:', await response.json());
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar stats
    const statsResponse = await fetch('http://localhost:3001/api/jobs/queue/stats');
    const stats = await statsResponse.json();
    
    console.log('📊 Queue stats antes/depois:', stats.stats);
    
    // Verificar email
    const emailLog = await prisma.emailLog.findFirst({
      where: { scheduledMaintenanceId: maintenance.id }
    });
    
    if (emailLog) {
      console.log('✅ SUCESSO! Email enviado:', {
        id: emailLog.id,
        status: emailLog.status,
        enviado: emailLog.sentAt?.toLocaleString('pt-BR')
      });
    } else {
      console.log('❌ Email não foi enviado');
      
      // Debug final
      console.log('\n🔍 Debug final - verificando logs...');
      const allLogs = await prisma.emailLog.findMany({
        where: { userId: bike.ownerId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('📧 Últimos 5 emails do usuário:');
      allLogs.forEach((log, i) => {
        console.log(`   ${i+1}. ${log.emailType} - ${log.status} - ${log.createdAt.toLocaleString('pt-BR')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFinalMaintenance();