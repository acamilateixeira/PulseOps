import { Inject, Injectable } from '@nestjs/common'
import type { Service } from '@pulseops/contracts'
import { asc } from 'drizzle-orm'
import { DATABASE, type Database } from '../database/database.js'
import { monitoredServices } from '../database/schema.js'

/** Limite duro de linhas: a lista é pequena por natureza, e nenhuma consulta pública fica sem teto. */
const MAX_SERVICES = 100

@Injectable()
export class ServicesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Service[]> {
    return this.db
      .select({
        slug: monitoredServices.slug,
        name: monitoredServices.name,
        description: monitoredServices.description,
        kind: monitoredServices.kind,
      })
      .from(monitoredServices)
      .orderBy(asc(monitoredServices.position))
      .limit(MAX_SERVICES)
  }
}
