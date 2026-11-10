import type { ServiceKind } from '@pulseops/contracts'
import { useServices } from '../api/queries'
import { ErrorPanel, LoadingRows } from '../components/QueryState'

const kindLabel: Record<ServiceKind, string> = {
  gateway: 'Gateway',
  service: 'Service',
  dependency: 'External dependency',
}

export function OverviewPage() {
  const services = useServices()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Services registered in PulseOps. Throughput, error rate and latency appear here once the demo
          services start emitting telemetry.
        </p>
      </header>

      <section aria-labelledby="services-title" className="space-y-3">
        <h2 id="services-title" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Monitored services
        </h2>
        {services.isPending && <LoadingRows label="Loading services" />}
        {services.isError && <ErrorPanel error={services.error} onRetry={() => void services.refetch()} />}
        {services.isSuccess && services.data.length === 0 && (
          <p className="rounded-lg border border-dashed border-line p-6 text-sm text-muted">
            No services are registered yet.
          </p>
        )}
        {services.isSuccess && services.data.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-panel">
            {services.data.map((service) => (
              <li
                key={service.slug}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted">{service.description}</p>
                </div>
                <span className="w-fit rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-muted">
                  {kindLabel[service.kind]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="telemetry-title" className="rounded-lg border border-line p-4">
        <h2 id="telemetry-title" className="font-medium">
          Telemetry
        </h2>
        <p className="mt-1 text-sm text-muted">
          Not collected yet. PulseOps will only chart values measured from real requests, so this panel stays
          empty until the OpenTelemetry pipeline is in place.
        </p>
      </section>
    </div>
  )
}
