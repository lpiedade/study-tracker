# ADR 0003: Prisma Versioning and Engine Type

Date: 2026-02-15

## Status

Accepted

## Context

During the upgrade to Prisma 7, we encountered significant issues with the default WASM-based engine when using SQLite in a local Node.js environment. The WASM engine and the driver adapters required for SQLite in newer Prisma versions introduced complexity and stability issues in our development setup.

## Decision

We decided to keep Prisma at version **5.22.0** and use the **Library/Binary** engine instead of WASM. 

Additionally, we explicitly set `engineType = "library"` in the `schema.prisma` file to ensure consistency.

## Consequences

- Stable local development with SQLite.
- Avoidance of complex WASM/Edge configuration for a project intended to run in a standard Node.js environment.
- We must manually monitor for security updates in the 5.x branch until a stable transition path to a newer SQLite adapter is established.
