const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestMaintenance() {
  try {
    console.log('🔧 Criando manutenção de teste para lembretes...');
    
    // Buscar a bike existente
    const bike = await prisma.bike.findFirst({
      include: { owner: true }
    });
    
    if (!bike) {
      console.log('❌ Nenhuma bike encontrada');
      return;
    }
    
    console.log('🚲 Bike encontrada:', bike.name, '- Owner:', bike.owner.email);
    
    // Criar manutenção para hoje + 1 dia (deve disparar lembrete imediato)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 14:00 de amanhã
    
    console.log('📅 Data da manutenção:', tomorrow.toISOString());
    console.log('⏰ Lembrete: 1 dia antes (deve disparar hoje)');
    
    const maintenance = await prisma.scheduledMaintenance.create({
      data: {
        bikeId: bike.id,
        scheduledDate: tomorrow,
        serviceDescription: 'TESTE Email Lembrete - Ajuste de freios',
        notificationDaysBefore: 1, // 1 dia antes = hoje
        isCompleted: false
      }
    });
    
    console.log('✅ Manutenção criada:', {
      id: maintenance.id,
      data: maintenance.scheduledDate.toISOString(),
      servico: maintenance.serviceDescription,
      lembrete: `${maintenance.notificationDaysBefore} dia(s) antes`
    });
    
    // Verificar se usuário tem preferências de email
    const preferences = await prisma.userEmailPreference.findUnique({
      where: { userId: bike.ownerId }
    });
    
    console.log('📧 Preferências de email:', preferences ? 'Configuradas' : 'Usando padrão');
    if (preferences) {
      console.log('   Lembretes ativos:', preferences.maintenanceReminders);
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Execute: curl -X POST http://localhost:3001/api/jobs/cron/trigger');
    console.log('2. Verifique: curl http://localhost:3001/api/jobs/queue/stats');
    console.log('3. Aguarde o processamento e verifique logs do backend');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestMaintenance();