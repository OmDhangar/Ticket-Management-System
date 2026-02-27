import { listUsers, findUserById } from '../repositories/user.repository.js';
import { AppError } from '../middlewares/errorHandler.middleware.js';
import { buildPaginatedResponse } from '../utils/response.js';

/**
 * Get paginated list of all users (admin only)
 */
export const getAllUsers = async ({ page, limit, skip }) => {
    const { users, total } = await listUsers({ skip, take: limit });
    return buildPaginatedResponse(users, total, page, limit);
};

/**
 * Get a single user by ID
 */
export const getUserById = async (id) => {
    const user = await findUserById(id);
    if (!user) {
        throw new AppError('User not found.', 404);
    }
    return user;
};