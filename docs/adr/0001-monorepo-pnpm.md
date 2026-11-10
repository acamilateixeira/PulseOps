# ADR 0001 — Monorepo with pnpm workspaces

- **Status:** accepted · **Date:** 2026-11-10

## Context

PulseOps has a React dashboard, a NestJS API and, from Phase 2, demo services that generate telemetry. They share HTTP contracts and change together in most pull requests.

## Problem

Keep the API and the dashboard on the same contract without publishing packages or syncing versions by hand.

## Alternatives

1. **Separate repositories** with a published contracts package: independent release cycles, but every contract change becomes three pull requests and a version bump.
2. **Monorepo with npm workspaces:** works, but hoisting lets a package import a dependency it never declared.
3. **Monorepo with pnpm workspaces:** strict `node_modules` (undeclared imports fail), one lockfile, `--filter` to build or test one package and its dependencies.
4. **Nx or Turborepo:** task graph and remote cache; not needed at this size.

## Decision

pnpm workspaces, no build orchestrator. `packages/contracts` holds the Zod schemas used by both sides.

## Consequences and trade-offs

- One pull request changes the contract, the API and the UI, and CI checks them together.
- `@pulseops/contracts` must be built before the other packages type-check; CI does this explicitly.
- No task cache: acceptable while the full CI run stays within a few minutes.

## Revisit when

CI time grows past ~10 minutes or a package needs an independent release cycle.
