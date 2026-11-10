# ADR 0002 — NestJS for the API

- **Status:** accepted · **Date:** 2026-11-10

## Context

The API will grow modules for telemetry querying, incident management and the simulator, each with its own dependencies (database, telemetry backend, demo services).

## Problem

Keep HTTP transport, use cases and infrastructure separate as modules are added, and swap infrastructure in tests.

## Alternatives

1. **Fastify directly:** faster and smaller, but module boundaries and dependency injection would be hand-rolled.
2. **Express directly:** same trade-off, with weaker built-in validation and typing.
3. **NestJS:** modules, dependency injection and testing utilities built in, at the cost of decorators, reflection metadata and a larger runtime.

## Decision

NestJS 12 on the Express adapter, compiled with `tsc` to ES modules. Infrastructure is injected through explicit tokens (`PG_POOL`, `DATABASE`), so tests can replace it.

## Consequences and trade-offs

- Decorators require `experimentalDecorators` and `emitDecoratorMetadata`; tests run on the `tsc` output with `node:test`, because esbuild-based runners do not emit decorator metadata.
- More startup cost and memory than plain Fastify; the [capacity test](https://github.com/acamilateixeira/portfolio-infra) will measure it before deployment.

## Revisit when

Measured latency or memory makes the framework overhead significant for the demo's limits.
