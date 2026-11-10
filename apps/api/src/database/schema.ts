import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Serviços que o PulseOps acompanha. Na Fase 2 eles passam a gerar telemetria real. */
export const monitoredServices = pgTable('monitored_services', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  kind: text('kind', { enum: ['gateway', 'service', 'dependency'] }).notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
