import { UserRepository } from '@modules/users/repositories/user.repository'
import { NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { generateHash } from '@root/shared/security.utils'

import { UpdateUserCommand } from '../impl/update-user.command'

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: UpdateUserCommand) {
    const { userId, dto } = command
    const _user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    })

    if (!_user) throw new NotFoundException('error.userNotFound')

    if (dto.password) {
      dto.password = generateHash(dto.password)
    }

    const user = this.userRepository.merge(_user, dto)
    await this.userRepository.save(user)
    return user
  }
}
