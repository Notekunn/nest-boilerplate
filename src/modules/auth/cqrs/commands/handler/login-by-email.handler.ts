import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { validateHash } from '@shared/security.utils'

import { LoginByEmailCommand } from '../impl/login-by-email.command'

const INVALID_CREDENTIALS_ERROR = 'error.userPasswordNotMatching'

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailCommandHandler implements ICommandHandler<LoginByEmailCommand> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(_command: LoginByEmailCommand) {
    const { email, password } = _command
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email))
    if (!user) {
      throw new BadRequestException(INVALID_CREDENTIALS_ERROR)
    }

    const isPasswordMatching = await validateHash(password, user.password)

    if (!isPasswordMatching) {
      throw new BadRequestException(INVALID_CREDENTIALS_ERROR)
    }

    return user
  }
}
