import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /components:
 *   get:
 *     summary: Get components for user's bikes
 *     tags: [Components]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Components retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const components = await prisma.component.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: components,
    });
  } catch (error) {
    next(error);
  }
});

export default router;