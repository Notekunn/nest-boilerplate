import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccessGuard, Actions, UseAbility } from 'nest-casl'

import { UserHook } from '../casl/user.hook'
import { UpdateUserCommand } from '../cqrs/commands/impl/update-user.command'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserEntity } from '../entities/user.entity'

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
export class UserAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseAbility(Actions.update, UserEntity, UserHook)
  @Put('/:id')
  @ApiOperation({
    summary: 'Update user profile (admin)',
  })
  updateProfile(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, updateDto))
  }
}
