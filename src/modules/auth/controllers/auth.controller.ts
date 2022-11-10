import { LocalAuthGuard } from '@guards/local-auth.guard'
import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'

import { LoginByEmailDto } from '../dto/login-by-email.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor() {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginByEmailDto })
  @Post('login')
  login(@Request() req) {
    console.log(req.user)
  }
}
