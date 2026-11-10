import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common'
import type { HealthResponse } from '@pulseops/contracts'
import type pg from 'pg'
import { PG_POOL } from '../database/database.js'

@Controller('health')
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  /** 200 quando o banco responde; 503 com o mesmo formato quando não responde. */
  @Get()
  async check(): Promise<HealthResponse> {
    const databaseUp = await this.pool.query('select 1').then(
      () => true,
      () => false,
    )
    const body: HealthResponse = {
      status: databaseUp ? 'ok' : 'degraded',
      checks: { database: databaseUp ? 'up' : 'down' },
    }
    if (!databaseUp) throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE)
    return body
  }
}
