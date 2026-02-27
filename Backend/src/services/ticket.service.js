import { AppError } from '../middlewares/errorHandler.middleware.js';
import { logDomainEvent } from '../utils/logger.js';
import { buildPaginatedResponse } from '../utils/response.js';
import { findUserById } from '../repositories/user.repository.js';
import {
    createTicket,
    findTicketById,
    listTickets,
    updateTicket,
    softDeleteTicket,
} from '../repositories/ticket.repository.js';
import { createAuditLog } from '../repositories/auditLog.repository.js';

/**
 * Create a new ticket
 */
export const createNewTicket = async ({ actorId, actorRole, body }) => {
    const { title, description, priority, dueDate, assigneeId } = body;

    // Only admins can assign on create
    if (assigneeId && actorRole !== 'ADMIN') {
        throw new AppError('Only admins can assign tickets during creation.', 403);
    }

    // Validate assignee exists if provided
    if (assigneeId) {
        const assignee = await findUserById(assigneeId);
        if (!assignee) {
            throw new AppError('Assignee not found.', 404);
        }
    }

    const ticket = await createTicket({
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId: actorId,
        assigneeId: assigneeId || null,
    });

    // Audit log
    await createAuditLog({
        ticketId: ticket.id,
        actorId,
        action: 'TICKET_CREATED',
        meta: { title, priority: ticket.priority, assigneeId: ticket.assigneeId },
    });

    logDomainEvent('TICKET_CREATED', {
        ticketId: ticket.id,
        actorId,
        title,
        priority: ticket.priority,
    });

    return ticket;
};

/**
 * Get a ticket by ID with access control
 */
export const getTicketById = async ({ ticketId, actorId, actorRole }) => {
    const ticket = await findTicketById(ticketId);

    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    // Access control: users can only see their own created/assigned tickets
    if (actorRole !== 'ADMIN') {
        const hasAccess =
            ticket.creatorId === actorId || ticket.assigneeId === actorId;
        if (!hasAccess) {
            throw new AppError('You do not have access to this ticket.', 403);
        }
    }

    return ticket;
};

/**
 * List tickets with filters
 */
export const listAllTickets = async ({ actorId, actorRole, query }) => {
    const { status, priority, assigneeId, createdBy, page, limit } = query;
    const skip = (page - 1) * limit;

    // Base where clause: never show soft-deleted tickets
    const where = { isDeleted: false };

    // Filters from query
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (createdBy) where.creatorId = createdBy;

    // Users only see tickets they created or are assigned to
    if (actorRole !== 'ADMIN') {
        where.OR = [{ creatorId: actorId }, { assigneeId: actorId }];
    }

    const { tickets, total } = await listTickets({ where, skip, take: limit });
    return buildPaginatedResponse(tickets, total, page, limit);
};

/**
 * Update ticket fields (creator or admin)
 */
export const updateTicketById = async ({ ticketId, actorId, actorRole, body }) => {
    const ticket = await findTicketById(ticketId);

    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    // Only creator or admin can update
    if (actorRole !== 'ADMIN' && ticket.creatorId !== actorId) {
        throw new AppError('Only the ticket creator or an admin can update this ticket.', 403);
    }

    const { title, description, priority, dueDate } = body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await updateTicket(ticketId, updateData);

    await createAuditLog({
        ticketId,
        actorId,
        action: 'TICKET_UPDATED',
        meta: updateData,
    });

    logDomainEvent('TICKET_UPDATED', { ticketId, actorId, changes: updateData });

    return updated;
};

/**
 * Assign (or unassign) a ticket — admin only
 */
export const assignTicket = async ({ ticketId, actorId, assigneeId }) => {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    // Validate assignee exists
    const assignee = await findUserById(assigneeId);
    if (!assignee) {
        throw new AppError('Assignee not found.', 404);
    }

    const previousAssigneeId = ticket.assigneeId;
    const updated = await updateTicket(ticketId, { assigneeId });

    await createAuditLog({
        ticketId,
        actorId,
        action: 'TICKET_ASSIGNED',
        meta: { previousAssigneeId, newAssigneeId: assigneeId },
    });

    logDomainEvent('TICKET_ASSIGNED', {
        ticketId,
        actorId,
        previousAssigneeId,
        newAssigneeId: assigneeId,
    });

    return updated;
};

/**
 * Change ticket status (admin or assignee)
 */
export const changeTicketStatus = async ({ ticketId, actorId, actorRole, status }) => {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    // Admins can change any ticket; users can change only if they are the assignee
    if (actorRole !== 'ADMIN' && ticket.assigneeId !== actorId) {
        throw new AppError('Only the assigned user or an admin can change ticket status.', 403);
    }

    const previousStatus = ticket.status;
    const updated = await updateTicket(ticketId, { status });

    await createAuditLog({
        ticketId,
        actorId,
        action: 'TICKET_STATUS_CHANGED',
        meta: { previousStatus, newStatus: status },
    });

    logDomainEvent('TICKET_STATUS_CHANGED', {
        ticketId,
        actorId,
        previousStatus,
        newStatus: status,
    });

    return updated;
};

/**
 * Soft delete a ticket — admin only
 */
export const deleteTicket = async ({ ticketId, actorId }) => {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
        throw new AppError('Ticket not found.', 404);
    }

    await softDeleteTicket(ticketId);

    await createAuditLog({
        ticketId,
        actorId,
        action: 'TICKET_DELETED',
        meta: { title: ticket.title },
    });

    logDomainEvent('TICKET_DELETED', { ticketId, actorId, title: ticket.title });
};