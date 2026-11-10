/**
 * Contratos HTTP entre a API e o front-end.
 *
 * A API declara as respostas com estes tipos; o front-end valida o que recebe
 * com os mesmos esquemas antes de usar (fronteira de confiança no cliente).
 */
import { z } from 'zod'

export const serviceKindSchema = z.enum(['gateway', 'service', 'dependency'])
export type ServiceKind = z.infer<typeof serviceKindSchema>

export const serviceSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
  name: z.string().min(1).max(80),
  description: z.string().max(280),
  kind: serviceKindSchema,
})
export type Service = z.infer<typeof serviceSchema>

export const servicesResponseSchema = z.object({
  data: z.array(serviceSchema),
})
export type ServicesResponse = z.infer<typeof servicesResponseSchema>

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  checks: z.object({
    database: z.enum(['up', 'down']),
  }),
})
export type HealthResponse = z.infer<typeof healthResponseSchema>

/** Erro padronizado da API. `requestId` liga a resposta ao log do servidor. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
  }),
})
export type ApiError = z.infer<typeof apiErrorSchema>
