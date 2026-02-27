import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { requestIdMiddleware, requestLoggerMiddleware } from './middlewares/requestLogger.middleware.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ticketRoutes from './routes/ticket.routes.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(
    cors({
        origin: config.cors.origin,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
        exposedHeaders: ['x-request-id'],
    })
);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Swagger UI
app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Ticket Management API Docs',
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
);

// OpenAPI JSON spec endpoint
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
});

// Health Check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// Error Handlers (must be LAST)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;