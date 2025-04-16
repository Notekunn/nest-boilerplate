import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, type SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'

import type { AppConfiguration } from './configurations/app.config'

export function setupSwagger(app: INestApplication, appConfig: AppConfiguration): void {
  const { version } = appConfig
  const options = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API Documentation')
    .setVersion(version)
    .addBearerAuth()
    .setDescription('API documentation for the NestJS Boilerplate application')
    .addTag('auth', 'Authenticate user')
    .addTag('user', 'Manage user account')
    .build()
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'NestJS Boilerplate API Documentation',
  }
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document, customOptions)
}
