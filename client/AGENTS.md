# AGENTS.md (Client)

Guidance for contributors and coding agents working in the frontend module.

## Scope

Applies to all files under `client/`.

## Commands Reference

Run commands from repo root unless noted.

- `npm run dev --workspace=client`: start Vite dev server
- `npm run build --workspace=client`: type-check and build production assets
- `npm run preview --workspace=client`: preview built frontend bundle
- `npm run lint --workspace=client`: run ESLint
- `npm run test --workspace=client`: run frontend Vitest suite with coverage

## Coding Conventions

- Keep frontend API calls centralized through `client/src/lib/api.ts`.
- For calendar/day comparisons, use `client/src/lib/dateUtils.ts` helpers to avoid timezone regressions.
- TypeScript naming conventions (React):
  - React components use `PascalCase` and matching file names (`CourseList.tsx`, `LessonCard.tsx`).
  - hooks use `camelCase` with `use` prefix (`useCourses`, `useLessonFilters`).
  - props/state/types/interfaces use `PascalCase` for type names and `camelCase` for values (`CourseCardProps`, `selectedCourseId`).
  - context objects use `PascalCase` with `Context` suffix; providers use `PascalCase` with `Provider` suffix.
  - event handlers use `camelCase` with `handle` prefix (`handleSubmit`, `handleCourseSelect`).

## Testing Expectations

- Add or update tests for behavior changes under `client/tests/**/*`.
- Coverage thresholds are enforced in Vitest config:
  - lines/statements/branches >= 80
  - functions >= 75
