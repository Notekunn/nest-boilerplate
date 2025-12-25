import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'

import { CreateTokenCommand } from '../impl/create-token.command'

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: CreateTokenCommand) {
    const { user } = command
    const { id, email, role } = user

    const token = this.jwtService.sign({
      id,
      email,
      roles: [role],
    })

    const decoded = this.jwtService.decode(token) as { exp: number }
    const expiresAt = new Date(decoded.exp * 1000)

    return new TokenResponseDto({
      token,
      expiresAt,
    })
  }
}
