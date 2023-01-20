import { UpdateUserDto } from '@modules/users/dto/update-user.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { Command } from '@nestjs-architects/typed-cqrs'
export class UpdateUserCommand extends Command<UserEntity> {
  constructor(public readonly userId: number, public readonly dto: UpdateUserDto) {
    super()
  }
}
