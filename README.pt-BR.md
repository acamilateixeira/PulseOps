# PulseOps

[English](README.md) · **Português**

O PulseOps é uma plataforma de observabilidade e resposta a incidentes baseada em **telemetria real**: serviços de demonstração geram requisições, spans, logs e medições de verdade, e o painel só mostra valores que consegue rastrear até uma fonte.

> **Estado: Fase 1 (fundação).** Monorepo, API, estrutura do painel, PostgreSQL, Docker Compose e CI estão prontos. Telemetria, incidentes e simulador ainda não existem, e a interface diz isso em vez de mostrar gráficos de mentira. Veja o [roteiro](#roteiro).

## O que já funciona

| Área              | Implementado                                                                                                                                                    | Verificado por                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| API (NestJS 12)   | `GET /api/health` (consulta o banco, 503 quando ele cai), `GET /api/v1/services`                                                                                | Testes de integração com PostgreSQL no CI           |
| Contratos         | Esquemas Zod compartilhados entre API e interface; a interface recusa resposta fora do contrato                                                                 | Testes unitários (`packages/contracts`, `apps/web`) |
| Painel (React 19) | Visão geral com estados de carregamento, vazio, erro com nova tentativa e resposta inválida; tema escuro; atalho de teclado para o conteúdo; movimento reduzido | Vitest + React Testing Library                      |
| Correlação        | `X-Request-Id` aceito ou gerado, devolvido no cabeçalho, nos logs e nos erros; o nginx repassa o próprio id                                                     | Testes unitários e de integração                    |
| Segurança básica  | CORS restrito, cabeçalhos de segurança, sem `X-Powered-By`, erros sem detalhe interno, limite de tamanho de requisição, consultas com teto                      | Testes de integração                                |
| Banco             | PostgreSQL 17, consultas com Drizzle, migrações em transação sob advisory lock                                                                                  | Teste de integração roda as migrações duas vezes    |
| Docker            | `docker compose up --build` roda o app completo na sua máquina                                                                                                  | O CI sobe o mesmo Compose e faz um smoke test       |

## Rodar na sua máquina

Requisitos: Docker. Para desenvolver sem contêineres: Node.js 22 e pnpm 10 (`corepack enable`).

```bash
# App completo (banco, API e painel) em http://localhost:8080
docker compose up --build

# Desenvolvimento com recarga: banco no Docker, API e interface na máquina
docker compose up -d db
cp .env.example .env
pnpm install
pnpm --filter @pulseops/contracts build
pnpm --filter @pulseops/api build && node --env-file=.env apps/api/dist/src/database/migrate-cli.js
node --env-file=.env apps/api/dist/src/main.js   # API na porta 3000
pnpm --filter @pulseops/web dev                  # interface na 5173, /api vai para a 3000
```

## Testes

```bash
pnpm test                                        # contratos, unitários da API, componentes
DATABASE_URL=postgres://pulseops:pulseops@localhost:5432/pulseops \
  pnpm --filter @pulseops/api test:integration   # API contra um PostgreSQL de verdade
pnpm lint && pnpm typecheck && pnpm format:check
```

O CI roda formatação, lint, tipos, testes unitários e de componentes, build, integração da API com PostgreSQL, smoke do Docker Compose e auditoria de dependências. Ainda não há deploy.

## Roteiro

1. **Fundação** — monorepo, API, estrutura do painel, PostgreSQL, Compose, CI, primeiros testes. _Em andamento._
2. **Telemetria** — serviços de demonstração instrumentados, OpenTelemetry SDK e Collector, W3C trace context, endpoints de consulta.
3. **Painel** — explorador de serviços, waterfall de traces, explorador de logs, gráficos acessíveis com tabela alternativa.
4. **Simulador de incidentes** — dependência lenta, erros HTTP, timeouts com retries limitados e jitter, circuit breaker, detecção por limiar com cooldown.
5. **Qualidade** — Playwright, benchmarks com k6, auditoria de acessibilidade.
6. **Publicação** — teste de capacidade, proposta e aprovação de deploy, demo pública.

Decisões de arquitetura em [docs/adr](docs/adr), evidências em [ENGINEERING_EVIDENCE_MATRIX.md](ENGINEERING_EVIDENCE_MATRIX.md) e o registro de uso de IA em [docs/ai-assisted-engineering.md](docs/ai-assisted-engineering.md).
