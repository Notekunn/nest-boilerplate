import { AuthUser } from '@decorators/auth-user.decorator'
import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { JwtClaimsDto } from '@modules/auth/dto/jwt-claims.dto'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { GetUserByIdQuery } from '../cqrs/queries/impl/get-user-by-id.query'

@Controller('user')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('profile')
  getProfile(@AuthUser() user: JwtClaimsDto) {
    return this.queryBus.execute(new GetUserByIdQuery(user.id))
  }
}
