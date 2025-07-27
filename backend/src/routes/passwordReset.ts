import express from 'express';
import { requestPasswordReset, resetPassword, validateResetToken } from '../controllers/passwordResetController';

const router = express.Router();

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Request a password reset
 *     description: Send a password reset email to the user if the email exists
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset request processed (always returns success to prevent email enumeration)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/request', requestPasswordReset);

/**
 * @swagger
 * /api/password-reset/reset:
 *   post:
 *     summary: Reset password using token
 *     description: Reset user's password using a valid reset token
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token or password
 *       500:
 *         description: Internal server error
 */
router.post('/reset', resetPassword);

/**
 * @swagger
 * /api/password-reset/validate/{token}:
 *   get:
 *     summary: Validate reset token
 *     description: Check if a password reset token is valid and not expired
 *     tags: [Password Reset]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token to validate
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.get('/validate/:token', validateResetToken);

export default router;