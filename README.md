# Todo App

A full-stack todo application built with React, Express, and PostgreSQL. Create, complete, and delete tasks with a clean, accessible, mobile-friendly UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, CSS Modules |
| Backend | Node.js 20 LTS, Express 4 |
| Database | PostgreSQL 16 (node-postgres, parameterised queries) |
| Testing | Vitest, React Testing Library, Playwright |
| Linting | ESLint 9, Prettier 3 |
| Containerisation | Docker, Docker Compose |

## Prerequisites

- **Node.js** 20 LTS or later
- **Docker Desktop** (for containerised setup) OR a local PostgreSQL 16 instance

## Quick Start with Docker (Recommended)

The fastest way to get the full app running:

```bash
# 1. Clone the repo and enter the project directory
cd todo-app

# 2. Copy the environment file
cp .env.example .env

# 3. Start everything
docker compose up --build
```

The app will be available at **http://localhost:5173** once all three containers are healthy (typically ~20 seconds).

To stop:

```bash
docker compose down        # Stop containers (data persists)
docker compose down -v     # Stop containers and delete data
```

## Local Development Setup

If you prefer to run services individually:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies in all three directories
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd e2e && npm install && cd ..

# 3. Start PostgreSQL (via Docker or local install)
docker run -d --name todoapp-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=todoapp \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Start the backend (port 3001)
cd backend && npm run dev

# 5. Start the frontend (port 5173) — in a separate terminal
cd frontend && npm run dev
```

## Running Tests

### Unit and Integration Tests

```bash
# Backend (46 tests)
cd backend && npm test

# Frontend (44 tests)
cd frontend && npm test

# With coverage reports
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

### End-to-End Tests (Playwright)

E2E tests require the full stack to be running (frontend + backend + database):

```bash
# Start the full stack first
docker compose up -d

# Run Playwright tests (12 tests)
cd e2e && npx playwright test

# Run with browser visible
cd e2e && npx playwright test --headed
```

### Test Summary

| Suite | Tests | Coverage |
|-------|-------|----------|
| Backend unit + integration | 46 | 76.5% statements |
| Frontend unit + integration | 44 | 83.9% statements |
| E2E (Playwright) | 12 | — |
| **Total** | **102** | |

## Project Structure

```
todo-app/
├── docker-compose.yml          # Orchestrates db, backend, frontend
├── .env.example                # Environment variable template
├── CLAUDE.md                   # AI context file
├── qa-report.md                # QA and security report
│
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.js            # Server startup + DB init
│   │   ├── app.js              # Express app (separated for testing)
│   │   ├── healthcheck.js      # GET /api/health
│   │   ├── routes/todos.js     # CRUD route handlers
│   │   ├── db/
│   │   │   ├── pool.js         # PostgreSQL connection pool
│   │   │   ├── init.sql        # Schema (CREATE TABLE, indexes)
│   │   │   ├── init.js         # Runs init.sql on startup
│   │   │   └── queries.js      # Parameterised SQL functions
│   │   └── middleware/
│   │       ├── validation.js   # Input validation
│   │       └── errorHandler.js # Global error handler
│   └── tests/
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx config (static + API proxy)
│   ├── src/
│   │   ├── App.jsx             # Root component
│   │   ├── components/         # Header, AddTodo, TodoList, TodoItem,
│   │   │                       # EmptyState, LoadingSpinner, ErrorBanner
│   │   ├── hooks/useTodos.js   # Central state management hook
│   │   ├── api/todos.js        # Fetch wrappers for API calls
│   │   └── styles/             # CSS Modules + global.css
│   └── tests/
│
└── e2e/
    ├── playwright.config.js
    └── tests/                  # CRUD, empty state, accessibility specs
```

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Success | Error |
|--------|----------|-------------|---------|-------|
| `GET` | `/api/health` | Health check | `200` `{status, database}` | `503` |
| `GET` | `/api/todos` | List all todos (newest first) | `200` `[...]` | `500` |
| `POST` | `/api/todos` | Create a todo | `201` `{id, title, completed, created_at}` | `400` / `500` |
| `PATCH` | `/api/todos/:id` | Toggle completed | `200` `{...updated}` | `400` / `404` / `500` |
| `DELETE` | `/api/todos/:id` | Delete a todo | `204` | `400` / `404` / `500` |

### Example requests

```bash
# Create a todo
curl -X POST http://localhost:5173/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title": "Buy groceries"}'

# Toggle completed
curl -X PATCH http://localhost:5173/api/todos/1 \
  -H 'Content-Type: application/json' \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://localhost:5173/api/todos/1
```

## Environment Variables

See `.env.example` for all variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/todoapp` | PostgreSQL connection string |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `VITE_API_URL` | `/api` | Frontend API base URL |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `todoapp` | Database name |

## Linting

```bash
cd backend && npm run lint
cd frontend && npm run lint
```
