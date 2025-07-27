import emailService from '../services/emailService';
import { PrismaClient } from '@prisma/client';
import { MaintenanceReminderData } from './emailQueue';

const prisma = new PrismaClient();

export interface EmailJobData {
  type: 'maintenance-reminder';
  data: MaintenanceReminderData;
}

interface ScheduledJob {
  id: string;
  data: EmailJobData;
  delay: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  error?: string;
}

export class EmailQueueMemory {
  private jobs: Map<string, ScheduledJob> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private stats = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0
  };

  constructor() {
    console.log('📝 EmailQueueMemory initialized (in-memory queue for development)');
    this.startProcessing();
  }

  /**
   * Add a maintenance reminder job to the queue
   */
  async addMaintenanceReminderJob(
    reminderData: MaintenanceReminderData, 
    delay?: number
  ): Promise<{ id: string }> {
    const jobId = `maintenance-reminder-${reminderData.scheduledMaintenanceId}-${reminderData.userId}-${Date.now()}`;
    
    const job: ScheduledJob = {
      id: jobId,
      data: {
        type: 'maintenance-reminder',
        data: reminderData
      },
      delay: delay || 0,
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date(Date.now() + (delay || 0)),
      status: 'waiting'
    };

    this.jobs.set(jobId, job);
    this.updateStats();

    console.log(`📋 Added maintenance reminder job ${jobId}`, {
      bikeName: reminderData.bikeName,
      serviceDescription: reminderData.serviceDescription,
      daysUntil: reminderData.daysUntil,
      delay: delay ? `${Math.round(delay / 1000 / 60)} minutes` : 'immediate'
    });

    return { id: jobId };
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processJobs().catch(error => {
        console.error('❌ Error processing jobs:', error);
      });
    }, 5000); // Check every 5 seconds

    console.log('🚀 EmailQueueMemory processing started');
  }

  /**
   * Process waiting jobs
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const now = new Date();
    
    try {
      for (const [jobId, job] of this.jobs) {
        if (job.status === 'waiting' && job.scheduledAt <= now) {
          await this.processJob(job);
        }
      }
    } finally {
      this.isProcessing = false;
      this.updateStats();
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScheduledJob): Promise<void> {
    job.status = 'active';
    job.attempts++;

    console.log(`🚀 Processing job ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`);

    try {
      switch (job.data.type) {
        case 'maintenance-reminder':
          await this.processMaintenanceReminder(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }

      job.status = 'completed';
      console.log(`✅ Job ${job.id} completed successfully`);

    } catch (error) {
      console.error(`❌ Job ${job.id} failed (attempt ${job.attempts}):`, error);
      
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
      } else {
        // Retry with exponential backoff
        const backoffDelay = Math.pow(2, job.attempts) * 2000; // 2s, 4s, 8s...
        job.scheduledAt = new Date(Date.now() + backoffDelay);
        job.status = 'waiting';
        console.log(`⏰ Job ${job.id} will retry in ${backoffDelay}ms`);
      }
    }
  }

  /**
   * Process maintenance reminder job
   */
  private async processMaintenanceReminder(job: ScheduledJob): Promise<void> {
    const { data: reminderData } = job.data as { data: MaintenanceReminderData };
    const { userId, scheduledMaintenanceId, bikeName, serviceDescription, scheduledDate, daysUntil } = reminderData;

    // Check if maintenance is still valid and not completed
    const scheduledMaintenance = await prisma.scheduledMaintenance.findUnique({
      where: { id: scheduledMaintenanceId },
      include: {
        bike: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!scheduledMaintenance) {
      console.log(`⚠️ Scheduled maintenance ${scheduledMaintenanceId} not found, skipping`);
      return;
    }

    if (scheduledMaintenance.isCompleted) {
      console.log(`✅ Maintenance ${scheduledMaintenanceId} already completed, skipping reminder`);
      return;
    }

    // Check user preferences
    const preferences = await this.getUserEmailPreferences(userId);
    if (!preferences?.maintenanceReminders) {
      console.log(`🔕 User ${userId} opted out of maintenance reminders`);
      return;
    }

    // Check if we already sent a reminder for this maintenance
    const existingLog = await prisma.emailLog.findFirst({
      where: {
        userId,
        scheduledMaintenanceId,
        emailType: 'maintenance-reminder',
        status: 'sent'
      }
    });

    if (existingLog) {
      console.log(`📧 Reminder already sent for maintenance ${scheduledMaintenanceId}`);
      return;
    }

    // Log the email attempt
    const emailLog = await prisma.emailLog.create({
      data: {
        userId,
        scheduledMaintenanceId,
        emailType: 'maintenance-reminder',
        recipientEmail: scheduledMaintenance.bike.owner.email,
        status: 'pending'
      }
    });

    try {
      // Send maintenance reminder email
      const emailResult = await emailService.sendMaintenanceReminder(
        scheduledMaintenance.bike.owner.email,
        scheduledMaintenance.bike.owner.name,
        bikeName,
        serviceDescription,
        new Date(scheduledDate),
        {
          bikeId: scheduledMaintenance.bike.id,
          daysUntil
        }
      );

      // Update email log with success
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          resendId: emailResult.messageId
        }
      });

      console.log(`✅ Maintenance reminder sent successfully to ${scheduledMaintenance.bike.owner.email}`);
      
    } catch (emailError) {
      // Update email log with failure
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'failed',
          errorMessage: emailError instanceof Error ? emailError.message : 'Unknown email error'
        }
      });

      throw emailError; // Re-throw to trigger job retry
    }
  }

  /**
   * Get user email preferences
   */
  private async getUserEmailPreferences(userId: string) {
    try {
      return await prisma.userEmailPreference.findUnique({
        where: { userId }
      });
    } catch (error) {
      console.error('Error fetching user email preferences:', error);
      // Default to allowing emails if we can't fetch preferences
      return { maintenanceReminders: true };
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.waiting = 0;
    this.stats.active = 0;
    this.stats.completed = 0;
    this.stats.failed = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'waiting':
          this.stats.waiting++;
          break;
        case 'active':
          this.stats.active++;
          break;
        case 'completed':
          this.stats.completed++;
          break;
        case 'failed':
          this.stats.failed++;
          break;
      }
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    this.updateStats();
    return {
      ...this.stats,
      total: this.jobs.size
    };
  }

  /**
   * Clean up old jobs
   */
  async cleanQueue(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [jobId, job] of this.jobs) {
      if ((job.status === 'completed' || job.status === 'failed') && job.scheduledAt < cutoffTime) {
        this.jobs.delete(jobId);
      }
    }
    
    this.updateStats();
    console.log('🧹 Queue cleaned - removed old completed/failed jobs');
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('⏹️ EmailQueueMemory stopped');
  }
}

// Export singleton instance
export const emailQueueMemory = new EmailQueueMemory();