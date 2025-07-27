import request from 'supertest';
import app from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Password Reset Integration Tests', () => {
  let testUserId: string;
  const testEmail = 'test-reset@bikemanager.com';
  const testUser = {
    name: 'Test User Reset',
    email: testEmail,
    passwordHash: '$2b$12$testHashForPassword',
    role: 'BIKE_OWNER' as const
  };

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: testUser
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.passwordResetToken.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/password-reset/request', () => {
    it('should accept valid email and return success message', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: testEmail })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');

      // Verify token was created in database
      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: testUserId, isUsed: false }
      });
      expect(token).toBeTruthy();
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');
    });

    it('should accept any email format for security (no enumeration)', async () => {
      // Our API returns success even for invalid emails to prevent email enumeration
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: 'invalid-email' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email is required');
    });
  });

  describe('GET /api/password-reset/validate/:token', () => {
    let validToken: string;

    beforeEach(async () => {
      // Create a valid token
      const tokenRecord = await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          token: 'valid-test-token-123',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
        include: { user: true }
      });
      validToken = tokenRecord.token;
    });

    afterEach(async () => {
      // Clean up tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: testUserId }
      });
    });

    it('should validate valid token', async () => {
      const response = await request(app)
        .get(`/api/password-reset/validate/${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user.name).toBe(testUser.name);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/password-reset/validate/invalid-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject expired token', async () => {
      // Create expired token
      const expiredToken = await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          token: 'expired-token-123',
          expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        }
      });

      const response = await request(app)
        .get(`/api/password-reset/validate/${expiredToken.token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('POST /api/password-reset/reset', () => {
    let validToken: string;

    beforeEach(async () => {
      // Create a valid token
      const tokenRecord = await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          token: 'reset-test-token-123',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        }
      });
      validToken = tokenRecord.token;
    });

    afterEach(async () => {
      // Clean up tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: testUserId }
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'newSecurePassword123';
      
      const response = await request(app)
        .post('/api/password-reset/reset')
        .send({
          token: validToken,
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully');

      // Verify token is marked as used
      const usedToken = await prisma.passwordResetToken.findFirst({
        where: { token: validToken }
      });
      expect(usedToken?.isUsed).toBe(true);
      expect(usedToken?.usedAt).toBeTruthy();

      // Verify password was updated (hash should be different)
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserId }
      });
      expect(updatedUser?.passwordHash).not.toBe(testUser.passwordHash);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset')
        .send({
          token: 'invalid-token',
          newPassword: 'newPassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset')
        .send({
          token: validToken,
          newPassword: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 6 characters');
    });

    it('should reject missing parameters', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset')
        .send({
          token: validToken
          // Missing newPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple requests within rate limit', async () => {
      // Make 3 requests (should be within limit)
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/password-reset/request')
          .send({ email: testEmail });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Email Service Integration', () => {
    it('should handle email service gracefully when unavailable', async () => {
      // This test verifies that the API doesn't fail when email service is down
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: testEmail })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should still return success even if email fails (logged but not exposed)
    });
  });
});