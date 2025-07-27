import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import maintenanceRoutes from '../src/routes/maintenance';

const app = express();
app.use(express.json());
app.use('/api/maintenance', maintenanceRoutes);

const prisma = new PrismaClient();

describe('Scheduled Maintenance API Endpoints', () => {
  let userToken: string;
  let userId: string;
  let bikeId: string;
  let scheduledMaintenanceId: string;
  let otherUserId: string;
  let otherUserToken: string;
  let otherBikeId: string;

  beforeAll(async () => {
    // Clean up the database
    await prisma.scheduledMaintenance.deleteMany();
    await prisma.bike.deleteMany();
    await prisma.user.deleteMany();

    // Create test user 1
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'BIKE_OWNER'
      }
    });

    userId = user.id;
    userToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'test_secret');

    // Create test bike
    const bike = await prisma.bike.create({
      data: {
        name: 'Test Bike',
        description: 'Test bike for scheduled maintenance',
        manufacturer: 'Test Manufacturer',
        type: 'MOUNTAIN_BIKE',
        tractionType: 'MANUAL',
        ownerId: userId
      }
    });

    bikeId = bike.id;

    // Create test user 2 (for authorization tests)
    const otherUser = await prisma.user.create({
      data: {
        name: 'Other User',
        email: 'other@example.com',
        passwordHash: 'hashed_password',
        role: 'BIKE_OWNER'
      }
    });

    otherUserId = otherUser.id;
    otherUserToken = jwt.sign({ userId: otherUser.id }, process.env.JWT_SECRET || 'test_secret');

    // Create bike for other user
    const otherBike = await prisma.bike.create({
      data: {
        name: 'Other Bike',
        description: 'Other user bike',
        manufacturer: 'Other Manufacturer',
        type: 'SPEED',
        tractionType: 'MANUAL',
        ownerId: otherUserId
      }
    });

    otherBikeId = otherBike.id;
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.scheduledMaintenance.deleteMany();
    await prisma.bike.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/maintenance/bikes/:bikeId/scheduled-maintenance', () => {
    it('should create a new scheduled maintenance record', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: tomorrow.toISOString().split('T')[0],
          service_description: 'Test scheduled maintenance',
          notification_days_before: 7
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceDescription).toBe('Test scheduled maintenance');
      expect(response.body.data.notificationDaysBefore).toBe(7);
      expect(response.body.data.isCompleted).toBe(false);

      scheduledMaintenanceId = response.body.data.id;
    });

    it('should require authentication', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`)
        .send({
          scheduled_date: tomorrow.toISOString().split('T')[0],
          service_description: 'Test scheduled maintenance'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: '',
          service_description: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate future date requirement', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: yesterday.toISOString().split('T')[0],
          service_description: 'Test scheduled maintenance'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not allow creating scheduled maintenance for other users bikes', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post(`/api/maintenance/bikes/${otherBikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: tomorrow.toISOString().split('T')[0],
          service_description: 'Test scheduled maintenance'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/maintenance/bikes/:bikeId/scheduled-maintenance', () => {
    it('should get scheduled maintenance records for a bike', async () => {
      const response = await request(app)
        .get(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow access to other users bike scheduled maintenance', async () => {
      const response = await request(app)
        .get(`/api/maintenance/bikes/${otherBikeId}/scheduled-maintenance`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/maintenance/bikes/${bikeId}/scheduled-maintenance`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/maintenance/scheduled-maintenance/:scheduledId', () => {
    it('should get a specific scheduled maintenance record', async () => {
      const response = await request(app)
        .get(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(scheduledMaintenanceId);
      expect(response.body.data.serviceDescription).toBe('Test scheduled maintenance');
    });

    it('should not allow access to other users scheduled maintenance records', async () => {
      const response = await request(app)
        .get(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/maintenance/scheduled-maintenance/:scheduledId', () => {
    it('should update a scheduled maintenance record', async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);

      const response = await request(app)
        .put(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: newDate.toISOString().split('T')[0],
          service_description: 'Updated scheduled maintenance',
          notification_days_before: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceDescription).toBe('Updated scheduled maintenance');
      expect(response.body.data.notificationDaysBefore).toBe(3);
    });

    it('should not allow updating other users scheduled maintenance records', async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);

      const response = await request(app)
        .put(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          scheduled_date: newDate.toISOString().split('T')[0],
          service_description: 'Updated scheduled maintenance'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields on update', async () => {
      const response = await request(app)
        .put(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          scheduled_date: '',
          service_description: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/maintenance/scheduled-maintenance/:scheduledId', () => {
    it('should not allow deleting other users scheduled maintenance records', async () => {
      const response = await request(app)
        .delete(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should delete a scheduled maintenance record', async () => {
      const response = await request(app)
        .delete(`/api/maintenance/scheduled-maintenance/${scheduledMaintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Scheduled maintenance deleted successfully');
    });
  });
});