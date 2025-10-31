import { UserRepository } from '@modules/users/repositories/user.repository'
import { NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { generateHash } from '@shared/security.utils'

import { UpdateUserCommand } from '../impl/update-user.command'

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: UpdateUserCommand) {
    const { userId, dto } = command
    const existingUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    })

    if (!existingUser) throw new NotFoundException('error.userNotFound')

    if (dto.password) {
      dto.password = generateHash(dto.password)
    }

    const user = this.userRepository.merge(existingUser, dto)
    await this.userRepository.save(user)
    return user
  }
}
