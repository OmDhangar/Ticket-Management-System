# 🎫 Ticket Management System

A full-stack Ticket Management System with a production-ready REST API (Node.js, Express, PostgreSQL, Prisma) and a React + Vite frontend with role-based views.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Frontend Setup](#-frontend-setup)
- [Running with Docker](#-running-with-docker)
- [Seeded Credentials](#-seeded-credentials)
- [API Endpoints](#-api-endpoints)
- [Sample cURL Requests](#-sample-curl-requests)
- [Logging](#-logging)
- [Scalability](#-scalability)
- [Design Decisions](#-design-decisions)

---

## 🛠 Tech Stack

### Backend

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

### Frontend

| Technology       | Purpose                              |
|------------------|--------------------------------------|
| React 18         | UI framework                         |
| Vite             | Dev server + bundler                 |
| TypeScript       | Type safety                          |
| React Router v6  | Client-side routing                  |
| TanStack Query   | Server state caching + fetching      |
| Zustand          | Auth store (JWT + user)              |
| shadcn/ui        | Component library (Radix + Tailwind) |
| Axios            | HTTP client                          |

---

## ✨ Features

### Backend
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

### Frontend
- ✅ Login / Register pages with JWT-backed auth
- ✅ Persistent auth via Zustand + localStorage
- ✅ **My Tickets** view — tickets created by or assigned to the logged-in user
- ✅ **All Tickets** view — admin-only; shows every ticket across all users
- ✅ **Created By** column — displays the originating user's name for each ticket
- ✅ Ticket detail page with inline title/description editing
- ✅ Comment thread per ticket
- ✅ Admin: assign tickets, change status, delete
- ✅ Filter by status, priority, full-text search
- ✅ Pagination
- ✅ Table and card view modes

---

## 📁 Project Structure

```
ticket-management-system/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # Prisma singleton
│   │   │   ├── env.js                # Env var validation
│   │   │   └── swagger.js            # OpenAPI spec config
│   │   ├── controllers/              # Thin — delegate to services
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── comment.controller.js
│   │   ├── services/                 # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── ticket.service.js
│   │   │   └── comment.service.js
│   │   ├── repositories/             # DB access only
│   │   │   ├── user.repository.js
│   │   │   ├── ticket.repository.js
│   │   │   ├── comment.repository.js
│   │   │   └── auditLog.repository.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js          # JWT verify + role check
│   │   │   ├── validate.middleware.js      # Zod validation factory
│   │   │   ├── requestLogger.middleware.js # Request logging + requestId
│   │   │   └── errorHandler.middleware.js  # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── ticket.routes.js
│   │   ├── validations/
│   │   │   ├── auth.validation.js
│   │   │   ├── ticket.validation.js
│   │   │   └── comment.validation.js
│   │   ├── utils/
│   │   │   ├── jwt.js            # Token generation + verification
│   │   │   ├── logger.js         # Winston logger
│   │   │   └── response.js       # Standardized response helpers
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── logs/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
└── Frontend/
    ├── src/
    │   ├── api/               # Typed Axios wrappers (tickets, auth, users)
    │   ├── components/        # Shared UI + feature components
    │   ├── hooks/             # TanStack Query hooks (useTickets, useComments…)
    │   ├── pages/             # Route-level page components
    │   ├── store/             # Zustand auth store
    │   ├── utils/             # formatDate, cn helpers
    │   └── router/            # React Router config + protected routes
    ├── index.html
    └── vite.config.ts
```

---

## 🔐 Environment Variables

### Backend — copy `.env.example` to `.env`:

| Variable             | Required | Default                     | Description                       |
|----------------------|----------|-----------------------------|-----------------------------------|
| `NODE_ENV`           | No       | `development`               | `development` or `production`     |
| `PORT`               | No       | `5000`                      | HTTP server port                  |
| `DATABASE_URL`       | **Yes**  | —                           | PostgreSQL connection string      |
| `JWT_SECRET`         | **Yes**  | —                           | Secret key for JWT signing        |
| `JWT_EXPIRES_IN`     | No       | `1h`                        | JWT token lifetime                |
| `CORS_ORIGIN`        | No       | `http://localhost:5173`     | Allowed CORS origin               |
| `LOG_LEVEL`          | No       | `info`                      | Winston log level                 |
| `SEED_ADMIN_EMAIL`   | No       | `admin@demo.com`            | Admin seed email                  |
| `SEED_ADMIN_PASSWORD`| No       | `AdminPass123!`             | Admin seed password               |

### Frontend — copy `Frontend/.env.example` to `Frontend/.env`:

| Variable        | Default                        | Description           |
|-----------------|--------------------------------|-----------------------|
| `VITE_API_URL`  | `http://localhost:5000/api/v1` | Backend API base URL  |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally

### Backend

```bash
cd Backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Seed the database
npm run seed

# 6. Start dev server
npm run dev
```

API: **http://localhost:5000**  
Swagger: **http://localhost:5000/api/docs**

---

## 🖥 Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment (defaults work out of the box with backend on port 5000)
cp .env.example .env

# Start dev server
npm run dev
```

UI: **http://localhost:5173**

### Roles in the UI

| Role  | Capabilities |
|-------|-------------|
| USER  | Create tickets (self-assigned), view own tickets, comment, update own tickets |
| ADMIN | Full access: view all tickets, assign tickets, change any status, delete tickets, view all users. Has "My Tickets" / "All Tickets" tab switcher. |

---

## 🐳 Running with Docker

No local PostgreSQL needed.

```bash
cd Backend

# Build and start all services
docker-compose up --build

# Services:
# - postgres  → port 5432
# - api       → http://localhost:5000
# - seed      → runs once, then exits
```

> **Note:** First startup may take 30–60 seconds while the database initialises.

```bash
# Run in background
docker-compose up -d --build

# View API logs
docker-compose logs -f api

# Stop all
docker-compose down

# Wipe database
docker-compose down -v
```

---

## 🔑 Seeded Credentials

| Role  | Email            | Password       |
|-------|------------------|----------------|
| ADMIN | admin@demo.com   | AdminPass123!  |
| USER  | user@demo.com    | UserPass123!   |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`  
Interactive docs: `http://localhost:5000/api/docs`

### Auth
| Method | Endpoint         | Auth | Description       |
|--------|------------------|------|-------------------|
| POST   | `/auth/register` | No   | Register new user |
| POST   | `/auth/login`    | No   | Login, get JWT    |

### Users
| Method | Endpoint     | Auth       | Description      |
|--------|--------------|------------|------------------|
| GET    | `/users`     | ADMIN only | List all users   |
| GET    | `/users/:id` | ADMIN only | Get user by ID   |

### Tickets
| Method | Endpoint                   | Auth              | Description                          |
|--------|----------------------------|-------------------|--------------------------------------|
| POST   | `/tickets`                 | Any authenticated | Create ticket                        |
| GET    | `/tickets`                 | Any authenticated | List tickets (scoped by role/filter) |
| GET    | `/tickets/:id`             | Any authenticated | Ticket detail + comments             |
| PATCH  | `/tickets/:id`             | Creator or ADMIN  | Update ticket fields                 |
| POST   | `/tickets/:id/assign`      | ADMIN only        | Assign / reassign ticket             |
| POST   | `/tickets/:id/status`      | ADMIN or Assignee | Change ticket status                 |
| DELETE | `/tickets/:id`             | ADMIN only        | Soft delete ticket                   |

#### `GET /tickets` — Query Parameters

| Param       | Type   | Description                                                              |
|-------------|--------|--------------------------------------------------------------------------|
| `status`    | enum   | Filter by status: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`           |
| `priority`  | enum   | Filter by priority: `LOW`, `MEDIUM`, `HIGH`, `URGENT`                   |
| `assigneeId`| UUID   | Filter by assignee                                                       |
| `createdBy` | UUID   | Filter by creator                                                        |
| `search`    | string | Full-text search across title and description                            |
| `myTickets` | bool   | **Admin only** — `true` to see only tickets created by the admin        |
| `page`      | number | Page number (default: 1)                                                 |
| `limit`     | number | Page size (default: 10, max: 100)                                        |

**Scoping rules:**
- Regular users always see only tickets they created or are assigned to.
- Admins see all tickets by default; add `myTickets=true` for "My Tickets" view.

### Comments
| Method | Endpoint                | Auth          | Description       |
|--------|-------------------------|---------------|-------------------|
| POST   | `/tickets/:id/comments` | Ticket member | Add comment       |
| GET    | `/tickets/:id/comments` | Ticket member | List comments     |

---

## 🧪 Sample cURL Requests

### 1. Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"MyPass123!"}'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"AdminPass123!"}'
```

> Copy the `accessToken`. Use as `Bearer <token>` in subsequent requests.

### 3. Create a ticket

```bash
export TOKEN="<your_access_token>"

curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Login button not working","description":"The login button does not respond on Chrome v120.","priority":"HIGH"}'
```

### 4. List all tickets (admin)

```bash
curl -X GET "http://localhost:5000/api/v1/tickets?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 4a. List only the admin's own tickets

```bash
curl -X GET "http://localhost:5000/api/v1/tickets?myTickets=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 4b. Search with filters

```bash
curl -X GET "http://localhost:5000/api/v1/tickets?search=login&status=OPEN&priority=HIGH" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get a ticket

```bash
export TICKET_ID="<ticket_uuid>"
curl -X GET "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Assign a ticket (admin only)

```bash
export USER_ID="<user_uuid>"
curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"assigneeId\": \"$USER_ID\"}"
```

### 7. Change status

```bash
curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"IN_PROGRESS"}'
```

### 8. Add a comment

```bash
curl -X POST "http://localhost:5000/api/v1/tickets/$TICKET_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"I can reproduce this on Firefox too."}'
```

### 9. Update ticket fields (creator or admin)

```bash
curl -X PATCH "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"priority":"URGENT","title":"Login button broken - urgent"}'
```

### 10. Delete a ticket (admin only)

```bash
curl -X DELETE "http://localhost:5000/api/v1/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Logging

All logs are written to `Backend/logs/` in JSON format:

- **`logs/combined.log`** — All log levels
- **`logs/error.log`** — Error level only

### Domain event log:
```json
{
  "level": "info",
  "message": "TICKET_CREATED",
  "service": "ticket-management-api",
  "type": "domain_event",
  "ticketId": "660f9511-...",
  "actorId": "550e8400-...",
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

### HTTP request log:
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
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

---

## 📈 Scalability

### Current Architecture
Single Node.js process + PostgreSQL. Suitable for low-to-medium traffic.

### Horizontal Scaling
- The API is **stateless** (JWTs, no server-side sessions), multiple instances can run behind a load balancer without sticky sessions.
- Docker Compose can be swapped for **Kubernetes** with a Deployment + HPA.

### Caching
- Add **Redis** to cache frequent reads (ticket lists, user lookups) via `ioredis`. Invalidate on write.

### Database
- Prisma's built-in **connection pool**.
- **Read replicas** for high-read workloads.
- Switch to **cursor-based pagination** for very large datasets.

### Message Queue
- **BullMQ + Redis** for async jobs: email notifications on assignment, out-of-band audit log writes.

---

## 🏗 Design Decisions

### What was implemented beyond the spec

1. **`requestId` middleware** — UUID per request attached as `x-request-id` for log correlation
2. **Two-stage Dockerfile** (builder + production) — Smaller final image, no dev deps in production
3. **Health check endpoint** at `GET /health` — Used by Docker healthcheck
4. **`/api/docs.json` endpoint** — Exposes raw OpenAPI spec for tooling
5. **`sanitizeUser` utility** — Centralized; ensures `password` is never leaked in any response
6. **Graceful shutdown** — SIGTERM/SIGINT handlers close HTTP server + DB connection cleanly
7. **React frontend** — Full single-page app with role-scoped views, TanStack Query caching, and Zustand auth
8. **Admin ticket views** — "My Tickets" (admin's own) vs "All Tickets" (system-wide) with tab switcher
9. **Creator display** — `GET /tickets` includes full creator object (`id`, `name`, `email`) for all tickets; shown in "All Tickets" admin view

### TODO (not implemented to stay in timebox)
- **Refresh tokens** — Currently 1h access token only. Production should add `POST /auth/refresh` with httpOnly cookie
- **Rate limiting** — `express-rate-limit` on auth endpoints
- **Unit/integration tests** — Repository + service layers are structured to be easily testable
- **Cursor-based pagination** — Currently using offset; cursor-based is better for large datasets

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- JWTs expire in 1 hour (configurable via `JWT_EXPIRES_IN`)
- `password` field never returned in any API response
- Helmet sets secure HTTP headers
- Generic error messages for auth failures (no user enumeration)
- Non-root Docker user (`nodejs:1001`)
- Soft delete — data is never permanently lost

---

## 📖 API Documentation

Swagger UI: **http://localhost:5000/api/docs**  
Raw OpenAPI JSON: **http://localhost:5000/api/docs.json**