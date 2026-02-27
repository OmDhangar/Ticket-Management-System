import prisma from '../config/database.js';

/**
 * Create an audit log entry
 * @param {object} data - { action, actorId?, ticketId?, meta? }
 */
export const createAuditLog = (data) =>
    prisma.auditLog.create({ data });

/**
 * List audit logs for a specific ticket
 */
export const listAuditLogsByTicket = (ticketId) =>
    prisma.auditLog.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'asc' },
    });