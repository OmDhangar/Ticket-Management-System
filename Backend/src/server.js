import './config/env.js';
import app from './app.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';
import prisma from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const PORT = process.env.PORT || config.port || 5000;

async function startServer() {
    try {
        // DB connection
        await prisma.$connect();
        logger.info('✅ Database connection established', {
            environment: config.nodeEnv,
        });

        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server started`, {
                port: PORT,
                environment: config.nodeEnv,
                docsUrl: `/api/docs`,
                healthUrl: `/health`,
            });
        });

        // Shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Starting shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed.');
                await prisma.$disconnect();
                logger.info('Database disconnected. Goodbye! 👋');
                process.exit(0);
            });

            // Force exit after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout.');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Promise Rejection', {
                reason: reason?.message || reason,
                stack: reason?.stack,
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', {
                error: error.message,
                stack: error.stack,
            });
            process.exit(1);
        });
    } catch (error) {
        logger.error('Failed to start server', { error: error.message, stack: error.stack });
        await prisma.$disconnect();
        process.exit(1);
    }
}

startServer();