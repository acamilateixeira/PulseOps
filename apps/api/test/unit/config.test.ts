import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadConfig } from '../../src/config.js'

test('lê a configuração com valores padrão', () => {
  const config = loadConfig({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' })
  assert.deepEqual(config, {
    databaseUrl: 'postgres://u:p@localhost:5432/db',
    port: 3000,
    corsOrigins: ['http://localhost:5173'],
  })
})

test('aceita várias origens de CORS separadas por vírgula', () => {
  const config = loadConfig({
    DATABASE_URL: 'postgresql://x',
    CORS_ORIGIN: 'https://a.test, https://b.test',
    API_PORT: '8080',
  })
  assert.deepEqual(config.corsOrigins, ['https://a.test', 'https://b.test'])
  assert.equal(config.port, 8080)
})

test('recusa ambiente inválido sem expor a URL do banco', () => {
  assert.throws(
    () => loadConfig({ DATABASE_URL: 'mysql://user:segredo@host/db', API_PORT: '70000' }),
    (error: Error) => {
      assert.match(error.message, /DATABASE_URL/)
      assert.match(error.message, /API_PORT/)
      assert.doesNotMatch(error.message, /segredo/)
      return true
    },
  )
})
