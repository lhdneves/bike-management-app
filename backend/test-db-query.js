const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    console.log('📋 Users:', users.length);
    
    // Check bikes
    const bikes = await prisma.bike.findMany({
      include: { owner: { select: { name: true, email: true } } }
    });
    console.log('🚲 Bikes:', bikes.length);
    
    // Check scheduled maintenance
    const maintenance = await prisma.scheduledMaintenance.findMany({
      include: { 
        bike: { 
          include: { owner: { select: { name: true, email: true } } }
        }
      }
    });
    console.log('🔧 Scheduled Maintenance:', maintenance.length);
    
    maintenance.forEach(m => {
      console.log(`  - ${m.bike.name}: ${m.serviceDescription} (${m.scheduledDate.toISOString().split('T')[0]}) - Remind ${m.notificationDaysBefore} days before`);
    });
    
    // Check email preferences
    const preferences = await prisma.userEmailPreference.findMany();
    console.log('📧 Email Preferences:', preferences.length);
    
    // Check email logs
    const emailLogs = await prisma.emailLog.findMany();
    console.log('📨 Email Logs:', emailLogs.length);
    
    emailLogs.forEach(log => {
      console.log(`  - ${log.emailType} to ${log.recipientEmail}: ${log.status} ${log.sentAt ? `(${log.sentAt.toISOString()})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();