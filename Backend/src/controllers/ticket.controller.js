import {
    createNewTicket,
    getTicketById,
    listAllTickets,
    updateTicketById,
    assignTicket,
    changeTicketStatus,
    deleteTicket,
} from '../services/ticket.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * POST /api/v1/tickets
 */
export const createTicket = async (req, res, next) => {
    try {
        const ticket = await createNewTicket({
            actorId: req.user.id,
            actorRole: req.user.role,
            body: req.body,
        });
        return sendCreated(res, 'Ticket created successfully.', ticket);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/tickets
 */
export const getTickets = async (req, res, next) => {
    try {
        const result = await listAllTickets({
            actorId: req.user.id,
            actorRole: req.user.role,
            query: req.query,
        });
        return sendSuccess(res, 200, 'Tickets retrieved successfully.', result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/tickets/:id
 */
export const getTicket = async (req, res, next) => {
    try {
        const ticket = await getTicketById({
            ticketId: req.params.id,
            actorId: req.user.id,
            actorRole: req.user.role,
        });
        return sendSuccess(res, 200, 'Ticket retrieved successfully.', ticket);
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/tickets/:id
 */
export const updateTicket = async (req, res, next) => {
    try {
        const ticket = await updateTicketById({
            ticketId: req.params.id,
            actorId: req.user.id,
            actorRole: req.user.role,
            body: req.body,
        });
        return sendSuccess(res, 200, 'Ticket updated successfully.', ticket);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/tickets/:id/assign
 */
export const assign = async (req, res, next) => {
    try {
        const ticket = await assignTicket({
            ticketId: req.params.id,
            actorId: req.user.id,
            assigneeId: req.body.assigneeId,
        });
        return sendSuccess(res, 200, 'Ticket assigned successfully.', ticket);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/tickets/:id/status
 */
export const updateStatus = async (req, res, next) => {
    try {
        const ticket = await changeTicketStatus({
            ticketId: req.params.id,
            actorId: req.user.id,
            actorRole: req.user.role,
            status: req.body.status,
        });
        return sendSuccess(res, 200, 'Ticket status updated successfully.', ticket);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/tickets/:id
 */
export const removeTicket = async (req, res, next) => {
    try {
        await deleteTicket({
            ticketId: req.params.id,
            actorId: req.user.id,
        });
        return sendSuccess(res, 200, 'Ticket deleted successfully.');
    } catch (error) {
        next(error);
    }
};