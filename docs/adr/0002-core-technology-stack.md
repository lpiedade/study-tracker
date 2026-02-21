# ADR 0002: Core Technology Stack

Date: 2026-02-15

## Status

Accepted

## Context

The Study Tracker project requires a robust, scalable, and easy-to-maintain stack for both the client and server.

## Decision

We have chosen the following core technology stack:

1.  **Frontend**: React with Vite for fast development and build.
2.  **Styling**: Tailwind CSS for utility-first styling.
3.  **Backend**: Node.js with Express.
4.  **Database**: SQLite for local development simplicity.
5.  **ORM**: Prisma for type-safe database access.
6.  **Testing**: Vitest for both frontend and backend testing.

## Consequences

- Type safety across the stack (TypeScript).
- Fast iterations with Vite and Vitest.
- Low entry barrier for local setup (SQLite doesn't require a separate server).
- Future migration to PostgreSQL or MySQL is simplified by using Prisma.
