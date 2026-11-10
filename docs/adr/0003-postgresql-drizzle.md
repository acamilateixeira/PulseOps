# ADR 0003 — PostgreSQL with Drizzle and an in-house migrator

- **Status:** accepted · **Date:** 2026-11-10

## Context

PulseOps stores service metadata, incidents and their transitions. Incident state needs transactions and constraints.

## Alternatives

1. **Prisma:** strong tooling, but a generated client and a separate query engine add build steps and memory.
2. **Drizzle:** typed queries close to SQL, no code generation, small runtime.
3. **Raw `pg`:** no abstraction, but no typed results either.

For migrations: `drizzle-kit` generates SQL and a journal from the schema; an in-house runner applies hand-written SQL.

## Decision

PostgreSQL 17, Drizzle for queries, and a small migrator (`apps/api/src/database/migrate.ts`): each migration runs once, inside a transaction, under a PostgreSQL advisory lock so two instances starting together do not race.

## Consequences and trade-offs

- Migrations are reviewed as SQL, including `check` constraints that mirror the contract.
- The Drizzle schema and the SQL must be kept in sync by hand; the integration test runs both against a real database.
- Pool limits are explicit: 10 connections, 3 s to acquire, 5 s statement timeout.

## Revisit when

Migrations become frequent enough that generating them from the schema saves real effort.
