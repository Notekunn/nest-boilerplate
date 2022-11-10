import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { Command } from '@nestjs-architects/typed-cqrs'

export class CreateTokenCommand extends Command<TokenResponseDto> {
  constructor(public readonly user: UserEntity) {
    super()
  }
}
