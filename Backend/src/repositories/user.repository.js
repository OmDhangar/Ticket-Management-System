import prisma from '../config/database.js';

// Fields to select by default (never return password)
const safeUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};

/**
 * Find a user by ID (safe fields only)
 */
export const findUserById = (id) =>
    prisma.user.findUnique({ where: { id }, select: safeUserSelect });

/**
 * Find a user by email (includes password for auth comparison)
 */
export const findUserByEmailWithPassword = (email) =>
    prisma.user.findUnique({ where: { email } });

/**
 * Find a user by email (safe fields only)
 */
export const findUserByEmail = (email) =>
    prisma.user.findUnique({ where: { email }, select: safeUserSelect });

/**
 * Create a new user
 */
export const createUser = (data) =>
    prisma.user.create({
        data,
        select: safeUserSelect,
    });

/**
 * List all users with pagination (admin use)
 */
export const listUsers = async ({ skip, take }) => {
    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            skip,
            take,
            select: safeUserSelect,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
    ]);
    return { users, total };
};