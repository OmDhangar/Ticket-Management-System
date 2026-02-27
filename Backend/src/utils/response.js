/**
 * Standardized API response helpers.
 * All responses follow the shape: { success, message, data?, errors? }
 */

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {any} data - Response data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = { success: true, message };
    if (data !== null && data !== undefined) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

/**
 * Send a created (201) response
 */
export const sendCreated = (res, message = 'Created successfully', data = null) => {
    return sendSuccess(res, 201, message, data);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} details - Additional error details
 */
export const sendError = (res, statusCode = 500, message = 'Internal server error', details = null) => {
    const response = { success: false, message };
    if (details !== null && details !== undefined) {
        response.details = details;
    }
    return res.status(statusCode).json(response);
};

/**
 * Build paginated response data
 * @param {Array} items - Page items
 * @param {number} total - Total item count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export const buildPaginatedResponse = (items, total, page, limit) => {
    return {
        items,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
    };
};

/**
 * Parse and normalize pagination params from query string
 */
export const parsePagination = (query, defaults = { page: 1, limit: 10, maxLimit: 100 }) => {
    const page = Math.max(1, parseInt(query.page) || defaults.page);
    const limit = Math.min(
        parseInt(query.limit) || defaults.limit,
        defaults.maxLimit
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};