const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUrgentMaintenance() {
  try {
    console.log('🔍 Investigando por que a manutenção urgente não foi processada...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'neves.luiz.h@gmail.com' }
    });
    
    // Buscar a manutenção urgente
    const urgentMaintenance = await prisma.scheduledMaintenance.findFirst({
      where: { serviceDescription: { contains: 'URGENTE' } },
      include: { bike: { include: { owner: true } } }
    });
    
    if (!urgentMaintenance) {
      console.log('❌ Manutenção urgente não encontrada');
      return;
    }
    
    console.log('📋 Manutenção urgente:', {
      id: urgentMaintenance.id,
      data: urgentMaintenance.scheduledDate,
      servico: urgentMaintenance.serviceDescription,
      diasAntes: urgentMaintenance.notificationDaysBefore,
      completada: urgentMaintenance.isCompleted
    });
    
    // Verificar se já existe email log para esta manutenção
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        userId: user.id,
        scheduledMaintenanceId: urgentMaintenance.id,
        emailType: 'maintenance-reminder'
      }
    });
    
    console.log('📧 Email log existente:', emailLog ? 'SIM' : 'NÃO');
    
    if (emailLog) {
      console.log('   Status:', emailLog.status);
      console.log('   Enviado em:', emailLog.sentAt);
      console.log('   ❓ Motivo: Sistema evita emails duplicados');
    }
    
    // Calcular timing
    const now = new Date();
    const scheduledDate = new Date(urgentMaintenance.scheduledDate);
    const reminderDate = new Date(scheduledDate);
    reminderDate.setDate(reminderDate.getDate() - urgentMaintenance.notificationDaysBefore);
    
    const timeDiff = reminderDate.getTime() - now.getTime();
    const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('\n⏰ Análise de timing:');
    console.log('   Agora:', now.toLocaleString('pt-BR'));
    console.log('   Data da manutenção:', scheduledDate.toLocaleString('pt-BR'));
    console.log('   Data para lembrete:', reminderDate.toLocaleString('pt-BR'));
    console.log('   Diferença para lembrete:', Math.round(timeDiff / 1000 / 60), 'minutos');
    console.log('   Dias até manutenção:', daysUntil);
    
    if (timeDiff <= 0) {
      console.log('✅ Lembrete deveria ser enviado (tempo passou)');
    } else {
      console.log('⏰ Lembrete seria agendado para:', new Date(now.getTime() + timeDiff).toLocaleString('pt-BR'));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugUrgentMaintenance();