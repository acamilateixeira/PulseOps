import type { LoggerService } from '@nestjs/common'

type Fields = Record<string, unknown>

/** Logs estruturados em JSON, uma linha por evento, no stdout. */
function write(level: 'debug' | 'info' | 'warn' | 'error', msg: string, fields: Fields = {}): void {
  process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields })}\n`)
}

export const logger = {
  info: (msg: string, fields?: Fields) => write('info', msg, fields),
  warn: (msg: string, fields?: Fields) => write('warn', msg, fields),
  error: (msg: string, fields?: Fields) => write('error', msg, fields),
}

/** Adaptador para o logger do Nest usar o mesmo formato. */
export class JsonLogger implements LoggerService {
  log(message: unknown, context?: string): void {
    write('info', String(message), context ? { context } : {})
  }
  error(message: unknown, trace?: string, context?: string): void {
    write('error', String(message), { ...(context ? { context } : {}), ...(trace ? { trace } : {}) })
  }
  warn(message: unknown, context?: string): void {
    write('warn', String(message), context ? { context } : {})
  }
  debug(message: unknown, context?: string): void {
    write('debug', String(message), context ? { context } : {})
  }
}
