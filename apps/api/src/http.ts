import { randomUUID } from 'node:crypto'
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  type INestApplication,
} from '@nestjs/common'
import type { ApiError } from '@pulseops/contracts'
import type { AppConfig } from './config.js'
import { logger } from './logger.js'

// Tipos mínimos do Express usados aqui, para não depender de @types/express.
type Req = {
  headers: Record<string, string | string[] | undefined>
  method: string
  url: string
  requestId?: string
}
type Res = {
  setHeader(name: string, value: string): void
  status(code: number): Res
  json(body: unknown): void
}
type Next = () => void

const REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/

/** Aceita o X-Request-Id do cliente quando tem formato seguro; senão gera um. */
export function requestId(req: Req, res: Res, next: Next): void {
  const incoming = req.headers['x-request-id']
  const id = typeof incoming === 'string' && REQUEST_ID.test(incoming) ? incoming : randomUUID()
  req.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}

/** Cabeçalhos de segurança para uma API JSON (sem dependência extra). */
export function securityHeaders(_req: Req, res: Res, next: Next): void {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  next()
}

/**
 * Todo erro sai no formato `ApiError`, com o requestId do log. Erros não
 * esperados viram 500 sem detalhe interno na resposta; o detalhe vai para o log.
 * Respostas de health com corpo próprio passam como estão.
 */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const req = http.getRequest<Req>()
    const res = http.getResponse<Res>()
    const requestId = req.requestId

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const payload = exception.getResponse()
      if (typeof payload === 'object' && payload !== null && 'checks' in payload) {
        res.status(status).json(payload)
        return
      }
      const message =
        typeof payload === 'string'
          ? payload
          : typeof payload === 'object' && payload !== null && 'message' in payload
            ? String((payload as { message: unknown }).message)
            : exception.message
      res.status(status).json(errorBody(codeFor(status), message, requestId))
      return
    }

    logger.error('unhandled error', {
      requestId,
      method: req.method,
      path: req.url,
      error: exception instanceof Error ? exception.message : String(exception),
    })
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorBody('internal_error', 'Unexpected error.', requestId))
  }
}

function errorBody(code: string, message: string, requestId: string | undefined): ApiError {
  return { error: requestId ? { code, message, requestId } : { code, message } }
}

function codeFor(status: number): string {
  switch (status) {
    case 400:
      return 'bad_request'
    case 404:
      return 'not_found'
    case 405:
      return 'method_not_allowed'
    case 413:
      return 'payload_too_large'
    case 429:
      return 'rate_limited'
    default:
      return status >= 500 ? 'internal_error' : 'request_error'
  }
}

/** Configuração HTTP compartilhada entre main.ts e os testes de integração. */
export function configureApp(app: INestApplication, config: AppConfig): void {
  const server = app.getHttpAdapter().getInstance() as { disable(setting: string): void }
  server.disable('x-powered-by')
  app.setGlobalPrefix('api')
  app.enableCors({ origin: config.corsOrigins, methods: ['GET', 'POST'], maxAge: 600 })
  app.use(requestId)
  app.use(securityHeaders)
  app.useGlobalFilters(new HttpErrorFilter())
  app.enableShutdownHooks()
}
