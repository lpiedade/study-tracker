# Architecture

## Monorepo Overview

This project is a workspace monorepo with two deployable apps:

- `client`: React 18 + Vite + TypeScript SPA
- `server`: Express 5 + Prisma + SQLite API

Root workspace config (`package.json`) orchestrates cross-package commands (`dev`, `test`).

## Runtime Topology

- Frontend runs on `http://localhost:5173` (Vite dev server)
- Backend runs on `http://localhost:3001` (Express)
- Frontend talks to backend through Axios base URL `http://localhost:3001/api` (`client/src/lib/api.ts`)
- Backend persists data in SQLite via Prisma (`server/prisma/schema.prisma`)

## Backend Structure

- `server/src/index.ts`: process entrypoint, binds HTTP port
- `server/src/app.ts`: Express app, middleware, and all route handlers
- `server/src/prisma.ts`: Prisma singleton instance
- `server/prisma/schema.prisma`: data model and datasource/generator configuration
- `server/prisma/migrations`: schema evolution history

### API Domains in `server/src/app.ts`

- Courses: `/api/courses`
- Subjects: `/api/subjects`
- Study sessions: `/api/sessions`
- Checklist templates: `/api/templates`
- Lesson plans/checklists: `/api/lessons`
- Exams: `/api/exams`
- Stats: `/api/stats/*`

## Frontend Structure

- `client/src/App.tsx`: route tree and page registration
- `client/src/components`: shared UI components
- `client/src/components/calendar`: calendar-specific components
- `client/src/pages`: feature pages (Dashboard, Planner, Results, etc.)
- `client/src/lib`: cross-cutting utilities (`api.ts`, `dateUtils.ts`)
- `client/src/types.ts`: domain interfaces used across pages/components

## Data Model Highlights

Core entities defined in Prisma:

- `Course` -> has many `Subject`
- `Subject` -> has many `StudySession`, `LessonPlan`, `ExamResult`
- `LessonPlan` -> optional checklist items and related study sessions
- `ChecklistTemplate` -> reusable checklist item templates
- `ExamResult` -> score tracking per subject

## Decisions and Constraints

- Stack decisions are tracked in ADRs under `docs/adr`
- Prisma is pinned to v5 and configured with `engineType = "library"` for stability with local SQLite (see ADR 0003)
- API error handling currently returns generic 500 responses for most unexpected failures; route-level validation is partial and domain-specific
