import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Middleware: Verify JWT token and attach user to req.user
 * Validates that the user exists in DB and is active.
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Authentication required. Provide a Bearer token.');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return sendError(res, 401, 'Token not provided.');
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return sendError(res, 401, 'Token has expired. Please log in again.');
            }
            if (err.name === 'JsonWebTokenError') {
                return sendError(res, 401, 'Invalid token. Please log in again.');
            }
            return sendError(res, 401, 'Token verification failed.');
        }

        // Fetch fresh user from DB (to catch deactivated accounts)
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        if (!user) {
            return sendError(res, 401, 'User no longer exists.');
        }

        if (!user.isActive) {
            return sendError(res, 403, 'Your account has been deactivated. Contact an administrator.');
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication middleware error', { error: error.message, stack: error.stack });
        return sendError(res, 500, 'Authentication error.');
    }
};

/**
 * Middleware factory: Restrict access to specific roles
 * Must be used after `authenticate`.
 *
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN', 'USER')
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'Authentication required.');
        }

        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
            );
        }

        next();
    };
};

/**
 * Shorthand middleware: ADMIN only
 */
export const adminOnly = [authenticate, authorize('ADMIN')];