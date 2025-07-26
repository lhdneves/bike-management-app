import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /mechanics:
 *   get:
 *     summary: Get list of mechanics
 *     tags: [Mechanics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mechanics retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const mechanics = await prisma.mechanic.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    res.json({
      success: true,
      data: mechanics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;