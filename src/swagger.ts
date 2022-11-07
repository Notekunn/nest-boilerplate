import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('auth', 'Authenticate user')
    .addTag('user', 'Manage user account')
    .build()
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document, customOptions)
}
