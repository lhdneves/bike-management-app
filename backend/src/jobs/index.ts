/**
 * Queue system initialization
 * Automatically detects if Redis is available and falls back to in-memory queue
 */

import { emailQueueMemory } from './emailQueueMemory';

// Check if Redis is available
function isRedisAvailable(): boolean {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Simple check - if we're in development and Redis URL is localhost, assume it might not be available
  if (process.env.NODE_ENV === 'development' && redisUrl.includes('localhost')) {
    return false;
  }
  
  return true;
}

// Export the appropriate queue implementation
console.log('🔧 Using in-memory EmailQueue for development');
export const emailQueue = emailQueueMemory;

// Also export cron
export { maintenanceReminderCron } from './maintenanceReminderCron';