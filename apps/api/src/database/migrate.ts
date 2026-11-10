import type pg from 'pg'
import { migrations, type Migration } from './migrations.js'

/** Chave fixa do advisory lock: duas instâncias subindo juntas não migram ao mesmo tempo. */
const MIGRATION_LOCK = 727_001

/** Aplica as migrações pendentes. Devolve os ids aplicados nesta execução. */
export async function migrate(pool: pg.Pool, list: Migration[] = migrations): Promise<string[]> {
  const client = await pool.connect()
  const applied: string[] = []
  try {
    await client.query('select pg_advisory_lock($1)', [MIGRATION_LOCK])
    await client.query(
      'create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())',
    )
    const done = new Set(
      (await client.query<{ id: string }>('select id from schema_migrations')).rows.map((row) => row.id),
    )
    for (const migration of list) {
      if (done.has(migration.id)) continue
      try {
        await client.query('begin')
        await client.query(migration.sql)
        await client.query('insert into schema_migrations (id) values ($1)', [migration.id])
        await client.query('commit')
        applied.push(migration.id)
      } catch (error) {
        await client.query('rollback')
        throw new Error(`Migração ${migration.id} falhou`, { cause: error })
      }
    }
    return applied
  } finally {
    await client.query('select pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => undefined)
    client.release()
  }
}
