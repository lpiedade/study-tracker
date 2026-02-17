# AGENTS.md

Guidance for contributors and coding agents working in this monorepo.

## Scope

This repository is a Node.js workspace monorepo with:

- `client`: React + Vite + TypeScript frontend
- `server`: Express + Prisma + SQLite backend

## Monorepo Layout

- `package.json` (root): workspace orchestration scripts
- `client/src`: UI pages, components, and client-side utilities
- `client/tests`: frontend unit/component tests (Vitest + Testing Library)
- `server/src`: API app/server bootstrap and Prisma client wiring
- `server/prisma`: schema and migrations
- `server/tests`: backend API/integration tests (Vitest + Supertest)
- `docs`: architecture and engineering docs (plus ADRs in `docs/adr`)

## Preferred Workflow

1. Install dependencies from the repo root:
   - `npm install`
2. Ensure backend DB/env is ready:
   - create `server/.env` with `DATABASE_URL="file:./dev.db"` (or equivalent)
   - run migrations/generate when schema changes:
   - `npm exec -w server -- prisma migrate dev`
   - `npm exec -w server -- prisma generate --schema=prisma/schema.prisma`
3. Start local development:
   - both apps: `npm run dev`
   - backend only: `npm run dev --workspace=server`
   - frontend only: `npm run dev --workspace=client`
4. Validate changes before PR:
   - all workspace tests: `npm run test`
   - backend tests only: `npm run test --workspace=server`
   - frontend tests only: `npm run test --workspace=client`
   - frontend lint: `npm run lint --workspace=client`
   - production builds: `npm run build --workspace=server` and `npm run build --workspace=client`
5. If Prisma schema changes:
   - include migration files under `server/prisma/migrations`
   - confirm server tests still pass

## Commands Reference

Run all commands from repo root unless noted.

- Root workspace commands:
  - `npm run dev`: run backend and frontend dev servers concurrently
  - `npm run test`: run tests in all workspaces
- Backend (`server`) commands:
  - `npm run dev --workspace=server`: start API in watch mode via nodemon
  - `npm run build --workspace=server`: compile TypeScript to `server/dist`
  - `npm run start --workspace=server`: run compiled server from `server/dist/index.js`
  - `npm run test --workspace=server`: run backend Vitest suite with coverage
  - `npm exec -w server -- prisma migrate dev`: create/apply local migration during schema work
  - `npm exec -w server -- prisma generate --schema=prisma/schema.prisma`: regenerate Prisma client
- Frontend (`client`) commands:
  - `npm run dev --workspace=client`: start Vite dev server
  - `npm run build --workspace=client`: type-check and build production assets
  - `npm run preview --workspace=client`: preview built frontend bundle
  - `npm run lint --workspace=client`: run ESLint
  - `npm run test --workspace=client`: run frontend Vitest suite with coverage

## Coding Conventions (Repo-Specific)

- Keep backend route registration in `server/src/app.ts` grouped by domain (`courses`, `subjects`, `lessons`, etc.) unless refactoring that file.
- Use Prisma through `server/src/prisma.ts` singleton; do not create ad-hoc Prisma clients.
- Keep API surface under `/api/*` and use plural resource names (`/api/courses`, `/api/subjects`).
- Keep frontend API calls centralized through `client/src/lib/api.ts`.
- For calendar/day comparisons, use `client/src/lib/dateUtils.ts` helpers to avoid timezone regressions.
- Preserve existing style conventions per package (frontend and backend currently use different formatting styles).

## Testing Expectations

- Add or update tests for behavior changes:
  - frontend: `client/tests/**/*`
  - backend: `server/tests/**/*`
- Coverage thresholds are enforced in Vitest configs:
  - client: lines/statements/branches >= 80, functions >= 75
  - server: lines/statements/branches/functions >= 80
- Keep backend tests deterministic and clean up created DB records.

## Documentation Expectations

- Update docs when behavior or architecture changes:
  - `docs/architecture.md`
  - `docs/conventions.md`
  - `docs/testing.md`
- Record significant architectural decisions as ADRs in `docs/adr`.
