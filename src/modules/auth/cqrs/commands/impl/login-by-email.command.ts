import { UserEntity } from '@modules/users/entities/user.entity'
import { Query } from '@nestjs-architects/typed-cqrs'

export class LoginByEmailCommand extends Query<UserEntity> {
  constructor(public readonly email: string, public readonly password: string) {
    super()
  }
}
