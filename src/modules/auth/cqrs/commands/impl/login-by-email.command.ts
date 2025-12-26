import { UserEntity } from '@modules/users/entities/user.entity'
import { Command } from '@nestjs-architects/typed-cqrs'

export class LoginByEmailCommand extends Command<UserEntity> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super()
  }
}
