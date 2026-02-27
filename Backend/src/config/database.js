import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

/**
 * Singleton Prisma client instance.
 * Prevents multiple connections during hot reloads in development.
 */

const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            config.nodeEnv === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['warn', 'error'],
    });

if (config.nodeEnv !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;