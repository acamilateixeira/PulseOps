# ADR 0004 — Telemetry storage: decision deferred to measurement

- **Status:** proposed · **Date:** 2026-11-10

## Context

The OpenTelemetry Collector receives and forwards telemetry; it does not store or query it. PulseOps needs a backend for traces, logs and metrics that fits a free 2 OCPU / 12 GB VM shared with other projects.

## Options under evaluation

1. **PostgreSQL only:** spans and logs in tables with short retention, metrics aggregated by PulseOps. Fewest moving parts; query patterns are hand-written.
2. **Collector + Prometheus + Tempo + Loki (+ Grafana):** standard tooling and query languages; more memory and operational surface.
3. **Collector + a single-binary backend** that stores traces, logs and metrics: fewer services than option 2.

## Decision

Not taken yet. Phase 2 starts with option 1 behind a `TelemetryStore` interface, measures memory and query latency in the [capacity test](https://github.com/acamilateixeira/portfolio-infra), and records the decision here with the numbers.

## Revisit when

The Phase 2 capacity run is available.
