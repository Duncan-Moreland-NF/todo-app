# Epics & Stories — Todo App

**Version:** 1.0
**Author:** John (PM Persona) via BMAD v6
**Date:** March 2026
**Inputs:** PRD.md v1.0, ux-spec.md v1.0, architecture.md v1.0

---

## Epic Overview

| Epic | Title | Stories | Description |
|------|-------|---------|-------------|
| E1 | Project Foundation | 2 | Project setup, database, health check |
| E2 | Backend API | 4 | All CRUD endpoints for todos |
| E3 | Frontend Shell | 3 | App layout, empty state, loading, error handling |
| E4 | Frontend Features | 3 | Add, display, complete, and delete todos |
| E5 | Integration & Polish | 2 | Hook up frontend to backend, responsive polish |
| E6 | Testing | 3 | Unit, integration, and E2E test suites |
| E7 | Containerisation & Deployment | 2 | Dockerfiles, docker-compose, health checks |
| E8 | QA & Documentation | 2 | Accessibility, security review, README, AI log |

**Recommended build order:** E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8

---

## Epic 1 — Project Foundation

### Story 1.1: Initialise Project Structure

**Title:** Set up monorepo project structure with backend, frontend, and e2e directories

**Description:**
As a developer, I want the project scaffolded with the correct folder structure, dependencies, and configuration so that I have a solid foundation to build on.

**Acceptance Criteria:**

- [ ] Root directory contains `backend/`, `frontend/`, `e2e/`, `docker-compose.yml` (placeholder), `.env.example`, `README.md`
- [ ] `backend/` is initialised with `package.json`, Express, pg, cors, and dotenv as dependencies
- [ ] `backend/` has Vitest and Supertest as dev dependencies
- [ ] `backend/` has ESLint and Prettier configured
- [ ] `backend/src/` contains placeholder files matching the architecture: `index.js`, `app.js`, `routes/`, `db/`, `middleware/`
- [ ] `frontend/` is initialised with Vite + React (JavaScript, not TypeScript)
- [ ] `frontend/` has Vitest and React Testing Library as dev dependencies
- [ ] `frontend/` has ESLint and Prettier configured
- [ ] `frontend/src/` contains placeholder component files matching the architecture
- [ ] `e2e/` is initialised with Playwright
- [ ] `.env.example` contains all environment variables listed in architecture Section 7.3
- [ ] Running `npm install` in each directory completes without errors
- [ ] `CLAUDE.md` is created at root with key architecture decisions and conventions

**Technical Notes:**
- Refer to architecture.md Section 3 (Project Folder Structure) for exact file layout
- Use Node 20 LTS as the runtime target
- Frontend uses CSS Modules (no Tailwind, no styled-components) per ADR-04
- No TypeScript per ADR-01

**Test Scenarios:**
- Smoke test: `npm install` succeeds in all three directories
- Lint: `npm run lint` passes with no errors in backend and frontend

---

### Story 1.2: Database Setup and Health Check

**Title:** Create PostgreSQL schema and implement health check endpoint

**Description:**
As a developer, I want the database schema created and a health check endpoint available so that I can verify the database connection works before building features.

**Acceptance Criteria:**

- [ ] `backend/src/db/init.sql` contains the `CREATE TABLE` and index statements from architecture Section 4.1
- [ ] `backend/src/db/pool.js` creates a `pg.Pool` using the `DATABASE_URL` environment variable
- [ ] Database initialisation runs `init.sql` on app startup (creates table if not exists)
- [ ] `GET /api/health` returns `200` with `{"status": "ok", "database": "connected"}` when the database is reachable
- [ ] `GET /api/health` returns `503` with `{"status": "error", "database": "disconnected"}` when the database is unreachable
- [ ] The Express app (`app.js`) is separated from the server startup (`index.js`) per architecture Section 7.2

**Technical Notes:**
- Refer to architecture.md Section 4 (Database Schema) and Section 5.1 (Health endpoint)
- Use parameterised queries per Section 11 (Security)
- `app.js` exports the Express app; `index.js` imports it and calls `app.listen()`
- Pool config reads from `DATABASE_URL` env var with fallback default

**Test Scenarios:**
- **Unit:** Pool creation uses correct environment variable
- **Integration:** `GET /api/health` returns 200 when database is connected
- **Integration:** `GET /api/health` returns 503 when database is unreachable (mock pool failure)

---

## Epic 2 — Backend API

### Story 2.1: GET /api/todos — Fetch All Todos

**Title:** Implement endpoint to retrieve all todos sorted newest first

**Description:**
As a user, I want to fetch all my todos so that the frontend can display my task list when the app loads.

**Acceptance Criteria:**

- [ ] `GET /api/todos` returns `200` with a JSON array of all todos
- [ ] Todos are sorted by `created_at` descending (newest first)
- [ ] Each todo object contains: `id`, `title`, `completed`, `created_at`
- [ ] When no todos exist, returns `200` with an empty array `[]`
- [ ] On database error, returns `500` with `{"error": "Failed to fetch todos"}`

**Technical Notes:**
- Refer to architecture.md Section 5.1 (GET /api/todos)
- SQL: `SELECT * FROM todos ORDER BY created_at DESC`
- Query function goes in `db/queries.js` → `getAllTodos()`
- Route handler goes in `routes/todos.js`

**Test Scenarios:**
- **Integration:** Returns empty array when no todos exist
- **Integration:** Returns all todos sorted newest first
- **Integration:** Returns 500 on database failure

---

### Story 2.2: POST /api/todos — Create a Todo

**Title:** Implement endpoint to create a new todo with validation

**Description:**
As a user, I want to add a new task so that it is saved and appears in my list.

**Acceptance Criteria:**

- [ ] `POST /api/todos` with valid `{"title": "Buy milk"}` returns `201` with the created todo (including generated `id`, `completed: false`, and `created_at`)
- [ ] The title is trimmed before storing (leading/trailing whitespace removed)
- [ ] Returns `400` with `{"error": "Title is required and must be between 1 and 255 characters"}` when:
  - `title` is missing from the request body
  - `title` is not a string
  - `title` is empty or whitespace-only after trimming
  - `title` exceeds 255 characters after trimming
- [ ] On database error, returns `500` with a generic error message

**Technical Notes:**
- Refer to architecture.md Section 5.1 (POST /api/todos)
- Validation middleware in `middleware/validation.js` → `validateCreateTodo`
- SQL: `INSERT INTO todos (title) VALUES ($1) RETURNING *`
- Query function in `db/queries.js` → `createTodo(title)`

**Test Scenarios:**
- **Unit:** Validation rejects empty string, whitespace-only, missing title, non-string, >255 chars
- **Unit:** Validation passes valid title through
- **Unit:** Validation trims whitespace from title
- **Integration:** Creates todo and returns 201 with correct shape
- **Integration:** Returns 400 for each invalid case
- **Integration:** Newly created todo appears in GET /api/todos response

---

### Story 2.3: PATCH /api/todos/:id — Toggle Completed

**Title:** Implement endpoint to toggle a todo's completed status

**Description:**
As a user, I want to mark a task as complete (or undo it) so that I can track my progress.

**Acceptance Criteria:**

- [ ] `PATCH /api/todos/:id` with `{"completed": true}` returns `200` with the updated todo
- [ ] `PATCH /api/todos/:id` with `{"completed": false}` returns `200` with the updated todo
- [ ] Returns `404` with `{"error": "Todo not found"}` when the id does not exist
- [ ] Returns `400` with `{"error": "Completed must be a boolean"}` when:
  - `completed` is missing
  - `completed` is not a boolean
- [ ] Returns `400` when `:id` is not a valid positive integer

**Technical Notes:**
- Refer to architecture.md Section 5.1 (PATCH /api/todos/:id)
- Validation middleware: `validateUpdateTodo` (checks boolean) and `validateTodoId` (checks positive integer)
- SQL: `UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *`
- Query function in `db/queries.js` → `updateTodo(id, completed)`
- Check `RETURNING *` result — if no rows returned, the todo doesn't exist

**Test Scenarios:**
- **Unit:** Validation rejects non-boolean completed, missing completed, non-integer id
- **Integration:** Toggles todo to completed and back
- **Integration:** Returns 404 for non-existent id
- **Integration:** Returns 400 for invalid input

---

### Story 2.4: DELETE /api/todos/:id — Delete a Todo

**Title:** Implement endpoint to permanently delete a todo

**Description:**
As a user, I want to delete a task I no longer need so that my list stays clean.

**Acceptance Criteria:**

- [ ] `DELETE /api/todos/:id` returns `204` with no body on success
- [ ] The todo is permanently removed from the database
- [ ] Returns `404` with `{"error": "Todo not found"}` when the id does not exist
- [ ] Returns `400` when `:id` is not a valid positive integer

**Technical Notes:**
- Refer to architecture.md Section 5.1 (DELETE /api/todos/:id)
- SQL: `DELETE FROM todos WHERE id = $1 RETURNING id`
- Query function in `db/queries.js` → `deleteTodo(id)`
- Reuse `validateTodoId` middleware from Story 2.3

**Test Scenarios:**
- **Integration:** Deletes a todo and returns 204
- **Integration:** Deleted todo no longer appears in GET /api/todos
- **Integration:** Returns 404 for non-existent id
- **Integration:** Returns 400 for invalid id format

---

## Epic 3 — Frontend Shell

### Story 3.1: App Layout and Header

**Title:** Create the app shell with centred layout and header component

**Description:**
As a user, I want to see a clean, centred layout with the app title when I open the app so that I know I'm in the right place.

**Acceptance Criteria:**

- [ ] The app renders a single-column layout, max-width 640px, centred horizontally
- [ ] On mobile (≥375px), the layout fills the full width with 16px side padding
- [ ] The `Header` component displays "My Todos" as an `<h1>` element
- [ ] Base styles are set up in `global.css` with CSS variables for colours, spacing, and typography
- [ ] The app uses semantic HTML (`<main>`, `<h1>`)

**Technical Notes:**
- Refer to ux-spec.md Section 2 (Page Layout) and Section 3.1 (App Header)
- Refer to architecture.md Section 6.1 (Component Tree) and ADR-04 (CSS Modules)
- Set up CSS variables in `global.css` for consistent theming
- Use flexbox for centring

**Test Scenarios:**
- **Unit:** Header renders "My Todos" in an h1 element
- **Unit:** App component renders without crashing

---

### Story 3.2: Empty State Component

**Title:** Display a friendly message when there are no todos

**Description:**
As a user, I want to see a helpful message when my list is empty so that I know the app is working and I can start adding tasks.

**Acceptance Criteria:**

- [ ] When the todo list is empty, the `EmptyState` component is displayed
- [ ] EmptyState shows an icon (emoji or SVG — clipboard or checkmark)
- [ ] EmptyState shows the heading "Nothing here yet"
- [ ] EmptyState shows the subtext "Add your first task above to get started"
- [ ] EmptyState is NOT shown when todos exist
- [ ] EmptyState is NOT shown while loading

**Technical Notes:**
- Refer to ux-spec.md Section 3.4 (Empty State)
- Refer to architecture.md Section 6.4 (Component Responsibilities)

**Test Scenarios:**
- **Unit:** EmptyState renders heading and subtext
- **Unit:** EmptyState renders an icon element

---

### Story 3.3: Loading Spinner and Error Banner

**Title:** Display loading and error states for API interactions

**Description:**
As a user, I want to see a spinner while data is loading and an error message if something goes wrong so that I'm never confused by a blank or broken screen.

**Acceptance Criteria:**

- [ ] `LoadingSpinner` component shows a spinner animation
- [ ] LoadingSpinner has `role="status"` and `aria-label="Loading todos"`
- [ ] LoadingSpinner is shown during the initial fetch, replacing the list area
- [ ] Header and AddTodo input remain visible during loading
- [ ] `ErrorBanner` shows the message "Something went wrong. Please try again."
- [ ] ErrorBanner has a dismiss button (✕) that removes the banner
- [ ] ErrorBanner uses `role="alert"` for screen reader announcement
- [ ] ErrorBanner auto-dismisses after 5 seconds
- [ ] ErrorBanner uses a soft red/warning colour
- [ ] ErrorBanner appears below the input area, above the list

**Technical Notes:**
- Refer to ux-spec.md Section 3.5 (Loading State) and Section 3.6 (Error Banner)
- Refer to architecture.md Section 6.4 (Component Responsibilities)
- Auto-dismiss: use `setTimeout` in the `useTodos` hook or in ErrorBanner itself

**Test Scenarios:**
- **Unit:** LoadingSpinner has correct ARIA attributes
- **Unit:** ErrorBanner renders the error message
- **Unit:** ErrorBanner calls `onDismiss` when dismiss button is clicked
- **Unit:** ErrorBanner has `role="alert"`

---

## Epic 4 — Frontend Features

### Story 4.1: Add Todo Component

**Title:** Build the input form to add new todos

**Description:**
As a user, I want to type a task and press Add (or Enter) to create a new todo so that I can quickly capture things I need to do.

**Acceptance Criteria:**

- [ ] `AddTodo` renders a text input with placeholder "What needs doing?"
- [ ] An "Add" button sits to the right of the input (flex layout, does not stack on mobile)
- [ ] Pressing Enter while input is focused submits the form
- [ ] Clicking the Add button submits the form
- [ ] Add button is visually disabled (greyed out) when input is empty
- [ ] Submitting an empty or whitespace-only input is blocked — shows inline hint "Please enter a task"
- [ ] On successful submission, the input clears and focus returns to the input field
- [ ] The component uses a `<form>` element with proper semantic HTML
- [ ] Touch targets are at least 44×44px on mobile

**Technical Notes:**
- Refer to ux-spec.md Section 3.2 (Add Todo Input)
- Refer to architecture.md Section 6.4 (`AddTodo` component)
- The component receives an `onAdd(title)` callback prop
- Trim the input value before submitting
- Use local state for the input value and validation message

**Test Scenarios:**
- **Unit:** Renders input with correct placeholder
- **Unit:** Add button is disabled when input is empty
- **Unit:** Calls `onAdd` with trimmed title on submit
- **Unit:** Clears input after successful submission
- **Unit:** Does not call `onAdd` when input is whitespace-only
- **Unit:** Shows validation hint for empty submission

---

### Story 4.2: Todo List and Todo Item Components

**Title:** Display the list of todos with checkbox and delete functionality

**Description:**
As a user, I want to see my tasks in a list where I can check them off or delete them so that I can manage my day.

**Acceptance Criteria:**

- [ ] `TodoList` renders a `<ul>` containing `TodoItem` components
- [ ] Each `TodoItem` renders inside an `<li>` element
- [ ] Each TodoItem displays: a checkbox (left), the title text (centre), a delete button (right)
- [ ] Completed items show strikethrough text and muted/greyed-out colour
- [ ] Completed items have a checked checkbox
- [ ] Clicking the checkbox calls `onToggle(id, newCompletedState)`
- [ ] Clicking the delete button calls `onDelete(id)`
- [ ] The delete button has `aria-label="Delete: {todo title}"`
- [ ] The delete button is subtle by default, more visible on hover
- [ ] Checkbox uses a proper `<input type="checkbox">` or ARIA equivalent
- [ ] Completed items do NOT change position in the list

**Technical Notes:**
- Refer to ux-spec.md Section 3.3 (Todo List) and Section 6 (Interaction States)
- Refer to architecture.md Section 6.4 (TodoList, TodoItem components)
- Use CSS Modules for scoped styling
- Visual states: default, hover (delete button), completed

**Test Scenarios:**
- **Unit (TodoItem):** Renders title text
- **Unit (TodoItem):** Shows strikethrough when completed is true
- **Unit (TodoItem):** Checkbox is checked when completed is true
- **Unit (TodoItem):** Calls onToggle when checkbox is clicked
- **Unit (TodoItem):** Calls onDelete when delete button is clicked
- **Unit (TodoItem):** Delete button has correct aria-label
- **Unit (TodoList):** Renders correct number of TodoItem components

---

### Story 4.3: useTodos Custom Hook

**Title:** Implement the central state management hook for all todo operations

**Description:**
As a developer, I want a single hook that manages all todo state and API interactions so that components stay clean and focused on rendering.

**Acceptance Criteria:**

- [ ] `useTodos` hook returns: `todos`, `loading`, `error`, `addTodo`, `toggleTodo`, `deleteTodo`, `dismissError`
- [ ] On mount, fetches todos from `GET /api/todos` and sets `loading: true`
- [ ] On successful fetch, `todos` is populated and `loading` becomes `false`
- [ ] On failed fetch, `error` is set and `loading` becomes `false`
- [ ] `addTodo(title)` calls `POST /api/todos`, adds the new todo to the start of the list on success
- [ ] `toggleTodo(id, completed)` calls `PATCH /api/todos/:id`, updates the todo in the list on success
- [ ] `deleteTodo(id)` calls `DELETE /api/todos/:id`, removes the todo from the list on success
- [ ] On any API failure, `error` is set with an appropriate message
- [ ] `dismissError()` clears the error
- [ ] Error auto-dismisses after 5 seconds

**Technical Notes:**
- Refer to architecture.md Section 6.2 (State Management) and Section 6.3 (API Client)
- The hook uses `useState` and `useEffect` — no external state library (ADR-05)
- API client functions live in `api/todos.js` — the hook calls these
- API client uses `VITE_API_URL` environment variable for the base URL

**Test Scenarios:**
- **Unit:** Fetches todos on mount
- **Unit:** Sets loading to true then false after fetch
- **Unit:** Sets error on failed fetch
- **Unit:** addTodo adds new todo to start of list
- **Unit:** toggleTodo updates the correct todo
- **Unit:** deleteTodo removes the correct todo
- **Unit:** dismissError clears error state

---

## Epic 5 — Integration & Polish

### Story 5.1: Wire Up App Component

**Title:** Connect all components through the useTodos hook in the App component

**Description:**
As a user, I want the full app to work end-to-end — I can add todos, see them appear, check them off, and delete them — all with proper loading and error states.

**Acceptance Criteria:**

- [ ] `App` component uses the `useTodos` hook to manage all state
- [ ] While loading: Header and AddTodo are visible, LoadingSpinner replaces the list area
- [ ] After loading with todos: TodoList is displayed
- [ ] After loading with no todos: EmptyState is displayed
- [ ] Adding a todo: new item appears at the top of the list, input clears
- [ ] Toggling a todo: item updates visually (strikethrough on/off)
- [ ] Deleting a todo: item disappears from the list
- [ ] Deleting the last todo: EmptyState appears
- [ ] On any API error: ErrorBanner appears below the input
- [ ] Dismissing the error: ErrorBanner disappears
- [ ] The app works on desktop (≥1024px) and mobile (≥375px)

**Technical Notes:**
- Refer to architecture.md Section 6.1 (Component Tree)
- Refer to ux-spec.md Section 8 (User Journey Map)
- This story is about wiring things together — all individual components should already work from earlier stories

**Test Scenarios:**
- **Integration (Frontend):** App shows loading state then todos
- **Integration (Frontend):** App shows empty state when no todos exist
- **Integration (Frontend):** Adding a todo updates the list
- **Integration (Frontend):** Toggling a todo updates the item
- **Integration (Frontend):** Deleting a todo removes the item
- **Integration (Frontend):** Error banner shows on API failure

---

### Story 5.2: Responsive Design and Visual Polish

**Title:** Ensure the app looks great and works well on all screen sizes

**Description:**
As a user, I want the app to feel polished and be usable on my phone and my desktop so that I can manage tasks anywhere.

**Acceptance Criteria:**

- [ ] Desktop (≥1024px): centred column, max-width 640px, generous padding
- [ ] Mobile (≥375px): full width, 16px side padding, touch targets ≥44px
- [ ] Add button stays next to input on mobile (flex layout, no stacking)
- [ ] High contrast text meets WCAG AA (4.5:1 ratio)
- [ ] Consistent spacing using a scale (4px, 8px, 16px, 24px, 32px)
- [ ] Minimal decoration — no gradients, heavy shadows, or unnecessary borders
- [ ] All interactive elements have visible focus indicators
- [ ] Keyboard navigation works: Tab through input, Add button, checkboxes, delete buttons
- [ ] Focus returns to input after adding a todo

**Technical Notes:**
- Refer to ux-spec.md Section 4 (Responsive Behaviour), Section 5 (Visual Design Principles), Section 6 (Interaction States)
- Refer to architecture.md Section 13 (Accessibility Architecture)
- Test using browser dev tools responsive mode

**Test Scenarios:**
- **Manual:** Verify layout at 375px, 768px, and 1024px widths
- **E2E (Playwright):** Page loads correctly at mobile viewport
- **E2E (Playwright):** Keyboard navigation through all interactive elements

---

## Epic 6 — Testing

### Story 6.1: Backend Unit and Integration Tests

**Title:** Write comprehensive tests for all backend validation and API endpoints

**Description:**
As a developer, I want thorough backend tests so that I have confidence the API works correctly and catches edge cases.

**Acceptance Criteria:**

- [ ] Unit tests for all validation middleware (createTodo, updateTodo, todoId validation)
- [ ] Integration tests for every API endpoint:
  - `GET /api/todos` — empty list, populated list, sorted correctly
  - `POST /api/todos` — valid creation, all validation failures
  - `PATCH /api/todos/:id` — toggle on, toggle off, not found, invalid input
  - `DELETE /api/todos/:id` — successful delete, not found, invalid id
  - `GET /api/health` — connected, disconnected
- [ ] Integration tests use a real test database (not mocks)
- [ ] Test setup creates a clean database before each test suite
- [ ] Test teardown cleans up test data
- [ ] Backend test coverage is ≥70%

**Technical Notes:**
- Refer to architecture.md Section 9.2 and 9.3 (Test Strategy)
- Use Vitest as the test runner
- Use Supertest for HTTP assertions against the Express app
- Import `app` from `app.js` (not `index.js`) to avoid starting the server
- Test database: use `todoapp_test` or an in-memory approach

**Test Scenarios:** (this story IS the test scenarios — see acceptance criteria)

---

### Story 6.2: Frontend Unit and Integration Tests

**Title:** Write comprehensive tests for all frontend components and the App integration

**Description:**
As a developer, I want thorough frontend tests so that I have confidence the UI renders correctly and handles user interactions properly.

**Acceptance Criteria:**

- [ ] Unit tests for each component (matching test scenarios from Stories 3.1–4.2):
  - Header, AddTodo, TodoItem, TodoList, EmptyState, LoadingSpinner, ErrorBanner
- [ ] Unit tests for the `useTodos` hook
- [ ] Integration test for the `App` component testing the full flow with mocked API:
  - Loading state → displays todos
  - Empty state when no todos
  - Add a todo → list updates
  - Toggle a todo → item updates
  - Delete a todo → item removed
  - API error → error banner shown
- [ ] Frontend test coverage is ≥70%

**Technical Notes:**
- Refer to architecture.md Section 9.2 and 9.3
- Use Vitest + React Testing Library
- Mock API calls using `vi.mock` or MSW (Mock Service Worker)
- Test components the way users interact with them (click, type, see)

**Test Scenarios:** (this story IS the test scenarios — see acceptance criteria)

---

### Story 6.3: End-to-End Tests with Playwright

**Title:** Write E2E tests covering all core user journeys

**Description:**
As a QA engineer, I want automated browser tests that verify the entire app works end-to-end so that we catch integration issues that unit tests miss.

**Acceptance Criteria:**

- [ ] Minimum 5 passing Playwright tests (exercise requirement)
- [ ] Test 1 — Create a todo: type text, click Add, verify todo appears in list
- [ ] Test 2 — Complete a todo: click checkbox, verify strikethrough appears
- [ ] Test 3 — Uncomplete a todo: click checked checkbox, verify strikethrough removed
- [ ] Test 4 — Delete a todo: click delete button, verify todo removed from list
- [ ] Test 5 — Empty state: load app with no todos, verify "Nothing here yet" message
- [ ] Test 6 (bonus) — Create multiple todos: verify they appear in newest-first order
- [ ] Test 7 (bonus) — Accessibility audit: run axe-core checks, zero critical violations
- [ ] Playwright config targets Chromium (minimum), optionally Firefox and WebKit
- [ ] Tests can run against the full application stack

**Technical Notes:**
- Refer to architecture.md Section 9.4 (E2E Tests)
- E2E tests live in `e2e/tests/`
- Tests need the full stack running (frontend + backend + database)
- Use Playwright's `expect` assertions
- For test 5, ensure the database is empty before the test (clean state)
- For test 7, use `@axe-core/playwright` package

**Test Scenarios:** (this story IS the test scenarios — see acceptance criteria)

---

## Epic 7 — Containerisation & Deployment

### Story 7.1: Create Dockerfiles

**Title:** Write optimised Dockerfiles for frontend and backend

**Description:**
As a DevOps engineer, I want Dockerfiles that build efficient, secure container images so that the app can be deployed anywhere Docker runs.

**Acceptance Criteria:**

- [ ] `backend/Dockerfile` uses multi-stage build (install deps → copy source → run)
- [ ] `backend/Dockerfile` uses Node 20 Alpine as base image
- [ ] `backend/Dockerfile` creates and uses a non-root user
- [ ] `backend/Dockerfile` includes a health check using `curl` to `/api/health`
- [ ] `frontend/Dockerfile` uses multi-stage build (install deps → build → serve with Nginx)
- [ ] `frontend/Dockerfile` creates and uses a non-root user
- [ ] `frontend/Dockerfile` includes Nginx configuration that proxies `/api` to the backend
- [ ] Both images build successfully with `docker build`

**Technical Notes:**
- Refer to architecture.md Section 8.2 (Docker Compose Services)
- Frontend Nginx config: serve static files, proxy `/api/*` to `http://backend:3001`
- Use `.dockerignore` files to exclude `node_modules`, `.git`, etc.
- Keep images as small as possible (Alpine base)

**Test Scenarios:**
- **Manual:** `docker build` completes for both backend and frontend
- **Manual:** Backend container starts and health check passes
- **Manual:** Frontend container serves the React build

---

### Story 7.2: Docker Compose Orchestration

**Title:** Create docker-compose.yml that runs the entire application stack

**Description:**
As a user (or evaluator), I want to run `docker-compose up` and have the entire application start with no additional setup.

**Acceptance Criteria:**

- [ ] `docker-compose.yml` defines three services: `db`, `backend`, `frontend`
- [ ] `db` uses `postgres:16-alpine` with health check (`pg_isready`)
- [ ] `db` uses a named volume (`pgdata`) for data persistence
- [ ] `backend` depends on `db` with condition `service_healthy`
- [ ] `backend` health check hits `/api/health`
- [ ] `frontend` depends on `backend`
- [ ] Running `docker-compose up` starts all services and the app is accessible at `http://localhost:5173`
- [ ] Environment variables are configured via `.env` file
- [ ] `docker-compose down` stops all services cleanly
- [ ] `docker-compose logs` shows output from all services

**Technical Notes:**
- Refer to architecture.md Section 8 (Docker Architecture)
- Container networking: all services share a Docker network (automatic)
- Frontend Nginx proxies `/api` requests to `http://backend:3001`
- Database credentials come from `.env` → `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- Backend reads `DATABASE_URL` pointing to `db` service hostname

**Test Scenarios:**
- **Manual:** `docker-compose up --build` starts all three containers
- **Manual:** App is accessible at `http://localhost:5173`
- **Manual:** Creating and viewing todos works through the Docker stack
- **Manual:** `docker-compose down && docker-compose up` — data persists (named volume)

---

## Epic 8 — QA & Documentation

### Story 8.1: QA Reports

**Title:** Generate accessibility, security, and coverage reports

**Description:**
As a QA engineer, I want documented evidence of quality checks so that we can demonstrate the app meets quality standards.

**Acceptance Criteria:**

- [ ] Test coverage report generated for backend (≥70%)
- [ ] Test coverage report generated for frontend (≥70%)
- [ ] Accessibility audit run using axe-core or Lighthouse — zero critical WCAG violations
- [ ] Security review documented: XSS prevention, SQL injection prevention, input validation, error message safety, CORS config, dependency audit (`npm audit`)
- [ ] All findings documented in a QA report file

**Technical Notes:**
- Coverage: run `npm run test:coverage` in both backend and frontend
- Accessibility: can be automated via Playwright with `@axe-core/playwright`
- Security: review against OWASP top 10 basics relevant to this app
- Output: create `qa-report.md` or similar in the project root

**Test Scenarios:** (this story produces the reports)

---

### Story 8.2: README and AI Integration Log

**Title:** Write comprehensive project documentation

**Description:**
As a new developer (or evaluator), I want clear documentation so that I can understand, run, and evaluate the project.

**Acceptance Criteria:**

- [ ] `README.md` includes:
  - Project description
  - Tech stack overview
  - Prerequisites (Node.js, Docker)
  - Setup instructions for local development
  - Setup instructions for Docker (`docker-compose up`)
  - How to run tests (unit, integration, E2E)
  - Project structure overview
  - API endpoint reference
- [ ] `AI_INTEGRATION_LOG.md` documents:
  - Which tasks were completed with AI assistance
  - Which MCP servers or tools were used
  - What prompts worked well
  - How AI assisted with test generation
  - Cases where AI helped with debugging
  - Limitations encountered — where human expertise was needed
- [ ] Both documents are clear, well-formatted, and complete

**Technical Notes:**
- README should enable someone to run the app within 15 minutes (PRD success metric)
- AI Integration Log is a deliverable for the exercise assessment

**Test Scenarios:**
- **Manual:** Follow README instructions on a clean machine — app runs within 15 minutes

---

## Story Dependency Map

```
E1: S1.1 → S1.2
             ↓
E2: S2.1 → S2.2 → S2.3 → S2.4
                              ↓
E3: S3.1 → S3.2 → S3.3      │ (can start in parallel with E2)
                    ↓         │
E4: S4.1 → S4.2 → S4.3      │
                    ↓         ↓
E5: S5.1 ──────────────── S5.2
         ↓
E6: S6.1 → S6.2 → S6.3
                    ↓
E7: S7.1 → S7.2
             ↓
E8: S8.1 → S8.2
```

**Notes on parallelism:**
- Epic 3 (Frontend Shell) can start while Epic 2 (Backend API) is being built — the frontend uses mocked data initially
- Stories within an epic should be done in order
- Epic 5 requires both E2 and E4 to be complete
- Epic 6 can start as soon as there is code to test — but full coverage requires E5 done
- Epic 7 requires the app to be working (E5 complete)
- Epic 8 requires everything else to be done

---

*This document is the implementation roadmap. Each story should be handed to Claude Code one at a time (or in small groups) with the architecture document for context. Stories reference specific sections of the PRD, UX spec, and architecture — Claude Code should have access to all three.*
