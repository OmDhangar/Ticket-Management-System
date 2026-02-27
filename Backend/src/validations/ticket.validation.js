import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' }),
});

const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
    errorMap: () => ({ message: 'Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED' }),
});

export const createTicketSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title cannot exceed 255 characters'),

    description: z
        .string({ required_error: 'Description is required' })
        .trim()
        .min(10, 'Description must be at least 10 characters'),

    priority: priorityEnum.optional().default('MEDIUM'),

    dueDate: z
        .string()
        .datetime({ message: 'dueDate must be a valid ISO 8601 datetime' })
        .optional()
        .nullable(),

    assigneeId: z
        .string()
        .uuid('assigneeId must be a valid UUID')
        .optional()
        .nullable(),
});

export const updateTicketSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title cannot exceed 255 characters')
        .optional(),

    description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters')
        .optional(),

    priority: priorityEnum.optional(),

    dueDate: z
        .string()
        .datetime({ message: 'dueDate must be a valid ISO 8601 datetime' })
        .optional()
        .nullable(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

export const assignTicketSchema = z.object({
    assigneeId: z
        .string({ required_error: 'assigneeId is required' })
        .uuid('assigneeId must be a valid UUID'),
});

export const updateStatusSchema = z.object({
    status: statusEnum,
});

export const ticketQuerySchema = z.object({
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assigneeId: z.string().uuid().optional(),
    createdBy: z.string().uuid().optional(),
    page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1))
        .pipe(z.number().min(1, 'Page must be at least 1')),
    limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 10))
        .pipe(z.number().min(1).max(100, 'Limit cannot exceed 100')),
});