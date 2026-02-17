# Testing

## Tooling

- Frontend: Vitest + Testing Library + jsdom (`client`)
- Backend: Vitest + Supertest + node environment (`server`)
- Coverage provider: V8 in both packages

## Test Locations

- Frontend tests: `client/tests/**/*.test.tsx` and `client/tests/**/*.test.ts`
- Backend tests: `server/tests/**/*.test.ts`

## Commands

From repo root:

- Run all tests in workspaces: `npm run test`
- Run frontend tests only: `npm run test --workspace=client`
- Run backend tests only: `npm run test --workspace=server`

Useful local checks:

- Frontend lint: `npm run lint --workspace=client`

## Coverage Thresholds

Configured in Vitest:

- Client (`client/vite.config.ts`)
  - lines >= 80
  - statements >= 80
  - branches >= 80
  - functions >= 75
- Server (`server/vitest.config.ts`)
  - lines >= 80
  - statements >= 80
  - branches >= 80
  - functions >= 80

## CI Behavior

GitHub Actions workflow: `.github/workflows/test.yml`

- Runs on push/PR to `main`
- Installs root dependencies
- Generates Prisma client for server package
- Runs workspace tests from root
- Uploads coverage and junit test results to Codecov

## Backend Test Notes

- Integration tests hit real routes from `server/src/app.ts`.
- Tests rely on Prisma with SQLite and explicitly clean up created records.
- Keep test data isolated and deterministic to avoid cross-test coupling.

## Frontend Test Notes

- Shared test setup lives in `client/tests/setup.ts` (`@testing-library/jest-dom/vitest`).
- Prefer testing user-visible behavior over implementation details.
