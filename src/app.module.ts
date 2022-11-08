import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { appConfiguration } from './configurations/app.config'
import { typeormConfiguration } from './configurations/typeorm.config'
import { AuthModule } from './modules/auth/auth.module'

const appModules = [AuthModule]

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [appConfiguration, typeormConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get<TypeOrmModuleOptions>('orm'),
    }),
    ...appModules,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
