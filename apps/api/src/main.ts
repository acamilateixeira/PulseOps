import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { loadConfig } from './config.js'
import { configureApp } from './http.js'
import { JsonLogger, logger } from './logger.js'

const config = loadConfig()
const app = await NestFactory.create(AppModule, { logger: new JsonLogger() })
configureApp(app, config)
await app.listen(config.port, '0.0.0.0')
logger.info('api listening', { port: config.port })
