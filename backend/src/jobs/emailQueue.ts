import Bull from 'bull';
import emailService from '../services/emailService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MaintenanceReminderData {
  userId: string;
  scheduledMaintenanceId: string;
  bikeName: string;
  serviceDescription: string;
  scheduledDate: string;
  daysUntil: number;
}

export interface EmailJobData {
  type: 'maintenance-reminder';
  data: MaintenanceReminderData;
}

export class EmailQueue {
  private queue: Bull.Queue;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const queueName = process.env.EMAIL_QUEUE_NAME || 'email-processing';
    
    this.queue = new Bull(queueName, redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    });

    this.setupJobProcessor();
    this.setupEventListeners();
  }

  /**
   * Add a maintenance reminder job to the queue
   */
  async addMaintenanceReminderJob(
    reminderData: MaintenanceReminderData, 
    delay?: number
  ): Promise<Bull.Job> {
    const jobData: EmailJobData = {
      type: 'maintenance-reminder',
      data: reminderData
    };

    const jobOptions: Bull.JobOptions = {
      delay,
      // Prevent duplicate jobs using unique job ID
      jobId: `maintenance-reminder-${reminderData.scheduledMaintenanceId}-${reminderData.userId}`,
    };

    console.log(`📋 Adding maintenance reminder job for user ${reminderData.userId}`, {
      bikeName: reminderData.bikeName,
      serviceDescription: reminderData.serviceDescription,
      daysUntil: reminderData.daysUntil,
      delay: delay ? `${Math.round(delay / 1000 / 60)} minutes` : 'immediate'
    });

    return await this.queue.add('email-job', jobData, jobOptions);
  }

  /**
   * Setup job processor for different email types
   */
  private setupJobProcessor(): void {
    const concurrency = parseInt(process.env.EMAIL_QUEUE_CONCURRENCY || '5');
    
    this.queue.process('email-job', concurrency, async (job: Bull.Job<EmailJobData>) => {
      console.log(`🚀 Processing email job: ${job.data.type} (Job ID: ${job.id})`);
      
      switch (job.data.type) {
        case 'maintenance-reminder':
          await this.processMaintenanceReminder(job);
          break;
        default:
          throw new Error(`Unknown email job type: ${job.data.type}`);
      }
    });
  }

  /**
   * Process maintenance reminder email job
   */
  private async processMaintenanceReminder(job: Bull.Job<EmailJobData>): Promise<void> {
    const { data: reminderData } = job.data as { data: MaintenanceReminderData };
    const { userId, scheduledMaintenanceId, bikeName, serviceDescription, scheduledDate, daysUntil } = reminderData;

    try {
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
      if (!(preferences as any)?.maintenanceReminders && !(preferences as any)?.maintenance_reminders) {
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
          new Date(scheduledDate)
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

    } catch (error) {
      console.error(`❌ Error processing maintenance reminder for user ${userId}:`, error);
      throw error; // Bull will handle retry logic
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
      return { maintenance_reminders: true };
    }
  }

  /**
   * Setup event listeners for monitoring
   */
  private setupEventListeners(): void {
    this.queue.on('completed', (job: Bull.Job, result: any) => {
      console.log(`✅ Job ${job.id} completed:`, result);
    });

    this.queue.on('failed', (job: Bull.Job, err: Error) => {
      console.error(`❌ Job ${job.id} failed:`, err.message);
    });

    this.queue.on('stalled', (job: Bull.Job) => {
      console.warn(`⏰ Job ${job.id} stalled`);
    });

    this.queue.on('progress', (job: Bull.Job, progress: number) => {
      console.log(`📊 Job ${job.id} progress: ${progress}%`);
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(), 
      this.queue.getCompleted(),
      this.queue.getFailed()
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  /**
   * Clean up old jobs
   */
  async cleanQueue(): Promise<void> {
    await this.queue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24h
    await this.queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 7 days
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    await this.queue.close();
  }
}

// Check if Redis is available and export appropriate implementation
let emailQueueInstance: EmailQueue | any;

async function initializeQueue() {
  try {
    // Try to create Bull queue (requires Redis)
    emailQueueInstance = new EmailQueue();
    console.log('✅ Using Redis-based EmailQueue');
    return emailQueueInstance;
  } catch (error) {
    console.log('⚠️ Redis not available, falling back to in-memory queue');
    const { emailQueueMemory } = await import('./emailQueueMemory');
    emailQueueInstance = emailQueueMemory;
    return emailQueueInstance;
  }
}

// Initialize and export queue
let emailQueuePromise: Promise<EmailQueue | any>;

export async function getEmailQueue() {
  if (!emailQueuePromise) {
    emailQueuePromise = initializeQueue();
  }
  return emailQueuePromise;
}

// Export for immediate use (will use memory queue if Redis fails)
export const emailQueue = emailQueueInstance;