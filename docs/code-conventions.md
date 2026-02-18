# Conventions

## General

- TypeScript is used in both packages; prefer explicit types for shared/domain objects.
- Keep changes scoped to the package you touch (`client` or `server`) and avoid unnecessary cross-package edits.
- Follow existing formatting/style in each package instead of forcing one global style.

## Frontend Conventions (`client`)

- Keep routing centralized in `client/src/App.tsx`.
- Put page-level logic in `client/src/pages/*`.
- Put reusable UI in `client/src/components/*`.
- Put shared infra/utilities in `client/src/lib/*`.
- Keep API calls behind the shared Axios instance in `client/src/lib/api.ts`.
- Reuse interfaces in `client/src/types.ts` rather than redefining response shapes inline.
- For date-only behavior (calendar/planning), use `parseLocalDate` and `isSameLocalDate` from `client/src/lib/dateUtils.ts`.

## Backend Conventions (`server`)

- Keep route groups in `server/src/app.ts` organized by domain comments (`Courses`, `Subjects`, `Lessons`, etc.).
- Use the Prisma singleton from `server/src/prisma.ts`; do not instantiate `PrismaClient` in route handlers.
- Keep API paths under `/api` and use plural nouns for collection routes.
- Convert path/body IDs to numbers before Prisma operations.
- Return consistent JSON errors (`{ error: "..." }`) on failures.

## Database and Prisma

- Schema source of truth is `server/prisma/schema.prisma`.
- When schema changes:
  - create a migration in `server/prisma/migrations`
  - regenerate Prisma client
  - run backend tests
- Keep `engineType = "library"` unless ADR-backed change is made.

## Documentation and Decisions

- Record architectural decisions in ADRs under `docs/adr`.
- Keep high-level project docs current:
  - `docs/architecture.md`
  - `docs/conventions.md`
  - `docs/testing.md`
