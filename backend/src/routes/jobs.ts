import express from 'express';
import { emailQueue } from '../jobs/index';
import { maintenanceReminderCron } from '../jobs/maintenanceReminderCron';

const router = express.Router();

/**
 * @swagger
 * /api/jobs/queue/stats:
 *   get:
 *     summary: Get email queue statistics
 *     description: Returns current status of the email queue
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Queue statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     waiting:
 *                       type: number
 *                     active:
 *                       type: number
 *                     completed:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     total:
 *                       type: number
 */
router.get('/queue/stats', async (req, res) => {
  try {
    const stats = await emailQueue.getQueueStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queue statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/jobs/cron/status:
 *   get:
 *     summary: Get maintenance reminder cron status
 *     description: Returns current status of the maintenance reminder cron job
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Cron job status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     isScanning:
 *                       type: boolean
 *                     nextRun:
 *                       type: string
 *                       format: date-time
 *                     enabled:
 *                       type: boolean
 */
router.get('/cron/status', async (req, res) => {
  try {
    const isScanning = maintenanceReminderCron.isScanning();
    const nextRun = maintenanceReminderCron.getNextRun();
    const enabled = process.env.MAINTENANCE_REMINDER_ENABLED === 'true';

    res.json({
      success: true,
      status: {
        isScanning,
        nextRun: nextRun?.toISOString(),
        enabled,
        cronExpression: process.env.MAINTENANCE_REMINDER_CRON || '0 9 * * *'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cron status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/jobs/cron/trigger:
 *   post:
 *     summary: Manually trigger maintenance reminder scan
 *     description: Triggers a manual scan for maintenance reminders (for testing)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Manual scan triggered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/cron/trigger', async (req, res) => {
  try {
    if (maintenanceReminderCron.isScanning()) {
      return res.status(409).json({
        success: false,
        message: 'Maintenance scan is already running'
      });
    }

    // Trigger scan in background
    maintenanceReminderCron.triggerManualScan().catch(error => {
      console.error('Manual scan error:', error);
    });

    res.json({
      success: true,
      message: 'Manual maintenance scan triggered'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering manual scan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/jobs/queue/clean:
 *   post:
 *     summary: Clean old jobs from queue
 *     description: Removes old completed and failed jobs from the queue
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Queue cleaned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/queue/clean', async (req, res) => {
  try {
    await emailQueue.cleanQueue();
    
    res.json({
      success: true,
      message: 'Queue cleaned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning queue',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;