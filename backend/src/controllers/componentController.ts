import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthenticatedRequest } from '../middleware/authNew';

const prisma = new PrismaClient();

// Validation schemas
const createComponentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  installationDate: Joi.date().allow('').optional(),
  observation: Joi.string().max(500).allow('').optional()
});

const updateComponentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  installationDate: Joi.date().allow('').optional(),
  observation: Joi.string().max(500).allow('').optional()
});


export const getBikeComponents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { bikeId } = req.params;

    // Verify bike belongs to user
    const bike = await prisma.bike.findFirst({
      where: {
        id: bikeId,
        ownerId: req.user.userId
      }
    });

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    const components = await prisma.component.findMany({
      where: {
        bikeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Components retrieved successfully',
      data: components
    });

  } catch (error) {
    console.error('Get bike components error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving components'
    });
  }
};

export const getComponentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const component = await prisma.component.findFirst({
      where: {
        id,
        bike: {
          ownerId: req.user.userId
        }
      },
      include: {
        bike: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }

    res.json({
      success: true,
      message: 'Component retrieved successfully',
      data: component
    });

  } catch (error) {
    console.error('Get component by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving component'
    });
  }
};

export const createComponent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { bikeId } = req.params;

    // Verify bike belongs to user
    const bike = await prisma.bike.findFirst({
      where: {
        id: bikeId,
        ownerId: req.user.userId
      }
    });

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    // Validate input
    const { error, value } = createComponentSchema.validate(req.body);
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

    const { name, description, installationDate, observation } = value;

    const component = await prisma.component.create({
      data: {
        name,
        description,
        installationDate: installationDate ? new Date(installationDate) : null,
        observation,
        bikeId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Component created successfully',
      data: component
    });

  } catch (error) {
    console.error('Create component error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating component'
    });
  }
};

export const updateComponent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    // Validate input
    const { error, value } = updateComponentSchema.validate(req.body);
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

    // Check if component exists and belongs to user's bike
    const existingComponent = await prisma.component.findFirst({
      where: {
        id,
        bike: {
          ownerId: req.user.userId
        }
      }
    });

    if (!existingComponent) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (value.name !== undefined) updateData.name = value.name;
    if (value.description !== undefined) updateData.description = value.description;
    if (value.installationDate !== undefined) {
      updateData.installationDate = value.installationDate ? new Date(value.installationDate) : null;
    }
    if (value.observation !== undefined) updateData.observation = value.observation;

    const updatedComponent = await prisma.component.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Component updated successfully',
      data: updatedComponent
    });

  } catch (error) {
    console.error('Update component error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating component'
    });
  }
};

export const deleteComponent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    // Check if component exists and belongs to user's bike
    const existingComponent = await prisma.component.findFirst({
      where: {
        id,
        bike: {
          ownerId: req.user.userId
        }
      }
    });

    if (!existingComponent) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }

    // Delete component
    await prisma.component.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Component deleted successfully'
    });

  } catch (error) {
    console.error('Delete component error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting component'
    });
  }
};