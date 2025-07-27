import jwt from 'jsonwebtoken';
import { Request } from 'express';

// Test utilities for authentication and common test operations

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'BIKE_OWNER' | 'MECHANIC' | 'ADMIN';
}

export const TEST_USERS = {
  testUser: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'test@example.com',
    name: 'Test User',
    role: 'BIKE_OWNER' as const
  },
  adminUser: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN' as const
  }
};

export const TEST_BIKES = {
  testBike: {
    id: '22222222-2222-2222-2222-222222222222',
    ownerId: '11111111-1111-1111-1111-111111111111',
    name: 'Test Bike',
    description: 'Test bike for testing',
    manufacturer: 'Test Manufacturer',
    type: 'MOUNTAIN_BIKE' as const,
    tractionType: 'MANUAL' as const
  }
};

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(user: TestUser): string {
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn }
  );
}

/**
 * Create authorization header for requests
 */
export function createAuthHeader(user: TestUser): { Authorization: string } {
  const token = generateTestToken(user);
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Mock authenticated request object
 */
export function createMockAuthenticatedRequest(user: TestUser): Partial<Request> & { user: any } {
  return {
    user: {
      userId: user.id,
      email: user.email,
      role: user.role
    }
  } as any;
}

/**
 * Generate test maintenance data
 */
export function generateTestMaintenance(overrides: any = {}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    bikeId: TEST_BIKES.testBike.id,
    scheduledDate: tomorrow,
    serviceDescription: 'TEST Maintenance Service',
    notificationDaysBefore: 1,
    isCompleted: false,
    ...overrides
  };
}

/**
 * Generate test maintenance record data
 */
export function generateTestMaintenanceRecord(overrides: any = {}) {
  return {
    bikeId: TEST_BIKES.testBike.id,
    serviceDescription: 'TEST Maintenance Record',
    serviceDate: new Date(),
    cost: 100.00,
    mechanicName: 'Test Mechanic',
    ...overrides
  };
}

/**
 * Sleep utility for async tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}@example.com`;
}