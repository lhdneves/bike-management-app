import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /maintenance/records:
 *   get:
 *     summary: Get maintenance records for user's bikes
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance records retrieved successfully
 */
router.get('/records', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const records = await prisma.maintenanceRecord.findMany({
      where: {
        bike: {
          ownerId: req.user!.id,
        },
      },
      include: {
        bike: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /maintenance/scheduled:
 *   get:
 *     summary: Get scheduled maintenance for user's bikes
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled maintenance retrieved successfully
 */
router.get('/scheduled', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const scheduled = await prisma.scheduledMaintenance.findMany({
      where: {
        bike: {
          ownerId: req.user!.id,
        },
        isCompleted: false,
      },
      include: {
        bike: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    res.json({
      success: true,
      data: scheduled,
    });
  } catch (error) {
    next(error);
  }
});

export default router;