import assert from 'node:assert/strict'
import { test } from 'node:test'
import { healthResponseSchema, servicesResponseSchema } from './index.js'

test('aceita a lista de serviços no formato da API', () => {
  const parsed = servicesResponseSchema.parse({
    data: [{ slug: 'checkout', name: 'Checkout', description: 'Fecha pedidos.', kind: 'service' }],
  })
  assert.equal(parsed.data[0]?.slug, 'checkout')
})

test('recusa slug fora do padrão e tipo desconhecido', () => {
  assert.equal(
    servicesResponseSchema.safeParse({
      data: [{ slug: 'Checkout!', name: 'x', description: '', kind: 'service' }],
    }).success,
    false,
  )
  assert.equal(
    servicesResponseSchema.safeParse({
      data: [{ slug: 'checkout', name: 'x', description: '', kind: 'queue' }],
    }).success,
    false,
  )
})

test('health só aceita os estados documentados', () => {
  assert.equal(healthResponseSchema.safeParse({ status: 'ok', checks: { database: 'up' } }).success, true)
  assert.equal(healthResponseSchema.safeParse({ status: 'up', checks: { database: 'up' } }).success, false)
})
