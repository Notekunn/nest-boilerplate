import { TypeOrmExModule } from '@modules/typeorm-ex.module'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './controllers/auth.controller'
import { CreateTokenCommandHandler } from './cqrs/commands/handler/create-token.handler'
import { LoginByEmailCommandHandler } from './cqrs/commands/handler/login-by-email.handler'
import { RegisterByEmailCommandHandler } from './cqrs/commands/handler/register-by-email.handler'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

const CommandHandlers = [LoginByEmailCommandHandler, RegisterByEmailCommandHandler, CreateTokenCommandHandler]
@Module({
  providers: [...CommandHandlers, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('jwt'),
    }),
    CqrsModule,
    TypeOrmExModule.forCustomRepository([UserRepository]),
  ],
})
export class AuthModule {}
