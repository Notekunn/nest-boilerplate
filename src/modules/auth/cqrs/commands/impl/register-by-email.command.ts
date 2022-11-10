import { RegisterByEmailDto } from '@modules/auth/dto/register-by-email.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { Command } from '@nestjs-architects/typed-cqrs'

export class RegisterByEmailCommand extends Command<UserEntity> {
  constructor(public readonly dto: RegisterByEmailDto) {
    super()
  }
}
