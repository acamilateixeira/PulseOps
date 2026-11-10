# PulseOps

**English** · [Português](README.pt-BR.md)

PulseOps is an observability and incident response platform built around **real telemetry**: demo services generate actual requests, spans, logs and measurements, and the dashboard only charts values it can trace back to a source.

> **Status: Phase 1 (foundation).** The monorepo, API, dashboard shell, PostgreSQL, Docker Compose and CI are in place. Telemetry, incidents and the simulator are not implemented yet, and the UI says so instead of showing placeholder charts. See [Roadmap](#roadmap).

## What works today

| Area                 | Implemented                                                                                                                      | Verified by                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| API (NestJS 12)      | `GET /api/health` (checks the database, 503 when it is down), `GET /api/v1/services`                                             | Integration tests against PostgreSQL in CI         |
| Contracts            | Zod schemas shared by API and UI; the UI rejects responses outside the contract                                                  | Unit tests (`packages/contracts`, `apps/web`)      |
| Dashboard (React 19) | Overview with loading, empty, error-with-retry and invalid-response states; dark theme; keyboard skip link; reduced motion       | Vitest + React Testing Library                     |
| Correlation          | `X-Request-Id` accepted or generated, returned in headers, logs and error bodies; nginx forwards its own id                      | Unit and integration tests                         |
| Security baseline    | Strict CORS allowlist, security headers, no `X-Powered-By`, error bodies without internals, request-size limits, bounded queries | Integration tests                                  |
| Database             | PostgreSQL 17, Drizzle queries, transactional migrations under an advisory lock                                                  | Integration test runs migrations twice             |
| Docker               | `docker compose up --build` runs the full app locally                                                                            | CI starts the same Compose file and smoke-tests it |

## Run it on your machine

Requirements: Docker. For development without containers: Node.js 22 and pnpm 10 (`corepack enable`).

```bash
# Full app (database, API, dashboard) at http://localhost:8080
docker compose up --build

# Development with hot reload: database in Docker, API and UI on the host
docker compose up -d db
cp .env.example .env
pnpm install
pnpm --filter @pulseops/contracts build
pnpm --filter @pulseops/api build && node --env-file=.env apps/api/dist/src/database/migrate-cli.js
node --env-file=.env apps/api/dist/src/main.js   # API on :3000
pnpm --filter @pulseops/web dev                  # UI on :5173, /api proxied to :3000
```

## Tests

```bash
pnpm test                                        # contracts, API unit, web components
DATABASE_URL=postgres://pulseops:pulseops@localhost:5432/pulseops \
  pnpm --filter @pulseops/api test:integration   # API against a real PostgreSQL
pnpm lint && pnpm typecheck && pnpm format:check
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs formatting, lint, type checking, unit and component tests, the build, API integration tests with a PostgreSQL service, the Docker Compose smoke test and a dependency audit. Nothing is deployed yet.

## Architecture

```text
apps/web            React + Vite + TanStack Query + Tailwind (dashboard)
apps/api            NestJS: HTTP transport, modules, PostgreSQL access
packages/contracts  Zod schemas for every API response
docs/adr            Architecture decisions
```

Decisions: [monorepo](docs/adr/0001-monorepo-pnpm.md) · [NestJS](docs/adr/0002-nestjs.md) · [PostgreSQL and migrations](docs/adr/0003-postgresql-drizzle.md) · [telemetry storage (deferred to measurement)](docs/adr/0004-telemetry-storage-deferred.md).

## Roadmap

1. **Foundation** — monorepo, API, dashboard shell, PostgreSQL, Compose, CI, first tests. _In progress._
2. **Telemetry** — instrumented demo services (gateway → checkout → inventory, payments), OpenTelemetry SDK and Collector, W3C trace context, query endpoints.
3. **Dashboard** — service explorer, trace waterfall, logs explorer, accessible charts with table alternatives.
4. **Incident simulator** — slow dependency, HTTP errors, timeouts with bounded retries and jitter, circuit breaker, threshold-based detection with cooldowns.
5. **Engineering quality** — Playwright end-to-end, k6 benchmarks, accessibility audits.
6. **Publication** — capacity test, deployment proposal and approval, public demo.

## Engineering evidence

- [Engineering evidence matrix](ENGINEERING_EVIDENCE_MATRIX.md): what is implemented and how it is verified.
- [AI-assisted engineering log](docs/ai-assisted-engineering.md): what AI did, what was accepted or rejected, and how it was checked.
