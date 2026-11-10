/**
 * Migrações em ordem. Cada uma roda uma única vez, dentro de uma transação, e
 * fica registrada em schema_migrations. Ver docs/adr/0003.
 */
export type Migration = { id: string; sql: string }

export const migrations: Migration[] = [
  {
    id: '0001_monitored_services',
    sql: `
      create table monitored_services (
        slug text primary key check (slug ~ '^[a-z][a-z0-9-]{1,40}$'),
        name text not null check (char_length(name) between 1 and 80),
        description text not null check (char_length(description) <= 280),
        kind text not null check (kind in ('gateway', 'service', 'dependency')),
        position integer not null unique,
        created_at timestamptz not null default now()
      );

      insert into monitored_services (slug, name, description, kind, position) values
        ('gateway', 'Gateway', 'Entry point that receives demo traffic and calls the downstream services.', 'gateway', 1),
        ('checkout', 'Checkout', 'Places orders by reserving stock and charging the payment provider.', 'service', 2),
        ('inventory', 'Inventory', 'Reserves and releases stock for an order.', 'service', 3),
        ('payments', 'Payments provider', 'Simulated external payment provider used for latency and failure scenarios.', 'dependency', 4);
    `,
  },
]
