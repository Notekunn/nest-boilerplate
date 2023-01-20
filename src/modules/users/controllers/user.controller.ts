import { AuthUser } from '@decorators/auth-user.decorator'
import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { JwtClaimsDto } from '@modules/auth/dto/jwt-claims.dto'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccessGuard, Actions, UseAbility } from 'nest-casl'

import { UpdateUserCommand } from '../cqrs/commands/impl/update-user.command'
import { GetUserByIdQuery } from '../cqrs/queries/impl/get-user-by-id.query'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserEntity } from '../entities/user.entity'

@Controller('user')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get('profile')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, UserEntity)
  @ApiOperation({
    summary: 'Get user profile',
  })
  getProfile(@AuthUser() user: JwtClaimsDto) {
    return this.queryBus.execute(new GetUserByIdQuery(user.id))
  }

  @Post('profile')
  @ApiOperation({
    summary: 'Update user profile',
  })
  updateProfile(@AuthUser() user: JwtClaimsDto, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(user.id, dto))
  }
}
