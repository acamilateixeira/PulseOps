import { loadConfig } from '../config.js'
import { createPool } from './database.js'
import { migrate } from './migrate.js'

const pool = createPool(loadConfig().databaseUrl)
try {
  const applied = await migrate(pool)
  console.log(JSON.stringify({ level: 'info', msg: 'migrations applied', applied }))
} finally {
  await pool.end()
}
