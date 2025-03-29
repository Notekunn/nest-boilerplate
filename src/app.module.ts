import { UserModule } from '@modules/users/user.module'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { AuthorizableUser, CaslModule } from 'nest-casl'

import { AppController } from './app.controller'
import { Roles } from './common/enum/role.enum'
import { appConfiguration } from './configurations/app.config'
import { jwtConfiguration } from './configurations/jwt.config'
import { typeormConfiguration } from './configurations/typeorm.config'
import { AuthModule } from './modules/auth/auth.module'

const appModules = [AuthModule, UserModule]

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [appConfiguration, typeormConfiguration, jwtConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get<TypeOrmModuleOptions>('orm'),
    }),
    CaslModule.forRoot<Roles, AuthorizableUser<Roles, number>>({
      superuserRole: Roles.Admin,
      getUserFromRequest(request) {
        return request.user
      },
    }),
    ...appModules,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
