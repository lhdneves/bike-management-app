import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailService from '../services/emailService';

const prisma = new PrismaClient();

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('🔍 [DEBUG] Password reset request for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('👤 [DEBUG] User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('📋 [DEBUG] User ID:', user.id);
    }

    // Always return success to prevent email enumeration
    const response = {
      success: true,
      message: 'If this email exists in our system, you will receive a password reset link.',
    };

    if (!user) {
      console.log('❌ [DEBUG] No user found, returning early');
      return res.json(response);
    }

    // Check rate limiting - max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    console.log('🕐 [DEBUG] Recent tokens in last hour:', recentTokens);

    const rateLimit = parseInt(process.env.PASSWORD_RESET_RATE_LIMIT || '3');
    if (recentTokens >= rateLimit) {
      console.log('⚠️ [DEBUG] Rate limit exceeded, returning early');
      return res.json(response); // Don't reveal rate limiting
    }

    // Invalidate any existing unused tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiryMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '3600');
    const expiresAt = new Date(Date.now() + expiryMinutes * 1000);

    // Create new reset token
    console.log('🔑 [DEBUG] Creating new token:', token.substring(0, 8) + '...');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    console.log('✅ [DEBUG] Token created successfully');

    // Send password reset email
    console.log('📧 [DEBUG] Attempting to send email...');
    try {
      const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, token);
      console.log('📧 [DEBUG] Email result:', emailResult);
    } catch (emailError) {
      console.error('❌ [DEBUG] Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    console.log('✅ [DEBUG] Password reset request completed');
    res.json(response);
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Check if token exists and is valid
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        email: resetToken.user.email,
        name: resetToken.user.name,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};