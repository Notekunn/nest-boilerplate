import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { appConfiguration } from './configurations/app.config'
import { jwtConfiguration } from './configurations/jwt.config'
import { typeormConfiguration } from './configurations/typeorm.config'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [ConfigModule.forRoot({ load: [appConfiguration, typeormConfiguration, jwtConfiguration] })],
      providers: [],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should return version when health check', () => {
      expect(appController.healthCheck().version).toMatch(/^v(\d+).(\d+).(\d+)$/g)
    })
  })
})
