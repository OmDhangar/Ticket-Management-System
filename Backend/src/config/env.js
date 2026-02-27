import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized environment configuration.
 * All env variable access should go through this module.
 */
export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    database: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    cors: {
        origin: [process.env.CORS_ORIGIN, 'http://localhost:3000'],
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },

    bcrypt: {
        saltRounds: 12,
    },

    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
    },
};

// Validate required env vars at startup
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please copy .env.example to .env and fill in the values.');
    process.exit(1);
}