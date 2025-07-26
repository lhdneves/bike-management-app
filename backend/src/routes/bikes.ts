import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const bikeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  manufacturer: Joi.string().max(100).optional(),
  type: Joi.string().valid('SPEED', 'MOUNTAIN_BIKE', 'ELECTRIC', 'URBAN').required(),
  tractionType: Joi.string().valid('MANUAL', 'ASSISTED').required(),
});

/**
 * @swagger
 * /bikes:
 *   get:
 *     summary: Get user's bikes
 *     tags: [Bikes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bikes retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bikes = await prisma.bike.findMany({
      where: { ownerId: req.user!.id },
      include: {
        components: true,
        maintenanceRecords: {
          include: {
            mechanic: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { serviceDate: 'desc' },
        },
        scheduledMaintenance: {
          where: { isCompleted: false },
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: bikes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /bikes:
 *   post:
 *     summary: Create a new bike
 *     tags: [Bikes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SPEED, MOUNTAIN_BIKE, ELECTRIC, URBAN]
 *               tractionType:
 *                 type: string
 *                 enum: [MANUAL, ASSISTED]
 *             required:
 *               - name
 *               - type
 *               - tractionType
 *     responses:
 *       201:
 *         description: Bike created successfully
 */
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error } = bikeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0].message },
      });
    }

    const bike = await prisma.bike.create({
      data: {
        ...req.body,
        ownerId: req.user!.id,
      },
      include: {
        components: true,
        maintenanceRecords: true,
        scheduledMaintenance: true,
      },
    });

    res.status(201).json({
      success: true,
      data: bike,
    });
  } catch (error) {
    next(error);
  }
});

export default router;