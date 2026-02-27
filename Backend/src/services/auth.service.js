import bcrypt from 'bcrypt';
import { config } from '../config/env.js';
import { generateToken, sanitizeUser } from '../utils/jwt.js';
import { logAuthEvent } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.middleware.js';
import {
    findUserByEmail,
    findUserByEmailWithPassword,
    createUser,
} from '../repositories/user.repository.js';

/**
 * Register a new user
 * @param {object} data - { name, email, password }
 * @returns {{ accessToken, user }}
 */
export const registerUser = async ({ name, email, password }) => {
    // Check for existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        logAuthEvent('REGISTER_FAILED_EMAIL_EXISTS', { email });
        throw new AppError('An account with this email already exists.', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Create user
    const user = await createUser({
        name,
        email,
        password: hashedPassword,
        role: 'USER',
    });

    // Generate token
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });

    logAuthEvent('USER_REGISTERED', { userId: user.id, email: user.email });

    return { accessToken, user: sanitizeUser(user) };
};

/**
 * Login an existing user
 * @param {object} data - { email, password }
 * @returns {{ accessToken, user }}
 */
export const loginUser = async ({ email, password }) => {
    // Fetch user WITH password for comparison
    const user = await findUserByEmailWithPassword(email);

    if (!user) {
        logAuthEvent('LOGIN_FAILED_USER_NOT_FOUND', { email });
        // Use generic message to prevent user enumeration
        throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
        logAuthEvent('LOGIN_FAILED_INACTIVE_ACCOUNT', { email, userId: user.id });
        throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        logAuthEvent('LOGIN_FAILED_WRONG_PASSWORD', { email, userId: user.id });
        throw new AppError('Invalid email or password.', 401);
    }

    // Generate token
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });

    logAuthEvent('USER_LOGGED_IN', { userId: user.id, email: user.email, role: user.role });

    return { accessToken, user: sanitizeUser(user) };
};