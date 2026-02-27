import { AppError } from '../middlewares/errorHandler.middleware.js';
import { findTicketById } from '../repositories/ticket.repository.js';
import {
    createComment,
    listCommentsByTicket,
} from '../repositories/comment.repository.js';

/**
 * Check if a user has access to a ticket
 */
const assertTicketAccess = (ticket, actorId, actorRole) => {
    if (actorRole === 'ADMIN') return;
    const hasAccess =
        ticket.creatorId === actorId || ticket.assigneeId === actorId;
    if (!hasAccess) {
        throw new AppError('You do not have access to this ticket.', 403);
    }
};

/**
 * Add a comment to a ticket
 */
export const addComment = async ({ ticketId, authorId, actorRole, content }) => {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    assertTicketAccess(ticket, authorId, actorRole);

    return createComment({ ticketId, authorId, content });
};

/**
 * Get all comments for a ticket
 */
export const getComments = async ({ ticketId, actorId, actorRole }) => {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    assertTicketAccess(ticket, actorId, actorRole);

    return listCommentsByTicket(ticketId);
};