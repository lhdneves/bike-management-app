import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import maintenanceRoutes from '../src/routes/maintenance';

const app = express();
app.use(express.json());
app.use('/api/maintenance', maintenanceRoutes);

const prisma = new PrismaClient();

describe('Maintenance API Endpoints', () => {
  let userToken: string;
  let userId: string;
  let bikeId: string;
  let maintenanceId: string;
  let otherUserId: string;
  let otherUserToken: string;
  let otherBikeId: string;

  beforeAll(async () => {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        passwordHash: 'hashedpassword',
        role: 'BIKE_OWNER',
      },
    });
    userId = testUser.id;

    const otherTestUser = await prisma.user.create({
      data: {
        name: 'Other User',
        email: 'otheruser@example.com',
        passwordHash: 'hashedpassword',
        role: 'BIKE_OWNER',
      },
    });
    otherUserId = otherTestUser.id;

    // Create test bikes
    const testBike = await prisma.bike.create({
      data: {
        name: 'Test Bike',
        ownerId: userId,
        type: 'MOUNTAIN_BIKE',
        tractionType: 'MANUAL',
      },
    });
    bikeId = testBike.id;

    const otherTestBike = await prisma.bike.create({
      data: {
        name: 'Other User Bike',
        ownerId: otherUserId,
        type: 'SPEED',
        tractionType: 'MANUAL',
      },
    });
    otherBikeId = otherTestBike.id;

    // Generate JWT tokens
    userToken = jwt.sign(
      { userId: userId, email: 'testuser@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    otherUserToken = jwt.sign(
      { userId: otherUserId, email: 'otheruser@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.maintenanceRecord.deleteMany({
      where: { bikeId: { in: [bikeId, otherBikeId] } },
    });
    await prisma.bike.deleteMany({
      where: { id: { in: [bikeId, otherBikeId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/maintenance/bikes/:bikeId/maintenance', () => {
    it('should create a new maintenance record', async () => {
      const maintenanceData = {
        service_date: '2025-01-15',
        mechanic_name: 'John Mechanic',
        service_description: 'Regular maintenance and cleaning',
        cost: 50.00,
      };

      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(maintenanceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Maintenance record created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.serviceDescription).toBe(maintenanceData.service_description);
      expect(parseFloat(response.body.data.cost)).toBe(maintenanceData.cost);

      maintenanceId = response.body.data.id;
    });

    it('should require authentication', async () => {
      const maintenanceData = {
        service_date: '2025-01-15',
        mechanic_name: 'John Mechanic',
        service_description: 'Regular maintenance and cleaning',
      };

      await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/maintenance`)
        .send(maintenanceData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/maintenance/bikes/${bikeId}/maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Valid service date is required' }),
          expect.objectContaining({ msg: 'Mechanic name is required' }),
          expect.objectContaining({ msg: 'Service description is required' }),
        ])
      );
    });

    it('should not allow creating maintenance for other users bikes', async () => {
      const maintenanceData = {
        service_date: '2025-01-15',
        mechanic_name: 'John Mechanic',
        service_description: 'Regular maintenance and cleaning',
      };

      const response = await request(app)
        .post(`/api/maintenance/bikes/${otherBikeId}/maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(maintenanceData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Bike not found or unauthorized access');
    });
  });

  describe('GET /api/maintenance/bikes/:bikeId/maintenance', () => {
    it('should get maintenance records for a bike', async () => {
      const response = await request(app)
        .get(`/api/maintenance/bikes/${bikeId}/maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('serviceDate');
      expect(response.body.data[0]).toHaveProperty('serviceDescription');
    });

    it('should not allow access to other users bike maintenance', async () => {
      const response = await request(app)
        .get(`/api/maintenance/bikes/${otherBikeId}/maintenance`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Bike not found or unauthorized access');
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/maintenance/bikes/${bikeId}/maintenance`)
        .expect(401);
    });
  });

  describe('GET /api/maintenance/:maintenanceId', () => {
    it('should get a specific maintenance record', async () => {
      const response = await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', maintenanceId);
      expect(response.body.data).toHaveProperty('serviceDescription');
      expect(response.body.data).toHaveProperty('bike');
    });

    it('should not allow access to other users maintenance records', async () => {
      const response = await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maintenance record not found or unauthorized access');
    });
  });

  describe('PUT /api/maintenance/:maintenanceId', () => {
    it('should update a maintenance record', async () => {
      const updateData = {
        service_date: '2025-01-16',
        mechanic_name: 'Updated Mechanic',
        service_description: 'Updated maintenance description',
        cost: 75.50,
      };

      const response = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Maintenance record updated successfully');
      expect(response.body.data.serviceDescription).toBe(updateData.service_description);
      expect(parseFloat(response.body.data.cost)).toBe(updateData.cost);
    });

    it('should not allow updating other users maintenance records', async () => {
      const updateData = {
        service_date: '2025-01-16',
        mechanic_name: 'Updated Mechanic',
        service_description: 'Updated maintenance description',
      };

      const response = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maintenance record not found or unauthorized access');
    });

    it('should validate required fields on update', async () => {
      const response = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('DELETE /api/maintenance/:maintenanceId', () => {
    it('should not allow deleting other users maintenance records', async () => {
      const response = await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maintenance record not found or unauthorized access');
    });

    it('should delete a maintenance record', async () => {
      const response = await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Maintenance record deleted successfully');

      // Verify the record is deleted
      const getResponse = await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});