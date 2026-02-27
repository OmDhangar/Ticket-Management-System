import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * Middleware: Attach a unique requestId to each request.
 * Useful for correlating logs across a request lifecycle.
 */
export const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
};

/**
 * Middleware: Log each incoming request and its response.
 * Logs: { timestamp, level, msg, method, path, statusCode, durationMs, requestId, userId }
 */
export const requestLoggerMiddleware = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now() - startTime;
        const logData = {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            userId: req.user?.id || null,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        };

        // Use warn for 4xx, error for 5xx, info for everything else
        if (res.statusCode >= 500) {
            logger.error('HTTP Request', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });

    next();
};