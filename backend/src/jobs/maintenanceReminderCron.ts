import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { emailQueue } from './index';

const prisma = new PrismaClient();

export interface ScheduledMaintenanceWithBike {
  id: string;
  scheduledDate: Date;
  serviceDescription: string;
  notificationDaysBefore: number | null;
  isCompleted: boolean;
  bike: {
    id: string;
    name: string;
    ownerId: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export class MaintenanceReminderCron {
  private isRunning = false;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    console.log('🕐 MaintenanceReminderCron initialized');
  }

  /**
   * Start the cron job
   */
  start(): void {
    const isEnabled = process.env.MAINTENANCE_REMINDER_ENABLED === 'true';
    
    if (!isEnabled) {
      console.log('🔕 Maintenance reminder cron is disabled');
      return;
    }

    const cronExpression = process.env.MAINTENANCE_REMINDER_CRON || '0 9 * * *'; // Default: 9 AM daily
    
    console.log(`🚀 Starting maintenance reminder cron: ${cronExpression}`);

    this.cronJob = cron.schedule(cronExpression, () => {
      this.scanAndScheduleReminders().catch(error => {
        console.error('❌ Error in maintenance reminder cron:', error);
      });
    }, {
      scheduled: false, // Don't start immediately
      timezone: process.env.TZ || 'America/Sao_Paulo'
    });

    this.cronJob.start();
    console.log('✅ Maintenance reminder cron started');

    // Also run immediately on startup (optional, for testing)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Running initial scan...');
      this.scanAndScheduleReminders().catch(console.error);
    }
  }

  /**
   * Stop the cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('⏹️ Maintenance reminder cron stopped');
    }
  }

  /**
   * Main scanning and scheduling logic
   */
  private async scanAndScheduleReminders(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Maintenance reminder scan already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔍 Starting maintenance reminder scan...');

      // Get all non-completed scheduled maintenances with future dates
      const scheduledMaintenances = await this.getScheduledMaintenances();
      
      console.log(`📋 Found ${scheduledMaintenances.length} scheduled maintenances to check`);

      let remindersSent = 0;
      let remindersScheduled = 0;
      let remindersSkipped = 0;

      for (const maintenance of scheduledMaintenances) {
        try {
          const result = await this.scheduleReminderIfNeeded(maintenance);
          
          switch (result) {
            case 'sent':
              remindersSent++;
              break;
            case 'scheduled':
              remindersScheduled++;
              break;
            case 'skipped':
              remindersSkipped++;
              break;
          }
        } catch (error) {
          console.error(`❌ Error processing maintenance ${maintenance.id}:`, error);
          remindersSkipped++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Maintenance reminder scan completed in ${duration}ms`);
      console.log(`📊 Results: ${remindersSent} sent, ${remindersScheduled} scheduled, ${remindersSkipped} skipped`);

    } catch (error) {
      console.error('❌ Error in maintenance reminder scan:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get scheduled maintenances that need reminder checking
   */
  private async getScheduledMaintenances(): Promise<ScheduledMaintenanceWithBike[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get maintenances scheduled for today or in the future
    const scheduledMaintenances = await prisma.scheduledMaintenance.findMany({
      where: {
        isCompleted: false,
        scheduledDate: {
          gte: today,
        },
        notificationDaysBefore: {
          not: null,
          gt: 0
        }
      },
      include: {
        bike: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    return scheduledMaintenances as ScheduledMaintenanceWithBike[];
  }

  /**
   * Schedule reminder for a specific maintenance if needed
   */
  private async scheduleReminderIfNeeded(
    maintenance: ScheduledMaintenanceWithBike
  ): Promise<'sent' | 'scheduled' | 'skipped'> {
    const { notificationDaysBefore, scheduledDate, bike } = maintenance;
    
    if (!notificationDaysBefore) {
      return 'skipped'; // No reminder requested
    }

    // Calculate when the reminder should be sent
    const reminderDate = new Date(scheduledDate);
    reminderDate.setDate(reminderDate.getDate() - notificationDaysBefore);
    reminderDate.setHours(9, 0, 0, 0); // Send at 9 AM

    const now = new Date();
    const timeDiff = reminderDate.getTime() - now.getTime();
    const daysUntilMaintenance = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`📅 Checking maintenance ${maintenance.id}:`, {
      bikeName: bike.name,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      reminderDate: reminderDate.toISOString().split('T')[0],
      daysUntilMaintenance,
      notificationDaysBefore,
      timeDiff: Math.round(timeDiff / 1000 / 60 / 60) + ' hours'
    });

    // Check if we already sent/scheduled a reminder for this maintenance
    const existingReminder = await this.hasExistingReminder(maintenance.id, bike.ownerId);
    if (existingReminder) {
      console.log(`📧 Reminder already exists for maintenance ${maintenance.id}`);
      return 'skipped';
    }

    // If reminder date is today or in the past, send immediately
    if (timeDiff <= 0 && daysUntilMaintenance >= 0) {
      console.log(`📧 Sending immediate reminder for maintenance ${maintenance.id}`);
      
      await emailQueue.addMaintenanceReminderJob({
        userId: bike.ownerId,
        scheduledMaintenanceId: maintenance.id,
        bikeName: bike.name,
        serviceDescription: maintenance.serviceDescription,
        scheduledDate: scheduledDate.toISOString(),
        daysUntil: daysUntilMaintenance,
      });

      return 'sent';
    } 
    // If reminder date is in the future, schedule it
    else if (timeDiff > 0) {
      console.log(`⏰ Scheduling future reminder for maintenance ${maintenance.id} in ${Math.round(timeDiff / 1000 / 60 / 60)} hours`);
      
      await emailQueue.addMaintenanceReminderJob({
        userId: bike.ownerId,
        scheduledMaintenanceId: maintenance.id,
        bikeName: bike.name,
        serviceDescription: maintenance.serviceDescription,
        scheduledDate: scheduledDate.toISOString(),
        daysUntil: notificationDaysBefore,
      }, timeDiff);

      return 'scheduled';
    }

    return 'skipped';
  }

  /**
   * Check if we already have a reminder for this maintenance
   */
  private async hasExistingReminder(scheduledMaintenanceId: string, userId: string): Promise<boolean> {
    // Check email logs
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        userId,
        scheduledMaintenanceId,
        emailType: 'maintenance-reminder',
        status: {
          in: ['sent', 'pending']
        }
      }
    });

    if (emailLog) {
      return true;
    }

    // TODO: Check queue for scheduled jobs
    // This would require querying Bull queue which is more complex
    // For now, we rely on email logs

    return false;
  }

  /**
   * Manual trigger for testing
   */
  async triggerManualScan(): Promise<void> {
    console.log('🔧 Manual maintenance reminder scan triggered');
    await this.scanAndScheduleReminders();
  }

  /**
   * Get scan status
   */
  isScanning(): boolean {
    return this.isRunning;
  }

  /**
   * Get next scheduled run time
   */
  getNextRun(): Date | null {
    if (!this.cronJob) {
      return null;
    }

    // This is a simplified calculation - in production you might want to use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(9, 0, 0, 0);
    
    return nextRun;
  }
}

// Export singleton instance
export const maintenanceReminderCron = new MaintenanceReminderCron();