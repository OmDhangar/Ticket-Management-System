import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate a JWT access token for a user
 * @param {object} payload - { id, email, role }
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'ticket-management-api',
    });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret, {
        issuer: 'ticket-management-api',
    });
};

/**
 * Safely strip the password field from a user object
 * @param {object} user - Prisma user object
 * @returns {object} User without password
 */
export const sanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
};