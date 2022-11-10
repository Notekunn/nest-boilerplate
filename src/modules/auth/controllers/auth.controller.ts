import { LocalAuthGuard } from '@guards/local-auth.guard'
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiTags } from '@nestjs/swagger'

import { RegisterByEmailCommand } from '../cqrs/commands/impl/register-by-email.command'
import { LoginByEmailDto } from '../dto/login-by-email.dto'
import { RegisterByEmailDto } from '../dto/register-by-email.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginByEmailDto })
  @Post('login')
  login(@Request() req) {
    console.log(req.user)
  }

  @Post('register')
  async register(@Body() dto: RegisterByEmailDto) {
    const user = await this.commandBus.execute(new RegisterByEmailCommand(dto))
    return user
  }
}
