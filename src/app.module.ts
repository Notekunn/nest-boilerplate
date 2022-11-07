import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AuthModule } from './modules/auth/auth.module'

const appModules = [AuthModule]

@Module({
  imports: [...appModules],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
