# AGENTS.md

Guidance for contributors and coding agents working in this monorepo.

## Scope

This repository is a Node.js workspace monorepo with:

- `client`: React + Vite + TypeScript frontend
- `server`: Express + Prisma + SQLite backend

## Precedence

- Always follow this root file for shared rules.
- When working in `client/`, also follow `client/AGENTS.md`.
- When working in `server/`, also follow `server/AGENTS.md`.
- If rules conflict, the more specific (module-level) file takes precedence for that module.

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
   - run migrations/generate when schema changes (see `server/AGENTS.md`):
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
5. If Prisma schema changes, follow `server/AGENTS.md` migration requirements and confirm server tests still pass.
6. Update CHANGELOG.md:
   - add new changes

## Commands Reference

Run all commands from repo root unless noted.

- Root workspace commands:
  - `npm run dev`: run backend and frontend dev servers concurrently
  - `npm run test`: run tests in all workspaces
- Backend and frontend command details live in `server/AGENTS.md` and `client/AGENTS.md`.

## Coding Conventions (Shared)

- Keep API surface under `/api/*` and use plural resource names (`/api/courses`, `/api/subjects`).
- Preserve existing style conventions per package (frontend and backend currently use different formatting styles).
- TypeScript naming conventions (general):
  - use `camelCase` for variables, function names, parameters, and object properties.
  - use `PascalCase` for type aliases, interfaces, classes, enums, and React component names.
  - use `UPPER_SNAKE_CASE` only for true constants and exported immutable config values.
  - prefer descriptive names that include units/context when relevant (`durationMinutes`, `createdAtIso`).
  - boolean names should read as predicates (`isLoading`, `hasError`, `canEdit`).
  - avoid ambiguous abbreviations unless they are domain-standard (`id`, `url`, `api`).

## Testing Expectations

- Add or update tests for behavior changes:
  - frontend: `client/tests/**/*`
  - backend: `server/tests/**/*`
- Coverage thresholds are enforced in Vitest configs (module-specific details are in each module AGENTS file).

## Documentation Expectations

- Update docs when behavior or architecture changes:
  - `docs/architecture.md`
  - `docs/conventions.md`
  - `docs/testing.md`
- Record significant architectural decisions as ADRs in `docs/adr`.

## Codex Agent System Conventions

- Local agent assets live under `.agents/`:
  - agents: `.agents/agents/*.md`
  - skills: `.agents/skills/*/SKILL.md`
  - workflows: `.agents/workflows/*.md`
  - helper scripts: `.agents/scripts/*.py`
  - runtime rules: `.agents/rules/CODEX.md`
- Naming for agent files and frontmatter `name` values:
  - use `kebab-case` (`backend-specialist`, `test-engineer`, `project-planner`)
  - keep file name and frontmatter `name` identical
- Naming for skill folders and frontmatter `name` values:
  - use `kebab-case` (`clean-code`, `api-patterns`, `plan-writing`)
  - keep folder name and frontmatter `name` identical
- Automation naming (Codex Desktop):
  - use short, action-oriented names (`daily-test-report`, `weekly-dependency-check`)
  - automation setup is managed outside this repo at `$CODEX_HOME/automations/<id>/automation.toml`
  - do not commit local Codex automation state into this repository
