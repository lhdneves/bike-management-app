import request from 'supertest';
import express from 'express';
import maintenanceRoutes from '../src/routes/maintenance';
import { authenticate } from '../src/middleware/auth';
import { prisma } from './setup';
import { 
  TEST_USERS, 
  TEST_BIKES, 
  createAuthHeader, 
  generateTestMaintenanceRecord 
} from './testUtils';

const app = express();
app.use(express.json());
app.use(authenticate); // Add auth middleware
app.use('/api/maintenance', maintenanceRoutes);

describe('Maintenance API Endpoints', () => {
  let maintenanceId: string;
  const authHeaders = createAuthHeader(TEST_USERS.testUser);

  beforeAll(async () => {
    // Test data is created in setup.ts
    // Just verify it exists
    const testUser = await prisma.user.findUnique({
      where: { id: TEST_USERS.testUser.id }
    });
    
    const testBike = await prisma.bike.findUnique({
      where: { id: TEST_BIKES.testBike.id }
    });
    
    if (!testUser || !testBike) {
      throw new Error('Test data not found - setup.ts may have failed');
    }
  });

  describe('POST /api/maintenance', () => {
    it('should create a new maintenance record', async () => {
      const maintenanceData = generateTestMaintenanceRecord();

      const response = await request(app)
        .post('/api/maintenance')
        .set(authHeaders)
        .send(maintenanceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.serviceDescription).toBe(maintenanceData.serviceDescription);
      expect(response.body.cost).toBe(maintenanceData.cost);
      
      maintenanceId = response.body.id;
    });

    it('should return 401 without authentication', async () => {
      const maintenanceData = generateTestMaintenanceRecord();

      await request(app)
        .post('/api/maintenance')
        .send(maintenanceData)
        .expect(401);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = {
        // Missing required fields
        serviceDescription: '',
        cost: -1
      };

      await request(app)
        .post('/api/maintenance')
        .set(authHeaders)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/maintenance', () => {
    it('should get maintenance records for user', async () => {
      const response = await request(app)
        .get('/api/maintenance')
        .set(authHeaders)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/maintenance')
        .expect(401);
    });
  });

  describe('GET /api/maintenance/:id', () => {
    it('should get specific maintenance record', async () => {
      if (!maintenanceId) {
        // Create a maintenance record first
        const maintenanceData = generateTestMaintenanceRecord();
        const createResponse = await request(app)
          .post('/api/maintenance')
          .set(authHeaders)
          .send(maintenanceData);
        maintenanceId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.id).toBe(maintenanceId);
    });

    it('should return 404 for non-existent maintenance', async () => {
      const fakeId = '99999999-9999-9999-9999-999999999999';
      
      await request(app)
        .get(`/api/maintenance/${fakeId}`)
        .set(authHeaders)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .expect(401);
    });
  });

  describe('PUT /api/maintenance/:id', () => {
    it('should update maintenance record', async () => {
      if (!maintenanceId) {
        // Create a maintenance record first
        const maintenanceData = generateTestMaintenanceRecord();
        const createResponse = await request(app)
          .post('/api/maintenance')
          .set(authHeaders)
          .send(maintenanceData);
        maintenanceId = createResponse.body.id;
      }

      const updateData = {
        serviceDescription: 'UPDATED TEST Maintenance Record',
        cost: 150.00,
        mechanicName: 'Updated Mechanic'
      };

      const response = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .set(authHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.serviceDescription).toBe(updateData.serviceDescription);
      expect(response.body.cost).toBe(updateData.cost);
    });

    it('should return 401 without authentication', async () => {
      const updateData = { serviceDescription: 'Updated' };
      
      await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/maintenance/:id', () => {
    it('should delete maintenance record', async () => {
      if (!maintenanceId) {
        // Create a maintenance record first
        const maintenanceData = generateTestMaintenanceRecord();
        const createResponse = await request(app)
          .post('/api/maintenance')
          .set(authHeaders)
          .send(maintenanceData);
        maintenanceId = createResponse.body.id;
      }

      await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .set(authHeaders)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/maintenance/${maintenanceId}`)
        .set(authHeaders)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .expect(401);
    });
  });
});