import { registerUser, loginUser } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const result = await registerUser(req.body);
        return sendCreated(res, 'Account created successfully.', result);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        return sendSuccess(res, 200, 'Logged in successfully.', result);
    } catch (error) {
        next(error);
    }
};