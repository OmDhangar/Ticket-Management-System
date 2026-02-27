import { Router } from 'express';
import { listUsers, getUser, getMe } from '../controllers/user.controller.js';
import { authenticate, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 *                     pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', adminOnly, listUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 */
router.get('/:id', adminOnly, getUser);

export default router;
