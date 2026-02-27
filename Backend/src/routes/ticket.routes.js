import { Router } from 'express';
import {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    assign,
    updateStatus,
    removeTicket,
} from '../controllers/ticket.controller.js';
import { createComment, listComments } from '../controllers/comment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    createTicketSchema,
    updateTicketSchema,
    assignTicketSchema,
    updateStatusSchema,
    ticketQuerySchema,
} from '../validations/ticket.validation.js';
import { createCommentSchema } from '../validations/comment.validation.js';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Login button not working"
 *               description:
 *                 type: string
 *                 example: "The login button on the homepage does not respond when clicked."
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59.000Z"
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 description: "Admin only - assign on creation"
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', validate(createTicketSchema), createTicket);

/**
 * @swagger
 * /api/v1/tickets:
 *   get:
 *     summary: List tickets (admin sees all; users see own tickets)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *       - in: query
 *         name: assigneeId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: createdBy
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated ticket list
 */
router.get('/', validate(ticketQuerySchema, 'query'), getTickets);

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID (with comments)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ticket detail with comments
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', getTicket);

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   patch:
 *     summary: Update ticket (creator or admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Ticket updated
 *       403:
 *         description: Forbidden
 */
router.patch('/:id', validate(updateTicketSchema), updateTicket);

/**
 * @swagger
 * /api/v1/tickets/{id}/assign:
 *   post:
 *     summary: Assign ticket to a user (admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assigneeId]
 *             properties:
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Ticket assigned
 *       403:
 *         description: Admin only
 *       404:
 *         description: Ticket or user not found
 */
router.post('/:id/assign', authorize('ADMIN'), validate(assignTicketSchema), assign);

/**
 * @swagger
 * /api/v1/tickets/{id}/status:
 *   post:
 *     summary: Change ticket status (admin or assignee)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Only admin or assignee can change status
 */
router.post('/:id/status', validate(updateStatusSchema), updateStatus);

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   delete:
 *     summary: Soft delete a ticket (admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ticket deleted
 *       403:
 *         description: Admin only
 */
router.delete('/:id', authorize('ADMIN'), removeTicket);

/**
 * @swagger
 * /api/v1/tickets/{id}/comments:
 *   post:
 *     summary: Add a comment to a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "I can reproduce this bug on Chrome v120."
 *     responses:
 *       201:
 *         description: Comment added
 *       403:
 *         description: No access to ticket
 */
router.post('/:id/comments', validate(createCommentSchema), createComment);

/**
 * @swagger
 * /api/v1/tickets/{id}/comments:
 *   get:
 *     summary: Get all comments for a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:id/comments', listComments);

export default router;