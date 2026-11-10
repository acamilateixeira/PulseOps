import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module.js'
import { HealthController } from './health/health.controller.js'
import { ServicesModule } from './services/services.module.js'

@Module({
  imports: [DatabaseModule, ServicesModule],
  controllers: [HealthController],
})
export class AppModule {}
