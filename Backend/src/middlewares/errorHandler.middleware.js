import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express middleware chain.
 *
 * Handles:
 * - Zod validation errors → 400
 * - Prisma unique constraint violations → 409
 * - Prisma not-found errors → 404
 * - JWT errors → 401
 * - Custom AppError → appropriate status
 * - Unhandled errors → 500
 */
export const globalErrorHandler = (err, req, res, next) => {
    logger.error('Unhandled error', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.id || null,
        error: err.message,
        stack: config.nodeEnv !== 'production' ? err.stack : undefined,
        name: err.name,
    });

    if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            details: errors,
        });
    }

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': {
                // Unique constraint violation
                const field = err.meta?.target?.[0] || 'field';
                return res.status(409).json({
                    success: false,
                    message: `A record with this ${field} already exists.`,
                });
            }
            case 'P2025':
                // Record not found
                return res.status(404).json({
                    success: false,
                    message: 'The requested resource was not found.',
                });
            case 'P2003':
                // Foreign key constraint
                return res.status(400).json({
                    success: false,
                    message: 'Referenced resource does not exist.',
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Database operation failed.',
                });
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid data provided.',
        });
    }

    // Custom AppError with a status code
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
    }

    // JWT errors (fallback, usually caught in auth middleware)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired.' });
    }

    // Default 500
    return res.status(500).json({
        success: false,
        message: 'An unexpected internal server error occurred.',
        ...(config.nodeEnv !== 'production' ? { debug: err.message } : {}),
    });
};

/**
 * Handle 404 Not Found for unmatched routes
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
};

/**
 * Custom application error class
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}