# AGENTS.md (Server)

Guidance for contributors and coding agents working in the backend module.

## Scope

Applies to all files under `server/`.

## Environment and Prisma

- Create `server/.env` with `DATABASE_URL="file:./dev.db"` (or equivalent).
- When schema changes, run:
  - `npm exec -w server -- prisma migrate dev`
  - `npm exec -w server -- prisma generate --schema=prisma/schema.prisma`
- If Prisma schema changes:
  - include migration files under `server/prisma/migrations`
  - confirm server tests still pass

## Commands Reference

Run commands from repo root unless noted.

- `npm run dev --workspace=server`: start API in watch mode via nodemon
- `npm run build --workspace=server`: compile TypeScript to `server/dist`
- `npm run start --workspace=server`: run compiled server from `server/dist/index.js`
- `npm run test --workspace=server`: run backend Vitest suite with coverage
- `npm exec -w server -- prisma migrate dev`: create/apply local migration during schema work
- `npm exec -w server -- prisma generate --schema=prisma/schema.prisma`: regenerate Prisma client

## Coding Conventions

- Keep backend route registration in `server/src/app.ts` grouped by domain (`courses`, `subjects`, `lessons`, etc.) unless refactoring that file.
- Use Prisma through `server/src/prisma.ts` singleton; do not create ad-hoc Prisma clients.
- TypeScript naming conventions (Node/Express):
  - route handlers and service functions: `camelCase` verbs (`listCourses`, `createSubject`, `deleteLesson`).
  - files should reflect exported responsibility in lowercase: `courses.routes.ts`, `subjects.service.ts`, `lesson.mapper.ts`.
  - interfaces/types/enums use `PascalCase`; suffix DTO-like transport shapes with `Dto` when needed for clarity.
  - request/response payload validators/schemas should be named with `...Schema` suffix.
  - error classes use `PascalCase` and end with `Error` (`ValidationError`, `NotFoundError`).

## Testing Expectations

- Add or update tests for behavior changes under `server/tests/**/*`.
- Coverage thresholds are enforced in Vitest config:
  - lines/statements/branches/functions >= 80
- Keep backend tests deterministic and clean up created DB records.
