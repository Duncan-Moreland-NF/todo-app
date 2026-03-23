# AI Integration Log — Todo App

**Date:** 2026-03-23
**AI Tool:** Claude Code (Claude Opus 4, Anthropic)
**Developer:** Duncan Moreland

---

## Overview

This todo application was built with significant AI assistance using Claude Code, Anthropic's agentic coding tool. The AI was given structured stories (derived from a PRD, UX spec, and architecture document) and implemented them sequentially, with human review and approval at key milestones.

## Stories Completed with AI Assistance

| Story | Title | AI Role |
|-------|-------|---------|
| 1.1 | Project Structure | Scaffolded full monorepo structure, configs, dependencies |
| 1.2 | Database Setup & Health Check | Schema, pool config, health endpoint, DB init on startup |
| 2.1 | GET /api/todos | Query function, route handler, integration tests |
| 2.2 | POST /api/todos | Validation middleware, create endpoint, unit + integration tests |
| 2.3 | PATCH /api/todos/:id | Toggle endpoint, ID/boolean validation, tests |
| 2.4 | DELETE /api/todos/:id | Delete endpoint, reused validation, tests |
| 3.1 | App Layout & Header | CSS variables, responsive layout, Header component |
| 3.2 | Empty State | EmptyState component with icon, heading, subtext |
| 3.3 | Loading & Error States | LoadingSpinner (ARIA), ErrorBanner (role="alert", dismiss) |
| 4.1 | Add Todo | Form with validation, disabled state, trim, clear on submit |
| 4.2 | TodoList & TodoItem | List rendering, checkbox, strikethrough, delete with aria-label |
| 4.3 | useTodos Hook | Central state management, API client, auto-dismiss errors |
| 5.1 | Wire Up App | Connected all components through useTodos hook |
| 5.2 | Responsive Polish | Spacing scale, touch targets, focus indicators |
| 6.1 | Backend Tests | Comprehensive unit + integration tests, 76.5% coverage |
| 6.2 | Frontend Tests | Component + hook + integration tests, 83.9% coverage |
| 6.3 | E2E Tests | 12 Playwright specs covering CRUD, accessibility, keyboard nav |
| 7.1 | Dockerfiles | Multi-stage builds, Alpine images, non-root users, healthchecks |
| 7.2 | Docker Compose | Three-service orchestration, health dependencies, named volumes |
| 8.1 | QA Reports | Coverage reports, accessibility audit, security review |
| 8.2 | README & Docs | Comprehensive README, this integration log |

## Tools and MCP Servers Used

- **Claude Code** — Primary AI coding assistant (CLI-based agentic tool)
- **Claude in Chrome MCP** — Available for browser automation and visual verification
- **Claude Preview MCP** — Available for dev server preview
- **File system tools** — Read, Write, Edit, Glob, Grep for codebase navigation and modification
- **Bash tool** — Running npm commands, Docker builds, curl tests, git operations
- **Web search** — Not required; architecture docs provided sufficient context

## Prompting Strategy

### What worked well

1. **Structured stories with clear acceptance criteria** — Giving Claude well-defined stories with specific AC items (checkboxes) produced focused, complete implementations. Each story mapped cleanly to a set of file changes.

2. **Architecture document as context** — The CLAUDE.md file and architecture references gave Claude consistent conventions to follow (CSS Modules, parameterised queries, app.js/index.js separation).

3. **Sequential story execution** — Working through stories in dependency order (E1 -> E2 -> E3 -> ... -> E8) meant each story could build on tested foundations.

4. **"Keep going" instruction** — After initial confirmation of the first few stories, telling Claude to proceed without stopping allowed efficient batch implementation of related stories.

5. **Test-alongside-code approach** — Having test scenarios in each story meant tests were written alongside the implementation rather than as an afterthought.

### Prompts that were particularly effective

- Providing the full project structure upfront so Claude knew where every file should go
- Including the exact SQL queries in story technical notes
- Specifying error messages verbatim in acceptance criteria
- Listing all environment variables with defaults

## AI Contributions to Test Generation

AI generated all 102 tests across the project:

- **Backend validation tests** (20) — Covered every edge case: empty, null, whitespace, wrong type, boundary lengths
- **Backend integration tests** (22) — Tested every endpoint's success and failure paths with mocked pool
- **Frontend component tests** (28) — Tested rendering, user interactions, ARIA attributes, callbacks
- **useTodos hook tests** (10) — Tested state management, API integration, error handling, auto-dismiss
- **App integration tests** (6) — Full flow with mocked API: loading -> display -> CRUD -> errors
- **Playwright E2E tests** (12) — Real browser tests for CRUD, empty state, keyboard navigation, ARIA

The AI correctly chose testing patterns:
- `vi.mock()` for module mocking in Vitest
- `supertest` for Express endpoint testing
- `@testing-library/react` with `userEvent` for realistic component testing
- `renderHook` + `waitFor` + `act` for hook testing
- Playwright locators (role-based, accessible names) for E2E tests

## AI-Assisted Debugging

1. **Coverage dependency mismatch** — `@vitest/coverage-v8` v4 was incompatible with Vitest v3. Claude identified the version mismatch from the error message and installed the matching v3 version.

2. **Fake timers + waitFor conflict** — Initial useTodos hook tests used `vi.useFakeTimers()` which caused all tests to timeout because `waitFor` uses real timers internally. Claude removed fake timers from most tests and only tested auto-dismiss separately.

3. **Form submission with disabled button** — The AddTodo validation hint test couldn't trigger form submit via Enter when the button was disabled (HTML5 behaviour). Claude used `fireEvent.submit()` as an alternative.

4. **Docker API URL mismatch** — The frontend's API URL defaulted to `http://localhost:3001/api` which doesn't work in Docker (the browser can't reach the backend container directly). Claude changed the fallback to `/api` so Nginx proxies requests correctly.

5. **@testing-library/dom missing** — After installing coverage with `--legacy-peer-deps`, `@testing-library/dom` was removed. Claude diagnosed and reinstalled it.

## Limitations and Human Expertise Needed

1. **Live database testing** — PostgreSQL wasn't available locally until Docker was set up. Integration tests used mocked database connections. Real DB verification happened only at the Docker Compose stage.

2. **Visual design review** — AI can implement CSS from specs but cannot visually verify the result. Human review of the rendered UI is needed to confirm the design matches expectations.

3. **Screen reader testing** — Accessibility was implemented with correct ARIA attributes and semantic HTML, but actual screen reader testing (VoiceOver, NVDA) requires human verification.

4. **Production readiness** — The AI noted several production recommendations (rate limiting, Helmet.js, HTTPS, request logging) in the QA report but did not implement them as they were outside the story scope.

5. **Performance testing** — No load testing or performance benchmarking was performed. For a production app, this would need human-driven testing with tools like k6 or Artillery.

## Conclusion

AI assistance was highly effective for this project due to the well-structured input (PRD, architecture doc, stories with clear AC). The sequential story approach kept context manageable and allowed verification at each step. The main areas where human expertise remained essential were visual design validation, accessibility testing with real assistive technology, and production deployment decisions.
