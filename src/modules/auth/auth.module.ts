import { Module } from '@nestjs/common'

import { LoginByEmailCommandHandler } from './cqrs/commands/handler/login-by-email.handler'

const CommandHandlers = [LoginByEmailCommandHandler]
@Module({
  providers: [...CommandHandlers],
})
export class AuthModule {}
