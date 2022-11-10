import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { LoginByEmailCommand } from '../impl/login-by-email.command'

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailCommandHandler implements ICommandHandler<LoginByEmailCommand> {
  async execute(_command: LoginByEmailCommand) {}
}
