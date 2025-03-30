import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { validateHash } from '@root/shared/security.utils'

import { LoginByEmailCommand } from '../impl/login-by-email.command'

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailCommandHandler implements ICommandHandler<LoginByEmailCommand> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(_command: LoginByEmailCommand) {
    const { email, password } = _command
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email))
    if (!user) {
      throw new BadRequestException('error.userPasswordNotMatching')
    }

    const isPasswordMatching = await validateHash(password, user.password)

    if (!isPasswordMatching) {
      throw new BadRequestException('error.userPasswordNotMatching')
    }

    return user
  }
}
