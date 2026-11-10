import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

export const PG_POOL = Symbol('PG_POOL')
export const DATABASE = Symbol('DATABASE')

export type Database = NodePgDatabase<typeof schema>

/**
 * Pool com limites explícitos: nenhuma consulta segura uma conexão por mais de
 * 5 s e ninguém espera mais de 3 s por uma conexão livre.
 */
export function createPool(connectionString: string): pg.Pool {
  return new pg.Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 3_000,
    statement_timeout: 5_000,
    idleTimeoutMillis: 30_000,
  })
}

export function createDatabase(pool: pg.Pool): Database {
  return drizzle({ client: pool, schema })
}
