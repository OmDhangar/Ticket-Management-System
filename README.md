# 🎫 Ticket Management System — Backend API

A production-ready REST API for a Ticket Management System built with **Node.js 20**, **Express**, **PostgreSQL**, and **Prisma ORM**.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Running with Docker](#-running-with-docker)
- [Seeded Credentials](#-seeded-credentials)
- [API Endpoints](#-api-endpoints)
- [Sample cURL Requests](#-sample-curl-requests)
- [Logging](#-logging)
- [Design Decisions](#-design-decisions)

---

## 🛠 Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| Node.js 20 LTS   | Runtime                          |
| Express 4        | HTTP framework                   |
| PostgreSQL 16    | Database                         |
| Prisma ORM       | Database client + migrations     |
| Zod              | Request validation               |
| bcrypt           | Password hashing (12 rounds)     |
| jsonwebtoken     | JWT auth (1h expiry)             |
| Winston          | Structured JSON logging          |
| Helmet           | HTTP security headers            |
| Swagger / OpenAPI| API documentation at `/api/docs` |
| Docker           | Containerization                 |

---

## ✨ Features

- ✅ JWT authentication (register + login)
- ✅ Role-based access control: **ADMIN** and **USER**
- ✅ Full Ticket CRUD with soft delete
- ✅ Ticket assignment with audit trail
- ✅ Status management with audit trail
- ✅ Nested comments per ticket
- ✅ Complete AuditLog for all domain events
- ✅ Zod validation on all inputs → structured 400 errors
- ✅ Global error handler (Prisma + Zod + AppError)
- ✅ Structured Winston logging → `logs/combined.log` + `logs/error.log`
- ✅ Request ID middleware for log correlation
- ✅ Swagger UI at `/api/docs`
- ✅ Docker + docker-compose (api + postgres)
- ✅ Graceful shutdown

---

## 📁 Project Structure

```
ticket-management-system/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma singleton
│   │   ├── env.js            # Env var validation + config
│   │   └── swagger.js        # OpenAPI spec config
│   ├── controllers/          # Thin — delegate to services
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── ticket.controller.js
│   │   └── comment.controller.js
│   ├── services/             # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── ticket.service.js
│   │   └── comment.service.js
│   ├── repositories/         # DB access only
│   │   ├── user.repository.js
│   │   ├── ticket.repository.js
│   │   ├── comment.repository.js
│   │   └── auditLog.repository.js
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verify + role check
│   │   ├── validate.middleware.js      # Zod validation factory
│   │   ├── requestLogger.middleware.js # Request logging + requestId
│   │   └── errorHandler.middleware.js  # Global error handler + AppError
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── ticket.routes.js
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── ticket.validation.js
│   │   └── comment.validation.js
│   ├── utils/
│   │   ├── jwt.js            # Token generation + verification
│   │   ├── logger.js         # Winston logger
│   │   └── response.js       # Standardized response helpers
│   ├── app.js                # Express app setup
│   └── server.js             # Entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.js               # Seed admin + demo user
│   └── migrations/           # SQL migrations
├── logs/
│   ├── combined.log          # All logs
│   └── error.log             # Error-level only
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable            | Required | Default              | Description                        |
|---------------------|----------|----------------------|------------------------------------|
| `NODE_ENV`          | No       | `development`        | `development` or `production`      |
| `PORT`              | No       | `5000`               | HTTP server port                   |
| `DATABASE_URL`      | **Yes**  | —                    | PostgreSQL connection string       |
| `JWT_SECRET`        | **Yes**  | —                    | Secret key for JWT signing         |
| `JWT_EXPIRES_IN`    | No       | `1h`                 | JWT token lifetime                 |
| `CORS_ORIGIN`       | No       | `http://localhost:3000` | Allowed CORS origin             |
| `LOG_LEVEL`         | No       | `info`               | Winston log level                  |
| `SEED_ADMIN_EMAIL`  | No       | `admin@demo.com`     | Admin seed email                   |
| `SEED_ADMIN_PASSWORD`| No      | `AdminPass123!`      | Admin seed password                |

### Example `.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd ticket-management-system
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Seed the database (creates admin + demo user)
npm run seed

# 6. Start development server (with file watching)
npm run dev
```

The API will be available at: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/api/docs**

---

## 🐳 Running with Docker

No local PostgreSQL needed — everything runs in containers.

```bash
# 1. Clone the repo
git clone <repo-url>
cd ticket-management-system

# 2. Build and start all services
docker-compose up --build

# Services started:
# - postgres  → port 5432 (internal: ticket_db)
# - api       → http://localhost:5000
# - seed      → runs once, then exits (creates admin user)
```

> **Note:** The first startup may take 30–60 seconds while the database initializes and migrations run.

### Useful Docker commands:

```bash
# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop all
docker-compose down

# Stop and remove volumes (wipe database)
docker-compose down -v

# Re-run seed manually
docker-compose run --rm seed
```

---

## 🔑 Seeded Credentials

After running `npm run seed` or `docker-compose up`, these accounts exist:

| Role  | Email            | Password       |
|-------|------------------|----------------|
| ADMIN | admin@demo.com   | AdminPass123!  |
| USER  | user@demo.com    | UserPass123!   |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`  
Interactive docs: `http://localhost:5000/api/docs`

### Auth
| Method | Endpoint                  | Auth | Description          |
|--------|---------------------------|------|----------------------|
| POST   | `/auth/register`          | No   | Register new user    |
| POST   | `/auth/login`             | No   | Login, get JWT       |

### Users
| Method | Endpoint       | Auth       | Description           |
|--------|----------------|------------|-----------------------|
| GET    | `/users`       | ADMIN only | List all users        |
| GET    | `/users/:id`   | ADMIN only | Get user by ID        |

### Tickets
| Method | Endpoint                   | Auth              | Description                         |
|--------|----------------------------|-------------------|-------------------------------------|
| POST   | `/tickets`                 | Any authenticated | Create ticket                       |
| GET    | `/tickets`                 | Any authenticated | List tickets (scoped by role)       |
| GET    | `/tickets/:id`             | Any authenticated | Get ticket detail + comments        |
| PATCH  | `/tickets/:id`             | Creator or ADMIN  | Update ticket fields                |
| POST   | `/tickets/:id/assign`      | ADMIN only        | Assign/reassign ticket              |
| POST   | `/tickets/:id/status`      | ADMIN or Assignee | Change ticket status                |
| DELETE | `/tickets/:id`             | ADMIN only        | Soft delete ticket                  |

### Comments
| Method | Endpoint                   | Auth              | Description              |
|--------|----------------------------|-------------------|--------------------------|
| POST   | `/tickets/:id/comments`    | Ticket member     | Add comment              |
| GET    | `/tickets/:id/comments`    | Ticket member     | List comments            |

---

## 🧪 Sample cURL Requests

### 1. Register a new user

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "MyPass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane@example.com",
      "name": "Jane Doe",
      "role": "USER",
      "isActive": true
    }
  }
}
```

---

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "AdminPass123!"
  }'
```

> Copy the `accessToken` from the response. Use it as `Bearer <token>` in all subsequent requests.

---

### 3. Create a ticket (as any user)

```bash
export TOKEN="<your_access_token>"

curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Login button not working",
    "description": "The login button on the homepage does not respond when clicked on Chrome v120.",
    "priority": "HIGH",
    "dueDate": "2025-06-30T23:59:59.000Z"
  }'
```

---

### 4. List tickets (as admin — sees all)

```bash
curl -X GET "http://localhost:5000/api/v1/tickets?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### List tickets with filters

```bash
curl -X GET "http://localhost:5000/api/v1/tickets?status=OPEN&priority=HIGH&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Get a ticket by ID

```bash
export TICKET_ID="<ticket_uuid>"

curl -X GET "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Assign a ticket (admin only)

```bash
export USER_ID="<user_uuid>"

curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"assigneeId\": \"$USER_ID\"}"
```

---

### 7. Change ticket status (admin or assignee)

```bash
curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "IN_PROGRESS"}'
```

---

### 8. Add a comment

```bash
curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "I can reproduce this on Firefox too. Looks like a JS error."}'
```

---

### 9. Update ticket fields (creator or admin)

```bash
curl -X PATCH "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"priority": "URGENT", "title": "Login button broken - urgent"}'
```

---

### 10. Delete a ticket (admin only)

```bash
curl -X DELETE "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Logging

All logs are written to the `logs/` directory in JSON format:

- **`logs/combined.log`** — All log levels (info, warn, error)
- **`logs/error.log`** — Error level only

### Log format:
```json
{
  "level": "info",
  "message": "TICKET_CREATED",
  "service": "ticket-management-api",
  "type": "domain_event",
  "action": "TICKET_CREATED",
  "ticketId": "660f9511-...",
  "actorId": "550e8400-...",
  "timestamp": "2025-03-01T09:02:00.050+00:00"
}
```

### Request log format:
```json
{
  "level": "info",
  "message": "HTTP Request",
  "requestId": "a1b2c3d4-...",
  "method": "POST",
  "path": "/api/v1/tickets",
  "statusCode": 201,
  "durationMs": 52,
  "userId": "550e8400-...",
  "timestamp": "2025-03-01T09:02:00.000+00:00"
}
```

---

## 🏗 Design Decisions

### What was implemented beyond the spec:
1. **`requestId` middleware** — Each request gets a UUID attached (`x-request-id` header) for log correlation
2. **Two-stage Dockerfile** (builder + production) — Smaller final image, no dev deps in production
3. **Health check endpoint** at `/GET /health` — Used by Docker healthcheck
4. **`/api/docs.json` endpoint** — Exposes raw OpenAPI spec for tooling
5. **`sanitizeUser` utility** — Centralized to ensure `password` is never leaked in any response path
6. **Graceful shutdown** — SIGTERM/SIGINT handlers that close HTTP server + DB connection cleanly

### TODO (not implemented to stay in timebox):
- **Refresh tokens** — Currently using 1h access token only. In production, add a `POST /auth/refresh` endpoint with a longer-lived refresh token stored in an httpOnly cookie
- **Rate limiting** — Could add `express-rate-limit` on auth endpoints
- **Unit/integration tests** — Skipped due to timebox; repositories and services are structured to be easily testable
- **Pagination cursor** — Using offset pagination; cursor-based would be better for large datasets

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- JWTs expire in 1 hour (configurable via `JWT_EXPIRES_IN`)
- `password` field never returned in any API response
- Helmet sets secure HTTP headers
- Generic error messages for auth failures (no user enumeration)
- Non-root Docker user (`nodejs:1001`)
- Soft delete — data never permanently lost

---

## 📖 API Documentation

Swagger UI is available at: **http://localhost:5000/api/docs**

Raw OpenAPI JSON spec: **http://localhost:5000/api/docs.json**