const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUrgentMaintenance() {
  try {
    console.log('🔧 Corrigindo manutenção urgente...');
    
    // Deletar a manutenção com data errada
    await prisma.scheduledMaintenance.deleteMany({
      where: { serviceDescription: { contains: 'URGENTE' } }
    });
    
    console.log('🗑️ Manutenção antiga removida');
    
    const bike = await prisma.bike.findFirst();
    
    // Criar manutenção para HOJE - corretamente
    const today = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Final do dia de hoje
    
    console.log('📅 Nova data: HOJE final do dia');
    console.log('   Data exata:', todayEnd.toLocaleString('pt-BR'));
    
    const maintenance = await prisma.scheduledMaintenance.create({
      data: {
        bikeId: bike.id,
        scheduledDate: todayEnd,
        serviceDescription: '🚨 URGENTE HOJE - Troca de pneu',
        notificationDaysBefore: 0, // 0 dias = HOJE
        isCompleted: false
      }
    });
    
    console.log('✅ Nova manutenção criada:', maintenance.id);
    
    // Testar scan imediato
    console.log('\n🧪 Testando scan...');
    
    const response = await fetch('http://localhost:3001/api/jobs/cron/trigger', {
      method: 'POST'
    });
    
    const data = await response.json();
    console.log('📧 Trigger result:', data);
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar resultado
    const statsResponse = await fetch('http://localhost:3001/api/jobs/queue/stats');
    const stats = await statsResponse.json();
    
    console.log('📊 Queue stats:', stats.stats);
    
    // Verificar email log
    const emailLog = await prisma.emailLog.findFirst({
      where: { scheduledMaintenanceId: maintenance.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (emailLog) {
      console.log('✅ Email enviado!', {
        status: emailLog.status,
        enviado: emailLog.sentAt
      });
    } else {
      console.log('❌ Nenhum email encontrado para esta manutenção');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUrgentMaintenance();