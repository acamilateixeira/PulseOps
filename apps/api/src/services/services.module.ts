import { Module } from '@nestjs/common'
import { ServicesController } from './services.controller.js'
import { ServicesRepository } from './services.repository.js'

@Module({
  controllers: [ServicesController],
  providers: [ServicesRepository],
})
export class ServicesModule {}
