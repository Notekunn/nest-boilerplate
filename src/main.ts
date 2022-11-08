import { fastifyHelmet } from '@fastify/helmet'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import * as morgan from 'morgan'

import { AppModule } from './app.module'
import { AppConfiguration } from './configurations/app.config'
import { setupSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const logger = new Logger('bootstrap')

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  })

  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        scriptSrc: ["'self'", "https: 'unsafe-inline'"],
      },
    },
  })

  app.use(morgan('dev'))

  app.setGlobalPrefix('v1')

  const _reflector = app.get(Reflector)

  // TODO: add global exception filter
  // TODO: add global interceptor
  // TODO: add global pipes

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app)
  }

  const { host, port } = configService.get<AppConfiguration>('app')
  await app.listen(port, host)

  logger.log(`server running on ${host}:${port}`)
}
bootstrap()
