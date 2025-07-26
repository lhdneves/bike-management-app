import { Request, Response } from 'express';
import { PrismaClient, BikeType, TractionType } from '@prisma/client';
import Joi from 'joi';
import { AuthenticatedRequest } from '../middleware/authNew';

const prisma = new PrismaClient();

// Validation schemas
const createBikeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  manufacturer: Joi.string().max(100).allow('').optional(),
  type: Joi.string().valid('SPEED', 'MOUNTAIN_BIKE', 'ELECTRIC', 'URBAN').required(),
  tractionType: Joi.string().valid('MANUAL', 'ASSISTED').required()
});

const updateBikeSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  manufacturer: Joi.string().max(100).allow('').optional(),
  type: Joi.string().valid('SPEED', 'MOUNTAIN_BIKE', 'ELECTRIC', 'URBAN').optional(),
  tractionType: Joi.string().valid('MANUAL', 'ASSISTED').optional()
});


export const getBikes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const bikes = await prisma.bike.findMany({
      where: {
        ownerId: req.user.userId
      },
      include: {
        components: {
          select: {
            id: true,
            name: true,
            installationDate: true
          }
        },
        _count: {
          select: {
            components: true,
            maintenanceRecords: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Bikes retrieved successfully',
      data: bikes
    });

  } catch (error) {
    console.error('Get bikes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving bikes'
    });
  }
};

export const getBikeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const bike = await prisma.bike.findFirst({
      where: {
        id,
        ownerId: req.user.userId
      },
      include: {
        components: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        maintenanceRecords: {
          orderBy: {
            serviceDate: 'desc'
          },
          take: 5 // Last 5 maintenance records
        },
        scheduledMaintenance: {
          where: {
            isCompleted: false
          },
          orderBy: {
            scheduledDate: 'asc'
          }
        }
      }
    });

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    res.json({
      success: true,
      message: 'Bike retrieved successfully',
      data: bike
    });

  } catch (error) {
    console.error('Get bike by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving bike'
    });
  }
};

export const createBike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate input
    const { error, value } = createBikeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { name, description, manufacturer, type, tractionType } = value;

    const bike = await prisma.bike.create({
      data: {
        name,
        description,
        manufacturer,
        type: type as BikeType,
        tractionType: tractionType as TractionType,
        ownerId: req.user.userId
      },
      include: {
        components: true,
        _count: {
          select: {
            components: true,
            maintenanceRecords: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bike created successfully',
      data: bike
    });

  } catch (error) {
    console.error('Create bike error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating bike'
    });
  }
};

export const updateBike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    // Validate input
    const { error, value } = updateBikeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Check if bike exists and belongs to user
    const existingBike = await prisma.bike.findFirst({
      where: {
        id,
        ownerId: req.user.userId
      }
    });

    if (!existingBike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (value.name !== undefined) updateData.name = value.name;
    if (value.description !== undefined) updateData.description = value.description;
    if (value.manufacturer !== undefined) updateData.manufacturer = value.manufacturer;
    if (value.type !== undefined) updateData.type = value.type as BikeType;
    if (value.tractionType !== undefined) updateData.tractionType = value.tractionType as TractionType;

    const updatedBike = await prisma.bike.update({
      where: { id },
      data: updateData,
      include: {
        components: true,
        _count: {
          select: {
            components: true,
            maintenanceRecords: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Bike updated successfully',
      data: updatedBike
    });

  } catch (error) {
    console.error('Update bike error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating bike'
    });
  }
};

export const deleteBike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    // Check if bike exists and belongs to user
    const existingBike = await prisma.bike.findFirst({
      where: {
        id,
        ownerId: req.user.userId
      }
    });

    if (!existingBike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    // Delete bike (cascade will handle components and maintenance records)
    await prisma.bike.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Bike deleted successfully'
    });

  } catch (error) {
    console.error('Delete bike error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting bike'
    });
  }
};

export const getBikeStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const stats = await prisma.$transaction([
      // Total bikes
      prisma.bike.count({
        where: { ownerId: req.user.userId }
      }),
      // Total components
      prisma.component.count({
        where: {
          bike: {
            ownerId: req.user.userId
          }
        }
      }),
      // Total maintenance records
      prisma.maintenanceRecord.count({
        where: {
          bike: {
            ownerId: req.user.userId
          }
        }
      }),
      // Upcoming scheduled maintenance
      prisma.scheduledMaintenance.count({
        where: {
          bike: {
            ownerId: req.user.userId
          },
          isCompleted: false,
          scheduledDate: {
            gte: new Date()
          }
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Bike statistics retrieved successfully',
      data: {
        totalBikes: stats[0],
        totalComponents: stats[1],
        totalMaintenanceRecords: stats[2],
        upcomingMaintenance: stats[3]
      }
    });

  } catch (error) {
    console.error('Get bike stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics'
    });
  }
};