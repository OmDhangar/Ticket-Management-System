import prisma from '../config/database.js';

// Reusable include for ticket with creator + assignee names
const ticketInclude = {
    creator: {
        select: { id: true, name: true, email: true },
    },
    assignee: {
        select: { id: true, name: true, email: true },
    },
};

/**
 * Create a new ticket
 */
export const createTicket = (data) =>
    prisma.ticket.create({
        data,
        include: ticketInclude,
    });

/**
 * Find a ticket by ID (excluding soft-deleted)
 */
export const findTicketById = (id) =>
    prisma.ticket.findFirst({
        where: { id, isDeleted: false },
        include: {
            ...ticketInclude,
            comments: {
                include: {
                    author: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

/**
 * List tickets with filters and pagination
 * @param {object} where - Prisma where clause
 * @param {number} skip - Pagination offset
 * @param {number} take - Page size
 */
export const listTickets = async ({ where, skip, take }) => {
    const [tickets, total] = await prisma.$transaction([
        prisma.ticket.findMany({
            where,
            skip,
            take,
            include: ticketInclude,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.ticket.count({ where }),
    ]);
    return { tickets, total };
};

/**
 * Update a ticket by ID
 */
export const updateTicket = (id, data) =>
    prisma.ticket.update({
        where: { id },
        data,
        include: ticketInclude,
    });

/**
 * Soft delete a ticket (sets isDeleted = true)
 */
export const softDeleteTicket = (id) =>
    prisma.ticket.update({
        where: { id },
        data: { isDeleted: true },
    });