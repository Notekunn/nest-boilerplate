import { TypeOrmExModule } from '@modules/typeorm-ex.module'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { AuthController } from './controllers/auth.controller'
import { LoginByEmailCommandHandler } from './cqrs/commands/handler/login-by-email.handler'
import { RegisterByEmailCommandHandler } from './cqrs/commands/handler/register-by-email.handler'
import { LocalStrategy } from './local.strategy'

const CommandHandlers = [LoginByEmailCommandHandler, RegisterByEmailCommandHandler]
@Module({
  providers: [...CommandHandlers, LocalStrategy],
  controllers: [AuthController],
  imports: [CqrsModule, TypeOrmExModule.forCustomRepository([UserRepository])],
})
export class AuthModule {}
