import { fastifyHelmet } from '@fastify/helmet'
import { Logger } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import * as morgan from 'morgan'

import { AppModule } from './app.module'
import { setupSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const logger = new Logger('bootstrap')

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

  const port = 3000
  await app.listen(port, '0.0.0.0')

  logger.log(`server running on port ${port}`)
}
bootstrap()
