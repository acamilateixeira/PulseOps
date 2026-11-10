import 'reflect-metadata'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, describe, test } from 'node:test'
import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { healthResponseSchema, servicesResponseSchema } from '@pulseops/contracts'
import { AppModule } from '../../src/app.module.js'
import { loadConfig } from '../../src/config.js'
import { createPool } from '../../src/database/database.js'
import { migrate } from '../../src/database/migrate.js'
import { configureApp } from '../../src/http.js'

/*
 * Testes contra um PostgreSQL de verdade (o CI sobe o serviço). Sem
 * DATABASE_URL, o arquivo inteiro é pulado em vez de passar sem testar nada.
 */
const databaseUrl = process.env.DATABASE_URL

async function startApp(): Promise<{ app: INestApplication; base: string }> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
  const app = moduleRef.createNestApplication({ logger: false })
  configureApp(app, loadConfig())
  await app.listen(0, '127.0.0.1')
  const { port } = app.getHttpServer().address() as AddressInfo
  return { app, base: `http://127.0.0.1:${port}` }
}

describe('API com PostgreSQL', { skip: databaseUrl ? false : 'defina DATABASE_URL' }, () => {
  let app: INestApplication
  let base: string

  before(async () => {
    const pool = createPool(databaseUrl!)
    try {
      await pool.query('drop table if exists monitored_services, schema_migrations')
      assert.deepEqual(await migrate(pool), ['0001_monitored_services'])
      assert.deepEqual(await migrate(pool), [], 'a segunda execução não reaplica nada')
    } finally {
      await pool.end()
    }
    ;({ app, base } = await startApp())
  })

  after(async () => {
    await app?.close()
  })

  test('health responde ok com o banco no ar', async () => {
    const res = await fetch(`${base}/api/health`)
    assert.equal(res.status, 200)
    assert.deepEqual(healthResponseSchema.parse(await res.json()), {
      status: 'ok',
      checks: { database: 'up' },
    })
  })

  test('lista os serviços na ordem cadastrada e no formato do contrato', async () => {
    const res = await fetch(`${base}/api/v1/services`)
    assert.equal(res.status, 200)
    const body = servicesResponseSchema.parse(await res.json())
    assert.deepEqual(
      body.data.map((service) => service.slug),
      ['gateway', 'checkout', 'inventory', 'payments'],
    )
  })

  test('devolve o X-Request-Id recebido e cabeçalhos de segurança', async () => {
    const res = await fetch(`${base}/api/v1/services`, { headers: { 'X-Request-Id': 'teste-correlacao-01' } })
    assert.equal(res.headers.get('x-request-id'), 'teste-correlacao-01')
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(res.headers.get('x-frame-options'), 'DENY')
    assert.equal(res.headers.get('x-powered-by'), null)
  })

  test('rota desconhecida responde 404 no formato padrão com requestId', async () => {
    const res = await fetch(`${base}/api/v1/nao-existe`)
    assert.equal(res.status, 404)
    const body = (await res.json()) as { error: { code: string; requestId?: string } }
    assert.equal(body.error.code, 'not_found')
    assert.equal(body.error.requestId, res.headers.get('x-request-id'))
  })

  test('CORS só libera a origem configurada', async () => {
    const allowed = await fetch(`${base}/api/v1/services`, { headers: { Origin: 'http://localhost:5173' } })
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    const denied = await fetch(`${base}/api/v1/services`, { headers: { Origin: 'https://evil.test' } })
    assert.equal(denied.headers.get('access-control-allow-origin'), null)
  })
})

describe('API sem banco', { skip: databaseUrl ? false : 'defina DATABASE_URL' }, () => {
  test('health responde 503 degradado quando o banco não responde', async () => {
    const original = process.env.DATABASE_URL
    // Porta 1: conexão recusada na hora, sem esperar o timeout.
    process.env.DATABASE_URL = 'postgres://pulseops:pulseops@127.0.0.1:1/pulseops'
    const { app, base } = await startApp()
    try {
      const res = await fetch(`${base}/api/health`)
      assert.equal(res.status, 503)
      assert.deepEqual(await res.json(), { status: 'degraded', checks: { database: 'down' } })
    } finally {
      await app.close()
      process.env.DATABASE_URL = original
    }
  })
})
