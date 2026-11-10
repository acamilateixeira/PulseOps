import { z } from 'zod'

/** Token de injeção da configuração já validada. */
export const APP_CONFIG = Symbol('APP_CONFIG')

export type AppConfig = {
  databaseUrl: string
  port: number
  corsOrigins: string[]
}

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((value) => /^postgres(ql)?:\/\//.test(value), 'deve ser uma URL postgres://'),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
})

/**
 * Lê e valida o ambiente uma vez, na subida. Configuração inválida derruba o
 * processo com uma mensagem que diz o que falta, sem imprimir valores (a URL do
 * banco tem senha).
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    throw new Error(`Configuração inválida: ${problems.join('; ')}`)
  }
  return {
    databaseUrl: parsed.data.DATABASE_URL,
    port: parsed.data.API_PORT,
    corsOrigins: parsed.data.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }
}
