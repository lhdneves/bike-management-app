import { Request, Response } from 'express';
import emailService from '../services/emailService';

export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    // Get email service health
    const emailHealth = emailService.getHealthStatus();
    
    // Test database connection
    const dbHealth = { connected: true }; // We'll implement this later
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        email: emailHealth,
      },
      environment: process.env.NODE_ENV,
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const testEmailService = async (req: Request, res: Response) => {
  try {
    const testResult = await emailService.testConnection();
    
    res.json({
      success: true,
      emailService: testResult,
      message: 'Email service test completed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Email test failed',
    });
  }
};