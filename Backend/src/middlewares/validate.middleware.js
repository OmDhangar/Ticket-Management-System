import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Factory function that returns Express middleware for validating request data
 * using a Zod schema.
 *
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            // Replace request data with parsed/transformed data (handles defaults, transforms)
            req[source] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                return sendError(res, 400, 'Validation failed', errors);
            }
            next(error);
        }
    };
};