const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMaintenanceFlow() {
  try {
    console.log('🔧 Testing Maintenance Reminder Flow');
    
    // Get the existing maintenance record
    const maintenance = await prisma.scheduledMaintenance.findFirst({
      include: { 
        bike: { 
          include: { owner: true }
        }
      }
    });
    
    if (!maintenance) {
      console.log('❌ No maintenance record found');
      return;
    }
    
    console.log('📋 Found maintenance record:', {
      id: maintenance.id,
      bikeName: maintenance.bike.name,
      owner: maintenance.bike.owner.email,
      scheduledDate: maintenance.scheduledDate.toISOString().split('T')[0],
      serviceDescription: maintenance.serviceDescription,
      notificationDaysBefore: maintenance.notificationDaysBefore,
      isCompleted: maintenance.isCompleted
    });
    
    // Create email preference for this user (opt-in to reminders)
    const userId = maintenance.bike.ownerId;
    
    const existingPreference = await prisma.userEmailPreference.findUnique({
      where: { userId }
    });
    
    if (!existingPreference) {
      console.log('📧 Creating email preference for user...');
      await prisma.userEmailPreference.create({
        data: {
          userId,
          maintenanceReminders: true,
          reminderFrequency: 'immediate'
        }
      });
      console.log('✅ Email preference created');
    } else {
      console.log('📧 Email preference already exists');
    }
    
    // Create a new maintenance record that should trigger immediately
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    console.log('🆕 Creating new maintenance record for immediate reminder...');
    const newMaintenance = await prisma.scheduledMaintenance.create({
      data: {
        bikeId: maintenance.bikeId,
        scheduledDate: tomorrow,
        serviceDescription: 'Test Brake Adjustment - Immediate Reminder',
        notificationDaysBefore: 1, // Should trigger immediately since it's for tomorrow
        isCompleted: false,
      }
    });
    
    console.log('✅ New maintenance created:', {
      id: newMaintenance.id,
      scheduledDate: newMaintenance.scheduledDate.toISOString(),
      serviceDescription: newMaintenance.serviceDescription,
      notificationDaysBefore: newMaintenance.notificationDaysBefore
    });
    
    console.log('\n🚀 Now trigger a manual scan to process the new maintenance...');
    console.log('Run: curl -X POST http://localhost:3001/api/jobs/cron/trigger');
    console.log('Then check: curl http://localhost:3001/api/jobs/queue/stats');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMaintenanceFlow();