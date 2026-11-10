import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common'
import type pg from 'pg'
import { APP_CONFIG, loadConfig, type AppConfig } from '../config.js'
import { DATABASE, PG_POOL, createDatabase, createPool } from './database.js'

@Global()
@Module({
  providers: [
    { provide: APP_CONFIG, useFactory: (): AppConfig => loadConfig() },
    {
      provide: PG_POOL,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => createPool(config.databaseUrl),
    },
    { provide: DATABASE, inject: [PG_POOL], useFactory: (pool: pg.Pool) => createDatabase(pool) },
  ],
  exports: [APP_CONFIG, PG_POOL, DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end()
  }
}
