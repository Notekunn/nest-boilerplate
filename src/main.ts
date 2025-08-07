import { fastifyHelmet } from '@fastify/helmet'
import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import morgan from 'morgan'
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional'

import { AppModule } from './app.module'
import { AppConfiguration } from './configurations/app.config'
import { setupSwagger } from './swagger'

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO })
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const logger = new Logger('bootstrap')

  const configService = app.get(ConfigService)
  const appConfig = configService.get<AppConfiguration>('app')
  const { host, port, corsOrigins } = appConfig

  if (process.env.DISABLE_MORGAN !== 'true') {
    app.use(morgan('dev'))
  }

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  })

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app, appConfig)
  }

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : '*',
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
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })

  const reflector = app.get(Reflector)

  // TODO: add global exception filter with json mapping message
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  )

  await app.listen(port, host)

  logger.log(`server running on ${host}:${port}`)
}
bootstrap()
