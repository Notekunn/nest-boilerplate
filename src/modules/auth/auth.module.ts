import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { AuthController } from './controllers/auth.controller'
import { LoginByEmailCommandHandler } from './cqrs/commands/handler/login-by-email.handler'
import { LocalStrategy } from './local.strategy'

const CommandHandlers = [LoginByEmailCommandHandler]
@Module({
  providers: [...CommandHandlers, LocalStrategy],
  controllers: [AuthController],
  imports: [CqrsModule],
})
export class AuthModule {}
