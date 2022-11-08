import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { appConfiguration } from './configurations/app.config'
import { AuthModule } from './modules/auth/auth.module'

const appModules = [AuthModule]

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [appConfiguration],
      isGlobal: true,
    }),
    ...appModules,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
