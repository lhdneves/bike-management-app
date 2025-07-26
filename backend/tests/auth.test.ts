import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../src/routes/auth';

const app = express();

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const prisma = new PrismaClient();

describe('Authentication API Tests', () => {
  let testUserEmail: string;

  beforeAll(async () => {
    // Generate unique email for this test run
    testUserEmail = `test-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Clean up test user
    try {
      await prisma.user.deleteMany({
        where: {
          email: testUserEmail
        }
      });
    } catch (error) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registrationData = {
        name: 'Test User',
        email: testUserEmail,
        confirmEmail: testUserEmail,
        phone: '11987654321',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        acceptTerms: true,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(testUserEmail);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should prevent duplicate registration', async () => {
      const registrationData = {
        name: 'Test User',
        email: testUserEmail,
        confirmEmail: testUserEmail,
        phone: '11987654321',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        acceptTerms: true,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(testUserEmail);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'WrongPassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'SomePassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUserEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });
  });

  describe('Security Tests', () => {
    it('should hash passwords securely', async () => {
      // Verify user was created with hashed password
      const user = await prisma.user.findUnique({
        where: { email: testUserEmail }
      });

      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe('TestPassword123');
      expect(user?.passwordHash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should include role in user data', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.body.data.user.role).toBe('BIKE_OWNER');
    });

    it('should generate valid JWT tokens', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});