import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z
        .string({ required_error: 'Content is required' })
        .trim()
        .min(1, 'Comment content cannot be empty')
        .max(5000, 'Comment cannot exceed 5000 characters'),
});