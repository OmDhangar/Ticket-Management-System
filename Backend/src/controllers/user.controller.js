import { getAllUsers, getUserById } from '../services/user.service.js';
import { sendSuccess, parsePagination } from '../utils/response.js';

export const getMe = (req, res) => {
    return sendSuccess(res, 200, 'Profile retrieved successfully.', req.user);
};


/**
 * GET /api/v1/users
 * Admin only — paginated user list
 */
export const listUsers = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const result = await getAllUsers({ page, limit, skip });
        return sendSuccess(res, 200, 'Users retrieved successfully.', result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/:id
 * Admin only — get single user
 */
export const getUser = async (req, res, next) => {
    try {
        const user = await getUserById(req.params.id);
        return sendSuccess(res, 200, 'User retrieved successfully.', user);
    } catch (error) {
        next(error);
    }
};