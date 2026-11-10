import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OverviewPage } from './OverviewPage'

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <OverviewPage />
    </QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req-test-0001', ...init.headers },
  })
}

const services = {
  data: [
    { slug: 'gateway', name: 'Gateway', description: 'Entry point.', kind: 'gateway' },
    { slug: 'payments', name: 'Payments provider', description: 'External.', kind: 'dependency' },
  ],
}

describe('OverviewPage', () => {
  it('shows a loading state, then the services from the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(services))
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading services' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Gateway' })).toBeInTheDocument()
    expect(screen.getByText('External dependency')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/services',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it('shows an empty state when no services are registered', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [] }))
    renderPage()
    expect(await screen.findByText('No services are registered yet.')).toBeInTheDocument()
  })

  it('shows the error with the request ID and retries on demand', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: 'internal_error', message: 'x' } }, { status: 500 }),
      )
      .mockResolvedValueOnce(jsonResponse(services))
    renderPage()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The API answered with HTTP 500.')
    expect(alert).toHaveTextContent('req-test-0001')

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Gateway' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('treats a response outside the contract as an error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [{ slug: 'X!', kind: 'queue' }] }))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('unexpected format')
  })

  it('reports a network failure without crashing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('The API could not be reached.')
  })
})
