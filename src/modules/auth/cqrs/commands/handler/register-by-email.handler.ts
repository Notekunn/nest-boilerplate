import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { ConflictException } from '@nestjs/common'
import { CommandHandler, QueryBus } from '@nestjs/cqrs'
import { generateHash } from '@shared/security.utils'
import { Transactional } from 'typeorm-transactional'

import { RegisterByEmailCommand } from '../impl/register-by-email.command'

@CommandHandler(RegisterByEmailCommand)
export class RegisterByEmailCommandHandler {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional()
  async execute(command: RegisterByEmailCommand) {
    const {
      dto: { email, password },
    } = command
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email))

    if (user) {
      throw new ConflictException('error.emailAlreadyExists')
    }

    const newUser = this.userRepository.create({
      email,
      password: generateHash(password),
    })

    return await this.userRepository.save(newUser)
  }
}
