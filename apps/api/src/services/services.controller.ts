import { Controller, Get, Inject } from '@nestjs/common'
import type { ServicesResponse } from '@pulseops/contracts'
import { ServicesRepository } from './services.repository.js'

@Controller('v1/services')
export class ServicesController {
  constructor(@Inject(ServicesRepository) private readonly services: ServicesRepository) {}

  @Get()
  async list(): Promise<ServicesResponse> {
    return { data: await this.services.list() }
  }
}
