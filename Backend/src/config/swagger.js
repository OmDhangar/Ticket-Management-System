import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ticket Management System API',
            version: '1.0.0',
            description: `
## Overview
A production-ready Ticket Management System REST API built with Node.js, Express, PostgreSQL, and Prisma.

## Authentication
This API uses **JWT Bearer tokens**. After login/register, include the token in requests:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Roles
- **USER**: Can create tickets, view own tickets, add comments, update ticket status (if assignee)
- **ADMIN**: Full access to all endpoints including assign/delete

## Demo Credentials
- Admin: \`admin@demo.com\` / \`AdminPass123!\`
- User:  \`user@demo.com\`  / \`UserPass123!\`
      `,
            contact: {
                name: 'API Support',
                email: 'admin@demo.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /api/v1/auth/login',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        role: { type: 'string', enum: ['USER', 'ADMIN'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Ticket: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
                        },
                        priority: {
                            type: 'string',
                            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                        },
                        creatorId: { type: 'string', format: 'uuid' },
                        assigneeId: { type: 'string', format: 'uuid', nullable: true },
                        dueDate: { type: 'string', format: 'date-time', nullable: true },
                        isDeleted: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        ticketId: { type: 'string', format: 'uuid' },
                        authorId: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuditLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        ticketId: { type: 'string', format: 'uuid', nullable: true },
                        actorId: { type: 'string', format: 'uuid', nullable: true },
                        action: { type: 'string' },
                        meta: { type: 'object', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        details: {
                            type: 'array',
                            items: { type: 'object' },
                            nullable: true,
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);