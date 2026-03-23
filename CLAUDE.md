# Todo App — AI Context

## Stack
- Frontend: React 18 + Vite 5, JavaScript (no TypeScript), CSS Modules
- Backend: Node.js 20 LTS + Express 4, JavaScript
- Database: PostgreSQL 16 with `pg` (node-postgres) — no ORM, direct SQL with parameterised queries
- Testing: Vitest + React Testing Library (frontend), Vitest + Supertest (backend), Playwright (E2E)
- Linting: ESLint 9 + Prettier 3
- Containerisation: Docker + Docker Compose

## Key Architecture Decisions
- `app.js` is separated from `index.js` so integration tests can import the Express app without starting the server
- CSS Modules for scoped styling (no Tailwind, no styled-components)
- `useTodos` custom hook centralises all todo state — no Redux or external state library
- `pg` library with parameterised queries — no ORM
- All environment config via `.env` file

## Project Structure
- `backend/` — Express API server
- `frontend/` — React SPA via Vite
- `e2e/` — Playwright end-to-end tests

## Conventions
- JavaScript only (no TypeScript)
- CSS Modules for component styles (`*.module.css`)
- Direct SQL queries in `backend/src/db/queries.js`
- API client functions in `frontend/src/api/todos.js`
- Custom hook `useTodos` manages all todo state
- Environment variables documented in `.env.example`
