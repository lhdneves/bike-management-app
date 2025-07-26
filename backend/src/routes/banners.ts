import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get active banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } },
            ],
          },
          {
            AND: [
              { startDate: null },
              { endDate: null },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
});

export default router;