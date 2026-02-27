import prisma from '../config/database.js';

const commentInclude = {
    author: {
        select: { id: true, name: true, email: true },
    },
};

/**
 * Create a comment on a ticket
 */
export const createComment = (data) =>
    prisma.comment.create({
        data,
        include: commentInclude,
    });

/**
 * List comments for a ticket (oldest first)
 */
export const listCommentsByTicket = (ticketId) =>
    prisma.comment.findMany({
        where: { ticketId },
        include: commentInclude,
        orderBy: { createdAt: 'asc' },
    });