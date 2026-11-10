import { servicesResponseSchema } from '@pulseops/contracts'
import { useQuery } from '@tanstack/react-query'
import { getJson } from './client'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: ({ signal }) => getJson('/v1/services', servicesResponseSchema, signal),
    select: (response) => response.data,
  })
}
