const { PrismaClient } = require('@prisma/client');

async function backupData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Fazendo backup dos dados...');
    
    // Exportar dados essenciais
    const users = await prisma.user.findMany();
    const bikes = await prisma.bike.findMany();
    const scheduledMaintenance = await prisma.scheduledMaintenance.findMany();
    const maintenanceRecords = await prisma.maintenanceRecord.findMany();
    const userEmailPreferences = await prisma.userEmailPreference.findMany();
    
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        bikes,
        scheduledMaintenance,
        maintenanceRecords,
        userEmailPreferences
      }
    };
    
    console.log('📊 Estatísticas do backup:');
    console.log(`- Usuários: ${users.length}`);
    console.log(`- Bicicletas: ${bikes.length}`);
    console.log(`- Manutenções agendadas: ${scheduledMaintenance.length}`);
    console.log(`- Registros de manutenção: ${maintenanceRecords.length}`);
    console.log(`- Preferências de email: ${userEmailPreferences.length}`);
    
    // Salvar backup
    require('fs').writeFileSync(
      'supabase-backup.json', 
      JSON.stringify(backup, null, 2)
    );
    
    console.log('✅ Backup salvo em: supabase-backup.json');
    
  } catch (error) {
    console.error('❌ Erro no backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupData();