import { LocalAuthGuard } from '@guards/local-auth.guard'
import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateTokenCommand } from '../cqrs/commands/impl/create-token.command'
import { RegisterByEmailCommand } from '../cqrs/commands/impl/register-by-email.command'
import { LoginByEmailDto } from '../dto/login-by-email.dto'
import { LoginResponseDto } from '../dto/login-response.dto'
import { RegisterByEmailDto } from '../dto/register-by-email.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginByEmailDto })
  @ApiResponse({
    type: LoginResponseDto,
    status: 200,
  })
  @HttpCode(200)
  @Post('login')
  async login(@Request() req) {
    const user = req.user
    const token = await this.commandBus.execute(new CreateTokenCommand(user))

    return { user, token }
  }

  @Post('register')
  @ApiResponse({
    type: LoginResponseDto,
    status: 201,
  })
  @HttpCode(201)
  async register(@Body() dto: RegisterByEmailDto) {
    const user = await this.commandBus.execute(new RegisterByEmailCommand(dto))
    const token = await this.commandBus.execute(new CreateTokenCommand(user))

    return { user, token }
  }
}
