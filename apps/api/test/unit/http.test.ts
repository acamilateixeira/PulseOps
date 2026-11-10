import 'reflect-metadata'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HttpException, NotFoundException, type ArgumentsHost } from '@nestjs/common'
import { HttpErrorFilter, requestId } from '../../src/http.js'

function fakeHost(req: object) {
  const sent: { status?: number; body?: unknown } = {}
  const res = {
    status(code: number) {
      sent.status = code
      return res
    },
    json(body: unknown) {
      sent.body = body
    },
    setHeader() {},
  }
  const host = {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
  } as unknown as ArgumentsHost
  return { host, sent }
}

test('erro HTTP sai no formato padrão com o requestId', () => {
  const { host, sent } = fakeHost({ requestId: 'req-12345678', method: 'GET', url: '/x', headers: {} })
  new HttpErrorFilter().catch(new NotFoundException('Cannot GET /x'), host)
  assert.equal(sent.status, 404)
  assert.deepEqual(sent.body, {
    error: { code: 'not_found', message: 'Cannot GET /x', requestId: 'req-12345678' },
  })
})

test('erro inesperado vira 500 sem vazar a mensagem interna', () => {
  const { host, sent } = fakeHost({ requestId: 'req-12345678', method: 'GET', url: '/x', headers: {} })
  const original = process.stdout.write.bind(process.stdout)
  let logged = ''
  process.stdout.write = ((chunk: string) => ((logged += chunk), true)) as typeof process.stdout.write
  try {
    new HttpErrorFilter().catch(new Error('senha do banco: hunter2'), host)
  } finally {
    process.stdout.write = original
  }
  assert.equal(sent.status, 500)
  assert.deepEqual(sent.body, {
    error: { code: 'internal_error', message: 'Unexpected error.', requestId: 'req-12345678' },
  })
  assert.match(logged, /"requestId":"req-12345678"/)
})

test('resposta de health com corpo próprio passa como está', () => {
  const { host, sent } = fakeHost({ headers: {} })
  const body = { status: 'degraded', checks: { database: 'down' } }
  new HttpErrorFilter().catch(new HttpException(body, 503), host)
  assert.equal(sent.status, 503)
  assert.deepEqual(sent.body, body)
})

test('requestId reaproveita um id seguro e troca um id malformado', () => {
  const headers: Record<string, string> = {}
  const res = { setHeader: (name: string, value: string) => (headers[name] = value) }
  const kept: { requestId?: string; headers: Record<string, string> } = {
    headers: { 'x-request-id': 'abc-123-def' },
  }
  requestId(kept as never, res as never, () => {})
  assert.equal(kept.requestId, 'abc-123-def')

  const replaced: { requestId?: string; headers: Record<string, string> } = {
    headers: { 'x-request-id': '<script>' },
  }
  requestId(replaced as never, res as never, () => {})
  assert.notEqual(replaced.requestId, '<script>')
  assert.match(replaced.requestId ?? '', /^[0-9a-f-]{36}$/)
})
