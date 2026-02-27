import { addComment, getComments } from '../services/comment.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * POST /api/v1/tickets/:id/comments
 */
export const createComment = async (req, res, next) => {
    try {
        const comment = await addComment({
            ticketId: req.params.id,
            authorId: req.user.id,
            actorRole: req.user.role,
            content: req.body.content,
        });
        return sendCreated(res, 'Comment added successfully.', comment);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/tickets/:id/comments
 */
export const listComments = async (req, res, next) => {
    try {
        const comments = await getComments({
            ticketId: req.params.id,
            actorId: req.user.id,
            actorRole: req.user.role,
        });
        return sendSuccess(res, 200, 'Comments retrieved successfully.', comments);
    } catch (error) {
        next(error);
    }
};