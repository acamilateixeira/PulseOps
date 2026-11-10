import type { ZodType } from 'zod'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Erro de chamada à API, com o requestId para cruzar com o log do servidor. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly requestId: string | null,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

/**
 * GET com validação do corpo pelo contrato. Uma resposta fora do contrato é
 * tratada como erro, em vez de chegar quebrada aos componentes.
 */
export async function getJson<T>(path: string, schema: ZodType<T>, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: signal ?? null,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiRequestError('The API could not be reached.', null, null)
  }
  const requestId = response.headers.get('x-request-id')
  if (!response.ok) {
    throw new ApiRequestError(`The API answered with HTTP ${response.status}.`, response.status, requestId)
  }
  const parsed = schema.safeParse(await response.json().catch(() => undefined))
  if (!parsed.success) {
    throw new ApiRequestError('The API answered in an unexpected format.', response.status, requestId)
  }
  return parsed.data
}
