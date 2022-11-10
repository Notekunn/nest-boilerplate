import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'

import { CreateTokenCommand } from '../impl/create-token.command'

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(private readonly jwtService: JwtService) {}
  async execute(command: CreateTokenCommand) {
    const { user } = command
    const { id, email } = user

    const token = this.jwtService.sign({
      id,
      email,
    })
    const { exp } = this.jwtService.verify(token)

    return new TokenResponseDto({
      token,
      expiresIn: new Date(exp * 1000),
    })
  }
}
