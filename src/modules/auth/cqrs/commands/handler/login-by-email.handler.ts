import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { UtilService } from '@shared/utils.service'

import { LoginByEmailCommand } from '../impl/login-by-email.command'

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailCommandHandler implements ICommandHandler<LoginByEmailCommand> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(_command: LoginByEmailCommand) {
    const { email, password } = _command
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email))
    if (!user) {
      throw new NotFoundException('error.userNotFound')
    }

    const isPasswordMatching = await UtilService.validateHash(password, user.password)

    if (!isPasswordMatching) {
      throw new NotFoundException('error.passwordNotCorrect')
    }

    return user
  }
}
