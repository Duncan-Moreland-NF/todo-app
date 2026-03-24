# architecture.md — Todo App Technical Architecture

**Version:** 1.0
**Author:** Winston (Architect Persona) via BMAD v6
**Date:** March 2026
**Inputs:** PRD.md v1.0, ux-spec.md v1.0

---

## 1. Architecture Overview

The Todo App follows a classic **three-tier architecture**: a React single-page application (SPA) talks to a Node.js/Express REST API, which persists data in a PostgreSQL database. All three tiers run as separate Docker containers orchestrated by Docker Compose.

```
┌──────────────┐       HTTP        ┌──────────────┐       SQL        ┌──────────────┐
│   Frontend   │  ──────────────►  │   Backend    │  ─────────────►  │  PostgreSQL  │
│  (React SPA) │  localhost:5173   │  (Express)   │  localhost:5432  │  (Database)  │
│              │  ◄──────────────  │  /api/todos  │  ◄─────────────  │              │
└──────────────┘    JSON responses └──────────────┘    Query results └──────────────┘
```

**Why this architecture?**

- **Separation of concerns:** Frontend and backend are independent — either can be replaced or upgraded without touching the other.
- **Extensibility (NFR-05):** Adding authentication later means adding middleware to the API and a login page to the frontend. The architecture doesn't need to change.
- **Deployability (NFR-06):** Each tier is its own Docker container. One `docker-compose up` and everything runs.
- **Simplicity (NFR-04):** Three well-understood, widely-documented technologies. No magic, no clever abstractions.

---

## 2. Tech Stack

| Layer | Technology | Version | Why This Choice |
|-------|-----------|---------|-----------------|
| **Frontend** | React | 18.x | Industry standard SPA library. Huge ecosystem, excellent docs. Matches PRD decision (Section 10). |
| **Frontend Build** | Vite | 5.x | Fast dev server, simple config, built-in TypeScript support. Much simpler than Webpack. |
| **Frontend Language** | JavaScript (JSX) | ES2022 | Keeping it simple — no TypeScript in v1 to reduce complexity for a learning project. |
| **Frontend Styling** | CSS Modules | — | Scoped styles per component, no extra dependencies, works out of the box with Vite. |
| **Backend** | Node.js + Express | Node 20 LTS, Express 4.x | Minimal, well-understood web framework. Perfect for a small REST API. |
| **Backend Language** | JavaScript | ES2022 | Same language front and back — one mental model. |
| **Database** | PostgreSQL | 16.x | Robust, extensible relational database. Runs easily in Docker. Supports future features (users, categories) without migration headaches. |
| **Database Client** | pg (node-postgres) | 8.x | Lightweight PostgreSQL client for Node.js. No ORM — we write simple SQL directly for transparency and learning. |
| **Unit/Integration Tests** | Vitest | 1.x | Fast, Vite-native test runner. Compatible with Jest API so examples are easy to find. |
| **Frontend Component Tests** | React Testing Library | 14.x | Tests components the way users interact with them. Encourages accessible markup. |
| **E2E Tests** | Playwright | 1.x | Cross-browser E2E testing. Required by the exercise brief. Excellent API. |
| **Linting** | ESLint | 9.x | Catches bugs and enforces consistent style. |
| **Formatting** | Prettier | 3.x | Automatic code formatting — no style debates. |
| **Containerisation** | Docker + Docker Compose | — | Required by NFR-06. Multi-container orchestration. |

---

## 3. Project Folder Structure

```
todo-app/
├── docker-compose.yml          # Orchestrates all containers
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for environment variables
├── README.md                   # Setup instructions
├── CLAUDE.md                   # AI context file for Claude Code sessions
│
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── package.json
│   ├── .eslintrc.cjs
│   ├── src/
│   │   ├── index.js            # Express app entry point
│   │   ├── app.js              # Express app setup (separated for testing)
│   │   ├── routes/
│   │   │   └── todos.js        # Todo route handlers
│   │   ├── db/
│   │   │   ├── pool.js         # PostgreSQL connection pool
│   │   │   ├── init.sql        # Database schema (CREATE TABLE)
│   │   │   └── queries.js      # SQL query functions
│   │   ├── middleware/
│   │   │   ├── errorHandler.js # Global error handling middleware
│   │   │   └── validation.js   # Request validation middleware
│   │   └── healthcheck.js      # Health check endpoint
│   └── tests/
│       ├── unit/
│       │   └── validation.test.js
│       └── integration/
│           └── todos.test.js   # API endpoint tests
│
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html              # SPA entry point
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Root component
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── AddTodo.jsx     # Input + Add button
│   │   │   ├── TodoList.jsx    # List container
│   │   │   ├── TodoItem.jsx    # Single todo row
│   │   │   ├── EmptyState.jsx  # "Nothing here yet" message
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBanner.jsx # Dismissable error message
│   │   ├── api/
│   │   │   └── todos.js        # API client functions (fetch wrappers)
│   │   ├── hooks/
│   │   │   └── useTodos.js     # Custom hook for todo state management
│   │   └── styles/
│   │       ├── global.css      # Base styles, CSS variables, reset
│   │       ├── App.module.css
│   │       ├── Header.module.css
│   │       ├── AddTodo.module.css
│   │       ├── TodoList.module.css
│   │       ├── TodoItem.module.css
│   │       ├── EmptyState.module.css
│   │       ├── LoadingSpinner.module.css
│   │       └── ErrorBanner.module.css
│   └── tests/
│       ├── unit/
│       │   ├── TodoItem.test.jsx
│       │   └── AddTodo.test.jsx
│       └── integration/
│           └── App.test.jsx
│
└── e2e/
    ├── package.json
    ├── playwright.config.js
    └── tests/
        ├── todo-crud.spec.js       # Create, complete, delete flows
        ├── empty-state.spec.js     # Empty state display
        ├── error-handling.spec.js  # API failure scenarios
        └── accessibility.spec.js   # Automated a11y checks
```

**Key decisions about structure:**

- **`app.js` separated from `index.js`:** The Express app is defined in `app.js` and the server is started in `index.js`. This lets integration tests import the app without starting the server.
- **`e2e/` is a separate directory** with its own `package.json` because Playwright has its own dependencies and configuration. It tests the full running application.
- **CSS Modules** keep styles scoped to each component. No global CSS collisions.
- **`useTodos` custom hook** keeps all todo state logic (fetching, adding, toggling, deleting, error handling) in one place, keeping components clean and focused on rendering.

---

## 4. Database Schema

A single table is all we need for v1. It's designed to allow future columns (like `user_id`, `category`, `due_date`) without breaking anything.

### 4.1 Table: `todos`

```sql
CREATE TABLE IF NOT EXISTS todos (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    completed   BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sorting by creation time (newest first)
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos (created_at DESC);
```

**Design notes:**

- **`SERIAL` for `id`:** Auto-incrementing integer. Simple and sufficient. Could switch to UUID later if multi-user sync requires it, but integers are easier to work with and debug.
- **`VARCHAR(255)` for `title`:** Matches the PRD's max 255 character requirement. `NOT NULL` enforces that titles can't be empty at the database level.
- **`TIMESTAMPTZ`:** Timezone-aware timestamp. Future-proofs for multi-timezone users.
- **No `updated_at` column in v1:** The only "update" operation is toggling `completed`. We don't need to track when that happened yet.
- **No `user_id` column in v1:** Not needed for single-user. When auth is added, we add `user_id` with a foreign key and a migration.

---

## 5. API Contract

The backend exposes a RESTful JSON API under the `/api` prefix. All endpoints return JSON.

**Base URL:** `http://localhost:3001/api`

### 5.1 Endpoints

#### `GET /api/todos` — Fetch all todos

Returns all todos, sorted by `created_at` descending (newest first, matching UX spec Section 3.3).

**Response `200 OK`:**
```json
[
    {
        "id": 1,
        "title": "Buy groceries",
        "completed": false,
        "created_at": "2026-03-23T10:30:00.000Z"
    },
    {
        "id": 2,
        "title": "Walk the dog",
        "completed": true,
        "created_at": "2026-03-23T09:15:00.000Z"
    }
]
```

**Error `500 Internal Server Error`:**
```json
{
    "error": "Failed to fetch todos"
}
```

---

#### `POST /api/todos` — Create a new todo

Creates a new todo and returns it. The title must be a non-empty, non-whitespace string of at most 255 characters.

**Request body:**
```json
{
    "title": "Buy groceries"
}
```

**Response `201 Created`:**
```json
{
    "id": 3,
    "title": "Buy groceries",
    "completed": false,
    "created_at": "2026-03-23T14:00:00.000Z"
}
```

**Error `400 Bad Request` (validation failure):**
```json
{
    "error": "Title is required and must be between 1 and 255 characters"
}
```

**Validation rules:**
- `title` must be present in the request body
- `title` must be a string
- `title` must not be empty or whitespace-only after trimming
- `title` must not exceed 255 characters after trimming
- The server trims the title before storing it

---

#### `PATCH /api/todos/:id` — Toggle completed status

Toggles the `completed` field of a todo. Uses `PATCH` because we are partially updating the resource.

**Request body:**
```json
{
    "completed": true
}
```

**Response `200 OK`:**
```json
{
    "id": 1,
    "title": "Buy groceries",
    "completed": true,
    "created_at": "2026-03-23T10:30:00.000Z"
}
```

**Error `404 Not Found`:**
```json
{
    "error": "Todo not found"
}
```

**Error `400 Bad Request`:**
```json
{
    "error": "Completed must be a boolean"
}
```

---

#### `DELETE /api/todos/:id` — Delete a todo

Permanently deletes a todo. Returns no content on success.

**Response `204 No Content`:** (empty body)

**Error `404 Not Found`:**
```json
{
    "error": "Todo not found"
}
```

---

#### `GET /api/health` — Health check

Used by Docker health checks to verify the service is running and the database is reachable.

**Response `200 OK`:**
```json
{
    "status": "ok",
    "database": "connected"
}
```

**Response `503 Service Unavailable`:**
```json
{
    "status": "error",
    "database": "disconnected"
}
```

### 5.2 API Conventions

- All request and response bodies use `Content-Type: application/json`
- The backend uses `express.json()` middleware to parse request bodies
- Error responses always include an `error` field with a human-readable message
- The API does not use pagination in v1 (single-user app with manageable data volumes)
- CORS is enabled to allow the frontend (running on a different port in development) to reach the API

---

## 6. Frontend Architecture

### 6.1 Component Tree

```
App
├── Header                    (static title)
├── AddTodo                   (input field + add button)
├── ErrorBanner               (conditional — shown on API error)
├── LoadingSpinner            (conditional — shown while fetching)
├── EmptyState                (conditional — shown when no todos)
└── TodoList                  (conditional — shown when todos exist)
    └── TodoItem × N          (one per todo)
```

### 6.2 State Management

All todo-related state lives in a custom hook called `useTodos`. This keeps the logic centralised and the components focused on rendering.

**`useTodos` hook returns:**
```javascript
{
    todos: [],          // Array of todo objects
    loading: true,      // Boolean — true during initial fetch
    error: null,        // String or null — error message from last failed API call
    addTodo: (title) => {},      // Creates a new todo
    toggleTodo: (id, completed) => {},  // Toggles completed status
    deleteTodo: (id) => {},      // Deletes a todo
    dismissError: () => {}       // Clears the error message
}
```

**State flow:**
1. On mount, `useTodos` calls `GET /api/todos` and sets `loading: true`
2. On success, `todos` is populated and `loading` becomes `false`
3. On failure, `error` is set and `loading` becomes `false`
4. Each action (`addTodo`, `toggleTodo`, `deleteTodo`) calls the API, then updates state on success or sets `error` on failure
5. The error auto-dismisses after 5 seconds (per UX spec Section 3.6)

### 6.3 API Client

The `api/todos.js` file wraps `fetch` calls to the backend. Every function throws on non-OK responses so the hook can catch and surface errors consistently.

```javascript
// api/todos.js — shape (not final implementation)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchTodos() { /* GET /api/todos */ }
export async function createTodo(title) { /* POST /api/todos */ }
export async function updateTodo(id, completed) { /* PATCH /api/todos/:id */ }
export async function deleteTodo(id) { /* DELETE /api/todos/:id */ }
```

The `VITE_API_URL` environment variable allows the frontend to point at different backends (local development vs. Docker).

### 6.4 Component Responsibilities

| Component | Renders | Props | Behaviour |
|-----------|---------|-------|-----------|
| `Header` | App title "My Todos" | None | Static display only |
| `AddTodo` | Text input + Add button | `onAdd` callback | Validates non-empty input, calls `onAdd(title)`, clears input, returns focus |
| `ErrorBanner` | Error message with dismiss button | `message`, `onDismiss` | Shows error, dismiss button calls `onDismiss`, uses `role="alert"` |
| `LoadingSpinner` | Spinner animation | None | Uses `role="status"`, `aria-label="Loading todos"` |
| `EmptyState` | Icon + "Nothing here yet" message | None | Friendly empty state per UX spec |
| `TodoList` | List of `TodoItem` components | `todos`, `onToggle`, `onDelete` | Maps over todos array |
| `TodoItem` | Checkbox + title + delete button | `todo`, `onToggle`, `onDelete` | Checkbox toggles, delete removes, completed items show strikethrough |

---

## 7. Backend Architecture

### 7.1 Application Structure

The Express app is structured in layers:

```
Request → Express Router → Route Handler → Database Query → Response
                              ↓
                       Validation Middleware
                              ↓
                       Error Handler Middleware
```

### 7.2 Key Files

**`app.js`** — Creates and configures the Express application:
- Applies `express.json()` middleware
- Applies CORS middleware
- Mounts todo routes at `/api/todos`
- Mounts health check at `/api/health`
- Applies global error handler as the last middleware
- Exports the app (does NOT start the server — that's `index.js`)

**`index.js`** — Starts the server:
- Imports the app from `app.js`
- Initialises the database (runs `init.sql` to create the table if it doesn't exist)
- Starts listening on the configured port
- Logs the port number

**`routes/todos.js`** — Defines all todo endpoints:
- Each route handler is a simple async function
- Calls query functions from `db/queries.js`
- Returns appropriate status codes and JSON responses
- Passes errors to Express's `next()` for the global error handler

**`db/pool.js`** — PostgreSQL connection pool:
- Creates a `pg.Pool` with connection details from environment variables
- Exports the pool for use by query functions

**`db/queries.js`** — SQL query functions:
- `getAllTodos()` — `SELECT * FROM todos ORDER BY created_at DESC`
- `createTodo(title)` — `INSERT INTO todos (title) VALUES ($1) RETURNING *`
- `updateTodo(id, completed)` — `UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *`
- `deleteTodo(id)` — `DELETE FROM todos WHERE id = $1 RETURNING id`

**`middleware/validation.js`** — Request validation:
- `validateCreateTodo` — checks title exists, is a string, is not empty/whitespace, is ≤255 chars
- `validateUpdateTodo` — checks completed exists and is a boolean
- `validateTodoId` — checks `:id` parameter is a positive integer

**`middleware/errorHandler.js`** — Global error handler:
- Catches any unhandled errors from route handlers
- Logs the error (for debugging)
- Returns a generic 500 response to the client (never leaks internal details)

### 7.3 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/todoapp` |
| `NODE_ENV` | Environment (development/test/production) | `development` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

---

## 8. Docker Architecture

### 8.1 Container Topology

```
docker-compose.yml
├── frontend    (Node/Nginx — serves built React app)
│   └── Port 5173:80
├── backend     (Node.js — Express API)
│   └── Port 3001:3001
└── db          (PostgreSQL)
    └── Port 5432:5432 (exposed for dev tooling)
    └── Volume: pgdata (persistent storage)
```

### 8.2 Docker Compose Services

**`db` (PostgreSQL):**
- Image: `postgres:16-alpine`
- Environment: database name, user, password from `.env`
- Volume: named volume `pgdata` for data persistence
- Health check: `pg_isready` command

**`backend` (Express API):**
- Built from `backend/Dockerfile`
- Multi-stage build: install dependencies → copy source → run
- Non-root user for security
- Depends on `db` with health check condition
- Health check: `curl` to `/api/health`
- Environment: `DATABASE_URL` pointing to the `db` service

**`frontend` (React SPA):**
- Built from `frontend/Dockerfile`
- Multi-stage build: install dependencies → build → serve with Nginx
- Non-root user for security
- Depends on `backend`
- Nginx config proxies `/api` requests to the backend container

### 8.3 Networking

All three containers share a Docker network (created automatically by Compose). The frontend's Nginx configuration proxies API calls:

- Browser requests go to `http://localhost:5173`
- Nginx serves the static React build
- Requests to `/api/*` are proxied to `http://backend:3001/api/*`
- This eliminates CORS issues in the Docker environment

### 8.4 Development vs Docker

| Concern | Local Development | Docker |
|---------|-------------------|--------|
| Frontend | `npm run dev` on port 5173 (Vite dev server) | Nginx serves built files on port 5173 |
| Backend | `npm run dev` on port 3001 (nodemon) | Node.js on port 3001 |
| Database | PostgreSQL on port 5432 (local or Docker) | PostgreSQL container on port 5432 |
| API calls | Frontend uses `VITE_API_URL=http://localhost:3001/api` | Nginx proxies `/api` to backend container |

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
         ╱  E2E Tests  ╲          ← Few, slow, high confidence
        ╱  (Playwright)  ╲
       ╱──────────────────╲
      ╱ Integration Tests   ╲      ← Moderate, test API + components together
     ╱ (Vitest + Supertest)  ╲
    ╱────────────────────────╲
   ╱     Unit Tests            ╲    ← Many, fast, test individual pieces
  ╱     (Vitest + RTL)          ╲
 ╱────────────────────────────────╲
```

### 9.2 Unit Tests (Vitest)

**Backend unit tests:**
- Validation middleware: test that invalid inputs are rejected, valid inputs pass through
- Query functions: test SQL is correct (can mock the database pool)

**Frontend unit tests (Vitest + React Testing Library):**
- `TodoItem`: renders title, shows strikethrough when completed, calls callbacks on click
- `AddTodo`: disables button when empty, calls `onAdd` with trimmed title, clears input after submit
- `EmptyState`: renders expected text
- `ErrorBanner`: renders message, calls `onDismiss` when X clicked, has `role="alert"`
- `LoadingSpinner`: renders with correct ARIA attributes

### 9.3 Integration Tests

**Backend integration tests (Vitest + Supertest):**
- Test each API endpoint against a real test database
- Use a setup/teardown that creates a fresh test database, runs migrations, and cleans up
- Test happy paths and error cases (validation, not found, server error)

**Frontend integration tests (Vitest + React Testing Library):**
- Test `App` component with mocked API responses
- Verify the full flow: loading → display todos → add → toggle → delete
- Verify error banner appears on API failure

### 9.4 E2E Tests (Playwright)

Minimum 5 tests as required by the exercise:

1. **Create a todo:** Type text, click Add, verify todo appears in list
2. **Complete a todo:** Click checkbox, verify strikethrough appears
3. **Uncomplete a todo:** Click checked checkbox, verify strikethrough removed
4. **Delete a todo:** Click delete button, verify todo removed from list
5. **Empty state:** Load app with no todos, verify "Nothing here yet" message
6. **Error handling:** Simulate API failure, verify error banner appears (bonus)
7. **Accessibility audit:** Run axe-core checks on loaded page (bonus)

### 9.5 Test Infrastructure

**Backend test database:** Integration tests use a separate PostgreSQL database (`todoapp_test`). The test setup creates it, runs the schema, and the teardown drops it.

**Frontend API mocking:** Integration tests use `msw` (Mock Service Worker) or simple `vi.mock` to intercept API calls without hitting a real server.

**E2E test environment:** Playwright tests run against the full Docker Compose stack, or against locally-running frontend + backend + database.

### 9.6 Test Commands

```bash
# Backend
cd backend
npm test              # Run all backend tests
npm run test:unit     # Unit tests only
npm run test:int      # Integration tests only
npm run test:coverage # With coverage report

# Frontend
cd frontend
npm test              # Run all frontend tests
npm run test:unit     # Unit tests only
npm run test:int      # Integration tests only
npm run test:coverage # With coverage report

# E2E
cd e2e
npx playwright test   # Run all E2E tests
npx playwright test --ui  # Interactive mode (useful for debugging)
```

---

## 10. Architectural Decision Records (ADRs)

### ADR-01: Plain JavaScript over TypeScript

**Decision:** Use JavaScript (ES2022) without TypeScript.

**Rationale:** This is a learning project with a small codebase. TypeScript adds configuration complexity (tsconfig, type definitions, build step) without proportional benefit at this scale. The team can add TypeScript in a future iteration if the project grows.

**Trade-off:** Less compile-time safety. Mitigated by good test coverage and ESLint rules.

### ADR-02: No ORM — Direct SQL with pg

**Decision:** Use the `pg` library to write SQL queries directly rather than using an ORM like Prisma, Sequelize, or Knex.

**Rationale:** The data model is a single table with four columns. An ORM would add significant dependency weight, configuration, and abstraction for very little benefit. Direct SQL is transparent, easy to debug, and teaches the developer what's actually happening. Query functions in `db/queries.js` provide a clean abstraction layer.

**Trade-off:** Migrations must be handled manually (just the `init.sql` file for now). Acceptable at this scale.

### ADR-03: PostgreSQL over SQLite

**Decision:** Use PostgreSQL instead of SQLite.

**Rationale:** While SQLite would work fine for a single-user app, PostgreSQL is chosen for extensibility (NFR-05). It runs naturally in Docker, supports concurrent connections (needed when auth and multiple users are added later), and is the industry standard for production web applications. The Docker Compose setup makes running PostgreSQL as easy as SQLite from the developer's perspective.

**Trade-off:** Requires a running database process (handled by Docker). Slightly more setup than a file-based database.

### ADR-04: CSS Modules over Tailwind/Styled Components

**Decision:** Use CSS Modules for component styling.

**Rationale:** CSS Modules are built into Vite with zero configuration. They provide scoped styles (preventing name collisions) while using standard CSS syntax. No additional learning curve, no build plugin, no runtime cost. For a small component library like this, they're ideal.

**Trade-off:** More verbose than utility-first CSS (Tailwind). But more readable and easier to understand for learning purposes.

### ADR-05: Custom Hook for State Management

**Decision:** Use a single custom React hook (`useTodos`) rather than a state management library (Redux, Zustand, etc.).

**Rationale:** The app has one page and one data entity. A state management library would be overkill. A custom hook using `useState` and `useEffect` keeps all the logic in one file and is straightforward to understand and test.

**Trade-off:** If the app grows significantly, state management may need to be refactored. Acceptable for v1 scope.

### ADR-06: Sorting — Newest First

**Decision:** Todos are sorted newest first (`created_at DESC`), both in the API response and in the UI.

**Rationale:** UX spec Section 3.3 specifies "sorted newest first (most recently added at the top)." This means the most recent action (adding a task) produces an immediately visible result at the top of the list. The API applies this sort in SQL so it's consistent regardless of client.

### ADR-07: Ports — 5173 (Frontend), 3001 (Backend), 5432 (Database)

**Decision:** Use Vite's default port (5173) for the frontend, 3001 for the backend, and PostgreSQL's default (5432) for the database.

**Rationale:** Using well-known defaults minimises configuration and confusion. Port 3001 avoids conflict with React's traditional port 3000, and Vite defaults to 5173.

---

## 11. Security Considerations (v1)

Even though v1 has no authentication, basic security hygiene is important:

- **Input validation:** All user input is validated on the server (not just the client). Title length, type checking, and whitespace trimming happen in middleware before any database query.
- **SQL injection prevention:** All queries use parameterised queries (`$1`, `$2` placeholders in `pg`). User input is never concatenated into SQL strings.
- **Error message safety:** The global error handler returns generic error messages to the client. Internal error details (stack traces, database errors) are logged server-side only.
- **CORS:** The backend restricts cross-origin requests to the configured frontend origin.
- **Docker non-root:** Both the frontend and backend Dockerfiles create and use non-root users.
- **No secrets in code:** Database credentials and other config are in environment variables, loaded from `.env` (which is gitignored).
- **Dependency security:** `npm audit` should be run as part of the CI/QA process.

---

## 12. Performance Considerations (v1)

- **Database indexing:** The `idx_todos_created_at` index ensures the sort query (`ORDER BY created_at DESC`) is fast even as the list grows.
- **Connection pooling:** `pg.Pool` reuses database connections instead of creating a new one per request.
- **Static file serving:** In Docker, the frontend is served by Nginx, which is highly optimised for static files.
- **Minimal payload:** API responses include only the fields defined in the schema — no over-fetching.
- **Target:** API responses under 200ms per NFR-01. Easily achievable with this architecture under local conditions.

---

## 13. Accessibility Architecture

Accessibility is built into the component design, not bolted on after:

- **Semantic HTML:** Use `<main>`, `<h1>`, `<ul>`, `<li>`, `<form>`, `<input>`, `<button>`, `<label>` — not `<div>` with click handlers.
- **ARIA attributes:** Error banner uses `role="alert"`, loading spinner uses `role="status"` with `aria-label="Loading todos"`, delete buttons use `aria-label="Delete: {todo title}"`.
- **Keyboard navigation:** All interactive elements are focusable and operable with Tab, Enter, and Space.
- **Focus management:** After adding a todo, focus returns to the input. After deleting, focus moves to the next logical element.
- **Colour contrast:** All text/background combinations meet WCAG AA (4.5:1 ratio).
- **Visual + text indicators:** Completed items use both strikethrough text AND muted colour — not colour alone.

---

*This document is the technical source of truth. Stories and implementation should reference it directly. Any change to architecture requires updating this document first.*
