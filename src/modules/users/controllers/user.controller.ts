import { AuthUser } from '@decorators/auth-user.decorator'
import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { JwtClaimsDto } from '@modules/auth/dto/jwt-claims.dto'
import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AccessGuard, Actions, UseAbility } from 'nest-casl'

import { GetUserByIdQuery } from '../cqrs/queries/impl/get-user-by-id.query'
import { UserEntity } from '../entities/user.entity'

@Controller('user')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('profile')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, UserEntity)
  getProfile(@AuthUser() user: JwtClaimsDto) {
    return this.queryBus.execute(new GetUserByIdQuery(user.id))
  }

  @Post('profile')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, UserEntity)
  updateProfile(@AuthUser() user: JwtClaimsDto) {
    return this.queryBus.execute(new GetUserByIdQuery(user.id))
  }
}
