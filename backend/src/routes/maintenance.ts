import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createMaintenanceSchema = Joi.object({
  service_date: Joi.date().required().messages({
    'any.required': 'Valid service date is required',
    'date.base': 'Valid service date is required'
  }),
  mechanic_name: Joi.string().trim().min(1).required().messages({
    'any.required': 'Mechanic name is required',
    'string.empty': 'Mechanic name is required'
  }),
  service_description: Joi.string().trim().min(1).required().messages({
    'any.required': 'Service description is required',
    'string.empty': 'Service description is required'
  }),
  cost: Joi.number().min(0).optional().messages({
    'number.base': 'Cost must be a valid number',
    'number.min': 'Cost must be positive'
  })
});

const validateUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

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

/**
 * @swagger
 * /maintenance/bikes/{bikeId}/maintenance:
 *   get:
 *     summary: Get maintenance records for a specific bike
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bike ID
 *     responses:
 *       200:
 *         description: Maintenance records retrieved successfully
 *       404:
 *         description: Bike not found
 *       403:
 *         description: Unauthorized access to bike
 */
router.get('/bikes/:bikeId/maintenance', 
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate bike ID
      const { bikeId } = req.params;
      if (!validateUUID(bikeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bike ID',
        });
      }

      // Verify bike ownership
      const bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          ownerId: req.user!.id,
        },
      });

      if (!bike) {
        return res.status(404).json({
          success: false,
          message: 'Bike not found or unauthorized access',
        });
      }

      const maintenanceRecords = await prisma.maintenanceRecord.findMany({
        where: {
          bikeId: bikeId,
        },
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
      });

      res.json({
        success: true,
        data: maintenanceRecords,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Validation schema for scheduled maintenance
const createScheduledMaintenanceSchema = Joi.object({
  scheduled_date: Joi.string().required().custom((value, helpers) => {
    // Parse the date string (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return helpers.error('any.invalid');
    }
    
    // Create date object and validate it's in the future
    const scheduledDate = new Date(value + 'T00:00:00.000Z');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduledDate <= today) {
      return helpers.error('date.min');
    }
    
    return value;
  }, 'Date validation').messages({
    'any.required': 'Scheduled date is required',
    'any.invalid': 'Valid scheduled date is required (YYYY-MM-DD format)',
    'date.min': 'Scheduled date must be in the future'
  }),
  service_description: Joi.string().trim().min(1).required().messages({
    'any.required': 'Service description is required',
    'string.empty': 'Service description is required'
  }),
  notification_days_before: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Notification days must be a valid number',
    'number.integer': 'Notification days must be an integer',
    'number.min': 'Notification days must be positive'
  })
});

/**
 * @swagger
 * /maintenance/bikes/{bikeId}/scheduled-maintenance:
 *   get:
 *     summary: Get scheduled maintenance for a specific bike
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bike ID
 *     responses:
 *       200:
 *         description: Scheduled maintenance retrieved successfully
 *       404:
 *         description: Bike not found
 *       403:
 *         description: Unauthorized access to bike
 */
router.get('/bikes/:bikeId/scheduled-maintenance', 
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate bike ID
      const { bikeId } = req.params;
      if (!validateUUID(bikeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bike ID',
        });
      }

      // Verify bike ownership
      const bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          ownerId: req.user!.id,
        },
      });

      if (!bike) {
        return res.status(404).json({
          success: false,
          message: 'Bike not found or unauthorized access',
        });
      }

      const scheduledMaintenance = await prisma.scheduledMaintenance.findMany({
        where: {
          bikeId: bikeId,
          isCompleted: false,
        },
        orderBy: { scheduledDate: 'asc' },
      });

      res.json({
        success: true,
        data: scheduledMaintenance,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/bikes/{bikeId}/scheduled-maintenance:
 *   post:
 *     summary: Create new scheduled maintenance for a bike
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bike ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduled_date
 *               - service_description
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               service_description:
 *                 type: string
 *               notification_days_before:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Scheduled maintenance created successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Bike not found
 *       403:
 *         description: Unauthorized access to bike
 */
router.post('/bikes/:bikeId/scheduled-maintenance', 
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate bike ID
      const { bikeId } = req.params;
      if (!validateUUID(bikeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bike ID',
        });
      }

      // Validate request body
      const { error, value } = createScheduledMaintenanceSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: error.details.map(detail => ({ msg: detail.message, path: detail.path[0] })),
        });
      }

      const { scheduled_date, service_description, notification_days_before } = value;

      // Verify bike ownership
      const bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          ownerId: req.user!.id,
        },
      });

      if (!bike) {
        return res.status(404).json({
          success: false,
          message: 'Bike not found or unauthorized access',
        });
      }

      const scheduledMaintenance = await prisma.scheduledMaintenance.create({
        data: {
          bikeId: bikeId,
          scheduledDate: new Date(scheduled_date + 'T00:00:00.000Z'),
          serviceDescription: service_description,
          notificationDaysBefore: notification_days_before || null,
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
      });

      res.status(201).json({
        success: true,
        message: 'Scheduled maintenance created successfully',
        data: scheduledMaintenance,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/scheduled-maintenance/{scheduledId}:
 *   get:
 *     summary: Get a specific scheduled maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduledId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scheduled maintenance ID
 *     responses:
 *       200:
 *         description: Scheduled maintenance retrieved successfully
 *       404:
 *         description: Scheduled maintenance not found
 *       403:
 *         description: Unauthorized access
 */
router.get('/scheduled-maintenance/:scheduledId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate scheduled maintenance ID
      const { scheduledId } = req.params;
      if (!validateUUID(scheduledId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled maintenance ID',
        });
      }

      const scheduledMaintenance = await prisma.scheduledMaintenance.findFirst({
        where: {
          id: scheduledId,
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
      });

      if (!scheduledMaintenance) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled maintenance not found or unauthorized access',
        });
      }

      res.json({
        success: true,
        data: scheduledMaintenance,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/scheduled-maintenance/{scheduledId}:
 *   put:
 *     summary: Update a scheduled maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduledId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scheduled maintenance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduled_date
 *               - service_description
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               service_description:
 *                 type: string
 *               notification_days_before:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Scheduled maintenance updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Scheduled maintenance not found
 *       403:
 *         description: Unauthorized access
 */
router.put('/scheduled-maintenance/:scheduledId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate scheduled maintenance ID
      const { scheduledId } = req.params;
      if (!validateUUID(scheduledId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled maintenance ID',
        });
      }

      // Validate request body
      const { error, value } = createScheduledMaintenanceSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: error.details.map(detail => ({ msg: detail.message, path: detail.path[0] })),
        });
      }

      const { scheduled_date, service_description, notification_days_before } = value;

      // Verify ownership before updating
      const existingRecord = await prisma.scheduledMaintenance.findFirst({
        where: {
          id: scheduledId,
          bike: {
            ownerId: req.user!.id,
          },
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled maintenance not found or unauthorized access',
        });
      }

      const updatedRecord = await prisma.scheduledMaintenance.update({
        where: {
          id: scheduledId,
        },
        data: {
          scheduledDate: new Date(scheduled_date + 'T00:00:00.000Z'),
          serviceDescription: service_description,
          notificationDaysBefore: notification_days_before || null,
        },
        include: {
          bike: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Scheduled maintenance updated successfully',
        data: updatedRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/scheduled-maintenance/{scheduledId}:
 *   delete:
 *     summary: Delete a scheduled maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduledId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scheduled maintenance ID
 *     responses:
 *       200:
 *         description: Scheduled maintenance deleted successfully
 *       404:
 *         description: Scheduled maintenance not found
 *       403:
 *         description: Unauthorized access
 */
router.delete('/scheduled-maintenance/:scheduledId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate scheduled maintenance ID
      const { scheduledId } = req.params;
      if (!validateUUID(scheduledId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled maintenance ID',
        });
      }

      // Verify ownership before deleting
      const existingRecord = await prisma.scheduledMaintenance.findFirst({
        where: {
          id: scheduledId,
          bike: {
            ownerId: req.user!.id,
          },
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled maintenance not found or unauthorized access',
        });
      }

      await prisma.scheduledMaintenance.delete({
        where: {
          id: scheduledId,
        },
      });

      res.json({
        success: true,
        message: 'Scheduled maintenance deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/bikes/{bikeId}/maintenance:
 *   post:
 *     summary: Create a new maintenance record for a bike
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bike ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_date
 *               - mechanic_name
 *               - service_description
 *             properties:
 *               service_date:
 *                 type: string
 *                 format: date
 *               mechanic_name:
 *                 type: string
 *               service_description:
 *                 type: string
 *               cost:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       201:
 *         description: Maintenance record created successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Bike not found
 *       403:
 *         description: Unauthorized access to bike
 */
router.post('/bikes/:bikeId/maintenance', 
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate bike ID
      const { bikeId } = req.params;
      if (!validateUUID(bikeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bike ID',
        });
      }

      // Validate request body
      const { error, value } = createMaintenanceSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: error.details.map(detail => ({ msg: detail.message, path: detail.path[0] })),
        });
      }

      const { service_date, mechanic_name, service_description, cost } = value;

      // Verify bike ownership
      const bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          ownerId: req.user!.id,
        },
      });

      if (!bike) {
        return res.status(404).json({
          success: false,
          message: 'Bike not found or unauthorized access',
        });
      }

      const maintenanceRecord = await prisma.maintenanceRecord.create({
        data: {
          bikeId: bikeId,
          serviceDate: new Date(service_date),
          serviceDescription: service_description,
          mechanicName: mechanic_name,
          cost: cost ? parseFloat(cost) : null,
        },
        include: {
          bike: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance record created successfully',
        data: maintenanceRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/{maintenanceId}:
 *   get:
 *     summary: Get a specific maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The maintenance record ID
 *     responses:
 *       200:
 *         description: Maintenance record retrieved successfully
 *       404:
 *         description: Maintenance record not found
 *       403:
 *         description: Unauthorized access
 */
router.get('/:maintenanceId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate maintenance ID
      const { maintenanceId } = req.params;
      if (!validateUUID(maintenanceId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance ID',
        });
      }

      const maintenanceRecord = await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
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
      });

      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found or unauthorized access',
        });
      }

      res.json({
        success: true,
        data: maintenanceRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/{maintenanceId}:
 *   put:
 *     summary: Update a maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The maintenance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_date
 *               - mechanic_name
 *               - service_description
 *             properties:
 *               service_date:
 *                 type: string
 *                 format: date
 *               mechanic_name:
 *                 type: string
 *               service_description:
 *                 type: string
 *               cost:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       200:
 *         description: Maintenance record updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Maintenance record not found
 *       403:
 *         description: Unauthorized access
 */
router.put('/:maintenanceId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate maintenance ID
      const { maintenanceId } = req.params;
      if (!validateUUID(maintenanceId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance ID',
        });
      }

      // Validate request body
      const { error, value } = createMaintenanceSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: error.details.map(detail => ({ msg: detail.message, path: detail.path[0] })),
        });
      }

      const { service_date, mechanic_name, service_description, cost } = value;

      // Verify ownership before updating
      const existingRecord = await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          bike: {
            ownerId: req.user!.id,
          },
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found or unauthorized access',
        });
      }

      const updatedRecord = await prisma.maintenanceRecord.update({
        where: {
          id: maintenanceId,
        },
        data: {
          serviceDate: new Date(service_date),
          serviceDescription: service_description,
          mechanicName: mechanic_name,
          cost: cost ? parseFloat(cost) : null,
        },
        include: {
          bike: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Maintenance record updated successfully',
        data: updatedRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /maintenance/{maintenanceId}:
 *   delete:
 *     summary: Delete a maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The maintenance record ID
 *     responses:
 *       200:
 *         description: Maintenance record deleted successfully
 *       404:
 *         description: Maintenance record not found
 *       403:
 *         description: Unauthorized access
 */
router.delete('/:maintenanceId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate maintenance ID
      const { maintenanceId } = req.params;
      if (!validateUUID(maintenanceId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance ID',
        });
      }

      // Verify ownership before deleting
      const existingRecord = await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          bike: {
            ownerId: req.user!.id,
          },
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found or unauthorized access',
        });
      }

      await prisma.maintenanceRecord.delete({
        where: {
          id: maintenanceId,
        },
      });

      res.json({
        success: true,
        message: 'Maintenance record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;