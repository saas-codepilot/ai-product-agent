# ADR 003: Prisma PostgreSQL persistence

## Context

The MVP's in-memory map lost products and listings whenever the API restarted.

## Decision

Use Prisma with PostgreSQL and keep all persistence behind `ProductRepository`. Retain an in-memory repository only for local tests when no database URL exists.

## Consequences

The domain contracts remain testable without infrastructure, while configured environments get durable ownership-scoped data. A local PostgreSQL instance is required for persistence tests.
