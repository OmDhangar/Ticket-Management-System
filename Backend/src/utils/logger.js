import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists at project root
const logsDir = path.join(__dirname, '../../logs');

/**
 * Custom log format: JSON with timestamp, level, message, and meta fields.
 * Human-readable in development, pure JSON in production.
 */
const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const prettyFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

const logger = winston.createLogger({
    level: config.logging.level,
    defaultMeta: { service: 'ticket-management-api' },
    transports: [
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: jsonFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
        // Write error-level logs to error.log
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: jsonFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});

// In development, also log to console with pretty format
if (config.nodeEnv !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: prettyFormat,
        })
    );
}

/**
 * Log a domain event (ticket create, assign, status change, etc.)
 * @param {string} action - Domain action name
 * @param {object} meta - Contextual metadata (ticketId, actorId, etc.)
 */
export const logDomainEvent = (action, meta = {}) => {
    logger.info(action, {
        type: 'domain_event',
        action,
        ...meta,
    });
};

/**
 * Log an authentication event (login, register, failures)
 * @param {string} action - Auth action
 * @param {object} meta - Contextual metadata
 */
export const logAuthEvent = (action, meta = {}) => {
    logger.info(action, {
        type: 'auth_event',
        action,
        ...meta,
    });
};

export default logger;