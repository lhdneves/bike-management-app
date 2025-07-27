const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUrgentMaintenance() {
  try {
    console.log('🚨 Criando manutenção URGENTE para testar "HOJE"...');
    
    const bike = await prisma.bike.findFirst();
    
    // Criar manutenção para HOJE
    const today = new Date();
    today.setHours(18, 0, 0, 0); // 18:00 hoje
    
    console.log('📅 Data da manutenção: HOJE às 18:00');
    console.log('⏰ Lembrete: 0 dias antes (urgência máxima)');
    
    const maintenance = await prisma.scheduledMaintenance.create({
      data: {
        bikeId: bike.id,
        scheduledDate: today,
        serviceDescription: '🚨 URGENTE - Troca de pneu',
        notificationDaysBefore: 0, // 0 dias = HOJE
        isCompleted: false
      }
    });
    
    console.log('✅ Manutenção urgente criada:', maintenance.id);
    
    console.log('\n🎯 Agora execute:');
    console.log('1. curl -X POST http://localhost:3001/api/jobs/cron/trigger');
    console.log('2. Verifique se o template mostra "HOJE" na urgência');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUrgentMaintenance();